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
        <strong>{launch.timingValue}</strong>
        <small>{launch.date}</small>
      </div>
      <div className="allocation-cell" data-label="Allocation">
        <strong>{launch.allocation}</strong>
        <small>{launch.allocationNote}</small>
      </div>
      <div className="eligibility-cell" data-label="Eligibility">
        {launch.reputation ? (
          <>
            <strong className="score-chip">Score {launch.reputation}+</strong>
            <small>{isSignedIn ? 'Check your profile' : 'Log in to check'}</small>
          </>
        ) : (
          <><strong>Open access</strong><small>No score required</small></>
        )}
      </div>
      <div className="participants-cell" data-label="Participants">
        <strong>{launch.participants}</strong>
        <small>{launch.participants === '—' ? 'Not yet open' : 'participants'}</small>
      </div>
      <div className="action-cell" data-label="Action">
        <button type="button" className={participationAction ? 'button button-primary' : 'button button-secondary'} disabled={isUnavailable} onClick={handleAction}>
          {participationAction && !isSignedIn && <Icon name="lock" size={15} />}
          {launch.action}
        </button>
        <Link to={`/launch/${launch.slug}`} className="detail-link">View details <Icon name="arrow" size={15} /></Link>
      </div>
    </article>
  )
}

function TokenMark({ kind }: { kind: Launch['mark'] }) {
  return (
    <span className={`token-mark token-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        {kind === 'star' && <path d="M24 5v38M5 24h38M11 11l26 26M37 11 11 37" />}
        {kind === 'slash' && <><path d="m13 34 22-22" /><path d="m17 39 22-22" /></>}
        {kind === 'orbit' && <><circle cx="24" cy="24" r="11" /><path d="M5 24h38M24 5v38M11 11l26 26M37 11 11 37" /></>}
        {kind === 'hourglass' && <path d="M14 7h20M14 41h20M16 8c0 9 16 9 16 16S16 31 16 40M32 8c0 9-16 9-16 16s16 7 16 16" />}
        {kind === 'arc' && <><path d="M8 31c5-15 27-18 34-4" /><path d="M8 37c5-15 27-18 34-4" /><circle cx="15" cy="17" r="4" /></>}
        {kind === 'flag' && <><path d="M15 40V8M16 9h20l-6 8 6 8H16" /></>}
      </svg>
    </span>
  )
}

function AuthGate({ onLogin, loginPending }: Pick<SharedProps, 'onLogin' | 'loginPending'>) {
  return (
    <section className="auth-gate">
      <div className="gate-mark"><Icon name="wallet" size={24} /></div>
      <h1>Log in to open your panel</h1>
      <p>Your portfolio, reputation signals, and connected identities are tied to the Stellar address created or connected through Blux.</p>
      <button className="button button-primary button-large" type="button" disabled={loginPending} onClick={() => void onLogin('/portfolio')}>
        {loginPending ? 'Opening Blux…' : 'Continue with Blux'} <Icon name="arrow" />
      </button>
      <Link to="/" className="text-button">Browse launches without an account</Link>
    </section>
  )
}

function OnboardingPage(props: SharedProps) {
  const { isSignedIn, address } = props
  const [connections, setConnections] = useState<Connections>(() => loadConnections(address))
  const [connecting, setConnecting] = useState<ConnectionKey | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isSignedIn) {
    return <><Header {...props} /><main className="page"><AuthGate {...props} /></main><Footer /></>
  }

  function connect(provider: ConnectionKey) {
    setConnecting(provider)
    window.setTimeout(() => {
      const handle = provider === 'x' ? '@stellar_builder' : 'stellar-builder'
      const next = { ...connections, [provider]: { connected: true, handle, score: randomScore(), source: 'prototype' as const } }
      setConnections(next)
      saveConnections(address, next)
      setConnecting(null)
    }, 850)
  }

  async function copyAddress() {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function finish() {
    window.localStorage.setItem(`launchpad:onboarded:${address}`, 'true')
    const destination = window.sessionStorage.getItem('launchpad:returnTo') || '/portfolio'
    window.sessionStorage.removeItem('launchpad:returnTo')
    navigate(destination)
  }

  const completed = Object.values(connections).filter((item) => item.connected).length

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Logo />
        <button className="text-button" type="button" onClick={finish}>Skip for now</button>
      </header>
      <main className="onboarding-layout">
        <aside className="onboarding-aside">
          <h2>Your wallet is ready.</h2>
          <p>Optional setup: add the identities that make your activity easier to verify. You control what appears publicly.</p>
          <div
            className="setup-meter"
            role="progressbar"
            aria-label="Optional identity connections"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={completed}
            aria-valuetext={`${completed} of 3 optional connections complete`}
          >
            {[0, 1, 2].map((index) => <span key={index} className={index < completed ? 'done' : undefined} />)}
          </div>
          <p className="aside-note"><Icon name="shield" size={17} /> You can disconnect any account later in Settings.</p>
        </aside>

        <section className="identity-setup">
          <div className="setup-heading">
            <div>
              <h1>Make your activity count.</h1>
              <p>Connections are optional. Each one adds a separate, explainable signal—never a hidden overall rating.</p>
            </div>
            <div className="wallet-summary">
              <span>Stellar account</span>
              <strong>{shortAddress(address)}</strong>
              <button type="button" aria-label="Copy Stellar address" onClick={() => void copyAddress()}>
                <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="connection-list">
            <ConnectionRow provider="x" title="Connect X" description="Use your X account as the public identity on your profile." signal="Social reputation" connection={connections.x} isConnecting={connecting === 'x'} onConnect={() => connect('x')} />
            <ConnectionRow provider="github" title="Connect GitHub" description="Verify contribution history and developer activity." signal="Developer reputation" connection={connections.github} isConnecting={connecting === 'github'} onConnect={() => connect('github')} />
            <ConnectionRow provider="gitlab" title="Connect GitLab" description="Add project history from your GitLab account." signal="Developer reputation" connection={connections.gitlab} isConnecting={connecting === 'gitlab'} onConnect={() => connect('gitlab')} />
          </div>

          <div className="prototype-note">
            <Icon name="spark" size={18} />
            <p><strong>Prototype connection flow.</strong> The buttons generate an illustrative signal locally. Production OAuth linking will be completed by the backend.</p>
          </div>

          <div className="setup-actions">
            <p>{completed === 0 ? 'Nothing else is required.' : `${completed} optional ${completed === 1 ? 'identity' : 'identities'} connected.`}</p>
            <button className="button button-primary button-large" type="button" onClick={finish}>
              Continue to your panel <Icon name="arrow" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function ConnectionRow({ provider, title, description, signal, connection, isConnecting, onConnect }: {
  provider: ConnectionKey
  title: string
  description: string
  signal: string
  connection: Connection
  isConnecting: boolean
  onConnect: () => void
}) {
  const iconName: IconName = provider === 'x' ? 'x' : provider
  return (
    <article className={`connection-row ${connection.connected ? 'connected' : ''}`}>
      <div className="connection-icon"><Icon name={iconName} size={22} /></div>
      <div className="connection-copy">
        <div><h3>{title}</h3><span>{signal}</span></div>
        <p>{description}</p>
        {connection.connected && <small>{connection.handle} · {connection.source === 'blux' ? 'Connected through Blux' : 'Prototype connection'}</small>}
      </div>
      {connection.connected ? (
        <div className="connection-result">
          <span>Signal</span>
          <strong>{connection.score}</strong>
          <span className="verified"><Icon name="check" size={14} /> Connected</span>
        </div>
      ) : (
        <button className="button button-secondary" type="button" disabled={isConnecting} onClick={onConnect}>
          {isConnecting ? 'Connecting…' : 'Connect'}
        </button>
      )}
    </article>
  )
}

function PortfolioPage(props: SharedProps) {
  if (!props.isSignedIn) {
    return <><Header {...props} /><main className="page"><AuthGate {...props} /></main><Footer /></>
  }

  const connections = loadConnections(props.address)
  const scores = Object.values(connections).flatMap((item) => item.score ? [item.score] : [])
  const reputation = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 38

  return (
    <>
      <Header {...props} />
      <main className="page dashboard-page">
        <section className="dashboard-heading">
          <div>
            <h1>Your launch activity</h1>
            <p>Commitments, allocations, claims, and identity signals for {shortAddress(props.address)}.</p>
          </div>
          <Link to="/settings" className="button button-secondary"><Icon name="settings" size={17} /> Manage account</Link>
        </section>

        <section className="account-strip" aria-label="Account overview">
          <div className="account-identity">
            <span className="identity-mark"><Icon name="wallet" /></span>
            <div><span>Active Stellar account</span><strong>{shortAddress(props.address)}</strong></div>
          </div>
          <div><span>Reputation signal</span><strong>{reputation}<small>/100</small></strong></div>
          <div><span>Connected identities</span><strong>{Object.values(connections).filter((item) => item.connected).length}<small>/3</small></strong></div>
          <div><span>Claimable now</span><strong>420<small> MDR</small></strong></div>
        </section>

        <section className="dashboard-columns">
          <div className="activity-panel">
            <div className="panel-heading"><div><h2>Active positions</h2><p>Illustrative data</p></div><Link to="/">Explore launches <Icon name="arrow" size={15} /></Link></div>
            <PortfolioRow token="MDR" project="Meridian" status="Committed" primary="$1,200 USDC" secondary="Estimated 1,840 MDR" action="Manage" />
            <PortfolioRow token="LUMA" project="Luma Commons" status="Auction bid" primary="$640 USDC" secondary="Bid: $0.42 / LUMA" action="View bid" />
            <PortfolioRow token="KPL" project="Kepler Studio" status="Claimable" primary="420 KPL" secondary="Next unlock Oct 14" action="Claim" highlighted />
          </div>
          <aside className="profile-panel">
            <div className="panel-heading"><div><h2>Reputation</h2><p>Explainable signals</p></div><Link to="/reputation">View profile</Link></div>
            <SignalRow label="Stellar activity" value={71} />
            <SignalRow label="Developer reputation" value={connections.github.score || connections.gitlab.score || 32} />
            <SignalRow label="Social reputation" value={connections.x.score || 24} />
            <SignalRow label="Sybil confidence" value={84} />
            <Link to="/onboarding" className="profile-cta"><Icon name="spark" size={17} /> Add another signal <Icon name="arrow" size={16} /></Link>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}

function PortfolioRow({ token, project, status, primary, secondary, action, highlighted = false }: {
  token: string
  project: string
  status: string
  primary: string
  secondary: string
  action: string
  highlighted?: boolean
}) {
  return (
    <article className="portfolio-row">
      <span className="portfolio-token">{token.slice(0, 1)}</span>
      <div><strong>{project}</strong><span>{token} · {status}</span></div>
      <div><strong>{primary}</strong><span>{secondary}</span></div>
      <button type="button" className={highlighted ? 'button button-primary' : 'button button-secondary'} onClick={() => navigate(`/launch/${project.toLowerCase().replace(/\s/g, '-')}`)}>{action}</button>
    </article>
  )
}

function SignalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="signal-row">
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="signal-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  )
}

function SettingsPage(props: SharedProps) {
  const [connections, setConnections] = useState<Connections>(() => loadConnections(props.address))
  const [connecting, setConnecting] = useState<ConnectionKey | null>(null)
  const [publicProfile, setPublicProfile] = useState(true)
  const [showHandles, setShowHandles] = useState(false)
  const [launchEmails, setLaunchEmails] = useState(true)

  if (!props.isSignedIn) {
    return <><Header {...props} /><main className="page"><AuthGate {...props} /></main><Footer /></>
  }

  function updateConnection(provider: ConnectionKey) {
    if (connections[provider].connected) {
      const next = { ...connections, [provider]: { connected: false } }
      setConnections(next)
      saveConnections(props.address, next)
      return
    }
    setConnecting(provider)
    window.setTimeout(() => {
      const next = {
        ...connections,
        [provider]: {
          connected: true,
          handle: provider === 'x' ? '@stellar_builder' : 'stellar-builder',
          score: randomScore(),
          source: 'prototype' as const,
        },
      }
      setConnections(next)
      saveConnections(props.address, next)
      setConnecting(null)
    }, 850)
  }

  return (
    <>
      <Header {...props} />
      <main className="page settings-page">
        <section className="settings-heading">
          <div><h1>Connections & privacy</h1><p>Manage how you sign in, which identities are linked, and what appears on your public reputation profile.</p></div>
        </section>

        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings sections">
            <a href="#account" className="active">Account</a>
            <a href="#connections">Connections</a>
            <a href="#privacy">Privacy</a>
            <a href="#notifications">Notifications</a>
          </nav>
          <div className="settings-content">
            <SettingsSection id="account" title="Stellar account" description="Blux manages your primary authentication and wallet session.">
              <div className="settings-account"><span className="identity-mark"><Icon name="wallet" /></span><div><strong>{shortAddress(props.address)}</strong><span>Connected through Blux · Stellar Testnet</span></div><button type="button" className="text-button" onClick={() => navigate('/portfolio')}>View panel</button></div>
            </SettingsSection>

            <SettingsSection id="connections" title="Connected identities" description="Optional accounts add independent signals to your reputation profile.">
              {(['x', 'github', 'gitlab'] as ConnectionKey[]).map((provider) => (
                <div className="settings-connection" key={provider}>
                  <span className="connection-icon"><Icon name={provider === 'x' ? 'x' : provider} /></span>
                  <div><strong>{provider === 'x' ? 'X' : provider === 'github' ? 'GitHub' : 'GitLab'}</strong><span>{connections[provider].connected ? `${connections[provider].handle} · Signal ${connections[provider].score}` : 'Not connected'}</span></div>
                  <button type="button" className="button button-secondary" disabled={connecting === provider} onClick={() => updateConnection(provider)}>{connecting === provider ? 'Connecting…' : connections[provider].connected ? 'Disconnect' : 'Connect'}</button>
                </div>
              ))}
              <p className="inline-note">OAuth linking is represented as a frontend prototype until the backend is connected.</p>
            </SettingsSection>

            <SettingsSection id="privacy" title="Privacy" description="Choose what applications and public visitors can see.">
              <ToggleRow label="Public reputation profile" description="Let people find the signals you choose to publish." value={publicProfile} onChange={setPublicProfile} />
              <ToggleRow label="Expose connected handles" description="Show public usernames next to verified credentials." value={showHandles} onChange={setShowHandles} />
            </SettingsSection>

            <SettingsSection id="notifications" title="Notifications" description="Decide which launch events should reach you.">
              <ToggleRow label="Launch and claim reminders" description="Get reminders before commitments close or tokens unlock." value={launchEmails} onChange={setLaunchEmails} />
            </SettingsSection>

            <section className="danger-row">
              <div><h2>Session</h2><p>Sign out of this browser. Your saved profile connections remain attached to this prototype account.</p></div>
              <button type="button" className="button button-secondary" onClick={props.onLogout}><Icon name="logout" size={17} /> Log out</button>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function SettingsSection({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="settings-section" id={id}><div className="section-copy"><h2>{title}</h2><p>{description}</p></div><div>{children}</div></section>
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="toggle-row">
      <div><strong>{label}</strong><span>{description}</span></div>
      <button type="button" className={`toggle ${value ? 'on' : ''}`} role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)}><span /></button>
    </div>
  )
}

const comingSoonContent: Record<string, { title: string; description: string; icon: IconName }> = {
  '/reputation': { title: 'Reputation profile', description: 'A transparent view of Stellar activity, developer history, social reputation, ecosystem participation, wallet age, and Sybil confidence.', icon: 'shield' },
  '/missions': { title: 'Missions', description: 'Practical ways to improve a specific reputation signal through verified ecosystem participation.', icon: 'spark' },
  '/create': { title: 'Create a launch', description: 'Configure allocation mechanics, eligibility policies, accepted assets, vesting, claims, and Soroban deployment.', icon: 'wallet' },
  '/campaigns': { title: 'Growth campaigns', description: 'Build quests, referrals, allowlists, and partner campaigns around genuine participation.', icon: 'spark' },
  '/explorer': { title: 'Reputation explorer', description: 'Inspect public signals for a Stellar address and test how an eligibility policy treats it.', icon: 'search' },
  '/developers': { title: 'Developer platform', description: 'API keys, SDK examples, policy tooling, webhooks, and eligibility queries for other Stellar applications.', icon: 'github' },
  '/cli': { title: 'CLI & agents', description: 'Create, configure, and deploy reproducible Stellar launches from a terminal or coding agent.', icon: 'external' },
}

function ComingSoonPage(props: SharedProps) {
  const basePath = props.path.startsWith('/launch/') ? '/launch/:slug' : props.path.startsWith('/auction/') ? '/auction/:slug' : props.path
  const content = basePath === '/launch/:slug'
    ? { title: 'Permanent project page', description: 'Project details, tokenomics, team, contracts, audits, allocation rules, vesting, updates, and post-launch liquidity will live here.', icon: 'external' as IconName }
    : basePath === '/auction/:slug'
      ? { title: 'Auction room', description: 'Bids, clearing range, supply, settlement rules, and claim status will be presented in a focused auction experience.', icon: 'wallet' as IconName }
      : comingSoonContent[basePath] || { title: 'This route is taking shape', description: 'The foundation is in place and this product surface is next in the build sequence.', icon: 'spark' as IconName }

  return (
    <>
      <Header {...props} />
      <main className="page coming-soon">
        <div className="coming-symbol"><Icon name={content.icon} size={28} /></div>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="coming-actions"><Link to="/" className="button button-primary">Explore launches <Icon name="arrow" /></Link>{!props.isSignedIn && <button type="button" className="button button-secondary" onClick={() => void props.onLogin('/portfolio')}>Log in with Blux</button>}</div>
        <div className="coming-index"><span>Discover</span><span>Build reputation</span><span>Participate</span><span>Claim</span><span>Track</span></div>
      </main>
      <Footer />
    </>
  )
}

export default App
