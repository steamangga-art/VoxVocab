# Deployment Guide: VoxVocab

Berikut adalah panduan untuk mendeploy aplikasi VoxVocab ke platform Vercel.

## 1. Persiapan
Pastikan kode Anda sudah terhubung dengan repositori GitHub, GitLab, atau Bitbucket.

## 2. Deploy ke Vercel
1. Masuk ke dashboard [Vercel](https://vercel.com).
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Hubungkan repositori Anda.
4. Pada bagian **"Configure Project"**:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build and Output Settings:** Biarkan default.

## 3. Environment Variables
Pada langkah konfigurasi, masukkan variabel lingkungan berikut di Vercel:

| Key | Description |
| :--- | :--- |
| `DATABASE_URL` | URL koneksi database PostgreSQL (Supabase/Neon) |
| `DATABASE_URL_NON_POOLING` | URL non-pooling (opsional, untuk migrasi) |
| `GEMINI_API_KEY` | API Key untuk validasi kosa kata AI |
| `NEXT_PUBLIC_API_URL` | URL API backend Anda |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase (jika digunakan) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Key publik Supabase |

## 4. Prisma Setup pada Vercel
Agar Prisma bekerja dengan benar di serverless environment Vercel, pastikan file `package.json` Anda memiliki script `postinstall`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

## 5. Deployment
Klik tombol **"Deploy"**. Vercel akan otomatis menjalankan build dan migrasi.

> **Catatan:** Jika Anda menggunakan `npx prisma db push`, pastikan Anda menjalankannya sebagai bagian dari proses *build* atau melalui *CI/CD pipeline* Anda agar skema database tetap sinkron setiap kali ada perubahan.
