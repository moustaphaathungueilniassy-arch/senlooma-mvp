'use client';

import dynamic from 'next/dynamic';

// Disable SSR for the MapComponent because Leaflet requires the window object
const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <p className="text-gray-500 text-sm">Chargement de la carte...</p>
      </div>
    </div>
  )
});

export default DynamicMap;
