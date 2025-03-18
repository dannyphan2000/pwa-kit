/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Caches the result of a method in the specified `cacheProperty`.
 * On the first call, the method's result is stored and returned on subsequent calls.
 * If the result is a Promise, the property stores the resolved value; otherwise, it stores the raw value.
 *
 * @param cacheProperty The property to cache the result in.
 * @returns A method decorator.
 */
export function CacheResult(cacheProperty: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      if (this[cacheProperty] !== null) {
        return this[cacheProperty];
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        const promise = result.then((resolved) => (this[cacheProperty] = resolved));
        this[cacheProperty] = promise;
        return promise;
      } else {
        return (this[cacheProperty] = result);
      }
    };
  };
}
