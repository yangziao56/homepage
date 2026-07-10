(() => {
  const nav = document.querySelector(".page-nav");
  if (!nav) return;

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

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const activeLink = idToLink.get(id);
    if (!activeLink) return;
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "location");
  };

  const getScrollOffset = () => {
    const style = window.getComputedStyle(nav);
    if (style.position !== "sticky") {
      return Math.min(160, window.innerHeight * 0.2);
    }
    const top = Number.parseFloat(style.top) || 0;
    return top + nav.offsetHeight + 24;
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

  let rafId = null;
  const onScroll = () => {
    if (rafId != null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      setActive(getActiveHeadingId());
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  onScroll();
})();
