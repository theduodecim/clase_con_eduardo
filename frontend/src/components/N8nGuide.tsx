"use client";

import { useState } from "react";

type GuideStep = {
  title: string;
  subtitle: string;
  central: string;
  why: string;
  boundary: string;
  question: string;
  answer: string;
  observe: string;
  sources: { label: string; href: string }[];
};

const steps: GuideStep[] = [
  {
    title: "1. Webhook: recibir una solicitud",
    subtitle: "Es la puerta de entrada que puede iniciar una ejecución.",
    central: "El Webhook de n8n es un nodo trigger: recibe una petición HTTP y le pasa sus datos al workflow.",
    why: "Un sistema, una aplicación o una llamada de prueba envía un método (por ejemplo POST), una ruta y un body. Para este caso, el body puede incluir estado y región. El Webhook no consulta Azure por sí solo: solo inicia el flujo y aporta la entrada.",
    boundary: "La URL de prueba se escucha durante la prueba del workflow. La URL de producción corresponde al workflow publicado. Esta pantalla del laboratorio no llama a ninguna de las dos: simula localmente el mismo tipo de filtros.",
    question: "Si tengo la URL de un Webhook, ¿ya conecté n8n con Azure SQL?",
    answer: "No. La URL permite invocar el workflow. Para leer Azure SQL se necesita además un nodo de acceso a SQL, credenciales y conectividad desde el entorno donde corre n8n.",
    observe: "En el nodo Webhook, localizar método, path, tipo de autenticación y modo de respuesta. En una ejecución de prueba, inspeccionar el JSON recibido en Input; ocultar la URL y cualquier dato sensible al compartir una captura.",
    sources: [{ label: "Webhook node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/" }],
  },
  {
    title: "2. Elegir el nodo según el origen",
    subtitle: "La fuente determina cómo se autentica y cómo se lee el dato.",
    central: "Azure SQL, Blob Storage y una API son interfaces distintas. En n8n elegimos un nodo compatible con cada una.",
    why: "El nodo adecuado traduce la operación del workflow al protocolo que entiende la fuente. Identificarlo ayuda a saber qué credenciales, red y formato de respuesta hacen falta.",
    boundary: "Azure API Management administra el acceso a APIs; no es una base de datos ni un sustituto automático del nodo de SQL o Blob. Azure Functions sirve para lógica/API propia cuando existe ese requisito.",
    question: "¿Qué nodo probarías si la fuente confirmada es una tabla de Azure SQL Database?",
    answer: "El nodo Microsoft SQL de n8n, siempre que la instancia y la conectividad admitan la conexión. HTTP Request se reserva para un endpoint HTTP/API.",
    observe: "Seguir el output de cada nodo: columnas y cantidad de filas para SQL; tipo y contenido del archivo para Blob; status y JSON para API. Revisar que la credencial esté seleccionada, sin exponer su valor.",
    sources: [
      { label: "Microsoft SQL node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql/" },
      { label: "Azure Storage node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.azurestorage/" },
      { label: "HTTP Request node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/" },
    ],
  },
  {
    title: "3. Transformar registros en una respuesta útil",
    subtitle: "Cada fila se convierte en datos que otros nodos pueden filtrar y resumir.",
    central: "Un nodo Filter puede quedarse con las filas que cumplen condiciones; IF separa caminos; Aggregate reúne varios resultados en un resumen.",
    why: "En el ejemplo, Estado = Demorada y Región = Norte deja dos operaciones: OP-1046 y OP-1052. En ambas horas > SLA, así que la muestra tiene dos registros fuera de SLA.",
    boundary: "Al leer CSV o SQL hay que confirmar el esquema y los tipos. Si horas o SLA llegan como texto, convertirlos antes de comparar. Los filtros no convierten una coincidencia en una explicación causal.",
    question: "La alerta AZ-201 y la operación OP-1042 mencionan n8n-webhook. ¿Eso demuestra que la alerta causó la demora?",
    answer: "No. Compartir el nombre del servicio y ocurrir en la misma jornada solo sugiere algo para investigar. Harían falta marcas de tiempo precisas, identificadores de correlación y evidencia del recorrido de la solicitud.",
    observe: "Comparar el número de items antes y después de Filter; abrir una fila y confirmar que horas y SLA sean números. Después de Aggregate, comprobar que la salida conserve los totales esperados.",
    sources: [
      { label: "Filter node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.filter/" },
      { label: "Aggregate node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.aggregate/" },
    ],
  },
  {
    title: "4. Respond to Webhook: devolver el resultado",
    subtitle: "La persona o sistema que llamó recibe un código HTTP y un body.",
    central: "El nodo Respond to Webhook permite definir qué JSON y qué código HTTP recibe quien envió la petición.",
    why: "Se conecta después de los nodos que preparan el resultado. Para esta práctica, la respuesta puede devolver filtros aplicados, cantidad de registros, fuera de SLA y el alcance de la consulta.",
    boundary: "Hay que configurar el Webhook para responder usando ese nodo. Un HTTP 200 solo comunica que la solicitud fue atendida según el flujo; no demuestra que los datos sean completos, actuales o reales.",
    question: "¿Qué puede concluir quien recibe el JSON de esta demostración?",
    answer: "Solo puede concluir lo que se calculó sobre los CSV ficticios incluidos. El JSON declara que no consultó Azure ni la instancia n8n y que las alertas no están relacionadas causalmente con las operaciones.",
    observe: "En la salida del nodo de respuesta, revisar el código HTTP, el body JSON y los encabezados configurados. Contrastar cada valor con los items de entrada y el alcance declarado.",
    sources: [{ label: "Respond to Webhook node · n8n Docs", href: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/" }],
  },
];

const paths = [
  { title: "Azure SQL Database", node: "Nodo n8n: Microsoft SQL", text: "Consulta filas y columnas. Requiere host, base, credencial, permisos SQL y una ruta de red permitida." },
  { title: "Storage Account · Blob", node: "Azure Storage → Extract From File", text: "Azure Storage obtiene el blob; Extract From File, en la operación Extract From CSV, convierte el archivo binario en registros JSON." },
  { title: "API existente", node: "Nodo n8n: HTTP Request", text: "Envía una petición HTTP al endpoint. Azure API Management puede gobernar esa API; Azure Functions puede implementar lógica propia." },
];

export default function N8nGuide() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return <section className="n8n-guide" aria-label="Guía paso a paso del workflow n8n">
    <header className="n8n-guide-header">
      <div><span className="micro-label">RECORRIDO GUIADO · 4 PASOS</span><h2>Qué hace cada nodo y cómo llega el dato</h2></div>
      <p>El workflow importable usa un Code node con las tablas ficticias. Si después conectamos datos reales, elegimos Microsoft SQL, Azure Storage o HTTP Request según la fuente.</p>
    </header>

    <div className="n8n-guide-layout">
      <nav className="n8n-guide-steps" aria-label="Pasos del workflow">
        {steps.map((item, i) => <button key={item.title} className={active === i ? "n8n-guide-step active" : "n8n-guide-step"} onClick={() => setActive(i)}>
          <span>{String(i + 1).padStart(2, "0")}</span><div><b>{item.title.replace(/^\d\. /, "")}</b><small>{item.subtitle}</small></div>{active === i && <i>●</i>}
        </button>)}
      </nav>

      <article className="n8n-guide-detail" key={step.title}>
        <span className="micro-label">PASO {String(active + 1).padStart(2, "0")} / DEL REQUEST A LA RESPUESTA</span>
        <h3>{step.title}</h3><p className="n8n-guide-subtitle">{step.subtitle}</p>
        <div className="n8n-guide-central"><b>IDEA CENTRAL</b><p>{step.central}</p></div>
        {active === 0 && <div className="n8n-request-example"><span>BODY DE PRUEBA · POST /eduardo/torre-demo</span><code>{`{\n  "estado": "Demorada",\n  "region": "Norte"\n}`}</code></div>}
        {active === 1 && <div className="n8n-source-paths">{paths.map((path) => <div key={path.title}><span>FUENTE</span><h4>{path.title}</h4><b>{path.node}</b><p>{path.text}</p></div>)}</div>}
        {active === 2 && <div className="n8n-worked-example"><div><span>ENTRADA DE EJEMPLO</span><code>estado = Demorada<br />region = Norte</code></div><span className="n8n-example-arrow">→</span><div><span>RESULTADO TRAS FILTRAR</span><code>OP-1046 · 7.2h / SLA 4h<br />OP-1052 · 6.5h / SLA 4h</code></div><b>2 / 2 fuera de SLA</b></div>}
        <div className="n8n-guide-row"><b>QUÉ PASA</b><p>{step.why}</p></div>
        <div className="n8n-guide-boundary"><b>LÍMITE O CONFUSIÓN COMÚN</b><p>{step.boundary}</p></div>
        <div className="n8n-editor-observation"><b>EN EL EDITOR n8n · QUÉ MIRAR</b><p>{step.observe}</p></div>
        <details className="knowledge-check n8n-knowledge-check"><summary><span>CHEQUEO DE COMPRENSIÓN</span>{step.question}</summary><div><b>Respuesta de apoyo</b><p>{step.answer}</p></div></details>
        <div className="source-links">{step.sources.map((source) => <a href={source.href} key={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
      </article>
    </div>
    <p className="n8n-guide-footnote">Regla para recordar: Webhook recibe; el Code node procesa esta muestra; Respond to Webhook devuelve. Al pasar a datos reales, la cuenta, el esquema, las credenciales y la red de Eduardo determinan qué nodos se agregan.</p>
  </section>;
}
