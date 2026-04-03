<template>
  <div>
    <div class="page-header">
      <h1>🔍 Agente de Prospección</h1>
      <p>Busca y cualifica nuevos clientes potenciales con IA</p>
    </div>

    <div class="grid-2">
      <!-- Chat con agente de prospección -->
      <div class="card" style="display: flex; flex-direction: column;">
        <h2 class="card-title">💬 Chat con el Agente</h2>
        <p class="card-sub">El agente busca clientes, analiza y los añade al CRM automáticamente</p>
        <AgentChat
          agente="prospecting"
          agentName="Prospección"
          agentEmoji="🔍"
          :suggestions="[
            'Busca promotoras en Barcelona con proyectos 2025',
            'Busca ayuntamientos con planes de rehabilitación',
            'Analiza el sector hotelero en la costa',
            'Añade a Juan García de Constructora ABC',
          ]"
          placeholder="¿Qué tipo de clientes quieres buscar hoy?"
        />
      </div>

      <!-- Lista de prospectos -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📋 Prospectos en CRM</h2>
          <button class="btn btn-secondary btn-sm" @click="refreshProspects">
            🔄 Actualizar
          </button>
        </div>

        <div class="filter-tabs">
          <button
            v-for="f in filters"
            :key="f.key"
            :class="['filter-tab', { active: activeFilter === f.key }]"
            @click="activeFilter = f.key"
          >
            {{ f.emoji }} {{ f.label }}
            <span class="filter-count">{{ getCount(f.key) }}</span>
          </button>
        </div>

        <div class="prospects-list">
          <div
            v-for="p in filteredProspects"
            :key="p.id"
            class="prospect-card"
            @click="selectedProspect = p"
            :class="{ selected: selectedProspect?.id === p.id }"
          >
            <div class="prospect-header">
              <div>
                <div class="prospect-name">{{ p.nombre }}</div>
                <div class="prospect-company">{{ p.empresa }}</div>
              </div>
              <span class="badge" :class="getStageBadgeClass(p.etapa)">
                {{ getStageLabel(p.etapa) }}
              </span>
            </div>
            <div class="prospect-desc">{{ p.descripcion }}</div>
            <div class="prospect-footer">
              <span class="type-badge" :class="`type-${p.tipoCliente}`">
                {{ getTypeLabel(p.tipoCliente) }}
              </span>
              <span v-if="p.valorEstimado" class="value-tag">
                💰 {{ formatEuro(p.valorEstimado) }}
              </span>
              <span v-if="p.proximoContacto" class="date-tag">
                📅 {{ formatDate(p.proximoContacto) }}
              </span>
            </div>
          </div>

          <div v-if="filteredProspects.length === 0" class="empty-list">
            No hay prospectos en esta etapa.
            Usa el agente para buscar nuevos clientes.
          </div>
        </div>
      </div>
    </div>

    <!-- Detalle del prospecto seleccionado -->
    <div v-if="selectedProspect" class="card prospect-detail" style="margin-top: 20px;">
      <div class="detail-header">
        <div>
          <h2 style="color:white; font-size:18px;">{{ selectedProspect.nombre }}</h2>
          <p style="color: var(--text-dim);">{{ selectedProspect.empresa }}</p>
        </div>
        <button class="btn btn-secondary" @click="selectedProspect = null">✕ Cerrar</button>
      </div>
      <div class="grid-3" style="margin-top: 16px;">
        <div>
          <div class="detail-label">Email</div>
          <div class="detail-value">{{ selectedProspect.email || '—' }}</div>
        </div>
        <div>
          <div class="detail-label">Teléfono</div>
          <div class="detail-value">{{ selectedProspect.telefono || '—' }}</div>
        </div>
        <div>
          <div class="detail-label">Cargo</div>
          <div class="detail-value">{{ selectedProspect.cargo || '—' }}</div>
        </div>
      </div>
      <div style="margin-top: 12px;">
        <div class="detail-label">Descripción</div>
        <div class="detail-value">{{ selectedProspect.descripcion }}</div>
      </div>
      <div v-if="selectedProspect.notas?.length" style="margin-top: 12px;">
        <div class="detail-label">Notas</div>
        <ul class="notes-list">
          <li v-for="nota in selectedProspect.notas" :key="nota">{{ nota }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Prospect {
  id: string;
  nombre: string;
  empresa: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  tipoCliente: string;
  descripcion: string;
  etapa: string;
  valorEstimado?: number;
  proximoContacto?: string;
  notas: string[];
}

const { data: prospects, refresh } = await useFetch<Prospect[]>("/api/prospects");

const activeFilter = ref("ALL");
const selectedProspect = ref<Prospect | null>(null);

const filters = [
  { key: "ALL", label: "Todos", emoji: "📋" },
  { key: "LEAD_NUEVO", label: "Leads", emoji: "🆕" },
  { key: "CUALIFICADO", label: "Cualificados", emoji: "✅" },
  { key: "PROPUESTA_ENVIADA", label: "Propuestas", emoji: "📤" },
  { key: "NEGOCIACION", label: "Negociación", emoji: "🤝" },
  { key: "GANADO", label: "Ganados", emoji: "🏆" },
];

const filteredProspects = computed(() => {
  if (!prospects.value) return [];
  if (activeFilter.value === "ALL") return prospects.value;
  return prospects.value.filter((p) => p.etapa === activeFilter.value);
});

function getCount(key: string): number {
  if (!prospects.value) return 0;
  if (key === "ALL") return prospects.value.length;
  return prospects.value.filter((p) => p.etapa === key).length;
}

async function refreshProspects() {
  await refresh();
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

function getTypeLabel(tipo: string): string {
  const labels: Record<string, string> = {
    promotor: "Promotor",
    administracion: "Administración",
    empresa: "Empresa",
    particular: "Particular",
  };
  return labels[tipo] || tipo;
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
</script>

<style scoped>
.card-sub {
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

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.btn-sm { padding: 6px 14px; font-size: 12px; }

.filter-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover, .filter-tab.active {
  background: var(--accent-2);
  color: white;
  border-color: var(--accent);
}

.filter-count {
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
}

.prospects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 450px;
  overflow-y: auto;
}

.prospect-card {
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.prospect-card:hover, .prospect-card.selected {
  border-color: var(--accent);
  background: rgba(233, 69, 96, 0.05);
}

.prospect-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.prospect-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.prospect-company {
  font-size: 11px;
  color: var(--text-dim);
}

.prospect-desc {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.prospect-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.type-promotor { background: rgba(66, 153, 225, 0.2); color: #64b5f6; }
.type-administracion { background: rgba(245, 166, 35, 0.2); color: var(--warning); }
.type-empresa { background: rgba(0, 217, 166, 0.2); color: var(--success); }
.type-particular { background: rgba(255,255,255,0.1); color: var(--text-dim); }

.value-tag, .date-tag {
  font-size: 11px;
  color: var(--text-dim);
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim);
  font-size: 13px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.detail-value {
  font-size: 13px;
  color: var(--text);
}

.notes-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notes-list li::before {
  content: "• ";
  color: var(--accent);
}
</style>
