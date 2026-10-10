import { readFileSync, writeFileSync } from 'node:fs';
const [, , geoFile, out] = process.argv;
const g = JSON.parse(readFileSync(geoFile));

// Vertical 9:16 camera. Base units = projection pixels from build-geo.mjs.
const AR = 1920 / 1080;
const [x0, y0, x1, y1] = g.bbox;
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
const WIDE = [cx - 750, cy - 750 * AR - 80, 1500, 1500 * AR];
const FW = 620, FH = FW * AR;
const FINAL = [x0 - 105, y0 - 126, FW, FH];           // Morocco top ≈ 220px, bottom ≈ 1140px on screen
const DRIFT = [FINAL[0] + FW * 0.012, FINAL[1] + FH * 0.006, FW * 0.975, FH * 0.975];
const vb = a => a.map(v => v.toFixed(1)).join(' ');

// Voice-over (starts at V0 in the root) — phrase / word onsets measured from the take's pauses.
const V0 = 0.5;
const at = s => +(V0 + s).toFixed(2);
const T = {
  maroc: at(0.0), porte: at(1.27), atlantique: at(2.7), medit: at(3.6),
  rabat: at(5.18), capitale: at(5.87),
  cities: { Tanger: at(7.41), Casablanca: at(8.24), 'Fès': at(9.27), Marrakech: at(10.05), Agadir: at(10.95), 'Laâyoune': at(12.35), Dakhla: at(13.0) },
  royaume: at(14.19), couleurs: at(15.0), bienvenue: at(16.39), marocEnd: at(16.9),
};
const DUR = 20.5;

const place = {
  Tanger: [-11, -7, 'end'], Rabat: [-11, -8, 'end'], Casablanca: [-11, 15, 'end'],
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
            <text class="lbl" x="${dx}" y="${dy}" text-anchor="${anchor}">${c.n}</text>${cap ? `
            <text class="cap-tag" id="cap-tag" x="${dx}" y="${dy - 17}" text-anchor="${anchor}">CAPITALE</text>` : ''}
          </g>`;
}).join('\n          ');

const sq = (r, rot) => {
  const pts = [0, 1, 2, 3].map(i => {
    const a = (rot + i * 90) * Math.PI / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
};
const penta = r => {
  const pts = [0, 2, 4, 1, 3].map(i => {
    const a = (-90 + i * 72) * Math.PI / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}Z`;
};

const atlX = FINAL[0] + 62 / (1080 / FW);   // pinned ~62px from the left edge at the hold
const medX = FINAL[0] + FW - 36 / (1080 / FW);

const html = `<template id="maroc">
  <div id="maroc-root" data-composition-id="maroc" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Cinzel"; font-weight: 700; src: url("assets/fonts/cinzel-latin-700-normal.woff2") format("woff2"); }
      @font-face { font-family: "Outfit"; font-weight: 400; src: url("assets/fonts/outfit-latin-400-normal.woff2") format("woff2"); }
      @font-face { font-family: "Outfit"; font-weight: 600; src: url("assets/fonts/outfit-latin-600-normal.woff2") format("woff2"); }
      @font-face { font-family: "Amiri"; font-weight: 700; src: url("assets/fonts/amiri-arabic-700-normal.woff2") format("woff2"); }
      @font-face { font-family: "Noto Sans Tifinagh"; font-weight: 400; src: url("assets/fonts/noto-sans-tifinagh-tifinagh-400-normal.woff2") format("woff2"); }

      #maroc-root {
        --sea: #0a1120; --sea-deep: #060a14; --land: #172131; --land-edge: #2b3a52; --grid: #16233a;
        --maroc: #c1272d; --maroc-edge: #ff5a4f; --green: #1f9a5c; --cream: #f4ead8; --ochre: #e0a458; --muted: #8b99b2;
        position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Outfit", sans-serif;
      }
      #scene { position: absolute; inset: 0; background: radial-gradient(130% 80% at 50% 36%, var(--sea) 0%, var(--sea-deep) 100%); }

      #map { position: absolute; inset: 0; width: 100%; height: 100%; }
      #grat { fill: none; stroke: var(--grid); stroke-width: 1; vector-effect: non-scaling-stroke; }
      #land path { fill: var(--land); stroke: var(--land-edge); stroke-width: 0.9; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
      #maroc-fill { fill: var(--maroc); }
      #maroc-edge { fill: none; stroke: var(--maroc-edge); stroke-width: 2.2; stroke-linejoin: round; stroke-dasharray: 1; }
      .sea { font-family: "Outfit", sans-serif; font-weight: 400; font-size: 11px; letter-spacing: 0.3em; fill: var(--muted); font-style: italic; }

      .city .dot { fill: var(--cream); }
      .city .dot--cap { fill: var(--ochre); }
      .city .ring { fill: none; stroke: var(--cream); stroke-width: 1.2; }
      .city--cap .ring { stroke: var(--ochre); }
      .city .lbl { font-family: "Outfit", sans-serif; font-weight: 600; font-size: 15px; fill: var(--cream);
        paint-order: stroke; stroke: var(--sea-deep); stroke-width: 3.4px; stroke-linejoin: round; }
      .city--cap .lbl { fill: var(--ochre); font-size: 17px; }
      .cap-tag { font-family: "Outfit", sans-serif; font-weight: 600; font-size: 7.5px; letter-spacing: 0.3em; fill: var(--ochre);
        paint-order: stroke; stroke: var(--sea-deep); stroke-width: 3px; }

      /* Title block — anchored to the bottom over the Mauritanian interior. */
      #panel { position: absolute; left: 0; right: 0; bottom: 0; height: 840px; padding: 0 90px 220px;
        display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; gap: 16px; }
      #panel-bg { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6,10,20,0) 0%, rgba(6,10,20,0.82) 38%, rgba(6,10,20,0.95) 100%); }
      #panel > *:not(#panel-bg) { position: relative; }
      #head { display: flex; align-items: center; gap: 26px; }
      #ornament { width: 96px; height: 96px; }
      #ornament path { fill: none; stroke-linejoin: round; }
      #khatam { stroke: var(--ochre); stroke-width: 1.6; }
      #penta { stroke: var(--green); stroke-width: 3.4; }
      #eyebrow { font-weight: 600; font-size: 30px; letter-spacing: 0.42em; color: var(--ochre); text-transform: uppercase; }
      #title { font-family: "Cinzel", serif; font-weight: 700; font-size: 196px; line-height: 0.95; color: var(--cream); letter-spacing: 0.03em; }
      #native { display: flex; align-items: baseline; gap: 30px; color: var(--cream); }
      #ar { font-family: "Amiri", serif; font-weight: 700; font-size: 84px; line-height: 1.2; }
      #dot-sep { width: 12px; height: 12px; border-radius: 50%; background: var(--maroc-edge); align-self: center; }
      #tz { font-family: "Noto Sans Tifinagh", sans-serif; font-size: 58px; letter-spacing: 0.06em; color: var(--muted); }
      #rule { width: 560px; height: 3px; background: linear-gradient(90deg, var(--ochre), rgba(224,164,88,0)); }
      #sub { font-weight: 400; font-size: 38px; color: var(--cream); opacity: 0.92; }
      #sub b { font-weight: 600; color: var(--ochre); }
    </style>
    <div id="scene">
      <svg id="map" viewBox="${vb(WIDE)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g id="base" data-layout-allow-overflow="true">
          <path id="grat" d="${g.grat}" />
          <g id="land">
            ${g.others.map(o => `<path d="${o.d}" />`).join('\n            ')}
          </g>
        </g>
        <path id="maroc-fill" d="${g.marocD}" />
        <path id="maroc-edge" d="${g.marocD}" pathLength="1" />
        <text class="sea" id="sea-atl" x="${atlX.toFixed(1)}" y="${g.seas.atl[1]}" text-anchor="start">OCÉAN ATLANTIQUE</text>
        <text class="sea" id="sea-med" x="${medX.toFixed(1)}" y="${g.seas.med[1]}" text-anchor="end">MER MÉDITERRANÉE</text>
        <g id="cities">
          ${cityG}
        </g>
      </svg>

      <div id="panel">
        <div id="panel-bg"></div>
        <div id="head">
          <svg id="ornament" viewBox="-50 -50 100 100">
            <path id="khatam" d="${sq(46, 0)} ${sq(46, 45)}" pathLength="1" stroke-dasharray="1" />
            <path id="penta" d="${penta(25)}" pathLength="1" stroke-dasharray="1" />
          </svg>
          <div id="eyebrow">Royaume du</div>
        </div>
        <div id="title">MAROC</div>
        <div id="native"><span id="ar" dir="rtl" lang="ar">المغرب</span><span id="dot-sep"></span><span id="tz" lang="zgh">ⵍⵎⵖⵔⵉⴱ</span></div>
        <div id="rule"></div>
        <div id="sub">Entre <b>Atlantique</b> et <b>Méditerranée</b></div>
      </div>
    </div>
    <script>
      // Hidden pre-states (immediate, outside the timeline).
      gsap.set(["#base", "#maroc-fill", ".sea", ".city .ring", ".city .lbl", "#cap-tag", "#panel-bg", "#eyebrow", "#native", "#sub"], { opacity: 0 });
      gsap.set(["#maroc-edge", "#khatam", "#penta"], { strokeDashoffset: 1 });
      gsap.set(".city .dot", { scale: 0, transformOrigin: "50% 50%" });
      gsap.set("#title", { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set("#rule", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ paused: true });

      // 1 · « Le Maroc. » — the region fades up, Morocco hinted in red.
      tl.to("#base", { opacity: 1, duration: 0.9, ease: "sine.out" }, 0.1)
        .to("#maroc-fill", { opacity: 0.4, duration: 0.6, ease: "power1.out" }, ${T.maroc});

      // 2 · « À la porte de l'Afrique… » — camera push onto Morocco.
      tl.fromTo("#map", { attr: { viewBox: "${vb(WIDE)}" } },
        { attr: { viewBox: "${vb(FINAL)}" }, duration: 2.6, ease: "power3.inOut" }, ${T.porte - 0.25});

      // 3 · « …entre l'Atlantique et la Méditerranée. » — seas named on the word, border draws, fill deepens.
      tl.fromTo("#sea-atl", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.8, ease: "expo.out" }, ${T.atlantique})
        .fromTo("#sea-med", { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.8, ease: "expo.out" }, ${T.medit})
        .to("#maroc-edge", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, ${T.atlantique + 0.4})
        .to("#maroc-fill", { opacity: 0.9, duration: 0.9, ease: "power2.out" }, ${T.atlantique + 0.8});

      // 4 · « Rabat, la capitale. »
      tl.to("#city-rabat .dot", { scale: 1, duration: 0.55, ease: "back.out(2.6)" }, ${T.rabat - 0.08})
        .fromTo("#city-rabat .ring", { attr: { r: 4 }, opacity: 0.95 }, { attr: { r: 22 }, opacity: 0, duration: 0.75, ease: "sine.out", immediateRender: false }, ${T.rabat - 0.08})
        .fromTo("#city-rabat .lbl", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power3.out" }, ${T.rabat})
        .fromTo("#cap-tag", { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, ${T.capitale})
        .fromTo("#city-rabat .ring", { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 26 }, opacity: 0, duration: 1.1, ease: "sine.out", immediateRender: false }, ${T.capitale + 0.1});

      // 5 · « Puis Tanger, Casablanca… jusqu'à Laâyoune et Dakhla. » — each pin lands on its name.
      const cityTimes = ${JSON.stringify(Object.fromEntries(Object.entries(T.cities).map(([n, t]) => ['#city-' + slug(n), t])))};
      Object.entries(cityTimes).forEach(([id, t]) => {
        t = t - 0.08;
        tl.to(id + " .dot", { scale: 1, duration: 0.4, ease: "back.out(2.6)" }, t)
          .fromTo(id + " .ring", { attr: { r: 4 }, opacity: 0.95 }, { attr: { r: 15 }, opacity: 0, duration: 0.9, ease: "sine.out", immediateRender: false }, t)
          .fromTo(id + " .lbl", { opacity: 0, x: 0 }, { opacity: 1, duration: 0.3, ease: "power3.out" }, t + 0.06);
      });
      tl.to("#map", { attr: { viewBox: "${vb(DRIFT)}" }, duration: 8, ease: "sine.inOut" }, ${T.cities.Tanger});

      // 6 · « Un royaume aux mille couleurs. Bienvenue au Maroc. » — title lockup.
      tl.to("#panel-bg", { opacity: 1, duration: 0.8, ease: "sine.inOut" }, ${T.royaume - 0.3})
        .to("#khatam", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, ${T.royaume})
        .to("#penta", { strokeDashoffset: 0, duration: 0.8, ease: "power3.out" }, ${T.royaume + 0.45})
        .fromTo("#ornament", { rotation: -45 }, { rotation: 0, duration: 1.4, ease: "expo.out" }, ${T.royaume})
        .fromTo("#eyebrow", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.9, ease: "expo.out" }, ${T.royaume + 0.15})
        .fromTo("#native", { filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, ${T.couleurs})
        .to("#title", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: "expo.out" }, ${T.bienvenue + 0.2})
        .to("#rule", { scaleX: 1, duration: 0.7, ease: "power4.out" }, ${T.marocEnd + 0.3})
        .fromTo("#sub", { x: -40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, ${T.marocEnd + 0.5})
        .fromTo("#city-rabat .ring", { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 26 }, opacity: 0, duration: 1.3, ease: "sine.out", immediateRender: false }, ${(T.marocEnd + 1.4).toFixed(2)});

      window.__timelines["maroc"] = tl;
      tl.seek(0);
    </script>
  </div>
</template>
`;
writeFileSync(out, html);
console.log('written', html.length, 'FINAL', vb(FINAL), 'T', JSON.stringify(T));
