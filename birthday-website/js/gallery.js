/* ==========================================================================
   gallery.js — galeri foto: upload banyak foto (tanpa batas), drag & drop, lightbox
   Foto yang diupload hanya ada di browser (tidak disimpan ke server).
   Untuk foto permanen, taruh di assets/gallery/ lalu daftarkan di js/config.js.
   ========================================================================== */
(function (BD) {
  'use strict';

  const { $, rand, pick } = BD.utils;
  const cfg = BD.config;

  const TAPES = ['#FFD84A', '#FFC4D7', '#A9E8CF', '#DDD3FF'];
  const items = []; // { id, src, caption, removable, blob }
  let seq = 0;

  let grid, empty, count, input, addBtn, zone;
  let lb, lbImg, lbCaption, lbCount, lbPrev, lbNext, lbClose;
  let current = -1;
  let lastFocus = null;

  /* ---------------------------------------------------------------- *
   *  Kartu polaroid
   * ---------------------------------------------------------------- */
  function createCard(item, isNew) {
    const fig = document.createElement('figure');
    fig.className = 'polaroid' + (isNew ? ' is-new' : '');
    fig.dataset.id = item.id;
    fig.style.setProperty('--tilt', rand(-3.2, 3.2).toFixed(2) + 'deg');
    fig.style.setProperty('--tape', pick(TAPES));

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'polaroid__open';
    openBtn.setAttribute('aria-label', 'View photo: ' + item.caption);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      if (item.blob) fig.classList.add('is-broken'); // mis. format HEIC yang tak bisa ditampilkan
      else removeItem(item.id, true); // file di config tidak ditemukan → sembunyikan
    });
    openBtn.appendChild(img);
    openBtn.addEventListener('click', () => openLightbox(item.id));

    const cap = document.createElement('figcaption');
    cap.textContent = item.caption;

    fig.append(openBtn, cap);

    if (item.removable) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'polaroid__remove';
      del.setAttribute('aria-label', 'Remove photo');
      del.textContent = '×';
      del.addEventListener('click', () => removeItem(item.id));
      fig.appendChild(del);
    }
    return fig;
  }

  function update() {
    const n = items.length;
    grid.hidden = n === 0;
    empty.hidden = n > 0;
    count.hidden = n === 0;
    count.textContent = n + (n === 1 ? ' memory saved ✨' : ' memories saved ✨');
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const frag = document.createDocumentFragment();
    files.forEach((file) => {
      seq += 1;
      const item = {
        id: seq,
        src: URL.createObjectURL(file),
        caption: 'memory #' + seq,
        removable: true,
        blob: true,
      };
      items.push(item);
      frag.appendChild(createCard(item, true));
    });
    grid.appendChild(frag);
    update();
    BD.effects.sparkles.around(addBtn, 8);
  }

  function removeItem(id, immediate = false) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const [item] = items.splice(idx, 1);
    if (item.blob) URL.revokeObjectURL(item.src);

    const el = grid.querySelector(`[data-id="${id}"]`);
    if (el) {
      if (immediate) {
        el.remove();
      } else {
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 500); // jaring pengaman
      }
    }
    update();
  }

  /* ---------------------------------------------------------------- *
   *  Lightbox
   * ---------------------------------------------------------------- */
  function showAt(index) {
    if (!items.length) return closeLightbox();
    current = (index + items.length) % items.length;
    const item = items[current];
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    lbCaption.textContent = item.caption;
    lbCount.textContent = current + 1 + ' / ' + items.length;
    const multi = items.length > 1;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
  }

  function openLightbox(id) {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    lastFocus = document.activeElement;
    showAt(index);
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      lb.hidden = true;
      lbImg.removeAttribute('src');
    }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindLightbox() {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showAt(current - 1));
    lbNext.addEventListener('click', () => showAt(current + 1));
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showAt(current + 1);
      else if (e.key === 'ArrowLeft') showAt(current - 1);
      else if (e.key === 'Tab') {
        const focusables = [lbClose, lbPrev, lbNext].filter((b) => !b.hidden);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Geser kiri/kanan di layar sentuh
    let startX = 0;
    lb.addEventListener('touchstart', (e) => (startX = e.changedTouches[0].clientX), { passive: true });
    lb.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) showAt(current + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------- *
   *  Drag & drop
   * ---------------------------------------------------------------- */
  function bindDrop() {
    const hasFiles = (e) => Array.from((e.dataTransfer && e.dataTransfer.types) || []).includes('Files');
    let depth = 0;
    zone.addEventListener('dragenter', (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragover', (e) => {
      if (hasFiles(e)) e.preventDefault();
    });
    zone.addEventListener('dragleave', (e) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) zone.classList.remove('is-dragover');
    });
    zone.addEventListener('drop', (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      zone.classList.remove('is-dragover');
      addFiles(e.dataTransfer.files);
    });
  }

  /* ---------------------------------------------------------------- */
  function init() {
    grid = $('#galleryGrid');
    empty = $('#galleryEmpty');
    count = $('#galleryCount');
    input = $('#photoInput');
    addBtn = $('#addPhotosBtn');
    zone = $('#gallery');
    lb = $('#lightbox');
    if (!grid || !lb) return;

    lbImg = $('#lightboxImg');
    lbCaption = $('#lightboxCaption');
    lbCount = $('#lightboxCount');
    lbPrev = $('.lightbox__nav--prev', lb);
    lbNext = $('.lightbox__nav--next', lb);
    lbClose = $('.lightbox__close', lb);

    addBtn.addEventListener('click', () => input.click());
    empty.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      addFiles(input.files);
      input.value = ''; // supaya foto yang sama bisa dipilih lagi
    });

    bindLightbox();
    bindDrop();

    (cfg.galleryImages || []).forEach((g) => {
      seq += 1;
      const item = { id: seq, src: g.src, caption: g.caption || 'memory #' + seq, removable: false, blob: false };
      items.push(item);
      grid.appendChild(createCard(item, false));
    });
    update();
  }

  BD.gallery = { init };
})(window.BD);
