import BigNumber from 'bignumber.js'

export function shortenAddress(s, postfix = true) {
  postfix = s && postfix ? `...${s.slice(-4)}` : ''
  return `${s.slice(0, 3)}${postfix}`
}

export function format(s, config = {
  dp: 2, // Decimal places
  rm: 1 // Rounding mode
}) {
  return BigNumber(s).toFixed(config.dp, config.rm)
}

export function parseRemainingTime({ days, hours, minutes }) {
  days = days > 0 ? `${days}d` : ''
  hours = hours > 0 ? ` ${hours}h` : ''
  minutes = minutes > 0 ? ` ${minutes}m` : ''
  return `${days}${hours}${minutes}`.trim()
}

export const debounce = (func, wait = 250) => {
  let timeout
  const debounced = function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }

  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }

  return debounced
}
