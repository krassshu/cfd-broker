// Formats a numeric value as USD currency.
// Applies higher precision (up to 8 decimals) for values below $1 to handle crypto sub-cent prices.
export const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null || value === '') {
        return "$0.00";
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return "$0.00";
    }

    const absValue = Math.abs(numValue);
    return numValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: absValue < 1.0 && absValue > 0 ? 6 : 2,
        maximumFractionDigits: absValue < 1.0 && absValue > 0 ? 8 : 2
    });
};

// Formats a number for price display. Uses fixed decimals for values >= 1, trims trailing zeros for sub-dollar prices.
export function formatPrice(value: number, decimals = 2): string {
    if (value >= 1) return value.toFixed(decimals);
    const str = value.toFixed(8);
    return str.replace(/0+$/, '').replace(/\.$/, '.00');
}

// Formats an ISO date string to a compact DD/MM HH:MM representation.
export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
    });
};
