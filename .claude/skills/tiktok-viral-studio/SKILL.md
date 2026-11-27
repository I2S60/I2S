---
name: tiktok-viral-studio
description: Produit une vidéo TikTok virale de bout en bout pour une niche donnée — brief, hooks, script minuté, images et vidéos Higgsfield 9:16, voix off, cover Adobe Express, description, hashtags, prédiction de viralité et mise en brouillon TikTok. À utiliser dès que l'utilisateur demande un TikTok, un Reel/Short, des hooks, une description ou des hashtags viraux, ou veut « faire le buzz » dans une niche.
---

# TikTok Viral Studio

Pipeline de production d'un TikTok, de l'idée au brouillon publié. Le studio web
`tiktok-studio/index.html` (artifact « Forge Virale ») sert à préparer le pack ;
ce skill **exécute** la production avec les connecteurs Higgsfield et Adobe.

Langue de travail : français. Prompts image/vidéo : anglais (meilleur rendu).

## 0. Brief (une seule question groupée si des infos manquent)

Niche · sujet précis · durée (15/30/45/60 s) · ton · objectif (vues, abonnés,
commentaires, ventes) · marché (FR, Maroc, Québec, international) · format
(faceless IA, face caméra + B-roll, texte + musique, pub UGC produit) · budget
crédits Higgsfield. Si l'utilisateur a déjà un pack exporté de Forge Virale (.md),
pars de lui et saute aux étapes 3+.

## 1. Hooks — 6 variantes, la meilleure en premier

Chaque hook : phrase dite (≤ 12 mots, < 2 s), texte écran (≤ 6 mots),
mécanique psychologique, idée de première image (pattern interrupt).
Formules qui marchent : curiosité (« Personne ne te parle de ça… »), liste
chiffrée, contre-courant (« Arrête de… »), résultat d'abord, POV, avertissement,
défi, interpellation de la cible, histoire, vrai/faux, express (« X expliqué en
30 s »), erreur courante. Spécifique au sujet, jamais mensonger. Le skill
`viral-hook-creator` du dépôt peut enrichir cette étape.

## 2. Script minuté

Tableau `temps | voix | texte écran | visuel` couvrant exactement la durée :
HOOK 0–2 s → promesse/re-hook 2–5 s → points (contenu réel, un changement visuel
toutes les 2–3 s) → CTA adapté à l'objectif → dernière phrase qui reboucle sur
le hook. Mots-clés de recherche dits dans les 5 premières secondes.

## 3. Visuels Higgsfield

Toujours vérifier les modèles disponibles (`models_explore` action `list`) et
**annoncer le coût** (`estimate_image_cost` / `estimate_video_cost`) avant de
lancer ; demander confirmation si le total dépasse le budget annoncé.

**Prompts étayés (préférence utilisateur)** — chaque prompt image contient :
type de plan, sujet + action, décor, objectif (24/35/50/85/100 mm macro),
lumière, étalonnage, style de référence, boosters qualité
(`ultra-detailed textures, photorealistic materials with natural
micro-imperfections, crisp focus, shallow depth of field, volumetric
atmosphere, HDR, 8K detail, professional color science`) et composition
TikTok (`vertical 9:16, clean negative space in the upper third for text,
subject out of the bottom 20% and right 15%`). Negative prompt : `blurry, low
resolution, watermark, logo, random text, extra fingers, deformed hands,
distorted face, plastic skin, oversaturated, letterboxing`.

1. **Images clés** — `generate_image_batch` (un plan par image), `aspect_ratio: "9:16"` :
   - `gpt_image_2_6` (défaut, `quality: "high"`, `resolution: "2k"`) ;
   - `soul_2` pour une personne réaliste / influenceur IA ;
   - `nano_banana_2` pour un personnage illustré.
   Montrer les images, laisser l'utilisateur choisir avant d'animer.
2. **Animation** — `generate_video_batch` avec `seedance_2_5`, `mode: "omni_reference"`,
   image choisie en `start_image`, `aspect_ratio: "9:16"`, `resolution: "1080p"`,
   `duration` 4–5 s par plan. Le plan du hook démarre sur un mouvement fort
   (crash push-in). Premium : `cinematic_studio_3_0`. Pub produit :
   `marketing_studio_video` (via `show_marketing_studio_v2`).
3. **Voix off** — `generate_audio` (ou ElevenLabs si l'utilisateur préfère),
   débit 165–180 mots/min.
4. Attendre avec `jobs_wait`, afficher une seule fois avec `show_generation_by_ids`.
5. **Montage** — charger `get_preset_instructions` `{ preset: "/editing-room" }`
   et assembler dans l'Editing Room Higgsfield (coupes sur le script, voix,
   musique à −18 dB). Alternative locale : composition HyperFrames du dépôt
   avec sous-titres mot par mot (`/embedded-captions`).

## 4. Cover et déclinaisons Adobe Express

1. `adobe_mandatory_init`, puis `create_visual_design_express_skill` et suivre
   son playbook : cover 1080×1920, texte de cover ≤ 5 mots dans y 300–760 px,
   palette et polices de la niche, contour ou bandeau pour la lisibilité.
2. `html_export_readiness_skill` puis `export_html_to_express` → lien d'édition.
3. Reels/Shorts : skill `adobe-for-creativity:adobe-create-social-variations`
   (ou `video_resize`) pour republier sans filigrane.

## 5. Description, hashtags, commentaire

- 3 descriptions (curiosité, valeur, communauté), mot-clé principal en premier.
- Hashtags : 1 large + 3 niche + 2 micro + 2 anglais (4 à 6 utilisés par post).
- 4–6 mots-clés de recherche TikTok.
- Commentaire à épingler (« partie 2 si 100 likes », question ouverte…).

## 6. Contrôle avant publication

- `virality_predictor` action `create` sur la vidéo finale (job id ou media id) ;
  si la rétention du hook est faible, régénérer le plan 1 ou changer de hook.
- Checklist : hook < 2 s + texte dès l'image 1, rupture visuelle < 1 s, rythme
  2–3 s, sous-titres hors zones UI, boucle, mots-clés, CTA, 1080×1920 30 fps,
  étiquette contenu IA. Pas de promesse de gains ni d'allégation santé.

## 7. Publication TikTok

`tiktok_accounts` (sinon `tiktok_connect`) → `tiktok_music_trending` pour
proposer des sons commerciaux → `tiktok_prepare_publish` avec
`mode: "UPLOAD_TO_DRAFT"` par défaut (DIRECT_POST seulement si l'utilisateur
le demande), `is_aigc: true` quand les visuels sont générés, description +
hashtags préremplis. L'utilisateur valide lui-même dans le widget : ne jamais
publier à sa place. Rappeler le créneau conseillé pour son marché et de
répondre aux commentaires pendant la première heure.

## Livrable final

Résumé court : hook retenu, liens des générations, lien Adobe Express, score
du Virality Predictor, description + hashtags prêts à coller, prochaine vidéo
de la série.
