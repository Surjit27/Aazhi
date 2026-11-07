import { clientAppOrigin } from './appHost.js'

/** After auth on home.*, move the session to the client portal origin. */
export function openClientSessionWithHandoff(handoffCode) {
  if (!handoffCode) return
  window.location.assign(`${clientAppOrigin()}/session#${encodeURIComponent(handoffCode)}`)
}
