/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import config from '../../config/default.json'

/**
 * This hook returns the configuration for the current application extension.
 */
export const useConfig = () => {
    return config
}
