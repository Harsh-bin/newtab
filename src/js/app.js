// --- Core Application Logic & Managers ---

const App = {
    init() {
        FaviconCache.loadFromStorage();
        this.loadState();
        this.setupGlobalEventListeners();
        this.initializeUIComponents();
        this.setupBackgroundRefresh();
        this.initializeLazyLoader();
        this.setupAllEventListeners();
    },

    loadState() {
        const savedState = localStorage.getItem("newTabState");
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            const defaultPositions = {
                searchWrapper: { x: 50, y: 30, centered: true },
                pinnedSitesSection: { y: 45, width: 40, height: 30, centered: true },
                quoteBox: { x: 2, y: 2, width: 35, height: 8, centered: false },
            };
            const loadedPositions = { ...defaultPositions, ...(parsedState.movableElementPositions || {}) };

            appState = { ...appState, ...parsedState, movableElementPositions: loadedPositions };
            appState.searchHistory = parsedState.searchHistory || [];
            appState.lastVisitedLinkURL = parsedState.lastVisitedLinkURL || null;

            let loadedLinkHistory = parsedState.linkHistory || [];
            if (loadedLinkHistory.length > 0 && typeof loadedLinkHistory[0] === "string") {
                const migratedHistory = {};
                loadedLinkHistory.forEach((url) => {
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
        document.documentElement.style.setProperty("--side-panel-width", `${appState.sidePanelWidth}px`);
        if (appState.isDragModeActive) {
            appState.isDragModeActive = false;
            DOM.dragModeControls.style.display = "none";
        }
        if (appState.hidePinnedSites && appState.hideSearchBar) {
            Toast.show("Search Bar and Pinned Sites are hidden. You can show them from Settings.");
        }
    },

    saveState() {
        localStorage.setItem("newTabState", JSON.stringify(appState));
    },

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
        DOM.siteShapeRadios.forEach((radio) => {
            if (radio.value === appState.pinnedSiteShape) radio.checked = true;
        });
        DOM.searchRadiusSlider.value = appState.searchBarRadius;
        DOM.searchHeightSlider.value = appState.searchBarHeight;
        DOM.searchWidthSlider.value = appState.searchBarWidth;
        CustomizationManager.updateSliderValues();
        [DOM.searchRadiusSlider, DOM.searchHeightSlider, DOM.searchWidthSlider].forEach((slider) => CustomizationManager.updateSliderFill(slider));
        DOM.blurValueInput.value = appState.uiBlurAmount;
        setTimeout(() => {
            PositionManager.applyFreeMoveSettings();
            DOM.searchWrapper.style.opacity = "1";
            DOM.pinnedSitesSection.style.opacity = "1";
            DOM.quoteBox.style.opacity = "1";
        }, 50);
    },

    initializeLazyLoader() {
        if ("IntersectionObserver" in window) {
            lazyLoadObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute("data-src");
                                lazyLoadObserver.unobserve(img);
                            }
                        }
                    });
                },
                {
                    rootMargin: "50px 0px",
                    threshold: 0.1,
                }
            );
        }
    },

    setupBackgroundRefresh() {
        BackgroundManager.fetchRandom();
        window.addEventListener("beforeunload", () => localStorage.removeItem("lastBackground"));
    },

    setupGlobalEventListeners() {
        siteModalOutsideClickHandler = ModalManager.handleOutsideClick(DOM.siteModal, ".modal-content", [".site-card .action-button", ".action-item", ".add-site-card"]);
        allSitesModalOutsideClickHandler = ModalManager.handleOutsideClick(DOM.allSitesModal, ".modal-content", [".all-sites-card"]);

        document.addEventListener("click", (e) => {
            if (appState.isDragModeActive || appState.isResizeGridModeActive || DOM.body.classList.contains("resizing-panel") || DOM.body.classList.contains("resizing-grid")) return;
            DropdownManager.closeAll();
            siteModalOutsideClickHandler(e);
            allSitesModalOutsideClickHandler(e);
            SiteManager.closeActionMenu();
            if (DOM.suggestionsContainer && !DOM.searchContainer.contains(e.target) && !DOM.suggestionsContainer.contains(e.target)) {
                DOM.suggestionsContainer.innerHTML = "";
                DOM.suggestionsContainer.classList.remove("active");
            }
        });

        prefersDarkScheme.addEventListener("change", (e) => {
            if (appState.themePreference === "system") {
                ThemeManager.applyPreference("system");
            }
        });

        window.addEventListener(
            "resize",
            Utils.debounce(() => {
                PositionManager.applyFreeMoveSettings();
                SiteManager.checkGridOverflow();
            }, 50)
        );
    },
    
    setupAllEventListeners() {
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
    }
};