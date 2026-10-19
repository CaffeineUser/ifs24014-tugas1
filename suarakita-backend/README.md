# SuaraKita Backend

REST API untuk aplikasi pelaporan masalah lingkungan, menggunakan Express.js, SQLite (`better-sqlite3`), JWT, Zod, dan Multer.

## Prasyarat

- Node.js 20 atau lebih baru
- npm

## Instalasi dan menjalankan

```bash
npm install
cp .env.example .env
```

Windows PowerShell untuk menyalin konfigurasi:

```powershell
Copy-Item .env.example .env
```

Jika PowerShell menolak menjalankan `npm.ps1` karena execution policy, gunakan shim Windows:

```powershell
npm.cmd install
```

Edit `.env`, lalu ganti `JWT_SECRET` dengan secret acak minimal 32 karakter. Contoh membuat secret dengan Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Inisialisasi database dan kategori:

```bash
npm run db:init
npm run db:seed
```

Jalankan server development:

```bash
npm run dev
```

Atau mode biasa:

```bash
npm start
```

API berjalan di `http://localhost:3000`. Tes health check: `GET http://localhost:3000/api/v1/health`.

## Akun demo

- Warga: `warga@example.com` / `WargaDemo123!`
- Admin: `admin@example.com` / `AdminDemo123!`

Akun demo hanya untuk lokal/pengembangan. Jangan gunakan kredensial ini di produksi. Seeder tidak membuat ulang akun jika email sudah ada.

## Struktur folder

```text
suarakita-backend/
├── app.js
├── server.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── scripts/
│   ├── initDb.js
│   └── seedDb.js
├── uploads/
└── src/
    ├── config/       # Koneksi SQLite
    ├── controllers/  # Request/response HTTP
    ├── middleware/   # Auth, upload, validasi, error handler
    ├── repositories/ # Akses data dan SQL terparameterisasi
    ├── routes/      # Pemetaan endpoint
    ├── services/    # Aturan bisnis dan transaksi
    ├── utils/       # Error dan skor prioritas
    └── validators/  # Skema validasi Zod
```

## Autentikasi

Gunakan header berikut untuk endpoint terlindungi:

```http
Authorization: Bearer <token>
```

Registrasi publik selalu membuat role `warga`. Role admin hanya boleh diberikan melalui proses administrasi yang dipercaya, bukan melalui request registrasi.

## Endpoint utama

Prefix: `/api/v1`

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/auth/register` | Publik |
| POST | `/auth/login` | Publik |
| POST | `/auth/logout` | Login |
| GET | `/auth/me` | Login |
| GET | `/categories` | Publik |
| POST/PATCH/DELETE | `/categories` dan `/categories/:id` | Admin |
| GET | `/reports` | Publik; query `q`, `category_id`, `status`, `urgency`, `sort`, `order`, `page`, `limit` |
| POST | `/reports` | Warga; `multipart/form-data`, foto di field `photo` |
| GET | `/reports/:id` | Publik |
| PATCH/DELETE | `/reports/:id` | Pemilik warga, hanya saat status `diajukan` |
| PATCH | `/reports/:id/status` | Admin |
| PATCH | `/reports/:id/urgency` | Admin |
| PATCH | `/reports/:id/photo` | Pemilik warga, hanya saat status `diajukan` |
| GET | `/reports/:id/history` | Publik |
| GET | `/reports/:id/photo` | Publik |
| GET | `/reports/:id/supports` | Publik |
| POST/DELETE | `/reports/:id/supports` dan `/reports/:id/supports/me` | Warga |
| GET | `/dashboard/summary` | Admin |
| GET | `/dashboard/by-category` | Admin |
| GET | `/dashboard/by-status` | Admin |
| GET | `/dashboard/priority?limit=10` | Admin |
| GET/PATCH | `/users/me` | Login |
| GET | `/users` | Admin |

## Contoh request

Login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{"email":"admin@example.com","password":"AdminDemo123!"}
```

Membuat laporan menggunakan multipart form-data: field `category_id`, `title`, `description`, `location_name`, opsional `latitude`, `longitude`, `urgency`, dan satu file gambar pada field `photo`.

Mengubah status:

```http
PATCH /api/v1/reports/1/status
Authorization: Bearer <token-admin>
Content-Type: application/json

{"status":"diverifikasi","note":"Lokasi sudah diperiksa."}
```

## Formula skor prioritas

- `U`: rendah=25, sedang=50, tinggi=75, kritis=100.
- `D = min(100, dukungan / 20 * 100)`.
- `skor = (0.6 * U) + (0.4 * D)`.

Skor dihitung ulang saat dukungan ditambahkan/dibatalkan atau urgensi diubah, dalam transaksi. Daftar laporan mendukung pengurutan skor prioritas.

## Catatan implementasi

- SQL memakai prepared statements/parameter binding. Kolom pengurutan dipilih dari allowlist, bukan dari input bebas.
- `UNIQUE(report_id, user_id)` mencegah dukungan ganda.
- Riwayat status dibuat dalam transaksi yang sama dengan perubahan status.
- Foto JPEG, PNG, atau WebP; maksimum default 3 MB. Foto disimpan di folder lokal `uploads/`; untuk deployment multi-instance, gunakan object storage.
- Logout JWT bersifat stateless: klien harus menghapus token. Token tetap berlaku hingga kedaluwarsa; untuk pencabutan langsung dibutuhkan token denylist atau mekanisme sesi.
- File foto demo pada seeder adalah placeholder, sehingga endpoint foto laporan seed akan mengembalikan 404 sampai foto nyata diunggah. Ini tidak menghalangi pembuatan laporan baru.
- Pastikan backup database dan folder uploads dilakukan bersama agar referensi foto tetap valid.
