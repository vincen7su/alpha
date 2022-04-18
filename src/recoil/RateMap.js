import { atom, selector } from 'recoil'

export const stSolRateState = atom({
  key: 'StSolRate',
  default: -1
})

export const scnSolRateState = atom({
  key: 'ScnSolRate',
  default: -1
})

export const jSolRateState = atom({
  key: 'JSolRate',
  default: -1
})

export const rateMapValue = selector({
  key: 'RateMap',
  get: ({ get }) => ({
    stSOL: get(stSolRateState),
    scnSOL: get(scnSolRateState),
    JSOL: get(jSolRateState)
  })
})

export const franciumLendingRateMapState = atom({
  key: 'FranciumLendingRateMap',
  default: {}
})

