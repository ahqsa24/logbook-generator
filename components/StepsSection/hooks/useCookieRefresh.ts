/**
 * Custom hook for cookie refresh logic
 */

export const useCookieRefresh = () => {
    const refreshSessionCookies = async (aktivitasId: string, currentCookies: any) => {
        try {
            const response = await fetch('/api/refresh-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aktivitasId, cookies: currentCookies })
            });
            const result = await response.json();
            return result.success ? result.cookies : null;
        } catch (error) {
            console.error('Cookie refresh failed:', error);
            return null;
        }
    };

    return { refreshSessionCookies };
};
