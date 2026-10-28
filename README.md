# Eduardo · Laboratorio Azure + n8n

Prototipo didáctico inspirado en el laboratorio interactivo de `Clase_con_alexis/frontend`. Lleva esa idea a los temas que Eduardo pidió: entender su infraestructura Azure, conectar n8n, practicar con tablas ficticias y definir qué herramienta conviene para una Torre de Control.

## Qué contiene

- **Ruta de la clase:** cuatro objetivos principales con acceso directo a cada práctica.
- **Entender Azure:** lección progresiva de seis pasos. Explica Microsoft Entra ID, Management Groups, Azure Policy, subscriptions/RBAC, Resource Groups, AKS/VM/ACI, Azure SQL Database, Blob Storage, API Management, Functions, Key Vault, VNet/Private Endpoint y Azure Monitor con analogías, diferencias, preguntas y fuentes oficiales.
- **Conectar mi n8n:** abrir una instancia Cloud o autohospedada e importar el workflow de demostración; no requiere crear otra VM.
- **Workflow importable:** `frontend/public/workflows/torre-control-demo.json` recibe un POST, filtra 12 operaciones inventadas, agrega 4 alertas independientes y devuelve un JSON con alcance y límites.
- **Laboratorio visual:** filtros, tabla y respuesta simulada en el navegador para explorar el mismo caso sin necesitar una instancia n8n.
- **Montar n8n en Azure (opcional):** guía interactiva para crear una Linux Azure Virtual Machine, configurar VNet/subnet/NSG, restringir SSH, instalar Docker Compose, publicar HTTPS con Traefik y conservar n8n en un volumen persistente.
- **Torre de Control:** comparación entre Azure Monitor Workbooks, Power BI, n8n y Azure App Service para un portal propio, con preguntas abiertas para tomar la decisión.
- **Conectar y avanzar:** relevamiento para pasar de un ejemplo simulado a la instancia y los recursos reales de Eduardo.

## Alcance actual

El workflow usa solo las tablas ficticias incluidas y no consulta Azure ni otra fuente real. Importalo inactivo y probalo con la Test URL. La guía puede enviar un POST con filtros ficticios directamente a la Test URL que indiques; no guarda URLs ni credenciales y no acepta la ruta de producción. No publiques el webhook sin configurar autenticación o una restricción de acceso adecuada.

La sugerencia inicial (Power BI + Azure Monitor Workbooks + n8n) es una hipótesis que debe validarse con usuarios, indicadores, fuentes, frecuencia, red, acciones, permisos y presupuesto. Crear una VM es un camino opcional, no un requisito para conectar n8n Cloud o una instancia existente.

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
| `frontend/src/components/N8nConnectionGuide.tsx` | Abrir instancia n8n, descargar/importar el workflow y ejecutar una prueba |
| `frontend/src/components/N8nGuide.tsx` | Simulación visual y explicación del flujo de datos |
| `frontend/src/components/VmN8nGuide.tsx` | Creación didáctica de VM y configuración de n8n autohospedado con Docker Compose |
| `frontend/public/workflows/torre-control-demo.json` | Workflow importable de n8n con datos de ejemplo y respuesta JSON |
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
- [Workflow n8n importable y guía de prueba](docs/workflow-n8n.md)
- [Power BI dashboards · Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards)
- [n8n Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook)
- [n8n HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest)
