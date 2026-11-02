const API_BASE = window.AHMEDOV_CONFIG?.apiBase || "/api";
const WEB_BASE = window.AHMEDOV_CONFIG?.webBase || "";
const TOKEN_KEY = "ahmedov_proxy_jwt";
const TAB_KEY = "ahmedov_proxy_tab";
const PAYMENT_PENDING_KEY = "ahmedov_proxy_pending_payment";
const VPN_UPDATE_URL = "https://ahmedov.online/vpn/update.php";
const REQUIRE_PWA = true;
// Кнопка «Оплатить через СБП» на странице оплаты. Сейчас оплата идёт через поддержку.
const SHOW_SBP_BUTTON = false;

// VPN Sources Configuration
const VPN_SOURCES = {
  vless: {
    name: "Черные списки",
    url: "https://raw.githack.com/igareck/vpn-configs-for-russia/main/BLACK_VLESS_RUS_mobile.txt",
    protocol: "vless"
  },
  trojan: {
    name: "CIDR-Подписки",
    url: "https://raw.githack.com/igareck/vpn-configs-for-russia/main/WHITE-CIDR-RU-checked.txt",
    protocol: "vless"
  },
  shadowsocks: {
    name: "Белые списки",
    url: "https://raw.githack.com/igareck/vpn-configs-for-russia/main/Vless-Reality-White-Lists-Rus-Mobile.txt",
    protocol: "vless"
  }
};

let isTyping = false;

const app = document.getElementById("app");

const state = {
  pwaBlocked: false,
  booting: true,
  token: localStorage.getItem(TOKEN_KEY) || "",
  role: "user",
  user: null,
  subscription: null,
  activeTab: localStorage.getItem(TAB_KEY) || "home",
  lastNetwork: localStorage.getItem(TAB_KEY) === "whatsapp" ? "whatsapp" : "telegram",
  serverFilter: "all",
  phoneInput: "",
  pendingPhone: "",
  inviteInput: "",
  authStep: "phone",
  hint: "",
  loadingAuth: false,
  installGuideOpen: false,
  paymentPage: {
    loading: false,
    phoneInput: "",
    plans: [],
    selectedPlanId: null,
    supportUrl: "#",
    paymentEnabled: false,
    creating: false,
    checking: false,
    payment: null,
    fulfillment: null,
    message: "",
    error: "",
    pendingPayment: null,
    pendingNote: "",
    legalModal: { open: false, type: null },
    promoCode: "",
    promoChecking: false,
    promoData: null,
    promoMessage: "",
  },
  plansOverlay: { open: false, message: "", plans: [], supportUrl: "#", banks: [], paymentEnabled: false, selectedPlanId: null, selectedBankId: "sber", payment: null, paymentError: "", paymentLoading: false, statusLoading: false },
  proxies: { telegram: [], whatsapp: [] },
  loadingProxyTab: false,
  vpn: {
    selectedSource: "vless",
    servers: [],
    filtered: [],
    loading: false,
    checking: 0,
    online: 0,
    initialized: false,
    latencyChecking: false,
    latencyChecked: false,
    qrModal: { open: false, raw: "" },
  },
  proxyConnectModal: { open: false, connectUrl: "", network: "", proxyKey: "", copied: false },
  admin: {
    section: "users",
    users: [],
    proxies: [],
    promoCodes: [],
    loading: false,
    saving: false,
    message: "",
    userSearch: "",
    userSort: "asc",
    lastInviteCode: "",
    bulkUsersText: "",
    bulkProxiesText: "",
    proxyFilter: "telegram",
    userForm: { phone: "", subscription_type: "90 дней", duration_days: 90, is_active: true },
    proxyForm: {
      id: null,
      network: "telegram",
      name: "",
      host: "",
      port: 443,
      connect_url: "",
      is_active: true,
      is_recommended: false,
    },
    promoForm: {
      id: null,
      code: "",
      plan_id: 301,
      discount_amount: 0,
      price_label: "",
      is_active: true,
    },
  },
};

let authFlowId = 0;
const userProxyRunIds = { telegram: 0, whatsapp: 0 };
let adminProxyRunId = 0;
const CLIENT_PING_TIMEOUT_MS = 1600;
const CLIENT_PING_ATTEMPTS = 3;
const CLIENT_FAILS_TO_OFF = 3;
const DNS_TIMEOUT_MS = 1400;
const DNS_CACHE_TTL_MS = 3 * 60 * 1000;
const PING_SMOOTH_ALPHA = 0.38;
const UNSTABLE_SCORE_THRESHOLD = 32;
const STRONG_SCORE_THRESHOLD = 55;
const proxyHealthState = new Map();
const dnsTimingCache = new Map();
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;
let sessionHeartbeatTimer = null;
let sessionHeartbeatInFlight = false;
let paymentStatusPollTimer = null;

function refreshVpnSubscription() {
  fetch(VPN_UPDATE_URL, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    keepalive: true,
  }).catch((error) => {
    console.warn("VPN subscription update failed:", error);
  });
}

function landingPath() {
  return WEB_BASE || "/";
}

function appPath() {
  return `${WEB_BASE}/app`;
}

function appHomePath() {
  return appPath();
}

async function tryAutoLoginFromUrl() {
  const params = new URLSearchParams(location.search);
  const invite = params.get('invite');
  const phone = params.get('phone');

  if (!invite || !phone) {
    return false;
  }

  try {
    const response = await api.loginByInvite(phone, invite);
    if (response.token) {
      history.replaceState({}, "", appPath());
      localStorage.setItem(TOKEN_KEY, response.token);
      setState({
        token: response.token,
        role: response.role,
        user: response.user,
        subscription: response.subscription,
        phoneInput: "",
        inviteInput: "",
        authStep: "phone",
        hint: "",
        loadingAuth: false,
      });
      return true;
    }
  } catch (e) {
    console.warn('Auto-login failed:', e);
  }
  return false;
}

function paymentPath() {
  return `${WEB_BASE}/payment`;
}

function normalizePathname(pathname) {
  const value = String(pathname || "/").replace(/\/+$/, "");
  return value || "/";
}

function isPaymentRoute() {
  return normalizePathname(location.pathname) === normalizePathname(paymentPath());
}

function isAppRoute() {
  return normalizePathname(location.pathname) === normalizePathname(appPath());
}

function isLandingRoute() {
  return normalizePathname(location.pathname) === normalizePathname(landingPath());
}

function isStandaloneMode() {
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  if (document.referrer && document.referrer.startsWith("android-app://")) return true;
  return false;
}

function shouldBlockBrowserMode() {
  if (isPaymentRoute()) return false;
  if (isAppRoute()) return false;
  return REQUIRE_PWA && !isStandaloneMode();
}

function openAppPage(options = {}) {
  const url = new URL(appPath(), location.origin);
  if (options.phone) url.searchParams.set("phone", options.phone);
  if (options.invite) url.searchParams.set("invite", options.invite);
  location.assign(url.toString());
}

function normalizePhone(input) {
  const digits = String(input).replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return digits.slice(1);
  if (digits.length === 10) return digits;
  return "";
}

function formatPhoneInput(input) {
  let digits = String(input).replace(/\D/g, "");
  if (digits.length > 10 && (digits.startsWith("7") || digits.startsWith("8"))) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean);
  return parts.join(" ");
}

const LEGAL_DOCUMENTS = {
  agreement: {
    title: 'Пользовательское соглашение',
    body: `
      <p>Настоящее Пользовательское соглашение регулирует порядок оказания услуг по доступу к Telegram/WhatsApp прокси и использование сайта ahmedov.proxy.</p>
      <p>Исполнитель предоставляет доступ к прокси-сервису, но не является владельцем серверной инфраструктуры и не несёт ответственности за работоспособность, доступность, стабильность соединения или качество работы серверов.</p>
      <p>Пользователь обязуется использовать сервис в рамках действующего законодательства и принимает на себя все риски, связанные с использованием прокси.</p>
      <p>Оплата услуг не гарантирует устранение ограничений третьих сервисов, в том числе Telegram и WhatsApp. Исполнитель не несёт ответственности за блокировку, изменение условий работы мессенджеров или доступ к ним.</p>
      <p>Возврат средств возможен только по договорённости и при наличии основания, предусмотренного законодательством.</p>
    `,
  },
  privacy: {
    title: 'Политика обработки персональных данных',
    body: `
      <p>Мы обрабатываем только те персональные данные, которые необходимы для оказания услуги: номер телефона, данные платежа и техническую информацию для предоставления доступа.</p>
      <p>Данные используются исключительно для выполнения заказа, связи с пользователем и обеспечения работы сервиса.</p>
      <p>Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством или необходимостью выполнения платёжных операций.</p>
      <p>Пользователь подтверждает своё согласие на обработку персональных данных при нажатии кнопки оплаты.</p>
    `,
  },
  offer: {
    title: 'Оферта',
    body: `
      <p>Настоящая оферта является публичным предложением на оказание услуги доступа к прокси-серверам Telegram/WhatsApp.</p>
      <p>Исполнитель предоставляет услугу доступа по факту оплаты. Исполнитель не несёт ответственности за предоставление серверов, их работоспособность, стабильность подключения и доступность прокси.</p>
      <p>Все технические риски использования прокси, а также возможные ограничения со стороны мессенджеров несёт Пользователь.</p>
      <p>Исполнитель не гарантирует отсутствие сбоев, задержек или ограничений в работе прокси-сервиса.</p>
      <p>Окончательная стоимость и условия оплаты подтверждаются на момент формирования заказа.</p>
    `,
  },
};


// SVG helpers for PWA install modal
function pwaSafariSVG() {
  return `<svg viewBox="0 0 20.283 19.932" width="24" height="24"><g fill="currentColor"><path d="M9.96 19.922c5.45 0 9.962-4.522 9.962-9.961C19.922 4.51 15.4 0 9.952 0 4.511 0 0 4.512 0 9.96c0 5.44 4.521 9.962 9.96 9.962Zm0-1.66A8.26 8.26 0 0 1 1.67 9.96c0-4.61 3.672-8.3 8.281-8.3 4.61 0 8.31 3.69 8.31 8.3 0 4.61-3.69 8.3-8.3 8.3Z"></path><path d="m5.87 14.883 5.605-2.735a1.47 1.47 0 0 0 .683-.673l2.725-5.596c.312-.664-.166-1.182-.85-.84L8.447 7.764c-.302.136-.508.341-.674.673L5.03 14.043c-.312.645.196 1.152.84.84Zm4.09-3.72A1.19 1.19 0 0 1 8.77 9.97c0-.664.527-1.201 1.19-1.201a1.2 1.2 0 0 1 1.202 1.2c0 .655-.537 1.192-1.201 1.192Z"></path></g></svg>`;
}
function pwaDotsSVG() {
  return `<svg width="22" height="24" viewBox="0 0 24 24"><circle cx="2" cy="12" r="2" fill="currentColor"></circle><circle cx="12" cy="12" r="2" fill="currentColor"></circle><circle cx="22" cy="12" r="2" fill="currentColor"></circle></svg>`;
}
function pwaShareSVG() {
  return `<svg width="25" height="32" viewBox="0 0 17.695 26.475"><g fill="currentColor"><path d="M17.334 10.762v9.746c0 2.012-1.025 3.027-3.066 3.027H3.066C1.026 23.535 0 22.52 0 20.508v-9.746C0 8.75 1.025 7.734 3.066 7.734h2.94v1.573h-2.92c-.977 0-1.514.527-1.514 1.543v9.57c0 1.015.537 1.543 1.514 1.543h11.152c.967 0 1.524-.527 1.524-1.543v-9.57c0-1.016-.557-1.543-1.524-1.543h-2.91V7.734h2.94c2.04 0 3.066 1.016 3.066 3.028Z"></path><path d="M8.662 15.889c.42 0 .781-.352.781-.762V5.097l-.058-1.464.654.693 1.484 1.582a.698.698 0 0 0 .528.235c.4 0 .713-.293.713-.694 0-.205-.088-.361-.235-.508l-3.3-3.183c-.196-.196-.362-.264-.567-.264-.195 0-.361.069-.566.264L4.795 4.94a.681.681 0 0 0-.225.508c0 .4.293.694.703.694.186 0 .4-.079.538-.235l1.474-1.582.664-.693-.058 1.465v10.029c0 .41.351.762.771.762Z"></path></g></svg>`;
}
function pwaAddSVG() {
  return `<svg width="25" height="25" viewBox="0 0 25 25"><g><path d="m23.40492,1.60784c-1.32504,-1.32504 -3.19052,-1.56912 -5.59644,-1.56912l-10.65243,0c-2.33622,0 -4.2017,0.24408 -5.5267,1.56912c-1.32504,1.34243 -1.56911,3.17306 -1.56911,5.50924l0,10.5827c0,2.40596 0.22665,4.254 1.55165,5.57902c1.34246,1.32501 3.19052,1.5691 5.59647,1.5691l10.60013,0c2.40592,0 4.2714,-0.24408 5.59644,-1.5691c1.325,-1.34245 1.55166,-3.17306 1.55166,-5.57902l0,-10.51293c0,-2.40596 -0.22666,-4.25401 -1.55166,-5.57901zm-0.38355,5.21289l0,11.24518c0,1.51681 -0.20924,2.94643 -1.02865,3.78327c-0.83683,0.83685 -2.30134,1.0635 -3.81815,1.0635l-11.33234,0c-1.51681,0 -2.96386,-0.22665 -3.80073,-1.0635c-0.83683,-0.83684 -1.04607,-2.26646 -1.04607,-3.78327l0,-11.19288c0,-1.5517 0.20924,-3.01617 1.02865,-3.85304c0.83687,-0.83683 2.31876,-1.04607 3.87042,-1.04607l11.28007,0c1.51681,0 2.98132,0.22666 3.81815,1.06353c0.81941,0.81941 1.02865,2.26645 1.02865,3.78327zm-10.53039,12.08205c0.64506,0 1.02861,-0.43586 1.02861,-1.13326l0,-4.34117l4.53294,0c0.66252,0 1.13326,-0.36613 1.13326,-0.99376c0,-0.64506 -0.43586,-1.02861 -1.13326,-1.02861l-4.53294,0l0,-4.53294c0,-0.6974 -0.38355,-1.13326 -1.02861,-1.13326c-0.62763,0 -0.99376,0.45332 -0.99376,1.13326l0,4.53294l-4.51552,0c-0.69737,0 -1.15069,0.38355 -1.15069,1.02861c0,0.62763 0.48817,0.99376 1.15069,0.99376l4.51552,0l0,4.34117c0,0.66252 0.36613,1.13326 0.99376,1.13326z" fill="currentColor"/></g></svg>`;
}

function displayPhone(phone10) {
  const d = String(phone10 || "").replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return "+7 --- --- -- --";
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

function subscriptionIsActive(subscription) {
  if (!subscription || typeof subscription !== "object") return false;

  const daysLeft = Number(subscription.daysLeft);
  if (Number.isFinite(daysLeft) && daysLeft <= 0) {
    return false;
  }

  const expiresAtRaw = String(subscription.expiresAt || "").trim();
  if (expiresAtRaw) {
    const normalized = expiresAtRaw.includes("T") ? expiresAtRaw : expiresAtRaw.replace(" ", "T");
    const expiresAtMs = Date.parse(normalized);
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
      return false;
    }
  }

  return true;
}

function stopSessionHeartbeat() {
  if (sessionHeartbeatTimer) {
    clearInterval(sessionHeartbeatTimer);
    sessionHeartbeatTimer = null;
  }
  sessionHeartbeatInFlight = false;
}

function startSessionHeartbeat() {
  stopSessionHeartbeat();
  if (!state.token || state.role === "admin") return;
  sessionHeartbeatTimer = setInterval(() => {
    void runSessionHeartbeatCheck();
  }, SESSION_CHECK_INTERVAL_MS);
}

function clearPendingPaymentStorage() {
  localStorage.removeItem(PAYMENT_PENDING_KEY);
}

function savePendingPaymentStorage(data) {
  if (!data) {
    clearPendingPaymentStorage();
    return;
  }
  localStorage.setItem(PAYMENT_PENDING_KEY, JSON.stringify(data));
}

function readPendingPaymentStorage() {
  try {
    const raw = localStorage.getItem(PAYMENT_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function paymentRouteStateFromUrl() {
  const params = new URLSearchParams(location.search);
  return {
    phone: normalizePhone(params.get("phone") || ""),
    planId: Number(params.get("plan") || 0) || null,
    token: String(params.get("token") || "").trim(),
    message: String(params.get("message") || "").trim(),
  };
}

function replacePaymentUrl(params = {}) {
  const url = new URL(location.href);
  if (normalizePathname(url.pathname) !== normalizePathname(paymentPath())) {
    url.pathname = paymentPath();
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  history.replaceState({}, "", url.toString());
}

function openPaymentPage(options = {}) {
  const url = new URL(paymentPath(), location.origin);
  const phone = normalizePhone(options.phone || "");
  const planId = Number(options.planId || 0);
  const message = String(options.message || "").trim();
  if (phone) url.searchParams.set("phone", phone);
  if (planId > 0) url.searchParams.set("plan", String(planId));
  if (message) url.searchParams.set("message", message);
  location.assign(url.toString());
}

async function loadPublicPlansPayload() {
  try {
    const payload = await api.plans();
    return {
      plans: payload?.plans || [],
      supportUrl: payload?.supportUrl || "https://wa.me/79634150424",
      banks: payload?.banks || [],
      paymentEnabled: !!payload?.paymentEnabled,
    };
  } catch {
    return {
      plans: [],
      supportUrl: "https://wa.me/79634150424",
      banks: [],
      paymentEnabled: false,
    };
  }
}

function setPaymentPage(partial) {
  state.paymentPage = { ...state.paymentPage, ...partial };
  if (!isTyping) render();
}

function buildPaymentWaitingState(selectedPlan, payment, message = "") {
  return {
    loading: false,
    selectedPlanId: selectedPlan?.id || null,
    payment: payment || null,
    fulfillment: null,
    creating: false,
    checking: false,
    message: message || "Ожидаем подтверждение оплаты.",
    error: "",
  };
}

async function pollPaymentPageStatusOnce(token) {
  if (!token) return;
  try {
    const payload = await api.paymentStatus(token);
    const order = payload?.order || null;
    const paymentData = order
      ? {
        token: order.token,
        qrUrl: order.qrUrl,
        amount: order.amount,
        paymentId: order.paymentId,
        orderId: order.orderId,
        status: payload?.isPaid ? "paid" : order.status || "pending",
      }
      : state.paymentPage.payment;

    if (payload?.isPaid && payload?.fulfillment) {
      stopPaymentStatusPolling();
      clearPendingPaymentStorage();
      replacePaymentUrl({
        phone: payload.fulfillment.user?.phone || paymentRouteStateFromUrl().phone,
        plan: order?.planId || state.paymentPage.selectedPlanId,
        token: token,
      });
      setPaymentPage({
        checking: false,
        payment: paymentData,
        fulfillment: payload.fulfillment,
        message: "Оплата произведена.",
        error: "",
      });
      return;
    }

    savePendingPaymentStorage({
      route: "payment",
      selectedPlanId: order?.planId || state.paymentPage.selectedPlanId,
      phone: order?.phone || paymentRouteStateFromUrl().phone,
      payment: paymentData,
    });
    setPaymentPage({
      checking: false,
      payment: paymentData,
      message: "Ожидаем подтверждение оплаты.",
      error: "",
    });
  } catch (e) {
    setPaymentPage({
      checking: false,
      error: e.message || "Не удалось проверить статус оплаты.",
    });
  }
}

function startPaymentPagePolling(token) {
  stopPaymentStatusPolling();
  if (!token) return;
  paymentStatusPollTimer = setInterval(() => {
    void pollPaymentPageStatusOnce(token);
  }, 2000);
}

async function loadPaymentPage() {
  const routeState = paymentRouteStateFromUrl();
  const pending = readPendingPaymentStorage();
  const plansData = await loadPublicPlansPayload();
  const selectedPlanId = routeState.planId || pending?.selectedPlanId || plansData.plans?.[0]?.id || null;
  const phone = routeState.phone || normalizePhone(pending?.phone || "");
  const token = String(routeState.token || "").trim();
  const payment = token
    ? {
      token,
      qrUrl: String(pending?.payment?.qrUrl || ""),
      amount: Number(pending?.payment?.amount || 0),
      paymentId: String(pending?.payment?.paymentId || ""),
      orderId: String(pending?.payment?.orderId || ""),
      status: String(pending?.payment?.status || "pending"),
    }
    : null;
  const pendingPayment = !token && pending?.payment?.token
    ? {
      token: String(pending.payment.token || ""),
      qrUrl: String(pending.payment.qrUrl || ""),
      amount: Number(pending.payment.amount || 0),
      paymentId: String(pending.payment.paymentId || ""),
      orderId: String(pending.payment.orderId || ""),
      status: String(pending.payment.status || "pending"),
    }
    : null;
  const pendingNote = pendingPayment
    ? "У вас есть предыдущий ожидающий платёж. Можете продолжить его или отменить, чтобы создать новый."
    : "";

  setPaymentPage({
    loading: false,
    phoneInput: phone ? formatPhoneInput(phone) : "",
    plans: plansData.plans,
    selectedPlanId,
    supportUrl: plansData.supportUrl,
    paymentEnabled: plansData.paymentEnabled,
    creating: false,
    checking: false,
    payment,
    pendingPayment,
    pendingNote,
    fulfillment: null,
    message: routeState.message || (payment ? "Ожидаем подтверждение оплаты." : ""),
    error: "",
  });

  if (token) {
    replacePaymentUrl({
      phone: phone || null,
      plan: selectedPlanId || null,
      token,
      message: routeState.message || null,
    });
    startPaymentPagePolling(token);
    await pollPaymentPageStatusOnce(token);
  }
}

async function handleExpiredSubscription(message = "Подписка закончилась. Оплатите доступ.") {
  if (!isPaymentRoute()) {
    const phone = normalizePhone(state.user?.phone || state.pendingPhone || state.phoneInput || "");
    logout({ hint: message });
    openAppPage({ phone });
    return;
  }

  const plansData = await loadPublicPlansPayload();
  setPaymentPage({
    plans: plansData.plans,
    selectedPlanId: state.paymentPage.selectedPlanId || plansData.plans?.[0]?.id || null,
    supportUrl: plansData.supportUrl,
    paymentEnabled: plansData.paymentEnabled,
    message,
  });
}

async function restorePendingPaymentOverlay() {
  const pending = readPendingPaymentStorage();
  if (!pending?.payment?.token) return false;

  const plansData = await loadPublicPlansPayload();
  const selectedPlanId = Number(pending.selectedPlanId) || plansData.plans?.[0]?.id || null;
  setState({
    plansOverlay: {
      open: true,
      message: pending.message || "Ожидаем подтверждение оплаты.",
      plans: plansData.plans,
      supportUrl: plansData.supportUrl,
      banks: plansData.banks,
      paymentEnabled: plansData.paymentEnabled,
      selectedPlanId,
      selectedBankId: "sber",
      payment: {
        ...(pending.payment || {}),
        status: pending.payment?.status || "pending",
      },
      paymentError: "",
      paymentLoading: false,
      statusLoading: false,
    },
  });
  startPaymentStatusPolling(pending.payment.token);
  return true;
}

function stopPaymentStatusPolling() {
  if (paymentStatusPollTimer) {
    clearInterval(paymentStatusPollTimer);
    paymentStatusPollTimer = null;
  }
}

async function pollPaymentStatusOnce(token) {
  if (!token) return;
  try {
    const payload = await api.paymentStatus(token);
    if (payload?.isPaid) {
      stopPaymentStatusPolling();
      clearPendingPaymentStorage();
      setState({
        plansOverlay: {
          ...state.plansOverlay,
          statusLoading: false,
          paymentError: "",
          message: "Оплата подтверждена. Доступ будет активирован после проверки.",
          payment: { ...(state.plansOverlay.payment || {}), status: "paid" },
        },
      });
      return;
    }
    savePendingPaymentStorage({
      selectedPlanId: state.plansOverlay.selectedPlanId,
      message: state.plansOverlay.message || "Ожидаем подтверждение оплаты.",
      payment: {
        ...(state.plansOverlay.payment || {}),
        token,
        status: "pending",
      },
    });
    setState({
      plansOverlay: {
        ...state.plansOverlay,
        statusLoading: false,
      },
    });
  } catch (e) {
    setState({
      plansOverlay: {
        ...state.plansOverlay,
        statusLoading: false,
        paymentError: e.message || "Не удалось проверить статус оплаты.",
      },
    });
  }
}

function startPaymentStatusPolling(token) {
  stopPaymentStatusPolling();
  if (!token) return;
  paymentStatusPollTimer = setInterval(() => {
    void pollPaymentStatusOnce(token);
  }, 2000);
}

async function runSessionHeartbeatCheck() {
  if (sessionHeartbeatInFlight) return;
  if (!state.token || state.role === "admin") return;

  const token = state.token;
  sessionHeartbeatInFlight = true;
  try {
    const payload = await api.me(token);
    if (token !== state.token) return;

    if ((payload.role || "user") === "admin") {
      stopSessionHeartbeat();
      setState({
        role: "admin",
        user: payload.user || null,
        subscription: null,
      });
      return;
    }

    if (!subscriptionIsActive(payload.subscription)) {
      await handleExpiredSubscription("Подписка закончилась. Оплатите доступ.");
      return;
    }

    setState({
      role: payload.role || "user",
      user: payload.user || null,
      subscription: payload.subscription || null,
    });
  } catch (e) {
    if (token !== state.token) return;
    if (e?.status === 401) {
      await handleExpiredSubscription(e.message || "Подписка закончилась. Оплатите доступ.");
    }
  } finally {
    sessionHeartbeatInFlight = false;
  }
}

function formatDateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return raw;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

function subscriptionSummary(u) {
  const type = u.subscriptionType || u.subscription_type || "-";
  let totalDays = null;
  const m = String(type || "").match(/(\d+)\s*д/);
  if (m) totalDays = Number(m[1]);
  if (!totalDays && Number.isFinite(Number(u.duration_days))) totalDays = Number(u.duration_days);
  if (!totalDays && Number.isFinite(Number(u.totalDays))) totalDays = Number(u.totalDays);

  const totalText = totalDays ? `${totalDays} дней` : type;
  const expires = formatDateOnly(u.expiresAt || u.expires_at || u.subscription_expires_at);
  const daysLeft = Number.isFinite(Number(u.daysLeft)) ? Number(u.daysLeft) : (Number.isFinite(Number(u.duration_days)) ? Number(u.duration_days) : null);
  const daysLeftText = daysLeft !== null ? `${daysLeft} дн.` : "-";
  const daysLeftStyle = daysLeft !== null && daysLeft < 0 ? "color:#f87171;font-weight:700;" : "";

  return `<div class="subscription-summary" style="font-size:13px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <span style="background:rgba(0,0,0,0.04);padding:6px 8px;border-radius:8px;font-weight:600;">${esc(totalText)}</span>
    <span class="muted">•</span>
    <span class="muted">до ${esc(expires)}</span>
    <span class="muted">•</span>
    <span style="${daysLeftStyle}">${esc(daysLeftText)}</span>
  </div>`;
}

function normalizeBulkLineParts(line) {
  return String(line)
    .split("|")
    .map((part) => part.trim());
}

function parseBulkUsers(text) {
  const rows = [];
  const errors = [];
  String(text || "")
    .split(/\r?\n/)
    .forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) return;
      const parts = normalizeBulkLineParts(line);
      if (parts.length < 3) {
        errors.push(`Строка ${index + 1}: формат пользователя должен быть "телефон | тариф | дней | active(0/1)"`);
        return;
      }

      const phone = normalizePhone(parts[0]);
      const subscriptionType = parts[1] || "30 дней";
      const durationDays = Number(parts[2]);
      const isActive = parts.length >= 4 ? !["0", "false", "off", "нет"].includes(parts[3].toLowerCase()) : true;

      if (!phone) {
        errors.push(`Строка ${index + 1}: некорректный номер телефона`);
        return;
      }
      if (!Number.isFinite(durationDays)) {
        errors.push(`Строка ${index + 1}: некорректное значение дней`);
        return;
      }

      rows.push({
        phone,
        subscription_type: subscriptionType,
        duration_days: durationDays,
        is_active: isActive,
      });
    });
  return { rows, errors };
}

function parseBulkProxies(text, defaultNetwork) {
  const rows = [];
  const errors = [];
  String(text || "")
    .split(/\r?\n/)
    .forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) return;
      const parts = normalizeBulkLineParts(line);
      if (parts.length < 4) {
        errors.push(`Строка ${index + 1}: формат прокси должен быть "название | host | port | connect_url | active(0/1)"`);
        return;
      }

      const port = Number(parts[2]);
      const isActive = parts.length >= 5 ? !["0", "false", "off", "нет"].includes(parts[4].toLowerCase()) : true;
      if (!parts[0] || !parts[1] || !Number.isFinite(port) || port < 1 || port > 65535 || !parts[3]) {
        errors.push(`Строка ${index + 1}: заполните название, host, port и connect_url корректно`);
        return;
      }

      rows.push({
        network: defaultNetwork,
        name: parts[0],
        host: parts[1],
        port,
        connect_url: parts[3],
        is_active: isActive,
        is_recommended: false,
        ping_ms: 40,
        sort_order: 100,
      });
    });
  return { rows, errors };
}

function caretIndexFromDigitPos(formatted, digitPos) {
  const value = String(formatted || "");
  const target = Math.max(0, Number(digitPos) || 0);
  if (target === 0) return 0;

  let digits = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i])) digits += 1;
    if (digits >= target) return i + 1;
  }
  return value.length;
}

function digitCount(value) {
  return String(value || "").replace(/\D/g, "").length;
}

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function request(path, options = {}) {
  const fullUrl = `${API_BASE}${path}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  // Debug admin requests (mask Authorization token)
  try {
    const isAdminPath = String(path || '').startsWith('/admin') || String(path || '').includes('/admin/');
    if (isAdminPath) {
      const auth = headers.Authorization || headers.authorization || '';
      const maskedAuth = auth
        ? (auth.length > 20 ? auth.slice(0, 8) + '...' + auth.slice(-6) : auth.replace(/.(?=.{4})/g, '*'))
        : '(none)';
      // eslint-disable-next-line no-console
      console.debug('[API DEBUG]', method, fullUrl, { Authorization: maskedAuth });
    }
  } catch (err) {
    // ignore debug errors
  }

  const response = await fetch(fullUrl, {
    cache: "no-store",
    ...options,
    headers,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch { }
  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw Object.assign(new Error(message), { status: response.status, payload });
  }
  return payload;
}

const api = {
  loginByPhone: (phone) => request("/auth/phone", { method: "POST", body: JSON.stringify({ phone }) }),
  loginByInvite: (phone, inviteCode) => request("/auth/invite", { method: "POST", body: JSON.stringify({ phone, invite_code: inviteCode }) }),
  me: (token) => request("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
  plans: () => request("/plans"),
  createSbpPayment: (body) => request("/payments/sbp", { method: "POST", body: JSON.stringify(body) }),
  paymentStatus: (token) => request(`/payments/sbp/${encodeURIComponent(token)}`),
  cancelPayment: (token) => request(`/payments/sbp/${encodeURIComponent(token)}`, { method: 'DELETE' }),
  promoCheck: (code) => request(`/promo?code=${encodeURIComponent(code)}`),
  proxies: (token, network) => request(`/proxies?network=${encodeURIComponent(network)}`, { headers: { Authorization: `Bearer ${token}` } }),
  adminUsers: (token) => request("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
  adminCreateUser: (token, body) => request("/admin/users", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminUpdateUser: (token, phone, body) => request(`/admin/users/${encodeURIComponent(phone)}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminDeleteUser: (token, phone) => request(`/admin/users/${encodeURIComponent(phone)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  adminProxies: (token, network = "all") => request(`/admin/proxies?network=${encodeURIComponent(network)}`, { headers: { Authorization: `Bearer ${token}` } }),
  adminCreateProxy: (token, body) => request("/admin/proxies", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminUpdateProxy: (token, id, body) => request(`/admin/proxies/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminDeleteProxy: (token, id) => request(`/admin/proxies/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  adminPromoCodes: (token) => request(`/admin/promo-codes`, { headers: { Authorization: `Bearer ${token}` } }),
  adminCreatePromoCode: (token, body) => request(`/admin/promo-codes`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminUpdatePromoCode: (token, id, body) => request(`/admin/promo-codes/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  adminDeletePromoCode: (token, id) => request(`/admin/promo-codes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
};

function setState(partial) {
  Object.assign(state, partial);
  if (!isTyping) render();
}

function setAdmin(partial) {
  Object.assign(state.admin, partial);
  if (!isTyping) render();
}

function sortClientProxies(items) {
  return [...items].sort((a, b) => {
    const aChecking = !!a.isChecking;
    const bChecking = !!b.isChecking;
    if (aChecking !== bChecking) return aChecking ? 1 : -1;

    const aReachable = !!a.isReachable;
    const bReachable = !!b.isReachable;
    if (aReachable !== bReachable) return aReachable ? -1 : 1;

    const aUnstable = !!a.isUnstable;
    const bUnstable = !!b.isUnstable;
    if (aUnstable !== bUnstable) return aUnstable ? 1 : -1;

    const aPing = Number.isFinite(Number(a.ping)) ? Number(a.ping) : Number.POSITIVE_INFINITY;
    const bPing = Number.isFinite(Number(b.ping)) ? Number(b.ping) : Number.POSITIVE_INFINITY;
    if (aPing !== bPing) return aPing - bPing;

    return String(a.name || "").localeCompare(String(b.name || ""), "ru");
  });
}

function sortAdminUsersByDays(items, dir) {
  const d = (u) => (Number.isFinite(Number(u.daysLeft)) ? Number(u.daysLeft) : Number.NEGATIVE_INFINITY);
  const sign = dir === "asc" ? 1 : -1;
  return [...items].sort(
    (a, b) => sign * (d(a) - d(b)) || String(a.displayPhone || "").localeCompare(String(b.displayPhone || ""), "ru")
  );
}

function toAppConnectUrl(network, rawUrl) {
  const input = String(rawUrl || "").trim();
  if (!input) return "#";

  if (network === "telegram") {
    if (/^tg:\/\//i.test(input)) return input;
    try {
      const u = new URL(input);
      const host = u.searchParams.get("server") || "";
      const port = u.searchParams.get("port") || "";
      const secret = u.searchParams.get("secret") || "";
      if (host && port && secret) {
        const q = new URLSearchParams({ server: host, port, secret }).toString();
        return `tg://proxy?${q}`;
      }
    } catch { }
    return input;
  }

  if (network === "whatsapp") {
    if (/^whatsapp:\/\//i.test(input)) return input;
    try {
      const u = new URL(input);
      const host = u.hostname.toLowerCase();
      const text = u.searchParams.get("text") || "";
      const phoneFromPath = u.pathname.replace(/\//g, "").replace(/\D/g, "");

      if (text) {
        return `whatsapp://send?text=${encodeURIComponent(text)}`;
      }
      if (host.includes("wa.me") && phoneFromPath) {
        return `whatsapp://send?phone=${phoneFromPath}`;
      }
      if (host.includes("api.whatsapp.com")) {
        const phone = (u.searchParams.get("phone") || "").replace(/\D/g, "");
        if (phone) return `whatsapp://send?phone=${phone}`;
      }
    } catch { }
    return input;
  }

  return input;
}

function markProxiesPending(items) {
  return (items || []).map((item) => ({
    ...item,
    ping: null,
    isReachable: false,
    isLivePing: true,
    isChecking: true,
  }));
}

function markProxiesReady(items) {
  return (items || []).map((item) => ({
    ...item,
    isChecking: false,
  }));
}

function buildClientProbeUrls(host, port) {
  const urls = [`https://${host}:${port}/`];
  if (location.protocol !== "https:") {
    urls.push(`http://${host}:${port}/`);
  }
  return urls;
}

function withTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timer };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function median(nums) {
  if (!Array.isArray(nums) || nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function proxyStateKey(network, proxy) {
  const id = proxy?.id ?? "";
  const host = String(proxy?.host || "").trim();
  const port = Number(proxy?.port || 0);
  return `${network}:${id}:${host}:${port}`;
}

async function resolveDnsTiming(host) {
  const safeHost = String(host || "").trim().toLowerCase();
  if (!safeHost) return null;
  const cached = dnsTimingCache.get(safeHost);
  if (cached && Date.now() - cached.ts < DNS_CACHE_TTL_MS) {
    return cached.ms;
  }

  const started = performance.now();
  const { controller, timer } = withTimeoutSignal(DNS_TIMEOUT_MS);
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(safeHost)}&type=A`;
    const response = await fetch(url, { method: "GET", cache: "no-store", signal: controller.signal });
    const elapsed = Math.max(1, Math.round(performance.now() - started));
    if (!response.ok) {
      dnsTimingCache.set(safeHost, { ts: Date.now(), ms: null });
      return null;
    }
    const payload = await response.json().catch(() => null);
    const hasAnswer = payload && Number(payload.Status) === 0 && Array.isArray(payload.Answer) && payload.Answer.length > 0;
    const ms = hasAnswer ? elapsed : null;
    dnsTimingCache.set(safeHost, { ts: Date.now(), ms });
    return ms;
  } catch {
    dnsTimingCache.set(safeHost, { ts: Date.now(), ms: null });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function probeUrlOnce(url, timeoutMs = CLIENT_PING_TIMEOUT_MS) {
  const started = performance.now();
  const { controller, timer } = withTimeoutSignal(timeoutMs);
  try {
    await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
    return { ok: true, timedOut: false, elapsedMs: Math.max(1, Math.round(performance.now() - started)) };
  } catch (e) {
    const elapsedMs = Math.max(1, Math.round(performance.now() - started));
    if (e?.name === "AbortError") return { ok: false, timedOut: true, elapsedMs: timeoutMs };
    return { ok: false, timedOut: false, elapsedMs };
  } finally {
    clearTimeout(timer);
  }
}

function scoreDnsMs(dnsMs) {
  if (!Number.isFinite(dnsMs)) return 0;
  if (dnsMs <= 120) return 22;
  if (dnsMs <= 260) return 16;
  if (dnsMs <= 500) return 10;
  return 4;
}

function scoreLatencyMs(bestMs) {
  if (!Number.isFinite(bestMs)) return 0;
  if (bestMs <= 120) return 24;
  if (bestMs <= 240) return 18;
  if (bestMs <= 450) return 12;
  if (bestMs <= 800) return 6;
  return 2;
}

function buildConnectivityScore({ dnsMs, successCount, delayedFailCount, timeoutCount, fastFailCount, bestMs }) {
  let score = 0;
  score += scoreDnsMs(dnsMs);
  score += scoreLatencyMs(bestMs);
  score += successCount * 18;
  score += delayedFailCount * 5;
  score -= timeoutCount * 14;
  score -= fastFailCount * 10;
  return clamp(Math.round(score), 0, 100);
}

async function checkProxyFromClient(network, proxy) {
  const host = String(proxy.host || "").trim();
  const port = Number(proxy.port);
  if (!host || !Number.isFinite(port) || port <= 0) {
    return { isReachable: false, ping: null, isLivePing: true, isUnstable: false, connectivityScore: 0 };
  }

  const dnsMs = await resolveDnsTiming(host);
  let bestPing = null;
  const pingSamples = [];
  let successCount = 0;
  let delayedFailCount = 0;
  let timeoutCount = 0;
  let fastFailCount = 0;
  const targets = buildClientProbeUrls(host, port);
  for (const target of targets) {
    for (let i = 0; i < CLIENT_PING_ATTEMPTS; i++) {
      const result = await probeUrlOnce(target);
      if (result.ok) {
        successCount += 1;
        pingSamples.push(result.elapsedMs);
        bestPing = bestPing === null ? result.elapsedMs : Math.min(bestPing, result.elapsedMs);
      } else if (!result.timedOut && result.elapsedMs >= 180) {
        // Non-HTTP proxy ports often fail request parsing, but delayed failure
        // still indicates path to host:port is reachable from client network.
        delayedFailCount += 1;
        pingSamples.push(result.elapsedMs);
        bestPing = bestPing === null ? result.elapsedMs : Math.min(bestPing, result.elapsedMs);
      } else if (result.timedOut) {
        timeoutCount += 1;
      } else {
        fastFailCount += 1;
      }
    }
  }

  const basePing = median(pingSamples);
  const delayedReachThreshold = Math.max(1, Math.ceil(CLIENT_PING_ATTEMPTS / 2));
  const rawReachable = successCount > 0 || delayedFailCount >= delayedReachThreshold;
  const score = buildConnectivityScore({
    dnsMs,
    successCount,
    delayedFailCount,
    timeoutCount,
    fastFailCount,
    bestMs: basePing ?? bestPing,
  });

  const key = proxyStateKey(network, proxy);
  const prev = proxyHealthState.get(key) || { failStreak: 0, lastReachable: false, lastPing: null, score: 0 };

  let isReachable = rawReachable;
  let isUnstable = false;
  let failStreak = prev.failStreak || 0;
  let ping = rawReachable ? (basePing ?? bestPing) : null;

  if (rawReachable) {
    failStreak = 0;
    if (Number.isFinite(Number(prev.lastPing)) && Number.isFinite(Number(ping))) {
      ping = Math.round(Number(prev.lastPing) * (1 - PING_SMOOTH_ALPHA) + Number(ping) * PING_SMOOTH_ALPHA);
    }
    if (score < UNSTABLE_SCORE_THRESHOLD) {
      isUnstable = true;
    }
  } else {
    failStreak += 1;
    if (prev.lastReachable && failStreak < CLIENT_FAILS_TO_OFF) {
      isReachable = true;
      isUnstable = true;
      ping = Number.isFinite(Number(prev.lastPing)) ? Number(prev.lastPing) : bestPing;
    } else {
      isReachable = false;
      isUnstable = false;
      ping = null;
    }
  }

  // If score is very strong, do not keep unstable marker.
  if (isReachable && score >= STRONG_SCORE_THRESHOLD) {
    isUnstable = false;
  }

  proxyHealthState.set(key, {
    failStreak,
    lastReachable: isReachable,
    lastPing: ping,
    score,
  });

  return {
    isReachable,
    isUnstable,
    ping,
    isLivePing: true,
    connectivityScore: score,
    dnsResolveMs: Number.isFinite(dnsMs) ? dnsMs : null,
  };
}

async function runUserClientPing(tab, runId, sourceItems) {
  const checks = await Promise.all((sourceItems || []).map((item) => checkProxyFromClient(tab, item)));
  if (userProxyRunIds[tab] !== runId) return;

  const next = (sourceItems || []).map((item, i) => ({
    ...item,
    ...checks[i],
    isChecking: false,
    lastCheckedAt: new Date().toISOString(),
  }));
  setState({ proxies: { ...state.proxies, [tab]: next } });
}

async function runAdminClientPing(runId, sourceItems) {
  const checks = await Promise.all((sourceItems || []).map((item) => checkProxyFromClient(String(item.network || ""), item)));
  if (adminProxyRunId !== runId) return;

  const next = (sourceItems || []).map((item, i) => ({
    ...item,
    ...checks[i],
    isChecking: false,
    lastCheckedAt: new Date().toISOString(),
  }));
  setAdmin({ proxies: next });
}


function freeVpnScreen() {
  return `<section class="stack free-vpn-screen">
    <header class="vpn-page-header">
      <button class="vpn-back-btn mini-btn" data-action="open-tab" data-tab="home" aria-label="Назад">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="vpn-page-title">
        <h1>ahmedov.vpn</h1>
        <p>Инструкция по установке</p>
      </div>
    </header>

    <article class="card p4 vpn-hero-card">
      <div class="vpn-hero-top">
        <div class="vpn-hero-icon"><i class="fa-solid fa-bolt"></i></div>
        <div class="vpn-hero-copy">
          <h2>Быстрые и надёжные сервера</h2>
          <p>ahmedov.vpn использует открытые источники для конфигураций и серверов.</p>
        </div>
      </div>
      <div class="vpn-hero-stats">
        <div class="vpn-stat-tile"><i class="fa-solid fa-earth-europe"></i><div><strong>Более</strong><span>10+ стран</span></div></div>
        <div class="vpn-stat-tile"><i class="fa-solid fa-infinity"></i><div><strong>Без лимитов</strong><span>Трафик</span></div></div>
        <div class="vpn-stat-tile green"><i class="fa-solid fa-rotate"></i><div><strong>Постоянно</strong><span>обновляется</span></div></div>
      </div>
    </article>

    <article class="card p4 vpn-steps-card">
      <div class="vpn-steps-grid">
        <div class="vpn-step-item">
          <div class="vpn-step-index">1</div>
          <h4>Установите приложение Incy</h4>
          <p>Нажмите на иконку чтобы перейти в App Store.</p>
          <a class="vpn-step-visual incy" href="https://apps.apple.com/ru/app/incy/id6756943388" target="_blank" rel="noopener noreferrer" aria-label="Открыть Incy в App Store">INCY</a>
        </div>
        <div class="vpn-step-item">
          <div class="vpn-step-index">2</div>
          <h4>Добавьте подписку в приложение</h4>
          <p>После нажмите на "+" чтобы добавить подписку.</p>
          <a class="vpn-step-visual" href="incy://add/https://ahmedov.online/vpn/sub.php" aria-label="Добавить подписку в Incy"><i class="fa-solid fa-plus"></i></a>
        </div>
        <div class="vpn-step-item">
          <div class="vpn-step-index">3</div>
          <h4>Выберите лучший сервер</h4>
          <p>Используйте кнопку чтобы измерить задержку.</p>
          <div class="vpn-step-visual vpn-step-visual-lightning"><i class="fa-solid fa-bolt"></i></div>
        </div>
      </div>
    </article>

    <article class="card p4 vpn-info-card purple">
      <div class="vpn-info-copy">
        <div class="vpn-info-head">
          <span class="vpn-info-icon"><i class="fa-solid fa-shield-halved"></i></span>
          <div>
            <h3>Что такое "Черный список"?</h3>
            <p>Подписки, обходящие Чёрные списки РКН</p>
          </div>
        </div>
        <div class="muted vpn-info-text">Эти сервера помогают обойти блокировки и ограничения в сетях, где многие сайты и сервисы недоступны. Они используют специальные протоколы и маршруты для стабильного соединения.</div>
        <div class="vpn-country-row">
          <span class="vpn-country-pill">🇩🇪 Германия</span>
          <span class="vpn-country-pill">🇳🇱 Нидерланды</span>
          <span class="vpn-country-pill">🇺🇸 США</span>
          <span class="vpn-country-pill">и другие…</span>
        </div>
      </div>
    </article>

    <article class="card p4 vpn-info-card green">
      <div class="vpn-info-copy">
        <div class="vpn-info-head">
          <span class="vpn-info-icon green"><i class="fa-solid fa-lock"></i></span>
          <div>
            <h3>Что такое "Белый список"?</h3>
            <p>Подписки, обходящие Белые списки РКН</p>
          </div>
        </div>
        <div class="muted vpn-info-text">Эти сервера работают в сетях с белыми списками и ограничениями по доступу. Подходят для мобильных сетей, Wi‑Fi в общественных местах и корпоративных сетей.</div>
        <div class="vpn-country-row">
          <span class="vpn-country-pill">🇫🇮 Финляндия</span>
          <span class="vpn-country-pill">🇸🇪 Швеция</span>
          <span class="vpn-country-pill">🇫🇷 Франция</span>
          <span class="vpn-country-pill">и другие…</span>
        </div>
      </div>
    </article>

    <article class="card p4 vpn-notes-card">
      <div class="vpn-info-head">
        <span class="vpn-info-icon blue"><i class="fa-solid fa-circle-info"></i></span>
        <div>
          <h3>Важно знать про ahmedov.vpn</h3>
          <p>Список серверов берется из открытых источников</p>
        </div>
      </div>
      <ul class="vpn-notes-list">
        <li>Если какой-то сервер не работает обновите подписку чтобы получить новые сервера.</li>
        <li>Сервера могут меняться, так сервис постоянно добавляет новые и удаляет нерабочие.</li>
        <li>За стабильность соеденение и скорость интернета сервис не несет гарантию.</li>
        <li>Мы не храним логи и не отслеживаем вашу активность через VPN и прокси сервера.</li>
      </ul>
    </article>
  </section>`;
}

function vpnTabScreen() {
  const v = state.vpn;
  const source = VPN_SOURCES[v.selectedSource];
  const servers = v.filtered || [];

  // Фильтр: показываем только online или checking серверы (offline скрываем)
  // Если проверка ещё не проводилась — показываем все
  const displayServers = v.latencyChecked || v.latencyChecking
    ? servers.filter(s => s.online || s.checking)
    : servers;

  const sourceTabs = Object.entries(VPN_SOURCES)
    .map(([key, src]) => {
      const isActive = v.selectedSource === key;
      return `<button class="vpn-source-tab ${isActive ? "active" : ""}" data-action="vpn-select-source" data-source="${esc(key)}">${esc(src.name)}</button>`;
    })
    .join("");

  const stats = v.loading
    ? `<div class="vpn-stats"><div class="vpn-stat-item"><div class="vpn-stat-label">Серверов</div><div class="vpn-stat-value">-</div></div><div class="vpn-stat-item"><div class="vpn-stat-label">Доступны</div><div class="vpn-stat-value">-</div></div><div class="vpn-stat-item"><div class="vpn-stat-label">Проверка</div><div class="vpn-stat-value">-</div></div></div>`
    : `<div class="vpn-stats"><div class="vpn-stat-item"><div class="vpn-stat-label">Серверов</div><div class="vpn-stat-value">${esc(servers.length)}</div></div><div class="vpn-stat-item"><div class="vpn-stat-label">Доступны</div><div class="vpn-stat-value online">${esc(v.online)}</div></div><div class="vpn-stat-item"><div class="vpn-stat-label">Проверка</div><div class="vpn-stat-value">${esc(v.checking)}</div></div></div>`;

  // Кнопка проверки пинга вместо поиска
  const checkPingBtn = v.latencyChecking
    ? `<div class="vpn-check-btn-wrapper"><button class="vpn-check-btn checking" disabled><span class="vpn-check-spinner"></span> Проверка пинга...</button></div>`
    : v.latencyChecked
      ? `<div class="vpn-check-btn-wrapper"><button class="vpn-check-btn checked" disabled><i class="fa-solid fa-check"></i> Пинг проверен</button></div>`
      : `<div class="vpn-check-btn-wrapper"><button class="vpn-check-btn" data-action="vpn-check-latency"><i class="fa-solid fa-bolt"></i> Проверить пинг</button></div>`;

  const infoNotice = `<article class="card p3 vpn-info-notice">
    <div class="vpn-info-notice-content">
      <div class="vpn-info-notice-text">
        <div>Серверы загружаются из <strong>открытых источников.</strong> Мы не гарантируем работоспособность и стабильность. Пинг — приблизительная оценка. Реальные значения в приложении могут отличаться.</div>
      </div>
    </div>
  </article>`;

  const serverCards = v.loading
    ? `<div class="vpn-loader-wrapper"><div class="vpn-loader"><div class="vpn-loader-spinner"></div><div class="vpn-loader-text">Загрузка серверов...</div></div></div>`
    : displayServers.length === 0
      ? `<div class="vpn-empty">Нет доступных серверов. Попробуйте выбрать другой источник.</div>`
      : displayServers.map((s) => {
        let pingClass = "";
        if (s.ping < 80) pingClass = "ping-good";
        else if (s.ping < 180) pingClass = "ping-medium";
        else pingClass = "ping-bad";

        // Формируем теги в зависимости от протокола
        let protocolTags = `<span class="vpn-tag">${esc(s.protocol.toUpperCase())}</span>`;

        if (s.protocol === "ss") {
          // Shadowsocks: показываем метод шифрования
          protocolTags += ` <span class="vpn-tag">${esc(s.method || "aes-256-gcm")}</span>`;
        } else {
          // VLESS / Trojan: показываем security и type
          protocolTags += ` <span class="vpn-tag">${esc(s.security || "tls")}</span>`;
          protocolTags += ` <span class="vpn-tag">${esc(s.type || "tcp")}</span>`;
        }

        // Показываем пинг только если была проведена проверка
        if (v.latencyChecked && s.ping !== null && !s.checking) {
          protocolTags += ` <span class="vpn-tag ${pingClass}">${esc(s.ping)} ms</span>`;
        } else if (v.latencyChecked && s.checking) {
          protocolTags += ` <span class="vpn-tag">checking...</span>`;
        }

        return `<div class="vpn-server-card">
            <div class="vpn-server-head">
              <a href="${esc(s.raw)}" class="vpn-server-link" title="Открыть в клиенте">
                <div class="vpn-server-info">
                  <div class="vpn-server-name">${esc(s.name)}</div>
                  <div class="vpn-server-host">${esc(s.host)}:${esc(s.port)}</div>
                </div>
              </a>
              <button class="vpn-qr-btn mini-btn" data-action="vpn-show-qr" data-raw="${esc(s.raw)}" title="Показать QR-код">
                <i class="fa-solid fa-qrcode"></i>
              </button>
            </div>
            <div class="vpn-server-meta">
              ${protocolTags}
            </div>
            <button class="vpn-copy-btn mini-btn" data-action="vpn-copy-config" data-raw="${esc(s.raw)}">
              <i class="fa-solid fa-copy"></i> Копировать конфиг
            </button>
          </div>`;
      }).join("");

  return `<section class="stack vpn-tab-screen">
    <header class="header">
      <div class="brand-icon network-brand" style="color:#a78bfa;background:linear-gradient(180deg,rgba(167,139,250,0.24),rgba(109,40,217,0.82));"><i class="fa-solid fa-shield-halved"></i></div>
      <div class="header-title"><h1>ahmedov.vpn</h1></div>
    </header>
    <div class="vpn-sources-wrapper">
      <div class="vpn-sources-tabs">${sourceTabs}</div>
    </div>
    ${stats}
    ${infoNotice}
    ${checkPingBtn}
    <div class="vpn-servers-list">${serverCards}</div>
  </section>`;
}

function vpnQrModal(rawUrl) {
  if (!rawUrl) return "";

  return `<div class="vpn-qr-overlay" data-action="vpn-hide-qr">
    <article class="vpn-qr-card" data-action="vpn-qr-card">
      <button class="vpn-qr-close mini-btn" data-action="vpn-hide-qr">×</button>
      <h3 class="vpn-qr-title">Отсканируйте QR-код</h3>
      <div id="vpn-qr-container"></div>
    </article>
  </div>`;
}


function installGuideModal() {
  if (!state.installGuideOpen) return "";
  return `<div class="pwa-install-overlay" data-action="hide-install-guide">
      <article class="pwa-install-dialog" style="--tint-color:#424ef4;">
        <button class="pwa-install-close" data-action="hide-install-guide" title="Закрыть">
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M5.3 18.7c.2.2.4.3.7.3s.5-.1.7-.3l5.3-5.3 5.3 5.3a1.08 1.08 0 0 0 .7.3 1.08 1.08 0 0 0 .7-.3c.4-.4.4-1 0-1.4L13.4 12l5.3-5.3c.4-.4.4-1 0-1.4s-1-.4-1.4 0L12 10.6 6.7 5.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l5.3 5.3-5.3 5.3c-.4.4-.4 1 0 1.4z" fill="currentColor"/></svg>
        </button>
        <div class="pwa-install-header">
          <div class="pwa-install-icon">
            <img src="./assets/icons/icon-192.svg" alt="App icon" width="64" height="64" draggable="false" />
          </div>
          <div class="pwa-install-about">
            <div class="pwa-install-name">ahmedov.proxy</div>
            <div class="pwa-install-desc">Установка приложения</div>
          </div>
        </div>
        <div class="pwa-install-body">
          <div class="pwa-install-intro">Добавьте сайт на главный экран, чтобы открывать кабинет как отдельное приложение.</div>
          <div class="pwa-step-list">
            <div class="pwa-platform">
              <div class="pwa-platform-head"><span class="pwa-platform-symbol">${pwaSafariSVG()}</span><div><strong>iPhone</strong><span>Safari</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon">${pwaSafariSVG()}</span><div><strong>Откройте сайт в Safari</strong><span>Установка на iPhone работает через браузер Safari.</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon">${pwaShareSVG()}</span><div><strong>Нажмите «Поделиться»</strong><span>Кнопка находится в нижней панели браузера.</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon">${pwaAddSVG()}</span><div><strong>Выберите «На экран Домой»</strong><span>Подтвердите добавление и запустите иконку с главного экрана.</span></div></div>
            </div>
            <div class="pwa-platform">
              <div class="pwa-platform-head"><span class="pwa-platform-symbol"><i class="fa-brands fa-android"></i></span><div><strong>Android</strong><span>Chrome</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon"><i class="fa-brands fa-chrome"></i></span><div><strong>Откройте сайт в Chrome</strong><span>Лучше использовать Chrome или совместимый браузер.</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon">${pwaDotsSVG()}</span><div><strong>Откройте меню браузера</strong><span>Нажмите на значок с тремя точками в верхней части экрана.</span></div></div>
              <div class="pwa-step-card"><span class="pwa-step-icon">${pwaAddSVG()}</span><div><strong>Нажмите «Установить приложение»</strong><span>После установки открывайте кабинет через иконку на главном экране.</span></div></div>
            </div>
          </div>
        </div>
      </article>
    </div>`;
}

function pwaBlockedScreen() {
  return `
  <section class="stack">
    <header class="landing-header">
      <div class="landing-brand">
        <div class="brand-icon"><img src="./assets/icons/icon-192.svg" alt="ahmedov.proxy" /></div>
        <div class="landing-brand-copy">
          <h1>ahmedov.proxy</h1>
          <p>Премиум прокси-сервера</p>
        </div>
      </div>
    </header>

    <article class="card p4 stack pwa-lock-card landing-hero landing-shell">
      <div class="landing-hero-grid">
        <div class="landing-copy">
          <h2 class="landing-title">Прокси для Telegram и WhatsApp <span>без блокировок</span></h2>
          <p class="landing-subtitle">Быстрые, приватные и стабильные прокси-сервера без VPN</p>
        </div>
        <div class="landing-visual" aria-hidden="true">
          <div class="landing-orbit orbit-a"></div>
          <div class="landing-orbit orbit-b"></div>
          <div class="landing-bubble tg"><i class="fa-brands fa-telegram"></i></div>
          <div class="landing-bubble wa"><i class="fa-brands fa-whatsapp"></i></div>
          <div class="landing-server-stack">
            <span class="landing-server top"></span>
            <span class="landing-server middle"></span>
            <span class="landing-server bottom"></span>
          </div>
        </div>
      </div>

      <div class="landing-feature-grid">
        <div class="landing-feature-tile"><i class="fa-solid fa-bolt"></i><span>Низкий пинг</span></div>
        <div class="landing-feature-tile"><i class="fa-solid fa-shield-halved"></i><span>Безопасное подключение</span></div>
        <div class="landing-feature-tile"><i class="fa-solid fa-earth-europe"></i><span>EU сервера</span></div>
      </div>

      <button class="btn landing-cta-btn" data-action="go-app-route">
        <i class="fa-solid fa-bolt"></i>
        <span>Подключить сейчас</span>
      </button>
      <div class="landing-cta-note"><i class="fa-solid fa-lock"></i><span>После перехода откроется личный кабинет: вход, оплата и подключение доступны и в браузере, и в приложении.</span></div>
    </article>

    <article class="card p3 stack landing-pricing-card">
      <div class="landing-section-head">
        <h3>Тарифы</h3>
        <p>Чем больше срок, тем выгоднее</p>
      </div>
      <div class="landing-tariff-grid">
        <button class="landing-plan-card" data-action="go-app-route">
          <div class="landing-plan-meta">
            <strong>90 дней</strong>
            <span>Оптимальный старт</span>
            <em>~5.4 ₽ в день</em>
          </div>
          <div class="landing-plan-price">490 ₽ <i class="fa-solid fa-angle-right"></i></div>
        </button>
        <button class="landing-plan-card landing-plan-card-best" data-action="go-app-route">
          <div class="landing-plan-badge hot"><i class="fa-solid fa-fire"></i> Самый популярный</div>
          <div class="landing-plan-meta">
            <strong>180 дней</strong>
            <span>Лучшая выгода</span>
            <em>~3.8 ₽ в день</em>
          </div>
          <div class="landing-plan-price best">690 ₽ <i class="fa-solid fa-angle-right"></i></div>
        </button>
        <button class="landing-plan-card" data-action="go-app-route">
          <div class="landing-plan-badge cool"><i class="fa-solid fa-gem"></i> Максимальная выгода</div>
          <div class="landing-plan-meta">
            <strong>360 дней</strong>
            <span>Большая экономия</span>
            <em>~2.7 ₽ в день</em>
          </div>
          <div class="landing-plan-price cool">990 ₽ <i class="fa-solid fa-angle-right"></i></div>
        </button>
      </div>
      <div class="landing-refund-note"><i class="fa-solid fa-shield-heart"></i><span>Гарантия возврата средств 24 часа</span></div>
    </article>

    <article class="card p3 stack landing-flow-card">
      <div class="landing-section-head">
        <h3>Как это работает?</h3>
      </div>
      <div class="landing-flow-grid">
        <div class="landing-flow-step"><div class="landing-flow-icon"><i class="fa-regular fa-credit-card"></i></div><span>1. Оплачиваете тариф</span></div>
        <div class="landing-flow-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="landing-flow-step"><div class="landing-flow-icon"><i class="fa-regular fa-envelope"></i></div><span>2. Получаете прокси</span></div>
        <div class="landing-flow-arrow"><i class="fa-solid fa-arrow-right"></i></div>
        <div class="landing-flow-step"><div class="landing-flow-icon success"><i class="fa-solid fa-circle-check"></i></div><span>4. Пользуетесь без ограничений</span></div>
      </div>
    </article>

    <div class="landing-benefit-grid">
      <article class="card p3 landing-benefit-card"><i class="fa-solid fa-shield-halved"></i><span>Работает без VPN</span></article>
      <article class="card p3 landing-benefit-card"><i class="fa-solid fa-gauge-high"></i><span>Высокая скорость</span></article>
      <article class="card p3 landing-benefit-card"><i class="fa-solid fa-headset"></i><span>Поддержка 24/7</span></article>
    </div>

  </section>`;
}


function adminUsersSection() {
  const a = state.admin;
  const users = sortAdminUsersByDays((a.users || []).filter((u) => (a.userSearch ? String(u.phone || "").includes(a.userSearch.replace(/\D/g, "")) : true)), a.userSort);
  return `
  <section class="stack">
    <article class="card p3 stack">
      <h3 style="margin:0;font-size:1rem;">Добавить / обновить участника</h3>
      <input placeholder="+7 900 123 45 67" value="${esc(a.userForm.phone)}" data-input="admin-user-phone" />
      <div class="grid-2">
        <input placeholder="Тариф" value="${esc(a.userForm.subscription_type)}" data-input="admin-user-type" />
        <input placeholder="Дней" type="number" value="${esc(a.userForm.duration_days)}" data-input="admin-user-days" />
      </div>
      <div class="grid-2">
        <button class="btn btn-primary" data-action="admin-save-user">${a.saving ? "Сохраняем..." : "Сохранить участника"}</button>
        <label class="custom-checkbox" style="font-size:13px;">
          <input type="checkbox" data-input="admin-user-active" ${a.userForm.is_active ? "checked" : ""} />
          <span class="custom-box" aria-hidden="true"></span>
          <span class="label-text">Активный доступ</span>
        </label>
      </div>
    </article>
    <article class="card p3">
      <div class="user-search-row">
        <input placeholder="Поиск по номеру" value="${esc(a.userSearch)}" data-input="admin-user-search" />
        <button class="mini-btn user-sort-btn ${a.userSort === "asc" ? "is-asc" : ""}" type="button" data-action="admin-user-sort" aria-label="Сортировать по количеству дней" title="${a.userSort === "asc" ? "Сначала меньше дней" : "Сначала больше дней"}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="m6 13 6 6 6-6" />
          </svg>
        </button>
      </div>
    </article>
    ${a.loading
      ? Array.from({ length: 4 })
        .map(() => `<div class="card skeleton"></div>`)
        .join("")
      : users
        .map(
          (u) => `<article class="card p3 stack">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
            <strong>${esc(u.displayPhone)}</strong>
            <span class="pill ${u.isActive ? "wa" : ""}" style="${u.isActive ? "" : "background:rgba(248,113,113,.15);color:#fca5a5;"}">${u.isActive ? "Активен" : "Отключён"}</span>
          </div>
          ${subscriptionSummary(u)}
          <button class="mini-btn" data-action="copy-invite" data-code="${esc(u.inviteCode || "")}" style="text-align:left;border:1px solid rgba(100,222,121,.35);background:rgba(100,222,121,.12);color:var(--wa);font-weight:700;">invite: ${esc(u.inviteCode || "—")}</button>
          <div class="grid-2">
            <button class="mini-btn" data-action="admin-edit-user" data-phone="${esc(u.phone)}">Изменить</button>
            <button class="mini-btn" style="background:rgba(239,68,68,.14);color:#fca5a5;" data-action="admin-delete-user" data-phone="${esc(u.phone)}">Удалить</button>
          </div>
        </article>`
        )
        .join("")
    }
  </section>`;
}

function adminProxiesSection() {
  const a = state.admin;
  const rows = (a.proxies || []).filter((p) => p.network === a.proxyFilter);
  return `
  <section class="stack">
    <article class="card p3 stack">
      <h3 style="margin:0;font-size:1rem;">Добавить / обновить прокси</h3>
      <div class="grid-1">
        <div class="radio-toggle-group" role="tablist" aria-label="Выберите сеть">
          ${["telegram", "whatsapp"]
      .map((n) => `
              <button type="button" class="radio-toggle ${a.proxyForm.network === n ? "active" : ""}" data-action="admin-proxy-network-select" data-network="${esc(n)}">${esc(n.charAt(0).toUpperCase() + n.slice(1))}</button>
            `)
      .join("")}
        </div>
     </div>
        <input placeholder="Название" value="${esc(a.proxyForm.name)}" data-input="admin-proxy-name" />
      <div class="grid-2">
        <input placeholder="host" value="${esc(a.proxyForm.host)}" data-input="admin-proxy-host" />
        <input placeholder="port" type="number" min="1" max="65535" value="${esc(a.proxyForm.port)}" data-input="admin-proxy-port" />
      </div>
      <input placeholder="connect_url" value="${esc(a.proxyForm.connect_url)}" data-input="admin-proxy-url" />
      <div class="grid-2">
        <button class="btn btn-primary" data-action="admin-save-proxy">${a.saving ? "Сохраняем..." : "Сохранить прокси"}</button>
        <label class="custom-checkbox" style="font-size:13px;">
          <input type="checkbox" data-input="admin-proxy-active" ${a.proxyForm.is_active ? "checked" : ""} />
          <span class="custom-box" aria-hidden="true"></span>
          <span class="label-text">Активный</span>
        </label>
      </div>
      <label class="custom-checkbox" style="font-size:13px; margin-top:8px;">
        <input type="checkbox" data-input="admin-proxy-recommended" ${a.proxyForm.is_recommended ? "checked" : ""} />
        <span class="custom-box" aria-hidden="true" style="background:linear-gradient(135deg, #fbbf24, #f59e0b);"></span>
        <span class="label-text" style="color:#fbbf24;">by ahmedov</span>
      </label>
    </article>
    <article class="card p3 stack">
      <h3 style="margin:0;font-size:1rem;">Массовое добавление прокси</h3>
      <div class="muted" style="font-size:12px;">Сеть возьмется из текущей вкладки: <strong>${esc(a.proxyFilter)}</strong></div>
      <div class="muted" style="font-size:12px;">Формат строки: <code>WA Германия | wa2.example.com | 10022 | whatsapp://send?phone=79990000000 | 1</code></div>
      <div class="muted" style="font-size:12px;">Поля: название | host | port | connect_url | active (1 или 0)</div>
      <textarea placeholder="WA Германия | wa2.example.com | 10022 | whatsapp://send?phone=79990000000 | 1" data-input="admin-bulk-proxies" style="min-height:120px;resize:vertical;">${esc(a.bulkProxiesText)}</textarea>
      <button class="btn btn-primary" data-action="admin-import-proxies">${a.saving ? "Импортируем..." : "Импортировать прокси"}</button>
    </article>
    <div class="card tabs" style="grid-template-columns: repeat(2, minmax(0, 1fr))">
      ${["telegram", "whatsapp"]
      .map((n) => `<button class="${a.proxyFilter === n ? "active" : ""}" data-action="admin-proxy-filter" data-network="${n}">${n}</button>`)
      .join("")}
    </div>
    ${a.loading
      ? Array.from({ length: 4 })
        .map(() => `<div class="card skeleton"></div>`)
        .join("")
      : rows
        .map((p) => {
          const tg = p.network === "telegram";
          return `<article class="card p3 stack">
                <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
                  <strong>${esc(p.name)}</strong>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="admin-proxy-status" style="color:${p.isReachable ? "var(--muted)" : "#f87171"};">
                      <span class="dot ${p.isChecking ? "checking" : p.isUnstable ? "unstable" : p.isReachable ? (tg ? "tg" : "wa") : "off"}"></span>
                      ${p.isChecking ? "..." : p.isReachable ? `${esc(p.ping)} ms` : "off"}
                    </span>
                    <span class="pill ${tg ? "tg" : "wa"}">${esc(p.network)}</span>
                  </div>
                </div>
                <div class="grid-3">
                  <button class="mini-btn" data-action="admin-edit-proxy" data-id="${esc(p.id)}">Изменить</button>
                  <button class="mini-btn" data-action="admin-toggle-proxy" data-id="${esc(p.id)}">${p.isActive ? "Откл." : "Вкл."}</button>
                  <button class="mini-btn" style="background:rgba(239,68,68,.14);color:#fca5a5;" data-action="admin-delete-proxy" data-id="${esc(p.id)}">Удалить</button>
                </div>
              </article>`;
        })
        .join("")
    }
  </section>`;
}

function adminPromoCodesSection() {
  const a = state.admin;
  const planNames = {
    301: "3 месяца",
    302: "6 месяцев",
    303: "12 месяцев",
  };
  return `
  <section class="stack">
    <article class="card p3 stack">
      <h3 style="margin:0;font-size:1rem;">Добавить / обновить промокод</h3>
      <input placeholder="Промокод (например: PREM150)" value="${esc(a.promoForm.code)}" data-input="admin-promo-code" />
      <div class="radio-toggle-group" style="grid-template-columns: repeat(3, minmax(0, 1fr))" role="tablist" aria-label="Выберите тариф">
        ${[301, 302, 303]
      .map((id) =>
        `<button type="button" class="radio-toggle ${a.promoForm.plan_id === id ? "active" : ""}" data-action="admin-promo-select" data-plan-id="${id}">${esc(planNames[id] || id)}</button>`
      )
      .join("")}
      </div>
      <input placeholder="Скидка (сумма в рублях, например: 150)" type="number" value="" data-input="admin-promo-discount" />
      <input placeholder="Цена с промокодом (отображается на сайте, например: 150 ₽)" value="${esc(a.promoForm.price_label)}" data-input="admin-promo-price-label" />
      <div class="grid-2">
        <button class="btn btn-primary" data-action="admin-save-promo">${a.saving ? "Сохраняем..." : "Сохранить промокод"}</button>
        <label class="custom-checkbox" style="font-size:13px;">
          <input type="checkbox" data-input="admin-promo-active" ${a.promoForm.is_active ? "checked" : ""} />
          <span class="custom-box" aria-hidden="true"></span>
          <span class="label-text">Активный промокод</span>
        </label>
      </div>
    </article>
    ${a.loading
      ? Array.from({ length: 3 })
        .map(() => `<div class="card skeleton"></div>`)
        .join("")
      : (a.promoCodes || [])
        .map((p) => `<article class="card p3 stack">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
                <div>
                  <strong style="font-size:16px;">${esc(p.code)}</strong>
                  <div class="muted" style="font-size:12px;">Тариф: ${esc(planNames[p.plan_id] || p.plan_id)} • ${esc(p.discount_amount || 0)} ₽ скидка • ${esc(p.price_label)}</div>
                </div>
                <span class="pill ${p.is_active ? "wa" : ""}" style="${p.is_active ? "" : "background:rgba(248,113,113,.15);color:#fca5a5;"}">${p.is_active ? "Активен" : "Откл."}</span>
              </div>
              <div class="grid-3">
                <button class="mini-btn" data-action="admin-edit-promo" data-id="${esc(p.id)}">Изменить</button>
                <button class="mini-btn" data-action="admin-toggle-promo" data-id="${esc(p.id)}">${p.is_active ? "Откл." : "Вкл."}</button>
                <button class="mini-btn" style="background:rgba(239,68,68,.14);color:#fca5a5;" data-action="admin-delete-promo" data-id="${esc(p.id)}">Удалить</button>
              </div>
            </article>`)
        .join("")
    }
  </section>`;
}

function adminScreen() {
  const a = state.admin;
  return `
  <section class="stack">
    ${header("")}
    <div class="card tabs">
      <button class="${a.section === "users" ? "active" : ""}" data-action="admin-section" data-section="users">Участники</button>
      <button class="${a.section === "proxies" ? "active" : ""}" data-action="admin-section" data-section="proxies">Прокси-серверы</button>
      <button class="${a.section === "promoCodes" ? "active" : ""}" data-action="admin-section" data-section="promoCodes">Промокоды</button>
    </div>
    ${a.message ? `<div class="card p3 muted" style="font-size:12px;">${esc(a.message)}</div>` : ""}
    ${a.lastInviteCode ? `<div class="card p3"><div class="muted" style="font-size:12px;">Новый invite-код</div><strong style="font-size:20px;color:var(--wa);letter-spacing:.14em;">${esc(a.lastInviteCode)}</strong></div>` : ""}
    ${a.section === "users" ? adminUsersSection() : a.section === "proxies" ? adminProxiesSection() : adminPromoCodesSection()}
    <button class="btn btn-logout" data-action="logout">Выйти из аккаунта</button>
  </section>`;
}


function header(subtitle) {
  return `<header class="header">
      <div class="brand-icon"><img src="./assets/icons/icon-192.svg" alt="ahmedov.proxy" /></div>
      <div class="header-title"><h1>ahmedov.proxy</h1><p>${esc(subtitle || "")}</p></div>
    </header>`;
}




// ==========================
// VPN FUNCTIONS
// ==========================

function parseVlessConfig(line) {
  try {
    const url = new URL(line);
    if (url.protocol !== "vless:") return null;

    const name = decodeURIComponent(url.hash.replace("#", "")) || "Unknown";
    const host = url.hostname;
    const port = url.port || "443";
    const security = url.searchParams.get("security") || "tls";
    const type = url.searchParams.get("type") || "tcp";
    const sni = url.searchParams.get("sni") || host;

    return {
      raw: line,
      name,
      host,
      port,
      security,
      type,
      sni,
      ping: null,
      checking: true,
      online: false,
      country: detectCountryFromName(name),
      protocol: "vless"
    };
  } catch {
    return null;
  }
}

function parseShadowsocksConfig(line) {
  try {
    // Format: ss://base64(method:password@host:port)#name or ss://method:password@host:port#name
    let urlStr = line.replace("ss://", "");
    const hashIndex = urlStr.indexOf("#");
    let name = "";

    if (hashIndex !== -1) {
      name = decodeURIComponent(urlStr.slice(hashIndex + 1));
      urlStr = urlStr.slice(0, hashIndex);
    }

    let decoded = urlStr;

    // Try base64 decoding
    try {
      // Check if the whole thing before @ is base64
      const atIndex = urlStr.indexOf("@");
      if (atIndex !== -1) {
        const b64Part = urlStr.slice(0, atIndex);
        const rest = urlStr.slice(atIndex);
        // Check if it looks like base64 (no : in decoded means it's probably base64)
        if (!b64Part.includes(":") && b64Part.length > 0) {
          const decodedB64 = atob(b64Part);
          if (decodedB64.includes(":")) {
            decoded = decodedB64 + rest;
          }
        }
      } else {
        // Try decoding entire string
        const decodedB64 = atob(urlStr);
        if (decodedB64.includes("@")) {
          decoded = decodedB64;
        }
      }
    } catch {
      // Not base64, use as-is
    }

    const match = decoded.match(/([^:@]+):([^@]+)@([^:]+):(\d+)/);
    if (!match) return null;

    const [, method, password, host, port] = match;

    return {
      raw: line,
      name: name || `${host}:${port}`,
      host,
      port,
      method,
      password,
      ping: null,
      checking: true,
      online: false,
      country: detectCountryFromName(name),
      protocol: "ss",
      security: method,
      type: "tcp"
    };
  } catch {
    return null;
  }
}

function parseTrojanConfig(line) {
  try {
    const url = new URL(line);
    if (url.protocol !== "trojan:") return null;

    const name = decodeURIComponent(url.hash.replace("#", "")) || "Unknown";
    const host = url.hostname;
    const port = url.port || "443";
    const security = url.searchParams.get("security") || "tls";
    const type = url.searchParams.get("type") || "tcp";
    const sni = url.searchParams.get("sni") || host;

    return {
      raw: line,
      name,
      host,
      port,
      security,
      type,
      sni,
      ping: null,
      checking: true,
      online: false,
      country: detectCountryFromName(name),
      protocol: "trojan"
    };
  } catch {
    return null;
  }
}

function detectCountryFromName(name) {
  const n = (name || "").toLowerCase();

  if (n.includes("german") || n.includes("deutsch") || n.includes("de ")) return "🇩🇪";
  if (n.includes("nether") || n.includes("nl ") || n.includes("amsterdam")) return "🇳🇱";
  if (n.includes("france") || n.includes("fr ") || n.includes("paris")) return "🇫🇷";
  if (n.includes("finland") || n.includes("fi ") || n.includes("helsinki")) return "🇫🇮";
  if (n.includes("russia") || n.includes("ru ") || n.includes("moscow")) return "🇷🇺";
  if (n.includes("usa") || n.includes("us ") || n.includes("america")) return "🇺🇸";
  if (n.includes("uk ") || n.includes("gb ") || n.includes("london")) return "🇬🇧";
  if (n.includes("turkey") || n.includes("tr ") || n.includes("istanbul")) return "🇹🇷";
  if (n.includes("singapore") || n.includes("sg ") || n.includes("singapur")) return "🇸🇬";
  if (n.includes("japan") || n.includes("jp ") || n.includes("tokyo")) return "🇯🇵";
  if (n.includes("poland") || n.includes("pl ") || n.includes("warsaw")) return "🇵🇱";
  if (n.includes("sweden") || n.includes("se ") || n.includes("stockholm")) return "🇸🇪";
  if (n.includes("norway") || n.includes("no ") || n.includes("oslo")) return "🇳🇴";
  if (n.includes("spain") || n.includes("es ") || n.includes("madrid")) return "🇪🇸";
  if (n.includes("italy") || n.includes("it ") || n.includes("rome")) return "🇮🇹";
  if (n.includes("ukraine") || n.includes("ua ") || n.includes("kiev")) return "🇺🇦";
  if (n.includes("korea") || n.includes("kr ") || n.includes("seoul")) return "🇰🇷";
  if (n.includes("india") || n.includes("in ") || n.includes("mumbai")) return "🇮🇳";
  if (n.includes("brazil") || n.includes("br ") || n.includes("saopaulo")) return "🇧🇷";
  if (n.includes("canada") || n.includes("ca ") || n.includes("toronto")) return "🇨🇦";
  if (n.includes("australia") || n.includes("au ") || n.includes("sydney")) return "🇦🇺";

  return "🌍";
}

async function checkVpnServerLatency(server) {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(`https://${server.host}:${server.port}/`, {
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timeout);
    const end = performance.now();

    server.ping = Math.floor(end - start);
    server.online = true;
  } catch {
    server.ping = 999;
    server.online = false;
  }

  server.checking = false;
  updateVpnStats();
  renderVpnServers();
}

async function loadVpnServers(sourceKey) {
  const v = state.vpn;
  const source = VPN_SOURCES[sourceKey];

  if (!source) return;

  v.loading = true;
  v.selectedSource = sourceKey;
  v.servers = [];
  v.filtered = [];
  v.checking = 0;
  v.online = 0;
  v.latencyChecking = false;
  v.latencyChecked = false;

  render();

  try {
    const response = await fetch(source.url);
    const text = await response.text();
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);

    const parsed = [];

    for (const line of lines) {
      let config = null;

      // Парсим все протоколы из каждого источника
      if (line.startsWith("vless://")) {
        config = parseVlessConfig(line);
      } else if (line.startsWith("ss://")) {
        config = parseShadowsocksConfig(line);
      } else if (line.startsWith("trojan://")) {
        config = parseTrojanConfig(line);
      }

      if (config) {
        parsed.push(config);
      }
    }

    // Удаляем дубликаты по host:port (оставляем первый встреченный)
    const uniqueServers = new Map();
    for (const server of parsed) {
      const key = `${server.host}:${server.port}`;
      if (!uniqueServers.has(key)) {
        uniqueServers.set(key, server);
      }
    }
    const deduped = Array.from(uniqueServers.values());

    // Сортируем по алфавиту по умолчанию
    deduped.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "ru"));

    v.servers = deduped;
    v.filtered = deduped.slice();
    v.loading = false;
    updateVpnStats();

    render();
    // НЕ вызываем startVpnLatencyChecks() — проверка только по кнопке

  } catch (e) {
    console.error("Failed to load VPN servers:", e);
    v.loading = false;
    v.servers = [];
    v.filtered = [];
    render();
  }
}

async function startVpnLatencyChecks() {
  const v = state.vpn;

  v.latencyChecking = true;
  render();

  for (const server of v.servers) {
    if (!v.servers.includes(server)) break;
    checkVpnServerLatency(server);
    await delay(150);
  }

  // После завершения всех проверок
  v.latencyChecking = false;
  v.latencyChecked = true;
  renderVpnServers();
}

function updateVpnStats() {
  const v = state.vpn;
  v.checking = v.servers.filter(s => s.checking).length;
  v.online = v.servers.filter(s => s.online).length;
}

function renderVpnServers() {
  const v = state.vpn;

  // Если пинг проверен — сортируем по пингу (сначала меньший)
  if (v.latencyChecked) {
    v.filtered.sort((a, b) => {
      // Сначала online, потом offline
      if (a.online !== b.online) return a.online ? -1 : 1;
      // Потом по пингу
      const aPing = Number.isFinite(Number(a.ping)) ? Number(a.ping) : Infinity;
      const bPing = Number.isFinite(Number(b.ping)) ? Number(b.ping) : Infinity;
      return aPing - bPing;
    });
  }
  // Иначе оставляем алфавитную сортировку (установленную в loadVpnServers)

  render();
}

function copyVpnConfig(raw) {
  navigator.clipboard.writeText(raw).then(() => {
    // Could show toast notification here
  }).catch(err => {
    console.error("Failed to copy:", err);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================
// END VPN FUNCTIONS
// ==========================

// ==========================
// UI: тема, иконки, помощники
// ==========================

const THEME_KEY = "ahmedov_theme";
const SUPPORT_LINKS = {
  telegram: "https://t.me/ahmedov_ml",
  whatsapp: "https://wa.me/79634150424",
  max: "https://max.ru/u/f9LHodD0cOLBq3KUwiAyCSuy5O0b_WLBftdzJEXvScaVD9z-wuBEgQLxHoE",
};

function themeChoice() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

function resolvedTheme() {
  const c = themeChoice();
  if (c !== "auto") return c;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme() {
  const t = resolvedTheme();
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#F2F3F7" : "#0A0A0D");
}

function setThemeChoice(choice) {
  try {
    if (choice === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch { }
  applyTheme();
  render();
}

applyTheme();
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const onSchemeChange = () => { if (themeChoice() === "auto") { applyTheme(); render(); } };
  if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
  else if (mq.addListener) mq.addListener(onSchemeChange);
}

const UI_ICON_PATHS = {
  tg: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z" fill="currentColor" stroke="none"/>',
  wa: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  homeFill: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>',
  servers: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  serversFill: '<rect x="3" y="4" width="18" height="7" rx="2" fill="currentColor"/><rect x="3" y="13" width="18" height="7" rx="2" fill="currentColor"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  userFill: '<circle cx="12" cy="8" r="4.2" fill="currentColor" stroke="none"/><path d="M3.8 21c1.4-4.3 4.6-6.4 8.2-6.4s6.8 2.1 8.2 6.4z" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  doc: '<path d="M7 3h8l4 4v14H7zM10 12h6M10 16h6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  tag: '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.6L3 9M4 13a8 8 0 0 0 14.6 4.6L21 15M3 4v5h5M21 20v-5h-5"/>',
};

function uiIcon(name, size = 22, strokeWidth = 1.9) {
  const body = UI_ICON_PATHS[name] || "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

function ruPlural(n, one, few, many) {
  const a = Math.abs(Number(n)) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

const RU_MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function formatDateLong(value) {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${Number(m[3])} ${RU_MONTHS_GEN[Number(m[2]) - 1] || ""} ${m[1]}`;
}

function greetingText() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Доброе утро";
  if (h >= 12 && h < 18) return "Добрый день";
  if (h >= 18 && h < 23) return "Добрый вечер";
  return "Доброй ночи";
}

function splitProxyName(name) {
  const s = String(name || "").trim();
  const m = s.match(/^([\u{1F1E6}-\u{1F1FF}]{2})\s*/u);
  if (!m) return { cc: "", name: s };
  const cc = [...m[1]].map((ch) => String.fromCharCode(ch.codePointAt(0) - 0x1F1E6 + 65)).join("");
  return { cc, name: s.slice(m[0].length) || s };
}

function proxyKeyOf(p) {
  return `${p?.host || ""}:${p?.port || ""}`;
}

function pickBestProxy(items) {
  const list = items || [];
  const recommended = list.find((p) => p.isRecommended);
  if (recommended) return recommended;
  const reachable = list.filter((p) => p.isReachable && Number.isFinite(Number(p.ping)));
  if (!reachable.length) return null;
  const stable = reachable.filter((p) => !p.isUnstable);
  const source = stable.length ? stable : reachable;
  return source.reduce((a, b) => (Number(a.ping) <= Number(b.ping) ? a : b));
}

function proxyStatus(p) {
  if (!p) return { cls: "", text: "" };
  if (p.isChecking && !p.lastCheckedAt) return { cls: "checking", text: "проверяем…" };
  const ms = Number(p.ping);
  const msText = Number.isFinite(ms) && ms > 0 ? `${Math.round(ms)} мс` : "в сети";
  if (p.isReachable && !p.isUnstable) return { cls: "ok", text: msText };
  if (p.isReachable) return { cls: "slow", text: msText };
  return { cls: "off", text: "нет ответа" };
}

function ensureHomeProxies() {
  ["telegram", "whatsapp"].forEach((net) => {
    if (!(state.proxies[net] || []).length) void loadUserProxies(net);
  });
}

function contactButtons() {
  return `<div class="ui-contacts">
    <a class="ui-contact tg" href="${SUPPORT_LINKS.telegram}" target="_blank" rel="noopener">Telegram</a>
    <a class="ui-contact wa" href="${SUPPORT_LINKS.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
    <a class="ui-contact max" href="${SUPPORT_LINKS.max}" target="_blank" rel="noopener">MAX</a>
  </div>`;
}

function isClientUiScreen() {
  if (isPaymentRoute()) return true;
  if (state.pwaBlocked) return false;
  if (state.booting) return true;
  if (!state.token || !state.user || (state.role !== "admin" && !state.subscription)) return true;
  if (state.role === "admin") return false;
  return state.activeTab !== "vpn" && state.activeTab !== "free-vpn";
}

function planPerMonth(plan) {
  const amount = Number(String(plan?.price || "").replace(/\D+/g, ""));
  const months = Number(plan?.durationMonths || 0) || Math.round(Number(plan?.durationDays || 0) / 30);
  if (!amount || !months) return null;
  return amount / months;
}

function planCards(plans, selectedId) {
  const base = plans.length ? planPerMonth(plans[0]) : null;
  return `<div class="ui-plans" role="radiogroup" aria-label="Тариф">${plans.map((plan) => {
    const on = Number(selectedId) === Number(plan.id);
    const perMonth = planPerMonth(plan);
    const save = base && perMonth && perMonth < base ? Math.round((1 - perMonth / base) * 100) : 0;
    return `<button class="ui-plan ${on ? "on" : ""}" role="radio" aria-checked="${on}" data-action="select-plan" data-plan-id="${esc(plan.id)}">
      <span class="ui-radio">${on ? uiIcon("check", 14, 3.4) : ""}</span>
      <span class="ui-plan-text">
        <span class="ui-plan-title">${esc(plan.name)}${save ? `<span class="ui-plan-save">−${save}%</span>` : ""}</span>
        <span class="ui-plan-sub">${perMonth ? `${Math.round(perMonth)} ₽ в месяц` : esc((plan.benefits || []).join(" · "))}</span>
      </span>
      <span class="ui-plan-price">${esc(plan.price)}</span>
    </button>`;
  }).join("")}</div>`;
}

// ==========================
// UI: экраны клиента
// ==========================

function homeScreen() {
  const phone = displayPhone(state.user?.phone || "");
  const s = state.subscription || {};
  const days = Math.max(0, Number(s.daysLeft) || 0);
  const soon = days <= 7;
  const expires = formatDateLong(s.expiresAt);
  const isDark = resolvedTheme() === "dark";

  const all = [...(state.proxies.telegram || []), ...(state.proxies.whatsapp || [])];
  const checked = all.filter((p) => !p.isChecking);
  const online = checked.filter((p) => p.isReachable).length;
  const pct = all.length ? Math.round((online / all.length) * 100) : 0;
  const stillChecking = all.some((p) => p.isChecking);

  const quickRow = (net) => {
    const isTg = net === "telegram";
    const items = state.proxies[net] || [];
    const best = pickBestProxy(items);
    const checking = items.some((p) => p.isChecking);
    const st = proxyStatus(best);
    const sub = best
      ? `<span class="ui-dot ${st.cls}"></span>${esc(splitProxyName(best.name).name)} · ${esc(st.text)}`
      : checking || !items.length
        ? `<span class="ui-dot checking"></span>Ищем лучший сервер…`
        : `<span class="ui-dot"></span>Откройте список серверов`;
    const btn = best
      ? `<button class="ui-btn-sm" data-action="open-proxy-connect" data-connect-url="${esc(best.connectUrl)}" data-network="${net}" data-proxy-key="${esc(proxyKeyOf(best))}">Подключить</button>`
      : `<button class="ui-btn-sm soft" data-action="open-tab" data-tab="${net}">Список</button>`;
    return `<div class="ui-qrow">
      <span class="ui-app-icon ${isTg ? "tg" : "wa"}">${uiIcon(isTg ? "tg" : "wa", 22, 2.1)}</span>
      <span class="ui-qrow-text"><span class="ui-qrow-title">${isTg ? "Telegram" : "WhatsApp"}</span><span class="ui-qrow-sub">${sub}</span></span>
      ${btn}
    </div>`;
  };

  return `<section class="ui-stack">
    <header class="ui-top">
      <div class="ui-top-text"><span class="ui-sub">${greetingText()}</span><span class="ui-brand">ahmedov.proxy</span></div>
      <button class="ui-iconbtn" data-action="toggle-theme" aria-label="${isDark ? "Светлая тема" : "Тёмная тема"}">${uiIcon(isDark ? "sun" : "moon", 20)}</button>
      <button class="ui-iconbtn accent" data-action="open-tab" data-tab="account" aria-label="Аккаунт">${uiIcon("userFill", 20)}</button>
    </header>

    <article class="ui-hero ${soon ? "warn" : ""}">
      <div class="ui-hero-top">
        <span class="ui-hero-chip"><i></i>${soon ? "Скоро закончится" : "Подписка активна"}</span>
        <span class="ui-hero-phone">${esc(phone)}</span>
      </div>
      <div class="ui-hero-bottom">
        <div>
          <div class="ui-hero-num">${days}</div>
          <div class="ui-hero-cap">${ruPlural(days, "день", "дня", "дней")} осталось</div>
          ${expires ? `<div class="ui-hero-cap" style="opacity:.8;font-size:14px;">до ${esc(expires)}</div>` : ""}
        </div>
        <button class="ui-hero-btn" data-action="extend-subscription" data-plan-id="301">Продлить</button>
      </div>
    </article>

    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Подключиться в один тап</h2><button class="ui-link" data-action="open-tab" data-tab="telegram">Все</button></div>
      <div class="ui-card ui-list">${quickRow("telegram")}${quickRow("whatsapp")}</div>
    </section>

    <div class="ui-grid2">
      <button class="ui-card ui-tile" data-action="open-tab" data-tab="telegram">
        <span class="ui-tile-label">Серверы</span>
        <span class="ui-tile-value">${!all.length || (stillChecking && !online) ? `<small>Проверяем…</small>` : `${online} <small>из ${all.length} в сети</small>`}</span>
        <span class="ui-bar" aria-hidden="true"><span style="width:${stillChecking && !online ? 0 : pct}%"></span></span>
      </button>
      <button class="ui-card ui-tile" data-action="extend-subscription" data-plan-id="301">
        <span class="ui-tile-label">Тариф</span>
        <span class="ui-tile-value">${esc(s.type || "—")}</span>
        <span class="ui-sub" style="font-size:13px;">Telegram + WhatsApp</span>
      </button>
    </div>

    <article class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;flex-direction:column;gap:2px;">
        <strong style="font-size:17px;">Поддержка</strong>
        <span class="ui-sub" style="font-size:14px;">Поможем подключиться — напишите в удобный мессенджер.</span>
      </div>
      ${contactButtons()}
    </article>
  </section>`;
}

function serversScreen(network) {
  const isTg = network === "telegram";
  const filter = state.serverFilter === "ok" ? "ok" : "all";
  const items = sortClientProxies(state.proxies[network] || []);
  const best = pickBestProxy(items);
  const bestKey = best ? proxyKeyOf(best) : "";
  let rows = items.filter((p) => proxyKeyOf(p) !== bestKey);
  if (filter === "ok") rows = rows.filter((p) => p.isReachable || p.isChecking);
  const okCount = items.filter((p) => p.isReachable).length;

  const serverRow = (p) => {
    const parts = splitProxyName(p.name);
    const st = proxyStatus(p);
    return `<button class="ui-server" data-action="open-proxy-connect" data-connect-url="${esc(p.connectUrl)}" data-network="${esc(network)}" data-proxy-key="${esc(proxyKeyOf(p))}">
      <span class="ui-cc">${esc(parts.cc || (isTg ? "TG" : "WA"))}</span>
      <span class="ui-server-main">
        <span class="ui-server-text"><span class="ui-server-name">${esc(parts.name)}</span><span class="ui-server-host">${esc(p.host)}:${esc(p.port)}</span></span>
        <span class="ui-ping ${st.cls}">${esc(st.text)}</span>
      </span>
    </button>`;
  };

  let bestCard = "";
  if (best) {
    const parts = splitProxyName(best.name);
    const st = proxyStatus(best);
    const ms = Number(best.ping);
    bestCard = `<button class="ui-card ui-best" data-action="open-proxy-connect" data-connect-url="${esc(best.connectUrl)}" data-network="${esc(network)}" data-proxy-key="${esc(bestKey)}">
      <span class="ui-best-head"><span class="ui-kicker">${best.isRecommended ? "Рекомендуем" : "Лучший сейчас"}</span>${best.isRecommended ? `<span class="ui-badge">by ahmedov</span>` : ""}</span>
      <span class="ui-best-body">
        <span class="ui-cc">${esc(parts.cc || (isTg ? "TG" : "WA"))}</span>
        <span class="ui-server-text"><span class="ui-best-name">${esc(parts.name)}</span><span class="ui-server-host">${esc(best.host)}:${esc(best.port)}</span></span>
        ${st.cls === "ok" && Number.isFinite(ms) && ms > 0 ? `<span class="ui-best-ms"><b>${Math.round(ms)}</b><span>мс</span></span>` : `<span class="ui-ping ${st.cls}">${esc(st.text)}</span>`}
      </span>
    </button>`;
  }

  const listHtml = state.loadingProxyTab && !items.length
    ? Array.from({ length: 5 }).map(() => `<div class="ui-skel"></div>`).join("")
    : rows.length
      ? `<div class="ui-card ui-servers">${rows.map(serverRow).join("")}</div>`
      : !best ? `<div class="ui-card ui-empty">Серверов пока нет. Загляните чуть позже или напишите в поддержку.</div>` : "";

  return `<section class="ui-stack">
    <h1 class="ui-h1">Серверы</h1>
    <div class="ui-seg" role="tablist" aria-label="Мессенджер">
      <button class="${isTg ? "on" : ""}" role="tab" aria-selected="${isTg}" data-action="open-tab" data-tab="telegram"><span class="ui-seg-ico tg">${uiIcon("tg", 12)}</span>Telegram</button>
      <button class="${!isTg ? "on" : ""}" role="tab" aria-selected="${!isTg}" data-action="open-tab" data-tab="whatsapp"><span class="ui-seg-ico wa">${uiIcon("wa", 12, 2.8)}</span>WhatsApp</button>
    </div>
    <div class="ui-chips">
      <button class="ui-chip ${filter === "all" ? "on" : ""}" data-action="server-filter" data-filter="all">Все · ${items.length}</button>
      <button class="ui-chip ${filter === "ok" ? "on" : ""}" data-action="server-filter" data-filter="ok">Работают · ${okCount}</button>
      <button class="ui-chip" data-action="refresh-proxies" data-network="${esc(network)}" aria-label="Проверить заново" style="display:inline-flex;align-items:center;gap:6px;">${uiIcon("refresh", 15, 2.2)}Обновить</button>
    </div>
    ${bestCard}
    ${listHtml}
    <p class="ui-caption" style="margin:0;">Нажмите на сервер, чтобы подключиться. Пинг — оценка с вашего телефона: даже без зелёной метки прокси может работать.</p>
  </section>`;
}

function accountScreen() {
  const phone = displayPhone(state.user?.phone || "");
  const s = state.subscription || {};
  const days = Math.max(0, Number(s.daysLeft) || 0);
  const choice = themeChoice();
  const themes = [["auto", "Авто"], ["light", "Светлая"], ["dark", "Тёмная"]];
  const supportRow = (href, color, icon, label) => `<a class="ui-row" href="${href}" target="_blank" rel="noopener">
      <span class="ui-row-icon" style="background:${color}">${uiIcon(icon, 17, 2.1)}</span>
      <span class="ui-row-main"><span class="ui-row-label">${label}</span><span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span></span>
    </a>`;

  return `<section class="ui-stack">
    <h1 class="ui-h1">Аккаунт</h1>

    <div class="ui-card ui-profile">
      <span class="ui-avatar">${uiIcon("userFill", 28)}</span>
      <span class="ui-profile-text">
        <span class="ui-profile-phone">${esc(phone)}</span>
        <span class="ui-profile-sub">Подписка до ${esc(formatDateOnly(s.expiresAt))}</span>
      </span>
    </div>

    <div class="ui-sec" style="gap:8px;">
      <span class="ui-label">Оформление</span>
      <div class="ui-themes" role="radiogroup" aria-label="Тема">
        ${themes.map(([id, label]) => `<button class="ui-theme ${choice === id ? "on" : ""}" role="radio" aria-checked="${choice === id}" data-action="set-theme" data-theme="${id}">
          <span class="ui-theme-prev ${id}" aria-hidden="true"><i></i><i></i></span>${label}
        </button>`).join("")}
      </div>
    </div>

    <div class="ui-sec" style="gap:8px;">
      <span class="ui-label">Подписка</span>
      <div class="ui-card ui-group">
        <div class="ui-row"><span class="ui-row-main"><span class="ui-row-label">Статус</span><span class="ui-row-value ${days <= 7 ? "orange" : "green"}">${days <= 7 ? "Скоро закончится" : "Активна"}</span></span></div>
        <div class="ui-row"><span class="ui-row-main"><span class="ui-row-label">Тариф</span><span class="ui-row-value">${esc(s.type || "—")}</span></span></div>
        <div class="ui-row"><span class="ui-row-main"><span class="ui-row-label">Осталось</span><span class="ui-row-value">${days} ${ruPlural(days, "день", "дня", "дней")}</span></span></div>
        <button class="ui-row" data-action="extend-subscription" data-plan-id="301"><span class="ui-row-main"><span class="ui-row-label" style="color:var(--ui-accent-text);font-weight:600;">Продлить подписку</span><span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span></span></button>
      </div>
    </div>

    <div class="ui-sec" style="gap:8px;">
      <span class="ui-label">Поддержка</span>
      <div class="ui-card ui-group">
        ${supportRow(SUPPORT_LINKS.telegram, "#2AABEE", "tg", "Написать в Telegram")}
        ${supportRow(SUPPORT_LINKS.whatsapp, "#25D366", "wa", "Написать в WhatsApp")}
        ${supportRow(SUPPORT_LINKS.max, "#8E6CF0", "chat", "Написать в MAX")}
        <button class="ui-row" data-action="open-legal" data-legal-type="agreement">
          <span class="ui-row-icon" style="background:#8E8E93">${uiIcon("doc", 17, 2.1)}</span>
          <span class="ui-row-main"><span class="ui-row-label">Пользовательское соглашение</span><span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span></span>
        </button>
      </div>
    </div>

    <button class="ui-logout" data-action="logout">Выйти из аккаунта</button>
  </section>`;
}

function authScreen() {
  const invite = state.authStep === "invite";
  if (invite) {
    return `<section class="ui-auth">
      <button class="ui-iconbtn ui-back" data-action="back-phone" aria-label="Назад">${uiIcon("back", 20, 2.3)}</button>
      <div style="margin-top:26px;display:flex;flex-direction:column;gap:10px;">
        <span class="ui-lock">${uiIcon("lock", 28)}</span>
        <h1 class="ui-auth-title" style="margin-top:6px;">Код доступа</h1>
        <p class="ui-auth-text" style="font-size:16px;">8 цифр — приходят после оплаты или их выдаёт администратор.</p>
        <span class="ui-phone-chip">${esc(displayPhone(state.pendingPhone))}<button data-action="back-phone">Изменить</button></span>
      </div>
      <div class="ui-form" style="margin-top:26px;">
        <label class="ui-label" for="invite-code">Код доступа</label>
        <div class="ui-field code"><input id="invite-code" type="tel" inputmode="numeric" autocomplete="one-time-code" placeholder="00000000" maxlength="8" value="${esc(state.inviteInput)}" data-input="invite-input" /></div>
        <div class="ui-hint">${esc(state.hint && state.hint !== "Введите одноразовый invite-код." ? state.hint : "")}</div>
        <button class="ui-btn" data-action="submit-auth" ${state.loadingAuth ? "disabled" : ""}>${state.loadingAuth ? "Проверяем…" : "Войти"}</button>
      </div>
      <div class="ui-auth-foot" style="align-items:stretch;">
        <div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;text-align:left;">
          <strong style="font-size:15px;">Не знаете код?</strong>
          <span class="ui-sub" style="font-size:14px;margin-top:-4px;">Напишите нам свой номер — пришлём код.</span>
          ${contactButtons()}
        </div>
      </div>
    </section>`;
  }

  return `<section class="ui-auth">
    <div class="ui-auth-hero">
      <span class="ui-logo">${uiIcon("shield", 46, 1.7)}</span>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <h1 class="ui-auth-title">ahmedov.proxy</h1>
        <p class="ui-auth-text">Telegram и WhatsApp работают<br>без блокировок и без VPN</p>
      </div>
      <div class="ui-auth-pills">
        <span class="ui-auth-pill"><span class="ui-seg-ico tg">${uiIcon("tg", 11)}</span>Telegram</span>
        <span class="ui-auth-pill"><span class="ui-seg-ico wa">${uiIcon("wa", 11, 2.8)}</span>WhatsApp</span>
      </div>
    </div>
    <div class="ui-form">
      <label class="ui-label" for="auth-phone">Номер телефона</label>
      <div class="ui-field"><span class="ui-field-prefix">+7</span><input id="auth-phone" type="tel" inputmode="numeric" autocomplete="tel-national" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="900 123 45 67" value="${esc(state.phoneInput)}" data-input="phone-input" /></div>
      <div class="ui-hint">${esc(state.hint || "")}</div>
      <button class="ui-btn" data-action="submit-auth" ${state.loadingAuth ? "disabled" : ""}>${state.loadingAuth ? "Проверяем…" : "Продолжить"}</button>
    </div>
    <div class="ui-auth-foot">
      <span class="ui-sub" style="font-size:15px;">Нет подписки? Напишите нам</span>
      <div style="width:100%;">${contactButtons()}</div>
      <p class="ui-legal-note" style="margin:4px 0 0;">Продолжая, вы принимаете <button type="button" data-action="open-legal" data-legal-type="agreement">Пользовательское соглашение</button></p>
    </div>
  </section>`;
}

function bottomBar() {
  const t = state.activeTab;
  const onServers = t === "telegram" || t === "whatsapp";
  const net = state.lastNetwork === "whatsapp" ? "whatsapp" : "telegram";
  return `<nav class="ui-tabbar" role="tablist" aria-label="Главная навигация">
    <button class="ui-tab ${t === "home" ? "active" : ""}" role="tab" aria-selected="${t === "home"}" data-action="open-tab" data-tab="home">${uiIcon(t === "home" ? "homeFill" : "home")}Главная</button>
    <button class="ui-tab ${onServers ? "active" : ""}" role="tab" aria-selected="${onServers}" data-action="open-tab" data-tab="${net}">${uiIcon(onServers ? "serversFill" : "servers")}Серверы</button>
    <button class="ui-tab ${t === "account" ? "active" : ""}" role="tab" aria-selected="${t === "account"}" data-action="open-tab" data-tab="account">${uiIcon(t === "account" ? "userFill" : "user")}Аккаунт</button>
  </nav>`;
}

function proxyConnectModal(connectUrl, network) {
  if (!connectUrl) return "";
  const isTg = network === "telegram";
  const key = state.proxyConnectModal?.proxyKey || "";
  const proxy = (state.proxies[network] || []).find((p) => proxyKeyOf(p) === key) || null;
  const parts = splitProxyName(proxy?.name || (isTg ? "Telegram прокси" : "WhatsApp прокси"));
  const st = proxyStatus(proxy);

  let waUrl = connectUrl;
  let waBusinessUrl = connectUrl;
  if (!isTg && (connectUrl.startsWith("http://") || connectUrl.startsWith("https://"))) {
    try {
      const url = new URL(connectUrl);
      const queryString = url.search;
      const params = url.searchParams;
      if (params.get("phone")) {
        const phone = params.get("phone");
        const text = params.get("text");
        waUrl = `https://wa.me/${phone}${text ? "?text=" + encodeURIComponent(text) : ""}`;
        waBusinessUrl = `whatsapp-smb://proxy${text ? "?text=" + encodeURIComponent(text) : ""}`;
      } else if (queryString) {
        waUrl = `https://wa.me/proxy${queryString}`;
        waBusinessUrl = `whatsapp-smb://proxy${queryString}`;
      }
    } catch (e) {
      // используем ссылку как есть
    }
  }

  const buttons = isTg
    ? `<a class="ui-btn tg" href="${esc(connectUrl)}" target="_blank" rel="noopener">${uiIcon("tg", 20)}Подключить в Telegram</a>`
    : `<a class="ui-btn wa" href="${esc(waUrl)}" target="_blank" rel="noopener">${uiIcon("wa", 20, 2.2)}Подключить в WhatsApp</a>
       <a class="ui-btn ghost" href="${esc(waBusinessUrl)}" target="_blank" rel="noopener">WhatsApp Business (iPhone)</a>`;

  return `<div class="ui-layer" data-action="close-proxy-connect">
    <article class="ui-sheet" data-action="proxy-connect-card" role="dialog" aria-label="Подключение к серверу">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head">
        <button class="ui-sheet-close" data-action="close-proxy-connect" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <span class="ui-sheet-icon ${isTg ? "tg" : "wa"}">${uiIcon(isTg ? "tg" : "wa", 38, 2)}</span>
        <h2 class="ui-sheet-title">${esc(parts.name)}</h2>
        <span class="ui-tags">
          ${proxy ? `<span class="ui-tag ${st.cls}"><span class="ui-dot ${st.cls}"></span>${st.cls === "ok" ? "Работает" : st.cls === "slow" ? "Нестабильно" : st.cls === "checking" ? "Проверяем" : "Нет ответа"}${st.cls === "ok" || st.cls === "slow" ? ` · ${esc(st.text)}` : ""}</span>` : ""}
          <span class="ui-tag">${isTg ? "MTProto" : "SOCKS5"}</span>
        </span>
      </div>
      ${buttons}
      <button class="ui-btn ghost" data-action="copy-proxy-link" data-url="${esc(connectUrl)}">${uiIcon(state.proxyConnectModal?.copied ? "check" : "copy", 18)}${state.proxyConnectModal?.copied ? "Скопировано" : "Скопировать ссылку"}</button>
      <div class="ui-qr-box">
        <div class="ui-qr" id="proxy-connect-qr-container" role="img" aria-label="QR-код ссылки на прокси"></div>
        <span class="ui-qr-text"><b>На другом устройстве</b><span>Наведите камеру телефона на код — ${isTg ? "Telegram" : "WhatsApp"} предложит подключить прокси.</span></span>
      </div>
      ${proxy ? `<div class="ui-sheet-foot"><span>${esc(proxy.host)}</span><span>порт ${esc(proxy.port)}</span></div>` : ""}
    </article>
  </div>`;
}

function legalModal() {
  const modal = state.paymentPage.legalModal;
  if (!modal.open || !modal.type) return "";
  const documentData = LEGAL_DOCUMENTS[modal.type] || null;
  if (!documentData) return "";
  return `<div class="ui-layer" data-action="close-legal">
    <article class="ui-sheet" data-action="legal-card" role="dialog" aria-label="${esc(documentData.title)}">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head" style="align-items:flex-start;text-align:left;padding-right:40px;">
        <button class="ui-sheet-close" data-action="close-legal" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <h2 class="ui-sheet-title" style="font-size:21px;line-height:27px;">${esc(documentData.title)}</h2>
      </div>
      <div class="ui-legal-body">${documentData.body}</div>
      <button class="ui-btn ghost" data-action="close-legal">Закрыть</button>
    </article>
  </div>`;
}

function paymentScreen() {
  const p = state.paymentPage;
  const planOptions = p.plans || [];
  const selectedPlan = planOptions.find((plan) => Number(plan.id) === Number(p.selectedPlanId)) || planOptions[0] || null;
  const waitingMode = !!p.payment?.token;
  const fulfilled = !!p.fulfillment;
  const amountLabel = p.payment?.amount
    ? `${p.payment.amount} ₽`
    : p.promoData ? (p.promoData.priceLabel || `${p.promoData.amount} ₽`) : selectedPlan?.price || "";

  const top = `<div style="display:flex;align-items:center;gap:12px;">
      <span class="ui-logo" style="width:44px;height:44px;border-radius:14px;box-shadow:none;">${uiIcon("shield", 24, 1.8)}</span>
      <div style="display:flex;flex-direction:column;"><strong style="font-size:17px;">ahmedov.proxy</strong><span class="ui-sub" style="font-size:13px;">Оплата подписки</span></div>
    </div>`;

  let body = "";
  if (fulfilled) {
    body = `<article class="ui-card ui-amount">
        <span class="ui-status-chip ok">${uiIcon("check", 15, 3)}Оплата подтверждена</span>
        <span class="ui-sub" style="font-size:15px;margin-top:6px;">Ваш код доступа</span>
        <span class="ui-invite-code">${esc(p.fulfillment.inviteCode || "—")}</span>
      </article>
      <div class="ui-card ui-kv">
        <div><span>Номер</span><b>${esc(p.fulfillment.user?.displayPhone || displayPhone(p.fulfillment.user?.phone || ""))}</b></div>
        <div><span>Тариф</span><b>${esc(p.fulfillment.subscription?.type || selectedPlan?.name || "-")}</b></div>
      </div>
      <p class="ui-caption" style="margin:0;">Код подставится сам, когда вы откроете приложение. Сохраните его на всякий случай.</p>
      <button class="ui-btn" data-action="go-app-home" data-invite="${esc(p.fulfillment.inviteCode || "")}" data-phone="${esc(p.fulfillment.user?.phone || "")}">Открыть приложение</button>`;
  } else if (waitingMode) {
    body = `<article class="ui-card ui-amount">
        <span class="ui-status-chip"><span class="ui-spin"></span>Ждём оплату</span>
        <span class="ui-amount-num" style="margin-top:6px;">${esc(amountLabel)}</span>
        <span class="ui-sub" style="font-size:15px;">${esc(selectedPlan?.name || "")} · ${esc(displayPhone(normalizePhone(p.phoneInput)))}</span>
      </article>
      <button class="ui-btn" data-action="open-payment-link" data-href="${esc(p.payment?.qrUrl || "")}">${uiIcon("bank", 20, 2.1)}Открыть страницу оплаты СБП</button>
      <p class="ui-caption" style="margin:0;text-align:center;">${p.checking ? "Проверяем статус оплаты…" : "После оплаты вернитесь сюда — статус обновится сам."}</p>
      <button class="ui-text-btn red" data-action="cancel-waiting-payment" data-token="${esc(p.payment?.token || "")}">Отменить платёж</button>`;
  } else {
    body = `<div class="ui-form" style="margin-top:0;">
        <label class="ui-label" for="pay-phone">Номер телефона</label>
        <div class="ui-field"><span class="ui-field-prefix">+7</span><input id="pay-phone" type="tel" inputmode="numeric" autocomplete="tel-national" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="900 123 45 67" value="${esc(p.phoneInput)}" data-input="payment-phone" /></div>
      </div>
      ${p.pendingPayment ? `<div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
          <strong>Есть незавершённый платёж · ${esc(`${p.pendingPayment.amount || 0} ₽`)}</strong>
          <span class="ui-sub" style="font-size:14px;">${esc(p.pendingNote)}</span>
          <button class="ui-btn" style="height:50px;" data-action="continue-pending-payment">Продолжить платёж</button>
          <button class="ui-text-btn red" data-action="cancel-pending-payment">Отменить</button>
        </div>` : ""}
      ${!p.promoData ? `<div class="ui-sec" style="gap:8px;"><span class="ui-label">Тариф</span>${planCards(planOptions, selectedPlan?.id)}</div>` : ""}
      <div class="ui-card ui-promo">
        <span class="ui-sub" style="display:flex;">${uiIcon("tag", 20)}</span>
        <label for="pay-promo" style="position:absolute;left:-9999px;">Промокод</label>
        <input id="pay-promo" placeholder="Промокод" value="${esc(p.promoCode || "")}" data-input="payment-promo" />
        <button class="ui-btn-sm soft" data-action="payment-check-promo">${p.promoChecking ? "Проверяем…" : "Применить"}</button>
      </div>
      ${p.promoData ? `<div class="ui-msg ok">Промокод ${esc(p.promoData.code)} применён · ${esc(p.promoData.priceLabel || `${p.promoData.amount || 0} ₽`)}${p.promoData.name ? " · " + esc(p.promoData.name) : ""}</div>` : ""}
      ${!p.promoData && p.promoMessage ? `<div class="ui-msg err">${esc(p.promoMessage)}</div>` : ""}
      ${selectedPlan ? `<div class="ui-card ui-kv">
          <div><span>Тариф</span><b>${esc(p.promoData?.name || selectedPlan.name)}</b></div>
          <div><span>К оплате</span><b style="font-size:18px;">${esc(amountLabel)}</b></div>
        </div>` : ""}
      ${SHOW_SBP_BUTTON && p.paymentEnabled ? `<button class="ui-btn" data-action="payment-create" ${p.creating ? "disabled" : ""}>${uiIcon("bank", 20, 2.1)}${p.creating ? "Создаём платёж…" : `Оплатить ${esc(amountLabel)} через СБП`}</button>` : ""}
      <div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
        <strong style="font-size:16px;">${SHOW_SBP_BUTTON && p.paymentEnabled ? "Или оформим вручную" : "Для оплаты напишите нам"}</strong>
        <span class="ui-sub" style="font-size:14px;margin-top:-4px;">Пришлите номер телефона и выбранный тариф — оформим подписку.</span>
        ${contactButtons()}
      </div>
      <p class="ui-legal-note" style="margin:0;">Продолжая, вы соглашаетесь с <button type="button" data-action="open-legal" data-legal-type="offer">офертой</button>, <button type="button" data-action="open-legal" data-legal-type="privacy">политикой конфиденциальности</button> и <button type="button" data-action="open-legal" data-legal-type="agreement">пользовательским соглашением</button>.</p>`;
  }

  return `<section class="ui-stack">
    ${top}
    <h1 class="ui-h1" style="padding:0;">${fulfilled ? "Готово!" : waitingMode ? "Оплата" : "Подписка"}</h1>
    ${p.error ? `<div class="ui-msg err">${esc(p.error)}</div>` : ""}
    ${p.message && !fulfilled ? `<div class="ui-msg info">${esc(p.message)}</div>` : ""}
    ${body}
  </section>`;
}

function plansOverlay() {
  if (!state.plansOverlay.open) return "";
  const plans = state.plansOverlay.plans || [];
  const selectedPlanId = state.plansOverlay.selectedPlanId ?? plans?.[0]?.id ?? null;
  const selectedPlan = plans.find((x) => Number(x.id) === Number(selectedPlanId)) || plans[0] || null;
  const payment = state.plansOverlay.payment;
  const paymentEnabled = !!state.plansOverlay.paymentEnabled;
  const waitingMode = !!payment?.token;
  const paid = payment?.status === "paid";

  return `<div class="ui-layer" data-action="close-overlay">
    <article class="ui-sheet overlay-card" role="dialog" aria-label="Подписка не активна">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head" style="align-items:flex-start;text-align:left;padding-right:40px;">
        <button class="ui-sheet-close" data-action="close-overlay" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <h2 class="ui-sheet-title">Подписка не активна</h2>
        <span class="ui-sub" style="font-size:15px;">${esc(state.plansOverlay.message || "Выберите тариф, чтобы продолжить.")}</span>
      </div>
      ${!waitingMode ? planCards(plans, selectedPlan?.id) : ""}
      ${state.plansOverlay.paymentError ? `<div class="ui-msg err">${esc(state.plansOverlay.paymentError)}</div>` : ""}
      ${payment?.qrUrl
      ? `<div class="ui-card ui-amount" style="padding:18px;">
            <span class="ui-status-chip ${paid ? "ok" : ""}">${paid ? uiIcon("check", 15, 3) : `<span class="ui-spin"></span>`}${paid ? "Оплата подтверждена" : "Ждём оплату"}</span>
            <span class="ui-amount-num" style="font-size:40px;line-height:46px;">${esc(payment.amount)} ₽</span>
            <span class="ui-sub" style="font-size:14px;">${paid ? "Доступ активируется после проверки." : state.plansOverlay.statusLoading ? "Проверяем статус оплаты…" : "После оплаты вернитесь сюда — статус обновится сам."}</span>
          </div>`
      : `<button class="ui-btn overlay-pay" data-action="start-payment" ${!paymentEnabled || !selectedPlan ? "disabled" : ""}>${uiIcon("bank", 20, 2.1)}${state.plansOverlay.paymentLoading ? "Создаём платёж…" : `Оплатить${selectedPlan ? " " + esc(selectedPlan.price) : ""} через СБП`}</button>`}
      ${!paymentEnabled ? `<div class="ui-msg info">Оплата картой пока недоступна — напишите нам, оформим вручную.</div>` : ""}
      ${contactButtons()}
    </article>
  </div>`;
}

function render() {
  const active = document.activeElement;
  const activeInputKey = active?.dataset?.input || "";
  const activeSelectionStart = typeof active?.selectionStart === "number" ? active.selectionStart : null;
  const activeSelectionEnd = typeof active?.selectionEnd === "number" ? active.selectionEnd : null;

  let body = "";
  if (isPaymentRoute()) {
    body = paymentScreen();
  } else if (state.pwaBlocked) {
    body = pwaBlockedScreen();
  } else if (state.booting) {
    body = `<div class="ui-stack">${Array.from({ length: 4 })
      .map(() => `<div class="ui-skel" style="height:96px;"></div>`)
      .join("")}</div>`;
  } else if (!state.token || !state.user || (state.role !== "admin" && !state.subscription)) {
    body = authScreen();
  } else if (state.role === "admin") {
    body = adminScreen();
  } else {
    if (state.activeTab === "home") {
      body = homeScreen();
      body += bottomBar();
    } else if (state.activeTab === "account") {
      body = accountScreen();
      body += bottomBar();
    } else if (state.activeTab === "vpn") {
      body = vpnTabScreen();
      body += bottomBar();
    } else if (state.activeTab === "free-vpn") {
      body = freeVpnScreen();
    } else {
      body = serversScreen(state.activeTab);
      body += bottomBar();
    }
  }

  const uiMode = isClientUiScreen();
  document.documentElement.classList.toggle("ui-mode", uiMode);
  app.classList.toggle("ui", uiMode);

  app.innerHTML = body + legalModal() + installGuideModal() + (isPaymentRoute() ? "" : plansOverlay()) + (state.vpn.qrModal.open ? vpnQrModal(state.vpn.qrModal.raw) : "") + (state.proxyConnectModal?.open ? proxyConnectModal(state.proxyConnectModal.connectUrl, state.proxyConnectModal.network) : "");

  // Генерация QR-кода после рендера
  if (state.vpn.qrModal.open && state.vpn.qrModal.raw) {
    requestAnimationFrame(() => {
      const container = document.getElementById("vpn-qr-container");
      if (container && typeof QRCode !== "undefined") {
        container.innerHTML = "";
        new QRCode(container, {
          text: state.vpn.qrModal.raw,
          width: 220,
          height: 220,
          colorDark: "#ffffff",
          colorLight: "#1a1a2e",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    });
  }

  // Генерация QR-кода для прокси
  if (state.proxyConnectModal?.open && state.proxyConnectModal.connectUrl) {
    requestAnimationFrame(() => {
      const container = document.getElementById("proxy-connect-qr-container");
      if (container && typeof QRCode !== "undefined") {
        container.innerHTML = "";
        new QRCode(container, {
          text: state.proxyConnectModal.connectUrl,
          width: 208,
          height: 208,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    });
  }

  if (activeInputKey) {
    const next = app.querySelector(`[data-input="${activeInputKey}"]`);
    if (next) {
      next.focus();
      if (typeof next.setSelectionRange === "function") {
        if (activeSelectionStart !== null && activeSelectionEnd !== null) {
          next.setSelectionRange(activeSelectionStart, activeSelectionEnd);
        }
      }
    }
  }

  // After DOM is updated, position floating best badge if present
  requestAnimationFrame(() => {
    try {
      const section = document.querySelector('section.stack[data-best-key]');
      const badge = document.querySelector('.floating-best-badge');
      if (!section || !badge) return;
      const bestKey = section.getAttribute('data-best-key');
      const tone = section.getAttribute('data-best-tone') || '';
      badge.classList.remove('tg', 'wa');
      if (tone) badge.classList.add(tone);

      const card = section.querySelector(`[data-proxy-key="${bestKey}"]`);
      if (!card) {
        badge.style.display = '';
        return;
      }

      const cardRect = card.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      const offsetTop = cardRect.top - sectionRect.top;
      const offsetRight = sectionRect.right - cardRect.right;

      badge.style.position = 'absolute';
      badge.style.top = Math.max(6, offsetTop + 6) + 'px';
      badge.style.right = Math.max(12, offsetRight + 12) + 'px';
      badge.style.display = '';

      badge.classList.remove('animate');
      void badge.offsetWidth;
      badge.classList.add('animate');

      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 8000);
    } catch (e) {
      console.warn('Badge positioning failed', e);
    }
  });
}

async function bootstrap() {
  if (isStandaloneMode() && isLandingRoute() && !isPaymentRoute()) {
    location.replace(appPath());
    return;
  }

  if (isPaymentRoute()) {
    setState({ booting: false, pwaBlocked: false });
    await loadPaymentPage();
    return;
  }

  const blocked = shouldBlockBrowserMode();
  if (blocked) {
    setState({ pwaBlocked: true, booting: false });
    return;
  }

  if (!state.token) {
    // Try auto-login from URL parameters
    const autoLoginSuccess = await tryAutoLoginFromUrl();
    if (autoLoginSuccess) {
      // Reload to apply new state
      location.reload();
      return;
    }

    setState({ booting: false });
    await restorePendingPaymentOverlay();
    return;
  }
  try {
    const payload = await api.me(state.token);
    if ((payload.role || "user") !== "admin" && !subscriptionIsActive(payload.subscription)) {
      await handleExpiredSubscription("Подписка закончилась. Оплатите доступ.");
      return;
    }
    setState({
      role: payload.role || "user",
      user: payload.user || null,
      subscription: payload.subscription || null,
      booting: false,
    });
    if (payload.role === "admin") {
      stopSessionHeartbeat();
      await loadAdminAll();
    } else if (["telegram", "whatsapp"].includes(state.activeTab)) {
      startSessionHeartbeat();
      await loadUserProxies(state.activeTab);
    } else if (state.activeTab === "vpn") {
      startSessionHeartbeat();
      state.vpn.initialized = true;
      loadVpnServers(state.vpn.selectedSource);
    } else {
      startSessionHeartbeat();
      ensureHomeProxies();
    }
  } catch (e) {
    if (e?.status === 401) {
      await handleExpiredSubscription(e.message || "Подписка закончилась. Оплатите доступ.");
      return;
    }
    logout();
  }
}

async function loadUserProxies(tab) {
  if (!state.token) return;
  userProxyRunIds[tab] = (userProxyRunIds[tab] || 0) + 1;
  const runId = userProxyRunIds[tab];
  setState({ loadingProxyTab: true });
  try {
    const initial = await api.proxies(state.token, tab);
    if (userProxyRunIds[tab] !== runId) return;

    const initialItems = initial.proxies || [];
    const previous = new Map((state.proxies[tab] || []).filter((x) => x.lastCheckedAt).map((x) => [`${x.host}:${x.port}`, x]));
    const pending = markProxiesPending(initialItems).map((item) => {
      const prev = previous.get(`${item.host}:${item.port}`);
      return prev ? { ...item, ping: prev.ping, isReachable: prev.isReachable, isUnstable: prev.isUnstable, lastCheckedAt: prev.lastCheckedAt } : item;
    });
    setState({ proxies: { ...state.proxies, [tab]: pending } });
    void runUserClientPing(tab, runId, pending);
  } catch (e) {
    if (userProxyRunIds[tab] !== runId) return;
    if (e?.status === 401) {
      await handleExpiredSubscription(e.message || "Подписка закончилась. Оплатите доступ.");
      return;
    }
  } finally {
    if (userProxyRunIds[tab] === runId) {
      setState({ loadingProxyTab: false });
    }
  }
}

async function loadAdminAll() {
  if (!state.token) return;
  const runId = ++adminProxyRunId;
  setAdmin({ loading: true });
  try {
    const [u, p, pc] = await Promise.all([api.adminUsers(state.token), api.adminProxies(state.token, "all"), api.adminPromoCodes(state.token)]);
    if (adminProxyRunId !== runId) return;

    const proxyItems = p.proxies || [];
    const pending = markProxiesPending(proxyItems);
    setAdmin({ users: u.users || [], proxies: pending, promoCodes: pc.promoCodes || [], loading: false });
    void runAdminClientPing(runId, pending);
  } catch (e) {
    if (adminProxyRunId !== runId) return;
    setAdmin({ message: e.message || "Не удалось загрузить админ-данные.", loading: false });
  }
}

async function refreshAdminProxies() {
  const runId = ++adminProxyRunId;
  const network = state.admin.proxyFilter;
  setAdmin({ loading: true });
  try {
    const initial = await api.adminProxies(state.token, network);
    if (adminProxyRunId !== runId) return;

    const initialItems = initial.proxies || [];
    const pending = markProxiesPending(initialItems);
    setAdmin({ proxies: pending, loading: false });
    void runAdminClientPing(runId, pending);
  } catch (e) {
    if (adminProxyRunId !== runId) return;
    setAdmin({ message: e.message || "Не удалось обновить список прокси.", loading: false });
  }
}

function logout(options = {}) {
  stopSessionHeartbeat();
  stopPaymentStatusPolling();
  authFlowId += 1;
  Object.keys(localStorage)
    .filter((k) => k.includes("ahmedov_proxy"))
    .forEach((k) => localStorage.removeItem(k));
  state.booting = false;
  state.token = "";
  state.role = "user";
  state.user = null;
  state.subscription = null;
  state.activeTab = "home";
  state.phoneInput = "";
  state.pendingPhone = "";
  state.inviteInput = "";
  state.authStep = "phone";
  state.hint = options.hint || "";
  state.installGuideOpen = false;
  state.plansOverlay = options.plansOverlay || { open: false, message: "", plans: [], supportUrl: "#", banks: [], paymentEnabled: false, selectedPlanId: null, selectedBankId: "sber", payment: null, paymentError: "", paymentLoading: false, statusLoading: false };
  state.proxies = { telegram: [], whatsapp: [] };
  render();
}

async function submitAuth() {
  const flow = ++authFlowId;
  if (state.authStep === "phone") {
    const phone = normalizePhone(state.phoneInput);
    if (!phone) {
      setState({ hint: "Введите корректный номер телефона." });
      return;
    }
    setState({ loadingAuth: true });
    try {
      const payload = await api.loginByPhone(phone);
      if (flow !== authFlowId) return;
      if (payload.status === "inactive") {
        setState({ hint: "Для этого номера подписка не найдена.", loadingAuth: false });
        openPaymentPage({ phone, message: payload.message || "Подписка не активна." });
        return;
      }
      if (payload.status === "invite_required") {
        setState({
          authStep: "invite",
          pendingPhone: phone,
          inviteInput: "",
          hint: payload.inviteAvailable ? "" : "Для этого номера пока нет кода — напишите нам, пришлём.",
          loadingAuth: false,
        });
        return;
      }
      localStorage.setItem(TOKEN_KEY, payload.token);
      setState({
        token: payload.token,
        role: payload.role || "user",
        user: payload.user,
        subscription: payload.subscription || null,
        loadingAuth: false,
      });
      if ((payload.role || "user") === "admin") {
        stopSessionHeartbeat();
        await loadAdminAll();
      } else {
        startSessionHeartbeat();
        ensureHomeProxies();
      }
    } catch (e) {
      if (flow !== authFlowId) return;
      setState({ loadingAuth: false, hint: e.message || "Ошибка сервера. Попробуйте позже." });
    }
    return;
  }

  if (!state.pendingPhone) {
    setState({ authStep: "phone", hint: "Сначала введите номер телефона." });
    return;
  }
  if (!state.inviteInput.trim()) {
    setState({ hint: "Введите invite-код." });
    return;
  }
  setState({ loadingAuth: true });
  try {
    const payload = await api.loginByInvite(state.pendingPhone, state.inviteInput.trim());
    if (flow !== authFlowId) return;
    localStorage.setItem(TOKEN_KEY, payload.token);
    setState({
      token: payload.token,
      role: payload.role || "user",
      user: payload.user,
      subscription: payload.subscription || null,
      loadingAuth: false,
      authStep: "phone",
      inviteInput: "",
      pendingPhone: "",
      phoneInput: "",
      hint: "Доступ активирован.",
    });
    startSessionHeartbeat();
    ensureHomeProxies();
  } catch (e) {
    if (flow !== authFlowId) return;
    setState({ loadingAuth: false, hint: e.message || "Неверный invite-код." });
  }
}

app.addEventListener("input", (event) => {
  isTyping = true;
  if (state.pwaBlocked) return;

  const { input } = event.target.dataset;
  if (!input) return;

  const releaseTyping = () => {
    setTimeout(() => {
      isTyping = false;
    }, 0);
  };

  if (input === "phone-input") {
    const raw = String(event.target.value || "");
    const caret = typeof event.target.selectionStart === "number" ? event.target.selectionStart : raw.length;
    const caretDigits = raw.slice(0, caret).replace(/\D/g, "").length;
    const formatted = formatPhoneInput(raw);
    const nextCaret = caretIndexFromDigitPos(formatted, caretDigits);

    state.phoneInput = formatted;
    state.authStep = "phone";
    state.pendingPhone = "";
    state.hint = "";

    if (event.target.value !== formatted) {
      event.target.value = formatted;
    }
    if (typeof event.target.setSelectionRange === "function") {
      event.target.setSelectionRange(nextCaret, nextCaret);
    }
    releaseTyping();
    return;
  }

  if (input === "invite-input") {
    const value = String(event.target.value).replace(/\D/g, "").slice(0, 8);
    state.inviteInput = value;
    state.hint = "Введите одноразовый invite-код.";
    if (event.target.value !== value) {
      event.target.value = value;
    }
    releaseTyping();
    return;
  }

  if (input === "payment-phone") {
    const raw = String(event.target.value || "");
    const caret = typeof event.target.selectionStart === "number" ? event.target.selectionStart : raw.length;
    const caretDigits = raw.slice(0, caret).replace(/\D/g, "").length;
    const formatted = formatPhoneInput(raw);
    const nextCaret = caretIndexFromDigitPos(formatted, caretDigits);

    state.paymentPage.phoneInput = formatted;
    state.paymentPage.error = "";
    state.paymentPage.message = "";

    if (event.target.value !== formatted) {
      event.target.value = formatted;
    }
    if (typeof event.target.setSelectionRange === "function") {
      event.target.setSelectionRange(nextCaret, nextCaret);
    }
    releaseTyping();
    return;
  }

  if (input === "payment-promo") {
    state.paymentPage.promoCode = event.target.value;
    state.paymentPage.promoMessage = "";
    state.paymentPage.promoData = null;
    releaseTyping();
    return;
  }

  if (input === "admin-user-phone") {
    state.admin.userForm.phone = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-user-type") {
    state.admin.userForm.subscription_type = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-user-days") {
    state.admin.userForm.duration_days = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-user-search") {
    state.admin.userSearch = event.target.value;
    // Рендер вызывается только при нажатии Enter (обрабатывается ниже)
    return;
  }

  if (input === "admin-bulk-users") {
    state.admin.bulkUsersText = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-proxy-name") {
    state.admin.proxyForm.name = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-proxy-host") {
    state.admin.proxyForm.host = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-proxy-port") {
    state.admin.proxyForm.port = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-proxy-url") {
    state.admin.proxyForm.connect_url = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-bulk-proxies") {
    state.admin.bulkProxiesText = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-promo-code") {
    state.admin.promoForm.code = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-promo-discount") {
    state.admin.promoForm.discount_amount = Number(event.target.value) || 0;
    releaseTyping();
    return;
  }

  if (input === "admin-promo-price-label") {
    state.admin.promoForm.price_label = event.target.value;
    releaseTyping();
    return;
  }

  releaseTyping();
});

app.addEventListener("change", (event) => {
  if (state.pwaBlocked) return;
  const { input } = event.target.dataset;
  if (!input) return;
  if (input === "admin-user-active") setAdmin({ userForm: { ...state.admin.userForm, is_active: event.target.checked } });
  if (input === "admin-proxy-active") setAdmin({ proxyForm: { ...state.admin.proxyForm, is_active: event.target.checked } });
  if (input === "admin-proxy-recommended") setAdmin({ proxyForm: { ...state.admin.proxyForm, is_recommended: event.target.checked } });
  if (input === "admin-proxy-network") setAdmin({ proxyForm: { ...state.admin.proxyForm, network: event.target.value } });
  if (input === "admin-promo-active") setAdmin({ promoForm: { ...state.admin.promoForm, is_active: event.target.checked } });
  if (input === "admin-promo-plan-id") setAdmin({ promoForm: { ...state.admin.promoForm, plan_id: Number(event.target.value) } });
});

// Обработка Enter для поиска в админке
app.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const { input } = event.target.dataset || {};
    if (input === "admin-user-search") {
      event.preventDefault();
      render();
      return;
    }
  }
});

app.addEventListener("click", async (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (state.pwaBlocked && !["show-install-guide", "hide-install-guide", "open-payment-page", "go-app-route"].includes(action)) return;

  if (action === "close-overlay") {
    const clickedCloseButton = !!event.target.closest('[data-action="close-overlay"]');
    if (!clickedCloseButton && event.target.closest(".overlay-card")) return;
    stopPaymentStatusPolling();
    clearPendingPaymentStorage();
    return setState({ plansOverlay: { ...state.plansOverlay, open: false } });
  }

  if (action === "close-proxy-connect") {
    const clickedCloseButton = !!event.target.closest('[data-action="close-proxy-connect"]');
    if (!clickedCloseButton && event.target.closest('[data-action="proxy-connect-card"]')) return;
    return setState({ proxyConnectModal: { open: false, connectUrl: "", network: "", proxyKey: "", copied: false } });
  }

  if (action === "close-legal") {
    return setPaymentPage({ legalModal: { open: false, type: null } });
  }

  if (action === "open-legal") {
    const type = String(el.dataset.legalType || "offer");
    return setPaymentPage({ legalModal: { open: true, type } });
  }

  if (action === "submit-auth") return submitAuth();
  if (action === "open-proxy-connect") {
    const connectUrl = el.dataset.connectUrl;
    const proxyNetwork = el.dataset.network || state.activeTab || "whatsapp";
    if (connectUrl) {
      setState({ proxyConnectModal: { open: true, connectUrl, network: proxyNetwork, proxyKey: el.dataset.proxyKey || "", copied: false } });
    }
    return;
  }
  if (action === "copy-proxy-link") {
    const url = el.dataset.url || state.proxyConnectModal?.connectUrl || "";
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { }
      ta.remove();
    }
    setState({ proxyConnectModal: { ...state.proxyConnectModal, copied: true } });
    setTimeout(() => {
      if (state.proxyConnectModal?.open && state.proxyConnectModal.copied) {
        setState({ proxyConnectModal: { ...state.proxyConnectModal, copied: false } });
      }
    }, 1800);
    return;
  }
  if (action === "toggle-theme") return setThemeChoice(resolvedTheme() === "dark" ? "light" : "dark");
  if (action === "set-theme") return setThemeChoice(el.dataset.theme || "auto");
  if (action === "server-filter") return setState({ serverFilter: el.dataset.filter === "ok" ? "ok" : "all" });
  if (action === "refresh-proxies") {
    const net = el.dataset.network === "whatsapp" ? "whatsapp" : "telegram";
    await loadUserProxies(net);
    return;
  }
  if (action === "back-phone") return setState({ authStep: "phone", inviteInput: "", pendingPhone: "", hint: "Введите номер телефона." });
  if (action === "show-install-guide") return setState({ installGuideOpen: true });
  if (action === "go-app-route") return openAppPage({ phone: normalizePhone(state.phoneInput) });
  if (action === "open-payment-page") return openPaymentPage({ planId: Number(el.dataset.planId || 0), phone: normalizePhone(state.phoneInput) });
  if (action === "extend-subscription") {
    const planId = Number(el.dataset.planId || 301) || 301;
    const phone = normalizePhone(state.user?.phone || state.pendingPhone || state.phoneInput || "");
    if (!phone) {
      setState({ hint: "Укажите номер телефона в профиле для оплаты." });
      return;
    }
    openPaymentPage({ planId, phone });
    return;
  }
  if (action === "hide-install-guide") {
    if (!event.target.closest('[data-action="hide-install-guide"]') && event.target.closest(".landing-install-card")) return;
    return setState({ installGuideOpen: false });
  }
  if (action === "logout") return logout();
  if (action === "go-app-home") {
    const invite = el.dataset.invite;
    const phone = el.dataset.phone;
    openAppPage({ invite, phone });
    return;
  }

  if (action === "select-plan") {
    if (isPaymentRoute()) {
      replacePaymentUrl({
        phone: normalizePhone(state.paymentPage.phoneInput) || null,
        plan: Number(el.dataset.planId),
        token: state.paymentPage.payment?.token || null,
        message: null,
      });
      return setPaymentPage({
        selectedPlanId: Number(el.dataset.planId),
        error: "",
        message: "",
      });
    }
    stopPaymentStatusPolling();
    return setState({
      plansOverlay: {
        ...state.plansOverlay,
        selectedPlanId: Number(el.dataset.planId),
        payment: null,
        paymentError: "",
        paymentLoading: false,
        statusLoading: false,
      },
    });
  }

  if (action === "continue-pending-payment") {
    const pending = readPendingPaymentStorage();
    const payment = pending?.payment || null;
    if (!payment?.token) return;
    replacePaymentUrl({
      phone: normalizePhone(pending?.phone || state.paymentPage.phoneInput) || null,
      plan: pending?.selectedPlanId || state.paymentPage.selectedPlanId || null,
      token: payment.token,
      message: null,
    });
    setPaymentPage({
      payment,
      pendingPayment: null,
      pendingNote: "",
      checking: false,
      creating: false,
      message: "Ожидаем подтверждение оплаты.",
      phoneInput: formatPhoneInput(pending?.phone || state.paymentPage.phoneInput),
      selectedPlanId: pending?.selectedPlanId || state.paymentPage.selectedPlanId,
      error: "",
    });
    startPaymentPagePolling(payment.token);
    await pollPaymentPageStatusOnce(payment.token);
    return;
  }

  if (action === "open-payment-link") {
    // Try to open payment link (fallback if automatic redirect didn't happen)
    const href = String(el.dataset.href || state.paymentPage.payment?.qrUrl || state.plansOverlay.payment?.qrUrl || "").trim();
    if (!href) {
      setPaymentPage({ message: "Ссылка для оплаты не найдена." });
      return;
    }
    try {
      // Open in a new tab and focus it. Do NOT navigate the current tab.
      const win = window.open(href, "_blank", "noopener,noreferrer");
      if (win && typeof win.focus === "function") {
        try { win.focus(); } catch (e) { }
      }
      setPaymentPage({ message: "Открываем страницу оплаты в новой вкладке..." });
    } catch (e) {
      setPaymentPage({ message: "Не удалось открыть ссылку для оплаты." });
    }
    return;
  }

  if (action === "payment-check-promo") {
    const code = String(state.paymentPage.promoCode || "").trim();
    if (!code) {
      return setPaymentPage({ promoMessage: "Введите промокод для проверки." });
    }
    setPaymentPage({ promoChecking: true, promoMessage: "" });
    try {
      const res = await api.promoCheck(code);
      const promo = res?.promo || null;
      if (!promo) throw new Error("Промокод недействителен.");
      setPaymentPage({ promoChecking: false, promoData: promo, promoMessage: `Промокод действителен: ${promo.priceLabel || (promo.amount + ' ₽')}`, selectedPlanId: Number(promo.planId) });
    } catch (e) {
      // Normalize error messages for client display
      const status = e?.status || (e?.payload?.status) || null;
      let message = 'Промокод недействителен.';
      if (status === 404) message = 'Промокод недействителен.';
      else if (e?.payload?.message) message = String(e.payload.message || message);
      else if (e?.message && String(e.message).toLowerCase().includes('promo')) message = 'Промокод недействителен.';
      else if (e?.message) message = String(e.message);
      setPaymentPage({ promoChecking: false, promoData: null, promoMessage: message });
    }
    return;
  }

  if (action === "cancel-pending-payment") {
    clearPendingPaymentStorage();
    replacePaymentUrl({
      phone: normalizePhone(state.paymentPage.phoneInput) || null,
      plan: state.paymentPage.selectedPlanId || null,
      token: null,
      message: "Предыдущий платёж отменён.",
    });
    return setPaymentPage({
      pendingPayment: null,
      pendingNote: "",
      payment: null,
      message: "Предыдущий платёж отменён. Вы можете создать новый.",
      error: "",
    });
  }

  if (action === "cancel-waiting-payment") {
    const token = state.paymentPage.payment?.token || el.dataset.token || null;
    stopPaymentStatusPolling();
    try {
      if (token) {
        await api.cancelPayment(token);
      }
    } catch (e) {
      // ignore server-side errors for cancel
    }
    clearPendingPaymentStorage();
    replacePaymentUrl({
      phone: normalizePhone(state.paymentPage.phoneInput) || null,
      plan: state.paymentPage.selectedPlanId || null,
      token: null,
      message: "Платёж отменён.",
    });
    return setPaymentPage({
      payment: null,
      pendingPayment: null,
      pendingNote: "",
      message: "Платёж отменён. Вы можете создать новый.",
      error: "",
    });
  }

  if (action === "start-payment") {
    const plans = state.plansOverlay.plans || [];
    const plan = plans.find((p) => Number(p.id) === Number(state.plansOverlay.selectedPlanId)) || plans[0] || null;
    const phone = normalizePhone(state.pendingPhone || state.phoneInput || state.user?.phone || "");
    if (!plan) {
      return setState({
        plansOverlay: {
          ...state.plansOverlay,
          paymentError: "Выберите тариф.",
        },
      });
    }
    if (!phone) {
      return setState({
        plansOverlay: {
          ...state.plansOverlay,
          paymentError: "Не удалось определить номер телефона для оплаты.",
        },
      });
    }

    setState({
      plansOverlay: {
        ...state.plansOverlay,
        paymentLoading: true,
        paymentError: "",
        payment: null,
        statusLoading: false,
      },
    });

    try {
      const response = await api.createSbpPayment({
        phone,
        plan_id: Number(plan.id),
        bank_id: state.plansOverlay.selectedBankId || "sber",
      });
      const payment = response?.payment || null;
      if (!payment?.token || !payment?.qrUrl) {
        throw new Error("Платежный провайдер не вернул ссылку для оплаты.");
      }
      const nextPayment = {
        token: payment.token,
        qrUrl: payment.qrUrl,
        amount: payment.amount,
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        status: "pending",
      };
      setState({
        plansOverlay: {
          ...state.plansOverlay,
          paymentLoading: false,
          paymentError: "",
          payment: nextPayment,
        },
      });
      savePendingPaymentStorage({
        selectedPlanId: Number(plan.id),
        message: state.plansOverlay.message || "Ожидаем подтверждение оплаты.",
        payment: nextPayment,
      });
      startPaymentStatusPolling(payment.token);
      if (payment.qrUrl) {
        window.open(payment.qrUrl, "_blank", "noopener");
      }
    } catch (e) {
      setState({
        plansOverlay: {
          ...state.plansOverlay,
          paymentLoading: false,
          paymentError: e.message || "Не удалось создать платёж.",
        },
      });
    }
    return;
  }

  if (action === "payment-create") {
    const phone = normalizePhone(state.paymentPage.phoneInput);
    const plans = state.paymentPage.plans || [];
    const plan = plans.find((p) => Number(p.id) === Number(state.paymentPage.selectedPlanId)) || plans[0] || null;
    if (!phone) {
      return setPaymentPage({ error: "Укажите корректный номер телефона." });
    }
    if (!plan) {
      return setPaymentPage({ error: "Выберите тариф." });
    }

    setPaymentPage({ creating: true, error: "", message: "" });
    try {
      const response = await api.createSbpPayment({
        phone,
        plan_id: Number(plan.id),
        promoCode: state.paymentPage.promoCode || undefined,
      });
      const payment = response?.payment || null;
      if (!payment?.token || !payment?.qrUrl) {
        throw new Error("Платежный провайдер не вернул ссылку для оплаты.");
      }
      const nextPayment = {
        token: payment.token,
        qrUrl: payment.qrUrl,
        amount: payment.amount,
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        status: payment.status || "pending",
      };
      savePendingPaymentStorage({
        route: "payment",
        selectedPlanId: Number(plan.id),
        phone,
        payment: nextPayment,
      });
      replacePaymentUrl({
        phone,
        plan: Number(plan.id),
        token: payment.token,
        message: null,
      });
      setPaymentPage({
        ...buildPaymentWaitingState(plan, nextPayment),
        phoneInput: formatPhoneInput(phone),
        plans,
        supportUrl: state.paymentPage.supportUrl,
        paymentEnabled: state.paymentPage.paymentEnabled,
      });
      startPaymentPagePolling(payment.token);
      window.open(payment.qrUrl, "_blank", "noopener");
    } catch (e) {
      setPaymentPage({
        creating: false,
        error: e.message || "Не удалось создать платёж.",
      });
    }
    return;
  }

  if (action === "check-payment-status") {
    const token = state.plansOverlay.payment?.token;
    if (!token) return;
    setState({
      plansOverlay: {
        ...state.plansOverlay,
        statusLoading: true,
        paymentError: "",
      },
    });
    await pollPaymentStatusOnce(token);
    return;
  }

  if (action === "open-tab") {
    const tab = el.dataset.tab;
    if (tab === "free-vpn") {
      refreshVpnSubscription();
    }
    const isNet = ["telegram", "whatsapp"].includes(tab);
    setState(isNet ? { activeTab: tab, lastNetwork: tab } : { activeTab: tab });
    localStorage.setItem(TAB_KEY, tab);
    window.scrollTo(0, 0);
    const list = isNet ? state.proxies[tab] || [] : [];
    const fresh = list.length && list.every((x) => x.lastCheckedAt && Date.now() - Date.parse(x.lastCheckedAt) < 60 * 1000);
    const inProgress = list.some((x) => x.isChecking);
    if (isNet && !fresh && !inProgress) await loadUserProxies(tab);
    if (tab === "home") ensureHomeProxies();
    if (tab === "vpn" && !state.vpn.initialized) {
      state.vpn.initialized = true;
      loadVpnServers(state.vpn.selectedSource);
    }
    return;
  }

  if (action === "vpn-select-source") {
    const source = el.dataset.source;
    if (source && VPN_SOURCES[source]) {
      loadVpnServers(source);
    }
    return;
  }

  if (action === "vpn-check-latency") {
    if (!state.vpn.latencyChecking && !state.vpn.latencyChecked) {
      startVpnLatencyChecks();
    }
    return;
  }

  if (action === "vpn-copy-config") {
    const raw = el.dataset.raw;
    if (raw) {
      copyVpnConfig(raw);
    }
    return;
  }

  if (action === "vpn-show-qr") {
    const raw = el.dataset.raw;
    if (raw) {
      state.vpn.qrModal = { open: true, raw };
      render();
    }
    return;
  }

  if (action === "vpn-hide-qr") {
    const clickedQrButton = !!event.target.closest('[data-action="vpn-hide-qr"]');
    if (!clickedQrButton && event.target.closest('[data-action="vpn-qr-card"]')) return;
    state.vpn.qrModal = { open: false, raw: "" };
    render();
    return;
  }

  if (state.role !== "admin") return;

  if (action === "admin-section") {
    setAdmin({ section: el.dataset.section });
    if (el.dataset.section === "proxies") await refreshAdminProxies();
    return;
  }
  if (action === "admin-proxy-network-select") {
    const network = String(el.dataset.network || "").trim();
    if (!network) return;
    setAdmin({ proxyForm: { ...state.admin.proxyForm, network } });
    await refreshAdminProxies();
    return;
  }
  if (action === "admin-promo-select") {
    const planId = Number(el.dataset.planId || 0);
    if (!planId) return;
    setAdmin({ promoForm: { ...state.admin.promoForm, plan_id: planId } });
    return;
  }
  if (action === "admin-proxy-filter") {
    setAdmin({ proxyFilter: el.dataset.network });
    await refreshAdminProxies();
    return;
  }
  if (action === "admin-user-sort") {
    setAdmin({ userSort: state.admin.userSort === "desc" ? "asc" : "desc" });
    return;
  }
  if (action === "copy-invite") {
    const code = el.dataset.code || "";
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setAdmin({ message: `Invite-код скопирован: ${code}` });
    } catch { }
    return;
  }

  if (action === "admin-save-user") {
    const phone = normalizePhone(state.admin.userForm.phone);
    if (!phone) return setAdmin({ message: "Введите корректный номер пользователя." });
    setAdmin({ saving: true });
    try {
      const payload = {
        subscription_type: state.admin.userForm.subscription_type,
        duration_days: Number.isFinite(Number(state.admin.userForm.duration_days)) ? Number(state.admin.userForm.duration_days) : 0,
        is_active: !!state.admin.userForm.is_active,
      };
      let resp;
      if (state.admin.users.some((u) => u.phone === phone)) resp = await api.adminUpdateUser(state.token, phone, payload);
      else resp = await api.adminCreateUser(state.token, { phone, ...payload });
      setAdmin({
        userForm: { phone: "", subscription_type: "30 дней", duration_days: 30, is_active: true },
        message: resp?.inviteCode ? `Пользователь сохранён. Новый invite-код: ${resp.inviteCode}` : "Пользователь сохранён.",
        lastInviteCode: resp?.inviteCode || "",
      });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Ошибка при сохранении пользователя." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-import-users") {
    const parsed = parseBulkUsers(state.admin.bulkUsersText);
    if (parsed.errors.length) {
      return setAdmin({ message: parsed.errors[0] });
    }
    if (!parsed.rows.length) {
      return setAdmin({ message: "Добавьте хотя бы одну строку для импорта участников." });
    }

    setAdmin({ saving: true });
    try {
      for (const row of parsed.rows) {
        if (state.admin.users.some((u) => u.phone === row.phone)) {
          await api.adminUpdateUser(state.token, row.phone, row);
        } else {
          await api.adminCreateUser(state.token, row);
        }
      }
      setAdmin({
        bulkUsersText: "",
        message: `Импортировано участников: ${parsed.rows.length}`,
      });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Ошибка при массовом импорте участников." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-edit-user") {
    const phone = el.dataset.phone;
    const u = state.admin.users.find((x) => String(x.phone) === String(phone));
    if (!u) return;
    setAdmin({
      section: "users",
      userForm: {
        phone: displayPhone(u.phone),
        subscription_type: u.subscriptionType,
        duration_days: Number.isFinite(Number(u.daysLeft)) ? Number(u.daysLeft) : 0,
        is_active: !!u.isActive,
      },
    });
    return;
  }

  if (action === "admin-delete-user") {
    setAdmin({ saving: true });
    try {
      await api.adminDeleteUser(state.token, el.dataset.phone);
      setAdmin({ message: "Пользователь удалён." });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось удалить пользователя." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-save-proxy") {
    const f = state.admin.proxyForm;
    if (!f.name.trim() || !f.host.trim() || !f.connect_url.trim()) return setAdmin({ message: "Заполните название, хост и ссылку подключения." });
    const port = parseInt(f.port, 10);
    if (!Number.isFinite(port) || port <= 0 || port > 65535) return setAdmin({ message: "Укажите корректный порт (1–65535)." });
    const payload = { network: f.network, name: f.name.trim(), host: f.host.trim(), port, ping_ms: 40, connect_url: f.connect_url.trim(), is_active: !!f.is_active, is_recommended: !!f.is_recommended, sort_order: 100 };
    if (f.id) await api.adminUpdateProxy(state.token, f.id, payload);
    else await api.adminCreateProxy(state.token, payload);
    setAdmin({
      proxyForm: { id: null, network: "telegram", name: "", host: "", port: 443, connect_url: "", is_active: true, is_recommended: false },
      message: "Прокси сохранён.",
    });
    await refreshAdminProxies();
    return;
  }

  if (action === "admin-import-proxies") {
    const parsed = parseBulkProxies(state.admin.bulkProxiesText, state.admin.proxyFilter || "telegram");
    if (parsed.errors.length) {
      return setAdmin({ message: parsed.errors[0] });
    }
    if (!parsed.rows.length) {
      return setAdmin({ message: "Добавьте хотя бы одну строку для импорта прокси." });
    }

    setAdmin({ saving: true });
    try {
      for (const row of parsed.rows) {
        await api.adminCreateProxy(state.token, row);
      }
      setAdmin({
        bulkProxiesText: "",
        message: `Импортировано прокси: ${parsed.rows.length}`,
      });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Ошибка при массовом импорте прокси." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-edit-proxy") {
    const p = state.admin.proxies.find((x) => String(x.id) === String(el.dataset.id));
    if (!p) return;
    setAdmin({
      section: "proxies",
      proxyForm: { id: p.id, network: p.network, name: p.name, host: p.host, port: p.port, connect_url: p.connectUrl, is_active: !!p.isActive, is_recommended: !!p.isRecommended },
    });
    return;
  }

  if (action === "admin-toggle-proxy") {
    const p = state.admin.proxies.find((x) => String(x.id) === String(el.dataset.id));
    if (!p) return;
    setAdmin({ saving: true });
    try {
      await api.adminUpdateProxy(state.token, p.id, { is_active: !p.isActive });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось изменить статус прокси." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-delete-proxy") {
    setAdmin({ saving: true });
    try {
      await api.adminDeleteProxy(state.token, el.dataset.id);
      setAdmin({ message: "Прокси удалён." });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось удалить прокси." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-save-promo") {
    const f = state.admin.promoForm;
    if (!f.code.trim()) return setAdmin({ message: "Введите промокод." });
    if (!f.price_label.trim()) return setAdmin({ message: "Введите отображаемую цену (например, 150 ₽)." });
    setAdmin({ saving: true });
    try {
      const payload = { code: f.code.trim().toUpperCase(), plan_id: f.plan_id, discount_amount: f.discount_amount, price_label: f.price_label.trim(), is_active: !!f.is_active };
      if (f.id) await api.adminUpdatePromoCode(state.token, f.id, payload);
      else await api.adminCreatePromoCode(state.token, payload);
      setAdmin({
        promoForm: { id: null, code: "", plan_id: 301, discount_amount: 0, price_label: "", is_active: true },
        message: "Промокод сохранён.",
      });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Ошибка при сохранении промокода." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-edit-promo") {
    const p = state.admin.promoCodes.find((x) => String(x.id) === String(el.dataset.id));
    if (!p) return;
    setAdmin({
      section: "promoCodes",
      promoForm: { id: p.id, code: p.code, plan_id: p.plan_id, discount_amount: p.discount_amount, price_label: p.price_label, is_active: !!p.is_active },
    });
    return;
  }

  if (action === "admin-delete-promo") {
    setAdmin({ saving: true });
    try {
      await api.adminDeletePromoCode(state.token, el.dataset.id);
      setAdmin({ message: "Промокод удалён." });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось удалить промокод." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

  if (action === "admin-toggle-promo") {
    const p = state.admin.promoCodes.find((x) => String(x.id) === String(el.dataset.id));
    if (!p) return;
    setAdmin({ saving: true });
    try {
      await api.adminUpdatePromoCode(state.token, p.id, { is_active: !p.is_active });
      setAdmin({ message: `Промокод ${p.code} обновлён.` });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось изменить статус промокода." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }
});

window.addEventListener("pageshow", () => {
  const blocked = shouldBlockBrowserMode();
  if (blocked !== state.pwaBlocked) {
    setState({ pwaBlocked: blocked });
  }
  if (isPaymentRoute() && state.paymentPage.payment?.token && !state.paymentPage.fulfillment) {
    startPaymentPagePolling(state.paymentPage.payment.token);
    void pollPaymentPageStatusOnce(state.paymentPage.payment.token);
    return;
  }
  if (!blocked && !state.booting && state.token && state.role !== "admin") {
    void runSessionHeartbeatCheck();
  }
  if (!blocked && !state.booting && state.plansOverlay.open && state.plansOverlay.payment?.token && state.plansOverlay.payment?.status !== "paid") {
    startPaymentStatusPolling(state.plansOverlay.payment.token);
    void pollPaymentStatusOnce(state.plansOverlay.payment.token);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && isPaymentRoute() && state.paymentPage.payment?.token && !state.paymentPage.fulfillment) {
    startPaymentPagePolling(state.paymentPage.payment.token);
    void pollPaymentPageStatusOnce(state.paymentPage.payment.token);
    return;
  }
  if (document.visibilityState === "visible" && !state.booting && !state.pwaBlocked && state.token && state.role !== "admin") {
    void runSessionHeartbeatCheck();
  }
  if (document.visibilityState === "visible" && !state.booting && !state.pwaBlocked && state.plansOverlay.open && state.plansOverlay.payment?.token && state.plansOverlay.payment?.status !== "paid") {
    startPaymentStatusPolling(state.plansOverlay.payment.token);
    void pollPaymentStatusOnce(state.plansOverlay.payment.token);
  }
});

if ("serviceWorker" in navigator && (window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${WEB_BASE}/sw.js`).catch(() => { });
  });
}

render();
bootstrap();
