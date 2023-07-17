export function useCopy() {
  const clipboard = useClipboard()
  const showNotification = useNotification()

  return (text: string) => {
    clipboard.copy(text)
    showNotification({
      text: 'Copied to clipboard',
      icon: 'carbon:checkmark',
      duration: 3000,
    })
  }
}
