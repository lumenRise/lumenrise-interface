import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BluxProvider, networks } from '@bluxcc/react'
import '@fontsource-variable/manrope'
import '@fontsource-variable/newsreader'
import './index.css'
import App from './App.tsx'

const bluxConfig: Parameters<typeof BluxProvider>[0]['config'] = {
  appId: import.meta.env.VITE_BLUX_APP_ID || 'launchpad-preview',
  appName: 'Launchpad',
  networks: [networks.testnet],
  defaultNetwork: networks.testnet,
  loginMethods: ['wallet', 'email', 'passkey', 'twitter', 'github', 'gitlab'],
  appearance: {
    background: '#ffffff',
    fieldBackground: '#f5f6f8',
    accentColor: '#1455ee',
    textColor: '#111318',
    fontFamily: 'Manrope Variable, sans-serif',
    borderRadius: '12px',
    borderColor: '#dfe2e8',
    borderWidth: '1px',
    outlineColor: '#1455ee',
    outlineWidth: '2px',
    outlineRadius: '14px',
    logo: `${window.location.origin}/favicon.svg`,
