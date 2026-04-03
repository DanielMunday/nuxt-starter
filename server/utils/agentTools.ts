import type Anthropic from "@anthropic-ai/sdk";
import {
  getProspects,
  getProspect,
  addProspect,
  updateProspect,
  addActivity,
  getActivities,
  addMarketingContent,
  getPipelineStats,
} from "./store";

// Definiciones de herramientas para cada agente

export const PROSPECTING_TOOLS: Anthropic.Tool[] = [
  {
    name: "buscar_clientes_web",
    description:
      "Busca en internet promotoras inmobiliarias, ayuntamientos, empresas o particulares que puedan necesitar servicios de arquitectura. Usa términos de búsqueda específicos.",
    input_schema: {
      type: "object" as const,
      properties: {
        terminos_busqueda: {
          type: "string",
          description:
            'Términos de búsqueda (ej: "promotora inmobiliaria Madrid proyectos 2025")',
        },
        tipo_cliente: {
          type: "string",
          enum: ["promotor", "administracion", "empresa", "particular"],
          description: "Tipo de cliente a buscar",
        },
        zona_geografica: {
          type: "string",
          description: "Zona geográfica de interés (ej: Barcelona, Madrid, Costa del Sol)",
        },
      },
      required: ["terminos_busqueda"],
    },
  },
  {
    name: "analizar_prospecto",
    description:
      "Analiza y califica un prospecto según criterios de necesidad, presupuesto, timing y autoridad de decisión.",
    input_schema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string", description: "Nombre del contacto" },
        empresa: { type: "string", description: "Nombre de la empresa" },
        descripcion: {
          type: "string",
          description: "Descripción del prospecto y su necesidad",
        },
        tipo_cliente: {
          type: "string",
          enum: ["promotor", "administracion", "empresa", "particular"],
        },
      },
      required: ["nombre", "empresa", "descripcion", "tipo_cliente"],
    },
  },
  {
    name: "agregar_prospecto",
    description: "Añade un nuevo prospecto cualificado al CRM.",
    input_schema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string" },
        empresa: { type: "string" },
        cargo: { type: "string" },
        email: { type: "string" },
        telefono: { type: "string" },
        tipoCliente: {
          type: "string",
          enum: ["promotor", "administracion", "empresa", "particular"],
        },
        descripcion: { type: "string" },
        valorEstimado: {
          type: "number",
          description: "Valor estimado del proyecto en euros",
        },
      },
      required: ["nombre", "empresa", "tipoCliente", "descripcion"],
    },
  },
  {
    name: "listar_prospectos",
    description: "Lista todos los prospectos actuales en el CRM.",
    input_schema: {
      type: "object" as const,
      properties: {
        etapa: {
          type: "string",
          description: "Filtrar por etapa del pipeline (opcional)",
        },
      },
    },
  },
];

export const TRACKING_TOOLS: Anthropic.Tool[] = [
  {
    name: "listar_prospectos",
    description: "Lista todos los prospectos y su estado actual en el pipeline.",
    input_schema: {
      type: "object" as const,
      properties: {
        etapa: { type: "string", description: "Filtrar por etapa (opcional)" },
      },
    },
  },
  {
    name: "actualizar_etapa",
    description: "Mueve un prospecto a una nueva etapa del pipeline.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: { type: "string", description: "ID del prospecto" },
        nueva_etapa: {
          type: "string",
          enum: [
            "LEAD_NUEVO",
            "CUALIFICADO",
            "PROPUESTA_ENVIADA",
            "NEGOCIACION",
            "GANADO",
            "PERDIDO",
            "EN_OBRA",
          ],
        },
        nota: { type: "string", description: "Nota sobre el cambio de etapa" },
      },
      required: ["prospecto_id", "nueva_etapa"],
    },
  },
  {
    name: "registrar_actividad",
    description:
      "Registra una interacción o actividad con un prospecto (llamada, email, reunión, etc.).",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: { type: "string" },
        tipo: {
          type: "string",
          enum: ["llamada", "email", "reunion", "propuesta", "nota"],
        },
        descripcion: { type: "string" },
      },
      required: ["prospecto_id", "tipo", "descripcion"],
    },
  },
  {
    name: "programar_seguimiento",
    description: "Programa la fecha del próximo contacto con un prospecto.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: { type: "string" },
        fecha: {
          type: "string",
          description: "Fecha en formato YYYY-MM-DD",
        },
        motivo: { type: "string", description: "Motivo del seguimiento" },
      },
      required: ["prospecto_id", "fecha"],
    },
  },
  {
    name: "ver_actividades",
    description: "Ver historial de actividades de un prospecto.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: { type: "string" },
      },
      required: ["prospecto_id"],
    },
  },
  {
    name: "estadisticas_pipeline",
    description: "Obtiene estadísticas generales del pipeline de ventas.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  DIAGRAM_TOOL,
];

// Herramienta de diagramas draw.io — compartida por Marketing, Tracking y Sales
const DIAGRAM_TOOL: Anthropic.Tool = {
  name: "crear_diagrama",
  description: `Genera un diagrama visual interactivo usando draw.io XML (mxGraphModel).
Úsalo cuando el usuario pida visualizar datos: pipeline de ventas, fases de proyecto,
organigrama de clientes, proceso comercial, cronograma de obra, mapa de actores, etc.
IMPORTANTE: genera el XML completo y válido en formato mxGraphModel.
Reglas del XML:
- Siempre incluir <mxCell id="0"/> y <mxCell id="1" parent="0"/>
- Cada elemento necesita id único, vertex="1", parent="1"
- Los conectores necesitan edge="1", source y target, y <mxGeometry relative="1" as="geometry"/>
- Espaciar nodos mínimo 160px horizontal, 100px vertical
- Nunca incluir comentarios XML
- Escapar &amp; &lt; &gt; en los valores`,
  input_schema: {
    type: "object" as const,
    properties: {
      tipo: {
        type: "string",
        enum: ["pipeline", "proceso", "organigrama", "flujo", "gantt", "mapa", "personalizado"],
        description: "Tipo de diagrama a generar",
      },
      titulo: {
        type: "string",
        description: "Título del diagrama",
      },
      xml: {
        type: "string",
        description: "XML completo en formato mxGraphModel de draw.io",
      },
    },
    required: ["tipo", "titulo", "xml"],
  },
};

export const MARKETING_TOOLS: Anthropic.Tool[] = [
  {
    name: "generar_propuesta",
    description:
      "Genera una propuesta técnico-económica personalizada para un prospecto.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: {
          type: "string",
          description: "ID del prospecto (opcional, para personalizar)",
        },
        tipo_proyecto: {
          type: "string",
          description:
            "Tipo de proyecto (residencial, comercial, rehabilitación, urbanismo, etc.)",
        },
        superficie_m2: {
          type: "number",
          description: "Superficie del proyecto en m²",
        },
        presupuesto_cliente: {
          type: "number",
          description: "Presupuesto indicativo del cliente en euros",
        },
        puntos_diferenciacion: {
          type: "string",
          description: "Puntos fuertes a destacar en la propuesta",
        },
        nombre_cliente: { type: "string" },
        empresa_cliente: { type: "string" },
      },
      required: ["tipo_proyecto"],
    },
  },
  {
    name: "generar_email_captacion",
    description: "Crea un email personalizado de captación o seguimiento.",
    input_schema: {
      type: "object" as const,
      properties: {
        nombre_destinatario: { type: "string" },
        empresa_destinatario: { type: "string" },
        tipo_cliente: {
          type: "string",
          enum: ["promotor", "administracion", "empresa", "particular"],
        },
        objetivo: {
          type: "string",
          enum: [
            "primer_contacto",
            "seguimiento_propuesta",
            "reactivacion",
            "referencia",
          ],
        },
        contexto_adicional: {
          type: "string",
          description: "Información adicional sobre el cliente o contexto",
        },
      },
      required: ["nombre_destinatario", "objetivo"],
    },
  },
  {
    name: "crear_ficha_proyecto",
    description:
      "Crea una ficha de proyecto realizado para el portfolio (para mostrar a nuevos clientes).",
    input_schema: {
      type: "object" as const,
      properties: {
        nombre_proyecto: { type: "string" },
        tipo_proyecto: { type: "string" },
        descripcion: { type: "string" },
        logros_destacados: { type: "string" },
      },
      required: ["nombre_proyecto", "tipo_proyecto", "descripcion"],
    },
  },
  {
    name: "generar_post_linkedin",
    description: "Crea un post para LinkedIn para generar visibilidad y atraer clientes.",
    input_schema: {
      type: "object" as const,
      properties: {
        tema: {
          type: "string",
          description: "Tema del post (proyecto realizado, tendencia, consejo, etc.)",
        },
        objetivo: {
          type: "string",
          description: "Objetivo del post (visibilidad, captación, autoridad)",
        },
      },
      required: ["tema"],
    },
  },
  {
    name: "listar_contenido",
    description: "Lista el contenido de marketing generado.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  DIAGRAM_TOOL,
];

export const SALES_TOOLS: Anthropic.Tool[] = [
  {
    name: "estadisticas_pipeline",
    description: "Obtiene métricas y estadísticas del pipeline de ventas.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "listar_prospectos",
    description: "Lista prospectos filtrados por etapa o criterio.",
    input_schema: {
      type: "object" as const,
      properties: {
        etapa: { type: "string", description: "Filtrar por etapa" },
      },
    },
  },
  {
    name: "analizar_oportunidad",
    description:
      "Analiza una oportunidad específica y sugiere estrategia de cierre.",
    input_schema: {
      type: "object" as const,
      properties: {
        prospecto_id: { type: "string" },
      },
      required: ["prospecto_id"],
    },
  },
  {
    name: "calcular_roi_proyecto",
    description: "Calcula el ROI estimado de un proyecto para el cliente.",
    input_schema: {
      type: "object" as const,
      properties: {
        tipo_proyecto: { type: "string" },
        inversion_total: {
          type: "number",
          description: "Inversión total del proyecto (incluye honorarios)",
        },
        valor_mercado_estimado: {
          type: "number",
          description: "Valor de mercado estimado del proyecto terminado",
        },
        plazo_meses: {
          type: "number",
          description: "Plazo de ejecución en meses",
        },
      },
      required: ["tipo_proyecto", "inversion_total", "valor_mercado_estimado"],
    },
  },
  {
    name: "generar_argumentario",
    description:
      "Genera un argumentario de ventas personalizado para rebatir objeciones.",
    input_schema: {
      type: "object" as const,
      properties: {
        objecion_principal: {
          type: "string",
          description:
            'Objeción principal del cliente (ej: "precio muy alto", "plazo demasiado largo")',
        },
        tipo_cliente: {
          type: "string",
          enum: ["promotor", "administracion", "empresa", "particular"],
        },
        contexto: { type: "string" },
      },
      required: ["objecion_principal"],
    },
  },
  DIAGRAM_TOOL,
];

// Almacén de diagramas generados en la sesión actual
const _sessionDiagrams: DiagramResult[] = [];

export interface DiagramResult {
  tipo: string;
  titulo: string;
  xml: string;
}

export function popSessionDiagrams(): DiagramResult[] {
  return _sessionDiagrams.splice(0);
}

// Ejecutor de herramientas
export function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): string {
  try {
    switch (toolName) {
      case "listar_prospectos": {
        const prospects = getProspects();
        const etapa = toolInput.etapa as string | undefined;
        const filtered = etapa
          ? prospects.filter((p) => p.etapa === etapa)
          : prospects;
        if (filtered.length === 0) return "No se encontraron prospectos.";
        return JSON.stringify(
          filtered.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            empresa: p.empresa,
            tipoCliente: p.tipoCliente,
            etapa: p.etapa,
            valorEstimado: p.valorEstimado,
            proximoContacto: p.proximoContacto,
            descripcion: p.descripcion.substring(0, 100),
          })),
          null,
          2
        );
      }

      case "agregar_prospecto": {
        const prospect = addProspect({
          nombre: toolInput.nombre as string,
          empresa: toolInput.empresa as string,
          cargo: toolInput.cargo as string | undefined,
          email: toolInput.email as string | undefined,
          telefono: toolInput.telefono as string | undefined,
          tipoCliente: toolInput.tipoCliente as "promotor" | "administracion" | "empresa" | "particular",
          descripcion: toolInput.descripcion as string,
          etapa: "LEAD_NUEVO",
          valorEstimado: toolInput.valorEstimado as number | undefined,
          notas: [],
        });
        return `✅ Prospecto añadido con ID: ${prospect.id}. ${prospect.nombre} de ${prospect.empresa} en etapa LEAD_NUEVO.`;
      }

      case "actualizar_etapa": {
        const updated = updateProspect(toolInput.prospecto_id as string, {
          etapa: toolInput.nueva_etapa as "LEAD_NUEVO" | "CUALIFICADO" | "PROPUESTA_ENVIADA" | "NEGOCIACION" | "GANADO" | "PERDIDO" | "EN_OBRA",
          notas: toolInput.nota
            ? [
                ...(getProspect(toolInput.prospecto_id as string)?.notas || []),
                `[${new Date().toLocaleDateString("es-ES")}] ${toolInput.nota}`,
              ]
            : undefined,
        });
        if (!updated) return `Error: Prospecto ${toolInput.prospecto_id} no encontrado.`;
        return `✅ Prospecto ${updated.nombre} movido a etapa: ${updated.etapa}`;
      }

      case "registrar_actividad": {
        const activity = addActivity({
          prospectId: toolInput.prospecto_id as string,
          tipo: toolInput.tipo as "llamada" | "email" | "reunion" | "propuesta" | "nota",
          descripcion: toolInput.descripcion as string,
          fecha: new Date().toISOString(),
          autor: "Agente IA",
        });
        const prospect = getProspect(toolInput.prospecto_id as string);
        return `✅ Actividad registrada (ID: ${activity.id}) para ${prospect?.nombre || "prospecto desconocido"}: ${toolInput.tipo} — ${toolInput.descripcion}`;
      }

      case "programar_seguimiento": {
        const updated = updateProspect(toolInput.prospecto_id as string, {
          proximoContacto: toolInput.fecha as string,
        });
        if (!updated) return `Error: Prospecto ${toolInput.prospecto_id} no encontrado.`;
        const motivo = toolInput.motivo ? ` — Motivo: ${toolInput.motivo}` : "";
        return `✅ Seguimiento programado para ${updated.nombre} el ${toolInput.fecha}${motivo}`;
      }

      case "ver_actividades": {
        const activities = getActivities(toolInput.prospecto_id as string);
        const prospect = getProspect(toolInput.prospecto_id as string);
        if (activities.length === 0)
          return `Sin actividades registradas para ${prospect?.nombre || "este prospecto"}.`;
        return `Actividades de ${prospect?.nombre}:\n${activities
          .map(
            (a) =>
              `• [${new Date(a.fecha).toLocaleDateString("es-ES")}] ${a.tipo.toUpperCase()}: ${a.descripcion}`
          )
          .join("\n")}`;
      }

      case "estadisticas_pipeline": {
        const stats = getPipelineStats();
        return JSON.stringify(
          {
            resumen: {
              totalProspectos: stats.total,
              pipelineTotal: `${stats.pipelineTotal.toLocaleString("es-ES")} €`,
              ganados: stats.ganados,
              enNegociacion: stats.enNegociacion,
            },
            porEtapa: Object.entries(stats.byStage).map(([etapa, count]) => ({
              etapa,
              cantidad: count,
              valor: `${(stats.valueByStage[etapa as keyof typeof stats.valueByStage] || 0).toLocaleString("es-ES")} €`,
            })),
          },
          null,
          2
        );
      }

      case "analizar_oportunidad": {
        const prospect = getProspect(toolInput.prospecto_id as string);
        if (!prospect) return `Prospecto ${toolInput.prospecto_id} no encontrado.`;
        const activities = getActivities(prospect.id);
        return JSON.stringify(
          {
            prospecto: {
              nombre: prospect.nombre,
              empresa: prospect.empresa,
              etapa: prospect.etapa,
              valorEstimado: prospect.valorEstimado,
              descripcion: prospect.descripcion,
              notas: prospect.notas,
            },
            historialActividades: activities.length,
            ultimaActividad: activities.at(-1)?.descripcion || "Sin actividad registrada",
            diasSinContacto: prospect.proximoContacto
              ? Math.ceil(
                  (new Date(prospect.proximoContacto).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : "No programado",
          },
          null,
          2
        );
      }

      case "calcular_roi_proyecto": {
        const inversion = toolInput.inversion_total as number;
        const valorMercado = toolInput.valor_mercado_estimado as number;
        const plazo = (toolInput.plazo_meses as number) || 18;
        const roi = ((valorMercado - inversion) / inversion) * 100;
        const roiAnual = (roi / plazo) * 12;
        return JSON.stringify(
          {
            tipoProyecto: toolInput.tipo_proyecto,
            inversion: `${inversion.toLocaleString("es-ES")} €`,
            valorMercado: `${valorMercado.toLocaleString("es-ES")} €`,
            beneficioNeto: `${(valorMercado - inversion).toLocaleString("es-ES")} €`,
            roi: `${roi.toFixed(1)}%`,
            roiAnualizado: `${roiAnual.toFixed(1)}% anual`,
            plazo: `${plazo} meses`,
            conclusion:
              roi > 20
                ? "Excelente oportunidad de inversión"
                : roi > 10
                  ? "Inversión rentable"
                  : "Rentabilidad moderada — considerar optimización de costes",
          },
          null,
          2
        );
      }

      case "crear_diagrama": {
        const diagram: DiagramResult = {
          tipo: toolInput.tipo as string,
          titulo: toolInput.titulo as string,
          xml: toolInput.xml as string,
        };
        _sessionDiagrams.push(diagram);
        return `✅ Diagrama "${diagram.titulo}" (tipo: ${diagram.tipo}) generado y listo para visualizar.`;
      }

      // Las herramientas de generación de contenido y búsqueda las maneja Claude directamente
      case "buscar_clientes_web":
      case "analizar_prospecto":
      case "generar_propuesta":
      case "generar_email_captacion":
      case "crear_ficha_proyecto":
      case "generar_post_linkedin":
      case "generar_argumentario":
        // Retorna contexto para que Claude genere el contenido
        return JSON.stringify({
          herramienta: toolName,
          parametros: toolInput,
          instruccion:
            "Genera el contenido solicitado basándote en tu conocimiento y los parámetros proporcionados.",
        });

      case "listar_contenido": {
        // Esta herramienta simplemente devuelve el store de contenido de marketing
        const { getMarketingContent } = require("./store");
        const content = getMarketingContent();
        if (content.length === 0) return "No hay contenido de marketing generado aún.";
        return JSON.stringify(
          content.map((c: { tipo: string; titulo: string; creadoEn: string }) => ({
            tipo: c.tipo,
            titulo: c.titulo,
            fecha: new Date(c.creadoEn).toLocaleDateString("es-ES"),
          })),
          null,
          2
        );
      }

      default:
        return `Herramienta desconocida: ${toolName}`;
    }
  } catch (error) {
    return `Error ejecutando ${toolName}: ${error instanceof Error ? error.message : String(error)}`;
  }
}
