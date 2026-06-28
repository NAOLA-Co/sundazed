const STORAGE_KEYS = {
  settings: "party-pay-qr-settings",
  cart: "party-pay-qr-cart",
  report: "party-pay-qr-report"
};

const ALLOWED_NOTE_ICONS = ["☀️", "🎉", "🍺", "🍸", "🥂"];
const DEFAULT_NOTE_ICONS = ["☀️", "🎉"];
const DEFAULT_SUPABASE_URL = "https://unpqtfqjxvbijigttdhc.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_76GzVg3VQq-sgUjytYWsRg_qOBC3jPv";
const DEFAULT_WORKSPACE_KEY = "sundazed-main";
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
  report: loadReport(),
  tipSelection: "none",
  customTipAmount: 0,
  qrCode: null,
  hostAdminOpen: false,
  adminTab: "items",
  draggedPresetItemId: null,
  itemModalMode: null,
  supabaseClient: null
};

const elements = {
  hostScreen: document.getElementById("hostScreen"),
  guestScreen: document.getElementById("guestScreen"),
  qrScreen: document.getElementById("qrScreen"),
  hostComposerView: document.getElementById("hostComposerView"),
  hostAdminView: document.getElementById("hostAdminView"),
  itemsPanel: document.getElementById("itemsPanel"),
  reportPanel: document.getElementById("reportPanel"),
  advancedPanel: document.getElementById("advancedPanel"),
  settingsToggle: document.getElementById("settingsToggle"),
  itemsTabButton: document.getElementById("itemsTabButton"),
  reportTabButton: document.getElementById("reportTabButton"),
  advancedTabButton: document.getElementById("advancedTabButton"),
  hostEditShortcut: document.getElementById("hostEditShortcut"),
  presetItems: document.getElementById("presetItems"),
  hostCartList: document.getElementById("hostCartList"),
  hostCartEmpty: document.getElementById("hostCartEmpty"),
  hostSubtotal: document.getElementById("hostSubtotal"),
  reportOrderCount: document.getElementById("reportOrderCount"),
  reportRevenue: document.getElementById("reportRevenue"),
  reportSubtotal: document.getElementById("reportSubtotal"),
  reportTips: document.getElementById("reportTips"),
  reportTopItems: document.getElementById("reportTopItems"),
  reportRecentOrders: document.getElementById("reportRecentOrders"),
  clearReportButton: document.getElementById("clearReportButton"),
  saveItemsButton: document.getElementById("saveItemsButton"),
  handToGuestButton: document.getElementById("handToGuestButton"),
  guestCartList: document.getElementById("guestCartList"),
  guestSubtotal: document.getElementById("guestSubtotal"),
  guestSummarySubtotal: document.getElementById("guestSummarySubtotal"),
  qrNoteEditorPreview: document.getElementById("qrNoteEditorPreview"),
  guestNotePicker: document.getElementById("guestNotePicker"),
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
  markPaidButton: document.getElementById("markPaidButton"),
  backToTipButton: document.getElementById("backToTipButton"),
  newOrderButton: document.getElementById("newOrderButton"),
  messageBanner: document.getElementById("messageBanner"),
  settingsForm: document.getElementById("settingsForm"),
  venmoUsernameInput: document.getElementById("venmoUsernameInput"),
  supabaseUrlInput: document.getElementById("supabaseUrlInput"),
  supabaseKeyInput: document.getElementById("supabaseKeyInput"),
  workspaceKeyInput: document.getElementById("workspaceKeyInput"),
  settingsNotePicker: document.getElementById("settingsNotePicker"),
  resetDefaultsButton: document.getElementById("resetDefaultsButton"),
  settingsPresetList: document.getElementById("settingsPresetList"),
  itemModal: document.getElementById("itemModal"),
  itemModalForm: document.getElementById("itemModalForm"),
  itemModalTitle: document.getElementById("itemModalTitle"),
  itemModalCopy: document.getElementById("itemModalCopy"),
  itemModalName: document.getElementById("itemModalName"),
  itemModalPrice: document.getElementById("itemModalPrice"),
  itemModalSubmit: document.getElementById("itemModalSubmit"),
  closeItemModalButton: document.getElementById("closeItemModalButton")
};

function init() {
  appState.cart = loadCart();
  appState.supabaseClient = createSupabaseClient();
  bindEvents();
  renderAll();
  registerServiceWorker();
  syncFromCloudOnLoad();
}

function bindEvents() {
  elements.itemModalForm.addEventListener("submit", handleItemModalSubmit);
  elements.closeItemModalButton.addEventListener("click", closeItemModal);
  elements.itemModal.addEventListener("click", handleModalBackdropClick);
  elements.handToGuestButton.addEventListener("click", goToGuestScreen);
  elements.tipOptions.addEventListener("click", handleTipClick);
  elements.customTipInput.addEventListener("input", handleCustomTipChange);
  elements.confirmTotalButton.addEventListener("click", goToQrScreen);
  elements.markPaidButton.addEventListener("click", markOrderPaid);
  elements.backToTipButton.addEventListener("click", () => switchScreen("guest"));
  elements.newOrderButton.addEventListener("click", resetOrder);
  elements.settingsToggle.addEventListener("click", toggleSettings);
  elements.itemsTabButton.addEventListener("click", () => switchAdminTab("items"));
  elements.reportTabButton.addEventListener("click", () => switchAdminTab("report"));
  elements.advancedTabButton.addEventListener("click", () => switchAdminTab("advanced"));
  elements.hostEditShortcut.addEventListener("click", () => switchScreen("host"));
  elements.clearReportButton.addEventListener("click", clearReport);
  elements.saveItemsButton.addEventListener("click", handleItemSettingsSave);
  elements.settingsForm.addEventListener("submit", handleSettingsSave);
  elements.resetDefaultsButton.addEventListener("click", resetDefaultSettings);
}

function renderAll() {
  renderPresetItems();
  renderSettingsNotePicker();
  renderHostCart();
  renderGuestCart();
  renderGuestNotePicker();
  renderTipOptions();
  renderSettingsForm();
  renderSettingsPresetList();
  renderReport();
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

  const customButton = document.createElement("button");
  customButton.className = "preset-button";
  customButton.type = "button";
  customButton.innerHTML = "<strong>Custom</strong><span>Add your own item</span>";
  customButton.addEventListener("click", () => openItemModal("custom"));
  elements.presetItems.appendChild(customButton);
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

function renderGuestNotePicker() {
  renderEmojiPicker(elements.guestNotePicker, appState.settings.selectedNoteIcons, (icon) => {
    const selectedIcons = new Set(appState.settings.selectedNoteIcons);

    if (selectedIcons.has(icon)) {
      selectedIcons.delete(icon);
    } else {
      selectedIcons.add(icon);
    }

    appState.settings.selectedNoteIcons = ALLOWED_NOTE_ICONS.filter((entry) => selectedIcons.has(entry));
    saveSettings();
    updateSummary();
    renderGuestNotePicker();
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
    row.className = "cart-item host-cart-item";
    row.innerHTML = `
      <div class="cart-meta">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${item.quantity} × ${formatCurrency(item.price)}</p>
        <span class="cart-line-total">${formatCurrency(item.price * item.quantity)}</span>
      </div>
      <div class="cart-controls">
        <button class="stepper-button" type="button" aria-label="Decrease ${escapeHtml(item.name)}">-</button>
        <span class="quantity-badge">${item.quantity}</span>
        <button class="stepper-button" type="button" aria-label="Increase ${escapeHtml(item.name)}">+</button>
      </div>
    `;

    const [decreaseButton, increaseButton] = row.querySelectorAll("button");
    decreaseButton.addEventListener("click", () => updateCartItemQuantity(item.id, item.quantity - 1));
    increaseButton.addEventListener("click", () => updateCartItemQuantity(item.id, item.quantity + 1));
    bindSwipeToRemove(row, item);

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
  const subtotal = getSubtotal();

  TIP_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tip-button ${appState.tipSelection === option.id ? "selected" : ""}`;
    button.dataset.tipId = option.id;
    const tipAmount = option.type === "percent"
      ? formatCurrency(roundMoney(subtotal * option.value))
      : "Enter amount";
    button.innerHTML = `<strong>${option.label}</strong><span>${tipAmount}</span>`;
    elements.tipOptions.appendChild(button);
  });

  elements.customTipLabel.classList.toggle("hidden", appState.tipSelection !== "custom");
  elements.customTipInput.value = appState.tipSelection === "custom" && appState.customTipAmount > 0
    ? appState.customTipAmount.toFixed(2)
    : "";
}

function renderSettingsForm() {
  elements.venmoUsernameInput.value = appState.settings.venmoUsername;
  elements.supabaseUrlInput.value = appState.settings.supabaseUrl || "";
  elements.supabaseKeyInput.value = appState.settings.supabaseKey || "";
  elements.workspaceKeyInput.value = appState.settings.workspaceKey || "";
}

function renderSettingsPresetList() {
  elements.settingsPresetList.innerHTML = "";

  appState.settings.presetItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "preset-row";
    row.draggable = true;
    row.dataset.presetId = item.id;
    row.innerHTML = `
      <div class="preset-row-main">
        <span class="drag-handle" aria-hidden="true">☰</span>
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${formatCurrency(item.price)}</p>
        </div>
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

    row.addEventListener("dragstart", (event) => {
      appState.draggedPresetItemId = item.id;
      row.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.id);
    });

    row.addEventListener("dragend", () => {
      appState.draggedPresetItemId = null;
      clearPresetDragState();
      row.classList.remove("dragging");
    });

    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!appState.draggedPresetItemId || appState.draggedPresetItemId === item.id) {
        return;
      }
      event.dataTransfer.dropEffect = "move";
      clearPresetDragState();
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedId = appState.draggedPresetItemId;
      clearPresetDragState();
      if (!draggedId || draggedId === item.id) {
        return;
      }
      reorderPresetItems(draggedId, item.id);
    });

    elements.settingsPresetList.appendChild(row);
  });

  const addRow = document.createElement("button");
  addRow.id = "openPresetModalButton";
  addRow.className = "preset-row preset-add-row";
  addRow.type = "button";
  addRow.setAttribute("aria-label", "Add preset item");
  addRow.innerHTML = `
    <div class="preset-row-main">
      <span class="drag-handle add-row-icon" aria-hidden="true">+</span>
      <div>
        <strong>Add Item</strong>
      </div>
    </div>
  `;
  addRow.addEventListener("click", () => openItemModal("preset"));
  elements.settingsPresetList.appendChild(addRow);
}

function reorderPresetItems(draggedId, targetId) {
  const items = [...appState.settings.presetItems];
  const draggedIndex = items.findIndex((entry) => entry.id === draggedId);
  const targetIndex = items.findIndex((entry) => entry.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return;
  }

  const [draggedItem] = items.splice(draggedIndex, 1);
  items.splice(targetIndex, 0, draggedItem);
  appState.settings.presetItems = items;
  saveSettings();
  renderAll();
  showMessage("Preset item order updated.", true);
}

function clearPresetDragState() {
  elements.settingsPresetList.querySelectorAll(".preset-row").forEach((row) => {
    row.classList.remove("drag-over");
  });
}

function setElementText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setElementValue(element, value) {
  if (element) {
    element.value = value;
  }
}

function setElementHref(element, value) {
  if (element) {
    element.href = value;
  }
}

function updateSummary() {
  const { subtotal, tip, total, note, venmoUrl } = getOrderSummary();

  setElementText(elements.hostSubtotal, formatCurrency(subtotal));
  setElementText(elements.guestSubtotal, formatCurrency(subtotal));
  setElementText(elements.guestSummarySubtotal, formatCurrency(subtotal));
  setElementText(elements.guestTip, formatCurrency(tip));
  setElementText(elements.guestTotal, formatCurrency(total));
  setElementText(elements.qrNoteEditorPreview, note || "No icons selected");
  setElementText(elements.qrTotal, formatCurrency(total));
  setElementText(elements.qrNotePreview, note || "No icons selected");
  setElementValue(elements.venmoUrlOutput, venmoUrl);
  setElementHref(elements.openVenmoButton, venmoUrl);
  elements.handToGuestButton.disabled = subtotal <= 0;
  elements.confirmTotalButton.disabled = subtotal <= 0 || (appState.tipSelection === "custom" && appState.customTipAmount < 0);
  elements.markPaidButton.disabled = total <= 0;

  if (appState.screen === "qr") {
    renderQrCode(venmoUrl);
  }
}

function renderReport() {
  const orders = appState.report.orders;
  const metrics = getReportMetrics();

  elements.reportOrderCount.textContent = String(metrics.orderCount);
  elements.reportRevenue.textContent = formatCurrency(metrics.totalCollected);
  elements.reportSubtotal.textContent = formatCurrency(metrics.totalSubtotal);
  elements.reportTips.textContent = formatCurrency(metrics.totalTips);

  renderTopItems(metrics.topItems);
  renderRecentOrders(orders);
}

function renderTopItems(topItems) {
  elements.reportTopItems.innerHTML = "";

  if (!topItems.length) {
    elements.reportTopItems.innerHTML = `<div class="empty-state"><p>No paid sales logged yet.</p></div>`;
    return;
  }

  topItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "report-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${item.quantity} item${item.quantity === 1 ? "" : "s"} logged</p>
      </div>
      <strong>${formatCurrency(item.revenue)}</strong>
    `;
    elements.reportTopItems.appendChild(row);
  });
}

function renderRecentOrders(orders) {
  elements.reportRecentOrders.innerHTML = "";

  if (!orders.length) {
    elements.reportRecentOrders.innerHTML = `<div class="empty-state"><p>No sales in the report yet.</p></div>`;
    return;
  }

  orders
    .slice()
    .reverse()
    .slice(0, 5)
    .forEach((order) => {
      const row = document.createElement("div");
      row.className = "report-row";
      row.innerHTML = `
        <div>
          <strong>${formatCurrency(order.total)}</strong>
          <p>${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · Tip ${formatCurrency(order.tip)}</p>
          <time datetime="${order.timestamp}">${formatReportDate(order.timestamp)}</time>
        </div>
        <strong>${order.note || "No icons"}</strong>
      `;
      elements.reportRecentOrders.appendChild(row);
    });
}

function updateScreen() {
  elements.hostScreen.classList.toggle("hidden", appState.screen !== "host");
  elements.guestScreen.classList.toggle("hidden", appState.screen !== "guest");
  elements.qrScreen.classList.toggle("hidden", appState.screen !== "qr");
  elements.settingsToggle.classList.toggle("hidden", appState.screen !== "host");
  elements.hostEditShortcut.classList.toggle("hidden", appState.screen === "host");
  elements.hostComposerView.classList.toggle("hidden", appState.screen !== "host" || appState.hostAdminOpen);
  elements.hostAdminView.classList.toggle("hidden", appState.screen !== "host" || !appState.hostAdminOpen);
  elements.itemsPanel.classList.toggle("hidden", appState.adminTab !== "items");
  elements.reportPanel.classList.toggle("hidden", appState.adminTab !== "report");
  elements.advancedPanel.classList.toggle("hidden", appState.adminTab !== "advanced");
  elements.itemsTabButton.classList.toggle("selected", appState.adminTab === "items");
  elements.reportTabButton.classList.toggle("selected", appState.adminTab === "report");
  elements.advancedTabButton.classList.toggle("selected", appState.adminTab === "advanced");
  elements.itemsTabButton.setAttribute("aria-selected", appState.adminTab === "items" ? "true" : "false");
  elements.reportTabButton.setAttribute("aria-selected", appState.adminTab === "report" ? "true" : "false");
  elements.advancedTabButton.setAttribute("aria-selected", appState.adminTab === "advanced" ? "true" : "false");
  elements.settingsToggle.setAttribute("aria-label", appState.hostAdminOpen ? "Close settings" : "Open settings");
  elements.settingsToggle.textContent = appState.hostAdminOpen ? "✕" : "⚙️";

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

function bindSwipeToRemove(row, item) {
  let startX = 0;
  let tracking = false;

  row.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      return;
    }
    startX = event.touches[0].clientX;
    tracking = true;
  }, { passive: true });

  row.addEventListener("touchend", (event) => {
    if (!tracking || !event.changedTouches.length) {
      return;
    }
    const deltaX = event.changedTouches[0].clientX - startX;
    tracking = false;
    if (deltaX < -72 && window.confirm(`Remove ${item.name}?`)) {
      removeCartItem(item.id);
    }
  });
}

function handleItemModalSubmit(event) {
  event.preventDefault();
  const name = elements.itemModalName.value.trim();
  const price = Number.parseFloat(elements.itemModalPrice.value);

  if (!name) {
    showMessage("Custom item name is required.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showMessage("Custom item price must be greater than zero.");
    return;
  }

  if (appState.itemModalMode === "preset") {
    appState.settings.presetItems.push({
      id: createId(),
      name,
      price: roundMoney(price)
    });
    saveSettings();
    renderAll();
    closeItemModal();
    showMessage("Preset item added.", true);
    return;
  }

  addItemToCart(name, price);
  closeItemModal();
  showMessage("Custom item added.", true);
}

function openItemModal(mode) {
  appState.itemModalMode = mode;
  elements.itemModalTitle.textContent = mode === "preset" ? "Add Menu Item" : "Add Custom Item";
  elements.itemModalCopy.textContent = mode === "preset"
    ? "Create a new menu item for this device."
    : "Enter an item name and price to add it to the cart.";
  elements.itemModalSubmit.textContent = mode === "preset" ? "Add Menu Item" : "Add Custom Item";
  elements.itemModalName.placeholder = mode === "preset" ? "Soda" : "Late-night tacos";
  elements.itemModalPrice.placeholder = mode === "preset" ? "2.00" : "6.50";
  elements.itemModal.classList.remove("hidden");
  elements.itemModalName.focus();
}

function closeItemModal() {
  appState.itemModalMode = null;
  elements.itemModalForm.reset();
  elements.itemModal.classList.add("hidden");
}

function handleModalBackdropClick(event) {
  if (event.target === elements.itemModal) {
    closeItemModal();
  }
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
  appState.settings.supabaseUrl = elements.supabaseUrlInput.value.trim();
  appState.settings.supabaseKey = elements.supabaseKeyInput.value.trim();
  appState.settings.workspaceKey = elements.workspaceKeyInput.value.trim();
  appState.settings.defaultNoteIcons = sanitizeIcons(appState.settings.defaultNoteIcons);
  appState.settings.selectedNoteIcons = sanitizeIcons(appState.settings.selectedNoteIcons);

  if (appState.settings.defaultNoteIcons.length === 0) {
    appState.settings.defaultNoteIcons = [...DEFAULT_NOTE_ICONS];
  }

  if (appState.settings.selectedNoteIcons.length === 0) {
    appState.settings.selectedNoteIcons = [...appState.settings.defaultNoteIcons];
  }

  saveSettings();
  appState.supabaseClient = createSupabaseClient();
  renderAll();
  syncSettingsToCloud()
    .then((didSync) => {
      showMessage(didSync ? "Settings saved and synced." : "Settings saved on this device.", true);
    })
    .catch(() => {
      showMessage("Settings saved locally. Cloud sync failed.", true);
    });
}

function handleItemSettingsSave() {
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
  syncSettingsToCloud()
    .then((didSync) => {
      showMessage(didSync ? "Item settings saved and synced." : "Item settings saved on this device.", true);
    })
    .catch(() => {
      showMessage("Item settings saved locally. Cloud sync failed.", true);
    });
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

function markOrderPaid() {
  const summary = getOrderSummary();

  if (summary.total <= 0) {
    showMessage("Cannot log an empty reimbursement.");
    return;
  }

  const order = {
    id: createId(),
    timestamp: new Date().toISOString(),
    subtotal: summary.subtotal,
    tip: summary.tip,
    total: summary.total,
    note: summary.note,
    itemCount: appState.cart.reduce((sum, item) => sum + item.quantity, 0),
    items: appState.cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      lineTotal: roundMoney(item.price * item.quantity)
    }))
  };

  appState.report.orders.push(order);

  saveReport();
  sendSaleToCloud(order);
  resetOrder(false);
  showMessage("Sale added to the sales report.", true);
}

function resetOrder(showSuccessMessage = true) {
  appState.cart = [];
  appState.tipSelection = "none";
  appState.customTipAmount = 0;
  appState.screen = "host";
  appState.settings.selectedNoteIcons = [...appState.settings.defaultNoteIcons];
  persistCart();
  saveSettings();
  renderAll();
  if (showSuccessMessage) {
    showMessage("New order started.", true);
  }
}

function toggleSettings() {
  appState.hostAdminOpen = !appState.hostAdminOpen;
  updateScreen();
}

function switchAdminTab(tab) {
  appState.adminTab = tab;
  updateScreen();
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

function getOrderSummary() {
  const subtotal = getSubtotal();
  const tip = getTipAmount();
  const total = roundMoney(subtotal + tip);
  const note = getCurrentNote();
  const venmoUrl = getVenmoUrl(total, note);

  return { subtotal, tip, total, note, venmoUrl };
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

    return normalizeSettings(JSON.parse(raw));
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

function loadReport() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.report);
    if (!raw) {
      return { orders: [] };
    }

    const parsed = JSON.parse(raw);
    const orders = Array.isArray(parsed.orders) ? parsed.orders : [];

    return {
      orders: orders.filter((order) => Number(order.total) >= 0 && Array.isArray(order.items))
    };
  } catch (error) {
    return { orders: [] };
  }
}

function saveReport() {
  window.localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(appState.report));
}

function clearReport() {
  appState.report = { orders: [] };
  saveReport();
  renderReport();
  showMessage("Sales report cleared from this device.", true);
}

function getReportMetrics() {
  const itemMap = new Map();

  const totals = appState.report.orders.reduce((accumulator, order) => {
    accumulator.orderCount += 1;
    accumulator.totalSubtotal += roundMoney(Number(order.subtotal) || 0);
    accumulator.totalTips += roundMoney(Number(order.tip) || 0);
    accumulator.totalCollected += roundMoney(Number(order.total) || 0);

    order.items.forEach((item) => {
      const key = item.name;
      const current = itemMap.get(key) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity) || 0;
      current.revenue = roundMoney(current.revenue + (Number(item.lineTotal) || 0));
      itemMap.set(key, current);
    });

    return accumulator;
  }, {
    orderCount: 0,
    totalSubtotal: 0,
    totalTips: 0,
    totalCollected: 0
  });

  return {
    ...totals,
    topItems: Array.from(itemMap.values())
      .sort((left, right) => right.quantity - left.quantity || right.revenue - left.revenue)
      .slice(0, 5)
  };
}

function getDefaultSettings() {
  return {
    venmoUsername: "captkamikaze",
    supabaseUrl: DEFAULT_SUPABASE_URL,
    supabaseKey: DEFAULT_SUPABASE_KEY,
    workspaceKey: DEFAULT_WORKSPACE_KEY,
    presetItems: DEFAULT_PRESET_ITEMS.map(cloneItem),
    defaultNoteIcons: [...DEFAULT_NOTE_ICONS],
    selectedNoteIcons: [...DEFAULT_NOTE_ICONS]
  };
}

function createSupabaseClient() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    return null;
  }

  if (!appState.settings.supabaseUrl || !appState.settings.supabaseKey) {
    return null;
  }

  try {
    return window.supabase.createClient(
      appState.settings.supabaseUrl,
      appState.settings.supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  } catch (error) {
    return null;
  }
}

function hasCloudConfig() {
  return Boolean(
    appState.supabaseClient &&
    appState.settings.workspaceKey
  );
}

async function syncFromCloudOnLoad() {
  if (!hasCloudConfig()) {
    return;
  }

  try {
    const { data, error } = await appState.supabaseClient
      .from("app_settings")
      .select("settings_json")
      .eq("workspace_key", appState.settings.workspaceKey)
      .maybeSingle();

    if (error || !data || !data.settings_json) {
      return;
    }

    const remote = data.settings_json;
    appState.settings = normalizeSettings({
      ...remote,
      supabaseUrl: appState.settings.supabaseUrl,
      supabaseKey: appState.settings.supabaseKey,
      workspaceKey: appState.settings.workspaceKey
    });
    saveSettings();
    renderAll();
    showMessage("Loaded settings from Supabase.", true);
  } catch (error) {
    // Leave local settings in place.
  }
}

async function syncSettingsToCloud() {
  if (!hasCloudConfig()) {
    return false;
  }

  const payload = {
    workspace_key: appState.settings.workspaceKey,
    settings_json: {
      venmoUsername: appState.settings.venmoUsername,
      presetItems: appState.settings.presetItems,
      defaultNoteIcons: appState.settings.defaultNoteIcons,
      selectedNoteIcons: appState.settings.selectedNoteIcons
    },
    updated_at: new Date().toISOString()
  };

  const { error } = await appState.supabaseClient
    .from("app_settings")
    .upsert(payload, { onConflict: "workspace_key" });

  if (error) {
    throw error;
  }

  return true;
}

async function sendSaleToCloud(order) {
  if (!hasCloudConfig()) {
    return;
  }

  const saleDate = order.timestamp.slice(0, 10);

  try {
    await appState.supabaseClient
      .from("sales_events")
      .insert({
        workspace_key: appState.settings.workspaceKey,
        order_id: order.id,
        sale_date: saleDate,
        subtotal: order.subtotal,
        tip: order.tip,
        total: order.total,
        note: order.note,
        item_count: order.itemCount,
        items_json: order.items,
        created_at: order.timestamp
      });
  } catch (error) {
    showMessage("Saved locally. Supabase sales sync failed.");
  }
}

function normalizeSettings(settings) {
  return {
    venmoUsername: typeof settings.venmoUsername === "string" && settings.venmoUsername.trim()
      ? settings.venmoUsername.trim().replace(/^@/, "")
      : "captkamikaze",
    supabaseUrl: typeof settings.supabaseUrl === "string" && settings.supabaseUrl.trim()
      ? settings.supabaseUrl.trim()
      : DEFAULT_SUPABASE_URL,
    supabaseKey: typeof settings.supabaseKey === "string" && settings.supabaseKey.trim()
      ? settings.supabaseKey.trim()
      : DEFAULT_SUPABASE_KEY,
    workspaceKey: typeof settings.workspaceKey === "string" && settings.workspaceKey.trim()
      ? settings.workspaceKey.trim()
      : DEFAULT_WORKSPACE_KEY,
    presetItems: Array.isArray(settings.presetItems) && settings.presetItems.length
      ? settings.presetItems
          .map((item) => ({
            id: item.id || createId(),
            name: String(item.name || "").trim(),
            price: roundMoney(Number(item.price))
          }))
          .filter((item) => item.name && item.price > 0)
      : DEFAULT_PRESET_ITEMS.map(cloneItem),
    defaultNoteIcons: sanitizeIcons(settings.defaultNoteIcons).length
      ? sanitizeIcons(settings.defaultNoteIcons)
      : [...DEFAULT_NOTE_ICONS],
    selectedNoteIcons: sanitizeIcons(settings.selectedNoteIcons).length
      ? sanitizeIcons(settings.selectedNoteIcons)
      : [...DEFAULT_NOTE_ICONS]
  };
}

function sanitizeIcons(icons) {
  return Array.isArray(icons)
    ? ALLOWED_NOTE_ICONS.filter((icon) => icons.includes(icon))
    : [];
}

function tipDescription(option) {
  if (option.id === "custom") {
    return "Custom";
  }
  return option.label;
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

function formatReportDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
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
