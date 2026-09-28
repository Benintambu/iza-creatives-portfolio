const CLOUD_NAME = "dgfskm9bz";
const UPLOAD_PRESET = "iza-gallery";

async function optimizeImageForUpload(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
            bitmap.close();
            return file;
        }

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const optimizedBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/webp', 0.88);
        });

        if (!optimizedBlob || optimizedBlob.size >= file.size) return file;

        const optimizedName = file.name.replace(/\.[^.]+$/, '') + '.webp';
        return new File([optimizedBlob], optimizedName, {
            type: 'image/webp',
            lastModified: Date.now()
        });
    } catch (error) {
        console.warn('Optimisation WebP indisponible, envoi de l’image originale.', error);
        return file;
    }
}

export async function uploadToCloudinary(file) {
    const optimizedFile = await optimizeImageForUpload(file);

    const formData = new FormData();

    formData.append("file", optimizedFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();


    return data;
}