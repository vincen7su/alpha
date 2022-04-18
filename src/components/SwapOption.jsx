import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import BigNumber from 'bignumber.js'
import Token from './Token'
import JupiterLogo from './JupiterLogo'
import { tokenMapState } from '@/recoil/Network'


export default function SwapOption({
  symbol,
  route,
  rate,
  premium,
  selectCallback = () => {}
}) {
  const [tokenMap] = useRecoilState(tokenMapState)
  const amount = premium !== -1 ? BigNumber(premium).toFixed(4, 1) : premium

  const sign = premium > 0 ? '+' : ''

  return (
    <div className="swap-option" onClick={() => selectCallback(route)}>
      <Token symbol={symbol} />
      <div>{sign}{amount}</div>
    </div>
  )
}
