export function useCopy() {
  const clipboard = useClipboard()
  const showNotification = useNotification()

  return (text: string) => {
    clipboard.copy(text)
    showNotification('Copied to clipboard', 'i-carbon-checkmark')
  }
}
