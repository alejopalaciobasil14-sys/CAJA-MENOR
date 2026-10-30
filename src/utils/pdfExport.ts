import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PettyCashRequest, CajaFinancialMetrics, CajaPeriod } from '../types';
import { formatCOP, formatDateTime, formatDate } from './formatters';

/**
 * Genera el Informe General o Específico en PDF con encabezados institucionales,
 * tabla de datos y resumen de indicadores
 */
export function exportRequestsToPDF(
  reportTitle: string,
  requests: PettyCashRequest[],
  period: CajaPeriod,
  metrics: CajaFinancialMetrics,
  subtitle: string = 'Informe de Control y Consumo'
) {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Encabezado Corporativo
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PLATAFORMA DE GESTIÓN Y CONTROL DE CAJA MENOR', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`FONDO ROTATORIO: $2.000.000 COP | PERÍODO: ${period.name.toUpperCase()}`, 14, 18);

  // Fecha y hora de generación a la derecha
  const printDate = formatDateTime(new Date().toISOString());
  doc.text(`Generado: ${printDate}`, 283, 18, { align: 'right' });

  // Título del Reporte
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(reportTitle.toUpperCase(), 14, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 14, 38);

  // Cuadro resumen de métricas clave en la parte superior
  const startY = 42;
  const cardWidth = 50;
  const cardHeight = 16;
  const gap = 5;

  const kpis = [
    { label: 'Fondo Inicial', val: formatCOP(metrics.initialFund), bg: [241, 245, 249] },
    { label: 'Total Entregado', val: formatCOP(metrics.totalDelivered), bg: [254, 243, 199] },
    { label: 'Gastos Legalizados', val: formatCOP(metrics.totalSpent), bg: [254, 226, 226] },
    { label: 'Devoluciones', val: formatCOP(metrics.totalReturned), bg: [220, 252, 231] },
    { label: 'Saldo Disponible', val: formatCOP(metrics.availableCashBalance), bg: [224, 231, 255] }
  ];

  kpis.forEach((kpi, index) => {
    const x = 14 + index * (cardWidth + gap);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.label, x + 3, startY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 3, startY + 12);
  });

  // Datos para la tabla
  const tableRows = requests.map(req => [
    req.code,
    formatDate(req.createdAt),
    req.applicantName,
    req.department,
    req.concept,
    req.status === 'LEGALIZADA' ? 'Legalizada' :
      req.status === 'APROBADA_ENTREGADA' ? 'En Legalización' :
      req.status === 'PENDIENTE' ? 'Pendiente' : 'Rechazada',
    formatCOP(req.requestedAmount),
    req.deliveryInfo ? formatCOP(req.deliveryInfo.deliveredAmount) : '-',
    req.legalizationInfo ? formatCOP(req.legalizationInfo.actualSpentAmount) : '-',
    req.legalizationInfo ? formatCOP(req.legalizationInfo.returnedAmount) : '-',
    req.legalizationInfo?.invoiceNumber || '-',
    req.legalizationInfo?.supplierName || req.justification.slice(0, 25)
  ]);

  // Invocar autoTable
  autoTable(doc, {
    startY: startY + cardHeight + 6,
    head: [[
      'Código',
      'Fecha',
      'Solicitante',
      'Área',
      'Concepto',
      'Estado',
      'Solicitado',
      'Entregado',
      'Gasto Real',
      'Devuelto',
      'Factura',
      'Proveedor / Detalle'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 32 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 18, halign: 'right' },
      10: { cellWidth: 20 },
      11: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    foot: [[
      'TOTALES',
      '',
      '',
      '',
      '',
      `${requests.length} reg.`,
      formatCOP(requests.reduce((s, r) => s + r.requestedAmount, 0)),
      formatCOP(requests.reduce((s, r) => s + (r.deliveryInfo?.deliveredAmount || 0), 0)),
      formatCOP(requests.reduce((s, r) => s + (r.legalizationInfo?.actualSpentAmount || 0), 0)),
      formatCOP(requests.reduce((s, r) => s + (r.legalizationInfo?.returnedAmount || 0), 0)),
      '',
      ''
    ]],
    footStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'right'
    }
  });

  // Pie de página con espacio para firmas
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento oficial de control de caja menor. Generado por la Plataforma CajaControl.', 14, pageHeight - 8);
  doc.text(`Página 1`, 283, pageHeight - 8, { align: 'right' });

  // Descarga del PDF
  const sanitizedTitle = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`${sanitizedTitle}_${period.name.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Genera el Comprobante de Entrega / Desembolso de Dinero (Recibo de Caja Menor)
 */
export function exportVoucherPDF(request: PettyCashRequest, availableBalance: number) {
  const doc = new jsPDF('portrait', 'mm', 'a5'); // Formato A5 vertical ideal para recibos

  // Marco decorativo
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 132, 194);

  // Cabecera
  doc.setFillColor(15, 23, 42);
  doc.rect(8, 8, 132, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPROBANTE DE ENTREGA DE CAJA MENOR', 74, 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`CÓDIGO: ${request.code} | VALE N°: ${request.deliveryInfo?.voucherNumber || 'EG-001'}`, 74, 24, { align: 'center' });

  // Cuerpo
  doc.setTextColor(30, 41, 59);
  let y = 38;

  const addField = (label: string, value: string, isHighlight: boolean = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(label, 14, y);

    doc.setFont('helvetica', isHighlight ? 'bold' : 'normal');
    doc.setFontSize(isHighlight ? 10 : 8.5);
    if (isHighlight) doc.setTextColor(13, 148, 136); // teal
    else doc.setTextColor(51, 65, 85);

    doc.text(value, 60, y);
    doc.setTextColor(30, 41, 59);

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 2, 134, y + 2);
    y += 8;
  };

  addField('Fecha y Hora:', formatDateTime(request.deliveryInfo?.deliveredAt || request.createdAt));
  addField('Solicitante:', request.applicantName);
  addField('Área / Departamento:', request.department);
  addField('Concepto del Gasto:', request.concept);
  addField('Justificación:', request.justification.length > 35 ? request.justification.slice(0, 35) + '...' : request.justification);
  addField('Valor Entregado:', formatCOP(request.deliveryInfo?.deliveredAmount || request.requestedAmount, true), true);
  addField('Recibido por (Nombre):', request.deliveryInfo?.receivedByName || request.applicantName);
  addField('Entregado por (Cajero):', request.deliveryInfo?.registeredBy || 'Encargado de Caja Menor');
  addField('Saldo Caja Posterior:', formatCOP(availableBalance, true));

  // Nota de compromiso
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 120, 22, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'El beneficiario se compromete a legalizar este dinero en la tarde del mismo día hábil,\n' +
    'entregando la factura legal correspondiente con NIT y el dinero sobrante a devolver.\n' +
    'Fórmula: Dinero Entregado - Gasto Real = Dinero Devuelto.',
    16,
    y + 5
  );

  // Espacios para firmas
  y += 38;
  doc.setDrawColor(100, 116, 139);
  doc.line(16, y, 62, y);
  doc.line(82, y, 128, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ENTREGADO POR', 39, y + 4, { align: 'center' });
  doc.text('RECIBIDO POR', 105, y + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Encargado Caja Menor', 39, y + 8, { align: 'center' });
  doc.text('C.C. ___________________', 105, y + 8, { align: 'center' });

  doc.save(`Recibo_Entrega_${request.code}.pdf`);
}

/**
 * Genera el Acta Oficial de Cierre Mensual de Caja Menor
 */
export function exportClosingActPDF(
  period: CajaPeriod,
  metrics: CajaFinancialMetrics,
  closedByName: string,
  closingNotes: string
) {
  const doc = new jsPDF('portrait', 'mm', 'a4');

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('ACTA DE CIERRE MENSUAL DE CAJA MENOR', 105, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`FONDO REGULATORIO: $2.000.000 COP | PERÍODO: ${period.name.toUpperCase()}`, 105, 19, { align: 'center' });

  let y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('1. INFORMACIÓN GENERAL DEL CIERRE', 14, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fecha y Hora de Cierre: ${formatDateTime(new Date().toISOString())}`, 14, y);
  y += 6;
  doc.text(`Responsable del Cierre: ${closedByName}`, 14, y);
  y += 6;
  doc.text(`Estado del Período: CERRADO Y LIQUIDADO`, 14, y);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. LIQUIDACIÓN FINANCIERA DEL PERÍODO', 14, y);

  const finRows = [
    ['Fondo Inicial Asignado', formatCOP(period.initialFund, true)],
    ['Total Dinero Entregado en Anticipos', formatCOP(metrics.totalDelivered, true)],
    ['Total Gastos Legalizados con Factura', formatCOP(metrics.totalSpent, true)],
    ['Total Devoluciones de Efectivo Recibidas', formatCOP(metrics.totalReturned, true)],
    ['Saldo Remanente en Efectivo al Cierre', formatCOP(metrics.availableCashBalance, true)],
    ['Porcentaje de Ejecución Presupuestal', `${metrics.budgetExecutionPercentage.toFixed(2)}%`]
  ];

  autoTable(doc, {
    startY: y + 4,
    head: [['CONCEPTO FINANCIERO', 'VALOR CONSOLIDADO']],
    body: finRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalTableY = (doc as any).lastAutoTable.finalY + 10;
  y = finalTableY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('3. OBSERVACIONES Y CERTIFICACIÓN CONTABLE', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const notesText = closingNotes || 'Se verificaron todas las facturas y soportes físicos, confirmando que no existen anticipos pendientes por legalizar. El saldo remanente ha sido conciliado satisfactoriamente con el arqueo físico de efectivo.';
  doc.text(doc.splitTextToSize(notesText, 180), 14, y);

  y += 35;
  // Firmas
  doc.setDrawColor(100, 116, 139);
  doc.line(20, y, 80, y);
  doc.line(130, y, 190, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('RESPONSABLE DE CAJA MENOR', 50, y + 5, { align: 'center' });
  doc.text('ADMINISTRACIÓN / GERENCIA', 160, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(closedByName, 50, y + 10, { align: 'center' });
  doc.text('Aprobación y Visto Bueno', 160, y + 10, { align: 'center' });

  doc.save(`Acta_Cierre_Caja_Menor_${period.name.replace(/\s+/g, '_')}.pdf`);
}
