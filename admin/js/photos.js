
import { supabase } from "../../js/supabase.js";

export async function createPhoto(photo) {

    const { error } = await supabase
        .from("photos")
        .insert(photo);

    if (error) {
        console.error(error);
        alert(error.message);
        return false;
    }

    return true;
}

export async function getPhotos() {

    const { data, error } = await supabase
        .from("photos")
        .select(`
            *,
            categories(name)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

export async function loadPhotos() {

    const grid = document.getElementById("photosGrid");

    const photos = await getPhotos();

    // Afficher le nombre total de photos
    const totalPhoto = document.querySelector(".total-photo");

    if (totalPhoto) {
        totalPhoto.textContent = photos.length;
    }

    if (!grid) {
        return photos;
    }

    grid.innerHTML = "";

    photos.forEach(photo => {

        grid.innerHTML += `

            <div class="photo-card">

                <img
                    src="${photo.image_url}"
                    alt="${photo.alt}"
                >

                <div class="photo-overlay">

                    <div>

                        <h4>${photo.categories?.name ?? "Sans catégorie"}</h4>

                        <p class="photo-year">${photo.year ?? ""}</p>

                    </div>

                    <div class="photo-actions">

                        <div
                            class="photo-btn edit edit-photo"
                            data-id="${photo.id}"
                        >
                            <i class="bx bx-pencil"></i>
                        </div>

                        <div
                            class="photo-btn delete delete-photo"
                            data-id="${photo.id}"
                        >
                            <i class="bx bx-trash"></i>
                        </div>

                    </div>

                </div>

            </div>

        `;

    });

    return photos;
}

export async function deletePhoto(id) {

    // 1. Récupérer la photo
    const { data: photo, error: photoError } = await supabase
        .from("photos")
        .select("public_id")
        .eq("id", id)
        .single();

    if (photoError) {

        console.error(photoError);

        return false;
    }


    // 2. Supprimer l'image de Cloudinary
    const response = await supabase.functions.invoke("delete-image", {
        body: {
            public_id: photo.public_id
        }
    });


    if (response.error || response.data?.error) {

        console.error(
            "Erreur suppression Cloudinary :",
            response.error || response.data?.error
        );

        return false;
    }


    // 3. Supprimer la ligne dans Supabase
    const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        return false;
    }


    return true;
}

export async function updatePhoto(id, photo) {

    const { error } = await supabase
        .from("photos")
        .update(photo)
        .eq("id", id);

    if (error) {
        console.error(error);
        alert(error.message);
        return false;
    }

    return true;
}

export function openEditModal(photo) {

    const modal = document.getElementById("edit-photo-container");

    if (!modal) return;


    // ID
    const idInput = document.getElementById("editId");

    if (idInput) {
        idInput.value = photo.id;
    }


    // Texte alternatif
    const altInput = document.getElementById("editAlt");

    if (altInput) {
        altInput.value = photo.alt ?? "";
    }


    // Année
    const yearInput = document.getElementById("editYear");

    if (yearInput) {
        yearInput.value = photo.year ?? "";
    }


    // Catégorie
    const categorySelect =
        document.getElementById("editCategory");

    const categoryTrigger =
        document.getElementById("editCategoryTrigger");

    if (categorySelect) {

        categorySelect.value = photo.category_id ?? "";

    }

    if (categoryTrigger) {

        const categoryName =
            photo.categories?.name ?? "Sélectionner une catégorie";

        const span =
            categoryTrigger.querySelector("span");

        if (span) {
            span.textContent = categoryName;
        }

    }


    // Image actuelle
    const imageLabel =
        document.getElementById("editPhotoLabel");

    if (imageLabel && photo.image_url) {

        imageLabel.innerHTML = `
            <img
                src="${photo.image_url}"
                alt="${photo.alt ?? ""}"
                class="photo-preview"
            >
        `;

    }


    // Ouvrir le modal
    modal.classList.add("visible");

}

export function closeEditModal() {

    const modal =
        document.getElementById("edit-photo-container");

    if (!modal) return;

    modal.classList.remove("visible");

}

export async function loadLastUploaded() {

    const container = document.getElementById("last-uploaded");

    if (!container) return;

    const { data, error } = await supabase
        .from("photos")
        .select("image_url, alt")
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    container.innerHTML = "";

    data.forEach((photo, index) => {

        container.innerHTML += `
            <div class="last-img img--${index + 1}">
                <img
                    src="${photo.image_url}"
                    alt="${photo.alt}"
                    loading="lazy"
                >
            </div>
        `;

    });

}

export function renderPhotos(photos) {

    const container = document.getElementById("photosGrid");

    if (!container) return;

    container.innerHTML = "";

    if (!photos || photos.length === 0) {

        container.innerHTML = `
            <div class="gallery-empty section">
            <i class="bx bx-empty-set" ></i>
                <p>Cette catégorie ne contient aucune photo.</p>
            </div>
        `;

        return;
    }

    photos.forEach(photo => {

        container.innerHTML += `
            <article class="photo-card">

                <img
                    src="${photo.image_url}"
                    alt="${photo.alt || ""}"
                >

                <div class="photo-overlay">

                    <span class="photo-category">
                        ${photo.categories?.name || ""}
                    </span>

                    <span class="photo-year">
                        ${photo.year || ""}
                    </span>

                    <div class="photo-actions">

                        <button
                            class="photo-btn edit-photo"
                            data-id="${photo.id}"
                            type="button"
                        >
                            <i class="bx bx-pencil"></i>
                        </button>

                        <button
                            class="photo-btn delete-photo"
                            data-id="${photo.id}"
                            type="button"
                        >
                            <i class="bx bx-trash"></i>
                        </button>

                    </div>

                </div>

            </article>
        `;

    });

}