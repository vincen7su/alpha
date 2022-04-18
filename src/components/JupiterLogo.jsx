import JupiterLogoImage from '@/images/jupiter-logo.svg'

export default function JupiterLogo() {
  return (
    <div className="jupiter-logo-container">
      <img className="jupiter-logo" src={JupiterLogoImage} alt="jupiter logo" />
      <div className="logo-text">Jupiter</div>
    </div>
  )
}
