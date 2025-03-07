// =======================
// Initialisation de Lenis pour un scrolling fluide
// =======================

const lenis = new Lenis();
lenis.on("scroll", (e) => {
  currentScroll = e.scroll; 
  ScrollTrigger.update();
});
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); 
});
gsap.ticker.lagSmoothing(0); 

// =======================
// Gestion du curseur personnalisé
// =======================

const cursor = document.getElementById("cursor");

document.addEventListener("mousemove", (e) => {
  gsap.to(cursor, {
    x: e.clientX - 10,
    y: e.clientY - 10,
    duration: 0.1,
    ease: "power3.out",
  });
});

// =======================
// Gestion du son
// =======================
// Charger le son
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("model-viewer");
  const whooshSound = new Audio("./sons/swipe-132084.mp3"); 

  whooshSound.volume = 0.4; 

  const playSound = () => {
      whooshSound.currentTime = 0; 
      whooshSound.play();
  };

  const observer = new IntersectionObserver(
      (entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  playSound();
              }
          });
      },
      { threshold: 0.3 } // Déclenche lorsque 30% de la section est visible
  );

  sections.forEach((section) => observer.observe(section));
});



// =======================
// Chargement du modèle 3D
// =======================
// gsap.registerPlugin(ScrollTrigger);

// gsap.to("#Model", {
//   y: "100vh",
//   ease: "none",
//   scrollTrigger: {
//     trigger: "body", // Au lieu de ".container" pour couvrir toute la page
//     start: "top top",
//     end: "bottom bottom",
//     scrub: 1,
//   }
// });


gsap.to(".logo", {
  duration: 2,   // Durée d'une respiration
  scale: 1.5,    // Agrandissement du logo
  yoyo: true,    // Faire l'animation dans les deux sens
  repeat: -1,    // Répéter à l'infini
  ease: "power1.inOut"  // Courbe de transition douce
});

gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Animation fluide avec le scroll
  }
});

// Étape 1 : Descendre légèrement
tl.to("#Model", {
  y: "50vh",
  duration: 3.5,
  ease: "power1.inOut"
});

// Étape 2 : Continuer la descente + déplacement à gauche
tl.to("#Model", {
  y: "80vh",
  x: "50vw",
  duration: 10,
  ease: "power2.inOut"
});

// Étape 3 : Descendre en revenant à la position initiale
tl.to("#Model", {
  y: "10vh",
  x: "0vw",
  duration: 10,
  ease: "power3.inOut"
});

// Étape 4 : Descendre en allant à droite
tl.to("#Model", {
  y: "10vh",
  x: "10vw",
  duration: 10,
  ease: "power4.inOut"
});


// const img = document.querySelector(".space2 img");

// gsap.to(img, {
//   scale: 1.1, 
//   duration: 4.5,
//   repeat: -1,
//   yoyo: true, 
//   ease: "power1.inOut" 
// });

// Ajouter une interaction au survol pour renforcer l'effet
// img.addEventListener("mouseenter", () => {
//   gsap.to(img, { scale: 1.2, duration: 0.5, ease: "power2.out" });
// });

// img.addEventListener("mouseleave", () => {
//   gsap.to(img, { scale: 1.1, duration: 0.5, ease: "power2.out" });
// });


gsap.registerPlugin(ScrollTrigger);

let tz = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, 
  }
});

// Étape 1 : Descendre légèrement
tz.to("#Model2", {
  y: "0vh",
  duration: 5.5,
  ease: "power1.inOut"
});

// Étape 2 : Continuer la descente + déplacement à gauche
tz.to("#Model2", {
  y: "100vh",
  x: "0vw",
  duration: 20,
  ease: "power2.inOut"
});


