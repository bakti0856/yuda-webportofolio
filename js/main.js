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

// ── Progress Bars ──
const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            setTimeout(() => {
                e.target.style.width = e.target.dataset.w + '%';
            }, 150);
            barObs.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.bar-fill').forEach(b => barObs.observe(b));

// ── Counter Animation ──
function animateCount(el, target) {
    const dur = 1500;
    const start = performance.now();
    const update = (now) => {
        const progress = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('id');
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString('id');
    };
    requestAnimationFrame(update);
}

const cntObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            animateCount(e.target, parseInt(e.target.dataset.target));
            cntObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.counter').forEach(c => cntObs.observe(c));

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