routes = [
  {
    path: '/',
    url: './index.php',
  },
  {
    path: '/app/:appId/',
    url: './pages/app{{appId}}'
  },
  {
    path: '/install/:appId/',
    url: 'itms-services://?action=download-manifest&url=https://install.getappbox.com/install/s/txevg83kunalclp/manifest.plist'
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