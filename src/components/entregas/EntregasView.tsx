import React, { useState } from 'react';
import { 
  HandCoins, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Printer, 
  User, 
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { PettyCashRequest } from '../../types';
import { formatCOP, formatDateTime } from '../../utils/formatters';
import { exportVoucherPDF } from '../../utils/pdfExport';

export const EntregasView: React.FC = () => {
  const { requests, currentPeriod, metrics, approveAndDeliver, rejectRequest, currentUser } = useCajaMenor();

  const [deliveringRequest, setDeliveringRequest] = useState<PettyCashRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<PettyCashRequest | null>(null);

  // Estados del formulario de entrega
  const [deliveredAmount, setDeliveredAmount] = useState<number | ''>('');
  const [receivedByName, setReceivedByName] = useState('');
  const [conceptConfirmed, setConceptConfirmed] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Solicitudes pendientes de entrega
  const pendingRequests = requests.filter(
    r => r.periodId === currentPeriod.id && r.status === 'PENDIENTE'
  );

  // Solicitudes entregadas recientemente en este período
  const deliveredRequests = requests.filter(
    r => r.periodId === currentPeriod.id && (r.status === 'APROBADA_ENTREGADA' || r.status === 'LEGALIZADA')
  );

  const openDeliverModal = (req: PettyCashRequest) => {
    setDeliveringRequest(req);
    setDeliveredAmount(req.requestedAmount);
    setReceivedByName(req.applicantName);
    setConceptConfirmed(req.concept);
    setFeedback(null);
  };

  const handleConfirmDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringRequest) return;

    const amountNum = Number(deliveredAmount);
    if (!amountNum || amountNum <= 0) {
      setFeedback({ type: 'error', message: 'El valor entregado debe ser mayor a cero pesos.' });
      return;
    }

    if (amountNum > metrics.availableCashBalance) {
      setFeedback({ type: 'error', message: `El valor a entregar supera el saldo disponible (${formatCOP(metrics.availableCashBalance)}).` });
      return;
    }

    const result = approveAndDeliver({
      requestId: deliveringRequest.id,
      deliveredAmount: amountNum,
      receivedByName: receivedByName.trim() || deliveringRequest.applicantName,
      conceptConfirmed: conceptConfirmed.trim() || deliveringRequest.concept
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setDeliveringRequest(null);
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 8) {
      setFeedback({ type: 'error', message: 'Debe ingresar un motivo de rechazo claro (mínimo 8 caracteres).' });
      return;
    }

    const result = rejectRequest(rejectingRequest.id, rejectionReason.trim());
    if (result.success) {
      setRejectingRequest(null);
      setRejectionReason('');
    }
  };

  const handlePrintVoucher = (req: PettyCashRequest) => {
    exportVoucherPDF(req, metrics.availableCashBalance);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
            Paso 3 del Proceso
          </span>
          <span className="text-xs text-slate-500 font-medium">Revisión, Aprobación y Desembolso de Efectivo</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Aprobación y Entrega del Dinero
        </h1>
        <p className="text-xs text-slate-600">
          El encargado de caja menor examina los requerimientos matutinos, entrega el efectivo y actualiza el saldo disponible.
        </p>
      </div>

      {/* Tarjeta de Solicitudes Pendientes por Atender */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-bold text-sm sm:text-base">
              Solicitudes Pendientes de Autorización ({pendingRequests.length})
            </h2>
          </div>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
            Saldo Disponible: <strong className="text-emerald-400 font-mono-numbers">{formatCOP(metrics.availableCashBalance)}</strong>
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            No hay solicitudes pendientes en este momento. Todas han sido procesadas.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 font-mono text-xs font-black bg-slate-100 text-slate-900 rounded-md">
                      {req.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.applicantName}</span>
                    <span className="text-[11px] text-slate-500">• {req.department}</span>
                    <span className="text-[11px] text-slate-400">• Radicado: {formatDateTime(req.createdAt)}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    {req.concept} {req.customConcept && `(${req.customConcept})`}
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{req.justification}"
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between w-full md:w-auto gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Solicitado</span>
                    <span className="text-base font-black text-slate-900 font-mono-numbers">
                      {formatCOP(req.requestedAmount, true)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRejectingRequest(req);
                        setRejectionReason('');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => openDeliverModal(req)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all"
                    >
                      <HandCoins className="w-4 h-4" />
                      Aprobar y Entregar
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Entregas Efectuadas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Historial de Entregas y Comprobantes de Egreso</h2>
            <p className="text-xs text-slate-500">Anticipos desembolsados en el período actual</p>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            Total Entregado: <strong className="text-slate-900 font-mono-numbers">{formatCOP(metrics.totalDelivered)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Vale N°</th>
                <th className="px-4 py-3">Código Solicitud</th>
                <th className="px-4 py-3">Fecha Entrega</th>
                <th className="px-4 py-3">Recibido Por</th>
                <th className="px-4 py-3">Concepto Confirmado</th>
                <th className="px-4 py-3 text-right">Valor Entregado</th>
                <th className="px-4 py-3 text-right">Saldo Posterior</th>
                <th className="px-4 py-3 text-center">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deliveredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aún no se han realizado entregas de efectivo en este período.
                  </td>
                </tr>
              ) : (
                deliveredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {req.deliveryInfo?.voucherNumber || 'EG-0000'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {req.code}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {req.deliveryInfo ? formatDateTime(req.deliveryInfo.deliveredAt) : '-'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {req.deliveryInfo?.receivedByName || req.applicantName}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={req.deliveryInfo?.conceptConfirmed || req.concept}>
                      {req.deliveryInfo?.conceptConfirmed || req.concept}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-black text-slate-900">
                      {formatCOP(req.deliveryInfo?.deliveredAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers text-slate-600">
                      {formatCOP(req.deliveryInfo?.balanceAfterDelivery)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePrintVoucher(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                        title="Descargar Comprobante de Entrega en PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        Recibo PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Aprobar y Entregar Dinero */}
      {deliveringRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Registrar Entrega de Dinero</h3>
                  <p className="text-xs text-slate-300">Solicitud: {deliveringRequest.code}</p>
                </div>
              </div>
              <button onClick={() => setDeliveringRequest(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmDeliver} className="p-6 space-y-4 text-xs">
              
              {feedback && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Resumen de la Solicitud */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Solicitante:</span>
                  <strong className="text-slate-900">{deliveringRequest.applicantName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Departamento:</span>
                  <strong>{deliveringRequest.department}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Concepto:</span>
                  <strong>{deliveringRequest.concept}</strong>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Valor Solicitado Original:</span>
                  <span className="font-mono-numbers text-sm">{formatCOP(deliveringRequest.requestedAmount)}</span>
                </div>
              </div>

              {/* Valor Real a Entregar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Valor a Entregar en Efectivo (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1000"
                    max={metrics.availableCashBalance}
                    value={deliveredAmount}
                    onChange={(e) => setDeliveredAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                {deliveredAmount && (
                  <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                    Nuevo Saldo de Caja después de entrega: {formatCOP(metrics.availableCashBalance - Number(deliveredAmount), true)}
                  </p>
                )}
              </div>

              {/* Recibido por */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de Quien Recibe el Efectivo *
                </label>
                <input
                  type="text"
                  value={receivedByName}
                  onChange={(e) => setReceivedByName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Concepto confirmado */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Concepto del Gasto Confirmado
                </label>
                <input
                  type="text"
                  value={conceptConfirmed}
                  onChange={(e) => setConceptConfirmed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveringRequest(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <HandCoins className="w-4 h-4" />
                  Confirmar Desembolso
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal para Rechazar Solicitud */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">Rechazar Solicitud: {rejectingRequest.code}</h3>
              </div>
              <button onClick={() => setRejectingRequest(null)} className="text-rose-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Por favor indique la justificación legal o administrativa por la cual se rechaza el desembolso a <strong>{rejectingRequest.applicantName}</strong>.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo de Rechazo *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej. El gasto excede el límite permitido, debe tramitarse por compras..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
