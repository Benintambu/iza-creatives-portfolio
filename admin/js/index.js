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


let photos = await loadPhotos();
initCategorySearch();


const closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeEditModal);
}

const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
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
}

const menu = document.getElementById("galleryFilters");
const button = document.getElementById("filterBtn");


if (button) {
    button.addEventListener("click", () => {

        menu.classList.toggle("visible");

    });
}

if (menu) {
    menu.addEventListener("click", e => {

        const option = e.target.closest(".filter-option");

        if (!option) return;

        document
            .querySelectorAll(".filter-option")
            .forEach(el => el.classList.remove("active"));

        option.classList.add("active");

        const currentFilter = document.getElementById("currentFilter");

        if (currentFilter) {
            currentFilter.textContent = option.textContent;
        }

        menu.classList.remove("visible");

        const categoryId = option.dataset.id;

        filterPhotos(categoryId);

    });
}

document.addEventListener("click", e => {

    if (!e.target.closest(".gallery-filter-dropdown")) {

        menu.classList.remove("visible");

    }

});



const categoryForm = document.getElementById("categoryForm");
if (categoryForm) {
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
}

const photosGrid = document.getElementById("photosGrid");
if (photosGrid) {
    photosGrid.addEventListener("click", async (e) => {
        const button = e.target;

        if (button.classList.contains("edit-photo")) {
            const photo = photos.find(
                p => String(p.id) === button.dataset.id
            );

            if (photo) {
                openEditModal(photo);
            }
        }

        if (button.classList.contains("delete-photo")) {
            if (!confirm("Supprimer cette photo ?")) return;

            const ok = await deletePhoto(button.dataset.id);
            if (ok) {
                photos = await loadPhotos();
            }
        }
    });
}

/* ----------- */
/* PAS ENCORE CODE */
const editForm = document.getElementById("editPhotoForm");
if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId")?.value ?? "";
        const alt = document.getElementById("editAlt")?.value ?? "";
        const year = document.getElementById("editYear")?.value ?? "";
        const category_id = document.getElementById("editCategory")?.value ?? "";
        const file = document.getElementById("editImage")?.files?.[0];

        let updateData = {
            alt,
            year,
            category_id
        };

        if (file) {
            const upload = await uploadToCloudinary(file);
            updateData.image_url = upload.secure_url;
            updateData.public_id = upload.public_id;
        }

        const ok = await updatePhoto(id, updateData);

        if (ok) {
            document.getElementById("editModal")?.classList.remove("active");
            photos = await loadPhotos();
        }
    });
}

/* ------ */
/* BUTTON DECONNEXION */

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await supabase.auth.signOut({ scope: "global" });
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }

        Object.keys(localStorage)
            .filter((key) => key.startsWith("sb-"))
            .forEach((key) => localStorage.removeItem(key));

        sessionStorage.clear();
        window.location.assign("/admin/login.html");
    });
}

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

if (editCategoryModal && cancelEditCategoryButton) {
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
}


const editCategoryForm = document.querySelector("#editCategoryForm");

if (editCategoryForm) {
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
}

/* LOGIQUE POUR OUVRIR FERMER CATEGORIS */
const trigger = document.getElementById("categoryTrigger");

const dropdown = document.getElementById("categoryDropdown");

if (trigger) {
    trigger.addEventListener("click", () => {
        if (dropdown) {
            dropdown.classList.toggle("visible");
        }

        trigger.classList.toggle("open");

    });
}

document.addEventListener("click", (e) => {

    if (!e.target.closest(".custom-select")) {

        dropdown.classList.remove("visible");

        trigger.classList.remove("open");

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


async function initialize() {
    await loadCategoriesSelect();
    await loadCategoriesList();
    await loadLastUploaded();
    await loadGalleryFilters();
    console.log(document.getElementById("galleryFilters").innerHTML);
}

initialize();