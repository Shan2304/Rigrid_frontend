import React from 'react';

// Define the ParcelData interface
interface ParcelData {
  address: string;
  owner: string;
  area: number; 
  city?: string;
  state?: string;
  zipCode?: number;
  far?: number;
  zoning?: string;
  zoningDescription?: string; 
  maxBuildingHeightFt?: number; 
  maxDensityDuPerAcre?: number; 
  
}

interface ParcelDetailsProps {
  data: ParcelData;
}

const ParcelDetails: React.FC<ParcelDetailsProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-bold">Parcel Details</h2>
      <p><strong>Address:</strong> {data?.address || 'N/A'}</p>
      <p><strong>Owner:</strong> {data?.owner || 'N/A'}</p>
      <p><strong>Area:</strong> {data?.area || 'N/A'} sqft</p>
      {data?.city && <p><strong>City:</strong> {data.city}</p>}
      {data?.state && <p><strong>State:</strong> {data.state}</p>}
      {data?.zipCode && <p><strong>Zip Code:</strong> {data.zipCode}</p>}
      <p><strong>FAR:</strong> {data?.far !== undefined ? data.far : 'N/A'}</p>
      {data?.zoning && <p><strong>Zoning Code:</strong> {data.zoning}</p>}
      {data?.zoningDescription && <p><strong>Zoning Description:</strong> {data.zoningDescription}</p>}
      {data?.maxBuildingHeightFt && <p><strong>Max Building Height:</strong> {data.maxBuildingHeightFt} ft</p>}
      {data?.maxDensityDuPerAcre && <p><strong>Max Density:</strong> {data.maxDensityDuPerAcre} DU/acre</p>}
      
      
    </div>
  );
};

export default ParcelDetails;
