/* Custom Payload admin layout without Google Fonts to work around Next.js 16 Turbopack font bug. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import {
  generatePayloadViewport,
  handleServerFunctions,
} from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.css'

type Args = {
  children: React.ReactNode
}

export const generateViewport = generatePayloadViewport

const _serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <style>{`:root { --font-family-sans: system-ui, -apple-system, sans-serif; --font-family-mono: ui-monospace, monospace; }`}</style>
    </head>
    <body>{children}</body>
  </html>
)

export default Layout
