# SuaraKita Frontend

Frontend SuaraKita dibuat dengan React.js, Vite, React Router, Recharts, dan lucide-react. Proyek ini ditujukan untuk dijalankan menggunakan Bun dan terhubung ke REST API Express.js + SQLite.

## Fitur

- Beranda dengan pencarian, filter kategori/status/urgensi, pengurutan prioritas, pagination, label status, urgensi, dan skor prioritas.
- Detail laporan beserta foto, lokasi, dukungan warga, dan riwayat status.
- Formulir laporan dengan validasi, satu foto (JPG/PNG/WebP, maksimal 3 MB), lokasi, urgensi, dan koordinat opsional.
- Login dan pendaftaran akun warga.
- Dashboard admin dengan ringkasan statistik, grafik kategori/status, serta tabel laporan prioritas.
- Komponen reusable untuk kartu laporan, badge, pagination, dan feedback loading/kosong/error.
- Tata letak responsif untuk desktop, tablet, dan perangkat seluler.

## Prasyarat

- Bun versi stabil terbaru
- Backend SuaraKita sudah berjalan pada `http://localhost:3000`

## Menjalankan frontend

```bash
bun install
```

Salin file konfigurasi:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Kemudian jalankan:

```bash
bun run dev
```

Buka URL yang ditampilkan Vite, biasanya `http://localhost:5173`.

Build produksi:

```bash
bun run build
bun run preview
```

## Menjalankan backend

Di folder backend SuaraKita:

```bash
npm install
Copy-Item .env.example .env
npm run db:init
npm run db:seed
npm run dev
```

Pastikan `CLIENT_ORIGIN=http://localhost:5173` pada `.env` backend agar CORS mengizinkan frontend. Sesuaikan jika frontend menggunakan port lain.

Akun demo backend:

- Warga: `warga@example.com` / `WargaDemo123!`
- Admin: `admin@example.com` / `AdminDemo123!`

## Kontrak API yang digunakan

Prefix API default: `/api/v1`.

- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`
- `GET /categories`
- `GET /reports?q=&category_id=&status=&urgency=&sort=priority&order=desc&page=1&limit=9`
- `POST /reports` (`multipart/form-data`, foto di field `photo`)
- `GET /reports/:id`, `GET /reports/:id/history`, `GET /reports/:id/photo`
- `POST /reports/:id/supports`
- `PATCH /reports/:id/status`, `PATCH /reports/:id/urgency`
- `GET /dashboard/summary`, `/dashboard/by-category`, `/dashboard/by-status`, `/dashboard/priority?limit=5`

Respons backend dibaca menggunakan format `{ data: ... }` dan untuk daftar laporan `{ data: [...], pagination: {...} }`.

## Token autentikasi

Karena backend yang tersedia memakai JWT melalui header `Authorization: Bearer <token>`, frontend menyimpan token di `sessionStorage`, bukan `localStorage`. Token dihapus saat logout atau ketika API mengembalikan 401. `sessionStorage` membatasi persistensi sampai sesi tab berakhir, tetapi tetap dapat diakses JavaScript dan bukan perlindungan penuh terhadap XSS. Untuk produksi, pendekatan yang lebih kuat adalah mengubah backend agar menggunakan cookie `HttpOnly`, `Secure`, dan `SameSite` serta perlindungan CSRF yang sesuai.

## Catatan

- Foto diakses dari endpoint publik `/reports/:id/photo` agar dapat ditampilkan sebagai elemen gambar biasa. Sesuaikan jika kebijakan backend nantinya mengharuskan autentikasi untuk foto.
- Pengguna baru otomatis menjadi warga; halaman dashboard hanya dapat diakses oleh admin.
- Label skor prioritas menggunakan nilai `priority_score` yang dikirim backend. Frontend tidak menghitung skor sendiri.
