/* ==========================================================================
   countdown.js — hitung mundur menuju ulang tahun
   Tanggal diatur di js/config.js (birthDate / countdownTarget).
   Tips uji coba: buka index.html?demo=8 → countdown selesai dalam 8 detik.
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, pad, parseLocalDate, whenVisible } = BD.utils;
  const cfg = BD.config;

  /* Tentukan target: ulang tahun berikutnya (atau hari ini bila hari-H) */
  function resolveTarget(now = new Date()) {
    const demo = Number(new URLSearchParams(window.location.search).get('demo'));
    if (demo > 0) return new Date(now.getTime() + demo * 1000);

    if (cfg.countdownTarget) {
      const custom = new Date(cfg.countdownTarget);
      if (!isNaN(custom)) return custom;
    }

    const birth = parseLocalDate(cfg.birthDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (target < today) {
      target = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    return target; // bila hari ini ulang tahun → target = 00:00 hari ini → langsung "selesai"
  }

  function init() {
    const section = $('#birthday');
    const grid = $('#countdown');
    const done = $('#countdownDone');
    const caption = $('#countdownCaption');
    if (!grid) return;

    const units = {
      days: $('[data-unit="days"]', grid),
      hours: $('[data-unit="hours"]', grid),
      minutes: $('[data-unit="minutes"]', grid),
      seconds: $('[data-unit="seconds"]', grid),
    };

    const target = resolveTarget();
    caption.textContent =
      'Counting down to ' +
      target.toLocaleDateString(cfg.locale, { day: 'numeric', month: 'long', year: 'numeric' });

    let timer = 0;
    let firstRender = true;

    function setUnit(name, value) {
      const el = units[name];
      const text = pad(value);
      if (el.textContent === text) return;
      el.textContent = text;
      if (!firstRender) {
        el.classList.remove('is-tick');
        void el.offsetWidth; // restart animasi
        el.classList.add('is-tick');
      }
    }

    function finish(live) {
      clearInterval(timer);
      grid.hidden = true;
      caption.hidden = true;
      done.hidden = false;
      const party = () => {
        BD.effects.confetti.cannons();
        BD.effects.confetti.rain(3200, 3);
        BD.effects.balloons.launch(10);
      };
      if (live) party();
      else whenVisible(section, party, 0.4);
    }

    function render() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        finish(!firstRender);
        return;
      }
      const total = Math.floor(diff / 1000);
      setUnit('days', Math.floor(total / 86400));
      setUnit('hours', Math.floor((total % 86400) / 3600));
      setUnit('minutes', Math.floor((total % 3600) / 60));
      setUnit('seconds', total % 60);
      firstRender = false;
    }

    $('#confettiAgain')?.addEventListener('click', (e) => BD.effects.celebrate(e.currentTarget));

    render();
    if (!done.hidden) return; // sudah selesai sejak awal
    timer = setInterval(render, 250);
  }

  BD.countdown = { init };
})(window.BD);
