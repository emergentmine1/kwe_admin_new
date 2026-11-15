type Row = Record<string, unknown>;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const csvCell = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export function downloadCsv(name: string, rows: Row[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const body = rows.map((row) => cols.map((c) => csvCell(row[c])).join(',')).join('\n');
  triggerDownload(new Blob([`${cols.join(',')}\n${body}`], { type: 'text/csv;charset=utf-8;' }), `${name}.csv`);
}

export async function downloadXlsx(name: string, rows: Row[], sheetName: string) {
  if (!rows.length) return;
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const headers = Object.keys(rows[0]);
  sheet.columns = headers.map((header) => {
    const longest = Math.max(header.length, ...rows.map((r) => String(r[header] ?? '').length));
    return { header, key: header, width: Math.min(40, longest + 2) };
  });
  rows.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${name}.xlsx`,
  );
}
