"use client";

import { useMemo, useState, type ReactNode } from "react";
import { alertas, operaciones } from "@/data/demo";
import AzureLesson from "@/components/AzureLesson";
import N8nGuide from "@/components/N8nGuide";
import VmN8nGuide from "@/components/VmN8nGuide";
import N8nConnectionGuide from "@/components/N8nConnectionGuide";

type Seccion = "guia" | "azure" | "conexion" | "hosting" | "n8n" | "torre" | "siguiente";
type EstadoFiltro = "Todos" | "Demorada" | "En riesgo" | "En curso" | "Completada";
const nav: { id: Seccion; numero: string; label: string; icon: string }[] = [
  { id: "guia", numero: "00", label: "Ruta de la clase", icon: "⌂" },
  { id: "azure", numero: "01", label: "Entender Azure", icon: "◈" },
  { id: "conexion", numero: "02", label: "Conectar mi n8n", icon: "↗" },
  { id: "n8n", numero: "03", label: "Laboratorio n8n", icon: "⌘" },
  { id: "torre", numero: "04", label: "Torre de Control", icon: "▤" },
  { id: "siguiente", numero: "05", label: "Próximos pasos", icon: "✓" },
  { id: "hosting", numero: "OPC", label: "Alojar n8n en Azure", icon: "▣" },
];

export default function Home() {
  const [section, setSection] = useState<Seccion>("guia");
  const [stateFilter, setStateFilter] = useState<EstadoFiltro>("Todos");
  const [regionFilter, setRegionFilter] = useState("Todas");
  const [ran, setRan] = useState(false);
  const coreStep = ["azure", "conexion", "n8n", "torre"].indexOf(section);
  const progress = section === "guia" ? 0 : coreStep < 0 ? 4 : coreStep + 1;

  const filtered = useMemo(() => operaciones.filter((item) =>
    (stateFilter === "Todos" || item.estado === stateFilter) &&
    (regionFilter === "Todas" || item.region === regionFilter)), [stateFilter, regionFilter]);
  const atrasadas = filtered.filter((item) => item.horas > item.sla);
  const enRiesgo = filtered.filter((item) => item.estado === "En riesgo");
  const total = filtered.reduce((sum, item) => sum + item.importe, 0);
  const answer = {
    simulacion: true,
    filtros: { estado: stateFilter, region: regionFilter },
    resumen: {
      registros_en_muestra: filtered.length,
      fuera_de_sla: atrasadas.length,
      en_riesgo: enRiesgo.length,
      importe_asociado_ars: total,
      alertas_azure_muestra: alertas.length,
      alertas_severas: alertas.filter((item) => item.nivel === "Severa").length,
    },
    operaciones: filtered.slice(0, 4).map(({ id, region, estado, servicio, horas, sla }) => ({ id, region, estado, servicio, horas, sla })),
    alertas: alertas.slice(0, 4).map(({ id, hora, servicio, nivel, señal, origen }) => ({ id, hora, servicio, nivel, señal, origen })),
    alcance: ["Se consultaron únicamente las tablas ficticias incluidas en este laboratorio.", "Las alertas no se correlacionan automáticamente con cada operación.", "No se consultó Azure ni ninguna fuente real.", "Fuera de SLA significa horas > SLA; el importe es inventado, no facturación real."],
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">E<span>+</span></div><div><strong>LAB / EDUARDO</strong><small>AZURE × N8N</small></div></div>
        <div className="side-label">RECORRIDO</div>
        <nav className="side-nav" aria-label="Secciones del laboratorio">
          {nav.map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={section === item.id ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">{item.icon}</span><span className="nav-copy"><span>{item.label}</span><small>MÓDULO {item.numero}</small></span>{section === item.id && <span className="nav-current" />}
          </button>)}
        </nav>
          <div className="sidebar-bottom"><div className="progress-head"><span>OBJETIVOS PRINCIPALES</span><b>{String(progress).padStart(2, "0")} / 04</b></div><div className="progress-track"><span style={{ width: `${(progress / 4) * 100}%` }} /></div><p>4 prácticas · hosting opcional</p><div className="safe-note"><span className="safe-dot" /> SIN CREDENCIALES EN LA DEMO</div></div>
      </aside>

      <div className="main-column">
        <header className="topbar"><div className="breadcrumb"><span>CLASE PRIVADA</span><i>/</i><b>EDUARDO</b></div><div className="topbar-right"><span className="status-pill"><span /> ENTORNO DE PRÁCTICA</span><div className="avatar">E</div></div></header>
        <div className="content-wrap">
          {section === "guia" && <>
            <div className="eyebrow"><span className="eyebrow-line" /> PLAN DE TRABAJO <span className="eyebrow-tag">BORRADOR 01</span></div>
            <div className="hero-grid"><div><h1>De los datos<br /><em>a una decisión.</em></h1><p className="hero-lede">Cuatro prácticas concretas: entender Azure, abrir tu n8n, ejecutar un workflow con tablas ficticias y elegir qué necesita la Torre de Control. No tenés que crear otra instancia para empezar.</p><div className="hero-actions"><button className="button-primary" onClick={() => setSection("azure")}>Empezar el recorrido <span>↗</span></button><span className="hero-meta">4 OBJETIVOS <i>·</i> WORKFLOW IMPORTABLE <i>·</i> SIN CREDENCIALES EN LA DEMO</span></div></div><div className="hero-art" aria-label="Diagrama conceptual de datos a decisión"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-center"><span>OPS</span><b>↗</b></div><div className="art-node node-azure"><span>◈</span> AZURE</div><div className="art-node node-n8n"><span>⌘</span> n8n</div><div className="art-node node-data"><span>▦</span> DATOS</div><div className="art-caption">UNA OPERACIÓN<br />BAJO LA LUPA</div></div></div>
            <div className="stat-row"><div className="stat-card"><span className="stat-icon violet">◈</span><div><small>PUNTO DE PARTIDA</small><b>Infraestructura Azure</b></div><span className="stat-arrow">01</span></div><div className="stat-card"><span className="stat-icon mint">⌘</span><div><small>PRÁCTICA IMPORTABLE</small><b>Tu instancia n8n</b></div><span className="stat-arrow">02</span></div><div className="stat-card"><span className="stat-icon orange">▤</span><div><small>DECISIÓN A EXPLORAR</small><b>Torre de Control</b></div><span className="stat-arrow">04</span></div></div>
            <div className="section-heading"><div><div className="eyebrow small"><span className="eyebrow-line" /> DISEÑO DE LA CLASE</div><h2>Aprender construyendo un caso.</h2></div><span className="section-hint">DE LO CONCRETO<br />A LO ARQUITECTÓNICO</span></div>
            <div className="module-grid">
              <button className="module-card" onClick={() => setSection("azure")}><div className="module-top"><span className="module-num">01</span><span className="module-mark violet">◈</span></div><h3>Entender Azure</h3><p>Leer un mapa visual de identidad, recursos, red, datos y monitoreo.</p><div className="module-foot"><span>VER EL MAPA + PRACTICAR</span><b>↗</b></div></button>
              <button className="module-card" onClick={() => setSection("conexion")}><div className="module-top"><span className="module-num">02</span><span className="module-mark mint">↗</span></div><h3>Conectar mi n8n</h3><p>Abrir tu instancia e importar el workflow listo, sin cargar claves en esta web.</p><div className="module-foot"><span>ABRIR + IMPORTAR</span><b>↗</b></div></button>
              <button className="module-card" onClick={() => setSection("n8n")}><div className="module-top"><span className="module-num">03</span><span className="module-mark blue">▦</span></div><h3>Jugar con los datos</h3><p>Filtrar 12 operaciones, sumar 4 alertas y discutir la respuesta del flujo.</p><div className="module-foot"><span>SIMULADOR + JSON</span><b>↗</b></div></button>
              <button className="module-card" onClick={() => setSection("torre")}><div className="module-top"><span className="module-num">04</span><span className="module-mark orange">⌖</span></div><h3>Diseñar la Torre</h3><p>Comparar herramientas según quién mira, qué decide y cada cuánto.</p><div className="module-foot"><span>COMPARAR + DECIDIR</span><b>↗</b></div></button>
            </div>
            <div className="optional-track"><div><span className="micro-label">CAMINO OPCIONAL</span><p>¿Todavía no tenés una instancia? Aprendé a alojar n8n en Azure; no es requisito para la ruta principal.</p></div><button onClick={() => setSection("hosting")}>Ver guía de VM →</button></div>
            <div className="question-banner"><div className="question-icon">?</div><div><span>LA PREGUNTA QUE UNE TODO</span><p>¿Qué podemos afirmar con los datos que realmente vimos?</p></div><button onClick={() => setSection("n8n")}>Ver la simulación <b>→</b></button></div>
            <footer className="footer-note">Prototipo didáctico inspirado en el laboratorio interactivo de la <a href="https://github.com/theduodecim/Clase_con_alexis" target="_blank" rel="noreferrer">clase de Alexis</a>. El simulador es local; la prueba opcional de n8n envía solo filtros ficticios a la Test URL que indiques.</footer>
          </>}

          {section === "azure" && <AzureLesson />}

          {section === "conexion" && <N8nConnectionGuide onOpenHosting={() => setSection("hosting")} />}

          {section === "hosting" && <VmN8nGuide />}

          {section === "n8n" && <>
            <PageIntro tag="MÓDULO 03 / LABORATORIO" title={<>Un workflow.<br /><em>Datos. Respuesta.</em></>} lead="Ejecutá la simulación acá o importá el workflow en tu n8n. En ambos casos podés filtrar registros ficticios y revisar el JSON y sus límites." />
            <div className="lab-entry-actions"><a className="button-primary" href="/workflows/torre-control-demo.json" download="torre-control-demo.json">Descargar workflow para n8n ↘</a><button onClick={() => setSection("conexion")}>Abrir guía de conexión →</button></div>
            <div className="lab-status"><span className="safe-dot"/> MODO SIMULACIÓN <i>·</i> 12 OPERACIONES <i>·</i> 4 ALERTAS DE MUESTRA <span>NINGUNA LLAMADA EXTERNA</span></div>
            <N8nGuide />
            <div className="workflow-card"><div className="card-title-row"><div><span className="micro-label">FLUJO INCLUIDO EN EL ARCHIVO IMPORTABLE</span><h2>De entrada a respuesta</h2></div><span className="workflow-version">WEBHOOK → CODE → JSON</span></div><div className="workflow-flow">{[{n:"01",name:"Webhook",sub:"entrada HTTP"},{n:"02",name:"Tablas demo",sub:"12 ops + 4 alertas"},{n:"03",name:"Filtrar",sub:"estado + región"},{n:"04",name:"Resumir",sub:"SLA + importe"},{n:"05",name:"Responder",sub:"JSON + alcance"}].map((x,i)=><div className="flow-step-wrap" key={x.n}><div className={ran ? "flow-step completed" : "flow-step"}><span>{x.n}</span><b>{x.name}</b><small>{x.sub}</small></div>{i < 4 && <div className={ran ? "flow-connector lit" : "flow-connector"}>→</div>}</div>)}</div><p className="flow-footnote"><b>Cuando pases a datos reales:</b> elegí el conector según la fuente: Azure SQL → Microsoft SQL; Blob → Azure Storage + Extract From File; API → HTTP Request. La muestra ejecutable no llama a esas fuentes ni a Azure API Management o Functions.</p></div>
            <div className="lab-grid"><div className="data-panel"><div className="card-title-row compact"><div><span className="micro-label">TABLA FICTICIA · OPERACIONES</span><h2>Registros de trabajo</h2></div><span className="count-badge">{filtered.length} / {operaciones.length}</span></div><div className="filter-row"><label>Estado<select value={stateFilter} onChange={(e) => {setStateFilter(e.target.value as EstadoFiltro); setRan(false);}}><option>Todos</option><option>Demorada</option><option>En riesgo</option><option>En curso</option><option>Completada</option></select></label><label>Región<select value={regionFilter} onChange={(e) => {setRegionFilter(e.target.value); setRan(false);}}><option>Todas</option><option>CABA</option><option>Norte</option><option>Sur</option></select></label><button className="button-primary run-button" onClick={() => setRan(true)}>{ran ? "Simulación ejecutada ✓" : "Ejecutar simulación →"}</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>REGIÓN</th><th>ESTADO</th><th>SERVICIO</th><th>HORAS / SLA</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td className="mono">{item.id}</td><td>{item.region}</td><td><StatusTag status={item.estado}/></td><td className="muted-cell">{item.servicio}</td><td className={item.horas > item.sla ? "late-cell" : ""}>{item.horas}h <i>/</i> {item.sla}h</td></tr>)}</tbody></table></div><div className="table-footer">Muestra inventada para la práctica <span>12 FILAS TOTALES</span></div></div>
              <div className="result-panel"><div className="result-head"><div><span className="micro-label">SALIDA DEL WEBHOOK</span><h2>¿Qué respondió?</h2></div><span className={ran ? "result-live on" : "result-live"}>{ran ? "● RESPUESTA LISTA" : "○ ESPERANDO"}</span></div>{ran ? <><div className="result-kpis"><div><small>REGISTROS</small><b>{filtered.length}</b></div><div><small>FUERA DE SLA</small><b className={atrasadas.length ? "text-warn" : ""}>{atrasadas.length}</b></div><div><small>EN RIESGO</small><b>{enRiesgo.length}</b></div></div><div className="json-output"><div className="json-top"><span>application / json</span><span>HTTP 200 · SIMULADO</span></div><pre>{JSON.stringify(answer, null, 2)}</pre></div><div className="interpretation"><b>LECTURA Y ALCANCE</b><p>La respuesta resume los registros filtrados. No demuestra que una alerta causó una demora ni confirma el estado actual de Azure.</p></div></> : <div className="empty-result"><div className="empty-orbit">↳</div><b>La respuesta aparece acá.</b><p>Elegí filtros y ejecutá la simulación para ver el body, los indicadores y las limitaciones del análisis.</p></div>}</div></div>
            <div className="alerts-table"><div className="card-title-row compact"><div><span className="micro-label">TABLA FICTICIA · SEÑALES AZURE</span><h2>Eventos de ejemplo</h2></div><span className="read-only">NO SON EVENTOS REALES</span></div><div className="alert-grid">{alertas.map((alert) => <div className="alert-row" key={alert.id}><span className={alert.nivel === "Severa" ? "alert-marker danger" : alert.nivel === "Advertencia" ? "alert-marker warning" : "alert-marker info"}/><b>{alert.id}</b><span>{alert.hora}</span><div><b>{alert.servicio}</b><small>{alert.señal}</small></div><span className="alert-source">{alert.origen}</span><StatusTag status={alert.nivel}/></div>)}</div></div>
          </>}

          {section === "torre" && <>
            <PageIntro tag="MÓDULO 04 / DECISIÓN DE HERRAMIENTA" title={<>Una Torre de Control<br /><em>empieza con preguntas.</em></>} lead="La herramienta depende de quién mira la operación, cada cuánto necesita actualizarse y qué acción debe tomar cuando aparece una excepción." />
            <div className="tower-callout"><span className="tower-icon">⌖</span><div><span>HIPÓTESIS DE TRABAJO PARA LA CLASE</span><b>Power BI sobre Azure SQL Database para KPIs + Azure Monitor Workbooks con Log Analytics / Application Insights para salud técnica + n8n para automatizar notificaciones y tareas.</b><p>Es un punto de partida, no una decisión final: falta validar usuarios, fuentes, frecuencia, licencias, red y acciones.</p></div></div>
            <div className="section-heading compact-heading"><div><div className="eyebrow small"><span className="eyebrow-line"/> CADA PIEZA RESUELVE ALGO DISTINTO</div><h2>¿Qué pondríamos en la Torre?</h2></div></div>
            <div className="tool-grid"><ToolCard icon="⌁" tone="blue" title="Azure Monitor Workbooks" role="Monitoreo técnico" does="Vistas interactivas con datos de Azure Monitor, Log Analytics workspace y Application Insights." best="Investigar latencia, errores, disponibilidad y señales de los recursos Azure." limit="Está pensado para observabilidad técnica; no reemplaza un modelo de KPIs del negocio." source="https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview" /><ToolCard icon="▥" tone="gold" title="Power BI" role="Indicadores de negocio" does="Informes y dashboards sobre un modelo semántico; puede leer datos preparados en Azure SQL Database." best="Ver volumen, SLA, tendencia y carga por región o equipo." limit="No sustituye la observabilidad de Azure ni ejecuta por sí solo los workflows." source="https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards" /><ToolCard icon="⌘" tone="green" title="n8n" role="Automatización" does="Webhook y HTTP Request conectan aplicaciones, APIs y fuentes con reglas y transformaciones." best="Al recibir un evento, consultar Azure SQL o una API y notificar por el canal acordado." limit="Es el orquestador de procesos; no es el tablero principal para explorar históricos y KPIs." source="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook" /><ToolCard icon="◩" tone="violet" title="Azure App Service" role="Portal operativo propio" does="Aloja una aplicación web o REST API sin administrar la infraestructura subyacente." best="Crear una interfaz con roles, casos asignables y acciones si Power BI y Workbooks no alcanzan." limit="Hay que desarrollar, desplegar, proteger y operar esa experiencia." source="https://learn.microsoft.com/en-us/azure/app-service/overview" /></div>
            <div className="decision-box"><div className="decision-head"><span className="micro-label">PREGUNTAS PARA CERRAR LA DECISIÓN</span><span className="read-only">PENDIENTE DE VALIDAR CON EDUARDO</span></div><div className="decision-questions"><div><b>01</b><span>¿Quién toma decisiones desde la Torre?</span><small>Operaciones · dirección · soporte · TI</small></div><div><b>02</b><span>¿Qué necesita ver y con qué frescura?</span><small>Tiempo real · cada 5 min · diario · semanal</small></div><div><b>03</b><span>¿Qué debe ocurrir ante una excepción?</span><small>Solo avisar · asignar · aprobar · ejecutar</small></div><div><b>04</b><span>¿De dónde salen los indicadores?</span><small>Azure · n8n · Excel/SQL · otras APIs</small></div></div></div>
            <div className="callout"><b>Siguiente experimento</b><span>Elegir 3 indicadores y dibujar su origen → cálculo → responsable → acción. Después se decide la herramienta.</span><button onClick={() => setSection("n8n")}>Volver a los datos →</button></div>
          </>}

          {section === "siguiente" && <>
            <PageIntro tag="MÓDULO 05 / ADAPTAR EL EJERCICIO REAL" title={<>Listos para pasar<br /><em>de simulado a real.</em></>} lead="La práctica ya se puede importar a n8n. Antes de consultar recursos reales, falta confirmar la instancia, su autenticación, sus fuentes de datos y la arquitectura Azure existente." />
            <div className="connect-grid"><div className="connect-main"><span className="micro-label">HOJA DE PREPARACIÓN</span><h2>Lo que necesitamos relevar</h2><div className="checklist">{[{n:"01",t:"Dónde corre n8n",d:"n8n Cloud no consume compute de Azure. Si es autohospedado, confirmar si está en AKS, Azure Container Instances o Linux VM; la guía de n8n usa AKS + PostgreSQL + volumen persistente."},{n:"02",t:"Cómo se autenticará",d:"Webhook de prueba, Microsoft Entra ID/OAuth o API key según el endpoint. Azure Key Vault puede guardar secretos de aplicaciones si se integra; n8n también tiene su propio almacén de credenciales."},{n:"03",t:"Qué puede consultar",d:"Confirmar si el origen es una API, Azure SQL Database, Storage Account / Blob Storage u otra tabla. Revisar esquema, llaves y si hace falta Azure API Management o Azure Functions como capa API."},{n:"04",t:"Red y permisos",d:"Azure RBAC controla acceso a recursos. Si hay Azure Private Endpoint, n8n necesita ruta de red/DNS hacia esa VNet; n8n Cloud no llega a un servicio privado por Internet sin conectividad preparada."},{n:"05",t:"Qué verá la Torre",d:"Azure Monitor Workbooks / Application Insights para salud técnica; Power BI para KPIs; n8n para notificaciones y acciones. Definir quién consume cada vista."}].map((item) => <div className="check-item" key={item.n}><span>{item.n}</span><div><b>{item.t}</b><p>{item.d}</p></div><i>○</i></div>)}</div></div><aside className="connect-aside"><div className="aside-lock">⌑</div><span className="micro-label">SEGURIDAD POR DISEÑO</span><h3>La URL y las credenciales no van en el frontend.</h3><p>Una conexión real se haría desde el servidor o desde nodos de n8n, con credenciales guardadas allí. Esta demo no pide ni almacena secretos.</p><div className="aside-rule"/><span className="micro-label">DOCUMENTACIÓN DE APOYO</span><a href="https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-azure/" target="_blank" rel="noreferrer">n8n autohospedado en Azure ↗</a><a href="https://learn.microsoft.com/en-us/azure/key-vault/general/overview" target="_blank" rel="noreferrer">Azure Key Vault ↗</a><a href="https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview" target="_blank" rel="noreferrer">Azure Private Endpoint ↗</a></aside></div>
            <div className="session-plan"><div className="session-title"><div><span className="micro-label">SECUENCIA SUGERIDA</span><h2>Propuesta para la primera sesión</h2></div><span className="read-only">AJUSTABLE A LA DURACIÓN</span></div><div className="session-steps"><div><small>01 · CONTEXTO</small><b>Mapa actual</b><span>Qué tiene en Azure y dónde está n8n.</span></div><div><small>02 · EXPLORAR</small><b>Conceptos Azure</b><span>Organización, recursos, identidad, datos y monitoreo.</span></div><div><small>03 · CONECTAR</small><b>Instancia existente</b><span>Abrir n8n e importar el workflow de demostración.</span></div><div><small>04 · PRACTICAR</small><b>Workflow de datos</b><span>Filtrar tablas ficticias y analizar respuesta y alcance.</span></div><div><small>05 · DISEÑAR</small><b>Torre de Control</b><span>Usuarios, preguntas, señales, KPIs y acciones.</span></div><div><small>06 · CERRAR</small><b>Próxima prueba</b><span>Definir qué fuente real se conectaría y con qué permiso.</span></div></div><p className="optional-session-note">Montar n8n en una VM queda como módulo opcional, solo si todavía no existe una instancia o se decide autohospedarla.</p></div>
          </>}
        </div>
      </div>
    </main>
  );
}

function PageIntro({ tag, title, lead }: { tag: string; title: ReactNode; lead: string }) {
  return <div className="page-intro"><div className="eyebrow"><span className="eyebrow-line" /> {tag}</div><h1>{title}</h1><p>{lead}</p></div>;
}
function StatusTag({ status }: { status: string }) {
  const cls = status === "Demorada" || status === "Severa" ? "tag red" : status === "En riesgo" || status === "Advertencia" ? "tag amber" : status === "Completada" || status === "Informativa" ? "tag green" : "tag slate";
  return <span className={cls}>{status}</span>;
}
function ToolCard({ icon, tone, title, role, does, best, limit, source }: { icon: string; tone: string; title: string; role: string; does: string; best: string; limit: string; source?: string }) {
  return <article className="tool-card"><div className="tool-top"><span className={`tool-icon ${tone}`}>{icon}</span><span className="micro-label">{role}</span></div><h3>{title}</h3><p>{does}</p><div className="tool-use"><b>CUÁNDO APORTA</b><span>{best}</span></div><div className="tool-limit"><b>NO CUBRE TODO</b><span>{limit}</span></div>{source && <a className="tool-source" href={source} target="_blank" rel="noreferrer">Documentación ↗</a>}</article>;
}
