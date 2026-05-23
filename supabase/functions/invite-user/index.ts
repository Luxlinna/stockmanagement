import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { email, full_name, role, phone, password } = await req.json();

    if (!email || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, full_name, role' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await adminClient.auth.getUser(jwt);

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: caller } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!caller || caller.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    // Create user with admin API
    const generatedPassword = password || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createErr) {
      return new Response(
        JSON.stringify({ error: createErr.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!newUser?.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create profile
    await adminClient.from('profiles').upsert({
      id: newUser.user.id,
      email,
      full_name,
      role,
      phone: phone || null,
    });

    // Create notification settings
    await adminClient.from('notification_settings').upsert({
      user_id: newUser.user.id,
      email_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      browser_push_enabled: true,
      category_thresholds: { Electronics: 5, Furniture: 3, Lighting: 4, 'Smart Home': 5, Accessories: 10 },
    }, { onConflict: 'user_id' });

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        message: 'User created successfully. They can sign in with their email and the provided password.',
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
