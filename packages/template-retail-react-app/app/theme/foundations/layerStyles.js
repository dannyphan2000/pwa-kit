/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const card = {
    py: {
        value: '{space.6}'
    },
    px: {
        value: '{space.4}'
    },
    backgroundColor: {
        value: '{colors.white}'
    },
    rounded: {
        value: '{radii.base}'
    },
    boxShadow: {
        value: '{shadows.base}'
    }
}

const cardBordered = {
    ...card,
    px: {
        value: ['{space.4}', '{space.4}', '{space.5}', '{space.6}']
    },
    border: {
        value: '1px solid'
    },
    borderColor: {
        value: '{colors.gray.50}'
    }
}

export default {
    card,
    cardBordered,

    ccIcon: {
        width: {
            value: '34px'
        },
        height: {
            value: '22px'
        }
    },

    page: {
        px: {
            value: ['{space.4}', '{space.4}', '{space.6}', '{space.6}', '{space.8}']
        },
        paddingTop: {
            value: ['{space.4}', '{space.4}', '{space.6}', '{space.6}', '{space.8}']
        },
        paddingBottom: {
            value: '{space.32}'
        },
        width: {
            value: '100%'
        },
        maxWidth: {
            value: '{sizes.container.xxxl}'
        },
        marginLeft: {
            value: 'auto'
        },
        marginRight: {
            value: 'auto'
        }
    }
}
