import { supabase } from '../supabase.js';

function buildGalleryFolders(galleryData) {
    return Array.from(
        galleryData.reduce((groups, item) => {
            const key = (item.folder || 'Autre')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-');

            if (!groups.has(key)) {
                groups.set(key, {
                    id: key,
                    name: item.folder,
                    coverImage: item.src,
                    items: []
                });
            }

            groups.get(key).items.push(item);
            return groups;
        }, new Map()).values()
    );
}

function renderGalleryGrid(items) {
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');

    if (!galleryGrid) return;

    const gallerySection = document.querySelector('.gallery');
    const folderContainer = document.querySelector('.gallery-folder');

    if (gallerySection) {
        gallerySection.classList.remove('is-hidden');
    }

    if (folderContainer) {
        folderContainer.classList.remove('is-active');
    }

    if (toolbar) {
        toolbar.innerHTML = '';
    }

    // On mobile, afficher les images les plus récentes en premier
    const displayItems = window.matchMedia && window.matchMedia('(max-width: 800px)').matches
        ? items.slice().reverse()
        : items;

    galleryGrid.innerHTML = displayItems.map((item) => `
        <div class="gallery-item">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
            <div class="gallery-overlay">
                <h3>${item.folder}</h3>
                <span>${item.year}</span>
            </div>
        </div>
    `).join('');

    requestAnimationFrame(() => {
        galleryGrid.classList.add('is-ready');
    });

    initializeGalleryLightbox();
}

function renderFoldersView(galleryFolders) {
    const folderContainer = document.querySelector('.gallery-folder');
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');
    const gallerySection = document.querySelector('.gallery');

    if (gallerySection) {
        gallerySection.classList.add('is-hidden');
    }

    if (toolbar) {
        toolbar.innerHTML = '';
    }

    if (galleryGrid) {
        galleryGrid.innerHTML = '';
        galleryGrid.classList.remove('is-ready');
    }

    if (!folderContainer) return;

    folderContainer.classList.add('is-active');
    folderContainer.innerHTML = galleryFolders.map((folder) => `
        <button class="gallery-folder-card" type="button" data-folder-id="${folder.id}">
            <img src="${folder.coverImage}" alt="${folder.name}" loading="eager" decoding="async">
            <div class="gallery-folder-info">
                <h3>${folder.name}</h3>
                <span>${folder.items.length} image${folder.items.length > 1 ? 's' : ''}</span>
            </div>
        </button>
    `).join('');

    folderContainer.querySelectorAll('.gallery-folder-card').forEach((card) => {
        card.addEventListener('click', () => {
            const folderId = card.getAttribute('data-folder-id');
            const selectedFolder = galleryFolders.find((folder) => folder.id === folderId);
            if (!selectedFolder) return;
            renderFolderItems(selectedFolder);
        });
    });
}

function renderFolderItems(folder) {
    const galleryGrid = document.querySelector('.gallery-grid');
    const toolbar = document.querySelector('.gallery-view-toolbar');
    const gallerySection = document.querySelector('.gallery');
    const folderContainer = document.querySelector('.gallery-folder');

    if (!galleryGrid || !toolbar) return;

    if (gallerySection) {
        gallerySection.classList.remove('is-hidden');
    }

    if (folderContainer) {
        folderContainer.classList.remove('is-active');
    }

    toolbar.innerHTML = `
        <button type="button" class="gallery-back">← Retour</button>
        <span class="gallery-current-folder">${folder.name}</span>
    `;

    const backButton = toolbar.querySelector('.gallery-back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            renderFoldersView();
        });
    }

    // For folder view also prefer newest-first on mobile
    const folderDisplayItems = window.matchMedia && window.matchMedia('(max-width: 800px)').matches
        ? folder.items.slice().reverse()
        : folder.items;

    galleryGrid.innerHTML = folderDisplayItems.map((item) => `
        <div class="gallery-item">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
            <div class="gallery-overlay">
                <h3>${item.folder}</h3>
                <span>${item.year}</span>
            </div>
        </div>
    `).join('');

    requestAnimationFrame(() => {
        galleryGrid.classList.add('is-ready');
    });

    initializeGalleryLightbox();
}

function initializeGalleryCategories(galleryData, galleryFolders) {
    const buttons = document.querySelectorAll('.gallery-categories li');

    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');

            if (button.id === 'events') {
                renderFoldersView(galleryFolders);
            } else {
                renderGalleryGrid(galleryData);
            }
        });
    });
}

async function fetchGalleryData() {
    const { data, error } = await supabase
        .from('photos')
        .select(`
            image_url,
            alt,
            year,
            categories(name)
        `)
        .order('created_at');

    if (error) {
        console.error(error);
        return [];
    }

    return data.map(photo => ({
        src: photo.image_url,
        alt: photo.alt,
        year: photo.year,
        folder: photo.categories.name
    }));
}

export function initializeGalleryLightbox() {
    const images = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!images.length || !lightbox || !lightboxImage || !closeBtn) return;

    images.forEach(image => {
        image.addEventListener('click', () => {
            const thumbnailImage = image.querySelector('img');
            if (!thumbnailImage) return;

            lightboxImage.src = thumbnailImage.src;
            lightboxImage.alt = thumbnailImage.alt || '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

export async function initializeGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    const galleryData = await fetchGalleryData();
    const galleryFolders = buildGalleryFolders(galleryData);

    initializeGalleryCategories(galleryData, galleryFolders);
    renderGalleryGrid(galleryData);
}
