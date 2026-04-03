<template>
  <div class="app">
    <NavBar />
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #1a1a2e;
  --accent: #e94560;
  --accent-2: #0f3460;
  --surface: #16213e;
  --surface-2: #1a2744;
  --text: #e0e0e0;
  --text-dim: #8892a4;
  --success: #00d9a6;
  --warning: #f5a623;
  --border: rgba(255, 255, 255, 0.08);
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--primary);
  color: var(--text);
  min-height: 100vh;
  font-size: 14px;
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Componentes globales */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: #c73550;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--accent-2);
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-lead { background: rgba(255,255,255,0.1); color: var(--text-dim); }
.badge-cualificado { background: rgba(245, 166, 35, 0.2); color: var(--warning); }
.badge-propuesta { background: rgba(15, 52, 96, 0.5); color: #64b5f6; }
.badge-negociacion { background: rgba(233, 69, 96, 0.2); color: var(--accent); }
.badge-ganado { background: rgba(0, 217, 166, 0.2); color: var(--success); }
.badge-perdido { background: rgba(255, 0, 0, 0.1); color: #ef5350; }
.badge-enobra { background: rgba(0, 217, 166, 0.15); color: #26c6da; }

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-dim);
  font-size: 14px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
  .main-content {
    padding: 16px;
  }
}
</style>
