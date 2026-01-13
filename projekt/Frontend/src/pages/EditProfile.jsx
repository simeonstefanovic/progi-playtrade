import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, ArrowLeft, MapPin, X, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function EditProfile() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bio: '',
    email: localStorage.getItem("yourEmail"),
    interests: [],
    imageUrl: ''  // Will hold the object URL
  });

  const [newInterest, setNewInterest] = useState('');
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("yourEmail");
    fetch("/api/getProfileData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then((r) => r.json())
      .then((data) => {
        setFormData(data);
      })
      .catch((err) => {
        setError("Failed to load profile data");
        console.error(err);
      });
  }, []);

  // 2. Logic for adding/removing interests
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
    fetch("/api/updateProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }

        navigate("/profile");
      });
  };

  // Add this useEffect to fetch and set the profile picture
  useEffect(() => {
    const email = localStorage.getItem("yourEmail");
    fetch("/api/getProfilePictureBlob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then((r) => {
        if (r.ok) {
          return r.blob();  // Get the response as a Blob
        } else {
          throw new Error("No image found");
        }
      })
      .then((blob) => {
        const imgUrl = URL.createObjectURL(blob);  // Create object URL from blob
        setFormData(prev => ({ ...prev, imageUrl: imgUrl }));
      })
      .catch((err) => {
        console.error(err);
        // Fallback to placeholder if no image or error
        setFormData(prev => ({ ...prev, imageUrl: 'https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter' }));
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Back to Profile Link */}
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
            Postavke Profila
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center pb-6 border-b border-gray-100">
            <div className="relative">
              <img 
                src={formData.imageUrl}  // Use the fetched imageUrl
                alt="Preview" 
                className="h-24 w-24 rounded-full border-4 border-brand-100 shadow-lg"
              />
              <Link 
                to="/edit-photo" 
                className="absolute bottom-0 right-0 bg-accent-600 p-2 rounded-full text-white hover:bg-accent-700 shadow-md transition transform hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-2 text-sm text-brand-600">Kliknite na ikonu za promjenu slike</p>
          </div>

          {/* Name & Location */}
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

          {/* Bio */}
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

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dodaj interes..."
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

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-accent-600 text-white py-4 rounded-xl font-black text-xl hover:bg-accent-700 transition shadow-lg flex items-center justify-center"
          >
            <Save className="mr-2 w-6 h-6" />
            Spremi promjene
          </button>
        </form>
      </div>
    </div>
  );
}