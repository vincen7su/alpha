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
  const selectedIndex = [0, 2]
  const tokenList = ['stSOL', 'scnSOL', 'JSOL']
    .filter(symbol => walletTokenBalanceMap[symbol] > 0)
    .map(({ symbol, value, isLending, isWallet, source }, index) => {
      const labelText = isLending ? 'Lending' : 'Wallet'
      return (
        <div
          key={symbol + labelText}
          className={`token-option ${selectedIndex.includes(index) ? 'selected' : ''}`}
          // onClick={() => setTokenSymbol(symbol)}
        >
          <Token symbol={symbol} />

          <div className="label">{labelText}</div>
          <div className="token-balance">{value}</div>
        </div>
      )
    })

  const onUnstake = () => {
    setIsLoading(true)
  }

  return (
    <div className="unstake-dashboard">
      <div className="title-label">Select Liquid Token</div>
      <div className="token-list">
        { tokenList }
      </div>
      <div className="divider" />
      <div className="title-label">Total Receive</div>
      <div className="unstake-result">
        <Token symbol="SOL" />
        <div className="unstake-balance"></div>
      </div>
      <div className="unstake-button">UNSTAKE</div>
      {/*<ActionButton
        isDisable={tokenSymbol === ''}
        isLoading={!isReady || isLoading}
        text="Unstake"
        onClick={onUnstake}
      />*/}
    </div>
  )
}