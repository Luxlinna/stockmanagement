// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateVapidJWT(
  privateKeyB64: string,
  publicKeyB64: string,
  audience: string
): Promise<string> {
  const pubBytes = base64UrlToUint8Array(publicKeyB64);
  const xBytes = pubBytes.slice(1, 33);
  const yBytes = pubBytes.slice(33, 65);

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: privateKeyB64,
    x: uint8ArrayToBase64Url(xBytes),
    y: uint8ArrayToBase64Url(yBytes),
  };

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: 'mailto:admin@stockmanagement.io',
    iat: now,
  };

  const enc = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const toSign = `${enc(header)}.${enc(payload)}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(toSign)
  );

  const sigBytes = new Uint8Array(signature);
  let pos = 0;
  if (sigBytes[pos++] !== 0x30) throw new Error('Invalid DER signature');
  const totalLen = sigBytes[pos++];
  if (sigBytes[pos++] !== 0x02) throw new Error('Invalid DER r tag');
  const rLen = sigBytes[pos++];
  const r = sigBytes.slice(pos, pos + rLen);
  pos += rLen;
  if (sigBytes[pos++] !== 0x02) throw new Error('Invalid DER s tag');
  const sLen = sigBytes[pos++];
  const s = sigBytes.slice(pos, pos + sLen);

  const pad = (arr: Uint8Array, len: number) => {
    if (arr.length > len) return arr.slice(arr.length - len);
    const res = new Uint8Array(len);
    res.set(arr, len - arr.length);
    return res;
  };

  const rawSig = new Uint8Array(64);
  rawSig.set(pad(r, 32), 0);
  rawSig.set(pad(s, 32), 32);

  const sigB64 = uint8ArrayToBase64Url(rawSig);
  return `${toSign}.${sigB64}`;
}

async function sendPushToSubscription(
  subscription: PushSubscription,
  payload: Record<string, unknown>,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const audience = new URL(subscription.endpoint).origin;
  const vapidJWT = await generateVapidJWT(vapidPrivateKey, vapidPublicKey, audience);

  const body = JSON.stringify(payload);

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `vapid t=${vapidJWT}, k=${vapidPublicKey}`,
      'TTL': '3600',
    },
    body,
  });
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    let vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey) {
      const { data } = await adminClient.from('app_config').select('value').eq('key', 'vapid_public_key').maybeSingle();
      if (data) vapidPublicKey = data.value;
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured. Run generate-vapid-keys first.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.notification) {
      return new Response(JSON.stringify({ error: 'Missing notification payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const notification = body.notification as Record<string, unknown>;

    const { data: subs, error: subsErr } = await adminClient.from('push_subscriptions').select('*');
    if (subsErr || !subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No push subscriptions found' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const pushPayload = {
      title: notification.title || 'StockManagement Alert',
      body: notification.message || 'You have a new notification',
      tag: notification.id || 'stockmanagement-alert',
      icon: '/favicon.ico',
      url: '/notifications/history',
      requireInteraction: notification.type === 'out_of_stock',
    };

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subs) {
      try {
        const subscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        const resp = await sendPushToSubscription(subscription, pushPayload, vapidPublicKey, vapidPrivateKey);
        if (resp.ok) {
          sent++;
        } else {
          const { status } = resp;
          if (status === 410 || status === 404 || status === 400) {
            expiredEndpoints.push(sub.endpoint);
          }
          failed++;
          console.log(`Push failed for ${sub.endpoint}: ${status} ${await resp.text().catch(() => '')}`);
        }
      } catch (err) {
        failed++;
        console.error(`Push error for ${sub.endpoint}:`, (err as Error).message);
      }
    }

    if (expiredEndpoints.length > 0) {
      await adminClient.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    }

    return new Response(JSON.stringify({ sent, failed, expired: expiredEndpoints.length }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});