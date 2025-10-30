/**
 * Handles the logic for opening, closing, and positioning dropdown menus.
 */
const DropdownManager = {
  toggle(dropdownElement, positioningCallback = null) {
    this.closeAll(dropdownElement);
    if (positioningCallback && !dropdownElement.classList.contains("active")) {
      positioningCallback();
    }
    dropdownElement.classList.toggle("active");
  },

  closeAll(excludeDropdown = null) {
    [DOM.themeDropdown, DOM.settingsDropdown, DOM.engineDropdown].forEach((dropdown) => {
      if (dropdown && dropdown !== excludeDropdown) dropdown.classList.remove("active");
    });
  },

  setupEventListeners() {
    DOM.googleAppsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      SiteManager.closeActionMenu();
      DropdownManager.toggle(DOM.googleAppsDropdown);
    });
    DOM.settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      SiteManager.closeActionMenu();
      DropdownManager.toggle(DOM.settingsDropdown);
    });
  },
};

const VisibilityManager = {
  applySettings() {
    DOM.searchContainer.classList.toggle("hidden", appState.hideSearchBar);
    DOM.pinnedSitesSection.classList.toggle("hidden", appState.hidePinnedSites);
    DOM.quoteBox.classList.toggle("hidden", appState.hideQuoteBox);
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
    DOM.togglePinnedSites.addEventListener("change", this.togglePinnedSites.bind(this));
    DOM.toggleSearchBar.addEventListener("change", this.toggleSearchBar.bind(this));
    DOM.toggleQuoteBox.addEventListener("change", this.toggleQuoteBox.bind(this));
  },
};

const EditModeManager = {
  applySettings() {
    DOM.body.classList.toggle("edit-mode-active", appState.isEditModeActive);
  },

  toggleEditMode() {
    appState.isEditModeActive = DOM.toggleEditSites.checked;
    this.applySettings();
    DebouncedSave.immediateSave();
    Toast.show(`Edit Mode ${appState.isEditModeActive ? "enabled" : "disabled"}`);
  },

  setupEventListeners() {
    DOM.toggleEditSites.addEventListener("change", this.toggleEditMode.bind(this));
  },
};

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

const Toast = {
  show(message) {
    DOM.toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    DOM.toast.classList.add("show");
    setTimeout(() => DOM.toast.classList.remove("show"), 3000);
  },
};