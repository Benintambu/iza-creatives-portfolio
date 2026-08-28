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

const updateServiceImagePosition = (image, item, event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    image.style.left = `${x + 40}px`;
    image.style.top = `${y}px`;
};

serviceItems.forEach((item) => {
    const image = item.querySelector(".service-image");

    if (!image) return;

    item.addEventListener("mouseenter", (e) => {
        updateServiceImagePosition(image, item, e);
        image.style.opacity = "1";
        image.style.transform = "translate(-50%, -50%) scale(1)";
    });

    item.addEventListener("mouseleave", () => {
        image.style.opacity = "0";
        image.style.transform = "translate(-50%, -50%) scale(.8)";
    });

    item.addEventListener("mousemove", (e) => {
        updateServiceImagePosition(image, item, e);
    });
});

// HERO: split words into spans to animate with clip-path
function splitWords(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;

            const frag = document.createDocumentFragment();
            const parts = text.split(/(\s+)/);
            parts.forEach((part) => {
                if (part.match(/\s+/)) {
                    const span = document.createElement('span');
                    span.className = 'word space';
                    span.textContent = part;
                    frag.appendChild(span);
                } else {
                    const span = document.createElement('span');
                    span.className = 'word';
                    span.textContent = part;
                    frag.appendChild(span);
                    // add a thin space after word to preserve spacing visually when not using space spans
                    const after = document.createTextNode(' ');
                    frag.appendChild(after);
                }
            });

            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(walk);
        }
    };

    walk(container);
}

// wrap the whole element content into a single block for instant reveal
function wrapBlock(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    // if already wrapped, skip
    if (el.querySelector('.word-block')) return;

    const span = document.createElement('span');
    span.className = 'word-block';
    // move child nodes into the span
    while (el.firstChild) {
        span.appendChild(el.firstChild);
    }
    el.appendChild(span);
}

function revealHeroWords() {
    const container = document.querySelector('.hero-text');
    if (!container) return;
    // add animation class after small timeout to allow initial layout
    requestAnimationFrame(() => {
        const words = container.querySelectorAll('.word');
        words.forEach((w, i) => {
            w.style.transitionDelay = `${i * 0.06}s`;
        });

        // trigger animation
        setTimeout(() => {
            container.classList.add('animate');

            // calculate when to reveal the paragraph: last word delay + transition duration
            const wordCount = words.length || 0;
            const stagger = 0.06; // seconds per word
            const transitionDuration = 0.62; // matches CSS transition
            const extraDelay = 0.12; // small gap before paragraph
            const totalSeconds = Math.max(0, (wordCount - 1) * stagger) + transitionDuration + extraDelay;

            setTimeout(() => {
                container.classList.add('paragraph-visible');
            }, totalSeconds * 1000);
        }, 80);
    });
}

// initialize
splitWords('.hero-text h1');
// reveal the h1 only after it's been wrapped
const heroContainer = document.querySelector('.hero-text');
if (heroContainer) heroContainer.classList.add('ready');
wrapBlock('.hero-text p');
revealHeroWords();

// Presentation: split into words and reveal progressively on scroll
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
        gsap.registerPlugin(ScrollTrigger);
    } catch (e) {
        // already registered
    }
}

// create scroll-linked word reveal for .presentation
const presEl = document.querySelector('.presentation');
if (presEl) {
    splitWords('.presentation');
    const presWords = presEl.querySelectorAll('.word');
    if (presWords.length) {
        gsap.set(presWords, { opacity: 0.3, y: 6 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: presEl,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: true
            }
        });

        tl.to(presWords, {
            opacity: 1,
            y: 0,
            stagger: 0.04,
            ease: 'none'
        });
    }
}