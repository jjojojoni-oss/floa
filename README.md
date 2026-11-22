# floa

Kado digital interaktif yang dibuka dari HP. Pengunjung memilih template, mencoba demonya, mengganti isi, membayar (QRIS dari Indonesia, kartu dari luar negeri), dan langsung mendapat link `floa.site/<alamat>` untuk dikirim.

Tanpa akun dan tanpa login: draf dan daftar "Kado saya" disimpan di browser pembuatnya.

## Alur

1. `/` — katalog: semua template langsung terlihat, bisa disaring per momen.
2. `/demo/<template>` — demo yang bisa dimainkan, persis seperti yang dilihat penerima.
3. `/buat/<template>` — editor. Semua kolom sudah terisi contoh, dengan pratinjau langsung.
4. Tombol **Terbitkan** membuka satu sheet: alamat link → cara bayar & paket → bayar → kado terbit, lengkap dengan tombol salin, WhatsApp, dan unduh QR. Pembeli dari Indonesia membayar QRIS langsung di sheet itu; pembeli luar negeri pindah ke halaman checkout Creem lalu kembali ke `/bayar/selesai`.
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
| `BORDERPAY_API_KEY`, `BORDERPAY_WEBHOOK_TOKEN` | Pembayaran dari Indonesia (QRIS, rupiah) |
| `CREEM_API_KEY`, `CREEM_PRODUCT_ID`, `CREEM_WEBHOOK_SECRET` | Pembayaran dari luar negeri (kartu, dolar AS) |
| `PAYMENT_PROVIDER` | `demo` = semua pembayaran disimulasikan; `live` (atau kosong) = BorderPay & Creem asli sesuai key yang terisi |

### Supabase

Jalankan `supabase/schema.sql` sekali di SQL Editor. Skrip itu membuat tabel `gifts` (RLS aktif tanpa policy, jadi hanya server yang bisa mengaksesnya lewat service role key) dan bucket publik `kado` untuk foto.

### Pembayaran

Dua pasar, dua gateway, di balik satu antarmuka (`src/lib/payment/types.ts`):

| Pembeli | Gateway | Cara bayar | Harga |
| --- | --- | --- | --- |
| Indonesia | BorderPay | QRIS, tampil langsung di floa | `price` (rupiah) di `src/lib/site.ts` |
| Luar negeri | Creem | kartu kredit/debit di halaman checkout Creem | `usd` (sen dolar AS) di `src/lib/site.ts` |

Pasar dipilih otomatis dari negara pengunjung (header `x-vercel-ip-country` dari Vercel; tanpa header dianggap Indonesia), dan pembeli bisa menggantinya sendiri di sheet checkout.

**BorderPay** ([dokumentasi](https://borderpay.id/docs))
1. Dashboard BorderPay → project → buat API key. `bp_test_…` untuk uji (tidak ada uang nyata, ada tombol simulasi di layar bayar), `bp_live_…` untuk asli.
2. Atur webhook project ke `https://<domain>/api/pay/borderpay`, lalu salin verification token-nya ke `BORDERPAY_WEBHOOK_TOKEN`.

**Creem** ([dokumentasi](https://docs.creem.io))
1. Buat **satu** produk sekali bayar (one-time) berharga USD di dashboard Creem, salin ID-nya (`prod_…`) ke `CREEM_PRODUCT_ID`. Harga produknya sendiri tidak dipakai: floa mengirim harga tiap paket per transaksi lewat `custom_price`.
2. Salin API key ke `CREEM_API_KEY`. Key mode uji memakai `test-api.creem.io` (kalau prefix key tidak menandainya, isi `CREEM_TEST_MODE=true`).
3. Developers → Webhooks: daftarkan `https://<domain>/api/pay/creem`, salin secret-nya ke `CREEM_WEBHOOK_SECRET`.

**Keamanan.** Isi webhook tidak pernah dipercaya mentah-mentah: token BorderPay dan tanda tangan HMAC Creem diperiksa, lalu status pembayaran (termasuk nominalnya) dicek ulang ke API gateway sebelum kado diterbitkan. Halaman kembali dari Creem juga tidak dianggap bukti bayar.

**Kalau belum dikonfigurasi.** Di lokal, pasar tanpa key memakai simulasi. Di produksi, pasar tanpa key dimatikan (tampil "Belum aktif") supaya tidak ada kado yang terbit gratis. `PAYMENT_PROVIDER=demo` memaksa simulasi untuk semua pembeli, hanya untuk mencoba alur.

**Pembayaran yang telat.** Pesanan yang belum dibayar menahan alamat kadonya sampai batas bayar dari gateway lewat (QRIS BorderPay 60 menit). Setelah itu alamatnya bisa dipakai orang lain, tetapi pesanannya tidak dihapus: kalau ternyata dibayar belakangan, kadonya tetap terbit di alamat cadangan `floa.site/<id-pesanan>`.

## Yang sering diubah

- **Harga dan paket**: `src/lib/site.ts` (`PLANS`: `price` dalam rupiah, `usd` dalam sen dolar AS).
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
