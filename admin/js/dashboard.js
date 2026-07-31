import { supabase } from "../../js/supabase.js";

import {
    loadCategoriesSelect,
    loadCategoriesList,
    createCategory,
    updateCategory,
    initCategorySearch,
    getCategories,
    loadGalleryFilters
} from "./categories.js";

import { uploadToCloudinary } from "./cloudinary.js";

import {
    createPhoto,
    loadPhotos,
    deletePhoto,
    updatePhoto,
    openEditModal,
    closeEditModal,
    loadLastUploaded
} from "./photos.js";

import { setupModal } from "./modal.js";


let photos = await loadPhotos();
initCategorySearch();

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


const categoryForm = document.getElementById("categoryForm");

categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = document.getElementById("add-category-name");
    if (!input) return;

    const ok = await createCategory(input.value);

    if (ok) {
        input.value = "";
        await loadCategoriesSelect();
        await loadCategoriesList();
    }
});


// Appel de la fonction pour ouvrir modal de crétaion d'une catégorie
setupModal(
    ".new-photo",
    "#add-photo-container",
    ".cancel-add-photo"
);

// Modal pour ajouter une photo
setupModal(
    ".new-category",
    "#add-category-modal",
    ".cancel-create"
);

// Fermer le modal de modification d'une catégorie avec le bouton Annuler,
// un clic sur l'arrière-plan ou la touche Échap.
const editCategoryModal = document.getElementById("edit-category-modal");
const cancelEditCategoryButton = document.querySelector(".cancel-edit-category");

const closeEditCategoryModal = () => {
    editCategoryModal.classList.remove("visible");
};

cancelEditCategoryButton.addEventListener("click", closeEditCategoryModal);

editCategoryModal.addEventListener("click", (event) => {
    if (event.target === editCategoryModal) {
        closeEditCategoryModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editCategoryModal.classList.contains("visible")) {
        closeEditCategoryModal();
    }
});


const editCategoryForm = document.querySelector("#editCategoryForm");


editCategoryForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = document.getElementById("edit-category-id").value;
    const name = document
        .getElementById("new-category-name")
        .value
        .trim();

    if (!name) return;

    const ok = await updateCategory(id, name);

    if (ok) {

        document
            .getElementById("edit-category-modal")
            .classList.remove("visible");

        await loadCategoriesList();
        await loadCategoriesSelect();

    }

});


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

async function initialize() {
    await loadCategoriesSelect();
    await loadLastUploaded();
    await loadCategoriesList();
}

initialize();