import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getProductIcon = (svgUrl) =>
  new L.Icon({
    iconUrl: svgUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'product-marker-icon',
  });

const MapView = ({ userPosition, products = [] }) => (
  <MapContainer center={userPosition ? [userPosition.lat, userPosition.lng] : [25.033964, 121.564468]} zoom={13} style={{ height: '400px', width: '100%' }}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {userPosition && (
      <Marker position={[userPosition.lat, userPosition.lng]} title="目前位置">
        <Popup>目前位置</Popup>
      </Marker>
    )}
    {products.map((p) => (
      <Marker key={p.id} position={[p.latitude, p.longitude]} title={p.name} icon={getProductIcon(p.svgUrl)}>
        <Popup>
          <div className="flex flex-col items-center">
            <img src={p.svgUrl} alt={p.name} className="w-10 h-10 mb-2" />
            <div>{p.name}</div>
            <div>價格：{p.price}</div>
            <div>距離：{p.distance} 公里</div>
          </div>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapView; 