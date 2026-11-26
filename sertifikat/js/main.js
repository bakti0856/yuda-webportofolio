
document.addEventListener('DOMContentLoaded', function () {
    const ham       = document.getElementById('ham');
    const mobileNav = document.getElementById('mobile-nav');

    if (ham && mobileNav) {
        ham.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });

        mobileNav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                mobileNav.classList.remove('open');
            });
        });

        document.addEventListener('click', function (e) {
            if (!ham.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.remove('open');
            }
        });
    }

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(function (el) {
            obs.observe(el);
        });
    } else {
        // Fallback: browser lama → langsung tampilkan
        document.querySelectorAll('.fade-in').forEach(function (el) {
            el.classList.add('visible');
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offset = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        });
    });
    const lb    = document.getElementById('lightbox');
    const stage = document.getElementById('lb-stage');
    const img   = document.getElementById('lb-img');
    const cap   = document.getElementById('lb-cap');

    // Guard: kalau elemen tidak lengkap, hentikan blok lightbox saja
    if (!lb || !stage || !img || !cap) {
        console.warn('[Lightbox] Elemen lightbox tidak ditemukan. Cek id di HTML.');
        return;
    }

    const btnClose = document.getElementById('lb-close');
    const btnIn    = document.getElementById('lb-in');
    const btnOut   = document.getElementById('lb-out');
    const btnReset = document.getElementById('lb-reset');

    let scale = 1, x = 0, y = 0;
    let moved = false;
    const pointers = new Map();
    let pinchStartDist = 0, pinchStartScale = 1;
    let lastX = 0, lastY = 0;

    function apply() {
        img.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
        lb.classList.toggle('zoomed', scale > 1);
    }

    function reset() {
        scale = 1; x = 0; y = 0;
        apply();
    }

    function setScale(s) {
        scale = Math.min(5, Math.max(1, s));
        if (scale === 1) { x = 0; y = 0; }
        apply();
    }

    function openLB(el) {
        img.src = el.currentSrc || el.src;
        img.alt = el.alt || '';

        const card  = el.closest('.cert-card, .proj3-card');
        const title = card ? card.querySelector('.cert-title, .proj3-title') : null;
        cap.textContent = title ? title.textContent.trim() : (el.alt || '');

        reset();
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLB() {
        lb.classList.remove('open', 'dragging');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        pointers.clear();
        // Reset transform supaya tidak "nyangkut" saat dibuka lagi
        scale = 1; x = 0; y = 0;
        img.style.transform = '';
    }

    // Pasang event klik ke semua gambar zoomable
    const zoomables = document.querySelectorAll('.zoomable');
    if (zoomables.length === 0) {
        console.warn('[Lightbox] Tidak ada elemen .zoomable ditemukan.');
    }
    zoomables.forEach(function (el) {
        el.addEventListener('click', function () {
            openLB(el);
        });
    });

    // Tombol toolbar
    if (btnClose) btnClose.addEventListener('click', closeLB);
    if (btnIn)    btnIn.addEventListener('click', function () { setScale(scale * 1.4); });
    if (btnOut)   btnOut.addEventListener('click', function () { setScale(scale / 1.4); });
    if (btnReset) btnReset.addEventListener('click', reset);

    // Keyboard
    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLB();
        if (e.key === '+' || e.key === '=') setScale(scale * 1.4);
        if (e.key === '-') setScale(scale / 1.4);
    });

    // Zoom pakai scroll mouse
    stage.addEventListener('wheel', function (e) {
        e.preventDefault();
        setScale(scale * (e.deltaY < 0 ? 1.15 : 0.87));
    }, { passive: false });

    // Klik dua kali → zoom cepat
    img.addEventListener('dblclick', function () {
        setScale(scale > 1 ? 1 : 2.5);
    });

    // Drag + pinch (pointer events)
    stage.addEventListener('pointerdown', function (e) {
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        moved = false;
        lastX = e.clientX; lastY = e.clientY;

        if (pointers.size === 2) {
            const vals = Array.from(pointers.values());
            pinchStartDist  = Math.hypot(vals[0].x - vals[1].x, vals[0].y - vals[1].y);
            pinchStartScale = scale;
        }
        if (scale > 1) lb.classList.add('dragging');
    });

    stage.addEventListener('pointermove', function (e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 2) {
            const vals = Array.from(pointers.values());
            const dist = Math.hypot(vals[0].x - vals[1].x, vals[0].y - vals[1].y);
            if (pinchStartDist > 0) {
                setScale(pinchStartScale * (dist / pinchStartDist));
            }
            moved = true;
        } else if (scale > 1) {
            x += e.clientX - lastX;
            y += e.clientY - lastY;
            if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 2) {
                moved = true;
            }
            apply();
        }
        lastX = e.clientX; lastY = e.clientY;
    });

    function endPointer(e) {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) {
            // reset pinch baseline kalau salah satu jari lepas
            pinchStartDist = 0;
        }
        lb.classList.remove('dragging');
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    // Klik area gelap (bukan gambar) → tutup
    stage.addEventListener('click', function (e) {
        if (e.target === stage && !moved) closeLB();
    });
});