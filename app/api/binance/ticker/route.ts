'use server'

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');

        if (!res.ok) {
            throw new Error(`Binance API error: ${res.statusText}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}