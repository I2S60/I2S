import { readFileSync, writeFileSync } from 'node:fs';
const [, , geoFile, out] = process.argv;
const g = JSON.parse(readFileSync(geoFile));

// Camera: wide (Atlantic → Middle East) then push to Morocco framed left-of-centre.
const WIDE = [-720, -405, 3360, 1890];
const VB_H = 680, VB_W = VB_H * 16 / 9;
const [x0, y0, x1, y1] = g.bbox;
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
const FINAL = [cx - 0.36 * VB_W, cy - 0.5 * VB_H, VB_W, VB_H];
const DRIFT = [FINAL[0] + VB_W * 0.012, FINAL[1] + VB_H * 0.018, VB_W * 0.97, VB_H * 0.97];
const vb = a => a.map(v => v.toFixed(1)).join(' ');

// Label placement (base units, ~1.6x on screen at the hold).
const place = {
  Tanger: [-11, -7, 'end'], Rabat: [-11, -9, 'end'], Casablanca: [-11, 15, 'end'],
  'Fès': [11, 5, 'start'], Marrakech: [11, 5, 'start'], Agadir: [-11, 5, 'end'],
  'Laâyoune': [-11, 5, 'end'], Dakhla: [-11, 5, 'end'],
};
const order = ['Rabat', 'Tanger', 'Casablanca', 'Fès', 'Marrakech', 'Agadir', 'Laâyoune', 'Dakhla'];
const cities = order.map(n => g.cities.find(c => c.n === n));
const slug = n => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const cityG = cities.map(c => {
  const [dx, dy, anchor] = place[c.n];
  const cap = c.n === 'Rabat';
  return `<g class="city${cap ? ' city--cap' : ''}" id="city-${slug(c.n)}" transform="translate(${c.x} ${c.y})">
          <circle class="ring" r="4" />
          ${cap ? '<rect class="dot dot--cap" x="-4.6" y="-4.6" width="9.2" height="9.2" transform="rotate(45)" />' : '<circle class="dot" r="3.4" />'}
          <text class="lbl" x="${dx}" y="${dy}" text-anchor="${anchor}">${c.n}</text>
        </g>`;
}).join('\n        ');

// Eight-pointed khatam star (two overlapping squares) for the title ornament.
const sq = (r, rot) => {
  const pts = [0, 1, 2, 3].map(i => {
    const a = (rot + i * 90) * Math.PI / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
};
// Moroccan flag pentagram (continuous 5-point star path).
const penta = r => {
  const pts = [0, 2, 4, 1, 3].map(i => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
};

const html = `<template id="maroc">
    <div id="maroc-root" data-composition-id="maroc" data-start="0" data-duration="12" data-width="1920" data-height="1080">
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Cinzel"; font-weight: 700; src: url("assets/fonts/cinzel-latin-700-normal.woff2") format("woff2"); }
      @font-face { font-family: "Outfit"; font-weight: 400; src: url("assets/fonts/outfit-latin-400-normal.woff2") format("woff2"); }
      @font-face { font-family: "Outfit"; font-weight: 600; src: url("assets/fonts/outfit-latin-600-normal.woff2") format("woff2"); }
      @font-face { font-family: "Amiri"; font-weight: 400; src: url("assets/fonts/amiri-arabic-400-normal.woff2") format("woff2"); }
      @font-face { font-family: "Amiri"; font-weight: 700; src: url("assets/fonts/amiri-arabic-700-normal.woff2") format("woff2"); }
      @font-face { font-family: "Noto Sans Tifinagh"; font-weight: 400; src: url("assets/fonts/noto-sans-tifinagh-tifinagh-400-normal.woff2") format("woff2"); }

      :root {
        --sea: #0a1120;
        --sea-deep: #060a14;
        --land: #172131;
        --land-edge: #2b3a52;
        --grid: #16233a;
        --maroc: #c1272d;
        --maroc-edge: #ff5a4f;
        --green: #1f9a5c;
        --cream: #f4ead8;
        --ochre: #e0a458;
        --muted: #7f8ea8;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      #maroc-root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Outfit", sans-serif; }
      #scene { position: absolute; inset: 0; background: radial-gradient(120% 90% at 38% 50%, var(--sea) 0%, var(--sea-deep) 100%); }

      #map { position: absolute; inset: 0; width: 100%; height: 100%; }
      #grat { fill: none; stroke: var(--grid); stroke-width: 1; vector-effect: non-scaling-stroke; }
      #land path { fill: var(--land); stroke: var(--land-edge); stroke-width: 0.9; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
      #maroc-fill { fill: var(--maroc); }
      #maroc-edge { fill: none; stroke: var(--maroc-edge); stroke-width: 2.2; stroke-linejoin: round; stroke-dasharray: 1; }
      .sea { font-family: "Outfit", sans-serif; font-weight: 400; font-size: 11px; letter-spacing: 0.32em; fill: var(--muted); font-style: italic; }

      .city .dot { fill: var(--cream); }
      .city .dot--cap { fill: var(--ochre); }
      .city .ring { fill: none; stroke: var(--cream); stroke-width: 1.2; }
      .city--cap .ring { stroke: var(--ochre); }
      .city .lbl { font-family: "Outfit", sans-serif; font-weight: 600; font-size: 14px; fill: var(--cream);
        paint-order: stroke; stroke: var(--sea-deep); stroke-width: 3.2px; stroke-linejoin: round; }
      .city--cap .lbl { fill: var(--ochre); font-size: 16px; }

      /* Title panel — anchored right over the Algerian interior / Mediterranean */
      #panel { position: absolute; top: 0; right: 0; bottom: 0; width: 860px; padding: 0 100px 0 90px;
        display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 18px; }
      #panel-bg { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(6,10,20,0) 0%, rgba(6,10,20,0.78) 34%, rgba(6,10,20,0.92) 100%); }
      #panel > *:not(#panel-bg) { position: relative; }
      #ornament { width: 92px; height: 92px; margin-bottom: 6px; }
      #ornament path { fill: none; stroke-linejoin: round; }
      #khatam { stroke: var(--ochre); stroke-width: 1.6; }
      #penta { stroke: var(--green); stroke-width: 3.4; }
      #eyebrow { font-weight: 600; font-size: 26px; letter-spacing: 0.42em; color: var(--ochre); text-transform: uppercase; }
      #title { font-family: "Cinzel", serif; font-weight: 700; font-size: 156px; line-height: 0.95; color: var(--cream); letter-spacing: 0.04em; }
      #native { display: flex; align-items: baseline; gap: 28px; color: var(--cream); }
      #ar { font-family: "Amiri", serif; font-weight: 700; font-size: 74px; line-height: 1.2; }
      #dot-sep { width: 10px; height: 10px; border-radius: 50%; background: var(--maroc-edge); align-self: center; }
      #tz { font-family: "Noto Sans Tifinagh", sans-serif; font-size: 50px; letter-spacing: 0.06em; color: var(--muted); }
      #rule { width: 420px; height: 3px; background: linear-gradient(90deg, var(--ochre), rgba(224,164,88,0)); }
      #sub { font-weight: 400; font-size: 32px; color: var(--cream); opacity: 0.9; letter-spacing: 0.01em; }
      #sub b { font-weight: 600; color: var(--ochre); }
    </style>
      <div id="scene">
        <svg id="map" viewBox="${vb(WIDE)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <g id="base" data-layout-allow-overflow="true">
            <path id="grat" d="${g.grat}" />
            <g id="land">
              ${g.others.map(o => `<path d="${o.d}" />`).join('\n              ')}
            </g>
          </g>
          <path id="maroc-fill" d="${g.marocD}" />
          <path id="maroc-edge" d="${g.marocD}" pathLength="1" />
          <text class="sea" id="sea-atl" x="${g.seas.atl[0]}" y="${g.seas.atl[1]}" text-anchor="middle">OCÉAN ATLANTIQUE</text>
          <text class="sea" id="sea-med" x="1080" y="${g.seas.med[1]}" text-anchor="end">MER MÉDITERRANÉE</text>
          <g id="cities">
        ${cityG}
          </g>
        </svg>

        <div id="panel">
          <div id="panel-bg"></div>
          <svg id="ornament" viewBox="-50 -50 100 100">
            <path id="khatam" d="${sq(46, 0)} ${sq(46, 45)}" pathLength="1" stroke-dasharray="1" />
            <path id="penta" d="${penta(25)}" pathLength="1" stroke-dasharray="1" />
          </svg>
          <div id="eyebrow">Royaume du</div>
          <div id="title">MAROC</div>
          <div id="native"><span id="ar" dir="rtl" lang="ar">المغرب</span><span id="dot-sep"></span><span id="tz" lang="zgh">ⵍⵎⵖⵔⵉⴱ</span></div>
          <div id="rule"></div>
          <div id="sub">Entre <b>Atlantique</b> et <b>Méditerranée</b></div>
        </div>
      </div>
    <script>
      // Hidden pre-states for everything revealed later (immediate, outside the timeline).
      gsap.set(["#base", "#maroc-fill", ".sea", ".city .ring", ".city .lbl", "#panel-bg", "#eyebrow", "#native", "#sub"], { opacity: 0 });
      gsap.set(["#maroc-edge", "#khatam", "#penta"], { strokeDashoffset: 1 });
      gsap.set(".city .dot", { scale: 0, transformOrigin: "50% 50%" });
      gsap.set("#title", { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set("#rule", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ paused: true });

      // 1 · Establish — the region fades up, Morocco hinted in red.
      tl.to("#base", { opacity: 1, duration: 1.0, ease: "sine.out" }, 0.2)
        .to("#maroc-fill", { opacity: 0.4, duration: 0.7, ease: "power1.out" }, 0.7);

      // 2 · Camera push to Morocco (signature move).
      tl.fromTo("#map", { attr: { viewBox: "${vb(WIDE)}" } },
        { attr: { viewBox: "${vb(FINAL)}" }, duration: 2.4, ease: "power3.inOut" }, 1.0);

      // 3 · Border draws on during the hold, fill deepens.
      tl.to("#maroc-edge", { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 3.15)
        .to("#maroc-fill", { opacity: 0.9, duration: 0.9, ease: "power2.out" }, 3.55)
        .fromTo(".sea", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.15 }, 3.9);

      // 4 · Cities roll out — capital first, then north → south.
      const cityIds = ${JSON.stringify(cities.map(c => '#city-' + slug(c.n)))};
      cityIds.forEach((id, i) => {
        const t = 4.45 + i * 0.16;
        const cap = i === 0;
        tl.to(id + " .dot", { scale: 1, duration: cap ? 0.55 : 0.4, ease: "back.out(2.6)" }, t)
          .fromTo(id + " .ring", { attr: { r: 4 }, opacity: 0.95 }, { attr: { r: cap ? 22 : 15 }, opacity: 0, duration: 0.9, ease: "sine.out", immediateRender: false }, t)
          .fromTo(id + " .lbl", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power3.out" }, t + 0.08);
      });

      // 5 · Title lockup.
      tl.to("#panel-bg", { opacity: 1, duration: 0.8, ease: "sine.inOut" }, 4.9)
        .to("#khatam", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 5.0)
        .to("#penta", { strokeDashoffset: 0, duration: 0.8, ease: "power3.out" }, 5.45)
        .fromTo("#ornament", { rotation: -45 }, { rotation: 0, duration: 1.4, ease: "expo.out" }, 5.0)
        .fromTo("#eyebrow", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9, ease: "expo.out" }, 5.2)
        .to("#title", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "expo.out" }, 5.4)
        .fromTo("#native", { filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, 5.95)
        .to("#rule", { scaleX: 1, duration: 0.7, ease: "power4.out" }, 6.25)
        .fromTo("#sub", { x: -40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 6.4);

      // 6 · Breathe — slow camera drift, one capital pulse.
      tl.to("#map", { attr: { viewBox: "${vb(DRIFT)}" }, duration: 4.6, ease: "sine.inOut" }, 6.9)
        .fromTo("#city-rabat .ring", { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 26 }, opacity: 0, duration: 1.3, ease: "sine.out", immediateRender: false }, 8.2);

      window.__timelines["maroc"] = tl;
      tl.seek(0);
    </script>
    </div>
</template>
`;
writeFileSync(out, html);
console.log('written', html.length, 'FINAL', vb(FINAL));
