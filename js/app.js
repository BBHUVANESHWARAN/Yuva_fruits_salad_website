/* =====================================================================
   app.js — renders every section from js/config.js and runs the
   menu, order tray, bowl builder, plans, party form and WhatsApp links.
   You should not need to edit this file. Change js/config.js instead.
   ===================================================================== */
(() => {
  "use strict";

  const C = window.YUVA_CONFIG;
  if (!C) {
    console.error("js/config.js did not load, so the site cannot show the menu.");
    return;
  }
  const B = C.business;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- helpers ---------------- */
  const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

  // Builds an element. Text is always set with textContent (never innerHTML).
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) {
      if (c === null || c === undefined || c === false) continue;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  const waDigits = String(B.whatsapp || "").replace(/\D/g, "");
  function waLink(text) {
    const base = waDigits ? "https://wa.me/" + waDigits : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text);
  }
  // Open WhatsApp from a click/submit handler (keeps the popup allowed).
  function openWhatsApp(text) {
    const url = waLink(text);
    const w = window.open(url, "_blank");
    if (w) w.opener = null;
    else window.location.href = url;
  }
  const isHttpUrl = (u) => /^https:\/\//i.test(String(u || "").trim());

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: ignore */ }
    }
  };

  const GREETING = `Hi ${B.name}!`;

  /* ---------------- offer strip ---------------- */
  function renderOffer() {
    const strip = $("#offer");
    const o = C.offer || {};
    if (!o.show) { strip.hidden = true; return; }
    const parts = [];
    if (o.todaysSpecial) parts.push(el("span", { text: o.todaysSpecial }));
    if (o.firstOrderCode) {
      parts.push(el("span", { class: "offer-code" }, [
        (o.firstOrderText || "First order offer") + " — use code ",
        el("strong", { text: o.firstOrderCode })
      ]));
    }
    $("#offer-text").replaceChildren(...parts);
  }

  /* ---------------- header / nav ---------------- */
  function initNav() {
    const toggle = $("#nav-toggle");
    const nav = $("#site-nav");
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) { close(); toggle.focus(); }
    });
  }

  function initGenericWhatsApp() {
    const text = `${GREETING} I'd like to place an order.`;
    $$("[data-wa-general]").forEach((a) => {
      a.href = waLink(text);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------------- hero bowl ---------------- */
  function initHeroBowl() {
    const holder = $("#hero-bowl");
    const bowl = window.YuvaBowl.create(holder, {
      label: "Illustration: a steel bowl heaped with apple, banana, papaya, watermelon, kiwi, grapes and pomegranate",
      piecesPerFruit: 3
    });
    bowl.setFruits(["watermelon", "papaya", "apple", "banana", "pineapple", "grapes", "kiwi", "pomegranate", "mango"],
      { animate: reduceMotion ? false : "drop" });
  }

  /* ---------------- order tray (cart) ---------------- */
  const CART_KEY = "yuva-cart-v1";
  let cart = store.get(CART_KEY, []);
  if (!Array.isArray(cart)) cart = [];
  // keep only well-formed lines
  cart = cart.filter((l) => l && typeof l.key === "string" && typeof l.name === "string" &&
    Number.isFinite(l.price) && l.price >= 0 && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 99);

  const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = () => cart.reduce((s, l) => s + l.qty * l.price, 0);

  function addToCart(line) {
    const found = cart.find((l) => l.key === line.key);
    if (found) found.qty = Math.min(99, found.qty + 1);
    else cart.push({ ...line, qty: 1 });
    saveCart();
    announce(`Added ${line.name}${line.detail ? " (" + line.detail + ")" : ""}. ${cartCount()} in your order, total ${inr(cartTotal())}.`);
    bumpTray();
  }
  function changeQty(key, delta) {
    const line = cart.find((l) => l.key === key);
    if (!line) return;
    line.qty = Math.min(99, line.qty + delta);
    if (line.qty <= 0) cart = cart.filter((l) => l.key !== key);
    saveCart();
  }
  function saveCart() {
    store.set(CART_KEY, cart);
    renderTray();
  }

  function orderMessage() {
    const lines = [`${GREETING} I'd like to order:`, ""];
    cart.forEach((l, i) => {
      lines.push(`${i + 1}. ${l.name}${l.detail ? " — " + l.detail : ""}`);
      lines.push(`   ${l.qty} × ${inr(l.price)} = ${inr(l.qty * l.price)}`);
    });
    lines.push("", `Total: ${inr(cartTotal())} (${cartCount()} item${cartCount() === 1 ? "" : "s"})`);
    lines.push("", "Name: ", "Delivery address / pickup: ", "Time: ");
    return lines.join("\n");
  }

  function renderTray() {
    const tray = $("#tray");
    const count = cartCount();
    tray.hidden = count === 0;
    document.body.classList.toggle("has-tray", count > 0);
    $("#tray-count").textContent = `${count} item${count === 1 ? "" : "s"}`;
    $("#tray-total").textContent = inr(cartTotal());

    const list = $("#tray-list");
    list.replaceChildren(...cart.map((l) => el("li", { class: "tray-line" }, [
      el("div", { class: "tray-line-name" }, [
        el("strong", { text: l.name }),
        l.detail ? el("span", { text: l.detail }) : null
      ]),
      el("div", { class: "qty" }, [
        el("button", { type: "button", class: "qty-btn", "aria-label": `Remove one ${l.name}`, onclick: () => changeQty(l.key, -1), text: "−" }),
        el("span", { class: "qty-n", "aria-label": `Quantity ${l.qty}`, text: String(l.qty) }),
        el("button", { type: "button", class: "qty-btn", "aria-label": `Add one more ${l.name}`, onclick: () => changeQty(l.key, 1), text: "+" })
      ]),
      el("span", { class: "tray-line-total", text: inr(l.qty * l.price) })
    ])));
    if (count === 0) closeTray(false);
  }

  function openTray() {
    const panel = $("#tray-panel");
    panel.hidden = false;
    $("#tray-open").setAttribute("aria-expanded", "true");
    $("#tray-close").focus();
  }
  function closeTray(returnFocus = true) {
    const panel = $("#tray-panel");
    if (panel.hidden) return;
    panel.hidden = true;
    $("#tray-open").setAttribute("aria-expanded", "false");
    if (returnFocus && !$("#tray").hidden) $("#tray-open").focus();
  }
  function bumpTray() {
    if (reduceMotion) return;
    const bar = $("#tray-open");
    bar.classList.remove("bump");
    void bar.offsetWidth;
    bar.classList.add("bump");
  }

  function initTray() {
    $("#tray-open").addEventListener("click", () => ($("#tray-panel").hidden ? openTray() : closeTray()));
    $("#tray-close").addEventListener("click", () => closeTray());
    $("#tray-send").addEventListener("click", () => { if (cart.length) openWhatsApp(orderMessage()); });
    $("#tray-clear").addEventListener("click", () => {
      cart = [];
      saveCart();
      announce("Your order is now empty.");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeTray(); });
    renderTray();
  }

  function announce(msg) {
    const live = $("#live");
    live.textContent = "";
    window.setTimeout(() => { live.textContent = msg; }, 30);
  }

  /* ---------------- menu board ---------------- */
  function renderMenu() {
    const tabs = $("#menu-tabs");
    const panels = $("#menu-panels");
    const cats = C.menu || [];

    cats.forEach((cat, ci) => {
      const tabId = `tab-${cat.id}`;
      const panelId = `panel-${cat.id}`;
      tabs.appendChild(el("button", {
        type: "button", role: "tab", id: tabId, class: "tab",
        "aria-selected": ci === 0 ? "true" : "false",
        "aria-controls": panelId, tabindex: ci === 0 ? "0" : "-1",
        text: cat.label
      }));

      const items = (cat.items || []).map((item) => el("li", { class: "board-item" }, [
        el("div", { class: "board-head" }, [
          el("h3", { class: "board-name", text: item.name }),
          ...(item.tags || []).map((t) => el("span", { class: "tag tag-" + t.toLowerCase().replace(/\s+/g, "-"), text: t }))
        ]),
        item.description ? el("p", { class: "board-desc", text: item.description }) : null,
        el("ul", { class: "board-prices" }, (item.sizes || []).map((s) => el("li", { class: "price-line" }, [
          el("span", { class: "price-size", text: s.label }),
          el("span", { class: "leader", "aria-hidden": "true" }),
          el("span", { class: "price", text: inr(s.price) }),
          el("button", {
            type: "button", class: "add-btn",
            "aria-label": `Add ${item.name}, ${s.label}, ${inr(s.price)}`,
            onclick: () => addToCart({ key: `${item.id}|${s.label}`, name: item.name, detail: s.label, price: Number(s.price) }),
            text: "Add"
          })
        ])))
      ]));

      panels.appendChild(el("div", {
        role: "tabpanel", id: panelId, class: "board-panel",
        "aria-labelledby": tabId, tabindex: "0", hidden: ci !== 0
      }, [el("ul", { class: "board-list" }, items)]));
    });

    const tabEls = $$('[role="tab"]', tabs);
    function select(tab, focus) {
      tabEls.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabEls.forEach((t, i) => {
      t.addEventListener("click", () => select(t, false));
      t.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabEls[(i + 1) % tabEls.length];
        else if (e.key === "ArrowLeft") next = tabEls[(i - 1 + tabEls.length) % tabEls.length];
        else if (e.key === "Home") next = tabEls[0];
        else if (e.key === "End") next = tabEls[tabEls.length - 1];
        if (next) { e.preventDefault(); select(next, true); next.scrollIntoView({ block: "nearest", inline: "nearest" }); }
      });
    });
  }

  /* ---------------- build your own bowl ---------------- */
  function initBuilder() {
    const cfg = C.builder;
    const state = { size: cfg.sizes[1] ? cfg.sizes[1].id : cfg.sizes[0].id, fruits: [], toppings: [] };

    const sizeBox = $("#b-sizes");
    cfg.sizes.forEach((s) => {
      sizeBox.appendChild(el("label", { class: "chip chip-size" }, [
        el("input", { type: "radio", name: "b-size", value: s.id, checked: s.id === state.size }),
        el("span", { class: "chip-body" }, [
          el("strong", { text: `${s.label} · ${s.weight}` }),
          el("small", { text: `${inr(s.price)} · up to ${s.maxFruits} fruits` })
        ])
      ]));
    });

    const fruitBox = $("#b-fruits");
    cfg.fruits.forEach((f) => {
      fruitBox.appendChild(el("label", { class: "chip" }, [
        el("input", { type: "checkbox", name: "b-fruit", value: f.id }),
        el("span", { class: "chip-body" }, [
          el("span", { text: f.label }),
          el("small", { text: f.extra ? `+${inr(f.extra)}` : "free" })
        ])
      ]));
    });

    const topBox = $("#b-toppings");
    cfg.toppings.forEach((t) => {
      topBox.appendChild(el("label", { class: "chip" }, [
        el("input", { type: "checkbox", name: "b-topping", value: t.id }),
        el("span", { class: "chip-body" }, [
          el("span", { text: t.label }),
          el("small", { text: t.extra ? `+${inr(t.extra)}` : "free" })
        ])
      ]));
    });

    const bowl = window.YuvaBowl.create($("#b-preview"), { label: "Preview of your bowl", piecesPerFruit: 5 });

    const size = () => cfg.sizes.find((s) => s.id === state.size);
    const fruitObjs = () => state.fruits.map((id) => cfg.fruits.find((f) => f.id === id)).filter(Boolean);
    const topObjs = () => state.toppings.map((id) => cfg.toppings.find((t) => t.id === id)).filter(Boolean);
    const price = () => Number(size().price) +
      fruitObjs().reduce((s, f) => s + Number(f.extra || 0), 0) +
      topObjs().reduce((s, t) => s + Number(t.extra || 0), 0);

    function describe() {
      const s = size();
      const parts = [`${s.label} ${s.weight}`];
      parts.push(fruitObjs().map((f) => f.label).join(", "));
      if (state.toppings.length) parts.push("topped with " + topObjs().map((t) => t.label).join(", "));
      return parts.join(" · ");
    }

    function update(animate) {
      const s = size();
      const max = s.maxFruits;
      // if the size got smaller, drop the extra fruits (last picked first)
      if (state.fruits.length > max) {
        state.fruits = state.fruits.slice(0, max);
        $$('input[name="b-fruit"]', fruitBox).forEach((i) => { i.checked = state.fruits.includes(i.value); });
      }
      const full = state.fruits.length >= max;
      $$('input[name="b-fruit"]', fruitBox).forEach((i) => {
        i.disabled = full && !i.checked;
        i.closest(".chip").classList.toggle("is-disabled", i.disabled);
      });
      $("#b-fruit-count").textContent = `${state.fruits.length} of ${max} picked`;
      $("#b-fruit-hint").textContent = full
        ? `That's the most a ${s.label.toLowerCase()} bowl can hold. Untick one to swap, or pick a bigger size.`
        : "";

      $("#b-price").textContent = inr(price());
      const empty = state.fruits.length === 0;
      $("#b-summary").textContent = empty ? "Pick at least one fruit to start your bowl." : describe();
      $("#b-add").disabled = empty;
      $("#b-wa").disabled = empty;
      $("#b-empty").hidden = !empty;
      bowl.setFruits(state.fruits, { animate: animate && !reduceMotion ? "pop" : false });
    }

    sizeBox.addEventListener("change", (e) => {
      if (e.target.name === "b-size") { state.size = e.target.value; update(false); }
    });
    fruitBox.addEventListener("change", (e) => {
      const i = e.target;
      if (i.name !== "b-fruit") return;
      if (i.checked) {
        if (state.fruits.length >= size().maxFruits) { i.checked = false; return; }
        state.fruits.push(i.value);
      } else {
        state.fruits = state.fruits.filter((f) => f !== i.value);
      }
      update(i.checked);
    });
    topBox.addEventListener("change", (e) => {
      const i = e.target;
      if (i.name !== "b-topping") return;
      state.toppings = i.checked ? [...state.toppings, i.value] : state.toppings.filter((t) => t !== i.value);
      update(false);
    });

    function bowlLine() {
      const key = "custom|" + state.size + "|" + [...state.fruits].sort().join(",") + "|" + [...state.toppings].sort().join(",");
      return { key, name: "Build-your-own bowl", detail: describe(), price: price() };
    }
    $("#b-add").addEventListener("click", () => { if (state.fruits.length) addToCart(bowlLine()); });
    $("#b-wa").addEventListener("click", () => {
      if (!state.fruits.length) return;
      openWhatsApp([
        `${GREETING} I'd like a build-your-own bowl:`, "",
        `Size: ${size().label} (${size().weight})`,
        `Fruits: ${fruitObjs().map((f) => f.label).join(", ")}`,
        `Toppings: ${state.toppings.length ? topObjs().map((t) => t.label).join(", ") : "none"}`,
        `Price: ${inr(price())}`, "",
        "Name: ", "Delivery address / pickup: ", "Time: "
      ].join("\n"));
    });

    update(false);
  }

  /* ---------------- daily plans ---------------- */
  function renderPlans() {
    const P = C.plans;
    const slotBox = $("#plan-slots");
    P.timeSlots.forEach((s, i) => {
      slotBox.appendChild(el("label", { class: "chip" }, [
        el("input", { type: "radio", name: "plan-slot", value: s, checked: i === 0 }),
        el("span", { class: "chip-body" }, [el("span", { text: s })])
      ]));
    });
    $("#plan-bowl").textContent = P.bowlDescription;

    const grid = $("#plan-grid");
    P.options.forEach((p) => {
      const total = p.days * p.pricePerDay;
      const saving = p.days * (P.regularBowlPrice - p.pricePerDay);
      const title = `${p.days}-day plan`;
      grid.appendChild(el("article", { class: "plan" + (p.highlight ? " plan-highlight" : "") }, [
        p.note ? el("p", { class: "plan-note", text: p.note }) : null,
        el("h3", { class: "plan-title", text: title }),
        el("p", { class: "plan-per" }, [el("strong", { text: inr(p.pricePerDay) }), " a day"]),
        el("p", { class: "plan-total", text: `${inr(total)} for ${p.days} days` }),
        saving > 0 ? el("p", { class: "plan-save", text: `You save ${inr(saving)}` }) : null,
        el("button", {
          type: "button", class: "btn btn-wa",
          onclick: () => {
            const slot = ($('input[name="plan-slot"]:checked') || {}).value || P.timeSlots[0];
            openWhatsApp([
              `${GREETING} I'd like to start the ${title}.`, "",
              `Plan: ${p.days} days × ${inr(p.pricePerDay)} = ${inr(total)}`,
              `Bowl: ${P.bowlDescription}`,
              `Delivery time: ${slot}`, "",
              "Start date: ", "Name: ", "Delivery address: "
            ].join("\n"));
          }
        }, [waIcon(), `Start the ${p.days}-day plan`])
      ]));
    });
  }

  function waIcon() {
    const t = $("#wa-icon-tpl");
    return t ? t.content.firstElementChild.cloneNode(true) : null;
  }

  /* ---------------- party / office form ---------------- */
  function initPartyForm() {
    const form = $("#party-form");
    const P = C.party;
    const typeSel = $("#p-type");
    P.eventTypes.forEach((t) => typeSel.appendChild(el("option", { value: t, text: t })));
    const people = $("#p-people");
    people.min = String(P.minPeople);
    $("#p-people-hint").textContent = `Minimum ${P.minPeople} people.`;

    const today = new Date();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    $("#p-date").min = iso(today);

    const rules = {
      "p-name": (v) => (v.trim().length < 2 ? "Please enter your name." : ""),
      "p-phone": (v) => {
        const d = v.replace(/[\s-]/g, "").replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, "");
        return /^[6-9]\d{9}$/.test(d) ? "" : "Please enter a 10-digit Indian mobile number, like 98765 43210.";
      },
      "p-date": (v) => {
        if (!v) return "Please choose the date of your event.";
        return v < iso(new Date()) ? "That date has already passed. Please choose today or a later date." : "";
      },
      "p-people": (v) => {
        const n = Number(v);
        if (!v || !Number.isInteger(n)) return "Please enter how many people, as a whole number.";
        if (n < P.minPeople) return `Party orders start at ${P.minPeople} people. For fewer, order from the menu.`;
        if (n > 5000) return "For more than 5,000 people, please call or message us directly.";
        return "";
      },
      "p-type": (v) => (v ? "" : "Please choose the type of event."),
      "p-notes": (v) => (v.length > 500 ? "Please keep notes under 500 characters." : "")
    };

    function check(input) {
      const msg = rules[input.id](input.value);
      const err = $("#" + input.id + "-err");
      err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    Object.keys(rules).forEach((id) => {
      const input = $("#" + id);
      input.addEventListener("blur", () => { if (input.value || input.getAttribute("aria-invalid") === "true") check(input); });
      input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") check(input); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = Object.keys(rules).map((id) => $("#" + id));
      const bad = inputs.filter((i) => !check(i));
      const status = $("#p-status");
      if (bad.length) {
        status.textContent = `Please fix ${bad.length} field${bad.length === 1 ? "" : "s"} marked below.`;
        status.className = "form-status is-error";
        bad[0].focus();
        return;
      }
      const v = (id) => $("#" + id).value.trim();
      const date = new Date(v("p-date") + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      openWhatsApp([
        `${GREETING} I'd like a quote for a party / office order.`, "",
        `Name: ${v("p-name")}`,
        `Phone: ${v("p-phone")}`,
        `Date: ${date}`,
        `People: ${v("p-people")}`,
        `Event: ${v("p-type")}`,
        v("p-notes") ? `Notes: ${v("p-notes")}` : null
      ].filter((x) => x !== null).join("\n"));
      status.textContent = "WhatsApp is opening with your enquiry. Press send there and we'll reply with a quote.";
      status.className = "form-status is-ok";
    });
  }

  /* ---------------- reviews, contact, map, footer ---------------- */
  function mapsSearchUrl() {
    const q = B.mapsQuery || [B.name, B.city].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  function renderContact() {
    const reviews = $("#reviews-link");
    reviews.href = isHttpUrl(B.googleReviewsUrl) ? B.googleReviewsUrl.trim() : mapsSearchUrl();

    const addr = $("#c-address");
    if (B.addressLines && B.addressLines.length) {
      addr.replaceChildren(...[...B.addressLines, B.city].filter(Boolean).flatMap((l, i) => (i ? [el("br"), l] : [l])));
    } else {
      addr.textContent = B.city ? `${B.city}. Message us on WhatsApp for the exact location.` : "Message us on WhatsApp for our location.";
    }
    $("#c-directions").href = mapsSearchUrl();

    const hours = $("#c-hours");
    if (B.hours && B.hours.length) hours.replaceChildren(...B.hours.map((h) => el("li", { text: h })));
    else hours.replaceChildren(el("li", { text: "Message us on WhatsApp for today's timings." }));

    const call = $("#c-call");
    const tel = String(B.phone || "").replace(/[^\d+]/g, "");
    if (tel) { call.href = "tel:" + tel; $(".btn-label", call).textContent = "Call " + B.phone; }
    else call.hidden = true;

    $("#c-payments").replaceChildren(...(B.paymentMethods || []).map((p) => el("li", { text: p })));
    const upi = $("#c-upi");
    if (B.upiId) {
      $("#c-upi-id").textContent = B.upiId;
      $("#c-upi-copy").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(B.upiId);
          $("#c-upi-copy").textContent = "Copied";
        } catch {
          $("#c-upi-copy").textContent = "Copy failed — select the ID above";
        }
        window.setTimeout(() => { $("#c-upi-copy").textContent = "Copy UPI ID"; }, 2500);
      });
    } else upi.hidden = true;

    const links = [["instagram", "Instagram"], ["swiggy", "Order on Swiggy"], ["zomato", "Order on Zomato"]]
      .filter(([k]) => isHttpUrl(B[k]))
      .map(([k, label]) => el("a", { class: "btn btn-outline", href: B[k].trim(), target: "_blank", rel: "noopener", text: label }));
    const linkBox = $("#c-links");
    if (links.length) linkBox.replaceChildren(...links);
    else linkBox.hidden = true;

    // Map: lazy-load the iframe only when the section gets close to the screen
    const mapBox = $("#map");
    const q = B.mapsQuery || [B.name, B.city].filter(Boolean).join(", ");
    const loadMap = () => {
      if (mapBox.dataset.loaded) return;
      mapBox.dataset.loaded = "1";
      mapBox.replaceChildren(el("iframe", {
        title: `Map showing ${B.name}`,
        src: "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed",
        loading: "lazy",
        referrerpolicy: "no-referrer-when-downgrade",
        allowfullscreen: true
      }));
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { loadMap(); io.disconnect(); }
      }, { rootMargin: "400px" });
      io.observe(mapBox);
    } else loadMap();
  }

  function renderFooter() {
    $("#year").textContent = String(new Date().getFullYear());
    const f = $("#fssai");
    if (B.fssai) f.textContent = "FSSAI licence no. " + B.fssai;
    else f.hidden = true;
  }

  /* ---------------- SEO: fill structured data from config ---------------- */
  function updateStructuredData() {
    const tag = $("#ld-json");
    if (!tag) return;
    let data;
    try { data = JSON.parse(tag.textContent); } catch { return; }
    if (B.phone) data.telephone = B.phone;
    if (B.addressLines && B.addressLines.length) {
      data.address = { "@type": "PostalAddress", streetAddress: B.addressLines.join(", "), addressLocality: B.city || undefined, addressCountry: "IN" };
    }
    if (B.city) data.areaServed = B.city;
    const same = ["instagram", "swiggy", "zomato"].map((k) => B[k]).filter(isHttpUrl);
    if (same.length) data.sameAs = same;
    tag.textContent = JSON.stringify(data);
  }

  /* ---------------- start ---------------- */
  function start() {
    $$("[data-biz-name]").forEach((n) => { n.textContent = B.name; });
    renderOffer();
    initNav();
    initGenericWhatsApp();
    initHeroBowl();
    renderMenu();
    initTray();
    initBuilder();
    renderPlans();
    initPartyForm();
    renderContact();
    renderFooter();
    updateStructuredData();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
