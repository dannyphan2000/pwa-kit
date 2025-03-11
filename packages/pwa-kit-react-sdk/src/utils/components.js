/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Prefix used for components from the base template
export const BASE_TEMPLATE_PREFIX = "Base"

/**
 * Prefixes the display name of a component with the given prefix.
 * This is used in getRoutes to support serialization of routes by
 * namespacing component display names with the extension name as a 
 * prefix.
 * 
 * @param {string} displayName - The display name of the component.
 * @param {string} prefix - The prefix to add to the display name.
 * @returns {string} The prefixed display name.
 */
export const prefixDisplayName = (displayName, prefix) => {
    // Skip if component is already prefixed
    if (displayName.includes(".") && displayName.match(/^[^.]+/)[0]) return displayName
    return `${prefix}.${displayName}`
}