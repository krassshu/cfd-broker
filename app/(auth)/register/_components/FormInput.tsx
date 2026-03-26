interface FormInputProps {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
    isError?: boolean;
}

export function FormInput({ label, name, type, value, onChange, error, isError }: FormInputProps) {
    return (
        <div className="relative group w-full">
            <input
                name={name}
                type={type}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                className={`peer w-full border-b-2 bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300
                    ${isError ? 'border-b-red-400/50' : 'border-b-border'} focus:border-transparent`}
            />
            <label className={`absolute left-3 top-4 text-sm transition-all duration-300 pointer-events-none
                peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs
                peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                ${isError
                    ? 'text-red-400'
                    : 'text-muted/70 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-muted'}`}>
                {label}
            </label>
            <div className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                ${isError ? 'bg-red-400' : 'bg-primary'}`}
            />
            {error && <p className="text-[10px] text-red-400 absolute mt-1">{error}</p>}
        </div>
    );
}
