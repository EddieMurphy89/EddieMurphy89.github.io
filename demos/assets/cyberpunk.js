(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('particle-network');
  const hero = document.querySelector('.cyber-hero');
  const nav = document.querySelector('.cyber-nav');
  const cursor = document.querySelector('.cyber-cursor');
  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: -1000, y: -1000 };

  function resizeCanvas() {
    if (!canvas || !hero) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(85, Math.max(32, Math.floor(width * height / 18000)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .24,
      vy: (Math.random() - .5) * .24,
      radius: Math.random() * 1.4 + .5,
      color: index % 13 === 0 ? '#ff336f' : index % 9 === 0 ? '#f8e94e' : '#57f3ff'
    }));
  }

  function drawNetwork() {
    if (!canvas || document.hidden) {
      requestAnimationFrame(drawNetwork);
      return;
    }
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      if (!reducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.globalAlpha = .7;
      context.fill();
      for (let next = index + 1; next < particles.length; next += 1) {
        const other = particles[next];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 125) continue;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = particle.color;
        context.globalAlpha = (1 - distance / 125) * .17;
        context.lineWidth = .6;
        context.stroke();
      }
      const mouseDistance = Math.hypot(particle.x - mouse.x, particle.y - mouse.y);
      if (mouseDistance < 170) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(mouse.x, mouse.y);
        context.strokeStyle = '#57f3ff';
        context.globalAlpha = (1 - mouseDistance / 170) * .35;
        context.stroke();
      }
    });
    context.globalAlpha = 1;
    if (!reducedMotion) requestAnimationFrame(drawNetwork);
  }

  function initTilt() {
    if (reducedMotion || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.cyber-post-grid .post-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(950px) rotateX(${-y * 3.5}deg) rotateY(${x * 4.5}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function init() {
    resizeCanvas();
    drawNetwork();
    initTilt();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    hero.addEventListener('pointerleave', () => { mouse = { x: -1000, y: -1000 }; });
    window.addEventListener('pointermove', (event) => {
      if (cursor) cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    }, { passive: true });
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 80);
        if (!reducedMotion && y < window.innerHeight * 1.2) hero.style.setProperty('--cyber-scroll', `${y * .16}px`);
        ticking = false;
      });
    }, { passive: true });
    const timeNode = document.querySelector('[data-cyber-time]');
    const updateTime = () => {
      if (timeNode) timeNode.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
