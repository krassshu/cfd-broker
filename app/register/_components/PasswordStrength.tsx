export function PasswordStrength({ password }: { password: string }) {
    const requirements = [
        { re: /.{8,}/, label: "Min. 8 characters" },
        { re: /[A-Z]/, label: "Capital letter" },
        { re: /[a-z]/, label: "Lowercase letter" },
        { re: /[0-9]/, label: "Number" },
        { re: /[^A-Za-z0-9]/, label: "Special symbol" },
    ];

    const strengthScore = requirements.filter(req => req.re.test(password)).length;

    const getStrengthColor = () => {
        if (strengthScore <= 2) return 'bg-red-500';
        if (strengthScore <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-3 !mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {requirements.map((req, i) => (
                    <div key={i} className={`text-[10px] flex items-center gap-1 ${req.re.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1 h-1 rounded-full ${req.re.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                        {req.label}
                    </div>
                ))}
            </div>
        </div>
    );
}