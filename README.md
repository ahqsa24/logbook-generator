# IPB Logbook Generator

Automated logbook submission tool for IPB Student Portal's Kampus Merdeka program.

## 🚀 Features

- **Hybrid Authentication**: Choose between username/password login or manual cookie input
- **ZIP Upload Support**: Upload Excel + supporting files in one ZIP package
- **Dosen Selection**: Automatically select lecturers using simple numbering (1, 2, 3)
- **Batch Processing**: Upload multiple logbook entries at once via Excel
- **Real-time Progress**: Track submission status for each entry
- **Secure**: Credentials never stored, direct communication with IPB Portal
- **Dark Mode**: Eye-friendly interface with dark mode support
- **Cross-browser**: Works on all modern browsers
- **Comment Section**: Interactive feedback system with likes, replies, and admin moderation

## 📋 Prerequisites

- Node.js 18+ and npm
- IPB Student Portal account
- Excel file with logbook data

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd logbook-generator-web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure admin password (optional)
# Edit .env.local and set NEXT_PUBLIC_ADMIN_PASSWORD

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 Usage

### Step 1: Authentication

Choose one of two methods:

#### Method 1: Username & Password (Recommended)
1. Enter your Aktivitas ID
2. Enter your IPB username
3. Enter your IPB password
4. Click "Login & Continue"

#### Method 2: Manual Cookies (Advanced)
1. Login to IPB Student Portal
2. Open DevTools (F12) → Application tab
3. Navigate to Cookies → studentportal.ipb.ac.id
4. Copy the Value of these 3 cookies:
   - `AspNetCore.Session`
   - `.AspNetCore.Cookies`
   - `.AspNetCore.Antiforgery`
5. Paste into respective fields

### Step 2: Upload File

#### Option 1: Excel Only
Upload `.xlsx`, `.xls`, or `.csv` file. Add supporting files manually in Step 3.

#### Option 2: ZIP Package (Recommended)
Create a folder structure:
```
📁 Logbook_Batch/
  ├── 📄 logbook.xlsx
  └── 📁 files/
      ├── bukti1.pdf
      ├── foto1.jpg
      └── dokumen1.pdf
```

Zip the folder and upload. Files will be automatically attached based on `FilePath` column!

### Excel Format

| Column | Format | Description |
|--------|--------|-------------|
| Waktu | DD/MM/YYYY | Date of activity (e.g., 25/08/2025) |
| Tstart | HH:MM | Start time (e.g., 08:00) |
| Tend | HH:MM | End time (e.g., 16:00) |
| JenisLogId | 1, 2, or 3 | Activity type: 1=Pembimbingan, 2=Ujian, 3=Kegiatan |
| IsLuring | 0, 1, or 2 | Mode: 0=Online, 1=Offline, 2=Hybrid |
| Lokasi | Text | Location (e.g., "Zoom Meeting", "IPB Campus") |
| Keterangan | Text | Activity description |
| Dosen | Text | Lecturer selection: "1", "2", "1,2", "1,2,3" |
| FilePath | Text | Path to supporting file: "files/bukti1.pdf" |

**Example:**

| Waktu | Tstart | Tend | JenisLogId | IsLuring | Lokasi | Keterangan | Dosen | FilePath |
|-------|--------|------|------------|----------|--------|------------|-------|----------|
| 25/08/2025 | 08:00 | 16:00 | 1 | 0 | Online | Pembimbingan | 1 | files/bukti1.pdf |
| 26/08/2025 | 08:00 | 16:00 | 2 | 1 | IPB | Ujian | 2 | files/bukti2.pdf |
| 27/08/2025 | 08:00 | 16:00 | 1 | 2 | Hybrid | Meeting | 1,2 | |

### Step 3: Review & Submit

1. Review your entries
2. Files from ZIP are automatically attached (✓ matched, ✗ missing)
3. Upload additional files if needed
4. Click "Submit All"
5. Wait for completion
6. Download results as CSV

## 🔒 Security

- **No Storage**: Credentials are never stored on our servers
- **Direct Communication**: All requests go directly to IPB Portal
- **HTTPS**: All communication is encrypted
- **Client-side Processing**: Excel and ZIP parsing happen in your browser
- **Temporary Sessions**: Cookies are only used for the current session

## 🏗️ Project Structure

```
logbook-generator-web/
├── app/
│   ├── api/
│   │   ├── auth/login/      # Username/password authentication
│   │   └── submit-logbook/  # Logbook submission endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CommentSection.tsx       # Interactive comment system
│   ├── DarkModeToggle.tsx
│   ├── DonationSection.tsx
│   ├── ExplanationSection.tsx
│   ├── LandingSection.tsx
│   ├── Step1Authentication.tsx  # Hybrid auth component
│   ├── Step2FileUpload.tsx      # ZIP + Excel upload
│   ├── Step3Review.tsx
│   ├── Step4Results.tsx
│   ├── StepIndicator.tsx
│   └── StepsSection.tsx
├── lib/
│   ├── logbook-service.ts   # Excel + ZIP parsing
│   └── validation.ts        # Entry validation
├── types/
│   └── logbook.ts
├── public/
├── .env.example             # Environment template
└── .env.local               # Local environment (gitignored)
```

## 🧪 Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## 📝 API Endpoints

### POST `/api/auth/login`
Authenticate with IPB Portal using username/password.

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "aktivitasId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "cookies": "AspNetCore.Session=...; ...",
  "message": "Login successful"
}
```

### POST `/api/submit-logbook`
Submit a single logbook entry.

**Request:** `multipart/form-data`
- `aktivitasId`: string
- `cookies`: JSON string
- `entry`: JSON string (includes Dosen field)
- `file`: File (optional)

**Response:**
```json
{
  "success": true,
  "status": "success",
  "statusCode": 302,
  "message": "Submitted successfully"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Authors

- **Ahmad Nur Rohim** - [GitHub](https://github.com/anro128) | [Instagram](https://instagram.com/ahmadnr_12)
- **Ahmad Qaulan Sadida** - [GitHub](https://github.com/ahqsa24) | [Instagram](https://instagram.com/adidsadida24)

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This tool is created for educational purposes to help IPB students manage their logbook entries more efficiently. Use responsibly and in accordance with IPB's policies.

## 💡 Tips

1. **Use ZIP upload** for automatic file attachment
2. **Use Username/Password method** for easiest experience
3. **Dosen field**: Use numbers (1,2,3) for lecturer selection
4. **Keep your Excel file clean** - remove empty rows
5. **Check IPB Portal** to verify submissions
6. **Download results CSV** for your records
7. **Use dark mode** for late-night logbook entries 🌙

## 📞 Support

If you encounter any issues or have questions:
1. Check the [SECURITY.md](./SECURITY.md) for security-related questions
2. Open an issue on GitHub
3. Contact the authors via social media

---

**Made with ❤️ for IPB Students**

*Simplifying logbook management, one entry at a time.*
