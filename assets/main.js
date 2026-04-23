(() => {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const starfield = document.getElementById("starfield");
  const orb = document.getElementById("orb");

  const sfCtx = starfield.getContext("2d", { alpha: true });
  const orbCtx = orb.getContext("2d", { alpha: true });

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;
  let orbRadius = 160;
  let isMobile = false;

  let stars = [];
  let particles = [];

  let rafId = null;
  let running = false;
  let startTime = 0;

  function sizeCanvas(canvas, ctx) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buildStars() {
    const count = isMobile ? 90 : 170;
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: rand(0.4, 1.7),
      baseAlpha: rand(0.25, 0.9),
      twinkleSpeed: rand(0.0004, 0.0016),
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: rand(-0.012, 0.012),
      driftY: rand(-0.008, 0.008),
      hue: Math.random() < 0.12 ? "gold" : "white",
    }));
  }

  function buildParticles() {
    const count = isMobile ? 360 : 720;
    particles = new Array(count).fill(0).map(() => {
      const layer = Math.random();
      return {
        angle: Math.random() * Math.PI * 2,
        angleSpeed: rand(0.00008, 0.00034) * (Math.random() < 0.5 ? -1 : 1),
        radiusBase: rand(0.35, 1.45),
        radiusWobble: rand(0.03, 0.16),
        wobbleSpeed: rand(0.0004, 0.0012),
        wobblePhase: Math.random() * Math.PI * 2,
        size: rand(0.45, 1.8),
        hueMix: Math.random(),
        layer,
        alpha: rand(0.4, 0.95),
      };
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
    isMobile = width < 640;
    orbRadius = Math.min(width, height) * (isMobile ? 0.5 : 0.42);

    sizeCanvas(starfield, sfCtx);
    sizeCanvas(orb, orbCtx);

    buildStars();
    buildParticles();

    drawStarfield(performance.now());
    drawOrb(performance.now());
  }

  function drawStarfield(t) {
    sfCtx.clearRect(0, 0, width, height);
    sfCtx.globalCompositeOperation = "source-over";

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle =
        0.55 + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.45;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha * twinkle));

      sfCtx.beginPath();
      sfCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      if (s.hue === "gold") {
        sfCtx.fillStyle = `rgba(232, 193, 112, ${alpha})`;
      } else {
        sfCtx.fillStyle = `rgba(232, 236, 242, ${alpha})`;
      }
      sfCtx.fill();

      if (s.r > 1.2) {
        const halo = sfCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        halo.addColorStop(0, `rgba(79, 195, 247, ${alpha * 0.12})`);
        halo.addColorStop(1, "rgba(79, 195, 247, 0)");
        sfCtx.fillStyle = halo;
        sfCtx.beginPath();
        sfCtx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        sfCtx.fill();
      }

      if (!prefersReducedMotion) {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < -2) s.x = width + 2;
        if (s.x > width + 2) s.x = -2;
        if (s.y < -2) s.y = height + 2;
        if (s.y > height + 2) s.y = -2;
      }
    }
  }

  function drawOrb(t) {
    orbCtx.clearRect(0, 0, width, height);
    orbCtx.globalCompositeOperation = "lighter";

    const breath = 1 + Math.sin((t / 60000) * Math.PI * 2) * 0.06;

    const core = orbCtx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      orbRadius * 2.2 * breath
    );
    core.addColorStop(0, "rgba(79, 195, 247, 0.3)");
    core.addColorStop(0.25, "rgba(79, 195, 247, 0.14)");
    core.addColorStop(0.55, "rgba(201, 169, 97, 0.07)");
    core.addColorStop(1, "rgba(5, 6, 10, 0)");
    orbCtx.fillStyle = core;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, orbRadius * 2.4 * breath, 0, Math.PI * 2);
    orbCtx.fill();

    const inner = orbCtx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      orbRadius * 0.4
    );
    inner.addColorStop(0, "rgba(255, 217, 138, 0.35)");
    inner.addColorStop(0.6, "rgba(201, 169, 97, 0.08)");
    inner.addColorStop(1, "rgba(0, 0, 0, 0)");
    orbCtx.fillStyle = inner;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, orbRadius * 0.4, 0, Math.PI * 2);
    orbCtx.fill();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const wobble =
        1 + Math.sin(t * p.wobbleSpeed + p.wobblePhase) * p.radiusWobble;
      const r = orbRadius * p.radiusBase * wobble * breath;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r * 0.92;

      const cyanR = 79,
        cyanG = 195,
        cyanB = 247;
      const goldR = 232,
        goldG = 193,
        goldB = 112;
      const mix = p.hueMix;
      const rr = Math.round(cyanR * (1 - mix) + goldR * mix);
      const gg = Math.round(cyanG * (1 - mix) + goldG * mix);
      const bb = Math.round(cyanB * (1 - mix) + goldB * mix);

      orbCtx.beginPath();
      orbCtx.arc(x, y, p.size, 0, Math.PI * 2);
      orbCtx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${p.alpha})`;
      orbCtx.fill();

      if (p.size > 1.1) {
        const halo = orbCtx.createRadialGradient(x, y, 0, x, y, p.size * 4);
        halo.addColorStop(0, `rgba(${rr}, ${gg}, ${bb}, ${p.alpha * 0.35})`);
        halo.addColorStop(1, `rgba(${rr}, ${gg}, ${bb}, 0)`);
        orbCtx.fillStyle = halo;
        orbCtx.beginPath();
        orbCtx.arc(x, y, p.size * 4, 0, Math.PI * 2);
        orbCtx.fill();
      }

      if (!prefersReducedMotion) {
        p.angle += p.angleSpeed;
      }
    }
  }

  function frame(now) {
    if (!running) return;
    drawStarfield(now);
    drawOrb(now);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    startTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!prefersReducedMotion) start();
  });

  resize();
  if (prefersReducedMotion) {
    drawStarfield(0);
    drawOrb(0);
  } else {
    start();
  }
})();

(() => {
  "use strict";

  const el = document.querySelector(".subtext[data-rotating]");
  if (!el) return;

  const quotes = [
    "Something is being reforged in the depths of Azeroth.<br />Return when the anvils have cooled.",
    "Deep in the forge, embers still whisper.<br />The market shall rise.",
    "Coin shall flow like molten gold.<br />Patience, traveller.",
    "The hammer has not yet fallen.<br />Stand ready.",
    "Runes are being etched into the ledger.<br />Soon, you shall bid again.",
    "From the ashes of old markets, a new economy stirs.<br />The gavel sleeps.",
    "The auctioneer sharpens his voice in silence.<br />Listen for the call.",
    "Steel and gold are being weighed in the dark.<br />Return at dusk.",
    "Old contracts burn. New ones are being forged.<br />The market remembers.",
    "The gates of the market remain sealed.<br />For now."
  ];

  let idx = Math.floor(Math.random() * quotes.length);
  el.innerHTML = quotes[idx];

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  setInterval(() => {
    el.classList.add("is-fading");
    setTimeout(() => {
      idx = (idx + 1) % quotes.length;
      el.innerHTML = quotes[idx];
      el.classList.remove("is-fading");
    }, 700);
  }, 9000);
})();
