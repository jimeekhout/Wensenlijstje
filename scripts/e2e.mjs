import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const port = 3456;
const base = `http://127.0.0.1:${port}`;
const shots = path.join("/tmp", "wensenlijstje-shots");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer(child) {
  const started = Date.now();
  let log = "";
  child.stdout?.on("data", (chunk) => {
    log += chunk.toString();
  });
  child.stderr?.on("data", (chunk) => {
    log += chunk.toString();
  });
  while (Date.now() - started < 30000) {
    if (child.exitCode != null) {
      throw new Error(`Server stopte vroegtijdig (${child.exitCode}).\n${log}`);
    }
    if (log.includes("Ready") || log.includes("Local:")) {
      try {
        const response = await fetch(base);
        if (response.ok) return;
      } catch {
        // Server is still booting.
      }
    }
    await delay(200);
  }
  throw new Error(`Server werd niet bereikbaar.\n${log}`);
}

async function main() {
  await rm(shots, { recursive: true, force: true });
  await mkdir(shots, { recursive: true });

  const child = spawn("npx", ["next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production", COOKIE_SECURE: "false", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  let browser;
  try {
    await waitForServer(child);
    browser = await chromium.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const ownerContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const owner = await ownerContext.newPage();
    await owner.goto(base);
    await owner.locator("[data-ready='ja']").waitFor();
    await owner.getByLabel("Titel").fill("Sinterklaas voor Noor");
    await owner.getByText("Sinterklaas", { exact: true }).click();
    await owner.getByLabel("Omschrijving").fill("Voor pakjesavond. Liever iets persoonlijks dan nog een sok.");
    await owner.getByRole("button", { name: "Lijstje maken" }).click();
    await owner.waitForURL("**/lijst/**");
    await owner.locator("[data-ready='ja']").waitFor();

    await owner.getByLabel("Naam").fill("Prentenboek over de ruimte");
    await owner.getByLabel("Link naar de winkel").fill("https://winkel.example/prentenboek");
    await owner.getByLabel("Prijs").fill("16,50");
    await owner.getByLabel("Afbeelding (link)").fill("/voorbeelden/boek.svg");
    await owner.getByText("Hoog", { exact: true }).click();
    await owner.getByLabel("Notitie").fill("Het grote exemplaar, met harde kaft.");
    await owner.getByRole("button", { name: "Toevoegen" }).click();
    await owner.getByRole("heading", { name: "Prentenboek over de ruimte" }).waitFor();

    await owner.getByRole("button", { name: "Cadeau toevoegen" }).click();
    await owner.getByLabel("Naam").fill("Waterverfset");
    await owner.getByLabel("Prijs").fill("12,00");
    await owner.getByLabel("Afbeelding (link)").fill("/voorbeelden/verf.svg");
    await owner.getByText("Normaal", { exact: true }).click();
    await owner.getByRole("button", { name: "Toevoegen" }).click();
    await owner.getByRole("heading", { name: "Waterverfset" }).waitFor();

    await owner.getByRole("button", { name: "Cadeau toevoegen" }).click();
    await owner.getByLabel("Naam").fill("Warme pantoffels");
    await owner.getByLabel("Afbeelding (link)").fill("/voorbeelden/pantoffels.svg");
    await owner.getByLabel("Notitie").fill("Maat 28");
    await owner.getByRole("button", { name: "Toevoegen" }).click();
    await owner.getByRole("heading", { name: "Warme pantoffels" }).waitFor();

    const pantoffel = owner.getByRole("article").filter({ hasText: "Warme pantoffels" });
    await pantoffel.getByRole("button", { name: "Omhoog" }).click();
    await owner.getByRole("heading", { name: "Warme pantoffels" }).waitFor();

    const ownerHtml = await owner.content();
    assert(!ownerHtml.includes("Oma Truus"), "Eigenaarspagina noemt een gever vóór er gereserveerd is.");
    assert(ownerHtml.includes("Reserveringen blijven verborgen"), "De verrassingstekst ontbreekt.");
    await owner.screenshot({ path: path.join(shots, "owner-desktop.png"), fullPage: true });

    const shareUrl = await owner.getByRole("textbox", { name: "Deellink" }).inputValue();
    const ownerUrl = owner.url();
    assert(shareUrl.includes("/delen/"), `Onverwachte deellink: ${shareUrl}`);

    await owner.waitForFunction(async () => {
      const response = await fetch("/delen/onbekend");
      return response.status > 0;
    });
    const cookies = await ownerContext.cookies();
    assert(
      cookies.some((cookie) => cookie.name === "wl_owner" && cookie.value.length > 0),
      "De eigenaarcookie is niet gezet.",
    );

    const guestContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const guest = await guestContext.newPage();
    await guest.goto(shareUrl);
    await guest.locator("[data-ready='ja']").waitFor();
    await guest.getByRole("heading", { name: "Prentenboek over de ruimte" }).waitFor();
    const book = guest.getByRole("article").filter({ hasText: "Prentenboek over de ruimte" });
    await book.getByLabel("Jouw naam (optioneel)").fill("Oma Truus");
    await book.getByRole("button", { name: "Reserveren" }).click();
    await book.getByText("Gereserveerd door jou (Oma Truus)").waitFor();
    const guestHtml = await guest.content();
    assert(guestHtml.includes("Oma Truus"), "De gast ziet de eigen reservering niet.");
    await guest.screenshot({ path: path.join(shots, "guest-desktop.png"), fullPage: true });

    await guest.setViewportSize({ width: 390, height: 844 });
    await guest.screenshot({ path: path.join(shots, "guest-mobile.png"), fullPage: true });

    await owner.goto(ownerUrl);
    await owner.locator("[data-ready='ja']").waitFor();
    await owner.getByRole("heading", { name: "Prentenboek over de ruimte" }).waitFor();
    const ownerAfter = await owner.content();
    assert(!ownerAfter.includes("Oma Truus"), "De eigenaar ziet de naam van de gever.");
    assert(!ownerAfter.includes("Gereserveerd door"), "De eigenaar ziet een reserveringsstatus.");
    assert(ownerAfter.includes("Warme pantoffels"), "Een cadeau ontbreekt op de beheerpagina.");

    await owner.goto(shareUrl);
    await owner.locator("[data-ready='ja']").waitFor();
    await owner.getByText("Je bekijkt je eigen deellink.").waitFor();
    const ownerShare = await owner.content();
    assert(!ownerShare.includes("Oma Truus"), "De deellink in de browser van de eigenaar toont de reservering.");
    assert(!ownerShare.includes("Gereserveerd door"), "De deellink van de eigenaar toont een status.");

    const strangerContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const other = await strangerContext.newPage();
    await other.goto(shareUrl);
    await other.getByText("Gereserveerd door Oma Truus").waitFor();

    console.log("E2E geslaagd");
    console.log(shareUrl);
  } finally {
    await browser?.close();
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
