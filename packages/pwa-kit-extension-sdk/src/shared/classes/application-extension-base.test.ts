/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {ApplicationExtension} from './application-extension-base'
import {ApplicationExtensionConfig} from '../../types'

// Define a mock configuration type for testing
interface MockConfig extends ApplicationExtensionConfig {
    enabled?: boolean
}

// Create a concrete subclass of ApplicationExtension for testing purposes
class TestApplicationExtension extends ApplicationExtension<MockConfig> {}

// Create test extensions with different default config scenarios
class TestExtensionWithDefaults extends ApplicationExtension<MockConfig> {
    protected defaultConfig = {
        enabled: true,
        testValue: 'default'
    }
}

class TestExtensionWithoutDefaults extends ApplicationExtension<MockConfig> {}

// Jest test suite
describe('ApplicationExtension', () => {
    let config: MockConfig
    let extension: TestApplicationExtension

    beforeEach(() => {
        config = {enabled: true} // Initial mock config
        extension = new TestApplicationExtension(config)
    })

    test('should initialize with the provided config', () => {
        expect(extension.getConfig()).toEqual(config)
    })

    test('should return the correct name of the class', () => {
        expect(extension.getName()).toBe('TestApplicationExtension')
    })

    test('should return true if enabled is true', () => {
        config.enabled = true
        expect(extension.isEnabled()).toBe(true)
    })

    test('should return false if enabled is false', () => {
        config.enabled = false
        expect(extension.isEnabled()).toBe(false)
    })

    test('should return true if enabled is undefined', () => {
        config.enabled = undefined
        expect(extension.isEnabled()).toBe(true)
    })

    describe('defaultConfig behavior', () => {
        test('should use default config when no values are provided', () => {
            const extension = new TestExtensionWithDefaults({})
            expect(extension.getConfig()).toEqual({
                enabled: true,
                testValue: 'default'
            })
        })

        test('should override default config with provided values', () => {
            const extension = new TestExtensionWithDefaults({
                enabled: false,
                testValue: 'custom'
            })
            expect(extension.getConfig()).toEqual({
                enabled: false,
                testValue: 'custom'
            })
        })

        test('should partially override default config', () => {
            const extension = new TestExtensionWithDefaults({
                testValue: 'custom'
            })
            expect(extension.getConfig()).toEqual({
                enabled: true,
                testValue: 'custom'
            })
        })

        test('should work without default config', () => {
            const config = {enabled: true, testValue: 'test'}
            const extension = new TestExtensionWithoutDefaults(config)
            expect(extension.getConfig()).toEqual(config)
        })

        test('should handle empty config with no defaults', () => {
            const extension = new TestExtensionWithoutDefaults({})
            expect(extension.getConfig()).toEqual({})
        })
    })
})
