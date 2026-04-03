<template>
  <div>
    <div class="page-header">
      <h1>📣 Agente de Marketing</h1>
      <p>Genera propuestas, emails y contenido personalizado con IA</p>
    </div>

    <div class="grid-2">
      <div class="card" style="display: flex; flex-direction: column;">
        <h2 class="card-title">💬 Agente de Marketing</h2>
        <p class="card-sub">El agente genera propuestas, emails y contenido para LinkedIn</p>
        <AgentChat
          agente="marketing"
          agentName="Marketing"
          agentEmoji="📣"
          :suggestions="[
            'Genera una propuesta para edificio residencial de 80 viviendas',
            'Email de primer contacto para TechPark sobre campus corporativo',
            'Crea ficha del proyecto del Ayuntamiento de Vilanova',
            'Post de LinkedIn sobre rehabilitación energética en edificios',
            'Email de seguimiento para propuesta enviada hace 5 días',
          ]"
          placeholder="¿Qué contenido necesitas generar?"
        />
      </div>

      <!-- Panel de tipos de contenido -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">🛠️ Tipos de Contenido Disponibles</h2>

        <div class="content-types">
          <div
            v-for="type in contentTypes"
            :key="type.key"
            class="content-type-card"
          >
            <div class="ct-icon">{{ type.emoji }}</div>
            <div class="ct-info">
              <div class="ct-name">{{ type.name }}</div>
              <div class="ct-desc">{{ type.desc }}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="color: white; font-size: 14px; margin-bottom: 12px;">
            💡 Ejemplos de Prompts Efectivos
          </h3>
          <div class="prompt-examples">
            <div
              v-for="ex in promptExamples"
              :key="ex"
              class="prompt-example"
            >
              <span class="prompt-icon">▷</span>
              <span>{{ ex }}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: rgba(233,69,96,0.05); border: 1px solid rgba(233,69,96,0.2); border-radius: 8px;">
          <h3 style="color: var(--accent); font-size: 13px; margin-bottom: 8px;">
            📌 IDs de Prospectos para Personalización
          </h3>
          <div style="font-size: 12px; color: var(--text-dim);">
            <div v-for="p in prospects?.slice(0, 3)" :key="p.id" style="margin: 4px 0;">
              <code style="color: var(--accent); background: rgba(233,69,96,0.1); padding: 1px 6px; border-radius: 3px;">{{ p.id }}</code>
              — {{ p.nombre }} ({{ p.empresa }})
            </div>
          </div>
          <p style="font-size: 11px; color: var(--text-dim); margin-top: 8px;">
            Menciona el ID para que el agente personalice el contenido.
          </p>
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
}

const { data: prospects } = await useFetch<Prospect[]>("/api/prospects");

const contentTypes = [
  {
    key: "propuesta",
    emoji: "📄",
    name: "Propuesta Técnico-Económica",
    desc: "Documento completo con alcance, metodología, honorarios y plazos",
  },
  {
    key: "email_captacion",
    emoji: "✉️",
    name: "Email de Captación",
    desc: "Primer contacto o seguimiento personalizado por tipo de cliente",
  },
  {
    key: "ficha_proyecto",
    emoji: "🏗️",
    name: "Ficha de Proyecto",
    desc: "Presentación de proyectos realizados para el portfolio",
  },
  {
    key: "linkedin",
    emoji: "💼",
    name: "Post LinkedIn",
    desc: "Contenido para generar autoridad y atraer clientes en LinkedIn",
  },
];

const promptExamples = [
  '"Genera propuesta para rehabilitación de 20 viviendas, presupuesto 150.000€"',
  '"Email de seguimiento para prospecto p3 (TechPark), propuesta enviada hace 1 semana"',
  '"Ficha del proyecto residencial Las Palomas — 50 viviendas, diseño biofílico"',
  '"Post LinkedIn sobre ventajas de la arquitectura sostenible para promotores"',
  '"Carta de presentación para ayuntamiento interesado en plan urbanístico"',
];
</script>

<style scoped>
.card-title { font-size: 16px; font-weight: 600; color: white; }
.card-sub { font-size: 12px; color: var(--text-dim); margin-bottom: 16px; }

.content-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-type-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.ct-icon { font-size: 24px; flex-shrink: 0; }

.ct-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin-bottom: 3px;
}

.ct-desc {
  font-size: 11px;
  color: var(--text-dim);
}

.prompt-examples {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prompt-example {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-dim);
  padding: 8px;
  background: var(--surface-2);
  border-radius: 6px;
  border: 1px solid var(--border);
  font-style: italic;
}

.prompt-icon {
  color: var(--accent);
  flex-shrink: 0;
}
</style>
