import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { connectionState } from '@/recoil/Network'
import {
  walletState,
  walletBalanceState,
  walletReadyValue,
  walletBalanceReadyValue,
  walletShortAddressValue
} from '@/recoil/Wallet'

import { format } from '@/utils'

function WalletInfo() {
  const [connection] = useRecoilState(connectionState)
  const [{ connecting, publicKey }] = useRecoilState(walletState)
  const [balance, setBalance] = useRecoilState(walletBalanceState)
  const isReady = useRecoilValue(walletReadyValue)
  const balanceReady = useRecoilValue(walletBalanceReadyValue)
  const address = useRecoilValue(walletShortAddressValue)

  useEffect(() => {
    if (!isReady) {
      return
    }
    const getBalance = () =>
      connection.getBalance(publicKey)
        .then(balance => setBalance(
          BigNumber(balance).div(LAMPORTS_PER_SOL).toString())
        )
    getBalance()
    const timer = setInterval(getBalance, 10000)
    return () => clearInterval(timer)
  }, [isReady, connection, publicKey, setBalance])

  if (connecting) {
    return 'Connecting'
  }

  if (!isReady) {
    return 'Connect Wallet'
  }

  const balanceText = balanceReady ? `${format(balance)} SOL` : '-'
  return (
    <div className="wallet-info">
      <div className="wallet-balance">{ balanceText }</div>
      <div className="wallet-address">{ address }</div>
    </div>
  )
}

export default function Wallet() {
  return (
    <WalletMultiButton>
      <WalletInfo />
    </WalletMultiButton>
  )
}
