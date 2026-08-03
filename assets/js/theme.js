(() => {
  const root = document.documentElement;
  const controls = Array.from(document.querySelectorAll("[data-theme-option]"));
  const themeColorMetas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
  const storageKey = "homepage-theme";
  const validModes = new Set(["auto", "light", "dark"]);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeHex = { light: "#f4f6f8", dark: "#101214" };

  const resolveTheme = (mode) => {
    if (mode === "light" || mode === "dark") return mode;
    return systemDark.matches ? "dark" : "light";
  };

  const getInitialMode = () => {
    const mode = root.dataset.themeMode || "auto";
    return validModes.has(mode) ? mode : "auto";
  };

  const persistMode = (mode) => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch (error) {}
  };

  const updateControls = (mode) => {
    controls.forEach((control) => {
      control.setAttribute(
        "aria-pressed",
        control.dataset.themeOption === mode ? "true" : "false"
      );
    });
  };

  const updateThemeColor = (mode, theme) => {
    themeColorMetas.forEach((meta) => {
      meta.setAttribute(
        "content",
        mode === "auto" ? meta.dataset.default || themeHex[theme] : themeHex[theme]
      );
    });
  };

  const applyMode = (mode, persist = true) => {
    const safeMode = validModes.has(mode) ? mode : "auto";
    const theme = resolveTheme(safeMode);
    root.dataset.themeMode = safeMode;
    root.dataset.theme = theme;
    updateThemeColor(safeMode, theme);
    updateControls(safeMode);
    if (persist) persistMode(safeMode);
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      applyMode(control.dataset.themeOption || "auto");
    });
  });

  const onSystemChange = () => {
    if (root.dataset.themeMode === "auto") applyMode("auto", false);
  };
  if (typeof systemDark.addEventListener === "function") {
    systemDark.addEventListener("change", onSystemChange);
  } else if (typeof systemDark.addListener === "function") {
    systemDark.addListener(onSystemChange);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey) return;
    applyMode(event.newValue || "auto", false);
  });

  applyMode(getInitialMode(), false);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      root.classList.add("theme-ready");
    });
  });
})();
