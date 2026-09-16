/**
 * Fixture templates with snap-point slots.
 * 4-Way Rack, 3-Tier Wall Bay, Nesting Table.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PlanogramFixtures = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var HANG = ["HANG_FORWARD", "HANG_SIDE", "MANNEQUIN"];
  var FOLD = ["FOLDED"];
  var PEG = ["FOLDED", "HANG_FORWARD"];

  function hangingSlot(id, role, x, y, extra) {
    return Object.assign(
      {
        id: id,
        kind: "hanging",
        role: role,
        x: x,
        y: y,
        w: 42,
        h: 72,
        maxUnits: 1,
        allowedFacings: HANG,
      },
      extra || {}
    );
  }

  function shelfSlot(id, role, x, y, extra) {
    return Object.assign(
      {
        id: id,
        kind: "shelf",
        role: role,
        x: x,
        y: y,
        w: 52,
        h: 40,
        maxUnits: 3,
        allowedFacings: FOLD,
      },
      extra || {}
    );
  }

  function pegSlot(id, x, y, extra) {
    return Object.assign(
      {
        id: id,
        kind: "peg",
        role: "peg-side",
        x: x,
        y: y,
        w: 44,
        h: 52,
        maxUnits: 2,
        allowedFacings: PEG,
      },
      extra || {}
    );
  }

  function fourWay() {
    var slots = [];
    var hub = { x: 400, y: 290 };
    var arms = [
      { key: "n", label: "North", dx: 0, dy: -1, armIndex: 0 },
      { key: "e", label: "East", dx: 1, dy: 0, armIndex: 1 },
      { key: "s", label: "South", dx: 0, dy: 1, armIndex: 2 },
      { key: "w", label: "West", dx: -1, dy: 0, armIndex: 3 },
    ];
    arms.forEach(function (arm) {
      for (var i = 0; i < 8; i++) {
        var dist = 70 + i * 38;
        var x = hub.x + arm.dx * dist - 21;
        var y = hub.y + arm.dy * dist - 36;
        if (arm.dx === 0) x -= 0;
        slots.push(
          hangingSlot("arm-" + arm.key + "-" + i, "hanging-arm", x, y, {
            armIndex: arm.armIndex,
            armKey: arm.key,
            index: i,
            w: 40,
            h: 68,
          })
        );
      }
    });
    var pegs = [
      [hub.x - 70, hub.y - 70],
      [hub.x + 26, hub.y - 70],
      [hub.x - 70, hub.y + 26],
      [hub.x + 26, hub.y + 26],
    ];
    pegs.forEach(function (p, i) {
      slots.push(pegSlot("peg-" + i, p[0], p[1], { index: i }));
    });
    return {
      id: "fourWay",
      name: "4-Way Rack",
      subtitle: "Four hanging arms + side pegs",
      viewBox: "0 0 800 580",
      frame: "fourWay",
      slots: slots,
    };
  }

  function wallBay() {
    var slots = [];
    var i;
    for (i = 0; i < 12; i++) {
      slots.push(
        hangingSlot("bar-1-" + i, "hanging-upper", 48 + i * 54, 58, { index: i, bar: 1 })
      );
    }
    for (i = 0; i < 12; i++) {
      slots.push(
        hangingSlot("bar-2-" + i, "hanging-lower", 48 + i * 54, 210, { index: i, bar: 2 })
      );
    }
    for (i = 0; i < 8; i++) {
      slots.push(
        shelfSlot("shelf-" + i, "shelf-lower", 56 + i * 72, 400, { index: i, maxUnits: 1 })
      );
    }
    for (i = 0; i < 4; i++) {
      slots.push(pegSlot("wall-peg-" + i, 710, 58 + i * 78, { index: i }));
    }
    return {
      id: "wallBay",
      name: "3-Tier Wall Bay",
      subtitle: "Two hanging bars, lower shelf, side pegs",
      viewBox: "0 0 800 520",
      frame: "wallBay",
      slots: slots,
    };
  }

  function nestingTable() {
    var slots = [];
    var i;
    for (i = 0; i < 12; i++) {
      var col = i % 6;
      var row = Math.floor(i / 6);
      slots.push(
        shelfSlot("table-u-" + i, "table-upper", 90 + col * 90, 70 + row * 70, {
          index: i,
          w: 70,
          h: 52,
          maxUnits: 2,
        })
      );
    }
    for (i = 0; i < 12; i++) {
      col = i % 6;
      row = Math.floor(i / 6);
      slots.push(
        shelfSlot("table-l-" + i, "table-lower", 130 + col * 90, 300 + row * 70, {
          index: i,
          w: 70,
          h: 52,
          maxUnits: 2,
        })
      );
    }
    return {
      id: "nestingTable",
      name: "Nesting Table",
      subtitle: "Two display levels for folded stacks",
      viewBox: "0 0 800 520",
      frame: "nestingTable",
      slots: slots,
    };
  }

  var TEMPLATES = [fourWay(), wallBay(), nestingTable()];
  var byId = {};
  TEMPLATES.forEach(function (f) {
    f.capacity = f.slots.reduce(function (sum, s) {
      return sum + s.maxUnits;
    }, 0);
    byId[f.id] = f;
  });

  return {
    TEMPLATES: TEMPLATES,
    getById: function (id) {
      return byId[id] || TEMPLATES[0];
    },
    capacityOf: function (fixture) {
      return fixture.capacity;
    },
  };
});
