<template>
  <div id="app" class="app-root">
    <header class="app-nav">
      <div class="app-nav-inner">
        <router-link class="app-nav-brand" to="/">CV con IA</router-link>
        <nav class="app-nav-links" aria-label="Principal">
          <router-link class="app-nav-link" to="/">Inicio</router-link>
          <router-link class="app-nav-link" to="/historial">Historial</router-link>
        </nav>
      </div>
    </header>
    <router-view />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  /* Paleta: teal profundo, teal medio, blanco, gris hielo (#F8F9F9). */
  --palette-deep: #03363d;
  --palette-mid: #174d4d;
  --palette-white: #ffffff;
  --palette-canvas: #f8f9f9;

  /* Jerarquía tipográfica: negro / teal / grises según importancia */
  --text-ink: #0a0a0a;
  --text-heading: var(--palette-deep);
  --text-body: rgba(10, 10, 10, 0.82);
  --text-secondary: rgba(3, 54, 61, 0.58);
  --text-tertiary: rgba(3, 54, 61, 0.42);
  --text-accent: var(--palette-mid);
  --text-highlight: #0e4a52;
  --text-primary: var(--text-heading);
  --text-muted: var(--text-secondary);
  --surface-page: var(--palette-canvas);
  --surface-card: var(--palette-white);
  --surface-elevated: var(--palette-white);
  --border-soft: rgba(3, 54, 61, 0.1);
  --accent: var(--palette-mid);
  --accent-soft: rgba(23, 77, 77, 0.12);

  --page-glow: rgba(23, 77, 77, 0.06);
  --nav-bg: linear-gradient(180deg, #044a52 0%, var(--palette-deep) 100%);
  --nav-edge: rgba(23, 77, 77, 0.55);
  --nav-text: rgba(255, 255, 255, 0.95);
  --nav-text-dim: rgba(255, 255, 255, 0.58);
  --nav-pill: rgba(255, 255, 255, 0.08);
  --nav-pill-active: rgba(23, 77, 77, 0.55);
  --focus-ring: 0 0 0 2px var(--palette-white), 0 0 0 4px var(--palette-mid);
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-body);
  background:
    radial-gradient(ellipse 100% 65% at 50% -15%, var(--page-glow), transparent 48%),
    linear-gradient(180deg, #f3f5f5 0%, var(--surface-page) 40%, #eef1f1 100%);
  background-attachment: fixed;
}

#app.app-root {
  min-height: 100vh;
}

.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-edge);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 10px 36px rgba(0, 0, 0, 0.22);
}

.app-nav-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem clamp(1rem, 4vw, 1.5rem);
}

.app-nav-brand {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--nav-text);
  text-decoration: none;
}

.app-nav-brand:hover {
  color: #b8e6e6;
}

.app-nav-links {
  display: flex;
  gap: 0.35rem;
}

.app-nav-link {
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--nav-text-dim);
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.15s ease, background 0.15s ease;
}

.app-nav-link:hover {
  color: var(--nav-text);
  background: var(--nav-pill);
}

.app-nav-link.router-link-active {
  color: #fff;
  background: var(--nav-pill-active);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.app-nav-brand:focus-visible,
.app-nav-link:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: 8px;
}
</style>