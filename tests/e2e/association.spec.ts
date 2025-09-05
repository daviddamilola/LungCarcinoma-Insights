import { test, expect } from "@playwright/test";

test.describe("Association Table", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders page heading and table structure", async ({ page }) => {
    const pageHeading = page.getByRole("heading", { name: /Genes associated with lung carcinoma/i });
    await expect(pageHeading).toBeVisible();
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    const header = page.locator("thead tr");
    await expect(header.locator("th").nth(1)).toHaveText(/Approved Symbol/i);
    await expect(header.locator("th").nth(2)).toHaveText(/Gene Name/i);
    await expect(header.locator("th").nth(3)).toHaveText(/Overall Association Score/i);
    const dataRows = page.locator("tbody > tr").filter({ has: page.locator('td') });
    await expect(dataRows.first()).toBeVisible();
  });

  test("expands and collapses rows", async ({ page }) => {
    const firstRow = page.locator("tbody > tr").filter({ has: page.locator('td') }).first();
    const expandBtn = firstRow.getByRole("button", { name: /expand row/i });
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    const collapseBtn = firstRow.getByRole("button", { name: /collapse row/i });
    await expect(collapseBtn).toBeVisible();
    const barTab = page.getByRole("tab", { name: /bar chart/i });
    const radarTab = page.getByRole("tab", { name: /radar chart/i });
    await expect(barTab).toBeVisible();
    await expect(radarTab).toBeVisible();
    await collapseBtn.click();
    await expect(expandBtn).toBeVisible();
    await expect(barTab).not.toBeVisible();
    await expect(radarTab).not.toBeVisible();
  });

  test("displays bar chart correctly", async ({ page }) => {
    const firstRow = page.locator("tbody > tr").filter({ has: page.locator('td') }).first();
    await firstRow.getByRole("button", { name: /expand row/i }).click();
    const barTab = page.getByRole("tab", { name: /bar chart/i });
    await expect(barTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/Data Type Scores:.*and lung carcinoma/i)).toBeVisible();
    const chartSvg = page.locator("svg").first();
    await expect(chartSvg).toBeVisible();
  });

  test("displays radar chart correctly", async ({ page }) => {
    const firstRow = page.locator("tbody > tr").filter({ has: page.locator('td') }).first();
    await firstRow.getByRole("button", { name: /expand row/i }).click();
    const radarTab = page.getByRole("tab", { name: /radar chart/i });
    await radarTab.click();
    await expect(radarTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/Data Type Scores:.*and lung carcinoma/i)).toBeVisible();
    await expect(page.getByText("Known Drug")).toBeVisible();
    await expect(page.getByText("Literature")).toBeVisible();
    await expect(page.getByText("Genetic Association")).toBeVisible();
    await expect(page.getByText("Data Type")).toBeVisible();
    await expect(page.getByText("Association Score")).toBeVisible();
  });

  test("gene links navigate to correct URLs", async ({ page }) => {
    const firstRow = page.locator("tbody > tr").filter({ has: page.locator('td') }).first();
    const geneLink = firstRow.locator("td").nth(1).locator("a");
    await expect(geneLink).toBeVisible();
    await expect(geneLink).toHaveAttribute("href", /platform\.opentargets\.org\/target/i);
    await expect(geneLink).toHaveAttribute("target", "_blank");
    await expect(geneLink).toHaveAttribute("rel", "noreferrer");
  });

  test("displays gene information correctly", async ({ page }) => {
    const firstRow = page.locator("tbody > tr").filter({ has: page.locator('td') }).first();
    const symbolCell = firstRow.locator("td").nth(1);
    await expect(symbolCell.locator("a")).toBeVisible();
    const nameCell = firstRow.locator("td").nth(2);
    await expect(nameCell).toHaveText(/.+/); // Non-empty text
    const scoreCell = firstRow.locator("td").nth(3);
    await expect(scoreCell).toHaveText(/^\d\.\d{3}$/);
  });
});