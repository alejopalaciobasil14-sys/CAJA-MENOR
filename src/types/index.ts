/**
 * Tipos de datos para la Plataforma de Gestión y Control de Caja Menor
 */

export type UserRole = 'ADMIN' | 'RESPONSABLE' | 'SOLICITANTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
}

export type RequestStatus = 
  | 'PENDIENTE'            // Solicitada en la mañana, pendiente de revisión
  | 'RECHAZADA'            // Rechazada con justificación
  | 'APROBADA_ENTREGADA'   // Dinero entregado en efectivo, pendiente de legalización
  | 'LEGALIZADA';          // Factura y devolución verificadas y cerradas

export type GastoConcepto = 
  | 'Transporte y Taxis'
  | 'Papelería y Útiles de Oficina'
  | 'Alimentación y Refrigerios'
  | 'Mensajería y Envíos'
  | 'Mantenimiento Menor e Instalaciones'
  | 'Imprevistos Operativos'
  | 'Elementos de Aseo y Cafetería'
  | 'Fotocopias y Trámites Notariales'
  | 'Otro';

export interface DeliveryInfo {
  deliveredAmount: number;
  deliveredAt: string; // ISO string
  receivedByName: string;
  conceptConfirmed: string;
  balanceAfterDelivery: number;
  registeredBy: string;
  voucherNumber: string;
}

export interface LegalizationInfo {
  invoiceNumber: string;
  supplierName: string;
  supplierNit?: string;
  invoiceDate: string;
  actualSpentAmount: number;
  returnedAmount: number; // Entregado - Gastado
  observations?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  legalizedAt: string;
  verifiedBy: string;
  isVerified: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface PettyCashRequest {
  id: string;
  code: string; // e.g. CM-2026-001
  periodId: string;
  applicantId: string;
  applicantName: string;
  department: string;
  createdAt: string;
  concept: GastoConcepto;
  customConcept?: string;
  justification: string;
  requestedAmount: number; // COP
  authorizedBy: string;
  status: RequestStatus;
  rejectionReason?: string;
  deliveryInfo?: DeliveryInfo;
  legalizationInfo?: LegalizationInfo;
  auditLog: AuditEntry[];
}

export interface CajaPeriod {
  id: string;
  name: string; // e.g. "Octubre 2026"
  year: number;
  monthIndex: number; // 0-11
  startDate: string;
  endDate?: string;
  initialFund: number; // Default 2.000.000 COP
  status: 'ABIERTO' | 'CERRADO';
  openedBy: string;
  openedAt: string;
  closedBy?: string;
  closedAt?: string;
  closingNotes?: string;
  finalBalance?: number;
  totalDelivered?: number;
  totalSpent?: number;
  totalReturned?: number;
}

export interface ArqueoDenomination {
  value: number;
  type: 'billete' | 'moneda';
  label: string;
  count: number;
}

export interface ArqueoRecord {
  id: string;
  date: string;
  responsibleName: string;
  items: ArqueoDenomination[];
  totalCashCounted: number;
  theoreticalCash: number;
  difference: number; // counted - theoretical
  notes?: string;
}

export interface CajaFinancialMetrics {
  initialFund: number;
  totalDelivered: number;
  totalSpent: number;
  totalReturned: number;
  pendingLegalizationAmount: number;
  availableCashBalance: number;
  budgetExecutionPercentage: number;
  totalRequestsCount: number;
  pendingRequestsCount: number;
  deliveredPendingCount: number;
  legalizedCount: number;
  rejectedCount: number;
}
