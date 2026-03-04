import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach((cookie: any) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            });
          } catch {
            // Server Components에서는 setAll이 막히는 경우가 있어서 무시
          }
        },
      },
    }
  );
}
