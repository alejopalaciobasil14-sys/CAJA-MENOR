import React from 'react';
import { 
  DollarSign, 
  HandCoins, 
  Receipt, 
  RotateCcw, 
  Wallet, 
  FileCheck2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Building2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { formatCOP, formatDate } from '../../utils/formatters';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewRequest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenNewRequest }) => {
  const { metrics, requests, currentPeriod } = useCajaMenor();

  // Calcular distribución de gastos por departamento
  const expensesByDept: Record<string, number> = {};
  const expensesByConcept: Record<string, number> = {};

  requests
    .filter(r => r.periodId === currentPeriod.id && r.status === 'LEGALIZADA' && r.legalizationInfo?.isVerified)
    .forEach(r => {
      const spent = r.legalizationInfo?.actualSpentAmount || 0;
      expensesByDept[r.department] = (expensesByDept[r.department] || 0) + spent;
      expensesByConcept[r.concept] = (expensesByConcept[r.concept] || 0) + spent;
    });

  const totalVerifiedSpent = Object.values(expensesByDept).reduce((a, b) => a + b, 0);

  // Lista de movimientos recientes (los últimos 5)
  const recentRequests = [...requests]
    .filter(r => r.periodId === currentPeriod.id)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Encabezado con Bienvenida y Acciones Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Período Activo: {currentPeriod.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestión y Control de Caja Menor
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Supervise en tiempo real el fondo fijo de <strong className="text-white">$2.000.000 COP</strong>, autorice solicitudes matutinas y legalice facturas con devoluciones exactas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            + Nueva Solicitud (Mañana)
          </button>
          <button
            onClick={() => onNavigate('legalizaciones')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            Legalizar Gastos (Tarde)
          </button>
        </div>
      </div>

      {/* Alertas de acción urgente si hay solicitudes pendientes o facturas por legalizar */}
      {(metrics.pendingRequestsCount > 0 || metrics.deliveredPendingCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.pendingRequestsCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Solicitudes de la Mañana
                  </p>
                  <p className="text-sm font-semibold">
                    Hay <strong>{metrics.pendingRequestsCount}</strong> solicitud(es) esperando aprobación y desembolso.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('entregas')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Atender
              </button>
            </div>
          )}

          {metrics.deliveredPendingCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Legalizaciones de la Tarde
                  </p>
                  <p className="text-sm font-semibold">
                    Hay <strong>{metrics.deliveredPendingCount}</strong> anticipo(s) en la calle ({formatCOP(metrics.pendingLegalizationAmount)}) sin factura.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('legalizaciones')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Revisar
              </button>
            </div>
          )}
        </div>
      )}

      {/* 8 Tarjetas Principales de Indicadores Requeridos */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Fondo Inicial */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fondo Inicial</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono-numbers">
            {formatCOP(metrics.initialFund)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Asignación mensual oficial</span>
        </div>

        {/* 2. Total Dinero Entregado */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Total Entregado</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono-numbers">
            {formatCOP(metrics.totalDelivered)}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Desembolsos autorizados</span>
        </div>

        {/* 3. Total Gastos Realizados */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Gastos Legalizados</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono-numbers">
            {formatCOP(metrics.totalSpent)}
          </p>
          <span className="text-[11px] text-rose-700 font-medium">Respaldados con factura/recibo</span>
        </div>

        {/* 4. Total Dinero Devuelto */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dinero Devuelto</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono-numbers">
            {formatCOP(metrics.totalReturned)}
          </p>
          <span className="text-[11px] text-blue-700 font-medium">Reintegrado a caja física</span>
        </div>

        {/* 5. Saldo Disponible en Efectivo */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Saldo Disponible</span>
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-2 font-mono-numbers">
            {formatCOP(metrics.availableCashBalance)}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold">Efectivo disponible en caja</span>
        </div>

        {/* 6. Número Total de Solicitudes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Solicitudes</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono-numbers">
            {metrics.totalRequestsCount}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">{metrics.legalizedCount} cerradas legalizadas</span>
        </div>

        {/* 7. Solicitudes Pendientes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Por Autorizar</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 mt-2 font-mono-numbers">
            {metrics.pendingRequestsCount}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Requerimientos de la mañana</span>
        </div>

        {/* 8. Facturas Pendientes de Legalización */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Por Legalizar</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700 mt-2 font-mono-numbers">
            {metrics.deliveredPendingCount}
          </p>
          <span className="text-[11px] text-rose-700 font-medium">Anticipos en calle por verificar</span>
        </div>

      </div>

      {/* Barra de Progreso del Fondo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900">Ejecución del Fondo Mensual:</span>
            <span className="font-semibold text-slate-600">
              {formatCOP(metrics.totalSpent)} ejecutados de {formatCOP(metrics.initialFund)}
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 font-mono-numbers">
            {metrics.budgetExecutionPercentage.toFixed(1)}% Consumido
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              metrics.budgetExecutionPercentage > 85
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : metrics.budgetExecutionPercentage > 60
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(4, metrics.budgetExecutionPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-600 pt-1">
          <span>Anticipos en trámite: {formatCOP(metrics.pendingLegalizationAmount)}</span>
          <span className="font-semibold text-emerald-700">Disponible: {formatCOP(metrics.availableCashBalance)}</span>
        </div>
      </div>

      {/* Gráficos Estadísticos del Comportamiento del Fondo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Gastos por Departamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Gastos Legalizados por Departamento</h2>
            </div>
            <span className="text-xs text-slate-600 font-medium">Distribución %</span>
          </div>

          {Object.keys(expensesByDept).length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-600">
              No hay gastos legalizados aún en este período.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(expensesByDept).map(([dept, amount]) => {
                const pct = totalVerifiedSpent > 0 ? (amount / totalVerifiedSpent) * 100 : 0;
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[220px]">{dept}</span>
                      <span className="text-slate-900 font-mono-numbers">
                        {formatCOP(amount)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico 2: Gastos por Concepto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Gastos por Concepto</h2>
            </div>
            <span className="text-xs text-slate-600 font-medium">Mayor consumo</span>
          </div>

          {Object.keys(expensesByConcept).length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-600">
              No hay gastos registrados para graficar.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(expensesByConcept).map(([concept, amount]) => {
                const pct = totalVerifiedSpent > 0 ? (amount / totalVerifiedSpent) * 100 : 0;
                return (
                  <div key={concept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[220px]">{concept}</span>
                      <span className="text-slate-900 font-mono-numbers">
                        {formatCOP(amount)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Movimientos Recientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Movimientos Recientes</h2>
            <p className="text-xs text-slate-600">Últimas solicitudes y entregas en el período activo</p>
          </div>
          <button
            onClick={() => onNavigate('solicitudes')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3 text-right">Solicitado</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentRequests.map(req => {
                const isLegalizada = req.status === 'LEGALIZADA';
                const isPendiente = req.status === 'PENDIENTE';
                const isEntregada = req.status === 'APROBADA_ENTREGADA';
                const isRechazada = req.status === 'RECHAZADA';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {req.code}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{req.applicantName}</div>
                      <div className="text-[10px] text-slate-600">{req.department}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={req.concept}>
                      {req.concept}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-semibold text-slate-900">
                      {formatCOP(req.requestedAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isLegalizada ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isEntregada ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        isPendiente ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {isLegalizada ? 'Legalizada' :
                         isEntregada ? 'En Legalización' :
                         isPendiente ? 'Pendiente' : 'Rechazada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPendiente && (
                        <button
                          onClick={() => onNavigate('entregas')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px]"
                        >
                          Aprobar
                        </button>
                      )}
                      {isEntregada && (
                        <button
                          onClick={() => onNavigate('legalizaciones')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Legalizar
                        </button>
                      )}
                      {isLegalizada && (
                        <span className="text-[11px] text-emerald-600 font-bold">
                          ✓ Cerrada
                        </span>
                      )}
                      {isRechazada && (
                        <span className="text-[11px] text-rose-500 font-medium">
                          Denegada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
