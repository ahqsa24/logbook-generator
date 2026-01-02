import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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

        // Fetch the modal page to get lecturer list
        const modalUrl = `${BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?aktivitasId=${aktivitasId}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const modalResponse = await fetch(modalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': cookieHeader,
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!modalResponse.ok) {
            throw new Error(`Failed to fetch modal page: ${modalResponse.status}`);
        }

        const html = await modalResponse.text();
        const $ = cheerio.load(html);

        // Extract lecturer names from ListDosenPembimbing checkboxes
        const lecturers: { id: number; name: string }[] = [];

        // More specific selector: only get checkbox inputs with .Value in name
        // This filters out hidden inputs and other non-checkbox elements
        const dosenCheckboxes = $('input[type="checkbox"][name*="ListDosenPembimbing"][name$=".Value"]');

        dosenCheckboxes.each((index, element) => {
            const $checkbox = $(element);
            const checkboxName = $checkbox.attr('name') || '';

            // Extract index from name: ListDosenPembimbing[0].Value -> 0
            const match = checkboxName.match(/ListDosenPembimbing\[(\d+)\]\.Value/);
            if (!match) return; // Skip if doesn't match expected format

            const dosenIndex = parseInt(match[1], 10);

            // Try to find the label - look for the actual text label next to checkbox
            let label = '';

            // Method 1: Find label element with matching 'for' attribute
            const labelFor = $(`label[for="${$checkbox.attr('id')}"]`).text().trim();
            if (labelFor) {
                label = labelFor;
            } else {
                // Method 2: Get parent's text and clean it
                const parentText = $checkbox.parent().text().trim();
                // Remove "true" and "false" text that might appear
                label = parentText.replace(/\b(true|false)\b/gi, '').trim();
            }

            // Clean up the label further
            label = label
                .replace(/^\s*true\s*/i, '')
                .replace(/^\s*false\s*/i, '')
                .trim();

            // If still empty, use default name
            if (!label || label === '') {
                label = `Dosen ${dosenIndex + 1}`;
            }

            lecturers.push({
                id: dosenIndex + 1, // 1-indexed for user display (convert from 0-indexed)
                name: label
            });
        });

        // Sort by id to ensure consistent ordering
        lecturers.sort((a, b) => a.id - b.id);

        return NextResponse.json({
            success: true,
            lecturers,
            count: lecturers.length
        });
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch lecturer list: ' + (error as Error).message
            },
            { status: 500 }
        );
    }
}
