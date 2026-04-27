const STORAGE_KEYS = {
  settings: "party-pay-qr-settings",
  cart: "party-pay-qr-cart"
};

const ALLOWED_NOTE_ICONS = ["🍺", "🍸", "🍷", "🍹", "🥂"];
const DEFAULT_NOTE_ICONS = ["🍺", "🍸"];
const DEFAULT_PRESET_ITEMS = [
  { id: createId(), name: "Beer", price: 5 },
  { id: createId(), name: "Cocktail", price: 8 },
  { id: createId(), name: "Wine", price: 7 },
  { id: createId(), name: "Pizza", price: 4 },
  { id: createId(), name: "Snack", price: 3 }
];
const TIP_OPTIONS = [
  { id: "none", label: "No Tip", type: "percent", value: 0 },
  { id: "15", label: "15%", type: "percent", value: 0.15 },
  { id: "18", label: "18%", type: "percent", value: 0.18 },
  { id: "20", label: "20%", type: "percent", value: 0.2 },
  { id: "custom", label: "Custom", type: "custom", value: null }
];

const appState = {
  screen: "host",
  cart: [],
  settings: loadSettings(),
  tipSelection: "none",
  customTipAmount: 0,
  qrCode: null
};

const elements = {
  hostScreen: document.getElementById("hostScreen"),
  guestScreen: document.getElementById("guestScreen"),
  qrScreen: document.getElementById("qrScreen"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsToggle: document.getElementById("settingsToggle"),
  hostEditShortcut: document.getElementById("hostEditShortcut"),
  presetItems: document.getElementById("presetItems"),
  noteIconPicker: document.getElementById("noteIconPicker"),
  hostCartList: document.getElementById("hostCartList"),
  hostCartEmpty: document.getElementById("hostCartEmpty"),
  hostSubtotal: document.getElementById("hostSubtotal"),
  customItemForm: document.getElementById("customItemForm"),
  customItemName: document.getElementById("customItemName"),
  customItemPrice: document.getElementById("customItemPrice"),
  handToGuestButton: document.getElementById("handToGuestButton"),
  guestCartList: document.getElementById("guestCartList"),
  guestSubtotal: document.getElementById("guestSubtotal"),
  guestNotePreview: document.getElementById("guestNotePreview"),
  tipOptions: document.getElementById("tipOptions"),
  customTipLabel: document.getElementById("customTipLabel"),
  customTipInput: document.getElementById("customTipInput"),
  guestTip: document.getElementById("guestTip"),
  guestTotal: document.getElementById("guestTotal"),
  confirmTotalButton: document.getElementById("confirmTotalButton"),
  qrTotal: document.getElementById("qrTotal"),
  qrNotePreview: document.getElementById("qrNotePreview"),
  qrCode: document.getElementById("qrCode"),
  venmoUrlOutput: document.getElementById("venmoUrlOutput"),
  openVenmoButton: document.getElementById("openVenmoButton"),
  backToTipButton: document.getElementById("backToTipButton"),
  newOrderButton: document.getElementById("newOrderButton"),
  messageBanner: document.getElementById("messageBanner"),
  settingsForm: document.getElementById("settingsForm"),
  venmoUsernameInput: document.getElementById("venmoUsernameInput"),
  settingsNotePicker: document.getElementById("settingsNotePicker"),
  resetDefaultsButton: document.getElementById("resetDefaultsButton"),
  settingsPresetList: document.getElementById("settingsPresetList"),
  settingsPresetForm: document.getElementById("settingsPresetForm"),
  settingsPresetName: document.getElementById("settingsPresetName"),
  settingsPresetPrice: document.getElementById("settingsPresetPrice")
};

function init() {
  appState.cart = loadCart();
  bindEvents();
  renderAll();
  registerServiceWorker();
}

function bindEvents() {
  elements.customItemForm.addEventListener("submit", handleCustomItemSubmit);
  elements.handToGuestButton.addEventListener("click", goToGuestScreen);
  elements.tipOptions.addEventListener("click", handleTipClick);
  elements.customTipInput.addEventListener("input", handleCustomTipChange);
  elements.confirmTotalButton.addEventListener("click", goToQrScreen);
  elements.backToTipButton.addEventListener("click", () => switchScreen("guest"));
  elements.newOrderButton.addEventListener("click", resetOrder);
  elements.settingsToggle.addEventListener("click", toggleSettings);
  elements.hostEditShortcut.addEventListener("click", () => switchScreen("host"));
  elements.settingsForm.addEventListener("submit", handleSettingsSave);
  elements.resetDefaultsButton.addEventListener("click", resetDefaultSettings);
  elements.settingsPresetForm.addEventListener("submit", handleSettingsPresetAdd);
}

function renderAll() {
  renderPresetItems();
  renderHostNotePicker();
  renderSettingsNotePicker();
  renderHostCart();
  renderGuestCart();
  renderTipOptions();
  renderSettingsForm();
  renderSettingsPresetList();
  updateSummary();
  updateScreen();
}

function renderPresetItems() {
  elements.presetItems.innerHTML = "";

  appState.settings.presetItems.forEach((item) => {
    const button = document.createElement("button");
    button.className = "preset-button";
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(item.name)}</strong><span>${formatCurrency(item.price)}</span>`;
    button.addEventListener("click", () => addItemToCart(item.name, item.price));
    elements.presetItems.appendChild(button);
  });
}

function renderHostNotePicker() {
  renderEmojiPicker(elements.noteIconPicker, appState.settings.selectedNoteIcons, (icon) => {
    const selectedIcons = new Set(appState.settings.selectedNoteIcons);

    if (selectedIcons.has(icon)) {
      selectedIcons.delete(icon);
    } else {
      selectedIcons.add(icon);
    }

    appState.settings.selectedNoteIcons = ALLOWED_NOTE_ICONS.filter((entry) => selectedIcons.has(entry));
    saveSettings();
    updateSummary();
    renderHostNotePicker();
    renderSettingsNotePicker();
  });
}

function renderSettingsNotePicker() {
  renderEmojiPicker(elements.settingsNotePicker, appState.settings.defaultNoteIcons, (icon) => {
    const selectedIcons = new Set(appState.settings.defaultNoteIcons);

    if (selectedIcons.has(icon)) {
      selectedIcons.delete(icon);
    } else {
      selectedIcons.add(icon);
    }

    appState.settings.defaultNoteIcons = ALLOWED_NOTE_ICONS.filter((entry) => selectedIcons.has(entry));
    renderSettingsNotePicker();
  });
}

function renderEmojiPicker(container, selectedIcons, onToggle) {
  container.innerHTML = "";
  ALLOWED_NOTE_ICONS.forEach((icon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `emoji-button ${selectedIcons.includes(icon) ? "selected" : ""}`;
    button.textContent = icon;
    button.setAttribute("aria-pressed", selectedIcons.includes(icon) ? "true" : "false");
    button.addEventListener("click", () => onToggle(icon));
    container.appendChild(button);
  });
}

function renderHostCart() {
  const hasItems = appState.cart.length > 0;
  elements.hostCartEmpty.classList.toggle("hidden", hasItems);
  elements.hostCartList.innerHTML = "";

  appState.cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-meta">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${item.quantity} × ${formatCurrency(item.price)} · ${formatCurrency(item.price * item.quantity)}</p>
      </div>
      <div class="cart-controls">
        <button class="stepper-button" type="button" aria-label="Decrease ${escapeHtml(item.name)}">-</button>
        <span class="quantity-badge">${item.quantity}</span>
        <button class="stepper-button" type="button" aria-label="Increase ${escapeHtml(item.name)}">+</button>
        <button class="remove-button" type="button" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
      </div>
    `;

    const [decreaseButton, increaseButton, removeButton] = row.querySelectorAll("button");
    decreaseButton.addEventListener("click", () => updateCartItemQuantity(item.id, item.quantity - 1));
    increaseButton.addEventListener("click", () => updateCartItemQuantity(item.id, item.quantity + 1));
    removeButton.addEventListener("click", () => removeCartItem(item.id));

    elements.hostCartList.appendChild(row);
  });
}

function renderGuestCart() {
  elements.guestCartList.innerHTML = "";

  if (appState.cart.length === 0) {
    elements.guestCartList.innerHTML = `<div class="empty-state"><p>No items in this reimbursement yet.</p></div>`;
    return;
  }

  appState.cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-meta">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${item.quantity} × ${formatCurrency(item.price)}</p>
      </div>
      <strong>${formatCurrency(item.price * item.quantity)}</strong>
    `;
    elements.guestCartList.appendChild(row);
  });
}

function renderTipOptions() {
  elements.tipOptions.innerHTML = "";

  TIP_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tip-button ${appState.tipSelection === option.id ? "selected" : ""}`;
    button.dataset.tipId = option.id;
    button.innerHTML = `<strong>${option.label}</strong><span>${tipDescription(option)}</span>`;
    elements.tipOptions.appendChild(button);
  });

  elements.customTipLabel.classList.toggle("hidden", appState.tipSelection !== "custom");
  elements.customTipInput.value = appState.tipSelection === "custom" && appState.customTipAmount > 0
    ? appState.customTipAmount.toFixed(2)
    : "";
}

function renderSettingsForm() {
  elements.venmoUsernameInput.value = appState.settings.venmoUsername;
}

function renderSettingsPresetList() {
  elements.settingsPresetList.innerHTML = "";

  appState.settings.presetItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "preset-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${formatCurrency(item.price)}</p>
      </div>
      <div class="preset-row-actions">
        <button class="stepper-button" type="button">Rename</button>
        <button class="stepper-button" type="button">Price</button>
        <button class="remove-button" type="button">Delete</button>
      </div>
    `;

    const [renameButton, priceButton, deleteButton] = row.querySelectorAll("button");

    renameButton.addEventListener("click", () => {
      const nextName = window.prompt("Preset item name", item.name);
      if (nextName === null) {
        return;
      }
      const trimmed = nextName.trim();
      if (!trimmed) {
        showMessage("Preset item name cannot be empty.");
        return;
      }
      item.name = trimmed;
      saveSettings();
      renderAll();
    });

    priceButton.addEventListener("click", () => {
      const nextPrice = window.prompt("Preset item price", item.price.toFixed(2));
      if (nextPrice === null) {
        return;
      }
      const parsed = Number.parseFloat(nextPrice);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        showMessage("Preset item price must be greater than zero.");
        return;
      }
      item.price = roundMoney(parsed);
      saveSettings();
      renderAll();
    });

    deleteButton.addEventListener("click", () => {
      appState.settings.presetItems = appState.settings.presetItems.filter((entry) => entry.id !== item.id);
      saveSettings();
      renderAll();
    });

    elements.settingsPresetList.appendChild(row);
  });
}

function updateSummary() {
  const subtotal = getSubtotal();
  const tip = getTipAmount();
  const total = roundMoney(subtotal + tip);
  const note = getCurrentNote();
  const venmoUrl = getVenmoUrl(total, note);

  elements.hostSubtotal.textContent = formatCurrency(subtotal);
  elements.guestSubtotal.textContent = formatCurrency(subtotal);
  elements.guestTip.textContent = formatCurrency(tip);
  elements.guestTotal.textContent = formatCurrency(total);
  elements.guestNotePreview.textContent = note || "No icons selected";
  elements.qrTotal.textContent = formatCurrency(total);
  elements.qrNotePreview.textContent = note || "No icons selected";
  elements.venmoUrlOutput.value = venmoUrl;
  elements.openVenmoButton.href = venmoUrl;
  elements.handToGuestButton.disabled = subtotal <= 0;
  elements.confirmTotalButton.disabled = subtotal <= 0 || (appState.tipSelection === "custom" && appState.customTipAmount < 0);

  if (appState.screen === "qr") {
    renderQrCode(venmoUrl);
  }
}

function updateScreen() {
  elements.hostScreen.classList.toggle("hidden", appState.screen !== "host");
  elements.guestScreen.classList.toggle("hidden", appState.screen !== "guest");
  elements.qrScreen.classList.toggle("hidden", appState.screen !== "qr");
  elements.settingsToggle.classList.toggle("hidden", appState.screen !== "host");
  elements.hostEditShortcut.classList.toggle("hidden", appState.screen === "host");

  if (appState.screen === "qr") {
    renderQrCode(elements.venmoUrlOutput.value);
  }
}

function addItemToCart(name, price) {
  const existing = appState.cart.find((item) => item.name === name && item.price === price);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.cart.push({
      id: createId(),
      name,
      price: roundMoney(price),
      quantity: 1
    });
  }
  persistCart();
  renderAll();
}

function updateCartItemQuantity(id, nextQuantity) {
  if (nextQuantity <= 0) {
    removeCartItem(id);
    return;
  }

  const item = appState.cart.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  item.quantity = nextQuantity;
  persistCart();
  renderAll();
}

function removeCartItem(id) {
  appState.cart = appState.cart.filter((item) => item.id !== id);
  persistCart();
  renderAll();
}

function handleCustomItemSubmit(event) {
  event.preventDefault();
  const name = elements.customItemName.value.trim();
  const price = Number.parseFloat(elements.customItemPrice.value);

  if (!name) {
    showMessage("Custom item name is required.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showMessage("Custom item price must be greater than zero.");
    return;
  }

  addItemToCart(name, price);
  elements.customItemForm.reset();
  showMessage("Custom item added.", true);
}

function handleTipClick(event) {
  const button = event.target.closest("[data-tip-id]");
  if (!button) {
    return;
  }

  appState.tipSelection = button.dataset.tipId;
  if (appState.tipSelection !== "custom") {
    appState.customTipAmount = 0;
  }
  renderTipOptions();
  updateSummary();
}

function handleCustomTipChange(event) {
  const parsed = Number.parseFloat(event.target.value);
  if (event.target.value === "") {
    appState.customTipAmount = 0;
  } else if (!Number.isFinite(parsed) || parsed < 0) {
    appState.customTipAmount = -1;
    showMessage("Custom tip cannot be below zero.");
  } else {
    appState.customTipAmount = roundMoney(parsed);
  }
  updateSummary();
}

function handleSettingsSave(event) {
  event.preventDefault();
  const username = elements.venmoUsernameInput.value.trim();

  if (!username) {
    showMessage("Venmo username is required.");
    return;
  }

  appState.settings.venmoUsername = username.replace(/^@/, "");
  appState.settings.defaultNoteIcons = sanitizeIcons(appState.settings.defaultNoteIcons);
  appState.settings.selectedNoteIcons = sanitizeIcons(appState.settings.selectedNoteIcons);

  if (appState.settings.defaultNoteIcons.length === 0) {
    appState.settings.defaultNoteIcons = [...DEFAULT_NOTE_ICONS];
  }

  if (appState.settings.selectedNoteIcons.length === 0) {
    appState.settings.selectedNoteIcons = [...appState.settings.defaultNoteIcons];
  }

  saveSettings();
  renderAll();
  showMessage("Settings saved on this device.", true);
}

function handleSettingsPresetAdd(event) {
  event.preventDefault();
  const name = elements.settingsPresetName.value.trim();
  const price = Number.parseFloat(elements.settingsPresetPrice.value);

  if (!name) {
    showMessage("Preset item name is required.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showMessage("Preset item price must be greater than zero.");
    return;
  }

  appState.settings.presetItems.push({
    id: createId(),
    name,
    price: roundMoney(price)
  });
  saveSettings();
  elements.settingsPresetForm.reset();
  renderAll();
  showMessage("Preset item added.", true);
}

function resetDefaultSettings() {
  appState.settings = getDefaultSettings();
  saveSettings();
  renderAll();
  showMessage("Settings reset to the built-in defaults.", true);
}

function switchScreen(screen) {
  appState.screen = screen;
  updateScreen();
}

function goToGuestScreen() {
  if (getSubtotal() <= 0) {
    showMessage("Add at least one item before handing to the guest.");
    return;
  }
  switchScreen("guest");
}

function goToQrScreen() {
  if (getSubtotal() <= 0) {
    showMessage("This reimbursement is empty.");
    return;
  }

  if (appState.tipSelection === "custom" && appState.customTipAmount < 0) {
    showMessage("Custom tip cannot be below zero.");
    return;
  }

  switchScreen("qr");
}

function resetOrder() {
  appState.cart = [];
  appState.tipSelection = "none";
  appState.customTipAmount = 0;
  appState.screen = "host";
  appState.settings.selectedNoteIcons = [...appState.settings.defaultNoteIcons];
  persistCart();
  saveSettings();
  renderAll();
  showMessage("New order started.", true);
}

function toggleSettings() {
  elements.settingsPanel.classList.toggle("hidden");
}

function getSubtotal() {
  return roundMoney(appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
}

function getTipAmount() {
  if (appState.tipSelection === "custom") {
    return appState.customTipAmount > 0 ? roundMoney(appState.customTipAmount) : 0;
  }

  const selected = TIP_OPTIONS.find((option) => option.id === appState.tipSelection);
  const subtotal = getSubtotal();
  return selected ? roundMoney(subtotal * selected.value) : 0;
}

function getCurrentNote() {
  return sanitizeIcons(appState.settings.selectedNoteIcons).join("");
}

function getVenmoUrl(total, note) {
  const amount = roundMoney(total).toFixed(2);
  const params = new URLSearchParams({
    txn: "pay",
    amount,
    note
  });
  return `https://venmo.com/${encodeURIComponent(appState.settings.venmoUsername)}?${params.toString()}`;
}

function renderQrCode(url) {
  elements.qrCode.innerHTML = "";

  if (typeof QRCode !== "function") {
    const fallback = document.createElement("p");
    fallback.className = "qr-help";
    fallback.textContent = "QR library did not load. You can still use the Venmo URL below.";
    elements.qrCode.appendChild(fallback);
    return;
  }

  appState.qrCode = new QRCode(elements.qrCode, {
    text: url,
    width: 240,
    height: 240,
    colorDark: "#0b0e13",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) {
      return getDefaultSettings();
    }

    const parsed = JSON.parse(raw);
    return {
      venmoUsername: typeof parsed.venmoUsername === "string" && parsed.venmoUsername.trim()
        ? parsed.venmoUsername.trim().replace(/^@/, "")
        : "captkamikaze",
      presetItems: Array.isArray(parsed.presetItems) && parsed.presetItems.length
        ? parsed.presetItems
            .map((item) => ({
              id: item.id || createId(),
              name: String(item.name || "").trim(),
              price: roundMoney(Number(item.price))
            }))
            .filter((item) => item.name && item.price > 0)
        : DEFAULT_PRESET_ITEMS.map(cloneItem),
      defaultNoteIcons: sanitizeIcons(parsed.defaultNoteIcons).length
        ? sanitizeIcons(parsed.defaultNoteIcons)
        : [...DEFAULT_NOTE_ICONS],
      selectedNoteIcons: sanitizeIcons(parsed.selectedNoteIcons).length
        ? sanitizeIcons(parsed.selectedNoteIcons)
        : [...DEFAULT_NOTE_ICONS]
    };
  } catch (error) {
    return getDefaultSettings();
  }
}

function saveSettings() {
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(appState.settings));
}

function loadCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .map((item) => ({
            id: item.id || createId(),
            name: String(item.name || "").trim(),
            price: roundMoney(Number(item.price)),
            quantity: Number.parseInt(item.quantity, 10)
          }))
          .filter((item) => item.name && item.price > 0 && item.quantity > 0)
      : [];
  } catch (error) {
    return [];
  }
}

function persistCart() {
  window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(appState.cart));
}

function getDefaultSettings() {
  return {
    venmoUsername: "captkamikaze",
    presetItems: DEFAULT_PRESET_ITEMS.map(cloneItem),
    defaultNoteIcons: [...DEFAULT_NOTE_ICONS],
    selectedNoteIcons: [...DEFAULT_NOTE_ICONS]
  };
}

function sanitizeIcons(icons) {
  return Array.isArray(icons)
    ? ALLOWED_NOTE_ICONS.filter((icon) => icons.includes(icon))
    : [];
}

function tipDescription(option) {
  if (option.id === "custom") {
    return "Enter your own dollar amount";
  }
  return option.value === 0 ? "No extra tip" : `Adds ${Math.round(option.value * 100)}%`;
}

function showMessage(message, isSuccess = false) {
  elements.messageBanner.textContent = message;
  elements.messageBanner.classList.remove("hidden", "success");
  if (isSuccess) {
    elements.messageBanner.classList.add("success");
  }
  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    elements.messageBanner.classList.add("hidden");
  }, 2600);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Ignore registration errors for local previews.
    });
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(roundMoney(value));
}

function createId() {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneItem(item) {
  return {
    id: createId(),
    name: item.name,
    price: item.price
  };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();
