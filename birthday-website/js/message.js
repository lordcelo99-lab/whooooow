/* ==========================================================================
   message.js — surat ulang tahun dengan efek mengetik
   Teks diatur di js/config.js (message, signature).
   Klik / tap surat untuk melewati animasi mengetik.
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, prefersReducedMotion, whenVisible } = BD.utils;
  const cfg = BD.config;

  function init() {
    const letter = $('#letter');
    if (!letter) return;

    const ghost = $('#letterGhost'); // teks penuh (tak terlihat) — menjaga tinggi kartu tetap stabil
    const typed = $('.letter__typed-text', letter);
    const readable = $('#letterFull'); // versi untuk screen reader
    const sign = $('#letterSign');

    const text = String(cfg.message).trim();
    const chars = Array.from(text); // aman untuk emoji
    ghost.textContent = text;
    readable.textContent = text;
    sign.textContent = cfg.signature;

    const node = document.createTextNode('');
    typed.appendChild(node);

    let index = 0;
    let timer = 0;
    let finished = false;

    function finish() {
      clearTimeout(timer);
      finished = true;
      node.data = text;
      letter.classList.remove('is-typing');
      letter.classList.add('is-done');
    }

    function step() {
      if (index >= chars.length) return finish();
      const ch = chars[index++];
      node.data += ch;

      let delay = cfg.typingSpeed + Math.random() * cfg.typingSpeed * 0.7;
      if (ch === ',' || ch === ';') delay += 140;
      else if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') delay += 320;
      timer = setTimeout(step, delay);
    }

    function start() {
      if (prefersReducedMotion()) return finish();
      letter.classList.add('is-typing');
      step();
    }

    letter.addEventListener('click', () => {
      if (!finished) finish();
    });

    whenVisible(letter, start, 0.3);
  }

  BD.message = { init };
})(window.BD);
