import { mkdir } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { devices, expect, test, type Browser, type Page } from "@playwright/test";

const email = "noor@example.com";
const password = "lijstje-demo-1";
const phone = devices["Pixel 7"];

async function resetDemoUser() {
  const prisma = new PrismaClient();
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
}

async function guestPage(browser: Browser) {
  const context = await browser.newContext({ ...phone });
  const page = await context.newPage();
  return { context, page };
}

async function addForm(page: Page) {
  const form = page.locator("details").filter({ has: page.locator("summary", { hasText: "Cadeau toevoegen" }) });
  if (!(await form.getByTestId("item-name").isVisible())) {
    await form.locator("summary").first().click();
  }
  const extra = form.locator("details").filter({ has: page.locator("summary", { hasText: "Meer opties" }) });
  if ((await extra.count()) > 0 && !(await extra.getByLabel(/^Prijs/).isVisible())) {
    await extra.locator("summary").click();
  }
  return form;
}

test("signup, list, claim privacy, shop prefill and cadeauzoeker", async ({ page, browser }) => {
  test.setTimeout(180_000);
  await resetDemoUser();
  await mkdir("/opt/cursor/artifacts", { recursive: true });

  await page.goto("/registreren");
  await page.getByLabel("Je naam").fill("Noor de Vries");
  await page.getByLabel("E-mailadres").fill(email);
  await page.getByLabel("Wachtwoord", { exact: true }).fill(password);
  await page.getByLabel("Herhaal wachtwoord").fill(password);
  await page.getByRole("button", { name: "Account maken" }).click();
  await expect(page.getByRole("heading", { name: "Mijn lijstjes" })).toBeVisible();

  await page.getByRole("link", { name: "Nieuw lijstje" }).click();
  await page.getByLabel("Naam van het lijstje").fill("Sinterklaas voor Noor");
  await page.locator("label").filter({ hasText: "Sinterklaas" }).click();
  await page.locator("#event-date").fill("2026-12-05");
  await page.getByRole("button", { name: "Lijstje maken" }).click();
  await expect(page.getByRole("heading", { name: "Sinterklaas voor Noor" })).toBeVisible();
  await expect(page.getByTestId("occasion-banner")).toContainText("Sinterklaas");

  let add = await addForm(page);
  await add.getByLabel("Naam", { exact: true }).fill("Houten treinset");
  await add.getByLabel(/Omschrijving/).fill("Met rails en een brug.");
  await add.getByLabel(/^Prijs/).fill("49,95");
  await add.getByLabel(/Prioriteit/).selectOption("3");
  await add.getByLabel(/Link naar een winkel/).fill("https://www.bol.com/nl/nl/s/?searchtext=houten%20treinset");
  await add.locator("form").getByRole("button", { name: "Cadeau toevoegen" }).click();
  await expect(page.getByRole("heading", { name: "Houten treinset" })).toBeVisible();

  add = await addForm(page);
  await add.getByLabel("Naam", { exact: true }).fill("Warme sloffen");
  await add.getByLabel(/Omschrijving/).fill("Zachte sloffen voor binnen.");
  await add.getByLabel(/^Prijs/).fill("14,50");
  await add.locator("form").getByRole("button", { name: "Cadeau toevoegen" }).click();
  await expect(page.getByRole("heading", { name: "Warme sloffen" })).toBeVisible();

  add = await addForm(page);
  await add.getByLabel(/Link naar een winkel/).fill("https://example.com");
  await add.getByRole("button", { name: "Gegevens ophalen" }).click();
  await expect(add.getByTestId("item-name")).toHaveValue(/Example Domain/i);
  await expect(add.getByTestId("product-notice")).toBeVisible();

  await page.reload();
  add = await addForm(page);
  await add.getByLabel(/Link naar een winkel/).fill("http://127.0.0.1/geheim");
  await add.getByRole("button", { name: "Gegevens ophalen" }).click();
  await expect(add.getByTestId("product-notice")).toContainText("niet ophalen");
  await expect(add.getByTestId("item-name")).toHaveValue("");

  const shareUrl = await page.getByTestId("share-url").inputValue();
  const claimer = await guestPage(browser);
  await claimer.page.goto(shareUrl);
  const sloffen = claimer.page.locator("article", { hasText: "Warme sloffen" });
  await sloffen.getByLabel("Jouw naam").fill("Oma Ineke");
  await sloffen.getByRole("button", { name: "Ik koop dit" }).click();
  await expect(sloffen.getByText("Jij koopt dit")).toBeVisible();

  const viewer = await guestPage(browser);
  await viewer.page.goto(shareUrl);
  await expect(viewer.page.getByText("Gereserveerd door Oma Ineke")).toBeVisible();
  await expect(viewer.page.getByRole("heading", { name: "Houten treinset" })).toBeVisible();

  await page.goto(new URL(shareUrl).pathname);
  await expect(page.getByText("Dit is jouw lijstje")).toBeVisible();
  expect(await page.content()).not.toContain("Oma Ineke");

  await page.getByRole("link", { name: "Lijstje bewerken" }).click();
  await expect(page.getByTestId("owner-list")).toBeVisible();
  const ownerHtml = await page.content();
  expect(ownerHtml).not.toContain("Oma Ineke");
  expect(ownerHtml).not.toContain("Gereserveerd");

  await sloffen.getByRole("button", { name: "Toch niet" }).click();
  await expect(sloffen.getByRole("button", { name: "Ik koop dit" })).toBeVisible();
  await sloffen.getByLabel("Jouw naam").fill("Oma Ineke");
  await sloffen.getByRole("button", { name: "Ik koop dit" }).click();
  await expect(sloffen.getByText("Jij koopt dit")).toBeVisible();
  await viewer.page.reload();
  await expect(viewer.page.getByText("Gereserveerd door Oma Ineke")).toBeVisible();

  await page.screenshot({ path: "/tmp/owner_list_view.png", fullPage: true });
  await viewer.page.screenshot({ path: "/tmp/shared_list_claimed.png", fullPage: true });

  await page.goto("/cadeauzoeker");
  const filters = page.getByRole("button", { name: /^Filters/ });
  if (await filters.isVisible()) await filters.click();
  await page.getByRole("button", { name: "Baby", exact: true }).click();
  const closeFilters = page.getByRole("button", { name: "Sluiten" });
  if (await closeFilters.isVisible()) await closeFilters.click();
  await expect(page.getByRole("heading", { name: "Zachte knuffel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Compacte espressomachine" })).toHaveCount(0);
  const knuffel = page.locator("article", { hasText: "Zachte knuffel" });
  await knuffel.getByRole("button", { name: "Zet op mijn lijstje" }).click();
  await expect(knuffel.getByText(/Staat nu op Sinterklaas voor Noor/)).toBeVisible();
  await page.screenshot({ path: "/tmp/cadeauzoeker.png", fullPage: true });

  await page.goto("/lijsten/nieuw");
  await page.getByLabel("Naam van het lijstje").fill("Housewarming bij Noor");
  await page.locator("label").filter({ hasText: "Anders" }).click();
  await page.getByLabel("Welke gelegenheid?").fill("Housewarming");
  await page.getByRole("button", { name: "Lijstje maken" }).click();
  await expect(page.getByTestId("occasion-banner")).toContainText("Housewarming");

  await claimer.context.close();
  await viewer.context.close();
});
