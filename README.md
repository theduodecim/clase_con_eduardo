# Eduardo · Laboratorio Azure + n8n

Prototipo didáctico inspirado en el laboratorio interactivo de `Clase_con_alexis/frontend`. Lleva esa idea a los temas que Eduardo pidió: entender su infraestructura Azure, conectar n8n, practicar con tablas ficticias y definir qué herramienta conviene para una Torre de Control.

## Qué contiene

- **Ruta de la clase:** objetivos, recorrido y preguntas centrales.
- **Entender Azure:** lección progresiva de seis pasos. Explica Microsoft Entra ID, Management Groups, Azure Policy, subscriptions/RBAC, Resource Groups, AKS/VM/ACI, Azure SQL Database, Blob Storage, API Management, Functions, Key Vault, VNet/Private Endpoint y Azure Monitor con analogías, diferencias, preguntas y fuentes oficiales.
- **Montar n8n en Azure:** guía interactiva para crear una Linux Azure Virtual Machine, configurar VNet/subnet/NSG, restringir SSH, instalar Docker Compose, publicar HTTPS con Traefik y conservar n8n en un volumen persistente.
- **Laboratorio n8n:** guía progresiva sobre los nodos Webhook, Microsoft SQL, Azure Storage, Extract From File, HTTP Request, Filter, Aggregate y Respond to Webhook, seguida de la simulación local con 12 operaciones y 4 alertas ficticias.
- **Torre de Control:** comparación entre Azure Monitor Workbooks, Power BI, n8n y Azure App Service para un portal propio, con preguntas abiertas para tomar la decisión.
- **Conectar y avanzar:** relevamiento para pasar de un ejemplo simulado a la instancia y los recursos reales de Eduardo.

## Alcance actual

La aplicación no llama a Azure ni a n8n. No necesita credenciales, no modifica recursos y no supone dónde corre n8n. Los datos son inventados y tienen fines de enseñanza. La sugerencia inicial (Power BI + Azure Monitor Workbooks + n8n) es una hipótesis que debe validarse con usuarios, indicadores, fuentes, frecuencia, red, acciones, permisos y presupuesto.

Antes de conectar una instancia real, confirmar si n8n es Cloud o autohospedado, su URL, autenticación permitida y API/tablas disponibles. Las credenciales deben quedar en el servidor o en n8n; nunca en el navegador.

## Correr localmente

Requiere Node.js 20.9 o superior.

```bash
cd frontend
npm install
npm run dev
```

Abrir <http://localhost:3000>. `npm run build` genera el build de producción.

## Estructura

| Ruta | Contenido |
|---|---|
| `frontend/` | Aplicación web del laboratorio, siguiendo la estructura del repo de Alexis |
| `frontend/src/app/page.tsx` | Navegación, módulos y simulador interactivo |
| `frontend/src/app/globals.css` | Sistema visual adaptable a escritorio y móvil |
| `frontend/src/components/AzureLesson.tsx` | Recorrido de Azure en seis pasos, con explicación y chequeos de comprensión |
| `frontend/src/components/N8nGuide.tsx` | Recorrido de n8n: entrada, selección del nodo Azure, transformación y respuesta |
| `frontend/src/components/VmN8nGuide.tsx` | Creación didáctica de VM y configuración de n8n autohospedado con Docker Compose |
| `frontend/src/data/demo.ts` | Tablas ficticias usadas por el simulador |
| `data/` | Copias CSV de las tablas, listas para importar en la práctica de n8n |
| `docs/plan-de-clase.md` | Guion para una primera sesión |
| `docs/decisiones-de-arquitectura.md` | Preguntas de arquitectura y criterios para la Torre |
| `docs/workflow-n8n.md` | Diseño del workflow para trasladar a la instancia de Eduardo |
| `docs/servicios-azure.md` | Mapa concreto de servicios Azure y opciones para alojar/conectar n8n |
| `docs/azure-vm-n8n.md` | Tutorial paso a paso de VM, puertos, Docker, dominio, HTTPS, persistencia, backups y diagnóstico |
| `deployment/azure-vm-n8n/` | Plantillas `.env.example` y `compose.yaml.example` sin credenciales |

## Referencias

- [Repositorio de Alexis](https://github.com/theduodecim/Clase_con_alexis)
- [Azure architecture fundamentals · Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/)
- [Azure Monitor data platform · Microsoft Learn](https://learn.microsoft.com/en-us/azure/monitoring-and-diagnostics/monitoring-overview-metrics)
- [Mapa de servicios Azure para Eduardo](docs/servicios-azure.md)
- [Power BI dashboards · Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards)
- [n8n Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook)
- [n8n HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest)
