# Mapa de servicios Azure · clase de Eduardo

Este es un **mapa de opciones con nombres reales de producto**, no un inventario de la cuenta de Eduardo ni un despliegue propuesto para producción. Antes de elegir hay que confirmar dónde corre n8n, qué datos existen y quién operará los recursos.

## Organización y gobierno

| Capa | Servicio / concepto | Para qué sirve en la conversación |
|---|---|---|
| Identidad | **Microsoft Entra ID tenant** | Usuarios, grupos y aplicaciones que se autentican. |
| Gobierno | **Azure Management Groups** + **Azure Policy** | Ordenar suscripciones y heredar reglas de gobierno. |
| Administración | **Azure subscription**, **Azure RBAC**, **Cost Management + Billing** | Alcance de facturación, permisos y visibilidad de costos. |
| Agrupación | **Azure Resource Group** | Agrupar recursos relacionados. `rg-eduardo-lab-dev` en la demo es un nombre de ejemplo, no existe en su cuenta. |
| Geografía | **Azure region** y **Availability Zones** | Decidir ubicación, latencia y resiliencia después de revisar requisitos y soporte de cada servicio. La región concreta queda pendiente. |

## Dónde corre n8n

- **n8n Cloud:** el motor de n8n corre como servicio de n8n, no dentro de una suscripción Azure de Eduardo. Puede llamar APIs expuestas con HTTPS y autenticación admitida. Si Azure SQL o Storage tienen solo acceso privado, hay que diseñar conectividad hacia la VNet; una URL pública de n8n no atraviesa un Azure Private Endpoint por sí sola.
- **n8n autohospedado:** la guía oficial de n8n para Azure usa **Azure Kubernetes Service (AKS)**, **PostgreSQL** y volúmenes persistentes. La guía también enumera **Azure Container Instances** y **Linux Virtual Machines** como opciones de hosting. n8n advierte que el autohospedaje exige experiencia de operación.
- **Recorrido didáctico de esta clase:** una **Azure Linux Virtual Machine** con **Docker Compose**, **Traefik** para TLS y el volumen Docker persistente de n8n (SQLite en el primer montaje). Es menos piezas para aprender IaaS y contenedores, pero una VM única no ofrece alta disponibilidad y hay que operar Linux, n8n, backups y actualizaciones. Ver el tutorial de [Azure VM → n8n](azure-vm-n8n.md) y las plantillas de `deployment/azure-vm-n8n/`.
- La base interna de n8n es distinta de las tablas del negocio. n8n usa **SQLite** por defecto en instalaciones autohospedadas y también soporta **PostgreSQL**. Para la guía en Azure, PostgreSQL forma parte del despliegue en AKS. Una oferta PostgreSQL administrada debe validarse contra la versión, red y requisitos del n8n existente.

**Para la primera clase:** identificar la instancia que Eduardo ya tiene y no crear AKS, VM ni base administrada como ejercicio inicial.

## Datos y APIs

| Servicio | Uso candidato en el caso |
|---|---|
| **Azure SQL Database** | Tabla relacional de operaciones, SLA, responsables y estados. Es una base PaaS administrada. |
| **Azure Storage Account · Blob Storage** | CSV, JSON originales, adjuntos o archivos de auditoría. |
| **Azure Functions** | Pequeña API HTTP o lógica por evento cuando se necesita código propio entre n8n y los datos. |
| **Azure API Management** | Publicar/controlar APIs: autenticación, cuotas, rate limits, transformación y observabilidad. Es opcional; para una primera prueba puede ser innecesario si ya existe un endpoint seguro adecuado. |
| **Azure App Service** | Alojar una web app o API REST si el caso termina necesitando un portal o backend propio. |

Para el laboratorio, n8n usa los CSV ficticios de `data/`. En un caso real, elegiríamos **un** origen existente: API ya disponible, Azure SQL Database o Blob Storage. No hace falta agregar Azure Functions y API Management automáticamente; se agregan si resuelven un requisito concreto de seguridad, compatibilidad o reutilización.

### Qué nodo n8n corresponde a cada origen

| Origen confirmado | Nodo n8n | Qué debe ocurrir |
|---|---|---|
| Tabla en Azure SQL Database | **Microsoft SQL** | Configurar host/base/credencial, permisos SQL y conectividad; ejecutar una consulta de lectura acotada. |
| Archivo en Azure Storage / Blob | **Azure Storage** → **Extract From File** | Obtener el blob; con la operación **Extract From CSV**, convertir el binario en filas JSON antes de usar filtros sobre sus columnas. |
| API HTTP existente | **HTTP Request** | Llamar el método y endpoint definidos por esa API, con su autenticación. API Management puede aplicar políticas al API; no es el acceso directo a SQL o Blob. |

El **Webhook** es distinto: recibe una llamada entrante e inicia el workflow. **HTTP Request** es una llamada saliente que hace el workflow. **Respond to Webhook** prepara la respuesta que vuelve al cliente. Ninguno de esos pasos establece por sí solo la conexión de red o los permisos hacia el origen.

## Seguridad y red

- **Microsoft Entra ID** autentica identidades; **Azure RBAC** asigna permisos sobre recursos y alcances.
- **Azure Key Vault** puede guardar tokens, claves, certificados y secretos de una aplicación. No sustituye ni configura automáticamente las credenciales internas de n8n: su integración debe diseñarse.
- **Azure Virtual Network (VNet)** y **Azure Private Endpoint** sirven para topologías de red privada hacia servicios compatibles, como Azure SQL Database y Azure Storage. Revisar DNS y la conectividad del n8n cliente; el Private Endpoint no es un túnel automático desde Internet.
- Aplicar solo cuando el caso lo necesite: si Azure SQL permite un endpoint público protegido y la política lo admite, un flujo de prueba puede no requerir Private Endpoint. Si la política exige red privada, n8n debe tener ruta autorizada hacia esa red.

## Monitoreo y Torre de Control

```text
n8n
 ├─ Microsoft SQL node ───────────────→ Azure SQL Database
 ├─ Azure Storage → Extract From File ─→ Storage Account / Blob CSV
 └─ HTTP Request ─────────────────────→ API REST existente
                                          ├─ Azure API Management (si aplica)
                                          └─ Azure Functions (si se necesita lógica propia)

Azure SQL Database ───────────────────→ Power BI (KPIs de negocio)
Azure resources ──→ Azure Monitor ────→ Log Analytics workspace (KQL)
                                      ├─ Application Insights (telemetría de apps)
                                      └─ Azure Monitor Workbooks (vistas técnicas)
Webhook entrante ─→ workflow n8n ─────→ Respond to Webhook / acción autorizada
```

- **Azure Monitor**: datos de monitoreo como métricas y logs.
- **Log Analytics workspace**: consultas y análisis de logs con KQL.
- **Application Insights**: telemetría, solicitudes, dependencias y trazas de aplicaciones instrumentadas.
- **Azure Monitor Workbooks**: reportes interactivos dentro del portal Azure, útiles para explorar señales técnicas.
- **Power BI**: informes y dashboards de indicadores de operación a partir de datos preparados; por ejemplo, Azure SQL Database si esa termina siendo la fuente.
- **n8n**: recibe eventos, llama APIs y automatiza pasos. No reemplaza por sí mismo un dashboard de análisis.

La hipótesis de clase es **Power BI + Azure Monitor Workbooks + n8n**, con Azure SQL Database como posible origen de KPIs. Si la Torre necesita asignar casos, aprobar y cambiar estados, evaluar un portal sobre **Azure App Service**. El dato, la audiencia y las decisiones de Eduardo determinarán la selección final.

## Diagrama para discutir, no para desplegar

```text
                           ┌─ Azure SQL Database ─→ Power BI
n8n Cloud o instancia ─HTTPS─→ API existente / Azure API Management
autohospedada                  └─ Azure Functions (solo si hace falta lógica)
                                            │
                                            └─→ Storage Account / Blob Storage

Azure resources ─→ Azure Monitor + Application Insights
                   └─→ Log Analytics workspace ─→ Azure Monitor Workbooks

Acceso: Microsoft Entra ID + Azure RBAC  |  Secretos de app: Key Vault
Red privada si aplica: VNet + Private Endpoint
```

## Referencias oficiales

- [Arquitectura Azure Fundamentals · Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/)
- [n8n: Deploy to Azure](https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-azure/)
- [n8n: bases de datos soportadas](https://docs.n8n.io/deploy/host-n8n/configure-n8n/choose-n8ns-database/)
- [n8n Microsoft SQL node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql/)
- [n8n Azure Storage node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.azurestorage/)
- [n8n Extract From File node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/)
- [n8n HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview)
- [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)
- [Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts)
- [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/overview)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
- [Azure Private Endpoint](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview)
- [Azure Monitor data platform](https://learn.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-overview-metrics)
- [Azure Monitor Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)
- [Power BI dashboards](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards)
