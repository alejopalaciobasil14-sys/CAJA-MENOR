import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileDown, 
  Calendar, 
  Filter, 
  User, 
  Building, 
  Tag, 
  TrendingUp, 
  RotateCcw, 
  Receipt, 
  DollarSign,
  PieChart,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { PettyCashRequest } from '../../types';
import { formatCOP, formatDate, formatDateTime } from '../../utils/formatters';
import { exportRequestsToExcel } from '../../utils/excelExport';
import { exportRequestsToPDF } from '../../utils/pdfExport';

export type ReportType = 
  | 'diario'
  | 'semanal'
  | 'mensual'
  | 'solicitante'
  | 'departamento'
  | 'concepto'
  | 'aprobadas_rechazadas'
  | 'facturas_pendientes_legalizadas'
  | 'devoluciones'
  | 'saldo_ejecucion';

interface ReportConfig {
  id: ReportType;
  title: string;
  subtitle: string;
  description: string;
}

const REPORTS_LIST: ReportConfig[] = [
  { id: 'diario', title: '1. Informe Diario de Movimientos', subtitle: 'Bitácora cronológica diaria', description: 'Registro cronológico y detallado de cada desembolso, legalización y devolución realizada día a día.' },
  { id: 'semanal', title: '2. Informe Semanal de Gastos', subtitle: 'Consumo agrupado por semanas', description: 'Comportamiento y consolidación de egresos por cada semana del ciclo operativo.' },
  { id: 'mensual', title: '3. Informe Mensual de Consumo', subtitle: 'Balance mensual del fondo', description: 'Resumen global del periodo mensual, saldo inicial, total ejecutado y remanente disponible.' },
  { id: 'solicitante', title: '4. Informe de Gastos por Solicitante', subtitle: 'Distribución por colaborador', description: 'Análisis de quiénes son los trabajadores que más recursos solicitan y legalizan.' },
  { id: 'departamento', title: '5. Informe de Gastos por Departamento', subtitle: 'Consumo por áreas de la empresa', description: 'Comparativo porcentual y montos ejecutados por Operaciones, Administración, Finanzas, etc.' },
  { id: 'concepto', title: '6. Informe de Gastos por Concepto', subtitle: 'Categorías de egreso', description: 'Clasificación por transporte, papelería, refrigerios, mantenimiento, mensajería, etc.' },
  { id: 'aprobadas_rechazadas', title: '7. Informe de Solicitudes Aprobadas y Rechazadas', subtitle: 'Eficacia y control de solicitudes', description: 'Balance de solicitudes admitidas vs rechazadas con sus respectivas justificaciones.' },
  { id: 'facturas_pendientes_legalizadas', title: '8. Informe de Facturas Pendientes y Legalizadas', subtitle: 'Control de soportes tributarios', description: 'Seguimiento de facturas radicadas, proveedores con NIT y anticipos aún sin soporte.' },
  { id: 'devoluciones', title: '9. Informe de Devoluciones de Dinero', subtitle: 'Reintegros de efectivo a caja', description: 'Trazabilidad del dinero sobrante devuelto por los trabajadores al pagar facturas de menor valor.' },
  { id: 'saldo_ejecucion', title: '10. Informe de Saldo Disponible y Ejecución del Fondo', subtitle: 'Curva de consumo presupuestal', description: 'Estado en tiempo real del fondo de $2.000.000 COP, porcentaje consumido y liquidez disponible.' },
];

export const InformesView: React.FC = () => {
  const { requests, currentPeriod, metrics, users } = useCajaMenor();

  const [selectedReport, setSelectedReport] = useState<ReportType>('diario');
  const [filterApplicant, setFilterApplicant] = useState<string>('TODOS');
  const [filterDepartment, setFilterDepartment] = useState<string>('TODOS');
  const [filterConcept, setFilterConcept] = useState<string>('TODOS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Departamentos y Conceptos únicos
  const departments = useMemo(() => Array.from(new Set(requests.map(r => r.department))), [requests]);
  const concepts = useMemo(() => Array.from(new Set(requests.map(r => r.concept))), [requests]);

  // Solicitudes filtradas
  const filteredData = useMemo(() => {
    return requests.filter(req => {
      if (req.periodId !== currentPeriod.id) return false;

      if (filterApplicant !== 'TODOS' && req.applicantId !== filterApplicant) return false;
      if (filterDepartment !== 'TODOS' && req.department !== filterDepartment) return false;
      if (filterConcept !== 'TODOS' && req.concept !== filterConcept) return false;

      if (startDate) {
        const reqDate = req.createdAt.slice(0, 10);
        if (reqDate < startDate) return false;
      }
      if (endDate) {
        const reqDate = req.createdAt.slice(0, 10);
        if (reqDate > endDate) return false;
      }

      return true;
    });
  }, [requests, currentPeriod, filterApplicant, filterDepartment, filterConcept, startDate, endDate]);

  const activeReportConfig = REPORTS_LIST.find(r => r.id === selectedReport) || REPORTS_LIST[0];

  // Cálculos estadísticos para gráficos
  const stats = useMemo(() => {
    const totalSolicitado = filteredData.reduce((sum, r) => sum + r.requestedAmount, 0);
    const totalEntregado = filteredData.reduce((sum, r) => sum + (r.deliveryInfo?.deliveredAmount || 0), 0);
    const totalGastado = filteredData.reduce((sum, r) => sum + (r.legalizationInfo?.actualSpentAmount || 0), 0);
    const totalDevuelto = filteredData.reduce((sum, r) => sum + (r.legalizationInfo?.returnedAmount || 0), 0);

    // Agrupación por solicitante
    const byApplicant: Record<string, number> = {};
    // Agrupación por depto
    const byDept: Record<string, number> = {};
    // Agrupación por concepto
    const byConcept: Record<string, number> = {};

    filteredData.forEach(r => {
      const amt = r.legalizationInfo?.actualSpentAmount || r.deliveryInfo?.deliveredAmount || r.requestedAmount;
      byApplicant[r.applicantName] = (byApplicant[r.applicantName] || 0) + amt;
      byDept[r.department] = (byDept[r.department] || 0) + amt;
      byConcept[r.concept] = (byConcept[r.concept] || 0) + amt;
    });

    return {
      totalSolicitado,
      totalEntregado,
      totalGastado,
      totalDevuelto,
      byApplicant,
      byDept,
      byConcept
    };
  }, [filteredData]);

  const handleExportExcel = () => {
    exportRequestsToExcel(filteredData, currentPeriod, metrics, `Reporte_${selectedReport}`);
  };

  const handleExportPDF = () => {
    exportRequestsToPDF(activeReportConfig.title, filteredData, currentPeriod, metrics, activeReportConfig.description);
  };

  const clearFilters = () => {
    setFilterApplicant('TODOS');
    setFilterDepartment('TODOS');
    setFilterConcept('TODOS');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
              Módulo de Auditoría y Reportes
            </span>
            <span className="text-xs text-slate-500 font-medium">10 Informes Analíticos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Informes de Consumo y Control de Caja Menor
          </h1>
          <p className="text-xs text-slate-600">
            Conozca detalladamente el destino de los recursos económicos con tablas, totales, porcentajes y exportación a Excel y PDF.
          </p>
        </div>

        {/* Botones de Descarga */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            title="Exportar a libro de Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar a Excel (.xlsx)
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            title="Descargar documento formal en PDF"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Selector de los 10 Informes en Pestañas Horizontales Scrolleables */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {REPORTS_LIST.map(rep => {
            const isSelected = selectedReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {rep.title.split('. ')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Filtros Personalizados de Información
          </span>
          {(filterApplicant !== 'TODOS' || filterDepartment !== 'TODOS' || filterConcept !== 'TODOS' || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Fecha Inicio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* Solicitante */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Trabajador</label>
            <select
              value={filterApplicant}
              onChange={(e) => setFilterApplicant(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
            >
              <option value="TODOS">Todos los Trabajadores</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Departamento</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
            >
              <option value="TODOS">Todos los Departamentos</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Concepto de Gasto</label>
            <select
              value={filterConcept}
              onChange={(e) => setFilterConcept(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
            >
              <option value="TODOS">Todos los Conceptos</option>
              {concepts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Resumen del Reporte Seleccionado */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-emerald-400">{activeReportConfig.title}</h2>
        <p className="text-xs text-slate-300 mt-0.5">{activeReportConfig.description}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Registros:</span>
            <strong className="text-white text-sm">{filteredData.length} movimientos</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Desembolsado:</span>
            <strong className="text-amber-400 text-sm font-mono-numbers">{formatCOP(stats.totalEntregado)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Gastado Real:</span>
            <strong className="text-rose-400 text-sm font-mono-numbers">{formatCOP(stats.totalGastado)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Devoluciones:</span>
            <strong className="text-emerald-400 text-sm font-mono-numbers">{formatCOP(stats.totalDevuelto)}</strong>
          </div>
        </div>
      </div>

      {/* Gráfico Estadístico Dinámico según el Reporte Seleccionado */}
      {(selectedReport === 'departamento' || selectedReport === 'concepto' || selectedReport === 'solicitante' || selectedReport === 'saldo_ejecucion') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Gráfico Estadístico: {activeReportConfig.subtitle}</span>
          </div>

          <div className="space-y-3 pt-2">
            {selectedReport === 'departamento' && (
              Object.entries(stats.byDept).map(([label, val]) => {
                const pct = stats.totalGastado > 0 ? (val / stats.totalGastado) * 100 : 0;
                return (
                  <div key={label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-900 font-mono-numbers">{formatCOP(val)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}

            {selectedReport === 'concepto' && (
              Object.entries(stats.byConcept).map(([label, val]) => {
                const pct = stats.totalGastado > 0 ? (val / stats.totalGastado) * 100 : 0;
                return (
                  <div key={label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-900 font-mono-numbers">{formatCOP(val)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}

            {selectedReport === 'solicitante' && (
              Object.entries(stats.byApplicant).map(([label, val]) => {
                const pct = stats.totalEntregado > 0 ? (val / stats.totalEntregado) * 100 : 0;
                return (
                  <div key={label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-900 font-mono-numbers">{formatCOP(val)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}

            {selectedReport === 'saldo_ejecucion' && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Presupuesto Consumido ({metrics.budgetExecutionPercentage.toFixed(1)}%)</span>
                  <span>Saldo Disponible ({((metrics.availableCashBalance / metrics.initialFund) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-emerald-500 h-4 rounded-full overflow-hidden flex">
                  <div className="bg-rose-500 h-full" style={{ width: `${metrics.budgetExecutionPercentage}%` }} />
                </div>
                <div className="flex justify-between text-xs font-mono-numbers text-slate-600">
                  <span>Gastos: {formatCOP(metrics.totalSpent)}</span>
                  <span className="text-emerald-700 font-bold">Disponible: {formatCOP(metrics.availableCashBalance)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla Detallada del Informe */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-xs">Registros Tabulados</span>
          <span className="text-xs text-slate-500">{filteredData.length} movimientos encontrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3 text-right">Solicitado</th>
                <th className="px-4 py-3 text-right">Entregado</th>
                <th className="px-4 py-3 text-right">Gasto Real</th>
                <th className="px-4 py-3 text-right">Devolución</th>
                <th className="px-4 py-3">Factura / Soporte</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No existen registros para el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                filteredData.map(req => {
                  const delivered = req.deliveryInfo?.deliveredAmount;
                  const spent = req.legalizationInfo?.actualSpentAmount;
                  const ret = req.legalizationInfo?.returnedAmount;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{req.code}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{req.applicantName}</td>
                      <td className="px-4 py-3 text-slate-600">{req.department}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate" title={req.concept}>{req.concept}</td>
                      <td className="px-4 py-3 text-right font-mono-numbers">{formatCOP(req.requestedAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono-numbers text-amber-800">{delivered ? formatCOP(delivered) : '-'}</td>
                      <td className="px-4 py-3 text-right font-mono-numbers text-rose-700 font-bold">{spent ? formatCOP(spent) : '-'}</td>
                      <td className="px-4 py-3 text-right font-mono-numbers text-emerald-700 font-bold">{ret ? `+ ${formatCOP(ret)}` : '-'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                        {req.legalizationInfo?.invoiceNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'LEGALIZADA' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'APROBADA_ENTREGADA' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status === 'LEGALIZADA' ? 'Legalizada' : req.status === 'APROBADA_ENTREGADA' ? 'En Legalización' : req.status === 'PENDIENTE' ? 'Pendiente' : 'Rechazada'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 uppercase tracking-wider">TOTALES CONSOLIDADOS</td>
                  <td className="px-4 py-3 text-right font-mono-numbers">{formatCOP(stats.totalSolicitado)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-amber-800">{formatCOP(stats.totalEntregado)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-rose-700">{formatCOP(stats.totalGastado)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-emerald-700">+ {formatCOP(stats.totalDevuelto)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};
