/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {
    AspectRatio,
    Box,
    Flex,
    IconButton,
    Image,
    Skeleton,
    Stack,
    useBreakpointValue
} from '@chakra-ui/react'

// Project Components
import {ChevronLeftIcon, ChevronRightIcon} from '../icons'

/**
 * A carousel for product images.
 */
const ImageGallery = ({size, imageProps, ...props}) => {
    const {images, selectedImageIndex = 0} = props
    const [imageIndex, setImageIndex] = useState(selectedImageIndex)

    const image = images?.[imageIndex] || {}

    const previousImage = () => {
        setImageIndex((imageIndex - 1 + images.length) % images.length)
    }

    const nextImage = () => {
        setImageIndex((imageIndex + 1) % images.length)
    }

    const heroImageSize = useBreakpointValue({base: 'md', md: size})

    return (
        <Stack spacing={2} {...props}>
            <Box position="relative">
                <AspectRatio ratio={1}>
                    <Image
                        ignoreFallback={true}
                        src={image.disBaseLink || image.link}
                        alt={image.alt}
                        objectFit="cover"
                        {...imageProps}
                    />
                </AspectRatio>

                {images?.length > 1 && (
                    <>
                        <IconButton
                            aria-label="Previous Image"
                            icon={<ChevronLeftIcon color="white" />}
                            position="absolute"
                            left={2}
                            top="50%"
                            transform="translateY(-50%)"
                            variant="ghost"
                            backgroundColor="blackAlpha.600"
                            _hover={{backgroundColor: 'blackAlpha.800'}}
                            onClick={previousImage}
                        />
                        <IconButton
                            aria-label="Next Image"
                            icon={<ChevronRightIcon color="white" />}
                            position="absolute"
                            right={2}
                            top="50%"
                            transform="translateY(-50%)"
                            variant="ghost"
                            backgroundColor="blackAlpha.600"
                            _hover={{backgroundColor: 'blackAlpha.800'}}
                            onClick={nextImage}
                        />
                    </>
                )}
            </Box>

            {images?.length > 1 && (
                <Flex overflowX="auto" gap={2}>
                    {images.map((image, index) => (
                        <Box
                            key={index}
                            minWidth="60px"
                            cursor="pointer"
                            border={index === imageIndex ? '2px solid' : '1px solid'}
                            borderColor={index === imageIndex ? 'blue.500' : 'gray.200'}
                            borderRadius="md"
                            onClick={() => setImageIndex(index)}
                        >
                            <AspectRatio ratio={1}>
                                <Image
                                    src={image.disBaseLink || image.link}
                                    alt={image.alt}
                                    objectFit="cover"
                                    borderRadius="md"
                                />
                            </AspectRatio>
                        </Box>
                    ))}
                </Flex>
            )}
        </Stack>
    )
}

ImageGallery.propTypes = {
    images: PropTypes.array,
    selectedImageIndex: PropTypes.number,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    imageProps: PropTypes.object
}

/**
 * A skeleton version of the ImageGallery for when the component is loading.
 */
const ImageGallerySkeleton = ({...props}) => {
    return (
        <Stack spacing={2} {...props}>
            <AspectRatio ratio={1}>
                <Skeleton />
            </AspectRatio>
            <Flex gap={2}>
                {Array.from({length: 4}).map((_, index) => (
                    <Box key={index} minWidth="60px">
                        <AspectRatio ratio={1}>
                            <Skeleton borderRadius="md" />
                        </AspectRatio>
                    </Box>
                ))}
            </Flex>
        </Stack>
    )
}

ImageGallerySkeleton.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

ImageGallery.Skeleton = ImageGallerySkeleton

export default ImageGallery
