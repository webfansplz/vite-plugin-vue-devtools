import { popupWindow, state } from './state'

export function usePiPMode(iframeGetter: () => HTMLIFrameElement | undefined, hook: object) {
  // Experimental: Picture-in-Picture mode
  // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/
  // @ts-expect-error experimental API
  const documentPictureInPicture = window.documentPictureInPicture
  async function popup() {
    const iframe = iframeGetter()
    const pip = popupWindow.value = await documentPictureInPicture.requestWindow({
      width: Math.round(window.innerWidth * state.value.width / 100),
      height: Math.round(window.innerHeight * state.value.height / 100),
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
      state.value.width = Math.round(pip.innerWidth / window.innerWidth * 100)
      state.value.height = Math.round(pip.innerHeight / window.innerHeight * 100)
    })
    pip.addEventListener('pagehide', () => {
      popupWindow.value = null
      pip.close()
    })
  }
  return {
    popup,
  }
}
