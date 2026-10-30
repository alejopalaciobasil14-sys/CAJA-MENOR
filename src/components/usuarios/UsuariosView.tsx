import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Users
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { UserRole } from '../../types';

export const UsuariosView: React.FC = () => {
  const { users, currentUser, setCurrentUser, exportDatabaseJSON, importDatabaseJSON, resetData } = useCajaMenor();

  const [jsonInput, setJsonInput] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CajaControl_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'Copia de seguridad en formato JSON descargada satisfactoriamente.' });
  };

  const handleImportBackup = () => {
    if (!jsonInput.trim()) {
      setFeedback({ type: 'error', message: 'Por favor pegue el contenido JSON a importar.' });
      return;
    }
    const result = importDatabaseJSON(jsonInput);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setShowImportArea(false);
      setJsonInput('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('¿Está seguro de reiniciar los datos a los valores de demostración iniciales de $2.000.000 COP? Se sobreescribirán los cambios no respaldados.')) {
      resetData();
      setFeedback({ type: 'success', message: 'La plataforma ha sido restablecida a sus datos de demostración iniciales.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
            Seguridad y Administración
          </span>
          <span className="text-xs text-slate-500 font-medium">Perfiles, Trazabilidad y Respaldos</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Gestión de Usuarios y Seguridad de Caja Menor
        </h1>
        <p className="text-xs text-slate-600">
          La plataforma implementa tres perfiles diferenciados: Administrador, Responsable de Caja Menor y Solicitante, con trazabilidad inmutable de cada movimiento.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Lista de Usuarios Configurados y Selector Activo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-bold text-slate-900">Usuarios Autorizados del Sistema</h2>
          </div>
          <span className="text-xs text-slate-500">Haga clic en un usuario para asumir su rol</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(u => {
            const isCurrent = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                    Activo
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.department}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'RESPONSABLE' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role === 'ADMIN' ? 'Administrador' : u.role === 'RESPONSABLE' ? 'Responsable de Caja' : 'Solicitante'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                  <span>{u.email}</span>
                  <span>{u.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matriz de Permisos por Rol */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Matriz de Roles y Privilegios</h2>
          <p className="text-xs text-slate-500">Definición de responsabilidades conforme al manual de usuario</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Funcionalidad / Operación</th>
                <th className="px-4 py-3 text-center">Administrador</th>
                <th className="px-4 py-3 text-center">Responsable Caja Menor</th>
                <th className="px-4 py-3 text-center">Solicitante (Empleado)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-semibold">Visualizar Panel Principal y Saldos</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Crear Solicitudes de Dinero (Mañana)</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Aprobar y Entregar Dinero en Efectivo</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-rose-500 font-bold">✕ Restringido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Registrar Facturas y Devoluciones (Tarde)</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Verificar Soportes y Cerrar Legalización</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-rose-500 font-bold">✕ Restringido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Realizar Arqueo Físico Diario de Caja</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-rose-500 font-bold">✕ Restringido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Efectuar Cierre Mensual y Apertura</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-rose-500 font-bold">✕ Restringido</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Generar y Exportar Informes (Excel y PDF)</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold">✓ Permitido</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestión de Base de Datos y Respaldos */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-800" />
          <h2 className="text-sm font-bold text-slate-900">Almacenamiento Persistente y Copias de Seguridad</h2>
        </div>
        <p className="text-xs text-slate-600">
          Todos los movimientos financieros, auditorías, facturas y comprobantes se almacenan de forma local y persistente en su navegador web (`localStorage`), sin riesgo de perderse al recargar la página.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Descargar Respaldo JSON
          </button>

          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            Restaurar desde JSON
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar a Datos de Ejemplo ($2.000.000 COP)
          </button>
        </div>

        {showImportArea && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <label className="block font-bold text-slate-800">
              Pegue el archivo JSON de respaldo:
            </label>
            <textarea
              rows={4}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"currentPeriod": {...}, "requests": [...]}'
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportArea(false)}
                className="px-3 py-1.5 text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportBackup}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Importar Datos
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
