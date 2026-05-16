const ExcelJS = require('exceljs');

const exportToExcel = async (data, columns) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Berger Paints Report');

  // Header styling
  worksheet.columns = columns.map((col) => ({
    header: col.toUpperCase(),
    key: col,
    width: 20,
  }));

  // Style header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1B3A6B' },
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center' };
  });

  // Add data rows
  data.forEach((row, index) => {
    const newRow = worksheet.addRow(row);
    // Alternate row colors
    if (index % 2 === 0) {
      newRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F4FF' },
        };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = { exportToExcel };