import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    console.log('=== LOGBOOK SUBMISSION START ===');
    try {
        const formData = await request.formData();
        const aktivitasId = formData.get('aktivitasId') as string;
        const cookiesJson = formData.get('cookies') as string;
        const entryJson = formData.get('entry') as string;
        const file = formData.get('file') as File | null;

        console.log('Received data:', {
            aktivitasId: aktivitasId?.substring(0, 20) + '...',
            hasCookies: !!cookiesJson,
            hasEntry: !!entryJson,
            hasFile: !!file
        });

        if (!aktivitasId || !cookiesJson || !entryJson) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cookies = JSON.parse(cookiesJson);
        const entry = JSON.parse(entryJson);

        const BASE_URL = 'https://studentportal.ipb.ac.id';

        // Convert cookies object to cookie header string
        const cookieHeader = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

        // Step 1: Fetch the modal page to get hidden fields (like Python bot does)
        const modalUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?aktivitasId=${aktivitasId}`;

        const modalResponse = await fetch(modalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': cookieHeader,
            },
        });

        if (!modalResponse.ok) {
            throw new Error(`Failed to fetch modal page: ${modalResponse.status}`);
        }

        const html = await modalResponse.text();
        const $ = cheerio.load(html);

        // Extract hidden fields from the form
        const hiddenFields: { [key: string]: string } = {};
        $('form input[type=hidden]').each((_, element) => {
            const name = $(element).attr('name');
            const value = $(element).attr('value') || '';
            if (name) {
                hiddenFields[name] = value;
            }
        });

        console.log('Hidden fields extracted:', Object.keys(hiddenFields).length, 'fields');
        console.log('CSRF token present:', !!hiddenFields['__RequestVerificationToken']);

        // Step 2: Prepare form data with hidden fields + entry data
        const submitFormData = new FormData();

        // Add all hidden fields (includes CSRF token)
        Object.entries(hiddenFields).forEach(([key, value]) => {
            submitFormData.append(key, value);
        });

        // Add entry data (matching Python bot exactly)
        submitFormData.append('Waktu', String(entry.Waktu));
        submitFormData.append('Tmw', String(entry.Tstart));
        submitFormData.append('Tsw', String(entry.Tend));
        submitFormData.append('JenisLogbookKegiatanKampusMerdekaId', String(entry.JenisLogId));
        submitFormData.append('ListDosenPembimbing[0].Value', 'true');

        // Handle IsLuring (matching Python bot logic)
        if (entry.IsLuring === 1) {
            submitFormData.append('IsLuring', 'true');
        } else if (entry.IsLuring === 0) {
            submitFormData.append('IsLuring', 'false');
        } else {
            submitFormData.append('IsLuring', '');
        }

        submitFormData.append('Lokasi', entry.Lokasi);
        submitFormData.append('Keterangan', entry.Keterangan);

        // Add file if present
        if (file) {
            submitFormData.append('File', file);
        }

        // Step 3: Submit the form with retry logic
        const postUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah`;

        let response;
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                response = await fetch(postUrl, {
                    method: 'POST',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': modalUrl,
                        'Origin': BASE_URL,
                        'Cookie': cookieHeader,
                    },
                    body: submitFormData,
                    redirect: 'manual',
                });
                break; // Success, exit retry loop
            } catch (error) {
                lastError = error;
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                }
            }
        }

        if (!response) {
            throw lastError || new Error('Failed to submit after retries');
        }

        // Step 4: Check if submission was successful (matching Python bot)
        let success = false;
        const statusCode = response.status;

        if (statusCode === 302) {
            // Verify by checking the list page
            const listUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Index/${aktivitasId}`;
            const listResponse = await fetch(listUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Cookie': cookieHeader,
                },
            });

            const listHtml = await listResponse.text();
            success = listHtml.includes(entry.Keterangan);
        }

        console.log(`Submission result: status=${statusCode}, success=${success}`);

        return NextResponse.json({
            success,
            status: success ? 'success' : 'error',
            statusCode,
            message: success ? 'Submitted successfully' : 'Submission failed',
        });
    } catch (error) {
        console.error('Error submitting logbook:', error);
        console.error('Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as Error).name
        });

        return NextResponse.json(
            {
                success: false,
                status: 'error',
                error: 'Internal server error: ' + (error as Error).message,
                details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
            },
            { status: 500 }
        );
    }
}
