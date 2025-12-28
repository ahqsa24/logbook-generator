import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { aktivitasId, cookies } = await request.json();

        if (!aktivitasId || !cookies) {
            return NextResponse.json(
                { error: 'Missing aktivitasId or cookies' },
                { status: 400 }
            );
        }

        const BASE_URL = 'https://studentportal.ipb.ac.id';
        const modalUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?aktivitasId=${aktivitasId}`;

        // Convert cookies object to cookie header string
        const cookieHeader = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

        const response = await fetch(modalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*',
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch form: ${response.status}` },
                { status: response.status }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract hidden form fields
        const hiddenFields: { [key: string]: string } = {};
        $('form input[type=hidden]').each((_, element) => {
            const name = $(element).attr('name');
            const value = $(element).attr('value') || '';
            if (name) {
                hiddenFields[name] = value;
            }
        });

        return NextResponse.json({
            success: true,
            hiddenFields,
        });
    } catch (error) {
        console.error('Error fetching CSRF:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
