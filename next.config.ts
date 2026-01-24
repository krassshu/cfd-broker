import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        globalNotFound: true,
    },
    images:{
        remotePatterns: [
            new URL('https://bin.bnbstatic.com/static/assets/logos/**.png'),
        ],
    }
}

export default nextConfig;
