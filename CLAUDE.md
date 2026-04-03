# ArquitectoIA — Claude Code Configuration

## Proyecto
Sistema de agentes IA para oficina de arquitectura y urbanismo.
Stack: Nuxt 3 + TypeScript + Claude API (claude-opus-4-6).

## Comandos útiles
```bash
npm run dev      # Servidor de desarrollo en http://localhost:3000
npm run build    # Build de producción
```

## Variable de entorno requerida
```
ANTHROPIC_API_KEY=sk-ant-...
```

## MCP Servers configurados

### draw.io (diagramas interactivos)
Permite a Claude generar diagramas draw.io renderizados inline en el chat.

```json
{
  "mcpServers": {
    "drawio": {
      "type": "http",
      "url": "https://mcp.draw.io/mcp"
    }
  }
}
```

**Uso desde Claude Code:** cuando el usuario pida visualizar el pipeline,
procesos, organigramas o fases de obra, usa la herramienta `create_diagram`
del servidor draw.io para generar el XML mxGraphModel.

**Uso desde la app Nuxt:** los agentes usan la herramienta interna `crear_diagrama`
definida en `server/utils/agentTools.ts`, que guarda el XML y lo devuelve al
frontend para renderizarlo con el viewer oficial de draw.io via iframe.

## Arquitectura de agentes

```
/api/agents/orchestrate  ← endpoint principal (POST)
  └── agente: "orchestrator" | "prospecting" | "tracking" | "marketing" | "sales"

Herramientas por agente:
  prospecting  → buscar_clientes_web, analizar_prospecto, agregar_prospecto
  tracking     → actualizar_etapa, registrar_actividad, programar_seguimiento, crear_diagrama
  marketing    → generar_propuesta, generar_email_captacion, crear_ficha_proyecto,
                 generar_post_linkedin, crear_diagrama
  sales        → estadisticas_pipeline, analizar_oportunidad, calcular_roi_proyecto,
                 generar_argumentario, crear_diagrama
```

## Datos de ejemplo (in-memory store)
El store en `server/utils/store.ts` inicializa 3 prospectos de demo:
- `p1` — Carlos Martínez / Grupo Inmobiliario Levante (CUALIFICADO, 120k€)
- `p2` — Ana López / Ayuntamiento de Vilanova (LEAD_NUEVO, 85k€)
- `p3` — Roberto Silva / TechPark Developments (PROPUESTA_ENVIADA, 200k€)

## Skill disponible
Ver `.claude/skills/arquitectura-office/SKILL.md` para referencia completa
de cómo usar los agentes, IDs, pipeline stages y ejemplos de prompts.
