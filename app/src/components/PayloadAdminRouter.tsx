'use client'

import { RouterAdapterContext } from '@payloadcms/ui'
import NextLinkImport from 'next/link'
import {
  useParams,
  usePathname,
  useRouter as useNextRouter,
  useSearchParams,
} from 'next/navigation'
import React from 'react'

export function PayloadAdminRouter({ children }: { children: React.ReactNode }) {
  const nextRouter = useNextRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const NextLink = 'default' in NextLinkImport ? NextLinkImport.default : NextLinkImport
  const router = React.useMemo(
    () => ({
      back: nextRouter.back,
      push: nextRouter.push,
      refresh: nextRouter.refresh,
      replace: nextRouter.replace,
      replaceState: (url: string) => window.history.replaceState(null, '', url),
    }),
    [nextRouter],
  )
  const value = React.useMemo(
    () => ({
      Link: NextLink,
      params: params as Record<string, string | string[]>,
      pathname,
      router,
      searchParams,
    }),
    [NextLink, params, pathname, router, searchParams],
  )

  return <RouterAdapterContext value={value}>{children}</RouterAdapterContext>
}
