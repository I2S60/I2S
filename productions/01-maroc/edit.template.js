// Higgsedit — TikTok #01 « 4 lieux cachés au Maroc » — 1080×1920, 30 fps, 32 s
// Polices : higgsedit fonts add . Anton:400 Montserrat:700 (sinon repli sur une police à empattements).
// Fond : media/bg.mp4 (plans Grok animés, retimés + zoom punch). Audio mixé à part (mix.wav).
const MAPS = __MAPS__;

const GOLD = "#FFC83D", TEAL = "#073B4C", RED = "#FF5A5F", WHITE = "#FFFFFF";
const CARD = "rgba(6,28,38,0.78)";
const SH = { x: 0, y: 4, blur: 18, color: "rgba(0,0,0,0.75)" };
const CUTS = [4.44, 7.16, 12.66, 17.60, 22.42, 26.94];
const END = 32;

// Une seule piste d'opacité par élément : entrée + sortie fusionnées.
const op = (at, inLen, dur) => {
  const k = [{ at: 0, value: 0 }];
  if (at > 0) k.push({ at, value: 0 });
  k.push({ at: at + inLen, value: 1 });
  if (dur) { k.push({ at: dur - 0.15, value: 1 }); k.push({ at: dur, value: 0 }); }
  return { property: "opacity", keyframes: k };
};
const pop = (at = 0, s0 = 0.55, dur) => [
  { property: "scale", keyframes: [{ at, value: s0 }, { at: at + 0.16, value: 1.08 }, { at: at + 0.28, value: 1 }] },
  op(at, 0.1, dur),
];
const slideIn = (at = 0, dx = 70, dur) => [
  { property: "offsetX", keyframes: [{ at, value: dx }, { at: at + 0.3, value: 0 }], easing: "house" },
  op(at, 0.18, dur),
];
const fadeOut = (dur, len = 0.15) => ({ property: "opacity", keyframes: [{ at: 0, value: 1 }, { at: dur - len, value: 1 }, { at: dur, value: 0 }] });

const PLACES = [
  { s: 7.16, e: 12.66, n: "1", name: "PONT DE DIEU", region: "Akchour · près de Chefchaouen", chipIcon: "footprints", chip: "Environ 1 h de rando depuis Akchour", crowd: 15, wow: 96 },
  { s: 12.66, e: 17.60, n: "2", name: "OASIS DE FINT", region: "Près de Ouarzazate", chipIcon: "tree-palm", chip: "Une palmeraie cachée dans un canyon", crowd: 10, wow: 92 },
  { s: 17.60, e: 22.42, n: "3", name: "AMTOUDI", region: "Anti-Atlas · Agadir Id Aïssa", chipIcon: "castle", chip: "Grenier berbère perché sur la falaise", crowd: 5, wow: 94 },
  { s: 22.42, e: 26.94, n: "4", name: "AÏT BOUGUEMEZ", region: "Haut Atlas · la vallée heureuse", chipIcon: "footprints", chip: "Vraies empreintes de dinosaures", crowd: 8, wow: 97 },
];

const CAPS = [
  [2.04, 3.44, "à voir avant qu'ils", WHITE], [3.46, 4.40, "deviennent CÉLÈBRES", GOLD],
  [4.44, 5.90, "Pas de bus de touristes", WHITE], [5.92, 7.10, "pas de file d'attente", WHITE],
  [7.16, 7.80, "UN", GOLD], [7.82, 9.74, "le Pont de Dieu, près de Chefchaouen", WHITE], [9.80, 11.20, "une arche géante", WHITE], [11.22, 12.60, "au-dessus d'une rivière émeraude", WHITE],
  [12.66, 13.26, "DEUX", GOLD], [13.28, 14.36, "l'oasis de Fint", WHITE], [14.40, 15.66, "une palmeraie cachée", WHITE], [15.68, 17.54, "dans un canyon, près de Ouarzazate", WHITE],
  [17.60, 18.22, "TROIS", GOLD], [18.26, 18.98, "Amtoudi", WHITE], [19.00, 20.80, "un grenier berbère fortifié", WHITE], [20.84, 22.36, "perché au bord d'une falaise", WHITE],
  [22.42, 22.94, "QUATRE", GOLD], [22.96, 24.58, "la vallée des Aït Bouguemez", WHITE], [24.62, 26.88, "avec de vraies empreintes de dinosaures", WHITE],
  [26.94, 28.50, "Alors, lequel tu choisis ?", GOLD], [28.54, 31.40, "Envoie ça à la personne avec qui tu pars", WHITE],
];

export default async ({ project, text, rect, path, frame, icon }) => {
  const p = await project({ size: "1080x1920", fps: 30, background: "#000000" });
  const bg = await p.add("media/bg.mp4");
  p.cut(bg, { from: 0, dur: END, at: 0 });

  // ---------- couche globale : scrims + barre de progression à chapitres ----------
  p.compose([
    rect({ x: 0, y: 0, width: 1080, height: 820, fill: { kind: "linear", angle: 180, stops: [{ offset: 0, color: "#000000", opacity: 0.62 }, { offset: 1, color: "#000000", opacity: 0 }] } }),
    rect({ x: 0, y: 1060, width: 1080, height: 520, fill: { kind: "linear", angle: 180, stops: [{ offset: 0, color: "#000000", opacity: 0 }, { offset: 0.5, color: "#000000", opacity: 0.45 }, { offset: 1, color: "#000000", opacity: 0 }] } }),
    rect({ x: 60, y: 166, width: 960, height: 10, radius: 5, fill: "rgba(255,255,255,0.28)" }),
    rect({ x: 60, y: 166, width: 960, height: 10, radius: 5, fill: GOLD,
      mask: { shape: "rectangle", x: 0, y: 0, width: 1, height: 10 },
      animate: [{ property: "maskWidth", from: 1, to: 960, at: 0, duration: END, easing: "linear" }] }),
    ...PLACES.map((pl) => {
      const x = 60 + (pl.s / END) * 960 - 11;
      return rect({ x, y: 160, width: 22, height: 22, radius: 11, fill: WHITE, strokeColor: TEAL, strokeWidth: 3,
        animate: [{ property: "color", keyframes: [{ at: 0, value: WHITE }, { at: pl.s, value: WHITE }, { at: pl.s + 0.01, value: GOLD }] },
                  { property: "scale", keyframes: [{ at: 0, value: 1 }, { at: pl.s, value: 1 }, { at: pl.s + 0.15, value: 1.6 }, { at: pl.s + 0.35, value: 1 }] }] });
    }),
  ], { at: 0, dur: END, name: "global" });

  // ---------- flashs sur les coupes ----------
  p.compose([0, ...CUTS].map((t) => rect({ x: 0, y: 0, width: 1080, height: 1920, fill: WHITE, at: t, duration: 0.15,
    animate: [{ property: "opacity", from: t === 0 ? 0.9 : 0.55, to: 0, duration: 0.14 }] })), { at: 0, dur: END, name: "flashs" });

  // ---------- HOOK 0 → 4.44 : titre + carte qui révèle les 4 lieux ----------
  const B = MAPS.big, bx = (1080 - B.W) / 2, by = 560;
  p.compose([
    path({ d: B.d, x: bx, y: by, width: B.W, height: B.H, fill: "rgba(7,59,76,0.55)", stroke: { width: 4, color: WHITE },
      animate: [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.9, value: 0 }, { at: 1.3, value: 1 }, { at: 4.24, value: 1 }, { at: 4.44, value: 0 }] }] }),
    ...B.pins.map(([x, y], i) => rect({ x: bx + x - 17, y: by + y - 17, width: 34, height: 34, radius: 17, fill: GOLD, strokeColor: TEAL, strokeWidth: 5,
      animate: pop(1.35 + i * 0.22, 0.2, 4.44, 0.2) })),
    text("4 LIEUX", { x: 0, y: 236, width: 1080, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 176, color: WHITE, shadow: SH, animate: pop(0.02, 1.6, 4.44) }),
    text("CACHÉS", { x: 0, y: 410, width: 1080, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 176, color: GOLD, shadow: SH, animate: pop(0.28, 1.6, 4.44) }),
    text("AU MAROC", { x: 0, y: 1250, width: 1080, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 120, color: WHITE, shadow: SH, animate: [{ property: "scale", keyframes: [{ at: 0.6, value: 0.4 }, { at: 0.76, value: 1.08 }, { at: 0.88, value: 1 }] }, { property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.6, value: 0 }, { at: 0.7, value: 1 }, { at: 1.95, value: 1 }, { at: 2.03, value: 0 }] }] }),
  ], { at: 0, dur: 4.44, name: "hook" });

  // ---------- 4.44 → 7.16 : compteur de touristes qui tombe à zéro ----------
  p.compose([
    rect({ x: 140, y: 330, width: 800, height: 400, radius: 36, fill: CARD, animate: pop(0, 0.7, 2.72) }),
    icon("bus", { x: 200, y: 380, size: 96, color: RED, strokeWidth: 2.4, animate: pop(0.05, 0.3, 2.72) }),
    text("TOURISTES", { x: 320, y: 392, width: 560, fontFamily: "Montserrat", fontWeight: 700, fontSize: 60, color: WHITE, animate: slideIn(0.08, 70, 2.72) }),
    frame({ x: 200, y: 500, width: 680, height: 200, layout: "none", animate: [fadeOut(2.72)],
      motion: { timeline: { at: 0.25, duration: 1.6, easing: "ease-out", targets: [
        { target: "Bar", from: { scaleX: 1 }, to: { scaleX: 0.02 } },
        { target: "Value", counter: { from: 12500, to: 0, decimals: 0 } },
      ] } } }, [
      frame({ name: "Value", x: 0, y: 0, width: 680, height: 140, layout: "none" }, [
        text("12500", { x: 0, y: 0, width: 680, height: 140, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 130, color: GOLD }),
      ]),
      frame({ name: "Bar", x: 0, y: 160, width: 680, height: 22, radius: 11, background: RED }),
    ]),
  ], { at: 4.44, dur: 2.72, name: "touristes" });

  // ---------- les 4 lieux : mini-carte + numéro + nom + jauges ----------
  const M = MAPS.mini, mx = 68, my = 236;
  PLACES.forEach((pl, i) => {
    const d = pl.e - pl.s;
    const [px, py] = M.pins[i];
    p.compose([
      rect({ x: 48, y: 214, width: 280, height: 338, radius: 26, fill: CARD, animate: slideIn(0, -60, d) }),
      path({ d: M.d, x: mx, y: my, width: M.W, height: M.H, fill: "rgba(255,255,255,0.16)", stroke: { width: 3, color: WHITE }, animate: slideIn(0, -60, d) }),
      ...M.pins.slice(0, i).map(([x, y]) => rect({ x: mx + x - 8, y: my + y - 8, width: 16, height: 16, radius: 8, fill: "rgba(255,255,255,0.75)", animate: [fadeOut(d)] })),
      rect({ x: mx + px - 15, y: my + py - 15, width: 30, height: 30, radius: 15, fill: "rgba(255,200,61,0.0)", strokeColor: GOLD, strokeWidth: 4,
        animate: [{ property: "scale", keyframes: [{ at: 0.3, value: 1 }, { at: 1.2, value: 2.6 }], repeat: Math.floor((d - 0.6) / 0.9) },
                  { property: "opacity", keyframes: [{ at: 0.3, value: 0.9 }, { at: 1.2, value: 0 }], repeat: Math.floor((d - 0.6) / 0.9) }] }),
      rect({ x: mx + px - 13, y: my + py - 13, width: 26, height: 26, radius: 13, fill: GOLD, strokeColor: TEAL, strokeWidth: 4, animate: pop(0.2, 0.1, d) }),

      rect({ x: 360, y: 214, width: 150, height: 150, radius: 32, fill: GOLD, shadow: SH, animate: pop(0.05, 0.3, d) }),
      text(pl.n, { x: 360, y: 222, width: 150, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 118, color: TEAL, animate: pop(0.05, 0.3, d) }),
      text("/4", { x: 524, y: 292, width: 120, fontFamily: "Montserrat", fontWeight: 700, fontSize: 46, color: WHITE, shadow: SH, animate: slideIn(0.12, 70, d) }),
      text(pl.name, { x: 360, y: 372, width: 690, fontFamily: "Anton", fontWeight: 400, fontSize: 92, lineHeight: 1.0, color: WHITE, shadow: SH, animate: slideIn(0.12, 70, d) }),
      icon("map-pin", { x: 360, y: 484, size: 44, color: GOLD, strokeWidth: 2.6, animate: slideIn(0.22, 70, d) }),
      text(pl.region, { x: 414, y: 486, width: 640, fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, color: WHITE, shadow: SH, animate: slideIn(0.22, 70, d) }),

      // carte « stats » : jauges animées avec compteurs
      rect({ x: 48, y: 580, width: 984, height: 214, radius: 26, fill: CARD, animate: slideIn(0.3, 0, d) }),
      icon(pl.chipIcon, { x: 80, y: 604, size: 40, color: GOLD, strokeWidth: 2.4, animate: slideIn(0.34, 30, d) }),
      text(pl.chip, { x: 134, y: 606, width: 880, fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, color: GOLD, animate: slideIn(0.34, 30, d) }),
      ...[["Affluence", pl.crowd, RED, "%", 672], ["Effet waouh", pl.wow, GOLD, "/100", 732]].flatMap(([lbl, v, col, suf, y], k) => [
        text(lbl, { x: 80, y: y - 8, width: 260, fontFamily: "Montserrat", fontWeight: 700, fontSize: 34, color: WHITE, animate: slideIn(0.42 + k * 0.1, 30, d) }),
        rect({ x: 330, y, width: 520, height: 20, radius: 10, fill: "rgba(255,255,255,0.22)", animate: [fadeOut(d)] }),
        rect({ x: 330, y, width: 520, height: 20, radius: 10, fill: col,
          mask: { shape: "rectangle", x: 0, y: 0, width: 1, height: 20 },
          animate: [{ property: "maskWidth", from: 1, to: 520 * v / 100, at: 0.5 + k * 0.1, duration: 0.9, easing: "house" }, fadeOut(d)] }),
        frame({ x: 866, y: y - 12, width: 150, height: 46, layout: "none", animate: [fadeOut(d)],
          motion: { timeline: { at: 0.5 + k * 0.1, duration: 0.9, easing: "ease-out", targets: [{ target: "V" + k, counter: { from: 0, to: v, decimals: 0, suffix: suf } }] } } }, [
          frame({ name: "V" + k, x: 0, y: 0, width: 150, height: 46, layout: "none" }, [
            text("0" + suf, { x: 0, y: 0, width: 150, height: 46, fontFamily: "Montserrat", fontWeight: 700, fontSize: 34, color: WHITE }),
          ]),
        ]),
      ]),
    ], { at: pl.s, dur: d, name: "lieu" + pl.n });
  });

  // ---------- CTA 26.94 → 32 : vote + partage ----------
  const cd = END - 26.94;
  const tiles = [["1", "Pont de Dieu"], ["2", "Oasis de Fint"], ["3", "Amtoudi"], ["4", "Aït Bouguemez"]];
  p.compose([
    text("LEQUEL TU CHOISIS ?", { x: 0, y: 236, width: 1080, align: "center", fontFamily: "Anton", fontWeight: 400, fontSize: 104, color: WHITE, shadow: SH, animate: pop(0, 1.5) }),
    ...tiles.flatMap(([n, name], i) => {
      const x = 60 + (i % 2) * 500, y = 400 + Math.floor(i / 2) * 210, at = 0.3 + i * 0.14;
      return [
        rect({ x, y, width: 460, height: 180, radius: 28, fill: CARD, strokeColor: GOLD, strokeWidth: 3, animate: pop(at, 0.4) }),
        text(n, { x: x + 26, y: y + 26, width: 100, fontFamily: "Anton", fontWeight: 400, fontSize: 110, color: GOLD, animate: pop(at, 0.4) }),
        text(name, { x: x + 120, y: y + 62, width: 320, fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, color: WHITE, animate: pop(at, 0.4) }),
      ];
    }),
    icon("message-circle", { x: 230, y: 862, size: 56, color: GOLD, strokeWidth: 2.4, animate: pop(1.0, 0.3) }),
    text("Réponds 1, 2, 3 ou 4", { x: 300, y: 866, width: 600, fontFamily: "Montserrat", fontWeight: 700, fontSize: 48, color: WHITE, shadow: SH, animate: pop(1.0, 0.6) }),
    icon("send", { x: 770, y: 1420, size: 84, color: GOLD, strokeWidth: 2.4, animate: pop(1.6, 0.2) }),
    icon("arrow-right", { x: 870, y: 1414, size: 96, color: WHITE, strokeWidth: 3,
      animate: [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 1.6, value: 0 }, { at: 1.7, value: 1 }] },
                { property: "offsetX", keyframes: [{ at: 1.7, value: 0 }, { at: 2.0, value: 22 }, { at: 2.3, value: 0 }], repeat: 4 }] }),
  ], { at: 26.94, dur: cd, name: "cta" });

  // ---------- sous-titres dynamiques (mot par mot) ----------
  p.compose(CAPS.map(([s, e, t, col]) => {
    const d = e - s;
    return text(t, { at: s, duration: d, x: 70, y: 1250, width: 940, align: "center", fontFamily: "Montserrat", fontWeight: 700, fontSize: t.length <= 8 ? 110 : 66, lineHeight: 1.12,
      color: col, shadow: { x: 0, y: 5, blur: 14, color: "rgba(0,0,0,0.9)" },
      motion: { by: "word", from: { opacity: 0, y: 18, scale: 0.85 }, duration: Math.min(0.5, d * 0.5), easing: "house" } });
  }), { at: 0, dur: END, name: "captions" });
};
