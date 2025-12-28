export function isValidDate(dateStr: string): boolean {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export function isValidTime(timeStr: string): boolean {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(timeStr)) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

export function validateTimeRange(startTime: string, endTime: string): boolean {
    if (!isValidTime(startTime) || !isValidTime(endTime)) return false;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return startTotalMinutes < endTotalMinutes;
}

export function validateLogbookEntry(entry: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!entry.Waktu || !isValidDate(entry.Waktu)) {
        errors.push('Invalid date format. Use DD/MM/YYYY');
    }

    if (!entry.Tstart || !isValidTime(entry.Tstart)) {
        errors.push('Invalid start time format. Use HH:MM');
    }

    if (!entry.Tend || !isValidTime(entry.Tend)) {
        errors.push('Invalid end time format. Use HH:MM');
    }

    if (entry.Tstart && entry.Tend && !validateTimeRange(entry.Tstart, entry.Tend)) {
        errors.push('Start time must be earlier than end time');
    }

    if (!entry.JenisLogId || ![1, 2, 3].includes(Number(entry.JenisLogId))) {
        errors.push('JenisLogId must be 1, 2, or 3');
    }

    if (entry.IsLuring === undefined || ![0, 1, 2].includes(Number(entry.IsLuring))) {
        errors.push('IsLuring must be 0 (online), 1 (offline), or 2 (hybrid)');
    }

    if (!entry.Lokasi || !entry.Lokasi.trim()) {
        errors.push('Lokasi is required');
    }

    if (!entry.Keterangan || !entry.Keterangan.trim()) {
        errors.push('Keterangan is required');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
