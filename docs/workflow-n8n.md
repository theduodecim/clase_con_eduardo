# Workflow n8n · práctica propuesta

## Caso

Cada ejecución recibe criterios para revisar la tabla ficticia de operaciones y prepara un resumen JSON. La tabla de alertas Azure se usa como segundo conjunto de datos para explorar cruces y límites. No se interpreta una coincidencia por servicio como prueba de causalidad.

## Nodos para armar en clase

1. **Webhook** — trigger de entrada, método `POST`, path `/eduardo/torre-demo`. Recibe criterios del cliente e inicia la ejecución; no consulta Azure por sí solo. Probar primero con Test URL. La Production URL se usa cuando el workflow se publica. Configurar autenticación antes de exponer un endpoint real.
2. **Validar entrada** — aceptar `estado` (opcional: `Todos`, `Demorada`, `En riesgo`, `En curso`, `Completada`), `region` (`Todas`, `CABA`, `Norte`, `Sur`) y un `limite` acotado. Responder `400` para valores inválidos.
3. **Leer operaciones con el nodo de la fuente confirmada** — no son rutas intercambiables:
   - **Azure SQL Database** → nodo **Microsoft SQL** de n8n; ejecutar una consulta de lectura con el esquema y los permisos aprobados.
   - **Storage Account / Blob Storage** → nodo **Azure Storage** para obtener el blob y nodo **Extract From File** configurado en **Extract From CSV** para transformar el binario en filas JSON.
   - **API REST existente** → nodo **HTTP Request** con método, endpoint y credencial definidos por esa API. **Azure API Management** puede gobernar una API y **Azure Functions** implementar lógica propia, pero no son requisitos para cada integración.
   - En todas las opciones, revisar autenticación y ruta de red desde donde corre n8n. Un Private Endpoint necesita conectividad y DNS; no basta con conocer la URL.
4. **Filtrar y calcular** — los registros se procesan como items de n8n. Usar **Filter** para estado/región; convertir `horas`, `sla` e `importe_ars` a números si llegan como texto (por ejemplo, después de extraer un CSV); usar **IF** para la condición `horas > sla` y **Aggregate** para construir los totales.
5. **Leer alertas** — consultar el segundo CSV ficticio con el método de lectura correspondiente. Agrupar por servicio/nivel; mantenerlas como señales independientes mientras no haya una llave de correlación, tiempo comparable y evidencia causal.
6. **Respond to Webhook** — configurar el Webhook para responder usando este nodo. Devolver `200` y JSON con filtros, resumen, hasta cuatro operaciones de muestra y limitaciones. Definir también qué recibe el cliente para entrada inválida o fallo de lectura; revisar el status HTTP y el body.

## Request de ejemplo

Este JSON es el contrato conceptual para el Webhook real que se podría construir en n8n. La interfaz local de este repo no envía ese request; aplica filtros en el navegador sobre `demo.ts`.

```json
{
  "estado": "Demorada",
  "region": "Todas",
  "limite": 50
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
- `alcance`: límites que el cliente de la API debería conocer.

Un código HTTP 200 comunica que el request recibió una respuesta satisfactoria según el flujo; no valida que la fuente sea actual, completa o real.

## Respuesta ilustrativa

```json
{
  "simulacion": true,
  "filtros": { "estado": "Demorada", "region": "Todas" },
  "resumen": {
    "registros_en_muestra": 4,
    "fuera_de_sla": 4,
    "en_riesgo": 0,
    "importe_asociado_ars": 719000,
    "alertas_azure_muestra": 4,
    "alertas_severas": 1
  },
  "operaciones": [
    { "id": "OP-1042", "region": "CABA", "estado": "Demorada", "servicio": "n8n-webhook", "horas": 5.4, "sla": 4 },
    { "id": "OP-1046", "region": "Norte", "estado": "Demorada", "servicio": "n8n-webhook", "horas": 7.2, "sla": 4 },
    { "id": "OP-1048", "region": "CABA", "estado": "Demorada", "servicio": "db-operaciones", "horas": 8.1, "sla": 4 },
    { "id": "OP-1052", "region": "Norte", "estado": "Demorada", "servicio": "db-operaciones", "horas": 6.5, "sla": 4 }
  ],
  "alcance": [
    "Se consultaron únicamente las tablas ficticias incluidas en este laboratorio.",
    "Las alertas no se correlacionan automáticamente con cada operación.",
    "No se consultó la instancia n8n ni ningún recurso de Azure."
  ]
}
```

El resultado numérico de la app interactiva es calculado desde sus datos de muestra; este ejemplo de contrato puede cambiar al armar el workflow real. No copiar tokens ni URLs privadas a este repositorio.

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
