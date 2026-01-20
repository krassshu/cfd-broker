import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Login page",
}

export default function Layout({children,}: Readonly<{children: React.ReactNode;}>){
    return (
        <main className={'flex flex-col items-center justify-center h-screen'}>
            {children}
        </main>
    )
}