import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom'; 
import {
  User,
  MapPin,
  Gamepad2,
  Heart,
  RefreshCw,
  PlusCircle,
  Trash2,
  Bell,
  Check,
  X,
  Search,
} from 'lucide-react';
import GameCard from '../components/gamecard.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getAddress = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    
    const city = data.address.city || data.address.town || data.address.village;
    const country = data.address.country;
    
    console.log(`Nominatim result: ${city}, ${country}`);
    return { city, country };
  } catch (error) {
    console.error("Error fetching address:", error);
  }
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('myGames');
  const [userProfile, setUserProfile] = useState({
    name: '',
    location: '',
    bio: '',
    email: localStorage.getItem("email"),
    interests: [],
    imageUrl: ''
  });
  const [myGames, setMyGames] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [myTrades, setMyTrades] = useState([]);
  const [pendingTrades, setPendingTrades] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [mapPosition, setMapPosition] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [address, setAddress] = useState({ city: '', country: '' });
  
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [allGamesForWishlist, setAllGamesForWishlist] = useState([]);
  const [wishlistSearchQuery, setWishlistSearchQuery] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');

  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterTrade, setCounterTrade] = useState(null);
  const [offererGames, setOffererGames] = useState([]);
  const [selectedCounterGames, setSelectedCounterGames] = useState([]);
  const [counterLoading, setCounterLoading] = useState(false);

  const email = localStorage.getItem("email") || localStorage.getItem("yourEmail");

  useEffect(() => {
    if (!email) {
      setGamesLoading(false);
      return;
    }
    fetch(`/api/myGames?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        const games = data.map(game => ({
          id: game.id,
          title: game.title,
          condition: game.condition,
          players: game.players,
          playtime: game.playtime,
          ownerEmail: game.ownerEmail || email,
          image: game.hasImage 
            ? `/api/games/${game.id}/image` 
            : 'https://placehold.co/400x300/3498db/ffffff?text=' + encodeURIComponent(game.title)
        }));
        setMyGames(games);
      })
      .catch(err => console.error('Error fetching games:', err))
      .finally(() => setGamesLoading(false));
  }, [email]);

  useEffect(() => {
    if (!email) {
      setWishlistLoading(false);
      return;
    }
    fetch(`/api/wishlist?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        const items = data.map(item => ({
          id: item.id,
          title: item.title,
          image: item.hasImage 
            ? `/api/games/${item.id}/image` 
            : 'https://placehold.co/400x300/f39c12/ffffff?text=' + encodeURIComponent(item.title)
        }));
        setWishlist(items);
      })
      .catch(err => console.error('Error fetching wishlist:', err))
      .finally(() => setWishlistLoading(false));
  }, [email]);

  useEffect(() => {
    if (!email) {
      setTradesLoading(false);
      return;
    }
    fetch(`/api/trades/history?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setMyTrades(data);
      })
      .catch(err => console.error('Error fetching trades:', err))
      .finally(() => setTradesLoading(false));
  }, [email]);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/trades?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        const pending = data.filter(t => t.status === 'pending' && t.isIncoming);
        setPendingTrades(pending);
        setPendingCount(pending.filter(t => !t.seen).length);
      })
      .catch(err => console.error('Error fetching pending trades:', err));
  }, [email]);

  const fetchAllGamesForWishlist = () => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        const wishlistIds = wishlist.map(w => w.id);
        const myGameIds = myGames.map(g => g.id);
        const available = data.filter(g => !wishlistIds.includes(g.id) && !myGameIds.includes(g.id) && g.ownerEmail !== email).map(g => ({
          id: g.id,
          title: g.title,
          image: g.hasImage 
            ? `/api/games/${g.id}/image` 
            : 'https://placehold.co/100x75/3498db/ffffff?text=' + encodeURIComponent(g.title)
        }));
        setAllGamesForWishlist(available);
      })
      .catch(err => console.error('Error fetching games:', err));
  };

  const handleOpenWishlistModal = () => {
    fetchAllGamesForWishlist();
    setShowWishlistModal(true);
    setWishlistSearchQuery('');
    setWishlistMessage('');
  };

  const handleAddToWishlist = async (gameId) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, gameId })
      });
      const data = await res.json();
      if (res.ok) {
        setWishlistMessage('Igra dodana na listu želja!');
        const addedGame = allGamesForWishlist.find(g => g.id === gameId);
        if (addedGame) {
          setWishlist(prev => [...prev, addedGame]);
          setAllGamesForWishlist(prev => prev.filter(g => g.id !== gameId));
        }
      } else {
        setWishlistMessage(data.error || 'Greška pri dodavanju.');
      }
    } catch (err) {
      setWishlistMessage('Greška pri dodavanju.');
    }
  };

  const handleRemoveFromWishlist = async (gameId) => {
    try {
      const res = await fetch(`/api/wishlist/${gameId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setWishlist(prev => prev.filter(g => g.id !== gameId));
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleRespondToTrade = async (tradeId, action) => {
    try {
      const res = await fetch(`/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action })
      });
      if (res.ok) {
        setPendingTrades(prev => prev.filter(t => t.id !== tradeId));
        setPendingCount(prev => Math.max(0, prev - 1));
        if (action === 'accept') {
          fetch(`/api/trades/history?email=${encodeURIComponent(email)}`)
            .then(r => r.json())
            .then(data => setMyTrades(data));
        }
      }
    } catch (err) {
      console.error('Error responding to trade:', err);
    }
  };

  const handleOpenCounterModal = async (trade) => {
    setCounterTrade(trade);
    setSelectedCounterGames([]);
    setCounterLoading(true);
    setShowCounterModal(true);
    
    try {
      const res = await fetch(`/api/trades/${trade.id}/offerer-games?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setOffererGames(data);
    } catch (err) {
      console.error('Error fetching offerer games:', err);
      setOffererGames([]);
    } finally {
      setCounterLoading(false);
    }
  };

  const toggleCounterGameSelection = (gameId) => {
    setSelectedCounterGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSubmitCounterOffer = async () => {
    if (!counterTrade || selectedCounterGames.length === 0) return;
    
    try {
      const res = await fetch(`/api/trades/${counterTrade.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          action: 'counter',
          counterGames: selectedCounterGames 
        })
      });
      
      if (res.ok) {
        setPendingTrades(prev => prev.filter(t => t.id !== counterTrade.id));
        setPendingCount(prev => Math.max(0, prev - 1));
        setShowCounterModal(false);
        setCounterTrade(null);
      }
    } catch (err) {
      console.error('Error submitting counter-offer:', err);
    }
  };

  const filteredWishlistGames = allGamesForWishlist.filter(g => 
    g.title.toLowerCase().includes(wishlistSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (mapPosition && typeof mapPosition.lat === 'number' && typeof mapPosition.lng === 'number') {
      getAddress(mapPosition.lat, mapPosition.lng).then(result => {
        if (result) setAddress(result);
      });
    }
  }, [mapPosition]);

  useEffect(() => {
      if (!email) {
        setMapLoading(false);
        return;
      }
      fetch('/api/getLocationBlob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('No location found');
          const blob = await res.blob();
          return blob.text();
        })
        .then(text => {
          try {
            const loc = JSON.parse(text);
            if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
              setMapPosition(loc);
            }
          } catch (e) {
            
          }
        })
        .catch(() => {})
        .finally(() => setMapLoading(false));
    }, [email]);
  
  useEffect(() => {
    fetch("/api/getProfileData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then((r) => r.json())
      .then((data) => {
        setUserProfile(prev => ({ ...prev, name: data.name, location: data.location, bio: data.bio, interests: data.interests }));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [email]);
  
  useEffect(() => {
    fetch("/api/getProfilePictureBlob", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ email })
    })
      .then((r) => {
        if (r.ok) {
          return r.blob();
        } else {
          throw new Error("No image found");
        }
      })
      .then((blob) => {
        const imgUrl = URL.createObjectURL(blob);
        setUserProfile(prev => ({ ...prev, imageUrl: imgUrl }));
      })
      .catch((err) => {
        console.error(err);
        setUserProfile(prev => ({ ...prev, imageUrl: 'https://placehold.co/128x128/60a5fa/ffffff?text=User&font=inter' }));
      });
  }, [email]);
  

  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? 'border-brand-700 text-brand-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg'
      : 'border-transparent text-brand-700 hover:border-brand-700 hover:text-brand-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden mb-12 border border-gray-100">
        <div className="p-8 md:flex items-center">
          <div className="md:flex-shrink-0">
            <img
              className="h-32 w-32 rounded-full mx-auto md:mx-0 border-4 border-brand-100 shadow-lg"
              src={userProfile.imageUrl}
              alt="User profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://placehold.co/128x128/cccccc/ffffff?text=Mate';
              }}
            />
          </div>
          <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left flex-grow">
            <h1 className="text-3xl font-extrabold text-brand-900">
              {userProfile.name}
            </h1>
            <p className="mt-2 text-lg text-brand-700 flex items-center justify-center md:justify-start">
              <MapPin className="w-5 h-5 mr-2 text-accent-600" />
              {address.city && address.country ? `${address.city}, ${address.country}` : userProfile.location}
            </p>
            <p className="mt-4 text-brand-700 max-w-lg">{userProfile.bio}</p>
            <div className="mt-6">
              <Link 
                to="/edit-profile" 
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-accent-600 hover:bg-accent-700 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Uredi Profil
              </Link>
            </div>
          </div>
          <div className="mt-6 w-64 h-40 mx-auto md:mx-0 rounded-lg overflow-hidden border border-gray-200 shadow relative z-0">
              {mapLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400">Učitavanje mape...</div>
              ) : mapPosition ? (
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} boxZoom={false} keyboard={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapPosition}>
                    <Popup>
                      Lokacija korisnika<br />
                      Lat: {mapPosition.lat.toFixed(5)}, Lng: {mapPosition.lng.toFixed(5)}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Nema spremljene lokacije</div>
              )}
            </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">
            Interesi
          </h3>
          <div className="flex flex-wrap gap-2">
            {(userProfile.interests || []).map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-brand-100 text-brand-900 text-sm font-medium rounded-full border border-brand-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div 
          onClick={() => setActiveTab('ponude')}
          className="bg-red-500 text-white p-4 rounded-xl mb-8 cursor-pointer hover:bg-red-600 transition-all shadow-lg animate-pulse"
        >
          <div className="flex items-center justify-center gap-3">
            <Bell className="w-6 h-6" />
            <span className="text-lg font-bold">
              🎯 IMATE {pendingCount} {pendingCount === 1 ? 'NOVU PONUDU' : 'NOVIH PONUDA'} ZA ZAMJENU!
            </span>
            <span className="text-sm opacity-90">Kliknite za pregled →</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('myGames')}
              className={getTabClass('myGames')}
            >
              <Gamepad2 className="w-5 h-5 mr-2 inline-block" />
              Moje igre 
            </button>
            <button
              onClick={() => setActiveTab('ponude')}
              className={`${getTabClass('ponude')} relative`}
            >
              <Bell className="w-5 h-5 mr-2 inline-block text-yellow-500" />
              Ponude
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={getTabClass('wishlist')}
            >
              <Heart className="w-5 h-5 mr-2 inline-block text-red-500" />
              Lista želja 
            </button>
            <button
              onClick={() => setActiveTab('myTrades')}
              className={getTabClass('myTrades')}
            >
              <RefreshCw className="w-5 h-5 mr-2 inline-block text-accent-600" />
              Moje zamjene 
            </button>
          </nav>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 transition"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Dodaj novu igru 
            </Link>
          </div>
          {gamesLoading ? (
            <div className="text-center py-8">
              <p className="text-brand-700">Učitavanje igara...</p>
            </div>
          ) : myGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-700">Nemate objavljenih igara. Dodajte svoju prvu igru!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {myGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-900 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-red-500" />
              Lista želja 
            </h2>
            <button
              onClick={handleOpenWishlistModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 transition"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Dodaj na listu
            </button>
          </div>
          {wishlistLoading ? (
            <div className="text-center py-8">
              <p className="text-brand-700">Učitavanje liste želja...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-700">Vaša lista želja je prazna.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {wishlist.map((game) => (
                <div
                  key={game.id}
                  className="bg-white shadow-xl rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-100 relative group"
                >
                  <button
                    onClick={() => handleRemoveFromWishlist(game.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
          )}
        </div>
      )}

      {activeTab === 'ponude' && (
        <div>
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-900 flex items-center p-6 border-b border-gray-100">
              <Bell className="w-6 h-6 mr-3 text-yellow-500" />
              Primljene ponude za zamjenu
              {pendingTrades.length > 0 && (
                <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-3 py-1">
                  {pendingTrades.length} {pendingTrades.length === 1 ? 'nova' : 'novih'}
                </span>
              )}
            </h2>
            
            {pendingTrades.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-brand-700 text-lg">Nemate aktivnih ponuda za zamjenu.</p>
                <p className="text-gray-500 mt-2">Kada drugi korisnici ponude zamjenu za vaše igre, vidjet ćete ih ovdje.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {pendingTrades.map((trade) => (
                  <div key={trade.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-brand-700" />
                          <span className="font-bold text-brand-900">{trade.ponuditelj.name}</span>
                          {!trade.seen && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">NOVO</span>
                          )}
                        </div>
                        <p className="text-brand-900 text-lg">
                          Želi vašu igru: <span className="font-bold text-accent-600">{trade.trazenaIgra.title}</span>
                        </p>
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">U zamjenu nudi:</p>
                          <div className="flex flex-wrap gap-2">
                            {trade.ponudjeneIgre.map(g => (
                              <span key={g.id} className="bg-brand-100 text-brand-900 px-3 py-1 rounded-full text-sm font-medium">
                                {g.title}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-3">{trade.date}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                        <button
                          onClick={() => handleRespondToTrade(trade.id, 'accept')}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center font-semibold shadow-md transition-all hover:scale-105"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Prihvati
                        </button>
                        <button
                          onClick={() => handleOpenCounterModal(trade)}
                          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 flex items-center justify-center font-semibold shadow-md transition-all hover:scale-105"
                        >
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Protupunuda
                        </button>
                        <button
                          onClick={() => handleRespondToTrade(trade.id, 'reject')}
                          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 flex items-center justify-center font-semibold shadow-md transition-all hover:scale-105"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Odbij
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'myTrades' && (
        <div>
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center p-6 border-b border-gray-100">
              <RefreshCw className="w-6 h-6 mr-3 text-accent-600" />
              Povijest zamjena 
            </h2>
            {tradesLoading ? (
              <div className="p-6 text-center">
                <p className="text-brand-700">Učitavanje zamjena...</p>
              </div>
            ) : myTrades.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-brand-700">Nemate završenih zamjena.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase tracking-wider">
                        Datum 
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase tracking-wider">
                        Moja ponuda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase tracking-wider">
                        Dobivena igra 
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
            )}
          </div>
        </div>
      )}

      {showWishlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-900">Dodaj na listu želja</h2>
              <button onClick={() => setShowWishlistModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Pretraži igre..."
                  value={wishlistSearchQuery}
                  onChange={(e) => setWishlistSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-100 text-brand-900 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              
              {wishlistMessage && (
                <div className={`p-3 rounded-lg mb-4 ${wishlistMessage.includes('dodana') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {wishlistMessage}
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredWishlistGames.map(game => (
                  <div 
                    key={game.id}
                    className="p-2 rounded-lg border border-gray-200 hover:border-accent-500 transition-all"
                  >
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="w-full h-20 object-cover rounded mb-2"
                      onError={(e) => { e.target.src = 'https://placehold.co/100x75/cccccc/ffffff?text=Game'; }}
                    />
                    <p className="text-sm font-medium text-brand-900 truncate mb-2">{game.title}</p>
                    <button
                      onClick={() => handleAddToWishlist(game.id)}
                      className="w-full bg-accent-600 text-white py-1 px-2 rounded text-sm hover:bg-accent-700"
                    >
                      Dodaj
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowWishlistModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {showCounterModal && counterTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-brand-900 flex items-center">
                    <RefreshCw className="w-6 h-6 mr-2 text-yellow-500" />
                    Pošalji protupunudu
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Odaberite igre od {counterTrade.ponuditelj.name} koje biste željeli
                  </p>
                </div>
                <button onClick={() => setShowCounterModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Originalna ponuda:</p>
                <p className="font-semibold text-brand-900">
                  {counterTrade.ponuditelj.name} traži vašu igru <span className="text-accent-600">{counterTrade.trazenaIgra.title}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Nudio je: {counterTrade.ponudjeneIgre.map(g => g.title).join(', ')}
                </p>
              </div>

              <h3 className="font-semibold text-brand-900 mb-3">
                Odaberite igre koje želite umjesto toga:
              </h3>
              
              {counterLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Učitavanje igara...</p>
                </div>
              ) : offererGames.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Korisnik nema drugih dostupnih igara.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {offererGames.map(game => (
                    <div 
                      key={game.id}
                      onClick={() => toggleCounterGameSelection(game.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCounterGames.includes(game.id)
                          ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-300'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <img 
                        src={game.hasImage ? `/api/games/${game.id}/image` : 'https://placehold.co/100x75/cccccc/ffffff?text=Game'}
                        alt={game.title}
                        className="w-full h-20 object-cover rounded mb-2"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x75/cccccc/ffffff?text=Game'; }}
                      />
                      <p className="text-sm font-medium text-brand-900 truncate">{game.title}</p>
                      {selectedCounterGames.includes(game.id) && (
                        <div className="mt-1 flex items-center text-yellow-600 text-xs">
                          <Check className="w-4 h-4 mr-1" />
                          Odabrano
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedCounterGames.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Vaša protupunuda:</strong> Tražite {selectedCounterGames.length} {selectedCounterGames.length === 1 ? 'igru' : 'igre'} za vašu igru "{counterTrade.trazenaIgra.title}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowCounterModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Odustani
              </button>
              <button 
                onClick={handleSubmitCounterOffer}
                disabled={selectedCounterGames.length === 0}
                className={`px-6 py-2 rounded-lg text-white font-semibold ${
                  selectedCounterGames.length > 0 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Pošalji protupunudu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}