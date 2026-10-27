"use client";

import { useState } from "react";

type SetupStep = {
  title: string;
  subtitle: string;
  purpose: string;
  explanation: string;
  observe: string;
  question: string;
  answer: string;
};

const steps: SetupStep[] = [
  {
    title: "1. Decidir qué vamos a montar",
    subtitle: "Una VM Linux para aprender el recorrido completo.",
    purpose: "Azure Virtual Machines es IaaS: Azure ofrece la máquina virtual y sus discos/red, mientras que quien la administra se ocupa del sistema operativo, Docker, n8n, parches y recuperación.",
    explanation: "Para el laboratorio usamos una sola VM Linux, Docker Compose, Traefik como reverse proxy con HTTPS y n8n con SQLite en un volumen persistente. Es una topología de aprendizaje sencilla; no tiene alta disponibilidad. PostgreSQL puede evaluarse como siguiente paso si el uso, la concurrencia o la recuperación lo justifican.",
    observe: "Acordar región, suscripción, presupuesto, quién administra Linux y si la VM estará expuesta a Internet. El tamaño de VM se elige según ejecuciones concurrentes, memoria, retención y pruebas; no hay un SKU universal para n8n.",
    question: "¿Crear una VM significa que n8n ya está instalado?",
    answer: "No. La VM aporta cómputo y disco. Después hay que instalar Docker, configurar el contenedor de n8n, la URL, HTTPS, persistencia y operación.",
  },
  {
    title: "2. Preparar el Resource Group y la red",
    subtitle: "Los recursos Azure que rodean a la máquina.",
    purpose: "Un Resource Group ordena el ciclo de vida y los permisos del laboratorio. Azure Virtual Network y una subnet dan el espacio de red privado. Un Network Security Group (NSG) filtra tráfico de entrada y salida.",
    explanation: "Nombres didácticos: `rg-eduardo-n8n-lab-dev`, `vnet-eduardo-n8n`, `snet-app` y `nsg-eduardo-n8n`. La VM necesita una NIC conectada a una subnet. El NSG se asocia a la NIC o subnet y sus reglas se evalúan por prioridad.",
    observe: "En Azure Portal, revisar la suscripción elegida, región, VNet/subnet y NSG asociado a la NIC. Dejar anotados los nombres reales y separar lo que ya existe de lo que se crearía para una práctica.",
    question: "¿El NSG instala el firewall de Linux dentro de la VM?",
    answer: "No. El NSG es un control de red Azure en la ruta de tráfico. Ubuntu también puede tener controles locales del sistema operativo.",
  },
  {
    title: "3. Crear la Azure Virtual Machine",
    subtitle: "En el portal: Virtual machines → Create → Azure virtual machine.",
    purpose: "La VM aloja el sistema operativo Linux. Azure Managed Disks proporcionan sus discos virtuales; la imagen, el tamaño y la región afectan compatibilidad, rendimiento y costo.",
    explanation: "En Basics crear o seleccionar una subscription autorizada y el Resource Group `rg-eduardo-n8n-lab-dev`; luego definir `vm-eduardo-n8n-01`, región, imagen Ubuntu Server LTS, tamaño y acceso SSH public key. En Disks revisar el Managed OS Disk. En Networking configurar VNet, subnet, NIC, NSG y el ingreso web. Bastion sirve para SSH administrativo; no reemplaza el endpoint HTTPS público de n8n.",
    observe: "La pantalla Review + create debe resumir los recursos que se crearán. Elegir tamaño después de revisar carga, memoria, concurrencia y presupuesto; no hay un SKU universal. Usar Managed OS Disk persistente, no un disco efímero para n8n con estado. Guardar la clave privada SSH fuera del repo. Auto-shutdown puede servir para laboratorio, pero apagar la VM no elimina los otros recursos facturables.",
    question: "¿Puedo usar una contraseña sencilla para entrar por SSH?",
    answer: "Para este recorrido se propone autenticación con clave SSH. Si la VM recibe IP pública, la regla de SSH se limita a la IP de administración autorizada; Azure Bastion es otra opción, con costo de servicio y sin IP pública en la VM.",
  },
  {
    title: "4. Definir acceso y puertos",
    subtitle: "Publicar la web de n8n no requiere publicar el puerto interno del contenedor.",
    purpose: "El NSG debe permitir únicamente los flujos que este diseño necesita. Traefik recibe las conexiones web y reenvía tráfico dentro de la red Docker hacia n8n.",
    explanation: "Para una instancia pública con dominio, normalmente se reciben TCP 80/443 para el proxy y sus certificados. El acceso administrativo SSH (TCP 22) se restringe a una IP confiable o se realiza por Azure Bastion. n8n escucha internamente en 5678; no se crea una regla NSG pública para 5678. PostgreSQL, si se añade luego, tampoco se abre a Internet.",
    observe: "Para SSH, usar como Source la IP administrativa con máscara `/32` o el rango de AzureBastionSubnet según la configuración de Bastion. Para HTTPS público, permitir TCP 443 desde Internet solo si el endpoint será público. Revisar Networking > reglas de entrada de la VM y el NSG efectivo. Azure Bastion agrega recursos y cargos.",
    question: "¿Qué regla abrirías para que el navegador llegue a la pantalla de n8n?",
    answer: "TCP 443 hacia el reverse proxy; TCP 80 puede servir para redirección o para el reto HTTP según la configuración TLS. El proxy reenvía internamente a n8n. No abrir directamente 5678.",
  },
  {
    title: "5. Instalar Docker Engine y Compose",
    subtitle: "Docker ejecuta n8n aislado del sistema operativo; Compose describe los servicios y sus volúmenes.",
    purpose: "La imagen de n8n se descarga como contenedor. Docker Compose permite declarar n8n, Traefik, variables, red y persistencia en un archivo YAML reproducible.",
    explanation: "Conectarse por SSH, actualizar Ubuntu, agregar el repositorio apt oficial de Docker e instalar Docker Engine, containerd, Buildx y el plugin Docker Compose. El bloque de comandos de abajo sigue la guía oficial de Docker para Ubuntu. Después se crea `~/n8n-compose` para Compose y `.env`.",
    observe: "Comprobar `sudo systemctl status docker`, `sudo docker run hello-world`, `sudo docker --version` y `sudo docker compose version`. Mantener Compose y `.env` en una carpeta con permisos acotados. No sumar al grupo `docker` usuarios que no deban tener privilegios muy altos sobre el host.",
    question: "¿Docker Compose reemplaza a Azure Virtual Machines?",
    answer: "No. Azure VM es la máquina IaaS. Docker Engine corre sobre Linux; Docker Compose describe y administra los contenedores que corren dentro de esa VM.",
  },
  {
    title: "6. Configurar DNS, HTTPS y n8n",
    subtitle: "El nombre público, el proxy y las URLs de webhook tienen que coincidir.",
    purpose: "Un registro DNS A apunta `n8n.tudominio.com` a la IP pública. Traefik termina TLS y envía las solicitudes al contenedor n8n. `N8N_WEBHOOK_URL` le indica a n8n cuál es la URL externa correcta detrás del proxy.",
    explanation: "El ejemplo del repo usa la plantilla oficial de n8n Docker Compose con Traefik y el almacenamiento SQLite por volumen para empezar. `.env.example` solo contiene marcadores: completar dominio, correo, zona horaria y una clave de cifrado generada localmente; no guardar el `.env` real en Git.",
    observe: "Comprobar que el DNS resuelva a la IP esperada, que 80/443 lleguen al proxy y que el navegador muestre HTTPS sin advertencias. En el editor, verificar que las URLs de test/producción de Webhook usan el dominio público.",
    question: "¿Para qué sirve N8N_ENCRYPTION_KEY y por qué hay que guardarla junto al backup?",
    answer: "n8n la usa para cifrar credenciales en la base interna. Sin la clave original, restaurar los datos no basta para descifrar esas credenciales. Debe guardarse como secreto de respaldo y fuera de Git.",
  },
  {
    title: "7. Iniciar y comprobar la instancia",
    subtitle: "Arrancar los servicios y confirmar que cada capa responde.",
    purpose: "Docker Compose transforma la configuración en contenedores en ejecución. Revisar cada capa por separado ayuda a encontrar si falla el DNS, TLS, proxy, contenedor o aplicación.",
    explanation: "Desde el directorio del proyecto, validar primero con `sudo docker compose config --quiet` y luego iniciar con `sudo docker compose up -d`. `sudo docker compose ps` muestra el estado; `sudo docker compose logs --tail=100 n8n` ayuda a leer el inicio. En el navegador abrir `https://n8n.tudominio.com`, crear el owner inicial y ejecutar un workflow manual de prueba.",
    observe: "Confirmar el estado de Traefik y n8n, revisar errores de certificados o variables ausentes y probar que un Webhook de prueba registre la ejecución. No crear credenciales de Azure hasta acordar identidad, permisos y conectividad.",
    question: "¿Qué prueba demuestra que el workflow se ejecutó, y cuál demuestra que pudo leer Azure SQL?",
    answer: "La pestaña Executions demuestra que n8n ejecutó el workflow. Solo una salida satisfactoria del nodo Microsoft SQL, con datos de la fuente confirmada, demuestra que ese paso pudo consultar la base.",
  },
  {
    title: "8. Persistir, respaldar y conectar Azure",
    subtitle: "El contenedor puede recrearse; los datos y la clave deben sobrevivir.",
    purpose: "El Docker named volume `n8n_data` conserva la base SQLite y los archivos de instancia en el Managed Disk de la VM. Azure Backup puede guardar recovery points de la VM; además hay que definir y probar una restauración de n8n y conservar la clave de cifrado.",
    explanation: "Para conectar fuentes privadas, la VM debe tener una ruta autorizada hacia el recurso, resolución DNS apropiada, reglas NSG/firewall y permisos del servicio. En n8n se elige Microsoft SQL para Azure SQL Database o Azure Storage para blobs. En producción, esta VM única sigue siendo un punto de falla y requiere parches, monitoreo, backups y plan de recuperación.",
    observe: "Hacer un backup antes de actualizar; documentar cómo restaurar el volumen y recuperar la clave; probar la restauración en un entorno separado. Para observar el sistema operativo, Azure Monitor Agent puede enviar datos a un Log Analytics workspace; la ingesta y retención pueden generar cargos.",
    question: "¿Con un backup de la VM ya probé que n8n se puede recuperar?",
    answer: "No todavía. Hay que probar una restauración, confirmar que workflows y credenciales se descifren y validar webhooks, DNS y certificados. El backup debe incluir la clave de cifrado de forma segura.",
  },
];

export default function VmN8nGuide() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return <section className="vm-n8n-guide" aria-label="Guía para instalar n8n en una Azure Virtual Machine">
    <header className="vm-guide-hero">
      <div className="eyebrow"><span className="eyebrow-line" /> MÓDULO 02 / ARMAR UN n8n AUTOGESTIONADO</div>
      <h1>De una VM vacía<br /><em>a un n8n accesible.</em></h1>
      <p>Recorrido de aprendizaje en Azure Portal y Linux: crear la máquina, proteger puertos, instalar Docker Compose y configurar dominio, HTTPS y almacenamiento persistente.</p>
    </header>

    <div className="vm-guide-note"><b>ALCANCE DEL EJERCICIO</b><span>Es un despliegue guiado de laboratorio; crear Azure Virtual Machines, discos, IP pública, Azure Bastion, backups u observabilidad puede generar cargos. Aquí no se crea ni modifica ningún recurso.</span></div>

    <section className="vm-architecture-card">
      <div className="learn-section-heading"><div><span className="micro-label">ARQUITECTURA DE UNA VM · PRIMER DESPLIEGUE</span><h2>Qué creamos y por dónde circula el tráfico</h2></div><span className="read-only">EJEMPLO · NO DESPLEGADO</span></div>
      <div className="vm-resource-line">
        <div><span>CONTENEDOR DE ADMINISTRACIÓN</span><b>Resource Group</b><small>`rg-eduardo-n8n-lab-dev` · nombre ilustrativo</small></div>
        <i>contiene</i>
        <div><span>RED PRIVADA</span><b>VNet + subnet + NSG</b><small>NIC de la VM conectada a la subnet</small></div>
        <i>conecta</i>
        <div><span>CÓMPUTO Y DISCO</span><b>Linux Azure Virtual Machine</b><small>Managed OS Disk · Docker Engine / Compose</small></div>
      </div>
      <div className="vm-traffic-diagram">
        <div className="vm-traffic-row"><span>USUARIO / WEBHOOK</span><b>HTTPS · TCP 443</b><i>→</i><span>NSG</span><i>→</i><span>Traefik · TLS</span><i>→</i><span>n8n container · 5678 interno</span></div>
        <div className="vm-traffic-row admin"><span>ADMINISTRADOR</span><b>SSH · TCP 22 restringido</b><i>→</i><span>Azure Bastion o IP autorizada</span><i>→</i><span>Linux VM</span></div>
        <p>El NSG no publica el puerto 5678. El volumen `n8n_data` persiste en el disco de la VM; el primer stack del ejercicio usa SQLite para mantener pocas piezas.</p>
      </div>
    </section>

    <div className="vm-guide-layout">
      <nav className="vm-guide-steps" aria-label="Pasos para montar n8n en Azure">
        <span className="micro-label">RECORRIDO · {steps.length} PASOS</span>
        {steps.map((item, i) => <button key={item.title} className={active === i ? "vm-guide-step active" : "vm-guide-step"} onClick={() => setActive(i)}>
          <span>{String(i + 1).padStart(2, "0")}</span><div><b>{item.title.replace(/^\d\. /, "")}</b><small>{item.subtitle}</small></div>{active === i && <i>●</i>}
        </button>)}
        <div className="lesson-progress"><span>PROGRESO</span><b>{String(active + 1).padStart(2, "0")} / {steps.length}</b><div><i style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></div></div>
      </nav>

      <article className="vm-guide-detail" key={step.title}>
        <span className="micro-label">PASO {String(active + 1).padStart(2, "0")} / DE AZURE PORTAL A n8n</span>
        <h3>{step.title}</h3><p className="vm-guide-subtitle">{step.subtitle}</p>
        <div className="vm-guide-concept"><b>QUÉ SERVICIO INTERVIENE Y PARA QUÉ</b><p>{step.purpose}</p></div>
        <div className="vm-guide-row"><b>QUÉ HACEMOS</b><p>{step.explanation}</p></div>
        {active === 1 && <div className="vm-name-example"><span>NOMBRES DE EJEMPLO · REEMPLAZAR POR LO QUE SE ACUERDE</span><div><code>rg-eduardo-n8n-lab-dev</code><code>vnet-eduardo-n8n / snet-app</code><code>nsg-eduardo-n8n</code><code>vm-eduardo-n8n-01</code></div></div>}
        {active === 2 && <div className="vm-portal-config"><span>EN AZURE PORTAL · QUÉ SELECCIONAR EN CREATE VIRTUAL MACHINE</span><div><b>Basics</b><p><code>Subscription</code> autorizada · Resource Group <code>rg-eduardo-n8n-lab-dev</code> · nombre <code>vm-eduardo-n8n-01</code> · región aprobada · imagen Ubuntu Server LTS · tamaño a definir por carga/costo.</p></div><div><b>Administrator</b><p><code>SSH public key</code> · usuario Linux, por ejemplo <code>azureuser</code> · guardar la clave privada fuera del repo.</p></div><div><b>Disks</b><p><code>Azure Managed OS Disk</code> persistente, no efímero. Ahí quedan los datos del volumen Docker del laboratorio; separar disco y recuperación se evalúa en producción.</p></div><div><b>Networking</b><p><code>vnet-eduardo-n8n / snet-app / nsg-eduardo-n8n</code>. IP pública Standard Static si esta VM recibe HTTPS del dominio. Bastion protege SSH; sin IP pública hace falta otro endpoint web para n8n.</p></div><div><b>Management</b><p>Auto-shutdown para el laboratorio si no debe recibir Webhooks fuera del horario. Los otros recursos siguen existiendo y pueden generar cargos.</p></div></div>}
        {active === 3 && <div className="vm-port-table"><div><b>22 / SSH · Allow TCP</b><span>Source: IP administrativa `/32`; o rango de AzureBastionSubnet. Nunca `Any`.</span></div><div><b>80 / HTTP · Allow TCP</b><span>Source: Internet si el dominio será público. Traefik redirige a HTTPS.</span></div><div><b>443 / HTTPS · Allow TCP</b><span>Source: Internet si el editor/webhooks deben ser públicos. Llega a Traefik.</span></div><div><b>5678 / n8n</b><span>Sin regla pública ni mapeo host. Solo red Docker interna.</span></div></div>}
        {active === 4 && <div className="vm-commands"><span>EN SSH · INSTALAR DOCKER ENGINE Y COMPOSE EN UBUNTU</span><pre>{["sudo apt update", "sudo apt install ca-certificates curl", "sudo install -m 0755 -d /etc/apt/keyrings", "sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc", "sudo chmod a+r /etc/apt/keyrings/docker.asc", "sudo tee /etc/apt/sources.list.d/docker.sources <<EOF", "Types: deb", "URIs: https://download.docker.com/linux/ubuntu", "Suites: $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\")", "Components: stable", "Architectures: $(dpkg --print-architecture)", "Signed-By: /etc/apt/keyrings/docker.asc", "EOF", "sudo apt update", "sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin", "sudo systemctl status docker", "sudo docker run hello-world", "sudo docker compose version"].join("\n")}</pre><p>Después crear `~/n8n-compose` y copiar allí `compose.yaml.example` y `.env.example` como `compose.yaml` y `.env`. Esta secuencia instala desde el repositorio apt oficial, no desde un script remoto de instalación rápida.</p></div>}
        {active === 5 && <div className="vm-commands"><span>VARIABLES DE EJEMPLO · EL SECRETO NO ES UN VALOR REAL</span><pre>{"DOMAIN_NAME=example.com\nSUBDOMAIN=n8n\nGENERIC_TIMEZONE=America/Argentina/Buenos_Aires\nSSL_EMAIL=admin@example.com\nN8N_ENCRYPTION_KEY=<generar-y-guardar-fuera-de-Git>"}</pre><p>El repo incluye `.env.example` y `compose.yaml.example`. El Compose conecta Traefik con n8n, fija la URL de webhook HTTPS y no publica 5678 en la interfaz pública.</p></div>}
        {active === 6 && <div className="vm-commands"><span>COMANDOS DE ARRANQUE Y DIAGNÓSTICO</span><pre>{"sudo docker compose config --quiet\nsudo docker compose up -d\nsudo docker compose ps\nsudo docker compose logs --tail=100 n8n"}</pre><p>Abrir el subdominio HTTPS, crear el usuario owner y ejecutar un workflow de prueba. `config --quiet` valida las variables sin imprimir el secreto de cifrado.</p></div>}
        {active === 7 && <div className="vm-operations-callout"><b>CAMINO DE CONEXIÓN A LA FUENTE</b><p>n8n y Azure SQL/Storage necesitan DNS, ruta de red, NSG/firewall, credencial y permisos. Si la fuente usa Azure Private Endpoint, resolver la conectividad privada desde la VNet de la VM antes de probar los nodos Microsoft SQL o Azure Storage.</p></div>}
        <div className="vm-observation"><b>EN PORTAL / EN LA VM · QUÉ COMPROBAR</b><p>{step.observe}</p></div>
        <details className="knowledge-check vm-knowledge-check"><summary><span>CHEQUEO DE COMPRENSIÓN</span>{step.question}</summary><div><b>Respuesta de apoyo</b><p>{step.answer}</p></div></details>
        <div className="lesson-nav-buttons"><button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>← Paso anterior</button><button onClick={() => setActive(Math.min(steps.length - 1, active + 1))} disabled={active === steps.length - 1}>Siguiente paso →</button></div>
      </article>
    </div>

    <div className="vm-guide-sources"><span className="micro-label">DOCUMENTACIÓN PARA SEGUIR EL RECORRIDO</span><div>
      <a href="https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu" target="_blank" rel="noreferrer">Crear una Linux VM en Azure Portal ↗</a>
      <a href="https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview" target="_blank" rel="noreferrer">Network Security Groups ↗</a>
      <a href="https://learn.microsoft.com/en-us/azure/bastion/bastion-overview" target="_blank" rel="noreferrer">Azure Bastion ↗</a>
      <a href="https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-static-public-ip" target="_blank" rel="noreferrer">IP pública estática ↗</a>
      <a href="https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/use-docker-compose/" target="_blank" rel="noreferrer">n8n con Docker Compose y Traefik ↗</a>
      <a href="https://docs.docker.com/engine/install/ubuntu/" target="_blank" rel="noreferrer">Docker Engine en Ubuntu ↗</a>
      <a href="https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-introduction" target="_blank" rel="noreferrer">Azure Backup para VMs ↗</a>
    </div></div>
  </section>;
}
