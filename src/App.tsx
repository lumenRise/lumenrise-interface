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
    page = <SettingsPage {...shared} />
  } else if (pathname === '/' || pathname === '/launches') {
    page = <DiscoverPage {...shared} />
  } else {
    page = <ComingSoonPage {...shared} />
  }

  return (
    <div className="app-shell">
      {page}
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
    </div>
  )
}

type SharedProps = {
  path: string
  isSignedIn: boolean
  address?: string
  loginPending: boolean
  onLogin: (destination?: string) => Promise<void>
  onLogout: () => void
}

function Header({ path, isSignedIn, address, loginPending, onLogin }: SharedProps) {
  const nav = [
    { label: 'Discover', to: '/' },
    { label: 'Reputation', to: '/reputation' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Developers', to: '/developers' },
  ]

  return (
    <header className="site-header">
      <Logo />
      <nav className="main-nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={path === item.to ? 'active' : undefined}
            aria-current={path === item.to ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {isSignedIn ? (
        <Link to="/settings" className="account-button" aria-label={`Account settings for ${shortAddress(address)}`}>
          <span className="account-dot" />
          <span>{shortAddress(address)}</span>
          <Icon name="settings" size={16} />
        </Link>
      ) : (
        <button className="button button-primary header-login" type="button" disabled={loginPending} onClick={() => void onLogin('/portfolio')}>
          {loginPending ? 'Opening Blux…' : 'Log in'}
        </button>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Logo />
        <p>Identity and launch infrastructure for Stellar.</p>
      </div>
      <div className="footer-links">
        <Link to="/missions">Missions</Link>
        <Link to="/create">Create launch</Link>
        <Link to="/campaigns">Campaigns</Link>
        <Link to="/explorer">Explorer</Link>
        <Link to="/cli">CLI & agents</Link>
      </div>
      <p className="footnote">Illustrative product data · Built on Stellar</p>
    </footer>
  )
}

function DiscoverPage(props: SharedProps) {
  const [filter, setFilter] = useState<'All' | LaunchStatus>('All')
  const [query, setQuery] = useState('')
  const filteredLaunches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return launches.filter((launch) => {
      const matchesFilter = filter === 'All' || launch.status === filter
      const matchesSearch = !normalized || [launch.name, launch.symbol, launch.description, launch.allocation]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      return matchesFilter && matchesSearch
    })
  }, [filter, query])

  return (
    <>
      <Header {...props} />
      <main className="page discover-page">
        <section className="discover-intro">
          <div>
            <h1>Open launches</h1>
            <p className="lead">Review the rules, understand your eligibility, and choose whether to participate. No account needed to explore.</p>
          </div>
          <div className="intro-note" aria-label="Launchpad principles">
            <span>Transparent rules</span>
            <span>Verifiable eligibility</span>
            <span>User-owned identity</span>
          </div>
        </section>

        <section className="launch-directory" aria-labelledby="launch-directory-title">
          <h2 id="launch-directory-title" className="sr-only">Launch directory</h2>
          <div className="directory-tools">
            <div className="filter-list" role="group" aria-label="Filter launches">
              {filterLabels.map((label) => {
                const count = label === 'All' ? launches.length : launches.filter((item) => item.status === label).length
                return (
                  <button
                    key={label}
                    type="button"
                    className={filter === label ? 'active' : undefined}
                    aria-pressed={filter === label}
                    onClick={() => setFilter(label)}
                  >
                    {label}<span>{count}</span>
                  </button>
                )
              })}
            </div>
            <label className="search-field">
              <Icon name="search" size={17} />
              <span className="sr-only">Search launches</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or tokens" />
            </label>
          </div>

          <div className="launch-table">
            <div className="launch-head" aria-hidden="true">
              <span>Project</span>
              <span>Raise progress</span>
              <span>Launch timing</span>
              <span>Allocation</span>
              <span>Eligibility</span>
              <span>Participants</span>
              <span>Action</span>
            </div>
            {filteredLaunches.map((launch) => (
              <LaunchRow key={launch.slug} launch={launch} {...props} />
            ))}
            {filteredLaunches.length === 0 && (
              <div className="empty-state">
                <Icon name="search" size={24} />
                <h3>No matching launches</h3>
                <p>Try another token name or reset the current filter.</p>
                <button type="button" className="text-button" onClick={() => { setFilter('All'); setQuery('') }}>Show every launch</button>
              </div>
            )}
          </div>
          <p className="data-caption">Illustrative project and raise data for this interface prototype.</p>
        </section>
      </main>
      <Footer />
    </>
  )
}

function LaunchRow({ launch, isSignedIn, onLogin }: { launch: Launch } & SharedProps) {
  const isUnavailable = launch.status === 'Upcoming'
  const participationAction = launch.status === 'Live' || launch.status === 'Auction'
  const destination = launch.status === 'Auction' ? `/auction/${launch.slug}` : `/launch/${launch.slug}`

  function handleAction() {
    if (participationAction && !isSignedIn) {
      void onLogin(destination)
      return
    }
    navigate(destination)
  }

  return (
    <article className="launch-row">
      <div className="project-cell" data-label="Project">
        <TokenMark kind={launch.mark} />
        <div>
          <span className={`status status-${launch.status.toLowerCase().replace(/\s/g, '-')}`}>{launch.status}</span>
          <h3>{launch.name}</h3>
          <p className="symbol">{launch.symbol}</p>
          <p>{launch.description}</p>
        </div>
      </div>
      <div className="raise-cell" data-label="Raise progress">
        <p><strong>{launch.raised}</strong> <span>/ {launch.target}</span></p>
        <div className="progress-line"><span style={{ width: `${launch.progress}%` }} /></div>
        <small>{launch.progress}% committed</small>
      </div>
      <div className="timing-cell" data-label="Launch timing">
        <span>{launch.timingLabel}</span>
