/**
 * Gallery Management System
 * Vidya Chaitanya Samakhya
 * 
 * @file Main gallery functionality with modular architecture
 * @version 1.0.0
 */

'use strict';

/* ============================================
   CONFIGURATION & CONSTANTS
   ============================================ */

const CONFIG = {
    dataUrl: 'assets/data/gallery-data.json',
    animationDelay: 50,
    observerMargin: '50px',
    lightboxTransitionSpeed: 300,
    debounceDelay: 100
};

const CATEGORY_LABELS = {
    'all': 'All Photos',
    'nmms': 'NMMS',
    'ideal_persons_awards': "Ideal Persons' Awards",
    'talent_test': 'Talent Test',
    'act_science_center': 'ACT Science Center',
    'science_center_visit': 'Science Center Visit',
    'inauguration': 'Inauguration',
    'plantation': 'Plantation',
    'model_teachers_felicitation': 'Model Teachers Felicitation',
    'free_classes': 'Free Classes',
    'members': 'Members',
    'news_clippings': 'News Clippings',
    'summer_classes': 'Summer Classes',
    'gurajada_jayanthi': 'Gurajada Jayanthi',
    'covid_19_services': 'COVID-19 Services',
    'education_assistance': 'Education Assistance'
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message to user
 * @param {HTMLElement} container - Container to show error in
 * @param {string} message - Error message
 */
function showError(container, message) {
    container.innerHTML = `
    <div class="gallery-error">
      <div class="gallery-error__icon" aria-hidden="true">⚠️</div>
      <p class="gallery-error__message">${escapeHtml(message)}</p>
      <p class="gallery-error__detail">Please try refreshing the page.</p>
    </div>
  `;
}

/* ============================================
   IMAGE LOADER CLASS
   ============================================ */

/**
 * Handles image loading with lazy loading and progressive enhancement
 */
class ImageLoader {
    constructor() {
        this.observer = null;
        this.initObserver();
    }

    /**
     * Initialize Intersection Observer for lazy loading
     */
    initObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded');
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: CONFIG.observerMargin,
                threshold: 0.01 // Trigger as soon as 1% is visible
            }
        );
    }

    /**
     * Observe gallery items for lazy loading animation
     * @param {NodeList} items - Gallery items to observe
     */
    observe(items) {
        items.forEach((item, index) => {
            // Immediately show first visible items, animate rest
            if (index < 12) {
                // First 12 items (3 rows on desktop) show immediately
                setTimeout(() => {
                    item.classList.add('loaded');
                }, index * 30); // Stagger slightly for effect
            } else {
                this.observer.observe(item);
            }
        });
    }

    /**
     * Cleanup observer
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}



/* ============================================
   LIGHTBOX CONTROLLER CLASS
   ============================================ */

/**
 * Manages lightbox modal functionality
 */
class LightboxController {
    constructor(getFilteredImages) {
        this.getFilteredImages = getFilteredImages;
        this.currentIndex = 0;
        this.isOpen = false;

        this.elements = {
            lightbox: document.getElementById('lightbox'),
            image: document.getElementById('lightboxImage'),
            description: document.getElementById('lightboxDescription'),
            close: document.getElementById('lightboxClose'),
            prev: document.getElementById('lightboxPrev'),
            next: document.getElementById('lightboxNext')
        };

        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Close button
        this.elements.close?.addEventListener('click', () => this.close());

        // Navigation buttons
        this.elements.prev?.addEventListener('click', () => this.previous());
        this.elements.next?.addEventListener('click', () => this.next());

        // Click outside to close
        this.elements.lightbox?.addEventListener('click', (e) => {
            if (e.target === this.elements.lightbox) {
                this.close();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
                case 'ArrowLeft':
                    this.previous();
                    break;
            }
        });
    }

    /**
     * Open lightbox at specific index
     * @param {number} index - Image index to display
     */
    open(index) {
        this.currentIndex = index;
        this.update();
        this.elements.lightbox?.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        // Set focus to close button for accessibility
        setTimeout(() => {
            this.elements.close?.focus();
        }, CONFIG.lightboxTransitionSpeed);
    }

    /**
     * Close lightbox
     */
    close() {
        this.elements.lightbox?.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    /**
     * Update lightbox content
     */
    update() {
        const images = this.getFilteredImages();
        if (!images || images.length === 0) return;

        const image = images[this.currentIndex];
        if (!image) return;

        if (this.elements.image) {
            this.elements.image.src = image.path;
            this.elements.image.alt = image.alt || image.description;
        }

        if (this.elements.description) {
            this.elements.description.textContent = image.description;
        }
    }

    /**
     * Show next image
     */
    next() {
        const images = this.getFilteredImages();
        this.currentIndex = (this.currentIndex + 1) % images.length;
        this.update();
    }

    /**
     * Show previous image
     */
    previous() {
        const images = this.getFilteredImages();
        this.currentIndex = (this.currentIndex - 1 + images.length) % images.length;
        this.update();
    }
}

/* ============================================
   GALLERY MANAGER CLASS
   ============================================ */

/**
 * Main gallery manager - coordinates all functionality
 */
class GalleryManager {
    constructor() {
        this.allImages = [];
        this.imageLoader = new ImageLoader();

        this.elements = {
            container: document.getElementById('galleryContainer')
        };

        this.lightboxController = new LightboxController(() => this.allImages);
    }

    /**
     * Initialize gallery
     */
    async init() {
        try {
            await this.loadData();
            this.renderGallery();
        } catch (error) {
            console.error('Gallery initialization failed:', error);
            showError(this.elements.grid, 'Failed to load gallery');
        }
    }

    /**
     * Load gallery data from JSON
     */
    async loadData() {
        try {
            const response = await fetch(CONFIG.dataUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.allImages = data.images || [];

            if (this.allImages.length === 0) {
                throw new Error('No images found in data');
            }
        } catch (error) {
            console.error('Data loading error:', error);
            throw error;
        }
    }



    /**
     * Render gallery grid grouped by categories
     */
    renderGallery() {
        const container = document.getElementById('galleryContainer');
        if (!container) return;

        if (this.allImages.length === 0) {
            container.innerHTML = '<div class="gallery-error"><div class="gallery-error__icon">⚠️</div><p class="gallery-error__message">No images found</p></div>';
            return;
        }

        container.innerHTML = '';

        // Group images by category
        const imagesByCategory = {};
        this.allImages.forEach((image, index) => {
            const category = image.category || 'other';
            if (!imagesByCategory[category]) {
                imagesByCategory[category] = [];
            }
            imagesByCategory[category].push({ ...image, originalIndex: index });
        });

        // Sort categories by label
        const sortedCategories = Object.keys(imagesByCategory).sort((a, b) => {
            const labelA = CATEGORY_LABELS[a] || a;
            const labelB = CATEGORY_LABELS[b] || b;
            return labelA.localeCompare(labelB);
        });

        // Render each category section
        sortedCategories.forEach((category, categoryIndex) => {
            const images = imagesByCategory[category];
            const categoryLabel = CATEGORY_LABELS[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const section = document.createElement('div');
            section.className = 'gallery-category-section';
            
            section.innerHTML = `
                <div class="gallery-category-header">
                    <h2 class="gallery-category-title">
                        <span>${escapeHtml(categoryLabel)}</span>
                        <span class="gallery-category-count">${images.length}</span>
                    </h2>
                </div>
                <div class="gallery-grid" data-category="${category}"></div>
            `;

            const grid = section.querySelector('.gallery-grid');
            
            // Create gallery items for this category
            images.forEach((imageData) => {
                const item = this.createGalleryItem(imageData, imageData.originalIndex);
                grid.appendChild(item);
            });

            container.appendChild(section);
        });

        // Initialize lazy loading for all items
        const items = container.querySelectorAll('.gallery-item');
        this.imageLoader.observe(items);
    }

    /**
     * Create a gallery item element
     * @param {Object} image - Image data
     * @param {number} index - Image index
     * @returns {HTMLElement} Gallery item element
     */
    createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', image.category);
        item.setAttribute('data-index', index);

        const delay = (index % 4) * CONFIG.animationDelay;

        item.innerHTML = `
      <div class="gallery-item" 
           role="button"
           tabindex="0"
           aria-label="View ${escapeHtml(image.description)}"
           style="opacity: 1 !important;">
        <div class="image-skeleton"></div>
        <img 
          src="${escapeHtml(image.path)}" 
          alt="${escapeHtml(image.alt || image.description)}"
          loading="lazy"
          decoding="async"
          style="opacity: 0; transition: opacity 0.3s ease;"
        >
        <div class="gallery-item-overlay"></div>
        <div class="gallery-item-caption">${escapeHtml(image.description)}</div>
      </div>
    `;

        // Image load handlers
        const img = item.querySelector('img');
        const skeleton = item.querySelector('.image-skeleton');

        img.addEventListener('load', () => {
            if (skeleton) skeleton.style.display = 'none';
            img.style.opacity = '1';
        });

        img.addEventListener('error', () => {
            if (skeleton) skeleton.style.display = 'none';
            img.style.opacity = '1';
            img.alt = 'Image failed to load';
        });

        // Fallback: if image is already loaded (cached), show it immediately
        if (img.complete && img.naturalHeight !== 0) {
            if (skeleton) skeleton.style.display = 'none';
            img.style.opacity = '1';
        }

        // Click handler
        item.addEventListener('click', () => {
            this.lightboxController.open(index);
        });

        // Keyboard handler for accessibility
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.lightboxController.open(index);
            }
        });

        return item;
    }

    /**
     * Cleanup and destroy gallery
     */
    destroy() {
        this.imageLoader.destroy();
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}

/**
 * Initialize gallery application
 */
function initGallery() {
    try {
        const gallery = new GalleryManager();
        gallery.init();

        // Make gallery globally accessible for debugging
        window.galleryManager = gallery;
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
    }
}
