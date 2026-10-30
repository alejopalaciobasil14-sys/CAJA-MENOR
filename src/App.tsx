/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CajaMenorProvider } from './context/CajaMenorContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { SolicitudesView } from './components/solicitudes/SolicitudesView';
import { EntregasView } from './components/entregas/EntregasView';
import { LegalizacionesView } from './components/legalizaciones/LegalizacionesView';
import { ArqueoDiarioView } from './components/arqueo/ArqueoDiarioView';
import { InformesView } from './components/informes/InformesView';
import { CierreMensualView } from './components/cierre/CierreMensualView';
import { UsuariosView } from './components/usuarios/UsuariosView';
import { ManualUsuarioView } from './components/manual/ManualUsuarioView';
import { NewRequestModal } from './components/solicitudes/NewRequestModal';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalNewRequestModalOpen, setIsGlobalNewRequestModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Barra Superior Permanente */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Menú Lateral */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Contenido Principal de las Vistas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewRequest={() => setIsGlobalNewRequestModalOpen(true)}
            />
          )}

          {activeTab === 'solicitudes' && <SolicitudesView />}
          {activeTab === 'entregas' && <EntregasView />}
          {activeTab === 'legalizaciones' && <LegalizacionesView />}
          {activeTab === 'arqueo' && <ArqueoDiarioView />}
          {activeTab === 'informes' && <InformesView />}
          {activeTab === 'cierre' && <CierreMensualView />}
          {activeTab === 'usuarios' && <UsuariosView />}
          {activeTab === 'manual' && <ManualUsuarioView />}
        </main>

      </div>

      {/* Modal Global para Nueva Solicitud */}
      <NewRequestModal
        isOpen={isGlobalNewRequestModalOpen}
        onClose={() => setIsGlobalNewRequestModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <CajaMenorProvider>
      <MainLayout />
    </CajaMenorProvider>
  );
}
