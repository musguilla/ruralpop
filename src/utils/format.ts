export function formatCurrency(amount: number): string {
    const isInteger = amount % 1 === 0;
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;

    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;

    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        if (days === 1) return "hace 1 día";
        return `hace ${days} días`;
    }

    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        if (hours === 1) return "hace 1 hora";
        return `hace ${hours} horas`;
    }

    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        if (minutes === 1) return "hace 1 minuto";
        return `hace ${minutes} minutos`;
    }

    return "hace un momento";
}
