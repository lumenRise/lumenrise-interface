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
