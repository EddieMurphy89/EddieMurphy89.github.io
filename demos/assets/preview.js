(() => {
  const posts = [
    {
      title: 'alictf2026-MHGA_Fileury',
      url: '/2026/02/11/alictf2026-MHGA-Fileury/',
      date: '2026.02.11',
      tag: '比赛',
      tagUrl: '/tags/%E6%AF%94%E8%B5%9B/',
      excerpt: 'ALICTF 的题目一如既往的优质。MHGA 三血非预期解，从题目依赖、预期思路到完整利用链的复盘。'
    },
    {
      title: 'HkcertCTF Labyrinth复现',
      url: '/2025/12/30/HkcertCTF-Labyrinth%E5%A4%8D%E7%8E%B0/',
      date: '2025.12.30',
      tag: '比赛',
      tagUrl: '/tags/%E6%AF%94%E8%B5%9B/',
      excerpt: 'Hessian-lite 4.0.5 反序列化分析，记录赛后复现过程，以及从新 Gadget 思路到利用链的完整探索。'
    },
    {
      title: 'React Server Components · 核弹级 RCE 复现',
      url: '/2025/12/05/React-Server-Components-%E6%A0%B8%E5%BC%B9%E7%BA%A7RCE%E5%A4%8D%E7%8E%B0-CVE-2025-55182/',
      date: '2025.12.05',
      tag: '漏洞复现',
      tagUrl: '/tags/%E6%BC%8F%E6%B4%9E%E5%A4%8D%E7%8E%B0/',
      excerpt: 'React2Shell / CVE-2025-55182 漏洞分析、影响条件与利用过程记录，拆解 RSC 反序列化攻击面。'
    },
    {
      title: '强网拟态2025 · WEB',
      url: '/2025/10/28/%E5%BC%BA%E7%BD%91%E6%8B%9F%E6%80%812025-WEB/',
      date: '2025.10.28',
      tag: '比赛',
      tagUrl: '/tags/%E6%AF%94%E8%B5%9B/',
      excerpt: '从环境变量劫持到恶意服务搭建，利用 wgetrc 与 Content-Disposition 完成 RCE 的解题过程。'
    },
    {
      title: 'WMCTF2025 · WEB Learning',
      url: '/2025/09/26/WMCTF2025-WEB-Learning/',
      date: '2025.09.26',
      tag: 'Java',
      tagUrl: '/tags/Java/',
      excerpt: '从 pdf2text 到 Pickle 反序列化，追踪 Gadget 调用链，梳理 WMCTF 赛题中的关键知识点。'
    }
  ];

  const themes = [
    ['cyberpunk', '01', '赛博霓虹']
  ];

  document.documentElement.classList.add('js');

  function renderPosts() {
    document.querySelectorAll('[data-posts]').forEach((container) => {
      container.innerHTML = posts.map((post, index) => `
        <article class="post-card reveal" style="--delay: ${index * 75}ms">
          <div class="post-card-head">
            <span class="post-number">LOG_${String(index + 1).padStart(2, '0')}</span>
            <span class="post-status"><i></i> PUBLISHED</span>
          </div>
          <div class="post-meta">
            <time>${post.date}</time>
            <a class="post-tag" href="${post.tagUrl}">#${post.tag}</a>
          </div>
          <h2><a href="${post.url}">${post.title}</a></h2>
          <p>${post.excerpt}</p>
          <a class="post-link" href="${post.url}" aria-label="阅读 ${post.title}">
            <span>阅读全文</span><b aria-hidden="true">↗</b>
          </a>
        </article>`).join('');
    });
  }

  function addThemeDock() {
    const current = document.body.dataset.theme;
    if (!current || current === 'lab') return;
    const dock = document.createElement('nav');
    dock.className = 'preview-dock';
    dock.setAttribute('aria-label', '赛博霓虹概念稿导航');
    dock.innerHTML = `
      <a class="dock-home" href="/" title="返回正式首页">NC//<br>2077</a>
      <span class="dock-divider"></span>
      <div class="dock-options">
        ${themes.map(([key, number, name]) => `
          <a href="/demos/${key}.html" class="${key === current ? 'active' : ''}" ${key === current ? 'aria-current="page"' : ''} title="${name}">
            <span>${number}</span><b>${name}</b>
          </a>`).join('')}
      </div>`;
    document.body.appendChild(dock);
  }

  function initReveals() {
    const items = document.querySelectorAll('.reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    items.forEach((item) => observer.observe(item));
  }

  function initSpotlights() {
    document.querySelectorAll('.post-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  function initScrollControls() {
    document.querySelectorAll('[data-scroll-to]').forEach((control) => {
      control.addEventListener('click', (event) => {
        const target = document.querySelector(control.dataset.scrollTo);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });
  }

  function init() {
    renderPosts();
    addThemeDock();
    initReveals();
    initSpotlights();
    initScrollControls();
    document.querySelectorAll('[data-year]').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
