export default function  WaitingRoom() {
  return (
    <div className="login-page">
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold text-4xl mb-4 text-stone-300 text-center">Tu cuenta está en espera de aprobación</h1>
        <p className="text-lg text-slate-300 mb-2 text-center">Gracias por registrarte. Estamos revisando tu solicitud.</p>
        <div className="mt-4 flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-2 text-secondary">Verificando estado...</span>
        </div>
      </div>
    </div>
  )
}