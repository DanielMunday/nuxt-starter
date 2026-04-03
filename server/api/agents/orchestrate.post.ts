import { getClaudeClient, MODEL, SYSTEM_PROMPTS } from "../../utils/claude";
import {
  PROSPECTING_TOOLS,
  TRACKING_TOOLS,
  MARKETING_TOOLS,
  SALES_TOOLS,
  executeTool,
} from "../../utils/agentTools";
import type Anthropic from "@anthropic-ai/sdk";

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

  // Construir historial de mensajes
  const messages: Anthropic.MessageParam[] = [
    ...historial,
    { role: "user", content: message },
  ];

  let finalResponse = "";
  let toolsUsed: string[] = [];
  let currentMessages = [...messages];

  // Loop agéntico
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: config.systemPrompt,
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

  return {
    respuesta: finalResponse,
    agente,
    herramientasUsadas: [...new Set(toolsUsed)],
    historial: currentMessages,
  };
});
