(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "portfolio-theme";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

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
      ) {
        setMenu(false);
      }
    });

    const desktopView = window.matchMedia("(min-width: 761px)");
    watchMedia(desktopView, (event) => {
      if (event.matches) setMenu(false);
    });
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

  /* ---------- Pointer parallax on the artifact ---------- */

  const scene = document.getElementById("scene");
  const artifact = document.getElementById("artifact");
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

  /* ---------- Reveal fallback (no GSAP or reduced motion) ---------- */

  function initSimpleReveal() {
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

  function wordsIn(selector) {
    const scope = document.querySelector(selector);
    return scope ? Array.from(scope.querySelectorAll(".word")) : [];
  }

  function initImmersive(gsap, ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("immersive");

    const cleanups = [];
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      splitWords(document.querySelectorAll("[data-split]"));

      /* Opening sequence */
      gsap.from(".hero .title-line", {
        yPercent: 115, opacity: 0, duration: 1.15,
        stagger: 0.14, ease: "power3.out", delay: 0.1
      });
      gsap.from(".hero .kicker, .hero .hero-lead, .hero .hero-actions, .hero .hero-foot", {
        y: 24, opacity: 0, duration: 0.85,
        stagger: 0.07, ease: "power2.out", delay: 0.35
      });
      gsap.from(".scroll-cue", { opacity: 0, duration: 0.8, delay: 1 });

      /* Hero scroll-linked scene */
      gsap.timeline({
        scrollTrigger: {
          trigger: "#inicio", start: "top top", end: "+=130%",
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true
        }
      })
        .to(".hero-copy", { yPercent: -16, opacity: 0.12, scale: 0.97, ease: "none" }, 0)
        .to("#artifact-scroll", {
          rotationY: 210, rotationX: -10, scale: 1.22,
          xPercent: 14, yPercent: -8, ease: "none"
        }, 0)
        .to(".scene-floor", { yPercent: 16, opacity: 0.18, ease: "none" }, 0)
        .to(".scene", { perspective: 720, ease: "none" }, 0)
        .to(".scroll-cue", { opacity: 0, y: 20, ease: "none" }, 0);

      /* About scene */
      gsap.from(wordsIn("#sobre-title"), {
        yPercent: 90, opacity: 0, stagger: 0.09, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: "#sobre-mi", start: "top 72%" }
      });
      gsap.from(wordsIn(".about-copy .lead"), {
        yPercent: 70, opacity: 0, stagger: 0.035, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ".about-copy", start: "top 74%" }
      });
      gsap.from(".about-facts div", {
        y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ".about-facts", start: "top 82%" }
      });
      gsap.fromTo(".about-thread", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: "#sobre-mi", start: "top 76%", end: "bottom 60%", scrub: true }
      });

      /* Technology scene */
      gsap.from(wordsIn("#tec-title"), {
        yPercent: 80, opacity: 0, stagger: 0.08, duration: 0.75, ease: "power3.out",
        scrollTrigger: { trigger: "#tecnologias", start: "top 70%" }
      });
      gsap.from(".tech-group", {
        y: 70, opacity: 0, rotateX: 6, stagger: 0.12, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".tech-stage", start: "top 78%" }
      });
      gsap.fromTo(".tech-ghost", { yPercent: 8, rotation: -4 }, {
        yPercent: -20, rotation: 4, ease: "none",
        scrollTrigger: { trigger: "#tecnologias", start: "top bottom", end: "bottom top", scrub: true }
      });

      /* Formation timeline */
      gsap.from(".edu-item, .cert-list li", {
        y: 28, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: "#formacion", start: "top 70%" }
      });
      gsap.fromTo(".timeline-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".cert-block", start: "top 84%", end: "bottom 70%", scrub: true }
      });

      /* Contact scene */
      gsap.from(wordsIn("#contact-title"), {
        yPercent: 85, opacity: 0, stagger: 0.09, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: "#contacto", start: "top 72%" }
      });
      gsap.from(".contact-lead, .contact-actions > *", {
        y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-grid", start: "top 78%" }
      });
      gsap.fromTo(".contact-echo", { yPercent: 10, rotation: -4 }, {
        yPercent: -16, rotation: 4, ease: "none",
        scrollTrigger: { trigger: "#contacto", start: "top bottom", end: "bottom top", scrub: true }
      });

      /* Continuity between scenes */
      gsap.utils.toArray("[data-depth]").forEach((element) => {
        if (element.closest("#inicio")) return;
        const depth = parseFloat(element.getAttribute("data-depth")) || 0.08;
        gsap.to(element, {
          yPercent: -depth * 100, ease: "none",
          scrollTrigger: {
            trigger: element.closest("section") || element,
            start: "top bottom", end: "bottom top", scrub: true
          }
        });
      });
    });

    /* Project gallery: horizontal on desktop, natural vertical on smaller screens */
    const projectsSection = document.querySelector("#proyectos");
    const projectsPin = document.querySelector("#projects-pin");
    const track = document.querySelector("#projects-track");
    const panels = track ? Array.from(track.querySelectorAll(".project-panel")) : [];
    const prevButton = document.getElementById("gallery-prev");
    const nextButton = document.getElementById("gallery-next");
    const galleryCount = document.getElementById("gallery-count");
    let galleryTween = null;
    let activeIndex = 0;

    function updateGallery(progress) {
      if (!panels.length || !galleryCount) return;
      activeIndex = Math.min(panels.length - 1, Math.round(progress * (panels.length - 1)));
      galleryCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      if (prevButton) prevButton.disabled = activeIndex === 0;
      if (nextButton) nextButton.disabled = activeIndex === panels.length - 1;
    }

    function goToPanel(index) {
      if (!galleryTween || !galleryTween.scrollTrigger) return;
      const target = Math.max(0, Math.min(panels.length - 1, index));
      const st = galleryTween.scrollTrigger;
      const progress = panels.length > 1 ? target / (panels.length - 1) : 0;
      window.scrollTo({ top: st.start + (st.end - st.start) * progress, behavior: "smooth" });
    }

    function onPrev() { goToPanel(activeIndex - 1); }
    function onNext() { goToPanel(activeIndex + 1); }
    function onTrackKey(event) {
      if (!galleryTween) return;
      if (event.key === "ArrowRight") { event.preventDefault(); goToPanel(activeIndex + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goToPanel(activeIndex - 1); }
    }

    if (prevButton) prevButton.addEventListener("click", onPrev);
    if (nextButton) nextButton.addEventListener("click", onNext);
    if (track) track.addEventListener("keydown", onTrackKey);
    cleanups.push(() => {
      if (prevButton) prevButton.removeEventListener("click", onPrev);
      if (nextButton) nextButton.removeEventListener("click", onNext);
      if (track) track.removeEventListener("keydown", onTrackKey);
    });

    if (projectsSection && projectsPin && track && panels.length) {
      mm.add("(min-width: 1025px)", () => {
        projectsSection.classList.add("is-horizontal");
        gsap.set(track, { x: 0 });
        const distance = () => Math.max(0, track.scrollWidth - projectsPin.clientWidth);

        galleryTween = gsap.to(track, {
          x: () => -distance(), ease: "none",
          scrollTrigger: {
            trigger: projectsPin, start: "top top+=96",
            end: () => `+=${distance() + window.innerHeight * 0.35}`,
            scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => updateGallery(self.progress)
          }
        });

        panels.forEach((panel) => {
          gsap.from(panel.querySelectorAll(".case-head, .case-main h3, .case-lead, .case-cols > div, .case-foot"), {
            y: 26, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power2.out",
            scrollTrigger: {
              trigger: panel, containerAnimation: galleryTween,
              start: "left 85%", toggleActions: "play none none reverse"
            }
          });
        });

        updateGallery(0);
        return () => {
          galleryTween = null;
          projectsSection.classList.remove("is-horizontal");
          gsap.set(track, { clearProps: "transform" });
        };
      });

      mm.add("(max-width: 1024px)", () => {
        galleryTween = null;
        projectsSection.classList.remove("is-horizontal");
        gsap.set(track, { clearProps: "transform" });
        gsap.from(panels, {
          y: 50, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: projectsPin, start: "top 78%" }
        });
        return () => {};
      });
    }

    /* Moderate magnetic response on selected controls */
    if (finePointer.matches) {
      gsap.utils.toArray("[data-magnetic]").forEach((element) => {
        const onMove = (event) => {
          const rect = element.getBoundingClientRect();
          const dx = (event.clientX - rect.left - rect.width / 2) * 0.12;
          const dy = (event.clientY - rect.top - rect.height / 2) * 0.12;
          gsap.to(element, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
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

    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh, { once: true });
    cleanups.push(() => window.removeEventListener("load", refresh));
    refresh();

    return () => {
      cleanups.forEach((fn) => fn());
      mm.revert();
      ctx.revert();
      root.classList.remove("immersive");
    };
  }

  /* ---------- Boot animation system ---------- */

  let destroyImmersive = () => {};
  if (window.gsap && window.ScrollTrigger && !reducedMotion.matches) {
    try {
      destroyImmersive = initImmersive(window.gsap, window.ScrollTrigger);
    } catch (_) {
      root.classList.remove("immersive");
      initSimpleReveal();
    }
  } else {
    initSimpleReveal();
  }

  window.addEventListener("pagehide", () => destroyImmersive(), { once: true });

  /* ---------- mediaQuery helper ---------- */

  function watchMedia(query, callback) {
    if (typeof query.addEventListener === "function") query.addEventListener("change", callback);
    else if (typeof query.addListener === "function") query.addListener(callback);
  }
})();
