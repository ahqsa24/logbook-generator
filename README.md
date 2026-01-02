# IPB Logbook Generator

Automated platform to easily fill and submit logbooks to IPB Kampus Merdeka Portal.

## ✨ Key Features

### Core Features
- **Flexible Login**: Username/Password or Manual Cookie authentication
- **ZIP Upload**: Upload Excel + supporting files at once
- **Batch Processing**: Submit multiple logbook entries simultaneously
- **Auto Attach Files**: Files automatically attached based on Excel mapping
- **Dark Mode**: Comfortable dark theme for extended use
- **Secure**: Zero data storage - all processing happens client-side

### New Features (v2.0)
- **Manual Entry**: Add logbook entries directly without Excel upload
- **Smart Sorting**: Default newest-first with toggle to oldest-first
- **Advanced Filtering**: Search and filter by date, type, lecturer, and mode
- **Password Toggle**: Show/hide password for better UX
- **Comment System**: Community feedback with Supabase integration
- **Download Options**: Export results as CSV, XLSX, or PDF

## 📋 Requirements

- Node.js 18+ and npm
- IPB Student Portal account
- Excel file with logbook data (or use manual entry)
- Supabase account (for comment system - optional)

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/ahqsa24/logbook-generator.git
cd logbook-generator

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 How to Use

### Step 1: Authentication

Choose one of two methods:

**Method 1: Username & Password (Recommended)**
1. Paste your Aktivitas URL from IPB Student Portal
2. Enter your IPB username
3. Enter your IPB password (click eye icon to show/hide)
4. Click "Login & Continue"

**Method 2: Manual Cookie (Advanced)**
1. Login to IPB Student Portal
2. Open DevTools (Ctrl + Shift + I) → Application tab
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

**Option 3: Empty Template**
Upload empty template and use manual entry to add logbook entries

### Excel Format

| Column | Example | Description |
|--------|---------|-------------|
| Waktu | 25/08/2025 | Activity date (DD/MM/YYYY) |
| Tstart | 08:00 | Start time (HH:MM) |
| Tend | 16:00 | End time (HH:MM) |
| JenisLogId | 1 | 1=Pembimbingan, 2=Ujian, 3=Kegiatan |
| IsLuring | 0 | 0=Online, 1=Offline, 2=Hybrid |
| Lokasi | Zoom Meeting | Location |
| Keterangan | Meeting with advisor | Short description |
| Dosen | 1 | Lecturer number (1, 2, or 1,2 for multiple) |
| FilePath | files/evidence1.pdf | File path in ZIP (optional) |

### Step 3: Review & Submit

**New Features:**
- **Search**: Filter by location or description
- **Filter**: By date range, log type, lecturer, or mode
- **Sort**: Toggle between newest-first and oldest-first
- **Manual Entry**: Click "Add Entry Manually" to create new entries
- **Edit**: Click edit icon to modify any entry
- **Delete**: Remove unwanted entries

**Submission:**
1. Review all logbook entries
2. Files from ZIP automatically attached
3. Add more files if needed
4. Click "Submit All"
5. Wait for completion
6. Download results as CSV, XLSX, or PDF

### Step 4: Results

- View submission status for each entry
- Download results in your preferred format
- Start over for new batch

## 🔒 Security

- **Zero Storage**: Credentials never stored on server
- **Direct Communication**: All requests go directly to IPB Portal
- **HTTPS Encryption**: Secure communication
- **Client-Side Processing**: File parsing in browser
- **Temporary Session**: Only used for current submission
- **Privacy Notice**: Clear disclosure on data usage

## 🏗️ Project Structure

```
logbook-generator-web/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/           # Login endpoint
│   │   │   └── get-lecturers/   # Fetch lecturers
│   │   ├── comments/            # Comment CRUD (Supabase)
│   │   └── submit-logbook/      # Submit endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CommentSection.tsx       # Comment system with Supabase
│   ├── DarkModeToggle.tsx
│   ├── ExplanationSection.tsx
│   ├── LandingSection.tsx
│   ├── Step1Authentication.tsx  # Login with password toggle
│   ├── Step2FileUpload.tsx      # File upload
│   ├── Step3Review.tsx          # Review with filters & manual entry
│   ├── Step4Results.tsx         # Results with download options
│   ├── StepIndicator.tsx
│   └── StepsSection.tsx
├── lib/
│   ├── logbook-service.ts       # Excel & ZIP parser
│   ├── supabase.ts              # Supabase client
│   └── validation.ts            # Data validation
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

# Type check
npm run type-check
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login to IPB Portal
- `POST /api/auth/get-lecturers` - Fetch available lecturers

### Logbook
- `POST /api/submit-logbook` - Submit logbook entry

### Comments (Supabase)
- `GET /api/comments` - Fetch all comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/[id]` - Update comment (likes)
- `DELETE /api/comments/[id]` - Delete comment
- `POST /api/comments/[id]/replies` - Create reply
- `DELETE /api/comments/[id]/replies/[replyId]` - Delete reply

## 👥 Developers

- **Ahmad Qaulan Sadida** - [GitHub](https://github.com/ahqsa24)
- **Ahmad Nur Rohim** - [GitHub](https://github.com/anro128)

## ⚠️ Disclaimer

This tool is created to help IPB students manage their logbooks more efficiently. Use in accordance with IPB policies.

## 📚 Additional Resources

For Supabase setup, see [`supabase_schema.sql`](supabase_schema.sql) in the project root for the complete database schema.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.
