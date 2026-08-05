export function initializeMobileMenu() {
    const menuBtn = document.querySelector('.nav-btn');
    const navMenu = document.querySelector('nav ul');
    const closeBtn = document.querySelector('.close-menu');
    const menuFooter = document.querySelector('.nav-menu-footer');

    if (!menuBtn || !navMenu || !closeBtn) return;

    const tl = gsap.timeline({
        paused: true,
        defaults: {
            duration: 1,
            ease: 'expo.inOut'
        }
    });

    function buildTimeline() {
        if (window.innerWidth >= 1000) {
            tl.pause(0);
            gsap.set(navMenu, { clearProps: 'all' });
            gsap.set(navMenu.querySelectorAll('li a'), { clearProps: 'all' });
            gsap.set(closeBtn, { clearProps: 'all' });
            gsap.set(menuFooter, { clearProps: 'all' });
            return;
        }

        tl.clear();
        tl.to(navMenu, { right: 0 })
            .to(navMenu, { height: '100vh' }, '-=.1')
            .to(navMenu.querySelectorAll('li a'), {
                opacity: 1,
                pointerEvents: 'all',
                stagger: 0.15
            }, '-=.8')
            .to(closeBtn, {
                opacity: 1,
                pointerEvents: 'all'
            }, '-=.8')
            .to(menuFooter, {
                opacity: 1,
                pointerEvents: 'all',
                y: 0
            }, '-=.2');

        tl.pause(0);
    }

    buildTimeline();

    window.addEventListener('resize', buildTimeline);

    menuBtn.addEventListener('click', () => {
        if (window.innerWidth < 1000) {
            tl.play();
        }
    });

    closeBtn.addEventListener('click', () => {
        if (window.innerWidth < 1000) {
            tl.reverse();
        }
    });
}

export function initializeNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 50) {
            header.classList.remove('nav-hidden');
            header.classList.remove('nav-scrolled');
            lastScrollY = currentScrollY;
            return;
        }

        if (currentScrollY > lastScrollY) {
            header.classList.add('nav-hidden');
        } else {
            header.classList.remove('nav-hidden');
            header.classList.add('nav-scrolled');
        }

        lastScrollY = currentScrollY;
    });
}
