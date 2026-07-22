import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { Refrigerator, Clock, MapPin, PackageSearch } from 'lucide-react';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Fridge {
  _id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  description: string;
}

export default function MapPage() {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fridgesRes, inventoryRes] = await Promise.all([
          axios.get('/api/fridges'),
          axios.get('/api/inventory?status=available')
        ]);
        setFridges(fridgesRes.data);
        
        const counts: Record<string, number> = {};
        inventoryRes.data.forEach((item: any) => {
           if (item.fridge && item.fridge._id) {
              counts[item.fridge._id] = (counts[item.fridge._id] || 0) + item.quantity;
           }
        });
        setInventoryCounts(counts);
      } catch (error) {
        console.error("Error fetching data for map", error);
      }
    };
    fetchData();
  }, []);

  const defaultCenter: [number, number] = [40.7128, -74.0060]; // NY center

  return (
    <div className="h-full min-h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fridges.map((fridge) => (
          <Marker key={fridge._id} position={[fridge.latitude, fridge.longitude]}>
            <Popup className="rounded-xl">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <Refrigerator className="w-5 h-5 text-emerald-600" />
                  {fridge.name}
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{fridge.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>24/7 Access</span>
                  </p>
                  <p className="flex items-center gap-2 text-emerald-600 font-bold">
                    <PackageSearch className="w-4 h-4 shrink-0" />
                    <span>{inventoryCounts[fridge._id] || 0} items available</span>
                  </p>
                  <p className="mt-2 text-slate-500 italic">
                    Capacity: {fridge.capacity}kg
                  </p>
                  {fridge.description && (
                    <p className="mt-2 text-xs border-t pt-2 border-slate-100">{fridge.description}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
