/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {FooContext} from '*/components/with-red-border'

// Define a type for the HOC props
type WithUsingFooProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const withUsingFoo = <P extends {}>(WrappedComponent: React.ComponentType<P>) => {
  const WithUsingFoo: React.FC<P> = (props: WithUsingFooProps) => {
    const context = React.useContext(FooContext)
    console.log('--- can access context', context)

    return (
          <WrappedComponent {...(props as P)} />
    )
  }

  return WithUsingFoo
}

export default withUsingFoo
