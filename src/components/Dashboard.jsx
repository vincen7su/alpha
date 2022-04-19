import { useState, useEffect, useCallback } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import Token from './Token'
import IconZap from './IconZap'
import SwapOption from './SwapOption'
import ActionButton from './ActionButton'
import { tokenMapState, tokenMapReadyValue } from '@/recoil/Network'
import { jupiterState } from '@/recoil/Api'
import { rateMapValue } from '@/recoil/RateMap'
import { walletState, walletBalanceState } from '@/recoil/Wallet'
import { compareNumber, debounce } from '@/utils'

const SOL_LIST = ['scnSOL', 'stSOL', 'JSOL']
const ROUTE_REFRESH_TIME = 20000

export default function Dashboard() {
  const [tokenMap] = useRecoilState(tokenMapState)
  const [{ publicKey }] = useRecoilState(walletState)
  const [balance] = useRecoilState(walletBalanceState)
  const [jupiter] = useRecoilState(jupiterState)
  const [rateMap] = useRecoilState(rateMapValue)
  const isReady = useRecoilValue(tokenMapReadyValue)
  const [timer, setTimer] = useState(null)
  const [routeList, setRouteList] = useState([])
  const [amount, setAmount] = useState('20')
  const [optionIndex, setOptionIndex] = useState(0)
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
    }).sort((a, b) => compareNumber(a.premium, b.premium))).then(routeList => {
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
    const newTimer = setInterval(() => updateRate(params), ROUTE_REFRESH_TIME)
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
    const newTimer = setInterval(() => updateRate(params), ROUTE_REFRESH_TIME)
    setTimer(newTimer)
  }

  const onZap = () => {
    if (isLoading) {
      return
    }
    setIsLoading(true)

    const bestRoute = routeList[optionIndex].route
    jupiter.exchange({ bestRoute })
      .then(({ execute }) => execute())
      .then(swapResult => {
        if (swapResult.error) {
          console.log(swapResult.error)
        } else {
          console.log(`https://solscan.io/tx/${swapResult.txid}`)
          console.log(`inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`)
          console.log(`inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const SwapRouteList = routeList.map(({
    symbol,
    route,
    rate,
    premium
  }, index) =>
    <SwapOption
      key={symbol}
      symbol={symbol}
      route={route}
      rate={rate}
      premium={premium}
      selected={index === optionIndex}
      onClick={() => setOptionIndex(index)}
    />
  )

  const iconZapLoadingClass = isLoading ? 'loading' : ''
  const finalAmount = Number(amount)
  const isDisable = finalAmount === 0
  const isInsufficientBalance = finalAmount > balance

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
      <div className="option-list">{ SwapRouteList }</div>
      <ActionButton
        isDisable={isDisable}
        isLoading={isLoading}
        isInsufficientBalance={isInsufficientBalance}
        text="Zap In"
        onClick={onZap}
      />
    </div>
  )
}