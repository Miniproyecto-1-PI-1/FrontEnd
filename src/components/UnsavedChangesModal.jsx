import Modal from './Modal'
import shared from '../styles/shared.module.css'

export default function UnsavedChangesModal({ blocker }) {
  if (blocker.state !== 'blocked') return null
  return (
    <Modal
      title="¿Descartar los cambios?"
      onClose={() => blocker.reset()}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.ghost} ${shared.btnSm}`} onClick={() => blocker.reset()}>
            Seguir editando
          </button>
          <button type="button" className={`${shared.btn} ${shared.danger} ${shared.btnSm}`} onClick={() => blocker.proceed()}>
            Descartar cambios
          </button>
        </>
      }
    >
      Tienes cambios sin guardar. Si sales ahora, se perderán.
    </Modal>
  )
}
