/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {useForm} from 'react-hook-form'
import {
    Box,
    Button,
    InputGroup,
    Select,
    FormControl,
    FormErrorMessage,
    Input
} from '@chakra-ui/react'

// import {AlertIcon} from '@salesforce/retail-react-app/app/components/icons'
import { Controller } from "react-hook-form";
import { useStoreLocator } from "*/components/store-locator/use-store-locator";

const useGeolocation = () => {
  const {
    setSearchStoresParams,
    setAutomaticGeolocationHasFailed,
    setUserHasSetManualGeolocation,
    userHasSetManualGeolocation,
    config,
  } = useStoreLocator();

  const getGeolocationError = () => {
    setAutomaticGeolocationHasFailed(true);
  };

  const getGeolocationSuccess = (position) => {
    setAutomaticGeolocationHasFailed(false);
    setSearchStoresParams({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      limit: config.defaultPageSize,
    });
  };

  const getUserGeolocation = () => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        getGeolocationSuccess,
        getGeolocationError
      );
      setUserHasSetManualGeolocation(false);
    } else {
      console.log("Geolocation not supported");
    }
  };

  useEffect(() => {
    if (!userHasSetManualGeolocation) getUserGeolocation();
  }, []);

  return getUserGeolocation;
};

export const StoreLocatorForm = ({ refetch }) => {
  const {
    searchStoresParams,
    userHasSetManualGeolocation,
    automaticGeolocationHasFailed,
    setUserWantsToShareLocation,
    userWantsToShareLocation,
    config,
  } = useStoreLocator();
  const { countryCode, postalCode } = searchStoresParams;
  const getUserGeolocation = useGeolocation();
  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      countryCode: userHasSetManualGeolocation ? countryCode : "",
      postalCode: userHasSetManualGeolocation ? postalCode : "",
    },
  });
  const { control } = form;

  const submitForm = async (formData) => {
    const { postalCode, countryCode } = formData;
    if (postalCode !== "") {
      if (countryCode !== "") {
        setSearchStoresParams({
          postalCode: postalCode,
          countryCode: countryCode,
          limit: config.defaultPageSize,
        });
        setUserHasSetManualGeolocation(true);
      } else {
        if (config.supportedCountries.length === 0) {
          setSearchStoresParams({
            postalCode: postalCode,
            countryCode: config.defaultCountryCode,
            limit: config.defaultPageSize,
          });
          setUserHasSetManualGeolocation(true);
        }
      }
    }
    setNumStoresToShow(config.defaultPageSize);
    refetch();
  };

    return (
        <form id="store-locator-form" onSubmit={form.handleSubmit(submitForm)}>
            <InputGroup>
                {config.supportedCountries.length > 0 && (
                    <Controller
                        name="countryCode"
                        control={control}
                        defaultValue={
                            userHasSetManualGeolocation ? searchStoresParams?.countryCode : ''
                        }
                        rules={{
                            required: 'Please select a country.'
                        }}
                        render={({field}) => {
                            return config.supportedCountries.length !== 0 ? (
                                <FormControl isInvalid={form.formState.errors.countryCode}>
                                    <Select
                                        {...field}
                                        marginBottom="10px"
                                        placeholder={'Select a country'}
                                        borderColor="gray.500"
                                    >
                                        {config.supportedCountries.map(
                                            ({countryCode, countryName}) => {
                                                return (
                                                    <option value={countryCode} key={countryCode}>
                                                        {countryName}
                                                    </option>
                                                )
                                            }
                                        )}
                                    </Select>
                                    {form.formState.errors.countryCode && (
                                        <FormErrorMessage
                                            sx={{marginBottom: '10px'}}
                                            color="red.600"
                                        >
                                            {/* <AlertIcon aria-hidden="true" mr={2} /> */}
                                            {form.formState.errors.countryCode.message}
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            ) : (
                                <></>
                            )
                        }}
                    ></Controller>
                )}
            </InputGroup>
            <InputGroup>
                <Controller
                    name="postalCode"
                    control={control}
                    rules={{
                        required: 'Please enter a postal code.'
                    }}
                    defaultValue={userHasSetManualGeolocation ? searchStoresParams?.postalCode : ''}
                    render={({field}) => {
                        return (
                            <FormControl isInvalid={form.formState.errors.postalCode}>
                                <Input {...field} placeholder={'Enter postal code'} />
                                {form.formState.errors.postalCode && (
                                    <FormErrorMessage sx={{top: '-20px'}} color="red.600">
                                        {/* <AlertIcon aria-hidden="true" mr={2} /> */}
                                        {form.formState.errors.postalCode.message}
                                    </FormErrorMessage>
                                )}
                            </FormControl>
                        )
                    }}
                ></Controller>
                <Button
                    key="find-button"
                    type="submit"
                    onClick={() => {
                        setUserWantsToShareLocation(false)
                    }}
                    width="15%"
                    marginLeft={2}
                    variant="solid"
                >
                    Find
                </Button>
            </InputGroup>
            <Box
                style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                margin="10px"
            >
                Or
            </Box>
            <Button
                key="use-my-location-button"
                onClick={() => {
                    setUserWantsToShareLocation(true)
                    getUserGeolocation()
                }}
                width="100%"
                variant="solid"
                fontWeight="bold"
                marginBottom={4}
            >
                Use My Location
            </Button>
            <FormControl isInvalid={automaticGeolocationHasFailed && userWantsToShareLocation}>
                <FormErrorMessage
                    color="red.600"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom={4}
                >
                    {/* <AlertIcon aria-hidden="true" mr={2} /> */}
                    Please agree to share your location
                </FormErrorMessage>
            </FormControl>
        </form>
    )
}

StoreLocatorForm.propTypes = {
  refetch: PropTypes.func,
};
