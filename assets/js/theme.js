(() => {
  const root = document.documentElement;
  const controls = Array.from(document.querySelectorAll("[data-theme-option]"));
  const storageKey = "homepage-theme";
  const validModes = new Set(["auto", "light", "dark"]);
  let boundaryTimer = null;

  const resolveTheme = (mode, date = new Date()) => {
    if (mode === "light" || mode === "dark") return mode;
    const hour = date.getHours();
    return hour >= 7 && hour < 19 ? "light" : "dark";
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

  const delayUntilNextBoundary = (now = new Date()) => {
    const next = new Date(now);
    const hour = now.getHours();

    if (hour < 7) {
      next.setHours(7, 0, 0, 0);
    } else if (hour < 19) {
      next.setHours(19, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(7, 0, 0, 0);
    }

    return Math.max(1000, next.getTime() - now.getTime() + 100);
  };

  const updateControls = (mode) => {
    controls.forEach((control) => {
      control.setAttribute(
        "aria-pressed",
        control.dataset.themeOption === mode ? "true" : "false"
      );
    });
  };

  const scheduleBoundary = (mode) => {
    if (boundaryTimer !== null) window.clearTimeout(boundaryTimer);
    boundaryTimer = null;
    if (mode !== "auto") return;

    boundaryTimer = window.setTimeout(() => {
      applyMode("auto", false);
    }, delayUntilNextBoundary());
  };

  const applyMode = (mode, persist = true) => {
    const safeMode = validModes.has(mode) ? mode : "auto";
    root.dataset.themeMode = safeMode;
    root.dataset.theme = resolveTheme(safeMode);
    updateControls(safeMode);
    scheduleBoundary(safeMode);
    if (persist) persistMode(safeMode);
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      applyMode(control.dataset.themeOption || "auto");
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && root.dataset.themeMode === "auto") {
      applyMode("auto", false);
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey) return;
    applyMode(event.newValue || "auto", false);
  });

  applyMode(getInitialMode(), false);
})();
