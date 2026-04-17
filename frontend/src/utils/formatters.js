import { format } from 'date-fns';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (dateString, fmt = 'do MMM yyyy, h:mm a') => {
    if (!dateString) return '';
    return format(new Date(dateString), fmt);
};

export const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};
