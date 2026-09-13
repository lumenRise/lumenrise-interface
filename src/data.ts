export type LaunchStatus =
  | 'Live'
  | 'Upcoming'
  | 'Auction'
  | 'Recently launched'
  | 'Completed'

export type Launch = {
  slug: string
  name: string
  symbol: string
  description: string
  status: LaunchStatus
  raised: string
  target: string
  progress: number
  timingLabel: string
  timingValue: string
  date: string
  allocation: string
  allocationNote: string
  reputation: number | null
  participants: string
  action: string
  mark: 'star' | 'slash' | 'orbit' | 'hourglass' | 'arc' | 'flag'
}

export const launches: Launch[] = [
  {
    slug: 'meridian',
    name: 'Meridian',
    symbol: 'MDR',
    description: 'Open finance rails for cross-border settlement.',
    status: 'Live',
    raised: '$1,250,000',
    target: '$2,000,000',
    progress: 63,
    timingLabel: 'Closes in',
    timingValue: '2 days',
