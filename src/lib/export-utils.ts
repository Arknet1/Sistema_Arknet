/**
 * Utilitários de exportação de dados para formato CSV / Excel compatível
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T | string; header: string; format?: (val: any, row: T) => string }[]
) {
  if (!data || data.length === 0) {
    alert('Não há dados disponíveis para exportar.')
    return
  }

  // Cabeçalhos
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';')

  // Linhas
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value = (row as any)[col.key]
        if (col.format) {
          value = col.format(value, row)
        } else if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        // Escapar aspas duplas e envolver em aspas
        const strVal = String(value).replace(/"/g, '""')
        return `"${strVal}"`
      })
      .join(';')
  })

  // BOM para garantir renderização correta de caracteres UTF-8 no Microsoft Excel
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
