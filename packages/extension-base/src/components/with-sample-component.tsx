/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'

// Define a type for the HOC props
type WithSampleComponentProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const withSampleComponent = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithSampleComponent: React.FC<P> = (props: WithSampleComponentProps) => {
        return (
            <div className="sample-component">
                <WrappedComponent {...(props as P)} />
            </div>
        )
    }

    return WithSampleComponent
}

export default withSampleComponent
