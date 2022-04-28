import { atom, selector } from 'recoil'
import BigNumber from 'bignumber.js'
import { intervalToDuration } from 'date-fns'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { parseRemainingTime } from '@/utils'

export const networkState = atom({
  key: 'Network',
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  default: WalletAdapterNetwork.Mainnet
  // default: WalletAdapterNetwork.Devnet
})

export const endpointState = atom({
  key: 'Endpoint',
  default: ''
})

export const connectionState = atom({
  key: 'Connection',
  default: null,
  dangerouslyAllowMutability: true
})

export const tokenMapState = atom({
  key: 'TokenMap',
  default: {}
})

export const epochInfoState = atom({
  key: 'EpochInfo',
  default: {}
  // absoluteSlot, blockHeight, epoch, slotIndex, slotsInEpoch, transactionCount
})

export const performanceSampleListState = atom({
  key: 'PerformanceSampleList',
  default: []
  // { numSlots, numTransactions, samplePeriodSecs, slot }
})

export const tokenMapReadyValue = selector({
  key: 'TokenMapReady',
  get: ({ get }) => Object.keys(get(tokenMapState)).length > 0
})

export const epochInfoReadyValue = selector({
  key: 'EpochInfoReady',
  get: ({ get }) => Object.keys(get(epochInfoState)).length > 0
})

export const epochProgressValue = selector({
  key: 'EpochProgress',
  get: ({ get }) => {
    if (!get(epochInfoReadyValue)) {
      return -1
    }
    const { slotIndex, slotsInEpoch } = get(epochInfoState)
    return BigNumber(100).times(slotIndex).div(slotsInEpoch).toFixed(1)
  },
  cachePolicy_UNSTABLE: {
    eviction: 'most-recent'
  }
})

export const epochTimeRemainingValue = selector({
  key: 'EpochTimeRemaining',
  get: ({ get }) => {
    if (!get(epochInfoReadyValue)) {
      return
    }
    const sampleList = get(performanceSampleListState)
    if (sampleList.length < 1) {
      return
    }

    let samplesInHour = 0
    let slotTime1h = 0
    for (let i = 0; i < sampleList.length; i++) {
      if (i >= 60) {
        break
      }
      const sample = sampleList[i]
      if (sample.numSlots !== 0) {
        slotTime1h = slotTime1h + (sample.samplePeriodSecs / sample.numSlots)
        samplesInHour++
      }
    }
    const avgSlotTime1h = slotTime1h / samplesInHour
    const hourlySlotTime = Math.round(1000 * avgSlotTime1h)
    const { slotIndex, slotsInEpoch } = get(epochInfoState)
    return parseRemainingTime(intervalToDuration({ start: 0, end: (slotsInEpoch - slotIndex) * hourlySlotTime }))
  },
  cachePolicy_UNSTABLE: {
    eviction: 'most-recent'
  }
})
