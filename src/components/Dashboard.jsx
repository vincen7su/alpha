import { useState, useEffect, useCallback } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import Token from './Token'
import IconZap from './IconZap'
import SwapOption from './SwapOption'
import { tokenMapState, tokenMapReadyValue } from '@/recoil/Network'
import { jupiterState } from '@/recoil/Api'
import { rateMapValue } from '@/recoil/RateMap'
import { debounce } from '@/utils'

const SOL_LIST = ['scnSOL', 'stSOL', 'JSOL']

function compareNumbers(a, b) {
  return b - a
}

export default function Dashboard() {
  const [tokenMap] = useRecoilState(tokenMapState)
  const [jupiter] = useRecoilState(jupiterState)
  const [rateMap] = useRecoilState(rateMapValue)
  const isReady = useRecoilValue(tokenMapReadyValue)
  const [timer, setTimer] = useState(null)
  const [routeList, setRouteList] = useState([])
  const [amount, setAmount] = useState('20')
  const [isLoading, setIsLoading] = useState(true)
  const slippagePercentage = 0.1 // 1 = 1%

  const computeRoutes = ({
    jupiter,
    inputToken,
    outputToken,
    inputAmount
  }) => jupiter.computeRoutes({
    inputMint: inputToken.mint,
    outputMint: outputToken.mint,
    inputAmount,
    slippagePercentage
    // forceFetch (optional) to force fetching routes and not use the cache
    // intermediateTokens, if provided will only find routes that use the intermediate tokens
    // feeBps
  }).then(({ routesInfos }) => routesInfos)

  // const computeRoutes = (symbol, inputAmount) =>
  //   fetch(`https://quote-api.jup.ag/v1/quote?inputMint=${inputToken.address}&outputMint=${tokenMap[symbol].address}&amount=${inputAmount}&slippage=${slippagePercentage}`)
  //     .then(data => data.json()).then(({ data }) => data)

  const updateRate = ({
    jupiter,
    tokenMap,
    rateMap,
    inputSymbol,
    amount
  }) => {
    if (isNaN(amount) || Number(amount) <= 0) {
      return
    }
    setIsLoading(true)

    const inputToken = tokenMap[inputSymbol]
    const inputAmount = BigNumber(amount).times(BigNumber(10).pow(inputToken.decimals)).toNumber()

    Promise.all(
      SOL_LIST.map(symbol => computeRoutes({
        jupiter,
        inputToken,
        outputToken: tokenMap[symbol],
        inputAmount
      }))
    ).then(resultList => SOL_LIST.map((symbol, index) => {
      const routes = resultList[index]
      if (routes.length === 0) {
        return null
      }

      const route = routes[0]
      const outAmount = BigNumber(route.outAmount).div(BigNumber(10).pow(inputToken.decimals))
      const rate = rateMap[symbol] || -1
      const solAmount = rate !== -1
        ? BigNumber(route.outAmount).div(rate) : -1
      const premium = rate !== -1
        ? solAmount.minus(inputAmount).div(BigNumber(10).pow(tokenMap.SOL.decimals)).toNumber() : -1

      return {
        symbol,
        route,
        outAmount,
        rate,
        premium
      }
    }).sort((a, b) => compareNumbers(a.premium, b.premium))).then(routeList => {
      setRouteList(routeList)
      setIsLoading(false)
    })
  }

  const debounceUpdateRate = useCallback(debounce(updateRate, 250), [])

  useEffect(() => {
    if (!isReady || !jupiter) {
      return
    }
    clearInterval(timer)
    const params = {
      jupiter,
      tokenMap,
      rateMap,
      inputSymbol: 'SOL',
      amount
    }
    debounceUpdateRate(params)
    const newTimer = setInterval(() => updateRate(params), 10000)
    setTimer(newTimer)
    return () => clearInterval(newTimer)
  }, [isReady, jupiter, amount])

  const onAmountInput = event => setAmount(event.target.value.replace(/,/g, ''))

  const onRefresh = () => {
    if (!isReady || !jupiter || isLoading) {
      return
    }
    setIsLoading(true)
    clearInterval(timer)
    const params = {
      jupiter,
      tokenMap,
      rateMap,
      inputSymbol: 'SOL',
      amount
    }
    debounceUpdateRate(params)
    const newTimer = setInterval(() => updateRate(params), 10000)
    setTimer(newTimer)
  }

  const SwapRouteList = routeList.map(({
    symbol,
    route,
    rate,
    premium
  }) =>
    <SwapOption
      key={symbol}
      symbol={symbol}
      route={route}
      rate={rate}
      premium={premium}
    />
  )

  const iconZapLoadingClass = isLoading ? 'loading' : ''

  return (
    <div className="dashboard">
      <div className="input-wrap">
        <Token symbol="SOL" />
        <input
          type="text"
          className="number-input"
          placeholder="0.00"
          value={amount}
          onChange={onAmountInput}
        />
      </div>
      <IconZap className={`noselect icon-zap ${iconZapLoadingClass}`} onClick={onRefresh} />
      { SwapRouteList }

      <div className="noselect zap-button">Zap In</div>
    </div>
  )
}