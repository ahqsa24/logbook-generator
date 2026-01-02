# IPB Logbook Generator

Automated platform to easily fill and submit logbooks to IPB Kampus Merdeka Portal.

## ✨ Key Features

- **Flexible Login**: Username/Password or Manual Cookie
- **ZIP Upload**: Upload Excel + supporting files at once
- **Batch Processing**: Submit multiple logbook entries at once
- **Auto Attach Files**: Files automatically attached based on Excel
- **Dark Mode**: Dark theme for comfortable viewing
- **Secure**: Data never stored on server

## 📋 Requirements

- Node.js 18+ and npm
- IPB Student Portal account
- Excel file with logbook data

## 🛠️ Installation

```bash
# Clone repository
git clone <repository-url>
cd logbook-generator-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 How to Use

### Step 1: Login

Choose one of two methods:

**Method 1: Username & Password (Recommended)**
1. Enter your Aktivitas ID
2. Enter your IPB username
3. Enter your IPB password
4. Click "Login & Continue"

**Method 2: Manual Cookie (Advanced)**
1. Login to IPB Student Portal
2. Open DevTools (CTRL + SHIFT + i) → Application tab
3. Navigate to Cookies → studentportal.ipb.ac.id
4. Copy value from `.AspNetCore.Cookies`
5. Paste to form

### Step 2: Upload File

**Option 1: Excel File**
Upload `.xlsx`, `.xls`, or `.csv` file

**Option 2: ZIP Package (Recommended)**
Folder structure:
```
Logbook_Batch/
├── logbook.xlsx
└── files/
    ├── evidence1.pdf
    ├── photo1.jpg
    └── document1.pdf
```

Zip and upload. Files will be automatically attached!

### Excel Format

| Column | Example | Description |
|--------|---------|-------------|
| Waktu | 25/08/2025 | Activity date |
| Tstart | 08:00 | Start time |
| Tend | 16:00 | End time |
| JenisLogId | 1 | 1=Guidance, 2=Exam, 3=Activity |
| IsLuring | 0 | 0=Online, 1=Offline, 2=Hybrid |
| Lokasi | Zoom Meeting | Location |
| Keterangan | Meeting with advisor | Short description |
| Dosen | 1 | Lecturer number (1, 2, or 1,2) |
| FilePath | files/evidence1.pdf | File path in ZIP |

### Step 3: Review & Submit

1. Review logbook entries
2. Files from ZIP automatically attached
3. Add more files if needed
4. Click "Submit All"
5. Wait for completion
6. Download results as CSV

## 🔒 Security

- Data never stored on server
- All requests go directly to IPB Portal
- HTTPS encryption for all communication
- File parsing happens in your browser
- Session only used for current submission

## 🏗️ Project Structure

```
logbook-generator-web/
├── app/
│   ├── api/
│   │   ├── auth/login/      # Login endpoint
│   │   └── submit-logbook/  # Submit endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CommentSection.tsx       # Comment system
│   ├── DarkModeToggle.tsx
│   ├── ExplanationSection.tsx
│   ├── LandingSection.tsx
│   ├── Step1Authentication.tsx  # Login form
│   ├── Step2FileUpload.tsx      # File upload
│   ├── Step3Review.tsx
│   ├── Step4Results.tsx
│   ├── StepIndicator.tsx
│   └── StepsSection.tsx
├── lib/
│   ├── logbook-service.ts   # Excel & ZIP parser
│   └── validation.ts        # Data validation
├── types/
│   └── logbook.ts
└── public/
```

## 🧪 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## 📝 API Endpoints

### POST `/api/auth/login`
Login to IPB Portal.

### POST `/api/submit-logbook`
Submit logbook entry.

## 👥 Developers

- **Ahmad Nur Rohim** - [GitHub](https://github.com/anro128)
- **Ahmad Qaulan Sadida** - [GitHub](https://github.com/ahqsa24)

## 📄 License

MIT License

## ⚠️ Disclaimer

This tool is created to help IPB students manage their logbooks more efficiently. Use in accordance with IPB policies.

## 💡 Tips

1. Use ZIP upload for easier experience
2. Use Username/Password for login
3. Dosen field: use numbers (1, 2, or 1,2)
4. Remove empty rows in Excel
5. Verify submissions in IPB Portal
6. Download CSV results for your records
