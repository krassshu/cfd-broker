import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

interface SearchProps {
    value: string;
    onChange: (val: string) => void;
}

export default function SymbolsSearch({ value, onChange }: SearchProps) {
    return (
        <div className="my-2 mx-2">
            <div className="flex items-center justify-center rounded-md bg-border pl-3 outline-1 -outline-offset-1 outline-border has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-500">
                <div className="flex items-center shrink-0 select-none w-4 h-4 text-slate-400">
                    <MagnifyingGlassIcon />
                </div>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="text"
                    placeholder="Search Markets..."
                    className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-xs text-foreground placeholder:text-slate-500 focus:outline-none"
                />
            </div>
        </div>
    );
}