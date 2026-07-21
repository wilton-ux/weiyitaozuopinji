/* ============================================
   PERSONAL PORTFOLIO — SCRIPTS
   Custom cursor, GSAP animations, Lenis scroll
   ============================================ */

// ==============================================
// 🔧 USER CONFIG — Edit your info here!
// ==============================================
const CONFIG = {
  name: 'Wilton Wei',
  email: 'weiyitao2023@outlook.com',
  phone: '19924115435',
  wechat: '19924115435',
  socialLinks: {},
};

const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

// Update page title
document.title = CONFIG.name + ' — Portfolio';

// Hover-driven hero video — plays when mouse is in the right 40% of
// the viewport, pauses elsewhere to save bandwidth.
// Falls back to poster on mobile, reduced-motion, or data-saving paths.
(function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  const source = video?.querySelector('source[data-src]');
  if (!video || !source) return;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const shouldUsePoster =
    window.matchMedia('(max-width: 768px)').matches ||
    REDUCED_MOTION_QUERY.matches ||
    Boolean(connection?.saveData);

  if (shouldUsePoster) {
    video.remove();
    return;
  }

  // Load video source
  source.src = source.dataset.src;
  video.load();

  video.addEventListener('loadedmetadata', function () {
    video.classList.add('is-ready');
    video.currentTime = 0;
    video.pause();

    // Play when mouse is in the right 40% of the viewport
    document.addEventListener('mousemove', function (e) {
      const threshold = window.innerWidth * 0.6; // right 40% starts at 60% width
      if (e.clientX > threshold) {
        if (video.paused) {
          video.play().catch(function () {});
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    }, { passive: true });
  }, { once: true });

  video.addEventListener('error', function () {
    video.remove();
  }, { once: true });
})();

// ==============================================
// 🖱️ CUSTOM CURSOR
// ==============================================
(function initCursor() {
  if (REDUCED_MOTION_QUERY.matches) return;

  // Disable custom cursor on touch devices
  if ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches) {
    const ring = document.querySelector('.cursor-ring');
    const dot = document.querySelector('.cursor-dot');
    const follower = document.querySelector('.cursor-follower');
    if (ring) ring.remove();
    if (dot) dot.remove();
    if (follower) follower.remove();
    return;
  }

  const ring = document.querySelector('.cursor-ring');
  const dot = document.querySelector('.cursor-dot');
  const follower = document.querySelector('.cursor-follower');
  const label = follower?.querySelector('.cursor-label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dotX = mouseX;
    dotY = mouseY;

    // Dot follows instantly
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    // Follower follows dot instantly
    follower.style.left = dotX + 'px';
    follower.style.top = dotY + 'px';
  });

  // Ring follows with slight delay (smooth)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // --- Cursor states on interactive elements ---

  // Links
  document.querySelectorAll('a, .magnetic, .nav-link').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      ring.classList.add('hover-link');
      dot.classList.add('hover-link');
    });
    el.addEventListener('mouseleave', function () {
      ring.classList.remove('hover-link');
      dot.classList.remove('hover-link');
    });
  });

  // Work cards
  document.querySelectorAll('.work-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      ring.classList.add('hover-card');
      dot.classList.add('hover-card');
      follower.classList.add('active');
      if (label) {
        label.textContent = 'View';
      }
    });
    card.addEventListener('mouseleave', function () {
      ring.classList.remove('hover-card');
      dot.classList.remove('hover-card');
      follower.classList.remove('active');
    });
  });

  // Service tags
  document.querySelectorAll('.service-tag').forEach(function (tag) {
    tag.addEventListener('mouseenter', function () {
      ring.classList.add('hover-link');
      dot.classList.add('hover-link');
    });
    tag.addEventListener('mouseleave', function () {
      ring.classList.remove('hover-link');
      dot.classList.remove('hover-link');
    });
  });
})();


// ==============================================
// 🌟 HERO GLOW — Cursor-following radial glow
// ==============================================
(function initHeroGlow() {
  if (REDUCED_MOTION_QUERY.matches) return;

  const glow = document.getElementById('heroGlow');
  if (!glow) return;

  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;

  document.addEventListener('mousemove', function (e) {
    glowX = e.clientX;
    glowY = e.clientY;
  });

  function animateGlow() {
    const currentX = parseFloat(glow.style.left) || glowX;
    const currentY = parseFloat(glow.style.top) || glowY;
    const lerpX = currentX + (glowX - currentX) * 0.06;
    const lerpY = currentY + (glowY - currentY) * 0.06;
    glow.style.left = lerpX + 'px';
    glow.style.top = lerpY + 'px';
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);
})();


// ==============================================
// 🖼️ HOVER PREVIEW — floating image on project cards
// ==============================================
(function initHoverPreview() {
  if (REDUCED_MOTION_QUERY.matches) return;

  const preview = document.getElementById('hoverPreview');
  const previewImg = document.getElementById('hoverPreviewImg');
  const previewVideo = document.getElementById('hoverPreviewVideo');
  if (!preview || !previewImg || !previewVideo) return;

  let activeCard = null;
  let px = 0;
  let py = 0;
  let currentX = 0;
  let currentY = 0;

  document.querySelectorAll('.work-card[data-hover-img]').forEach(function (card) {
    card.addEventListener('mouseenter', function (e) {
      activeCard = card;
      const videoSrc = card.getAttribute('data-hover-video');
      const imgSrc = card.getAttribute('data-hover-img');

      if (videoSrc) {
        preview.classList.add('show-video');
        previewImg.style.display = 'none';
        previewVideo.style.display = 'block';
        previewVideo.src = videoSrc;
        previewVideo.play().catch(function () {});
      } else {
        preview.classList.remove('show-video');
        previewImg.style.display = 'block';
        previewVideo.style.display = 'none';
        previewVideo.pause();
        if (imgSrc) {
          previewImg.src = imgSrc;
        }
      }

      preview.classList.add('active');
      currentX = e.clientX;
      currentY = e.clientY;
      preview.style.left = currentX + 'px';
      preview.style.top = currentY + 'px';
    });

    card.addEventListener('mousemove', function (e) {
      px = e.clientX;
      py = e.clientY;
    });

    card.addEventListener('mouseleave', function () {
      activeCard = null;
      preview.classList.remove('active');
      previewVideo.pause();
    });
  });

  // RAF loop — smooth trailing follow
  function followCursor() {
    if (activeCard && preview.classList.contains('active')) {
      currentX += (px - currentX) * 0.12;
      currentY += (py - currentY) * 0.12;
      preview.style.left = currentX + 'px';
      preview.style.top = currentY + 'px';
    }
    requestAnimationFrame(followCursor);
  }
  requestAnimationFrame(followCursor);
})();


// ==============================================
// 📜 GSAP + SCROLLTRIGGER ANIMATIONS
// ==============================================
(function initScrollAnimations() {
  if (REDUCED_MOTION_QUERY.matches) return;

  // Wait for GSAP to load
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Retry after a short delay (CDN might not be loaded yet)
    setTimeout(initScrollAnimations, 200);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // --- Hero load animation ---
  // Hero content uses CSS fadeSlideUp keyframes for staggered entrance.
  // Refresh ScrollTrigger after fonts/video load to recalc positions.

  // --- Section headings ---
  document.querySelectorAll('.section-heading').forEach(function (heading) {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  // --- Work cards — staggered fade-in ---
  gsap.from('.work-card', {
    scrollTrigger: {
      trigger: '.works-grid',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out',
  });

  // --- About section ---
  gsap.from('.about-image-wrapper', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    x: -60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });

  gsap.from('.about-text', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    x: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });

  // --- Contact section ---
  gsap.from('.contact-heading', {
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
  });

  gsap.from('.contact-link', {
    scrollTrigger: {
      trigger: '.contact-links',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
  });

  // Refresh ScrollTrigger after everything is loaded
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });
})();


// ==============================================
// 🧲 MAGNETIC HOVER EFFECT (Contact links)
// ==============================================
(function initMagnetic() {
  if (REDUCED_MOTION_QUERY.matches) return;

  document.querySelectorAll('.magnetic').forEach(function (link) {
    link.addEventListener('mousemove', function (e) {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = 'translate(' + (x * 0.3).toFixed(2) + 'px, ' + (y * 0.3).toFixed(2) + 'px)';
    });

    link.addEventListener('mouseleave', function () {
      link.style.transform = 'translate(0, 0)';
    });
  });
})();


// ==============================================
// 🧭 NAVIGATION SCROLL HANDLING
// ==============================================
(function initNav() {
  const nav = document.getElementById('nav');

  // Scroll-to-section with smooth behavior via Lenis or native
  document.querySelectorAll('.nav-link, .nav-logo').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();

      const target = document.querySelector(href);
      if (!target) return;

      // If Lenis is available, use it for smooth scroll
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      } else {
        target.scrollIntoView({ behavior: REDUCED_MOTION_QUERY.matches ? 'auto' : 'smooth' });
      }
    });
  });

  // Add blur background on scroll
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (window.scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();


// ==============================================
// 🌀 LENIS SMOOTH SCROLL
// ==============================================
(function initLenis() {
  if (REDUCED_MOTION_QUERY.matches) return;

  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initLenis, 200);
    return;
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
  });

  window.__lenis = lenis;

  // Bridge Lenis with GSAP ScrollTrigger (ticker-driven, no duplicate RAF)
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });

  lenis.on('scroll', ScrollTrigger.update);
})();


// ==============================================
// ✦ HERO FRAGMENTS — autonomous float + mouse parallax
// ==============================================
(function initFragments() {
  if (REDUCED_MOTION_QUERY.matches) return;

  var fragments = document.querySelectorAll('.fragment');
  var hero = document.getElementById('hero');
  if (!fragments.length || !hero) return;

  // Build per-fragment state for autonomous float
  var states = [];
  fragments.forEach(function (frag, i) {
    states.push({
      el: frag,
      depth: parseFloat(frag.getAttribute('data-depth')) || 0.5,
      phase: i * 0.7,        // staggered phase offset
      speed: 0.6 + Math.random() * 0.8,  // random float speed
      amp: 6 + Math.random() * 10,       // float amplitude (px)
      rotAmp: 1 + Math.random() * 2.5,   // rotation amplitude (deg)
    });
  });

  // Fade in fragments after hero text animation
  if (typeof gsap !== 'undefined') {
    gsap.to('.fragment', {
      opacity: 1,
      duration: 1.2,
      stagger: 0.06,
      delay: 1.6,
      ease: 'power2.out',
    });
  } else {
    fragments.forEach(function (f, i) {
      f.style.transition = 'opacity 1.2s ease ' + (1.6 + i * 0.06) + 's';
      f.style.opacity = '1';
    });
  }

  var heroRect = hero.getBoundingClientRect();
  var heroCX = heroRect.width / 2;
  var heroCY = heroRect.height / 2;
  var mx = 0, my = 0, mouseActive = false;

  window.addEventListener('resize', function () {
    heroRect = hero.getBoundingClientRect();
    heroCX = heroRect.width / 2;
    heroCY = heroRect.height / 2;
  });

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    mouseActive = true;
  });

  // Single rAF loop — combines autonomous float + mouse parallax
  var start = performance.now();
  function animateFragments(now) {
    var t = (now - start) / 1000; // seconds

    // Mouse parallax params (relative to hero center)
    var rx = mx - heroRect.left - heroCX;
    var ry = my - heroRect.top - heroCY;
    var dist = Math.sqrt(rx * rx + ry * ry);

    states.forEach(function (s) {
      // Autonomous float
      var floatY = Math.sin(t * s.speed + s.phase) * s.amp;
      var floatX = Math.cos(t * s.speed * 0.7 + s.phase) * s.amp * 0.5;
      var floatR = Math.sin(t * s.speed * 0.5 + s.phase + 1) * s.rotAmp;

      // Mouse parallax
      var maxShift = 28 * s.depth;
      var influence = mouseActive ? Math.min(1, 1 - dist / 1100) : 0;
      var px = (rx / (heroCX || 1)) * maxShift * influence;
      var py = (ry / (heroCY || 1)) * maxShift * influence;

      s.el.style.transform =
        'translate(' + (floatX + px).toFixed(1) + 'px, ' + (floatY + py).toFixed(1) + 'px)' +
        ' rotate(' + floatR.toFixed(2) + 'deg)';
    });

    requestAnimationFrame(animateFragments);
  }
  requestAnimationFrame(animateFragments);
})();


// ==============================================
// 🃏 WORK CARD — 3D micro-tilt
// ==============================================
(function initCardTilt() {
  if (REDUCED_MOTION_QUERY.matches) return;

  var cards = document.querySelectorAll('.work-card');

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;

      // Normalize to [-1, 1]
      var nx = (x - centerX) / centerX;
      var ny = (y - centerY) / centerY;

      // Max tilt degrees
      var maxTilt = 6;
      var rotateY = nx * maxTilt;
      var rotateX = -ny * maxTilt;

      // Dynamic shadow to simulate directional light
      var shadowX = nx * 12;
      var shadowY = ny * 12;
      card.style.boxShadow = shadowX.toFixed(1) + 'px ' + shadowY.toFixed(1) + 'px 30px rgba(255, 255, 227, 0.04)';

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.02, 1.02, 1)';
      card.classList.add('tilting');
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = 'none';
      card.classList.remove('tilting');
    });
  });
})();


// ==============================================
// ✦ ANTIGRAVITY — interactive particle field
//    Ported from React Three Fiber to Canvas 2D
// ==============================================
(function initAntigravity() {
  if (REDUCED_MOTION_QUERY.matches) return;

  var hero = document.getElementById('hero');
  var canvas = document.getElementById('antigravityCanvas');
  if (!hero || !canvas) return;

  var ctx = canvas.getContext('2d');

  // ── Config (tune these to adjust the look) ──
  var CONFIG = {
    count: 400,
    magnetRadius: 0.12,   // fraction of canvas width
    ringRadius: 0.32,     // fraction of canvas width
    waveSpeed: 0.7,
    waveAmplitude: 0.8,
    particleSize: 2,
    lerpSpeed: 0.15,
    color: '#FFFFE3',
    autoAnimate: false,
    particleVariance: 1,
    rotationSpeed: 0,
    depthFactor: 1,
    pulseSpeed: 3,
    particleShape: 'capsule',
    fieldStrength: 10,
    idleTimeout: 2000,
  };

  var width = 0, height = 0;
  var particles = [];
  var mouseX = 0, mouseY = 0;
  var virtualMouseX = 0, virtualMouseY = 0;
  var lastMouseMoveTime = 0;
  var clock = 0;
  var heroRect = null;

  function resize() {
    heroRect = hero.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for perf
    width = heroRect.width;
    height = heroRect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles = [];
    for (var i = 0; i < CONFIG.count; i++) {
      var x = Math.random() * width;
      var y = Math.random() * height;
      var z = Math.random();                         // 0=near, 1=far
      particles.push({
        mx: x,    // home position
        my: y,
        mz: z,
        cx: x,    // current lerped position
        cy: y,
        cz: z,
        t: Math.random() * 100,                     // wave phase seed
        speed: 0.01 + Math.random() / 200,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      });
    }
  }

  // ── Mouse tracking on the hero section ──
  hero.addEventListener('mousemove', function (e) {
    mouseX = e.clientX - heroRect.left;
    mouseY = e.clientY - heroRect.top;
    lastMouseMoveTime = performance.now();
  });

  hero.addEventListener('mouseleave', function () {
    // let auto-animate take over naturally after idleTimeout
  });

  window.addEventListener('resize', function () {
    resize();
    createParticles();
  });

  // ── Drawing helpers ──
  function drawCapsule(x, y, angle, length, thickness, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawSphere(x, y, r, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Frame loop ──
  function animate(now) {
    requestAnimationFrame(animate);

    if (width === 0 || height === 0) return;
    clock = now / 1000;

    // --- Virtual mouse ---
    var destX = mouseX;
    var destY = mouseY;

    if (CONFIG.autoAnimate && now - lastMouseMoveTime > CONFIG.idleTimeout) {
      // Orbit automatically when idle
      destX = width / 2 + Math.sin(clock * 0.5) * (width * 0.25);
      destY = height / 2 + Math.cos(clock * 0.5 * 2) * (height * 0.25);
    }

    virtualMouseX += (destX - virtualMouseX) * 0.05;
    virtualMouseY += (destY - virtualMouseY) * 0.05;

    // Pixel-based radii (scaled from fraction of width)
    var pixelMagnetRadius = CONFIG.magnetRadius * width;
    var pixelRingRadius = CONFIG.ringRadius * width;

    ctx.clearRect(0, 0, width, height);

    // --- Update & draw each particle ---
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.t += p.speed / 2;

      // Depth-based projection factor
      var projectionFactor = 1 - p.cz / 50;
      var projectedTX = virtualMouseX * projectionFactor;
      var projectedTY = virtualMouseY * projectionFactor;

      // Vector from virtual mouse to particle's home
      var dx = p.mx - projectedTX;
      var dy = p.my - projectedTY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var targetX = p.mx;
      var targetY = p.my;

      if (dist < pixelMagnetRadius) {
        var angle = Math.atan2(dy, dx);
        var wave = Math.sin(p.t * CONFIG.waveSpeed + angle) * (0.5 * CONFIG.waveAmplitude);
        var deviation = p.randomRadiusOffset * (5 / (CONFIG.fieldStrength + 0.1));
        var currentRingRadius = pixelRingRadius + wave * 8 + deviation * 8;

        targetX = projectedTX + currentRingRadius * Math.cos(angle);
        targetY = projectedTY + currentRingRadius * Math.sin(angle);
      }

      // Lerp toward target
      p.cx += (targetX - p.cx) * CONFIG.lerpSpeed;
      p.cy += (targetY - p.cy) * CONFIG.lerpSpeed;

      // Scale based on distance from ring
      var currentDistToMouse = Math.sqrt(
        Math.pow(p.cx - projectedTX, 2) + Math.pow(p.cy - projectedTY, 2)
      );
      var distFromRing = Math.abs(currentDistToMouse - pixelRingRadius);
      var scaleFactor = 1 - distFromRing / (pixelRingRadius * 0.5);
      scaleFactor = Math.max(0.15, Math.min(1, scaleFactor));
      scaleFactor = scaleFactor *
        (0.8 + Math.sin(p.t * CONFIG.pulseSpeed) * 0.2 * CONFIG.particleVariance) *
        CONFIG.particleSize;

      // Angle from particle to mouse (capsule points toward mouse)
      var lookAngle = Math.atan2(projectedTY - p.cy, projectedTX - p.cx);

      var alpha = 0.25 + scaleFactor * 0.45;
      var capsuleLen = 6 * scaleFactor;
      var capsuleThick = 1.6 * scaleFactor;

      if (CONFIG.particleShape === 'capsule') {
        drawCapsule(p.cx, p.cy, lookAngle, capsuleLen, capsuleThick, alpha);
      } else {
        drawSphere(p.cx, p.cy, 2.5 * scaleFactor, alpha);
      }
    }

    // --- Subtle glow at virtual mouse ---
    var glowR = pixelMagnetRadius * 0.5;
    var glow = ctx.createRadialGradient(virtualMouseX, virtualMouseY, 0, virtualMouseX, virtualMouseY, glowR);
    glow.addColorStop(0, 'rgba(207, 174, 86, 0.10)');
    glow.addColorStop(0.5, 'rgba(207, 174, 86, 0.03)');
    glow.addColorStop(1, 'rgba(207, 174, 86, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(virtualMouseX, virtualMouseY, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  resize();
  createParticles();
  requestAnimationFrame(animate);
})();
