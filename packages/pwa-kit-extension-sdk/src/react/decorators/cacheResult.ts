/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export function CacheResult(cacheProperty: string): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;
  
      descriptor.value = async function (this: any, ...args: any[]) {
        if (!this[cacheProperty]) {
          this[cacheProperty] = await originalMethod.apply(this, args);
        }
        return this[cacheProperty];
      };
    };
  }