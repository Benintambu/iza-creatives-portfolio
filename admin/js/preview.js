/* Image preview  */

const inputPhoto = document.getElementById("input-photo");
const photoLabel = document.getElementById("photoLabel");

if (inputPhoto) {
    inputPhoto.addEventListener("change", () => {

        const file = inputPhoto.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {

            photoLabel.innerHTML = `
            <img
                src="${e.target.result}"
                alt="Prévisualisation"
                class="photo-preview"
            >
        `;

        };

        reader.readAsDataURL(file);

    });
}