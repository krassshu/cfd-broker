import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your CryptoBroker account",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
