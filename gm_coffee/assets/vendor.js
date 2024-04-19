var e = Object.defineProperty,
  t = Object.defineProperties,
  r = Object.getOwnPropertyDescriptors,
  a = Object.getOwnPropertySymbols,
  s = Object.prototype.hasOwnProperty,
  n = Object.prototype.propertyIsEnumerable,
  i = (t, r, a) =>
    r in t
      ? e(t, r, { enumerable: !0, configurable: !0, writable: !0, value: a })
      : (t[r] = a),
  o = (e, t) => {
    for (var r in t || (t = {})) s.call(t, r) && i(e, r, t[r]);
    if (a) for (var r of a(t)) n.call(t, r) && i(e, r, t[r]);
    return e;
  },
  l = (e, a) => t(e, r(a));
"undefined" != typeof require && require;
function c(e) {
  return (
    null !== e &&
    "object" == typeof e &&
    "constructor" in e &&
    e.constructor === Object
  );
}
function p(e = {}, t = {}) {
  Object.keys(t).forEach((r) => {
    void 0 === e[r]
      ? (e[r] = t[r])
      : c(t[r]) && c(e[r]) && Object.keys(t[r]).length > 0 && p(e[r], t[r]);
  });
}
const d = {
  body: {},
  addEventListener() {},
  removeEventListener() {},
  activeElement: { blur() {}, nodeName: "" },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createEvent: () => ({ initEvent() {} }),
  createElement: () => ({
    children: [],
    childNodes: [],
    style: {},
    setAttribute() {},
    getElementsByTagName: () => [],
  }),
  createElementNS: () => ({}),
  importNode: () => null,
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
function u() {
  const e = "undefined" != typeof document ? document : {};
  return p(e, d), e;
}
const h = {
  document: d,
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
  getComputedStyle: () => ({ getPropertyValue: () => "" }),
  Image() {},
  Date() {},
  screen: {},
  setTimeout() {},
  clearTimeout() {},
  matchMedia: () => ({}),
  requestAnimationFrame: (e) =>
    "undefined" == typeof setTimeout ? (e(), null) : setTimeout(e, 0),
  cancelAnimationFrame(e) {
    "undefined" != typeof setTimeout && clearTimeout(e);
  },
};
function f() {
  const e = "undefined" != typeof window ? window : {};
  return p(e, h), e;
}
class m extends Array {
  constructor(e) {
    "number" == typeof e
      ? super(e)
      : (super(...(e || [])),
        (function (e) {
          const t = e.__proto__;
          Object.defineProperty(e, "__proto__", {
            get: () => t,
            set(e) {
              t.__proto__ = e;
            },
          });
        })(this));
  }
}
function g(e = []) {
  const t = [];
  return (
    e.forEach((e) => {
      Array.isArray(e) ? t.push(...g(e)) : t.push(e);
    }),
    t
  );
}
function v(e, t) {
  return Array.prototype.filter.call(e, t);
}
function b(e, t) {
  const r = f(),
    a = u();
  let s = [];
  if (!t && e instanceof m) return e;
  if (!e) return new m(s);
  if ("string" == typeof e) {
    const r = e.trim();
    if (r.indexOf("<") >= 0 && r.indexOf(">") >= 0) {
      let e = "div";
      0 === r.indexOf("<li") && (e = "ul"),
        0 === r.indexOf("<tr") && (e = "tbody"),
        (0 !== r.indexOf("<td") && 0 !== r.indexOf("<th")) || (e = "tr"),
        0 === r.indexOf("<tbody") && (e = "table"),
        0 === r.indexOf("<option") && (e = "select");
      const t = a.createElement(e);
      t.innerHTML = r;
      for (let r = 0; r < t.childNodes.length; r += 1) s.push(t.childNodes[r]);
    } else
      s = (function (e, t) {
        if ("string" != typeof e) return [e];
        const r = [],
          a = t.querySelectorAll(e);
        for (let s = 0; s < a.length; s += 1) r.push(a[s]);
        return r;
      })(e.trim(), t || a);
  } else if (e.nodeType || e === r || e === a) s.push(e);
  else if (Array.isArray(e)) {
    if (e instanceof m) return e;
    s = e;
  }
  return new m(
    (function (e) {
      const t = [];
      for (let r = 0; r < e.length; r += 1)
        -1 === t.indexOf(e[r]) && t.push(e[r]);
      return t;
    })(s)
  );
}
b.fn = m.prototype;
const w = "resize scroll".split(" ");
function y(e) {
  return function (...t) {
    if (void 0 === t[0]) {
      for (let t = 0; t < this.length; t += 1)
        w.indexOf(e) < 0 &&
          (e in this[t] ? this[t][e]() : b(this[t]).trigger(e));
      return this;
    }
    return this.on(e, ...t);
  };
}
const E = y("click"),
  C = y("blur"),
  x = y("focus"),
  S = y("focusin"),
  k = y("focusout"),
  T = y("keyup"),
  M = y("keydown"),
  A = y("keypress"),
  $ = y("submit"),
  P = y("change"),
  O = y("mousedown"),
  L = y("mousemove"),
  R = y("mouseup"),
  I = y("mouseenter"),
  z = y("mouseleave"),
  B = y("mouseout"),
  H = y("mouseover"),
  D = y("touchstart"),
  N = y("touchend"),
  _ = y("touchmove"),
  j = y("resize"),
  q = y("scroll");
var V = Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  default: b,
  $: b,
  add: function (...e) {
    const t = this;
    let r, a;
    for (r = 0; r < e.length; r += 1) {
      const s = b(e[r]);
      for (a = 0; a < s.length; a += 1) t.push(s[a]);
    }
    return t;
  },
  addClass: function (...e) {
    const t = g(e.map((e) => e.split(" ")));
    return (
      this.forEach((e) => {
        e.classList.add(...t);
      }),
      this
    );
  },
  animate: function (e, t) {
    const r = f(),
      a = this,
      s = {
        props: Object.assign({}, e),
        params: Object.assign({ duration: 300, easing: "swing" }, t),
        elements: a,
        animating: !1,
        que: [],
        easingProgress: (e, t) =>
          "swing" === e
            ? 0.5 - Math.cos(t * Math.PI) / 2
            : "function" == typeof e
            ? e(t)
            : t,
        stop() {
          s.frameId && r.cancelAnimationFrame(s.frameId),
            (s.animating = !1),
            s.elements.each((e) => {
              delete e.dom7AnimateInstance;
            }),
            (s.que = []);
        },
        done(e) {
          if (
            ((s.animating = !1),
            s.elements.each((e) => {
              delete e.dom7AnimateInstance;
            }),
            e && e(a),
            s.que.length > 0)
          ) {
            const e = s.que.shift();
            s.animate(e[0], e[1]);
          }
        },
        animate(e, t) {
          if (s.animating) return s.que.push([e, t]), s;
          const n = [];
          s.elements.each((t, a) => {
            let i, o, l, c, p;
            t.dom7AnimateInstance || (s.elements[a].dom7AnimateInstance = s),
              (n[a] = { container: t }),
              Object.keys(e).forEach((s) => {
                (i = r
                  .getComputedStyle(t, null)
                  .getPropertyValue(s)
                  .replace(",", ".")),
                  (o = parseFloat(i)),
                  (l = i.replace(o, "")),
                  (c = parseFloat(e[s])),
                  (p = e[s] + l),
                  (n[a][s] = {
                    initialFullValue: i,
                    initialValue: o,
                    unit: l,
                    finalValue: c,
                    finalFullValue: p,
                    currentValue: o,
                  });
              });
          });
          let i,
            o,
            l = null,
            c = 0,
            p = 0,
            d = !1;
          return (
            (s.animating = !0),
            (s.frameId = r.requestAnimationFrame(function u() {
              let h, f;
              (i = new Date().getTime()),
                d || ((d = !0), t.begin && t.begin(a)),
                null === l && (l = i),
                t.progress &&
                  t.progress(
                    a,
                    Math.max(Math.min((i - l) / t.duration, 1), 0),
                    l + t.duration - i < 0 ? 0 : l + t.duration - i,
                    l
                  ),
                n.forEach((r) => {
                  const a = r;
                  o ||
                    a.done ||
                    Object.keys(e).forEach((r) => {
                      if (o || a.done) return;
                      (h = Math.max(Math.min((i - l) / t.duration, 1), 0)),
                        (f = s.easingProgress(t.easing, h));
                      const { initialValue: d, finalValue: u, unit: m } = a[r];
                      a[r].currentValue = d + f * (u - d);
                      const g = a[r].currentValue;
                      ((u > d && g >= u) || (u < d && g <= u)) &&
                        ((a.container.style[r] = u + m),
                        (p += 1),
                        p === Object.keys(e).length &&
                          ((a.done = !0), (c += 1)),
                        c === n.length && (o = !0)),
                        o ? s.done(t.complete) : (a.container.style[r] = g + m);
                    });
                }),
                o || (s.frameId = r.requestAnimationFrame(u));
            })),
            s
          );
        },
      };
    if (0 === s.elements.length) return a;
    let n;
    for (let i = 0; i < s.elements.length; i += 1)
      s.elements[i].dom7AnimateInstance
        ? (n = s.elements[i].dom7AnimateInstance)
        : (s.elements[i].dom7AnimateInstance = s);
    return (
      n || (n = s), "stop" === e ? n.stop() : n.animate(s.props, s.params), a
    );
  },
  animationEnd: function (e) {
    const t = this;
    return (
      e &&
        t.on("animationend", function r(a) {
          a.target === this && (e.call(this, a), t.off("animationend", r));
        }),
      this
    );
  },
  append: function (...e) {
    let t;
    const r = u();
    for (let a = 0; a < e.length; a += 1) {
      t = e[a];
      for (let e = 0; e < this.length; e += 1)
        if ("string" == typeof t) {
          const a = r.createElement("div");
          for (a.innerHTML = t; a.firstChild; )
            this[e].appendChild(a.firstChild);
        } else if (t instanceof m)
          for (let r = 0; r < t.length; r += 1) this[e].appendChild(t[r]);
        else this[e].appendChild(t);
    }
    return this;
  },
  appendTo: function (e) {
    return b(e).append(this), this;
  },
  attr: function (e, t) {
    if (1 === arguments.length && "string" == typeof e)
      return this[0] ? this[0].getAttribute(e) : void 0;
    for (let r = 0; r < this.length; r += 1)
      if (2 === arguments.length) this[r].setAttribute(e, t);
      else
        for (const t in e) (this[r][t] = e[t]), this[r].setAttribute(t, e[t]);
    return this;
  },
  blur: C,
  change: P,
  children: function (e) {
    const t = [];
    for (let r = 0; r < this.length; r += 1) {
      const a = this[r].children;
      for (let r = 0; r < a.length; r += 1)
        (e && !b(a[r]).is(e)) || t.push(a[r]);
    }
    return b(t);
  },
  click: E,
  closest: function (e) {
    let t = this;
    return void 0 === e ? b([]) : (t.is(e) || (t = t.parents(e).eq(0)), t);
  },
  css: function (e, t) {
    const r = f();
    let a;
    if (1 === arguments.length) {
      if ("string" != typeof e) {
        for (a = 0; a < this.length; a += 1)
          for (const t in e) this[a].style[t] = e[t];
        return this;
      }
      if (this[0]) return r.getComputedStyle(this[0], null).getPropertyValue(e);
    }
    if (2 === arguments.length && "string" == typeof e) {
      for (a = 0; a < this.length; a += 1) this[a].style[e] = t;
      return this;
    }
    return this;
  },
  data: function (e, t) {
    let r;
    if (void 0 === t) {
      if (((r = this[0]), !r)) return;
      if (r.dom7ElementDataStorage && e in r.dom7ElementDataStorage)
        return r.dom7ElementDataStorage[e];
      const t = r.getAttribute(`data-${e}`);
      return t || void 0;
    }
    for (let a = 0; a < this.length; a += 1)
      (r = this[a]),
        r.dom7ElementDataStorage || (r.dom7ElementDataStorage = {}),
        (r.dom7ElementDataStorage[e] = t);
    return this;
  },
  dataset: function () {
    const e = this[0];
    if (!e) return;
    const t = {};
    if (e.dataset) for (const a in e.dataset) t[a] = e.dataset[a];
    else
      for (let a = 0; a < e.attributes.length; a += 1) {
        const s = e.attributes[a];
        s.name.indexOf("data-") >= 0 &&
          (t[
            ((r = s.name.split("data-")[1]),
            r.toLowerCase().replace(/-(.)/g, (e, t) => t.toUpperCase()))
          ] = s.value);
      }
    var r;
    for (const a in t)
      "false" === t[a]
        ? (t[a] = !1)
        : "true" === t[a]
        ? (t[a] = !0)
        : parseFloat(t[a]) === 1 * t[a] && (t[a] *= 1);
    return t;
  },
  detach: function () {
    return this.remove();
  },
  each: function (e) {
    return e
      ? (this.forEach((t, r) => {
          e.apply(t, [t, r]);
        }),
        this)
      : this;
  },
  empty: function () {
    for (let e = 0; e < this.length; e += 1) {
      const t = this[e];
      if (1 === t.nodeType) {
        for (let e = 0; e < t.childNodes.length; e += 1)
          t.childNodes[e].parentNode &&
            t.childNodes[e].parentNode.removeChild(t.childNodes[e]);
        t.textContent = "";
      }
    }
    return this;
  },
  eq: function (e) {
    if (void 0 === e) return this;
    const t = this.length;
    if (e > t - 1) return b([]);
    if (e < 0) {
      const r = t + e;
      return b(r < 0 ? [] : [this[r]]);
    }
    return b([this[e]]);
  },
  filter: function (e) {
    return b(v(this, e));
  },
  find: function (e) {
    const t = [];
    for (let r = 0; r < this.length; r += 1) {
      const a = this[r].querySelectorAll(e);
      for (let e = 0; e < a.length; e += 1) t.push(a[e]);
    }
    return b(t);
  },
  focus: x,
  focusin: S,
  focusout: k,
  hasClass: function (...e) {
    const t = g(e.map((e) => e.split(" ")));
    return (
      v(this, (e) => t.filter((t) => e.classList.contains(t)).length > 0)
        .length > 0
    );
  },
  height: function () {
    const e = f();
    return this[0] === e
      ? e.innerHeight
      : this.length > 0
      ? parseFloat(this.css("height"))
      : null;
  },
  hide: function () {
    for (let e = 0; e < this.length; e += 1) this[e].style.display = "none";
    return this;
  },
  html: function (e) {
    if (void 0 === e) return this[0] ? this[0].innerHTML : null;
    for (let t = 0; t < this.length; t += 1) this[t].innerHTML = e;
    return this;
  },
  index: function () {
    let e,
      t = this[0];
    if (t) {
      for (e = 0; null !== (t = t.previousSibling); )
        1 === t.nodeType && (e += 1);
      return e;
    }
  },
  insertAfter: function (e) {
    const t = b(e);
    for (let r = 0; r < this.length; r += 1)
      if (1 === t.length)
        t[0].parentNode.insertBefore(this[r], t[0].nextSibling);
      else if (t.length > 1)
        for (let e = 0; e < t.length; e += 1)
          t[e].parentNode.insertBefore(this[r].cloneNode(!0), t[e].nextSibling);
  },
  insertBefore: function (e) {
    const t = b(e);
    for (let r = 0; r < this.length; r += 1)
      if (1 === t.length) t[0].parentNode.insertBefore(this[r], t[0]);
      else if (t.length > 1)
        for (let e = 0; e < t.length; e += 1)
          t[e].parentNode.insertBefore(this[r].cloneNode(!0), t[e]);
  },
  is: function (e) {
    const t = f(),
      r = u(),
      a = this[0];
    let s, n;
    if (!a || void 0 === e) return !1;
    if ("string" == typeof e) {
      if (a.matches) return a.matches(e);
      if (a.webkitMatchesSelector) return a.webkitMatchesSelector(e);
      if (a.msMatchesSelector) return a.msMatchesSelector(e);
      for (s = b(e), n = 0; n < s.length; n += 1) if (s[n] === a) return !0;
      return !1;
    }
    if (e === r) return a === r;
    if (e === t) return a === t;
    if (e.nodeType || e instanceof m) {
      for (s = e.nodeType ? [e] : e, n = 0; n < s.length; n += 1)
        if (s[n] === a) return !0;
      return !1;
    }
    return !1;
  },
  keydown: M,
  keypress: A,
  keyup: T,
  mousedown: O,
  mouseenter: I,
  mouseleave: z,
  mousemove: L,
  mouseout: B,
  mouseover: H,
  mouseup: R,
  next: function (e) {
    return this.length > 0
      ? e
        ? this[0].nextElementSibling && b(this[0].nextElementSibling).is(e)
          ? b([this[0].nextElementSibling])
          : b([])
        : this[0].nextElementSibling
        ? b([this[0].nextElementSibling])
        : b([])
      : b([]);
  },
  nextAll: function (e) {
    const t = [];
    let r = this[0];
    if (!r) return b([]);
    for (; r.nextElementSibling; ) {
      const a = r.nextElementSibling;
      e ? b(a).is(e) && t.push(a) : t.push(a), (r = a);
    }
    return b(t);
  },
  off: function (...e) {
    let [t, r, a, s] = e;
    "function" == typeof e[1] && (([t, a, s] = e), (r = void 0)), s || (s = !1);
    const n = t.split(" ");
    for (let i = 0; i < n.length; i += 1) {
      const e = n[i];
      for (let t = 0; t < this.length; t += 1) {
        const n = this[t];
        let i;
        if (
          (!r && n.dom7Listeners
            ? (i = n.dom7Listeners[e])
            : r && n.dom7LiveListeners && (i = n.dom7LiveListeners[e]),
          i && i.length)
        )
          for (let t = i.length - 1; t >= 0; t -= 1) {
            const r = i[t];
            (a && r.listener === a) ||
            (a &&
              r.listener &&
              r.listener.dom7proxy &&
              r.listener.dom7proxy === a)
              ? (n.removeEventListener(e, r.proxyListener, s), i.splice(t, 1))
              : a ||
                (n.removeEventListener(e, r.proxyListener, s), i.splice(t, 1));
          }
      }
    }
    return this;
  },
  offset: function () {
    if (this.length > 0) {
      const e = f(),
        t = u(),
        r = this[0],
        a = r.getBoundingClientRect(),
        s = t.body,
        n = r.clientTop || s.clientTop || 0,
        i = r.clientLeft || s.clientLeft || 0,
        o = r === e ? e.scrollY : r.scrollTop,
        l = r === e ? e.scrollX : r.scrollLeft;
      return { top: a.top + o - n, left: a.left + l - i };
    }
    return null;
  },
  on: function (...e) {
    let [t, r, a, s] = e;
    function n(e) {
      const t = e.target;
      if (!t) return;
      const s = e.target.dom7EventData || [];
      if ((s.indexOf(e) < 0 && s.unshift(e), b(t).is(r))) a.apply(t, s);
      else {
        const e = b(t).parents();
        for (let t = 0; t < e.length; t += 1) b(e[t]).is(r) && a.apply(e[t], s);
      }
    }
    function i(e) {
      const t = (e && e.target && e.target.dom7EventData) || [];
      t.indexOf(e) < 0 && t.unshift(e), a.apply(this, t);
    }
    "function" == typeof e[1] && (([t, a, s] = e), (r = void 0)), s || (s = !1);
    const o = t.split(" ");
    let l;
    for (let c = 0; c < this.length; c += 1) {
      const e = this[c];
      if (r)
        for (l = 0; l < o.length; l += 1) {
          const t = o[l];
          e.dom7LiveListeners || (e.dom7LiveListeners = {}),
            e.dom7LiveListeners[t] || (e.dom7LiveListeners[t] = []),
            e.dom7LiveListeners[t].push({ listener: a, proxyListener: n }),
            e.addEventListener(t, n, s);
        }
      else
        for (l = 0; l < o.length; l += 1) {
          const t = o[l];
          e.dom7Listeners || (e.dom7Listeners = {}),
            e.dom7Listeners[t] || (e.dom7Listeners[t] = []),
            e.dom7Listeners[t].push({ listener: a, proxyListener: i }),
            e.addEventListener(t, i, s);
        }
    }
    return this;
  },
  once: function (...e) {
    const t = this;
    let [r, a, s, n] = e;
    function i(...e) {
      s.apply(this, e), t.off(r, a, i, n), i.dom7proxy && delete i.dom7proxy;
    }
    return (
      "function" == typeof e[1] && (([r, s, n] = e), (a = void 0)),
      (i.dom7proxy = s),
      t.on(r, a, i, n)
    );
  },
  outerHeight: function (e) {
    if (this.length > 0) {
      if (e) {
        const e = this.styles();
        return (
          this[0].offsetHeight +
          parseFloat(e.getPropertyValue("margin-top")) +
          parseFloat(e.getPropertyValue("margin-bottom"))
        );
      }
      return this[0].offsetHeight;
    }
    return null;
  },
  outerWidth: function (e) {
    if (this.length > 0) {
      if (e) {
        const e = this.styles();
        return (
          this[0].offsetWidth +
          parseFloat(e.getPropertyValue("margin-right")) +
          parseFloat(e.getPropertyValue("margin-left"))
        );
      }
      return this[0].offsetWidth;
    }
    return null;
  },
  parent: function (e) {
    const t = [];
    for (let r = 0; r < this.length; r += 1)
      null !== this[r].parentNode &&
        (e
          ? b(this[r].parentNode).is(e) && t.push(this[r].parentNode)
          : t.push(this[r].parentNode));
    return b(t);
  },
  parents: function (e) {
    const t = [];
    for (let r = 0; r < this.length; r += 1) {
      let a = this[r].parentNode;
      for (; a; ) e ? b(a).is(e) && t.push(a) : t.push(a), (a = a.parentNode);
    }
    return b(t);
  },
  prepend: function (e) {
    const t = u();
    let r, a;
    for (r = 0; r < this.length; r += 1)
      if ("string" == typeof e) {
        const s = t.createElement("div");
        for (s.innerHTML = e, a = s.childNodes.length - 1; a >= 0; a -= 1)
          this[r].insertBefore(s.childNodes[a], this[r].childNodes[0]);
      } else if (e instanceof m)
        for (a = 0; a < e.length; a += 1)
          this[r].insertBefore(e[a], this[r].childNodes[0]);
      else this[r].insertBefore(e, this[r].childNodes[0]);
    return this;
  },
  prependTo: function (e) {
    return b(e).prepend(this), this;
  },
  prev: function (e) {
    if (this.length > 0) {
      const t = this[0];
      return e
        ? t.previousElementSibling && b(t.previousElementSibling).is(e)
          ? b([t.previousElementSibling])
          : b([])
        : t.previousElementSibling
        ? b([t.previousElementSibling])
        : b([]);
    }
    return b([]);
  },
  prevAll: function (e) {
    const t = [];
    let r = this[0];
    if (!r) return b([]);
    for (; r.previousElementSibling; ) {
      const a = r.previousElementSibling;
      e ? b(a).is(e) && t.push(a) : t.push(a), (r = a);
    }
    return b(t);
  },
  prop: function (e, t) {
    if (1 !== arguments.length || "string" != typeof e) {
      for (let r = 0; r < this.length; r += 1)
        if (2 === arguments.length) this[r][e] = t;
        else for (const t in e) this[r][t] = e[t];
      return this;
    }
    return this[0] ? this[0][e] : this;
  },
  remove: function () {
    for (let e = 0; e < this.length; e += 1)
      this[e].parentNode && this[e].parentNode.removeChild(this[e]);
    return this;
  },
  removeAttr: function (e) {
    for (let t = 0; t < this.length; t += 1) this[t].removeAttribute(e);
    return this;
  },
  removeClass: function (...e) {
    const t = g(e.map((e) => e.split(" ")));
    return (
      this.forEach((e) => {
        e.classList.remove(...t);
      }),
      this
    );
  },
  removeData: function (e) {
    for (let t = 0; t < this.length; t += 1) {
      const r = this[t];
      r.dom7ElementDataStorage &&
        r.dom7ElementDataStorage[e] &&
        ((r.dom7ElementDataStorage[e] = null),
        delete r.dom7ElementDataStorage[e]);
    }
  },
  resize: j,
  scroll: q,
  scrollLeft: function (...e) {
    let [t, r, a, s] = e;
    3 === e.length && "function" == typeof a && ([t, r, s, a] = e);
    const n = this;
    return void 0 === t
      ? n.length > 0
        ? n[0].scrollLeft
        : null
      : n.scrollTo(t, void 0, r, a, s);
  },
  scrollTo: function (...e) {
    const t = f();
    let [r, a, s, n, i] = e;
    return (
      4 === e.length &&
        "function" == typeof n &&
        ((i = n), ([r, a, s, i, n] = e)),
      void 0 === n && (n = "swing"),
      this.each(function () {
        const e = this;
        let o,
          l,
          c,
          p,
          d,
          u,
          h,
          f,
          m = a > 0 || 0 === a,
          g = r > 0 || 0 === r;
        if (
          (void 0 === n && (n = "swing"),
          m && ((o = e.scrollTop), s || (e.scrollTop = a)),
          g && ((l = e.scrollLeft), s || (e.scrollLeft = r)),
          !s)
        )
          return;
        m &&
          ((c = e.scrollHeight - e.offsetHeight),
          (d = Math.max(Math.min(a, c), 0))),
          g &&
            ((p = e.scrollWidth - e.offsetWidth),
            (u = Math.max(Math.min(r, p), 0)));
        let v = null;
        m && d === o && (m = !1),
          g && u === l && (g = !1),
          t.requestAnimationFrame(function r(a = new Date().getTime()) {
            null === v && (v = a);
            const c = Math.max(Math.min((a - v) / s, 1), 0),
              p = "linear" === n ? c : 0.5 - Math.cos(c * Math.PI) / 2;
            let b;
            m && (h = o + p * (d - o)),
              g && (f = l + p * (u - l)),
              m && d > o && h >= d && ((e.scrollTop = d), (b = !0)),
              m && d < o && h <= d && ((e.scrollTop = d), (b = !0)),
              g && u > l && f >= u && ((e.scrollLeft = u), (b = !0)),
              g && u < l && f <= u && ((e.scrollLeft = u), (b = !0)),
              b
                ? i && i()
                : (m && (e.scrollTop = h),
                  g && (e.scrollLeft = f),
                  t.requestAnimationFrame(r));
          });
      })
    );
  },
  scrollTop: function (...e) {
    let [t, r, a, s] = e;
    3 === e.length && "function" == typeof a && ([t, r, s, a] = e);
    const n = this;
    return void 0 === t
      ? n.length > 0
        ? n[0].scrollTop
        : null
      : n.scrollTo(void 0, t, r, a, s);
  },
  show: function () {
    const e = f();
    for (let t = 0; t < this.length; t += 1) {
      const r = this[t];
      "none" === r.style.display && (r.style.display = ""),
        "none" === e.getComputedStyle(r, null).getPropertyValue("display") &&
          (r.style.display = "block");
    }
    return this;
  },
  siblings: function (e) {
    return this.nextAll(e).add(this.prevAll(e));
  },
  stop: function () {
    const e = this;
    for (let t = 0; t < e.length; t += 1)
      e[t].dom7AnimateInstance && e[t].dom7AnimateInstance.stop();
  },
  styles: function () {
    const e = f();
    return this[0] ? e.getComputedStyle(this[0], null) : {};
  },
  submit: $,
  text: function (e) {
    if (void 0 === e) return this[0] ? this[0].textContent.trim() : null;
    for (let t = 0; t < this.length; t += 1) this[t].textContent = e;
    return this;
  },
  toggleClass: function (...e) {
    const t = g(e.map((e) => e.split(" ")));
    this.forEach((e) => {
      t.forEach((t) => {
        e.classList.toggle(t);
      });
    });
  },
  touchend: N,
  touchmove: _,
  touchstart: D,
  transform: function (e) {
    for (let t = 0; t < this.length; t += 1) this[t].style.transform = e;
    return this;
  },
  transition: function (e) {
    for (let t = 0; t < this.length; t += 1)
      this[t].style.transitionDuration = "string" != typeof e ? `${e}ms` : e;
    return this;
  },
  transitionEnd: function (e) {
    const t = this;
    return (
      e &&
        t.on("transitionend", function r(a) {
          a.target === this && (e.call(this, a), t.off("transitionend", r));
        }),
      this
    );
  },
  transitionStart: function (e) {
    const t = this;
    return (
      e &&
        t.on("transitionstart", function r(a) {
          a.target === this && (e.call(this, a), t.off("transitionstart", r));
        }),
      this
    );
  },
  trigger: function (...e) {
    const t = f(),
      r = e[0].split(" "),
      a = e[1];
    for (let s = 0; s < r.length; s += 1) {
      const n = r[s];
      for (let r = 0; r < this.length; r += 1) {
        const s = this[r];
        if (t.CustomEvent) {
          const r = new t.CustomEvent(n, {
            detail: a,
            bubbles: !0,
            cancelable: !0,
          });
          (s.dom7EventData = e.filter((e, t) => t > 0)),
            s.dispatchEvent(r),
            (s.dom7EventData = []),
            delete s.dom7EventData;
        }
      }
    }
    return this;
  },
  val: function (e) {
    if (void 0 === e) {
      const e = this[0];
      if (!e) return;
      if (e.multiple && "select" === e.nodeName.toLowerCase()) {
        const t = [];
        for (let r = 0; r < e.selectedOptions.length; r += 1)
          t.push(e.selectedOptions[r].value);
        return t;
      }
      return e.value;
    }
    for (let t = 0; t < this.length; t += 1) {
      const r = this[t];
      if (
        Array.isArray(e) &&
        r.multiple &&
        "select" === r.nodeName.toLowerCase()
      )
        for (let t = 0; t < r.options.length; t += 1)
          r.options[t].selected = e.indexOf(r.options[t].value) >= 0;
      else r.value = e;
    }
    return this;
  },
  value: function (e) {
    return this.val(e);
  },
  width: function () {
    const e = f();
    return this[0] === e
      ? e.innerWidth
      : this.length > 0
      ? parseFloat(this.css("width"))
      : null;
  },
});
Object.keys(V).forEach((e) => {
  "$" !== e && (b.fn[e] = V[e]);
});
var F = b;
function Y(e) {
  return e < 0 ? -1 : 0 === e ? 0 : 1;
}
function G(e, t, r) {
  return (1 - r) * e + r * t;
}
function W(e) {
  return (e %= 360) < 0 && (e += 360), e;
}
function U(e, t) {
  return [
    e[0] * t[0][0] + e[1] * t[0][1] + e[2] * t[0][2],
    e[0] * t[1][0] + e[1] * t[1][1] + e[2] * t[1][2],
    e[0] * t[2][0] + e[1] * t[2][1] + e[2] * t[2][2],
  ];
}
const X = [
    [0.41233895, 0.35762064, 0.18051042],
    [0.2126, 0.7152, 0.0722],
    [0.01932141, 0.11916382, 0.95034478],
  ],
  Q = [
    [3.2413774792388685, -1.5376652402851851, -0.49885366846268053],
    [-0.9691452513005321, 1.8758853451067872, 0.04156585616912061],
    [0.05562093689691305, -0.20395524564742123, 1.0571799111220335],
  ],
  K = [95.047, 100, 108.883];
function Z(e, t, r) {
  return ((255 << 24) | ((255 & e) << 16) | ((255 & t) << 8) | (255 & r)) >>> 0;
}
function J(e) {
  return Z(ie(e[0]), ie(e[1]), ie(e[2]));
}
function ee(e) {
  return (e >> 16) & 255;
}
function te(e) {
  return (e >> 8) & 255;
}
function re(e) {
  return 255 & e;
}
function ae(e) {
  return (
    116 *
      ((t =
        (function (e) {
          return U([ne(ee(e)), ne(te(e)), ne(re(e))], X);
        })(e)[1] / 100) >
      216 / 24389
        ? Math.pow(t, 1 / 3)
        : (903.2962962962963 * t + 16) / 116) -
    16
  );
  var t;
}
function se(e) {
  return (
    100 *
    (function (e) {
      const t = e * e * e;
      return t > 216 / 24389 ? t : (116 * e - 16) / 903.2962962962963;
    })((e + 16) / 116)
  );
}
function ne(e) {
  const t = e / 255;
  return t <= 0.040449936
    ? (t / 12.92) * 100
    : 100 * Math.pow((t + 0.055) / 1.055, 2.4);
}
function ie(e) {
  const t = e / 100;
  let r = 0;
  return (
    (r = t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055),
    (a = 0),
    (s = 255),
    (n = Math.round(255 * r)) < a ? a : n > s ? s : n
  );
  var a, s, n;
}
class oe {
  constructor(e, t, r, a, s, n, i, o, l, c) {
    (this.n = e),
      (this.aw = t),
      (this.nbb = r),
      (this.ncb = a),
      (this.c = s),
      (this.nc = n),
      (this.rgbD = i),
      (this.fl = o),
      (this.fLRoot = l),
      (this.z = c);
  }
  static make(e, t, r, a, s) {
    void 0 === e && (e = K),
      void 0 === t && (t = ((200 / Math.PI) * se(50)) / 100),
      void 0 === r && (r = 50),
      void 0 === a && (a = 2),
      void 0 === s && (s = !1);
    const n = e,
      i = 0.401288 * n[0] + 0.650173 * n[1] + -0.051461 * n[2],
      o = -0.250268 * n[0] + 1.204414 * n[1] + 0.045854 * n[2],
      l = -0.002079 * n[0] + 0.048952 * n[1] + 0.953127 * n[2],
      c = 0.8 + a / 10,
      p =
        c >= 0.9
          ? G(0.59, 0.69, 10 * (c - 0.9))
          : G(0.525, 0.59, 10 * (c - 0.8));
    let d = s ? 1 : c * (1 - (1 / 3.6) * Math.exp((-t - 42) / 92));
    d = d > 1 ? 1 : d < 0 ? 0 : d;
    const u = c,
      h = [d * (100 / i) + 1 - d, d * (100 / o) + 1 - d, d * (100 / l) + 1 - d],
      f = 1 / (5 * t + 1),
      m = f * f * f * f,
      g = 1 - m,
      v = m * t + 0.1 * g * g * Math.cbrt(5 * t),
      b = se(r) / e[1],
      w = 1.48 + Math.sqrt(b),
      y = 0.725 / Math.pow(b, 0.2),
      E = y,
      C = [
        Math.pow((v * h[0] * i) / 100, 0.42),
        Math.pow((v * h[1] * o) / 100, 0.42),
        Math.pow((v * h[2] * l) / 100, 0.42),
      ],
      x = [
        (400 * C[0]) / (C[0] + 27.13),
        (400 * C[1]) / (C[1] + 27.13),
        (400 * C[2]) / (C[2] + 27.13),
      ];
    return new oe(
      b,
      (2 * x[0] + x[1] + 0.05 * x[2]) * y,
      y,
      E,
      p,
      u,
      h,
      v,
      Math.pow(v, 0.25),
      w
    );
  }
}
oe.DEFAULT = oe.make();
class le {
  constructor(e, t, r, a, s, n, i, o, l) {
    (this.hue = e),
      (this.chroma = t),
      (this.j = r),
      (this.q = a),
      (this.m = s),
      (this.s = n),
      (this.jstar = i),
      (this.astar = o),
      (this.bstar = l);
  }
  distance(e) {
    const t = this.jstar - e.jstar,
      r = this.astar - e.astar,
      a = this.bstar - e.bstar,
      s = Math.sqrt(t * t + r * r + a * a);
    return 1.41 * Math.pow(s, 0.63);
  }
  static fromInt(e) {
    return le.fromIntInViewingConditions(e, oe.DEFAULT);
  }
  static fromIntInViewingConditions(e, t) {
    const r = (65280 & e) >> 8,
      a = 255 & e,
      s = ne((16711680 & e) >> 16),
      n = ne(r),
      i = ne(a),
      o = 0.41233895 * s + 0.35762064 * n + 0.18051042 * i,
      l = 0.2126 * s + 0.7152 * n + 0.0722 * i,
      c = 0.01932141 * s + 0.11916382 * n + 0.95034478 * i,
      p = 0.401288 * o + 0.650173 * l - 0.051461 * c,
      d = -0.250268 * o + 1.204414 * l + 0.045854 * c,
      u = -0.002079 * o + 0.048952 * l + 0.953127 * c,
      h = t.rgbD[0] * p,
      f = t.rgbD[1] * d,
      m = t.rgbD[2] * u,
      g = Math.pow((t.fl * Math.abs(h)) / 100, 0.42),
      v = Math.pow((t.fl * Math.abs(f)) / 100, 0.42),
      b = Math.pow((t.fl * Math.abs(m)) / 100, 0.42),
      w = (400 * Y(h) * g) / (g + 27.13),
      y = (400 * Y(f) * v) / (v + 27.13),
      E = (400 * Y(m) * b) / (b + 27.13),
      C = (11 * w + -12 * y + E) / 11,
      x = (w + y - 2 * E) / 9,
      S = (20 * w + 20 * y + 21 * E) / 20,
      k = (40 * w + 20 * y + E) / 20,
      T = (180 * Math.atan2(x, C)) / Math.PI,
      M = T < 0 ? T + 360 : T >= 360 ? T - 360 : T,
      A = (M * Math.PI) / 180,
      $ = k * t.nbb,
      P = 100 * Math.pow($ / t.aw, t.c * t.z),
      O = (4 / t.c) * Math.sqrt(P / 100) * (t.aw + 4) * t.fLRoot,
      L = M < 20.14 ? M + 360 : M,
      R =
        ((5e4 / 13) *
          (0.25 * (Math.cos((L * Math.PI) / 180 + 2) + 3.8)) *
          t.nc *
          t.ncb *
          Math.sqrt(C * C + x * x)) /
        (S + 0.305),
      I = Math.pow(R, 0.9) * Math.pow(1.64 - Math.pow(0.29, t.n), 0.73),
      z = I * Math.sqrt(P / 100),
      B = z * t.fLRoot,
      H = 50 * Math.sqrt((I * t.c) / (t.aw + 4)),
      D = ((1 + 100 * 0.007) * P) / (1 + 0.007 * P),
      N = (1 / 0.0228) * Math.log(1 + 0.0228 * B),
      _ = N * Math.cos(A),
      j = N * Math.sin(A);
    return new le(M, z, P, O, B, H, D, _, j);
  }
  static fromJch(e, t, r) {
    return le.fromJchInViewingConditions(e, t, r, oe.DEFAULT);
  }
  static fromJchInViewingConditions(e, t, r, a) {
    const s = (4 / a.c) * Math.sqrt(e / 100) * (a.aw + 4) * a.fLRoot,
      n = t * a.fLRoot,
      i = t / Math.sqrt(e / 100),
      o = 50 * Math.sqrt((i * a.c) / (a.aw + 4)),
      l = (r * Math.PI) / 180,
      c = ((1 + 100 * 0.007) * e) / (1 + 0.007 * e),
      p = (1 / 0.0228) * Math.log(1 + 0.0228 * n),
      d = p * Math.cos(l),
      u = p * Math.sin(l);
    return new le(r, t, e, s, n, o, c, d, u);
  }
  static fromUcs(e, t, r) {
    return le.fromUcsInViewingConditions(e, t, r, oe.DEFAULT);
  }
  static fromUcsInViewingConditions(e, t, r, a) {
    const s = t,
      n = r,
      i = Math.sqrt(s * s + n * n),
      o = (Math.exp(0.0228 * i) - 1) / 0.0228 / a.fLRoot;
    let l = Math.atan2(n, s) * (180 / Math.PI);
    l < 0 && (l += 360);
    const c = e / (1 - 0.007 * (e - 100));
    return le.fromJchInViewingConditions(c, o, l, a);
  }
  toInt() {
    return this.viewed(oe.DEFAULT);
  }
  viewed(e) {
    const t =
        0 === this.chroma || 0 === this.j
          ? 0
          : this.chroma / Math.sqrt(this.j / 100),
      r = Math.pow(t / Math.pow(1.64 - Math.pow(0.29, e.n), 0.73), 1 / 0.9),
      a = (this.hue * Math.PI) / 180,
      s = 0.25 * (Math.cos(a + 2) + 3.8),
      n = e.aw * Math.pow(this.j / 100, 1 / e.c / e.z),
      i = s * (5e4 / 13) * e.nc * e.ncb,
      o = n / e.nbb,
      l = Math.sin(a),
      c = Math.cos(a),
      p = (23 * (o + 0.305) * r) / (23 * i + 11 * r * c + 108 * r * l),
      d = p * c,
      u = p * l,
      h = (460 * o + 451 * d + 288 * u) / 1403,
      f = (460 * o - 891 * d - 261 * u) / 1403,
      m = (460 * o - 220 * d - 6300 * u) / 1403,
      g = Math.max(0, (27.13 * Math.abs(h)) / (400 - Math.abs(h))),
      v = Y(h) * (100 / e.fl) * Math.pow(g, 1 / 0.42),
      b = Math.max(0, (27.13 * Math.abs(f)) / (400 - Math.abs(f))),
      w = Y(f) * (100 / e.fl) * Math.pow(b, 1 / 0.42),
      y = Math.max(0, (27.13 * Math.abs(m)) / (400 - Math.abs(m))),
      E = Y(m) * (100 / e.fl) * Math.pow(y, 1 / 0.42),
      C = v / e.rgbD[0],
      x = w / e.rgbD[1],
      S = E / e.rgbD[2];
    return (function (e, t, r) {
      const a = Q,
        s = a[0][0] * e + a[0][1] * t + a[0][2] * r,
        n = a[1][0] * e + a[1][1] * t + a[1][2] * r,
        i = a[2][0] * e + a[2][1] * t + a[2][2] * r;
      return Z(ie(s), ie(n), ie(i));
    })(
      1.86206786 * C - 1.01125463 * x + 0.14918677 * S,
      0.38752654 * C + 0.62144744 * x - 0.00897398 * S,
      -0.0158415 * C - 0.03412294 * x + 1.04996444 * S
    );
  }
}
class ce {
  static sanitizeRadians(e) {
    return (e + 8 * Math.PI) % (2 * Math.PI);
  }
  static trueDelinearized(e) {
    const t = e / 100;
    let r = 0;
    return (
      (r = t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055),
      255 * r
    );
  }
  static chromaticAdaptation(e) {
    const t = Math.pow(Math.abs(e), 0.42);
    return (400 * Y(e) * t) / (t + 27.13);
  }
  static hueOf(e) {
    const t = U(e, ce.SCALED_DISCOUNT_FROM_LINRGB),
      r = ce.chromaticAdaptation(t[0]),
      a = ce.chromaticAdaptation(t[1]),
      s = ce.chromaticAdaptation(t[2]),
      n = (11 * r + -12 * a + s) / 11,
      i = (r + a - 2 * s) / 9;
    return Math.atan2(i, n);
  }
  static areInCyclicOrder(e, t, r) {
    return ce.sanitizeRadians(t - e) < ce.sanitizeRadians(r - e);
  }
  static intercept(e, t, r) {
    return (t - e) / (r - e);
  }
  static lerpPoint(e, t, r) {
    return [
      e[0] + (r[0] - e[0]) * t,
      e[1] + (r[1] - e[1]) * t,
      e[2] + (r[2] - e[2]) * t,
    ];
  }
  static setCoordinate(e, t, r, a) {
    const s = ce.intercept(e[a], t, r[a]);
    return ce.lerpPoint(e, s, r);
  }
  static isBounded(e) {
    return 0 <= e && e <= 100;
  }
  static nthVertex(e, t) {
    const r = ce.Y_FROM_LINRGB[0],
      a = ce.Y_FROM_LINRGB[1],
      s = ce.Y_FROM_LINRGB[2],
      n = t % 4 <= 1 ? 0 : 100,
      i = t % 2 == 0 ? 0 : 100;
    if (t < 4) {
      const t = n,
        o = i,
        l = (e - t * a - o * s) / r;
      return ce.isBounded(l) ? [l, t, o] : [-1, -1, -1];
    }
    if (t < 8) {
      const t = n,
        o = i,
        l = (e - o * r - t * s) / a;
      return ce.isBounded(l) ? [o, l, t] : [-1, -1, -1];
    }
    {
      const t = n,
        o = i,
        l = (e - t * r - o * a) / s;
      return ce.isBounded(l) ? [t, o, l] : [-1, -1, -1];
    }
  }
  static bisectToSegment(e, t) {
    let r = [-1, -1, -1],
      a = r,
      s = 0,
      n = 0,
      i = !1,
      o = !0;
    for (let l = 0; l < 12; l++) {
      const c = ce.nthVertex(e, l);
      if (c[0] < 0) continue;
      const p = ce.hueOf(c);
      i
        ? (o || ce.areInCyclicOrder(s, p, n)) &&
          ((o = !1),
          ce.areInCyclicOrder(s, t, p)
            ? ((a = c), (n = p))
            : ((r = c), (s = p)))
        : ((r = c), (a = c), (s = p), (n = p), (i = !0));
    }
    return [r, a];
  }
  static midpoint(e, t) {
    return [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2, (e[2] + t[2]) / 2];
  }
  static criticalPlaneBelow(e) {
    return Math.floor(e - 0.5);
  }
  static criticalPlaneAbove(e) {
    return Math.ceil(e - 0.5);
  }
  static bisectToLimit(e, t) {
    const r = ce.bisectToSegment(e, t);
    let a = r[0],
      s = ce.hueOf(a),
      n = r[1];
    for (let i = 0; i < 3; i++)
      if (a[i] !== n[i]) {
        let e = -1,
          r = 255;
        a[i] < n[i]
          ? ((e = ce.criticalPlaneBelow(ce.trueDelinearized(a[i]))),
            (r = ce.criticalPlaneAbove(ce.trueDelinearized(n[i]))))
          : ((e = ce.criticalPlaneAbove(ce.trueDelinearized(a[i]))),
            (r = ce.criticalPlaneBelow(ce.trueDelinearized(n[i]))));
        for (let o = 0; o < 8 && !(Math.abs(r - e) <= 1); o++) {
          const o = Math.floor((e + r) / 2),
            l = ce.CRITICAL_PLANES[o],
            c = ce.setCoordinate(a, l, n, i),
            p = ce.hueOf(c);
          ce.areInCyclicOrder(s, t, p)
            ? ((n = c), (r = o))
            : ((a = c), (s = p), (e = o));
        }
      }
    return ce.midpoint(a, n);
  }
  static inverseChromaticAdaptation(e) {
    const t = Math.abs(e),
      r = Math.max(0, (27.13 * t) / (400 - t));
    return Y(e) * Math.pow(r, 1 / 0.42);
  }
  static findResultByJ(e, t, r) {
    let a = 11 * Math.sqrt(r);
    const s = oe.DEFAULT,
      n = 1 / Math.pow(1.64 - Math.pow(0.29, s.n), 0.73),
      i = 0.25 * (Math.cos(e + 2) + 3.8) * (5e4 / 13) * s.nc * s.ncb,
      o = Math.sin(e),
      l = Math.cos(e);
    for (let c = 0; c < 5; c++) {
      const e = a / 100,
        p = 0 === t || 0 === a ? 0 : t / Math.sqrt(e),
        d = Math.pow(p * n, 1 / 0.9),
        u = (s.aw * Math.pow(e, 1 / s.c / s.z)) / s.nbb,
        h = (23 * (u + 0.305) * d) / (23 * i + 11 * d * l + 108 * d * o),
        f = h * l,
        m = h * o,
        g = (460 * u + 451 * f + 288 * m) / 1403,
        v = (460 * u - 891 * f - 261 * m) / 1403,
        b = (460 * u - 220 * f - 6300 * m) / 1403,
        w = U(
          [
            ce.inverseChromaticAdaptation(g),
            ce.inverseChromaticAdaptation(v),
            ce.inverseChromaticAdaptation(b),
          ],
          ce.LINRGB_FROM_SCALED_DISCOUNT
        );
      if (w[0] < 0 || w[1] < 0 || w[2] < 0) return 0;
      const y = ce.Y_FROM_LINRGB[0],
        E = ce.Y_FROM_LINRGB[1],
        C = ce.Y_FROM_LINRGB[2],
        x = y * w[0] + E * w[1] + C * w[2];
      if (x <= 0) return 0;
      if (4 === c || Math.abs(x - r) < 0.002)
        return w[0] > 100.01 || w[1] > 100.01 || w[2] > 100.01 ? 0 : J(w);
      a -= ((x - r) * a) / (2 * x);
    }
    return 0;
  }
  static solveToInt(e, t, r) {
    if (t < 1e-4 || r < 1e-4 || r > 99.9999)
      return (function (e) {
        const t = ie(se(e));
        return Z(t, t, t);
      })(r);
    const a = ((e = W(e)) / 180) * Math.PI,
      s = se(r),
      n = ce.findResultByJ(a, t, s);
    return 0 !== n ? n : J(ce.bisectToLimit(s, a));
  }
  static solveToCam(e, t, r) {
    return le.fromInt(ce.solveToInt(e, t, r));
  }
}
(ce.SCALED_DISCOUNT_FROM_LINRGB = [
  [0.001200833568784504, 0.002389694492170889, 0.0002795742885861124],
  [0.0005891086651375999, 0.0029785502573438758, 0.0003270666104008398],
  [0.00010146692491640572, 0.0005364214359186694, 0.0032979401770712076],
]),
  (ce.LINRGB_FROM_SCALED_DISCOUNT = [
    [1373.2198709594231, -1100.4251190754821, -7.278681089101213],
    [-271.815969077903, 559.6580465940733, -32.46047482791194],
    [1.9622899599665666, -57.173814538844006, 308.7233197812385],
  ]),
  (ce.Y_FROM_LINRGB = [0.2126, 0.7152, 0.0722]),
  (ce.CRITICAL_PLANES = [
    0.015176349177441876, 0.045529047532325624, 0.07588174588720938,
    0.10623444424209313, 0.13658714259697685, 0.16693984095186062,
    0.19729253930674434, 0.2276452376616281, 0.2579979360165119,
    0.28835063437139563, 0.3188300904430532, 0.350925934958123,
    0.3848314933096426, 0.42057480301049466, 0.458183274052838,
    0.4976837250274023, 0.5391024159806381, 0.5824650784040898,
    0.6277969426914107, 0.6751227633498623, 0.7244668422128921,
    0.775853049866786, 0.829304845476233, 0.8848452951698498, 0.942497089126609,
    1.0022825574869039, 1.0642236851973577, 1.1283421258858297,
    1.1946592148522128, 1.2631959812511864, 1.3339731595349034,
    1.407011200216447, 1.4823302800086415, 1.5599503113873272,
    1.6398909516233677, 1.7221716113234105, 1.8068114625156377,
    1.8938294463134073, 1.9832442801866852, 2.075074464868551,
    2.1693382909216234, 2.2660538449872063, 2.36523901573795,
    2.4669114995532007, 2.5710888059345764, 2.6777882626779785,
    2.7870270208169257, 2.898822059350997, 3.0131901897720907,
    3.1301480604002863, 3.2497121605402226, 3.3718988244681087,
    3.4967242352587946, 3.624204428461639, 3.754355295633311, 3.887192587735158,
    4.022731918402185, 4.160988767090289, 4.301978482107941, 4.445716283538092,
    4.592217266055746, 4.741496401646282, 4.893568542229298, 5.048448422192488,
    5.20615066083972, 5.3666897647573375, 5.5300801301023865, 5.696336044816294,
    5.865471690767354, 6.037501145825082, 6.212438385869475, 6.390297286737924,
    6.571091626112461, 6.7548350853498045, 6.941541251256611, 7.131223617812143,
    7.323895587840543, 7.5195704746346665, 7.7182615035334345,
    7.919981813454504, 8.124744458384042, 8.332562408825165, 8.543448553206703,
    8.757415699253682, 8.974476575321063, 9.194643831691977, 9.417930041841839,
    9.644347703669503, 9.873909240696694, 10.106627003236781,
    10.342513269534024, 10.58158024687427, 10.8238400726681, 11.069304815507364,
    11.317986476196008, 11.569896988756009, 11.825048221409341,
    12.083451977536606, 12.345119996613247, 12.610063955123938,
    12.878295467455942, 13.149826086772048, 13.42466730586372,
    13.702830557985108, 13.984327217668513, 14.269168601521828,
    14.55736596900856, 14.848930523210871, 15.143873411576273,
    15.44220572664832, 15.743938506781891, 16.04908273684337, 16.35764934889634,
    16.66964922287304, 16.985093187232053, 17.30399201960269, 17.62635644741625,
    17.95219714852476, 18.281524751807332, 18.614349837764564,
    18.95068293910138, 19.290534541298456, 19.633915083172692,
    19.98083495742689, 20.331304511189067, 20.685334046541502,
    21.042933821039977, 21.404114048223256, 21.76888489811322,
    22.137256497705877, 22.50923893145328, 22.884842241736916,
    23.264076429332462, 23.6469514538663, 24.033477234264016, 24.42366364919083,
    24.817520537484558, 25.21505769858089, 25.61628489293138,
    26.021211842414342, 26.429848230738664, 26.842203703840827,
    27.258287870275353, 27.678110301598522, 28.10168053274597,
    28.529008062403893, 28.96010235337422, 29.39497283293396, 29.83362889318845,
    30.276079891419332, 30.722335150426627, 31.172403958865512,
    31.62629557157785, 32.08401920991837, 32.54558406207592, 33.010999283389665,
    33.4802739966603, 33.953417292456834, 34.430438229418264,
    34.911345834551085, 35.39614910352207, 35.88485700094671, 36.37747846067349,
    36.87402238606382, 37.37449765026789, 37.87891309649659, 38.38727753828926,
    38.89959975977785, 39.41588851594697, 39.93615253289054, 40.460400508064545,
    40.98864111053629, 41.520882981230194, 42.05713473317016,
    42.597404951718396, 43.141702194811224, 43.6900349931913, 44.24241185063697,
    44.798841244188324, 45.35933162437017, 45.92389141541209, 46.49252901546552,
    47.065252796817916, 47.64207110610409, 48.22299226451468,
    48.808024568002054, 49.3971762874833, 49.9904556690408, 50.587870934119984,
    51.189430279724725, 51.79514187861014, 52.40501387947288, 53.0190544071392,
    53.637271562750364, 54.259673423945976, 54.88626804504493,
    55.517063457223934, 56.15206766869424, 56.79128866487574, 57.43473440856916,
    58.08241284012621, 58.734331877617365, 59.39049941699807, 60.05092333227251,
    60.715611475655585, 61.38457167773311, 62.057811747619894, 62.7353394731159,
    63.417162620860914, 64.10328893648692, 64.79372614476921, 65.48848194977529,
    66.18756403501224, 66.89098006357258, 67.59873767827808, 68.31084450182222,
    69.02730813691093, 69.74813616640164, 70.47333615344107, 71.20291564160104,
    71.93688215501312, 72.67524319850172, 73.41800625771542, 74.16517879925733,
    74.9167682708136, 75.67278210128072, 76.43322770089146, 77.1981124613393,
    77.96744375590167, 78.74122893956174, 79.51947534912904, 80.30219030335869,
    81.08938110306934, 81.88105503125999, 82.67721935322541, 83.4778813166706,
    84.28304815182372, 85.09272707154808, 85.90692527145302, 86.72564993000343,
    87.54890820862819, 88.3767072518277, 89.2090541872801, 90.04595612594655,
    90.88742016217518, 91.73345337380438, 92.58406282226491, 93.43925555268066,
    94.29903859396902, 95.16341895893969, 96.03240364439274, 96.9059996312159,
    97.78421388448044, 98.6670533535366, 99.55452497210776,
  ]);
class pe {
  constructor(e) {
    this.argb = e;
    const t = le.fromInt(e);
    (this.internalHue = t.hue),
      (this.internalChroma = t.chroma),
      (this.internalTone = ae(e)),
      (this.argb = e);
  }
  static from(e, t, r) {
    return new pe(ce.solveToInt(e, t, r));
  }
  static fromInt(e) {
    return new pe(e);
  }
  toInt() {
    return this.argb;
  }
  get hue() {
    return this.internalHue;
  }
  set hue(e) {
    this.setInternalState(
      ce.solveToInt(e, this.internalChroma, this.internalTone)
    );
  }
  get chroma() {
    return this.internalChroma;
  }
  set chroma(e) {
    this.setInternalState(
      ce.solveToInt(this.internalHue, e, this.internalTone)
    );
  }
  get tone() {
    return this.internalTone;
  }
  set tone(e) {
    this.setInternalState(
      ce.solveToInt(this.internalHue, this.internalChroma, e)
    );
  }
  setInternalState(e) {
    const t = le.fromInt(e);
    (this.internalHue = t.hue),
      (this.internalChroma = t.chroma),
      (this.internalTone = ae(e)),
      (this.argb = e);
  }
}
class de {
  static harmonize(e, t) {
    const r = pe.fromInt(e),
      a = pe.fromInt(t),
      s = ((l = r.hue), (c = a.hue), 180 - Math.abs(Math.abs(l - c) - 180)),
      n = Math.min(0.5 * s, 15),
      i = W(r.hue + n * ((o = r.hue), W(a.hue - o) <= 180 ? 1 : -1));
    var o, l, c;
    return pe.from(i, r.chroma, r.tone).toInt();
  }
  static hctHue(e, t, r) {
    const a = de.cam16Ucs(e, t, r),
      s = le.fromInt(a),
      n = le.fromInt(e);
    return pe.from(s.hue, n.chroma, ae(e)).toInt();
  }
  static cam16Ucs(e, t, r) {
    const a = le.fromInt(e),
      s = le.fromInt(t),
      n = a.jstar,
      i = a.astar,
      o = a.bstar,
      l = n + (s.jstar - n) * r,
      c = i + (s.astar - i) * r,
      p = o + (s.bstar - o) * r;
    return le.fromUcs(l, c, p).toInt();
  }
}
class ue {
  constructor(e, t) {
    (this.hue = e), (this.chroma = t), (this.cache = new Map());
  }
  static fromInt(e) {
    const t = pe.fromInt(e);
    return ue.fromHueAndChroma(t.hue, t.chroma);
  }
  static fromHueAndChroma(e, t) {
    return new ue(e, t);
  }
  tone(e) {
    let t = this.cache.get(e);
    return (
      void 0 === t &&
        ((t = pe.from(this.hue, this.chroma, e).toInt()), this.cache.set(e, t)),
      t
    );
  }
}
class he {
  constructor(e, t) {
    const r = pe.fromInt(e),
      a = r.hue,
      s = r.chroma;
    t
      ? ((this.a1 = ue.fromHueAndChroma(a, s)),
        (this.a2 = ue.fromHueAndChroma(a, s / 3)),
        (this.a3 = ue.fromHueAndChroma(a + 60, s / 2)),
        (this.n1 = ue.fromHueAndChroma(a, Math.min(s / 12, 4))),
        (this.n2 = ue.fromHueAndChroma(a, Math.min(s / 6, 8))))
      : ((this.a1 = ue.fromHueAndChroma(a, Math.max(48, s))),
        (this.a2 = ue.fromHueAndChroma(a, 16)),
        (this.a3 = ue.fromHueAndChroma(a + 60, 24)),
        (this.n1 = ue.fromHueAndChroma(a, 4)),
        (this.n2 = ue.fromHueAndChroma(a, 8))),
      (this.error = ue.fromHueAndChroma(25, 84));
  }
  static of(e) {
    return new he(e, !1);
  }
  static contentOf(e) {
    return new he(e, !0);
  }
}
class fe {
  constructor(e) {
    this.props = e;
  }
  get primary() {
    return this.props.primary;
  }
  get onPrimary() {
    return this.props.onPrimary;
  }
  get primaryContainer() {
    return this.props.primaryContainer;
  }
  get onPrimaryContainer() {
    return this.props.onPrimaryContainer;
  }
  get secondary() {
    return this.props.secondary;
  }
  get onSecondary() {
    return this.props.onSecondary;
  }
  get secondaryContainer() {
    return this.props.secondaryContainer;
  }
  get onSecondaryContainer() {
    return this.props.onSecondaryContainer;
  }
  get tertiary() {
    return this.props.tertiary;
  }
  get onTertiary() {
    return this.props.onTertiary;
  }
  get tertiaryContainer() {
    return this.props.tertiaryContainer;
  }
  get onTertiaryContainer() {
    return this.props.onTertiaryContainer;
  }
  get error() {
    return this.props.error;
  }
  get onError() {
    return this.props.onError;
  }
  get errorContainer() {
    return this.props.errorContainer;
  }
  get onErrorContainer() {
    return this.props.onErrorContainer;
  }
  get background() {
    return this.props.background;
  }
  get onBackground() {
    return this.props.onBackground;
  }
  get surface() {
    return this.props.surface;
  }
  get onSurface() {
    return this.props.onSurface;
  }
  get surfaceVariant() {
    return this.props.surfaceVariant;
  }
  get onSurfaceVariant() {
    return this.props.onSurfaceVariant;
  }
  get outline() {
    return this.props.outline;
  }
  get outlineVariant() {
    return this.props.outlineVariant;
  }
  get shadow() {
    return this.props.shadow;
  }
  get scrim() {
    return this.props.scrim;
  }
  get inverseSurface() {
    return this.props.inverseSurface;
  }
  get inverseOnSurface() {
    return this.props.inverseOnSurface;
  }
  get inversePrimary() {
    return this.props.inversePrimary;
  }
  static light(e) {
    return fe.lightFromCorePalette(he.of(e));
  }
  static dark(e) {
    return fe.darkFromCorePalette(he.of(e));
  }
  static lightContent(e) {
    return fe.lightFromCorePalette(he.contentOf(e));
  }
  static darkContent(e) {
    return fe.darkFromCorePalette(he.contentOf(e));
  }
  static lightFromCorePalette(e) {
    return new fe({
      primary: e.a1.tone(40),
      onPrimary: e.a1.tone(100),
      primaryContainer: e.a1.tone(90),
      onPrimaryContainer: e.a1.tone(10),
      secondary: e.a2.tone(40),
      onSecondary: e.a2.tone(100),
      secondaryContainer: e.a2.tone(90),
      onSecondaryContainer: e.a2.tone(10),
      tertiary: e.a3.tone(40),
      onTertiary: e.a3.tone(100),
      tertiaryContainer: e.a3.tone(90),
      onTertiaryContainer: e.a3.tone(10),
      error: e.error.tone(40),
      onError: e.error.tone(100),
      errorContainer: e.error.tone(90),
      onErrorContainer: e.error.tone(10),
      background: e.n1.tone(99),
      onBackground: e.n1.tone(10),
      surface: e.n1.tone(99),
      onSurface: e.n1.tone(10),
      surfaceVariant: e.n2.tone(90),
      onSurfaceVariant: e.n2.tone(30),
      outline: e.n2.tone(50),
      outlineVariant: e.n2.tone(80),
      shadow: e.n1.tone(0),
      scrim: e.n1.tone(0),
      inverseSurface: e.n1.tone(20),
      inverseOnSurface: e.n1.tone(95),
      inversePrimary: e.a1.tone(80),
    });
  }
  static darkFromCorePalette(e) {
    return new fe({
      primary: e.a1.tone(80),
      onPrimary: e.a1.tone(20),
      primaryContainer: e.a1.tone(30),
      onPrimaryContainer: e.a1.tone(90),
      secondary: e.a2.tone(80),
      onSecondary: e.a2.tone(20),
      secondaryContainer: e.a2.tone(30),
      onSecondaryContainer: e.a2.tone(90),
      tertiary: e.a3.tone(80),
      onTertiary: e.a3.tone(20),
      tertiaryContainer: e.a3.tone(30),
      onTertiaryContainer: e.a3.tone(90),
      error: e.error.tone(80),
      onError: e.error.tone(20),
      errorContainer: e.error.tone(30),
      onErrorContainer: e.error.tone(80),
      background: e.n1.tone(10),
      onBackground: e.n1.tone(90),
      surface: e.n1.tone(10),
      onSurface: e.n1.tone(90),
      surfaceVariant: e.n2.tone(30),
      onSurfaceVariant: e.n2.tone(80),
      outline: e.n2.tone(60),
      outlineVariant: e.n2.tone(30),
      shadow: e.n1.tone(0),
      scrim: e.n1.tone(0),
      inverseSurface: e.n1.tone(90),
      inverseOnSurface: e.n1.tone(20),
      inversePrimary: e.a1.tone(40),
    });
  }
  toJSON() {
    return Object.assign({}, this.props);
  }
}
const me = (e) => {
    const t = ee(e),
      r = te(e),
      a = re(e),
      s = [t.toString(16), r.toString(16), a.toString(16)];
    for (const [n, i] of s.entries()) 1 === i.length && (s[n] = "0" + i);
    return "#" + s.join("");
  },
  ge = (e) => {
    const t = 3 === (e = e.replace("#", "")).length,
      r = 6 === e.length,
      a = 8 === e.length;
    if (!t && !r && !a) throw new Error("unexpected hex " + e);
    let s = 0,
      n = 0,
      i = 0;
    return (
      t
        ? ((s = ve(e.slice(0, 1).repeat(2))),
          (n = ve(e.slice(1, 2).repeat(2))),
          (i = ve(e.slice(2, 3).repeat(2))))
        : r
        ? ((s = ve(e.slice(0, 2))),
          (n = ve(e.slice(2, 4))),
          (i = ve(e.slice(4, 6))))
        : a &&
          ((s = ve(e.slice(2, 4))),
          (n = ve(e.slice(4, 6))),
          (i = ve(e.slice(6, 8)))),
      ((255 << 24) | ((255 & s) << 16) | ((255 & n) << 8) | (255 & i)) >>> 0
    );
  };
function ve(e) {
  return parseInt(e, 16);
}
function be(e, t) {
  void 0 === t && (t = []);
  const r = he.of(e);
  return {
    source: e,
    schemes: { light: fe.light(e), dark: fe.dark(e) },
    palettes: {
      primary: r.a1,
      secondary: r.a2,
      tertiary: r.a3,
      neutral: r.n1,
      neutralVariant: r.n2,
      error: r.error,
    },
    customColors: t.map((t) =>
      (function (e, t) {
        let r = t.value;
        const a = r,
          s = e;
        t.blend && (r = de.harmonize(a, s));
        const n = he.of(r).a1;
        return {
          color: t,
          value: r,
          light: {
            color: n.tone(40),
            onColor: n.tone(100),
            colorContainer: n.tone(90),
            onColorContainer: n.tone(10),
          },
          dark: {
            color: n.tone(80),
            onColor: n.tone(20),
            colorContainer: n.tone(30),
            onColorContainer: n.tone(90),
          },
        };
      })(e, t)
    ),
  };
}
function we(e) {
  const t = Math.round,
    r = e.length,
    a = {};
  return (
    "rgb" === e.slice(0, 3).toLowerCase()
      ? ((e = e.replace(" ", "").split(",")),
        (a[0] = parseInt(e[0].slice("a" === e[3].toLowerCase() ? 5 : 4), 10)),
        (a[1] = parseInt(e[1], 10)),
        (a[2] = parseInt(e[2], 10)),
        (a[3] = e[3] ? parseFloat(e[3]) : -1))
      : ((e =
          r < 6
            ? parseInt(
                String(e[1]) +
                  e[1] +
                  e[2] +
                  e[2] +
                  e[3] +
                  e[3] +
                  (r > 4 ? String(e[4]) + e[4] : ""),
                16
              )
            : parseInt(e.slice(1), 16)),
        (a[0] = (e >> 16) & 255),
        (a[1] = (e >> 8) & 255),
        (a[2] = 255 & e),
        (a[3] =
          9 === r || 5 === r ? t((((e >> 24) & 255) / 255) * 1e4) / 1e4 : -1)),
    a
  );
}
function ye(e, t, r) {
  void 0 === r && (r = 0.5);
  const a = Math.round;
  (e = e.trim()), (t = t.trim());
  r = r < 0 ? -1 * r : r;
  const s = we(e),
    n = we(t);
  return "r" === t[0]
    ? "rgb" +
        ("a" === t[3] ? "a(" : "(") +
        a((n[0] - s[0]) * r + s[0]) +
        "," +
        a((n[1] - s[1]) * r + s[1]) +
        "," +
        a((n[2] - s[2]) * r + s[2]) +
        (s[3] < 0 && n[3] < 0
          ? ""
          : "," +
            (s[3] > -1 && n[3] > -1
              ? a(1e4 * ((n[3] - s[3]) * r + s[3])) / 1e4
              : n[3] < 0
              ? s[3]
              : n[3])) +
        ")"
    : "#" +
        (
          4294967296 +
          16777216 *
            (s[3] > -1 && n[3] > -1
              ? a(255 * ((n[3] - s[3]) * r + s[3]))
              : n[3] > -1
              ? a(255 * n[3])
              : s[3] > -1
              ? a(255 * s[3])
              : 255) +
          65536 * a((n[0] - s[0]) * r + s[0]) +
          256 * a((n[1] - s[1]) * r + s[1]) +
          a((n[2] - s[2]) * r + s[2])
        )
          .toString(16)
          .slice(s[3] > -1 || n[3] > -1 ? 1 : 3);
}
const Ee = function (e) {
  void 0 === e && (e = "");
  const t = be(ge(`#${e.replace("#", "")}`));
  [0.05, 0.08, 0.11, 0.12, 0.14].forEach((e, r) => {
    (t.schemes.light.props[`surface${r + 1}`] = ge(
      ye(
        me(t.schemes.light.props.surface),
        me(t.schemes.light.props.primary),
        e
      )
    )),
      (t.schemes.dark.props[`surface${r + 1}`] = ge(
        ye(
          me(t.schemes.dark.props.surface),
          me(t.schemes.dark.props.primary),
          e
        )
      ));
  });
  const r = (e) =>
      e
        .split("")
        .map((e) =>
          e.toUpperCase() === e && "-" !== e && "7" !== e
            ? `-${e.toLowerCase()}`
            : e
        )
        .join(""),
    a = (e) =>
      ["tertiary", "shadow", "scrim", "error", "background"].filter((t) =>
        e.toLowerCase().includes(t)
      ).length > 0,
    s = {},
    n = {};
  return (
    Object.keys(t.schemes.light.props).forEach((e) => {
      a(e) || (s[r(`--f7-md-${e}`)] = me(t.schemes.light.props[e]));
    }),
    Object.keys(t.schemes.dark.props).forEach((e) => {
      a(e) || (n[r(`--f7-md-${e}`)] = me(t.schemes.dark.props[e]));
    }),
    { light: s, dark: n }
  );
};
let Ce = 0;
function xe(e, t) {
  void 0 === e && (e = "xxxxxxxxxx"), void 0 === t && (t = "0123456789abcdef");
  const r = t.length;
  return e.replace(/x/g, () => t[Math.floor(Math.random() * r)]);
}
const Se =
    '\n  <span class="preloader-inner">\n    <svg viewBox="0 0 36 36">\n      <circle cx="18" cy="18" r="16"></circle>\n    </svg>\n  </span>\n'.trim(),
  ke = `\n  <span class="preloader-inner">\n    ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map(() => '<span class="preloader-inner-line"></span>')
    .join("")}\n  </span>\n`.trim();
function Te(e) {
  let t;
  return e
    .split("")
    .map((e, r) =>
      e.match(/[A-Z]/) && 0 !== r && !t
        ? ((t = !0), `:${e.toLowerCase()}`)
        : e.toLowerCase()
    )
    .join("");
}
function Me(e) {
  const t = e;
  Object.keys(t).forEach((e) => {
    try {
      t[e] = null;
    } catch (r) {}
    try {
      delete t[e];
    } catch (r) {}
  });
}
function Ae(e) {
  return f().requestAnimationFrame(e);
}
function $e(e, t) {
  return void 0 === t && (t = 0), setTimeout(e, t);
}
function Pe(e) {
  return Ae(() => {
    Ae(e);
  });
}
function Oe() {
  return Date.now();
}
function Le(e) {
  const t = f(),
    r = {};
  let a,
    s,
    n,
    i,
    o = e || t.location.href;
  if ("string" == typeof o && o.length)
    for (
      o = o.indexOf("?") > -1 ? o.replace(/\S*\?/, "") : "",
        s = o.split("&").filter((e) => "" !== e),
        i = s.length,
        a = 0;
      a < i;
      a += 1
    )
      (n = s[a].replace(/#\S+/g, "").split("=")),
        (r[decodeURIComponent(n[0])] =
          void 0 === n[1]
            ? void 0
            : decodeURIComponent(n.slice(1).join("=")) || "");
  return r;
}
function Re(e, t) {
  void 0 === t && (t = "x");
  const r = f();
  let a, s, n;
  const i = r.getComputedStyle(e, null);
  return (
    r.WebKitCSSMatrix
      ? ((s = i.transform || i.webkitTransform),
        s.split(",").length > 6 &&
          (s = s
            .split(", ")
            .map((e) => e.replace(",", "."))
            .join(", ")),
        (n = new r.WebKitCSSMatrix("none" === s ? "" : s)))
      : ((n =
          i.MozTransform ||
          i.OTransform ||
          i.MsTransform ||
          i.msTransform ||
          i.transform ||
          i
            .getPropertyValue("transform")
            .replace("translate(", "matrix(1, 0, 0, 1,")),
        (a = n.toString().split(","))),
    "x" === t &&
      (s = r.WebKitCSSMatrix
        ? n.m41
        : 16 === a.length
        ? parseFloat(a[12])
        : parseFloat(a[4])),
    "y" === t &&
      (s = r.WebKitCSSMatrix
        ? n.m42
        : 16 === a.length
        ? parseFloat(a[13])
        : parseFloat(a[5])),
    s || 0
  );
}
function Ie(e, t) {
  if ((void 0 === t && (t = []), "string" == typeof e)) return e;
  const r = [];
  let a;
  function s(e) {
    if (t.length > 0) {
      let r = "";
      for (let e = 0; e < t.length; e += 1)
        r += 0 === e ? t[e] : `[${encodeURIComponent(t[e])}]`;
      return `${r}[${encodeURIComponent(e)}]`;
    }
    return encodeURIComponent(e);
  }
  function n(e) {
    return encodeURIComponent(e);
  }
  return (
    Object.keys(e).forEach((i) => {
      let o;
      if (Array.isArray(e[i])) {
        o = [];
        for (let r = 0; r < e[i].length; r += 1)
          Array.isArray(e[i][r]) || "object" != typeof e[i][r]
            ? o.push(`${s(i)}[]=${n(e[i][r])}`)
            : ((a = t.slice()),
              a.push(i),
              a.push(String(r)),
              o.push(Ie(e[i][r], a)));
        o.length > 0 && r.push(o.join("&"));
      } else
        null === e[i] || "" === e[i]
          ? r.push(`${s(i)}=`)
          : "object" == typeof e[i]
          ? ((a = t.slice()),
            a.push(i),
            (o = Ie(e[i], a)),
            "" !== o && r.push(o))
          : void 0 !== e[i] && "" !== e[i]
          ? r.push(`${s(i)}=${n(e[i])}`)
          : "" === e[i] && r.push(s(i));
    }),
    r.join("&")
  );
}
function ze(e) {
  return (
    "object" == typeof e &&
    null !== e &&
    e.constructor &&
    e.constructor === Object
  );
}
function Be() {
  for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
    t[r] = arguments[r];
  const a = t[0];
  t.splice(0, 1);
  const s = t;
  for (let n = 0; n < s.length; n += 1) {
    const e = t[n];
    if (null != e) {
      const t = Object.keys(Object(e));
      for (let r = 0, s = t.length; r < s; r += 1) {
        const s = t[r],
          n = Object.getOwnPropertyDescriptor(e, s);
        void 0 !== n && n.enumerable && (a[s] = e[s]);
      }
    }
  }
  return a;
}
function He() {
  let e,
    t,
    r = !0;
  for (var a = arguments.length, s = new Array(a), n = 0; n < a; n++)
    s[n] = arguments[n];
  "boolean" == typeof s[0]
    ? ((r = s[0]), (e = s[1]), s.splice(0, 2), (t = s))
    : ((e = s[0]), s.splice(0, 1), (t = s));
  for (let i = 0; i < t.length; i += 1) {
    const t = s[i];
    if (null != t) {
      const a = Object.keys(Object(t));
      for (let s = 0, n = a.length; s < n; s += 1) {
        const n = a[s],
          i = Object.getOwnPropertyDescriptor(t, n);
        void 0 !== i &&
          i.enumerable &&
          (r
            ? ze(e[n]) && ze(t[n])
              ? He(e[n], t[n])
              : !ze(e[n]) && ze(t[n])
              ? ((e[n] = {}), He(e[n], t[n]))
              : (e[n] = t[n])
            : (e[n] = t[n]));
      }
    }
  }
  return e;
}
function De(e) {
  const t = e.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (e, t, r, a) => t + t + r + r + a + a
    ),
    r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
  return r ? r.slice(1).map((e) => parseInt(e, 16)) : null;
}
function Ne(e, t, r) {
  return `#${[e, t, r]
    .map((e) => {
      const t = e.toString(16);
      return 1 === t.length ? `0${t}` : t;
    })
    .join("")}`;
}
function _e(e, t, r) {
  (e /= 255), (t /= 255), (r /= 255);
  const a = Math.max(e, t, r),
    s = Math.min(e, t, r),
    n = a - s;
  let i;
  0 === n
    ? (i = 0)
    : a === e
    ? (i = ((t - r) / n) % 6)
    : a === t
    ? (i = (r - e) / n + 2)
    : a === r && (i = (e - t) / n + 4);
  const o = (s + a) / 2;
  return (
    i < 0 && (i = 6 + i),
    [60 * i, 0 === n ? 0 : n / (1 - Math.abs(2 * o - 1)), o]
  );
}
function je(e, t, r) {
  const a = (1 - Math.abs(2 * r - 1)) * t,
    s = e / 60,
    n = a * (1 - Math.abs((s % 2) - 1));
  let i;
  Number.isNaN(e) || void 0 === e
    ? (i = [0, 0, 0])
    : s <= 1
    ? (i = [a, n, 0])
    : s <= 2
    ? (i = [n, a, 0])
    : s <= 3
    ? (i = [0, a, n])
    : s <= 4
    ? (i = [0, n, a])
    : s <= 5
    ? (i = [n, 0, a])
    : s <= 6 && (i = [a, 0, n]);
  const o = r - a / 2;
  return i.map((e) => Math.max(0, Math.min(255, Math.round(255 * (e + o)))));
}
const qe = (e) => {
  const t = _e(...e),
    r = [t[0], t[1], Math.max(0, t[2] - 0.08)],
    a = [t[0], t[1], Math.max(0, t[2] + 0.08)];
  return { shade: Ne(...je(...r)), tint: Ne(...je(...a)) };
};
function Ve() {
  let e, t;
  for (var r = arguments.length, a = new Array(r), s = 0; s < r; s++)
    a[s] = arguments[s];
  if (
    (1 === a.length
      ? ((e = a[0]), (t = De(e)))
      : 3 === a.length && ((t = a), (e = Ne(...t))),
    !t)
  )
    return {};
  const { light: n, dark: i } = Ee(e),
    l = qe(t),
    c = qe(De(n["--f7-md-primary"])),
    p = qe(De(i["--f7-md-primary"]));
  return (
    Object.keys(n).forEach((e) => {
      e.includes("surface-") && (n[`${e}-rgb`] = De(n[e]));
    }),
    Object.keys(i).forEach((e) => {
      e.includes("surface-") && (i[`${e}-rgb`] = De(i[e]));
    }),
    {
      ios: {
        "--f7-theme-color": "var(--f7-ios-primary)",
        "--f7-theme-color-rgb": "var(--f7-ios-primary-rgb)",
        "--f7-theme-color-shade": "var(--f7-ios-primary-shade)",
        "--f7-theme-color-tint": "var(--f7-ios-primary-tint)",
      },
      md: {
        "--f7-theme-color": "var(--f7-md-primary)",
        "--f7-theme-color-rgb": "var(--f7-md-primary-rgb)",
        "--f7-theme-color-shade": "var(--f7-md-primary-shade)",
        "--f7-theme-color-tint": "var(--f7-md-primary-tint)",
      },
      light: o(
        {
          "--f7-ios-primary": e,
          "--f7-ios-primary-shade": l.shade,
          "--f7-ios-primary-tint": l.tint,
          "--f7-ios-primary-rgb": t.join(", "),
          "--f7-md-primary-shade": c.shade,
          "--f7-md-primary-tint": c.tint,
          "--f7-md-primary-rgb": De(n["--f7-md-primary"]).join(", "),
        },
        n
      ),
      dark: o(
        {
          "--f7-md-primary-shade": p.shade,
          "--f7-md-primary-tint": p.tint,
          "--f7-md-primary-rgb": De(i["--f7-md-primary"]).join(", "),
        },
        i
      ),
    }
  );
}
function Fe(e, t) {
  Object.keys(t).forEach((r) => {
    ze(t[r]) &&
      Object.keys(t[r]).forEach((a) => {
        "function" == typeof t[r][a] && (t[r][a] = t[r][a].bind(e));
      }),
      (e[r] = t[r]);
  });
}
function Ye() {
  const e = [];
  for (var t = arguments.length, r = new Array(t), a = 0; a < t; a++)
    r[a] = arguments[a];
  return (
    r.forEach((t) => {
      Array.isArray(t) ? e.push(...Ye(...t)) : e.push(t);
    }),
    e
  );
}
var Ge = Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  uniqueNumber: function () {
    return (Ce += 1), Ce;
  },
  id: xe,
  mdPreloaderContent: Se,
  iosPreloaderContent: ke,
  eventNameToColonCase: Te,
  deleteProps: Me,
  requestAnimationFrame: Ae,
  cancelAnimationFrame: function (e) {
    return f().cancelAnimationFrame(e);
  },
  nextTick: $e,
  nextFrame: Pe,
  now: Oe,
  parseUrlQuery: Le,
  getTranslate: Re,
  serializeObject: Ie,
  isObject: ze,
  merge: Be,
  extend: He,
  colorHexToRgb: De,
  colorRgbToHex: Ne,
  colorRgbToHsl: _e,
  colorHslToRgb: je,
  colorHsbToHsl: function (e, t, r) {
    const a = { h: e, s: 0, l: 0 },
      s = t,
      n = r;
    return (
      (a.l = ((2 - s) * n) / 2),
      (a.s =
        a.l && a.l < 1 ? (s * n) / (a.l < 0.5 ? 2 * a.l : 2 - 2 * a.l) : a.s),
      [a.h, a.s, a.l]
    );
  },
  colorHslToHsb: function (e, t, r) {
    const a = { h: e, s: 0, b: 0 },
      s = r,
      n = t * (s < 0.5 ? s : 1 - s);
    return (a.b = s + n), (a.s = s > 0 ? (2 * n) / a.b : a.s), [a.h, a.s, a.b];
  },
  colorThemeCSSProperties: Ve,
  bindMethods: Fe,
  flattenArray: Ye,
  colorThemeCSSStyles: function (e) {
    void 0 === e && (e = {});
    const t = (e) => {
        let t = "";
        return (
          Object.keys(e).forEach((r) => {
            t += `${r}:${e[r]};`;
          }),
          t
        );
      },
      r = Ve(e.primary),
      a = [
        ":root{",
        t(r.light),
        "--swiper-theme-color:var(--f7-theme-color);",
        ...Object.keys(e).map((t) => `--f7-color-${t}: ${e[t]};`),
        "}",
        ".dark{",
        t(r.dark),
        "}",
        ".ios{",
        t(r.ios),
        "}",
        ".md{",
        t(r.md),
        "}",
      ].join(""),
      s = {};
    Object.keys(e).forEach((t) => {
      const r = e[t];
      s[t] = Ve(r);
    });
    let n = "";
    return (
      Object.keys(e).forEach((r) => {
        const { light: a, dark: i, ios: o, md: l } = s[r],
          c =
            "\n    --f7-ios-primary: #ffffff;\n    --f7-ios-primary-shade: #ebebeb;\n    --f7-ios-primary-tint: #ffffff;\n    --f7-ios-primary-rgb: 255, 255, 255;\n    --f7-md-primary-shade: #eee;\n    --f7-md-primary-tint: #fff;\n    --f7-md-primary-rgb: 255, 255, 255;\n    --f7-md-primary: #fff;\n    --f7-md-on-primary: #000;\n    --f7-md-primary-container: #fff;\n    --f7-md-on-primary-container: #000;\n    --f7-md-secondary: #fff;\n    --f7-md-on-secondary: #000;\n    --f7-md-secondary-container: #555;\n    --f7-md-on-secondary-container: #fff;\n    --f7-md-surface: #fff;\n    --f7-md-on-surface: #000;\n    --f7-md-surface-variant: #333;\n    --f7-md-on-surface-variant: #fff;\n    --f7-md-outline: #fff;\n    --f7-md-outline-variant: #fff;\n    --f7-md-inverse-surface: #000;\n    --f7-md-inverse-on-surface: #fff;\n    --f7-md-inverse-primary: #000;\n    --f7-md-surface-1: #f8f8f8;\n    --f7-md-surface-2: #f1f1f1;\n    --f7-md-surface-3: #e7e7e7;\n    --f7-md-surface-4: #e1e1e1;\n    --f7-md-surface-5: #d7d7d7;\n    --f7-md-surface-variant-rgb: 51, 51, 51;\n    --f7-md-on-surface-variant-rgb: 255, 255, 255;\n    --f7-md-surface-1-rgb: 248, 248, 248;\n    --f7-md-surface-2-rgb: 241, 241, 241;\n    --f7-md-surface-3-rgb: 231, 231, 231;\n    --f7-md-surface-4-rgb: 225, 225, 225;\n    --f7-md-surface-5-rgb: 215, 215, 215;\n    ",
          p =
            "\n    --f7-ios-primary: #000;\n    --f7-ios-primary-shade: #000;\n    --f7-ios-primary-tint: #232323;\n    --f7-ios-primary-rgb: 0, 0, 0;\n    --f7-md-primary-shade: #000;\n    --f7-md-primary-tint: #232323;\n    --f7-md-primary-rgb: 0, 0, 0;\n    --f7-md-primary: #000;\n    --f7-md-on-primary: #fff;\n    --f7-md-primary-container: #000;\n    --f7-md-on-primary-container: #fff;\n    --f7-md-secondary: #000;\n    --f7-md-on-secondary: #fff;\n    --f7-md-secondary-container: #aaa;\n    --f7-md-on-secondary-container: #000;\n    --f7-md-surface: #000;\n    --f7-md-on-surface: #fff;\n    --f7-md-surface-variant: #ccc;\n    --f7-md-on-surface-variant: #000;\n    --f7-md-outline: #000;\n    --f7-md-outline-variant: #000;\n    --f7-md-inverse-surface: #fff;\n    --f7-md-inverse-on-surface: #000;\n    --f7-md-inverse-primary: #fff;\n    --f7-md-surface-1: #070707;\n    --f7-md-surface-2: #161616;\n    --f7-md-surface-3: #232323;\n    --f7-md-surface-4: #303030;\n    --f7-md-surface-5: #373737;\n    --f7-md-surface-variant-rgb: 204, 204, 204;\n    --f7-md-on-surface-variant-rgb: 0, 0, 0;\n    --f7-md-surface-1-rgb: 7, 7, 7;\n    --f7-md-surface-2-rgb: 22, 22, 22;\n    --f7-md-surface-3-rgb: 35, 35, 35;\n    --f7-md-surface-4-rgb: 48, 48, 48;\n    --f7-md-surface-5-rgb: 55, 55, 55;\n    ",
          d = "white" === r ? c : "black" === r ? p : t(a),
          u = "white" === r ? c : "black" === r ? p : t(i);
        n += [
          `.color-${r} {`,
          d,
          "--swiper-theme-color: var(--f7-theme-color);",
          "}",
          `.color-${r}.dark, .color-${r} .dark, .dark .color-${r} {`,
          u,
          "--swiper-theme-color: var(--f7-theme-color);",
          "}",
          `.ios .color-${r}, .ios.color-${r} {`,
          t(o),
          "}",
          `.md .color-${r}, .md.color-${r} {`,
          t(l),
          "}",
          `.text-color-${r} {`,
          `--f7-theme-color-text-color: ${e[r]};`,
          "}",
          `.bg-color-${r} {`,
          `--f7-theme-color-bg-color: ${e[r]};`,
          "}",
          `.border-color-${r} {`,
          `--f7-theme-color-border-color: ${e[r]};`,
          "}",
          `.ripple-color-${r} {`,
          `--f7-theme-color-ripple-color: rgba(${a["--f7-ios-primary-rgb"]}, 0.3);`,
          "}",
        ].join("");
      }),
      `${a}${n}`
    );
  },
});
let We, Ue;
function Xe() {
  return (
    We ||
      (We = (function () {
        const e = f(),
          t = u();
        return {
          touch: !!(
            "ontouchstart" in e ||
            (e.DocumentTouch && t instanceof e.DocumentTouch)
          ),
          pointerEvents:
            !!e.PointerEvent &&
            "maxTouchPoints" in e.navigator &&
            e.navigator.maxTouchPoints >= 0,
          passiveListener: (function () {
            let t = !1;
            try {
              const r = Object.defineProperty({}, "passive", {
                get() {
                  t = !0;
                },
              });
              e.addEventListener("testPassiveListener", null, r);
            } catch (r) {}
            return t;
          })(),
          intersectionObserver: "IntersectionObserver" in e,
        };
      })()),
    We
  );
}
function Qe(e, t) {
  return (
    void 0 === e && (e = {}),
    (Ue && !t) ||
      (Ue = (function (e) {
        let { userAgent: t } = void 0 === e ? {} : e;
        const r = Xe(),
          a = f(),
          s = a.navigator.platform,
          n = t || a.navigator.userAgent,
          i = {
            ios: !1,
            android: !1,
            androidChrome: !1,
            desktop: !1,
            iphone: !1,
            ipod: !1,
            ipad: !1,
            edge: !1,
            ie: !1,
            firefox: !1,
            macos: !1,
            windows: !1,
            cordova: !!a.cordova,
            electron: !1,
            capacitor: !!a.Capacitor,
            nwjs: !1,
          },
          o = a.screen.width,
          l = a.screen.height,
          c = n.match(/(Android);?[\s\/]+([\d.]+)?/);
        let p = n.match(/(iPad).*OS\s([\d_]+)/);
        const d = n.match(/(iPod)(.*OS\s([\d_]+))?/),
          u = !p && n.match(/(iPhone\sOS|iOS|iPhone;\sCPU\sOS)\s([\d_]+)/),
          h = n.indexOf("MSIE ") >= 0 || n.indexOf("Trident/") >= 0,
          m = n.indexOf("Edge/") >= 0,
          g = n.indexOf("Gecko/") >= 0 && n.indexOf("Firefox/") >= 0,
          v = "Win32" === s,
          b = n.toLowerCase().indexOf("electron") >= 0,
          w =
            "undefined" != typeof nw &&
            "undefined" != typeof process &&
            void 0 !== process.versions &&
            void 0 !== process.versions.nw;
        let y = "MacIntel" === s;
        return (
          !p &&
            y &&
            r.touch &&
            [
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
            ].indexOf(`${o}x${l}`) >= 0 &&
            ((p = n.match(/(Version)\/([\d.]+)/)),
            p || (p = [0, 1, "13_0_0"]),
            (y = !1)),
          (i.ie = h),
          (i.edge = m),
          (i.firefox = g),
          c &&
            ((i.os = "android"),
            (i.osVersion = c[2]),
            (i.android = !0),
            (i.androidChrome = n.toLowerCase().indexOf("chrome") >= 0)),
          (p || u || d) && ((i.os = "ios"), (i.ios = !0)),
          u && !d && ((i.osVersion = u[2].replace(/_/g, ".")), (i.iphone = !0)),
          p && ((i.osVersion = p[2].replace(/_/g, ".")), (i.ipad = !0)),
          d &&
            ((i.osVersion = d[3] ? d[3].replace(/_/g, ".") : null),
            (i.ipod = !0)),
          i.ios &&
            i.osVersion &&
            n.indexOf("Version/") >= 0 &&
            "10" === i.osVersion.split(".")[0] &&
            (i.osVersion = n.toLowerCase().split("version/")[1].split(" ")[0]),
          (i.webView =
            !(
              !(u || p || d) ||
              (!n.match(/.*AppleWebKit(?!.*Safari)/i) &&
                !a.navigator.standalone)
            ) ||
            (a.matchMedia &&
              a.matchMedia("(display-mode: standalone)").matches)),
          (i.webview = i.webView),
          (i.standalone = i.webView),
          (i.desktop = !(i.ios || i.android) || b || w),
          i.desktop &&
            ((i.electron = b),
            (i.nwjs = w),
            (i.macos = y),
            (i.windows = v),
            i.macos && (i.os = "macos"),
            i.windows && (i.os = "windows")),
          (i.pixelRatio = a.devicePixelRatio || 1),
          (i.prefersColorScheme = function () {
            let e;
            return (
              a.matchMedia &&
                a.matchMedia("(prefers-color-scheme: light)").matches &&
                (e = "light"),
              a.matchMedia &&
                a.matchMedia("(prefers-color-scheme: dark)").matches &&
                (e = "dark"),
              e
            );
          }),
          i
        );
      })(e)),
    Ue
  );
}
var Ke = class {
  constructor(e) {
    void 0 === e && (e = []);
    (this.eventsParents = e), (this.eventsListeners = {});
  }
  on(e, t, r) {
    const a = this;
    if ("function" != typeof t) return a;
    const s = r ? "unshift" : "push";
    return (
      e.split(" ").forEach((e) => {
        a.eventsListeners[e] || (a.eventsListeners[e] = []),
          a.eventsListeners[e][s](t);
      }),
      a
    );
  }
  once(e, t, r) {
    const a = this;
    if ("function" != typeof t) return a;
    function s() {
      a.off(e, s), s.f7proxy && delete s.f7proxy;
      for (var r = arguments.length, n = new Array(r), i = 0; i < r; i++)
        n[i] = arguments[i];
      t.apply(a, n);
    }
    return (s.f7proxy = t), a.on(e, s, r);
  }
  off(e, t) {
    const r = this;
    return r.eventsListeners
      ? (e.split(" ").forEach((e) => {
          void 0 === t
            ? (r.eventsListeners[e] = [])
            : r.eventsListeners[e] &&
              r.eventsListeners[e].forEach((a, s) => {
                (a === t || (a.f7proxy && a.f7proxy === t)) &&
                  r.eventsListeners[e].splice(s, 1);
              });
        }),
        r)
      : r;
  }
  emit() {
    const e = this;
    if (!e.eventsListeners) return e;
    let t, r, a, s;
    for (var n = arguments.length, i = new Array(n), o = 0; o < n; o++)
      i[o] = arguments[o];
    "string" == typeof i[0] || Array.isArray(i[0])
      ? ((t = i[0]), (r = i.slice(1, i.length)), (a = e), (s = e.eventsParents))
      : ((t = i[0].events),
        (r = i[0].data),
        (a = i[0].context || e),
        (s = i[0].local ? [] : i[0].parents || e.eventsParents));
    const l = Array.isArray(t) ? t : t.split(" "),
      c = l.map((e) => e.replace("local::", "")),
      p = l.filter((e) => e.indexOf("local::") < 0);
    return (
      c.forEach((t) => {
        if (e.eventsListeners && e.eventsListeners[t]) {
          const s = [];
          e.eventsListeners[t].forEach((e) => {
            s.push(e);
          }),
            s.forEach((e) => {
              e.apply(a, r);
            });
        }
      }),
      s &&
        s.length > 0 &&
        s.forEach((e) => {
          e.emit(p, ...r);
        }),
      e
    );
  }
};
var Ze = class extends Ke {
  constructor(e, t) {
    void 0 === e && (e = {}), void 0 === t && (t = []), super(t);
    const r = this;
    (r.params = e),
      r.params &&
        r.params.on &&
        Object.keys(r.params.on).forEach((e) => {
          r.on(e, r.params.on[e]);
        });
  }
  useModuleParams(e, t) {
    if (e.params) {
      const r = {};
      Object.keys(e.params).forEach((e) => {
        void 0 !== t[e] && (r[e] = He({}, t[e]));
      }),
        He(t, e.params),
        Object.keys(r).forEach((e) => {
          He(t[e], r[e]);
        });
    }
  }
  useModulesParams(e) {
    const t = this;
    t.modules &&
      Object.keys(t.modules).forEach((r) => {
        const a = t.modules[r];
        a.params && He(e, a.params);
      });
  }
  useModule(e, t) {
    void 0 === e && (e = ""), void 0 === t && (t = {});
    const r = this;
    if (!r.modules) return;
    const a = "string" == typeof e ? r.modules[e] : e;
    a &&
      (a.instance &&
        Object.keys(a.instance).forEach((e) => {
          const t = a.instance[e];
          r[e] = "function" == typeof t ? t.bind(r) : t;
        }),
      a.on &&
        r.on &&
        Object.keys(a.on).forEach((e) => {
          r.on(e, a.on[e]);
        }),
      a.vnode &&
        (r.vnodeHooks || (r.vnodeHooks = {}),
        Object.keys(a.vnode).forEach((e) => {
          Object.keys(a.vnode[e]).forEach((t) => {
            const s = a.vnode[e][t];
            r.vnodeHooks[t] || (r.vnodeHooks[t] = {}),
              r.vnodeHooks[t][e] || (r.vnodeHooks[t][e] = []),
              r.vnodeHooks[t][e].push(s.bind(r));
          });
        })),
      a.create && a.create.bind(r)(t));
  }
  useModules(e) {
    void 0 === e && (e = {});
    const t = this;
    t.modules &&
      Object.keys(t.modules).forEach((r) => {
        const a = e[r] || {};
        t.useModule(r, a);
      });
  }
  static set components(e) {
    this.use && this.use(e);
  }
  static installModule(e) {
    const t = this;
    t.prototype.modules || (t.prototype.modules = {});
    const r = e.name || `${Object.keys(t.prototype.modules).length}_${Oe()}`;
    if (
      ((t.prototype.modules[r] = e),
      e.proto &&
        Object.keys(e.proto).forEach((r) => {
          t.prototype[r] = e.proto[r];
        }),
      e.static &&
        Object.keys(e.static).forEach((r) => {
          t[r] = e.static[r];
        }),
      e.install)
    ) {
      for (
        var a = arguments.length, s = new Array(a > 1 ? a - 1 : 0), n = 1;
        n < a;
        n++
      )
        s[n - 1] = arguments[n];
      e.install.apply(t, s);
    }
    return t;
  }
  static use(e) {
    const t = this;
    if (Array.isArray(e)) return e.forEach((e) => t.installModule(e)), t;
    for (
      var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), s = 1;
      s < r;
      s++
    )
      a[s - 1] = arguments[s];
    return t.installModule(e, ...a);
  }
};
function Je(e) {
  void 0 === e && (e = {});
  const {
      defaultSelector: t,
      constructor: r,
      domProp: a,
      app: s,
      addMethods: n,
    } = e,
    i = {
      create() {
        for (var e = arguments.length, t = new Array(e), a = 0; a < e; a++)
          t[a] = arguments[a];
        return s ? new r(s, ...t) : new r(...t);
      },
      get(e) {
        if ((void 0 === e && (e = t), e instanceof r)) return e;
        const s = F(e);
        return 0 !== s.length ? s[0][a] : void 0;
      },
      destroy(e) {
        const t = i.get(e);
        if (t && t.destroy) return t.destroy();
      },
    };
  return (
    n &&
      Array.isArray(n) &&
      n.forEach((e) => {
        i[e] = function (r) {
          void 0 === r && (r = t);
          const a = i.get(r);
          for (
            var s = arguments.length, n = new Array(s > 1 ? s - 1 : 0), o = 1;
            o < s;
            o++
          )
            n[o - 1] = arguments[o];
          if (a && a[e]) return a[e](...n);
        };
      }),
    i
  );
}
function et(e) {
  void 0 === e && (e = {});
  const { defaultSelector: t, constructor: r, app: a } = e;
  return He(
    Je({ defaultSelector: t, constructor: r, app: a, domProp: "f7Modal" }),
    {
      open(e, t, s) {
        let n = F(e);
        if (n.length > 1 && s) {
          const e = F(s).parents(".page");
          e.length &&
            n.each((t) => {
              const r = F(t);
              r.parents(e)[0] === e[0] && (n = r);
            });
        }
        if ((n.length > 1 && (n = n.eq(n.length - 1)), !n.length)) return;
        let i = n[0].f7Modal;
        if (!i) {
          const e = n.dataset();
          i = new r(a, o({ el: n }, e));
        }
        return i.open(t);
      },
      close(e, s, n) {
        void 0 === e && (e = t);
        let i = F(e);
        if (!i.length) return;
        if (i.length > 1) {
          let e;
          if (n) {
            const t = F(n);
            t.length && (e = t.parents(i));
          }
          i = e && e.length > 0 ? e : i.eq(i.length - 1);
        }
        let l = i[0].f7Modal;
        if (!l) {
          const e = i.dataset();
          l = new r(a, o({ el: i }, e));
        }
        return l.close(s);
      },
    }
  );
}
const tt = [];
var rt = function (e, t) {
  const r = t || {};
  for (
    var a = arguments.length, s = new Array(a > 2 ? a - 2 : 0), n = 2;
    n < a;
    n++
  )
    s[n - 2] = arguments[n];
  const i = s || [],
    o = Object.keys(r)
      .map((e) =>
        "_" === e[0] ? (r[e] ? e.replace("_", "") : "") : `${e}="${r[e]}"`
      )
      .filter((e) => !!e)
      .join(" ");
  if (["path", "img", "circle", "polygon", "line", "input"].indexOf(e) >= 0)
    return `<${e} ${o} />`.trim();
  const l = i
    .filter((e) => !!e)
    .map((e) => (Array.isArray(e) ? e.join("") : e))
    .join("");
  return `<${e} ${o}>${l}</${e}>`.trim();
};
class at extends Ze {
  constructor(e) {
    if (
      (void 0 === e && (e = {}),
      super(e),
      at.instance && "undefined" != typeof window)
    )
      throw new Error(
        "Framework7 is already initialized and can't be initialized more than once"
      );
    const t = Qe({ userAgent: e.userAgent || void 0 }),
      r = Xe(),
      a = He({}, e),
      s = this;
    (s.device = t), (s.support = r);
    const n = f(),
      i = u();
    at.instance = s;
    const o = {
      el: "body",
      theme: "auto",
      routes: [],
      name: "Framework7",
      lazyModulesPath: null,
      initOnDeviceReady: !0,
      init: !0,
      darkMode: void 0,
      iosTranslucentBars: !0,
      iosTranslucentModals: !0,
      component: void 0,
      componentUrl: void 0,
      userAgent: null,
      url: null,
      colors: {
        primary: "#007aff",
        red: "#ff3b30",
        green: "#4cd964",
        blue: "#2196f3",
        pink: "#ff2d55",
        yellow: "#ffcc00",
        orange: "#ff9500",
        purple: "#9c27b0",
        deeppurple: "#673ab7",
        lightblue: "#5ac8fa",
        teal: "#009688",
        lime: "#cddc39",
        deeporange: "#ff6b22",
        white: "#ffffff",
        black: "#000000",
      },
    };
    return (
      s.useModulesParams(o),
      (s.params = He(o, e)),
      He(s, {
        name: s.params.name,
        routes: s.params.routes,
        theme:
          "auto" === s.params.theme ? (t.ios ? "ios" : "md") : s.params.theme,
        passedParams: a,
        online: n.navigator.onLine,
        colors: s.params.colors,
        darkMode: s.params.darkMode,
      }),
      e.store && (s.params.store = e.store),
      s.$el && s.$el[0] && (s.$el[0].f7 = s),
      s.useModules(),
      s.initStore(),
      s.params.init &&
        (t.cordova && s.params.initOnDeviceReady
          ? F(i).on("deviceready", () => {
              s.init();
            })
          : s.init()),
      s
    );
  }
  setColorTheme(e) {
    if (!e) return;
    (this.colors.primary = e), this.setColors();
  }
  setColors() {
    const e = this,
      t = u();
    e.colorsStyleEl ||
      ((e.colorsStyleEl = t.createElement("style")),
      t.head.appendChild(e.colorsStyleEl)),
      (e.colorsStyleEl.textContent = e.utils.colorThemeCSSStyles(e.colors));
  }
  mount(e) {
    const t = this,
      r = f(),
      a = u(),
      s = F(e || t.params.el).eq(0);
    (t.$el = s),
      t.$el &&
        t.$el[0] &&
        ((t.el = t.$el[0]),
        (t.el.f7 = t),
        (t.rtl = "rtl" === s.css("direction")));
    const n = "(prefers-color-scheme: dark)",
      i = "(prefers-color-scheme: light)";
    (t.mq = {}),
      r.matchMedia &&
        ((t.mq.dark = r.matchMedia(n)), (t.mq.light = r.matchMedia(i))),
      (t.colorSchemeListener = function (e) {
        let { matches: r, media: s } = e;
        if (!r) return;
        const o = a.querySelector("html");
        s === n
          ? (o.classList.add("dark"),
            (t.darkMode = !0),
            t.emit("darkModeChange", !0))
          : s === i &&
            (o.classList.remove("dark"),
            (t.darkMode = !1),
            t.emit("darkModeChange", !1));
      }),
      t.emit("mount");
  }
  initStore() {
    const e = this;
    void 0 !== e.params.store && e.params.store.__store
      ? (e.store = e.params.store)
      : (e.store = e.createStore(e.params.store));
  }
  enableAutoDarkMode() {
    const e = f(),
      t = u();
    if (!e.matchMedia) return;
    const r = this,
      a = t.querySelector("html");
    r.mq.dark &&
      r.mq.light &&
      (r.mq.dark.addListener(r.colorSchemeListener),
      r.mq.light.addListener(r.colorSchemeListener)),
      r.mq.dark && r.mq.dark.matches
        ? (a.classList.add("dark"),
          (r.darkMode = !0),
          r.emit("darkModeChange", !0))
        : r.mq.light &&
          r.mq.light.matches &&
          (a.classList.remove("dark"),
          (r.darkMode = !1),
          r.emit("darkModeChange", !1));
  }
  disableAutoDarkMode() {
    if (!f().matchMedia) return;
    const e = this;
    e.mq.dark && e.mq.dark.removeListener(e.colorSchemeListener),
      e.mq.light && e.mq.light.removeListener(e.colorSchemeListener);
  }
  setDarkMode(e) {
    const t = this;
    "auto" === e
      ? t.enableAutoDarkMode()
      : (t.disableAutoDarkMode(),
        F("html")[e ? "addClass" : "removeClass"]("dark"),
        (t.darkMode = e));
  }
  initAppComponent(e) {
    const t = this;
    t.router.componentLoader(
      t.params.component,
      t.params.componentUrl,
      { componentOptions: { el: t.$el[0] } },
      (r) => {
        (t.$el = F(r)),
          (t.$el[0].f7 = t),
          (t.$elComponent = r.f7Component),
          (t.el = t.$el[0]),
          e && e();
      },
      () => {}
    );
  }
  init(e) {
    const t = this;
    t.setColors(), t.mount(e);
    const r = () => {
      if (t.initialized) return;
      t.$el.addClass("framework7-initializing"),
        t.rtl && F("html").attr("dir", "rtl"),
        void 0 === t.params.darkMode
          ? (t.darkMode = F("html").hasClass("dark"))
          : t.setDarkMode(t.params.darkMode);
      const e = f();
      e.addEventListener("offline", () => {
        (t.online = !1), t.emit("offline"), t.emit("connection", !1);
      }),
        e.addEventListener("online", () => {
          (t.online = !0), t.emit("online"), t.emit("connection", !0);
        }),
        t.$el.addClass("framework7-root"),
        F("html").removeClass("ios md").addClass(t.theme);
      const r = t.device;
      t.params.iosTranslucentBars &&
        "ios" === t.theme &&
        r.ios &&
        F("html").addClass("ios-translucent-bars"),
        t.params.iosTranslucentModals &&
          "ios" === t.theme &&
          r.ios &&
          F("html").addClass("ios-translucent-modals"),
        Pe(() => {
          t.$el.removeClass("framework7-initializing");
        }),
        (t.initialized = !0),
        t.emit("init");
    };
    return (
      t.params.component || t.params.componentUrl
        ? t.initAppComponent(() => {
            r();
          })
        : r(),
      t
    );
  }
  loadModule() {
    return at.loadModule(...arguments);
  }
  loadModules() {
    return at.loadModules(...arguments);
  }
  getVnodeHooks(e, t) {
    const r = this;
    return (r.vnodeHooks && r.vnodeHooks[e] && r.vnodeHooks[e][t]) || [];
  }
  get $() {
    return F;
  }
  static get Dom7() {
    return F;
  }
  static get $() {
    return F;
  }
  static get device() {
    return Qe();
  }
  static get support() {
    return Xe();
  }
  static get Class() {
    return Ze;
  }
  static get Events() {
    return Ke;
  }
}
(at.$jsx = rt),
  (at.ModalMethods = et),
  (at.ConstructorMethods = Je),
  (at.loadModule = function (e) {
    const t = this,
      r = f(),
      a = u();
    return new Promise((s, n) => {
      const i = t.instance;
      let o, l, c;
      if (e) {
        if ("string" == typeof e) {
          const t = e.match(/([a-z0-9-]*)/i);
          if (e.indexOf(".") < 0 && t && t[0].length === e.length) {
            if (!i || (i && !i.params.lazyModulesPath))
              return void n(
                new Error(
                  'Framework7: "lazyModulesPath" app parameter must be specified to fetch module by name'
                )
              );
            o = `${i.params.lazyModulesPath}/${e}/${e}.lazy.js`;
          } else o = e;
        } else "function" == typeof e ? (c = e) : (l = e);
        if (c) {
          const e = c(t, !1);
          if (!e)
            return void n(
              new Error(
                "Framework7: Can't find Framework7 component in specified component function"
              )
            );
          if (t.prototype.modules && t.prototype.modules[e.name])
            return void s();
          p(e), s();
        }
        if (l) {
          const e = l;
          if (!e)
            return void n(
              new Error(
                "Framework7: Can't find Framework7 component in specified component"
              )
            );
          if (t.prototype.modules && t.prototype.modules[e.name])
            return void s();
          p(e), s();
        }
        if (o) {
          if (tt.indexOf(o) >= 0) return void s();
          tt.push(o);
          const e = new Promise((e, s) => {
              fetch(o)
                .then((e) => e.text())
                .then((n) => {
                  const i = `f7_component_loader_callback_${xe()}`,
                    l = a.createElement("script");
                  (l.innerHTML = `window.${i} = function (Framework7, Framework7AutoInstallComponent) {return ${n.trim()}}`),
                    F("head").append(l);
                  const c = r[i];
                  delete r[i], F(l).remove();
                  const d = c(t, !1);
                  d
                    ? ((t.prototype.modules && t.prototype.modules[d.name]) ||
                        p(d),
                      e())
                    : s(
                        new Error(
                          `Framework7: Can't find Framework7 component in ${o} file`
                        )
                      );
                })
                .catch((e) => {
                  s(e);
                });
            }),
            l = new Promise((e) => {
              fetch(
                o
                  .replace(".lazy.js", i.rtl ? ".rtl.css" : ".css")
                  .replace(".js", i.rtl ? ".rtl.css" : ".css")
              )
                .then((e) => e.text())
                .then((t) => {
                  const r = a.createElement("style");
                  (r.innerHTML = t), F("head").append(r), e();
                })
                .catch(() => {
                  e();
                });
            });
          Promise.all([e, l])
            .then(() => {
              s();
            })
            .catch((e) => {
              n(e);
            });
        }
      } else n(new Error("Framework7: Lazy module must be specified"));
      function p(e) {
        t.use(e), i && (i.useModuleParams(e, i.params), i.useModule(e));
      }
    });
  }),
  (at.loadModules = function (e) {
    return Promise.all(e.map((e) => at.loadModule(e)));
  });
var st = at,
  nt = {
    name: "device",
    static: { getDevice: Qe },
    on: {
      init() {
        const e = u(),
          t = Qe(),
          r = [],
          a = e.querySelector("html"),
          s = e.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
          );
        a &&
          (t.standalone &&
            t.ios &&
            s &&
            "black-translucent" === s.content &&
            r.push("device-full-viewport"),
          r.push(`device-pixel-ratio-${Math.floor(t.pixelRatio)}`),
          t.os && !t.desktop
            ? r.push(`device-${t.os}`)
            : t.desktop &&
              (r.push("device-desktop"), t.os && r.push(`device-${t.os}`)),
          t.cordova && r.push("device-cordova"),
          t.capacitor && r.push("device-capacitor"),
          r.forEach((e) => {
            a.classList.add(e);
          }));
      },
    },
  },
  it = { name: "support", static: { getSupport: Xe } },
  ot = { name: "utils", proto: { utils: Ge }, static: { utils: Ge } },
  lt = {
    name: "resize",
    create() {
      const e = this;
      e.getSize = () => {
        if (!e.el) return { width: 0, height: 0, left: 0, top: 0 };
        const t = e.$el.offset(),
          [r, a, s, n] = [e.el.offsetWidth, e.el.offsetHeight, t.left, t.top];
        return (
          (e.width = r),
          (e.height = a),
          (e.left = s),
          (e.top = n),
          { width: r, height: a, left: s, top: n }
        );
      };
    },
    on: {
      init() {
        const e = this,
          t = f();
        e.getSize(),
          t.addEventListener(
            "resize",
            () => {
              e.emit("resize");
            },
            !1
          ),
          t.addEventListener("orientationchange", () => {
            e.emit("orientationchange");
          });
      },
      orientationchange() {
        const e = u();
        Qe().ipad &&
          ((e.body.scrollLeft = 0),
          setTimeout(() => {
            e.body.scrollLeft = 0;
          }, 0));
      },
      resize() {
        this.getSize();
      },
    },
  };
var ct = {
  name: "touch",
  params: {
    touch: {
      touchClicksDistanceThreshold: 5,
      disableContextMenu: !1,
      tapHold: !1,
      tapHoldDelay: 750,
      tapHoldPreventClicks: !0,
      activeState: !0,
      activeStateElements:
        "a, button, label, span, .actions-button, .stepper-button, .stepper-button-plus, .stepper-button-minus, .card-expandable, .link, .item-link, .accordion-item-toggle",
      activeStateOnMouseMove: !1,
      mdTouchRipple: !0,
      iosTouchRipple: !1,
      touchRippleElements:
        ".ripple, .link, .item-link, .list label.item-content, .list-button, .links-list a, .button, button, .input-clear-button, .dialog-button, .tab-link, .item-radio, .item-checkbox, .actions-button, .searchbar-disable-button, .fab a, .checkbox, .radio, .data-table .sortable-cell:not(.input-cell), .notification-close-button, .stepper-button, .stepper-button-minus, .stepper-button-plus, .list.accordion-list .accordion-item-toggle",
      touchRippleInsetElements:
        ".ripple-inset, .icon-only, .searchbar-disable-button, .input-clear-button, .notification-close-button, .md .navbar .link.back",
    },
  },
  create() {
    const e = Xe();
    He(this, {
      touchEvents: {
        start: e.touch
          ? "touchstart"
          : e.pointerEvents
          ? "pointerdown"
          : "mousedown",
        move: e.touch
          ? "touchmove"
          : e.pointerEvents
          ? "pointermove"
          : "mousemove",
        end: e.touch ? "touchend" : e.pointerEvents ? "pointerup" : "mouseup",
      },
    });
  },
  on: {
    init: function () {
      const e = this,
        t = Qe(),
        r = Xe(),
        a = f(),
        s = u(),
        n = e.params.touch,
        i = n[`${e.theme}TouchRipple`];
      let o, l, c, p, d, h, m, g, v, b, w, y, E;
      function C(e) {
        const t = F(e),
          r = t.parents(n.activeStateElements);
        if (t.closest(".no-active-state").length) return null;
        let a;
        if (
          (t.is(n.activeStateElements) && (a = t),
          r.length > 0 && (a = a ? a.add(r) : r),
          a && a.length > 1)
        ) {
          const e = [];
          let t;
          for (let r = 0; r < a.length; r += 1)
            t ||
              (e.push(a[r]),
              (a.eq(r).hasClass("prevent-active-state-propagation") ||
                a.eq(r).hasClass("no-active-state-propagation")) &&
                (t = !0));
          a = F(e);
        }
        return a || t;
      }
      function x(e) {
        return e.parents(".page-content").length > 0;
      }
      function S() {
        g && g.addClass("active-state");
      }
      function k() {
        g && (g.removeClass("active-state"), (g = null));
      }
      function T(t, r, a) {
        t && (b = e.touchRipple.create(e, t, r, a));
      }
      function M() {
        b && (b.remove(), (b = void 0), (w = void 0));
      }
      function A(e) {
        if (
          ((w = (function (e) {
            const t = n.touchRippleElements,
              r = F(e);
            if (r.is(t)) return !r.hasClass("no-ripple") && r;
            if (r.parents(t).length > 0) {
              const e = r.parents(t).eq(0);
              return !e.hasClass("no-ripple") && e;
            }
            return !1;
          })(e)),
          !w || 0 === w.length)
        )
          return void (w = void 0);
        x(w)
          ? (clearTimeout(y),
            (y = setTimeout(() => {
              M(), T(w, o, l);
            }, 80)))
          : (M(), T(w, o, l));
      }
      function $() {
        clearTimeout(y), M();
      }
      function P() {
        b || !w || p ? M() : (clearTimeout(y), T(w, o, l), setTimeout(M, 0));
      }
      function O() {
        F(".active-state").removeClass("active-state"), i && P();
      }
      t.ios && t.webView && a.addEventListener("touchstart", () => {});
      let L = !1,
        R = null;
      const I = ".dialog-button, .actions-button";
      let z = !1,
        B = null;
      function H(t, r) {
        e.emit({ events: t, data: [r] });
      }
      function D(e) {
        H("touchstart touchstart:active", e);
      }
      function N(e) {
        H("touchmove touchmove:active", e);
      }
      function _(e) {
        H("touchend touchend:active", e);
      }
      function j(e) {
        H("touchstart:passive", e);
      }
      function q(e) {
        H("touchmove:passive", e);
      }
      function V(e) {
        H("touchend:passive", e);
      }
      const Y = !!r.passiveListener && { passive: !0 },
        G = !r.passiveListener || { passive: !0, capture: !0 },
        W = !!r.passiveListener && { passive: !1 },
        U = !r.passiveListener || { passive: !1, capture: !0 };
      s.addEventListener(
        "click",
        function (e) {
          H("click", e);
        },
        !0
      ),
        r.passiveListener
          ? (s.addEventListener(e.touchEvents.start, D, U),
            s.addEventListener(e.touchEvents.move, N, W),
            s.addEventListener(e.touchEvents.end, _, W),
            s.addEventListener(e.touchEvents.start, j, G),
            s.addEventListener(e.touchEvents.move, q, Y),
            s.addEventListener(e.touchEvents.end, V, Y))
          : (s.addEventListener(
              e.touchEvents.start,
              (e) => {
                D(e), j(e);
              },
              !0
            ),
            s.addEventListener(
              e.touchEvents.move,
              (e) => {
                N(e), q(e);
              },
              !1
            ),
            s.addEventListener(
              e.touchEvents.end,
              (e) => {
                _(e), V(e);
              },
              !1
            )),
        r.touch
          ? (e.on("click", function (e) {
              const r = e && e.detail && "f7Overswipe" === e.detail,
                a = e && e.detail && "f7Segmented" === e.detail,
                s = e && e.detail && "f7TouchMoveActivable" === e.detail;
              let i = m;
              return (
                c && e.target !== c ? (i = !(r || a || s)) : s && (i = !1),
                n.tapHold && n.tapHoldPreventClicks && d && (i = !0),
                i &&
                  (e.stopImmediatePropagation(),
                  e.stopPropagation(),
                  e.preventDefault()),
                n.tapHold &&
                  (h = setTimeout(
                    () => {
                      d = !1;
                    },
                    t.ios || t.androidChrome ? 100 : 400
                  )),
                (m = !1),
                (c = null),
                !i
              );
            }),
            e.on("touchstart", function (t) {
              return (
                (p = !1),
                (d = !1),
                (m = !1),
                (E = void 0),
                t.targetTouches.length > 1
                  ? (g && k(), !0)
                  : (t.touches.length > 1 && g && k(),
                    n.tapHold &&
                      (h && clearTimeout(h),
                      (h = setTimeout(() => {
                        (t && t.touches && t.touches.length > 1) ||
                          ((d = !0),
                          t.preventDefault(),
                          (m = !0),
                          F(t.target).trigger("taphold", t),
                          e.emit("taphold", t));
                      }, n.tapHoldDelay))),
                    (c = t.target),
                    (o = t.targetTouches[0].pageX),
                    (l = t.targetTouches[0].pageY),
                    (L = t.target.closest(
                      ".segmented-strong .button-active, .segmented-strong .tab-link-active"
                    )),
                    (z = "ios" === e.theme && t.target.closest(I)),
                    L && (R = L.closest(".segmented-strong")),
                    n.activeState &&
                      ((g = C(c)),
                      g && !x(g) ? S() : g && (v = setTimeout(S, 80))),
                    i && A(c),
                    !0)
              );
            }),
            e.on("touchmove", function (e) {
              let t,
                r,
                a = !0;
              "touchmove" === e.type &&
                ((t = e.targetTouches[0]),
                (r = n.touchClicksDistanceThreshold));
              const d = e.targetTouches[0].pageX,
                u = e.targetTouches[0].pageY;
              if (
                (void 0 === E &&
                  (E = !!(E || Math.abs(u - l) > Math.abs(d - o))),
                (z || (!E && L && R)) && e.cancelable && e.preventDefault(),
                !E && L && R)
              ) {
                const t = s
                  .elementFromPoint(
                    e.targetTouches[0].clientX,
                    e.targetTouches[0].clientY
                  )
                  .closest(
                    ".segmented-strong .button:not(.button-active):not(.tab-link-active)"
                  );
                t &&
                  R.contains(t) &&
                  (F(t).trigger("click", "f7Segmented"), (c = t));
              }
              if (r && t) {
                const e = t.pageX,
                  a = t.pageY;
                (Math.abs(e - o) > r || Math.abs(a - l) > r) && (p = !0);
              } else p = !0;
              if (p) {
                if (((m = !0), z)) {
                  const t = s.elementFromPoint(
                    e.targetTouches[0].clientX,
                    e.targetTouches[0].clientY
                  );
                  (B = t.closest(I)),
                    B && g && g[0] === B
                      ? (a = !1)
                      : B &&
                        setTimeout(() => {
                          (g = C(B)), S();
                        });
                }
                n.tapHold && clearTimeout(h),
                  n.activeState && a && (clearTimeout(v), k()),
                  i && $();
              }
            }),
            e.on("touchend", function (e) {
              return (
                (E = void 0),
                (L = !1),
                (R = null),
                (z = !1),
                clearTimeout(v),
                clearTimeout(h),
                B &&
                  (F(B).trigger("click", "f7TouchMoveActivable"), (B = null)),
                s.activeElement === e.target
                  ? (n.activeState && k(), i && P(), !0)
                  : (n.activeState && (S(), setTimeout(k, 0)),
                    i && P(),
                    !((n.tapHoldPreventClicks && d) || m) ||
                      (e.cancelable && e.preventDefault(), (m = !0), !1))
              );
            }),
            s.addEventListener(
              "touchcancel",
              function () {
                (c = null),
                  clearTimeout(v),
                  clearTimeout(h),
                  n.activeState && k(),
                  i && P();
              },
              { passive: !0 }
            ))
          : n.activeState &&
            (e.on("touchstart", function (e) {
              const t = C(e.target);
              t &&
                (t.addClass("active-state"),
                "which" in e &&
                  3 === e.which &&
                  setTimeout(() => {
                    F(".active-state").removeClass("active-state");
                  }, 0)),
                i &&
                  ((o = e.pageX), (l = e.pageY), A(e.target, e.pageX, e.pageY));
            }),
            e.on("touchmove", function () {
              n.activeStateOnMouseMove ||
                F(".active-state").removeClass("active-state"),
                i && $();
            }),
            e.on("touchend", O),
            s.addEventListener("pointercancel", O, { passive: !0 })),
        s.addEventListener("contextmenu", (e) => {
          n.disableContextMenu &&
            (t.ios ||
              t.android ||
              t.cordova ||
              (a.Capacitor && a.Capacitor.isNative)) &&
            e.preventDefault(),
            i && (g && k(), P());
        });
    },
  },
};
function pt(e, t) {
  void 0 === t && (t = {});
  for (
    var r = (function (e) {
        for (var t = [], r = 0; r < e.length; ) {
          var a = e[r];
          if ("*" !== a && "+" !== a && "?" !== a)
            if ("\\" !== a)
              if ("{" !== a)
                if ("}" !== a)
                  if (":" !== a)
                    if ("(" !== a)
                      t.push({ type: "CHAR", index: r, value: e[r++] });
                    else {
                      var s = 1,
                        n = "";
                      if ("?" === e[(o = r + 1)])
                        throw new TypeError(
                          'Pattern cannot start with "?" at ' + o
                        );
                      for (; o < e.length; )
                        if ("\\" !== e[o]) {
                          if (")" === e[o]) {
                            if (0 == --s) {
                              o++;
                              break;
                            }
                          } else if ("(" === e[o] && (s++, "?" !== e[o + 1]))
                            throw new TypeError(
                              "Capturing groups are not allowed at " + o
                            );
                          n += e[o++];
                        } else n += e[o++] + e[o++];
                      if (s) throw new TypeError("Unbalanced pattern at " + r);
                      if (!n) throw new TypeError("Missing pattern at " + r);
                      t.push({ type: "PATTERN", index: r, value: n }), (r = o);
                    }
                  else {
                    for (var i = "", o = r + 1; o < e.length; ) {
                      var l = e.charCodeAt(o);
                      if (
                        !(
                          (l >= 48 && l <= 57) ||
                          (l >= 65 && l <= 90) ||
                          (l >= 97 && l <= 122) ||
                          95 === l
                        )
                      )
                        break;
                      i += e[o++];
                    }
                    if (!i)
                      throw new TypeError("Missing parameter name at " + r);
                    t.push({ type: "NAME", index: r, value: i }), (r = o);
                  }
                else t.push({ type: "CLOSE", index: r, value: e[r++] });
              else t.push({ type: "OPEN", index: r, value: e[r++] });
            else t.push({ type: "ESCAPED_CHAR", index: r++, value: e[r++] });
          else t.push({ type: "MODIFIER", index: r, value: e[r++] });
        }
        return t.push({ type: "END", index: r, value: "" }), t;
      })(e),
      a = t.prefixes,
      s = void 0 === a ? "./" : a,
      n = "[^" + ut(t.delimiter || "/#?") + "]+?",
      i = [],
      o = 0,
      l = 0,
      c = "",
      p = function (e) {
        if (l < r.length && r[l].type === e) return r[l++].value;
      },
      d = function (e) {
        var t = p(e);
        if (void 0 !== t) return t;
        var a = r[l],
          s = a.type,
          n = a.index;
        throw new TypeError("Unexpected " + s + " at " + n + ", expected " + e);
      },
      u = function () {
        for (var e, t = ""; (e = p("CHAR") || p("ESCAPED_CHAR")); ) t += e;
        return t;
      };
    l < r.length;

  ) {
    var h = p("CHAR"),
      f = p("NAME"),
      m = p("PATTERN");
    if (f || m) {
      var g = h || "";
      -1 === s.indexOf(g) && ((c += g), (g = "")),
        c && (i.push(c), (c = "")),
        i.push({
          name: f || o++,
          prefix: g,
          suffix: "",
          pattern: m || n,
          modifier: p("MODIFIER") || "",
        });
    } else {
      var v = h || p("ESCAPED_CHAR");
      if (v) c += v;
      else if ((c && (i.push(c), (c = "")), p("OPEN"))) {
        g = u();
        var b = p("NAME") || "",
          w = p("PATTERN") || "",
          y = u();
        d("CLOSE"),
          i.push({
            name: b || (w ? o++ : ""),
            pattern: b && !w ? n : w,
            prefix: g,
            suffix: y,
            modifier: p("MODIFIER") || "",
          });
      } else d("END");
    }
  }
  return i;
}
function dt(e, t) {
  return (function (e, t) {
    void 0 === t && (t = {});
    var r = ht(t),
      a = t.encode,
      s =
        void 0 === a
          ? function (e) {
              return e;
            }
          : a,
      n = t.validate,
      i = void 0 === n || n,
      o = e.map(function (e) {
        if ("object" == typeof e)
          return new RegExp("^(?:" + e.pattern + ")$", r);
      });
    return function (t) {
      for (var r = "", a = 0; a < e.length; a++) {
        var n = e[a];
        if ("string" != typeof n) {
          var l = t ? t[n.name] : void 0,
            c = "?" === n.modifier || "*" === n.modifier,
            p = "*" === n.modifier || "+" === n.modifier;
          if (Array.isArray(l)) {
            if (!p)
              throw new TypeError(
                'Expected "' + n.name + '" to not repeat, but got an array'
              );
            if (0 === l.length) {
              if (c) continue;
              throw new TypeError('Expected "' + n.name + '" to not be empty');
            }
            for (var d = 0; d < l.length; d++) {
              var u = s(l[d], n);
              if (i && !o[a].test(u))
                throw new TypeError(
                  'Expected all "' +
                    n.name +
                    '" to match "' +
                    n.pattern +
                    '", but got "' +
                    u +
                    '"'
                );
              r += n.prefix + u + n.suffix;
            }
          } else if ("string" != typeof l && "number" != typeof l) {
            if (!c) {
              var h = p ? "an array" : "a string";
              throw new TypeError('Expected "' + n.name + '" to be ' + h);
            }
          } else {
            u = s(String(l), n);
            if (i && !o[a].test(u))
              throw new TypeError(
                'Expected "' +
                  n.name +
                  '" to match "' +
                  n.pattern +
                  '", but got "' +
                  u +
                  '"'
              );
            r += n.prefix + u + n.suffix;
          }
        } else r += n;
      }
      return r;
    };
  })(pt(e, t), t);
}
function ut(e) {
  return e.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function ht(e) {
  return e && e.sensitive ? "" : "i";
}
function ft(e, t, r) {
  return (function (e, t, r) {
    void 0 === r && (r = {});
    for (
      var a = r.strict,
        s = void 0 !== a && a,
        n = r.start,
        i = void 0 === n || n,
        o = r.end,
        l = void 0 === o || o,
        c = r.encode,
        p =
          void 0 === c
            ? function (e) {
                return e;
              }
            : c,
        d = "[" + ut(r.endsWith || "") + "]|$",
        u = "[" + ut(r.delimiter || "/#?") + "]",
        h = i ? "^" : "",
        f = 0,
        m = e;
      f < m.length;
      f++
    ) {
      var g = m[f];
      if ("string" == typeof g) h += ut(p(g));
      else {
        var v = ut(p(g.prefix)),
          b = ut(p(g.suffix));
        if (g.pattern)
          if ((t && t.push(g), v || b))
            if ("+" === g.modifier || "*" === g.modifier) {
              var w = "*" === g.modifier ? "?" : "";
              h +=
                "(?:" +
                v +
                "((?:" +
                g.pattern +
                ")(?:" +
                b +
                v +
                "(?:" +
                g.pattern +
                "))*)" +
                b +
                ")" +
                w;
            } else
              h += "(?:" + v + "(" + g.pattern + ")" + b + ")" + g.modifier;
          else h += "(" + g.pattern + ")" + g.modifier;
        else h += "(?:" + v + b + ")" + g.modifier;
      }
    }
    if (l) s || (h += u + "?"), (h += r.endsWith ? "(?=" + d + ")" : "$");
    else {
      var y = e[e.length - 1],
        E =
          "string" == typeof y ? u.indexOf(y[y.length - 1]) > -1 : void 0 === y;
      s || (h += "(?:" + u + "(?=" + d + "))?"),
        E || (h += "(?=" + u + "|" + d + ")");
    }
    return new RegExp(h, ht(r));
  })(pt(e, r), t, r);
}
function mt(e, t, r) {
  return e instanceof RegExp
    ? (function (e, t) {
        if (!t) return e;
        for (
          var r = /\((?:\?<(.*?)>)?(?!\?)/g, a = 0, s = r.exec(e.source);
          s;

        )
          t.push({
            name: s[1] || a++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: "",
          }),
            (s = r.exec(e.source));
        return e;
      })(e, t)
    : Array.isArray(e)
    ? (function (e, t, r) {
        var a = e.map(function (e) {
          return mt(e, t, r).source;
        });
        return new RegExp("(?:" + a.join("|") + ")", ht(r));
      })(e, t, r)
    : ft(e, t, r);
}
const gt = {
  queue: [],
  clearQueue() {
    if (0 === gt.queue.length) return;
    gt.queue.shift()();
  },
  routerQueue: [],
  clearRouterQueue() {
    if (0 === gt.routerQueue.length) return;
    const e = gt.routerQueue.pop(),
      { router: t, stateUrl: r, action: a } = e;
    let s = t.params.animate;
    !1 === t.params.browserHistoryAnimate && (s = !1),
      "back" === a && t.back({ animate: s, browserHistory: !1 }),
      "load" === a && t.navigate(r, { animate: s, browserHistory: !1 });
  },
  handle(e) {
    if (gt.blockPopstate) return;
    let t = e.state;
    (gt.previousState = gt.state),
      (gt.state = t),
      (gt.allowChange = !0),
      gt.clearQueue(),
      (t = gt.state),
      t || (t = {}),
      this.views.forEach((e) => {
        const r = e.router;
        let a = t[e.id];
        if (
          (!a && e.params.browserHistory && (a = { url: e.router.history[0] }),
          !a)
        )
          return;
        const s = a.url || void 0;
        let n = r.params.animate;
        !1 === r.params.browserHistoryAnimate && (n = !1),
          s !== r.url &&
            (r.history.indexOf(s) >= 0
              ? r.allowPageChange
                ? r.back({ animate: n, browserHistory: !1 })
                : gt.routerQueue.push({ action: "back", router: r })
              : r.allowPageChange
              ? r.navigate(s, { animate: n, browserHistory: !1 })
              : gt.routerQueue.unshift({
                  action: "load",
                  stateUrl: s,
                  router: r,
                }));
      });
  },
  initViewState(e, t) {
    const r = f(),
      a = He({}, gt.state || {}, { [e]: t });
    (gt.state = a), r.history.replaceState(a, "");
  },
  push(e, t, r) {
    const a = f(),
      s = u();
    if (
      ("#!/" === r.substr(-3) &&
        "" === (r = r.replace("#!/", "")) &&
        (r = s.location.href).includes("#!/") &&
        (r = s.location.href.split("#!/")[0]),
      !gt.allowChange)
    )
      return void gt.queue.push(() => {
        gt.push(e, t, r);
      });
    gt.previousState = gt.state;
    const n = He({}, gt.previousState || {}, { [e]: t });
    (gt.state = n), a.history.pushState(n, "", r);
  },
  replace(e, t, r) {
    const a = f();
    if (("#!/" === r.substr(-3) && (r = r.replace("#!/", "")), !gt.allowChange))
      return void gt.queue.push(() => {
        gt.replace(e, t, r);
      });
    gt.previousState = gt.state;
    const s = He({}, gt.previousState || {}, { [e]: t });
    (gt.state = s), a.history.replaceState(s, "", r);
  },
  go(e) {
    const t = f();
    (gt.allowChange = !1), t.history.go(e);
  },
  back() {
    const e = f();
    (gt.allowChange = !1), e.history.back();
  },
  allowChange: !0,
  previousState: {},
  state: {},
  blockPopstate: !0,
  init(e) {
    const t = f(),
      r = u();
    (gt.state = t.history.state),
      F(t).on("load", () => {
        setTimeout(() => {
          gt.blockPopstate = !1;
        }, 0);
      }),
      r.readyState && "complete" === r.readyState && (gt.blockPopstate = !1),
      F(t).on("popstate", gt.handle.bind(e));
  },
};
var vt = gt;
function bt(e) {
  const t = e,
    { $el: r, $navbarsEl: a, app: s, params: n } = t,
    i = Xe(),
    o = Qe();
  let l = !1,
    c = !1;
  const p = {};
  let d,
    u,
    h,
    f,
    m,
    g,
    v,
    b,
    w = [],
    y = [],
    E = !0,
    C = [],
    x = [];
  const S = n[`${s.theme}SwipeBackAnimateShadow`],
    k = n[`${s.theme}SwipeBackAnimateOpacity`],
    T = n[`${s.theme}SwipeBackActiveArea`],
    M = n[`${s.theme}SwipeBackThreshold`],
    A = s.rtl ? "right center" : "left center",
    $ = s.rtl
      ? "calc(100% - var(--f7-navbar-large-title-padding-left) - var(--f7-safe-area-left)) center"
      : "calc(var(--f7-navbar-large-title-padding-left) + var(--f7-safe-area-left)) center";
  function P(e) {
    let {
      progress: t,
      reset: r,
      transition: a,
      reflow: s,
    } = void 0 === e ? {} : e;
    const n = ["overflow", "transform", "transform-origin", "opacity"];
    if (!0 === a || !1 === a)
      for (let i = 0; i < b.length; i += 1) {
        const e = b[i];
        e &&
          e.el &&
          (!0 === a && e.el.classList.add("navbar-page-transitioning"),
          !1 === a && e.el.classList.remove("navbar-page-transitioning"));
      }
    s &&
      b.length &&
      b[0] &&
      b[0].el &&
      (b[0].el._clientLeft = b[0].el.clientLeft);
    for (let i = 0; i < b.length; i += 1) {
      const e = b[i];
      if (e && e.el) {
        !e.className ||
          e.classNameSet ||
          r ||
          (e.el.classList.add(e.className), (e.classNameSet = !0)),
          e.className && r && e.el.classList.remove(e.className);
        for (let a = 0; a < n.length; a += 1) {
          const s = n[a];
          e[s] &&
            (r
              ? (e.el.style[s] = "")
              : "function" == typeof e[s]
              ? (e.el.style[s] = e[s](t))
              : (e.el.style[s] = e[s]));
        }
      }
    }
  }
  function O(e) {
    const r = n[`${s.theme}SwipeBack`];
    !E ||
      !r ||
      l ||
      (s.swipeout && s.swipeout.el) ||
      !t.allowPageChange ||
      F(e.target).closest(".range-slider, .calendar-months").length > 0 ||
      (F(e.target).closest(".page-master, .page-master-detail").length > 0 &&
        n.masterDetailBreakpoint > 0 &&
        s.width >= n.masterDetailBreakpoint) ||
      ((c = !1),
      (l = !0),
      (d = void 0),
      (p.x = "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX),
      (p.y = "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY),
      (f = Oe()),
      (m = t.dynamicNavbar));
  }
  function L(e) {
    if (!l) return;
    const i = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX,
      f = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY;
    if (
      (void 0 === d &&
        (d =
          !!(d || Math.abs(f - p.y) > Math.abs(i - p.x)) ||
          (i < p.x && !s.rtl) ||
          (i > p.x && s.rtl)),
      d || e.f7PreventSwipeBack || s.preventSwipeBack)
    )
      return void (l = !1);
    if (!c) {
      let t = !1;
      const i = F(e.target),
        c = i.closest(".swipeout");
      c.length > 0 &&
        (!s.rtl && c.find(".swipeout-actions-left").length > 0 && (t = !0),
        s.rtl && c.find(".swipeout-actions-right").length > 0 && (t = !0)),
        (w = i.closest(".page")),
        (w.hasClass("no-swipeback") ||
          i.closest(".no-swipeback, .card-opened").length > 0) &&
          (t = !0),
        (y = r.find(".page-previous")),
        y.length > 1 && (y = y.eq(y.length - 1));
      let d = p.x - r.offset().left > T;
      if (
        ((u = r.width()),
        (d = s.rtl
          ? p.x < r.offset().left - r[0].scrollLeft + (u - T)
          : p.x - r.offset().left > T),
        d && (t = !0),
        (0 !== y.length && 0 !== w.length) || (t = !0),
        t)
      )
        return void (l = !1);
      S &&
        ((g = w.find(".page-shadow-effect")),
        0 === g.length &&
          ((g = F('<div class="page-shadow-effect"></div>')), w.append(g))),
        k &&
          ((v = y.find(".page-opacity-effect")),
          0 === v.length &&
            ((v = F('<div class="page-opacity-effect"></div>')), y.append(v))),
        m &&
          ((C = a.find(".navbar-current")),
          (x = a.find(".navbar-previous")),
          x.length > 1 && (x = x.eq(x.length - 1)),
          (b = (function () {
            const e = [],
              t = s.rtl ? -1 : 1,
              r =
                C.hasClass("navbar-transparent") &&
                !C.hasClass("navbar-large") &&
                !C.hasClass("navbar-transparent-visible"),
              a = C.hasClass("navbar-large"),
              i = C.hasClass("navbar-large-collapsed"),
              l =
                C.hasClass("navbar-large-transparent") ||
                (C.hasClass("navbar-large") &&
                  C.hasClass("navbar-transparent")),
              c =
                x.hasClass("navbar-transparent") &&
                !x.hasClass("navbar-large") &&
                !x.hasClass("navbar-transparent-visible"),
              p = x.hasClass("navbar-large"),
              d = x.hasClass("navbar-large-collapsed"),
              u =
                x.hasClass("navbar-large-transparent") ||
                (x.hasClass("navbar-large") &&
                  x.hasClass("navbar-transparent")),
              h = a && !i,
              f = p && !d,
              m = C.find(
                ".left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg"
              ),
              g = x.find(
                ".left, .title, .right, .subnavbar, .fading, .title-large, .navbar-bg"
              );
            let v, b;
            return (
              n.iosAnimateNavbarBackIcon &&
                ((v =
                  C.hasClass("sliding") ||
                  C.find(".navbar-inner.sliding").length
                    ? C.find(".left").find(".back .icon + span").eq(0)
                    : C.find(".left.sliding").find(".back .icon + span").eq(0)),
                (b =
                  x.hasClass("sliding") ||
                  x.find(".navbar-inner.sliding").length
                    ? x.find(".left").find(".back .icon + span").eq(0)
                    : x.find(".left.sliding").find(".back .icon + span").eq(0)),
                v.length &&
                  g.each((e) => {
                    F(e).hasClass("title") &&
                      (e.f7NavbarLeftOffset += v.prev(".icon")[0].offsetWidth);
                  })),
              m.each((s) => {
                const c = F(s),
                  p = c.hasClass("subnavbar"),
                  d = c.hasClass("left"),
                  u = c.hasClass("title"),
                  m = c.hasClass("navbar-bg");
                if ((u || m) && r) return;
                if (!h && c.hasClass(".title-large")) return;
                const g = { el: s };
                if (h) {
                  if (u) return;
                  if (c.hasClass("title-large"))
                    return (
                      e.indexOf(g) < 0 && e.push(g),
                      (g.overflow = "visible"),
                      void c.find(".title-large-text").each((r) => {
                        e.push({
                          el: r,
                          transform: (e) => `translateX(${100 * e * t}%)`,
                        });
                      })
                    );
                }
                if (
                  f &&
                  (h ||
                    (c.hasClass("title-large") &&
                      (e.indexOf(g) < 0 && e.push(g), (g.opacity = 0))),
                  d)
                )
                  return (
                    e.indexOf(g) < 0 && e.push(g),
                    (g.opacity = (e) => 1 - e ** 0.33),
                    void c.find(".back span").each((t) => {
                      e.push({
                        el: t,
                        "transform-origin": A,
                        transform: (e) =>
                          `translateX(calc(${e} * (var(--f7-navbarTitleLargeOffset) - var(--f7-navbarLeftTextOffset)))) translateY(calc(${e} * (var(--f7-navbar-large-title-height) - var(--f7-navbar-large-title-padding-vertical) / 2))) scale(${
                            1 + 1 * e
                          })`,
                      });
                    })
                  );
                if (m)
                  return (
                    e.indexOf(g) < 0 && e.push(g),
                    h ||
                      f ||
                      (i
                        ? (l && (g.className = "ios-swipeback-navbar-bg-large"),
                          (g.transform = (e) =>
                            `translateX(${
                              100 * e * t
                            }%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))`))
                        : (g.transform = (e) => `translateX(${100 * e * t}%)`)),
                    !h &&
                      f &&
                      ((g.className = "ios-swipeback-navbar-bg-large"),
                      (g.transform = (e) =>
                        `translateX(${100 * e * t}%) translateY(calc(-1 * ${
                          1 - e
                        } * var(--f7-navbar-large-title-height)))`)),
                    h &&
                      f &&
                      (g.transform = (e) => `translateX(${100 * e * t}%)`),
                    void (
                      h &&
                      !f &&
                      (g.transform = (e) =>
                        `translateX(${
                          100 * e * t
                        }%) translateY(calc(-${e} * var(--f7-navbar-large-title-height)))`)
                    )
                  );
                if (c.hasClass("title-large")) return;
                const b =
                  c.hasClass("sliding") ||
                  c.parents(".navbar-inner.sliding").length;
                if (
                  (e.indexOf(g) < 0 && e.push(g),
                  (!p || (p && !b)) && (g.opacity = (e) => 1 - e ** 0.33),
                  b)
                ) {
                  let t = g;
                  if (d && v.length && n.iosAnimateNavbarBackIcon) {
                    const r = { el: v[0] };
                    (t = r), e.push(r);
                  }
                  t.transform = (e) => {
                    let r = e * t.el.f7NavbarRightOffset;
                    return (
                      1 === o.pixelRatio && (r = Math.round(r)),
                      p && a
                        ? `translate3d(${r}px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)`
                        : `translate3d(${r}px,0,0)`
                    );
                  };
                }
              }),
              g.each((r) => {
                const a = F(r),
                  s = a.hasClass("subnavbar"),
                  i = a.hasClass("left"),
                  l = a.hasClass("title"),
                  m = a.hasClass("navbar-bg");
                if ((l || m) && c) return;
                const g = { el: r };
                if (f) {
                  if (l) return;
                  if (
                    (e.indexOf(g) < 0 && e.push(g), a.hasClass("title-large"))
                  )
                    return (
                      (g.opacity = 1),
                      (g.overflow = "visible"),
                      void a.find(".title-large-text").each((t) => {
                        e.push({
                          el: t,
                          "transform-origin": $,
                          opacity: (e) => e ** 3,
                          transform: (e) =>
                            `translateX(calc(${
                              1 - e
                            } * (var(--f7-navbarLeftTextOffset) - var(--f7-navbarTitleLargeOffset)))) translateY(calc(${
                              e - 1
                            } * var(--f7-navbar-large-title-height) + ${
                              1 - e
                            } * var(--f7-navbar-large-title-padding-vertical))) scale(${
                              0.5 + 0.5 * e
                            })`,
                        });
                      })
                    );
                }
                if (m)
                  return (
                    e.indexOf(g) < 0 && e.push(g),
                    h ||
                      f ||
                      (d
                        ? (u && (g.className = "ios-swipeback-navbar-bg-large"),
                          (g.transform = (e) =>
                            `translateX(${
                              (100 * e - 100) * t
                            }%) translateY(calc(-1 * var(--f7-navbar-large-title-height)))`))
                        : (g.transform = (e) =>
                            `translateX(${(100 * e - 100) * t}%)`)),
                    !h &&
                      f &&
                      (g.transform = (e) =>
                        `translateX(${
                          (100 * e - 100) * t
                        }%) translateY(calc(-1 * ${
                          1 - e
                        } * var(--f7-navbar-large-title-height)))`),
                    h &&
                      !f &&
                      ((g.className = "ios-swipeback-navbar-bg-large"),
                      (g.transform = (e) =>
                        `translateX(${
                          (100 * e - 100) * t
                        }%) translateY(calc(-${e} * var(--f7-navbar-large-title-height)))`)),
                    void (
                      h &&
                      f &&
                      (g.transform = (e) =>
                        `translateX(${(100 * e - 100) * t}%)`)
                    )
                  );
                if (a.hasClass("title-large")) return;
                const v =
                  a.hasClass("sliding") ||
                  x.children(".navbar-inner.sliding").length;
                if (
                  (e.indexOf(g) < 0 && e.push(g),
                  (!s || (s && !v)) && (g.opacity = (e) => e ** 3),
                  v)
                ) {
                  let t = g;
                  if (i && b.length && n.iosAnimateNavbarBackIcon) {
                    const r = { el: b[0] };
                    (t = r), e.push(r);
                  }
                  t.transform = (e) => {
                    let r = t.el.f7NavbarLeftOffset * (1 - e);
                    return (
                      1 === o.pixelRatio && (r = Math.round(r)),
                      s && p
                        ? `translate3d(${r}px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)`
                        : `translate3d(${r}px,0,0)`
                    );
                  };
                }
              }),
              e
            );
          })())),
        F(".sheet.modal-in").length > 0 &&
          s.sheet &&
          s.sheet.close(F(".sheet.modal-in"));
    }
    (e.f7PreventSwipePanel = !0),
      (c = !0),
      (s.preventSwipePanelBySwipeBack = !0),
      e.preventDefault();
    const E = s.rtl ? -1 : 1;
    (h = (i - p.x - M) * E), h < 0 && (h = 0);
    const O = Math.min(Math.max(h / u, 0), 1),
      L = {
        percentage: O,
        progress: O,
        currentPageEl: w[0],
        previousPageEl: y[0],
        currentNavbarEl: C[0],
        previousNavbarEl: x[0],
      };
    r.trigger("swipeback:move", L), t.emit("swipebackMove", L);
    let R = h * E,
      I = (h / 5 - u / 5) * E;
    s.rtl
      ? ((R = Math.max(R, -u)), (I = Math.max(I, 0)))
      : ((R = Math.min(R, u)), (I = Math.min(I, 0))),
      1 === o.pixelRatio && ((R = Math.round(R)), (I = Math.round(I))),
      (t.swipeBackActive = !0),
      F([w[0], y[0]]).addClass("page-swipeback-active"),
      w.transform(`translate3d(${R}px,0,0)`),
      S && (g[0].style.opacity = 1 - 1 * O),
      "ios" === s.theme && y.transform(`translate3d(${I}px,0,0)`),
      k && (v[0].style.opacity = 1 - 1 * O),
      m && P({ progress: O });
  }
  function R() {
    if (((s.preventSwipePanelBySwipeBack = !1), !l || !c))
      return (l = !1), void (c = !1);
    (l = !1), (c = !1), (t.swipeBackActive = !1);
    const e = F([w[0], y[0]]);
    if ((e.removeClass("page-swipeback-active"), 0 === h))
      return (
        e.transform(""),
        g && g.length > 0 && g.remove(),
        v && v.length > 0 && v.remove(),
        void (m && P({ reset: !0 }))
      );
    const a = Oe() - f;
    let i = !1;
    ((a < 300 && h > 10) || (a >= 300 && h > u / 2)) &&
      (w
        .removeClass("page-current")
        .addClass(
          "page-next" + ("ios" !== s.theme ? " page-next-on-right" : "")
        ),
      y
        .removeClass("page-previous")
        .addClass("page-current")
        .removeAttr("aria-hidden"),
      g && (g[0].style.opacity = ""),
      v && (v[0].style.opacity = ""),
      m &&
        (t.setNavbarPosition(C, "next"), t.setNavbarPosition(x, "current", !1)),
      (i = !0)),
      e.addClass("page-transitioning page-transitioning-swipeback"),
      o.ios && (w[0]._clientLeft = w[0].clientLeft),
      e.transform(""),
      m && P({ progress: i ? 1 : 0, transition: !0, reflow: !!o.ios }),
      (E = !1),
      (t.allowPageChange = !1);
    const p = {
      currentPageEl: w[0],
      previousPageEl: y[0],
      currentNavbarEl: C[0],
      previousNavbarEl: x[0],
    };
    i
      ? ((t.currentRoute = y[0].f7Page.route),
        (t.currentPage = y[0]),
        t.pageCallback("beforeOut", w, C, "current", "next", {
          route: w[0].f7Page.route,
          swipeBack: !0,
        }),
        t.pageCallback(
          "beforeIn",
          y,
          x,
          "previous",
          "current",
          { route: y[0].f7Page.route, swipeBack: !0 },
          w[0]
        ),
        r.trigger("swipeback:beforechange", p),
        t.emit("swipebackBeforeChange", p))
      : (r.trigger("swipeback:beforereset", p),
        t.emit("swipebackBeforeReset", p)),
      w.transitionEnd(() => {
        e.removeClass("page-transitioning page-transitioning-swipeback"),
          m && P({ reset: !0, transition: !1 }),
          (E = !0),
          (t.allowPageChange = !0),
          i
            ? (1 === t.history.length && t.history.unshift(t.url),
              t.history.pop(),
              t.saveHistory(),
              n.browserHistory && vt.back(),
              t.pageCallback("afterOut", w, C, "current", "next", {
                route: w[0].f7Page.route,
                swipeBack: !0,
              }),
              t.pageCallback("afterIn", y, x, "previous", "current", {
                route: y[0].f7Page.route,
                swipeBack: !0,
              }),
              t.pageCallback("beforeRemove", w, C, "next", { swipeBack: !0 }),
              t.removePage(w),
              m && t.removeNavbar(C),
              r.trigger("swipeback:afterchange", p),
              t.emit("swipebackAfterChange", p),
              t.emit("routeChanged", t.currentRoute, t.previousRoute, t),
              n.preloadPreviousPage &&
                t.back(t.history[t.history.length - 2], { preload: !0 }))
            : (r.trigger("swipeback:afterreset", p),
              t.emit("swipebackAfterReset", p)),
          g && g.length > 0 && g.remove(),
          v && v.length > 0 && v.remove();
      });
  }
  !(function () {
    const e = !("touchstart" !== s.touchEvents.start || !i.passiveListener) && {
      passive: !0,
      capture: !1,
    };
    r.on(s.touchEvents.start, O, e),
      s.on("touchmove:active", L),
      s.on("touchend:passive", R);
  })(),
    t.on("routerDestroy", function () {
      const e = !(
        "touchstart" !== s.touchEvents.start || !i.passiveListener
      ) && { passive: !0, capture: !1 };
      r.off(s.touchEvents.start, O, e),
        s.off("touchmove:active", L),
        s.off("touchend:passive", R);
    });
}
function wt(e, t, r) {
  const a = this,
    s = t.route.redirect,
    n = "forward" === e ? "navigate" : "back";
  if (
    (r.initial &&
      a.params.browserHistory &&
      ((r.replaceState = !0), (r.history = !0)),
    "function" == typeof s)
  ) {
    a.allowPageChange = !1;
    const i = s.call(a, {
      router: a,
      to: t,
      resolve: function (e, t) {
        void 0 === t && (t = {}),
          (a.allowPageChange = !0),
          a[n](e, He({}, r, t));
      },
      reject: function () {
        a.allowPageChange = !0;
      },
      direction: e,
      app: a.app,
    });
    return i && "string" == typeof i
      ? ((a.allowPageChange = !0), a[n](i, r))
      : a;
  }
  return a[n](s, r);
}
function yt(e, t, r, a, s, n, i, o) {
  const l = [];
  Array.isArray(r) ? l.push(...r) : r && "function" == typeof r && l.push(r),
    t && (Array.isArray(t) ? l.push(...t) : l.push(t)),
    (function t() {
      if (0 === l.length) return void n();
      l.shift().call(e, {
        router: e,
        to: a,
        from: s,
        resolve() {
          t();
        },
        reject() {
          i();
        },
        direction: o,
        app: e.app,
      });
    })();
}
function Et(e, t, r, a, s) {
  const n = this;
  function i() {
    e && e.route && (n.params.routesBeforeEnter || e.route.beforeEnter)
      ? ((n.allowPageChange = !1),
        yt(
          n,
          n.params.routesBeforeEnter,
          e.route.beforeEnter,
          e,
          t,
          () => {
            (n.allowPageChange = !0), r();
          },
          () => {
            a();
          },
          s
        ))
      : r();
  }
  t && t.route && (n.params.routesBeforeLeave || t.route.beforeLeave)
    ? ((n.allowPageChange = !1),
      yt(
        n,
        n.params.routesBeforeLeave,
        t.route.beforeLeave,
        e,
        t,
        () => {
          (n.allowPageChange = !0), i();
        },
        () => {
          a();
        },
        s
      ))
    : i();
}
function Ct(e, t) {
  if (!e.view)
    throw new Error(
      `Framework7: it is not allowed to use router methods on global app router. Use router methods only on related View, e.g. app.views.main.router.${t}(...)`
    );
}
function xt(e, t, r, a) {
  function s(e) {
    e.then((e) => {
      r({ component: e.default || e._default || e });
    }).catch((e) => {
      throw (a(), new Error(e));
    });
  }
  if (t instanceof Promise) return void s(t);
  const n = t.call(e);
  n instanceof Promise ? s(n) : r({ component: n });
}
function St(e, t, r) {
  void 0 === r && (r = {});
  const a = u(),
    s = F(t),
    n = e.app,
    i = e.view,
    o = He(
      !1,
      {
        animate: e.params.animate,
        browserHistory: !0,
        replaceState: !1,
        history: !0,
        reloadCurrent: e.params.reloadPages,
        reloadPrevious: !1,
        reloadAll: !1,
        clearPreviousHistory: !1,
        reloadDetail: e.params.reloadDetail,
        on: {},
      },
      r
    ),
    l = e.params.masterDetailBreakpoint > 0,
    c =
      l &&
      o.route &&
      o.route.route &&
      (!0 === o.route.route.master ||
        ("function" == typeof o.route.route.master &&
          o.route.route.master(n, e)));
  let p,
    d,
    h,
    f = 0,
    m = e.currentRoute.modal;
  if (
    (m ||
      "popup popover sheet loginScreen actions customModal panel"
        .split(" ")
        .forEach((t) => {
          e.currentRoute &&
            e.currentRoute.route &&
            e.currentRoute.route[t] &&
            ((m = !0), (h = t));
        }),
    m)
  ) {
    const t =
        e.currentRoute.modal ||
        e.currentRoute.route.modalInstance ||
        n[h].get(),
      r = e.history[e.history.length - 2];
    let a = e.findMatchingRoute(r);
    !a &&
      r &&
      (a = {
        url: r,
        path: r.split("?")[0],
        query: Le(r),
        route: { path: r.split("?")[0], url: r },
      }),
      e.modalRemove(t);
  }
  const g = e.dynamicNavbar,
    v = e.$el,
    b = s,
    w = o.reloadPrevious || o.reloadCurrent || o.reloadAll;
  let y, E, C, x;
  if (((e.allowPageChange = !1), 0 === b.length))
    return (e.allowPageChange = !0), e;
  b.length && e.removeThemeElements(b),
    g &&
      ((C = b.children(".navbar")),
      (E = e.$navbarsEl),
      0 === C.length && b[0] && b[0].f7Page && (C = b[0].f7Page.$navbarEl)),
    o.route &&
      o.route.route &&
      o.route.route.keepAlive &&
      !o.route.route.keepAliveData &&
      (o.route.route.keepAliveData = { pageEl: s[0] });
  const S = v.children(".page").filter((e) => e !== b[0]);
  let k, T, M, A;
  if (
    (g && (k = E.children(".navbar").filter((e) => e !== C[0])),
    o.reloadPrevious && S.length < 2)
  )
    return (e.allowPageChange = !0), e;
  if (l && !o.reloadAll) {
    for (let e = 0; e < S.length; e += 1)
      p || !S[e].classList.contains("page-master") || (p = S[e]);
    if (((T = !c && p), T && p))
      for (let e = 0; e < S.length; e += 1)
        S[e].classList.contains("page-master-detail") && (d = S[e]);
    M = T && o.reloadDetail && n.width >= e.params.masterDetailBreakpoint && p;
  }
  T && (A = !d || M || o.reloadAll || o.reloadCurrent);
  let $ = "next";
  if (
    (o.reloadCurrent || o.reloadAll || M
      ? ($ = "current")
      : o.reloadPrevious && ($ = "previous"),
    b
      .removeClass("page-previous page-current page-next")
      .addClass(
        `page-${$}${c ? " page-master" : ""}${T ? " page-master-detail" : ""}${
          A ? " page-master-detail-root" : ""
        }`
      )
      .trigger("page:unstack")
      .trigger("page:position", { position: $ }),
    e.emit("pageUnstack", b[0]),
    e.emit("pagePosition", b[0], $),
    (c || T) &&
      (b.trigger("page:role", { role: c ? "master" : "detail", root: !!A }),
      e.emit("pageRole", b[0], {
        role: c ? "master" : "detail",
        detailRoot: !!A,
      })),
    g &&
      C.length &&
      (C.removeClass("navbar-previous navbar-current navbar-next").addClass(
        `navbar-${$}${c ? " navbar-master" : ""}${
          T ? " navbar-master-detail" : ""
        }${A ? " navbar-master-detail-root" : ""}`
      ),
      C.trigger("navbar:position", { position: $ }),
      e.emit("navbarPosition", C[0], $),
      (c || T) &&
        e.emit("navbarRole", C[0], {
          role: c ? "master" : "detail",
          detailRoot: !!A,
        })),
    o.reloadCurrent || M)
  )
    M
      ? ((y = S.filter((e) => !e.classList.contains("page-master"))),
        g && (x = F(y.map((e) => n.navbar.getElByPage(e)))),
        y.length > 1 &&
          p &&
          ((f = y.length - 1),
          F(p).removeClass("page-master-stacked").trigger("page:masterunstack"),
          e.emit("pageMasterUnstack", p),
          g &&
            (F(n.navbar.getElByPage(p)).removeClass("navbar-master-stacked"),
            e.emit("navbarMasterUnstack", n.navbar.getElByPage(p)))))
      : ((y = S.eq(S.length - 1)), g && (x = F(n.navbar.getElByPage(y))));
  else if (o.reloadPrevious)
    (y = S.eq(S.length - 2)), g && (x = F(n.navbar.getElByPage(y)));
  else if (o.reloadAll)
    (y = S.filter((e) => e !== b[0])), g && (x = k.filter((e) => e !== C[0]));
  else {
    let t = [],
      r = [];
    if (S.length > 1) {
      let a = 0;
      for (a = 0; a < S.length - 1; a += 1) {
        if (p && S[a] === p) {
          S.eq(a).addClass("page-master-stacked"),
            S.eq(a).trigger("page:masterstack"),
            e.emit("pageMasterStack", S[a]),
            g &&
              (F(n.navbar.getElByPage(p)).addClass("navbar-master-stacked"),
              e.emit("navbarMasterStack", n.navbar.getElByPage(p)));
          continue;
        }
        const s = n.navbar.getElByPage(S.eq(a));
        t.push(S[a]),
          e.pageCallback(
            "beforeRemove",
            S[a],
            k && k[a],
            "previous",
            void 0,
            o
          ),
          e.removePage(S[a]),
          g && s && (r.push(s), e.removeNavbar(s));
      }
    }
    (y = v.children(".page").filter((e) => e !== b[0] && t.indexOf(e) < 0)),
      g &&
        (x = E.children(".navbar").filter(
          (e) => e !== C[0] && r.indexOf(r) < 0
        )),
      (t = []),
      (r = []);
  }
  if (
    (T &&
      !o.reloadAll &&
      ((y.length > 1 || M) &&
        (y = y.filter((e) => !e.classList.contains("page-master"))),
      x &&
        (x.length > 1 || M) &&
        (x = x.filter((e) => !e.classList.contains("navbar-master")))),
    e.params.browserHistory &&
      (o.browserHistory || o.replaceState) &&
      !o.reloadPrevious)
  ) {
    const t = e.params.browserHistoryRoot || "";
    vt[
      o.reloadCurrent || (M && d) || o.reloadAll || o.replaceState
        ? "replace"
        : "push"
    ](
      i.id,
      { url: o.route.url },
      t + e.params.browserHistorySeparator + o.route.url
    );
  }
  o.reloadPrevious ||
    ((e.currentPageEl = b[0]),
    g && C.length ? (e.currentNavbarEl = C[0]) : delete e.currentNavbarEl,
    (e.currentRoute = o.route));
  const P = o.route.url;
  o.history &&
    (((o.reloadCurrent || (M && d)) && e.history.length) > 0 || o.replaceState
      ? (M &&
          f > 0 &&
          ((e.history = e.history.slice(0, e.history.length - f)),
          (e.propsHistory = e.propsHistory.slice(
            0,
            e.propsHistory.length - f
          ))),
        (e.history[e.history.length - (o.reloadPrevious ? 2 : 1)] = P),
        (e.propsHistory[e.propsHistory.length - (o.reloadPrevious ? 2 : 1)] =
          o.props || {}))
      : o.reloadPrevious
      ? ((e.history[e.history.length - 2] = P),
        (e.propsHistory[e.propsHistory.length - 2] = o.props || {}))
      : o.reloadAll
      ? ((e.history = [P]), (e.propsHistory = [o.props || {}]))
      : (e.history.push(P), e.propsHistory.push(o.props || {}))),
    e.saveHistory();
  const O = b.parents(a).length > 0,
    L = b[0].f7Component;
  if (
    (o.reloadPrevious
      ? (L && !O
          ? L.mount((e) => {
              F(e).insertBefore(y);
            })
          : b.insertBefore(y),
        g &&
          C.length &&
          (C.find(".title-large").length && C.addClass("navbar-large"),
          x.length
            ? C.insertBefore(x)
            : (e.$navbarsEl.parents(a).length || e.$el.prepend(e.$navbarsEl),
              E.append(C))))
      : (y.next(".page")[0] !== b[0] &&
          (L && !O
            ? L.mount((e) => {
                v.append(e);
              })
            : v.append(b[0])),
        g &&
          C.length &&
          (C.find(".title-large").length && C.addClass("navbar-large"),
          e.$navbarsEl.parents(a).length || e.$el.prepend(e.$navbarsEl),
          E.append(C[0]))),
    O
      ? o.route &&
        o.route.route &&
        o.route.route.keepAlive &&
        !b[0].f7PageMounted &&
        ((b[0].f7PageMounted = !0),
        e.pageCallback("mounted", b, C, $, w ? $ : "current", o, y))
      : e.pageCallback("mounted", b, C, $, w ? $ : "current", o, y),
    (o.reloadCurrent || M) && y.length > 0
      ? (e.pageCallback("beforeOut", y, x, "current", void 0, o),
        e.pageCallback("afterOut", y, x, "current", void 0, o),
        e.pageCallback("beforeRemove", y, x, "current", void 0, o),
        e.removePage(y),
        g && x && x.length && e.removeNavbar(x))
      : o.reloadAll
      ? y.each((t, r) => {
          const a = F(t),
            s = F(n.navbar.getElByPage(a));
          a.hasClass("page-current") &&
            (e.pageCallback("beforeOut", y, x, "current", void 0, o),
            e.pageCallback("afterOut", y, x, "current", void 0, o)),
            e.pageCallback(
              "beforeRemove",
              a,
              x && x.eq(r),
              "previous",
              void 0,
              o
            ),
            e.removePage(a),
            g && s.length && e.removeNavbar(s);
        })
      : o.reloadPrevious &&
        (e.pageCallback("beforeRemove", y, x, "previous", void 0, o),
        e.removePage(y),
        g && x && x.length && e.removeNavbar(x)),
    o.route.route.tab &&
      e.tabLoad(
        o.route.route.tab,
        He({}, o, { history: !1, browserHistory: !1 })
      ),
    l && i.checkMasterDetailBreakpoint(),
    e.pageCallback("init", b, C, $, w ? $ : "current", o, y),
    o.reloadCurrent || o.reloadAll || M)
  )
    return (
      (e.allowPageChange = !0),
      e.pageCallback("beforeIn", b, C, $, "current", o),
      b.removeAttr("aria-hidden"),
      g && C && C.removeAttr("aria-hidden"),
      e.pageCallback("afterIn", b, C, $, "current", o),
      o.reloadCurrent && o.clearPreviousHistory && e.clearPreviousHistory(),
      M &&
        (e.setPagePosition(F(p), "previous"),
        p.f7Page &&
          p.f7Page.navbarEl &&
          e.setNavbarPosition(F(p.f7Page.navbarEl), "previous")),
      e
    );
  if (o.reloadPrevious) return (e.allowPageChange = !0), e;
  function R() {
    e.setPagePosition(b, "current", !1),
      e.setPagePosition(y, "previous", !y.hasClass("page-master")),
      g &&
        (e.setNavbarPosition(C, "current", !1),
        e.setNavbarPosition(x, "previous", !x.hasClass("navbar-master"))),
      (e.allowPageChange = !0),
      e.pageCallback("afterOut", y, x, "current", "previous", o),
      e.pageCallback("afterIn", b, C, "next", "current", o);
    let t =
      (e.params.preloadPreviousPage || e.params[`${n.theme}SwipeBack`]) && !c;
    t ||
      ((b.hasClass("smart-select-page") ||
        b.hasClass("photo-browser-page") ||
        b.hasClass("autocomplete-page") ||
        b.hasClass("color-picker-page")) &&
        (t = !0)),
      t ||
        (b.attr("data-name") && "smart-select-page" === b.attr("data-name")) ||
        (e.pageCallback("beforeRemove", y, x, "previous", void 0, o),
        e.removePage(y),
        g && x.length && e.removeNavbar(x)),
      o.clearPreviousHistory && e.clearPreviousHistory(),
      e.emit("routeChanged", e.currentRoute, e.previousRoute, e),
      e.params.browserHistory && vt.clearRouterQueue();
  }
  function I() {
    e.setPagePosition(y, "current", !1),
      e.setPagePosition(b, "next", !1),
      g &&
        (e.setNavbarPosition(x, "current", !1),
        e.setNavbarPosition(C, "next", !1));
  }
  if (
    (e.pageCallback("beforeOut", y, x, "current", "previous", o),
    e.pageCallback("beforeIn", b, C, "next", "current", o),
    !o.animate || (c && n.width >= e.params.masterDetailBreakpoint))
  )
    R();
  else {
    const t = e.params[`${e.app.theme}PageLoadDelay`];
    let r = e.params.transition;
    o.transition && (r = o.transition),
      !r &&
        e.currentRoute &&
        e.currentRoute.route &&
        (r = e.currentRoute.route.transition),
      !r &&
        e.currentRoute &&
        e.currentRoute.route.options &&
        (r = e.currentRoute.route.options.transition),
      r && (b[0].f7PageTransition = r),
      t
        ? setTimeout(() => {
            I(),
              e.animate(y, b, x, C, "forward", r, () => {
                R();
              });
          }, t)
        : (I(),
          e.animate(y, b, x, C, "forward", r, () => {
            R();
          }));
  }
  return e;
}
function kt(e, t, r, a) {
  if (
    (void 0 === t && (t = {}),
    void 0 === r && (r = {}),
    !e.allowPageChange && !a)
  )
    return e;
  const s = t,
    n = r,
    {
      url: i,
      content: o,
      el: l,
      pageName: c,
      component: p,
      componentUrl: d,
    } = s;
  if (
    !n.reloadCurrent &&
    n.route &&
    n.route.route &&
    n.route.route.parentPath &&
    e.currentRoute.route &&
    e.currentRoute.route.parentPath === n.route.route.parentPath
  ) {
    if (n.route.url === e.url) return (e.allowPageChange = !0), !1;
    let t =
      Object.keys(n.route.params).length ===
      Object.keys(e.currentRoute.params).length;
    if (
      (t &&
        Object.keys(n.route.params).forEach((r) => {
          (r in e.currentRoute.params &&
            e.currentRoute.params[r] === n.route.params[r]) ||
            (t = !1);
        }),
      t)
    )
      return !!n.route.route.tab && e.tabLoad(n.route.route.tab, n);
    if (
      !t &&
      n.route.route.tab &&
      e.currentRoute.route.tab &&
      e.currentRoute.parentPath === n.route.parentPath
    )
      return e.tabLoad(n.route.route.tab, n);
  }
  if (
    n.route &&
    n.route.url &&
    e.url === n.route.url &&
    !n.reloadCurrent &&
    !n.reloadPrevious &&
    !e.params.allowDuplicateUrls
  )
    return (e.allowPageChange = !0), !1;
  if (
    (!n.route &&
      i &&
      ((n.route = e.parseRouteUrl(i)),
      He(n.route, { route: { url: i, path: i } })),
    (i || d || p) && (e.allowPageChange = !1),
    o)
  )
    St(e, e.getPageEl(o), n);
  else if (l) St(e, e.getPageEl(l), n);
  else if (c) St(e, e.$el.children(`.page[data-name="${c}"]`).eq(0), n);
  else if (p || d)
    try {
      e.pageComponentLoader({
        routerEl: e.el,
        component: p,
        componentUrl: d,
        options: n,
        resolve: function (t, r) {
          return St(e, t, He(n, r));
        },
        reject: function () {
          return (e.allowPageChange = !0), e;
        },
      });
    } catch (u) {
      throw ((e.allowPageChange = !0), u);
    }
  else
    i &&
      (e.xhrAbortController &&
        (e.xhrAbortController.abort(), (e.xhrAbortController = !1)),
      e
        .xhrRequest(i, n)
        .then((t) => {
          St(e, e.getPageEl(t), n);
        })
        .catch(() => {
          e.allowPageChange = !0;
        }));
  return e;
}
function Tt(e, t, r) {
  const a = Qe(),
    s = u(),
    n = F(t),
    i = e.app,
    o = e.view,
    l = He(
      !1,
      { animate: e.params.animate, browserHistory: !0, replaceState: !1 },
      r
    ),
    c = e.params.masterDetailBreakpoint > 0,
    p =
      c &&
      l.route &&
      l.route.route &&
      (!0 === l.route.route.master ||
        ("function" == typeof l.route.route.master &&
          l.route.route.master(i, e)));
  let d, h;
  const f = e.dynamicNavbar,
    m = n,
    g = e.$el.children(".page-current"),
    v = 0 === g.length && l.preload,
    b = c && g.hasClass("page-master");
  let w, y, E, C, x, S;
  if (
    (m.length && e.removeThemeElements(m),
    f &&
      ((y = m.children(".navbar")),
      (w = e.$navbarsEl),
      0 === y.length && m[0] && m[0].f7Page && (y = m[0].f7Page.$navbarEl),
      (E = w.find(".navbar-current"))),
    (e.allowPageChange = !1),
    0 === m.length || (0 === g.length && !l.preload))
  )
    return (e.allowPageChange = !0), e;
  if (
    (e.removeThemeElements(m),
    l.route &&
      l.route.route &&
      l.route.route.keepAlive &&
      !l.route.route.keepAliveData &&
      (l.route.route.keepAliveData = { pageEl: n[0] }),
    c)
  ) {
    const t = e.$el.children(".page").filter((e) => e !== m[0]);
    for (let e = 0; e < t.length; e += 1)
      d || !t[e].classList.contains("page-master") || (d = t[e]);
    (C =
      !p &&
      d &&
      e.history.indexOf(l.route.url) > e.history.indexOf(d.f7Page.route.url)),
      !C &&
        !p &&
        d &&
        d.f7Page &&
        l.route.route.masterRoute &&
        (C = l.route.route.masterRoute.path === d.f7Page.route.route.path);
  }
  if (
    (C &&
      d &&
      d.f7Page &&
      (x =
        e.history.indexOf(l.route.url) -
          e.history.indexOf(d.f7Page.route.url) ==
        1),
    m
      .addClass(
        `page-${v ? "current" : "previous"}${p ? " page-master" : ""}${
          C ? " page-master-detail" : ""
        }${x ? " page-master-detail-root" : ""}`
      )
      .removeAttr("aria-hidden")
      .trigger("page:unstack")
      .trigger("page:position", { position: v ? "current" : "previous" }),
    e.emit("pageUnstack", m[0]),
    e.emit("pagePosition", m[0], v ? "current" : "previous"),
    (p || C) &&
      (m.trigger("page:role", { role: p ? "master" : "detail", root: !!x }),
      e.emit("pageRole", m[0], {
        role: p ? "master" : "detail",
        detailRoot: !!x,
      })),
    f &&
      y.length > 0 &&
      (y
        .addClass(
          `navbar-${v ? "current" : "previous"}${p ? " navbar-master" : ""}${
            C ? " navbar-master-detail" : ""
          }${x ? " navbar-master-detail-root" : ""}`
        )
        .removeAttr("aria-hidden"),
      y.trigger("navbar:position", { position: v ? "current" : "previous" }),
      e.emit("navbarPosition", y[0], v ? "current" : "previous"),
      (p || x) &&
        e.emit("navbarRole", y[0], {
          role: p ? "master" : "detail",
          detailRoot: !!x,
        })),
    l.force && g.prev(".page-previous").length >= 0)
  ) {
    e.history.indexOf(l.route.url) >= 0
      ? ((S = e.history.length - e.history.indexOf(l.route.url) - 1),
        (e.history = e.history.slice(0, e.history.indexOf(l.route.url) + 2)),
        (e.propsHistory = e.propsHistory.slice(
          0,
          e.history.indexOf(l.route.url) + 2
        )),
        (o.history = e.history))
      : e.history[[e.history.length - 2]]
      ? (e.propsHistory[e.propsHistory.length - 2] = l.props || {})
      : (e.history.unshift(e.url), e.propsHistory.unshift(l.props || {}));
    const t = g.prev(".page-previous");
    let r;
    f && (r = F(i.navbar.getElByPage(t))),
      t.length > 0 &&
        (e.pageCallback("beforeRemove", t, r, "previous", void 0, l),
        t[0] === d && (h = !0),
        e.removePage(t),
        f && r.length && e.removeNavbar(r));
  }
  const k = m.parents(s).length > 0,
    T = m[0].f7Component;
  function M() {
    v &&
      (!k && T
        ? T.mount((t) => {
            e.$el.append(t);
          })
        : e.$el.append(m)),
      0 === m.next(g).length &&
        (!k && T
          ? T.mount((e) => {
              F(e).insertBefore(g);
            })
          : m.insertBefore(g)),
      f &&
        y.length &&
        (y.find(".title-large").length && y.addClass("navbar-large"),
        y.insertBefore(E),
        E.length > 0
          ? y.insertBefore(E)
          : (e.$navbarsEl.parents(s).length || e.$el.prepend(e.$navbarsEl),
            w.append(y))),
      k
        ? l.route &&
          l.route.route &&
          l.route.route.keepAlive &&
          !m[0].f7PageMounted &&
          ((m[0].f7PageMounted = !0),
          e.pageCallback("mounted", m, y, "previous", "current", l, g))
        : e.pageCallback("mounted", m, y, "previous", "current", l, g);
  }
  if (l.preload) {
    M(),
      l.route.route.tab &&
        e.tabLoad(
          l.route.route.tab,
          He({}, l, { history: !1, browserHistory: !1, preload: !0 })
        ),
      p &&
        (m.removeClass("page-master-stacked").trigger("page:masterunstack"),
        e.emit("pageMasterUnstack", m[0]),
        f &&
          (F(i.navbar.getElByPage(m)).removeClass("navbar-master-stacked"),
          e.emit("navbarMasterUnstack", i.navbar.getElByPage(m)))),
      e.pageCallback("init", m, y, "previous", "current", l, g),
      v &&
        (e.pageCallback("beforeIn", m, y, "current", void 0, l),
        e.pageCallback("afterIn", m, y, "current", void 0, l));
    const t = m.prevAll(".page-previous:not(.page-master)");
    return (
      t.length > 0 &&
        t.each((t) => {
          const r = F(t);
          let a;
          f && (a = F(i.navbar.getElByPage(r))),
            e.pageCallback("beforeRemove", r, a, "previous", void 0),
            e.removePage(r),
            f && a.length && e.removeNavbar(a);
        }),
      (e.allowPageChange = !0),
      e
    );
  }
  if (
    !(a.ie || a.edge || (a.firefox && !a.ios)) &&
    e.params.browserHistory &&
    l.browserHistory
  )
    if (l.replaceState) {
      const t = e.params.browserHistoryRoot || "";
      vt.replace(
        o.id,
        { url: l.route.url },
        t + e.params.browserHistorySeparator + l.route.url
      );
    } else S ? vt.go(-S) : vt.back();
  if (
    (l.replaceState
      ? ((e.history[e.history.length - 1] = l.route.url),
        (e.propsHistory[e.propsHistory.length - 1] = l.props || {}))
      : (1 === e.history.length &&
          (e.history.unshift(e.url), e.propsHistory.unshift(l.props || {})),
        e.history.pop(),
        e.propsHistory.pop()),
    e.saveHistory(),
    (e.currentPageEl = m[0]),
    f && y.length ? (e.currentNavbarEl = y[0]) : delete e.currentNavbarEl,
    (e.currentRoute = l.route),
    (a.ie || a.edge || (a.firefox && !a.ios)) &&
      e.params.browserHistory &&
      l.browserHistory)
  )
    if (l.replaceState) {
      const t = e.params.browserHistoryRoot || "";
      vt.replace(
        o.id,
        { url: l.route.url },
        t + e.params.browserHistorySeparator + l.route.url
      );
    } else S ? vt.go(-S) : vt.back();
  function A() {
    e.setPagePosition(m, "current", !1),
      e.setPagePosition(g, "next", !0),
      f &&
        (e.setNavbarPosition(y, "current", !1),
        e.setNavbarPosition(E, "next", !0)),
      e.pageCallback("afterOut", g, E, "current", "next", l),
      e.pageCallback("afterIn", m, y, "previous", "current", l),
      e.pageCallback("beforeRemove", g, E, "next", void 0, l),
      e.removePage(g),
      f && E.length && e.removeNavbar(E),
      (e.allowPageChange = !0),
      e.emit("routeChanged", e.currentRoute, e.previousRoute, e);
    (e.params.preloadPreviousPage || e.params[`${i.theme}SwipeBack`]) &&
      e.history[e.history.length - 2] &&
      !p &&
      e.back(e.history[e.history.length - 2], {
        preload: !0,
        props: e.propsHistory[e.propsHistory.length - 2] || {},
      }),
      e.params.browserHistory && vt.clearRouterQueue();
  }
  if (
    (M(),
    l.route.route.tab &&
      e.tabLoad(
        l.route.route.tab,
        He({}, l, { history: !1, browserHistory: !1 })
      ),
    c && (b || h) && o.checkMasterDetailBreakpoint(!1),
    e.pageCallback("init", m, y, "previous", "current", l, g),
    e.pageCallback("beforeOut", g, E, "current", "next", l),
    e.pageCallback("beforeIn", m, y, "previous", "current", l),
    !l.animate || (b && i.width >= e.params.masterDetailBreakpoint))
  )
    A();
  else {
    let t = e.params.transition;
    g[0] &&
      g[0].f7PageTransition &&
      ((t = g[0].f7PageTransition), delete g[0].f7PageTransition),
      l.transition && (t = l.transition),
      !t &&
        e.previousRoute &&
        e.previousRoute.route &&
        (t = e.previousRoute.route.transition),
      !t &&
        e.previousRoute &&
        e.previousRoute.route &&
        e.previousRoute.route.options &&
        (t = e.previousRoute.route.options.transition),
      e.setPagePosition(g, "current"),
      e.setPagePosition(m, "previous", !1),
      f &&
        (e.setNavbarPosition(E, "current"),
        e.setNavbarPosition(y, "previous", !1)),
      e.animate(g, m, E, y, "backward", t, () => {
        A();
      });
  }
  return e;
}
function Mt(e, t, r, a) {
  if (!e.allowPageChange && !a) return e;
  const s = t,
    n = r,
    {
      url: i,
      content: o,
      el: l,
      pageName: c,
      component: p,
      componentUrl: d,
    } = s;
  if (
    n.route.url &&
    e.url === n.route.url &&
    !n.reloadCurrent &&
    !n.reloadPrevious &&
    !e.params.allowDuplicateUrls
  )
    return (e.allowPageChange = !0), !1;
  if (
    (!n.route && i && (n.route = e.parseRouteUrl(i)),
    (i || d || p) && (e.allowPageChange = !1),
    o)
  )
    Tt(e, e.getPageEl(o), n);
  else if (l) Tt(e, e.getPageEl(l), n);
  else if (c) Tt(e, e.$el.children(`.page[data-name="${c}"]`).eq(0), n);
  else if (p || d)
    try {
      e.pageComponentLoader({
        routerEl: e.el,
        component: p,
        componentUrl: d,
        options: n,
        resolve: function (t, r) {
          return Tt(e, t, He(n, r));
        },
        reject: function () {
          return (e.allowPageChange = !0), e;
        },
      });
    } catch (u) {
      throw ((e.allowPageChange = !0), u);
    }
  else
    i &&
      (e.xhrAbortController &&
        (e.xhrAbortController.abort(), (e.xhrAbortController = !1)),
      e
        .xhrRequest(i, n)
        .then((t) => {
          Tt(e, e.getPageEl(t), n);
        })
        .catch(() => {
          e.allowPageChange = !0;
        }));
  return e;
}
class At extends Ze {
  constructor(e, t) {
    super({}, [void 0 === t ? e : t]);
    const r = this;
    (r.isAppRouter = void 0 === t),
      r.isAppRouter
        ? He(!1, r, {
            app: e,
            params: e.params.view,
            routes: e.routes || [],
            cache: e.cache,
          })
        : He(!1, r, {
            app: e,
            view: t,
            viewId: t.id,
            id: t.params.routerId,
            params: t.params,
            routes: t.routes,
            history: t.history,
            propsHistory: [],
            scrollHistory: t.scrollHistory,
            cache: e.cache,
            dynamicNavbar: "ios" === e.theme && t.params.iosDynamicNavbar,
            initialPages: [],
            initialNavbars: [],
          }),
      r.useModules(),
      (r.allowPageChange = !0);
    let a = {},
      s = {};
    return (
      Object.defineProperty(r, "currentRoute", {
        enumerable: !0,
        configurable: !0,
        set(e) {
          void 0 === e && (e = {}),
            (s = He({}, a)),
            (a = e),
            a && ((r.url = a.url), r.emit("routeChange", e, s, r));
        },
        get: () => a,
      }),
      Object.defineProperty(r, "previousRoute", {
        enumerable: !0,
        configurable: !0,
        get: () => s,
        set(e) {
          s = e;
        },
      }),
      r
    );
  }
  mount() {
    const e = this,
      t = e.view;
    He(!1, e, {
      tempDom: u().createElement("div"),
      $el: t.$el,
      el: t.el,
      $navbarsEl: t.$navbarsEl,
      navbarsEl: t.navbarsEl,
    }),
      e.emit("local::mount routerMount", e);
  }
  animatableNavElements(e, t, r, a, s) {
    const n = this,
      i = n.dynamicNavbar,
      o = n.params.iosAnimateNavbarBackIcon;
    let l, c;
    function p(e, t) {
      const r = e.hasClass("sliding") || t.hasClass("sliding"),
        a = e.hasClass("subnavbar"),
        s = !r || !a,
        n = e.find(".back .icon");
      let i;
      return (
        r &&
          o &&
          e.hasClass("left") &&
          n.length > 0 &&
          n.next("span").length &&
          ((e = n.next("span")), (i = !0)),
        {
          $el: e,
          isIconLabel: i,
          leftOffset: e[0].f7NavbarLeftOffset,
          rightOffset: e[0].f7NavbarRightOffset,
          isSliding: r,
          isSubnavbar: a,
          needsOpacityTransition: s,
        }
      );
    }
    return (
      i &&
        ((l = []),
        (c = []),
        e
          .children(".navbar-inner")
          .children(".left, .right, .title, .subnavbar")
          .each((t) => {
            const n = F(t);
            (n.hasClass("left") && a && "forward" === s) ||
              (n.hasClass("title") && r) ||
              l.push(p(n, e.children(".navbar-inner")));
          }),
        (t.hasClass("navbar-master") &&
          n.params.masterDetailBreakpoint > 0 &&
          n.app.width >= n.params.masterDetailBreakpoint) ||
          t
            .children(".navbar-inner")
            .children(".left, .right, .title, .subnavbar")
            .each((e) => {
              const n = F(e);
              (n.hasClass("left") && r && !a && "forward" === s) ||
                (n.hasClass("left") && r && "backward" === s) ||
                (n.hasClass("title") && a) ||
                c.push(p(n, t.children(".navbar-inner")));
            }),
        [c, l].forEach((e) => {
          e.forEach((t) => {
            const r = t,
              { isSliding: a, $el: s } = t,
              n = e === c ? l : c;
            a &&
              s.hasClass("title") &&
              n &&
              n.forEach((e) => {
                if (e.isIconLabel) {
                  const t = e.$el[0];
                  r.leftOffset += (t && t.offsetLeft) || 0;
                }
              });
          });
        })),
      { newNavEls: l, oldNavEls: c }
    );
  }
  animate(e, t, r, a, s, n, i) {
    const o = this;
    if (o.params.animateCustom)
      return void o.params.animateCustom.apply(o, [e, t, r, a, s, i]);
    const l = o.dynamicNavbar,
      c = "ios" === o.app.theme;
    if (n) {
      const c = `router-transition-custom router-transition-${n}-${s}`,
        p = () => {
          o.$el.removeClass(c),
            l &&
              o.$navbarsEl.length &&
              (a && o.$navbarsEl.prepend(a), r && o.$navbarsEl.prepend(r)),
            i && i();
        };
      return (
        ("forward" === s ? t : e).animationEnd(p),
        l &&
          (a &&
            t &&
            (o.setNavbarPosition(a, ""),
            a.removeClass("navbar-next navbar-previous navbar-current"),
            t.prepend(a)),
          r &&
            e &&
            (o.setNavbarPosition(r, ""),
            r.removeClass("navbar-next navbar-previous navbar-current"),
            e.prepend(r))),
        void o.$el.addClass(c)
      );
    }
    const p = `router-transition-${s} router-transition`;
    let d, u, h, f, m, g, v;
    if (c && l) {
      (o.params.masterDetailBreakpoint > 0 &&
        o.app.width >= o.params.masterDetailBreakpoint &&
        ((r.hasClass("navbar-master") && a.hasClass("navbar-master-detail")) ||
          (r.hasClass("navbar-master-detail") &&
            a.hasClass("navbar-master")))) ||
        ((g = r && r.hasClass("navbar-large")),
        (v = a && a.hasClass("navbar-large")),
        (h = g && !r.hasClass("navbar-large-collapsed")),
        (f = v && !a.hasClass("navbar-large-collapsed")),
        (m = (h && !f) || (f && !h)));
      const e = o.animatableNavElements(a, r, f, h, s);
      (d = e.newNavEls), (u = e.oldNavEls);
    }
    function b(e) {
      c &&
        l &&
        (1 === e &&
          (f &&
            (a.addClass("router-navbar-transition-to-large"),
            r.addClass("router-navbar-transition-to-large")),
          h &&
            (a.addClass("router-navbar-transition-from-large"),
            r.addClass("router-navbar-transition-from-large"))),
        d.forEach((t) => {
          const r = t.$el,
            a = "forward" === s ? t.rightOffset : t.leftOffset;
          t.isSliding &&
            (t.isSubnavbar && v
              ? r[0].style.setProperty(
                  "transform",
                  `translate3d(${
                    a * (1 - e)
                  }px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)`,
                  "important"
                )
              : r.transform(`translate3d(${a * (1 - e)}px,0,0)`));
        }),
        u.forEach((t) => {
          const r = t.$el,
            a = "forward" === s ? t.leftOffset : t.rightOffset;
          t.isSliding &&
            (t.isSubnavbar && g
              ? r.transform(
                  `translate3d(${
                    a * e
                  }px, calc(-1 * var(--f7-navbar-large-collapse-progress) * var(--f7-navbar-large-title-height)), 0)`
                )
              : r.transform(`translate3d(${a * e}px,0,0)`));
        }));
    }
    ("forward" === s ? t : c ? e : t).animationEnd(() => {
      o.dynamicNavbar &&
        (a &&
          (a.removeClass(
            "router-navbar-transition-to-large router-navbar-transition-from-large"
          ),
          a.addClass("navbar-no-title-large-transition"),
          Pe(() => {
            a.removeClass("navbar-no-title-large-transition");
          })),
        r &&
          r.removeClass(
            "router-navbar-transition-to-large router-navbar-transition-from-large"
          ),
        a.hasClass("sliding") || a.children(".navbar-inner.sliding").length
          ? a
              .find(".title, .left, .right, .left .icon, .subnavbar")
              .transform("")
          : a.find(".sliding").transform(""),
        r.hasClass("sliding") || r.children(".navbar-inner.sliding").length
          ? r
              .find(".title, .left, .right, .left .icon, .subnavbar")
              .transform("")
          : r.find(".sliding").transform("")),
        o.$el.removeClass(p),
        i && i();
    }),
      l
        ? (b(0),
          Pe(() => {
            o.$el.addClass(p), m && (o.el._clientLeft = o.el.clientLeft), b(1);
          }))
        : o.$el.addClass(p);
  }
  removeModal(e) {
    this.removeEl(e);
  }
  removeTabContent(e) {
    F(e).html("");
  }
  removeNavbar(e) {
    this.removeEl(e);
  }
  removePage(e) {
    const t = F(e),
      r = t && t[0] && t[0].f7Page;
    r && r.route && r.route.route && r.route.route.keepAlive
      ? t.remove()
      : this.removeEl(e);
  }
  removeEl(e) {
    if (!e) return;
    const t = this,
      r = F(e);
    0 !== r.length &&
      (r.find(".tab").each((e) => {
        F(e)
          .children()
          .each((e) => {
            e.f7Component &&
              (F(e).trigger("tab:beforeremove"), e.f7Component.destroy());
          });
      }),
      r[0].f7Component &&
        r[0].f7Component.destroy &&
        r[0].f7Component.destroy(),
      t.params.removeElements &&
        (t.params.removeElementsWithTimeout
          ? setTimeout(() => {
              r.remove();
            }, t.params.removeElementsTimeout)
          : r.remove()));
  }
  getPageEl(e) {
    const t = this;
    if ("string" == typeof e) t.tempDom.innerHTML = e;
    else {
      if (F(e).hasClass("page")) return e;
      (t.tempDom.innerHTML = ""), F(t.tempDom).append(e);
    }
    return t.findElement(".page", t.tempDom);
  }
  findElement(e, t) {
    const r = this,
      a = r.view,
      s = r.app,
      n = F(t),
      i = e;
    let o = n
      .find(i)
      .filter(
        (e) =>
          0 ===
          F(e).parents(
            ".popup, .dialog, .popover, .actions-modal, .sheet-modal, .login-screen, .page"
          ).length
      );
    return (
      o.length > 1 &&
        ("string" == typeof a.selector && (o = n.find(`${a.selector} ${i}`)),
        o.length > 1 && (o = n.find(`.${s.params.viewMainClass} ${i}`))),
      1 === o.length
        ? o
        : ((o = r.findElement(i, n)),
          o && 1 === o.length ? o : o && o.length > 1 ? F(o[0]) : void 0)
    );
  }
  flattenRoutes(e) {
    void 0 === e && (e = this.routes);
    const t = this;
    let r = [];
    return (
      e.forEach((e) => {
        let a = !1;
        if ("tabs" in e && e.tabs) {
          const s = e.tabs.map((t) => {
            const r = He({}, e, {
              path: `${e.path}/${t.path}`
                .replace("///", "/")
                .replace("//", "/"),
              parentPath: e.path,
              tab: t,
            });
            return delete r.tabs, delete r.routes, r;
          });
          (a = !0), (r = r.concat(t.flattenRoutes(s)));
        }
        if ("detailRoutes" in e) {
          const a = e.detailRoutes.map((t) => {
            const r = He({}, t);
            return (r.masterRoute = e), (r.masterRoutePath = e.path), r;
          });
          r = r.concat(e, t.flattenRoutes(a));
        }
        if ("routes" in e) {
          const s = e.routes.map((t) => {
            const r = He({}, t);
            return (
              (r.path = `${e.path}/${r.path}`
                .replace("///", "/")
                .replace("//", "/")),
              r
            );
          });
          r = a
            ? r.concat(t.flattenRoutes(s))
            : r.concat(e, t.flattenRoutes(s));
        }
        "routes" in e ||
          ("tabs" in e && e.tabs) ||
          "detailRoutes" in e ||
          r.push(e);
      }),
      r
    );
  }
  parseRouteUrl(e) {
    if (!e) return {};
    const t = Le(e),
      r = e.split("#")[1],
      a = e.split("#")[0].split("?")[0];
    return { query: t, hash: r, params: {}, url: e, path: a };
  }
  generateUrl(e) {
    if ((void 0 === e && (e = {}), "string" == typeof e)) return e;
    const { name: t, path: r, params: a, query: s } = e;
    if (!t && !r)
      throw new Error('Framework7: "name" or "path" parameter is required');
    const n = this,
      i = t ? n.findRouteByKey("name", t) : n.findRouteByKey("path", r);
    if (!i)
      throw t
        ? new Error(`Framework7: route with name "${t}" not found`)
        : new Error(`Framework7: route with path "${r}" not found`);
    const o = n.constructRouteUrl(i, { params: a, query: s });
    if (!o)
      throw new Error(
        `Framework7: can't construct URL for route with name "${t}"`
      );
    return o;
  }
  constructRouteUrl(e, t) {
    let { params: r, query: a } = void 0 === t ? {} : t;
    const { path: s } = e,
      n = dt(s);
    let i;
    try {
      i = n(r || {});
    } catch (o) {
      throw new Error(
        `Framework7: error constructing route URL from passed params:\nRoute: ${s}\n${o.toString()}`
      );
    }
    return (
      a &&
        ("string" == typeof a
          ? (i += `?${a}`)
          : Object.keys(a).length && (i += `?${Ie(a)}`)),
      i
    );
  }
  findTabRouteUrl(e) {
    const t = this,
      r = F(e),
      a = t.currentRoute.route.parentPath,
      s = r.attr("id");
    let n;
    return (
      t.flattenRoutes(t.routes).forEach((e) => {
        e.parentPath === a &&
          e.tab &&
          e.tab.id === s &&
          (n =
            t.currentRoute.params &&
            Object.keys(t.currentRoute.params).length > 0
              ? t.constructRouteUrl(e, {
                  params: t.currentRoute.params,
                  query: t.currentRoute.query,
                })
              : e.path);
      }),
      n
    );
  }
  findRouteByKey(e, t) {
    const r = this.routes;
    let a;
    return (
      this.flattenRoutes(r).forEach((r) => {
        a || (r[e] === t && (a = r));
      }),
      a
    );
  }
  findMatchingRoute(e) {
    if (!e) return;
    const t = this,
      r = t.routes,
      a = t.flattenRoutes(r),
      { path: s, query: n, hash: i, params: o } = t.parseRouteUrl(e);
    let l;
    return (
      a.forEach((t) => {
        if (l) return;
        const r = [],
          a = [t.path || "/"];
        let c;
        if (
          (t.alias &&
            ("string" == typeof t.alias
              ? a.push(t.alias)
              : Array.isArray(t.alias) &&
                t.alias.forEach((e) => {
                  a.push(e);
                })),
          a.forEach((e) => {
            c || (c = mt(e, r).exec(s || "/"));
          }),
          c)
        ) {
          let a;
          r.forEach((e, t) => {
            if ("number" == typeof e.name) return;
            const r = c[t + 1];
            o[e.name] = null == r ? r : decodeURIComponent(r);
          }),
            t.parentPath &&
              (a = (s || "/")
                .split("/")
                .slice(0, t.parentPath.split("/").length - 1)
                .join("/")),
            (l = {
              query: n,
              hash: i,
              params: o,
              url: e,
              path: s || "/",
              parentPath: a,
              route: t,
              name: t.name,
            });
        }
      }),
      l
    );
  }
  replaceRequestUrlParams(e, t) {
    void 0 === e && (e = ""), void 0 === t && (t = {});
    let r = e;
    return (
      "string" == typeof r &&
        r.indexOf("{{") >= 0 &&
        t &&
        t.route &&
        t.route.params &&
        Object.keys(t.route.params).length &&
        Object.keys(t.route.params).forEach((e) => {
          const a = new RegExp(`{{${e}}}`, "g");
          r = r.replace(a, t.route.params[e] || "");
        }),
      r
    );
  }
  removeFromXhrCache(e) {
    const t = this.cache.xhr;
    let r = !1;
    for (let a = 0; a < t.length; a += 1) t[a].url === e && (r = a);
    !1 !== r && t.splice(r, 1);
  }
  xhrRequest(e, t) {
    const r = this,
      a = r.params,
      { ignoreCache: s } = t;
    let n = e,
      i = n.indexOf("?") >= 0;
    return (
      a.passRouteQueryToRequest &&
        t &&
        t.route &&
        t.route.query &&
        Object.keys(t.route.query).length &&
        ((n += `${i ? "&" : "?"}${Ie(t.route.query)}`), (i = !0)),
      a.passRouteParamsToRequest &&
        t &&
        t.route &&
        t.route.params &&
        Object.keys(t.route.params).length &&
        ((n += `${i ? "&" : "?"}${Ie(t.route.params)}`), (i = !0)),
      n.indexOf("{{") >= 0 && (n = r.replaceRequestUrlParams(n, t)),
      a.xhrCacheIgnoreGetParameters &&
        n.indexOf("?") >= 0 &&
        (n = n.split("?")[0]),
      new Promise((e, i) => {
        if (
          a.xhrCache &&
          !s &&
          n.indexOf("nocache") < 0 &&
          a.xhrCacheIgnore.indexOf(n) < 0
        )
          for (let t = 0; t < r.cache.xhr.length; t += 1) {
            const s = r.cache.xhr[t];
            if (s.url === n && Oe() - s.time < a.xhrCacheDuration)
              return void e(s.content);
          }
        let o;
        (r.xhrAbortController = new AbortController()),
          fetch(n, { signal: r.xhrAbortController.signal, method: "GET" })
            .then((e) => ((o = e), e.text()))
            .then((s) => {
              const { status: l } = o;
              r.emit("routerAjaxComplete", o),
                ("error" !== l && "timeout" !== l && l >= 200 && l < 300) ||
                0 === l
                  ? (a.xhrCache &&
                      "" !== s &&
                      (r.removeFromXhrCache(n),
                      r.cache.xhr.push({ url: n, time: Oe(), content: s })),
                    r.emit("routerAjaxSuccess", o, t),
                    e(s))
                  : (r.emit("routerAjaxError", o, t), i(o));
            })
            .catch((e) => {
              i(e);
            });
      })
    );
  }
  setNavbarPosition(e, t, r) {
    e.removeClass("navbar-previous navbar-current navbar-next"),
      t && e.addClass(`navbar-${t}`),
      !1 === r
        ? e.removeAttr("aria-hidden")
        : !0 === r && e.attr("aria-hidden", "true"),
      e.trigger("navbar:position", { position: t }),
      this.emit("navbarPosition", e[0], t);
  }
  setPagePosition(e, t, r) {
    e.removeClass("page-previous page-current page-next"),
      e.addClass(`page-${t}`),
      !1 === r
        ? e.removeAttr("aria-hidden")
        : !0 === r && e.attr("aria-hidden", "true"),
      e.trigger("page:position", { position: t }),
      this.emit("pagePosition", e[0], t);
  }
  removeThemeElements(e) {
    const t = this.app.theme;
    let r;
    "ios" === t
      ? (r = ".md-only, .if-md, .if-not-ios, .not-ios")
      : "md" === t && (r = ".ios-only, .if-ios, .if-not-md, .not-md"),
      F(e).find(r).remove();
  }
  getPageData(e, t, r, a, s, n) {
    void 0 === s && (s = {});
    const i = this,
      o = F(e).eq(0),
      l = F(t).eq(0),
      c = o[0].f7Page || {};
    let p, d;
    if (
      ((("next" === r && "current" === a) ||
        ("current" === r && "previous" === a)) &&
        (p = "forward"),
      (("current" === r && "next" === a) ||
        ("previous" === r && "current" === a)) &&
        (p = "backward"),
      c && !c.fromPage)
    ) {
      const e = F(n);
      e.length && (d = e[0].f7Page);
    }
    (d = c.pageFrom || d), d && d.pageFrom && (d.pageFrom = null);
    const u = {
      app: i.app,
      view: i.view,
      router: i,
      $el: o,
      el: o[0],
      $pageEl: o,
      pageEl: o[0],
      $navbarEl: l,
      navbarEl: l[0],
      name: o.attr("data-name"),
      position: r,
      from: r,
      to: a,
      direction: p,
      route: c.route ? c.route : s,
      pageFrom: d,
    };
    return (o[0].f7Page = u), u;
  }
  pageCallback(e, t, r, a, s, n, i) {
    if ((void 0 === n && (n = {}), !t)) return;
    const o = this,
      l = F(t);
    if (!l.length) return;
    const c = F(r),
      { route: p } = n,
      d =
        o.params.restoreScrollTopOnBack &&
        !(
          o.params.masterDetailBreakpoint > 0 &&
          l.hasClass("page-master") &&
          o.app.width >= o.params.masterDetailBreakpoint
        ),
      u =
        l[0].f7Page &&
        l[0].f7Page.route &&
        l[0].f7Page.route.route &&
        l[0].f7Page.route.route.keepAlive;
    "beforeRemove" === e && u && (e = "beforeUnmount");
    const h = `page${e[0].toUpperCase() + e.slice(1, e.length)}`,
      f = `page:${e.toLowerCase()}`;
    let m = {};
    (m =
      "beforeRemove" === e && l[0].f7Page
        ? He(l[0].f7Page, { from: a, to: s, position: a })
        : o.getPageData(l[0], c[0], a, s, p, i)),
      (m.swipeBack = !!n.swipeBack);
    const { on: g = {}, once: v = {} } = n.route ? n.route.route : {};
    function b() {
      l[0].f7RouteEventsAttached ||
        ((l[0].f7RouteEventsAttached = !0),
        g &&
          Object.keys(g).length > 0 &&
          ((l[0].f7RouteEventsOn = g),
          Object.keys(g).forEach((e) => {
            (g[e] = g[e].bind(o)), l.on(Te(e), g[e]);
          })),
        v &&
          Object.keys(v).length > 0 &&
          ((l[0].f7RouteEventsOnce = v),
          Object.keys(v).forEach((e) => {
            (v[e] = v[e].bind(o)), l.once(Te(e), v[e]);
          })));
    }
    if (
      (n.on && He(g, n.on),
      n.once && He(v, n.once),
      "mounted" === e && b(),
      "init" === e)
    ) {
      if (
        d &&
        ("previous" === a || !a) &&
        "current" === s &&
        o.scrollHistory[m.route.url] &&
        !l.hasClass("no-restore-scroll")
      ) {
        let e = l.find(".page-content");
        e.length > 0 &&
          (e = e.filter(
            (e) =>
              0 === F(e).parents(".tab:not(.tab-active)").length &&
              !F(e).is(".tab:not(.tab-active)")
          )),
          e.scrollTop(o.scrollHistory[m.route.url]);
      }
      if ((b(), l[0].f7PageInitialized))
        return l.trigger("page:reinit", m), void o.emit("pageReinit", m);
      l[0].f7PageInitialized = !0;
    }
    if (d && "beforeOut" === e && "current" === a && "previous" === s) {
      let e = l.find(".page-content");
      e.length > 0 &&
        (e = e.filter(
          (e) =>
            0 === F(e).parents(".tab:not(.tab-active)").length &&
            !F(e).is(".tab:not(.tab-active)")
        )),
        (o.scrollHistory[m.route.url] = e.scrollTop());
    }
    d &&
      "beforeOut" === e &&
      "current" === a &&
      "next" === s &&
      delete o.scrollHistory[m.route.url],
      l.trigger(f, m),
      o.emit(h, m),
      ("beforeRemove" !== e && "beforeUnmount" !== e) ||
        (l[0].f7RouteEventsAttached &&
          (l[0].f7RouteEventsOn &&
            Object.keys(l[0].f7RouteEventsOn).forEach((e) => {
              l.off(Te(e), l[0].f7RouteEventsOn[e]);
            }),
          l[0].f7RouteEventsOnce &&
            Object.keys(l[0].f7RouteEventsOnce).forEach((e) => {
              l.off(Te(e), l[0].f7RouteEventsOnce[e]);
            }),
          (l[0].f7RouteEventsAttached = null),
          (l[0].f7RouteEventsOn = null),
          (l[0].f7RouteEventsOnce = null),
          delete l[0].f7RouteEventsAttached,
          delete l[0].f7RouteEventsOn,
          delete l[0].f7RouteEventsOnce),
        u ||
          (l[0].f7Page &&
            l[0].f7Page.navbarEl &&
            delete l[0].f7Page.navbarEl.f7Page,
          (l[0].f7Page = null)));
  }
  saveHistory() {
    const e = this,
      t = f();
    (e.view.history = e.history),
      e.params.browserHistory &&
        e.params.browserHistoryStoreHistory &&
        t.localStorage &&
        (t.localStorage[`f7router-${e.view.id}-history`] = JSON.stringify(
          e.history
        ));
  }
  restoreHistory() {
    const e = this,
      t = f();
    e.params.browserHistory &&
      e.params.browserHistoryStoreHistory &&
      t.localStorage &&
      t.localStorage[`f7router-${e.view.id}-history`] &&
      ((e.history = JSON.parse(
        t.localStorage[`f7router-${e.view.id}-history`]
      )),
      (e.view.history = e.history));
  }
  clearHistory() {
    const e = this;
    (e.history = []), e.view && (e.view.history = []), e.saveHistory();
  }
  updateCurrentUrl(e) {
    const t = this;
    Ct(t, "updateCurrentUrl"),
      t.history.length
        ? (t.history[t.history.length - 1] = e)
        : t.history.push(e);
    const {
      query: r,
      hash: a,
      params: s,
      url: n,
      path: i,
    } = t.parseRouteUrl(e);
    if (
      (t.currentRoute &&
        He(t.currentRoute, { query: r, hash: a, params: s, url: n, path: i }),
      t.params.browserHistory)
    ) {
      const r = t.params.browserHistoryRoot || "";
      vt.replace(
        t.view.id,
        { url: e },
        r + t.params.browserHistorySeparator + e
      );
    }
    t.saveHistory(), t.emit("routeUrlUpdate", t.currentRoute, t);
  }
  getInitialUrl() {
    const e = this;
    if (e.initialUrl)
      return { initialUrl: e.initialUrl, historyRestored: e.historyRestored };
    const { app: t, view: r } = e,
      a = u(),
      s = f(),
      n =
        t.params.url &&
        "string" == typeof t.params.url &&
        "undefined" != typeof URL
          ? new URL(t.params.url)
          : a.location;
    let i,
      o = e.params.url,
      l = n.href.split(n.origin)[1];
    const {
      browserHistory: c,
      browserHistoryOnLoad: p,
      browserHistorySeparator: d,
    } = e.params;
    let { browserHistoryRoot: h } = e.params;
    return (
      (s.cordova || (s.Capacitor && s.Capacitor.isNative)) &&
        c &&
        !d &&
        !h &&
        n.pathname.indexOf("index.html") &&
        (console.warn(
          "Framework7: wrong or not complete browserHistory configuration, trying to guess browserHistoryRoot"
        ),
        (h = n.pathname.split("index.html")[0])),
      c && p
        ? (h &&
            l.indexOf(h) >= 0 &&
            ((l = l.substring(l.indexOf(h) + h.length)), "" === l && (l = "/")),
          (o =
            d.length > 0 && l.indexOf(d) >= 0
              ? l.substring(l.indexOf(d) + d.length)
              : l),
          e.restoreHistory(),
          e.history.indexOf(o) >= 0
            ? (e.history = e.history.slice(0, e.history.indexOf(o) + 1))
            : e.params.url === o
            ? (e.history = [o])
            : vt.state &&
              vt.state[r.id] &&
              vt.state[r.id].url === e.history[e.history.length - 1]
            ? (o = e.history[e.history.length - 1])
            : (e.history = [l.split(d)[0] || "/", o]),
          e.history.length > 1 ? (i = !0) : (e.history = []),
          e.saveHistory())
        : (o || (o = l),
          n.search && o.indexOf("?") < 0 && (o += n.search),
          n.hash && o.indexOf("#") < 0 && (o += n.hash)),
      (e.initialUrl = o),
      (e.historyRestored = i),
      { initialUrl: o, historyRestored: i }
    );
  }
  init() {
    const e = this,
      { app: t, view: r } = e,
      a = u();
    e.mount();
    const { initialUrl: s, historyRestored: n } = e.getInitialUrl();
    ((r && e.params.iosSwipeBack && "ios" === t.theme) ||
      (r && e.params.mdSwipeBack && "md" === t.theme)) &&
      bt(e);
    const {
      browserHistory: i,
      browserHistoryOnLoad: o,
      browserHistoryAnimateOnLoad: l,
      browserHistoryInitialMatch: c,
    } = e.params;
    let p;
    if (e.history.length > 1) {
      const t = c ? s : e.history[0];
      (p = e.findMatchingRoute(t)),
        p ||
          (p = He(e.parseRouteUrl(t), {
            route: { url: t, path: t.split("?")[0] },
          }));
    } else
      (p = e.findMatchingRoute(s)),
        p ||
          (p = He(e.parseRouteUrl(s), {
            route: { url: s, path: s.split("?")[0] },
          }));
    if (0 === e.$el.children(".page").length && s && e.params.loadInitialPage)
      e.navigate(s, {
        initial: !0,
        reloadCurrent: !0,
        browserHistory: !1,
        animate: !1,
        once: {
          modalOpen() {
            if (!n) return;
            (e.params.preloadPreviousPage || e.params[`${t.theme}SwipeBack`]) &&
              e.history.length > 1 &&
              e.back({ preload: !0 });
          },
          pageAfterIn() {
            if (!n) return;
            (e.params.preloadPreviousPage || e.params[`${t.theme}SwipeBack`]) &&
              e.history.length > 1 &&
              e.back({ preload: !0 });
          },
        },
      });
    else if (e.$el.children(".page").length) {
      let i;
      if (
        ((e.currentRoute = p),
        e.$el.children(".page").each((s) => {
          const n = F(s);
          let o;
          e.setPagePosition(n, "current"),
            e.dynamicNavbar &&
              ((o = n.children(".navbar")),
              o.length > 0
                ? (e.$navbarsEl.parents(a).length ||
                    e.$el.prepend(e.$navbarsEl),
                  e.setNavbarPosition(o, "current"),
                  e.$navbarsEl.append(o),
                  o.children(".title-large").length &&
                    o.addClass("navbar-large"),
                  n.children(".navbar").remove())
                : (e.$navbarsEl.addClass("navbar-hidden"),
                  o.children(".title-large").length &&
                    e.$navbarsEl.addClass(
                      "navbar-hidden navbar-large-hidden"
                    ))),
            e.currentRoute &&
              e.currentRoute.route &&
              (!0 === e.currentRoute.route.master ||
                ("function" == typeof e.currentRoute.route.master &&
                  e.currentRoute.route.master(t, e))) &&
              e.params.masterDetailBreakpoint > 0 &&
              (n.addClass("page-master"),
              n.trigger("page:role", { role: "master" }),
              o && o.length && o.addClass("navbar-master"),
              r.checkMasterDetailBreakpoint());
          const l = { route: e.currentRoute };
          e.currentRoute &&
            e.currentRoute.route &&
            e.currentRoute.route.options &&
            He(l, e.currentRoute.route.options),
            (e.currentPageEl = n[0]),
            e.dynamicNavbar && o.length && (e.currentNavbarEl = o[0]),
            e.removeThemeElements(n),
            e.dynamicNavbar && o.length && e.removeThemeElements(o),
            l.route.route.tab &&
              ((i = !0), e.tabLoad(l.route.route.tab, He({}, l))),
            e.pageCallback("init", n, o, "current", void 0, l),
            e.pageCallback("beforeIn", n, o, "current", void 0, l),
            e.pageCallback("afterIn", n, o, "current", void 0, l);
        }),
        n)
      )
        if (c) {
          (e.params.preloadPreviousPage || e.params[`${t.theme}SwipeBack`]) &&
            e.history.length > 1 &&
            e.back({ preload: !0 });
        } else
          e.navigate(s, {
            initial: !0,
            browserHistory: !1,
            history: !1,
            animate: l,
            once: {
              pageAfterIn() {
                (e.params.preloadPreviousPage ||
                  e.params[`${t.theme}SwipeBack`]) &&
                  e.history.length > 2 &&
                  e.back({ preload: !0 });
              },
            },
          });
      n || i || (e.history.push(s), e.saveHistory());
    }
    !(s && i && o) ||
      (vt.state && vt.state[r.id]) ||
      vt.initViewState(r.id, { url: s }),
      e.emit("local::init routerInit", e);
  }
  destroy() {
    let e = this;
    e.emit("local::destroy routerDestroy", e),
      Object.keys(e).forEach((t) => {
        (e[t] = null), delete e[t];
      }),
      (e = null);
  }
}
(At.prototype.navigate = function (e, t) {
  void 0 === t && (t = {});
  const r = this;
  if (r.swipeBackActive) return r;
  let a, s, n, i, o, l, c;
  if (
    ("string" == typeof e
      ? (a = e)
      : ((a = e.url),
        (s = e.route),
        (n = e.name),
        (i = e.path),
        (o = e.query),
        (l = e.params)),
    n || i)
  )
    return (
      (a = r.generateUrl({ path: i, name: n, params: l, query: o })),
      a ? r.navigate(a, t) : r
    );
  const p = r.app;
  if ((Ct(r, "navigate"), "#" === a || "" === a)) return r;
  let d = a.replace("./", "");
  if ("/" !== d[0] && 0 !== d.indexOf("#")) {
    const e = r.currentRoute.parentPath || r.currentRoute.path;
    d = ((e ? `${e}/` : "/") + d).replace("///", "/").replace("//", "/");
  }
  if (
    ((c = s
      ? He(r.parseRouteUrl(d), { route: He({}, s) })
      : r.findMatchingRoute(d)),
    !c)
  )
    return r;
  if (c.route && c.route.viewName) {
    const a = c.route.viewName,
      s = p.views[a];
    if (!s)
      throw new Error(
        `Framework7: There is no View with "${a}" name that was specified in this route`
      );
    if (s !== r.view) return s.router.navigate(e, t);
  }
  if (c.route.redirect) return wt.call(r, "forward", c, t);
  const u = {};
  if (
    (c.route.options ? He(u, c.route.options, t) : He(u, t),
    u.openIn &&
      (!r.params.ignoreOpenIn ||
        (r.params.ignoreOpenIn && r.history.length > 0)))
  )
    return r.openIn(r, d, u);
  function h() {
    let e = !1;
    function t(e, t) {
      r.allowPageChange = !1;
      let a = !1;
      "popup popover sheet loginScreen actions customModal panel"
        .split(" ")
        .forEach((s) => {
          if (e[s]) {
            a = !0;
            const n = He({}, c, { route: e });
            (r.allowPageChange = !0), r.modalLoad(s, n, He(u, t), "forward");
          }
        }),
        a || kt(r, e, He(u, t), !0);
    }
    function a() {
      r.allowPageChange = !0;
    }
    "popup popover sheet loginScreen actions customModal panel"
      .split(" ")
      .forEach((t) => {
        c.route[t] && !e && ((e = !0), r.modalLoad(t, c, u, "forward"));
      }),
      c.route.keepAlive &&
        c.route.keepAliveData &&
        (kt(r, { el: c.route.keepAliveData.pageEl }, u, !1), (e = !0)),
      "url content component pageName el componentUrl"
        .split(" ")
        .forEach((t) => {
          c.route[t] && !e && ((e = !0), kt(r, { [t]: c.route[t] }, u, !1));
        }),
      e ||
        (c.route.async &&
          ((r.allowPageChange = !1),
          c.route.async.call(r, {
            router: r,
            to: u.route,
            from: r.currentRoute,
            resolve: t,
            reject: a,
            direction: "forward",
            app: p,
          })),
        c.route.asyncComponent && xt(r, c.route.asyncComponent, t, a));
  }
  function f() {
    r.allowPageChange = !0;
  }
  if (
    ((u.route = c), r.params.masterDetailBreakpoint > 0 && c.route.masterRoute)
  ) {
    let a = !0,
      s = !1;
    if (
      (r.currentRoute &&
        r.currentRoute.route &&
        (!(
          !0 === r.currentRoute.route.master ||
          ("function" == typeof r.currentRoute.route.master &&
            r.currentRoute.route.master(p, r))
        ) ||
          (r.currentRoute.route !== c.route.masterRoute &&
            r.currentRoute.route.path !== c.route.masterRoute.path) ||
          (a = !1),
        !r.currentRoute.route.masterRoute ||
          (r.currentRoute.route.masterRoute !== c.route.masterRoute &&
            r.currentRoute.route.masterRoute.path !==
              c.route.masterRoute.path) ||
          ((a = !1), (s = !0))),
      a || (s && t.reloadAll))
    )
      return (
        r.navigate(
          { path: c.route.masterRoute.path, params: c.params || {} },
          {
            animate: !1,
            reloadAll: t.reloadAll,
            reloadCurrent: t.reloadCurrent,
            reloadPrevious: t.reloadPrevious,
            browserHistory: !t.initial,
            history: !t.initial,
            once: {
              pageAfterIn() {
                r.navigate(
                  e,
                  He({}, t, {
                    animate: !1,
                    reloadAll: !1,
                    reloadCurrent: !1,
                    reloadPrevious: !1,
                    history: !t.initial,
                    browserHistory: !t.initial,
                  })
                );
              },
            },
          }
        ),
        r
      );
  }
  return (
    Et.call(
      r,
      c,
      r.currentRoute,
      () => {
        c.route.modules
          ? p
              .loadModules(
                Array.isArray(c.route.modules)
                  ? c.route.modules
                  : [c.route.modules]
              )
              .then(() => {
                h();
              })
              .catch(() => {
                f();
              })
          : h();
      },
      () => {
        f();
      },
      "forward"
    ),
    r
  );
}),
  (At.prototype.refreshPage = function (e) {
    void 0 === e && (e = {});
    const t = this;
    return (
      Ct(t, "refreshPage"),
      t.navigate(t.currentRoute.url, {
        ignoreCache: !0,
        reloadCurrent: !0,
        props: e,
      })
    );
  }),
  (At.prototype.tabLoad = function (e, t) {
    void 0 === t && (t = {});
    const r = this,
      a = He(
        {
          animate: r.params.animate,
          browserHistory: !0,
          history: !0,
          parentPageEl: null,
          preload: !1,
          on: {},
        },
        t
      );
    let s, n;
    a.route &&
      (a.preload ||
        a.route === r.currentRoute ||
        ((n = r.previousRoute), (r.currentRoute = a.route)),
      a.preload
        ? ((s = a.route), (n = r.currentRoute))
        : ((s = r.currentRoute), n || (n = r.previousRoute)),
      r.params.browserHistory &&
        a.browserHistory &&
        !a.reloadPrevious &&
        vt[r.params.browserHistoryTabs](
          r.view.id,
          { url: a.route.url },
          (r.params.browserHistoryRoot || "") +
            r.params.browserHistorySeparator +
            a.route.url
        ),
      a.history &&
        ((r.history[Math.max(r.history.length - 1, 0)] = a.route.url),
        r.saveHistory()));
    const i = F(a.parentPageEl || r.currentPageEl);
    let o;
    o =
      i.length && i.find(`#${e.id}`).length
        ? i.find(`#${e.id}`).eq(0)
        : r.view.selector
        ? `${r.view.selector} #${e.id}`
        : `#${e.id}`;
    const l = r.app.tab.show({
        tabEl: o,
        animate: a.animate,
        tabRoute: a.route,
      }),
      { $newTabEl: c, $oldTabEl: p, animated: d, onTabsChanged: u } = l;
    if (c && c.parents(".page").length > 0 && a.route) {
      const e = c.parents(".page")[0].f7Page;
      e && a.route && (e.route = a.route);
    }
    if (c[0].f7RouterTabLoaded)
      return p && p.length
        ? (d
            ? u(() => {
                r.emit("routeChanged", r.currentRoute, r.previousRoute, r);
              })
            : r.emit("routeChanged", r.currentRoute, r.previousRoute, r),
          r)
        : r;
    function h(t, a) {
      const { url: s, content: n, el: i, component: o, componentUrl: l } = t;
      function h(t) {
        (r.allowPageChange = !0),
          t &&
            ("string" == typeof t
              ? c.html(t)
              : (c.html(""),
                t.f7Component
                  ? t.f7Component.mount((e) => {
                      c.append(e);
                    })
                  : c.append(t)),
            (c[0].f7RouterTabLoaded = !0),
            (function (t) {
              r.removeThemeElements(c);
              let a = c;
              "string" != typeof t && (a = F(t)),
                a.trigger("tab:init tab:mounted", e),
                r.emit("tabInit tabMounted", c[0], e),
                p &&
                  p.length &&
                  (d
                    ? u(() => {
                        r.emit(
                          "routeChanged",
                          r.currentRoute,
                          r.previousRoute,
                          r
                        ),
                          r.params.unloadTabContent && r.tabRemove(p, c, e);
                      })
                    : (r.emit(
                        "routeChanged",
                        r.currentRoute,
                        r.previousRoute,
                        r
                      ),
                      r.params.unloadTabContent && r.tabRemove(p, c, e)));
            })(t));
      }
      if (n) h(n);
      else if (i) h(i);
      else if (o || l)
        try {
          r.tabComponentLoader({
            tabEl: c[0],
            component: o,
            componentUrl: l,
            options: a,
            resolve: h,
            reject: function () {
              return (r.allowPageChange = !0), r;
            },
          });
        } catch (f) {
          throw ((r.allowPageChange = !0), f);
        }
      else
        s &&
          (r.xhrAbortController &&
            (r.xhrAbortController.abort(), (r.xhrAbortController = !1)),
          r
            .xhrRequest(s, a)
            .then((e) => {
              h(e);
            })
            .catch(() => {
              r.allowPageChange = !0;
            }));
    }
    let f;
    function m(e, t) {
      h(e, He(a, t));
    }
    function g() {
      r.allowPageChange = !0;
    }
    return (
      "url content component el componentUrl".split(" ").forEach((t) => {
        e[t] && ((f = !0), h({ [t]: e[t] }, a));
      }),
      e.async
        ? e.async.call(r, {
            router: r,
            to: s,
            from: n,
            resolve: m,
            reject: g,
            app: r.app,
          })
        : e.asyncComponent
        ? xt(r, e.asyncComponent, m, g)
        : f || (r.allowPageChange = !0),
      r
    );
  }),
  (At.prototype.tabRemove = function (e, t, r) {
    let a;
    e[0] && ((e[0].f7RouterTabLoaded = !1), delete e[0].f7RouterTabLoaded),
      e.children().each((e) => {
        e.f7Component &&
          ((a = !0),
          F(e).trigger("tab:beforeremove", r),
          e.f7Component.destroy());
      }),
      a || e.trigger("tab:beforeremove", r),
      this.emit("tabBeforeRemove", e[0], t[0], r),
      this.removeTabContent(e[0], r);
  }),
  (At.prototype.modalLoad = function (e, t, r, a) {
    void 0 === r && (r = {});
    const s = this,
      n = s.app,
      i = "panel" === e,
      o = i ? "panel" : "modal",
      l = He(
        {
          animate: s.params.animate,
          browserHistory: !0,
          history: !0,
          on: {},
          once: {},
        },
        r
      ),
      c = He({}, t.route[e]),
      p = t.route,
      d = (e, t) => {
        const { on: r, once: a } = l;
        let s;
        "open" === t &&
          (s = r.modalOpen || a.modalOpen || r.panelOpen || a.panelOpen),
          "close" === t &&
            (s = r.modalClose || a.modalClose || r.panelClose || a.panelClose),
          "closed" === t &&
            (s =
              r.modalClosed || a.modalClosed || r.panelClosed || a.panelClosed),
          s && s(e);
      };
    function u() {
      const r = n[e].create(c);
      p.modalInstance = r;
      const a = r.el;
      function u() {
        r.close();
      }
      r.on(`${o}Open`, () => {
        a ||
          (s.removeThemeElements(r.el),
          r.$el.trigger(
            `${e.toLowerCase()}:init ${e.toLowerCase()}:mounted`,
            t,
            r
          ),
          s.emit(`${i ? "" : "modalInit"} ${e}Init ${e}Mounted`, r.el, t, r)),
          s.once("swipeBackMove", u),
          d(r, "open");
      }),
        r.on(`${o}Close`, () => {
          s.off("swipeBackMove", u), r.closeByRouter || s.back(), d(r, "close");
        }),
        r.on(`${o}Closed`, () => {
          r.$el.trigger(`${e.toLowerCase()}:beforeremove`, t, r),
            r.emit(
              `${i ? "" : "modalBeforeRemove "}${e}BeforeRemove`,
              r.el,
              t,
              r
            );
          const a = r.el.f7Component;
          d(r, "closed"),
            a && a.destroy(),
            $e(() => {
              (a || c.component || c.asyncComponent) && s.removeModal(r.el),
                r.destroy(),
                delete r.route,
                delete p.modalInstance;
            });
        }),
        l.route &&
          (s.params.browserHistory &&
            l.browserHistory &&
            vt.push(
              s.view.id,
              { url: l.route.url, modal: e },
              (s.params.browserHistoryRoot || "") +
                s.params.browserHistorySeparator +
                l.route.url
            ),
          l.route !== s.currentRoute &&
            ((r.route = He(l.route, { modal: r })), (s.currentRoute = r.route)),
          l.history &&
            !l.reloadCurrent &&
            (s.history.push(l.route.url), s.saveHistory())),
        a &&
          (s.removeThemeElements(r.el),
          r.$el.trigger(
            `${e.toLowerCase()}:init ${e.toLowerCase()}:mounted`,
            t,
            r
          ),
          s.emit(`${o}Init ${e}Init ${e}Mounted`, r.el, t, r)),
        r.open(!1 === l.animate || !0 === l.animate ? l.animate : void 0);
    }
    function h(e, t) {
      const { url: r, content: a, component: i, componentUrl: o } = e;
      function l(e) {
        e &&
          ("string" == typeof e
            ? (c.content = e)
            : e.f7Component
            ? e.f7Component.mount((e) => {
                (c.el = e), n.$el.append(e);
              })
            : (c.el = e),
          u());
      }
      if (a) l(a);
      else if (i || o)
        try {
          s.modalComponentLoader({
            rootEl: n.el,
            component: i,
            componentUrl: o,
            options: t,
            resolve: l,
            reject: function () {
              return (s.allowPageChange = !0), s;
            },
          });
        } catch (p) {
          throw ((s.allowPageChange = !0), p);
        }
      else
        r
          ? (s.xhrAbortController &&
              (s.xhrAbortController.abort(), (s.xhrAbortController = !1)),
            s
              .xhrRequest(r, t)
              .then((e) => {
                (c.content = e), u();
              })
              .catch(() => {
                s.allowPageChange = !0;
              }))
          : u();
    }
    let f;
    function m(e, t) {
      h(e, He(l, t));
    }
    function g() {
      s.allowPageChange = !0;
    }
    return (
      "url content component el componentUrl template"
        .split(" ")
        .forEach((e) => {
          c[e] && !f && ((f = !0), h({ [e]: c[e] }, l));
        }),
      f || "actions" !== e || u(),
      c.async &&
        c.async.call(s, {
          router: s,
          to: l.route,
          from: s.currentRoute,
          resolve: m,
          reject: g,
          direction: a,
          app: n,
        }),
      c.asyncComponent && xt(s, c.asyncComponent, m, g),
      s
    );
  }),
  (At.prototype.modalRemove = function (e) {
    He(e, { closeByRouter: !0 }), e.close();
  }),
  (At.prototype.back = function () {
    const e = this,
      t = Qe();
    if (e.swipeBackActive) return e;
    let r, a, s, n;
    "object" == typeof (arguments.length <= 0 ? void 0 : arguments[0])
      ? (a = (arguments.length <= 0 ? void 0 : arguments[0]) || {})
      : ((r = arguments.length <= 0 ? void 0 : arguments[0]),
        (a = (arguments.length <= 1 ? void 0 : arguments[1]) || {}));
    const { name: i, params: o, query: l } = a;
    if (i)
      return (
        (r = e.generateUrl({ name: i, params: o, query: l })),
        r ? e.back(r, He({}, a, { name: null, params: null, query: null })) : e
      );
    const c = e.app;
    Ct(e, "back");
    let p,
      d = e.currentRoute.modal;
    if (
      (d ||
        "popup popover sheet loginScreen actions customModal panel"
          .split(" ")
          .forEach((t) => {
            e.currentRoute.route[t] && ((d = !0), (p = t));
          }),
      d && !a.preload)
    ) {
      const s =
          e.currentRoute.modal ||
          e.currentRoute.route.modalInstance ||
          c[p].get(),
        n = e.history[e.history.length - 2];
      let i;
      if (s && s.$el) {
        const t = s.$el.prevAll(".modal-in");
        if (t.length && t[0].f7Modal) {
          const r = t[0];
          e.$el.parents(r).length || (i = r.f7Modal.route);
        }
      }
      if (
        (i || (i = e.findMatchingRoute(n)),
        !i &&
          n &&
          (i = {
            url: n,
            path: n.split("?")[0],
            query: Le(n),
            route: { path: n.split("?")[0], url: n },
          }),
        !((r && 0 !== r.replace(/[# ]/g, "").trim().length) || (i && s)))
      )
        return e;
      const o = a.force && i && r;
      if (i && s) {
        const n = t.ie || t.edge || (t.firefox && !t.ios),
          l = e.params.browserHistory && !1 !== a.browserHistory,
          c =
            e.currentRoute &&
            e.currentRoute.route &&
            e.currentRoute.route.options &&
            !1 === e.currentRoute.route.options.browserHistory;
        !l || n || c || vt.back(),
          (e.currentRoute = i),
          e.history.pop(),
          e.propsHistory.pop(),
          e.saveHistory(),
          l && n && !c && vt.back(),
          e.modalRemove(s),
          o && e.navigate(r, { reloadCurrent: !0 });
      } else s && (e.modalRemove(s), r && e.navigate(r, { reloadCurrent: !0 }));
      return e;
    }
    let u,
      h = e.$el
        .children(".page-current")
        .prevAll(".page-previous:not(.page-master)")
        .eq(0);
    if (e.params.masterDetailBreakpoint > 0) {
      const t = [];
      e.$el.children(".page").each((e) => {
        t.push(e.className);
      });
      const r = e.$el.children(".page-current").prevAll(".page-master").eq(0);
      if (r.length) {
        const t = e.history[e.history.length - 2],
          s = e.findMatchingRoute(t);
        s &&
          r[0].f7Page &&
          s.route === r[0].f7Page.route.route &&
          ((h = r),
          a.preload || (u = c.width >= e.params.masterDetailBreakpoint));
      }
    }
    if (!a.force && h.length && !u) {
      if (
        e.params.browserHistory &&
        h[0].f7Page &&
        e.history[e.history.length - 2] !== h[0].f7Page.route.url
      )
        return (
          e.back(
            e.history[e.history.length - 2],
            He(a, {
              force: !0,
              props: e.propsHistory[e.propsHistory.length - 2] || {},
            })
          ),
          e
        );
      const t = h[0].f7Page.route;
      return (
        Et.call(
          e,
          t,
          e.currentRoute,
          () => {
            Mt(e, { el: h }, He(a, { route: t }));
          },
          () => {},
          "backward"
        ),
        e
      );
    }
    if (
      ("#" === r && (r = void 0),
      r &&
        "/" !== r[0] &&
        0 !== r.indexOf("#") &&
        (r = ((e.path || "/") + r).replace("//", "/")),
      !r &&
        e.history.length > 1 &&
        ((r = e.history[e.history.length - 2]),
        (s = e.propsHistory[e.propsHistory.length - 2] || {})),
      u && !a.force && e.history[e.history.length - 3])
    )
      return e.back(
        e.history[e.history.length - 3],
        He({}, a || {}, {
          force: !0,
          animate: !1,
          props: e.propsHistory[e.propsHistory.length - 3] || {},
        })
      );
    if (u && !a.force) return e;
    if (
      ((n = e.findMatchingRoute(r)),
      n ||
        (r &&
          (n = {
            url: r,
            path: r.split("?")[0],
            query: Le(r),
            route: { path: r.split("?")[0], url: r },
          })),
      !n)
    )
      return e;
    if (n.route.redirect) return wt.call(e, "backward", n, a);
    const f = {};
    function m() {
      let t = !1;
      function r(t, r) {
        (e.allowPageChange = !1), Mt(e, t, He(f, r), !0);
      }
      function a() {
        e.allowPageChange = !0;
      }
      n.route.keepAlive &&
        n.route.keepAliveData &&
        (Mt(e, { el: n.route.keepAliveData.pageEl }, f), (t = !0)),
        "url content component pageName el componentUrl"
          .split(" ")
          .forEach((r) => {
            n.route[r] && !t && ((t = !0), Mt(e, { [r]: n.route[r] }, f));
          }),
        t ||
          (n.route.async &&
            ((e.allowPageChange = !1),
            n.route.async.call(e, {
              router: e,
              to: n,
              from: e.currentRoute,
              resolve: r,
              reject: a,
              direction: "backward",
              app: c,
            })),
          n.route.asyncComponent && xt(e, n.route.asyncComponent, r, a));
    }
    function g() {
      e.allowPageChange = !0;
    }
    return (
      n.route.options
        ? He(f, n.route.options, a, { props: s || {} })
        : He(f, a, { props: s || {} }),
      (f.route = n),
      f.preload
        ? m()
        : Et.call(
            e,
            n,
            e.currentRoute,
            () => {
              n.route.modules
                ? c
                    .loadModules(
                      Array.isArray(n.route.modules)
                        ? n.route.modules
                        : [n.route.modules]
                    )
                    .then(() => {
                      m();
                    })
                    .catch(() => {
                      g();
                    })
                : m();
            },
            () => {
              g();
            },
            "backward"
          ),
      e
    );
  }),
  (At.prototype.clearPreviousHistory = function () {
    const e = this;
    Ct(e, "clearPreviousHistory");
    const t = e.history[e.history.length - 1];
    !(function (e) {
      Ct(e, "clearPreviousPages");
      const t = e.app,
        r = e.dynamicNavbar;
      e.$el
        .children(".page")
        .filter(
          (t) =>
            !(
              !e.currentRoute ||
              (!e.currentRoute.modal && !e.currentRoute.panel)
            ) || t !== e.currentPageEl
        )
        .each((a) => {
          const s = F(a),
            n = F(t.navbar.getElByPage(s));
          e.pageCallback("beforeRemove", s, n, "previous", void 0, {}),
            e.removePage(s),
            r && n.length && e.removeNavbar(n);
        });
    })(e),
      (e.history = [t]),
      (e.view.history = [t]),
      e.saveHistory();
  });
var $t = At,
  Pt = {
    name: "router",
    static: { Router: $t },
    instance: { cache: { xhr: [], templates: [], components: [] } },
    create() {
      const e = this;
      e.app
        ? e.params.router && (e.router = new $t(e.app, e))
        : (e.router = new $t(e));
    },
  };
function Ot(e) {
  const t = e.app,
    r = Xe();
  if (e.resizableInitialized) return;
  He(e, { resizable: !0, resizableWidth: null, resizableInitialized: !0 });
  const a = F("html"),
    { $el: s } = e;
  if (!s) return;
  let n, i, o;
  const l = {};
  let c, p, d, u;
  function h(e) {
    if (!e) return null;
    if (e.indexOf("%") >= 0 || e.indexOf("vw") >= 0)
      return (parseInt(e, 10) / 100) * t.width;
    const r = parseInt(e, 10);
    return Number.isNaN(r) ? null : r;
  }
  function f(t) {
    if (
      !(
        e.resizable &&
        s.hasClass("view-resizable") &&
        s.hasClass("view-master-detail")
      )
    )
      return;
    (l.x = "touchstart" === t.type ? t.targetTouches[0].pageX : t.pageX),
      (l.y = "touchstart" === t.type ? t.targetTouches[0].pageY : t.pageY),
      (o = !1),
      (i = !0);
    const r = s.children(".page-master");
    (d = h(r.css("min-width"))), (u = h(r.css("max-width")));
  }
  function m(r) {
    if (!i) return;
    r.f7PreventSwipePanel = !0;
    const h = "touchmove" === r.type ? r.targetTouches[0].pageX : r.pageX;
    o ||
      ((p = n[0].offsetLeft + n[0].offsetWidth),
      s.addClass("view-resizing"),
      a.css("cursor", "col-resize")),
      (o = !0),
      r.preventDefault(),
      (c = h - l.x);
    let f = p + c;
    d && !Number.isNaN(d) && (f = Math.max(f, d)),
      u && !Number.isNaN(u) && (f = Math.min(f, u)),
      (f = Math.min(Math.max(f, 0), t.width)),
      (e.resizableWidth = f),
      a[0].style.setProperty("--f7-page-master-width", `${f}px`),
      s.trigger("view:resize", f),
      e.emit("local::resize viewResize", e, f);
  }
  function g() {
    if ((F("html").css("cursor", ""), !i || !o)) return (i = !1), void (o = !1);
    (i = !1),
      (o = !1),
      a[0].style.setProperty("--f7-page-master-width", `${e.resizableWidth}px`),
      s.removeClass("view-resizing");
  }
  function v() {
    e.resizableWidth &&
      ((d = h(n.css("min-width"))),
      (u = h(n.css("max-width"))),
      d &&
        !Number.isNaN(d) &&
        e.resizableWidth < d &&
        (e.resizableWidth = Math.max(e.resizableWidth, d)),
      u &&
        !Number.isNaN(u) &&
        e.resizableWidth > u &&
        (e.resizableWidth = Math.min(e.resizableWidth, u)),
      (e.resizableWidth = Math.min(Math.max(e.resizableWidth, 0), t.width)),
      a[0].style.setProperty(
        "--f7-page-master-width",
        `${e.resizableWidth}px`
      ));
  }
  (n = e.$el.children(".view-resize-handler")),
    n.length ||
      (e.$el.append('<div class="view-resize-handler"></div>'),
      (n = e.$el.children(".view-resize-handler"))),
    (e.$resizeHandlerEl = n),
    s.addClass("view-resizable");
  const b = !!r.passiveListener && { passive: !0 };
  e.$el.on(t.touchEvents.start, ".view-resize-handler", f, b),
    t.on("touchmove:active", m),
    t.on("touchend:passive", g),
    t.on("resize", v),
    e.on("beforeOpen", v),
    e.once("viewDestroy", () => {
      s.removeClass("view-resizable"),
        e.$resizeHandlerEl.remove(),
        e.$el.off(t.touchEvents.start, ".view-resize-handler", f, b),
        t.off("touchmove:active", m),
        t.off("touchend:passive", g),
        t.off("resize", v),
        e.off("beforeOpen", v);
    });
}
class Lt extends Ze {
  constructor(e, t, r) {
    void 0 === r && (r = {}), super(r, [e]);
    const a = this;
    if (!a.params.routerId) {
      if (!F(t).length) {
        let e = "Framework7: can't create a View instance because ";
        throw (
          ((e +=
            "string" == typeof t
              ? `the selector "${t}" didn't match any element`
              : "el must be an HTMLElement or Dom7 object"),
          new Error(e))
        );
      }
    }
    let s;
    return (
      (a.params = He(
        { el: t },
        { routes: [], routesAdd: [] },
        e.params.view,
        r
      )),
      a.params.routes.length > 0
        ? (a.routes = a.params.routes)
        : (a.routes = [].concat(e.routes, a.params.routesAdd)),
      He(!1, a, {
        app: e,
        name: a.params.name,
        main: a.params.main,
        history: [],
        scrollHistory: {},
      }),
      a.useModules(),
      e.views.push(a),
      a.main && (e.views.main = a),
      a.name && (e.views[a.name] = a),
      (a.index = e.views.indexOf(a)),
      (s = a.name
        ? `view_${a.name}`
        : a.main
        ? "view_main"
        : `view_${a.index}`),
      (a.id = s),
      a.params.init
        ? (e.initialized
            ? a.init()
            : e.on("init", () => {
                a.init();
              }),
          a)
        : a
    );
  }
  destroy() {
    let e = this;
    const t = e.app;
    e.$el.trigger("view:beforedestroy"),
      e.emit("local::beforeDestroy viewBeforeDestroy", e),
      t.off("resize", e.checkMasterDetailBreakpoint),
      e.main
        ? ((t.views.main = null), delete t.views.main)
        : e.name && ((t.views[e.name] = null), delete t.views[e.name]),
      (e.$el[0].f7View = null),
      delete e.$el[0].f7View,
      t.views.splice(t.views.indexOf(e), 1),
      e.params.router && e.router && e.router.destroy(),
      e.emit("local::destroy viewDestroy", e),
      Object.keys(e).forEach((t) => {
        (e[t] = null), delete e[t];
      }),
      (e = null);
  }
  checkMasterDetailBreakpoint(e) {
    const t = this,
      r = t.app,
      a = t.$el.hasClass("view-master-detail"),
      s =
        r.width >= t.params.masterDetailBreakpoint &&
        t.$el.children(".page-master").length;
    (void 0 === e && s) || !0 === e
      ? (t.$el.addClass("view-master-detail"),
        a ||
          (t.emit(
            "local::masterDetailBreakpoint viewMasterDetailBreakpoint",
            t
          ),
          t.$el.trigger("view:masterDetailBreakpoint")))
      : (t.$el.removeClass("view-master-detail"),
        a &&
          (t.emit(
            "local::masterDetailBreakpoint viewMasterDetailBreakpoint",
            t
          ),
          t.$el.trigger("view:masterDetailBreakpoint")));
  }
  initMasterDetail() {
    const e = this,
      t = e.app;
    (e.checkMasterDetailBreakpoint = e.checkMasterDetailBreakpoint.bind(e)),
      e.checkMasterDetailBreakpoint(),
      e.params.masterDetailResizable && Ot(e),
      t.on("resize", e.checkMasterDetailBreakpoint);
  }
  mount(e) {
    const t = this,
      r = t.app,
      a = t.params.el || e,
      s = F(a);
    let n, i;
    (n =
      "string" == typeof a
        ? a
        : (s.attr("id") ? `#${s.attr("id")}` : "") +
          (s.attr("class")
            ? `.${s.attr("class").replace(/ /g, ".").replace(".active", "")}`
            : "")),
      "ios" === r.theme &&
        t.params.iosDynamicNavbar &&
        ((i = s.children(".navbars").eq(0)),
        0 === i.length && (i = F('<div class="navbars"></div>'))),
      He(t, {
        $el: s,
        el: s[0],
        main: t.main || s.hasClass("view-main"),
        $navbarsEl: i,
        navbarsEl: i ? i[0] : void 0,
        selector: n,
      }),
      t.main && (r.views.main = t),
      s && s[0] && (s[0].f7View = t),
      t.emit("local::mount viewMount", t);
  }
  init(e) {
    const t = this;
    t.mount(e),
      t.params.router &&
        (t.params.masterDetailBreakpoint > 0 && t.initMasterDetail(),
        t.params.initRouterOnTabShow &&
        t.$el.hasClass("tab") &&
        !t.$el.hasClass("tab-active")
          ? t.$el.once("tab:show", () => {
              t.router.init();
            })
          : t.router.init(),
        t.$el.trigger("view:init"),
        t.emit("local::init viewInit", t));
  }
}
Lt.use(Pt);
var Rt = Lt;
var It = {
    name: "clicks",
    params: { clicks: { externalLinks: ".external" } },
    on: {
      init() {
        !(function (e) {
          e.on("click", function (t) {
            const r = f(),
              a = F(t.target),
              s = a.closest("a"),
              n = s.length > 0,
              i = n && s.attr("href");
            if (
              n &&
              (s.is(e.params.clicks.externalLinks) ||
                (i && i.indexOf("javascript:") >= 0))
            ) {
              const e = s.attr("target");
              return void (i &&
              r.cordova &&
              r.cordova.InAppBrowser &&
              ("_system" === e || "_blank" === e)
                ? (t.preventDefault(), r.cordova.InAppBrowser.open(i, e))
                : i &&
                  r.Capacitor &&
                  r.Capacitor.Plugins &&
                  r.Capacitor.Plugins.Browser &&
                  ("_system" === e || "_blank" === e) &&
                  (t.preventDefault(),
                  r.Capacitor.Plugins.Browser.open({ url: i })));
            }
            Object.keys(e.modules).forEach((r) => {
              const s = e.modules[r].clicks;
              s &&
                (t.preventF7Router ||
                  Object.keys(s).forEach((r) => {
                    const n = a.closest(r).eq(0);
                    n.length > 0 && s[r].call(e, n, n.dataset(), t);
                  }));
            });
            let o = {};
            if (
              (n && (t.preventDefault(), (o = s.dataset())),
              (o.clickedEl = s[0]),
              !t.preventF7Router &&
                !s.hasClass("prevent-router") &&
                !s.hasClass("router-prevent") &&
                ((i && i.length > 0 && "#" !== i[0]) || s.hasClass("back")))
            ) {
              let t;
              if (
                (o.view && "current" === o.view
                  ? (t = e.views.current)
                  : o.view
                  ? (t = F(o.view)[0].f7View)
                  : ((t =
                      a.parents(".view")[0] && a.parents(".view")[0].f7View),
                    !s.hasClass("back") &&
                      t &&
                      t.params.linksView &&
                      ("string" == typeof t.params.linksView
                        ? (t = F(t.params.linksView)[0].f7View)
                        : t.params.linksView instanceof Rt &&
                          (t = t.params.linksView))),
                t || (e.views.main && (t = e.views.main)),
                !t || !t.router)
              )
                return;
              s[0].f7RouteProps && (o.props = s[0].f7RouteProps),
                s.hasClass("back")
                  ? t.router.back(i, o)
                  : t.router.navigate(i, o);
            }
          });
        })(this);
      },
    },
  },
  zt = {
    name: "routerComponentLoader",
    proto: {
      openIn(e, t, r) {
        const a = {
            url: t,
            route: { path: t, options: l(o({}, r), { openIn: void 0 }) },
          },
          s = o({}, r);
        if (
          ("popup" === r.openIn &&
            ((s.content = `<div class="popup popup-router-open-in" data-url="${t}"><div class="view view-init" data-links-view="${e.view.selector}" data-url="${t}" data-ignore-open-in="true"></div></div>`),
            (a.route.popup = s)),
          "loginScreen" === r.openIn &&
            ((s.content = `<div class="login-screen login-screen-router-open-in" data-url="${t}"><div class="view view-init" data-links-view="${e.view.selector}" data-url="${t}" data-ignore-open-in="true"></div></div>`),
            (a.route.loginScreen = s)),
          "sheet" === r.openIn &&
            ((s.content = `<div class="sheet-modal sheet-modal-router-open-in" data-url="${t}"><div class="sheet-modal-inner"><div class="view view-init" data-links-view="${e.view.selector}" data-url="${t}" data-ignore-open-in="true"></div></div></div>`),
            (a.route.sheet = s)),
          "popover" === r.openIn &&
            ((s.targetEl = r.clickedEl || r.targetEl),
            (s.content = `<div class="popover popover-router-open-in" data-url="${t}"><div class="popover-inner"><div class="view view-init" data-links-view="${e.view.selector}" data-url="${t}" data-ignore-open-in="true"></div></div></div>`),
            (a.route.popover = s)),
          r.openIn.indexOf("panel") >= 0)
        ) {
          const n = r.openIn.split(":"),
            i = n[1] || "left",
            o = n[2] || "cover";
          (s.targetEl = r.clickedEl || r.targetEl),
            (s.content = `<div class="panel panel-router-open-in panel-${i} panel-${o}" data-url="${t}"><div class="view view-init" data-links-view="${e.view.selector}" data-url="${t}" data-ignore-open-in="true"></div></div>`),
            (a.route.panel = s);
        }
        return e.navigate(a);
      },
      componentLoader(e, t, r, a, s) {
        void 0 === r && (r = {});
        const n = this,
          { app: i } = n,
          o = "string" == typeof e ? e : t,
          l = n.replaceRequestUrlParams(o, r);
        function c(e) {
          let t = r.context || {};
          if ("function" == typeof t) t = t.call(n);
          else if ("string" == typeof t)
            try {
              t = JSON.parse(t);
            } catch (d) {
              throw (s(d), d);
            }
          const o = Be({}, t, { f7route: r.route, f7router: n }),
            l = Be(
              (r.route && r.route.params) || {},
              r.props || {},
              r.routeProps || {}
            );
          let c, p;
          r.componentOptions &&
            r.componentOptions.el &&
            (c = r.componentOptions.el),
            r.componentOptions &&
              r.componentOptions.root &&
              (p = r.componentOptions.root),
            i.component
              .create(e, l, { context: o, el: c, root: p })
              .then((e) => {
                a(e.el);
              })
              .catch((e) => {
                throw (s(e), new Error(e));
              });
        }
        let p;
        l &&
          n.params.componentCache &&
          n.cache.components.forEach((e) => {
            e.url === l && (p = e.component);
          }),
          l && p
            ? c(p)
            : l && !p
            ? (n.xhrAbortController &&
                (n.xhrAbortController.abort(), (n.xhrAbortController = !1)),
              n
                .xhrRequest(o, r)
                .then((e) => {
                  const t = i.component.parse(e);
                  n.params.componentCache &&
                    n.cache.components.push({ url: l, component: t }),
                    c(t);
                })
                .catch((e) => {
                  throw (s(), e);
                }))
            : c(e);
      },
      modalComponentLoader(e) {
        let {
          component: t,
          componentUrl: r,
          options: a,
          resolve: s,
          reject: n,
        } = void 0 === e ? {} : e;
        this.componentLoader(
          t,
          r,
          a,
          (e) => {
            s(e);
          },
          n
        );
      },
      tabComponentLoader(e) {
        let {
          component: t,
          componentUrl: r,
          options: a,
          resolve: s,
          reject: n,
        } = void 0 === e ? {} : e;
        this.componentLoader(
          t,
          r,
          a,
          (e) => {
            s(e);
          },
          n
        );
      },
      pageComponentLoader(e) {
        let {
          component: t,
          componentUrl: r,
          options: a,
          resolve: s,
          reject: n,
        } = void 0 === e ? {} : e;
        this.componentLoader(
          t,
          r,
          a,
          function (e, t) {
            void 0 === t && (t = {}), s(e, t);
          },
          n
        );
      },
    },
  },
  Bt = function (e, t, r, a) {
    var s;
    t[0] = 0;
    for (var n = 1; n < t.length; n++) {
      var i = t[n++],
        o = t[n] ? ((t[0] |= i ? 1 : 2), r[t[n++]]) : t[++n];
      3 === i
        ? (a[0] = o)
        : 4 === i
        ? (a[1] = Object.assign(a[1] || {}, o))
        : 5 === i
        ? ((a[1] = a[1] || {})[t[++n]] = o)
        : 6 === i
        ? (a[1][t[++n]] += o + "")
        : i
        ? ((s = e.apply(o, Bt(e, o, r, ["", null]))),
          a.push(s),
          o[0] ? (t[0] |= 2) : ((t[n - 2] = 0), (t[n] = s)))
        : a.push(o);
    }
    return a;
  },
  Ht = new Map();
const Dt = [!1, null, "", void 0];
var Nt = function (e) {
  var t = Ht.get(this);
  return (
    t || ((t = new Map()), Ht.set(this, t)),
    (t = Bt(
      this,
      t.get(e) ||
        (t.set(
          e,
          (t = (function (e) {
            for (
              var t,
                r,
                a = 1,
                s = "",
                n = "",
                i = [0],
                o = function (e) {
                  1 === a && (e || (s = s.replace(/^\s*\n\s*|\s*\n\s*$/g, "")))
                    ? i.push(0, e, s)
                    : 3 === a && (e || s)
                    ? (i.push(3, e, s), (a = 2))
                    : 2 === a && "..." === s && e
                    ? i.push(4, e, 0)
                    : 2 === a && s && !e
                    ? i.push(5, 0, !0, s)
                    : a >= 5 &&
                      ((s || (!e && 5 === a)) && (i.push(a, 0, s, r), (a = 6)),
                      e && (i.push(a, e, 0, r), (a = 6))),
                    (s = "");
                },
                l = 0;
              l < e.length;
              l++
            ) {
              l && (1 === a && o(), o(l));
              for (var c = 0; c < e[l].length; c++)
                (t = e[l][c]),
                  1 === a
                    ? "<" === t
                      ? (o(), (i = [i]), (a = 3))
                      : (s += t)
                    : 4 === a
                    ? "--" === s && ">" === t
                      ? ((a = 1), (s = ""))
                      : (s = t + s[0])
                    : n
                    ? t === n
                      ? (n = "")
                      : (s += t)
                    : '"' === t || "'" === t
                    ? (n = t)
                    : ">" === t
                    ? (o(), (a = 1))
                    : a &&
                      ("=" === t
                        ? ((a = 5), (r = s), (s = ""))
                        : "/" === t && (a < 5 || ">" === e[l][c + 1])
                        ? (o(),
                          3 === a && (i = i[0]),
                          (a = i),
                          (i = i[0]).push(2, 0, a),
                          (a = 0))
                        : " " === t || "\t" === t || "\n" === t || "\r" === t
                        ? (o(), (a = 2))
                        : (s += t)),
                  3 === a && "!--" === s && ((a = 4), (i = i[0]));
            }
            return o(), i;
          })(e))
        ),
        t),
      arguments,
      []
    )).length > 1
      ? t
      : t[0]
  );
}.bind(function (e, t) {
  for (
    var r = arguments.length, a = new Array(r > 2 ? r - 2 : 0), s = 2;
    s < r;
    s++
  )
    a[s - 2] = arguments[s];
  return {
    type: e,
    props: t || {},
    children: Ye(a.filter((e) => Dt.indexOf(e) < 0)),
  };
});
function _t(e, t, r, a, s) {
  return {
    sel: e,
    data: t,
    children: r,
    text: a,
    elm: s,
    key: void 0 === t ? void 0 : t.key,
  };
}
var jt = Array.isArray;
function qt(e) {
  return "string" == typeof e || "number" == typeof e;
}
function Vt(e, t, r) {
  if (
    ((e.ns = "http://www.w3.org/2000/svg"),
    "foreignObject" !== r && void 0 !== t)
  )
    for (var a = 0; a < t.length; ++a) {
      var s = t[a].data;
      void 0 !== s && Vt(s, t[a].children, t[a].sel);
    }
}
function Ft(e, t, r) {
  var a,
    s,
    n,
    i = {};
  if (
    (void 0 !== r
      ? ((i = t), jt(r) ? (a = r) : qt(r) ? (s = r) : r && r.sel && (a = [r]))
      : void 0 !== t &&
        (jt(t) ? (a = t) : qt(t) ? (s = t) : t && t.sel ? (a = [t]) : (i = t)),
    jt(a))
  )
    for (n = 0; n < a.length; ++n)
      qt(a[n]) && (a[n] = _t(void 0, void 0, void 0, a[n], void 0));
  return (
    "s" !== e[0] ||
      "v" !== e[1] ||
      "g" !== e[2] ||
      (3 !== e.length && "." !== e[3] && "#" !== e[3]) ||
      Vt(i, a, e),
    _t(e, i, a, s, void 0)
  );
}
var Yt = {};
const Gt =
    "area base br col command embed hr img input keygen link menuitem meta param source track wbr".split(
      " "
    ),
  Wt =
    "hidden checked disabled readonly selected autofocus autoplay required multiple value indeterminate routeProps innerHTML".split(
      " "
    ),
  Ut =
    "hidden checked disabled readonly selected autofocus autoplay required multiple readOnly indeterminate".split(
      " "
    ),
  Xt = (e) =>
    "function" == typeof e.type ? e.type.name || "CustomComponent" : e.type,
  Qt = (e) =>
    e
      .split("-")
      .map((e, t) =>
        0 === t ? e.toLowerCase() : e[0].toUpperCase() + e.substr(1)
      )
      .join(""),
  Kt = function () {
    const e = {};
    for (var t = arguments.length, r = new Array(t), a = 0; a < t; a++)
      r[a] = arguments[a];
    return (
      r.forEach(function (t) {
        void 0 === t && (t = {}),
          Object.keys(t).forEach((r) => {
            e[Qt(r)] = t[r];
          });
      }),
      e
    );
  },
  Zt = (e) => "function" == typeof e || (e && e.indexOf("-") > 0 && Yt[e]);
function Jt(e, t, r, a, s) {
  const n = {},
    i = [],
    o = [],
    l = [],
    c = [];
  let p = !1,
    d = Xt(e);
  t &&
    t.attrs &&
    t.attrs.component &&
    ((d = t.attrs.component), delete t.attrs.component, (p = !0));
  const u = Zt(e.type);
  if (
    (u &&
      (i.push((a) => {
        (a.sel === d || p) &&
          ((e) => {
            let { f7: t, treeNode: r, vnode: a, data: s } = e;
            const n = "function" == typeof r.type ? r.type : Yt[r.type];
            t.component
              .create(n, Kt(s.attrs || {}, s.props || {}), {
                el: a.elm,
                children: r.children,
              })
              .then((e) => {
                a.data &&
                  a.data.on &&
                  e &&
                  e.$el &&
                  Object.keys(a.data.on).forEach((t) => {
                    e.$el.on(t, a.data.on[t]);
                  }),
                  (a.elm.__component__ = e);
              });
          })({ f7: r, treeNode: e, vnode: a, data: t });
      }),
      o.push((e) => {
        ((e) => {
          const t = e && e.elm && e.elm.__component__;
          if (t) {
            const { el: r, $el: a } = t;
            e.data &&
              e.data.on &&
              a &&
              Object.keys(e.data.on).forEach((t) => {
                a.off(t, e.data.on[t]);
              }),
              t.destroy && t.destroy(),
              r && r.parentNode && r.parentNode.removeChild(r),
              delete e.elm.__component__;
          }
        })(e);
      }),
      l.push((e, t) => {
        ((e) => {
          const t = e && e.elm && e.elm.__component__;
          if (!t) return;
          const r = Kt(e.data.attrs || {}, e.data.props || {});
          (t.children = e.data.treeNode.children),
            Object.assign(t.props, r),
            t.update();
        })(t);
      })),
    !u)
  ) {
    if (!t || !t.attrs || !t.attrs.class) return n;
    t.attrs.class.split(" ").forEach((e) => {
      a || i.push(...r.getVnodeHooks("insert", e)),
        o.push(...r.getVnodeHooks("destroy", e)),
        l.push(...r.getVnodeHooks("update", e)),
        c.push(...r.getVnodeHooks("postpatch", e));
    });
  }
  return (
    s &&
      !a &&
      c.push((e, t) => {
        const r = t || e;
        r && r.data && r.data.component && r.data.component.hook("onUpdated");
      }),
    (0 === i.length && 0 === o.length && 0 === l.length && 0 === c.length) ||
      (i.length &&
        (n.insert = (e) => {
          i.forEach((t) => t(e));
        }),
      o.length &&
        (n.destroy = (e) => {
          o.forEach((t) => t(e));
        }),
      l.length &&
        (n.update = (e, t) => {
          l.forEach((r) => r(e, t));
        }),
      c.length &&
        (n.postpatch = (e, t) => {
          c.forEach((r) => r(e, t));
        })),
    n
  );
}
const er = (e, t, r, a) => {
    if (e && e.type && Gt.indexOf(e.type) >= 0) return [];
    const s = [],
      n = e.children;
    for (let i = 0; i < n.length; i += 1) {
      const e = n[i],
        o = tr(e, t, r, a, !1);
      Array.isArray(o) ? s.push(...o) : o && s.push(o);
    }
    return s;
  },
  tr = (e, t, r, a, s) => {
    if (!((e) => ze(e) && "props" in e && "type" in e && "children" in e)(e))
      return String(e);
    if ("slot" === e.type)
      return ((e, t, r, a) => {
        const s = e.props.name || "default",
          n = (t.children || []).filter((e) => {
            let t = "default";
            return e.props && (t = e.props.slot || "default"), t === s;
          });
        return 0 === n.length ? er(e, t, r, a) : n.map((e) => tr(e, t, r, a));
      })(e, t, r, a);
    const n = ((e, t, r, a, s) => {
        const n = { component: t, treeNode: e },
          i = Xt(e);
        Object.keys(e.props).forEach((t) => {
          const r = e.props[t];
          if (void 0 !== r)
            if (Wt.indexOf(t) >= 0)
              n.props || (n.props = {}),
                "readonly" === t && (t = "readOnly"),
                "routeProps" === t && (t = "f7RouteProps"),
                "option" === i &&
                  "value" === t &&
                  (n.attrs || (n.attrs = {}), (n.attrs.value = r)),
                Ut.indexOf(t) >= 0 ? (n.props[t] = !1 !== r) : (n.props[t] = r);
            else if ("key" === t) n.key = r;
            else if (
              0 === t.indexOf("@") ||
              (0 === t.indexOf("on") && t.length > 2)
            ) {
              n.on || (n.on = {});
              let e = 0 === t.indexOf("@") ? t.substr(1) : Te(t.substr(2)),
                a = !1,
                s = !1,
                i = !1;
              e.indexOf(".") >= 0 &&
                e.split(".").forEach((t, r) => {
                  0 === r
                    ? (e = t)
                    : ("stop" === t && (a = !0),
                      "prevent" === t && (s = !0),
                      "once" === t && (i = !0));
                }),
                (n.on[e] = (function (e, t) {
                  let { stop: r, prevent: a, once: s } = void 0 === t ? {} : t,
                    n = !1;
                  return function () {
                    const t = arguments.length <= 0 ? void 0 : arguments[0];
                    (s && n) ||
                      (r && t.stopPropagation(),
                      a && t.preventDefault(),
                      (n = !0),
                      e(...arguments));
                  };
                })(r, { stop: a, prevent: s, once: i }));
            } else
              "style" === t
                ? "string" != typeof r
                  ? (n.style = r)
                  : (n.attrs || (n.attrs = {}), (n.attrs.style = r))
                : (n.attrs || (n.attrs = {}),
                  (n.attrs[t] = r),
                  "id" !== t || n.key || s || (n.key = r));
        });
        const o = Jt(e, n, r, a, s);
        return (
          (o.prepatch = (e, t) => {
            e &&
              t &&
              e &&
              e.data &&
              e.data.props &&
              Object.keys(e.data.props).forEach((r) => {
                Ut.indexOf(r) < 0 ||
                  (t.data || (t.data = {}),
                  t.data.props || (t.data.props = {}),
                  !0 !== e.data.props[r] ||
                    r in t.data.props ||
                    (t.data.props[r] = !1));
              });
          }),
          (n.hook = o),
          n
        );
      })(e, t, r, a, s),
      i = Zt(e.type) ? [] : er(e, t, r, a);
    return Ft(Xt(e), n, i);
  };
function rr(e, t, r) {
  return void 0 === e && (e = {}), tr(e, t, t.f7, r, !0);
}
var ar = {
  createElement: function (e) {
    return document.createElement(e);
  },
  createElementNS: function (e, t) {
    return document.createElementNS(e, t);
  },
  createTextNode: function (e) {
    return document.createTextNode(e);
  },
  createComment: function (e) {
    return document.createComment(e);
  },
  insertBefore: function (e, t, r) {
    r && r.parentNode !== e && r.__component__ && (r = r.__component__.el),
      e.insertBefore(t, r);
  },
  removeChild: function (e, t) {
    e && e.removeChild(t);
  },
  appendChild: function (e, t) {
    e.appendChild(t);
  },
  parentNode: function (e) {
    return e.parentNode;
  },
  nextSibling: function (e) {
    return e.nextSibling;
  },
  tagName: function (e) {
    return e.tagName;
  },
  setTextContent: function (e, t) {
    e.textContent = t;
  },
  getTextContent: function (e) {
    return e.textContent;
  },
  isElement: function (e) {
    return 1 === e.nodeType;
  },
  isText: function (e) {
    return 3 === e.nodeType;
  },
  isComment: function (e) {
    return 8 === e.nodeType;
  },
};
function sr(e) {
  return void 0 === e;
}
function nr(e) {
  return void 0 !== e;
}
var ir = _t("", {}, [], void 0, void 0);
function or(e, t) {
  return e.key === t.key && e.sel === t.sel;
}
function lr(e, t, r) {
  var a,
    s,
    n,
    i = {};
  for (a = t; a <= r; ++a)
    null != (n = e[a]) && void 0 !== (s = n.key) && (i[s] = a);
  return i;
}
var cr = ["create", "update", "remove", "destroy", "pre", "post"];
function pr(e, t) {
  var r,
    a = t.elm,
    s = e.data.attrs,
    n = t.data.attrs;
  if ((s || n) && s !== n) {
    for (r in ((s = s || {}), (n = n || {}))) {
      var i = n[r];
      s[r] !== i &&
        (!0 === i
          ? a.setAttribute(r, "")
          : !1 === i
          ? a.removeAttribute(r)
          : 120 !== r.charCodeAt(0)
          ? a.setAttribute(r, i)
          : 58 === r.charCodeAt(3)
          ? a.setAttributeNS("http://www.w3.org/XML/1998/namespace", r, i)
          : 58 === r.charCodeAt(5)
          ? a.setAttributeNS("http://www.w3.org/1999/xlink", r, i)
          : a.setAttribute(r, i));
    }
    for (r in s) r in n || a.removeAttribute(r);
  }
}
var dr = { create: pr, update: pr };
function ur(e, t) {
  var r,
    a,
    s = t.elm,
    n = e.data.props,
    i = t.data.props;
  if ((n || i) && n !== i) {
    for (r in ((i = i || {}), (n = n || {}))) i[r] || delete s[r];
    for (r in i)
      (a = i[r]), n[r] === a || ("value" === r && s[r] === a) || (s[r] = a);
  }
}
var hr = { create: ur, update: ur },
  fr =
    ("undefined" != typeof window && window.requestAnimationFrame) ||
    setTimeout;
function mr(e, t, r) {
  var a;
  (a = function () {
    e[t] = r;
  }),
    fr(function () {
      fr(a);
    });
}
function gr(e, t) {
  var r,
    a,
    s = t.elm,
    n = e.data.style,
    i = t.data.style;
  if ((n || i) && n !== i) {
    i = i || {};
    var o = "delayed" in (n = n || {});
    for (a in n)
      i[a] ||
        ("-" === a[0] && "-" === a[1]
          ? s.style.removeProperty(a)
          : (s.style[a] = ""));
    for (a in i)
      if (((r = i[a]), "delayed" === a && i.delayed))
        for (var l in i.delayed)
          (r = i.delayed[l]), (o && r === n.delayed[l]) || mr(s.style, l, r);
      else
        "remove" !== a &&
          r !== n[a] &&
          ("-" === a[0] && "-" === a[1]
            ? s.style.setProperty(a, r)
            : (s.style[a] = r));
  }
}
function vr(e, t, r) {
  const a = e.type,
    s = r.data.on;
  s &&
    s[a] &&
    (function (e, t, r) {
      "function" == typeof e && e(t, ...r);
    })(s[a], e, t);
}
function br(e, t) {
  const r = e.data.on,
    a = e.listener,
    s = e.elm,
    n = t && t.data.on,
    i = t && t.elm;
  if (
    r !== n &&
    (r &&
      a &&
      (n
        ? Object.keys(r).forEach((e) => {
            n[e] || F(s).off(e, a);
          })
        : Object.keys(r).forEach((e) => {
            F(s).off(e, a);
          })),
    n)
  ) {
    const a =
      e.listener ||
      function e(t) {
        for (
          var r = arguments.length, a = new Array(r > 1 ? r - 1 : 0), s = 1;
          s < r;
          s++
        )
          a[s - 1] = arguments[s];
        vr(t, a, e.vnode);
      };
    (t.listener = a),
      (a.vnode = t),
      r
        ? Object.keys(n).forEach((e) => {
            r[e] || F(i).on(e, a);
          })
        : Object.keys(n).forEach((e) => {
            F(i).on(e, a);
          });
  }
}
var wr = (function (e, t) {
  var r,
    a,
    s = {},
    n = void 0 !== t ? t : ar;
  for (r = 0; r < cr.length; ++r)
    for (s[cr[r]] = [], a = 0; a < e.length; ++a) {
      var i = e[a][cr[r]];
      void 0 !== i && s[cr[r]].push(i);
    }
  function o(e, t) {
    return function () {
      if (0 == --t) {
        var r = n.parentNode(e);
        n.removeChild(r, e);
      }
    };
  }
  function l(e, t) {
    var r,
      a = e.data;
    void 0 !== a &&
      nr((r = a.hook)) &&
      nr((r = r.init)) &&
      (r(e), (a = e.data));
    var i = e.children,
      o = e.sel;
    if ("!" === o)
      sr(e.text) && (e.text = ""), (e.elm = n.createComment(e.text));
    else if (void 0 !== o) {
      var c = o.indexOf("#"),
        p = o.indexOf(".", c),
        d = c > 0 ? c : o.length,
        u = p > 0 ? p : o.length,
        h = -1 !== c || -1 !== p ? o.slice(0, Math.min(d, u)) : o,
        f = (e.elm =
          nr(a) && nr((r = a.ns))
            ? n.createElementNS(r, h)
            : n.createElement(h));
      for (
        d < u && f.setAttribute("id", o.slice(d + 1, u)),
          p > 0 && f.setAttribute("class", o.slice(u + 1).replace(/\./g, " ")),
          r = 0;
        r < s.create.length;
        ++r
      )
        s.create[r](ir, e);
      if (jt(i))
        for (r = 0; r < i.length; ++r) {
          var m = i[r];
          null != m && n.appendChild(f, l(m, t));
        }
      else qt(e.text) && n.appendChild(f, n.createTextNode(e.text));
      nr((r = e.data.hook)) &&
        (r.create && r.create(ir, e), r.insert && t.push(e));
    } else e.elm = n.createTextNode(e.text);
    return e.elm;
  }
  function c(e, t, r, a, s, i) {
    for (; a <= s; ++a) {
      var o = r[a];
      null != o && n.insertBefore(e, l(o, i), t);
    }
  }
  function p(e) {
    var t,
      r,
      a = e.data;
    if (void 0 !== a) {
      for (
        nr((t = a.hook)) && nr((t = t.destroy)) && t(e), t = 0;
        t < s.destroy.length;
        ++t
      )
        s.destroy[t](e);
      if (void 0 !== e.children)
        for (r = 0; r < e.children.length; ++r)
          null != (t = e.children[r]) && "string" != typeof t && p(t);
    }
  }
  function d(e, t, r, a) {
    for (; r <= a; ++r) {
      var i = void 0,
        l = void 0,
        c = void 0,
        d = t[r];
      if (null != d)
        if (nr(d.sel)) {
          for (
            p(d), l = s.remove.length + 1, c = o(d.elm, l), i = 0;
            i < s.remove.length;
            ++i
          )
            s.remove[i](d, c);
          nr((i = d.data)) && nr((i = i.hook)) && nr((i = i.remove))
            ? i(d, c)
            : c();
        } else n.removeChild(e, d.elm);
    }
  }
  function u(e, t, r) {
    var a, i;
    nr((a = t.data)) && nr((i = a.hook)) && nr((a = i.prepatch)) && a(e, t);
    var o = (t.elm = e.elm),
      p = e.children,
      h = t.children;
    if (e !== t) {
      if (void 0 !== t.data) {
        for (a = 0; a < s.update.length; ++a) s.update[a](e, t);
        nr((a = t.data.hook)) && nr((a = a.update)) && a(e, t);
      }
      sr(t.text)
        ? nr(p) && nr(h)
          ? p !== h &&
            (function (e, t, r, a) {
              for (
                var s,
                  i,
                  o,
                  p = 0,
                  h = 0,
                  f = t.length - 1,
                  m = t[0],
                  g = t[f],
                  v = r.length - 1,
                  b = r[0],
                  w = r[v];
                p <= f && h <= v;

              )
                null == m
                  ? (m = t[++p])
                  : null == g
                  ? (g = t[--f])
                  : null == b
                  ? (b = r[++h])
                  : null == w
                  ? (w = r[--v])
                  : or(m, b)
                  ? (u(m, b, a), (m = t[++p]), (b = r[++h]))
                  : or(g, w)
                  ? (u(g, w, a), (g = t[--f]), (w = r[--v]))
                  : or(m, w)
                  ? (u(m, w, a),
                    n.insertBefore(e, m.elm, n.nextSibling(g.elm)),
                    (m = t[++p]),
                    (w = r[--v]))
                  : or(g, b)
                  ? (u(g, b, a),
                    n.insertBefore(e, g.elm, m.elm),
                    (g = t[--f]),
                    (b = r[++h]))
                  : (void 0 === s && (s = lr(t, p, f)),
                    sr((i = s[b.key]))
                      ? (n.insertBefore(e, l(b, a), m.elm), (b = r[++h]))
                      : ((o = t[i]).sel !== b.sel
                          ? n.insertBefore(e, l(b, a), m.elm)
                          : (u(o, b, a),
                            (t[i] = void 0),
                            n.insertBefore(e, o.elm, m.elm)),
                        (b = r[++h])));
              (p <= f || h <= v) &&
                (p > f
                  ? c(e, null == r[v + 1] ? null : r[v + 1].elm, r, h, v, a)
                  : d(e, t, p, f));
            })(o, p, h, r)
          : nr(h)
          ? (nr(e.text) && n.setTextContent(o, ""),
            c(o, null, h, 0, h.length - 1, r))
          : nr(p)
          ? d(o, p, 0, p.length - 1)
          : nr(e.text) && n.setTextContent(o, "")
        : e.text !== t.text && n.setTextContent(o, t.text),
        nr(i) && nr((a = i.postpatch)) && a(e, t);
    }
  }
  return function (e, t) {
    var r,
      a,
      i,
      o = [];
    for (r = 0; r < s.pre.length; ++r) s.pre[r]();
    for (
      (function (e) {
        return void 0 !== e.sel;
      })(e) ||
        (e = (function (e) {
          var t = e.id ? "#" + e.id : "",
            r = e.className ? "." + e.className.split(" ").join(".") : "";
          return _t(n.tagName(e).toLowerCase() + t + r, {}, [], void 0, e);
        })(e)),
        or(e, t)
          ? u(e, t, o)
          : ((a = e.elm),
            (i = n.parentNode(a)),
            l(t, o),
            null !== i &&
              (n.insertBefore(i, t.elm, n.nextSibling(a)), d(i, [e], 0, 0))),
        r = 0;
      r < o.length;
      ++r
    )
      o[r].data.hook.insert(o[r]);
    for (r = 0; r < s.post.length; ++r) s.post[r]();
    return t;
  };
})([
  dr,
  hr,
  {
    create: gr,
    update: gr,
    destroy: function (e) {
      var t,
        r,
        a = e.elm,
        s = e.data.style;
      if (s && (t = s.destroy)) for (r in t) a.style[r] = t[r];
    },
    remove: function (e, t) {
      var r = e.data.style;
      if (r && r.remove) {
        var a,
          s = e.elm,
          n = 0,
          i = r.remove,
          o = 0,
          l = [];
        for (a in i) l.push(a), (s.style[a] = i[a]);
        for (
          var c = getComputedStyle(s)["transition-property"].split(", ");
          n < c.length;
          ++n
        )
          -1 !== l.indexOf(c[n]) && o++;
        s.addEventListener("transitionend", function (e) {
          e.target === s && --o, 0 === o && t();
        });
      } else t();
    },
  },
  { create: br, update: br, destroy: br },
]);
const yr = [!1, null, "", void 0];
var Er = function (e, t) {
  for (
    var r = arguments.length, a = new Array(r > 2 ? r - 2 : 0), s = 2;
    s < r;
    s++
  )
    a[s - 2] = arguments[s];
  const n = Ye((a || []).filter((e) => yr.indexOf(e) < 0));
  return "Fragment" === e ? n : { type: e, props: t || {}, children: n };
};
const Cr = [
  {
    name: "array",
    init: (e) => e,
    type: (e) => [e].find(Array.isArray),
    update: (e, t) =>
      [t].filter(Array.isArray).find(() => ((e.length = 0), e.push(...t))),
    insert: function (e, t, r) {
      return (
        void 0 === r && (r = []), e.splice(Math.max(t, 0), 0, ...[r].flat())
      );
    },
    replace: function (e, t, r) {
      return (
        void 0 === r && (r = []),
        e.splice(Math.max(t, 0), Math.min(++t, 1), ...[r].flat())
      );
    },
    append: function (e, t) {
      return void 0 === t && (t = []), e.push(...[t].flat());
    },
    prepend: function (e, t) {
      return void 0 === t && (t = []), e.unshift(...[t].flat());
    },
    swap: (e, t, r) => {
      [e[t], e[r]] = [e[r], e[t]];
    },
    fromTo: function (e, t, r) {
      return (
        void 0 === r && (r = t),
        e.splice(Math.max(r, 0), 0, ...e.splice(Math.max(t, 0), 1))
      );
    },
    remove: function (e, t, r) {
      return (
        void 0 === r && (r = e.map((e, t) => t)),
        [t]
          .flat()
          .filter((e) => r.includes(e))
          .sort((e, t) => t - e)
          .forEach((t) => e.splice(t, 1))
      );
    },
    clear: (e) => (e.length = 0),
  },
  {
    name: "object",
    init: (e) => e,
    type: (e) =>
      [e]
        .filter((e) => [null !== e, void 0 !== e].every((e) => e))
        .find((e) => Object.getPrototypeOf(e) === Object.prototype),
    update: (e, t) => Object.assign(e, t),
    insert: () => {},
    replace: () => {},
    append: () => {},
    prepend: () => {},
    swap: () => ({}),
    fromTo: () => ({}),
    remove: (e, t) => [t].flat().forEach((t) => delete e[t]),
    clear: (e) => Object.keys(e).forEach((t) => delete e[t]),
  },
  {
    name: "atoms",
    type: () => !0,
    init: function (e, t) {
      return (
        void 0 === t && (t = {}),
        Object.defineProperty(t, "value", {
          get: () => e,
          set: (t) => {
            e = t;
          },
        }),
        t
      );
    },
    update: function (e, t) {
      void 0 === t && (t = e.value), (e.value = t);
    },
    insert: () => ({}),
    replace: () => ({}),
    append: () => ({}),
    prepend: () => ({}),
    swap: () => ({}),
    fromTo: () => ({}),
    remove: () => ({}),
    clear: (e) => {
      e.value = void 0;
    },
  },
];
class xr {
  constructor(e, t, r, a) {
    void 0 === r && (r = {});
    let { el: s, context: n, children: i } = void 0 === a ? {} : a;
    const o = u();
    Be(this, {
      f7: e,
      props: r || {},
      context: n || {},
      id: t.id || xe(),
      children: i || [],
      theme: { ios: "ios" === e.theme, md: "md" === e.theme },
      style: t.style,
      __updateQueue: [],
      __eventHandlers: [],
      __onceEventHandlers: [],
      __onBeforeMount: [],
      __onMounted: [],
      __onBeforeUpdate: [],
      __onUpdated: [],
      __onBeforeUnmount: [],
      __onUnmounted: [],
    });
    const l = () => t(this.props, this.getComponentContext(!0));
    return new Promise((e, t) => {
      ((e) =>
        new Promise((t, r) => {
          "function" == typeof e
            ? t(e)
            : e instanceof Promise
            ? e
                .then((e) => {
                  t(e);
                })
                .catch((e) => {
                  r(e);
                })
            : r(
                new Error(
                  'Framework7: Component render function is not a "function" type. Didn\'t you forget to "return $render"?'
                )
              );
        }))(l())
        .then((t) => {
          this.renderFunction = t;
          const r = this.render();
          if (s)
            return (
              (this.vnode = rr(r, this, !0)),
              this.style &&
                ((this.styleEl = o.createElement("style")),
                (this.styleEl.innerHTML = this.style)),
              (this.el = s),
              wr(this.el, this.vnode),
              (this.el = this.vnode.elm),
              (this.$el = F(this.el)),
              this.attachEvents(),
              (this.el.f7Component = this),
              this.mount(),
              void e(this)
            );
          r &&
            ((this.vnode = rr(r, this, !0)),
            (this.el = o.createElement(this.vnode.sel || "div")),
            wr(this.el, this.vnode),
            (this.$el = F(this.el))),
            this.style &&
              ((this.styleEl = o.createElement("style")),
              (this.styleEl.innerHTML = this.style)),
            this.attachEvents(),
            this.el && (this.el.f7Component = this),
            e(this);
        })
        .catch((e) => {
          t(e);
        });
    });
  }
  on(e, t) {
    this.__eventHandlers &&
      this.__eventHandlers.push({ eventName: e, handler: t });
  }
  once(e, t) {
    this.__eventHandlers &&
      this.__onceEventHandlers.push({ eventName: e, handler: t });
  }
  getComponentRef() {
    const e = this;
    return (t) => {
      let r = t;
      const a = {};
      return (
        Object.defineProperty(a, "value", {
          get: () => r,
          set(t) {
            (r = t), e.update();
          },
        }),
        a
      );
    };
  }
  getComponentStore() {
    const { state: e, _gettersPlain: t, dispatch: r } = this.f7.store,
      a = { state: e, dispatch: r };
    return (
      (a.getters = new Proxy(t, {
        get: (e, t) => {
          const r = e[t];
          return (
            r.onUpdated((e) => {
              (r.value = e), this.update();
            }),
            r
          );
        },
      })),
      a
    );
  }
  getUseState() {
    var e = this;
    return (t) => {
      const r = [t].reduce(
        function (t, r, a, s, n) {
          return (
            void 0 === n && (n = t.init(r)),
            {
              state: n,
              update: (r) => (t.update(n, r), e.update()),
              remove: (r) => (t.remove(n, r), e.update()),
              clear: () => (t.clear(n), e.update()),
              insert: (r, a) => (t.insert(n, r, a), e.update()),
              replace: (r, a) => (t.replace(n, r, a), e.update()),
              append: (r) => (t.append(n, r), e.update()),
              prepend: (r) => (t.prepend(n, r), e.update()),
              swap: (r, a) => (t.swap(n, r, a), e.update()),
              fromTo: (r, a) => (t.fromTo(n, r, a), e.update()),
              method: function (t) {
                return void 0 === t && (t = () => ({})), t(n), e.update();
              },
              async: function (t) {
                return (
                  void 0 === t && (t = () => Promise.reject(n)),
                  t(n).then(() => e.update())
                );
              },
            }
          );
        },
        Cr.find((e) => e.type(t))
      );
      return (
        (r.length = 12),
        (r[Symbol.iterator] = function () {
          const e = Object.values(this);
          e.splice(e.indexOf(12), 1);
          let t = 0;
          return {
            next() {
              if (t < e.length) {
                const r = e[t];
                return (t += 1), { value: r, done: !1 };
              }
              return { done: !0 };
            },
          };
        }),
        r
      );
    };
  }
  getComponentContext(e) {
    const t = {
      $f7route: this.context.f7route,
      $f7router: this.context.f7router,
      $h: Nt,
      $: F,
      $id: this.id,
      $f7: this.f7,
      $f7ready: this.f7ready.bind(this),
      $theme: this.theme,
      $tick: this.tick.bind(this),
      $update: this.update.bind(this),
      $emit: this.emit.bind(this),
      $store: this.getComponentStore(),
      $ref: this.getComponentRef(),
      $el: {},
      $useState: this.getUseState(),
    };
    return (
      Object.defineProperty(t.$el, "value", { get: () => this.$el }),
      e &&
        Object.assign(t, {
          $on: this.on.bind(this),
          $once: this.once.bind(this),
          $onBeforeMount: (e) => this.__onBeforeMount.push(e),
          $onMounted: (e) => this.__onMounted.push(e),
          $onBeforeUpdate: (e) => this.__onBeforeUpdate.push(e),
          $onUpdated: (e) => this.__onUpdated.push(e),
          $onBeforeUnmount: (e) => this.__onBeforeUnmount.push(e),
          $onUnmounted: (e) => this.__onUnmounted.push(e),
        }),
      t
    );
  }
  render() {
    return this.renderFunction(this.getComponentContext());
  }
  emit(e, t) {
    this.el && this.$el.trigger(e, t);
  }
  attachEvents() {
    const { $el: e } = this;
    this.__eventHandlers &&
      (this.__eventHandlers.forEach((t) => {
        let { eventName: r, handler: a } = t;
        e.on(Te(r), a);
      }),
      this.__onceEventHandlers.forEach((t) => {
        let { eventName: r, handler: a } = t;
        e.once(Te(r), a);
      }));
  }
  detachEvents() {
    const { $el: e } = this;
    this.__eventHandlers &&
      (this.__eventHandlers.forEach((t) => {
        let { eventName: r, handler: a } = t;
        e.on(Te(r), a);
      }),
      this.__onceEventHandlers.forEach((t) => {
        let { eventName: r, handler: a } = t;
        e.once(Te(r), a);
      }));
  }
  startUpdateQueue() {
    const e = f();
    if (this.__requestAnimationFrameId) return;
    const t = () => {
      this.hook("onBeforeUpdate");
      const e = this.render();
      if (e) {
        const t = rr(e, this, !1);
        this.vnode = wr(this.vnode, t);
      }
    };
    this.__requestAnimationFrameId = e.requestAnimationFrame(() => {
      this.__updateIsPending && t();
      let r = [...this.__updateQueue];
      (this.__updateQueue = []),
        (this.__updateIsPending = !1),
        e.cancelAnimationFrame(this.__requestAnimationFrameId),
        delete this.__requestAnimationFrameId,
        delete this.__updateIsPending,
        r.forEach((e) => e()),
        (r = []);
    });
  }
  tick(e) {
    return new Promise((t) => {
      this.__updateQueue.push(function () {
        t(), e && e();
      }),
        this.startUpdateQueue();
    });
  }
  update(e) {
    return this.__destroyed
      ? new Promise(() => {})
      : new Promise((t) => {
          (this.__updateIsPending = !0),
            this.__updateQueue.push(() => {
              t(), e && e();
            }),
            this.startUpdateQueue();
        });
  }
  setState(e) {
    return this.update(e);
  }
  f7ready(e) {
    this.f7.initialized
      ? e(this.f7)
      : this.f7.once("init", () => {
          e(this.f7);
        });
  }
  mount(e) {
    this.hook("onBeforeMount", this.$el),
      this.styleEl && F("head").append(this.styleEl),
      e && e(this.el),
      this.hook("onMounted", this.$el);
  }
  destroy() {
    if (this.__destroyed) return;
    const e = f();
    this.hook("onBeforeUnmount"),
      this.styleEl && F(this.styleEl).remove(),
      this.detachEvents(),
      this.hook("onUnmounted"),
      this.el &&
        this.el.f7Component &&
        ((this.el.f7Component = null), delete this.el.f7Component),
      this.vnode &&
        (this.vnode = wr(this.vnode, { sel: this.vnode.sel, data: {} })),
      e.cancelAnimationFrame(this.__requestAnimationFrameId),
      (this.__updateQueue = []),
      (this.__eventHandlers = []),
      (this.__onceEventHandlers = []),
      (this.__onBeforeMount = []),
      (this.__onMounted = []),
      (this.__onBeforeUpdate = []),
      (this.__onUpdated = []),
      (this.__onBeforeUnmount = []),
      (this.__onUnmounted = []),
      Me(this),
      (this.__destroyed = !0);
  }
  hook(e) {
    for (
      var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), a = 1;
      a < t;
      a++
    )
      r[a - 1] = arguments[a];
    this.__destroyed ||
      this[`__${e}`].forEach((e) => {
        e(...r);
      });
  }
}
xr.$jsx = Er;
var Sr = xr;
function kr(e) {
  const t = f(),
    r = u(),
    a = xe(),
    s = `f7_component_create_callback_${a}`;
  let n;
  e.match(/<template([ ]?)([a-z0-9-]*)>/) &&
    (n = e
      .split(/<template[ ]?[a-z0-9-]*>/)
      .filter((e, t) => t > 0)
      .join("<template>")
      .split("</template>")
      .filter((e, t, r) => t < r.length - 1)
      .join("</template>")
      .replace(/{{#raw}}([ \n]*)<template/g, "{{#raw}}<template")
      .replace(/\/template>([ \n]*){{\/raw}}/g, "/template>{{/raw}}")
      .replace(/([ \n])<template/g, "$1{{#raw}}<template")
      .replace(/\/template>([ \n])/g, "/template>{{/raw}}$1"));
  let i,
    o = null;
  if (
    (e.indexOf("<style>") >= 0 &&
      (o = e.split("<style>")[1].split("</style>")[0]),
    e.indexOf("<style scoped>") >= 0 &&
      (o = e.split("<style scoped>")[1].split("</style>")[0]),
    e.indexOf("<script>") >= 0)
  ) {
    const t = e.split("<script>");
    i = t[t.length - 1].split("</script>")[0].trim();
  } else i = "return () => {return $render}";
  (i && i.trim()) || (i = "return () => {return $render}"),
    n &&
      (i = i
        .replace(
          "$render",
          `function ($$ctx) {\n          var $ = $$ctx.$$;\n          var $h = $$ctx.$h;\n          var $root = $$ctx.$root;\n          var $f7 = $$ctx.$f7;\n          var $f7route = $$ctx.$f7route;\n          var $f7router = $$ctx.$f7router;\n          var $theme = $$ctx.$theme;\n          var $update = $$ctx.$update;\n          var $store = $$ctx.$store;\n          var $ref = $$ctx.$ref;\n          var $useState = $$ctx.$useState;\n\n          return $h\`${n}\`\n        }\n        `
        )
        .replace(/export default/g, "return")),
    (i = `window.${s} = function () {${i}}`);
  const l = r.createElement("script");
  (l.innerHTML = i), F("head").append(l);
  const c = t[s]();
  return (
    F(l).remove(), (t[s] = null), delete t[s], o && (c.style = o), (c.id = a), c
  );
}
function Tr(e, t) {
  Yt[e] = t;
}
function Mr(e) {
  delete Yt[e];
}
var Ar = {
    name: "component",
    static: {
      Component: Sr,
      parseComponent: kr,
      registerComponent: Tr,
      unregisterComponent: Mr,
    },
    create() {
      const e = this;
      e.component = {
        registerComponent: Tr,
        unregisterComponent: Mr,
        parse: (e) => kr(e),
        create(t, r, a) {
          let { root: s, el: n, context: i, children: o } = a;
          return new Sr(e, t, r, { root: s, el: n, context: i, children: o });
        },
      };
    },
  },
  $r = {
    name: "history",
    static: { history: vt },
    on: {
      init() {
        vt.init(this);
      },
    },
  };
const Pr = {
  registrations: [],
  register(e, t) {
    const r = this;
    return "serviceWorker" in f().navigator && r.serviceWorker.container
      ? new Promise((a, s) => {
          r.serviceWorker.container
            .register(e, t ? { scope: t } : {})
            .then((e) => {
              Pr.registrations.push(e),
                r.emit("serviceWorkerRegisterSuccess", e),
                a(e);
            })
            .catch((e) => {
              r.emit("serviceWorkerRegisterError", e), s(e);
            });
        })
      : new Promise((e, t) => {
          t(new Error("Service worker is not supported"));
        });
  },
  unregister(e) {
    const t = this;
    if (!("serviceWorker" in f().navigator) || !t.serviceWorker.container)
      return new Promise((e, t) => {
        t(new Error("Service worker is not supported"));
      });
    let r;
    return (
      (r = e ? (Array.isArray(e) ? e : [e]) : Pr.registrations),
      Promise.all(
        r.map(
          (e) =>
            new Promise((r, a) => {
              e.unregister()
                .then(() => {
                  Pr.registrations.indexOf(e) >= 0 &&
                    Pr.registrations.splice(Pr.registrations.indexOf(e), 1),
                    t.emit("serviceWorkerUnregisterSuccess", e),
                    r();
                })
                .catch((r) => {
                  t.emit("serviceWorkerUnregisterError", e, r), a(r);
                });
            })
        )
      )
    );
  },
};
var Or = {
  name: "sw",
  params: { serviceWorker: { path: void 0, scope: void 0 } },
  create() {
    const e = this,
      t = f();
    He(e, {
      serviceWorker: {
        container:
          "serviceWorker" in t.navigator ? t.navigator.serviceWorker : void 0,
        registrations: Pr.registrations,
        register: Pr.register.bind(e),
        unregister: Pr.unregister.bind(e),
      },
    });
  },
  on: {
    init() {
      const e = f();
      if (!("serviceWorker" in e.navigator)) return;
      const t = this;
      if (t.device.cordova || (e.Capacitor && e.Capacitor.isNative)) return;
      if (!t.serviceWorker.container) return;
      const r = t.params.serviceWorker.path,
        a = t.params.serviceWorker.scope;
      if (!r || (Array.isArray(r) && !r.length)) return;
      (Array.isArray(r) ? r : [r]).forEach((e) => {
        t.serviceWorker.register(e, a);
      });
    },
  },
};
function Lr(e) {
  void 0 === e && (e = {});
  const t = { __store: !0 },
    r = o({}, e.state || {}),
    a = o({}, e.actions || {}),
    s = o({}, e.getters || {}),
    n = He({}, r);
  let i = [];
  const l = {},
    c = {};
  Object.keys(s).forEach((e) => {
    (l[e] = []), (c[e] = []);
  });
  const p = (e) => s[e]({ state: t.state }),
    d = (e, t) => {
      c[e] || (c[e] = []), c[e].push(t);
    };
  t.__removeCallback = (e) => {
    ((e) => {
      Object.keys(c).forEach((t) => {
        const r = c[t];
        r.indexOf(e) >= 0 && r.splice(r.indexOf(e), 1);
      });
    })(e);
  };
  const u = function (e, t) {
    if ((void 0 === t && (t = !0), "constructor" === e)) return;
    i = [];
    const r = p(e);
    ((e, t) => {
      l[e] || (l[e] = []),
        t.forEach((t) => {
          l[e].indexOf(t) < 0 && l[e].push(t);
        });
    })(e, i);
    const a = {
      value: r,
      onUpdated: (t) => {
        d(e, t);
      },
    };
    if (!t) return a;
    const s = (e) => {
      a.value = e;
    };
    return (a.__callback = s), d(e, s), a;
  };
  return (
    (t.state = new Proxy(n, {
      set: (e, t, r) => {
        var a;
        return (
          (e[t] = r),
          (a = t),
          Object.keys(l)
            .filter((e) => l[e].indexOf(a) >= 0)
            .forEach((e) => {
              c[e] &&
                c[e].length &&
                c[e].forEach((t) => {
                  t(p(e));
                });
            }),
          !0
        );
      },
      get: (e, t) => (i.push(t), e[t]),
    })),
    (t.getters = new Proxy(s, {
      set: () => !1,
      get: (e, t) => {
        if (e[t]) return u(t, !0);
      },
    })),
    (t._gettersPlain = new Proxy(s, {
      set: () => !1,
      get: (e, t) => {
        if (e[t]) return u(t, !1);
      },
    })),
    (t.dispatch = (e, r) =>
      new Promise((s, n) => {
        if (!a[e])
          throw (
            (n(), new Error(`Framework7: Store action "${e}" is not found`))
          );
        s(a[e]({ state: t.state, dispatch: t.dispatch }, r));
      })),
    t
  );
}
var Rr = {
  name: "store",
  static: { createStore: Lr },
  proto: { createStore: Lr },
};
const Ir = () => {
    const e = f();
    return (
      e.Capacitor &&
      e.Capacitor.isNative &&
      e.Capacitor.Plugins &&
      e.Capacitor.Plugins.StatusBar
    );
  },
  zr = {
    hide() {
      const e = f();
      Qe().cordova && e.StatusBar && e.StatusBar.hide(),
        Ir() && e.Capacitor.Plugins.StatusBar.hide();
    },
    show() {
      const e = f();
      Qe().cordova && e.StatusBar && e.StatusBar.show(),
        Ir() && e.Capacitor.Plugins.StatusBar.show();
    },
    onClick() {
      const e = this;
      let t;
      (t =
        F(".popup.modal-in").length > 0
          ? F(".popup.modal-in")
              .find(".page:not(.page-previous):not(.page-next):not(.cached)")
              .find(".page-content")
          : F(".panel.panel-in").length > 0
          ? F(".panel.panel-in")
              .find(".page:not(.page-previous):not(.page-next):not(.cached)")
              .find(".page-content")
          : F(".views > .view.tab-active").length > 0
          ? F(".views > .view.tab-active")
              .find(".page:not(.page-previous):not(.page-next):not(.cached)")
              .find(".page-content")
          : F(".views").length > 0
          ? F(".views")
              .find(".page:not(.page-previous):not(.page-next):not(.cached)")
              .find(".page-content")
          : e.$el
              .children(".view")
              .find(".page:not(.page-previous):not(.page-next):not(.cached)")
              .find(".page-content")),
        t &&
          t.length > 0 &&
          (t.hasClass("tab") &&
            (t = t.parent(".tabs").children(".page-content.tab-active")),
          t.length > 0 && t.scrollTop(0, 300));
    },
    setTextColor(e) {
      const t = f();
      Qe().cordova &&
        t.StatusBar &&
        ("white" === e
          ? t.StatusBar.styleLightContent()
          : t.StatusBar.styleDefault()),
        Ir() &&
          ("white" === e
            ? t.Capacitor.Plugins.StatusBar.setStyle({ style: "DARK" })
            : t.Capacitor.Plugins.StatusBar.setStyle({ style: "LIGHT" }));
    },
    setBackgroundColor(e) {
      const t = f();
      Qe().cordova && t.StatusBar && t.StatusBar.backgroundColorByHexString(e),
        Ir() && t.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: e });
    },
    isVisible() {
      const e = f(),
        t = Qe();
      return new Promise((r) => {
        t.cordova && e.StatusBar && r(e.StatusBar.isVisible),
          Ir() &&
            e.Capacitor.Plugins.StatusBar.getInfo().then((e) => {
              r(e.visible);
            }),
          r(!1);
      });
    },
    overlaysWebView(e) {
      void 0 === e && (e = !0);
      const t = f();
      Qe().cordova && t.StatusBar && t.StatusBar.overlaysWebView(e),
        Ir() &&
          t.Capacitor.Plugins.StatusBar.setOverlaysWebView({ overlay: e });
    },
    init() {
      const e = this,
        t = f(),
        r = Qe(),
        a = e.params.statusbar;
      if (!a.enabled) return;
      const s = r.cordova && t.StatusBar,
        n = Ir();
      (s || n) &&
        (a.scrollTopOnClick && F(t).on("statusTap", zr.onClick.bind(e)),
        r.ios &&
          (a.iosOverlaysWebView
            ? zr.overlaysWebView(!0)
            : zr.overlaysWebView(!1),
          "white" === a.iosTextColor
            ? zr.setTextColor("white")
            : zr.setTextColor("black")),
        r.android &&
          (a.androidOverlaysWebView
            ? zr.overlaysWebView(!0)
            : zr.overlaysWebView(!1),
          "white" === a.androidTextColor
            ? zr.setTextColor("white")
            : zr.setTextColor("black"))),
        a.iosBackgroundColor &&
          r.ios &&
          zr.setBackgroundColor(a.iosBackgroundColor),
        a.androidBackgroundColor &&
          r.android &&
          zr.setBackgroundColor(a.androidBackgroundColor);
    },
  };
var Br = {
  name: "statusbar",
  params: {
    statusbar: {
      enabled: !0,
      scrollTopOnClick: !0,
      iosOverlaysWebView: !0,
      iosTextColor: "black",
      iosBackgroundColor: null,
      androidOverlaysWebView: !1,
      androidTextColor: "black",
      androidBackgroundColor: null,
    },
  },
  create() {
    Fe(this, { statusbar: zr });
  },
  on: {
    init() {
      zr.init.call(this);
    },
  },
};
var Hr = {
  name: "view",
  params: {
    view: {
      init: !0,
      initRouterOnTabShow: !1,
      name: void 0,
      main: !1,
      router: !0,
      linksView: null,
      xhrCache: !0,
      xhrCacheIgnore: [],
      xhrCacheIgnoreGetParameters: !1,
      xhrCacheDuration: 6e5,
      componentCache: !0,
      preloadPreviousPage: !0,
      allowDuplicateUrls: !1,
      reloadPages: !1,
      reloadDetail: !1,
      masterDetailBreakpoint: 0,
      masterDetailResizable: !1,
      removeElements: !0,
      removeElementsWithTimeout: !1,
      removeElementsTimeout: 0,
      restoreScrollTopOnBack: !0,
      unloadTabContent: !0,
      passRouteQueryToRequest: !0,
      passRouteParamsToRequest: !1,
      loadInitialPage: !0,
      iosSwipeBack: !0,
      iosSwipeBackAnimateShadow: !0,
      iosSwipeBackAnimateOpacity: !0,
      iosSwipeBackActiveArea: 30,
      iosSwipeBackThreshold: 0,
      mdSwipeBack: !1,
      mdSwipeBackAnimateShadow: !0,
      mdSwipeBackAnimateOpacity: !1,
      mdSwipeBackActiveArea: 30,
      mdSwipeBackThreshold: 0,
      browserHistory: !1,
      browserHistoryRoot: void 0,
      browserHistoryAnimate: !0,
      browserHistoryAnimateOnLoad: !1,
      browserHistorySeparator: "#!",
      browserHistoryOnLoad: !0,
      browserHistoryInitialMatch: !1,
      browserHistoryStoreHistory: !0,
      browserHistoryTabs: "replace",
      animate: !0,
      iosDynamicNavbar: !0,
      iosAnimateNavbarBackIcon: !0,
      iosPageLoadDelay: 0,
      mdPageLoadDelay: 0,
      routesBeforeEnter: null,
      routesBeforeLeave: null,
    },
  },
  static: { View: Rt },
  create() {
    const e = this;
    He(e, {
      views: He([], {
        create: (t, r) => new Rt(e, t, r),
        get(e) {
          const t = F(e);
          if (t.length && t[0].f7View) return t[0].f7View;
        },
      }),
    }),
      Object.defineProperty(e.views, "current", {
        enumerable: !0,
        configurable: !0,
        get: () =>
          (function (e) {
            const t = F(".popover.modal-in .view"),
              r = F(".popup.modal-in .view"),
              a = F(".panel.panel-in .view");
            let s = F(".views");
            0 === s.length && (s = e.$el);
            let n = s.children(".view");
            if (
              (0 === n.length && (n = s.children(".tabs").children(".view")),
              n.length > 1 &&
                n.hasClass("tab") &&
                ((n = s.children(".view.tab-active")),
                0 === n.length &&
                  (n = s.children(".tabs").children(".view.tab-active"))),
              t.length > 0 && t[0].f7View)
            )
              return t[0].f7View;
            if (r.length > 0 && r[0].f7View) return r[0].f7View;
            if (a.length > 0 && a[0].f7View) return a[0].f7View;
            if (n.length > 0) {
              if (1 === n.length && n[0].f7View) return n[0].f7View;
              if (n.length > 1) return e.views.main;
            }
          })(e),
      }),
      (e.view = e.views);
  },
  on: {
    init() {
      const e = this;
      F(".view-init").each((t) => {
        if (t.f7View) return;
        const r = F(t).dataset();
        e.views.create(t, r);
      });
    },
    "modalOpen panelOpen": function (e) {
      const t = this;
      e.$el.find(".view-init").each((e) => {
        if (e.f7View) return;
        const r = F(e).dataset();
        t.views.create(e, r);
      });
    },
    "modalBeforeDestroy panelBeforeDestroy": function (e) {
      e &&
        e.$el &&
        e.$el.find(".view-init").each((e) => {
          const t = e.f7View;
          t && t.destroy();
        });
    },
  },
  vnode: {
    "view-init": {
      insert(e) {
        const t = e.elm;
        if (t.f7View) return;
        const r = F(t).dataset();
        this.views.create(t, r);
      },
      destroy(e) {
        const t = e.elm.f7View;
        t && t.destroy();
      },
    },
  },
};
const Dr = {
  size(e) {
    const t = this;
    let r = F(e);
    if (r.hasClass("navbars"))
      return void (r = r.children(".navbar").each((e) => {
        t.navbar.size(e);
      }));
    const a = r.children(".navbar-inner");
    if (!a.length) return;
    const s =
        a.hasClass("navbar-inner-centered-title") ||
        t.params.navbar[`${t.theme}CenterTitle`],
      n = "ios" === t.theme && !t.params.navbar[`${t.theme}CenterTitle`];
    if (!s && !n) return;
    if (
      r.parents(".tab:not(.tab-active)").length > 0 ||
      r.parents(".popup:not(.modal-in)").length > 0
    )
      return;
    "ios" !== t.theme &&
      t.params.navbar[`${t.theme}CenterTitle`] &&
      a.addClass("navbar-inner-centered-title"),
      "ios" !== t.theme ||
        t.params.navbar.iosCenterTitle ||
        a.addClass("navbar-inner-left-title");
    const i = r.parents(".view").eq(0),
      o = t.rtl ? a.children(".right") : a.children(".left"),
      l = t.rtl ? a.children(".left") : a.children(".right"),
      c = a.children(".title"),
      p = a.children(".subnavbar"),
      d = 0 === o.length,
      u = 0 === l.length,
      h = d ? 0 : o.outerWidth(!0),
      f = u ? 0 : l.outerWidth(!0),
      m = c.outerWidth(!0),
      g = a.styles(),
      v =
        a[0].offsetWidth -
        parseInt(g.paddingLeft, 10) -
        parseInt(g.paddingRight, 10),
      b = r.hasClass("navbar-previous"),
      w = a.hasClass("sliding");
    let y, E, C, x;
    i.length > 0 &&
      i[0].f7View &&
      ((y = i[0].f7View.router), (E = y && y.dynamicNavbar)),
      u && (C = v - m),
      d && (C = 0),
      d || u || (C = (v - f - m + h) / 2);
    let S = (v - m) / 2;
    v - h - f > m
      ? (S < h && (S = h), S + m > v - f && (S = v - f - m), (x = S - C))
      : (x = 0);
    const k = t.rtl ? -1 : 1;
    if (E && "ios" === t.theme) {
      if (c.hasClass("sliding") || (c.length > 0 && w)) {
        let e = -(C + x) * k;
        const t = (v - C - x - m) * k;
        if (b && y && y.params.iosAnimateNavbarBackIcon) {
          const t = r
            .parent()
            .find(".navbar-current")
            .children(".left.sliding")
            .find(".back .icon ~ span");
          t.length > 0 && (e += t[0].offsetLeft);
        }
        (c[0].f7NavbarLeftOffset = e), (c[0].f7NavbarRightOffset = t);
      }
      if (!d && (o.hasClass("sliding") || w))
        if (t.rtl)
          (o[0].f7NavbarLeftOffset = (-(v - o[0].offsetWidth) / 2) * k),
            (o[0].f7NavbarRightOffset = h * k);
        else if (
          ((o[0].f7NavbarLeftOffset = -h),
          (o[0].f7NavbarRightOffset = (v - o[0].offsetWidth) / 2),
          y &&
            y.params.iosAnimateNavbarBackIcon &&
            o.find(".back .icon").length > 0 &&
            o.find(".back .icon ~ span").length)
        ) {
          const e = o[0].f7NavbarLeftOffset,
            t = o[0].f7NavbarRightOffset;
          (o[0].f7NavbarLeftOffset = 0),
            (o[0].f7NavbarRightOffset = 0),
            (o.find(".back .icon ~ span")[0].f7NavbarLeftOffset = e),
            (o.find(".back .icon ~ span")[0].f7NavbarRightOffset =
              t - o.find(".back .icon")[0].offsetWidth);
        }
      u ||
        (!l.hasClass("sliding") && !w) ||
        (t.rtl
          ? ((l[0].f7NavbarLeftOffset = -f * k),
            (l[0].f7NavbarRightOffset = ((v - l[0].offsetWidth) / 2) * k))
          : ((l[0].f7NavbarLeftOffset = -(v - l[0].offsetWidth) / 2),
            (l[0].f7NavbarRightOffset = f))),
        p.length &&
          (p.hasClass("sliding") || w) &&
          ((p[0].f7NavbarLeftOffset = t.rtl
            ? p[0].offsetWidth
            : -p[0].offsetWidth),
          (p[0].f7NavbarRightOffset = -p[0].f7NavbarLeftOffset));
    }
    if (s) {
      let e = x;
      t.rtl && d && u && c.length > 0 && (e = -e), c.css({ left: `${e}px` });
    }
  },
  hide(e, t, r, a) {
    void 0 === t && (t = !0),
      void 0 === r && (r = !1),
      void 0 === a && (a = !1);
    const s = this;
    let n = F(e);
    const i = n.hasClass("navbar") && n.parent(".navbars").length && !a;
    if ((i && (n = n.parents(".navbars")), !n.length)) return;
    if (n.hasClass("navbar-hidden")) return;
    let o = "navbar-hidden" + (t ? " navbar-transitioning" : "");
    (i
      ? n.find(".navbar-current .title-large").length
      : n.find(".title-large").length) && (o += " navbar-large-hidden"),
      r && (o += " navbar-hidden-statusbar"),
      n.transitionEnd(() => {
        n.removeClass("navbar-transitioning");
      }),
      n.addClass(o),
      i
        ? n.children(".navbar").each((e) => {
            F(e).trigger("navbar:hide"), s.emit("navbarHide", e);
          })
        : (n.trigger("navbar:hide"), s.emit("navbarHide", n[0]));
  },
  show(e, t, r) {
    void 0 === e && (e = ".navbar-hidden"),
      void 0 === t && (t = !0),
      void 0 === r && (r = !1);
    const a = this;
    let s = F(e);
    const n = s.hasClass("navbar") && s.parent(".navbars").length && !r;
    n && (s = s.parents(".navbars")),
      s.length &&
        s.hasClass("navbar-hidden") &&
        (t &&
          (s.addClass("navbar-transitioning"),
          s.transitionEnd(() => {
            s.removeClass("navbar-transitioning");
          })),
        s.removeClass(
          "navbar-hidden navbar-large-hidden navbar-hidden-statusbar"
        ),
        n
          ? s.children(".navbar").each((e) => {
              F(e).trigger("navbar:show"), a.emit("navbarShow", e);
            })
          : (s.trigger("navbar:show"), a.emit("navbarShow", s[0])));
  },
  getElByPage(e) {
    let t, r, a;
    if (
      (e.$navbarEl || e.$el
        ? ((a = e), (t = e.$el))
        : ((t = F(e)), t.length > 0 && (a = t[0].f7Page)),
      a && a.$navbarEl && a.$navbarEl.length > 0
        ? (r = a.$navbarEl)
        : t && (r = t.children(".navbar")),
      r && (!r || 0 !== r.length))
    )
      return r[0];
  },
  getPageByEl(e) {
    const t = F(e);
    if (t.parents(".page").length) return t.parents(".page")[0];
    let r;
    return (
      t
        .parents(".view")
        .find(".page")
        .each((e) => {
          e &&
            e.f7Page &&
            e.f7Page.navbarEl &&
            t[0] === e.f7Page.navbarEl &&
            (r = e);
        }),
      r
    );
  },
  collapseLargeTitle(e) {
    const t = this;
    let r = F(e);
    if (
      r.hasClass("navbars") &&
      ((r = r.find(".navbar")),
      r.length > 1 && (r = F(e).find(".navbar-large.navbar-current")),
      r.length > 1 || !r.length)
    )
      return;
    const a = F(t.navbar.getPageByEl(r));
    r.addClass("navbar-large-collapsed"),
      a
        .eq(0)
        .addClass("page-with-navbar-large-collapsed")
        .trigger("page:navbarlargecollapsed"),
      t.emit("pageNavbarLargeCollapsed", a[0]),
      r.trigger("navbar:collapse"),
      t.emit("navbarCollapse", r[0]);
  },
  expandLargeTitle(e) {
    const t = this;
    let r = F(e);
    if (
      r.hasClass("navbars") &&
      ((r = r.find(".navbar-large")),
      r.length > 1 && (r = F(e).find(".navbar-large.navbar-current")),
      r.length > 1 || !r.length)
    )
      return;
    const a = F(t.navbar.getPageByEl(r));
    r.removeClass("navbar-large-collapsed"),
      a
        .eq(0)
        .removeClass("page-with-navbar-large-collapsed")
        .trigger("page:navbarlargeexpanded"),
      t.emit("pageNavbarLargeExpanded", a[0]),
      r.trigger("navbar:expand"),
      t.emit("navbarExpand", r[0]);
  },
  toggleLargeTitle(e) {
    const t = this;
    let r = F(e);
    (r.hasClass("navbars") &&
      ((r = r.find(".navbar-large")),
      r.length > 1 && (r = F(e).find(".navbar-large.navbar-current")),
      r.length > 1 || !r.length)) ||
      (r.hasClass("navbar-large-collapsed")
        ? t.navbar.expandLargeTitle(r)
        : t.navbar.collapseLargeTitle(r));
  },
  initNavbarOnScroll(e, t, r, a, s) {
    const n = this,
      i = Xe(),
      o = F(e),
      l = F(t),
      c = l.find(".title-large"),
      p = c.length || l.hasClass(".navbar-large");
    let d = 44;
    const u = n.params.navbar.snapPageScrollToLargeTitle,
      h = n.params.navbar.snapPageScrollToTransparentNavbar;
    let f, m, g, v, b, w, y, E, C, x, S, k, T, M;
    (a || (r && p)) &&
      ((C = l.css("--f7-navbar-large-title-height")),
      C && C.indexOf("px") >= 0
        ? ((C = parseInt(C, 10)),
          Number.isNaN(C) && c.length
            ? (C = c[0].offsetHeight)
            : Number.isNaN(C) &&
              ("ios" === n.theme ? (C = 52) : "md" === n.theme && (C = 88)))
        : c.length
        ? (C = c[0].offsetHeight)
        : "ios" === n.theme
        ? (C = 52)
        : "md" === n.theme && (C = 88)),
      r && p && (d += C);
    function A() {
      o.find(".page-content").each((e) => {
        e.f7ScrollableDistance = e.scrollHeight - e.offsetHeight;
      });
    }
    function $() {
      l.hasClass("with-searchbar-expandable-enabled") ||
        !k ||
        m < 0 ||
        (m >= C / 2 && m < C
          ? F(k).scrollTop(C, 100)
          : m < C && F(k).scrollTop(0, 200));
    }
    function P() {
      l.hasClass("with-searchbar-expandable-enabled") ||
        !k ||
        m < 0 ||
        (m >= x / 2 && m < x
          ? F(k).scrollTop(x, 100)
          : m < x && F(k).scrollTop(0, 200));
    }
    let O = null,
      L = null;
    function R(e) {
      (k = this),
        (e && e.target && e.target !== k) ||
          ((m = k.scrollTop),
          (S = m),
          a
            ? (function (e) {
                if (
                  l.hasClass("navbar-hidden") ||
                  l.parent(".navbars").hasClass("navbar-hidden")
                )
                  return;
                const t =
                  l.hasClass("navbar-large-transparent") ||
                  (l.hasClass("navbar-large") &&
                    l.hasClass("navbar-transparent"));
                O = L;
                const r = Math.min(C, e.f7ScrollableDistance || C);
                L = Math.min(Math.max(m / r, 0), 1);
                const a = O > 0 && O < 1;
                if (l.hasClass("with-searchbar-expandable-enabled")) return;
                E = l.hasClass("navbar-large-collapsed");
                const s = l.find(".navbar-bg");
                0 === L && E
                  ? n.navbar.expandLargeTitle(l[0])
                  : 1 !== L || E || n.navbar.collapseLargeTitle(l[0]),
                  (0 === L && E) ||
                  (0 === L && a) ||
                  (1 === L && !E) ||
                  (1 === L && a)
                    ? ("md" === n.theme &&
                        l.find(".navbar-inner").css("overflow", ""),
                      l.find(".title").css("opacity", ""),
                      l
                        .find(".title-large-text, .subnavbar")
                        .css("transform", ""),
                      l.find(".title-large-text").css("opacity", ""),
                      t && s.css("opacity", ""),
                      s.css("transform", ""))
                    : L > 0 &&
                      L < 1 &&
                      ("md" === n.theme &&
                        l.find(".navbar-inner").css("overflow", "visible"),
                      l.find(".title").css("opacity", 1.5 * L - 0.5),
                      l
                        .find(".title-large-text, .subnavbar")
                        .css(
                          "transform",
                          `translate3d(0px, ${-1 * L * C}px, 0)`
                        ),
                      l.find(".title-large-text").css("opacity", 1 - 2 * L),
                      t && s.css("opacity", L),
                      s.css(
                        "transform",
                        `translate3d(0px, ${-1 * L * C}px, 0)`
                      )),
                  u &&
                    (i.touch
                      ? M &&
                        (clearTimeout(M),
                        (M = null),
                        (M = setTimeout(() => {
                          $(), clearTimeout(M), (M = null);
                        }, 70)))
                      : (clearTimeout(T),
                        (T = setTimeout(() => {
                          $();
                        }, 300))));
              })(k)
            : s &&
              (function () {
                const e =
                  l.hasClass("navbar-hidden") ||
                  l.parent(".navbars").hasClass("navbar-hidden");
                if (l.hasClass("with-searchbar-expandable-enabled") || e)
                  return;
                x || (x = t.offsetHeight);
                let r = m / x;
                const a = l.hasClass("navbar-transparent-visible");
                if (
                  ((r = Math.max(Math.min(r, 1), 0)),
                  (a && 1 === r) || (!a && 0 === r))
                )
                  l.find(".navbar-bg, .title").css("opacity", "");
                else {
                  if (a && 0 === r)
                    return (
                      l.trigger("navbar:transparenthide"),
                      n.emit("navbarTransparentHide", l[0]),
                      l.removeClass("navbar-transparent-visible"),
                      void l.find(".navbar-bg, .title").css("opacity", "")
                    );
                  if (!a && 1 === r)
                    return (
                      l.trigger("navbar:transparentshow"),
                      n.emit("navbarTransparentShow", l[0]),
                      l.addClass("navbar-transparent-visible"),
                      void l.find(".navbar-bg, .title").css("opacity", "")
                    );
                  l.find(".navbar-bg, .title").css("opacity", r),
                    h &&
                      (i.touch
                        ? M &&
                          (clearTimeout(M),
                          (M = null),
                          (M = setTimeout(() => {
                            P(), clearTimeout(M), (M = null);
                          }, 70)))
                        : (clearTimeout(T),
                          (T = setTimeout(() => {
                            P();
                          }, 300))));
                }
              })(),
          o.hasClass("page-previous") ||
            (r &&
              (o.hasClass("page-with-card-opened") ||
                ((g = k.scrollHeight),
                (v = k.offsetHeight),
                (b = m + v >= g),
                (y =
                  l.hasClass("navbar-hidden") ||
                  l.parent(".navbars").hasClass("navbar-hidden")),
                b
                  ? n.params.navbar.showOnPageScrollEnd && (w = "show")
                  : (w =
                      f > m
                        ? n.params.navbar.showOnPageScrollTop || m <= d
                          ? "show"
                          : "hide"
                        : m > d
                        ? "hide"
                        : "show"),
                "show" === w && y
                  ? (n.navbar.show(l, !0, !0), (y = !1))
                  : "hide" !== w ||
                    y ||
                    (n.navbar.hide(l, !0, !1, !0), (y = !0)),
                (f = m)))));
    }
    function I() {
      S = !1;
    }
    function z() {
      clearTimeout(M),
        (M = null),
        (M = setTimeout(() => {
          !1 !== S && (s && !a ? P() : $(), clearTimeout(M), (M = null));
        }, 70));
    }
    o.on("scroll", ".page-content", R, !0),
      i.touch &&
        ((a && u) || (s && h)) &&
        (n.on("touchstart:passive", I), n.on("touchend:passive", z)),
      A(),
      (a || s) &&
        o.find(".page-content").each((e) => {
          e.scrollTop > 0 && R.call(e);
        }),
      n.on("resize", A),
      (o[0].f7DetachNavbarScrollHandlers = function () {
        n.off("resize", A),
          delete o[0].f7DetachNavbarScrollHandlers,
          o.off("scroll", ".page-content", R, !0),
          i.touch &&
            ((a && u) || (s && h)) &&
            (n.off("touchstart:passive", I), n.off("touchend:passive", z));
      });
  },
};
var Nr = {
  name: "navbar",
  create() {
    Fe(this, { navbar: Dr });
  },
  params: {
    navbar: {
      scrollTopOnTitleClick: !0,
      iosCenterTitle: !0,
      mdCenterTitle: !1,
      hideOnPageScroll: !1,
      showOnPageScrollEnd: !0,
      showOnPageScrollTop: !0,
      collapseLargeTitleOnScroll: !0,
      snapPageScrollToLargeTitle: !0,
      snapPageScrollToTransparentNavbar: !0,
    },
  },
  on: {
    "panelBreakpoint panelCollapsedBreakpoint panelResize viewResize resize viewMasterDetailBreakpoint":
      function () {
        const e = this;
        F(".navbar").each((t) => {
          e.navbar.size(t);
        });
      },
    pageBeforeRemove(e) {
      e.$el[0].f7DetachNavbarScrollHandlers &&
        e.$el[0].f7DetachNavbarScrollHandlers();
    },
    pageBeforeIn(e) {
      const t = this;
      if ("ios" !== t.theme) return;
      let r;
      const a = e.$el.parents(".view")[0].f7View,
        s = t.navbar.getElByPage(e);
      if (
        ((r = s
          ? F(s).parents(".navbars")
          : e.$el.parents(".view").children(".navbars")),
        e.$el.hasClass("no-navbar") || (a.router.dynamicNavbar && !s))
      ) {
        const a = !!(e.pageFrom && e.router.history.length > 0);
        t.navbar.hide(r, a);
      } else t.navbar.show(r);
    },
    pageReinit(e) {
      const t = F(this.navbar.getElByPage(e));
      t && 0 !== t.length && this.navbar.size(t);
    },
    pageInit(e) {
      const t = this,
        r = F(t.navbar.getElByPage(e));
      if (!r || 0 === r.length) return;
      let a, s, n;
      t.navbar.size(r),
        r.find(".title-large").length > 0 && r.addClass("navbar-large"),
        r.hasClass("navbar-large") &&
          (t.params.navbar.collapseLargeTitleOnScroll && (a = !0),
          e.$el.addClass("page-with-navbar-large")),
        !a && r.hasClass("navbar-transparent") && (s = !0),
        (t.params.navbar.hideOnPageScroll ||
          e.$el.find(".hide-navbar-on-scroll").length ||
          e.$el.hasClass("hide-navbar-on-scroll") ||
          e.$el.find(".hide-bars-on-scroll").length ||
          e.$el.hasClass("hide-bars-on-scroll")) &&
          (n = !(
            e.$el.find(".keep-navbar-on-scroll").length ||
            e.$el.hasClass("keep-navbar-on-scroll") ||
            e.$el.find(".keep-bars-on-scroll").length ||
            e.$el.hasClass("keep-bars-on-scroll")
          )),
        (a || n || s) && t.navbar.initNavbarOnScroll(e.el, r[0], n, a, s);
    },
    "panelOpen panelSwipeOpen modalOpen": function (e) {
      const t = this;
      e.$el.find(".navbar:not(.navbar-previous)").each((e) => {
        t.navbar.size(e);
      });
    },
    tabShow(e) {
      const t = this;
      F(e)
        .find(".navbar:not(.navbar-previous)")
        .each((e) => {
          t.navbar.size(e);
        });
    },
  },
  clicks: {
    ".navbar .title": function (e, t, r) {
      if (!this.params.navbar.scrollTopOnTitleClick) return;
      if (F(r.target).closest("a, button").length > 0) return;
      let a;
      const s = e.parents(".navbar"),
        n = s.parents(".navbars");
      (a = s.parents(".page-content")),
        0 === a.length &&
          (s.parents(".page").length > 0 &&
            (a = s.parents(".page").find(".page-content")),
          0 === a.length &&
            n.length &&
            n.nextAll(".page-current").length > 0 &&
            (a = n.nextAll(".page-current").find(".page-content")),
          0 === a.length &&
            s.nextAll(".page-current").length > 0 &&
            (a = s.nextAll(".page-current").find(".page-content"))),
        a &&
          a.length > 0 &&
          (a.hasClass("tab") &&
            (a = a.parent(".tabs").children(".page-content.tab-active")),
          a.length > 0 && a.scrollTop(0, 300));
    },
  },
  vnode: {
    navbar: {
      postpatch(e) {
        this.navbar.size(e.elm);
      },
    },
  },
};
const _r = {
  setHighlight(e) {
    const t = this,
      r = F(e);
    if ("ios" === t.theme && !r.hasClass("tabbar-highlight")) return;
    if (
      0 === r.length ||
      (!r.hasClass("tabbar") && !r.hasClass("tabbar-icons"))
    )
      return;
    let a = r.find(".tab-link-highlight");
    const s = r.find(".tab-link").length;
    if (0 === s) return void a.remove();
    0 === a.length
      ? (r
          .children(".toolbar-inner")
          .append('<span class="tab-link-highlight"></span>'),
        (a = r.find(".tab-link-highlight")))
      : a.next().length && r.children(".toolbar-inner").append(a);
    const n = r.find(".tab-link-active");
    let i, o;
    if (r.hasClass("tabbar-scrollable") && n && n[0])
      (i = `${n[0].offsetWidth}px`), (o = `${n[0].offsetLeft}px`);
    else {
      const e = n.index();
      (i = 100 / s + "%"), (o = 100 * (t.rtl ? -e : e) + "%");
    }
    Pe(() => {
      a.css("width", i).transform(`translate3d(${o},0,0)`);
    });
  },
  init(e) {
    this.toolbar.setHighlight(e);
  },
  hide(e, t) {
    void 0 === t && (t = !0);
    const r = F(e);
    if (r.hasClass("toolbar-hidden")) return;
    const a = "toolbar-hidden" + (t ? " toolbar-transitioning" : "");
    r.transitionEnd(() => {
      r.removeClass("toolbar-transitioning");
    }),
      r.addClass(a),
      r.trigger("toolbar:hide"),
      this.emit("toolbarHide", r[0]);
  },
  show(e, t) {
    void 0 === t && (t = !0);
    const r = F(e);
    r.hasClass("toolbar-hidden") &&
      (t &&
        (r.addClass("toolbar-transitioning"),
        r.transitionEnd(() => {
          r.removeClass("toolbar-transitioning");
        })),
      r.removeClass("toolbar-hidden"),
      r.trigger("toolbar:show"),
      this.emit("toolbarShow", r[0]));
  },
  initToolbarOnScroll(e) {
    const t = this,
      r = F(e);
    let a,
      s,
      n,
      i,
      o,
      l,
      c,
      p = r.parents(".view").children(".toolbar");
    function d(e) {
      if (r.hasClass("page-with-card-opened")) return;
      if (r.hasClass("page-previous")) return;
      const d = this;
      (e && e.target && e.target !== d) ||
        ((s = d.scrollTop),
        (n = d.scrollHeight),
        (i = d.offsetHeight),
        (o = s + i >= n),
        (c = p.hasClass("toolbar-hidden")),
        o
          ? t.params.toolbar.showOnPageScrollEnd && (l = "show")
          : (l =
              a > s
                ? t.params.toolbar.showOnPageScrollTop || s <= 44
                  ? "show"
                  : "hide"
                : s > 44
                ? "hide"
                : "show"),
        "show" === l && c
          ? (t.toolbar.show(p), (c = !1))
          : "hide" !== l || c || (t.toolbar.hide(p), (c = !0)),
        (a = s));
    }
    0 === p.length && (p = r.find(".toolbar")),
      0 === p.length &&
        (p = r.parents(".views").children(".tabbar, .tabbar-icons")),
      0 !== p.length &&
        (r.on("scroll", ".page-content", d, !0),
        (r[0].f7ScrollToolbarHandler = d));
  },
};
var jr = {
    name: "toolbar",
    create() {
      Fe(this, { toolbar: _r });
    },
    params: {
      toolbar: {
        hideOnPageScroll: !1,
        showOnPageScrollEnd: !0,
        showOnPageScrollTop: !0,
      },
    },
    on: {
      pageBeforeRemove(e) {
        e.$el[0].f7ScrollToolbarHandler &&
          e.$el.off(
            "scroll",
            ".page-content",
            e.$el[0].f7ScrollToolbarHandler,
            !0
          );
      },
      pageBeforeIn(e) {
        const t = this;
        let r = e.$el.parents(".view").children(".toolbar");
        0 === r.length &&
          (r = e.$el.parents(".views").children(".tabbar, .tabbar-icons")),
          0 === r.length && (r = e.$el.find(".toolbar")),
          0 !== r.length &&
            (e.$el.hasClass("no-toolbar")
              ? t.toolbar.hide(r)
              : t.toolbar.show(r));
      },
      pageInit(e) {
        const t = this;
        if (
          (e.$el.find(".tabbar, .tabbar-icons").each((e) => {
            t.toolbar.init(e);
          }),
          t.params.toolbar.hideOnPageScroll ||
            e.$el.find(".hide-toolbar-on-scroll").length ||
            e.$el.hasClass("hide-toolbar-on-scroll") ||
            e.$el.find(".hide-bars-on-scroll").length ||
            e.$el.hasClass("hide-bars-on-scroll"))
        ) {
          if (
            e.$el.find(".keep-toolbar-on-scroll").length ||
            e.$el.hasClass("keep-toolbar-on-scroll") ||
            e.$el.find(".keep-bars-on-scroll").length ||
            e.$el.hasClass("keep-bars-on-scroll")
          )
            return;
          t.toolbar.initToolbarOnScroll(e.el);
        }
      },
      init() {
        const e = this;
        e.$el.find(".tabbar, .tabbar-icons").each((t) => {
          e.toolbar.init(t);
        });
      },
    },
    vnode: {
      tabbar: {
        insert(e) {
          this.toolbar.init(e.elm);
        },
      },
    },
  },
  qr = {
    name: "subnavbar",
    on: {
      pageInit(e) {
        e.$navbarEl &&
          e.$navbarEl.length &&
          e.$navbarEl.find(".subnavbar").length &&
          e.$el.addClass("page-with-subnavbar");
        e.$el
          .find(".subnavbar")
          .filter((t) => F(t).parents(".page")[0] === e.$el[0]).length &&
          e.$el.addClass("page-with-subnavbar");
      },
    },
  };
class Vr {
  constructor(e, t, r, a) {
    const s = this;
    if (!t) return;
    const {
        left: n,
        top: i,
        width: o,
        height: l,
      } = t[0].getBoundingClientRect(),
      c = r - n,
      p = a - i;
    let d = Math.max((l ** 2 + o ** 2) ** 0.5, 48),
      u = !1;
    const h = e.params.touch.touchRippleInsetElements || "";
    if (
      (h && t.is(h) && (u = !0),
      u && (d = Math.max(Math.min(o, l), 48)),
      u || "hidden" !== t.css("overflow"))
    )
      s.rippleTransform = `translate3d(${o / 2 - c}px, ${
        l / 2 - p
      }px, 0) scale(1)`;
    else {
      const e =
        (d / 2 + ((c - o / 2) ** 2 + (p - l / 2) ** 2) ** 0.5) / (d / 2);
      s.rippleTransform = `translate3d(0px, 0px, 0) scale(${2 * e})`;
    }
    return (
      u && t.addClass("ripple-inset"),
      (s.$rippleWaveEl = F(
        `<div class="ripple-wave${
          u ? " ripple-wave-inset" : ""
        }" style="width: ${d}px; height: ${d}px; margin-top:-${
          d / 2
        }px; margin-left:-${
          d / 2
        }px; left:${c}px; top:${p}px; --f7-ripple-transform: ${
          s.rippleTransform
        }"></div>`
      )),
      t.prepend(s.$rippleWaveEl),
      s.$rippleWaveEl.animationEnd(() => {
        s.$rippleWaveEl &&
          (s.$rippleWaveEl.hasClass("ripple-wave-out") ||
            (s.$rippleWaveEl.addClass("ripple-wave-in"),
            s.shouldBeRemoved && s.out()));
      }),
      s
    );
  }
  destroy() {
    let e = this;
    e.$rippleWaveEl && e.$rippleWaveEl.remove(),
      Object.keys(e).forEach((t) => {
        (e[t] = null), delete e[t];
      }),
      (e = null);
  }
  out() {
    const e = this,
      { $rippleWaveEl: t } = this;
    clearTimeout(e.removeTimeout),
      t.addClass("ripple-wave-out"),
      (e.removeTimeout = setTimeout(() => {
        e.destroy();
      }, 300)),
      t.animationEnd(() => {
        clearTimeout(e.removeTimeout), e.destroy();
      });
  }
  remove() {
    const e = this;
    e.shouldBeRemoved ||
      ((e.removeTimeout = setTimeout(() => {
        e.destroy();
      }, 400)),
      (e.shouldBeRemoved = !0),
      e.$rippleWaveEl.hasClass("ripple-wave-in") && e.out());
  }
}
var Fr = {
  name: "touch-ripple",
  static: { TouchRipple: Vr },
  create() {
    this.touchRipple = {
      create() {
        for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
          t[r] = arguments[r];
        return new Vr(...t);
      },
    };
  },
};
const Yr = [],
  Gr = [];
var Wr = class extends Ze {
  constructor(e, t) {
    super(t, [e]);
    const r = this,
      a = {};
    r.useModulesParams(a), (r.params = He(a, t)), (r.opened = !1);
    let s = r.params.containerEl ? F(r.params.containerEl).eq(0) : e.$el;
    return (
      s.length || (s = e.$el),
      (r.$containerEl = s),
      (r.containerEl = s[0]),
      r.useModules(),
      this
    );
  }
  onOpen() {
    const e = this;
    (e.opened = !0),
      Yr.push(e),
      F("html").addClass(`with-modal-${e.type.toLowerCase()}`),
      e.$el.trigger(`modal:open ${e.type.toLowerCase()}:open`),
      e.emit(`local::open modalOpen ${e.type}Open`, e);
  }
  onOpened() {
    const e = this;
    e.$el.trigger(`modal:opened ${e.type.toLowerCase()}:opened`),
      e.emit(`local::opened modalOpened ${e.type}Opened`, e);
  }
  onClose() {
    const e = this;
    (e.opened = !1),
      e.type &&
        e.$el &&
        (Yr.splice(Yr.indexOf(e), 1),
        F("html").removeClass(`with-modal-${e.type.toLowerCase()}`),
        e.$el.trigger(`modal:close ${e.type.toLowerCase()}:close`),
        e.emit(`local::close modalClose ${e.type}Close`, e));
  }
  onClosed() {
    const e = this;
    e.type &&
      e.$el &&
      (e.$el.removeClass("modal-out"),
      e.$el.hide(),
      e.params.backdrop &&
        (e.params.backdropUnique || e.forceBackdropUnique) &&
        e.$backdropEl &&
        e.$backdropEl.remove(),
      e.$el.trigger(`modal:closed ${e.type.toLowerCase()}:closed`),
      e.emit(`local::closed modalClosed ${e.type}Closed`, e));
  }
  open(e, t) {
    const r = this,
      a = u(),
      s = r.app,
      n = r.$el,
      i = r.$backdropEl,
      o = r.type;
    let l = !0;
    if (
      (void 0 !== e
        ? (l = e)
        : void 0 !== r.params.animate && (l = r.params.animate),
      (!n || n.hasClass("modal-in")) &&
        (!1 === e && n[0] && "dialog" !== o && (n[0].style.display = "block"),
        !t))
    )
      return r;
    if ("dialog" === o && s.params.modal.queueDialogs) {
      let e;
      if (
        (F(".dialog.modal-in").length > 0
          ? (e = !0)
          : Yr.length > 0 &&
            Yr.forEach((t) => {
              "dialog" === t.type && (e = !0);
            }),
        e)
      )
        return Gr.push(r), r;
    }
    const c = n.parent(),
      p = n.parents(a).length > 0;
    function d() {
      n.hasClass("modal-out")
        ? r.onClosed()
        : n.hasClass("modal-in") && r.onOpened();
    }
    return (
      c.is(r.$containerEl) ||
        (r.$containerEl.append(n),
        r.once(`${o}Closed`, () => {
          p ? c.append(n) : n.remove();
        })),
      n.show(),
      r.params.backdrop &&
        (r.params.backdropUnique || r.forceBackdropUnique) &&
        r.$backdropEl &&
        r.$backdropEl.insertBefore(n),
      (r._clientLeft = n[0].clientLeft),
      l
        ? (i && (i.removeClass("not-animated"), i.addClass("backdrop-in")),
          n.animationEnd(() => {
            d();
          }),
          n.transitionEnd(() => {
            d();
          }),
          n.removeClass("modal-out not-animated").addClass("modal-in"),
          r.onOpen())
        : (i && i.addClass("backdrop-in not-animated"),
          n.removeClass("modal-out").addClass("modal-in not-animated"),
          r.onOpen(),
          r.onOpened()),
      r
    );
  }
  close(e) {
    const t = this,
      r = t.$el,
      a = t.$backdropEl;
    let s = !0;
    if (
      (void 0 !== e
        ? (s = e)
        : void 0 !== t.params.animate && (s = t.params.animate),
      !r || !r.hasClass("modal-in"))
    )
      return Gr.indexOf(t) >= 0 && Gr.splice(Gr.indexOf(t), 1), t;
    if (a) {
      let e = !0;
      "popup" === t.type &&
        t.$el
          .prevAll(".popup.modal-in")
          .add(t.$el.nextAll(".popup.modal-in"))
          .each((r) => {
            const a = r.f7Modal;
            a &&
              a.params.closeByBackdropClick &&
              a.params.backdrop &&
              a.backdropEl === t.backdropEl &&
              (e = !1);
          }),
        e &&
          (a[s ? "removeClass" : "addClass"]("not-animated"),
          a.removeClass("backdrop-in"));
    }
    function n() {
      r.hasClass("modal-out")
        ? t.onClosed()
        : r.hasClass("modal-in") && t.onOpened();
    }
    return (
      r[s ? "removeClass" : "addClass"]("not-animated"),
      s
        ? (r.animationEnd(() => {
            n();
          }),
          r.transitionEnd(() => {
            n();
          }),
          r.removeClass("modal-in").addClass("modal-out"),
          t.onClose())
        : (r
            .addClass("not-animated")
            .removeClass("modal-in")
            .addClass("modal-out"),
          t.onClose(),
          t.onClosed()),
      "dialog" === t.type &&
        (function () {
          if (0 === Gr.length) return;
          Gr.shift().open();
        })(),
      t
    );
  }
  destroy() {
    const e = this;
    e.destroyed ||
      (e.emit(
        `local::beforeDestroy modalBeforeDestroy ${e.type}BeforeDestroy`,
        e
      ),
      e.$el &&
        (e.$el.trigger(
          `modal:beforedestroy ${e.type.toLowerCase()}:beforedestroy`
        ),
        e.$el.length && e.$el[0].f7Modal && delete e.$el[0].f7Modal),
      Me(e),
      (e.destroyed = !0));
  }
};
var Ur = class extends Wr {
    constructor(e, t) {
      const r = He({ backdrop: !0, closeByBackdropClick: !0, on: {} }, t);
      super(e, r);
      const a = this;
      let s, n;
      if (
        ((a.params = r),
        (s = a.params.el ? F(a.params.el) : F(a.params.content)),
        s && s.length > 0 && s[0].f7Modal)
      )
        return s[0].f7Modal;
      if (0 === s.length) return a.destroy();
      function i(e) {
        a && !a.destroyed && n && e.target === n[0] && a.close();
      }
      return (
        a.params.backdrop &&
          ((n = e.$el.children(".custom-modal-backdrop")),
          0 === n.length &&
            ((n = F('<div class="custom-modal-backdrop"></div>')),
            e.$el.append(n))),
        a.on("customModalOpened", () => {
          a.params.closeByBackdropClick &&
            a.params.backdrop &&
            e.on("click", i);
        }),
        a.on("customModalClose", () => {
          a.params.closeByBackdropClick &&
            a.params.backdrop &&
            e.off("click", i);
        }),
        He(a, {
          app: e,
          $el: s,
          el: s[0],
          $backdropEl: n,
          backdropEl: n && n[0],
          type: "customModal",
        }),
        (s[0].f7Modal = a),
        a
      );
    }
  },
  Xr = {
    name: "modal",
    static: { Modal: Wr, CustomModal: Ur },
    create() {
      const e = this;
      e.customModal = { create: (t) => new Ur(e, t) };
    },
    params: { modal: { queueDialogs: !0 } },
  };
$t.use([zt]),
  st.use([
    nt,
    it,
    ot,
    lt,
    ct,
    It,
    Pt,
    $r,
    Ar,
    Or,
    Rr,
    Br,
    Hr,
    Nr,
    jr,
    qr,
    Fr,
    Xr,
  ]);
var Qr = class extends Wr {
    constructor(e, t) {
      const r = He({ on: {} }, e.params.popup, t);
      super(e, r);
      const a = this,
        s = f(),
        n = u(),
        i = Xe(),
        o = Qe();
      let l, c, p, d;
      if (
        ((a.params = r),
        (l = a.params.el
          ? F(a.params.el).eq(0)
          : F(a.params.content)
              .filter((e) => 1 === e.nodeType)
              .eq(0)),
        l && l.length > 0 && l[0].f7Modal)
      )
        return l[0].f7Modal;
      if (0 === l.length) return a.destroy();
      function h(e) {
        const t = e.target,
          r = F(t);
        if (
          !(
            !o.desktop &&
            o.cordova &&
            ((s.Keyboard && s.Keyboard.isVisible) ||
              (s.cordova.plugins &&
                s.cordova.plugins.Keyboard &&
                s.cordova.plugins.Keyboard.isVisible))
          ) &&
          0 === r.closest(a.el).length &&
          a.params &&
          a.params.closeByBackdropClick &&
          a.params.backdrop &&
          a.backdropEl &&
          a.backdropEl === t
        ) {
          let e = !0;
          a.$el.nextAll(".popup.modal-in").each((t) => {
            const r = t.f7Modal;
            r &&
              r.params.closeByBackdropClick &&
              r.params.backdrop &&
              r.backdropEl === a.backdropEl &&
              (e = !1);
          }),
            e && a.close();
        }
      }
      function m(e) {
        27 === e.keyCode && a.params.closeOnEscape && a.close();
      }
      function g(t) {
        return (e.height - 2 * t) / e.height;
      }
      a.params.backdrop && a.params.backdropEl
        ? (c = F(a.params.backdropEl))
        : a.params.backdrop &&
          (a.params.backdropUnique
            ? ((c = F(
                '<div class="popup-backdrop popup-backdrop-unique"></div>'
              )),
              a.$containerEl.append(c))
            : (c = a.$containerEl.children(".popup-backdrop")),
          0 === c.length &&
            ((c = F('<div class="popup-backdrop"></div>')),
            a.$containerEl.append(c))),
        He(a, {
          app: e,
          push: l.hasClass("popup-push") || a.params.push,
          $el: l,
          el: l[0],
          $backdropEl: c,
          backdropEl: c && c[0],
          type: "popup",
          $htmlEl: F("html"),
        }),
        a.params.push && l.addClass("popup-push");
      let v,
        b,
        w,
        y,
        E,
        C,
        x,
        S,
        k,
        T,
        M,
        A = !0,
        $ = !1,
        P = !1;
      function O(e) {
        !$ &&
          A &&
          a.params.swipeToClose &&
          ((a.params.swipeHandler &&
            0 === F(e.target).closest(a.params.swipeHandler).length) ||
            (($ = !0),
            (P = !1),
            (v = {
              x: "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX,
              y: "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY,
            }),
            (y = Oe()),
            (w = void 0),
            a.params.swipeHandler ||
              "touchstart" !== e.type ||
              (C = F(e.target).closest(".page-content")[0])));
      }
      function L(t) {
        if (!$) return;
        if (
          ((b = {
            x: "touchmove" === t.type ? t.targetTouches[0].pageX : t.pageX,
            y: "touchmove" === t.type ? t.targetTouches[0].pageY : t.pageY,
          }),
          void 0 === w &&
            (w = !!(w || Math.abs(b.x - v.x) > Math.abs(b.y - v.y))),
          w)
        )
          return ($ = !1), void (P = !1);
        (E = v.y - b.y), d && p && E > 0 && (E = 0);
        const r = E < 0 ? "to-bottom" : "to-top";
        if (
          (l.transition(0),
          "string" == typeof a.params.swipeToClose &&
            r !== a.params.swipeToClose)
        )
          return l.transform(""), void l.transition("");
        if (P)
          a.emit("local::swipeMove popupSwipeMove", a),
            a.$el.trigger("popup:swipemove");
        else {
          if (
            (d &&
              p &&
              ((T = l[0].offsetHeight),
              (M = l.prevAll(".popup.modal-in").eq(0)),
              0 === M.length && (M = e.$el.children(".view, .views"))),
            C &&
              ((x = C.scrollTop),
              (k = C.scrollHeight),
              (S = C.offsetHeight),
              !(
                k === S ||
                ("to-bottom" === r && 0 === x) ||
                ("to-top" === r && x === k - S)
              )))
          )
            return l.transform(""), l.transition(""), ($ = !1), void (P = !1);
          (P = !0),
            a.emit("local::swipeStart popupSwipeStart", a),
            a.$el.trigger("popup:swipestart");
        }
        if ((t.preventDefault(), d && p)) {
          const e = 1 - Math.abs(E / T),
            t = 1 - (1 - g(p)) * e;
          M.hasClass("popup")
            ? M.hasClass("popup-push")
              ? M.transition(0).forEach((r) => {
                  r.style.setProperty(
                    "transform",
                    `translate3d(0, calc(-1 * ${e} * (var(--f7-popup-push-offset) + 10px)) , 0px) scale(${t})`,
                    "important"
                  );
                })
              : M.transition(0).forEach((e) => {
                  e.style.setProperty(
                    "transform",
                    `translate3d(0, 0px , 0px) scale(${t})`,
                    "important"
                  );
                })
            : M.transition(0).forEach((e) => {
                e.style.setProperty(
                  "transform",
                  `translate3d(0,0,0) scale(${t})`,
                  "important"
                );
              });
        }
        l.transition(0).transform(`translate3d(0,${-E}px,0)`);
      }
      function R() {
        if ((($ = !1), !P)) return;
        a.emit("local::swipeEnd popupSwipeEnd", a),
          a.$el.trigger("popup:swipeend"),
          (P = !1),
          (A = !1),
          l.transition(""),
          d && p && M.transition("").transform("");
        const e = E <= 0 ? "to-bottom" : "to-top";
        if (
          "string" == typeof a.params.swipeToClose &&
          e !== a.params.swipeToClose
        )
          return l.transform(""), void (A = !0);
        const t = Math.abs(E),
          r = new Date().getTime() - y;
        (r < 300 && t > 20) || (r >= 300 && t > 100)
          ? $e(() => {
              "to-bottom" === e
                ? l.addClass("swipe-close-to-bottom")
                : l.addClass("swipe-close-to-top"),
                l.transform(""),
                a.emit("local::swipeclose popupSwipeClose", a),
                a.$el.trigger("popup:swipeclose"),
                a.close(),
                (A = !0);
            })
          : ((A = !0), l.transform(""));
      }
      const I = !!i.passiveListener && { passive: !0 };
      let z;
      a.params.swipeToClose &&
        (l.on(e.touchEvents.start, O, I),
        e.on("touchmove", L),
        e.on("touchend:passive", R),
        a.once("popupDestroy", () => {
          l.off(e.touchEvents.start, O, I),
            e.off("touchmove", L),
            e.off("touchend:passive", R);
        }));
      const B = () => {
          const t = d;
          a.push &&
            (d =
              a.push &&
              (e.width < 630 ||
                e.height < 630 ||
                l.hasClass("popup-tablet-fullscreen"))),
            d && !t
              ? H()
              : d && t
              ? a.$htmlEl[0].style.setProperty("--f7-popup-push-scale", g(p))
              : !d &&
                t &&
                (a.$htmlEl.removeClass("with-modal-popup-push"),
                a.$htmlEl[0].style.removeProperty("--f7-popup-push-scale"));
        },
        H = () => {
          e.off("resize", B),
            a.push &&
              (d =
                a.push &&
                (e.width < 630 ||
                  e.height < 630 ||
                  l.hasClass("popup-tablet-fullscreen"))),
            d &&
              ((p = parseInt(l.css("--f7-popup-push-offset"), 10)),
              Number.isNaN(p) && (p = 0),
              p || (p = "ios" === e.theme ? 44 : 48),
              a.$htmlEl[0].style.setProperty(
                "--f7-popup-push-offset",
                `${p}px`
              ),
              l.addClass("popup-push"),
              a.$htmlEl.addClass("with-modal-popup-push"),
              a.$htmlEl[0].style.setProperty("--f7-popup-push-scale", g(p))),
            e.on("resize", B);
        };
      return (
        a.on("open", () => {
          (z = !1),
            a.params.closeOnEscape && F(n).on("keydown", m),
            l.prevAll(".popup.modal-in").addClass("popup-behind"),
            H();
        }),
        a.on("opened", () => {
          l.removeClass("swipe-close-to-bottom swipe-close-to-top"),
            a.params.closeByBackdropClick && e.on("click", h);
        }),
        a.on("close", () => {
          (z = a.$el.prevAll(".popup-push.modal-in").length > 0),
            a.params.closeOnEscape && F(n).off("keydown", m),
            a.params.closeByBackdropClick && e.off("click", h),
            l.prevAll(".popup.modal-in").eq(0).removeClass("popup-behind"),
            d &&
              p &&
              !z &&
              (a.$htmlEl.removeClass("with-modal-popup-push"),
              a.$htmlEl.addClass("with-modal-popup-push-closing")),
            e.off("resize", B);
        }),
        a.on("closed", () => {
          l.removeClass("popup-behind"),
            d &&
              p &&
              !z &&
              (a.$htmlEl.removeClass("with-modal-popup-push-closing"),
              a.$htmlEl[0].style.removeProperty("--f7-popup-push-scale"),
              a.$htmlEl[0].style.removeProperty("--f7-popup-push-offset"));
        }),
        (l[0].f7Modal = a),
        a
      );
    }
  },
  Kr = {
    name: "popup",
    params: {
      popup: {
        backdrop: !0,
        backdropEl: void 0,
        backdropUnique: !1,
        closeByBackdropClick: !0,
        closeOnEscape: !1,
        swipeToClose: !1,
        swipeHandler: null,
        push: !1,
        containerEl: null,
      },
    },
    static: { Popup: Qr },
    create() {
      this.popup = et({
        app: this,
        constructor: Qr,
        defaultSelector: ".popup.modal-in",
        parentSelector: ".popup",
      });
    },
    clicks: {
      ".popup-open": function (e, t) {
        void 0 === t && (t = {});
        this.popup.open(t.popup, t.animate, e);
      },
      ".popup-close": function (e, t) {
        void 0 === t && (t = {});
        this.popup.close(t.popup, t.animate, e);
      },
    },
  };
var Zr = class extends Wr {
    constructor(e, t) {
      const r = He({ on: {} }, e.params.toast, t);
      super(e, r);
      const a = this,
        s = f();
      (a.app = e), (a.params = r);
      const { closeButton: n, closeTimeout: i } = a.params;
      let o, l;
      if (a.params.el) o = F(a.params.el);
      else {
        const e = a.render();
        o = F(e);
      }
      return o && o.length > 0 && o[0].f7Modal
        ? o[0].f7Modal
        : 0 === o.length
        ? a.destroy()
        : (He(a, { $el: o, el: o[0], type: "toast" }),
          (o[0].f7Modal = a),
          n &&
            (o.find(".toast-button").on("click", () => {
              a.emit("local::closeButtonClick toastCloseButtonClick", a),
                a.close();
            }),
            a.on("beforeDestroy", () => {
              o.find(".toast-button").off("click");
            })),
          a.on("open", () => {
            F(".toast.modal-in").each((t) => {
              const r = e.toast.get(t);
              t !== a.el && r && r.close();
            }),
              i &&
                (l = $e(() => {
                  a.close();
                }, i));
          }),
          a.on("close", () => {
            s.clearTimeout(l);
          }),
          a.params.destroyOnClose &&
            a.once("closed", () => {
              setTimeout(() => {
                a.destroy();
              }, 0);
            }),
          a);
    }
    render() {
      const e = this;
      if (e.params.render) return e.params.render.call(e, e);
      const {
        position: t,
        horizontalPosition: r,
        cssClass: a,
        icon: s,
        text: n,
        closeButton: i,
        closeButtonColor: o,
        closeButtonText: l,
      } = e.params;
      return rt(
        "div",
        {
          class: `toast toast-${t} ${
            "top" === t || "bottom" === t ? `toast-horizontal-${r}` : ""
          } ${a || ""} ${s ? "toast-with-icon" : ""}`,
        },
        rt(
          "div",
          { class: "toast-content" },
          s && rt("div", { class: "toast-icon" }, s),
          rt("div", { class: "toast-text" }, n),
          i &&
            !s &&
            rt(
              "a",
              { class: "toast-button button " + (o ? `color-${o}` : "") },
              l
            )
        )
      );
    }
  },
  Jr = {
    name: "toast",
    static: { Toast: Zr },
    create() {
      const e = this;
      e.toast = He(
        {},
        et({ app: e, constructor: Zr, defaultSelector: ".toast.modal-in" }),
        { show: (t) => (He(t, { destroyOnClose: !0 }), new Zr(e, t).open()) }
      );
    },
    params: {
      toast: {
        icon: null,
        text: null,
        position: "bottom",
        horizontalPosition: "left",
        closeButton: !1,
        closeButtonColor: null,
        closeButtonText: "Ok",
        closeTimeout: null,
        cssClass: null,
        render: null,
        containerEl: null,
      },
    },
  };
const ea = {
  ignoreTypes: ["checkbox", "button", "submit", "range", "radio", "image"],
  createTextareaResizableShadow() {
    const e = u(),
      t = F(e.createElement("textarea"));
    t.addClass("textarea-resizable-shadow"),
      t.prop({ disabled: !0, readonly: !0 }),
      (ea.textareaResizableShadow = t);
  },
  textareaResizableShadow: void 0,
  resizeTextarea(e) {
    const t = this,
      r = f(),
      a = F(e);
    ea.textareaResizableShadow || ea.createTextareaResizableShadow();
    const s = ea.textareaResizableShadow;
    if (!a.length) return;
    if (!a.hasClass("resizable")) return;
    0 === ea.textareaResizableShadow.parents().length && t.$el.append(s);
    const n = r.getComputedStyle(a[0]);
    "padding-top padding-bottom padding-left padding-right margin-left margin-right margin-top margin-bottom width font-size font-family font-style font-weight line-height font-variant text-transform letter-spacing border box-sizing display"
      .split(" ")
      .forEach((e) => {
        let t = n[e];
        "font-size line-height letter-spacing width".split(" ").indexOf(e) >=
          0 && (t = t.replace(",", ".")),
          s.css(e, t);
      });
    const i = a[0].clientHeight;
    s.val("");
    const o = s[0].scrollHeight;
    s.val(a.val()), s.css("height", 0);
    const l = s[0].scrollHeight;
    i !== l &&
      (l > o ? a.css("height", `${l}px`) : l < i && a.css("height", ""),
      (l > o || l < i) &&
        (a.trigger("textarea:resize", {
          initialHeight: o,
          currentHeight: i,
          scrollHeight: l,
        }),
        t.emit("textareaResize", {
          initialHeight: o,
          currentHeight: i,
          scrollHeight: l,
        })));
  },
  validate(e) {
    const t = F(e);
    if (!t.length) return !0;
    const r = t.parents(".item-input"),
      a = t.parents(".input");
    function s() {
      t[0].f7ValidateReadonly && (t[0].readOnly = !0);
    }
    t[0].f7ValidateReadonly && (t[0].readOnly = !1);
    const n = t[0].validity,
      i = t.dataset().errorMessage || t[0].validationMessage || "";
    if (!n) return s(), !0;
    if (!n.valid) {
      let e = t.nextAll(".item-input-error-message, .input-error-message");
      return (
        i &&
          (0 === e.length &&
            ((e = F(
              `<div class="${
                a.length ? "input-error-message" : "item-input-error-message"
              }"></div>`
            )),
            e.insertAfter(t)),
          e.text(i)),
        e.length > 0 &&
          (r.addClass("item-input-with-error-message"),
          a.addClass("input-with-error-message")),
        r.addClass("item-input-invalid"),
        a.addClass("input-invalid"),
        t.addClass("input-invalid"),
        s(),
        !1
      );
    }
    return (
      r.removeClass("item-input-invalid item-input-with-error-message"),
      a.removeClass("input-invalid input-with-error-message"),
      t.removeClass("input-invalid"),
      s(),
      !0
    );
  },
  validateInputs(e) {
    const t = this;
    return (
      F(e)
        .find("input, textarea, select")
        .map((e) => t.input.validate(e))
        .indexOf(!1) < 0
    );
  },
  focus(e) {
    const t = F(e),
      r = t.attr("type");
    ea.ignoreTypes.indexOf(r) >= 0 ||
      (t.parents(".item-input").addClass("item-input-focused"),
      t.parents(".input").addClass("input-focused"),
      t.addClass("input-focused"));
  },
  blur(e) {
    const t = F(e);
    t.parents(".item-input").removeClass("item-input-focused"),
      t.parents(".input").removeClass("input-focused"),
      t.removeClass("input-focused");
  },
  checkEmptyState(e) {
    const t = this;
    let r = F(e);
    if (
      (r.is("input, select, textarea, .item-input [contenteditable]") ||
        (r = r
          .find("input, select, textarea, .item-input [contenteditable]")
          .eq(0)),
      !r.length)
    )
      return;
    let a;
    a = r[0].hasAttribute("contenteditable")
      ? r.find(".text-editor-placeholder").length
        ? ""
        : r.html()
      : r.val();
    const s = r.parents(".item-input"),
      n = r.parents(".input");
    (a && "string" == typeof a && "" !== a.trim()) ||
    (Array.isArray(a) && a.length > 0)
      ? (s.addClass("item-input-with-value"),
        n.addClass("input-with-value"),
        r.addClass("input-with-value"),
        r.trigger("input:notempty"),
        t.emit("inputNotEmpty", r[0]))
      : (s.removeClass("item-input-with-value"),
        n.removeClass("input-with-value"),
        r.removeClass("input-with-value"),
        r.trigger("input:empty"),
        t.emit("inputEmpty", r[0]));
  },
  scrollIntoView(e, t, r, a) {
    void 0 === t && (t = 0);
    const s = F(e),
      n = s
        .parents(".page-content, .panel, .card-expandable .card-content")
        .eq(0);
    if (!n.length) return !1;
    const i = n[0].offsetHeight,
      o = n[0].scrollTop,
      l = parseInt(n.css("padding-top"), 10),
      c = parseInt(n.css("padding-bottom"), 10),
      p = n.offset().top - o,
      d = s.offset().top - p,
      u = d + o - l,
      h = d + o - i + c + s[0].offsetHeight,
      f = u + (h - u) / 2;
    return o > u
      ? (n.scrollTop(r ? f : u, t), !0)
      : o < h
      ? (n.scrollTop(r ? f : h, t), !0)
      : (a && n.scrollTop(r ? f : h, t), !1);
  },
  init() {
    const e = this,
      t = Qe(),
      r = f(),
      a = u();
    ea.createTextareaResizableShadow(),
      F(a).on("click", ".input-clear-button", function () {
        const t = F(this).siblings("input, textarea").eq(0),
          r = t.val();
        t.val("").trigger("input change").focus().trigger("input:clear", r),
          e.emit("inputClear", r);
      }),
      F(a).on("mousedown", ".input-clear-button", function (e) {
        e.preventDefault();
      }),
      F(a).on(
        "change input",
        "input, textarea, select, .item-input [contenteditable]",
        function () {
          const t = F(this),
            r = t.attr("type"),
            a = t[0].nodeName.toLowerCase(),
            s = t[0].hasAttribute("contenteditable");
          ea.ignoreTypes.indexOf(r) >= 0 ||
            (e.input.checkEmptyState(t),
            s ||
              (null !== t.attr("data-validate-on-blur") ||
                (!t.dataset().validate && null === t.attr("validate")) ||
                e.input.validate(t),
              "textarea" === a &&
                t.hasClass("resizable") &&
                e.input.resizeTextarea(t)));
        },
        !0
      ),
      F(a).on(
        "focus",
        "input, textarea, select, .item-input [contenteditable]",
        function () {
          const s = this;
          e.params.input.scrollIntoViewOnFocus &&
            (t.android
              ? F(r).once("resize", () => {
                  a &&
                    a.activeElement === s &&
                    e.input.scrollIntoView(
                      s,
                      e.params.input.scrollIntoViewDuration,
                      e.params.input.scrollIntoViewCentered,
                      e.params.input.scrollIntoViewAlways
                    );
                })
              : e.input.scrollIntoView(
                  s,
                  e.params.input.scrollIntoViewDuration,
                  e.params.input.scrollIntoViewCentered,
                  e.params.input.scrollIntoViewAlways
                )),
            e.input.focus(s);
        },
        !0
      ),
      F(a).on(
        "blur",
        "input, textarea, select, .item-input [contenteditable]",
        function () {
          const t = F(this),
            r = t[0].nodeName.toLowerCase();
          e.input.blur(t),
            (t.dataset().validate ||
              null !== t.attr("validate") ||
              null !== t.attr("data-validate-on-blur")) &&
              e.input.validate(t),
            "textarea" === r &&
              t.hasClass("resizable") &&
              ea.textareaResizableShadow &&
              ea.textareaResizableShadow.remove();
        },
        !0
      ),
      F(a).on(
        "invalid",
        "input, textarea, select",
        function (t) {
          const r = F(this);
          null !== r.attr("data-validate-on-blur") ||
            (!r.dataset().validate && null === r.attr("validate")) ||
            (t.preventDefault(), e.input.validate(r));
        },
        !0
      );
  },
};
var ta = {
    name: "input",
    params: {
      input: {
        scrollIntoViewOnFocus: void 0,
        scrollIntoViewCentered: !1,
        scrollIntoViewDuration: 0,
        scrollIntoViewAlways: !1,
      },
    },
    create() {
      const e = this;
      void 0 === e.params.input.scrollIntoViewOnFocus &&
        (e.params.input.scrollIntoViewOnFocus = Qe().android),
        Fe(e, { input: ea });
    },
    on: {
      init() {
        this.input.init();
      },
      tabMounted(e) {
        const t = this,
          r = F(e);
        r.find(".item-input, .input").each((e) => {
          F(e)
            .find("input, select, textarea, [contenteditable]")
            .each((e) => {
              const r = F(e);
              ea.ignoreTypes.indexOf(r.attr("type")) >= 0 ||
                t.input.checkEmptyState(r);
            });
        }),
          r.find("textarea.resizable").each((e) => {
            t.input.resizeTextarea(e);
          });
      },
      pageInit(e) {
        const t = this,
          r = e.$el;
        r.find(".item-input, .input").each((e) => {
          F(e)
            .find("input, select, textarea, [contenteditable]")
            .each((e) => {
              const r = F(e);
              ea.ignoreTypes.indexOf(r.attr("type")) >= 0 ||
                t.input.checkEmptyState(r);
            });
        }),
          r.find("textarea.resizable").each((e) => {
            t.input.resizeTextarea(e);
          });
      },
      "panelBreakpoint panelCollapsedBreakpoint panelResize panelOpen panelSwipeOpen resize viewMasterDetailBreakpoint":
        function (e) {
          const t = this;
          e && e.$el
            ? e.$el.find("textarea.resizable").each((e) => {
                t.input.resizeTextarea(e);
              })
            : F("textarea.resizable").each((e) => {
                t.input.resizeTextarea(e);
              });
        },
    },
  },
  ra = { name: "checkbox" },
  aa = { name: "radio" };
var sa = class extends Ze {
    constructor(e, t) {
      super(t, [e]);
      const r = this,
        a = {
          el: null,
          inputEl: null,
          valueEl: null,
          value: 0,
          formatValue: null,
          step: 1,
          min: 0,
          max: 100,
          watchInput: !0,
          autorepeat: !1,
          autorepeatDynamic: !1,
          wraps: !1,
          manualInputMode: !1,
          decimalPoint: 4,
          buttonsEndInputMode: !0,
        };
      r.useModulesParams(a),
        (r.params = He(a, t)),
        r.params.value < r.params.min && (r.params.value = r.params.min),
        r.params.value > r.params.max && (r.params.value = r.params.max);
      const s = r.params.el;
      if (!s) return r;
      const n = F(s);
      if (0 === n.length) return r;
      if (n[0].f7Stepper) return n[0].f7Stepper;
      let i, o;
      if (
        (r.params.inputEl
          ? (i = F(r.params.inputEl))
          : n.find(".stepper-input-wrap").find("input, textarea").length &&
            (i = n.find(".stepper-input-wrap").find("input, textarea").eq(0)),
        i && i.length)
      ) {
        "step min max".split(" ").forEach((e) => {
          !t[e] && i.attr(e) && (r.params[e] = parseFloat(i.attr(e)));
        });
        const e = parseInt(r.params.decimalPoint, 10);
        Number.isNaN(e)
          ? (r.params.decimalPoint = 0)
          : (r.params.decimalPoint = e);
        const a = parseFloat(i.val());
        void 0 !== t.value ||
          Number.isNaN(a) ||
          (!a && 0 !== a) ||
          (r.params.value = a);
      }
      r.params.valueEl
        ? (o = F(r.params.valueEl))
        : n.find(".stepper-value").length &&
          (o = n.find(".stepper-value").eq(0));
      const l = n.find(".stepper-button-plus"),
        c = n.find(".stepper-button-minus"),
        { step: p, min: d, max: u, value: h, decimalPoint: f } = r.params;
      He(r, {
        app: e,
        $el: n,
        el: n[0],
        $buttonPlusEl: l,
        buttonPlusEl: l[0],
        $buttonMinusEl: c,
        buttonMinusEl: c[0],
        $inputEl: i,
        inputEl: i ? i[0] : void 0,
        $valueEl: o,
        valueEl: o ? o[0] : void 0,
        step: p,
        min: d,
        max: u,
        value: h,
        decimalPoint: f,
        typeModeChanged: !1,
      }),
        (n[0].f7Stepper = r);
      const m = {};
      let g,
        v,
        b,
        w,
        y,
        E = null,
        C = !1,
        x = !1;
      function S(e, t, r, a, s, n) {
        clearTimeout(y),
          (y = setTimeout(
            () => {
              1 === e && ((b = !0), (C = !0)),
                clearInterval(w),
                n(),
                (w = setInterval(() => {
                  n();
                }, s)),
                e < t && S(e + 1, t, r, a, s / 2, n);
            },
            1 === e ? r : a
          ));
      }
      function k(e) {
        if (g) return;
        if (x) return;
        if (
          (F(e.target).closest(l).length
            ? (E = "increment")
            : F(e.target).closest(c).length && (E = "decrement"),
          !E)
        )
          return;
        (m.x = "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX),
          (m.y = "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY),
          (g = !0),
          (v = void 0);
        S(1, r.params.autorepeatDynamic ? 4 : 1, 500, 1e3, 300, () => {
          r[E]();
        });
      }
      function T(e) {
        if (!g) return;
        if (x) return;
        const t = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX,
          r = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY;
        void 0 !== v ||
          C ||
          (v = !!(v || Math.abs(r - m.y) > Math.abs(t - m.x)));
        const a = ((t - m.x) ** 2 + (r - m.y) ** 2) ** 0.5;
        (v || a > 20) && ((g = !1), clearTimeout(y), clearInterval(w));
      }
      function M() {
        clearTimeout(y), clearInterval(w), (E = null), (C = !1), (g = !1);
      }
      function A() {
        x
          ? r.params.buttonsEndInputMode && ((x = !1), r.endTypeMode(!0))
          : b
          ? (b = !1)
          : r.decrement(!0);
      }
      function $() {
        x
          ? r.params.buttonsEndInputMode && ((x = !1), r.endTypeMode(!0))
          : b
          ? (b = !1)
          : r.increment(!0);
      }
      function P(e) {
        !e.target.readOnly &&
          r.params.manualInputMode &&
          ((x = !0),
          "number" == typeof e.target.selectionStart &&
            ((e.target.selectionStart = e.target.value.length),
            (e.target.selectionEnd = e.target.value.length)));
      }
      function O(e) {
        (13 !== e.keyCode && 13 !== e.which) ||
          (e.preventDefault(), (x = !1), r.endTypeMode());
      }
      function L() {
        (x = !1), r.endTypeMode(!0);
      }
      function R(e) {
        x
          ? r.typeValue(e.target.value)
          : (e.detail && e.detail.sentByF7Stepper) ||
            r.setValue(e.target.value, !0);
      }
      return (
        (r.attachEvents = function () {
          c.on("click", A),
            l.on("click", $),
            r.params.watchInput &&
              i &&
              i.length &&
              (i.on("input", R),
              i.on("click", P),
              i.on("blur", L),
              i.on("keyup", O)),
            r.params.autorepeat &&
              (e.on("touchstart:passive", k),
              e.on("touchmove:active", T),
              e.on("touchend:passive", M));
        }),
        (r.detachEvents = function () {
          c.off("click", A),
            l.off("click", $),
            r.params.watchInput &&
              i &&
              i.length &&
              (i.off("input", R),
              i.off("click", P),
              i.off("blur", L),
              i.off("keyup", O));
        }),
        r.useModules(),
        r.init(),
        r
      );
    }
    minus() {
      return this.decrement();
    }
    plus() {
      return this.increment();
    }
    decrement() {
      const e = this;
      return e.setValue(e.value - e.step, !1, !0);
    }
    increment() {
      const e = this;
      return e.setValue(e.value + e.step, !1, !0);
    }
    setValue(e, t, r) {
      const a = this,
        { step: s, min: n, max: i } = a,
        o = a.value;
      let l = Math.round(e / s) * s;
      a.params.wraps && r
        ? (l > i && (l = n), l < n && (l = i))
        : (l = Math.max(Math.min(l, i), n)),
        Number.isNaN(l) && (l = o),
        (a.value = l);
      if (!(o !== l) && !t) return a;
      a.$el.trigger("stepper:change", a.value);
      const c = a.formatValue(a.value);
      return (
        a.$inputEl &&
          a.$inputEl.length &&
          (a.$inputEl.val(c),
          a.$inputEl.trigger("input change", { sentByF7Stepper: !0 })),
        a.$valueEl && a.$valueEl.length && a.$valueEl.html(c),
        a.emit("local::change stepperChange", a, a.value),
        a
      );
    }
    endTypeMode(e) {
      const t = this,
        { min: r, max: a } = t;
      let s = parseFloat(t.value);
      if (
        (Number.isNaN(s) && (s = 0),
        (s = Math.max(Math.min(s, a), r)),
        (t.value = s),
        !t.typeModeChanged)
      )
        return t.$inputEl && t.$inputEl.length && !e && t.$inputEl.blur(), t;
      (t.typeModeChanged = !1), t.$el.trigger("stepper:change", t.value);
      const n = t.formatValue(t.value);
      return (
        t.$inputEl &&
          t.$inputEl.length &&
          (t.$inputEl.val(n),
          t.$inputEl.trigger("input change", { sentByF7Stepper: !0 }),
          e || t.$inputEl.blur()),
        t.$valueEl && t.$valueEl.length && t.$valueEl.html(n),
        t.emit("local::change stepperChange", t, t.value),
        t
      );
    }
    typeValue(e) {
      const t = this;
      t.typeModeChanged = !0;
      let r = String(e);
      if (1 === r.length && "-" === r) return t;
      if (
        r.lastIndexOf(".") + 1 !== r.length &&
        r.lastIndexOf(",") + 1 !== r.length
      ) {
        let e = parseFloat(r.replace(",", "."));
        if (0 === e)
          return (t.value = r.replace(",", ".")), t.$inputEl.val(t.value), t;
        if (Number.isNaN(e)) return (t.value = 0), t.$inputEl.val(t.value), t;
        const a = 10 ** t.params.decimalPoint;
        return (
          (e = Math.round(e * a).toFixed(t.params.decimalPoint + 1) / a),
          (t.value = parseFloat(String(e).replace(",", "."))),
          t.$inputEl.val(t.value),
          t
        );
      }
      return r.lastIndexOf(".") !== r.indexOf(".") ||
        r.lastIndexOf(",") !== r.indexOf(",")
        ? ((r = r.slice(0, -1)), (t.value = r), t.$inputEl.val(t.value), t)
        : ((t.value = r), t.$inputEl.val(r), t);
    }
    getValue() {
      return this.value;
    }
    formatValue(e) {
      const t = this;
      return t.params.formatValue ? t.params.formatValue.call(t, e) : e;
    }
    init() {
      const e = this;
      if ((e.attachEvents(), e.$valueEl && e.$valueEl.length)) {
        const t = e.formatValue(e.value);
        e.$valueEl.html(t);
      }
      return e;
    }
    destroy() {
      let e = this;
      e.$el.trigger("stepper:beforedestroy"),
        e.emit("local::beforeDestroy stepperBeforeDestroy", e),
        delete e.$el[0].f7Stepper,
        e.detachEvents(),
        Me(e),
        (e = null);
    }
  },
  na = {
    name: "stepper",
    create() {
      const e = this;
      e.stepper = He(
        Je({
          defaultSelector: ".stepper",
          constructor: sa,
          app: e,
          domProp: "f7Stepper",
        }),
        {
          getValue(t) {
            void 0 === t && (t = ".stepper");
            const r = e.stepper.get(t);
            if (r) return r.getValue();
          },
          setValue(t, r) {
            void 0 === t && (t = ".stepper");
            const a = e.stepper.get(t);
            if (a) return a.setValue(r);
          },
        }
      );
    },
    static: { Stepper: sa },
    on: {
      tabMounted(e) {
        const t = this;
        F(e)
          .find(".stepper-init")
          .each((e) => {
            const r = F(e).dataset();
            t.stepper.create(He({ el: e }, r || {}));
          });
      },
      tabBeforeRemove(e) {
        F(e)
          .find(".stepper-init")
          .each((e) => {
            e.f7Stepper && e.f7Stepper.destroy();
          });
      },
      pageInit(e) {
        const t = this;
        e.$el.find(".stepper-init").each((e) => {
          const r = F(e).dataset();
          t.stepper.create(He({ el: e }, r || {}));
        });
      },
      pageBeforeRemove(e) {
        e.$el.find(".stepper-init").each((e) => {
          e.f7Stepper && e.f7Stepper.destroy();
        });
      },
    },
    vnode: {
      "stepper-init": {
        insert(e) {
          const t = e.elm,
            r = F(t).dataset();
          this.stepper.create(He({ el: t }, r || {}));
        },
        destroy(e) {
          const t = e.elm;
          t.f7Stepper && t.f7Stepper.destroy();
        },
      },
    },
  };
const ia = {
  morphOpen(e, t) {
    const r = this,
      a = F(e),
      s = F(t);
    if (0 === s.length) return;
    s.transition(0).addClass("fab-morph-target-visible");
    const n = {
        width: s[0].offsetWidth,
        height: s[0].offsetHeight,
        offset: s.offset(),
        borderRadius: s.css("border-radius"),
        zIndex: s.css("z-index"),
      },
      i = {
        width: a[0].offsetWidth,
        height: a[0].offsetHeight,
        offset: a.offset(),
        translateX: Re(a[0], "x"),
        translateY: Re(a[0], "y"),
      };
    a[0].f7FabMorphData = { $targetEl: s, target: n, fab: i };
    const o =
        i.offset.left +
        i.width / 2 -
        (n.offset.left + n.width / 2) -
        i.translateX,
      l =
        i.offset.top +
        i.height / 2 -
        (n.offset.top + n.height / 2) -
        i.translateY,
      c = n.width / i.width,
      p = n.height / i.height;
    let d = Math.ceil(parseInt(n.borderRadius, 10) / Math.max(c, p));
    d > 0 && (d += 2),
      (a[0].f7FabMorphResizeHandler = function () {
        a.transition(0).transform(""),
          s.transition(0),
          (n.width = s[0].offsetWidth),
          (n.height = s[0].offsetHeight),
          (n.offset = s.offset()),
          (i.offset = a.offset());
        const e =
            i.offset.left +
            i.width / 2 -
            (n.offset.left + n.width / 2) -
            i.translateX,
          t =
            i.offset.top +
            i.height / 2 -
            (n.offset.top + n.height / 2) -
            i.translateY,
          r = n.width / i.width,
          o = n.height / i.height;
        a.transform(`translate3d(${-e}px, ${-t}px, 0) scale(${r}, ${o})`);
      }),
      s.css("opacity", 0).transform(`scale(${1 / c}, ${1 / p})`),
      a
        .addClass("fab-opened")
        .css("z-index", n.zIndex - 1)
        .transform(`translate3d(${-o}px, ${-l}px, 0)`),
      a.transitionEnd(() => {
        s.transition(""),
          Pe(() => {
            s.css("opacity", 1).transform("scale(1,1)"),
              a
                .transform(`translate3d(${-o}px, ${-l}px, 0) scale(${c}, ${p})`)
                .css("border-radius", `${d}px`)
                .css("box-shadow", "none")
                .css("opacity", "0");
          }),
          r.on("resize", a[0].f7FabMorphResizeHandler),
          s.parents(".page-content").length > 0 &&
            s
              .parents(".page-content")
              .on("scroll", a[0].f7FabMorphResizeHandler);
      });
  },
  morphClose(e) {
    const t = F(e),
      r = t[0].f7FabMorphData;
    if (!r) return;
    const { $targetEl: a, target: s, fab: n } = r;
    if (0 === a.length) return;
    const i =
        n.offset.left +
        n.width / 2 -
        (s.offset.left + s.width / 2) -
        n.translateX,
      o =
        n.offset.top +
        n.height / 2 -
        (s.offset.top + s.height / 2) -
        n.translateY,
      l = s.width / n.width,
      c = s.height / n.height;
    this.off("resize", t[0].f7FabMorphResizeHandler),
      a.parents(".page-content").length > 0 &&
        a.parents(".page-content").off("scroll", t[0].f7FabMorphResizeHandler),
      a.css("opacity", 0).transform(`scale(${1 / l}, ${1 / c})`),
      t
        .transition("")
        .css("box-shadow", "")
        .css("border-radius", "")
        .css("opacity", "1")
        .transform(`translate3d(${-i}px, ${-o}px, 0)`),
      t.transitionEnd(() => {
        t.css("z-index", "").removeClass("fab-opened").transform(""),
          Pe(() => {
            t.transitionEnd(() => {
              a.removeClass("fab-morph-target-visible")
                .css("opacity", "")
                .transform("")
                .transition("");
            });
          });
      });
  },
  open(e, t) {
    const r = this,
      a = F(e).eq(0),
      s = a.find(".fab-buttons");
    if (
      a.length &&
      !a.hasClass("fab-opened") &&
      (s.length || a.hasClass("fab-morph"))
    ) {
      if (r.fab.openedEl) {
        if (r.fab.openedEl === a[0]) return;
        r.fab.close(r.fab.openedEl);
      }
      (r.fab.openedEl = a[0]),
        a.hasClass("fab-morph")
          ? r.fab.morphOpen(a, t || a.attr("data-morph-to"))
          : a.addClass("fab-opened"),
        a.siblings(".fab-backdrop").addClass("backdrop-in"),
        a.trigger("fab:open");
    }
  },
  close(e) {
    void 0 === e && (e = ".fab-opened");
    const t = this,
      r = F(e).eq(0),
      a = r.find(".fab-buttons");
    r.length &&
      r.hasClass("fab-opened") &&
      (a.length || r.hasClass("fab-morph")) &&
      ((t.fab.openedEl = null),
      r.hasClass("fab-morph")
        ? t.fab.morphClose(r)
        : r.removeClass("fab-opened"),
      r.siblings(".fab-backdrop").removeClass("backdrop-in"),
      r.trigger("fab:close"));
  },
  toggle(e) {
    F(e).hasClass("fab-opened") ? this.fab.close(e) : this.fab.open(e);
  },
};
var oa = {
  name: "fab",
  create() {
    Fe(this, { fab: o({ openedEl: null }, ia) });
  },
  clicks: {
    ".fab > a": function (e) {
      this.fab.toggle(e.parents(".fab"));
    },
    ".fab-open": function (e, t) {
      void 0 === t && (t = {});
      this.fab.open(t.fab);
    },
    ".fab-close": function (e, t) {
      void 0 === t && (t = {});
      this.fab.close(t.fab);
    },
    ".fab-backdrop": function () {
      this.fab.close();
    },
  },
};
function la(e, t = 0) {
  return setTimeout(e, t);
}
function ca() {
  return Date.now();
}
function pa(e, t = "x") {
  const r = f();
  let a, s, n;
  const i = (function (e) {
    const t = f();
    let r;
    return (
      t.getComputedStyle && (r = t.getComputedStyle(e, null)),
      !r && e.currentStyle && (r = e.currentStyle),
      r || (r = e.style),
      r
    );
  })(e);
  return (
    r.WebKitCSSMatrix
      ? ((s = i.transform || i.webkitTransform),
        s.split(",").length > 6 &&
          (s = s
            .split(", ")
            .map((e) => e.replace(",", "."))
            .join(", ")),
        (n = new r.WebKitCSSMatrix("none" === s ? "" : s)))
      : ((n =
          i.MozTransform ||
          i.OTransform ||
          i.MsTransform ||
          i.msTransform ||
          i.transform ||
          i
            .getPropertyValue("transform")
            .replace("translate(", "matrix(1, 0, 0, 1,")),
        (a = n.toString().split(","))),
    "x" === t &&
      (s = r.WebKitCSSMatrix
        ? n.m41
        : 16 === a.length
        ? parseFloat(a[12])
        : parseFloat(a[4])),
    "y" === t &&
      (s = r.WebKitCSSMatrix
        ? n.m42
        : 16 === a.length
        ? parseFloat(a[13])
        : parseFloat(a[5])),
    s || 0
  );
}
function da(e) {
  return (
    "object" == typeof e &&
    null !== e &&
    e.constructor &&
    "Object" === Object.prototype.toString.call(e).slice(8, -1)
  );
}
function ua(...e) {
  const t = Object(e[0]),
    r = ["__proto__", "constructor", "prototype"];
  for (let s = 1; s < e.length; s += 1) {
    const n = e[s];
    if (
      null != n &&
      ((a = n),
      !("undefined" != typeof window && void 0 !== window.HTMLElement
        ? a instanceof HTMLElement
        : a && (1 === a.nodeType || 11 === a.nodeType)))
    ) {
      const e = Object.keys(Object(n)).filter((e) => r.indexOf(e) < 0);
      for (let r = 0, a = e.length; r < a; r += 1) {
        const a = e[r],
          s = Object.getOwnPropertyDescriptor(n, a);
        void 0 !== s &&
          s.enumerable &&
          (da(t[a]) && da(n[a])
            ? n[a].__swiper__
              ? (t[a] = n[a])
              : ua(t[a], n[a])
            : !da(t[a]) && da(n[a])
            ? ((t[a] = {}), n[a].__swiper__ ? (t[a] = n[a]) : ua(t[a], n[a]))
            : (t[a] = n[a]));
      }
    }
  }
  var a;
  return t;
}
function ha(e, t, r) {
  e.style.setProperty(t, r);
}
function fa({ swiper: e, targetPosition: t, side: r }) {
  const a = f(),
    s = -e.translate;
  let n,
    i = null;
  const o = e.params.speed;
  (e.wrapperEl.style.scrollSnapType = "none"),
    a.cancelAnimationFrame(e.cssModeFrameID);
  const l = t > s ? "next" : "prev",
    c = (e, t) => ("next" === l && e >= t) || ("prev" === l && e <= t),
    p = () => {
      (n = new Date().getTime()), null === i && (i = n);
      const l = Math.max(Math.min((n - i) / o, 1), 0),
        d = 0.5 - Math.cos(l * Math.PI) / 2;
      let u = s + d * (t - s);
      if ((c(u, t) && (u = t), e.wrapperEl.scrollTo({ [r]: u }), c(u, t)))
        return (
          (e.wrapperEl.style.overflow = "hidden"),
          (e.wrapperEl.style.scrollSnapType = ""),
          setTimeout(() => {
            (e.wrapperEl.style.overflow = ""), e.wrapperEl.scrollTo({ [r]: u });
          }),
          void a.cancelAnimationFrame(e.cssModeFrameID)
        );
      e.cssModeFrameID = a.requestAnimationFrame(p);
    };
  p();
}
function ma(e) {
  return (
    e.querySelector(".swiper-slide-transform") ||
    (e.shadowEl && e.shadowEl.querySelector(".swiper-slide-transform")) ||
    e
  );
}
function ga(e, t = "") {
  return [...e.children].filter((e) => e.matches(t));
}
function va(e, t = []) {
  const r = document.createElement(e);
  return r.classList.add(...(Array.isArray(t) ? t : [t])), r;
}
function ba(e) {
  const t = f(),
    r = u(),
    a = e.getBoundingClientRect(),
    s = r.body,
    n = e.clientTop || s.clientTop || 0,
    i = e.clientLeft || s.clientLeft || 0,
    o = e === t ? t.scrollY : e.scrollTop,
    l = e === t ? t.scrollX : e.scrollLeft;
  return { top: a.top + o - n, left: a.left + l - i };
}
function wa(e, t) {
  return f().getComputedStyle(e, null).getPropertyValue(t);
}
function ya(e) {
  let t,
    r = e;
  if (r) {
    for (t = 0; null !== (r = r.previousSibling); )
      1 === r.nodeType && (t += 1);
    return t;
  }
}
function Ea(e, t) {
  const r = [];
  let a = e.parentElement;
  for (; a; ) t ? a.matches(t) && r.push(a) : r.push(a), (a = a.parentElement);
  return r;
}
function Ca(e, t) {
  t &&
    e.addEventListener("transitionend", function r(a) {
      a.target === e &&
        (t.call(e, a), e.removeEventListener("transitionend", r));
    });
}
function xa(e, t, r) {
  const a = f();
  return r
    ? e["width" === t ? "offsetWidth" : "offsetHeight"] +
        parseFloat(
          a
            .getComputedStyle(e, null)
            .getPropertyValue("width" === t ? "margin-right" : "margin-top")
        ) +
        parseFloat(
          a
            .getComputedStyle(e, null)
            .getPropertyValue("width" === t ? "margin-left" : "margin-bottom")
        )
    : e.offsetWidth;
}
let Sa, ka, Ta;
function Ma() {
  return (
    Sa ||
      (Sa = (function () {
        const e = f(),
          t = u();
        return {
          smoothScroll:
            t.documentElement && "scrollBehavior" in t.documentElement.style,
          touch: !!(
            "ontouchstart" in e ||
            (e.DocumentTouch && t instanceof e.DocumentTouch)
          ),
        };
      })()),
    Sa
  );
}
function Aa(e = {}) {
  return (
    ka ||
      (ka = (function ({ userAgent: e } = {}) {
        const t = Ma(),
          r = f(),
          a = r.navigator.platform,
          s = e || r.navigator.userAgent,
          n = { ios: !1, android: !1 },
          i = r.screen.width,
          o = r.screen.height,
          l = s.match(/(Android);?[\s\/]+([\d.]+)?/);
        let c = s.match(/(iPad).*OS\s([\d_]+)/);
        const p = s.match(/(iPod)(.*OS\s([\d_]+))?/),
          d = !c && s.match(/(iPhone\sOS|iOS)\s([\d_]+)/),
          u = "Win32" === a;
        let h = "MacIntel" === a;
        return (
          !c &&
            h &&
            t.touch &&
            [
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
            ].indexOf(`${i}x${o}`) >= 0 &&
            ((c = s.match(/(Version)\/([\d.]+)/)),
            c || (c = [0, 1, "13_0_0"]),
            (h = !1)),
          l && !u && ((n.os = "android"), (n.android = !0)),
          (c || d || p) && ((n.os = "ios"), (n.ios = !0)),
          n
        );
      })(e)),
    ka
  );
}
function $a() {
  return (
    Ta ||
      (Ta = (function () {
        const e = f();
        let t = !1;
        function r() {
          const t = e.navigator.userAgent.toLowerCase();
          return (
            t.indexOf("safari") >= 0 &&
            t.indexOf("chrome") < 0 &&
            t.indexOf("android") < 0
          );
        }
        if (r()) {
          const r = String(e.navigator.userAgent);
          if (r.includes("Version/")) {
            const [e, a] = r
              .split("Version/")[1]
              .split(" ")[0]
              .split(".")
              .map((e) => Number(e));
            t = e < 16 || (16 === e && a < 2);
          }
        }
        return {
          isSafari: t || r(),
          needPerspectiveFix: t,
          isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
            e.navigator.userAgent
          ),
        };
      })()),
    Ta
  );
}
const Pa = (e, t) => {
    if (!e || e.destroyed || !e.params) return;
    const r = t.closest(
      e.isElement ? "swiper-slide" : `.${e.params.slideClass}`
    );
    if (r) {
      const t = r.querySelector(`.${e.params.lazyPreloaderClass}`);
      t && t.remove();
    }
  },
  Oa = (e, t) => {
    if (!e.slides[t]) return;
    const r = e.slides[t].querySelector('[loading="lazy"]');
    r && r.removeAttribute("loading");
  },
  La = (e) => {
    if (!e || e.destroyed || !e.params) return;
    let t = e.params.lazyPreloadPrevNext;
    const r = e.slides.length;
    if (!r || !t || t < 0) return;
    t = Math.min(t, r);
    const a =
        "auto" === e.params.slidesPerView
          ? e.slidesPerViewDynamic()
          : Math.ceil(e.params.slidesPerView),
      s = e.activeIndex,
      n = s + a - 1;
    if (e.params.rewind)
      for (let i = s - t; i <= n + t; i += 1) {
        const t = ((i % r) + r) % r;
        t !== s && t > n && Oa(e, t);
      }
    else
      for (let i = Math.max(n - t, 0); i <= Math.min(n + t, r - 1); i += 1)
        i !== s && i > n && Oa(e, i);
  };
function Ra({ swiper: e, runCallbacks: t, direction: r, step: a }) {
  const { activeIndex: s, previousIndex: n } = e;
  let i = r;
  if (
    (i || (i = s > n ? "next" : s < n ? "prev" : "reset"),
    e.emit(`transition${a}`),
    t && s !== n)
  ) {
    if ("reset" === i) return void e.emit(`slideResetTransition${a}`);
    e.emit(`slideChangeTransition${a}`),
      "next" === i
        ? e.emit(`slideNextTransition${a}`)
        : e.emit(`slidePrevTransition${a}`);
  }
}
function Ia(e) {
  const t = this,
    r = u(),
    a = f(),
    s = t.touchEventsData;
  s.evCache.push(e);
  const { params: n, touches: i, enabled: o } = t;
  if (!o) return;
  if (!n.simulateTouch && "mouse" === e.pointerType) return;
  if (t.animating && n.preventInteractionOnTransition) return;
  !t.animating && n.cssMode && n.loop && t.loopFix();
  let l = e;
  l.originalEvent && (l = l.originalEvent);
  let c = l.target;
  if ("wrapper" === n.touchEventsTarget && !t.wrapperEl.contains(c)) return;
  if ("which" in l && 3 === l.which) return;
  if ("button" in l && l.button > 0) return;
  if (s.isTouched && s.isMoved) return;
  const p = !!n.noSwipingClass && "" !== n.noSwipingClass,
    d = e.composedPath ? e.composedPath() : e.path;
  p && l.target && l.target.shadowRoot && d && (c = d[0]);
  const h = n.noSwipingSelector ? n.noSwipingSelector : `.${n.noSwipingClass}`,
    m = !(!l.target || !l.target.shadowRoot);
  if (
    n.noSwiping &&
    (m
      ? (function (e, t = this) {
          return (function t(r) {
            if (!r || r === u() || r === f()) return null;
            r.assignedSlot && (r = r.assignedSlot);
            const a = r.closest(e);
            return a || r.getRootNode ? a || t(r.getRootNode().host) : null;
          })(t);
        })(h, c)
      : c.closest(h))
  )
    return void (t.allowClick = !0);
  if (n.swipeHandler && !c.closest(n.swipeHandler)) return;
  (i.currentX = l.pageX), (i.currentY = l.pageY);
  const g = i.currentX,
    v = i.currentY,
    b = n.edgeSwipeDetection || n.iOSEdgeSwipeDetection,
    w = n.edgeSwipeThreshold || n.iOSEdgeSwipeThreshold;
  if (b && (g <= w || g >= a.innerWidth - w)) {
    if ("prevent" !== b) return;
    e.preventDefault();
  }
  Object.assign(s, {
    isTouched: !0,
    isMoved: !1,
    allowTouchCallbacks: !0,
    isScrolling: void 0,
    startMoving: void 0,
  }),
    (i.startX = g),
    (i.startY = v),
    (s.touchStartTime = ca()),
    (t.allowClick = !0),
    t.updateSize(),
    (t.swipeDirection = void 0),
    n.threshold > 0 && (s.allowThresholdMove = !1);
  let y = !0;
  c.matches(s.focusableElements) &&
    ((y = !1), "SELECT" === c.nodeName && (s.isTouched = !1)),
    r.activeElement &&
      r.activeElement.matches(s.focusableElements) &&
      r.activeElement !== c &&
      r.activeElement.blur();
  const E = y && t.allowTouchMove && n.touchStartPreventDefault;
  (!n.touchStartForcePreventDefault && !E) ||
    c.isContentEditable ||
    l.preventDefault(),
    t.params.freeMode &&
      t.params.freeMode.enabled &&
      t.freeMode &&
      t.animating &&
      !n.cssMode &&
      t.freeMode.onTouchStart(),
    t.emit("touchStart", l);
}
function za(e) {
  const t = u(),
    r = this,
    a = r.touchEventsData,
    { params: s, touches: n, rtlTranslate: i, enabled: o } = r;
  if (!o) return;
  if (!s.simulateTouch && "mouse" === e.pointerType) return;
  let l = e;
  if ((l.originalEvent && (l = l.originalEvent), !a.isTouched))
    return void (
      a.startMoving &&
      a.isScrolling &&
      r.emit("touchMoveOpposite", l)
    );
  const c = a.evCache.findIndex((e) => e.pointerId === l.pointerId);
  c >= 0 && (a.evCache[c] = l);
  const p = a.evCache.length > 1 ? a.evCache[0] : l,
    d = p.pageX,
    h = p.pageY;
  if (l.preventedByNestedSwiper) return (n.startX = d), void (n.startY = h);
  if (!r.allowTouchMove)
    return (
      l.target.matches(a.focusableElements) || (r.allowClick = !1),
      void (
        a.isTouched &&
        (Object.assign(n, {
          startX: d,
          startY: h,
          prevX: r.touches.currentX,
          prevY: r.touches.currentY,
          currentX: d,
          currentY: h,
        }),
        (a.touchStartTime = ca()))
      )
    );
  if (s.touchReleaseOnEdges && !s.loop)
    if (r.isVertical()) {
      if (
        (h < n.startY && r.translate <= r.maxTranslate()) ||
        (h > n.startY && r.translate >= r.minTranslate())
      )
        return (a.isTouched = !1), void (a.isMoved = !1);
    } else if (
      (d < n.startX && r.translate <= r.maxTranslate()) ||
      (d > n.startX && r.translate >= r.minTranslate())
    )
      return;
  if (
    t.activeElement &&
    l.target === t.activeElement &&
    l.target.matches(a.focusableElements)
  )
    return (a.isMoved = !0), void (r.allowClick = !1);
  if (
    (a.allowTouchCallbacks && r.emit("touchMove", l),
    l.targetTouches && l.targetTouches.length > 1)
  )
    return;
  (n.currentX = d), (n.currentY = h);
  const f = n.currentX - n.startX,
    m = n.currentY - n.startY;
  if (r.params.threshold && Math.sqrt(f ** 2 + m ** 2) < r.params.threshold)
    return;
  if (void 0 === a.isScrolling) {
    let e;
    (r.isHorizontal() && n.currentY === n.startY) ||
    (r.isVertical() && n.currentX === n.startX)
      ? (a.isScrolling = !1)
      : f * f + m * m >= 25 &&
        ((e = (180 * Math.atan2(Math.abs(m), Math.abs(f))) / Math.PI),
        (a.isScrolling = r.isHorizontal()
          ? e > s.touchAngle
          : 90 - e > s.touchAngle));
  }
  if (
    (a.isScrolling && r.emit("touchMoveOpposite", l),
    void 0 === a.startMoving &&
      ((n.currentX === n.startX && n.currentY === n.startY) ||
        (a.startMoving = !0)),
    a.isScrolling ||
      (r.zoom &&
        r.params.zoom &&
        r.params.zoom.enabled &&
        a.evCache.length > 1))
  )
    return void (a.isTouched = !1);
  if (!a.startMoving) return;
  (r.allowClick = !1),
    !s.cssMode && l.cancelable && l.preventDefault(),
    s.touchMoveStopPropagation && !s.nested && l.stopPropagation();
  let g = r.isHorizontal() ? f : m,
    v = r.isHorizontal() ? n.currentX - n.previousX : n.currentY - n.previousY;
  s.oneWayMovement &&
    ((g = Math.abs(g) * (i ? 1 : -1)), (v = Math.abs(v) * (i ? 1 : -1))),
    (n.diff = g),
    (g *= s.touchRatio),
    i && ((g = -g), (v = -v));
  const b = r.touchesDirection;
  (r.swipeDirection = g > 0 ? "prev" : "next"),
    (r.touchesDirection = v > 0 ? "prev" : "next");
  const w = r.params.loop && !s.cssMode;
  if (!a.isMoved) {
    if (
      (w && r.loopFix({ direction: r.swipeDirection }),
      (a.startTranslate = r.getTranslate()),
      r.setTransition(0),
      r.animating)
    ) {
      const e = new window.CustomEvent("transitionend", {
        bubbles: !0,
        cancelable: !0,
      });
      r.wrapperEl.dispatchEvent(e);
    }
    (a.allowMomentumBounce = !1),
      !s.grabCursor ||
        (!0 !== r.allowSlideNext && !0 !== r.allowSlidePrev) ||
        r.setGrabCursor(!0),
      r.emit("sliderFirstMove", l);
  }
  let y;
  a.isMoved &&
    b !== r.touchesDirection &&
    w &&
    Math.abs(g) >= 1 &&
    (r.loopFix({ direction: r.swipeDirection, setTranslate: !0 }), (y = !0)),
    r.emit("sliderMove", l),
    (a.isMoved = !0),
    (a.currentTranslate = g + a.startTranslate);
  let E = !0,
    C = s.resistanceRatio;
  if (
    (s.touchReleaseOnEdges && (C = 0),
    g > 0
      ? (w &&
          !y &&
          a.currentTranslate >
            (s.centeredSlides
              ? r.minTranslate() - r.size / 2
              : r.minTranslate()) &&
          r.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0,
          }),
        a.currentTranslate > r.minTranslate() &&
          ((E = !1),
          s.resistance &&
            (a.currentTranslate =
              r.minTranslate() -
              1 +
              (-r.minTranslate() + a.startTranslate + g) ** C)))
      : g < 0 &&
        (w &&
          !y &&
          a.currentTranslate <
            (s.centeredSlides
              ? r.maxTranslate() + r.size / 2
              : r.maxTranslate()) &&
          r.loopFix({
            direction: "next",
            setTranslate: !0,
            activeSlideIndex:
              r.slides.length -
              ("auto" === s.slidesPerView
                ? r.slidesPerViewDynamic()
                : Math.ceil(parseFloat(s.slidesPerView, 10))),
          }),
        a.currentTranslate < r.maxTranslate() &&
          ((E = !1),
          s.resistance &&
            (a.currentTranslate =
              r.maxTranslate() +
              1 -
              (r.maxTranslate() - a.startTranslate - g) ** C))),
    E && (l.preventedByNestedSwiper = !0),
    !r.allowSlideNext &&
      "next" === r.swipeDirection &&
      a.currentTranslate < a.startTranslate &&
      (a.currentTranslate = a.startTranslate),
    !r.allowSlidePrev &&
      "prev" === r.swipeDirection &&
      a.currentTranslate > a.startTranslate &&
      (a.currentTranslate = a.startTranslate),
    r.allowSlidePrev ||
      r.allowSlideNext ||
      (a.currentTranslate = a.startTranslate),
    s.threshold > 0)
  ) {
    if (!(Math.abs(g) > s.threshold || a.allowThresholdMove))
      return void (a.currentTranslate = a.startTranslate);
    if (!a.allowThresholdMove)
      return (
        (a.allowThresholdMove = !0),
        (n.startX = n.currentX),
        (n.startY = n.currentY),
        (a.currentTranslate = a.startTranslate),
        void (n.diff = r.isHorizontal()
          ? n.currentX - n.startX
          : n.currentY - n.startY)
      );
  }
  s.followFinger &&
    !s.cssMode &&
    (((s.freeMode && s.freeMode.enabled && r.freeMode) ||
      s.watchSlidesProgress) &&
      (r.updateActiveIndex(), r.updateSlidesClasses()),
    r.params.freeMode &&
      s.freeMode.enabled &&
      r.freeMode &&
      r.freeMode.onTouchMove(),
    r.updateProgress(a.currentTranslate),
    r.setTranslate(a.currentTranslate));
}
function Ba(e) {
  const t = this,
    r = t.touchEventsData,
    a = r.evCache.findIndex((t) => t.pointerId === e.pointerId);
  if (
    (a >= 0 && r.evCache.splice(a, 1),
    ["pointercancel", "pointerout", "pointerleave"].includes(e.type))
  ) {
    if (
      !(
        "pointercancel" === e.type &&
        (t.browser.isSafari || t.browser.isWebView)
      )
    )
      return;
  }
  const {
    params: s,
    touches: n,
    rtlTranslate: i,
    slidesGrid: o,
    enabled: l,
  } = t;
  if (!l) return;
  if (!s.simulateTouch && "mouse" === e.pointerType) return;
  let c = e;
  if (
    (c.originalEvent && (c = c.originalEvent),
    r.allowTouchCallbacks && t.emit("touchEnd", c),
    (r.allowTouchCallbacks = !1),
    !r.isTouched)
  )
    return (
      r.isMoved && s.grabCursor && t.setGrabCursor(!1),
      (r.isMoved = !1),
      void (r.startMoving = !1)
    );
  s.grabCursor &&
    r.isMoved &&
    r.isTouched &&
    (!0 === t.allowSlideNext || !0 === t.allowSlidePrev) &&
    t.setGrabCursor(!1);
  const p = ca(),
    d = p - r.touchStartTime;
  if (t.allowClick) {
    const e = c.path || (c.composedPath && c.composedPath());
    t.updateClickedSlide((e && e[0]) || c.target),
      t.emit("tap click", c),
      d < 300 &&
        p - r.lastClickTime < 300 &&
        t.emit("doubleTap doubleClick", c);
  }
  if (
    ((r.lastClickTime = ca()),
    la(() => {
      t.destroyed || (t.allowClick = !0);
    }),
    !r.isTouched ||
      !r.isMoved ||
      !t.swipeDirection ||
      0 === n.diff ||
      r.currentTranslate === r.startTranslate)
  )
    return (r.isTouched = !1), (r.isMoved = !1), void (r.startMoving = !1);
  let u;
  if (
    ((r.isTouched = !1),
    (r.isMoved = !1),
    (r.startMoving = !1),
    (u = s.followFinger
      ? i
        ? t.translate
        : -t.translate
      : -r.currentTranslate),
    s.cssMode)
  )
    return;
  if (t.params.freeMode && s.freeMode.enabled)
    return void t.freeMode.onTouchEnd({ currentPos: u });
  let h = 0,
    f = t.slidesSizesGrid[0];
  for (
    let w = 0;
    w < o.length;
    w += w < s.slidesPerGroupSkip ? 1 : s.slidesPerGroup
  ) {
    const e = w < s.slidesPerGroupSkip - 1 ? 1 : s.slidesPerGroup;
    void 0 !== o[w + e]
      ? u >= o[w] && u < o[w + e] && ((h = w), (f = o[w + e] - o[w]))
      : u >= o[w] && ((h = w), (f = o[o.length - 1] - o[o.length - 2]));
  }
  let m = null,
    g = null;
  s.rewind &&
    (t.isBeginning
      ? (g =
          t.params.virtual && t.params.virtual.enabled && t.virtual
            ? t.virtual.slides.length - 1
            : t.slides.length - 1)
      : t.isEnd && (m = 0));
  const v = (u - o[h]) / f,
    b = h < s.slidesPerGroupSkip - 1 ? 1 : s.slidesPerGroup;
  if (d > s.longSwipesMs) {
    if (!s.longSwipes) return void t.slideTo(t.activeIndex);
    "next" === t.swipeDirection &&
      (v >= s.longSwipesRatio
        ? t.slideTo(s.rewind && t.isEnd ? m : h + b)
        : t.slideTo(h)),
      "prev" === t.swipeDirection &&
        (v > 1 - s.longSwipesRatio
          ? t.slideTo(h + b)
          : null !== g && v < 0 && Math.abs(v) > s.longSwipesRatio
          ? t.slideTo(g)
          : t.slideTo(h));
  } else {
    if (!s.shortSwipes) return void t.slideTo(t.activeIndex);
    t.navigation &&
    (c.target === t.navigation.nextEl || c.target === t.navigation.prevEl)
      ? c.target === t.navigation.nextEl
        ? t.slideTo(h + b)
        : t.slideTo(h)
      : ("next" === t.swipeDirection && t.slideTo(null !== m ? m : h + b),
        "prev" === t.swipeDirection && t.slideTo(null !== g ? g : h));
  }
}
let Ha;
function Da() {
  const e = this,
    { params: t, el: r } = e;
  if (r && 0 === r.offsetWidth) return;
  t.breakpoints && e.setBreakpoint();
  const { allowSlideNext: a, allowSlidePrev: s, snapGrid: n } = e,
    i = e.virtual && e.params.virtual.enabled;
  (e.allowSlideNext = !0),
    (e.allowSlidePrev = !0),
    e.updateSize(),
    e.updateSlides(),
    e.updateSlidesClasses();
  const o = i && t.loop;
  !("auto" === t.slidesPerView || t.slidesPerView > 1) ||
  !e.isEnd ||
  e.isBeginning ||
  e.params.centeredSlides ||
  o
    ? e.params.loop && !i
      ? e.slideToLoop(e.realIndex, 0, !1, !0)
      : e.slideTo(e.activeIndex, 0, !1, !0)
    : e.slideTo(e.slides.length - 1, 0, !1, !0),
    e.autoplay &&
      e.autoplay.running &&
      e.autoplay.paused &&
      (clearTimeout(Ha),
      (Ha = setTimeout(() => {
        e.autoplay &&
          e.autoplay.running &&
          e.autoplay.paused &&
          e.autoplay.resume();
      }, 500))),
    (e.allowSlidePrev = s),
    (e.allowSlideNext = a),
    e.params.watchOverflow && n !== e.snapGrid && e.checkOverflow();
}
function Na(e) {
  const t = this;
  t.enabled &&
    (t.allowClick ||
      (t.params.preventClicks && e.preventDefault(),
      t.params.preventClicksPropagation &&
        t.animating &&
        (e.stopPropagation(), e.stopImmediatePropagation())));
}
function _a() {
  const e = this,
    { wrapperEl: t, rtlTranslate: r, enabled: a } = e;
  if (!a) return;
  let s;
  (e.previousTranslate = e.translate),
    e.isHorizontal()
      ? (e.translate = -t.scrollLeft)
      : (e.translate = -t.scrollTop),
    0 === e.translate && (e.translate = 0),
    e.updateActiveIndex(),
    e.updateSlidesClasses();
  const n = e.maxTranslate() - e.minTranslate();
  (s = 0 === n ? 0 : (e.translate - e.minTranslate()) / n),
    s !== e.progress && e.updateProgress(r ? -e.translate : e.translate),
    e.emit("setTranslate", e.translate, !1);
}
function ja(e) {
  Pa(this, e.target), this.update();
}
let qa = !1;
function Va() {}
const Fa = (e, t) => {
  const r = u(),
    { params: a, el: s, wrapperEl: n, device: i } = e,
    o = !!a.nested,
    l = "on" === t ? "addEventListener" : "removeEventListener",
    c = t;
  s[l]("pointerdown", e.onTouchStart, { passive: !1 }),
    r[l]("pointermove", e.onTouchMove, { passive: !1, capture: o }),
    r[l]("pointerup", e.onTouchEnd, { passive: !0 }),
    r[l]("pointercancel", e.onTouchEnd, { passive: !0 }),
    r[l]("pointerout", e.onTouchEnd, { passive: !0 }),
    r[l]("pointerleave", e.onTouchEnd, { passive: !0 }),
    (a.preventClicks || a.preventClicksPropagation) &&
      s[l]("click", e.onClick, !0),
    a.cssMode && n[l]("scroll", e.onScroll),
    a.updateOnWindowResize
      ? e[c](
          i.ios || i.android
            ? "resize orientationchange observerUpdate"
            : "resize observerUpdate",
          Da,
          !0
        )
      : e[c]("observerUpdate", Da, !0),
    s[l]("load", e.onLoad, { capture: !0 });
};
const Ya = (e, t) => e.grid && t.grid && t.grid.rows > 1;
var Ga = {
  init: !0,
  direction: "horizontal",
  oneWayMovement: !1,
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: !1,
  updateOnWindowResize: !0,
  resizeObserver: !0,
  nested: !1,
  createElements: !1,
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
  loopedSlides: null,
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
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  runCallbacksOnInit: !0,
  _emitClasses: !1,
};
function Wa(e, t) {
  return function (r = {}) {
    const a = Object.keys(r)[0],
      s = r[a];
    "object" == typeof s && null !== s
      ? (["navigation", "pagination", "scrollbar"].indexOf(a) >= 0 &&
          !0 === e[a] &&
          (e[a] = { auto: !0 }),
        a in e && "enabled" in s
          ? (!0 === e[a] && (e[a] = { enabled: !0 }),
            "object" != typeof e[a] || "enabled" in e[a] || (e[a].enabled = !0),
            e[a] || (e[a] = { enabled: !1 }),
            ua(t, r))
          : ua(t, r))
      : ua(t, r);
  };
}
const Ua = {
    eventsEmitter: {
      on(e, t, r) {
        const a = this;
        if (!a.eventsListeners || a.destroyed) return a;
        if ("function" != typeof t) return a;
        const s = r ? "unshift" : "push";
        return (
          e.split(" ").forEach((e) => {
            a.eventsListeners[e] || (a.eventsListeners[e] = []),
              a.eventsListeners[e][s](t);
          }),
          a
        );
      },
      once(e, t, r) {
        const a = this;
        if (!a.eventsListeners || a.destroyed) return a;
        if ("function" != typeof t) return a;
        function s(...r) {
          a.off(e, s),
            s.__emitterProxy && delete s.__emitterProxy,
            t.apply(a, r);
        }
        return (s.__emitterProxy = t), a.on(e, s, r);
      },
      onAny(e, t) {
        const r = this;
        if (!r.eventsListeners || r.destroyed) return r;
        if ("function" != typeof e) return r;
        const a = t ? "unshift" : "push";
        return (
          r.eventsAnyListeners.indexOf(e) < 0 && r.eventsAnyListeners[a](e), r
        );
      },
      offAny(e) {
        const t = this;
        if (!t.eventsListeners || t.destroyed) return t;
        if (!t.eventsAnyListeners) return t;
        const r = t.eventsAnyListeners.indexOf(e);
        return r >= 0 && t.eventsAnyListeners.splice(r, 1), t;
      },
      off(e, t) {
        const r = this;
        return !r.eventsListeners || r.destroyed
          ? r
          : r.eventsListeners
          ? (e.split(" ").forEach((e) => {
              void 0 === t
                ? (r.eventsListeners[e] = [])
                : r.eventsListeners[e] &&
                  r.eventsListeners[e].forEach((a, s) => {
                    (a === t || (a.__emitterProxy && a.__emitterProxy === t)) &&
                      r.eventsListeners[e].splice(s, 1);
                  });
            }),
            r)
          : r;
      },
      emit(...e) {
        const t = this;
        if (!t.eventsListeners || t.destroyed) return t;
        if (!t.eventsListeners) return t;
        let r, a, s;
        "string" == typeof e[0] || Array.isArray(e[0])
          ? ((r = e[0]), (a = e.slice(1, e.length)), (s = t))
          : ((r = e[0].events), (a = e[0].data), (s = e[0].context || t)),
          a.unshift(s);
        return (
          (Array.isArray(r) ? r : r.split(" ")).forEach((e) => {
            t.eventsAnyListeners &&
              t.eventsAnyListeners.length &&
              t.eventsAnyListeners.forEach((t) => {
                t.apply(s, [e, ...a]);
              }),
              t.eventsListeners &&
                t.eventsListeners[e] &&
                t.eventsListeners[e].forEach((e) => {
                  e.apply(s, a);
                });
          }),
          t
        );
      },
    },
    update: {
      updateSize: function () {
        const e = this;
        let t, r;
        const a = e.el;
        (t =
          void 0 !== e.params.width && null !== e.params.width
            ? e.params.width
            : a.clientWidth),
          (r =
            void 0 !== e.params.height && null !== e.params.height
              ? e.params.height
              : a.clientHeight),
          (0 === t && e.isHorizontal()) ||
            (0 === r && e.isVertical()) ||
            ((t =
              t -
              parseInt(wa(a, "padding-left") || 0, 10) -
              parseInt(wa(a, "padding-right") || 0, 10)),
            (r =
              r -
              parseInt(wa(a, "padding-top") || 0, 10) -
              parseInt(wa(a, "padding-bottom") || 0, 10)),
            Number.isNaN(t) && (t = 0),
            Number.isNaN(r) && (r = 0),
            Object.assign(e, {
              width: t,
              height: r,
              size: e.isHorizontal() ? t : r,
            }));
      },
      updateSlides: function () {
        const e = this;
        function t(t) {
          return e.isHorizontal()
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
        function r(e, r) {
          return parseFloat(e.getPropertyValue(t(r)) || 0);
        }
        const a = e.params,
          {
            wrapperEl: s,
            slidesEl: n,
            size: i,
            rtlTranslate: o,
            wrongRTL: l,
          } = e,
          c = e.virtual && a.virtual.enabled,
          p = c ? e.virtual.slides.length : e.slides.length,
          d = ga(n, `.${e.params.slideClass}, swiper-slide`),
          u = c ? e.virtual.slides.length : d.length;
        let h = [];
        const f = [],
          m = [];
        let g = a.slidesOffsetBefore;
        "function" == typeof g && (g = a.slidesOffsetBefore.call(e));
        let v = a.slidesOffsetAfter;
        "function" == typeof v && (v = a.slidesOffsetAfter.call(e));
        const b = e.snapGrid.length,
          w = e.slidesGrid.length;
        let y = a.spaceBetween,
          E = -g,
          C = 0,
          x = 0;
        if (void 0 === i) return;
        "string" == typeof y &&
          y.indexOf("%") >= 0 &&
          (y = (parseFloat(y.replace("%", "")) / 100) * i),
          (e.virtualSize = -y),
          d.forEach((e) => {
            o ? (e.style.marginLeft = "") : (e.style.marginRight = ""),
              (e.style.marginBottom = ""),
              (e.style.marginTop = "");
          }),
          a.centeredSlides &&
            a.cssMode &&
            (ha(s, "--swiper-centered-offset-before", ""),
            ha(s, "--swiper-centered-offset-after", ""));
        const S = a.grid && a.grid.rows > 1 && e.grid;
        let k;
        S && e.grid.initSlides(u);
        const T =
          "auto" === a.slidesPerView &&
          a.breakpoints &&
          Object.keys(a.breakpoints).filter(
            (e) => void 0 !== a.breakpoints[e].slidesPerView
          ).length > 0;
        for (let M = 0; M < u; M += 1) {
          let s;
          if (
            ((k = 0),
            d[M] && (s = d[M]),
            S && e.grid.updateSlide(M, s, u, t),
            !d[M] || "none" !== wa(s, "display"))
          ) {
            if ("auto" === a.slidesPerView) {
              T && (d[M].style[t("width")] = "");
              const n = getComputedStyle(s),
                i = s.style.transform,
                o = s.style.webkitTransform;
              if (
                (i && (s.style.transform = "none"),
                o && (s.style.webkitTransform = "none"),
                a.roundLengths)
              )
                k = e.isHorizontal() ? xa(s, "width", !0) : xa(s, "height", !0);
              else {
                const e = r(n, "width"),
                  t = r(n, "padding-left"),
                  a = r(n, "padding-right"),
                  i = r(n, "margin-left"),
                  o = r(n, "margin-right"),
                  l = n.getPropertyValue("box-sizing");
                if (l && "border-box" === l) k = e + i + o;
                else {
                  const { clientWidth: r, offsetWidth: n } = s;
                  k = e + t + a + i + o + (n - r);
                }
              }
              i && (s.style.transform = i),
                o && (s.style.webkitTransform = o),
                a.roundLengths && (k = Math.floor(k));
            } else
              (k = (i - (a.slidesPerView - 1) * y) / a.slidesPerView),
                a.roundLengths && (k = Math.floor(k)),
                d[M] && (d[M].style[t("width")] = `${k}px`);
            d[M] && (d[M].swiperSlideSize = k),
              m.push(k),
              a.centeredSlides
                ? ((E = E + k / 2 + C / 2 + y),
                  0 === C && 0 !== M && (E = E - i / 2 - y),
                  0 === M && (E = E - i / 2 - y),
                  Math.abs(E) < 0.001 && (E = 0),
                  a.roundLengths && (E = Math.floor(E)),
                  x % a.slidesPerGroup == 0 && h.push(E),
                  f.push(E))
                : (a.roundLengths && (E = Math.floor(E)),
                  (x - Math.min(e.params.slidesPerGroupSkip, x)) %
                    e.params.slidesPerGroup ==
                    0 && h.push(E),
                  f.push(E),
                  (E = E + k + y)),
              (e.virtualSize += k + y),
              (C = k),
              (x += 1);
          }
        }
        if (
          ((e.virtualSize = Math.max(e.virtualSize, i) + v),
          o &&
            l &&
            ("slide" === a.effect || "coverflow" === a.effect) &&
            (s.style.width = `${e.virtualSize + a.spaceBetween}px`),
          a.setWrapperSize &&
            (s.style[t("width")] = `${e.virtualSize + a.spaceBetween}px`),
          S && e.grid.updateWrapperSize(k, h, t),
          !a.centeredSlides)
        ) {
          const t = [];
          for (let r = 0; r < h.length; r += 1) {
            let s = h[r];
            a.roundLengths && (s = Math.floor(s)),
              h[r] <= e.virtualSize - i && t.push(s);
          }
          (h = t),
            Math.floor(e.virtualSize - i) - Math.floor(h[h.length - 1]) > 1 &&
              h.push(e.virtualSize - i);
        }
        if (c && a.loop) {
          const t = m[0] + y;
          if (a.slidesPerGroup > 1) {
            const r = Math.ceil(
                (e.virtual.slidesBefore + e.virtual.slidesAfter) /
                  a.slidesPerGroup
              ),
              s = t * a.slidesPerGroup;
            for (let e = 0; e < r; e += 1) h.push(h[h.length - 1] + s);
          }
          for (
            let r = 0;
            r < e.virtual.slidesBefore + e.virtual.slidesAfter;
            r += 1
          )
            1 === a.slidesPerGroup && h.push(h[h.length - 1] + t),
              f.push(f[f.length - 1] + t),
              (e.virtualSize += t);
        }
        if ((0 === h.length && (h = [0]), 0 !== a.spaceBetween)) {
          const r = e.isHorizontal() && o ? "marginLeft" : t("marginRight");
          d.filter(
            (e, t) => !(a.cssMode && !a.loop) || t !== d.length - 1
          ).forEach((e) => {
            e.style[r] = `${y}px`;
          });
        }
        if (a.centeredSlides && a.centeredSlidesBounds) {
          let e = 0;
          m.forEach((t) => {
            e += t + (a.spaceBetween ? a.spaceBetween : 0);
          }),
            (e -= a.spaceBetween);
          const t = e - i;
          h = h.map((e) => (e < 0 ? -g : e > t ? t + v : e));
        }
        if (a.centerInsufficientSlides) {
          let e = 0;
          if (
            (m.forEach((t) => {
              e += t + (a.spaceBetween ? a.spaceBetween : 0);
            }),
            (e -= a.spaceBetween),
            e < i)
          ) {
            const t = (i - e) / 2;
            h.forEach((e, r) => {
              h[r] = e - t;
            }),
              f.forEach((e, r) => {
                f[r] = e + t;
              });
          }
        }
        if (
          (Object.assign(e, {
            slides: d,
            snapGrid: h,
            slidesGrid: f,
            slidesSizesGrid: m,
          }),
          a.centeredSlides && a.cssMode && !a.centeredSlidesBounds)
        ) {
          ha(s, "--swiper-centered-offset-before", -h[0] + "px"),
            ha(
              s,
              "--swiper-centered-offset-after",
              e.size / 2 - m[m.length - 1] / 2 + "px"
            );
          const t = -e.snapGrid[0],
            r = -e.slidesGrid[0];
          (e.snapGrid = e.snapGrid.map((e) => e + t)),
            (e.slidesGrid = e.slidesGrid.map((e) => e + r));
        }
        if (
          (u !== p && e.emit("slidesLengthChange"),
          h.length !== b &&
            (e.params.watchOverflow && e.checkOverflow(),
            e.emit("snapGridLengthChange")),
          f.length !== w && e.emit("slidesGridLengthChange"),
          a.watchSlidesProgress && e.updateSlidesOffset(),
          !(c || a.cssMode || ("slide" !== a.effect && "fade" !== a.effect)))
        ) {
          const t = `${a.containerModifierClass}backface-hidden`,
            r = e.el.classList.contains(t);
          u <= a.maxBackfaceHiddenSlides
            ? r || e.el.classList.add(t)
            : r && e.el.classList.remove(t);
        }
      },
      updateAutoHeight: function (e) {
        const t = this,
          r = [],
          a = t.virtual && t.params.virtual.enabled;
        let s,
          n = 0;
        "number" == typeof e
          ? t.setTransition(e)
          : !0 === e && t.setTransition(t.params.speed);
        const i = (e) => (a ? t.getSlideIndexByData(e) : t.slides[e]);
        if ("auto" !== t.params.slidesPerView && t.params.slidesPerView > 1)
          if (t.params.centeredSlides)
            (t.visibleSlides || []).forEach((e) => {
              r.push(e);
            });
          else
            for (s = 0; s < Math.ceil(t.params.slidesPerView); s += 1) {
              const e = t.activeIndex + s;
              if (e > t.slides.length && !a) break;
              r.push(i(e));
            }
        else r.push(i(t.activeIndex));
        for (s = 0; s < r.length; s += 1)
          if (void 0 !== r[s]) {
            const e = r[s].offsetHeight;
            n = e > n ? e : n;
          }
        (n || 0 === n) && (t.wrapperEl.style.height = `${n}px`);
      },
      updateSlidesOffset: function () {
        const e = this,
          t = e.slides,
          r = e.isElement
            ? e.isHorizontal()
              ? e.wrapperEl.offsetLeft
              : e.wrapperEl.offsetTop
            : 0;
        for (let a = 0; a < t.length; a += 1)
          t[a].swiperSlideOffset =
            (e.isHorizontal() ? t[a].offsetLeft : t[a].offsetTop) - r;
      },
      updateSlidesProgress: function (e = (this && this.translate) || 0) {
        const t = this,
          r = t.params,
          { slides: a, rtlTranslate: s, snapGrid: n } = t;
        if (0 === a.length) return;
        void 0 === a[0].swiperSlideOffset && t.updateSlidesOffset();
        let i = -e;
        s && (i = e),
          a.forEach((e) => {
            e.classList.remove(r.slideVisibleClass);
          }),
          (t.visibleSlidesIndexes = []),
          (t.visibleSlides = []);
        for (let o = 0; o < a.length; o += 1) {
          const e = a[o];
          let l = e.swiperSlideOffset;
          r.cssMode && r.centeredSlides && (l -= a[0].swiperSlideOffset);
          const c =
              (i + (r.centeredSlides ? t.minTranslate() : 0) - l) /
              (e.swiperSlideSize + r.spaceBetween),
            p =
              (i - n[0] + (r.centeredSlides ? t.minTranslate() : 0) - l) /
              (e.swiperSlideSize + r.spaceBetween),
            d = -(i - l),
            u = d + t.slidesSizesGrid[o];
          ((d >= 0 && d < t.size - 1) ||
            (u > 1 && u <= t.size) ||
            (d <= 0 && u >= t.size)) &&
            (t.visibleSlides.push(e),
            t.visibleSlidesIndexes.push(o),
            a[o].classList.add(r.slideVisibleClass)),
            (e.progress = s ? -c : c),
            (e.originalProgress = s ? -p : p);
        }
      },
      updateProgress: function (e) {
        const t = this;
        if (void 0 === e) {
          const r = t.rtlTranslate ? -1 : 1;
          e = (t && t.translate && t.translate * r) || 0;
        }
        const r = t.params,
          a = t.maxTranslate() - t.minTranslate();
        let { progress: s, isBeginning: n, isEnd: i, progressLoop: o } = t;
        const l = n,
          c = i;
        if (0 === a) (s = 0), (n = !0), (i = !0);
        else {
          s = (e - t.minTranslate()) / a;
          const r = Math.abs(e - t.minTranslate()) < 1,
            o = Math.abs(e - t.maxTranslate()) < 1;
          (n = r || s <= 0), (i = o || s >= 1), r && (s = 0), o && (s = 1);
        }
        if (r.loop) {
          const r = t.getSlideIndexByData(0),
            a = t.getSlideIndexByData(t.slides.length - 1),
            s = t.slidesGrid[r],
            n = t.slidesGrid[a],
            i = t.slidesGrid[t.slidesGrid.length - 1],
            l = Math.abs(e);
          (o = l >= s ? (l - s) / i : (l + i - n) / i), o > 1 && (o -= 1);
        }
        Object.assign(t, {
          progress: s,
          progressLoop: o,
          isBeginning: n,
          isEnd: i,
        }),
          (r.watchSlidesProgress || (r.centeredSlides && r.autoHeight)) &&
            t.updateSlidesProgress(e),
          n && !l && t.emit("reachBeginning toEdge"),
          i && !c && t.emit("reachEnd toEdge"),
          ((l && !n) || (c && !i)) && t.emit("fromEdge"),
          t.emit("progress", s);
      },
      updateSlidesClasses: function () {
        const e = this,
          { slides: t, params: r, slidesEl: a, activeIndex: s } = e,
          n = e.virtual && r.virtual.enabled,
          i = (e) => ga(a, `.${r.slideClass}${e}, swiper-slide${e}`)[0];
        let o;
        if (
          (t.forEach((e) => {
            e.classList.remove(
              r.slideActiveClass,
              r.slideNextClass,
              r.slidePrevClass
            );
          }),
          n)
        )
          if (r.loop) {
            let t = s - e.virtual.slidesBefore;
            t < 0 && (t = e.virtual.slides.length + t),
              t >= e.virtual.slides.length && (t -= e.virtual.slides.length),
              (o = i(`[data-swiper-slide-index="${t}"]`));
          } else o = i(`[data-swiper-slide-index="${s}"]`);
        else o = t[s];
        if (o) {
          o.classList.add(r.slideActiveClass);
          let e = (function (e, t) {
            const r = [];
            for (; e.nextElementSibling; ) {
              const a = e.nextElementSibling;
              t ? a.matches(t) && r.push(a) : r.push(a), (e = a);
            }
            return r;
          })(o, `.${r.slideClass}, swiper-slide`)[0];
          r.loop && !e && (e = t[0]), e && e.classList.add(r.slideNextClass);
          let a = (function (e, t) {
            const r = [];
            for (; e.previousElementSibling; ) {
              const a = e.previousElementSibling;
              t ? a.matches(t) && r.push(a) : r.push(a), (e = a);
            }
            return r;
          })(o, `.${r.slideClass}, swiper-slide`)[0];
          r.loop && 0 === !a && (a = t[t.length - 1]),
            a && a.classList.add(r.slidePrevClass);
        }
        e.emitSlidesClasses();
      },
      updateActiveIndex: function (e) {
        const t = this,
          r = t.rtlTranslate ? t.translate : -t.translate,
          {
            snapGrid: a,
            params: s,
            activeIndex: n,
            realIndex: i,
            snapIndex: o,
          } = t;
        let l,
          c = e;
        const p = (e) => {
          let r = e - t.virtual.slidesBefore;
          return (
            r < 0 && (r = t.virtual.slides.length + r),
            r >= t.virtual.slides.length && (r -= t.virtual.slides.length),
            r
          );
        };
        if (
          (void 0 === c &&
            (c = (function (e) {
              const { slidesGrid: t, params: r } = e,
                a = e.rtlTranslate ? e.translate : -e.translate;
              let s;
              for (let n = 0; n < t.length; n += 1)
                void 0 !== t[n + 1]
                  ? a >= t[n] && a < t[n + 1] - (t[n + 1] - t[n]) / 2
                    ? (s = n)
                    : a >= t[n] && a < t[n + 1] && (s = n + 1)
                  : a >= t[n] && (s = n);
              return (
                r.normalizeSlideIndex && (s < 0 || void 0 === s) && (s = 0), s
              );
            })(t)),
          a.indexOf(r) >= 0)
        )
          l = a.indexOf(r);
        else {
          const e = Math.min(s.slidesPerGroupSkip, c);
          l = e + Math.floor((c - e) / s.slidesPerGroup);
        }
        if ((l >= a.length && (l = a.length - 1), c === n))
          return (
            l !== o && ((t.snapIndex = l), t.emit("snapIndexChange")),
            void (
              t.params.loop &&
              t.virtual &&
              t.params.virtual.enabled &&
              (t.realIndex = p(c))
            )
          );
        let d;
        (d =
          t.virtual && s.virtual.enabled && s.loop
            ? p(c)
            : t.slides[c]
            ? parseInt(
                t.slides[c].getAttribute("data-swiper-slide-index") || c,
                10
              )
            : c),
          Object.assign(t, {
            snapIndex: l,
            realIndex: d,
            previousIndex: n,
            activeIndex: c,
          }),
          t.initialized && La(t),
          t.emit("activeIndexChange"),
          t.emit("snapIndexChange"),
          i !== d && t.emit("realIndexChange"),
          (t.initialized || t.params.runCallbacksOnInit) &&
            t.emit("slideChange");
      },
      updateClickedSlide: function (e) {
        const t = this,
          r = t.params,
          a = e.closest(`.${r.slideClass}, swiper-slide`);
        let s,
          n = !1;
        if (a)
          for (let i = 0; i < t.slides.length; i += 1)
            if (t.slides[i] === a) {
              (n = !0), (s = i);
              break;
            }
        if (!a || !n)
          return (t.clickedSlide = void 0), void (t.clickedIndex = void 0);
        (t.clickedSlide = a),
          t.virtual && t.params.virtual.enabled
            ? (t.clickedIndex = parseInt(
                a.getAttribute("data-swiper-slide-index"),
                10
              ))
            : (t.clickedIndex = s),
          r.slideToClickedSlide &&
            void 0 !== t.clickedIndex &&
            t.clickedIndex !== t.activeIndex &&
            t.slideToClickedSlide();
      },
    },
    translate: {
      getTranslate: function (e = this.isHorizontal() ? "x" : "y") {
        const { params: t, rtlTranslate: r, translate: a, wrapperEl: s } = this;
        if (t.virtualTranslate) return r ? -a : a;
        if (t.cssMode) return a;
        let n = pa(s, e);
        return r && (n = -n), n || 0;
      },
      setTranslate: function (e, t) {
        const r = this,
          { rtlTranslate: a, params: s, wrapperEl: n, progress: i } = r;
        let o,
          l = 0,
          c = 0;
        r.isHorizontal() ? (l = a ? -e : e) : (c = e),
          s.roundLengths && ((l = Math.floor(l)), (c = Math.floor(c))),
          s.cssMode
            ? (n[r.isHorizontal() ? "scrollLeft" : "scrollTop"] =
                r.isHorizontal() ? -l : -c)
            : s.virtualTranslate ||
              (n.style.transform = `translate3d(${l}px, ${c}px, 0px)`),
          (r.previousTranslate = r.translate),
          (r.translate = r.isHorizontal() ? l : c);
        const p = r.maxTranslate() - r.minTranslate();
        (o = 0 === p ? 0 : (e - r.minTranslate()) / p),
          o !== i && r.updateProgress(e),
          r.emit("setTranslate", r.translate, t);
      },
      minTranslate: function () {
        return -this.snapGrid[0];
      },
      maxTranslate: function () {
        return -this.snapGrid[this.snapGrid.length - 1];
      },
      translateTo: function (e = 0, t = this.params.speed, r = !0, a = !0, s) {
        const n = this,
          { params: i, wrapperEl: o } = n;
        if (n.animating && i.preventInteractionOnTransition) return !1;
        const l = n.minTranslate(),
          c = n.maxTranslate();
        let p;
        if (
          ((p = a && e > l ? l : a && e < c ? c : e),
          n.updateProgress(p),
          i.cssMode)
        ) {
          const e = n.isHorizontal();
          if (0 === t) o[e ? "scrollLeft" : "scrollTop"] = -p;
          else {
            if (!n.support.smoothScroll)
              return (
                fa({ swiper: n, targetPosition: -p, side: e ? "left" : "top" }),
                !0
              );
            o.scrollTo({ [e ? "left" : "top"]: -p, behavior: "smooth" });
          }
          return !0;
        }
        return (
          0 === t
            ? (n.setTransition(0),
              n.setTranslate(p),
              r &&
                (n.emit("beforeTransitionStart", t, s),
                n.emit("transitionEnd")))
            : (n.setTransition(t),
              n.setTranslate(p),
              r &&
                (n.emit("beforeTransitionStart", t, s),
                n.emit("transitionStart")),
              n.animating ||
                ((n.animating = !0),
                n.onTranslateToWrapperTransitionEnd ||
                  (n.onTranslateToWrapperTransitionEnd = function (e) {
                    n &&
                      !n.destroyed &&
                      e.target === this &&
                      (n.wrapperEl.removeEventListener(
                        "transitionend",
                        n.onTranslateToWrapperTransitionEnd
                      ),
                      (n.onTranslateToWrapperTransitionEnd = null),
                      delete n.onTranslateToWrapperTransitionEnd,
                      r && n.emit("transitionEnd"));
                  }),
                n.wrapperEl.addEventListener(
                  "transitionend",
                  n.onTranslateToWrapperTransitionEnd
                ))),
          !0
        );
      },
    },
    transition: {
      setTransition: function (e, t) {
        const r = this;
        r.params.cssMode || (r.wrapperEl.style.transitionDuration = `${e}ms`),
          r.emit("setTransition", e, t);
      },
      transitionStart: function (e = !0, t) {
        const r = this,
          { params: a } = r;
        a.cssMode ||
          (a.autoHeight && r.updateAutoHeight(),
          Ra({ swiper: r, runCallbacks: e, direction: t, step: "Start" }));
      },
      transitionEnd: function (e = !0, t) {
        const r = this,
          { params: a } = r;
        (r.animating = !1),
          a.cssMode ||
            (r.setTransition(0),
            Ra({ swiper: r, runCallbacks: e, direction: t, step: "End" }));
      },
    },
    slide: {
      slideTo: function (e = 0, t = this.params.speed, r = !0, a, s) {
        "string" == typeof e && (e = parseInt(e, 10));
        const n = this;
        let i = e;
        i < 0 && (i = 0);
        const {
          params: o,
          snapGrid: l,
          slidesGrid: c,
          previousIndex: p,
          activeIndex: d,
          rtlTranslate: u,
          wrapperEl: h,
          enabled: f,
        } = n;
        if (
          (n.animating && o.preventInteractionOnTransition) ||
          (!f && !a && !s)
        )
          return !1;
        const m = Math.min(n.params.slidesPerGroupSkip, i);
        let g = m + Math.floor((i - m) / n.params.slidesPerGroup);
        g >= l.length && (g = l.length - 1);
        const v = -l[g];
        if (o.normalizeSlideIndex)
          for (let w = 0; w < c.length; w += 1) {
            const e = -Math.floor(100 * v),
              t = Math.floor(100 * c[w]),
              r = Math.floor(100 * c[w + 1]);
            void 0 !== c[w + 1]
              ? e >= t && e < r - (r - t) / 2
                ? (i = w)
                : e >= t && e < r && (i = w + 1)
              : e >= t && (i = w);
          }
        if (n.initialized && i !== d) {
          if (!n.allowSlideNext && v < n.translate && v < n.minTranslate())
            return !1;
          if (
            !n.allowSlidePrev &&
            v > n.translate &&
            v > n.maxTranslate() &&
            (d || 0) !== i
          )
            return !1;
        }
        let b;
        if (
          (i !== (p || 0) && r && n.emit("beforeSlideChangeStart"),
          n.updateProgress(v),
          (b = i > d ? "next" : i < d ? "prev" : "reset"),
          (u && -v === n.translate) || (!u && v === n.translate))
        )
          return (
            n.updateActiveIndex(i),
            o.autoHeight && n.updateAutoHeight(),
            n.updateSlidesClasses(),
            "slide" !== o.effect && n.setTranslate(v),
            "reset" !== b && (n.transitionStart(r, b), n.transitionEnd(r, b)),
            !1
          );
        if (o.cssMode) {
          const e = n.isHorizontal(),
            r = u ? v : -v;
          if (0 === t) {
            const t = n.virtual && n.params.virtual.enabled;
            t &&
              ((n.wrapperEl.style.scrollSnapType = "none"),
              (n._immediateVirtual = !0)),
              t && !n._cssModeVirtualInitialSet && n.params.initialSlide > 0
                ? ((n._cssModeVirtualInitialSet = !0),
                  requestAnimationFrame(() => {
                    h[e ? "scrollLeft" : "scrollTop"] = r;
                  }))
                : (h[e ? "scrollLeft" : "scrollTop"] = r),
              t &&
                requestAnimationFrame(() => {
                  (n.wrapperEl.style.scrollSnapType = ""),
                    (n._immediateVirtual = !1);
                });
          } else {
            if (!n.support.smoothScroll)
              return (
                fa({ swiper: n, targetPosition: r, side: e ? "left" : "top" }),
                !0
              );
            h.scrollTo({ [e ? "left" : "top"]: r, behavior: "smooth" });
          }
          return !0;
        }
        return (
          n.setTransition(t),
          n.setTranslate(v),
          n.updateActiveIndex(i),
          n.updateSlidesClasses(),
          n.emit("beforeTransitionStart", t, a),
          n.transitionStart(r, b),
          0 === t
            ? n.transitionEnd(r, b)
            : n.animating ||
              ((n.animating = !0),
              n.onSlideToWrapperTransitionEnd ||
                (n.onSlideToWrapperTransitionEnd = function (e) {
                  n &&
                    !n.destroyed &&
                    e.target === this &&
                    (n.wrapperEl.removeEventListener(
                      "transitionend",
                      n.onSlideToWrapperTransitionEnd
                    ),
                    (n.onSlideToWrapperTransitionEnd = null),
                    delete n.onSlideToWrapperTransitionEnd,
                    n.transitionEnd(r, b));
                }),
              n.wrapperEl.addEventListener(
                "transitionend",
                n.onSlideToWrapperTransitionEnd
              )),
          !0
        );
      },
      slideToLoop: function (e = 0, t = this.params.speed, r = !0, a) {
        if ("string" == typeof e) {
          e = parseInt(e, 10);
        }
        const s = this;
        let n = e;
        return (
          s.params.loop &&
            (s.virtual && s.params.virtual.enabled
              ? (n += s.virtual.slidesBefore)
              : (n = s.getSlideIndexByData(n))),
          s.slideTo(n, t, r, a)
        );
      },
      slideNext: function (e = this.params.speed, t = !0, r) {
        const a = this,
          { enabled: s, params: n, animating: i } = a;
        if (!s) return a;
        let o = n.slidesPerGroup;
        "auto" === n.slidesPerView &&
          1 === n.slidesPerGroup &&
          n.slidesPerGroupAuto &&
          (o = Math.max(a.slidesPerViewDynamic("current", !0), 1));
        const l = a.activeIndex < n.slidesPerGroupSkip ? 1 : o,
          c = a.virtual && n.virtual.enabled;
        if (n.loop) {
          if (i && !c && n.loopPreventsSliding) return !1;
          a.loopFix({ direction: "next" }),
            (a._clientLeft = a.wrapperEl.clientLeft);
        }
        return n.rewind && a.isEnd
          ? a.slideTo(0, e, t, r)
          : a.slideTo(a.activeIndex + l, e, t, r);
      },
      slidePrev: function (e = this.params.speed, t = !0, r) {
        const a = this,
          {
            params: s,
            snapGrid: n,
            slidesGrid: i,
            rtlTranslate: o,
            enabled: l,
            animating: c,
          } = a;
        if (!l) return a;
        const p = a.virtual && s.virtual.enabled;
        if (s.loop) {
          if (c && !p && s.loopPreventsSliding) return !1;
          a.loopFix({ direction: "prev" }),
            (a._clientLeft = a.wrapperEl.clientLeft);
        }
        function d(e) {
          return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e);
        }
        const u = d(o ? a.translate : -a.translate),
          h = n.map((e) => d(e));
        let f = n[h.indexOf(u) - 1];
        if (void 0 === f && s.cssMode) {
          let e;
          n.forEach((t, r) => {
            u >= t && (e = r);
          }),
            void 0 !== e && (f = n[e > 0 ? e - 1 : e]);
        }
        let m = 0;
        if (
          (void 0 !== f &&
            ((m = i.indexOf(f)),
            m < 0 && (m = a.activeIndex - 1),
            "auto" === s.slidesPerView &&
              1 === s.slidesPerGroup &&
              s.slidesPerGroupAuto &&
              ((m = m - a.slidesPerViewDynamic("previous", !0) + 1),
              (m = Math.max(m, 0)))),
          s.rewind && a.isBeginning)
        ) {
          const s =
            a.params.virtual && a.params.virtual.enabled && a.virtual
              ? a.virtual.slides.length - 1
              : a.slides.length - 1;
          return a.slideTo(s, e, t, r);
        }
        return a.slideTo(m, e, t, r);
      },
      slideReset: function (e = this.params.speed, t = !0, r) {
        return this.slideTo(this.activeIndex, e, t, r);
      },
      slideToClosest: function (e = this.params.speed, t = !0, r, a = 0.5) {
        const s = this;
        let n = s.activeIndex;
        const i = Math.min(s.params.slidesPerGroupSkip, n),
          o = i + Math.floor((n - i) / s.params.slidesPerGroup),
          l = s.rtlTranslate ? s.translate : -s.translate;
        if (l >= s.snapGrid[o]) {
          const e = s.snapGrid[o];
          l - e > (s.snapGrid[o + 1] - e) * a && (n += s.params.slidesPerGroup);
        } else {
          const e = s.snapGrid[o - 1];
          l - e <= (s.snapGrid[o] - e) * a && (n -= s.params.slidesPerGroup);
        }
        return (
          (n = Math.max(n, 0)),
          (n = Math.min(n, s.slidesGrid.length - 1)),
          s.slideTo(n, e, t, r)
        );
      },
      slideToClickedSlide: function () {
        const e = this,
          { params: t, slidesEl: r } = e,
          a =
            "auto" === t.slidesPerView
              ? e.slidesPerViewDynamic()
              : t.slidesPerView;
        let s,
          n = e.clickedIndex;
        const i = e.isElement ? "swiper-slide" : `.${t.slideClass}`;
        if (t.loop) {
          if (e.animating) return;
          (s = parseInt(
            e.clickedSlide.getAttribute("data-swiper-slide-index"),
            10
          )),
            t.centeredSlides
              ? n < e.loopedSlides - a / 2 ||
                n > e.slides.length - e.loopedSlides + a / 2
                ? (e.loopFix(),
                  (n = e.getSlideIndex(
                    ga(r, `${i}[data-swiper-slide-index="${s}"]`)[0]
                  )),
                  la(() => {
                    e.slideTo(n);
                  }))
                : e.slideTo(n)
              : n > e.slides.length - a
              ? (e.loopFix(),
                (n = e.getSlideIndex(
                  ga(r, `${i}[data-swiper-slide-index="${s}"]`)[0]
                )),
                la(() => {
                  e.slideTo(n);
                }))
              : e.slideTo(n);
        } else e.slideTo(n);
      },
    },
    loop: {
      loopCreate: function (e) {
        const t = this,
          { params: r, slidesEl: a } = t;
        if (!r.loop || (t.virtual && t.params.virtual.enabled)) return;
        ga(a, `.${r.slideClass}, swiper-slide`).forEach((e, t) => {
          e.setAttribute("data-swiper-slide-index", t);
        }),
          t.loopFix({
            slideRealIndex: e,
            direction: r.centeredSlides ? void 0 : "next",
          });
      },
      loopFix: function ({
        slideRealIndex: e,
        slideTo: t = !0,
        direction: r,
        setTranslate: a,
        activeSlideIndex: s,
        byController: n,
        byMousewheel: i,
      } = {}) {
        const o = this;
        if (!o.params.loop) return;
        o.emit("beforeLoopFix");
        const {
          slides: l,
          allowSlidePrev: c,
          allowSlideNext: p,
          slidesEl: d,
          params: u,
        } = o;
        if (
          ((o.allowSlidePrev = !0),
          (o.allowSlideNext = !0),
          o.virtual && u.virtual.enabled)
        )
          return (
            t &&
              (u.centeredSlides || 0 !== o.snapIndex
                ? u.centeredSlides && o.snapIndex < u.slidesPerView
                  ? o.slideTo(o.virtual.slides.length + o.snapIndex, 0, !1, !0)
                  : o.snapIndex === o.snapGrid.length - 1 &&
                    o.slideTo(o.virtual.slidesBefore, 0, !1, !0)
                : o.slideTo(o.virtual.slides.length, 0, !1, !0)),
            (o.allowSlidePrev = c),
            (o.allowSlideNext = p),
            void o.emit("loopFix")
          );
        const h =
          "auto" === u.slidesPerView
            ? o.slidesPerViewDynamic()
            : Math.ceil(parseFloat(u.slidesPerView, 10));
        let f = u.loopedSlides || h;
        f % u.slidesPerGroup != 0 &&
          (f += u.slidesPerGroup - (f % u.slidesPerGroup)),
          (o.loopedSlides = f);
        const m = [],
          g = [];
        let v = o.activeIndex;
        void 0 === s
          ? (s = o.getSlideIndex(
              o.slides.filter((e) =>
                e.classList.contains(u.slideActiveClass)
              )[0]
            ))
          : (v = s);
        const b = "next" === r || !r,
          w = "prev" === r || !r;
        let y = 0,
          E = 0;
        if (s < f) {
          y = Math.max(f - s, u.slidesPerGroup);
          for (let e = 0; e < f - s; e += 1) {
            const t = e - Math.floor(e / l.length) * l.length;
            m.push(l.length - t - 1);
          }
        } else if (s > o.slides.length - 2 * f) {
          E = Math.max(s - (o.slides.length - 2 * f), u.slidesPerGroup);
          for (let e = 0; e < E; e += 1) {
            const t = e - Math.floor(e / l.length) * l.length;
            g.push(t);
          }
        }
        if (
          (w &&
            m.forEach((e) => {
              d.prepend(o.slides[e]);
            }),
          b &&
            g.forEach((e) => {
              d.append(o.slides[e]);
            }),
          o.recalcSlides(),
          u.watchSlidesProgress && o.updateSlidesOffset(),
          t)
        )
          if (m.length > 0 && w)
            if (void 0 === e) {
              const e = o.slidesGrid[v],
                t = o.slidesGrid[v + y] - e;
              i
                ? o.setTranslate(o.translate - t)
                : (o.slideTo(v + y, 0, !1, !0),
                  a &&
                    (o.touches[o.isHorizontal() ? "startX" : "startY"] += t));
            } else a && o.slideToLoop(e, 0, !1, !0);
          else if (g.length > 0 && b)
            if (void 0 === e) {
              const e = o.slidesGrid[v],
                t = o.slidesGrid[v - E] - e;
              i
                ? o.setTranslate(o.translate - t)
                : (o.slideTo(v - E, 0, !1, !0),
                  a &&
                    (o.touches[o.isHorizontal() ? "startX" : "startY"] += t));
            } else o.slideToLoop(e, 0, !1, !0);
        if (
          ((o.allowSlidePrev = c),
          (o.allowSlideNext = p),
          o.controller && o.controller.control && !n)
        ) {
          const t = {
            slideRealIndex: e,
            slideTo: !1,
            direction: r,
            setTranslate: a,
            activeSlideIndex: s,
            byController: !0,
          };
          Array.isArray(o.controller.control)
            ? o.controller.control.forEach((e) => {
                !e.destroyed && e.params.loop && e.loopFix(t);
              })
            : o.controller.control instanceof o.constructor &&
              o.controller.control.params.loop &&
              o.controller.control.loopFix(t);
        }
        o.emit("loopFix");
      },
      loopDestroy: function () {
        const e = this,
          { params: t, slidesEl: r } = e;
        if (!t.loop || (e.virtual && e.params.virtual.enabled)) return;
        e.recalcSlides();
        const a = [];
        e.slides.forEach((e) => {
          const t =
            void 0 === e.swiperSlideIndex
              ? 1 * e.getAttribute("data-swiper-slide-index")
              : e.swiperSlideIndex;
          a[t] = e;
        }),
          e.slides.forEach((e) => {
            e.removeAttribute("data-swiper-slide-index");
          }),
          a.forEach((e) => {
            r.append(e);
          }),
          e.recalcSlides(),
          e.slideTo(e.realIndex, 0);
      },
    },
    grabCursor: {
      setGrabCursor: function (e) {
        const t = this;
        if (
          !t.params.simulateTouch ||
          (t.params.watchOverflow && t.isLocked) ||
          t.params.cssMode
        )
          return;
        const r =
          "container" === t.params.touchEventsTarget ? t.el : t.wrapperEl;
        t.isElement && (t.__preventObserver__ = !0),
          (r.style.cursor = "move"),
          (r.style.cursor = e ? "grabbing" : "grab"),
          t.isElement &&
            requestAnimationFrame(() => {
              t.__preventObserver__ = !1;
            });
      },
      unsetGrabCursor: function () {
        const e = this;
        (e.params.watchOverflow && e.isLocked) ||
          e.params.cssMode ||
          (e.isElement && (e.__preventObserver__ = !0),
          (e[
            "container" === e.params.touchEventsTarget ? "el" : "wrapperEl"
          ].style.cursor = ""),
          e.isElement &&
            requestAnimationFrame(() => {
              e.__preventObserver__ = !1;
            }));
      },
    },
    events: {
      attachEvents: function () {
        const e = this,
          t = u(),
          { params: r } = e;
        (e.onTouchStart = Ia.bind(e)),
          (e.onTouchMove = za.bind(e)),
          (e.onTouchEnd = Ba.bind(e)),
          r.cssMode && (e.onScroll = _a.bind(e)),
          (e.onClick = Na.bind(e)),
          (e.onLoad = ja.bind(e)),
          qa || (t.addEventListener("touchstart", Va), (qa = !0)),
          Fa(e, "on");
      },
      detachEvents: function () {
        Fa(this, "off");
      },
    },
    breakpoints: {
      setBreakpoint: function () {
        const e = this,
          { realIndex: t, initialized: r, params: a, el: s } = e,
          n = a.breakpoints;
        if (!n || (n && 0 === Object.keys(n).length)) return;
        const i = e.getBreakpoint(n, e.params.breakpointsBase, e.el);
        if (!i || e.currentBreakpoint === i) return;
        const o = (i in n ? n[i] : void 0) || e.originalParams,
          l = Ya(e, a),
          c = Ya(e, o),
          p = a.enabled;
        l && !c
          ? (s.classList.remove(
              `${a.containerModifierClass}grid`,
              `${a.containerModifierClass}grid-column`
            ),
            e.emitContainerClasses())
          : !l &&
            c &&
            (s.classList.add(`${a.containerModifierClass}grid`),
            ((o.grid.fill && "column" === o.grid.fill) ||
              (!o.grid.fill && "column" === a.grid.fill)) &&
              s.classList.add(`${a.containerModifierClass}grid-column`),
            e.emitContainerClasses()),
          ["navigation", "pagination", "scrollbar"].forEach((t) => {
            const r = a[t] && a[t].enabled,
              s = o[t] && o[t].enabled;
            r && !s && e[t].disable(), !r && s && e[t].enable();
          });
        const d = o.direction && o.direction !== a.direction,
          u = a.loop && (o.slidesPerView !== a.slidesPerView || d);
        d && r && e.changeDirection(), ua(e.params, o);
        const h = e.params.enabled;
        Object.assign(e, {
          allowTouchMove: e.params.allowTouchMove,
          allowSlideNext: e.params.allowSlideNext,
          allowSlidePrev: e.params.allowSlidePrev,
        }),
          p && !h ? e.disable() : !p && h && e.enable(),
          (e.currentBreakpoint = i),
          e.emit("_beforeBreakpoint", o),
          u && r && (e.loopDestroy(), e.loopCreate(t), e.updateSlides()),
          e.emit("breakpoint", o);
      },
      getBreakpoint: function (e, t = "window", r) {
        if (!e || ("container" === t && !r)) return;
        let a = !1;
        const s = f(),
          n = "window" === t ? s.innerHeight : r.clientHeight,
          i = Object.keys(e).map((e) => {
            if ("string" == typeof e && 0 === e.indexOf("@")) {
              const t = parseFloat(e.substr(1));
              return { value: n * t, point: e };
            }
            return { value: e, point: e };
          });
        i.sort((e, t) => parseInt(e.value, 10) - parseInt(t.value, 10));
        for (let o = 0; o < i.length; o += 1) {
          const { point: e, value: n } = i[o];
          "window" === t
            ? s.matchMedia(`(min-width: ${n}px)`).matches && (a = e)
            : n <= r.clientWidth && (a = e);
        }
        return a || "max";
      },
    },
    checkOverflow: {
      checkOverflow: function () {
        const e = this,
          { isLocked: t, params: r } = e,
          { slidesOffsetBefore: a } = r;
        if (a) {
          const t = e.slides.length - 1,
            r = e.slidesGrid[t] + e.slidesSizesGrid[t] + 2 * a;
          e.isLocked = e.size > r;
        } else e.isLocked = 1 === e.snapGrid.length;
        !0 === r.allowSlideNext && (e.allowSlideNext = !e.isLocked),
          !0 === r.allowSlidePrev && (e.allowSlidePrev = !e.isLocked),
          t && t !== e.isLocked && (e.isEnd = !1),
          t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock");
      },
    },
    classes: {
      addClasses: function () {
        const e = this,
          { classNames: t, params: r, rtl: a, el: s, device: n } = e,
          i = (function (e, t) {
            const r = [];
            return (
              e.forEach((e) => {
                "object" == typeof e
                  ? Object.keys(e).forEach((a) => {
                      e[a] && r.push(t + a);
                    })
                  : "string" == typeof e && r.push(t + e);
              }),
              r
            );
          })(
            [
              "initialized",
              r.direction,
              { "free-mode": e.params.freeMode && r.freeMode.enabled },
              { autoheight: r.autoHeight },
              { rtl: a },
              { grid: r.grid && r.grid.rows > 1 },
              {
                "grid-column":
                  r.grid && r.grid.rows > 1 && "column" === r.grid.fill,
              },
              { android: n.android },
              { ios: n.ios },
              { "css-mode": r.cssMode },
              { centered: r.cssMode && r.centeredSlides },
              { "watch-progress": r.watchSlidesProgress },
            ],
            r.containerModifierClass
          );
        t.push(...i), s.classList.add(...t), e.emitContainerClasses();
      },
      removeClasses: function () {
        const { el: e, classNames: t } = this;
        e.classList.remove(...t), this.emitContainerClasses();
      },
    },
  },
  Xa = {};
class Qa {
  constructor(...e) {
    let t, r;
    1 === e.length &&
    e[0].constructor &&
    "Object" === Object.prototype.toString.call(e[0]).slice(8, -1)
      ? (r = e[0])
      : ([t, r] = e),
      r || (r = {}),
      (r = ua({}, r)),
      t && !r.el && (r.el = t);
    const a = u();
    if (
      r.el &&
      "string" == typeof r.el &&
      a.querySelectorAll(r.el).length > 1
    ) {
      const e = [];
      return (
        a.querySelectorAll(r.el).forEach((t) => {
          const a = ua({}, r, { el: t });
          e.push(new Qa(a));
        }),
        e
      );
    }
    const s = this;
    (s.__swiper__ = !0),
      (s.support = Ma()),
      (s.device = Aa({ userAgent: r.userAgent })),
      (s.browser = $a()),
      (s.eventsListeners = {}),
      (s.eventsAnyListeners = []),
      (s.modules = [...s.__modules__]),
      r.modules && Array.isArray(r.modules) && s.modules.push(...r.modules);
    const n = {};
    s.modules.forEach((e) => {
      e({
        params: r,
        swiper: s,
        extendParams: Wa(r, n),
        on: s.on.bind(s),
        once: s.once.bind(s),
        off: s.off.bind(s),
        emit: s.emit.bind(s),
      });
    });
    const i = ua({}, Ga, n);
    return (
      (s.params = ua({}, i, Xa, r)),
      (s.originalParams = ua({}, s.params)),
      (s.passedParams = ua({}, r)),
      s.params &&
        s.params.on &&
        Object.keys(s.params.on).forEach((e) => {
          s.on(e, s.params.on[e]);
        }),
      s.params && s.params.onAny && s.onAny(s.params.onAny),
      Object.assign(s, {
        enabled: s.params.enabled,
        el: t,
        classNames: [],
        slides: [],
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        isHorizontal: () => "horizontal" === s.params.direction,
        isVertical: () => "vertical" === s.params.direction,
        activeIndex: 0,
        realIndex: 0,
        isBeginning: !0,
        isEnd: !1,
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: !1,
        allowSlideNext: s.params.allowSlideNext,
        allowSlidePrev: s.params.allowSlidePrev,
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          focusableElements: s.params.focusableElements,
          lastClickTime: 0,
          clickTimeout: void 0,
          velocities: [],
          allowMomentumBounce: void 0,
          startMoving: void 0,
          evCache: [],
        },
        allowClick: !0,
        allowTouchMove: s.params.allowTouchMove,
        touches: { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 },
        imagesToLoad: [],
        imagesLoaded: 0,
      }),
      s.emit("_swiper"),
      s.params.init && s.init(),
      s
    );
  }
  getSlideIndex(e) {
    const { slidesEl: t, params: r } = this,
      a = ya(ga(t, `.${r.slideClass}, swiper-slide`)[0]);
    return ya(e) - a;
  }
  getSlideIndexByData(e) {
    return this.getSlideIndex(
      this.slides.filter(
        (t) => 1 * t.getAttribute("data-swiper-slide-index") === e
      )[0]
    );
  }
  recalcSlides() {
    const { slidesEl: e, params: t } = this;
    this.slides = ga(e, `.${t.slideClass}, swiper-slide`);
  }
  enable() {
    const e = this;
    e.enabled ||
      ((e.enabled = !0),
      e.params.grabCursor && e.setGrabCursor(),
      e.emit("enable"));
  }
  disable() {
    const e = this;
    e.enabled &&
      ((e.enabled = !1),
      e.params.grabCursor && e.unsetGrabCursor(),
      e.emit("disable"));
  }
  setProgress(e, t) {
    const r = this;
    e = Math.min(Math.max(e, 0), 1);
    const a = r.minTranslate(),
      s = (r.maxTranslate() - a) * e + a;
    r.translateTo(s, void 0 === t ? 0 : t),
      r.updateActiveIndex(),
      r.updateSlidesClasses();
  }
  emitContainerClasses() {
    const e = this;
    if (!e.params._emitClasses || !e.el) return;
    const t = e.el.className
      .split(" ")
      .filter(
        (t) =>
          0 === t.indexOf("swiper") ||
          0 === t.indexOf(e.params.containerModifierClass)
      );
    e.emit("_containerClasses", t.join(" "));
  }
  getSlideClasses(e) {
    const t = this;
    return t.destroyed
      ? ""
      : e.className
          .split(" ")
          .filter(
            (e) =>
              0 === e.indexOf("swiper-slide") ||
              0 === e.indexOf(t.params.slideClass)
          )
          .join(" ");
  }
  emitSlidesClasses() {
    const e = this;
    if (!e.params._emitClasses || !e.el) return;
    const t = [];
    e.slides.forEach((r) => {
      const a = e.getSlideClasses(r);
      t.push({ slideEl: r, classNames: a }), e.emit("_slideClass", r, a);
    }),
      e.emit("_slideClasses", t);
  }
  slidesPerViewDynamic(e = "current", t = !1) {
    const {
      params: r,
      slides: a,
      slidesGrid: s,
      slidesSizesGrid: n,
      size: i,
      activeIndex: o,
    } = this;
    let l = 1;
    if (r.centeredSlides) {
      let e,
        t = a[o].swiperSlideSize;
      for (let r = o + 1; r < a.length; r += 1)
        a[r] &&
          !e &&
          ((t += a[r].swiperSlideSize), (l += 1), t > i && (e = !0));
      for (let r = o - 1; r >= 0; r -= 1)
        a[r] &&
          !e &&
          ((t += a[r].swiperSlideSize), (l += 1), t > i && (e = !0));
    } else if ("current" === e)
      for (let c = o + 1; c < a.length; c += 1) {
        (t ? s[c] + n[c] - s[o] < i : s[c] - s[o] < i) && (l += 1);
      }
    else
      for (let c = o - 1; c >= 0; c -= 1) {
        s[o] - s[c] < i && (l += 1);
      }
    return l;
  }
  update() {
    const e = this;
    if (!e || e.destroyed) return;
    const { snapGrid: t, params: r } = e;
    function a() {
      const t = e.rtlTranslate ? -1 * e.translate : e.translate,
        r = Math.min(Math.max(t, e.maxTranslate()), e.minTranslate());
      e.setTranslate(r), e.updateActiveIndex(), e.updateSlidesClasses();
    }
    let s;
    r.breakpoints && e.setBreakpoint(),
      [...e.el.querySelectorAll('[loading="lazy"]')].forEach((t) => {
        t.complete && Pa(e, t);
      }),
      e.updateSize(),
      e.updateSlides(),
      e.updateProgress(),
      e.updateSlidesClasses(),
      e.params.freeMode && e.params.freeMode.enabled
        ? (a(), e.params.autoHeight && e.updateAutoHeight())
        : ((s =
            ("auto" === e.params.slidesPerView || e.params.slidesPerView > 1) &&
            e.isEnd &&
            !e.params.centeredSlides
              ? e.slideTo(e.slides.length - 1, 0, !1, !0)
              : e.slideTo(e.activeIndex, 0, !1, !0)),
          s || a()),
      r.watchOverflow && t !== e.snapGrid && e.checkOverflow(),
      e.emit("update");
  }
  changeDirection(e, t = !0) {
    const r = this,
      a = r.params.direction;
    return (
      e || (e = "horizontal" === a ? "vertical" : "horizontal"),
      e === a ||
        ("horizontal" !== e && "vertical" !== e) ||
        (r.el.classList.remove(`${r.params.containerModifierClass}${a}`),
        r.el.classList.add(`${r.params.containerModifierClass}${e}`),
        r.emitContainerClasses(),
        (r.params.direction = e),
        r.slides.forEach((t) => {
          "vertical" === e ? (t.style.width = "") : (t.style.height = "");
        }),
        r.emit("changeDirection"),
        t && r.update()),
      r
    );
  }
  changeLanguageDirection(e) {
    const t = this;
    (t.rtl && "rtl" === e) ||
      (!t.rtl && "ltr" === e) ||
      ((t.rtl = "rtl" === e),
      (t.rtlTranslate = "horizontal" === t.params.direction && t.rtl),
      t.rtl
        ? (t.el.classList.add(`${t.params.containerModifierClass}rtl`),
          (t.el.dir = "rtl"))
        : (t.el.classList.remove(`${t.params.containerModifierClass}rtl`),
          (t.el.dir = "ltr")),
      t.update());
  }
  mount(e) {
    const t = this;
    if (t.mounted) return !0;
    let r = e || t.params.el;
    if (("string" == typeof r && (r = document.querySelector(r)), !r))
      return !1;
    (r.swiper = t), r.shadowEl && (t.isElement = !0);
    const a = () =>
      `.${(t.params.wrapperClass || "").trim().split(" ").join(".")}`;
    let s = (() => {
      if (r && r.shadowRoot && r.shadowRoot.querySelector) {
        return r.shadowRoot.querySelector(a());
      }
      return ga(r, a())[0];
    })();
    return (
      !s &&
        t.params.createElements &&
        ((s = va("div", t.params.wrapperClass)),
        r.append(s),
        ga(r, `.${t.params.slideClass}`).forEach((e) => {
          s.append(e);
        })),
      Object.assign(t, {
        el: r,
        wrapperEl: s,
        slidesEl: t.isElement ? r : s,
        mounted: !0,
        rtl: "rtl" === r.dir.toLowerCase() || "rtl" === wa(r, "direction"),
        rtlTranslate:
          "horizontal" === t.params.direction &&
          ("rtl" === r.dir.toLowerCase() || "rtl" === wa(r, "direction")),
        wrongRTL: "-webkit-box" === wa(s, "display"),
      }),
      !0
    );
  }
  init(e) {
    const t = this;
    if (t.initialized) return t;
    return (
      !1 === t.mount(e) ||
        (t.emit("beforeInit"),
        t.params.breakpoints && t.setBreakpoint(),
        t.addClasses(),
        t.updateSize(),
        t.updateSlides(),
        t.params.watchOverflow && t.checkOverflow(),
        t.params.grabCursor && t.enabled && t.setGrabCursor(),
        t.params.loop && t.virtual && t.params.virtual.enabled
          ? t.slideTo(
              t.params.initialSlide + t.virtual.slidesBefore,
              0,
              t.params.runCallbacksOnInit,
              !1,
              !0
            )
          : t.slideTo(
              t.params.initialSlide,
              0,
              t.params.runCallbacksOnInit,
              !1,
              !0
            ),
        t.params.loop && t.loopCreate(),
        t.attachEvents(),
        [...t.el.querySelectorAll('[loading="lazy"]')].forEach((e) => {
          e.complete
            ? Pa(t, e)
            : e.addEventListener("load", (e) => {
                Pa(t, e.target);
              });
        }),
        La(t),
        (t.initialized = !0),
        La(t),
        t.emit("init"),
        t.emit("afterInit")),
      t
    );
  }
  destroy(e = !0, t = !0) {
    const r = this,
      { params: a, el: s, wrapperEl: n, slides: i } = r;
    return (
      void 0 === r.params ||
        r.destroyed ||
        (r.emit("beforeDestroy"),
        (r.initialized = !1),
        r.detachEvents(),
        a.loop && r.loopDestroy(),
        t &&
          (r.removeClasses(),
          s.removeAttribute("style"),
          n.removeAttribute("style"),
          i &&
            i.length &&
            i.forEach((e) => {
              e.classList.remove(
                a.slideVisibleClass,
                a.slideActiveClass,
                a.slideNextClass,
                a.slidePrevClass
              ),
                e.removeAttribute("style"),
                e.removeAttribute("data-swiper-slide-index");
            })),
        r.emit("destroy"),
        Object.keys(r.eventsListeners).forEach((e) => {
          r.off(e);
        }),
        !1 !== e &&
          ((r.el.swiper = null),
          (function (e) {
            const t = e;
            Object.keys(t).forEach((e) => {
              try {
                t[e] = null;
              } catch (r) {}
              try {
                delete t[e];
              } catch (r) {}
            });
          })(r)),
        (r.destroyed = !0)),
      null
    );
  }
  static extendDefaults(e) {
    ua(Xa, e);
  }
  static get extendedDefaults() {
    return Xa;
  }
  static get defaults() {
    return Ga;
  }
  static installModule(e) {
    Qa.prototype.__modules__ || (Qa.prototype.__modules__ = []);
    const t = Qa.prototype.__modules__;
    "function" == typeof e && t.indexOf(e) < 0 && t.push(e);
  }
  static use(e) {
    return Array.isArray(e)
      ? (e.forEach((e) => Qa.installModule(e)), Qa)
      : (Qa.installModule(e), Qa);
  }
}
Object.keys(Ua).forEach((e) => {
  Object.keys(Ua[e]).forEach((t) => {
    Qa.prototype[t] = Ua[e][t];
  });
}),
  Qa.use([
    function ({ swiper: e, on: t, emit: r }) {
      const a = f();
      let s = null,
        n = null;
      const i = () => {
          e &&
            !e.destroyed &&
            e.initialized &&
            (r("beforeResize"), r("resize"));
        },
        o = () => {
          e && !e.destroyed && e.initialized && r("orientationchange");
        };
      t("init", () => {
        e.params.resizeObserver && void 0 !== a.ResizeObserver
          ? e &&
            !e.destroyed &&
            e.initialized &&
            ((s = new ResizeObserver((t) => {
              n = a.requestAnimationFrame(() => {
                const { width: r, height: a } = e;
                let s = r,
                  n = a;
                t.forEach(
                  ({ contentBoxSize: t, contentRect: r, target: a }) => {
                    (a && a !== e.el) ||
                      ((s = r ? r.width : (t[0] || t).inlineSize),
                      (n = r ? r.height : (t[0] || t).blockSize));
                  }
                ),
                  (s === r && n === a) || i();
              });
            })),
            s.observe(e.el))
          : (a.addEventListener("resize", i),
            a.addEventListener("orientationchange", o));
      }),
        t("destroy", () => {
          n && a.cancelAnimationFrame(n),
            s && s.unobserve && e.el && (s.unobserve(e.el), (s = null)),
            a.removeEventListener("resize", i),
            a.removeEventListener("orientationchange", o);
        });
    },
    function ({ swiper: e, extendParams: t, on: r, emit: a }) {
      const s = [],
        n = f(),
        i = (t, r = {}) => {
          const i = new (n.MutationObserver || n.WebkitMutationObserver)(
            (t) => {
              if (e.__preventObserver__) return;
              if (1 === t.length) return void a("observerUpdate", t[0]);
              const r = function () {
                a("observerUpdate", t[0]);
              };
              n.requestAnimationFrame
                ? n.requestAnimationFrame(r)
                : n.setTimeout(r, 0);
            }
          );
          i.observe(t, {
            attributes: void 0 === r.attributes || r.attributes,
            childList: void 0 === r.childList || r.childList,
            characterData: void 0 === r.characterData || r.characterData,
          }),
            s.push(i);
        };
      t({ observer: !1, observeParents: !1, observeSlideChildren: !1 }),
        r("init", () => {
          if (e.params.observer) {
            if (e.params.observeParents) {
              const t = Ea(e.el);
              for (let e = 0; e < t.length; e += 1) i(t[e]);
            }
            i(e.el, { childList: e.params.observeSlideChildren }),
              i(e.wrapperEl, { attributes: !1 });
          }
        }),
        r("destroy", () => {
          s.forEach((e) => {
            e.disconnect();
          }),
            s.splice(0, s.length);
        });
    },
  ]);
var Ka = Qa;
function Za(e, t, r, a) {
  return (
    e.params.createElements &&
      Object.keys(a).forEach((s) => {
        if (!r[s] && !0 === r.auto) {
          let n = ga(e.el, `.${a[s]}`)[0];
          n || ((n = va("div", a[s])), (n.className = a[s]), e.el.append(n)),
            (r[s] = n),
            (t[s] = n);
        }
      }),
    r
  );
}
function Ja(e = "") {
  return `.${e
    .trim()
    .replace(/([\.:!+\/])/g, "\\$1")
    .replace(/ /g, ".")}`;
}
function es(e) {
  const t = this,
    { params: r, slidesEl: a } = t;
  r.loop && t.loopDestroy();
  const s = (e) => {
    if ("string" == typeof e) {
      const t = document.createElement("div");
      (t.innerHTML = e), a.append(t.children[0]), (t.innerHTML = "");
    } else a.append(e);
  };
  if ("object" == typeof e && "length" in e)
    for (let n = 0; n < e.length; n += 1) e[n] && s(e[n]);
  else s(e);
  t.recalcSlides(),
    r.loop && t.loopCreate(),
    (r.observer && !t.isElement) || t.update();
}
function ts(e) {
  const t = this,
    { params: r, activeIndex: a, slidesEl: s } = t;
  r.loop && t.loopDestroy();
  let n = a + 1;
  const i = (e) => {
    if ("string" == typeof e) {
      const t = document.createElement("div");
      (t.innerHTML = e), s.prepend(t.children[0]), (t.innerHTML = "");
    } else s.prepend(e);
  };
  if ("object" == typeof e && "length" in e) {
    for (let t = 0; t < e.length; t += 1) e[t] && i(e[t]);
    n = a + e.length;
  } else i(e);
  t.recalcSlides(),
    r.loop && t.loopCreate(),
    (r.observer && !t.isElement) || t.update(),
    t.slideTo(n, 0, !1);
}
function rs(e, t) {
  const r = this,
    { params: a, activeIndex: s, slidesEl: n } = r;
  let i = s;
  a.loop && ((i -= r.loopedSlides), r.loopDestroy(), r.recalcSlides());
  const o = r.slides.length;
  if (e <= 0) return void r.prependSlide(t);
  if (e >= o) return void r.appendSlide(t);
  let l = i > e ? i + 1 : i;
  const c = [];
  for (let p = o - 1; p >= e; p -= 1) {
    const e = r.slides[p];
    e.remove(), c.unshift(e);
  }
  if ("object" == typeof t && "length" in t) {
    for (let e = 0; e < t.length; e += 1) t[e] && n.append(t[e]);
    l = i > e ? i + t.length : i;
  } else n.append(t);
  for (let p = 0; p < c.length; p += 1) n.append(c[p]);
  r.recalcSlides(),
    a.loop && r.loopCreate(),
    (a.observer && !r.isElement) || r.update(),
    a.loop ? r.slideTo(l + r.loopedSlides, 0, !1) : r.slideTo(l, 0, !1);
}
function as(e) {
  const t = this,
    { params: r, activeIndex: a } = t;
  let s = a;
  r.loop && ((s -= t.loopedSlides), t.loopDestroy());
  let n,
    i = s;
  if ("object" == typeof e && "length" in e) {
    for (let r = 0; r < e.length; r += 1)
      (n = e[r]), t.slides[n] && t.slides[n].remove(), n < i && (i -= 1);
    i = Math.max(i, 0);
  } else
    (n = e),
      t.slides[n] && t.slides[n].remove(),
      n < i && (i -= 1),
      (i = Math.max(i, 0));
  t.recalcSlides(),
    r.loop && t.loopCreate(),
    (r.observer && !t.isElement) || t.update(),
    r.loop ? t.slideTo(i + t.loopedSlides, 0, !1) : t.slideTo(i, 0, !1);
}
function ss() {
  const e = this,
    t = [];
  for (let r = 0; r < e.slides.length; r += 1) t.push(r);
  e.removeSlide(t);
}
function ns(e) {
  const {
    effect: t,
    swiper: r,
    on: a,
    setTranslate: s,
    setTransition: n,
    overwriteParams: i,
    perspective: o,
    recreateShadows: l,
    getEffectParams: c,
  } = e;
  let p;
  a("beforeInit", () => {
    if (r.params.effect !== t) return;
    r.classNames.push(`${r.params.containerModifierClass}${t}`),
      o && o() && r.classNames.push(`${r.params.containerModifierClass}3d`);
    const e = i ? i() : {};
    Object.assign(r.params, e), Object.assign(r.originalParams, e);
  }),
    a("setTranslate", () => {
      r.params.effect === t && s();
    }),
    a("setTransition", (e, a) => {
      r.params.effect === t && n(a);
    }),
    a("transitionEnd", () => {
      if (r.params.effect === t && l) {
        if (!c || !c().slideShadows) return;
        r.slides.forEach((e) => {
          e.querySelectorAll(
            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
          ).forEach((e) => e.remove());
        }),
          l();
      }
    }),
    a("virtualUpdate", () => {
      r.params.effect === t &&
        (r.slides.length || (p = !0),
        requestAnimationFrame(() => {
          p && r.slides && r.slides.length && (s(), (p = !1));
        }));
    });
}
function is(e, t) {
  const r = ma(t);
  return (
    r !== t &&
      ((r.style.backfaceVisibility = "hidden"),
      (r.style["-webkit-backface-visibility"] = "hidden")),
    r
  );
}
function os({ swiper: e, duration: t, transformElements: r, allSlides: a }) {
  const { activeIndex: s } = e;
  if (e.params.virtualTranslate && 0 !== t) {
    let t,
      n = !1;
    (t = a
      ? r
      : r.filter((t) => {
          const r = t.classList.contains("swiper-slide-transform")
            ? ((t) => {
                if (!t.parentElement)
                  return e.slides.filter(
                    (e) => e.shadowEl && e.shadowEl === t.parentNode
                  )[0];
                return t.parentElement;
              })(t)
            : t;
          return e.getSlideIndex(r) === s;
        })),
      t.forEach((t) => {
        Ca(t, () => {
          if (n) return;
          if (!e || e.destroyed) return;
          (n = !0), (e.animating = !1);
          const t = new window.CustomEvent("transitionend", {
            bubbles: !0,
            cancelable: !0,
          });
          e.wrapperEl.dispatchEvent(t);
        });
      });
  }
}
function ls(e, t, r) {
  const a = "swiper-slide-shadow" + (r ? `-${r}` : ""),
    s = ma(t);
  let n = s.querySelector(`.${a}`);
  return (
    n ||
      ((n = va("div", "swiper-slide-shadow" + (r ? `-${r}` : ""))),
      s.append(n)),
    n
  );
}
const cs = [
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    let s;
    t({
      virtual: {
        enabled: !1,
        slides: [],
        cache: !0,
        renderSlide: null,
        renderExternal: null,
        renderExternalUpdate: !0,
        addSlidesBefore: 0,
        addSlidesAfter: 0,
      },
    });
    const n = u();
    e.virtual = {
      cache: {},
      from: void 0,
      to: void 0,
      slides: [],
      offset: 0,
      slidesGrid: [],
    };
    const i = n.createElement("div");
    function o(t, r) {
      const a = e.params.virtual;
      if (a.cache && e.virtual.cache[r]) return e.virtual.cache[r];
      let s;
      return (
        a.renderSlide
          ? ((s = a.renderSlide.call(e, t, r)),
            "string" == typeof s && ((i.innerHTML = s), (s = i.children[0])))
          : (s = e.isElement
              ? va("swiper-slide")
              : va("div", e.params.slideClass)),
        s.setAttribute("data-swiper-slide-index", r),
        a.renderSlide || (s.innerHTML = t),
        a.cache && (e.virtual.cache[r] = s),
        s
      );
    }
    function l(t) {
      const {
          slidesPerView: r,
          slidesPerGroup: s,
          centeredSlides: n,
          loop: i,
        } = e.params,
        { addSlidesBefore: l, addSlidesAfter: c } = e.params.virtual,
        { from: p, to: d, slides: u, slidesGrid: h, offset: f } = e.virtual;
      e.params.cssMode || e.updateActiveIndex();
      const m = e.activeIndex || 0;
      let g, v, b;
      (g = e.rtlTranslate ? "right" : e.isHorizontal() ? "left" : "top"),
        n
          ? ((v = Math.floor(r / 2) + s + c), (b = Math.floor(r / 2) + s + l))
          : ((v = r + (s - 1) + c), (b = (i ? r : s) + l));
      let w = m - b,
        y = m + v;
      i || ((w = Math.max(w, 0)), (y = Math.min(y, u.length - 1)));
      let E = (e.slidesGrid[w] || 0) - (e.slidesGrid[0] || 0);
      function C() {
        e.updateSlides(),
          e.updateProgress(),
          e.updateSlidesClasses(),
          a("virtualUpdate");
      }
      if (
        (i && m >= b
          ? ((w -= b), n || (E += e.slidesGrid[0]))
          : i && m < b && ((w = -b), n && (E += e.slidesGrid[0])),
        Object.assign(e.virtual, {
          from: w,
          to: y,
          offset: E,
          slidesGrid: e.slidesGrid,
          slidesBefore: b,
          slidesAfter: v,
        }),
        p === w && d === y && !t)
      )
        return (
          e.slidesGrid !== h &&
            E !== f &&
            e.slides.forEach((e) => {
              e.style[g] = `${E}px`;
            }),
          e.updateProgress(),
          void a("virtualUpdate")
        );
      if (e.params.virtual.renderExternal)
        return (
          e.params.virtual.renderExternal.call(e, {
            offset: E,
            from: w,
            to: y,
            slides: (function () {
              const e = [];
              for (let t = w; t <= y; t += 1) e.push(u[t]);
              return e;
            })(),
          }),
          void (e.params.virtual.renderExternalUpdate
            ? C()
            : a("virtualUpdate"))
        );
      const x = [],
        S = [],
        k = (e) => {
          let t = e;
          return (
            e < 0 ? (t = u.length + e) : t >= u.length && (t -= u.length), t
          );
        };
      if (t)
        e.slidesEl
          .querySelectorAll(`.${e.params.slideClass}, swiper-slide`)
          .forEach((e) => {
            e.remove();
          });
      else
        for (let a = p; a <= d; a += 1)
          if (a < w || a > y) {
            const t = k(a);
            e.slidesEl
              .querySelectorAll(
                `.${e.params.slideClass}[data-swiper-slide-index="${t}"], swiper-slide[data-swiper-slide-index="${t}"]`
              )
              .forEach((e) => {
                e.remove();
              });
          }
      const T = i ? -u.length : 0,
        M = i ? 2 * u.length : u.length;
      for (let e = T; e < M; e += 1)
        if (e >= w && e <= y) {
          const r = k(e);
          void 0 === d || t
            ? S.push(r)
            : (e > d && S.push(r), e < p && x.push(r));
        }
      if (
        (S.forEach((t) => {
          e.slidesEl.append(o(u[t], t));
        }),
        i)
      )
        for (let a = x.length - 1; a >= 0; a -= 1) {
          const t = x[a];
          e.slidesEl.prepend(o(u[t], t));
        }
      else
        x.sort((e, t) => t - e),
          x.forEach((t) => {
            e.slidesEl.prepend(o(u[t], t));
          });
      ga(e.slidesEl, ".swiper-slide, swiper-slide").forEach((e) => {
        e.style[g] = `${E}px`;
      }),
        C();
    }
    r("beforeInit", () => {
      if (!e.params.virtual.enabled) return;
      let t;
      if (void 0 === e.passedParams.virtual.slides) {
        const r = [...e.slidesEl.children].filter((t) =>
          t.matches(`.${e.params.slideClass}, swiper-slide`)
        );
        r &&
          r.length &&
          ((e.virtual.slides = [...r]),
          (t = !0),
          r.forEach((t, r) => {
            t.setAttribute("data-swiper-slide-index", r),
              (e.virtual.cache[r] = t),
              t.remove();
          }));
      }
      t || (e.virtual.slides = e.params.virtual.slides),
        e.classNames.push(`${e.params.containerModifierClass}virtual`),
        (e.params.watchSlidesProgress = !0),
        (e.originalParams.watchSlidesProgress = !0),
        e.params.initialSlide || l();
    }),
      r("setTranslate", () => {
        e.params.virtual.enabled &&
          (e.params.cssMode && !e._immediateVirtual
            ? (clearTimeout(s),
              (s = setTimeout(() => {
                l();
              }, 100)))
            : l());
      }),
      r("init update resize", () => {
        e.params.virtual.enabled &&
          e.params.cssMode &&
          ha(e.wrapperEl, "--swiper-virtual-size", `${e.virtualSize}px`);
      }),
      Object.assign(e.virtual, {
        appendSlide: function (t) {
          if ("object" == typeof t && "length" in t)
            for (let r = 0; r < t.length; r += 1)
              t[r] && e.virtual.slides.push(t[r]);
          else e.virtual.slides.push(t);
          l(!0);
        },
        prependSlide: function (t) {
          const r = e.activeIndex;
          let a = r + 1,
            s = 1;
          if (Array.isArray(t)) {
            for (let r = 0; r < t.length; r += 1)
              t[r] && e.virtual.slides.unshift(t[r]);
            (a = r + t.length), (s = t.length);
          } else e.virtual.slides.unshift(t);
          if (e.params.virtual.cache) {
            const t = e.virtual.cache,
              r = {};
            Object.keys(t).forEach((e) => {
              const a = t[e],
                n = a.getAttribute("data-swiper-slide-index");
              n &&
                a.setAttribute("data-swiper-slide-index", parseInt(n, 10) + s),
                (r[parseInt(e, 10) + s] = a);
            }),
              (e.virtual.cache = r);
          }
          l(!0), e.slideTo(a, 0);
        },
        removeSlide: function (t) {
          if (null == t) return;
          let r = e.activeIndex;
          if (Array.isArray(t))
            for (let a = t.length - 1; a >= 0; a -= 1)
              e.virtual.slides.splice(t[a], 1),
                e.params.virtual.cache && delete e.virtual.cache[t[a]],
                t[a] < r && (r -= 1),
                (r = Math.max(r, 0));
          else
            e.virtual.slides.splice(t, 1),
              e.params.virtual.cache && delete e.virtual.cache[t],
              t < r && (r -= 1),
              (r = Math.max(r, 0));
          l(!0), e.slideTo(r, 0);
        },
        removeAllSlides: function () {
          (e.virtual.slides = []),
            e.params.virtual.cache && (e.virtual.cache = {}),
            l(!0),
            e.slideTo(0, 0);
        },
        update: l,
      });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    const s = u(),
      n = f();
    function i(t) {
      if (!e.enabled) return;
      const { rtlTranslate: r } = e;
      let i = t;
      i.originalEvent && (i = i.originalEvent);
      const o = i.keyCode || i.charCode,
        l = e.params.keyboard.pageUpDown,
        c = l && 33 === o,
        p = l && 34 === o,
        d = 37 === o,
        u = 39 === o,
        h = 38 === o,
        f = 40 === o;
      if (
        !e.allowSlideNext &&
        ((e.isHorizontal() && u) || (e.isVertical() && f) || p)
      )
        return !1;
      if (
        !e.allowSlidePrev &&
        ((e.isHorizontal() && d) || (e.isVertical() && h) || c)
      )
        return !1;
      if (
        !(
          i.shiftKey ||
          i.altKey ||
          i.ctrlKey ||
          i.metaKey ||
          (s.activeElement &&
            s.activeElement.nodeName &&
            ("input" === s.activeElement.nodeName.toLowerCase() ||
              "textarea" === s.activeElement.nodeName.toLowerCase()))
        )
      ) {
        if (e.params.keyboard.onlyInViewport && (c || p || d || u || h || f)) {
          let t = !1;
          if (
            Ea(e.el, `.${e.params.slideClass}, swiper-slide`).length > 0 &&
            0 === Ea(e.el, `.${e.params.slideActiveClass}`).length
          )
            return;
          const a = e.el,
            s = a.clientWidth,
            i = a.clientHeight,
            o = n.innerWidth,
            l = n.innerHeight,
            c = ba(a);
          r && (c.left -= a.scrollLeft);
          const p = [
            [c.left, c.top],
            [c.left + s, c.top],
            [c.left, c.top + i],
            [c.left + s, c.top + i],
          ];
          for (let e = 0; e < p.length; e += 1) {
            const r = p[e];
            if (r[0] >= 0 && r[0] <= o && r[1] >= 0 && r[1] <= l) {
              if (0 === r[0] && 0 === r[1]) continue;
              t = !0;
            }
          }
          if (!t) return;
        }
        e.isHorizontal()
          ? ((c || p || d || u) &&
              (i.preventDefault ? i.preventDefault() : (i.returnValue = !1)),
            (((p || u) && !r) || ((c || d) && r)) && e.slideNext(),
            (((c || d) && !r) || ((p || u) && r)) && e.slidePrev())
          : ((c || p || h || f) &&
              (i.preventDefault ? i.preventDefault() : (i.returnValue = !1)),
            (p || f) && e.slideNext(),
            (c || h) && e.slidePrev()),
          a("keyPress", o);
      }
    }
    function o() {
      e.keyboard.enabled ||
        (s.addEventListener("keydown", i), (e.keyboard.enabled = !0));
    }
    function l() {
      e.keyboard.enabled &&
        (s.removeEventListener("keydown", i), (e.keyboard.enabled = !1));
    }
    (e.keyboard = { enabled: !1 }),
      t({ keyboard: { enabled: !1, onlyInViewport: !0, pageUpDown: !0 } }),
      r("init", () => {
        e.params.keyboard.enabled && o();
      }),
      r("destroy", () => {
        e.keyboard.enabled && l();
      }),
      Object.assign(e.keyboard, { enable: o, disable: l });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    const s = f();
    let n;
    t({
      mousewheel: {
        enabled: !1,
        releaseOnEdges: !1,
        invert: !1,
        forceToAxis: !1,
        sensitivity: 1,
        eventsTarget: "container",
        thresholdDelta: null,
        thresholdTime: null,
      },
    }),
      (e.mousewheel = { enabled: !1 });
    let i,
      o = ca();
    const l = [];
    function c() {
      e.enabled && (e.mouseEntered = !0);
    }
    function p() {
      e.enabled && (e.mouseEntered = !1);
    }
    function d(t) {
      return (
        !(
          e.params.mousewheel.thresholdDelta &&
          t.delta < e.params.mousewheel.thresholdDelta
        ) &&
        !(
          e.params.mousewheel.thresholdTime &&
          ca() - o < e.params.mousewheel.thresholdTime
        ) &&
        ((t.delta >= 6 && ca() - o < 60) ||
          (t.direction < 0
            ? (e.isEnd && !e.params.loop) ||
              e.animating ||
              (e.slideNext(), a("scroll", t.raw))
            : (e.isBeginning && !e.params.loop) ||
              e.animating ||
              (e.slidePrev(), a("scroll", t.raw)),
          (o = new s.Date().getTime()),
          !1))
      );
    }
    function u(t) {
      let r = t,
        s = !0;
      if (!e.enabled) return;
      const o = e.params.mousewheel;
      e.params.cssMode && r.preventDefault();
      let c = e.el;
      "container" !== e.params.mousewheel.eventsTarget &&
        (c = document.querySelector(e.params.mousewheel.eventsTarget));
      const p = c && c.contains(r.target);
      if (!e.mouseEntered && !p && !o.releaseOnEdges) return !0;
      r.originalEvent && (r = r.originalEvent);
      let u = 0;
      const h = e.rtlTranslate ? -1 : 1,
        f = (function (e) {
          let t = 0,
            r = 0,
            a = 0,
            s = 0;
          return (
            "detail" in e && (r = e.detail),
            "wheelDelta" in e && (r = -e.wheelDelta / 120),
            "wheelDeltaY" in e && (r = -e.wheelDeltaY / 120),
            "wheelDeltaX" in e && (t = -e.wheelDeltaX / 120),
            "axis" in e && e.axis === e.HORIZONTAL_AXIS && ((t = r), (r = 0)),
            (a = 10 * t),
            (s = 10 * r),
            "deltaY" in e && (s = e.deltaY),
            "deltaX" in e && (a = e.deltaX),
            e.shiftKey && !a && ((a = s), (s = 0)),
            (a || s) &&
              e.deltaMode &&
              (1 === e.deltaMode
                ? ((a *= 40), (s *= 40))
                : ((a *= 800), (s *= 800))),
            a && !t && (t = a < 1 ? -1 : 1),
            s && !r && (r = s < 1 ? -1 : 1),
            { spinX: t, spinY: r, pixelX: a, pixelY: s }
          );
        })(r);
      if (o.forceToAxis)
        if (e.isHorizontal()) {
          if (!(Math.abs(f.pixelX) > Math.abs(f.pixelY))) return !0;
          u = -f.pixelX * h;
        } else {
          if (!(Math.abs(f.pixelY) > Math.abs(f.pixelX))) return !0;
          u = -f.pixelY;
        }
      else
        u = Math.abs(f.pixelX) > Math.abs(f.pixelY) ? -f.pixelX * h : -f.pixelY;
      if (0 === u) return !0;
      o.invert && (u = -u);
      let m = e.getTranslate() + u * o.sensitivity;
      if (
        (m >= e.minTranslate() && (m = e.minTranslate()),
        m <= e.maxTranslate() && (m = e.maxTranslate()),
        (s =
          !!e.params.loop ||
          !(m === e.minTranslate() || m === e.maxTranslate())),
        s && e.params.nested && r.stopPropagation(),
        e.params.freeMode && e.params.freeMode.enabled)
      ) {
        const t = { time: ca(), delta: Math.abs(u), direction: Math.sign(u) },
          s =
            i &&
            t.time < i.time + 500 &&
            t.delta <= i.delta &&
            t.direction === i.direction;
        if (!s) {
          i = void 0;
          let c = e.getTranslate() + u * o.sensitivity;
          const p = e.isBeginning,
            d = e.isEnd;
          if (
            (c >= e.minTranslate() && (c = e.minTranslate()),
            c <= e.maxTranslate() && (c = e.maxTranslate()),
            e.setTransition(0),
            e.setTranslate(c),
            e.updateProgress(),
            e.updateActiveIndex(),
            e.updateSlidesClasses(),
            ((!p && e.isBeginning) || (!d && e.isEnd)) &&
              e.updateSlidesClasses(),
            e.params.loop &&
              e.loopFix({
                direction: t.direction < 0 ? "next" : "prev",
                byMousewheel: !0,
              }),
            e.params.freeMode.sticky)
          ) {
            clearTimeout(n), (n = void 0), l.length >= 15 && l.shift();
            const r = l.length ? l[l.length - 1] : void 0,
              a = l[0];
            if (
              (l.push(t),
              r && (t.delta > r.delta || t.direction !== r.direction))
            )
              l.splice(0);
            else if (
              l.length >= 15 &&
              t.time - a.time < 500 &&
              a.delta - t.delta >= 1 &&
              t.delta <= 6
            ) {
              const r = u > 0 ? 0.8 : 0.2;
              (i = t),
                l.splice(0),
                (n = la(() => {
                  e.slideToClosest(e.params.speed, !0, void 0, r);
                }, 0));
            }
            n ||
              (n = la(() => {
                (i = t),
                  l.splice(0),
                  e.slideToClosest(e.params.speed, !0, void 0, 0.5);
              }, 500));
          }
          if (
            (s || a("scroll", r),
            e.params.autoplay &&
              e.params.autoplayDisableOnInteraction &&
              e.autoplay.stop(),
            c === e.minTranslate() || c === e.maxTranslate())
          )
            return !0;
        }
      } else {
        const r = {
          time: ca(),
          delta: Math.abs(u),
          direction: Math.sign(u),
          raw: t,
        };
        l.length >= 2 && l.shift();
        const a = l.length ? l[l.length - 1] : void 0;
        if (
          (l.push(r),
          a
            ? (r.direction !== a.direction ||
                r.delta > a.delta ||
                r.time > a.time + 150) &&
              d(r)
            : d(r),
          (function (t) {
            const r = e.params.mousewheel;
            if (t.direction < 0) {
              if (e.isEnd && !e.params.loop && r.releaseOnEdges) return !0;
            } else if (e.isBeginning && !e.params.loop && r.releaseOnEdges)
              return !0;
            return !1;
          })(r))
        )
          return !0;
      }
      return r.preventDefault ? r.preventDefault() : (r.returnValue = !1), !1;
    }
    function h(t) {
      let r = e.el;
      "container" !== e.params.mousewheel.eventsTarget &&
        (r = document.querySelector(e.params.mousewheel.eventsTarget)),
        r[t]("mouseenter", c),
        r[t]("mouseleave", p),
        r[t]("wheel", u);
    }
    function m() {
      return e.params.cssMode
        ? (e.wrapperEl.removeEventListener("wheel", u), !0)
        : !e.mousewheel.enabled &&
            (h("addEventListener"), (e.mousewheel.enabled = !0), !0);
    }
    function g() {
      return e.params.cssMode
        ? (e.wrapperEl.addEventListener(event, u), !0)
        : !!e.mousewheel.enabled &&
            (h("removeEventListener"), (e.mousewheel.enabled = !1), !0);
    }
    r("init", () => {
      !e.params.mousewheel.enabled && e.params.cssMode && g(),
        e.params.mousewheel.enabled && m();
    }),
      r("destroy", () => {
        e.params.cssMode && m(), e.mousewheel.enabled && g();
      }),
      Object.assign(e.mousewheel, { enable: m, disable: g });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    t({
      navigation: {
        nextEl: null,
        prevEl: null,
        hideOnClick: !1,
        disabledClass: "swiper-button-disabled",
        hiddenClass: "swiper-button-hidden",
        lockClass: "swiper-button-lock",
        navigationDisabledClass: "swiper-navigation-disabled",
      },
    }),
      (e.navigation = { nextEl: null, prevEl: null });
    const s = (e) => (Array.isArray(e) || (e = [e].filter((e) => !!e)), e);
    function n(t) {
      let r;
      return t &&
        "string" == typeof t &&
        e.isElement &&
        ((r = e.el.shadowRoot.querySelector(t)), r)
        ? r
        : (t &&
            ("string" == typeof t && (r = [...document.querySelectorAll(t)]),
            e.params.uniqueNavElements &&
              "string" == typeof t &&
              r.length > 1 &&
              1 === e.el.querySelectorAll(t).length &&
              (r = e.el.querySelector(t))),
          t && !r ? t : r);
    }
    function i(t, r) {
      const a = e.params.navigation;
      (t = s(t)).forEach((t) => {
        t &&
          (t.classList[r ? "add" : "remove"](...a.disabledClass.split(" ")),
          "BUTTON" === t.tagName && (t.disabled = r),
          e.params.watchOverflow &&
            e.enabled &&
            t.classList[e.isLocked ? "add" : "remove"](a.lockClass));
      });
    }
    function o() {
      const { nextEl: t, prevEl: r } = e.navigation;
      if (e.params.loop) return i(r, !1), void i(t, !1);
      i(r, e.isBeginning && !e.params.rewind),
        i(t, e.isEnd && !e.params.rewind);
    }
    function l(t) {
      t.preventDefault(),
        (!e.isBeginning || e.params.loop || e.params.rewind) &&
          (e.slidePrev(), a("navigationPrev"));
    }
    function c(t) {
      t.preventDefault(),
        (!e.isEnd || e.params.loop || e.params.rewind) &&
          (e.slideNext(), a("navigationNext"));
    }
    function p() {
      const t = e.params.navigation;
      if (
        ((e.params.navigation = Za(
          e,
          e.originalParams.navigation,
          e.params.navigation,
          { nextEl: "swiper-button-next", prevEl: "swiper-button-prev" }
        )),
        !t.nextEl && !t.prevEl)
      )
        return;
      let r = n(t.nextEl),
        a = n(t.prevEl);
      Object.assign(e.navigation, { nextEl: r, prevEl: a }),
        (r = s(r)),
        (a = s(a));
      const i = (r, a) => {
        r && r.addEventListener("click", "next" === a ? c : l),
          !e.enabled && r && r.classList.add(...t.lockClass.split(" "));
      };
      r.forEach((e) => i(e, "next")), a.forEach((e) => i(e, "prev"));
    }
    function d() {
      let { nextEl: t, prevEl: r } = e.navigation;
      (t = s(t)), (r = s(r));
      const a = (t, r) => {
        t.removeEventListener("click", "next" === r ? c : l),
          t.classList.remove(...e.params.navigation.disabledClass.split(" "));
      };
      t.forEach((e) => a(e, "next")), r.forEach((e) => a(e, "prev"));
    }
    r("init", () => {
      !1 === e.params.navigation.enabled ? u() : (p(), o());
    }),
      r("toEdge fromEdge lock unlock", () => {
        o();
      }),
      r("destroy", () => {
        d();
      }),
      r("enable disable", () => {
        let { nextEl: t, prevEl: r } = e.navigation;
        (t = s(t)),
          (r = s(r)),
          [...t, ...r]
            .filter((e) => !!e)
            .forEach((t) =>
              t.classList[e.enabled ? "remove" : "add"](
                e.params.navigation.lockClass
              )
            );
      }),
      r("click", (t, r) => {
        let { nextEl: n, prevEl: i } = e.navigation;
        (n = s(n)), (i = s(i));
        const o = r.target;
        if (
          e.params.navigation.hideOnClick &&
          !i.includes(o) &&
          !n.includes(o)
        ) {
          if (
            e.pagination &&
            e.params.pagination &&
            e.params.pagination.clickable &&
            (e.pagination.el === o || e.pagination.el.contains(o))
          )
            return;
          let t;
          n.length
            ? (t = n[0].classList.contains(e.params.navigation.hiddenClass))
            : i.length &&
              (t = i[0].classList.contains(e.params.navigation.hiddenClass)),
            a(!0 === t ? "navigationShow" : "navigationHide"),
            [...n, ...i]
              .filter((e) => !!e)
              .forEach((t) =>
                t.classList.toggle(e.params.navigation.hiddenClass)
              );
        }
      });
    const u = () => {
      e.el.classList.add(
        ...e.params.navigation.navigationDisabledClass.split(" ")
      ),
        d();
    };
    Object.assign(e.navigation, {
      enable: () => {
        e.el.classList.remove(
          ...e.params.navigation.navigationDisabledClass.split(" ")
        ),
          p(),
          o();
      },
      disable: u,
      update: o,
      init: p,
      destroy: d,
    });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    const s = "swiper-pagination";
    let n;
    t({
      pagination: {
        el: null,
        bulletElement: "span",
        clickable: !1,
        hideOnClick: !1,
        renderBullet: null,
        renderProgressbar: null,
        renderFraction: null,
        renderCustom: null,
        progressbarOpposite: !1,
        type: "bullets",
        dynamicBullets: !1,
        dynamicMainBullets: 1,
        formatFractionCurrent: (e) => e,
        formatFractionTotal: (e) => e,
        bulletClass: `${s}-bullet`,
        bulletActiveClass: `${s}-bullet-active`,
        modifierClass: `${s}-`,
        currentClass: `${s}-current`,
        totalClass: `${s}-total`,
        hiddenClass: `${s}-hidden`,
        progressbarFillClass: `${s}-progressbar-fill`,
        progressbarOppositeClass: `${s}-progressbar-opposite`,
        clickableClass: `${s}-clickable`,
        lockClass: `${s}-lock`,
        horizontalClass: `${s}-horizontal`,
        verticalClass: `${s}-vertical`,
        paginationDisabledClass: `${s}-disabled`,
      },
    }),
      (e.pagination = { el: null, bullets: [] });
    let i = 0;
    const o = (e) => (Array.isArray(e) || (e = [e].filter((e) => !!e)), e);
    function l() {
      return (
        !e.params.pagination.el ||
        !e.pagination.el ||
        (Array.isArray(e.pagination.el) && 0 === e.pagination.el.length)
      );
    }
    function c(t, r) {
      const { bulletActiveClass: a } = e.params.pagination;
      t &&
        (t = t[("prev" === r ? "previous" : "next") + "ElementSibling"]) &&
        (t.classList.add(`${a}-${r}`),
        (t = t[("prev" === r ? "previous" : "next") + "ElementSibling"]) &&
          t.classList.add(`${a}-${r}-${r}`));
    }
    function p(t) {
      const r = t.target.closest(Ja(e.params.pagination.bulletClass));
      if (!r) return;
      t.preventDefault();
      const a = ya(r) * e.params.slidesPerGroup;
      if (e.params.loop) {
        if (e.realIndex === a) return;
        (a < e.loopedSlides || a > e.slides.length - e.loopedSlides) &&
          e.loopFix({
            direction: a < e.loopedSlides ? "prev" : "next",
            activeSlideIndex: a,
            slideTo: !1,
          }),
          e.slideToLoop(a);
      } else e.slideTo(a);
    }
    function d() {
      const t = e.rtl,
        r = e.params.pagination;
      if (l()) return;
      let s,
        p = e.pagination.el;
      p = o(p);
      const d =
          e.virtual && e.params.virtual.enabled
            ? e.virtual.slides.length
            : e.slides.length,
        u = e.params.loop
          ? Math.ceil(d / e.params.slidesPerGroup)
          : e.snapGrid.length;
      if (
        ((s = e.params.loop
          ? e.params.slidesPerGroup > 1
            ? Math.floor(e.realIndex / e.params.slidesPerGroup)
            : e.realIndex
          : void 0 !== e.snapIndex
          ? e.snapIndex
          : e.activeIndex || 0),
        "bullets" === r.type &&
          e.pagination.bullets &&
          e.pagination.bullets.length > 0)
      ) {
        const a = e.pagination.bullets;
        let o, l, d;
        if (
          (r.dynamicBullets &&
            ((n = xa(a[0], e.isHorizontal() ? "width" : "height", !0)),
            p.forEach((t) => {
              t.style[e.isHorizontal() ? "width" : "height"] =
                n * (r.dynamicMainBullets + 4) + "px";
            }),
            r.dynamicMainBullets > 1 &&
              void 0 !== e.previousIndex &&
              ((i += s - (e.previousIndex || 0)),
              i > r.dynamicMainBullets - 1
                ? (i = r.dynamicMainBullets - 1)
                : i < 0 && (i = 0)),
            (o = Math.max(s - i, 0)),
            (l = o + (Math.min(a.length, r.dynamicMainBullets) - 1)),
            (d = (l + o) / 2)),
          a.forEach((e) => {
            const t = [
              ...[
                "",
                "-next",
                "-next-next",
                "-prev",
                "-prev-prev",
                "-main",
              ].map((e) => `${r.bulletActiveClass}${e}`),
            ]
              .map((e) =>
                "string" == typeof e && e.includes(" ") ? e.split(" ") : e
              )
              .flat();
            e.classList.remove(...t);
          }),
          p.length > 1)
        )
          a.forEach((e) => {
            const t = ya(e);
            t === s && e.classList.add(...r.bulletActiveClass.split(" ")),
              r.dynamicBullets &&
                (t >= o &&
                  t <= l &&
                  e.classList.add(...`${r.bulletActiveClass}-main`.split(" ")),
                t === o && c(e, "prev"),
                t === l && c(e, "next"));
          });
        else {
          const e = a[s];
          if (
            (e && e.classList.add(...r.bulletActiveClass.split(" ")),
            r.dynamicBullets)
          ) {
            const e = a[o],
              t = a[l];
            for (let s = o; s <= l; s += 1)
              a[s] &&
                a[s].classList.add(...`${r.bulletActiveClass}-main`.split(" "));
            c(e, "prev"), c(t, "next");
          }
        }
        if (r.dynamicBullets) {
          const s = Math.min(a.length, r.dynamicMainBullets + 4),
            i = (n * s - n) / 2 - d * n,
            o = t ? "right" : "left";
          a.forEach((t) => {
            t.style[e.isHorizontal() ? o : "top"] = `${i}px`;
          });
        }
      }
      p.forEach((t, n) => {
        if (
          ("fraction" === r.type &&
            (t.querySelectorAll(Ja(r.currentClass)).forEach((e) => {
              e.textContent = r.formatFractionCurrent(s + 1);
            }),
            t.querySelectorAll(Ja(r.totalClass)).forEach((e) => {
              e.textContent = r.formatFractionTotal(u);
            })),
          "progressbar" === r.type)
        ) {
          let a;
          a = r.progressbarOpposite
            ? e.isHorizontal()
              ? "vertical"
              : "horizontal"
            : e.isHorizontal()
            ? "horizontal"
            : "vertical";
          const n = (s + 1) / u;
          let i = 1,
            o = 1;
          "horizontal" === a ? (i = n) : (o = n),
            t.querySelectorAll(Ja(r.progressbarFillClass)).forEach((t) => {
              (t.style.transform = `translate3d(0,0,0) scaleX(${i}) scaleY(${o})`),
                (t.style.transitionDuration = `${e.params.speed}ms`);
            });
        }
        "custom" === r.type && r.renderCustom
          ? ((t.innerHTML = r.renderCustom(e, s + 1, u)),
            0 === n && a("paginationRender", t))
          : (0 === n && a("paginationRender", t), a("paginationUpdate", t)),
          e.params.watchOverflow &&
            e.enabled &&
            t.classList[e.isLocked ? "add" : "remove"](r.lockClass);
      });
    }
    function u() {
      const t = e.params.pagination;
      if (l()) return;
      const r =
        e.virtual && e.params.virtual.enabled
          ? e.virtual.slides.length
          : e.slides.length;
      let s = e.pagination.el;
      s = o(s);
      let n = "";
      if ("bullets" === t.type) {
        let a = e.params.loop
          ? Math.ceil(r / e.params.slidesPerGroup)
          : e.snapGrid.length;
        e.params.freeMode && e.params.freeMode.enabled && a > r && (a = r);
        for (let r = 0; r < a; r += 1)
          t.renderBullet
            ? (n += t.renderBullet.call(e, r, t.bulletClass))
            : (n += `<${t.bulletElement} class="${t.bulletClass}"></${t.bulletElement}>`);
      }
      "fraction" === t.type &&
        (n = t.renderFraction
          ? t.renderFraction.call(e, t.currentClass, t.totalClass)
          : `<span class="${t.currentClass}"></span> / <span class="${t.totalClass}"></span>`),
        "progressbar" === t.type &&
          (n = t.renderProgressbar
            ? t.renderProgressbar.call(e, t.progressbarFillClass)
            : `<span class="${t.progressbarFillClass}"></span>`),
        (e.pagination.bullets = []),
        s.forEach((r) => {
          "custom" !== t.type && (r.innerHTML = n || ""),
            "bullets" === t.type &&
              e.pagination.bullets.push(
                ...r.querySelectorAll(Ja(t.bulletClass))
              );
        }),
        "custom" !== t.type && a("paginationRender", s[0]);
    }
    function h() {
      e.params.pagination = Za(
        e,
        e.originalParams.pagination,
        e.params.pagination,
        { el: "swiper-pagination" }
      );
      const t = e.params.pagination;
      if (!t.el) return;
      let r;
      "string" == typeof t.el &&
        e.isElement &&
        (r = e.el.shadowRoot.querySelector(t.el)),
        r ||
          "string" != typeof t.el ||
          (r = [...document.querySelectorAll(t.el)]),
        r || (r = t.el),
        r &&
          0 !== r.length &&
          (e.params.uniqueNavElements &&
            "string" == typeof t.el &&
            Array.isArray(r) &&
            r.length > 1 &&
            ((r = [...e.el.querySelectorAll(t.el)]),
            r.length > 1 &&
              (r = r.filter((t) => Ea(t, ".swiper")[0] === e.el)[0])),
          Array.isArray(r) && 1 === r.length && (r = r[0]),
          Object.assign(e.pagination, { el: r }),
          (r = o(r)),
          r.forEach((r) => {
            "bullets" === t.type &&
              t.clickable &&
              r.classList.add(t.clickableClass),
              r.classList.add(t.modifierClass + t.type),
              r.classList.add(
                e.isHorizontal() ? t.horizontalClass : t.verticalClass
              ),
              "bullets" === t.type &&
                t.dynamicBullets &&
                (r.classList.add(`${t.modifierClass}${t.type}-dynamic`),
                (i = 0),
                t.dynamicMainBullets < 1 && (t.dynamicMainBullets = 1)),
              "progressbar" === t.type &&
                t.progressbarOpposite &&
                r.classList.add(t.progressbarOppositeClass),
              t.clickable && r.addEventListener("click", p),
              e.enabled || r.classList.add(t.lockClass);
          }));
    }
    function f() {
      const t = e.params.pagination;
      if (l()) return;
      let r = e.pagination.el;
      r &&
        ((r = o(r)),
        r.forEach((r) => {
          r.classList.remove(t.hiddenClass),
            r.classList.remove(t.modifierClass + t.type),
            r.classList.remove(
              e.isHorizontal() ? t.horizontalClass : t.verticalClass
            ),
            t.clickable && r.removeEventListener("click", p);
        })),
        e.pagination.bullets &&
          e.pagination.bullets.forEach((e) =>
            e.classList.remove(...t.bulletActiveClass.split(" "))
          );
    }
    r("init", () => {
      !1 === e.params.pagination.enabled ? m() : (h(), u(), d());
    }),
      r("activeIndexChange", () => {
        void 0 === e.snapIndex && d();
      }),
      r("snapIndexChange", () => {
        d();
      }),
      r("snapGridLengthChange", () => {
        u(), d();
      }),
      r("destroy", () => {
        f();
      }),
      r("enable disable", () => {
        let { el: t } = e.pagination;
        t &&
          ((t = o(t)),
          t.forEach((t) =>
            t.classList[e.enabled ? "remove" : "add"](
              e.params.pagination.lockClass
            )
          ));
      }),
      r("lock unlock", () => {
        d();
      }),
      r("click", (t, r) => {
        const s = r.target;
        let { el: n } = e.pagination;
        if (
          (Array.isArray(n) || (n = [n].filter((e) => !!e)),
          e.params.pagination.el &&
            e.params.pagination.hideOnClick &&
            n &&
            n.length > 0 &&
            !s.classList.contains(e.params.pagination.bulletClass))
        ) {
          if (
            e.navigation &&
            ((e.navigation.nextEl && s === e.navigation.nextEl) ||
              (e.navigation.prevEl && s === e.navigation.prevEl))
          )
            return;
          const t = n[0].classList.contains(e.params.pagination.hiddenClass);
          a(!0 === t ? "paginationShow" : "paginationHide"),
            n.forEach((t) =>
              t.classList.toggle(e.params.pagination.hiddenClass)
            );
        }
      });
    const m = () => {
      e.el.classList.add(e.params.pagination.paginationDisabledClass);
      let { el: t } = e.pagination;
      t &&
        ((t = o(t)),
        t.forEach((t) =>
          t.classList.add(e.params.pagination.paginationDisabledClass)
        )),
        f();
    };
    Object.assign(e.pagination, {
      enable: () => {
        e.el.classList.remove(e.params.pagination.paginationDisabledClass);
        let { el: t } = e.pagination;
        t &&
          ((t = o(t)),
          t.forEach((t) =>
            t.classList.remove(e.params.pagination.paginationDisabledClass)
          )),
          h(),
          u(),
          d();
      },
      disable: m,
      render: u,
      update: d,
      init: h,
      destroy: f,
    });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    const s = u();
    let n,
      i,
      o,
      l,
      c = !1,
      p = null,
      d = null;
    function h() {
      if (!e.params.scrollbar.el || !e.scrollbar.el) return;
      const { scrollbar: t, rtlTranslate: r } = e,
        { dragEl: a, el: s } = t,
        n = e.params.scrollbar,
        l = e.params.loop ? e.progressLoop : e.progress;
      let c = i,
        d = (o - i) * l;
      r
        ? ((d = -d), d > 0 ? ((c = i - d), (d = 0)) : -d + i > o && (c = o + d))
        : d < 0
        ? ((c = i + d), (d = 0))
        : d + i > o && (c = o - d),
        e.isHorizontal()
          ? ((a.style.transform = `translate3d(${d}px, 0, 0)`),
            (a.style.width = `${c}px`))
          : ((a.style.transform = `translate3d(0px, ${d}px, 0)`),
            (a.style.height = `${c}px`)),
        n.hide &&
          (clearTimeout(p),
          (s.style.opacity = 1),
          (p = setTimeout(() => {
            (s.style.opacity = 0), (s.style.transitionDuration = "400ms");
          }, 1e3)));
    }
    function f() {
      if (!e.params.scrollbar.el || !e.scrollbar.el) return;
      const { scrollbar: t } = e,
        { dragEl: r, el: a } = t;
      (r.style.width = ""),
        (r.style.height = ""),
        (o = e.isHorizontal() ? a.offsetWidth : a.offsetHeight),
        (l =
          e.size /
          (e.virtualSize +
            e.params.slidesOffsetBefore -
            (e.params.centeredSlides ? e.snapGrid[0] : 0))),
        (i =
          "auto" === e.params.scrollbar.dragSize
            ? o * l
            : parseInt(e.params.scrollbar.dragSize, 10)),
        e.isHorizontal()
          ? (r.style.width = `${i}px`)
          : (r.style.height = `${i}px`),
        (a.style.display = l >= 1 ? "none" : ""),
        e.params.scrollbar.hide && (a.style.opacity = 0),
        e.params.watchOverflow &&
          e.enabled &&
          t.el.classList[e.isLocked ? "add" : "remove"](
            e.params.scrollbar.lockClass
          );
    }
    function m(t) {
      return e.isHorizontal() ? t.clientX : t.clientY;
    }
    function g(t) {
      const { scrollbar: r, rtlTranslate: a } = e,
        { el: s } = r;
      let l;
      (l =
        (m(t) -
          ba(s)[e.isHorizontal() ? "left" : "top"] -
          (null !== n ? n : i / 2)) /
        (o - i)),
        (l = Math.max(Math.min(l, 1), 0)),
        a && (l = 1 - l);
      const c = e.minTranslate() + (e.maxTranslate() - e.minTranslate()) * l;
      e.updateProgress(c),
        e.setTranslate(c),
        e.updateActiveIndex(),
        e.updateSlidesClasses();
    }
    function v(t) {
      const r = e.params.scrollbar,
        { scrollbar: s, wrapperEl: i } = e,
        { el: o, dragEl: l } = s;
      (c = !0),
        (n =
          t.target === l
            ? m(t) -
              t.target.getBoundingClientRect()[
                e.isHorizontal() ? "left" : "top"
              ]
            : null),
        t.preventDefault(),
        t.stopPropagation(),
        (i.style.transitionDuration = "100ms"),
        (l.style.transitionDuration = "100ms"),
        g(t),
        clearTimeout(d),
        (o.style.transitionDuration = "0ms"),
        r.hide && (o.style.opacity = 1),
        e.params.cssMode && (e.wrapperEl.style["scroll-snap-type"] = "none"),
        a("scrollbarDragStart", t);
    }
    function b(t) {
      const { scrollbar: r, wrapperEl: s } = e,
        { el: n, dragEl: i } = r;
      c &&
        (t.preventDefault ? t.preventDefault() : (t.returnValue = !1),
        g(t),
        (s.style.transitionDuration = "0ms"),
        (n.style.transitionDuration = "0ms"),
        (i.style.transitionDuration = "0ms"),
        a("scrollbarDragMove", t));
    }
    function w(t) {
      const r = e.params.scrollbar,
        { scrollbar: s, wrapperEl: n } = e,
        { el: i } = s;
      c &&
        ((c = !1),
        e.params.cssMode &&
          ((e.wrapperEl.style["scroll-snap-type"] = ""),
          (n.style.transitionDuration = "")),
        r.hide &&
          (clearTimeout(d),
          (d = la(() => {
            (i.style.opacity = 0), (i.style.transitionDuration = "400ms");
          }, 1e3))),
        a("scrollbarDragEnd", t),
        r.snapOnRelease && e.slideToClosest());
    }
    function y(t) {
      const { scrollbar: r, params: a } = e,
        n = r.el;
      if (!n) return;
      const i = n,
        o = !!a.passiveListeners && { passive: !1, capture: !1 },
        l = !!a.passiveListeners && { passive: !0, capture: !1 };
      if (!i) return;
      const c = "on" === t ? "addEventListener" : "removeEventListener";
      i[c]("pointerdown", v, o),
        s[c]("pointermove", b, o),
        s[c]("pointerup", w, l);
    }
    function E() {
      const { scrollbar: t, el: r } = e;
      e.params.scrollbar = Za(
        e,
        e.originalParams.scrollbar,
        e.params.scrollbar,
        { el: "swiper-scrollbar" }
      );
      const a = e.params.scrollbar;
      if (!a.el) return;
      let n, i;
      "string" == typeof a.el &&
        e.isElement &&
        (n = e.el.shadowRoot.querySelector(a.el)),
        n || "string" != typeof a.el
          ? n || (n = a.el)
          : (n = s.querySelectorAll(a.el)),
        e.params.uniqueNavElements &&
          "string" == typeof a.el &&
          n.length > 1 &&
          1 === r.querySelectorAll(a.el).length &&
          (n = r.querySelector(a.el)),
        n.length > 0 && (n = n[0]),
        n.classList.add(e.isHorizontal() ? a.horizontalClass : a.verticalClass),
        n &&
          ((i = n.querySelector(`.${e.params.scrollbar.dragClass}`)),
          i || ((i = va("div", e.params.scrollbar.dragClass)), n.append(i))),
        Object.assign(t, { el: n, dragEl: i }),
        a.draggable && e.params.scrollbar.el && e.scrollbar.el && y("on"),
        n &&
          n.classList[e.enabled ? "remove" : "add"](
            e.params.scrollbar.lockClass
          );
    }
    function C() {
      const t = e.params.scrollbar,
        r = e.scrollbar.el;
      r &&
        r.classList.remove(
          e.isHorizontal() ? t.horizontalClass : t.verticalClass
        ),
        e.params.scrollbar.el && e.scrollbar.el && y("off");
    }
    t({
      scrollbar: {
        el: null,
        dragSize: "auto",
        hide: !1,
        draggable: !1,
        snapOnRelease: !0,
        lockClass: "swiper-scrollbar-lock",
        dragClass: "swiper-scrollbar-drag",
        scrollbarDisabledClass: "swiper-scrollbar-disabled",
        horizontalClass: "swiper-scrollbar-horizontal",
        verticalClass: "swiper-scrollbar-vertical",
      },
    }),
      (e.scrollbar = { el: null, dragEl: null }),
      r("init", () => {
        !1 === e.params.scrollbar.enabled ? x() : (E(), f(), h());
      }),
      r("update resize observerUpdate lock unlock", () => {
        f();
      }),
      r("setTranslate", () => {
        h();
      }),
      r("setTransition", (t, r) => {
        !(function (t) {
          e.params.scrollbar.el &&
            e.scrollbar.el &&
            (e.scrollbar.dragEl.style.transitionDuration = `${t}ms`);
        })(r);
      }),
      r("enable disable", () => {
        const { el: t } = e.scrollbar;
        t &&
          t.classList[e.enabled ? "remove" : "add"](
            e.params.scrollbar.lockClass
          );
      }),
      r("destroy", () => {
        C();
      });
    const x = () => {
      e.el.classList.add(e.params.scrollbar.scrollbarDisabledClass),
        e.scrollbar.el &&
          e.scrollbar.el.classList.add(
            e.params.scrollbar.scrollbarDisabledClass
          ),
        C();
    };
    Object.assign(e.scrollbar, {
      enable: () => {
        e.el.classList.remove(e.params.scrollbar.scrollbarDisabledClass),
          e.scrollbar.el &&
            e.scrollbar.el.classList.remove(
              e.params.scrollbar.scrollbarDisabledClass
            ),
          E(),
          f(),
          h();
      },
      disable: x,
      updateSize: f,
      setTranslate: h,
      init: E,
      destroy: C,
    });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({ parallax: { enabled: !1 } });
    const a = (t, r) => {
        const { rtl: a } = e,
          s = a ? -1 : 1,
          n = t.getAttribute("data-swiper-parallax") || "0";
        let i = t.getAttribute("data-swiper-parallax-x"),
          o = t.getAttribute("data-swiper-parallax-y");
        const l = t.getAttribute("data-swiper-parallax-scale"),
          c = t.getAttribute("data-swiper-parallax-opacity"),
          p = t.getAttribute("data-swiper-parallax-rotate");
        if (
          (i || o
            ? ((i = i || "0"), (o = o || "0"))
            : e.isHorizontal()
            ? ((i = n), (o = "0"))
            : ((o = n), (i = "0")),
          (i =
            i.indexOf("%") >= 0
              ? parseInt(i, 10) * r * s + "%"
              : i * r * s + "px"),
          (o = o.indexOf("%") >= 0 ? parseInt(o, 10) * r + "%" : o * r + "px"),
          null != c)
        ) {
          const e = c - (c - 1) * (1 - Math.abs(r));
          t.style.opacity = e;
        }
        let d = `translate3d(${i}, ${o}, 0px)`;
        if (null != l) {
          d += ` scale(${l - (l - 1) * (1 - Math.abs(r))})`;
        }
        if (p && null != p) {
          d += ` rotate(${p * r * -1}deg)`;
        }
        t.style.transform = d;
      },
      s = () => {
        const { el: t, slides: r, progress: s, snapGrid: n } = e;
        ga(
          t,
          "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]"
        ).forEach((e) => {
          a(e, s);
        }),
          r.forEach((t, r) => {
            let i = t.progress;
            e.params.slidesPerGroup > 1 &&
              "auto" !== e.params.slidesPerView &&
              (i += Math.ceil(r / 2) - s * (n.length - 1)),
              (i = Math.min(Math.max(i, -1), 1)),
              t
                .querySelectorAll(
                  "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale], [data-swiper-parallax-rotate]"
                )
                .forEach((e) => {
                  a(e, i);
                });
          });
      };
    r("beforeInit", () => {
      e.params.parallax.enabled &&
        ((e.params.watchSlidesProgress = !0),
        (e.originalParams.watchSlidesProgress = !0));
    }),
      r("init", () => {
        e.params.parallax.enabled && s();
      }),
      r("setTranslate", () => {
        e.params.parallax.enabled && s();
      }),
      r("setTransition", (t, r) => {
        e.params.parallax.enabled &&
          ((t = e.params.speed) => {
            const { el: r } = e;
            r.querySelectorAll(
              "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]"
            ).forEach((e) => {
              let r =
                parseInt(e.getAttribute("data-swiper-parallax-duration"), 10) ||
                t;
              0 === t && (r = 0), (e.style.transitionDuration = `${r}ms`);
            });
          })(r);
      });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a }) {
    const s = f();
    t({
      zoom: {
        enabled: !1,
        maxRatio: 3,
        minRatio: 1,
        toggle: !0,
        containerClass: "swiper-zoom-container",
        zoomedSlideClass: "swiper-slide-zoomed",
      },
    }),
      (e.zoom = { enabled: !1 });
    let n,
      i,
      o = 1,
      l = !1;
    const c = [],
      p = {
        originX: 0,
        originY: 0,
        slideEl: void 0,
        slideWidth: void 0,
        slideHeight: void 0,
        imageEl: void 0,
        imageWrapEl: void 0,
        maxRatio: 3,
      },
      d = {
        isTouched: void 0,
        isMoved: void 0,
        currentX: void 0,
        currentY: void 0,
        minX: void 0,
        minY: void 0,
        maxX: void 0,
        maxY: void 0,
        width: void 0,
        height: void 0,
        startX: void 0,
        startY: void 0,
        touchesStart: {},
        touchesCurrent: {},
      },
      u = {
        x: void 0,
        y: void 0,
        prevPositionX: void 0,
        prevPositionY: void 0,
        prevTime: void 0,
      };
    let h = 1;
    function m() {
      if (c.length < 2) return 1;
      const e = c[0].pageX,
        t = c[0].pageY,
        r = c[1].pageX,
        a = c[1].pageY;
      return Math.sqrt((r - e) ** 2 + (a - t) ** 2);
    }
    function g(t) {
      const r = e.isElement ? "swiper-slide" : `.${e.params.slideClass}`;
      return (
        !!t.target.matches(r) ||
        e.slides.filter((e) => e.contains(t.target)).length > 0
      );
    }
    function v(t) {
      if (("mouse" === t.pointerType && c.splice(0, c.length), !g(t))) return;
      const r = e.params.zoom;
      if (((n = !1), (i = !1), c.push(t), !(c.length < 2))) {
        if (((n = !0), (p.scaleStart = m()), !p.slideEl)) {
          (p.slideEl = t.target.closest(
            `.${e.params.slideClass}, swiper-slide`
          )),
            p.slideEl || (p.slideEl = e.slides[e.activeIndex]);
          let a = p.slideEl.querySelector(`.${r.containerClass}`);
          if (
            (a &&
              (a = a.querySelectorAll(
                "picture, img, svg, canvas, .swiper-zoom-target"
              )[0]),
            (p.imageEl = a),
            (p.imageWrapEl = a
              ? Ea(p.imageEl, `.${r.containerClass}`)[0]
              : void 0),
            !p.imageWrapEl)
          )
            return void (p.imageEl = void 0);
          p.maxRatio =
            p.imageWrapEl.getAttribute("data-swiper-zoom") || r.maxRatio;
        }
        if (p.imageEl) {
          const [e, t] = (function () {
            if (c.length < 2) return { x: null, y: null };
            const e = p.imageEl.getBoundingClientRect();
            return [
              (c[0].pageX + (c[1].pageX - c[0].pageX) / 2 - e.x) / o,
              (c[0].pageY + (c[1].pageY - c[0].pageY) / 2 - e.y) / o,
            ];
          })();
          (p.originX = e),
            (p.originY = t),
            (p.imageEl.style.transitionDuration = "0ms");
        }
        l = !0;
      }
    }
    function b(t) {
      if (!g(t)) return;
      const r = e.params.zoom,
        a = e.zoom,
        s = c.findIndex((e) => e.pointerId === t.pointerId);
      s >= 0 && (c[s] = t),
        c.length < 2 ||
          ((i = !0),
          (p.scaleMove = m()),
          p.imageEl &&
            ((a.scale = (p.scaleMove / p.scaleStart) * o),
            a.scale > p.maxRatio &&
              (a.scale = p.maxRatio - 1 + (a.scale - p.maxRatio + 1) ** 0.5),
            a.scale < r.minRatio &&
              (a.scale = r.minRatio + 1 - (r.minRatio - a.scale + 1) ** 0.5),
            (p.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`)));
    }
    function w(t) {
      if (!g(t)) return;
      if ("mouse" === t.pointerType && "pointerout" === t.type) return;
      const r = e.params.zoom,
        a = e.zoom,
        s = c.findIndex((e) => e.pointerId === t.pointerId);
      s >= 0 && c.splice(s, 1),
        n &&
          i &&
          ((n = !1),
          (i = !1),
          p.imageEl &&
            ((a.scale = Math.max(Math.min(a.scale, p.maxRatio), r.minRatio)),
            (p.imageEl.style.transitionDuration = `${e.params.speed}ms`),
            (p.imageEl.style.transform = `translate3d(0,0,0) scale(${a.scale})`),
            (o = a.scale),
            (l = !1),
            a.scale > 1 && p.slideEl
              ? p.slideEl.classList.add(`${r.zoomedSlideClass}`)
              : a.scale <= 1 &&
                p.slideEl &&
                p.slideEl.classList.remove(`${r.zoomedSlideClass}`),
            1 === a.scale &&
              ((p.originX = 0), (p.originY = 0), (p.slideEl = void 0))));
    }
    function y(t) {
      if (
        !g(t) ||
        !(function (t) {
          const r = `.${e.params.zoom.containerClass}`;
          return (
            !!t.target.matches(r) ||
            [...e.el.querySelectorAll(r)].filter((e) => e.contains(t.target))
              .length > 0
          );
        })(t)
      )
        return;
      const r = e.zoom;
      if (!p.imageEl) return;
      if (!d.isTouched || !p.slideEl) return;
      d.isMoved ||
        ((d.width = p.imageEl.offsetWidth),
        (d.height = p.imageEl.offsetHeight),
        (d.startX = pa(p.imageWrapEl, "x") || 0),
        (d.startY = pa(p.imageWrapEl, "y") || 0),
        (p.slideWidth = p.slideEl.offsetWidth),
        (p.slideHeight = p.slideEl.offsetHeight),
        (p.imageWrapEl.style.transitionDuration = "0ms"));
      const a = d.width * r.scale,
        s = d.height * r.scale;
      if (a < p.slideWidth && s < p.slideHeight) return;
      (d.minX = Math.min(p.slideWidth / 2 - a / 2, 0)),
        (d.maxX = -d.minX),
        (d.minY = Math.min(p.slideHeight / 2 - s / 2, 0)),
        (d.maxY = -d.minY),
        (d.touchesCurrent.x = c.length > 0 ? c[0].pageX : t.pageX),
        (d.touchesCurrent.y = c.length > 0 ? c[0].pageY : t.pageY);
      if (
        (Math.max(
          Math.abs(d.touchesCurrent.x - d.touchesStart.x),
          Math.abs(d.touchesCurrent.y - d.touchesStart.y)
        ) > 5 && (e.allowClick = !1),
        !d.isMoved && !l)
      ) {
        if (
          e.isHorizontal() &&
          ((Math.floor(d.minX) === Math.floor(d.startX) &&
            d.touchesCurrent.x < d.touchesStart.x) ||
            (Math.floor(d.maxX) === Math.floor(d.startX) &&
              d.touchesCurrent.x > d.touchesStart.x))
        )
          return void (d.isTouched = !1);
        if (
          !e.isHorizontal() &&
          ((Math.floor(d.minY) === Math.floor(d.startY) &&
            d.touchesCurrent.y < d.touchesStart.y) ||
            (Math.floor(d.maxY) === Math.floor(d.startY) &&
              d.touchesCurrent.y > d.touchesStart.y))
        )
          return void (d.isTouched = !1);
      }
      t.cancelable && t.preventDefault(), t.stopPropagation(), (d.isMoved = !0);
      const n = (r.scale - o) / (p.maxRatio - e.params.zoom.minRatio),
        { originX: i, originY: h } = p;
      (d.currentX =
        d.touchesCurrent.x -
        d.touchesStart.x +
        d.startX +
        n * (d.width - 2 * i)),
        (d.currentY =
          d.touchesCurrent.y -
          d.touchesStart.y +
          d.startY +
          n * (d.height - 2 * h)),
        d.currentX < d.minX &&
          (d.currentX = d.minX + 1 - (d.minX - d.currentX + 1) ** 0.8),
        d.currentX > d.maxX &&
          (d.currentX = d.maxX - 1 + (d.currentX - d.maxX + 1) ** 0.8),
        d.currentY < d.minY &&
          (d.currentY = d.minY + 1 - (d.minY - d.currentY + 1) ** 0.8),
        d.currentY > d.maxY &&
          (d.currentY = d.maxY - 1 + (d.currentY - d.maxY + 1) ** 0.8),
        u.prevPositionX || (u.prevPositionX = d.touchesCurrent.x),
        u.prevPositionY || (u.prevPositionY = d.touchesCurrent.y),
        u.prevTime || (u.prevTime = Date.now()),
        (u.x =
          (d.touchesCurrent.x - u.prevPositionX) /
          (Date.now() - u.prevTime) /
          2),
        (u.y =
          (d.touchesCurrent.y - u.prevPositionY) /
          (Date.now() - u.prevTime) /
          2),
        Math.abs(d.touchesCurrent.x - u.prevPositionX) < 2 && (u.x = 0),
        Math.abs(d.touchesCurrent.y - u.prevPositionY) < 2 && (u.y = 0),
        (u.prevPositionX = d.touchesCurrent.x),
        (u.prevPositionY = d.touchesCurrent.y),
        (u.prevTime = Date.now()),
        (p.imageWrapEl.style.transform = `translate3d(${d.currentX}px, ${d.currentY}px,0)`);
    }
    function E() {
      const t = e.zoom;
      p.slideEl &&
        e.activeIndex !== e.slides.indexOf(p.slideEl) &&
        (p.imageEl &&
          (p.imageEl.style.transform = "translate3d(0,0,0) scale(1)"),
        p.imageWrapEl && (p.imageWrapEl.style.transform = "translate3d(0,0,0)"),
        p.slideEl.classList.remove(`${e.params.zoom.zoomedSlideClass}`),
        (t.scale = 1),
        (o = 1),
        (p.slideEl = void 0),
        (p.imageEl = void 0),
        (p.imageWrapEl = void 0),
        (p.originX = 0),
        (p.originY = 0));
    }
    function C(t) {
      const r = e.zoom,
        a = e.params.zoom;
      if (!p.slideEl) {
        t &&
          t.target &&
          (p.slideEl = t.target.closest(
            `.${e.params.slideClass}, swiper-slide`
          )),
          p.slideEl ||
            (e.params.virtual && e.params.virtual.enabled && e.virtual
              ? (p.slideEl = ga(e.slidesEl, `.${e.params.slideActiveClass}`)[0])
              : (p.slideEl = e.slides[e.activeIndex]));
        let r = p.slideEl.querySelector(`.${a.containerClass}`);
        r &&
          (r = r.querySelectorAll(
            "picture, img, svg, canvas, .swiper-zoom-target"
          )[0]),
          (p.imageEl = r),
          (p.imageWrapEl = r
            ? Ea(p.imageEl, `.${a.containerClass}`)[0]
            : void 0);
      }
      if (!p.imageEl || !p.imageWrapEl) return;
      let n, i, l, c, u, h, f, m, g, v, b, w, y, E, C, x, S, k;
      e.params.cssMode &&
        ((e.wrapperEl.style.overflow = "hidden"),
        (e.wrapperEl.style.touchAction = "none")),
        p.slideEl.classList.add(`${a.zoomedSlideClass}`),
        void 0 === d.touchesStart.x && t
          ? ((n = t.pageX), (i = t.pageY))
          : ((n = d.touchesStart.x), (i = d.touchesStart.y));
      const T = "number" == typeof t ? t : null;
      1 === o && T && ((n = void 0), (i = void 0)),
        (r.scale =
          T || p.imageWrapEl.getAttribute("data-swiper-zoom") || a.maxRatio),
        (o = T || p.imageWrapEl.getAttribute("data-swiper-zoom") || a.maxRatio),
        !t || (1 === o && T)
          ? ((f = 0), (m = 0))
          : ((S = p.slideEl.offsetWidth),
            (k = p.slideEl.offsetHeight),
            (l = ba(p.slideEl).left + s.scrollX),
            (c = ba(p.slideEl).top + s.scrollY),
            (u = l + S / 2 - n),
            (h = c + k / 2 - i),
            (g = p.imageEl.offsetWidth),
            (v = p.imageEl.offsetHeight),
            (b = g * r.scale),
            (w = v * r.scale),
            (y = Math.min(S / 2 - b / 2, 0)),
            (E = Math.min(k / 2 - w / 2, 0)),
            (C = -y),
            (x = -E),
            (f = u * r.scale),
            (m = h * r.scale),
            f < y && (f = y),
            f > C && (f = C),
            m < E && (m = E),
            m > x && (m = x)),
        T && 1 === r.scale && ((p.originX = 0), (p.originY = 0)),
        (p.imageWrapEl.style.transitionDuration = "300ms"),
        (p.imageWrapEl.style.transform = `translate3d(${f}px, ${m}px,0)`),
        (p.imageEl.style.transitionDuration = "300ms"),
        (p.imageEl.style.transform = `translate3d(0,0,0) scale(${r.scale})`);
    }
    function x() {
      const t = e.zoom,
        r = e.params.zoom;
      if (!p.slideEl) {
        e.params.virtual && e.params.virtual.enabled && e.virtual
          ? (p.slideEl = ga(e.slidesEl, `.${e.params.slideActiveClass}`)[0])
          : (p.slideEl = e.slides[e.activeIndex]);
        let t = p.slideEl.querySelector(`.${r.containerClass}`);
        t &&
          (t = t.querySelectorAll(
            "picture, img, svg, canvas, .swiper-zoom-target"
          )[0]),
          (p.imageEl = t),
          (p.imageWrapEl = t
            ? Ea(p.imageEl, `.${r.containerClass}`)[0]
            : void 0);
      }
      p.imageEl &&
        p.imageWrapEl &&
        (e.params.cssMode &&
          ((e.wrapperEl.style.overflow = ""),
          (e.wrapperEl.style.touchAction = "")),
        (t.scale = 1),
        (o = 1),
        (p.imageWrapEl.style.transitionDuration = "300ms"),
        (p.imageWrapEl.style.transform = "translate3d(0,0,0)"),
        (p.imageEl.style.transitionDuration = "300ms"),
        (p.imageEl.style.transform = "translate3d(0,0,0) scale(1)"),
        p.slideEl.classList.remove(`${r.zoomedSlideClass}`),
        (p.slideEl = void 0),
        (p.originX = 0),
        (p.originY = 0));
    }
    function S(t) {
      const r = e.zoom;
      r.scale && 1 !== r.scale ? x() : C(t);
    }
    function k() {
      return {
        passiveListener: !!e.params.passiveListeners && {
          passive: !0,
          capture: !1,
        },
        activeListenerWithCapture: !e.params.passiveListeners || {
          passive: !1,
          capture: !0,
        },
      };
    }
    function T() {
      const t = e.zoom;
      if (t.enabled) return;
      t.enabled = !0;
      const { passiveListener: r, activeListenerWithCapture: a } = k();
      e.wrapperEl.addEventListener("pointerdown", v, r),
        e.wrapperEl.addEventListener("pointermove", b, a),
        ["pointerup", "pointercancel", "pointerout"].forEach((t) => {
          e.wrapperEl.addEventListener(t, w, r);
        }),
        e.wrapperEl.addEventListener("pointermove", y, a);
    }
    function M() {
      const t = e.zoom;
      if (!t.enabled) return;
      t.enabled = !1;
      const { passiveListener: r, activeListenerWithCapture: a } = k();
      e.wrapperEl.removeEventListener("pointerdown", v, r),
        e.wrapperEl.removeEventListener("pointermove", b, a),
        ["pointerup", "pointercancel", "pointerout"].forEach((t) => {
          e.wrapperEl.removeEventListener(t, w, r);
        }),
        e.wrapperEl.removeEventListener("pointermove", y, a);
    }
    Object.defineProperty(e.zoom, "scale", {
      get: () => h,
      set(e) {
        if (h !== e) {
          const t = p.imageEl,
            r = p.slideEl;
          a("zoomChange", e, t, r);
        }
        h = e;
      },
    }),
      r("init", () => {
        e.params.zoom.enabled && T();
      }),
      r("destroy", () => {
        M();
      }),
      r("touchStart", (t, r) => {
        e.zoom.enabled &&
          (function (t) {
            const r = e.device;
            if (!p.imageEl) return;
            if (d.isTouched) return;
            r.android && t.cancelable && t.preventDefault(), (d.isTouched = !0);
            const a = c.length > 0 ? c[0] : t;
            (d.touchesStart.x = a.pageX), (d.touchesStart.y = a.pageY);
          })(r);
      }),
      r("touchEnd", (t, r) => {
        e.zoom.enabled &&
          (function () {
            const t = e.zoom;
            if (!p.imageEl) return;
            if (!d.isTouched || !d.isMoved)
              return (d.isTouched = !1), void (d.isMoved = !1);
            (d.isTouched = !1), (d.isMoved = !1);
            let r = 300,
              a = 300;
            const s = u.x * r,
              n = d.currentX + s,
              i = u.y * a,
              o = d.currentY + i;
            0 !== u.x && (r = Math.abs((n - d.currentX) / u.x)),
              0 !== u.y && (a = Math.abs((o - d.currentY) / u.y));
            const l = Math.max(r, a);
            (d.currentX = n), (d.currentY = o);
            const c = d.width * t.scale,
              h = d.height * t.scale;
            (d.minX = Math.min(p.slideWidth / 2 - c / 2, 0)),
              (d.maxX = -d.minX),
              (d.minY = Math.min(p.slideHeight / 2 - h / 2, 0)),
              (d.maxY = -d.minY),
              (d.currentX = Math.max(Math.min(d.currentX, d.maxX), d.minX)),
              (d.currentY = Math.max(Math.min(d.currentY, d.maxY), d.minY)),
              (p.imageWrapEl.style.transitionDuration = `${l}ms`),
              (p.imageWrapEl.style.transform = `translate3d(${d.currentX}px, ${d.currentY}px,0)`);
          })();
      }),
      r("doubleTap", (t, r) => {
        !e.animating &&
          e.params.zoom.enabled &&
          e.zoom.enabled &&
          e.params.zoom.toggle &&
          S(r);
      }),
      r("transitionEnd", () => {
        e.zoom.enabled && e.params.zoom.enabled && E();
      }),
      r("slideChange", () => {
        e.zoom.enabled && e.params.zoom.enabled && e.params.cssMode && E();
      }),
      Object.assign(e.zoom, {
        enable: T,
        disable: M,
        in: C,
        out: x,
        toggle: S,
      });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    function a(e, t) {
      const r = (function () {
        let e, t, r;
        return (a, s) => {
          for (t = -1, e = a.length; e - t > 1; )
            (r = (e + t) >> 1), a[r] <= s ? (t = r) : (e = r);
          return e;
        };
      })();
      let a, s;
      return (
        (this.x = e),
        (this.y = t),
        (this.lastIndex = e.length - 1),
        (this.interpolate = function (e) {
          return e
            ? ((s = r(this.x, e)),
              (a = s - 1),
              ((e - this.x[a]) * (this.y[s] - this.y[a])) /
                (this.x[s] - this.x[a]) +
                this.y[a])
            : 0;
        }),
        this
      );
    }
    function s() {
      e.controller.control &&
        e.controller.spline &&
        ((e.controller.spline = void 0), delete e.controller.spline);
    }
    t({ controller: { control: void 0, inverse: !1, by: "slide" } }),
      (e.controller = { control: void 0 }),
      r("beforeInit", () => {
        if (
          "undefined" != typeof window &&
          ("string" == typeof e.params.controller.control ||
            e.params.controller.control instanceof HTMLElement)
        ) {
          const t = document.querySelector(e.params.controller.control);
          if (t && t.swiper) e.controller.control = t.swiper;
          else if (t) {
            const r = (a) => {
              (e.controller.control = a.detail[0]),
                e.update(),
                t.removeEventListener("init", r);
            };
            t.addEventListener("init", r);
          }
        } else e.controller.control = e.params.controller.control;
      }),
      r("update", () => {
        s();
      }),
      r("resize", () => {
        s();
      }),
      r("observerUpdate", () => {
        s();
      }),
      r("setTranslate", (t, r, a) => {
        e.controller.control && e.controller.setTranslate(r, a);
      }),
      r("setTransition", (t, r, a) => {
        e.controller.control && e.controller.setTransition(r, a);
      }),
      Object.assign(e.controller, {
        setTranslate: function (t, r) {
          const s = e.controller.control;
          let n, i;
          const o = e.constructor;
          function l(t) {
            if (t.destroyed) return;
            const r = e.rtlTranslate ? -e.translate : e.translate;
            "slide" === e.params.controller.by &&
              (!(function (t) {
                e.controller.spline ||
                  (e.controller.spline = e.params.loop
                    ? new a(e.slidesGrid, t.slidesGrid)
                    : new a(e.snapGrid, t.snapGrid));
              })(t),
              (i = -e.controller.spline.interpolate(-r))),
              (i && "container" !== e.params.controller.by) ||
                ((n =
                  (t.maxTranslate() - t.minTranslate()) /
                  (e.maxTranslate() - e.minTranslate())),
                (i = (r - e.minTranslate()) * n + t.minTranslate())),
              e.params.controller.inverse && (i = t.maxTranslate() - i),
              t.updateProgress(i),
              t.setTranslate(i, e),
              t.updateActiveIndex(),
              t.updateSlidesClasses();
          }
          if (Array.isArray(s))
            for (let e = 0; e < s.length; e += 1)
              s[e] !== r && s[e] instanceof o && l(s[e]);
          else s instanceof o && r !== s && l(s);
        },
        setTransition: function (t, r) {
          const a = e.constructor,
            s = e.controller.control;
          let n;
          function i(r) {
            r.destroyed ||
              (r.setTransition(t, e),
              0 !== t &&
                (r.transitionStart(),
                r.params.autoHeight &&
                  la(() => {
                    r.updateAutoHeight();
                  }),
                Ca(r.wrapperEl, () => {
                  s && r.transitionEnd();
                })));
          }
          if (Array.isArray(s))
            for (n = 0; n < s.length; n += 1)
              s[n] !== r && s[n] instanceof a && i(s[n]);
          else s instanceof a && r !== s && i(s);
        },
      });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      a11y: {
        enabled: !0,
        notificationClass: "swiper-notification",
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
        paginationBulletMessage: "Go to slide {{index}}",
        slideLabelMessage: "{{index}} / {{slidesLength}}",
        containerMessage: null,
        containerRoleDescriptionMessage: null,
        itemRoleDescriptionMessage: null,
        slideRole: "group",
        id: null,
      },
    }),
      (e.a11y = { clicked: !1 });
    let a = null;
    function s(e) {
      const t = a;
      0 !== t.length && ((t.innerHTML = ""), (t.innerHTML = e));
    }
    const n = (e) => (Array.isArray(e) || (e = [e].filter((e) => !!e)), e);
    function i(e) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("tabIndex", "0");
      });
    }
    function o(e) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("tabIndex", "-1");
      });
    }
    function l(e, t) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("role", t);
      });
    }
    function c(e, t) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("aria-roledescription", t);
      });
    }
    function p(e, t) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("aria-label", t);
      });
    }
    function d(e) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("aria-disabled", !0);
      });
    }
    function u(e) {
      (e = n(e)).forEach((e) => {
        e.setAttribute("aria-disabled", !1);
      });
    }
    function h(t) {
      if (13 !== t.keyCode && 32 !== t.keyCode) return;
      const r = e.params.a11y,
        a = t.target;
      (e.pagination &&
        e.pagination.el &&
        (a === e.pagination.el || e.pagination.el.contains(t.target)) &&
        !t.target.matches(Ja(e.params.pagination.bulletClass))) ||
        (e.navigation &&
          e.navigation.nextEl &&
          a === e.navigation.nextEl &&
          ((e.isEnd && !e.params.loop) || e.slideNext(),
          e.isEnd ? s(r.lastSlideMessage) : s(r.nextSlideMessage)),
        e.navigation &&
          e.navigation.prevEl &&
          a === e.navigation.prevEl &&
          ((e.isBeginning && !e.params.loop) || e.slidePrev(),
          e.isBeginning ? s(r.firstSlideMessage) : s(r.prevSlideMessage)),
        e.pagination &&
          a.matches(Ja(e.params.pagination.bulletClass)) &&
          a.click());
    }
    function f() {
      return (
        e.pagination && e.pagination.bullets && e.pagination.bullets.length
      );
    }
    function m() {
      return f() && e.params.pagination.clickable;
    }
    const g = (e, t, r) => {
        i(e),
          "BUTTON" !== e.tagName &&
            (l(e, "button"), e.addEventListener("keydown", h)),
          p(e, r),
          (function (e, t) {
            (e = n(e)).forEach((e) => {
              e.setAttribute("aria-controls", t);
            });
          })(e, t);
      },
      v = () => {
        e.a11y.clicked = !0;
      },
      b = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            e.destroyed || (e.a11y.clicked = !1);
          });
        });
      },
      w = (t) => {
        if (e.a11y.clicked) return;
        const r = t.target.closest(`.${e.params.slideClass}, swiper-slide`);
        if (!r || !e.slides.includes(r)) return;
        const a = e.slides.indexOf(r) === e.activeIndex,
          s =
            e.params.watchSlidesProgress &&
            e.visibleSlides &&
            e.visibleSlides.includes(r);
        a ||
          s ||
          (t.sourceCapabilities && t.sourceCapabilities.firesTouchEvents) ||
          (e.isHorizontal() ? (e.el.scrollLeft = 0) : (e.el.scrollTop = 0),
          e.slideTo(e.slides.indexOf(r), 0));
      },
      y = () => {
        const t = e.params.a11y;
        t.itemRoleDescriptionMessage &&
          c(e.slides, t.itemRoleDescriptionMessage),
          t.slideRole && l(e.slides, t.slideRole);
        const r = e.slides.length;
        t.slideLabelMessage &&
          e.slides.forEach((a, s) => {
            const n = e.params.loop
              ? parseInt(a.getAttribute("data-swiper-slide-index"), 10)
              : s;
            p(
              a,
              t.slideLabelMessage
                .replace(/\{\{index\}\}/, n + 1)
                .replace(/\{\{slidesLength\}\}/, r)
            );
          });
      },
      E = () => {
        const t = e.params.a11y;
        e.el.append(a);
        const r = e.el;
        t.containerRoleDescriptionMessage &&
          c(r, t.containerRoleDescriptionMessage),
          t.containerMessage && p(r, t.containerMessage);
        const s = e.wrapperEl,
          i =
            t.id ||
            s.getAttribute("id") ||
            `swiper-wrapper-${(function (e = 16) {
              return "x"
                .repeat(e)
                .replace(/x/g, () =>
                  Math.round(16 * Math.random()).toString(16)
                );
            })(16)}`,
          o = e.params.autoplay && e.params.autoplay.enabled ? "off" : "polite";
        var l;
        (l = i),
          n(s).forEach((e) => {
            e.setAttribute("id", l);
          }),
          (function (e, t) {
            (e = n(e)).forEach((e) => {
              e.setAttribute("aria-live", t);
            });
          })(s, o),
          y();
        let { nextEl: d, prevEl: u } = e.navigation ? e.navigation : {};
        if (
          ((d = n(d)),
          (u = n(u)),
          d && d.forEach((e) => g(e, i, t.nextSlideMessage)),
          u && u.forEach((e) => g(e, i, t.prevSlideMessage)),
          m())
        ) {
          (Array.isArray(e.pagination.el)
            ? e.pagination.el
            : [e.pagination.el]
          ).forEach((e) => {
            e.addEventListener("keydown", h);
          });
        }
        e.el.addEventListener("focus", w, !0),
          e.el.addEventListener("pointerdown", v, !0),
          e.el.addEventListener("pointerup", b, !0);
      };
    r("beforeInit", () => {
      (a = va("span", e.params.a11y.notificationClass)),
        a.setAttribute("aria-live", "assertive"),
        a.setAttribute("aria-atomic", "true"),
        e.isElement && a.setAttribute("slot", "container-end");
    }),
      r("afterInit", () => {
        e.params.a11y.enabled && E();
      }),
      r(
        "slidesLengthChange snapGridLengthChange slidesGridLengthChange",
        () => {
          e.params.a11y.enabled && y();
        }
      ),
      r("fromEdge toEdge afterInit lock unlock", () => {
        e.params.a11y.enabled &&
          (function () {
            if (e.params.loop || e.params.rewind || !e.navigation) return;
            const { nextEl: t, prevEl: r } = e.navigation;
            r && (e.isBeginning ? (d(r), o(r)) : (u(r), i(r))),
              t && (e.isEnd ? (d(t), o(t)) : (u(t), i(t)));
          })();
      }),
      r("paginationUpdate", () => {
        e.params.a11y.enabled &&
          (function () {
            const t = e.params.a11y;
            f() &&
              e.pagination.bullets.forEach((r) => {
                e.params.pagination.clickable &&
                  (i(r),
                  e.params.pagination.renderBullet ||
                    (l(r, "button"),
                    p(
                      r,
                      t.paginationBulletMessage.replace(
                        /\{\{index\}\}/,
                        ya(r) + 1
                      )
                    ))),
                  r.matches(Ja(e.params.pagination.bulletActiveClass))
                    ? r.setAttribute("aria-current", "true")
                    : r.removeAttribute("aria-current");
              });
          })();
      }),
      r("destroy", () => {
        e.params.a11y.enabled &&
          (function () {
            a && a.length > 0 && a.remove();
            let { nextEl: t, prevEl: r } = e.navigation ? e.navigation : {};
            (t = n(t)),
              (r = n(r)),
              t && t.forEach((e) => e.removeEventListener("keydown", h)),
              r && r.forEach((e) => e.removeEventListener("keydown", h)),
              m() &&
                (Array.isArray(e.pagination.el)
                  ? e.pagination.el
                  : [e.pagination.el]
                ).forEach((e) => {
                  e.removeEventListener("keydown", h);
                });
            e.el.removeEventListener("focus", w, !0),
              e.el.removeEventListener("pointerdown", v, !0),
              e.el.removeEventListener("pointerup", b, !0);
          })();
      });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      history: {
        enabled: !1,
        root: "",
        replaceState: !1,
        key: "slides",
        keepQuery: !1,
      },
    });
    let a = !1,
      s = {};
    const n = (e) =>
        e
          .toString()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/--+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, ""),
      i = (e) => {
        const t = f();
        let r;
        r = e ? new URL(e) : t.location;
        const a = r.pathname
            .slice(1)
            .split("/")
            .filter((e) => "" !== e),
          s = a.length;
        return { key: a[s - 2], value: a[s - 1] };
      },
      o = (t, r) => {
        const s = f();
        if (!a || !e.params.history.enabled) return;
        let i;
        i = e.params.url ? new URL(e.params.url) : s.location;
        const o = e.slides[r];
        let l = n(o.getAttribute("data-history"));
        if (e.params.history.root.length > 0) {
          let r = e.params.history.root;
          "/" === r[r.length - 1] && (r = r.slice(0, r.length - 1)),
            (l = `${r}/${t ? `${t}/` : ""}${l}`);
        } else i.pathname.includes(t) || (l = `${t ? `${t}/` : ""}${l}`);
        e.params.history.keepQuery && (l += i.search);
        const c = s.history.state;
        (c && c.value === l) ||
          (e.params.history.replaceState
            ? s.history.replaceState({ value: l }, null, l)
            : s.history.pushState({ value: l }, null, l));
      },
      l = (t, r, a) => {
        if (r)
          for (let s = 0, i = e.slides.length; s < i; s += 1) {
            const i = e.slides[s];
            if (n(i.getAttribute("data-history")) === r) {
              const r = e.getSlideIndex(i);
              e.slideTo(r, t, a);
            }
          }
        else e.slideTo(0, t, a);
      },
      c = () => {
        (s = i(e.params.url)), l(e.params.speed, s.value, !1);
      };
    r("init", () => {
      e.params.history.enabled &&
        (() => {
          const t = f();
          if (e.params.history) {
            if (!t.history || !t.history.pushState)
              return (
                (e.params.history.enabled = !1),
                void (e.params.hashNavigation.enabled = !0)
              );
            (a = !0),
              (s = i(e.params.url)),
              s.key || s.value
                ? (l(0, s.value, e.params.runCallbacksOnInit),
                  e.params.history.replaceState ||
                    t.addEventListener("popstate", c))
                : e.params.history.replaceState ||
                  t.addEventListener("popstate", c);
          }
        })();
    }),
      r("destroy", () => {
        e.params.history.enabled &&
          (() => {
            const t = f();
            e.params.history.replaceState ||
              t.removeEventListener("popstate", c);
          })();
      }),
      r("transitionEnd _freeModeNoMomentumRelease", () => {
        a && o(e.params.history.key, e.activeIndex);
      }),
      r("slideChange", () => {
        a && e.params.cssMode && o(e.params.history.key, e.activeIndex);
      });
  },
  function ({ swiper: e, extendParams: t, emit: r, on: a }) {
    let s = !1;
    const n = u(),
      i = f();
    t({ hashNavigation: { enabled: !1, replaceState: !1, watchState: !1 } });
    const o = () => {
        r("hashChange");
        const t = n.location.hash.replace("#", "");
        if (t !== e.slides[e.activeIndex].getAttribute("data-hash")) {
          const r = e.getSlideIndex(
            ga(
              e.slidesEl,
              `.${e.params.slideClass}[data-hash="${t}"], swiper-slide[data-hash="${t}"]`
            )[0]
          );
          if (void 0 === r) return;
          e.slideTo(r);
        }
      },
      l = () => {
        if (s && e.params.hashNavigation.enabled)
          if (
            e.params.hashNavigation.replaceState &&
            i.history &&
            i.history.replaceState
          )
            i.history.replaceState(
              null,
              null,
              `#${e.slides[e.activeIndex].getAttribute("data-hash")}` || ""
            ),
              r("hashSet");
          else {
            const t = e.slides[e.activeIndex],
              a = t.getAttribute("data-hash") || t.getAttribute("data-history");
            (n.location.hash = a || ""), r("hashSet");
          }
      };
    a("init", () => {
      e.params.hashNavigation.enabled &&
        (() => {
          if (
            !e.params.hashNavigation.enabled ||
            (e.params.history && e.params.history.enabled)
          )
            return;
          s = !0;
          const t = n.location.hash.replace("#", "");
          if (t) {
            const r = 0;
            for (let a = 0, s = e.slides.length; a < s; a += 1) {
              const s = e.slides[a];
              if (
                (s.getAttribute("data-hash") ||
                  s.getAttribute("data-history")) === t
              ) {
                const t = e.getSlideIndex(s);
                e.slideTo(t, r, e.params.runCallbacksOnInit, !0);
              }
            }
          }
          e.params.hashNavigation.watchState &&
            i.addEventListener("hashchange", o);
        })();
    }),
      a("destroy", () => {
        e.params.hashNavigation.enabled &&
          e.params.hashNavigation.watchState &&
          i.removeEventListener("hashchange", o);
      }),
      a("transitionEnd _freeModeNoMomentumRelease", () => {
        s && l();
      }),
      a("slideChange", () => {
        s && e.params.cssMode && l();
      });
  },
  function ({ swiper: e, extendParams: t, on: r, emit: a, params: s }) {
    let n, i;
    (e.autoplay = { running: !1, paused: !1, timeLeft: 0 }),
      t({
        autoplay: {
          enabled: !1,
          delay: 3e3,
          waitForTransition: !0,
          disableOnInteraction: !0,
          stopOnLastSlide: !1,
          reverseDirection: !1,
          pauseOnMouseEnter: !1,
        },
      });
    let o,
      l,
      c,
      p,
      d,
      h,
      f,
      m = s && s.autoplay ? s.autoplay.delay : 3e3,
      g = s && s.autoplay ? s.autoplay.delay : 3e3,
      v = new Date().getTime;
    function b(t) {
      e &&
        !e.destroyed &&
        e.wrapperEl &&
        t.target === e.wrapperEl &&
        (e.wrapperEl.removeEventListener("transitionend", b), S());
    }
    const w = () => {
        if (e.destroyed || !e.autoplay.running) return;
        e.autoplay.paused ? (l = !0) : l && ((g = o), (l = !1));
        const t = e.autoplay.paused ? o : v + g - new Date().getTime();
        (e.autoplay.timeLeft = t),
          a("autoplayTimeLeft", t, t / m),
          (i = requestAnimationFrame(() => {
            w();
          }));
      },
      y = (t) => {
        if (e.destroyed || !e.autoplay.running) return;
        cancelAnimationFrame(i), w();
        let r = void 0 === t ? e.params.autoplay.delay : t;
        (m = e.params.autoplay.delay), (g = e.params.autoplay.delay);
        const s = (() => {
          let t;
          if (
            ((t =
              e.virtual && e.params.virtual.enabled
                ? e.slides.filter((e) =>
                    e.classList.contains("swiper-slide-active")
                  )[0]
                : e.slides[e.activeIndex]),
            !t)
          )
            return;
          return parseInt(t.getAttribute("data-swiper-autoplay"), 10);
        })();
        !Number.isNaN(s) &&
          s > 0 &&
          void 0 === t &&
          ((r = s), (m = s), (g = s)),
          (o = r);
        const l = e.params.speed,
          c = () => {
            e &&
              !e.destroyed &&
              (e.params.autoplay.reverseDirection
                ? !e.isBeginning || e.params.loop || e.params.rewind
                  ? (e.slidePrev(l, !0, !0), a("autoplay"))
                  : e.params.autoplay.stopOnLastSlide ||
                    (e.slideTo(e.slides.length - 1, l, !0, !0), a("autoplay"))
                : !e.isEnd || e.params.loop || e.params.rewind
                ? (e.slideNext(l, !0, !0), a("autoplay"))
                : e.params.autoplay.stopOnLastSlide ||
                  (e.slideTo(0, l, !0, !0), a("autoplay")),
              e.params.cssMode &&
                ((v = new Date().getTime()),
                requestAnimationFrame(() => {
                  y();
                })));
          };
        return (
          r > 0
            ? (clearTimeout(n),
              (n = setTimeout(() => {
                c();
              }, r)))
            : requestAnimationFrame(() => {
                c();
              }),
          r
        );
      },
      E = () => {
        (e.autoplay.running = !0), y(), a("autoplayStart");
      },
      C = () => {
        (e.autoplay.running = !1),
          clearTimeout(n),
          cancelAnimationFrame(i),
          a("autoplayStop");
      },
      x = (t, r) => {
        if (e.destroyed || !e.autoplay.running) return;
        clearTimeout(n), t || (f = !0);
        const s = () => {
          a("autoplayPause"),
            e.params.autoplay.waitForTransition
              ? e.wrapperEl.addEventListener("transitionend", b)
              : S();
        };
        if (((e.autoplay.paused = !0), r))
          return h && (o = e.params.autoplay.delay), (h = !1), void s();
        const i = o || e.params.autoplay.delay;
        (o = i - (new Date().getTime() - v)),
          (e.isEnd && o < 0 && !e.params.loop) || (o < 0 && (o = 0), s());
      },
      S = () => {
        (e.isEnd && o < 0 && !e.params.loop) ||
          e.destroyed ||
          !e.autoplay.running ||
          ((v = new Date().getTime()),
          f ? ((f = !1), y(o)) : y(),
          (e.autoplay.paused = !1),
          a("autoplayResume"));
      },
      k = () => {
        if (e.destroyed || !e.autoplay.running) return;
        const t = u();
        "hidden" === t.visibilityState && ((f = !0), x(!0)),
          "visible" === t.visibilityState && S();
      },
      T = (e) => {
        "mouse" === e.pointerType && ((f = !0), x(!0));
      },
      M = (t) => {
        "mouse" === t.pointerType && e.autoplay.paused && S();
      };
    r("init", () => {
      e.params.autoplay.enabled &&
        (e.params.autoplay.pauseOnMouseEnter &&
          (e.el.addEventListener("pointerenter", T),
          e.el.addEventListener("pointerleave", M)),
        u().addEventListener("visibilitychange", k),
        (v = new Date().getTime()),
        E());
    }),
      r("destroy", () => {
        e.el.removeEventListener("pointerenter", T),
          e.el.removeEventListener("pointerleave", M),
          u().removeEventListener("visibilitychange", k),
          e.autoplay.running && C();
      }),
      r("beforeTransitionStart", (t, r, a) => {
        !e.destroyed &&
          e.autoplay.running &&
          (a || !e.params.autoplay.disableOnInteraction ? x(!0, !0) : C());
      }),
      r("sliderFirstMove", () => {
        !e.destroyed &&
          e.autoplay.running &&
          (e.params.autoplay.disableOnInteraction
            ? C()
            : ((c = !0),
              (p = !1),
              (f = !1),
              (d = setTimeout(() => {
                (f = !0), (p = !0), x(!0);
              }, 200))));
      }),
      r("touchEnd", () => {
        if (!e.destroyed && e.autoplay.running && c) {
          if (
            (clearTimeout(d),
            clearTimeout(n),
            e.params.autoplay.disableOnInteraction)
          )
            return (p = !1), void (c = !1);
          p && e.params.cssMode && S(), (p = !1), (c = !1);
        }
      }),
      r("slideChange", () => {
        !e.destroyed && e.autoplay.running && (h = !0);
      }),
      Object.assign(e.autoplay, { start: E, stop: C, pause: x, resume: S });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      thumbs: {
        swiper: null,
        multipleActiveThumbs: !0,
        autoScrollOffset: 0,
        slideThumbActiveClass: "swiper-slide-thumb-active",
        thumbsContainerClass: "swiper-thumbs",
      },
    });
    let a = !1,
      s = !1;
    function n() {
      const t = e.thumbs.swiper;
      if (!t || t.destroyed) return;
      const r = t.clickedIndex,
        a = t.clickedSlide;
      if (a && a.classList.contains(e.params.thumbs.slideThumbActiveClass))
        return;
      if (null == r) return;
      let s;
      (s = t.params.loop
        ? parseInt(t.clickedSlide.getAttribute("data-swiper-slide-index"), 10)
        : r),
        e.params.loop ? e.slideToLoop(s) : e.slideTo(s);
    }
    function i() {
      const { thumbs: t } = e.params;
      if (a) return !1;
      a = !0;
      const r = e.constructor;
      if (t.swiper instanceof r)
        (e.thumbs.swiper = t.swiper),
          Object.assign(e.thumbs.swiper.originalParams, {
            watchSlidesProgress: !0,
            slideToClickedSlide: !1,
          }),
          Object.assign(e.thumbs.swiper.params, {
            watchSlidesProgress: !0,
            slideToClickedSlide: !1,
          }),
          e.thumbs.swiper.update();
      else if (da(t.swiper)) {
        const a = Object.assign({}, t.swiper);
        Object.assign(a, { watchSlidesProgress: !0, slideToClickedSlide: !1 }),
          (e.thumbs.swiper = new r(a)),
          (s = !0);
      }
      return (
        e.thumbs.swiper.el.classList.add(e.params.thumbs.thumbsContainerClass),
        e.thumbs.swiper.on("tap", n),
        !0
      );
    }
    function o(t) {
      const r = e.thumbs.swiper;
      if (!r || r.destroyed) return;
      const a =
        "auto" === r.params.slidesPerView
          ? r.slidesPerViewDynamic()
          : r.params.slidesPerView;
      let s = 1;
      const n = e.params.thumbs.slideThumbActiveClass;
      if (
        (e.params.slidesPerView > 1 &&
          !e.params.centeredSlides &&
          (s = e.params.slidesPerView),
        e.params.thumbs.multipleActiveThumbs || (s = 1),
        (s = Math.floor(s)),
        r.slides.forEach((e) => e.classList.remove(n)),
        r.params.loop || (r.params.virtual && r.params.virtual.enabled))
      )
        for (let l = 0; l < s; l += 1)
          ga(
            r.slidesEl,
            `[data-swiper-slide-index="${e.realIndex + l}"]`
          ).forEach((e) => {
            e.classList.add(n);
          });
      else
        for (let l = 0; l < s; l += 1)
          r.slides[e.realIndex + l] &&
            r.slides[e.realIndex + l].classList.add(n);
      const i = e.params.thumbs.autoScrollOffset,
        o = i && !r.params.loop;
      if (e.realIndex !== r.realIndex || o) {
        const s = r.activeIndex;
        let n, l;
        if (r.params.loop) {
          const t = r.slides.filter(
            (t) =>
              t.getAttribute("data-swiper-slide-index") === `${e.realIndex}`
          )[0];
          (n = r.slides.indexOf(t)),
            (l = e.activeIndex > e.previousIndex ? "next" : "prev");
        } else (n = e.realIndex), (l = n > e.previousIndex ? "next" : "prev");
        o && (n += "next" === l ? i : -1 * i),
          r.visibleSlidesIndexes &&
            r.visibleSlidesIndexes.indexOf(n) < 0 &&
            (r.params.centeredSlides
              ? (n =
                  n > s ? n - Math.floor(a / 2) + 1 : n + Math.floor(a / 2) - 1)
              : n > s && r.params.slidesPerGroup,
            r.slideTo(n, t ? 0 : void 0));
      }
    }
    (e.thumbs = { swiper: null }),
      r("beforeInit", () => {
        const { thumbs: t } = e.params;
        if (t && t.swiper)
          if ("string" == typeof t.swiper || t.swiper instanceof HTMLElement) {
            const r = u(),
              a = () => {
                const a =
                  "string" == typeof t.swiper
                    ? r.querySelector(t.swiper)
                    : t.swiper;
                if (a && a.swiper) (t.swiper = a.swiper), i(), o(!0);
                else if (a) {
                  const r = (s) => {
                    (t.swiper = s.detail[0]),
                      a.removeEventListener("init", r),
                      i(),
                      o(!0),
                      t.swiper.update(),
                      e.update();
                  };
                  a.addEventListener("init", r);
                }
                return a;
              },
              s = () => {
                if (e.destroyed) return;
                a() || requestAnimationFrame(s);
              };
            requestAnimationFrame(s);
          } else i(), o(!0);
      }),
      r("slideChange update resize observerUpdate", () => {
        o();
      }),
      r("setTransition", (t, r) => {
        const a = e.thumbs.swiper;
        a && !a.destroyed && a.setTransition(r);
      }),
      r("beforeDestroy", () => {
        const t = e.thumbs.swiper;
        t && !t.destroyed && s && t.destroy();
      }),
      Object.assign(e.thumbs, { init: i, update: o });
  },
  function ({ swiper: e, extendParams: t, emit: r, once: a }) {
    t({
      freeMode: {
        enabled: !1,
        momentum: !0,
        momentumRatio: 1,
        momentumBounce: !0,
        momentumBounceRatio: 1,
        momentumVelocityRatio: 1,
        sticky: !1,
        minimumVelocity: 0.02,
      },
    }),
      Object.assign(e, {
        freeMode: {
          onTouchStart: function () {
            const t = e.getTranslate();
            e.setTranslate(t),
              e.setTransition(0),
              (e.touchEventsData.velocities.length = 0),
              e.freeMode.onTouchEnd({
                currentPos: e.rtl ? e.translate : -e.translate,
              });
          },
          onTouchMove: function () {
            const { touchEventsData: t, touches: r } = e;
            0 === t.velocities.length &&
              t.velocities.push({
                position: r[e.isHorizontal() ? "startX" : "startY"],
                time: t.touchStartTime,
              }),
              t.velocities.push({
                position: r[e.isHorizontal() ? "currentX" : "currentY"],
                time: ca(),
              });
          },
          onTouchEnd: function ({ currentPos: t }) {
            const {
                params: s,
                wrapperEl: n,
                rtlTranslate: i,
                snapGrid: o,
                touchEventsData: l,
              } = e,
              c = ca() - l.touchStartTime;
            if (t < -e.minTranslate()) e.slideTo(e.activeIndex);
            else if (t > -e.maxTranslate())
              e.slides.length < o.length
                ? e.slideTo(o.length - 1)
                : e.slideTo(e.slides.length - 1);
            else {
              if (s.freeMode.momentum) {
                if (l.velocities.length > 1) {
                  const t = l.velocities.pop(),
                    r = l.velocities.pop(),
                    a = t.position - r.position,
                    n = t.time - r.time;
                  (e.velocity = a / n),
                    (e.velocity /= 2),
                    Math.abs(e.velocity) < s.freeMode.minimumVelocity &&
                      (e.velocity = 0),
                    (n > 150 || ca() - t.time > 300) && (e.velocity = 0);
                } else e.velocity = 0;
                (e.velocity *= s.freeMode.momentumVelocityRatio),
                  (l.velocities.length = 0);
                let t = 1e3 * s.freeMode.momentumRatio;
                const c = e.velocity * t;
                let p = e.translate + c;
                i && (p = -p);
                let d,
                  u = !1;
                const h =
                  20 * Math.abs(e.velocity) * s.freeMode.momentumBounceRatio;
                let f;
                if (p < e.maxTranslate())
                  s.freeMode.momentumBounce
                    ? (p + e.maxTranslate() < -h && (p = e.maxTranslate() - h),
                      (d = e.maxTranslate()),
                      (u = !0),
                      (l.allowMomentumBounce = !0))
                    : (p = e.maxTranslate()),
                    s.loop && s.centeredSlides && (f = !0);
                else if (p > e.minTranslate())
                  s.freeMode.momentumBounce
                    ? (p - e.minTranslate() > h && (p = e.minTranslate() + h),
                      (d = e.minTranslate()),
                      (u = !0),
                      (l.allowMomentumBounce = !0))
                    : (p = e.minTranslate()),
                    s.loop && s.centeredSlides && (f = !0);
                else if (s.freeMode.sticky) {
                  let t;
                  for (let e = 0; e < o.length; e += 1)
                    if (o[e] > -p) {
                      t = e;
                      break;
                    }
                  (p =
                    Math.abs(o[t] - p) < Math.abs(o[t - 1] - p) ||
                    "next" === e.swipeDirection
                      ? o[t]
                      : o[t - 1]),
                    (p = -p);
                }
                if (
                  (f &&
                    a("transitionEnd", () => {
                      e.loopFix();
                    }),
                  0 !== e.velocity)
                ) {
                  if (
                    ((t = i
                      ? Math.abs((-p - e.translate) / e.velocity)
                      : Math.abs((p - e.translate) / e.velocity)),
                    s.freeMode.sticky)
                  ) {
                    const r = Math.abs((i ? -p : p) - e.translate),
                      a = e.slidesSizesGrid[e.activeIndex];
                    t =
                      r < a
                        ? s.speed
                        : r < 2 * a
                        ? 1.5 * s.speed
                        : 2.5 * s.speed;
                  }
                } else if (s.freeMode.sticky) return void e.slideToClosest();
                s.freeMode.momentumBounce && u
                  ? (e.updateProgress(d),
                    e.setTransition(t),
                    e.setTranslate(p),
                    e.transitionStart(!0, e.swipeDirection),
                    (e.animating = !0),
                    Ca(n, () => {
                      e &&
                        !e.destroyed &&
                        l.allowMomentumBounce &&
                        (r("momentumBounce"),
                        e.setTransition(s.speed),
                        setTimeout(() => {
                          e.setTranslate(d),
                            Ca(n, () => {
                              e && !e.destroyed && e.transitionEnd();
                            });
                        }, 0));
                    }))
                  : e.velocity
                  ? (r("_freeModeNoMomentumRelease"),
                    e.updateProgress(p),
                    e.setTransition(t),
                    e.setTranslate(p),
                    e.transitionStart(!0, e.swipeDirection),
                    e.animating ||
                      ((e.animating = !0),
                      Ca(n, () => {
                        e && !e.destroyed && e.transitionEnd();
                      })))
                  : e.updateProgress(p),
                  e.updateActiveIndex(),
                  e.updateSlidesClasses();
              } else {
                if (s.freeMode.sticky) return void e.slideToClosest();
                s.freeMode && r("_freeModeNoMomentumRelease");
              }
              (!s.freeMode.momentum || c >= s.longSwipesMs) &&
                (e.updateProgress(),
                e.updateActiveIndex(),
                e.updateSlidesClasses());
            }
          },
        },
      });
  },
  function ({ swiper: e, extendParams: t }) {
    let r, a, s;
    t({ grid: { rows: 1, fill: "column" } }),
      (e.grid = {
        initSlides: (t) => {
          const { slidesPerView: n } = e.params,
            { rows: i, fill: o } = e.params.grid;
          (a = r / i),
            (s = Math.floor(t / i)),
            (r = Math.floor(t / i) === t / i ? t : Math.ceil(t / i) * i),
            "auto" !== n && "row" === o && (r = Math.max(r, n * i));
        },
        updateSlide: (t, n, i, o) => {
          const { slidesPerGroup: l, spaceBetween: c } = e.params,
            { rows: p, fill: d } = e.params.grid;
          let u, h, f;
          if ("row" === d && l > 1) {
            const e = Math.floor(t / (l * p)),
              a = t - p * l * e,
              s = 0 === e ? l : Math.min(Math.ceil((i - e * p * l) / p), l);
            (f = Math.floor(a / s)),
              (h = a - f * s + e * l),
              (u = h + (f * r) / p),
              (n.style.order = u);
          } else
            "column" === d
              ? ((h = Math.floor(t / p)),
                (f = t - h * p),
                (h > s || (h === s && f === p - 1)) &&
                  ((f += 1), f >= p && ((f = 0), (h += 1))))
              : ((f = Math.floor(t / a)), (h = t - f * a));
          n.style[o("margin-top")] = 0 !== f ? c && `${c}px` : "";
        },
        updateWrapperSize: (t, a, s) => {
          const {
              spaceBetween: n,
              centeredSlides: i,
              roundLengths: o,
            } = e.params,
            { rows: l } = e.params.grid;
          if (
            ((e.virtualSize = (t + n) * r),
            (e.virtualSize = Math.ceil(e.virtualSize / l) - n),
            (e.wrapperEl.style[s("width")] = `${e.virtualSize + n}px`),
            i)
          ) {
            const t = [];
            for (let r = 0; r < a.length; r += 1) {
              let s = a[r];
              o && (s = Math.floor(s)),
                a[r] < e.virtualSize + a[0] && t.push(s);
            }
            a.splice(0, a.length), a.push(...t);
          }
        },
      });
  },
  function ({ swiper: e }) {
    Object.assign(e, {
      appendSlide: es.bind(e),
      prependSlide: ts.bind(e),
      addSlide: rs.bind(e),
      removeSlide: as.bind(e),
      removeAllSlides: ss.bind(e),
    });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({ fadeEffect: { crossFade: !1 } }),
      ns({
        effect: "fade",
        swiper: e,
        on: r,
        setTranslate: () => {
          const { slides: t } = e;
          e.params.fadeEffect;
          for (let r = 0; r < t.length; r += 1) {
            const t = e.slides[r];
            let a = -t.swiperSlideOffset;
            e.params.virtualTranslate || (a -= e.translate);
            let s = 0;
            e.isHorizontal() || ((s = a), (a = 0));
            const n = e.params.fadeEffect.crossFade
                ? Math.max(1 - Math.abs(t.progress), 0)
                : 1 + Math.min(Math.max(t.progress, -1), 0),
              i = is(0, t);
            (i.style.opacity = n),
              (i.style.transform = `translate3d(${a}px, ${s}px, 0px)`);
          }
        },
        setTransition: (t) => {
          const r = e.slides.map((e) => ma(e));
          r.forEach((e) => {
            e.style.transitionDuration = `${t}ms`;
          }),
            os({ swiper: e, duration: t, transformElements: r, allSlides: !0 });
        },
        overwriteParams: () => ({
          slidesPerView: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: !0,
          spaceBetween: 0,
          virtualTranslate: !e.params.cssMode,
        }),
      });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      cubeEffect: {
        slideShadows: !0,
        shadow: !0,
        shadowOffset: 20,
        shadowScale: 0.94,
      },
    });
    const a = (e, t, r) => {
      let a = r
          ? e.querySelector(".swiper-slide-shadow-left")
          : e.querySelector(".swiper-slide-shadow-top"),
        s = r
          ? e.querySelector(".swiper-slide-shadow-right")
          : e.querySelector(".swiper-slide-shadow-bottom");
      a ||
        ((a = va("div", "swiper-slide-shadow-" + (r ? "left" : "top"))),
        e.append(a)),
        s ||
          ((s = va("div", "swiper-slide-shadow-" + (r ? "right" : "bottom"))),
          e.append(s)),
        a && (a.style.opacity = Math.max(-t, 0)),
        s && (s.style.opacity = Math.max(t, 0));
    };
    ns({
      effect: "cube",
      swiper: e,
      on: r,
      setTranslate: () => {
        const {
            el: t,
            wrapperEl: r,
            slides: s,
            width: n,
            height: i,
            rtlTranslate: o,
            size: l,
            browser: c,
          } = e,
          p = e.params.cubeEffect,
          d = e.isHorizontal(),
          u = e.virtual && e.params.virtual.enabled;
        let h,
          f = 0;
        p.shadow &&
          (d
            ? ((h = e.slidesEl.querySelector(".swiper-cube-shadow")),
              h ||
                ((h = va("div", "swiper-cube-shadow")), e.slidesEl.append(h)),
              (h.style.height = `${n}px`))
            : ((h = t.querySelector(".swiper-cube-shadow")),
              h || ((h = va("div", "swiper-cube-shadow")), t.append(h))));
        for (let e = 0; e < s.length; e += 1) {
          const t = s[e];
          let r = e;
          u && (r = parseInt(t.getAttribute("data-swiper-slide-index"), 10));
          let n = 90 * r,
            i = Math.floor(n / 360);
          o && ((n = -n), (i = Math.floor(-n / 360)));
          const c = Math.max(Math.min(t.progress, 1), -1);
          let h = 0,
            m = 0,
            g = 0;
          r % 4 == 0
            ? ((h = 4 * -i * l), (g = 0))
            : (r - 1) % 4 == 0
            ? ((h = 0), (g = 4 * -i * l))
            : (r - 2) % 4 == 0
            ? ((h = l + 4 * i * l), (g = l))
            : (r - 3) % 4 == 0 && ((h = -l), (g = 3 * l + 4 * l * i)),
            o && (h = -h),
            d || ((m = h), (h = 0));
          const v = `rotateX(${d ? 0 : -n}deg) rotateY(${
            d ? n : 0
          }deg) translate3d(${h}px, ${m}px, ${g}px)`;
          c <= 1 &&
            c > -1 &&
            ((f = 90 * r + 90 * c), o && (f = 90 * -r - 90 * c)),
            (t.style.transform = v),
            p.slideShadows && a(t, c, d);
        }
        if (
          ((r.style.transformOrigin = `50% 50% -${l / 2}px`),
          (r.style["-webkit-transform-origin"] = `50% 50% -${l / 2}px`),
          p.shadow)
        )
          if (d)
            h.style.transform = `translate3d(0px, ${
              n / 2 + p.shadowOffset
            }px, ${-n / 2}px) rotateX(90deg) rotateZ(0deg) scale(${
              p.shadowScale
            })`;
          else {
            const e = Math.abs(f) - 90 * Math.floor(Math.abs(f) / 90),
              t =
                1.5 -
                (Math.sin((2 * e * Math.PI) / 360) / 2 +
                  Math.cos((2 * e * Math.PI) / 360) / 2),
              r = p.shadowScale,
              a = p.shadowScale / t,
              s = p.shadowOffset;
            h.style.transform = `scale3d(${r}, 1, ${a}) translate3d(0px, ${
              i / 2 + s
            }px, ${-i / 2 / a}px) rotateX(-90deg)`;
          }
        const m =
          (c.isSafari || c.isWebView) && c.needPerspectiveFix ? -l / 2 : 0;
        (r.style.transform = `translate3d(0px,0,${m}px) rotateX(${
          e.isHorizontal() ? 0 : f
        }deg) rotateY(${e.isHorizontal() ? -f : 0}deg)`),
          r.style.setProperty("--swiper-cube-translate-z", `${m}px`);
      },
      setTransition: (t) => {
        const { el: r, slides: a } = e;
        if (
          (a.forEach((e) => {
            (e.style.transitionDuration = `${t}ms`),
              e
                .querySelectorAll(
                  ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                )
                .forEach((e) => {
                  e.style.transitionDuration = `${t}ms`;
                });
          }),
          e.params.cubeEffect.shadow && !e.isHorizontal())
        ) {
          const e = r.querySelector(".swiper-cube-shadow");
          e && (e.style.transitionDuration = `${t}ms`);
        }
      },
      recreateShadows: () => {
        const t = e.isHorizontal();
        e.slides.forEach((e) => {
          const r = Math.max(Math.min(e.progress, 1), -1);
          a(e, r, t);
        });
      },
      getEffectParams: () => e.params.cubeEffect,
      perspective: () => !0,
      overwriteParams: () => ({
        slidesPerView: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: !0,
        resistanceRatio: 0,
        spaceBetween: 0,
        centeredSlides: !1,
        virtualTranslate: !0,
      }),
    });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({ flipEffect: { slideShadows: !0, limitRotation: !0 } });
    const a = (t, r, a) => {
      let s = e.isHorizontal()
          ? t.querySelector(".swiper-slide-shadow-left")
          : t.querySelector(".swiper-slide-shadow-top"),
        n = e.isHorizontal()
          ? t.querySelector(".swiper-slide-shadow-right")
          : t.querySelector(".swiper-slide-shadow-bottom");
      s || (s = ls(0, t, e.isHorizontal() ? "left" : "top")),
        n || (n = ls(0, t, e.isHorizontal() ? "right" : "bottom")),
        s && (s.style.opacity = Math.max(-r, 0)),
        n && (n.style.opacity = Math.max(r, 0));
    };
    ns({
      effect: "flip",
      swiper: e,
      on: r,
      setTranslate: () => {
        const { slides: t, rtlTranslate: r } = e,
          s = e.params.flipEffect;
        for (let n = 0; n < t.length; n += 1) {
          const i = t[n];
          let o = i.progress;
          e.params.flipEffect.limitRotation &&
            (o = Math.max(Math.min(i.progress, 1), -1));
          const l = i.swiperSlideOffset;
          let c = -180 * o,
            p = 0,
            d = e.params.cssMode ? -l - e.translate : -l,
            u = 0;
          e.isHorizontal()
            ? r && (c = -c)
            : ((u = d), (d = 0), (p = -c), (c = 0)),
            (i.style.zIndex = -Math.abs(Math.round(o)) + t.length),
            s.slideShadows && a(i, o);
          const h = `translate3d(${d}px, ${u}px, 0px) rotateX(${p}deg) rotateY(${c}deg)`;
          is(0, i).style.transform = h;
        }
      },
      setTransition: (t) => {
        const r = e.slides.map((e) => ma(e));
        r.forEach((e) => {
          (e.style.transitionDuration = `${t}ms`),
            e
              .querySelectorAll(
                ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
              )
              .forEach((e) => {
                e.style.transitionDuration = `${t}ms`;
              });
        }),
          os({ swiper: e, duration: t, transformElements: r });
      },
      recreateShadows: () => {
        e.params.flipEffect;
        e.slides.forEach((t) => {
          let r = t.progress;
          e.params.flipEffect.limitRotation &&
            (r = Math.max(Math.min(t.progress, 1), -1)),
            a(t, r);
        });
      },
      getEffectParams: () => e.params.flipEffect,
      perspective: () => !0,
      overwriteParams: () => ({
        slidesPerView: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: !0,
        spaceBetween: 0,
        virtualTranslate: !e.params.cssMode,
      }),
    });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        scale: 1,
        modifier: 1,
        slideShadows: !0,
      },
    }),
      ns({
        effect: "coverflow",
        swiper: e,
        on: r,
        setTranslate: () => {
          const { width: t, height: r, slides: a, slidesSizesGrid: s } = e,
            n = e.params.coverflowEffect,
            i = e.isHorizontal(),
            o = e.translate,
            l = i ? t / 2 - o : r / 2 - o,
            c = i ? n.rotate : -n.rotate,
            p = n.depth;
          for (let e = 0, d = a.length; e < d; e += 1) {
            const t = a[e],
              r = s[e],
              o = (l - t.swiperSlideOffset - r / 2) / r,
              d =
                "function" == typeof n.modifier
                  ? n.modifier(o)
                  : o * n.modifier;
            let u = i ? c * d : 0,
              h = i ? 0 : c * d,
              f = -p * Math.abs(d),
              m = n.stretch;
            "string" == typeof m &&
              -1 !== m.indexOf("%") &&
              (m = (parseFloat(n.stretch) / 100) * r);
            let g = i ? 0 : m * d,
              v = i ? m * d : 0,
              b = 1 - (1 - n.scale) * Math.abs(d);
            Math.abs(v) < 0.001 && (v = 0),
              Math.abs(g) < 0.001 && (g = 0),
              Math.abs(f) < 0.001 && (f = 0),
              Math.abs(u) < 0.001 && (u = 0),
              Math.abs(h) < 0.001 && (h = 0),
              Math.abs(b) < 0.001 && (b = 0);
            const w = `translate3d(${v}px,${g}px,${f}px)  rotateX(${h}deg) rotateY(${u}deg) scale(${b})`;
            if (
              ((is(0, t).style.transform = w),
              (t.style.zIndex = 1 - Math.abs(Math.round(d))),
              n.slideShadows)
            ) {
              let e = i
                  ? t.querySelector(".swiper-slide-shadow-left")
                  : t.querySelector(".swiper-slide-shadow-top"),
                r = i
                  ? t.querySelector(".swiper-slide-shadow-right")
                  : t.querySelector(".swiper-slide-shadow-bottom");
              e || (e = ls(0, t, i ? "left" : "top")),
                r || (r = ls(0, t, i ? "right" : "bottom")),
                e && (e.style.opacity = d > 0 ? d : 0),
                r && (r.style.opacity = -d > 0 ? -d : 0);
            }
          }
        },
        setTransition: (t) => {
          e.slides
            .map((e) => ma(e))
            .forEach((e) => {
              (e.style.transitionDuration = `${t}ms`),
                e
                  .querySelectorAll(
                    ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                  )
                  .forEach((e) => {
                    e.style.transitionDuration = `${t}ms`;
                  });
            });
        },
        perspective: () => !0,
        overwriteParams: () => ({ watchSlidesProgress: !0 }),
      });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      creativeEffect: {
        limitProgress: 1,
        shadowPerProgress: !1,
        progressMultiplier: 1,
        perspective: !0,
        prev: { translate: [0, 0, 0], rotate: [0, 0, 0], opacity: 1, scale: 1 },
        next: { translate: [0, 0, 0], rotate: [0, 0, 0], opacity: 1, scale: 1 },
      },
    });
    const a = (e) => ("string" == typeof e ? e : `${e}px`);
    ns({
      effect: "creative",
      swiper: e,
      on: r,
      setTranslate: () => {
        const { slides: t, wrapperEl: r, slidesSizesGrid: s } = e,
          n = e.params.creativeEffect,
          { progressMultiplier: i } = n,
          o = e.params.centeredSlides;
        if (o) {
          const t = s[0] / 2 - e.params.slidesOffsetBefore || 0;
          r.style.transform = `translateX(calc(50% - ${t}px))`;
        }
        for (let l = 0; l < t.length; l += 1) {
          const r = t[l],
            s = r.progress,
            c = Math.min(
              Math.max(r.progress, -n.limitProgress),
              n.limitProgress
            );
          let p = c;
          o ||
            (p = Math.min(
              Math.max(r.originalProgress, -n.limitProgress),
              n.limitProgress
            ));
          const d = r.swiperSlideOffset,
            u = [e.params.cssMode ? -d - e.translate : -d, 0, 0],
            h = [0, 0, 0];
          let f = !1;
          e.isHorizontal() || ((u[1] = u[0]), (u[0] = 0));
          let m = {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
            scale: 1,
            opacity: 1,
          };
          c < 0 ? ((m = n.next), (f = !0)) : c > 0 && ((m = n.prev), (f = !0)),
            u.forEach((e, t) => {
              u[t] = `calc(${e}px + (${a(m.translate[t])} * ${Math.abs(
                c * i
              )}))`;
            }),
            h.forEach((e, t) => {
              h[t] = m.rotate[t] * Math.abs(c * i);
            }),
            (r.style.zIndex = -Math.abs(Math.round(s)) + t.length);
          const g = u.join(", "),
            v = `rotateX(${h[0]}deg) rotateY(${h[1]}deg) rotateZ(${h[2]}deg)`,
            b =
              p < 0
                ? `scale(${1 + (1 - m.scale) * p * i})`
                : `scale(${1 - (1 - m.scale) * p * i})`,
            w =
              p < 0 ? 1 + (1 - m.opacity) * p * i : 1 - (1 - m.opacity) * p * i,
            y = `translate3d(${g}) ${v} ${b}`;
          if ((f && m.shadow) || !f) {
            let e = r.querySelector(".swiper-slide-shadow");
            if ((!e && m.shadow && (e = ls(0, r)), e)) {
              const t = n.shadowPerProgress ? c * (1 / n.limitProgress) : c;
              e.style.opacity = Math.min(Math.max(Math.abs(t), 0), 1);
            }
          }
          const E = is(0, r);
          (E.style.transform = y),
            (E.style.opacity = w),
            m.origin && (E.style.transformOrigin = m.origin);
        }
      },
      setTransition: (t) => {
        const r = e.slides.map((e) => ma(e));
        r.forEach((e) => {
          (e.style.transitionDuration = `${t}ms`),
            e.querySelectorAll(".swiper-slide-shadow").forEach((e) => {
              e.style.transitionDuration = `${t}ms`;
            });
        }),
          os({ swiper: e, duration: t, transformElements: r, allSlides: !0 });
      },
      perspective: () => e.params.creativeEffect.perspective,
      overwriteParams: () => ({
        watchSlidesProgress: !0,
        virtualTranslate: !e.params.cssMode,
      }),
    });
  },
  function ({ swiper: e, extendParams: t, on: r }) {
    t({
      cardsEffect: {
        slideShadows: !0,
        rotate: !0,
        perSlideRotate: 2,
        perSlideOffset: 8,
      },
    }),
      ns({
        effect: "cards",
        swiper: e,
        on: r,
        setTranslate: () => {
          const { slides: t, activeIndex: r } = e,
            a = e.params.cardsEffect,
            { startTranslate: s, isTouched: n } = e.touchEventsData,
            i = e.translate;
          for (let o = 0; o < t.length; o += 1) {
            const l = t[o],
              c = l.progress,
              p = Math.min(Math.max(c, -4), 4);
            let d = l.swiperSlideOffset;
            e.params.centeredSlides &&
              !e.params.cssMode &&
              (e.wrapperEl.style.transform = `translateX(${e.minTranslate()}px)`),
              e.params.centeredSlides &&
                e.params.cssMode &&
                (d -= t[0].swiperSlideOffset);
            let u = e.params.cssMode ? -d - e.translate : -d,
              h = 0;
            const f = -100 * Math.abs(p);
            let m = 1,
              g = -a.perSlideRotate * p,
              v = a.perSlideOffset - 0.75 * Math.abs(p);
            const b =
                e.virtual && e.params.virtual.enabled ? e.virtual.from + o : o,
              w =
                (b === r || b === r - 1) &&
                p > 0 &&
                p < 1 &&
                (n || e.params.cssMode) &&
                i < s,
              y =
                (b === r || b === r + 1) &&
                p < 0 &&
                p > -1 &&
                (n || e.params.cssMode) &&
                i > s;
            if (w || y) {
              const e = (1 - Math.abs((Math.abs(p) - 0.5) / 0.5)) ** 0.5;
              (g += -28 * p * e),
                (m += -0.5 * e),
                (v += 96 * e),
                (h = -25 * e * Math.abs(p) + "%");
            }
            if (
              ((u =
                p < 0
                  ? `calc(${u}px + (${v * Math.abs(p)}%))`
                  : p > 0
                  ? `calc(${u}px + (-${v * Math.abs(p)}%))`
                  : `${u}px`),
              !e.isHorizontal())
            ) {
              const e = h;
              (h = u), (u = e);
            }
            const E = p < 0 ? "" + (1 + (1 - m) * p) : "" + (1 - (1 - m) * p),
              C = `\n        translate3d(${u}, ${h}, ${f}px)\n        rotateZ(${
                a.rotate ? g : 0
              }deg)\n        scale(${E})\n      `;
            if (a.slideShadows) {
              let e = l.querySelector(".swiper-slide-shadow");
              e || (e = ls(0, l)),
                e &&
                  (e.style.opacity = Math.min(
                    Math.max((Math.abs(p) - 0.5) / 0.5, 0),
                    1
                  ));
            }
            l.style.zIndex = -Math.abs(Math.round(c)) + t.length;
            is(0, l).style.transform = C;
          }
        },
        setTransition: (t) => {
          const r = e.slides.map((e) => ma(e));
          r.forEach((e) => {
            (e.style.transitionDuration = `${t}ms`),
              e.querySelectorAll(".swiper-slide-shadow").forEach((e) => {
                e.style.transitionDuration = `${t}ms`;
              });
          }),
            os({ swiper: e, duration: t, transformElements: r });
        },
        perspective: () => !0,
        overwriteParams: () => ({
          watchSlidesProgress: !0,
          virtualTranslate: !e.params.cssMode,
        }),
      });
  },
];
Ka.use(cs);
const ps = [
  "eventsPrefix",
  "modules",
  "init",
  "_direction",
  "oneWayMovement",
  "touchEventsTarget",
  "initialSlide",
  "_speed",
  "cssMode",
  "updateOnWindowResize",
  "resizeObserver",
  "nested",
  "focusableElements",
  "_enabled",
  "_width",
  "_height",
  "preventInteractionOnTransition",
  "userAgent",
  "url",
  "_edgeSwipeDetection",
  "_edgeSwipeThreshold",
  "_freeMode",
  "_autoHeight",
  "setWrapperSize",
  "virtualTranslate",
  "_effect",
  "breakpoints",
  "_spaceBetween",
  "_slidesPerView",
  "maxBackfaceHiddenSlides",
  "_grid",
  "_slidesPerGroup",
  "_slidesPerGroupSkip",
  "_slidesPerGroupAuto",
  "_centeredSlides",
  "_centeredSlidesBounds",
  "_slidesOffsetBefore",
  "_slidesOffsetAfter",
  "normalizeSlideIndex",
  "_centerInsufficientSlides",
  "_watchOverflow",
  "roundLengths",
  "touchRatio",
  "touchAngle",
  "simulateTouch",
  "_shortSwipes",
  "_longSwipes",
  "longSwipesRatio",
  "longSwipesMs",
  "_followFinger",
  "allowTouchMove",
  "_threshold",
  "touchMoveStopPropagation",
  "touchStartPreventDefault",
  "touchStartForcePreventDefault",
  "touchReleaseOnEdges",
  "uniqueNavElements",
  "_resistance",
  "_resistanceRatio",
  "_watchSlidesProgress",
  "_grabCursor",
  "preventClicks",
  "preventClicksPropagation",
  "_slideToClickedSlide",
  "_loop",
  "loopedSlides",
  "loopPreventsSliding",
  "_rewind",
  "_allowSlidePrev",
  "_allowSlideNext",
  "_swipeHandler",
  "_noSwiping",
  "noSwipingClass",
  "noSwipingSelector",
  "passiveListeners",
  "containerModifierClass",
  "slideClass",
  "slideActiveClass",
  "slideVisibleClass",
  "slideNextClass",
  "slidePrevClass",
  "wrapperClass",
  "lazyPreloaderClass",
  "lazyPreloadPrevNext",
  "runCallbacksOnInit",
  "observer",
  "observeParents",
  "observeSlideChildren",
  "a11y",
  "_autoplay",
  "_controller",
  "coverflowEffect",
  "cubeEffect",
  "fadeEffect",
  "flipEffect",
  "creativeEffect",
  "cardsEffect",
  "hashNavigation",
  "history",
  "keyboard",
  "mousewheel",
  "_navigation",
  "_pagination",
  "parallax",
  "_scrollbar",
  "_thumbs",
  "virtual",
  "zoom",
  "control",
  "injectStyles",
  "injectStylesUrls",
];
function ds(e) {
  return (
    "object" == typeof e &&
    null !== e &&
    e.constructor &&
    "Object" === Object.prototype.toString.call(e).slice(8, -1)
  );
}
function us(e, t) {
  const r = ["__proto__", "constructor", "prototype"];
  Object.keys(t)
    .filter((e) => r.indexOf(e) < 0)
    .forEach((r) => {
      void 0 === e[r]
        ? (e[r] = t[r])
        : ds(t[r]) && ds(e[r]) && Object.keys(t[r]).length > 0
        ? t[r].__swiper__
          ? (e[r] = t[r])
          : us(e[r], t[r])
        : (e[r] = t[r]);
    });
}
function hs(e = "") {
  return e.replace(/-[a-z]/g, (e) => e.toUpperCase().replace("-", ""));
}
const fs = (e) =>
    parseFloat(e) === Number(e)
      ? Number(e)
      : "true" === e ||
        "" === e ||
        ("false" !== e &&
          ("null" === e ? null : "undefined" !== e ? e : void 0)),
  ms = [
    "a11y",
    "autoplay",
    "controller",
    "cards-effect",
    "coverflow-effect",
    "creative-effect",
    "cube-effect",
    "fade-effect",
    "flip-effect",
    "free-mode",
    "grid",
    "hash-navigation",
    "history",
    "keyboard",
    "mousewheel",
    "navigation",
    "pagination",
    "parallax",
    "scrollbar",
    "thumbs",
    "virtual",
    "zoom",
  ];
function gs(e) {
  const t = {},
    r = {};
  us(t, Ga);
  const a = [...ps, "on"],
    s = a.map((e) => e.replace(/_/, ""));
  return (
    a.forEach((t) => {
      (t = t.replace("_", "")), void 0 !== e[t] && (r[t] = e[t]);
    }),
    [...e.attributes].forEach((e) => {
      const t = ms.filter((t) => 0 === e.name.indexOf(`${t}-`))[0];
      if (t) {
        const a = hs(t),
          s = hs(e.name.split(`${t}-`)[1]);
        r[a] || (r[a] = {}),
          !0 === r[a] && (r[a] = { enabled: !0 }),
          (r[a][s] = fs(e.value));
      } else {
        const t = hs(e.name);
        if (!s.includes(t)) return;
        const a = fs(e.value);
        r[t] && ms.includes(e.name)
          ? (r[t].constructor !== Object && (r[t] = {}), (r[t].enabled = a))
          : (r[t] = a);
      }
    }),
    us(t, r),
    t.navigation
      ? (t.navigation = o(
          { prevEl: ".swiper-button-prev", nextEl: ".swiper-button-next" },
          !0 !== t.navigation ? t.navigation : {}
        ))
      : !1 === t.navigation && delete t.navigation,
    t.scrollbar
      ? (t.scrollbar = o(
          { el: ".swiper-scrollbar" },
          !0 !== t.scrollbar ? t.scrollbar : {}
        ))
      : !1 === t.scrollbar && delete t.scrollbar,
    t.pagination
      ? (t.pagination = o(
          { el: ".swiper-pagination" },
          !0 !== t.pagination ? t.pagination : {}
        ))
      : !1 === t.pagination && delete t.pagination,
    { params: t, passedParams: r }
  );
}
function vs({
  swiper: e,
  slides: t,
  passedParams: r,
  changedParams: a,
  nextEl: s,
  prevEl: n,
  scrollbarEl: i,
  paginationEl: o,
}) {
  const l = a.filter(
      (e) => "children" !== e && "direction" !== e && "wrapperClass" !== e
    ),
    {
      params: c,
      pagination: p,
      navigation: d,
      scrollbar: u,
      virtual: h,
      thumbs: f,
    } = e;
  let m, g, v, b, w, y, E, C;
  a.includes("thumbs") &&
    r.thumbs &&
    r.thumbs.swiper &&
    c.thumbs &&
    !c.thumbs.swiper &&
    (m = !0),
    a.includes("controller") &&
      r.controller &&
      r.controller.control &&
      c.controller &&
      !c.controller.control &&
      (g = !0),
    a.includes("pagination") &&
      r.pagination &&
      (r.pagination.el || o) &&
      (c.pagination || !1 === c.pagination) &&
      p &&
      !p.el &&
      (v = !0),
    a.includes("scrollbar") &&
      r.scrollbar &&
      (r.scrollbar.el || i) &&
      (c.scrollbar || !1 === c.scrollbar) &&
      u &&
      !u.el &&
      (b = !0),
    a.includes("navigation") &&
      r.navigation &&
      (r.navigation.prevEl || n) &&
      (r.navigation.nextEl || s) &&
      (c.navigation || !1 === c.navigation) &&
      d &&
      !d.prevEl &&
      !d.nextEl &&
      (w = !0);
  if (
    (a.includes("loop") &&
      e.isElement &&
      (c.loop && !r.loop ? (y = !0) : !c.loop && r.loop ? (E = !0) : (C = !0)),
    l.forEach((t) => {
      if (ds(c[t]) && ds(r[t])) us(c[t], r[t]);
      else {
        const s = r[t];
        (!0 !== s && !1 !== s) ||
        ("navigation" !== t && "pagination" !== t && "scrollbar" !== t)
          ? (c[t] = r[t])
          : !1 === s &&
            e[(a = t)] &&
            (e[a].destroy(),
            "navigation" === a
              ? (e.isElement && (e[a].prevEl.remove(), e[a].nextEl.remove()),
                (c[a].prevEl = void 0),
                (c[a].nextEl = void 0),
                (e[a].prevEl = void 0),
                (e[a].nextEl = void 0))
              : (e.isElement && e[a].el.remove(),
                (c[a].el = void 0),
                (e[a].el = void 0)));
      }
      var a;
    }),
    l.includes("controller") &&
      !g &&
      e.controller &&
      e.controller.control &&
      c.controller &&
      c.controller.control &&
      (e.controller.control = c.controller.control),
    a.includes("children") &&
      t &&
      h &&
      c.virtual.enabled &&
      ((h.slides = t), h.update(!0)),
    a.includes("children") && t && c.loop && (C = !0),
    m)
  ) {
    f.init() && f.update(!0);
  }
  g && (e.controller.control = c.controller.control),
    v &&
      (!e.isElement ||
        (o && "string" != typeof o) ||
        ((o = document.createElement("div")).classList.add("swiper-pagination"),
        e.el.shadowEl.appendChild(o)),
      o && (c.pagination.el = o),
      p.init(),
      p.render(),
      p.update()),
    b &&
      (!e.isElement ||
        (i && "string" != typeof i) ||
        ((i = document.createElement("div")).classList.add("swiper-scrollbar"),
        e.el.shadowEl.appendChild(i)),
      i && (c.scrollbar.el = i),
      u.init(),
      u.updateSize(),
      u.setTranslate()),
    w &&
      (e.isElement &&
        ((s && "string" != typeof s) ||
          ((s = document.createElement("div")).classList.add(
            "swiper-button-next"
          ),
          e.el.shadowEl.appendChild(s)),
        (n && "string" != typeof n) ||
          ((n = document.createElement("div")).classList.add(
            "swiper-button-prev"
          ),
          e.el.shadowEl.appendChild(n))),
      s && (c.navigation.nextEl = s),
      n && (c.navigation.prevEl = n),
      d.init(),
      d.update()),
    a.includes("allowSlideNext") && (e.allowSlideNext = r.allowSlideNext),
    a.includes("allowSlidePrev") && (e.allowSlidePrev = r.allowSlidePrev),
    a.includes("direction") && e.changeDirection(r.direction, !1),
    (y || C) && e.loopDestroy(),
    (E || C) && e.loopCreate(),
    e.update();
}
const bs =
  "@font-face{font-family:swiper-icons;src:url('data:application/font-woff;charset=utf-8;base64, d09GRgABAAAAAAZgABAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAGRAAAABoAAAAci6qHkUdERUYAAAWgAAAAIwAAACQAYABXR1BPUwAABhQAAAAuAAAANuAY7+xHU1VCAAAFxAAAAFAAAABm2fPczU9TLzIAAAHcAAAASgAAAGBP9V5RY21hcAAAAkQAAACIAAABYt6F0cBjdnQgAAACzAAAAAQAAAAEABEBRGdhc3AAAAWYAAAACAAAAAj//wADZ2x5ZgAAAywAAADMAAAD2MHtryVoZWFkAAABbAAAADAAAAA2E2+eoWhoZWEAAAGcAAAAHwAAACQC9gDzaG10eAAAAigAAAAZAAAArgJkABFsb2NhAAAC0AAAAFoAAABaFQAUGG1heHAAAAG8AAAAHwAAACAAcABAbmFtZQAAA/gAAAE5AAACXvFdBwlwb3N0AAAFNAAAAGIAAACE5s74hXjaY2BkYGAAYpf5Hu/j+W2+MnAzMYDAzaX6QjD6/4//Bxj5GA8AuRwMYGkAPywL13jaY2BkYGA88P8Agx4j+/8fQDYfA1AEBWgDAIB2BOoAeNpjYGRgYNBh4GdgYgABEMnIABJzYNADCQAACWgAsQB42mNgYfzCOIGBlYGB0YcxjYGBwR1Kf2WQZGhhYGBiYGVmgAFGBiQQkOaawtDAoMBQxXjg/wEGPcYDDA4wNUA2CCgwsAAAO4EL6gAAeNpj2M0gyAACqxgGNWBkZ2D4/wMA+xkDdgAAAHjaY2BgYGaAYBkGRgYQiAHyGMF8FgYHIM3DwMHABGQrMOgyWDLEM1T9/w8UBfEMgLzE////P/5//f/V/xv+r4eaAAeMbAxwIUYmIMHEgKYAYjUcsDAwsLKxc3BycfPw8jEQA/gZBASFhEVExcQlJKWkZWTl5BUUlZRVVNXUNTQZBgMAAMR+E+gAEQFEAAAAKgAqACoANAA+AEgAUgBcAGYAcAB6AIQAjgCYAKIArAC2AMAAygDUAN4A6ADyAPwBBgEQARoBJAEuATgBQgFMAVYBYAFqAXQBfgGIAZIBnAGmAbIBzgHsAAB42u2NMQ6CUAyGW568x9AneYYgm4MJbhKFaExIOAVX8ApewSt4Bic4AfeAid3VOBixDxfPYEza5O+Xfi04YADggiUIULCuEJK8VhO4bSvpdnktHI5QCYtdi2sl8ZnXaHlqUrNKzdKcT8cjlq+rwZSvIVczNiezsfnP/uznmfPFBNODM2K7MTQ45YEAZqGP81AmGGcF3iPqOop0r1SPTaTbVkfUe4HXj97wYE+yNwWYxwWu4v1ugWHgo3S1XdZEVqWM7ET0cfnLGxWfkgR42o2PvWrDMBSFj/IHLaF0zKjRgdiVMwScNRAoWUoH78Y2icB/yIY09An6AH2Bdu/UB+yxopYshQiEvnvu0dURgDt8QeC8PDw7Fpji3fEA4z/PEJ6YOB5hKh4dj3EvXhxPqH/SKUY3rJ7srZ4FZnh1PMAtPhwP6fl2PMJMPDgeQ4rY8YT6Gzao0eAEA409DuggmTnFnOcSCiEiLMgxCiTI6Cq5DZUd3Qmp10vO0LaLTd2cjN4fOumlc7lUYbSQcZFkutRG7g6JKZKy0RmdLY680CDnEJ+UMkpFFe1RN7nxdVpXrC4aTtnaurOnYercZg2YVmLN/d/gczfEimrE/fs/bOuq29Zmn8tloORaXgZgGa78yO9/cnXm2BpaGvq25Dv9S4E9+5SIc9PqupJKhYFSSl47+Qcr1mYNAAAAeNptw0cKwkAAAMDZJA8Q7OUJvkLsPfZ6zFVERPy8qHh2YER+3i/BP83vIBLLySsoKimrqKqpa2hp6+jq6RsYGhmbmJqZSy0sraxtbO3sHRydnEMU4uR6yx7JJXveP7WrDycAAAAAAAH//wACeNpjYGRgYOABYhkgZgJCZgZNBkYGLQZtIJsFLMYAAAw3ALgAeNolizEKgDAQBCchRbC2sFER0YD6qVQiBCv/H9ezGI6Z5XBAw8CBK/m5iQQVauVbXLnOrMZv2oLdKFa8Pjuru2hJzGabmOSLzNMzvutpB3N42mNgZGBg4GKQYzBhYMxJLMlj4GBgAYow/P/PAJJhLM6sSoWKfWCAAwDAjgbRAAB42mNgYGBkAIIbCZo5IPrmUn0hGA0AO8EFTQAA');font-weight:400;font-style:normal}";
let ws = !0;
const ys = (e, t) => {
  let r = document.querySelector("style#swiper-element-styles");
  const a = r && r.preInit && !e;
  !e &&
    t &&
    t.cssLinks().forEach((e) => {
      const t = document.createElement("link");
      (t.rel = "stylesheet"), (t.href = e), document.head.prepend(t);
    }),
    (r && !a) ||
      ((r = r || document.createElement("style")),
      (r.textContent = [bs, t ? t.cssStyles() : ""].join("\n")),
      (r.id = "swiper-element-styles"),
      (r.preInit = e),
      document.head.prepend(r));
};
const Es =
  "undefined" == typeof window || "undefined" == typeof HTMLElement
    ? class {}
    : HTMLElement;
class Cs extends Es {
  constructor() {
    super(),
      (this.tempDiv = document.createElement("div")),
      (this.shadowEl = this.attachShadow({ mode: "open" }));
  }
  cssStyles() {
    return [
      ws
        ? ":root{--swiper-theme-color:#007aff}.swiper,swiper-container{margin-left:auto;margin-right:auto;position:relative;overflow:hidden;list-style:none;padding:0;z-index:1;display:block}:host(.swiper-vertical)>.swiper-wrapper{flex-direction:column}.swiper-wrapper{position:relative;width:100%;height:100%;z-index:1;display:flex;transition-property:transform;transition-timing-function:var(--swiper-wrapper-transition-timing-function,initial);box-sizing:content-box}.swiper-android swiper-slide,.swiper-wrapper{transform:translate3d(0px,0,0)}.swiper-horizontal{touch-action:pan-y}.swiper-vertical{touch-action:pan-x}swiper-slide{flex-shrink:0;width:100%;height:100%;position:relative;transition-property:transform;display:block}.swiper-slide-invisible-blank{visibility:hidden}.swiper-autoheight,.swiper-autoheight swiper-slide{height:auto}:host(.swiper-autoheight) .swiper-wrapper{align-items:flex-start;transition-property:transform,height}.swiper-backface-hidden swiper-slide{transform:translateZ(0);-webkit-backface-visibility:hidden;backface-visibility:hidden}:host(.swiper-3d.swiper-css-mode) .swiper-wrapper{perspective:1200px}:host(.swiper-3d) .swiper-wrapper{transform-style:preserve-3d}.swiper-3d{perspective:1200px}.swiper-3d .swiper-cube-shadow,.swiper-3d .swiper-slide-shadow,.swiper-3d .swiper-slide-shadow-bottom,.swiper-3d .swiper-slide-shadow-left,.swiper-3d .swiper-slide-shadow-right,.swiper-3d .swiper-slide-shadow-top,.swiper-3d swiper-slide{transform-style:preserve-3d}.swiper-3d .swiper-slide-shadow,.swiper-3d .swiper-slide-shadow-bottom,.swiper-3d .swiper-slide-shadow-left,.swiper-3d .swiper-slide-shadow-right,.swiper-3d .swiper-slide-shadow-top{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:10}.swiper-3d .swiper-slide-shadow{background:rgba(0,0,0,.15)}.swiper-3d .swiper-slide-shadow-left{background-image:linear-gradient(to left,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-3d .swiper-slide-shadow-right{background-image:linear-gradient(to right,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-3d .swiper-slide-shadow-top{background-image:linear-gradient(to top,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-3d .swiper-slide-shadow-bottom{background-image:linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))}:host(.swiper-css-mode)>.swiper-wrapper{overflow:auto;scrollbar-width:none;-ms-overflow-style:none}:host(.swiper-css-mode)>.swiper-wrapper::-webkit-scrollbar{display:none}.swiper-css-mode>swiper-slide{scroll-snap-align:start start}:host(.swiper-horizontal.swiper-css-mode)>.swiper-wrapper{scroll-snap-type:x mandatory}:host(.swiper-vertical.swiper-css-mode)>.swiper-wrapper{scroll-snap-type:y mandatory}:host(.swiper-centered)>.swiper-wrapper::before{content:'';flex-shrink:0;order:9999}.swiper-centered>swiper-slide{scroll-snap-align:center center;scroll-snap-stop:always}.swiper-centered.swiper-horizontal>swiper-slide:first-child{margin-inline-start:var(--swiper-centered-offset-before)}:host(.swiper-centered.swiper-horizontal)>.swiper-wrapper::before{height:100%;min-height:1px;width:var(--swiper-centered-offset-after)}.swiper-centered.swiper-vertical>swiper-slide:first-child{margin-block-start:var(--swiper-centered-offset-before)}:host(.swiper-centered.swiper-vertical)>.swiper-wrapper::before{width:100%;min-width:1px;height:var(--swiper-centered-offset-after)}.swiper-lazy-preloader{width:42px;height:42px;position:absolute;left:50%;top:50%;margin-left:-21px;margin-top:-21px;z-index:10;transform-origin:50%;box-sizing:border-box;border:4px solid var(--swiper-preloader-color,var(--swiper-theme-color));border-radius:50%;border-top-color:transparent}.swiper-watch-progress .swiper-slide-visible .swiper-lazy-preloader,.swiper:not(.swiper-watch-progress) .swiper-lazy-preloader,swiper-container:not(.swiper-watch-progress) .swiper-lazy-preloader{animation:swiper-preloader-spin 1s infinite linear}.swiper-lazy-preloader-white{--swiper-preloader-color:#fff}.swiper-lazy-preloader-black{--swiper-preloader-color:#000}@keyframes swiper-preloader-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.swiper-virtual swiper-slide{-webkit-backface-visibility:hidden;transform:translateZ(0)}:host(.swiper-virtual.swiper-css-mode) .swiper-wrapper::after{content:'';position:absolute;left:0;top:0;pointer-events:none}:host(.swiper-virtual.swiper-css-mode.swiper-horizontal) .swiper-wrapper::after{height:1px;width:var(--swiper-virtual-size)}:host(.swiper-virtual.swiper-css-mode.swiper-vertical) .swiper-wrapper::after{width:1px;height:var(--swiper-virtual-size)}:root{--swiper-navigation-size:44px}.swiper-button-next,.swiper-button-prev{position:absolute;top:var(--swiper-navigation-top-offset,50%);width:calc(var(--swiper-navigation-size)/ 44 * 27);height:var(--swiper-navigation-size);margin-top:calc(0px - (var(--swiper-navigation-size)/ 2));z-index:10;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--swiper-navigation-color,var(--swiper-theme-color))}.swiper-button-next.swiper-button-disabled,.swiper-button-prev.swiper-button-disabled{opacity:.35;cursor:auto;pointer-events:none}.swiper-button-next.swiper-button-hidden,.swiper-button-prev.swiper-button-hidden{opacity:0;cursor:auto;pointer-events:none}.swiper-navigation-disabled .swiper-button-next,.swiper-navigation-disabled .swiper-button-prev{display:none!important}.swiper-button-next:after,.swiper-button-prev:after{font-family:swiper-icons;font-size:var(--swiper-navigation-size);text-transform:none!important;letter-spacing:0;font-variant:initial;line-height:1}.swiper-button-prev,:host(.swiper-rtl) .swiper-button-next{left:var(--swiper-navigation-sides-offset,10px);right:auto}.swiper-button-prev:after,:host(.swiper-rtl) .swiper-button-next:after{content:'prev'}.swiper-button-next,:host(.swiper-rtl) .swiper-button-prev{right:var(--swiper-navigation-sides-offset,10px);left:auto}.swiper-button-next:after,:host(.swiper-rtl) .swiper-button-prev:after{content:'next'}.swiper-button-lock{display:none}.swiper-pagination{position:absolute;text-align:center;transition:.3s opacity;transform:translate3d(0,0,0);z-index:10}.swiper-pagination.swiper-pagination-hidden{opacity:0}.swiper-pagination-disabled>.swiper-pagination,.swiper-pagination.swiper-pagination-disabled{display:none!important}.swiper-horizontal>.swiper-pagination-bullets,.swiper-pagination-bullets.swiper-pagination-horizontal,.swiper-pagination-custom,.swiper-pagination-fraction{bottom:var(--swiper-pagination-bottom,8px);top:var(--swiper-pagination-top,auto);left:0;width:100%}.swiper-pagination-bullets-dynamic{overflow:hidden;font-size:0}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transform:scale(.33);position:relative}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active{transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main{transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev{transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev{transform:scale(.33)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next{transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next{transform:scale(.33)}.swiper-pagination-bullet{width:var(--swiper-pagination-bullet-width,var(--swiper-pagination-bullet-size,8px));height:var(--swiper-pagination-bullet-height,var(--swiper-pagination-bullet-size,8px));display:inline-block;border-radius:var(--swiper-pagination-bullet-border-radius,50%);background:var(--swiper-pagination-bullet-inactive-color,#000);opacity:var(--swiper-pagination-bullet-inactive-opacity, .2)}button.swiper-pagination-bullet{border:none;margin:0;padding:0;box-shadow:none;-webkit-appearance:none;appearance:none}.swiper-pagination-clickable .swiper-pagination-bullet{cursor:pointer}.swiper-pagination-bullet:only-child{display:none!important}.swiper-pagination-bullet-active{opacity:var(--swiper-pagination-bullet-opacity, 1);background:var(--swiper-pagination-color,var(--swiper-theme-color))}.swiper-pagination-vertical.swiper-pagination-bullets,.swiper-vertical>.swiper-pagination-bullets{right:var(--swiper-pagination-right,8px);left:var(--swiper-pagination-left,auto);top:50%;transform:translate3d(0px,-50%,0)}.swiper-pagination-vertical.swiper-pagination-bullets .swiper-pagination-bullet,.swiper-vertical>.swiper-pagination-bullets .swiper-pagination-bullet{margin:var(--swiper-pagination-bullet-vertical-gap,6px) 0;display:block}.swiper-pagination-vertical.swiper-pagination-bullets.swiper-pagination-bullets-dynamic,.swiper-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{top:50%;transform:translateY(-50%);width:8px}.swiper-pagination-vertical.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet,.swiper-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{display:inline-block;transition:.2s transform,.2s top}.swiper-horizontal>.swiper-pagination-bullets .swiper-pagination-bullet,.swiper-pagination-horizontal.swiper-pagination-bullets .swiper-pagination-bullet{margin:0 var(--swiper-pagination-bullet-horizontal-gap,4px)}.swiper-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic,.swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{left:50%;transform:translateX(-50%);white-space:nowrap}.swiper-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet,.swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transition:.2s transform,.2s left}.swiper-horizontal.swiper-rtl>.swiper-pagination-bullets-dynamic .swiper-pagination-bullet,:host(.swiper-horizontal.swiper-rtl) .swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transition:.2s transform,.2s right}.swiper-pagination-fraction{color:var(--swiper-pagination-fraction-color,inherit)}.swiper-pagination-progressbar{background:var(--swiper-pagination-progressbar-bg-color,rgba(0,0,0,.25));position:absolute}.swiper-pagination-progressbar .swiper-pagination-progressbar-fill{background:var(--swiper-pagination-color,var(--swiper-theme-color));position:absolute;left:0;top:0;width:100%;height:100%;transform:scale(0);transform-origin:left top}:host(.swiper-rtl) .swiper-pagination-progressbar .swiper-pagination-progressbar-fill{transform-origin:right top}.swiper-horizontal>.swiper-pagination-progressbar,.swiper-pagination-progressbar.swiper-pagination-horizontal,.swiper-pagination-progressbar.swiper-pagination-vertical.swiper-pagination-progressbar-opposite,.swiper-vertical>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite{width:100%;height:var(--swiper-pagination-progressbar-size,4px);left:0;top:0}.swiper-horizontal>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite,.swiper-pagination-progressbar.swiper-pagination-horizontal.swiper-pagination-progressbar-opposite,.swiper-pagination-progressbar.swiper-pagination-vertical,.swiper-vertical>.swiper-pagination-progressbar{width:var(--swiper-pagination-progressbar-size,4px);height:100%;left:0;top:0}.swiper-pagination-lock{display:none}.swiper-scrollbar{border-radius:var(--swiper-scrollbar-border-radius,10px);position:relative;-ms-touch-action:none;background:var(--swiper-scrollbar-bg-color,rgba(0,0,0,.1))}.swiper-scrollbar-disabled>.swiper-scrollbar,.swiper-scrollbar.swiper-scrollbar-disabled{display:none!important}.swiper-horizontal>.swiper-scrollbar,.swiper-scrollbar.swiper-scrollbar-horizontal{position:absolute;left:var(--swiper-scrollbar-sides-offset,1%);bottom:var(--swiper-scrollbar-bottom,4px);top:var(--swiper-scrollbar-top,auto);z-index:50;height:var(--swiper-scrollbar-size,4px);width:calc(100% - 2 * var(--swiper-scrollbar-sides-offset,1%))}.swiper-scrollbar.swiper-scrollbar-vertical,.swiper-vertical>.swiper-scrollbar{position:absolute;left:var(--swiper-scrollbar-left,auto);right:var(--swiper-scrollbar-right,4px);top:var(--swiper-scrollbar-sides-offset,1%);z-index:50;width:var(--swiper-scrollbar-size,4px);height:calc(100% - 2 * var(--swiper-scrollbar-sides-offset,1%))}.swiper-scrollbar-drag{height:100%;width:100%;position:relative;background:var(--swiper-scrollbar-drag-bg-color,rgba(0,0,0,.5));border-radius:var(--swiper-scrollbar-border-radius,10px);left:0;top:0}.swiper-scrollbar-cursor-drag{cursor:move}.swiper-scrollbar-lock{display:none}.swiper-zoom-container{width:100%;height:100%;display:flex;justify-content:center;align-items:center;text-align:center}.swiper-zoom-container>canvas,.swiper-zoom-container>img,.swiper-zoom-container>svg{max-width:100%;max-height:100%;object-fit:contain}.swiper-slide-zoomed{cursor:move;touch-action:none}.swiper .swiper-notification,swiper-container .swiper-notification{position:absolute;left:0;top:0;pointer-events:none;opacity:0;z-index:-1000}:host(.swiper-free-mode)>.swiper-wrapper{transition-timing-function:ease-out;margin:0 auto}:host(.swiper-grid)>.swiper-wrapper{flex-wrap:wrap}:host(.swiper-grid-column)>.swiper-wrapper{flex-wrap:wrap;flex-direction:column}.swiper-fade.swiper-free-mode swiper-slide{transition-timing-function:ease-out}.swiper-fade swiper-slide{pointer-events:none;transition-property:opacity}.swiper-fade swiper-slide swiper-slide{pointer-events:none}.swiper-fade .swiper-slide-active,.swiper-fade .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-cube{overflow:visible}.swiper-cube swiper-slide{pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1;visibility:hidden;transform-origin:0 0;width:100%;height:100%}.swiper-cube swiper-slide swiper-slide{pointer-events:none}.swiper-cube.swiper-rtl swiper-slide{transform-origin:100% 0}.swiper-cube .swiper-slide-active,.swiper-cube .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-cube .swiper-slide-active,.swiper-cube .swiper-slide-next,.swiper-cube .swiper-slide-prev,.swiper-cube swiper-slide-next+swiper-slide{pointer-events:auto;visibility:visible}.swiper-cube .swiper-slide-shadow-bottom,.swiper-cube .swiper-slide-shadow-left,.swiper-cube .swiper-slide-shadow-right,.swiper-cube .swiper-slide-shadow-top{z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}.swiper-cube .swiper-cube-shadow{position:absolute;left:0;bottom:0px;width:100%;height:100%;opacity:.6;z-index:0}.swiper-cube .swiper-cube-shadow:before{content:'';background:#000;position:absolute;left:0;top:0;bottom:0;right:0;filter:blur(50px)}.swiper-flip{overflow:visible}.swiper-flip swiper-slide{pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1}.swiper-flip swiper-slide swiper-slide{pointer-events:none}.swiper-flip .swiper-slide-active,.swiper-flip .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-flip .swiper-slide-shadow-bottom,.swiper-flip .swiper-slide-shadow-left,.swiper-flip .swiper-slide-shadow-right,.swiper-flip .swiper-slide-shadow-top{z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}.swiper-creative swiper-slide{-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden;transition-property:transform,opacity,height}.swiper-cards{overflow:visible}.swiper-cards swiper-slide{transform-origin:center bottom;-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden}"
        : "",
      ...(this.injectStyles && Array.isArray(this.injectStyles)
        ? this.injectStyles
        : []),
    ].join("\n");
  }
  cssLinks() {
    return this.injectStylesUrls || [];
  }
  render() {
    ws && ys(!1, this);
    const e = this.cssStyles();
    e.length &&
      ((this.stylesEl = document.createElement("style")),
      (this.stylesEl.textContent = e),
      this.shadowEl.appendChild(this.stylesEl)),
      this.cssLinks().forEach((e) => {
        if (document.querySelector(`link[href="${e}"]`)) return;
        const t = document.createElement("link");
        (t.rel = "stylesheet"), (t.href = e), this.shadowEl.appendChild(t);
      }),
      (this.tempDiv.innerHTML = `\n      <slot name="container-start"></slot>\n      <div class="swiper-wrapper">\n        <slot></slot>\n      </div>\n      <slot name="container-end"></slot>\n      ${
        (function (e = {}) {
          return (
            e.navigation &&
            void 0 === e.navigation.nextEl &&
            void 0 === e.navigation.prevEl
          );
        })(this.passedParams)
          ? '\n        <div class="swiper-button-prev"></div>\n        <div class="swiper-button-next"></div>\n      '
          : ""
      }\n      ${
        (function (e = {}) {
          return e.pagination && void 0 === e.pagination.el;
        })(this.passedParams)
          ? '\n        <div class="swiper-pagination"></div>\n      '
          : ""
      }\n      ${
        (function (e = {}) {
          return e.scrollbar && void 0 === e.scrollbar.el;
        })(this.passedParams)
          ? '\n        <div class="swiper-scrollbar"></div>\n      '
          : ""
      }\n    `),
      [...this.tempDiv.children].forEach((e) => {
        this.shadowEl.appendChild(e);
      });
  }
  initialize() {
    if (this.initialized) return;
    this.initialized = !0;
    const { params: e, passedParams: t } = gs(this);
    (this.swiperParams = e),
      (this.passedParams = t),
      delete this.swiperParams.init,
      this.render(),
      (this.swiper = new Ka(
        this,
        l(
          o(
            l(o({}, e), { touchEventsTarget: "container" }),
            e.virtual ? {} : { observer: !0 }
          ),
          {
            onAny: (t, ...r) => {
              const a = e.eventsPrefix
                  ? `${e.eventsPrefix}${t.toLowerCase()}`
                  : t.toLowerCase(),
                s = new CustomEvent(a, {
                  detail: r,
                  bubbles: !0,
                  cancelable: !0,
                });
              this.dispatchEvent(s);
            },
          }
        )
      ));
  }
  connectedCallback() {
    !1 !== this.init && "false" !== this.getAttribute("init")
      ? this.initialize()
      : ys(!0, this);
  }
  disconnectedCallback() {
    this.swiper && this.swiper.destroy && this.swiper.destroy(),
      (this.initialized = !1);
  }
  updateSwiperOnPropChange(e) {
    const { params: t, passedParams: r } = gs(this);
    (this.passedParams = r),
      (this.swiperParams = t),
      vs(
        o(
          o(
            o(
              {
                swiper: this.swiper,
                passedParams: this.passedParams,
                changedParams: [hs(e)],
              },
              "navigation" === e && r[e]
                ? {
                    prevEl: ".swiper-button-prev",
                    nextEl: ".swiper-button-next",
                  }
                : {}
            ),
            "pagination" === e && r[e]
              ? { paginationEl: ".swiper-pagination" }
              : {}
          ),
          "scrollbar" === e && r[e] ? { scrollbarEl: ".swiper-scrollbar" } : {}
        )
      );
  }
  attributeChangedCallback(e, t, r) {
    this.initialized && this.updateSwiperOnPropChange(e, r);
  }
  static get observedAttributes() {
    return ps
      .filter((e) => e.includes("_"))
      .map((e) =>
        e
          .replace(/[A-Z]/g, (e) => `-${e}`)
          .replace("_", "")
          .toLowerCase()
      );
  }
}
ps.forEach((e) => {
  "init" !== e &&
    ((e = e.replace("_", "")),
    Object.defineProperty(Cs.prototype, e, {
      get() {
        return (this.passedParams || {})[e];
      },
      set(t) {
        this.passedParams || (this.passedParams = {}),
          (this.passedParams[e] = t),
          this.initialized && this.updateSwiperOnPropChange(e, t);
      },
    }));
});
class xs extends Es {
  constructor() {
    super(),
      (this.tempDiv = document.createElement("div")),
      (this.shadowEl = this.attachShadow({ mode: "open" }));
  }
  render() {
    const e =
      this.lazy ||
      "" === this.getAttribute("lazy") ||
      "true" === this.getAttribute("lazy");
    if (
      ((this.tempDiv.innerHTML = "<slot />"),
      [...this.tempDiv.children].forEach((e) => {
        this.shadowEl.appendChild(e);
      }),
      e)
    ) {
      const e = document.createElement("div");
      e.classList.add("swiper-lazy-preloader"), this.appendChild(e);
    }
  }
  initialize() {
    this.render();
  }
  connectedCallback() {
    this.initialize();
  }
}
function Ss(e) {
  const t = this,
    r = F(e);
  if (0 === r.length) return;
  const a = r[0].swiper && r[0].swiper.isElement;
  if (r[0].swiper && !r[0].swiper.isElement) return;
  let s,
    n,
    i,
    o = {};
  r.hasClass("tabs") &&
    ((s = r.children("swiper-slide").indexOf(r.children(".tab-active")[0])),
    (n = !0),
    (i = r.find(".tabs-routable").length > 0)),
    r.attr("data-swiper")
      ? (o = JSON.parse(r.attr("data-swiper")))
      : r[0].f7SwiperParams
      ? (o = r[0].f7SwiperParams)
      : ((o = r.dataset()),
        Object.keys(o).forEach((e) => {
          const t = o[e];
          if (
            "string" == typeof t &&
            0 === t.indexOf("{") &&
            t.indexOf("}") > 0
          )
            try {
              o[e] = JSON.parse(t);
            } catch (r) {}
        })),
    void 0 === o.initialSlide && void 0 !== s && (o.initialSlide = s);
  const l = a ? r[0].swiper : t.swiper.create(r[0], o);
  function c() {
    l.update();
  }
  a && l.slideTo(s, 0);
  const p = r
    .parents(".tab")
    .filter(
      (e) =>
        0 ===
        F(e)
          .parent(".tabs")
          .parent(".tabs-animated-wrap, swiper-container.tabs").length
    )
    .eq(0);
  r
    .parents(".popup, .login-screen, .sheet-modal, .popover")
    .on("modal:open", c),
    r.parents(".panel").on("panel:open", c),
    p && p.length && p.on("tab:show", c),
    l.on("beforeDestroy", () => {
      r
        .parents(".popup, .login-screen, .sheet-modal, .popover")
        .off("modal:open", c),
        r.parents(".panel").off("panel:open", c),
        p && p.length && p.off("tab:show", c);
    }),
    n &&
      l.on("slideChange", () => {
        if (i) {
          let e = t.views.get(r.parents(".view"));
          e || (e = t.views.main);
          const a = e.router,
            s = a.findTabRouteUrl(F(l.slides).eq(l.activeIndex)[0]);
          s &&
            setTimeout(() => {
              a.navigate(s);
            }, 0);
        } else t.tab.show({ tabEl: F(l.slides).eq(l.activeIndex) });
      });
}
"undefined" != typeof window &&
  (window.SwiperElementRegisterParams = (e) => {
    ps.push(...e);
  }),
  ((e = !0) => {
    "undefined" != typeof window &&
      (e || (ws = !1),
      ws && ys(!0),
      window.customElements.get("swiper-container") ||
        window.customElements.define("swiper-container", Cs),
      window.customElements.get("swiper-slide") ||
        window.customElements.define("swiper-slide", xs));
  })();
var ks = {
    name: "swiper",
    static: { Swiper: Ka },
    create() {
      this.swiper = Je({
        defaultSelector: ".swiper",
        constructor: Ka,
        domProp: "swiper",
      });
    },
    on: {
      pageMounted(e) {
        const t = this;
        e.$el.find("swiper-container.tabs").each((e) => {
          Ss.call(t, e);
        });
      },
      pageInit(e) {
        const t = this;
        e.$el.find("swiper-container.tabs").each((e) => {
          Ss.call(t, e);
        });
      },
      pageReinit(e) {
        const t = this;
        e.$el.find("swiper-container.tabs").each((e) => {
          const r = t.swiper.get(e);
          r && r.update && r.update();
        });
      },
      tabMounted(e) {
        const t = this;
        F(e)
          .find("swiper-container.tabs")
          .each((e) => {
            Ss.call(t, e);
          });
      },
      tabShow(e) {
        const t = this;
        F(e)
          .find("swiper-container.tabs")
          .each((e) => {
            const r = t.swiper.get(e);
            r && r.update && r.update();
          });
      },
      tabBeforeRemove(e) {
        const t = this;
        F(e)
          .find("swiper-container.tabs")
          .each((e) => {
            t.swiper.destroy(e);
          });
      },
    },
  },
  Ts = { name: "typography" };
export {
  Er as $,
  ra as C,
  st as F,
  ta as I,
  Kr as P,
  aa as R,
  na as S,
  Jr as T,
  oa as a,
  ks as b,
  Ts as c,
  Lr as d,
  b as e,
};
