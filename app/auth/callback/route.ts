import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** Allowed redirect targets after auth callback — prevents open redirect attacks */
const SAFE_REDIRECTS = ['/market', '/login', '/market/account', '/reset-password'];

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/login?message=Account created successfully'

    // Validate redirect target — only allow known internal paths
    const safeNext = SAFE_REDIRECTS.some(path => next === path || next.startsWith(`${path}?`))
        ? next
        : '/login?message=Account created successfully';

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${safeNext}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Could not verify email`)
}