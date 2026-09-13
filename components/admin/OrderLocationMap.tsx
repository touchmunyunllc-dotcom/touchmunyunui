import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

// Default Leaflet marker assets break under Next/webpack bundling
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface OrderLocationMapProps {
  shipping?: MapPoint | null;
  checkout?: MapPoint | null;
  className?: string;
}

export default function OrderLocationMap({ shipping, checkout, className }: OrderLocationMapProps) {
  const points = useMemo(() => {
    const list: MapPoint[] = [];
    if (shipping) list.push(shipping);
    if (checkout) list.push(checkout);
    return list;
  }, [shipping, checkout]);

  const center = useMemo(() => {
    if (points.length === 0) return { lat: 30.9843, lng: -90.4834 };
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return { lat, lng };
  }, [points]);

  const zoom = points.length > 1 ? 4 : 12;

  const line = useMemo(() => {
    if (shipping && checkout) {
      return [
        [shipping.lat, shipping.lng] as [number, number],
        [checkout.lat, checkout.lng] as [number, number],
      ];
    }
    return null;
  }, [shipping, checkout]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'h-64 w-full rounded-xl overflow-hidden border border-foreground/15 z-0'}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line && (
          <Polyline positions={line} pathOptions={{ color: '#c9a227', weight: 2, dashArray: '6 6' }} />
        )}
        {shipping && (
          <Marker position={[shipping.lat, shipping.lng]} icon={defaultIcon}>
            <Popup>{shipping.label}</Popup>
          </Marker>
        )}
        {checkout && (
          <Marker position={[checkout.lat, checkout.lng]} icon={defaultIcon}>
            <Popup>{checkout.label}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
