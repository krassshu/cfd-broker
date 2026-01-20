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
                className={`peer w-full border-b-2 bg-transparent p-3 pt-4 outline-none transition-colors duration-300
          ${isError ? 'border-b-red-200' : 'border-b-gray-300'} focus:border-transparent`}
            />
            <label className={`absolute left-3 top-3 transition-all duration-300 pointer-events-none
        peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs 
        peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
        ${isError ? 'text-red-500' : 'text-gray-400 peer-focus:text-blue-600'}`}>
                {label}
            </label>
            <div className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100 
        ${isError ? 'bg-red-500' : 'bg-blue-600'}`}
            />
            {error && <p className="text-[10px] text-red-500 absolute mt-1">{error}</p>}
        </div>
    );
}