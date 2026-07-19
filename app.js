(() => {
  "use strict";

  const STORAGE = {
    route: "rs3-farm-route-v2",
    timers: "rs3-farm-timers-v1",
    activeRun: "rs3-farm-active-run-v2",
    history: "rs3-farm-history-v1",
    checklist: "rs3-farm-checklist-v2",
    preset: "rs3-farm-preset-v1",
    pofTimers: "rs3-farm-pof-timers-v1",
    alarmAck: "rs3-farm-alarm-ack-v1",
    snoozeUntil: "rs3-farm-snooze-until-v1"
  };

  const PRESET_NAMES = {
    full: "Full 200m XP Run",
    fruit: "Carambola Fruit Trees",
    regular: "Magic Trees",
    cactus: "Golden Dragonfruit",
    special: "Special Trees",
    pof: "Manor Farm Animals",
    ready: "Ready Patches Only"
  };


  // Exact RuneScape inventory sprites, served by Jagex's item database.
  // Noted protection items use their bank-note item IDs.
  const ITEM_SPRITES = {
    "Magic sapling": { id: 5374 },
    "Carambola sapling": { id: 48707 },
    "Calquat sapling": { id: 5503 },
    "Elder sapling": { id: 32294 },
    "Golden dragonfruit seed": { id: 48764 },
    "Noted coconuts": { id: 5975, noted: true },
    "Noted dragonfruit": { id: 48772, noted: true },
    "Noted poison ivy berries": { id: 6019, noted: true },
    "Noted morchella mushrooms": { id: 21623, noted: true },
    "Noted guarana fruit": { id: 48589, noted: true },
    "Grasping rune pouch": { id: 52215 },
    "Urn enhancer": { id: 36837 },
    "Exquisite farming urn": { id: 59146 },
    "Money tree seed": { id: 48770 }
  };

  const INVENTORY_ORDER = [
    "Magic sapling",
    "Carambola sapling",
    "Calquat sapling",
    "Elder sapling",
    "Golden dragonfruit seed",
    "Noted coconuts",
    "Noted dragonfruit",
    "Noted poison ivy berries",
    "Noted morchella mushrooms",
    "Noted guarana fruit",
    "Grasping rune pouch",
    "Urn enhancer",
    "Exquisite farming urn"
  ];

  const POF_PENS = [
    { id: "small-1", name: "Small Pen 1", animal: "Chinchompas", count: 6, food: "Woad leaves", growthMinutes: 2400, growthLabel: "40h" },
    { id: "small-2", name: "Small Pen 2", animal: "Chinchompas", count: 6, food: "Woad leaves", growthMinutes: 2400, growthLabel: "40h" },
    { id: "medium-1", name: "Medium Pen 1", animal: "Zygomites", count: 4, food: "Gorajian mushrooms", growthMinutes: 4800, growthLabel: "80h" },
    { id: "medium-2", name: "Medium Pen 2", animal: "Zygomites", count: 4, food: "Gorajian mushrooms", growthMinutes: 4800, growthLabel: "80h" },
    { id: "large-1", name: "Large Pen 1", animal: "Dragons", count: 3, food: "Raw tuna", growthMinutes: 9600, growthLabel: "160h" },
    { id: "large-2", name: "Large Pen 2", animal: "Dragons", count: 3, food: "Raw tuna", growthMinutes: 9600, growthLabel: "160h" },
    { id: "breeding", name: "Breeding Pen", animal: "Dragons", count: 4, food: "Raw tuna", growthMinutes: 9600, growthLabel: "160h" }
  ];

  const DEFAULT_ROUTE = [
    {
      id: "manor-pof",
      order: 0,
      group: "Player-Owned Farm",
      location: "Manor Farm — Animal Pens",
      patchType: "Regular Manor Farm pens",
      plant: "Collect elders, replace animals, and refill troughs",
      teleport: "Master farmer outfit → Manor Farm",
      directions: "Use the pen selector below and check only the pens you actually emptied and replaced.",
      paymentItem: "Woad leaves · Gorajian mushrooms · raw tuna",
      paymentQty: 0,
      growthMinutes: 0,
      growthLabel: "40h / 80h / 160h",
      xp: 0,
      inventoryItem: "",
      inventoryType: "none",
      isPof: true,
      note: "Completing this step starts individual elder timers for selected Manor Farm pens. Ranch Out of Time is intentionally excluded."
    },
    {
      id: "manor-money",
      order: 1,
      group: "Special Tree",
      location: "Manor Farm",
      patchType: "Money-tree patch",
      plant: "Money tree seed, only when ready and available",
      teleport: "Master farmer outfit → Manor Farm",
      directions: "The money-tree patch is beside the Manor Farm activity area and bank.",
      paymentItem: "None",
      paymentQty: 0,
      growthMinutes: 2560,
      growthLabel: "1d 18h 40m",
      xp: 60000,
      inventoryItem: "Money tree seed",
      inventoryType: "optional",
      note: "Optional on each run. The seed is planted directly and the tree cannot become diseased. Withdraw it from the Manor Farm bank only when this patch is ready."
    },
    {
      id: "brimhaven-fruit",
      order: 2,
      group: "Fruit Tree",
      location: "Brimhaven",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Spirit tree → Brimhaven",
      directions: "Run west from the spirit tree to the fruit-tree patch.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "gnome-stronghold-fruit",
      order: 3,
      group: "Fruit Tree",
      location: "Tree Gnome Stronghold",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Spirit tree → Tree Gnome Stronghold",
      directions: "Run east from the spirit tree to the fruit-tree patch.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual",
      note: "The regular-tree patch is the next step at the same destination."
    },
    {
      id: "gnome-stronghold-regular",
      order: 4,
      group: "Regular Tree",
      location: "Tree Gnome Stronghold",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Stay in Tree Gnome Stronghold",
      directions: "Run southwest from the spirit-tree area to the regular-tree patch.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "gnome-village-fruit",
      order: 5,
      group: "Fruit Tree",
      location: "Tree Gnome Village",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Spirit tree → Tree Gnome Village",
      directions: "Use the loose railing, ask Elkoy to guide you out, then run southwest.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "catherby-fruit",
      order: 6,
      group: "Fruit Tree",
      location: "Catherby",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Catherby Teleport or Catherby lodestone",
      directions: "Run east/southeast from the lodestone to the fruit-tree patch.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "habitat-fruit",
      order: 7,
      group: "Fruit Tree",
      location: "Herblore Habitat",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Master farmer outfit → Herblore Habitat",
      directions: "Run to the fruit-tree patch inside the habitat farming area.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "lletya-fruit",
      order: 8,
      group: "Fruit Tree",
      location: "Lletya",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Tirannwn quiver 4 → Lletya",
      directions: "Run southeast through Lletya to the fruit-tree patch.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "meilyr-fruit",
      order: 9,
      group: "Fruit Tree",
      location: "Prifddinas — Meilyr",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "POH Seren Teleport Stone → 8. Meilyr (Prifddinas)",
      directions: "Run north/northwest toward the fruit-tree patch.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "trahaearn-regular",
      order: 10,
      group: "Regular Tree",
      location: "Prifddinas — Trahaearn",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "POH Seren Teleport Stone → 9. Trahaearn (Prifddinas)",
      directions: "Run to the regular-tree patch on the outer side of the district.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "crwys-elder",
      order: 11,
      group: "Special Tree",
      location: "Prifddinas — Crwys",
      patchType: "Elder-tree patch",
      plant: "Elder sapling",
      teleport: "POH Seren Teleport Stone → 4. Crwys (Prifddinas)",
      directions: "Run to the elder-tree patch on the outer section of Crwys.",
      paymentItem: "Noted morchella mushrooms",
      paymentQty: 23,
      growthMinutes: 4200,
      growthLabel: "70h",
      xp: 23463,
      inventoryItem: "Elder sapling",
      inventoryType: "individual",
      note: "Normally include this step only when the elder tree is ready."
    },
    {
      id: "prif-crystal",
      order: 12,
      group: "Special Tree",
      location: "Prifddinas — Tower of Voices",
      patchType: "Crystal-tree patch",
      plant: "Harvest crystal blossom",
      teleport: "Prifddinas lodestone",
      directions: "Run to the southeast side of the Tower of Voices.",
      paymentItem: "None",
      paymentQty: 0,
      growthMinutes: 1440,
      growthLabel: "Daily",
      xp: 15000,
      inventoryItem: "Crystal acorn",
      inventoryType: "optional",
      note: "Do not replace the tree during normal daily runs. A crystal acorn is only needed when first establishing the patch."
    },
    {
      id: "havenhythe-regular",
      order: 13,
      group: "Regular Tree",
      location: "Havenhythe — Dalia's Tree Nursery",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Wendlewick Teleport → Marigold Farm",
      directions: "Use the right-click farm destination, then enter Dalia's nursery.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual",
      note: "Complete all three Havenhythe nursery patches before leaving."
    },
    {
      id: "havenhythe-fruit",
      order: 14,
      group: "Fruit Tree",
      location: "Havenhythe — Dalia's Tree Nursery",
      patchType: "Carambola fruit-tree patch",
      plant: "Carambola sapling",
      teleport: "Stay at Dalia's Tree Nursery",
      directions: "Move to the fruit-tree patch in the nursery.",
      paymentItem: "Noted dragonfruit",
      paymentQty: 7,
      growthMinutes: 800,
      growthLabel: "13h 20m",
      xp: 41254.1,
      inventoryItem: "Carambola sapling",
      inventoryType: "individual"
    },
    {
      id: "havenhythe-calquat",
      order: 15,
      group: "Calquat",
      location: "Havenhythe — Dalia's Tree Nursery",
      patchType: "Calquat-tree patch",
      plant: "Calquat sapling",
      teleport: "Stay at Dalia's Tree Nursery",
      directions: "Move to the calquat patch before leaving the nursery.",
      paymentItem: "Noted poison ivy berries",
      paymentQty: 6,
      growthMinutes: 1280,
      growthLabel: "21h 20m",
      xp: 12516.6,
      inventoryItem: "Calquat sapling",
      inventoryType: "individual"
    },
    {
      id: "lumbridge-regular",
      order: 16,
      group: "Regular Tree",
      location: "Lumbridge",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Lumbridge Teleport or lodestone",
      directions: "Run toward the regular-tree patch near the general-store side of town.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "varrock-regular",
      order: 17,
      group: "Regular Tree",
      location: "Varrock",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Varrock Teleport",
      directions: "Enter the Varrock Castle courtyard and use the regular-tree patch.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "falador-regular",
      order: 18,
      group: "Regular Tree",
      location: "Falador",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Falador Teleport",
      directions: "Run into Falador Park to the regular-tree patch.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "taverley-regular",
      order: 19,
      group: "Regular Tree",
      location: "Taverley",
      patchType: "Magic-tree patch",
      plant: "Magic sapling",
      teleport: "Taverley lodestone",
      directions: "Run north from the lodestone to the regular-tree patch.",
      paymentItem: "Noted coconuts",
      paymentQty: 23,
      growthMinutes: 480,
      growthLabel: "8h",
      xp: 13913.8,
      inventoryItem: "Magic sapling",
      inventoryType: "individual"
    },
    {
      id: "anachronia-cactus",
      order: 20,
      group: "Cactus",
      location: "Anachronia",
      patchType: "Golden-dragonfruit cactus patch",
      plant: "Golden dragonfruit seed",
      teleport: "Anachronia Teleport → Totem of the Abyss",
      directions: "The cactus patch is close to the active Totem of the Abyss location.",
      paymentItem: "Noted guarana fruit",
      paymentQty: 1,
      growthMinutes: 560,
      growthLabel: "9h 20m",
      xp: 28480,
      inventoryItem: "Golden dragonfruit seed",
      inventoryType: "stack"
    },
    {
      id: "menaphos-cactus",
      order: 21,
      group: "Cactus",
      location: "Menaphos — Imperial District",
      patchType: "Golden-dragonfruit cactus patch",
      plant: "Golden dragonfruit seed",
      teleport: "Menaphos Imperial district teleport",
      directions: "Run northwest toward Zahra and the constructed cactus patch.",
      paymentItem: "Noted guarana fruit",
      paymentQty: 1,
      growthMinutes: 560,
      growthLabel: "9h 20m",
      xp: 28480,
      inventoryItem: "Golden dragonfruit seed",
      inventoryType: "stack"
    },
    {
      id: "hets-oasis-cactus",
      order: 22,
      group: "Cactus",
      location: "Het's Oasis",
      patchType: "Golden-dragonfruit cactus patch",
      plant: "Golden dragonfruit seed",
      teleport: "Ring of duelling → Het's Oasis",
      directions: "Run north toward the Archaeology table; the cactus patch is nearby.",
      paymentItem: "Noted guarana fruit",
      paymentQty: 1,
      growthMinutes: 560,
      growthLabel: "9h 20m",
      xp: 28480,
      inventoryItem: "Golden dragonfruit seed",
      inventoryType: "stack"
    },
    {
      id: "alkharid-cactus",
      order: 23,
      group: "Cactus",
      location: "Al Kharid",
      patchType: "Golden-dragonfruit cactus patch",
      plant: "Golden dragonfruit seed",
      teleport: "Al Kharid lodestone",
      directions: "Run northeast/east from the lodestone to the cactus patch.",
      paymentItem: "Noted guarana fruit",
      paymentQty: 1,
      growthMinutes: 560,
      growthLabel: "9h 20m",
      xp: 28480,
      inventoryItem: "Golden dragonfruit seed",
      inventoryType: "stack"
    },
    {
      id: "tai-bwo-calquat",
      order: 24,
      group: "Calquat",
      location: "Tai Bwo Wannai",
      patchType: "Calquat-tree patch",
      plant: "Calquat sapling",
      teleport: "Tai Bwo Wannai teleport scroll",
      directions: "Run north to the calquat-tree patch.",
      paymentItem: "Noted poison ivy berries",
      paymentQty: 6,
      growthMinutes: 1280,
      growthLabel: "21h 20m",
      xp: 12516.6,
      inventoryItem: "Calquat sapling",
      inventoryType: "individual"
    }
  ];

  const els = {};
  let route = loadJson(STORAGE.route, DEFAULT_ROUTE);
  let timers = loadJson(STORAGE.timers, {});
  let history = loadJson(STORAGE.history, []);
  let activeRun = loadJson(STORAGE.activeRun, null);
  let pofTimers = loadJson(STORAGE.pofTimers, {});
  let alarmAck = loadJson(STORAGE.alarmAck, {});
  let snoozeUntil = Number(localStorage.getItem(STORAGE.snoozeUntil) || 0);
  let toastTimeout = null;
  let timerInterval = null;
  let audioContext = null;
  let soundEnabled = false;
  const playedAlarmKeys = new Set();

  if (!route.some(step => step.id === "manor-pof")) {
    route = [structuredCloneSafe(DEFAULT_ROUTE.find(step => step.id === "manor-pof")), ...route];
    saveJson(STORAGE.route, route);
  }

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    restoreChecklist();
    const savedPreset = localStorage.getItem(STORAGE.preset) || "full";
    els.routePreset.value = PRESET_NAMES[savedPreset] ? savedPreset : "full";
    renderAll();
    timerInterval = window.setInterval(updateLiveTimers, 1000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateLiveTimers();
    });
    window.addEventListener("focus", updateLiveTimers);
    window.addEventListener("pageshow", updateLiveTimers);
  }

  function cacheElements() {
    [
      "menuButton", "closeMenuButton", "sideMenu", "menuScrim", "routePreset", "startRunButton",
      "emptyStartButton", "emptyState", "runner", "selectedRouteName", "routeProgress", "routeXp",
      "nextReady", "runTimer", "stepGroupBadge", "stepReadinessBadge", "stepNumber", "stepLocation",
      "stepSubtitle", "stepTimer", "stepTeleport", "stepDirections", "stepPlant", "stepGrowth",
      "stepPayment", "stepReadyAt", "stepLastCompleted", "stepNote", "previousButton", "skipButton",
      "completeButton", "copyTeleportButton", "upcomingSteps", "completedCount", "skippedCount",
      "runStartedAt", "openJumpButton", "openJumpInlineButton", "jumpDialog", "jumpList",
      "openInventoryButton", "inventoryDialog", "inventoryGrid", "inventoryLegend", "inventoryNotes", "openHistoryButton",
      "historyDialog", "historyList", "exportHistoryButton", "clearHistoryButton", "clearChecklistButton",
      "csvFileInput", "downloadTemplateButton", "exportRouteButton", "restoreDefaultButton",
      "patchDashboard", "patchStatusGrid", "activeAlarmCount", "alarmStatusText", "alarmPatchCount",
      "readyPatchCount", "growingPatchCount", "alarmControl", "enableAlarmButton", "snoozeAllButton",
      "openTimersButton", "timersDialog", "timerTabPlots", "timerTabPof",
      "pofDashboard", "pofStatusGrid", "pofNextReady", "standardActionChecklist", "pofPenSelector",
      "pofPenChecks", "selectAllPofButton", "plantPanelTitle", "paymentPanelTitle", "timerPanelTitle", "toast"
    ].forEach(id => { els[id] = document.getElementById(id); });
    els.actionChecks = [...document.querySelectorAll("[data-action]")];
    els.gearChecks = [...document.querySelectorAll(".gear-check")];
  }

  function bindEvents() {
    els.menuButton.addEventListener("click", openMenu);
    els.closeMenuButton.addEventListener("click", closeMenu);
    els.menuScrim.addEventListener("click", closeMenu);
    els.routePreset.addEventListener("change", () => {
      localStorage.setItem(STORAGE.preset, els.routePreset.value);
      renderSummary();
    });
    els.startRunButton.addEventListener("click", () => startRun(els.routePreset.value));
    els.emptyStartButton.addEventListener("click", () => startRun(els.routePreset.value));
    els.previousButton.addEventListener("click", previousStep);
    els.skipButton.addEventListener("click", skipStep);
    els.completeButton.addEventListener("click", completeStep);
    els.copyTeleportButton.addEventListener("click", copyCurrentTeleport);
    els.openJumpButton.addEventListener("click", openJumpDialog);
    els.openJumpInlineButton.addEventListener("click", openJumpDialog);
    els.openInventoryButton.addEventListener("click", openInventoryDialog);
    els.openHistoryButton.addEventListener("click", openHistoryDialog);
    els.clearChecklistButton.addEventListener("click", clearChecklist);
    els.gearChecks.forEach((checkbox, index) => checkbox.addEventListener("change", () => saveChecklist(index, checkbox.checked)));
    els.openTimersButton.addEventListener("click", openTimersDialog);
    els.timerTabPlots.addEventListener("click", () => showTimerTab("plots"));
    els.timerTabPof.addEventListener("click", () => showTimerTab("pof"));
    els.enableAlarmButton.addEventListener("click", enableAlarmSound);
    els.snoozeAllButton.addEventListener("click", snoozeAllAlarms);
    els.selectAllPofButton.addEventListener("click", selectAllPofPens);
    els.csvFileInput.addEventListener("change", importCsv);
    els.downloadTemplateButton.addEventListener("click", downloadCsvTemplate);
    els.exportRouteButton.addEventListener("click", exportCurrentRoute);
    els.restoreDefaultButton.addEventListener("click", restoreDefaultRoute);
    els.exportHistoryButton.addEventListener("click", exportHistory);
    els.clearHistoryButton.addEventListener("click", clearHistory);
    document.addEventListener("keydown", handleKeyboard);
    window.addEventListener("rs3-farm-overlay-wake", () => {
      renderAll();
      processAlarms();
    });
  }

  function openMenu() {
    els.sideMenu.classList.add("open");
    els.sideMenu.setAttribute("aria-hidden", "false");
    els.menuScrim.hidden = false;
  }

  function closeMenu() {
    els.sideMenu.classList.remove("open");
    els.sideMenu.setAttribute("aria-hidden", "true");
    els.menuScrim.hidden = true;
  }

  function openTimersDialog() {
    renderPatchDashboard();
    renderPofDashboard();
    const manorAlarm = allTimerItems().some(item => item.kind === "pof" && ["alarm", "snoozed"].includes(getTimerStatus(item, Date.now()).code));
    showTimerTab(manorAlarm ? "pof" : "plots");
    els.timersDialog.showModal();
  }

  function showTimerTab(tab) {
    const showPof = tab === "pof";
    els.patchDashboard.hidden = showPof;
    els.pofDashboard.hidden = !showPof;
    els.timerTabPlots.classList.toggle("active", !showPof);
    els.timerTabPof.classList.toggle("active", showPof);
    els.timerTabPlots.setAttribute("aria-selected", String(!showPof));
    els.timerTabPof.setAttribute("aria-selected", String(showPof));
  }

  function getPresetRoute(preset) {
    const sorted = [...route].sort((a, b) => Number(a.order) - Number(b.order));
    if (preset === "fruit") return sorted.filter(step => step.group === "Fruit Tree");
    if (preset === "regular") return sorted.filter(step => step.group === "Regular Tree");
    if (preset === "cactus") return sorted.filter(step => step.group === "Cactus");
    if (preset === "special") return sorted.filter(step => ["Special Tree", "Calquat"].includes(step.group));
    if (preset === "pof") return sorted.filter(step => step.isPof || step.id === "manor-pof");
    if (preset === "ready") return sorted.filter(step => step.isPof ? anyPofReady() : isPatchReady(step.id));
    return sorted;
  }

  function startRun(preset = "full") {
    const selected = getPresetRoute(preset);
    if (!selected.length) {
      showToast("No saved patches are ready yet.");
      return;
    }

    const now = Date.now();
    const alarmsBeforeStart = allTimerItems().filter(item => getTimerStatus(item, now).code === "alarm");
    armAlarmSound();
    if (alarmsBeforeStart.length && soundEnabled) playAlarmChime();
    acknowledgeCurrentAlarms(now);
    els.pofPenChecks.innerHTML = "";
    activeRun = {
      id: `run-${now}`,
      preset,
      routeName: PRESET_NAMES[preset] || "Imported Route",
      routeIds: selected.map(step => step.id),
      startedAt: now,
      currentIndex: 0,
      currentStepStartedAt: now,
      records: selected.map(step => ({ id: step.id, status: "pending" }))
    };
    saveActiveRun();
    clearActionChecks();
    closeMenu();
    renderAll();
    showToast(`${activeRun.routeName} started.`);
  }

  function getActiveSteps() {
    if (!activeRun) return [];
    return activeRun.routeIds.map(id => route.find(step => step.id === id)).filter(Boolean);
  }

  function getCurrentStep() {
    const steps = getActiveSteps();
    return steps[activeRun?.currentIndex ?? 0] || null;
  }

  function completeStep() {
    if (!activeRun) return;
    const step = getCurrentStep();
    const now = Date.now();

    if (step.isPof || step.id === "manor-pof") {
      const selectedPens = [...els.pofPenChecks.querySelectorAll("[data-pof-pen]:checked")].map(input => input.dataset.pofPen);
      if (!selectedPens.length) {
        showToast("Select at least one Manor Farm pen, or use Skip.");
        return;
      }
      selectedPens.forEach(id => {
        const pen = POF_PENS.find(item => item.id === id);
        if (!pen) return;
        pofTimers[id] = {
          lastCompleted: now,
          readyAt: now + Number(pen.growthMinutes) * 60_000
        };
        delete alarmAck[`pof:${id}`];
      });
      saveJson(STORAGE.pofTimers, pofTimers);
      saveJson(STORAGE.alarmAck, alarmAck);
    } else {
      timers[step.id] = {
        lastCompleted: now,
        readyAt: now + Number(step.growthMinutes || 0) * 60_000
      };
      delete alarmAck[`patch:${step.id}`];
      saveJson(STORAGE.timers, timers);
      saveJson(STORAGE.alarmAck, alarmAck);
    }

    const record = activeRun.records[activeRun.currentIndex];
    record.status = "completed";
    record.completedAt = now;
    record.splitSeconds = Math.max(0, Math.round((now - activeRun.currentStepStartedAt) / 1000));
    advanceOrFinish();
  }

  function skipStep() {
    if (!activeRun) return;
    const now = Date.now();
    const record = activeRun.records[activeRun.currentIndex];
    record.status = "skipped";
    record.completedAt = now;
    record.splitSeconds = Math.max(0, Math.round((now - activeRun.currentStepStartedAt) / 1000));
    advanceOrFinish();
  }

  function advanceOrFinish() {
    if (activeRun.currentIndex >= activeRun.routeIds.length - 1) {
      finishRun();
      return;
    }
    activeRun.currentIndex += 1;
    activeRun.currentStepStartedAt = Date.now();
    saveActiveRun();
    clearActionChecks();
    renderAll();
  }

  function previousStep() {
    if (!activeRun || activeRun.currentIndex <= 0) return;
    activeRun.currentIndex -= 1;
    activeRun.currentStepStartedAt = Date.now();
    saveActiveRun();
    clearActionChecks();
    renderAll();
  }

  function jumpToStep(index) {
    if (!activeRun || index < 0 || index >= activeRun.routeIds.length) return;
    activeRun.currentIndex = index;
    activeRun.currentStepStartedAt = Date.now();
    saveActiveRun();
    clearActionChecks();
    els.jumpDialog.close();
    closeMenu();
    renderAll();
  }

  function finishRun() {
    const endedAt = Date.now();
    const completed = activeRun.records.filter(r => r.status === "completed").length;
    const skipped = activeRun.records.filter(r => r.status === "skipped").length;
    const result = {
      ...activeRun,
      endedAt,
      durationSeconds: Math.round((endedAt - activeRun.startedAt) / 1000),
      completed,
      skipped
    };
    history.unshift(result);
    history = history.slice(0, 50);
    saveJson(STORAGE.history, history);
    activeRun = null;
    localStorage.removeItem(STORAGE.activeRun);
    renderAll();
    showToast(`Run complete: ${completed} completed, ${skipped} skipped.`);
  }

  function renderAll() {
    renderSummary();
    renderPatchDashboard();
    renderPofDashboard();
    if (!activeRun || !getCurrentStep()) {
      els.emptyState.hidden = false;
      els.runner.hidden = true;
      els.startRunButton.textContent = "Start Run";
      updateLiveTimers();
      return;
    }
    els.emptyState.hidden = true;
    els.runner.hidden = false;
    els.startRunButton.textContent = "Restart Run";
    renderCurrentStep();
    renderUpcoming();
    renderRunStats();
    updateLiveTimers();
  }

  function renderSummary() {
    const preset = activeRun?.preset || els.routePreset?.value || "full";
    const selected = activeRun ? getActiveSteps() : getPresetRoute(preset);
    els.selectedRouteName.textContent = activeRun?.routeName || PRESET_NAMES[preset] || "Custom Route";
    const completed = activeRun ? activeRun.records.filter(r => r.status === "completed").length : 0;
    els.routeProgress.textContent = `${completed} / ${selected.length}`;
    const xp = selected.reduce((sum, step) => sum + Number(step.xp || 0), 0);
    els.routeXp.textContent = xp ? `${Math.round(xp).toLocaleString()} base XP` : "—";
    if (!activeRun && els.emptyStartButton) {
      els.emptyStartButton.textContent = `Start ${PRESET_NAMES[preset] || "Run"}`;
    }
    renderNextReady();
  }

  function renderCurrentStep() {
    const step = getCurrentStep();
    const index = activeRun.currentIndex;
    const isPofStep = Boolean(step.isPof || step.id === "manor-pof");
    const ready = isPofStep ? anyPofReady() : isPatchReady(step.id);
    els.stepGroupBadge.textContent = step.group;
    els.stepReadinessBadge.textContent = ready ? "READY" : "TIMER ACTIVE";
    els.stepReadinessBadge.classList.toggle("badge-ready", ready);
    els.stepReadinessBadge.classList.toggle("badge-waiting", !ready);
    els.stepNumber.textContent = `Step ${index + 1} of ${activeRun.routeIds.length}`;
    els.stepLocation.textContent = step.location;
    els.stepSubtitle.textContent = step.patchType;
    els.stepTeleport.textContent = step.teleport;
    els.stepDirections.textContent = step.directions;
    els.stepPlant.textContent = step.plant;
    els.stepGrowth.textContent = `Growth: ${step.growthLabel || formatDuration(Number(step.growthMinutes || 0) * 60)}`;
    els.stepPayment.textContent = isPofStep
      ? step.paymentItem
      : (Number(step.paymentQty) > 0 ? `${step.paymentQty} ${step.paymentItem}` : "No protection payment");

    els.standardActionChecklist.hidden = isPofStep;
    els.pofPenSelector.hidden = !isPofStep;
    els.plantPanelTitle.textContent = isPofStep ? "Task" : "Plant";
    els.paymentPanelTitle.textContent = isPofStep ? "Feed" : "Protection";
    els.timerPanelTitle.textContent = isPofStep ? "Pen timers" : "Patch timer";

    if (isPofStep) {
      renderPofPenSelector();
      const next = getNextPofTimer();
      const started = Object.values(pofTimers).filter(timer => timer?.lastCompleted).sort((a, b) => Number(b.lastCompleted) - Number(a.lastCompleted))[0];
      els.stepLastCompleted.textContent = started?.lastCompleted ? `Most recent pen reset ${formatDateTime(started.lastCompleted)}.` : "No Manor Farm pen timers started.";
      els.stepReadyAt.textContent = next
        ? (Number(next.readyAt) <= Date.now() ? "At least one pen is ready now" : `${formatDateTime(next.readyAt)} · ${formatCountdown(next.readyAt - Date.now())}`)
        : "No saved pen timer";
    } else {
      const timer = timers[step.id];
      if (timer?.lastCompleted) {
        els.stepLastCompleted.textContent = `Last completed ${formatDateTime(timer.lastCompleted)}.`;
        els.stepReadyAt.textContent = isPatchReady(step.id) ? "Ready now" : formatDateTime(timer.readyAt);
      } else {
        els.stepLastCompleted.textContent = "Not completed on this device.";
        els.stepReadyAt.textContent = "No saved timer";
      }
    }

    els.stepNote.hidden = !step.note;
    els.stepNote.textContent = step.note || "";
    els.previousButton.disabled = index === 0;
  }

  function renderUpcoming() {
    const steps = getActiveSteps();
    const start = activeRun.currentIndex + 1;
    const upcoming = steps.slice(start, start + 4);
    els.upcomingSteps.innerHTML = "";
    if (!upcoming.length) {
      els.upcomingSteps.innerHTML = '<p class="muted">This is the final step.</p>';
      return;
    }
    upcoming.forEach((step, offset) => {
      const index = start + offset;
      const button = document.createElement("button");
      button.className = "upcoming-item";
      button.innerHTML = `<strong>${index + 1}. ${escapeHtml(step.location)}</strong><span>${escapeHtml(step.patchType)}</span>`;
      button.addEventListener("click", () => jumpToStep(index));
      els.upcomingSteps.appendChild(button);
    });
  }

  function renderRunStats() {
    if (!activeRun) return;
    els.completedCount.textContent = activeRun.records.filter(r => r.status === "completed").length;
    els.skippedCount.textContent = activeRun.records.filter(r => r.status === "skipped").length;
    els.runStartedAt.textContent = formatDateTime(activeRun.startedAt, true);
  }

  function renderNextReady() {
    const now = Date.now();
    const futurePatches = Object.entries(timers).map(([id, value]) => ({
      key: `patch:${id}`,
      label: route.find(item => item.id === id)?.location || "Patch",
      ...value
    }));
    const futurePens = Object.entries(pofTimers).map(([id, value]) => ({
      key: `pof:${id}`,
      label: POF_PENS.find(item => item.id === id)?.name || "Manor Farm pen",
      ...value
    }));
    const future = [...futurePatches, ...futurePens]
      .filter(value => Number(value.readyAt) > now)
      .sort((a, b) => a.readyAt - b.readyAt)[0];
    if (!future) {
      els.nextReady.textContent = "All unsaved / ready";
      return;
    }
    els.nextReady.textContent = `${future.label} · ${formatCountdown(future.readyAt - now)}`;
  }

  function updateLiveTimers() {
    const now = Date.now();
    if (activeRun) {
      els.runTimer.textContent = formatClock((now - activeRun.startedAt) / 1000);
      els.stepTimer.textContent = formatShortClock((now - activeRun.currentStepStartedAt) / 1000);
      const step = getCurrentStep();
      if (step?.isPof || step?.id === "manor-pof") {
        const next = getNextPofTimer();
        if (next) {
          els.stepReadyAt.textContent = Number(next.readyAt) <= now
            ? "At least one pen is ready now"
            : `${formatDateTime(next.readyAt)} · ${formatCountdown(next.readyAt - now)}`;
        }
      } else {
        const timer = step && timers[step.id];
        if (timer && timer.readyAt > now) {
          els.stepReadyAt.textContent = `${formatDateTime(timer.readyAt)} · ${formatCountdown(timer.readyAt - now)}`;
        }
      }
    } else {
      els.runTimer.textContent = "00:00:00";
    }
    renderNextReady();
    renderPatchDashboard();
    renderPofDashboard();
    processAlarms();
  }

  function isPatchReady(id) {
    const timer = timers[id];
    return !timer || !timer.readyAt || Date.now() >= Number(timer.readyAt);
  }


  function anyPofReady() {
    return POF_PENS.some(pen => {
      const timer = pofTimers[pen.id];
      return !timer?.readyAt || Date.now() >= Number(timer.readyAt);
    });
  }

  function getNextPofTimer() {
    const entries = POF_PENS
      .map(pen => ({ pen, ...(pofTimers[pen.id] || {}) }))
      .filter(item => item.readyAt)
      .sort((a, b) => Number(a.readyAt) - Number(b.readyAt));
    const overdue = entries.filter(item => Number(item.readyAt) <= Date.now());
    return overdue[0] || entries[0] || null;
  }

  function renderPofPenSelector() {
    if (els.pofPenChecks.children.length) return;
    POF_PENS.forEach(pen => {
      const label = document.createElement("label");
      label.className = "pof-pen-check";
      label.innerHTML = `
        <input type="checkbox" data-pof-pen="${escapeHtml(pen.id)}" checked />
        <span>
          <strong>${escapeHtml(pen.name)} — ${escapeHtml(pen.animal)} ×${pen.count}</strong>
          <small>${escapeHtml(pen.growthLabel)} to elder · Feed ${escapeHtml(pen.food)}</small>
        </span>`;
      els.pofPenChecks.appendChild(label);
    });
  }

  function selectAllPofPens() {
    renderPofPenSelector();
    els.pofPenChecks.querySelectorAll("[data-pof-pen]").forEach(input => {
      input.checked = true;
    });
    showToast("All Manor Farm pens selected.");
  }

  function allTimerItems() {
    const patchItems = route
      .filter(step => !(step.isPof || step.id === "manor-pof"))
      .map(step => ({
        key: `patch:${step.id}`,
        kind: "patch",
        id: step.id,
        label: step.location,
        subtitle: step.patchType,
        group: step.group,
        timer: timers[step.id] || null,
        step
      }));
    const pofItems = POF_PENS.map(pen => ({
      key: `pof:${pen.id}`,
      kind: "pof",
      id: pen.id,
      label: pen.name,
      subtitle: `${pen.animal} ×${pen.count}`,
      group: "Manor Farm",
      timer: pofTimers[pen.id] || null,
      pen
    }));
    return [...patchItems, ...pofItems];
  }

  function getTimerStatus(item, now = Date.now()) {
    const timer = item.timer;
    if (!timer?.readyAt) {
      return { code: "ready", badge: "READY", time: "No timer saved", hasTimer: false };
    }
    const readyAt = Number(timer.readyAt);
    if (readyAt > now) {
      return {
        code: "growing",
        badge: "GROWING",
        time: formatCountdown(readyAt - now),
        detail: `Ready ${formatDateTime(readyAt)}`,
        hasTimer: true
      };
    }
    if (Number(alarmAck[item.key]) === readyAt) {
      return {
        code: "ready",
        badge: "READY",
        time: "Ready now",
        detail: `Finished ${formatDateTime(readyAt)}`,
        hasTimer: true,
        acknowledged: true
      };
    }
    if (snoozeUntil > now) {
      return {
        code: "snoozed",
        badge: "SNOOZED",
        time: formatCountdown(snoozeUntil - now),
        detail: `Finished ${formatDateTime(readyAt)}`,
        hasTimer: true
      };
    }
    return {
      code: "alarm",
      badge: "ALARM",
      time: "Finished",
      detail: formatDateTime(readyAt),
      hasTimer: true
    };
  }

  function renderPatchDashboard() {
    if (!els.patchStatusGrid) return;
    const now = Date.now();
    const items = allTimerItems();
    const patchItems = items.filter(item => item.kind === "patch");
    const states = items.map(item => ({ item, status: getTimerStatus(item, now) }));
    const patchStates = patchItems.map(item => ({ item, status: getTimerStatus(item, now) }));
    const alarmCount = states.filter(entry => ["alarm", "snoozed"].includes(entry.status.code)).length;
    const patchAlarmCount = patchStates.filter(entry => ["alarm", "snoozed"].includes(entry.status.code)).length;
    const readyCount = patchStates.filter(entry => entry.status.code === "ready").length;
    const growingCount = patchStates.filter(entry => entry.status.code === "growing").length;

    els.alarmPatchCount.textContent = patchAlarmCount;
    els.readyPatchCount.textContent = readyCount;
    els.growingPatchCount.textContent = growingCount;
    els.activeAlarmCount.textContent = `${alarmCount} active alarm${alarmCount === 1 ? "" : "s"}`;
    els.alarmControl.classList.toggle("has-alarm", alarmCount > 0 && snoozeUntil <= now);
    els.alarmControl.classList.toggle("is-snoozed", alarmCount > 0 && snoozeUntil > now);
    els.snoozeAllButton.disabled = alarmCount === 0;

    if (!alarmCount) {
      els.alarmStatusText.textContent = "No plots or Manor Farm pens are currently alarming.";
    } else if (snoozeUntil > now) {
      els.alarmStatusText.textContent = `All alarms snoozed until ${formatDateTime(snoozeUntil)}.`;
    } else {
      els.alarmStatusText.textContent = "A timer finished. Start Run acknowledges active alarms, or snooze all for one hour.";
    }

    els.enableAlarmButton.textContent = soundEnabled ? "Sound enabled" : "Enable sound";
    els.enableAlarmButton.disabled = soundEnabled;

    els.patchStatusGrid.innerHTML = "";
    patchItems.forEach(item => {
      const status = getTimerStatus(item, now);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `patch-status-card status-${status.code}`;
      button.innerHTML = `
        <div>
          <div class="patch-card-top">
            <span class="patch-card-group">${escapeHtml(item.group)}</span>
            <span class="patch-card-badge">${status.badge}</span>
          </div>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.subtitle)}</small>
        </div>
        <div>
          <div class="patch-card-time">${escapeHtml(status.time)}</div>
          ${status.detail ? `<small>${escapeHtml(status.detail)}</small>` : ""}
        </div>`;
      button.title = activeRun?.routeIds.includes(item.id)
        ? "Jump to this patch in the active run"
        : "Start a route containing this patch to jump to it";
      button.addEventListener("click", () => {
        const index = activeRun?.routeIds.indexOf(item.id) ?? -1;
        if (index >= 0) jumpToStep(index);
        else showToast("This patch is not in the active route.");
      });
      els.patchStatusGrid.appendChild(button);
    });
  }

  function renderPofDashboard() {
    if (!els.pofStatusGrid) return;
    const now = Date.now();
    const items = allTimerItems().filter(item => item.kind === "pof");
    els.pofStatusGrid.innerHTML = "";

    items.forEach(item => {
      const status = getTimerStatus(item, now);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `pof-status-card status-${status.code}`;
      card.innerHTML = `
        <div class="patch-card-top">
          <span class="patch-card-group">${escapeHtml(item.label)}</span>
          <span class="patch-card-badge">${status.badge}</span>
        </div>
        <strong>${escapeHtml(item.pen.animal)} ×${item.pen.count}</strong>
        <small>Food: ${escapeHtml(item.pen.food)}</small>
        <div class="pof-card-footer">
          <span>${escapeHtml(item.pen.growthLabel)} to elder</span>
          <b>${escapeHtml(status.time)}</b>
        </div>
        ${status.detail ? `<small>${escapeHtml(status.detail)}</small>` : ""}`;
      card.addEventListener("click", () => {
        const index = activeRun?.routeIds.indexOf("manor-pof") ?? -1;
        if (index >= 0) jumpToStep(index);
        else showToast("Start the Full or Manor Farm route to reset pen timers.");
      });
      els.pofStatusGrid.appendChild(card);
    });

    const active = items
      .map(item => ({ item, status: getTimerStatus(item, now) }))
      .filter(entry => ["alarm", "snoozed"].includes(entry.status.code));
    if (active.length) {
      els.pofNextReady.textContent = `${active.length} Manor Farm pen${active.length === 1 ? "" : "s"} ready`;
      return;
    }
    const next = items
      .filter(item => Number(item.timer?.readyAt) > now)
      .sort((a, b) => Number(a.timer.readyAt) - Number(b.timer.readyAt))[0];
    els.pofNextReady.textContent = next
      ? `${next.label} ready in ${formatCountdown(Number(next.timer.readyAt) - now)}`
      : "No pen timers started";
  }

  function acknowledgeCurrentAlarms(now = Date.now()) {
    allTimerItems().forEach(item => {
      const readyAt = Number(item.timer?.readyAt || 0);
      if (readyAt && readyAt <= now) {
        alarmAck[item.key] = readyAt;
      }
    });
    saveJson(STORAGE.alarmAck, alarmAck);
    snoozeUntil = 0;
    localStorage.removeItem(STORAGE.snoozeUntil);
    playedAlarmKeys.clear();
  }

  function snoozeAllAlarms() {
    const now = Date.now();
    const active = allTimerItems().filter(item => {
      const readyAt = Number(item.timer?.readyAt || 0);
      return readyAt && readyAt <= now && Number(alarmAck[item.key]) !== readyAt;
    });
    if (!active.length) {
      showToast("There are no active alarms to snooze.");
      return;
    }
    snoozeUntil = now + 60 * 60 * 1000;
    localStorage.setItem(STORAGE.snoozeUntil, String(snoozeUntil));
    playedAlarmKeys.clear();
    renderPatchDashboard();
    renderPofDashboard();
    showToast("All farming alarms snoozed for one hour.");
  }

  function armAlarmSound() {
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return false;
      if (!audioContext) audioContext = new AudioCtor();
      if (audioContext.state === "suspended") audioContext.resume();
      soundEnabled = true;
      if (els.enableAlarmButton) {
        els.enableAlarmButton.textContent = "Sound enabled";
        els.enableAlarmButton.disabled = true;
      }
      return true;
    } catch {
      return false;
    }
  }

  async function enableAlarmSound() {
    const enabled = armAlarmSound();
    if (!enabled) {
      showToast("This browser could not enable alarm sound.");
      return;
    }
    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    showToast("Alarm sound enabled for this open browser session.");
    const activeNow = allTimerItems().some(item => getTimerStatus(item, Date.now()).code === "alarm");
    if (activeNow) processAlarms();
    else playAlarmChime();
  }

  function processAlarms() {
    const now = Date.now();
    const active = allTimerItems().filter(item => getTimerStatus(item, now).code === "alarm");
    const activeKeys = new Set(active.map(item => item.key));

    [...playedAlarmKeys].forEach(key => {
      if (!activeKeys.has(key)) playedAlarmKeys.delete(key);
    });

    if (!active.length || !soundEnabled) return;
    const newItems = active.filter(item => !playedAlarmKeys.has(item.key));
    if (!newItems.length) return;

    playAlarmChime();
    newItems.forEach(item => playedAlarmKeys.add(item.key));

    if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
      const names = newItems.slice(0, 3).map(item => item.label).join(", ");
      const extra = newItems.length > 3 ? ` and ${newItems.length - 3} more` : "";
      try {
        new Notification("RS3 Farming timer ready", {
          body: `${names}${extra}`,
          tag: "rs3-farming-ready"
        });
      } catch {}
    }
  }

  function playAlarmChime() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const notes = [
      { frequency: 659.25, start: 0.00, duration: 0.16 },
      { frequency: 783.99, start: 0.18, duration: 0.16 },
      { frequency: 987.77, start: 0.36, duration: 0.34 }
    ];
    notes.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + note.start);
      oscillator.stop(now + note.start + note.duration + 0.03);
    });
  }

  function openJumpDialog() {
    const steps = activeRun ? getActiveSteps() : getPresetRoute(els.routePreset.value);
    els.jumpList.innerHTML = "";
    let previousGroup = "";
    steps.forEach((step, index) => {
      if (step.group !== previousGroup) {
        const title = document.createElement("h3");
        title.className = "jump-group-title";
        title.textContent = step.group;
        els.jumpList.appendChild(title);
        previousGroup = step.group;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "jump-item";
      const record = activeRun?.records[index];
      const status = record?.status === "completed" ? "DONE" : record?.status === "skipped" ? "SKIPPED" : isPatchReady(step.id) ? "READY" : "WAITING";
      button.innerHTML = `
        <span class="jump-number">${index + 1}</span>
        <span><strong>${escapeHtml(step.location)}</strong><br><small>${escapeHtml(step.patchType)}</small></span>
        <span class="jump-status">${status}</span>`;
      button.addEventListener("click", () => {
        if (!activeRun) {
          startRun(els.routePreset.value);
        }
        const activeIndex = activeRun.routeIds.indexOf(step.id);
        jumpToStep(activeIndex >= 0 ? activeIndex : index);
      });
      els.jumpList.appendChild(button);
    });
    els.jumpDialog.showModal();
  }

  function buildInventory(steps) {
    const counts = new Map();
    let optionalMoneySeed = false;

    const add = (item, qty = 1) => {
      if (!item || qty <= 0) return;
      counts.set(item, (counts.get(item) || 0) + Number(qty));
    };

    steps.forEach(step => {
      if (step.inventoryType === "individual") {
        add(step.inventoryItem, 1);
      } else if (step.inventoryType === "stack") {
        add(step.inventoryItem, 1);
      } else if (step.id === "manor-money") {
        optionalMoneySeed = true;
      }

      if (Number(step.paymentQty) > 0 && step.paymentItem) {
        add(step.paymentItem, Number(step.paymentQty));
      }
    });

    add("Grasping rune pouch", 1);
    add("Urn enhancer", 1);
    add("Exquisite farming urn", 1);

    const slots = [];
    INVENTORY_ORDER.forEach(item => {
      const qty = counts.get(item) || 0;
      if (!qty) return;
      const isIndividual = ["Magic sapling", "Carambola sapling", "Calquat sapling", "Elder sapling"].includes(item);
      if (isIndividual) {
        for (let count = 0; count < qty; count += 1) slots.push({ item, qty: 1 });
      } else {
        slots.push({ item, qty });
      }
      counts.delete(item);
    });

    counts.forEach((qty, item) => slots.push({ item, qty }));
    return { slots, optionalMoneySeed };
  }

  function inventoryPosition(index) {
    // Exact pixel coordinates measured from the supplied 237 x 330 inventory image.
    // Five columns begin at x = 24 and repeat every 40 px.
    // Six rows begin at y = 30 and repeat every 36 px.
    // The final row contains only slots 26-28.
    const row = index < 25 ? Math.floor(index / 5) : 5;
    const col = index < 25 ? index % 5 : index - 25;
    return { left: 24 + (col * 40), top: 30 + (row * 36) };
  }

  function itemSpriteUrl(item) {
    const sprite = ITEM_SPRITES[item];
    return sprite ? `https://secure.runescape.com/m=itemdb_rs/obj_sprite.gif?id=${sprite.id}` : "";
  }

  function openInventoryDialog() {
    const steps = activeRun ? getActiveSteps() : getPresetRoute(els.routePreset.value);
    const inventory = buildInventory(steps);
    els.inventoryGrid.innerHTML = "";
    els.inventoryLegend.innerHTML = "";

    for (let index = 0; index < 28; index += 1) {
      const slot = inventory.slots[index];
      if (!slot) continue;

      const position = inventoryPosition(index);
      const div = document.createElement("div");
      div.className = "rs3-slot-item";
      div.style.left = `${position.left}px`;
      div.style.top = `${position.top}px`;
      div.title = `${index + 1}. ${slot.item}${Number(slot.qty) > 1 ? ` × ${Number(slot.qty).toLocaleString()}` : ""}`;

      const img = document.createElement("img");
      img.className = "inventory-item-icon";
      img.alt = slot.item;
      img.src = itemSpriteUrl(slot.item);
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        img.hidden = true;
        div.classList.add("sprite-missing");
        div.dataset.fallback = slot.item.split(/\s+/).map(word => word[0]).join("").slice(0, 3).toUpperCase();
      });
      div.appendChild(img);

      if (Number(slot.qty) > 1) {
        const qty = document.createElement("span");
        qty.className = "rs3-slot-qty";
        qty.textContent = Number(slot.qty).toLocaleString();
        div.appendChild(qty);
      }
      els.inventoryGrid.appendChild(div);

      const legend = document.createElement("div");
      legend.className = "inventory-legend-row";
      const sprite = ITEM_SPRITES[slot.item];
      legend.innerHTML = `<span class="legend-slot">${index + 1}</span><span><strong>${escapeHtml(slot.item)}</strong>${sprite?.noted ? '<em>Bank note</em>' : ''}</span><b>${Number(slot.qty).toLocaleString()}</b>`;
      els.inventoryLegend.appendChild(legend);
    }

    const overflow = Math.max(0, inventory.slots.length - 28);
    const notes = [];
    if (overflow) notes.push(`This selected route needs ${inventory.slots.length} slots. Remove ${overflow} utility item(s), or bank between route sections.`);
    if (inventory.optionalMoneySeed) notes.push("Money tree seed: withdraw it from the Manor Farm bank only when that patch is ready; the standard preset deliberately leaves the final slot open.");
    notes.push("Saplings occupy separate slots. Golden dragonfruit seeds and every protection payment are stacked. Protection items are shown with their actual bank-note sprites. Farming tools and coins are assumed to be on the tool belt and in the money pouch.");
    notes.push("Prifddinas routing: Seren Teleport Stone option 4 = Crwys, option 8 = Meilyr, option 9 = Trahaearn. Lletya uses Tirannwn quiver 4.");
    els.inventoryNotes.textContent = notes.join(" ");
    els.inventoryDialog.showModal();
  }

  function openHistoryDialog() {
    renderHistory();
    els.historyDialog.showModal();
  }

  function renderHistory() {
    els.historyList.innerHTML = "";
    if (!history.length) {
      els.historyList.innerHTML = '<p class="muted">No completed runs have been saved yet.</p>';
      return;
    }
    history.forEach(run => {
      const article = document.createElement("article");
      article.className = "history-entry";
      article.innerHTML = `
        <div class="history-entry-header">
          <div>
            <h3>${escapeHtml(run.routeName || "Farm Run")}</h3>
            <p>${formatDateTime(run.startedAt)} → ${formatDateTime(run.endedAt)}</p>
          </div>
          <strong>${formatClock(run.durationSeconds || 0)}</strong>
        </div>
        <div class="history-entry-stats">
          <span>${run.completed || 0} completed</span>
          <span>${run.skipped || 0} skipped</span>
          <span>${run.routeIds?.length || 0} total</span>
        </div>`;
      els.historyList.appendChild(article);
    });
  }

  function copyCurrentTeleport() {
    const step = getCurrentStep();
    if (!step) return;
    const text = `${step.teleport} — ${step.directions}`;
    navigator.clipboard?.writeText(text)
      .then(() => showToast("Teleport instructions copied."))
      .catch(() => fallbackCopy(text));
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("Teleport instructions copied.");
  }

  function clearActionChecks() {
    els.actionChecks.forEach(check => { check.checked = false; });
  }

  function saveChecklist(index, value) {
    const state = loadJson(STORAGE.checklist, []);
    state[index] = value;
    saveJson(STORAGE.checklist, state);
  }

  function restoreChecklist() {
    const state = loadJson(STORAGE.checklist, []);
    els.gearChecks?.forEach((checkbox, index) => { checkbox.checked = Boolean(state[index]); });
  }

  function clearChecklist() {
    els.gearChecks.forEach(checkbox => { checkbox.checked = false; });
    localStorage.removeItem(STORAGE.checklist);
    showToast("Run checklist cleared.");
  }

  function restoreDefaultRoute() {
    const confirmed = window.confirm("Replace the imported route with the default route?");
    if (!confirmed) return;
    route = structuredCloneSafe(DEFAULT_ROUTE);
    saveJson(STORAGE.route, route);
    activeRun = null;
    localStorage.removeItem(STORAGE.activeRun);
    renderAll();
    closeMenu();
    showToast("Default route restored.");
  }

  async function importCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) throw new Error("The CSV has no route rows.");
      const headers = rows[0].map(value => value.trim());
      const required = ["id", "order", "group", "location", "patchType", "plant", "teleport", "directions", "growthMinutes"];
      required.forEach(header => {
        if (!headers.includes(header)) throw new Error(`Missing required column: ${header}`);
      });
      const imported = rows.slice(1).filter(row => row.some(Boolean)).map((row, index) => {
        const item = {};
        headers.forEach((header, column) => { item[header] = row[column] ?? ""; });
        item.order = Number(item.order || index + 1);
        item.paymentQty = Number(item.paymentQty || 0);
        item.growthMinutes = Number(item.growthMinutes || 0);
        item.xp = Number(item.xp || 0);
        item.inventoryType = item.inventoryType || "individual";
        item.isPof = String(item.isPof).toLowerCase() === "true" || item.id === "manor-pof";
        return item;
      });
      const ids = new Set();
      imported.forEach(item => {
        if (!item.id) throw new Error("Every route row needs an id.");
        if (ids.has(item.id)) throw new Error(`Duplicate id: ${item.id}`);
        ids.add(item.id);
      });
      route = imported.sort((a, b) => a.order - b.order);
      saveJson(STORAGE.route, route);
      activeRun = null;
      localStorage.removeItem(STORAGE.activeRun);
      renderAll();
      closeMenu();
      showToast(`${route.length} route steps imported.`);
    } catch (error) {
      window.alert(`Could not import route: ${error.message}`);
    }
  }

  function downloadCsvTemplate() {
    const headers = ["id", "order", "group", "location", "patchType", "plant", "teleport", "directions", "paymentItem", "paymentQty", "growthMinutes", "growthLabel", "xp", "inventoryItem", "inventoryType", "isPof", "note"];
    const example = DEFAULT_ROUTE[1];
    downloadText("rs3-farm-route-template.csv", toCsv([headers, headers.map(header => example[header] ?? "")]));
  }

  function exportCurrentRoute() {
    const headers = ["id", "order", "group", "location", "patchType", "plant", "teleport", "directions", "paymentItem", "paymentQty", "growthMinutes", "growthLabel", "xp", "inventoryItem", "inventoryType", "isPof", "note"];
    const rows = [headers, ...route.map(item => headers.map(header => item[header] ?? ""))];
    downloadText("rs3-farm-route.csv", toCsv(rows));
  }

  function exportHistory() {
    const headers = ["run_id", "route", "started_at", "ended_at", "duration_seconds", "completed", "skipped", "step_id", "step_status", "step_completed_at", "step_split_seconds"];
    const rows = [headers];
    history.forEach(run => {
      (run.records || []).forEach(record => {
        rows.push([
          run.id,
          run.routeName,
          new Date(run.startedAt).toISOString(),
          new Date(run.endedAt).toISOString(),
          run.durationSeconds,
          run.completed,
          run.skipped,
          record.id,
          record.status,
          record.completedAt ? new Date(record.completedAt).toISOString() : "",
          record.splitSeconds ?? ""
        ]);
      });
    });
    downloadText("rs3-farm-run-history.csv", toCsv(rows));
  }

  function clearHistory() {
    const confirmed = window.confirm("Delete all saved run history?");
    if (!confirmed) return;
    history = [];
    saveJson(STORAGE.history, history);
    renderHistory();
    showToast("Run history cleared.");
  }

  function handleKeyboard(event) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    if ([els.jumpDialog, els.inventoryDialog, els.historyDialog, els.timersDialog].some(dialog => dialog?.open)) return;
    if (!activeRun && event.key !== "j" && event.key !== "J") return;
    if (event.key === "ArrowLeft") { event.preventDefault(); previousStep(); }
    if (event.key === "ArrowRight") { event.preventDefault(); completeStep(); }
    if (event.key === "s" || event.key === "S") { event.preventDefault(); skipStep(); }
    if (event.key === "j" || event.key === "J") { event.preventDefault(); openJumpDialog(); }
  }

  function saveActiveRun() {
    saveJson(STORAGE.activeRun, activeRun);
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (quoted) {
        if (char === '"' && next === '"') { value += '"'; index += 1; }
        else if (char === '"') quoted = false;
        else value += char;
      } else if (char === '"') quoted = true;
      else if (char === ",") { row.push(value); value = ""; }
      else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
      else value += char;
    }
    if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
    return rows;
  }

  function toCsv(rows) {
    return rows.map(row => row.map(value => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(",")).join("\n");
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function loadJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : structuredCloneSafe(fallback);
    } catch {
      return structuredCloneSafe(fallback);
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function structuredCloneSafe(value) {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function formatClock(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return [hours, minutes, secs].map(value => String(value).padStart(2, "0")).join(":");
  }

  function formatShortClock(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function formatDuration(seconds) {
    const totalMinutes = Math.round((Number(seconds) || 0) / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m` : ""}`.trim() || "0m";
  }

  function formatCountdown(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days) return `${days}d ${hours}h`;
    if (hours) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function formatDateTime(timestamp, short = false) {
    if (!timestamp) return "—";
    const date = new Date(Number(timestamp));
    return new Intl.DateTimeFormat("en-US", short
      ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    ).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
