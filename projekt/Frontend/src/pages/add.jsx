import React from 'react';
import { Link } from 'react-router-dom';
import { Save, FileUp, ArrowLeft } from 'lucide-react';

export default function AddGamePage() {
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

      <form className="bg-white p-8 rounded-xl shadow-2xl space-y-8">
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
                Naziv 
              </label>
              <input
                type="text"
                id="game-name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Cluedo"
              />
            </div>
            <div>
              <label
                htmlFor="game-genre"
                className="block text-sm font-medium text-brand-700"
              >
                Žanr 
              </label>
              <input
                type="text"
                id="game-genre"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. strateška igra, igra s kartama"
              />
            </div>
            <div>
              <label
                htmlFor="game-publisher"
                className="block text-sm font-medium text-brand-700"
              >
                Izdavač
              </label>
              <input
                type="text"
                id="game-publisher"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Hasbro, Stonemaier Games"
              />
            </div>
            <div>
              <label
                htmlFor="game-year"
                className="block text-sm font-medium text-brand-700"
              >
                Godina izdanja
              </label>
              <input
                type="number"
                id="game-year"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. 1993"
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
                Ocjena očuvanosti (1-5)
              </label>
              <select
                id="game-condition"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option>Odaberite...</option>
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option>Odaberite...</option>
                <option>Lagano</option>
                <option>Srednje</option>
                <option>Teško</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="game-players"
                className="block text-sm font-medium text-brand-700"
              >
                Broj igrača
              </label>
              <input
                type="text"
                id="game-players"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. 2-4"
              />
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="game-playtime"
              className="block text-sm font-medium text-brand-700"
            >
              Vrijeme igranja
            </label>
            <input
              type="text"
              id="game-playtime"
              className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Npr. 60-90 min"
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
                <FileUp className="mx-auto h-12 w-12 text-brand-700" />
                <div className="flex text-sm text-brand-700">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-brand-700">
                  PNG, JPG, GIF up to 10MB
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Npr. Svi dijelovi na broju, kutija malo oštećena..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            className="w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="w-5 h-5 mr-3" />
            Objavi oglas
          </button>
        </div>
      </form>
    </div>
  );
}