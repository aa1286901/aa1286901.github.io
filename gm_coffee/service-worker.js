if (!self.define) {
  const e = (e) => {
      "require" !== e && (e += ".js");
      let a = Promise.resolve();
      return (
        s[e] ||
          (a = new Promise(async (a) => {
            if ("document" in self) {
              const s = document.createElement("script");
              (s.src = e), document.head.appendChild(s), (s.onload = a);
            } else importScripts(e), a();
          })),
        a.then(() => {
          if (!s[e]) throw new Error(`Module ${e} didn’t register its module`);
          return s[e];
        })
      );
    },
    a = (a, s) => {
      Promise.all(a.map(e)).then((e) => s(1 === e.length ? e[0] : e));
    },
    s = { require: Promise.resolve(a) };
  self.define = (a, i, r) => {
    s[a] ||
      (s[a] = Promise.resolve().then(() => {
        let s = {};
        const c = { uri: location.origin + a.slice(1) };
        return Promise.all(
          i.map((a) => {
            switch (a) {
              case "exports":
                return s;
              case "module":
                return c;
              default:
                return e(a);
            }
          })
        ).then((e) => {
          const a = r(...e);
          return s.default || (s.default = a), s;
        });
      }));
  };
}
define("./service-worker.js", ["./workbox-543be79b"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        {
          url: "assets/cart.js",
          revision: "1e63adee2f2019fbd98c482d2869c27d",
        },
        {
          url: "assets/cart.css",
          revision: "19b1e3092415bf80a2b10720517d4566",
        },
        {
          url: "assets/Framework7Icons-Regular.a42aa071.woff2",
          revision: "4a39aba9fb8a2f831fa437780e1a058a",
        },
        {
          url: "assets/Framework7Icons-Regular.eba1e821.woff",
          revision: "d03b787b6492fa2b0141c43fb7e56689",
        },
        {
          url: "assets/index.css",
          revision: "f9a213e4ba6166601a8ca23c0a989f3e",
        },
        {
          url: "assets/index.js",
          revision: "4b11e22c76279e1f7651d105a7fa5d0c",
        },
        {
          url: "assets/item.js",
          revision: "882d3000dd5515f563606cc83f061594",
        },
        {
          url: "assets/item.css",
          revision: "eb160ec5f6b5f482e5172a9f4e7033ab",
        },
        {
          url: "assets/material-icons.75ea7773.woff",
          revision: "2fe4e4645bd07e2af2f93df3460d0e0b",
        },
        {
          url: "assets/material-icons.ff253fe1.woff2",
          revision: "38699e69c673ccadce553bcef499b571",
        },
        {
          url: "assets/vendor.js",
          revision: "16772b44f8883abed8ad6b9b3fdf3149",
        },
        {
          url: "icons/128x128.png",
          revision: "68bf70570aa8a99926f7457580fa09ed",
        },
        {
          url: "icons/144x144.png",
          revision: "ff3d7a843bcdd33a9d255d4fdf8b2f7c",
        },
        {
          url: "icons/152x152.png",
          revision: "e1075dc4da9f3518d5b7b144a9f71d08",
        },
        {
          url: "icons/192x192.png",
          revision: "fafeaacecc2fa2cbfa34ed83cb6f1d10",
        },
        {
          url: "icons/256x256.png",
          revision: "cfc3b305ed01d56cc224b4716c528ba4",
        },
        {
          url: "icons/512x512.png",
          revision: "5b6e8ca47160b60438f8a1a02094c940",
        },
        {
          url: "icons/apple-touch-icon.png",
          revision: "cfc3b305ed01d56cc224b4716c528ba4",
        },
        {
          url: "icons/favicon.png",
          revision: "68bf70570aa8a99926f7457580fa09ed",
        },
        {
          url: "images/catalog/1.jpg",
          revision: "3299a9da4f542b496cf8fbd6d1527de3",
        },
        {
          url: "images/catalog/10.jpg",
          revision: "f03af3c38f105d811f8245a1ac148688",
        },
        {
          url: "images/catalog/2.jpg",
          revision: "d8b7dfbb65c9497b260a433c82051d5c",
        },
        {
          url: "images/catalog/3.jpg",
          revision: "f53324e9006d3eddd37eebe09218deb5",
        },
        {
          url: "images/catalog/4.jpg",
          revision: "8ac7a2940a6c5da724441a0271593eec",
        },
        {
          url: "images/catalog/5.jpg",
          revision: "def598af5eadb3686946baef98bd1c3f",
        },
        {
          url: "images/catalog/6.jpg",
          revision: "1ec4327a24e6a0a3040af1d2fbd62daf",
        },
        {
          url: "images/catalog/7.jpg",
          revision: "ea4fa8737b3c1bb642c22b717f7c279f",
        },
        {
          url: "images/catalog/8.jpg",
          revision: "ced437a10a33d34e117d3302f0d52059",
        },
        {
          url: "images/catalog/9.jpg",
          revision: "329b2b7abbcb9dcd21631cfd8d847acf",
        },
        {
          url: "images/onboarding-cups.png",
          revision: "e414d0302a42d455feec5af77b2c5201",
        },
        {
          url: "images/onboarding-intro.png",
          revision: "3bb4467c2169ae9d7875304f04fb4437",
        },
        { url: "index.html", revision: "41364352c4111d0836721fba11ad2ff4" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    );
});
//# sourceMappingURL=service-worker.js.map
