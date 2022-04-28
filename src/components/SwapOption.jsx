import { useRecoilState } from 'recoil'
import BigNumber from 'bignumber.js'
import Token from './Token'
import JupiterLogo from './JupiterLogo'
import { franciumLendingRateMapState } from '@/recoil/RateMap'
import { format } from '@/utils'
import FranciumLogo from '../images/francium.svg'

export default function SwapOption({
  symbol,
  index,
  route,
  rate,
  premium,
  hasLend
}) {
  const [franciumLendingRateMap] = useRecoilState(franciumLendingRateMapState)
  const bestLabelClass = index === 0 ? 'best' : ''
  const amount = premium !== -1 ? BigNumber(premium).toFixed(4, 1) : premium
  const sign = premium > 0 ? '+' : ''
  const stSolLendingRate = format(franciumLendingRateMap.stSOL)

  console.log()

  return (
    <div className={`swap-option ${bestLabelClass}`}>
      <div className="left-column">
        <div className="row-wrap">
          <Token symbol={symbol} />
          <div className="swap-result">{sign}{amount} SOL</div>
        </div>
        <div className="route-row-wrap">
          <JupiterLogo />
          { hasLend &&
            <>
              <div className="combine">X</div>
              <img className="francium-logo" src={FranciumLogo} alt="francium logo" />
              Lend ({stSolLendingRate}%)
            </>
          }
        </div>
      </div>
      <div className="zap-button-wrap">
        <div className="zap-button">ZAP IN</div>
      </div>
    </div>
  )
}
