import { User, CajaPeriod, PettyCashRequest } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Camila Morales',
    email: 'cajamenor@empresa.com.co',
    role: 'RESPONSABLE',
    department: 'Tesorería y Caja',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+57 312 456 7890'
  },
  {
    id: 'usr-2',
    name: 'David Arboleda',
    email: 'administrador@empresa.com.co',
    role: 'ADMIN',
    department: 'Dirección Administrativa',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '+57 300 123 4567'
  },
  {
    id: 'usr-3',
    name: 'Carlos Gómez',
    email: 'carlos.gomez@empresa.com.co',
    role: 'SOLICITANTE',
    department: 'Operaciones y Logística',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+57 315 987 6543'
  },
  {
    id: 'usr-4',
    name: 'María Fernanda Soto',
    email: 'maria.soto@empresa.com.co',
    role: 'SOLICITANTE',
    department: 'Contabilidad y Finanzas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+57 318 654 3210'
  },
  {
    id: 'usr-5',
    name: 'Jorge Rodríguez',
    email: 'jorge.rodriguez@empresa.com.co',
    role: 'SOLICITANTE',
    department: 'Mantenimiento e Instalaciones',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+57 320 111 2233'
  }
];

export const INITIAL_PERIOD: CajaPeriod = {
  id: 'per-2026-10',
  name: 'Octubre 2026',
  year: 2026,
  monthIndex: 9,
  startDate: '2026-10-01T08:00:00.000Z',
  initialFund: 2000000, // $2.000.000 COP
  status: 'ABIERTO',
  openedBy: 'Camila Morales (Responsable de Caja)',
  openedAt: '2026-10-01T08:00:00.000Z',
};

// Generador de factura de muestra en SVG codificado como DataURL
function createSampleInvoiceDataUrl(invoiceNum: string, amount: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520" fill="none">
    <rect width="400" height="520" fill="#ffffff" rx="8" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="20" y="20" width="360" height="60" fill="#0f172a" rx="4"/>
    <text x="200" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">FACTURA ELECTRÓNICA DE VENTA</text>
    <text x="200" y="65" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">N° ${invoiceNum} | RÉGIMEN COMÚN</text>
    
    <text x="30" y="110" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">PROVEEDOR AUTORIZADO S.A.S.</text>
    <text x="30" y="128" font-family="sans-serif" font-size="10" fill="#64748b">NIT: 901.458.332-1 | Bogotá D.C.</text>
    <text x="30" y="144" font-family="sans-serif" font-size="10" fill="#64748b">Resolución DIAN N° 1876400039281</text>
    
    <line x1="30" y1="160" x2="370" y2="160" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4"/>
    
    <text x="30" y="185" font-family="sans-serif" font-size="11" fill="#475569">Descripción del Servicio / Producto:</text>
    <text x="30" y="205" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f172a">Insumos y Gastos Operativos Caja Menor</text>
    
    <rect x="30" y="230" width="340" height="90" fill="#f8fafc" rx="4" stroke="#e2e8f0"/>
    <text x="45" y="260" font-family="sans-serif" font-size="11" fill="#64748b">Subtotal Gravable:</text>
    <text x="355" y="260" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="end">${amount}</text>
    
    <text x="45" y="285" font-family="sans-serif" font-size="11" fill="#64748b">IVA (0% / Exento):</text>
    <text x="355" y="285" font-family="sans-serif" font-size="11" fill="#1e293b" text-anchor="end">$ 0</text>
    
    <line x1="45" y1="298" x2="355" y2="298" stroke="#cbd5e1"/>
    <text x="45" y="315" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">TOTAL PAGADO:</text>
    <text x="355" y="315" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0d9488" text-anchor="end">${amount}</text>
    
    <rect x="30" y="340" width="340" height="70" fill="#ecfdf5" rx="4" stroke="#a7f3d0"/>
    <text x="200" y="365" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">SOPORTE LEGALIZADO Y VERIFICADO</text>
    <text x="200" y="385" font-family="sans-serif" font-size="9" fill="#047857" text-anchor="middle">Cumple con los requisitos para reembolso de caja menor</text>
    
    <text x="200" y="470" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">CUFE: a7f8e3291...384c9b0e1 | DIAN COLOMBIA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_REQUESTS: PettyCashRequest[] = [
  // 1. Legalizada (Ejemplo del enunciado: $100.000 entregado - $75.000 gastado = $25.000 devuelto)
  {
    id: 'req-001',
    code: 'CM-2026-001',
    periodId: 'per-2026-10',
    applicantId: 'usr-3',
    applicantName: 'Carlos Gómez',
    department: 'Operaciones y Logística',
    createdAt: '2026-10-06T08:30:00.000Z',
    concept: 'Papelería y Útiles de Oficina',
    justification: 'Compra de carpetas de archivo, resmas de papel para despachos y marcadores industriales.',
    requestedAmount: 100000,
    authorizedBy: 'Camila Morales',
    status: 'LEGALIZADA',
    deliveryInfo: {
      deliveredAmount: 100000,
      deliveredAt: '2026-10-06T09:15:00.000Z',
      receivedByName: 'Carlos Gómez',
      conceptConfirmed: 'Papelería y Útiles de Oficina',
      balanceAfterDelivery: 1900000,
      registeredBy: 'Camila Morales',
      voucherNumber: 'EG-0001'
    },
    legalizationInfo: {
      invoiceNumber: 'FAC-89210',
      supplierName: 'Papelería Panamericana S.A.',
      supplierNit: '860.003.456-2',
      invoiceDate: '2026-10-06',
      actualSpentAmount: 75000,
      returnedAmount: 25000, // 100.000 - 75.000 = 25.000
      observations: 'Se consiguieron descuentos corporativos. Se reintegran $25.000 en billetes a caja.',
      attachmentName: 'Factura_Panamericana_89210.pdf',
      attachmentDataUrl: createSampleInvoiceDataUrl('FAC-89210', '$ 75.000'),
      legalizedAt: '2026-10-06T16:40:00.000Z',
      verifiedBy: 'Camila Morales',
      isVerified: true
    },
    auditLog: [
      { id: 'aud-1', timestamp: '2026-10-06T08:30:00.000Z', user: 'Carlos Gómez', action: 'CREACION', details: 'Solicitud radicada por $100.000 COP' },
      { id: 'aud-2', timestamp: '2026-10-06T09:15:00.000Z', user: 'Camila Morales', action: 'ENTREGA', details: 'Aprobación y entrega de $100.000 en efectivo' },
      { id: 'aud-3', timestamp: '2026-10-06T16:40:00.000Z', user: 'Carlos Gómez', action: 'LEGALIZACION', details: 'Factura FAC-89210 por $75.000 y devolución de $25.000' },
      { id: 'aud-4', timestamp: '2026-10-06T17:00:00.000Z', user: 'Camila Morales', action: 'VERIFICACION', details: 'Soporte verificado y cerrada con éxito' },
    ]
  },
  // 2. Legalizada: Transporte y Taxis
  {
    id: 'req-002',
    code: 'CM-2026-002',
    periodId: 'per-2026-10',
    applicantId: 'usr-4',
    applicantName: 'María Fernanda Soto',
    department: 'Contabilidad y Finanzas',
    createdAt: '2026-10-12T08:45:00.000Z',
    concept: 'Transporte y Taxis',
    justification: 'Taxis ida y regreso a la Notaría 35 para autenticación urgente de escrituras y poderes mercantiles.',
    requestedAmount: 60000,
    authorizedBy: 'Camila Morales',
    status: 'LEGALIZADA',
    deliveryInfo: {
      deliveredAmount: 60000,
      deliveredAt: '2026-10-12T09:30:00.000Z',
      receivedByName: 'María Fernanda Soto',
      conceptConfirmed: 'Transporte y Taxis',
      balanceAfterDelivery: 1865000,
      registeredBy: 'Camila Morales',
      voucherNumber: 'EG-0002'
    },
    legalizationInfo: {
      invoiceNumber: 'TX-44019',
      supplierName: 'Taxis Libres Bogotá S.A.',
      supplierNit: '830.012.981-4',
      invoiceDate: '2026-10-12',
      actualSpentAmount: 52000,
      returnedAmount: 8000,
      observations: 'Dos carreras con planilla y recibos autorizados.',
      attachmentName: 'Recibos_Taxis_Notaria.pdf',
      attachmentDataUrl: createSampleInvoiceDataUrl('TX-44019', '$ 52.000'),
      legalizedAt: '2026-10-12T16:15:00.000Z',
      verifiedBy: 'Camila Morales',
      isVerified: true
    },
    auditLog: [
      { id: 'aud-5', timestamp: '2026-10-12T08:45:00.000Z', user: 'María Fernanda Soto', action: 'CREACION', details: 'Solicitud radicada por $60.000 COP' },
      { id: 'aud-6', timestamp: '2026-10-12T09:30:00.000Z', user: 'Camila Morales', action: 'ENTREGA', details: 'Aprobación y entrega de $60.000 COP' },
      { id: 'aud-7', timestamp: '2026-10-12T16:15:00.000Z', user: 'Camila Morales', action: 'LEGALIZACION_Y_CIERRE', details: 'Legalizado $52.000, reintegro $8.000' }
    ]
  },
  // 3. Legalizada: Refrigerios y Alimentación
  {
    id: 'req-003',
    code: 'CM-2026-003',
    periodId: 'per-2026-10',
    applicantId: 'usr-2',
    applicantName: 'David Arboleda',
    department: 'Dirección Administrativa',
    createdAt: '2026-10-18T10:00:00.000Z',
    concept: 'Alimentación y Refrigerios',
    justification: 'Refrigerios para reunión extraordinaria con revisoría fiscal y auditores externos.',
    requestedAmount: 85000,
    authorizedBy: 'Camila Morales',
    status: 'LEGALIZADA',
    deliveryInfo: {
      deliveredAmount: 85000,
      deliveredAt: '2026-10-18T10:30:00.000Z',
      receivedByName: 'David Arboleda',
      conceptConfirmed: 'Alimentación y Refrigerios',
      balanceAfterDelivery: 1788000,
      registeredBy: 'Camila Morales',
      voucherNumber: 'EG-0003'
    },
    legalizationInfo: {
      invoiceNumber: 'POS-2983',
      supplierName: 'Tostao Café y Pan',
      supplierNit: '900.892.120-7',
      invoiceDate: '2026-10-18',
      actualSpentAmount: 81500,
      returnedAmount: 3500,
      observations: 'Sándwiches, cafés y botellas de agua para 6 asistentes.',
      attachmentName: 'Factura_Tostao_2983.png',
      attachmentDataUrl: createSampleInvoiceDataUrl('POS-2983', '$ 81.500'),
      legalizedAt: '2026-10-18T17:10:00.000Z',
      verifiedBy: 'Camila Morales',
      isVerified: true
    },
    auditLog: [
      { id: 'aud-8', timestamp: '2026-10-18T10:00:00.000Z', user: 'David Arboleda', action: 'CREACION', details: 'Solicitud radicada por $85.000 COP' },
      { id: 'aud-9', timestamp: '2026-10-18T10:30:00.000Z', user: 'Camila Morales', action: 'ENTREGA', details: 'Entrega en efectivo efectuada' },
      { id: 'aud-10', timestamp: '2026-10-18T17:10:00.000Z', user: 'Camila Morales', action: 'VERIFICACION', details: 'Verificación exitosa' }
    ]
  },
  // 4. APROBADA_ENTREGADA (Anticipo en calle entregado en la mañana, pendiente de legalizar en la tarde)
  {
    id: 'req-004',
    code: 'CM-2026-004',
    periodId: 'per-2026-10',
    applicantId: 'usr-5',
    applicantName: 'Jorge Rodríguez',
    department: 'Mantenimiento e Instalaciones',
    createdAt: '2026-10-30T08:15:00.000Z',
    concept: 'Mantenimiento Menor e Instalaciones',
    justification: 'Compra urgente de tubería PVC de 1/2 pulgada, teflón y llave de paso para reparar fuga en baño del piso 2.',
    requestedAmount: 90000,
    authorizedBy: 'Camila Morales',
    status: 'APROBADA_ENTREGADA',
    deliveryInfo: {
      deliveredAmount: 90000,
      deliveredAt: '2026-10-30T08:45:00.000Z',
      receivedByName: 'Jorge Rodríguez',
      conceptConfirmed: 'Mantenimiento Menor e Instalaciones',
      balanceAfterDelivery: 1701500,
      registeredBy: 'Camila Morales',
      voucherNumber: 'EG-0004'
    },
    auditLog: [
      { id: 'aud-11', timestamp: '2026-10-30T08:15:00.000Z', user: 'Jorge Rodríguez', action: 'CREACION', details: 'Solicitud radicada por $90.000 COP' },
      { id: 'aud-12', timestamp: '2026-10-30T08:45:00.000Z', user: 'Camila Morales', action: 'ENTREGA', details: 'Dinero entregado a Jorge Rodríguez. Pendiente de legalizar en la tarde con factura de ferretería.' }
    ]
  },
  // 5. PENDIENTE (Solicitud radicada esta mañana, esperando que el encargado de caja la apruebe y entregue)
  {
    id: 'req-005',
    code: 'CM-2026-005',
    periodId: 'per-2026-10',
    applicantId: 'usr-3',
    applicantName: 'Carlos Gómez',
    department: 'Operaciones y Logística',
    createdAt: '2026-10-30T09:20:00.000Z',
    concept: 'Mensajería y Envíos',
    justification: 'Envío de paquete con muestras comerciales a cliente en Medellín vía Servientrega contraentrega prioritaria.',
    requestedAmount: 48000,
    authorizedBy: 'Camila Morales',
    status: 'PENDIENTE',
    auditLog: [
      { id: 'aud-13', timestamp: '2026-10-30T09:20:00.000Z', user: 'Carlos Gómez', action: 'CREACION', details: 'Solicitud radicada para mensajería expresa' }
    ]
  },
  // 6. RECHAZADA (Ejemplo con justificación)
  {
    id: 'req-006',
    code: 'CM-2026-006',
    periodId: 'per-2026-10',
    applicantId: 'usr-5',
    applicantName: 'Jorge Rodríguez',
    department: 'Mantenimiento e Instalaciones',
    createdAt: '2026-10-25T11:00:00.000Z',
    concept: 'Otro',
    customConcept: 'Alquiler de andamio certificado',
    justification: 'Alquiler de andamio por 3 días para pintar fachada.',
    requestedAmount: 350000,
    authorizedBy: 'Camila Morales',
    status: 'RECHAZADA',
    rejectionReason: 'Monto excede el límite permitido por solicitud individual de caja menor ($150.000 COP) y no corresponde a gasto menor imprevisto. Debe tramitarse mediante orden de compra formal con el área de adquisiciones.',
    auditLog: [
      { id: 'aud-14', timestamp: '2026-10-25T11:00:00.000Z', user: 'Jorge Rodríguez', action: 'CREACION', details: 'Solicitud radicada por $350.000 COP' },
      { id: 'aud-15', timestamp: '2026-10-25T11:45:00.000Z', user: 'Camila Morales', action: 'RECHAZO', details: 'Rechazada: Excede políticas de caja menor' }
    ]
  }
];
