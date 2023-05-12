export function useCopy() {
  const clipboard = useClipboard()
  const showNotification = useNotification()

  return (text: string) => {
    clipboard.copy(text)
    console.log(showNotification)
    showNotification('Copied to clipboard', 'carbon-checkmark')
  }
}
