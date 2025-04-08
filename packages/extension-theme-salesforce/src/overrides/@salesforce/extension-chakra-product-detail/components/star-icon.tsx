/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import { createIcon } from '@chakra-ui/icons'

export const HappyFaceIcon = createIcon({
    displayName: 'HappyFaceIcon',
    viewBox: '0 0 24 24',
    path: (
      <>
        {/* Face Circle */}
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        {/* Eyes */}
        <circle cx="8" cy="10" r="1.5" fill="white" />
        <circle cx="16" cy="10" r="1.5" fill="white" />
        {/* Smile */}
        <path
          d="M8 15c1.5 2 6.5 2 8 0"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  })

export default HappyFaceIcon