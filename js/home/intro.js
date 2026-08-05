export function initializeIntro() {
    const intro = document.querySelector('.intro');
    if (!intro) return;

    if (sessionStorage.getItem('introPlayed')) {
        intro.remove();
        animateHeroEntrance();
        return;
    }

    sessionStorage.setItem('introPlayed', 'true');

    const tl = gsap.timeline();

    tl.from('.intro-logo', {
        scale: .8,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    })
        .from('.intro-content h2', {
            y: 40,
            opacity: 0,
            duration: 1
        }, '-=.6')
        .from('.intro-content p', {
            y: 20,
            opacity: 0,
            duration: 1
        }, '-=.8')
        .to('.intro', {
            yPercent: -100,
            duration: 1.3,
            ease: 'expo.inOut',
            delay: .5
        })
        .call(() => {
            intro.remove();
            animateHeroEntrance();
        });
}

export function animateHeroEntrance() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    gsap.from(hero, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power3.out'
    });
}
