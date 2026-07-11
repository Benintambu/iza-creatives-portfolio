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
    { title: "Image 1", img: '/assets/images/home-gallery-slider/1.webp', url: './about.html' },
    { title: "Image 2", img: '/assets/images/home-gallery-slider/2.webp', url: './about.html' },
    { title: "Image 3", img: '/assets/images/home-gallery-slider/3.webp', url: './about.html' },
    { title: "Image 4", img: '/assets/images/home-gallery-slider/4.webp', url: './about.html' },
    { title: "Image 5", img: '/assets/images/home-gallery-slider/5.webp', url: './about.html' },
    { title: "Image 6", img: '/assets/images/home-gallery-slider/6.webp', url: './about.html' },
    { title: "Image 7", img: '/assets/images/home-gallery-slider/7.webp', url: './about.html' },
    { title: "Image 8", img: '/assets/images/home-gallery-slider/8.webp', url: './about.html' },
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

function setHeroBackground(imageUrl, activeThumb) {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    heroBg.style.backgroundImage = `url("${imageUrl}")`;

    document.querySelectorAll('.thumb-item, .thumb-mobile-item').forEach((thumb) => {
        const isDesktopThumb = thumb.classList.contains('thumb-item');
        thumb.classList.toggle('thumb-active', isDesktopThumb && thumb === activeThumb);
        thumb.classList.toggle('thumb-mobile-active', !isDesktopThumb && thumb === activeThumb);
    });
}

function initializeHeroThumbnails() {
    const thumbnails = document.querySelectorAll('.thumb-item, .thumb-mobile-item');
    if (!thumbnails.length) return;

    thumbnails.forEach((thumb) => {
        const handleSelect = () => {
            const imageUrl = thumb.dataset.image;
            if (!imageUrl) return;
            setHeroBackground(imageUrl, thumb);
        };

        thumb.addEventListener('click', handleSelect);
        thumb.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelect();
            }
        });
    });

    const firstThumb = document.querySelector('.thumb-item');
    if (firstThumb?.dataset.image) {
        setHeroBackground(firstThumb.dataset.image, firstThumb);
    }
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
        "https://res.cloudinary.com/dgfskm9bz/image/upload/v1783804780/1_nf4qyi.webp",
        "https://res.cloudinary.com/dgfskm9bz/image/upload/v1783804780/2_ddupan.webp",
        "https://res.cloudinary.com/dgfskm9bz/image/upload/v1783804785/4_koxchn.webp",
        "https://res.cloudinary.com/dgfskm9bz/image/upload/v1783804785/4_koxchn.webp"
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

const galleryData = [
    {
        src: '/assets/images/gallery/1.webp',
        alt: 'Photographie éditoriale de mode et portrait artistique - IZA Creatives',
        folder: 'Shooting couple',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/2.webp',
        alt: 'Reportage photo et capture de moments complices lors d\'un mariage',
        folder: 'Shooting couple',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/3.webp',
        alt: 'Séance photo de couple en extérieur style cinématique spontané',
        folder: 'Shooting couple',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/4.webp',
        alt: 'Portrait créatif et direction artistique pour séance photo de mode',
        folder: 'Shooting couple',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/5.webp',
        alt: 'Capture de détails et émotions d\'un événement festif par IZA Creatives',
        folder: 'Conférence',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/6.webp',
        alt: 'Photographie de célébration et instants précieux de mariage',
        folder: 'Conférence',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/7.webp',
        alt: 'Portrait studio moderne et épuré axé sur l\'émotion brute',
        folder: 'Conférence',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/8.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/9.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/10.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/11.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/12.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/13.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/14.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/15.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/16.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/17.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/18.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/19.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/20.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/21.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Mariage',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/22.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/23.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/24.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/25.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/26.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/27.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/28.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/29.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/30.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/31.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/32.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/33.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/34.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/35.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/36.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/37.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/38.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/39.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/40.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
    {
        src: '/assets/images/gallery/41.webp',
        alt: 'Création de visuels haut de gamme pour identité de marque',
        folder: 'Nuits des lévites',
        year: '2025'
    },
];

const galleryFolders = Array.from(galleryData.reduce((groups, item) => {
    const key = (item.folder || 'Autre').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!groups.has(key)) {
        groups.set(key, {
            id: key,
            name: item.folder,
            coverImage: item.src,
            items: []
        });
    }
    groups.get(key).items.push(item);
    return groups;
}, new Map()).values());

function renderGalleryGrid(items) {
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');

    if (!galleryGrid) return;

    const gallerySection = document.querySelector('.gallery');
    const folderContainer = document.querySelector('.gallery-folder');

    if (gallerySection) {
        gallerySection.classList.remove('is-hidden');
    }

    if (folderContainer) {
        folderContainer.classList.remove('is-active');
    }

    if (toolbar) {
        toolbar.innerHTML = '';
    }

    galleryGrid.innerHTML = items.map((item) => `
        <div class="gallery-item">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
            <div class="gallery-overlay">
                <h3>${item.folder}</h3>
                <span>${item.year}</span>
            </div>
        </div>
    `).join('');

    requestAnimationFrame(() => {
        galleryGrid.classList.add('is-ready');
    });

    initializeGalleryLightbox();
}

function renderFoldersView() {
    const folderContainer = document.querySelector('.gallery-folder');
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');
    const gallerySection = document.querySelector('.gallery');

    if (gallerySection) {
        gallerySection.classList.add('is-hidden');
    }

    if (toolbar) {
        toolbar.innerHTML = '';
    }

    if (galleryGrid) {
        galleryGrid.innerHTML = '';
        galleryGrid.classList.remove('is-ready');
    }

    if (!folderContainer) return;

    folderContainer.classList.add('is-active');
    folderContainer.innerHTML = galleryFolders.map((folder) => `
        <button class="gallery-folder-card" type="button" data-folder-id="${folder.id}">
            <img src="${folder.coverImage}" alt="${folder.name}" loading="eager" decoding="async">
            <div class="gallery-folder-info">
                <h3>${folder.name}</h3>
                <span>${folder.items.length} image${folder.items.length > 1 ? 's' : ''}</span>
            </div>
        </button>
    `).join('');

    folderContainer.querySelectorAll('.gallery-folder-card').forEach((card) => {
        card.addEventListener('click', () => {
            const folderId = card.getAttribute('data-folder-id');
            const selectedFolder = galleryFolders.find((folder) => folder.id === folderId);
            if (!selectedFolder) return;
            renderFolderItems(selectedFolder);
        });
    });
}

function renderFolderItems(folder) {
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');
    const gallerySection = document.querySelector('.gallery');
    const folderContainer = document.querySelector('.gallery-folder');

    if (!galleryGrid || !toolbar) return;

    if (gallerySection) {
        gallerySection.classList.remove('is-hidden');
    }

    if (folderContainer) {
        folderContainer.classList.remove('is-active');
    }

    toolbar.innerHTML = `
        <button type="button" class="gallery-back">← Retour</button>
        <span class="gallery-current-folder">${folder.name}</span>
    `;

    const backButton = toolbar.querySelector('.gallery-back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            renderFoldersView();
        });
    }

    galleryGrid.innerHTML = folder.items.map((item) => `
        <div class="gallery-item">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
            <div class="gallery-overlay">
                <h3>${item.folder}</h3>
                <span>${item.year}</span>
            </div>
        </div>
    `).join('');

    requestAnimationFrame(() => {
        galleryGrid.classList.add('is-ready');
    });

    initializeGalleryLightbox();
}

function initializeGalleryCategories() {
    const buttons = document.querySelectorAll('.gallery-categories li');

    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');

            if (button.id === 'events') {
                renderFoldersView();
            } else {
                renderGalleryGrid(galleryData);
            }
        });
    });
}

async function initializeGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    initializeGalleryCategories();
    renderGalleryGrid(galleryData);
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

async function initializeSite() {
    initializeHeroThumbnails();
    initializeSlides();
    initializeEventListeners();
    initializeMobileMenu();
    initializeNavbarScroll();
    initializeHeroSlider();
    await initializeGallery();
    initializeGalleryLightbox();
    initializeContactForm();
    animate();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initializeSite();
    });
} else {
    initializeSite();
}