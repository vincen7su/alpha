import { useMemo, useEffect } from 'react'
import { RecoilRoot, useRecoilState } from 'recoil'
import { clusterApiUrl, PublicKey } from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { TOKEN_LIST_URL, Jupiter } from '@jup-ag/core'
import { Socean } from '@soceanfi/stake-pool-sdk'
import FranciumSDK from 'francium-sdk'
import { deserializeUnchecked } from 'borsh'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import { networkState, endpointState, connectionState, tokenMapState } from '@/recoil/Network'
import { walletState } from '@/recoil/Wallet'
import { jupiterState, soceanState, franciumState } from '@/recoil/Api'
import { stSolRateState, scnSolRateState, jSolRateState, franciumLendingRateMapState } from '@/recoil/RateMap'
import { franciumPositionState } from '@/recoil/LendingPosition'
import { LIDO_ADDRESS, Lido, schema } from './constants/lidoSchema'
import jPoolSchema from './constants/jPoolSchema'

import './App.css'

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')

function App() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const [network] = useRecoilState(networkState)
  const [socean] = useRecoilState(soceanState)
  const [francium, setFrancium] = useRecoilState(franciumState)
  const [, setConnection] = useRecoilState(connectionState)
  const [, setWallet] = useRecoilState(walletState)
  const [, setTokenMap] = useRecoilState(tokenMapState)
  const [, setJupiter] = useRecoilState(jupiterState)
  const [, setStSolRate] = useRecoilState(stSolRateState)
  const [, setScnSolRate] = useRecoilState(scnSolRateState)
  const [, setJSolRate] = useRecoilState(jSolRateState)
  const [, setFranciumLendingRateMap] = useRecoilState(franciumLendingRateMapState)
  const [, setFranciumPosition] = useRecoilState(franciumPositionState)

  useEffect(() => {
    setConnection(connection)
    setFrancium(new FranciumSDK({ connection }))
  }, [connection])

  useEffect(() => {
    setWallet(wallet)
  }, [wallet, setWallet])

  useEffect(() => {
    fetch(TOKEN_LIST_URL[network])
      .then(response => response.json())
      .then(tokenList => {
        const map = {}
        tokenList.forEach(token => {
          token.mint = new PublicKey(token.address)
          map[token.symbol] = token
        })
        setTokenMap(map)
      })
  }, [network, setTokenMap])

  useEffect(() => {
    connection.getAccountInfo(new PublicKey(LIDO_ADDRESS)).then(accountInfo => {
      const deserializedAccountInfo = deserializeUnchecked(
        schema,
        Lido,
        accountInfo.data,
      )

      // Fetch SOL and stSOL balance
      const totalSolInLamports = deserializedAccountInfo.exchange_rate.sol_balance.toNumber()
      const totalStSolSupplyInLamports =
        deserializedAccountInfo.exchange_rate.st_sol_supply.toNumber()

      // Calculate the stSOL/SOL exchange rate
      const exchangeRate =  BigNumber(totalStSolSupplyInLamports).div(totalSolInLamports).toNumber()
      console.log(`stSOL rate: ${exchangeRate}`)
      setStSolRate(exchangeRate)
    })
    connection.getAccountInfo(new PublicKey(jPoolSchema.address)).then(accountInfo => {
      let { totalLamports, poolTokenSupply } = deserializeUnchecked(
        jPoolSchema.schema,
        jPoolSchema.StakePool,
        accountInfo.data
      )
      totalLamports = totalLamports.toNumber()
      poolTokenSupply = poolTokenSupply.toNumber()
      // Calculate the JSOL/SOL exchange rate
      const exchangeRate =  BigNumber(poolTokenSupply).div(totalLamports).toNumber()
      console.log(`JSOL rate: ${exchangeRate}`)
      setJSolRate(exchangeRate)
    })
  }, [connection])

  useEffect(() => {
    if (!socean) {
      return
    }
    socean.getStakePoolAccount().then(({ account }) => {
      let { totalStakeLamports, poolTokenSupply } = account.data
      totalStakeLamports = totalStakeLamports.toNumber()
      poolTokenSupply = poolTokenSupply.toNumber()
      // Calculate the scnSOL/SOL exchange rate
      const exchangeRate =  BigNumber(poolTokenSupply).div(totalStakeLamports).toNumber()
      console.log(`scnSOL rate: ${exchangeRate}`)
      setScnSolRate(exchangeRate)
    })
  }, [socean])

  useEffect(() => {
    Jupiter.load({
      connection,
      cluster: network,
      user: wallet.publicKey || undefined, // or public key
      // platformFeeAndAccounts:  NO_PLATFORM_FEE,
      // routeCacheDuration: CACHE_DURATION_MS
    }).then(setJupiter)
  }, [network, connection, wallet.publicKey, setJupiter])

  useEffect(() => {
    if (!francium) {
      return
    }
    const getLendingPoolTVL = () => francium.getLendingPoolTVL()
      .then(lendingPool => {
        const lendingRateMap = {}
        lendingPool.forEach(({ id, apy }) => {
          lendingRateMap[id] = apy
        })
        setFranciumLendingRateMap(lendingRateMap)
      })
    const timer = setInterval(getLendingPoolTVL, 10000)
    return () => clearInterval(timer)
  }, [francium])

  useEffect(() => {
    if (!francium || !wallet.publicKey) {
      return
    }
    const getUserLendingPosition = () => francium.getUserLendingPosition(wallet.publicKey)
      .then(positionList => {
        const positionMap = {}
        positionList.forEach(({ pool, totalAmount }) => {
          positionMap[pool] = totalAmount // already convert to display decimal
        })
        setFranciumPosition(positionMap)
      })
    getUserLendingPosition()
    const timer = setInterval(getUserLendingPosition, 10000)
    return () => clearInterval(timer)
  }, [francium, wallet.publicKey])

  return (
    <div className="app">
      <Header />
      <Dashboard />
    </div>
  )
}

export function ProviderWrapper() {
  const [network] = useRecoilState(networkState)
  const [endpoint] = useRecoilState(endpointState)
  const [, setSocean] = useRecoilState(soceanState)

  // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network })
    ],
    [network]
  )

  useEffect(() => {
    const socean = new Socean(network, 'https://francium.rpcpool.com')
    setSocean(socean)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint} config={{}}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default function Container() {
  return (
    <RecoilRoot>
      <ProviderWrapper />
    </RecoilRoot>
  )
}
