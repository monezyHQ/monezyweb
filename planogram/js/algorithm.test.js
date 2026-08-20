#!/usr/bin/env node
"use strict";

var assert = require("assert");
var catalog = require("./catalog");
var fixtures = require("./fixtures");
var algo = require("./algorithm");

assert.strictEqual(catalog.PRODUCTS.length, 15, "catalog must have 15 items");

["sku", "name", "category", "colorHex", "colorFamily", "price", "defaultFacing", "image", "cutout"].forEach(function (key) {
  catalog.PRODUCTS.forEach(function (p) {
    assert.ok(p[key], p.sku + " missing " + key);
  });
});

var facings = { HANG_FORWARD: 1, HANG_SIDE: 1, FOLDED: 1, MANNEQUIN: 1 };
catalog.PRODUCTS.forEach(function (p) {
  assert.ok(facings[p.defaultFacing], "invalid facing " + p.defaultFacing);
});

var cats = {};
catalog.PRODUCTS.forEach(function (p) {
  cats[p.category] = true;
});
["jackets", "tees", "trousers", "skirts", "bags"].forEach(function (c) {
  assert.ok(cats[c], "missing category " + c);
});

assert.strictEqual(fixtures.TEMPLATES.length, 3);
["fourWay", "wallBay", "nestingTable"].forEach(function (id) {
  var f = fixtures.getById(id);
  assert.ok(f.slots.length > 0, id + " has slots");
  assert.ok(f.capacity >= 24, id + " capacity");
});

assert.strictEqual(fixtures.getById("fourWay").capacity, 40);
assert.strictEqual(fixtures.getById("wallBay").capacity, 40);

var ivory = catalog.PRODUCTS.find(function (p) {
  return p.sku === "TEE-2201";
});
var charcoal = catalog.PRODUCTS.find(function (p) {
  return p.sku === "TRS-3302";
});
assert.ok(algo.hexLuminance(ivory.colorHex) > algo.hexLuminance(charcoal.colorHex));

var helpers = {
  isTop: catalog.isTop,
  isBottom: catalog.isBottom,
  isAccessory: catalog.isAccessory,
};

var wall = fixtures.getById("wallBay");
var result = algo.autoGenerate({
  catalog: catalog.PRODUCTS,
  fixture: wall,
  rules: { colorFlow: true, crossMerch: true, coordinatePairing: true },
  helpers: helpers,
});

assert.ok(Object.keys(result.placements).length > 0, "placements created");

var upperSku = result.placements["bar-1-0"];
assert.ok(upperSku, "upper bar filled");
assert.ok(catalog.isTop(catalog.getBySku(upperSku.sku)), "upper bar should be a top");

var lowerSku = result.placements["bar-2-0"];
assert.ok(lowerSku, "lower bar filled");
assert.ok(catalog.isBottom(catalog.getBySku(lowerSku.sku)), "lower bar should be a bottom");

var peg = result.placements["wall-peg-0"];
assert.ok(peg, "peg filled");
assert.ok(catalog.isAccessory(catalog.getBySku(peg.sku)), "peg should be accessory");

var orderedTops = [];
wall.slots
  .filter(function (s) {
    return s.role === "hanging-upper";
  })
  .forEach(function (s) {
    var pl = result.placements[s.id];
    if (pl) orderedTops.push(catalog.getBySku(pl.sku));
  });
var uniqueTopCount = catalog.PRODUCTS.filter(catalog.isTop).length;
for (var i = 1; i < Math.min(orderedTops.length, uniqueTopCount); i++) {
  assert.ok(
    algo.hexLuminance(orderedTops[i - 1].colorHex) + 1e-9 >= algo.hexLuminance(orderedTops[i].colorHex),
    "color flow light to dark on upper bar"
  );
}

var util = algo.utilization(result.placements, wall.capacity);
assert.ok(util.units <= util.capacity);
assert.ok(util.units >= 30, "auto-planogram should fill most of the bay");
assert.ok(/items placed/.test(util.label));

var bom = algo.billOfMaterials(result.placements, catalog.getBySku);
assert.ok(bom.length >= 3);
assert.ok(bom[0].sku);
assert.ok(bom[0].units >= 1);

var four = algo.autoGenerate({
  catalog: catalog.PRODUCTS,
  fixture: fixtures.getById("fourWay"),
  rules: { colorFlow: true, crossMerch: true, coordinatePairing: true },
  helpers: helpers,
});
var armN = four.placements["arm-n-0"];
var armS = four.placements["arm-s-0"];
assert.ok(catalog.isTop(catalog.getBySku(armN.sku)));
assert.ok(catalog.isBottom(catalog.getBySku(armS.sku)));

var table = algo.autoGenerate({
  catalog: catalog.PRODUCTS,
  fixture: fixtures.getById("nestingTable"),
  rules: { colorFlow: true, crossMerch: true, coordinatePairing: true },
  helpers: helpers,
});
assert.ok(catalog.isTop(catalog.getBySku(table.placements["table-u-0"].sku)));

var notes = algo.merchandisingNotes(wall, result);
assert.ok(notes.length >= 3);

console.log("planogram tests passed");
console.log("  catalog", catalog.PRODUCTS.length);
console.log("  wall utilization", util.label);
console.log("  BOM lines", bom.length);
