/**
 * Manages theme switching (dark, light, system) and related UI elements.
 */
const ThemeManager = {
    applyPreference(preference) {
        appState.themePreference = preference;
        let themeToApply = preference === "system" ? (prefersDarkScheme.matches ? "dark" : "light") : preference;
        DOM.body.setAttribute("data-theme", themeToApply);
        this.updateThemeIcon(preference);
        DebouncedSave.immediateSave();
    },

    setTheme(preference) {
        this.applyPreference(preference);
    },

    updateThemeIcon(preference) {
        const icon = DOM.themeBtn.querySelector("i");
        switch (preference) {
            case "dark":
                icon.className = "fas fa-moon";
                break;
            case "light":
                icon.className = "fas fa-sun";
                break;
            case "system":
                icon.className = "fas fa-desktop";
                break;
            default:
                icon.className = prefersDarkScheme.matches ? "fas fa-moon" : "fas fa-sun";
                break;
        }
    },

    applyGridTransparency() {
        DOM.pinnedSitesSection.classList.toggle("grid-transparent", appState.isGridTransparent);
    },

    toggleGridTransparency() {
        appState.isGridTransparent = DOM.toggleTransparentGrid.checked;
        this.applyGridTransparency();
        DebouncedSave.immediateSave();
        Toast.show(`Grid background ${appState.isGridTransparent ? "hidden" : "visible"}`);
    },

    setupEventListeners() {
        DOM.themeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            SiteManager.closeActionMenu();
            DropdownManager.toggle(DOM.themeDropdown);
        });
        DOM.themeDropdown.querySelectorAll(".dropdown-item[data-theme-preference]").forEach((item) => {
            item.addEventListener("click", (e) => {
                ThemeManager.setTheme(e.currentTarget.dataset.themePreference);
                DropdownManager.closeAll();
            });
        });
        DOM.toggleTransparentGrid.addEventListener("change", this.toggleGridTransparency.bind(this));
    },
};

/**
 * Manages the frosted glass (blur) effect on UI elements.
 */
const BlurManager = {
    applySettings() {
        DOM.body.classList.toggle("blur-enabled", appState.isBlurEnabled);
        document.documentElement.style.setProperty("--ui-blur-amount", `${appState.uiBlurAmount}px`);
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
        DOM.toggleBlur.addEventListener("change", this.toggleBlur.bind(this));
        DOM.blurValueInput.addEventListener("input", this.updateBlurAmount.bind(this));
        DOM.resetBlurBtn.addEventListener("click", this.resetToDefault.bind(this));
    },
};