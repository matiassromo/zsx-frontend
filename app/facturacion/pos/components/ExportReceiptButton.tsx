'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function ExportReceiptButton({
  targetId,
  disabled,
  label = 'Imprimir comprobante',
}: {
  targetId: string;
  disabled?: boolean;
  label?: string;
}) {
  async function onPrint() {
    const el = document.getElementById(targetId);
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Ajuste de imagen manteniendo aspect ratio
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let y = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      y = heightLeft - imgHeight;
      pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('comprobante.pdf');
  }

  return (
    <button
      type="button"
      onClick={onPrint}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}
