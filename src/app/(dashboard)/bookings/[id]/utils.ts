
export interface RefData {
  currencies: { id: number; code: string; symbol: string | null }[]
  bookingItemStatuses: { id: number; name: string }[]
  countries: { id: number; name: string }[]
  suppliers: { id: number; provider_code: string | null; cif: string | null }[]
}

export const getCurrencyCode = (refData: RefData, id?: number | null) =>
  refData.currencies.find((c) => String(c.id) === String(id))?.code ?? (id ? String(id) : null)

export const getCountryName = (refData: RefData, id?: number | null) =>
  refData.countries.find((c) => String(c.id) === String(id))?.name ?? (id ? String(id) : null)

export const getStatusName = (refData: RefData, id?: number | null) =>
  refData.bookingItemStatuses.find((s) => s.id.toString() === id?.toString())?.name ?? (id ? String(id) : null)

export const getSupplierLabel = (refData: RefData, id?: number | null) => {
  const s = refData.suppliers.find((s) => String(s.id) === String(id))
  if (!s) return id ? String(id) : null
  return s.provider_code
}

export function nullify(val: string | null | undefined): string | null {
  if (val === null || val === undefined) return null
  const trimmed = val.trim()
  return trimmed === '' ? null : trimmed
}

export function numOrNull(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

export function intOrNull(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null
  const n = parseInt(val)
  return isNaN(n) ? null : n
}

export function formatDate(input: string | null | undefined): string | null {
  if (!input) return null
  const d = new Date(input)
  if (isNaN(d.getTime())) return input
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

export function formatDatetime(input: string | null | undefined): string | null {
  if (!input) return null
  const d = new Date(input)
  if (isNaN(d.getTime())) return input
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`
}
