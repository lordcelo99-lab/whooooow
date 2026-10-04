# 🎂 Birthday Celebration Website

Website ulang tahun statis: HTML + CSS + JavaScript vanilla, tanpa backend & tanpa build.

## Cara pakai
1. Taruh foto utama di `assets/profile.jpg` (rasio 4:5 paling pas).
2. Buka `js/config.js`, ganti `name`, `birthDate`, pesan, dan pesan rahasia.
3. Buka `index.html` di browser (klik dua kali), atau upload seluruh folder ke Netlify / GitHub Pages / Vercel.

## Yang otomatis dihitung dari `birthDate`
Umur, zodiak, hari lahir, dan tanggal countdown (menuju ulang tahun berikutnya).
Ingin menargetkan tanggal & jam tertentu? Isi `countdownTarget: "2026-12-25T00:00:00"`.

## Uji coba tanpa menunggu
- `index.html?demo=8` → countdown selesai dalam 8 detik (untuk melihat "HAPPY BIRTHDAY!" + confetti).

## Musik playlist 🎵
- Taruh file lagu (`.mp3` / `.ogg` / `.wav`) di `assets/music/`.
- Daftarkan di `js/config.js` pada bagian `playlist`, contoh:
  ```js
  playlist: [
    { title: "Happy Birthday (Piano)", artist: "Cover", src: "assets/music/lagu-1.mp3" },
    { title: "Lagu Favorit",           artist: "Nama Artis", src: "assets/music/lagu-2.mp3" },
  ],
  ```
- Kosongkan array `playlist` untuk menyembunyikan pemutar musik sepenuhnya.
- Pemutar muncul sebagai tombol bulat mengambang di pojok kanan bawah. Klik untuk membuka panel (progress bar, next/prev, volume, dan daftar lagu).
- Musik otomatis dicoba diputar saat tombol **Celebrate** diklik (klik itu dianggap browser sebagai "izin" untuk memutar audio). Atur lewat `music.autoplayOnCelebrate` di config.
- Gunakan lagu yang kamu punya haknya untuk memakai — lagu sendiri, royalty-free, atau berlisensi.

## Galeri foto
- Tombol **Add Photos** menerima banyak foto sekaligus (tanpa batas), bisa juga drag & drop.
- Foto yang diupload hanya tersimpan di browser dan hilang saat halaman di-refresh.
- Untuk foto permanen: taruh di `assets/gallery/`, lalu daftarkan di `galleryImages` pada `js/config.js`.

## Struktur
```
index.html
css/
  base.css       token warna/font, tombol, utilitas
  sections.css   gaya tiap section
  effects.css    confetti, balon, sparkle, keyframes
js/
  config.js      ← semua yang perlu kamu edit
  utils.js       helper
  effects.js     confetti / balon / sparkle
  countdown.js   hitung mundur
  birthday-chart.js  kartu info (umur, zodiak, dll)
  message.js     surat + efek mengetik
  gift.js        kotak kado + pesan rahasia
  gallery.js     galeri, upload, lightbox
  main.js        menyambungkan semuanya
assets/
  profile.jpg    ← foto utama (kamu tambahkan)
  gallery/       ← foto galeri permanen (opsional)
```

## Ganti tampilan
Warna dan font ada di bagian `:root` pada `css/base.css`.
