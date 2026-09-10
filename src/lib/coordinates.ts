export const SENEGAL_CITIES_COORDINATES: Record<string, [number, number]> = {
  "Dakar": [14.6928, -17.4467],
  "Thiès": [14.7910, -16.9254],
  "Mbour": [14.4222, -16.9536],
  "Saint-Louis": [16.0326, -16.4818],
  "Touba": [14.8667, -15.8833],
  "Ziguinchor": [12.5646, -16.2733],
  "Kaolack": [14.1333, -16.2500],
  "Diourbel": [14.6500, -16.2333],
  "Louga": [15.6167, -16.2333],
  "Fatick": [14.3333, -16.4167],
  "Kolda": [12.8833, -14.9500],
  "Rufisque": [14.7167, -17.2667],
  "Richard Toll": [16.4500, -15.6833],
  "Tambacounda": [13.7675, -13.6673],
};

export const DEFAULT_SENEGAL_COORDINATES: [number, number] = [14.4974, -14.4524]; // Centre du Sénégal (approx)

export function getCoordinatesForCity(city: string | null | undefined): [number, number] {
  if (!city) return DEFAULT_SENEGAL_COORDINATES;
  // Normalize string to handle case and slight differences (could be improved)
  const normalizedCity = Object.keys(SENEGAL_CITIES_COORDINATES).find(
    c => c.toLowerCase() === city.toLowerCase()
  );
  
  if (normalizedCity) {
    return SENEGAL_CITIES_COORDINATES[normalizedCity];
  }
  return DEFAULT_SENEGAL_COORDINATES;
}
