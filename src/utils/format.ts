export function formatCurrency(amount: number): string {
    const isInteger = amount % 1 === 0;
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatRelativeTime(dateString: string, locale: string = 'es'): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const isPt = locale === 'pt';

    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        if (years === 1) return isPt ? "há 1 ano" : "hace 1 año";
        return isPt ? `há ${years} anos` : `hace ${years} años`;
    }

    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        if (months === 1) return isPt ? "há 1 mês" : "hace 1 mes";
        return isPt ? `há ${months} meses` : `hace ${months} meses`;
    }

    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        if (days === 1) return isPt ? "há 1 dia" : "hace 1 día";
        return isPt ? `há ${days} dias` : `hace ${days} días`;
    }

    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        if (hours === 1) return isPt ? "há 1 hora" : "hace 1 hora";
        return isPt ? `há ${hours} horas` : `hace ${hours} horas`;
    }

    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        if (minutes === 1) return isPt ? "há 1 minuto" : "hace 1 minuto";
        return isPt ? `há ${minutes} minutos` : `hace ${minutes} minutos`;
    }

    return isPt ? "agora mesmo" : "hace un momento";
}
