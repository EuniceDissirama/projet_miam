// =======================
// Réglages généraux
// =======================
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// =======================
// Scrolling fluide avec Lenis
// =======================
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
lenis.stop(); // on attend la fin du chargement

// Les liens du menu défilent en douceur jusqu'à leur section
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: href === "#top" ? 0 : -90 });
  });
});

// =======================
// Écran de chargement
// =======================
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const heroModel = document.getElementById("Model");
const startedAt = performance.now();
let loaderClosed = false;

function closeLoader() {
  if (loaderClosed) return;
  loaderClosed = true;
  // On laisse la mascotte rebondir au moins un instant
  const wait = Math.max(0, 900 - (performance.now() - startedAt));
  setTimeout(() => {
    loaderBar.style.width = "100%";
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    lenis.start();
    ScrollTrigger.refresh();
    playHeroIntro();
  }, wait);
}

heroModel.addEventListener("progress", (e) => {
  loaderBar.style.width = Math.round(e.detail.totalProgress * 100) + "%";
});
heroModel.addEventListener("load", closeLoader);
heroModel.addEventListener("error", closeLoader);
setTimeout(closeLoader, 8000); // jamais bloqué plus de 8 secondes

// =======================
// Curseur personnalisé
// =======================
const cursor = document.getElementById("cursor");

document.addEventListener("mousemove", (e) => {
  cursor.style.opacity = 1;
  gsap.to(cursor, {
    x: e.clientX - 20,
    y: e.clientY - 20,
    duration: 0.1,
    ease: "power3.out",
  });
});

// =======================
// Bouton son
// =======================
const soundToggle = document.getElementById("soundToggle");
const whooshSound = new Audio("./sons/swipe-132084.mp3");
whooshSound.volume = 0.4;
let soundOn = localStorage.getItem("miam-son") === "on";

function playWhoosh() {
  if (!soundOn) return;
  whooshSound.currentTime = 0;
  whooshSound.play().catch(() => {});
}

function renderSoundToggle() {
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundToggle.setAttribute("aria-label", soundOn ? "Couper le son" : "Activer le son");
}

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("miam-son", soundOn ? "on" : "off");
  renderSoundToggle();
  playWhoosh();
});
renderSoundToggle();

// Un "whoosh" quand un paquet apparaît à l'écran (si le son est activé)
const soundObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) playWhoosh();
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll("model-viewer").forEach((m) => soundObserver.observe(m));

// =======================
// Logo qui "respire"
// =======================
if (!reduceMotion) {
  gsap.to(".nav .logo", {
    duration: 2,
    scale: 1.12,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });
}

// =======================
// Titres animés mot par mot
// =======================
function splitWords(el) {
  const nodes = [...el.childNodes];
  el.textContent = "";
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // On découpe le texte sur les espaces normaux (les espaces insécables restent collés)
      node.textContent.split(/ +/).forEach((word, i, all) => {
        if (word.trim()) el.append(wrapWord(document.createTextNode(word)));
        if (i < all.length - 1) el.append(" ");
      });
    } else {
      // Un élément (ex. le mot manuscrit) reste un seul bloc
      el.append(wrapWord(node));
    }
  });
  return el.querySelectorAll(".w__in");
}

function wrapWord(content) {
  const outer = document.createElement("span");
  const inner = document.createElement("span");
  outer.className = "w";
  inner.className = "w__in";
  inner.append(content);
  outer.append(inner);
  return outer;
}

const splitTitles = [...document.querySelectorAll("[data-split]")].map((el) => ({
  el,
  words: splitWords(el),
}));

if (!reduceMotion) {
  splitTitles.forEach(({ el, words }) => {
    gsap.set(words, { yPercent: 110 });
    if (el.closest(".hero")) return; // le titre du haut s'anime après le chargement
    gsap.to(words, {
      yPercent: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
}

function playHeroIntro() {
  if (reduceMotion) return;
  const heroWords = document.querySelectorAll(".hero [data-split] .w__in");
  gsap.to(heroWords, { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.15 });
  gsap.from(".hero__tagline, .hero .eyebrow, .badge", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.12,
    delay: 0.35,
    ease: "power2.out",
  });
  gsap.from("#Model", { scale: 0.85, opacity: 0, duration: 1.2, ease: "power3.out" });
}

// =======================
// Miettes de biscuit dans l'en-tête
// =======================
(function crumbs() {
  const canvas = document.getElementById("crumbs");
  const ctx = canvas.getContext("2d");
  const colors = ["#e9b65c", "#d99a3c", "#f3cf86", "#c8822e"];
  let width = 0;
  let height = 0;
  let mouseX = 0;
  let mouseY = 0;
  let running = false;
  let particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 768 ? 18 : 40;
    particles = Array.from({ length: count }, () => newCrumb(true));
  }

  function newCrumb(anywhere) {
    const depth = Math.random(); // 0 = loin, 1 = proche
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -10,
      size: 2 + depth * 5,
      speed: 0.15 + depth * 0.45,
      drift: (Math.random() - 0.5) * 0.3,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
      depth,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.35 + depth * 0.5,
    };
  }

  function drawCrumb(p) {
    const px = p.x + mouseX * p.depth * 24;
    const py = p.y + mouseY * p.depth * 16;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    // une forme de miette un peu irrégulière
    ctx.moveTo(-p.size, -p.size * 0.4);
    ctx.lineTo(-p.size * 0.2, -p.size);
    ctx.lineTo(p.size, -p.size * 0.5);
    ctx.lineTo(p.size * 0.7, p.size * 0.8);
    ctx.lineTo(-p.size * 0.6, p.size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.y += p.speed;
      p.x += p.drift;
      p.angle += p.spin;
      if (p.y > height + 10) particles[i] = newCrumb(false);
      drawCrumb(p);
    });
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  resize();

  if (reduceMotion) {
    particles.forEach(drawCrumb); // image fixe, sans mouvement
    return;
  }

  // On n'anime que lorsque l'en-tête est visible
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(frame);
  }).observe(canvas);
})();

// =======================
// Le paquet qui voyage au scroll (ordinateur uniquement)
// =======================

// Position d'un élément dans la page, sans tenir compte des animations en cours
function pagePosition(el) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// Décalage pour centrer le modèle sur un emplacement vide
function offsetTo(model, slot, axis) {
  const m = pagePosition(model);
  const s = pagePosition(slot);
  return axis === "x"
    ? s.x + s.w / 2 - (m.x + m.w / 2)
    : s.y + s.h / 2 - (m.y + m.h / 2);
}

const mm = gsap.matchMedia();

mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
  const slot1 = document.querySelector('[data-slot="1"]');
  const slot2 = document.querySelector('[data-slot="2"]');

  // Le paquet descend de l'en-tête vers "Nos ingrédients", puis vers "Composition"
  const travel = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      endTrigger: slot2,
      end: "center center",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  travel
    .to(heroModel, {
      x: () => offsetTo(heroModel, slot1, "x"),
      y: () => offsetTo(heroModel, slot1, "y"),
      rotation: 8,
      ease: "power1.inOut",
    })
    .to(heroModel, {
      x: () => offsetTo(heroModel, slot2, "x"),
      y: () => offsetTo(heroModel, slot2, "y"),
      rotation: -6,
      ease: "power1.inOut",
    });

  // La nouvelle saveur remonte légèrement pendant le scroll
  gsap.fromTo(
    "#Model2",
    { y: 80 },
    {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: ".new-flavor",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    }
  );

  // Les paquets de l'histoire glissent en éventail
  gsap.from(".story__packs img", {
    y: 80,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".story__packs", start: "top 85%" },
  });
});

// =======================
// Saveurs interactives
// =======================
const flavors = {
  nature: {
    model: "./2.glb",
    name: "Atchonmons nature",
    text: "La recette d'origine, simple et croustillante, pour retrouver le vrai goût de l'atchonmon.",
    orbit: "-30deg 85deg auto",
  },
  epices: {
    model: "./3.glb",
    name: "Atchonmons salés et épicés",
    text: "Une pointe de sel et d'épices pour ceux qui aiment quand ça relève. Parfait à l'apéritif.",
    orbit: "-30deg 85deg auto",
  },
  sucres: {
    model: "./4.glb",
    name: "Atchonmons sucrés",
    text: "Une douceur dorée et croquante, idéale pour le goûter des petits comme des grands.",
    orbit: "-110deg 85deg auto",
  },
  vanille: {
    model: "./5.glb",
    name: "Atchonmons à la vanille",
    text: "Un parfum de vanille tout en douceur, pour une pause gourmande et parfumée.",
    orbit: "-110deg 85deg auto",
  },
};

const flavorSection = document.getElementById("saveurs");
const flavorModel = document.getElementById("flavorModel");
const flavorName = document.getElementById("flavorName");
const flavorText = document.getElementById("flavorText");
const flavorTabs = [...document.querySelectorAll(".flavor-tabs button")];

function showFlavor(key) {
  const flavor = flavors[key];
  if (!flavor || flavorSection.dataset.flavor === key) return;

  flavorSection.dataset.flavor = key;
  flavorTabs.forEach((tab) => {
    const selected = tab.dataset.flavor === key;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  const swap = () => {
    flavorModel.src = flavor.model;
    flavorModel.cameraOrbit = flavor.orbit;
    flavorModel.alt = `Paquet Miam ${flavor.name} en 3D`;
    flavorName.textContent = flavor.name;
    flavorText.textContent = flavor.text;
  };

  if (reduceMotion) {
    swap();
    return;
  }

  gsap
    .timeline()
    .to([flavorModel, ".flavor-card h3", ".flavor-card p"], {
      opacity: 0,
      y: 16,
      duration: 0.2,
      ease: "power2.in",
    })
    .add(swap)
    .to([flavorModel, ".flavor-card h3", ".flavor-card p"], {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: "power3.out",
      stagger: 0.05,
    });
  playWhoosh();
}

flavorTabs.forEach((tab, index) => {
  tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  tab.addEventListener("click", () => showFlavor(tab.dataset.flavor));
  // Flèches gauche/droite pour passer d'une saveur à l'autre au clavier
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = flavorTabs[(index + step + flavorTabs.length) % flavorTabs.length];
    next.focus();
    showFlavor(next.dataset.flavor);
  });
});

// =======================
// Formulaire de contact
// =======================
// Pas de serveur : le message s'ouvre dans la messagerie du visiteur
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const subject = `Message de ${form.get("nom")} depuis le site Miam`;
  const body = `${form.get("message")}\n\n${form.get("nom")} (${form.get("email")})`;
  window.location.href =
    "mailto:miamindustrie@gmail.com?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);
});

// =======================
// Recalculs quand les modèles 3D changent la hauteur de la page
// =======================
window.addEventListener("load", () => ScrollTrigger.refresh());
document.querySelectorAll("model-viewer").forEach((m) =>
  m.addEventListener("load", () => ScrollTrigger.refresh(), { once: true })
);
