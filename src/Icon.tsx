export type IconName =
  | 'arrow'
  | 'check'
  | 'copy'
  | 'external'
  | 'github'
  | 'gitlab'
  | 'lock'
  | 'logout'
  | 'search'
  | 'settings'
  | 'shield'
  | 'spark'
  | 'wallet'
  | 'x'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 18, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }

  if (name === 'arrow') {
    return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5" /></svg>
  }
  if (name === 'check') {
    return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  }
  if (name === 'copy') {
    return <svg {...common}><rect x="8" y="8" width="10" height="10" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
  }
  if (name === 'external') {
    return <svg {...common}><path d="M14 5h5v5M19 5l-8 8" /><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
  }
  if (name === 'github') {
    return <svg {...common}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3a5.4 5.4 0 0 0-.1-4S18-1.4 15 1a13.4 13.4 0 0 0-6 0C6-1.4 4.8-1 4.8-1a5.4 5.4 0 0 0-.1 4A5.8 5.8 0 0 0 3.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4" /><path d="M9 19c-3 .9-3-1.5-4.2-2" /></svg>
  }
  if (name === 'gitlab') {
    return <svg {...common}><path d="m12 21 8.5-6.2-3.2-10-2.1 6.4H8.8L6.7 4.8l-3.2 10L12 21Z" /><path d="m8.8 11.2 3.2 9.6 3.2-9.6" /></svg>
  }
  if (name === 'lock') {
    return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
  }
  if (name === 'logout') {
    return <svg {...common}><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" /></svg>
  }
  if (name === 'search') {
