# IPB Logbook Generator

Automated logbook submission tool for IPB Student Portal's Kampus Merdeka program.

## 🚀 Features

- **Hybrid Authentication**: Choose between username/password login or manual cookie input
- **Batch Processing**: Upload multiple logbook entries at once via Excel
- **Real-time Progress**: Track submission status for each entry
- **Secure**: Credentials never stored, direct communication with IPB Portal
- **Dark Mode**: Eye-friendly interface with dark mode support
- **Cross-browser**: Works on all modern browsers

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

### Step 2: Upload Excel File

Your Excel file should have these columns:

| Column | Format | Description |
|--------|--------|-------------|
| Waktu | DD/MM/YYYY | Date of activity |
| Tstart | HH:MM | Start time |
| Tend | HH:MM | End time |
| JenisLogId | 1, 2, or 3 | Activity type (1=Pembimbingan, 2=Ujian, 3=Kegiatan) |
| IsLuring | 0, 1, or 2 | Mode (0=Online, 1=Offline, 2=Hybrid) |
| Lokasi | Text | Location |
| Keterangan | Text | Activity description |
| FilePath | Text | Optional file reference |

### Step 3: Review & Submit

1. Review your entries
2. Click "Submit All"
3. Wait for completion
4. Download results as CSV

## 🔒 Security

- **No Storage**: Credentials are never stored on our servers
- **Direct Communication**: All requests go directly to IPB Portal
- **HTTPS**: All communication is encrypted
- **Client-side Processing**: Excel parsing happens in your browser
- **Temporary Sessions**: Cookies are only used for the current session

## 🌐 Deployment

### Vercel Deployment

**✅ YES, this application can be deployed to Vercel with full functionality!**

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Configuration

No special configuration needed! The app works out of the box on Vercel because:

- ✅ Next.js API Routes are fully supported
- ✅ No database required
- ✅ No environment variables needed
- ✅ All processing happens client-side or in serverless functions
- ✅ No persistent storage required

#### Vercel-Specific Notes

1. **Serverless Functions**: API routes (`/api/*`) automatically become serverless functions
2. **Edge Network**: Static assets served via Vercel's CDN
3. **Automatic HTTPS**: SSL certificates provided automatically
4. **Zero Config**: No `vercel.json` needed for basic deployment

### Other Deployment Options

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Hosting
```bash
npm run build
npm start
```

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
│   ├── DarkModeToggle.tsx
│   ├── ExplanationSection.tsx
│   ├── LandingSection.tsx
│   ├── Step1Authentication.tsx  # Hybrid auth component
│   ├── Step2FileUpload.tsx
│   ├── Step3Review.tsx
│   ├── Step4Results.tsx
│   ├── StepIndicator.tsx
│   └── StepsSection.tsx
├── lib/
│   ├── logbook-service.ts   # Excel parsing
│   └── validation.ts        # Entry validation
├── types/
│   └── logbook.ts
└── public/
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
- `entry`: JSON string
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

## 🐛 Known Issues

- Some entries may show "error" in results despite successful submission (display issue only)
- Occasional network timeouts on slow connections (auto-retry implemented)

## 🔮 Future Enhancements

- [ ] Bulk file upload support
- [ ] Template generator
- [ ] Export to multiple formats
- [ ] Mobile app version
- [ ] Scheduled submissions

## 💡 Tips

1. **Use Username/Password method** for easiest experience
2. **Keep your Excel file clean** - remove empty rows
3. **Check IPB Portal** to verify submissions
4. **Download results CSV** for your records
5. **Use dark mode** for late-night logbook entries 🌙

## 📞 Support

If you encounter any issues or have questions:
1. Check the [SECURITY.md](./SECURITY.md) for security-related questions
2. Open an issue on GitHub
3. Contact the authors via social media

---

**Made with ❤️ for IPB Students**

*Simplifying logbook management, one entry at a time.*
