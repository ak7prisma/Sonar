import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES_TO_AUDIT = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/courses",
  "/upload",
  "/reader",
  "/review",
  "/settings",
  "/admin",
];

for (const route of ROUTES_TO_AUDIT) {
  test(`WCAG 2.2 AA audit & structural checks on ${route}`, async ({
    page,
  }) => {
    await page.goto(route, { waitUntil: "load" });
    await page.locator("main h1").first().waitFor({ state: "visible", timeout: 15000 });

    // Ensure exactly one main landmark and one h1 heading
    const mainCount = await page.locator("main#main-content").count();
    expect(mainCount).toBe(1);

    const h1Count = await page.locator("main h1").count();
    expect(h1Count).toBe(1);

    // Ensure <html lang="..."> is set
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBeTruthy();

    // Run axe-core across WCAG 2.0/2.1/2.2 Level A & AA
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(
      results.violations,
      `Accessibility violations on ${route}: ${JSON.stringify(
        results.violations,
        null,
        2
      )}`
    ).toEqual([]);
  });
}

test("Keyboard-only navigation: SkipLink first Tab -> #main-content & Escape closes popover", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // First Tab should focus the SkipLink
  await page.keyboard.press("Tab");
  const activeTag = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    className: document.activeElement?.className,
    href: document.activeElement?.getAttribute("href"),
  }));
  expect(activeTag.tag).toBe("A");
  expect(activeTag.href).toBe("#main-content");

  // Open Reading Preferences popover and verify Escape closes it and restores focus
  const prefBtn = page.getByRole("button", {
    name: /reading display/i,
  });
  await prefBtn.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", {
    name: /reading preferences controls/i,
  });
  await expect(dialog).toBeVisible();

  const popoverResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(popoverResults.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(prefBtn).toBeFocused();
});
