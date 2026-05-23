import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookConfig {
  id: string;
  provider: 'slack' | 'discord' | 'telegram' | 'custom';
  webhook_url: string;
  secret_token: string | null;
  notify_on_types: string[];
}

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

async function sendSlackWebhook(url: string, payload: NotificationPayload, secret?: string): Promise<boolean> {
  try {
    const body = {
      text: `*${payload.title}*\n${payload.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: payload.title, emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: payload.message },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Type: \`${payload.type}\` · ID: \`${payload.id}\`` },
          ],
        },
      ],
    };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) headers['Authorization'] = `Bearer ${secret}`;
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    return resp.ok;
  } catch {
    return false;
  }
}

async function sendDiscordWebhook(url: string, payload: NotificationPayload): Promise<boolean> {
  try {
    const body = {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color: payload.type === 'out_of_stock' ? 0xe74c3c : payload.type === 'low_stock' ? 0xf39c12 : 0x3498db,
          timestamp: new Date().toISOString(),
          footer: { text: `StockManagement · ${payload.type}` },
        },
      ],
    };
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function sendTelegramWebhook(url: string, payload: NotificationPayload, secret?: string): Promise<boolean> {
  try {
    const text = `*${payload.title}*\n\n${payload.message}\n\n_Type: ${payload.type}_`;
    const body = {
      chat_id: secret || '@stockmanagement_alerts',
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    };
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function sendCustomWebhook(url: string, payload: NotificationPayload, secret?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) headers['X-Webhook-Secret'] = secret;
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'stockmanagement.notification',
        notification: payload,
        timestamp: new Date().toISOString(),
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function dispatchWebhook(config: WebhookConfig, payload: NotificationPayload): Promise<boolean> {
  if (config.notify_on_types && config.notify_on_types.length > 0) {
    if (!config.notify_on_types.includes(payload.type)) return false;
  }

  switch (config.provider) {
    case 'slack':
      return sendSlackWebhook(config.webhook_url, payload, config.secret_token || undefined);
    case 'discord':
      return sendDiscordWebhook(config.webhook_url, payload);
    case 'telegram':
      return sendTelegramWebhook(config.webhook_url, payload, config.secret_token || undefined);
    case 'custom':
      return sendCustomWebhook(config.webhook_url, payload, config.secret_token || undefined);
    default:
      return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json() as { notification: NotificationPayload; config_ids?: string[] } | NotificationPayload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const isSingle = 'notification' in body;
    const notification = isSingle ? (body as { notification: NotificationPayload }).notification : (body as NotificationPayload);
    const configIds = isSingle ? (body as { notification: NotificationPayload; config_ids?: string[] }).config_ids : undefined;

    let query = adminClient.from('webhook_configs').select('*').eq('is_active', true);
    if (configIds && configIds.length > 0) {
      query = query.in('id', configIds);
    }
    const { data: configs, error: cErr } = await query;

    if (cErr || !configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ dispatched: 0, skipped: 0, message: 'No active webhook configs found' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const results: { config_id: string; provider: string; success: boolean }[] = [];
    let successCount = 0;

    for (const config of configs) {
      const success = await dispatchWebhook(config as WebhookConfig, notification);
      results.push({
        config_id: config.id,
        provider: config.provider,
        success,
      });
      if (success) successCount++;
    }

    // Always increment webhook_attempts so failed webhooks don't get retried forever
    const { data: notif } = await adminClient
      .from('notifications')
      .select('webhook_attempts')
      .eq('id', notification.id)
      .maybeSingle();

    const newAttempts = (notif?.webhook_attempts || 0) + 1;

    // Only mark as sent if at least one succeeded
    await adminClient
      .from('notifications')
      .update({
        is_webhook_sent: successCount > 0,
        webhook_attempts: newAttempts,
      })
      .eq('id', notification.id);

    return new Response(
      JSON.stringify({ dispatched: successCount, total: configs.length, results }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});