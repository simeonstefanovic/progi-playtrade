import React, { useState, useEffect } from 'react';
import GameCard from '../components/gamecard.jsx';

import { Search, Filter } from 'lucide-react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [minPlayers, setMinPlayers] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/games').then(res => res.json()),
      fetch('/api/genres').then(res => res.json())
    ])
      .then(([gamesData, genresData]) => {
        const games = gamesData.map(game => ({
          id: game.id,
          title: game.title,
          condition: game.condition,
          players: game.players,
          difficulty: game.difficulty,
          playtime: game.playtime,
          genre: game.genre,
          genreId: game.genreId,
          image: game.hasImage 
            ? `/api/games/${game.id}/image` 
            : 'https://placehold.co/400x300/3498db/ffffff?text=' + encodeURIComponent(game.title),
          ownerName: game.ownerName,
          ownerEmail: game.ownerEmail
        }));
        setAllGames(games);
        setFilteredGames(games);
        setGenres(genresData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setLoading(false);
      });
  }, []);

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
    const cat = category.trim().toLowerCase();
    const min = Number(minPlayers) || 0;
    const max = Number(maxPlayers) || Infinity;

    const result = allGames.filter((g) => {
      if (q && !g.title.toLowerCase().includes(q)) return false;

      if (cat && g.genre && !g.genre.toLowerCase().includes(cat)) return false;

      if (difficulty && g.difficulty && g.difficulty !== difficulty) return false;

      const p = parsePlayers(g.players);
      if (p.max < min) return false;
      if (p.min > max) return false;

      return true;
    });

    setFilteredGames(result);
  };

  useEffect(() => {
    applyFilters();
  }, [query, difficulty, category, minPlayers, maxPlayers, allGames]);

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
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Pretraži igre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 h-[50px]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-900">
              <Search />
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Kategorija..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 h-[50px]"
                list="genre-suggestions"
              />
              <datalist id="genre-suggestions">
                {genres.map(g => (
                  <option key={g.id} value={g.naziv} />
                ))}
              </datalist>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none">
                <Filter />
              </div>
            </div>
            <div className="relative w-full sm:w-48">
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)} 
                className="w-full pl-4 pr-10 py-3 bg-brand-200 text-brand-700 border border-brand-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-700 h-[50px]"
              >
                <option value="">Sve težine</option>
                <option value="Lagano">Lagano</option>
                <option value="Srednje">Srednje</option>
                <option value="Teško">Teško</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none">
                <Filter />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col">
                <label className="text-sm text-brand-700 mb-1">Min igrača</label>
                <input 
                  type="number" 
                  min={1} 
                  value={minPlayers} 
                  onChange={(e) => setMinPlayers(e.target.value)} 
                  className="w-24 pl-3 pr-3 py-3 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 h-[50px]" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-brand-700 mb-1">Max igrača</label>
                <input 
                  type="number" 
                  min={1} 
                  value={maxPlayers} 
                  onChange={(e) => setMaxPlayers(e.target.value)} 
                  className="w-24 pl-3 pr-3 py-3 bg-brand-200 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 h-[50px]" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-brand-700">Učitavanje igara...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-brand-700">Nema pronađenih igara.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}