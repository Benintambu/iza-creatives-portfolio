import { supabase } from "../../js/supabase.js";

let allCategories = [];
let categoryToDeleteId = null;

function getCategoryPhotoCount(category) {
    return Number(category?.photos?.[0]?.count ?? 0);
}

export async function getCategories() {

    const { data, error } = await supabase
        .from("categories")
        .select(`
            *,
            photos(count)
        `)
        .order("name");

    if (error) {
        console.error(error);
        return [];
    }

    return data;

}

export async function loadCategoriesSelect() {

    const select = document.getElementById("category");

    const trigger = document.getElementById("categoryTrigger");

    const dropdown = document.getElementById("categoryDropdown");

    if (!select) return;

    const categories = await getCategories();

    select.innerHTML = "";

    dropdown.innerHTML = "";

    categories.forEach(category => {

        // vrai select

        const option = document.createElement("option");

        option.value = category.id;

        option.textContent = category.name;

        select.appendChild(option);

        // faux menu

        const div = document.createElement("div");

        div.className = "select-option";

        div.textContent = category.name;

        div.dataset.id = category.id;

        dropdown.appendChild(div);

    });

    dropdown.querySelectorAll(".select-option").forEach(option => {

        option.addEventListener("click", () => {

            select.value = option.dataset.id;

            trigger.querySelector("span").textContent =
                option.textContent;

            dropdown.classList.remove("visible");

            trigger.classList.remove("open");

        });

    });

}

export async function loadCategoriesList() {

    allCategories = await getCategories();

    document.getElementById("total-categories").textContent =
        allCategories.length;

    renderCategories(allCategories);

}

function renderCategories(categories) {

    const container = document.getElementById("categoriesList");

    container.innerHTML = "";

    categories.forEach(category => {

        container.innerHTML += `
            <div class="category-content">
                <div class="category-left">
                    <div class="category-ico">
                        <i class="bx bx-folder"></i>
                    </div>

                    <div class="category-text">
                        <h6 class="category-name">${category.name}</h6>
                        <p class="total-photo">
                            ${category.photos[0].count} photo${category.photos[0].count > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div class="category-right">
                    <i
                        class="bx bx-pencil edit-category"
                        data-id="${category.id}"
                        data-name="${category.name}">
                    </i>

                    <i
                        class="bx bx-trash delete-category"
                        data-id="${category.id}">
                    </i>
                </div>
            </div>
        `;

    });

    attachCategoryEvents();

}

function attachCategoryEvents() {

    document.querySelectorAll(".edit-category").forEach(button => {

        button.addEventListener("click", () => {

            document.getElementById("edit-category-id").value = button.dataset.id;
            document.getElementById("new-category-name").value = button.dataset.name;

            document
                .getElementById("edit-category-modal")
                .classList.add("visible");

        });

    });

    document.querySelectorAll(".delete-category").forEach(button => {

        button.addEventListener("click", () => {

            const categoryId = button.dataset.id;
            const category = allCategories.find(item => item.id === categoryId);

            categoryToDeleteId = categoryId;

            if (!category || getCategoryPhotoCount(category) > 0) {
                document.getElementById("warning-delete-category")?.classList.add("visible");
                return;
            }

            document.getElementById("delete-category")?.classList.add("visible");

        });

    });

}

export function initCategorySearch() {

    const input = document.getElementById("categoryName");

    if (!input) return;

    input.addEventListener("input", () => {

        const search = input.value.trim().toLowerCase();

        const filtered = allCategories.filter(category =>
            category.name.toLowerCase().includes(search)
        );

        renderCategories(filtered);

    });

}

export async function createCategory(name) {

    const { error } = await supabase
        .from("categories")
        .insert({
            name
        });

    if (error) {

        alert(error.message);
        return false;

    }

    return true;

}

export async function updateCategory(id, name) {


    const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", id)
        .select();


    if (error) {
        alert(error.message);
        return false;
    }

    return true;
}

export async function deleteCategory(id) {

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return false;
    }

    return true;
}

export function initCategoryDeletion() {
    const deleteModal = document.getElementById("delete-category");
    const warningModal = document.getElementById("warning-delete-category");
    const cancelDeleteButton = document.getElementById("cancel-delete-category");
    const confirmDeleteButton = document.getElementById("confirm-delete-category");
    const closeWarningButton = document.getElementById("close-warning-delete-category");

    if (!deleteModal || !warningModal) return;

    const closeDeleteModal = () => {
        deleteModal.classList.remove("visible");
        categoryToDeleteId = null;
    };

    const closeWarningModal = () => {
        warningModal.classList.remove("visible");
    };

    cancelDeleteButton?.addEventListener("click", closeDeleteModal);
    closeWarningButton?.addEventListener("click", closeWarningModal);

    [deleteModal, warningModal].forEach(modal => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                if (modal === deleteModal) {
                    closeDeleteModal();
                } else {
                    closeWarningModal();
                }
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (deleteModal.classList.contains("visible")) {
                closeDeleteModal();
            }

            if (warningModal.classList.contains("visible")) {
                closeWarningModal();
            }
        }
    });

    confirmDeleteButton?.addEventListener("click", async () => {
        if (!categoryToDeleteId) return;

        const ok = await deleteCategory(categoryToDeleteId);

        if (!ok) return;

        closeDeleteModal();
        await loadCategoriesList();
        await loadCategoriesSelect();
    });
}

export async function loadGalleryFilters() {

    const dropdown = document.getElementById("galleryFilters");

    if (!dropdown) return;

    const categories = await getCategories();

    dropdown.innerHTML = "";

    // Option "Toutes les catégories"
    const allOption = document.createElement("div");

    allOption.className = "select-option active";
    allOption.dataset.id = "";
    allOption.textContent = "Toutes les catégories";

    dropdown.appendChild(allOption);


    // Catégories
    categories.forEach(category => {

        const option = document.createElement("div");

        option.className = "select-option";
        option.dataset.id = category.id;
        option.textContent = category.name;

        dropdown.appendChild(option);

    });

}

export async function loadEditCategoriesSelect() {

    const select =
        document.getElementById("editCategory");

    const trigger =
        document.getElementById("editCategoryTrigger");

    const dropdown =
        document.getElementById("editCategoryDropdown");

    if (!select || !trigger || !dropdown) return;


    const categories = await getCategories();


    select.innerHTML = "";
    dropdown.innerHTML = "";


    categories.forEach(category => {

        // vrai select
        const option =
            document.createElement("option");

        option.value = category.id;
        option.textContent = category.name;

        select.appendChild(option);


        // faux dropdown
        const div =
            document.createElement("div");

        div.className = "select-option";

        div.textContent = category.name;

        div.dataset.id = category.id;

        dropdown.appendChild(div);

    });


    // Ouverture / fermeture
    trigger.addEventListener("click", (e) => {

        e.stopPropagation();

        dropdown.classList.toggle("visible");

        trigger.classList.toggle("open");

    });


    // Sélection
    dropdown.addEventListener("click", (e) => {

        const option =
            e.target.closest(".select-option");

        if (!option) return;


        select.value = option.dataset.id;

        const span =
            trigger.querySelector("span");

        if (span) {
            span.textContent = option.textContent;
        }


        dropdown.classList.remove("visible");
        trigger.classList.remove("open");

    });

}