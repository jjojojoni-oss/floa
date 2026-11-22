# Seni lukis floa

Semua ilustrasi floa **dilukis** (gaya gouache: sapuan kuas terlihat, ada relief cat, tepi tak rata, bayangan antar lapisan), bukan vektor datar. Lukisannya dibuat prosedural lalu dirender sekali jadi WebP, jadi di HP pengguna tidak ada filter berat yang jalan.

```bash
node art/render.js            # render semua sprite ke art/out/*.png
node art/render.js lilin      # hanya sprite yang namanya mengandung "lilin"
python3 art/webp.py lilin     # ubah jadi public/art/*.webp (cetak ukuran berkas)
```

Butuh Playwright + Chromium (alat desain saja; situsnya tidak membutuhkannya).

## Cara kerja

- `engine.js` jalan di browser dan menyediakan `window.FLOA`:
  - `painted(parent, d, { base, n, stroke, R, filter, cast, transform })` — bidang `d` diisi warna dasar lalu `n` sapuan kuas dari `stroke()`.
  - `petal(...)`, `leaf(...)` — kelopak/daun siap pakai. `wash(...)` — bidang luas (langit, meja, kain). `dabs(...)` — totol cat.
  - `linGrad`, `radGrad`, `mix`, `jitter`, `ramp`, `el`.
  - Filter: `impasto` (serat kuas tegak), `impastoH` (mendatar), `impastoFine` (halus, untuk kertas/benda kecil), `canvas` (bidang luas), `cast`/`castBig` (bayangan jatuh), `soft`/`softer`/`blur2`/`mist` (blur).
- `sprites/*.js` mendaftarkan sprite: `F.sprites['nama'] = { w, h, seed, draw(svg, R) {...} }`. Semua dirender 2×.
- Pustaka bersama: `F.flora` (kamboja, kembang sepatu, dahlia, kenikir, aster, lila, melati, kuncup, daun, pakis) dan `F.latar` (`sky`, `clouds`, `garden`).

## Aturan gaya

1. **Cahaya dari kiri-atas.** Sisi kanan-bawah lebih gelap; bayangan berwarna cokelat hangat (`#3a1d12`), bukan hitam.
2. **Tiap benda = sprite sendiri** dengan latar transparan, supaya bisa digerakkan hanya dengan `transform`/`opacity` di CSS. Benda yang berlapis (depan/belakang) memakai ukuran kanvas yang sama supaya pas saat ditumpuk.
3. **Tanpa bidang warna polos.** Setiap permukaan punya variasi warna dari sapuan kuas dan gradasi terang-gelap.
4. **Latar**: pakai `bg-pagi`, `bg-senja`, `bg-malam`, atau lukis `bg-<template>` sendiri dengan `F.latar`/`wash`.
5. **Sentuhan floa**: flora tropis dan motif kawung samar di kertas/kain. Jangan meniru karya situs lain.
6. **Kartu katalog**: satu lukisan utuh `cover-<id>` berukuran 480×600 (tanpa teks), ditampilkan lewat `<CoverImage id>`.
7. **Anggaran**: total WebP satu template sekitar 450 KB atau kurang. Kanvas sprite secukupnya (2× ukuran tampil di layar 390px).

## Di sisi template (src/templates)

- `<Stage backdrop="pagi|senja|malam|/art/bg-x.webp">` memasang latar lukisan, butiran kertas, dan vignette.
- `<Sprite name="…">` untuk tiap potong lukisan; `<Petals>` untuk kelopak yang melayang; `useArtReady([...])` supaya adegan muncul utuh.
- Kertas: `composes: paper from '../kit/kit.module.css';` (warna lewat `--paper`).
- Huruf: judul `var(--font-serif)`, tulisan pribadi (catatan, "dari …", caption) `var(--font-hand)` ukuran 1.4em ke atas, label antarmuka `var(--font-ui)`.
- Contoh lengkap: `sprites/30-buket.js` + `src/templates/buket/`.
