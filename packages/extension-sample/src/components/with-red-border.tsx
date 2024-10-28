/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'

// Define a type for the HOC props
type WithRedBorderProps = React.ComponentPropsWithoutRef<any>

export const FooContext = React.createContext('initial-context')

// Define the HOC function
const withRedBorder = <P extends {}>(WrappedComponent: React.ComponentType<P>) => {
  const WithRedBorder: React.FC<P> = (props: WithRedBorderProps) => {
    return (
      <div style={{ border: '2px solid red', padding: '10px' }}>
        <FooContext.Provider value='foo'>
          <WrappedComponent {...(props as P)} />
        </FooContext.Provider>
      </div>
    )
  }

  return WithRedBorder
}

export default withRedBorder
