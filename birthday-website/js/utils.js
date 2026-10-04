/* ==========================================================================
   utils.js — helper kecil yang dipakai semua modul
   ========================================================================== */
(function (BD) {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => motionQuery.matches;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* "2002-10-14" → Date lokal (menghindari pergeseran zona waktu dari new Date("YYYY-MM-DD")) */
  function parseLocalDate(value) {
    const [y, m, d] = String(value).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  /* Jalankan callback sekali saja saat elemen terlihat di layar */
  function whenVisible(el, callback, threshold = 0.3) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          callback();
        }
      },
      { threshold }
    );
    io.observe(el);
  }

  BD.utils = { $, $$, prefersReducedMotion, rand, pick, pad, wait, parseLocalDate, whenVisible };
})((window.BD = window.BD || {}));
