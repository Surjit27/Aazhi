export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  if (nonEmpty.length < 2) return { ok: false, records: [], error: 'CSV needs a header row and at least one data row.' }

  const headers = nonEmpty[0].map((h) => h.trim())
  const records = nonEmpty.slice(1).map((cells) =>
    Object.fromEntries(headers.map((h, idx) => [h, (cells[idx] ?? '').trim()])),
  )
  return { ok: true, records, error: null }
}

export function parseImport(text, format) {
  if (format === 'csv') return parseCsv(text)

  try {
    const parsed = JSON.parse(text)
    const records = Array.isArray(parsed) ? parsed : [parsed]
    if (records.some((r) => typeof r !== 'object' || r === null)) {
      return { ok: false, records: [], error: 'Every JSON item must be an object.' }
    }
    return { ok: true, records, error: null }
  } catch (err) {
    return { ok: false, records: [], error: `Invalid JSON: ${err.message}` }
  }
}
