import * as XLSX from 'xlsx';
import { PettyCashRequest, CajaFinancialMetrics, CajaPeriod } from '../types';
import { formatCOP, formatDateTime } from './formatters';

export function exportRequestsToExcel(
  requests: PettyCashRequest[],
  period: CajaPeriod,
  metrics: CajaFinancialMetrics,
  filename: string = 'Informe_Caja_Menor'
) {
  // Hoja 1: Resumen General
  const resumenData = [
    ['PLATAFORMA DE GESTIÓN Y CONTROL DE CAJA MENOR', ''],
    ['INFORME CONSOLIDADO DE MOVIMIENTOS', ''],
    ['Período:', period.name],
    ['Estado del Período:', period.status],
    ['Fecha de Generación:', formatDateTime(new Date().toISOString())],
    ['Moneda:', 'Pesos Colombianos (COP)'],
    ['', ''],
    ['MÉTRICA FINANCIERA', 'VALOR (COP)'],
    ['Fondo Inicial Asignado', formatCOP(metrics.initialFund)],
    ['Total Dinero Entregado', formatCOP(metrics.totalDelivered)],
    ['Total Gastos Legalizados', formatCOP(metrics.totalSpent)],
    ['Total Devoluciones Recibidas', formatCOP(metrics.totalReturned)],
    ['Anticipos Pendientes de Legalizar', formatCOP(metrics.pendingLegalizationAmount)],
    ['Saldo Disponible en Caja Física', formatCOP(metrics.availableCashBalance)],
    ['Porcentaje de Ejecución del Fondo', `${metrics.budgetExecutionPercentage.toFixed(1)}%`],
    ['', ''],
    ['Total Solicitudes Registradas', metrics.totalRequestsCount],
    ['Solicitudes Pendientes', metrics.pendingRequestsCount],
    ['Anticipos en Calle (Entregados)', metrics.deliveredPendingCount],
    ['Solicitudes Legalizadas', metrics.legalizedCount],
    ['Solicitudes Rechazadas', metrics.rejectedCount],
  ];

  // Hoja 2: Detalle de Movimientos
  const detalleHeaders = [
    'Código',
    'Fecha Solicitud',
    'Solicitante',
    'Departamento',
    'Concepto',
    'Justificación',
    'Valor Solicitado',
    'Estado',
    'Valor Entregado',
    'Fecha Entrega',
    'Recibido Por',
    'Factura N°',
    'Proveedor',
    'Gasto Realizado',
    'Dinero Devuelto',
    'Fecha Legalización',
    'Verificado Por',
    'Observaciones'
  ];

  const detalleRows = requests.map(req => [
    req.code,
    formatDateTime(req.createdAt),
    req.applicantName,
    req.department,
    req.concept + (req.customConcept ? ` (${req.customConcept})` : ''),
    req.justification,
    req.requestedAmount,
    req.status,
    req.deliveryInfo?.deliveredAmount || 0,
    req.deliveryInfo ? formatDateTime(req.deliveryInfo.deliveredAt) : '',
    req.deliveryInfo?.receivedByName || '',
    req.legalizationInfo?.invoiceNumber || '',
    req.legalizationInfo?.supplierName || '',
    req.legalizationInfo?.actualSpentAmount || 0,
    req.legalizationInfo?.returnedAmount || 0,
    req.legalizationInfo ? formatDateTime(req.legalizationInfo.legalizedAt) : '',
    req.legalizationInfo?.verifiedBy || '',
    req.legalizationInfo?.observations || req.rejectionReason || ''
  ]);

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  const wsDetalle = XLSX.utils.aoa_to_sheet([detalleHeaders, ...detalleRows]);

  // Anchos de columna automáticos
  wsDetalle['!cols'] = [
    { wch: 14 }, // Código
    { wch: 20 }, // Fecha
    { wch: 22 }, // Solicitante
    { wch: 18 }, // Depto
    { wch: 24 }, // Concepto
    { wch: 30 }, // Justificación
    { wch: 16 }, // Solicitado
    { wch: 18 }, // Estado
    { wch: 16 }, // Entregado
    { wch: 20 }, // Fecha Ent
    { wch: 20 }, // Recibido por
    { wch: 16 }, // Factura N°
    { wch: 22 }, // Proveedor
    { wch: 16 }, // Gasto
    { wch: 16 }, // Devuelto
    { wch: 20 }, // Fecha Leg
    { wch: 20 }, // Verificado
    { wch: 30 }, // Obs
  ];

  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Financiero');
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Movimientos Detallados');

  // Descarga del archivo
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${period.name.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
}
