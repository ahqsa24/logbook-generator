# How to Update Instagram Link for Media Partner Banner

## Quick Guide

Untuk menambahkan link Instagram Anda ke banner Media Partner:

### **Step 1: Buka file AdBanner.tsx**
```
components/AdBanner.tsx
```

### **Step 2: Cari banner dengan id: 2**
Cari bagian konfigurasi banner kedua (sekitar line 56-70):

```typescript
// Banner 2: Media Partner Opportunity
{
    id: 2,
    type: 'text',
    theme: 'partner',
    icon: 'megaphone',
    title: 'Become a Media Partner',
    subtitle: 'Advertise your brand to IPB students',
    description: 'Limited slots available! Reach thousands of IPB students using this logbook generator.',
    features: [
        'Targeted audience: IPB students & developers',
        'High visibility with modal banner ads',
        'Flexible banner formats (text or image)',
        'Affordable rates for students & startups'
    ],
    ctaText: 'Contact via Instagram',
    ctaLink: '', // ← UBAH DI SINI
},
```

### **Step 3: Isi ctaLink dengan link Instagram Anda**

**Format Link Instagram:**
```typescript
ctaLink: 'https://instagram.com/username',
```

**Contoh:**
```typescript
ctaLink: 'https://instagram.com/adidsadida24',
```

### **Step 4: Save & Test**
1. Save file
2. Refresh browser
3. Clear session storage jika banner tidak muncul:
   ```javascript
   sessionStorage.removeItem('hasSeenAdBanner');
   location.reload();
   ```

---

## Banner Rotation Schedule

Banner akan muncul bergantian berdasarkan waktu:

| Waktu | Banner yang Muncul |
|-------|-------------------|
| 00:00 - 07:59 | Banner 1: Terminal Version (GitHub) |
| 08:00 - 15:59 | Banner 2: Media Partner Opportunity |
| 16:00 - 23:59 | Banner 3: (jika ada) |

---

## Customization Options

Anda juga bisa mengubah:

### **1. Title & Subtitle**
```typescript
title: 'Become a Media Partner',
subtitle: 'Advertise your brand to IPB students',
```

### **2. Description**
```typescript
description: 'Limited slots available! Reach thousands of IPB students using this logbook generator.',
```

### **3. Features List**
```typescript
features: [
    'Targeted audience: IPB students & developers',
    'High visibility with modal banner ads',
    'Flexible banner formats (text or image)',
    'Affordable rates for students & startups'
],
```

### **4. Button Text**
```typescript
ctaText: 'Contact via Instagram',
```

---

## Visual Theme

Banner Media Partner menggunakan **Purple/Pink Gradient Theme**:
- Icon: Megaphone (📢) dengan gradient purple-pink
- Button: Gradient purple-pink dengan Instagram icon
- Indicator dots: Purple-pink gradient

Berbeda dengan banner GitHub yang menggunakan **Green Theme**.

---

## Testing Different Banners

Untuk test banner tertentu, ubah logic di `getBannerRotation()`:

```typescript
// Force show banner 2 (Media Partner)
const getBannerRotation = (): number => {
    return 1; // Index 1 = Banner 2
};
```

Jangan lupa kembalikan ke logic original setelah testing:
```typescript
const getBannerRotation = (): number => {
    const hour = new Date().getHours();
    return Math.floor(hour / 8) % banners.length;
};
```

---

**Last Updated**: January 6, 2026
