# Ad Banner System - Quick Reference

## 🎯 Fitur Banner

AdBanner mendukung 2 jenis banner:
1. **Text-based Banner** - Banner dengan teks, icon, dan button (seperti GitHub banner)
2. **Image-based Banner** - Banner dengan gambar/poster untuk media partner

---

## 📸 Image Banner - Quick Start

### Untuk Client/Media Partner:

**Ukuran yang Harus Disiapkan:**

| Device  | Ukuran        | Ratio | Max Size |
|---------|---------------|-------|----------|
| Desktop | 1200x900px    | 4:3   | 500KB    |
| Mobile  | 600x800px     | 3:4   | 300KB    |

**Format:** PNG, WebP, atau JPG

### Cara Menambahkan Banner Client:

1. **Simpan gambar** di `public/banners/`:
   ```
   public/banners/partner-desktop.png
   public/banners/partner-mobile.png
   ```

2. **Edit `AdBanner.tsx`**, tambahkan di array `banners`:
   ```typescript
   {
       id: 2,
       type: 'image',
       imageUrl: '/banners/partner-desktop.png',
       imageMobileUrl: '/banners/partner-mobile.png',
       imageAlt: 'Partner Name',
       clickUrl: 'https://partner-website.com',
   }
   ```

3. **Test** - Clear session storage dan reload:
   ```javascript
   sessionStorage.removeItem('hasSeenAdBanner');
   ```

---

## 🔄 Banner Rotation

Banner bergantian **setiap jam** otomatis:

### **Dengan 2 Banner (Saat Ini):**
- **Jam Genap** (0, 2, 4, 6, ..., 22) → Banner 1 (Media Partner)
- **Jam Ganjil** (1, 3, 5, 7, ..., 23) → Banner 2 (GitHub Terminal)

### **Dengan 3 Banner:**
- **Jam 0, 3, 6, 9, 12, 15, 18, 21** → Banner 1
- **Jam 1, 4, 7, 10, 13, 16, 19, 22** → Banner 2
- **Jam 2, 5, 8, 11, 14, 17, 20, 23** → Banner 3

### **Dengan 4 Banner:**
- Berulang setiap 4 jam (0→1→2→3→0→...)

**Formula:** `Banner Index = Current Hour % Total Banners`

📚 **Lihat detail lengkap:** `docs/BANNER_ROTATION.md`

---

## 📱 Responsive Design

✅ **Desktop**: Landscape 4:3 (max-width: 768px)  
✅ **Mobile**: Portrait 3:4 (full-width dengan padding)  
✅ **Auto-crop**: Gambar otomatis di-crop sesuai aspect ratio  
✅ **Click-through**: Klik gambar → buka link partner

---

## 📚 Dokumentasi Lengkap

Lihat: `docs/MEDIA_PARTNER_GUIDELINES.md`

---

## 🎨 Contoh Banner Config

```typescript
const banners = [
    // Text banner (GitHub style)
    {
        id: 1,
        type: 'text',
        title: 'Terminal Version Available',
        // ... other text config
    },
    // Image banner (Media Partner)
    {
        id: 2,
        type: 'image',
        imageUrl: '/banners/partner-desktop.png',
        imageMobileUrl: '/banners/partner-mobile.png',
        imageAlt: 'Partner Advertisement',
        clickUrl: 'https://partner.com',
    },
];
```

---

**Created**: January 6, 2026
