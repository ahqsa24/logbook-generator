import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { aktivitasId, cookies } = body;

        if (!aktivitasId || !cookies) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const BASE_URL = 'https://studentportal.ipb.ac.id';

        // Convert cookies object to cookie header string
        const cookieHeader = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

        // Hit the modal page to refresh session
        const modalUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?aktivitasId=${aktivitasId}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(modalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': cookieHeader,
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Failed to refresh session: ${response.status}`);
        }

        // Extract cookies from response headers
        const setCookieHeaders = response.headers.getSetCookie();
        const refreshedCookies = { ...cookies };

        // Parse Set-Cookie headers and update cookies
        setCookieHeaders.forEach(cookieStr => {
            const [nameValue] = cookieStr.split(';');
            const [name, value] = nameValue.split('=');
            if (name && value) {
                refreshedCookies[name.trim()] = value.trim();
            }
        });

        return NextResponse.json({
            success: true,
            cookies: refreshedCookies,
            message: 'Session refreshed successfully'
        });
    } catch (error) {
        console.error('Error refreshing session:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to refresh session: ' + (error as Error).message
            },
            { status: 500 }
        );
    }
}
