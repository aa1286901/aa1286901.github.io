import { $ as e } from "./vendor.js";
function i(i, { $f7: t, $el: a, $store: l, $update: s }) {
  const { cart: n, cartTotal: c } = l.getters;
  let r = "",
    o = "",
    d = "",
    m = "card",
    p = !1;
  const u = (e) => {
      (m = e), s();
    },
    v = () => {
      t.input.validateInputs(a.value.find("form")) &&
        (console.log({
          name: r,
          address: o,
          tel: d,
          payment: m,
          cart: [...n.value],
        }),
        l.dispatch("emptyCart"),
        (p = !0),
        s());
    };
  return () =>
    e(
      "div",
      { class: "popup popup-push" },
      e(
        "div",
        { class: "view view-init" },
        e(
          "div",
          { class: "page cart-page" },
          e(
            "div",
            { class: "navbar" },
            e("div", { class: "navbar-bg" }),
            e(
              "div",
              { class: "navbar-inner" },
              e("div", { class: "title" }, "Моя корзина"),
              e(
                "div",
                { class: "right" },
                e(
                  "a",
                  { href: "#", class: "link icon-only popup-close" },
                  e("i", { class: "icon f7-icons ios-only" }, "xmark"),
                  e("i", { class: "icon material-icons md-only" }, "close")
                )
              )
            )
          ),
          n.value.length > 0 &&
            e(
              "div",
              { class: "fab fab-extended fab-center-bottom" },
              e(
                "a",
                { key: "add-to-cart", href: "#", onClick: v },
                e(
                  "span",
                  { class: "fab-text" },
                  e(
                    "span",
                    null,
                    "delivery" === m ? "Оформить заказ" : "Перейти к оплате"
                  ),
                  e("span", null, c.value, " руб.")
                )
              )
            ),
          e(
            "div",
            { class: "page-content" },
            p
              ? e(
                  "div",
                  { class: "block block-strong inset cart-order-success" },
                  e(
                    "p",
                    null,
                    e("i", { class: "icon f7-icons" }, "checkmark_circle_fill")
                  ),
                  e("h1", null, e("b", null, "Спасибо за заказ!")),
                  e(
                    "p",
                    null,
                    "В настоящее время мы обрабатываем ваш заказ и доставим его как можно скорее"
                  )
                )
              : 0 === n.value.length
              ? e("div", { class: "block" }, "Ваша корзина пуста.")
              : e(
                  "Fragment",
                  null,
                  e(
                    "div",
                    { class: "list inset cart-items-list media-list" },
                    e(
                      "ul",
                      null,
                      n.value.map((i) =>
                        e(
                          "li",
                          { key: i.item.id, class: "item-content" },
                          e(
                            "div",
                            { class: "item-media" },
                            e("img", { src: i.item.image })
                          ),
                          e(
                            "div",
                            { class: "item-inner" },
                            e(
                              "div",
                              { class: "item-title-row" },
                              e("div", { class: "item-title" }, i.item.title),
                              e(
                                "div",
                                { class: "item-after item-price" },
                                i.item.price,
                                " руб."
                              )
                            ),
                            e(
                              "div",
                              { class: "item-stepper" },
                              e(
                                "div",
                                {
                                  class:
                                    "stepper stepper-init stepper-round stepper-fill",
                                  "data-value": i.quantity,
                                  onStepperChange: (e) =>
                                    ((e, i) => {
                                      const t = e.detail;
                                      l.dispatch("updateCartQuanity", {
                                        quantity: t,
                                        obj: i,
                                      });
                                    })(e, i),
                                },
                                e("div", { class: "stepper-button-minus" }),
                                e(
                                  "div",
                                  { class: "stepper-value" },
                                  i.quantity
                                ),
                                e("div", { class: "stepper-button-plus" })
                              )
                            )
                          )
                        )
                      )
                    )
                  ),
                  e(
                    "div",
                    { class: "block-title block-title-medium" },
                    "Доставка"
                  ),
                  e(
                    "form",
                    { class: "list cart-inputs-list inset-ios" },
                    e(
                      "ul",
                      null,
                      e(
                        "li",
                        { class: "item-content item-input" },
                        e(
                          "div",
                          { class: "item-inner" },
                          e("div", { class: "item-title item-label" }, "Имя"),
                          e(
                            "div",
                            { class: "item-input-wrap" },
                            e("input", {
                              type: "text",
                              name: "name",
                              placeholder: "На кого оформить заказ?",
                              required: !0,
                              onInput: (e) => {
                                r = e.target.value;
                              },
                            })
                          )
                        )
                      ),
                      e(
                        "li",
                        { class: "item-content item-input" },
                        e(
                          "div",
                          { class: "item-inner" },
                          e(
                            "div",
                            { class: "item-title item-label" },
                            "Адрес"
                          ),
                          e(
                            "div",
                            { class: "item-input-wrap" },
                            e("input", {
                              type: "text",
                              name: "address",
                              placeholder: "Куда доставить?",
                              required: !0,
                              onInput: (e) => {
                                o = e.target.value;
                              },
                            })
                          )
                        )
                      ),
                      e(
                        "li",
                        { class: "item-content item-input" },
                        e(
                          "div",
                          { class: "item-inner" },
                          e(
                            "div",
                            { class: "item-title item-label" },
                            "Номер телефон"
                          ),
                          e(
                            "div",
                            { class: "item-input-wrap" },
                            e("input", {
                              type: "tel",
                              name: "tel",
                              placeholder: "Как с Вами связаться?",
                              required: !0,
                              onInput: (e) => {
                                d = e.target.value;
                              },
                            })
                          )
                        )
                      )
                    )
                  ),
                  e(
                    "div",
                    { class: "block-title block-title-medium" },
                    "Оплата"
                  ),
                  e(
                    "div",
                    { class: "list cart-payment-list inset" },
                    e(
                      "ul",
                      null,
                      /*e(
                        "li",
                        null,
                        e(
                          "label",
                          {
                            class:
                              "item-radio item-radio-icon-start item-content",
                          },
                          e("input", {
                            type: "radio",
                            name: "payment",
                            value: "card",
                            checked: !0,
                            onChange: (e) => {
                              u(e.target.value);
                            },
                          }),
                          e("i", { class: "icon icon-radio" }),
                          e(
                            "div",
                            { class: "item-media" },
                            e(
                              "i",
                              { class: "icon f7-icons ios-only" },
                              "creditcard_fill"
                            ),
                            e(
                              "i",
                              { class: "icon material-icons md-only" },
                              "credit_card"
                            )
                          ),
                          e(
                            "div",
                            { class: "item-inner" },
                            e("div", { class: "item-title" }, "Credit Card")
                          )
                        )
                      ),
                      e(
                        "li",
                        null,
                        e(
                          "label",
                          {
                            class:
                              "item-radio item-radio-icon-start item-content",
                          },
                          e("input", {
                            type: "radio",
                            name: "payment",
                            value: "apple",
                            onChange: (e) => {
                              u(e.target.value);
                            },
                          }),
                          e("i", { class: "icon icon-radio" }),
                          e(
                            "div",
                            { class: "item-media" },
                            e("i", { class: "icon f7-icons" }, "logo_apple")
                          ),
                          e(
                            "div",
                            { class: "item-inner" },
                            e("div", { class: "item-title" }, "Apple Pay")
                          )
                        )
                      ),*/
                      e(
                        "li",
                        null,
                        e(
                          "label",
                          {
                            class:
                              "item-radio item-radio-icon-start item-content",
                          },
                          e("input", {
                            type: "radio",
                            name: "payment",
                            value: "delivery",
                            onChange: (e) => {
                              u(e.target.value);
                            },
                          }),
                          e("i", { class: "icon icon-radio" }),
                          e(
                            "div",
                            { class: "item-media" },
                            e(
                              "i",
                              { class: "icon f7-icons ios-only" },
                              "shippingbox_fill"
                            ),
                            e(
                              "i",
                              { class: "icon material-icons md-only" },
                              "local_shipping"
                            )
                          ),
                          e(
                            "div",
                            { class: "item-inner" },
                            e("div", { class: "item-title" }, "Оплата курьеру")
                          )
                        )
                      )
                    )
                  )
                )
          )
        )
      )
    );
}
export { i as default };
