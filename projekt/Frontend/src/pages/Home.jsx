import React from 'react';
import GameCard from '../components/gamecard.jsx';

import { Search, SlidersHorizontal, Filter } from 'lucide-react';

const dummyGames = [
  {
    id: 1,
    title: 'Catan',
    condition: '4/5',
    players: '3-4',
    playtime: '60-90 min',
    image: 'https://placehold.co/400x300/3498db/ffffff?text=Catan',
  },
  {
    id: 2,
    title: 'Gloomhaven',
    condition: '5/5',
    players: '1-4',
    playtime: '90-120 min',
    image: 'https://placehold.co/400x300/e74c3c/ffffff?text=Gloomhaven',
  },
  {
    id: 3,
    title: 'Wingspan',
    condition: '5/5',
    players: '1-5',
    playtime: '40-70 min',
    image: 'https://placehold.co/400x300/2ecc71/ffffff?text=Wingspan',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Dobrodošli u Play Trade
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Platforma za razmjenu društvenih igara. Zamijenite vaše stare igre za nove!!!
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 sticky top-[80px] z-40">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Npr. Catan, Monopol..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search />
            </div>
          </div>

          {/* Filters */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48">
              <select className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Lagano</option>
                <option>Srednje</option>
                <option>Teško</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Filter />
              </div>
            </div>
            <div className="relative w-full sm:w-48">
              <select className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>1-2 igrača</option>
                <option>3-4 igrača</option>
                <option>5+ igrača</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SlidersHorizontal />
              </div>
            </div>
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Traži
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}