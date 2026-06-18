gsap.registerPlugin(ScrollTrigger);

// Synchronize Lenis with ScrollTrigger for smooth horizontal scrolling
if (window.lenis) {
    window.lenis.on('scroll', ScrollTrigger.update);
}

gsap.ticker.lagSmoothing(0);

const contents = gsap.utils.toArray('.story .story-container')

gsap.to(contents, {
    xPercent: -100 * (contents.length - 1),
    scrollTrigger: {
        trigger: '.story',
/*             start: 'top 10%',
 */            pin: true,
        scrub: true,
    }
})