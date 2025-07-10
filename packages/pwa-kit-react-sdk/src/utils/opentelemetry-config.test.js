/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {getOTELConfig, getServiceName} from './opentelemetry-config'

// Mock the module to reset cache between tests
const mockModule = () => {
    jest.resetModules()
    return require('./opentelemetry-config')
}

describe('OpenTelemetry Config', () => {
    const originalEnv = process.env

    beforeEach(() => {
        // Reset environment variables
        process.env = {...originalEnv}

        // Clear module cache to reset _cachedConfig
        jest.resetModules()
    })

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv
    })

    describe('getOTELConfig', () => {
        test('should return default config when no environment variables are set', () => {
            delete process.env.OTEL_SERVICE_NAME
            delete process.env.OTEL_SDK_ENABLED
            delete process.env.OTEL_B3_TRACING_ENABLED

            const {getOTELConfig} = mockModule()
            const config = getOTELConfig()

            expect(config).toEqual({
                serviceName: 'pwa-kit-react-sdk',
                enabled: false,
                b3TracingEnabled: false
            })
        })

        test('should use environment variables when provided', () => {
            process.env.OTEL_SERVICE_NAME = 'test-service'
            process.env.OTEL_SDK_ENABLED = 'true'
            process.env.OTEL_B3_TRACING_ENABLED = 'true'

            const {getOTELConfig} = mockModule()
            const config = getOTELConfig()

            expect(config).toEqual({
                serviceName: 'test-service',
                enabled: true,
                b3TracingEnabled: true
            })
        })

        test('should handle partial environment variables', () => {
            process.env.OTEL_SERVICE_NAME = 'custom-service'
            process.env.OTEL_SDK_ENABLED = 'false'
            delete process.env.OTEL_B3_TRACING_ENABLED

            const {getOTELConfig} = mockModule()
            const config = getOTELConfig()

            expect(config).toEqual({
                serviceName: 'custom-service',
                enabled: false,
                b3TracingEnabled: false
            })
        })

        test('should treat non-"true" values as false for boolean flags', () => {
            process.env.OTEL_SDK_ENABLED = 'false'
            process.env.OTEL_B3_TRACING_ENABLED = 'yes'

            const {getOTELConfig} = mockModule()
            const config = getOTELConfig()

            expect(config.enabled).toBe(false)
            expect(config.b3TracingEnabled).toBe(false)
        })

        test('should handle empty string environment variables', () => {
            process.env.OTEL_SERVICE_NAME = ''
            process.env.OTEL_SDK_ENABLED = ''
            process.env.OTEL_B3_TRACING_ENABLED = ''

            const {getOTELConfig} = mockModule()
            const config = getOTELConfig()

            expect(config).toEqual({
                serviceName: 'pwa-kit-react-sdk', // Falls back to default
                enabled: false,
                b3TracingEnabled: false
            })
        })
    })

    describe('getServiceName', () => {
        test('should return service name from config', () => {
            process.env.OTEL_SERVICE_NAME = 'test-service-name'

            const {getServiceName} = mockModule()
            const serviceName = getServiceName()

            expect(serviceName).toBe('test-service-name')
        })

        test('should return default service name when no env var set', () => {
            delete process.env.OTEL_SERVICE_NAME

            const {getServiceName} = mockModule()
            const serviceName = getServiceName()

            expect(serviceName).toBe('pwa-kit-react-sdk')
        })
    })
})
