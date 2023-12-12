routes = [
  {
    path: '/',
    url: './index.php',
  },
  {
    path: '/app/:fi/:rlkey/:id',
    url: 'itms-services://?action=download-manifest&url=https://dl.dropboxusercontent.com/scl/fi/{{fi}}/manifest.plist?rlkey={{rlkey}}'
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