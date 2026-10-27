"use client";

import { useState } from "react";

type Concept = {
  name: string;
  kind: string;
  explanation: string;
  purpose: string;
  boundary: string;
  source?: { label: string; href: string };
};

type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  analogy: string;
  concepts: Concept[];
  question: string;
  answer: string;
  observe: string;
  caution: string;
};

const microsoft = "https://learn.microsoft.com/en-us";
const n8nDocs = "https://docs.n8n.io";

const lessons: Lesson[] = [
  {
    id: "mapa",
    title: "1. Leer el mapa de Azure",
    subtitle: "Primero entendemos los límites de administración. Después elegimos productos.",
    concept: "La jerarquía organiza identidades, políticas, costos y recursos. No es la arquitectura de red de una aplicación.",
    analogy: "Pensalo como una organización con un directorio de personas, una estructura de presupuestos, carpetas de proyectos y servicios concretos. La comparación ayuda a orientarse; los permisos reales se configuran en Azure.",
    concepts: [
      { name: "Microsoft Entra ID tenant", kind: "IDENTIDAD", explanation: "El directorio donde viven usuarios, grupos y aplicaciones que pueden autenticarse en Microsoft Cloud. El tenant identifica el contexto de identidad de la organización.", purpose: "Ubicar quién inicia sesión y qué identidad de aplicación puede usar n8n o una API.", boundary: "No es una suscripción de facturación ni una máquina donde corre la aplicación.", source: { label: "Microsoft Entra ID", href: "https://learn.microsoft.com/en-us/entra/fundamentals/" } },
      { name: "Management Groups + Azure Policy", kind: "GOBIERNO", explanation: "Management Groups organizan suscripciones en una jerarquía. Azure Policy define reglas y evalúa si los recursos cumplen esas reglas en un alcance.", purpose: "Aplicar convenciones compartidas, como regiones permitidas o requisitos de etiquetas, a varias suscripciones.", boundary: "Policy no concede acceso a un usuario. Para eso está Azure RBAC.", source: { label: "Azure management groups", href: `${microsoft}/azure/governance/management-groups/overview` } },
      { name: "Azure subscription", kind: "ADMINISTRACIÓN Y COSTO", explanation: "Es un contenedor de administración y facturación. Aloja Resource Groups y recursos; también es un alcance habitual para asignar roles y revisar consumo.", purpose: "Separar, por ejemplo, desarrollo y producción o proyectos con costos distintos.", boundary: "Crear una suscripción no separa por sí solo el tráfico de red de sus recursos." },
      { name: "Azure Resource Group", kind: "AGRUPACIÓN", explanation: "Agrupa recursos Azure que se administran juntos. El nombre `rg-eduardo-lab-dev` que usamos en esta clase sería solo una convención ilustrativa.", purpose: "Encontrar qué recursos pertenecen a una solución, asignar permisos al conjunto y ordenar su ciclo de vida.", boundary: "No es una carpeta física ni una frontera de red. VNet y controles de red cumplen otro papel." },
      { name: "Azure region + Availability Zones", kind: "GEOGRAFÍA Y RESILIENCIA", explanation: "Una región es una ubicación geográfica Azure; las zonas son ubicaciones físicas independientes dentro de ciertas regiones y servicios compatibles.", purpose: "Elegir ubicación según residencia de datos, latencia, disponibilidad del servicio y resiliencia requerida.", boundary: "No todos los servicios ofrecen las mismas zonas en todas las regiones. La región de Eduardo queda por relevar.", source: { label: "Availability Zones", href: "https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview" } },
    ],
    question: "Si dos servicios están en el mismo Resource Group, ¿eso significa que están en la misma red privada?",
    answer: "No. El Resource Group es un alcance de administración. La conectividad se define con recursos de red como Azure Virtual Network, subnets, reglas y, cuando aplica, Private Endpoints.",
    observe: "Anotar qué tenant, subscriptions, Management Groups y Resource Groups existen. Dibujar la cadena de administración aparte del directorio de Microsoft Entra ID; marcar cada nombre como confirmado o pendiente.",
    caution: "No asumimos que Eduardo tenga una suscripción, Resource Group o región con estos nombres. Para saberlo hay que consultar su Azure Portal o inventario autorizado.",
  },
  {
    id: "acceso",
    title: "2. Separar identidad, permisos y reglas",
    subtitle: "Autenticarse, tener permiso y cumplir una política son tres cosas distintas.",
    concept: "Microsoft Entra ID dice quién sos; Azure RBAC define qué podés hacer; Azure Policy evalúa qué configuraciones se permiten o cumplen reglas.",
    analogy: "En un edificio: Entra ID es la credencial de la persona, RBAC es qué puertas puede abrir y Policy es la regla del edificio, como no guardar materiales en una zona prohibida.",
    concepts: [
      { name: "Microsoft Entra ID", kind: "AUTENTICACIÓN", explanation: "Autentica usuarios y aplicaciones. Para integraciones se puede usar una identidad de aplicación y un método de autenticación admitido por el servicio destino.", purpose: "Evitar cuentas personales compartidas y dar una identidad identificable a cada integración.", boundary: "Que una identidad pueda autenticarse no significa que tenga permisos sobre Azure SQL, Storage o una API." },
      { name: "Azure RBAC", kind: "AUTORIZACIÓN", explanation: "Asigna roles a identidades en un alcance, como Management Group, Subscription, Resource Group o recurso.", purpose: "Dar solo las operaciones necesarias; por ejemplo, lectura de un recurso en vez de permisos de administración de toda la suscripción.", boundary: "Un rol de control del recurso no necesariamente concede lectura de cada dato dentro del servicio. Revisar los permisos de datos también." },
      { name: "Azure Policy", kind: "GOBIERNO", explanation: "Define reglas, audita configuraciones y puede denegar o corregir ciertos despliegues según la política aplicada.", purpose: "Mantener normas comunes entre equipos y suscripciones.", boundary: "No sustituye Azure RBAC: una política conforme no implica que el usuario que la creó pueda administrar el recurso." },
      { name: "Azure Key Vault", kind: "SECRETOS Y CERTIFICADOS", explanation: "Servicio para guardar y controlar acceso a secretos, claves y certificados de una aplicación.", purpose: "Evitar poner API keys o connection strings en código, archivos del frontend o repositorios.", boundary: "Key Vault no configura automáticamente las credenciales guardadas dentro de n8n. Esa integración hay que diseñarla.", source: { label: "Key Vault overview", href: `${microsoft}/azure/key-vault/general/overview` } },
    ],
    question: "n8n logra iniciar sesión en Azure SQL, pero recibe un error de acceso a una tabla. ¿Qué revisarías primero?",
    answer: "La autenticación ya ocurrió; toca revisar autorización: el tipo de credencial, firewall/red, permisos de base de datos y el alcance mínimo que necesita la identidad. Azure RBAC y los permisos SQL no son siempre el mismo plano de autorización.",
    observe: "Para un recurso elegido, revisar quién tiene Azure RBAC y en qué scope; mirar el estado de cumplimiento de Azure Policy. Confirmar que los secretos están administrados, sin abrir ni copiar valores de Key Vault.",
    caution: "Para la clase no pegamos secretos en el navegador ni en el repo. Se usan credenciales de prueba guardadas en n8n o en el entorno servidor que corresponda.",
  },
  {
    id: "compute",
    title: "3. Entender dónde corre n8n",
    subtitle: "Hosting del workflow y servicios que el workflow consume son decisiones separadas.",
    concept: "n8n Cloud corre fuera de la suscripción Azure. Si Eduardo lo autohospeda, hay que identificar el compute y quién se ocupa de datos persistentes, backups, actualizaciones y red.",
    analogy: "n8n es el coordinador del proceso. Azure puede ser donde están los datos o las APIs, aunque el coordinador esté alojado en otro proveedor.",
    concepts: [
      { name: "n8n Cloud", kind: "SERVICIO GESTIONADO POR N8N", explanation: "La instancia no está alojada en el compute Azure de Eduardo. Desde n8n se pueden llamar APIs por HTTPS con las credenciales que soporte el endpoint.", purpose: "Evitar que el equipo administre servidores si ya usa el servicio Cloud.", boundary: "Un Azure Private Endpoint no queda accesible desde n8n Cloud solo por conocer su nombre; la red tiene que ofrecer una ruta autorizada." },
      { name: "Azure Kubernetes Service (AKS)", kind: "KUBERNETES ADMINISTRADO", explanation: "La guía oficial de n8n para Azure muestra un despliegue de n8n con AKS, PostgreSQL y volúmenes persistentes.", purpose: "Dar control sobre contenedores, red y escala cuando el equipo puede operar Kubernetes.", boundary: "Agrega trabajo de clúster, actualizaciones, seguridad, almacenamiento y recuperación. No es el punto de partida automático para una prueba individual.", source: { label: "n8n: deploy to Azure", href: `${n8nDocs}/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-azure/` } },
      { name: "Azure Container Instances / Linux VM", kind: "ALTERNATIVAS DE HOSTING", explanation: "La guía de n8n también enumera Azure Container Instances y Linux Virtual Machines como opciones. En la VM se administra además el sistema operativo; ACI ejecuta contenedores sin montar un clúster Kubernetes.", purpose: "Comparar menos piezas de plataforma contra más control y más tareas de operación.", boundary: "Revisar persistencia, backups, TLS, dominio, parches y disponibilidad antes de llamarlo producción." },
      { name: "PostgreSQL para n8n", kind: "BASE INTERNA DE N8N", explanation: "n8n autohospedado usa SQLite por defecto y soporta PostgreSQL. Su base interna conserva configuración, workflows y ejecuciones; no es la tabla de operaciones del negocio.", purpose: "Entender qué datos pertenecen a la aplicación n8n y cuáles consulta el workflow como datos de negocio.", boundary: "La versión de PostgreSQL admitida cambia con el tiempo. Verificar la documentación de n8n al preparar el despliegue.", source: { label: "n8n supported databases", href: `${n8nDocs}/deploy/host-n8n/configure-n8n/choose-n8ns-database/` } },
    ],
    question: "Si Eduardo tiene n8n Cloud, ¿necesita Azure Kubernetes Service para conectar una tabla de Azure?",
    answer: "No. AKS solo sería una opción si se decide autohospedar un workload en contenedores. n8n Cloud puede llamar un endpoint Azure autorizado; la conectividad privada, las credenciales y la fuente son lo que hay que resolver.",
    observe: "Confirmar con Eduardo dónde está alojada su instancia n8n y quién opera backups, actualizaciones y persistencia. Si es autohospedada, identificar el compute concreto; no deducirlo solo por la URL.",
    caution: "La decisión de esta clase es inspeccionar la instancia existente. No vamos a migrar n8n ni desplegar AKS, ACI o una VM sin un requisito y un plan de operación.",
  },
  {
    id: "datos-api",
    title: "4. Seguir el dato y la API",
    subtitle: "Elegimos cada servicio por el tipo de dato o problema que resuelve.",
    concept: "Una tabla transaccional, un archivo crudo y una API son componentes distintos. n8n puede coordinarlos; no hace falta sumar servicios si ya hay una fuente adecuada.",
    analogy: "Azure SQL es una tabla de oficina con relaciones y consultas; Blob Storage es un depósito de archivos; API Management es la recepción que valida y regula llamadas a APIs.",
    concepts: [
      { name: "Azure SQL Database", kind: "BASE RELACIONAL PaaS", explanation: "Base de datos SQL administrada por Azure para información estructurada como operaciones, responsables, SLA y estados.", purpose: "Consultar y relacionar datos tabulares con claves y filtros definidos.", boundary: "No conviene meter cada archivo original en tablas sin entender volumen, esquema, retención y consultas.", source: { label: "Azure SQL Database", href: `${microsoft}/azure/azure-sql/database/sql-database-paas-overview` } },
      { name: "Storage Account · Blob Storage", kind: "OBJETOS Y ARCHIVOS", explanation: "Blob Storage guarda objetos no estructurados, por ejemplo CSV, JSON original, documentos o adjuntos.", purpose: "Mantener archivos y contenido crudo accesible por HTTPS o por una red Azure autorizada.", boundary: "Blob no ofrece por sí mismo consultas relacionales como SQL. Definir contenedor, permisos, retención y protección de acceso.", source: { label: "Azure Blob Storage", href: `${microsoft}/azure/storage/blobs/storage-blobs-introduction` } },
      { name: "Azure API Management", kind: "PUERTA DE ENTRADA A APIs", explanation: "Publica APIs y puede centralizar autenticación, cuotas, rate limits, transformación y observabilidad de solicitudes.", purpose: "Cuando una API se comparte entre clientes/equipos y hace falta gobierno común.", boundary: "Es opcional para una primera llamada si ya existe un endpoint seguro y mantenible. No es una base de datos.", source: { label: "API Management concepts", href: `${microsoft}/azure/api-management/api-management-key-concepts` } },
      { name: "Azure Functions / App Service", kind: "CÓDIGO O APLICACIÓN", explanation: "Functions ejecuta lógica HTTP o activada por eventos. App Service aloja aplicaciones web y APIs REST. n8n puede llamar sus endpoints.", purpose: "Agregar lógica propia cuando no existe API adecuada o se necesita una interfaz web específica.", boundary: "No agregarlas por reflejo: más componentes implican despliegue, permisos, monitoreo y costos.", source: { label: "Azure Functions", href: `${microsoft}/azure/azure-functions/functions-overview` } },
    ],
    question: "La Torre debe mostrar si hay pedidos fuera de SLA. ¿Guardarías ese KPI en Blob o lo consultarías desde una tabla?",
    answer: "Primero confirmaría la fuente de verdad. Si las operaciones ya son filas en Azure SQL Database, se pueden consultar/agregar desde ahí y después visualizar en Power BI. Blob encaja mejor para los CSV/JSON originales o archivos. No duplicaría el dato sin necesidad.",
    observe: "Buscar qué fuente contiene hoy operaciones y alertas: SQL Database, un contenedor Blob, API u otra plataforma. Confirmar los nombres de columnas, claves, tipos y responsable de cada dato antes de proponer una consulta.",
    caution: "Los CSV de este laboratorio viven en el repo y son inventados. No son Azure SQL Database ni un Storage Account de Eduardo.",
  },
  {
    id: "red",
    title: "5. Dibujar el camino de red",
    subtitle: "Tener una URL no garantiza que la ruta sea accesible desde n8n.",
    concept: "La aplicación cliente debe poder resolver el nombre, llegar por la ruta de red y autenticarse. Los tres pasos se revisan por separado.",
    analogy: "Una dirección identifica el destino; la red determina si existe camino hasta ese lugar; la credencial demuestra quién está intentando entrar.",
    concepts: [
      { name: "Azure Virtual Network (VNet) + subnet", kind: "RED PRIVADA", explanation: "Una VNet define un espacio de red privado y sus subnets agrupan interfaces/rutas de recursos. Los controles de red filtran tráfico según el diseño.", purpose: "Limitar la comunicación a los servicios, clientes y rutas esperadas.", boundary: "Poner dos recursos en Azure no los coloca automáticamente en la misma VNet ni permite el tráfico entre ellos." },
      { name: "Azure Private Endpoint", kind: "PRIVATE LINK", explanation: "Asigna una IP privada de la VNet para conectarse a un servicio Azure compatible mediante Private Link.", purpose: "Hacer que una aplicación en la red autorizada alcance Azure SQL o Blob sin usar el endpoint público como ruta de datos.", boundary: "También hay que configurar DNS y ruta desde el cliente. Una instancia n8n fuera de esa red no llega de manera automática.", source: { label: "Private Endpoint overview", href: `${microsoft}/azure/private-link/private-endpoint-overview` } },
      { name: "Endpoint público + autenticación", kind: "ACCESO HTTPS", explanation: "Un servicio puede aceptar tráfico por endpoint público y controlar la llamada con identidad, credenciales, firewall y políticas del servicio.", purpose: "Permitir integración SaaS a SaaS cuando la política de la organización lo admite.", boundary: "Público no significa anónimo ni seguro por defecto; privado tampoco reemplaza la autenticación." },
    ],
    question: "n8n Cloud tiene la URL de un Azure SQL con Private Endpoint. ¿Qué falta para poder llamarlo?",
    answer: "Falta conectividad desde n8n hacia la VNet que contiene el Private Endpoint, además de resolución DNS privada y permisos de autenticación/autorización. La URL sola no crea un túnel de red.",
    observe: "Para el servicio y el cliente, dibujar el origen y destino de red; registrar si SQL tiene acceso público o Private Endpoint, qué VNet/subnet/DNS intervienen y desde dónde corre n8n. No modificar firewall ni DNS durante el relevamiento.",
    caution: "No abrimos firewall ni cambiamos endpoints por conveniencia didáctica. Primero verificamos las reglas existentes con el responsable de la suscripción.",
  },
  {
    id: "torre",
    title: "6. Observar y decidir",
    subtitle: "La Torre mezcla preguntas técnicas y de negocio; no todas viven en la misma herramienta.",
    concept: "Azure Monitor observa recursos; Power BI analiza indicadores operativos; n8n ejecuta automatizaciones. Un tablero puede mostrar una señal sin probar la causa de un problema.",
    analogy: "Azure Monitor es el tablero de diagnóstico del motor; Power BI es el resumen de la operación; n8n es quien inicia una tarea cuando ocurre un evento.",
    concepts: [
      { name: "Azure Monitor", kind: "PLATAFORMA DE MONITOREO", explanation: "Recopila y analiza señales de Azure y otras fuentes. Métricas son series numéricas; logs son registros de eventos. Las alertas evalúan condiciones configuradas.", purpose: "Detectar latencia, errores, disponibilidad o saturación y empezar el diagnóstico.", boundary: "Una alerta técnica no es automáticamente un KPI del negocio ni demuestra que causó un retraso.", source: { label: "Azure Monitor data platform", href: `${microsoft}/azure/monitoring-and-diagnostics/monitoring-overview-metrics` } },
      { name: "Log Analytics workspace + KQL", kind: "CONSULTAR LOGS", explanation: "El workspace concentra tablas de logs y permite consultarlas con Kusto Query Language (KQL). Una consulta define qué rango y qué filas se muestran.", purpose: "Buscar errores por tiempo, recurso, estado o identificador de solicitud.", boundary: "La consulta solo ve datos que realmente se enviaron al workspace y que la identidad tiene permiso de leer." },
      { name: "Application Insights", kind: "TELEMETRÍA DE APLICACIONES", explanation: "Recoge información de solicitudes, dependencias, excepciones y trazas de una aplicación instrumentada.", purpose: "Seguir la experiencia de una solicitud a través de componentes y revisar latencia o errores.", boundary: "Si la aplicación no está instrumentada o no envía esos datos, no hay trazas mágicas para consultar." },
      { name: "Azure Monitor Workbooks", kind: "VISTA TÉCNICA", explanation: "Combina texto, parámetros, métricas y consultas de logs en reportes interactivos dentro de Azure Portal.", purpose: "Investigar y compartir una vista sobre salud y diagnóstico técnico.", boundary: "No sustituye un modelo semántico y un dashboard de KPI empresarial en Power BI.", source: { label: "Azure Workbooks overview", href: `${microsoft}/azure/azure-monitor/visualize/workbooks-overview` } },
      { name: "Power BI + n8n", kind: "NEGOCIO Y ACCIÓN", explanation: "Power BI presenta informes y dashboards sobre datos preparados. n8n puede disparar o coordinar integraciones, notificaciones y pasos de un proceso.", purpose: "Power BI responde ‘cómo va la operación’; n8n puede actuar cuando se cumple una condición autorizada.", boundary: "No elegir una herramienta antes de definir quién mira, qué decisión toma, con qué frecuencia y qué acción se espera.", source: { label: "Power BI dashboards", href: "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards" } },
    ],
    question: "Vemos una alerta de Azure Monitor y cuatro pedidos demorados. ¿Podemos concluir que la alerta causó las demoras?",
    answer: "No con esos datos solamente. Para relacionarlos harían falta marcas de tiempo comparables, una llave/correlación entre el servicio y la operación, y una regla que respalde la conclusión. En la demo son tablas inventadas e independientes.",
    observe: "Revisar si los recursos envían logs a un Log Analytics workspace, si las aplicaciones reportan telemetría a Application Insights y qué consulta utiliza el Workbook. Si no aparecen datos, verificar el diagnóstico configurado antes de concluir que no existen.",
    caution: "La combinación Workbooks + Power BI + n8n es una hipótesis para enseñar roles distintos, no una compra ni una arquitectura final para Eduardo.",
  },
];

export default function AzureLesson() {
  const [active, setActive] = useState(0);
  const [hosting, setHosting] = useState<"cloud" | "self">("cloud");
  const lesson = lessons[active];

  return (
    <div className="azure-learning">
      <header className="azure-learn-hero">
        <div className="eyebrow"><span className="eyebrow-line" /> MÓDULO 01 / AZURE DESDE CERO</div>
        <h1>Entender Azure<br /><em>pieza por pieza.</em></h1>
        <p>Leemos los límites, identificamos qué servicio resuelve cada necesidad y seguimos el camino de n8n hasta los datos y el monitoreo. La idea es que puedas explicar el mapa con tus palabras.</p>
      </header>

      <div className="learning-key"><span><i className="key-dot real" /> Producto Azure real</span><span><i className="key-dot example" /> Ejemplo de clase</span><span><i className="key-dot pending" /> Cuenta de Eduardo por verificar</span></div>

      <section className="azure-hierarchy-card">
        <div className="learn-section-heading"><div><span className="micro-label">PRIMERA PREGUNTA · ¿QUÉ CONTIENE LA CUENTA?</span><h2>La jerarquía de administración</h2></div><span className="read-only">CONCEPTOS · NO ES INVENTARIO REAL</span></div>
        <div className="identity-context"><span>PLANO DE IDENTIDAD</span><b>Microsoft Entra ID tenant</b><small>Directorio de usuarios y aplicaciones. Azure RBAC vincula identidades con roles en distintos alcances.</small></div>
        <div className="hierarchy-track">
          {[
            ["Management Groups", "políticas a varias subs."],
            ["Azure subscription", "administración y costo"],
            ["Resource Group", "recursos relacionados"],
            ["Resources", "servicios concretos"],
          ].map(([name, detail], i) => <div className="hierarchy-track-item" key={name}><div className="hierarchy-track-node"><span>0{i + 1}</span><b>{name}</b><small>{detail}</small></div>{i < 3 && <span className="hierarchy-track-arrow">→</span>}</div>)}
        </div>
        <p className="hierarchy-foot">La cadena muestra gobierno y administración: Management Groups pueden contener suscripciones; estas contienen Resource Groups y recursos. Microsoft Entra ID es el plano de identidad, no el primer eslabón de esa jerarquía. Región y red son dimensiones aparte.</p>
      </section>

      <section className="n8n-architecture-card">
        <div className="learn-section-heading"><div><span className="micro-label">EJEMPLO GUIADO · ¿DÓNDE CORRE EL ORQUESTADOR?</span><h2>Una misma integración, dos lugares para n8n</h2></div><span className="read-only">TOCÁ UNA OPCIÓN</span></div>
        <div className="hosting-toggle" role="group" aria-label="Lugar de hosting de n8n">
          <button className={hosting === "cloud" ? "selected" : ""} onClick={() => setHosting("cloud")}>n8n Cloud <small>fuera de Azure</small></button>
          <button className={hosting === "self" ? "selected" : ""} onClick={() => setHosting("self")}>Autohospedado <small>AKS / ACI / Linux VM</small></button>
        </div>
        <div className="integration-origin"><div className="integration-node n8n-node"><span>ORQUESTADOR</span><b>{hosting === "cloud" ? "n8n Cloud" : "n8n en Azure"}</b><small>{hosting === "cloud" ? "el entorno n8n realiza la conexión" : "AKS / ACI / Linux VM"}</small></div><span className="integration-arrow">elige la ruta según la fuente ↓</span></div>
        <div className="azure-path-options">
          <article><span>RUTA A · TABLAS</span><b>Azure SQL Database</b><small>n8n: nodo Microsoft SQL</small><p>Consulta SQL con credenciales, permisos de base y conectividad autorizada.</p></article>
          <article><span>RUTA B · ARCHIVOS</span><b>Storage Account · Blob</b><small>n8n: Azure Storage → Extract From File</small><p>Azure Storage obtiene el blob; Extract From File convierte el CSV binario en filas JSON para el workflow.</p></article>
          <article><span>RUTA C · API</span><b>API REST existente</b><small>n8n: nodo HTTP Request</small><p>Azure API Management puede gobernar la API; Azure Functions puede implementar lógica si se necesita.</p></article>
        </div>
        <div className={hosting === "cloud" ? "hosting-explanation cloud-explanation" : "hosting-explanation self-explanation"}>
          {hosting === "cloud" ? <><b>¿Qué cambia?</b><p>n8n Cloud no gasta compute de la suscripción Azure de Eduardo. Necesita una URL HTTPS y una autenticación aceptada por el API. Si la base usa Azure Private Endpoint, hace falta resolver conectividad de red privada; la URL no basta.</p></> : <><b>¿Qué cambia?</b><p>El equipo opera el runtime, actualizaciones, dominio/TLS, red, persistencia y backups. La guía de n8n para Azure muestra AKS + PostgreSQL + volúmenes persistentes; menciona ACI y Linux VM como alternativas. Eso añade responsabilidad operacional.</p></>}
        </div>
        <div className="telemetry-flow"><span>SEÑALES DE SERVICIOS</span><b>Azure Monitor</b><i>→</i><b>Log Analytics workspace / Application Insights</b><i>→</i><b>Azure Monitor Workbooks</b><small>Power BI puede consumir datos de negocio preparados; n8n coordina acciones, no reemplaza esas vistas.</small></div>
        <div className="source-links"><a href={`${n8nDocs}/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-azure/`} target="_blank" rel="noreferrer">Guía n8n para Azure ↗</a><a href={`${n8nDocs}/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql/`} target="_blank" rel="noreferrer">Nodo Microsoft SQL ↗</a><a href={`${n8nDocs}/integrations/builtin/app-nodes/n8n-nodes-base.azurestorage/`} target="_blank" rel="noreferrer">Nodo Azure Storage ↗</a><a href={`${n8nDocs}/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/`} target="_blank" rel="noreferrer">Nodo Extract From File ↗</a></div>
      </section>

      <div className="azure-lesson-layout">
        <nav className="lesson-stepper" aria-label="Lecciones de Azure">
          <span className="micro-label">RECORRIDO · {lessons.length} PASOS</span>
          {lessons.map((item, i) => <button key={item.id} className={active === i ? "lesson-step active" : "lesson-step"} onClick={() => setActive(i)}><span className="lesson-step-number">{String(i + 1).padStart(2, "0")}</span><span><b>{item.title.replace(/^\d+\. /, "")}</b><small>{item.subtitle}</small></span>{active === i && <i>●</i>}</button>)}
          <div className="lesson-progress"><span>PROGRESO</span><b>{String(active + 1).padStart(2, "0")} / 0{lessons.length}</b><div><i style={{ width: `${((active + 1) / lessons.length) * 100}%` }} /></div></div>
        </nav>

        <article className="lesson-detail" key={lesson.id}>
          <header><span className="micro-label">PASO {String(active + 1).padStart(2, "0")} · SERVICIOS Y CONCEPTOS</span><h2>{lesson.title}</h2><p>{lesson.subtitle}</p></header>
          <div className="lesson-concept-callout"><b>La idea central</b><p>{lesson.concept}</p></div>
          <div className="concept-card-grid">
            {lesson.concepts.map((item, i) => <section className="explainer-card" key={item.name}>
              <div className="explainer-card-heading"><span>{String(i + 1).padStart(2, "0")}</span><div><small>{item.kind}</small><h3>{item.name}</h3></div></div>
              <div className="explainer-row"><b>QUÉ ES</b><p>{item.explanation}</p></div>
              <div className="explainer-row"><b>PARA QUÉ SIRVE</b><p>{item.purpose}</p></div>
              <div className="explainer-boundary"><b>NO CONFUNDIR</b><p>{item.boundary}</p></div>
              {item.source && <a className="explainer-source" href={item.source.href} target="_blank" rel="noreferrer">{item.source.label} ↗</a>}
            </section>)}
          </div>
          <div className="analogy-card"><span>UNA FORMA SIMPLE DE RECORDARLO</span><p>{lesson.analogy}</p></div>
          <div className="portal-observation"><b>EN AZURE · QUÉ RELEVAR</b><p>{lesson.observe}</p></div>
          <div className="caution-card"><b>Alcance y cuidado</b><p>{lesson.caution}</p></div>
          <details className="knowledge-check"><summary><span>CHEQUEO DE COMPRENSIÓN</span>{lesson.question}</summary><div><b>Respuesta de apoyo</b><p>{lesson.answer}</p></div></details>
          <div className="lesson-nav-buttons"><button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>← Paso anterior</button><button onClick={() => setActive(Math.min(lessons.length - 1, active + 1))} disabled={active === lessons.length - 1}>Siguiente paso →</button></div>
        </article>
      </div>
      <p className="azure-source-note">Los productos y sus roles se explican con documentación oficial. Los nombres de Resource Group y la arquitectura de ejemplo son didácticos; nada aquí confirma qué recursos existen en la cuenta de Eduardo.</p>
    </div>
  );
}
