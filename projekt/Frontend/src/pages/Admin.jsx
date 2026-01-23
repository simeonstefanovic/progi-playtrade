import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Gamepad2, 
  BarChart3, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  const email = localStorage.getItem('email') || localStorage.getItem('yourEmail');

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    
    fetch('/api/checkAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.isAdmin) {
          navigate('/');
        } else {
          setIsAdmin(true);
          fetchStats();
        }
      })
      .catch(() => navigate('/'));
  }, [email, navigate]);

  const fetchStats = () => {
    fetch(`/api/admin/stats?adminEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?adminEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  };

  const fetchListings = () => {
    setLoading(true);
    fetch(`/api/admin/listings?adminEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
        setLoading(false);
      });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovog korisnika?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}?adminEmail=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: email })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isAdmin: data.isAdmin } : u
        ));
      }
    } catch (err) {
      console.error('Error toggling admin:', err);
    }
  };

  const handleDeleteListing = async (gameId) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovaj oglas?')) return;
    
    try {
      const res = await fetch(`/api/admin/listings/${gameId}?adminEmail=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== gameId));
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  const handleToggleActive = async (gameId) => {
    try {
      const res = await fetch(`/api/admin/listings/${gameId}/toggle-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: email })
      });
      const data = await res.json();
      if (res.ok) {
        setListings(prev => prev.map(l => 
          l.id === gameId ? { ...l, isActive: data.isActive } : l
        ));
      }
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? 'border-brand-700 text-brand-900 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-lg cursor-pointer'
      : 'border-transparent text-brand-700 hover:border-brand-700 hover:text-brand-900 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-lg cursor-pointer';
  };

  if (!isAdmin) {
    return <div className="text-center py-12">Provjera prava pristupa...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-brand-900 flex items-center justify-center">
          <Shield className="w-10 h-10 mr-3 text-accent-600" />
          Administracija
        </h1>
        <p className="mt-2 text-lg text-brand-700">Upravljanje korisnicima i oglasima</p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex justify-center space-x-8">
          <button onClick={() => { setActiveTab('stats'); fetchStats(); }} className={getTabClass('stats')}>
            <BarChart3 className="w-5 h-5 mr-2 inline-block" />
            Statistika
          </button>
          <button onClick={() => { setActiveTab('users'); fetchUsers(); }} className={getTabClass('users')}>
            <Users className="w-5 h-5 mr-2 inline-block" />
            Korisnici
          </button>
          <button onClick={() => { setActiveTab('listings'); fetchListings(); }} className={getTabClass('listings')}>
            <Gamepad2 className="w-5 h-5 mr-2 inline-block" />
            Oglasi
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-700" />
          <p className="mt-4 text-brand-700">Učitavanje...</p>
        </div>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Users className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                <p className="text-3xl font-bold text-brand-900">{stats.totalUsers}</p>
                <p className="text-brand-700">Korisnika</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Gamepad2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-3xl font-bold text-brand-900">{stats.totalGames}</p>
                <p className="text-brand-700">Igara</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Eye className="w-12 h-12 mx-auto text-purple-500 mb-3" />
                <p className="text-3xl font-bold text-brand-900">{stats.activeListings}</p>
                <p className="text-brand-700">Aktivnih oglasa</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <RefreshCw className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                <p className="text-3xl font-bold text-brand-900">{stats.pendingTrades}</p>
                <p className="text-brand-700">Zamjena na čekanju</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-accent-600 mb-3" />
                <p className="text-3xl font-bold text-brand-900">{stats.completedTrades}</p>
                <p className="text-brand-700">Završenih zamjena</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Korisnik</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Igara</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Akcije</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-brand-700">{user.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-brand-900">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-brand-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-brand-700">{user.gamesCount}</td>
                      <td className="px-6 py-4">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Da</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Ne</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAdmin(user.id)}
                            className={`p-2 rounded ${user.isAdmin ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            title={user.isAdmin ? 'Ukloni admin' : 'Postavi admin'}
                          >
                            {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            title="Obriši korisnika"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Igra</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Izdavač</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Vlasnik</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-700 uppercase">Akcije</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-brand-700">{listing.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-brand-900">{listing.title}</td>
                      <td className="px-6 py-4 text-sm text-brand-700">{listing.publisher}</td>
                      <td className="px-6 py-4 text-sm text-brand-700">{listing.ownerName}</td>
                      <td className="px-6 py-4">
                        {listing.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktivan</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Neaktivan</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(listing.id)}
                            className={`p-2 rounded ${listing.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            title={listing.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                          >
                            {listing.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            title="Obriši oglas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
