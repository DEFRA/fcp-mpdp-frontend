import { logBackendError } from './log-backend-error.js'

export async function handleBackendRequest (backendUrl, promise) {
  try {
    return await promise
  } catch (err) {
    logBackendError(backendUrl, err)
    throw err
  }
}
