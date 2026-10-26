/**
 * Serviço de Cálculo Geográfico e Geofencing para Picagem de Ponto
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Fórmula de Haversine para calcular distância em metros entre duas coordenadas geográficas
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3 // Raio da Terra em metros
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const phi1 = toRad(coord1.latitude)
  const phi2 = toRad(coord2.latitude)
  const deltaPhi = toRad(coord2.latitude - coord1.latitude)
  const deltaLambda = toRad(coord2.longitude - coord1.longitude)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Valida se uma coordenada do utilizador está dentro do raio permitido de um local de trabalho
 */
export function isWithinLocationRadius(
  userCoord: Coordinates,
  locationCoord: Coordinates,
  radiusMeters: number,
  accuracyMeters?: number | null
): { isWithin: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(userCoord, locationCoord)
  // Se houver margem de precisão do GPS (accuracy), podemos ponderar de forma branda
  const effectiveRadius = radiusMeters + (accuracyMeters && accuracyMeters > 0 ? Math.min(accuracyMeters, 50) : 0)
  return {
    isWithin: distance <= effectiveRadius,
    distanceMeters: Math.round(distance),
  }
}
