import React from 'react'
import {render} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react/dist/cjs/chakra-provider.cjs'
import {StoreLocatorProvider} from '*/components/store-locator/store-locator-provider'

const CONFIG = {
    "path": "/store-locator",
    "defaultDistance": 100,
    "defaultDistanceUnit": "km",
    "defaultPageSize": 10,
    "defaultPostalCode": "10178",
    "defaultCountry": "Germany",
    "defaultCountryCode": "DE",
    "supportedCountries": [
      {
        "countryCode": "US",
        "countryName": "United States"
      },
      {
        "countryCode": "DE",
        "countryName": "Germany"
      }
    ]
  }

const renderWithProviders = (ui, options = {}) => {
    const Wrapper = ({children}) => (
        <ChakraProvider theme={{}}>
            <StoreLocatorProvider config={CONFIG}>{children}</StoreLocatorProvider>
        </ChakraProvider>
    )
    return render(ui, {wrapper: Wrapper, ...options})
}

export {renderWithProviders}
