import { $ as a } from "./vendor.js";
function i(i, { $f7: e, $theme: s, $store: t, $el: c }) {
  const { item: l } = i,
    { cart: n } = t.getters,
    o = () => {
      const { scrollTop: a } = c.value.find(".page-content")[0],
        i = 1 + (a / 375) * 0.15;
      c.value.find(".item-page-header img").css({ transform: `scale(${i})` });
    },
    r = () => {
      t.dispatch("addToCart", { item: l }),
        e.toast
          .create({
            text: `${l.title} добавлен в корзину`,
            destroyOnClose: !0,
            closeTimeout: 2e3,
            horizontalPosition: "center",
            position: "center",
            icon: s.ios
              ? '<i class="icon f7-icons">cart_fill_badge_plus</i>'
              : '<i class="icon material-icons">add_shopping_cart</i>',
          })
          .open();
    };
  return () =>
    a(
      "div",
      { class: "popup popup-push" },
      a(
        "div",
        { class: "view view-init" },
        a(
          "div",
          { class: "page item-page" },
          a(
            "div",
            { class: "navbar" },
            a("div", { class: "navbar-bg" }),
            a(
              "div",
              { class: "navbar-inner" },
              a("div", { class: "title" }, l.title),
              a(
                "div",
                { class: "right" },
                a(
                  "a",
                  { href: "#", class: "link icon-only popup-close" },
                  a("i", { class: "icon f7-icons ios-only" }, "xmark"),
                  a("i", { class: "icon material-icons md-only" }, "close")
                )
              )
            )
          ),
          a(
            "div",
            { class: "fab fab-extended fab-center-bottom" },
            n.value.filter((a) => a.item.id === l.id).length > 0
              ? a(
                  "a",
                  { key: "in-cart", href: "/cart/" },
                  s.ios
                    ? a("i", { class: "icon f7-icons" }, "cart_fill")
                    : a("i", { class: "icon material-icons" }, "shopping_cart"),
                  a("span", { class: "fab-text" }, a("span", null, "Уже в корзине"))
                )
              : a(
                  "a",
                  { key: "add-to-cart", href: "#", onClick: r },
                  a(
                    "span",
                    { class: "fab-text" },
                    a("span", null, "Добавить в корзину"),
                    a("span", null, l.price, " руб.")
                  )
                )
          ),
          a(
            "div",
            { class: "item-page-header" },
            a("img", {
              src: l.image,
              onLoad: (a) => a.target.classList.add("loaded"),
            })
          ),
          a(
            "div",
            { class: "page-content", onPageScroll: o },
            a(
              "div",
              { class: "item-page-content" },
              a(
                "div",
                { class: "block item-page-ingredients" },
                l.ingredients.map((i) => a("span", null, i))
              ),
              a(
                "div",
                { class: "page-title" },
                a("div", { class: "item-page-title" }, l.title),
                a("div", { class: "item-page-price" }, l.price, " руб.")
              ),
              a("div", { class: "block item-page-description" }, l.description)
            )
          )
        )
      )
    );
}
export { i as default };
