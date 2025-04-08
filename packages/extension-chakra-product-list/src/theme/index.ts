/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const theme = {
    components: {
        ProductList: {
            baseStyle: {
                container: {
                    border: '1px solid black',
                    maxW: 'container.lg',
                    mx: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderRadius: 'lg',
                    boxShadow: 'md'
                },
                sidebar: {
                    width: '250px',
                    backgroundColor: 'gray.50',
                    padding: '20px',
                    borderRadius: 'md'
                },
                mainContent: {
                    width: 'calc(100% - 250px)',
                    padding: '20px'
                },
                toolbar: {
                    padding: '10px 20px',
                    backgroundColor: 'gray.100',
                    borderRadius: 'md'
                },
                productCard: {
                    backgroundColor: 'white',
                    borderRadius: 'md',
                    boxShadow: 'sm',
                    padding: '16px',
                    textAlign: 'center'
                }
            }
        }
    }
}

export {theme}
