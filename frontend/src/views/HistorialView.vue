<template>
  <div class="page">
    <main class="shell">
      <header class="page-intro">
        <router-link class="back-link" to="/">← Volver al generador</router-link>
        <h1 class="page-h1">Historial de solicitudes</h1>
        <p class="page-lede">
          CV generados y guardados en el servidor. Abre uno en la vista previa del inicio o descarga el PDF.
        </p>
      </header>

      <section class="card historial-card" aria-labelledby="historial-title">
        <div class="historial-head">
          <div>
            <h2 id="historial-title" class="title-block">Listado</h2>
            <p class="card-desc">Ordenado del más reciente al más antiguo.</p>
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="historialLoading"
            @click="cargarHistorial"
          >
            {{ historialLoading ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </div>

        <p v-if="historialError" class="historial-error" role="alert">
          {{ historialError }}
          <button type="button" class="link-retry" @click="cargarHistorial">Reintentar</button>
        </p>

        <div v-else-if="historialLoading && !historial.length" class="historial-skeleton" aria-busy="true">
          <div class="sk-line" />
          <div class="sk-line sk-line--short" />
          <div class="sk-line" />
        </div>

        <p v-else-if="!historialOrdenado.length" class="historial-empty">
          Aún no hay solicitudes registradas. Genera un CV desde el inicio para verla aquí.
        </p>

        <ul v-else class="historial-list" role="list">
          <li v-for="item in historialOrdenado" :key="item.id" class="historial-item" role="listitem">
            <details class="historial-details">
              <summary class="historial-summary">
                <span class="historial-summary-main">
                  <span class="historial-name">{{ item.nombre || 'Sin nombre' }}</span>
                  <span class="historial-role">{{ item.puesto_objetivo || '—' }}</span>
                </span>
                <time class="historial-date" :datetime="item.created_at">{{ formatFecha(item.created_at) }}</time>
              </summary>

              <div class="historial-body">
                <p class="historial-headline">{{ item.frase_impacto }}</p>

                <div class="historial-actions">
                  <button type="button" class="btn btn-outline" @click.stop="abrirEnInicio(item)">
                    Abrir en vista previa
                  </button>
                  <button type="button" class="btn btn-outline btn-outline--dark" @click.stop="descargarPdf(item)">
                    Descargar PDF
                  </button>
                </div>

                <div class="historial-grid">
                  <div class="historial-chunk">
                    <h3 class="historial-label">Datos enviados</h3>
                    <dl class="historial-dl">
                      <div><dt>Experiencia</dt><dd>{{ item.experiencia || '—' }}</dd></div>
                      <div><dt>Educación</dt><dd>{{ item.educacion || '—' }}</dd></div>
                      <div><dt>Skills</dt><dd>{{ item.skills || '—' }}</dd></div>
                      <div><dt>Idiomas</dt><dd>{{ item.idiomas || '—' }}</dd></div>
                      <div class="full"><dt>Proyectos</dt><dd>{{ item.proyectos || '—' }}</dd></div>
                    </dl>
                  </div>
                  <div class="historial-chunk">
                    <h3 class="historial-label">Perfil (IA)</h3>
                    <p class="historial-text">{{ item.perfil_profesional }}</p>
                    <h3 class="historial-label historial-label--spaced">Competencias</h3>
                    <div class="tags">
                      <span v-for="s in item.skills_optimizados" :key="s" class="tag">{{ s }}</span>
                    </div>
                    <h3 class="historial-label historial-label--spaced">Sugeridos</h3>
                    <div class="tags">
                      <span v-for="s in item.skills_sugeridos" :key="s" class="tag suggested">+ {{ s }}</span>
                    </div>
                    <h3 class="historial-label historial-label--spaced">Proyectos optimizados</h3>
                    <ul class="mini-list">
                      <li v-for="p in item.proyectos_optimizados" :key="p">{{ p }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE } from '../config'
import { buildAndSavePdf } from '../utils/cvPdf'
import { setCvPreviewPayload } from '../composables/cvPreviewTransfer'

const router = useRouter()

const historial = ref([])
const historialLoading = ref(false)
const historialError = ref(null)

const historialOrdenado = computed(() => {
  const list = [...historial.value]
  return list.sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime()
    const tb = new Date(b.created_at || 0).getTime()
    return tb - ta
  })
})

const fechaFmt = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

function formatFecha(iso) {
  if (!iso) return '—'
  try {
    return fechaFmt.format(new Date(iso))
  } catch {
    return iso
  }
}

async function cargarHistorial() {
  historialError.value = null
  historialLoading.value = true
  try {
    const { data } = await axios.get(`${API_BASE}/historial`)
    historial.value = Array.isArray(data) ? data : []
  } catch (e) {
    historial.value = []
    historialError.value = 'No se pudo cargar el historial. Comprueba que el servidor esté activo.'
    console.error(e)
  } finally {
    historialLoading.value = false
  }
}

function itemToFormResult(item) {
  const formLike = {
    nombre: item.nombre ?? '',
    puesto_objetivo: item.puesto_objetivo ?? '',
    experiencia: item.experiencia ?? '',
    skills: item.skills ?? '',
    educacion: item.educacion ?? '',
    proyectos: item.proyectos ?? '',
    idiomas: item.idiomas ?? ''
  }
  const resultadoLike = {
    frase_impacto: item.frase_impacto,
    perfil_profesional: item.perfil_profesional,
    skills_optimizados: item.skills_optimizados ?? [],
    skills_sugeridos: item.skills_sugeridos ?? [],
    proyectos_optimizados: item.proyectos_optimizados ?? []
  }
  return { formLike, resultadoLike }
}

function abrirEnInicio(item) {
  const { formLike, resultadoLike } = itemToFormResult(item)
  setCvPreviewPayload({ form: formLike, resultado: resultadoLike })
  router.push('/')
}

function descargarPdf(item) {
  const { formLike, resultadoLike } = itemToFormResult(item)
  buildAndSavePdf(formLike, resultadoLike)
}

onMounted(() => {
  cargarHistorial()
})
</script>

<style scoped>
.page {
  --color-text: var(--text-heading, #03363d);
  --color-muted: var(--text-secondary, rgba(3, 54, 61, 0.58));
  --color-quiet: var(--text-tertiary, rgba(3, 54, 61, 0.42));
  --color-border: rgba(3, 54, 61, 0.14);
  --color-surface: var(--surface-card, #ffffff);
  --color-accent: var(--text-accent, #174d4d);
  --color-accent-soft: var(--accent-soft, rgba(23, 77, 77, 0.12));
  --radius-lg: 14px;
  --radius-md: 10px;
  --shadow: 0 1px 2px rgba(3, 54, 61, 0.04), 0 12px 40px rgba(3, 54, 61, 0.08);
  --focus: 0 0 0 3px rgba(23, 77, 77, 0.28);
  color: var(--text-body, rgba(10, 10, 10, 0.82));
}

.shell {
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 1.5rem) 3rem;
}

.page-intro {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.back-link:focus-visible {
  outline: none;
  border-radius: 4px;
  box-shadow: var(--focus);
}

.page-h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 3.5vw, 1.875rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text-ink, #0a0a0a);
}

.page-lede {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
  max-width: 52ch;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: clamp(1.25rem, 3vw, 1.75rem);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-soft, rgba(3, 54, 61, 0.1));
  backdrop-filter: saturate(1.05);
}

.title-block {
  margin: 0 0 0.4rem;
  font-size: clamp(1.125rem, 2.4vw, 1.3125rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--text-heading, #03363d);
}

.card-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.12s ease, box-shadow 0.12s ease;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.historial-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.btn-ghost {
  color: var(--palette-mid, #174d4d);
  background: transparent;
  border: 1px solid rgba(23, 77, 77, 0.35);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-accent-soft);
}

.historial-error {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #7f1d1d;
  background: rgba(254, 226, 226, 0.85);
  border-radius: var(--radius-md);
  border: 1px solid rgba(185, 28, 28, 0.22);
}

.link-retry {
  margin-left: 0.5rem;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.historial-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.5rem 0;
}

.sk-line {
  height: 0.65rem;
  border-radius: 4px;
  background: linear-gradient(90deg, #e8ecec 0%, #f8f9f9 50%, #e8ecec 100%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.2s ease-in-out infinite;
}

.sk-line--short {
  width: 55%;
}

.historial-empty {
  margin: 0;
  padding: 1.25rem;
  text-align: center;
  font-size: 0.9375rem;
  color: var(--color-muted);
  background: #f8f9f9;
  border-radius: var(--radius-md);
  border: 1px dashed rgba(23, 77, 77, 0.25);
}

.historial-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.historial-item {
  margin: 0;
}

.historial-details {
  border: 1px solid rgba(3, 54, 61, 0.1);
  border-radius: var(--radius-md);
  background: #f8f9f9;
  overflow: hidden;
}

.historial-details[open] {
  background: #ffffff;
  border-color: rgba(23, 77, 77, 0.22);
  box-shadow: 0 1px 0 rgba(23, 77, 77, 0.06);
}

.historial-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  font: inherit;
  list-style: none;
}

.historial-summary::-webkit-details-marker {
  display: none;
}

.historial-summary::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  margin-left: auto;
  border-right: 2px solid rgba(3, 54, 61, 0.3);
  border-bottom: 2px solid rgba(3, 54, 61, 0.3);
  transform: rotate(45deg);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.historial-details[open] .historial-summary::after {
  transform: rotate(-135deg);
  margin-top: 0.2rem;
}

.historial-summary-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  text-align: left;
}

.historial-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--text-ink, #0a0a0a);
}

.historial-role {
  font-size: 0.8125rem;
  color: var(--color-accent);
}

.historial-date {
  font-size: 0.75rem;
  color: var(--color-quiet);
  white-space: nowrap;
}

.historial-body {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(3, 54, 61, 0.08);
}

.historial-headline {
  margin: 0.85rem 0 1rem;
  font-size: 0.9375rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1.45;
  color: var(--text-highlight, #0e4a52);
}

.historial-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-outline {
  color: var(--palette-mid, #174d4d);
  background: #ffffff;
  border: 1px solid rgba(23, 77, 77, 0.35);
}

.btn-outline:hover {
  background: var(--color-accent-soft);
}

.btn-outline--dark {
  color: var(--palette-deep, #03363d);
  border-color: rgba(3, 54, 61, 0.22);
}

.btn-outline--dark:hover {
  background: rgba(3, 54, 61, 0.05);
}

.historial-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 720px) {
  .historial-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.historial-chunk {
  padding: 0.85rem;
  border-radius: var(--radius-md);
  background: #f8f9f9;
  border: 1px solid rgba(3, 54, 61, 0.08);
}

.historial-label {
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-quiet);
}

.historial-label--spaced {
  margin-top: 0.85rem;
}

.historial-label:first-child {
  margin-top: 0;
}

.historial-dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.historial-dl dt {
  font-weight: 700;
  color: var(--text-heading, #03363d);
}

.historial-dl dd {
  margin: 0.15rem 0 0;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
  line-height: 1.45;
}

.historial-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  background: rgba(23, 77, 77, 0.1);
  color: var(--text-heading, #03363d);
  border: 1px solid rgba(23, 77, 77, 0.22);
}

.tag.suggested {
  background: rgba(3, 54, 61, 0.06);
  color: var(--color-muted);
  border-color: rgba(23, 77, 77, 0.2);
}

.mini-list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
  line-height: 1.55;
  font-size: 0.875rem;
}

.mini-list li {
  margin-bottom: 0.4rem;
}

@keyframes sk-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sk-line {
    animation: none;
    background: #e8ecec;
  }
}
</style>
