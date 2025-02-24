/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {NavigationGuardProvider} from 'overridable!../contexts'
// Define a type for the HOC props
type SampleHOCProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const sampleHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const config = getConfig()
    
    const navigationGuardCallback = async () => {
        // In W-17530042, updateRoutes will be used here and return false after API call completion
        // A manual delay is added for now just to see the skeleton that would show while the API call is made
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        await delay(10000)
    
        return false
    }
    
    
    const SampleHOC: React.FC<P> = (props: SampleHOCProps) => {
        return (
            true ?
            <NavigationGuardProvider callback={navigationGuardCallback}>
                <WrappedComponent {...(props as P)}/>
            </NavigationGuardProvider>
            : <WrappedComponent {...(props as P)}/>

            
        )
    }
                // <NavigationGuardProvider callback={navigationGuardCallback}>
                {/* <WrappedComponent {...(props as P)}/> */}
            {/* </NavigationGuardProvider> */}
    
    return SampleHOC    
}

export default sampleHOC
