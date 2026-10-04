/* ==========================================================================
   config.js — SEMUA yang perlu kamu ganti ada di file ini ✏️
   ========================================================================== */
window.BD = window.BD || {};

BD.config = {
  /* Nama yang tampil di hero, surat, dan footer */
  name: "Hurin'in Sophia Khairunnisa",

  /* Tanggal lahir — format YYYY-MM-DD.
     Umur, zodiak, hari lahir, dan countdown dihitung otomatis dari sini. */
  birthDate: "2008-10-06",

  /* (Opsional) Paksa countdown menuju tanggal & jam tertentu, contoh: "2026-12-25T00:00:00".
     Biarkan null supaya countdown otomatis menuju ulang tahun berikutnya. */
  countdownTarget: null,

  /* Format tanggal & nama hari. "en-GB" → "14 October 2002" / "Monday"
     Ganti ke "id-ID" untuk "14 Oktober 2002" / "Senin". */
  locale: "en-GB",

  /* Teks di kartu "Birthday Mood" */
  mood: "Selamat Ulang Tahunnn",

  /* Pesan utama (efek mengetik). Gunakan \n untuk baris baru. */
  message:
    "Happy Birthday! Wishing you a super chill day and an awesome year ahead. Keep being amazing!",

  /* Tanda tangan di bawah surat */
  signature: "Dengan sadar,\npria sangen🙏",

  /* Pesan rahasia yang muncul setelah kado dibuka */
  secretMessage: {
    title: "sedikit ucapan dan doa",
    text:
      "Semoga hal baik selalu beriringan denganmu, semoga semesta senantiasa berpihak padamu, semoga jalan mu untuk mencapai masa depan cerah dipermudah" +
      "teruslah tumbuh teruslah, melangkah dan berbahagialah, i will always support u from afar",
  },

  /* Kecepatan mengetik pesan (milidetik per huruf). Lebih kecil = lebih cepat. */
  typingSpeed: 30,

  /* Foto yang sudah tampil di galeri sejak awal.
     Taruh file di folder assets/gallery/ lalu daftarkan di sini.
     Contoh: { src: "assets/gallery/01.jpg", caption: "Liburan pertama" } */
  galleryImages: [
    { src: "assets/gallery/01.jpg", caption: "momen lucuh" },
    { src: "assets/gallery/02.jpg", caption: "for" },
    { src: "assets/gallery/03.jpg", caption: "for" },
    { src: "assets/gallery/04.jpg", caption: "for" },
    { src: "assets/gallery/005.jpg", caption:"fokuss ajalahh" },
    
  ],

  /* Warna confetti & balon */
  confettiColors: ["#E23A6B", "#FFD84A", "#A9E8CF", "#B8A6FF", "#FFC4D7", "#FF9F6B"],

  /* ------------------------------------------------------------------ *
   *  MUSIC PLAYLIST 🎵
   *  Taruh file lagu (mp3/ogg/wav) di folder assets/music/ lalu
   *  daftarkan di bawah ini. Boleh 1 lagu atau banyak (playlist).
   *  Kosongkan array untuk menyembunyikan pemutar musik sepenuhnya.
   *  Contoh:
   *  { title: "Happy Birthday (Piano)", artist: "Cover", src: "assets/music/lagu-1.mp3" },
   * ------------------------------------------------------------------ */
  playlist: [
    { title: "Lihat Dengar Rasakan", artist: "Sheila on 7", src: "assets/music/lagu-1.mp3" },
    { title: "Adadeh 2", artist: "Sal Priadi", src: "assets/music/lagu-2.mp3" },
  ],

  music: {
    startVolume: 0.6,      // volume awal, 0.0–1.0
    loopPlaylist: true,    // lanjut ke lagu pertama setelah lagu terakhir selesai
    autoplayOnCelebrate: true, // coba mulai musik otomatis saat tombol Celebrate diklik
  },
};
