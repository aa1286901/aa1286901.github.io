(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) s(n);
  new MutationObserver((n) => {
    for (const r of n)
      if (r.type === "childList")
        for (const l of r.addedNodes)
          l.tagName === "LINK" && l.rel === "modulepreload" && s(l);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(n) {
    const r = {};
    return (
      n.integrity && (r.integrity = n.integrity),
      n.referrerPolicy && (r.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : n.crossOrigin === "anonymous"
        ? (r.credentials = "omit")
        : (r.credentials = "same-origin"),
      r
    );
  }
  function s(n) {
    if (n.ep) return;
    n.ep = !0;
    const r = e(n);
    fetch(n.href, r);
  }
})();
function le(i) {
  return (
    i !== null &&
    typeof i == "object" &&
    "constructor" in i &&
    i.constructor === Object
  );
}
function se(i, t) {
  i === void 0 && (i = {}),
    t === void 0 && (t = {}),
    Object.keys(t).forEach((e) => {
      typeof i[e] > "u"
        ? (i[e] = t[e])
        : le(t[e]) &&
          le(i[e]) &&
          Object.keys(t[e]).length > 0 &&
          se(i[e], t[e]);
    });
}
const ge = {
  body: {},
  addEventListener() {},
  removeEventListener() {},
  activeElement: { blur() {}, nodeName: "" },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return { initEvent() {} };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {},
      getElementsByTagName() {
        return [];
      },
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: "",
  },
};
function F() {
  const i = typeof document < "u" ? document : {};
  return se(i, ge), i;
}
const Pe = {
  document: ge,
  navigator: { userAgent: "" },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: "",
  },
  history: { replaceState() {}, pushState() {}, go() {}, back() {} },
  CustomEvent: function () {
    return this;
  },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      },
    };
  },
  Image() {},
  Date() {},
  screen: {},
  setTimeout() {},
  clearTimeout() {},
  matchMedia() {
    return {};
  },
  requestAnimationFrame(i) {
    return typeof setTimeout > "u" ? (i(), null) : setTimeout(i, 0);
  },
  cancelAnimationFrame(i) {
    typeof setTimeout > "u" || clearTimeout(i);
  },
};
function A() {
  const i = typeof window < "u" ? window : {};
  return se(i, Pe), i;
}
function Me(i) {
  return (
    i === void 0 && (i = ""),
    i
      .trim()
      .split(" ")
      .filter((t) => !!t.trim())
  );
}
function Ie(i) {
  const t = i;
  Object.keys(t).forEach((e) => {
    try {
      t[e] = null;
    } catch {}
    try {
      delete t[e];
    } catch {}
  });
}
function Q(i, t) {
  return t === void 0 && (t = 0), setTimeout(i, t);
}
function R() {
  return Date.now();
}
function Ce(i) {
  const t = A();
  let e;
  return (
    t.getComputedStyle && (e = t.getComputedStyle(i, null)),
    !e && i.currentStyle && (e = i.currentStyle),
    e || (e = i.style),
    e
  );
}
function Le(i, t) {
  t === void 0 && (t = "x");
  const e = A();
  let s, n, r;
  const l = Ce(i);
  return (
    e.WebKitCSSMatrix
      ? ((n = l.transform || l.webkitTransform),
        n.split(",").length > 6 &&
          (n = n
            .split(", ")
            .map((o) => o.replace(",", "."))
            .join(", ")),
        (r = new e.WebKitCSSMatrix(n === "none" ? "" : n)))
      : ((r =
          l.MozTransform ||
          l.OTransform ||
          l.MsTransform ||
          l.msTransform ||
          l.transform ||
          l
            .getPropertyValue("transform")
            .replace("translate(", "matrix(1, 0, 0, 1,")),
        (s = r.toString().split(","))),
    t === "x" &&
      (e.WebKitCSSMatrix
        ? (n = r.m41)
        : s.length === 16
        ? (n = parseFloat(s[12]))
        : (n = parseFloat(s[4]))),
    t === "y" &&
      (e.WebKitCSSMatrix
        ? (n = r.m42)
        : s.length === 16
        ? (n = parseFloat(s[13]))
        : (n = parseFloat(s[5]))),
    n || 0
  );
}
function B(i) {
  return (
    typeof i == "object" &&
    i !== null &&
    i.constructor &&
    Object.prototype.toString.call(i).slice(8, -1) === "Object"
  );
}
function Oe(i) {
  return typeof window < "u" && typeof window.HTMLElement < "u"
    ? i instanceof HTMLElement
    : i && (i.nodeType === 1 || i.nodeType === 11);
}
function z() {
  const i = Object(arguments.length <= 0 ? void 0 : arguments[0]),
    t = ["__proto__", "constructor", "prototype"];
  for (let e = 1; e < arguments.length; e += 1) {
    const s = e < 0 || arguments.length <= e ? void 0 : arguments[e];
    if (s != null && !Oe(s)) {
      const n = Object.keys(Object(s)).filter((r) => t.indexOf(r) < 0);
      for (let r = 0, l = n.length; r < l; r += 1) {
        const o = n[r],
          a = Object.getOwnPropertyDescriptor(s, o);
        a !== void 0 &&
          a.enumerable &&
          (B(i[o]) && B(s[o])
            ? s[o].__swiper__
              ? (i[o] = s[o])
              : z(i[o], s[o])
            : !B(i[o]) && B(s[o])
            ? ((i[o] = {}), s[o].__swiper__ ? (i[o] = s[o]) : z(i[o], s[o]))
            : (i[o] = s[o]));
      }
    }
  }
  return i;
}
function N(i, t, e) {
  i.style.setProperty(t, e);
}
function ve(i) {
  let { swiper: t, targetPosition: e, side: s } = i;
  const n = A(),
    r = -t.translate;
  let l = null,
    o;
  const a = t.params.speed;
  (t.wrapperEl.style.scrollSnapType = "none"),
    n.cancelAnimationFrame(t.cssModeFrameID);
  const d = e > r ? "next" : "prev",
    c = (p, u) => (d === "next" && p >= u) || (d === "prev" && p <= u),
    f = () => {
      (o = new Date().getTime()), l === null && (l = o);
      const p = Math.max(Math.min((o - l) / a, 1), 0),
        u = 0.5 - Math.cos(p * Math.PI) / 2;
      let m = r + u * (e - r);
      if ((c(m, e) && (m = e), t.wrapperEl.scrollTo({ [s]: m }), c(m, e))) {
        (t.wrapperEl.style.overflow = "hidden"),
          (t.wrapperEl.style.scrollSnapType = ""),
          setTimeout(() => {
            (t.wrapperEl.style.overflow = ""), t.wrapperEl.scrollTo({ [s]: m });
          }),
          n.cancelAnimationFrame(t.cssModeFrameID);
        return;
      }
      t.cssModeFrameID = n.requestAnimationFrame(f);
    };
  f();
}
function re(i) {
  return (
    i.querySelector(".swiper-slide-transform") ||
    (i.shadowRoot && i.shadowRoot.querySelector(".swiper-slide-transform")) ||
    i
  );
}
function k(i, t) {
  t === void 0 && (t = "");
  const e = [...i.children];
  return (
    i instanceof HTMLSlotElement && e.push(...i.assignedElements()),
    t ? e.filter((s) => s.matches(t)) : e
  );
}
function ze(i, t) {
  const e = t.contains(i);
  return !e && t instanceof HTMLSlotElement
    ? [...t.assignedElements()].includes(i)
    : e;
}
function H(i) {
  try {
    console.warn(i);
    return;
  } catch {}
}
function W(i, t) {
  t === void 0 && (t = []);
  const e = document.createElement(i);
  return e.classList.add(...(Array.isArray(t) ? t : Me(t))), e;
}
function Ae(i, t) {
  const e = [];
  for (; i.previousElementSibling; ) {
    const s = i.previousElementSibling;
    t ? s.matches(t) && e.push(s) : e.push(s), (i = s);
  }
  return e;
}
function Ge(i, t) {
  const e = [];
  for (; i.nextElementSibling; ) {
    const s = i.nextElementSibling;
    t ? s.matches(t) && e.push(s) : e.push(s), (i = s);
  }
  return e;
}
function $(i, t) {
  return A().getComputedStyle(i, null).getPropertyValue(t);
}
function de(i) {
  let t = i,
    e;
  if (t) {
    for (e = 0; (t = t.previousSibling) !== null; )
      t.nodeType === 1 && (e += 1);
    return e;
  }
}
function ke(i, t) {
  const e = [];
  let s = i.parentElement;
  for (; s; ) t ? s.matches(t) && e.push(s) : e.push(s), (s = s.parentElement);
  return e;
}
function Ve(i, t) {
  function e(s) {
    s.target === i && (t.call(i, s), i.removeEventListener("transitionend", e));
  }
  t && i.addEventListener("transitionend", e);
}
function ce(i, t, e) {
  const s = A();
  return e
    ? i[t === "width" ? "offsetWidth" : "offsetHeight"] +
        parseFloat(
          s
            .getComputedStyle(i, null)
            .getPropertyValue(t === "width" ? "margin-right" : "margin-top")
        ) +
        parseFloat(
          s
            .getComputedStyle(i, null)
            .getPropertyValue(t === "width" ? "margin-left" : "margin-bottom")
        )
    : i.offsetWidth;
}
let q;
function De() {
  const i = A(),
    t = F();
  return {
    smoothScroll:
      t.documentElement &&
      t.documentElement.style &&
      "scrollBehavior" in t.documentElement.style,
    touch: !!(
      "ontouchstart" in i ||
      (i.DocumentTouch && t instanceof i.DocumentTouch)
    ),
  };
}
function we() {
  return q || (q = De()), q;
}
let Y;
function $e(i) {
  let { userAgent: t } = i === void 0 ? {} : i;
  const e = we(),
    s = A(),
    n = s.navigator.platform,
    r = t || s.navigator.userAgent,
    l = { ios: !1, android: !1 },
    o = s.screen.width,
    a = s.screen.height,
    d = r.match(/(Android);?[\s\/]+([\d.]+)?/);
  let c = r.match(/(iPad).*OS\s([\d_]+)/);
  const f = r.match(/(iPod)(.*OS\s([\d_]+))?/),
    p = !c && r.match(/(iPhone\sOS|iOS)\s([\d_]+)/),
    u = n === "Win32";
  let m = n === "MacIntel";
  const h = [
    "1024x1366",
    "1366x1024",
    "834x1194",
    "1194x834",
    "834x1112",
    "1112x834",
    "768x1024",
    "1024x768",
    "820x1180",
    "1180x820",
    "810x1080",
    "1080x810",
  ];
  return (
    !c &&
      m &&
      e.touch &&
      h.indexOf(`${o}x${a}`) >= 0 &&
      ((c = r.match(/(Version)\/([\d.]+)/)),
      c || (c = [0, 1, "13_0_0"]),
      (m = !1)),
    d && !u && ((l.os = "android"), (l.android = !0)),
    (c || p || f) && ((l.os = "ios"), (l.ios = !0)),
    l
  );
}
function Se(i) {
  return i === void 0 && (i = {}), Y || (Y = $e(i)), Y;
}
let X;
function Fe() {
  const i = A(),
    t = Se();
  let e = !1;
  function s() {
    const o = i.navigator.userAgent.toLowerCase();
    return (
      o.indexOf("safari") >= 0 &&
      o.indexOf("chrome") < 0 &&
      o.indexOf("android") < 0
    );
  }
  if (s()) {
    const o = String(i.navigator.userAgent);
    if (o.includes("Version/")) {
      const [a, d] = o
        .split("Version/")[1]
        .split(" ")[0]
        .split(".")
        .map((c) => Number(c));
      e = a < 16 || (a === 16 && d < 2);
    }
  }
  const n = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
      i.navigator.userAgent
    ),
    r = s(),
    l = r || (n && t.ios);
  return {
    isSafari: e || r,
    needPerspectiveFix: e,
    need3dFix: l,
    isWebView: n,
  };
}
function Be() {
  return X || (X = Fe()), X;
}
function Ne(i) {
  let { swiper: t, on: e, emit: s } = i;
  const n = A();
  let r = null,
    l = null;
  const o = () => {
      !t || t.destroyed || !t.initialized || (s("beforeResize"), s("resize"));
    },
    a = () => {
      !t ||
        t.destroyed ||
        !t.initialized ||
        ((r = new ResizeObserver((f) => {
          l = n.requestAnimationFrame(() => {
            const { width: p, height: u } = t;
            let m = p,
              h = u;
            f.forEach((T) => {
              let { contentBoxSize: v, contentRect: b, target: g } = T;
              (g && g !== t.el) ||
                ((m = b ? b.width : (v[0] || v).inlineSize),
                (h = b ? b.height : (v[0] || v).blockSize));
            }),
              (m !== p || h !== u) && o();
          });
        })),
        r.observe(t.el));
    },
    d = () => {
      l && n.cancelAnimationFrame(l),
        r && r.unobserve && t.el && (r.unobserve(t.el), (r = null));
    },
    c = () => {
      !t || t.destroyed || !t.initialized || s("orientationchange");
    };
  e("init", () => {
    if (t.params.resizeObserver && typeof n.ResizeObserver < "u") {
      a();
      return;
    }
    n.addEventListener("resize", o), n.addEventListener("orientationchange", c);
  }),
    e("destroy", () => {
      d(),
        n.removeEventListener("resize", o),
        n.removeEventListener("orientationchange", c);
    });
}
function _e(i) {
  let { swiper: t, extendParams: e, on: s, emit: n } = i;
  const r = [],
    l = A(),
    o = function (c, f) {
      f === void 0 && (f = {});
      const p = l.MutationObserver || l.WebkitMutationObserver,
        u = new p((m) => {
          if (t.__preventObserver__) return;
          if (m.length === 1) {
            n("observerUpdate", m[0]);
            return;
          }
          const h = function () {
            n("observerUpdate", m[0]);
          };
          l.requestAnimationFrame
            ? l.requestAnimationFrame(h)
            : l.setTimeout(h, 0);
        });
      u.observe(c, {
        attributes: typeof f.attributes > "u" ? !0 : f.attributes,
        childList: t.isElement || (typeof f.childList > "u" ? !0 : f).childList,
        characterData: typeof f.characterData > "u" ? !0 : f.characterData,
      }),
        r.push(u);
    },
    a = () => {
      if (t.params.observer) {
        if (t.params.observeParents) {
          const c = ke(t.hostEl);
          for (let f = 0; f < c.length; f += 1) o(c[f]);
        }
        o(t.hostEl, { childList: t.params.observeSlideChildren }),
          o(t.wrapperEl, { attributes: !1 });
      }
    },
    d = () => {
      r.forEach((c) => {
        c.disconnect();
      }),
        r.splice(0, r.length);
    };
  e({ observer: !1, observeParents: !1, observeSlideChildren: !1 }),
    s("init", a),
    s("destroy", d);
}
var Re = {
  on(i, t, e) {
    const s = this;
    if (!s.eventsListeners || s.destroyed || typeof t != "function") return s;
    const n = e ? "unshift" : "push";
    return (
      i.split(" ").forEach((r) => {
        s.eventsListeners[r] || (s.eventsListeners[r] = []),
          s.eventsListeners[r][n](t);
      }),
      s
    );
  },
  once(i, t, e) {
    const s = this;
    if (!s.eventsListeners || s.destroyed || typeof t != "function") return s;
    function n() {
      s.off(i, n), n.__emitterProxy && delete n.__emitterProxy;
      for (var r = arguments.length, l = new Array(r), o = 0; o < r; o++)
        l[o] = arguments[o];
      t.apply(s, l);
    }
    return (n.__emitterProxy = t), s.on(i, n, e);
  },
  onAny(i, t) {
    const e = this;
    if (!e.eventsListeners || e.destroyed || typeof i != "function") return e;
    const s = t ? "unshift" : "push";
    return e.eventsAnyListeners.indexOf(i) < 0 && e.eventsAnyListeners[s](i), e;
  },
  offAny(i) {
    const t = this;
    if (!t.eventsListeners || t.destroyed || !t.eventsAnyListeners) return t;
    const e = t.eventsAnyListeners.indexOf(i);
    return e >= 0 && t.eventsAnyListeners.splice(e, 1), t;
  },
  off(i, t) {
    const e = this;
    return (
      !e.eventsListeners ||
        e.destroyed ||
        !e.eventsListeners ||
        i.split(" ").forEach((s) => {
          typeof t > "u"
            ? (e.eventsListeners[s] = [])
            : e.eventsListeners[s] &&
              e.eventsListeners[s].forEach((n, r) => {
                (n === t || (n.__emitterProxy && n.__emitterProxy === t)) &&
                  e.eventsListeners[s].splice(r, 1);
              });
        }),
      e
    );
  },
  emit() {
    const i = this;
    if (!i.eventsListeners || i.destroyed || !i.eventsListeners) return i;
    let t, e, s;
    for (var n = arguments.length, r = new Array(n), l = 0; l < n; l++)
      r[l] = arguments[l];
    return (
      typeof r[0] == "string" || Array.isArray(r[0])
        ? ((t = r[0]), (e = r.slice(1, r.length)), (s = i))
        : ((t = r[0].events), (e = r[0].data), (s = r[0].context || i)),
      e.unshift(s),
      (Array.isArray(t) ? t : t.split(" ")).forEach((a) => {
        i.eventsAnyListeners &&
          i.eventsAnyListeners.length &&
          i.eventsAnyListeners.forEach((d) => {
            d.apply(s, [a, ...e]);
          }),
          i.eventsListeners &&
            i.eventsListeners[a] &&
            i.eventsListeners[a].forEach((d) => {
              d.apply(s, e);
            });
      }),
      i
    );
  },
};
function He() {
  const i = this;
  let t, e;
  const s = i.el;
  typeof i.params.width < "u" && i.params.width !== null
    ? (t = i.params.width)
    : (t = s.clientWidth),
    typeof i.params.height < "u" && i.params.height !== null
      ? (e = i.params.height)
      : (e = s.clientHeight),
    !((t === 0 && i.isHorizontal()) || (e === 0 && i.isVertical())) &&
      ((t =
        t -
        parseInt($(s, "padding-left") || 0, 10) -
        parseInt($(s, "padding-right") || 0, 10)),
      (e =
        e -
        parseInt($(s, "padding-top") || 0, 10) -
        parseInt($(s, "padding-bottom") || 0, 10)),
      Number.isNaN(t) && (t = 0),
      Number.isNaN(e) && (e = 0),
      Object.assign(i, {
        width: t,
        height: e,
        size: i.isHorizontal() ? t : e,
      }));
}
function We() {
  const i = this;
  function t(w, P) {
    return parseFloat(w.getPropertyValue(i.getDirectionLabel(P)) || 0);
  }
  const e = i.params,
    { wrapperEl: s, slidesEl: n, size: r, rtlTranslate: l, wrongRTL: o } = i,
    a = i.virtual && e.virtual.enabled,
    d = a ? i.virtual.slides.length : i.slides.length,
    c = k(n, `.${i.params.slideClass}, swiper-slide`),
    f = a ? i.virtual.slides.length : c.length;
  let p = [];
  const u = [],
    m = [];
  let h = e.slidesOffsetBefore;
  typeof h == "function" && (h = e.slidesOffsetBefore.call(i));
  let T = e.slidesOffsetAfter;
  typeof T == "function" && (T = e.slidesOffsetAfter.call(i));
  const v = i.snapGrid.length,
    b = i.slidesGrid.length;
  let g = e.spaceBetween,
    E = -h,
    S = 0,
    y = 0;
  if (typeof r > "u") return;
  typeof g == "string" && g.indexOf("%") >= 0
    ? (g = (parseFloat(g.replace("%", "")) / 100) * r)
    : typeof g == "string" && (g = parseFloat(g)),
    (i.virtualSize = -g),
    c.forEach((w) => {
      l ? (w.style.marginLeft = "") : (w.style.marginRight = ""),
        (w.style.marginBottom = ""),
        (w.style.marginTop = "");
    }),
    e.centeredSlides &&
      e.cssMode &&
      (N(s, "--swiper-centered-offset-before", ""),
      N(s, "--swiper-centered-offset-after", ""));
  const L = e.grid && e.grid.rows > 1 && i.grid;
  L ? i.grid.initSlides(c) : i.grid && i.grid.unsetSlides();
  let I;
  const V =
    e.slidesPerView === "auto" &&
    e.breakpoints &&
    Object.keys(e.breakpoints).filter(
      (w) => typeof e.breakpoints[w].slidesPerView < "u"
    ).length > 0;
  for (let w = 0; w < f; w += 1) {
    I = 0;
    let P;
    if (
      (c[w] && (P = c[w]),
      L && i.grid.updateSlide(w, P, c),
      !(c[w] && $(P, "display") === "none"))
    ) {
      if (e.slidesPerView === "auto") {
        V && (c[w].style[i.getDirectionLabel("width")] = "");
        const M = getComputedStyle(P),
          x = P.style.transform,
          C = P.style.webkitTransform;
        if (
          (x && (P.style.transform = "none"),
          C && (P.style.webkitTransform = "none"),
          e.roundLengths)
        )
          I = i.isHorizontal() ? ce(P, "width", !0) : ce(P, "height", !0);
        else {
          const O = t(M, "width"),
            D = t(M, "padding-left"),
            be = t(M, "padding-right"),
            ne = t(M, "margin-left"),
            ae = t(M, "margin-right"),
            oe = M.getPropertyValue("box-sizing");
          if (oe && oe === "border-box") I = O + ne + ae;
          else {
            const { clientWidth: xe, offsetWidth: Ee } = P;
            I = O + D + be + ne + ae + (Ee - xe);
          }
        }
        x && (P.style.transform = x),
          C && (P.style.webkitTransform = C),
          e.roundLengths && (I = Math.floor(I));
      } else
        (I = (r - (e.slidesPerView - 1) * g) / e.slidesPerView),
          e.roundLengths && (I = Math.floor(I)),
          c[w] && (c[w].style[i.getDirectionLabel("width")] = `${I}px`);
      c[w] && (c[w].swiperSlideSize = I),
        m.push(I),
        e.centeredSlides
          ? ((E = E + I / 2 + S / 2 + g),
            S === 0 && w !== 0 && (E = E - r / 2 - g),
            w === 0 && (E = E - r / 2 - g),
            Math.abs(E) < 1 / 1e3 && (E = 0),
            e.roundLengths && (E = Math.floor(E)),
            y % e.slidesPerGroup === 0 && p.push(E),
            u.push(E))
          : (e.roundLengths && (E = Math.floor(E)),
            (y - Math.min(i.params.slidesPerGroupSkip, y)) %
              i.params.slidesPerGroup ===
              0 && p.push(E),
            u.push(E),
            (E = E + I + g)),
        (i.virtualSize += I + g),
        (S = I),
        (y += 1);
    }
  }
  if (
    ((i.virtualSize = Math.max(i.virtualSize, r) + T),
    l &&
      o &&
      (e.effect === "slide" || e.effect === "coverflow") &&
      (s.style.width = `${i.virtualSize + g}px`),
    e.setWrapperSize &&
      (s.style[i.getDirectionLabel("width")] = `${i.virtualSize + g}px`),
    L && i.grid.updateWrapperSize(I, p),
    !e.centeredSlides)
  ) {
    const w = [];
    for (let P = 0; P < p.length; P += 1) {
      let M = p[P];
      e.roundLengths && (M = Math.floor(M)),
        p[P] <= i.virtualSize - r && w.push(M);
    }
    (p = w),
      Math.floor(i.virtualSize - r) - Math.floor(p[p.length - 1]) > 1 &&
        p.push(i.virtualSize - r);
  }
  if (a && e.loop) {
    const w = m[0] + g;
    if (e.slidesPerGroup > 1) {
      const P = Math.ceil(
          (i.virtual.slidesBefore + i.virtual.slidesAfter) / e.slidesPerGroup
        ),
        M = w * e.slidesPerGroup;
      for (let x = 0; x < P; x += 1) p.push(p[p.length - 1] + M);
    }
    for (let P = 0; P < i.virtual.slidesBefore + i.virtual.slidesAfter; P += 1)
      e.slidesPerGroup === 1 && p.push(p[p.length - 1] + w),
        u.push(u[u.length - 1] + w),
        (i.virtualSize += w);
  }
  if ((p.length === 0 && (p = [0]), g !== 0)) {
    const w =
      i.isHorizontal() && l ? "marginLeft" : i.getDirectionLabel("marginRight");
    c.filter((P, M) =>
      !e.cssMode || e.loop ? !0 : M !== c.length - 1
    ).forEach((P) => {
      P.style[w] = `${g}px`;
    });
  }
  if (e.centeredSlides && e.centeredSlidesBounds) {
    let w = 0;
    m.forEach((M) => {
      w += M + (g || 0);
    }),
      (w -= g);
    const P = w > r ? w - r : 0;
    p = p.map((M) => (M <= 0 ? -h : M > P ? P + T : M));
  }
  if (e.centerInsufficientSlides) {
    let w = 0;
    m.forEach((M) => {
      w += M + (g || 0);
    }),
      (w -= g);
    const P = (e.slidesOffsetBefore || 0) + (e.slidesOffsetAfter || 0);
    if (w + P < r) {
      const M = (r - w - P) / 2;
      p.forEach((x, C) => {
        p[C] = x - M;
      }),
        u.forEach((x, C) => {
          u[C] = x + M;
        });
    }
  }
  if (
    (Object.assign(i, {
      slides: c,
      snapGrid: p,
      slidesGrid: u,
      slidesSizesGrid: m,
    }),
    e.centeredSlides && e.cssMode && !e.centeredSlidesBounds)
  ) {
    N(s, "--swiper-centered-offset-before", `${-p[0]}px`),
      N(
        s,
        "--swiper-centered-offset-after",
        `${i.size / 2 - m[m.length - 1] / 2}px`
      );
    const w = -i.snapGrid[0],
      P = -i.slidesGrid[0];
    (i.snapGrid = i.snapGrid.map((M) => M + w)),
      (i.slidesGrid = i.slidesGrid.map((M) => M + P));
  }
  if (
    (f !== d && i.emit("slidesLengthChange"),
    p.length !== v &&
      (i.params.watchOverflow && i.checkOverflow(),
      i.emit("snapGridLengthChange")),
    u.length !== b && i.emit("slidesGridLengthChange"),
    e.watchSlidesProgress && i.updateSlidesOffset(),
    i.emit("slidesUpdated"),
    !a && !e.cssMode && (e.effect === "slide" || e.effect === "fade"))
  ) {
    const w = `${e.containerModifierClass}backface-hidden`,
      P = i.el.classList.contains(w);
    f <= e.maxBackfaceHiddenSlides
      ? P || i.el.classList.add(w)
      : P && i.el.classList.remove(w);
  }
}
function je(i) {
  const t = this,
    e = [],
    s = t.virtual && t.params.virtual.enabled;
  let n = 0,
    r;
  typeof i == "number"
    ? t.setTransition(i)
    : i === !0 && t.setTransition(t.params.speed);
  const l = (o) => (s ? t.slides[t.getSlideIndexByData(o)] : t.slides[o]);
  if (t.params.slidesPerView !== "auto" && t.params.slidesPerView > 1)
    if (t.params.centeredSlides)
      (t.visibleSlides || []).forEach((o) => {
        e.push(o);
      });
    else
      for (r = 0; r < Math.ceil(t.params.slidesPerView); r += 1) {
        const o = t.activeIndex + r;
        if (o > t.slides.length && !s) break;
        e.push(l(o));
      }
  else e.push(l(t.activeIndex));
  for (r = 0; r < e.length; r += 1)
    if (typeof e[r] < "u") {
      const o = e[r].offsetHeight;
      n = o > n ? o : n;
    }
  (n || n === 0) && (t.wrapperEl.style.height = `${n}px`);
}
function qe() {
  const i = this,
    t = i.slides,
    e = i.isElement
      ? i.isHorizontal()
        ? i.wrapperEl.offsetLeft
        : i.wrapperEl.offsetTop
      : 0;
  for (let s = 0; s < t.length; s += 1)
    t[s].swiperSlideOffset =
      (i.isHorizontal() ? t[s].offsetLeft : t[s].offsetTop) -
      e -
      i.cssOverflowAdjustment();
}
const fe = (i, t, e) => {
  t && !i.classList.contains(e)
    ? i.classList.add(e)
    : !t && i.classList.contains(e) && i.classList.remove(e);
};
function Ye(i) {
  i === void 0 && (i = (this && this.translate) || 0);
  const t = this,
    e = t.params,
    { slides: s, rtlTranslate: n, snapGrid: r } = t;
  if (s.length === 0) return;
  typeof s[0].swiperSlideOffset > "u" && t.updateSlidesOffset();
  let l = -i;
  n && (l = i), (t.visibleSlidesIndexes = []), (t.visibleSlides = []);
  let o = e.spaceBetween;
  typeof o == "string" && o.indexOf("%") >= 0
    ? (o = (parseFloat(o.replace("%", "")) / 100) * t.size)
    : typeof o == "string" && (o = parseFloat(o));
  for (let a = 0; a < s.length; a += 1) {
    const d = s[a];
    let c = d.swiperSlideOffset;
    e.cssMode && e.centeredSlides && (c -= s[0].swiperSlideOffset);
    const f =
        (l + (e.centeredSlides ? t.minTranslate() : 0) - c) /
        (d.swiperSlideSize + o),
      p =
        (l - r[0] + (e.centeredSlides ? t.minTranslate() : 0) - c) /
        (d.swiperSlideSize + o),
      u = -(l - c),
      m = u + t.slidesSizesGrid[a],
      h = u >= 0 && u <= t.size - t.slidesSizesGrid[a],
      T =
        (u >= 0 && u < t.size - 1) ||
        (m > 1 && m <= t.size) ||
        (u <= 0 && m >= t.size);
    T && (t.visibleSlides.push(d), t.visibleSlidesIndexes.push(a)),
      fe(d, T, e.slideVisibleClass),
      fe(d, h, e.slideFullyVisibleClass),
      (d.progress = n ? -f : f),
      (d.originalProgress = n ? -p : p);
  }
}
function Xe(i) {
  const t = this;
  if (typeof i > "u") {
    const c = t.rtlTranslate ? -1 : 1;
    i = (t && t.translate && t.translate * c) || 0;
  }
  const e = t.params,
    s = t.maxTranslate() - t.minTranslate();
  let { progress: n, isBeginning: r, isEnd: l, progressLoop: o } = t;
  const a = r,
    d = l;
  if (s === 0) (n = 0), (r = !0), (l = !0);
  else {
    n = (i - t.minTranslate()) / s;
    const c = Math.abs(i - t.minTranslate()) < 1,
      f = Math.abs(i - t.maxTranslate()) < 1;
    (r = c || n <= 0), (l = f || n >= 1), c && (n = 0), f && (n = 1);
  }
  if (e.loop) {
    const c = t.getSlideIndexByData(0),
      f = t.getSlideIndexByData(t.slides.length - 1),
      p = t.slidesGrid[c],
      u = t.slidesGrid[f],
      m = t.slidesGrid[t.slidesGrid.length - 1],
      h = Math.abs(i);
    h >= p ? (o = (h - p) / m) : (o = (h + m - u) / m), o > 1 && (o -= 1);
  }
  Object.assign(t, { progress: n, progressLoop: o, isBeginning: r, isEnd: l }),
    (e.watchSlidesProgress || (e.centeredSlides && e.autoHeight)) &&
      t.updateSlidesProgress(i),
    r && !a && t.emit("reachBeginning toEdge"),
    l && !d && t.emit("reachEnd toEdge"),
    ((a && !r) || (d && !l)) && t.emit("fromEdge"),
    t.emit("progress", n);
}
const U = (i, t, e) => {
  t && !i.classList.contains(e)
    ? i.classList.add(e)
    : !t && i.classList.contains(e) && i.classList.remove(e);
};
function Ue() {
  const i = this,
    { slides: t, params: e, slidesEl: s, activeIndex: n } = i,
    r = i.virtual && e.virtual.enabled,
    l = i.grid && e.grid && e.grid.rows > 1,
    o = (f) => k(s, `.${e.slideClass}${f}, swiper-slide${f}`)[0];
  let a, d, c;
  if (r)
    if (e.loop) {
      let f = n - i.virtual.slidesBefore;
      f < 0 && (f = i.virtual.slides.length + f),
        f >= i.virtual.slides.length && (f -= i.virtual.slides.length),
        (a = o(`[data-swiper-slide-index="${f}"]`));
    } else a = o(`[data-swiper-slide-index="${n}"]`);
  else
    l
      ? ((a = t.filter((f) => f.column === n)[0]),
        (c = t.filter((f) => f.column === n + 1)[0]),
        (d = t.filter((f) => f.column === n - 1)[0]))
      : (a = t[n]);
  a &&
    (l ||
      ((c = Ge(a, `.${e.slideClass}, swiper-slide`)[0]),
      e.loop && !c && (c = t[0]),
      (d = Ae(a, `.${e.slideClass}, swiper-slide`)[0]),
      e.loop && !d === 0 && (d = t[t.length - 1]))),
    t.forEach((f) => {
      U(f, f === a, e.slideActiveClass),
        U(f, f === c, e.slideNextClass),
        U(f, f === d, e.slidePrevClass);
    }),
    i.emitSlidesClasses();
}
const _ = (i, t) => {
    if (!i || i.destroyed || !i.params) return;
    const e = () => (i.isElement ? "swiper-slide" : `.${i.params.slideClass}`),
      s = t.closest(e());
    if (s) {
      let n = s.querySelector(`.${i.params.lazyPreloaderClass}`);
      !n &&
        i.isElement &&
        (s.shadowRoot
          ? (n = s.shadowRoot.querySelector(`.${i.params.lazyPreloaderClass}`))
          : requestAnimationFrame(() => {
              s.shadowRoot &&
                ((n = s.shadowRoot.querySelector(
                  `.${i.params.lazyPreloaderClass}`
                )),
                n && n.remove());
            })),
        n && n.remove();
    }
  },
  K = (i, t) => {
    if (!i.slides[t]) return;
    const e = i.slides[t].querySelector('[loading="lazy"]');
    e && e.removeAttribute("loading");
  },
  ee = (i) => {
    if (!i || i.destroyed || !i.params) return;
    let t = i.params.lazyPreloadPrevNext;
    const e = i.slides.length;
    if (!e || !t || t < 0) return;
    t = Math.min(t, e);
    const s =
        i.params.slidesPerView === "auto"
          ? i.slidesPerViewDynamic()
          : Math.ceil(i.params.slidesPerView),
      n = i.activeIndex;
    if (i.params.grid && i.params.grid.rows > 1) {
      const l = n,
        o = [l - t];
      o.push(...Array.from({ length: t }).map((a, d) => l + s + d)),
        i.slides.forEach((a, d) => {
          o.includes(a.column) && K(i, d);
        });
      return;
    }
    const r = n + s - 1;
    if (i.params.rewind || i.params.loop)
      for (let l = n - t; l <= r + t; l += 1) {
        const o = ((l % e) + e) % e;
        (o < n || o > r) && K(i, o);
      }
    else
      for (let l = Math.max(n - t, 0); l <= Math.min(r + t, e - 1); l += 1)
        l !== n && (l > r || l < n) && K(i, l);
  };
function Ke(i) {
  const { slidesGrid: t, params: e } = i,
    s = i.rtlTranslate ? i.translate : -i.translate;
  let n;
  for (let r = 0; r < t.length; r += 1)
    typeof t[r + 1] < "u"
      ? s >= t[r] && s < t[r + 1] - (t[r + 1] - t[r]) / 2
        ? (n = r)
        : s >= t[r] && s < t[r + 1] && (n = r + 1)
      : s >= t[r] && (n = r);
  return e.normalizeSlideIndex && (n < 0 || typeof n > "u") && (n = 0), n;
}
function Ze(i) {
  const t = this,
    e = t.rtlTranslate ? t.translate : -t.translate,
    { snapGrid: s, params: n, activeIndex: r, realIndex: l, snapIndex: o } = t;
  let a = i,
    d;
  const c = (u) => {
    let m = u - t.virtual.slidesBefore;
    return (
      m < 0 && (m = t.virtual.slides.length + m),
      m >= t.virtual.slides.length && (m -= t.virtual.slides.length),
      m
    );
  };
  if ((typeof a > "u" && (a = Ke(t)), s.indexOf(e) >= 0)) d = s.indexOf(e);
  else {
    const u = Math.min(n.slidesPerGroupSkip, a);
    d = u + Math.floor((a - u) / n.slidesPerGroup);
  }
  if ((d >= s.length && (d = s.length - 1), a === r && !t.params.loop)) {
    d !== o && ((t.snapIndex = d), t.emit("snapIndexChange"));
    return;
  }
  if (a === r && t.params.loop && t.virtual && t.params.virtual.enabled) {
    t.realIndex = c(a);
    return;
  }
  const f = t.grid && n.grid && n.grid.rows > 1;
  let p;
  if (t.virtual && n.virtual.enabled && n.loop) p = c(a);
  else if (f) {
    const u = t.slides.filter((h) => h.column === a)[0];
    let m = parseInt(u.getAttribute("data-swiper-slide-index"), 10);
    Number.isNaN(m) && (m = Math.max(t.slides.indexOf(u), 0)),
      (p = Math.floor(m / n.grid.rows));
  } else if (t.slides[a]) {
    const u = t.slides[a].getAttribute("data-swiper-slide-index");
    u ? (p = parseInt(u, 10)) : (p = a);
  } else p = a;
  Object.assign(t, {
    previousSnapIndex: o,
    snapIndex: d,
    previousRealIndex: l,
    realIndex: p,
    previousIndex: r,
    activeIndex: a,
  }),
    t.initialized && ee(t),
    t.emit("activeIndexChange"),
    t.emit("snapIndexChange"),
    (t.initialized || t.params.runCallbacksOnInit) &&
      (l !== p && t.emit("realIndexChange"), t.emit("slideChange"));
}
function Je(i, t) {
  const e = this,
    s = e.params;
  let n = i.closest(`.${s.slideClass}, swiper-slide`);
  !n &&
    e.isElement &&
    t &&
    t.length > 1 &&
    t.includes(i) &&
    [...t.slice(t.indexOf(i) + 1, t.length)].forEach((o) => {
      !n && o.matches && o.matches(`.${s.slideClass}, swiper-slide`) && (n = o);
    });
  let r = !1,
    l;
  if (n) {
    for (let o = 0; o < e.slides.length; o += 1)
      if (e.slides[o] === n) {
        (r = !0), (l = o);
        break;
      }
  }
  if (n && r)
    (e.clickedSlide = n),
      e.virtual && e.params.virtual.enabled
        ? (e.clickedIndex = parseInt(
            n.getAttribute("data-swiper-slide-index"),
            10
          ))
        : (e.clickedIndex = l);
  else {
    (e.clickedSlide = void 0), (e.clickedIndex = void 0);
    return;
  }
  s.slideToClickedSlide &&
    e.clickedIndex !== void 0 &&
    e.clickedIndex !== e.activeIndex &&
    e.slideToClickedSlide();
}
var Qe = {
  updateSize: He,
  updateSlides: We,
  updateAutoHeight: je,
  updateSlidesOffset: qe,
  updateSlidesProgress: Ye,
  updateProgress: Xe,
  updateSlidesClasses: Ue,
  updateActiveIndex: Ze,
  updateClickedSlide: Je,
};
function et(i) {
  i === void 0 && (i = this.isHorizontal() ? "x" : "y");
  const t = this,
    { params: e, rtlTranslate: s, translate: n, wrapperEl: r } = t;
  if (e.virtualTranslate) return s ? -n : n;
  if (e.cssMode) return n;
  let l = Le(r, i);
  return (l += t.cssOverflowAdjustment()), s && (l = -l), l || 0;
}
function tt(i, t) {
  const e = this,
    { rtlTranslate: s, params: n, wrapperEl: r, progress: l } = e;
  let o = 0,
    a = 0;
  const d = 0;
  e.isHorizontal() ? (o = s ? -i : i) : (a = i),
    n.roundLengths && ((o = Math.floor(o)), (a = Math.floor(a))),
    (e.previousTranslate = e.translate),
    (e.translate = e.isHorizontal() ? o : a),
    n.cssMode
      ? (r[e.isHorizontal() ? "scrollLeft" : "scrollTop"] = e.isHorizontal()
          ? -o
          : -a)
      : n.virtualTranslate ||
        (e.isHorizontal()
          ? (o -= e.cssOverflowAdjustment())
          : (a -= e.cssOverflowAdjustment()),
        (r.style.transform = `translate3d(${o}px, ${a}px, ${d}px)`));
  let c;
  const f = e.maxTranslate() - e.minTranslate();
  f === 0 ? (c = 0) : (c = (i - e.minTranslate()) / f),
    c !== l && e.updateProgress(i),
    e.emit("setTranslate", e.translate, t);
}
function it() {
  return -this.snapGrid[0];
}
function st() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function rt(i, t, e, s, n) {
  i === void 0 && (i = 0),
    t === void 0 && (t = this.params.speed),
    e === void 0 && (e = !0),
    s === void 0 && (s = !0);
  const r = this,
    { params: l, wrapperEl: o } = r;
  if (r.animating && l.preventInteractionOnTransition) return !1;
  const a = r.minTranslate(),
    d = r.maxTranslate();
  let c;
  if (
    (s && i > a ? (c = a) : s && i < d ? (c = d) : (c = i),
    r.updateProgress(c),
    l.cssMode)
  ) {
    const f = r.isHorizontal();
    if (t === 0) o[f ? "scrollLeft" : "scrollTop"] = -c;
    else {
      if (!r.support.smoothScroll)
        return (
          ve({ swiper: r, targetPosition: -c, side: f ? "left" : "top" }), !0
        );
      o.scrollTo({ [f ? "left" : "top"]: -c, behavior: "smooth" });
    }
    return !0;
  }
  return (
    t === 0
      ? (r.setTransition(0),
        r.setTranslate(c),
        e && (r.emit("beforeTransitionStart", t, n), r.emit("transitionEnd")))
      : (r.setTransition(t),
        r.setTranslate(c),
        e && (r.emit("beforeTransitionStart", t, n), r.emit("transitionStart")),
        r.animating ||
          ((r.animating = !0),
          r.onTranslateToWrapperTransitionEnd ||
            (r.onTranslateToWrapperTransitionEnd = function (p) {
              !r ||
                r.destroyed ||
                (p.target === this &&
                  (r.wrapperEl.removeEventListener(
                    "transitionend",
                    r.onTranslateToWrapperTransitionEnd
                  ),
                  (r.onTranslateToWrapperTransitionEnd = null),
                  delete r.onTranslateToWrapperTransitionEnd,
                  (r.animating = !1),
                  e && r.emit("transitionEnd")));
            }),
          r.wrapperEl.addEventListener(
            "transitionend",
            r.onTranslateToWrapperTransitionEnd
          ))),
    !0
  );
}
var nt = {
  getTranslate: et,
  setTranslate: tt,
  minTranslate: it,
  maxTranslate: st,
  translateTo: rt,
};
function at(i, t) {
  const e = this;
  e.params.cssMode ||
    ((e.wrapperEl.style.transitionDuration = `${i}ms`),
    (e.wrapperEl.style.transitionDelay = i === 0 ? "0ms" : "")),
    e.emit("setTransition", i, t);
}
function Te(i) {
  let { swiper: t, runCallbacks: e, direction: s, step: n } = i;
  const { activeIndex: r, previousIndex: l } = t;
  let o = s;
  if (
    (o || (r > l ? (o = "next") : r < l ? (o = "prev") : (o = "reset")),
    t.emit(`transition${n}`),
    e && r !== l)
  ) {
    if (o === "reset") {
      t.emit(`slideResetTransition${n}`);
      return;
    }
    t.emit(`slideChangeTransition${n}`),
      o === "next"
        ? t.emit(`slideNextTransition${n}`)
        : t.emit(`slidePrevTransition${n}`);
  }
}
function ot(i, t) {
  i === void 0 && (i = !0);
  const e = this,
    { params: s } = e;
  s.cssMode ||
    (s.autoHeight && e.updateAutoHeight(),
    Te({ swiper: e, runCallbacks: i, direction: t, step: "Start" }));
}
function lt(i, t) {
  i === void 0 && (i = !0);
  const e = this,
    { params: s } = e;
  (e.animating = !1),
    !s.cssMode &&
      (e.setTransition(0),
      Te({ swiper: e, runCallbacks: i, direction: t, step: "End" }));
}
var dt = { setTransition: at, transitionStart: ot, transitionEnd: lt };
function ct(i, t, e, s, n) {
  i === void 0 && (i = 0),
    e === void 0 && (e = !0),
    typeof i == "string" && (i = parseInt(i, 10));
  const r = this;
  let l = i;
  l < 0 && (l = 0);
  const {
    params: o,
    snapGrid: a,
    slidesGrid: d,
    previousIndex: c,
    activeIndex: f,
    rtlTranslate: p,
    wrapperEl: u,
    enabled: m,
  } = r;
  if (
    (!m && !s && !n) ||
    r.destroyed ||
    (r.animating && o.preventInteractionOnTransition)
  )
    return !1;
  typeof t > "u" && (t = r.params.speed);
  const h = Math.min(r.params.slidesPerGroupSkip, l);
  let T = h + Math.floor((l - h) / r.params.slidesPerGroup);
  T >= a.length && (T = a.length - 1);
  const v = -a[T];
  if (o.normalizeSlideIndex)
    for (let S = 0; S < d.length; S += 1) {
      const y = -Math.floor(v * 100),
        L = Math.floor(d[S] * 100),
        I = Math.floor(d[S + 1] * 100);
      typeof d[S + 1] < "u"
        ? y >= L && y < I - (I - L) / 2
          ? (l = S)
          : y >= L && y < I && (l = S + 1)
        : y >= L && (l = S);
    }
  if (
    r.initialized &&
    l !== f &&
    ((!r.allowSlideNext &&
      (p
        ? v > r.translate && v > r.minTranslate()
        : v < r.translate && v < r.minTranslate())) ||
      (!r.allowSlidePrev &&
        v > r.translate &&
        v > r.maxTranslate() &&
        (f || 0) !== l))
  )
    return !1;
  l !== (c || 0) && e && r.emit("beforeSlideChangeStart"), r.updateProgress(v);
  let b;
  l > f ? (b = "next") : l < f ? (b = "prev") : (b = "reset");
  const g = r.virtual && r.params.virtual.enabled;
  if (!(g && n) && ((p && -v === r.translate) || (!p && v === r.translate)))
    return (
      r.updateActiveIndex(l),
      o.autoHeight && r.updateAutoHeight(),
      r.updateSlidesClasses(),
      o.effect !== "slide" && r.setTranslate(v),
      b !== "reset" && (r.transitionStart(e, b), r.transitionEnd(e, b)),
      !1
    );
  if (o.cssMode) {
    const S = r.isHorizontal(),
      y = p ? v : -v;
    if (t === 0)
      g &&
        ((r.wrapperEl.style.scrollSnapType = "none"),
        (r._immediateVirtual = !0)),
        g && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0
          ? ((r._cssModeVirtualInitialSet = !0),
            requestAnimationFrame(() => {
              u[S ? "scrollLeft" : "scrollTop"] = y;
            }))
          : (u[S ? "scrollLeft" : "scrollTop"] = y),
        g &&
          requestAnimationFrame(() => {
            (r.wrapperEl.style.scrollSnapType = ""), (r._immediateVirtual = !1);
          });
    else {
      if (!r.support.smoothScroll)
        return (
          ve({ swiper: r, targetPosition: y, side: S ? "left" : "top" }), !0
        );
      u.scrollTo({ [S ? "left" : "top"]: y, behavior: "smooth" });
    }
    return !0;
  }
  return (
    r.setTransition(t),
    r.setTranslate(v),
    r.updateActiveIndex(l),
    r.updateSlidesClasses(),
    r.emit("beforeTransitionStart", t, s),
    r.transitionStart(e, b),
    t === 0
      ? r.transitionEnd(e, b)
      : r.animating ||
        ((r.animating = !0),
        r.onSlideToWrapperTransitionEnd ||
          (r.onSlideToWrapperTransitionEnd = function (y) {
            !r ||
              r.destroyed ||
              (y.target === this &&
                (r.wrapperEl.removeEventListener(
                  "transitionend",
                  r.onSlideToWrapperTransitionEnd
                ),
                (r.onSlideToWrapperTransitionEnd = null),
                delete r.onSlideToWrapperTransitionEnd,
                r.transitionEnd(e, b)));
          }),
        r.wrapperEl.addEventListener(
          "transitionend",
          r.onSlideToWrapperTransitionEnd
        )),
    !0
  );
}
function ft(i, t, e, s) {
  i === void 0 && (i = 0),
    e === void 0 && (e = !0),
    typeof i == "string" && (i = parseInt(i, 10));
  const n = this;
  if (n.destroyed) return;
  typeof t > "u" && (t = n.params.speed);
  const r = n.grid && n.params.grid && n.params.grid.rows > 1;
  let l = i;
  if (n.params.loop)
    if (n.virtual && n.params.virtual.enabled) l = l + n.virtual.slidesBefore;
    else {
      let o;
      if (r) {
        const p = l * n.params.grid.rows;
        o = n.slides.filter(
          (u) => u.getAttribute("data-swiper-slide-index") * 1 === p
        )[0].column;
      } else o = n.getSlideIndexByData(l);
      const a = r
          ? Math.ceil(n.slides.length / n.params.grid.rows)
          : n.slides.length,
        { centeredSlides: d } = n.params;
      let c = n.params.slidesPerView;
      c === "auto"
        ? (c = n.slidesPerViewDynamic())
        : ((c = Math.ceil(parseFloat(n.params.slidesPerView, 10))),
          d && c % 2 === 0 && (c = c + 1));
      let f = a - o < c;
      if (
        (d && (f = f || o < Math.ceil(c / 2)),
        s && d && n.params.slidesPerView !== "auto" && !r && (f = !1),
        f)
      ) {
        const p = d
          ? o < n.activeIndex
            ? "prev"
            : "next"
          : o - n.activeIndex - 1 < n.params.slidesPerView
          ? "next"
          : "prev";
        n.loopFix({
          direction: p,
          slideTo: !0,
          activeSlideIndex: p === "next" ? o + 1 : o - a + 1,
          slideRealIndex: p === "next" ? n.realIndex : void 0,
        });
      }
      if (r) {
        const p = l * n.params.grid.rows;
        l = n.slides.filter(
          (u) => u.getAttribute("data-swiper-slide-index") * 1 === p
        )[0].column;
      } else l = n.getSlideIndexByData(l);
    }
  return (
    requestAnimationFrame(() => {
      n.slideTo(l, t, e, s);
    }),
    n
  );
}
function ut(i, t, e) {
  t === void 0 && (t = !0);
  const s = this,
    { enabled: n, params: r, animating: l } = s;
  if (!n || s.destroyed) return s;
  typeof i > "u" && (i = s.params.speed);
  let o = r.slidesPerGroup;
  r.slidesPerView === "auto" &&
    r.slidesPerGroup === 1 &&
    r.slidesPerGroupAuto &&
    (o = Math.max(s.slidesPerViewDynamic("current", !0), 1));
  const a = s.activeIndex < r.slidesPerGroupSkip ? 1 : o,
    d = s.virtual && r.virtual.enabled;
  if (r.loop) {
    if (l && !d && r.loopPreventsSliding) return !1;
    if (
      (s.loopFix({ direction: "next" }),
      (s._clientLeft = s.wrapperEl.clientLeft),
      s.activeIndex === s.slides.length - 1 && r.cssMode)
    )
      return (
        requestAnimationFrame(() => {
          s.slideTo(s.activeIndex + a, i, t, e);
        }),
        !0
      );
  }
  return r.rewind && s.isEnd
    ? s.slideTo(0, i, t, e)
    : s.slideTo(s.activeIndex + a, i, t, e);
}
function pt(i, t, e) {
  t === void 0 && (t = !0);
  const s = this,
    {
      params: n,
      snapGrid: r,
      slidesGrid: l,
      rtlTranslate: o,
      enabled: a,
      animating: d,
    } = s;
  if (!a || s.destroyed) return s;
  typeof i > "u" && (i = s.params.speed);
  const c = s.virtual && n.virtual.enabled;
  if (n.loop) {
    if (d && !c && n.loopPreventsSliding) return !1;
    s.loopFix({ direction: "prev" }), (s._clientLeft = s.wrapperEl.clientLeft);
  }
  const f = o ? s.translate : -s.translate;
  function p(v) {
    return v < 0 ? -Math.floor(Math.abs(v)) : Math.floor(v);
  }
  const u = p(f),
    m = r.map((v) => p(v));
  let h = r[m.indexOf(u) - 1];
  if (typeof h > "u" && n.cssMode) {
    let v;
    r.forEach((b, g) => {
      u >= b && (v = g);
    }),
      typeof v < "u" && (h = r[v > 0 ? v - 1 : v]);
  }
  let T = 0;
  if (
    (typeof h < "u" &&
      ((T = l.indexOf(h)),
      T < 0 && (T = s.activeIndex - 1),
      n.slidesPerView === "auto" &&
        n.slidesPerGroup === 1 &&
        n.slidesPerGroupAuto &&
        ((T = T - s.slidesPerViewDynamic("previous", !0) + 1),
        (T = Math.max(T, 0)))),
    n.rewind && s.isBeginning)
  ) {
    const v =
      s.params.virtual && s.params.virtual.enabled && s.virtual
        ? s.virtual.slides.length - 1
        : s.slides.length - 1;
    return s.slideTo(v, i, t, e);
  } else if (n.loop && s.activeIndex === 0 && n.cssMode)
    return (
      requestAnimationFrame(() => {
        s.slideTo(T, i, t, e);
      }),
      !0
    );
  return s.slideTo(T, i, t, e);
}
function mt(i, t, e) {
  t === void 0 && (t = !0);
  const s = this;
  if (!s.destroyed)
    return (
      typeof i > "u" && (i = s.params.speed), s.slideTo(s.activeIndex, i, t, e)
    );
}
function ht(i, t, e, s) {
  t === void 0 && (t = !0), s === void 0 && (s = 0.5);
  const n = this;
  if (n.destroyed) return;
  typeof i > "u" && (i = n.params.speed);
  let r = n.activeIndex;
  const l = Math.min(n.params.slidesPerGroupSkip, r),
    o = l + Math.floor((r - l) / n.params.slidesPerGroup),
    a = n.rtlTranslate ? n.translate : -n.translate;
  if (a >= n.snapGrid[o]) {
    const d = n.snapGrid[o],
      c = n.snapGrid[o + 1];
    a - d > (c - d) * s && (r += n.params.slidesPerGroup);
  } else {
    const d = n.snapGrid[o - 1],
      c = n.snapGrid[o];
    a - d <= (c - d) * s && (r -= n.params.slidesPerGroup);
  }
  return (
    (r = Math.max(r, 0)),
    (r = Math.min(r, n.slidesGrid.length - 1)),
    n.slideTo(r, i, t, e)
  );
}
function gt() {
  const i = this;
  if (i.destroyed) return;
  const { params: t, slidesEl: e } = i,
    s = t.slidesPerView === "auto" ? i.slidesPerViewDynamic() : t.slidesPerView;
  let n = i.clickedIndex,
    r;
  const l = i.isElement ? "swiper-slide" : `.${t.slideClass}`;
  if (t.loop) {
    if (i.animating) return;
    (r = parseInt(i.clickedSlide.getAttribute("data-swiper-slide-index"), 10)),
      t.centeredSlides
        ? n < i.loopedSlides - s / 2 ||
          n > i.slides.length - i.loopedSlides + s / 2
          ? (i.loopFix(),
            (n = i.getSlideIndex(
              k(e, `${l}[data-swiper-slide-index="${r}"]`)[0]
            )),
            Q(() => {
              i.slideTo(n);
            }))
          : i.slideTo(n)
        : n > i.slides.length - s
        ? (i.loopFix(),
          (n = i.getSlideIndex(
            k(e, `${l}[data-swiper-slide-index="${r}"]`)[0]
          )),
          Q(() => {
            i.slideTo(n);
          }))
        : i.slideTo(n);
  } else i.slideTo(n);
}
var vt = {
  slideTo: ct,
  slideToLoop: ft,
  slideNext: ut,
  slidePrev: pt,
  slideReset: mt,
  slideToClosest: ht,
  slideToClickedSlide: gt,
};
function wt(i) {
  const t = this,
    { params: e, slidesEl: s } = t;
  if (!e.loop || (t.virtual && t.params.virtual.enabled)) return;
  const n = () => {
      k(s, `.${e.slideClass}, swiper-slide`).forEach((f, p) => {
        f.setAttribute("data-swiper-slide-index", p);
      });
    },
    r = t.grid && e.grid && e.grid.rows > 1,
    l = e.slidesPerGroup * (r ? e.grid.rows : 1),
    o = t.slides.length % l !== 0,
    a = r && t.slides.length % e.grid.rows !== 0,
    d = (c) => {
      for (let f = 0; f < c; f += 1) {
        const p = t.isElement
          ? W("swiper-slide", [e.slideBlankClass])
          : W("div", [e.slideClass, e.slideBlankClass]);
        t.slidesEl.append(p);
      }
    };
  if (o) {
    if (e.loopAddBlankSlides) {
      const c = l - (t.slides.length % l);
      d(c), t.recalcSlides(), t.updateSlides();
    } else
      H(
        "Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)"
      );
    n();
  } else if (a) {
    if (e.loopAddBlankSlides) {
      const c = e.grid.rows - (t.slides.length % e.grid.rows);
      d(c), t.recalcSlides(), t.updateSlides();
    } else
      H(
        "Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)"
      );
    n();
  } else n();
  t.loopFix({
    slideRealIndex: i,
    direction: e.centeredSlides ? void 0 : "next",
  });
}
function St(i) {
  let {
    slideRealIndex: t,
    slideTo: e = !0,
    direction: s,
    setTranslate: n,
    activeSlideIndex: r,
    byController: l,
    byMousewheel: o,
  } = i === void 0 ? {} : i;
  const a = this;
  if (!a.params.loop) return;
  a.emit("beforeLoopFix");
  const {
      slides: d,
      allowSlidePrev: c,
      allowSlideNext: f,
      slidesEl: p,
      params: u,
    } = a,
    { centeredSlides: m } = u;
  if (
    ((a.allowSlidePrev = !0),
    (a.allowSlideNext = !0),
    a.virtual && u.virtual.enabled)
  ) {
    e &&
      (!u.centeredSlides && a.snapIndex === 0
        ? a.slideTo(a.virtual.slides.length, 0, !1, !0)
        : u.centeredSlides && a.snapIndex < u.slidesPerView
        ? a.slideTo(a.virtual.slides.length + a.snapIndex, 0, !1, !0)
        : a.snapIndex === a.snapGrid.length - 1 &&
          a.slideTo(a.virtual.slidesBefore, 0, !1, !0)),
      (a.allowSlidePrev = c),
      (a.allowSlideNext = f),
      a.emit("loopFix");
    return;
  }
  let h = u.slidesPerView;
  h === "auto"
    ? (h = a.slidesPerViewDynamic())
    : ((h = Math.ceil(parseFloat(u.slidesPerView, 10))),
      m && h % 2 === 0 && (h = h + 1));
  const T = u.slidesPerGroupAuto ? h : u.slidesPerGroup;
  let v = T;
  v % T !== 0 && (v += T - (v % T)),
    (v += u.loopAdditionalSlides),
    (a.loopedSlides = v);
  const b = a.grid && u.grid && u.grid.rows > 1;
  d.length < h + v
    ? H(
        "Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"
      )
    : b &&
      u.grid.fill === "row" &&
      H(
        "Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`"
      );
  const g = [],
    E = [];
  let S = a.activeIndex;
  typeof r > "u"
    ? (r = a.getSlideIndex(
        d.filter((x) => x.classList.contains(u.slideActiveClass))[0]
      ))
    : (S = r);
  const y = s === "next" || !s,
    L = s === "prev" || !s;
  let I = 0,
    V = 0;
  const w = b ? Math.ceil(d.length / u.grid.rows) : d.length,
    M = (b ? d[r].column : r) + (m && typeof n > "u" ? -h / 2 + 0.5 : 0);
  if (M < v) {
    I = Math.max(v - M, T);
    for (let x = 0; x < v - M; x += 1) {
      const C = x - Math.floor(x / w) * w;
      if (b) {
        const O = w - C - 1;
        for (let D = d.length - 1; D >= 0; D -= 1)
          d[D].column === O && g.push(D);
      } else g.push(w - C - 1);
    }
  } else if (M + h > w - v) {
    V = Math.max(M - (w - v * 2), T);
    for (let x = 0; x < V; x += 1) {
      const C = x - Math.floor(x / w) * w;
      b
        ? d.forEach((O, D) => {
            O.column === C && E.push(D);
          })
        : E.push(C);
    }
  }
  if (
    ((a.__preventObserver__ = !0),
    requestAnimationFrame(() => {
      a.__preventObserver__ = !1;
    }),
    L &&
      g.forEach((x) => {
        (d[x].swiperLoopMoveDOM = !0),
          p.prepend(d[x]),
          (d[x].swiperLoopMoveDOM = !1);
      }),
    y &&
      E.forEach((x) => {
        (d[x].swiperLoopMoveDOM = !0),
          p.append(d[x]),
          (d[x].swiperLoopMoveDOM = !1);
      }),
    a.recalcSlides(),
    u.slidesPerView === "auto"
      ? a.updateSlides()
      : b &&
        ((g.length > 0 && L) || (E.length > 0 && y)) &&
        a.slides.forEach((x, C) => {
          a.grid.updateSlide(C, x, a.slides);
        }),
    u.watchSlidesProgress && a.updateSlidesOffset(),
    e)
  ) {
    if (g.length > 0 && L) {
      if (typeof t > "u") {
        const x = a.slidesGrid[S],
          O = a.slidesGrid[S + I] - x;
        o
          ? a.setTranslate(a.translate - O)
          : (a.slideTo(S + Math.ceil(I), 0, !1, !0),
            n &&
              ((a.touchEventsData.startTranslate =
                a.touchEventsData.startTranslate - O),
              (a.touchEventsData.currentTranslate =
                a.touchEventsData.currentTranslate - O)));
      } else if (n) {
        const x = b ? g.length / u.grid.rows : g.length;
        a.slideTo(a.activeIndex + x, 0, !1, !0),
          (a.touchEventsData.currentTranslate = a.translate);
      }
    } else if (E.length > 0 && y)
      if (typeof t > "u") {
        const x = a.slidesGrid[S],
          O = a.slidesGrid[S - V] - x;
        o
          ? a.setTranslate(a.translate - O)
          : (a.slideTo(S - V, 0, !1, !0),
            n &&
              ((a.touchEventsData.startTranslate =
                a.touchEventsData.startTranslate - O),
              (a.touchEventsData.currentTranslate =
                a.touchEventsData.currentTranslate - O)));
      } else {
        const x = b ? E.length / u.grid.rows : E.length;
        a.slideTo(a.activeIndex - x, 0, !1, !0);
      }
  }
  if (
    ((a.allowSlidePrev = c),
    (a.allowSlideNext = f),
    a.controller && a.controller.control && !l)
  ) {
    const x = {
      slideRealIndex: t,
      direction: s,
      setTranslate: n,
      activeSlideIndex: r,
      byController: !0,
    };
    Array.isArray(a.controller.control)
      ? a.controller.control.forEach((C) => {
          !C.destroyed &&
            C.params.loop &&
            C.loopFix({
              ...x,
              slideTo: C.params.slidesPerView === u.slidesPerView ? e : !1,
            });
        })
      : a.controller.control instanceof a.constructor &&
        a.controller.control.params.loop &&
        a.controller.control.loopFix({
          ...x,
          slideTo:
            a.controller.control.params.slidesPerView === u.slidesPerView
              ? e
              : !1,
        });
  }
  a.emit("loopFix");
}
function Tt() {
  const i = this,
    { params: t, slidesEl: e } = i;
  if (!t.loop || (i.virtual && i.params.virtual.enabled)) return;
  i.recalcSlides();
  const s = [];
  i.slides.forEach((n) => {
    const r =
      typeof n.swiperSlideIndex > "u"
        ? n.getAttribute("data-swiper-slide-index") * 1
        : n.swiperSlideIndex;
    s[r] = n;
  }),
    i.slides.forEach((n) => {
      n.removeAttribute("data-swiper-slide-index");
    }),
    s.forEach((n) => {
      e.append(n);
    }),
    i.recalcSlides(),
    i.slideTo(i.realIndex, 0);
}
var yt = { loopCreate: wt, loopFix: St, loopDestroy: Tt };
function bt(i) {
  const t = this;
  if (
    !t.params.simulateTouch ||
    (t.params.watchOverflow && t.isLocked) ||
    t.params.cssMode
  )
    return;
  const e = t.params.touchEventsTarget === "container" ? t.el : t.wrapperEl;
  t.isElement && (t.__preventObserver__ = !0),
    (e.style.cursor = "move"),
    (e.style.cursor = i ? "grabbing" : "grab"),
    t.isElement &&
      requestAnimationFrame(() => {
        t.__preventObserver__ = !1;
      });
}
function xt() {
  const i = this;
  (i.params.watchOverflow && i.isLocked) ||
    i.params.cssMode ||
    (i.isElement && (i.__preventObserver__ = !0),
    (i[
      i.params.touchEventsTarget === "container" ? "el" : "wrapperEl"
    ].style.cursor = ""),
    i.isElement &&
      requestAnimationFrame(() => {
        i.__preventObserver__ = !1;
      }));
}
var Et = { setGrabCursor: bt, unsetGrabCursor: xt };
function Pt(i, t) {
  t === void 0 && (t = this);
  function e(s) {
    if (!s || s === F() || s === A()) return null;
    s.assignedSlot && (s = s.assignedSlot);
    const n = s.closest(i);
    return !n && !s.getRootNode ? null : n || e(s.getRootNode().host);
  }
  return e(t);
}
function ue(i, t, e) {
  const s = A(),
    { params: n } = i,
    r = n.edgeSwipeDetection,
    l = n.edgeSwipeThreshold;
  return r && (e <= l || e >= s.innerWidth - l)
    ? r === "prevent"
      ? (t.preventDefault(), !0)
      : !1
    : !0;
}
function Mt(i) {
  const t = this,
    e = F();
  let s = i;
  s.originalEvent && (s = s.originalEvent);
  const n = t.touchEventsData;
  if (s.type === "pointerdown") {
    if (n.pointerId !== null && n.pointerId !== s.pointerId) return;
    n.pointerId = s.pointerId;
  } else
    s.type === "touchstart" &&
      s.targetTouches.length === 1 &&
      (n.touchId = s.targetTouches[0].identifier);
  if (s.type === "touchstart") {
    ue(t, s, s.targetTouches[0].pageX);
    return;
  }
  const { params: r, touches: l, enabled: o } = t;
  if (
    !o ||
    (!r.simulateTouch && s.pointerType === "mouse") ||
    (t.animating && r.preventInteractionOnTransition)
  )
    return;
  !t.animating && r.cssMode && r.loop && t.loopFix();
  let a = s.target;
  if (
    (r.touchEventsTarget === "wrapper" && !ze(a, t.wrapperEl)) ||
    ("which" in s && s.which === 3) ||
    ("button" in s && s.button > 0) ||
    (n.isTouched && n.isMoved)
  )
    return;
  const d = !!r.noSwipingClass && r.noSwipingClass !== "",
    c = s.composedPath ? s.composedPath() : s.path;
  d && s.target && s.target.shadowRoot && c && (a = c[0]);
  const f = r.noSwipingSelector ? r.noSwipingSelector : `.${r.noSwipingClass}`,
    p = !!(s.target && s.target.shadowRoot);
  if (r.noSwiping && (p ? Pt(f, a) : a.closest(f))) {
    t.allowClick = !0;
    return;
  }
  if (r.swipeHandler && !a.closest(r.swipeHandler)) return;
  (l.currentX = s.pageX), (l.currentY = s.pageY);
  const u = l.currentX,
    m = l.currentY;
  if (!ue(t, s, u)) return;
  Object.assign(n, {
    isTouched: !0,
    isMoved: !1,
    allowTouchCallbacks: !0,
    isScrolling: void 0,
    startMoving: void 0,
  }),
    (l.startX = u),
    (l.startY = m),
    (n.touchStartTime = R()),
    (t.allowClick = !0),
    t.updateSize(),
    (t.swipeDirection = void 0),
    r.threshold > 0 && (n.allowThresholdMove = !1);
  let h = !0;
  a.matches(n.focusableElements) &&
    ((h = !1), a.nodeName === "SELECT" && (n.isTouched = !1)),
    e.activeElement &&
      e.activeElement.matches(n.focusableElements) &&
      e.activeElement !== a &&
      (s.pointerType === "mouse" ||
        (s.pointerType !== "mouse" && !a.matches(n.focusableElements))) &&
      e.activeElement.blur();
  const T = h && t.allowTouchMove && r.touchStartPreventDefault;
  (r.touchStartForcePreventDefault || T) &&
    !a.isContentEditable &&
    s.preventDefault(),
    r.freeMode &&
      r.freeMode.enabled &&
      t.freeMode &&
      t.animating &&
      !r.cssMode &&
      t.freeMode.onTouchStart(),
    t.emit("touchStart", s);
}
function It(i) {
  const t = F(),
    e = this,
    s = e.touchEventsData,
    { params: n, touches: r, rtlTranslate: l, enabled: o } = e;
  if (!o || (!n.simulateTouch && i.pointerType === "mouse")) return;
  let a = i;
  if (
    (a.originalEvent && (a = a.originalEvent),
    a.type === "pointermove" &&
      (s.touchId !== null || a.pointerId !== s.pointerId))
  )
    return;
  let d;
  if (a.type === "touchmove") {
    if (
      ((d = [...a.changedTouches].filter((y) => y.identifier === s.touchId)[0]),
      !d || d.identifier !== s.touchId)
    )
      return;
  } else d = a;
  if (!s.isTouched) {
    s.startMoving && s.isScrolling && e.emit("touchMoveOpposite", a);
    return;
  }
  const c = d.pageX,
    f = d.pageY;
  if (a.preventedByNestedSwiper) {
    (r.startX = c), (r.startY = f);
    return;
  }
  if (!e.allowTouchMove) {
    a.target.matches(s.focusableElements) || (e.allowClick = !1),
      s.isTouched &&
        (Object.assign(r, { startX: c, startY: f, currentX: c, currentY: f }),
        (s.touchStartTime = R()));
    return;
  }
  if (n.touchReleaseOnEdges && !n.loop) {
    if (e.isVertical()) {
      if (
        (f < r.startY && e.translate <= e.maxTranslate()) ||
        (f > r.startY && e.translate >= e.minTranslate())
      ) {
        (s.isTouched = !1), (s.isMoved = !1);
        return;
      }
    } else if (
      (c < r.startX && e.translate <= e.maxTranslate()) ||
      (c > r.startX && e.translate >= e.minTranslate())
    )
      return;
  }
  if (
    (t.activeElement &&
      t.activeElement.matches(s.focusableElements) &&
      t.activeElement !== a.target &&
      a.pointerType !== "mouse" &&
      t.activeElement.blur(),
    t.activeElement &&
      a.target === t.activeElement &&
      a.target.matches(s.focusableElements))
  ) {
    (s.isMoved = !0), (e.allowClick = !1);
    return;
  }
  s.allowTouchCallbacks && e.emit("touchMove", a),
    (r.previousX = r.currentX),
    (r.previousY = r.currentY),
    (r.currentX = c),
    (r.currentY = f);
  const p = r.currentX - r.startX,
    u = r.currentY - r.startY;
  if (e.params.threshold && Math.sqrt(p ** 2 + u ** 2) < e.params.threshold)
    return;
  if (typeof s.isScrolling > "u") {
    let y;
    (e.isHorizontal() && r.currentY === r.startY) ||
    (e.isVertical() && r.currentX === r.startX)
      ? (s.isScrolling = !1)
      : p * p + u * u >= 25 &&
        ((y = (Math.atan2(Math.abs(u), Math.abs(p)) * 180) / Math.PI),
        (s.isScrolling = e.isHorizontal()
          ? y > n.touchAngle
          : 90 - y > n.touchAngle));
  }
  if (
    (s.isScrolling && e.emit("touchMoveOpposite", a),
    typeof s.startMoving > "u" &&
      (r.currentX !== r.startX || r.currentY !== r.startY) &&
      (s.startMoving = !0),
    s.isScrolling ||
      (a.type === "touchmove" && s.preventTouchMoveFromPointerMove))
  ) {
    s.isTouched = !1;
    return;
  }
  if (!s.startMoving) return;
  (e.allowClick = !1),
    !n.cssMode && a.cancelable && a.preventDefault(),
    n.touchMoveStopPropagation && !n.nested && a.stopPropagation();
  let m = e.isHorizontal() ? p : u,
    h = e.isHorizontal() ? r.currentX - r.previousX : r.currentY - r.previousY;
  n.oneWayMovement &&
    ((m = Math.abs(m) * (l ? 1 : -1)), (h = Math.abs(h) * (l ? 1 : -1))),
    (r.diff = m),
    (m *= n.touchRatio),
    l && ((m = -m), (h = -h));
  const T = e.touchesDirection;
  (e.swipeDirection = m > 0 ? "prev" : "next"),
    (e.touchesDirection = h > 0 ? "prev" : "next");
  const v = e.params.loop && !n.cssMode,
    b =
      (e.touchesDirection === "next" && e.allowSlideNext) ||
      (e.touchesDirection === "prev" && e.allowSlidePrev);
  if (!s.isMoved) {
    if (
      (v && b && e.loopFix({ direction: e.swipeDirection }),
      (s.startTranslate = e.getTranslate()),
      e.setTransition(0),
      e.animating)
    ) {
      const y = new window.CustomEvent("transitionend", {
        bubbles: !0,
        cancelable: !0,
        detail: { bySwiperTouchMove: !0 },
      });
      e.wrapperEl.dispatchEvent(y);
    }
    (s.allowMomentumBounce = !1),
      n.grabCursor &&
        (e.allowSlideNext === !0 || e.allowSlidePrev === !0) &&
        e.setGrabCursor(!0),
      e.emit("sliderFirstMove", a);
  }
  let g;
  if (
    (new Date().getTime(),
    s.isMoved &&
      s.allowThresholdMove &&
      T !== e.touchesDirection &&
      v &&
      b &&
      Math.abs(m) >= 1)
  ) {
    Object.assign(r, {
      startX: c,
      startY: f,
      currentX: c,
      currentY: f,
      startTranslate: s.currentTranslate,
    }),
      (s.loopSwapReset = !0),
      (s.startTranslate = s.currentTranslate);
    return;
  }
  e.emit("sliderMove", a),
    (s.isMoved = !0),
    (s.currentTranslate = m + s.startTranslate);
  let E = !0,
    S = n.resistanceRatio;
  if (
    (n.touchReleaseOnEdges && (S = 0),
    m > 0
      ? (v &&
          b &&
          !g &&
          s.allowThresholdMove &&
          s.currentTranslate >
            (n.centeredSlides
              ? e.minTranslate() -
                e.slidesSizesGrid[e.activeIndex + 1] -
                (n.slidesPerView !== "auto" &&
                e.slides.length - n.slidesPerView >= 2
                  ? e.slidesSizesGrid[e.activeIndex + 1] + e.params.spaceBetween
                  : 0) -
                e.params.spaceBetween
              : e.minTranslate()) &&
          e.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0,
          }),
        s.currentTranslate > e.minTranslate() &&
          ((E = !1),
          n.resistance &&
            (s.currentTranslate =
              e.minTranslate() -
              1 +
              (-e.minTranslate() + s.startTranslate + m) ** S)))
      : m < 0 &&
        (v &&
          b &&
          !g &&
          s.allowThresholdMove &&
          s.currentTranslate <
            (n.centeredSlides
              ? e.maxTranslate() +
                e.slidesSizesGrid[e.slidesSizesGrid.length - 1] +
                e.params.spaceBetween +
                (n.slidesPerView !== "auto" &&
                e.slides.length - n.slidesPerView >= 2
                  ? e.slidesSizesGrid[e.slidesSizesGrid.length - 1] +
                    e.params.spaceBetween
                  : 0)
              : e.maxTranslate()) &&
          e.loopFix({
            direction: "next",
            setTranslate: !0,
            activeSlideIndex:
              e.slides.length -
              (n.slidesPerView === "auto"
                ? e.slidesPerViewDynamic()
                : Math.ceil(parseFloat(n.slidesPerView, 10))),
          }),
        s.currentTranslate < e.maxTranslate() &&
          ((E = !1),
          n.resistance &&
            (s.currentTranslate =
              e.maxTranslate() +
              1 -
              (e.maxTranslate() - s.startTranslate - m) ** S))),
    E && (a.preventedByNestedSwiper = !0),
    !e.allowSlideNext &&
      e.swipeDirection === "next" &&
      s.currentTranslate < s.startTranslate &&
      (s.currentTranslate = s.startTranslate),
    !e.allowSlidePrev &&
      e.swipeDirection === "prev" &&
      s.currentTranslate > s.startTranslate &&
      (s.currentTranslate = s.startTranslate),
    !e.allowSlidePrev &&
      !e.allowSlideNext &&
      (s.currentTranslate = s.startTranslate),
    n.threshold > 0)
  )
    if (Math.abs(m) > n.threshold || s.allowThresholdMove) {
      if (!s.allowThresholdMove) {
        (s.allowThresholdMove = !0),
          (r.startX = r.currentX),
          (r.startY = r.currentY),
          (s.currentTranslate = s.startTranslate),
          (r.diff = e.isHorizontal()
            ? r.currentX - r.startX
            : r.currentY - r.startY);
        return;
      }
    } else {
      s.currentTranslate = s.startTranslate;
      return;
    }
  !n.followFinger ||
    n.cssMode ||
    (((n.freeMode && n.freeMode.enabled && e.freeMode) ||
      n.watchSlidesProgress) &&
      (e.updateActiveIndex(), e.updateSlidesClasses()),
    n.freeMode && n.freeMode.enabled && e.freeMode && e.freeMode.onTouchMove(),
    e.updateProgress(s.currentTranslate),
    e.setTranslate(s.currentTranslate));
}
function Ct(i) {
  const t = this,
    e = t.touchEventsData;
  let s = i;
  s.originalEvent && (s = s.originalEvent);
  let n;
  if (s.type === "touchend" || s.type === "touchcancel") {
    if (
      ((n = [...s.changedTouches].filter((S) => S.identifier === e.touchId)[0]),
      !n || n.identifier !== e.touchId)
    )
      return;
  } else {
    if (e.touchId !== null || s.pointerId !== e.pointerId) return;
    n = s;
  }
  if (
    ["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(
      s.type
    ) &&
    !(
      ["pointercancel", "contextmenu"].includes(s.type) &&
      (t.browser.isSafari || t.browser.isWebView)
    )
  )
    return;
  (e.pointerId = null), (e.touchId = null);
  const {
    params: l,
    touches: o,
    rtlTranslate: a,
    slidesGrid: d,
    enabled: c,
  } = t;
  if (!c || (!l.simulateTouch && s.pointerType === "mouse")) return;
  if (
    (e.allowTouchCallbacks && t.emit("touchEnd", s),
    (e.allowTouchCallbacks = !1),
    !e.isTouched)
  ) {
    e.isMoved && l.grabCursor && t.setGrabCursor(!1),
      (e.isMoved = !1),
      (e.startMoving = !1);
    return;
  }
  l.grabCursor &&
    e.isMoved &&
    e.isTouched &&
    (t.allowSlideNext === !0 || t.allowSlidePrev === !0) &&
    t.setGrabCursor(!1);
  const f = R(),
    p = f - e.touchStartTime;
  if (t.allowClick) {
    const S = s.path || (s.composedPath && s.composedPath());
    t.updateClickedSlide((S && S[0]) || s.target, S),
      t.emit("tap click", s),
      p < 300 &&
        f - e.lastClickTime < 300 &&
        t.emit("doubleTap doubleClick", s);
  }
  if (
    ((e.lastClickTime = R()),
    Q(() => {
      t.destroyed || (t.allowClick = !0);
    }),
    !e.isTouched ||
      !e.isMoved ||
      !t.swipeDirection ||
      (o.diff === 0 && !e.loopSwapReset) ||
      (e.currentTranslate === e.startTranslate && !e.loopSwapReset))
  ) {
    (e.isTouched = !1), (e.isMoved = !1), (e.startMoving = !1);
    return;
  }
  (e.isTouched = !1), (e.isMoved = !1), (e.startMoving = !1);
  let u;
  if (
    (l.followFinger
      ? (u = a ? t.translate : -t.translate)
      : (u = -e.currentTranslate),
    l.cssMode)
  )
    return;
  if (l.freeMode && l.freeMode.enabled) {
    t.freeMode.onTouchEnd({ currentPos: u });
    return;
  }
  const m = u >= -t.maxTranslate() && !t.params.loop;
  let h = 0,
    T = t.slidesSizesGrid[0];
  for (
    let S = 0;
    S < d.length;
    S += S < l.slidesPerGroupSkip ? 1 : l.slidesPerGroup
  ) {
    const y = S < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
    typeof d[S + y] < "u"
      ? (m || (u >= d[S] && u < d[S + y])) && ((h = S), (T = d[S + y] - d[S]))
      : (m || u >= d[S]) && ((h = S), (T = d[d.length - 1] - d[d.length - 2]));
  }
  let v = null,
    b = null;
  l.rewind &&
    (t.isBeginning
      ? (b =
          l.virtual && l.virtual.enabled && t.virtual
            ? t.virtual.slides.length - 1
            : t.slides.length - 1)
      : t.isEnd && (v = 0));
  const g = (u - d[h]) / T,
    E = h < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
  if (p > l.longSwipesMs) {
    if (!l.longSwipes) {
      t.slideTo(t.activeIndex);
      return;
    }
    t.swipeDirection === "next" &&
      (g >= l.longSwipesRatio
        ? t.slideTo(l.rewind && t.isEnd ? v : h + E)
        : t.slideTo(h)),
      t.swipeDirection === "prev" &&
        (g > 1 - l.longSwipesRatio
          ? t.slideTo(h + E)
          : b !== null && g < 0 && Math.abs(g) > l.longSwipesRatio
          ? t.slideTo(b)
          : t.slideTo(h));
  } else {
    if (!l.shortSwipes) {
      t.slideTo(t.activeIndex);
      return;
    }
    t.navigation &&
    (s.target === t.navigation.nextEl || s.target === t.navigation.prevEl)
      ? s.target === t.navigation.nextEl
        ? t.slideTo(h + E)
        : t.slideTo(h)
      : (t.swipeDirection === "next" && t.slideTo(v !== null ? v : h + E),
        t.swipeDirection === "prev" && t.slideTo(b !== null ? b : h));
  }
}
function pe() {
  const i = this,
    { params: t, el: e } = i;
  if (e && e.offsetWidth === 0) return;
  t.breakpoints && i.setBreakpoint();
  const { allowSlideNext: s, allowSlidePrev: n, snapGrid: r } = i,
    l = i.virtual && i.params.virtual.enabled;
  (i.allowSlideNext = !0),
    (i.allowSlidePrev = !0),
    i.updateSize(),
    i.updateSlides(),
    i.updateSlidesClasses();
  const o = l && t.loop;
  (t.slidesPerView === "auto" || t.slidesPerView > 1) &&
  i.isEnd &&
  !i.isBeginning &&
  !i.params.centeredSlides &&
  !o
    ? i.slideTo(i.slides.length - 1, 0, !1, !0)
    : i.params.loop && !l
    ? i.slideToLoop(i.realIndex, 0, !1, !0)
    : i.slideTo(i.activeIndex, 0, !1, !0),
    i.autoplay &&
      i.autoplay.running &&
      i.autoplay.paused &&
      (clearTimeout(i.autoplay.resizeTimeout),
      (i.autoplay.resizeTimeout = setTimeout(() => {
        i.autoplay &&
          i.autoplay.running &&
          i.autoplay.paused &&
          i.autoplay.resume();
      }, 500))),
    (i.allowSlidePrev = n),
    (i.allowSlideNext = s),
    i.params.watchOverflow && r !== i.snapGrid && i.checkOverflow();
}
function Lt(i) {
  const t = this;
  t.enabled &&
    (t.allowClick ||
      (t.params.preventClicks && i.preventDefault(),
      t.params.preventClicksPropagation &&
        t.animating &&
        (i.stopPropagation(), i.stopImmediatePropagation())));
}
function Ot() {
  const i = this,
    { wrapperEl: t, rtlTranslate: e, enabled: s } = i;
  if (!s) return;
  (i.previousTranslate = i.translate),
    i.isHorizontal()
      ? (i.translate = -t.scrollLeft)
      : (i.translate = -t.scrollTop),
    i.translate === 0 && (i.translate = 0),
    i.updateActiveIndex(),
    i.updateSlidesClasses();
  let n;
  const r = i.maxTranslate() - i.minTranslate();
  r === 0 ? (n = 0) : (n = (i.translate - i.minTranslate()) / r),
    n !== i.progress && i.updateProgress(e ? -i.translate : i.translate),
    i.emit("setTranslate", i.translate, !1);
}
function zt(i) {
  const t = this;
  _(t, i.target),
    !(
      t.params.cssMode ||
      (t.params.slidesPerView !== "auto" && !t.params.autoHeight)
    ) && t.update();
}
function At() {
  const i = this;
  i.documentTouchHandlerProceeded ||
    ((i.documentTouchHandlerProceeded = !0),
    i.params.touchReleaseOnEdges && (i.el.style.touchAction = "auto"));
}
const ye = (i, t) => {
  const e = F(),
    { params: s, el: n, wrapperEl: r, device: l } = i,
    o = !!s.nested,
    a = t === "on" ? "addEventListener" : "removeEventListener",
    d = t;
  !n ||
    typeof n == "string" ||
    (e[a]("touchstart", i.onDocumentTouchStart, { passive: !1, capture: o }),
    n[a]("touchstart", i.onTouchStart, { passive: !1 }),
    n[a]("pointerdown", i.onTouchStart, { passive: !1 }),
    e[a]("touchmove", i.onTouchMove, { passive: !1, capture: o }),
    e[a]("pointermove", i.onTouchMove, { passive: !1, capture: o }),
    e[a]("touchend", i.onTouchEnd, { passive: !0 }),
    e[a]("pointerup", i.onTouchEnd, { passive: !0 }),
    e[a]("pointercancel", i.onTouchEnd, { passive: !0 }),
    e[a]("touchcancel", i.onTouchEnd, { passive: !0 }),
    e[a]("pointerout", i.onTouchEnd, { passive: !0 }),
    e[a]("pointerleave", i.onTouchEnd, { passive: !0 }),
    e[a]("contextmenu", i.onTouchEnd, { passive: !0 }),
    (s.preventClicks || s.preventClicksPropagation) &&
      n[a]("click", i.onClick, !0),
    s.cssMode && r[a]("scroll", i.onScroll),
    s.updateOnWindowResize
      ? i[d](
          l.ios || l.android
            ? "resize orientationchange observerUpdate"
            : "resize observerUpdate",
          pe,
          !0
        )
      : i[d]("observerUpdate", pe, !0),
    n[a]("load", i.onLoad, { capture: !0 }));
};
function Gt() {
  const i = this,
    { params: t } = i;
  (i.onTouchStart = Mt.bind(i)),
    (i.onTouchMove = It.bind(i)),
    (i.onTouchEnd = Ct.bind(i)),
    (i.onDocumentTouchStart = At.bind(i)),
    t.cssMode && (i.onScroll = Ot.bind(i)),
    (i.onClick = Lt.bind(i)),
    (i.onLoad = zt.bind(i)),
    ye(i, "on");
}
function kt() {
  ye(this, "off");
}
var Vt = { attachEvents: Gt, detachEvents: kt };
const me = (i, t) => i.grid && t.grid && t.grid.rows > 1;
function Dt() {
  const i = this,
    { realIndex: t, initialized: e, params: s, el: n } = i,
    r = s.breakpoints;
  if (!r || (r && Object.keys(r).length === 0)) return;
  const l = i.getBreakpoint(r, i.params.breakpointsBase, i.el);
  if (!l || i.currentBreakpoint === l) return;
  const a = (l in r ? r[l] : void 0) || i.originalParams,
    d = me(i, s),
    c = me(i, a),
    f = i.params.grabCursor,
    p = a.grabCursor,
    u = s.enabled;
  d && !c
    ? (n.classList.remove(
        `${s.containerModifierClass}grid`,
        `${s.containerModifierClass}grid-column`
      ),
      i.emitContainerClasses())
    : !d &&
      c &&
      (n.classList.add(`${s.containerModifierClass}grid`),
      ((a.grid.fill && a.grid.fill === "column") ||
        (!a.grid.fill && s.grid.fill === "column")) &&
        n.classList.add(`${s.containerModifierClass}grid-column`),
      i.emitContainerClasses()),
    f && !p ? i.unsetGrabCursor() : !f && p && i.setGrabCursor(),
    ["navigation", "pagination", "scrollbar"].forEach((g) => {
      if (typeof a[g] > "u") return;
      const E = s[g] && s[g].enabled,
        S = a[g] && a[g].enabled;
      E && !S && i[g].disable(), !E && S && i[g].enable();
    });
  const m = a.direction && a.direction !== s.direction,
    h = s.loop && (a.slidesPerView !== s.slidesPerView || m),
    T = s.loop;
  m && e && i.changeDirection(), z(i.params, a);
  const v = i.params.enabled,
    b = i.params.loop;
  Object.assign(i, {
    allowTouchMove: i.params.allowTouchMove,
    allowSlideNext: i.params.allowSlideNext,
    allowSlidePrev: i.params.allowSlidePrev,
  }),
    u && !v ? i.disable() : !u && v && i.enable(),
    (i.currentBreakpoint = l),
    i.emit("_beforeBreakpoint", a),
    e &&
      (h
        ? (i.loopDestroy(), i.loopCreate(t), i.updateSlides())
        : !T && b
        ? (i.loopCreate(t), i.updateSlides())
        : T && !b && i.loopDestroy()),
    i.emit("breakpoint", a);
}
function $t(i, t, e) {
  if ((t === void 0 && (t = "window"), !i || (t === "container" && !e))) return;
  let s = !1;
  const n = A(),
    r = t === "window" ? n.innerHeight : e.clientHeight,
    l = Object.keys(i).map((o) => {
      if (typeof o == "string" && o.indexOf("@") === 0) {
        const a = parseFloat(o.substr(1));
        return { value: r * a, point: o };
      }
      return { value: o, point: o };
    });
  l.sort((o, a) => parseInt(o.value, 10) - parseInt(a.value, 10));
  for (let o = 0; o < l.length; o += 1) {
    const { point: a, value: d } = l[o];
    t === "window"
      ? n.matchMedia(`(min-width: ${d}px)`).matches && (s = a)
      : d <= e.clientWidth && (s = a);
  }
  return s || "max";
}
var Ft = { setBreakpoint: Dt, getBreakpoint: $t };
function Bt(i, t) {
  const e = [];
  return (
    i.forEach((s) => {
      typeof s == "object"
        ? Object.keys(s).forEach((n) => {
            s[n] && e.push(t + n);
          })
        : typeof s == "string" && e.push(t + s);
    }),
    e
  );
}
function Nt() {
  const i = this,
    { classNames: t, params: e, rtl: s, el: n, device: r } = i,
    l = Bt(
      [
        "initialized",
        e.direction,
        { "free-mode": i.params.freeMode && e.freeMode.enabled },
        { autoheight: e.autoHeight },
        { rtl: s },
        { grid: e.grid && e.grid.rows > 1 },
        {
          "grid-column": e.grid && e.grid.rows > 1 && e.grid.fill === "column",
        },
        { android: r.android },
        { ios: r.ios },
        { "css-mode": e.cssMode },
        { centered: e.cssMode && e.centeredSlides },
        { "watch-progress": e.watchSlidesProgress },
      ],
      e.containerModifierClass
    );
  t.push(...l), n.classList.add(...t), i.emitContainerClasses();
}
function _t() {
  const i = this,
    { el: t, classNames: e } = i;
  !t ||
    typeof t == "string" ||
    (t.classList.remove(...e), i.emitContainerClasses());
}
var Rt = { addClasses: Nt, removeClasses: _t };
function Ht() {
  const i = this,
    { isLocked: t, params: e } = i,
    { slidesOffsetBefore: s } = e;
  if (s) {
    const n = i.slides.length - 1,
      r = i.slidesGrid[n] + i.slidesSizesGrid[n] + s * 2;
    i.isLocked = i.size > r;
  } else i.isLocked = i.snapGrid.length === 1;
  e.allowSlideNext === !0 && (i.allowSlideNext = !i.isLocked),
    e.allowSlidePrev === !0 && (i.allowSlidePrev = !i.isLocked),
    t && t !== i.isLocked && (i.isEnd = !1),
    t !== i.isLocked && i.emit(i.isLocked ? "lock" : "unlock");
}
var Wt = { checkOverflow: Ht },
  he = {
    init: !0,
    direction: "horizontal",
    oneWayMovement: !1,
    swiperElementNodeName: "SWIPER-CONTAINER",
    touchEventsTarget: "wrapper",
    initialSlide: 0,
    speed: 300,
    cssMode: !1,
    updateOnWindowResize: !0,
    resizeObserver: !0,
    nested: !1,
    createElements: !1,
    eventsPrefix: "swiper",
    enabled: !0,
    focusableElements: "input, select, option, textarea, button, video, label",
    width: null,
    height: null,
    preventInteractionOnTransition: !1,
    userAgent: null,
    url: null,
    edgeSwipeDetection: !1,
    edgeSwipeThreshold: 20,
    autoHeight: !1,
    setWrapperSize: !1,
    virtualTranslate: !1,
    effect: "slide",
    breakpoints: void 0,
    breakpointsBase: "window",
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: !1,
    centeredSlides: !1,
    centeredSlidesBounds: !1,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: !0,
    centerInsufficientSlides: !1,
    watchOverflow: !0,
    roundLengths: !1,
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: !0,
    shortSwipes: !0,
    longSwipes: !0,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: !0,
    allowTouchMove: !0,
    threshold: 5,
    touchMoveStopPropagation: !1,
    touchStartPreventDefault: !0,
    touchStartForcePreventDefault: !1,
    touchReleaseOnEdges: !1,
    uniqueNavElements: !0,
    resistance: !0,
    resistanceRatio: 0.85,
    watchSlidesProgress: !1,
    grabCursor: !1,
    preventClicks: !0,
    preventClicksPropagation: !0,
    slideToClickedSlide: !1,
    loop: !1,
    loopAddBlankSlides: !0,
    loopAdditionalSlides: 0,
    loopPreventsSliding: !0,
    rewind: !1,
    allowSlidePrev: !0,
    allowSlideNext: !0,
    swipeHandler: null,
    noSwiping: !0,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    passiveListeners: !0,
    maxBackfaceHiddenSlides: 10,
    containerModifierClass: "swiper-",
    slideClass: "swiper-slide",
    slideBlankClass: "swiper-slide-blank",
    slideActiveClass: "swiper-slide-active",
    slideVisibleClass: "swiper-slide-visible",
    slideFullyVisibleClass: "swiper-slide-fully-visible",
    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-prev",
    wrapperClass: "swiper-wrapper",
    lazyPreloaderClass: "swiper-lazy-preloader",
    lazyPreloadPrevNext: 0,
    runCallbacksOnInit: !0,
    _emitClasses: !1,
  };
function jt(i, t) {
  return function (s) {
    s === void 0 && (s = {});
    const n = Object.keys(s)[0],
      r = s[n];
    if (typeof r != "object" || r === null) {
      z(t, s);
      return;
    }
    if (
      (i[n] === !0 && (i[n] = { enabled: !0 }),
      n === "navigation" &&
        i[n] &&
        i[n].enabled &&
        !i[n].prevEl &&
        !i[n].nextEl &&
        (i[n].auto = !0),
      ["pagination", "scrollbar"].indexOf(n) >= 0 &&
        i[n] &&
        i[n].enabled &&
        !i[n].el &&
        (i[n].auto = !0),
      !(n in i && "enabled" in r))
    ) {
      z(t, s);
      return;
    }
    typeof i[n] == "object" && !("enabled" in i[n]) && (i[n].enabled = !0),
      i[n] || (i[n] = { enabled: !1 }),
      z(t, s);
  };
}
const Z = {
    eventsEmitter: Re,
    update: Qe,
    translate: nt,
    transition: dt,
    slide: vt,
    loop: yt,
    grabCursor: Et,
    events: Vt,
    breakpoints: Ft,
    checkOverflow: Wt,
    classes: Rt,
  },
  J = {};
class G {
  constructor() {
    let t, e;
    for (var s = arguments.length, n = new Array(s), r = 0; r < s; r++)
      n[r] = arguments[r];
    n.length === 1 &&
    n[0].constructor &&
    Object.prototype.toString.call(n[0]).slice(8, -1) === "Object"
      ? (e = n[0])
      : ([t, e] = n),
      e || (e = {}),
      (e = z({}, e)),
      t && !e.el && (e.el = t);
    const l = F();
    if (
      e.el &&
      typeof e.el == "string" &&
      l.querySelectorAll(e.el).length > 1
    ) {
      const c = [];
      return (
        l.querySelectorAll(e.el).forEach((f) => {
          const p = z({}, e, { el: f });
          c.push(new G(p));
        }),
        c
      );
    }
    const o = this;
    (o.__swiper__ = !0),
      (o.support = we()),
      (o.device = Se({ userAgent: e.userAgent })),
      (o.browser = Be()),
      (o.eventsListeners = {}),
      (o.eventsAnyListeners = []),
      (o.modules = [...o.__modules__]),
      e.modules && Array.isArray(e.modules) && o.modules.push(...e.modules);
    const a = {};
    o.modules.forEach((c) => {
      c({
        params: e,
        swiper: o,
        extendParams: jt(e, a),
        on: o.on.bind(o),
        once: o.once.bind(o),
        off: o.off.bind(o),
        emit: o.emit.bind(o),
      });
    });
    const d = z({}, he, a);
    return (
      (o.params = z({}, d, J, e)),
      (o.originalParams = z({}, o.params)),
      (o.passedParams = z({}, e)),
      o.params &&
        o.params.on &&
        Object.keys(o.params.on).forEach((c) => {
          o.on(c, o.params.on[c]);
        }),
      o.params && o.params.onAny && o.onAny(o.params.onAny),
      Object.assign(o, {
        enabled: o.params.enabled,
        el: t,
        classNames: [],
        slides: [],
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        isHorizontal() {
          return o.params.direction === "horizontal";
        },
        isVertical() {
          return o.params.direction === "vertical";
        },
        activeIndex: 0,
        realIndex: 0,
        isBeginning: !0,
        isEnd: !1,
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: !1,
        cssOverflowAdjustment() {
          return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
        },
        allowSlideNext: o.params.allowSlideNext,
        allowSlidePrev: o.params.allowSlidePrev,
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          focusableElements: o.params.focusableElements,
          lastClickTime: 0,
          clickTimeout: void 0,
          velocities: [],
          allowMomentumBounce: void 0,
          startMoving: void 0,
          pointerId: null,
          touchId: null,
        },
        allowClick: !0,
        allowTouchMove: o.params.allowTouchMove,
        touches: { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 },
        imagesToLoad: [],
        imagesLoaded: 0,
      }),
      o.emit("_swiper"),
      o.params.init && o.init(),
      o
    );
  }
  getDirectionLabel(t) {
    return this.isHorizontal()
      ? t
      : {
          width: "height",
          "margin-top": "margin-left",
          "margin-bottom ": "margin-right",
          "margin-left": "margin-top",
          "margin-right": "margin-bottom",
          "padding-left": "padding-top",
          "padding-right": "padding-bottom",
          marginRight: "marginBottom",
        }[t];
  }
  getSlideIndex(t) {
    const { slidesEl: e, params: s } = this,
      n = k(e, `.${s.slideClass}, swiper-slide`),
      r = de(n[0]);
    return de(t) - r;
  }
  getSlideIndexByData(t) {
    return this.getSlideIndex(
      this.slides.filter(
        (e) => e.getAttribute("data-swiper-slide-index") * 1 === t
      )[0]
    );
  }
  recalcSlides() {
    const t = this,
      { slidesEl: e, params: s } = t;
    t.slides = k(e, `.${s.slideClass}, swiper-slide`);
  }
  enable() {
    const t = this;
    t.enabled ||
      ((t.enabled = !0),
      t.params.grabCursor && t.setGrabCursor(),
      t.emit("enable"));
  }
  disable() {
    const t = this;
    t.enabled &&
      ((t.enabled = !1),
      t.params.grabCursor && t.unsetGrabCursor(),
      t.emit("disable"));
  }
  setProgress(t, e) {
    const s = this;
    t = Math.min(Math.max(t, 0), 1);
    const n = s.minTranslate(),
      l = (s.maxTranslate() - n) * t + n;
    s.translateTo(l, typeof e > "u" ? 0 : e),
      s.updateActiveIndex(),
      s.updateSlidesClasses();
  }
  emitContainerClasses() {
    const t = this;
    if (!t.params._emitClasses || !t.el) return;
    const e = t.el.className
      .split(" ")
      .filter(
        (s) =>
          s.indexOf("swiper") === 0 ||
          s.indexOf(t.params.containerModifierClass) === 0
      );
    t.emit("_containerClasses", e.join(" "));
  }
  getSlideClasses(t) {
    const e = this;
    return e.destroyed
      ? ""
      : t.className
          .split(" ")
          .filter(
            (s) =>
              s.indexOf("swiper-slide") === 0 ||
              s.indexOf(e.params.slideClass) === 0
          )
          .join(" ");
  }
  emitSlidesClasses() {
    const t = this;
    if (!t.params._emitClasses || !t.el) return;
    const e = [];
    t.slides.forEach((s) => {
      const n = t.getSlideClasses(s);
      e.push({ slideEl: s, classNames: n }), t.emit("_slideClass", s, n);
    }),
      t.emit("_slideClasses", e);
  }
  slidesPerViewDynamic(t, e) {
    t === void 0 && (t = "current"), e === void 0 && (e = !1);
    const s = this,
      {
        params: n,
        slides: r,
        slidesGrid: l,
        slidesSizesGrid: o,
        size: a,
        activeIndex: d,
      } = s;
    let c = 1;
    if (typeof n.slidesPerView == "number") return n.slidesPerView;
    if (n.centeredSlides) {
      let f = r[d] ? Math.ceil(r[d].swiperSlideSize) : 0,
        p;
      for (let u = d + 1; u < r.length; u += 1)
        r[u] &&
          !p &&
          ((f += Math.ceil(r[u].swiperSlideSize)), (c += 1), f > a && (p = !0));
      for (let u = d - 1; u >= 0; u -= 1)
        r[u] &&
          !p &&
          ((f += r[u].swiperSlideSize), (c += 1), f > a && (p = !0));
    } else if (t === "current")
      for (let f = d + 1; f < r.length; f += 1)
        (e ? l[f] + o[f] - l[d] < a : l[f] - l[d] < a) && (c += 1);
    else for (let f = d - 1; f >= 0; f -= 1) l[d] - l[f] < a && (c += 1);
    return c;
  }
  update() {
    const t = this;
    if (!t || t.destroyed) return;
    const { snapGrid: e, params: s } = t;
    s.breakpoints && t.setBreakpoint(),
      [...t.el.querySelectorAll('[loading="lazy"]')].forEach((l) => {
        l.complete && _(t, l);
      }),
      t.updateSize(),
      t.updateSlides(),
      t.updateProgress(),
      t.updateSlidesClasses();
    function n() {
      const l = t.rtlTranslate ? t.translate * -1 : t.translate,
        o = Math.min(Math.max(l, t.maxTranslate()), t.minTranslate());
      t.setTranslate(o), t.updateActiveIndex(), t.updateSlidesClasses();
    }
    let r;
    if (s.freeMode && s.freeMode.enabled && !s.cssMode)
      n(), s.autoHeight && t.updateAutoHeight();
    else {
      if (
        (s.slidesPerView === "auto" || s.slidesPerView > 1) &&
        t.isEnd &&
        !s.centeredSlides
      ) {
        const l = t.virtual && s.virtual.enabled ? t.virtual.slides : t.slides;
        r = t.slideTo(l.length - 1, 0, !1, !0);
      } else r = t.slideTo(t.activeIndex, 0, !1, !0);
      r || n();
    }
    s.watchOverflow && e !== t.snapGrid && t.checkOverflow(), t.emit("update");
  }
  changeDirection(t, e) {
    e === void 0 && (e = !0);
    const s = this,
      n = s.params.direction;
    return (
      t || (t = n === "horizontal" ? "vertical" : "horizontal"),
      t === n ||
        (t !== "horizontal" && t !== "vertical") ||
        (s.el.classList.remove(`${s.params.containerModifierClass}${n}`),
        s.el.classList.add(`${s.params.containerModifierClass}${t}`),
        s.emitContainerClasses(),
        (s.params.direction = t),
        s.slides.forEach((r) => {
          t === "vertical" ? (r.style.width = "") : (r.style.height = "");
        }),
        s.emit("changeDirection"),
        e && s.update()),
      s
    );
  }
  changeLanguageDirection(t) {
    const e = this;
    (e.rtl && t === "rtl") ||
      (!e.rtl && t === "ltr") ||
      ((e.rtl = t === "rtl"),
      (e.rtlTranslate = e.params.direction === "horizontal" && e.rtl),
      e.rtl
        ? (e.el.classList.add(`${e.params.containerModifierClass}rtl`),
          (e.el.dir = "rtl"))
        : (e.el.classList.remove(`${e.params.containerModifierClass}rtl`),
          (e.el.dir = "ltr")),
      e.update());
  }
  mount(t) {
    const e = this;
    if (e.mounted) return !0;
    let s = t || e.params.el;
    if ((typeof s == "string" && (s = document.querySelector(s)), !s))
      return !1;
    (s.swiper = e),
      s.parentNode &&
        s.parentNode.host &&
        s.parentNode.host.nodeName ===
          e.params.swiperElementNodeName.toUpperCase() &&
        (e.isElement = !0);
    const n = () =>
      `.${(e.params.wrapperClass || "").trim().split(" ").join(".")}`;
    let l =
      s && s.shadowRoot && s.shadowRoot.querySelector
        ? s.shadowRoot.querySelector(n())
        : k(s, n())[0];
    return (
      !l &&
        e.params.createElements &&
        ((l = W("div", e.params.wrapperClass)),
        s.append(l),
        k(s, `.${e.params.slideClass}`).forEach((o) => {
          l.append(o);
        })),
      Object.assign(e, {
        el: s,
        wrapperEl: l,
        slidesEl:
          e.isElement && !s.parentNode.host.slideSlots ? s.parentNode.host : l,
        hostEl: e.isElement ? s.parentNode.host : s,
        mounted: !0,
        rtl: s.dir.toLowerCase() === "rtl" || $(s, "direction") === "rtl",
        rtlTranslate:
          e.params.direction === "horizontal" &&
          (s.dir.toLowerCase() === "rtl" || $(s, "direction") === "rtl"),
        wrongRTL: $(l, "display") === "-webkit-box",
      }),
      !0
    );
  }
  init(t) {
    const e = this;
    if (e.initialized || e.mount(t) === !1) return e;
    e.emit("beforeInit"),
      e.params.breakpoints && e.setBreakpoint(),
      e.addClasses(),
      e.updateSize(),
      e.updateSlides(),
      e.params.watchOverflow && e.checkOverflow(),
      e.params.grabCursor && e.enabled && e.setGrabCursor(),
      e.params.loop && e.virtual && e.params.virtual.enabled
        ? e.slideTo(
            e.params.initialSlide + e.virtual.slidesBefore,
            0,
            e.params.runCallbacksOnInit,
            !1,
            !0
          )
        : e.slideTo(
            e.params.initialSlide,
            0,
            e.params.runCallbacksOnInit,
            !1,
            !0
          ),
      e.params.loop && e.loopCreate(),
      e.attachEvents();
    const n = [...e.el.querySelectorAll('[loading="lazy"]')];
    return (
      e.isElement && n.push(...e.hostEl.querySelectorAll('[loading="lazy"]')),
      n.forEach((r) => {
        r.complete
          ? _(e, r)
          : r.addEventListener("load", (l) => {
              _(e, l.target);
            });
      }),
      ee(e),
      (e.initialized = !0),
      ee(e),
      e.emit("init"),
      e.emit("afterInit"),
      e
    );
  }
  destroy(t, e) {
    t === void 0 && (t = !0), e === void 0 && (e = !0);
    const s = this,
      { params: n, el: r, wrapperEl: l, slides: o } = s;
    return (
      typeof s.params > "u" ||
        s.destroyed ||
        (s.emit("beforeDestroy"),
        (s.initialized = !1),
        s.detachEvents(),
        n.loop && s.loopDestroy(),
        e &&
          (s.removeClasses(),
          r && typeof r != "string" && r.removeAttribute("style"),
          l && l.removeAttribute("style"),
          o &&
            o.length &&
            o.forEach((a) => {
              a.classList.remove(
                n.slideVisibleClass,
                n.slideFullyVisibleClass,
                n.slideActiveClass,
                n.slideNextClass,
                n.slidePrevClass
              ),
                a.removeAttribute("style"),
                a.removeAttribute("data-swiper-slide-index");
            })),
        s.emit("destroy"),
        Object.keys(s.eventsListeners).forEach((a) => {
          s.off(a);
        }),
        t !== !1 &&
          (s.el && typeof s.el != "string" && (s.el.swiper = null), Ie(s)),
        (s.destroyed = !0)),
      null
    );
  }
  static extendDefaults(t) {
    z(J, t);
  }
  static get extendedDefaults() {
    return J;
  }
  static get defaults() {
    return he;
  }
  static installModule(t) {
    G.prototype.__modules__ || (G.prototype.__modules__ = []);
    const e = G.prototype.__modules__;
    typeof t == "function" && e.indexOf(t) < 0 && e.push(t);
  }
  static use(t) {
    return Array.isArray(t)
      ? (t.forEach((e) => G.installModule(e)), G)
      : (G.installModule(t), G);
  }
}
Object.keys(Z).forEach((i) => {
  Object.keys(Z[i]).forEach((t) => {
    G.prototype[t] = Z[i][t];
  });
});
G.use([Ne, _e]);
function qt(i, t, e) {
  const s = `swiper-slide-shadow${e ? `-${e}` : ""}${
      i ? ` swiper-slide-shadow-${i}` : ""
    }`,
    n = re(t);
  let r = n.querySelector(`.${s.split(" ").join(".")}`);
  return r || ((r = W("div", s.split(" "))), n.append(r)), r;
}
function Yt(i) {
  const {
    effect: t,
    swiper: e,
    on: s,
    setTranslate: n,
    setTransition: r,
    overwriteParams: l,
    perspective: o,
    recreateShadows: a,
    getEffectParams: d,
  } = i;
  s("beforeInit", () => {
    if (e.params.effect !== t) return;
    e.classNames.push(`${e.params.containerModifierClass}${t}`),
      o && o() && e.classNames.push(`${e.params.containerModifierClass}3d`);
    const f = l ? l() : {};
    Object.assign(e.params, f), Object.assign(e.originalParams, f);
  }),
    s("setTranslate", () => {
      e.params.effect === t && n();
    }),
    s("setTransition", (f, p) => {
      e.params.effect === t && r(p);
    }),
    s("transitionEnd", () => {
      if (e.params.effect === t && a) {
        if (!d || !d().slideShadows) return;
        e.slides.forEach((f) => {
          f.querySelectorAll(
            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
          ).forEach((p) => p.remove());
        }),
          a();
      }
    });
  let c;
  s("virtualUpdate", () => {
    e.params.effect === t &&
      (e.slides.length || (c = !0),
      requestAnimationFrame(() => {
        c && e.slides && e.slides.length && (n(), (c = !1));
      }));
  });
}
function Xt(i, t) {
  const e = re(t);
  return (
    e !== t &&
      ((e.style.backfaceVisibility = "hidden"),
      (e.style["-webkit-backface-visibility"] = "hidden")),
    e
  );
}
function Ut(i) {
  let { swiper: t, duration: e, transformElements: s, allSlides: n } = i;
  const { activeIndex: r } = t,
    l = (o) =>
      o.parentElement
        ? o.parentElement
        : t.slides.filter(
            (d) => d.shadowRoot && d.shadowRoot === o.parentNode
          )[0];
  if (t.params.virtualTranslate && e !== 0) {
    let o = !1,
      a;
    n
      ? (a = s)
      : (a = s.filter((d) => {
          const c = d.classList.contains("swiper-slide-transform") ? l(d) : d;
          return t.getSlideIndex(c) === r;
        })),
      a.forEach((d) => {
        Ve(d, () => {
          if (o || !t || t.destroyed) return;
          (o = !0), (t.animating = !1);
          const c = new window.CustomEvent("transitionend", {
            bubbles: !0,
            cancelable: !0,
          });
          t.wrapperEl.dispatchEvent(c);
        });
      });
  }
}
typeof window < "u" &&
  window.SwiperElementRegisterParams &&
  window.SwiperElementRegisterParams(["cardsStackEffect"]);
function Kt({ swiper: i, on: t, extendParams: e }) {
  e({ cardsStackEffect: { slideShadows: !0 } }),
    Yt({
      effect: "cards-stack",
      swiper: i,
      on: t,
      setTranslate: () => {
        const { slides: r, rtlTranslate: l } = i,
          o = i.params.cardsStackEffect,
          a = i.size / 2,
          d = l ? -1 : 1;
        for (let c = 0; c < r.length; c += 1) {
          const f = r[c],
            p = f.progress,
            u = Math.min(Math.max(p, -4), 4);
          let m = f.swiperSlideOffset;
          i.params.centeredSlides &&
            i.params.cssMode &&
            (m -= r[0].swiperSlideOffset);
          let h = i.params.cssMode ? -m - i.translate : -m,
            T = 0,
            v = 0,
            b = 0,
            g = 0;
          if (u < 0) {
            const y = Math.abs(u),
              I = (-Math.min(2, y) * Math.PI) / 2;
            (v = `${a * Math.cos(I) - a}px`),
              (h = `${h - d * a * Math.sin(I)}px`);
            const V = Math.min(4, y * 2);
            g = -Math.max(-180, -V * 80);
          } else if (u > 0) {
            const y = Math.abs(u),
              I = (Math.min(4, y) * Math.PI) / 4;
            (v = `${a * Math.cos(I) - a}px`),
              (h = `${h - d * a * Math.sin(I)}px`),
              (g = y * 20);
          } else h = `${h}px`;
          i.isHorizontal()
            ? l && (g = -g)
            : ((T = h), (h = 0), (b = -g), (g = 0));
          const E = `
        translate3d(${h}, ${T}, ${v})
        scale(1)
        rotateX(${b}deg)
        rotateY(${g}deg)
      `;
          if (o.slideShadows) {
            let y = f.querySelector(".swiper-slide-shadow");
            y || (y = qt("cards", f)),
              y &&
                (y.style.opacity = Math.min(
                  Math.max((Math.abs(u) - 0.5) / 0.5, 0),
                  1
                ));
          }
          f.style.zIndex = -Math.abs(Math.round(p)) + r.length;
          const S = Xt(o, f);
          S.style.transform = E;
        }
      },
      setTransition: (r) => {
        const l = i.slides.map((o) => re(o));
        l.forEach((o) => {
          (o.style.transitionDuration = `${r}ms`),
            o.querySelectorAll(".swiper-slide-shadow").forEach((a) => {
              a.style.transitionDuration = `${r}ms`;
            });
        }),
          Ut({ swiper: i, duration: r, transformElements: l });
      },
      perspective: () => !0,
      overwriteParams: () => ({
        centeredSlides: !0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        loopAdditionalSlides: 1,
        watchSlidesProgress: !0,
        virtualTranslate: !i.params.cssMode,
      }),
    });
}
const j = new G(".swiper", {
    loop: !0,
    loopAdditionalSlides: 2,
    centeredSlides: !0,
    direction: "vertical",
    modules: [Kt],
    effect: "cards-stack",
    grabCursor: !0,
    touchRatio: 1.5,
    speed: 400,
  }),
  te = document.querySelector('button[data-direction="vertical"]'),
  ie = document.querySelector('button[data-direction="horizontal"]');
ie.addEventListener("click", () => {
  j.params.direction !== "horizontal" &&
    (te.classList.remove("active"),
    ie.classList.add("active"),
    j.changeDirection());
});
te.addEventListener("click", () => {
  j.params.direction !== "vertical" &&
    (te.classList.add("active"),
    ie.classList.remove("active"),
    j.changeDirection());
});
