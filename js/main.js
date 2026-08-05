/* ============================================================
   proDUCKtive — pato interactivo + animaciones
   ============================================================ */

(function () {
    'use strict';

    // ===== BASE PATH (funciona en index y en portfolio/) =====
    const BASE = window.location.pathname.includes('/portfolio/') ? '../' : '';

    // ===== PATO GLOBAL (esquina inferior) =====
    const DUCK_FRAMES = [BASE + 'assets/logo-sf-1.jpg', BASE + 'assets/pato-camina-2.png'];
    const duckEl = document.createElement('div');
    duckEl.className = 'duck-follow';
    duckEl.innerHTML = `<img src="${BASE}assets/logo-sf-1.jpg" alt="proDUCKtive">`;
    document.body.appendChild(duckEl);
    const duckImg = duckEl.querySelector('img');

    let duckState = 'idle';       // idle | walking | hidden | sleeping
    let duckWalkTimer = null;
    let duckHiddenUntil = 0;

    // Saluda al cargar
    setTimeout(() => {
        duckEl.style.transform = 'rotate(-10deg)';
        setTimeout(() => { duckEl.style.transform = 'rotate(6deg)'; }, 180);
        setTimeout(() => { duckEl.style.transform = ''; }, 380);
        sayQuack('¡Cuac! 👋');
    }, 1200);

    // Camina por la esquina cada cierto tiempo
    function startDuckWalk() {
        if (duckState !== 'idle') return;
        duckState = 'walking';
        duckEl.classList.add('is-walking');
        let step = 0;
        duckWalkTimer = setInterval(() => {
            step++;
            duckImg.src = DUCK_FRAMES[step % 2];
        }, 260);
        setTimeout(() => {
            clearInterval(duckWalkTimer);
            duckEl.classList.remove('is-walking');
            duckImg.src = DUCK_FRAMES[0];
            duckState = 'idle';
        }, 2600);
    }
    setInterval(() => {
        if (Math.random() < 0.5) startDuckWalk();
    }, 14000);

    // El pato mira el cursor (se inclina hacia él)
    let lastDuckLook = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastDuckLook < 180) return;
        lastDuckLook = now;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const relX = (e.clientX / vw) - 0.5;
        const relY = (e.clientY / vh) - 0.5;
        const rot = Math.max(-14, Math.min(14, relX * 40));
        const ty = Math.max(-10, Math.min(10, relY * 24));
        if (duckState === 'idle') {
            duckEl.style.transform = `rotate(${rot}deg) translateY(${ty}px)`;
        }
    });

    // El pato se esconde cuando llegás abajo (footer), y reaparece al subir
    window.addEventListener('scroll', () => {
        const footer = document.querySelector('.footer');
        if (!footer) return;
        const fr = footer.getBoundingClientRect();
        if (fr.top < window.innerHeight && fr.bottom > 0) {
            if (duckState === 'idle') { duckEl.classList.add('duck-hidden'); duckState = 'hidden'; }
        } else if (duckState === 'hidden' && Date.now() > duckHiddenUntil) {
            duckEl.classList.remove('duck-hidden');
            duckState = 'idle';
        }
    }, { passive: true });

    // El pato duerme en la sección Nosotros (aparece su doble durmiendo)
    // Se detecta con IntersectionObserver sobre la sección about

    // ===== TOAST (cuac) =====
    function sayQuack(text) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = text;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2600);
    }

    // Cuac al hacer clic en el pato
    duckEl.addEventListener('click', () => {
        sayQuack(Math.random() < 0.5 ? '¡Cuac! 🦆' : '¡Quack quack! 🦆💛');
    });

    // ===== CURSOR PERSONALIZADO (el pato te sigue) =====
    const cursor = document.createElement('div');
    cursor.className = 'duck-cursor';
    document.body.appendChild(cursor);
    document.body.classList.add('duck-cursor-on');
    let cx = window.innerWidth / 2, cy = 200;
    let tx = cx, ty = cy;
    let cursorRot = 0, cursorTargetRot = 0;
    let hovering = false;
    document.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        const vx = e.movementX || 0;
        cursorTargetRot = Math.max(-25, Math.min(25, vx * 2));
    });
    (function loop() {
        cx += (tx - cx) * 0.28;
        cy += (ty - cy) * 0.28;
        cursorRot += (cursorTargetRot - cursorRot) * 0.15;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        const hoverScale = hovering ? 1.25 : 1;
        cursor.style.transform = `translate(-50%, -50%) rotate(${cursorRot}deg) scale(${hoverScale})`;
        requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .service-card, .portfolio-card, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => { hovering = true; cursor.classList.add('is-hovering'); });
        el.addEventListener('mouseleave', () => { hovering = false; cursor.classList.remove('is-hovering'); });
    });

    // ===== NAV SOLIDO AL HACER SCROLL =====
    const nav = document.querySelector('.nav');
    const onNavScroll = () => {
        if (nav) nav.classList.toggle('nav--solid', window.scrollY > 40);
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    // ===== NAV MOBILE BURGER =====
    const burger = document.querySelector('.nav__burger');
    const links = document.querySelector('.nav__links');
    if (burger && links) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            links.classList.toggle('open');
        });
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            burger.classList.remove('open');
            links.classList.remove('open');
        }));
    }

    // ===== REVEAL ON SCROLL =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ===== PARALLAX STICKERS =====
    const stickerEls = document.querySelectorAll('[data-parallax]');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        stickerEls.forEach(s => {
            const speed = parseFloat(s.dataset.parallax) || 0.15;
            s.style.transform = `translateY(${scrolled * speed}px) rotate(${s.dataset.rot || 0}deg)`;
        });
    }, { passive: true });

    // ===== PATO EN SECCIÓN NOSOTROS (duerme) =====
    const aboutSection = document.querySelector('.about');
    if (aboutSection && !document.querySelector('.about__duck-sleep')) {
        const sleeping = document.createElement('img');
        sleeping.src = BASE + 'assets/pato.svg';
        sleeping.alt = 'El pato durmiendo';
        sleeping.className = 'about__duck-sleep';
        sleeping.style.width = 'clamp(100px, 14vw, 170px)';
        aboutSection.appendChild(sleeping);
    }

    // ===== PATO SOBRE FOTOS DEL PORTFOLIO =====
    document.querySelectorAll('.portfolio-card').forEach(card => {
        const duck = document.createElement('img');
        duck.src = BASE + 'assets/pato.svg';
        duck.alt = 'El pato escondido';
        duck.className = 'portfolio-duck';
        card.appendChild(duck);
    });

    // ===== SERVICIOS: pequeño toast con personalidad al hacer clic =====
    const serviceMsgs = {
        branding: '¡Tu marca con carácter! 🎯',
        'diseno': '¡Colores, formas, explosión! 🎨',
        marketing: '¡Hagamos ruido (el bueno)! 📣',
        'redes': '¡Contenido que engancha! 📱',
        'audiovisual': '¡Luz, cámara, DUCK! 🎬',
        fotografia: '¡Sonrisas y encuadres! 📸',
        musica: '¡Que suene! 🎵',
        web: '¡Clic, clic, cuaaaac! 💻',
        estrategia: '¡Plan maestro! 🧠',
        'direccion': '¡El pato dirige! 🦆🎬'
    };
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const s = card.dataset.service;
            sayQuack(serviceMsgs[s] || '¡Cuac! 🦆');
        });
    });

    // ===== MICROINTERACCION: emojis flotantes al hacer clic en hero =====
    document.querySelector('.hero')?.addEventListener('click', (e) => {
        const emojis = ['🦆', '💛', '✨', '🚀', '🎨'];
        const span = document.createElement('span');
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        span.style.cssText = `
            position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
            font-size: 2rem; pointer-events: none; z-index: 9999;
            animation: duckPop 0.8s ease-out forwards;
        `;
        document.body.appendChild(span);
        setTimeout(() => span.remove(), 850);
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes duckPop {
            0% { transform: translateY(0) scale(0.4); opacity: 1; }
            100% { transform: translateY(-80px) scale(1.4) rotate(20deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // ===== AÑO EN FOOTER =====
    document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());

})();
