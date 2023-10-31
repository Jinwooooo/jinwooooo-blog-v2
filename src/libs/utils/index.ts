export function formatDate(date: any, local: any) {
  const d = new Date(date)
  const options: any = { year: 'numeric', month: 'short'}
  const res = d.toLocaleDateString(local, options)
  return res
}
