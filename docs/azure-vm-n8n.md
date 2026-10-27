# Montar n8n en una Azure Virtual Machine

Guía para seguir **Azure Portal → Linux → Docker Compose → n8n por HTTPS**. Es un ejemplo didáctico, no un despliegue en la cuenta de Eduardo. El tamaño de VM, región y reglas reales dependen de su carga, políticas y presupuesto.

## Qué vamos a desplegar

```text
Internet / caller
       │ HTTPS :443 (HTTP :80 puede redirigir)
       ▼
Public IP + NSG ──→ Azure Virtual Network / subnet
                         │
                         ├─ Azure Virtual Machine (Ubuntu Server LTS)
                         │    ├─ Docker Engine + Docker Compose
                         │    ├─ Traefik: proxy inverso y TLS
                         │    └─ n8n: puerto 5678 solo en la red Docker
                         │           └─ Docker volume n8n_data / SQLite
                         └─ SSH :22 restringido o conexión por Azure Bastion

Managed OS Disk ──→ sistema operativo y volúmenes Docker
Azure Backup ─────→ recovery points de la VM, con prueba de restauración aparte
```

Resource Group, nombres, tamaño y región que aparecen en la clase son ejemplos. **NSG** filtra tráfico en la red Azure; no sustituye al firewall del sistema operativo. El puerto público de la aplicación lo atiende Traefik. El contenedor n8n no publica `5678` en una IP de Internet.

## 1. Crear y configurar la VM desde Azure Portal

1. Abrir **Virtual machines → Create → Azure virtual machine**.
2. En **Basics → Project details**, elegir la suscripción que Eduardo tenga autorizada. Crear un Resource Group de laboratorio, por ejemplo `rg-eduardo-n8n-lab-dev`; sirve para agrupar los recursos del ejercicio y encontrarlos/eliminarlos juntos.
3. En **Instance details**, poner `vm-eduardo-n8n-01`, seleccionar una región aprobada y una imagen Ubuntu Server LTS disponible. Elegir el tamaño según memoria, procesador, ejecuciones concurrentes y presupuesto. No fijamos SKU ni región porque todavía hay que relevar cuenta, carga y precios.
4. En **Administrator account**, elegir **SSH public key**, establecer un usuario Linux (por ejemplo `azureuser`) y generar o seleccionar una clave. Descargar y guardar la clave privada fuera de Git; la VM recibe la clave pública.
5. En **Disks**, seleccionar/revisar un **Azure Managed OS Disk** persistente, tamaño y tipo; no usar un disco de sistema efímero para el estado de n8n. Para este laboratorio alcanza con guardar Docker y `n8n_data` en el disco de sistema. En un entorno mantenido conviene evaluar separar datos/backups y elegir almacenamiento según rendimiento requerido.
6. En **Networking**, configurar VNet, subnet, NIC, NSG e ingreso (la siguiente sección detalla el ejemplo). Si esta VM recibirá directamente el tráfico web, asociar una IP pública estable; la IP pública Standard utiliza asignación estática. Azure Bastion protege el acceso administrativo SSH, pero por sí solo no expone la web de n8n. Si la VM no tiene IP pública, hay que diseñar otro endpoint autorizado para HTTPS, fuera del Compose simple de este laboratorio.
7. En **Management**, habilitar Auto-shutdown para un laboratorio si el horario lo permite. No lo usaríamos para una instancia que debe atender webhooks fuera de ese horario; apagar la VM no elimina discos, IP u otros recursos que pueden seguir generando cargos.
8. Seleccionar **Review + create**, leer la validación, los recursos y la estimación de costo de la suscripción elegida. Solo desplegar después de contar con autorización y presupuesto confirmados.

| Campo del portal | Ejemplo para seguir la clase | Qué representa |
|---|---|---|
| Subscription / Resource Group | Suscripción autorizada / `rg-eduardo-n8n-lab-dev` | Ámbito de facturación y contenedor lógico del laboratorio. |
| Virtual machine name | `vm-eduardo-n8n-01` | Nombre del recurso VM; no es el dominio público de n8n. |
| Image / Size | Ubuntu Server LTS / elegir según carga y presupuesto | Sistema operativo y capacidad de cómputo. |
| Authentication type | SSH public key | Método de administración del Linux. |
| OS disk | Azure Managed Disk persistente | Disco del sistema y, en este lab, datos del volumen Docker. Evitar OS disk efímero para esta instancia con estado. |
| VNet / Subnet / NSG | `vnet-eduardo-n8n` / `snet-app` / `nsg-eduardo-n8n` | Red privada y control de flujos entrantes/salientes. |
| Public IP | Standard, Static si esta VM recibe el tráfico web | Dirección estable para DNS. Tiene costo. Bastion da acceso administrativo, no reemplaza el endpoint HTTPS de n8n. |

**Azure Bastion** permite administrar una VM por su IP privada sin publicar SSH en Internet. Es un recurso separado y puede sumar cargos. Para esta plantilla, el navegador/webhooks siguen necesitando llegar al endpoint configurado en TCP 443 (y TCP 80 si se usa la redirección). Para una práctica sencilla también se puede permitir SSH desde una IP administrativa conocida, pero no abrir TCP 22 a `Any`.

## 2. Configurar VNet, subnet, NSG y acceso

Durante **Networking**, crear o elegir la **Virtual Network** `vnet-eduardo-n8n` y la subnet `snet-app`. Asociar una **Network Interface (NIC)** a la subnet y un **Network Security Group** llamado, por ejemplo, `nsg-eduardo-n8n`. Revisar qué NSG queda asociado a la subnet y cuál a la NIC: si hay ambos, las reglas de los dos deben permitir el flujo.

En la creación, no elegir una opción que abra SSH desde cualquier lugar. Si el portal pide reglas de entrada, seleccionar **None** y crear luego reglas personalizadas, o permitir SSH limitado a la IP de administración. Para conexión privada, preparar Azure Bastion en la red y no asignar IP pública a la VM. Bastion requiere sus propios recursos/costos.

Para editar reglas: abrir el **NSG → Settings → Inbound security rules → + Add**. Cada regla define origen, puerto origen, destino, puerto destino, protocolo, acción y prioridad; un número de prioridad menor se procesa antes. Una vez creada la VM, confirmar el resultado efectivo en sus reglas de red.

### Reglas inbound de ejemplo

| Prioridad / nombre | Origen | Puerto origen | Puerto destino | Protocolo / acción | Uso |
|---|---|---:|---:|---|---|
| `100` / `Allow-SSH-Admin` | IP administrativa `/32`; o rango configurado de `AzureBastionSubnet` | `*` | `22` | TCP / Allow | Administración. Nunca usar origen `Any` para SSH en una VM pública. Bastion requiere sus propias reglas y cargos. |
| `110` / `Allow-HTTP-Public` | `Any` solo si el endpoint será público | `*` | `80` | TCP / Allow | Traefik redirige HTTP a HTTPS. Puede dejarse cerrado si no se necesita ese flujo. |
| `120` / `Allow-HTTPS-Public` | `Any` solo si el endpoint será público | `*` | `443` | TCP / Allow | El navegador y los webhooks llegan a Traefik por TLS. |
| **No crear** | — | — | `5678` | — | n8n se alcanza desde Traefik por la red Docker; no debe publicarse en NSG ni mapearse a la IP del host. |
| **No crear** | — | — | `5432` | — | PostgreSQL no forma parte del stack inicial, que usa SQLite. |

Las prioridades son ejemplos; escoger números libres que se ejecuten antes de `DenyAllInBound` y revisar reglas ya presentes. En una regla típica de Azure Portal, Source port ranges es `*`, Destination puede quedar en `Any` para esta VM y la regla se guarda con nombre, prioridad, TCP y acción Allow. Restringir el destino a una NIC o grupo de aplicaciones si la configuración del NSG lo permite.

Las reglas de Azure Network Security Group filtran tráfico entrante/saliente y se evalúan por prioridad. También pueden existir firewalls de Linux, políticas de la organización y firewalls del servicio de datos. No agregar reglas para `5678` ni `5432` para hacer que “funcione”: investigar la ruta privada y el servicio que escucha.

## 3. Entrar por SSH e instalar Docker

Conectar con la clave privada que corresponde a la clave pública cargada en Azure:

```bash
ssh -i <ruta-a-clave-privada> <usuario-linux>@<ip-publica-de-la-vm>
```

Si la VM no tiene IP pública, iniciar la sesión desde **Azure Bastion** en el Portal o por el método nativo que soporte su SKU.

Actualizar Ubuntu e instalar **Docker Engine** y el plugin **Docker Compose** desde el repositorio oficial de Docker. En Ubuntu LTS x64 la secuencia que documenta Docker es:

```bash
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl status docker
sudo docker run hello-world
```

El último comando verifica que Docker puede iniciar un contenedor. Continuar con:

```bash
sudo docker --version
sudo docker compose version
```

Crear un directorio de trabajo y copiar allí `deployment/azure-vm-n8n/compose.yaml.example` y `.env.example` desde este repo por un medio aprobado:

```bash
mkdir -p ~/n8n-compose
cd ~/n8n-compose
cp compose.yaml.example compose.yaml
cp .env.example .env
chmod 600 .env
```

`chmod 600` limita lectura y escritura del `.env` al dueño de ese archivo. Los comandos Docker de esta guía usan `sudo`, que es el comportamiento inicial normal; dar acceso al grupo `docker` equivale a entregar privilegios muy altos sobre el host. No hacer commit del `.env` real ni de una clave privada.

## 4. DNS, HTTPS y variables de n8n

La plantilla crea un subdominio como `n8n.example.com`. Crear un **registro DNS A** apuntando a la IP pública estable del endpoint. Traefik recibe HTTPS, consigue/renueva el certificado y reenvía a n8n dentro de la red Docker. Para eso, 443 debe llegar al proxy y el dominio debe resolver correctamente.

Editar `.env` en la VM y completar el dominio, correo y zona horaria. Generar la clave de cifrado desde un equipo confiable:

```bash
openssl rand -hex 32
```

Copiar la salida a `N8N_ENCRYPTION_KEY` en `.env` y guardar la clave en un mecanismo seguro de recuperación, como un gestor de secretos autorizado. **No subir la clave a Git ni dejarla en el frontend.** Si se pierde o se cambia sin migración, n8n puede perder acceso a credenciales cifradas.

Variables principales en `compose.yaml.example`:

| Variable | Por qué existe |
|---|---|
| `N8N_HOST`, `N8N_PROTOCOL` | Indican el hostname y protocolo externos. |
| `N8N_WEBHOOK_URL` | Publica las URLs correctas de webhook detrás del proxy inverso. |
| `N8N_PROXY_HOPS=1` | Declara el proxy inverso que hay delante de n8n; Traefik pasa las cabeceras reenviadas. |
| `N8N_ENCRYPTION_KEY` | Clave estable para cifrar las credenciales guardadas por n8n. |
| `GENERIC_TIMEZONE` y `TZ` | Mantienen los nodos programados y el sistema en la zona horaria elegida. |

El archivo de Compose usa el volumen persistente `n8n_data` montado en `/home/node/.n8n`. Para el primer laboratorio, n8n usa SQLite dentro de ese volumen. El archivo no publica una asignación de host para el puerto `5678`.

## 5. Validar e iniciar Compose

Desde `~/n8n-compose`, con las variables completas:

```bash
sudo docker compose config --quiet
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 n8n
```

`docker compose config --quiet` valida la configuración sin imprimir el Compose resuelto, que contiene el valor de `N8N_ENCRYPTION_KEY`. `ps` muestra si los contenedores están en ejecución. Los logs ayudan a distinguir problemas del proxy de problemas de n8n.

Abrir `https://n8n.example.com`, crear la cuenta inicial **owner** y probar un workflow manual. Luego crear un Webhook de prueba, copiar un payload ficticio y confirmar que el editor muestre la ejecución. Antes de activar una URL de producción, configurar autenticación y revisar quién puede invocarla.

## 6. Cómo diagnosticar la primera conexión

| Síntoma | Revisar primero |
|---|---|
| El dominio no abre | Registro DNS A, IP pública asignada, reglas NSG TCP 80/443 y logs de Traefik. |
| Certificado TLS no se emite | Dominio apuntando a la IP correcta, acceso al proxy por 443, correo ACME y logs de Traefik. |
| Traefik muestra gateway error | Estado del contenedor n8n, puerto interno `5678`, etiqueta de servicio y red Docker compartida. |
| n8n presenta URLs de Webhook internas o incorrectas | `N8N_WEBHOOK_URL`, `N8N_HOST`, `N8N_PROTOCOL`, `N8N_PROXY_HOPS` y cabeceras del proxy. |
| n8n inicia pero no aparece un workflow anterior | Mismo volumen `n8n_data`, rutas de montaje y base de datos correcta. |
| Se restauraron workflows pero las credenciales no se descifran | Recuperar la misma `N8N_ENCRYPTION_KEY` que se usó al guardarlas. |

## 7. Conectar Azure SQL o Blob después

Tener n8n funcionando no crea automáticamente conectividad hacia los datos. Para usar el nodo **Microsoft SQL** con Azure SQL Database, confirmar endpoint, método de autenticación admitido, permisos de base, reglas de firewall y ruta desde la VM. Para blobs, usar el nodo **Azure Storage**; después **Extract From File** convierte un CSV en filas JSON.

Si Azure SQL o Storage usan **Azure Private Endpoint**, revisar VNet, DNS privado y ruta entre la VM y el servicio. No abrir el firewall público para resolver un error de DNS/ruta. Las reglas de red, identidad y permisos de datos son verificaciones separadas.

## 8. Persistencia, backups, upgrades y costo

- El volumen Docker y la base SQLite se guardan en los discos de la VM. Recrear el contenedor con el mismo volumen conserva los datos; borrar ese volumen los destruye.
- Definir **Azure Backup** con Recovery Services vault si la política de la cuenta lo permite. Guardar de forma segura la clave de cifrado y comprobar una restauración de prueba; un recovery point por sí solo no demuestra que n8n restaure correctamente.
- Antes de actualizar, tomar un backup. Revisar la versión estable de n8n y la versión de Traefik, actualizar de forma controlada y revisar logs. La plantilla usa etiquetas `stable`/`latest` de ejemplo; para un entorno mantenido, fijar y probar versiones concretas.
- Un solo Linux VM con SQLite es un punto único de falla y no ofrece escalado horizontal ni alta disponibilidad. n8n señala que el autohospedaje requiere experiencia de operación; valorar n8n Cloud o una arquitectura con base de datos/operación apropiadas para producción.
- Azure puede facturar el cómputo, Managed Disks, IP pública, tráfico, Azure Bastion, Azure Backup y la ingesta/retención de Azure Monitor. El precio depende de la región, SKU, configuración y uso; comprobarlo en el portal antes de desplegar.
- Al cerrar un laboratorio, revisar discos, IPs y datos antes de detener o eliminar recursos. Eliminar el Resource Group también elimina sus recursos asociados; confirmar que no contiene recursos compartidos y conservar backups necesarios.

## Plantillas de este repo

- [Docker Compose de ejemplo](../deployment/azure-vm-n8n/compose.yaml.example)
- [Variables de entorno de ejemplo](../deployment/azure-vm-n8n/.env.example)

## Documentación oficial

- [Crear una Linux VM en Azure Portal](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)
- [Crear una VM con IP pública estática](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-static-public-ip)
- [Network Security Groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
- [Azure Bastion](https://learn.microsoft.com/en-us/azure/bastion/bastion-overview)
- [Azure Managed Disks](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview)
- [Azure Backup para VMs](https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-introduction)
- [Azure Monitor Agent](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-overview)
- [n8n con Docker Compose](https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/use-docker-compose/)
- [Configurar n8n detrás de un reverse proxy](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/configure-webhook-urls-with-reverse-proxy/)
- [Variables de base de datos de n8n](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/database/)
- [Variables de seguridad de n8n](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/security/)
- [Docker Engine en Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
