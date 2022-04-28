import Vault from './Vault'

const VAULT_LIST = [
  {
    key: 'hodler',
    icon: 'hodler',
    name: 'Hodler',
    apy: '-',
    symbol: 'SOL',
    tvl: '-'
  },
  {
    key: 'arbtunity',
    icon: 'arbtunity',
    name: 'Arbtunity',
    apy: '-',
    symbol: 'SOL',
    tvl: '-',
    active: true
  },
  {
    key: 'alchemy',
    icon: 'alchemy',
    name: 'Alchemy',
    apy: '-',
    symbol: 'BTC',
    tvl: '-'
  }
]

export default function VaultDashboard() {

  const VaultList = VAULT_LIST.map(data =>
    <Vault {...data} />
  )
  
  return (
    <div className="vault-dashboard">
      <div className="title-label">Exclusive Strategic Vaults</div>
      <div className="vault-list">
        {VaultList}
      </div>
      <div className="unstake-button">APPLY</div>
    </div>
  )
}