import { shallowRef } from 'vue'

const pending = shallowRef(null)

/** Guarda datos para mostrar en inicio al volver desde otra vista. */
export function setCvPreviewPayload(payload) {
  pending.value = payload
}

/** Obtiene y limpia el payload pendiente (ej. al montar Home). */
export function takeCvPreviewPayload() {
  const p = pending.value
  pending.value = null
  return p
}
