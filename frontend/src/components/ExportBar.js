import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText, FileOutput, Braces, Download, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

const BASE = 'https://datafluent-ai.onrender.com';

export default function ExportBar({ data, columns, sql, insight, question }) {
  const [jsonCopied, setJsonCopied] = useState(false);

  const exportExcel = async () => {
    try {
      const res = await axios.post(`${BASE}/api/export`, { data, columns }, { responseType: 'blob' });
      download(res.data, 'datafluent_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch { alert('Excel export failed'); }
  };

  const exportCSV = () => {
    const header = columns.join(',');
    const rows   = data.map(row => columns.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(','));
    download(new Blob([[header, ...rows].join('\n')], { type: 'text/csv' }), 'datafluent_report.csv', 'text/csv');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W   = doc.internal.pageSize.width;

    doc.setFillColor(15, 28, 60);
    doc.rect(0, 0, W, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DataFluent AI — Report', 30, 38);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 30, 52);

    let y = 80;
    if (question) {
      doc.setTextColor(80, 80, 80); doc.setFontSize(11);
      doc.setFont('helvetica', 'bold'); doc.text('Question:', 30, y);
      doc.setFont('helvetica', 'normal'); doc.text(question, 105, y);
      y += 20;
    }
    if (insight) {
      doc.setFillColor(240, 244, 255);
      doc.roundedRect(28, y - 4, W - 56, 22, 4, 4, 'F');
      doc.setTextColor(27, 58, 107); doc.setFontSize(11);
      doc.setFont('helvetica', 'bolditalic');
      doc.text(insight, 34, y + 10); y += 30;
    }
    if (sql) {
      doc.setFontSize(9); doc.setFont('courier', 'normal'); doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(`SQL: ${sql}`, W - 60);
      doc.text(lines, 30, y); y += lines.length * 12 + 10;
    }
    autoTable(doc, {
      startY: y,
      head: [columns.map(c => c.toUpperCase())],
      body: data.slice(0, 200).map(row => columns.map(c => String(row[c] ?? ''))),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [15, 28, 60], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      margin: { left: 30, right: 30 },
    });
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${total} — DataFluent AI`, 30, doc.internal.pageSize.height - 15);
    }
    doc.save('datafluent_report.pdf');
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <div style={styles.bar}>
      <span style={styles.label}><Download size={14} style={{ marginRight: 4 }} />Export</span>
      <Btn onClick={exportExcel} Icon={FileSpreadsheet} label="Excel"      cls="btn-success" />
      <Btn onClick={exportCSV}   Icon={FileText}        label="CSV"        cls="btn-ghost"   />
      <Btn onClick={exportPDF}   Icon={FileOutput}      label="PDF Report" cls="btn-gold"    />
      <Btn onClick={copyJSON}    Icon={jsonCopied ? ClipboardCheck : Braces} label={jsonCopied ? 'Copied!' : 'JSON'} cls="btn-ghost" />
    </div>
  );
}

const Btn = ({ onClick, Icon, label, cls }) => (
  <button onClick={onClick} className={`btn ${cls}`} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
    <Icon size={14} /> {label}
  </button>
);

function download(data, filename, mime) {
  const url = window.URL.createObjectURL(new Blob([data], { type: mime }));
  const a   = document.createElement('a');
  a.href = url; a.setAttribute('download', filename);
  document.body.appendChild(a); a.click();
  a.remove(); window.URL.revokeObjectURL(url);
}

const styles = {
  bar:   { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
};
