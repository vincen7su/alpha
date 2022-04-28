import Token from './Token'
import HodlerImage from '../images/hodler.svg'
import ArbtunityImage from '../images/arbtunity.svg'
import AlchemyImage from '../images/alchemy.svg'

const VAULT_ICON_MAP = {
  hodler: HodlerImage,
  arbtunity: ArbtunityImage,
  alchemy: AlchemyImage
}

export default function Vault({
  icon,
  name,
  apy,
  symbol,
  tvl,
  active = false
}) {

  const VaultIcon = VAULT_ICON_MAP[icon]
  
  return (
    <div className={`vault ${active ? 'active' : ''}`}>
      <img className="vault-icon" src={VaultIcon} alt={`${icon} vault`} />
      <div className="vault-name">{name}</div>
      <Token symbol={symbol} />
      <div className="vault-apy">{apy} %</div>
      {/*<div className="vault-tvl">TVL ${tvl}</div>*/}
      <div className="learn-more">Learn More</div>
    </div>
  )
}