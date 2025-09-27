document.addEventListener('DOMContentLoaded', () => App.init());

/**
 * @param {HTMLImageElement} imgElement - The <img> element that failed to load.
 * @param {string} siteName - The name of the site for generating a placeholder.
 */
function handleFaviconError(imgElement, siteName) {
    const iconContainer = imgElement.parentNode;
    if (!iconContainer) return;
    const placeholderHtml = SiteManager._getFaviconPlaceholder(siteName);
    iconContainer.innerHTML = placeholderHtml;
}

const Utils = {
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments, context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    debounce(func, delay) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
};

const DebouncedSave = {
    save: Utils.debounce(() => App.saveState(), 1000),
    immediateSave() {
        App.saveState();
    }
};

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
            const cached = localStorage.getItem('faviconCache');
            if (cached) {
                const parsed = JSON.parse(cached);
                parsed.forEach(([domain, url]) => this.cache.set(domain, url));
            }
        } catch (e) {
            console.warn('Failed to load favicon cache:', e);
        }
    },
    
    saveToStorage() {
        try {
            const toSave = Array.from(this.cache.entries());
            localStorage.setItem('faviconCache', JSON.stringify(toSave));
        } catch (e) {
            console.warn('Failed to save favicon cache:', e);
        }
    }
};

const DOM = {
    body: document.body,
    mainContent: document.querySelector('.main-content'),
    appContainer: document.querySelector('.app-container'),
    themeBtn: document.getElementById('themeBtn'),
    themeDropdown: document.getElementById('themeDropdown'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsDropdown: document.getElementById('settingsDropdown'),
    togglePinnedSites: document.getElementById('togglePinnedSites'),
    toggleSearchBar: document.getElementById('toggleSearchBar'),
    toggleQuoteBox: document.getElementById('toggleQuoteBox'),
    toggleEditSites: document.getElementById('toggleEditSites'),
    openCustomizePanel: document.getElementById('openCustomizePanel'),
    themeButtonContainer: document.getElementById('themeButtonContainer'),
    settingsButtonContainer: document.getElementById('settingsButtonContainer'),
    toggleBlur: document.getElementById('toggleBlur'),
    toggleTransparentGrid: document.getElementById('toggleTransparentGrid'),
    searchWrapper: document.getElementById('searchWrapper'),
    searchContainer: document.getElementById('searchContainer'),
    searchBox: document.getElementById('searchBox'),
    engineSelector: document.getElementById('engineSelector'),
    engineDropdown: document.getElementById('engineDropdown'),
    currentEngine: document.getElementById('currentEngine'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    suggestionsContainer: document.getElementById('suggestionsContainer'),
    pinnedSitesSection: document.getElementById('pinnedSites'),
    sitesGrid: document.getElementById('sitesGrid'),
    siteModal: document.getElementById('siteModal'),
    modalTitle: document.getElementById('modalTitle'),
    siteNameInput: document.getElementById('siteName'),
    siteUrlInput: document.getElementById('siteUrl'),
    closeModalBtn: document.getElementById('closeModal'),
    cancelModalBtn: document.getElementById('cancelBtn'),
    saveSiteBtn: document.getElementById('saveBtn'),
    deleteSiteBtn: document.getElementById('deleteBtn'),
    customizeSidePanel: document.getElementById('customizeSidePanel'),
    resizeHandle: document.getElementById('resizeHandle'),
    closeCustomizePanelBtn: document.getElementById('closeCustomizePanel'),
    siteShapeRadios: document.querySelectorAll('input[name="siteShape"]'),
    searchRadiusSlider: document.getElementById('searchRadius'),
    searchRadiusValue: document.getElementById('searchRadiusValue'),
    searchHeightSlider: document.getElementById('searchHeight'),
    searchHeightValue: document.getElementById('searchHeightValue'),
    searchWidthSlider: document.getElementById('searchWidth'),
    searchWidthValue: document.getElementById('searchWidthValue'),
    enterDragModeBtn: document.getElementById('enterDragModeBtn'),
    enterResizeGridModeBtn: document.getElementById('enterResizeGridModeBtn'),
    resetAllPositionsBtn: document.getElementById('resetAllPositionsBtn'),
    blurValueInput: document.getElementById('blurValueInput'),
    resetBlurBtn: document.getElementById('resetBlurBtn'),
    dragModeControls: document.querySelector('.drag-mode-controls'),
    confirmDragBtn: document.getElementById('confirmDragBtn'),
    cancelDragBtn: document.getElementById('cancelDragBtn'),
    toast: document.getElementById('toast'),
    allSitesModal: document.getElementById('allSitesModal'),
    closeAllSitesModalBtn: document.getElementById('closeAllSitesModal'),
    allSitesGrid: document.getElementById('allSitesGrid'),
    fixIconsBtn: document.getElementById('fixIconsBtn'),
    progressModal: document.getElementById('progressModal'),
    progressCircle: document.getElementById('progressCircle'),
    progressText: document.getElementById('progressText'),
    cancelFixIconsBtn: document.getElementById('cancelFixIconsBtn'),
    quoteBox: document.getElementById('quoteBox'),
    quoteText: document.getElementById('quoteText'),
    importSettingsBtn: document.getElementById('importSettingsBtn'),
    exportSettingsBtn: document.getElementById('exportSettingsBtn'),
    hardResetBtn: document.getElementById('hardResetBtn'),
};

const DEFAULT_PINNED_SITES = [{ id: 1, name: "Google", url: "https://google.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.google.com" }, { id: 2, name: "YouTube", url: "https://youtube.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=youtube.com" }, { id: 3, name: "Wikipedia", url: "https://wikipedia.org", favicon: "https://www.google.com/s2/favicons?sz=128&domain=en.wikipedia.org" }, { id: 4, name: "Gmail", url: "https://mail.google.com", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" }, { id: 5, name: "GitHub", url: "https://github.com", favicon: "https://www.google.com/s2/favicons?sz=128&domain=www.github.com" }];
const SEARCH_ENGINES = { 
    google: { name: "Google", url: "https://www.google.com/search?q=", icon: "./src/icons/google.png" }, 
    bing: { name: "Bing", url: "https://www.bing.com/search?q=", icon: "./src/icons/bing.png" }, 
    duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", icon: "./src/icons/duckduckgo.png" }, 
    wikipedia: { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search=", icon: "./src/icons/wikipedia.png" },
    brave: { name: "Brave", url: "https://search.brave.com/search?q=", icon: "./src/icons/brave.png" },
    yandex: { name: "Yandex", url: "https://yandex.com/search/?text=", icon: "./src/icons/yandex.png" },
    startpage: { name: "Startpage", url: "https://www.startpage.com/sp/search?query=", icon: "./src/icons/startpage.png" },
    ecosia: { name: "Ecosia", url: "https://www.ecosia.org/search?q=", icon: "./src/icons/ecosia.png" },
    baidu: { name: "Baidu", url: "https://www.baidu.com/s?wd=", icon: "./src/icons/baidu.png" }
};

let appState = { 
    pinnedSites: [],
    currentSearchEngine: "google", 
    editingSite: null, 
    themePreference: "system", 
    hidePinnedSites: false, 
    hideSearchBar: false, 
    hideQuoteBox: false,
    pinnedSiteShape: "circle", 
    searchBarRadius: 50, 
    searchBarHeight: 50, 
    searchBarWidth: 680, 
    sidePanelWidth: 320, 
    isDragModeActive: false, 
    isResizeGridModeActive: false, 
    isEditModeActive: false, 
    isBlurEnabled: false, 
    uiBlurAmount: 10, 
    isGridTransparent: false, 
    customizationChanged: false, 
    searchHistory: [],
    linkHistory: [],
    lastVisitedLinkURL: null,
    movableElementPositions: { 
        searchWrapper: { y: 40, centered: true }, 
        pinnedSitesSection: { y: 60, width: 40, height: 30, centered: true },
        quoteBox: { x: 0, y: 0, width: 35, height: 8, centered: false }
    }, 
    initialMovableElementPositions: { 
        searchWrapper: { y: 40, centered: true }, 
        pinnedSitesSection: { y: 60, width: 40, height: 30, centered: true },
        quoteBox: { x: 0, y: 0, width: 35, height: 8, centered: false }
    } 
};

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
let currentSiteActionMenu = null;
let mainSortable = null;
let modalSortable = null;
let lazyLoadObserver = null;
let siteModalOutsideClickHandler;
let allSitesModalOutsideClickHandler;

function handleSuggestions(data) {
    const suggestionsContainer = DOM.suggestionsContainer;
    const searchBox = DOM.searchBox;
    if (!suggestionsContainer || !searchBox) return;

    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.remove('active');
    SearchManager.selectedSuggestionIndex = -1;

    const currentQuery = SearchManager.currentQuery;
    const linkSuggestions = HistoryManager.getLinkSuggestions(currentQuery);
    const searchSuggestions = HistoryManager.getSearchSuggestions(currentQuery);
    const googleSuggestions = data[1] || [];
    const historyItems = new Set();

    const createSuggestionElement = (text, type, iconClass) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';

        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        div.appendChild(icon);

        const textSpan = document.createElement('span');
        textSpan.className = 'suggestion-text';
        textSpan.textContent = text;
        div.appendChild(textSpan);

        div.onclick = () => {
            DOM.searchInput.value = text;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
            DOM.searchInput.focus();
            SearchManager.performSearch(text);
        };

        if (type === 'link' || type === 'search') {
            div.classList.add('history-item');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-history-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = `Remove from ${type} history`;
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (type === 'link') HistoryManager.removeLink(text);
                else HistoryManager.removeSearch(text);
                
                div.remove();
                
                const remainingItems = suggestionsContainer.querySelectorAll('.suggestion-item');
                if (remainingItems.length === 0) {
                    suggestionsContainer.classList.remove('active');
                } else {
                    const separators = suggestionsContainer.querySelectorAll('hr');
                    separators.forEach(hr => {
                        if (!hr.previousElementSibling || hr.previousElementSibling.tagName === 'HR' || !hr.nextElementSibling) {
                            hr.remove();
                        }
                    });
                }
            };
            div.appendChild(deleteBtn);
        }

        return div;
    };
    
    let hasHistory = false;
    if (linkSuggestions.length > 0) {
        hasHistory = true;
        linkSuggestions.forEach(s => {
            historyItems.add(s);
            suggestionsContainer.appendChild(createSuggestionElement(s, 'link', 'fa-link'));
        });
    }

    if (searchSuggestions.length > 0) {
        if (hasHistory) suggestionsContainer.appendChild(document.createElement('hr'));
        hasHistory = true;
        searchSuggestions.forEach(s => {
            historyItems.add(s);
            suggestionsContainer.appendChild(createSuggestionElement(s, 'search', 'fa-history'));
        });
    }

    if (googleSuggestions.length > 0) {
        if (hasHistory) suggestionsContainer.appendChild(document.createElement('hr'));
        googleSuggestions.forEach(s => {
            if (!historyItems.has(s)) {
                suggestionsContainer.appendChild(createSuggestionElement(s, 'google', 'fa-search'));
            }
        });
    }

    if (suggestionsContainer.hasChildNodes()) {
        const searchBoxRect = searchBox.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        suggestionsContainer.style.visibility = 'hidden';
        suggestionsContainer.style.display = 'block';
        const suggestionsHeight = suggestionsContainer.offsetHeight;
        suggestionsContainer.style.visibility = '';
        suggestionsContainer.style.display = '';
        const spaceBelow = viewportHeight - searchBoxRect.bottom;
        const requiredSpace = suggestionsHeight + 15;
        if (spaceBelow < requiredSpace && searchBoxRect.top > requiredSpace) {
            suggestionsContainer.style.top = `${searchBoxRect.top - suggestionsHeight - 10}px`;
        } else {
            suggestionsContainer.style.top = `${searchBoxRect.bottom + 10}px`;
        }
        suggestionsContainer.style.left = `${searchBoxRect.left}px`;
        suggestionsContainer.style.width = `${searchBoxRect.width}px`;
        suggestionsContainer.classList.add('active');
    }
}

function createSortableGrid(gridElement, onEndCallback) {
    return Sortable.create(gridElement, {
        animation: 200,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        filter: ".add-site-card, .all-sites-card",
        onMove: (evt) => !evt.related.classList.contains('add-site-card') && !evt.related.classList.contains('all-sites-card'),
        onStart: () => {
            SiteManager.closeActionMenu();
            DOM.body.classList.add('drag-mode-sortable-active');
        },
        onEnd: () => {
            DOM.body.classList.remove('drag-mode-sortable-active');
            if (onEndCallback) onEndCallback();
        }
    });
}

const App = {
    init() {
        FaviconCache.loadFromStorage();
        this.loadState();
        this.setupGlobalEventListeners();
        this.initializeUIComponents();
        this.setupBackgroundRefresh();
        this.initializeLazyLoader();
    },
    
    initializeLazyLoader() {
        if ('IntersectionObserver' in window) {
            lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            lazyLoadObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    },
    
    loadState() {
        const savedState = localStorage.getItem('newTabState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            const defaultPositions = { 
                searchWrapper: { y: 40, centered: true }, 
                pinnedSitesSection: { y: 60, width: 40, height: 30, centered: true },
                quoteBox: { x: 0, y: 0, width: 35, height: 8, centered: false }
            };
            const loadedPositions = { ...defaultPositions, ...(parsedState.movableElementPositions || {}) };

            appState = { ...appState, ...parsedState, movableElementPositions: loadedPositions };
            appState.searchHistory = parsedState.searchHistory || [];
            appState.lastVisitedLinkURL = parsedState.lastVisitedLinkURL || null;
            
            let loadedLinkHistory = parsedState.linkHistory || [];
            if (loadedLinkHistory.length > 0 && typeof loadedLinkHistory[0] === 'string') {
                const migratedHistory = {};
                loadedLinkHistory.forEach(url => {
                    if (migratedHistory[url]) {
                        migratedHistory[url].visitCount = Math.min(5, migratedHistory[url].visitCount + 1);
                    } else {
                        migratedHistory[url] = { url: url, visitCount: 1 };
                    }
                });
                appState.linkHistory = Object.values(migratedHistory);
            } else {
                appState.linkHistory = loadedLinkHistory;
            }

        } else {
            appState.pinnedSites = [...DEFAULT_PINNED_SITES];
        }
        document.documentElement.style.setProperty('--side-panel-width', `${appState.sidePanelWidth}px`);
        if (appState.isDragModeActive) {
            appState.isDragModeActive = false;
            DOM.dragModeControls.style.display = 'none';
        }
        if (appState.hidePinnedSites && appState.hideSearchBar) {
            Toast.show("Search Bar and Pinned Sites are hidden. You can show them from Settings.");
        }
    },
    saveState() { localStorage.setItem('newTabState', JSON.stringify(appState)); },
    initializeUIComponents() {
        ThemeManager.applyPreference(appState.themePreference);
        VisibilityManager.applySettings();
        EditModeManager.applySettings();
        CustomizationManager.applyAppearanceSettings();
        BlurManager.applySettings();
        ThemeManager.applyGridTransparency();
        SearchManager.populateEngineDropdown();
        SearchManager.updateAllEngineIcons();
        SiteManager.renderPinnedSites();
        QuoteManager.init();
        DOM.togglePinnedSites.checked = appState.hidePinnedSites;
        DOM.toggleSearchBar.checked = appState.hideSearchBar;
        DOM.toggleQuoteBox.checked = !appState.hideQuoteBox;
        DOM.toggleEditSites.checked = appState.isEditModeActive;
        DOM.toggleBlur.checked = appState.isBlurEnabled;
        DOM.toggleTransparentGrid.checked = appState.isGridTransparent;
        DOM.siteShapeRadios.forEach(radio => { if (radio.value === appState.pinnedSiteShape) radio.checked = true; });
        DOM.searchRadiusSlider.value = appState.searchBarRadius;
        DOM.searchHeightSlider.value = appState.searchBarHeight;
        DOM.searchWidthSlider.value = appState.searchBarWidth;
        CustomizationManager.updateSliderValues();
        [DOM.searchRadiusSlider, DOM.searchHeightSlider, DOM.searchWidthSlider].forEach(slider => CustomizationManager.updateSliderFill(slider));
        DOM.blurValueInput.value = appState.uiBlurAmount;
        setTimeout(() => {
            PositionManager.applyFreeMoveSettings();
            DOM.searchWrapper.style.opacity = '1';
            DOM.pinnedSitesSection.style.opacity = '1';
            DOM.quoteBox.style.opacity = '1';
        }, 50);
    },
    setupBackgroundRefresh() {
        BackgroundManager.fetchRandom();
        window.addEventListener('beforeunload', () => localStorage.removeItem('lastBackground'));
    },
    setupGlobalEventListeners() {
        siteModalOutsideClickHandler = ModalManager.handleOutsideClick(DOM.siteModal, '.modal-content', ['.site-card .action-button', '.action-item', '.add-site-card']);
        allSitesModalOutsideClickHandler = ModalManager.handleOutsideClick(DOM.allSitesModal, '.modal-content', ['.all-sites-card']);

        document.addEventListener('click', (e) => {
            if (appState.isDragModeActive || appState.isResizeGridModeActive || DOM.body.classList.contains('resizing-panel') || DOM.body.classList.contains('resizing-grid')) return;
            DropdownManager.closeAll();
            siteModalOutsideClickHandler(e);
            allSitesModalOutsideClickHandler(e);
            SiteManager.closeActionMenu();
            if (DOM.suggestionsContainer && !DOM.searchContainer.contains(e.target) && !DOM.suggestionsContainer.contains(e.target)) {
                DOM.suggestionsContainer.innerHTML = '';
                DOM.suggestionsContainer.classList.remove('active');
            }
        });
        prefersDarkScheme.addEventListener('change', (e) => {
            if (appState.themePreference === "system") {
                ThemeManager.applyPreference("system");
            }
        });
        window.addEventListener('resize', Utils.debounce(() => {
            PositionManager.applyFreeMoveSettings();
            SiteManager.checkGridOverflow();
        }, 50));
    }
};

const BackgroundManager = {
    fetchRandom() {
        const bgImage = document.getElementById('randomBackground');
        const timestamp = new Date().getTime();
        bgImage.src = `http://localhost:4000/random-image?t=${timestamp}`;
        bgImage.onload = () => bgImage.classList.add('active');
        bgImage.onerror = () => {
            console.error("Failed to load background image");
            bgImage.src = 'https://placehold.co/1920x1080/202124/e8eaed?text=Fallback+Background';
            bgImage.classList.add('active');
        };
    }
};

const ThemeManager = {
    applyPreference(preference) {
        appState.themePreference = preference;
        let themeToApply = preference === "system" ? (prefersDarkScheme.matches ? "dark" : "light") : preference;
        DOM.body.setAttribute('data-theme', themeToApply);
        this.updateThemeIcon(preference);
        DebouncedSave.immediateSave();
    },
    setTheme(preference) { this.applyPreference(preference); },
    updateThemeIcon(preference) {
        const icon = DOM.themeBtn.querySelector('i');
        switch (preference) {
            case 'dark':
                icon.className = "fas fa-moon";
                break;
            case 'light':
                icon.className = "fas fa-sun";
                break;
            case 'system':
                icon.className = "fas fa-desktop";
                break;
            default:
                icon.className = prefersDarkScheme.matches ? "fas fa-moon" : "fas fa-sun";
                break;
        }
    },
    applyGridTransparency() {
        DOM.pinnedSitesSection.classList.toggle('grid-transparent', appState.isGridTransparent);
    },
    toggleGridTransparency() {
        appState.isGridTransparent = DOM.toggleTransparentGrid.checked;
        this.applyGridTransparency();
        DebouncedSave.immediateSave();
        Toast.show(`Grid background ${appState.isGridTransparent ? "hidden" : "visible"}`);
    },
    setupEventListeners() {
        DOM.themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            SiteManager.closeActionMenu();
            DropdownManager.toggle(DOM.themeDropdown);
        });
        DOM.themeDropdown.querySelectorAll('.dropdown-item[data-theme-preference]').forEach(item => {
            item.addEventListener('click', (e) => {
                ThemeManager.setTheme(e.currentTarget.dataset.themePreference);
                DropdownManager.closeAll();
            });
        });
        DOM.toggleTransparentGrid.addEventListener('change', this.toggleGridTransparency.bind(this));
    }
};

const DropdownManager = {
    toggle(dropdownElement, positioningCallback = null) {
        this.closeAll(dropdownElement);
        if (positioningCallback && !dropdownElement.classList.contains('active')) {
            positioningCallback();
        }
        dropdownElement.classList.toggle('active');
    },
    closeAll(excludeDropdown = null) {
        [DOM.themeDropdown, DOM.settingsDropdown, DOM.engineDropdown].forEach(dropdown => {
            if (dropdown && dropdown !== excludeDropdown) dropdown.classList.remove('active');
        });
    },
    setupEventListeners() {
        DOM.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            SiteManager.closeActionMenu();
            DropdownManager.toggle(DOM.settingsDropdown);
        });
    }
};

const VisibilityManager = {
    applySettings() {
        DOM.searchContainer.classList.toggle('hidden', appState.hideSearchBar);
        DOM.pinnedSitesSection.classList.toggle('hidden', appState.hidePinnedSites);
        DOM.quoteBox.classList.toggle('hidden', appState.hideQuoteBox);
        DOM.togglePinnedSites.checked = appState.hidePinnedSites;
        DOM.toggleSearchBar.checked = appState.hideSearchBar;
        DOM.toggleQuoteBox.checked = !appState.hideQuoteBox;
    },
    togglePinnedSites() {
        appState.hidePinnedSites = DOM.togglePinnedSites.checked;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show(`Pinned Sites ${appState.hidePinnedSites ? "hidden" : "shown"}`);
    },
    toggleSearchBar() {
        appState.hideSearchBar = DOM.toggleSearchBar.checked;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show(`Search Bar ${appState.hideSearchBar ? "hidden" : "shown"}`);
    },
    toggleQuoteBox() {
        appState.hideQuoteBox = !DOM.toggleQuoteBox.checked;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show(`Quote Box ${appState.hideQuoteBox ? "hidden" : "shown"}`);
    },
    setupEventListeners() {
        DOM.togglePinnedSites.addEventListener('change', this.togglePinnedSites.bind(this));
        DOM.toggleSearchBar.addEventListener('change', this.toggleSearchBar.bind(this));
        DOM.toggleQuoteBox.addEventListener('change', this.toggleQuoteBox.bind(this));
    }
};

const EditModeManager = {
    applySettings() { DOM.body.classList.toggle('edit-mode-active', appState.isEditModeActive); },
    toggleEditMode() {
        appState.isEditModeActive = DOM.toggleEditSites.checked;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show(`Edit Mode ${appState.isEditModeActive ? "enabled" : "disabled"}`);
    },
    setupEventListeners() { DOM.toggleEditSites.addEventListener('change', this.toggleEditMode.bind(this)); }
};

const BlurManager = {
    applySettings() {
        DOM.body.classList.toggle('blur-enabled', appState.isBlurEnabled);
        document.documentElement.style.setProperty('--ui-blur-amount', `${appState.uiBlurAmount}px`);
    },
    toggleBlur() {
        appState.isBlurEnabled = DOM.toggleBlur.checked;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show(`Frosted Glass UI ${appState.isBlurEnabled ? "enabled" : "disabled"}`);
    },
    updateBlurAmount(e) {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            appState.uiBlurAmount = value;
            appState.customizationChanged = true;
            this.applySettings();
            DebouncedSave.save();
        }
    },
    resetToDefault() {
        appState.uiBlurAmount = 10;
        DOM.blurValueInput.value = appState.uiBlurAmount;
        appState.customizationChanged = true;
        this.applySettings();
        DebouncedSave.immediateSave();
        Toast.show("Blur amount reset to default (10px)");
    },
    setupEventListeners() {
        DOM.toggleBlur.addEventListener('change', this.toggleBlur.bind(this));
        DOM.blurValueInput.addEventListener('input', this.updateBlurAmount.bind(this));
        DOM.resetBlurBtn.addEventListener('click', this.resetToDefault.bind(this));
    }
};

const CustomizationManager = {
    toggleSidePanel() {
        document.documentElement.style.setProperty('--side-panel-width', `${appState.sidePanelWidth}px`);
        const isActive = DOM.customizeSidePanel.classList.toggle('active');
        DOM.body.classList.toggle('side-panel-active', isActive);

        setTimeout(() => {
            PositionManager.applyFreeMoveSettings();
        }, 410);

        if (isActive) {
            appState.customizationChanged = false;
            DOM.siteShapeRadios.forEach(radio => { if (radio.value === appState.pinnedSiteShape) radio.checked = true; });
            DOM.searchRadiusSlider.value = appState.searchBarRadius;
            DOM.searchHeightSlider.value = appState.searchBarHeight;
            DOM.searchWidthSlider.value = appState.searchBarWidth;
            DOM.blurValueInput.value = appState.uiBlurAmount;
            this.updateSliderValues();
            [DOM.searchRadiusSlider, DOM.searchHeightSlider, DOM.searchWidthSlider].forEach(slider => this.updateSliderFill(slider));
        } else {
            if (appState.customizationChanged) {
                DebouncedSave.immediateSave();
                Toast.show("Customization saved!");
            }
        }
    },
    updatePinnedSiteShape() {
        appState.pinnedSiteShape = document.querySelector('input[name="siteShape"]:checked').value;
        appState.customizationChanged = true;
        this.applyAppearanceSettings();
        DebouncedSave.save();
    },
    updateSearchBarAppearance() {
        appState.searchBarRadius = parseInt(DOM.searchRadiusSlider.value);
        appState.searchBarHeight = parseInt(DOM.searchHeightSlider.value);
        appState.searchBarWidth = parseInt(DOM.searchWidthSlider.value);
        appState.customizationChanged = true;
    
        this.applyAppearanceSettings();
        PositionManager.applyFreeMoveSettings(); 
    
        DebouncedSave.save();
        this.updateSliderValues();
    },
    updateSliderValues() {
        DOM.searchRadiusValue.textContent = `${appState.searchBarRadius}px`;
        DOM.searchHeightValue.textContent = `${appState.searchBarHeight}px`;
        DOM.searchWidthValue.textContent = `${appState.searchBarWidth}px`;
    },
    updateSliderFill(slider) {
        const min = slider.min || 0;
        const max = slider.max || 100;
        const value = slider.value;
        const percentage = ((value - min) / (max - min)) * 100;
        if (typeof slider.style.setProperty === 'function') {
            slider.style.setProperty('--slider-progress-percent', `${percentage}%`);
        }
    },
    applyAppearanceSettings() {
        document.querySelectorAll('.site-icon').forEach(icon => {
            icon.style.clipPath = '';
            icon.style.borderRadius = '';
            switch (appState.pinnedSiteShape) {
                case 'circle': icon.style.borderRadius = '50%'; break;
                case 'square': icon.style.borderRadius = '0%'; break;
                case 'rounded-square': icon.style.borderRadius = '25%'; break;
                case 'pebble': icon.style.borderRadius = '60% 40% 30% 70% / 60% 30% 70% 40%'; break;
                case 'squircle': icon.style.borderRadius = '35%'; break;
                default: icon.style.borderRadius = '50%';
            }
        });
        DOM.searchBox.style.borderRadius = `${appState.searchBarRadius}px`;
        DOM.searchBox.style.height = `${appState.searchBarHeight}px`;
        DOM.searchWrapper.style.width = `${appState.searchBarWidth}px`;
        document.documentElement.style.setProperty('--search-radius-val', `${appState.searchBarRadius}px`);
        
        const dropdownRadius = Math.min(appState.searchBarRadius, 16);
        const suggestionRadius = Math.min(appState.searchBarRadius, 12);
        DOM.engineDropdown.style.borderRadius = `${dropdownRadius}px`;
        DOM.suggestionsContainer.style.borderRadius = `${suggestionRadius}px`;
    },
    setupEventListeners() {
        DOM.openCustomizePanel.addEventListener('click', () => {
            DropdownManager.closeAll();
            SiteManager.closeActionMenu();
            this.toggleSidePanel();
        });
        DOM.closeCustomizePanelBtn.addEventListener('click', this.toggleSidePanel.bind(this));
        DOM.resizeHandle.addEventListener('mousedown', this.initResize.bind(this));
        DOM.siteShapeRadios.forEach(radio => radio.addEventListener('change', this.updatePinnedSiteShape.bind(this)));

        [DOM.searchRadiusSlider, DOM.searchHeightSlider, DOM.searchWidthSlider].forEach(slider => {
            slider.addEventListener('input', () => {
                this.updateSearchBarAppearance();
                this.updateSliderFill(slider);
            });
        });
    },
    initResize(e) {
        e.preventDefault();
        DOM.body.classList.add('resizing-panel');
        this.resizePanelHandler = this.resizePanel.bind(this);
        this.stopResizeHandler = this.stopResize.bind(this);
        document.addEventListener('mousemove', this.resizePanelHandler);
        document.addEventListener('mouseup', this.stopResizeHandler);
    },
    resizePanel(e) {
        let newWidth = window.innerWidth - e.clientX;
        const minWidth = 280, maxWidth = 800;
        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        appState.sidePanelWidth = newWidth;
        document.documentElement.style.setProperty('--side-panel-width', `${newWidth}px`);
        PositionManager.applyFreeMoveSettings();
    },
    stopResize() {
        DOM.body.classList.remove('resizing-panel');
        document.removeEventListener('mousemove', this.resizePanelHandler);
        document.removeEventListener('mouseup', this.stopResizeHandler);
        DebouncedSave.immediateSave();
    }
};

const PositionManager = {
    activeDraggable: null,
    offsetX: 0,
    offsetY: 0,
    getMovableElements() { return { searchWrapper: DOM.searchWrapper, pinnedSitesSection: DOM.pinnedSitesSection, quoteBox: DOM.quoteBox }; },
    saveInitialPositions() {
        appState.initialMovableElementPositions = JSON.parse(JSON.stringify(appState.movableElementPositions));
    },
    enterDragMode() {
        if (DOM.customizeSidePanel.classList.contains('active')) CustomizationManager.toggleSidePanel();
        if (appState.isResizeGridModeActive) this.exitResizeGridMode();
        appState.isDragModeActive = true;
        this.saveInitialPositions();
        this.setupDraggableElements();
        DOM.dragModeControls.style.display = 'flex';
        DOM.pinnedSitesSection.classList.remove('grid-transparent');
        DebouncedSave.immediateSave();
        Toast.show("Drag mode enabled. Drag elements and then confirm/cancel!");
        DOM.body.classList.add('drag-active');
    },
    exitDragMode() {
        appState.isDragModeActive = false;
        this.removeDraggableElements();
        DOM.dragModeControls.style.display = 'none';
        DOM.body.classList.remove('drag-active');
        ThemeManager.applyGridTransparency();
        DebouncedSave.immediateSave();
    },
    enterResizeGridMode() {
        if (DOM.customizeSidePanel.classList.contains('active')) CustomizationManager.toggleSidePanel();
        if (appState.isDragModeActive) this.exitDragMode();
        appState.isResizeGridModeActive = true;
        this.saveInitialPositions();
        DOM.dragModeControls.style.display = 'flex';
        DOM.pinnedSitesSection.classList.remove('grid-transparent');
        Toast.show("Resize mode enabled. Adjust elements and then confirm/cancel!");
        DOM.body.classList.add('resize-grid-active');
    },
    exitResizeGridMode() {
        appState.isResizeGridModeActive = false;
        DOM.dragModeControls.style.display = 'none';
        DOM.body.classList.remove('resize-grid-active');
        ThemeManager.applyGridTransparency();
    },
    confirmPositions() {
        if (appState.isDragModeActive) this.exitDragMode();
        if (appState.isResizeGridModeActive) this.exitResizeGridMode();
        Toast.show("Changes saved!");
        DebouncedSave.immediateSave();
    },
    cancelPositions() {
        appState.movableElementPositions = JSON.parse(JSON.stringify(appState.initialMovableElementPositions));
        this.applyFreeMoveSettings();
        if (appState.isDragModeActive) this.exitDragMode();
        if (appState.isResizeGridModeActive) this.exitResizeGridMode();
        Toast.show("Changes undone!");
    },
    setupDraggableElements() {
        const movableElems = this.getMovableElements();
        for (const key in movableElems) {
            const elem = movableElems[key];
            if (elem) {
                elem.addEventListener('mousedown', this.startDrag.bind(this));
                elem.style.cursor = 'grab';
            }
        }
    },
    removeDraggableElements() {
        const movableElems = this.getMovableElements();
        for (const key in movableElems) {
            const elem = movableElems[key];
            if (elem) {
                elem.removeEventListener('mousedown', this.startDrag.bind(this));
                elem.style.cursor = 'auto';
            }
        }
    },
    startDrag(e) {
        if (!appState.isDragModeActive || e.button !== 0 || this.activeDraggable || e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        this.activeDraggable = e.currentTarget;

        let keyToUpdate = Object.keys(DOM).find(key => DOM[key] === this.activeDraggable);
        if (keyToUpdate && appState.movableElementPositions[keyToUpdate]) {
            appState.movableElementPositions[keyToUpdate].centered = false;
        }

        this.activeDraggable.style.cursor = 'grabbing';
        this.offsetX = e.clientX - this.activeDraggable.getBoundingClientRect().left;
        this.offsetY = e.clientY - this.activeDraggable.getBoundingClientRect().top;
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
    },
    drag(e) {
        if (!this.activeDraggable) return;
        e.preventDefault();
        const container = DOM.mainContent;
        const containerRect = container.getBoundingClientRect();
        const elem = this.activeDraggable;
        let newX = e.clientX - containerRect.left - this.offsetX;
        let newY = e.clientY - containerRect.top - this.offsetY;
        const clampedX = Math.min(Math.max(0, newX), container.clientWidth - elem.offsetWidth);
        const clampedY = Math.min(Math.max(0, newY), container.clientHeight - elem.offsetHeight);
        elem.style.left = `${clampedX}px`;
        elem.style.top = `${clampedY}px`;
        
        let keyToUpdate = Object.keys(DOM).find(key => DOM[key] === elem);
        if (keyToUpdate && appState.movableElementPositions[keyToUpdate]) {
            const pos = appState.movableElementPositions[keyToUpdate];
            pos.x = (clampedX / container.clientWidth) * 100;
            pos.y = (clampedY / container.clientHeight) * 100;
        }
    },
    endDrag() {
        if (!this.activeDraggable) return;
        this.activeDraggable.style.cursor = 'grab';
        this.activeDraggable = null;
        document.removeEventListener('mousemove', this.drag.bind(this));
        document.removeEventListener('mouseup', this.endDrag.bind(this));
        DebouncedSave.save();
    },
    resetAllPositions() {
        const container = DOM.mainContent;
        if (!container) return;

        const cols = 7, rows = 2;
        const cardMinWidth = 68;
        const cardEstHeight = 120;
        const gap = 18;

        const targetWidthPx = (cols * cardMinWidth) + ((cols - 1) * gap);
        const targetHeightPx = (rows * cardEstHeight) + ((rows - 1) * gap);

        const widthPercent = (targetWidthPx / container.clientWidth) * 100;
        const heightPercent = (targetHeightPx / container.clientHeight) * 100;

        const defaultPositions = {
            searchWrapper: { y: 40, centered: true },
            pinnedSitesSection: { y: 60, width: widthPercent, height: heightPercent, centered: true },
            quoteBox: { x: 2, y: 2, width: 30, height: 8, centered: false }
        };
        
        for (const key in defaultPositions) {
            const config = defaultPositions[key];
            appState.movableElementPositions[key] = { ...appState.movableElementPositions[key], ...config };
        }

        if (!appState.isDragModeActive && !appState.isResizeGridModeActive) {
            this.saveInitialPositions();
        }
        appState.customizationChanged = true;
        this.applyFreeMoveSettings();
        DebouncedSave.immediateSave();
        Toast.show("All elements reset to their default positions.");
    },
    applyFreeMoveSettings() {
        const container = DOM.mainContent;
        if (!container) return;
        const movableElems = this.getMovableElements();

        for (const key in movableElems) {
            const elem = movableElems[key];
            if (elem && appState.movableElementPositions[key]) {
                const pos = appState.movableElementPositions[key];
                
                elem.style.width = pos.width ? `${pos.width}%` : '';
                elem.style.height = pos.height ? `${pos.height}%` : '';

                if (key === 'searchWrapper') {
                    elem.style.width = `${appState.searchBarWidth}px`;
                }

                let newX;
                if (pos.centered) {
                    newX = (container.clientWidth / 2) - (elem.offsetWidth / 2);
                    pos.x = (newX / container.clientWidth) * 100;
                } else {
                    newX = (pos.x / 100) * container.clientWidth;
                }

                const newY = (pos.y / 100) * container.clientHeight;
                const clampedX = Math.min(Math.max(0, newX), container.clientWidth - elem.offsetWidth);
                const clampedY = Math.min(Math.max(0, newY), container.clientHeight - elem.offsetHeight);

                elem.style.left = `${clampedX}px`;
                elem.style.top = `${clampedY}px`;
                elem.style.cursor = appState.isDragModeActive ? 'grab' : 'auto';
            }
        }
        SiteManager.checkGridOverflow();
    },
    initElementResize(e) {
        e.preventDefault();
        e.stopPropagation();
        DOM.body.classList.add('resizing-grid');

        const handle = e.target;
        const container = handle.closest('.resizable-element');
        if (!container) return;
        
        const keyToUpdate = Object.keys(DOM).find(key => DOM[key] === container);
        if (!keyToUpdate) return;

        const mainContent = DOM.mainContent;
        const direction = handle.dataset.direction;
    
        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = container.getBoundingClientRect();
    
        const doResize = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newLeft = startRect.left - mainContent.offsetLeft;
            let newTop = startRect.top - mainContent.offsetTop;
            let newWidth = startRect.width;
            let newHeight = startRect.height;

            if (direction.includes('e')) newWidth = startRect.width + dx;
            if (direction.includes('w')) {
                newWidth = startRect.width - dx;
                newLeft = startRect.left - mainContent.offsetLeft + dx;
            }
            if (direction.includes('s')) newHeight = startRect.height + dy;
            if (direction.includes('n')) {
                newHeight = startRect.height - dy;
                newTop = startRect.top - mainContent.offsetTop + dy;
            }
            
            const minWidth = parseFloat(getComputedStyle(container).minWidth) || 150;
            const minHeight = parseFloat(getComputedStyle(container).minHeight) || 50;

            if (newWidth < minWidth) {
                if(direction.includes('w')) newLeft += newWidth - minWidth;
                newWidth = minWidth;
            }
            if (newHeight < minHeight) {
                if(direction.includes('n')) newTop += newHeight - minHeight;
                newHeight = minHeight;
            }

            container.style.width = `${newWidth}px`;
            container.style.height = `${newHeight}px`;
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;

            const pos = appState.movableElementPositions[keyToUpdate];
            pos.centered = false;
            pos.x = (newLeft / mainContent.clientWidth) * 100;
            pos.y = (newTop / mainContent.clientHeight) * 100;
            pos.width = (newWidth / mainContent.clientWidth) * 100;
            pos.height = (newHeight / mainContent.clientHeight) * 100;

            if (keyToUpdate === 'pinnedSitesSection') {
                SiteManager.checkGridOverflow();
            }
        };
    
        const stopResize = () => {
            DOM.body.classList.remove('resizing-grid');
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            DebouncedSave.save();
        };
    
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
    },
    setupEventListeners() {
        DOM.enterDragModeBtn.addEventListener('click', this.enterDragMode.bind(this));
        DOM.enterResizeGridModeBtn.addEventListener('click', this.enterResizeGridMode.bind(this));
        DOM.resetAllPositionsBtn.addEventListener('click', this.resetAllPositions.bind(this));
        DOM.confirmDragBtn.addEventListener('click', this.confirmPositions.bind(this));
        DOM.cancelDragBtn.addEventListener('click', this.cancelPositions.bind(this));

        document.querySelectorAll('.resizable-element .resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', this.initElementResize.bind(this));
        });
    }
};

const HistoryManager = {
    addSearch(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        appState.searchHistory = appState.searchHistory.filter(item => item !== trimmedQuery);
        appState.searchHistory.unshift(trimmedQuery);
        if (appState.searchHistory.length > 200) {
            appState.searchHistory.pop();
        }
        DebouncedSave.immediateSave();
    },
    removeSearch(query) {
        const trimmedQuery = query.trim();
        appState.searchHistory = appState.searchHistory.filter(item => item !== trimmedQuery);
        DebouncedSave.immediateSave();
        Toast.show("Search item removed from history.");
    },
    getSearchSuggestions(inputValue) {
        const trimmedInput = inputValue.trim().toLowerCase();
        if (!trimmedInput) return [];
        return appState.searchHistory.filter(item => item.toLowerCase().startsWith(trimmedInput));
    },
    addLink(url) {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) return;
    
        let currentLinkEntry = appState.linkHistory.find(item => item.url === trimmedUrl);
        if (!currentLinkEntry) {
            currentLinkEntry = { url: trimmedUrl, visitCount: 0 };
            appState.linkHistory.push(currentLinkEntry);
        }
    
        if (trimmedUrl === appState.lastVisitedLinkURL) {
            currentLinkEntry.visitCount = Math.min(currentLinkEntry.visitCount + 1, 5);
        } else {
            currentLinkEntry.visitCount = 1;
        }
    
        const newVisitCount = currentLinkEntry.visitCount;
        if (newVisitCount > 0) {
            appState.linkHistory.forEach(item => {
                if (item.url !== trimmedUrl) {
                    if (item.visitCount > 0 && newVisitCount >= item.visitCount) {
                        item.visitCount = 0;
                    }
                }
            });
        }
    
        appState.lastVisitedLinkURL = trimmedUrl;
    
        appState.linkHistory.sort((a, b) => b.visitCount - a.visitCount);
    
        if (appState.linkHistory.length > 200) {
            appState.linkHistory.pop();
        }
    
        DebouncedSave.immediateSave();
    },
    removeLink(url) {
        const trimmedUrl = url.trim();
        appState.linkHistory = appState.linkHistory.filter(item => item.url !== trimmedUrl);
        DebouncedSave.immediateSave();
        Toast.show("Link removed from history.");
    },
    getLinkSuggestions(inputValue) {
        const trimmedInput = inputValue.trim().toLowerCase();
        if (!trimmedInput) return [];
        return appState.linkHistory
            .filter(item =>
                item.url.replace(/^(https?:\/\/)?/, '').toLowerCase().startsWith(trimmedInput)
            )
            .sort((a, b) => b.visitCount - a.visitCount)
            .map(item => item.url);
    }
};

const SearchManager = {
    currentQuery: '',
    selectedSuggestionIndex: -1,
    setEngine(engineKey) {
        if (SEARCH_ENGINES[engineKey]) {
            appState.currentSearchEngine = engineKey;
            const { name, icon } = SEARCH_ENGINES[engineKey];
            DOM.currentEngine.innerHTML = `<img src="${icon}" alt="${name} logo">`;
            DebouncedSave.immediateSave();
        }
    },
    updateAllEngineIcons() {
        this.setEngine(appState.currentSearchEngine);
    },
    performSearch(queryOverride) {
        if (appState.isDragModeActive) return Toast.show("Exit drag mode to search!");
        const query = (typeof queryOverride === 'string' ? queryOverride : DOM.searchInput.value).trim();
        if (!query) return;
    
        const hasProtocol = /^(https?|ftp):\/\//i.test(query);
        const isLocalOrIp = /^(localhost|127\.0\.0\.1|\[::1\]|(\d{1,3}\.){3}\d{1,3})/i.test(query);
        const hasDot = query.includes('.') && !query.includes(' ');
    
        if (hasProtocol || isLocalOrIp || hasDot) {
            let url = query;
            if (!hasProtocol) {
                url = isLocalOrIp ? 'http://' + url : 'https://' + url;
            }
    
            HistoryManager.addLink(query);
            window.open(url, '_self');
        } else {
            HistoryManager.addSearch(query);
            const searchUrl = SEARCH_ENGINES[appState.currentSearchEngine].url + encodeURIComponent(query);
            window.open(searchUrl, '_self');
        }
    
        DOM.searchInput.value = '';
        this.selectedSuggestionIndex = -1;
        DOM.suggestionsContainer.classList.remove('active');
    },
    populateEngineDropdown() {
        DOM.engineDropdown.innerHTML = '';
        
        const createEngineOption = (engineKey, showName = false) => {
            const engine = SEARCH_ENGINES[engineKey];
            const div = document.createElement('div');
            div.className = 'search-engine-option';
            div.dataset.engine = engineKey;
            div.title = engine.name;
            div.innerHTML = `<div class="logo"><img src="${engine.icon}" alt="${engine.name} logo"></div>${showName ? `<span>${engine.name}</span>` : ''}`;
            return div;
        };
        
        const strip = document.createElement('div');
        strip.className = 'search-engine-strip';
        ['brave', 'yandex', 'startpage', 'ecosia', 'baidu'].forEach(key => strip.appendChild(createEngineOption(key)));
        DOM.engineDropdown.appendChild(strip);
        
        ['google', 'bing', 'duckduckgo', 'wikipedia'].forEach(key => DOM.engineDropdown.appendChild(createEngineOption(key, true)));
    },
    updateSuggestionSelection(suggestions) {
        suggestions.forEach((item, index) => {
            if (index === this.selectedSuggestionIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
                DOM.searchInput.value = item.querySelector('.suggestion-text').textContent;
            } else {
                item.classList.remove('selected');
            }
        });
    },
    setupEventListeners() {
        DOM.engineSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            SiteManager.closeActionMenu();
            if (appState.isDragModeActive) return Toast.show("Exit drag mode to change search engine!");
            
            const positionCallback = () => {
                const searchBoxRect = DOM.searchBox.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                DOM.engineDropdown.style.visibility = 'hidden';
                DOM.engineDropdown.style.display = 'block';
                const dropdownHeight = DOM.engineDropdown.offsetHeight;
                DOM.engineDropdown.style.display = '';
                DOM.engineDropdown.style.visibility = '';
                const spaceRequired = dropdownHeight + 15;
                DOM.engineDropdown.style.top = (viewportHeight - searchBoxRect.bottom) < spaceRequired ? `${searchBoxRect.top - dropdownHeight - 10}px` : `${searchBoxRect.bottom + 10}px`;
                DOM.engineDropdown.style.left = `${searchBoxRect.left}px`;
            };

            DropdownManager.toggle(DOM.engineDropdown, positionCallback);
        });

        DOM.searchBtn.addEventListener('click', () => this.performSearch());
        
        DOM.searchInput.addEventListener('keydown', (e) => {
            const suggestions = DOM.suggestionsContainer.querySelectorAll('.suggestion-item');
            const hasSuggestions = suggestions.length > 0 && DOM.suggestionsContainer.classList.contains('active');

            switch (e.key) {
                case 'ArrowDown':
                    if (hasSuggestions) {
                        e.preventDefault();
                        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % suggestions.length;
                        this.updateSuggestionSelection(suggestions);
                    }
                    break;
                case 'ArrowUp':
                    if (hasSuggestions) {
                        e.preventDefault();
                        this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
                        this.updateSuggestionSelection(suggestions);
                    }
                    break;
                case 'Enter':
                    if (hasSuggestions && this.selectedSuggestionIndex > -1) {
                        e.preventDefault();
                        suggestions[this.selectedSuggestionIndex].click();
                    } else {
                        e.preventDefault();
                        this.performSearch();
                    }
                    break;
                case 'Escape':
                    if (hasSuggestions) {
                        DOM.suggestionsContainer.classList.remove('active');
                        this.selectedSuggestionIndex = -1;
                    }
                    break;
            }
        });
        
        const throttledGlow = Utils.throttle((e) => {
            const rect = DOM.searchBox.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
            DOM.searchBox.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            DOM.searchBox.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        }, 16);
        DOM.searchWrapper.addEventListener('mousemove', throttledGlow);
        DOM.searchWrapper.addEventListener('mouseleave', () => { DOM.searchBox.style.setProperty('--mouse-x', '50%'); DOM.searchBox.style.setProperty('--mouse-y', '50%'); });

        DOM.engineDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.search-engine-option');
            if (option && option.dataset.engine) {
                e.stopPropagation();
                this.setEngine(option.dataset.engine);
                DropdownManager.closeAll();
            }
        });
        
        DOM.searchInput.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
                return;
            }

            const input = DOM.searchInput;
            let originalValue = input.value;
            const selectionStart = input.selectionStart;
            const selectionEnd = input.selectionEnd;
            const isDeletionKey = ['Backspace', 'Delete'].includes(e.key);

            if (isDeletionKey && selectionStart !== selectionEnd) {
                 originalValue = input.value.substring(0, selectionStart);
            }

            if (!isDeletionKey && originalValue.length > 0 && selectionStart === originalValue.length) {
                let bestMatch = HistoryManager.getLinkSuggestions(originalValue)[0];
                let isLink = true;

                if (!bestMatch) {
                    bestMatch = HistoryManager.getSearchSuggestions(originalValue)[0];
                    isLink = false;
                }

                if (bestMatch) {
                    const cleanBestMatch = isLink ? bestMatch.replace(/^(https?:\/\/)?/, '') : bestMatch;
                    if (cleanBestMatch.toLowerCase().startsWith(originalValue.toLowerCase()) && cleanBestMatch.length > originalValue.length) {
                        input.value = originalValue + cleanBestMatch.substring(originalValue.length);
                        input.setSelectionRange(originalValue.length, input.value.length);
                    }
                }
            }

            this.currentQuery = originalValue;
            if (this.currentQuery.length < 1) {
                DOM.suggestionsContainer.innerHTML = '';
                DOM.suggestionsContainer.classList.remove('active');
                return;
            }
            
            this.selectedSuggestionIndex = -1;
            
            const script = document.createElement('script');
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(this.currentQuery)}&callback=handleSuggestions`;
            document.body.appendChild(script);
            document.body.removeChild(script);
        });
    }
};

const SiteManager = {
    _getFaviconPlaceholder(name) {
        if (!name) return `<i class="fa-solid fa-globe favicon-placeholder-icon"></i>`;
        
        const firstChar = name.trim().charAt(0).toLowerCase();
        
        if ((firstChar >= 'a' && firstChar <= 'z') || (firstChar >= '0' && firstChar <= '9')) {
            return `<i class="fa-solid fa-${firstChar} favicon-placeholder-icon"></i>`;
        }
        
        return `<i class="fa-solid fa-globe favicon-placeholder-icon"></i>`;
    },

    renderPinnedSites() {
        DOM.sitesGrid.innerHTML = '';
        appState.pinnedSites.forEach((site) => {
            DOM.sitesGrid.appendChild(this._createSiteCard(site));
        });

        const allSitesCard = document.createElement('div');
        allSitesCard.className = 'site-card all-sites-card';
        allSitesCard.id = 'allSitesCard';
        allSitesCard.style.display = 'none'; 
        allSitesCard.innerHTML = `<a href="#" class="site-link all-sites-link" aria-label="Show all sites"><div class="site-icon"><i class="fas fa-th"></i></div><span class="site-name">All Sites</span></a>`;
        allSitesCard.querySelector('.all-sites-link').addEventListener('click', (e) => {
            e.preventDefault();
            AllSitesModal.open();
        });
        DOM.sitesGrid.appendChild(allSitesCard);

        const addCard = document.createElement('div');
        addCard.className = 'site-card add-site-card';
        addCard.innerHTML = `<a href="#" class="site-link add-site-link" aria-label="Add new site"><div class="site-icon"><i class="fas fa-plus"></i></div><span class="site-name">Add Site</span></a>`;
        addCard.querySelector('.add-site-link').addEventListener('click', (e) => {
            e.preventDefault();
            if (!appState.isDragModeActive) { this.closeActionMenu(); SiteModal.open(); } else { Toast.show("Exit drag mode to add sites!"); e.stopPropagation(); }
        });
        DOM.sitesGrid.appendChild(addCard);

        CustomizationManager.applyAppearanceSettings();
        this.setupSortable();
        this.checkGridOverflow();
    },

    _createSiteCard(site) {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
        siteCard.dataset.id = site.id;
        
        const escapedName = site.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        let faviconHtml;

        if (site.favicon) {
            faviconHtml = `<img data-src="${site.favicon}" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjFmMWYxIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZzwvdGV4dD4KPC9zdmc+" alt="${escapedName} favicon" onerror="handleFaviconError(this, '${escapedName}')">`;
        } else {
            faviconHtml = this._getFaviconPlaceholder(site.name);
        }
        
        siteCard.innerHTML = `<a href="${site.url}" class="site-link" aria-label="Go to ${escapedName}"><div class="site-icon">${faviconHtml}</div><span class="site-name">${site.name}</span></a><div class="site-actions"><button class="icon-button action-button site-menu-button" aria-label="Site options for ${escapedName}"><i class="fas fa-ellipsis-v"></i></button></div>`;
        
        if (site.favicon) {
            this.lazyLoadFavicon(siteCard, site.favicon);
        }
        
        siteCard.querySelector('.site-menu-button').addEventListener('click', (e) => {
            if (appState.isDragModeActive) { Toast.show("Exit drag mode to use menus!"); e.stopPropagation(); return; }
            e.stopPropagation();
            this.openActionMenu(e.currentTarget, site);
        });
        return siteCard;
    },

    lazyLoadFavicon(cardElement, faviconUrl) {
        if (!faviconUrl) return;
        
        const img = cardElement.querySelector('img[data-src]');
        if (!img) return;
        
        if (lazyLoadObserver) {
            lazyLoadObserver.observe(img);
        } else {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    },
    
    addSiteToGrid(site) {
        const siteCard = this._createSiteCard(site);
        const addCard = DOM.sitesGrid.querySelector('.add-site-card');
        DOM.sitesGrid.insertBefore(siteCard, addCard);
        CustomizationManager.applyAppearanceSettings();
        this.checkGridOverflow();
    },

    removeSiteFromGrid(siteId) {
        const siteCard = DOM.sitesGrid.querySelector(`.site-card[data-id='${siteId}']`);
        if (siteCard) {
            siteCard.remove();
            this.checkGridOverflow();
        }
    },

    updateSiteInGrid(site) {
        const oldCard = DOM.sitesGrid.querySelector(`.site-card[data-id='${site.id}']`);
        if (oldCard) {
            const newCard = this._createSiteCard(site);
            oldCard.parentNode.replaceChild(newCard, oldCard);
            CustomizationManager.applyAppearanceSettings();
        }
    },

    openActionMenu(menuButton, site) {
        this.closeActionMenu();
        const actionMenu = document.createElement('div');
        actionMenu.className = 'action-menu active';
        actionMenu.innerHTML = `<div class="action-item edit-site"><i class="fas fa-edit"></i> Edit</div><div class="action-item delete-site"><i class="fas fa-trash"></i> Delete</div>`;
        document.body.appendChild(actionMenu);
        currentSiteActionMenu = actionMenu;
        const rect = menuButton.getBoundingClientRect();
        actionMenu.style.top = `${rect.bottom + 5}px`;
        let leftPosition = rect.right - actionMenu.offsetWidth;
        const viewportWidth = window.innerWidth;
        if (leftPosition + actionMenu.offsetWidth > viewportWidth - 10) leftPosition = viewportWidth - actionMenu.offsetWidth - 10;
        if (leftPosition < 10) leftPosition = 10;
        actionMenu.style.left = `${leftPosition}px`;
        actionMenu.querySelector('.edit-site').addEventListener('click', (e) => { e.stopPropagation(); SiteModal.open(site); this.closeActionMenu(); });
        actionMenu.querySelector('.delete-site').addEventListener('click', (e) => { e.stopPropagation(); SiteManager.delete(site.id); this.closeActionMenu(); });
        DropdownManager.closeAll();
    },

    closeActionMenu() { if (currentSiteActionMenu) { currentSiteActionMenu.remove(); currentSiteActionMenu = null; } },
    
    delete(id) {
        appState.pinnedSites = appState.pinnedSites.filter(site => site.id != id);
        DebouncedSave.immediateSave();
        this.removeSiteFromGrid(id);
        if (DOM.allSitesModal.classList.contains('active')) {
            AllSitesModal.render();
        }
        SiteModal.close();
        Toast.show("Site deleted successfully!");
    },

    checkGridOverflow: Utils.debounce(() => {
        const grid = DOM.sitesGrid;
        const allSitesCard = document.getElementById('allSitesCard');
        if (!grid || !allSitesCard) return;

        const siteCards = Array.from(grid.querySelectorAll('.site-card[data-id]'));
        siteCards.forEach(card => card.style.display = 'flex');

        let isOverflowing = grid.scrollHeight > grid.clientHeight;

        if (isOverflowing) {
            allSitesCard.style.display = 'flex';
            for (let i = siteCards.length - 1; i >= 0; i--) {
                if (grid.scrollHeight <= grid.clientHeight) break;
                siteCards[i].style.display = 'none';
            }
        } else {
            allSitesCard.style.display = 'none';
        }
    }, 50),

    setupSortable() {
        if (mainSortable) mainSortable.destroy();
        if (!appState.isDragModeActive && DOM.sitesGrid) {
            mainSortable = createSortableGrid(DOM.sitesGrid, () => {
                const newOrderIds = Array.from(DOM.sitesGrid.children).filter(el => el.dataset.id).map(el => parseInt(el.dataset.id));
                const currentSites = [...appState.pinnedSites];
                appState.pinnedSites = newOrderIds.map(id => currentSites.find(s => s.id === id)).filter(Boolean);
                
                DebouncedSave.immediateSave();
                if (DOM.allSitesModal.classList.contains('active')) {
                    AllSitesModal.render();
                }
            });
        }
    },

    setupEventListeners() {
    }
};

const ModalManager = {
    open(modalElement) {
        modalElement.classList.add('active');
        DOM.body.classList.add('modal-active');
    },
    close(modalElement) {
        modalElement.classList.remove('active');
        DOM.body.classList.remove('modal-active');
    },
    handleOutsideClick(modalElement, contentSelector, ignoreSelectors = []) {
        return (e) => {
            if (modalElement.classList.contains('active') &&
                !modalElement.querySelector(contentSelector).contains(e.target) &&
                !ignoreSelectors.some(selector => e.target.closest(selector))) {
                this.close(modalElement);
            }
        };
    }
};

const SiteModal = {
    open(site = null) {
        DOM.modalTitle.textContent = site ? "Edit Site" : "Add New Site";
        DOM.siteNameInput.value = site ? site.name : "";
        DOM.siteUrlInput.value = site ? site.url : "";
        DOM.deleteSiteBtn.style.display = site ? "block" : "none";
        appState.editingSite = site;
        ModalManager.open(DOM.siteModal);
    },
    close() {
        ModalManager.close(DOM.siteModal);
        appState.editingSite = null;
    },
    async save() {
        const name = DOM.siteNameInput.value.trim(), url = DOM.siteUrlInput.value.trim();
        if (!name || !url) return Toast.show("Please fill in both fields");
        let processedUrl = !/^(https?:\/\/)/i.test(url) ? 'https://' + url : url;
        if (!this.isValidUrl(processedUrl)) return Toast.show("Please enter a valid URL.");

        if (appState.editingSite) {
            const siteIndex = appState.pinnedSites.findIndex(s => s.id === appState.editingSite.id);
            if (siteIndex !== -1) {
                const siteToUpdate = appState.pinnedSites[siteIndex];
                const urlChanged = siteToUpdate.url !== processedUrl;
                siteToUpdate.name = name;
                siteToUpdate.url = processedUrl;

                const updateDOM = (site) => {
                    SiteManager.updateSiteInGrid(site);
                    if (DOM.allSitesModal.classList.contains('active')) AllSitesModal.render();
                    DebouncedSave.immediateSave();
                    this.close();
                    Toast.show("Site updated successfully!");
                };

                if (urlChanged) {
                    const favicon = await this.fetchFavicon(processedUrl);
                    siteToUpdate.favicon = favicon;
                    updateDOM(siteToUpdate);
                } else {
                    updateDOM(siteToUpdate);
                }
            }
        } else {
            const newSite = { id: Date.now(), name, url: processedUrl, favicon: "" };
            appState.pinnedSites.push(newSite);
            SiteManager.addSiteToGrid(newSite);
            if (DOM.allSitesModal.classList.contains('active')) AllSitesModal.render();
            DebouncedSave.immediateSave();
            this.close();
            Toast.show("Site added successfully!");

            (async () => {
                const favicon = await this.fetchFavicon(processedUrl);
                if (favicon) {
                    const siteToUpdate = appState.pinnedSites.find(s => s.id === newSite.id);
                    if (siteToUpdate) {
                        siteToUpdate.favicon = favicon;
                        DebouncedSave.immediateSave();

                        const cardToUpdate = DOM.sitesGrid.querySelector(`.site-card[data-id='${newSite.id}']`);
                        if (cardToUpdate) {
                            const iconContainer = cardToUpdate.querySelector('.site-icon');
                            if (iconContainer) {
                                const escapedName = name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                                iconContainer.innerHTML = `<img src="${favicon}" alt="${escapedName} favicon" onerror="handleFaviconError(this, '${escapedName}')">`;
                            }
                        }
                    }
                }
            })();
        }
    },
    async fetchFavicon(url) {
        try {
            const domain = new URL(url).hostname;
            
            const cached = FaviconCache.get(domain);
            if (cached) return cached;
            
            const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            const imageDetails = await FaviconFixer._fetchImageAndGetDimensions(googleFaviconUrl);

            if (imageDetails.width === 16 && imageDetails.height === 16) {
                console.warn(`Google returned a 16x16 placeholder for ${domain}. Discarding it.`);
                return "";
            }

            FaviconCache.set(domain, imageDetails.url);
            FaviconCache.saveToStorage();
            
            return imageDetails.url;
        } catch (e) {
            console.error("Error fetching or validating favicon:", e);
            return "";
        }
    },
    isValidUrl(url) { 
        try { 
            const u = new URL(url); 
            return u.protocol === 'http:' || u.protocol === 'https:'; 
        } catch (e) { 
            return false; 
        } 
    },
    setupEventListeners() {
        DOM.closeModalBtn.addEventListener('click', this.close.bind(this));
        DOM.cancelModalBtn.addEventListener('click', this.close.bind(this));
        DOM.saveSiteBtn.addEventListener('click', this.save.bind(this));
        DOM.deleteSiteBtn.addEventListener('click', () => SiteManager.delete(appState.editingSite.id));
        const handleEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); this.save(); } };
        DOM.siteNameInput.addEventListener('keypress', handleEnter);
        DOM.siteUrlInput.addEventListener('keypress', handleEnter);
    }
};

const AllSitesModal = {
    open() {
        this.render();
        ModalManager.open(DOM.allSitesModal);
    },
    close() {
        ModalManager.close(DOM.allSitesModal);
        DOM.allSitesGrid.innerHTML = '';
    },
    render() {
        DOM.allSitesGrid.innerHTML = '';
        appState.pinnedSites.forEach(site => {
            const siteCard = SiteManager._createSiteCard(site);
            DOM.allSitesGrid.appendChild(siteCard);
        });
        CustomizationManager.applyAppearanceSettings();
        this.setupSortable();
    },
    setupSortable() {
        if (modalSortable) modalSortable.destroy();
        modalSortable = createSortableGrid(DOM.allSitesGrid, () => {
            const newOrderIds = Array.from(DOM.allSitesGrid.children).filter(el => el.dataset.id).map(el => parseInt(el.dataset.id));
            const newPinnedSites = [];
            newOrderIds.forEach(id => {
                const site = appState.pinnedSites.find(s => s.id === id);
                if (site) newPinnedSites.push(site);
            });
            appState.pinnedSites = newPinnedSites;
            DebouncedSave.immediateSave();
            SiteManager.renderPinnedSites();
        });
    },
    setupEventListeners() {
        DOM.closeAllSitesModalBtn.addEventListener('click', this.close.bind(this));
    }
};

const Toast = {
    show(message) {
        DOM.toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        DOM.toast.classList.add('show');
        setTimeout(() => DOM.toast.classList.remove('show'), 3000);
    }
};

const FaviconFixer = {
    abortController: null,

    _fetchImageAndGetDimensions(url) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            tempImg.crossOrigin = "Anonymous"; // Attempt to prevent CORS issues
            tempImg.onload = () => {
                resolve({ url, width: tempImg.naturalWidth, height: tempImg.naturalHeight });
                tempImg.src = '';
            };
            tempImg.onerror = () => {
                reject(new Error(`Failed to load image from ${url}`));
                tempImg.src = '';
            };
            tempImg.src = url;
        });
    },

    async _fetchFaviconFromHTML(url) {
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch HTML via proxy');
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const link = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            let faviconUrl = '';
            if (link && link.href) {
                faviconUrl = new URL(link.href, url).href;
            } else {
                const siteUrl = new URL(url).origin;
                faviconUrl = `${siteUrl}/favicon.ico`;
            }
            return this._fetchImageAndGetDimensions(faviconUrl);
        } catch (error) {
            throw new Error('HTML parsing failed');
        }
    },

    async _findBestFavicon(siteUrl) {
        const domain = new URL(siteUrl).hostname;

        try {
            const googleFaviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
            const googleResult = await this._fetchImageAndGetDimensions(googleFaviconUrl);
            const isGoogle16x16 = googleResult.width === 16 && googleResult.height === 16;
            
            if (!isGoogle16x16) return googleResult.url;
        } catch (error) {
            console.warn(`Google service failed for ${domain}. Falling back...`);
        }

        try {
            const htmlResult = await this._fetchFaviconFromHTML(siteUrl);
            return htmlResult.url;
        } catch (error) {
            console.warn(`HTML parsing failed for ${domain}. Falling back to placeholder...`);
        }

        return "";
    },   


    _showProgressIndicator() {
        DOM.progressModal.classList.add('active');
        DOM.body.classList.add('modal-active');
        this._updateProgress(0);
    },

    _hideProgressIndicator() {
        DOM.progressModal.classList.remove('active');
        DOM.body.classList.remove('modal-active');
    },

    _updateProgress(percentage) {
        const p = Math.round(percentage);
        DOM.progressText.textContent = `${p}%`;
        document.documentElement.style.setProperty('--progress-percentage', `${p * 3.6}deg`);
    },

    async run() {
        DropdownManager.closeAll();
        const allSites = [...appState.pinnedSites];
        const totalItems = allSites.length;

        if (totalItems === 0) {
            return Toast.show("No pinned sites to fix!");
        }

        this._showProgressIndicator();
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        let processedCount = 0;
        let wasCancelled = false;
        
        signal.addEventListener('abort', () => {
            wasCancelled = true;
        });

        for (const site of allSites) {
            if (signal.aborted) break;

            const bestIconUrl = await this._findBestFavicon(site.url);

            if (bestIconUrl && bestIconUrl !== site.favicon) {
                const siteToUpdate = appState.pinnedSites.find(s => s.id === site.id);
                if (siteToUpdate) {
                    siteToUpdate.favicon = bestIconUrl;
                    try {
                        const domain = new URL(site.url).hostname;
                        FaviconCache.set(domain, bestIconUrl);
                    } catch (e) {
                        console.warn('Could not update cache for:', site.url);
                    }
                }
            }
            
            processedCount++;
            this._updateProgress((processedCount / totalItems) * 100);
        }

        if (wasCancelled) {
            this._hideProgressIndicator();
            Toast.show("Icon fix cancelled!");
            this.abortController = null;
            return;
        }

        FaviconCache.saveToStorage();
        DebouncedSave.immediateSave();
        SiteManager.renderPinnedSites();
        if (DOM.allSitesModal.classList.contains('active')) {
            AllSitesModal.render();
        }

        setTimeout(() => {
            this._hideProgressIndicator();
            Toast.show("Icon fix complete!");
        }, 500);

        this.abortController = null;
    },

    cancel() {
        if (this.abortController) {
            this.abortController.abort();
        }
    },

    setupEventListeners() {
        DOM.fixIconsBtn.addEventListener('click', this.run.bind(this));
        DOM.cancelFixIconsBtn.addEventListener('click', this.cancel.bind(this));
    }
};

const DataManager = {
    exportSettings() {
        try {
            const stateToExport = { ...appState };

            delete stateToExport.searchEngineFavicons;

            const replacements = [];
            const placeholderPrefix = "##JSON_OBJECT_PLACEHOLDER_";

            const stateString = JSON.stringify(stateToExport, (key, value) => {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    const isSimpleObject = Object.values(value).every(
                        v => typeof v !== 'object' || v === null
                    );
                    
                    if (isSimpleObject) {
                        const compactJSON = JSON.stringify(value);
                        const placeholder = `${placeholderPrefix}${replacements.length}##`;
                        replacements.push({ placeholder: `"${placeholder}"`, value: compactJSON });
                        return placeholder;
                    }
                }
                return value;
            }, 2);

            let finalJsonString = stateString;
            replacements.forEach(rep => {
                finalJsonString = finalJsonString.replace(rep.placeholder, rep.value);
            });

            const blob = new Blob([finalJsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 10);
            a.download = `new-tab-settings-backup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            Toast.show("Settings exported successfully!");
        } catch (error) {
            console.error("Failed to export settings:", error);
            Toast.show("Error exporting settings.");
        }
    },
    
    importSettings() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const newState = JSON.parse(event.target.result);
                    if (newState.pinnedSites && newState.currentSearchEngine) {
                        localStorage.setItem('newTabState', JSON.stringify(newState));
                        Toast.show("Settings imported successfully! Reloading...");
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        throw new Error("Invalid settings file format.");
                    }
                } catch (error) {
                    console.error("Failed to import settings:", error);
                    Toast.show("Error: Invalid or corrupt settings file.");
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    },
    hardReset() {
        if (window.confirm("Are you sure you want to perform a hard reset? All your pinned sites and settings will be permanently deleted.")) {
            if (window.confirm("This action cannot be undone. Please confirm one last time.")) {
                localStorage.removeItem('newTabState');
                localStorage.removeItem('faviconCache');
                Toast.show("Reset successful! Reloading...");
                setTimeout(() => location.reload(), 1500);
            }
        }
    },
    setupEventListeners() {
        DOM.exportSettingsBtn.addEventListener('click', this.exportSettings.bind(this));
        DOM.importSettingsBtn.addEventListener('click', this.importSettings.bind(this));
        DOM.hardResetBtn.addEventListener('click', this.hardReset.bind(this));
    }
};

const QuoteManager = {
    init() {
        if (DOM.quoteText && typeof Typed !== 'undefined' && typeof quotes !== 'undefined') {
            new Typed('#quoteText', {
                strings: quotes,
                typeSpeed: 130,
                backSpeed: 30,
                startDelay: 2000,
                backDelay: 8000,
                loop: true,
                loopCount: Infinity,
                showCursor: false,
                cursorChar: "|",
                shuffle: true,
            });
        }
    }
};

ThemeManager.setupEventListeners();
DropdownManager.setupEventListeners();
VisibilityManager.setupEventListeners();
CustomizationManager.setupEventListeners();
PositionManager.setupEventListeners();
SearchManager.setupEventListeners();
SiteManager.setupEventListeners();
SiteModal.setupEventListeners();
AllSitesModal.setupEventListeners();
EditModeManager.setupEventListeners();
BlurManager.setupEventListeners();
FaviconFixer.setupEventListeners();
DataManager.setupEventListeners();