# Eduardo · propuesta de primera clase

## Objetivo

Que Eduardo pueda explicar a grandes rasgos cómo se organiza su infraestructura Azure, identificar cómo su n8n intercambia datos, ejecutar un workflow de práctica con información ficticia y plantear qué necesita resolver una Torre de Control.

## Guion sugerido

| Bloque | Actividad | Resultado esperado |
|---|---|---|
| 1. Contexto | Dibujar qué existe hoy: suscripciones, recursos principales, ubicación de n8n y fuentes de datos. | Mapa de situación actual, separando confirmado de pendiente. |
| 2. Azure | Separar identidad (**Microsoft Entra ID**) del árbol administrativo (**Management Groups → subscription → Resource Group → recursos**). Ver cómo Azure RBAC asigna permisos y Azure Policy gobierna configuraciones. Identificar AKS/ACI/Linux VM si n8n es autohospedado; Azure SQL Database, Storage Account/Blob, Azure API Management, Azure Functions, Key Vault, VNet/Private Endpoint y Azure Monitor. | Eduardo ubica los servicios que realmente usa y distingue existentes de candidatos. |
| 3. Conectar n8n | Abrir la instancia existente, importar `frontend/public/workflows/torre-control-demo.json` y probar su Test URL. No ingresar secretos en esta aplicación. | Workflow de muestra visible y primera ejecución de prueba. |
| 4. Práctica | Filtrar 12 operaciones inventadas, sumar 4 alertas independientes y revisar el JSON devuelto y el alcance. | Primer workflow ejecutado, junto con límites y errores posibles. |
| 5. Torre | Identificar usuarios, KPIs, frescura, alertas y acciones. Comparar Azure Monitor Workbooks, Power BI, n8n y Azure App Service para un portal propio. | Recomendación inicial y experimento siguiente; sin fijar herramienta antes de conocer el caso. |

Montar una instancia n8n en una VM Azure es un módulo opcional: usarlo solo si todavía no existe n8n o se decide autohospedarlo.

## Preguntas de descubrimiento

- ¿En qué cuenta, tenant y suscripción está la infraestructura que quiere revisar?
- ¿n8n es Cloud o autohospedado? Si es propio, ¿corre en AKS, Azure Container Instances, Linux VM u otra plataforma? ¿Quién administra backups, actualizaciones y red?
- ¿Qué Resource Groups, regiones, Azure SQL Databases, Storage Accounts o APIs existen hoy? ¿Qué es candidato y qué está desplegado?
- ¿Qué tablas, endpoints o blobs debe consultar el workflow? ¿Qué identificadores relacionan los registros?
- ¿Qué pregunta tiene que contestar la Torre y quién tomará una decisión con esa respuesta?
- ¿Cada cuánto necesita actualizarse la vista? ¿Qué debe pasar al detectar un desvío?
- ¿Quién podrá ver datos y quién puede disparar acciones?

## Práctica preparada

El simulador visual y el workflow importable usan la tabla ficticia de operaciones por estado y región, calculan cantidad de registros, operaciones fuera del SLA e importe asociado, y devuelven las alertas inventadas como un conjunto independiente. Se hace explícito que las alertas no están correlacionadas con una operación específica y que el resultado no es evidencia del estado real de Azure.

## No incluido aún

Conexión a la cuenta Azure, lectura de tablas reales y tablero conectado. Se agregan después de relevar la instancia de Eduardo y acordar el contrato de datos, autenticación y conectividad. El workflow de demostración se puede importar en n8n, pero no contiene credenciales ni fuentes reales.
