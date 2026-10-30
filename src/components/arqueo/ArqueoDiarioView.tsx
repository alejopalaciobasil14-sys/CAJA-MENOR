import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Receipt, 
  FileText,
  Printer
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { formatCOP, formatDateTime } from '../../utils/formatters';

interface Denomination {
  val: number;
  label: string;
  type: 'billete' | 'moneda';
}

const DENOMINATIONS: Denomination[] = [
  { val: 100000, label: 'Billetes de $100.000', type: 'billete' },
  { val: 50000, label: 'Billetes de $50.000', type: 'billete' },
  { val: 20000, label: 'Billetes de $20.000', type: 'billete' },
  { val: 10000, label: 'Billetes de $10.000', type: 'billete' },
  { val: 5000, label: 'Billetes de $5.000', type: 'billete' },
  { val: 2000, label: 'Billetes de $2.000', type: 'billete' },
  { val: 1000, label: 'Monedas / Billetes de $1.000', type: 'moneda' },
  { val: 500, label: 'Monedas de $500', type: 'moneda' },
  { val: 200, label: 'Monedas de $200', type: 'moneda' },
  { val: 100, label: 'Monedas de $100', type: 'moneda' },
  { val: 50, label: 'Monedas de $50', type: 'moneda' },
];

export const ArqueoDiarioView: React.FC = () => {
  const { metrics, currentPeriod, currentUser, requests } = useCajaMenor();

  // Conteo de billetes y monedas
  const [counts, setCounts] = useState<Record<number, number>>({
    100000: 10,
    50000: 10,
    20000: 8,
    10000: 4,
    5000: 0,
    2000: 0,
    1000: 1,
    500: 1,
    200: 0,
    100: 0,
    50: 0,
  });

  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calcular total físico en efectivo
  const physicalTotal = DENOMINATIONS.reduce((sum, d) => {
    return sum + d.val * (counts[d.val] || 0);
  }, 0);

  // Saldo teórico del sistema en efectivo
  const theoreticalTotal = metrics.availableCashBalance;

  // Diferencia
  const difference = physicalTotal - theoreticalTotal;

  // Cuadre total del fondo: Efectivo Físico + Anticipos en la calle + Gastos legalizados = $2.000.000
  const totalReconciled = physicalTotal + metrics.pendingLegalizationAmount + metrics.totalSpent;
  const fundDifference = totalReconciled - metrics.initialFund;

  const handleCountChange = (val: number, newCount: number) => {
    setCounts(prev => ({
      ...prev,
      [val]: Math.max(0, newCount || 0)
    }));
  };

  const handleAutoFillExact = () => {
    // Distribuir el saldo teórico automáticamente en denominaciones comunes
    let remaining = theoreticalTotal;
    const newCounts: Record<number, number> = {};

    [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50].forEach(d => {
      const q = Math.floor(remaining / d);
      newCounts[d] = q;
      remaining = remaining % d;
    });

    setCounts(newCounts);
  };

  const handleSaveArqueo = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            Paso 6 del Proceso
          </span>
          <span className="text-xs text-slate-500 font-medium">Control Diario del Dinero y Arqueo de Caja</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Arqueo Diario y Cuadre de Caja Menor
        </h1>
        <p className="text-xs text-slate-600">
          Supervise la concordancia matemática entre el saldo teórico del software y el dinero físico en el cofre de seguridad.
        </p>
      </div>

      {/* 5 Indicadores de Control Diario Requeridos en Paso 6 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* 1. Solicitudes Pendientes */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
            <Clock className="w-4 h-4" />
            <span>Por Autorizar</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {metrics.pendingRequestsCount}
          </span>
          <p className="text-[10px] text-slate-500">Solicitudes matutinas</p>
        </div>

        {/* 2. Anticipos pendientes de legalización */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-1">
            <Banknote className="w-4 h-4" />
            <span>Anticipos en Calle</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCOP(metrics.pendingLegalizationAmount)}
          </span>
          <p className="text-[10px] text-slate-500">{metrics.deliveredPendingCount} en legalización</p>
        </div>

        {/* 3. Facturas pendientes de revisión */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs mb-1">
            <Receipt className="w-4 h-4" />
            <span>Facturas en Espera</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {requests.filter(r => r.periodId === currentPeriod.id && r.legalizationInfo && !r.legalizationInfo.isVerified).length}
          </span>
          <p className="text-[10px] text-slate-500">Por validar soportes</p>
        </div>

        {/* 4. Gastos legalizados */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Gastos Legalizados</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCOP(metrics.totalSpent)}
          </span>
          <p className="text-[10px] text-slate-500">{metrics.legalizedCount} facturas validadas</p>
        </div>

        {/* 5. Devoluciones recibidas */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-1">
            <RotateCcw className="w-4 h-4" />
            <span>Devoluciones</span>
          </div>
          <span className="text-xl font-extrabold text-slate-900 font-mono-numbers">
            {formatCOP(metrics.totalReturned)}
          </span>
          <p className="text-[10px] text-slate-500">Reintegros a caja</p>
        </div>

      </div>

      {/* Panel Central del Arqueo: Calculadora de Denominaciones vs Saldo Teórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Calculadora de Monedas y Billetes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-slate-800" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Conteo Físico por Denominación (Pesos Colombianos)
              </h2>
            </div>
            <button
              onClick={handleAutoFillExact}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
            >
              Autocompletar Conteo Cuadrado
            </button>
          </div>

          <div className="p-4 sm:p-5 divide-y divide-slate-100">
            {DENOMINATIONS.map(d => {
              const count = counts[d.val] || 0;
              const subtotal = d.val * count;

              return (
                <div key={d.val} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2.5 w-48">
                    {d.type === 'billete' ? (
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800">{d.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCountChange(d.val, count - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) => handleCountChange(d.val, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono-numbers"
                    />
                    <button
                      onClick={() => handleCountChange(d.val, count + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-32 text-right font-mono-numbers font-bold text-slate-900">
                    {formatCOP(subtotal)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Total Físico Contado en Caja:</span>
            <span className="text-base text-slate-900 font-mono-numbers">{formatCOP(physicalTotal, true)}</span>
          </div>
        </div>

        {/* Columna 3: Tarjeta de Conciliación y Estado del Arqueo */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Conciliación del Arqueo Diario
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Efectivo Contado:</span>
                <strong className="text-slate-900 font-mono-numbers">{formatCOP(physicalTotal)}</strong>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Saldo Teórico Sistema:</span>
                <strong className="text-slate-900 font-mono-numbers">{formatCOP(theoreticalTotal)}</strong>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                <span>Diferencia en Caja:</span>
                <span className={`font-mono-numbers ${
                  difference === 0 ? 'text-emerald-600' : difference > 0 ? 'text-blue-600' : 'text-rose-600'
                }`}>
                  {difference === 0 ? '$ 0 (Cuadrada)' : formatCOP(difference)}
                </span>
              </div>
            </div>

            {/* Badge de resultado */}
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              difference === 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : difference > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {difference === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-current" />
              )}
              <div>
                <p className="font-extrabold text-xs">
                  {difference === 0 ? '¡CAJA FÍSICA PERFECTAMENTE CUADRADA!' : difference > 0 ? 'SOBRANTE DE CAJA' : 'FALTANTE DE CAJA'}
                </p>
                <p className="text-[11px] opacity-80">
                  {difference === 0
                    ? 'El conteo físico de billetes y monedas coincide exactamente con el saldo contable.'
                    : difference > 0
                    ? `Hay un exceso de ${formatCOP(difference)} respecto a los registros del sistema.`
                    : `Existe un faltante de ${formatCOP(Math.abs(difference))}. Verifique si hay un recibo no registrado.`}
                </p>
              </div>
            </div>

            {/* Comprobación Integral del Fondo */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block text-xs">Control Global del Fondo:</span>
              <div className="flex justify-between">
                <span>Efectivo en caja:</span>
                <strong className="font-mono-numbers">{formatCOP(physicalTotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>+ Anticipos en calle:</span>
                <strong className="font-mono-numbers">{formatCOP(metrics.pendingLegalizationAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span>+ Gastos legalizados:</span>
                <strong className="font-mono-numbers">{formatCOP(metrics.totalSpent)}</strong>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Comprobado:</span>
                <strong className="font-mono-numbers">{formatCOP(totalReconciled)}</strong>
              </div>
            </div>

            {/* Observaciones del Arqueo */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                Observaciones del Arqueo Diario
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Arqueo sin novedades realizado a las 5:00 PM por Camila Morales."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              />
            </div>

            <button
              onClick={handleSaveArqueo}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Guardar Acta de Arqueo Diario
            </button>

            {savedSuccess && (
              <p className="text-center text-xs text-emerald-700 font-bold animate-pulse">
                ✓ Registro de arqueo guardado en auditoría del período.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
