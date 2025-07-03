import { useEffect, useState } from "react"

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
 
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )
 
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])
 
  if (isStandalone) {
    return null // Don't show install button if already installed
  }
 
  return (
    <div>
      <h3>Instalar Mi Asistente</h3>
      <button>Añadir a la pantalla de inicio</button>
      {isIOS && (
        <p>
          Para instalar esta aplicación en su dispositivo iOS, toque el botón de compartir
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then "Add to Home Screen
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>.
        </p>
      )}
    </div>
  )
}

export default InstallPrompt;