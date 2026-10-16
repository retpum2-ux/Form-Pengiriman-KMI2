# PANDUAN KONEKSI GOOGLE SPREADSHEET (GITHUB & VERCEL)

Aplikasi **Form Pengiriman KMI2 (PT KMI Wire and Cable Tbk)** mengirim data secara otomatis ke Google Spreadsheet melalui backend.
Data yang dikirimkan **HANYA** 5 kolom sesuai permintaan:
`Tanggal`, `Nama Barang`, `Qty`, `Kuantitas`, `Keterangan`

---

## 1. Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com) lalu buat Spreadsheet Baru.
2. Beri nama file, misalnya: **Data Pengiriman KMI2**.
3. Pada baris 1 (Header), isi kolom A sampai E persis seperti ini:
   - Kolom A: `Tanggal`
   - Kolom B: `Nama Barang`
   - Kolom C: `Qty`
   - Kolom D: `Kuantitas`
   - Kolom E: `Keterangan`

---

## 2. Pasang Google Apps Script (Web App)
1. Di Google Spreadsheet Anda, klik menu **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus semua kode yang ada di editor, lalu salin dan tempel kode berikut:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = JSON.parse(e.postData.contents);
    
    // Pastikan baris header sudah ada jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tanggal", "Nama Barang", "Qty", "Kuantitas", "Keterangan"]);
    }
    
    var rows = contents.rows;
    if (rows && rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Hanya 5 kolom sesuai spesifikasi
        sheet.appendRow([
          row["Tanggal"] || "",
          row["Nama Barang"] || "",
          row["Qty"] || 0,
          row["Kuantitas"] || "",
          row["Keterangan"] || ""
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Data berhasil disimpan ke Google Spreadsheet",
      "rowsCount": rows ? rows.length : 0
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "active",
    "service": "KMI2 Google Spreadsheet Webhook API"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Klik tombol **Simpan (Save)** (ikon disket).
4. Klik tombol **Terapkan (Deploy)** di pojok kanan atas > Pilih **Penerapan Baru (New Deployment)**.
5. Pada ikon gerigi (Select type), pilih **Aplikasi Web (Web app)**.
6. Konfigurasi:
   - **Deskripsi**: Webhook Pengiriman KMI2
   - **Jalankan sebagai (Execute as)**: **Saya (email Anda)**
   - **Yang memiliki akses (Who has access)**: **Siapa saja (Anyone)** *(Penting agar backend bisa mengirim tanpa login manual)*
7. Klik **Terapkan (Deploy)**.
8. Berikan izin akses (Review Permissions > pilih akun Google > Advanced > Go to (unsafe) > Allow).
9. Salin **URL Aplikasi Web (Web App URL)** yang berakhiran `/exec`.
   Contoh format:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 3. Cara Mengatur di Aplikasi Ini Langsung
1. Buka aplikasi Form Pengiriman KMI2.
2. Klik tombol **Pengaturan Google Sheets** (ikon spreadsheet di kanan atas).
3. Masukkan Web App URL yang Anda salin.
4. Klik **Tes & Simpan URL**.
5. Selesai! Setiap kali Anda klik **SIMPAN**, data akan otomatis terkirim dan bertambah ke Google Spreadsheet Anda.

---

## 4. Cara Deploy ke GitHub dan Vercel
Saat Anda mengupload project ini ke GitHub dan menghubungkannya ke Vercel:

1. **Upload ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Form Pengiriman KMI2"
   git branch -M main
   git remote add origin https://github.com/username-anda/form-pengiriman-kmi2.git
   git push -u origin main
   ```

2. **Deploy di Vercel:**
   - Masuk ke [vercel.com](https://vercel.com) dan klik **Add New Project**.
   - Pilih repository GitHub Anda.
   - Buka bagian **Environment Variables**:
     - Key: `GOOGLE_SHEET_WEBHOOK_URL`
     - Value: Tempel URL Apps Script Anda (`https://script.google.com/macros/s/.../exec`)
   - Klik **Deploy**.

3. **Backend Serverless di Vercel:**
   Folder `/api/submit-sheet.ts` sudah siap secara otomatis menjadi serverless function Vercel di `/api/submit-sheet`. Backend akan meneruskan data ke Google Spreadsheet secara aman tanpa mengekspos credential ke pengunjung web!
