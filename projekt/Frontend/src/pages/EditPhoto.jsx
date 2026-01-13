import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Upload, Trash2, Check } from 'lucide-react';

export default function EditPhoto() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState('https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter');
  const [selectedFile, setSelectedFile] = useState(null);  // Store the file here

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);  // Store the actual file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = () => {
    if (!selectedFile) return;
    const userEmail = localStorage.getItem("yourEmail");
    const formData = new FormData();
    formData.append('imageBlob', selectedFile);
    formData.append('email', userEmail);

    fetch('/api/setProfilePictureBlob', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        alert("Slika je spremljena!");
        navigate('/edit-profile');
      })
      .catch(err => console.error(err));
  };

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
        <h1 className="text-2xl font-bold text-brand-900 mb-2">Promijeni profilnu sliku</h1>
        <p className="text-brand-600 mb-8">Odaberite novu fotografiju koja će biti vidljiva svim korisnicima.</p>

        {/* The Preview Circle */}
        <div className="relative inline-block mb-10">
          <img 
            src={previewUrl} 
            alt="Profile Preview" 
            className="w-48 h-48 rounded-full border-8 border-brand-50 shadow-2xl object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-accent-600 p-3 rounded-full text-white border-4 border-white">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="cursor-pointer flex items-center justify-center px-6 py-3 bg-brand-900 text-white rounded-lg font-bold hover:bg-black transition">
            <Upload className="w-5 h-5 mr-2" />
            Učitaj sliku
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>

          <button 
            onClick={() => setPreviewUrl('https://placehold.co/128x128/cccccc/ffffff?text=Mate')}
            className="flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Ukloni
          </button>
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-12 bg-accent-600 text-white py-4 rounded-xl font-black text-xl hover:bg-accent-700 shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02]"
        >
          <Check className="w-6 h-6 mr-2" />
          Potvrdi novu sliku
        </button>
      </div>
    </div>
  );
}