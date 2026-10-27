export type Operacion = {
  id: string;
  fecha: string;
  region: "CABA" | "Norte" | "Sur";
  estado: "En curso" | "Demorada" | "Completada" | "En riesgo";
  responsable: string;
  servicio: string;
  horas: number;
  sla: number;
  importe: number;
};

export const operaciones: Operacion[] = [
  { id: "OP-1042", fecha: "2026-10-27 09:12", region: "CABA", estado: "Demorada", responsable: "Equipo A", servicio: "n8n-webhook", horas: 5.4, sla: 4, importe: 182000 },
  { id: "OP-1043", fecha: "2026-10-27 09:40", region: "Norte", estado: "En curso", responsable: "Equipo B", servicio: "api-operaciones", horas: 1.3, sla: 4, importe: 92000 },
  { id: "OP-1044", fecha: "2026-10-27 10:05", region: "Sur", estado: "En riesgo", responsable: "Equipo C", servicio: "db-operaciones", horas: 3.8, sla: 4, importe: 245000 },
  { id: "OP-1045", fecha: "2026-10-27 10:21", region: "CABA", estado: "Completada", responsable: "Equipo A", servicio: "api-operaciones", horas: 2.1, sla: 4, importe: 76000 },
  { id: "OP-1046", fecha: "2026-10-27 10:49", region: "Norte", estado: "Demorada", responsable: "Equipo D", servicio: "n8n-webhook", horas: 7.2, sla: 4, importe: 131000 },
  { id: "OP-1047", fecha: "2026-10-27 11:02", region: "Sur", estado: "En curso", responsable: "Equipo B", servicio: "storage-archivos", horas: 0.8, sla: 6, importe: 68000 },
  { id: "OP-1048", fecha: "2026-10-27 11:16", region: "CABA", estado: "Demorada", responsable: "Equipo C", servicio: "db-operaciones", horas: 8.1, sla: 4, importe: 317000 },
  { id: "OP-1049", fecha: "2026-10-27 11:45", region: "Norte", estado: "Completada", responsable: "Equipo A", servicio: "api-operaciones", horas: 1.9, sla: 4, importe: 114000 },
  { id: "OP-1050", fecha: "2026-10-27 12:03", region: "Sur", estado: "En riesgo", responsable: "Equipo D", servicio: "n8n-webhook", horas: 3.6, sla: 4, importe: 205000 },
  { id: "OP-1051", fecha: "2026-10-27 12:22", region: "CABA", estado: "En curso", responsable: "Equipo B", servicio: "storage-archivos", horas: 2.6, sla: 6, importe: 157000 },
  { id: "OP-1052", fecha: "2026-10-27 12:48", region: "Norte", estado: "Demorada", responsable: "Equipo C", servicio: "db-operaciones", horas: 6.5, sla: 4, importe: 89000 },
  { id: "OP-1053", fecha: "2026-10-27 13:10", region: "Sur", estado: "Completada", responsable: "Equipo A", servicio: "api-operaciones", horas: 2.4, sla: 4, importe: 143000 },
];

export const alertas = [
  { id: "AZ-201", hora: "10:37", servicio: "n8n-webhook", nivel: "Severa", señal: "Tiempo de respuesta sobre 2.5 s", origen: "Application Insights" },
  { id: "AZ-202", hora: "10:52", servicio: "db-operaciones", nivel: "Advertencia", señal: "Conexiones activas al 78%", origen: "Azure Monitor" },
  { id: "AZ-203", hora: "11:24", servicio: "api-operaciones", nivel: "Informativa", señal: "3 respuestas 429 en 5 min", origen: "Log Analytics" },
  { id: "AZ-204", hora: "12:06", servicio: "storage-archivos", nivel: "Advertencia", señal: "Aumento de latencia de lectura", origen: "Azure Monitor" },
];
