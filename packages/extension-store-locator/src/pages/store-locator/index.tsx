/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, { useEffect } from "react";
import { Box, Container } from "@chakra-ui/react";
import StoreLocatorContent from "../../components/store-locator/store-locator-content";
import { useStoreLocatorConfig } from "../../components/store-locator-provider";

const StoreLocator = () => {
  const config = useStoreLocatorConfig();

  useEffect(() => {
    console.log('Store Locator Config:', config);
  }, [config]);

  return (
      <Box data-testid="store-locator-page" bg="gray.50" py={[8, 16]}>
        <Container
          overflowY="scroll"
          paddingTop={8}
          width={["90%"]}
          bg="white"
          paddingBottom={14}
          marginTop={8}
          marginBottom={8}
          borderRadius="base"
        >
          <StoreLocatorContent />
        </Container>
      </Box>
  );
};

StoreLocator.getTemplateName = () => "store-locator";

StoreLocator.propTypes = {};

export default StoreLocator;
