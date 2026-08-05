export function initializePageTransition() {
    const overlay = document.querySelector('.page-transition');

    if (!overlay) return;

    gsap.set(overlay, {
        yPercent: -100
    });

    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');

        if (
            !href ||
            href.startsWith('#') ||
            href.startsWith('mailto') ||
            link.target === '_blank'
        ) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();

            gsap.to(overlay, {
                yPercent: 0,
                duration: 1,
                ease: 'expo.inOut',
                onComplete() {
                    window.location.href = href;
                }
            });
        });
    });
}
