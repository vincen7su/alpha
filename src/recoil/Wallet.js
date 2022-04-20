import { atom, selector } from 'recoil'
import { connectionState } from './Network'
import { shortenAddress } from '@/utils'

export const walletState = atom({
  key: 'Wallet',
  default: {},
  dangerouslyAllowMutability: true
})

export const walletBalanceState = atom({
  key: 'WalletBalance',
  default: -1
})

export const walletTokenBalanceMapState = atom({
  key: 'WalletTokenBalanceMap',
  default: {}
})

export const walletReadyValue = selector({
  key: 'WalletReady',
  get: ({ get }) => {
    const connection = get(connectionState)
    const walletInfo = get(walletState)
    return connection !== null && walletInfo.connected
  }
})

export const walletBalanceReadyValue = selector({
  key: 'WalletBalanceReady',
  get: ({ get }) => get(walletBalanceState) !== -1
})

export const walletTokenBalanceReadyValue = selector({
  key: 'WalletTokenBalanceReady',
  get: ({ get }) => Object.keys(get(walletTokenBalanceMapState)).length > 0
})

export const walletAddressValue = selector({
  key: 'WalletAddress',
  get: ({ get }) => {
    return get(walletReadyValue) ? get(walletState).publicKey.toString() : ''
  }
})

export const walletShortAddressValue = selector({
  key: 'WalletShortAddress',
  get: ({ get }) => {
    return shortenAddress(get(walletAddressValue))
  }
})
