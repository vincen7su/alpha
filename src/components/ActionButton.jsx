import { useRecoilState } from 'recoil'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { walletState } from '@/recoil/Wallet'

export default function ActionButton({
  isDisable = false,
  isLoading = false,
  isInsufficientBalance = false,
  text,
  onClick = () => {}
}) {
  const [{ publicKey }] = useRecoilState(walletState)
  isDisable = isDisable || isInsufficientBalance || isLoading
  const buttonDisabledClass = isDisable ? 'disabled' : ''
  const buttonText = isInsufficientBalance || isLoading
    ? (isLoading ? 'Loading...' : 'Insufficient Balance')
    : text
  const onClickCheck = () => !isDisable && onClick()
  
  if (publicKey) {
    return (
      <div
        className={`noselect action-button ${buttonDisabledClass}`}
        onClick={onClickCheck}
      >{buttonText}</div>
    )
  } else {
    return <WalletMultiButton />
  }
}
