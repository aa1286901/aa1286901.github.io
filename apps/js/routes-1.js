routes = [
    {
      path: '/',
      url: './index.php',
    },
    {
      path: '/app/',
      url: '',
    },
    {
      path: '/category/',
      url: './pages/catApps.php',
    },
    // Default route (404 page). MUST BE THE LAST
    {
      path: '(.*)',
      url: '',
    },
  ];
  
