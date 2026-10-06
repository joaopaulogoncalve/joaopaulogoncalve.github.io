(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = document.querySelector('.stage');
  const img = stage && stage.querySelector('img');
  const cv = document.getElementById('smoke');

  if (stage && cv) {
    const ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H;
    const size = () => {
      W = stage.clientWidth; H = stage.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); addEventListener('resize', size);

    const mouse = { x: .5, y: .5, vx: 0, vy: 0, on: 0 };
    addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth, ny = e.clientY / innerHeight;
      mouse.vx = (nx - mouse.x) * 60; mouse.vy = (ny - mouse.y) * 60;
      mouse.x = nx; mouse.y = ny; mouse.on = 150;
    });

    // cores de impressão: ciano, magenta, amarelo, verde, laranja
    const cols = [[0,183,235],[236,0,140],[255,216,0],[60,200,90],[255,120,20]];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const ps = [];
    let t = 0, px = 0, py = 0;

    const spawn = () => {
      const side = Math.random() < .5 ? -1 : 1;
      ps.push({
        x: W * .5 + rnd(-40, 40), y: H * .38 + rnd(-40, 40),
        vx: side * rnd(.5, 2.2), vy: rnd(-.8, .4),
        life: 0, max: rnd(200, 360), r: rnd(35, 90),
        c: cols[(Math.random() * cols.length) | 0], s: rnd(0, 6.28)
      });
    };

    const loop = () => {
      requestAnimationFrame(loop);
      if (scrollY > H) return;           // pausa quando o hero saiu da tela
      t++;
      if (mouse.on > 0) mouse.on--;
      mouse.vx *= .9; mouse.vy *= .9;

      // parallax suave da lâmpada (mouse + rolagem)
      if (img && !reduce) {
        px += ((.5 - mouse.x) * 40 - px) * .06;
        py += ((.5 - mouse.y) * 24 - py) * .06;
        img.style.transform = `translate(${px}px,${py + scrollY * .25}px) scale(1.12)`;
      }

      ctx.clearRect(0, 0, W, H);
      if (!reduce && ps.length < 140) spawn();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (++p.life > p.max) { ps.splice(i, 1); continue; }
        if (mouse.on) {                  // o mouse vira "vento" e atrai a fumaça
          p.vx += mouse.vx * .02 + (mouse.x * W - p.x) * .00004;
          p.vy += mouse.vy * .02 + (mouse.y * H - p.y) * .00004;
        }
        p.vx *= .996; p.vy -= .003;
        p.x += p.vx; p.y += p.vy + Math.sin(t * .012 + p.s) * .4;
        const a = Math.sin(Math.PI * p.life / p.max) * .17, r = p.r * (1 + p.life / p.max);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(${p.c},${a})`); g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    loop();
  }

  // aparecer ao rolar
  const els = document.querySelectorAll('.card,.portfolio-card,.totem-card,.about-content');
  els.forEach(e => e.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  els.forEach(e => io.observe(e));

  // carrossel (substitui o script inline)
  const sl = [...document.querySelectorAll('.carousel-slide')];
  sl.forEach(s => {
    const im = s.querySelector('img');
    if (im) im.onerror = () => {
      im.style.visibility = 'hidden';
      s.style.minHeight = '400px';
      s.style.background = 'linear-gradient(135deg,#0f172a,#ec4899 150%)';
    };
  });
  let i = 0;
  const show = () => { sl.forEach((s, k) => s.style.display = k === i ? 'block' : 'none'); i = (i + 1) % sl.length; };
  if (sl.length) { show(); setInterval(show, 3500); }
})();
/* ecom.js — injeta no topo do <footer> uma faixa animada de entregas (avião + caminhões) */
(() => {
  const footer = document.querySelector('footer');
  if (!footer) return;

  const css = `
  .ec{position:relative;height:170px;margin:-50px 0 30px;overflow:hidden;background:linear-gradient(180deg,transparent,rgba(56,189,248,.10))}
  .ec-tag{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:3;font-size:.78rem;font-weight:600;color:#cbd5e1;background:rgba(15,23,42,.8);border:1px solid #334155;border-radius:20px;padding:4px 14px;white-space:nowrap}
  .ec svg{display:block;overflow:visible}
  .ec-cloud{position:absolute;fill:rgba(255,255,255,.07);animation:ec-cloud linear infinite}
  .ec-plane{position:absolute;top:42px;left:-340px;animation:ec-fly 24s linear infinite}
  .ec-plane svg{animation:ec-bob 3s ease-in-out infinite alternate}
  .ec-road{position:absolute;left:0;right:0;bottom:0;height:34px;background:#0b1120;border-top:2px solid #1e293b}
  .ec-road::before{content:"";position:absolute;left:0;right:0;top:15px;height:3px;background:repeating-linear-gradient(90deg,#ffe600 0 26px,transparent 26px 54px);animation:ec-road .6s linear infinite}
  .ec-truck{position:absolute;left:-200px;animation:ec-drive 13s linear infinite}
  .ec-truck.a{bottom:8px}
  .ec-truck.b{bottom:30px;left:auto;right:-200px;transform:scale(.8);transform-origin:bottom;animation:ec-drive-rev 19s linear infinite;animation-delay:-6s}
  .ec-truck.b svg{transform:scaleX(-1)}
  .ec-truck svg{animation:ec-bob .35s ease-in-out infinite alternate}
  .ec-wheel{transform-box:fill-box;transform-origin:center;animation:ec-spin .5s linear infinite}
  @keyframes ec-drive{to{transform:translateX(calc(100vw + 400px))}}
  @keyframes ec-drive-rev{from{transform:scale(.8) translateX(0)}to{transform:scale(.8) translateX(calc(-125vw - 500px))}}
  @keyframes ec-fly{to{transform:translateX(calc(100vw + 700px))}}
  @keyframes ec-cloud{from{transform:translateX(-200px)}to{transform:translateX(calc(100vw + 200px))}}
  @keyframes ec-bob{to{transform:translateY(-2px)}}
  @keyframes ec-spin{to{transform:rotate(360deg)}}
  @keyframes ec-road{to{background-position:-54px 0}}
  @media (prefers-reduced-motion:reduce){.ec *{animation:none!important}.ec-truck.a{left:12%}.ec-truck.b{right:12%}.ec-plane{left:55%}}
  `;

  // desenhos genéricos (sem logos de marcas): só as cores lembram cada marketplace
  const truck = (cargo, cab, stripe) => `
  <svg width="170" height="72" viewBox="0 0 170 72">
    <rect x="0" y="6" width="108" height="46" rx="4" fill="${cargo}"/>
    <rect x="0" y="36" width="108" height="7" fill="${stripe}"/>
    <path d="M112 18h26l20 18v16h-46z" fill="${cab}"/>
    <path d="M118 23h17l12 12h-29z" fill="#bae6fd"/>
    <rect x="0" y="50" width="160" height="4" fill="#111827"/>
    ${[26, 80, 136].map(x => `<g class="ec-wheel"><circle cx="${x}" cy="56" r="11" fill="#0f172a" stroke="#475569" stroke-width="2"/><path d="M${x} 47v18M${x - 9} 56h18" stroke="#94a3b8" stroke-width="2"/></g>`).join('')}
  </svg>`;

  const plane = `
  <svg width="200" height="70" viewBox="0 0 200 70">
    <path d="M-120 28 L-6 34" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>
    <rect x="-250" y="14" width="132" height="30" rx="4" fill="#ffe600" stroke="#2d3277" stroke-width="2"/>
    <text x="-184" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#2d3277" font-family="Segoe UI,Arial,sans-serif">Chegou rapidinho! 📦</text>
    <path d="M10 34q0-9 22-9h90q36 3 52 9-16 6-52 9H32q-22 0-22-9z" fill="#ffe600"/>
    <path d="M18 25L6 4h26l14 21z" fill="#2d3277"/>
    <path d="M78 40l32 24h16L108 40z" fill="#2d3277"/>
    <path d="M78 28l30-22h14l-16 22z" fill="#2d3277"/>
    ${[100, 120, 140].map(x => `<circle cx="${x}" cy="31" r="3.2" fill="#2d3277"/>`).join('')}
  </svg>`;

  const clouds = [[22, 60, 40], [58, 48, 55], [8, 80, 70]].map(([top, w, d], i) =>
    `<svg class="ec-cloud" style="top:${top}px;animation-duration:${d}s;animation-delay:-${i * 15}s" width="${w}" height="24" viewBox="0 0 60 24"><ellipse cx="30" cy="16" rx="28" ry="8"/><circle cx="22" cy="11" r="9"/><circle cx="36" cy="9" r="10"/></svg>`).join('');

  const wrap = document.createElement('div');
  wrap.className = 'ec';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `<style>${css}</style>
    <div class="ec-tag">📦 Do anúncio à entrega</div>
    ${clouds}
    <div class="ec-plane">${plane}</div>
    <div class="ec-road"></div>
    <div class="ec-truck b">${truck('#ee4d2d', '#c93a1e', '#ffffff')}</div>
    <div class="ec-truck a">${truck('#ffe600', '#2d3277', '#2d3277')}</div>`;
  footer.insertBefore(wrap, footer.firstChild);
})();
