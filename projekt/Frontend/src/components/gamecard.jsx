
import React, { useState, useEffect } from 'react';
import { Users, Clock, ShieldCheck, User, Zap, Star, X, Check } from 'lucide-react';

export default function GameCard({ game, showTradeButton = true }) {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [userGames, setUserGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const currentUserEmail = localStorage.getItem('email') || localStorage.getItem('yourEmail');
  const isOwner = game.ownerEmail === currentUserEmail;

  const fetchUserGames = async () => {
    if (!currentUserEmail) return;
    try {
      const res = await fetch(`/api/myGames?email=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      setUserGames(data.map(g => ({
        id: g.id,
        title: g.title,
        image: g.hasImage 
          ? `/api/games/${g.id}/image` 
          : 'https://placehold.co/100x75/3498db/ffffff?text=' + encodeURIComponent(g.title)
      })));
    } catch (err) {
      console.error('Error fetching user games:', err);
    }
  };

  const handleOpenTradeModal = () => {
    if (!currentUserEmail) {
      alert('Morate biti prijavljeni za ponudu zamjene.');
      return;
    }
    fetchUserGames();
    setShowTradeModal(true);
    setSelectedGames([]);
    setMessage('');
  };

  const toggleGameSelection = (gameId) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSubmitTrade = async () => {
    if (selectedGames.length === 0) {
      setMessage('Morate odabrati barem jednu igru za ponudu.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUserEmail,
          trazenaIgraId: game.id,
          ponudjeneIgreIds: selectedGames
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Ponuda uspješno poslana!');
        setTimeout(() => setShowTradeModal(false), 1500);
      } else {
        setMessage(data.error || 'Greška pri slanju ponude.');
      }
    } catch (err) {
      setMessage('Greška pri slanju ponude.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl ${isOwner ? 'ring-4 ring-accent-500' : ''}`}>
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
          {isOwner && (
            <div className="absolute bottom-4 left-4 bg-accent-600 text-white py-1 px-3 rounded-full text-sm font-semibold flex items-center shadow-lg">
              <Star className="w-4 h-4 mr-1" />
              Moja igra
            </div>
          )}
          {game.difficulty && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white py-1 px-3 rounded-full text-sm font-semibold flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              {game.difficulty}
            </div>
          )}
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
            {game.ownerName && (
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-brand-700" />
                <span>
                  <span className="font-semibold">Vlasnik:</span> {game.ownerName}
                </span>
              </div>
            )}
          </div>
          {showTradeButton && !isOwner && (
            <div className="mt-6">
              <button 
                onClick={handleOpenTradeModal}
                className="w-full bg-accent-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-accent-700 transition-colors duration-200"
              >
                Ponudi zamjenu 
              </button>
            </div>
          )}
          {isOwner && (
            <div className="mt-6">
              <div className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-semibold text-lg text-center">
                Vaša igra
              </div>
            </div>
          )}
        </div>
      </div>

      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-900">Ponudi zamjenu</h2>
              <button onClick={() => setShowTradeModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-brand-700 mb-2">Tražite igru:</p>
                <div className="flex items-center bg-brand-100 p-3 rounded-lg">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="w-16 h-12 object-cover rounded mr-4"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x75/cccccc/ffffff?text=Game'; }}
                  />
                  <span className="font-semibold text-brand-900">{game.title}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-brand-700 mb-2">Odaberite igre koje nudite:</p>
                {userGames.length === 0 ? (
                  <p className="text-gray-500 italic">Nemate igara za ponudu. Dodajte igre u svoj profil.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {userGames.map(ug => (
                      <div 
                        key={ug.id}
                        onClick={() => toggleGameSelection(ug.id)}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                          selectedGames.includes(ug.id) 
                            ? 'border-accent-600 bg-accent-50' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img 
                          src={ug.image} 
                          alt={ug.title}
                          className="w-full h-20 object-cover rounded mb-2"
                          onError={(e) => { e.target.src = 'https://placehold.co/100x75/cccccc/ffffff?text=Game'; }}
                        />
                        <p className="text-sm font-medium text-brand-900 truncate">{ug.title}</p>
                        {selectedGames.includes(ug.id) && (
                          <div className="flex justify-center mt-1">
                            <Check className="w-5 h-5 text-accent-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {message && (
                <div className={`p-3 rounded-lg mb-4 ${message.includes('uspješno') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button 
                onClick={() => setShowTradeModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Odustani
              </button>
              <button 
                onClick={handleSubmitTrade}
                disabled={loading || selectedGames.length === 0}
                className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Šaljem...' : 'Pošalji ponudu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}