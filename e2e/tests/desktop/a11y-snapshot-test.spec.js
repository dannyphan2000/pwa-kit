/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const config = require('../../config');
const {answerConsentTrackingForm, navigateToPDPDesktop} = require('../../scripts/pageHelpers')

/**
 * Helper function to strip dynamic content from HTML to make snapshots more stable
 *
 * @param {string} html - HTML string
 * @returns {string} - HTML string with dynamic content removed
 */
function sanitizeHtml(html) {
  return html
    // Remove IDs which may change
    .replace(/id="[^"]*"/g, 'id="..."')
    // Remove data attributes which may change
    .replace(/data-[a-zA-Z0-9-]+="[^"]*"/g, '')
    // Simplify classes which may change
    .replace(/class="[^"]*"/g, 'class="..."')
    // Remove inline styles which may change
    .replace(/style="[^"]*"/g, '')
    // Remove content of script tags
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '<script>...</script>')
    // Trim whitespace
    .trim();
}

/**
 * Helper function to create simplified violation objects for snapshots
 *
 * @param {Array} violations - Array of axe-core violations
 * @returns {Array} - Array of simplified violation objects
 */
function simplifyViolations(violations) {
  return violations.map(violation => ({
    id: violation.id,                      // Rule ID
    impact: violation.impact,              // Impact (critical, serious, moderate, minor)
    description: violation.description,    // Description of the rule
    help: violation.help,                  // Short description
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map(node => ({
      // Simplify the HTML to make it more stable for snapshots
      html: sanitizeHtml(node.html),
      // Include the important failure information
      failureSummary: node.failureSummary,
      // Simplify target selectors for stability
      // #app-header[data-v-12345] > .navigation[data-testid="main-nav"] => #app-header > .navigation
      target: node.target.map(t => t.split(/\[.*?\]/).join('')),
    }))
  }));
}

/**
 * Runs an accessibility analysis on the current page
 *
 * @param {Page} page - Playwright page object
 * @param {string} snapshotName - Name for the snapshot file
 */
async function runAccessibilityTest(page, snapshotName) {
  // Run the accessibility audit
  const accessibilityScanResults = await new AxeBuilder({ page })
    .analyze();

  console.log(`Found ${accessibilityScanResults.violations.length} accessibility violations`);

  // Create simplified versions of violations for more stable snapshots
  const simplifiedViolations = simplifyViolations(accessibilityScanResults.violations);

  // Convert to JSON string for stable snapshot comparison
  const violationsJson = JSON.stringify(simplifiedViolations, null, 2);

  // Compare with snapshot - using string comparison instead of object comparison
  expect(violationsJson).toMatchSnapshot(snapshotName);
}

test.describe('Accessibility Tests with Snapshots', () => {
  test('Homepage should not have new accessibility issues', async ({ page }) => {
    // Go to the homepage
    await page.goto(config.RETAIL_APP_HOME);

    // Handle the consent tracking form using the existing helper
    await answerConsentTrackingForm(page);

    // wait until product tiles are fully load before analyzing
    await expect(
      page.getByRole("link", { name: /Denim slim skirt/i })
    ).toBeVisible();

    // Run the a11y test
    await runAccessibilityTest(page, 'homepage-a11y-violations.json');
  });

  test.only('Product Listing Page should not have new accessibility issues', async ({ page }) => {
    await page.goto(config.RETAIL_APP_HOME)
    await answerConsentTrackingForm(page)

    await page.getByRole('link', {name: 'Womens'}).hover()
    const topsNav = await page.getByRole('link', {name: 'Tops', exact: true})
    await expect(topsNav).toBeVisible()

    await topsNav.click()
    const productTile = page.getByRole('link', {
      name: /Cotton Turtleneck Sweater/i
    })
    await expect(productTile.getByText(/From \$39\.99/i)).toBeVisible()

    // Run the a11y test
    await runAccessibilityTest(page, 'plp-a11y-violations.json');
  });

  test('Product Detail Page should not have new accessibility issues', async ({ page }) => {
    // Go to a specific product page (you may need to adjust this to an actual product that exists)
    await page.goto(`${config.RETAIL_APP_HOME}/product/25696986M`);

    // Handle the consent tracking form using the existing helper
    await answerConsentTrackingForm(page);

    // Wait for product details to be visible
    await expect(page.locator('.product-details')).toBeVisible();

    // Wait for price to be visible to ensure page is loaded
    await expect(page.locator('.price')).toBeVisible();

    // Run the a11y test
    await runAccessibilityTest(page, 'pdp-a11y-violations.json');
  });
});
