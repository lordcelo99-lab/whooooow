/* ==========================================================================
   gift.js — kotak kado: goyang → tutup terbang → confetti → pesan rahasia
   Pesan rahasia diatur di js/config.js (secretMessage).
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, wait, prefersReducedMotion } = BD.utils;
  const cfg = BD.config;

  const LABEL_CLOSED = 'Open Your Gift 🎁';
  const LABEL_OPEN = 'Close the Box 🎀';

  function init() {
    const gift = $('#gift');
    const button = $('#giftBtn');
    const secret = $('#secret');
    if (!gift || !button || !secret) return;

    const label = $('.btn__label', button);
    $('#secretTitle').textContent = cfg.secretMessage.title;
    $('#secretText').textContent = cfg.secretMessage.text;

    let isOpen = false;
    let busy = false;

    async function open() {
      busy = true;
      const quick = prefersReducedMotion();

      if (!quick) {
        gift.classList.add('is-shaking');
        await wait(750);
        gift.classList.remove('is-shaking');
      }

      gift.classList.add('is-open');
      isOpen = true;

      const r = gift.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height * 0.45;
      BD.effects.sparkles.burst(x, y, { count: 20, radius: 140 });
      BD.effects.confetti.burst({ x, y, count: 120, angle: -Math.PI / 2, spread: Math.PI * 1.1, speed: [8, 20] });
      BD.effects.confetti.rain(1800, 2);

      await wait(quick ? 0 : 650);
      secret.classList.add('is-visible');
      button.setAttribute('aria-expanded', 'true');
      label.textContent = LABEL_OPEN;

      await wait(quick ? 0 : 900);
      if (secret.getBoundingClientRect().bottom > window.innerHeight - 16) {
        secret.scrollIntoView({ behavior: quick ? 'auto' : 'smooth', block: 'center' });
      }
      busy = false;
    }

    async function close() {
      busy = true;
      secret.classList.remove('is-visible');
      gift.classList.remove('is-open');
      isOpen = false;
      button.setAttribute('aria-expanded', 'false');
      label.textContent = LABEL_CLOSED;
      await wait(prefersReducedMotion() ? 0 : 600);
      busy = false;
    }

    function toggle() {
      if (busy) return;
      isOpen ? close() : open();
    }

    button.addEventListener('click', toggle);
    gift.addEventListener('click', toggle); // kotaknya juga bisa diklik
  }

  BD.gift = { init };
})(window.BD);
