# Media Partner Banner Guidelines

## 📐 Ukuran Banner yang Harus Disiapkan Client

### **Opsi 1: Single Image (Recommended)**
Gunakan satu gambar yang akan di-crop otomatis untuk desktop dan mobile.

**Spesifikasi:**
- **Ukuran**: 1200x900px (ratio 4:3)
- **Format**: PNG, WebP, atau JPG
- **File Size**: Max 500KB (optimal: 200-300KB)
- **Resolution**: 72-150 DPI
- **Color Mode**: RGB

### **Opsi 2: Dual Images (Optimal)**
Siapkan 2 gambar berbeda untuk desktop dan mobile untuk hasil terbaik.

**Desktop Banner:**
- **Ukuran**: 1200x900px (ratio 4:3, landscape)
- **Format**: PNG, WebP, atau JPG
- **File Size**: Max 500KB
- **Nama File**: `partner-desktop.png` atau `partner-desktop.webp`

**Mobile Banner:**
- **Ukuran**: 600x800px (ratio 3:4, portrait)
- **Format**: PNG, WebP, atau JPG
- **File Size**: Max 300KB
- **Nama File**: `partner-mobile.png` atau `partner-mobile.webp`

---

## 🎨 Design Guidelines

### **Safe Zone (Area Aman untuk Konten Penting)**
Pastikan logo, teks, dan CTA berada dalam safe zone:
- **Desktop**: 100px dari setiap sisi
- **Mobile**: 60px dari setiap sisi

### **Rekomendasi Design:**
1. ✅ Logo jelas dan terbaca
2. ✅ CTA (Call-to-Action) yang jelas
3. ✅ Kontras warna yang baik
4. ✅ Font minimal 16px untuk teks penting
5. ✅ Hindari terlalu banyak teks
6. ✅ Gunakan high-quality images

### **Contoh Layout:**

```
┌─────────────────────────────────┐
│  [Logo]                    [X]  │  ← Header (100px)
│                                 │
│     HEADLINE TEXT               │  ← Main Message
│     Subheadline text            │
│                                 │
│     • Feature 1                 │  ← Features/Benefits
│     • Feature 2                 │
│                                 │
│     [  Call to Action  ]        │  ← CTA Button
│                                 │
└─────────────────────────────────┘
```

---

## 📁 Cara Menambahkan Banner Client

### **Step 1: Simpan Gambar**
Letakkan gambar di folder `public/banners/`:
```
public/
  └── banners/
      ├── partner-desktop.png
      └── partner-mobile.png  (optional)
```

### **Step 2: Update AdBanner.tsx**
Tambahkan konfigurasi banner baru di array `banners`:

```typescript
const banners: BannerConfig[] = [
    // Existing text banner
    {
        id: 1,
        type: 'text',
        // ... existing config
    },
    // NEW: Image banner untuk media partner
    {
        id: 2,
        type: 'image',
        imageUrl: '/banners/partner-desktop.png',
        imageMobileUrl: '/banners/partner-mobile.png', // Optional
        imageAlt: 'Partner Advertisement',
        clickUrl: 'https://partner-website.com',
    },
];
```

### **Step 3: Test**
1. Refresh browser
2. Clear session storage jika banner tidak muncul:
   ```javascript
   sessionStorage.removeItem('hasSeenAdBanner');
   ```
3. Reload page

---

## 🔄 Banner Rotation

Banner akan bergantian otomatis berdasarkan waktu:
- **00:00 - 07:59**: Banner 1
- **08:00 - 15:59**: Banner 2
- **16:00 - 23:59**: Banner 3

Atau Anda bisa mengubah logic rotation di function `getBannerRotation()`.

---

## 📱 Responsive Behavior

### **Desktop (≥768px)**
- Menampilkan `imageUrl` (desktop image)
- Aspect ratio: 4:3
- Max width: 768px (2xl container)

### **Mobile (<768px)**
- Menampilkan `imageMobileUrl` jika tersedia
- Fallback ke `imageUrl` jika mobile image tidak ada
- Aspect ratio: 3:4 (portrait)
- Full width dengan padding 16px

---

## 🎯 Best Practices untuk Client

### **DO ✅**
- Gunakan format WebP untuk file size lebih kecil
- Compress gambar sebelum upload (gunakan TinyPNG, Squoosh, dll)
- Test di berbagai device (desktop, tablet, mobile)
- Pastikan link tujuan valid dan aman (HTTPS)
- Gunakan warna yang kontras dengan background

### **DON'T ❌**
- Jangan gunakan gambar blur atau low quality
- Jangan taruh teks penting di pinggir (gunakan safe zone)
- Jangan upload file >500KB (akan lambat loading)
- Jangan gunakan terlalu banyak animasi di gambar
- Jangan lupa test di dark mode

---

## 🛠️ Tools Rekomendasi

### **Image Optimization:**
- [TinyPNG](https://tinypng.com/) - Compress PNG/JPG
- [Squoosh](https://squoosh.app/) - Convert to WebP
- [ImageOptim](https://imageoptim.com/) - Mac app

### **Design Tools:**
- Figma, Canva, Adobe Photoshop
- Template size: 1200x900px (desktop), 600x800px (mobile)

### **Testing:**
- Chrome DevTools (Responsive mode)
- [Responsively App](https://responsively.app/)

---

## 📊 Analytics & Tracking

Untuk track performa banner:
1. Tambahkan UTM parameters di `clickUrl`:
   ```
   https://partner.com?utm_source=logbook-generator&utm_medium=banner&utm_campaign=jan2026
   ```

2. Monitor di Google Analytics atau tools lain

---

## 📞 Contact

Jika ada pertanyaan tentang spesifikasi banner:
- Email: [your-email@example.com]
- GitHub: [your-github-profile]

---

**Last Updated**: January 6, 2026
