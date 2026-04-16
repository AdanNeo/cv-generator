from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CVData(BaseModel):
    nombre: str
    puesto_objetivo: str
    experiencia: str
    skills: str
    educacion: str
    proyectos: str
    idiomas: str

@app.post("/generar-cv")
async def generar_cv(data: CVData):
    prompt = f"""
    Eres un experto en recursos humanos y redacción de CVs profesionales.
    Con la siguiente información genera un CV optimizado en formato JSON.

    Datos del candidato:
    - Nombre: {data.nombre}
    - Puesto objetivo: {data.puesto_objetivo}
    - Años de experiencia: {data.experiencia}
    - Skills técnicos: {data.skills}
    - Educación: {data.educacion}
    - Proyectos destacados: {data.proyectos}
    - Idiomas: {data.idiomas}

    Responde ÚNICAMENTE con un JSON con esta estructura exacta, sin texto adicional ni backticks:
    {{
        "perfil_profesional": "párrafo de 3 líneas que describa al candidato",
        "skills_optimizados": ["skill1", "skill2", "skill3"],
        "skills_sugeridos": ["skill que le falta1", "skill que le falta2", "skill que le falta3"],
        "proyectos_optimizados": ["bullet point optimizado 1", "bullet point optimizado 2"],
        "frase_impacto": "una frase corta y poderosa para el headline del CV"
    }}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    texto = response.choices[0].message.content.strip()
    resultado = json.loads(texto)

    # Guardar en Supabase
    supabase.table("cvs").insert({
        "nombre": data.nombre,
        "puesto_objetivo": data.puesto_objetivo,
        "experiencia": data.experiencia,
        "skills": data.skills,
        "educacion": data.educacion,
        "proyectos": data.proyectos,
        "idiomas": data.idiomas,
        "perfil_profesional": resultado["perfil_profesional"],
        "skills_optimizados": resultado["skills_optimizados"],
        "skills_sugeridos": resultado["skills_sugeridos"],
        "proyectos_optimizados": resultado["proyectos_optimizados"],
        "frase_impacto": resultado["frase_impacto"]
    }).execute()

    return resultado

@app.get("/historial")
async def obtener_historial():
    response = supabase.table("cvs").select("*").order("created_at", desc=True).limit(10).execute()
    return response.data

@app.get("/")
def root():
    return {"message": "Backend funcionando ✅"}