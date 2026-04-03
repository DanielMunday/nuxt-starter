// In-memory store (reemplazar por base de datos en producción)

export type PipelineStage =
  | "LEAD_NUEVO"
  | "CUALIFICADO"
  | "PROPUESTA_ENVIADA"
  | "NEGOCIACION"
  | "GANADO"
  | "PERDIDO"
  | "EN_OBRA";

export interface Prospect {
  id: string;
  nombre: string;
  empresa: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  tipoCliente: "promotor" | "administracion" | "empresa" | "particular";
  descripcion: string;
  etapa: PipelineStage;
  valorEstimado?: number;
  proximoContacto?: string;
  notas: string[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface Activity {
  id: string;
  prospectId: string;
  tipo: "llamada" | "email" | "reunion" | "propuesta" | "nota";
  descripcion: string;
  fecha: string;
  autor: string;
}

export interface MarketingContent {
  id: string;
  tipo: "propuesta" | "email" | "presentacion" | "ficha" | "social";
  titulo: string;
  contenido: string;
  clienteId?: string;
  creadoEn: string;
}

// Store global en memoria
const store = {
  prospects: [] as Prospect[],
  activities: [] as Activity[],
  marketingContent: [] as MarketingContent[],
};

// Datos de ejemplo para demostración
function initSampleData() {
  if (store.prospects.length > 0) return;

  const now = new Date().toISOString();
  store.prospects = [
    {
      id: "p1",
      nombre: "Carlos Martínez",
      empresa: "Grupo Inmobiliario Levante",
      cargo: "Director de Desarrollo",
      email: "cmartinez@grupolevante.es",
      telefono: "+34 612 345 678",
      tipoCliente: "promotor",
      descripcion:
        "Promotora con 3 proyectos residenciales planificados en la costa mediterránea. Buscan arquitecto para proyecto de 80 viviendas.",
      etapa: "CUALIFICADO",
      valorEstimado: 120000,
      proximoContacto: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notas: [
        "Interesados en arquitectura sostenible",
        "Plazo de entrega: Q2 2026",
      ],
      creadoEn: now,
      actualizadoEn: now,
    },
    {
      id: "p2",
      nombre: "Ana López Fernández",
      empresa: "Ayuntamiento de Vilanova",
      cargo: "Concejala de Urbanismo",
      email: "alopez@ayuntamiento-vilanova.es",
      tipoCliente: "administracion",
      descripcion:
        "Ayuntamiento con plan de rehabilitación de centro histórico. Licitación prevista para Q1 2026.",
      etapa: "LEAD_NUEVO",
      valorEstimado: 85000,
      notas: ["Contacto a través de red profesional"],
      creadoEn: now,
      actualizadoEn: now,
    },
    {
      id: "p3",
      nombre: "Roberto Silva",
      empresa: "TechPark Developments",
      cargo: "CEO",
      email: "rsilva@techpark.io",
      tipoCliente: "empresa",
      descripcion:
        "Empresa tech que busca diseñar nuevo campus corporativo de 5.000m². Alta prioridad.",
      etapa: "PROPUESTA_ENVIADA",
      valorEstimado: 200000,
      proximoContacto: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notas: [
        "Propuesta enviada el lunes",
        "Muy interesados en diseño biofílico",
        "Presupuesto: hasta 200k€",
      ],
      creadoEn: now,
      actualizadoEn: now,
    },
  ];
}

initSampleData();

// --- CRUD Operations ---

export function getProspects(): Prospect[] {
  return store.prospects;
}

export function getProspect(id: string): Prospect | undefined {
  return store.prospects.find((p) => p.id === id);
}

export function addProspect(data: Omit<Prospect, "id" | "creadoEn" | "actualizadoEn">): Prospect {
  const prospect: Prospect = {
    ...data,
    id: `p${Date.now()}`,
    notas: data.notas || [],
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
  store.prospects.push(prospect);
  return prospect;
}

export function updateProspect(
  id: string,
  updates: Partial<Prospect>
): Prospect | null {
  const idx = store.prospects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.prospects[idx] = {
    ...store.prospects[idx],
    ...updates,
    actualizadoEn: new Date().toISOString(),
  };
  return store.prospects[idx];
}

export function addActivity(data: Omit<Activity, "id">): Activity {
  const activity: Activity = { ...data, id: `a${Date.now()}` };
  store.activities.push(activity);
  return activity;
}

export function getActivities(prospectId?: string): Activity[] {
  if (prospectId) return store.activities.filter((a) => a.prospectId === prospectId);
  return store.activities;
}

export function addMarketingContent(
  data: Omit<MarketingContent, "id" | "creadoEn">
): MarketingContent {
  const content: MarketingContent = {
    ...data,
    id: `m${Date.now()}`,
    creadoEn: new Date().toISOString(),
  };
  store.marketingContent.push(content);
  return content;
}

export function getMarketingContent(): MarketingContent[] {
  return store.marketingContent;
}

export function getPipelineStats() {
  const prospects = store.prospects;
  const byStage = {} as Record<PipelineStage, number>;
  const valueByStage = {} as Record<PipelineStage, number>;

  const stages: PipelineStage[] = [
    "LEAD_NUEVO",
    "CUALIFICADO",
    "PROPUESTA_ENVIADA",
    "NEGOCIACION",
    "GANADO",
    "PERDIDO",
    "EN_OBRA",
  ];

  for (const stage of stages) {
    const inStage = prospects.filter((p) => p.etapa === stage);
    byStage[stage] = inStage.length;
    valueByStage[stage] = inStage.reduce(
      (sum, p) => sum + (p.valorEstimado || 0),
      0
    );
  }

  return {
    total: prospects.length,
    byStage,
    valueByStage,
    pipelineTotal: Object.values(valueByStage).reduce((a, b) => a + b, 0),
    ganados: byStage["GANADO"] || 0,
    enNegociacion: byStage["NEGOCIACION"] || 0,
  };
}
