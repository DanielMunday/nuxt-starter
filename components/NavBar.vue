<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="brand-icon">🏛️</span>
      <span class="brand-name">ArquitectoIA</span>
    </div>
    <div class="navbar-links">
      <NuxtLink to="/" class="nav-link">
        <span class="nav-icon">📊</span>
        Dashboard
      </NuxtLink>
      <NuxtLink to="/prospectos" class="nav-link">
        <span class="nav-icon">🔍</span>
        Prospección
      </NuxtLink>
      <NuxtLink to="/proyectos" class="nav-link">
        <span class="nav-icon">📋</span>
        Proyectos
      </NuxtLink>
      <NuxtLink to="/marketing" class="nav-link">
        <span class="nav-icon">📣</span>
        Marketing
      </NuxtLink>
      <NuxtLink to="/ventas" class="nav-link">
        <span class="nav-icon">💼</span>
        Ventas
      </NuxtLink>
    </div>
    <div class="navbar-status">
      <span class="status-dot"></span>
      <span class="status-text">Claude Opus 4.6</span>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 24px;
  height: 60px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  color: white;
  white-space: nowrap;
}

.brand-icon {
  font-size: 22px;
}

.navbar-links {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.router-link-active {
  color: white;
  background: var(--accent-2);
}

.nav-icon {
  font-size: 15px;
}

.navbar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-size: 12px;
  color: var(--text-dim);
}
</style>
