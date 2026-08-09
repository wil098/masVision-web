export function logEvent(event, data = {}) {
  console.log(JSON.stringify({ event, ...data, ts: new Date().toISOString() }))
}

export function logError(event, error, data = {}) {
  console.error(
    JSON.stringify({ event, error: error?.message ?? String(error), ...data, ts: new Date().toISOString() })
  )
}
