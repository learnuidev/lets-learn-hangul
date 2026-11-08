import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '@/styles/app.css?url'
import { AppShell } from '@/components/app-shell'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useEnterToActivate } from '@/hooks/use-enter-to-activate'
import { getCourse, getGeometric } from '@/lib/course'
import { UserProvider } from '@/providers/user-store'

export const Route = createRootRoute({
  loader: () => {
    const { levels, rounds } = getCourse()
    return { levels, rounds, geometric: getGeometric() }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, minimum-scale=1.0' },
      { title: 'Learn to read Hangul, the Korean alphabet | Let’s Learn Hangul!' },
      {
        name: 'description',
        content:
          'Learn how to read Korean in about an hour. Really! ‘Let’s Learn Hangul’ is a free game that teaches you to read Hangul (Hangeul), the Korean alphabet.',
      },
      { name: 'theme-color', content: '#f9f5ea' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:site', content: '@letslrnhangul' },
      { name: 'twitter:title', content: 'Learn how to read Korean in 1 hour!' },
      {
        name: 'twitter:description',
        content: 'Learn to read Hangul, the Korean alphabet, in about an hour. Really!',
      },
      {
        name: 'twitter:image',
        content: 'http://letslearnhangul.com/images/lets-learn-hangul-square.png',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Learn how to read Korean in 1 hour!' },
      {
        property: 'og:description',
        content: 'Learn to read Hangul, the Korean alphabet, in about an hour. Really!',
      },
      { property: 'og:url', content: 'http://letslearnhangul.com' },
      {
        property: 'og:image',
        content: 'http://letslearnhangul.com/images/lets-learn-hangul-square.png',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      // Typekit kit used by the original design (ff-enzo-web).
      { rel: 'stylesheet', href: 'https://use.typekit.net/xsl3pam.css' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const { levels, rounds, geometric } = Route.useLoaderData()
  useEnterToActivate()

  return (
    <UserProvider>
      <TooltipProvider>
        <AppShell levels={levels} rounds={rounds} geometric={geometric}>
          <Outlet />
        </AppShell>
      </TooltipProvider>
    </UserProvider>
  )
}
