import type { Place, City } from "../types"
import cdmxData from "@/data/places-cdmx.json"
import monterreyData from "@/data/places-monterrey.json"
import guanajuatoData from "@/data/places-guanajuato.json"
import cdvictoriaData from "@/data/places-cdvictoria.json"

const placesData: Record<City, any> = {
  cdmx: cdmxData,
  monterrey: monterreyData,
  guadalajara: {}, // No tenemos datos de Guadalajara aún
  guanajuato: guanajuatoData,
  cdvictoria: cdvictoriaData,
}

function normalizePlace(place: any): Place {
  // Solución: Aseguramos que 'coordinates' siempre exista.
  // Si el objeto original tiene 'lat' y 'lng', los usamos para crear el arreglo.
  // Si no, asignamos un arreglo por defecto para evitar el crash.
  const coordinates: [number, number] = place.lat && place.lng ? [place.lat, place.lng] : [0, 0]

  return {
    id: place.id?.toString() || "",
    name: place.nombre || place.name || "Nombre no disponible",
    category: place.categoría || place.category || "Categoría no disponible",
    description: place.descripción_corta || place.descripcion || "",
    coordinates: coordinates, // Usamos el arreglo que acabamos de crear.
    rank_score: place.rank_score || place.rating || 4.0,
    tags: place.playlists || place.tags || [],
    rango_precios: place.rango_precios || "$$",
  }
}

export function loadPlaces(city: City): Place[] {
  try {
    const data = placesData[city]
    if (!data || !data.lugares) {
      return []
    }
    return data.lugares.map(normalizePlace)
  } catch (error) {
    console.error(`Error loading places for ${city}:`, error)
    return []
  }
}
