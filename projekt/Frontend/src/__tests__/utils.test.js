describe('LocalStorage Email Key', () => {
  let store = {};
  
  beforeEach(() => {
    store = {};
    
    Storage.prototype.getItem = jest.fn((key) => store[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => { store[key] = value; });
    Storage.prototype.removeItem = jest.fn((key) => { delete store[key]; });
    Storage.prototype.clear = jest.fn(() => { store = {}; });
  });

  test('email should be stored under "email" key', () => {
    const testEmail = 'test@example.com';
    localStorage.setItem('email', testEmail);
    
    expect(localStorage.getItem('email')).toBe(testEmail);
  });

  test('fallback to yourEmail key for backwards compatibility', () => {
    const testEmail = 'old@example.com';
    store['yourEmail'] = testEmail;
    
    const email = localStorage.getItem('email') || localStorage.getItem('yourEmail');
    
    expect(email).toBe(testEmail);
  });

  test('email key takes precedence over yourEmail', () => {
    const newEmail = 'new@example.com';
    const oldEmail = 'old@example.com';
    
    store['email'] = newEmail;
    store['yourEmail'] = oldEmail;
    
    const email = localStorage.getItem('email') || localStorage.getItem('yourEmail');
    
    expect(email).toBe(newEmail);
  });
});

describe('Form Validation Helpers', () => {
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('validates correct email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  test('rejects invalid email format', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Game Data Transformations', () => {
  const transformGameData = (game) => ({
    id: game.id,
    title: game.naziv || game.title,
    condition: game.ocjena_ocuvanosti ? `${game.ocjena_ocuvanosti}/5` : game.condition,
    players: game.broj_igraca || game.players,
    playtime: game.vrijeme_igranja || game.playtime,
    image: game.fotografija || game.hasImage 
      ? `/api/games/${game.id}/image`
      : `https://placehold.co/400x300/3498db/ffffff?text=${encodeURIComponent(game.naziv || game.title)}`,
    ownerEmail: game.ownerEmail || game.vlasnik_email
  });

  test('transforms backend game data to frontend format', () => {
    const backendGame = {
      id: 1,
      naziv: 'Catan',
      ocjena_ocuvanosti: 4,
      broj_igraca: '3-4',
      vrijeme_igranja: '60-90 min',
      hasImage: true,
      ownerEmail: 'owner@test.com'
    };

    const result = transformGameData(backendGame);

    expect(result.title).toBe('Catan');
    expect(result.condition).toBe('4/5');
    expect(result.players).toBe('3-4');
    expect(result.image).toBe('/api/games/1/image');
  });

  test('uses placeholder for games without images', () => {
    const gameWithoutImage = {
      id: 2,
      naziv: 'Test Game',
      ocjena_ocuvanosti: 3,
      broj_igraca: '2-4',
      vrijeme_igranja: '30 min',
      hasImage: false
    };

    const result = transformGameData(gameWithoutImage);

    expect(result.image).toContain('placehold.co');
    expect(result.image).toContain('Test%20Game');
  });
});

describe('Trade Status Helpers', () => {
  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Na čekanju',
      'accepted': 'Prihvaćeno',
      'rejected': 'Odbijeno',
      'completed': 'Završeno',
      'counter': 'Protupunuda'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'yellow',
      'accepted': 'green',
      'rejected': 'red',
      'completed': 'blue',
      'counter': 'orange'
    };
    return colors[status] || 'gray';
  };

  test('returns correct Croatian labels for trade statuses', () => {
    expect(getStatusLabel('pending')).toBe('Na čekanju');
    expect(getStatusLabel('accepted')).toBe('Prihvaćeno');
    expect(getStatusLabel('rejected')).toBe('Odbijeno');
    expect(getStatusLabel('completed')).toBe('Završeno');
  });

  test('returns original status for unknown values', () => {
    expect(getStatusLabel('unknown')).toBe('unknown');
  });

  test('returns correct colors for statuses', () => {
    expect(getStatusColor('pending')).toBe('yellow');
    expect(getStatusColor('accepted')).toBe('green');
    expect(getStatusColor('rejected')).toBe('red');
  });
});

describe('Wishlist Filtering', () => {
  const filterGamesForWishlist = (allGames, wishlistIds, myGameIds, currentUserEmail) => {
    return allGames.filter(game => 
      !wishlistIds.includes(game.id) && 
      !myGameIds.includes(game.id) && 
      game.ownerEmail !== currentUserEmail
    );
  };

  test('filters out games already in wishlist', () => {
    const allGames = [
      { id: 1, title: 'Game 1', ownerEmail: 'other@test.com' },
      { id: 2, title: 'Game 2', ownerEmail: 'other@test.com' },
      { id: 3, title: 'Game 3', ownerEmail: 'other@test.com' }
    ];
    const wishlistIds = [2];
    const myGameIds = [];
    const currentUserEmail = 'user@test.com';

    const result = filterGamesForWishlist(allGames, wishlistIds, myGameIds, currentUserEmail);

    expect(result).toHaveLength(2);
    expect(result.find(g => g.id === 2)).toBeUndefined();
  });

  test('filters out user own games', () => {
    const allGames = [
      { id: 1, title: 'Game 1', ownerEmail: 'user@test.com' },
      { id: 2, title: 'Game 2', ownerEmail: 'other@test.com' }
    ];
    const wishlistIds = [];
    const myGameIds = [1];
    const currentUserEmail = 'user@test.com';

    const result = filterGamesForWishlist(allGames, wishlistIds, myGameIds, currentUserEmail);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('filters out games by owner email', () => {
    const allGames = [
      { id: 1, title: 'Game 1', ownerEmail: 'user@test.com' },
      { id: 2, title: 'Game 2', ownerEmail: 'other@test.com' }
    ];
    const wishlistIds = [];
    const myGameIds = [];
    const currentUserEmail = 'user@test.com';

    const result = filterGamesForWishlist(allGames, wishlistIds, myGameIds, currentUserEmail);

    expect(result).toHaveLength(1);
    expect(result[0].ownerEmail).not.toBe(currentUserEmail);
  });
});
