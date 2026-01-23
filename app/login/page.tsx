import { login } from '../auth/actions'
import Link from "next/link";

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = await props.searchParams;
    const isError = !!searchParams.error;

    return (

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white px-10 py-7 shadow-xl border border-slate-200 text-black">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-black">Crypto<span
                        className="text-primary">Broker</span></h1>
                </div>

                <form action={login} className="mt-8 space-y-10">
                    <div className="space-y-8">
                        <div className="relative group">
                            <input
                                name="email"
                                type="email"
                                placeholder=" "
                                className={`peer w-full border-b-2 bg-transparent p-3 pt-4 outline-none transition-colors duration-300
                                    ${isError ? 'border-b-red-200' : 'border-b-gray-300'} 
                                    focus:border-transparent`}
                            />
                            <label
                                className={`absolute left-3 top-3 transition-all duration-300 pointer-events-none
                                    peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs 
                                    peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                    ${isError ? 'text-red-500' : 'text-gray-400 peer-focus:text-blue-600'}`}
                            >
                                Email
                            </label>

                            <div
                                className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                    ${isError ? 'bg-red-500' : 'bg-blue-600'}`}
                            />
                        </div>

                        <div className="relative group">
                            <input
                                name="password"
                                type="password"
                                placeholder=" "
                                className={`peer w-full border-b-2 bg-transparent p-3 pt-4 outline-none transition-colors duration-300
                                    ${isError ? 'border-b-red-200' : 'border-b-gray-300'} 
                                    focus:border-transparent`}
                            />
                            <label
                                className={`absolute left-3 top-3 transition-all duration-300 pointer-events-none
                                    peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs 
                                    peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                    ${isError ? 'text-red-500' : 'text-gray-400 peer-focus:text-blue-600'}`}
                            >
                                Password
                            </label>
                            <div
                                className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                    ${isError ? 'bg-red-500' : 'bg-blue-600'}`}
                            />
                        </div>
                    </div>

                    {searchParams.error && (
                        <p className="text-sm text-red-500 text-center font-medium animate-pulse">
                            {searchParams.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 p-4 font-bold text-white shadow-lg cursor-pointer hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    {"Don't have an account?"} <Link href="/register" className="text-blue-500 font-semibold hover:underline">Register</Link>
                </p>
            </div>

    )
}