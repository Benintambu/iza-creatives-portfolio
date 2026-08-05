const config = {
    SCROLL_SPEED: 1.75,
    LERP_FACTOR: 0.05,
    MAX_VELOCITY: 150,
};

const sliderData = [
    { title: "Image 1", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883286/1_p0dzpe.webp', url: './about.html' },
    { title: "Image 2", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883283/2_jiadqp.webp', url: './about.html' },
    { title: "Image 3", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883290/3_ogvemc.webp', url: './about.html' },
    { title: "Image 4", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883284/4_gfxz9u.webp', url: './about.html' },
    { title: "Image 5", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883287/5_puvgqm.webp', url: './about.html' },
    { title: "Image 6", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883286/6_czwmyw.webp', url: './about.html' },
    { title: "Image 7", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883288/7_n5goe0.webp', url: './about.html' },
    { title: "Image 8", img: 'https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783883289/8_f2b2qy.webp', url: './about.html' },
];

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
    slide.className = 'slide';

    if (state.isMobile) {
        slide.style.width = '175px';
        slide.style.height = '250px';
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = 'slide-image';

    const img = document.createElement('img');
    const dataIndex = index % totalSlideCount;
    img.src = sliderData[dataIndex].img;
    img.alt = sliderData[dataIndex].title;

    const overlay = document.createElement('div');
    overlay.className = 'slider-overlay';

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

    slide.addEventListener('click', () => {
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
            window.location.href = sliderData[dataIndex].url;
        }
    });

    overlay.append(title, arrow);
    imageContainer.appendChild(img);
    slide.append(imageContainer, overlay);

    return slide;
}

function resetAutoScrollTimer() {
    if (state.autoScrollTimeout) {
        clearTimeout(state.autoScrollTimeout);
    }

    state.autoScrollTimeout = setTimeout(() => {
        state.autoScrollActive = true;
    }, 2000);
}

function initializeSlides() {
    const track = document.querySelector('.slider-track');
    if (!track) return;

    track.innerHTML = '';
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

    resetAutoScrollTimer();
}

function updateSlidePosition() {
    const track = document.querySelector('.slider-track');
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
    const viewportCenter = window.innerWidth / 2;

    state.slides.forEach((slide) => {
        const img = slide.querySelector('img');
        if (!img) return;

        const slideRect = slide.getBoundingClientRect();

        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
            return;
        }

        const slideCenter = slideRect.left + slideRect.width / 2;
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;

        img.style.transform = `translateX(${parallaxOffset}px) scale(1.1)`;
    });
}

function updateMovingState() {
    state.velocity = Math.abs(state.currentX - state.lastCurrentX);
    state.lastCurrentX = state.currentX;

    const isSlowEnough = state.velocity < 0.1;
    const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;

    state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

    document.documentElement.style.setProperty('--slider-moving', state.isMoving ? '1' : '0');
}

function animate() {
    if (state.autoScrollActive && !state.isDragging) {
        state.targetX += state.autoScrollSpeed;
    }

    state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR;

    updateMovingState();
    updateSlidePosition();
    updateParallax();

    requestAnimationFrame(animate);
}

function handleWheel(e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
    }

    state.autoScrollActive = false;
    resetAutoScrollTimer();
    state.lastScrollTime = Date.now();

    const scrollDelta = e.deltaY * config.SCROLL_SPEED;
    state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY);
}

function handleTouchStart(e) {
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

    const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
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
        state.hasActuallyDragged = false;
    }, 100);
}

function handleResize() {
    initializeSlides();
}

export function initializeSlider() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    initializeSlides();

    slider.addEventListener('wheel', handleWheel, { passive: true });
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd);
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseUp);
    slider.addEventListener('dragstart', (e) => e.preventDefault());

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
}

export function startSliderAnimation() {
    requestAnimationFrame(animate);
}
