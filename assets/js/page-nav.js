(() => {
  const nav = document.querySelector(".page-nav");
  if (!nav) return;

  const inner = nav.querySelector(".page-nav-inner");
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const idToLink = new Map(
    links
      .map((link) => {
        const href = link.getAttribute("href") || "";
        const id = href.startsWith("#") ? href.slice(1) : "";
        return id ? [id, link] : null;
      })
      .filter(Boolean)
  );

  const headings = Array.from(document.querySelectorAll("section h2[id]"));

  if (!headings.length) return;

  let suppressSpy = false;
  let suppressTimer = null;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const activeLink = idToLink.get(id);
    if (!activeLink) return;
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "location");
    if (inner && inner.scrollWidth > inner.clientWidth) {
      activeLink.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  const updateOverflowFades = () => {
    if (!inner) return;
    const maxScroll = inner.scrollWidth - inner.clientWidth;
    nav.classList.toggle("can-scroll-left", maxScroll > 1 && inner.scrollLeft > 1);
    nav.classList.toggle("can-scroll-right", maxScroll > 1 && inner.scrollLeft < maxScroll - 1);
  };

  const getScrollOffset = () => {
    const style = window.getComputedStyle(nav);
    if (style.position !== "sticky") {
      return Math.min(160, window.innerHeight * 0.2);
    }
    const top = Number.parseFloat(style.top) || 0;
    const headingStyle = window.getComputedStyle(headings[0]);
    const scrollMargin = Number.parseFloat(headingStyle.scrollMarginTop) || 0;
    return Math.max(top + nav.offsetHeight + 24, scrollMargin + 1);
  };

  const getActiveHeadingId = () => {
    const y = window.scrollY + getScrollOffset();
    let activeId = headings[0].id;

    for (const heading of headings) {
      const headingY = heading.getBoundingClientRect().top + window.scrollY;
      if (headingY <= y) activeId = heading.id;
      else break;
    }

    return idToLink.has(activeId) ? activeId : "";
  };

  const releaseSpy = () => {
    if (suppressTimer !== null) window.clearTimeout(suppressTimer);
    suppressTimer = null;
    suppressSpy = false;
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").slice(1);
      if (!id) return;
      suppressSpy = true;
      setActive(id);
      if (suppressTimer !== null) window.clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(releaseSpy, 1200);
    });
  });

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", () => {
      if (suppressSpy) releaseSpy();
    });
  }

  let rafId = null;
  const onScroll = () => {
    if (rafId != null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      if (!suppressSpy) setActive(getActiveHeadingId());
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateOverflowFades();
    onScroll();
  }, { passive: true });
  if (inner) {
    inner.addEventListener("scroll", updateOverflowFades, { passive: true });
  }

  updateOverflowFades();
  onScroll();
})();
