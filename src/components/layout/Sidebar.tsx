import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  HandCoins, 
  Receipt, 
  Calculator, 
  BarChart3, 
  CalendarCheck2, 
  ShieldCheck, 
  BookOpen,
  DollarSign
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { formatCOP } from '../../utils/formatters';

export type ActiveTab = 
  | 'dashboard'
  | 'solicitudes'
  | 'entregas'
  | 'legalizaciones'
  | 'arqueo'
  | 'informes'
  | 'cierre'
  | 'usuarios'
  | 'manual';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { metrics, currentPeriod } = useCajaMenor();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Panel Principal',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'solicitudes' as ActiveTab,
      label: '1. Solicitudes (Mañana)',
      icon: FileText,
      badge: metrics.pendingRequestsCount > 0 ? { count: metrics.pendingRequestsCount, color: 'bg-amber-500 text-white' } : null
    },
    {
      id: 'entregas' as ActiveTab,
      label: '2. Aprobación y Entrega',
      icon: HandCoins,
      badge: metrics.pendingRequestsCount > 0 ? { count: metrics.pendingRequestsCount, color: 'bg-blue-600 text-white' } : null
    },
    {
      id: 'legalizaciones' as ActiveTab,
      label: '3. Legalizaciones (Tarde)',
      icon: Receipt,
      badge: metrics.deliveredPendingCount > 0 ? { count: metrics.deliveredPendingCount, color: 'bg-rose-500 text-white' } : null
    },
    {
      id: 'arqueo' as ActiveTab,
      label: '4. Arqueo Diario',
      icon: Calculator,
      badge: null
    },
    {
      id: 'informes' as ActiveTab,
      label: 'Informes de Consumo',
      icon: BarChart3,
      badge: { count: '10', color: 'bg-slate-200 text-slate-700' }
    },
    {
      id: 'cierre' as ActiveTab,
      label: 'Cierre Mensual',
      icon: CalendarCheck2,
      badge: currentPeriod.status === 'CERRADO' ? { count: 'Cerrado', color: 'bg-slate-500 text-white' } : null
    },
    {
      id: 'usuarios' as ActiveTab,
      label: 'Usuarios y Seguridad',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'manual' as ActiveTab,
      label: 'Manual de Usuario',
      icon: BookOpen,
      badge: { count: 'Guía', color: 'bg-emerald-100 text-emerald-800' }
    }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Menú Lateral */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 md:z-20 h-full md:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          
          {/* Encabezado móvil */}
          <div className="md:hidden flex items-center justify-between px-2 pb-3 border-b border-slate-800">
            <span className="font-bold text-white text-sm">Menú de Navegación</span>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Grupo de Navegación */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Proceso de Caja Menor
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-slate-950 text-white' : item.badge.color
                      }`}>
                        {item.badge.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Cuadro de Resumen del Fondo */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Fondo Mensual Asignado</span>
            </div>
            <p className="text-white font-extrabold text-base font-mono-numbers">
              {formatCOP(currentPeriod.initialFund, true)}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Ejecución:</span>
                <span className="text-white font-semibold">{metrics.budgetExecutionPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.budgetExecutionPercentage > 85 ? 'bg-rose-500' :
                    metrics.budgetExecutionPercentage > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${metrics.budgetExecutionPercentage}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Pie de navegación */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>CajaControl v1.0</span>
          <span className="text-emerald-400 font-semibold">100% Persistente</span>
        </div>
      </aside>
    </>
  );
};
