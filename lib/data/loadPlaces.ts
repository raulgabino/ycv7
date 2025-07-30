import type { Place, City } from "../types"
import cdmxData from "@/data/places-cdmx.json"
import monterreyData from "@/data/places-monterrey.json"
import guanajuatoData from "@/data/places-guanajuato.json"
import cdvictoriaData from "@/data/places-cdvictoria.json"

const placesData: Record<City, any> = {
  cdmx: cdmxData,
  monterrey: monterreyData,
  guadalajara: {}, // No hay datos de Guadalajara aún
  guanajuato: guanajuatoData,
  cdvictoria: cdvictoriaData,
}

function normalizePlace(place: any): Place {
  const coordinates: [number, number] = place.lat && place.lng ? [place.lat, place.lng] : [0, 0]

  return {
    id: place.id?.toString() || "",
    name: place.nombre || place.name || "Nombre no disponible",
    category: place.categoría || place.category || "Categoría no disponible",
    description: place.descripción_corta || place.descripcion || place.descripción || "",
    coordinates: coordinates,
    rank_score: place.rank_score || place.rating || 4.0,
    tags: place.playlists || place.tags || [],
    rango_precios: place.rango_precios || place.precio || "$$",
  }
}

export function loadPlaces(city: City): Place[] {
  try {
    const data = placesData[city]

    // **LA CORRECCIÓN CLAVE ESTÁ AQUÍ**
    // Buscamos la lista de lugares tanto en la clave "lugares" como en "places".
    // Esto hace que el código funcione para TODOS los archivos JSON.
    const placesArray = data.lugares || data.places || []

    if (!placesArray || placesArray.length === 0) {
      return []
    }
    return placesArray.map(normalizePlace)
  } catch (error) {
    console.error(`Error loading places for ${city}:`, error)
    return []
  }
}
