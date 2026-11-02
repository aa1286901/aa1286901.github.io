const API_BASE = window.AHMEDOV_CONFIG?.apiBase || "/api";
const WEB_BASE = window.AHMEDOV_CONFIG?.webBase || "";
const TOKEN_KEY = "ahmedov_proxy_jwt";
const TAB_KEY = "ahmedov_proxy_tab";
const PAYMENT_PENDING_KEY = "ahmedov_proxy_pending_payment";
const REQUIRE_PWA = true;
// Кнопка «Оплатить через СБП» на странице оплаты. Сейчас оплата идёт через поддержку.
const SHOW_SBP_BUTTON = false;


let isTyping = false;

const app = document.getElementById("app");

const state = {
  pwaBlocked: false,
  demo: false,
  demoSheet: false,
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
  vpn: { copiedRaw: "" },
  vpnList: { loading: false, loaded: false, servers: [], total: 0, error: "", tab: "" },
  proxyConnectModal: { open: false, connectUrl: "", network: "", proxyKey: "", copied: false },
  admin: {
    tab: "overview",
    sheet: null,
    userFilter: "all",
    invitePhone: "",
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


function landingPath() {
  return WEB_BASE || "/";
}

function appPath() {
  return `${WEB_BASE}/app`;
}

function appHomePath() {
  return appPath();
}

const LINK_CODE_KEY = "ahmedov_link_code";

// Вход по ссылке вида /app?phone=9001234567&invite=12345678
async function tryAutoLoginFromUrl() {
  const params = new URLSearchParams(location.search);
  const invite = String(params.get("invite") || "").replace(/\D/g, "");
  const phone = normalizePhone(params.get("phone") || "");
  if (!invite || !phone) return { status: "none" };

  history.replaceState({}, "", appPath());
  try {
    const response = await api.loginByInvite(phone, invite);
    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      try { sessionStorage.setItem(LINK_CODE_KEY, invite); } catch { }
      return { status: "ok" };
    }
    return { status: "fail", phone, invite, message: "Не удалось войти по ссылке. Проверьте код и нажмите «Войти»." };
  } catch (e) {
    return { status: "fail", phone, invite, message: e?.message || "Не удалось войти по ссылке." };
  }
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
    vpn: params.get("vpn") === "1",
    promo: String(params.get("promo") || "").trim(),
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
  if (options.vpn) url.searchParams.set("vpn", "1");
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
      ozonEnabled: !!payload?.ozonEnabled,
      comboPlans: payload?.comboPlans || [],
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
    ozonEnabled: plansData.ozonEnabled,
    comboPlans: plansData.comboPlans || [],
    withVpn: !!routeState.vpn,
    creating: false,
    checking: false,
    payment,
    pendingPayment,
    pendingNote,
    fulfillment: null,
    message: routeState.message || (payment ? "Ожидаем подтверждение оплаты." : ""),
    error: "",
  });

  void ozonResume();

  if (routeState.promo && !token) {
    state.paymentPage.promoCode = routeState.promo;
    await paymentApplyPromo();
  }

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
    ozonEnabled: plansData.ozonEnabled,
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
      ozonEnabled: plansData.ozonEnabled,
    ozonEnabled: plansData.ozonEnabled,
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
  adminVpn: (token, phone, body) => request(`/admin/users/${encodeURIComponent(phone)}/vpn`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
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


















// ==========================
// VPN FUNCTIONS
// ==========================












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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
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
  if (p?.demo) return `demo:${p.name || ""}`;
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

// Кнопки связи. msg — какое сообщение подставить: текст собирается в момент нажатия.
function contactButtons(msg = "") {
  const attrs = (ch) => (msg ? `data-action="contact" data-ch="${ch}" data-msg="${msg}"` : "");
  return `<div class="ui-contacts">
    <a class="ui-contact tg" href="${SUPPORT_LINKS.telegram}" target="_blank" rel="noopener" ${attrs("tg")}>Telegram</a>
    <a class="ui-contact wa" href="${SUPPORT_LINKS.whatsapp}" target="_blank" rel="noopener" ${attrs("wa")}>WhatsApp</a>
    <a class="ui-contact max" href="${SUPPORT_LINKS.max}" target="_blank" rel="noopener" ${attrs("max")}>MAX</a>
  </div>`;
}

function messageFor(key) {
  const hello = "Здравствуйте!";
  const phoneOf = (raw) => {
    const d = normalizePhone(raw || "");
    return d ? displayPhone(d) : "";
  };
  if (key === "join") return `${hello} Хочу подключить прокси ahmedov.proxy для Telegram и WhatsApp. Подскажите, как оплатить?`;
  if (key === "code") {
    const ph = phoneOf(state.pendingPhone || state.phoneInput);
    return `${hello} Подскажите код доступа к ahmedov.proxy.${ph ? ` Мой номер: ${ph}` : ""}`;
  }
  if (key === "support") {
    const ph = phoneOf(state.user?.phone);
    return `${hello} Нужна помощь с подключением ahmedov.proxy.${ph ? ` Мой номер: ${ph}` : ""}`;
  }
  if (key === "pay") {
    const pp = state.paymentPage;
    const plans = pp.plans || [];
    const plan = plans.find((x) => Number(x.id) === Number(pp.selectedPlanId)) || plans[0];
    const price = pp.promoData ? (pp.promoData.priceLabel || `${pp.promoData.amount} ₽`) : plan?.price;
    const ph = phoneOf(pp.phoneInput);
    const combo = pp.withVpn && !pp.promoData ? comboFor(pp.comboPlans, plan?.id) : null;
    if (combo) return `${hello} Хочу оплатить комплект прокси + VPN ahmedov.proxy на ${combo.durationDays} дней (${combo.price}).${ph ? ` Мой номер: ${ph}.` : ""}`;
    return `${hello} Хочу оплатить прокси ahmedov.proxy${plan ? ` на ${plan.name}` : ""}${price ? ` (${price})` : ""}.${ph ? ` Мой номер: ${ph}.` : ""}${pp.promoData?.code ? ` Промокод: ${pp.promoData.code}.` : ""}`;
  }
  if (key === "overlay") {
    const o = state.plansOverlay;
    const plans = o.plans || [];
    const plan = plans.find((x) => Number(x.id) === Number(o.selectedPlanId)) || plans[0];
    const ph = phoneOf(state.user?.phone || state.pendingPhone);
    return `${hello} Хочу продлить прокси ahmedov.proxy${plan ? ` на ${plan.name} (${plan.price})` : ""}.${ph ? ` Мой номер: ${ph}.` : ""}`;
  }
  if (key === "pay-ozon") {
    const o = ozonCurrent();
    return `${hello} Я оплатил(а) через Ozon${o ? `: ${o.amountLabel}, ${o.kind === "proxy" ? `прокси ${o.planName}` : o.planName}. Мой номер: ${o.displayPhone}${o.payer ? `, перевод от ${o.payer.replace(/\.$/, "")}` : ""}` : ""}. Чек прикрепляю.`;
  }
  if (key === "vpn") {
    const plans = vpnPlans();
    const plan = plans.find((x) => x.id === (state.vpnPlanId || plans[1]?.id || plans[0]?.id)) || plans[0];
    return plan ? vpnBuyText(plan) : `${hello} Хочу подключить VPN ahmedov.proxy.`;
  }
  return "";
}

function showToast(text) {
  state.toast = text;
  render();
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { state.toast = ""; render(); }, 2800);
}


function planPerMonth(plan) {
  const amount = Number(String(plan?.price || "").replace(/\D+/g, ""));
  const months = Number(plan?.durationMonths || 0) || Math.round(Number(plan?.durationDays || 0) / 30);
  if (!amount || !months) return null;
  return amount / months;
}

async function paymentApplyPromo() {
  const code = String(state.paymentPage.promoCode || "").trim();
  if (!code) {
    setPaymentPage({ promoMessage: "Введите промокод для проверки." });
    return;
  }
  setPaymentPage({ promoChecking: true, promoMessage: "" });
  try {
    const res = await api.promoCheck(code);
    const promo = res?.promo || null;
    if (!promo) throw new Error("Промокод недействителен.");
    setPaymentPage({ promoChecking: false, promoData: promo, promoMessage: `Промокод действителен: ${promo.priceLabel || (promo.amount + ' ₽')}`, selectedPlanId: Number(promo.planId), withVpn: false });
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
}

function comboFor(plans, planId) {
  return (plans || []).find((c) => Number(c.planId) === Number(planId)) || null;
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

// ==========================
// Демо-режим: кабинет без входа, только названия серверов
// ==========================

const DEMO_KEY = "ahmedov_demo";

function proxyHostLine(p) {
  return p?.demo ? "Адрес откроется после оплаты" : `${p?.host || ""}:${p?.port || ""}`;
}

function demoLock(href) {
  return state.demo ? 'href="#" data-action="demo-locked"' : `href="${esc(href)}"`;
}

async function enterDemo() {
  setState({ booting: true });
  let data = {};
  try {
    data = await request("/demo");
  } catch {
    data = {};
  }
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 19).replace("T", " ");
  const mapProxies = (list) => (list || []).map((x) => ({
    name: x.name, isRecommended: !!x.isRecommended, host: "", port: "", connectUrl: "demo", demo: true,
    isChecking: false, isReachable: true, isUnstable: false, ping: null, lastCheckedAt: now,
  }));
  try { sessionStorage.setItem(DEMO_KEY, "1"); } catch { }
  setState({
    demo: true,
    booting: false,
    pwaBlocked: false,
    role: "user",
    user: { phone: "9000000000", displayPhone: "+7 900 000 00 00" },
    subscription: {
      type: "90 дней", daysLeft: 90, expiresAt: expires,
      vpn: { active: true, daysLeft: 90, expiresAt: expires, subUrl: null },
      vpnPlans: data.vpnPlans || [],
    },
    proxies: { telegram: mapProxies(data.proxies?.telegram), whatsapp: mapProxies(data.proxies?.whatsapp) },
    vpnList: { loading: false, loaded: true, servers: data.vpnServers || [], total: Number(data.vpnTotal) || 0, error: "", tab: "" },
    activeTab: "home",
    demoSheet: false,
  });
  window.scrollTo(0, 0);
}

function demoBanner() {
  if (!state.demo) return "";
  return `<div class="ui-card ui-pad ui-demo-banner">
    <div style="display:flex;gap:10px;align-items:flex-start;">
      <span class="ui-row-icon" style="background:#FF9F0A;">${uiIcon("info", 18, 2.1)}</span>
      <span style="display:flex;flex-direction:column;gap:2px;">
        <strong style="font-size:15px;">Демо-версия кабинета</strong>
        <span class="ui-sub" style="font-size:13px;line-height:18px;">Так всё выглядит после оплаты. Цифры — для примера, подключение откроется после покупки.</span>
      </span>
    </div>
    <div class="ui-grid2">
      <button class="ui-btn" style="height:44px;font-size:15px;" data-action="extend-subscription" data-plan-id="302">Купить доступ</button>
      <button class="ui-btn ghost" style="height:44px;font-size:15px;" data-action="demo-exit">Выйти из демо</button>
    </div>
  </div>`;
}

function demoSheet() {
  if (!state.demo || !state.demoSheet) return "";
  return `<div class="ui-layer" data-action="demo-close">
    <article class="ui-sheet" data-action="demo-sheet-card" role="dialog" aria-label="Демо-версия">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head">
        <button class="ui-sheet-close" data-action="demo-close" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <span class="ui-lock" style="width:64px;height:64px;border-radius:20px;">${uiIcon("lock", 30)}</span>
        <h2 class="ui-sheet-title">Это демо-версия</h2>
        <span class="ui-sub" style="font-size:15px;line-height:21px;">Подключение к серверам открывается после оплаты. Выберите тариф — пришлём код доступа, и кабинет станет вашим.</span>
      </div>
      <button class="ui-btn" data-action="extend-subscription" data-plan-id="302">Выбрать тариф</button>
      <span class="ui-label" style="text-align:center;">Или напишите нам</span>
      ${contactButtons("join")}
      <button class="ui-text-btn" data-action="demo-close">Продолжить смотреть</button>
    </article>
  </div>`;
}

function homeVpnCard() {
  const v = userVpn();
  if (v.active) {
    const days = Math.max(0, Number(v.daysLeft) || 0);
    return `<button class="ui-card ui-row-card" data-action="open-tab" data-tab="vpn">
      <span class="ui-row-icon" style="background:#5E5CE6;">${uiIcon("vpn", 18, 2.1)}</span>
      <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">VPN активен</span><span class="ui-qrow-sub"><span class="ui-dot ${days <= 7 ? "slow" : "ok"}"></span>${days} ${ruPlural(days, "день", "дня", "дней")} · до ${esc(formatDateOnly(v.expiresAt))}</span></span>
      <span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span>
    </button>`;
  }
  return `<button class="ui-card ui-row-card" data-action="open-tab" data-tab="vpn" style="background:linear-gradient(140deg, rgba(94,92,230,.18), rgba(10,132,255,.12));">
      <span class="ui-row-icon" style="background:#5E5CE6;">${uiIcon("vpn", 18, 2.1)}</span>
      <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">${v.expiresAt ? "VPN закончился" : "Подключите VPN"}</span><span class="ui-sub" style="font-size:13px;">Для всех приложений и сайтов · от ${esc(vpnPlans()[0]?.price || "")}</span></span>
      <span class="ui-btn-sm" style="pointer-events:none;">${v.expiresAt ? "Продлить" : "Подробнее"}</span>
    </button>`;
}

function browserLoginBanner() {
  if (isStandaloneMode()) return "";
  let code = "";
  try { code = sessionStorage.getItem(LINK_CODE_KEY) || ""; } catch { }
  return `<article class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span class="ui-row-icon" style="background:var(--ui-accent-btn);">${uiIcon("download", 18, 2.1)}</span>
        <span style="display:flex;flex-direction:column;gap:3px;">
          <strong style="font-size:16px;">Вы вошли в браузере</strong>
          <span class="ui-sub" style="font-size:14px;line-height:19px;">Добавьте приложение на экран «Домой»${code ? ` и войдите там с кодом <b style="color:var(--ui-text);letter-spacing:.08em;">${esc(code)}</b>` : ""} — так удобнее подключаться.</span>
        </span>
      </div>
      <button class="ui-btn ghost" style="height:46px;" data-action="show-install-guide">Как установить</button>
    </article>`;
}

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

    ${browserLoginBanner()}

    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Подключиться в один тап</h2><button class="ui-link" data-action="open-tab" data-tab="telegram">Все</button></div>
      <div class="ui-card ui-list">${quickRow("telegram")}${quickRow("whatsapp")}</div>
    </section>

    ${homeVpnCard()}

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
      ${contactButtons("support")}
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
        <span class="ui-server-text"><span class="ui-server-name">${esc(parts.name)}</span><span class="ui-server-host">${esc(proxyHostLine(p))}</span></span>
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
        <span class="ui-server-text"><span class="ui-best-name">${esc(parts.name)}</span><span class="ui-server-host">${esc(proxyHostLine(best))}</span></span>
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
    <h1 class="ui-h1">Прокси</h1>
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
        <button class="ui-row" data-action="open-tab" data-tab="vpn"><span class="ui-row-main"><span class="ui-row-label">VPN</span><span class="ui-row-value ${userVpn().active ? "green" : ""}">${userVpn().active ? `до ${esc(formatDateOnly(userVpn().expiresAt))}` : "не подключён"}</span><span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span></span></button>
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
          ${contactButtons("code")}
        </div>
      </div>
    </section>`;
  }

  return `<section class="ui-auth">
    <div class="ui-auth-hero">
      <img class="ui-logo" src="./assets/icons/icon-512.svg" alt="ahmedov.proxy" width="92" height="92" />
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
      <button class="ui-btn ghost" style="height:50px;font-size:16px;" data-action="demo-enter">${uiIcon("info", 18)}Посмотреть демо-версию</button>
    </div>
    <div class="ui-auth-foot">
      <span class="ui-sub" style="font-size:15px;">Нет подписки? Напишите нам</span>
      <div style="width:100%;">${contactButtons("join")}</div>
      <p class="ui-legal-note" style="margin:4px 0 0;">Продолжая, вы принимаете <button type="button" data-action="open-legal" data-legal-type="agreement">Пользовательское соглашение</button></p>
    </div>
  </section>`;
}

function bottomBar() {
  const t = state.activeTab;
  const onServers = t === "telegram" || t === "whatsapp";
  const net = state.lastNetwork === "whatsapp" ? "whatsapp" : "telegram";
  return `<nav class="ui-tabbar four" role="tablist" aria-label="Главная навигация">
    <button class="ui-tab ${t === "home" ? "active" : ""}" role="tab" aria-selected="${t === "home"}" data-action="open-tab" data-tab="home">${uiIcon(t === "home" ? "homeFill" : "home")}Главная</button>
    <button class="ui-tab ${onServers ? "active" : ""}" role="tab" aria-selected="${onServers}" data-action="open-tab" data-tab="${net}">${uiIcon(onServers ? "serversFill" : "servers")}Прокси</button>
    <button class="ui-tab ${t === "vpn" || t === "free-vpn" ? "active" : ""}" role="tab" aria-selected="${t === "vpn"}" data-action="open-tab" data-tab="vpn">${uiIcon(t === "vpn" || t === "free-vpn" ? "vpnFill" : "vpn")}VPN</button>
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
  const combo = p.ozonEnabled && !p.promoData ? comboFor(p.comboPlans, selectedPlan?.id) : null;
  const useCombo = !!(combo && p.withVpn);
  const amountLabel = p.payment?.amount
    ? `${p.payment.amount} ₽`
    : p.promoData ? (p.promoData.priceLabel || `${p.promoData.amount} ₽`) : useCombo ? combo.price : selectedPlan?.price || "";

  const top = `<div style="display:flex;align-items:center;gap:12px;">
      <img class="ui-logo sm" src="./assets/icons/icon-512.svg" alt="ahmedov.proxy" width="48" height="48" />
      <div style="display:flex;flex-direction:column;"><strong style="font-size:17px;">ahmedov.proxy</strong><span class="ui-sub" style="font-size:13px;">Оплата подписки</span></div>
    </div>`;

  let body = "";
  if (p.ozonOrder) {
    body = ozonOrderView(p.ozonOrder, false);
  } else if (fulfilled) {
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
      ${combo ? `<label class="ui-card ui-combo ${useCombo ? "on" : ""}">
          <span class="ui-row-icon" style="background:#5E5CE6;">${uiIcon("vpn", 18, 2.1)}</span>
          <span class="ui-qrow-text">
            <span class="ui-qrow-title" style="font-size:16px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">Добавить VPN<span class="ui-plan-save">−${esc(combo.save)} ₽</span></span>
            <span class="ui-sub" style="font-size:13px;">Прокси + VPN на ${esc(combo.durationDays)} дней — <b style="color:var(--ui-text);">${esc(combo.price)}</b> вместо <s>${esc(combo.fullPrice)}</s>. Instagram, YouTube и все сайты.</span>
          </span>
          <input type="checkbox" class="ui-switch" data-action="payment-toggle-vpn" ${useCombo ? "checked" : ""} aria-label="Добавить VPN" />
        </label>` : ""}
      <div class="ui-card ui-promo">
        <span class="ui-sub" style="display:flex;">${uiIcon("tag", 20)}</span>
        <label for="pay-promo" style="position:absolute;left:-9999px;">Промокод</label>
        <input id="pay-promo" placeholder="Промокод" value="${esc(p.promoCode || "")}" data-input="payment-promo" />
        <button class="ui-btn-sm soft" data-action="payment-check-promo">${p.promoChecking ? "Проверяем…" : "Применить"}</button>
      </div>
      ${p.promoData ? `<div class="ui-msg ok">Промокод ${esc(p.promoData.code)} применён · ${esc(p.promoData.priceLabel || `${p.promoData.amount || 0} ₽`)}${p.promoData.name ? " · " + esc(p.promoData.name) : ""}</div>` : ""}
      ${!p.promoData && p.promoMessage ? `<div class="ui-msg err">${esc(p.promoMessage)}</div>` : ""}
      ${selectedPlan ? `<div class="ui-card ui-kv">
          <div><span>Тариф</span><b>${esc(useCombo ? combo.name : (p.promoData?.name || selectedPlan.name))}</b></div>
          <div><span>К оплате</span><b style="font-size:18px;">${esc(amountLabel)}</b></div>
        </div>` : ""}
      ${p.ozonEnabled ? `${ozonPayerField("pay-payer")}
        <button class="ui-btn" data-action="ozon-start" data-kind="${useCombo ? "combo" : "proxy"}" ${p.ozonCreating ? "disabled" : ""}>${uiIcon("bank", 20, 2.1)}${p.ozonCreating ? "Создаём заявку…" : `Перейти к оплате ${esc(amountLabel)}`}</button>
        <p class="ui-caption" style="margin:-6px 0 0;text-align:center;">По СБП через Ozon, без комиссии. Подтверждаем обычно за 10–15 минут.</p>` : ""}
      ${SHOW_SBP_BUTTON && p.paymentEnabled ? `<button class="ui-btn" data-action="payment-create" ${p.creating ? "disabled" : ""}>${uiIcon("bank", 20, 2.1)}${p.creating ? "Создаём платёж…" : `Оплатить ${esc(amountLabel)} через СБП`}</button>` : ""}
      <div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
        <strong style="font-size:16px;">${p.ozonEnabled || (SHOW_SBP_BUTTON && p.paymentEnabled) ? "Или оформим вручную" : "Для оплаты напишите нам"}</strong>
        <span class="ui-sub" style="font-size:14px;margin-top:-4px;">Пришлите номер телефона и выбранный тариф — оформим подписку.</span>
        ${contactButtons("pay")}
      </div>
      <p class="ui-legal-note" style="margin:0;">Продолжая, вы соглашаетесь с <button type="button" data-action="open-legal" data-legal-type="offer">офертой</button>, <button type="button" data-action="open-legal" data-legal-type="privacy">политикой конфиденциальности</button> и <button type="button" data-action="open-legal" data-legal-type="agreement">пользовательским соглашением</button>.</p>`;
  }

  return `<section class="ui-stack">
    ${top}
    <h1 class="ui-h1" style="padding:0;">${p.ozonOrder?.status === "paid" || fulfilled ? "Готово!" : waitingMode || p.ozonOrder ? "Оплата" : "Подписка"}</h1>
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
      ${contactButtons("overlay")}
    </article>
  </div>`;
}

// ==========================
// UI: стартовая страница, установка, VPN
// ==========================

Object.assign(UI_ICON_PATHS, {
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  vpn: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/><circle cx="12" cy="11" r="2.5"/>',
  vpnFill: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" fill="currentColor"/><circle cx="12" cy="11" r="2.5" fill="var(--ui-bg)" stroke="none"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  chartFill: '<rect x="3" y="10" width="3.5" height="10" rx="1" fill="currentColor"/><rect x="9" y="4" width="3.5" height="16" rx="1" fill="currentColor"/><rect x="15" y="13" width="3.5" height="7" rx="1" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.5 3.8 5.5"/>',
  usersFill: '<circle cx="9" cy="8" r="3.8" fill="currentColor" stroke="none"/><path d="M2.5 20.5c1-3.8 3.5-6 6.5-6s5.5 2.2 6.5 6z" fill="currentColor" stroke="none"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.5 3.8 5.5"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  ticketFill: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2z" fill="currentColor"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  share: '<path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/>',
  dots: '<circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/>',
  addSquare: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/>',
  cardFill: '<rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor"/><path d="M3 10h18" stroke="var(--ui-bg)"/>',
});

function landingScreen() {
  const plans = [
    { id: 301, name: "90 дней", note: "Оптимальный старт", price: "490 ₽", day: "~5,4 ₽ в день" },
    { id: 302, name: "180 дней", note: "Самый популярный", price: "690 ₽", day: "~3,8 ₽ в день", save: "−30%" },
    { id: 303, name: "360 дней", note: "Максимальная выгода", price: "990 ₽", day: "~2,7 ₽ в день", save: "−49%" },
  ];
  const step = (n, title, text) => `<div class="ui-step"><span class="ui-step-num">${n}</span><span class="ui-step-text"><b>${title}</b><span>${text}</span></span></div>`;
  return `<section class="ui-stack">
    <header class="ui-top">
      <img class="ui-logo sm" src="./assets/icons/icon-512.svg" alt="" width="48" height="48" />
      <div class="ui-top-text"><span class="ui-brand" style="font-size:20px;line-height:24px;">ahmedov.proxy</span><span class="ui-sub" style="font-size:13px;">Прокси для Telegram и WhatsApp</span></div>
      <button class="ui-btn-sm" data-action="go-app-route">Войти</button>
    </header>

    <article class="ui-hero" style="gap:14px;">
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;">
        <span class="ui-hero-chip" style="align-self:flex-start;"><i></i>Работает без VPN</span>
        <h1 style="margin:0;font-size:30px;line-height:35px;font-weight:800;letter-spacing:-0.6px;">Telegram и WhatsApp без блокировок</h1>
        <span class="ui-hero-cap">Быстрые и стабильные прокси-серверы. Подключение в одно касание.</span>
      </div>
      <button class="ui-hero-btn" style="position:relative;z-index:1;height:50px;border-radius:16px;font-size:17px;" data-action="go-app-route">Подключить сейчас</button>
      <button class="ui-hero-btn" style="position:relative;z-index:1;height:46px;border-radius:16px;font-size:16px;background:rgba(255,255,255,.18);color:#FFFFFF !important;" data-action="demo-enter">Посмотреть демо кабинета</button>
    </article>

    <div class="ui-grid3">
      <div class="ui-card ui-feature">${uiIcon("bolt", 22)}<span>Низкий пинг</span></div>
      <div class="ui-card ui-feature">${uiIcon("shield", 22)}<span>Безопасно</span></div>
      <div class="ui-card ui-feature">${uiIcon("globe", 22)}<span>EU-серверы</span></div>
    </div>

    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Тарифы</h2><span class="ui-sub" style="font-size:14px;">Telegram + WhatsApp</span></div>
      <div class="ui-plans">${plans.map((p) => `<button class="ui-plan" data-action="open-payment-page" data-plan-id="${p.id}">
        <span class="ui-plan-text">
          <span class="ui-plan-title">${p.name}${p.save ? `<span class="ui-plan-save">${p.save}</span>` : ""}</span>
          <span class="ui-plan-sub">${p.note} · ${p.day}</span>
        </span>
        <span class="ui-plan-price">${p.price}</span>
      </button>`).join("")}</div>
      <p class="ui-caption" style="margin:0;">Гарантия возврата средств в течение 24 часов.</p>
    </section>

    <section class="ui-sec">
      <h2 class="ui-h2" style="padding:0 4px;">Как это работает</h2>
      <div class="ui-card ui-pad ui-steps">
        ${step(1, "Оплачиваете тариф", "Выберите срок — оплата через поддержку.")}
        ${step(2, "Получаете код доступа", "8 цифр для входа в приложение.")}
        ${step(3, "Подключаетесь в один тап", "Выбираете сервер — и мессенджер работает.")}
      </div>
    </section>

    <button class="ui-card ui-row-card" data-action="show-install-guide">
      <span class="ui-row-icon" style="background:var(--ui-accent-btn);">${uiIcon("download", 18, 2.1)}</span>
      <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">Установить приложение</span><span class="ui-sub" style="font-size:13px;">Иконка на экране «Домой» — как обычное приложение</span></span>
      <span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span>
    </button>

    <article class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:12px;">
      <strong style="font-size:17px;">Остались вопросы?</strong>
      ${contactButtons("join")}
    </article>
  </section>`;
}

function installGuideModal() {
  if (!state.installGuideOpen) return "";
  const row = (icon, title, text) => `<div class="ui-step"><span class="ui-step-num icon">${icon}</span><span class="ui-step-text"><b>${title}</b><span>${text}</span></span></div>`;
  return `<div class="ui-layer" data-action="hide-install-guide">
    <article class="ui-sheet landing-install-card" role="dialog" aria-label="Установка приложения">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head">
        <button class="ui-sheet-close" data-action="hide-install-guide" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <img class="ui-logo" src="./assets/icons/icon-512.svg" alt="" width="72" height="72" style="width:72px;height:72px;border-radius:18px;" />
        <h2 class="ui-sheet-title">Установка приложения</h2>
        <span class="ui-sub" style="font-size:15px;">Добавьте кабинет на экран «Домой» — он откроется как отдельное приложение.</span>
      </div>
      <span class="ui-label">iPhone · Safari</span>
      <div class="ui-card ui-pad ui-steps" style="background:var(--ui-fill);box-shadow:none;">
        ${row(uiIcon("globe", 18), "Откройте сайт в Safari", "Установка на iPhone работает через Safari.")}
        ${row(uiIcon("share", 18), "Нажмите «Поделиться»", "Кнопка в нижней панели браузера.")}
        ${row(uiIcon("addSquare", 18), "Выберите «На экран Домой»", "Подтвердите и откройте иконку с главного экрана.")}
      </div>
      <span class="ui-label">Android · Chrome</span>
      <div class="ui-card ui-pad ui-steps" style="background:var(--ui-fill);box-shadow:none;">
        ${row(uiIcon("globe", 18), "Откройте сайт в Chrome", "Или в другом совместимом браузере.")}
        ${row(uiIcon("dots", 18), "Откройте меню браузера", "Три точки в верхней части экрана.")}
        ${row(uiIcon("download", 18), "«Установить приложение»", "Потом открывайте кабинет через иконку.")}
      </div>
      <button class="ui-btn" data-action="hide-install-guide">Понятно</button>
    </article>
  </div>`;
}

function pwaBlockedScreen() {
  return landingScreen();
}


function userVpn() {
  return state.subscription?.vpn || { active: false };
}

function vpnPlans() {
  const plans = state.subscription?.vpnPlans || [];
  return plans.length ? plans : [
    { id: "vpn90", name: "90 дней", durationDays: 90, durationMonths: 3, price: "290 ₽" },
    { id: "vpn180", name: "180 дней", durationDays: 180, durationMonths: 6, price: "490 ₽" },
    { id: "vpn360", name: "360 дней", durationDays: 360, durationMonths: 12, price: "790 ₽" },
  ];
}

function vpnBuyText(plan) {
  const phone = displayPhone(state.user?.phone || "");
  const renew = userVpn().active;
  return `Здравствуйте! Хочу ${renew ? "продлить" : "купить"} VPN на ${plan.name} (${plan.price}). Мой номер в ahmedov.proxy: ${phone}`;
}

function vpnBuyBlock() {
  const plans = vpnPlans();
  const selectedId = state.vpnPlanId || plans[1]?.id || plans[0]?.id;
  const plan = plans.find((p) => p.id === selectedId) || plans[0];
  const base = plans.length ? planPerMonth(plans[0]) : null;
  return `<div class="ui-plans" role="radiogroup" aria-label="Тариф VPN">${plans.map((p) => {
      const on = p.id === plan.id;
      const perMonth = planPerMonth(p);
      const save = base && perMonth && perMonth < base ? Math.round((1 - perMonth / base) * 100) : 0;
      return `<button class="ui-plan ${on ? "on" : ""}" role="radio" aria-checked="${on}" data-action="vpn-select-plan" data-plan-id="${esc(p.id)}">
        <span class="ui-radio">${on ? uiIcon("check", 14, 3.4) : ""}</span>
        <span class="ui-plan-text">
          <span class="ui-plan-title">${esc(p.name)}${save ? `<span class="ui-plan-save">−${save}%</span>` : ""}</span>
          <span class="ui-plan-sub">${perMonth ? `${Math.round(perMonth)} ₽ в месяц` : ""}</span>
        </span>
        <span class="ui-plan-price">${esc(p.price)}</span>
      </button>`;
    }).join("")}</div>
    <div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
      ${ozonPayerField("vpn-payer")}
      <button class="ui-btn" data-action="ozon-start" data-kind="vpn" data-plan-id="${esc(plan.id)}" ${state.ozonCreating ? "disabled" : ""}>${uiIcon("bank", 20, 2.1)}${state.ozonCreating ? "Создаём заявку…" : `Перейти к оплате ${esc(plan.price)}`}</button>
      <span class="ui-sub" style="font-size:13px;text-align:center;margin-top:-4px;">По СБП через Ozon, без комиссии. VPN включится после подтверждения.</span>
      <span class="ui-label" style="text-align:center;padding-top:4px;">Или напишите нам — сообщение уже готово</span>
      ${contactButtons("vpn")}
    </div>`;
}

function vpnComboOffer() {
  const combos = state.subscription?.comboPlans || [];
  if (!combos.length) return "";
  const best = combos[combos.length - 1];
  return `<article class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:12px;border:1.5px solid rgba(94,92,230,.45);">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="ui-row-icon" style="background:#5E5CE6;">${uiIcon("vpn", 18, 2.1)}</span>
        <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:17px;">Выгоднее вместе</span><span class="ui-sub" style="font-size:13px;">Продлите прокси и VPN одной оплатой</span></span>
      </div>
      <div class="ui-card ui-kv" style="box-shadow:none;background:var(--ui-fill);">
        ${combos.map((c) => `<div><span>${esc(c.durationDays)} дней</span><b>${esc(c.price)} <s class="ui-sub" style="font-weight:500;font-size:13px;">${esc(c.fullPrice)}</s></b></div>`).join("")}
      </div>
      <button class="ui-btn" style="background:#5E5CE6;" data-action="open-combo" data-plan-id="${esc(best.planId)}">Прокси + VPN — экономия до ${esc(best.save)} ₽</button>
      <span class="ui-caption" style="margin:0;text-align:center;">Дни прибавятся к текущей подписке прокси.</span>
    </article>`;
}

function vpnPaywall() {
  const v = userVpn();
  const expired = !!v.expiresAt;
  const perk = (icon, title, text) => `<div class="ui-step"><span class="ui-step-num icon">${uiIcon(icon, 18)}</span><span class="ui-step-text"><b>${title}</b><span>${text}</span></span></div>`;
  return `<section class="ui-stack">
    <div style="display:flex;flex-direction:column;gap:2px;padding:0 4px;">
      <h1 class="ui-h1" style="padding:0;">VPN</h1>
      <span class="ui-sub" style="font-size:15px;">ahmedov.vpn — для всех приложений и сайтов</span>
    </div>
    <article class="ui-hero ${expired ? "warn" : ""}" style="gap:12px;">
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:8px;">
        <span class="ui-hero-chip off" style="align-self:flex-start;"><i></i>${expired ? "Подписка VPN закончилась" : "Не подключено"}</span>
        <strong style="font-size:26px;line-height:31px;font-weight:800;letter-spacing:-0.5px;">${expired ? "Продлите VPN, чтобы снова подключаться" : "Свой VPN — в дополнение к прокси"}</strong>
        <span class="ui-hero-cap">Личная ссылка-подписка: серверы обновляются сами, ничего настраивать не нужно.</span>
      </div>
    </article>
    <div class="ui-card ui-pad ui-steps">
      ${perk("globe", "Все приложения и сайты", "Instagram, YouTube и другие сервисы — не только мессенджеры.")}
      ${perk("shield", "Работает при белых списках", "Мобильные серверы подключаются в LTE, даже когда интернет ограничен.")}
      ${perk("refresh", "Серверы обновляются сами", "Нерабочие убираются, новые добавляются в подписку.")}
      ${perk("bolt", "Подключение за минуту", "Приложение Happ или Incy и одна кнопка «Добавить».")}
    </div>
    ${vpnServerListSection(true)}
    ${vpnComboOffer()}
    <section class="ui-sec">
      <h2 class="ui-h2" style="padding:0 4px;">Тарифы VPN</h2>
      ${vpnBuyBlock()}
    </section>
  </section>`;
}


async function loadVpnList(force = false) {
  const l = state.vpnList;
  if (!state.token || l.loading || (l.loaded && !force)) return;
  setState({ vpnList: { ...l, loading: true, error: "" } });
  try {
    const data = await request("/vpn/servers", { headers: { Authorization: `Bearer ${state.token}` } });
    setState({ vpnList: { ...state.vpnList, loading: false, loaded: true, servers: data.servers || [], total: Number(data.total) || 0 } });
  } catch (e) {
    setState({ vpnList: { ...state.vpnList, loading: false, error: e.message || "Не удалось загрузить список серверов." } });
  }
}


function vpnProtocolLabel(s) {
  const p = String(s.protocol || "").toLowerCase();
  if (p === "hysteria" || p === "hysteria2") return "Hysteria2";
  if (p === "vless") return s.network && s.network !== "tcp" ? `VLESS · ${s.network}` : "VLESS";
  if (p === "vmess") return "VMess";
  if (p === "trojan") return "Trojan";
  if (p === "shadowsocks" || p === "ss") return "Shadowsocks";
  return p.toUpperCase();
}

function vpnGroupMeta(title) {
  const t = String(title || "").replace(/[^\p{L}\p{N}\s/]/gu, " ").replace(/\s+/g, " ").trim();
  if (/мобил/i.test(t)) return { label: "Мобильные · LTE", note: "Работают в мобильном интернете (LTE), даже когда включены белые списки." };
  if (/быстр/i.test(t)) return { label: "Быстрые", note: t ? `${t}. Для дома и Wi‑Fi.` : "" };
  if (/vless/i.test(t)) return { label: "Резервные", note: "Если серверы VLESS не подключаются — попробуйте эти." };
  if (/игр/i.test(t)) return { label: "Игровые", note: "Низкая задержка для игр и звонков (Hysteria2)." };
  if (/остальн/i.test(t)) return { label: "Остальные", note: "Дополнительные серверы в разных странах." };
  return { label: t || "Серверы", note: "" };
}

function vpnGroups(servers) {
  const groups = [];
  const auto = [];
  let current = null;
  servers.forEach((s) => {
    if (s.group) {
      current = { title: s.name, items: [] };
      groups.push(current);
      return;
    }
    if (s.auto) {
      auto.push(s);
      return;
    }
    if (!current) {
      current = { title: /мобил/i.test(s.name) ? "Мобильные" : "Основные", items: [] };
      groups.push(current);
    }
    current.items.push(s);
  });
  const out = groups.filter((g) => g.items.length).map((g, i) => ({ id: `g${i}`, ...vpnGroupMeta(g.title), items: g.items }));
  if (auto.length) out.push({ id: "auto", label: "Авто", note: "Приложение само выбирает самый быстрый сервер из группы.", items: auto });
  return out;
}

function vpnServerListSection(locked) {
  const l = state.vpnList;
  const head = (right = "") => `<div class="ui-sec-head"><h2 class="ui-h2">Серверы</h2>${right}</div>`;
  if (l.loading && !l.loaded) {
    return `<section class="ui-sec">${head()}${Array.from({ length: 4 }).map(() => `<div class="ui-skel"></div>`).join("")}</section>`;
  }
  if (l.error && !l.servers.length) {
    return `<section class="ui-sec">${head()}<div class="ui-card ui-empty">${esc(l.error)}<br><button class="ui-link" data-action="vpn-list-reload" style="margin-top:8px;">Повторить</button></div></section>`;
  }
  if (!l.servers.length) return "";

  const groups = vpnGroups(l.servers);
  const active = groups.find((g) => g.id === l.tab) || groups[0];
  const countries = new Set(l.servers.filter((s) => !s.group && s.cc && s.cc !== "EU").map((s) => s.cc)).size;
  const mobile = groups.find((g) => /мобил/i.test(g.label));

  const rows = active.items.map((s) => `<div class="ui-vpn-row">
      <span class="ui-cc">${esc(s.cc || "VPN")}</span>
      <span class="ui-server-text">
        <span class="ui-server-name">${esc(s.name)}</span>
        <span class="ui-server-host">${esc(vpnProtocolLabel(s))}</span>
      </span>
      ${s.auto ? `<span class="ui-badge">Авто</span>` : ""}
      ${locked ? `<span class="ui-chev" aria-label="Доступно после оплаты">${uiIcon("lock", 16, 2)}</span>` : `<span class="ui-dot ok" aria-hidden="true"></span>`}
    </div>`).join("");

  return `<section class="ui-sec">
    ${head(`<span class="ui-sub" style="font-size:14px;">${l.total} серверов · ${countries} стран</span>`)}
    ${mobile ? `<div class="ui-msg ok" style="display:flex;gap:10px;align-items:flex-start;"><span style="display:flex;flex-shrink:0;">${uiIcon("check", 18, 2.6)}</span><span><b>Работает при белых списках LTE</b> — ${mobile.items.length} мобильных серверов для мобильного интернета.</span></div>` : ""}
    <div class="ui-tabs-scroll" role="tablist" aria-label="Группы серверов">
      ${groups.map((g) => `<button class="ui-chip ${g.id === active.id ? "on" : ""}" role="tab" aria-selected="${g.id === active.id}" data-action="vpn-list-tab" data-tab="${g.id}">${esc(g.label)} · ${g.items.length}</button>`).join("")}
    </div>
    <div class="ui-card ui-servers">
      ${active.note ? `<div class="ui-caption" style="padding:12px 14px 10px;border-bottom:1px solid var(--ui-sep);">${esc(active.note)}</div>` : ""}
      <div class="ui-vpn-scroll">${rows}</div>
      ${active.items.length > 5 ? `<div class="ui-caption" style="padding:8px 14px;border-top:1px solid var(--ui-sep);text-align:center;">Листайте список — ${active.items.length} ${ruPlural(active.items.length, "сервер", "сервера", "серверов")}</div>` : ""}
    </div>
    <p class="ui-caption" style="margin:0;">${locked ? "Все эти серверы появятся в вашем приложении сразу после оплаты." : "Список обновляется сам — в приложении просто обновите подписку."}</p>
  </section>`;
}

function vpnTabScreen() {
  const sub = userVpn();
  if (!sub.active) return vpnPaywall();
  const days = Math.max(0, Number(sub.daysLeft) || 0);
  const copied = state.vpn.copiedRaw === sub.subUrl;
  return `<section class="ui-stack">
    <div style="display:flex;flex-direction:column;gap:2px;padding:0 4px;">
      <h1 class="ui-h1" style="padding:0;">VPN</h1>
      <span class="ui-sub" style="font-size:15px;">ahmedov.vpn · ваша личная подписка</span>
    </div>

    <article class="ui-hero ${days <= 7 ? "warn" : ""}" style="gap:12px;">
      <div class="ui-hero-top"><span class="ui-hero-chip"><i></i>${days <= 7 ? "VPN скоро закончится" : "VPN активен"}</span></div>
      <div class="ui-hero-bottom">
        <div><div class="ui-hero-num" style="font-size:44px;line-height:48px;">${days}</div><div class="ui-hero-cap">${ruPlural(days, "день", "дня", "дней")} · до ${esc(formatDateLong(sub.expiresAt))}</div></div>
        <button class="ui-hero-btn" data-action="vpn-open-buy">Продлить</button>
      </div>
    </article>

    <article class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:14px;">
      <strong style="font-size:17px;">Подключение за минуту</strong>
      <div class="ui-steps">
        <div class="ui-step"><span class="ui-step-num">1</span><span class="ui-step-text"><b>Установите Happ или Incy</b><span>Бесплатно в App Store и Google Play.</span></span></div>
        <div class="ui-step"><span class="ui-step-num">2</span><span class="ui-step-text"><b>Добавьте свою подписку</b><span>Нажмите кнопку своего приложения ниже.</span></span></div>
        <div class="ui-step"><span class="ui-step-num">3</span><span class="ui-step-text"><b>Включите VPN</b><span>Лучший сервер выберется автоматически.</span></span></div>
      </div>
      <div class="ui-grid2">
        <a class="ui-btn" style="height:50px;font-size:16px;" ${demoLock(`happ://add/${sub.subUrl || ""}`)}>Добавить в Happ</a>
        <a class="ui-btn" style="height:50px;font-size:16px;" ${demoLock(`incy://add/${sub.subUrl || ""}`)}>Добавить в Incy</a>
      </div>
      <a class="ui-btn ghost" style="height:44px;font-size:14px;" href="https://apps.apple.com/ru/app/incy/id6756943388" target="_blank" rel="noopener">Скачать Incy в App Store</a>
      <button class="ui-btn ghost" style="height:46px;" data-action="vpn-copy-sub" data-url="${esc(sub.subUrl || "")}">${uiIcon(copied ? "check" : "copy", 18)}${copied ? "Ссылка скопирована" : "Скопировать ссылку подписки"}</button>
      <p class="ui-caption" style="margin:0;">Ссылка личная — не передавайте её другим. Когда подписка закончится, в приложении появится сообщение «Подписка окончена».</p>
    </article>
    ${state.vpnBuyOpen ? `<section class="ui-sec" id="vpn-buy"><h2 class="ui-h2" style="padding:0 4px;">Продлить VPN</h2>${vpnBuyBlock()}</section>` : ""}
    ${vpnServerListSection(false)}
  </section>`;
}

function freeVpnScreen() {
  return vpnTabScreen();
}


// ==========================
// UI: админка
// ==========================

const ADMIN_PLAN_NAMES = { 301: "90 дней", 302: "180 дней", 303: "360 дней" };

function adminUserStatus(u) {
  const days = Number(u.daysLeft);
  if (!u.isActive) return { cls: "off", text: "Отключён" };
  if (!Number.isFinite(days) || days <= 0) return { cls: "off", text: "Истекла" };
  if (days <= 7) return { cls: "slow", text: "Скоро конец" };
  return { cls: "ok", text: "Активен" };
}

function adminBuckets(users) {
  const out = { all: users, active: [], soon: [], off: [], fresh: [], vpn: [], lapsed: [], winbackDue: [] };
  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  users.forEach((u) => {
    const st = adminUserStatus(u).cls;
    if (st === "ok" || st === "slow") out.active.push(u);
    if (st === "slow") out.soon.push(u);
    if (st === "off") out.off.push(u);
    if (u.vpnActive) out.vpn.push(u);
    // Ушедшие: подписка закончилась (до года назад)
    const left = Number(u.daysLeft);
    if (st === "off" && Number.isFinite(left) && left <= 0 && left >= -365) {
      out.lapsed.push(u);
      const wb = Date.parse(String(u.winbackAt || "").replace(" ", "T") + "Z");
      if (!Number.isFinite(wb) || Date.now() - wb > 14 * 24 * 3600 * 1000) out.winbackDue.push(u);
    }
    const created = Date.parse(String(u.createdAt || "").replace(" ", "T") + "Z");
    if (Number.isFinite(created) && created >= monthAgo) out.fresh.push(u);
  });
  return out;
}

function waLink(phone10, text) {
  return `https://wa.me/7${String(phone10 || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(text)}`;
}

function reminderText(u) {
  const date = formatDateOnly(u.expiresAt);
  const payUrl = `${location.origin}${paymentPath()}?phone=${u.phone}`;
  return `Здравствуйте! Ваша подписка ahmedov.proxy заканчивается ${date}. Продлить можно здесь: ${payUrl}`;
}

const WINBACK_PROMO_KEY = "ahmedov_winback_promo";
// Промокод предлагаем только тем, кто не платит долго (от 2 месяцев)
const WINBACK_PROMO_AFTER_DAYS = 60;

function winbackGetsPromo(u) {
  return Math.abs(Number(u.daysLeft) || 0) >= WINBACK_PROMO_AFTER_DAYS;
}

function winbackPromo() {
  if (typeof state.admin.winbackPromo !== "string") {
    try { state.admin.winbackPromo = localStorage.getItem(WINBACK_PROMO_KEY) || ""; } catch { state.admin.winbackPromo = ""; }
  }
  const code = state.admin.winbackPromo;
  return code ? (state.admin.promoCodes || []).find((p) => p.is_active && String(p.code) === code) || null : null;
}

function winbackText(u) {
  const ago = Math.abs(Number(u.daysLeft) || 0);
  const promo = winbackGetsPromo(u) ? winbackPromo() : null;
  const url = new URL(paymentPath(), location.origin);
  url.searchParams.set("phone", u.phone);
  if (promo) url.searchParams.set("promo", promo.code);
  const when = ago <= 1 ? "недавно закончилась" : `закончилась ${ago} ${ruPlural(ago, "день", "дня", "дней")} назад`;
  const offer = promo
    ? `Для вас скидка: прокси${({ 301: " на 90 дней", 302: " на 180 дней", 303: " на 360 дней" })[Number(promo.plan_id)] || ""} всего за ${promo.price_label || `${promo.discount_amount} ₽`} по промокоду ${promo.code} — он уже в ссылке.`
    : "Можно продлить прокси, а со скидкой — сразу вместе с VPN для всех сайтов и приложений.";
  return `Здравствуйте! Ваша подписка ahmedov.proxy ${when}. Будем рады вернуть вас! ${offer}\nОплатить: ${url.toString()}\nЕсли что-то не устроило — напишите, поможем.`;
}

function accessText(phone10, code) {
  const url = `${location.origin}${appPath()}?phone=${phone10}&invite=${code}`;
  return `Ваш доступ к ahmedov.proxy готов!\nКод доступа: ${code}\nОткройте ссылку — вход выполнится сам: ${url}`;
}

function adminTabbar() {
  const tab = state.admin.tab || "overview";
  const item = (id, icon, label) => `<button class="ui-tab ${tab === id ? "active" : ""}" role="tab" aria-selected="${tab === id}" data-action="admin-tab" data-tab="${id}">${uiIcon(tab === id ? icon + "Fill" : icon)}${label}</button>`;
  return `<nav class="ui-tabbar five" role="tablist" aria-label="Разделы админки">
    ${item("overview", "chart", "Обзор")}
    ${item("users", "users", "Клиенты")}
    ${item("payments", "card", "Оплаты")}
    ${item("proxies", "servers", "Серверы")}
    ${item("promo", "ticket", "Промо")}
  </nav>`;
}

function adminMessage() {
  const msg = state.admin.message;
  if (!msg) return "";
  return `<div class="ui-msg info ui-toast" role="status"><span style="flex:1;">${esc(msg)}</span><button class="ui-mini-icon" data-action="admin-dismiss" aria-label="Скрыть">${uiIcon("close", 14, 2.6)}</button></div>`;
}

function adminHead(title, actionsHtml = "") {
  return `<div class="ui-top" style="padding:0 4px;">
    <h1 class="ui-h1" style="padding:0;flex:1;min-width:0;">${title}</h1>
    ${actionsHtml}
  </div>`;
}

function adminSoonRow(u) {
  const days = Math.max(0, Number(u.daysLeft) || 0);
  return `<div class="ui-qrow" style="min-height:62px;">
    <span class="ui-qrow-text">
      <span class="ui-qrow-title" style="font-size:16px;">${esc(u.displayPhone)}</span>
      <span class="ui-qrow-sub">${days} ${ruPlural(days, "день", "дня", "дней")} · до ${esc(formatDateOnly(u.expiresAt))}</span>
    </span>
    <a class="ui-mini-icon wa" href="${esc(waLink(u.phone, reminderText(u)))}" target="_blank" rel="noopener" aria-label="Напомнить в WhatsApp">${uiIcon("wa", 18, 2.2)}</a>
    <button class="ui-btn-sm soft" data-action="admin-extend" data-phone="${esc(u.phone)}" data-days="30">+30 дн.</button>
  </div>`;
}

function adminOverview() {
  const a = state.admin;
  const users = a.users || [];
  const b = adminBuckets(users);
  const proxies = a.proxies || [];
  const online = proxies.filter((p) => p.isReachable).length;
  const checking = proxies.some((p) => p.isChecking);
  const byNet = (net) => {
    const list = proxies.filter((p) => p.network === net);
    return `${list.filter((p) => p.isReachable).length}/${list.length}`;
  };
  const soon = b.soon.slice().sort((x, y) => Number(x.daysLeft) - Number(y.daysLeft));
  const isDark = resolvedTheme() === "dark";
  const tile = (filter, label, value, color, sub) => `<button class="ui-card ui-tile" data-action="admin-users-filter" data-filter="${filter}">
      <span class="ui-tile-label">${label}</span>
      <span class="ui-tile-value" style="color:${color};">${value}</span>
      <span class="ui-sub" style="font-size:13px;">${sub}</span>
    </button>`;

  return `<section class="ui-stack">
    <header class="ui-top">
      <div class="ui-top-text"><span class="ui-sub">${greetingText()}</span><span class="ui-brand">Админка</span></div>
      <button class="ui-iconbtn" data-action="toggle-theme" aria-label="${isDark ? "Светлая тема" : "Тёмная тема"}">${uiIcon(isDark ? "sun" : "moon", 20)}</button>
      <button class="ui-iconbtn" data-action="logout" aria-label="Выйти">${uiIcon("logout", 20)}</button>
    </header>
    ${adminMessage()}

    <div class="ui-grid2">
      ${tile("all", "Клиентов", users.length, "var(--ui-text)", `+${b.fresh.length} за 30 дней`)}
      ${tile("active", "Активных", b.active.length, "var(--ui-green-text)", users.length ? `${Math.round((b.active.length / users.length) * 100)}% от всех` : "—")}
      ${tile("soon", "Скоро конец", b.soon.length, "var(--ui-orange-text)", "7 дней и меньше")}
      ${tile("off", "Неактивны", b.off.length, "var(--ui-red)", "истекли или отключены")}
    </div>
    ${(() => {
      const pend = (a.ozon?.orders || []).filter((o) => o.status === "pending" && o.claimedAt).length;
      return pend ? `<button class="ui-card ui-row-card" data-action="admin-tab" data-tab="payments" style="border-color:rgba(255,159,10,.4);">
        <span class="ui-row-icon" style="background:#FF9F0A;">${uiIcon("card", 18, 2.1)}</span>
        <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">Ждут подтверждения: ${pend}</span><span class="ui-sub" style="font-size:13px;">Клиенты оплатили через Ozon — проверьте и подтвердите</span></span>
        <span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span>
      </button>` : "";
    })()}

    ${b.winbackDue.length ? `<button class="ui-card ui-row-card" data-action="admin-users-filter" data-filter="lapsed">
        <span class="ui-row-icon" style="background:#FF375F;">${uiIcon("refresh", 18, 2.2)}</span>
        <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">Вернуть клиентов: ${b.winbackDue.length}</span><span class="ui-sub" style="font-size:13px;">Подписка закончилась, ещё не писали — сообщение готово</span></span>
        <span class="ui-chev">${uiIcon("chevron", 14, 2.6)}</span>
      </button>` : ""}

    <button class="ui-card ui-tile" data-action="admin-users-filter" data-filter="vpn">
      <span style="display:flex;justify-content:space-between;align-items:center;"><span class="ui-tile-label">VPN подключён</span><span class="ui-sub" style="font-size:13px;">${b.vpn.filter((u) => Number(u.vpnDaysLeft) <= 7).length} скоро закончится</span></span>
      <span class="ui-tile-value" style="color:#8E8CFF;">${b.vpn.length} <small>из ${b.active.length} активных</small></span>
    </button>

    <button class="ui-card ui-tile" data-action="admin-tab" data-tab="proxies">
      <span style="display:flex;justify-content:space-between;align-items:center;"><span class="ui-tile-label">Серверы в сети</span><span class="ui-sub" style="font-size:13px;">TG ${byNet("telegram")} · WA ${byNet("whatsapp")}</span></span>
      <span class="ui-tile-value">${checking && !online ? `<small>Проверяем…</small>` : `${online} <small>из ${proxies.length}</small>`}</span>
      <span class="ui-bar" aria-hidden="true"><span style="width:${proxies.length ? Math.round((online / proxies.length) * 100) : 0}%"></span></span>
    </button>

    <div class="ui-grid3">
      <button class="ui-card ui-feature" data-action="admin-new" data-kind="user">${uiIcon("users", 22)}<span>Клиент</span></button>
      <button class="ui-card ui-feature" data-action="admin-new" data-kind="proxy">${uiIcon("servers", 22)}<span>Сервер</span></button>
      <button class="ui-card ui-feature" data-action="admin-new" data-kind="promo">${uiIcon("ticket", 22)}<span>Промокод</span></button>
    </div>

    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Скоро закончится</h2>${soon.length > 5 ? `<button class="ui-link" data-action="admin-users-filter" data-filter="soon">Все ${soon.length}</button>` : ""}</div>
      ${soon.length
      ? `<div class="ui-card ui-list">${soon.slice(0, 5).map(adminSoonRow).join("")}</div>
           <p class="ui-caption" style="margin:0;">Зелёная кнопка откроет WhatsApp с готовым напоминанием и ссылкой на оплату.</p>`
      : `<div class="ui-card ui-empty" style="padding:20px;">На этой неделе ни у кого не заканчивается подписка.</div>`}
    </section>
  </section>`;
}

function adminUsersTab() {
  const a = state.admin;
  const users = a.users || [];
  const b = adminBuckets(users);
  const filter = a.userFilter || "all";
  const q = String(a.userSearch || "").replace(/\D/g, "");
  let list = b[filter] || users;
  if (q) list = list.filter((u) => String(u.phone || "").includes(q));
  list = sortAdminUsersByDays(list, a.userSort);
  const chips = [["all", "Все", users.length], ["active", "Активные", b.active.length], ["soon", "Скоро конец", b.soon.length], ["off", "Неактивны", b.off.length], ["lapsed", "Ушли", b.lapsed.length], ["vpn", "С VPN", b.vpn.length]];

  // Дольше всех не платят — наверху; кому уже писали — внизу
  if (filter === "lapsed") list = list.slice().sort((x, y) => (x.winbackAt ? 1 : 0) - (y.winbackAt ? 1 : 0) || Number(x.daysLeft) - Number(y.daysLeft));
  const isWinback = filter === "lapsed";
  const promoOn = winbackPromo();
  const winbackPanel = isWinback ? `<div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;">
      <strong style="font-size:16px;">Вернуть ушедших</strong>
      <span class="ui-sub" style="font-size:13px;margin-top:-4px;">Наверху — кто дольше всех не платит. Зелёная кнопка откроет WhatsApp с готовым сообщением и ссылкой на оплату. Кому уже писали — отмечено, они внизу списка.</span>
      <span class="ui-label">Промокод для тех, кто не платит 2 месяца и дольше</span>
      <div class="ui-chips" style="flex-wrap:wrap;">
        <button class="ui-chip ${!promoOn ? "on" : ""}" data-action="admin-winback-promo" data-code="">Без промокода</button>
        ${(a.promoCodes || []).filter((p) => p.is_active).map((p) => `<button class="ui-chip ${promoOn && promoOn.code === p.code ? "on" : ""}" data-action="admin-winback-promo" data-code="${esc(p.code)}">${esc(p.code)} · ${esc(p.price_label || `${p.discount_amount} ₽`)}</button>`).join("")}
      </div>
      ${(a.promoCodes || []).some((p) => p.is_active) ? `<span class="ui-caption" style="margin:0;">Тем, кто ушёл недавно, придёт обычное напоминание без скидки.</span>` : `<span class="ui-caption" style="margin:0;">Чтобы предложить скидку, создайте промокод во вкладке «Промо».</span>`}
    </div>` : "";

  const card = (u) => {
    const st = adminUserStatus(u);
    const days = Number(u.daysLeft);
    return `<article class="ui-card ui-pad ui-admin-card">
      <div class="ui-admin-card-top">
        <span class="ui-qrow-text">
          <span class="ui-qrow-title">${esc(u.displayPhone)}</span>
          <span class="ui-qrow-sub">${esc(u.subscriptionType || "—")} · до ${esc(formatDateOnly(u.expiresAt))}${Number.isFinite(days) ? ` · ${days} дн.` : ""}</span>
          ${isWinback ? `<span class="ui-qrow-sub" style="${u.winbackAt ? "color:var(--ui-green-text);font-weight:600;" : ""}">${u.winbackAt ? `Писали ${esc(adminTime(u.winbackAt))}` : `Не платит ${Math.abs(days)} ${ruPlural(Math.abs(days), "день", "дня", "дней")} · ещё не писали`}</span>
          ${winbackGetsPromo(u) && promoOn ? `<span class="ui-qrow-sub" style="color:var(--ui-orange-text);font-weight:600;">${uiIcon("tag", 13, 2.2)}В сообщении промокод ${esc(promoOn.code)}</span>` : ""}` : ""}
          ${u.vpnActive ? `<span class="ui-qrow-sub" style="color:#8E8CFF;font-weight:600;">${uiIcon("vpn", 13, 2.2)}VPN до ${esc(formatDateOnly(u.vpnExpiresAt))} · ${esc(u.vpnDaysLeft)} дн.</span>` : ""}
        </span>
        <span class="ui-tag ${st.cls}">${st.text}</span>
      </div>
      <div class="ui-admin-actions">
        ${u.inviteCode ? `<button class="ui-code-chip" data-action="copy-invite" data-code="${esc(u.inviteCode)}" aria-label="Скопировать код">${uiIcon("copy", 14)}${esc(u.inviteCode)}</button>` : `<span class="ui-sub" style="font-size:13px;flex:1;">Кода нет</span>`}
        ${isWinback
          ? `<a class="ui-mini-icon wa" href="${esc(waLink(u.phone, winbackText(u)))}" target="_blank" rel="noopener" data-action="admin-winback-sent" data-phone="${esc(u.phone)}" aria-label="Написать «вернитесь» в WhatsApp">${uiIcon("wa", 18, 2.2)}</a>`
          : `<a class="ui-mini-icon wa" href="${esc(waLink(u.phone, u.inviteCode ? accessText(u.phone, u.inviteCode) : reminderText(u)))}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">${uiIcon("wa", 18, 2.2)}</a>`}
        <button class="ui-mini-icon" data-action="admin-edit-user" data-phone="${esc(u.phone)}" aria-label="Изменить">${uiIcon("edit", 18)}</button>
        <button class="ui-mini-icon danger" data-action="admin-delete-user" data-phone="${esc(u.phone)}" aria-label="Удалить">${uiIcon("trash", 18)}</button>
      </div>
    </article>`;
  };

  return `<section class="ui-stack">
    ${adminHead("Клиенты", `<button class="ui-iconbtn" data-action="admin-sheet" data-sheet="import-users" aria-label="Импорт списком">${uiIcon("download", 20)}</button><button class="ui-iconbtn accent" data-action="admin-new" data-kind="user" aria-label="Добавить клиента">${uiIcon("plus", 22, 2.4)}</button>`)}
    ${adminMessage()}
    <div style="display:flex;gap:10px;">
      <div class="ui-field" style="flex:1;height:48px;border-radius:16px;"><label for="adm-search" style="position:absolute;left:-9999px;">Поиск по номеру</label><input id="adm-search" type="tel" inputmode="numeric" placeholder="Поиск по номеру" value="${esc(a.userSearch)}" data-input="admin-user-search" style="padding-left:16px;font-size:16px;font-weight:500;" /></div>
      <button class="ui-iconbtn" style="width:48px;height:48px;border-radius:16px;" data-action="admin-user-sort" aria-label="${a.userSort === "asc" ? "Сначала меньше дней" : "Сначала больше дней"}">${uiIcon(a.userSort === "asc" ? "chevron" : "chevron", 18, 2.4).replace("<svg", `<svg style="transform:rotate(${a.userSort === "asc" ? 90 : -90}deg)"`)}</button>
    </div>
    <div class="ui-chips">${chips.map(([id, label, n]) => `<button class="ui-chip ${filter === id ? "on" : ""}" data-action="admin-users-filter" data-filter="${id}">${label} · ${n}</button>`).join("")}</div>
    ${winbackPanel}
    ${a.loading && !users.length
      ? Array.from({ length: 4 }).map(() => `<div class="ui-skel" style="height:110px;"></div>`).join("")
      : list.length ? list.map(card).join("") : `<div class="ui-card ui-empty">Никого не нашли.</div>`}
  </section>`;
}

function adminProxiesTab() {
  const a = state.admin;
  const net = a.proxyFilter === "whatsapp" ? "whatsapp" : "telegram";
  const rows = (a.proxies || []).filter((p) => p.network === net);
  const isTg = net === "telegram";
  const row = (p) => {
    const parts = splitProxyName(p.name);
    const st = proxyStatus(p);
    return `<article class="ui-card ui-pad ui-admin-card" style="${p.isActive ? "" : "opacity:.62;"}">
      <div class="ui-admin-card-top">
        <span class="ui-cc">${esc(parts.cc || (isTg ? "TG" : "WA"))}</span>
        <span class="ui-qrow-text">
          <span class="ui-qrow-title" style="display:flex;align-items:center;gap:6px;">${esc(parts.name)}${p.isRecommended ? `<span class="ui-badge">by ahmedov</span>` : ""}</span>
          <span class="ui-qrow-sub">${esc(p.host)}:${esc(p.port)}</span>
        </span>
        <span class="ui-ping ${st.cls}">${esc(st.text)}</span>
      </div>
      <div class="ui-admin-actions">
        <label class="ui-switch-row"><input type="checkbox" class="ui-switch" ${p.isActive ? "checked" : ""} data-action="admin-toggle-proxy" data-id="${esc(p.id)}" aria-label="Показывать клиентам" /><span>${p.isActive ? "Включён" : "Выключен"}</span></label>
        <button class="ui-mini-icon" data-action="admin-edit-proxy" data-id="${esc(p.id)}" aria-label="Изменить">${uiIcon("edit", 18)}</button>
        <button class="ui-mini-icon danger" data-action="admin-delete-proxy" data-id="${esc(p.id)}" aria-label="Удалить">${uiIcon("trash", 18)}</button>
      </div>
    </article>`;
  };
  return `<section class="ui-stack">
    ${adminHead("Серверы", `<button class="ui-iconbtn" data-action="admin-sheet" data-sheet="import-proxies" aria-label="Импорт списком">${uiIcon("download", 20)}</button><button class="ui-iconbtn accent" data-action="admin-new" data-kind="proxy" aria-label="Добавить сервер">${uiIcon("plus", 22, 2.4)}</button>`)}
    ${adminMessage()}
    <div class="ui-seg" role="tablist" aria-label="Мессенджер">
      <button class="${isTg ? "on" : ""}" role="tab" aria-selected="${isTg}" data-action="admin-proxy-filter" data-network="telegram"><span class="ui-seg-ico tg">${uiIcon("tg", 12)}</span>Telegram</button>
      <button class="${!isTg ? "on" : ""}" role="tab" aria-selected="${!isTg}" data-action="admin-proxy-filter" data-network="whatsapp"><span class="ui-seg-ico wa">${uiIcon("wa", 12, 2.8)}</span>WhatsApp</button>
    </div>
    <p class="ui-caption" style="margin:0;">В сети ${rows.filter((p) => p.isReachable).length} из ${rows.length}. Выключенные серверы клиенты не видят.</p>
    ${a.loading && !rows.length
      ? Array.from({ length: 4 }).map(() => `<div class="ui-skel" style="height:110px;"></div>`).join("")
      : rows.length ? rows.map(row).join("") : `<div class="ui-card ui-empty">Серверов пока нет — добавьте первый.</div>`}
  </section>`;
}

function adminPromoTab() {
  const a = state.admin;
  const list = a.promoCodes || [];
  const card = (p) => `<article class="ui-card ui-pad ui-admin-card" style="${p.is_active ? "" : "opacity:.62;"}">
      <div class="ui-admin-card-top">
        <span class="ui-qrow-text">
          <span class="ui-qrow-title" style="font-size:20px;letter-spacing:.06em;">${esc(p.code)}</span>
          <span class="ui-qrow-sub">${esc(ADMIN_PLAN_NAMES[p.plan_id] || p.plan_id)} · цена ${esc(p.price_label || "—")}${Number(p.discount_amount) ? ` · к оплате ${esc(p.discount_amount)} ₽` : ""}</span>
        </span>
      </div>
      <div class="ui-admin-actions">
        <label class="ui-switch-row"><input type="checkbox" class="ui-switch" ${p.is_active ? "checked" : ""} data-action="admin-toggle-promo" data-id="${esc(p.id)}" aria-label="Промокод активен" /><span>${p.is_active ? "Активен" : "Выключен"}</span></label>
        <button class="ui-mini-icon" data-action="admin-edit-promo" data-id="${esc(p.id)}" aria-label="Изменить">${uiIcon("edit", 18)}</button>
        <button class="ui-mini-icon danger" data-action="admin-delete-promo" data-id="${esc(p.id)}" aria-label="Удалить">${uiIcon("trash", 18)}</button>
      </div>
    </article>`;
  return `<section class="ui-stack">
    ${adminHead("Промокоды", `<button class="ui-iconbtn accent" data-action="admin-new" data-kind="promo" aria-label="Добавить промокод">${uiIcon("plus", 22, 2.4)}</button>`)}
    ${adminMessage()}
    <p class="ui-caption" style="margin:0;">Клиент вводит промокод на странице оплаты и видит указанную здесь цену.</p>
    ${list.length ? list.map(card).join("") : `<div class="ui-card ui-empty">Промокодов пока нет.</div>`}
  </section>`;
}

function adminVpnBlock(u) {
  if (!u) return "";
  const active = !!u.vpnActive;
  const sendText = active && u.vpnUrl
    ? `Ваш VPN ahmedov.proxy подключён до ${formatDateOnly(u.vpnExpiresAt)}.\n1) Установите приложение Happ или Incy (App Store / Google Play)\n2) Добавьте вашу личную подписку: ${u.vpnUrl}\nИли откройте вкладку VPN в приложении ahmedov.proxy — там кнопки «Добавить в Happ» и «Добавить в Incy».`
    : "";
  return `<div class="ui-card ui-pad" style="background:var(--ui-fill);box-shadow:none;display:flex;flex-direction:column;gap:12px;margin-top:4px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="ui-row-icon" style="background:#5E5CE6;">${uiIcon("vpn", 18, 2.1)}</span>
      <span class="ui-qrow-text"><span class="ui-qrow-title" style="font-size:16px;">VPN</span>
        <span class="ui-qrow-sub">${active ? `Активен до ${esc(formatDateOnly(u.vpnExpiresAt))} · ${esc(u.vpnDaysLeft)} дн.` : u.vpnExpiresAt ? "Закончился" : "Не подключён"}</span></span>
    </div>
    <label class="ui-label" for="adm-vpn-days" style="padding:0;">Сколько дней VPN будет с сегодняшнего дня</label>
    <div class="ui-stepper">
      <button data-action="admin-vpn-step" data-delta="-30" aria-label="Минус 30 дней">−30</button>
      <button data-action="admin-vpn-step" data-delta="-1" aria-label="Минус 1 день">−1</button>
      <div class="ui-field"><input id="adm-vpn-days" type="number" inputmode="numeric" min="0" value="${esc(state.admin.vpnDays)}" data-input="admin-vpn-days" /></div>
      <button data-action="admin-vpn-step" data-delta="1" aria-label="Плюс 1 день">+1</button>
      <button data-action="admin-vpn-step" data-delta="30" aria-label="Плюс 30 дней">+30</button>
    </div>
    <div class="ui-chips">${[30, 90, 180, 360].map((d) => `<button class="ui-chip ${Number(state.admin.vpnDays) === d ? "on" : ""}" data-action="admin-vpn-preset" data-days="${d}">${d} дн.</button>`).join("")}${active ? `<button class="ui-chip" data-action="admin-vpn-preset" data-days="${Math.max(0, Number(u.vpnDaysLeft) || 0) + 30}">+30 к остатку</button>` : ""}</div>
    <span class="ui-caption" style="padding:0;">${Number(state.admin.vpnDays) > 0 ? `VPN будет до ${esc(formatDateOnly(new Date(Date.now() + Number(state.admin.vpnDays) * 86400000).toISOString()))}` : "0 дней — VPN будет отключён"}</span>
    <button class="ui-btn" style="height:50px;font-size:16px;" data-action="admin-vpn-save" data-phone="${esc(u.phone)}" ${state.admin.saving ? "disabled" : ""}>${active ? "Сохранить срок VPN" : "Выдать VPN"}</button>
    ${active ? `<div class="ui-grid2">
        <a class="ui-btn wa" style="height:46px;font-size:15px;" href="${esc(waLink(u.phone, sendText))}" target="_blank" rel="noopener">${uiIcon("wa", 18, 2.2)}Отправить</a>
        <button class="ui-btn ghost" style="height:46px;font-size:15px;background:var(--ui-card);" data-action="admin-copy" data-text="${esc(u.vpnUrl || "")}">${uiIcon("copy", 16)}Ссылка</button>
      </div>
      <div class="ui-grid2">
        <button class="ui-text-btn" style="height:38px;font-size:14px;" data-action="admin-vpn" data-mode="reset" data-phone="${esc(u.phone)}">Новая ссылка</button>
        <button class="ui-text-btn red" style="height:38px;font-size:14px;" data-action="admin-vpn" data-mode="off" data-phone="${esc(u.phone)}">Отключить VPN</button>
      </div>` : ""}
  </div>`;
}

function adminSheet() {
  const a = state.admin;
  const kind = a.sheet;
  if (!kind) return "";
  const shell = (title, body) => `<div class="ui-layer" data-action="admin-close-sheet">
    <article class="ui-sheet" data-action="admin-sheet-card" role="dialog" aria-label="${esc(title)}">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head" style="align-items:flex-start;text-align:left;padding-right:40px;">
        <button class="ui-sheet-close" data-action="admin-close-sheet" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <h2 class="ui-sheet-title" style="font-size:22px;">${title}</h2>
      </div>
      ${a.message ? `<div class="ui-msg info">${esc(a.message)}</div>` : ""}
      ${body}
    </article>
  </div>`;
  const field = (id, label, input) => `<div style="display:flex;flex-direction:column;gap:6px;"><label class="ui-label" for="${id}">${label}</label>${input}</div>`;
  const text = (id, dataInput, value, placeholder, type = "text", extra = "") => `<div class="ui-field" style="height:52px;border-radius:16px;box-shadow:none;background:var(--ui-fill);"><input id="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" data-input="${dataInput}" style="padding-left:16px;font-size:16px;font-weight:500;" ${extra} /></div>`;
  const sw = (dataInput, checked, label) => `<label class="ui-switch-row big"><span>${label}</span><input type="checkbox" class="ui-switch" data-input="${dataInput}" ${checked ? "checked" : ""} /></label>`;

  if (kind === "user") {
    const f = a.userForm;
    const exists = (a.users || []).some((u) => u.phone === normalizePhone(f.phone));
    const presets = [30, 90, 180, 360];
    return shell(exists ? "Изменить клиента" : "Новый клиент", `
      ${field("adm-u-phone", "Номер телефона", text("adm-u-phone", "admin-user-phone", f.phone, "+7 900 123 45 67", "tel", exists ? "readonly" : ""))}
      <div style="display:flex;flex-direction:column;gap:6px;">
        <span class="ui-label">${exists ? "Сколько дней будет с сегодняшнего дня" : "Срок подписки"}</span>
        <div class="ui-chips">${presets.map((d) => `<button class="ui-chip ${Number(f.duration_days) === d ? "on" : ""}" data-action="admin-plan-days" data-days="${d}">${d} дн.</button>`).join("")}</div>
      </div>
      <div class="ui-stepper">
        <button data-action="admin-user-step" data-delta="-30" aria-label="Минус 30 дней">−30</button>
        <button data-action="admin-user-step" data-delta="-1" aria-label="Минус 1 день">−1</button>
        <div class="ui-field" style="background:var(--ui-fill);"><label for="adm-u-days" style="position:absolute;left:-9999px;">Дней</label><input id="adm-u-days" type="number" inputmode="numeric" min="0" value="${esc(f.duration_days)}" data-input="admin-user-days" /></div>
        <button data-action="admin-user-step" data-delta="1" aria-label="Плюс 1 день">+1</button>
        <button data-action="admin-user-step" data-delta="30" aria-label="Плюс 30 дней">+30</button>
      </div>
      <span class="ui-caption" style="padding:0 6px;">${Number(f.duration_days) > 0 ? `Прокси будет до ${esc(formatDateOnly(new Date(Date.now() + Number(f.duration_days) * 86400000).toISOString()))}` : "0 дней — подписка закончится сегодня"}</span>
      ${field("adm-u-type", "Название тарифа", text("adm-u-type", "admin-user-type", f.subscription_type, "90 дней"))}
      ${sw("admin-user-active", f.is_active, "Доступ включён")}
      <button class="ui-btn" data-action="admin-save-user" ${a.saving ? "disabled" : ""}>${a.saving ? "Сохраняем…" : "Сохранить"}</button>
      ${exists ? "" : `<p class="ui-caption" style="margin:0;">После сохранения появится код доступа — его можно сразу отправить клиенту в WhatsApp.</p>`}
      ${exists ? adminVpnBlock((a.users || []).find((u) => u.phone === normalizePhone(f.phone))) : ""}`);
  }

  if (kind === "invite") {
    const phone = a.invitePhone || "";
    const code = a.lastInviteCode || "";
    return shell("Код доступа готов", `
      <div class="ui-card ui-amount" style="background:var(--ui-fill);box-shadow:none;">
        <span class="ui-sub" style="font-size:15px;">${esc(displayPhone(phone))}</span>
        <span class="ui-invite-code">${esc(code)}</span>
      </div>
      <a class="ui-btn wa" href="${esc(waLink(phone, accessText(phone, code)))}" target="_blank" rel="noopener">${uiIcon("wa", 20, 2.2)}Отправить в WhatsApp</a>
      <button class="ui-btn ghost" data-action="copy-invite" data-code="${esc(code)}">${uiIcon("copy", 18)}Скопировать код</button>
      <p class="ui-caption" style="margin:0;">В сообщении будет ссылка — по ней клиент войдёт без ввода кода.</p>`);
  }

  if (kind === "proxy") {
    const f = a.proxyForm;
    const isTg = f.network !== "whatsapp";
    return shell(f.id ? "Изменить сервер" : "Новый сервер", `
      <div class="ui-seg" role="tablist" aria-label="Мессенджер">
        <button class="${isTg ? "on" : ""}" data-action="admin-form-network" data-network="telegram"><span class="ui-seg-ico tg">${uiIcon("tg", 12)}</span>Telegram</button>
        <button class="${!isTg ? "on" : ""}" data-action="admin-form-network" data-network="whatsapp"><span class="ui-seg-ico wa">${uiIcon("wa", 12, 2.8)}</span>WhatsApp</button>
      </div>
      ${field("adm-p-name", "Название (можно с флагом 🇷🇺 в начале)", text("adm-p-name", "admin-proxy-name", f.name, "🇷🇺 TG Москва"))}
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:10px;">
        ${field("adm-p-host", "Хост", text("adm-p-host", "admin-proxy-host", f.host, "proxy.example.com"))}
        ${field("adm-p-port", "Порт", text("adm-p-port", "admin-proxy-port", f.port, "443", "number", 'inputmode="numeric"'))}
      </div>
      ${field("adm-p-url", "Ссылка подключения", text("adm-p-url", "admin-proxy-url", f.connect_url, isTg ? "tg://proxy?server=…" : "https://wa.me/proxy?host=…"))}
      ${sw("admin-proxy-active", f.is_active, "Показывать клиентам")}
      ${sw("admin-proxy-recommended", f.is_recommended, "Рекомендуемый (by ahmedov)")}
      <button class="ui-btn" data-action="admin-save-proxy" ${a.saving ? "disabled" : ""}>${a.saving ? "Сохраняем…" : "Сохранить"}</button>`);
  }

  if (kind === "promo") {
    const f = a.promoForm;
    return shell(f.id ? "Изменить промокод" : "Новый промокод", `
      ${field("adm-c-code", "Промокод", text("adm-c-code", "admin-promo-code", f.code, "PREM150", "text", 'autocapitalize="characters"'))}
      <div style="display:flex;flex-direction:column;gap:6px;">
        <span class="ui-label">Тариф</span>
        <div class="ui-chips">${[301, 302, 303].map((id) => `<button class="ui-chip ${Number(f.plan_id) === id ? "on" : ""}" data-action="admin-promo-select" data-plan-id="${id}">${ADMIN_PLAN_NAMES[id]}</button>`).join("")}</div>
      </div>
      <div class="ui-grid2">
        ${field("adm-c-disc", "К оплате, ₽", text("adm-c-disc", "admin-promo-discount", f.discount_amount || "", "150", "number", 'inputmode="numeric"'))}
        ${field("adm-c-price", "Цена для клиента", text("adm-c-price", "admin-promo-price-label", f.price_label, "340 ₽"))}
      </div>
      ${sw("admin-promo-active", f.is_active, "Промокод активен")}
      <button class="ui-btn" data-action="admin-save-promo" ${a.saving ? "disabled" : ""}>${a.saving ? "Сохраняем…" : "Сохранить"}</button>`);
  }

  if (kind === "import-users") {
    return shell("Импорт клиентов списком", `
      <p class="ui-caption" style="margin:0;">Одна строка — один клиент: <b>телефон | тариф | дней | активен (1 или 0)</b></p>
      <textarea class="ui-textarea" data-input="admin-bulk-users" placeholder="79001234567 | 90 дней | 90 | 1">${esc(a.bulkUsersText)}</textarea>
      <button class="ui-btn" data-action="admin-import-users" ${a.saving ? "disabled" : ""}>${a.saving ? "Импортируем…" : "Импортировать"}</button>`);
  }

  if (kind === "import-proxies") {
    return shell("Импорт серверов списком", `
      <p class="ui-caption" style="margin:0;">Сеть: <b>${a.proxyFilter === "whatsapp" ? "WhatsApp" : "Telegram"}</b> (как на экране «Серверы»). Строка: <b>название | хост | порт | ссылка | активен (1 или 0)</b></p>
      <textarea class="ui-textarea" data-input="admin-bulk-proxies" placeholder="🇩🇪 WA Германия | wa2.example.com | 10022 | https://wa.me/proxy?host=… | 1">${esc(a.bulkProxiesText)}</textarea>
      <button class="ui-btn" data-action="admin-import-proxies" ${a.saving ? "disabled" : ""}>${a.saving ? "Импортируем…" : "Импортировать"}</button>`);
  }
  return "";
}

function adminScreen() {
  const tab = state.admin.tab || "overview";
  const body = tab === "payments" ? adminPaymentsTab() : tab === "users" ? adminUsersTab() : tab === "proxies" ? adminProxiesTab() : tab === "promo" ? adminPromoTab() : adminOverview();
  return body + adminTabbar();
}

// ==========================
// Оплата по СБП через Ozon: заявка с уникальной суммой и ожидание поступления
// ==========================

const OZON_ORDER_KEY = "ahmedov_ozon_order";
const OZON_PAYER_KEY = "ahmedov_ozon_payer";

function ozonPayerValue() {
  if (typeof state.ozonPayer !== "string") {
    try { state.ozonPayer = localStorage.getItem(OZON_PAYER_KEY) || ""; } catch { state.ozonPayer = ""; }
  }
  return state.ozonPayer;
}

function ozonPayerField(id) {
  return `<div class="ui-form" style="margin-top:0;gap:6px;">
      <label class="ui-label" for="${id}">От чьего имени будет оплата</label>
      <div class="ui-field text"><input id="${id}" type="text" autocomplete="name" autocapitalize="words" spellcheck="false" placeholder="Например, Иван И." value="${esc(ozonPayerValue())}" data-input="ozon-payer" /></div>
      <span class="ui-caption" style="margin:0;padding:0 4px;">Имя и первая буква фамилии — как покажет банк. По нему мы найдём ваш перевод.</span>
    </div>`;
}
let ozonPollTimer = null;

function ozonSaveToken(token) {
  try {
    if (token) localStorage.setItem(OZON_ORDER_KEY, token);
    else localStorage.removeItem(OZON_ORDER_KEY);
  } catch { }
}

function ozonSavedToken() {
  try { return localStorage.getItem(OZON_ORDER_KEY) || ""; } catch { return ""; }
}

function ozonCurrent() {
  return isPaymentRoute() ? state.paymentPage.ozonOrder : state.ozonSheet;
}

function ozonSetOrder(order, extra = {}) {
  if (isPaymentRoute()) setPaymentPage({ ozonOrder: order, ...extra });
  else setState({ ozonSheet: order, ...extra });
}

function ozonStopPolling() {
  if (ozonPollTimer) clearInterval(ozonPollTimer);
  ozonPollTimer = null;
}

async function ozonPollOnce(token) {
  try {
    const data = await request(`/ozon/orders/${encodeURIComponent(token)}`);
    const order = data.order;
    if (!order) return;
    ozonSetOrder(order);
    if (order.status !== "pending") {
      ozonStopPolling();
      if (order.status === "paid") {
        ozonSaveToken("");
        if (!isPaymentRoute() && state.token) {
          try {
            const me = await api.me(state.token);
            setState({ subscription: me.subscription || state.subscription });
          } catch { }
        }
      }
    }
  } catch { }
}

function ozonStartPolling(token) {
  ozonStopPolling();
  ozonPollTimer = setInterval(() => {
    if (document.visibilityState === "visible") ozonPollOnce(token);
  }, 8000);
}

async function ozonStart(kind, planId) {
  const payer = String(ozonPayerValue() || "").replace(/\s+/g, " ").trim();
  if (payer.length < 2 || !/\p{L}{2}/u.test(payer)) {
    const msg = "Укажите, от чьего имени будет перевод — например, «Иван И.»";
    if (isPaymentRoute()) return setPaymentPage({ error: msg });
    return showToast(msg);
  }
  try { localStorage.setItem(OZON_PAYER_KEY, payer); } catch { }
  const body = { kind, plan_id: String(planId || ""), payer };
  const headers = {};
  if (kind === "vpn") {
    headers.Authorization = `Bearer ${state.token}`;
  } else {
    const p = state.paymentPage;
    body.phone = normalizePhone(p.phoneInput);
    if (!body.phone) return setPaymentPage({ error: "Укажите номер телефона, на который оформить подписку." });
    if (kind === "proxy" && p.promoData?.code) body.promoCode = p.promoData.code;
  }
  if (isPaymentRoute()) setPaymentPage({ ozonCreating: true, error: "" });
  else setState({ ozonCreating: true });
  try {
    const data = await request("/ozon/orders", { method: "POST", headers, body: JSON.stringify(body) });
    ozonSaveToken(data.order.token);
    ozonSetOrder(data.order, { ozonCreating: false });
    ozonStartPolling(data.order.token);
    window.scrollTo(0, 0);
  } catch (e) {
    if (isPaymentRoute()) setPaymentPage({ ozonCreating: false, error: e.message || "Не удалось создать заявку." });
    else setState({ ozonCreating: false });
    if (!isPaymentRoute()) showToast(e.message || "Не удалось создать заявку");
  }
}

async function ozonResume() {
  const token = ozonSavedToken();
  if (!token) return;
  try {
    const data = await request(`/ozon/orders/${encodeURIComponent(token)}`);
    const order = data.order;
    if (!order || order.status === "cancelled" || order.status === "expired") {
      ozonSaveToken("");
      return;
    }
    if (isPaymentRoute() ? order.kind === "vpn" : order.kind !== "vpn") return;
    ozonSetOrder(order);
    if (order.status === "pending") ozonStartPolling(token);
    else ozonSaveToken("");
  } catch { }
}

function ozonOrderView(o, inSheet) {
  if (!o) return "";
  if (o.status === "paid") {
    const isVpn = o.kind === "vpn";
    return `<div class="ui-card ui-amount" style="${inSheet ? "background:var(--ui-fill);box-shadow:none;" : ""}">
        <span class="ui-status-chip ok">${uiIcon("check", 15, 3)}Оплата получена</span>
        <span class="ui-amount-num" style="font-size:40px;line-height:46px;margin-top:6px;">${esc(o.amountLabel)}</span>
        <span class="ui-sub" style="font-size:15px;">${esc(o.planName)} · ${esc(o.displayPhone)}</span>
      </div>
      ${isVpn
      ? `<p class="ui-caption" style="margin:0;text-align:center;">VPN подключён — во вкладке VPN нажмите «Добавить в Happ» или «Добавить в Incy».</p>
           <button class="ui-btn" data-action="ozon-close">Готово</button>`
      : o.inviteCode
        ? `<div class="ui-card ui-amount" style="padding:16px;"><span class="ui-sub" style="font-size:15px;">Ваш код доступа</span><span class="ui-invite-code">${esc(o.inviteCode)}</span></div>
             ${o.kind === "combo" ? `<p class="ui-caption" style="margin:0;text-align:center;">VPN тоже подключён — в приложении откройте вкладку VPN.</p>` : ""}
             <button class="ui-btn" data-action="go-app-home" data-invite="${esc(o.inviteCode)}" data-phone="${esc(o.phone)}">Открыть приложение</button>`
        : `<p class="ui-caption" style="margin:0;text-align:center;">Подписка продлена — откройте приложение.</p>
             <button class="ui-btn" data-action="go-app-route">Открыть приложение</button>`}`;
  }
  if (o.status !== "pending") {
    return `<div class="ui-msg info">${o.status === "expired" ? "Время заявки истекло." : "Заявка отменена."} Если вы уже перевели деньги — напишите нам, проверим вручную.</div>
      ${contactButtons("pay-ozon")}
      <button class="ui-btn" data-action="ozon-new">Создать новую заявку</button>`;
  }
  const flat = inSheet ? "background:var(--ui-fill);box-shadow:none;" : "";
  const summary = `<span class="ui-sub" style="font-size:15px;">${esc(o.planName)} · ${esc(o.displayPhone)}</span>
      ${o.payer ? `<span class="ui-sub" style="font-size:14px;">Перевод от: <b style="color:var(--ui-text);">${esc(o.payer)}</b></span>` : ""}`;
  if (o.claimedAt) {
    return `<div class="ui-card ui-amount" style="${flat}">
        <span class="ui-status-chip"><span class="ui-spin"></span>Проверяем оплату</span>
        <span class="ui-amount-num" style="font-size:40px;line-height:46px;margin-top:6px;">${esc(o.amountLabel)}</span>
        ${summary}
      </div>
      <div class="ui-card ui-pad" style="display:flex;flex-direction:column;gap:10px;${flat}">
        <strong style="font-size:17px;">Отправьте чек администратору</strong>
        <span class="ui-sub" style="font-size:14px;margin-top:-4px;">Скриншот или файл чека из вашего банка. Сообщение уже готово — просто прикрепите чек.</span>
        ${contactButtons("pay-ozon")}
      </div>
      <div class="ui-card ui-pad ui-steps" style="${flat}">
        <div class="ui-step"><span class="ui-step-num icon">${uiIcon("clock", 18)}</span><span class="ui-step-text"><b>Обычно подтверждаем за 10–15 минут</b><span>Самое долгое — до 24 часов.</span></span></div>
        <div class="ui-step"><span class="ui-step-num icon">${uiIcon("check", 18, 2.6)}</span><span class="ui-step-text"><b>${o.kind === "vpn" ? "VPN включится сам" : "Доступ откроется здесь"}</b><span>${o.kind === "vpn" ? "Появится во вкладке VPN — страницу можно закрыть." : "После подтверждения на этой странице появится код входа. Её можно закрыть и открыть позже."}</span></span></div>
      </div>`;
  }
  return `<div class="ui-card ui-amount" style="${flat}">
      <span class="ui-sub" style="font-size:14px;">К оплате</span>
      <span class="ui-amount-num">${esc(o.amountLabel)}</span>
      ${summary}
    </div>
    <a class="ui-btn" href="${esc(o.payUrl)}" target="_blank" rel="noopener">${uiIcon("bank", 20, 2.1)}Оплатить ${esc(o.amountLabel)} в Ozon</a>
    <div class="ui-card ui-pad ui-steps" style="${flat}">
      <div class="ui-step"><span class="ui-step-num">1</span><span class="ui-step-text"><b>Оплатите по СБП</b><span>Откроется страница Ozon — выберите свой банк и переведите ${esc(o.amountLabel)}.</span></span></div>
      <div class="ui-step"><span class="ui-step-num">2</span><span class="ui-step-text"><b>Сохраните чек</b><span>Скриншот или файл чека из приложения банка.</span></span></div>
      <div class="ui-step"><span class="ui-step-num">3</span><span class="ui-step-text"><b>Вернитесь сюда</b><span>Нажмите «Я оплатил(а)» и отправьте чек администратору.</span></span></div>
    </div>
    <button class="ui-btn ghost" data-action="ozon-claim" data-token="${esc(o.token)}" ${state.ozonClaiming ? "disabled" : ""}>${uiIcon("check", 18, 2.6)}${state.ozonClaiming ? "Отправляем…" : "Я оплатил(а)"}</button>
    <button class="ui-text-btn red" data-action="ozon-cancel" data-token="${esc(o.token)}">Отменить заявку</button>`;
}

function ozonSheet() {
  const o = state.ozonSheet;
  if (!o || isPaymentRoute()) return "";
  return `<div class="ui-layer" data-action="ozon-close">
    <article class="ui-sheet" data-action="ozon-sheet-card" role="dialog" aria-label="Оплата через Ozon">
      <span class="ui-grabber" aria-hidden="true"></span>
      <div class="ui-sheet-head" style="align-items:flex-start;text-align:left;padding-right:40px;">
        <button class="ui-sheet-close" data-action="ozon-close" aria-label="Закрыть">${uiIcon("close", 14, 3)}</button>
        <h2 class="ui-sheet-title" style="font-size:22px;">Оплата по СБП</h2>
      </div>
      ${ozonOrderView(o, true)}
    </article>
  </div>`;
}

// ==========================
// Админка: вкладка «Оплаты»
// ==========================

function adminTime(value) {
  const t = Date.parse(String(value || "").replace(" ", "T") + "Z");
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadAdminOzon() {
  if (!state.token) return;
  try {
    const data = await request("/admin/ozon", { headers: { Authorization: `Bearer ${state.token}` } });
    setAdmin({ ozon: data });
  } catch (e) {
    setAdmin({ ozon: { error: e.message || "Не удалось загрузить оплаты." } });
  }
}

function adminPaymentsTab() {
  const a = state.admin;
  const z = a.ozon;
  const head = adminHead("Оплаты", `<button class="ui-iconbtn" data-action="admin-ozon-refresh" aria-label="Обновить">${uiIcon("refresh", 20)}</button>`);
  if (!z) return `<section class="ui-stack">${head}${Array.from({ length: 3 }).map(() => `<div class="ui-skel" style="height:110px;"></div>`).join("")}</section>`;
  if (z.error) return `<section class="ui-stack">${head}<div class="ui-msg err">${esc(z.error)}</div></section>`;

  const orders = z.orders || [];
  const pending = orders.filter((o) => o.status === "pending").sort((x, y) => (y.claimedAt ? 1 : 0) - (x.claimedAt ? 1 : 0));
  const claimedCount = pending.filter((o) => o.claimedAt).length;
  const paid = orders.filter((o) => o.status === "paid");
  const kindTag = (o) => o.kind === "vpn" ? `<span class="ui-badge" style="background:rgba(94,92,230,.2);color:#8E8CFF;">VPN</span>`
    : o.kind === "combo" ? `<span class="ui-badge" style="background:rgba(94,92,230,.2);color:#8E8CFF;">Прокси + VPN</span>` : `<span class="ui-badge">Прокси</span>`;

  const pendingCards = pending.map((o) => `<article class="ui-card ui-pad ui-admin-card">
      <div class="ui-admin-card-top">
        <span class="ui-qrow-text">
          <span class="ui-qrow-title" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">${esc(o.payer || "Имя не указано")} ${kindTag(o)}</span>
          <span class="ui-qrow-sub" style="white-space:normal;"><b style="color:var(--ui-text);">${esc(o.amountLabel)}</b> · ${esc(o.planName)} · ${esc(o.displayPhone)}${o.promoCode ? ` · промокод ${esc(o.promoCode)}` : ""}</span>
          <span class="ui-qrow-sub">${o.claimedAt ? `<span style="color:var(--ui-orange-text);font-weight:600;">Клиент оплатил · ${esc(adminTime(o.claimedAt))}</span>` : `Заявка создана ${esc(adminTime(o.createdAt))} · ещё не оплачено`}</span>
        </span>
      </div>
      <div class="ui-admin-actions">
        <button class="ui-btn" style="height:42px;font-size:15px;flex:1;" data-action="admin-ozon-confirm" data-id="${o.id}">Подтвердить</button>
        <a class="ui-mini-icon wa" href="${esc(waLink(o.phone, o.claimedAt ? `Здравствуйте! Проверяем вашу оплату ${o.amountLabel} (${o.planName}). Пришлите, пожалуйста, чек.` : `Здравствуйте! Видим вашу заявку на ${o.planName} (${o.amountLabel}). Подскажите, получилось оплатить?`))}" target="_blank" rel="noopener" aria-label="Написать клиенту">${uiIcon("wa", 18, 2.2)}</a>
        <button class="ui-mini-icon danger" data-action="admin-ozon-reject" data-id="${o.id}" aria-label="Отклонить">${uiIcon("close", 16, 2.6)}</button>
      </div>
    </article>`).join("");


  const paidRows = paid.slice(0, 30).map((o) => `<div class="ui-qrow" style="min-height:62px;">
      <span class="ui-qrow-text">
        <span class="ui-qrow-title" style="font-size:16px;display:flex;gap:6px;align-items:center;">${esc(o.amountLabel)} ${kindTag(o)}</span>
        <span class="ui-qrow-sub">${esc(o.displayPhone)}${o.payer ? ` · от ${esc(o.payer)}` : ""} · ${esc(o.planName)} · ${esc(adminTime(o.paidAt || o.createdAt))}</span>
      </span>
    </div>`).join("");

  return `<section class="ui-stack">
    ${head}
    ${adminMessage()}
    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Заявки</h2><span class="ui-sub" style="font-size:14px;">${claimedCount ? `${claimedCount} оплачено` : pending.length}</span></div>
      ${pending.length ? pendingCards : `<div class="ui-card ui-empty" style="padding:18px;">Новых заявок нет.</div>`}
      ${pending.length ? `<p class="ui-caption" style="margin:0;">Сверьте имя и сумму с уведомлением Ozon (или с чеком клиента) и нажмите «Подтвердить» — доступ выдастся сам. «Ещё не оплачено» — клиент создал заявку, но не нажал «Я оплатил(а)».</p>` : ""}
    </section>
    <section class="ui-sec">
      <div class="ui-sec-head"><h2 class="ui-h2">Оплачено</h2><span class="ui-sub" style="font-size:14px;">${paid.length}</span></div>
      ${paid.length ? `<div class="ui-card ui-list">${paidRows}</div>` : `<div class="ui-card ui-empty" style="padding:18px;">Пока нет оплат через Ozon.</div>`}
    </section>
  </section>`;
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
  } else if (!state.demo && (!state.token || !state.user || (state.role !== "admin" && !state.subscription))) {
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
      body += bottomBar();
    } else {
      body = serversScreen(state.activeTab);
      body += bottomBar();
    }
  }

  const uiMode = true;
  document.documentElement.classList.toggle("ui-mode", uiMode);
  app.classList.toggle("ui", uiMode);

  if (state.demo && !isPaymentRoute()) body = demoBanner() + body;
  app.innerHTML = body + ozonSheet() + (state.toast ? `<div class="ui-toast-float" role="status">${esc(state.toast)}</div>` : "") + demoSheet() + (state.role === "admin" && state.token ? adminSheet() : "") + legalModal() + installGuideModal() + (isPaymentRoute() ? "" : plansOverlay()) + (state.proxyConnectModal?.open ? proxyConnectModal(state.proxyConnectModal.connectUrl, state.proxyConnectModal.network) : "");


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

  const linkLogin = await tryAutoLoginFromUrl();
  if (linkLogin.status === "ok") {
    location.reload();
    return;
  }
  if (linkLogin.status === "fail") {
    // Показываем экран кода с уже подставленными номером и кодом и причиной ошибки
    localStorage.removeItem(TOKEN_KEY);
    state.token = "";
    setState({
      booting: false,
      authStep: "invite",
      pendingPhone: linkLogin.phone,
      phoneInput: formatPhoneInput(linkLogin.phone),
      inviteInput: linkLogin.invite,
      hint: linkLogin.message,
    });
    return;
  }

  if (!state.token) {
    const params = new URLSearchParams(location.search);
    let demoSaved = false;
    try { demoSaved = sessionStorage.getItem(DEMO_KEY) === "1"; } catch { }
    if (params.get("demo") === "1" || demoSaved) {
      if (params.has("demo")) history.replaceState({}, "", appPath());
      await enterDemo();
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
      void loadVpnList();
    } else {
      startSessionHeartbeat();
      ensureHomeProxies();
      void ozonResume();
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
    void loadAdminOzon();
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
  state.demo = false;
  state.demoSheet = false;
  try { sessionStorage.removeItem(DEMO_KEY); } catch { }
  state.vpnList = { loading: false, loaded: false, servers: [], total: 0, error: "", tab: "" };
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
    if ((payload.role || "user") === "admin") {
      stopSessionHeartbeat();
      await loadAdminAll();
    } else {
      startSessionHeartbeat();
      ensureHomeProxies();
      void ozonResume();
    }
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

  if (input === "ozon-payer") {
    state.ozonPayer = event.target.value;
    releaseTyping();
    return;
  }

  if (input === "admin-vpn-days") {
    state.admin.vpnDays = String(event.target.value).replace(/\D/g, "");
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
    releaseTyping();
    clearTimeout(window.__admSearchTimer);
    window.__admSearchTimer = setTimeout(() => render(), 250);
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
  if (state.pwaBlocked && !["show-install-guide", "hide-install-guide", "open-payment-page", "go-app-route", "demo-enter", "contact"].includes(action)) return;

  if (action === "contact") {
    const text = messageFor(el.dataset.msg || "");
    const ch = el.dataset.ch;
    if (!text) return;
    if (ch === "max") {
      const fallbackCopy = () => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch { }
        ta.remove();
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallbackCopy);
      else fallbackCopy();
      showToast("Текст скопирован — вставьте его в чат MAX");
      return;
    }
    event.preventDefault();
    const base = ch === "wa" ? SUPPORT_LINKS.whatsapp : SUPPORT_LINKS.telegram;
    window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return;
  }

  if (action === "demo-enter") {
    event.preventDefault();
    if (state.pwaBlocked || isPaymentRoute()) {
      location.assign(`${appPath()}?demo=1`);
      return;
    }
    await enterDemo();
    return;
  }
  if (state.demo) {
    if (["open-proxy-connect", "vpn-copy-sub", "demo-locked", "ozon-start"].includes(action)) {
      event.preventDefault();
      return setState({ demoSheet: true });
    }
    if (action === "demo-close") {
      if (!event.target.closest('[data-action="demo-close"]') && event.target.closest('[data-action="demo-sheet-card"]')) return;
      return setState({ demoSheet: false });
    }
    if (action === "demo-exit" || action === "logout") return logout();
    if (action === "extend-subscription") {
      openPaymentPage({ planId: Number(el.dataset.planId || 302) || 302 });
      return;
    }
    if (action === "refresh-proxies") return;
  }

  if (action === "open-combo") {
    openPaymentPage({ phone: state.user?.phone || "", planId: Number(el.dataset.planId) || 0, vpn: true });
    return;
  }
  if (action === "payment-toggle-vpn") {
    setPaymentPage({ withVpn: !!el.checked });
    return;
  }
  if (action === "ozon-start") {
    const kind = ["vpn", "combo"].includes(el.dataset.kind) ? el.dataset.kind : "proxy";
    const planId = kind === "vpn" ? el.dataset.planId : (state.paymentPage.selectedPlanId || state.paymentPage.plans?.[0]?.id);
    await ozonStart(kind, planId);
    return;
  }
  if (action === "ozon-claim") {
    const tok = el.dataset.token;
    setState({ ozonClaiming: true });
    try {
      const data = await request(`/ozon/orders/${encodeURIComponent(tok)}/paid`, { method: "POST" });
      if (data.order) ozonSetOrder(data.order);
      ozonStartPolling(tok);
      window.scrollTo(0, 0);
    } catch (e) {
      showToast(e.message || "Не получилось, попробуйте ещё раз");
    } finally {
      setState({ ozonClaiming: false });
    }
    return;
  }
  if (action === "ozon-cancel") {
    if (!window.confirm("Отменить заявку? Если вы уже перевели деньги — не отменяйте, дождитесь подтверждения.")) return;
    const tok = el.dataset.token;
    try { await request(`/ozon/orders/${encodeURIComponent(tok)}/cancel`, { method: "POST" }); } catch { }
    ozonStopPolling();
    ozonSaveToken("");
    ozonSetOrder(null);
    return;
  }
  if (action === "ozon-new") {
    ozonStopPolling();
    ozonSaveToken("");
    ozonSetOrder(null);
    return;
  }
  if (action === "ozon-close") {
    if (!event.target.closest('[data-action="ozon-close"]') && event.target.closest('[data-action="ozon-sheet-card"]')) return;
    if (state.ozonSheet?.status === "pending" && !state.ozonSheet.claimedAt && !window.confirm("Закрыть? Если уже оплатили — сначала нажмите «Я оплатил(а)».")) return;
    if (state.ozonSheet?.status !== "pending") ozonStopPolling();
    return setState({ ozonSheet: null });
  }

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
    await paymentApplyPromo();
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

    const isNet = ["telegram", "whatsapp"].includes(tab);
    setState(isNet ? { activeTab: tab, lastNetwork: tab } : { activeTab: tab });
    localStorage.setItem(TAB_KEY, tab);
    window.scrollTo(0, 0);
    const list = isNet ? state.proxies[tab] || [] : [];
    const fresh = list.length && list.every((x) => x.lastCheckedAt && Date.now() - Date.parse(x.lastCheckedAt) < 60 * 1000);
    const inProgress = list.some((x) => x.isChecking);
    if (isNet && !fresh && !inProgress) await loadUserProxies(tab);
    if (tab === "home") ensureHomeProxies();
    if (tab === "vpn" || tab === "free-vpn") void loadVpnList();
    return;
  }




  if (action === "vpn-list-tab") return setState({ vpnList: { ...state.vpnList, tab: el.dataset.tab } });
  if (action === "vpn-list-reload") return loadVpnList(true);
  if (action === "vpn-select-plan") {
    return setState({ vpnPlanId: el.dataset.planId });
  }
  if (action === "vpn-open-buy") {
    setState({ vpnBuyOpen: true });
    requestAnimationFrame(() => document.getElementById("vpn-buy")?.scrollIntoView({ behavior: "smooth" }));
    return;
  }
  if (action === "vpn-copy-sub") {
    const url = el.dataset.url || "";
    if (!url) return;
    try { await navigator.clipboard.writeText(url); } catch { }
    state.vpn.copiedRaw = url;
    render();
    setTimeout(() => { if (state.vpn.copiedRaw === url) { state.vpn.copiedRaw = ""; render(); } }, 1600);
    return;
  }




  if (state.role !== "admin") return;

  if (action === "admin-tab") {
    const tab = el.dataset.tab || "overview";
    setAdmin({ tab, sheet: null });
    window.scrollTo(0, 0);
    if (tab === "proxies") await refreshAdminProxies();
    if (tab === "payments") await loadAdminOzon();
    return;
  }
  if (action === "admin-ozon-refresh") {
    await loadAdminOzon();
    setAdmin({ message: "Список оплат обновлён." });
    return;
  }
  if (action === "admin-ozon-confirm" || action === "admin-ozon-reject") {
    const id = el.dataset.id;
    const confirmText = action === "admin-ozon-confirm" ? "Подтвердить оплату и выдать доступ?" : "Отклонить заявку?";
    if (!window.confirm(confirmText)) return;
    setAdmin({ saving: true });
    try {
      const res = await request(`/admin/ozon/${id}/${action === "admin-ozon-confirm" ? "confirm" : "reject"}`, { method: "POST", headers: { Authorization: `Bearer ${state.token}` } });
      await loadAdminOzon();
      await loadAdminAll();
      setAdmin({ message: res.message || "Готово." });
    } catch (e) {
      setAdmin({ message: e.message || "Не получилось." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }
  if (action === "admin-winback-promo") {
    const code = el.dataset.code || "";
    try { localStorage.setItem(WINBACK_PROMO_KEY, code); } catch { }
    return setAdmin({ winbackPromo: code });
  }
  if (action === "admin-winback-sent") {
    // ссылка откроется сама; отмечаем, что написали
    const phone = el.dataset.phone;
    const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    setTimeout(() => setAdmin({ users: (state.admin.users || []).map((u) => (u.phone === phone ? { ...u, winbackAt: stamp } : u)) }), 400);
    request(`/admin/users/${encodeURIComponent(phone)}/winback`, { method: "POST", headers: { Authorization: `Bearer ${state.token}` } }).catch(() => { });
    return;
  }
  if (action === "admin-users-filter") {
    setAdmin({ tab: "users", userFilter: el.dataset.filter || "all" });
    window.scrollTo(0, 0);
    return;
  }
  if (action === "admin-dismiss") return setAdmin({ message: "" });
  if (action === "admin-sheet") return setAdmin({ sheet: el.dataset.sheet || null, message: "" });
  if (action === "admin-close-sheet") {
    const clickedClose = !!event.target.closest('[data-action="admin-close-sheet"]');
    if (!clickedClose && event.target.closest('[data-action="admin-sheet-card"]')) return;
    return setAdmin({ sheet: null });
  }
  if (action === "admin-new") {
    const kind = el.dataset.kind;
    if (kind === "user") return setAdmin({ message: "", sheet: "user", userForm: { phone: "", subscription_type: "90 дней", duration_days: 90, is_active: true } });
    if (kind === "proxy") return setAdmin({ message: "", sheet: "proxy", proxyForm: { id: null, network: state.admin.proxyFilter || "telegram", name: "", host: "", port: 443, connect_url: "", is_active: true, is_recommended: false } });
    if (kind === "promo") return setAdmin({ message: "", sheet: "promo", promoForm: { id: null, code: "", plan_id: 301, discount_amount: 0, price_label: "", is_active: true } });
    return;
  }
  if (action === "admin-plan-days") {
    const days = Number(el.dataset.days || 0);
    return setAdmin({ userForm: { ...state.admin.userForm, duration_days: days, subscription_type: `${days} дней` } });
  }
  if (action === "admin-form-network") {
    return setAdmin({ proxyForm: { ...state.admin.proxyForm, network: el.dataset.network === "whatsapp" ? "whatsapp" : "telegram" } });
  }
  if (action === "admin-user-step") {
    const next = Math.max(0, (Number(state.admin.userForm.duration_days) || 0) + Number(el.dataset.delta || 0));
    return setAdmin({ userForm: { ...state.admin.userForm, duration_days: next } });
  }
  if (action === "admin-vpn-step") {
    const next = Math.max(0, (Number(state.admin.vpnDays) || 0) + Number(el.dataset.delta || 0));
    return setAdmin({ vpnDays: next });
  }
  if (action === "admin-vpn-preset") return setAdmin({ vpnDays: Number(el.dataset.days || 0) });
  if (action === "admin-vpn-save") {
    const phone = el.dataset.phone;
    const days = Math.max(0, Number(state.admin.vpnDays) || 0);
    if (days === 0 && !window.confirm(`Отключить VPN у ${displayPhone(phone)}? Ссылка перестанет работать.`)) return;
    setAdmin({ saving: true });
    try {
      await api.adminVpn(state.token, phone, days > 0 ? { mode: "set", days } : { mode: "off" });
      await loadAdminAll();
      setAdmin({ message: days > 0 ? `VPN: ${days} ${ruPlural(days, "день", "дня", "дней")} с сегодняшнего дня.` : "VPN отключён." });
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось изменить VPN." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }
  if (action === "admin-vpn") {
    const phone = el.dataset.phone;
    const mode = el.dataset.mode;
    const days = Number(el.dataset.days || 0);
    if (mode === "off" && !window.confirm(`Отключить VPN у ${displayPhone(phone)}? Ссылка перестанет работать.`)) return;
    if (mode === "reset" && !window.confirm("Выдать новую ссылку? Старая перестанет работать — клиенту нужно будет добавить новую в Incy.")) return;
    setAdmin({ saving: true });
    try {
      await api.adminVpn(state.token, phone, { mode, days });
      const msg = mode === "off" ? "VPN отключён." : mode === "reset" ? "Выдана новая ссылка VPN." : `VPN: +${days} дней.`;
      await loadAdminAll();
      setAdmin({ message: msg });
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось изменить VPN." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }
  if (action === "admin-copy") {
    const text = el.dataset.text || "";
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { }
    setAdmin({ message: "Ссылка скопирована." });
    return;
  }
  if (action === "admin-extend") {
    const u = state.admin.users.find((x) => String(x.phone) === String(el.dataset.phone));
    if (!u) return;
    const add = Number(el.dataset.days || 30);
    const base = Math.max(0, Number(u.daysLeft) || 0);
    setAdmin({ saving: true });
    try {
      await api.adminUpdateUser(state.token, u.phone, { duration_days: base + add, is_active: true, subscription_type: u.subscriptionType });
      setAdmin({ message: `${u.displayPhone}: подписка продлена на ${add} дней.` });
      await loadAdminAll();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось продлить подписку." });
    } finally {
      setAdmin({ saving: false });
    }
    return;
  }

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
      setAdmin({ message: `Код ${code} скопирован.` });
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
        userForm: { phone: "", subscription_type: "90 дней", duration_days: 90, is_active: true },
        message: resp?.inviteCode ? "" : "Клиент сохранён.",
        lastInviteCode: resp?.inviteCode || "",
        invitePhone: phone,
        sheet: resp?.inviteCode ? "invite" : null,
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
        sheet: null,
        message: `Импортировано клиентов: ${parsed.rows.length}`,
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
      sheet: "user",
      message: "",
      vpnDays: u.vpnActive ? Math.max(0, Number(u.vpnDaysLeft) || 0) : 30,
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
    if (!window.confirm(`Удалить клиента ${displayPhone(el.dataset.phone)}? Это нельзя отменить.`)) return;
    setAdmin({ saving: true });
    try {
      await api.adminDeleteUser(state.token, el.dataset.phone);
      setAdmin({ message: "Клиент удалён." });
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
    setAdmin({ saving: true, message: "" });
    try {
      if (f.id) await api.adminUpdateProxy(state.token, f.id, payload);
      else await api.adminCreateProxy(state.token, payload);
      setAdmin({
        proxyFilter: f.network,
        proxyForm: { id: null, network: "telegram", name: "", host: "", port: 443, connect_url: "", is_active: true, is_recommended: false },
        sheet: null,
        message: "Сервер сохранён.",
      });
      await refreshAdminProxies();
    } catch (e) {
      setAdmin({ message: e.message || "Не удалось сохранить сервер." });
    } finally {
      setAdmin({ saving: false });
    }
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
        sheet: null,
        message: `Импортировано серверов: ${parsed.rows.length}`,
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
      sheet: "proxy",
      message: "",
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
    if (!window.confirm("Удалить этот сервер?")) return;
    setAdmin({ saving: true });
    try {
      await api.adminDeleteProxy(state.token, el.dataset.id);
      setAdmin({ message: "Сервер удалён." });
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
        sheet: null,
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
      sheet: "promo",
      message: "",
      promoForm: { id: p.id, code: p.code, plan_id: p.plan_id, discount_amount: p.discount_amount, price_label: p.price_label, is_active: !!p.is_active },
    });
    return;
  }

  if (action === "admin-delete-promo") {
    if (!window.confirm("Удалить этот промокод?")) return;
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
