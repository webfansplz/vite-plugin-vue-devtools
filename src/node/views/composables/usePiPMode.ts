export function usePiPMode(iframe: HTMLIFrameElement, hook: object, hideCb: () => void) {
  // Experimental: Picture-in-Picture mode
  // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/
  // @ts-expect-error experimental API
  const documentPictureInPicture = window.documentPictureInPicture
  async function popup() {
    const pip = await documentPictureInPicture.requestWindow({
      width: Math.round(window.innerWidth * 80 / 100),
      height: Math.round(window.innerHeight * 60 / 100),
    })
    const style = pip.document.createElement('style')
    style.innerHTML = `
        body {
          margin: 0;
          padding: 0;
        }
        iframe {
          width: 100vw;
          height: 100vh;
          border: none;
          outline: none;
        }
      `
    pip.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook
    pip.__VUE_DEVTOOLS_IS_POPUP__ = true
    pip.document.title = 'Vue DevTools'
    pip.document.head.appendChild(style)
    pip.document.body.appendChild(iframe)
    pip.addEventListener('resize', () => {
    })
    pip.addEventListener('pagehide', () => {
      pip.close()
      hideCb()
      isInPopup.value = false
    })
  }
  return {
    popup,
  }
}
