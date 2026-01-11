
import React from 'react';
import { Zap, Users, Clock, Award, ShieldCheck } from 'lucide-react';

export default function GameCard({ game }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <div className="relative">
        <img
          className="w-full h-56 object-cover"
          src={game.image}
          alt={game.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://placehold.co/400x300/cccccc/ffffff?text=Game';
          }}
        />
        <div className="absolute top-4 right-4 bg-green-500 text-white py-1 px-3 rounded-full text-sm font-semibold flex items-center">
          <ShieldCheck className="w-4 h-4 mr-1" />
          Očuvanost: {game.condition}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-brand-900 mb-3 truncate">
          {game.title}
        </h3>
        <div className="space-y-3 text-brand-700">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-3 text-brand-700" />
            <span>
              <span className="font-semibold">Broj igrača:</span> {game.players}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-3 text-brand-700" />
            <span>
              <span className="font-semibold">Vrijeme igranja:</span>{' '}
              {game.playtime}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full bg-accent-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-accent-700 transition-colors duration-200">
            Ponudi zamjenu 
          </button>
        </div>
      </div>
    </div>
  );
}