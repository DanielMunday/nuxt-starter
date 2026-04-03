<template>
  <div>
    <div class="page-header">
      <h1>📋 Agente de Seguimiento</h1>
      <p>Gestiona el pipeline y haz seguimiento de cada oportunidad</p>
    </div>

    <div class="grid-2">
      <div class="card" style="display: flex; flex-direction: column;">
        <h2 class="card-title">💬 Agente de Seguimiento</h2>
        <p class="card-sub">Actualiza etapas, registra actividades y programa seguimientos</p>
        <AgentChat
          agente="tracking"
          agentName="Seguimiento"
          agentEmoji="📊"
          :suggestions="[
            '¿Qué prospectos tengo en negociación?',
            'Dame estadísticas del pipeline',
            'Mueve a p3 (TechPark) a GANADO',
            'Registra que llamé hoy a Carlos Martínez',
            'Programa seguimiento con p2 para el próximo lunes',
          ]"
          placeholder="¿Qué quieres actualizar o consultar?"
        />
      </div>

      <!-- Pipeline Kanban simplificado -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">📊 Vista Pipeline</h2>
        <div class="kanban">
          <div
            v-for="stage in kanbanStages"
            :key="stage.key"
            class="kanban-col"
          >
            <div class="kanban-header" :style="{ borderColor: stage.color }">
              <span>{{ stage.emoji }}</span>
              <span>{{ stage.label }}</span>
              <span class="kanban-count">{{ getProspectsForStage(stage.key).length }}</span>
            </div>
            <div class="kanban-cards">
              <div
                v-for="p in getProspectsForStage(stage.key)"
                :key="p.id"
                class="kanban-card"
              >
                <div class="kcard-name">{{ p.nombre }}</div>
                <div class="kcard-company">{{ p.empresa }}</div>
                <div v-if="p.valorEstimado" class="kcard-value">
                  💰 {{ formatEuro(p.valorEstimado) }}
                </div>
                <div v-if="p.proximoContacto" class="kcard-date">
                  📅 {{ formatDate(p.proximoContacto) }}
                </div>
              </div>
              <div v-if="getProspectsForStage(stage.key).length === 0" class="kanban-empty">
                —
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- IDs de referencia -->
    <div class="card" style="margin-top: 20px;">
      <h2 class="card-title" style="margin-bottom: 12px;">🗂️ Referencia de IDs para el Agente</h2>
      <p style="color: var(--text-dim); font-size: 12px; margin-bottom: 12px;">
        Usa estos IDs cuando hables con el agente para actualizar prospectos específicos.
      </p>
      <div class="ids-table">
        <div class="ids-header">
          <span>ID</span>
          <span>Nombre</span>
          <span>Empresa</span>
          <span>Etapa</span>
          <span>Próx. Contacto</span>
        </div>
        <div v-for="p in prospects" :key="p.id" class="ids-row">
          <code class="id-code">{{ p.id }}</code>
          <span>{{ p.nombre }}</span>
          <span>{{ p.empresa }}</span>
          <span class="badge" :class="getStageBadgeClass(p.etapa)">
            {{ getStageLabel(p.etapa) }}
          </span>
          <span>{{ p.proximoContacto ? formatDate(p.proximoContacto) : '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Prospect {
  id: string;
  nombre: string;
  empresa: string;
  etapa: string;
  valorEstimado?: number;
  proximoContacto?: string;
}

const { data: prospects } = await useFetch<Prospect[]>("/api/prospects");

const kanbanStages = [
  { key: "LEAD_NUEVO", label: "Leads", emoji: "🆕", color: "#4a5568" },
  { key: "CUALIFICADO", label: "Cualificados", emoji: "✅", color: "#f5a623" },
  { key: "PROPUESTA_ENVIADA", label: "Propuesta", emoji: "📤", color: "#4299e1" },
  { key: "NEGOCIACION", label: "Negociación", emoji: "🤝", color: "#e94560" },
  { key: "GANADO", label: "Ganado", emoji: "🏆", color: "#00d9a6" },
];

function getProspectsForStage(stage: string): Prospect[] {
  return prospects.value?.filter((p) => p.etapa === stage) || [];
}

function getStageBadgeClass(etapa: string): string {
  const map: Record<string, string> = {
    LEAD_NUEVO: "badge-lead",
    CUALIFICADO: "badge-cualificado",
    PROPUESTA_ENVIADA: "badge-propuesta",
    NEGOCIACION: "badge-negociacion",
    GANADO: "badge-ganado",
    PERDIDO: "badge-perdido",
    EN_OBRA: "badge-enobra",
  };
  return map[etapa] || "badge-lead";
}

function getStageLabel(etapa: string): string {
  const labels: Record<string, string> = {
    LEAD_NUEVO: "Lead", CUALIFICADO: "Cualificado",
    PROPUESTA_ENVIADA: "Propuesta", NEGOCIACION: "Negociación",
    GANADO: "Ganado", PERDIDO: "Perdido", EN_OBRA: "En Obra",
  };
  return labels[etapa] || etapa;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}
</script>

<style scoped>
.card-title { font-size: 16px; font-weight: 600; color: white; }
.card-sub { font-size: 12px; color: var(--text-dim); margin-bottom: 16px; }

.kanban {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.kanban-col {
  flex: 1;
  min-width: 130px;
  max-width: 180px;
}

.kanban-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-dim);
  padding: 8px;
  border-top: 2px solid;
  background: rgba(255,255,255,0.03);
  border-radius: 6px 6px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kanban-count {
  margin-left: auto;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: rgba(255,255,255,0.02);
  border-radius: 0 0 6px 6px;
  min-height: 80px;
}

.kanban-card {
  padding: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
}

.kcard-name { font-weight: 600; color: white; margin-bottom: 2px; }
.kcard-company { color: var(--text-dim); margin-bottom: 4px; }
.kcard-value { color: var(--success); }
.kcard-date { color: var(--text-dim); }

.kanban-empty {
  color: var(--text-dim);
  font-size: 11px;
  text-align: center;
  padding: 10px;
}

.ids-table {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ids-header {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 120px 120px;
  gap: 12px;
  padding: 8px 12px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

.ids-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 120px 120px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.2s;
}

.ids-row:hover { background: rgba(255,255,255,0.03); }

.id-code {
  background: rgba(255,255,255,0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
  color: var(--accent);
}
</style>
