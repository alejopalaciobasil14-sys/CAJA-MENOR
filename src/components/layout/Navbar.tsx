import React, { useState } from 'react';
import { 
  Wallet, 
  ChevronDown, 
  UserCheck, 
  Menu, 
  X, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useCajaMenor } from '../../context/CajaMenorContext';
import { formatCOP } from '../../utils/formatters';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, setCurrentUser, users, currentPeriod, metrics } = useCajaMenor();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="text-[11px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Administrador</span>;
      case 'RESPONSABLE':
        return <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Responsable Caja</span>;
      case 'SOLICITANTE':
        return <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Solicitante</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Toggle móvil */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                  CajaControl
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    COP
                  </span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium leading-none">
                  Gestión y Control de Caja Menor
                </span>
              </div>
            </div>

            {/* Período Activo Pill */}
            <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Período: <strong className="text-slate-900">{currentPeriod.name}</strong></span>
              <span className={`w-2 h-2 rounded-full ${currentPeriod.status === 'ABIERTO' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
          </div>

          {/* Saldo Permanente & Perfil */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Saldo Disponible en Caja Física (Permanente) */}
            <div className="relative">
              <button
                onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-xl transition-all shadow-xs group"
                title="Haga clic para ver el desglose en tiempo real"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-emerald-700 font-bold leading-tight">
                    Saldo Disponible
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-800 font-mono-numbers">
                    {formatCOP(metrics.availableCashBalance, true)}
                  </span>
                </div>
                <Info className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform ml-1" />
              </button>

              {/* Popover con desglose instantáneo */}
              {showBalanceDetails && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="font-bold text-slate-900 text-sm">Estado Financiero en Vivo</span>
                    <button onClick={() => setShowBalanceDetails(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Fondo Inicial:</span>
                      <strong className="text-slate-900">{formatCOP(metrics.initialFund)}</strong>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Anticipos en calle:</span>
                      <strong>- {formatCOP(metrics.pendingLegalizationAmount)}</strong>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>Gastos legalizados:</span>
                      <strong>- {formatCOP(metrics.totalSpent)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Devoluciones recibidas:</span>
                      <strong>+ {formatCOP(metrics.totalReturned)}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Efectivo en Caja:</span>
                      <span className="text-emerald-700">{formatCOP(metrics.availableCashBalance)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selector de Usuario / Rol */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                    {currentUser.department}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Menú desplegable para alternar rol */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Cambiar de Usuario (Simular Rol)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Pruebe las funciones según el perfil
                    </p>
                  </div>
                  <div className="py-1 space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          u.id === currentUser.id 
                            ? 'bg-slate-900 text-white font-medium' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="w-7 h-7 rounded-full object-cover shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{u.name}</p>
                          <p className={`text-[10px] truncate ${u.id === currentUser.id ? 'text-slate-300' : 'text-slate-500'}`}>
                            {u.role === 'ADMIN' ? 'Administrador' : u.role === 'RESPONSABLE' ? 'Responsable Caja' : 'Solicitante'} • {u.department}
                          </p>
                        </div>
                        {u.id === currentUser.id && (
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
