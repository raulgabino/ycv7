import { NextResponse } from "next/server"
import OpenAI from "openai"
import { loadPlaces } from "@/lib/data/loadPlaces"
import type { City } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// NOTA: No se especifica 'export const runtime = "edge"' para usar el entorno de servidor estándar.

export async function POST(req: Request) {
  try {
    const { city, text: vibeText } = await req.json()

    if (!city || !vibeText) {
      return NextResponse.json({ error: "Faltan los parámetros city o text" }, { status: 400 })
    }

    const places = loadPlaces(city as City)
    if (places.length === 0) {
      // Si no hay lugares para una ciudad (ej. Guadalajara), devolvemos un arreglo vacío.
      return NextResponse.json({ places: [] })
    }

    const systemPrompt = `Eres un experto en la vida nocturna, gastronomía y cultura de México. Tu tarea es actuar como un recomendador de lugares con 'vibra'. Analiza la vibra solicitada por el usuario y la lista de lugares que te proporciono. Debes seleccionar los 3 mejores lugares que más se ajusten a esa vibra. Tu respuesta DEBE SER únicamente un objeto JSON con una sola clave 'places', que contenga un arreglo con los 3 objetos de los lugares que seleccionaste. Para cada lugar, DEBES añadir una nueva propiedad llamada 'tagline' con una frase creativa, corta y en español (máximo 12 palabras) que explique por qué ese lugar encaja perfectamente con la vibra. No agregues ningún otro texto, explicación o markdown fuera del objeto JSON.`

    const userPrompt = `Vibra del usuario: "${vibeText}".\n\nLista de lugares en formato JSON:\n${JSON.stringify(places)}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return NextResponse.json({ error: "No se recibió contenido del LLM" }, { status: 500 })
    }

    const result = JSON.parse(content)
    const recommendedPlaces = result.places || []

    return NextResponse.json({ places: recommendedPlaces })
  } catch (error) {
    console.error("Error en la API de consulta:", error)
    return NextResponse.json({ error: "Ocurrió un error en el servidor" }, { status: 500 })
  }
}
