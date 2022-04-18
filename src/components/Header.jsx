import { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Wallet from './Wallet'
import {
  connectionState,
  epochInfoState,
  performanceSampleListState,
  epochTimeRemainingValue
} from '@/recoil/Network'
import AlphaLogo from '@/components/AlphaLogo'

const EPOCH_INFO_UPDATE_FREQUENCY = 30000
const SAMPLE_HISTORY_HOURS = 6
const PERFORMANCE_SAMPLE_LIMIT = 60 * SAMPLE_HISTORY_HOURS

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

export default function Header() {
  const [showGlitch, setShowGlitch] = useState(true)
  const [connection] = useRecoilState(connectionState)
  const [, setEpochInfo] = useRecoilState(epochInfoState)
  const [, setPerformanceSampleList] = useRecoilState(performanceSampleListState)
  const epochTimeRemaining = useRecoilValue(epochTimeRemainingValue)

  useEffect(() => {
    if (!connection) {
      return
    }
    const getEpochInfo = () => {
      connection.getEpochInfo().then(setEpochInfo)
      connection.getRecentPerformanceSamples(PERFORMANCE_SAMPLE_LIMIT).then(setPerformanceSampleList)
    }
    getEpochInfo()
    const timer = setInterval(getEpochInfo, EPOCH_INFO_UPDATE_FREQUENCY)
    return () => clearInterval(timer)
  }, [connection, setEpochInfo, setPerformanceSampleList])

  useEffect(() => {
    const timer = setInterval(() => {
      setShowGlitch(!showGlitch)
      setTimeout(() => setShowGlitch(false), 500)
    }, getRandomInt(1, 7) * 1000)
    return () => clearInterval(timer)
  }, [showGlitch])

  const glitchLogoClass = showGlitch ? 'show' : ''

  return (
    <div className="header">
      <div className="logo-container">
        <AlphaLogo className={`glitch ${glitchLogoClass}`} />
        <AlphaLogo />
      </div>
      <div className="flex-1" />
      <Wallet />
    </div>
  )
}
