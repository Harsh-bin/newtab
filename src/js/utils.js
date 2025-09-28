// --- Utility & Helper Functions ---

/**
 * A collection of general-purpose utility functions.
 */
const Utils = {
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    },

    isUrl(str) {
        if (!str) return false;
        const trimmedStr = str.trim();
        const hasProtocol = /^(https?|ftp):\/\//i.test(trimmedStr);
        const isLocalOrIp = /^(localhost|127\.0\.0\.1|\[::1\]|(\d{1,3}\.){3}\d{1,3})/i.test(trimmedStr);
        const hasDot = trimmedStr.includes(".") && !trimmedStr.includes(" ");
        return hasProtocol || isLocalOrIp || hasDot;
    },
};

/**
 * Manages debounced state saving to localStorage.
 */
const DebouncedSave = {
    save: Utils.debounce(() => App.saveState(), 1000),
    immediateSave() {
        App.saveState();
    },
};

/**
 * Handles caching of favicons in memory and localStorage to reduce network requests.
 */
const FaviconCache = {
    cache: new Map(),
    maxSize: 100,

    get(domain) {
        return this.cache.get(domain);
    },

    set(domain, url) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(domain, url);
    },

    loadFromStorage() {
        try {
            const cached = localStorage.getItem("faviconCache");
            if (cached) {
                const parsed = JSON.parse(cached);
                parsed.forEach(([domain, url]) => this.cache.set(domain, url));
            }
        } catch (e) {
            console.warn("Failed to load favicon cache:", e);
        }
    },

    saveToStorage() {
        try {
            const toSave = Array.from(this.cache.entries());
            localStorage.setItem("faviconCache", JSON.stringify(toSave));
        } catch (e) {
            console.warn("Failed to save favicon cache:", e);
        }
    },
};

/**
 * Creates a Sortable.js instance with common configuration.
 * @param {HTMLElement} gridElement - The element to make sortable.
 * @param {Function} onEndCallback - Callback function to execute after a drag operation ends.
 * @returns {Sortable} The Sortable instance.
 */
function createSortableGrid(gridElement, onEndCallback) {
    return Sortable.create(gridElement, {
        animation: 200,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        filter: ".add-site-card, .all-sites-card",
        onMove: (evt) => !evt.related.classList.contains("add-site-card") && !evt.related.classList.contains("all-sites-card"),
        onStart: () => {
            SiteManager.closeActionMenu();
            DOM.body.classList.add("drag-mode-sortable-active");
        },
        onEnd: () => {
            DOM.body.classList.remove("drag-mode-sortable-active");
            if (onEndCallback) onEndCallback();
        },
    });
}