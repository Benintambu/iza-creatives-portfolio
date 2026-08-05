const heroImages = [
    "https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783804780/1_nf4qyi.webp",
    "https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783804780/2_ddupan.webp",
    "https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783804780/3_xjqagb.webp",
    "https://res.cloudinary.com/dgfskm9bz/image/upload/f_auto,q_auto/v1783804785/4_koxchn.webp"
];

export function setHeroBackground(imageUrl, activeThumb) {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    heroBg.style.backgroundImage = `url("${imageUrl}")`;

    document.querySelectorAll('.thumb-item, .thumb-mobile-item').forEach((thumb) => {
        const thumbImage = thumb.dataset.image;
        if (thumbImage) {
            thumb.style.backgroundImage = `url("${thumbImage}")`;
        }

        const isDesktopThumb = thumb.classList.contains('thumb-item');
        thumb.classList.toggle('thumb-active', isDesktopThumb && thumb === activeThumb);
        thumb.classList.toggle('thumb-mobile-active', !isDesktopThumb && thumb === activeThumb);
    });
}

export function initializeHeroThumbnails() {
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

export function initializeHeroSlider() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    const desktopThumbs = document.querySelectorAll('.thumb-item');
    const mobileThumbs = document.querySelectorAll('.thumb-mobile-item');

    let currentIndex = 0;

    function updateActiveSlide(index) {
        desktopThumbs.forEach(thumb => thumb.classList.remove('thumb-active'));
        mobileThumbs.forEach(thumb => thumb.classList.remove('thumb-mobile-active'));

        desktopThumbs[index]?.classList.add('thumb-active');
        mobileThumbs[index]?.classList.add('thumb-mobile-active');

        gsap.to(heroBg, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                heroBg.style.backgroundImage = `url("${heroImages[index]}")`;
                gsap.to(heroBg, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });
    }

    updateActiveSlide(0);

    setInterval(() => {
        currentIndex = (currentIndex + 1) % heroImages.length;
        updateActiveSlide(currentIndex);
    }, 5000);
}
