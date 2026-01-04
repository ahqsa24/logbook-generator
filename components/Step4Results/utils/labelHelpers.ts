/**
 * Label helper utilities
 */

export const getJenisLogLabel = (id: number): string | number => {
    const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
    return labels[id as keyof typeof labels] || id;
};

export const getModeLabel = (mode: number): string | number => {
    const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
    return labels[mode as keyof typeof labels] || mode;
};
