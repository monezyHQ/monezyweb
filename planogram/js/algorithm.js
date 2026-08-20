/**
 * One-click auto-planogram rules:
 *  a) Color flow — light → dark by relative luminance of colorHex
 *  b) Cross-merchandising — matching accessories on shelf / side pegs
 *  c) Coordinate pairing — tops on upper hanging, matching bottoms on lower
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PlanogramAlgorithm = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function hexLuminance(hex) {
    var h = (hex || "#888888").replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var r = parseInt(h.slice(0, 2), 16) / 255;
    var g = parseInt(h.slice(2, 4), 16) / 255;
    var b = parseInt(h.slice(4, 6), 16) / 255;
    function lin(c) {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function byLightToDark(a, b) {
    return hexLuminance(b.colorHex) - hexLuminance(a.colorHex);
  }

  function clone(list) {
    return list.slice();
  }

  function pickFacing(slot, product) {
    var preferred = product.defaultFacing;
    if (slot.allowedFacings.indexOf(preferred) !== -1) return preferred;
    return slot.allowedFacings[0];
  }

  function matchingFamily(product, accessories) {
    var same = accessories.filter(function (a) {
      return a.colorFamily === product.colorFamily;
    });
    return same.length ? same : accessories;
  }

  function fillSlots(slots, products, qtyPer, catalogApi) {
    var placements = {};
    var pi = 0;
    slots.forEach(function (slot) {
      if (pi >= products.length) return;
      var product = products[pi];
      var qty = Math.min(qtyPer || 1, slot.maxUnits);
      placements[slot.id] = {
        sku: product.sku,
        qty: qty,
        facing: pickFacing(slot, product),
      };
      pi += 1;
    });
    return { placements: placements, used: pi, catalogApi: catalogApi };
  }

  /**
   * @param {object} opts
   * @param {Array} opts.catalog
   * @param {object} opts.fixture
   * @param {object} opts.rules { colorFlow, crossMerch, coordinatePairing }
   * @param {object} opts.helpers { isTop, isBottom, isAccessory }
   */
  function autoGenerate(opts) {
    var catalog = clone(opts.catalog);
    var fixture = opts.fixture;
    var rules = opts.rules || {};
    var H = opts.helpers;
    var notes = [];

    var tops = catalog.filter(H.isTop);
    var bottoms = catalog.filter(H.isBottom);
    var bags = catalog.filter(H.isAccessory);

    if (rules.colorFlow) {
      tops.sort(byLightToDark);
      bottoms.sort(byLightToDark);
      bags.sort(byLightToDark);
      catalog.sort(byLightToDark);
      notes.push("Color flow: apparel sequenced light → dark using relative luminance of colorHex.");
    }

    var slots = fixture.slots;
    var placements = {};

    var upper = slots.filter(function (s) {
      return s.role === "hanging-upper" || (s.role === "hanging-arm" && s.armIndex < 2);
    });
    var lowerHang = slots.filter(function (s) {
      return s.role === "hanging-lower" || (s.role === "hanging-arm" && s.armIndex >= 2);
    });
    var hangingAll = slots.filter(function (s) {
      return s.kind === "hanging";
    });
    var shelves = slots.filter(function (s) {
      return s.role === "shelf-lower" || s.role === "table-lower" || s.kind === "shelf";
    });
    var tableUpper = slots.filter(function (s) {
      return s.role === "table-upper";
    });
    var pegs = slots.filter(function (s) {
      return s.kind === "peg";
    });

    function expandTo(products, n) {
      if (!products.length || n <= 0) return [];
      var out = [];
      var i = 0;
      while (out.length < n) {
        out.push(products[i % products.length]);
        i += 1;
      }
      return out;
    }

    function placeList(slotList, products) {
      var empty = slotList.filter(function (slot) {
        return !placements[slot.id];
      });
      var seq = expandTo(products, empty.length);
      var idx = 0;
      empty.forEach(function (slot) {
        if (idx >= seq.length) return;
        var product = seq[idx];
        placements[slot.id] = {
          sku: product.sku,
          qty: Math.min(slot.kind === "shelf" ? Math.max(1, Math.min(2, slot.maxUnits)) : 1, slot.maxUnits),
          facing: pickFacing(slot, product),
        };
        idx += 1;
      });
      return idx;
    }

    if (fixture.id === "nestingTable") {
      var foldedApparel = catalog.filter(function (p) {
        return !H.isAccessory(p);
      });
      if (rules.coordinatePairing) {
        notes.push("Coordinate pairing: tops on the upper table, matching bottoms on the lower table.");
        placeList(tableUpper, tops);
        var lowerTable = slots.filter(function (s) {
          return s.role === "table-lower";
        });
        var pairedBottoms = [];
        tops.forEach(function (t) {
          var match = bottoms.filter(function (b) {
            return b.colorFamily === t.colorFamily;
          });
          match.forEach(function (m) {
            if (pairedBottoms.indexOf(m) === -1) pairedBottoms.push(m);
          });
        });
        bottoms.forEach(function (b) {
          if (pairedBottoms.indexOf(b) === -1) pairedBottoms.push(b);
        });
        placeList(lowerTable, pairedBottoms.length ? pairedBottoms : bottoms);
      } else {
        placeList(tableUpper, foldedApparel);
        placeList(
          slots.filter(function (s) {
            return s.role === "table-lower";
          }),
          foldedApparel
        );
      }
    } else if (rules.coordinatePairing && upper.length && lowerHang.length) {
      notes.push("Coordinate pairing: tops on upper hanging tiers / front arms; bottoms on lower tiers / rear arms.");
      placeList(upper, tops);
      var familyOrder = [];
      upper.forEach(function (slot) {
        var pl = placements[slot.id];
        if (!pl) return;
        var prod = catalog.find(function (p) {
          return p.sku === pl.sku;
        });
        if (prod && familyOrder.indexOf(prod.colorFamily) === -1) {
          familyOrder.push(prod.colorFamily);
        }
      });
      var orderedBottoms = [];
      familyOrder.forEach(function (fam) {
        bottoms.forEach(function (b) {
          if (b.colorFamily === fam && orderedBottoms.indexOf(b) === -1) orderedBottoms.push(b);
        });
      });
      bottoms.forEach(function (b) {
        if (orderedBottoms.indexOf(b) === -1) orderedBottoms.push(b);
      });
      placeList(lowerHang, orderedBottoms.length ? orderedBottoms : bottoms);
    } else {
      var wear = catalog.filter(function (p) {
        return !H.isAccessory(p);
      });
      placeList(hangingAll.length ? hangingAll : slots, wear);
    }

    if (rules.crossMerch && bags.length) {
      notes.push("Cross-merchandising: accessories injected onto lower shelf and side pegs, matched by color family.");
      var accessorySlots = pegs.concat(
        shelves.filter(function (s) {
          return s.role === "shelf-lower" || s.role === "table-lower" || s.kind === "peg";
        })
      );
      if (!accessorySlots.length) accessorySlots = shelves;

      var neighborFamilies = [];
      Object.keys(placements).forEach(function (sid) {
        var sku = placements[sid].sku;
        var prod = catalog.find(function (p) {
          return p.sku === sku;
        });
        if (prod && neighborFamilies.indexOf(prod.colorFamily) === -1) {
          neighborFamilies.push(prod.colorFamily);
        }
      });

      var bagQueue = [];
      neighborFamilies.forEach(function (fam) {
        bags.forEach(function (bag) {
          if (bag.colorFamily === fam && bagQueue.indexOf(bag) === -1) bagQueue.push(bag);
        });
      });
      bags.forEach(function (bag) {
        if (bagQueue.indexOf(bag) === -1) bagQueue.push(bag);
      });

      var bi = 0;
      accessorySlots.forEach(function (slot) {
        if (!bagQueue.length) return;
        var isAccessoryHome =
          slot.kind === "peg" ||
          slot.role === "shelf-lower" ||
          (slot.role === "table-lower" && bi < 4);
        if (!isAccessoryHome && placements[slot.id]) return;
        var bag = bagQueue[bi % bagQueue.length];
        placements[slot.id] = {
          sku: bag.sku,
          qty: Math.min(2, slot.maxUnits),
          facing: pickFacing(slot, bag),
        };
        bi += 1;
      });
    }

    var units = 0;
    Object.keys(placements).forEach(function (id) {
      units += placements[id].qty;
    });

    return {
      placements: placements,
      units: units,
      capacity: fixture.capacity,
      notes: notes,
      rules: rules,
    };
  }

  function utilization(placements, capacity) {
    var units = 0;
    Object.keys(placements || {}).forEach(function (id) {
      units += placements[id].qty || 0;
    });
    return { units: units, capacity: capacity, label: units + "/" + capacity + " items placed" };
  }

  function billOfMaterials(placements, getBySku) {
    var map = {};
    Object.keys(placements || {}).forEach(function (slotId) {
      var pl = placements[slotId];
      if (!pl) return;
      if (!map[pl.sku]) {
        var product = getBySku(pl.sku);
        map[pl.sku] = {
          sku: pl.sku,
          name: product ? product.name : pl.sku,
          category: product ? product.category : "",
          image: product ? product.image : "",
          colorHex: product ? product.colorHex : "#ccc",
          facingCounts: {},
          units: 0,
          slots: 0,
        };
      }
      map[pl.sku].units += pl.qty;
      map[pl.sku].slots += 1;
      map[pl.sku].facingCounts[pl.facing] = (map[pl.sku].facingCounts[pl.facing] || 0) + 1;
    });
    return Object.keys(map)
      .sort()
      .map(function (sku) {
        return map[sku];
      });
  }

  function merchandisingNotes(fixture, result) {
    var lines = [];
    lines.push("Fixture: " + fixture.name + " — " + fixture.subtitle + ".");
    lines.push("Target density: fill each snap point; do not mix SKUs on a single slot.");
    if (fixture.id === "fourWay") {
      lines.push("Hang North/East arms as the color-story front; South/West hold coordinated bottoms.");
      lines.push("Side pegs carry bags that echo the nearest arm's color family.");
    }
    if (fixture.id === "wallBay") {
      lines.push("Upper bar: jackets and tees. Lower bar: trousers and skirts. Shelf: folded backups + accessories.");
      lines.push("Face hangers forward unless the SKU default is HANG_SIDE (trousers).");
    }
    if (fixture.id === "nestingTable") {
      lines.push("Keep stacks squared to the table edge. Count badges must match on-hand units.");
      lines.push("Lower table holds bottoms and bags; upper table holds tops.");
    }
    (result.notes || []).forEach(function (n) {
      lines.push(n);
    });
    lines.push("Restore any size run left-to-right XS → XL within a SKU block after color flow is set.");
    return lines;
  }

  return {
    hexLuminance: hexLuminance,
    byLightToDark: byLightToDark,
    autoGenerate: autoGenerate,
    utilization: utilization,
    billOfMaterials: billOfMaterials,
    merchandisingNotes: merchandisingNotes,
    matchingFamily: matchingFamily,
    fillSlots: fillSlots,
  };
});
