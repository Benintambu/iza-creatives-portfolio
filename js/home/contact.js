export function initializeContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        emailjs.sendForm(
            'SERVICE_ID',
            'TEMPLATE_ID',
            form
        )
            .then(() => {
                alert('Message envoyé avec succès !');
                form.reset();
            })
            .catch((error) => {
                console.error(error);
                alert('Une erreur est survenue.');
            });
    });
}
