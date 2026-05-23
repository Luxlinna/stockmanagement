import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_emailed: boolean;
  is_sms_sent: boolean;
  _sms_only?: boolean;
  _email_only?: boolean;
}

async function sendEmail(payload: NotificationPayload, resendKey?: string, toEmail?: string): Promise<boolean> {
  if (!resendKey || !toEmail) return false;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'alerts@warehouse.app',
        to: toEmail,
        subject: `[${payload.type.toUpperCase()}] ${payload.title}`,
        html: `<p><strong>${payload.title}</strong></p><p>${payload.message}</p>`,
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function sendSMS(payload: NotificationPayload, twilioSid?: string, twilioToken?: string, twilioPhone?: string, toPhone?: string): Promise<boolean> {
  if (!twilioSid || !twilioToken || !twilioPhone || !toPhone) return false;
  try {
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          From: twilioPhone,
          To: toPhone,
          Body: `[${payload.type.toUpperCase()}] ${payload.title}: ${payload.message.slice(0, 140)}`,
        }),
      }
    );
    return resp.ok;
  } catch {
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
    const body = await req.json() as NotificationPayload | NotificationPayload[];
    const payloads = Array.isArray(body) ? body : [body];

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Fetch user emails AND phone numbers for all user_ids
    const userIds = [...new Set(payloads.map((p) => p.user_id).filter(Boolean))];
    const userEmails: Record<string, string> = {};
    const userPhones: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, email, phone')
        .in('id', userIds);
      if (profiles) {
        for (const p of profiles) {
          if (p.email) userEmails[p.id] = p.email;
          if (p.phone) userPhones[p.id] = p.phone;
        }
      }
    }

    const results = [];

    for (const payload of payloads) {
      const smsOnly = payload._sms_only === true;
      const emailOnly = payload._email_only === true;

      const toEmail = payload.user_id ? (userEmails[payload.user_id] || null) : 'admin@warehouse.app';
      const toPhone = payload.user_id ? (userPhones[payload.user_id] || null) : null;

      let emailOk = payload.is_emailed;
      let smsOk = payload.is_sms_sent;

      if (!smsOnly && !payload.is_emailed && toEmail) {
        emailOk = await sendEmail(payload, resendKey, toEmail);
      }
      if (!emailOnly && !payload.is_sms_sent && toPhone) {
        smsOk = await sendSMS(payload, twilioSid, twilioToken, twilioPhone, toPhone);
      }

      // Update DB
      await adminClient
        .from('notifications')
        .update({ is_emailed: emailOk, is_sms_sent: smsOk })
        .eq('id', payload.id);

      results.push({ id: payload.id, email_sent: emailOk, sms_sent: smsOk });
    }

    const isBatch = Array.isArray(body);
    return new Response(
      JSON.stringify(isBatch ? { results } : results[0]),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
