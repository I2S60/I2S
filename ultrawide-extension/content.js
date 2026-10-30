(() => {
  const STYLE_ID = "uw219-style";
  const DEFAULTS = { mode: "cover", fullscreenOnly: true };

  // cover = recadre pour remplir 21:9 sans déformation
  // fill  = étire l'image pour remplir 21:9 (déformation)
  // contain = comportement d'origine (bandes noires)
  function css({ mode, fullscreenOnly }) {
    if (mode === "contain") return "";
    const rule = `object-fit: ${mode === "fill" ? "fill" : "cover"} !important;`;
    return fullscreenOnly
      ? `video:fullscreen, :fullscreen video, video:-webkit-full-screen, :-webkit-full-screen video { ${rule} }`
      : `video { ${rule} }`;
  }

  function apply(settings) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css(settings);
  }

  function load() {
    chrome.storage.sync.get(DEFAULTS, apply);
  }

  load();
  chrome.storage.onChanged.addListener(load);
})();
