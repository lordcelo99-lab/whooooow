/* ==========================================================================
   birthday-chart.js — mengisi kartu Birthday / Age / Zodiac / Born On / Mood
   Semua dihitung otomatis dari birthDate di js/config.js
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, parseLocalDate, prefersReducedMotion, whenVisible } = BD.utils;
  const cfg = BD.config;

  /* Urutan tanda zodiak; index [bulan-1] = batas tanggal terakhir tanda pertama di bulan itu */
  const SIGNS = [
    ['Capricorn', '♑'], ['Aquarius', '♒'], ['Pisces', '♓'], ['Aries', '♈'],
    ['Taurus', '♉'], ['Gemini', '♊'], ['Cancer', '♋'], ['Leo', '♌'],
    ['Virgo', '♍'], ['Libra', '♎'], ['Scorpio', '♏'], ['Sagittarius', '♐'],
    ['Capricorn', '♑'],
  ];
  const CUTOFF = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];

  function getZodiac(month, day) {
    const index = day <= CUTOFF[month - 1] ? month - 1 : month;
    return { name: SIGNS[index][0], symbol: SIGNS[index][1] + '\uFE0F' };
  }

  function getAge(birth, now = new Date()) {
    let age = now.getFullYear() - birth.getFullYear();
    const hadBirthday =
      now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!hadBirthday) age -= 1;
    return Math.max(age, 0);
  }

  function countUp(el, to, duration = 1100) {
    if (prefersReducedMotion() || to === 0) {
      el.textContent = to;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function init() {
    const birth = parseLocalDate(cfg.birthDate);
    if (isNaN(birth)) {
      console.warn('[birthday] birthDate tidak valid. Gunakan format YYYY-MM-DD di js/config.js');
      return;
    }

    const set = (field, value) => {
      const el = $(`[data-field="${field}"]`);
      if (el) el.textContent = value;
    };

    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());
    const age = getAge(birth);

    set('birthDate', birth.toLocaleDateString(cfg.locale, { day: 'numeric', month: 'long', year: 'numeric' }));
    set('zodiac', zodiac.name);
    set('zodiacIcon', zodiac.symbol);
    set('bornOn', birth.toLocaleDateString(cfg.locale, { weekday: 'long' }));
    set('mood', cfg.mood);

    const ageEl = $('[data-field="age"]');
    if (ageEl) {
      ageEl.textContent = '0';
      whenVisible($('#ageCard'), () => countUp(ageEl, age), 0.5);
    }
  }

  BD.chart = { init, getZodiac, getAge };
})(window.BD);
