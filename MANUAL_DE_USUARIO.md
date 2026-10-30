# MANUAL DE USUARIO - PLATAFORMA DE GESTIÓN Y CONTROL DE CAJA MENOR (CAJACONTROL)

**Versión:** 1.0.0  
**Moneda:** Pesos Colombianos (COP)  
**Fondo Mensual Asignado:** $2.000.000 COP  
**Fecha de Publicación:** Octubre de 2026  
**Empresa:** Sistema Administrativo y Financiero  

---

## 1. OBJETIVO DE LA PLATAFORMA

La **Plataforma de Gestión y Control de Caja Menor** es una solución digital diseñada para administrar, controlar, registrar y supervisar los recursos económicos asignados al fondo rotatorio de caja menor de la empresa.

Sus objetivos específicos son:
- **Transparencia Financiera:** Evitar fugas de capital y contar con un registro fidedigno de cada peso utilizado.
- **Trazabilidad Integral:** Mantener un historial completo con fecha, hora, usuario solicitante, responsable de aprobación y comprobantes de soporte.
- **Eficiencia Operativa:** Digitalizar el flujo de entregas en la mañana y legalizaciones en la tarde, eliminando planillas manuales propensas a errores.
- **Cumplimiento y Control:** Calcular automáticamente los saldos disponibles, el dinero entregado, los gastos reales soportados con factura y las devoluciones de dinero sobrante.
- **Toma de Decisiones:** Generar informes consolidados exportables a Excel y PDF para el área contable y directiva.

---

## 2. REQUISITOS PARA UTILIZARLA

### Requisitos Técnicos
1. **Navegador Web Moderno:** Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versiones actualizadas).
2. **Dispositivo:** Computador de escritorio, portátil, tablet o teléfono inteligente con conexión a internet o red interna.
3. **Soporte de Archivos:** Capacidad para cargar archivos en formato imagen (JPG, PNG) o PDF correspondientes a facturas o recibos de caja.

### Requisitos Organizacionales
1. Pertenecer a la nómina de la empresa y contar con autorización para realizar gastos operativos menores.
2. Contar con un rol asignado dentro del sistema (Administrador, Responsable de Caja Menor o Solicitante).
3. Entregar los soportes tributarios válidos (Facturas electrónicas, tiquetes POS o recibos autorizados con NIT/RUT).

---

## 3. CÓMO INGRESAR AL SISTEMA

1. Ingrese a la dirección web suministrada por el departamento de tecnología o administración.
2. En la parte superior derecha de la pantalla, encontrará el selector de perfil de usuario actual.
3. Puede seleccionar o iniciar sesión con cualquiera de los tres perfiles preconfigurados:
   - **Administrador:** Acceso completo al sistema, configuración, auditoría y reportes.
   - **Responsable de Caja Menor:** Encargado operativo de abrir periodos, entregar dinero, revisar facturas, recibir devoluciones y realizar arqueos.
   - **Solicitante / Trabajador:** Puede registrar requerimientos de dinero matutinos y legalizar los soportes en la tarde.
4. El sistema conserva su sesión activa y toda la información de manera persistente en su equipo.

---

## 4. DESCRIPCIÓN DE CADA MÓDULO

La plataforma cuenta con un menú lateral estructurado que divide las funciones en:

### A. Panel Principal (Dashboard)
Visión general e instantánea del fondo mensual:
- Tarjetas de indicadores clave (Fondo Inicial $2.000.000 COP, Dinero Entregado, Gastos Realizados, Devoluciones y Saldo Disponible en efectivo).
- Barra de porcentaje de ejecución del presupuesto.
- Alertas de solicitudes pendientes por autorizar y facturas pendientes de legalización.
- Gráficos estadísticos de gastos por departamento y por concepto.

### B. Solicitudes (Registro Matutino)
Módulo para listar, filtrar y registrar nuevas solicitudes de dinero. Permite visualizar el estado en tiempo real (Pendiente, Aprobada/Entregada, Rechazada, Legalizada).

### C. Entregas de Dinero (Aprobación y Desembolso)
Espacio exclusivo del Responsable de Caja Menor para examinar las solicitudes pendientes, aprobarlas o rechazarlas, y registrar el valor entregado junto con la confirmación de entrega y generación del comprobante de egreso.

### D. Legalizaciones (Jornada de la Tarde)
Módulo donde los trabajadores legalizan los anticipos recibidos:
- Registro del número de factura y proveedor.
- Valor realmente gastado.
- Cálculo automático del dinero sobrante devuelto.
- Adjunto fotográfico o documento del soporte.
- Aprobación final y cierre por parte del encargado de caja menor.

### E. Arqueo Diario y Cuadre de Caja
Herramienta de control físico del dinero:
- Calculadora de denominaciones de billetes y monedas colombianas.
- Comparativa entre el saldo teórico del sistema y el efectivo real en caja física.
- Detección inmediata de faltantes o sobrantes.

### F. Informes de Consumo
Módulo analítico con 10 tipos de informes detallados, filtros avanzados (fechas, solicitante, departamento, concepto) y opciones de exportación inmediata a **Excel (.xlsx)** y **PDF**.

### G. Cierre Mensual
Procedimiento formal para verificar que no queden anticipos abiertos, liquidar el mes, generar el acta de cierre contable y dar apertura al nuevo ciclo mensual con los $2.000.000 COP estipulados.

### H. Usuarios y Auditoría
Gestión de personal autorizado y trazabilidad detallada de todas las acciones registradas.

---

## 5. CÓMO REGISTRAR UNA SOLICITUD (PASO A PASO)

Durante las primeras horas del día, cuando un empleado requiera dinero para gastos menores:

1. Diríjase a la sección **"Solicitudes"** o haga clic en el botón **"+ Nueva Solicitud"** en el Panel Principal.
2. Complete los campos del formulario:
   - **Solicitante:** Seleccione el nombre del trabajador o verifique sus datos.
   - **Departamento / Área:** Seleccione el área correspondiente (p. ej. Operaciones, Ventas, Administración, Logística, TI).
   - **Fecha y Hora:** El sistema precarga la hora actual; verifique que coincida.
   - **Concepto del Gasto:** Elija entre Transporte, Papelería y útiles, Alimentación/refrigerios, Mensajería y envíos, Mantenimiento menor, Imprevistos operativos u Otro.
   - **Justificación:** Redacte de forma concisa pero clara la razón del gasto empresarial.
   - **Valor Solicitado (COP):** Ingrese el monto en pesos colombianos. El sistema le alertará si el monto supera el saldo disponible en caja menor.
   - **Responsable que autoriza:** Verifique el nombre del encargado de autorizar el desembolso.
3. Haga clic en **"Guardar Solicitud"**.
4. La solicitud quedará en estado **"Pendiente"** a la espera de la revisión del responsable.

---

## 6. CÓMO APROBAR Y ENTREGAR DINERO

Este proceso lo ejecuta el **Responsable de Caja Menor**:

1. Ingrese al módulo **"Entregas de Dinero"** (o consulte la lista de solicitudes pendientes en el Dashboard).
2. Ubique la solicitud a procesar y haga clic en **"Aprobar y Entregar"** (o en **"Rechazar"** si no procede, indicando el motivo).
3. Al aprobar, se abrirá la ventana de desembolso:
   - Verifique o ajuste el **Valor a Entregar** (puede ser igual al solicitado o ajustado).
   - Confirme la fecha y hora exacta de la entrega.
   - Ingrese el nombre de la persona que recibe el efectivo.
   - Confirme el concepto.
   - Observe el **Saldo Disponible Resultante** que quedará en la caja física tras el desembolso.
4. Presione **"Confirmar Entrega de Dinero"**.
5. El sistema actualizará inmediatamente el saldo de caja, descontando el anticipo y dejando la solicitud en estado **"Aprobada / Entregada (Pendiente de Legalizar)"**. Opcionalmente, puede imprimir o descargar el comprobante de egreso.

---

## 7. CÓMO REGISTRAR FACTURAS Y DEVOLUCIONES (LEGALIZACIÓN)

Al finalizar la jornada laboral o cumplir la diligencia, el trabajador debe legalizar el dinero recibido:

1. Ingrese a la sección **"Legalizaciones"**.
2. Identifique el anticipo entregado y presione el botón **"Legalizar Gasto"**.
3. Diligencie los datos de la factura:
   - **Número de Factura o Comprobante:** Ej. FE-84920 o Tiquete POS 1042.
   - **Proveedor / Establecimiento:** Nombre comercial y NIT (si aplica).
   - **Fecha del Comprobante:** Fecha de emisión de la factura.
   - **Valor Realmente Gastado:** Ingrese el total exacto que figura en la factura.
4. **Cálculo Automático de Devolución:**
   El sistema aplicará la fórmula institucional:
   $$\text{Dinero Entregado} - \text{Gasto Real Realizado} = \text{Dinero Sobrante a Devolver}$$
   *Ejemplo:* Si se entregaron $100.000 COP y la factura fue de $75.000 COP, el sistema indicará automáticamente: **Devolución: $25.000 COP**.
5. **Adjuntar Soporte:**
   Haga clic en el área de archivo para cargar una foto de la factura (JPG, PNG) o un archivo PDF escaneado.
6. Ingrese observaciones adicionales si las hubiere.
7. Presione **"Guardar Legalización"**.
8. El Responsable de Caja Menor verificará que el dinero sobrante haya ingresado a la caja y que la factura sea legible, haciendo clic en **"Verificar y Cerrar Solicitud"**. En ese instante, el dinero devuelto retorna formalmente a la caja y el gasto queda legalizado en estado definitivo **"Legalizada"**.

---

## 8. CÓMO CONSULTAR LOS SALDOS

El sistema garantiza que los saldos sean visibles en todo momento:

1. **Cabecera Permanente:** En la barra superior de cualquier pantalla encontrará el indicador verde con el **Saldo Disponible en Caja**.
2. **Panel Principal (Dashboard):** Presenta el desglose contable:
   - **Fondo Inicial:** $2.000.000 COP.
   - **Total Entregado:** Suma de todos los desembolsos realizados.
   - **Total Gastos Legalizados:** Monto real ejecutado y respaldado con factura.
   - **Total Devoluciones:** Dinero retornado a la caja por compras de menor valor.
   - **Anticipos en Calle:** Dinero en poder de trabajadores pendiente de legalizar.
   - **Saldo Disponible:** Efectivo actual en el cofre de seguridad.
3. **Módulo de Arqueo Diario:** Permite ingresar el conteo físico de monedas y billetes para verificar la concordancia con el saldo contable.

---

## 9. CÓMO GENERAR INFORMES

1. Diríjase a la opción **"Informes"** en el menú de navegación lateral.
2. Seleccione entre los **10 tipos de informes disponibles**:
   1. *Informe diario de movimientos:* Detalle cronológico de entradas y salidas.
   2. *Informe semanal de gastos:* Evolución de egresos agrupados por semanas.
   3. *Informe mensual de consumo:* Balance general de ejecución del periodo.
   4. *Informe de gastos por solicitante:* Ranking de quién utiliza los recursos.
   5. *Informe de gastos por departamento:* Comparativo por áreas de la compañía.
   6. *Informe de gastos por concepto:* Distribución entre transporte, papelería, etc.
   7. *Informe de solicitudes aprobadas y rechazadas:* Métricas de gestión.
   8. *Informe de facturas pendientes y legalizadas:* Control de cartera y soportes.
   9. *Informe de devoluciones de dinero:* Trazabilidad de reintegros de efectivo.
   10. *Informe de saldo disponible y ejecución:* Proyección y consumo del fondo.
3. **Filtros Personalizados:**
   Utilice los campos de filtro superior para segmentar por rango de fechas, trabajador específico, departamento o categoría de gasto.
4. **Visualización Gráfica:**
   Analice los gráficos estadísticos generados en tiempo real.
5. **Exportación:**
   - Presione **"Exportar a Excel"** para descargar un archivo `.xlsx` con encabezados y totales tabulados.
   - Presione **"Descargar PDF"** para obtener un reporte formal con membrete institucional, tablas formateadas y espacio para firmas de revisión.

---

## 10. CÓMO REALIZAR EL CIERRE MENSUAL

Al concluir el mes calendario de operaciones:

1. Acceda al módulo **"Cierre Mensual"**.
2. Verifique la lista de chequeo de cierre:
   - No deben existir solicitudes en estado **"Pendiente"** sin resolver.
   - No deben existir solicitudes en estado **"Aprobada / Entregada"** sin legalizar (todos los anticipos deben estar cerrados con su factura y devolución).
3. Revise el consolidado financiero del mes:
   - Total fondo inicial: $2.000.000 COP.
   - Total gastos ejecutados.
   - Total devoluciones ingresadas.
   - Saldo final sobrante en caja.
4. Redacte las observaciones de cierre contable en el campo correspondiente.
5. Haga clic en **"Generar Acta de Cierre (PDF)"** para descargar el documento oficial firmado por el Responsable y el Administrador.
6. Presione el botón **"Efectuar Cierre Mensual"**.
7. Una vez cerrado, el sistema habilitará el botón **"Apertura de Nuevo Periodo"**, donde se registrará el nuevo mes verificando la recarga del fondo a los **$2.000.000 COP** reglamentarios.

---

## 11. DESCRIPCIÓN DE LOS ROLES Y PERMISOS

| Permiso / Capacidad | Administrador | Responsable de Caja Menor | Solicitante (Empleado) |
|---|:---:|:---:|:---:|
| Ver Dashboard e Indicadores | Sí | Sí | Sí |
| Crear Solicitudes de Dinero | Sí | Sí | Sí |
| Aprobar / Rechazar Solicitudes | Sí | Sí | No |
| Registrar Entrega de Efectivo | Sí | Sí | No |
| Registrar Legalizaciones / Facturas | Sí | Sí | Sí (sus propias solicitudes) |
| Verificar y Validar Legalizaciones | Sí | Sí | No |
| Realizar Arqueos de Caja | Sí | Sí | No |
| Ejecutar Cierre Mensual | Sí | Sí | No |
| Abrir Nuevo Periodo Mensual | Sí | Sí | No |
| Generar y Exportar Informes | Sí | Sí | Sí (consulta general) |
| Administrar Usuarios y Respaldos | Sí | No | No |

---

## 12. SOLUCIÓN DE PROBLEMAS FRECUENTES

### P1: El sistema indica "Fondos insuficientes para autorizar la solicitud"
- **Causa:** El valor solicitado es mayor que el saldo disponible en efectivo en la caja menor.
- **Solución:** Espere a que se legalicen anticipos en curso con sus devoluciones, reduzca el monto solicitado o tramite el reembolso/reposición de caja si el mes está finalizando.

### P2: No puedo realizar el cierre mensual
- **Causa:** Existen solicitudes con dinero entregado que aún no han sido legalizadas con factura y devolución.
- **Solución:** Diríjase al módulo de **Legalizaciones**, contacte a los colaboradores con dinero pendiente y complete la verificación de sus soportes.

### P3: La factura adjunta no se visualiza correctamente
- **Causa:** Archivo en formato incompatible o dañado.
- **Solución:** Cargue archivos en formato estándar JPG, PNG o PDF con un tamaño inferior a 5 MB para garantizar su legibilidad.

### P4: El arqueo físico no coincide con el saldo del sistema (Descuadre)
- **Causa:** Olvido de registrar una entrega de dinero o una devolución de efectivo en la plataforma.
- **Solución:** Revise los movimientos del día en el informe diario de movimientos y coteje con los recibos físicos para identificar el movimiento no registrado.

### P5: ¿Se pierden los datos si cierro o recargo el navegador?
- **Causa/Garantía:** No. La plataforma almacena todos los datos de forma persistente en el almacenamiento local seguro del navegador (`localStorage`). Además, desde la sección de configuración puede exportar copias de seguridad completas en formato JSON en cualquier momento.

---
*Fin del Manual de Usuario - Plataforma CajaControl*
