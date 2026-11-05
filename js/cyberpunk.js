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
    const daemonList = document.getElementById('nc-daemons');
    const buffer = document.getElementById('nc-buffer');
    const status = document.getElementById('nc-breach-status');
    const resetButton = document.getElementById('nc-breach-reset');
    const shuffleButton = document.getElementById('nc-breach-shuffle');
    const timer = document.getElementById('nc-breach-timer');
    const stateLabel = document.getElementById('nc-breach-state');
    const pathLabel = document.getElementById('nc-breach-path');
    const hero = document.querySelector('.nc-hero');
    if (!panel || !matrix || !daemonList || !buffer || !status || !resetButton || !shuffleButton || !timer || !stateLabel || !pathLabel) return;

    const baseRows = [
      ['55', '1C', 'BD', 'E9', '7A'],
      ['BD', 'E9', '55', '1C', 'FF'],
      ['E9', '7A', 'BD', '55', '1C'],
      ['1C', 'FF', 'E9', 'BD', '55'],
      ['7A', '55', '1C', 'FF', 'BD']
    ];
    let rows = baseRows.map((row) => [...row]);
    const daemons = [
      { name: 'DATAMINE_V1', sequence: ['BD', '1C', 'BD'] },
      { name: 'DATAMINE_V2', sequence: ['1C', 'BD', '55'] },
      { name: 'DATAMINE_V3', sequence: ['BD', '55', 'FF'] }
    ];
    const capacity = 5;
    const duration = 90000;
    let state;
    let timerId = null;

    function shuffledIndices() {
      const order = [0, 1, 2, 3, 4];
      for (let index = order.length - 1; index > 0; index -= 1) {
        const target = Math.floor(Math.random() * (index + 1));
        [order[index], order[target]] = [order[target], order[index]];
      }
      return order;
    }

    function shuffledRows() {
      let rowOrder;
      let columnOrder;
      do {
        rowOrder = shuffledIndices();
        columnOrder = shuffledIndices();
      } while (rowOrder.every((value, index) => value === index) && columnOrder.every((value, index) => value === index));
      return rowOrder.map((row) => columnOrder.map((column) => baseRows[row][column]));
    }

    matrix.innerHTML = rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
      `<button type="button" data-row="${rowIndex}" data-column="${columnIndex}" aria-describedby="nc-breach-path nc-breach-status">${value}</button>`
    ))).join('');
    buffer.innerHTML = Array.from({ length: capacity }, () => '<li></li>').join('');
    daemonList.innerHTML = daemons.map((daemon) => (
      `<li><strong>${daemon.name}</strong><span class="nc-daemon-code">${daemon.sequence.map((value) => `<span>${value}</span>`).join('')}</span><small>WAITING</small></li>`
    )).join('');
    const buttons = Array.from(matrix.querySelectorAll('button'));
    const slots = Array.from(buffer.querySelectorAll('li'));
    const daemonRows = Array.from(daemonList.querySelectorAll('li'));

    function isFinished() {
      return state.phase !== 'ready' && state.phase !== 'running';
    }

    // Each daemon can match at any offset, including overlapping other daemons.
    function daemonProgress(sequence) {
      const uploaded = state.entries.some((_, start) => (
        sequence.every((value, offset) => state.entries[start + offset] === value)
      ));
      if (uploaded) return sequence.length;
      for (let length = Math.min(sequence.length - 1, state.entries.length); length > 0; length -= 1) {
        if (sequence.slice(0, length).every((value, offset) => (
          state.entries[state.entries.length - length + offset] === value
        ))) return length;
      }
      return 0;
    }

    function completedCount() {
      return daemons.filter((daemon) => daemonProgress(daemon.sequence) === daemon.sequence.length).length;
    }

    function isLegal(index) {
      const row = Math.floor(index / rows[0].length);
      const column = index % rows[0].length;
      return !isFinished() && !state.used.has(index) && (state.axis === 'row' ? row : column) === state.line;
    }

    function renderTimer() {
      const seconds = Math.ceil(state.remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainder = seconds % 60;
      timer.textContent = `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
      timer.setAttribute('aria-label', `${seconds} seconds remaining`);
      timer.classList.toggle('is-urgent', seconds <= 10);
    }

    function render() {
      const finished = isFinished();
      panel.dataset.state = state.phase;
      stateLabel.textContent = `ICE // ${state.phase.toUpperCase()}`;
      pathLabel.textContent = finished ? 'SESSION ENDED // REINITIALIZE TO RETRY' : `${state.phase === 'ready' ? 'START' : 'NEXT'} // ${state.axis.toUpperCase()} ${state.line + 1}`;
      buttons.forEach((button, index) => {
        const used = state.used.has(index);
        const legal = isLegal(index);
        button.classList.toggle('is-axis', legal);
        button.classList.toggle('is-used', used);
        button.classList.toggle('is-selected', index === state.lastCell);
        // Keep native buttons focusable/clickable so rejected moves explain why.
        button.setAttribute('aria-disabled', String(!legal));
        const reason = finished ? 'session ended; reinitialize to retry' : used ? 'already used' : legal ? 'available' : `choose ${state.axis} ${state.line + 1}`;
        button.setAttribute('aria-label', `Row ${Math.floor(index / 5) + 1}, column ${index % 5 + 1}: ${rows[Math.floor(index / 5)][index % 5]}, ${reason}`);
      });
      slots.forEach((slot, index) => {
        slot.textContent = state.entries[index] || '—';
        slot.classList.toggle('is-filled', index < state.entries.length);
        slot.setAttribute('aria-label', `Slot ${index + 1}: ${state.entries[index] || 'empty'}`);
      });
      daemonRows.forEach((row, index) => {
        const progress = daemonProgress(daemons[index].sequence);
        const uploaded = progress === daemons[index].sequence.length;
        row.classList.toggle('is-uploaded', uploaded);
        row.querySelector('small').textContent = uploaded ? 'UPLOADED' : finished ? 'MISSED' : progress ? `${progress}/3` : 'WAITING';
        row.querySelectorAll('.nc-daemon-code > span').forEach((code, offset) => {
          code.classList.toggle('is-done', offset < progress);
        });
      });
      renderTimer();
    }

    function stopTimer() {
      window.clearInterval(timerId);
      timerId = null;
    }

    function reset() {
      stopTimer();
      state = { phase: 'ready', entries: [], used: new Set(), lastCell: null, axis: 'row', line: 0, deadline: null, remaining: duration };
      buttons.forEach((button, index) => {
        button.textContent = rows[Math.floor(index / 5)][index % 5];
      });
      panel.classList.remove('is-invalid', 'is-error', 'is-success', 'is-partial');
      hero?.classList.remove('nc-access-granted');
      status.textContent = 'AWAITING INPUT // 0/3 DAEMONS';
      render();
    }

    function finish(reason) {
      if (isFinished()) return;
      const count = completedCount();
      state.phase = count === daemons.length ? 'complete' : count > 0 ? 'partial' : 'failure';
      stopTimer();
      panel.classList.remove('is-invalid');
      panel.classList.toggle('is-success', state.phase === 'complete');
      panel.classList.toggle('is-partial', state.phase === 'partial');
      panel.classList.toggle('is-error', state.phase === 'failure');
      hero?.classList.toggle('nc-access-granted', state.phase === 'complete');
      status.textContent = `${state.phase.toUpperCase()} // ${count}/3 UPLOADED // ${reason}`;
      render();
    }

    function tick() {
      if (state.phase !== 'running') return;
      state.remaining = Math.max(0, state.deadline - Date.now());
      renderTimer();
      if (state.remaining === 0) finish('TIME EXPIRED');
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Check the deadline on input too: background tabs may delay timer ticks.
        tick();
        if (isFinished()) return;
        if (!isLegal(index)) {
          panel.classList.add('is-invalid');
          status.textContent = state.used.has(index)
            ? 'CELL ALREADY USED // CHOOSE A HIGHLIGHTED CELL'
            : `OFF AXIS // CHOOSE ${state.axis.toUpperCase()} ${state.line + 1}`;
          return;
        }
        if (state.phase === 'ready') {
          state.phase = 'running';
          state.deadline = Date.now() + duration;
          timerId = window.setInterval(tick, 100);
        }
        const row = Math.floor(index / rows[0].length);
        const column = index % rows[0].length;
        state.entries.push(rows[row][column]);
        state.used.add(index);
        state.lastCell = index;
        state.axis = state.axis === 'row' ? 'column' : 'row';
        state.line = state.axis === 'row' ? row : column;
        panel.classList.remove('is-invalid');
        if (completedCount() === daemons.length) finish('ACCESS GRANTED');
        else if (state.entries.length === capacity) finish('BUFFER FULL');
        else {
          status.textContent = `UPLOADING // ${completedCount()}/3 DAEMONS`;
          render();
        }
      });
    });

    function shuffle() {
      rows = shuffledRows();
      reset();
      status.textContent = 'NEW MATRIX GENERATED // 0/3 DAEMONS';
      matrix.classList.remove('is-shuffling');
      void matrix.offsetWidth;
      matrix.classList.add('is-shuffling');
    }

    resetButton.addEventListener('click', reset);
    shuffleButton.addEventListener('click', shuffle);
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
