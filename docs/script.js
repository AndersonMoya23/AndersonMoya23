(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "portfolio-theme";

  /* ---------- Theme ---------- */

  function readTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  }

  function saveTheme(value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (_) {
      /* Storage may be unavailable; the theme still works for this session. */
    }
  }

  function activeTheme() {
    return root.dataset.theme === "light" ? "light" : "dark";
  }

  const themeButton = document.getElementById("theme-toggle");
  const savedTheme = readTheme();
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;

  function syncThemeControl() {
    if (!themeButton) return;
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    themeButton.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"
    );
    const label = themeButton.querySelector(".theme-label");
    if (label) label.textContent = nextTheme === "dark" ? "Oscuro" : "Claro";
  }

  syncThemeControl();
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextTheme = activeTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      saveTheme(nextTheme);
      syncThemeControl();
    });
  }

  /* ---------- Mobile menu ---------- */

  const menuButton = document.getElementById("menu-toggle");
  const navPanel = document.getElementById("nav-panel");

  function setMenu(open) {
    if (!menuButton || !navPanel) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    navPanel.classList.toggle("open", open);
  }

  if (menuButton && navPanel) {
    setMenu(false);

    menuButton.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        menuButton.getAttribute("aria-expanded") === "true" &&
        !menuButton.contains(event.target) &&
        !navPanel.contains(event.target)
      ) {
        setMenu(false);
      }
    });

    const desktopView = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = (event) => {
      if (event.matches) setMenu(false);
    };
    watchMedia(desktopView, closeOnDesktop);
  }

  /* ---------- Scroll reveal ---------- */

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  document.querySelectorAll(".case.reveal").forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Active navigation ---------- */

  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const sectionIds = ["inicio"].concat(
    navLinks.map((link) => link.getAttribute("href").slice(1))
  );
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((section) => Boolean(section));

  function setActiveSection(id) {
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if (sections.length) {
    setActiveSection("inicio");

    if ("IntersectionObserver" in window) {
      const visibleSections = new Map();
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
            else visibleSections.delete(entry.target.id);
          });
          const best = Array.from(visibleSections.entries()).sort((a, b) => b[1] - a[1])[0];
          if (best) setActiveSection(best[0]);
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
      );
      sections.forEach((section) => navObserver.observe(section));
    } else {
      const updateActiveOnScroll = () => {
        const probe = window.innerHeight * 0.38;
        let activeId = "inicio";
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= probe) activeId = section.id;
        });
        setActiveSection(activeId);
      };
      window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
      window.addEventListener("resize", updateActiveOnScroll);
      updateActiveOnScroll();
    }
  }

  /* ---------- Subtle CSS 3D parallax ---------- */

  const scene = document.getElementById("scene");
  const artifact = document.getElementById("artifact");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pointerPosition = null;
  let tiltFrame = 0;

  function applyTilt() {
    tiltFrame = 0;
    if (!scene || !artifact || !pointerPosition) return;
    const rect = scene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = Math.max(-1, Math.min(1, ((pointerPosition.x - rect.left) / rect.width - 0.5) * 2));
    const py = Math.max(-1, Math.min(1, ((pointerPosition.y - rect.top) / rect.height - 0.5) * 2));
    artifact.style.setProperty("--tilt-x", `${(-16 - py * 10).toFixed(2)}deg`);
    artifact.style.setProperty("--tilt-y", `${(26 + px * 16).toFixed(2)}deg`);
  }

  function queueTilt(event) {
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
  }

  function resetTilt() {
    pointerPosition = null;
    if (tiltFrame) {
      cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
    }
    if (!artifact) return;
    artifact.style.setProperty("--tilt-x", "-16deg");
    artifact.style.setProperty("--tilt-y", "26deg");
  }

  function unbindParallax() {
    if (!scene) return;
    scene.removeEventListener("pointermove", queueTilt);
    scene.removeEventListener("pointerleave", resetTilt);
  }

  function updateParallax() {
    unbindParallax();
    if (!scene || !artifact || reducedMotion.matches || !finePointer.matches) {
      resetTilt();
      return;
    }
    scene.addEventListener("pointermove", queueTilt, { passive: true });
    scene.addEventListener("pointerleave", resetTilt);
  }

  watchMedia(finePointer, updateParallax);
  watchMedia(reducedMotion, updateParallax);
  updateParallax();

  /* ---------- Copy public GitHub link ---------- */

  const copyButton = document.getElementById("copy-button");
  const copyStatus = document.getElementById("copy-status");
  let copyTimer = 0;

  function writeToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_) {
      copied = false;
    }
    field.remove();
    return Promise.resolve(copied);
  }

  if (copyButton && copyStatus) {
    copyButton.addEventListener("click", async () => {
      const text = copyButton.getAttribute("data-copy") || "";
      if (!text) return;

      try {
        const copied = await writeToClipboard(text);
        copyStatus.textContent = copied
          ? "Enlace copiado."
          : "No se pudo copiar. Usa el botón de GitHub.";
      } catch (_) {
        copyStatus.textContent = "No se pudo copiar. Usa el botón de GitHub.";
      }

      clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        copyStatus.textContent = "";
      }, 3000);
    });
  }

  /* ---------- Footer year ---------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- mediaQuery helper ---------- */

  function watchMedia(query, callback) {
    if (typeof query.addEventListener === "function") query.addEventListener("change", callback);
    else if (typeof query.addListener === "function") query.addListener(callback);
  }
})();
