# Eduardo · propuesta de primera clase

## Objetivo

Que Eduardo pueda explicar a grandes rasgos cómo se organiza su infraestructura Azure, identificar cómo su n8n intercambia datos, ejecutar un workflow de práctica con información ficticia y plantear qué necesita resolver una Torre de Control.

## Guion sugerido

| Bloque | Actividad | Resultado esperado |
|---|---|---|
| 1. Contexto | Dibujar qué existe hoy: suscripciones, recursos principales, ubicación de n8n y fuentes de datos. | Mapa de situación actual, separando confirmado de pendiente. |
| 2. Azure | Separar identidad (**Microsoft Entra ID**) del árbol administrativo (**Management Groups → subscription → Resource Group → recursos**). Ver cómo Azure RBAC asigna permisos y Azure Policy gobierna configuraciones. Identificar AKS/ACI/Linux VM si n8n es autohospedado; Azure SQL Database, Storage Account/Blob, Azure API Management, Azure Functions, Key Vault, VNet/Private Endpoint y Azure Monitor. | Eduardo ubica los servicios que realmente usa y distingue existentes de candidatos. |
| 3. Montar n8n | Recorrer Azure Virtual Machines → Linux/Ubuntu LTS → VNet/subnet/NSG → clave SSH → Docker Engine/Compose → Traefik/HTTPS → volumen persistente SQLite. Comparar SSH restringido con Azure Bastion; leer `.env.example` y `compose.yaml.example`. | Entender qué recursos se crean, qué puertos se publican, dónde se guardan workflows y qué debe respaldarse. |
| 4. Conexión | Explicar el camino webhook/API, autenticación, prueba vs. producción, entrada y salida. Elegir nodo Microsoft SQL, Azure Storage o HTTP Request según la fuente. | Contrato de llamada y lista de datos de conexión que faltan. |
| 5. Práctica | Filtrar operaciones inventadas, sumar alertas de muestra y revisar el JSON devuelto. | Primer workflow acotado, junto con límites y errores posibles. |
| 6. Torre | Identificar usuarios, KPIs, frescura, alertas y acciones. Comparar Azure Monitor Workbooks, Power BI, n8n y Azure App Service para un portal propio. | Recomendación inicial y experimento siguiente; sin fijar herramienta antes de conocer el caso. |

## Preguntas de descubrimiento

- ¿En qué cuenta, tenant y suscripción está la infraestructura que quiere revisar?
- ¿n8n es Cloud o autohospedado? Si es propio, ¿corre en AKS, Azure Container Instances, Linux VM u otra plataforma? ¿Quién administra backups, actualizaciones y red?
- ¿Qué Resource Groups, regiones, Azure SQL Databases, Storage Accounts o APIs existen hoy? ¿Qué es candidato y qué está desplegado?
- ¿Qué tablas, endpoints o blobs debe consultar el workflow? ¿Qué identificadores relacionan los registros?
- ¿Qué pregunta tiene que contestar la Torre y quién tomará una decisión con esa respuesta?
- ¿Cada cuánto necesita actualizarse la vista? ¿Qué debe pasar al detectar un desvío?
- ¿Quién podrá ver datos y quién puede disparar acciones?

## Práctica preparada

El simulador filtra la tabla ficticia de operaciones por estado y región, calcula cantidad de registros, operaciones fuera del SLA e importe asociado, y muestra alertas inventadas. Se hace explícito que las alertas no están correlacionadas con una operación específica y que el resultado no es evidencia del estado real de Azure.

## No incluido aún

Conexión a la cuenta Azure, invocación del webhook de n8n, credenciales, despliegue, lectura de tablas reales y tablero conectado. Se agregan después de relevar la instancia y acordar el contrato de datos y autenticación.
