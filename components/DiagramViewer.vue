<template>
  <div class="diagram-viewer">
    <div class="diagram-header">
      <div class="diagram-meta">
        <span class="diagram-type-badge">{{ typeLabel }}</span>
        <span class="diagram-title">{{ titulo }}</span>
      </div>
      <div class="diagram-actions">
        <a
          :href="drawioEditUrl"
          target="_blank"
          rel="noopener"
          class="diagram-btn"
          title="Editar en draw.io"
        >
          ✏️ Editar
        </a>
        <a
          :href="drawioViewUrl"
          target="_blank"
          rel="noopener"
          class="diagram-btn"
          title="Ver a pantalla completa"
        >
          ⛶ Pantalla completa
        </a>
        <button class="diagram-btn" @click="copyXml" title="Copiar XML">
          {{ copied ? '✅ Copiado' : '📋 XML' }}
        </button>
      </div>
    </div>

    <!-- Iframe con el viewer oficial de draw.io -->
    <div class="diagram-frame-wrap">
      <iframe
        ref="iframeRef"
        :src="viewerUrl"
        class="diagram-frame"
        sandbox="allow-scripts allow-same-origin"
        :style="{ height: frameHeight + 'px' }"
        @load="onFrameLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  xml: string;
  titulo: string;
  tipo: string;
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const frameHeight = ref(380);
const copied = ref(false);

// Comprimir y codificar el XML para la URL del viewer
// draw.io acepta XML codificado en base64 directamente en la URL
const encodedXml = computed(() => {
  try {
    return encodeURIComponent(props.xml);
  } catch {
    return "";
  }
});

// URL del viewer embebido de draw.io (oficial, sin tracking)
const viewerUrl = computed(() => {
  const base = "https://viewer.diagrams.net/";
  const params = new URLSearchParams({
    highlight: "0",
    edit: "_blank",
    layers: "1",
    nav: "1",
    title: props.titulo,
    "lightbox": "1",
  });
  return `${base}?${params.toString()}#xml=${encodedXml.value}`;
});

// URL para abrir y editar en draw.io completo
const drawioEditUrl = computed(() => {
  return `https://app.diagrams.net/#xml=${encodedXml.value}`;
});

// URL para ver a pantalla completa
const drawioViewUrl = computed(() => {
  return `https://viewer.diagrams.net/?lightbox=1&highlight=0#xml=${encodedXml.value}`;
});

const typeLabels: Record<string, string> = {
  pipeline: "📊 Pipeline",
  proceso: "🔄 Proceso",
  organigrama: "🏢 Organigrama",
  flujo: "➡️ Flujo",
  gantt: "📅 Gantt",
  mapa: "🗺️ Mapa",
  personalizado: "🎨 Diagrama",
};

const typeLabel = computed(() => typeLabels[props.tipo] || "📐 Diagrama");

function onFrameLoad() {
  // El viewer de draw.io se adapta, pero damos un poco más de altura si el tipo lo requiere
  const heightMap: Record<string, number> = {
    gantt: 500,
    organigrama: 450,
    mapa: 500,
  };
  frameHeight.value = heightMap[props.tipo] ?? 380;
}

async function copyXml() {
  try {
    await navigator.clipboard.writeText(props.xml);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // fallback silencioso
  }
}
</script>

<style scoped>
.diagram-viewer {
  border: 1px solid rgba(0, 217, 166, 0.25);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-2);
  margin-top: 12px;
}

.diagram-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 217, 166, 0.06);
  border-bottom: 1px solid rgba(0, 217, 166, 0.15);
  gap: 12px;
  flex-wrap: wrap;
}

.diagram-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.diagram-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  background: rgba(0, 217, 166, 0.15);
  border: 1px solid rgba(0, 217, 166, 0.3);
  border-radius: 20px;
  color: var(--success);
  white-space: nowrap;
}

.diagram-title {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.diagram-actions {
  display: flex;
  gap: 6px;
}

.diagram-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  font-size: 11px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.diagram-btn:hover {
  color: white;
  border-color: var(--success);
  background: rgba(0, 217, 166, 0.08);
}

.diagram-frame-wrap {
  position: relative;
  background: white; /* draw.io viewer tiene fondo blanco */
}

.diagram-frame {
  width: 100%;
  border: none;
  display: block;
  transition: height 0.3s ease;
}
</style>
