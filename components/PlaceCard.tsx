import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"
import type { Place } from "@/lib/types"

interface PlaceCardProps {
  place: Place
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{place.name}</CardTitle>
          <Badge variant="secondary">{place.category}</Badge>
        </div>
        <CardDescription>{place.description}</CardDescription>
        {place.tagline && (
          <div className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm font-medium">{place.tagline}</div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            {place.rank_score}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{place.rango_precios}</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {place.coordinates[0]}, {place.coordinates[1]}
        </div>

        <div className="flex flex-wrap gap-1">
          {place.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {place.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{place.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
