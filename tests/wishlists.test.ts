import "./env";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { clearAllData } from "../src/lib/db";
import { parseOwnerIds, serializeOwnerIds } from "../src/lib/cookies";
import { formatPrice } from "../src/lib/format";
import {
  addItem,
  clearReservation,
  createWishlist,
  deleteItem,
  deleteWishlist,
  getOwnerWishlist,
  getPublicWishlist,
  moveItem,
  reserveItem,
  updateItem,
  updateWishlist,
} from "../src/lib/wishlists";
import { parseHttpUrl, parseItemDraft, parsePriceToCents } from "../src/lib/validate";

const SECRET = "GEHEIM-NAAM-XYZ";

beforeEach(() => {
  clearAllData();
});

describe("prijzen en links", () => {
  it("begrijpt Nederlandse en Engelse bedragen", () => {
    assert.equal(parsePriceToCents(""), null);
    assert.equal(parsePriceToCents("   "), null);
    assert.equal(parsePriceToCents("12"), 1200);
    assert.equal(parsePriceToCents("12,5"), 1250);
    assert.equal(parsePriceToCents("12,50"), 1250);
    assert.equal(parsePriceToCents("12.50"), 1250);
    assert.equal(parsePriceToCents("€ 1.234,56"), 123456);
    assert.equal(parsePriceToCents("-1"), "invalid");
    assert.equal(parsePriceToCents("abc"), "invalid");
    assert.equal(parsePriceToCents("12,3456"), "invalid");
  });

  it("laat alleen http(s) en lokale paden toe", () => {
    assert.equal(parseHttpUrl(""), null);
    assert.equal(parseHttpUrl("https://winkel.example/boek"), "https://winkel.example/boek");
    assert.equal(parseHttpUrl("/voorbeelden/boek.svg"), "/voorbeelden/boek.svg");
    assert.equal(parseHttpUrl("javascript:alert(1)"), "invalid");
    assert.equal(parseHttpUrl("notaurl"), "invalid");
    assert.equal(parseHttpUrl("//evil.example"), "invalid");
    assert.equal(parseHttpUrl("/../etc/passwd"), "invalid");
  });

  it("weigert een cadeau zonder naam", () => {
    const result = parseItemDraft({
      name: "  ",
      url: "",
      price: "",
      imageUrl: "",
      note: "",
      priority: "",
    });
    assert.equal(result.ok, false);
  });
});

describe("lijstjes", () => {
  it("maakt een lijstje, past het aan en verwijdert het", () => {
    const created = createWishlist({
      title: "  Sinterklaas voor Noor ",
      description: "Liever iets persoonlijks.",
      occasion: "Sinterklaas",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    assert.equal(created.data.list.title, "Sinterklaas voor Noor");
    assert.equal(getOwnerWishlist("bestaat-niet"), null);

    const updated = updateWishlist(created.data.ownerToken, {
      title: "Kerst voor Noor",
      description: "",
      occasion: "Kerst",
    });
    assert.equal(updated.ok, true);
    if (!updated.ok) return;
    assert.equal(updated.data.title, "Kerst voor Noor");
    assert.equal(updated.data.description, null);
    assert.ok(updated.data.revision > created.data.list.revision);

    const removed = deleteWishlist(created.data.ownerToken);
    assert.equal(removed.ok, true);
    assert.equal(getOwnerWishlist(created.data.ownerToken), null);
  });

  it("voegt cadeaus toe, bewerkt ze en zet ze in een andere volgorde", () => {
    const created = createWishlist({ title: "Verjaardag", description: "", occasion: "Verjaardag" });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const token = created.data.ownerToken;

    const first = addItem(token, {
      name: "Boek",
      url: "https://winkel.example/boek",
      price: "16,50",
      imageUrl: "/voorbeelden/boek.svg",
      note: "Het grote exemplaar",
      priority: "hoog",
    });
    const second = addItem(token, {
      name: "Verf",
      url: "",
      price: "",
      imageUrl: "",
      note: "",
      priority: "",
    });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.deepEqual(
      second.data.items.map((item) => item.name),
      ["Boek", "Verf"],
    );
    assert.equal(second.data.items[0]?.priceCents, 1650);
    assert.equal(formatPrice(1650).includes("16,50"), true);

    const boek = second.data.items[0];
    assert.ok(boek);
    const edited = updateItem(token, boek.id, {
      name: "Prentenboek",
      url: "",
      price: "18",
      imageUrl: "",
      note: "Hardcover",
      priority: "normaal",
    });
    assert.equal(edited.ok, true);
    if (!edited.ok) return;
    assert.equal(edited.data.items[0]?.name, "Prentenboek");
    assert.equal(edited.data.items[0]?.priceCents, 1800);

    const moved = moveItem(token, boek.id, 1);
    assert.equal(moved.ok, true);
    if (!moved.ok) return;
    assert.deepEqual(
      moved.data.items.map((item) => item.name),
      ["Verf", "Prentenboek"],
    );

    const verf = moved.data.items[0];
    assert.ok(verf);
    const afterDelete = deleteItem(token, verf.id);
    assert.equal(afterDelete.ok, true);
    if (!afterDelete.ok) return;
    assert.deepEqual(
      afterDelete.data.items.map((item) => item.name),
      ["Prentenboek"],
    );
    assert.equal(afterDelete.data.items[0]?.position, 0);
  });
});

describe("verrassing", () => {
  it("verbergt reserveringen voor de eigenaar en toont ze aan gasten", () => {
    const created = createWishlist({ title: "Sinterklaas", description: "", occasion: "Sinterklaas" });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const withItem = addItem(created.data.ownerToken, {
      name: "Pantoffels",
      url: "",
      price: "22,00",
      imageUrl: "",
      note: "Maat 28",
      priority: "hoog",
    });
    assert.equal(withItem.ok, true);
    if (!withItem.ok) return;
    const item = withItem.data.items[0];
    assert.ok(item);

    const reserved = reserveItem(withItem.data.id, item.id, "gast-oma", {
      status: "gereserveerd",
      name: SECRET,
    });
    assert.equal(reserved.ok, true);
    if (!reserved.ok) return;
    assert.equal(reserved.data.items[0]?.reservation?.name, SECRET);
    assert.equal(reserved.data.items[0]?.reservation?.mine, true);
    assert.equal(reserved.data.items[0]?.reservation?.status, "gereserveerd");

    const owner = getOwnerWishlist(created.data.ownerToken);
    assert.ok(owner);
    assert.equal(JSON.stringify(owner).includes(SECRET), false);
    assert.equal(JSON.stringify(owner).includes("gereserveerd"), false);
    assert.equal(JSON.stringify(owner).includes("reservation"), false);
    assert.deepEqual(Object.keys(owner.items[0] ?? {}).sort(), [
      "id",
      "imageUrl",
      "name",
      "note",
      "position",
      "priceCents",
      "priority",
      "url",
    ]);

    const hidden = getPublicWishlist(withItem.data.id, { includeReservations: false, visitorId: null });
    assert.equal(JSON.stringify(hidden).includes(SECRET), false);
    assert.equal(hidden?.ownerView, true);
    assert.equal(hidden?.items[0]?.reservation, null);

    const otherGuest = getPublicWishlist(withItem.data.id, {
      includeReservations: true,
      visitorId: "iemand-anders",
    });
    assert.equal(otherGuest?.items[0]?.reservation?.name, SECRET);
    assert.equal(otherGuest?.items[0]?.reservation?.mine, false);
    assert.equal(JSON.stringify(otherGuest).includes("gast-oma"), false);

    const blocked = reserveItem(withItem.data.id, item.id, "iemand-anders", {
      status: "gekocht",
      name: "Piet",
    });
    assert.equal(blocked.ok, false);

    const bought = reserveItem(withItem.data.id, item.id, "gast-oma", { status: "gekocht", name: SECRET });
    assert.equal(bought.ok, true);
    if (!bought.ok) return;
    assert.equal(bought.data.items[0]?.reservation?.status, "gekocht");

    const stolen = clearReservation(withItem.data.id, item.id, "iemand-anders");
    assert.equal(stolen.ok, false);
    const cleared = clearReservation(withItem.data.id, item.id, "gast-oma");
    assert.equal(cleared.ok, true);
    if (!cleared.ok) return;
    assert.equal(cleared.data.items[0]?.reservation, null);
  });

  it("haalt een reservering weg als het cadeau verdwijnt", () => {
    const created = createWishlist({ title: "Kerst", description: "", occasion: "Kerst" });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const withItem = addItem(created.data.ownerToken, {
      name: "Sjaal",
      url: "",
      price: "",
      imageUrl: "",
      note: "",
      priority: "",
    });
    assert.equal(withItem.ok, true);
    if (!withItem.ok) return;
    const item = withItem.data.items[0];
    assert.ok(item);
    assert.equal(reserveItem(withItem.data.id, item.id, "gast", { status: "gereserveerd", name: SECRET }).ok, true);
    assert.equal(deleteItem(created.data.ownerToken, item.id).ok, true);
    const pub = getPublicWishlist(withItem.data.id, { includeReservations: true, visitorId: "gast" });
    assert.equal(pub?.items.length, 0);
    assert.equal(JSON.stringify(pub).includes(SECRET), false);
  });
});

describe("cookies", () => {
  it("bewaart alleen geldige lijst-id's", () => {
    const ids = parseOwnerIds("abc_defg, te-kort, ../hack, geldig-id-12");
    assert.deepEqual(ids, ["abc_defg", "geldig-id-12"]);
    assert.equal(serializeOwnerIds(["a", "a", "b"]), "a,b");
  });
});
