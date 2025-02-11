"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios, { AxiosError } from "axios";
import ParcelDetails from "./ParcelDetails";
import { useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

let L: typeof import("leaflet") | null = null;

// Custom hook to move the map
const MapFlyTo = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
};

// Click event handler
const MapClickHandler = ({
  setPosition,
  fetchParcelDetails,
}: {
  setPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
  fetchParcelDetails: (lat: number, lon: number) => Promise<void>;
}) => {
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

function MapComponent() {
  // Set initial position to a known urban area (New York City)
  const [position, setPosition] = useState<[number, number]>([
    40.7128, -74.006,
  ]);
  const [searchInput, setSearchInput] = useState("");
  const [parcelData, setParcelData] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        L = leaflet;
        if (L) {
          L.Icon.Default.prototype.options.iconUrl =
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
          L.Icon.Default.prototype.options.shadowUrl =
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";
        }
      });
    }
  }, []);

  // Search an address and move the map there
  const searchAddress = async () => {
    if (!searchInput.trim()) return;
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: { q: searchInput, format: "json" },
        }
      );

      if (data.length > 0) {
        const { lat, lon } = data[0];
        console.log(`Address found: ${lat}, ${lon}`);
        setPosition([parseFloat(lat), parseFloat(lon)]);
        await fetchParcelDetails(parseFloat(lat), parseFloat(lon));
      } else {
        alert("Address not found!");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  // Fetch parcel details from the API
  const fetchParcelDetails = async (lat: number, lon: number) => {
    try {
      const url =`https://rigrid-backend.onrender.com/regrid/parcels?lat=${lat}&lon=${lon}`;

      console.log("Fetching:", url);
      const { data } = await axios.get(url);
      console.log("Parcel Data:", data);

      if (Array.isArray(data.parcels) && data.parcels.length > 0) {
        setParcelData(data.parcels[0]);
      } else {
        console.warn("No parcel data available.");
        setParcelData(null);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          "Error fetching parcel details:",
          error.response?.data || error.message
        );
      } else {
        console.error(
          "Error fetching parcel details:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      setParcelData(null);
    }
  };

  // Ensure smooth map loading
  useEffect(() => {
    setIsMapLoaded(false);
    const timer = setTimeout(() => setIsMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4 text-center text-xl font-semibold">
        Regrid Parcel Search
      </header>

      <div className="flex-grow flex justify-center items-center relative">
        {/* Map Display */}
        <div className="w-full h-[80vh] p-4">
          {isMapLoaded ? (
            <MapContainer
              center={position}
              zoom={15}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <MapFlyTo position={position} />
              <MapClickHandler
                setPosition={setPosition}
                fetchParcelDetails={fetchParcelDetails}
              />
              {/* High-Quality Satellite Map for Structural Clarity */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">ESRI</a> Imagery'
              />
              <Marker position={position}>
                <Popup>
                  <div>
                    <strong>Latitude:</strong> {position[0]} <br />
                    <strong>Longitude:</strong> {position[1]} <br />
                    {parcelData ? (
                      <ParcelDetails data={parcelData} />
                    ) : (
                      <p>No parcel details available.</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <span>Loading map...</span>
            </div>
          )}
        </div>
      </div>

      {/* Address Search Bar */}
      <div className="flex gap-2 mb-4 justify-center p-4 flex-col sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by address"
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
        &copy; 2025 Regrid Parcel Search
      </footer>
    </div>
  );
}

export default MapComponent;
