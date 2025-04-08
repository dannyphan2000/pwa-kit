/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import {
    Box,
    Flex,
    Grid,
    Image,
    Text,
    VStack,
    Checkbox,
    Select,
    HStack,
    Tag,
    Button,
    useStyleConfig
} from '@chakra-ui/react'

interface Product {
    id: number
    title: string
    price: string
    image: string
}

const sampleProducts: Product[] = [
    {
        id: 1,
        title: 'Product One',
        price: '$29.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw0b7714ee/images/large/TG786_214.jpg?sw=768&q=60'
    },
    {
        id: 2,
        title: 'Product Two',
        price: '$39.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw2c6f2e32/images/large/PG.949612424S.COBATSI.PZ.jpg?sw=768&q=60'
    },
    {
        id: 3,
        title: 'Product Three',
        price: '$19.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw1f60b400/images/large/PG.52001DAN84Q.BLACKWL.PZ.jpg?sw=768&q=60'
    },
    {
        id: 4,
        title: 'Product Four',
        price: '$49.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw6ec3a179/images/large/TG250_001.jpg?sw=768&q=60'
    },
    {
        id: 5,
        title: 'Product Five',
        price: '$24.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dwbeefee44/images/large/P0048_001.jpg?sw=768&q=60'
    },
    {
        id: 6,
        title: 'Product Six',
        price: '$59.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dwfb5184d0/images/large/PG.52002RUBN4Q.NAVYWL.PZ.jpg?sw=768&q=60'
    },
    {
        id: 7,
        title: 'Product One',
        price: '$29.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw0b7714ee/images/large/TG786_214.jpg?sw=768&q=60'
    },
    {
        id: 8,
        title: 'Product Two',
        price: '$39.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw2c6f2e32/images/large/PG.949612424S.COBATSI.PZ.jpg?sw=768&q=60'
    },
    {
        id: 9,
        title: 'Product Three',
        price: '$19.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw1f60b400/images/large/PG.52001DAN84Q.BLACKWL.PZ.jpg?sw=768&q=60'
    },
    {
        id: 10,
        title: 'Product Four',
        price: '$49.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw6ec3a179/images/large/TG250_001.jpg?sw=768&q=60'
    },
    {
        id: 11,
        title: 'Product Five',
        price: '$24.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dwbeefee44/images/large/P0048_001.jpg?sw=768&q=60'
    },
    {
        id: 12,
        title: 'Product Six',
        price: '$59.99',
        image: 'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dwfb5184d0/images/large/PG.52002RUBN4Q.NAVYWL.PZ.jpg?sw=768&q=60'
    }
]

const filters: string[] = ['In Stock', 'On Sale', 'Free Shipping']

const ProductListPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
    const styles = useStyleConfig('ProductList')

    // Pagination logic
  const indexOfLastProduct = currentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = sampleProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const handleNextPage = () => {
    if (indexOfLastProduct < sampleProducts.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

    return (
        <Flex sx={styles.container}>
            {/* Sidebar */}
            <Box as="aside" sx={styles.sidebar}>
                <Text fontWeight="bold" mb={4}>
                    Filters
                </Text>
                <VStack align="start">
                    {filters.map((filter) => (
                        <Checkbox key={filter}>{filter}</Checkbox>
                    ))}
                </VStack>
            </Box>

            {/* Main Content */}
            <Box as="main" sx={styles.mainContent}>
                {/* Toolbar */}
                <Flex justify="space-between" align="center" mb={4} sx={styles.toolbar}>
                    <Select width="200px" placeholder="Sort by">
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                    </Select>

                    <HStack>
                        <Text>Applied Filters:</Text>
                        <Tag>On Sale</Tag>
                        <Tag>Free Shipping</Tag>
                        <Button size="xs" variant="ghost">
                            Clear All
                        </Button>
                    </HStack>
                </Flex>

                {/* Product Grid */}
                <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
                    {currentProducts.map((product: Product) => (
                        <Box key={product.id} sx={styles.productCard}>
                            <Image
                                src={product.image}
                                alt={product.title}
                                borderRadius="md"
                                mb={2}
                            />
                            <Text fontWeight="semibold">{product.title}</Text>
                            <Text color="gray.600">{product.price}</Text>
                        </Box>
                    ))}
                </Grid>

                {/* Pagination Buttons */}
                <HStack justify="center" spacing={4} mt={6}>
                <Button
                    onClick={handlePreviousPage}
                    isDisabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    onClick={handleNextPage}
                    isDisabled={indexOfLastProduct >= sampleProducts.length}
                >
                    Next
                </Button>
                </HStack>
            </Box>
        </Flex>
    )
}

export default ProductListPage
