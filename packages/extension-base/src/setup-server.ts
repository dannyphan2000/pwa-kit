/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party Imports
import {Application} from 'express'

// Platform Imports
import {ApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/express'

// Local Imports
import {Config} from './types'
import extensionMeta from '../extension-meta.json'

class Sample extends ApplicationExtension<Config> {
    static readonly id = extensionMeta.id

    /**
     * Use this method to enhance or modify your ExpressJS Application by adding route handlers and middleware.
     */
    extendApp(app: Application): Application {
        // For example, you can extend the Express app by creating a new endpoint like this.
        app.get('/sample', (req, res) => {
            res.send(
                `<p>Hello from a sample endpoint! Created by ${Sample.id} extension.</p>
                <pre>extensionConfig = ${JSON.stringify(this.getConfig())}</pre>`
            )
        })

        return app
    }
}

export default Sample
