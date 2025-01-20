/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {create} from 'zustand';
import {StateCreator} from 'zustand';
import {devtools} from 'zustand/middleware';

export type SliceInitializer<T> = (set: (partial: any) => void, get: () => BaseStore) => T;

interface BaseStore {
  state: Record<string, any>;
  addSlice: <T>(sliceName: string, sliceInitializer: SliceInitializer<T>) => void;
  getSlice: <T>(sliceName: string) => T | undefined;
}

export const useStore = create<BaseStore>()(
  devtools((set, get) => ({
    state: {},

    // Dynamically add a slice
    addSlice: <T, /* generic */>(sliceName: string, sliceInitializer: SliceInitializer<T>) => {
      set((state) => ({
        state: {
          ...state.state,
          [sliceName]: sliceInitializer(set, get),
        },
      }));
    },

    // Retrieve a slice
    getSlice: <T,>(sliceName: string): T | undefined => {
      return get().state[sliceName];
    },
  }))
);
