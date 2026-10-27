# Decisiones abiertas · Azure, n8n y Torre de Control

## Patrón didáctico

```text
n8n Cloud o n8n autohospedado
      ↓ Webhook / HTTP Request (HTTPS + autenticación)
API existente / Azure API Management (opcional)
      ↓                          └─ Azure Functions (si hace falta lógica propia)
Azure SQL Database / Storage Account (Blob)
      ├─→ Power BI (KPIs de negocio)
      └─→ Azure Monitor + Application Insights
               └─→ Log Analytics workspace → Azure Monitor Workbooks
```

El diagrama sirve como conversación, no como arquitectura real de Eduardo. Primero hay que saber si n8n es Cloud o autohospedado y ubicar sus recursos, fuentes, flujos y límites de red. Azure API Management y Azure Functions son opcionales, no requisitos para conectar n8n.

## Decisión de visualización

| Necesidad primaria | Herramienta candidata | Papel de n8n |
|---|---|---|
| Disponibilidad, latencia, errores y diagnóstico de recursos Azure | Azure Monitor + Log Analytics workspace + Application Insights; Azure Monitor Workbooks para la vista | Puede reaccionar a una alerta, llamar API o notificar. |
| KPIs operativos, tendencias, SLA y análisis por equipo o región | Power BI sobre datos preparados, por ejemplo Azure SQL Database | Puede actualizar fuentes o automatizar la distribución, según el caso. |
| Cola de trabajo con asignación, aprobación y actualización de estados | Azure App Service si se necesita una interfaz propia; primero revisar herramientas existentes | Automatiza pasos entre sistemas; no sustituye por sí solo la interfaz. |

Hipótesis inicial para probar: combinar Azure Monitor Workbooks (telemetría técnica), Power BI (indicadores del negocio) y n8n (integraciones y automatizaciones). Si la Torre necesita operar casos, asignarlos o aprobar acciones, revisar Azure App Service u otra herramienta operativa. No se debe agregar API Management, Azure Functions o infraestructura nueva hasta conocer el requisito.

## Contrato de práctica del webhook

```json
{
  "consulta": { "estado": "Demorada", "region": "Todas" },
  "origen": "laboratorio-eduardo",
  "limite": 50
}
```

Respuesta ilustrativa: `simulacion`, `filtros`, `resumen`, una muestra limitada de filas y un bloque `alcance`. En la conexión real también hay que definir status HTTP, validación, errores, paginación, límite de resultados, permisos e idempotencia cuando haya escrituras.

## Guardrails para la clase

- No guardar tokens, claves ni URLs privadas en el frontend ni en el repositorio.
- Usar datos inventados o anonimizados para probar.
- Distinguir resultado, inferencia y desconocido.
- Limitar filas de respuesta; no exponer datos innecesarios.
- Separar credenciales de prueba y producción y comenzar con permisos mínimos.
- Antes de enviar notificaciones o escribir datos, revisar destinatarios, deduplicación y posibilidad de reintento.

## Referencias técnicas

- [Azure Monitor data platform · métricas, logs y trazas](https://learn.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-overview-metrics)
- [n8n: guía de despliegue en Azure](https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-azure/)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview)
- [Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts)
- [Azure Monitor Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)
- [Azure Monitor alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview)
- [Power BI dashboards](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards)
- [Webhook node · n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook)
- [HTTP Request node · n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest)
