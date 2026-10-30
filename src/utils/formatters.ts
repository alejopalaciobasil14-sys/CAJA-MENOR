/**
 * Formateadores de moneda, fecha y códigos para Caja Menor (COP)
 */

/**
 * Formatea un número en Pesos Colombianos (COP)
 * Ejemplo: 2000000 -> "$ 2.000.000 COP" o "$ 2.000.000"
 */
export function formatCOP(amount: number | undefined | null, includeSuffix: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$ 0' + (includeSuffix ? ' COP' : '');
  }
  
  // Usar formato estándar para Colombia (es-CO)
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return includeSuffix ? `${formatted} COP` : formatted;
}

/**
 * Formato compacto para números en COP
 * Ejemplo: 2000000 -> "$ 2M"
 */
export function formatCompactCOP(amount: number): string {
  if (amount >= 1_000_000) {
    return `$ ${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
  }
  if (amount >= 1_000) {
    return `$ ${(amount / 1_000).toFixed(0)}k`;
  }
  return formatCOP(amount);
}

/**
 * Formatea una fecha ISO a formato colombiano legible
 * Ejemplo: "24 de Octubre de 2026"
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formatea fecha y hora completa
 * Ejemplo: "24/10/2026, 09:30 a. m."
 */
export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

/**
 * Genera un código correlativo para solicitudes
 */
export function generateRequestCode(index: number, year: number = 2026): string {
  const padded = String(index).padStart(3, '0');
  return `CM-${year}-${padded}`;
}

/**
 * Genera un número de comprobante de egreso
 */
export function generateVoucherNumber(index: number): string {
  return `EG-${String(index).padStart(4, '0')}`;
}
