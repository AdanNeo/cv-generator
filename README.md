# CV Generator — Generador de CV con Inteligencia Artificial

Aplicación web full-stack que permite a los usuarios generar currículums vitae profesionales y optimizados mediante el uso de modelos de lenguaje de gran escala (LLM). El sistema procesa los datos ingresados por el usuario, aplica técnicas de prompt engineering para redactar un perfil profesional de alto impacto, y produce un documento PDF descargable compatible con sistemas ATS (Applicant Tracking System).

**App en producción:** https://cv-generator-wine-rho.vercel.app  
**Documentación de la API:** https://cv-generator-production-9a01.up.railway.app/docs  

---

## Funcionalidades

- Formulario dinámico para ingreso de datos personales, educación, experiencia y proyectos
- Generación de perfil profesional optimizado mediante IA (modelo LLaMA 3.3 70B vía Groq)
- Sugerencia automática de skills complementarios según el perfil detectado
- Reescritura de proyectos con bullets de impacto cuantificable
- Generación de frase headline para el encabezado del CV
- Exportación del CV en formato PDF compatible con ATS
- Historial de CVs generados con persistencia en base de datos
- Despliegue continuo desde GitHub hacia Vercel y Railway

---

## Arquitectura del sistema

```
Cliente (Navegador)
        |
        | HTTPS — peticiones REST via Axios
        v
Frontend — Vue.js 3
Desplegado en Vercel (CDN global)
        |
        | HTTP REST (JSON)
        v
Backend API — FastAPI (Python 3.11)
Desplegado en Railway
        |
        |--- Groq API (LLaMA 3.3 70B)
        |    Generacion de contenido del CV via IA
        |
        |--- Supabase (PostgreSQL)
             Persistencia del historial de CVs generados
```

### Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /generar-cv | Recibe datos del usuario, llama a la IA y retorna el CV optimizado |
| GET | /historial | Retorna los ultimos 10 CVs generados ordenados por fecha |

---

## Arquitectura de datos

Se utilizó **PostgreSQL** como motor de base de datos, gestionado a través de **Supabase**, por las siguientes razones técnicas:

1. **Estructura de datos predecible:** Los campos del CV (nombre, educación, skills, proyectos) son atributos fijos y homogéneos entre registros, lo que favorece un modelo relacional sobre uno documental.

2. **Consultas ordenadas por fecha:** El historial requiere ordenamiento por `created_at`, operación que PostgreSQL ejecuta eficientemente con índices nativos.

3. **Campos semi-estructurados con JSONB:** Los atributos de tipo lista (`skills_optimizados`, `proyectos_optimizados`) se almacenan en columnas JSONB, combinando la integridad relacional con la flexibilidad de JSON sin sacrificar rendimiento en consultas.

4. **Escalabilidad:** Supabase provee autenticación, Row Level Security (RLS) y una API REST autogenerada, lo que permite escalar el sistema sin reingeniería de la capa de datos.

### Esquema de la tabla principal

```sql
CREATE TABLE cvs (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre                TEXT NOT NULL,
    puesto_objetivo       TEXT NOT NULL,
    experiencia           TEXT,
    skills                TEXT,
    educacion             TEXT,
    proyectos             TEXT,
    idiomas               TEXT,
    perfil_profesional    TEXT,
    skills_optimizados    JSONB,
    skills_sugeridos      JSONB,
    proyectos_optimizados JSONB,
    frase_impacto         TEXT,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Stack tecnologico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Frontend | Vue.js 3 (Composition API) | Framework reactivo, curva de aprendizaje reducida, compatible con Vercel |
| Backend | FastAPI (Python 3.11) | Alto rendimiento asíncrono, documentación automática con Swagger |
| Base de datos | Supabase — PostgreSQL | Solución gestionada, gratuita en tier inicial, RLS integrado |
| Modelo de IA | Groq API — llama-3.3-70b-versatile | Inferencia de alta velocidad, sin costo en tier gratuito |
| Generación PDF | jsPDF | Librería cliente sin dependencias de servidor |
| Deploy frontend | Vercel | CI/CD automático desde GitHub, CDN global |
| Deploy backend | Railway | Soporte nativo para Python, variables de entorno seguras |
| Control de versiones | GitHub | Integración directa con plataformas de despliegue |

---

## Instrucciones para ejecutar en entorno local

### Requisitos previos

- Python 3.11 o superior
- Node.js 18 o superior
- Git
- Cuenta activa en Supabase (https://supabase.com)
- API Key de Groq (https://console.groq.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/AdanNeo/cv-generator.git
cd cv-generator
```

### 2. Configurar y ejecutar el backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Crear el archivo de variables de entorno `backend/.env`:

```env
GROQ_API_KEY=tu_groq_api_key
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key
```

Iniciar el servidor de desarrollo:

```bash
uvicorn main:app --reload
```

El servidor quedará disponible en `http://localhost:8000`.  
La documentación interactiva de la API estará en `http://localhost:8000/docs`.

### 3. Configurar y ejecutar el frontend

```bash
cd ../frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Uso de Inteligencia Artificial

### En el proceso de desarrollo

Se utilizó **Cursor** como entorno de desarrollo asistido por IA para las siguientes tareas:

- Generación de la estructura base del proyecto (scaffolding de FastAPI y Vue.js)
- Depuración de errores de integración entre el backend y el frontend
- Refinamiento del diseño de la interfaz de usuario
- Optimización iterativa del prompt enviado al modelo de lenguaje

### Dentro de la aplicación

La IA se integra en el endpoint `POST /generar-cv` a través de la **Groq API**, invocando el modelo `llama-3.3-70b-versatile`. El sistema aplica las siguientes técnicas:

**Prompt engineering estructurado:** El prompt define el rol del modelo (experto en recursos humanos), los datos de entrada y el formato de salida esperado. Se utiliza `response_format: json_object` para garantizar una respuesta JSON parseable sin procesamiento adicional.

**Tareas de IA ejecutadas por el modelo:**

1. Redacción del perfil profesional adaptado al puesto objetivo declarado
2. Priorización y ampliación de skills técnicos relevantes para el rol
3. Identificación de skills complementarios no declarados por el usuario
4. Reescritura de proyectos utilizando verbos de acción orientados a resultados
5. Generación de una frase headline concisa para el encabezado del CV

El resultado es retornado como JSON estructurado, almacenado en Supabase y presentado al usuario en la interfaz para su revisión y descarga en PDF.

---

## Despliegue continuo

El repositorio en GitHub está conectado directamente con Vercel (frontend) y Railway (backend). Cada `push` a la rama `main` dispara un despliegue automático en ambas plataformas, sin intervención manual.

---

## Autor

Adán Mesías Picón  
Ingeniero de Sistemas — Universidad ESAN
