import { initializeHeroThumbnails, initializeHeroSlider } from './home/hero.js';
import { initializeSlider, startSliderAnimation } from './home/slider.js';
import { initializeMobileMenu, initializeNavbarScroll } from './home/menu.js';
import { initializeGallery } from './home/gallery.js';
import { initializeContactForm } from './home/contact.js';
import { initializeIntro, animateHeroEntrance } from './home/intro.js';
import { initializePageTransition } from './home/transitions.js';

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

async function initializeSite() {
    initializeHeroThumbnails();
    initializeHeroSlider();
    initializeSlider();
    initializeMobileMenu();
    initializeNavbarScroll();
    await initializeGallery();
    initializeContactForm();
    initializeIntro();
    initializePageTransition();
    startSliderAnimation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeSite();
    });
} else {
    initializeSite();
}