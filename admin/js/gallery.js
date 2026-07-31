import { supabase } from "../../js/supabase.js";
import {
    loadCategoriesSelect,
    loadCategoriesList,
    createCategory,
    updateCategory,
    initCategorySearch,
    getCategories,
    loadGalleryFilters,
    loadEditCategoriesSelect
} from "./categories.js";

import { uploadToCloudinary } from "./cloudinary.js";

import {
    createPhoto,
    loadPhotos,
    deletePhoto,
    updatePhoto,
    openEditModal,
    closeEditModal,
    renderPhotos
} from "./photos.js";

import { setupModal } from "./modal.js";


let photos = await loadPhotos();
let photoToDelete = null;

/* RECHERCHE PHOTO */

const photoSearch = document.getElementById("photoSearch");

if (photoSearch) {

    photoSearch.addEventListener("input", () => {

        const search = photoSearch.value
            .trim()
            .toLowerCase();

        // Si la recherche est vide,
        // on affiche toutes les photos
        if (!search) {

            renderPhotos(photos);

            return;
        }

        // Recherche dans le alt
        const filteredPhotos = photos.filter(photo => {

            const alt = photo.alt?.toLowerCase() || "";

            return alt.includes(search);

        });

        renderPhotos(filteredPhotos);

    });

}



/* Création photo */
const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file = document.getElementById("input-photo")?.files?.[0];
    const alt = document.getElementById("alt")?.value ?? "";
    const year = document.getElementById("year")?.value ?? "";
    const category_id = document.getElementById("category")?.value ?? "";

    if (!file) return;

    const upload = await uploadToCloudinary(file);

    const ok = await createPhoto({
        image_url: upload.secure_url,
        public_id: upload.public_id,
        alt,
        year,
        category_id
    });

    if (ok) {
        alert("Photo ajoutée !");
        uploadForm.reset();
        photos = await loadPhotos();
    }

});

// Appel de la fonction pour ouvrir modal de crétaion d'une catégorie
setupModal(
    ".new-photo",
    "#add-photo-container",
    ".cancel-add-photo"
);

/* LOGIQUE POUR OUVRIR FERMER CATEGORIS */
const trigger = document.getElementById("categoryTrigger");

const dropdown = document.getElementById("categoryDropdown");

trigger.addEventListener("click", () => {
    if (dropdown) {
        dropdown.classList.toggle("visible");
    }

    trigger.classList.toggle("open");

});

document.addEventListener("click", (e) => {

    if (!e.target.closest(".custom-select")) {

        dropdown.classList.remove("visible");

        trigger.classList.remove("open");

    }

});

/* --------- */

const filterTrigger = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("galleryFilters");


if (filterTrigger && filterDropdown) {

    // Ouvrir / fermer
    filterTrigger.addEventListener("click", (e) => {

        e.stopPropagation();

        filterDropdown.classList.toggle("visible");
        filterTrigger.classList.toggle("open");

    });


    // Sélection d'une catégorie
    filterDropdown.addEventListener("click", (e) => {

        const option = e.target.closest(".select-option");

        if (!option) return;


        // Retirer active de toutes les options
        filterDropdown
            .querySelectorAll(".select-option")
            .forEach(item => {
                item.classList.remove("active");
            });


        // Activer l'option choisie
        option.classList.add("active");


        // Modifier le texte du bouton
        const currentFilter =
            document.getElementById("currentFilter");

        if (currentFilter) {
            currentFilter.textContent = option.textContent;
        }


        // Fermer le dropdown
        filterDropdown.classList.remove("visible");
        filterTrigger.classList.remove("open");


        // Récupérer l'ID de catégorie
        const categoryId = option.dataset.id;


        // Filtrer les photos
        filterPhotos(categoryId);

    });

}


// Fermer en cliquant à l'extérieur
document.addEventListener("click", (e) => {

    if (!e.target.closest(".gallery-filter-dropdown")) {

        filterDropdown?.classList.remove("visible");
        filterTrigger?.classList.remove("open");

    }

});

const photosGrid = document.getElementById("photosGrid");

/* Suppression photo */
const deleteModal = document.getElementById("delete-photo");
const cancelDeleteBtn = document.getElementById("cancel-delete-photo");
const confirmDeleteBtn = document.getElementById("confirm-delete-photo");


if (photosGrid) {

    photosGrid.addEventListener("click", (e) => {

        const editButton = e.target.closest(".edit-photo");
        const deleteButton = e.target.closest(".delete-photo");


        /* MODIFICATION */

        if (editButton) {

            const photo = photos.find(
                p => String(p.id) === String(editButton.dataset.id)
            );

            if (photo) {
                openEditModal(photo);
            }

            return;
        }


        /* SUPPRESSION */

        if (deleteButton) {

            photoToDelete = deleteButton.dataset.id;

            console.log("Photo à supprimer :", photoToDelete);

            if (deleteModal) {
                deleteModal.classList.add("visible");
            }

        }

    });

}

/* Annuler suppression */
if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener("click", () => {

        photoToDelete = null;

        deleteModal.classList.remove("visible");

    });

}

/* Appel suprression */
if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener("click", async () => {

        if (!photoToDelete) return;

        confirmDeleteBtn.disabled = true;

        const ok = await deletePhoto(photoToDelete);

        confirmDeleteBtn.disabled = false;

        if (ok) {

            deleteModal.classList.remove("visible");

            photoToDelete = null;

            photos = await loadPhotos();

        }

    });

}

if (deleteModal) {

    deleteModal.addEventListener("click", (e) => {

        if (e.target === deleteModal) {

            photoToDelete = null;

            deleteModal.classList.remove("visible");

        }

    });

}

document.addEventListener("keydown", (e) => {

    if (
        e.key === "Escape" &&
        deleteModal?.classList.contains("visible")
    ) {

        photoToDelete = null;

        deleteModal.classList.remove("visible");

    }

});

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

/* Recherche photo */
let currentCategoryId = "";
let currentSearch = "";

function applyPhotoFilters() {

    let filteredPhotos = [...photos];

    // Filtre catégorie
    if (currentCategoryId) {

        filteredPhotos = filteredPhotos.filter(photo =>
            String(photo.category_id) === String(currentCategoryId)
        );

    }

    // Filtre recherche
    if (currentSearch) {

        filteredPhotos = filteredPhotos.filter(photo => {

            const alt = photo.alt?.toLowerCase() || "";

            return alt.includes(currentSearch);

        });

    }

    renderPhotos(filteredPhotos);

}


function filterPhotos(categoryId) {

    currentCategoryId = categoryId;

    applyPhotoFilters();

}

if (photoSearch) {

    photoSearch.addEventListener("input", () => {

        currentSearch = photoSearch.value
            .trim()
            .toLowerCase();

        applyPhotoFilters();

    });

}

/* Modifiaction des catégories */
const editPhotoForm =
    document.getElementById("editPhotoForm");

if (editPhotoForm) {

    editPhotoForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const id =
            document.getElementById("editId")?.value;

        const alt =
            document.getElementById("editAlt")?.value.trim();

        const year =
            document.getElementById("editYear")?.value;

        const category_id =
            document.getElementById("editCategory")?.value;

        const file =
            document.getElementById("editImage")?.files?.[0];


        if (!id) return;


        const updateData = {

            alt,

            year,

            category_id

        };


        // Si une nouvelle image a été choisie
        if (file) {

            const upload =
                await uploadToCloudinary(file);


            if (!upload) {
                return;
            }


            updateData.image_url =
                upload.secure_url;

            updateData.public_id =
                upload.public_id;

        }


        const ok =
            await updatePhoto(id, updateData);


        if (!ok) return;


        // Fermer le modal
        closeEditModal();


        // Recharger les photos
        photos = await loadPhotos();

    });

}

const cancelEditPhoto =
    document.getElementById("cancel-edit-photo");

if (cancelEditPhoto) {

    cancelEditPhoto.addEventListener("click", () => {

        closeEditModal();

    });

}

const editImage =
    document.getElementById("editImage");

const editPhotoLabel =
    document.getElementById("editPhotoLabel");


if (editImage && editPhotoLabel) {

    editImage.addEventListener("change", () => {

        const file =
            editImage.files?.[0];

        if (!file) return;


        const reader =
            new FileReader();


        reader.onload = (e) => {

            editPhotoLabel.innerHTML = `
                <img
                    src="${e.target.result}"
                    alt="Nouvelle image"
                    class="photo-preview"
                >
            `;

        };


        reader.readAsDataURL(file);

    });

}



async function initialize() {
    await loadCategoriesSelect()
    await loadGalleryFilters();
    loadEditCategoriesSelect();
}

initialize();