import BigNumber from 'bignumber.js'
import Token from './Token'

export default function SwapOption({
  symbol,
  route,
  rate,
  premium,
  selected,
  onClick = () => {}
}) {
  const amount = premium !== -1 ? BigNumber(premium).toFixed(4, 1) : premium
  const sign = premium > 0 ? '+' : ''
  const selectedClass = selected ? 'selected' : ''

  return (
    <div className={`swap-option ${selectedClass}`} onClick={onClick}>
      <Token symbol={symbol} />
      <div>{sign}{amount}</div>
    </div>
  )
}
