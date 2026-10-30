import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  Calendar,
  Building,
  User,
  DollarSign
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { PettyCashRequest, RequestStatus } from '../../types';
import { formatCOP, formatDateTime, formatDate } from '../../utils/formatters';
import { NewRequestModal } from './NewRequestModal';

export const SolicitudesView: React.FC = () => {
  const { requests, currentPeriod, metrics } = useCajaMenor();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [deptFilter, setDeptFilter] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PettyCashRequest | null>(null);

  // Filtrado
  const filteredRequests = requests.filter(req => {
    // Solo solicitudes del período actual
    if (req.periodId !== currentPeriod.id) return false;

    // Filtro por estado
    if (statusFilter !== 'TODAS' && req.status !== statusFilter) return false;

    // Filtro por departamento
    if (deptFilter !== 'TODOS' && req.department !== deptFilter) return false;

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCode = req.code.toLowerCase().includes(q);
      const matchApplicant = req.applicantName.toLowerCase().includes(q);
      const matchConcept = req.concept.toLowerCase().includes(q);
      const matchJustification = req.justification.toLowerCase().includes(q);
      const matchDept = req.department.toLowerCase().includes(q);
      return matchCode || matchApplicant || matchConcept || matchJustification || matchDept;
    }

    return true;
  });

  // Departamentos únicos
  const departments = Array.from(new Set(requests.map(r => r.department)));

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pendiente
          </span>
        );
      case 'APROBADA_ENTREGADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertCircle className="w-3 h-3 text-blue-600" />
            En Legalización
          </span>
        );
      case 'LEGALIZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Legalizada
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rechazada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Paso 2 del Proceso
            </span>
            <span className="text-xs text-slate-500 font-medium">Jornada de la Mañana</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Registro de Solicitudes de Caja Menor
          </h1>
          <p className="text-xs text-slate-600">
            Los trabajadores registran requerimientos de dinero para gastos menores imprevistos de la empresa.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + Nueva Solicitud
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, solicitante, departamento, concepto..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODAS">Todos los Estados</option>
            <option value="PENDIENTE">Pendientes ({metrics.pendingRequestsCount})</option>
            <option value="APROBADA_ENTREGADA">En Legalización ({metrics.deliveredPendingCount})</option>
            <option value="LEGALIZADA">Legalizadas ({metrics.legalizedCount})</option>
            <option value="RECHAZADA">Rechazadas ({metrics.rejectedCount})</option>
          </select>

          {/* Selector Departamento */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODOS">Todos los Departamentos</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Concepto y Justificación</th>
                <th className="px-4 py-3 text-right">Valor Solicitado</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron solicitudes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {req.code}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(req.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {req.applicantName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {req.department}
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="font-bold text-slate-900 truncate">
                        {req.concept}
                        {req.customConcept && ` (${req.customConcept})`}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1" title={req.justification}>
                        {req.justification}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCOP(req.requestedAmount)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalle completo de trazabilidad"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla con totalizadores */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-500 font-medium">
            Mostrando <strong>{filteredRequests.length}</strong> de <strong>{requests.filter(r => r.periodId === currentPeriod.id).length}</strong> solicitudes
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-700">
            <span>
              Total Solicitado Filtrado:{' '}
              <strong className="text-slate-900 font-mono-numbers">
                {formatCOP(filteredRequests.reduce((acc, r) => acc + r.requestedAmount, 0))}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Modal Nueva Solicitud */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal Detalle de Solicitud y Auditoría */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Detalle de Solicitud: {selectedRequest.code}</h3>
                  <p className="text-xs text-slate-300">
                    Registrada el {formatDateTime(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Información General */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Solicitante</span>
                  <span className="font-bold text-slate-900">{selectedRequest.applicantName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Departamento</span>
                  <span className="font-bold text-slate-900">{selectedRequest.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Estado Actual</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Valor Solicitado</span>
                  <span className="font-extrabold text-slate-900 text-sm font-mono-numbers">
                    {formatCOP(selectedRequest.requestedAmount, true)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Concepto</span>
                  <span className="font-bold text-slate-900">{selectedRequest.concept}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Autoriza</span>
                  <span className="font-bold text-slate-900">{selectedRequest.authorizedBy}</span>
                </div>
              </div>

              {/* Justificación */}
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Justificación del Gasto:</h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                  {selectedRequest.justification}
                </div>
              </div>

              {/* Desembolso / Entrega */}
              {selectedRequest.deliveryInfo && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-700" />
                    Información de Entrega de Dinero:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Valor Entregado:</span>
                      <strong className="text-blue-900 font-mono-numbers">{formatCOP(selectedRequest.deliveryInfo.deliveredAmount, true)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fecha de Entrega:</span>
                      <strong>{formatDateTime(selectedRequest.deliveryInfo.deliveredAt)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Recibido por:</span>
                      <strong>{selectedRequest.deliveryInfo.receivedByName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Comprobante / Vale:</span>
                      <strong className="font-mono">{selectedRequest.deliveryInfo.voucherNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cajero / Entregó:</span>
                      <strong>{selectedRequest.deliveryInfo.registeredBy}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Legalización / Factura */}
              {selectedRequest.legalizationInfo && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Información de Legalización de Factura:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Factura N°:</span>
                      <strong className="font-mono text-slate-900">{selectedRequest.legalizationInfo.invoiceNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Proveedor:</span>
                      <strong>{selectedRequest.legalizationInfo.supplierName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">NIT:</span>
                      <strong>{selectedRequest.legalizationInfo.supplierNit || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Gasto Real Realizado:</span>
                      <strong className="text-rose-700 font-mono-numbers">{formatCOP(selectedRequest.legalizationInfo.actualSpentAmount, true)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Dinero Devuelto a Caja:</span>
                      <strong className="text-emerald-700 font-mono-numbers">{formatCOP(selectedRequest.legalizationInfo.returnedAmount, true)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Verificado por:</span>
                      <strong>{selectedRequest.legalizationInfo.verifiedBy || 'En revisión'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Auditoría / Historial */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Trazabilidad y Registro de Auditoría:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequest.auditLog.map(aud => (
                    <div key={aud.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900">{aud.action}</span>
                        <span className="text-slate-500 ml-2">por {aud.user}</span>
                        <p className="text-slate-600 mt-0.5">{aud.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                        {formatDateTime(aud.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
