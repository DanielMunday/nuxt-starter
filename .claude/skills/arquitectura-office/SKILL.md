# Skill: Oficina de Arquitectura IA

## Descripción
Sistema de agentes IA para gestionar una oficina de arquitectura y urbanismo.
Incluye: prospección de clientes, seguimiento de proyectos, marketing y ventas.

## Cuándo usar este skill
- Cuando el usuario pida buscar clientes o prospectos
- Cuando quiera ver el estado del pipeline de ventas
- Para generar propuestas, emails o contenido de marketing
- Para registrar actividades o actualizar el estado de un proyecto
- Para analizar oportunidades y estrategias de venta

## Agentes disponibles

### 🔍 Agente de Prospección (`agente: "prospecting"`)
Busca y cualifica nuevos clientes potenciales.
- Busca promotoras, ayuntamientos y empresas que necesiten arquitectura
- Analiza y califica prospectos (BANT: Budget, Authority, Need, Timing)
- Añade prospectos cualificados al CRM

**Ejemplo de uso:**
```
"Busca promotoras inmobiliarias en Barcelona con proyectos activos en 2025"
"Analiza este contacto y dime si merece la pena seguirlo"
"Añade a Juan García de Levante Invest como nuevo prospecto"
```

### 📊 Agente de Seguimiento (`agente: "tracking"`)
Gestiona el pipeline y seguimiento de proyectos.
- Lista y filtra prospectos por etapa
- Actualiza etapas del pipeline
- Registra llamadas, emails y reuniones
- Programa próximos seguimientos

**Pipeline de etapas:**
`LEAD_NUEVO → CUALIFICADO → PROPUESTA_ENVIADA → NEGOCIACION → GANADO/PERDIDO → EN_OBRA`

**Ejemplo de uso:**
```
"¿Qué prospectos tengo en negociación?"
"Actualiza a Carlos Martínez a etapa GANADO"
"Registra que llamé hoy a Ana López y acordamos reunión"
"Programa seguimiento con TechPark para el próximo lunes"
```

### 📣 Agente de Marketing (`agente: "marketing"`)
Genera propuestas y contenido de marketing.
- Crea propuestas técnico-económicas personalizadas
- Genera emails de captación y seguimiento
- Crea fichas de proyectos para el portfolio
- Redacta posts para LinkedIn

**Ejemplo de uso:**
```
"Genera una propuesta para un edificio residencial de 60 viviendas"
"Escribe un email de seguimiento para TechPark después de la propuesta"
"Crea una ficha para el proyecto del Ayuntamiento de Vilanova"
"Redacta un post de LinkedIn sobre rehabilitación energética"
```

### 💼 Agente de Ventas (`agente: "sales"`)
Gestiona el cierre de oportunidades y métricas comerciales.
- Analiza el pipeline y KPIs de ventas
- Sugiere estrategias de cierre
- Calcula ROI de proyectos para los clientes
- Genera argumentarios para rebatir objeciones

**Ejemplo de uso:**
```
"Dame un resumen del pipeline con valores"
"¿Cómo debo cerrar la venta con TechPark?"
"Calcula el ROI del proyecto de 80 viviendas"
"Argumentario para cuando dicen que somos muy caros"
```

### 🤖 Orquestador (`agente: "orchestrator"`)
Agente principal que coordina todos los departamentos.
- Redirige automáticamente al agente más apropiado
- Puede ejecutar acciones de múltiples departamentos
- Responde preguntas generales sobre el negocio

## API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/agents/orchestrate` | POST | Enviar mensaje al agente |
| `/api/prospects` | GET | Listar todos los prospectos |
| `/api/prospects/stats` | GET | Estadísticas del pipeline |

## Cómo llamar a los agentes

```typescript
const response = await $fetch('/api/agents/orchestrate', {
  method: 'POST',
  body: {
    message: "Tu mensaje aquí",
    agente: "prospecting", // o "tracking", "marketing", "sales", "orchestrator"
    historial: [] // Historial de conversación para contexto
  }
})

console.log(response.respuesta) // Respuesta del agente
console.log(response.herramientasUsadas) // Herramientas que se activaron
```

## Estructura de datos

### Prospect
```typescript
{
  id: string
  nombre: string
  empresa: string
  tipoCliente: "promotor" | "administracion" | "empresa" | "particular"
  etapa: PipelineStage
  valorEstimado?: number  // en euros
  proximoContacto?: string  // YYYY-MM-DD
  notas: string[]
}
```

## Diagramas draw.io (integración visual)

Los agentes de **tracking**, **marketing** y **sales** pueden generar diagramas
interactivos usando draw.io directamente en el chat. El diagrama se renderiza
como iframe inline con zoom, pan y botón "Editar en draw.io".

**Ejemplos de prompts que activan diagramas:**
```
"Muéstrame el pipeline como diagrama visual"
"Genera un diagrama del proceso de un proyecto de arquitectura"
"Visualiza el organigrama de clientes del CRM"
"Diagrama de Gantt para el proyecto de TechPark (6 meses)"
"Flujo del proceso comercial desde lead hasta firma de contrato"
```

**Cómo funciona internamente:**
1. Claude genera XML en formato `mxGraphModel` de draw.io
2. La herramienta `crear_diagrama` almacena el XML en el store de sesión
3. El API devuelve `{ diagramas: [{tipo, titulo, xml}] }` junto con la respuesta
4. El componente `DiagramViewer.vue` renderiza el XML vía el viewer oficial de draw.io

**Integración con draw.io MCP Server (para Claude Code directamente):**
El servidor MCP oficial está disponible en `https://mcp.draw.io/mcp`.
Configurado en `CLAUDE.md` del proyecto.

**Tipos de diagrama disponibles:**
- `pipeline` — Estado del CRM con prospectos por etapa
- `proceso` — Fases de un proyecto de arquitectura
- `organigrama` — Estructura cliente/contacto/proyecto
- `flujo` — Proceso comercial paso a paso
- `gantt` — Cronograma simplificado de obra
- `mapa` — Mapa de actores o stakeholders
- `personalizado` — Cualquier otro diagrama

## Integración con n8n (como en el tutorial)

Los endpoints están diseñados para ser llamados desde workflows de n8n:

1. **Webhook en n8n** → llama a `/api/agents/orchestrate`
2. **El agente** procesa el mensaje con Claude + herramientas
3. **Respuesta** vuelve al workflow de n8n para continuar el proceso

Variables de entorno requeridas en n8n:
- `ARQUITECTURA_API_URL`: URL base de esta aplicación
- `ANTHROPIC_API_KEY`: Clave API de Anthropic

## Configuración requerida

```env
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Modelo utilizado
`claude-opus-4-6` con adaptive thinking para razonamiento complejo.
