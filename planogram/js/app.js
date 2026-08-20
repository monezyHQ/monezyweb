(function () {
  var NS = "http://www.w3.org/2000/svg";
  var catalog = window.PlanogramCatalog;
  var fixtures = window.PlanogramFixtures;
  var algo = window.PlanogramAlgorithm;

  var state = {
    fixtureId: "fourWay",
    placements: {},
    selectedSlot: null,
    lastNotes: [],
    audit: {},
    photoUrl: null,
    tab: "workspace",
  };

  function fixture() {
    return fixtures.getById(state.fixtureId);
  }

  function slotById(id) {
    return fixture().slots.find(function (s) {
      return s.id === id;
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      node.appendChild(c);
    });
    return node;
  }

  function drawFrame(svg, f) {
    var g = el("g", { class: "fixture-frame", fill: "none", stroke: "#1c1917", "stroke-width": "2" });
    if (f.frame === "fourWay") {
      g.appendChild(el("circle", { cx: "400", cy: "290", r: "22", fill: "#c4a574", stroke: "#1c1917" }));
      g.appendChild(el("circle", { cx: "400", cy: "290", r: "8", fill: "#1c1917" }));
      [
        ["400", "70", "400", "510"],
        ["90", "290", "710", "290"],
      ].forEach(function (d) {
        g.appendChild(el("line", { x1: d[0], y1: d[1], x2: d[2], y2: d[3], "stroke-width": "10", stroke: "#d6cbb8" }));
        g.appendChild(el("line", { x1: d[0], y1: d[1], x2: d[2], y2: d[3], "stroke-width": "2", stroke: "#1c1917" }));
      });
      [
        ["400", "52", "N"],
        ["728", "294", "E"],
        ["400", "528", "S"],
        ["72", "294", "W"],
      ].forEach(function (lab) {
        g.appendChild(
          el("text", {
            x: lab[0],
            y: lab[1],
            fill: "#57534e",
            "font-size": "11",
            "font-family": "Outfit, sans-serif",
            "text-anchor": "middle",
            text: lab[2],
          })
        );
      });
    } else if (f.frame === "wallBay") {
      g.appendChild(el("rect", { x: "28", y: "28", width: "660", height: "460", rx: "8", fill: "#f7f1e8", stroke: "#1c1917" }));
      g.appendChild(el("line", { x1: "40", y1: "48", x2: "676", y2: "48", "stroke-width": "8", stroke: "#8a7354" }));
      g.appendChild(el("line", { x1: "40", y1: "200", x2: "676", y2: "200", "stroke-width": "8", stroke: "#8a7354" }));
      g.appendChild(el("rect", { x: "40", y: "388", width: "636", height: "18", fill: "#c4a574", stroke: "#1c1917" }));
      g.appendChild(el("rect", { x: "700", y: "28", width: "72", height: "460", rx: "8", fill: "#efe6d8", stroke: "#1c1917" }));
      g.appendChild(el("text", { x: "358", y: "44", fill: "#57534e", "font-size": "11", "text-anchor": "middle", text: "UPPER HANGING BAR" }));
      g.appendChild(el("text", { x: "358", y: "196", fill: "#57534e", "font-size": "11", "text-anchor": "middle", text: "LOWER HANGING BAR" }));
      g.appendChild(el("text", { x: "358", y: "384", fill: "#57534e", "font-size": "11", "text-anchor": "middle", text: "LOWER SHELF" }));
      g.appendChild(el("text", { x: "736", y: "48", fill: "#57534e", "font-size": "10", "text-anchor": "middle", text: "PEGS" }));
    } else {
      g.appendChild(
        el("polygon", {
          points: "70,60 650,60 700,250 40,250",
          fill: "#efe6d8",
          stroke: "#1c1917",
        })
      );
      g.appendChild(el("line", { x1: "70", y1: "60", x2: "40", y2: "250", stroke: "#1c1917" }));
      g.appendChild(el("line", { x1: "650", y1: "60", x2: "700", y2: "250", stroke: "#1c1917" }));
      g.appendChild(
        el("polygon", {
          points: "110,280 710,280 760,480 80,480",
          fill: "#e7dcc8",
          stroke: "#1c1917",
        })
      );
      g.appendChild(el("text", { x: "360", y: "52", fill: "#57534e", "font-size": "11", "text-anchor": "middle", text: "UPPER TABLE" }));
      g.appendChild(el("text", { x: "400", y: "272", fill: "#57534e", "font-size": "11", "text-anchor": "middle", text: "LOWER TABLE" }));
    }
    svg.appendChild(g);
  }

  function garmentShape(product, facing, x, y, w, h) {
    var g = el("g", { transform: "translate(" + x + " " + y + ")" });
    var hex = product.colorHex;
    if (facing === "FOLDED") {
      var layers = 3;
      for (var i = layers - 1; i >= 0; i--) {
        g.appendChild(
          el("rect", {
            x: String(4 + i * 2),
            y: String(6 + i * 3),
            width: String(w - 14),
            height: String(h - 18),
            rx: "4",
            fill: hex,
            stroke: "#1c1917",
            "stroke-width": "1.2",
            opacity: String(0.55 + i * 0.15),
          })
        );
      }
    } else if (facing === "HANG_SIDE") {
      for (var s = 0; s < 4; s++) {
        g.appendChild(
          el("rect", {
            x: String(8 + s * 6),
            y: "8",
            width: "8",
            height: String(h - 16),
            rx: "2",
            fill: hex,
            stroke: "#1c1917",
            "stroke-width": "1",
          })
        );
      }
      g.appendChild(el("line", { x1: "6", y1: "10", x2: String(w - 8), y2: "10", stroke: "#1c1917" }));
    } else if (facing === "MANNEQUIN") {
      g.appendChild(el("circle", { cx: String(w / 2), cy: "12", r: "7", fill: "#e8dcc8", stroke: "#1c1917" }));
      g.appendChild(
        el("path", {
          d: "M" + w / 2 + " 19 L" + (w / 2 - 14) + " " + (h - 8) + " L" + (w / 2 + 14) + " " + (h - 8) + " Z",
          fill: hex,
          stroke: "#1c1917",
        })
      );
    } else {
      var cat = product.category;
      if (cat === "bags") {
        g.appendChild(el("path", { d: "M14 16c0-8 6-12 10-12s10 4 10 12", fill: "none", stroke: "#1c1917" }));
        g.appendChild(el("rect", { x: "8", y: "16", width: String(w - 18), height: String(h - 26), rx: "4", fill: hex, stroke: "#1c1917" }));
      } else if (cat === "trousers") {
        g.appendChild(
          el("path", {
            d: "M12 10 h" + (w - 24) + " l3 8 l-6 " + (h - 24) + " h-6 v-" + (h - 40) + " l-2 " + (h - 40) + " h-6 z",
            fill: hex,
            stroke: "#1c1917",
          })
        );
      } else if (cat === "skirts") {
        g.appendChild(
          el("path", {
            d: "M16 10 h" + (w - 32) + " l6 8 l-8 " + (h - 26) + " H18 z",
            fill: hex,
            stroke: "#1c1917",
          })
        );
      } else {
        g.appendChild(
          el("path", {
            d: "M18 8 l-10 12 6 5 4-4 v" + (h - 32) + " h" + (w - 36) + " v-" + (h - 32) + " l4 4 6-5 -10-12 h-10 z",
            fill: hex,
            stroke: "#1c1917",
            "stroke-linejoin": "round",
          })
        );
      }
    }
    return g;
  }

  function hitSlot(svg, clientX, clientY) {
    var pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return null;
    var loc = pt.matrixTransform(ctm.inverse());
    return fixture().slots.find(function (slot) {
      return loc.x >= slot.x && loc.x <= slot.x + slot.w && loc.y >= slot.y && loc.y <= slot.y + slot.h;
    }) || null;
  }

  function renderCanvas(targetSvg, readOnly) {
    var f = fixture();
    targetSvg.setAttribute("viewBox", f.viewBox);
    targetSvg.innerHTML = "";
    drawFrame(targetSvg, f);

    f.slots.forEach(function (slot) {
      var group = el("g", {
        class: "snap-slot",
        "data-slot": slot.id,
      });
      var selected = state.selectedSlot === slot.id;
      group.appendChild(
        el("rect", {
          x: String(slot.x),
          y: String(slot.y),
          width: String(slot.w),
          height: String(slot.h),
          rx: "6",
          fill: selected ? "rgba(143,45,36,0.12)" : "rgba(28,25,23,0.04)",
          stroke: selected ? "#8f2d24" : "#c4b7a0",
          "stroke-dasharray": selected ? "0" : "3 3",
          "stroke-width": selected ? "2" : "1",
        })
      );

      var pl = state.placements[slot.id];
      if (pl) {
        var product = catalog.getBySku(pl.sku);
        if (product) {
          group.appendChild(garmentShape(product, pl.facing, slot.x, slot.y, slot.w, slot.h));
          if (pl.qty > 1 || pl.facing === "FOLDED" || pl.facing === "HANG_SIDE") {
            var badge = el("g", {});
            badge.appendChild(
              el("circle", {
                cx: String(slot.x + slot.w - 8),
                cy: String(slot.y + 10),
                r: "9",
                fill: "#1c1917",
              })
            );
            badge.appendChild(
              el("text", {
                x: String(slot.x + slot.w - 8),
                y: String(slot.y + 14),
                fill: "#fffaf3",
                "font-size": "10",
                "text-anchor": "middle",
                "font-family": "Outfit, sans-serif",
                text: String(pl.qty),
              })
            );
            group.appendChild(badge);
          }
        }
      }

      if (!readOnly) {
        group.style.cursor = "pointer";
      }
      targetSvg.appendChild(group);
    });

    if (readOnly) return;

    targetSvg.ondragover = function (ev) {
      ev.preventDefault();
      var slot = hitSlot(targetSvg, ev.clientX, ev.clientY);
      targetSvg.querySelectorAll(".snap-slot rect").forEach(function (r) {
        r.setAttribute("stroke", "#c4b7a0");
      });
      if (slot) {
        var node = targetSvg.querySelector('[data-slot="' + slot.id + '"] rect');
        if (node) node.setAttribute("stroke", "#8f2d24");
      }
    };
    targetSvg.ondrop = function (ev) {
      ev.preventDefault();
      var sku = ev.dataTransfer.getData("text/sku") || ev.dataTransfer.getData("text/plain");
      var slot = hitSlot(targetSvg, ev.clientX, ev.clientY);
      if (sku && slot) placeOnSlot(slot.id, sku);
    };
    targetSvg.onclick = function (ev) {
      var slot = hitSlot(targetSvg, ev.clientX, ev.clientY);
      state.selectedSlot = slot ? slot.id : null;
      renderAll();
    };
  }

  function placeOnSlot(slotId, sku) {
    var slot = slotById(slotId);
    var product = catalog.getBySku(sku);
    if (!slot || !product) return;
    var existing = state.placements[slotId];
    if (existing && existing.sku === sku) {
      existing.qty = Math.min(slot.maxUnits, existing.qty + 1);
    } else {
      var facing = product.defaultFacing;
      if (slot.allowedFacings.indexOf(facing) === -1) facing = slot.allowedFacings[0];
      state.placements[slotId] = { sku: sku, qty: 1, facing: facing };
    }
    state.selectedSlot = slotId;
    renderAll();
  }

  function updateCapacity() {
    var util = algo.utilization(state.placements, fixture().capacity);
    document.getElementById("cap-label").textContent = util.label;
    document.getElementById("cap-bar").style.width = Math.min(100, (util.units / util.capacity) * 100) + "%";
  }

  function renderCatalog() {
    var root = document.getElementById("catalog");
    root.innerHTML = "";
    catalog.PRODUCTS.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "sku-card";
      card.draggable = true;
      card.innerHTML =
        '<img alt="" src="' +
        p.image +
        '"><div class="name">' +
        p.name +
        '</div><div class="meta"><span><i class="swatch" style="background:' +
        p.colorHex +
        '"></i>' +
        p.sku +
        "</span><span>$" +
        p.price +
        "</span></div>";
      card.addEventListener("dragstart", function (ev) {
        ev.dataTransfer.setData("text/sku", p.sku);
        ev.dataTransfer.setData("text/plain", p.sku);
        ev.dataTransfer.effectAllowed = "copy";
      });
      card.addEventListener("click", function () {
        if (state.selectedSlot) placeOnSlot(state.selectedSlot, p.sku);
      });
      root.appendChild(card);
    });
  }

  function renderFixtures() {
    var root = document.getElementById("fixture-picks");
    root.innerHTML = "";
    fixtures.TEMPLATES.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = f.id === state.fixtureId ? "active" : "";
      b.innerHTML = "<strong>" + f.name + "</strong><small>" + f.subtitle + " · " + f.capacity + " unit capacity</small>";
      b.addEventListener("click", function () {
        state.fixtureId = f.id;
        state.placements = {};
        state.selectedSlot = null;
        renderAll();
      });
      root.appendChild(b);
    });
  }

  function renderInspector() {
    var panel = document.getElementById("inspector-panel");
    var slot = state.selectedSlot ? slotById(state.selectedSlot) : null;
    var pl = slot ? state.placements[slot.id] : null;
    if (!slot) {
      panel.innerHTML = '<p class="empty">Select a snap point, then drop a SKU from the catalog. Click a catalog card to fill the selected slot.</p>';
      return;
    }
    var product = pl ? catalog.getBySku(pl.sku) : null;
    var html = "<p><strong>Slot</strong> " + slot.id + "<br><span class='hint'>" + slot.kind + " · max " + slot.maxUnits + "</span></p>";
    if (!product) {
      html += "<p class='empty'>Empty. Drag an item here.</p>";
      panel.innerHTML = html;
      return;
    }
    html +=
      '<img alt="" src="' +
      product.image +
      '" style="width:100%;height:90px;object-fit:contain;background:#f7f1e8;border-radius:8px">' +
      "<p><strong>" +
      product.name +
      "</strong><br>" +
      product.sku +
      " · " +
      product.colorFamily +
      "</p>" +
      '<label class="hint">Facing</label><select class="facing" id="facing-select"></select>' +
      '<div class="qty-row"><button type="button" id="qty-minus">−</button><strong id="qty-val"></strong><button type="button" id="qty-plus">+</button></div>' +
      '<button type="button" class="btn ghost" id="clear-slot">Remove from slot</button>';
    panel.innerHTML = html;
    var sel = document.getElementById("facing-select");
    slot.allowedFacings.forEach(function (f) {
      var o = document.createElement("option");
      o.value = f;
      o.textContent = f.replace(/_/g, " ");
      if (f === pl.facing) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      pl.facing = sel.value;
      renderAll();
    });
    document.getElementById("qty-val").textContent = pl.qty;
    document.getElementById("qty-minus").onclick = function () {
      pl.qty = Math.max(1, pl.qty - 1);
      renderAll();
    };
    document.getElementById("qty-plus").onclick = function () {
      pl.qty = Math.min(slot.maxUnits, pl.qty + 1);
      renderAll();
    };
    document.getElementById("clear-slot").onclick = function () {
      delete state.placements[slot.id];
      renderAll();
    };
  }

  function currentRules() {
    return {
      colorFlow: document.getElementById("rule-color").checked,
      crossMerch: document.getElementById("rule-cross").checked,
      coordinatePairing: document.getElementById("rule-pair").checked,
    };
  }

  function autoGenerate() {
    var result = algo.autoGenerate({
      catalog: catalog.PRODUCTS,
      fixture: fixture(),
      rules: currentRules(),
      helpers: {
        isTop: catalog.isTop,
        isBottom: catalog.isBottom,
        isAccessory: catalog.isAccessory,
      },
    });
    state.placements = result.placements;
    state.lastNotes = algo.merchandisingNotes(fixture(), result);
    state.selectedSlot = null;
    renderAll();
  }

  function exportWorkOrder() {
    var f = fixture();
    var bom = algo.billOfMaterials(state.placements, catalog.getBySku);
    var notes = state.lastNotes.length
      ? state.lastNotes
      : algo.merchandisingNotes(f, { notes: [] });
    var util = algo.utilization(state.placements, f.capacity);
    var visual = document.getElementById("fixture-svg").outerHTML;
    var rows = bom
      .map(function (row) {
        var facings = Object.keys(row.facingCounts)
          .map(function (k) {
            return k.replace(/_/g, " ") + " ×" + row.facingCounts[k];
          })
          .join(", ");
        return (
          "<tr><td>" +
          row.sku +
          '</td><td><img class="thumb" src="' +
          row.image +
          '"></td><td>' +
          row.name +
          "</td><td>" +
          facings +
          "</td><td>" +
          row.units +
          "</td></tr>"
        );
      })
      .join("");
    var sheet =
      '<div class="print-sheet">' +
      "<h1>Visual Work Order</h1>" +
      "<p>Atelier Planogram · " +
      f.name +
      " · " +
      util.label +
      " · " +
      new Date().toLocaleDateString() +
      "</p>" +
      '<div class="print-visual">' +
      visual +
      "</div>" +
      "<h2>Bill of Materials / SKU pick list</h2>" +
      "<table><thead><tr><th>SKU</th><th>Image</th><th>Item Name</th><th>Facing Count</th><th>Units</th></tr></thead><tbody>" +
      (rows || "<tr><td colspan=5>No merchandise placed.</td></tr>") +
      "</tbody></table>" +
      "<h2>Merchandising guidelines</h2><ol>" +
      notes
        .map(function (n) {
          return "<li>" + n + "</li>";
        })
        .join("") +
      "</ol></div>";
    document.getElementById("print-root").innerHTML = sheet;
    window.print();
  }

  function renderAuditPreview() {
    var svg = document.getElementById("audit-svg");
    renderCanvas(svg, true);
    var list = document.getElementById("audit-list");
    var bom = algo.billOfMaterials(state.placements, catalog.getBySku);
    list.innerHTML = "";
    if (!bom.length) {
      list.innerHTML = "<p class='empty'>Generate or build a planogram first. Checklist items appear from placed SKUs.</p>";
      updateScore();
      return;
    }
    bom.forEach(function (row) {
      if (!state.audit[row.sku]) state.audit[row.sku] = "unset";
      var div = document.createElement("div");
      div.className = "check-row";
      div.innerHTML =
        '<img alt="" src="' +
        row.image +
        '"><div><strong>' +
        row.sku +
        "</strong><br>" +
        row.name +
        " · " +
        row.units +
        ' units</div><div class="seg">' +
        '<button type="button" data-v="pass">Pass</button>' +
        '<button type="button" data-v="fail">Fail</button></div>';
      var buttons = div.querySelectorAll("button");
      function paint() {
        buttons[0].className = state.audit[row.sku] === "pass" ? "on-pass" : "";
        buttons[1].className = state.audit[row.sku] === "fail" ? "on-fail" : "";
      }
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          state.audit[row.sku] = b.getAttribute("data-v");
          paint();
          updateScore();
        });
      });
      paint();
      list.appendChild(div);
    });
    updateScore();
  }

  function updateScore() {
    var bom = algo.billOfMaterials(state.placements, catalog.getBySku);
    var marked = bom.filter(function (r) {
      return state.audit[r.sku] === "pass" || state.audit[r.sku] === "fail";
    });
    var passed = marked.filter(function (r) {
      return state.audit[r.sku] === "pass";
    }).length;
    var pct = marked.length ? Math.round((passed / marked.length) * 100) : 0;
    document.getElementById("audit-score").textContent = pct + "%";
    document.getElementById("audit-score-meta").textContent =
      passed + " pass / " + (marked.length - passed) + " fail · " + (bom.length - marked.length) + " unmarked of " + bom.length + " SKUs";
  }

  function renderAll() {
    renderFixtures();
    renderCanvas(document.getElementById("fixture-svg"), false);
    renderInspector();
    updateCapacity();
    if (state.tab === "audit") renderAuditPreview();
  }

  function setTab(tab) {
    state.tab = tab;
    document.getElementById("workspace").classList.toggle("visible", tab === "workspace");
    document.getElementById("audit").classList.toggle("visible", tab === "audit");
    document.getElementById("tab-workspace").classList.toggle("active", tab === "workspace");
    document.getElementById("tab-audit").classList.toggle("active", tab === "audit");
    if (tab === "audit") renderAuditPreview();
  }

  function bind() {
    document.getElementById("tab-workspace").onclick = function () {
      setTab("workspace");
    };
    document.getElementById("tab-audit").onclick = function () {
      setTab("audit");
    };
    document.getElementById("btn-auto").onclick = autoGenerate;
    document.getElementById("btn-export").onclick = exportWorkOrder;
    document.getElementById("btn-clear").onclick = function () {
      state.placements = {};
      state.selectedSlot = null;
      renderAll();
    };
    document.getElementById("photo-input").addEventListener("change", function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var url = URL.createObjectURL(file);
      state.photoUrl = url;
      var img = document.getElementById("photo-preview");
      img.src = url;
      img.style.display = "block";
      document.getElementById("photo-hint").style.display = "none";
    });
    document.addEventListener("keydown", function (ev) {
      if ((ev.key === "Backspace" || ev.key === "Delete") && state.selectedSlot && state.placements[state.selectedSlot]) {
        if (document.activeElement && /input|select|textarea/i.test(document.activeElement.tagName)) return;
        delete state.placements[state.selectedSlot];
        renderAll();
      }
    });
  }

  renderCatalog();
  bind();
  renderAll();
})();
