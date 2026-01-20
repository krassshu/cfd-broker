'use server'

import {createClient} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import { headers } from 'next/headers'

// Login auth function

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const {error} = await supabase.auth.signInWithPassword(data);

    if (error) {
        return redirect('/login?error=' + error.message)
    }
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

// Singup auth function

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const headerList = await headers()
    const origin = headerList.get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

// Logout auth function

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

// Checking is new user email is unique

export async function isEmailUnique(email: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()

    return !data
}