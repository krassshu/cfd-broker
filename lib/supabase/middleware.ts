import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            maxAge: options?.maxAge ?? 12 * 60 * 60,
                        })
                    })
                },
            },
        }
    )

    const getUserWithTimeout = async () => {
        try {
            const result = await Promise.race([
                supabase.auth.getUser(),
                new Promise<{ data: { user: null }; error: null }>((resolve) =>
                    setTimeout(() => resolve({ data: { user: null }, error: null }), 5000)
                ),
            ]);
            return result;
        } catch {
            return { data: { user: null }, error: null };
        }
    };

    const {
        data: { user },
    } = await getUserWithTimeout()

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register') ||
        request.nextUrl.pathname.startsWith('/forgot-password')
    const isResetPassword = request.nextUrl.pathname.startsWith('/reset-password')
    const isDashboardPage = request.nextUrl.pathname.startsWith('/market')

    if (!user && isDashboardPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && isAuthPage && !isResetPassword) {
        const url = request.nextUrl.clone()
        url.pathname = '/market'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}