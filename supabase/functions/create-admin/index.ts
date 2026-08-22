import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  // Client scoped to the caller's own JWT — used only to verify who is
  // calling and that they're already an admin (RLS still applies here).
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData?.user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }

  const { data: callerProfile, error: callerProfileError } = await callerClient
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (callerProfileError || !callerProfile?.is_admin) {
    return jsonResponse({ error: "Caller is not an admin" }, 403);
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = (body.email || "").trim();
  const password = body.password || "";

  if (!email || !password) {
    return jsonResponse({ error: "Email and password are required" }, 400);
  }

  // Elevated client — only ever used server-side, never exposed to the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError || !created?.user) {
    return jsonResponse({ error: createError?.message || "Could not create user" }, 400);
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({ id: created.user.id, is_admin: true, must_change_password: true });

  if (profileError) {
    return jsonResponse({ error: `Account created, but granting admin access failed: ${profileError.message}` }, 500);
  }

  return jsonResponse({ success: true, id: created.user.id });
});
