<template>
  <div>
    <div class="page-header">
      <h1>💼 Agente de Ventas</h1>
      <p>Analiza el pipeline, cierra oportunidades y optimiza el proceso comercial</p>
    </div>

    <!-- KPIs de ventas -->
    <div class="grid-4" style="margin-bottom: 24px;" v-if="stats">
      <div class="kpi-card">
        <div class="kpi-label">Pipeline Total</div>
        <div class="kpi-value">{{ formatEuro(stats.pipelineTotal) }}</div>
      </div>
      <div class="kpi-card accent">
        <div class="kpi-label">En Negociación</div>
        <div class="kpi-value">
          {{ formatEuro(stats.valueByStage?.NEGOCIACION || 0) }}
        </div>
        <div class="kpi-sub">{{ stats.byStage?.NEGOCIACION || 0 }} oportunidades</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Ganados (€)</div>
        <div class="kpi-value">
          {{ formatEuro(stats.valueByStage?.GANADO || 0) }}
        </div>
        <div class="kpi-sub">{{ stats.ganados }} proyectos</div>
      </div>
      <div class="kpi-card info">
        <div class="kpi-label">En Obra</div>
        <div class="kpi-value">
          {{ formatEuro(stats.valueByStage?.EN_OBRA || 0) }}
        </div>
        <div class="kpi-sub">{{ stats.byStage?.EN_OBRA || 0 }} activos</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card" style="display: flex; flex-direction: column;">
        <h2 class="card-title">💬 Agente de Ventas</h2>
        <p class="card-sub">Analiza oportunidades, calcula ROI y prepara argumentarios</p>
        <AgentChat
          agente="sales"
          agentName="Ventas"
          agentEmoji="💼"
          :suggestions="[
            'Analiza el pipeline completo y dame recomendaciones',
            'Estrategia para cerrar la oportunidad de TechPark (p3)',
            'Calcula el ROI de un edificio de 80 viviendas a 250k€',
            'Argumentario para cliente que dice que somos muy caros',
            '¿Cuáles son las oportunidades en riesgo?',
          ]"
          placeholder="¿Cómo puedo ayudarte a cerrar más ventas?"
        />
      </div>

      <!-- Oportunidades en riesgo -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">⚠️ Análisis de Oportunidades</h2>

        <div v-if="prospects" class="opportunities">
          <div
            v-for="p in hotProspects"
            :key="p.id"
            class="opportunity-card"
            :class="getUrgencyClass(p)"
          >
            <div class="opp-header">
              <div>
                <div class="opp-name">{{ p.nombre }}</div>
                <div class="opp-company">{{ p.empresa }}</div>
              </div>
              <div class="opp-right">
                <div class="opp-value">{{ formatEuro(p.valorEstimado || 0) }}</div>
                <span class="badge" :class="getStageBadgeClass(p.etapa)">
                  {{ getStageLabel(p.etapa) }}
                </span>
              </div>
            </div>
            <div v-if="p.proximoContacto" class="opp-date">
              <span :class="getDateClass(p.proximoContacto)">
                {{ getDateStatus(p.proximoContacto) }}
              </span>
            </div>
          </div>

          <div v-if="hotProspects.length === 0" class="empty-opps">
            No hay oportunidades activas en el pipeline.
          </div>
        </div>

        <!-- Calculadora ROI rápida -->
        <div style="margin-top: 24px; padding: 16px; background: rgba(0,217,166,0.05); border: 1px solid rgba(0,217,166,0.2); border-radius: 8px;">
          <h3 style="color: var(--success); font-size: 13px; margin-bottom: 12px;">
            📊 Calculadora ROI — Pide al Agente
          </h3>
          <p style="font-size: 12px; color: var(--text-dim); line-height: 1.6;">
            El agente puede calcular el ROI proyectado de cualquier proyecto.
            Ejemplo:<br>
            <em>"Calcula el ROI: inversión total 2.5M€, valor de mercado estimado 3.8M€,
            plazo 24 meses, proyecto residencial"</em>
          </p>
        </div>

        <!-- Fases del proceso de venta -->
        <div style="margin-top: 20px;">
          <h3 style="color: white; font-size: 13px; margin-bottom: 12px;">
            🏁 Proceso de Cierre Recomendado
          </h3>
          <div class="sales-steps">
            <div v-for="(step, i) in salesSteps" :key="i" class="sales-step">
              <div class="step-num">{{ i + 1 }}</div>
              <div class="step-content">
                <div class="step-name">{{ step.name }}</div>
                <div class="step-desc">{{ step.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

const hotProspects = computed(() => {
  if (!prospects.value) return [];
  return prospects.value.filter((p) =>
    ["NEGOCIACION", "PROPUESTA_ENVIADA", "CUALIFICADO"].includes(p.etapa)
  );
});

const salesSteps = [
  { name: "Análisis del cliente", desc: "Investigar necesidades, presupuesto y timing" },
  { name: "Propuesta personalizada", desc: "Crear propuesta adaptada al cliente específico" },
  { name: "Presentación", desc: "Reunión de presentación y respuesta a dudas" },
  { name: "Negociación", desc: "Ajustar condiciones, plazos y honorarios" },
  { name: "Cierre", desc: "Firma de contrato y inicio del proyecto" },
];

function getUrgencyClass(p: Prospect): string {
  if (p.etapa === "NEGOCIACION") return "urgency-high";
  if (p.etapa === "PROPUESTA_ENVIADA") return "urgency-medium";
  return "";
}

function getDateStatus(date: string): string {
  const days = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return `⚠️ Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return "🔴 Hoy";
  if (days <= 2) return `🟡 En ${days} día${days > 1 ? "s" : ""}`;
  return `📅 En ${days} días (${formatDate(date)})`;
}

function getDateClass(date: string): string {
  const days = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return "date-overdue";
  if (days <= 2) return "date-urgent";
  return "date-normal";
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

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.kpi-card.accent { border-color: rgba(233, 69, 96, 0.3); }
.kpi-card.success { border-color: rgba(0, 217, 166, 0.3); }
.kpi-card.info { border-color: rgba(66, 153, 225, 0.3); }

.kpi-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.kpi-sub { font-size: 11px; color: var(--text-dim); }

.opportunities {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opportunity-card {
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.opportunity-card.urgency-high { border-color: rgba(233, 69, 96, 0.4); }
.opportunity-card.urgency-medium { border-color: rgba(66, 153, 225, 0.3); }

.opp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.opp-name { font-size: 13px; font-weight: 600; color: white; }
.opp-company { font-size: 11px; color: var(--text-dim); }

.opp-right { text-align: right; }

.opp-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
  margin-bottom: 4px;
}

.opp-date { font-size: 11px; }

.date-overdue { color: #ef5350; }
.date-urgent { color: var(--warning); }
.date-normal { color: var(--text-dim); }

.empty-opps {
  text-align: center;
  padding: 30px;
  color: var(--text-dim);
  font-size: 13px;
}

.sales-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sales-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  width: 24px;
  height: 24px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.step-name { font-size: 12px; font-weight: 600; color: white; }
.step-desc { font-size: 11px; color: var(--text-dim); }
</style>
