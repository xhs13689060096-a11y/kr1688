/* Payload provider layout without Google Fonts. */
import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout as PayloadRootLayout } from '@payloadcms/ui/layouts'
import type { ServerAdapter, ServerFunctionClient } from 'payload'
import { generatePayloadViewport, handleServerFunctions } from '@payloadcms/next/layouts'
import { cookies, headers } from 'next/headers'
import { forbidden, notFound, permanentRedirect, redirect, unauthorized } from 'next/navigation'

import { importMap } from './admin/importMap.js'
import './custom.css'
import { PayloadAdminRouter } from '@/components/PayloadAdminRouter'

export const generateViewport = generatePayloadViewport

const _serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const nextServerAdapter: ServerAdapter = {
  forbidden: () => forbidden(),
  getCookies: async () => {
    const store = await cookies()
    return {
      get: (name) => store.get(name),
      getAll: () => store.getAll(),
      set: (name, value, options) => store.set(name, value, options),
    }
  },
  getHeaders: () => headers(),
  notFound: () => notFound(),
  permanentRedirect: (path) => permanentRedirect(path),
  redirect: (path) => redirect(path),
  setCookie: async (name, value, options) => {
    const store = await cookies()
    store.set(name, value, options)
  },
  unauthorized: () => unauthorized(),
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <PayloadRootLayout
    config={config}
    fonts={[]}
    head={
      <>
        <meta charSet="utf-8" />
        <style>{`:root { --font-family-sans: system-ui, -apple-system, sans-serif; --font-family-mono: ui-monospace, monospace; }`}</style>
      </>
    }
    htmlProps={{ lang: 'en' }}
    importMap={importMap}
    RouterAdapter={PayloadAdminRouter}
    serverAdapter={nextServerAdapter}
    serverFunction={_serverFunction}
  >
    {children}
  </PayloadRootLayout>
)

export default Layout
