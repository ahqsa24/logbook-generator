export function isValidDate(dateStr: string): boolean {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);

    // Validate year is exactly 4 digits (between 1000 and 9999)
    if (year < 1000 || year > 9999) return false;

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

export function validateDosenInput(dosenStr: string | undefined, maxDosen?: number): { isValid: boolean; error?: string } {
    // If no Dosen specified, it's valid (optional field)
    if (!dosenStr || dosenStr.trim() === '') {
        return { isValid: true };
    }

    // If maxDosen is not provided, skip validation
    if (maxDosen === undefined) {
        return { isValid: true };
    }

    try {
        // Parse comma-separated dosen numbers: "1", "2", "1,2,3"
        const dosenNumbers = dosenStr
            .split(',')
            .map((num: string) => parseInt(num.trim(), 10))
            .filter((num: number) => !isNaN(num));

        // Check if any number is out of range
        for (const num of dosenNumbers) {
            if (num < 1 || num > maxDosen) {
                return {
                    isValid: false,
                    error: `Dosen value ${num} is out of range. Valid range: 1-${maxDosen}`
                };
            }
        }

        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid Dosen format. Use comma-separated numbers (e.g., "1,2,3")'
        };
    }
}

export function validateLogbookEntry(entry: any, maxDosen?: number): { isValid: boolean; errors: string[] } {
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

    // Validate Dosen field if maxDosen is provided
    if (maxDosen !== undefined) {
        const dosenValidation = validateDosenInput(entry.Dosen, maxDosen);
        if (!dosenValidation.isValid && dosenValidation.error) {
            errors.push(dosenValidation.error);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

