# Maroc — carte animée HyperFrames

Vidéo motion-design sur le Maroc, réalisée avec [HyperFrames](https://hyperframes.heygen.com).

- `renders/maroc-vertical.mp4` — 1080×1920, 20,5 s, narration (ElevenLabs, voix « Célian ») + musique
- `renders/maroc.mp4` — 1920×1080, 12 s, sans son (première version)

## Structure
- `index.html` — composition racine (pistes voix + musique)
- `compositions/maroc.html` — la carte animée (SVG + GSAP), générée par `tools/build-vertical.mjs`
- `assets/` — polices, GSAP en local, audio mixé
- `.media-src/` — prises de voix et musiques alternatives
- `tools/` — scripts de génération de la géométrie (d3-geo + world-atlas) et de la composition

## Commandes
```bash
npx hyperframes check .
npx hyperframes preview --background
npx hyperframes render . -q high -o renders/maroc-vertical.mp4
```

Pour régénérer : `npm i d3-geo topojson-client world-atlas` puis
`node tools/build-geo.mjs . geo.json && node tools/build-vertical.mjs geo.json compositions/maroc.html`.

---

# Forge Virale — studio TikTok

- `tiktok-studio/index.html` — studio web (aussi publié en artifact claude.ai) : 16 niches virales, 6 hooks par vidéo, script minuté, prompts Higgsfield détaillés (image clé + animation), brief Adobe Express, descriptions, hashtags, mots-clés SEO, checklist avec score, créneaux par marché, plan 7 jours et série. Le bouton « Générer avec Claude » écrit un pack sur mesure quand la page est ouverte sur claude.ai ; sinon les modèles intégrés fonctionnent hors ligne.
- `.claude/skills/tiktok-viral-studio/` — skill Claude Code qui exécute la production : images et vidéos Higgsfield 9:16, voix off, montage, cover Adobe Express, Virality Predictor, brouillon TikTok.
