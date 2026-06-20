// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
    // Verify admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: { user }, error: userErr } = await adminClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    // Generate ECDSA P-256 keypair using Web Crypto
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    // Export public key as raw uncompressed point (65 bytes: 0x04 + x + y)
    const publicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    const publicKeyB64 = base64UrlEncode(publicKeyRaw);

    // Export private key as JWK to get the scalar d
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const privateKeyB64 = privateKeyJwk.d!;

    // Store public key in app_config so frontend can fetch it
    await adminClient.from('app_config').upsert({
      key: 'vapid_public_key',
      value: publicKeyB64,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

    return new Response(JSON.stringify({
      publicKey: publicKeyB64,
      privateKey: privateKeyB64,
      message: 'Store the privateKey in your Supabase Edge Function secrets as VAPID_PRIVATE_KEY',
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
