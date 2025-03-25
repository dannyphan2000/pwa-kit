import * as React from 'react'
import { createRouter as createTanstackRouter } from '@tanstack/react-router'
// import { routeTree } from './routeTree.gen'
import {routeTree} from '/Users/bfeister/dev/_pwa-kit/packages/template-typescript-minimal/app/pages/routeTree.gen'

export function createRouter() {
  return createTanstackRouter({ routeTree })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
