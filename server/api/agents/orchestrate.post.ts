import { getClaudeClient, MODEL, SYSTEM_PROMPTS } from "../../utils/claude";
import {
  PROSPECTING_TOOLS,
  TRACKING_TOOLS,
  MARKETING_TOOLS,
  SALES_TOOLS,
  executeTool,
  popSessionDiagrams,
} from "../../utils/agentTools";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * Añade cache_control al último bloque de contenido de un mensaje.
 * Convierte string content a array si es necesario.
 */
function withCache(msg: Anthropic.MessageParam): Anthropic.MessageParam {
  const content = Array.isArray(msg.content)
    ? msg.content
    : [{ type: "text" as const, text: msg.content as string }];

  const last = content[content.length - 1];
  const cachedLast = { ...last, cache_control: { type: "ephemeral" as const } };

  return { ...msg, content: [...content.slice(0, -1), cachedLast] };
}

/**
 * Construye el array de mensajes con cache_control estratégico:
 * - Marca el último mensaje del historial previo (prefijo estable)
 * - Deja el mensaje nuevo sin marcar (cambia en cada turno)
 */
function buildMessages(
  historial: Anthropic.MessageParam[],
  newMessage: string
): Anthropic.MessageParam[] {
  const base: Anthropic.MessageParam[] = [...historial];

  if (base.length > 0) {
    // Cachear el prefijo estable: último mensaje del historial anterior
    base[base.length - 1] = withCache(base[base.length - 1]);
  }

  base.push({ role: "user", content: newMessage });
  return base;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, agente = "orchestrator", historial = [] } = body;

  if (!message) {
    throw createError({ statusCode: 400, message: "Mensaje requerido" });
  }

  const client = getClaudeClient();

  // Seleccionar herramientas y system prompt según el agente
  const agentConfig: Record<
    string,
    { tools: Anthropic.Tool[]; systemPrompt: string }
  > = {
    orchestrator: {
      tools: [
        ...PROSPECTING_TOOLS,
        ...TRACKING_TOOLS,
        ...MARKETING_TOOLS,
        ...SALES_TOOLS,
      ].filter(
        (tool, index, self) =>
          index === self.findIndex((t) => t.name === tool.name)
      ),
      systemPrompt: SYSTEM_PROMPTS.orchestrator,
    },
    prospecting: {
      tools: PROSPECTING_TOOLS,
      systemPrompt: SYSTEM_PROMPTS.prospecting,
    },
    tracking: {
      tools: TRACKING_TOOLS,
      systemPrompt: SYSTEM_PROMPTS.tracking,
    },
    marketing: {
      tools: MARKETING_TOOLS,
      systemPrompt: SYSTEM_PROMPTS.marketing,
    },
    sales: { tools: SALES_TOOLS, systemPrompt: SYSTEM_PROMPTS.sales },
  };

  const config = agentConfig[agente] || agentConfig.orchestrator;

  // System prompt cacheado (estable por agente — nunca cambia en runtime)
  const systemCached: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: config.systemPrompt,
      cache_control: { type: "ephemeral" },
    },
  ];

  // Mensajes con cache_control en el prefijo estable del historial
  let currentMessages = buildMessages(historial, message);

  let finalResponse = "";
  let toolsUsed: string[] = [];

  // Loop agéntico
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: systemCached,
      tools: config.tools,
      messages: currentMessages,
    });

    // Append assistant response
    currentMessages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Extraer texto final
      finalResponse = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      break;
    }

    if (response.stop_reason === "tool_use") {
      // Ejecutar herramientas
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        toolsUsed.push(toolUse.name);
        const result = executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      currentMessages.push({ role: "user", content: toolResults });
    } else {
      // stop_reason inesperado
      break;
    }
  }

  if (!finalResponse) {
    finalResponse =
      "He procesado tu solicitud. ¿Puedo ayudarte con algo más?";
  }

  // Recoger diagramas generados durante el loop agéntico
  const diagramas = popSessionDiagrams();

  return {
    respuesta: finalResponse,
    agente,
    herramientasUsadas: [...new Set(toolsUsed)],
    diagramas,
    historial: currentMessages,
  };
});
