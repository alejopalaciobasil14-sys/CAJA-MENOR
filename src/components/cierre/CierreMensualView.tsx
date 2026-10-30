import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  FileDown, 
  Clock, 
  DollarSign, 
  Archive,
  RefreshCw
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { formatCOP, formatDateTime, formatDate } from '../../utils/formatters';
import { exportClosingActPDF } from '../../utils/pdfExport';

export const CierreMensualView: React.FC = () => {
  const { currentPeriod, closedPeriods, requests, metrics, closePeriod, openNewPeriod, currentUser } = useCajaMenor();

  const [closingNotes, setClosingNotes] = useState('');
  const [newPeriodName, setNewPeriodName] = useState('Noviembre 2026');
  const [newPeriodFund, setNewPeriodFund] = useState<number>(2000000);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isOpenNewModalOpen, setIsOpenNewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Verificaciones de cierre
  const pendingRequestsCount = metrics.pendingRequestsCount;
  const advancesInStreetCount = metrics.deliveredPendingCount;
  const canClose = pendingRequestsCount === 0 && advancesInStreetCount === 0 && currentPeriod.status === 'ABIERTO';

  const handleDownloadClosingAct = () => {
    exportClosingActPDF(currentPeriod, metrics, currentUser.name, closingNotes);
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    const result = closePeriod(closingNotes);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setIsClosingModalOpen(false);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleConfirmOpenNew = (e: React.FormEvent) => {
    e.preventDefault();
    const result = openNewPeriod(newPeriodName, newPeriodFund);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setIsOpenNewModalOpen(false);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
            Paso 7 del Proceso
          </span>
          <span className="text-xs text-slate-500 font-medium">Finalización del Ciclo Mensual y Reinicio del Fondo</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Cierre Mensual y Apertura de Caja Menor
        </h1>
        <p className="text-xs text-slate-600">
          Verifique que todos los anticipos estén legalizados, concilie los saldos, descargue el acta oficial y proceda con la apertura del siguiente mes.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Estado del Período Actual */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentPeriod.status === 'ABIERTO' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Estado: {currentPeriod.status === 'ABIERTO' ? 'Período en Operación' : 'Período Cerrado y Liquidado'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">
              Período Activo: {currentPeriod.name}
            </h2>
            <p className="text-xs text-slate-300">
              Apertura: {formatDateTime(currentPeriod.startDate)} por {currentPeriod.openedBy}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadClosingAct}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all shadow-xs"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              Descargar Acta de Cierre (PDF)
            </button>

            {currentPeriod.status === 'ABIERTO' ? (
              <button
                onClick={() => setIsClosingModalOpen(true)}
                disabled={!canClose}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-xs ${
                  canClose
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={canClose ? 'Efectuar cierre formal del mes' : 'Debe resolver todas las solicitudes y legalizaciones pendientes antes de cerrar'}
              >
                <Lock className="w-4 h-4" />
                Efectuar Cierre Mensual
              </button>
            ) : (
              <button
                onClick={() => setIsOpenNewModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                Apertura de Nuevo Período ($2M)
              </button>
            )}
          </div>
        </div>

        {/* Lista de Chequeo Obligatoria para Cierre */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
            Lista de Verificación Requerida para el Cierre
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Check 1: Solicitudes pendientes */}
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              pendingRequestsCount === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {pendingRequestsCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-bold">Solicitudes Matutinas</p>
                <p className="text-[11px] opacity-80">
                  {pendingRequestsCount === 0 ? '0 pendientes por autorizar' : `${pendingRequestsCount} solicitud(es) sin resolver`}
                </p>
              </div>
            </div>

            {/* Check 2: Anticipos en la calle */}
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              advancesInStreetCount === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {advancesInStreetCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="font-bold">Anticipos de la Tarde</p>
                <p className="text-[11px] opacity-80">
                  {advancesInStreetCount === 0 ? '0 anticipos sin legalizar' : `${advancesInStreetCount} anticipos en la calle sin factura`}
                </p>
              </div>
            </div>

            {/* Check 3: Conciliación financiera */}
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Saldo Conciliado</p>
                <p className="text-[11px] opacity-80">
                  Efectivo disponible: {formatCOP(metrics.availableCashBalance)}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Resumen Financiero del Período */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fondo Inicial:</span>
            <strong className="text-slate-900 font-extrabold text-sm font-mono-numbers">
              {formatCOP(currentPeriod.initialFund)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Entregado:</span>
            <strong className="text-amber-800 font-extrabold text-sm font-mono-numbers">
              {formatCOP(metrics.totalDelivered)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Gastos Legalizados:</span>
            <strong className="text-rose-700 font-extrabold text-sm font-mono-numbers">
              {formatCOP(metrics.totalSpent)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Devoluciones Recibidas:</span>
            <strong className="text-emerald-700 font-extrabold text-sm font-mono-numbers">
              + {formatCOP(metrics.totalReturned)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Remanente en Caja:</span>
            <strong className="text-blue-900 font-extrabold text-sm font-mono-numbers">
              {formatCOP(metrics.availableCashBalance)}
            </strong>
          </div>
        </div>
      </div>

      {/* Historial de Períodos Cerrados Anteriores */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">Histórico de Períodos Mensuales Anteriores</h2>
          </div>
          <span className="text-xs text-slate-500">{closedPeriods.length} períodos archivados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Nombre del Período</th>
                <th className="px-4 py-3">Fecha Inicio</th>
                <th className="px-4 py-3">Fecha Cierre</th>
                <th className="px-4 py-3">Cerrado Por</th>
                <th className="px-4 py-3 text-right">Fondo Asignado</th>
                <th className="px-4 py-3 text-right">Gastos Ejecutados</th>
                <th className="px-4 py-3 text-right">Remanente</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {closedPeriods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aún no se han completado cierres de períodos anteriores en esta base de datos.
                  </td>
                </tr>
              ) : (
                closedPeriods.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.startDate)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.endDate)}</td>
                    <td className="px-4 py-3">{p.closedBy || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-mono-numbers">{formatCOP(p.initialFund)}</td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-bold text-rose-700">{formatCOP(p.totalSpent)}</td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-bold text-emerald-700">{formatCOP(p.finalBalance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Liquidado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Efectuar Cierre Mensual */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Confirmar Cierre Mensual</h3>
              </div>
              <button onClick={() => setIsClosingModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmClose} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Al efectuar el cierre mensual del período <strong>{currentPeriod.name}</strong>, se congelará el registro de gastos y se generará el acta contable final.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observaciones o Anotaciones de Cierre Contable
                </label>
                <textarea
                  rows={3}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Se revisaron todas las facturas y soportes físicos con arqueo de caja conforme..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Confirmar y Cerrar Período
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Apertura de Nuevo Período */}
      {isOpenNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Apertura de Nuevo Período Mensual</h3>
              </div>
              <button onClick={() => setIsOpenNewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmOpenNew} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Inicie un nuevo ciclo mensual asignando el fondo reglamentario de <strong>$2.000.000 COP</strong> conforme a la política empresarial.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del Nuevo Período *
                </label>
                <input
                  type="text"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  placeholder="Ej. Noviembre 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fondo Inicial Asignado (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    min="500000"
                    step="100000"
                    value={newPeriodFund}
                    onChange={(e) => setNewPeriodFund(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 font-mono-numbers"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpenNewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow-xs transition-colors"
                >
                  Registrar Apertura de Fondo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
