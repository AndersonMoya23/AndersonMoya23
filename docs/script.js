(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "portfolio-theme";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  window.addEventListener("error", (event) => {
    if (event.filename && event.filename.indexOf("script.js") === -1) return;
    root.classList.remove("js", "immersive", "b11");
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    console.error("Portafolio: error de ejecución; se activa el contenido visible.", event.error || event.message);
  });

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
    if (themeMeta) {
      themeMeta.setAttribute("content", activeTheme() === "dark" ? "#080a08" : "#f2f0e8");
    }
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

  /* ---------- Pointer parallax on the cinematic camera ---------- */

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
      const px = Math.max(-1, Math.min(1, ((pointerPosition.x - rect.left) / rect.width - 0.5) * 2));
      const py = Math.max(-1, Math.min(1, ((pointerPosition.y - rect.top) / rect.height - 0.5) * 2));
      heroCamera.style.setProperty("--camera-x", `${(-py * 3.5).toFixed(2)}deg`);
      heroCamera.style.setProperty("--camera-y", `${(px * 5).toFixed(2)}deg`);
    }

    if (scene && artifact) {
      const sceneRect = scene.getBoundingClientRect();
      if (sceneRect.width && sceneRect.height) {
        const sx = Math.max(-1, Math.min(1, ((pointerPosition.x - sceneRect.left) / sceneRect.width - 0.5) * 2));
        const sy = Math.max(-1, Math.min(1, ((pointerPosition.y - sceneRect.top) / sceneRect.height - 0.5) * 2));
        artifact.style.setProperty("--tilt-x", `${(-16 - sy * 10).toFixed(2)}deg`);
        artifact.style.setProperty("--tilt-y", `${(26 + sx * 16).toFixed(2)}deg`);
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

  function unbindParallax() {
    if (!heroSection) return;
    heroSection.removeEventListener("pointermove", queueTilt);
    heroSection.removeEventListener("pointerleave", resetTilt);
  }

  function updateParallax() {
    unbindParallax();
    if (!heroSection || reducedMotion.matches || !finePointer.matches) {
      resetTilt();
      return;
    }
    heroSection.addEventListener("pointermove", queueTilt, { passive: true });
    heroSection.addEventListener("pointerleave", resetTilt);
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

  /* ---------- Global scroll progress ---------- */

  const scrollProgress = document.getElementById("scroll-progress");
  let progressFrame = 0;

  function paintScrollProgress() {
    progressFrame = 0;
    if (!scrollProgress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const value = Math.max(0, Math.min(1, window.scrollY / max));
    scrollProgress.style.transform = `scaleX(${value.toFixed(4)})`;
  }

  function queueScrollProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(paintScrollProgress);
  }

  window.addEventListener("scroll", queueScrollProgress, { passive: true });
  window.addEventListener("resize", queueScrollProgress);
  paintScrollProgress();

  /* ---------- Project gallery controls (every motion mode) ---------- */

  const projectsSection = document.querySelector("#proyectos");
  const projectsPin = document.querySelector("#projects-pin");
  const track = document.querySelector("#projects-track");
  const panels = track ? Array.from(track.querySelectorAll(".project-panel")) : [];
  const prevButton = document.getElementById("gallery-prev");
  const nextButton = document.getElementById("gallery-next");
  const galleryCount = document.getElementById("gallery-count");
  const progressBar = document.getElementById("projects-progress-bar");
  let galleryTween = null;
  let activeIndex = 0;

  function paintProgress(progress) {
    if (!progressBar) return;
    const value = Math.max(0, Math.min(1, progress || 0));
    progressBar.style.transform = `scaleX(${Math.max(0.08, value).toFixed(3)})`;
  }

  function paintGallery(index) {
    if (!panels.length || !galleryCount) return;
    activeIndex = Math.max(0, Math.min(panels.length - 1, index));
    galleryCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
    if (prevButton) prevButton.disabled = activeIndex === 0;
    if (nextButton) nextButton.disabled = activeIndex === panels.length - 1;
    paintProgress(panels.length > 1 ? activeIndex / (panels.length - 1) : 1);
  }

  function goToPanel(index) {
    if (!panels.length) return;
    const target = Math.max(0, Math.min(panels.length - 1, index));
    const st = galleryTween && galleryTween.scrollTrigger;

    if (st && projectsSection && projectsSection.classList.contains("is-horizontal")) {
      const progress = panels.length > 1 ? target / (panels.length - 1) : 0;
      window.scrollTo({
        top: st.start + (st.end - st.start) * progress,
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });
      return;
    }

    paintGallery(target);
    panels[target].scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function onPrev() { goToPanel(activeIndex - 1); }
  function onNext() { goToPanel(activeIndex + 1); }
  function onTrackKey(event) {
    if (event.key === "ArrowRight") { event.preventDefault(); goToPanel(activeIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); goToPanel(activeIndex - 1); }
  }

  if (prevButton) prevButton.addEventListener("click", onPrev);
  if (nextButton) nextButton.addEventListener("click", onNext);
  if (track) track.addEventListener("keydown", onTrackKey);
  paintGallery(0);

  if ("IntersectionObserver" in window && projectsSection) {
    const galleryObserver = new IntersectionObserver(
      () => {
        if (projectsSection.classList.contains("is-horizontal")) return;
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
        if (closestIndex >= 0) paintGallery(closestIndex);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    panels.forEach((panel) => galleryObserver.observe(panel));
  }

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

  function enableTilt(gsap, selector, restZ, restRotationY, cleanups) {
    if (!finePointer.matches) return;

    gsap.utils.toArray(selector).forEach((element) => {
      const rotationX = gsap.quickTo(element, "rotationX", { duration: 0.4, ease: "power2.out" });
      const rotationY = gsap.quickTo(element, "rotationY", { duration: 0.4, ease: "power2.out" });
      const depth = gsap.quickTo(element, "z", { duration: 0.4, ease: "power2.out" });

      const onMove = (event) => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        const py = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
        rotationX(-py * 6);
        rotationY(px * 8 + restRotationY);
        depth(restZ + 16);
      };

      const onLeave = () => {
        rotationX(0);
        rotationY(restRotationY);
        depth(restZ);
      };

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
    root.classList.add("immersive", "b11");

    const cleanups = [];
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      splitWords(document.querySelectorAll("[data-split]"));

      /* Opening frame */
      gsap.from(".hero .title-line", {
        yPercent: 115, opacity: 0, duration: 1.15,
        stagger: 0.14, ease: "power3.out", delay: 0.1
      });
      gsap.from(".hero .kicker, .hero .hero-lead, .hero .hero-actions, .hero .hero-foot", {
        y: 24, opacity: 0, duration: 0.85,
        stagger: 0.07, ease: "power2.out", delay: 0.35
      });
      gsap.from(".scroll-cue", { opacity: 0, duration: 0.8, delay: 1 });

      /* Hero: real camera movement through layered CSS 3D planes */
      gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })
        .fromTo(".hero-cinematic",
          { z: 0, rotationX: 0, rotationY: 0 },
          { z: 120, rotationX: 5, rotationY: -6, ease: "none" }, 0)
        .fromTo(".hero-copy",
          { z: 70, rotationY: 0, opacity: 1 },
          { z: -140, rotationY: -10, opacity: 0.12, ease: "none" }, 0)
        .fromTo(".hero-visual",
          { z: -30, rotationX: 2, rotationY: 8 },
          { z: 120, rotationX: -5, rotationY: -12, ease: "none" }, 0)
        .fromTo("#artifact-scroll",
          { z: 0, rotationX: -8, rotationY: 0 },
          { z: 80, rotationX: 12, rotationY: 245, ease: "none" }, 0)
        .fromTo(".hero-plane-far",
          { z: -240, rotationY: -7, opacity: 0.38 },
          { z: 60, rotationY: 4, opacity: 0.16, ease: "none" }, 0)
        .fromTo(".hero-plane-mid",
          { z: -80, y: 0, opacity: 1 },
          { z: 90, y: -30, opacity: 0.2, ease: "none" }, 0)
        .fromTo(".hero-typefield",
          { z: -160, rotationX: 58, yPercent: 6, opacity: 0.55 },
          { z: 40, rotationX: 16, yPercent: -14, opacity: 0.16, ease: "none" }, 0)
        .fromTo(".module-a", { z: 120, rotationY: -18 }, { z: 180, rotationY: -28, ease: "none" }, 0)
        .fromTo(".module-b", { z: -40, rotationY: 22 }, { z: 90, rotationY: 8, ease: "none" }, 0)
        .fromTo(".module-c", { z: 40, rotationX: 60 }, { z: -60, rotationX: 28, ease: "none" }, 0)
        .fromTo(".hero-frame", { opacity: 1 }, { opacity: 0, ease: "none" }, 0)
        .fromTo(".scroll-cue", { opacity: 1, y: 0 }, { opacity: 0, y: 20, ease: "none" }, 0);

      /* About: editorial depth and progressive reveal */
      gsap.from(wordsIn("#sobre-title"), {
        yPercent: 90, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out",
        scrollTrigger: {
          trigger: "#sobre-title", start: "top 78%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.from(wordsIn(".about-copy .lead"), {
        yPercent: 70, opacity: 0, stagger: 0.035, duration: 0.7, ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-copy", start: "top 76%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.from(".about-facts div", {
        y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-facts", start: "top 84%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.fromTo(".about-copy",
        { z: 80, rotationY: -5 },
        {
          z: 0, rotationY: 0, ease: "none",
          scrollTrigger: { trigger: "#sobre-mi", start: "top bottom", end: "center center", scrub: 1 }
        });
      gsap.fromTo(".about-facts",
        { z: -120, rotationY: 10 },
        {
          z: 20, rotationY: 0, ease: "none",
          scrollTrigger: { trigger: "#sobre-mi", start: "top bottom", end: "center center", scrub: 1 }
        });
      gsap.fromTo(".about-echo",
        { z: -260, rotationY: -10, yPercent: 8 },
        {
          z: -120, rotationY: 6, yPercent: -12, ease: "none",
          scrollTrigger: { trigger: "#sobre-mi", start: "top bottom", end: "bottom top", scrub: 1 }
        });
      gsap.fromTo(".about-thread", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: "#sobre-mi", start: "top 76%", end: "bottom 60%", scrub: true }
      });

      /* Technologies: spatial planes with hover and keyboard tilt */
      gsap.from(wordsIn("#tec-title"), {
        yPercent: 80, opacity: 0, stagger: 0.08, duration: 0.75, ease: "power3.out",
        scrollTrigger: {
          trigger: "#tecnologias", start: "top 72%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.from(".tech-group", {
        y: 60, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-stage", start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.fromTo(".tech-ghost",
        { z: -200, rotationY: -8, yPercent: 8, rotation: -4 },
        {
          z: -40, rotationY: 8, yPercent: -20, rotation: 4, ease: "none",
          scrollTrigger: { trigger: "#tecnologias", start: "top bottom", end: "bottom top", scrub: 1 }
        });

      mm.add("(min-width: 761px)", () => {
        gsap.utils.toArray(".tech-group").forEach((group, index) => {
          gsap.fromTo(group,
            { z: -140 + index * 30, rotationX: 4, rotationY: index % 2 ? 9 : -9 },
            {
              z: 50 - index * 25, rotationX: -2, rotationY: index % 2 ? -4 : 4, ease: "none",
              scrollTrigger: { trigger: ".tech-stage", start: "top bottom", end: "bottom top", scrub: 1 }
            });
        });
      });

      /* Formation: progressive timeline */
      gsap.from(".edu-item, .cert-list li", {
        z: -70, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power2.out",
        scrollTrigger: {
          trigger: "#formacion", start: "top 70%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.fromTo(".timeline-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".cert-block", start: "top 84%", end: "bottom 70%", scrub: true }
      });
      gsap.fromTo(".timeline-node",
        { y: 0, opacity: 0.5 },
        {
          y: () => {
            const list = document.querySelector(".cert-list");
            return list ? Math.max(40, list.offsetHeight - 60) : 240;
          },
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".cert-block", start: "top 84%", end: "bottom 70%",
            scrub: 1, invalidateOnRefresh: true
          }
        });

      /* Contact: closing frame */
      gsap.from(wordsIn("#contact-title"), {
        yPercent: 85, opacity: 0, stagger: 0.09, duration: 0.8, ease: "power3.out",
        scrollTrigger: {
          trigger: "#contacto", start: "top 74%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.from(".contact-lead, .contact-actions > *", {
        y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
        scrollTrigger: {
          trigger: ".contact-grid", start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
      gsap.fromTo(".contact-grid",
        { z: -80, rotationX: 5 },
        {
          z: 0, rotationX: 0, ease: "none",
          scrollTrigger: { trigger: "#contacto", start: "top bottom", end: "center center", scrub: 1 }
        });
      gsap.fromTo(".contact-actions",
        { z: 70, rotationY: 6 },
        {
          z: 20, rotationY: 0, ease: "none",
          scrollTrigger: { trigger: ".contact-grid", start: "top bottom", end: "center center", scrub: 1 }
        });
      gsap.fromTo(".contact-echo",
        { z: -280, rotationY: -8, yPercent: 10 },
        {
          z: -120, rotationY: 8, yPercent: -12, ease: "none",
          scrollTrigger: { trigger: "#contacto", start: "top bottom", end: "bottom top", scrub: 1 }
        });

      /* Project gallery: horizontal on desktop, natural vertical on smaller screens */
      if (projectsSection && projectsPin && track && panels.length) {
        mm.add("(min-width: 1025px)", () => {
          projectsSection.classList.add("is-horizontal");
          gsap.set(track, { x: 0 });
          gsap.set(panels, { transformPerspective: 1100, transformOrigin: "50% 50%" });
          const distance = () => Math.max(0, track.scrollWidth - projectsPin.clientWidth);

          galleryTween = gsap.to(track, {
            x: () => -distance(), ease: "none",
            scrollTrigger: {
              trigger: projectsPin, start: "top top+=96",
              end: () => `+=${distance() + window.innerHeight * 0.35}`,
              scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
              onUpdate: (self) => {
                paintGallery(Math.round(self.progress * (panels.length - 1)));
                paintProgress(self.progress);
              }
            }
          });

          panels.forEach((panel) => {
            gsap.fromTo(panel,
              { z: -120, rotationY: 8 },
              {
                z: 0, rotationY: 0, ease: "none",
                scrollTrigger: {
                  trigger: panel, containerAnimation: galleryTween,
                  start: "left 92%", end: "center center", scrub: 1
                }
              });

            const targets = panel.querySelectorAll(
              ".case-head, .case-main h3, .case-lead, .case-cols > div, .case-foot, .case-extra > div:first-child, .case-extra-links"
            );
            if (!targets.length) return;
            gsap.from(targets, {
              y: 26, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power2.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: panel, containerAnimation: galleryTween,
                start: "left 85%", end: "right 15%",
                toggleActions: "play none none reverse"
              }
            });
          });

          paintGallery(0);
          paintProgress(0.08);
          return () => {
            galleryTween = null;
            projectsSection.classList.remove("is-horizontal");
            gsap.set(track, { clearProps: "transform" });
            gsap.set(panels, { clearProps: "transform" });
          };
        });

        mm.add("(max-width: 1024px)", () => {
          galleryTween = null;
          projectsSection.classList.remove("is-horizontal");
          gsap.set(track, { clearProps: "transform" });
          gsap.set(panels, { clearProps: "transform" });
          panels.forEach((panel) => {
            gsap.fromTo(panel,
              { z: -70, rotationX: 5 },
              {
                z: 0, rotationX: 0, ease: "none",
                scrollTrigger: { trigger: panel, start: "top bottom", end: "center center", scrub: 1 }
              });

            const targets = panel.querySelectorAll(
              ".case-head, .case-main h3, .case-lead, .case-cols > div, .case-foot, .case-extra > div:first-child, .case-extra-links"
            );
            if (!targets.length) return;
            gsap.from(targets, {
              y: 50, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power2.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: panel, start: "top 78%",
                toggleActions: "play none none reverse"
              }
            });
          });
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
      root.classList.remove("immersive", "b11");
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      paintGallery(activeIndex);
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
        root.classList.remove("immersive", "b11");
        initSimpleReveal();
      }
    } else {
      root.classList.remove("immersive", "b11");
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
