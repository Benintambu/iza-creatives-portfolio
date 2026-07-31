import { supabase } from "./supabase.js";
import { galleryData } from "./gallery-data.js";

async function seedPhotos() {

    // 1. Récupérer les catégories
    const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("*");

    if (catError) {
        console.error(catError);
        return;
    }

    // 2. Construire un dictionnaire nom -> id
    const categoryMap = {};

    categories.forEach(category => {
        categoryMap[category.name] = category.id;
    });

    // 3. Préparer les photos
    const photos = galleryData.map(photo => ({
        image_url: photo.src,
        alt: photo.alt,
        year: photo.year,
        category_id: categoryMap[photo.folder]
    }));

    const { data, error } = await supabase
        .from("photos")
        .insert(photos)
        .select();

    console.log("Photos importées :", data);
    console.log("Erreur :", error);
}

seedPhotos();