<template>
  <div class="agent-chat">
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="chat-empty">
        <span class="empty-icon">{{ agentEmoji }}</span>
        <p>{{ placeholder }}</p>
        <div v-if="suggestions.length > 0" class="suggestions">
          <button
            v-for="s in suggestions"
            :key="s"
            class="suggestion-btn"
            @click="sendMessage(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message', msg.role]"
      >
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : agentEmoji }}
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          <!-- Diagramas draw.io adjuntos al mensaje -->
          <DiagramViewer
            v-for="(d, di) in msg.diagramas"
            :key="di"
            :xml="d.xml"
            :titulo="d.titulo"
            :tipo="d.tipo"
          />
          <div v-if="msg.tools && msg.tools.length > 0" class="tools-used">
            <span v-for="tool in msg.tools" :key="tool" class="tool-tag">
              🔧 {{ tool }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="message assistant">
        <div class="message-avatar">{{ agentEmoji }}</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <textarea
        v-model="input"
        :placeholder="`Escribe tu mensaje para el agente de ${agentName}...`"
        @keydown.enter.prevent="handleEnter"
        rows="1"
        class="input-textarea"
        :disabled="loading"
      ></textarea>
      <button
        class="send-btn"
        @click="sendMessage()"
        :disabled="loading || !input.trim()"
      >
        {{ loading ? '⏳' : '➤' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DiagramResult {
  tipo: string;
  titulo: string;
  xml: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  diagramas?: DiagramResult[];
}

interface HistorialItem {
  role: "user" | "assistant";
  content: string | unknown[];
}

const props = defineProps<{
  agente: string;
  agentName: string;
  agentEmoji?: string;
  placeholder?: string;
  suggestions?: string[];
}>();

const agentEmoji = props.agentEmoji || "🤖";
const placeholder =
  props.placeholder ||
  "Pregunta algo al agente...";
const suggestions = props.suggestions || [];

const messages = ref<Message[]>([]);
const input = ref("");
const loading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const historial = ref<HistorialItem[]>([]);

async function sendMessage(text?: string) {
  const msg = text || input.value.trim();
  if (!msg || loading.value) return;

  input.value = "";
  messages.value.push({ role: "user", content: msg });
  loading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    const response = await $fetch<{
      respuesta: string;
      herramientasUsadas: string[];
      diagramas: DiagramResult[];
      historial: HistorialItem[];
    }>("/api/agents/orchestrate", {
      method: "POST",
      body: {
        message: msg,
        agente: props.agente,
        historial: historial.value,
      },
    });

    messages.value.push({
      role: "assistant",
      content: response.respuesta,
      tools: response.herramientasUsadas,
      diagramas: response.diagramas?.length ? response.diagramas : undefined,
    });

    // Actualizar historial para contexto
    historial.value = response.historial;
  } catch (error) {
    messages.value.push({
      role: "assistant",
      content:
        "❌ Error al conectar con el agente. Verifica que ANTHROPIC_API_KEY está configurada en `.env`.",
    });
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function handleEnter(e: KeyboardEvent) {
  if (!e.shiftKey) sendMessage();
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function formatMessage(text: string): string {
  // Formato básico: negritas, listas, código
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/^## (.+)$/gm, '<h3 class="msg-h3">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="msg-h4">$1</h4>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}
</script>

<style scoped>
.agent-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 300px;
  max-height: 500px;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 48px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.suggestion-btn {
  padding: 8px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: var(--accent-2);
  border-color: var(--accent);
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.message-content {
  max-width: 80%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
}

.message.user .message-text {
  background: var(--accent-2);
  color: white;
  border-radius: 12px 12px 4px 12px;
}

.message.assistant .message-text {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px 12px 12px 12px;
}

.tools-used {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.tool-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.2);
  border-radius: 10px;
  color: var(--accent);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--surface-2);
  border-radius: 4px 12px 12px 12px;
  border: 1px solid var(--border);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--text-dim);
  border-radius: 50%;
  animation: bounce 1.2s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
  40% { transform: scale(1.3); opacity: 1; }
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.input-textarea {
  flex: 1;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text);
  font-size: 13px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.input-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.send-btn {
  width: 42px;
  height: 42px;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #c73550;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.inline-code) {
  background: rgba(255,255,255,0.1);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

:deep(.msg-h3) {
  font-size: 15px;
  font-weight: 600;
  margin: 8px 0 4px;
  color: white;
}

:deep(.msg-h4) {
  font-size: 13px;
  font-weight: 600;
  margin: 6px 0 2px;
  color: #b0c4de;
}
</style>
