// SECTION STORY (scroll horizontal)
//
const contents = gsap.utils.toArray(".story .story-container");

gsap.to(contents, {
    xPercent: -100 * (contents.length - 1),
    ease: "none",
    scrollTrigger: {
        trigger: ".story",
        pin: true,
        scrub: 1,
        end: () =>
            "+=" +
            window.innerWidth * (contents.length - 1)
    }
});

//
// SECTION SERVICES (image qui suit le curseur)
//
const serviceItems = document.querySelectorAll(".home-services-item");

serviceItems.forEach((item) => {

    const image = item.querySelector(".service-image");

    if (!image) return;

    item.addEventListener("mouseenter", () => {
        image.style.opacity = "1";
        image.style.transform = "translate(-50%, -50%) scale(1)";
    });

    item.addEventListener("mouseleave", () => {
        image.style.opacity = "0";
        image.style.transform = "translate(-50%, -50%) scale(.8)";
    });

    item.addEventListener("mousemove", (e) => {

        const rect = item.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        image.style.left = `${x + 40}px`;
        image.style.top = `${y}px`;
    });

});