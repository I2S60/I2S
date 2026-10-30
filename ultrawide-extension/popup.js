const DEFAULTS = { mode: "cover", fullscreenOnly: true };
const fsOnly = document.getElementById("fsOnly");

chrome.storage.sync.get(DEFAULTS, ({ mode, fullscreenOnly }) => {
  document.querySelector(`input[name=mode][value=${mode}]`).checked = true;
  fsOnly.checked = fullscreenOnly;
});

document.querySelectorAll("input[name=mode]").forEach((r) =>
  r.addEventListener("change", () => chrome.storage.sync.set({ mode: r.value }))
);
fsOnly.addEventListener("change", () =>
  chrome.storage.sync.set({ fullscreenOnly: fsOnly.checked })
);
