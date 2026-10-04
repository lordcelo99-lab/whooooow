Taruh file lagu di sini (format .mp3, .ogg, atau .wav).

Lalu daftarkan di js/config.js, pada bagian `playlist`, contoh:

  playlist: [
    { title: "Happy Birthday (Piano)", artist: "Cover", src: "assets/music/lagu-1.mp3" },
    { title: "Lagu Favorit Kalian",    artist: "Nama Artis", src: "assets/music/lagu-2.mp3" },
  ],

Catatan:
- Kosongkan array `playlist` di config.js untuk menyembunyikan pemutar musik.
- Gunakan lagu yang kamu punya haknya untuk memakai (lagu sendiri, royalty-free,
  atau berlisensi) — jangan menaruh lagu berhak cipta tanpa izin.
- Browser umumnya memblokir audio otomatis sebelum ada interaksi. Musik akan
  mulai begitu tombol "Celebrate" atau tombol play di pemutar musik ditekan.
