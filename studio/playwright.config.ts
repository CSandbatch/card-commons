import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    env: {
      STUDIO_MOCK_IMAGES: "true",
      PILOT_ACCESS_HASH: "07ae38b93d8054d84aac37039c71ad114a8685a3857084d568f260ce69f0737f",
      SESSION_SIGNING_SECRET: "e2e-only-secret-at-least-32-characters",
    },
  },
});
