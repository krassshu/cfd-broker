import { login } from '@/app/auth/actions'
import Link from "next/link";
import { Globe } from "lucide-react";

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const searchParams = await props.searchParams;
    const isError = !!searchParams.error;

    return (
        <div className="w-full max-w-md space-y-7 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-10 py-8 shadow-2xl">
            <div className="text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
                    <Globe className="w-7 h-7 text-primary" />
                    <span>Crypto<span className="text-primary">Broker</span></span>
                </Link>
            </div>

            <form action={login} className="space-y-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <input
                            name="email"
                            type="email"
                            placeholder=" "
                            className={`peer w-full border-b-2 bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300
                                ${isError ? 'border-b-red-400/50' : 'border-b-border'}
                                focus:border-transparent`}
                        />
                        <label
                            className={`absolute left-3 top-4 text-sm transition-all duration-300 pointer-events-none
                                peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs
                                peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                ${isError
                                    ? 'text-red-400'
                                    : 'text-muted/70 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-muted'}`}
                        >
                            Email
                        </label>
                        <div
                            className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                ${isError ? 'bg-red-400' : 'bg-primary'}`}
                        />
                    </div>

                    <div className="relative group">
                        <input
                            name="password"
                            type="password"
                            placeholder=" "
                            className={`peer w-full border-b-2 bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300
                                ${isError ? 'border-b-red-400/50' : 'border-b-border'}
                                focus:border-transparent`}
                        />
                        <label
                            className={`absolute left-3 top-4 text-sm transition-all duration-300 pointer-events-none
                                peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs
                                peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                ${isError
                                    ? 'text-red-400'
                                    : 'text-muted/70 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-muted'}`}
                        >
                            Password
                        </label>
                        <div
                            className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                ${isError ? 'bg-red-400' : 'bg-primary'}`}
                        />
                    </div>
                </div>

                <div className="flex justify-end -mt-2">
                    <Link href="/forgot-password" className="text-xs text-muted hover:text-primary transition-colors">
                        Forgot password?
                    </Link>
                </div>

                {searchParams.error && (
                    <p className="text-sm text-red-400 text-center font-medium animate-pulse">
                        {searchParams.error}
                    </p>
                )}

                {searchParams.message && (
                    <p className="text-sm text-emerald-500 text-center font-medium">
                        {searchParams.message}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-primary p-4 font-bold text-primary-foreground shadow-lg cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                    Login
                </button>
            </form>

            <p className="text-center text-sm text-muted">
                {"Don't have an account? "}
                <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Register
                </Link>
            </p>
        </div>
    )
}
