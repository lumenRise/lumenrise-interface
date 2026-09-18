import { useEffect, useMemo, useState, type AnchorHTMLAttributes } from 'react'
import { useBlux } from '@bluxcc/react'
import { Icon, type IconName } from './Icon'
import { filterLabels, launches, type Launch, type LaunchStatus } from './data'
import './App.css'

type BluxUser = {
  address: string
  identifier?: string
  authValue?: string
  authMethod?: string
}

type ConnectionKey = 'x' | 'github' | 'gitlab'

type Connection = {
  connected: boolean
  handle?: string
  score?: number
  source?: 'blux' | 'prototype'
}

type Connections = Record<ConnectionKey, Connection>

const emptyConnections: Connections = {
  x: { connected: false },
  github: { connected: false },
  gitlab: { connected: false },
}

const routeEvent = 'launchpad:navigate'

function currentPath() {
  return `${window.location.pathname}${window.location.search}`
}

function navigate(to: string) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new Event(routeEvent))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function useRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const update = () => setPath(currentPath())
    window.addEventListener('popstate', update)
    window.addEventListener(routeEvent, update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener(routeEvent, update)
    }
  }, [])

  return path
}

function randomScore() {
  const values = new Uint32Array(1)
  window.crypto.getRandomValues(values)
  return 42 + (values[0] % 49)
}

function shortAddress(address?: string) {
  if (!address) return 'GDEMO…7X2Q'
  return `${address.slice(0, 5)}…${address.slice(-4)}`
}

function connectionStorageKey(address?: string) {
  return `launchpad:connections:${address || 'preview'}`
}

function loadConnections(address?: string): Connections {
  try {
    const stored = window.localStorage.getItem(connectionStorageKey(address))
    return stored ? { ...emptyConnections, ...JSON.parse(stored) } : emptyConnections
  } catch {
    return emptyConnections
  }
}

function saveConnections(address: string | undefined, value: Connections) {
  window.localStorage.setItem(connectionStorageKey(address), JSON.stringify(value))
}

function inferConnection(user: BluxUser): ConnectionKey | null {
  const identity = [user.authMethod, user.authValue, user.identifier]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (identity.includes('twitter') || identity.includes('x.com')) return 'x'
  if (identity.includes('github')) return 'github'
  if (identity.includes('gitlab')) return 'gitlab'
  return null
}

function hydrateBluxConnection(user: BluxUser) {
  const provider = inferConnection(user)
  if (!provider) return

  const connections = loadConnections(user.address)
  if (connections[provider].connected) return

  const label = provider === 'x' ? '@stellar_builder' : 'stellar-builder'
  const next = {
    ...connections,
    [provider]: {
      connected: true,
      handle: label,
      score: randomScore(),
      source: 'blux' as const,
    },
  }
  saveConnections(user.address, next)
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

function Link({ to, children, onClick, ...anchorProps }: LinkProps) {
  return (
    <a
      href={to}
      {...anchorProps}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}

function Logo() {
  return (
    <Link to="/" className="wordmark" aria-label="Launchpad home">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M14 2.5v23M2.5 14h23M5.8 5.8l16.4 16.4M22.2 5.8 5.8 22.2" />
        <circle cx="14" cy="14" r="4.2" />
      </svg>
      <span>Launchpad</span>
    </Link>
  )
}

function App() {
  const path = useRoute()
  const pathname = path.split('?')[0]
  const blux = useBlux()
  const [loginPending, setLoginPending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const isPreview = import.meta.env.DEV && new URLSearchParams(path.split('?')[1] || '').get('preview') === '1'
  const isSignedIn = blux.isAuthenticated || isPreview
  const address = blux.user?.address || (isPreview ? 'GDEMO6K4KQPR5H7NQOL6UPRTMPL4TE6CYXW2LP7SSQ3J2BQY7X2Q' : undefined)

  useEffect(() => {
    if (blux.user) hydrateBluxConnection(blux.user)
  }, [blux.user])

  async function loginAndContinue(destination = '/portfolio') {
    if (blux.isAuthenticated) {
      navigate(destination)
      return
    }

    window.sessionStorage.setItem('launchpad:returnTo', destination)
    try {
      const login = blux.login()
      setLoginPending(true)
      const user = await login
      hydrateBluxConnection(user)
      navigate('/onboarding')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Blux could not open the login flow.'
      setNotice(message.replace(/^BLUX:\s*/i, ''))
    } finally {
      setLoginPending(false)
    }
  }

  function logout() {
    blux.logout()
    navigate('/')
    setNotice('You are now logged out.')
  }

  const shared = {
    path: pathname,
    isSignedIn,
    address,
    loginPending,
    onLogin: loginAndContinue,
    onLogout: logout,
  }

  let page: React.ReactNode
  if (pathname === '/onboarding') {
    page = <OnboardingPage {...shared} />
  } else if (pathname === '/portfolio') {
    page = <PortfolioPage {...shared} />
  } else if (pathname === '/settings') {
