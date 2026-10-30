import React, { useState } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  FileCheck, 
  Eye, 
  RotateCcw, 
  DollarSign, 
  FileText,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { PettyCashRequest } from '../../types';
import { formatCOP, formatDateTime, formatDate } from '../../utils/formatters';

export const LegalizacionesView: React.FC = () => {
  const { requests, currentPeriod, metrics, submitLegalization, verifyLegalization, currentUser } = useCajaMenor();

  const [legalizingRequest, setLegalizingRequest] = useState<PettyCashRequest | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ title: string; url: string } | null>(null);

  // Formulario de Legalización
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierNit, setSupplierNit] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [actualSpentAmount, setActualSpentAmount] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Anticipos entregados que están pendientes de legalización (En la calle)
  const pendingLegalization = requests.filter(
    r => r.periodId === currentPeriod.id && r.status === 'APROBADA_ENTREGADA'
  );

  // Solicitudes legalizadas y cerradas
  const legalizedRequests = requests.filter(
    r => r.periodId === currentPeriod.id && r.status === 'LEGALIZADA'
  );

  const openLegalizeModal = (req: PettyCashRequest) => {
    setLegalizingRequest(req);
    const delivered = req.deliveryInfo?.deliveredAmount || req.requestedAmount;
    setInvoiceNumber('');
    setSupplierName('');
    setSupplierNit('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setActualSpentAmount('');
    setObservations('');
    setAttachmentName('');
    setAttachmentDataUrl('');
    setFeedback(null);
  };

  // Manejo de archivo real
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cargar comprobante de ejemplo rápido
  const loadQuickSampleInvoice = () => {
    const delivered = legalizingRequest?.deliveryInfo?.deliveredAmount || 100000;
    // Si entregado es 100k, usamos exactamente el ejemplo del enunciado: Gasto 75k, Devolución 25k!
    const sampleSpent = delivered >= 100000 ? delivered - 25000 : Math.round(delivered * 0.85);

    setInvoiceNumber(`FE-${Math.floor(10000 + Math.random() * 90000)}`);
    setSupplierName('Suministros y Servicios del Norte S.A.S.');
    setSupplierNit('901.328.765-4');
    setActualSpentAmount(sampleSpent);
    setObservations('Factura electrónica validada con código CUFE de la DIAN. Se entrega dinero sobrante.');
    
    // SVG de muestra
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
      <rect x="20" y="20" width="360" height="50" fill="#0f172a" rx="4"/>
      <text x="200" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">FACTURA LEGAL ELECTRÓNICA</text>
      <text x="30" y="110" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Suministros y Servicios del Norte S.A.S.</text>
      <text x="30" y="130" font-family="sans-serif" font-size="10" fill="#64748b">NIT: 901.328.765-4 | IVA Régimen Común</text>
      <line x1="30" y1="150" x2="370" y2="150" stroke="#cbd5e1" stroke-dasharray="4"/>
      <text x="30" y="180" font-family="sans-serif" font-size="11" fill="#475569">Total Facturado:</text>
      <text x="370" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="end">${formatCOP(sampleSpent)}</text>
      <rect x="30" y="220" width="340" height="60" fill="#ecfdf5" rx="4" stroke="#a7f3d0"/>
      <text x="200" y="255" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">SOPORTE VÁLIDO PARA LEGALIZACIÓN</text>
    </svg>`;
    setAttachmentName('Factura_Suministros_Norte.pdf');
    setAttachmentDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`);
  };

  const handleSubmitLegalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalizingRequest) return;

    const spent = Number(actualSpentAmount);
    if (isNaN(spent) || spent <= 0) {
      setFeedback({ type: 'error', message: 'Ingrese un valor de gasto válido mayor a cero.' });
      return;
    }

    const delivered = legalizingRequest.deliveryInfo?.deliveredAmount || legalizingRequest.requestedAmount;
    if (spent > delivered) {
      setFeedback({ 
        type: 'error', 
        message: `El gasto real ($${spent.toLocaleString()}) no puede superar el dinero entregado ($${delivered.toLocaleString()}) en este flujo. Si requirió más dinero, solicite un anticipo adicional.` 
      });
      return;
    }

    if (!invoiceNumber.trim() || !supplierName.trim()) {
      setFeedback({ type: 'error', message: 'Debe ingresar el número de factura y el nombre del proveedor.' });
      return;
    }

    const result = submitLegalization({
      requestId: legalizingRequest.id,
      invoiceNumber: invoiceNumber.trim(),
      supplierName: supplierName.trim(),
      supplierNit: supplierNit.trim() || undefined,
      invoiceDate,
      actualSpentAmount: spent,
      observations: observations.trim() || undefined,
      attachmentName: attachmentName || 'Factura_Soporte.pdf',
      attachmentDataUrl: attachmentDataUrl || undefined,
      autoVerify: currentUser.role !== 'SOLICITANTE' // Si lo registra el responsable o admin, se valida y cierra directamente
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setLegalizingRequest(null);
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  // Cálculo en vivo de la devolución
  const currentDelivered = legalizingRequest?.deliveryInfo?.deliveredAmount || 0;
  const currentSpent = Number(actualSpentAmount) || 0;
  const currentReturn = Math.max(0, currentDelivered - currentSpent);

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
            Paso 4 y 5 del Proceso
          </span>
          <span className="text-xs text-slate-500 font-medium">Jornada de la Tarde: Facturas, Verificación y Devolución</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Legalización de Gastos y Devoluciones de Dinero
        </h1>
        <p className="text-xs text-slate-600">
          Al finalizar la jornada, los trabajadores entregan sus facturas con NIT, registran el valor utilizado y devuelven el dinero sobrante.
        </p>
      </div>

      {/* Regla Institucional Destacada */}
      <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-800/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block">
              Fórmula Automática de Caja Menor
            </span>
            <p className="text-sm font-extrabold">
              Dinero Entregado - Gasto Real Realizado = Dinero Devuelto a Caja
            </p>
          </div>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300 font-mono">
          Ejemplo: $100.000 - $75.000 = $25.000 COP
        </div>
      </div>

      {/* Lista de Anticipos Pendientes de Legalización (Tarde) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-bold text-sm sm:text-base">
              Anticipos Entregados en la Mañana por Legalizar ({pendingLegalization.length})
            </h2>
          </div>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            Total en la Calle: <strong className="text-amber-400 font-mono-numbers">{formatCOP(metrics.pendingLegalizationAmount)}</strong>
          </span>
        </div>

        {pendingLegalization.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            ¡Excelente! Todos los anticipos entregados han sido debidamente legalizados con factura y devolución.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingLegalization.map(req => {
              const delivered = req.deliveryInfo?.deliveredAmount || req.requestedAmount;
              const hasDraftLegalization = req.legalizationInfo && !req.legalizationInfo.isVerified;

              return (
                <div key={req.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 font-mono text-xs font-black bg-blue-100 text-blue-900 rounded-md">
                        {req.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{req.applicantName}</span>
                      <span className="text-[11px] text-slate-500">• {req.department}</span>
                      <span className="text-[11px] text-slate-400">• Entregado: {formatDateTime(req.deliveryInfo?.deliveredAt)}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">
                      {req.concept}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{req.justification}"
                    </p>

                    {hasDraftLegalization && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ Factura {req.legalizationInfo?.invoiceNumber} registrada por ${req.legalizationInfo?.actualSpentAmount}. Esperando verificación del responsable.
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full md:w-auto gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Dinero Entregado</span>
                      <span className="text-base font-black text-blue-900 font-mono-numbers">
                        {formatCOP(delivered, true)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasDraftLegalization && currentUser.role !== 'SOLICITANTE' ? (
                        <button
                          onClick={() => verifyLegalization(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Verificar y Cerrar
                        </button>
                      ) : (
                        <button
                          onClick={() => openLegalizeModal(req)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all"
                        >
                          <Receipt className="w-4 h-4" />
                          Legalizar Gasto
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de Gastos Legalizados y Devoluciones Verificadas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Historial de Facturas y Devoluciones Legalizadas</h2>
            <p className="text-xs text-slate-500">Gastos soportados con comprobantes de venta y dineros devueltos</p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block">Total Gastos Legalizados:</span>
            <strong className="text-rose-700 font-mono-numbers">{formatCOP(metrics.totalSpent)}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Factura / Soporte</th>
                <th className="px-4 py-3">Proveedor / NIT</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3 text-right">Entregado</th>
                <th className="px-4 py-3 text-right">Gasto Real</th>
                <th className="px-4 py-3 text-right">Devolución</th>
                <th className="px-4 py-3 text-center">Verificado Por</th>
                <th className="px-4 py-3 text-center">Soporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {legalizedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aún no se han legalizado gastos en este período.
                  </td>
                </tr>
              ) : (
                legalizedRequests.map(req => {
                  const leg = req.legalizationInfo;
                  const delivered = req.deliveryInfo?.deliveredAmount || 0;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {req.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{leg?.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(leg?.invoiceDate)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{leg?.supplierName}</div>
                        <div className="text-[10px] text-slate-500">NIT: {leg?.supplierNit || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{req.applicantName}</div>
                        <div className="text-[10px] text-slate-500">{req.department}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-numbers font-medium text-slate-700">
                        {formatCOP(delivered)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-numbers font-bold text-rose-700">
                        {formatCOP(leg?.actualSpentAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-numbers font-bold text-emerald-700">
                        + {formatCOP(leg?.returnedAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {leg?.verifiedBy || 'Verificado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {leg?.attachmentDataUrl ? (
                          <button
                            onClick={() => setViewingAttachment({
                              title: `Factura ${leg.invoiceNumber} - ${leg.supplierName}`,
                              url: leg.attachmentDataUrl!
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Soporte
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sin archivo</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totales consolidados de legalizaciones */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-slate-600">
            Total Devoluciones Reintegradas al Efectivo de Caja:{' '}
            <strong className="text-emerald-700 font-mono-numbers">
              + {formatCOP(metrics.totalReturned)}
            </strong>
          </span>
          <span className="text-slate-600">
            Total Gastos Verificados:{' '}
            <strong className="text-rose-700 font-mono-numbers">
              {formatCOP(metrics.totalSpent)}
            </strong>
          </span>
        </div>
      </div>

      {/* Modal para Registrar Legalización de Gastos */}
      {legalizingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">PASO 4: Legalización de Gastos y Factura</h3>
                  <p className="text-xs text-slate-300">
                    Solicitud {legalizingRequest.code} | Beneficiario: {legalizingRequest.applicantName}
                  </p>
                </div>
              </div>
              <button onClick={() => setLegalizingRequest(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitLegalize} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {feedback && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Botón para precargar datos de muestra */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={loadQuickSampleInvoice}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                >
                  ⚡ Cargar Factura y Valores de Ejemplo
                </button>
              </div>

              {/* Caja de Cálculo Dinámico Automático (Requerimiento Paso 5) */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Cálculo Automático Institucional
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">Dinero Entregado</span>
                    <strong className="text-sm font-extrabold text-blue-900 font-mono-numbers">
                      {formatCOP(currentDelivered)}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">Gasto Realizado</span>
                    <strong className="text-sm font-extrabold text-rose-700 font-mono-numbers">
                      {currentSpent > 0 ? formatCOP(currentSpent) : '$ 0'}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-2xs">
                    <span className="text-[10px] font-bold block opacity-80">Dinero Devuelto</span>
                    <strong className="text-sm font-black font-mono-numbers">
                      {formatCOP(currentReturn)}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 text-center">
                  Fórmula: {formatCOP(currentDelivered)} - {formatCOP(currentSpent)} = <strong className="text-emerald-800">{formatCOP(currentReturn)} COP</strong> a reintegrar a caja física.
                </p>
              </div>

              {/* Campos de Factura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Número de Factura o Comprobante *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Ej. FAC-89210 o Tiquete POS 102"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha de la Factura *
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proveedor o Establecimiento *
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Ej. Papelería Panamericana S.A."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIT / Identificación Tributaria
                  </label>
                  <input
                    type="text"
                    value={supplierNit}
                    onChange={(e) => setSupplierNit(e.target.value)}
                    placeholder="Ej. 860.003.456-2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Valor Realmente Utilizado */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Valor Realmente Utilizado (Gasto Soportado) *</span>
                  <span className="text-slate-500 font-normal">Máximo: {formatCOP(currentDelivered)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max={currentDelivered}
                    value={actualSpentAmount}
                    onChange={(e) => setActualSpentAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder={`Ej. ${currentDelivered >= 100000 ? '75000' : currentDelivered}`}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Adjunto de Factura (Imagen o PDF) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fotografía o Archivo PDF de la Factura
                </label>
                <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <p className="text-slate-600 font-medium">
                    {attachmentName ? (
                      <span className="text-emerald-700 font-bold">✓ Archivo: {attachmentName}</span>
                    ) : (
                      'Arrastre o seleccione la fotografía o documento PDF'
                    )}
                  </p>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observaciones adicionales
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Comentarios sobre el producto, cambio de proveedor, estado del dinero..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLegalizingRequest(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar y Cerrar Legalización
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal para Ver Soporte Adjunto */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm truncate">{viewingAttachment.title}</span>
              <button onClick={() => setViewingAttachment(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 flex items-center justify-center bg-slate-100 overflow-auto">
              <img
                src={viewingAttachment.url}
                alt={viewingAttachment.title}
                className="max-h-[60vh] max-w-full rounded-xl shadow-md border border-slate-200 object-contain"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingAttachment(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
