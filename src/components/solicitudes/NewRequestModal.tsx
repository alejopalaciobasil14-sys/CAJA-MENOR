import React, { useState } from 'react';
import { X, Send, AlertCircle, DollarSign, Building, User, FileText, CheckCircle2 } from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { GastoConcepto } from '../../types';
import { formatCOP } from '../../utils/formatters';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEPARTMENTS = [
  'Operaciones y Logística',
  'Contabilidad y Finanzas',
  'Dirección Administrativa',
  'Mantenimiento e Instalaciones',
  'Ventas y Comercial',
  'Tecnología e Informática (TI)',
  'Recursos Humanos'
];

const CONCEPTS: GastoConcepto[] = [
  'Transporte y Taxis',
  'Papelería y Útiles de Oficina',
  'Alimentación y Refrigerios',
  'Mensajería y Envíos',
  'Mantenimiento Menor e Instalaciones',
  'Imprevistos Operativos',
  'Elementos de Aseo y Cafetería',
  'Fotocopias y Trámites Notariales',
  'Otro'
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, users, currentPeriod, metrics, createRequest } = useCajaMenor();

  const [applicantId, setApplicantId] = useState(currentUser.id);
  const [department, setDepartment] = useState(currentUser.department || DEPARTMENTS[0]);
  const [concept, setConcept] = useState<GastoConcepto>('Transporte y Taxis');
  const [customConcept, setCustomConcept] = useState('');
  const [justification, setJustification] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | ''>('');
  const [authorizedBy, setAuthorizedBy] = useState('Camila Morales (Responsable de Caja)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplicantChange = (id: string) => {
    setApplicantId(id);
    const selected = users.find(u => u.id === id);
    if (selected && selected.department) {
      setDepartment(selected.department);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = Number(requestedAmount);
    if (!amountNum || amountNum <= 0) {
      setError('Por favor ingrese un valor válido en pesos colombianos.');
      return;
    }

    if (amountNum > metrics.availableCashBalance) {
      setError(`El valor solicitado supera el saldo disponible en caja menor (${formatCOP(metrics.availableCashBalance)}).`);
      return;
    }

    if (!justification.trim() || justification.trim().length < 10) {
      setError('La justificación debe contener al menos 10 caracteres explicativos.');
      return;
    }

    const applicantObj = users.find(u => u.id === applicantId) || currentUser;

    const result = createRequest({
      applicantId,
      applicantName: applicantObj.name,
      department,
      concept,
      customConcept: concept === 'Otro' ? customConcept : undefined,
      justification: justification.trim(),
      requestedAmount: amountNum,
      authorizedBy
    });

    if (result.success) {
      // Reset form
      setJustification('');
      setRequestedAmount('');
      setCustomConcept('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">PASO 2: Nueva Solicitud de Dinero (Mañana)</h2>
              <p className="text-xs text-slate-300">
                Período: {currentPeriod.name} | Saldo Disponible: <span className="text-emerald-400 font-bold">{formatCOP(metrics.availableCashBalance)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Solicitante y Departamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Nombre del Solicitante *
              </label>
              <select
                value={applicantId}
                onChange={(e) => handleApplicantChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'ADMIN' ? 'Admin' : u.role === 'RESPONSABLE' ? 'Responsable' : 'Empleado'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Área o Departamento *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Concepto del Gasto */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Concepto del Gasto *
            </label>
            <select
              value={concept}
              onChange={(e) => setConcept(e.target.value as GastoConcepto)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CONCEPTS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {concept === 'Otro' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Especifique el concepto *
              </label>
              <input
                type="text"
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="Ej. Peajes imprevistos, cerrajería, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          )}

          {/* Valor Solicitado */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor Solicitado en Pesos Colombianos (COP) *
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Máximo disponible: <strong>{formatCOP(metrics.availableCashBalance)}</strong>
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">$</span>
              <input
                type="number"
                min="1000"
                step="500"
                max={metrics.availableCashBalance}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej. 100000"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            {requestedAmount && (
              <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                Monto en letras / formato oficial: {formatCOP(Number(requestedAmount), true)}
              </p>
            )}
          </div>

          {/* Justificación de la solicitud */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Justificación de la Solicitud *
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Describa claramente la actividad o necesidad que motiva el gasto menor..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Responsable que autoriza */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Responsable que Autoriza Desembolso
            </label>
            <input
              type="text"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              Radicar Solicitud
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
