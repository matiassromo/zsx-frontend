'use client';

import { useState } from 'react';

interface ExportPdfButtonProps {
  reportElementId: string;
}

export function ExportPdfButton({ reportElementId }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(reportElementId);
    if (!element) return;

    setIsExporting(true);

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-pdf-oklch-fix', '1');
    styleEl.textContent = `
      :root, :host {
        --color-red-50: #fef2f2 !important;
        --color-red-100: #fee2e2 !important;
        --color-red-200: #fecaca !important;
        --color-red-300: #fca5a5 !important;
        --color-red-400: #f87171 !important;
        --color-red-500: #ef4444 !important;
        --color-red-600: #dc2626 !important;
        --color-red-700: #b91c1c !important;
        --color-red-800: #991b1b !important;
        --color-red-900: #7f1d1d !important;

        --color-orange-50: #fff7ed !important;
        --color-orange-100: #ffedd5 !important;
        --color-orange-200: #fed7aa !important;
        --color-orange-300: #fdba74 !important;
        --color-orange-400: #fb923c !important;
        --color-orange-500: #f97316 !important;
        --color-orange-600: #ea580c !important;
        --color-orange-700: #c2410c !important;
        --color-orange-800: #9a3412 !important;
        --color-orange-900: #7c2d12 !important;

        --color-amber-50: #fffbeb !important;
        --color-amber-100: #fef3c7 !important;
        --color-amber-200: #fde68a !important;
        --color-amber-300: #fcd34d !important;
        --color-amber-400: #fbbf24 !important;
        --color-amber-500: #f59e0b !important;
        --color-amber-600: #d97706 !important;
        --color-amber-700: #b45309 !important;
        --color-amber-800: #92400e !important;
        --color-amber-900: #78350f !important;

        --color-yellow-50: #fefce8 !important;
        --color-yellow-100: #fef9c3 !important;
        --color-yellow-200: #fef08a !important;
        --color-yellow-300: #fde047 !important;
        --color-yellow-400: #facc15 !important;
        --color-yellow-500: #eab308 !important;
        --color-yellow-600: #ca8a04 !important;
        --color-yellow-700: #a16207 !important;
        --color-yellow-800: #854d0e !important;
        --color-yellow-900: #713f12 !important;

        --color-green-50: #f0fdf4 !important;
        --color-green-100: #dcfce7 !important;
        --color-green-200: #bbf7d0 !important;
        --color-green-300: #86efac !important;
        --color-green-400: #4ade80 !important;
        --color-green-500: #22c55e !important;
        --color-green-600: #16a34a !important;
        --color-green-700: #15803d !important;
        --color-green-800: #166534 !important;
        --color-green-900: #14532d !important;

        --color-blue-50: #eff6ff !important;
        --color-blue-100: #dbeafe !important;
        --color-blue-200: #bfdbfe !important;
        --color-blue-300: #93c5fd !important;
        --color-blue-400: #60a5fa !important;
        --color-blue-500: #3b82f6 !important;
        --color-blue-600: #2563eb !important;
        --color-blue-700: #1d4ed8 !important;
        --color-blue-800: #1e40af !important;
        --color-blue-900: #1e3a8a !important;

        --color-indigo-50: #eef2ff !important;
        --color-indigo-100: #e0e7ff !important;
        --color-indigo-200: #c7d2fe !important;
        --color-indigo-300: #a5b4fc !important;
        --color-indigo-400: #818cf8 !important;
        --color-indigo-500: #6366f1 !important;
        --color-indigo-600: #4f46e5 !important;
        --color-indigo-700: #4338ca !important;
        --color-indigo-800: #3730a3 !important;
        --color-indigo-900: #312e81 !important;

        --color-purple-50: #faf5ff !important;
        --color-purple-100: #f3e8ff !important;
        --color-purple-200: #e9d5ff !important;
        --color-purple-300: #d8b4fe !important;
        --color-purple-400: #c084fc !important;
        --color-purple-500: #a855f7 !important;
        --color-purple-600: #9333ea !important;
        --color-purple-700: #7e22ce !important;
        --color-purple-800: #6b21a8 !important;
        --color-purple-900: #581c87 !important;

        --color-pink-50: #fdf2f8 !important;
        --color-pink-100: #fce7f3 !important;
        --color-pink-200: #fbcfe8 !important;
        --color-pink-300: #f9a8d4 !important;
        --color-pink-400: #f472b6 !important;
        --color-pink-500: #ec4899 !important;
        --color-pink-600: #db2777 !important;
        --color-pink-700: #be185d !important;
        --color-pink-800: #9d174d !important;
        --color-pink-900: #831843 !important;

        --color-gray-50: #f9fafb !important;
        --color-gray-100: #f3f4f6 !important;
        --color-gray-200: #e5e7eb !important;
        --color-gray-300: #d1d5db !important;
        --color-gray-400: #9ca3af !important;
        --color-gray-500: #6b7280 !important;
        --color-gray-600: #4b5563 !important;
        --color-gray-700: #374151 !important;
        --color-gray-800: #1f2937 !important;
        --color-gray-900: #111827 !important;
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `;
    document.head.appendChild(styleEl);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      // Escala para que el ancho encaje; altura puede paginar
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      const mmPerPx = contentWidth / imgWidthPx; // convierte px -> mm en base al ancho
      const imgHeightMm = imgHeightPx * mmPerPx;

      let positionY = margin;
      let remainingHeight = imgHeightMm;

      // primera página
      pdf.addImage(imgData, 'PNG', margin, positionY, contentWidth, imgHeightMm, undefined, 'FAST');
      remainingHeight -= contentHeight;

      // siguientes páginas (desplazando Y en negativo para "recortar" imagen)
      while (remainingHeight > 0) {
        pdf.addPage();
        positionY = margin - (imgHeightMm - remainingHeight);
        pdf.addImage(imgData, 'PNG', margin, positionY, contentWidth, imgHeightMm, undefined, 'FAST');
        remainingHeight -= contentHeight;
      }

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`reporte-caja-${date}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      document.querySelector('style[data-pdf-oklch-fix="1"]')?.remove();
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50"
      type="button"
    >
      {isExporting ? 'Exportando…' : 'Exportar PDF'}
    </button>
  );
}
