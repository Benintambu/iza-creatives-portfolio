gsap.registerPlugin(ScrollTrigger);

// =========================
// Lenis + ScrollTrigger
// =========================

if (window.lenis) {
    window.lenis.on("scroll", ScrollTrigger.update);
}

gsap.ticker.lagSmoothing(0);

// =========================
// Story Horizontal Scroll
// =========================

const contents = gsap.utils.toArray(".story .story-container");

if (contents.length) {
    gsap.to(contents, {
        xPercent: -100 * (contents.length - 1),
        ease: "none",
        scrollTrigger: {
            trigger: ".story",
            pin: true,
            scrub: true,
        }
    });
}

