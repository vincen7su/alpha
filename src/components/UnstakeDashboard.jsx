import { useState, useEffect, useCallback } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import Token from './Token'
import ActionButton from './ActionButton'
import { walletTokenBalanceMapState, walletTokenBalanceReadyValue } from '@/recoil/Wallet'

export default function UnstakeDashboard() {
  const [walletTokenBalanceMap] = useRecoilState(walletTokenBalanceMapState)
  const isReady = useRecoilValue(walletTokenBalanceReadyValue)
  // const [amount, setAmount] = useState('20')
  const [isLoading, setIsLoading] = useState(false)
  const [tokenSymbol, setTokenSymbol] = useState('')
  // const onAmountInput = event => setAmount(event.target.value.replace(/,/g, ''))
  const tokenList = Object.keys(walletTokenBalanceMap)
    .filter(symbol => walletTokenBalanceMap[symbol] > 0)
    .map(symbol => (
      <div
        className={`token-option ${tokenSymbol === symbol ? 'selected' : ''}`}
        onClick={() => setTokenSymbol(symbol)}
      >
        <Token key={symbol} symbol={symbol} />
        <div className="token-balance">{walletTokenBalanceMap[symbol]}</div>
      </div>
    ))
  const onUnstake = () => {
    setIsLoading(true)
  }

  return (
    <div className="unstake-dashboard">
      <div className="token-list">
        { tokenList }
      </div>
      <ActionButton
        isDisable={tokenSymbol === ''}
        isLoading={!isReady || isLoading}
        text="Unstake"
        onClick={onUnstake}
      />
    </div>
  )
}