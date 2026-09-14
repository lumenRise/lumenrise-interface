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
    date: 'Sep 24 · 12:00 UTC',
    allocation: 'Proportional',
    allocationNote: 'Based on total valid commitments.',
    reputation: 63,
    participants: '3,482',
    action: 'Participate',
    mark: 'star',
  },
  {
    slug: 'northstar-compute',
    name: 'Northstar Compute',
    symbol: 'NST',
    description: 'Verifiable compute for open infrastructure.',
    status: 'Live',
    raised: '$480,000',
    target: '$800,000',
    progress: 60,
    timingLabel: 'Closes in',
    timingValue: '5 days',
    date: 'Sep 27 · 16:00 UTC',
    allocation: 'Fixed allocation',
    allocationNote: 'Equal allocation for eligible participants.',
    reputation: 48,
    participants: '1,906',
    action: 'Participate',
    mark: 'slash',
  },
  {
    slug: 'luma-commons',
    name: 'Luma Commons',
    symbol: 'LUMA',
    description: 'Community-owned tools for independent creators.',
    status: 'Auction',
    raised: '$320,000',
    target: '$1,000,000',
    progress: 32,
    timingLabel: 'Auction ends in',
    timingValue: '1 day',
