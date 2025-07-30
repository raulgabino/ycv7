"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlaceCard } from "@/components/PlaceCard"
import { MapPin, Loader2, Sparkles } from "lucide-react" // Importamos el ícono de Sparkles
import type { Place, City } from "@/lib/types"

const cities: { id: City; name: string }[] = [
  { id: "monterrey", name: "Monterrey" },
  { id: "cdmx", name: "CDMX" },
  { id: "guadalajara", name: "Guadalajara" },
  { id: "guanajuato", name: "Guanajuato" },
  { id: "cdvictoria", name: "Cd. Victoria" },
]

const trendingVibes = ["zen minimal", "playa chill", "chaos fiesta", "romanticon", "night market", "cyber underground"]

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City>("monterrey")
  const [searchText, setSearchText] = useState("")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  
  // --- NUEVA FUNCIÓN: Lógica para la búsqueda de la ruta random ---
  const handleRandomRoute = async () => {
    // Usamos el texto del input si existe, si no, una vibra genérica para que funcione.
    const vibe = searchText.trim() || "una vibra sorprendente";
    
    setLoading(true)
    setError(null)
    setSearched(true)
    setPlaces([])

    try {
      // Llamamos al nuevo endpoint /api/random-route
      const response = await fetch("/api/random-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos la ciudad y la vibra actual
        body: JSON.stringify({ city: selectedCity, vibe }),
      })

      if (!response.ok) {
        throw new Error("La respuesta del servidor no fue exitosa.")
      }

      const data = await response.json()
      // La respuesta del nuevo endpoint tiene una clave "recommendations"
      setPlaces(data.recommendations || []) 
    } catch (err) {
      setError("No se pudo generar la ruta. Intenta de nuevo.")
      console.error("Error en la ruta random:", err)
    } finally {
      setLoading(false)
    }
  }


  const handleSearch = async (vibe: string) => {
    if (!vibe) return

    setLoading(true)
    setError(null)
    setSearched(true)
    setPlaces([])

    try {
      // La búsqueda normal sigue llamando a /api/query
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: selectedCity, text: vibe }),
      })

      if (!response.ok) {
        throw new Error("La respuesta del servidor no fue exitosa.")
      }

      const data = await response.json()
      setPlaces(data.places || [])
    } catch (err) {
      setError("No se pudieron obtener las recomendaciones. Intenta de nuevo.")
      console.error("Error en la búsqueda:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center mb-2">YourCityVibes</h1>
          <p className="text-center text-muted-foreground">Encuentra lugares que van con tu vibra</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-2 p-1 bg-secondary rounded-lg">
            {cities.map((city) => (
              <Button
                key={city.id}
                variant={selectedCity === city.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCity(city.id)}
                className="text-sm"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {city.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Vibras populares</h3>
            <div className="flex flex-wrap gap-2">
              {trendingVibes.map((vibe) => (
                <Button
                  key={vibe}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchText(vibe)
                    handleSearch(vibe)
                  }}
                >
                  {vibe}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchText)}
              placeholder="ej. un lugar para bellaquear"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {/* --- BOTONES DE ACCIÓN ACTUALIZADOS --- */}
            <Button onClick={() => handleSearch(searchText)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
            {/* --- NUEVO BOTÓN "RUTA RANDOM" --- */}
            <Button onClick={handleRandomRoute} disabled={loading} variant="outline" title="Sorpréndeme con una ruta inesperada">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {loading && <div className="text-center text-muted-foreground">Buscando la vibra...</div>}
          {error && <div className="text-center text-red-500">{error}</div>}
          {!loading && searched && places.length === 0 && !error && (
            <div className="text-center text-muted-foreground">
              No encontramos lugares con esa vibra. Prueba con otra.
            </div>
          )}
          {places.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
