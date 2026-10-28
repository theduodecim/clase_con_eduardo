"use client";

import { useState } from "react";

const workflowPath = "/workflows/torre-control-demo.json";

function cleanInstanceUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) return "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function cleanTestWebhookUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const isTestPath = url.pathname.endsWith("/webhook-test/eduardo/torre-demo");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || !isTestPath) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default function N8nConnectionGuide({ onOpenHosting }: { onOpenHosting: () => void }) {
  const [instanceUrl, setInstanceUrl] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [sending, setSending] = useState(false);
  const cleanedUrl = cleanInstanceUrl(instanceUrl);
  const cleanedTestUrl = cleanTestWebhookUrl(testUrl);
  const hasInput = instanceUrl.trim().length > 0;
  const hasTestInput = testUrl.trim().length > 0;

  async function sendSampleRequest() {
    if (!cleanedTestUrl || sending) return;
    setSending(true);
    setTestStatus("");
    setTestResponse("");
    try {
      const response = await fetch(cleanedTestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Demorada", region: "Norte", limite: 4 }),
      });
      const text = await response.text();
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setTestStatus(`Respuesta recibida · HTTP ${response.status}`);
      setTestResponse(formatted || "La respuesta llegó sin body.");
    } catch {
      setTestStatus("No se pudo leer la respuesta desde este navegador.");
      setTestResponse("Verificá que n8n esté escuchando la Test URL. Si la consola informa CORS, enviá el mismo JSON desde el editor u otro cliente de pruebas; la URL no se guardó.");
    } finally {
      setSending(false);
    }
  }

  return <section className="n8n-connect-guide" aria-label="Conectar una instancia n8n existente">
    <header className="n8n-connect-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> MÓDULO 02 / CONECTAR UNA INSTANCIA EXISTENTE</div>
      <h1>Tu n8n.<br /><em>Una práctica lista.</em></h1>
      <p>No hace falta crear otro servidor para empezar. Abrí tu instancia, importá el workflow de muestra y probalo con datos inventados, sin cargar credenciales Azure.</p>
    </header>

    <div className="n8n-connect-top-grid">
      <article className="n8n-connect-open">
        <span className="micro-label">PRIMER PASO · ABRIR TU EDITOR</span>
        <h2>¿Dónde está tu n8n?</h2>
        <p>Escribí la dirección de tu instancia para abrirla en otra pestaña. Esta aplicación no recibe ni guarda la dirección.</p>
        <label className="n8n-url-label" htmlFor="n8n-instance-url">URL de la instancia</label>
        <div className="n8n-url-row">
          <input id="n8n-instance-url" type="url" inputMode="url" autoComplete="url" placeholder="https://tu-instancia.n8n.cloud" value={instanceUrl} onChange={(event) => setInstanceUrl(event.target.value)} aria-describedby="n8n-url-help" />
          {cleanedUrl && <a className="button-primary n8n-open-button" href={cleanedUrl} target="_blank" rel="noreferrer">Abrir n8n ↗</a>}
        </div>
        <small id="n8n-url-help" className={hasInput && !cleanedUrl ? "n8n-url-error" : "n8n-url-hint"}>
          {hasInput && !cleanedUrl ? "Usá una URL http:// o https://, sin usuario ni contraseña." : "n8n Cloud o tu dirección autohospedada · no pegues claves ni tokens."}
        </small>
      </article>
      <aside className="n8n-connect-safety">
        <span className="safe-dot" />
        <div><b>Demo aislada y sin secretos</b><p>El workflow solo lee datos ficticios incluidos en el archivo. No se conecta a Azure ni a tus tablas reales.</p></div>
      </aside>
    </div>

    <div className="n8n-import-panel">
      <div className="n8n-import-head"><div><span className="micro-label">PRÁCTICA REAL EN EL EDITOR n8n</span><h2>Importar y ejecutar el workflow</h2></div><a className="button-primary" href={workflowPath} download="torre-control-demo.json">Descargar workflow ↘</a></div>
      <div className="n8n-import-steps">
        <article><span>01</span><b>Importar</b><p>En n8n, elegí importar workflow desde archivo y seleccioná <code>torre-control-demo.json</code>.</p></article>
        <article><span>02</span><b>Escuchar prueba</b><p>Abrí el nodo Webhook y pulsá “Listen for test event”. Usá solo la Test URL para este ejercicio.</p></article>
        <article><span>03</span><b>Enviar criterios</b><p>Mandá un POST con estado y región. El workflow filtra operaciones, resume alertas ficticias y responde JSON.</p></article>
        <article><span>04</span><b>Leer el alcance</b><p>Compará cantidad, SLA y alertas. El propio JSON indica qué se observó y qué no se puede concluir.</p></article>
      </div>
      <div className="n8n-request-box"><div><span className="micro-label">BODY DE EJEMPLO · CAMBIÁ LOS FILTROS</span><pre>{`{\n  "estado": "Demorada",\n  "region": "Norte",\n  "limite": 4\n}`}</pre></div><div><span className="micro-label">RESPUESTA ESPERADA EN LA MUESTRA</span><b>2 operaciones · 2 fuera de SLA</b><p>La alerta severa queda en una tabla independiente: no prueba la causa de ninguna demora.</p></div></div>
      <div className="n8n-live-test">
        <label htmlFor="n8n-test-url">Pegá la Test URL del nodo Webhook</label>
        <div className="n8n-url-row"><input id="n8n-test-url" type="url" inputMode="url" placeholder="https://tu-instancia/webhook-test/eduardo/torre-demo" value={testUrl} onChange={(event) => { setTestUrl(event.target.value); setTestStatus(""); setTestResponse(""); }} aria-describedby="n8n-test-url-help" /><button className="button-primary" type="button" onClick={sendSampleRequest} disabled={!cleanedTestUrl || sending}>{sending ? "Enviando…" : "Enviar prueba ficticia →"}</button></div>
        <small id="n8n-test-url-help" className={hasTestInput && !cleanedTestUrl ? "n8n-url-error" : "n8n-url-hint"}>{hasTestInput && !cleanedTestUrl ? "Solo se acepta la Test URL con la ruta /webhook-test/eduardo/torre-demo; no pegues la URL de producción." : "La petición va directamente desde tu navegador a n8n y no se guarda. La instancia debe estar escuchando una prueba."}</small>
        {testStatus && <div className="n8n-live-result" role="status"><b>{testStatus}</b><pre>{testResponse}</pre></div>}
      </div>
      <p className="n8n-test-tip"><b>También podés probar manualmente:</b> copiá la Test URL que muestra el nodo Webhook y enviá el mismo JSON desde un cliente de pruebas. No uses la URL de producción.</p>
      <div className="n8n-security-note"><b>Antes de publicar:</b> el workflow se importa inactivo. No actives un webhook público sin configurar autenticación o una restricción de acceso adecuada. No compartas la URL completa de producción.</div>
    </div>

    <div className="n8n-connect-footer"><div><span className="micro-label">¿TODAVÍA NO TENÉS UNA INSTANCIA?</span><p>El montaje de una VM es un camino alternativo; no es requisito para conectar n8n Cloud ni para hacer esta práctica.</p></div><button onClick={onOpenHosting}>Ver hosting opcional en Azure →</button></div>
  </section>;
}
