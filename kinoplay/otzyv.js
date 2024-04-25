(function() {
  'use strict';

  var updateplugins = false;
  var plugins = Lampa.Storage.get('plugins', '[]')

  plugins.forEach(function(plug) {
    if (plug.url.indexOf('skaztv.online') >= 0) {
      updateplugins = true;
      plug.url = (plug.url + '').replace('skaztv.online/o.js', 'lampaplugins.github.io/store/o.js');
    }
  })

  if (updateplugins)
    Lampa.Storage.set('plugins', plugins);
  $.getScript('https://lampaplugins.github.io/store/o.js');
})();