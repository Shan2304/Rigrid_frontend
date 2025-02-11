'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios, { AxiosError } from 'axios';
import ParcelDetails from './ParcelDetails'; // Import ParcelDetails component

// Fix leaflet marker icons
L.Icon.Default.prototype.options.iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
L.Icon.Default.prototype.options.shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Custom hook to move the map
const MapFlyTo = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 14);
  }, [position, map]);
  return null;
};

// Define the types for props
interface MapClickHandlerProps {
  setPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
  fetchParcelDetails: (lat: number, lon: number) => Promise<void>;
}

// Click event handler
const MapClickHandler = ({ setPosition, fetchParcelDetails }: MapClickHandlerProps) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      console.log(`Clicked at: ${lat}, ${lng}`);
      setPosition([lat, lng]);
      await fetchParcelDetails(lat, lng);
    },
  });

  return null;
};

// Dynamic Import to Prevent SSR Issues
const MapComponentNoSSR = dynamic(() => Promise.resolve(MapComponent), { ssr: false });

function MapComponent() {
  const [position, setPosition] = useState<[number, number]>([41.428516, -100.197158]);
  const [searchInput, setSearchInput] = useState('');
  const [parcelData, setParcelData] = useState(null);

  // Function to search by address
  const searchAddress = async () => {
    if (!searchInput.trim()) return;
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: searchInput, format: 'json' },
      });

      if (data.length > 0) {
        const { lat, lon } = data[0];
        console.log(`Address found: ${lat}, ${lon}`);
        setPosition([parseFloat(lat), parseFloat(lon)]);
        await fetchParcelDetails(parseFloat(lat), parseFloat(lon));
      } else {
        alert('Address not found!');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Fetch parcel details
  const fetchParcelDetails = async (lat: number, lon: number) => {
    try {
      const url = `http://localhost:5000/regrid/parcels?lat=${lat}&lon=${lon}`;
      console.log('Fetching:', url);
      const { data } = await axios.get(url);
      console.log('Parcel Data:', data);

      // Assuming the first parcel data is what we need
      if (Array.isArray(data.parcels) && data.parcels.length > 0) {
        setParcelData(data.parcels[0]); // Assign the first parcel details
      } else {
        console.warn('No parcel data available.');
        setParcelData(null); // No data found
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Error is an AxiosError, so it's safe to access response
        console.error('Error fetching parcel details:', error.response?.data || error.message);
      } else {
        // If it's not an AxiosError, log a generic error message
        console.error('Error fetching parcel details:', error instanceof Error ? error.message : 'Unknown error');
      }
      setParcelData(null); // Reset data if there's an error
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4 text-center text-xl font-semibold">
        Regrid Parcel Search
      </header>

      <div className="flex-grow flex justify-center items-center relative">
        {/* Map Display */}
        <div className="w-full max-w-screen-xl h-[80vh] sm:h-[600px] p-4">
          <MapContainer center={position} zoom={12} className="w-full h-full">
            <MapFlyTo position={position} />
            <MapClickHandler setPosition={setPosition} fetchParcelDetails={fetchParcelDetails} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>
                <div>
                  <strong>Latitude:</strong> {position[0]} <br />
                  <strong>Longitude:</strong> {position[1]} <br />
                  {parcelData ? (
                    <ParcelDetails data={parcelData} /> // Pass fetched parcel details to ParcelDetails
                  ) : (
                    'Fetching parcel data...'
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4 justify-center p-4 flex-col sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by address or coordinates"
          className="border p-2 w-full sm:w-2/3 mb-2 sm:mb-0"
        />
        <button
          onClick={searchAddress}
          className="bg-blue-500 text-white px-4 py-2 w-full sm:w-1/3"
        >
          Search
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2025 Regrid Parcel Search. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MapComponentNoSSR;
