import { NextResponse, type NextRequest } from "next/server"
import OpenAI from "openai"
import { loadPlaces } from "@/lib/data/loadPlaces"
import type { City } from "@/lib/types"

// Inicialización del cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// --- Función para barajar un array (Algoritmo Fisher-Yates) ---
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

    const megaPrompt = `
      Actúa como un experto local y recomendador de lugares con onda. Tu tarea es analizar una lista de lugares y una "vibra" o mood específico proporcionado por el usuario.
      Basado en la vibra "${vibe}", selecciona los 3 mejores lugares de la siguiente lista.
      Para cada lugar que recomiendes, crea un "tagline" corto, creativo y atractivo que capture su esencia en relación a la vibra.

      La lista de lugares es la siguiente:
      ${JSON.stringify(randomSubset, null, 2)}

      Devuelve tu respuesta final estrictamente en formato JSON, sin texto adicional antes o después.
      La estructura debe ser un objeto con una única clave "recommendations", que es un array de 3 objetos.
      Cada objeto debe tener exactamente las mismas propiedades que el lugar original, más una nueva propiedad llamada "tagline".
      Ejemplo de formato de respuesta:
      {
        "recommendations": [
          {
            "id": "1",
            "name": "Bar Ejemplo",
            "category": "Bar",
            "rating": 4.5,
            "price": "$$",
            "tags": ["noche", "cocteles"],
            "description": "Un bar increíble.",
            "tagline": "Donde cada cóctel cuenta una historia."
          }
        ]
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en recomendar lugares y siempre respondes en formato JSON.",
        },
        {
          role: "user",
          content: megaPrompt,
        },
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
