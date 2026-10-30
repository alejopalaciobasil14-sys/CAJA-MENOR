import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  User, 
  CajaPeriod, 
  PettyCashRequest, 
  CajaFinancialMetrics, 
  GastoConcepto,
  DeliveryInfo,
  LegalizationInfo 
} from '../types';
import { INITIAL_USERS, INITIAL_PERIOD, INITIAL_REQUESTS } from '../data/seedData';
import { generateRequestCode, generateVoucherNumber } from '../utils/formatters';

const STORAGE_KEY = 'cajacontrol_storage_v1';

interface CreateRequestParams {
  applicantId: string;
  applicantName: string;
  department: string;
  concept: GastoConcepto;
  customConcept?: string;
  justification: string;
  requestedAmount: number;
  authorizedBy: string;
}

interface ApproveAndDeliverParams {
  requestId: string;
  deliveredAmount: number;
  receivedByName: string;
  conceptConfirmed: string;
}

interface LegalizeParams {
  requestId: string;
  invoiceNumber: string;
  supplierName: string;
  supplierNit?: string;
  invoiceDate: string;
  actualSpentAmount: number;
  observations?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  autoVerify?: boolean;
}

interface CajaMenorContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  currentPeriod: CajaPeriod;
  closedPeriods: CajaPeriod[];
  requests: PettyCashRequest[];
  metrics: CajaFinancialMetrics;
  // Acciones
  createRequest: (params: CreateRequestParams) => { success: boolean; message: string; request?: PettyCashRequest };
  approveAndDeliver: (params: ApproveAndDeliverParams) => { success: boolean; message: string };
  rejectRequest: (requestId: string, reason: string) => { success: boolean; message: string };
  submitLegalization: (params: LegalizeParams) => { success: boolean; message: string };
  verifyLegalization: (requestId: string) => { success: boolean; message: string };
  closePeriod: (notes: string) => { success: boolean; message: string };
  openNewPeriod: (name: string, initialFund?: number) => { success: boolean; message: string };
  resetData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => { success: boolean; message: string };
}

const CajaMenorContext = createContext<CajaMenorContextType | undefined>(undefined);

export const CajaMenorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicialización desde localStorage o valores por defecto
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = INITIAL_USERS.find(u => u.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // Fallback
    }
    // Por defecto: Camila Morales (Responsable)
    return INITIAL_USERS[0];
  });

  const [currentPeriod, setCurrentPeriod] = useState<CajaPeriod>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_period`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PERIOD;
  });

  const [closedPeriods, setClosedPeriods] = useState<CajaPeriod[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_closed_periods`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [requests, setRequests] = useState<PettyCashRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REQUESTS;
  });

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_period`, JSON.stringify(currentPeriod));
  }, [currentPeriod]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_closed_periods`, JSON.stringify(closedPeriods));
  }, [closedPeriods]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
  }, [requests]);

  // Cálculo reactivo de métricas financieras
  const metrics: CajaFinancialMetrics = useMemo(() => {
    const periodRequests = requests.filter(r => r.periodId === currentPeriod.id);
    const initialFund = currentPeriod.initialFund || 2000000;

    let totalDelivered = 0;
    let totalSpent = 0;
    let totalReturned = 0;
    let pendingLegalizationAmount = 0;

    let pendingRequestsCount = 0;
    let deliveredPendingCount = 0;
    let legalizedCount = 0;
    let rejectedCount = 0;

    periodRequests.forEach(req => {
      if (req.status === 'PENDIENTE') {
        pendingRequestsCount++;
      } else if (req.status === 'RECHAZADA') {
        rejectedCount++;
      } else if (req.status === 'APROBADA_ENTREGADA') {
        deliveredPendingCount++;
        const delivered = req.deliveryInfo?.deliveredAmount || 0;
        totalDelivered += delivered;
        pendingLegalizationAmount += delivered;
      } else if (req.status === 'LEGALIZADA') {
        legalizedCount++;
        const delivered = req.deliveryInfo?.deliveredAmount || 0;
        totalDelivered += delivered;
        
        if (req.legalizationInfo && req.legalizationInfo.isVerified) {
          totalSpent += req.legalizationInfo.actualSpentAmount || 0;
          totalReturned += req.legalizationInfo.returnedAmount || 0;
        }
      }
    });

    // Saldo disponible en efectivo real en caja física:
    // Saldo Inicial - Total Entregado + Total Devoluciones Recibidas
    const availableCashBalance = Math.max(0, initialFund - totalDelivered + totalReturned);
    const budgetExecutionPercentage = initialFund > 0 ? (totalSpent / initialFund) * 100 : 0;

    return {
      initialFund,
      totalDelivered,
      totalSpent,
      totalReturned,
      pendingLegalizationAmount,
      availableCashBalance,
      budgetExecutionPercentage: Math.min(100, budgetExecutionPercentage),
      totalRequestsCount: periodRequests.length,
      pendingRequestsCount,
      deliveredPendingCount,
      legalizedCount,
      rejectedCount
    };
  }, [requests, currentPeriod]);

  // 1. Crear Solicitud (Mañana)
  const createRequest = (params: CreateRequestParams) => {
    if (currentPeriod.status === 'CERRADO') {
      return { success: false, message: 'El período actual de caja menor está cerrado. Debe abrir un nuevo período.' };
    }

    if (params.requestedAmount <= 0) {
      return { success: false, message: 'El valor solicitado debe ser mayor a cero pesos.' };
    }

    if (params.requestedAmount > metrics.availableCashBalance) {
      return { 
        success: false, 
        message: `El valor solicitado excede el saldo disponible actual en caja (${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(metrics.availableCashBalance)}).` 
      };
    }

    const nextIndex = requests.length + 1;
    const newCode = generateRequestCode(nextIndex, currentPeriod.year);
    const nowIso = new Date().toISOString();

    const newRequest: PettyCashRequest = {
      id: `req-${Date.now()}`,
      code: newCode,
      periodId: currentPeriod.id,
      applicantId: params.applicantId,
      applicantName: params.applicantName,
      department: params.department,
      createdAt: nowIso,
      concept: params.concept,
      customConcept: params.customConcept,
      justification: params.justification,
      requestedAmount: params.requestedAmount,
      authorizedBy: params.authorizedBy || 'Encargado de Caja Menor',
      status: 'PENDIENTE',
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser.name,
          action: 'CREACION_SOLICITUD',
          details: `Solicitud registrada por ${params.applicantName} por valor de ${params.requestedAmount} COP.`
        }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);
    return { success: true, message: `Solicitud ${newCode} registrada exitosamente.`, request: newRequest };
  };

  // 2. Aprobar y Entregar Dinero
  const approveAndDeliver = (params: ApproveAndDeliverParams) => {
    if (currentUser.role === 'SOLICITANTE') {
      return { success: false, message: 'No tiene permisos para autorizar o entregar dinero de caja menor.' };
    }

    const target = requests.find(r => r.id === params.requestId);
    if (!target) return { success: false, message: 'Solicitud no encontrada.' };
    if (target.status !== 'PENDIENTE') {
      return { success: false, message: `La solicitud no está pendiente (estado actual: ${target.status}).` };
    }

    if (params.deliveredAmount > metrics.availableCashBalance) {
      return { success: false, message: 'El monto a entregar excede el efectivo disponible en caja.' };
    }

    const nowIso = new Date().toISOString();
    const balanceAfter = metrics.availableCashBalance - params.deliveredAmount;
    const voucherNumber = generateVoucherNumber(requests.filter(r => !!r.deliveryInfo).length + 1);

    const deliveryInfo: DeliveryInfo = {
      deliveredAmount: params.deliveredAmount,
      deliveredAt: nowIso,
      receivedByName: params.receivedByName,
      conceptConfirmed: params.conceptConfirmed || target.concept,
      balanceAfterDelivery: balanceAfter,
      registeredBy: currentUser.name,
      voucherNumber
    };

    setRequests(prev => prev.map(r => {
      if (r.id !== params.requestId) return r;
      return {
        ...r,
        status: 'APROBADA_ENTREGADA',
        deliveryInfo,
        auditLog: [
          ...r.auditLog,
          {
            id: `aud-${Date.now()}`,
            timestamp: nowIso,
            user: currentUser.name,
            action: 'APROBACION_Y_ENTREGA',
            details: `Se entregaron $${params.deliveredAmount} COP a ${params.receivedByName} (Comprobante: ${voucherNumber}).`
          }
        ]
      };
    }));

    return { success: true, message: `Dinero entregado exitosamente. Vale ${voucherNumber} generado.` };
  };

  // 3. Rechazar Solicitud
  const rejectRequest = (requestId: string, reason: string) => {
    if (currentUser.role === 'SOLICITANTE') {
      return { success: false, message: 'No tiene permisos para rechazar solicitudes de caja menor.' };
    }

    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'RECHAZADA',
        rejectionReason: reason,
        auditLog: [
          ...r.auditLog,
          {
            id: `aud-${Date.now()}`,
            timestamp: nowIso,
            user: currentUser.name,
            action: 'RECHAZO_SOLICITUD',
            details: `Solicitud rechazada. Motivo: ${reason}`
          }
        ]
      };
    }));

    return { success: true, message: 'Solicitud rechazada correctamente.' };
  };

  // 4. Legalizar Gastos (Tarde)
  const submitLegalization = (params: LegalizeParams) => {
    const target = requests.find(r => r.id === params.requestId);
    if (!target) return { success: false, message: 'Solicitud no encontrada.' };
    if (target.status !== 'APROBADA_ENTREGADA') {
      return { success: false, message: 'Solo las solicitudes con dinero entregado pueden legalizarse.' };
    }

    const deliveredAmount = target.deliveryInfo?.deliveredAmount || 0;
    const actualSpent = params.actualSpentAmount;
    
    // Cálculo institucional: Dinero entregado - Gasto realizado = Dinero devuelto
    const returnedAmount = deliveredAmount - actualSpent;

    const nowIso = new Date().toISOString();
    // Si el usuario actual es Responsable o Admin, o se marca autoVerify, queda verificada inmediatamente
    const isAutoVerified = params.autoVerify || currentUser.role !== 'SOLICITANTE';

    const legalizationInfo: LegalizationInfo = {
      invoiceNumber: params.invoiceNumber,
      supplierName: params.supplierName,
      supplierNit: params.supplierNit,
      invoiceDate: params.invoiceDate,
      actualSpentAmount: actualSpent,
      returnedAmount: returnedAmount,
      observations: params.observations,
      attachmentName: params.attachmentName,
      attachmentDataUrl: params.attachmentDataUrl,
      legalizedAt: nowIso,
      verifiedBy: isAutoVerified ? currentUser.name : '',
      isVerified: isAutoVerified
    };

    setRequests(prev => prev.map(r => {
      if (r.id !== params.requestId) return r;
      return {
        ...r,
        status: isAutoVerified ? 'LEGALIZADA' : 'APROBADA_ENTREGADA',
        legalizationInfo,
        auditLog: [
          ...r.auditLog,
          {
            id: `aud-${Date.now()}`,
            timestamp: nowIso,
            user: currentUser.name,
            action: isAutoVerified ? 'LEGALIZACION_Y_CIERRE' : 'REGISTRO_LEGALIZACION',
            details: `Factura ${params.invoiceNumber} por $${actualSpent} COP. Devolución de dinero: $${returnedAmount} COP. Estado: ${isAutoVerified ? 'Legalizada y Verificada' : 'Pendiente de verificación'}`
          }
        ]
      };
    }));

    return { 
      success: true, 
      message: `Legalización guardada. Gasto: $${actualSpent} COP | Devolución: $${returnedAmount} COP.` 
    };
  };

  // 5. Verificar y Cerrar Legalización
  const verifyLegalization = (requestId: string) => {
    if (currentUser.role === 'SOLICITANTE') {
      return { success: false, message: 'Solo el Responsable o Administrador pueden verificar facturas y devoluciones.' };
    }

    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      if (!r.legalizationInfo) return r;

      return {
        ...r,
        status: 'LEGALIZADA',
        legalizationInfo: {
          ...r.legalizationInfo,
          isVerified: true,
          verifiedBy: currentUser.name
        },
        auditLog: [
          ...r.auditLog,
          {
            id: `aud-${Date.now()}`,
            timestamp: nowIso,
            user: currentUser.name,
            action: 'VERIFICACION_COMPROBANTE',
            details: `Soporte verificado y cerrada por ${currentUser.name}. Devolución ingresada a caja.`
          }
        ]
      };
    }));

    return { success: true, message: 'Soporte y devolución verificados con éxito. Solicitud cerrada.' };
  };

  // 6. Cierre Mensual
  const closePeriod = (notes: string) => {
    if (currentUser.role === 'SOLICITANTE') {
      return { success: false, message: 'No tiene permisos para efectuar el cierre mensual de caja menor.' };
    }

    const openAdvances = requests.filter(r => r.periodId === currentPeriod.id && r.status === 'APROBADA_ENTREGADA');
    if (openAdvances.length > 0) {
      return { 
        success: false, 
        message: `No se puede cerrar el mes: Existen ${openAdvances.length} anticipos entregados sin legalizar. Todos los gastos deben estar legalizados antes del cierre.` 
      };
    }

    const pendingRequests = requests.filter(r => r.periodId === currentPeriod.id && r.status === 'PENDIENTE');
    if (pendingRequests.length > 0) {
      return {
        success: false,
        message: `Existen ${pendingRequests.length} solicitudes pendientes de responder. Debe aprobarlas o rechazarlas antes de cerrar.`
      };
    }

    const nowIso = new Date().toISOString();
    const updatedPeriod: CajaPeriod = {
      ...currentPeriod,
      status: 'CERRADO',
      endDate: nowIso,
      closedBy: currentUser.name,
      closedAt: nowIso,
      closingNotes: notes,
      finalBalance: metrics.availableCashBalance,
      totalDelivered: metrics.totalDelivered,
      totalSpent: metrics.totalSpent,
      totalReturned: metrics.totalReturned
    };

    setCurrentPeriod(updatedPeriod);
    setClosedPeriods(prev => [updatedPeriod, ...prev]);

    return { success: true, message: `Período ${currentPeriod.name} cerrado satisfactoriamente.` };
  };

  // 7. Apertura de Nuevo Periodo
  const openNewPeriod = (name: string, initialFund: number = 2000000) => {
    if (currentUser.role === 'SOLICITANTE') {
      return { success: false, message: 'No tiene permisos para registrar la apertura de caja menor.' };
    }

    const nowIso = new Date().toISOString();
    const newPeriod: CajaPeriod = {
      id: `per-${Date.now()}`,
      name,
      year: new Date().getFullYear(),
      monthIndex: new Date().getMonth(),
      startDate: nowIso,
      initialFund,
      status: 'ABIERTO',
      openedBy: currentUser.name,
      openedAt: nowIso
    };

    setCurrentPeriod(newPeriod);
    return { success: true, message: `Apertura del nuevo período "${name}" registrada con fondo de $${initialFund} COP.` };
  };

  // Reiniciar datos a los de demostración
  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_period`);
    localStorage.removeItem(`${STORAGE_KEY}_closed_periods`);
    localStorage.removeItem(`${STORAGE_KEY}_requests`);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentPeriod(INITIAL_PERIOD);
    setClosedPeriods([]);
    setRequests(INITIAL_REQUESTS);
  };

  // Exportar base de datos a JSON
  const exportDatabaseJSON = () => {
    const backup = {
      currentPeriod,
      closedPeriods,
      requests,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(backup, null, 2);
  };

  // Importar base de datos desde JSON
  const importDatabaseJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.currentPeriod && Array.isArray(data.requests)) {
        setCurrentPeriod(data.currentPeriod);
        setClosedPeriods(data.closedPeriods || []);
        setRequests(data.requests);
        return { success: true, message: 'Datos importados correctamente.' };
      }
      return { success: false, message: 'El archivo JSON no tiene la estructura requerida.' };
    } catch {
      return { success: false, message: 'Error al interpretar el archivo JSON.' };
    }
  };

  return (
    <CajaMenorContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        currentPeriod,
        closedPeriods,
        requests,
        metrics,
        createRequest,
        approveAndDeliver,
        rejectRequest,
        submitLegalization,
        verifyLegalization,
        closePeriod,
        openNewPeriod,
        resetData,
        exportDatabaseJSON,
        importDatabaseJSON
      }}
    >
      {children}
    </CajaMenorContext.Provider>
  );
};

export const useCajaMenor = () => {
  const context = useContext(CajaMenorContext);
  if (!context) {
    throw new Error('useCajaMenor debe utilizarse dentro de un CajaMenorProvider');
  }
  return context;
};
