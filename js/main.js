/* emailjs.init("TON_PUBLIC_KEY");
 */
// Initialize Lenis for smooth scrolling
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

// Make lenis globally available for other scripts
window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

const sliderData = [
    { title: "Image 1", img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 2", img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 3", img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 4", img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 5", img: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 6", img: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 7", img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
    { title: "Image 8", img: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1400&q=80', url: './about.html' },
];

const config = {
    SCROLL_SPEED: 1.75,
    LERP_FACTOR: 0.05,
    MAX_VELOCITY: 150,
};

const totalSlideCount = sliderData.length;

const state = {
    currentX: 0,
    targetX: 0,
    slideWidth: 390,
    slides: [],
    isDragging: false,
    startX: 0,
    lastX: 0,
    lastMouseX: 0,
    lastScrollTime: Date.now(),
    isMoving: false,
    velocity: 0,
    lastCurrentX: 0,
    dragDistance: 0,
    hasActuallyDragged: false,
    isMobile: false,
    autoScrollSpeed: -1.2,
    autoScrollActive: false,
    autoScrollTimeout: null,
};

function checkMobile() {
    state.isMobile = window.innerWidth < 1000;
}

function createSlideElement(index) {
    const slide = document.createElement('div');
    slide.className = "slide"; // CORRIGÉ : "slide" au lieu de "slider"

    if (state.isMobile) {
        slide.style.width = "175px";
        slide.style.height = "250px";
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = "slide-image"; // CORRIGÉ : "slide-image" pour correspondre au CSS

    const img = document.createElement('img');
    const dataIndex = index % totalSlideCount;
    img.src = sliderData[dataIndex].img;
    img.alt = sliderData[dataIndex].title;

    const overlay = document.createElement('div');
    overlay.className = 'slider-overlay'; // CORRIGÉ : correspond à votre CSS .slider-overlay

    const title = document.createElement('p');
    title.className = 'project-title';
    title.textContent = sliderData[dataIndex].title;

    const arrow = document.createElement('div');
    arrow.className = 'project-arrow';
    arrow.innerHTML = `
    <svg viewBox="0 0 24 24">
        <path d="M7 17L17 7M17 7H7M17 7V17"/>
    </svg>
    `;

    slide.addEventListener('click', (e) => {
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
            window.location.href = sliderData[dataIndex].url;
        }
    });

    overlay.appendChild(title);
    overlay.appendChild(arrow);
    imageContainer.appendChild(img);
    slide.appendChild(imageContainer);
    slide.appendChild(overlay);

    return slide;
}

function initializeSlides() {
    const track = document.querySelector('.slider-track');
    if (!track) return;
    track.innerHTML = "";
    state.slides = [];

    checkMobile();
    state.slideWidth = state.isMobile ? 215 : 390;

    const copies = 6;
    const totalSlides = totalSlideCount * copies;

    for (let i = 0; i < totalSlides; i++) {
        const slide = createSlideElement(i);
        track.appendChild(slide);
        state.slides.push(slide);
    }

    const startOffset = -(totalSlideCount * state.slideWidth * 2);
    state.currentX = startOffset;
    state.targetX = startOffset;

    // Démarrer le défilement automatique
    resetAutoScrollTimer();
}

function resetAutoScrollTimer() {
    // Annuler le timer précédent
    if (state.autoScrollTimeout) {
        clearTimeout(state.autoScrollTimeout);
    }

    // Redémarrer le défilement automatique après 2 secondes d'inactivité
    state.autoScrollTimeout = setTimeout(() => {
        state.autoScrollActive = true;
    }, 2000);
}

function updateSlidePosition() { // CORRIGÉ : "update" au lieu de "upadate"
    const track = document.querySelector(".slider-track");
    if (!track) return;
    const sequenceWidth = state.slideWidth * totalSlideCount;

    if (state.currentX > -sequenceWidth * 1) {
        state.currentX -= sequenceWidth;
        state.targetX -= sequenceWidth;
    } else if (state.currentX < -sequenceWidth * 4) {
        state.currentX += sequenceWidth;
        state.targetX += sequenceWidth;
    }

    track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
}

function updateParallax() {
    const viewportCenter = window.innerWidth / 2; // CORRIGÉ : "viewport"

    state.slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (!img) return;

        const slideRect = slide.getBoundingClientRect(); // CORRIGÉ : "slideRect"

        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
            return;
        }

        const slideCenter = slideRect.left + slideRect.width / 2; // CORRIGÉ : "slideRect"
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;

        img.style.transform = `translateX(${parallaxOffset}px) scale(1.1)` // CORRIGÉ : "translateX"
    });
}

function updateMovingState() {
    state.velocity = Math.abs(state.currentX - state.lastCurrentX);
    state.lastCurrentX = state.currentX;

    const isSlowEnough = state.velocity < 0.1;
    const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;

    state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

    document.documentElement.style.setProperty(
        "--slider-moving",
        state.isMoving ? "1" : "0"
    );
}

function animate() {
    // Appliquer le défilement automatique s'il est actif
    if (state.autoScrollActive && !state.isDragging) {
        state.targetX += state.autoScrollSpeed;
    }

    state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR;

    updateMovingState();
    updateSlidePosition(); // CORRIGÉ
    updateParallax();

    requestAnimationFrame(animate);
}

function handleWheel(e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
    }

    // Arrêter le défilement automatique
    state.autoScrollActive = false;
    resetAutoScrollTimer();
    state.lastScrollTime = Date.now();

    const scrollDelta = e.deltaY * config.SCROLL_SPEED; // Généralement deltaY pour le scroll vertical de la souris
    state.targetX -= Math.max(
        Math.min(scrollDelta, config.MAX_VELOCITY),
        -config.MAX_VELOCITY
    );
}

function handleTouchStart(e) {
    // Arrêter le défilement automatique
    state.autoScrollActive = false;

    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;

    const deltaX = (e.touches[0].clientX - state.startX) * 1.5; // CORRIGÉ : "touches"
    state.targetX = state.lastX + deltaX;
    state.dragDistance = Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleTouchEnd() {
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false;
    }, 100);
}

function handleMouseDown(e) {
    // Arrêter le défilement automatique
    state.autoScrollActive = false;

    state.isDragging = true;
    state.startX = e.clientX;
    state.lastMouseX = e.clientX;
    state.dragDistance = 0;
    state.lastX = state.targetX;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleMouseMove(e) {
    if (!state.isDragging) return;

    const deltaX = (e.clientX - state.lastMouseX) * 2;
    state.targetX += deltaX;
    state.lastMouseX = e.clientX;
    state.dragDistance += Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleMouseUp() {
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false; // CORRIGÉ : "hasActuallyDragged"
    }, 100);
}

function handleResize() {
    initializeSlides();
}

function initializeEventListeners() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    slider.addEventListener("wheel", handleWheel, { passive: true }); // CORRIGÉ : "wheel" en minuscules
    slider.addEventListener('touchstart', handleTouchStart, { passive: true }); // CORRIGÉ : branché sur "slider"
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });   // CORRIGÉ : branché sur "slider"
    slider.addEventListener('touchend', handleTouchEnd);
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseUp);
    slider.addEventListener('dragstart', (e) => e.preventDefault());

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
}

/* ==========================
   MENU MOBILE GSAP
========================== */

function initializeMobileMenu() {

    const menuBtn = document.querySelector(".nav-btn");
    const navMenu = document.querySelector("nav ul");
    const closeBtn = document.querySelector(".close-menu");
    const menuFooter = document.querySelector(".nav-menu-footer");

    if (!menuBtn || !navMenu || !closeBtn) return;

    let tl = gsap.timeline({
        paused: true,
        defaults: {
            duration: 1,
            ease: "expo.inOut"
        }
    });

    function buildTimeline() {

        if (window.innerWidth >= 1000) {

            tl.pause(0);

            gsap.set(navMenu, {
                clearProps: "all"
            });

            gsap.set(navMenu.querySelectorAll("li a"), {
                clearProps: "all"
            });

            gsap.set(closeBtn, {
                clearProps: "all"
            });

            gsap.set(menuFooter, {
                clearProps: "all"
            });

            return;
        }

        tl.clear();

        tl.to(navMenu, {
            right: 0
        })
            .to(navMenu, {
                height: "100vh"
            }, "-=.1")
            .to(navMenu.querySelectorAll("li a"), {
                opacity: 1,
                pointerEvents: "all",
                stagger: 0.15
            }, "-=.8")
            .to(closeBtn, {
                opacity: 1,
                pointerEvents: "all"
            }, "-=.8")
            .to(menuFooter, {
                opacity: 1,
                pointerEvents: "all",
                y: 0
            }, "-=.2")

        tl.pause(0);
    }

    buildTimeline();

    window.addEventListener("resize", buildTimeline);

    menuBtn.addEventListener("click", () => {
        if (window.innerWidth < 1000) {
            tl.play();
        }
    });

    closeBtn.addEventListener("click", () => {
        if (window.innerWidth < 1000) {
            tl.reverse();
        }
    });
}

function initializeNavbarScroll() {

    const header = document.querySelector("header");

    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {

        const currentScrollY = window.scrollY;

        // En haut de page
        if (currentScrollY <= 50) {
            header.classList.remove("nav-hidden");
            header.classList.remove("nav-scrolled");
            lastScrollY = currentScrollY;
            return;
        }

        // Scroll vers le bas
        if (currentScrollY > lastScrollY) {
            header.classList.add("nav-hidden");
        }

        // Scroll vers le haut
        else {
            header.classList.remove("nav-hidden");
            header.classList.add("nav-scrolled");
        }

        lastScrollY = currentScrollY;
    });
}

function initializeHeroSlider() {
    const heroBg = document.querySelector(".hero-bg");
    if (!heroBg) return;

    const images = [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
    ];

    const desktopThumbs = document.querySelectorAll(".thumb-item");
    const mobileThumbs = document.querySelectorAll(".thumb-mobile-item");

    let currentIndex = 0;

    function updateActiveSlide(index) {
        // Désactive les miniatures bureau
        desktopThumbs.forEach(thumb => thumb.classList.remove("thumb-active"));
        // Désactive les miniatures mobiles avec sa propre classe
        mobileThumbs.forEach(thumb => thumb.classList.remove("thumb-mobile-active"));

        // Active les éléments actuels
        desktopThumbs[index]?.classList.add("thumb-active");
        mobileThumbs[index]?.classList.add("thumb-mobile-active");

        gsap.to(heroBg, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                heroBg.style.backgroundImage = `url("${images[index]}")`;
                gsap.to(heroBg, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });
    }

    updateActiveSlide(0);

    setInterval(() => {
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
        updateActiveSlide(currentIndex);
    }, 5000);
}

function initializeGalleryLightbox() {

    const images = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!images.length || !lightbox || !lightboxImage || !closeBtn) return;

    images.forEach(image => {

        image.addEventListener('click', () => {
            const thumbnailImage = image.querySelector('img');

            if (!thumbnailImage) return;

            lightboxImage.src = thumbnailImage.src;
            lightboxImage.alt = thumbnailImage.alt || '';
            lightbox.classList.add('active');

            document.body.style.overflow = 'hidden';
        });

    });

    function closeLightbox() {

        lightbox.classList.remove('active');

        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {

        if (e.target === lightbox) {
            closeLightbox();
        }

    });

    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape') {
            closeLightbox();
        }

    });

}


function initializeContactForm() {

    const form = document.querySelector(".contact-form");

    if (!form) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        emailjs.sendForm(
            "SERVICE_ID",
            "TEMPLATE_ID",
            form
        )
            .then(() => {

                alert("Message envoyé avec succès !");
                form.reset();

            })
            .catch((error) => {

                console.error(error);
                alert("Une erreur est survenue.");

            });

    });

}

function initializeIntro() {

    const intro = document.querySelector(".intro");

    if (!intro) return;

    if (sessionStorage.getItem("introPlayed")) {

        intro.remove();

        animateHeroEntrance();

        return;
    }

    sessionStorage.setItem("introPlayed", "true");

    const tl = gsap.timeline();

    tl.from(".intro-logo", {
        scale: .8,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
    })

        .from(".intro-content h2", {
            y: 40,
            opacity: 0,
            duration: 1
        }, "-=.6")

        .from(".intro-content p", {
            y: 20,
            opacity: 0,
            duration: 1
        }, "-=.8")

        .to(".intro", {
            yPercent: -100,
            duration: 1.3,
            ease: "expo.inOut",
            delay: .5
        })

        .call(() => {

            intro.remove();

            animateHeroEntrance();

        });

}

function initializePageTransition() {

    const overlay = document.querySelector(".page-transition");

    if (!overlay) return;

    gsap.set(overlay, {
        yPercent: -100
    });

    document.querySelectorAll("a").forEach(link => {

        const href = link.getAttribute("href");

        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto") ||
            link.target === "_blank"
        ) return;

        link.addEventListener("click", (e) => {

            e.preventDefault();

            gsap.to(overlay, {
                yPercent: 0,
                duration: 1,
                ease: "expo.inOut",
                onComplete() {
                    window.location.href = href;
                }
            });

        });

    });

}

function initializeSite() {
    initializeSlides();
    initializeEventListeners();
    initializeMobileMenu();
    initializeNavbarScroll();
    initializeHeroSlider();
    initializeGalleryLightbox();
    initializeContactForm();
    animate();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeHeroSlider);
} else {
    initializeSite();
}