import { atom, selector } from 'recoil'
import BigNumber from 'bignumber.js'

export const jupiterState = atom({
  key: 'Jupiter',
  default: null,
  dangerouslyAllowMutability: true
})

export const soceanState = atom({
  key: 'Socean',
  default: null,
  dangerouslyAllowMutability: true
})

