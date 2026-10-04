/* ==========================================================================
   music.js — pemutar musik mengambang: playlist, play/pause, next/prev,
   progress bar (seekable), volume, dan panel daftar lagu.
   Lagu diatur di js/config.js (playlist). Kosongkan array untuk
   menyembunyikan pemutar sepenuhnya.

   Catatan browser: autoplay dengan suara umumnya diblokir sebelum ada
   interaksi pengguna. Pemutar ini baru mulai memutar saat tombol play
   ditekan, atau saat tombol Celebrate diklik (karena itu juga "user
   gesture" yang sah di mata browser).
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, $$, pad } = BD.utils;
  const cfg = BD.config;

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + pad(s);
  }

  function init() {
    const tracks = cfg.playlist || [];
    const root = $('#musicPlayer');
    if (!root || !tracks.length) {
      if (root) root.remove(); // tidak ada lagu → sembunyikan widget sepenuhnya
      BD.music = { play() {}, isPlaying: () => false };
      return;
    }

    const audio = $('#musicAudio', root);
    const toggleBtn = $('#musicToggle', root);
    const panel = $('#musicPanel', root);
    const playBtn = $('#musicPlay', root);
    const prevBtn = $('#musicPrev', root);
    const nextBtn = $('#musicNext', root);
    const seek = $('#musicSeek', root);
    const volume = $('#musicVolume', root);
    const muteBtn = $('#musicMute', root);
    const curTimeEl = $('#musicCurrent', root);
    const durTimeEl = $('#musicDuration', root);
    const titleEl = $('#musicTitle', root);
    const artistEl = $('#musicArtist', root);
    const listBtn = $('#musicListToggle', root);
    const list = $('#musicList', root);
    const disc = $('#musicDisc', root);

    let index = 0;
    let expanded = false;
    let listOpen = false;
    let seeking = false;
    let lastVolume = cfg.music.startVolume;

    /* ---------------- Playlist ---------------- */
    function buildList() {
      list.innerHTML = '';
      tracks.forEach((track, i) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'music-list__item';
        item.setAttribute('aria-current', String(i === index));
        item.innerHTML =
          '<span class="music-list__num">' + (i + 1) + '</span>' +
          '<span class="music-list__meta">' +
          '<span class="music-list__title"></span>' +
          '<span class="music-list__artist"></span>' +
          '</span>';
        $('.music-list__title', item).textContent = track.title || 'Untitled';
        $('.music-list__artist', item).textContent = track.artist || '';
        item.addEventListener('click', () => load(i, true));
        list.appendChild(item);
      });
    }

    function markActiveInList() {
      $$('.music-list__item', list).forEach((item, i) => {
        item.setAttribute('aria-current', String(i === index));
      });
    }

    /* ---------------- Transport ---------------- */
    function load(i, autoplay) {
      index = ((i % tracks.length) + tracks.length) % tracks.length;
      const track = tracks[index];
      audio.src = track.src;
      titleEl.textContent = track.title || 'Untitled';
      artistEl.textContent = track.artist || '';
      seek.value = 0;
      curTimeEl.textContent = '0:00';
      durTimeEl.textContent = '0:00';
      markActiveInList();
      if (autoplay) play();
    }

    function play() {
      audio.play().then(setPlayingUI).catch(() => {
        // Diblokir browser (belum ada interaksi) — biarkan tetap dalam state pause, tanpa error ke user.
        setPausedUI();
      });
    }

    function pause() {
      audio.pause();
      setPausedUI();
    }

    function togglePlay() {
      if (audio.paused) play();
      else pause();
    }

    function setPlayingUI() {
      root.classList.add('is-playing');
      playBtn.setAttribute('aria-label', 'Pause');
      $('.music-play__icon--play', playBtn).hidden = true;
      $('.music-play__icon--pause', playBtn).hidden = false;
    }

    function setPausedUI() {
      root.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', 'Play');
      $('.music-play__icon--play', playBtn).hidden = false;
      $('.music-play__icon--pause', playBtn).hidden = true;
    }

    function next(autoplay = true) { load(index + 1, autoplay); }
    function prev(autoplay = true) {
      // Kalau lagu sudah berjalan >3 detik, tombol prev mengulang dari awal (perilaku umum pemutar musik)
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      load(index - 1, autoplay);
    }

    /* ---------------- Panel expand / list ---------------- */
    function setExpanded(open) {
      expanded = open;
      root.classList.toggle('is-expanded', expanded);
      toggleBtn.setAttribute('aria-expanded', String(expanded));
      if (!expanded) setListOpen(false);
    }

    function setListOpen(open) {
      listOpen = open;
      panel.classList.toggle('is-list-open', listOpen);
      listBtn.setAttribute('aria-expanded', String(listOpen));
    }

    /* ---------------- Events ---------------- */
    toggleBtn.addEventListener('click', () => setExpanded(!expanded));
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', () => next(true));
    prevBtn.addEventListener('click', () => prev(true));
    listBtn.addEventListener('click', () => setListOpen(!listOpen));

    audio.addEventListener('play', setPlayingUI);
    audio.addEventListener('pause', setPausedUI);
    audio.addEventListener('loadedmetadata', () => {
      seek.max = String(audio.duration || 0);
      durTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (seeking) return;
      seek.value = String(audio.currentTime);
      curTimeEl.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      const isLast = index === tracks.length - 1;
      if (!isLast || cfg.music.loopPlaylist) next(true);
      else setPausedUI();
    });

    seek.addEventListener('input', () => {
      seeking = true;
      curTimeEl.textContent = formatTime(Number(seek.value));
    });
    seek.addEventListener('change', () => {
      audio.currentTime = Number(seek.value);
      seeking = false;
    });

    volume.addEventListener('input', () => {
      const v = Number(volume.value);
      audio.volume = v;
      audio.muted = false;
      updateVolumeIcon(v);
    });

    function updateVolumeIcon(v) {
      muteBtn.textContent = v === 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
    }

    muteBtn.addEventListener('click', () => {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = lastVolume || 0.6;
        volume.value = String(audio.volume);
        updateVolumeIcon(audio.volume);
      } else {
        lastVolume = audio.volume;
        audio.muted = true;
        volume.value = '0';
        updateVolumeIcon(0);
      }
    });

    // Tutup panel saat klik di luar widget
    document.addEventListener('pointerdown', (e) => {
      if (expanded && !root.contains(e.target)) setExpanded(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && expanded) setExpanded(false);
    });

    /* ---------------- Setup awal ---------------- */
    buildList();
    audio.volume = cfg.music.startVolume;
    volume.value = String(cfg.music.startVolume);
    updateVolumeIcon(cfg.music.startVolume);
    load(0, false);

    BD.music = {
      play,
      pause,
      isPlaying: () => !audio.paused,
    };
  }

  BD.music = BD.music || {};
  BD.musicModule = { init };
})(window.BD);
