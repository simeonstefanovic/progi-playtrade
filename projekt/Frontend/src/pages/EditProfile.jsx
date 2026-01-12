import React, { useState } from 'react';
import { User, Mail, Camera, Save, ArrowLeft, MapPin, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  
  // 1. Setup state with interests array
  const [formData, setFormData] = useState({
    name: 'Mate Mišo',
    location: 'Zagreb, Hrvatska',
    bio: 'Obožavatelj strateških igara. Tražim igre s puno drvenih komponenti!',
    email: 'mate.miso@fer.hr',
    interests: ['Strategy', 'Worker Placement', 'Area Control']
  });

  const [newInterest, setNewInterest] = useState('');

  // 2. Logic to add/remove interests
  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interestToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving data:", formData);
    alert('Promjene su uspješno spremljene!');
    navigate('/profile');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center text-brand-700 hover:text-accent-600 mb-6 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Povratak na profil
      </button>

      <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-brand-900 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <User className="mr-3 w-6 h-6 text-accent-400" />
            Uredi Profil
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center pb-6 border-b border-gray-100">
            <div className="relative">
              <img 
                src="https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter" 
                alt="Preview" 
                className="h-24 w-24 rounded-full border-4 border-brand-100 shadow-lg"
              />
              <button type="button" className="absolute bottom-0 right-0 bg-accent-600 p-2 rounded-full text-white hover:bg-accent-700 shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Name & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Ime i prezime</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-2">Lokacija</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-600 outline-none transition"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-2">O meni</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-600 outline-none"
            />
          </div>

          {/* INTERESTS SECTION */}
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-brand-700 mb-3">Moji Interesi</label>
            
            {/* Display existing tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map((interest) => (
                <span 
                  key={interest} 
                  className="inline-flex items-center px-3 py-1 bg-brand-100 text-brand-900 text-sm font-medium rounded-full border border-brand-200"
                >
                  {interest}
                  <button 
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-brand-400 hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input to add new tags */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dodaj interes (npr. Deck Building)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-600 outline-none"
              />
              <button 
                type="button"
                onClick={handleAddInterest}
                className="bg-brand-200 text-brand-900 px-4 py-2 rounded-lg font-bold hover:bg-brand-300 transition flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Dodaj
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-600 text-white py-3 rounded-lg font-bold hover:bg-accent-700 transition shadow-lg flex items-center justify-center text-lg"
          >
            <Save className="mr-2 w-5 h-5" />
            Spremi promjene
          </button>
        </form>
      </div>
    </div>
  );
}