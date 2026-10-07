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
      const k = Math.random();
      let ox = W * .5 + rnd(-40, 40), oy = H * .38 + rnd(-40, 40);   // origem: a lâmpada
      if (k > .4 && k < .75) { ox = Math.random() < .5 ? rnd(-30, 60) : W - rnd(-30, 60); oy = rnd(0, H); } // laterais da tela
      else if (k >= .75 && mouse.on) { ox = mouse.x * W; oy = mouse.y * H; }                              // rastro do mouse
      const side = ox < W / 2 ? 1 : -1;
      ps.push({
        x: ox, y: oy, vx: side * rnd(.5, 2.2), vy: rnd(-.8, .4),
        life: 0, max: rnd(200, 360), r: rnd(50, 130),
        c: cols[(Math.random() * cols.length) | 0], s: rnd(0, 6.28)
      });
    };

    const loop = () => {
      requestAnimationFrame(loop);
      t++;
      if (mouse.on > 0) mouse.on--;
      mouse.vx *= .9; mouse.vy *= .9;

      // parallax suave da lâmpada (mouse + rolagem)
      if (img && !reduce) {
        px += ((.5 - mouse.x) * 40 - px) * .06;
        py += ((.5 - mouse.y) * 24 - py) * .06;
        img.style.transform = `translate(${px}px,${py}px) scale(1.08)`;
      }

      ctx.clearRect(0, 0, W, H);
      if (!reduce && ps.length < (innerWidth < 700 ? 60 : 170)) spawn();
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
  const els = document.querySelectorAll('.card,.portfolio-card,.totem-card,.about-content,.xp-card');
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
/* ecom — faixas animadas de entrega (avião + caminhões), em 3 pontos da página */
(() => {
  const css = `
  .ec{position:relative;z-index:2;overflow:hidden;background:linear-gradient(180deg,transparent,rgba(56,189,248,.08))}
  .ec.foot{margin:-50px 0 24px}
  .ec-tag{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:3;font-size:.75rem;font-weight:600;color:#cbd5e1;background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:20px;padding:3px 12px;white-space:nowrap}
  .ec svg{display:block;overflow:visible}
  .ec-cloud{position:absolute;fill:rgba(255,255,255,.08);animation:ec-cloud linear infinite}
  .ec-plane{position:absolute;top:16px;left:-300px;animation:ec-fly 26s linear infinite}
  .ec.foot .ec-plane{top:34px}
  .ec-plane svg{animation:ec-bob 3s ease-in-out infinite alternate}
  .ec-road{position:absolute;left:0;right:0;bottom:0;height:22px;background:#0b1120;border-top:2px solid #1e293b}
  .ec-road::before{content:"";position:absolute;left:0;right:0;top:8px;height:3px;background:repeating-linear-gradient(90deg,#ffe600 0 20px,transparent 20px 44px);animation:ec-road .6s linear infinite}
  .ec-truck{position:absolute;left:-220px}
  .ec-truck.a{bottom:2px;animation:ec-drive 15s linear infinite}
  .ec-truck.b{bottom:13px;left:auto;right:-220px;animation:ec-drive-rev 22s linear infinite;animation-delay:-8s}
  .ec-in{transform-origin:bottom center;transform:scale(.55)}
  .ec-in.flip{transform:scaleX(-1) scale(.5)}
  .ec-truck svg{animation:ec-bob .35s ease-in-out infinite alternate}
  .ec-wheel{transform-box:fill-box;transform-origin:center;animation:ec-spin .5s linear infinite}
  @keyframes ec-drive{to{transform:translateX(calc(100vw + 440px))}}
  @keyframes ec-drive-rev{to{transform:translateX(calc(-100vw - 440px))}}
  @keyframes ec-fly{to{transform:translateX(calc(100vw + 340px))}}
  @keyframes ec-cloud{from{transform:translateX(-200px)}to{transform:translateX(calc(100vw + 200px))}}
  @keyframes ec-bob{to{transform:translateY(-2px)}}
  @keyframes ec-spin{to{transform:rotate(360deg)}}
  @keyframes ec-road{to{background-position:-44px 0}}
  @media (prefers-reduced-motion:reduce){.ec *{animation:none!important}.ec-truck.a{left:12%}.ec-truck.b{right:12%}.ec-plane{left:50%}}
  `;

  // desenhos genéricos (sem logos): só as cores lembram cada marketplace
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
  <svg width="240" height="42" viewBox="-160 0 320 56">
    <path d="M6 30L-18 30" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>
    <rect x="-150" y="16" width="132" height="28" rx="4" fill="#ffe600" stroke="#2d3277" stroke-width="2"/>
    <text x="-84" y="34.5" text-anchor="middle" font-size="11" font-weight="700" fill="#2d3277" font-family="Segoe UI,Arial,sans-serif">Chegou rapidinho! 📦</text>
    <path d="M6 30C6 22 20 20 40 20H118C140 20 154 26 158 30C154 34 140 40 118 40H40C20 40 6 38 6 30Z" fill="#ffe600" stroke="#2d3277" stroke-width="2"/>
    <path d="M10 22L2 4H24L38 21Z" fill="#2d3277"/>
    <path d="M62 33L92 54H108L90 33Z" fill="#2d3277"/>
    <ellipse cx="86" cy="47" rx="10" ry="4" fill="#1e1b4b"/>
    <path d="M8 33H152" stroke="#2d3277" stroke-width="3"/>
    ${[56, 68, 80, 92, 104, 116].map(x => `<circle cx="${x}" cy="27.5" r="2.6" fill="#bae6fd"/>`).join('')}
    <path d="M132 25q10 0 17 5h-17z" fill="#bae6fd"/>
  </svg>`;

  const cloud = () => [[8, 50, 45, 0], [26, 70, 65, -25]].map(([t, w, d, dl]) =>
    `<svg class="ec-cloud" style="top:${t}px;animation-duration:${d}s;animation-delay:${dl}s" width="${w}" height="22" viewBox="0 0 60 24"><ellipse cx="30" cy="16" rx="28" ry="8"/><circle cx="22" cy="11" r="9"/><circle cx="36" cy="9" r="10"/></svg>`).join('');

  const strip = o => {
    const d = document.createElement('div');
    d.className = 'ec' + (o.foot ? ' foot' : '');
    d.style.height = o.h + 'px';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = (o.tag ? `<div class="ec-tag">${o.tag}</div>` : '') + cloud() +
      (o.plane ? `<div class="ec-plane" style="animation-delay:-${o.d || 0}s">${plane}</div>` : '') +
      '<div class="ec-road"></div>' +
      (o.b ? `<div class="ec-truck b"><div class="ec-in flip">${truck('#ee4d2d', '#c93a1e', '#fff')}</div></div>` : '') +
      (o.a ? `<div class="ec-truck a"><div class="ec-in">${truck('#ffe600', '#2d3277', '#2d3277')}</div></div>` : '');
    return d;
  };

  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const q = s => document.querySelector(s);
  const pf = q('.portfolio-section'), ab = q('.about-section'), ft = q('footer');
  if (pf) pf.before(strip({ h: 84, a: 1 }));                      // só o caminhão amarelo
  if (ab) ab.before(strip({ h: 84, plane: 1, d: 12 }));           // só o avião
  if (ft) ft.insertBefore(strip({ h: 110, plane: 1, a: 1, b: 1, foot: 1, tag: '📦 Do anúncio à entrega' }), ft.firstChild);
})();


/* paraquedista: quando o mouse para, desce até o fim da tela e aponta pra baixo */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.createElement('div');
  el.className = 'chute';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="chute-b">Tem mais aí embaixo! 👇</div>
  <svg viewBox="0 0 80 110">
    <defs><linearGradient id="chg" x1="0" x2="1"><stop offset="0" stop-color="#00b7eb"/><stop offset=".33" stop-color="#00b7eb"/><stop offset=".33" stop-color="#ec008c"/><stop offset=".66" stop-color="#ec008c"/><stop offset=".66" stop-color="#ffd800"/><stop offset="1" stop-color="#ffd800"/></linearGradient></defs>
    <g class="canopy">
      <path d="M6 34Q40-12 74 34Q64 28 54 34Q47 28 40 34Q33 28 26 34Q16 28 6 34Z" fill="url(#chg)" stroke="#1e293b" stroke-width="1.2"/>
      <path d="M8 34L36 68M40 34V66M72 34L44 68" stroke="#cbd5e1" stroke-width="1"/>
    </g>
    <g class="arms-u" stroke="#f5cba7" stroke-width="3" stroke-linecap="round"><path d="M33 86L27 66M47 86L53 66"/></g>
    <g class="arm-d" stroke="#f5cba7" stroke-width="3" stroke-linecap="round"><path d="M33 86L29 94"/><path d="M47 86L58 100"/><circle cx="58.5" cy="101" r="2.6" fill="#f5cba7" stroke="none"/></g>
    <path d="M35 96v9M45 96v9" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="31" y="82" width="18" height="15" rx="6" fill="#38bdf8"/>
    <circle cx="40" cy="70" r="11" fill="#f5cba7"/>
    <path d="M27.5 68A12.5 12.5 0 0 1 52.5 68Z" fill="#ffd800" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="25" y="67" width="30" height="3" rx="1.5" fill="#1e293b"/>
    <rect x="38.5" y="55" width="3" height="4" fill="#94a3b8"/><circle cx="40" cy="52" r="4.5" fill="#fff6a0" stroke="#1e293b" stroke-width="1.2"/>
    <circle cx="35.5" cy="73" r="3.2" fill="#fff"/><circle cx="44.5" cy="73" r="3.2" fill="#fff"/>
    <circle cx="36.2" cy="73.6" r="1.5" fill="#000"/><circle cx="45.2" cy="73.6" r="1.5" fill="#000"/>
    <path d="M35 78Q40 83 45 78" stroke="#000" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(el);

  let state = 'up', timer, landT, mx = innerWidth / 2, my = 0, lx = 0, ly = 0;
  const atEnd = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 120;
  const fly = () => { state = 'up'; clearTimeout(landT); el.classList.remove('land'); el.style.top = '-170px'; };
  const drop = () => {
    if (atEnd()) return;                       // já está no fim da página: não aparece
    state = 'down'; lx = mx; ly = my;
    el.style.left = Math.min(Math.max(mx, 60), innerWidth - 60) + 'px';
    el.style.top = (innerHeight - 135) + 'px';
    landT = setTimeout(() => state === 'down' && el.classList.add('land'), 2500);
  };
  const act = e => {
    if (e.type === 'mousemove') {
      mx = e.clientX; my = e.clientY;
      if (state !== 'up' && Math.hypot(mx - lx, my - ly) < 25) return;   // tremidinha do mouse não conta
    } else if (e.type === 'touchstart' && e.touches[0]) mx = e.touches[0].clientX;
    if (state !== 'up') fly();
    clearTimeout(timer);
    timer = setTimeout(drop, 1600);
  };
  ['mousemove', 'touchstart', 'scroll', 'keydown'].forEach(t => addEventListener(t, act, { passive: true }));
  timer = setTimeout(drop, 3000);
})();
