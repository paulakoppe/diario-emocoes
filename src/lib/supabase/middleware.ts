import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Detecta se as env vars são reais (não placeholders do .env.local.example)
  const hasSupabase =
    !!url &&
    !!key &&
    url.startsWith("https://") &&
    url.includes(".supabase.") &&
    !url.includes("xxxxxxxxxxxx") &&
    !key.startsWith("eyJhbGciOi...");

  // Sem Supabase configurado: libera só o /preview, redireciona o resto.
  if (!hasSupabase) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/preview")) return NextResponse.next({ request });
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/preview";
    return NextResponse.redirect(redirect);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/login" || pathname.startsWith("/auth");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/diario";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
