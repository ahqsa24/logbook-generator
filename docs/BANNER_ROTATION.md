# Banner Rotation Schedule

## 🔄 Rotation Logic

Banner bergantian **setiap jam** berdasarkan jumlah banner yang tersedia.

### **Formula:**
```
Banner Index = Current Hour % Total Banners
```

---

## 📅 Rotation Schedule

### **Dengan 2 Banner (Saat Ini):**

| Jam | Banner yang Muncul | Keterangan |
|-----|-------------------|------------|
| **00:00** | Banner 1 (Media Partner) | Jam genap |
| **01:00** | Banner 2 (GitHub Terminal) | Jam ganjil |
| **02:00** | Banner 1 (Media Partner) | Jam genap |
| **03:00** | Banner 2 (GitHub Terminal) | Jam ganjil |
| **04:00** | Banner 1 (Media Partner) | Jam genap |
| **05:00** | Banner 2 (GitHub Terminal) | Jam ganjil |
| ... | ... | ... |
| **22:00** | Banner 1 (Media Partner) | Jam genap |
| **23:00** | Banner 2 (GitHub Terminal) | Jam ganjil |

**Pola:** Jam **genap** = Banner 1, Jam **ganjil** = Banner 2

---

### **Dengan 3 Banner (Jika Ditambahkan):**

| Jam | Banner yang Muncul | Pattern |
|-----|-------------------|---------|
| **00:00** | Banner 1 | 0 % 3 = 0 |
| **01:00** | Banner 2 | 1 % 3 = 1 |
| **02:00** | Banner 3 | 2 % 3 = 2 |
| **03:00** | Banner 1 | 3 % 3 = 0 |
| **04:00** | Banner 2 | 4 % 3 = 1 |
| **05:00** | Banner 3 | 5 % 3 = 2 |
| **06:00** | Banner 1 | 6 % 3 = 0 |
| ... | ... | ... |

**Pola:** Berulang setiap **3 jam**

---

### **Dengan 4 Banner (Jika Ditambahkan):**

| Jam | Banner yang Muncul | Pattern |
|-----|-------------------|---------|
| **00:00** | Banner 1 | 0 % 4 = 0 |
| **01:00** | Banner 2 | 1 % 4 = 1 |
| **02:00** | Banner 3 | 2 % 4 = 2 |
| **03:00** | Banner 4 | 3 % 4 = 3 |
| **04:00** | Banner 1 | 4 % 4 = 0 |
| **05:00** | Banner 2 | 5 % 4 = 1 |
| **06:00** | Banner 3 | 6 % 4 = 2 |
| **07:00** | Banner 4 | 7 % 4 = 3 |
| ... | ... | ... |

**Pola:** Berulang setiap **4 jam**

---

## 🎯 Keuntungan Sistem Ini:

✅ **Fleksibel**: Otomatis menyesuaikan dengan jumlah banner  
✅ **Adil**: Setiap banner mendapat exposure yang sama  
✅ **Predictable**: Mudah diprediksi banner mana yang muncul  
✅ **Scalable**: Tinggal tambah banner, rotation otomatis adjust

---

## 🧪 Testing Banner Tertentu

### **Cara 1: Tunggu Jam yang Sesuai**
Lihat tabel di atas untuk mengetahui jam berapa banner muncul.

### **Cara 2: Force Show Banner Tertentu (Development)**
Edit `getBannerRotation()` di `AdBanner.tsx`:

```typescript
// Force show Banner 1 (Media Partner)
const getBannerRotation = (): number => {
    return 0; // Index 0 = Banner 1
};

// Force show Banner 2 (GitHub)
const getBannerRotation = (): number => {
    return 1; // Index 1 = Banner 2
};
```

**⚠️ Jangan lupa kembalikan ke logic original setelah testing!**

### **Cara 3: Clear Session Storage**
Banner hanya muncul sekali per session. Untuk test lagi:

```javascript
// Di browser console:
sessionStorage.removeItem('hasSeenAdBanner');
location.reload();
```

---

## 📊 Current Banner Configuration

### **Banner 1 (id: 1)** - Media Partner Opportunity
- **Theme**: Purple/Pink Gradient
- **Icon**: Megaphone 📢
- **Target**: Potential advertisers
- **Jam**: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22 (GENAP)

### **Banner 2 (id: 2)** - GitHub Terminal Version
- **Theme**: GitHub Green
- **Icon**: GitHub logo
- **Target**: Developers
- **Jam**: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23 (GANJIL)

---

## 🔧 Menambahkan Banner Baru

Untuk menambahkan banner ketiga, keempat, dst:

1. **Tambahkan konfigurasi** di array `banners` di `AdBanner.tsx`
2. **Rotation otomatis adjust** - tidak perlu ubah logic
3. **Banner akan muncul** sesuai pola modulo

**Contoh menambahkan Banner 3:**
```typescript
const banners: BannerConfig[] = [
    { id: 1, ... }, // Banner 1
    { id: 2, ... }, // Banner 2
    { id: 3, ... }, // Banner 3 (NEW)
];
```

**Hasil:**
- Banner 1: Jam 0, 3, 6, 9, 12, 15, 18, 21
- Banner 2: Jam 1, 4, 7, 10, 13, 16, 19, 22
- Banner 3: Jam 2, 5, 8, 11, 14, 17, 20, 23

---

## 📈 Analytics Tracking

Untuk track performa banner per jam:

1. Tambahkan UTM parameters dengan hour:
   ```typescript
   const hour = new Date().getHours();
   ctaLink: `https://instagram.com/username?utm_source=logbook&utm_hour=${hour}`
   ```

2. Monitor di analytics untuk lihat jam mana yang paling efektif

---

**Last Updated**: January 7, 2026
