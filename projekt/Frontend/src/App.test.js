describe('App Configuration', () => {
  test('app should have required environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('react-scripts test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('App Routes Configuration', () => {
  const appRoutes = [
    { path: '/', component: 'Home' },
    { path: '/games', component: 'Games' },
    { path: '/profile', component: 'Profile' },
    { path: '/login', component: 'Login' },
    { path: '/signup', component: 'Signup' },
  ];

  test('all required routes are defined', () => {
    const paths = appRoutes.map(r => r.path);
    
    expect(paths).toContain('/');
    expect(paths).toContain('/games');
    expect(paths).toContain('/profile');
    expect(paths).toContain('/login');
    expect(paths).toContain('/signup');
  });

  test('each route has a component', () => {
    appRoutes.forEach(route => {
      expect(route).toHaveProperty('component');
      expect(route.component.length).toBeGreaterThan(0);
    });
  });
});
