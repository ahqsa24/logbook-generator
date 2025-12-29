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

        // Extract dosen checkbox information
        const dosenCheckboxes: Array<{ index: number; name: string; value: string; id?: string }> = [];
        $('form input[type=checkbox]').each((_, element) => {
            const name = $(element).attr('name');
            const value = $(element).attr('value') || '';
            const id = $(element).attr('id');

            // Look for dosen-related checkboxes
            if (name && (name.includes('DosenPembimbing') || name.includes('Pembimbing'))) {
                // Extract index from name like "ListDosenPembimbing[1].Key_PembimbingId"
                const indexMatch = name.match(/\[(\d+)\]/);
                if (indexMatch) {
                    const index = parseInt(indexMatch[1]);
                    dosenCheckboxes.push({ index, name, value, id });
                    console.log(`Found dosen checkbox: index=${index}, name=${name}, value=${value}`);
                }
            }
        });

        console.log('Hidden fields extracted:', Object.keys(hiddenFields).length, 'fields');
        console.log('CSRF token present:', !!hiddenFields['__RequestVerificationToken']);
        console.log('Dosen checkboxes found:', dosenCheckboxes.length);

        // Debug: Log all hidden fields related to dosen
        console.log('=== ALL HIDDEN FIELDS ===');
        Object.keys(hiddenFields).forEach(key => {
            if (key.toLowerCase().includes('dosen') || key.toLowerCase().includes('pembimbing')) {
                console.log(`  ${key} = ${hiddenFields[key]}`);
            }
        });

        // Debug: Log all input elements (not just checkboxes)
        console.log('=== ALL INPUT ELEMENTS ===');
        $('form input').each((_, element) => {
            const name = $(element).attr('name');
            const type = $(element).attr('type');
            const value = $(element).attr('value');
            if (name && (name.includes('Dosen') || name.includes('Pembimbing'))) {
                console.log(`  Type: ${type}, Name: ${name}, Value: ${value}`);
            }
        });
        console.log('======================');

        // Step 2: Prepare form data with hidden fields + entry data
        const submitFormData = new FormData();

        // Add all hidden fields (includes CSRF token AND any dosen-related hidden fields)
        Object.entries(hiddenFields).forEach(([key, value]) => {
            // Skip dosen fields - we'll add them manually based on entry.Dosen
            if (!key.includes('DosenPembimbing') && !key.includes('Pembimbing')) {
                submitFormData.append(key, value);
            } else {
                console.log(`Skipping hidden field (will set manually): ${key} = ${value}`);
            }
        });

        // Add entry data (matching Python bot exactly)
        submitFormData.append('Waktu', String(entry.Waktu));
        submitFormData.append('Tmw', String(entry.Tstart));
        submitFormData.append('Tsw', String(entry.Tend));
        submitFormData.append('JenisLogbookKegiatanKampusMerdekaId', String(entry.JenisLogId));

        // Debug: Log the entire entry to see what we received
        console.log('=== ENTRY DATA ===');
        console.log('Full entry object:', JSON.stringify(entry, null, 2));
        console.log('entry.Dosen value:', entry.Dosen);
        console.log('entry.Dosen type:', typeof entry.Dosen);
        console.log('entry.Dosen truthy?:', !!entry.Dosen);
        console.log('==================');

        // Handle Dosen selection (dynamic based on entry.Dosen field)
        if (dosenCheckboxes.length > 0) {
            if (entry.Dosen && String(entry.Dosen).trim() !== '') {
                // Parse comma-separated dosen numbers: "1", "2", "1,2,3"
                const dosenString = String(entry.Dosen).trim();
                console.log('Raw Dosen value:', dosenString);

                // Split by comma and parse each number
                const dosenNumbers = dosenString
                    .split(',')
                    .map((num: string) => {
                        const trimmed = num.trim();
                        const parsed = parseInt(trimmed, 10);
                        console.log(`  Parsing "${trimmed}" → ${parsed}`);
                        return parsed;
                    })
                    .filter((num: number) => !isNaN(num) && num > 0) // Filter out invalid numbers
                    .map((num: number) => num - 1); // Convert to 0-indexed

                console.log('Dosen indices to select:', dosenNumbers);

                if (dosenNumbers.length > 0) {
                    dosenNumbers.forEach((selectedIndex: number) => {
                        // Find the checkbox with this index
                        const checkbox = dosenCheckboxes.find(cb => cb.index === selectedIndex);
                        if (checkbox) {
                            // Use the exact field name from the form
                            submitFormData.append(checkbox.name, checkbox.value);
                            console.log(`✓ Selected dosen index ${selectedIndex}: ${checkbox.name} = ${checkbox.value}`);
                        } else {
                            console.warn(`⚠ No checkbox found for dosen index ${selectedIndex}`);
                        }
                    });
                } else {
                    console.warn('⚠ No valid dosen numbers found, defaulting to first dosen');
                    if (dosenCheckboxes[0]) {
                        submitFormData.append(dosenCheckboxes[0].name, dosenCheckboxes[0].value);
                        console.log(`✓ Default: Selected first dosen: ${dosenCheckboxes[0].name} = ${dosenCheckboxes[0].value}`);
                    }
                }
            } else {
                // Default: select first dosen if no Dosen field specified
                console.log('No Dosen field specified, using default (first dosen)');
                if (dosenCheckboxes[0]) {
                    submitFormData.append(dosenCheckboxes[0].name, dosenCheckboxes[0].value);
                    console.log(`✓ Default: Selected first dosen: ${dosenCheckboxes[0].name} = ${dosenCheckboxes[0].value}`);
                }
            }
        } else {
            // Fallback to old method if no checkboxes found
            console.warn('⚠ No dosen checkboxes found in form, using fallback method');
            if (entry.Dosen && String(entry.Dosen).trim() !== '') {
                const dosenString = String(entry.Dosen).trim();
                const dosenNumbers = dosenString
                    .split(',')
                    .map((num: string) => parseInt(num.trim(), 10) - 1)
                    .filter((num: number) => !isNaN(num) && num >= 0);

                dosenNumbers.forEach((index: number) => {
                    submitFormData.append(`ListDosenPembimbing[${index}].Value`, 'true');
                });
            } else {
                submitFormData.append('ListDosenPembimbing[0].Value', 'true');
            }
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
            submitFormData.append('File', file);
        }

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
            console.log('✓ Success: Redirect detected (302)');
        } else if (statusCode === 200) {
            const responseText = await response.text();
            const hasError = responseText.toLowerCase().includes('error') ||
                responseText.toLowerCase().includes('gagal') ||
                responseText.toLowerCase().includes('failed');
            success = !hasError;
            console.log(hasError ? '✗ Error keywords found in response' : '✓ Success: No errors in response');
        } else {
            success = false;
            console.log(`✗ Failed: Unexpected status ${statusCode}`);
        }

        console.log(`Final result: status=${statusCode}, success=${success}`);

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
