import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Save, FileUp, ArrowLeft } from 'lucide-react';

export default function AddGamePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    naziv: '',
    zanr: '',
    izdavac: '',
    godina_izdanja: '',
    ocjena_ocuvanosti: '',
    procjena_tezine: '',
    broj_igraca: '',
    vrijeme_igranja: '',
    dodatan_opis: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      'game-name': 'naziv',
      'game-genre': 'zanr',
      'game-publisher': 'izdavac',
      'game-year': 'godina_izdanja',
      'game-condition': 'ocjena_ocuvanosti',
      'game-difficulty': 'procjena_tezine',
      'game-players': 'broj_igraca',
      'game-playtime': 'vrijeme_igranja',
      'game-description': 'dodatan_opis'
    };
    const key = fieldMap[id] || id;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = localStorage.getItem('email');
    if (!email) {
      setError('Morate biti prijavljeni za dodavanje igre.');
      setLoading(false);
      return;
    }

    if (!formData.naziv || !formData.zanr || !formData.izdavac || 
        !formData.godina_izdanja || !formData.ocjena_ocuvanosti || 
        !formData.broj_igraca || !formData.vrijeme_igranja) {
      setError('Molimo ispunite sva obavezna polja.');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('naziv', formData.naziv);
      submitData.append('zanr', formData.zanr);
      submitData.append('izdavac', formData.izdavac);
      submitData.append('godina_izdanja', formData.godina_izdanja);
      submitData.append('ocjena_ocuvanosti', formData.ocjena_ocuvanosti);
      submitData.append('procjena_tezine', formData.procjena_tezine || 'Srednje');
      submitData.append('broj_igraca', formData.broj_igraca);
      submitData.append('vrijeme_igranja', formData.vrijeme_igranja);
      submitData.append('dodatan_opis', formData.dodatan_opis);
      submitData.append('email', email);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await fetch('/api/games', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/profile');
      } else {
        setError(data.error || 'Došlo je do greške pri dodavanju igre.');
      }
    } catch (err) {
      console.error('Error adding game:', err);
      setError('Došlo je do greške pri dodavanju igre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          to="/profile"
          className="flex items-center text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Natrag na profil 
        </Link>
        <h1 className="mt-4 text-4xl font-extrabold text-brand-900">
          Objavi novu igru 
        </h1>
        <p className="mt-2 text-lg text-brand-700">
          Ispunite informacije o igri koju nudite za zamjenu.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-8">
        <div className="border-b border-gray-200 pb-8">
          <h2 className="text-xl font-semibold text-brand-900">
            Osnovne informacije
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="game-name"
                className="block text-sm font-medium text-brand-700"
              >
                Naziv *
              </label>
              <input
                type="text"
                id="game-name"
                value={formData.naziv}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Cluedo"
                required
              />
            </div>
            <div>
              <label
                htmlFor="game-genre"
                className="block text-sm font-medium text-brand-700"
              >
                Žanr *
              </label>
              <input
                type="text"
                id="game-genre"
                value={formData.zanr}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. strateška igra, igra s kartama"
                required
              />
            </div>
            <div>
              <label
                htmlFor="game-publisher"
                className="block text-sm font-medium text-brand-700"
              >
                Izdavač *
              </label>
              <input
                type="text"
                id="game-publisher"
                value={formData.izdavac}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Hasbro, Stonemaier Games"
                required
              />
            </div>
            <div>
              <label
                htmlFor="game-year"
                className="block text-sm font-medium text-brand-700"
              >
                Godina izdanja *
              </label>
              <input
                type="number"
                id="game-year"
                value={formData.godina_izdanja}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. 1993"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-8">
          <h2 className="text-xl font-semibold text-brand-900">
            Detalji o igri
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="game-condition"
                className="block text-sm font-medium text-brand-700"
              >
                Ocjena očuvanosti (1-5) *
              </label>
              <select
                id="game-condition"
                value={formData.ocjena_ocuvanosti}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Odaberite...</option>
                <option value="5">5 (Kao novo)</option>
                <option value="4">4 (Odlično)</option>
                <option value="3">3 (Dobro)</option>
                <option value="2">2 (Korišteno)</option>
                <option value="1">1 (Oštećeno)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="game-difficulty"
                className="block text-sm font-medium text-brand-700"
              >
                Procjena težine
              </label>
              <select
                id="game-difficulty"
                value={formData.procjena_tezine}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Odaberite...</option>
                <option value="Lagano">Lagano</option>
                <option value="Srednje">Srednje</option>
                <option value="Teško">Teško</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="game-players"
                className="block text-sm font-medium text-brand-700"
              >
                Broj igrača *
              </label>
              <input
                type="text"
                id="game-players"
                value={formData.broj_igraca}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. 2-4"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="game-playtime"
              className="block text-sm font-medium text-brand-700"
            >
              Vrijeme igranja *
            </label>
            <input
              type="text"
              id="game-playtime"
              value={formData.vrijeme_igranja}
              onChange={handleInputChange}
              className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Npr. 60-90 min"
              required
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-900">
            Fotografija i opis
          </h2>
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-700">
              Fotografija igre
            </label>
            <div className="mt-2 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-cover rounded-md" />
                ) : (
                  <FileUp className="mx-auto h-12 w-12 text-brand-700" />
                )}
                <div className="flex text-sm text-brand-700">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>{imagePreview ? 'Promijeni sliku' : 'Učitaj sliku'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  {!imagePreview && <p className="pl-1">ili povuci i ispusti</p>}
                </div>
                <p className="text-xs text-brand-700">
                  PNG, JPG, GIF do 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="game-description"
              className="block text-sm font-medium text-brand-700"
            >
              Dodatan opis
            </label>
            <div className="mt-1">
              <textarea
                id="game-description"
                rows={4}
                value={formData.dodatan_opis}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Svi dijelovi na broju, kutija malo oštećena..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-3" />
            {loading ? 'Spremanje...' : 'Objavi oglas'}
          </button>
        </div>
      </form>
    </div>
  );
}