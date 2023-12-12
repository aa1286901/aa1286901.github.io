routes = [
  {
    path: '/',
    url: './index.php',
  },
  {
    path: '/app/:appId/',
    url: 'https://app.ru{{appId}}'
  },
  {
    path: '/category/',
    url: './pages/catApps.php',
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];