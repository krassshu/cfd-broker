import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        globalNotFound: true,
    },
    images:{
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'bin.bnbstatic.com',
                pathname: '/static/assets/logos/**',
            },
            {
                protocol: 'https',
                hostname: 'static.binance.com',
                pathname: '/sm/static/img/coins/**',
            }
        ],
    }
}

export default nextConfig;
