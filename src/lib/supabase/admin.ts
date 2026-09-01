import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env/public";
import { getRequiredServiceRoleKey } from "@/lib/env/server";

export function createAdminClient() {
  const env = getPublicEnv();
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    getRequiredServiceRoleKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
