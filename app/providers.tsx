"use client"

import {ReactNode, useState} from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TICKER_STALE_TIME_MS } from "@/lib/config";

export default function Providers({children}: {children: ReactNode}) {
    const [queryClient] = useState(()=>new QueryClient({
        defaultOptions:{
            queries:{
                staleTime: TICKER_STALE_TIME_MS,
            }
        }
    }))
    return(
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}