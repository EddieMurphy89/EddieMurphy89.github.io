(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const interfaceText = {
    '首页': 'HOME',
    '归档': 'ARCHIVES',
    '分类': 'CATEGORIES',
    '标签': 'TAGS',
    '关于': 'ABOUT',
    '友情链接': 'LINKS',
    '页面不存在': '404 // SIGNAL LOST',
    '目录': 'CONTENTS',
    '上一篇': 'PREV',
    '下一篇': 'NEXT',
    '作者': 'AUTHOR',
    '发布于': 'PUBLISHED',
    '更新于': 'UPDATED',
    '许可协议': 'LICENSE',
    '主题博客': 'THEME BLOG',
    '主题使用指南': 'THEME DOCUMENTATION',
    '主题 GitHub 仓库': 'THEME GITHUB REPOSITORY'
  };
  const tagText = {
    '比赛': 'COMPETITION',
    '其他': 'MISC',
    '娱乐向': 'LIFESTYLE',
    '漏洞复现': 'VULN_REPRO',
    'CVE复现': 'CVE_REPRO'
  };
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function translateExact(selector, dictionary = interfaceText) {
    document.querySelectorAll(selector).forEach((node) => {
      const translated = dictionary[node.textContent.trim()];
      if (translated) node.textContent = translated;
    });
  }

  function translateSubtitle() {
    const subtitle = document.getElementById('subtitle');
    if (!subtitle || document.querySelector('.post-content')) return;
    const original = subtitle.dataset.typedText || subtitle.textContent.trim();
    let translated = interfaceText[original];
    const tagMatch = original.match(/^标签\s*-\s*(.+)$/);
    if (tagMatch) translated = `TAGS // ${tagText[tagMatch[1]] || tagMatch[1]}`;
    if (!translated) return;
    const replacement = subtitle.cloneNode(false);
    replacement.dataset.typedText = translated;
    replacement.textContent = translated;
    subtitle.replaceWith(replacement);
    if (document.title.includes(original)) document.title = document.title.replace(original, translated);
  }

  function translatePostMetadata() {
    document.querySelectorAll('#banner time[datetime]').forEach((time) => {
      const match = time.dateTime.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
      if (!match) return;
      const [, year, month, day, hour, minute] = match;
      let formatted = `${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`;
      if (hour !== undefined) {
        const hourNumber = Number(hour);
        const period = hourNumber >= 12 ? 'PM' : 'AM';
        const hour12 = hourNumber % 12 || 12;
        formatted += ` // ${hour12}:${minute} ${period}`;
      }
      time.textContent = formatted;
    });
    document.querySelectorAll('#banner .post-meta, #banner #busuanzi_container_page_pv').forEach((meta) => {
      meta.childNodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.textContent = node.textContent
          .replace(/([\d.,]+k?)\s*字/gi, '$1 WORDS')
          .replace(/(\d+)\s*分钟/g, '$1 MIN READ')
          .replace(/\s*次\s*$/, ' VIEWS');
      });
    });
    document.querySelectorAll('.license-meta-date div:last-child').forEach((node) => {
      node.textContent = node.textContent.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/, (_, year, month, day) => (
        `${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`
      ));
    });
  }

  function localizeInterface() {
    translateExact('.navbar-nav .nav-link span');
    translateExact('.toc-header span');
    translateExact('.visible-mobile');
    translateExact('.license-meta-item > div:first-child');
    translateExact('.link-intro');
    translateSubtitle();
    translatePostMetadata();

    document.querySelectorAll('#modalSearch .modal-title').forEach((node) => { node.textContent = 'SEARCH DATABASE'; });
    document.querySelectorAll('label[for="local-search-input"]').forEach((node) => { node.textContent = 'KEYWORDS'; });
    document.querySelectorAll('[aria-label="BY - 署名"]').forEach((node) => { node.setAttribute('aria-label', 'BY - ATTRIBUTION'); });
    document.querySelectorAll('.list-group > .h4').forEach((node) => {
      node.textContent = node.textContent.replace(/共计\s*(\d+)\s*篇文章/, '$1 LOG ENTRIES');
    });
    document.querySelectorAll('a[href^="/tags/"], a[href^="/categories/"]').forEach((link) => {
      const current = link.textContent.trim();
      const hasHash = current.startsWith('#');
      const name = current.replace(/^#/, '');
      if (tagText[name]) link.textContent = `${hasHash ? '#' : ''}${tagText[name]}`;
    });
  }

  function prepareComments() {
    if (!document.getElementById('waline') || !window.Fluid?.utils) return;
    const useEnglish = () => {
      if (!window.Waline?.init || window.Waline.init.__ncEnglish) return;
      const originalInit = window.Waline.init;
      window.Waline.init = function(options) {
        return originalInit.call(this, Object.assign({}, options, { lang: 'en-US' }));
      };
      window.Waline.init.__ncEnglish = true;
    };
    if (window.Waline) useEnglish();
    const originalCreateScript = window.Fluid.utils.createScript;
    window.Fluid.utils.createScript = function(url, onload) {
      if (url.includes('@waline/client')) {
        const originalOnload = onload;
        onload = function() {
          useEnglish();
          if (typeof originalOnload === 'function') originalOnload();
        };
      }
      return originalCreateScript.call(this, url, onload);
    };
  }

  function enhanceChrome() {
    document.querySelectorAll('.navbar-brand').forEach((brand) => {
      brand.innerHTML = '<span class="nc-brand-mark">EM</span><span class="nc-brand-copy">EDDIE//MURPHY<small>NIGHT CITY DATABASE</small></span>';
    });
    if (document.querySelector('.post-content')) document.body.classList.add('nc-article');
    if (document.querySelector('.list-group')) document.body.classList.add('nc-logs');
  }

  function initCursor() {
    if (!finePointer) return;
    const cursor = document.createElement('div');
    cursor.className = 'nc-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    window.addEventListener('pointermove', (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    }, { passive: true });
  }

  function initReveals() {
    const items = document.querySelectorAll('.nc-reveal');
    if (!items.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('nc-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('nc-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -35px' });
    items.forEach((item) => observer.observe(item));
  }

  function initIndexCards() {
    const cards = Array.from(document.querySelectorAll('#board .index-card'));
    if (!cards.length) return;
    const container = cards[0].parentElement;
    container.classList.add('nc-index-list');
    container.querySelectorAll('.nc-section-heading').forEach((heading) => heading.classList.add('nc-reveal'));
    cards.forEach((card, index) => {
      card.dataset.shard = `DATA_SHARD_${String(index + 1).padStart(2, '0')} // ENCRYPTED`;
      card.style.setProperty('--nc-delay', `${(index % 4) * 60}ms`);
      card.classList.add('nc-reveal');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
        if (finePointer && !reducedMotion) {
          const rx = (x / rect.width - .5) * 3.5;
          const ry = (y / rect.height - .5) * -3;
          card.style.transform = `perspective(950px) rotateX(${ry}deg) rotateY(${rx}deg) translateY(-4px)`;
        }
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
    document.querySelectorAll('.nc-wakeup').forEach((section) => section.classList.add('nc-reveal'));
  }

  function initParticles(hero) {
    const canvas = document.getElementById('nc-particles');
    if (!canvas) return { pointer: () => {} };
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const mouse = { x: -1000, y: -1000 };

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(78, Math.max(30, Math.floor(width * height / 19500)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .23,
        vy: (Math.random() - .5) * .23,
        radius: Math.random() * 1.3 + .45,
        color: index % 12 === 0 ? '#ff365f' : index % 7 === 0 ? '#f3e600' : '#54e8f2'
      }));
    }

    function draw() {
      if (document.hidden) {
        requestAnimationFrame(draw);
        return;
      }
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
        context.globalAlpha = .65;
        context.fill();
        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance > 120) continue;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = particle.color;
          context.globalAlpha = (1 - distance / 120) * .16;
          context.lineWidth = .6;
          context.stroke();
        }
        const mouseDistance = Math.hypot(particle.x - mouse.x, particle.y - mouse.y);
        if (mouseDistance < 165) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(mouse.x, mouse.y);
          context.strokeStyle = '#f3e600';
          context.globalAlpha = (1 - mouseDistance / 165) * .3;
          context.stroke();
        }
      });
      context.globalAlpha = 1;
      if (!reducedMotion) requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    return {
      pointer(x, y) { mouse.x = x; mouse.y = y; },
      leave() { mouse.x = -1000; mouse.y = -1000; }
    };
  }

  function initBreach() {
    const panel = document.querySelector('.nc-breach');
    const matrix = document.getElementById('nc-code-matrix');
    const required = document.getElementById('nc-required');
    const buffer = document.getElementById('nc-buffer');
    const status = document.getElementById('nc-breach-status');
    const resetButton = document.getElementById('nc-breach-reset');
    if (!panel || !matrix || !required || !buffer || !status || !resetButton) return;

    const rows = [
      ['55', '1C', 'BD', 'E9', '7A'],
      ['BD', 'E9', '55', '1C', 'FF'],
      ['E9', '7A', 'BD', '55', '1C'],
      ['1C', 'FF', 'E9', 'BD', '55'],
      ['7A', '55', '1C', 'FF', 'BD']
    ];
    const sequence = ['1C', 'BD', '55'];
    let progress = 0;
    let entries = [];
    let locked = false;

    matrix.innerHTML = rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
      `<button type="button" data-value="${value}" data-row="${rowIndex}" data-column="${columnIndex}" aria-label="Hex code ${value}">${value}</button>`
    ))).join('');
    buffer.innerHTML = `<span>BUFFER // 05</span>${Array.from({ length: 5 }, () => '<i></i>').join('')}`;
    const buttons = Array.from(matrix.querySelectorAll('button'));
    const slots = Array.from(buffer.querySelectorAll('i'));

    function renderSequence() {
      required.innerHTML = sequence.map((value, index) => {
        const className = index < progress ? 'is-done' : index === progress ? 'is-next' : '';
        return `<span class="${className}">${value}</span>`;
      }).join('');
    }

    function renderBuffer() {
      slots.forEach((slot, index) => {
        slot.textContent = entries[index] || '';
        slot.classList.toggle('is-filled', index < entries.length);
      });
    }

    function clearAxis() {
      buttons.forEach((button) => button.classList.remove('is-axis'));
    }

    function reset() {
      progress = 0;
      entries = [];
      locked = false;
      panel.classList.remove('is-error', 'is-success');
      status.textContent = 'AWAITING INPUT // 3 DAEMONS';
      buttons.forEach((button) => {
        button.disabled = false;
        button.classList.remove('is-used', 'is-selected', 'is-axis');
      });
      renderSequence();
      renderBuffer();
    }

    function fail() {
      locked = true;
      panel.classList.add('is-error');
      status.textContent = 'ACCESS DENIED // TRACE DETECTED';
      buttons.forEach((button) => { button.disabled = true; });

    }

    function succeed() {
      locked = true;
      panel.classList.remove('is-error');
      panel.classList.add('is-success');
      status.textContent = 'ACCESS GRANTED // SHARD DECRYPTED';
      buttons.forEach((button) => { button.disabled = true; });
      document.querySelector('.nc-hero')?.classList.add('nc-access-granted');
    }

    buttons.forEach((button) => {
      button.addEventListener('pointerenter', () => {
        clearAxis();
        buttons.forEach((other) => {
          if (other.dataset.row === button.dataset.row || other.dataset.column === button.dataset.column) other.classList.add('is-axis');
        });
      });
      button.addEventListener('click', () => {
        if (locked || button.classList.contains('is-used')) return;
        buttons.forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected', 'is-used');
        entries.push(button.dataset.value);
        if (button.dataset.value === sequence[progress]) {
          progress += 1;
          status.textContent = `DAEMON UPLOAD // ${progress} OF ${sequence.length}`;
          renderSequence();
          renderBuffer();
          if (progress === sequence.length) succeed();
          else if (entries.length >= slots.length) fail();
        } else {
          renderBuffer();
          fail();
        }
      });
    });
    matrix.addEventListener('pointerleave', clearAxis);
    resetButton.addEventListener('click', reset);
    reset();
  }

  function initHome() {
    const hero = document.querySelector('.nc-hero');
    if (!hero) return;
    const scanner = document.getElementById('nc-scanner');
    const particles = initParticles(hero);
    initBreach();

    if (finePointer) {
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        particles.pointer(x, y);
        if (scanner) {
          scanner.style.transform = `translate3d(${x - 55}px,${y - 55}px,0)`;
          scanner.classList.add('is-active');
          if (Math.random() > .94) scanner.dataset.readout = Math.random() > .5 ? 'KIROSHI // ANALYZING' : 'NO THREAT DETECTED';
        }
      });
      hero.addEventListener('pointerleave', () => {
        particles.leave();
        scanner?.classList.remove('is-active');
      });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking || reducedMotion) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) hero.style.setProperty('--nc-parallax', `${y * .14}px`);
        ticking = false;
      });
    }, { passive: true });

    const timeNode = document.querySelector('[data-nc-time]');
    const updateTime = () => {
      if (timeNode) timeNode.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  function init() {
    prepareComments();
    localizeInterface();
    enhanceChrome();
    initCursor();
    initIndexCards();
    initHome();
    initReveals();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
