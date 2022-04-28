import { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Wallet from './Wallet'
import {
  connectionState,
  epochInfoState,
  performanceSampleListState,
  epochTimeRemainingValue,
  epochProgressValue
} from '@/recoil/Network'
import AlphaLogo from '../images/alpha1.svg'

const EPOCH_INFO_UPDATE_FREQUENCY = 30000
const SAMPLE_HISTORY_HOURS = 6
const PERFORMANCE_SAMPLE_LIMIT = 60 * SAMPLE_HISTORY_HOURS
const DASHBOARD_LIST = ['ZAP', 'VAULTS']

export default function Header({
  dashboardKey,
  setDashboardKey
}) {
  const [connection] = useRecoilState(connectionState)
  const [epochInfo, setEpochInfo] = useRecoilState(epochInfoState)
  const [, setPerformanceSampleList] = useRecoilState(performanceSampleListState)
  const epochTimeRemaining = useRecoilValue(epochTimeRemainingValue)
  const epochProgress = useRecoilValue(epochProgressValue)

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

  const dashboardNavigationList = DASHBOARD_LIST.map(key => {
    const activeClass = key === dashboardKey ? 'active' : ''
    return (
      <div
        key={key}
        className={`navigation-link ${activeClass}`}
        onClick={() => setDashboardKey(key)}
      >{key}</div>
    )
  })

  return (
    <div className="header">
      <div className="logo-container">
        <img className="alpha-logo" src={AlphaLogo} alt="alpha logo" />
      </div>
      <div className="header-center flex-1">
        {/*<div className="circle-wrap">
          <div className="circle">
            <div className="mask full">
              <div className="fill"></div>
            </div>
            <div className="mask half">
              <div className="fill"></div>
            </div>
            <div className="inside-circle"> {epochProgress}% </div>
          </div>
        </div>*/}
        <div className="epoch-info">
          <div className="epoch">EPOCH {epochInfo.epoch}</div>
          <div className="remaining-time">ETA {epochTimeRemaining}</div>
        </div>
        <div className="navigation">
          {dashboardNavigationList}
        </div>
      </div>
      <Wallet />
    </div>
  )
}
