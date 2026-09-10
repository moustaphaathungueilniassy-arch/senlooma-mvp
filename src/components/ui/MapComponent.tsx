'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { getCoordinatesForCity } from '@/lib/coordinates';

// Fix for default Leaflet icons in Next.js
const initLeaflet = () => {
  if (typeof window !== 'undefined') {
    // Delete the default icon options
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Merge new options for the default icons using standard leaflet paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
};

// Component to dynamically set map bounds based on markers
function MapBounds({ annonces }: { annonces: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (annonces && annonces.length > 0) {
      const bounds = L.latLngBounds(
        annonces.map(annonce => getCoordinatesForCity(annonce.city))
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [map, annonces]);

  return null;
}

export type AnnonceMapItem = {
  id: string;
  title: string;
  price: number;
  city: string;
  animalType?: string;
};

interface MapComponentProps {
  annonces?: AnnonceMapItem[];
  center?: [number, number]; // For single location map
  zoom?: number;
  singleMode?: boolean; // True for detail page, False for search page
  height?: string;
}

export default function MapComponent({ 
  annonces = [], 
  center, 
  zoom = 6, 
  singleMode = false,
  height = '400px'
}: MapComponentProps) {
  
  useEffect(() => {
    initLeaflet();
  }, []);

  const defaultCenter = center || getCoordinatesForCity('Dakar');

  return (
    <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!singleMode}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {singleMode && center ? (
          <Marker position={center} />
        ) : (
          <>
            {annonces.length > 0 && <MapBounds annonces={annonces} />}
            {annonces.map((annonce) => {
              const position = getCoordinatesForCity(annonce.city);
              return (
                <Marker key={annonce.id} position={position}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-sm mb-1">{annonce.title}</h3>
                      {annonce.animalType && (
                        <p className="text-xs text-gray-600 mb-1">{annonce.animalType}</p>
                      )}
                      <p className="text-[#F18B14] font-semibold text-sm mb-2">
                        {annonce.price.toLocaleString('fr-FR')} FCFA
                      </p>
                      <Link 
                        href={`/annonces/${annonce.id}`}
                        className="text-xs bg-[#407BFF] text-white px-2 py-1 rounded hover:bg-blue-600 inline-block"
                      >
                        Voir l'annonce
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}
