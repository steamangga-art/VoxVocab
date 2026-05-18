# Setup Project VoxVocab

Berikut adalah langkah-langkah untuk menjalankan project ini di lingkungan lokal Anda:

## 1. Install Dependencies
Pastikan Anda sudah menginstall Node.js (v24.x disarankan), lalu jalankan:
```bash
npm install
```

## 2. Environment Setup
Salin file `.env.example` ke `.env` dan isi variabel yang diperlukan:
```bash
cp .env.example .env
```
*Pastikan `DATABASE_URL` sudah terisi dengan benar (Supabase/Postgres).*

## 3. Database Setup (Prisma)
Setelah skema diperbarui, jalankan migrasi untuk menyinkronkan database:
```bash
npx prisma db push
```
*Jika Anda ingin menggunakan sistem migrasi penuh, gunakan `npx prisma migrate dev`.*

## 4. Seeding Data
Isi database dengan data awal (akun guru, dsb):
```bash
npx prisma db seed
```
*Pastikan konfigurasi `seed` sudah merujuk ke file `prisma/seed.ts` di dalam `package.json`.*

## 5. System Settings
Setelah database siap, pastikan konfigurasi sistem dasar sudah ada (dapat diatur melalui database secara langsung):
- `CURRENT_ACADEMIC_YEAR`: misal `2025/2026`
- `WEEKLY_VOCAB_GOAL`: misal `7`

## 7. Database Reset
Jika Anda perlu membersihkan database dan memulai dari awal (semua data akan dihapus):
```bash
npx prisma migrate reset
```
Perintah ini akan menghapus isi database, menjalankan ulang migrasi, dan mengeksekusi seed script secara otomatis.
