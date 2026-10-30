import React, { useState } from 'react';
import { 
  BookOpen, 
  Printer, 
  Search, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ManualSection {
  id: number;
  title: string;
  content: string[];
}

const SECTIONS: ManualSection[] = [
  {
    id: 1,
    title: '1. Objetivo de la plataforma',
    content: [
      'La Plataforma de Gestión y Control de Caja Menor (CajaControl) es una solución administrativa integral orientada a supervisar, transparentar y controlar el fondo fijo de $2.000.000 COP asignado mensualmente.',
      'Su propósito es eliminar planillas manuales, prevenir pérdidas o descuadres económicos, y garantizar que cada peso entregado en la mañana sea debidamente soportado en la tarde con su factura legal y la devolución del dinero sobrante correspondiente.'
    ]
  },
  {
    id: 2,
    title: '2. Requisitos para utilizarla',
    content: [
      'Navegador web moderno: Compatible con Google Chrome, Microsoft Edge, Mozilla Firefox o Safari.',
      'Dispositivo: Computador de escritorio, portátil, tablet o teléfono inteligente con acceso a la red de la empresa.',
      'Soportes tributarios: Facturas electrónicas con código CUFE, tiquetes POS o recibos autorizados que contengan NIT, razón social y detalle del gasto.',
      'Perfil de usuario: Estar asignado en la nómina como Administrador, Responsable de Caja Menor o Solicitante.'
    ]
  },
  {
    id: 3,
    title: '3. Cómo ingresar al sistema',
    content: [
      'Abra el enlace institucional de la plataforma en su navegador.',
      'En la esquina superior derecha encontrará el selector de perfil de usuario activo.',
      'Puede alternar entre Administrador (supervisión y configuración), Responsable (cajero operativo) y Solicitante (empleados que requieren recursos).',
      'El sistema no requiere contraseñas complejas para fines operativos internos y conserva todos los registros persistentes en su navegador.'
    ]
  },
  {
    id: 4,
    title: '4. Descripción de cada módulo',
    content: [
      'Panel Principal (Dashboard): Visión global de los $2.000.000 COP, saldo disponible en vivo, porcentaje de consumo, alertas de solicitudes y gráficos de gasto.',
      'Solicitudes (Paso 2): Formulario para radicar requerimientos matutinos con fecha, departamento, concepto y valor solicitado.',
      'Entregas de Dinero (Paso 3): Bandeja del cajero para evaluar, aprobar o rechazar y generar el Vale o Comprobante de Egreso.',
      'Legalizaciones (Paso 4 y 5): Registro vespertino de facturas con cálculo automático: Dinero Entregado - Gasto Real = Dinero Devuelto.',
      'Arqueo Diario (Paso 6): Calculadora de billetes y monedas colombianas para cotejar el efectivo físico con el saldo contable.',
      'Informes de Consumo: 10 reportes especializados con filtros avanzados y exportación a Excel (.xlsx) y PDF.',
      'Cierre Mensual (Paso 7): Verificación de liquidación de anticipos y apertura del nuevo ciclo con $2.000.000 COP.'
    ]
  },
  {
    id: 5,
    title: '5. Cómo registrar una solicitud (Paso a paso)',
    content: [
      'Paso 1: Haga clic en "+ Nueva Solicitud (Mañana)" en el Panel Principal o en el módulo Solicitudes.',
      'Paso 2: Seleccione el solicitante y su departamento (Operaciones, Contabilidad, etc.).',
      'Paso 3: Elija el concepto del gasto (Transporte, Papelería, Refrigerios, Mantenimiento, etc.).',
      'Paso 4: Ingrese la justificación clara del requerimiento.',
      'Paso 5: Especifique el valor en COP (el sistema valida que no exceda el saldo disponible).',
      'Paso 6: Presione "Radicar Solicitud". Quedará en estado "Pendiente".'
    ]
  },
  {
    id: 6,
    title: '6. Cómo aprobar y entregar dinero',
    content: [
      'El Responsable de Caja Menor ingresa a "Aprobación y Entrega".',
      'Revisa la lista de requerimientos pendientes y presiona "Aprobar y Entregar" (o "Rechazar" indicando el motivo).',
      'Confirma el valor a desembolsar en efectivo y el nombre de quien recibe.',
      'El sistema calcula automáticamente el nuevo saldo que quedará en la caja.',
      'Al confirmar, se descuenta el dinero y se genera el Comprobante de Entrega en PDF con espacio para firmas.'
    ]
  },
  {
    id: 7,
    title: '7. Cómo registrar facturas y devoluciones (Fórmula institucional)',
    content: [
      'Al terminar la diligencia o jornada, el empleado acude a legalizar.',
      'Se abre la solicitud en "Legalizaciones" y se digita: Factura N°, Proveedor, NIT y Fecha.',
      'Se ingresa el "Valor Realmente Gastado".',
      'El sistema calcula inmediatamente: Dinero Entregado - Gasto Real = Dinero Devuelto a Caja.',
      'Ejemplo oficial: Dinero entregado: $100.000. Gasto realizado: $75.000. Dinero devuelto: $25.000 COP.',
      'Se adjunta la imagen o PDF de la factura y se guarda. El responsable verifica el dinero físico devuelto y cierra la solicitud.'
    ]
  },
  {
    id: 8,
    title: '8. Cómo consultar los saldos',
    content: [
      'En la barra superior permanente se visualiza el saldo en efectivo disponible en todo momento.',
      'Al hacer clic en el botón de saldo, se despliega el desglose instantáneo: Fondo Inicial, Anticipos en calle, Gastos legalizados y Devoluciones recibidas.',
      'En el Panel Principal se muestran las 8 tarjetas analíticas con totales consolidados.'
    ]
  },
  {
    id: 9,
    title: '9. Cómo generar informes',
    content: [
      'Acceda al módulo "Informes de Consumo".',
      'Seleccione entre los 10 informes requeridos: Diario de movimientos, Semanal de gastos, Mensual de consumo, Por solicitante, Por departamento, Por concepto, Aprobadas/Rechazadas, Facturas pendientes/legalizadas, Devoluciones, y Saldo/Ejecución.',
      'Aplique filtros por rango de fechas, trabajador, departamento o categoría de gasto.',
      'Presione "Exportar a Excel (.xlsx)" para un archivo estructurado o "Descargar PDF" para un informe membretado oficial.'
    ]
  },
  {
    id: 10,
    title: '10. Cómo realizar el cierre mensual',
    content: [
      'Al finalizar el mes, acceda a "Cierre Mensual".',
      'Verifique que la lista de chequeo esté en verde (cero solicitudes pendientes y cero anticipos sin legalizar).',
      'Descargue el "Acta de Cierre Mensual (PDF)".',
      'Presione "Efectuar Cierre Mensual".',
      'Presione "Apertura de Nuevo Período", confirmando el nuevo fondo de $2.000.000 COP para el nuevo mes.'
    ]
  },
  {
    id: 11,
    title: '11. Descripción de los roles y permisos',
    content: [
      'Administrador: Supervisión total, configuración, gestión de usuarios, auditoría completa y exportación de reportes.',
      'Responsable de Caja Menor: Registro de apertura, aprobación y entrega de dinero, verificación de facturas, recepción de devoluciones, arqueo diario y cierres.',
      'Solicitante: Trabajador autorizado que radica solicitudes matutinas y legaliza sus propios gastos en la tarde con sus soportes.'
    ]
  },
  {
    id: 12,
    title: '12. Solución de problemas frecuentes',
    content: [
      '¿Por qué dice "Saldo insuficiente"? El monto solicitado supera el efectivo libre en caja. Espere a que se legalicen anticipos o tramite una reposición de fondos.',
      '¿Por qué no puedo cerrar el mes? Existen anticipos entregados sin legalizar. Todos los empleados deben entregar sus facturas y vueltas antes de cerrar.',
      '¿Se borran mis datos al cerrar la pestaña? No, los datos son persistentes en el almacenamiento local. Adicionalmente puede descargar copias de respaldo en JSON en la sección Usuarios.'
    ]
  }
];

export const ManualUsuarioView: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = SECTIONS.filter(s => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchTitle = s.title.toLowerCase().includes(q);
    const matchContent = s.content.some(c => c.toLowerCase().includes(q));
    return matchTitle || matchContent;
  });

  const activeSection = SECTIONS.find(s => s.id === activeSectionId) || SECTIONS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Documentación Oficial
            </span>
            <span className="text-xs text-slate-500 font-medium">Archivo físico: /MANUAL_DE_USUARIO.md</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manual de Usuario - Plataforma CajaControl
          </h1>
          <p className="text-xs text-slate-600">
            Guía de referencia rápida y detallada para todos los colaboradores y encargados de caja menor.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          Imprimir Manual Completo
        </button>
      </div>

      {/* Buscador de capítulos */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar dentro del manual de usuario (ej. fórmula, cierre, facturas, roles)..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Disposición de 2 columnas: Índice a la izquierda y Contenido a la derecha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Índice de Capítulos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1 text-xs">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Capítulos del Manual (12 Puntos)
          </p>
          <div className="space-y-1">
            {filteredSections.map(sec => {
              const isSelected = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido del Capítulo Activo */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Capítulo {activeSection.id} de 12
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              {activeSection.title}
            </h2>
          </div>

          <div className="space-y-3 text-slate-700 text-xs leading-relaxed">
            {activeSection.content.map((paragraph, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-medium">{paragraph}</p>
              </div>
            ))}
          </div>

          {/* Navegación al siguiente capítulo */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            {activeSection.id > 1 ? (
              <button
                onClick={() => setActiveSectionId(activeSection.id - 1)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold"
              >
                ← Anterior
              </button>
            ) : <span />}

            {activeSection.id < 12 && (
              <button
                onClick={() => setActiveSectionId(activeSection.id + 1)}
                className="flex items-center gap-1 px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Siguiente Capítulo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
