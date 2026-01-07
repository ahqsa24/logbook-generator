# Tutorial Images Specifications

This folder contains images/screenshots for the IPB Logbook Generator tutorial modal.

---

## Image Specifications

### Resolution & Size Requirements

All images should follow these specifications:

| Specification | Value |
|--------------|-------|
| **Resolution** | **1280 x 720 pixels** (16:9 ratio) |
| **Format** | PNG (recommended) or JPG |
| **File Size** | Maximum 300KB per image |
| **Color Mode** | RGB |
| **DPI** | 72 DPI (web standard) |

---

## Required Images

### 1. `welcome.png`
- **Resolution:** 1280 x 720px
- **Content:** Main page overview or welcome illustration
- **What to show:**
  - Application landing page
  - Highlight main features
  - Clean, professional look
- **Recommended:** Light mode screenshot

### 2. `step-1-auth.png`
- **Resolution:** 1280 x 720px
- **Content:** Step 1 - Authentication section
- **What to show:**
  - Manual login form (NIM & Password fields)
  - Paste cookies form
  - Both authentication methods visible
  - Clear labels and buttons
- **Recommended:** Crop to focus on authentication area

### 3. `step-2-upload.png`
- **Resolution:** 1280 x 720px
- **Content:** Step 2 - File upload section
- **What to show:**
  - File upload drag & drop area
  - Supported file formats indicator
  - Upload button
  - Optional: Preview of uploaded data
- **Recommended:** Show the upload interface clearly

### 4. `step-3-review.png`
- **Resolution:** 1280 x 720px (or wider if needed for table)
- **Content:** Step 3 - Review & Submit section
- **What to show:**
  - Table with parsed entries
  - Edit, Delete, Add Entry buttons visible
  - Submit to IPB Portal button
  - Sample data in the table
- **Recommended:** May use wider resolution (1920x1080) if table is wide

### 5. `additional-features.png`
- **Resolution:** 1280 x 720px
- **Content:** Additional features showcase
- **What to show:**
  - Download dropdown (CSV, XLSX, PDF)
  - Submission results section
  - Dark mode toggle
  - Can be a collage of multiple features
- **Recommended:** Combine multiple screenshots if needed

### 6. `help.png`
- **Resolution:** 1280 x 720px
- **Content:** Help/tutorial access illustration
- **What to show:**
  - Tutorial button (?) in top-right corner
  - Highlight the button location
  - Optional: Simple help icon or illustration
- **Recommended:** Simple, clear visual

---

## How to Prepare Images

### Taking Screenshots

1. **Browser Setup:**
   - Use Chrome or Edge browser
   - Set zoom level to 100%
   - Hide browser extensions/toolbars
   - Use light mode for consistency

2. **Window Size:**
   - Set browser window to 1280px width minimum
   - Use browser DevTools to set exact dimensions if needed

3. **Capture:**
   - Use Windows Snipping Tool (Win + Shift + S)
   - Or use browser extensions like "Awesome Screenshot"
   - Capture the relevant section only

### Image Optimization

After taking screenshots, optimize them:

1. **Resize to 1280x720:**
   - Use tools like:
     - **Paint.NET** (free)
     - **GIMP** (free)
     - **Photoshop** (paid)
     - **Online:** [Squoosh.app](https://squoosh.app)

2. **Compress:**
   - Use [TinyPNG.com](https://tinypng.com) for PNG files
   - Or [Squoosh.app](https://squoosh.app) for more control
   - Target: Under 300KB per image

3. **Save:**
   - Format: PNG-8 or PNG-24 (for transparency)
   - Or JPG with 85-90% quality
   - Save to this folder with exact filenames

---

## File Naming

Use **exact** filenames as specified:

```
welcome.png
step-1-auth.png
step-2-upload.png
step-3-review.png
additional-features.png
help.png
```

**Important:** Filenames are case-sensitive and must match exactly!

---

## Testing Images

After adding images:

1. Place images in `public/tutorial/` folder
2. Restart dev server if needed
3. Open tutorial modal in the app
4. Navigate through all 6 steps
5. Verify images load correctly
6. Check image quality and clarity

---

## Fallback Behavior

If images are not available or fail to load:
- Tutorial will still function normally
- Only text content will be displayed
- No error messages will appear
- Images are **optional** but **recommended**

---

## Quick Reference

```
Folder: public/tutorial/
Resolution: 1280 x 720 pixels
Format: PNG or JPG
Max Size: 300KB per image
Total Images: 6
```

---

## Tools & Resources

### Free Screenshot Tools
- **Windows:** Snipping Tool (Win + Shift + S)
- **Browser Extension:** Awesome Screenshot
- **Full Page:** GoFullPage (Chrome extension)

### Free Image Editors
- **Paint.NET:** https://www.getpaint.net
- **GIMP:** https://www.gimp.org
- **Photopea:** https://www.photopea.com (online)

### Compression Tools
- **TinyPNG:** https://tinypng.com
- **Squoosh:** https://squoosh.app
- **ImageOptim:** https://imageoptim.com (Mac)

---

**Last Updated:** January 7, 2026
