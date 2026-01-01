import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { username, password, aktivitasId } = await request.json();

        if (!username || !password || !aktivitasId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const loginUrl = 'https://studentportal.ipb.ac.id/Account/Login';

        // Step 1: Get login page
        const loginPageResponse = await fetch(loginUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        const loginPageHtml = await loginPageResponse.text();
        const csrfMatch = loginPageHtml.match(/name="__RequestVerificationToken".*?value="([^"]+)"/);
        const csrfToken = csrfMatch ? csrfMatch[1] : '';

        // Get initial cookies
        const setCookieHeaders = loginPageResponse.headers.getSetCookie();
        let initialCookies = '';
        setCookieHeaders.forEach(cookie => {
            const cookieName = cookie.split('=')[0];
            const cookieValue = cookie.split(';')[0].split('=')[1];
            initialCookies += `${cookieName}=${cookieValue}; `;
        });

        // Step 2: Submit login
        const formData = new URLSearchParams();
        formData.append('Username', username);
        formData.append('Password', password);
        if (csrfToken) {
            formData.append('__RequestVerificationToken', csrfToken);
        }

        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': initialCookies,
                'Referer': loginUrl,
            },
            body: formData.toString(),
            redirect: 'manual',
        });

        if (loginResponse.status !== 302 && loginResponse.status !== 200) {
            return NextResponse.json(
                { success: false, error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Check redirect location - if redirected back to login, credentials are wrong
        const redirectLocation = loginResponse.headers.get('location');
        if (redirectLocation && (redirectLocation.includes('/Account/Login') || redirectLocation.includes('ReturnUrl'))) {
            return NextResponse.json(
                { success: false, error: 'Invalid username or password. Please check your credentials.' },
                { status: 401 }
            );
        }

        // Step 3: Collect cookies
        const loginCookies = loginResponse.headers.getSetCookie();
        let allCookies: { [key: string]: string } = {};

        initialCookies.split('; ').forEach(cookie => {
            if (cookie) {
                const [name, value] = cookie.split('=');
                if (name) allCookies[name] = value || '';
            }
        });

        loginCookies.forEach(cookie => {
            const parts = cookie.split(';')[0].split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            allCookies[name] = value;
        });

        // Step 4: Navigate to aktivitas page to verify authentication
        const aktivitasUrl = `https://studentportal.ipb.ac.id/Kegiatan/LogAktivitasKampusMerdeka/Index/${aktivitasId}`;
        const cookieHeader = Object.entries(allCookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');

        const aktivitasResponse = await fetch(aktivitasUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieHeader,
            },
            redirect: 'manual',
        });

        // If redirected to login page, authentication failed
        if (aktivitasResponse.status === 302) {
            const aktivitasRedirect = aktivitasResponse.headers.get('location');
            if (aktivitasRedirect && aktivitasRedirect.includes('/Account/Login')) {
                return NextResponse.json(
                    { success: false, error: 'Authentication failed. Invalid credentials or session expired.' },
                    { status: 401 }
                );
            }
        }

        // If not 200 OK, something went wrong
        if (aktivitasResponse.status !== 200) {
            return NextResponse.json(
                { success: false, error: 'Failed to access student portal. Please verify your credentials.' },
                { status: 401 }
            );
        }

        const aktivitasCookies = aktivitasResponse.headers.getSetCookie();
        aktivitasCookies.forEach(cookie => {
            const parts = cookie.split(';')[0].split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            allCookies[name] = value;
        });



        // Step 5: Send ALL AspNetCore cookies (flexible matching)
        const cookieString = Object.entries(allCookies)
            .filter(([name]) =>
                name.includes('AspNetCore') ||
                name.includes('Antiforgery')
            )
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');

        if (!cookieString) {
            return NextResponse.json(
                { success: false, error: 'No session cookies found. Login may have failed.' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            cookies: cookieString,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error during login' },
            { status: 500 }
        );
    }
}