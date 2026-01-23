import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Upload, Trash2, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function EditMap() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ lat: 45.815, lng: 15.9819 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      setLoading(false);
      return;
    }
    fetch('/api/getLocationBlob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('No location found');
        const blob = await res.blob();
        return blob.text();
      })
      .then(text => {
        try {
          const loc = JSON.parse(text);
          if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
            setPosition(loc);
          }
        } catch (e) {
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return (
      <Marker position={position}>
        <Popup>
          Nova lokacija<br />
          Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
        </Popup>
      </Marker>
    );
  }


  const handleSaveLocation = () => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      alert("Nedostaje email korisnika!");
      return;
    }
    const blob = new Blob([JSON.stringify(position)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('locationBlob', blob, 'location.json');
    formData.append('email', userEmail);

    fetch('/api/setLocationBlob', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        alert("Lokacija je spremljena!");
        navigate('/edit-profile');
      })
      .catch(err => {
        alert("Greška pri spremanju lokacije!");
        console.error(err);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-gray-500">Učitavanje lokacije...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/edit-profile')}
        className="flex items-center text-brand-700 hover:text-accent-600 mb-6 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Povratak na uređivanje
      </button>

      <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-brand-900 mb-2">Promijeni lokaciju</h1>

        <div className="w-full h-96 my-8 rounded-lg overflow-hidden">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </div>

        <button 
          onClick={handleSaveLocation}
          className="w-full mt-12 bg-accent-600 text-white py-4 rounded-xl font-black text-xl hover:bg-accent-700 shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02]"
        >
          <Check className="w-6 h-6 mr-2" />
          Potvrdi novu lokaciju
        </button>
      </div>
    </div>
  );
}