<template>
  <div class="page">
    <!-- Pantalla de carga (overlay accesible) -->
    <Transition name="fade">
      <div
        v-if="loading"
        class="loading-backdrop"
        role="alert"
        aria-live="assertive"
        aria-busy="true"
      >
        <div class="loading-panel">
          <div class="spinner" aria-hidden="true" />
          <p class="loading-title">Generando tu CV</p>
          <p class="loading-sub">La IA está optimizando tu perfil profesional…</p>
        </div>
      </div>
    </Transition>

    <main class="shell">
      <header class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Herramienta profesional</p>
          <h1>Generador de CV con IA</h1>
          <p class="lede">
            Completa el formulario y obtén un CV con frase de impacto, skills y proyectos alineados a tu objetivo.
          </p>
          <ul class="hero-bullets" aria-label="Ventajas">
            <li>Texto optimizado para reclutamiento</li>
            <li>Exportación a PDF en un clic</li>
            <li>Sin perder tus datos en el navegador</li>
          </ul>
        </div>
        <div class="hero-visual">
          <img
            class="hero-img"
            src="/images/hero-cv.svg"
            width="480"
            height="360"
            alt=""
            decoding="async"
          />
        </div>
      </header>

      <section class="card form-card" aria-labelledby="form-title">
        <div class="card-head">
          <h2 id="form-title" class="title-block">Tus datos</h2>
          <p class="card-desc">Cuanto más concreto seas, mejor será el resultado.</p>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="nombre">Nombre completo</label>
            <input id="nombre" v-model="form.nombre" type="text" autocomplete="name" placeholder="Ej: Mesias Picon Adan" />
          </div>
          <div class="field">
            <label for="puesto">Puesto objetivo</label>
            <input id="puesto" v-model="form.puesto_objetivo" type="text" autocomplete="organization-title" placeholder="Ej: ML Engineer" />
          </div>
          <div class="field">
            <label for="exp">Años de experiencia</label>
            <input id="exp" v-model="form.experiencia" type="text" inputmode="text" placeholder="Ej: 0–1 año" />
          </div>
          <div class="field">
            <label for="skills">Skills técnicos</label>
            <input id="skills" v-model="form.skills" type="text" placeholder="Ej: Python, TensorFlow, Docker" />
          </div>
          <div class="field">
            <label for="edu">Educación</label>
            <input id="edu" v-model="form.educacion" type="text" placeholder="Ej: Ing. Sistemas — ESAN" />
          </div>
          <div class="field">
            <label for="idiomas">Idiomas</label>
            <input id="idiomas" v-model="form.idiomas" type="text" placeholder="Ej: Español, Inglés" />
          </div>
          <div class="field full-width">
            <label for="proyectos">Proyectos destacados</label>
            <textarea
              id="proyectos"
              v-model="form.proyectos"
              rows="4"
              placeholder="Describe tus proyectos más importantes…"
            />
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading"
          @click="generarCV"
        >
          <span v-if="loading" class="btn-inner">
            <span class="btn-spinner" aria-hidden="true" />
            Generando…
          </span>
          <span v-else class="btn-inner">Generar CV con IA</span>
        </button>
      </section>

      <section
        v-if="resultado"
        ref="resultSection"
        class="card result-card"
        aria-labelledby="result-title"
        tabindex="-1"
      >
        <div class="result-hero">
          <span class="result-badge" aria-hidden="true">Listo</span>
          <h2 id="result-title" class="title-result">Tu CV optimizado</h2>
          <p class="card-desc result-lead">
            Vista previa del contenido que llevará tu PDF (formato legible para sistemas ATS).
          </p>
          <div v-if="form.nombre || form.puesto_objetivo" class="result-meta">
            <p v-if="form.nombre" class="result-name">{{ form.nombre }}</p>
            <p v-if="form.puesto_objetivo" class="result-role">{{ form.puesto_objetivo }}</p>
          </div>
        </div>

        <div class="result-body">
          <article class="result-block result-block--highlight">
            <h3 class="subtitle-section">Frase de impacto</h3>
            <p class="frase-impacto">{{ resultado.frase_impacto }}</p>
          </article>

          <article class="result-block">
            <h3 class="subtitle-section">Perfil profesional</h3>
            <p class="body-text">{{ resultado.perfil_profesional }}</p>
          </article>

          <div class="result-split">
            <article class="result-block">
              <h3 class="subtitle-section">Competencias clave</h3>
              <div class="tags" role="list">
                <span v-for="skill in resultado.skills_optimizados" :key="skill" class="tag" role="listitem">
                  {{ skill }}
                </span>
              </div>
            </article>

            <article class="result-block result-block--muted">
              <h3 class="subtitle-section">Skills sugeridos</h3>
              <p class="hint-text">Para desarrollo profesional continuo</p>
              <div class="tags" role="list">
                <span v-for="skill in resultado.skills_sugeridos" :key="skill" class="tag suggested" role="listitem">
                  + {{ skill }}
                </span>
              </div>
            </article>
          </div>

          <article class="result-block">
            <h3 class="subtitle-section">Proyectos destacados</h3>
            <ul class="result-list">
              <li v-for="proyecto in resultado.proyectos_optimizados" :key="proyecto">
                {{ proyecto }}
              </li>
            </ul>
          </article>
        </div>

        <button type="button" class="btn btn-secondary" @click="descargarPDF">
          Descargar CV en PDF
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { API_BASE } from '../config'
import { buildAndSavePdf } from '../utils/cvPdf'
import { takeCvPreviewPayload } from '../composables/cvPreviewTransfer'

const loading = ref(false)
const resultado = ref(null)
const resultSection = ref(null)

const form = ref({
  nombre: '',
  puesto_objetivo: '',
  experiencia: '',
  skills: '',
  educacion: '',
  proyectos: '',
  idiomas: ''
})

async function generarCV() {
  loading.value = true
  resultado.value = null
  let ok = false
  try {
    const response = await axios.post(`${API_BASE}/generar-cv`, form.value)
    resultado.value = response.data
    ok = true
  } catch (error) {
    alert('Error al generar el CV. Intenta de nuevo.')
    console.error(error)
  } finally {
    loading.value = false
  }
  if (ok) {
    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function descargarPDF() {
  buildAndSavePdf(form.value, resultado.value)
}

onMounted(async () => {
  const p = takeCvPreviewPayload()
  if (p?.form && p?.resultado) {
    form.value = { ...p.form }
    const r = p.resultado
    resultado.value = {
      ...r,
      skills_optimizados: [...(r.skills_optimizados || [])],
      skills_sugeridos: [...(r.skills_sugeridos || [])],
      proyectos_optimizados: [...(r.proyectos_optimizados || [])]
    }
    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<style scoped>
.page {
  --color-text: var(--text-heading, #03363d);
  --color-muted: var(--text-secondary, rgba(3, 54, 61, 0.58));
  --color-quiet: var(--text-tertiary, rgba(3, 54, 61, 0.42));
  --color-border: rgba(3, 54, 61, 0.14);
  --color-surface: var(--surface-card, #ffffff);
  --color-surface-elevated: var(--surface-elevated, #ffffff);
  --color-input: #f8f9f9;
  --color-accent: var(--text-accent, #174d4d);
  --color-accent-muted: var(--palette-mid, #174d4d);
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

.hero {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: center;
  margin-bottom: clamp(1.5rem, 4vw, 2.25rem);
}

@media (min-width: 768px) {
  .hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }
}

/* Jerarquía: L1 hero > L2 título de bloque (resultado) > L2b formulario > L3 subtítulo de card > L4 sección > cuerpo */
.eyebrow {
  display: inline-block;
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.hero h1 {
  margin: 0 0 0.65rem;
  font-size: clamp(2rem, 4.8vw, 2.625rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: var(--text-ink, #0a0a0a);
}

.lede {
  margin: 0 0 1rem;
  font-size: clamp(0.9375rem, 2.2vw, 1.0625rem);
  line-height: 1.6;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
  max-width: 42ch;
}

.hero-bullets {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--color-muted);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.hero-bullets li {
  margin-bottom: 0.35rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.hero-img {
  width: 100%;
  max-width: min(420px, 100%);
  height: auto;
  display: block;
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

.card-head {
  margin-bottom: 1.25rem;
}

.title-block {
  margin: 0 0 0.4rem;
  font-size: clamp(1.125rem, 2.4vw, 1.3125rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--text-heading, #03363d);
}

.title-result {
  margin: 0.35rem 0 0.5rem;
  font-size: clamp(1.375rem, 3.2vw, 1.75rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--text-ink, #0a0a0a);
}

.card-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.result-lead {
  max-width: 48ch;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-quiet);
}

input,
textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  min-height: 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 0.9375rem;
  color: var(--text-ink, #0a0a0a);
  background: var(--color-input);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

textarea {
  min-height: 7rem;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: var(--color-quiet);
  opacity: 1;
}

input:hover,
textarea:hover {
  border-color: rgba(23, 77, 77, 0.35);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-accent-muted);
  box-shadow: var(--focus);
  background: var(--palette-white, #ffffff);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(145deg, var(--palette-mid, #174d4d) 0%, var(--palette-deep, #03363d) 100%);
  box-shadow: 0 4px 16px rgba(3, 54, 61, 0.28);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 22px rgba(3, 54, 61, 0.32);
  filter: brightness(1.05);
}

.btn-secondary {
  margin-top: 0.5rem;
  color: #fff;
  background: var(--palette-deep, #03363d);
  box-shadow: 0 2px 10px rgba(3, 54, 61, 0.22);
}

.btn-secondary:hover {
  background: #022a30;
}

.btn-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.result-hero {
  margin: -0.25rem 0 1.25rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid rgba(23, 77, 77, 0.15);
}

.result-badge {
  display: inline-block;
  margin-bottom: 0.65rem;
  padding: 0.2rem 0.55rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-highlight, #0e4a52);
  background: var(--color-accent-soft);
  border-radius: 6px;
  border: 1px solid rgba(23, 77, 77, 0.22);
}

.result-meta {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #f8f9f9 0%, #ffffff 100%);
  border: 1px solid rgba(3, 54, 61, 0.1);
}

.result-name {
  margin: 0 0 0.2rem;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-ink, #0a0a0a);
}

.result-role {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-accent);
}

.result-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.result-block {
  margin: 0;
  padding: 1rem 1.05rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft, rgba(3, 54, 61, 0.1));
  background: #f8f9f9;
}

.result-block--highlight {
  background: linear-gradient(180deg, rgba(23, 77, 77, 0.08) 0%, #ffffff 100%);
  border-color: rgba(23, 77, 77, 0.2);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset;
}

.result-block--muted {
  background: rgba(248, 249, 249, 0.95);
  border-style: dashed;
  border-color: rgba(23, 77, 77, 0.28);
}

.subtitle-section {
  margin: 0 0 0.55rem;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-quiet);
}

.result-block--highlight .subtitle-section {
  color: var(--color-accent);
}

.hint-text {
  margin: -0.15rem 0 0.5rem;
  font-size: 0.75rem;
  color: var(--color-quiet);
  font-style: italic;
}

.result-split {
  display: grid;
  gap: 1rem;
}

@media (min-width: 720px) {
  .result-split {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.frase-impacto {
  margin: 0;
  font-size: clamp(1.0625rem, 2.2vw, 1.1875rem);
  font-weight: 600;
  font-style: italic;
  line-height: 1.55;
  color: var(--text-highlight, #0e4a52);
}

.body-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
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

.result-list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-body, rgba(10, 10, 10, 0.82));
  line-height: 1.55;
}

.result-list li {
  margin-bottom: 0.4rem;
}

/* Overlay de carga */
.loading-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(3, 54, 61, 0.4);
  backdrop-filter: blur(8px);
}

.loading-panel {
  max-width: 22rem;
  width: 100%;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid rgba(23, 77, 77, 0.18);
}

.spinner {
  width: 2.75rem;
  height: 2.75rem;
  margin: 0 auto 1rem;
  border: 3px solid rgba(23, 77, 77, 0.2);
  border-top-color: var(--palette-mid, #174d4d);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.loading-title {
  margin: 0 0 0.35rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-heading, #03363d);
}

.loading-sub {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--color-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .btn-spinner {
    animation: none;
    border-top-color: transparent;
    border-right-color: var(--palette-mid, #174d4d);
  }

  .btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
