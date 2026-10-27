# Laboratorio interactivo · Eduardo

Interfaz local para acompañar la clase sobre Azure, n8n y una posible Torre de Control. El recorrido toma como referencia la experiencia de `Clase_con_alexis/frontend`, adaptada al temario de Eduardo.

## Ejecutar

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>. `npm run build` genera el build de producción.

## Secciones

La navegación está dentro de una única página para recorrerla durante la clase:

- **Ruta de la clase:** objetivos y módulos.
- **Entender Azure:** nombres reales de gobierno, compute, datos, APIs, red, identidad y observabilidad.
- **Laboratorio n8n:** workflow conceptual, filtros interactivos y respuesta JSON calculada sobre datos ficticios.
- **Torre de Control:** Azure Monitor Workbooks, Power BI, n8n y Azure App Service para un portal propio.
- **Conectar y avanzar:** lista de información necesaria para pasar a la instancia real.

## Datos y conexiones

`src/data/demo.ts` contiene los registros usados por la interfaz. Las copias CSV están en `../data/` para trabajarlas aparte en n8n. El simulador no llama servicios externos, no pide credenciales y no muestra datos de una cuenta Azure. El workflow importable se preparará después de confirmar la versión/hosting de n8n y el origen de datos acordado.

El mapa de servicios Azure y las alternativas de hosting están desarrollados en [../docs/servicios-azure.md](../docs/servicios-azure.md).
