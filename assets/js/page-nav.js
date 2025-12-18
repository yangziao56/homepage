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

  const headings = Array.from(
    document.querySelectorAll("section h2[id]")
  ).filter((h) => idToLink.has(h.id));

  if (!headings.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const activeLink = idToLink.get(id);
    if (!activeLink) return;
    activeLink.classList.add("is-active");
    activeLink.setAttribute("aria-current", "true");
  };

  const getActiveHeadingId = () => {
    const offset = 140;
    const y = window.scrollY + offset;
    let activeId = headings[0].id;

    for (const heading of headings) {
      if (heading.offsetTop <= y) activeId = heading.id;
      else break;
    }

    return activeId;
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

