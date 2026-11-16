import { defineConfig, devices } from "@playwright/test";

process.env.DATABASE_URL ??= "postgresql://wensenlijstje:wensenlijstje@127.0.0.1:5432/wensenlijstje";
process.env.DIRECT_URL ??= process.env.DATABASE_URL;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    ...devices["Pixel 7"],
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
