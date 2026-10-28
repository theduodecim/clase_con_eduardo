# Workflow n8n · práctica propuesta

## Caso

Cada ejecución recibe criterios para revisar la tabla ficticia de operaciones y prepara un resumen JSON. La tabla de alertas Azure se usa como segundo conjunto de datos para explorar cruces y límites. No se interpreta una coincidencia por servicio como prueba de causalidad.

## Nodos para armar en clase

Hay un workflow de muestra importable en [`frontend/public/workflows/torre-control-demo.json`](../frontend/public/workflows/torre-control-demo.json). En n8n, usar **Import from File**, seleccionar ese archivo y mantener el workflow inactivo mientras se prueba. El Code node contiene las mismas 12 operaciones y 4 alertas ficticias de `frontend/src/data/demo.ts`; no necesita credenciales ni consulta Azure.

Para probar, abrir el nodo **Webhook**, pulsar **Listen for test event** y enviar un `POST` JSON a la Test URL que muestra la instancia. El path configurado es `eduardo/torre-demo`. La guía de conexión también permite pegar esa URL para enviar los filtros de ejemplo desde el navegador. La URL de producción no forma parte del ejercicio. Antes de activar o exponer un webhook, configurar autenticación o una restricción de acceso adecuada.

El archivo de demostración tiene tres nodos: **Webhook → Code → Respond to Webhook**. La siguiente lista explica cómo evolucionar ese caso si se reemplazan las tablas internas por una fuente real; no significa que el archivo de demo ya tenga credenciales o nodos Azure configurados.

1. **Webhook** — trigger de entrada, método `POST`, path `/eduardo/torre-demo`. Recibe criterios del cliente e inicia la ejecución; no consulta Azure por sí solo. Probar primero con Test URL. La Production URL se usa cuando el workflow se publica. Configurar autenticación antes de exponer un endpoint real.
2. **Validar entrada** — aceptar `estado` (opcional: `Todos`, `Demorada`, `En riesgo`, `En curso`, `Completada`), `region` (`Todas`, `CABA`, `Norte`, `Sur`) y un `limite` acotado. Responder `400` para valores inválidos.
3. **Leer operaciones con el nodo de la fuente confirmada** — no son rutas intercambiables:
   - **Azure SQL Database** → nodo **Microsoft SQL** de n8n; ejecutar una consulta de lectura con el esquema y los permisos aprobados.
   - **Storage Account / Blob Storage** → nodo **Azure Storage** para obtener el blob y nodo **Extract From File** configurado en **Extract From CSV** para transformar el binario en filas JSON.
   - **API REST existente** → nodo **HTTP Request** con método, endpoint y credencial definidos por esa API. **Azure API Management** puede gobernar una API y **Azure Functions** implementar lógica propia, pero no son requisitos para cada integración.
   - En todas las opciones, revisar autenticación y ruta de red desde donde corre n8n. Un Private Endpoint necesita conectividad y DNS; no basta con conocer la URL.
4. **Filtrar y calcular** — los registros se procesan como items de n8n. Usar **Filter** para estado/región; convertir `horas`, `sla` e `importe_ars` a números si llegan como texto (por ejemplo, después de extraer un CSV); usar **IF** para la condición `horas > sla` y **Aggregate** para construir los totales.
5. **Leer alertas** — consultar el segundo CSV ficticio con el método de lectura correspondiente. Agrupar por servicio/nivel; mantenerlas como señales independientes mientras no haya una llave de correlación, tiempo comparable y evidencia causal.
6. **Respond to Webhook** — configurar el Webhook para responder usando este nodo. Devolver `200` y JSON con filtros, resumen, operaciones y alertas de muestra y limitaciones. Definir también qué recibe el cliente para entrada inválida o fallo de lectura; revisar el status HTTP y el body.

## Request de ejemplo

Este JSON es el contrato de prueba para el Webhook del workflow importable. La interfaz local aplica los mismos filtros en el navegador sobre `demo.ts`.

```json
{
  "estado": "Demorada",
  "region": "Norte",
  "limite": 4
}
```

## Qué observar en la prueba

- ¿Cuántas filas entran antes y después de aplicar los filtros?
- ¿Qué tipos deben convertirse antes de hacer comparaciones o sumas?
- ¿Qué cambia cuando una fila tiene `horas == sla`? La regla inicial considera fuera de SLA solo `horas > sla`.
- ¿La respuesta permite afirmar que una alerta causó la demora? No: las tablas son ficticias y no tienen relación causal validada.
- ¿Qué resultado debería ver el cliente si el CSV no se puede leer, una fila no tiene horas o el estado solicitado no existe?
- ¿Qué evidencia muestra que una ejecución terminó y qué evidencia muestra que se escribió una fila en una fuente?
- ¿Qué nodo corresponde a cada origen: Azure SQL Database, Blob Storage o API REST?
- Si Blob devuelve un archivo CSV, ¿cómo convierte Extract From File el contenido binario en filas que Filter pueda procesar?
- ¿Cuál es la diferencia entre el Webhook (entrada al workflow) y HTTP Request (llamada saliente desde el workflow)?

## Cómo leer la respuesta

- `simulacion`: indica que el resultado pertenece al entorno de práctica.
- `filtros`: deja visible qué criterios usó la ejecución.
- `registros_en_muestra`: filas que quedaron después de filtrar; no es el total histórico del sistema.
- `fuera_de_sla`: cuenta filas donde `horas > sla`. La igualdad exacta (`horas == sla`) no se considera fuera de SLA con la regla actual.
- `en_riesgo`: cuenta filas cuyo estado operativo es `En riesgo`, una categoría distinta de `fuera_de_sla`.
- `importe_asociado_ars`: suma de los importes de las filas filtradas; no es facturación neta ni un total de Azure Cost Management.
- `alertas_severas`: conteo del conjunto independiente de alertas. No afirma que esas alertas correspondan a las operaciones incluidas.
- `operaciones`: hasta cuatro filas de ejemplo para inspección, no necesariamente todas las filas.
- `alertas`: filas de muestra del conjunto independiente de señales Azure; no se correlacionan automáticamente con operaciones.
- `alcance`: límites que el cliente de la API debería conocer.

Un código HTTP 200 comunica que el request recibió una respuesta satisfactoria según el flujo; no valida que la fuente sea actual, completa o real.

## Respuesta ilustrativa

```json
{
  "simulacion": true,
  "filtros": { "estado": "Demorada", "region": "Norte" },
  "resumen": {
    "registros_en_muestra": 2,
    "fuera_de_sla": 2,
    "en_riesgo": 0,
    "importe_asociado_ars": 220000,
    "alertas_azure_muestra": 4,
    "alertas_severas": 1
  },
  "operaciones": [
    { "id": "OP-1046", "region": "Norte", "estado": "Demorada", "servicio": "n8n-webhook", "horas": 7.2, "sla": 4 },
    { "id": "OP-1052", "region": "Norte", "estado": "Demorada", "servicio": "db-operaciones", "horas": 6.5, "sla": 4 }
  ],
  "alertas": [
    { "id": "AZ-201", "hora": "10:37", "servicio": "n8n-webhook", "nivel": "Severa", "señal": "Tiempo de respuesta sobre 2.5 s", "origen": "Application Insights" },
    { "id": "AZ-202", "hora": "10:52", "servicio": "db-operaciones", "nivel": "Advertencia", "señal": "Conexiones activas al 78%", "origen": "Azure Monitor" },
    { "id": "AZ-203", "hora": "11:24", "servicio": "api-operaciones", "nivel": "Informativa", "señal": "3 respuestas 429 en 5 min", "origen": "Log Analytics" },
    { "id": "AZ-204", "hora": "12:06", "servicio": "storage-archivos", "nivel": "Advertencia", "señal": "Aumento de latencia de lectura", "origen": "Azure Monitor" }
  ],
  "alcance": [
    "Solo se consultaron las tablas ficticias incluidas en este workflow.",
    "Las alertas se muestran como una tabla independiente: no se correlacionan ni prueban la causa de una demora.",
    "No se consultó Azure, una base real ni otra instancia n8n.",
    "Fuera de SLA significa horas > SLA; el importe es un dato inventado, no facturación real."
  ]
}
```

La app interactiva del navegador y el workflow importable calculan sobre la misma muestra. El workflow no incluye credenciales y su webhook debe protegerse antes de publicarse. No copiar tokens ni URLs privadas a este repositorio.

## Servicios Azure si se pasa a una fuente real

- Si existe una API de negocio, probar el nodo **HTTP Request** de n8n contra ese endpoint HTTPS. **Azure API Management** puede ser la puerta de entrada si hacen falta políticas comunes de autenticación, cuota o rate limit.
- Para una tabla SQL, evaluar el nodo **Microsoft SQL** de n8n con Azure SQL Database; confirmar método de autenticación, firewall, permisos de datos y conectividad.
- Para archivos, el nodo **Azure Storage** de n8n puede operar con blobs en una Storage Account. Para un CSV, el nodo **Extract From File** (operación **Extract From CSV**) transforma el archivo binario en filas JSON antes de aplicar condiciones.
- Si todavía no hay API y hace falta lógica propia, evaluar **Azure Functions** para exponer un endpoint acotado que consulte **Azure SQL Database**. Azure Functions y API Management no son obligatorios para una demo si n8n puede consultar de forma segura la fuente existente.
- Si las tablas viven en SQL, identificar la instancia de **Azure SQL Database**, método de autenticación, firewall y si requiere **Azure Private Endpoint**. n8n Cloud necesita conectividad apropiada si el endpoint es privado.
- Si la fuente son archivos, guardarlos o leerlos desde una **Storage Account / Blob Storage** con permisos de mínimo privilegio. No abrir el contenedor al público para simplificar la clase.
- Telemetría de Azure: **Azure Monitor**, **Application Insights** y un **Log Analytics workspace**; visualizaciones técnicas en **Azure Monitor Workbooks**. Indicadores operativos pueden exponerse a **Power BI**.
- Para n8n autohospedado en Azure, revisar su guía oficial: **AKS**, **PostgreSQL** y almacenamiento persistente; **Azure Container Instances** y **Linux Virtual Machines** aparecen como alternativas de hosting. Esto requiere un plan de operación y no es parte del primer laboratorio.

## Documentación de los nodos n8n

- [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Microsoft SQL node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql/)
- [Azure Storage node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.azurestorage/)
- [Extract From File node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/)
- [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Respond to Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)
- [Filter node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.filter/)
- [Aggregate node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.aggregate/)
