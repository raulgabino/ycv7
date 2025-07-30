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
  // ** INICIO DE LA CORRECCIÓN **
  // This logic fixes the crash.
  // It checks if 'lat' and 'lng' exist in the original data.
  // If they do, it creates a 'coordinates' array.
  // If they don't, it provides a default value to prevent the application from crashing.
  const coordinates: [number, number] = place.lat && place.lng ? [place.lat, place.lng] : [0, 0]

  return {
    id: place.id?.toString() || "",
    name: place.nombre || place.name || "Nombre no disponible",
    category: place.categoría || place.category || "Categoría no disponible",
    description: place.descripción_corta || place.descripcion || "",
    // We use the 'coordinates' variable created above.
    coordinates: coordinates,
    rank_score: place.rank_score || place.rating || 4.0,
    tags: place.playlists || place.tags || [],
    rango_precios: place.rango_precios || "$$",
  }
  // ** FIN DE LA CORRECCIÓN **
}

export function loadPlaces(city: City): Place[] {
  try {
    const data = placesData[city]
    // The data for some cities is in a 'lugares' property.
    const placesArray = data.lugares || data.places || []
    if (!placesArray) {
      return []
    }
    return placesArray.map(normalizePlace)
  } catch (error) {
    console.error(`Error loading places for ${city}:`, error)
    return []
  }
}
