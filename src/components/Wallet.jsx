import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { connectionState, tokenMapState, tokenMapReadyValue } from '@/recoil/Network'
import {
  walletState,
  walletBalanceState,
  walletTokenBalanceMapState,
  walletReadyValue,
  walletBalanceReadyValue,
  walletShortAddressValue
} from '@/recoil/Wallet'

import { format } from '@/utils'

const tokenList = ['stSOL', 'scnSOL', 'JSOL']

function WalletInfo() {
  const [connection] = useRecoilState(connectionState)
  const [{ connecting, publicKey }] = useRecoilState(walletState)
  const [tokenMap] = useRecoilState(tokenMapState)
  const [balance, setBalance] = useRecoilState(walletBalanceState)
  const [walletTokenBalanceMap, setWalletTokenBalanceMap] = useRecoilState(walletTokenBalanceMapState)
  const isReady = useRecoilValue(walletReadyValue)
  const tokenMapReady = useRecoilValue(tokenMapReadyValue)
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
    const getTokenBalance = (
      symbol,
      tokenAddress
    ) => connection.getTokenAccountsByOwner(
      publicKey,
      { mint: new PublicKey(tokenAddress) }
    ).then(result => {
      if (result.value.length === 0) {
        return { symbol, balance: 0 }
      }
      const userTokenAtaPublicKey = result.value[0].pubkey
      return connection.getTokenAccountBalance(
        userTokenAtaPublicKey
      ).then(result => {
        return {
          symbol,
          balance: result.value.length === 0 ? 0 : result.value.uiAmountString
        }
      })
    })

    const updateWalletBalance = () => {
      getBalance()
      tokenMapReady && Promise.all(
        tokenList.map(symbol =>
          getTokenBalance(symbol, tokenMap[symbol].address)
        )
      ).then(tokenBalanceList => {
        const tokenBalanceMap = {}
        tokenBalanceList.forEach(({ symbol, balance }) => {
          tokenBalanceMap[symbol] = balance
        })
        setWalletTokenBalanceMap(tokenBalanceMap)
      })
    }

    updateWalletBalance()
    const timer = setInterval(updateWalletBalance, 10000)
    return () => clearInterval(timer)
  }, [isReady, tokenMapReady, connection, publicKey])

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
