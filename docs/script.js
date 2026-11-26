(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "portfolio-theme";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  window.addEventListener("error", (event) => {
    if (event.filename && event.filename.indexOf("script.js") === -1) return;
    root.classList.remove("js", "immersive", "b11", "b12");
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    console.error("Portafolio: error de ejecución; se activa el contenido visible.", event.error || event.message);
  });

  /* ---------- Theme ---------- */

  function readTheme() {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  }

  function saveTheme(value) {
    try { localStorage.setItem(storageKey, value); } catch (_) { /* Session only. */ }
  }

  function activeTheme() {
    return root.dataset.theme === "light" ? "light" : "dark";
  }

  const themeButton = document.getElementById("theme-toggle");
  const savedTheme = readTheme();
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;

  function syncThemeControl() {
    if (themeMeta) {
      themeMeta.setAttribute("content", activeTheme() === "dark" ? "#080a08" : "#f2f0e8");
    }
    if (!themeButton) return;
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    themeButton.setAttribute("aria-label", nextTheme === "dark" ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
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
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
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
      ) setMenu(false);
    });
    watchMedia(window.matchMedia("(min-width: 761px)"), (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Active navigation ---------- */

  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const sectionIds = ["inicio"].concat(navLinks.map((link) => link.getAttribute("href").slice(1)));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

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
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
          else visibleSections.delete(entry.target.id);
        });
        const best = Array.from(visibleSections.entries()).sort((a, b) => b[1] - a[1])[0];
        if (best) setActiveSection(best[0]);
      }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });
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

  /* ---------- Pointer camera response (additive, never blocks scroll) ---------- */

  const heroSection = document.getElementById("inicio");
  const scene = document.getElementById("scene");
  const artifact = document.getElementById("artifact");
  const heroCamera = document.querySelector("[data-camera-inner]");
  let pointerPosition = null;
  let tiltFrame = 0;

  function applyTilt() {
    tiltFrame = 0;
    if (!pointerPosition) return;
    const rect = heroSection ? heroSection.getBoundingClientRect() : null;
    if (heroCamera && rect && rect.width && rect.height) {
      const px = clamp(((pointerPosition.x - rect.left) / rect.width - 0.5) * 2, -1, 1);
      const py = clamp(((pointerPosition.y - rect.top) / rect.height - 0.5) * 2, -1, 1);
      heroCamera.style.setProperty("--camera-x", `${(-py * 5.5).toFixed(2)}deg`);
      heroCamera.style.setProperty("--camera-y", `${(px * 7).toFixed(2)}deg`);
    }
    if (scene && artifact) {
      const sceneRect = scene.getBoundingClientRect();
      if (sceneRect.width && sceneRect.height) {
        const sx = clamp(((pointerPosition.x - sceneRect.left) / sceneRect.width - 0.5) * 2, -1, 1);
        const sy = clamp(((pointerPosition.y - sceneRect.top) / sceneRect.height - 0.5) * 2, -1, 1);
        artifact.style.setProperty("--tilt-x", `${(-16 - sy * 12).toFixed(2)}deg`);
        artifact.style.setProperty("--tilt-y", `${(26 + sx * 18).toFixed(2)}deg`);
      }
    }
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
    if (heroCamera) {
      heroCamera.style.setProperty("--camera-x", "0deg");
      heroCamera.style.setProperty("--camera-y", "0deg");
    }
    if (artifact) {
      artifact.style.setProperty("--tilt-x", "-16deg");
      artifact.style.setProperty("--tilt-y", "26deg");
    }
  }

  function updateParallax() {
    if (!heroSection) return;
    heroSection.removeEventListener("pointermove", queueTilt);
    heroSection.removeEventListener("pointerleave", resetTilt);
    if (reducedMotion.matches || !finePointer.matches) {
      resetTilt();
      return;
    }
    heroSection.addEventListener("pointermove", queueTilt, { passive: true });
    heroSection.addEventListener("pointerleave", resetTilt);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  watchMedia(finePointer, updateParallax);
  watchMedia(reducedMotion, updateParallax);
  updateParallax();

  /* ---------- Copy public GitHub link ---------- */

  const copyButton = document.getElementById("copy-button");
  const copyStatus = document.getElementById("copy-status");
  let copyTimer = 0;

  function writeToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true);
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    field.remove();
    return Promise.resolve(copied);
  }

  if (copyButton && copyStatus) {
    copyButton.addEventListener("click", async () => {
      const text = copyButton.getAttribute("data-copy") || "";
      if (!text) return;
      try {
        const copied = await writeToClipboard(text);
        copyStatus.textContent = copied ? "Enlace copiado." : "No se pudo copiar. Usa el botón de GitHub.";
      } catch (_) {
        copyStatus.textContent = "No se pudo copiar. Usa el botón de GitHub.";
      }
      clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => { copyStatus.textContent = ""; }, 3000);
    });
  }

  /* ---------- Year and global progress ---------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const scrollProgress = document.getElementById("scroll-progress");
  let progressFrame = 0;

  function paintScrollProgress() {
    progressFrame = 0;
    if (!scrollProgress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress.style.transform = `scaleX(${clamp(window.scrollY / max, 0, 1).toFixed(4)})`;
  }

  function queueScrollProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(paintScrollProgress);
  }

  window.addEventListener("scroll", queueScrollProgress, { passive: true });
  window.addEventListener("resize", queueScrollProgress);
  paintScrollProgress();

  /* ---------- Project sequence: count and progress, no forced carousel ---------- */

  const projectsSection = document.querySelector("#proyectos");
  const track = document.querySelector("#projects-track");
  const panels = track ? Array.from(track.querySelectorAll(".project-panel")) : [];
  const galleryCount = document.getElementById("gallery-count");
  const progressBar = document.getElementById("projects-progress-bar");
  let activeIndex = 0;

  function paintProgress(progress) {
    if (!progressBar) return;
    progressBar.style.transform = `scaleX(${Math.max(0.08, clamp(progress || 0, 0, 1)).toFixed(3)})`;
  }

  function setGalleryCount(index) {
    if (!panels.length || !galleryCount) return;
    activeIndex = clamp(index, 0, panels.length - 1);
    galleryCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
  }

  function paintGallery(index) {
    setGalleryCount(index);
    paintProgress(panels.length > 1 ? activeIndex / (panels.length - 1) : 1);
  }

  function goToPanel(index) {
    if (!panels.length) return;
    const target = clamp(index, 0, panels.length - 1);
    setGalleryCount(target);
    panels[target].scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function onTrackKey(event) {
    if (event.key === "ArrowRight") { event.preventDefault(); goToPanel(activeIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); goToPanel(activeIndex - 1); }
  }

  if (track) track.addEventListener("keydown", onTrackKey);
  paintGallery(0);

  if ("IntersectionObserver" in window && panels.length) {
    const sequenceObserver = new IntersectionObserver(() => {
      const center = window.innerHeight / 2;
      let closestIndex = -1;
      let closestDistance = Infinity;
      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        const distance = Math.abs((rect.top + rect.bottom) / 2 - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex >= 0) setGalleryCount(closestIndex);
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
    panels.forEach((panel) => sequenceObserver.observe(panel));
  }

  /* ---------- Reveal fallback ---------- */

  function initSimpleReveal() {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    document.querySelectorAll(".case.reveal").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${index * 90}ms`);
    });
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
  }

  /* ---------- Immersive system ---------- */

  function splitWords(nodes) {
    nodes.forEach((element) => {
      if (!element || element.dataset.splitDone === "true") return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
      }
      textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          const word = document.createElement("span");
          word.className = "word";
          word.textContent = part;
          fragment.appendChild(word);
        });
        node.parentNode.replaceChild(fragment, node);
      });
      element.dataset.splitDone = "true";
    });
  }

  function splitGlyphs(nodes) {
    nodes.forEach((element) => {
      if (!element || element.dataset.glyphsDone === "true") return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
      }
      textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        Array.from(node.nodeValue).forEach((char) => {
          if (/\s/.test(char)) {
            fragment.appendChild(document.createTextNode(char));
            return;
          }
          const glyph = document.createElement("span");
          glyph.className = "glyph";
          glyph.textContent = char;
          fragment.appendChild(glyph);
        });
        node.parentNode.replaceChild(fragment, node);
      });
      element.dataset.glyphsDone = "true";
    });
  }

  function wordsIn(selector) {
    const scope = document.querySelector(selector);
    return scope ? Array.from(scope.querySelectorAll(".word")) : [];
  }

  function enableTilt(gsap, selector, restZ, restRotationY, cleanups) {
    if (!finePointer.matches) return;
    gsap.utils.toArray(selector).forEach((element) => {
      const rotationX = gsap.quickTo(element, "rotationX", { duration: 0.4, ease: "power2.out" });
      const rotationY = gsap.quickTo(element, "rotationY", { duration: 0.4, ease: "power2.out" });
      const depth = gsap.quickTo(element, "z", { duration: 0.4, ease: "power2.out" });
      const onMove = (event) => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
        const py = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
        rotationX(-py * 6);
        rotationY(px * 8 + restRotationY);
        depth(restZ + 16);
      };
      const onLeave = () => { rotationX(0); rotationY(restRotationY); depth(restZ); };
      element.addEventListener("pointermove", onMove, { passive: true });
      element.addEventListener("pointerleave", onLeave);
      element.addEventListener("blur", onLeave);
      cleanups.push(() => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
        element.removeEventListener("blur", onLeave);
      });
    });
  }

  function initImmersive(gsap, ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("immersive", "b12");
    root.classList.remove("b11");

    const cleanups = [];
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      splitWords(document.querySelectorAll("[data-split]"));
      splitGlyphs(document.querySelectorAll("[data-glyphs]"));
      gsap.set(".hero-handoff", { visibility: "visible" });

      /* Opening frame — quick, then the scroll owns the composition. */
      gsap.from(".hero .title-line", {
        yPercent: 115, opacity: 0, duration: 1.05,
        stagger: 0.12, ease: "power3.out", delay: 0.08
      });
      gsap.from(".hero .kicker, .hero .hero-lead, .hero .hero-actions, .hero .hero-foot", {
        y: 24, opacity: 0, duration: 0.8, stagger: 0.07, ease: "power2.out", delay: 0.3
      });
      gsap.from(".scroll-cue", { opacity: 0, duration: 0.8, delay: 0.9 });

      /* Editorial word reveals are reversible and never leave content hidden. */
      [
        ["#sobre-title", "#sobre-title", 0.08],
        [".about-copy .lead", ".about-copy", 0.035],
        ["#tec-title", "#tecnologias", 0.08],
        ["#proy-title", "#proyectos", 0.08],
        ["#form-title", "#formacion", 0.08],
        ["#contact-title", "#contacto", 0.09]
      ].forEach(([wordScope, trigger, stagger]) => {
        gsap.from(wordsIn(wordScope), {
          yPercent: 85, opacity: 0, stagger, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger, start: "top 78%", toggleActions: "play none none reverse" }
        });
      });

      gsap.from(".about-facts div", {
        y: 34, opacity: 0, stagger: 0.09, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: "#sobre-mi", start: "top 74%", toggleActions: "play none none reverse" }
      });
      gsap.from(".contact-lead, .contact-actions > *", {
        y: 26, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-grid", start: "top 82%", toggleActions: "play none none reverse" }
      });

      /* Desktop + tablet: the scroll is the camera operator. */
      mm.add("(min-width: 761px)", () => {
        const heroTL = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: heroSection,
            start: "top top+=76",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true
          }
        });

        heroTL
          .fromTo(".hero-cinematic",
            { z: -90, rotationX: 0, rotationY: 0, scale: 1, opacity: 1 },
            { z: 190, rotationX: -13, rotationY: 22, scale: 1.14, duration: 1 }, 0)
          .to(".hero-cinematic",
            { z: 540, rotationX: -7, rotationY: -20, scale: 0.72, opacity: 0, duration: 0.45 }, 0.55)

          .fromTo(".hero-copy",
            { x: 0, z: 90, rotationY: 0, opacity: 1 },
            { x: -34, z: -40, rotationY: -8, opacity: 0.88, duration: 1 }, 0)
          .to(".hero-copy", { x: -160, z: -260, rotationY: -20, opacity: 0, duration: 0.4 }, 0.6)

          .fromTo(".title-first .glyph",
            { x: 0, y: 0, z: 30, rotationY: 0, opacity: 1 },
            { x: -72, y: -54, z: 220, rotationY: -28, duration: 0.55, stagger: 0.006 }, 0)
          .to(".title-first .glyph",
            { x: -210, y: -150, z: 460, rotationY: -60, opacity: 0, duration: 0.45, stagger: 0.004 }, 0.55)
          .fromTo(".title-second .glyph",
            { x: 0, y: 0, z: 30, rotationY: 0, opacity: 1 },
            { x: 78, y: 58, z: -120, rotationY: 30, duration: 0.55, stagger: 0.006 }, 0)
          .to(".title-second .glyph",
            { x: 220, y: 130, z: 460, rotationY: 62, opacity: 0, duration: 0.45, stagger: 0.004 }, 0.55)

          .fromTo(".hero-visual",
            { x: 0, z: -40, rotationY: 8, rotationX: 0, opacity: 1 },
            { x: 42, z: 150, rotationY: -16, rotationX: 5, duration: 1 }, 0)
          .to(".hero-visual", { x: 128, z: 430, rotationY: -44, rotationX: -10, opacity: 0, duration: 0.45 }, 0.55)

          .fromTo("#artifact-scroll",
            { z: 0, rotationX: -10, rotationY: 0 },
            { z: 320, rotationX: 26, rotationY: 330, duration: 1 }, 0)
          .to("#artifact-scroll", { z: 620, rotationX: -18, rotationY: 700, duration: 0.45 }, 0.55)

          .fromTo(".scene-floor",
            { scale: 1, rotationX: 74, opacity: 0.62 },
            { scale: 2.4, rotationX: 80, opacity: 0.82, duration: 1 }, 0)
          .to(".scene-floor", { scale: 4.6, rotationX: 86, opacity: 0, duration: 0.45 }, 0.55)

          .fromTo(".hero-typefield",
            { z: -340, rotationX: 72, yPercent: 10, opacity: 0.28 },
            { z: 40, rotationX: -8, yPercent: -18, opacity: 0.72, duration: 1 }, 0)
          .to(".hero-typefield", { z: 300, rotationX: 30, yPercent: -56, opacity: 0, duration: 0.45 }, 0.55)

          .fromTo(".hero-plane-far",
            { z: -260, rotationY: -7, opacity: 0.55 },
            { z: 90, rotationY: 8, opacity: 0.24, duration: 1 }, 0)
          .to(".hero-plane-far", { z: 380, rotationY: -14, opacity: 0, duration: 0.45 }, 0.55)
          .fromTo(".hero-plane-mid",
            { x: -24, z: -80, opacity: 1 },
            { x: 44, z: 90, opacity: 0.6, duration: 1 }, 0)
          .to(".hero-plane-mid", { x: 130, z: 300, opacity: 0, duration: 0.45 }, 0.55)

          .fromTo(".module-a", { z: 120, rotationY: -18 }, { z: 260, rotationY: -42, duration: 1 }, 0)
          .fromTo(".module-b", { z: -40, rotationY: 22 }, { z: 150, rotationY: 4, duration: 1 }, 0)
          .fromTo(".module-c", { z: 40, rotationX: 60 }, { z: -90, rotationX: 18, duration: 1 }, 0)

          .fromTo(".hero-topline, .hero-frame, .scroll-cue",
            { opacity: 1, y: 0 }, { opacity: 0, y: -18, duration: 0.42 }, 0.05)
          .fromTo(".hero-handoff",
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.63 }, 0.35);

        /* Sobre mí rises out of the last hero frame; it is not a new block below. */
        gsap.fromTo(".about-stage",
          { y: 170, rotationX: 7, opacity: 0.35 },
          {
            y: 0, rotationX: 0, opacity: 1, ease: "none",
            scrollTrigger: {
              trigger: "#sobre-mi", start: "top 95%", end: "top 32%",
              scrub: 1, invalidateOnRefresh: true
            }
          });
        gsap.fromTo(".about-echo",
          { x: -80, z: -300, rotationY: -12, yPercent: 12 },
          {
            x: 40, z: -100, rotationY: 10, yPercent: -12, ease: "none",
            scrollTrigger: { trigger: "#sobre-mi", start: "top bottom", end: "bottom top", scrub: 1 }
          });
        gsap.fromTo(".about-thread", { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: "#sobre-mi", start: "top 76%", end: "bottom 62%", scrub: true }
        });

        /* Tecnologies: one measured plane the categories settle into. */
        gsap.fromTo(".tech-shell",
          { y: 34, rotation: -0.6 },
          {
            y: -34, rotation: 0.6, ease: "none",
            scrollTrigger: { trigger: "#tecnologias", start: "top 82%", end: "bottom 68%", scrub: 1 }
          });
        gsap.fromTo(".tech-measure", { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: "#tecnologias", start: "top 82%", end: "bottom 68%", scrub: 1 }
        });
        gsap.fromTo(".tech-ghost",
          { z: -240, rotationY: -12, yPercent: 10, rotation: -5 },
          {
            z: -30, rotationY: 12, yPercent: -22, rotation: 5, ease: "none",
            scrollTrigger: { trigger: "#tecnologias", start: "top bottom", end: "bottom top", scrub: 1 }
          });
        gsap.utils.toArray(".tech-group").forEach((group, index) => {
          gsap.fromTo(group,
            {
              x: index % 2 ? 54 : -54,
              y: 120 + index * 20,
              z: -190 + index * 50,
              rotationX: 10,
              rotationY: index % 2 ? 16 : -16
            },
            {
              x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, ease: "none",
              scrollTrigger: { trigger: "#tecnologias", start: "top 82%", end: "bottom 68%", scrub: 1 }
            });
          const inner = group.querySelector(".tech-card-inner");
          if (inner) {
            gsap.fromTo(inner, { y: 30 }, {
              y: 0, ease: "none",
              scrollTrigger: { trigger: "#tecnologias", start: "top 82%", end: "bottom 68%", scrub: 1 }
            });
          }
        });

        /* Projects: each case assembles in depth as it reaches reading position. */
        gsap.fromTo("#projects-progress-bar", { scaleX: 0.08 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: "#project-layout", start: "top 72%", end: "bottom 72%", scrub: 1 }
        });
        panels.forEach((panel) => {
          gsap.fromTo(panel,
            { y: 90, z: -90, rotationX: 6, opacity: 0.5 },
            {
              y: 0, z: 0, rotationX: 0, opacity: 1, ease: "none",
              scrollTrigger: { trigger: panel, start: "top 92%", end: "top 32%", scrub: 1 }
            });
          const art = panel.querySelector(".case-art");
          if (art) {
            gsap.fromTo(art,
              { y: 36, z: -90, rotationY: 13, opacity: 0.55 },
              {
                y: 0, z: 40, rotationY: 0, opacity: 1, ease: "none",
                scrollTrigger: { trigger: panel, start: "top 90%", end: "center 58%", scrub: 1 }
              });
          }
          const targets = panel.querySelectorAll(
            ".case-head, .case-main h3, .case-lead, .case-cols > div, .case-cta, .case-foot, .case-extra > div:first-child, .case-extra-links"
          );
          if (!targets.length) return;
          gsap.from(targets, {
            y: 26, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power2.out",
            immediateRender: false,
            scrollTrigger: { trigger: panel, start: "top 78%", toggleActions: "play none none reverse" }
          });
        });

        /* Formation: the line is a route travelled by the reader. */
        gsap.fromTo(".timeline-line", { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: ".cert-block", start: "top 86%", end: "bottom 68%", scrub: true }
        });
        gsap.fromTo(".timeline-node", { y: 0, opacity: 0.45 }, {
          y: () => {
            const list = document.querySelector(".cert-list");
            return list ? Math.max(40, list.offsetHeight - 60) : 240;
          },
          opacity: 1, ease: "none",
          scrollTrigger: {
            trigger: ".cert-block", start: "top 86%", end: "bottom 68%",
            scrub: 1, invalidateOnRefresh: true
          }
        });
        gsap.from(".edu-item, .cert-list li", {
          x: -26, opacity: 0, stagger: 0.07, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: "#formacion", start: "top 72%", toggleActions: "play none none reverse" }
        });

        /* Contact: a single aperture closes around the final statement. */
        gsap.fromTo(".contact-grid",
          { y: 70, z: -120, rotationX: 8, opacity: 0.45 },
          {
            y: 0, z: 0, rotationX: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: "#contacto", start: "top 90%", end: "center 55%", scrub: 1 }
          });
        gsap.fromTo(".contact-echo",
          { z: -320, rotationY: -12, yPercent: 12 },
          {
            z: -80, rotationY: 10, yPercent: -10, ease: "none",
            scrollTrigger: { trigger: "#contacto", start: "top bottom", end: "bottom top", scrub: 1 }
          });
        gsap.fromTo(".contact-aperture",
          { scale: 0.4, rotation: -40, opacity: 0 },
          {
            scale: 1.35, rotation: 20, opacity: 1, ease: "none",
            scrollTrigger: { trigger: "#contacto", start: "top 90%", end: "bottom 70%", scrub: 1 }
          });
      });

      mm.add("(max-width: 760px)", () => {
        gsap.utils.toArray(".case-art").forEach((art) => {
          gsap.fromTo(art, { y: 24, opacity: 0.6 }, {
            y: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: art, start: "top 92%", end: "top 50%", scrub: 1 }
          });
        });
      });

      /* Moderate magnetic response on selected controls */
      if (finePointer.matches) {
        gsap.utils.toArray("[data-magnetic]").forEach((element) => {
          const onMove = (event) => {
            const rect = element.getBoundingClientRect();
            gsap.to(element, {
              x: (event.clientX - rect.left - rect.width / 2) * 0.1,
              y: (event.clientY - rect.top - rect.height / 2) * 0.1,
              duration: 0.3, ease: "power2.out"
            });
          };
          const onLeave = () => gsap.to(element, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" });
          element.addEventListener("pointermove", onMove);
          element.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            element.removeEventListener("pointermove", onMove);
            element.removeEventListener("pointerleave", onLeave);
          });
        });
      }

      enableTilt(gsap, ".tech-card-inner", 0, 0, cleanups);
      enableTilt(gsap, "[data-art-tilt]", 24, -6, cleanups);

      const refresh = () => ScrollTrigger.refresh();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});
      window.addEventListener("load", refresh, { once: true });
      cleanups.push(() => window.removeEventListener("load", refresh));
      refresh();
    });

    return () => {
      cleanups.forEach((fn) => fn());
      mm.revert();
      ctx.revert();
      root.classList.remove("immersive", "b12");
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      paintGallery(activeIndex);
      gsap.set([".hero-cinematic", ".hero-copy", ".hero-visual", ".hero-handoff", ".about-stage", ".case", ".case-art", ".contact-grid", ".contact-aperture"], {
        clearProps: "transform,opacity"
      });
    };
  }

  /* ---------- Boot animation system ---------- */

  let destroyImmersive = () => {};

  function bootImmersive() {
    if (window.gsap && window.ScrollTrigger && !reducedMotion.matches) {
      try {
        destroyImmersive = initImmersive(window.gsap, window.ScrollTrigger);
      } catch (error) {
        console.error("No se pudo iniciar el sistema inmersivo; se activa el fallback.", error);
        root.classList.remove("immersive", "b11", "b12");
        initSimpleReveal();
      }
    } else {
      root.classList.remove("immersive", "b11", "b12");
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      initSimpleReveal();
    }
  }

  bootImmersive();
  window.__portfolioBooted = true;
  if (window.__portfolioBootTimer) {
    window.clearTimeout(window.__portfolioBootTimer);
    window.__portfolioBootTimer = 0;
  }

  watchMedia(reducedMotion, () => {
    destroyImmersive();
    destroyImmersive = () => {};
    bootImmersive();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) destroyImmersive();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    destroyImmersive = () => {};
    bootImmersive();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  /* ---------- mediaQuery helper ---------- */

  function watchMedia(query, callback) {
    if (typeof query.addEventListener === "function") query.addEventListener("change", callback);
    else if (typeof query.addListener === "function") query.addListener(callback);
  }
})();
