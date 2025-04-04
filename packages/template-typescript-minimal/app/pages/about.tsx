'use client'

/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import ServerComponentDemo from '../components/ServerComponentDemo'

interface Props {
    value: number
    data: unknown
}
function About() {
    return (
        <div>
            About
            {/* React Server Component Demo */}
            <ServerComponentDemo />
        </div>
    )
}

export default About
