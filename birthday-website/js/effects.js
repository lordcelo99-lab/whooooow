/* ==========================================================================
   effects.js — confetti (canvas), balon, dan sparkle
   API:  BD.effects.confetti.burst() / .cannons() / .rain()
         BD.effects.balloons.launch(n)
         BD.effects.sparkles.burst(x, y) / .around(el)
         BD.effects.celebrate(elemenAsal)
   ========================================================================== */
(function (BD) {
  'use strict';

  const { rand, pick, prefersReducedMotion } = BD.utils;
  const TAU = Math.PI * 2;
  const isSmall = () => window.innerWidth < 640;
  const palette = () => BD.config.confettiColors;

  function ensureLayer(id, className) {
    let layer = document.getElementById(id);
    if (!layer) {
      layer = document.createElement('div');
      layer.id = id;
      layer.className = className;
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  /* ------------------------------------------------------------------ *
   *  CONFETTI — satu canvas fixed, loop hanya jalan saat ada partikel
   * ------------------------------------------------------------------ */
  const confetti = (() => {
    const MAX_PARTICLES = 700;
    const particles = [];
    let canvas, ctx;
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let rainUntil = 0;
    let rainDensity = 0;

    function setup() {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function add(x, y, angle, speed, opts = {}) {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(8, 15),
        rot: rand(0, TAU),
        vr: rand(-0.25, 0.25),
        wobble: rand(0, TAU),
        wobbleSpeed: rand(0.08, 0.22),
        gravity: opts.gravity ?? 0.32,
        drag: opts.drag ?? 0.965,
        life: 1,
        decay: opts.decay ?? rand(0.004, 0.009),
        color: pick(palette()),
        shape: pick(['rect', 'rect', 'circle', 'ribbon']),
      });
    }

    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.wobble)); // efek berputar 3D
      ctx.globalAlpha = Math.min(1, p.life * 1.6);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.2, 0, TAU);
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.size * 0.9, -p.size * 0.18, p.size * 1.8, p.size * 0.36);
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      }
      ctx.restore();
    }

    function loop(now) {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      ctx.clearRect(0, 0, width, height);

      if (now < rainUntil) {
        for (let i = 0; i < rainDensity; i++) {
          add(rand(0, width), -12, Math.PI / 2 + rand(-0.4, 0.4), rand(1, 4), {
            gravity: 0.05,
            drag: 0.99,
            decay: 0.0015,
          });
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const drag = Math.pow(p.drag, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.wobble += p.wobbleSpeed * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0 || p.y > height + 30) {
          particles.splice(i, 1);
        } else {
          draw(p);
        }
      }

      if (particles.length || now < rainUntil) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        ctx.clearRect(0, 0, width, height);
      }
    }

    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    /* Ledakan dari satu titik. angle = arah tengah (radian), spread = lebar sebaran */
    function burst({
      x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      count = 90,
      angle = -Math.PI / 2,
      spread = TAU,
      speed = [6, 16],
    } = {}) {
      if (prefersReducedMotion()) return;
      setup();
      const n = Math.round(count * (isSmall() ? 0.7 : 1));
      for (let i = 0; i < n; i++) {
        add(x, y, angle + rand(-spread / 2, spread / 2), rand(speed[0], speed[1]));
      }
      start();
    }

    /* Dua "meriam" dari pojok bawah layar */
    function cannons() {
      if (prefersReducedMotion()) return;
      setup();
      const count = isSmall() ? 55 : 85;
      burst({ x: 0, y: height, count, angle: -Math.PI / 3, spread: 0.7, speed: [14, 28] });
      burst({ x: width, y: height, count, angle: (-2 * Math.PI) / 3, spread: 0.7, speed: [14, 28] });
    }

    /* Hujan confetti dari atas layar selama `duration` ms */
    function rain(duration = 3000, density = 3) {
      if (prefersReducedMotion()) return;
      setup();
      rainUntil = performance.now() + duration;
      rainDensity = density;
      start();
    }

    return { burst, cannons, rain };
  })();

  /* ------------------------------------------------------------------ *
   *  SPARKLES — bintang kecil yang menyebar lalu menghilang
   * ------------------------------------------------------------------ */
  const sparkles = (() => {
    const STAR =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.8 7.5 4.5 11.2 12 12-7.5.8-11.2 4.5-12 12-.8-7.5-4.5-11.2-12-12 7.5-.8 11.2-4.5 12-12z"/></svg>';
    const COLORS = ['#FFD84A', '#E23A6B', '#B8A6FF', '#7DD8B0', '#FF9F6B'];

    function burst(x, y, { count = 14, radius = 90 } = {}) {
      if (prefersReducedMotion()) return;
      const layer = ensureLayer('sparkle-layer', 'fx-layer fx-layer--sparkle');
      for (let i = 0; i < count; i++) {
        const angle = rand(0, TAU);
        const dist = rand(radius * 0.35, radius);
        const dur = rand(0.75, 1.3);
        const el = document.createElement('span');
        el.className = 'sparkle';
        el.innerHTML = STAR;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        el.style.setProperty('--size', rand(10, 22).toFixed(1) + 'px');
        el.style.setProperty('--rot', rand(-120, 120).toFixed(0) + 'deg');
        el.style.setProperty('--dur', dur.toFixed(2) + 's');
        el.style.color = pick(COLORS);
        layer.appendChild(el);
        setTimeout(() => el.remove(), dur * 1000 + 150);
      }
    }

    /* Sparkle acak di sekitar sebuah elemen */
    function around(el, count = 10) {
      if (!el || prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          burst(rand(r.left, r.right), rand(r.top, r.bottom), { count: 2, radius: 40 });
        }, i * 60);
      }
    }

    return { burst, around };
  })();

  /* ------------------------------------------------------------------ *
   *  BALLOONS — naik dari bawah layar, bisa dipecahkan dengan tap/klik
   * ------------------------------------------------------------------ */
  const balloons = (() => {
    function pop(el) {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.width * 0.6;
      sparkles.burst(x, y, { count: 10, radius: 60 });
      confetti.burst({ x, y, count: 26, spread: TAU, speed: [3, 9] });
      el.remove();
    }

    function launch(count = 12) {
      if (prefersReducedMotion()) return;
      const layer = ensureLayer('balloon-layer', 'fx-layer fx-layer--balloon');
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const size = isSmall() ? rand(46, 68) : rand(56, 88);
          const dur = rand(6.5, 10);
          const el = document.createElement('div');
          el.className = 'balloon';
          el.style.setProperty('--x', rand(2, 86).toFixed(1) + 'vw');
          el.style.setProperty('--size', size.toFixed(0) + 'px');
          el.style.setProperty('--color', pick(palette()));
          el.style.setProperty('--dur', dur.toFixed(2) + 's');
          el.style.setProperty('--sway', rand(10, 30).toFixed(0) + 'px');
          el.style.setProperty('--sway-dur', rand(2.6, 4).toFixed(2) + 's');
          el.innerHTML =
            '<span class="balloon__sway"><span class="balloon__body"></span><span class="balloon__string"></span></span>';
          el.addEventListener('pointerdown', () => pop(el));
          el.addEventListener('animationend', (e) => {
            if (e.target === el) el.remove();
          });
          layer.appendChild(el);
          setTimeout(() => el.remove(), dur * 1000 + 1500); // jaring pengaman
        }, i * 140 + rand(0, 120));
      }
    }

    return { launch };
  })();

  /* ------------------------------------------------------------------ *
   *  Kombinasi "rayakan!"
   * ------------------------------------------------------------------ */
  function celebrate(originEl) {
    const r = originEl ? originEl.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    sparkles.burst(x, y, { count: 22, radius: 140 });
    confetti.burst({ x, y, count: 70, angle: -Math.PI / 2, spread: Math.PI * 1.2, speed: [8, 18] });
    confetti.cannons();
    balloons.launch(isSmall() ? 9 : 14);
  }

  BD.effects = { confetti, sparkles, balloons, celebrate };
})(window.BD);
