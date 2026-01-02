import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const aktivitasId = formData.get('aktivitasId') as string;
        const cookiesJson = formData.get('cookies') as string;
        const entryJson = formData.get('entry') as string;
        const file = formData.get('file') as File | null;

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

        // Step 1: Fetch the modal page to get hidden fields
        const modalUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?aktivitasId=${aktivitasId}`;

        // Add timeout to prevent hanging
        const controller1 = new AbortController();
        const timeout1 = setTimeout(() => controller1.abort(), 30000);

        const modalResponse = await fetch(modalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': cookieHeader,
            },
            signal: controller1.signal,
        });

        clearTimeout(timeout1);

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

        // Extract available lecturer count and names from ListDosenPembimbing checkboxes
        const dosenCheckboxes = $('input[name^="ListDosenPembimbing"]');
        const maxDosen = dosenCheckboxes.length > 0 ? dosenCheckboxes.length : undefined;

        // Extract lecturer names for better error messages
        const lecturerNames: string[] = [];
        dosenCheckboxes.each((index, element) => {
            const $checkbox = $(element);
            // Try to find the label or text near the checkbox
            const label = $checkbox.parent().text().trim() ||
                $checkbox.next('label').text().trim() ||
                $checkbox.siblings('label').text().trim() ||
                `Dosen ${index + 1}`;
            lecturerNames.push(label);
        });

        // Validate Dosen input if specified
        if (entry.Dosen && entry.Dosen.trim() !== '' && maxDosen !== undefined) {
            const dosenString = String(entry.Dosen).trim();
            const dosenNumbers = dosenString
                .split(',')
                .map((num: string) => parseInt(num.trim(), 10))
                .filter((num: number) => !isNaN(num));

            for (const num of dosenNumbers) {
                if (num < 1 || num > maxDosen) {
                    return NextResponse.json({
                        success: false,
                        status: 'error',
                        error: `Dosen value ${num} is out of range. Available lecturers: 1-${maxDosen}`,
                        message: `Invalid Dosen input: ${num}. Valid range is 1-${maxDosen}`
                    }, { status: 400 });
                }
            }
        }

        // console.log(hiddenFields);

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

        // Handle Dosen selection (dynamic based on entry.Dosen field)
        if (entry.Dosen && String(entry.Dosen).trim() !== '') {
            // Parse comma-separated dosen numbers: "1", "2", "1,2,3"
            // User input is 1-indexed (1, 2, 3), convert to 0-indexed for portal (0, 1, 2)
            const dosenString = String(entry.Dosen).trim();
            const dosenNumbers = dosenString
                .split(',')
                .map((num: string) => parseInt(num.trim(), 10)) // Parse as integer
                .filter((num: number) => !isNaN(num) && num > 0) // Filter out invalid numbers
                .map((num: number) => num - 1); // Convert 1-indexed to 0-indexed

            // console.log(`📋 Dosen input: "${dosenString}" -> 0-indexed: [${dosenNumbers.join(', ')}]`);
            // console.log(`📊 Total available lecturers: ${maxDosen}`);

            if (dosenNumbers.length > 0) {
                // STEP 1: Initialize all checkboxes to false first (if we know maxDosen)
                // This ensures the form structure matches the portal's expectations
                if (maxDosen !== undefined) {
                    for (let i = 0; i < maxDosen; i++) {
                        submitFormData.set(`ListDosenPembimbing[${i}].Value`, 'false');
                    }
                    // console.log(`✓ Initialized ${maxDosen} dosen checkboxes to false`);
                }

                // STEP 2: Set selected ones to true
                // Using .set() is safe now because we've initialized all checkboxes
                dosenNumbers.forEach((index: number) => {
                    submitFormData.set(`ListDosenPembimbing[${index}].Value`, 'true');
                    // console.log(`✓ Set ListDosenPembimbing[${index}].Value = true`);
                });

                // console.log(`✅ Total dosen selected: ${dosenNumbers.length}`);
            } else {
                // If parsing failed, default to first dosen
                submitFormData.set('ListDosenPembimbing[0].Value', 'true');
                // console.log('⚠️ Parsing failed, defaulting to first dosen');
            }
        } else {
            // Default: select first dosen if no Dosen field specified
            submitFormData.set('ListDosenPembimbing[0].Value', 'true');
            // console.log('ℹ️ No dosen specified, defaulting to first dosen');
        }

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
            submitFormData.set('File', file);
        }

        // console.log(submitFormData);

        // Step 3: Submit the form with retry logic
        const postUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah`;

        let response;
        let retries = 3;
        let lastError;

        while (retries > 0) {
            try {
                // Add timeout to prevent hanging
                const controller2 = new AbortController();
                const timeout2 = setTimeout(() => controller2.abort(), 30000);

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
                    signal: controller2.signal,
                });

                clearTimeout(timeout2);
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

        // Step 4: Determine success based on HTTP status
        let success = false;
        const statusCode = response.status;

        // Status 302 (redirect) = success
        // Status 200 with no error keywords = success
        if (statusCode === 302) {
            success = true;
        } else if (statusCode === 200) {
            const responseText = await response.text();
            const hasError = responseText.toLowerCase().includes('error') ||
                responseText.toLowerCase().includes('gagal') ||
                responseText.toLowerCase().includes('failed');
            success = !hasError;
        } else {
            success = false;
        }

        return NextResponse.json({
            success,
            status: success ? 'success' : 'error',
            statusCode,
            message: success ? 'Submitted successfully' : 'Submission failed',
            error: success ? undefined : 'Entry not found in logbook list after submission'
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