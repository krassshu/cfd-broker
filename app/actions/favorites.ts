'use server'

import { createClient } from '@/lib/supabase/server';

/** Persists a symbol to the user's favorites list */
export async function addFavoriteAction(symbol: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from('favorites').insert({ user_id: user.id, symbol });
    if (error) {
        console.error('addFavorite error:', error.message);
        return { success: false, message: "Failed to add favorite" };
    }
    return { success: true, message: "Favorite added" };
}

/** Removes a symbol from the user's favorites list */
export async function removeFavoriteAction(symbol: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('symbol', symbol);
    if (error) {
        console.error('removeFavorite error:', error.message);
        return { success: false, message: "Failed to remove favorite" };
    }
    return { success: true, message: "Favorite removed" };
}
