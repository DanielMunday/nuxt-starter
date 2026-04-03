<template>
  <div>
    <div class="page-header">
      <h1>🏛️ ArquitectoIA — Dashboard</h1>
      <p>Sistema de agentes IA para tu oficina de arquitectura y urbanismo</p>
    </div>

    <!-- Estadísticas del pipeline -->
    <div class="grid-4" style="margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-label">Pipeline Total</div>
        <div class="stat-value">
          {{ stats ? formatEuro(stats.pipelineTotal) : "—" }}
        </div>
        <div class="stat-sub">valor total oportunidades</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Prospectos Activos</div>
        <div class="stat-value">{{ stats?.total || 0 }}</div>
        <div class="stat-sub">en el CRM</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">Ganados</div>
        <div class="stat-value">{{ stats?.ganados || 0 }}</div>
        <div class="stat-sub">proyectos adjudicados</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">En Negociación</div>
        <div class="stat-value">{{ stats?.enNegociacion || 0 }}</div>
        <div class="stat-sub">oportunidades activas</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 24px;">
      <!-- Pipeline visual -->
      <div class="card">
        <h2 class="card-title">📊 Pipeline por Etapas</h2>
        <div class="pipeline-stages" v-if="stats">
          <div
            v-for="stage in pipelineStages"
            :key="stage.key"
            class="pipeline-stage"
          >
            <div class="stage-info">
              <span class="stage-emoji">{{ stage.emoji }}</span>
              <span class="stage-name">{{ stage.label }}</span>
              <span class="stage-count badge" :class="stage.badgeClass">
                {{ stats.byStage[stage.key] || 0 }}
              </span>
            </div>
            <div class="stage-bar">
              <div
                class="stage-fill"
                :style="{
                  width: getBarWidth(stats.byStage[stage.key] || 0) + '%',
                  background: stage.color,
                }"
              ></div>
            </div>
            <div class="stage-value">
              {{ formatEuro(stats.valueByStage?.[stage.key] || 0) }}
            </div>
          </div>
        </div>
        <div v-else class="loading-state">Cargando estadísticas...</div>
      </div>

      <!-- Chat con orquestador -->
      <div class="card chat-card">
        <h2 class="card-title">🤖 Asistente IA</h2>
        <p class="card-subtitle">Pregunta cualquier cosa sobre tu pipeline</p>
        <AgentChat
          agente="orchestrator"
          agentName="Orquestador"
          agentEmoji="🤖"
          :suggestions="[
            'Dame un resumen del pipeline',
            'Busca promotoras en Madrid',
            'Genera una propuesta para 50 viviendas',
          ]"
          placeholder="Pregunta sobre clientes, proyectos, marketing..."
        />
      </div>
    </div>

    <!-- Prospectos recientes -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🗂️ Prospectos Recientes</h2>
        <NuxtLink to="/prospectos" class="btn btn-secondary btn-sm">
          Ver todos →
        </NuxtLink>
      </div>
      <div v-if="prospects.length > 0" class="prospects-list">
        <div
          v-for="p in prospects.slice(0, 5)"
          :key="p.id"
          class="prospect-row"
        >
          <div class="prospect-info">
            <span class="prospect-name">{{ p.nombre }}</span>
            <span class="prospect-company">{{ p.empresa }}</span>
          </div>
          <span
            class="badge"
            :class="getStageBadgeClass(p.etapa)"
          >
            {{ getStageLabel(p.etapa) }}
          </span>
          <span class="prospect-value">
            {{ p.valorEstimado ? formatEuro(p.valorEstimado) : "—" }}
          </span>
          <span v-if="p.proximoContacto" class="prospect-date">
            📅 {{ formatDate(p.proximoContacto) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Módulos de agentes -->
    <div class="grid-4" style="margin-top: 24px;">
      <NuxtLink to="/prospectos" class="module-card">
        <div class="module-icon">🔍</div>
        <div class="module-name">Prospección</div>
        <div class="module-desc">Busca y cualifica nuevos clientes</div>
      </NuxtLink>
      <NuxtLink to="/proyectos" class="module-card">
        <div class="module-icon">📋</div>
        <div class="module-name">Seguimiento</div>
        <div class="module-desc">Gestiona el pipeline y actividades</div>
      </NuxtLink>
      <NuxtLink to="/marketing" class="module-card">
        <div class="module-icon">📣</div>
        <div class="module-name">Marketing</div>
        <div class="module-desc">Propuestas, emails y contenido</div>
      </NuxtLink>
      <NuxtLink to="/ventas" class="module-card">
        <div class="module-icon">💼</div>
        <div class="module-name">Ventas</div>
        <div class="module-desc">Pipeline, métricas y cierres</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  total: number;
  pipelineTotal: number;
  ganados: number;
  enNegociacion: number;
  byStage: Record<string, number>;
  valueByStage: Record<string, number>;
}

interface Prospect {
  id: string;
  nombre: string;
  empresa: string;
  etapa: string;
  valorEstimado?: number;
  proximoContacto?: string;
}

const { data: stats } = await useFetch<Stats>("/api/prospects/stats");
const { data: prospects } = await useFetch<Prospect[]>("/api/prospects");

const pipelineStages = [
  { key: "LEAD_NUEVO", label: "Lead Nuevo", emoji: "🆕", color: "#4a5568", badgeClass: "badge-lead" },
  { key: "CUALIFICADO", label: "Cualificado", emoji: "✅", color: "#f5a623", badgeClass: "badge-cualificado" },
  { key: "PROPUESTA_ENVIADA", label: "Propuesta Enviada", emoji: "📤", color: "#4299e1", badgeClass: "badge-propuesta" },
  { key: "NEGOCIACION", label: "Negociación", emoji: "🤝", color: "#e94560", badgeClass: "badge-negociacion" },
  { key: "GANADO", label: "Ganado", emoji: "🏆", color: "#00d9a6", badgeClass: "badge-ganado" },
  { key: "EN_OBRA", label: "En Obra", emoji: "🏗️", color: "#26c6da", badgeClass: "badge-enobra" },
];

function getBarWidth(count: number): number {
  const max = Math.max(
    ...(Object.values(stats.value?.byStage || {}) as number[]),
    1
  );
  return Math.round((count / max) * 100);
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
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
    LEAD_NUEVO: "Lead",
    CUALIFICADO: "Cualificado",
    PROPUESTA_ENVIADA: "Propuesta",
    NEGOCIACION: "Negociación",
    GANADO: "Ganado",
    PERDIDO: "Perdido",
    EN_OBRA: "En Obra",
  };
  return labels[etapa] || etapa;
}
</script>

<style scoped>
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.stat-card.success { border-color: rgba(0, 217, 166, 0.3); }
.stat-card.warning { border-color: rgba(245, 166, 35, 0.3); }

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-sub {
  font-size: 11px;
  color: var(--text-dim);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.chat-card {
  display: flex;
  flex-direction: column;
  min-height: 450px;
}

.pipeline-stages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pipeline-stage {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-emoji { font-size: 16px; }

.stage-name {
  font-size: 13px;
  color: var(--text);
}

.stage-bar {
  grid-column: 1 / -1;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
}

.stage-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.stage-value {
  font-size: 12px;
  color: var(--text-dim);
  white-space: nowrap;
}

.stage-count {
  font-size: 11px;
}

.prospects-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.prospect-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.prospect-row:hover { background: rgba(255,255,255,0.04); }

.prospect-info {
  flex: 1;
  min-width: 0;
}

.prospect-name {
  display: block;
  font-weight: 500;
  font-size: 13px;
  color: white;
}

.prospect-company {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
}

.prospect-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
  white-space: nowrap;
}

.prospect-date {
  font-size: 11px;
  color: var(--text-dim);
  white-space: nowrap;
}

.loading-state {
  text-align: center;
  color: var(--text-dim);
  padding: 40px;
}

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.module-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  background: var(--surface-2);
}

.module-icon { font-size: 36px; margin-bottom: 10px; }

.module-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
}

.module-desc {
  font-size: 12px;
  color: var(--text-dim);
}
</style>
