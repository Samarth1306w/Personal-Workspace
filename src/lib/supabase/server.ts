import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

let cachedPublicClient: SupabaseClient | null = null;

/**
 * Public Supabase client for reading publicly accessible CMS tables.
 * Does NOT call cookies(), allowing Next.js pages and Route Handlers
 * to participate in ISR (Incremental Static Regeneration) and Edge caching.
 */
export function createPublicClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (cachedPublicClient) {
    return cachedPublicClient;
  }

  cachedPublicClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedPublicClient;
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createSupabaseServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored if called from a Server Component where response cookies cannot be set directly.
          }
        },
      },
    });
  } catch {
    // Outside of request scope (e.g. CLI script or static build)
    return createSupabaseServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  }
}

export const createServerClient = createClient;

