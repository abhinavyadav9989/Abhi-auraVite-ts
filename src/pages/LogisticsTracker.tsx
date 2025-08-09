import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { LogisticsOrder, Transaction } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, MapPin, Phone, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/ios-filled/50/000000/truck.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Work around occasional TS prop mismatches with react-leaflet + TS 5.9 by casting components locally
const RLMapContainer = MapContainer as unknown as React.FC<any>;
const RLTileLayer = TileLayer as unknown as React.FC<any>;
const RLMarker = Marker as unknown as React.FC<any>;
const RLPolyline = Polyline as unknown as React.FC<any>;

// Mock start/end points
const PUNE_COORDS: LatLngTuple = [18.5204, 73.8567];
const MUMBAI_COORDS: LatLngTuple = [19.076, 72.8777];

export default function LogisticsTracker() {
  const location = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple>(PUNE_COORDS);
  const [path, setPath] = useState<LatLngTuple[]>([PUNE_COORDS]);
  const [eta, setEta] = useState('4 hours');
  const simulationInterval = useRef<number | null>(null);

  const orderId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    // Mock fetching order data
    const fetchOrder = async () => {
      // const data = await LogisticsOrder.get(orderId);
      const data = {
        id: orderId,
        provider: 'Rivigo Express',
        status: 'in_transit',
        driver_name: 'Ramesh Kumar',
        driver_phone: '+91 98765 43210'
      };
      setOrder(data);
      setIsLoading(false);
      startGpsSimulation();
    };
    fetchOrder();

    return () => {
      if (simulationInterval.current !== null) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [orderId]);

  const startGpsSimulation = () => {
    simulationInterval.current = window.setInterval(() => {
      setCurrentPosition(prevPos => {
        const remainingLat = MUMBAI_COORDS[0] - prevPos[0];
        const remainingLng = MUMBAI_COORDS[1] - prevPos[1];
        
        // If close enough, stop simulation
        if (Math.abs(remainingLat) < 0.01 && Math.abs(remainingLng) < 0.01) {
          if (simulationInterval.current !== null) {
            clearInterval(simulationInterval.current);
          }
          setEta('Arrived');
          return MUMBAI_COORDS;
        }

        const newLat = prevPos[0] + remainingLat * 0.1 + (Math.random() - 0.5) * 0.01;
        const newLng = prevPos[1] + remainingLng * 0.1 + (Math.random() - 0.5) * 0.01;
        
        setPath(currentPath => [...currentPath, [newLat, newLng] as LatLngTuple]);
        
        // Recalculate ETA (simplified)
        const distance = Math.sqrt(Math.pow(MUMBAI_COORDS[0] - newLat, 2) + Math.pow(MUMBAI_COORDS[1] - newLng, 2));
        const hours = (distance / 0.5) * 4; // Mock calculation
        setEta(`${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`);
        
        return [newLat, newLng] as LatLngTuple;
      });
    }, 5000); // Update every 5 seconds
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-600" />
              <span>Live Logistics Tracking</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700">{order.status.replace('_', ' ').toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-[500px]">
              <RLMapContainer center={PUNE_COORDS} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <RLTileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RLMarker position={PUNE_COORDS}>
                  <Popup>Pickup: Pune</Popup>
                </RLMarker>
                <RLMarker position={MUMBAI_COORDS}>
                  <Popup>Destination: Mumbai</Popup>
                </RLMarker>
                <RLMarker position={currentPosition} icon={truckIcon}>
                  <Popup>Current Location</Popup>
                </RLMarker>
                <RLPolyline positions={path} pathOptions={{ color: 'blue' }} />
              </RLMapContainer>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ETA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Clock className="w-6 h-6 text-slate-500" />
                    <span>{eta}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Driver Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{order.driver_name}</p>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${order.driver_phone}`} className="hover:underline">{order.driver_phone}</a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong className="font-medium">Provider:</strong> {order.provider}</p>
                  <p><strong className="font-medium">Tracking #:</strong> {order.id}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}