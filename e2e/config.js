/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  RETAIL_APP_HOME:
    process.env.RETAIL_APP_HOME ||
    "https://scaffold-pwa-e2e-tests-pwa-kit.mobify-storefront.com",
  GENERATED_PROJECTS_DIR: "../generated-projects",
  GENERATE_PROJECTS: ["retail-app-demo"],
  GENERATOR_CMD:
    "node packages/pwa-kit-create-app/scripts/create-mobify-app-dev.js --outputDir",
  CLI_RESPONSES: {
    "retail-app-demo": [
      {
        expectedPrompt: /Choose a project preset to get started:/i,
        response: "2\n",
      },
    ],
    "retail-app-private-client": [],
    "retail-react-app-bug-bounty": [],
    "retail-react-app-demo-site": [],
  },
  PRESET: {
    "retail-app-private-client": "retail-react-app-private-slas-client",
    "retail-react-app-bug-bounty": "retail-react-app-bug-bounty",
    "retail-react-app-demo-site": "retail-react-app-demo-site-internal"
  },
  EXPECTED_GENERATED_ARTIFACTS: {
    "retail-app-demo": [
      ".eslintignore",
      ".eslintrc.js",
      ".prettierrc.yaml",
      "babel.config.js",
      "config",
      "node_modules",
      "overrides",
      "package-lock.json",
      "package.json",
      "translations",
      "worker",
    ],
  },
  PWA_E2E_USER_EMAIL: process.env.PWA_E2E_USER_EMAIL,
  PWA_E2E_USER_PASSWORD: process.env.PWA_E2E_USER_PASSWORD,
  SOCIAL_LOGIN_RETAIL_APP_HOME: "https://wasatch-mrt-feature-public.mrt-storefront-staging.com"
};
