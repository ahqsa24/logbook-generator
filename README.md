# IPB Logbook Generator Web

A modern web application to automate logbook submission to IPB Student Portal. This is a Next.js conversion of the original Python bot, providing the same functionality through a clean, minimalist purple-themed interface.

## Features

- 🎨 Clean, minimalist purple design
- 📊 Excel file upload and parsing
- 🔐 Session cookie authentication
- 📝 Batch logbook submission
- ✅ Real-time progress tracking
- 📄 Results export to CSV

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Active IPB Student Portal account

### Installation

1. Clone this repository or navigate to the project directory:
```bash
cd logbook-generator-web
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Step 1: Get Your Session Cookies

1. Login to [IPB Student Portal](https://studentportal.ipb.ac.id)
2. Open Developer Tools (F12)
3. Go to Application → Cookies → studentportal.ipb.ac.id
4. Copy all cookies (you can paste them as JSON or cookie header format)

### Step 2: Get Your Aktivitas ID

1. Navigate to your Kampus Merdeka logbook page
2. Look at the URL in your browser
3. Copy the long string at the end (after the last `/`)
   - Example: `mQmVKibuyaaaaaaaaaaaAJGZvXRzvNiKkxQi4S7w`

### Step 3: Prepare Your Excel File

Your Excel file should have the following columns:

| Column | Format | Description |
|--------|--------|-------------|
| Waktu | DD/MM/YYYY | Date of activity |
| Tstart | HH:MM | Start time |
| Tend | HH:MM | End time |
| JenisLogId | 1, 2, or 3 | Activity type (1=Pembimbingan, 2=Ujian, 3=Kegiatan) |
| IsLuring | 0, 1, or 2 | Mode (0=Online, 1=Offline, 2=Hybrid) |
| Lokasi | Text | Location |
| Keterangan | Text | Description |
| FilePath | Text | (Optional) File path reference |

### Step 4: Upload and Submit

1. Enter your cookies and aktivitas ID
2. Upload your Excel file
3. Optionally upload supporting documents for each entry
4. Review the preview and click "Submit All"
5. Download the results CSV when complete

## Excel File Example

You can use the same Excel file format as the original Python bot. See `data.xlsx` in the original bot folder for reference.

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

This app can be deployed to any platform that supports Next.js:
- Railway
- Netlify
- AWS Amplify
- Google Cloud Run

## Technical Details

### Built With

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **xlsx** - Excel file parsing
- **cheerio** - HTML parsing for CSRF tokens

### Architecture

- **Frontend**: React components with step-by-step wizard interface
- **Backend**: Next.js API routes for server-side requests
- **Authentication**: Session cookie-based (no credentials stored)
- **File Processing**: Client-side Excel parsing, server-side submission

## Differences from Python Bot

| Feature | Python Bot | Web App |
|---------|-----------|---------|
| Cookie extraction | Automatic from browser | Manual input |
| File upload | Local file paths | Web file upload |
| Progress tracking | Console output | Real-time UI |
| Results | CSV file | CSV download + UI display |
| Deployment | Local only | Can be hosted online |

## Security Notes

- Cookies are only sent to the API routes (never stored on server)
- All requests are made server-side to avoid CORS issues
- No credentials or session data are persisted
- Files are processed in-memory only

## Troubleshooting

### "Failed to get CSRF tokens"
- Check that your cookies are valid and not expired
- Make sure you're logged into IPB Student Portal
- Verify your aktivitas ID is correct

### "Invalid date/time format"
- Ensure dates are in DD/MM/YYYY format
- Ensure times are in HH:MM format
- Check that start time is before end time

### "Failed to parse Excel file"
- Verify your Excel file has all required columns
- Check that column names match exactly (case-sensitive)
- Try re-saving the file as .xlsx format

## License

This project is open source and free to use. Modify it as needed for your requirements.

## Credits

Based on the original [IPB Student Portal Logbook Bot](../IPB-Student-Portal-Logbook-Bot) Python script.
