'use client'

import { RouterAdapterContext } from '@payloadcms/ui'
import NextLink from 'next/link'
import {
  useParams,
  usePathname,
  useRouter as useNextRouter,
  useSearchParams,
} from 'next/navigation'
import React from 'react'
import type { LinkAdapterProps } from 'payload'

const PayloadAdminLink: React.FC<LinkAdapterProps> = ({
  children,
  href,
  prefetch,
  ref,
  replace,
  scroll,
  ...rest
}) => (
  <NextLink href={href} prefetch={prefetch} ref={ref} replace={replace} scroll={scroll} {...rest}>
    {children}
  </NextLink>
)

export function PayloadAdminRouter({ children }: { children: React.ReactNode }) {
  const nextRouter = useNextRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
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
      Link: PayloadAdminLink,
      params: params as Record<string, string | string[]>,
      pathname,
      router,
      searchParams,
    }),
    [params, pathname, router, searchParams],
  )

  return <RouterAdapterContext value={value}>{children}</RouterAdapterContext>
}
