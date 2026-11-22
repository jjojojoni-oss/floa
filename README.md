# floa

Kado digital interaktif yang dibuka dari HP. Pengunjung memilih template, mencoba demonya, mengganti isi, membayar lewat QRIS, dan langsung mendapat link `floa.site/<alamat>` untuk dikirim.

Tanpa akun dan tanpa login: draf dan daftar "Kado saya" disimpan di browser pembuatnya.

## Alur

1. `/` — katalog: semua template langsung terlihat, bisa disaring per momen.
2. `/demo/<template>` — demo yang bisa dimainkan, persis seperti yang dilihat penerima.
3. `/buat/<template>` — editor. Semua kolom sudah terisi contoh, dengan pratinjau langsung.
4. Tombol **Terbitkan** membuka satu sheet: alamat link → paket → QRIS → kado terbit, lengkap dengan tombol salin, WhatsApp, dan unduh QR.
5. `/<alamat>` — halaman kado untuk penerima.
6. `/kado-saya` — daftar kado di perangkat ini: salin link, ubah isi, lanjut bayar.

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Tanpa konfigurasi apa pun, data disimpan di folder `.data/` dan pembayaran berjalan dalam mode simulasi.

## Konfigurasi produksi

Salin `.env.example` dan isi nilainya (di Vercel: Project → Settings → Environment Variables).

| Variabel | Untuk apa |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Alamat situs, mis. `https://floa.site` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database kado + penyimpanan foto |
| `PAYMENT_PROVIDER` | `midtrans` untuk QRIS sungguhan, `demo` untuk simulasi |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION` | Kunci Midtrans; `MIDTRANS_IS_PRODUCTION=true` untuk produksi |

### Supabase

Jalankan `supabase/schema.sql` sekali di SQL Editor. Skrip itu membuat tabel `gifts` (RLS aktif tanpa policy, jadi hanya server yang bisa mengaksesnya lewat service role key) dan bucket publik `kado` untuk foto.

### Pembayaran

Pembayaran berada di balik satu antarmuka (`src/lib/payment/types.ts`), jadi gateway bisa diganti tanpa menyentuh halaman.

- **demo** — QR tiruan dengan tombol "Simulasikan pembayaran berhasil". Tidak ada uang yang berpindah.
- **midtrans** — Core API metode QRIS. Isi *Payment Notification URL* di dashboard Midtrans dengan `https://<domain>/api/pay/midtrans`. Adaptor ini ditulis mengikuti dokumentasi Midtrans dan **belum diuji dengan akun sungguhan**: coba dulu di sandbox.

Di produksi, kalau `PAYMENT_PROVIDER` kosong dan tidak ada kunci Midtrans, pembuatan pesanan ditolak. Ini disengaja supaya tidak ada kado yang terbit gratis karena lupa konfigurasi.

## Yang sering diubah

- **Harga dan paket**: `src/lib/site.ts` (`PLANS`).
- **Teks halaman awal**: `src/app/page.tsx`.
- **Syarat dan privasi**: `src/app/syarat`, `src/app/privasi`.

## Gaya visual

Semua ilustrasi floa dilukis (gaya gouache), bukan vektor datar: flora tropis, langit lukisan, kertas bertekstur, motif kawung, dan tulisan tangan. Lukisannya dibuat oleh mesin lukis prosedural di `art/` lalu dirender sekali jadi WebP di `public/art/`, jadi situsnya ringan di HP. Cara kerja dan aturan gayanya ada di `art/README.md`.

## Menambah template

Tiap template adalah satu folder di `src/templates/<id>/`:

- `meta.ts` — nama, momen, warna, kolom editor, dan isi contoh.
- `index.tsx` — pengalaman interaktifnya, dibungkus `<Stage>` dan diakhiri `<Finale>` dari `src/templates/kit`.
- `Cover.tsx` — kartu katalog, cukup `<CoverImage id="…" />`.

Lukisannya ditulis di `art/sprites/<nomor>-<id>.js`, lalu:

```bash
node art/render.js <id>
python3 art/webp.py <id>
```

Daftarkan template di `registry.ts`, `covers.tsx`, dan `Player.tsx`. Semua template memakai bentuk data yang sama (`GiftData` di `types.ts`), jadi editor dan checkout tidak perlu diubah.

## Struktur

```
src/app            halaman dan API
src/components     katalog, editor, sheet checkout
src/lib            pesanan, pembayaran, penyimpanan, aturan alamat
src/templates      kit bersama + satu folder per template
art                mesin lukis + sumber lukisan (alat desain)
public/art         hasil lukisan (WebP) yang dipakai situs
supabase           skema database
```
