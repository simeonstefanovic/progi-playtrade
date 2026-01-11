import React, { useState } from 'react';
import GameCard from '../components/gamecard.jsx';

import { Search, SlidersHorizontal, Filter } from 'lucide-react';

const dummyGames = [
  {
    id: 1,
    title: 'Catan',
    condition: '4/5',
    players: '3-4',
    difficulty: 'Srednje',
    playtime: '60-90 min',
    image: 'https://placehold.co/400x300/3498db/ffffff?text=Catan',
  },
  {
    id: 2,
    title: 'Gloomhaven',
    condition: '5/5',
    players: '1-4',
    difficulty: 'Teško',
    playtime: '90-120 min',
    image: 'https://placehold.co/400x300/e74c3c/ffffff?text=Gloomhaven',
  },
  {
    id: 3,
    title: 'Wingspan',
    condition: '5/5',
    players: '1-5',
    difficulty: 'Lagano',
    playtime: '40-70 min',
    image: 'https://placehold.co/400x300/2ecc71/ffffff?text=Wingspan',
  },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [minPlayers, setMinPlayers] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [filteredGames, setFilteredGames] = useState(dummyGames);

  const parsePlayers = (playersStr) => {
    if (!playersStr) return { min: 0, max: Infinity };
    const plusMatch = playersStr.match(/^(\d+)\+$/);
    if (plusMatch) return { min: Number(plusMatch[1]), max: Infinity };
    const rangeMatch = playersStr.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
    const num = Number(playersStr);
    if (!Number.isNaN(num)) return { min: num, max: num };
    return { min: 0, max: Infinity };
  };

  const applyFilters = () => {
    const q = query.trim().toLowerCase();
    const min = Number(minPlayers) || 0;
    const max = Number(maxPlayers) || Infinity;

    const result = dummyGames.filter((g) => {
      // title search
      if (q && !g.title.toLowerCase().includes(q)) return false;

      // difficulty (if game has it)
      if (difficulty && g.difficulty && g.difficulty !== difficulty) return false;

      // players overlap
      const p = parsePlayers(g.players);
      if (p.max < min) return false;
      if (p.min > max) return false;

      return true;
    });

    setFilteredGames(result);
  };

  // Re-apply filters whenever any filter input changes
  React.useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, difficulty, minPlayers, maxPlayers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-brand-900 sm:text-5xl">
          Dobrodošli u Play Trade
        </h1>
        <p className="mt-4 text-xl text-accent-600">
          Platforma za razmjenu društvenih igara. Zamijenite vaše stare igre za nove!!!
        </p>
        
      </div>
      <div className="bg-brand-100 p-6 rounded-xl shadow-2xl mb-8 sticky top-[80px] z-40">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Npr. Catan, Monopol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-900">
              <Search />
            </div>
          </div>

          {/* Filters */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-48">
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-brand-200 text-brand-700 border border-brand-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-700">
                <option value="">Sve težine</option>
                <option value="Lagano">Lagano</option>
                <option value="Srednje">Srednje</option>
                <option value="Teško">Teško</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none">
                <Filter />
              </div>
            </div>
              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <label className="text-sm text-brand-700 mb-1">Min igrača</label>
                  <input type="number" min={1} value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} className="w-24 pl-3 pr-3 py-2 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-brand-700 mb-1">Max igrača</label>
                  <input type="number" min={1} value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="w-24 pl-3 pr-3 py-2 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700" />
                </div>
              </div>
            <button onClick={applyFilters} className="w-full sm:w-auto bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Traži
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}