export function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null }
  } catch (err) {
    return { ok: false, value: null, error: err.message }
  }
}

export function prettyJson(value) {
  return JSON.stringify(value, null, 2)
}
