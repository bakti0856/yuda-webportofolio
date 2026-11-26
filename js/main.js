// ── Mobile Nav ──
const ham = document.getElementById('ham');
const mobileNav = document.getElementById('mobile-nav');

ham.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
});

mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

document.addEventListener('click', (e) => {
    if (!ham.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
    }
});

// ── Fade-in on Scroll ──
const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

// ── Smooth Scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    });
});

// ── Lightbox (zoom + geser) ──
(function () {
    const lb = document.getElementById('lightbox');
    const stage = document.getElementById('lb-stage');
    const img = document.getElementById('lb-img');
    const cap = document.getElementById('lb-cap');

    let scale = 1, x = 0, y = 0;
    let moved = false;
    const pointers = new Map();
    let pinchStartDist = 0, pinchStartScale = 1;
    let lastX = 0, lastY = 0;

    function apply() {
        img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        lb.classList.toggle('zoomed', scale > 1);
    }
    function reset() { scale = 1; x = 0; y = 0; apply(); }
    function setScale(s) {
        scale = Math.min(5, Math.max(1, s));
        if (scale === 1) { x = 0; y = 0; }
        apply();
    }

    function openLB(el) {
        img.src = el.currentSrc || el.src;
        img.alt = el.alt;
        const card = el.closest('.cert-card, .proj3-card');
        const title = card && card.querySelector('.cert-title, .proj3-title');
        cap.textContent = title ? title.textContent.trim() : el.alt;
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
    }

    document.querySelectorAll('.zoomable').forEach(el =>
        el.addEventListener('click', () => openLB(el))
    );

    document.getElementById('lb-close').addEventListener('click', closeLB);
    document.getElementById('lb-in').addEventListener('click', () => setScale(scale * 1.4));
    document.getElementById('lb-out').addEventListener('click', () => setScale(scale / 1.4));
    document.getElementById('lb-reset').addEventListener('click', reset);

    document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLB();
        if (e.key === '+' || e.key === '=') setScale(scale * 1.4);
        if (e.key === '-') setScale(scale / 1.4);
    });

    // Zoom pakai scroll mouse
    stage.addEventListener('wheel', (e) => {
        e.preventDefault();
        setScale(scale * (e.deltaY < 0 ? 1.15 : 0.87));
    }, { passive: false });

    // Klik dua kali: zoom cepat
    img.addEventListener('dblclick', () => setScale(scale > 1 ? 1 : 2.5));

    // Geser (drag) + cubit (pinch)
    stage.addEventListener('pointerdown', (e) => {
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        moved = false;
        lastX = e.clientX; lastY = e.clientY;
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
            pinchStartScale = scale;
        }
        if (scale > 1) lb.classList.add('dragging');
    });

    stage.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            setScale(pinchStartScale * (dist / pinchStartDist));
            moved = true;
        } else if (scale > 1) {
            x += e.clientX - lastX;
            y += e.clientY - lastY;
            if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 2) moved = true;
            apply();
        }
        lastX = e.clientX; lastY = e.clientY;
    });

    function endPointer(e) {
        pointers.delete(e.pointerId);
        lb.classList.remove('dragging');
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);

    // Klik area gelap (bukan gambar) menutup lightbox
    stage.addEventListener('click', (e) => {
        if (e.target === stage && !moved) closeLB();
    });
})();
