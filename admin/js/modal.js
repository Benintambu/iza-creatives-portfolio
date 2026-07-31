/* Fonction pour ouvrir et fermer un modal */
export function setupModal(
    openButtonSelector,
    modalSelector,
    closeButtonSelector
) {

    const openButton = document.querySelector(openButtonSelector);
    const modal = document.querySelector(modalSelector);
    const closeButton = document.querySelector(closeButtonSelector);

    if (!openButton || !modal || !closeButton) return;

    openButton.addEventListener("click", () => {
        modal.classList.add("visible");
    });

    closeButton.addEventListener("click", () => {
        modal.classList.remove("visible");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("visible");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("visible")) {
            modal.classList.remove("visible");
        }
    });

}