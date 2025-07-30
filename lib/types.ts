export type City = "cdmx" | "monterrey" | "guadalajara" | "guanajuato" | "cdvictoria"

export interface Place {
  id: string
  name: string
  category: string
  description: string
  coordinates: [number, number]
  rank_score: number
  tags: string[]
  rango_precios: string
  tagline?: string
}
