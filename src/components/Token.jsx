import { useRecoilState, useRecoilValue } from 'recoil'
import { tokenMapState, tokenMapReadyValue } from '@/recoil/Network'

function TokenIcon({ symbol }) {
  const [tokenMap] = useRecoilState(tokenMapState)
  const isReady = useRecoilValue(tokenMapReadyValue)

  if (!isReady) {
    return <div className="icon" />
  }

  const { logoURI } = tokenMap[symbol]
  return (
    <img
      className="icon"
      src={logoURI}
      alt="name"
    />
  )
}

export default function Token({ symbol }) {
  return (
    <div className="noselect token">
      <TokenIcon symbol={symbol} />
      <div className="symbol">{symbol}</div>
    </div>
  )
}
