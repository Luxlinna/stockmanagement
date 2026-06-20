// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationRow {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_emailed: boolean;
  is_sms_sent: boolean;
  is_webhook_sent: boolean;
  webhook_attempts: number;
  created_at: string;
}

interface SettingsRow {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  browser_push_enabled: boolean;
}

async function dispatchBatch(
  notifications: NotificationRow[],
  settingsMap: Map<string, SettingsRow>,
  supabaseUrl: string,
  serviceKey: string
) {
  const adminClient = createClient(supabaseUrl, serviceKey);

  const emailQueue: NotificationRow[] = [];
  const smsQueue: NotificationRow[] = [];
  const pushQueue: NotificationRow[] = [];

  for (const n of notifications) {
    const settings = n.user_id ? settingsMap.get(n.user_id) : null;
    const emailOk = !settings || settings.email_enabled;
    const smsOk = !settings || settings.sms_enabled;
    const pushOk = !settings || settings.browser_push_enabled;

    if (!n.is_emailed && emailOk) emailQueue.push(n);
    if (!n.is_sms_sent && smsOk) smsQueue.push(n);
    if (pushOk && (n.type === 'out_of_stock' || n.type === 'low_stock')) {
      pushQueue.push(n);
    }
  }

  const dispatchedIds: string[] = [];
  const failedIds: string[] = [];

  for (let i = 0; i < emailQueue.length; i++) {
    const n = emailQueue[i];
    try {
      const resp = await fetch(
        `${supabaseUrl}/functions/v1/dispatch-alerts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n),
        }
      );
      if (resp.ok) {
        dispatchedIds.push(n.id);
      } else {
        const body = await resp.text().catch(() => '');
        if (body.includes('rate limit') || resp.status === 429) {
          console.log(`Rate limited on notification ${n.id}`);
        } else {
          failedIds.push(n.id);
        }
      }
    } catch (err) {
      console.error(`Failed to dispatch email for ${n.id}:`, (err as Error).message);
    }
    if (i < emailQueue.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  for (const n of smsQueue) {
    try {
      const resp = await fetch(
        `${supabaseUrl}/functions/v1/dispatch-alerts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...n, _sms_only: true }),
        }
      );
      if (!resp.ok) {
        console.log(`SMS dispatch failed for ${n.id}:`, await resp.text().catch(() => ''));
      }
    } catch (err) {
      console.error(`Failed to dispatch SMS for ${n.id}:`, (err as Error).message);
    }
  }

  if (dispatchedIds.length > 0) {
    await adminClient
      .from('notifications')
      .update({ is_emailed: true })
      .in('id', dispatchedIds);
  }

  // Browser push dispatch for critical alerts
  if (pushQueue.length > 0) {
    for (const n of pushQueue.slice(0, 10)) {
      try {
        await fetch(
          `${supabaseUrl}/functions/v1/send-browser-push`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notification: n }),
          }
        );
      } catch (err) {
        console.error(`Failed to dispatch push for ${n.id}:`, (err as Error).message);
      }
    }
  }

  const webhookQueue = notifications.filter(
    (n) => !n.is_webhook_sent && (n.webhook_attempts || 0) < 5
  );

  for (let i = 0; i < webhookQueue.length; i++) {
    const n = webhookQueue[i];
    try {
      const resp = await fetch(
        `${supabaseUrl}/functions/v1/webhook-dispatch`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notification: n }),
        }
      );
      if (!resp.ok) {
        console.log(`Webhook dispatch failed for ${n.id}:`, await resp.text().catch(() => ''));
      }
    } catch (err) {
      console.error(`Failed to dispatch webhook for ${n.id}:`, (err as Error).message);
    }
    if (webhookQueue.length > 10 && i < webhookQueue.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return { dispatched: dispatchedIds.length, failed: failedIds.length, webhooks: webhookQueue.length, pushes: pushQueue.length };
}

Deno.cron('Dispatch notifications every 5 minutes', '*/5 * * * *', async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: emailNotifications, error: nErr } = await adminClient
    .from('notifications')
    .select('*')
    .eq('is_emailed', false)
    .order('created_at', { ascending: true })
    .limit(50);

  if (nErr || !emailNotifications || emailNotifications.length === 0) {
    console.log('No pending email notifications to dispatch');
  }

  const userIds = [...new Set((emailNotifications || []).map((n) => n.user_id).filter(Boolean))];
  let settingsMap = new Map<string, SettingsRow>();

  if (userIds.length > 0) {
    const { data: settings } = await adminClient
      .from('notification_settings')
      .select('user_id, email_enabled, sms_enabled, browser_push_enabled')
      .in('user_id', userIds);

    if (settings) {
      settingsMap = new Map(settings.map((s) => [s.user_id, s]));
    }
  }

  const allNotifs = emailNotifications || [];
  const seenIds = new Set(allNotifs.map((n) => n.id));

  const { data: webhookOnly } = await adminClient
    .from('notifications')
    .select('*')
    .eq('is_webhook_sent', false)
    .lte('webhook_attempts', 4)
    .order('created_at', { ascending: true })
    .limit(30);

  const combined = [...allNotifs];
  for (const n of webhookOnly || []) {
    if (!seenIds.has(n.id)) combined.push(n);
  }

  const result = await dispatchBatch(combined, settingsMap, supabaseUrl, serviceKey);
  console.log(`Dispatched ${result.dispatched} emails, ${result.failed} failed, ${result.webhooks} webhooks, ${result.pushes} pushes`);
});

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: emailNotifications } = await adminClient
      .from('notifications')
      .select('*')
      .eq('is_emailed', false)
      .order('created_at', { ascending: true })
      .limit(50);

    const allNotifs = emailNotifications || [];
    const seenIds = new Set(allNotifs.map((n) => n.id));

    const { data: webhookOnly } = await adminClient
      .from('notifications')
      .select('*')
      .eq('is_webhook_sent', false)
      .lte('webhook_attempts', 4)
      .order('created_at', { ascending: true })
      .limit(30);

    const combined = [...allNotifs];
    for (const n of webhookOnly || []) {
      if (!seenIds.has(n.id)) combined.push(n);
    }

    if (combined.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const userIds = [...new Set(combined.map((n) => n.user_id).filter(Boolean))];
    let settingsMap = new Map<string, SettingsRow>();

    if (userIds.length > 0) {
      const { data: settings } = await adminClient
        .from('notification_settings')
        .select('user_id, email_enabled, sms_enabled, browser_push_enabled')
        .in('user_id', userIds);

      if (settings) {
        settingsMap = new Map(settings.map((s) => [s.user_id, s]));
      }
    }

    const result = await dispatchBatch(combined, settingsMap, supabaseUrl, serviceKey);

    return new Response(
      JSON.stringify({ ...result, total: combined.length, message: 'Manual dispatch completed' }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
