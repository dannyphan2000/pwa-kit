/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useContext, useEffect} from 'react'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {NavigationGuardProvider, NavigationGuardContext} from 'overridable!../overrides'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {sliceInitializer} from '../types'
import { useApplicationExtensionsStore } from '@salesforce/pwa-kit-extension-sdk/react'
// Define a type for the HOC props
type SampleHOCProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const sampleHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const config = getConfig()
    // console.log("(JEREMY) hey")
    const navigationGuardCallback = async () => {
        // In W-17530042, updateRoutes will be used here and return false after API call completion
        // A manual delay is added for now just to see the skeleton that would show while the API call is made
        // console.log("(JEREMY) about to run delay!")
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        await delay(10000)
        // console.log("(JEREMY) delay finished!")
    
        return false
    }

    const SampleHOC: React.FC<P> = (props: SampleHOCProps) => {
        // const isBlocked = useBlockNavigation(async () => {
            // await navigationGuardCallback()
            // return false
        // })

        // const thing = useContext(NavigationGuardContext)
        // console.log("(JEREMY) thing: ", thing)
        return (
            <NavigationGuardProvider callback={navigationGuardCallback}>
                <div>
                    AYOOOOOOOO
                </div>
                <WrappedComponent {...(props as P)}/>
            </NavigationGuardProvider>
        )
    }
    
    return SampleHOC    
}

export default sampleHOC
