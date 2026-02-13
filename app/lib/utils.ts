export const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: value < 1.0 ? 8 : 2,
        maximumFractionDigits: value < 1.0 ? 8 : 2
    });
};

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
    });
};