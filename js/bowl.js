/* =====================================================================
   bowl.js — draws a steel bowl heaped with cut fruit, as inline SVG.
   No images needed. Used by the hero and by "Build your own bowl".

   YuvaBowl.create(container, { label })  -> bowl object
   bowl.setFruits(["apple", "kiwi"], { animate: "drop" | "pop" | false })
   ===================================================================== */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  /* Small deterministic random generator so each fruit's pieces always
     land in the same spots (no jumping around when the list changes). */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    var s = seed || 1;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function node(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- One drawing per fruit, centred on 0,0, about 30 units wide ---------- */
  var SHAPES = {
    apple: function (g) {
      node("path", { d: "M-15,5 Q0,-13 15,5 Q0,11 -15,5Z", fill: "#FFF4D8" }, g);
      node("path", { d: "M-15,5 Q0,-13 15,5", fill: "none", stroke: "#D7263D", "stroke-width": 4, "stroke-linecap": "round" }, g);
      node("ellipse", { cx: -2, cy: 3, rx: 1.4, ry: 2.4, fill: "#5B3A1E" }, g);
      node("ellipse", { cx: 3, cy: 3, rx: 1.4, ry: 2.4, fill: "#5B3A1E" }, g);
    },
    banana: function (g) {
      node("circle", { r: 11, fill: "#FFF1B8", stroke: "#E8CF73", "stroke-width": 2.5 }, g);
      node("circle", { r: 3.5, fill: "#F2DD8F" }, g);
      for (var i = 0; i < 3; i++) {
        var a = (i * 2 * Math.PI) / 3;
        node("circle", { cx: (Math.cos(a) * 5.5).toFixed(1), cy: (Math.sin(a) * 5.5).toFixed(1), r: 1.1, fill: "#B89A3E" }, g);
      }
    },
    papaya: function (g) {
      node("rect", { x: -11, y: -11, width: 22, height: 22, rx: 4, fill: "#FF8A3D" }, g);
      node("rect", { x: -11, y: -11, width: 22, height: 7, rx: 3, fill: "#FFA866" }, g);
    },
    watermelon: function (g) {
      node("path", { d: "M-14,9 L14,9 L0,-16Z", fill: "#F2445A", "stroke-linejoin": "round" }, g);
      node("path", { d: "M-15,9 L15,9 L13.5,14 L-13.5,14Z", fill: "#2E8B3E" }, g);
      node("path", { d: "M-14,9 L14,9", stroke: "#E9F5EC", "stroke-width": 2 }, g);
      node("ellipse", { cx: -3, cy: 1, rx: 1.2, ry: 2, fill: "#1B1B1B" }, g);
      node("ellipse", { cx: 3.5, cy: -3, rx: 1.2, ry: 2, fill: "#1B1B1B" }, g);
    },
    muskmelon: function (g) {
      node("path", { d: "M-16,6 Q0,-12 16,6 Q0,9 -16,6Z", fill: "#FFB26B" }, g);
      node("path", { d: "M-16,6 Q0,-12 16,6", fill: "none", stroke: "#A9C46A", "stroke-width": 3.5, "stroke-linecap": "round" }, g);
    },
    guava: function (g) {
      node("circle", { r: 12, fill: "#F7A1A8", stroke: "#9CCC65", "stroke-width": 3 }, g);
      node("circle", { cx: -3, cy: -2, r: 1.2, fill: "#FCE3C2" }, g);
      node("circle", { cx: 3, cy: 1, r: 1.2, fill: "#FCE3C2" }, g);
      node("circle", { cx: 0, cy: 4, r: 1.2, fill: "#FCE3C2" }, g);
    },
    grapes: function (g) {
      node("circle", { cx: -6, cy: 2, r: 8, fill: "#9CCC3C" }, g);
      node("circle", { cx: 7, cy: -1, r: 8, fill: "#8BBE2F" }, g);
      node("circle", { cx: -8, cy: -1, r: 2.2, fill: "#D9F0A8" }, g);
      node("circle", { cx: 5, cy: -4, r: 2.2, fill: "#D9F0A8" }, g);
    },
    pineapple: function (g) {
      node("rect", { x: -12, y: -9, width: 24, height: 18, rx: 3, fill: "#FFD23F" }, g);
      node("path", { d: "M-12,-3 H12 M-12,3 H12 M-4,-9 V9 M4,-9 V9", stroke: "#E9AE00", "stroke-width": 1.4, fill: "none" }, g);
    },
    pomegranate: function (g) {
      var seeds = [[-6, -3], [0, -6], [6, -3], [-3, 3], [3, 3], [0, 9], [-8, 5], [8, 5]];
      seeds.forEach(function (p) {
        node("circle", { cx: p[0], cy: p[1], r: 4.2, fill: "#C8102E" }, g);
        node("circle", { cx: p[0] - 1.2, cy: p[1] - 1.4, r: 1.1, fill: "#F7A1A8" }, g);
      });
    },
    mango: function (g) {
      node("rect", { x: -11, y: -11, width: 22, height: 22, rx: 5, fill: "#FFB320" }, g);
      node("path", { d: "M-7,-6 Q0,-10 7,-6", stroke: "#FFD27A", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, g);
    },
    kiwi: function (g) {
      node("circle", { r: 12.5, fill: "#8DC63F", stroke: "#7A5A33", "stroke-width": 2.2 }, g);
      node("circle", { r: 4, fill: "#F2F6D8" }, g);
      for (var i = 0; i < 8; i++) {
        var a = (i * Math.PI) / 4;
        node("circle", { cx: (Math.cos(a) * 7).toFixed(1), cy: (Math.sin(a) * 7).toFixed(1), r: 1.1, fill: "#1E1E1E" }, g);
      }
    },
    dragonfruit: function (g) {
      node("rect", { x: -11, y: -11, width: 22, height: 22, rx: 4, fill: "#FFFDF8", stroke: "#E83E8C", "stroke-width": 3 }, g);
      [[-5, -4], [3, -6], [5, 2], [-3, 4], [0, -1], [6, 7], [-6, 7]].forEach(function (p) {
        node("circle", { cx: p[0], cy: p[1], r: 1, fill: "#1E1E1E" }, g);
      });
    },
    leaf: function (g) {
      node("path", { d: "M-11,3 Q-2,-11 12,-4 Q2,9 -11,3Z", fill: "#2F9E4F" }, g);
      node("path", { d: "M-9,2 Q1,-3 10,-3", stroke: "#BFE6C8", "stroke-width": 1.2, fill: "none" }, g);
    }
  };

  var ALL_FRUITS = ["apple", "banana", "papaya", "watermelon", "muskmelon", "guava",
    "grapes", "pineapple", "pomegranate", "mango", "kiwi", "dragonfruit"];

  /* Heap area: a dome sitting on the bowl rim (centre 200,170). */
  function heapPoint(rand, fullness) {
    var x = 70 + rand() * 260;
    var dx = (x - 200) / 140;
    var dome = Math.sqrt(Math.max(0, 1 - dx * dx));
    var top = 172 - (34 + 62 * fullness) * dome;
    var y = top + rand() * (188 - top);
    return { x: x, y: y };
  }

  function Bowl(container, opts) {
    opts = opts || {};
    var id = "yb" + (++uid);
    this.piecesPerFruit = opts.piecesPerFruit || 5;
    this.fruits = [];

    var svg = node("svg", {
      viewBox: "0 0 400 330",
      role: "img",
      "aria-label": opts.label || "A steel bowl of freshly cut fruit",
      class: "bowl-svg"
    });

    var defs = node("defs", {}, svg);
    var steel = node("linearGradient", { id: id + "-steel", x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    [["0", "#8E999F"], [".18", "#E9EDEF"], [".42", "#B7C1C7"], [".62", "#F6F8F9"], [".85", "#A3AEB4"], ["1", "#7D888E"]]
      .forEach(function (s) { node("stop", { offset: s[0], "stop-color": s[1] }, steel); });
    var inner = node("linearGradient", { id: id + "-inner", x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    node("stop", { offset: "0", "stop-color": "#6F7A80" }, inner);
    node("stop", { offset: "1", "stop-color": "#C9D1D6" }, inner);

    // shadow
    node("ellipse", { cx: 200, cy: 312, rx: 120, ry: 12, fill: "rgba(14,42,28,.18)" }, svg);
    // inside of the bowl (back)
    node("ellipse", { cx: 200, cy: 172, rx: 158, ry: 28, fill: "url(#" + id + "-inner)" }, svg);

    this.heap = node("g", { class: "bowl-heap" }, svg);

    // front of the bowl, covering the lower half of the pieces
    node("path", {
      d: "M42,172 A158,28 0 0 0 358,172 C352,252 292,302 200,302 C108,302 48,252 42,172Z",
      fill: "url(#" + id + "-steel)"
    }, svg);
    // rim highlight + foot
    node("path", { d: "M42,172 A158,28 0 0 0 358,172", fill: "none", stroke: "#FDFEFE", "stroke-width": 5, "stroke-linecap": "round" }, svg);
    node("path", { d: "M150,300 Q200,316 250,300", fill: "none", stroke: "#7D888E", "stroke-width": 6, "stroke-linecap": "round" }, svg);
    node("path", { d: "M92,214 Q110,262 168,284", fill: "none", stroke: "rgba(255,255,255,.7)", "stroke-width": 6, "stroke-linecap": "round" }, svg);

    container.appendChild(svg);
    this.svg = svg;
  }

  Bowl.prototype.setFruits = function (fruits, options) {
    options = options || {};
    var animate = options.animate || false;
    var before = this.fruits;
    var heap = this.heap;
    var per = this.piecesPerFruit;
    var fullness = Math.min(1, 0.25 + fruits.length * 0.12);
    var pieces = [];

    fruits.forEach(function (f) {
      if (!SHAPES[f]) return;
      var rand = rng(hash(f));
      for (var k = 0; k < per; k++) {
        var p = heapPoint(rand, fullness);
        pieces.push({ fruit: f, x: p.x, y: p.y, r: Math.round(rand() * 360), s: 0.9 + rand() * 0.35, isNew: before.indexOf(f) === -1 });
      }
    });
    // two mint leaves on top when there is fruit
    if (fruits.length) {
      pieces.push({ fruit: "leaf", x: 186, y: 172 - (34 + 62 * fullness) + 14, r: -20, s: 1, isNew: false, top: true });
      pieces.push({ fruit: "leaf", x: 214, y: 172 - (34 + 62 * fullness) + 16, r: 200, s: 0.9, isNew: false, top: true });
    }
    // draw back-to-front (higher on screen = further back)
    pieces.sort(function (a, b) { return (a.top ? 1 : 0) - (b.top ? 1 : 0) || a.y - b.y; });

    while (heap.firstChild) heap.removeChild(heap.firstChild);
    pieces.forEach(function (p, i) {
      var outer = node("g", { transform: "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")" }, heap);
      var mid = node("g", { class: "piece" }, outer);
      var shape = node("g", { transform: "rotate(" + p.r + ") scale(" + p.s.toFixed(2) + ")" }, mid);
      SHAPES[p.fruit](shape);
      if (animate === "drop") {
        mid.classList.add("piece-drop");
        mid.style.animationDelay = (i * 45) + "ms";
      } else if (animate === "pop" && p.isNew) {
        mid.classList.add("piece-pop");
        mid.style.animationDelay = ((i % per) * 40) + "ms";
      }
    });

    this.fruits = fruits.slice();
  };

  window.YuvaBowl = {
    create: function (container, opts) { return new Bowl(container, opts); },
    allFruits: ALL_FRUITS.slice()
  };
})();
