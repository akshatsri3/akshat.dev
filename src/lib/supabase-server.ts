import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabase-server can only be used on the server side.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Strictly require the secret service_role key for administrative server operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Checks if Supabase server environment variables are properly configured.
 */
export function isServerSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseServiceRoleKey) return false;
  if (
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("example.com") ||
    supabaseServiceRoleKey.includes("your-") ||
    supabaseServiceRoleKey.length < 20
  ) {
    return false;
  }
  return true;
}

/**
 * Creates or returns the privileged server-only Supabase admin client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security exclusively
 * after server-side admin authentication has succeeded.
 * NEVER exposed to client-side code or browser bundles.
 */
export function getServerSupabaseAdmin() {
  if (!isServerSupabaseConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for server administrative operations. " +
      "Ensure this secret key is set in your server environment (.env)."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Alias for getServerSupabaseAdmin
 */
export const getServerSupabase = getServerSupabaseAdmin;

/**
 * Validates the admin passcode sent in server request headers or cookies.
 */
export function verifyAdminPasscode(passcode: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD || "Akshat321!";
  return Boolean(passcode && passcode.trim() === expected.trim());
}
