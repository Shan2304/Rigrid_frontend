import React from 'react';

// Define the ParcelData interface
interface ParcelData {
  address: string;
  owner: string;
  area: number; // Assuming area is a number, change it to string if needed
  city?: string;
  state?: string;
  zipCode?: string;
  // Add more fields if needed based on the API response
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
      {data?.city && <p><strong>City:</strong> {data?.city}</p>}
      {data?.state && <p><strong>State:</strong> {data?.state}</p>}
      {data?.zipCode && <p><strong>Zip Code:</strong> {data?.zipCode}</p>}
      {/* Add more fields as necessary */}
    </div>
  );
};

export default ParcelDetails;
