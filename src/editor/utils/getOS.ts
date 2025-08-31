export function getOS() {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform

  if (/Win/.test(platform) || /Win/.test(userAgent)) {
    return 'Windows'
  } else if (/Mac/.test(platform) || /Mac/.test(userAgent)) {
    return 'macOS'
  } else {
    return 'Unknown' // 可能是Linux、iOS、Android或其他系统
  }
}

export function getModKeyName() {
  const os = getOS()
  return os === 'macOS' ? '⌘' : 'Ctrl'
}
