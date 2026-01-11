import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import {
  User,
  MapPin,
  Gamepad2,
  Heart,
  RefreshCw,
  PlusCircle, 
} from 'lucide-react';
import GameCard from '../components/gamecard.jsx';

const userProfile = {
  name: 'Mate Mišo',
  location: 'Zagreb, Hrvatska',
  bio: 'Obožavatelj strateških igara. Tražim igre s puno drvenih komponenti!',
  interests: ['Strategy', 'Worker Placement', 'Area Control'],
  imageUrl:
    'https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter',
};
const myGames = [
  {
    id: 1,
    title: 'Risk',
    condition: '3/5',
    players: '2-6',
    playtime: '90-120 min',
    image: 'https://placehold.co/400x300/3498db/ffffff?text=Risk',
  },
  {
    id: 3,
    title: 'Čovječe ne ljuti se',
    condition: '5/5',
    players: '1-4',
    playtime: '20-30 min',
    image: 'https://placehold.co/400x300/2ecc71/ffffff?text=Čovječe',
  },
];
const wishlist = [
  {
    id: 10,
    title: 'Brass: Birmingham',
    image: 'https://placehold.co/400x300/f39c12/ffffff?text=Brass',
  },
  {
    id: 11,
    title: 'Dune: Imperium',
    image: 'https://placehold.co/400x300/9b59b6/ffffff?text=Dune',
  },
];
const myTrades = [
  {
    id: 1,
    status: 'Završeno',
    date: '2025-10-28',
    offered: 'Catan',
    received: 'Risk',
  },
  {
    id: 2,
    status: 'Na čekanju',
    date: '2025-10-30',
    offered: 'Risk',
    received: 'Dune: Imperium',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('myGames');

  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? 'border-brand-700 text-brand-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
      : 'border-transparent text-brand-700 hover:border-brand-700 hover:text-brand-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden mb-12">
        <div className="p-8 md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-32 w-32 rounded-full mx-auto md:mx-0"
              src={userProfile.imageUrl}
              alt="User profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://placehold.co/128x128/cccccc/ffffff?text=Mate';
              }}
            />
          </div>
          <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-brand-900">
              {userProfile.name}
            </h1>
            <p className="mt-2 text-lg text-brand-700 flex items-center justify-center md:justify-start">
              <MapPin className="w-5 h-5 mr-2 text-brand-700" />
              {userProfile.location}
            </p>
            <p className="mt-4 text-brand-700 max-w-lg">{userProfile.bio}</p>
            <div className="mt-6">
              <button className="px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Uredi Profil
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">
            Interesi
          </h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest) => (
                <span
                key={interest}
                className="px-3 py-1 bg-brand-100 text-brand-900 text-sm font-medium rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('myGames')}
                className={getTabClass('myGames')}
              >
                <Gamepad2 className="w-5 h-5 mr-2 inline-block" />
                Moje igre 
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={getTabClass('wishlist')}
              >
                <Heart className="w-5 h-5 mr-2 inline-block" />
                Lista želja 
              </button>
              <button
                onClick={() => setActiveTab('myTrades')}
                className={getTabClass('myTrades')}
              >
                <RefreshCw className="w-5 h-5 mr-2 inline-block" />
                Moje zamjene 
              </button>
            </nav>
          </div>
        </div>
      </div>

      
      {activeTab === 'myGames' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-900">
              Igre koje nudim
            </h2>
            <Link
              to="/add-game"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Dodaj novu igru 
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {myGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-3 text-red-500" />
            Lista želja 
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {wishlist.map((game) => (
              <div
                key={game.id}
                className="bg-white shadow-xl rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <img
                  className="h-48 w-full object-cover"
                  src={game.image}
                  alt={game.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://placehold.co/400x300/cccccc/ffffff?text=Game';
                  }}
                />
                <div className="p-4">
                  <h3 className="text-md font-bold text-brand-900 truncate">
                    {game.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'myTrades' && (
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
          <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center p-6">
            <RefreshCw className="w-6 h-6 mr-3 text-brand-700" />
            Povijest zamjena 
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider"
                  >
                    Datum 
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider"
                  >
                    Moja ponuda
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider"
                  >
                    Tražena igra 
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                          trade.status === 'Završeno (Completed)'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-700">
                      {trade.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-900">
                      {trade.offered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-900">
                      {trade.received}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

