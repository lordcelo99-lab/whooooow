/* ==========================================================================
   main.js — menyambungkan semuanya: hero, tombol Celebrate, animasi muncul, parallax
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, $$, prefersReducedMotion, wait } = BD.utils;
  const cfg = BD.config;

  /* Isi nama & judul halaman dari config */
  function bindConfig() {
    $$('[data-bind="name"]').forEach((el) => (el.textContent = cfg.name));
    document.title = `Happy Birthday, ${cfg.name}! 🎉`;
  }

  /* Bila assets/profile.jpg belum ada, tampilkan placeholder yang manis */
  function heroPhoto() {
    const img = $('#heroPhoto');
    const frame = $('#photoFrame');
    if (!img || !frame) return;

    const markEmpty = () => frame.classList.add('is-empty');
    if (img.complete && img.naturalWidth === 0) markEmpty();
    img.addEventListener('error', markEmpty);
    img.addEventListener('load', () => frame.classList.remove('is-empty'));

    // Klik foto → sparkle kecil
    frame.addEventListener('click', (e) => {
      BD.effects.sparkles.burst(e.clientX, e.clientY, { count: 12, radius: 80 });
    });
  }

  /* Tombol Celebrate */
  function celebrate() {
    const button = $('#celebrateBtn');
    if (!button) return;
    button.addEventListener('click', async () => {
      BD.effects.celebrate(button);
      if (cfg.music.autoplayOnCelebrate && BD.music && !BD.music.isPlaying()) {
        BD.music.play(); // klik tombol ini adalah "user gesture" yang sah, jadi browser mengizinkan audio mulai
      }
      await wait(prefersReducedMotion() ? 0 : 1100);
      $('#birthday').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* Elemen ".pop" muncul seperti stiker yang ditempel saat masuk layar */
  function popIn() {
    const els = $$('.pop');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  /* Parallax halus di hero (hanya desktop dengan mouse) */
  function parallax() {
    const hero = $('#home');
    if (!hero || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        frame = 0;
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--px', 0);
      hero.style.setProperty('--py', 0);
    });
  }

  function start() {
    bindConfig();
    heroPhoto();
    celebrate();
    popIn();
    parallax();

    BD.countdown.init();
    BD.chart.init();
    BD.message.init();
    BD.gift.init();
    BD.gallery.init();
    BD.musicModule.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.BD);
