import React from 'react'
import {Box, Stack, Flex, Grid} from '@chakra-ui/react'

const Layout = ({components}: {components: Record<string, JSX.Element>}) => {
    return (
        <Box
            className="sf-product-list-page"
            data-testid="sf-product-list-page"
            layerStyle="page"
            paddingTop={{base: 6, lg: 8}}
        >
            <Stack
                display={{base: 'none', lg: 'flex'}}
                direction="row"
                justify="flex-start"
                align="flex-start"
                spacing={4}
                marginBottom={6}
            >
                <Flex align="left" width="287px">
                    {components.pageHeader}
                </Flex>

                <Box flex={1} paddingTop={'45px'}>
                    {components.selectedRefinements}
                </Box>
                <Box paddingTop={'45px'}>{components.sort}</Box>
            </Stack>
            <Box
                backgroundColor="red"
                height={'50px'}
                fontSize={'26px'}
                fontWeight={'bold'}
                color={'white'}
            >
                Let's add this red box here.
            </Box>
            <Grid templateColumns={{base: '1fr', md: '280px 1fr'}} columnGap={6}>
                <Stack display={{base: 'none', md: 'flex'}}>{components.refinements}</Stack>
                <Box>
                    {components.productGrid}

                    <Flex justifyContent={['center', 'center', 'flex-start']} paddingTop={8}>
                        {components.paginator}
                    </Flex>
                </Box>
            </Grid>
        </Box>
    )
}

export default Layout
