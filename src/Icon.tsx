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
