import { NextResponse, type NextRequest } from "next/server"
import OpenAI from "openai"
import { loadPlaces } from "@/lib/data/loadPlaces"
import type { City } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, vibe } = body

    if (!city || !vibe) {
      return NextResponse.json({ error: "La ciudad y la vibra son requeridas" }, { status: 400 })
    }

    const allPlaces = loadPlaces(city as City)
    if (!allPlaces || allPlaces.length === 0) {
      return NextResponse.json({ error: `No se encontraron lugares para la ciudad: ${city}` }, { status: 404 })
    }

    shuffleArray(allPlaces)
    const randomSubset = allPlaces.slice(0, 15)

    const systemPrompt = `
      Eres un "Vibe Persona", un narrador de experiencias urbanas en México. Tu tarea es crear una mini-guía o "trip" espontáneo y divertido.

      1.  **Adopta una Personalidad**: Basado en la "vibra" del usuario, adopta un rol. Si la vibra es de fiesta, sé "el compa fiestero". Si es tranquila, sé "un monje urbano". Si es de comida, sé "un crítico gastronómico sin pelos en la lengua". Usa un tono coloquial, creativo y con jerga mexicana. Puedes usar humor y referencias a memes si encajan con el tono.

      2.  **Crea una Narrativa**: No solo recomiendes 3 lugares de la lista que te daré. Crea una historia para la ruta. Tu respuesta DEBE ser un objeto JSON con tres claves principales: "route_title", "route_introduction", y "recommendations".

      3.  **Detalles del JSON**:
          * \`route_title\`: Un título muy creativo y llamativo para la ruta (ej. "La Ruta del Descontrol" o "El Recorrido del Silencio").
          * \`route_introduction\`: Un párrafo corto (2-3 frases) que introduzca la experiencia con la personalidad que adoptaste.
          * \`recommendations\`: Un array con los 3 lugares que seleccionaste. Para cada lugar, DEBES añadir una propiedad llamada "tagline" que no sea un eslogan, sino que describa el rol de ese lugar en la ruta como un paso narrativo (ej. "Paso 1: Aquí empezamos calentando motores con unos mezcales...").
    `

    const userPrompt = `Vibra del usuario: "${vibe}".\n\nLista de lugares en formato JSON:\n${JSON.stringify(randomSubset)}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    })

    const result = response.choices[0].message?.content

    if (!result) {
      throw new Error("La respuesta de OpenAI vino vacía.")
    }

    return NextResponse.json(JSON.parse(result))
  } catch (error) {
    console.error("Error en /api/random-route:", error)
    return NextResponse.json({ error: "Ocurrió un error al generar la ruta aleatoria." }, { status: 500 })
  }
}
