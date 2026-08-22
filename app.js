const IS_DEMO = window.SUNDAZED_DEMO === true;
const STORAGE_PREFIX = IS_DEMO ? "party-pay-qr-demo-" : "party-pay-qr-";
const STORAGE_KEYS = {
  settings: `${STORAGE_PREFIX}settings`,
  cart: `${STORAGE_PREFIX}cart`,
  report: `${STORAGE_PREFIX}report`
};

const ALLOWED_NOTE_ICONS = ["☀️", "🎉", "🍺", "🍸", "🥂"];
const DEFAULT_NOTE_TEXT = "☀️🎉";
const DEFAULT_SUPABASE_URL = "https://unpqtfqjxvbijigttdhc.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_76GzVg3VQq-sgUjytYWsRg_qOBC3jPv";
const DEFAULT_WORKSPACE_KEY = IS_DEMO ? "sundazed-demo" : "sundazed-main";
const DEFAULT_PRESET_ITEMS = [
  { id: createId(), name: "Vodka Soda", price: 10, variants: [] },
  { id: createId(), name: "Tequila Soda", price: 10, variants: [] },
  { id: createId(), name: "Yuzu Whiskey Sour", price: 12, variants: [] },
  {
    id: createId(),
    name: "Shots",
    price: 6,
    variants: [
      { name: "Vodka", price: null },
      { name: "Tequila", price: null },
      { name: "Whiskey", price: null }
    ]
  },
  { id: createId(), name: "Hard Seltzer", price: 6, variants: [] },
  { id: createId(), name: "Sparklin Chi", price: 4, variants: [] },
  { id: createId(), name: "Whisky Diet", price: 10, variants: [] },
  {
    id: createId(),
    name: "Wine",
    price: 6,
    variants: [
      { name: "Red", price: null },
      { name: "White", price: null }
    ]
  },
  {
    id: createId(),
    name: "Margarita",
    price: 12,
    variants: [
      { name: "Regular", price: null },
      { name: "Strawberry", price: 1 },
      { name: "Spicy", price: 1 }
    ]
  },
  { id: createId(), name: "Espresso Martini", price: 14, variants: [] }
];
const TIP_OPTIONS = [
  { id: "none", label: "No Tip", type: "fixed", value: 0 },
  { id: "1", label: "$1", type: "fixed", value: 1 },
  { id: "2", label: "$2", type: "fixed", value: 2 },
  { id: "3", label: "$3", type: "fixed", value: 3 },
  { id: "custom", label: "Custom", type: "custom", value: null }
];

const appState = {
  screen: "host",
  cart: [],
  settings: loadSettings(),
  report: loadReport(),
  reportFilterDate: getTodayDateString(),
  reportLoading: false,
  paymentMethod: "venmo",
  tipSelection: "none",
  customTipAmount: 0,
  qrCode: null,
  hostAdminOpen: false,
  adminTab: "items",
  draggedPresetItemId: null,
  itemModalMode: null,
  tipModalValue: "",
  supabaseClient: null,
  session: null,
  loginMode: "name",
  loginBusy: false,
  pendingSwitch: false,
  reorderMode: false,
  suppressNextClick: false,
  userItemOrder: []
};

const SESSION_STORAGE_KEY = `${STORAGE_PREFIX}session`;

const elements = {
  hostScreen: document.getElementById("hostScreen"),
  mainContent: document.getElementById("mainContent"),
  guestScreen: document.getElementById("guestScreen"),
  paymentScreen: document.getElementById("paymentScreen"),
  qrScreen: document.getElementById("qrScreen"),
  hostComposerView: document.getElementById("hostComposerView"),
  hostAdminView: document.getElementById("hostAdminView"),
  itemsPanel: document.getElementById("itemsPanel"),
  reportPanel: document.getElementById("reportPanel"),
  advancedPanel: document.getElementById("advancedPanel"),
  settingsToggle: document.getElementById("settingsToggle"),
  currentUserBadge: document.getElementById("currentUserBadge"),
  userTabButton: document.getElementById("userTabButton"),
  userPanel: document.getElementById("userPanel"),
  userPanelName: document.getElementById("userPanelName"),
  userPanelLogoutButton: document.getElementById("userPanelLogoutButton"),
  userPanelSwitchButton: document.getElementById("userPanelSwitchButton"),
  loginGate: document.getElementById("loginGate"),
  loginNameView: document.getElementById("loginNameView"),
  loginAdminView: document.getElementById("loginAdminView"),
  loginUserSelect: document.getElementById("loginUserSelect"),
  loginContinueButton: document.getElementById("loginContinueButton"),
  loginNewUserToggle: document.getElementById("loginNewUserToggle"),
  loginNewUserFields: document.getElementById("loginNewUserFields"),
  loginFirstName: document.getElementById("loginFirstName"),
  loginLastName: document.getElementById("loginLastName"),
  loginCreateButton: document.getElementById("loginCreateButton"),
  loginAdminToggle: document.getElementById("loginAdminToggle"),
  loginAdminEmail: document.getElementById("loginAdminEmail"),
  loginAdminPassword: document.getElementById("loginAdminPassword"),
  loginAdminSubmit: document.getElementById("loginAdminSubmit"),
  loginAdminBack: document.getElementById("loginAdminBack"),
  loginError: document.getElementById("loginError"),
  loginCloseButton: document.getElementById("loginCloseButton"),
  stepBackButton: document.getElementById("stepBackButton"),
  itemsTabButton: document.getElementById("itemsTabButton"),
  reportTabButton: document.getElementById("reportTabButton"),
  advancedTabButton: document.getElementById("advancedTabButton"),
  presetItems: document.getElementById("presetItems"),
  menuReorderDoneButton: document.getElementById("menuReorderDoneButton"),
  hostCartList: document.getElementById("hostCartList"),
  hostCartBody: document.querySelector(".host-cart-body"),
  hostCartEmpty: document.getElementById("hostCartEmpty"),
  hostSubtotal: document.getElementById("hostSubtotal"),
  clearCartButton: document.getElementById("clearCartButton"),
  reportOrderCount: document.getElementById("reportOrderCount"),
  reportRevenue: document.getElementById("reportRevenue"),
  reportSubtotal: document.getElementById("reportSubtotal"),
  reportTips: document.getElementById("reportTips"),
  reportDateFilter: document.getElementById("reportDateFilter"),
  reportTodayButton: document.getElementById("reportTodayButton"),
  reportRefreshButton: document.getElementById("reportRefreshButton"),
  reportPullIndicator: document.getElementById("reportPullIndicator"),
  reportTopItems: document.getElementById("reportTopItems"),
  reportRecentOrders: document.getElementById("reportRecentOrders"),
  clearReportButton: document.getElementById("clearReportButton"),
  saveItemsButton: document.getElementById("saveItemsButton"),
  handToGuestButton: document.getElementById("handToGuestButton"),
  guestCartList: document.getElementById("guestCartList"),
  guestSubtotal: document.getElementById("guestSubtotal"),
  guestSubtotalEcho: document.getElementById("guestSubtotalEcho"),
  qrNoteInput: document.getElementById("qrNoteInput"),
  tipOptions: document.getElementById("tipOptions"),
  guestTip: document.getElementById("guestTip"),
  guestTotal: document.getElementById("guestTotal"),
  confirmTotalButton: document.getElementById("confirmTotalButton"),
  venmoMethodButton: document.getElementById("venmoMethodButton"),
  zelleMethodButton: document.getElementById("zelleMethodButton"),
  qrSummaryStack: document.getElementById("qrSummaryStack"),
  qrTotal: document.getElementById("qrTotal"),
  qrMethodName: document.getElementById("qrMethodName"),
  qrNoteSummaryRow: document.getElementById("qrNoteSummaryRow"),
  qrNoteSection: document.getElementById("qrNoteSection"),
  qrNotePreview: document.getElementById("qrNotePreview"),
  qrCode: document.getElementById("qrCode"),
  venmoQrLogo: document.getElementById("venmoQrLogo"),
  zelleQrWrap: document.getElementById("zelleQrWrap"),
  zelleQrImage: document.getElementById("zelleQrImage"),
  qrHelpPrimary: document.getElementById("qrHelpPrimary"),
  venmoScanSteps: document.getElementById("venmoScanSteps"),
  qrHelpSecondary: document.getElementById("qrHelpSecondary"),
  qrHelpTertiary: document.getElementById("qrHelpTertiary"),
  zelleAmountDisplay: document.getElementById("zelleAmountDisplay"),
  venmoUrlField: document.getElementById("venmoUrlField"),
  venmoUrlOutput: document.getElementById("venmoUrlOutput"),
  openVenmoButton: document.getElementById("openVenmoButton"),
  markPaidButton: document.getElementById("markPaidButton"),
  messageBanner: document.getElementById("messageBanner"),
  settingsForm: document.getElementById("settingsForm"),
  venmoUsernameInput: document.getElementById("venmoUsernameInput"),
  supabaseUrlInput: document.getElementById("supabaseUrlInput"),
  supabaseKeyInput: document.getElementById("supabaseKeyInput"),
  workspaceKeyInput: document.getElementById("workspaceKeyInput"),
  settingsNoteInput: document.getElementById("settingsNoteInput"),
  resetDefaultsButton: document.getElementById("resetDefaultsButton"),
  settingsPresetList: document.getElementById("settingsPresetList"),
  itemModal: document.getElementById("itemModal"),
  itemModalForm: document.getElementById("itemModalForm"),
  itemModalTitle: document.getElementById("itemModalTitle"),
  itemModalCopy: document.getElementById("itemModalCopy"),
  itemModalName: document.getElementById("itemModalName"),
  itemModalPrice: document.getElementById("itemModalPrice"),
  itemModalVariantsField: document.getElementById("itemModalVariantsField"),
  itemModalVariantRows: document.getElementById("itemModalVariantRows"),
  itemModalAddVariantRow: document.getElementById("itemModalAddVariantRow"),
  itemModalSubmit: document.getElementById("itemModalSubmit"),
  closeItemModalButton: document.getElementById("closeItemModalButton"),
  editItemModal: document.getElementById("editItemModal"),
  editItemModalForm: document.getElementById("editItemModalForm"),
  editItemModalName: document.getElementById("editItemModalName"),
  editItemModalPrice: document.getElementById("editItemModalPrice"),
  editItemModalVariantRows: document.getElementById("editItemModalVariantRows"),
  editItemModalAddVariantRow: document.getElementById("editItemModalAddVariantRow"),
  editItemModalDeleteButton: document.getElementById("editItemModalDeleteButton"),
  closeEditItemModalButton: document.getElementById("closeEditItemModalButton"),
  variantModal: document.getElementById("variantModal"),
  variantModalTitle: document.getElementById("variantModalTitle"),
  variantModalCopy: document.getElementById("variantModalCopy"),
  variantModalGrid: document.getElementById("variantModalGrid"),
  closeVariantModalButton: document.getElementById("closeVariantModalButton"),
  tipModal: document.getElementById("tipModal"),
  tipModalDisplay: document.getElementById("tipModalDisplay"),
  tipNumpad: document.getElementById("tipNumpad"),
  applyTipButton: document.getElementById("applyTipButton"),
  closeTipModalButton: document.getElementById("closeTipModalButton"),
  confirmModal: document.getElementById("confirmModal"),
  confirmModalTitle: document.getElementById("confirmModalTitle"),
  confirmModalMessage: document.getElementById("confirmModalMessage"),
  confirmModalConfirmButton: document.getElementById("confirmModalConfirmButton"),
  confirmModalCancelButton: document.getElementById("confirmModalCancelButton")
};

function init() {
  appState.cart = loadCart();
  appState.supabaseClient = createSupabaseClient();
  appState.session = IS_DEMO
    ? { type: "admin", id: "demo-admin", displayName: "Demo Host" }
    : loadSession();
  bindEvents();
  renderAll();
  renderLoginState();
  if (appState.session && !IS_DEMO) {
    loadUserItemOrder();
  }
  if (!IS_DEMO) {
    registerServiceWorker();
  }
  syncFromCloudOnLoad().finally(() => {
    refreshReportData();
  });
}

function bindEvents() {
  elements.itemModalForm.addEventListener("submit", handleItemModalSubmit);
  elements.closeItemModalButton.addEventListener("click", closeItemModal);
  elements.itemModal.addEventListener("click", handleModalBackdropClick);
  elements.itemModalAddVariantRow.addEventListener("click", () => {
    addVariantRow(elements.itemModalVariantRows, itemModalVariantsDraft);
  });
  elements.closeVariantModalButton.addEventListener("click", closeVariantModal);
  elements.variantModal.addEventListener("click", handleModalBackdropClick);
  elements.editItemModalForm.addEventListener("submit", handleEditItemModalSubmit);
  elements.editItemModalAddVariantRow.addEventListener("click", () => {
    addVariantRow(elements.editItemModalVariantRows, editItemModalVariantsDraft);
  });
  elements.editItemModalDeleteButton.addEventListener("click", handleEditItemModalDelete);
  elements.closeEditItemModalButton.addEventListener("click", closeEditItemModal);
  elements.editItemModal.addEventListener("click", handleModalBackdropClick);
  elements.handToGuestButton.addEventListener("click", goToGuestScreen);
  elements.tipOptions.addEventListener("click", handleTipClick);
  elements.tipNumpad.addEventListener("click", handleTipNumpadClick);
  elements.applyTipButton.addEventListener("click", applyCustomTipFromModal);
  elements.closeTipModalButton.addEventListener("click", closeTipModal);
  elements.tipModal.addEventListener("click", handleModalBackdropClick);
  elements.confirmModal.addEventListener("click", handleModalBackdropClick);
  elements.confirmModalCancelButton.addEventListener("click", () => resolveConfirmModal(false));
  elements.confirmModalConfirmButton.addEventListener("click", () => resolveConfirmModal(true));
  elements.stepBackButton.addEventListener("click", goBackOneStep);
  if (elements.confirmTotalButton) {
    elements.confirmTotalButton.addEventListener("click", goToPaymentScreen);
  }
  elements.venmoMethodButton.addEventListener("click", () => choosePaymentMethod("venmo"));
  elements.zelleMethodButton.addEventListener("click", () => choosePaymentMethod("zelle"));
  elements.qrNoteInput.addEventListener("input", () => {
    appState.noteText = elements.qrNoteInput.value;
    updateSummary();
  });
  window.addEventListener("resize", resizeNoteInput);
  elements.clearCartButton.addEventListener("click", clearCart);
  elements.markPaidButton.addEventListener("click", markOrderPaid);
  elements.settingsToggle.addEventListener("click", toggleSettings);
  elements.userTabButton.addEventListener("click", () => switchAdminTab("user"));
  elements.userPanelLogoutButton.addEventListener("click", handleLogOut);
  elements.userPanelSwitchButton.addEventListener("click", handleSwitchUser);
  elements.loginCloseButton.addEventListener("click", handleLoginClose);
  elements.menuReorderDoneButton.addEventListener("click", exitReorderMode);
  elements.loginUserSelect.addEventListener("change", handleLoginUserSelectChange);
  elements.loginContinueButton.addEventListener("click", handleLoginContinue);
  elements.loginNewUserToggle.addEventListener("click", () => {
    elements.loginNewUserFields.classList.toggle("hidden");
  });
  elements.loginCreateButton.addEventListener("click", handleLoginCreateUser);
  elements.loginAdminToggle.addEventListener("click", () => setLoginMode("admin"));
  elements.loginAdminBack.addEventListener("click", () => setLoginMode("name"));
  elements.loginAdminSubmit.addEventListener("click", handleLoginAdminSubmit);
  elements.loginAdminPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleLoginAdminSubmit();
    }
  });
  elements.loginLastName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleLoginCreateUser();
    }
  });
  elements.itemsTabButton.addEventListener("click", () => switchAdminTab("items"));
  elements.reportTabButton.addEventListener("click", () => switchAdminTab("report"));
  elements.advancedTabButton.addEventListener("click", () => switchAdminTab("advanced"));
  elements.reportDateFilter.addEventListener("change", handleReportDateChange);
  elements.reportTodayButton.addEventListener("click", setReportDateToToday);
  elements.reportRefreshButton.addEventListener("click", handleReportRefreshClick);
  elements.clearReportButton.addEventListener("click", clearReport);
  attachReportPullToRefresh();
  elements.saveItemsButton.addEventListener("click", handleItemSettingsSave);
  elements.settingsForm.addEventListener("submit", handleSettingsSave);
  elements.resetDefaultsButton.addEventListener("click", resetDefaultSettings);
}

function renderAll() {
  renderPresetItems();
  renderHostCart();
  renderGuestCart();
  renderTipOptions();
  renderSettingsForm();
  renderSettingsPresetList();
  renderReport();
  updateSummary();
  updateScreen();
}

function getOrderedPresetItems() {
  const items = appState.settings.presetItems;
  const order = appState.userItemOrder;
  if (!Array.isArray(order) || order.length === 0) {
    return [...items];
  }

  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set();
  const ordered = [];

  order.forEach((id) => {
    const item = byId.get(id);
    if (item && !seen.has(id)) {
      ordered.push(item);
      seen.add(id);
    }
  });

  items.forEach((item) => {
    if (!seen.has(item.id)) {
      ordered.push(item);
    }
  });

  return ordered;
}

async function loadUserItemOrder() {
  appState.userItemOrder = [];
  if (!appState.session || !appState.supabaseClient) {
    renderPresetItems();
    return;
  }

  try {
    const { data, error } = await appState.supabaseClient
      .from("user_item_order")
      .select("user_id, item_order")
      .eq("user_id", appState.session.id)
      .maybeSingle();

    if (!error && data && Array.isArray(data.item_order)) {
      appState.userItemOrder = data.item_order;
    }
  } catch (error) {
    // Ignore; falls back to the shared item order.
  }

  renderPresetItems();
}

async function saveUserItemOrder() {
  if (IS_DEMO || !appState.session || !appState.supabaseClient) {
    return;
  }

  try {
    await appState.supabaseClient
      .from("user_item_order")
      .upsert(
        { user_id: appState.session.id, item_order: appState.userItemOrder, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
  } catch (error) {
    // Ignore sync failures; the new order still applies for this session.
  }
}

function renderPresetItems() {
  elements.presetItems.innerHTML = "";
  elements.presetItems.classList.toggle("reorder-mode", appState.reorderMode);

  getOrderedPresetItems().forEach((item) => {
    const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
    const button = document.createElement("button");
    button.className = "preset-button";
    button.type = "button";
    button.dataset.itemId = item.id;
    button.style.setProperty("--jiggle-delay", Math.floor(Math.random() * 180));
    const dots = hasVariants
      ? `<span class="preset-variant-dots" aria-hidden="true">${"<span class=\"preset-variant-dot\"></span>".repeat(item.variants.length)}</span>`
      : "";
    button.innerHTML = `<strong>${escapeHtml(item.name)}</strong><span>${formatCurrency(item.price)}</span>${dots}`;
    button.addEventListener("click", (event) => {
      if (appState.suppressNextClick) {
        appState.suppressNextClick = false;
        event.preventDefault();
        return;
      }
      if (appState.reorderMode) {
        return;
      }
      if (hasVariants) {
        openVariantModal(item);
      } else {
        addItemToCart(item.name, item.price);
      }
    });
    attachPresetLongPress(button, item);
    elements.presetItems.appendChild(button);
  });

  const customButton = document.createElement("button");
  customButton.className = "preset-button";
  customButton.type = "button";
  customButton.innerHTML = "<strong>Custom</strong><span>Add your own item</span>";
  customButton.addEventListener("click", () => {
    if (!appState.reorderMode) {
      openItemModal("custom");
    }
  });
  elements.presetItems.appendChild(customButton);
}

const PRESET_LONG_PRESS_MS = 3000;
const PRESET_MOVE_CANCEL_PX = 10;

let presetDragState = null;

function attachPresetLongPress(button, item) {
  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (appState.reorderMode) {
      beginPresetDrag(item, button, event);
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    let cancelled = false;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.hypot(dx, dy) > PRESET_MOVE_CANCEL_PX) {
        cancel();
      }
    };

    const cancel = () => {
      if (cancelled) {
        return;
      }
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", cancel);
      window.removeEventListener("pointercancel", cancel);
    };

    const timer = setTimeout(() => {
      if (cancelled) {
        return;
      }
      cancel();
      appState.suppressNextClick = true;
      enterReorderMode();
      beginPresetDrag(item, button, event);
    }, PRESET_LONG_PRESS_MS);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", cancel);
    window.addEventListener("pointercancel", cancel);
  });
}

function enterReorderMode() {
  if (appState.reorderMode) {
    return;
  }
  appState.reorderMode = true;
  elements.presetItems.classList.add("reorder-mode");
  elements.menuReorderDoneButton.classList.remove("hidden");
  [...elements.presetItems.querySelectorAll(".preset-button[data-item-id]")].forEach((el) => {
    el.style.setProperty("--jiggle-delay", Math.floor(Math.random() * 180));
  });
}

function exitReorderMode() {
  if (presetDragState) {
    endPresetDrag(presetDragState.pointerId);
  }
  appState.reorderMode = false;
  elements.presetItems.classList.remove("reorder-mode");
  elements.menuReorderDoneButton.classList.add("hidden");
  renderPresetItems();
}

function beginPresetDrag(item, button, event) {
  event.preventDefault();
  try {
    button.setPointerCapture(event.pointerId);
  } catch (error) {
    // Ignore capture failures.
  }

  const rect = button.getBoundingClientRect();
  presetDragState = {
    item,
    button,
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };

  button.classList.add("dragging");
  button.style.position = "fixed";
  button.style.left = `${rect.left}px`;
  button.style.top = `${rect.top}px`;
  button.style.width = `${rect.width}px`;
  button.style.height = `${rect.height}px`;
  button.style.margin = "0";

  button.addEventListener("pointermove", handlePresetDragMove);
  button.addEventListener("pointerup", handlePresetDragEnd);
  button.addEventListener("pointercancel", handlePresetDragEnd);
}

function handlePresetDragMove(event) {
  if (!presetDragState || event.pointerId !== presetDragState.pointerId) {
    return;
  }

  const { button, offsetX, offsetY } = presetDragState;
  button.style.left = `${event.clientX - offsetX}px`;
  button.style.top = `${event.clientY - offsetY}px`;

  button.style.pointerEvents = "none";
  const targetEl = document.elementFromPoint(event.clientX, event.clientY);
  button.style.pointerEvents = "";

  const targetButton = targetEl ? targetEl.closest(".preset-button[data-item-id]") : null;
  if (!targetButton || targetButton === button) {
    return;
  }

  const items = getOrderedPresetItems();
  const fromIndex = items.findIndex((entry) => entry.id === presetDragState.item.id);
  const toIndex = items.findIndex((entry) => entry.id === targetButton.dataset.itemId);
  if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
    reorderPresetTilesWithFlip(fromIndex, toIndex, button);
  }
}

function reorderPresetTilesWithFlip(fromIndex, toIndex, draggedButton) {
  const container = elements.presetItems;
  const allTiles = [...container.querySelectorAll(".preset-button[data-item-id]")];
  const firstRects = new Map(
    allTiles.filter((el) => el !== draggedButton).map((el) => [el.dataset.itemId, el.getBoundingClientRect()])
  );

  const items = getOrderedPresetItems();
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  appState.userItemOrder = items.map((entry) => entry.id);

  items.forEach((entry) => {
    const el = allTiles.find((node) => node.dataset.itemId === entry.id);
    if (el) {
      container.appendChild(el);
    }
  });
  const customButton = container.querySelector(".preset-button:not([data-item-id])");
  if (customButton) {
    container.appendChild(customButton);
  }

  allTiles.forEach((el) => {
    if (el === draggedButton) {
      return;
    }
    const firstRect = firstRects.get(el.dataset.itemId);
    if (!firstRect) {
      return;
    }
    const lastRect = el.getBoundingClientRect();
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    if (dx || dy) {
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 200ms ease";
        el.style.transform = "";
      });
    }
  });
}

function handlePresetDragEnd(event) {
  if (!presetDragState || event.pointerId !== presetDragState.pointerId) {
    return;
  }
  endPresetDrag(event.pointerId);
}

function endPresetDrag(pointerId) {
  if (!presetDragState) {
    return;
  }
  const { button } = presetDragState;
  button.removeEventListener("pointermove", handlePresetDragMove);
  button.removeEventListener("pointerup", handlePresetDragEnd);
  button.removeEventListener("pointercancel", handlePresetDragEnd);
  try {
    button.releasePointerCapture(pointerId);
  } catch (error) {
    // Ignore release failures.
  }

  button.classList.remove("dragging");
  button.style.position = "";
  button.style.left = "";
  button.style.top = "";
  button.style.width = "";
  button.style.height = "";
  button.style.margin = "";
  button.style.transform = "";

  presetDragState = null;
  saveUserItemOrder();
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
        <p>${item.quantity} × ${formatCurrency(item.price)}${item.addedBy ? ` · Added by ${escapeHtml(item.addedBy)}` : ""}</p>
      </div>
      <div class="cart-controls">
        <button class="stepper-button" type="button" aria-label="Decrease ${escapeHtml(item.name)}">-</button>
        <span class="quantity-badge">${item.quantity}</span>
        <button class="stepper-button" type="button" aria-label="Increase ${escapeHtml(item.name)}">+</button>
      </div>
      <div class="cart-total-cell">
        <span class="cart-line-total">${formatCurrency(item.price * item.quantity)}</span>
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
      <div class="cart-name-cell">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="cart-inline-detail">@${formatCurrency(item.price)} X ${item.quantity}</span>
      </div>
      <strong class="cart-total-value">${formatCurrency(item.price * item.quantity)}</strong>
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
    const tipAmount = option.type === "fixed"
      ? (option.value > 0 ? formatCurrency(option.value) : "")
      : appState.customTipAmount > 0 ? formatCurrency(appState.customTipAmount) : "Enter amount";
    const amountClass = option.type === "custom" && appState.customTipAmount <= 0
      ? "tip-button-amount tip-button-amount-placeholder"
      : "tip-button-amount";
    button.innerHTML = `
      <div class="tip-button-label">${option.label}</div>
      <div class="${amountClass}">${tipAmount}</div>
    `;
    elements.tipOptions.appendChild(button);
  });
}

function renderSettingsForm() {
  elements.venmoUsernameInput.value = appState.settings.venmoUsername;
  elements.settingsNoteInput.value = appState.settings.defaultNoteIcons;
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
    const variantCount = Array.isArray(item.variants) ? item.variants.length : 0;
    row.innerHTML = `
      <div class="preset-row-main">
        <span class="drag-handle" aria-hidden="true">☰</span>
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${formatCurrency(item.price)}${variantCount ? ` · ${variantCount} option${variantCount === 1 ? "" : "s"}` : ""}</p>
        </div>
      </div>
      <div class="preset-row-actions">
        <button class="stepper-button" type="button">Edit</button>
      </div>
    `;

    const [editButton] = row.querySelectorAll("button");

    editButton.addEventListener("click", () => {
      openEditItemModal(item);
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
  setElementText(elements.guestSubtotalEcho, formatCurrency(subtotal));
  setElementText(elements.guestTip, formatCurrency(tip));
  setElementText(elements.guestTotal, formatCurrency(total));
  if (document.activeElement !== elements.qrNoteInput) {
    elements.qrNoteInput.value = note;
  }
  resizeNoteInput();
  setElementText(elements.qrTotal, formatCurrency(total));
  setElementText(elements.zelleAmountDisplay, formatCurrency(total));
  setElementText(elements.qrMethodName, appState.paymentMethod === "zelle" ? "Zelle" : "Venmo");
  setElementText(elements.qrNotePreview, note || "No icons selected");
  setElementValue(elements.venmoUrlOutput, venmoUrl);
  setElementHref(elements.openVenmoButton, venmoUrl);
  elements.handToGuestButton.disabled = subtotal <= 0;
  if (elements.confirmTotalButton) {
    elements.confirmTotalButton.disabled = subtotal <= 0 || (appState.tipSelection === "custom" && appState.customTipAmount < 0);
  }
  elements.venmoMethodButton.disabled = subtotal <= 0 || (appState.tipSelection === "custom" && appState.customTipAmount < 0);
  elements.zelleMethodButton.disabled = subtotal <= 0 || (appState.tipSelection === "custom" && appState.customTipAmount < 0);
  elements.markPaidButton.disabled = total <= 0;

  if (appState.screen === "qr") {
    renderPaymentQr();
  }
}

function renderReport() {
  elements.reportDateFilter.value = appState.reportFilterDate;

  if (appState.reportLoading) {
    elements.reportOrderCount.textContent = "…";
    elements.reportRevenue.textContent = "…";
    elements.reportSubtotal.textContent = "…";
    elements.reportTips.textContent = "…";
    elements.reportTopItems.innerHTML = `<div class="empty-state"><p>Loading sales…</p></div>`;
    elements.reportRecentOrders.innerHTML = `<div class="empty-state"><p>Loading sales…</p></div>`;
    return;
  }

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
          <p>${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · Tip ${formatCurrency(order.tip)}${order.userName ? ` · ${escapeHtml(order.userName)}` : ""}</p>
          <time datetime="${order.timestamp}">${formatReportDate(order.timestamp)}</time>
        </div>
        <strong>${order.note || "No icons"}</strong>
      `;
      elements.reportRecentOrders.appendChild(row);
    });
}

function handleReportDateChange() {
  const nextDate = elements.reportDateFilter.value || getTodayDateString();
  appState.reportFilterDate = nextDate;
  refreshReportData();
}

function setReportDateToToday() {
  appState.reportFilterDate = getTodayDateString();
  refreshReportData();
}

async function handleReportRefreshClick() {
  elements.reportRefreshButton.disabled = true;
  elements.reportRefreshButton.classList.add("refreshing");
  await refreshReportData();
  elements.reportRefreshButton.disabled = false;
  elements.reportRefreshButton.classList.remove("refreshing");
}

const REPORT_PULL_TRIGGER_PX = 70;
const REPORT_PULL_MAX_PX = 110;

function attachReportPullToRefresh() {
  const scrollHost = elements.hostAdminView;
  let startY = null;
  let pulling = false;
  let refreshing = false;

  scrollHost.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || appState.adminTab !== "report" || refreshing) {
      return;
    }
    if (scrollHost.scrollTop > 0) {
      return;
    }
    startY = event.clientY;
    pulling = true;
  });

  scrollHost.addEventListener("pointermove", (event) => {
    if (!pulling || startY === null) {
      return;
    }
    const distance = event.clientY - startY;
    if (distance <= 0 || scrollHost.scrollTop > 0) {
      pulling = false;
      startY = null;
      elements.reportPullIndicator.classList.add("hidden");
      elements.reportPullIndicator.classList.remove("ready");
      return;
    }
    const pullDistance = Math.min(distance, REPORT_PULL_MAX_PX);
    elements.reportPullIndicator.classList.remove("hidden");
    elements.reportPullIndicator.classList.toggle("ready", pullDistance >= REPORT_PULL_TRIGGER_PX);
    elements.reportPullIndicator.textContent = pullDistance >= REPORT_PULL_TRIGGER_PX
      ? "Release to refresh"
      : "Pull to refresh";
  });

  const endPull = async (event) => {
    if (!pulling) {
      return;
    }
    const distance = startY === null ? 0 : event.clientY - startY;
    pulling = false;
    startY = null;

    if (distance >= REPORT_PULL_TRIGGER_PX) {
      refreshing = true;
      elements.reportPullIndicator.classList.remove("hidden");
      elements.reportPullIndicator.classList.add("ready");
      elements.reportPullIndicator.textContent = "Refreshing…";
      await refreshReportData();
      refreshing = false;
    }

    elements.reportPullIndicator.classList.add("hidden");
    elements.reportPullIndicator.classList.remove("ready");
  };

  scrollHost.addEventListener("pointerup", endPull);
  scrollHost.addEventListener("pointercancel", endPull);
}

function updateScreen() {
  elements.mainContent.classList.toggle("main-host-mode", appState.screen === "host");
  elements.mainContent.classList.toggle("main-guest-mode", appState.screen === "guest");
  elements.hostScreen.classList.toggle("hidden", appState.screen !== "host");
  elements.guestScreen.classList.toggle("hidden", appState.screen !== "guest");
  elements.paymentScreen.classList.toggle("hidden", appState.screen !== "payment");
  elements.qrScreen.classList.toggle("hidden", appState.screen !== "qr");
  elements.settingsToggle.classList.toggle("hidden", appState.screen !== "host" || !appState.session);
  elements.stepBackButton.classList.toggle("hidden", appState.screen === "host");
  elements.markPaidButton.classList.toggle("hidden", appState.screen !== "qr");
  elements.hostComposerView.classList.toggle("hidden", appState.screen !== "host" || appState.hostAdminOpen);
  elements.hostAdminView.classList.toggle("hidden", appState.screen !== "host" || !appState.hostAdminOpen);
  const isAdmin = Boolean(appState.session && appState.session.type === "admin");
  elements.itemsTabButton.classList.toggle("hidden", !isAdmin);
  elements.reportTabButton.classList.toggle("hidden", !isAdmin);
  elements.advancedTabButton.classList.toggle("hidden", !isAdmin);
  elements.userPanel.classList.toggle("hidden", appState.adminTab !== "user");
  elements.itemsPanel.classList.toggle("hidden", appState.adminTab !== "items");
  elements.reportPanel.classList.toggle("hidden", appState.adminTab !== "report");
  elements.advancedPanel.classList.toggle("hidden", appState.adminTab !== "advanced");
  elements.userTabButton.classList.toggle("selected", appState.adminTab === "user");
  elements.itemsTabButton.classList.toggle("selected", appState.adminTab === "items");
  elements.reportTabButton.classList.toggle("selected", appState.adminTab === "report");
  elements.advancedTabButton.classList.toggle("selected", appState.adminTab === "advanced");
  elements.userTabButton.setAttribute("aria-selected", appState.adminTab === "user" ? "true" : "false");
  elements.itemsTabButton.setAttribute("aria-selected", appState.adminTab === "items" ? "true" : "false");
  elements.reportTabButton.setAttribute("aria-selected", appState.adminTab === "report" ? "true" : "false");
  elements.advancedTabButton.setAttribute("aria-selected", appState.adminTab === "advanced" ? "true" : "false");
  elements.settingsToggle.setAttribute("aria-label", appState.hostAdminOpen ? "Close settings" : "Open settings");
  elements.settingsToggle.textContent = appState.hostAdminOpen ? "✕" : "⚙️";
  renderUserPanel();
  elements.venmoMethodButton.classList.toggle("selected", appState.paymentMethod === "venmo");
  elements.zelleMethodButton.classList.toggle("selected", appState.paymentMethod === "zelle");

  if (appState.screen === "qr") {
    renderPaymentQr();
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
      quantity: 1,
      addedBy: appState.session ? appState.session.displayName : null
    });
  }
  persistCart();
  renderAll();
  scrollHostCartToBottom();
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
  scrollHostCartToBottom();
}

function removeCartItem(id) {
  appState.cart = appState.cart.filter((item) => item.id !== id);
  persistCart();
  renderAll();
}

async function clearCart() {
  if (!appState.cart.length) {
    return;
  }

  if (!(await confirmAction("Clear the cart?"))) {
    return;
  }

  appState.cart = [];
  appState.tipSelection = "none";
  appState.customTipAmount = 0;
  persistCart();
  renderAll();
}

function scrollHostCartToBottom() {
  if (!elements.hostCartBody) {
    return;
  }

  requestAnimationFrame(() => {
    elements.hostCartBody.scrollTop = elements.hostCartBody.scrollHeight;
  });
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

  row.addEventListener("touchend", async (event) => {
    if (!tracking || !event.changedTouches.length) {
      return;
    }
    const deltaX = event.changedTouches[0].clientX - startX;
    tracking = false;
    if (deltaX < -72 && (await confirmAction(`Remove ${item.name}?`))) {
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
      price: roundMoney(price),
      variants: sanitizeVariants(itemModalVariantsDraft)
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

let itemModalVariantsDraft = [];

function openItemModal(mode) {
  appState.itemModalMode = mode;
  elements.itemModalTitle.textContent = mode === "preset" ? "Add Menu Item" : "Add Custom Item";
  elements.itemModalCopy.textContent = mode === "preset"
    ? "Create a new menu item for this device."
    : "Enter an item name and price to add it to the cart.";
  elements.itemModalSubmit.textContent = mode === "preset" ? "Add Menu Item" : "Add Custom Item";
  elements.itemModalName.placeholder = mode === "preset" ? "Soda" : "Late-night tacos";
  elements.itemModalPrice.placeholder = mode === "preset" ? "2.00" : "6.50";
  elements.itemModalVariantsField.classList.toggle("hidden", mode !== "preset");
  itemModalVariantsDraft = [];
  renderVariantRows(elements.itemModalVariantRows, itemModalVariantsDraft);
  elements.itemModal.classList.remove("hidden");
  elements.itemModalName.focus();
}

function renderVariantRows(container, variants) {
  container.innerHTML = "";
  variants.forEach((variant, index) => {
    const row = document.createElement("div");
    row.className = "variant-row";
    const priceValue = variant.price === null || variant.price === undefined ? "" : variant.price;
    row.innerHTML = `
      <input type="text" class="variant-row-name" maxlength="30" placeholder="Option name" value="${escapeHtml(String(variant.name || ""))}">
      <div class="variant-row-price-field">
        <span class="variant-row-price-prefix" aria-hidden="true">$</span>
        <input type="number" class="variant-row-price" min="0.01" step="0.01" inputmode="decimal" placeholder="Base price" value="${escapeHtml(String(priceValue))}">
      </div>
      <button type="button" class="variant-row-remove" aria-label="Remove sub-option">×</button>
    `;
    const nameInput = row.querySelector(".variant-row-name");
    const priceInput = row.querySelector(".variant-row-price");
    const removeButton = row.querySelector(".variant-row-remove");
    nameInput.addEventListener("input", () => {
      variant.name = nameInput.value;
    });
    priceInput.addEventListener("input", () => {
      variant.price = priceInput.value;
    });
    removeButton.addEventListener("click", () => {
      variants.splice(index, 1);
      renderVariantRows(container, variants);
    });
    container.appendChild(row);
  });
}

function addVariantRow(container, variants) {
  variants.push({ name: "", price: "" });
  renderVariantRows(container, variants);
}

let editItemModalItem = null;
let editItemModalVariantsDraft = [];

function openEditItemModal(item) {
  editItemModalItem = item;
  elements.editItemModalName.value = item.name;
  elements.editItemModalPrice.value = item.price;
  editItemModalVariantsDraft = (Array.isArray(item.variants) ? item.variants : []).map((variant) => ({
    name: typeof variant === "string" ? variant : variant.name,
    price: typeof variant === "string" || variant.price === null || variant.price === undefined ? "" : variant.price
  }));
  renderVariantRows(elements.editItemModalVariantRows, editItemModalVariantsDraft);
  elements.editItemModal.classList.remove("hidden");
  elements.editItemModalName.focus();
}

function closeEditItemModal() {
  editItemModalItem = null;
  editItemModalVariantsDraft = [];
  elements.editItemModal.classList.add("hidden");
}

function handleEditItemModalSubmit(event) {
  event.preventDefault();
  if (!editItemModalItem) {
    return;
  }

  const name = elements.editItemModalName.value.trim();
  const price = Number.parseFloat(elements.editItemModalPrice.value);

  if (!name) {
    showMessage("Item name is required.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showMessage("Item price must be greater than zero.");
    return;
  }

  editItemModalItem.name = name;
  editItemModalItem.price = roundMoney(price);
  editItemModalItem.variants = sanitizeVariants(editItemModalVariantsDraft);
  saveSettings();
  renderAll();
  closeEditItemModal();
  showMessage("Item updated.", true);
}

async function handleEditItemModalDelete() {
  if (!editItemModalItem) {
    return;
  }

  if (!(await confirmAction(`Delete ${editItemModalItem.name}?`))) {
    return;
  }

  appState.settings.presetItems = appState.settings.presetItems.filter((entry) => entry.id !== editItemModalItem.id);
  saveSettings();
  renderAll();
  closeEditItemModal();
}

function openVariantModal(item) {
  elements.variantModalTitle.textContent = item.name;
  elements.variantModalCopy.textContent = `Choose a ${item.name} option to add.`;
  elements.variantModalGrid.innerHTML = "";
  item.variants.forEach((variant) => {
    const name = typeof variant === "string" ? variant : variant.name;
    const price = typeof variant === "string" || variant.price === null || variant.price === undefined
      ? item.price
      : variant.price;
    const button = document.createElement("button");
    button.className = "preset-button";
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${formatCurrency(price)}</span>`;
    button.addEventListener("click", () => {
      addItemToCart(`${item.name} – ${name}`, price);
      closeVariantModal();
    });
    elements.variantModalGrid.appendChild(button);
  });
  elements.variantModal.classList.remove("hidden");
}

function closeVariantModal() {
  elements.variantModal.classList.add("hidden");
}

let noteWidthMeasureCanvas = null;

function resizeNoteInput() {
  const input = elements.qrNoteInput;
  if (!input || input.classList.contains("hidden") || elements.qrNoteSection.classList.contains("hidden")) {
    return;
  }

  const isVenmo = appState.paymentMethod !== "zelle";
  const qrEl = isVenmo ? elements.qrCode.querySelector("img") : elements.zelleQrImage;
  const measuredQrWidth = qrEl ? qrEl.getBoundingClientRect().width : 0;
  const qrWidth = measuredQrWidth > 0 ? measuredQrWidth : 260;

  if (!noteWidthMeasureCanvas) {
    noteWidthMeasureCanvas = document.createElement("canvas");
  }
  const ctx = noteWidthMeasureCanvas.getContext("2d");
  const cs = getComputedStyle(input);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const textWidth = ctx.measureText(input.value).width;
  const horizontalSlack = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 10;

  const desiredWidth = Math.max(qrWidth, Math.ceil(textWidth + horizontalSlack));
  input.style.width = `${desiredWidth}px`;
}

function closeItemModal() {
  appState.itemModalMode = null;
  itemModalVariantsDraft = [];
  elements.itemModalForm.reset();
  elements.itemModal.classList.add("hidden");
}

function openTipModal() {
  appState.tipModalValue = appState.tipSelection === "custom" && appState.customTipAmount > 0
    ? normalizeTipInput(appState.customTipAmount.toFixed(2))
    : "";
  updateTipModalDisplay();
  elements.tipModal.classList.remove("hidden");
}

function closeTipModal() {
  appState.tipModalValue = "";
  elements.tipModal.classList.add("hidden");
}

function handleModalBackdropClick(event) {
  if (event.target === elements.itemModal) {
    closeItemModal();
  } else if (event.target === elements.tipModal) {
    closeTipModal();
  } else if (event.target === elements.confirmModal) {
    resolveConfirmModal(false);
  } else if (event.target === elements.variantModal) {
    closeVariantModal();
  } else if (event.target === elements.editItemModal) {
    closeEditItemModal();
  }
}

let confirmModalResolver = null;

function confirmAction(message, title) {
  elements.confirmModalTitle.textContent = title || "Are you sure?";
  elements.confirmModalMessage.textContent = message;
  elements.confirmModal.classList.remove("hidden");
  return new Promise((resolve) => {
    confirmModalResolver = resolve;
  });
}

function resolveConfirmModal(result) {
  elements.confirmModal.classList.add("hidden");
  if (confirmModalResolver) {
    confirmModalResolver(result);
    confirmModalResolver = null;
  }
}

function handleTipClick(event) {
  const button = event.target.closest("[data-tip-id]");
  if (!button) {
    return;
  }

  const tipId = button.dataset.tipId;
  if (tipId === "custom") {
    openTipModal();
    return;
  }

  appState.tipSelection = tipId;
  appState.customTipAmount = 0;
  renderTipOptions();
  updateSummary();
}

function handleTipNumpadClick(event) {
  const button = event.target.closest("[data-tip-key]");
  if (!button) {
    return;
  }

  const key = button.dataset.tipKey;

  if (key === "clear") {
    appState.tipModalValue = "";
    updateTipModalDisplay();
    return;
  }

  if (key === "double-zero") {
    if (appState.tipModalValue.length >= 7) {
      return;
    }
    appState.tipModalValue = `${appState.tipModalValue}00`;
    updateTipModalDisplay();
    return;
  }

  if (appState.tipModalValue.length >= 7) {
    return;
  }

  appState.tipModalValue = `${appState.tipModalValue}${key}`;
  updateTipModalDisplay();
}

function applyCustomTipFromModal() {
  const parsed = parseTipModalValue(appState.tipModalValue);

  if (!Number.isFinite(parsed) || parsed < 0) {
    showMessage("Custom tip cannot be below zero.");
    return;
  }

  appState.tipSelection = "custom";
  appState.customTipAmount = roundMoney(parsed);
  closeTipModal();
  renderTipOptions();
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
  appState.settings.defaultNoteIcons = elements.settingsNoteInput.value.trim() || DEFAULT_NOTE_TEXT;

  saveSettings();
  appState.supabaseClient = createSupabaseClient();
  renderAll();
  syncSettingsToCloud()
    .then((didSync) => {
      showMessage(didSync ? "Settings saved and synced." : "Settings saved on this device.", true);
      refreshReportData();
    })
    .catch(() => {
      showMessage("Settings saved locally. Cloud sync failed.", true);
      refreshReportData();
    });
}

function handleItemSettingsSave() {
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

function goToPaymentScreen() {
  if (getSubtotal() <= 0) {
    showMessage("This reimbursement is empty.");
    return;
  }

  if (appState.tipSelection === "custom" && appState.customTipAmount < 0) {
    showMessage("Custom tip cannot be below zero.");
    return;
  }

  switchScreen("payment");
}

function choosePaymentMethod(method) {
  if (getSubtotal() <= 0) {
    showMessage("This reimbursement is empty.");
    return;
  }

  if (appState.tipSelection === "custom" && appState.customTipAmount < 0) {
    showMessage("Custom tip cannot be below zero.");
    return;
  }

  appState.paymentMethod = method;
  switchScreen("qr");
}

function goBackOneStep() {
  if (appState.screen === "qr") {
    switchScreen("guest");
    return;
  }

  if (appState.screen === "payment") {
    switchScreen("guest");
    return;
  }

  if (appState.screen === "guest") {
    switchScreen("host");
  }
}

async function markOrderPaid() {
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
    userName: appState.session ? appState.session.displayName : null,
    itemCount: appState.cart.reduce((sum, item) => sum + item.quantity, 0),
    items: appState.cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      lineTotal: roundMoney(item.price * item.quantity),
      addedBy: item.addedBy || null
    }))
  };

  appState.report.orders.push(order);

  saveReport();
  const cloudSynced = await sendSaleToCloud(order);
  await refreshReportData({ silent: true });
  resetOrder(false);

  if (cloudSynced || !hasCloudConfig()) {
    showMessage("Sale added to the sales report.", true);
  }
}

function resetOrder(showSuccessMessage = true) {
  appState.cart = [];
  appState.paymentMethod = "venmo";
  appState.tipSelection = "none";
  appState.customTipAmount = 0;
  appState.screen = "host";
  appState.noteText = null;
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
  if (tab === "report") {
    refreshReportData({ silent: true });
  }
}

function getSubtotal() {
  return roundMoney(appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
}

function getTipAmount() {
  if (appState.tipSelection === "custom") {
    return appState.customTipAmount > 0 ? roundMoney(appState.customTipAmount) : 0;
  }

  const selected = TIP_OPTIONS.find((option) => option.id === appState.tipSelection);
  return selected ? roundMoney(selected.value) : 0;
}

function getCurrentNote() {
  if (typeof appState.noteText === "string") {
    return appState.noteText;
  }
  return appState.settings.defaultNoteIcons;
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

function updateTipModalDisplay() {
  setElementText(elements.tipModalDisplay, formatCurrency(parseTipModalValue(appState.tipModalValue)));
}

function parseTipModalValue(value) {
  if (!value) {
    return 0;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return 0;
  }

  return Number.parseInt(digits, 10) / 100;
}

function normalizeTipInput(value) {
  return String(value).replace(/[^\d]/g, "");
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

function renderPaymentQr() {
  const { venmoUrl } = getOrderSummary();
  const isVenmo = appState.paymentMethod === "venmo";

  elements.qrCode.classList.toggle("hidden", !isVenmo);
  elements.venmoQrLogo.classList.toggle("hidden", !isVenmo);
  elements.zelleQrWrap.classList.toggle("hidden", isVenmo);
  elements.zelleQrImage.classList.toggle("hidden", isVenmo);
  elements.zelleAmountDisplay.classList.toggle("hidden", false);
  elements.qrSummaryStack.classList.toggle("hidden", true);
  elements.qrNoteSummaryRow.classList.toggle("hidden", true);
  elements.qrNoteSection.classList.toggle("hidden", !isVenmo);
  elements.venmoUrlField.classList.toggle("hidden", true);
  elements.openVenmoButton.classList.toggle("hidden", true);
  elements.qrHelpTertiary.classList.toggle("hidden", isVenmo);
  elements.venmoScanSteps.classList.toggle("hidden", !isVenmo);

  if (isVenmo) {
    elements.qrHelpPrimary.innerHTML = 'Use your <span class="qr-help-accent">camera app</span><br>to scan the QR&nbsp;code.';
    setElementText(elements.qrHelpSecondary, "The Camera app will open a Venmo link for you.");
    setElementText(elements.qrHelpTertiary, "");
    renderQrCode(venmoUrl);
    return;
  }

  setElementText(elements.qrHelpPrimary, "Scan this Zelle QR code in your bank app.");
  setElementText(elements.qrHelpSecondary, "");
  setElementText(elements.qrHelpTertiary, "Recipient name will show as CHRISTOPHER LEQUANG in Zelle.");
  elements.qrCode.innerHTML = "";
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

async function clearReport() {
  const label = formatReportDay(appState.reportFilterDate);
  if (!(await confirmAction(`Delete all sales for ${label}?`))) {
    return;
  }

  if (hasCloudConfig()) {
    const { error } = await appState.supabaseClient
      .from("sales_events")
      .delete()
      .eq("workspace_key", appState.settings.workspaceKey)
      .eq("sale_date", appState.reportFilterDate);

    if (error) {
      showMessage("Could not clear sales for that day.");
      return;
    }
  }

  appState.report = {
    orders: appState.report.orders.filter((order) => getLocalDateKey(order.timestamp) !== appState.reportFilterDate)
  };
  const localReport = loadReport();
  localReport.orders = localReport.orders.filter((order) => getLocalDateKey(order.timestamp) !== appState.reportFilterDate);
  window.localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(localReport));
  await refreshReportData({ silent: true });
  showMessage(`Sales cleared for ${label}.`, true);
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
    defaultNoteIcons: DEFAULT_NOTE_TEXT
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

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveSession(session) {
  appState.session = session;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    // Ignore storage failures (e.g. private browsing).
  }
}

function clearSession() {
  appState.session = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    // Ignore storage failures.
  }
}

function renderUserPanel() {
  if (!appState.session) {
    return;
  }
  const suffix = appState.session.type === "admin" ? " (Admin)" : "";
  setElementText(elements.userPanelName, `${appState.session.displayName}${suffix}`);
}

function renderLoginState() {
  const loggedIn = Boolean(appState.session);
  const showGate = !loggedIn || appState.pendingSwitch;
  elements.loginGate.classList.toggle("hidden", !showGate);
  elements.loginCloseButton.classList.toggle("hidden", !appState.pendingSwitch);
  elements.currentUserBadge.classList.toggle("hidden", !loggedIn);
  updateScreen();

  if (loggedIn) {
    const suffix = appState.session.type === "admin" ? " (Admin)" : "";
    setElementText(elements.currentUserBadge, `${appState.session.displayName}${suffix}`);
  }

  if (showGate) {
    setLoginMode("name");
    populateLoginUserSelect();
  }
}

function handleLoginClose() {
  appState.pendingSwitch = false;
  renderLoginState();
}

function setLoginError(message) {
  elements.loginError.textContent = message || "";
  elements.loginError.classList.toggle("hidden", !message);
}

function setLoginMode(mode) {
  appState.loginMode = mode;
  elements.loginNameView.classList.toggle("hidden", mode !== "name");
  elements.loginAdminView.classList.toggle("hidden", mode !== "admin");
  setLoginError("");
}

function setLoginBusy(busy) {
  appState.loginBusy = busy;
  [elements.loginContinueButton, elements.loginCreateButton, elements.loginAdminSubmit].forEach((button) => {
    button.disabled = busy;
  });
}

async function populateLoginUserSelect() {
  if (!appState.supabaseClient) {
    return;
  }

  const { data, error } = await appState.supabaseClient
    .from("app_users")
    .select("id, first_name, last_name")
    .order("first_name", { ascending: true });

  if (error || !Array.isArray(data)) {
    return;
  }

  const previousValue = elements.loginUserSelect.value;
  elements.loginUserSelect.innerHTML = '<option value="">Select your name…</option>';
  data.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.first_name} ${user.last_name}`;
    option.dataset.firstName = user.first_name;
    option.dataset.lastName = user.last_name;
    elements.loginUserSelect.appendChild(option);
  });
  elements.loginUserSelect.value = previousValue;
}

function handleLoginUserSelectChange() {
  elements.loginContinueButton.disabled = !elements.loginUserSelect.value;
}

function handleLoginContinue() {
  const option = elements.loginUserSelect.selectedOptions[0];
  if (!option || !option.value) {
    return;
  }

  loginAsUser({
    id: option.value,
    firstName: option.dataset.firstName,
    lastName: option.dataset.lastName
  });
}

async function handleLoginCreateUser() {
  const firstName = elements.loginFirstName.value.trim();
  const lastName = elements.loginLastName.value.trim();

  if (!firstName || !lastName) {
    setLoginError("Enter a first and last name.");
    return;
  }

  if (!appState.supabaseClient) {
    setLoginError("Cloud sync isn't configured, so new users can't be saved.");
    return;
  }

  setLoginBusy(true);
  const { data, error } = await appState.supabaseClient
    .from("app_users")
    .insert({ first_name: firstName, last_name: lastName })
    .select("id, first_name, last_name")
    .single();
  setLoginBusy(false);

  if (error || !data) {
    setLoginError("Couldn't create that user. Try again.");
    return;
  }

  loginAsUser({ id: data.id, firstName: data.first_name, lastName: data.last_name });
}

function loginAsUser({ id, firstName, lastName }) {
  appState.pendingSwitch = false;
  appState.adminTab = "user";
  saveSession({
    type: "user",
    id,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`
  });
  renderLoginState();
  loadUserItemOrder();
}

async function handleLoginAdminSubmit() {
  const email = elements.loginAdminEmail.value.trim();
  const password = elements.loginAdminPassword.value;

  if (!email || !password) {
    setLoginError("Enter an email and password.");
    return;
  }

  if (!appState.supabaseClient) {
    setLoginError("Cloud sync isn't configured.");
    return;
  }

  setLoginBusy(true);
  const { data, error } = await appState.supabaseClient.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    setLoginBusy(false);
    setLoginError("Incorrect email or password.");
    return;
  }

  const { data: profile, error: profileError } = await appState.supabaseClient
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();
  setLoginBusy(false);

  if (profileError || !profile?.is_admin) {
    setLoginError("This account doesn't have admin access.");
    return;
  }

  appState.pendingSwitch = false;
  appState.adminTab = "items";
  saveSession({
    type: "admin",
    id: data.user.id,
    email,
    displayName: email
  });
  renderLoginState();
  loadUserItemOrder();
}

function handleSwitchUser() {
  if (IS_DEMO) {
    showMessage("Switching users is disabled in demo mode.");
    return;
  }
  appState.pendingSwitch = true;
  elements.loginAdminEmail.value = "";
  elements.loginAdminPassword.value = "";
  elements.loginFirstName.value = "";
  elements.loginLastName.value = "";
  elements.loginNewUserFields.classList.add("hidden");
  elements.loginContinueButton.disabled = true;
  renderLoginState();
}

function handleLogOut() {
  if (IS_DEMO) {
    showMessage("Log out is disabled in demo mode.");
    return;
  }
  clearSession();
  appState.pendingSwitch = false;
  appState.userItemOrder = [];
  renderPresetItems();
  elements.loginAdminEmail.value = "";
  elements.loginAdminPassword.value = "";
  elements.loginFirstName.value = "";
  elements.loginLastName.value = "";
  elements.loginNewUserFields.classList.add("hidden");
  elements.loginContinueButton.disabled = true;
  appState.hostAdminOpen = false;
  renderLoginState();
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
      defaultNoteIcons: appState.settings.defaultNoteIcons
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
    return false;
  }

  const saleDate = getLocalDateKey(order.timestamp);

  try {
    const { error } = await appState.supabaseClient
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
        created_at: order.timestamp,
        user_name: order.userName || null
      });
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    showMessage("Saved locally. Supabase sales sync failed.");
    return false;
  }
}

async function refreshReportData(options = {}) {
  const { silent = false } = options;
  const fallbackOrders = getLocalOrdersForDate(appState.reportFilterDate);

  if (!hasCloudConfig()) {
    appState.report.orders = fallbackOrders;
    renderReport();
    return;
  }

  if (!silent) {
    appState.reportLoading = true;
    renderReport();
  }

  try {
    const { data, error } = await appState.supabaseClient
      .from("sales_events")
      .select("order_id, sale_date, subtotal, tip, total, note, item_count, items_json, created_at, user_name")
      .eq("workspace_key", appState.settings.workspaceKey)
      .eq("sale_date", appState.reportFilterDate)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    appState.report.orders = (data || []).map((row) => ({
      id: row.order_id,
      timestamp: row.created_at,
      subtotal: Number(row.subtotal) || 0,
      tip: Number(row.tip) || 0,
      total: Number(row.total) || 0,
      note: row.note || "",
      userName: row.user_name || "",
      itemCount: Number(row.item_count) || 0,
      items: Array.isArray(row.items_json) ? row.items_json : []
    }));
  } catch (error) {
    appState.report.orders = fallbackOrders;
    showMessage("Could not load report from Supabase. Showing local sales for that day.");
  } finally {
    appState.reportLoading = false;
    renderReport();
  }
}

function getLocalOrdersForDate(dateString) {
  const local = loadReport().orders;
  return local.filter((order) => getLocalDateKey(order.timestamp) === dateString);
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
            price: roundMoney(Number(item.price)),
            variants: sanitizeVariants(item.variants)
          }))
          .filter((item) => item.name && item.price > 0)
      : DEFAULT_PRESET_ITEMS.map(cloneItem),
    defaultNoteIcons: typeof settings.defaultNoteIcons === "string" && settings.defaultNoteIcons.trim()
      ? settings.defaultNoteIcons.trim()
      : Array.isArray(settings.defaultNoteIcons) && sanitizeIcons(settings.defaultNoteIcons).length
        ? sanitizeIcons(settings.defaultNoteIcons).join("")
        : DEFAULT_NOTE_TEXT
  };
}

function sanitizeIcons(icons) {
  return Array.isArray(icons)
    ? ALLOWED_NOTE_ICONS.filter((icon) => icons.includes(icon))
    : [];
}

function sanitizeVariants(variants) {
  if (!Array.isArray(variants)) {
    return [];
  }
  const seen = new Set();
  const result = [];
  variants.forEach((entry) => {
    const isLegacyString = typeof entry === "string";
    const name = String(isLegacyString ? entry : entry?.name || "").trim();
    if (!name) {
      return;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const rawPrice = isLegacyString ? "" : entry?.price;
    const parsedPrice = Number.parseFloat(rawPrice);
    const price = rawPrice === "" || rawPrice === null || rawPrice === undefined || !Number.isFinite(parsedPrice) || parsedPrice <= 0
      ? null
      : roundMoney(parsedPrice);
    result.push({ name, price });
  });
  return result.slice(0, 12);
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

function isLocalDevHost() {
  return /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || isLocalDevHost()) {
    return;
  }

  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForUpdate) {
      return;
    }
    reloadedForUpdate = true;
    window.location.reload();
  });

  navigator.serviceWorker.register("service-worker.js").then((registration) => {
    registration.update();
  }).catch(() => {
    // Ignore registration errors for local previews.
  });
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

function formatReportDay(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

function formatLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatLocalDateString(date);
}

function getTodayDateString() {
  return formatLocalDateString(new Date());
}

function createId() {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneItem(item) {
  return {
    id: createId(),
    name: item.name,
    price: item.price,
    variants: Array.isArray(item.variants) ? [...item.variants] : []
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
