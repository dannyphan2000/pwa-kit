#!/usr/bin/env node
/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const sh = require('shelljs')

// The branch naming convention for releasing a particular package is: release-<package-name>-1.1.x
// For example: 'release-commerce-sdk-react-10.0.x'
const RELEASE_ONE_PACKAGE = /release-([-a-z]+)-\d+\./i

const main = () => {
    // Exiting early if working tree is not clean
    verifyCleanWorkingTree()

    const branchName = sh.exec('git branch --show-current', {silent: true}).trim()
    // DEBUG
    // const branchName = 'next'
    // const branchName = 'release-3.0.x'
    // const branchName = 'release-commerce-sdk-react-10.0.x'

    console.log('--- Given the current branch:', branchName)

    const isNightly = branchName === 'nightly-releases'
    const isNextBranch = branchName === 'next'

    if (isNightly) {
        console.log('--- Nightly release detected. Releasing all packages...')
        publishPackages({isNightly: true})
        return
    }

    if (isNextBranch) {
        console.log('--- The `next` branch detected. Releasing all packages with `next` tag...')
        publishPackages({npmTag: 'next'})
        return
    }

    const matched = branchName.match(RELEASE_ONE_PACKAGE)
    const packageName = matched && matched[1]

    if (packageName) {
        console.log(`--- Releasing ${packageName}...`)
        publishPackages({packages: [packageName]})
        return
    }

    console.log('--- Releasing all packages...')
    publishPackages()
}

/**
 * @param {Object} options - The options object
 * @param {string[]} [options.packages=[]] - a list of package names without the "@salesforce" namespace
 * @param {boolean} [options.isNightly=false] - boolean value suggesting if packages are being published as a nightly release (affects NPM tag)
 * @param {string} [options.npmTag] - the npm tag to use for publishing
 */
const publishPackages = ({packages = [], isNightly = false, npmTag}) => {
    verifyCleanWorkingTree()

    const publicPackages = JSON.parse(sh.exec('lerna list --json', {silent: true}))
    const packagesToIgnore = publicPackages.filter(
        (pkg) => !packages.includes(pkg.name.replace('@salesforce/', ''))
    )

    const cleanUp = () => {
        // Undo the temporary commit
        sh.exec('git reset HEAD~1', {silent: true})

        packagesToIgnore.forEach((pkg) => {
            sh.exec('npm pkg delete private', {cwd: pkg.location})
        })
    }

    const publishSomePackagesOnly = packages.length > 0
    if (publishSomePackagesOnly) {
        packagesToIgnore.forEach((pkg) => {
            sh.exec('npm pkg set private=true', {cwd: pkg.location})
        })

        sh.exec('git add .', {silent: true})
        sh.exec('git commit -m "temporary commit to have clean working tree"', {silent: true})
    }

    const tagOption = npmTag
        ? // Force the npm tag to be the given `npmTag`
          `--dist-tag ${npmTag}`
        : // Otherwise, set a default pre-release tag (which will apply only when the version is considered to be pre-release)
          `--pre-dist-tag ${isNightly ? 'nightly-next' : 'next'}`
    const registryOption = process.env.CI
        ? ''
        : // Local verdaccio registry
          '--registry http://localhost:4873/'

    const {stderr, code} = sh.exec(
        `npm run lerna -- publish from-package --yes --no-verify-access ${tagOption} ${registryOption}`
    )
    // Why do we still want `lerna publish`? It turns out that we do need it. Sometimes we wanted some behaviour that's unique to Lerna.
    // For example: we have `publishConfig.directory` in some package.json files that only Lerna knows what to do with it.
    // https://github.com/lerna/lerna/tree/main/libs/commands/publish#publishconfigdirectory

    // Make sure to clean up, no matter if there's an error or not
    if (publishSomePackagesOnly) {
        cleanUp()
    }

    if (stderr) {
        process.exit(code)
    }
}

const verifyCleanWorkingTree = () => {
    const isWorkingTreeClean = sh.exec('git status --porcelain', {silent: true}).trim() === ''
    if (!isWorkingTreeClean) {
        console.error(
            'There are some uncommitted changes. `lerna publish` expects a clean working tree.'
        )
        process.exit(1)
    }
}

main()
