(function () {
  'use strict';
  var email = '{EMAIL}';
  
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var Utils = /*#__PURE__*/function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "clear",
      value: function clear(str) {
        return str.replace(/\&quot;/g, '"').replace(/\&#039;/g, "'").replace(/\&amp;/g, "&").replace(/\&.+?;/g, '');
      }
    }, {
      key: "isHD",
      value: function isHD(name) {
        var math = name.toLowerCase().match(' .hd$| .нd$| .hd | .нd | hd$| нd&| hd | нd ');
        return math ? math[0].trim() : '';
      }
    }, {
      key: "clearHDSD",
      value: function clearHDSD(name) {
        return name.replace(/ hd$| нd$| .hd$| .нd$/gi, '').replace(/ sd$/gi, '').replace(/ hd | нd | .hd | .нd /gi, ' ').replace(/ sd /gi, ' ');
      }
    }, {
      key: "clearMenuName",
      value: function clearMenuName(name) {
        return name.replace(/^\d+\. /gi, '').replace(/^\d+ /gi, '');
      }
    }, {
      key: "clearChannelName",
      value: function clearChannelName(name) {
        return this.clearHDSD(this.clear(name));
      }
    }, {
      key: "hasArchive",
      value: function hasArchive(channel) {
        if (channel.catchup) {
          var days = parseInt(channel.catchup.days);
          if (!isNaN(days) && days > 0) return days;
        }

        return 0;
      }
    }, {
      key: "canUseDB",
      value: function canUseDB() {
        return DB.db && Lampa.Storage.get('kulikb_db', 'indexdb') == 'indexdb';
      }
    }]);

    return Utils;
  }();

  var favorites = [];
    
  var Favorites = /*#__PURE__*/function () {
    function Favorites() {
      _classCallCheck(this, Favorites);
    }

    _createClass(Favorites, null, [{
      key: "load",
      value: function load() {
        var _this = this;

        return new Promise(function (resolve, reject) {
          if (Utils.canUseDB()) {
            DB.getData('favorites').then(function (result) {
              favorites = result || [];
            })["finally"](resolve);
          } else {
            _this.nosuport();

            resolve();
          }
        });
      }
    }, {
      key: "nosuport",
      value: function nosuport() {
        favorites = Lampa.Storage.get('kulikb_favorite_channels', '[]');
      }
    }, {
      key: "list",
      value: function list() {
        return favorites;
      }
    }, {
      key: "key",
      value: function key() {
        return Lampa.Storage.get('kulikb_favotite_save', 'name');
      }
    }, {
      key: "find",
      value: function find(favorite) {
        var _this2 = this;

        return favorites.find(function (a) {
          return a[_this2.key()] == favorite[_this2.key()];
        });
      }
    }, {
      key: "remove",
      value: function remove(favorite) {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
          var find = favorites.find(function (a) {
            return a[_this3.key()] == favorite[_this3.key()];
          });

          if (find) {
            if (Utils.canUseDB()) {
              DB.deleteData('favorites', favorite[_this3.key()]).then(function () {
                Lampa.Arrays.remove(favorites, find);
                resolve();
              })["catch"](reject);
            } else {
              Lampa.Arrays.remove(favorites, find);
              Lampa.Storage.set('kulikb_favorite_channels', favorites);
              resolve();
            }
          } else reject();
        });
      }
    }, {
      key: "add",
      value: function add(favorite) {
        var _this4 = this;

        return new Promise(function (resolve, reject) {
          if (!favorites.find(function (a) {
            return a[_this4.key()] == favorite[_this4.key()];
          })) {
            Lampa.Arrays.extend(favorite, {
              view: 0,
              added: Date.now()
            });

            if (Utils.canUseDB()) {
              DB.addData('favorites', favorite[_this4.key()], favorite).then(function () {
                favorites.push(favorite);
                resolve();
              })["catch"](reject);
            } else {
              favorites.push(favorite);
              Lampa.Storage.set('kulikb_favorite_channels', favorites);
              resolve();
            }
          } else reject();
        });
      }
    }, {
      key: "update",
      value: function update(favorite) {
        var _this5 = this;

        return new Promise(function (resolve, reject) {
          if (favorites.find(function (a) {
            return a[_this5.key()] == favorite[_this5.key()];
          })) {
            Lampa.Arrays.extend(favorite, {
              view: 0,
              added: Date.now()
            });
            if (Utils.canUseDB()) DB.updateData('favorites', favorite[_this5.key()], favorite).then(resolve)["catch"](reject);else {
              Lampa.Storage.set('kulikb_favorite_channels', favorites);
              resolve();
            }
          } else reject();
        });
      }
    }, {
      key: "toggle",
      value: function toggle(favorite) {
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite);
      }
    }]);

    return Favorites;
  }();

  var DB = new Lampa.DB('db_kuliktv', ['playlist', 'params', 'epg', 'favorites', 'other'], 6);
  DB.logs = true;
  DB.openDatabase().then(Favorites.load)["catch"](Favorites.nosuport);

  function fixParams(params_data) {
    var params = params_data || {};
    Lampa.Arrays.extend(params, {
      update: 'always',
      update_time: Date.now(),
      loading: 'cub'
    });
    return params;
  }

  var Params = /*#__PURE__*/function () {
    function Params() {
      _classCallCheck(this, Params);
    }

    _createClass(Params, null, [{
      key: "get",
      value: function get(id) {
        return new Promise(function (resolve) {
          if (Utils.canUseDB()) {
            DB.getDataAnyCase('params', id).then(function (params) {
              resolve(fixParams(params));
            });
          } else {
            resolve(fixParams(Lampa.Storage.get('kulik_list_params_' + id, '{}')));
          }
        });
      }
    }, {
      key: "set",
      value: function set(id, params) {
        if (Utils.canUseDB()) {
          return DB.rewriteData('params', id, fixParams(params));
        } else {
          return new Promise(function (resolve) {
            Lampa.Storage.set('kulik_list_params_' + id, fixParams(params));
            resolve();
          });
        }
      }
    }, {
      key: "value",
      value: function value(params, name) {
        return Lampa.Lang.translate('iptv_params_' + params[name]);
      }
    }]);

    return Params;
  }();

  var Api = /*#__PURE__*/function () {
    function Api() {
      _classCallCheck(this, Api);
    }

    _createClass(Api, null, [{
      key: "get",
      value: function get(method) {
        var _this = this;
        return new Promise(function (resolve, reject) {
          _this.network.silent(_this.api_url + method, resolve, reject);
        });
      }
    }, {
      key: "m3u",
      value: function m3u(url) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var account = Lampa.Storage.get('account', '{}');
          if (!account.token) return reject();

          _this2.network.timeout(20000);

          _this2.network["native"](url, function (str) {
            var file = new File([str], "playlist.m3u", {
              type: "text/plain"
            });
            var formData = new FormData($('<form></form>')[0]);
            formData.append("file", file, "playlist.m3u");
            $.ajax({
              url: _this2.api_url + 'lampa',
              type: 'POST',
              data: formData,
              async: true,
              cache: false,
              contentType: false,
              timeout: 20000,
              enctype: 'multipart/form-data',
              processData: false,
              headers: {
                token: account.token,
                profile: account.profile.id
              },
              success: function success(j) {
                if (j.secuses) resolve(j);else reject();
              },
              error: reject
            });
          }, reject, false, {
            headers: {
              token: account.token,
              profile: account.profile.id
            },
            dataType: 'text'
          });
        });
      }
    }, {
      key: "list",
      value: function list() {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
          _this3.get('kulik_list?serv=newstyle&email=' + email).then(function (result) {
            DB.rewriteData('playlist', 'list', result);
            resolve(result);
          })["catch"](function (e) {
            DB.getData('playlist', 'list').then(function (result) {
              result ? resolve(result) : reject();
            })["catch"](reject);
          });
        });
      }
    }, {
      key: "playlist",
      value: function playlist(data) {
        var _this4 = this;

        var id = data.id;
        return new Promise(function (resolve, reject) {
          Promise.all([DB.getDataAnyCase('playlist', id), Params.get(id)]).then(function (result) {
            var playlist = result[0];
            var params = result[1];

            if (playlist && params) {
              var time = {
                'always': 0,
                'hour': 1000 * 60 * 60,
                'hour12': 1000 * 60 * 60 * 12,
                'day': 1000 * 60 * 60 * 24,
                'week': 1000 * 60 * 60 * 24 * 7,
                'none': 0
              };
              if (params.update_time + time[params.update] > Date.now() || params.update == 'none') return resolve(playlist);
            }

            var secuses = function secuses(result) {
              DB.rewriteData('playlist', id, result)["finally"](function () {
                if (params) params.update_time = Date.now();
                Params.set(id, params)["finally"](resolve.bind(resolve, result));
              });
            };

            var error = function error() {
              playlist ? resolve(playlist) : reject();
            };

            console.log('KulikTV', 'loading params', params);
            console.log('KulikTV', 'Используется API:', Api.api_url);
            

            if (params && params.loading == 'lampa') {
              _this4.m3u(data.url).then(secuses)["catch"](error);
            } else {
              _this4.get('iptvcors?kultv_get=' + id + '&email=' + email).then(secuses)["catch"](error);
            }
          })["catch"](reject);
        });
      }
    }, {
 
      key: "program",
      value: function program(data) {
        var _this5 = this;

        return new Promise(function (resolve, reject) {
          DB.getDataAnyCase('epg', data.channel_id, 60 * 24 * 3).then(function (epg) {
            if (epg) resolve(epg);else {
			  
              _this5.network.timeout(5000);

              _this5.network.silent(_this5.api_url_cub + 'program/' + data.channel_id + '/' + data.time + '?full=true', function (result) {
                DB.rewriteData('epg', data.channel_id, result.program)["finally"](resolve.bind(resolve, result.program));
															  
              }, function (a) {
								  
                if (a.status == 500) DB.rewriteData('epg', data.channel_id, [])["finally"](resolve.bind(resolve, []));else reject();
              });
        }
      });
    });
  }
}
    ]);
    return Api;
  }();

    _defineProperty(Api, "network", new Lampa.Reguest());

    _defineProperty(Api, "api_url", Lampa.Utils.protocol() + 'cdn.kulik.uz/api/');
    _defineProperty(Api, "api_url_cub", Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/iptv/');

  var PlaylistItem = /*#__PURE__*/function () {
    function PlaylistItem(playlist) {
      var _this = this;

      _classCallCheck(this, PlaylistItem);

      this.playlist = playlist;
      this.item = Lampa.Template.js('kktv2_iptv_playlist_item');
      this.footer = this.item.find('.iptv-playlist-item__footer');
      this.params = {};
      Params.get(playlist.id).then(function (params) {
        _this.params = params;

        _this.drawFooter();
      });
      var name = playlist.name || '---';
																	
      this.item.find('.iptv-playlist-item__name-text').text(name);
      this.item.find('.iptv-playlist-item__name-ico span').text(name.slice(0, 1).toUpperCase());
      this.item.on('hover:long', this.displaySettings.bind(this)).on('hover:enter', function () {
        DB.rewriteData('playlist', 'active', playlist.id)["finally"](function () {
          _this.listener.send('channels-load', playlist);
        });
      });
										  
														
								

							 
		   
		 
    }

    _createClass(PlaylistItem, [{
      key: "displaySettings",
      value: function displaySettings() {
        var _this2 = this;

        var params = {
          update: ['always', 'hour', 'hour12', 'day', 'week', 'none']
								   
        };
        Lampa.Select.show({
          title: Lampa.Lang.translate('title_settings'),
          items: [{
            title: Lampa.Lang.translate('iptv_update'),
            subtitle: Params.value(this.params, 'update'),
            name: 'update'
          }, {
														
														   
						   
			  
            title: Lampa.Lang.translate('iptv_remove_cache'),
            subtitle: Lampa.Lang.translate('iptv_remove_cache_descr')
          }],
          onSelect: function onSelect(a) {
            if (a.name) {
              var keys = params[a.name];
              var items = [];
              keys.forEach(function (k) {
                items.push({
                  title: Lampa.Lang.translate('iptv_params_' + k),
                  selected: _this2.params[a.name] == k,
                  value: k
                });
              });
              Lampa.Select.show({
                title: Lampa.Lang.translate('title_settings'),
                items: items,
                onSelect: function onSelect(b) {
                  _this2.params[a.name] = b.value;
                  Params.set(_this2.playlist.id, _this2.params).then(_this2.drawFooter.bind(_this2))["catch"](function (e) {
                    Lampa.Noty.show(e);
                  })["finally"](_this2.displaySettings.bind(_this2));
                },
                onBack: _this2.displaySettings.bind(_this2)
              });
            } else {
              DB.deleteData('playlist', _this2.playlist.id)["finally"](function () {
                Lampa.Noty.show('Кеш удален');
              });
              Lampa.Controller.toggle('content');
            }
          },
          onBack: function onBack() {
            Lampa.Controller.toggle('content');
          }
        });
      }
    }, {
      key: "drawFooter",
      value: function drawFooter() {
        var _this3 = this;

        this.footer.removeClass('hide');

        function label(where, name, value) {
          var leb_div = document.createElement('div');
          var leb_val = document.createElement('span');
          leb_div.addClass('iptv-playlist-item__label');
          if (name) leb_div.text(name + ' - ');
          leb_val.text(value);
          leb_div.append(leb_val);
          where.append(leb_div);
        }

        DB.getDataAnyCase('playlist', 'active').then(function (active) {
          var details_left = _this3.item.find('.details-left').empty();

          var details_right = _this3.item.find('.details-right').empty();

          if (active && active == _this3.playlist.id) label(details_right, '', Lampa.Lang.translate('iptv_active'));
																										  
																											
																															   
        });
      }
    }, {
      key: "render",
      value: function render() {
        return this.item;
      }
    }]);

    return PlaylistItem;
  }();

  var Playlist = /*#__PURE__*/function () {
    function Playlist(listener) {
      _classCallCheck(this, Playlist);

      this.listener = listener;
      this.html = Lampa.Template.js('kktv2_iptv_list');
      this.scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      this.html.find('.iptv-list__title').text(Lampa.Lang.translate('kulik_select_server'));
      this.html.find('.kktv2_iptv-list__items').append(this.scroll.render(true));
    }

    _createClass(Playlist, [{
      key: "list",
      value: function list(playlist) {
        var _this = this;

        this.scroll.clear();
        this.scroll.reset();
        this.html.find('.iptv-list__text').html(Lampa.Lang.translate('kulik_select_server_text'));
        playlist.list.reverse().forEach(function (data) {
          var item = new PlaylistItem(data);
          item.listener = _this.listener;
          var elem = item.render();
          elem.on('hover:focus', function () {
            _this.last = elem;

            _this.scroll.update(_this.last);
          }).on('hover:hover hover:touch', function () {
            _this.last = elem;
            Navigator.focused(elem);
          });

          _this.scroll.append(elem);
        });
        this.listener.send('display', this);
      }
    }, {
      key: "main",
      value: function main() {
        Api.list().then(this.list.bind(this))["catch"](this.empty.bind(this));
      }
    }, {
      key: "load",
      value: function load() {
        var _this2 = this;

        Promise.all([Api.list(), DB.getDataAnyCase('playlist', 'active')]).then(function (result) {
          var playlist = result[0];
          var active = result[1];

          if (playlist) {
            if (active) {
              var find = playlist.list.find(function (l) {
                return l.id == active;
              });

              if (find) {
                _this2.listener.send('channels-load', find);
              } else _this2.list(playlist);
            } else _this2.list(playlist);
          } else _this2.empty();
        })["catch"](function (e) {
          _this2.empty();
        });
      }
    }, {
      key: "empty",
      value: function empty() {
        this.scroll.clear();
        this.scroll.reset();
        this.html.find('.iptv-list__text').html(Lampa.Lang.translate('kuliktv_empty_title'));
        var empty = Lampa.Template.js('kktv2_iptv_list_empty');
        empty.find('.iptv-list-empty__text').html(Lampa.Lang.translate('kuliktv_server_empty'));
        this.scroll.append(empty);
        this.listener.send('display', this);
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _this3 = this;

        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(_this3.html);
            Lampa.Controller.collectionFocus(_this3.last, _this3.html);
          },
          left: function left() {
            Lampa.Controller.toggle('menu');
          },
          down: Navigator.move.bind(Navigator, 'down'),
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        Lampa.Controller.toggle('content');
      }
    }, {
      key: "render",
      value: function render() {
        return this.html;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.scroll.destroy();
        this.html.remove();
      }
    }]);

    return Playlist;
  }();

  var Icons = /*#__PURE__*/function () {
    function Icons(listener) {
      var _this = this;

      _classCallCheck(this, Icons);

      this.listener = listener;
      this.position = 0;
      this.scroll = new Lampa.Scroll({
        mask: !window.iptv_mobile,
        over: true,
        end_ratio: 2,
        horizontal: window.iptv_mobile
      });
      this.html = document.createElement('div');
      this.html.addClass('kktviptv-channels');
      this.scroll.append(this.html);
      if (!window.iptv_mobile) this.scroll.minus();

      this.scroll.onEnd = function () {
        _this.position++;

        _this.next();
      };

      this.listener.follow('icons-load', function (data) {
        _this.icons = data.icons;

        if (data.menu.favorites) {
          _this.icons.sort(function (a, b) {
            var ta = a.added || 0;
            var tb = b.added || 0;
            return ta < tb ? -1 : ta > tb ? 1 : 0;
          });

          _this.sort();
        }

        _this.html.empty();

        _this.scroll.reset();

        _this.position = 0;
        _this.last = false;

        _this.next();
      });
    }

    _createClass(Icons, [{
      key: "sort",
      value: function sort() {
        var sort_type = Lampa.Storage.field('iptv_favotite_sort');

        if (Lampa.Account.hasPremium() && sort_type !== 'add') {
          this.icons.sort(function (a, b) {
            if (sort_type == 'name') {
              return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            } else if (sort_type == 'view') {
              var va = a.view || 0;
              var vb = b.view || 0;
              return va < vb ? 1 : va > vb ? -1 : 0;
            }
          });
        }
      }
    }, {
      key: "active",
      value: function active(item) {
        var active = this.html.find('.active');
        if (active) active.removeClass('active');
        item.addClass('active');
      }
    }, {
      key: "next",
      value: function next() {
        var _this2 = this;

        var views = 10;
        var start = this.position * views;
        this.icons.slice(start, start + views).forEach(function (element, index) {
          delete element.target;
          var item = document.createElement('div');
          var body = document.createElement('div');
          var img = document.createElement('img');
          var chn = document.createElement('div');
          var position = start + index;
          chn.text((position + 1).pad(3));
          item.addClass('kktviptv-channel selector layer--visible layer--render');
          body.addClass('kktviptv-channel__body');
          img.addClass('kktviptv-channel__ico');
          chn.addClass('kktviptv-channel__chn');
          body.append(img);
          item.append(body);
          item.append(chn);
          item.toggleClass('favorite', Boolean(Favorites.find(element)));
          item.on('visible', function () {
            img.onerror = function () {
              var simb = document.createElement('div');
              simb.addClass('kktviptv-channel__simb');
              simb.text(element.name.length <= 3 ? element.name.toUpperCase() : element.name.replace(/[^a-z|а-я|0-9]/gi, '').toUpperCase()[0]);
              var text = document.createElement('div');
              text.addClass('kktviptv-channel__name');
              text.text(Utils.clear(element.name));
              body.append(simb);
              body.append(text);
            };

            img.onload = function () {
              item.addClass('loaded');

              if (element.logo.indexOf('epg.it999') == -1) {
                item.addClass('small--icon');
              }
            };

            if (element.logo) img.src = element.logo;else img.onerror();
            
            //console.log('KulikTV', 'Logo Канала:', element.logo);
          });
          item.on('hover:focus', function () {
            _this2.active(item);

            _this2.scroll.update(item);

            if (_this2.last !== item) _this2.listener.send('details-load', element);
            _this2.last = item;
          }).on('hover:hover hover:touch', function () {
            Navigator.focused(item);

            _this2.active(item);

            if (_this2.last !== item) _this2.listener.send('details-load', element);
            _this2.last = item;
          }).on('hover:long', function () {
            Lampa.Select.show({
              title: Lampa.Lang.translate('title_action'),
              items: [{
                title: Lampa.Lang.translate(Favorites.find(element) ? 'iptv_remove_fav' : 'iptv_add_fav')
              }],
              onSelect: function onSelect(a) {
                Favorites.toggle(element)["finally"](function () {
                  item.toggleClass('favorite', Boolean(Favorites.find(element)));

                  _this2.listener.send('update-favorites');
                });

                _this2.toggle();
              },
              onBack: _this2.toggle.bind(_this2)
            });
          }).on('hover:enter', function () {
            _this2.listener.send('play', {
              position: position,
              total: _this2.icons.length
            });
          });

          _this2.html.append(item);

          if (Lampa.Controller.own(_this2)) Lampa.Controller.collectionAppend(item);
        });
        setTimeout(function () {
          Lampa.Layer.visible(_this2.html);
        }, 300);
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _this3 = this;

        Lampa.Controller.add('content', {
          link: this,
          toggle: function toggle() {
            if (_this3.html.find('.selector')) {
              Lampa.Controller.collectionSet(_this3.html);
              Lampa.Controller.collectionFocus(_this3.last, _this3.html);
            } else _this3.listener.send('toggle', 'menu');
          },
          left: function left() {
            _this3.listener.send('toggle', 'menu');
          },
          right: function right() {
            _this3.listener.send('toggle', 'details');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            _this3.listener.send('back');
          }
        });
        Lampa.Controller.toggle('content');
      }
    }, {
      key: "render",
      value: function render() {
        return this.scroll.render(true);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.scroll.destroy();
        this.html.remove();
      }
    }]);

    return Icons;
  }();

  var EPG = /*#__PURE__*/function () {
    function EPG() {
      _classCallCheck(this, EPG);
    }

    _createClass(EPG, null, [{
      key: "time",
      value: function time(channel) {
        var timeshift = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var date = new Date(),
            time = date.getTime(),
            ofst = parseInt((localStorage.getItem('time_offset') == null ? 'n0' : localStorage.getItem('time_offset')).replace('n', ''));
        date = new Date(time + ofst * 1000 * 60 * 60);
        var offset = channel.name.match(/([+|-]\d)$/);

        if (offset) {
          date.setHours(date.getHours() + parseInt(offset[1]));
        }

        var result = date.getTime();
        result -= timeshift;
        return result;
      }
    }, {
      key: "position",
      value: function position(channel, list, timeshift) {
        var tim = this.time(channel, timeshift);
        var now = list.find(function (p) {
          return tim > p.start && tim < p.stop;
        });
        return now ? list.indexOf(now) : list.length - 1;
      }
    }, {
      key: "timeline",
      value: function timeline(channel, program, timeshift) {
        var time = this.time(channel, timeshift);
        var total = program.stop - program.start;
        var less = program.stop - time;
        return Math.min(100, Math.max(0, (1 - less / total) * 100));
      }
    }, {
      key: "list",
      value: function list(channel, _list) {
        var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
        var position = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var day_lst = '';
        var day_prg = '';
        var day_now = new Date(Date.now()).getDate();
        var day_nam = {};
        var display = [];
        day_nam[day_now - 1] = Lampa.Lang.translate('iptv_yesterday');
        day_nam[day_now] = Lampa.Lang.translate('iptv_today');
        day_nam[day_now + 1] = Lampa.Lang.translate('iptv_tomorrow');

        var watch = _list[this.position(channel, _list)];

        _list.slice(position, position + size).forEach(function (elem) {
          day_prg = new Date(elem.start).getDate();

          if (day_lst !== day_prg) {
            day_lst = day_prg;
            display.push({
              type: 'date',
              date: day_nam[day_prg] ? day_nam[day_prg] : Lampa.Utils.parseTime(elem.start)["short"]
            });
          }

          display.push({
            type: 'program',
            program: elem,
            watch: watch == elem
          });
        });

        return display;
      }
    }]);

    return EPG;
  }();

  var Details = /*#__PURE__*/function () {
    function Details(listener) {
      var _this = this;

      _classCallCheck(this, Details);

      this.listener = listener;
      this.html = Lampa.Template.js('kktv2_iptv_details');
      this.title = this.html.find('.iptv-details__title');
      this.play = this.html.find('.iptv-details__play');
      this.progm = this.html.find('.iptv-details__program');
      this.empty_html = Lampa.Template.js('kktv2_iptv_details_empty');
      this.listener.follow('details-load', this.draw.bind(this));
      if (window.iptv_mobile) this.html.removeClass('layer--wheight');
      this.timer = setInterval(function () {
        if (_this.timeline) _this.timeline();
      }, 1000 * 5);
    }

    _createClass(Details, [{
      key: "draw",
      value: function draw(channel) {
        var _this2 = this;

        this.title.text(Utils.clearChannelName(channel.name));
        this.group(channel, Utils.clearMenuName(channel.group || Lampa.Lang.translate('player_unknown')));
        this.wait_for = channel.name;

        if (channel.id) {
          this.progm.text(Lampa.Lang.translate('loading') + '...');
          Api.program({
            channel_id: channel.id,
            time: EPG.time(channel)
          }).then(function (program) {
            if (_this2.wait_for == channel.name) {
              if (program.length) _this2.program(channel, program);else _this2.empty();
            }
          })["catch"](function (e) {
            console.log(e);

            _this2.empty();
          });
        } else {
          this.empty();
        }
      }
    }, {
      key: "group",
      value: function group(channel, title) {
        this.play.empty();
        var group = document.createElement('span');
        group.text(title);

        if (Utils.hasArchive(channel)) {
          var archive = document.createElement('span');
          archive.addClass('lb').text('A');
          this.play.append(archive);
        }

        var hd = Utils.isHD(channel.name);

        if (hd) {
          var hd_lb = document.createElement('span');
          hd_lb.addClass('lb').text(hd.toUpperCase());
          this.play.append(hd_lb);
        }

        this.play.append(group);
      }
    }, {
      key: "empty",
      value: function empty() {
        this.timeline = false;
        this.progm.empty().append(this.empty_html);
      }
    }, {
	      key: "playlist",
      value: function playlist(channel, program) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var stime = EPG.time(channel);
        var start = EPG.position(channel, program);
        var archive = Utils.hasArchive(channel);
        var endless = new Lampa.Endless(function (position) {
          if (position >= program.length) return endless.to(position - 1);
          var wrap = document.createElement('div');
          var list = EPG.list(channel, program, 10, position);
          list.forEach(function (elem, index) {
            var item = document.createElement('div');
            if (elem.type == 'date') item.addClass('iptv-program-date').text(elem.date);else {
              item.addClass('iptv-program selector');
              var time = document.createElement('div');
              time.addClass('iptv-program__time').text(Lampa.Utils.parseTime(elem.program.start).time);
              var body = document.createElement('div');
              body.addClass('iptv-program__body');

              
              var title = document.createElement('div');
              title.addClass('iptv-program__title').text(Utils.clear(elem.program.title));
              body.append(title);

              if (elem.watch) {
                var timeline = document.createElement('div');
                timeline.addClass('iptv-program__timeline');
                var div = document.createElement('div');
                div.style.width = EPG.timeline(channel, elem.program) + '%';
                timeline.append(div);

                if (archive) {
                  item.on('hover:enter', function () {
                    params.onPlay({
                      program: elem.program,
                      position: position,
                      channel: channel,
                      playlist: program.slice(Math.max(0, position - 40), start)
                    });
                  });
                }

                item.addClass('played');
                body.append(timeline);
              }
              
              if (index == 1 && elem.program.desc) {
                var text = Utils.clear(elem.program.desc);
                if (text.length > 300) text = text.slice(0, 300) + '...';
                var descr = document.createElement('div');
                descr.addClass('iptv-program__descr').text(text);
                body.append(descr);
              }

              if (archive) {
                var minus = stime - archive * 1000 * 60 * 60 * 24;

                if (elem.program.start > minus && elem.program.stop < stime) {
                  item.addClass('archive');
                  item.on('hover:enter', function () {
                    params.onPlay({
                      program: elem.program,
                      position: position,
                      channel: channel,
                      timeshift: stime - elem.program.start,
                      playlist: program.slice(Math.max(0, position - 40), start)
                    });
                  });
                }
              }

              item.append(time);
              item.append(body);
            }
            wrap.addClass('iptv-details__list');
            wrap.append(item);
          });
          return wrap;
        }, {
          position: start
        });
        return endless;
      }
    }, {
      key: "program",
      value: function program(channel, _program) {
        var _this3 = this;

        if (this.endless) this.endless.destroy();
        this.timeline = false;
        var stime = EPG.time(channel);
        var start = EPG.position(channel, _program);
        var archive = Utils.hasArchive(channel);

        if (_program[start]) {
          this.group(channel, Lampa.Utils.shortText(Utils.clear(_program[start].title), 50));
        }

        this.endless = new Lampa.Endless(function (position) {
          if (position >= _program.length) return _this3.endless.to(position - 1);
          var wrap = document.createElement('div');
          var list = EPG.list(channel, _program, 10, position);
          list.forEach(function (elem, index) {
            var item = document.createElement('div');
            if (elem.type == 'date') item.addClass('iptv-program-date').text(elem.date);else {
              item.addClass('iptv-program selector');
              var time = document.createElement('div');
              time.addClass('iptv-program__time').text(Lampa.Utils.parseTime(elem.program.start).time);
              var body = document.createElement('div');
              body.addClass('iptv-program__body');
														
																						  
								 
								 
              var title = document.createElement('div');
              title.addClass('iptv-program__title').text(Utils.clear(elem.program.title));
              body.append(title);

              if (elem.watch) {
                var timeline = document.createElement('div');
				timeline.addClass('iptv-program__timeline');
                var div = document.createElement('div');
                div.style.width = EPG.timeline(channel, elem.program) + '%';
                timeline.append(div);

                _this3.timeline = function () {
                  var percent = EPG.timeline(channel, elem.program);
                  div.style.width = percent + '%';

                  if (percent == 100) {
                    var next = EPG.position(channel, _program);
                    if (start !== next) _this3.program(channel, _program);
                  }
                };
                
                if (archive) {
                  item.on('hover:enter', function () {
                    _this3.listener.send('play-archive', {
                      program: elem.program,
                      position: position,
                      channel: channel,
                      playlist: _program.slice(Math.max(0, position - 40), start)
                    });
                  });
                }

                item.addClass('played');
                body.append(timeline);
              }

            if (index == 1 && elem.program.desc) {
                var text = Utils.clear(elem.program.desc);
                if (text.length > 300) text = text.slice(0, 300) + '...';
                var descr = document.createElement('div');
                descr.addClass('iptv-program__descr').text(text);
                body.append(descr);
            }

              if (archive) {
                var minus = stime - archive * 1000 * 60 * 60 * 24;

                if (elem.program.start > minus && elem.program.stop < stime) {
                  item.addClass('archive');
                  item.on('hover:enter', function () {
                    _this3.listener.send('play-archive', {
                      program: elem.program,
                      position: position,
                      channel: channel,
                      timeshift: stime - elem.program.start,
                      playlist: _program.slice(Math.max(0, position - 40), start)
                    });
                  });
                }
              }

              item.append(time);
              item.append(body);
            }
            wrap.addClass('iptv-details__list');
            wrap.append(item);
          });
          return wrap;
        }, {
          position: start
        });
        this.progm.empty().append(this.endless.render());
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _this4 = this;

        Lampa.Controller.add('content', {
          link: this,
          toggle: function toggle() {
            if (_this4.html.find('.selector')) {
              Lampa.Controller.collectionSet(_this4.html);
              Lampa.Controller.collectionFocus(false, _this4.html);
            } else _this4.listener.send('toggle', 'icons');
          },
          left: function left() {
            _this4.listener.send('toggle', 'icons');
          },
          up: function up() {
            if (_this4.endless) {
              _this4.endless.move(-1);

              Lampa.Controller.collectionSet(_this4.html);
              Lampa.Controller.collectionFocus(false, _this4.html);
            }
          },
          down: function down() {
            if (_this4.endless) {
              _this4.endless.move(1);

              Lampa.Controller.collectionSet(_this4.html);
              Lampa.Controller.collectionFocus(false, _this4.html);
            }
          },
          back: function back() {
            _this4.listener.send('back');
          }
        });
        Lampa.Controller.toggle('content');
      }
    }, {
      key: "render",
      value: function render() {
        return this.html;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.html.remove();
        clearInterval(this.timer);
        this.wait_for = false;
      }
    }]);

    return Details;
  }();

  var Menu = /*#__PURE__*/function () {
    function Menu(listener) {
      _classCallCheck(this, Menu);

      this.listener = listener;
      this.html = Lampa.Template.js('kktv2_iptv_menu');
      this.menu = this.html.find('.kktviptv-menu__list');
      this.scroll = new Lampa.Scroll({
        mask: !window.iptv_mobile,
        over: true,
        horizontal: window.iptv_mobile
      });
      if (!window.iptv_mobile) this.scroll.minus();
      this.scroll.append(this.html);
    }

    _createClass(Menu, [{
      key: "favorites",
      value: function favorites(channels) {
        var favorites = Favorites.list();

        if (Lampa.Storage.get('kulikb_favotite_save', 'url') == 'name') {
          favorites = favorites.filter(function (f) {
            return channels.find(function (c) {
              return c.name == f.name;
            });
          });
          favorites.forEach(function (f) {
            f.url = channels.find(function (c) {
              return c.name == f.name;
            }).url;
          });
        }

        return favorites;
      }
    }, {
      key: "build",
      value: function build(data) {
        var _this = this;

        this.menu.empty();
        this.html.find('.kktviptv-menu__title').text(data.name || Lampa.Lang.translate('player_playlist'));
        this.html.find('.kktviptv-menu__title_rek').html(Lampa.Lang.translate('kktv_rek_chann'));
        var favorites = this.favorites(data.playlist.channels);
        Lampa.Arrays.insert(data.playlist.menu, 0, {
          name: Lampa.Lang.translate('settings_input_links'),
          count: favorites.length,
          favorites: true
        });
        var first;
        data.playlist.menu.forEach(function (menu) {
          if (menu.count == 0 && !menu.favorites) return;
          var li = document.createElement('div');
          var co = document.createElement('span');
          li.addClass('kktviptv-menu__list-item selector');
          li.text(Utils.clearMenuName(menu.name || Lampa.Lang.translate('iptv_all_channels')));
          co.text(menu.count);
          li.append(co);

          if (menu.favorites) {
            li.addClass('favorites--menu-item');

            _this.listener.follow('update-favorites', function () {
              favorites = Favorites.list();
              menu.count = favorites.length;
              li.find('span').text(menu.count);
            });
          }

          li.on('hover:enter', function () {
            if (menu.count == 0) return;

            if (menu.favorites) {
              _this.listener.send('icons-load', {
                menu: menu,
                icons: favorites
              });
            } else {
              _this.listener.send('icons-load', {
                menu: menu,
                icons: menu.name ? data.playlist.channels.filter(function (a) {
                  return a.group == menu.name;
                }) : data.playlist.channels
              });
            }

            var active = _this.menu.find('.active');

            if (active) active.removeClass('active');
            li.addClass('active');
            _this.last = li;

            _this.listener.send('toggle', 'icons');
          });
          li.on('hover:focus', function () {
            _this.scroll.update(li, true);

            _this.last = li;
          });
          if (!first && menu.count !== 0) first = li;

          _this.menu.append(li);
        });
        if (first) Lampa.Utils.trigger(first, 'hover:enter');
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _this2 = this;

        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(_this2.render());
            Lampa.Controller.collectionFocus(_this2.last, _this2.render());
          },
          left: function left() {
            Lampa.Controller.toggle('menu');
          },
          right: function right() {
            _this2.listener.send('toggle', 'icons');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            _this2.listener.send('back');
          }
        });
        Lampa.Controller.toggle('content');
      }
    }, {
      key: "render",
      value: function render() {
        return this.scroll.render(true);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.scroll.destroy();
        this.html.remove();
      }
    }]);

    return Menu;
  }();

  function strReplace(str, key2val) {
    for (var key in key2val) {
      str = str.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), key2val[key]);
    }

    return str;
  }

  function tf(t, format, u, tz) {
    format = format || '';
    tz = parseInt(tz || '0');
    var thisOffset = 0;
    thisOffset += tz;
    if (!u) thisOffset += parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n', '')) * 60 - new Date().getTimezoneOffset();
    var d = new Date((t + thisOffset) * 1000);
    var r = {
      yyyy: d.getUTCFullYear(),
      MM: ('0' + (d.getUTCMonth() + 1)).substr(-2),
      dd: ('0' + d.getUTCDate()).substr(-2),
      HH: ('0' + d.getUTCHours()).substr(-2),
      mm: ('0' + d.getUTCMinutes()).substr(-2),
      ss: ('0' + d.getUTCSeconds()).substr(-2),
      UTF: t
    };
    return strReplace(format, r);
  }

  function unixtime() {
    return Math.floor((new Date().getTime() + 0) / 1000);
  }

  var Url = /*#__PURE__*/function () {
    function Url() {
      _classCallCheck(this, Url);
    }

    _createClass(Url, null, [{
      key: "prepareUrl",
      value: function prepareUrl(url, program) {
        var m = [],
            val = '',
            r = {
          start: unixtime,
          offset: 0
        };

        if (program) {
          var start = Math.floor(program.start / 1000);
          var end = Math.floor(program.stop / 1000);
          var duration = end - start;
          r = {
            start: start,
            utc: start,
            end: end,
            utcend: end,
            offset: unixtime() - start,
            duration: duration,
            durationfs: end > unixtime() ? 'now' : duration,
            now: unixtime,
            lutc: unixtime,
            timestamp: unixtime,
            d: function d(m) {
              return strReplace(m[6] || '', {
                M: Math.floor(duration / 60),
                S: duration,
                h: Math.floor(duration / 60 / 60),
                m: ('0' + Math.floor(duration / 60) % 60).substr(-2),
                s: '00'
              });
            },
            b: function b(m) {
              return tf(start, m[6], m[4], m[5]);
            },
            e: function e(m) {
              return tf(end, m[6], m[4], m[5]);
            },
            n: function n(m) {
              return tf(unixtime(), m[6], m[4], m[5]);
            }
          };
        }

        while (!!(m = url.match(/\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/))) {
          if (!!m[2] && typeof r[m[2]] === "function") val = r[m[2]](m);else if (!!m[3] && typeof r[m[3]] === "function") val = r[m[3]](m);else if (m[6] in r) val = typeof r[m[6]] === "function" ? r[m[6]]() : r[m[6]];else val = m[1];
          url = url.replace(m[0], encodeURIComponent(val));
        }

        return url;
      }
    }, {
      key: "catchupUrl",
      value: function catchupUrl(url, type, source) {
        type = (type || '').toLowerCase();
        source = source || '';

        if (!type) {
          if (!!source) {
            if (source.search(/^https?:\/\//i) === 0) type = 'default';else if (source.search(/^[?&/][^/]/) === 0) type = 'append';else type = 'default';
          } else if (url.indexOf('${') < 0) type = 'shift';else type = 'default';

          console.log('KulikTV', 'Autodetect catchup-type "' + type + '"');
        }

        var newUrl = '';

        switch (type) {
          case 'append':
            if (source) {
              newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
              break; // так и задумано
            }

          case 'timeshift': // @deprecated

          case 'shift':
            // + append
            newUrl = source || url;
            newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
            return newUrl;

          case 'flussonic':
          case 'flussonic-hls':
          case 'flussonic-ts':
          case 'fs':
            // Example stream and catchup URLs
            // stream:  http://ch01.spr24.net/151/mpegts?token=my_token
            // catchup: http://ch01.spr24.net/151/timeshift_abs-{utc}.ts?token=my_token
            // stream:  http://list.tv:8888/325/index.m3u8?token=secret
            // catchup: http://list.tv:8888/325/timeshift_rel-{offset:1}.m3u8?token=secret
            // stream:  http://list.tv:8888/325/mono.m3u8?token=secret
            // catchup: http://list.tv:8888/325/mono-timeshift_rel-{offset:1}.m3u8?token=secret
            // stream:  http://list.tv:8888/325/live?token=my_token
            // catchup: http://list.tv:8888/325/{utc}.ts?token=my_token
            // See doc: https://flussonic.ru/doc/proigryvanie/vosproizvedenie-hls/
            return url.replace(/\/(video\d*|mono\d*)\.(m3u8|ts)(\?|$)/, '/$1-\${start}-\${durationfs}.$2$3').replace(/\/(index|playlist)\.(m3u8|ts)(\?|$)/, '/archive-\${start}-\${durationfs}.$2$3').replace(/\/mpegts(\?|$)/, '/timeshift_abs-\${start}.ts$1').replace(/\/live(\?|$)/, '/\${start}.ts$1');

          case 'xc':
            // Example stream and catchup URLs
            // stream:  http://list.tv:8080/my@account.xc/my_password/1477
            // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.ts
            // stream:  http://list.tv:8080/live/my@account.xc/my_password/1477.m3u8
            // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.m3u8
            newUrl = url.replace(/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/, '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8').replace(/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/, '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts');
            break;

          case 'default':
            newUrl = source || url;
            break;

          case 'disabled':
            return false;

          default:
            console.log('KulikTV', 'Err: no support catchup-type="' + type + '"');
            return false;
        }

        if (newUrl.indexOf('${') < 0) return this.catchupUrl(newUrl, 'shift');
        return newUrl;
      }
    }]);

    return Url;
  }();

  var Channels = /*#__PURE__*/function () {
    function Channels(listener) {
      var _this = this;

      _classCallCheck(this, Channels);

      this.listener = listener;
      this.html = Lampa.Template.js('kktv2_iptv_content');
      this.inner_listener = Lampa.Subscribe();
      this.menu = new Menu(this.inner_listener);
      this.icons = new Icons(this.inner_listener);
      this.details = new Details(this.inner_listener);
      this.inner_listener.follow('toggle', function (name) {
        _this[name].toggle();

        _this.active = _this[name];
      });
      this.inner_listener.follow('back', function () {
        _this.listener.send('playlist-main');
      });
      this.inner_listener.follow('play', this.playChannel.bind(this));
      this.inner_listener.follow('play-archive', this.playArchive.bind(this));
      this.active = this.menu;
      this.html.find('.kktviptv-content__menu').append(this.menu.render());
      this.html.find('.kktviptv-content__channels').append(this.icons.render());
      this.html.find('.kktviptv-content__details').append(this.details.render());
    }

    _createClass(Channels, [{
      key: "build",
      value: function build(data) {
        this.empty = false;
        this.menu.build(data);
        this.listener.send('display', this);
      }
    }, {
      key: "playArchive",
      value: function playArchive(data) {
        var convert = function convert(p) {
          var item = {
            title: Lampa.Utils.parseTime(p.start).time + ' - ' + Lampa.Utils.capitalizeFirstLetter(p.title)
          };
          item.url = Url.catchupUrl(data.channel.url, data.channel.catchup.type, data.channel.catchup.source);
          item.url = Url.prepareUrl(item.url, p);
          return item;
        };

        Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
        Lampa.Player.play(convert(data.program));
        Lampa.Player.playlist(data.playlist.map(convert));
      }
    }, {
      key: "playChannel",
      value: function playChannel(data) {
        var _this2 = this;

        var cache = {};
        cache.none = [];
        var time;
        var update;
        var start_channel = Lampa.Arrays.clone(this.icons.icons[data.position]);
        start_channel.original = this.icons.icons[data.position];
        data.url = Url.prepareUrl(start_channel.url);
        
        

        if (this.archive && this.archive.channel == start_channel.original) {
          data.url = Url.catchupUrl(this.archive.channel.url, this.archive.channel.catchup.type, this.archive.channel.catchup.source);
          data.url = Url.prepareUrl(data.url, this.archive.program);
        }

        data.onGetChannel = function (position) {
          var original = _this2.icons.icons[position];
          var channel = Lampa.Arrays.clone(original);
          var timeshift = _this2.archive && _this2.archive.channel == original ? _this2.archive.timeshift : 0;
          channel.name = Utils.clearChannelName(channel.name);
          channel.group = Utils.clearMenuName(channel.group);
          channel.url = Url.prepareUrl(channel.url);
          channel.original = original;
          
//Что-то новое крутое))
var hlsMethodOrign = Lampa.Storage.get('player_hls_method');
var hlsMethodKulik = Lampa.Storage.field('kulikhls_method');
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodKulik);
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodOrign);
//крутое кончилось)
          
        var cdnpotok = channel.url;
        var cdnDomain = cdnpotok.substring(0, cdnpotok.indexOf('/', cdnpotok.indexOf('//') + 2));
        var potok;
        if (cdnpotok.includes('/channel/')) {
            potok = cdnpotok.split("/channel")[1].split("/")[1];
        } else {
            var cdnmatch = cdnpotok.match(/\/(\d+)\//);
            if (cdnmatch && cdnmatch.length > 1) {
            var cdnnumbers = cdnmatch[1];
            potok = cdnnumbers;
            }
        }
        console.log('KulikTV', '(v2) CDN-Сервер ·····', cdnDomain + ' ⇔ (v2 Поток) ····· ', potok);
        console.log('KulikTV', '(v2) Включили: ', channel.name);
        if (hlsMethodKulik === 'hlsjs') {
            console.log('KulikTV', 'обработка: Ламповая');
        } else {
            console.log('KulikTV', 'обработка: Системная');
        }

          if (timeshift) {
            channel.shift = timeshift;
            channel.url = Url.catchupUrl(original.url, channel.catchup.type, channel.catchup.source);
            channel.url = Url.prepareUrl(channel.url, _this2.archive.program);
          }

          update = false;

          if (channel.id) {
            if (!cache[channel.id]) {
              cache[channel.id] = [];
              Api.program({
                channel_id: channel.id,
                time: EPG.time(channel, timeshift)
              }).then(function (program) {
                cache[channel.id] = program;
              })["finally"](function () {
                Lampa.Player.programReady({
                  channel: channel,
                  position: EPG.position(channel, cache[channel.id], timeshift),
                  total: cache[channel.id].length
                });
              });
            } else {
              Lampa.Player.programReady({
                channel: channel,
                position: EPG.position(channel, cache[channel.id], timeshift),
                total: cache[channel.id].length
              });
            }
          } else {
            Lampa.Player.programReady({
              channel: channel,
              position: 0,
              total: 0
            });
          }

          return channel;
        };

        data.onPlaylistProgram = function (channel) {
          var program = cache[channel.id || 'none'];
          if (!program.length) return;
          var html = document.createElement('div');
          html.style.lineHeight = '1.4';
          Lampa.Modal.open({
            title: '',
            size: 'medium',
            html: $(html)
          });

          var endless = _this2.details.playlist(channel, program, {
            onPlay: function onPlay(param) {
              Lampa.Modal.close();
              Lampa.Player.close();

              _this2.playArchive(param);
            }
          });

          html.append(endless.render());
          Lampa.Controller.add('modal', {
            invisible: true,
            toggle: function toggle() {
              Lampa.Controller.collectionSet(html);
              Lampa.Controller.collectionFocus(false, html);
            },
            up: function up() {
              endless.move(-1);
              Lampa.Controller.collectionSet(html);
              Lampa.Controller.collectionFocus(false, html);
            },
            down: function down() {
              endless.move(1);
              Lampa.Controller.collectionSet(html);
              Lampa.Controller.collectionFocus(false, html);
            },
            back: function back() {
              Lampa.Modal.close();
              Lampa.Controller.toggle('player_tv');
            }
          });
          Lampa.Controller.toggle('modal');
        };

        data.onPlay = function (channel) {
          if (channel.original.added) {
            channel.original.view++;
            Favorites.update(channel.original);
          }
        };

        data.onGetProgram = function (channel, position, container) {
          update = false;
          var timeshift = channel.shift || 0;
          var program = cache[channel.id || 'none'];
          var noprog = document.createElement('div');
          noprog.addClass('player-panel-iptv-item__prog-load');
          noprog.text(Lampa.Lang.translate('iptv_noprogram'));
          container[0].empty().append(noprog);

          if (program.length) {
            var start = EPG.position(channel, program, timeshift);
            var list = program.slice(position, position + 2);
            var now = program[start];
            if (list.length) container[0].empty();
            list.forEach(function (prog) {
              var item = document.createElement('div');
              item.addClass('player-panel-iptv-item__prog-item');
              var span = document.createElement('span');
              span.html(Lampa.Utils.parseTime(prog.start).time + (now == prog ? ' - ' + Lampa.Utils.parseTime(prog.stop).time : '') + ' &nbsp; ' + Utils.clear(prog.title));
              item.append(span);

              if (now == prog) {
                item.addClass('watch');
                var timeline = document.createElement('div');
                timeline.addClass('player-panel-iptv-item__prog-timeline');
                var div = document.createElement('div');
                div.style.width = EPG.timeline(channel, prog, timeshift) + '%';
                timeline.append(div);

                update = function update() {
                  var percent = EPG.timeline(channel, prog, timeshift);
                  div.style.width = percent + '%';

                  if (percent == 100) {
                    var next = EPG.position(channel, program, timeshift);

                    if (start !== next) {
                      Lampa.Player.programReady({
                        channel: channel,
                        position: next,
                        total: cache[channel.id].length
                      });
                    }
                  }
                };

                item.append(timeline);
              }

              container[0].append(item);
            });
          }
        };

        Lampa.Player.iptv(data);
        time = setInterval(function () {
          if (update) update();
        }, 1000 * 10);

        var destroy = function destroy() {
          Lampa.Player.listener.remove('destroy', destroy);
          cache = null;
          update = null;
          _this2.archive = false;
          clearInterval(time);
        };

        Lampa.Player.listener.follow('destroy', destroy);
      }
    }, {
      key: "toggle",
      value: function toggle() {
        var _this3 = this;

        if (this.empty) {
          Lampa.Controller.add('content', {
            invisible: true,
            toggle: function toggle() {
              Lampa.Controller.clear();
            },
            left: function left() {
              Lampa.Controller.toggle('menu');
            },
            up: function up() {
              Lampa.Controller.toggle('head');
            },
            back: function back() {
              _this3.listener.send('playlist-main');
            }
          });
          Lampa.Controller.toggle('content');
        } else this.active.toggle();
      }
    }, {
      key: "render",
      value: function render() {
        return this.empty ? this.empty.render(true) : this.html;
      }
    }, {
      key: "load",
      value: function load(playlist) {
        var _this4 = this;

        this.listener.send('loading');
        Api.playlist(playlist).then(this.build.bind(this))["catch"](function (e) {
          _this4.empty = new Lampa.Empty({
            descr: '<div style="width: 60%; margin:0 auto; line-height: 1.4">' + Lampa.Lang.translate('kuliktv_noload') + '</div>'
          });

          _this4.listener.send('display', _this4);
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.menu.destroy();
        this.icons.destroy();
        this.details.destroy();
        this.inner_listener.destroy();
        this.active = false;
        this.epg_cache = null;
        this.html.remove();
      }
    }]);

    return Channels;
  }();

  function KKulikComponent() {
    var html = document.createElement('div');
    var listener;
    var playlist;
    var channels;
    window.iptv_mobile = window.innerWidth < 768;

    if (Lampa.Manifest.app_digital >= 185) {
      listener = Lampa.Subscribe();
      playlist = new Playlist(listener);
      channels = new Channels(listener);
    }

    this.create = function () {
      var _this = this;

      this.activity.loader(true);

      if (Lampa.Manifest.app_digital >= 185) {
        listener.follow('display', function (controller) {
          _this.active = controller;

          _this.display(controller.render());
        });
        listener.follow('loading', this.loading.bind(this));
        listener.follow('channels-load', channels.load.bind(channels));
        listener.follow('playlist-main', playlist.main.bind(playlist));
        playlist.load();
      } else {
        var old = Lampa.Template.get('kktv2_iptv_list');
        old.find('.iptv-list__title').text(Lampa.Lang.translate('iptv_update_app_title'));
        old.find('.iptv-list__text').text(Lampa.Lang.translate('iptv_update_app_text'));
        $(html).append(old);
        this.activity.loader(false);
      }

      if (window.iptv_mobile) html.addClass('kktviptv-mobile');
      return this.render();
    };

    this.playlist = function () {
      playlist.main();
    };

    this.loading = function () {
      this.activity.loader(true);
      this.active = false;
      this.start();
    };

    this.display = function (render) {
      html.empty().append(render);
      Lampa.Layer.update(html);
      Lampa.Layer.visible(html);
      this.activity.loader(false);
      this.start();
    };

    this.background = function () {
      Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
    };

    this.start = function () {
      var _this2 = this;

      if (Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return;
      this.background();
      Lampa.Controller.add('content', {
        invisible: true,
        toggle: function toggle() {
          if (_this2.active) _this2.active.toggle();else {
            Lampa.Controller.collectionSet(html);
            Lampa.Controller.collectionFocus(false, html);
          }
        },
        left: function left() {
          Lampa.Controller.toggle('menu');
        },
        up: function up() {
          Lampa.Controller.toggle('head');
        },
        back: function back() {
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function () {};

    this.stop = function () {};

    this.render = function () {
      return html;
    };

    this.destroy = function () {
      if (playlist) playlist.destroy();
      if (channels) channels.destroy();
      listener.destroy();
      html.remove();
    };
  }
  
    Lampa.Lang.add({
    kulik_select_server: {
        ru: 'Выберите Сервер',
        uk: 'Выберите Сервер',
        be: 'Выберите Сервер',
        en: 'Select Server'
    },
    kulik_server: {
        ru: 'Сервер',
        uk: 'Сервер',
        be: 'Сервер',
        en: 'Server'
    },
    kulik_select_server_text: {
        ru: 'От выбора сервера зависит перечень каналов и их работа с той или иной локации.'
        //ru: 'От выбора сервера зависит перечень каналов и их работа с той или иной локации. Не забывайте о нашем чате в ТГ: <span class="iptv-link">@lampaIPTV</span>'
    },
      iptv_noprogram: {
        ru: 'Нет программы',
        en: 'No program',
        uk: 'Немає програми',
        be: 'Няма праграмы',
        zh: '没有节目',
        pt: 'Nenhum programa'		
									   
      },
      kiptv_now: {
        ru: 'Сейчас'
      },
      kiptv_later: {
        ru: 'Далее'
      },
      kuliktv_empty_title: {
        ru: 'Если рекомендация ниже не помогла обратитесь в чат TG для диагностики <br /> <span class="iptv-link">@lampaIPTV</span>',
      },
      kuliktv_server_empty: {
        ru: 'Не удалось загрузится, попробуйте следующее:<br><br><li>Откройте <span class="iptv-link">Настройки</span>=><span class="iptv-link">Остальное</span></li><br><li>Далее пункт <span class="iptv-link">Безопасное соединение</span> переключите в положение <span class="iptv-link">НЕТ</span></li><br>После перезагрузите приложение <span class="iptv-link">Lampa</span> либо перезагрузите само устройство.',
        //en: 'Sorry, you haven\'t added any playlist yet. To start watching content, please go to <span class="iptv-link">cub.red/iptv</span> and add at least one playlist.',
        //uk: 'На жаль, на даний момент ви не додали жодного плейлиста. Щоб розпочати перегляд контенту, будь ласка, перейдіть на сторінку <span class="iptv-link">cub.red/iptv</span> і додайте хоча б один плейлист.',
        //be: 'Нажаль, на дадзены момант вы не дадалі ніводнага плэйліста. Каб пачаць прагляд кантэнту, калі ласка, перайдзіце на старонку <span class="iptv-link">cub.red/iptv</span> і дадайце хаця б адзін плэйліст.',
        //zh: '抱歉，您还没有添加任何播放列表。 要开始观看内容，请转到 <span class="iptv-link">cub.red/iptv</span> 并添加至少一个播放列表。',
        //pt: 'Desculpe, você ainda não adicionou nenhuma lista de reprodução. Para começar a assistir o conteúdo, acesse <span class="iptv-link">cub.red/iptv</span> e adicione pelo menos uma lista de reprodução.'
      },
      kuliktv_noload: {
        ru: 'Не удалось загрузится, обратитесь в чат для диагностики -> <span class="iptv-link">@lampaIPTV</span>',
        //en: 'Unfortunately, the playlist download failed. Your ISP may have blocked downloads from external sources.',
        //uk: 'На жаль, завантаження плейлиста не вдалося. Можливо, ваш провайдер заблокував завантаження із зовнішніх джерел.',
        //be: 'Нажаль, загрузка плэйліста не атрымалася. Магчыма, ваш правайдэр заблакаваў загрузку са знешніх крыніц.',
        //zh: '不幸的是，播放列表下载失败。 您的 ISP 可能已阻止从外部来源下载。',
        //pt: 'Infelizmente, o download da lista de reprodução falhou. Seu ISP pode ter bloqueado downloads de fontes externas.'
      },
      iptv_loading: {
        ru: 'Метод загрузки',
        en: 'Download method',
        uk: 'Метод завантаження',
        be: 'Метад загрузкі',
        zh: '下载方式',
        pt: 'Método de download'
      },
      iptv_remove_cache: {
        ru: 'Удалить кеш',
        en: 'Delete cache',
        uk: 'Видалити кеш',
        be: 'Выдаліць кэш',
        zh: '删除缓存',
        pt: 'Excluir cache'
      },
      iptv_remove_cache_descr: {
        ru: 'Удалить плейлист из кеша',
        en: 'Delete playlist from cache',
        uk: 'Видалити плейлист з кешу',
        be: 'Выдаліць плэйліст з кэшу',
        zh: '从缓存中删除播放列表',
        pt: 'Excluir lista de reprodução do cache'
      },
      iptv_update_app_text: {
        ru: 'К сожалению, для работы плагина необходимо обновить вашу лампу путем ее перезагрузки. Она устарела и без этой процедуры плагин не будет функционировать.',
        en: 'Unfortunately, for the plugin to work, you need to update your lamp by rebooting it. It is outdated and without this procedure the plugin will not function.',
        uk: 'На жаль, для роботи плагіна необхідно оновити лампу шляхом її перезавантаження. Вона застаріла і без цієї процедури плагін не функціонуватиме.',
        be: 'Нажаль, для працы плагіна неабходна абнавіць вашу лямпу шляхам яе перазагрузкі. Яна састарэлая і без гэтай працэдуры плягін не будзе функцыянаваць.',
        zh: '不幸的是，要使插件正常工作，您需要通过重新启动来更新灯泡。 它已过时，如果没有此程序，插件将无法运行。',
        pt: 'Infelizmente, para que o plug-in funcione, você precisa atualizar sua lâmpada reiniciando-a. Está desatualizado e sem este procedimento o plugin não funcionará.'
      },
       iptv_premium: {
        ru: 'Доступ к некоторым функциям возможен только при наличии подписки <b>CUB Premium</b>',
        en: 'Some features are only available with a <b>CUB Premium</b> subscription',
        uk: 'Доступ до деяких функцій можливий лише за наявності передплати <b>CUB Premium</b>',
        be: 'Доступ да некаторых функцый магчымы толькі пры наяўнасці падпіскі <b>CUB Premium</b>',
        zh: '某些功能仅适用于 <b>CUB Premium</b> 订阅',
        pt: 'Alguns recursos estão disponíveis apenas com uma assinatura <b>CUB Premium</b>'
      },
      iptv_save_favorite_url: {
        ru: 'По ссылке канала',
        en: 'By channel URL',
        uk: 'За URL-адресою каналу',
        be: 'Па URL-адрэсе канала',
        zh: '按频道网址',
        pt: 'Por URL do canal'
      },
      iptv_save_favorite_name: {
        ru: 'По названию канала',
        en: 'By channel name',
        uk: 'За назвою каналу',
        be: 'Па назве канала',
        zh: '按频道名称',
        pt: 'Por nome do canal'
      },
      iptv_all_channels: {
        ru: 'Все каналы',
        en: 'All channels',
        uk: 'Усі канали',
        be: 'Усе каналы',
        zh: '所有频道',
        pt: 'Todos os canais'
      },
    kktv_rek_chann: {
        ru: ' ',
        en: 'Support TG: <span class=\"iptv-link\">@RenDonutBot</span>',
        uk: 'Support TG: <span class=\"iptv-link\">@RenDonutBot</span>',
        be: 'Support TG: <span class=\"iptv-link\">@RenDonutBot</span>',
        zh: 'Support TG: <span class=\"iptv-link\">@RenDonutBot</span>',
        pt: 'Support TG: <span class=\"iptv-link\">@RenDonutBot</span>',
    },
      iptv_add_fav: {
        ru: 'Добавить в избранное',
        en: 'Add to favorites',
        uk: 'Додати в обране',
        be: 'Дадаць у абранае',
        zh: '添加到收藏夹',
        pt: 'Adicionar aos favoritos'
											
      },
      iptv_remove_fav: {
        ru: 'Убрать из избранного',
        en: 'Remove from favorites',
        uk: 'Прибрати з вибраного',
        be: 'Прыбраць з абранага',
        zh: '从收藏夹中删除',
        pt: 'Remover dos favoritos'
      },
      iptv_updated: {
        ru: 'Обновлено',
        en: 'Updated',
        uk: 'Оновлено',
        be: 'Абноўлена',
        zh: '更新',
        pt: 'Atualizada'
							  
      },
      iptv_update: {
        ru: 'Обновление',
        en: 'Update',
        uk: 'Оновлення',
        be: 'Абнаўленне',
        zh: '更新',
        pt: 'Atualizar'
								  
      },
      iptv_active: {
        ru: 'Активно',
        en: 'Actively',
        uk: 'Активно',
        be: 'Актыўна',
        zh: '积极地',
        pt: 'Ativamente'
							
      },
      iptv_yesterday: {
        ru: 'Вчера',
        en: 'Yesterday',
        uk: 'Вчора',
        be: 'Учора',
        zh: '昨天',
        pt: 'Ontem'
						
      },
      iptv_today: {
        ru: 'Сегодня',
        en: 'Today',
        uk: 'Сьогодні',
        be: 'Сёння',
        zh: '今天',
        pt: 'Hoje'
					  
      },
      iptv_tomorrow: {
        ru: 'Завтра',
        en: 'Tomorrow',
        uk: 'Завтра',
        be: 'Заўтра',
        zh: '明天',
        pt: 'Amanhã'
					  
		
					 
										  
							  
												  
										  
						   
								  
												
      },
      iptv_params_cub: {
        ru: 'CUB',
        en: 'CUB',
        uk: 'CUB',
        be: 'CUB',
        zh: 'CUB',
        pt: 'CUB'
				 
      },
      iptv_params_lampa: {
        ru: 'Lampa',
        en: 'Lampa',
        uk: 'Lampa',
        be: 'Lampa',
        zh: 'Lampa',
        pt: 'Lampa'								   
      },
      iptv_params_always: {
        ru: 'Всегда',
        en: 'Always',
        uk: 'Завжди',
        be: 'Заўсёды',
        zh: '总是',
        pt: 'Sempre'
						  
      },
      iptv_params_hour: {
        ru: 'Каждый час',
        en: 'Each hour',
        uk: 'Кожну годину',
        be: 'Кожную гадзіну',
        zh: '每小时',
        pt: 'Cada hora'
							   
      },
      iptv_params_hour12: {
        ru: 'Каждые 12 часов',
        en: 'Every 12 hours',
        uk: 'Кожні 12 годин',
        be: 'Кожныя 12 гадзін',
        zh: '每12小时',
        pt: 'A cada 12 horas'
									
      },
      iptv_params_day: {
        ru: 'Ежедневно',
        en: 'Daily',
        uk: 'Щодня',
        be: 'Штодня',
        zh: '日常的',
        pt: 'Diário'
								
      },
      iptv_params_week: {
        ru: 'Еженедельно',
        en: 'Weekly',
        uk: 'Щотижня',
        be: 'Штотыдзень',
        zh: '每周',
        pt: 'Semanalmente'
							  
      },
      iptv_params_none: {
        ru: 'Никогда',
        en: 'Never',
        uk: 'Ніколи',
        be: 'Ніколі',
        zh: '绝不',
        pt: 'Nunca'					  
      },
      iptv_param_sort_add: {
        ru: 'По добавлению',
        en: 'By addition',
        uk: 'За додаванням',
        be: 'Па даданні',
        zh: '按添加时间',
        pt: 'Por adição'
								   
      },
      iptv_param_sort_name: {
        ru: 'По названию',
        en: 'By name',
        uk: 'За назвою',
        be: 'Па назве',
        zh: '按名称',
        pt: 'Por nome'
						 
      },
      iptv_param_sort_view: {
        ru: 'По просмотрам',
        en: 'By views',
        uk: 'За переглядами',
        be: 'Па праглядах',
        zh: '按观看次数',
        pt: 'Por visualizações'
								   
      },
      iptv_param_sort_favorite: {
        ru: 'Сортировать избранное',
        en: 'Sort by favorite',
        uk: 'Сортувати в обраному',
        be: 'Сартаваць па выбраным',
        zh: '按收藏排序',
        pt: 'Classificar por favoritos'					
      }
    });																							 
    function Api2() {
        var network = new Lampa.Reguest();
        var api_url = Lampa.Utils.protocol() + 'cdn.kulik.uz/api/';
        console.log('KulikTV', 'Используется LiteAPI:', api_url);

      this.get = function (method) {
        return new Promise(function (resolve, reject) {
            network.silent(api_url + method, resolve, reject);
        });
      };

      this.program = function (data, call) {
        network.timeout(5000);
        var apiepg_url = Lampa.Utils.protocol() + 'api.kulik.uz/';
        network.silent(apiepg_url +'epg/lite/' + data.channel_id, function (result) {
          call({
            result: result.program
          });
        }, function () {
          call({
            result: ''
          });
        });
      };

      

      this.destroy = function () {
        network.clear();
      };
    }

    function KKulikComponent_old(object) {
        
      var _self = this;
      var api = new Api2(); //let event   = new Lampa.Event()
      var html = $('<div></div>');
      var zone = 0;
      var select_playlist_url = '';
      var channels_list = [];
      var channels_page = 0;
      var element_last_focus;
      var program_last_result = {
        id: 0,
        data: {}
      };
      var html_content = Lampa.Template.get('ktv_iptv_content');
      var html_menu = Lampa.Template.get('ktv_iptv_menu');
      var html_details = Lampa.Template.get('ktv_iptv_details');
      var html_channels = Lampa.Template.get('ktv_iptv_channels');
      var scroll_menu = new Lampa.Scroll({
        mask: true,over: true
        //mask:!0,over:!0,step:250
      });
      var scroll_channels = new Lampa.Scroll({
        //mask: true,over: true
        mask:!0,over:!0,step:250
      });
      var scroll_details = new Lampa.Scroll({
        mask: true,over: true
        //mask:!0,over:!0,step:250
      });
      var scroll_list;
      scroll_channels.render().find('.scroll__body').addClass('notransition');
      this.create = function () {
        this.activity.loader(true);
        this.start = this.controllerList.bind(this);
        if (window.innerWidth < 240) this.empty();else {
          api.get('kulik_list?serv=newstyle&email=' + email).then(this.list.bind(this)).then(function (id) {
            return api.get('iptvcors?kultv_get=' + id + '&email=' + email);
          }).then(this.build.bind(this))["catch"](this.empty.bind(this));
        }
        return this.render();
      };

      this.background = function () {
        Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC');
      };

      this.getFavorites = function () {
        var favorites = Lampa.Storage.get('ktv2_iptv_favorites', {});

        if (!favorites[select_playlist_url]) {
          favorites[select_playlist_url] = [];
          Lampa.Storage.set('ktv2_iptv_favorites', favorites);
        }

        return favorites[select_playlist_url];
      };

      this.updateFavorites = function (channels) {
        var favorites = Lampa.Storage.get('ktv2_iptv_favorites', {});
        favorites[select_playlist_url] = channels;
        Lampa.Storage.set('ktv2_iptv_favorites', favorites);
      };

      this.list = function (data) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          if (data.list.length > 1) {
            var html_list = Lampa.Template.get('ktv_iptv_list');
            if (scroll_list) scroll_list.destroy();
            scroll_list = new Lampa.Scroll({
        //mask: true,
        //over: true
        mask:!0,over:!0,step:250
            });
            html_list.find('.ktviptv-list__items').append(scroll_list.render());
            data.list.reverse().forEach(function (item) {
              var li = $('<div class="ktviptv-list__item selector"><div class="ktviptv-list__item-name">' + (item.name || Lampa.Lang.translate('player_playlist')) + '</div></div>');
              li.on('hover:enter', function () {
                _this.activity.loader(true);

                select_playlist_url = item.url;
                resolve(item.id);
              }).on('hover:focus', function () {
                scroll_list.update(li);
              });
              scroll_list.append(li);
            });
            html.append(html_list);

            _this.activity.loader(false);

            _this.start = _this.controllerList.bind(_this);

            _this.activity.toggle();
          } else if (data.list.length == 1) {
            select_playlist_url = data.list[0].url;
            resolve(data.list[0].id);
          } else reject(Lampa.Lang.translate('kuliktv_server_empty'));
        });
      };

      this.empty = function (e) {
        console.log(e);
        var empty = new Lampa.Empty(typeof e == 'string' ? {
          descr: '<div style="width: 60%; margin:0 auto; line-height: 1.4">' + e + '</div>'
        } : {});
        html.empty();
        html.append(empty.render());
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
      };
      

      this.program = function (title, list) {
        var body = $("<div class=\"ktviptv-details__program-body\"><div class=\"ktviptv-details__program-title\">".concat(title, "</div><div class=\"ktviptv-details__program-list\"></div></div>"));
        list.forEach(function (item) {
          var li = $("<div class=\"ktviptv-program selector\"><div class=\"ktviptv-program__time\">".concat(Lampa.Utils.parseTime(item.start).time, "</div><div class=\"ktviptv-program__body\">    <div class=\"ktviptv-program__title\">").concat(item.title, "</div></div></div>"));
          

          
          
          li.on('hover:focus', function (e, is_mouse) {
            element_last_focus = li[0];
            if (!is_mouse) scroll_details.update(li, true);
          });
          
          
          body.find('.ktviptv-details__program-list').append(li);
          
if ( Lampa.Platform.desktop() || Lampa.Platform.is('apple') || Lampa.Platform.screen('mobile')) {
//$('body').find('.ktviptv-details').remove();
}
          //Lampa.Platform.is('browser') || Lampa.Platform.get()
        });
        return body;
      };

      this.details = function (channel) {
        var _this2 = this;

        html_details.find('.ktviptv-details__title').text(channel.name);
        var prog = html_details.find('.ktviptv-details__program').empty();
        var load = $('<div class="ktviptv-details__program-loading">' + Lampa.Lang.translate('loading') + '...</div>');
        prog.append(load);
        scroll_details.reset();

        if (channel.id) {
          var draw = function draw(data) {
            if (data.result) {
              load.remove();

              var now = _this2.program(Lampa.Lang.translate('kiptv_now'), data.result.slice(0, 1));

              var later = _this2.program(Lampa.Lang.translate('kiptv_later'), data.result.slice(1));

              prog.append(now).append(later);
              
            } else {
              load.remove();
            }
          };

          if (program_last_result.name == channel.name) draw(program_last_result.data);else {
            var date = new Date(),
                time = date.getTime(),
                ofst = parseInt((localStorage.getItem('time_offset') == null ? 'n0' : localStorage.getItem('time_offset')).replace('n', ''));
            date = new Date(time + ofst * 1000 * 60 * 60);
            var offset = channel.name.match(/([+|-]\d)$/);

            if (offset && channel.similar) {
              date.setHours(date.getHours() + parseInt(offset[1]));
            }

            api.program({
              channel_id: channel.id,
              channel_epg: channel.idepg,
              time: date.getTime()
            }, function (data) {
              program_last_result.idepg = channel.idepg;
              program_last_result.data = data;
              program_last_result.name = channel.name;

              if (offset && channel.similar) {
                data.result.forEach(function (item) {
                  item.start = item.start - parseInt(offset[1]) * 3600000;
                  item.stop = item.stop - parseInt(offset[1]) * 3600000;
                });
              }

              draw(program_last_result.data);
            });
          }
        } else {
          load.remove();
        }
      };

      this.removeIco = function (channel) {
        var ico = channel.data('ico');
        ico.onerror = null;
        ico.onload = null;
        ico.src = '';
      };

      this.channelsDisplay = function (prev_focus, need_focus) {
        var _this3 = this;

        var limit = 300;
        var position = channels_page * limit;
        var start = Math.max(0, position - limit);
        var channels = channels_list.slice(start, position + limit + 4);
        var last_focus = 0;
        var favorites = this.getFavorites();
        html_channels.find('.selector').each(function () {
          var channel = $(this);

          if (!channels.find(function (a) {
            return a.index == channel.data('position');
          })) {
            _self.removeIco(channel);

            channel.remove();
          }
        });

        var createPlaylist = function createPlaylist(current) {
          var playlist = [];
          var index = channels_list.indexOf(current);
          var start = Math.max(0, index - 50);
          var end = 100 - (index - start);
          channels_list.slice(start, index + end).forEach(function (item) {
            var cell = {
              title: item.name,
              url: item.url,
              tv: true,
              iptv: true,
              callback: function callback() {
                Lampa.Player.playlist(createPlaylist(item));
              }
            };

            if (item.logo) {
              cell.icon = '<img style="height: auto !important;" src="' + item.logo + '" />';
              cell.template = 'selectbox_icon';
            }

            playlist.push(cell);
          });
          return playlist;
          
        };

        channels.forEach(function (item) {
          if (html_channels.find('[data-position="' + item.index + '"]').length) return;
          var in_favorite = favorites.indexOf(item.name) >= 0;
          var channel = $('<div class="ktviptv-channel selector" data-position="' + item.index + '"><div class="ktviptv-channel__body"><img src="" class="ktviptv-channel__ico" /></div></div>');
          var ico = channel.find('.ktviptv-channel__ico')[0];

          ico.onerror = function () {
            channel.find('.ktviptv-channel__body').empty().append('<div class="ktviptv-channel__name">' + item.name + '</div>');
          };

          ico.onload = function () {
            channel.addClass('loaded');
          };

          channel.data('ico', ico);
          channel.toggleClass('favorite', in_favorite);
          channel.on('hover:enter', function () {
            var playlist = createPlaylist(item);
            Lampa.Player.play({
              title: item.name,
              url: item.url,
              tv: true,
              iptv: true
            });

            Lampa.Player.playlist(playlist);
            Lampa.Player.opened() && "ktviptv" == Lampa.Activity.active().component && (Lampa.Keypad.listener.destroy(), Lampa.Keypad.listener.follow("keydown", (function(e) {
                var a = e.code;
                Lampa.Player.opened() && (428 !== a && 34 !== a || Lampa.PlayerPlaylist.prev(), 427 !== a && 33 !== a || Lampa.PlayerPlaylist.next())
        }
    )))
            
//Что-то новое крутое))
var hlsMethodOrign = Lampa.Storage.get('player_hls_method');
var hlsMethodKulik = Lampa.Storage.field('kulikhls_method');
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodKulik);
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodOrign);
//крутое кончилось)
            
            var cdn_v1_potok = item.url;
            var v1_cdnDomain = cdn_v1_potok.substring(0, cdn_v1_potok.indexOf('/', cdn_v1_potok.indexOf('//') + 2));
            var v1__potok;
            if (cdn_v1_potok.includes('/channel/')) {
                v1__potok = cdn_v1_potok.split("/channel")[1].split("/")[1];
            } else {
            var cdnv1match = cdn_v1_potok.match(/\/(\d+)\//);
            if (cdnv1match && cdnv1match.length > 1) {
            var cdnv1numbers = cdnv1match[1];
            v1__potok = cdnv1numbers;
            }  }
            console.log('KulikTV', '(v1) CDN-Сервер ·····', v1_cdnDomain + ' ⇔ (v1 Поток) ····· ', v1__potok);
            console.log('KulikTV', '(v1) Включили: ', item.name);
            if (hlsMethodKulik === 'hlsjs') {
                console.log('KulikTV', 'обработка: Ламповая');
            } else {
                console.log('KulikTV', 'обработка: Системная');
            }
            
          });
          channel.on('hover:long', function () {
            Lampa.Select.show({
              title: Lampa.Lang.translate('title_action'),
              items: [{
                title: in_favorite ? Lampa.Lang.translate('iptv_remove_fav') : Lampa.Lang.translate('iptv_add_fav')
              }],
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');

                if (in_favorite) {
                  Lampa.Arrays.remove(favorites, item.name);
                } else {
                  favorites.push(item.name);
                }

                in_favorite = !in_favorite;
                channel.toggleClass('favorite', in_favorite);

                _this3.updateFavorites(favorites);

                favorites = _this3.getFavorites();
                html_menu.find('.favorites--menu-item').eq(0).data('update')();
                Lampa.Controller.toggle('content');
              },
              onBack: function onBack() {
                Lampa.Controller.toggle('content');
              }
            });
          });
          
          
          channel.on('hover:focus', function (e, is_mouse) {
            var page = Math.round(item.index / limit);
            if (page != channels_page && !is_mouse) {
              channels_page = page;

              _this3.channelsDisplay(last_focus, item.index);
            } else {
             if (!is_mouse) scroll_channels.update(channel);

              _this3.details(item);

              last_focus = item.index;
              element_last_focus = channel[0];
              html_channels.find('.last--focus').removeClass('last--focus');
              channel.addClass('last--focus');
            }
          });
          
          
          channel.on('hover:hover', function (e, is_mouse) {
            var page = Math.round(item.index / limit);
            if (page != channels_page && !is_mouse) {
              channels_page = page;

              _this3.channelsDisplay(last_focus, item.index);
            } else {
             if (!is_mouse);

              _this3.details(item);

              last_focus = item.index;
              element_last_focus = channel[0];
              html_channels.find('.last--focus').removeClass('last--focus');
              channel.addClass('last--focus');
            }
          });
          
          
          
          
          if (item.logo) ico.src = item.logo;else ico.onerror();
          html_channels.append(channel);
        });
        html_channels.find('.selector').sort(function (a, b) {
          return $(a).attr('data-position') - $(b).attr('data-position');
        }).appendTo(html_channels);
        var focus = need_focus || 0;
        Lampa.Controller.collectionSet(this.render());

        if (typeof need_focus !== 'undefined') {
          Lampa.Controller.collectionFocus(html_channels.find('[data-position="' + focus + '"]')[0], this.render());
        } else {
          scroll_channels.update(html_channels.find('[data-position="0"]'));
          this.details(channels[0]);
        }
      };

      this.channels = function (channels) {
        channels_list = channels.map(function (a, i) {
          a.index = i;
          return a;
        });
        channels_page = 0;
        html_channels.find('.selector').each(function () {
          _self.removeIco($(this));
        });
        html_channels.empty();
        scroll_channels.reset();
        this.channelsDisplay();
      };

      this.build = function (data) {
        var _this4 = this;

        html.empty();
        html_menu.find('.ktviptv-menu__title').text(data.name || Lampa.Lang.translate('player_playlist'));
        var favorites = this.getFavorites();
        Lampa.Arrays.insert(data.playlist.menu, 0, {
          name: Lampa.Lang.translate('settings_input_links'),
          count: favorites.length,
          favorites: true
        });
        data.playlist.menu.forEach(function (menu, i) {
          if (menu.count == 0 && !menu.favorites) return;
          var li = $('<div class="ktviptv-menu__list-item selector">' + (menu.name || Lampa.Lang.translate('iptv_all_channels')) + '<span>' + menu.count + '</span></div>');

          if (menu.favorites) {
            li.addClass('favorites--menu-item');
            li.data('update', function () {
              favorites = _this4.getFavorites();
              menu.count = favorites.length;
              li.find('span').text(menu.count);
            });
          }

          li.on('hover:enter', function (e, is_mouse) {
            if (menu.count == 0) return;

            if (menu.favorites) {
              _this4.channels(data.playlist.channels.filter(function (a) {
                return favorites.find(function (b) {
                  return b == a.name;
                });
              }));
            } else {
              _this4.channels(menu.name ? data.playlist.channels.filter(function (a) {
                return a.group == menu.name;
              }) : data.playlist.channels);
            }

            html_menu.find('.active').removeClass('active');
            li.addClass('active');
            Lampa.Controller.collectionFocus(li[0], html_menu);
            html_details.find('.ktviptv-details__group').text(menu.name || Lampa.Lang.translate('iptv_all_channels'));
          });
          li.on('hover:focus', function () {
            scroll_menu.update(li, true);
            element_last_focus = li[0];
            html_menu.find('.last--focus').removeClass('last--focus');
            li.addClass('last--focus');
          });
          html_menu.find('.ktviptv-menu__list').append(li);
        });
        html_menu.find('.ktviptv-menu__list .selector').eq(favorites.length ? 0 : 1).trigger('hover:enter').trigger('hover:focus');
        scroll_menu.append(html_menu);
        scroll_menu.minus();
        scroll_channels.append(html_channels);
        scroll_channels.minus();
        scroll_details.append(html_details);
        scroll_details.minus();
        html_content.find('.ktviptv-content__menu').append(scroll_menu.render());
        html_content.find('.ktviptv-content__channels').append(scroll_channels.render());
        
        
        if (window.innerWidth < 600) html_content.find('.ktviptv-content__details').remove(); else {
        html_content.find('.ktviptv-content__details').append(scroll_details.render());
        }
        
        html.append(html_content);
        this.activity.loader(false);
        this.start = this.controllerChannels.bind(this);
        this.activity.toggle();
      };

      this.back = function () {
        Lampa.Activity.backward();
      };

      this.toZone = function (dir) {
        zone = Math.max(-1, Math.min(2, zone + dir));

        if (zone == -1) {
          Lampa.Controller.toggle('menu');
          zone = 0;
        } else if (zone == 0) {
          var last = html_menu.find('.last--focus');
          Lampa.Controller.collectionSet(html_menu);
          Lampa.Controller.collectionFocus(last.length ? last[0] : false, html_menu);
        } else if (zone == 1) {
          var _last = html_channels.find('.last--focus');

          Lampa.Controller.collectionSet(html_channels);
          Lampa.Controller.collectionFocus(_last.length ? _last[0] : false, html_channels);
        } else {
          var any = html_details.find('.selector');
          Lampa.Controller.collectionSet(html_details);
          Lampa.Controller.collectionFocus(any.length ? any[0] : false, html_details);
        }
      };

      this.controllerChannels = function () {
        var _this5 = this;

        if (Lampa.Activity.active().activity !== this.activity) return;
        this.background();
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(_this5.render());
            Lampa.Controller.collectionFocus(element_last_focus, _this5.render());
          },
          left: function left() {
            _this5.toZone(-1);
									  
																 
															   
								 
											   
          },
          right: function right() {
            _this5.toZone(1);
							 
												   
												 
							  
							  
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
							  
											 
										   
							  
							   
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            Lampa.Activity.replace();
							  
									 
          }
        });
        Lampa.Controller.toggle('content');
      };

      this.controllerList = function () {
        var _this6 = this;

        if (Lampa.Activity.active().activity !== this.activity) return;
        this.background();
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(_this6.render());
            Lampa.Controller.collectionFocus(element_last_focus, _this6.render());
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else Lampa.Controller.toggle('right');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.start = function () {};

      this.pause = function () {};

      this.stop = function () {};

      this.render = function () {
        return html;
      };

      this.destroy = function () {
        api.destroy();
        html_channels.find('.selector').each(function () {
          _self.removeIco($(this));
        });
        scroll_menu.destroy();
        scroll_channels.destroy();
        scroll_details.destroy();
        if (scroll_list) scroll_list.destroy();
        channels_list = [];
        html.empty();
      };
    }
    
    

function kulikcdn(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var last;
      var items = [];
	var html = $('<div></div>');
	var body = $('<div class="kulikcdn category-full"></div>');
      var wait_parse_video = false;
      var filter = new Lampa.Filter(object);
      var filter_sources = [];
      this.create = function () {
        var _this = this;
        Lampa.Background.immediately('');
        var btn = filter.render().find('.torrent-filter');
        filter.render().find('.torrent-filter').append('<div style="-webkit-align-self: center; -ms-flex-item-align: center; align-self: center; font-size: 1.2em;"><span>Сервер</span> <span class="last_cat" style="background-color: rgba(255, 255, 255, 0.3); padding: 0 0.5em; border-radius: 0.2em; font-size: 1.1em;"></span></div>');
        
        
        //var cors_api = Lampa.Utils.protocol() === 'https://' ? 'https://api.kulik.uz' : 'http://nossl_api.kulik.uz';
        
        var api_cors = Lampa.Utils.protocol() + 'cdn.kulik.uz/api/';
        network["native"](api_cors + 'kulik_list?serv=oldstyle', function (data) {

          filter_sources = data.channels;
          var last_url = Lampa.Storage.get('kulik3_last_url', '');
          if (last_url) {
            filter_sources.forEach(function (a) {
              if (last_url.indexOf(a.playlist_url) >= 0) a.selected = true;
            });
          }
          if (!filter_sources.find(function (a) {
            return a.selected;
          })) filter_sources[1].selected = true;
          _this.build();
          _this.load(Lampa.Storage.get('kulik3_last_url', '') || filter_sources.find(function (a) {
            return a.selected;
          }).playlist_url);
        }, function () {
          var empty = new Empty();
          html.append(empty.render());
          _this.start = empty.start;
          _this.activity.loader(false);
          _this.activity.toggle();
        });
        return this.render();
      };
      this.clear = function () {
        wait_parse_video = false;
        object.page = 1;
        last = false;
        items = [];
        body.empty();
        scroll.reset();
        this.activity.loader(false);
      };
      this.load = function (url) {
        var _this2 = this;
        this.activity.loader(true);
        network["native"](url, function (data) {
          Lampa.Storage.set('kulik3_last_url', url);
          _this2.clear();
          _this2.append(data.list);
          _this2.updateFilter(data.menu);
          _this2.activity.toggle();
        }, function () {
          _this2.clear();
          var empty = Lampa.Template.get('list_empty');
          empty.css('padding-left', '0.75em');
          body.append(empty);

									   
															   
														
													 
																						  
          _this2.activity.toggle();
        });
      };
      this.append = function (data) {
        var _this4 = this;
        data.forEach(function (element) {
          var card = Lampa.Template.get('card', {
            title: element.name
          });
          card.addClass('kulikcdn card--collection');
          card.find('.card__img').attr('src', element.picture);
          card.find('.card__age').remove();
          if (element.group) card.find('.card__view').append('<div class="card__quality"><div>' + element.group + '</div></div>');
          //if (element.servcdn) card.find('.card__view').append('<div class="card__type">' + element.servcdn + '</div>');
          
          //console.log('KulikTV', 'грузим логотип:', element.picture);
          
          $('.last_cat').text(element.servcdn);
          card.on('hover:focus', function () {
            last = card[0];
            scroll.update(card, true);
            var maxrow = Math.ceil(items.length / 7) - 1;
            //if (Math.ceil(items.indexOf(card) / 7) >= maxrow) _this4.next();
          });
          card.on('hover:enter', function () {
        var video = {
            title: element.name,
            url: element.video,
          tv: true, iptv: true
        };
        
        
        var playlist = [],
        i = 1;
        data.forEach((function(a) {
            playlist.push({
                title: a.name,
                url: a.video,
           tv: true, iptv: true
            }), i++
        })), video['playlist'] = playlist;
        
//Что-то новое крутое))
var hlsMethodOrign = Lampa.Storage.get('player_hls_method');
var hlsMethodKulik = Lampa.Storage.field('kulikhls_method');
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodKulik);
video.iptv = true;
Lampa.Player.play(video);
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodOrign);
        if (hlsMethodKulik === 'hlsjs') {
            console.log('KulikTV', 'обработка: Ламповая');
        } else {
            console.log('KulikTV', 'обработка: Системная');
        }
//крутое кончилось)

        Lampa.Player.playlist(playlist);
        Lampa.Player.opened() && "kulikcdn" == Lampa.Activity.active().component && (Lampa.Keypad.listener.destroy(), Lampa.Keypad.listener.follow("keydown", (function(e) {
            var a = e.code;
            Lampa.Player.opened() && (428 !== a && 34 !== a || Lampa.PlayerPlaylist.prev(), 427 !== a && 33 !== a || Lampa.PlayerPlaylist.next())
        }
    )));
        
            var oldcdn_url = element.video;
            var oldcdnDomain = oldcdn_url.substring(0, oldcdn_url.indexOf('/', oldcdn_url.indexOf('//') + 2));
            var oldcdn_potok;
            if (oldcdn_url.includes('/channel/')) {
                oldcdn_potok = oldcdn_url.split("/channel")[1].split("/")[1];
            } else {
            var oldcdnmatch = oldcdn_url.match(/\/(\d+)\//);
            if (oldcdnmatch && oldcdnmatch.length > 1) {
            var oldcdnnumbers = oldcdnmatch[1];
            oldcdn_potok = oldcdnnumbers;
            }  }
            console.log('KulikTV', '(old) CDN-Сервер ·····', oldcdnDomain, ' ⇔ (old) Поток ····· ', oldcdn_potok);
            console.log('KulikTV', '(old) Включили: ', element.name);
    });
          body.append(card);
          items.push(card);
        });
      };
      this.biuldFilter = function () {
        var _this5 = this;
        filter.render().removeClass('scroll--nopadding').find('.filter--search,.filter--sort').remove();
        filter.render().find('.selector').on('hover:focus', function (e) {
          last = e.target;
        });
        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (b) _this5.load(b.playlist_url);
            setTimeout(Lampa.Select.close, 10);
          }
        };
        filter.onBack = function () {
          Lampa.Controller.toggle('content');
        };
        this.updateFilter([]);
      };
      this.updateFilter = function (data) {
        var filter_items = [{
          title: Lampa.Lang.translate('kulik_server'), 
          subtitle: filter_sources.find(function (a) {
            return a.selected;
          }).title,
          items: filter_sources
        }];
        if (data) {
          data.forEach(function (menu) {
            if (!menu.search_on) {
              var title = menu.title.split(':')[0];
              var subti = menu.title.split(':')[1].trim();
              if (menu.submenu) {
                menu.submenu.forEach(function (a) {
                  if (a.playlist_url == Lampa.Storage.get('kulik3_last_url', '')) {
                    a.selected = true;
                    subti = a.title;
                  }
                });
              }
              filter_items.push({
                title: title,
                subtitle: subti,
                items: menu.submenu
              });
            }
          });
        }
        filter.set('filter', filter_items);
        this.updateFilterSelected();
      };
      this.updateFilterSelected = function () {
        filter.chosen('filter', filter.get('filter').map(function (a) {
          return a.title + ': ' + a.subtitle;
        }));
      };
      this.build = function () {
        scroll.minus();
        html.append(scroll.render());
        this.biuldFilter();
        scroll.append(filter.render());
        scroll.append(body);
      };
      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        Lampa.Controller.toggle('content');
      };
      this.pause = function () {};
      this.stop = function () {};
      this.render = function () {
        return html;
      };
      this.destroy = function () {
        network.clear();
        scroll.destroy();
        html.remove();
        items = [];
      };
    }
 



function cors2new(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
    var last;
    var items = [];
    var html = $('<div></div>');
      var body = $('<div class="cors2new kulicategory-full"></div>');
      var wait_parse_video = false;
      var filter = new Lampa.Filter(object);
      var filter_sources = [];
      this.create = function () {
        var _this = this;
        Lampa.Background.immediately('');
        var btn = filter.render().find('.torrent-filter');
        filter.render().find('.torrent-filter').append('<div style="-webkit-align-self: center; -ms-flex-item-align: center; align-self: center; font-size: 1.2em;"><span>Сервер</span> <span class="last_cat" style="background-color: rgba(255, 255, 255, 0.3); padding: 0 0.5em; border-radius: 0.2em; font-size: 1.1em;"></span></div>');
        
        //var cors2_api = Lampa.Utils.protocol() === 'https://' ? 'https://api.kulik.uz' : 'http://nossl_api.kulik.uz';
        var cors22_api = Lampa.Utils.protocol() + 'cdn.kulik.uz/api/';
        console.log('KulikTV', 'Используется cors2-API:', cors22_api);
        
        network["native"](cors22_api + 'kulik_list?serv=oldstyle', function (data) {
          filter_sources = data.channels;
          var last_url = Lampa.Storage.get('cors30new_serv_url', '');
          if (last_url) {
            filter_sources.forEach(function (a) {
              if (last_url.indexOf(a.playlist_url) >= 0) a.selected = true;
            });
          }
          if (!filter_sources.find(function (a) {
            return a.selected;
          })) filter_sources[1].selected = true;
          _this.build();
          _this.load(Lampa.Storage.get('cors30new_serv_url', '') || filter_sources.find(function (a) {
            return a.selected;
          }).playlist_url);
        }, function () {
          var empty = new Empty();
          html.append(empty.render());
          _this.start = empty.start;
          _this.activity.loader(false);
          _this.activity.toggle();
        });
        return this.render();
      };
      this.clear = function () {
        wait_parse_video = false;
        object.page = 1;
        last = false;
        items = [];
        body.empty();
        scroll.reset();
        this.activity.loader(false);
      };
      this.load = function (url) {
        var _this2 = this;
        this.activity.loader(true);
        network["native"](url, function (data) {
          Lampa.Storage.set('cors30new_serv_url', url);
          _this2.clear();
          _this2.append(data.list);
          _this2.updateFilter(data.menu);
          _this2.activity.toggle();
        }, function () {
          _this2.clear();
          var empty = Lampa.Template.get('list_empty');
          empty.css('padding-left', '0.75em');
          body.append(empty);
          _this2.activity.toggle();
        });
      };
      this.append = function (data) {
        var _this4 = this;
        data.forEach(function (element) {
    var card = Lampa.Template.get('cors2new', {
            title: element.name
          });

function updateEpgData() {
  var loadImage = function(url) {
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function() {
        reject();
      };
      img.src = url;
    });
  };
  var logoImage = '<img class="channel_item_icon_image kulicard__img" src="' + element.picture + '">';
  loadImage(element.picture)
    .then(function() {
      var logoDiv = '<div class="channel_item_icon">' + logoImage + '</div>';
      card.find('.channel_item_icon').replaceWith(logoDiv);
    })
    .catch(function() {
      console.log('Ошибка загрузки логотипа');
    });
  $.getJSON(Lampa.Utils.protocol() + 'api.kulik.uz/epg/now/' + element.epg_yos)
    .done(function(epg2data_now) {
      if (Array.isArray(epg2data_now) && epg2data_now.length > 0) {
        var item = epg2data_now[0];
        var epgStrtime = item.epg_strtime || '';
        var epgNowname = item.epg_nowname || '';
        var epgNowscreen = item.epg_nowscreen;
        if (epgNowscreen) {
          var streamImage = '<img class="channel_item_preview_image" src="' + epgNowscreen + '">';
          card.find('.getepgs_bg_ktv').html(streamImage);
          card.find('.getepgs_ktv').html('<div class="channel_item_icon">' + logoImage + '</div><p class="channel_item_date">' + epgStrtime + '<sup><small>мск</small></sup></p><p class="channel_item_name">' + epgNowname + '</p>');
        } else {
          var emptyImage = '<img class="channel_item_preview_image" src="http://lampa.mx/img/empty.svg">';
          card.find('.getepgs_bg_ktv').html(emptyImage);
          card.find('.getepgs_ktv').html('<div class="channel_item_icon">' + logoImage + '</div><p class="channel_item_date">∞</p><p class="channel_item_name">Нет данных</p>');
        }
      } else {
        var emptyImage = '<img class="channel_item_preview_image" src="http://lampa.mx/img/empty.svg">';
        card.find('.getepgs_bg_ktv').html(emptyImage);
        card.find('.getepgs_ktv').html('<div class="channel_item_icon">' + logoImage + '</div><p class="channel_item_date">∞</p><p class="channel_item_name">Нет данных</p>');
      }
    })
    .fail(function() {
      console.log('Ошибка загрузки информации о текущей передаче');
      var emptyImage = '<img class="channel_item_preview_image" src="http://lampa.mx/img/empty.svg">';
      card.find('.getepgs_bg_ktv').html(emptyImage);
      card.find('.getepgs_ktv').html('<div class="channel_item_icon">' + logoImage + '</div><p class="channel_item_date">∞</p><p class="channel_item_name">Нет данных</p>');
    });
}
updateEpgData(); // Выполнить первое обновление
var updateInterval = setInterval(function() {
  if ("cors2new" !== Lampa.Activity.active().component) {
    clearInterval(updateInterval);
  } else {
    updateEpgData();
  }
}, 60000);
         // if (element.group) card.find('.card__view').append('<div class="card__quality"><div>' + element.group + '</div></div>');
         // if (element.servcdn) card.find('.kulicard__view').append('<div class="card__type">' + element.servcdn + '</div>');
          
          $('.last_cat').text(element.servcdn);
          card.on('hover:focus', function () {
            last = card[0];
            scroll.update(card, true);
            var maxrow = Math.ceil(items.length / 7) - 1;
            //if (Math.ceil(items.indexOf(card) / 7) >= maxrow) _this4.next();
          });
          card.on('hover:enter', function () {
        var video = {
            title: element.name,
            url: element.video,
            tv: true, iptv: true
        };
        
        
        var playlist = [],
        i = 1;
        data.forEach((function(a) {
            playlist.push({
                title: a.name,
                url: a.video,
                tv: true, iptv: true
            }), i++
        })), video['playlist'] = playlist;

//Что-то новое крутое))
var hlsMethodOrign = Lampa.Storage.get('player_hls_method');
var hlsMethodKulik = Lampa.Storage.field('kulikhls_method');
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodKulik);
video.iptv = true;
Lampa.Player.play(video);
if (hlsMethodOrign !== hlsMethodKulik) Lampa.Storage.set('player_hls_method', hlsMethodOrign);
        if (hlsMethodKulik === 'hlsjs') {
            console.log('KulikTV', 'обработка: Ламповая');
        } else {
            console.log('KulikTV', 'обработка: Системная');
        }
//крутое кончилось)

        Lampa.Player.playlist(playlist);
        Lampa.Player.opened() && "cors2new" == Lampa.Activity.active().component && (Lampa.Keypad.listener.destroy(), Lampa.Keypad.listener.follow("keydown", (function(e) {
            var a = e.code;
            Lampa.Player.opened() && (428 !== a && 34 !== a || Lampa.PlayerPlaylist.prev(), 427 !== a && 33 !== a || Lampa.PlayerPlaylist.next())
        }
    )))
			
    });
          body.append(card);
          items.push(card);
        });
      };
      this.biuldFilter = function () {
        var _this5 = this;
        filter.render().removeClass('scroll--nopadding').find('.filter--search,.filter--sort').remove();
        filter.render().find('.selector').on('hover:focus', function (e) {
          last = e.target;
        });
        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (b) _this5.load(b.playlist_url);
            setTimeout(Lampa.Select.close, 10);
          }
        };
        filter.onBack = function () {
          Lampa.Controller.toggle('content');
        };
        this.updateFilter([]);
      };
      this.updateFilter = function (data) {
        var filter_items = [{
          title: Lampa.Lang.translate('kulik_server'),
          subtitle: filter_sources.find(function (a) {
            return a.selected;
          }).title,
          items: filter_sources
        }];
        if (data) {
          data.forEach(function (menu) {
            if (!menu.search_on) {
              var title = menu.title.split(':')[0];
              var subti = menu.title.split(':')[1].trim();
              if (menu.submenu) {
                menu.submenu.forEach(function (a) {
                  if (a.playlist_url == Lampa.Storage.get('cors30new_serv_url', '')) {
                    a.selected = true;
                    subti = a.title;
                  }
                });
              }
              filter_items.push({
                title: title,
                subtitle: subti,
                items: menu.submenu
              });
            }
          });
        }
        filter.set('filter', filter_items);
        this.updateFilterSelected();
      };
      this.updateFilterSelected = function () {
        filter.chosen('filter', filter.get('filter').map(function (a) {
          return a.title + ': ' + a.subtitle;
        }));
      };
      this.build = function () {
        scroll.minus();
        html.append(scroll.render());
        this.biuldFilter();
        scroll.append(filter.render());
        scroll.append(body);
      };
      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        Lampa.Controller.toggle('content');
      };
      this.pause = function () {};
      this.stop = function () {};
      this.render = function () {
        return html;
      };
      this.destroy = function () {
        network.clear();
        scroll.destroy();
        html.remove();
        items = [];
      };
    }   

  function startPlugin() {
    window.plugin_kktviptv_ready = true;
    var manifest = {
      type: 'video',
      version: '2.0.4.4',
      name: 'ТВ каналы',
      description: '',
      component: 'kktviptv'
    };

 
 
   /* OLD COMPONENT TV */
      Lampa.Component.add('ktviptv', KKulikComponent_old);
      Lampa.Template.add('ktv_iptv_content', "        <div class=\"ktviptv-content\">            <div class=\"ktviptv-content__menu\"></div>            <div class=\"ktviptv-content__channels\"></div>            <div class=\"ktviptv-content__details\"></div>        </div>    ");
      Lampa.Template.add('ktv_iptv_menu', "        <div class=\"ktviptv-menu\">            <div class=\"ktviptv-menu__body\">                <div class=\"ktviptv-menu__title\"></div>                <div class=\"ktviptv-menu__list\"></div>            </div>        </div>    ");
      Lampa.Template.add('ktv_iptv_channels', "        <div class=\"ktviptv-channels\">                    </div>    ");
      Lampa.Template.add('ktv_iptv_details', "        <div class=\"ktviptv-details\">            <div class=\"ktviptv-details__group\"></div>            <div class=\"ktviptv-details__title\"></div>            <div class=\"ktviptv-details__program\">            </div>        </div>    ");
      Lampa.Template.add('ktv_iptv_list', "        <div class=\"ktviptv-list layer--height\">            <div class=\"ktviptv-list__ico\">                <svg height=\"36\" viewBox=\"0 0 38 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">                    <rect x=\"2\" y=\"8\" width=\"34\" height=\"21\" rx=\"3\" stroke=\"white\" stroke-width=\"3\"/>                    <line x1=\"13.0925\" y1=\"2.34874\" x2=\"16.3487\" y2=\"6.90754\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>                    <line x1=\"1.5\" y1=\"-1.5\" x2=\"9.31665\" y2=\"-1.5\" transform=\"matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>                    <line x1=\"9.5\" y1=\"34.5\" x2=\"29.5\" y2=\"34.5\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>                </svg>            </div>            <div class=\"ktviptv-list__title\">#{kulik_select_server}</div>            <div class=\"ktviptv-list__items\"></div>        </div>    ");

   /* NEW COMPONENT TV */
    Lampa.Component.add('kktviptv', KKulikComponent);
	Lampa.Template.add('kktv2_iptv_content', "<div class=\"kktviptv-content\">    <div class=\"kktviptv-content__menu\"></div>    <div class=\"kktviptv-content__channels\"></div>    <div class=\"kktviptv-content__details\"></div></div>");
    Lampa.Template.add('kktv2_iptv_menu', "<div class=\"kktviptv-menu\"><div class=\"kktviptv-menu__body\">         <div class=\"kktviptv-menu__title\"></div>  <div class=\"kktviptv-menu__title_rek\"></div>        <div class=\"kktviptv-menu__list\"></div>    </div></div>");
    Lampa.Template.add('kktv2_iptv_channels', "<div class=\"kktviptv-channels\">    </div>");
    Lampa.Template.add('kktv2_iptv_details', "<div class=\"kktviptv-details layer--wheight\">    <div class=\"iptv-details__play\"></div>    <div class=\"iptv-details__title\"></div><div class=\"iptv-details__program\"></div></div>");
    Lampa.Template.add('kktv2_iptv_details_empty', "<div class=\"iptv-details-epmty endless endless-up\">    <div><span></span><span style=\"width: 60%\"></span></div>    <div><span></span><span style=\"width: 70%\"></span></div>    <div><span></span><span style=\"width: 40%\"></span></div>    <div><span></span><span style=\"width: 55%\"></span></div>    <div><span></span><span style=\"width: 30%\"></span></div>    <div><span></span><span style=\"width: 55%\"></span></div>    <div><span></span><span style=\"width: 30%\"></span></div></div>");
    Lampa.Template.add('kktv2_iptv_playlist_item', "<div class=\"iptv-playlist-item selector layer--visible layer--render\">    <div class=\"iptv-playlist-item__body\">        <div class=\"iptv-playlist-item__name\">            <div class=\"iptv-playlist-item__name-ico\"><span></span></div>            <div class=\"iptv-playlist-item__name-text\">est</div>        </div>        <div class=\"iptv-playlist-item__url\"></div>    </div><div class=\"iptv-playlist-item__footer hide\">        <div class=\"iptv-playlist-item__details details-left\"></div>        <div class=\"iptv-playlist-item__details details-right\"></div>    </div></div>");
    Lampa.Template.add('kktv2_iptv_list', "<div class=\"iptv-list layer--wheight\">    <div class=\"iptv-list__ico\">        <svg height=\"36\" viewBox=\"0 0 38 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">            <rect x=\"2\" y=\"8\" width=\"34\" height=\"21\" rx=\"3\" stroke=\"white\" stroke-width=\"3\"/>            <line x1=\"13.0925\" y1=\"2.34874\" x2=\"16.3487\" y2=\"6.90754\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>            <line x1=\"1.5\" y1=\"-1.5\" x2=\"9.31665\" y2=\"-1.5\" transform=\"matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>            <line x1=\"9.5\" y1=\"34.5\" x2=\"29.5\" y2=\"34.5\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>        </svg>    </div>    <div class=\"iptv-list__title\"></div>    <div class=\"iptv-list__text\"></div>    <div class=\"kktv2_iptv-list__items\"></div></div>");
    Lampa.Template.add('kktv2_iptv_list_empty', "<div class=\"iptv-list-empty selector\">    <div class=\"iptv-list-empty__text\"></div></div>");
    Lampa.Template.add('kktv2_iptv_param_lock', "<div class=\"iptv-param-lock\">    <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"512\" height=\"512\" viewBox=\"0 0 401.998 401.998\" xml:space=\"preserve\"><path d=\"M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z\" fill=\"currentColor\"></path></svg></div>");
																									

//OLDOLD Component
Lampa.Component.add('kulikcdn', kulikcdn);
//Cors NEW Component
Lampa.Component.add('cors2new', cors2new);

Lampa.Template.add('cors2new', "<div class=\"card selector layer--visible layer--render cors2new kulicard--collection channel_item\"> <div class=\"channel_item not_zoomed item_id_5 item_index_set_0\"><div class=\"channel_item_wrap\"><div class=\"channel_item_preview getepgs_bg_ktv\"> <div class=\"channel_item_preview_name kulicardtitle\">{title}</div></div><div class=\"channel_item_info has_schedule getepgs_ktv\"><div class=\"channel_item_icon\"><img class=\"channel_item_icon_image kulicard__img\" src=\"./img/img_load.svg\"></div> </div></div></div></div>  ");

//All Styles
Lampa.Template.add('kuliktv_stylecss', "<style>.kulicategory-full {display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-flex-wrap: wrap;-ms-flex-wrap: wrap;flex-wrap: wrap;padding: 0 1em;}.kulicategory-full .card{margin-left:0;padding-left:.5em;padding-right:.2em}              @media screen and (max-width:480px) {.kulicategory-full .card {padding-left: .375em;padding-right: .375em;}}.kulicategory-full__more {text-align: center;padding: 2em;margin-top: 1.5em;width: 100% ;} .kulicategory-full__more>span {font-size: 1.2em;}.kulicategory-full__more.focus {border-color: #fff;color: #000;}body.platform--orsay .kulicategory-full, body.platform--netcast .kulicategory-full {display: block } body.platform--orsay .kulicategory-full .card, body.platform--netcast .kulicategory-full .card {float: left }   body.platform--orsay .kulicategory-full .card__title, body.platform--netcast .kulicategory-full .card__title {min-height: 3.6em }    body.platform--orsay .kulicategory-full:after, body.platform--netcast .kulicategory-full:after {display: block;content:'';clear:both;} div.cors2new.selector.kulicard--collection.card--loaded.focus > div.channel_item {box-shadow: 0 0 0 0.2em #ffffff;} .cors2new.focus .channel_item::after, .cors2new.hover .channel_item::after {content:'';position: absolute;top: -.5em;left: -.5em;right: -.5em;bottom: -.5em;border: 0.1em solid #fff;-webkit-border-radius: 0.4em;-moz-border-radius:0.4em;border-radius: 0.4em;z-index: -1;pointer-events: none;}.cors2new.hover .channel_item::after {-webkit-transform:scale(1.05);transform:scale(1.05);box-shadow:0 0 10px 0 rgba(0,0,0,.3);z-index:2;border-color: rgb(255, 255, 255, .5);}                          @media screen and (min-width: 916px) and (hover: hover){.channel_item.not_zoomed:hover,.rowset_item:hover{-webkit-transform: scale(1.05);transform: scale(1.05);box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);z-index: 2}}@media screen and (max-width: 916px){.channel_item,.rowset_item{transition: box-shadow 0.3s, -webkit-transform 0.5s;transition: transform 0.5s, box-shadow 0.3s;transition: transform 0.5s, box-shadow 0.3s, -webkit-transform 0.5s;will-change: transform, box-shadow}.channel_item:active,.rowset_item:active{-webkit-transform: scale(1.05) translateY(-5rem);transform: scale(1.05) translateY(-5rem);box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3)}.rowset_item.promo-bg_block:active{-webkit-transform: none;transform: none;box-shadow: none}.rowset_item.channel_block.open_all{padding-bottom: calc(56.25% 40rem)}.page_slider_item_image_arrow{-webkit-transform: scale(0.7);transform: scale(0.7)}}:root{--window-edges: 60rem;--edges: 120rem;--item-amount: 6;--item-branded_button-amount: 7;--item-content-h-amount: 5;--item-margin: 10rem;--item-diff: 17rem}.items_slide .channel_item{margin: 0;padding: 0;width: auto;position: relative}.items_slide .packet_block,.items_slide .packet_block_wrap{margin: 0}.items_slide.t_branded_button{min-width: calc(14.28571vw - 34.14286rem);min-width: calc((100vw - var(--edges)) / var(--item-branded_button-amount) -var(--item-diff));width: calc(14.28571vw - 34.14286rem);width: calc((100vw - var(--edges)) / var(--item-branded_button-amount) -var(--item-diff))}@media screen and (min-width: 1025px) and (max-width: 1280px){:root{--edges: 100rem;--item-amount: 5;--item-branded_button-amount: 6;--item-content-h-amount: 4}}@media screen and (min-width: 801px) and (max-width: 1024px){:root{--window-edges: 40rem;--edges: 80rem;--item-amount: 4;--item-branded_button-amount: 5;--item-content-h-amount: 3}}@media screen and (min-width: 481px) and (max-width: 915px){:root{--window-edges: 40rem;--edges: 60rem;--item-amount: 3;--item-branded_button-amount: 4;--item-content-h-amount: 3}}@media screen and (max-width: 480px){:root{--window-edges: 32rem;--edges: 32rem;--item-amount: 2;--item-branded_button-amount: 3;--item-content-h-amount: 2;--item-margin: 5rem;--item-diff: 8.5rem}}.TVPlayer{display: flex;height: 100%;justify-content: center;align-items: center}.channel_item_preview .video_controls_unmute,.channel_zoomed .video_controls,.channel_zoomed .video_controls_overlay{display: none}.channel_zoomed .fullscreen .video_controls,.channel_zoomed .fullscreen .video_controls_overlay{display: block}.schedule_channel_cont > div{-ms-overflow-style: none;scrollbar-width: none;overscroll-behavior-y: contain}.schedule_channel_cont > div::-webkit-scrollbar{display: none}.schedule_channel{padding-top: 30rem;height: 150rem;text-align: center}.schedule_channel_logo{margin: 0 auto 5rem;width: 100rem;height: 56rem;border-radius: 5rem;background-color: var(--gray1);position: relative;overflow: hidden}.schedule_channel_logo_back{width: 100rem;height: 56rem;position: absolute;left: 0;top: 0}.schedule_channel_logo_image{width: 100rem;height: 56rem;position: relative}.schedule_channel_name{font-weight: 500;font-size: 18rem;line-height: 36rem;white-space: nowrap}.schedule_channel_head{color: var(--gray3)}.schedule_channel_switcher{margin-left: 10rem;margin-bottom: 10rem;display: grid;grid-template-columns: 40rem 1fr 40rem;grid-gap: 2rem;gap: 2rem}.schedule_channel_switcher .button{padding: 0;margin: 0;display: block}.schedule_channel_switcher .button:nth-child(2){margin: 0 10rem}.schedule_channel_switcher .button.unactive{opacity: 0.5;pointer-events: none}.schedule_channel_switcher .button.unactive .icon_next,.schedule_channel_switcher .button.unactive .icon_prev{margin-top: -4.5rem;width: 0;height: 0;background-color: var(--gray3);border: 4rem solid var(--gray3);display: inline-block;vertical-align: middle}.schedule_channel_item{width: 270rem;margin-bottom: 1rem;padding: 15rem 10rem;border-radius: 5rem;display: flex;cursor: pointer;position: relative;text-decoration: none;color: inherit}.schedule_channel_item:hover .schedule_channel_item_date,.schedule_channel_item:hover .schedule_channel_item_name{color: var(--gray5)}.schedule_channel_item_date{padding-top: 2rem;padding-right: 10rem;min-width: 60rem;font-weight: 500;color: var(--gray2);-webkit-user-select: none;user-select: none;font-size: 0.8em;box-sizing: border-box;white-space: nowrap}.schedule_channel_item_name{width: 210rem;font-weight: 300;line-height: 18rem;color: var(--gray4);-webkit-user-select: none;user-select: none;display: block}.schedule_channel_item_info{font-size: 0.8em;color: var(--gray3);display: block}.schedule_channel_item.unactive{cursor: default}.schedule_channel_item.unactive:hover .schedule_channel_item_date{color: var(--gray2)}.schedule_channel_item.unactive.active.playing:hover.schedule_channel_item_date{color: var(--gray5)}.schedule_channel_item.unactive .schedule_channel_item_name{color: var(--gray3)}.schedule_channel_item.active .schedule_channel_item_date,.schedule_channel_item.active .schedule_channel_item_name{color: var(--white)}.schedule_channel_item.playing{background: #14384d;cursor: default}.schedule_channel_item.playing .schedule_channel_item_date,.schedule_channel_item.playing .schedule_channel_item_name{color: var(--gray5)}.schedule_channel_item .item_progress{left: 0;right: 0;bottom: 0;border-radius: 0 0 5rem 5rem}@media screen and (max-width: 915px){.schedule_channel_switcher{margin-left: 0}.schedule_channel{height: 80rem;padding-top: 5rem}.schedule_channel_logo{float: left;margin-right: 15rem}.schedule_channel_head,.schedule_channel_name{text-align: left}}@media screen and (min-width: 481px) and (max-width: 915px){.schedule_channel_item_name{width: 100%}.page_viewer_info,.page_viewer_schedule{padding-left: 20rem;padding-right: 20rem}}@media screen and (max-width: 1024px){.modal_page.channel.content .page_viewer,.page_viewer{display: block}.on1024{display: none}.schedule_channel_item{width: calc(100% - 20rem)}.schedule_channel_item_name{width: auto}}@media screen and (max-width: 480px){.schedule_channel_item{width: calc(100% - 20rem)}.page_viewer .channel_item{flex-grow: 0;flex-shrink: 0;flex-basis: calc(49.4% - 10rem);width: 0;margin: 0 2.8% 10rem 0}}@media screen and (min-width: 481px) and (max-width: 915px){.page_viewer .channel_item{flex-grow: 0;flex-shrink: 0;flex-basis: calc(33% - 10rem);width: 0}.page_viewer .page_channel_items .channel_item{flex-grow: 0;flex-shrink: 0;flex-basis: calc(20% - 10rem)}}@media screen and (min-width: 1281px){.page_viewer .channel_item{flex-grow: 0;flex-shrink: 0;flex-basis: calc(25% - 20rem);width: 0}.page_viewer .page_channel_items .channel_item{flex-grow: 0;flex-shrink: 0;flex-basis: calc(20% - 20rem)}}@media screen and (max-width: 480px){.schedule_channel_item_name{width: 210rem}}@media screen and (min-width: 481px) and (max-width: 915px){.page_viewer.page_viewer_tv .page_channel_items .channel_item{flex-basis: calc(25% - 13rem)}}@media screen and (max-width: 1024px){.video_title_wrap{display: block}.video_buttons_channels{display: flex}.video_buttons_channels .button{width: 50%}.page_viewer_tv .video_buttons .button_favorites:first-child,.video_buttons_channels .button:first-child{margin-left: 0}.page_viewer_tv .page_channel_items{margin: 0 -14rem 0 0}.page_viewer_tv .page_description,.page_viewer_tv .page_viewer_info > :last-child{padding-bottom: 0}.page_viewer_tv .page_viewer_schedule{padding-left: 0}.page_viewer_tv .buttons_tabs{margin: -6rem 0 10rem}.page_viewer_tv .schedule_channel{height: 80rem}.page_viewer_tv .page_viewer_trigger .button{margin: 0}.page_viewer_tv .page_viewer_trigger .video_buttons_channels{margin-bottom: 10rem}.page_viewer_tv.page_viewer_trigger.video_buttons_channels.button:first-child{margin-right: 10rem}}.channel_item .modal_page_close,.modal_page.trailers .modal_page_content > .modal_page_close,.modal_page.watch .modal_page_content > .modal_page_close{display: none}:root{--dark-bg: #161616;--header-bg: rgba(14, 14, 14, 0.9);--blur-bg: rgba(14, 14, 14, 0.75);--notify-bg: rgba(14, 14, 14, 0.95);--black-bg: #000;--half-black: rgba(0, 0, 0, 0.5);--btn-bg: #1f1f1f;--white: #fff;--active-blue: #0284f3;--blue-contrast: #0075d8;--blue1: #00a1fe;--blue2: rgba(0, 161, 254, 0.5);--blue3: #2f4356;--blue4: #0074c8;--gray1: #333;--gray2: #4f4f4f;--gray3: #828282;--gray4: #bdbdbd;--gray5: #e0e0e0;--gray6: #f2f2f2;--gray7: #f0f0f0;--gray8: hsla(0, 0%, 51%, 0.5);--gray9: #aaa;--gray10: #313131;--gray11: #252525;--gray12: #222;--channel-bg: #2d2d2d;--progress-bg: hsla(0, 0%, 76.9%, 0.5);--overlay-bg: rgba(15, 15, 15, 0.9);--modal-bg: #303438;--input-bg: #202223;--red-bg: #eb5757;--channel-chosen-bg: #262626;--dark-green1: #26343e;--dark-green2: #1c272e;--dark-green3: #384d5c;--dark-green4: #6a7a85;--imdb: #f5c518;--kinopoisk: #f60;--error-red: #d13838;--default-size: 16px;-webkit-touch-callout: none}html{font-size: 1px}@media screen and (max-width: 480px){*{cursor: default !important;-webkit-tap-highlight-color: transparent}@viewport{width: 375px;min-zoom: 1;zoom: 1;max-zoom: 1;user-zoom: fixed}}@media screen and (min-width: 1920px){html{font-size: calc(0.0016px 0.052vw)}:root{--default-size: 16rem}}.item_progress{position: absolute;left: 12rem;right: 12rem;bottom: -14rem;height: 4rem;background-color: hsla(0, 0%, 76.9%, 0.5);background-color: var(--progress-bg);overflow: hidden;border-radius: 5rem;transition: opacity 0.2s;box-shadow: 0 1rem 2rem 0 #161616;box-shadow: 0 1rem 2rem 0 var(--dark-bg)}.rowset_item .item_progress{bottom: 12rem}.item_progress_line{position: absolute;left: 0;top: 0;height: 4rem;background-color: #0284f3;background-color: var(--active-blue);transition: left 0.2s}.page_movie_items .channel_item *{pointer-events: none}.channel_item{padding: 0 0 30rem;margin: 0 10rem;width: calc(16.66667% - 5rem);position: relative;cursor: pointer}.rowsets_plain.channels .channel_item .channel_item_preview{transition: box-shadow 0.2s ease 0.1s, -webkit-transform 0.2s ease 0.1s;transition: transform 0.2s ease 0.1s, box-shadow 0.2s ease 0.1s;transition: transform 0.2s ease 0.1s, box-shadow 0.2s ease 0.1s,-webkit-transform 0.2s ease 0.1s}.rowsets_plain.channels .channel_item:hover .channel_item_wrap{box-shadow: 0 0 10rem 0 rgba(0, 0, 0, 0.3);-webkit-transform: scale(1.02);transform: scale(1.02)}.rowsets_plain.channels .channel_item.current{pointer-events: none}.channel_item.current .channel_item_wrap{box-shadow: 0 0 0 2rem #0284f3;box-shadow: 0 0 0 2rem var(--active-blue)}.channel_item > .channel_item{margin: 0;padding: 0;width: 100%}.channel_item.not_zoomed{border-radius: 10rem}.channel_item.not_zoomed .channel_item_preview,.channel_item.not_zoomed .channel_item_preview .channel_item_preview_image{transition: 0.2s}.channel_item.channel_zoomed .channel_item_preview_image{-webkit-filter: none;filter: none}.channel_zoomed .TVPlayer{transition: 0.3s 0.2s}.page_slider_cont .channel_item{margin: 0;width: auto;position: relative}.channel_item .seo_link{position: absolute;left: 0;top: 0;width: 100%;height: 100%}.rowset_item_cont .channel_item{width: auto;margin: 0}.page_viewer .channel_item .icon_on_air{position: absolute;left: 5rem;top: 5rem}.channel_item_preview{background-color: #313131;background-color: var(--gray10);-webkit-animation: loading_bgr 2s linear infinite;animation: loading_bgr 2s linear infinite;padding-bottom: 56.25%;position: relative;overflow: hidden}.channel_item_preview .TVPlayer,.channel_item_preview_image{width: 101%;border-radius: 10rem 10rem 0 0;position: absolute;left: 0;right: 0;top: 0;bottom: 0;pointer-events: none}.channel_item_preview_name{position: absolute;left: 5rem;bottom: 5rem;color: transparent}.channel_item_info{background-color: #2d2d2d;background-color: var(--channel-bg);display: block;height: 50rem;border-radius: 0 0 10rem 10rem}.channel_item_info.has_schedule{display: grid;grid-template-areas: 'logo date' 'logo name';grid-template-columns:85rem 1fr}.channel_item_icon{width:78rem;height:45rem;grid-area: logo;text-align: center;background-color: #333;background-color: var(--gray1);border-radius: 0 0 0 10rem;display: flex;align-items: center;position: relative;overflow: hidden}.channel_item_icon_back{position: absolute;margin: 0 auto;left: 0;right: 0;top: 0;border-bottom-left-radius: 5rem}.channel_item_icon_back,.channel_item_icon_image{height: 100%;max-height: 100%;max-width: 100%;object-fit: cover;display: block}.channel_item_icon_image{margin: auto;position: relative}.channel_item_date{padding:0;color: #828282;color: var(--gray3);font-weight:500;font-size:13rem;line-height:14rem;grid-area: date}.channel_item_date,.channel_item_name{overflow: hidden;text-overflow: ellipsis;margin: inherit}.channel_item_name{padding:0 10rem 7rem;font-size:12rem;height: 50rem;line-height: 50rem;color: #e0e0e0;color: var(--gray5);grid-area: name;text-align: center}.channel_item_info.has_schedule .channel_item_name{padding: 0 7rem 3rem 0;height: auto;line-height: 15rem;text-align: left}.channel_zoomed{position: absolute;z-index: 2;transition: opacity 0.3s 0.15s}.channel_zoomed .channel_item_icon,.channel_zoomed .channel_item_icon_back,.channel_zoomed .channel_item_info{transition: border-radius 0.3s}.channel_item_preview_image .channel_item_icon_back,.channel_item_preview_image .channel_item_icon_image,.zoom-enter-done .channel_zoomed .channel_item_icon,.zoom-enter-done .channel_zoomed .channel_item_icon_back,.zoom-enter-done .channel_zoomed .channel_item_info{border-radius: 0}.zoom-enter-done .channel_zoomed,.zoom-enter-start .channel_zoomed,.zoom-enter .channel_zoomed{opacity: 1}.channel_zoomed .channel_item_wrap{overflow: hidden;border-radius: 10rem}.channel_zoomed .channel_item_info{position: relative;width: 95.5%;-webkit-transform: scale(1.05);transform: scale(1.05);-webkit-transform-origin: 0 0;transform-origin: 0 0;z-index: 1}.channel_zoomed .TVPlayer{opacity: 0;transition: opacity 0.2s 0.4s}.zoom-enter-done .channel_zoomed .TVPlayer{opacity: 1}.channel_zoomed .channel_item_controls{opacity: 0;transition: opacity 0.3s, -webkit-transform 0.3s;transition: opacity 0.3s, transform 0.3s;transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s}.zoom-enter-done .channel_zoomed .channel_item_controls{opacity: 1}.channel_item_wrap{transition: 0.3s ease-in;width: 100%;margin: 0;border-radius: 10rem;box-shadow: none;position: relative;left: 0;top: 0}.channel_item_controls{padding: 10rem;display: flex;background-color: #262626;background-color: var(--channel-chosen-bg);border-radius: 0 0 10rem 10rem}.channel_item_controls_col{margin-right: -20rem}.channel_item_controls_col .channel_item_controls_col{margin-right: 0;margin-left: auto}.channel_item_control{width: 35rem;height: 35rem;margin: 5rem;border-radius: 50%;display: inline-block;background-color: #595959}.channel_item_control.active{background-color: #fff;background-color: var(--white)}.channel_item_preview{border-radius: 10rem 10rem 0 0}.channel_item_preview .item_progress,.video_episode_item_preview .item_progress{box-shadow: 0 1rem 2rem 0 #161616;box-shadow: 0 1rem 2rem 0 var(--dark-bg);bottom: 12rem}.channel_item_lock_icon_big{position: absolute;left: 0;top: 0;width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.5);transition: opacity 0.5s;display: flex;align-items: center;justify-content: center;opacity: 0}.channel_item_lock_icon_big p{color: #f0f0f0;color: var(--gray7);font-weight: 500;font-size: 20rem;white-space: nowrap}.channel_item_not_available_icon{width: 13.5%;height: 25rem;background-repeat: no-repeat;position: absolute;top: 5rem;right: 5rem;background-size: contain}@media screen and (max-width: 700px){.channel_zoomed{display: none}}.channel_item_wrap .videoWrapper{pointer-events: none}.channel_item_wrap .video{background: transparent}.channel_item_wrap .video::-webkit-media-controls,.channel_item_wrap .video_controls_gradient{display: none !important}@media screen and (min-width: 1600px){.channel_item_lock_icon_big p{font-size: 26rem}}     @media screen and (max-width: 480px){.channel_item,.page_movie_item{padding-bottom: 0;margin-bottom: 10rem;width: calc(50% - 10rem)}.channel_item_info{height: 40rem}.channel_item_info.has_schedule{grid-template-columns: 77rem 1fr}.channel_item_icon{width: 67rem;height: 40rem}.channel_item_date{font-size:9rem;line-height:12rem}.channel_item_name{height:40rem;line-height:40rem;font-size:11rem}.channel_item_info.has_schedule .channel_item_name{padding-right: 7rem;line-height: 12rem}}   @media screen and (min-width: 481px) and (max-width: 915px){.channel_item,.page_movie_item{padding-bottom: 0;width: calc(33.33333% - 10rem)}.channel_item_info{height: 40rem}.channel_item_info.has_schedule{grid-template-columns: 77rem 1fr}.channel_item_icon{width: 67rem;height: 40rem}.channel_item_date{font-size:10rem;line-height:13rem}.channel_item_name{height:40rem;line-height: 40rem;font-size: 12rem}.channel_item_info.has_schedule .channel_item_name{padding-right: 7rem;line-height: 12rem}}@media screen and (max-width: 915px){:root{--default-size: 14rem}.account_block_content_bgr,.channel_item.not_zoomed,.channel_item_wrap,.items_slide > .rowset_item,.notify,.packet_block_wrap,.page_rowset_logo img,.page_slider_cont > .rowset_item,.page_slider_item_image,.page_viewer .page_movie_items .channel_item_preview,.rowset_item.branded_button_block .page_slider_item_image,.rowset_item.branded_button_block .page_slider_item_image_hover,.rowset_item.branded_button_block .page_slider_item_image_wrapper,.rowset_item:after{border-radius: 5rem}.channel_item_preview,.channel_item_preview .TVPlayer,.channel_item_preview_image{border-radius: 5rem 5rem 0 0}.channel_item_controls,.channel_item_info,.page_viewer .page_movie_items .channel_item_info{border-radius: 0 0 5rem 5rem}.channel_item_icon{border-radius: 0 0 0 5rem}.channel_item,.rowset_item_cont{margin: 5rem}}    @media screen and (min-width: 801px) and (max-width: 1024px){.channel_item,.page_movie_item{width: calc(25% - 10rem)}}       @media screen and (min-width: 916px) and (max-width: 1024px){.channel_item,.page_movie_item{width: calc(25% - 20rem)}}   @media screen and (min-width: 1025px) and (max-width: 1280px){.channel_item,.page_movie_item{width: calc(25% - 20rem)}}       @media screen and (min-width: 1281px){.channel_item,.page_movie_item{width:calc((100% / 6) - 10rem)}}   @media screen and (min-width: 1920px){.channel_item,.page_movie_item{width: calc(17.18% - 20rem);}}@media screen and (min-width: 916px) and (hover: hover){.rowset:hover .page_subhead_active_arrow{opacity: 1}.page_viewer .page_movie_items .channel_item:hover{box-shadow: none}.channel_item_control:hover{background-color: #bdbdbd;background-color: var(--gray4)}.channel_item_control.active:hover{background-color: #fff;background-color: var(--white)}}                                                                      @media screen and (max-width: 2560px){.kulikcdn_v2 .kulicard--collection{width: 14.2%}.kulikcdn_v2 .card__quality{right: 0;bottom: 0;font-size: 0.5em;left: 0}.kulikcdn_v2 .card__type{left: 0;top: 0;font-size: 0.62em}}@media screen and (max-width: 2160px){.kulikcdn_v2 .kulicard--collection{width: 12.5%}.kulikcdn_v2 .card__quality{right: 0;bottom: 0;font-size: 0.62em;left: 0}.kulikcdn_v2 .card__type{left: 0;top: 0;font-size: 0.62em}}@media screen and (max-width: 1560px){.kulikcdn_v2 .kulicard--collection{width: 24.8%}}@media screen and (max-width: 920px){.kulikcdn_v2 .kulicard--collection{width: 25%}}@media screen and (max-width: 580px){.kulikcdn_v2 .kulicard--collection{width: 33%}.index-module_slideItem__mHFQt.index-module_SmallStreamCard__hFzd6{width: 90%}.StreamCard-module__outputDate--gSddm{font-size: 11px;width: 40px}.Text-module__Text--7D26S{font-size: 13px}.kulicard__view{padding: 5px}.kulikcdn_view{width: 40px}.SubscribeLabel-module__SubscribeLabel--koopf{padding-left: 10px;font-size: 12px}.index-module_slideItem__mHFQt{padding: 0 0 5px}}@media screen and (max-width: 385px){.kulikcdn_v2 .kulicard--collection{width: 33.3%}}@media screen and (max-width: 360px){.kulikcdn_v2 .kulicard--collection{width: 50%}}.ktviptv-list{padding: 1.5em;display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: center;-webkit-justify-content: center;-moz-box-pack: center;-ms-flex-pack: center;justify-content: center;-webkit-box-orient: vertical;-webkit-box-direction: normal;-webkit-flex-direction: column;-moz-box-orient: vertical;-moz-box-direction: normal;-ms-flex-direction: column;flex-direction: column;padding-bottom: 1em}.ktviptv-list__ico{width: 4.5em;margin-bottom: 2em;height: 4.5em}.ktviptv-list__ico > svg{width: 4.5em;height: 4.5em}.ktviptv-list__title{font-size: 1.9em;margin-bottom: 1em}.ktviptv-list__items{width: 25%;margin: 0 auto}.ktviptv-list__items .scroll{height: 22em}.ktviptv-list__item{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;padding: 1em;background-color: rgba(255, 255, 255, 0.1);font-size: 1.3em;line-height: 1.3;-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em;margin: 1em;margin-top: auto}    @media screen and (max-width: 2560px){.ktviptv-channel__ico{width:75% !important;opacity: 0}.ktviptv-content__channels{width: 17% !important}.ktviptv-list__item-name{width: 100%;padding-right: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: left}.ktviptv-details__title{font-size: 2.8em}.ktviptv-content{font-size: 17px}}   .ktviptv-list__item-url{width: 60%;padding-left: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: right}.ktviptv-list__item.focus{background-color: #fff;color: black}.ktviptv-content{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;padding: 0 1.5em;line-height: 1.3;font-size: 14px}     @media screen and (max-width: 1930px){.ktviptv-list__item-name{width: 100%;padding-right: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: left}.ktviptv-details__program{font-size: 16px}.ktviptv-details__title{font-size: 2.8em}.ktviptv-content{font-size: 17px}}.ktviptv-list__item-url{width: 60%;padding-left: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: right}.ktviptv-list__item.focus{background-color: #fff;color: black}.ktviptv-content{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;padding: 0 1.5em;line-height: 1.3;font-size: 14px}     @media screen and (max-width: 1380px){.ktviptv-list__item-name{width: 100%}.ktviptv-content{font-size: 13px}.ktviptv-program{font-size: 1.0em}.ktviptv-content__menu{width: 30%;padding-right: 1em}.ktviptv-channel__ico{width: 70%}.ktviptv-content__channels{width: 20%}.ktviptv-channel{padding-bottom: 35%}.ktviptv-details__title{font-size: 2em}.ktviptv-content__details{width: 51%;padding-left: 1em}}      @media screen and (max-width: 1290px){.ktviptv-list__item-name{width: 100%}.ktviptv-content{font-size: 10px}.ktviptv-program{font-size: 1.1em}.ktviptv-content__menu{width: 30%;padding-right: 1em}.ktviptv-channel__ico{width: 60%}.ktviptv-content__channels{width: 20%}.ktviptv-channel{padding-bottom: 35%}.ktviptv-details__title{font-size: 2em}.ktviptv-content__details{width: 51%;padding-left: 1em}}    @media screen and (max-width: 960px){.ktviptv-list__item-name{width: 100%}.ktviptv-content{font-size: 10px}.ktviptv-program{font-size: 0.8em}.ktviptv-content__menu{width: 30%;padding-right: 1em}.ktviptv-channel__ico{width:55% !important}.ktviptv-content__channels{width: 20% !important}.ktviptv-channel{padding-bottom:45% !important}.ktviptv-details__title{font-size: 2.3em !important}.ktviptv-content__details{width: 44% !important;padding-left: 1em !important}}     @media screen and (max-width: 850px){.ktviptv-list__item-name{width: 100% !important}.ktviptv-content{font-size: 10px !important}.ktviptv-content__menu{width: 30% !important;padding-right: 1em !important}.ktviptv-channel__ico{width: 60% !important}.ktviptv-content__channels{width: 20% !important} .ktviptv-channel{padding-bottom: 50% !important}.ktviptv-details__title{font-size: 2em !important}.ktviptv-content__details{width: 44% !important;padding-left: 1em !important}}     @media screen and (max-width: 650px){.ktviptv-content{font-size: 10px !important}.ktviptv-menu__title{font-size: 2em !important;margin-bottom: 1em !important}.ktviptv-content__menu{width: 37% !important;padding-right: 0em !important}.ktviptv-list__items{width: 33% !important}.ktviptv-channel__ico{width: 55% !important}.ktviptv-content__channels{width: 30% !important}.ktviptv-content__details{width: 36% !important}.ktviptv-details__program{padding-top: 2em !important}}     @media screen and (max-width: 450px){.ktviptv-content__menu{width: 55% !important;padding-right: 0em !important}.ktviptv-list__items{width: 50% !important}.ktviptv-list__item-name{width: 100% !important}.ktviptv-channel__ico{width: 70% !important}.ktviptv-content__channels{width: 40% !important}}.ktviptv-content > div{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0}.ktviptv-content__menu{width: 25%;padding-right: 4em}.ktviptv-content__channels{width: 23%}.ktviptv-content__details{width: 40%;padding-left: 2em}.ktviptv-menu__title{font-size: 2.4em;font-weight: 300;margin-bottom: 1em}.ktviptv-menu__list-item{color: rgba(255, 255, 255, 0.6);font-size: 1.4em;font-weight: 300;position: relative;padding: 0.5em 0.8em;display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex}.ktviptv-menu__list-item > span{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;padding-left: 1em;margin-left: auto}.ktviptv-menu__list-item.active{color: #fff;background-color: rgba(255, 255, 255, 0.1);-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em}.ktviptv-menu__list-item.focus{color: #000;background-color: white;-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em}.ktviptv-menu__list > div div{margin-top: 0.3em}.ktviptv-channels{padding: 1em}.ktviptv-channel{background-color: #464646;-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;padding-bottom:65%;position: relative}.ktviptv-channel__body{position: absolute;top: 0;left: 0;right: 0;bottom: 0;display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: center;-webkit-justify-content: center;-moz-box-pack: center;-ms-flex-pack: center;justify-content: center;-webkit-box-orient: vertical;-webkit-box-direction: normal;-webkit-flex-direction: column;-moz-box-orient: vertical;-moz-box-direction: normal;-ms-flex-direction: column;flex-direction: column;padding: 1em}.ktviptv-channel__ico{width: 45%;opacity: 0}.ktviptv-channel__name{text-align: center;font-size: 1.2em}.ktviptv-channel.loaded .ktviptv-channel__ico{opacity: 1}.ktviptv-channel.favorite::after{content: '';position: absolute;top: 0.3em;right: 0.2em;background-image: url(./img/icons/menu/like.svg);background-repeat: no-repeat;background-position: 50% 50%;-webkit-background-size: 55% 55%;-moz-background-size: 55%;-o-background-size: 55%;background-size: 55%;-webkit-border-radius: 100%;-moz-border-radius: 100%;border-radius: 100%;width: 1.8em;height: 1.8em;margin-left: -0.9em}.ktviptv-channel.focus::before,.ktviptv-channel.last--focus::before{content: '';position: absolute;top: -0.5em;left: -0.5em;right: -0.5em;bottom: -0.5em;border: 0.3em solid #fff;-webkit-border-radius: 1.4em;-moz-border-radius: 1.4em;border-radius: 1.4em;opacity: 0.4}.ktviptv-channel.focus::before{opacity: 1}.ktviptv-channel .ktviptv-channel{margin-top: 1em}.ktviptv-details__group{font-size: 1.3em;margin-bottom: 0.9em;opacity: 0.5}.ktviptv-details__title{font-size: 2.5em;font-weight: 700}.ktviptv-details__program{padding-top: 1.1em}.ktviptv-details__program-title{font-size: 1.1em;padding-left: 4.9em;margin-bottom: 1em;opacity: 0.5}.ktviptv-program{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;font-size: 1.2em;font-weight: 300}.ktviptv-program__time{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;width: 5em;position: relative}.ktviptv-program.focus .ktviptv-program__time::after{content: '';position: absolute;top: 0.5em;right: 0.9em;width: 0.4em;background-color: #fff;height: 0.4em;-webkit-border-radius: 100%;-moz-border-radius: 100%;border-radius: 100%;margin-top: -0.1em;font-size: 1.2em}body.light--version .ktviptv-content{font-size: 0.9em}body.light--version .ktviptv-channel{-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em}body.light--version .ktviptv-channel::before{-webkit-border-radius: 0.6em;-moz-border-radius: 0.6em;border-radius: 0.6em}.iptv-list{padding: 1.5em;display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: center;-webkit-justify-content: center;-moz-box-pack: center;-ms-flex-pack: center;justify-content: center;-webkit-box-orient: vertical;-webkit-box-direction: normal;-webkit-flex-direction: column;-moz-box-orient: vertical;-moz-box-direction: normal;-ms-flex-direction: column;flex-direction: column;padding-bottom: 1em}.iptv-list__ico{width: 4.5em;margin-bottom: 2em;height: 4.5em}.iptv-list__ico > svg{width: 4.5em;height: 4.5em}.iptv-list__title{font-size: 1.9em;margin-bottom: 1em}.iptv-list__text{font-size: 1.2em;line-height: 1.4;margin-bottom: 1em;text-align: center;width: 60%;margin: 0 auto;margin-bottom: 2em}.kktv2_iptv-list__items{width: 50%;margin: 0 auto}.kktv2_iptv-list__items .scroll{height: 22em}.iptv-list__item{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;padding: 1em;background-color: rgba(255, 255, 255, 0.1);font-size: 1.3em;line-height: 1.3;-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em;margin: 1em}.iptv-list__item-name{width: 40%;padding-right: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: left}.iptv-list__item-url{width: 60%;padding-left: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: right}.iptv-list__item.focus{background-color: #fff;color: black}.iptv-playlist-item{padding: 1em;background-color: rgba(255, 255, 255, 0.1);line-height: 1.3;margin: 1em;-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;position: relative}.iptv-playlist-item__body{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center}.iptv-playlist-item__url{width: 60%;padding-left: 1em;overflow: hidden;-o-text-overflow: ellipsis;text-overflow: ellipsis;white-space: nowrap;text-align: right}.iptv-playlist-item__name{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;width: 40%}.iptv-playlist-item__name-ico{background-color: #fff;-webkit-border-radius: 0.5em;-moz-border-radius: 0.5em;border-radius: 0.5em;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;padding: 0.3em 0.5em;color: #000;min-width: 2.3em;text-align: center}.iptv-playlist-item__name-ico > span{font-size: 1.2em;font-weight: 900}.iptv-playlist-item__name-text{font-weight: 600;padding-left: 1em}.iptv-playlist-item__footer{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;margin-top: 1em;-webkit-box-pack: justify;-webkit-justify-content: space-between;-moz-box-pack: justify;-ms-flex-pack: justify;justify-content: space-between}.iptv-playlist-item__details{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex}.iptv-playlist-item__details div{margin-left: 2em}.iptv-playlist-item__label{color: rgba(255, 255, 255, 0.5)}.iptv-playlist-item__label > span{color: #fff}.iptv-playlist-item__label .iptv-playlist-item__label:before{content: '|';display: inline-block;margin: 0 1em;font-size: 0.7em;margin-top: -0.4em}.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after{content: '';position: absolute;top: -0.5em;left: -0.5em;right: -0.5em;bottom: -0.5em;border: 0.3em solid #fff;-webkit-border-radius: 1.4em;-moz-border-radius: 1.4em;border-radius: 1.4em;z-index: -1;pointer-events: none}.kktviptv-content{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;padding: 0 1.5em;line-height: 1.3}.kktviptv-content > div{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0}.kktviptv-content__menu{width: 30%;padding-right: 4em}.iptv-program__timeline{-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;background:rgba(255,255,255,0.1);margin-top:.9em}.iptv-program__timeline>div{height:.1em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;background:#fff;min-height:2px}@media screen and (max-width: 2500px){.kktviptv-program__timeline{width: 14.5% !important}.kktviptv-content__menu{font-size: 18px !important;padding-right: 2em !important;width: 24% !important}.kktviptv-content__channels{width: 19% !important}.kktviptv-channel.small--icon .kktviptv-channel__ico{width:9em !important}.kktviptv-content__details{width: 53% !important;padding-left: 2em !important}}@media screen and (max-width: 1370px){.kktviptv-content__menu{width: 28% !important}}@media screen and (max-width: 980px){.kktviptv-program__timeline{width: 16.8% !important}.kktviptv-content__menu{width: 38% !important;padding-right: 1em !important;font-size: 15px !important}.kktviptv-menu__title{font-size: 2em !important}.kktviptv-content__details{width: 50% !important}.iptv-program__picchann{width: 45% !important}}@media screen and (max-width: 960px){.kktviptv-content__menu{width: 34% !important}.kktviptv-content__details{width: 45% !important}.iptv-program__picchann{width: 40% !important}.kktviptv-program__timeline{width: 13% !important}  .kktviptv-channel.small--icon .kktviptv-channel__ico{width:6em !important}}   @media screen and (max-width: 900px){.kktviptv-content__menu{width: 28% !important}}.kktviptv-content__channels{width: 25%}.kktviptv-program__timeline{-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;background: rgba(255, 255, 255, 0.5);width: 10%;margin-top: 2px;display: block;padding: 2px;position: fixed}@media screen and (max-width: 900px){.kktviptv-content__channels{width: 27%}}@media screen and (max-width: 767px){.kktv2_iptv-list__items{width: 100%}}@media screen and (max-width: 767px){.iptv-list__text{width: 100%}}@media screen and (max-width: 480px){.iptv-playlist-item__details div{margin-left: 0;margin-top: 1em}}@media screen and (max-width: 480px){.iptv-playlist-item__footer{display: block}}.kktviptv-content__details{width: 45%;padding-left: 4em}.kktviptv-menu__title{font-size:2em;font-weight: 300;margin-bottom:0.4em} .kktviptv-menu__title_rek{font-size:0.7em;margin-bottom:0.7em;} .kktviptv-menu__list-item{color: rgba(255, 255, 255, 0.6);font-size: 1.4em;font-weight: 300;position: relative;padding: 0.5em 0.8em;display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex}.kktviptv-menu__list-item > span{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;padding-left: 1em;margin-left: auto}.kktviptv-menu__list-item.active{color: #fff;background-color: rgba(255, 255, 255, 0.1);-webkit-border-radius: 0.8em;-moz-border-radius: 0.8em;border-radius: 0.8em}.kktviptv-menu__list-item.focus{color: #000;background-color: white;-webkit-border-radius: 0.8em;-moz-border-radius: 0.8em;border-radius: 0.8em}.kktviptv-menu__list > div div{margin-top: 0.3em}.kktviptv-channels{padding: 1em;padding-left: 5em}.kktviptv-channel{background-color: #464646;-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;padding-bottom: 72%;position: relative}.kktviptv-channel__body{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: center;-webkit-justify-content: center;-moz-box-pack: center;-ms-flex-pack:center;justify-content: center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction: column;-moz-box-orient: vertical;-moz-box-direction: normal;-ms-flex-direction: column;flex-direction:column;padding:0;text-align: center}.kktviptv-channel__ico{width:80%;opacity:0;max-height:100%}.kktviptv-channel__name{text-align: center;font-size: 1.2em;overflow: hidden;display: -webkit-box;-webkit-line-clamp: 1;line-clamp: 1;-webkit-box-orient: vertical;max-height: 1.4em}.kktviptv-channel__simb{font-size: 4em;font-weight: 900;line-height: 0.7;margin-bottom: 0.4em}.kktviptv-channel__chn{position: absolute;top: 50%;right: 100%;margin-right: 0.5em;font-size: 1.9em;font-weight: 600;margin-top: -0.7em;opacity: 0.5}.kktviptv-channel.loaded .kktviptv-channel__ico{opacity: 1}.kktviptv-channel.full--icon .kktviptv-channel__body{padding:0;overflow: hidden;-webkit-border-radius: 1em;-moz-border-radius:1em;border-radius: 1em}.kktviptv-channel.full--icon .kktviptv-channel__ico{max-width:105%;width:105%;height:105%}.kktviptv-channel.small--icon .kktviptv-channel__ico{width: 6em;-webkit-border-radius: 0.7em;-moz-border-radius: 0.7em;border-radius: 0.7em}.kktviptv-channel.favorite::after{content: '';position: absolute;top: 0.3em;right: 0.2em;background-image: url(./img/icons/menu/like.svg);background-repeat: no-repeat;background-position: 50% 50%;-webkit-background-size: 55% 55%;-moz-background-size: 55%;-o-background-size: 55%;background-size: 55%;-webkit-border-radius: 100%;-moz-border-radius: 100%;border-radius: 100%;width: 1.8em;height: 1.8em;margin-left: -0.9em}.kktviptv-channel.focus::before,.kktviptv-channel.active::before{content: '';position: absolute;top: -0.5em;left: -0.5em;right: -0.5em;bottom: -0.5em;border: 0.3em solid #fff;-webkit-border-radius: 1.4em;-moz-border-radius: 1.4em;border-radius: 1.4em;opacity: 0.4}.kktviptv-channel.focus::before{opacity: 1}.kktviptv-channel .kktviptv-channel{margin-top: 1em}.iptv-details{padding-top: 3.5em;-webkit-mask-image: -webkit-gradient(linear,left top,left bottom,from(white),color-stop(92%, white),to(rgba(255, 255, 255, 0)));-webkit-mask-image: -webkit-linear-gradient(top,white 0,white 92%,rgba(255, 255, 255, 0) 100%);mask-image: -webkit-gradient(linear,left top,left bottom,from(white),color-stop(92%, white),to(rgba(255, 255, 255, 0)));mask-image: linear-gradient(to bottom,white 0,white 92%,rgba(255, 255, 255, 0) 100%)}.iptv-details__play{font-size: 1.3em;margin-bottom: 0.5em}.iptv-details__play .lb{background: rgba(255, 255, 255, 0.3);-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em;padding: 0 0.4em;margin-right: 0.7em}.iptv-details__play span:last-child{opacity: 0.5}.iptv-details__title{font-size: 3.3em;font-weight: 700}.iptv-details__program{padding-top: 3em}.iptv-details-epmty > div{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex}.iptv-details-epmty > div span{background-color: rgba(255, 255, 255, 0.18);-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em;height: 1em}.iptv-details-epmty > div span:first-child{width: 8%;margin-right: 3.2em}.iptv-details-epmty > div div{margin-top: 2em}.iptv-program{display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;font-size: 1.2em;font-weight: 300;position: relative}.iptv-program-date{font-size: 1.2em;padding-left: 4.9em;margin-bottom: 1em;opacity: 0.5}.iptv-program__time{-webkit-flex-shrink: 0;-ms-flex-negative: 0;flex-shrink: 0;width: 5em;position: relative}.iptv-program__descr{opacity: 0.5;margin-top: 0.7em}.iptv-program__picchann{width: 35%;float: left;margin-right: 10px;opacity: 0.6}.kktviptv-program__timeline{-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;background: rgba(255, 255, 255, 0.5);width: 10%;margin-top: 2px;display: block;padding: 2px;position: fixed}.kktviptv-program__timeline > div{height: 0.3em;-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em;background: #bb0019;min-height: 5px}.iptv-program__body{-webkit-box-flex: 1;-webkit-flex-grow: 1;-moz-box-flex: 1;-ms-flex-positive: 1;flex-grow: 1}.iptv-program.archive::after{content: '';position: absolute;top: 0.2em;left: 3.1em;width: 1em;height: 1em;background: url('./img/icons/menu/time.svg') no-repeat 50% 50%;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: contain}.iptv-program.played::after{content: '';position: absolute;top: 0.2em;left: 3.1em;width: 1em;height: 1em;background: url('./img/icons/player/play.svg') no-repeat 50% 50%;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: contain}.iptv-program.focus .iptv-program__time::after{content: '';position: absolute;top: 0;width: 2.4em;left: 0;background-color: rgba(255, 255, 255, 0.2);height: 1.4em;-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em}.iptv-list-empty{border: 0.2em dashed rgba(255, 255, 255, 0.5);display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-box-align: center;-webkit-align-items: center;-moz-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: center;-webkit-justify-content: center;-moz-box-pack: center;-ms-flex-pack: center;justify-content: center;height: 12em;-webkit-border-radius: 1em;-moz-border-radius: 1em;border-radius: 1em}.iptv-link{display: inline-block;padding: 0.1em 0.5em;-webkit-border-radius: 0.2em;-moz-border-radius: 0.2em;border-radius: 0.2em;background-color: rgba(255, 255, 255, 0.1)}.iptv-param-lock{position: absolute;top: 50%;right: 1.5em;margin-top: -1em;opacity: 0.5}.iptv-param-lock > svg{width: 2em;height: 2em}body.platform--orsay .kktviptv-menu__list-item{padding-right: 2.7em}body.platform--orsay .kktviptv-menu__list-item > span{position: absolute;top: 0.5em;right: 1em}body.light--version .kktviptv-content{font-size: 0.9em}body.light--version .kktviptv-channel{-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em}body.light--version .kktviptv-channel::before{-webkit-border-radius: 0.6em;-moz-border-radius: 0.6em;border-radius: 0.6em}.kktviptv-mobile .kktviptv-content{display: block !important;padding: 0 !important}.kktviptv-mobile .kktviptv-content__menu,.kktviptv-mobile .kktviptv-content__channels,.kktviptv-mobile .kktviptv-content__details{width: 100% !important;padding: 0 !important}.kktviptv-mobile .kktviptv-menu__list{display: -webkit-box !important;display: -webkit-flex !important;display: -moz-box !important;display: -ms-flexbox !important;display: flex !important;-webkit-box-align: center !important;-webkit-align-items: center !important;-moz-box-align: center !important;-ms-flex-align: center !important;align-items: center !important}.kktviptv-mobile .kktviptv-menu__list > div div{margin: 0 !important;margin-left: 0.5em !important}.kktviptv-mobile .kktviptv-menu__list-item{-webkit-flex-shrink: 0 !important;-ms-flex-negative: 0 !important;flex-shrink: 0 !important}.kktviptv-mobile .kktviptv-menu__title{display: none !important}.kktviptv-mobile .kktviptv-channels{display: -webkit-box !important;display: -webkit-flex !important;display: -moz-box !important;display: -ms-flexbox !important;display: flex !important;padding: 0 !important}.kktviptv-mobile .kktviptv-channel{padding-bottom: 0 !important;-webkit-flex-shrink: 0 !important;-ms-flex-negative: 0 !important;flex-shrink: 0 !important;width: 14em !important;height: 10em !important}@media screen and (max-width: 500px){.kktviptv-program__timeline{width: 26.5% !important}.kktviptv-mobile .kktviptv-channel{width: 11em !important;height: 8em !important}.kktviptv-mobile .iptv-details__title{font-size: 2.5em !important}.kktviptv-content__menu{font-size: 12px !important}}@media screen and (max-width: 400px){.kktviptv-mobile .kktviptv-channel{width: 11em !important;height: 8em !important}.kktviptv-mobile .kktviptv-channel .kktviptv-channel__simb{font-size: 3.2em !important}}@media screen and (max-width: 380px){.kktviptv-content__menu{font-size: 10px !important}.kktviptv-mobile .kktviptv-channel__chn{display: none !important}.kktviptv-mobile .kktviptv-channel .kktviptv-channel{margin: 0 !important;margin-left: 1em !important}.kktviptv-mobile .kktviptv-content__details{padding: 0 1.5em !important}.kktviptv-mobile .iptv-details{padding-top: 0 !important;height: 48vh !important}}.kktviptv-mobile .kktviptv-channel__chn{display: none !important}.kktviptv-mobile .kktviptv-channel .kktviptv-channel{margin: 0 !important;margin-left: 1em !important}.kktviptv-mobile .kktviptv-content__details{padding: 0 1.5em !important}.kktviptv-mobile .iptv-details{padding-top: 0 !important;height: 48vh !important}                                                  @media screen and (max-width: 2560px) {.kulikcdn .card--collection {width: 14.2%;}  .kulikcdn .card__view {padding-bottom: 75%;}  .kulikcdn img {object-fit: contain;}   .kulikcdn .card__quality {right:0;bottom:0;font-size:.5em;left:0;width: max-content;}.kulikcdn .card__type {left:0;top:0;font-size:.62em;}}@media screen and (max-width: 2160px) {.kulikcdn .card--collection {width: 12.5%;}.kulikcdn .card__quality {right:0;bottom:0;font-size:.5em;left:0;width: max-content;}.kulikcdn .card__type {left:0;top:0;font-size:.62em;}}@media screen and (max-width: 1560px) {.kulikcdn .card--collection {width: 14.2%;}}@media screen and (max-width: 385px) {.kulikcdn .card--collection {width: 33.3%;}}@media screen and (max-width: 580px) {.kulikcdn .card--collection {width:25%;}.kulikcdn--filter-button{background-color:#393a44;padding:.7em 1em;font-size:1.1em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;font-weight:300;margin-right:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;}.kulikcdn--filter-button > div{margin-left:.5em;}.kulikcdn--filter-button.focus{background-color:#d81f26;}.kulicategory-full {display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;-webkit-flex-wrap: wrap;-ms-flex-wrap: wrap;flex-wrap: wrap;padding: 0 1em;}.kulicategory-full .card {margin-left: 0;padding-left: .5em;padding-right: .2em;}}@media screen and (max-width:480px) {.kulicategory-full .card {padding-left: .375em;padding-right: .375em;}}.kulicategory-full__more {text-align: center;padding: 2em;margin-top: 1.5em;width: 100% ;}.kulicategory-full__more>span {font-size: 1.2em;}.kulicategory-full__more.focus {border-color: #fff;color: #000;}body.platform--orsay .kulicategory-full, body.platform--netcast .kulicategory-full {display: block }body.platform--orsay .kulicategory-full .card, body.platform--netcast .kulicategory-full .card {float: left }body.platform--orsay .kulicategory-full .card__title, body.platform--netcast .kulicategory-full .card__title {min-height: 3.6em }body.platform--orsay .kulicategory-full:after, body.platform--netcast .kulicategory-full:after {display: block;content:'';clear: both;}div.card.selector.kulicard--collection.card--loaded.focus > div.kulicard__view {box-shadow: 0 0 0 0.5em #ffffff;}.card.focus .kulicard__view::after, .card.hover .kulicard__view::after {content:'';position: absolute;top: -.5em;left: -.5em;right: -.5em;bottom: -.5em;border: .3em solid #fff;-webkit-border-radius: 1.4em;-moz-border-radius: 1.4em;border-radius: 1.4em;z-index: -1;pointer-events: none;}.card.hover .kulicard__view::after {border-color: rgb(255, 255, 255, .5);}.kulicard__view {margin-bottom: 1em;position: relative;padding-bottom: 0;}.StreamCard-module__ChannelLogo--Vq7CP img {max-height: 100%;max-width: 100%;opacity: .6;}.index-module_slideItem__mHFQt.index-module_SmallStreamCard__hFzd6 {width: 220px;}.index-module_slideItem__mHFQt {display: inline-block;padding: 10px 10px 0;}.StreamCard-module__StreamCard--cAZG7 {position: relative;width: 100%;z-index: 0;}.StreamCard-module__streamImageWrapper--tyQAQ {margin-bottom: 10px;}.StreamCard-module__StreamImage--AHFz8 {background-color: var(--bgSubstrate);background-position: 50%;background-repeat: no-repeat;background-size: cover;border-radius: 5px;cursor: pointer;display: block;height: 0;overflow: hidden;padding-top: 56.4%;position: relative;-webkit-user-select: none;-moz-user-select: none;user-select: none;width: 100%;z-index: 0;}.StreamCard-module__playButton--CM00U {height: 23px;left: 50%;opacity: 0;position: absolute;top: 50%;transform: translateX(-50%) translateY(-50%);transition: opacity .4s;-webkit-user-select: none;-moz-user-select: none;user-select: none;width: 17px;}.StreamCard-module__trackNameWrapper--3PAFw {display: flex;flex-direction: column;}.StreamCard-module__lineInfo--sdG8M:first-child {margin-bottom: 8px;}.StreamCard-module__lineInfo--sdG8M {align-items: center;display: flex;}.StreamCard-module__iconWrapper--JAbTw {width: 57px;}.kulikcdn_view {align-items:center;background:#232328;border-radius:4px;display:flex;float:left;font-size:0;height:26px;justify-content: center;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:45px;}.StreamCard-module__outputDate--gSddm {color:var(--white-60);font-size: 18px;font-weight: 600;width: 57px;}.StreamCard-module__title--aL7mt {flex:2.8;font-weight:600;}.Text-module__limitLinesNumber--eZiv2 {-webkit-box-orient: vertical;display:-webkit-box;overflow:hidden;}.Text-module__Text--7D26S {color:var(--textMainColor);font-family:var(--font-primary);font-size:15px;}.StreamCard-module__subscribeLabel--Z53e {color:var(--white-60);flex:2.8;}.SubscribeLabel-module__SubscribeLabel--koopf {display:inline-block;font-family:var(--font-primary);font-size:13px;}@media screen and (max-width: 2560px) {.kulikcdn_v2 .kulicard--collection {width: 14.2%;}.kulikcdn_v2 .card__quality {right:0;bottom:0;font-size:.50em;left:0;}.kulikcdn_v2 .card__type {left:0;top:0;font-size:.62em;}}@media screen and (max-width: 2160px) {.kulikcdn_v2 .kulicard--collection {width:12.5%;}.kulikcdn_v2 .card__quality {right:0;bottom:0;font-size:.62em;left:0;}.kulikcdn_v2 .card__type {left:0;top:0;font-size:.62em;}}@media screen and (max-width: 1560px) {.kulikcdn_v2 .kulicard--collection {width:24.8%;}}@media screen and (max-width: 920px) {.kulikcdn_v2 .kulicard--collection {width:25%;}}@media screen and (max-width: 580px) {.kulikcdn_v2 .kulicard--collection {width:33%;}.index-module_slideItem__mHFQt.index-module_SmallStreamCard__hFzd6 {width:90%;}.StreamCard-module__outputDate--gSddm {font-size:11px;width:40px;}.Text-module__Text--7D26S {font-size:13px;}.kulicard__view {padding:5px;}.kulikcdn_view {width:40px;}.SubscribeLabel-module__SubscribeLabel--koopf {padding-left:10px;font-size:12px;}.index-module_slideItem__mHFQt {padding:0 0 5px;}}@media screen and (max-width: 385px) {.kulikcdn_v2 .kulicard--collection {width:33.3%;}}@media screen and (max-width:360px) {.kulikcdn_v2 .kulicard--collection {width:50%;}}.ktviptv-list{padding:1.5em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-moz-box-orient:vertical;-moz-box-direction:normal;-ms-flex-direction:column;flex-direction:column;padding-bottom:1em }.ktviptv-list__ico{width:4.5em;margin-bottom:2em;height:4.5em }.ktviptv-list__ico>svg{width:4.5em;height:4.5em }.ktviptv-list__title{font-size:1.9em;margin-bottom:1em }.ktviptv-list__items{width:25%;margin:0 auto }.ktviptv-list__items .scroll{height:22em }.ktviptv-list__item{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:1em;background-color:rgba(255,255,255,0.1);font-size:1.3em;line-height:1.3;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;margin:1em;margin-top:auto;} .ktviptv-list__item-url{width:60%;padding-left:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:right }.ktviptv-list__item.focus{background-color:#fff;color:black }.ktviptv-content{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:0 1.5em;line-height:1.3;font-size:14px;}    @media screen and (max-width:1930px){.ktviptv-list__item-name{width:100%;padding-right:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:left }.ktviptv-details__program {font-size:20;}.ktviptv-details__title {font-size:2.8em;}.ktviptv-content {font-size:17px;}}.ktviptv-list__item-url{width:60%;padding-left:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:right }.ktviptv-list__item.focus{background-color:#fff;color:black }.ktviptv-content{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:0 1.5em;line-height:1.3;font-size:14px;}    @media screen and (max-width: 1380px){.ktviptv-list__item-name{width:100%;}.ktviptv-content{font-size:13px;}.ktviptv-program{font-size:1.0em;}.ktviptv-content__menu {width:30%;padding-right:1em;}.ktviptv-channel__ico {width:70%;}.ktviptv-content__channels {width:20%;}.ktviptv-channel {padding-bottom:65%;}.ktviptv-details__title {font-size:2em;}.ktviptv-content__details {width:51%;padding-left:1em;}}    @media screen and (max-width:1290px){.ktviptv-list__item-name{width:100%;}.ktviptv-content{font-size:10px;}.ktviptv-program{font-size:1.0em;}.ktviptv-content__menu {width:30%;padding-right:1em;}.ktviptv-channel__ico {width:60%;}.ktviptv-content__channels {width:20%;} .ktviptv-channel {padding-bottom:65%;}.ktviptv-details__title {font-size:2em;}.ktviptv-content__details {width:51%;padding-left:1em;}}     @media screen and (max-width:960px){.ktviptv-list__item-name{width:100%;}.ktviptv-content{font-size:10px;}.ktviptv-program{font-size:0.8em;}.ktviptv-content__menu {width:30%;padding-right:1em;}.ktviptv-channel__ico {width:60%!important;}.ktviptv-content__channels {width:20%!important;}.ktviptv-channel {padding-bottom:40%!important;}.ktviptv-details__title {font-size:2.3em!important;}.ktviptv-content__details {width:44%!important;padding-left:1em!important;}}    @media (-webkit-min-device-pixel-ratio: 1.5){.ktviptv-list__item-name{width:100%!important;}.ktviptv-content{font-size:10px!important;}.ktviptv-program{font-size:0.8em!important;}.ktviptv-content__menu {width:30%!important;padding-right:1em!important;}.ktviptv-channel__ico {width:60%!important;}.ktviptv-content__channels {width:20%!important;}.ktviptv-channel {padding-bottom:40%!important;}.ktviptv-details__title {font-size:2.3em!important;}.ktviptv-content__details {width:44%!important;padding-left:1em!important;}}      @media screen and (max-width: 850px){.ktviptv-list__item-name{width:100%!important;}.ktviptv-content{font-size:10px!important;}.ktviptv-content__menu {width:30%!important;padding-right:1em!important;}.ktviptv-channel__ico {width:60%!important;}.ktviptv-content__channels {width:20%!important;}.ktviptv-channel {padding-bottom:55%!important;}.ktviptv-details__title {font-size:2em!important;}.ktviptv-content__details {width:44%!important;padding-left:1em!important;}}     @media screen and (max-width: 650px) {.ktviptv-content{font-size:10px!important;}.ktviptv-menu__title {font-size:2em!important;margin-bottom:1em!important;}.ktviptv-content__menu {width:37%!important;padding-right:0em!important;}.ktviptv-list__items {width:33%!important;}.ktviptv-channel__ico {width:70%!important;}.ktviptv-content__channels {width:25%!important;}.ktviptv-content__details {width:36%!important;}.ktviptv-details__program {padding-top:2em!important;}}   @media screen and (max-width: 450px) {.ktviptv-content__menu {width:55%!important;padding-right:0em!important;}.ktviptv-list__items {width:50%!important;}.ktviptv-list__item-name {width:100%!important;}.ktviptv-channel__ico {width:70%!important;}.ktviptv-content__channels {width:40%!important;}}        .ktviptv-content>div{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0 }.ktviptv-content__menu{width:25%;padding-right:4em }.ktviptv-content__channels{width:23%;}.ktviptv-content__details{width:40%;padding-left:2em }.ktviptv-menu__title{font-size:2.4em;font-weight:300;margin-bottom:1em }.ktviptv-menu__list-item{color:rgba(255,255,255,0.6);font-size:1.4em;font-weight:300;position:relative;padding:.5em .8em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex }.ktviptv-menu__list-item>span{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;padding-left:1em;margin-left:auto }.ktviptv-menu__list-item.active{color:#fff;background-color:rgba(255,255,255,0.1);-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em }.ktviptv-menu__list-item.focus{color:#000;background-color:white;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em }.ktviptv-menu__list>div+div{margin-top:.3em }.ktviptv-channels{padding:1em }   .ktviptv-channel{background-color:#464646;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;padding-bottom:60%;position:relative }.ktviptv-channel__body{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-moz-box-orient:vertical;-moz-box-direction:normal;-ms-flex-direction:column;flex-direction:column;padding:1em }.ktviptv-channel__ico{width:45%;opacity:0 }.ktviptv-channel__name{text-align:center;font-size:1.2em }.ktviptv-channel.favorite::after{content:'';position:absolute;top:.3em;right:.2em;background-image:url(./img/icons/menu/like.svg);background-repeat:no-repeat;background-position:50% 50%;-webkit-background-size:55% 55%;-moz-background-size:55%;-o-background-size:55%;background-size:55%;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;width:1.8em;height:1.8em;margin-left:-0.9em }.ktviptv-channel.focus::before,.ktviptv-channel.last--focus::before{content:'';position:absolute;top:-0.5em;left:-0.5em;right:-0.5em;bottom:-0.5em;border:.3em solid #fff;-webkit-border-radius:1.4em;-moz-border-radius:1.4em;border-radius:1.4em;opacity:.4 }.ktviptv-channel.focus::before{opacity:1 }.ktviptv-channel+.ktviptv-channel{margin-top:1em }.ktviptv-details__group{font-size:1.3em;margin-bottom:.9em;opacity:.5 }.ktviptv-details__title{font-size:2.5em;font-weight:700 }.ktviptv-details__program{padding-top:1.1em }.ktviptv-details__program-title{font-size:1.2em;padding-left:4.9em;margin-bottom:1em;opacity:.5 }.ktviptv-details__program-list>div+div{margin-top:1.6em }.ktviptv-details__program>div+div{margin-top:2em }.ktviptv-program{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;font-size:1.0em;font-weight:300 }.ktviptv-program__time{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:5em;position:relative }.ktviptv-program.focus .ktviptv-program__time::after{content:'';position:absolute;top:.5em;right:.9em;width:.4em;background-color:#fff;height:.4em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;margin-top:-0.1em;font-size:1.2em }body.light--version .ktviptv-content{font-size:.9em }body.light--version .ktviptv-channel{-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em }body.light--version .ktviptv-channel::before{-webkit-border-radius:.6em;-moz-border-radius:.6em;border-radius:.6em }.iptv-list{padding:1.5em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-moz-box-orient:vertical;-moz-box-direction:normal;-ms-flex-direction:column;flex-direction:column;padding-bottom:1em }.iptv-list__ico{width:4.5em;margin-bottom:2em;height:4.5em }.iptv-list__ico>svg{width:4.5em;height:4.5em }.iptv-list__title{font-size:1.9em;margin-bottom:1em }.iptv-list__text{font-size:1.2em;line-height:1.4;margin-bottom:1em;text-align:center;width:60%;margin:0 auto;margin-bottom:2em }.kktv2_iptv-list__items{width:50%;margin:0 auto }.kktv2_iptv-list__items .scroll{height:22em }.iptv-list__item{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:1em;background-color:rgba(255,255,255,0.1);font-size:1.3em;line-height:1.3;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em;margin:1em }.iptv-list__item-name{width:40%;padding-right:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:left }.iptv-list__item-url{width:60%;padding-left:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:right }.iptv-list__item.focus{background-color:#fff;color:black }.iptv-playlist-item{padding:1em;background-color:rgba(255,255,255,0.1);line-height:1.3;margin:1em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;position:relative }.iptv-playlist-item__body{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center }.iptv-playlist-item__url{width:60%;padding-left:1em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap;text-align:right }.iptv-playlist-item__name{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;width:40% }.iptv-playlist-item__name-ico{background-color:#fff;-webkit-border-radius:.5em;-moz-border-radius:.5em;border-radius:.5em;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;padding:.3em .5em;color:#000;min-width:2.3em;text-align:center }.iptv-playlist-item__name-ico>span{font-size:1.2em;font-weight:900 }.iptv-playlist-item__name-text{font-weight:600;padding-left:1em }.iptv-playlist-item__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;margin-top:1em;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between }.iptv-playlist-item__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex }.iptv-playlist-item__details+div{margin-left:2em }.iptv-playlist-item__label{color:rgba(255,255,255,0.5) }.iptv-playlist-item__label>span{color:#fff }.iptv-playlist-item__label+.iptv-playlist-item__label:before{content:'|';display:inline-block;margin:0 1em;font-size:.7em;margin-top:-0.4em }.iptv-playlist-item.focus::after,.iptv-playlist-item.hover::after{content:'';position:absolute;top:-0.5em;left:-0.5em;right:-0.5em;bottom:-0.5em;border:.3em solid #fff;-webkit-border-radius:1.4em;-moz-border-radius:1.4em;border-radius:1.4em;z-index:-1;pointer-events:none }.kktviptv-content{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:0 1.5em;line-height:1.3 }.kktviptv-content>div{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0 }.kktviptv-content__menu{width:30%;padding-right:4em }   @media screen and (max-width:2500px){.kktviptv-program__timeline {width:14.5%!important;}.kktviptv-content__menu {font-size:18px!important;padding-right:2em!important;width:24%!important;}.kktviptv-content__channels{width:19%!important;}.kktviptv-channel.small--icon .kktviptv-channel__ico {width:9em!important;}.kktviptv-content__details {width:53%!important;padding-left:2em!important;}}    @media screen and (max-width:1370px){.kktviptv-content__menu {width:27%!important;}} @media screen and (max-width:1200px){.kktviptv-content__menu {width:30%!important;}}    @media screen and (max-width:980px){.kktviptv-program__timeline {width:16.8%!important;}.kktviptv-content__menu{width:38%!important;padding-right:1em!important;font-size:15px!important;}.kktviptv-menu__title {font-size:2em!important;}.kktviptv-content__details {width:50%!important;} .iptv-program__picchann {width:45%!important;}}     @media screen and (max-width: 960px) {.kktviptv-content__menu { width: 34%!important;} .kktviptv-content__details {width:45%!important;}.iptv-program__picchann {width:40%!important;}.kktviptv-program__timeline {width:13%!important;}}    @media screen and (max-width:900px){.kktviptv-content__menu{width:28%!important;}}.kktviptv-content__channels{width:25% }.kktviptv-program__timeline{-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;background:rgba(255,255,255,0.5);width:10%;margin-top:2px;display:block;padding:2px;position:fixed;}    @media screen and (max-width:900px){.kktviptv-content__channels{width:27% }}    @media screen and (max-width:767px){.kktv2_iptv-list__items{width:100% }}     @media screen and (max-width:767px){.iptv-list__text{width:100% }}     @media screen and (max-width:480px){.iptv-playlist-item__details+div{margin-left:0;margin-top:1em }}     @media screen and (max-width:480px){.iptv-playlist-item__footer{display:block }}.kktviptv-content__details{width:45%;padding-left:4em }.kktviptv-menu__title{font-size:2em;font-weight:300;margin-bottom:0.4em} .kktviptv-menu__list-item{color:rgba(255,255,255,0.6);font-size:1.4em;font-weight:300;position:relative;padding:.5em .8em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex }.kktviptv-menu__list-item>span{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;padding-left:1em;margin-left:auto }.kktviptv-menu__list-item.active{color:#fff;background-color:rgba(255,255,255,0.1);-webkit-border-radius:.8em;-moz-border-radius:.8em;border-radius:.8em }.kktviptv-menu__list-item.focus{color:#000;background-color:white;-webkit-border-radius:.8em;-moz-border-radius:.8em;border-radius:.8em }.kktviptv-menu__list>div+div{margin-top:.3em }.kktviptv-channels{padding:1em;padding-left:5em }.kktviptv-channel{background-color:#464646;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;padding-bottom:72%;position:relative }.kktviptv-channel__body{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-moz-box-orient:vertical;-moz-box-direction:normal;-ms-flex-direction:column;flex-direction:column;padding:0;text-align:center }.kktviptv-channel__ico{width:80%;opacity:0;max-height:100% }.kktviptv-channel__name{text-align:center;font-size:1.2em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical;max-height:1.4em }.kktviptv-channel__simb{font-size:4em;font-weight:900;line-height:.7;margin-bottom:.4em }.kktviptv-channel__chn{position:absolute;top:50%;right:100%;margin-right:.5em;font-size:1.9em;font-weight:600;margin-top:-0.7em;opacity:.5 }.kktviptv-channel.loaded .kktviptv-channel__ico{opacity:1 }.kktviptv-channel.full--icon .kktviptv-channel__body{padding:0;overflow:hidden;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em }.kktviptv-channel.full--icon .kktviptv-channel__ico{max-width:105%;width:105%;height:105% }.kktviptv-channel.small--icon .kktviptv-channel__ico{width:6em;-webkit-border-radius:.7em;-moz-border-radius:.7em;border-radius:.7em }.kktviptv-channel.favorite::after{content:'';position:absolute;top:.3em;right:.2em;background-image:url(./img/icons/menu/like.svg);background-repeat:no-repeat;background-position:50% 50%;-webkit-background-size:55% 55%;-moz-background-size:55%;-o-background-size:55%;background-size:55%;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;width:1.8em;height:1.8em;margin-left:-0.9em }.kktviptv-channel.focus::before,.kktviptv-channel.active::before{content:'';position:absolute;top:-0.5em;left:-0.5em;right:-0.5em;bottom:-0.5em;border:.3em solid #fff;-webkit-border-radius:1.4em;-moz-border-radius:1.4em;border-radius:1.4em;opacity:.4 }.kktviptv-channel.focus::before{opacity:1 }.kktviptv-channel+.kktviptv-channel{margin-top:1em }.iptv-details{padding-top:3.5em;-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,from(white),color-stop(92%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 0,white 92%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,from(white),color-stop(92%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 0,white 92%,rgba(255,255,255,0) 100%) }.iptv-details__play{font-size:1.3em;margin-bottom:.5em }.iptv-details__play .lb{background:rgba(255,255,255,0.3);-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;padding:0 .4em;margin-right:.7em }.iptv-details__play span:last-child{opacity:.5 }.iptv-details__title{font-size:3.3em;font-weight:700 }.iptv-details__program{padding-top:3em }.iptv-details__list>div+div{margin-top:1.6em }.iptv-details-epmty>div{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex }.iptv-details-epmty>div span{background-color:rgba(255,255,255,0.18);-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;height:1em }.iptv-details-epmty>div span:first-child{width:8%;margin-right:3.2em }.iptv-details-epmty>div+div{margin-top:2em }.iptv-program{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;font-size:1.2em;font-weight:300;position:relative }.iptv-program-date{font-size:1.2em;padding-left:4.9em;margin-bottom:1em;opacity:.5 }.iptv-program__time{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:5em;position:relative }.iptv-program__descr{opacity:.5;margin-top:.7em }.iptv-program__picchann{width:35%;float:left;margin-right:10px;opacity:0.6;}.kktviptv-program__timeline{-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;background:rgba(255,255,255,0.5);width:10%;margin-top:2px;display:block;padding:2px;position:fixed;}.kktviptv-program__timeline>div{height:.3em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;background:#bb0019;min-height:5px }.iptv-program__body{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1 }.iptv-program.archive::after{content:'';position:absolute;top:.2em;left:3.1em;width:1em;height:1em;background:url('./img/icons/menu/time.svg') no-repeat 50% 50%;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain }.iptv-program.played::after{content:'';position:absolute;top:.2em;left:3.1em;width:1em;height:1em;background:url('./img/icons/player/play.svg') no-repeat 50% 50%;-webkit-background-size:contain;-moz-background-size:contain;-o-background-size:contain;background-size:contain }.iptv-program.focus .iptv-program__time::after{content:'';position:absolute;top:0;width:2.4em;left:0;background-color:rgba(255,255,255,0.2);height:1.4em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em }.iptv-list-empty{border:.2em dashed rgba(255,255,255,0.5);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;height:12em;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em }.iptv-link{display:inline-block;padding:.1em .5em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;background-color:rgba(255,255,255,0.1) }.iptv-param-lock{position:absolute;top:50%;right:1.5em;margin-top:-1em;opacity:.5 }.iptv-param-lock>svg{width:2em;height:2em }body.platform--orsay .kktviptv-menu__list-item{padding-right:2.7em }body.platform--orsay .kktviptv-menu__list-item>span{position:absolute;top:.5em;right:1em }body.light--version .kktviptv-content{font-size:.9em }body.light--version .kktviptv-channel{-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em }body.light--version .kktviptv-channel::before{-webkit-border-radius:.6em;-moz-border-radius:.6em;border-radius:.6em }.kktviptv-mobile .kktviptv-content{display:block!important;padding:0!important;}.kktviptv-mobile .kktviptv-content__menu,.kktviptv-mobile .kktviptv-content__channels,.kktviptv-mobile .kktviptv-content__details{width:100%!important;padding:0!important;}.kktviptv-mobile .kktviptv-menu__list{display:-webkit-box!important;display:-webkit-flex!important;display:-moz-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-webkit-align-items:center!important;-moz-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;}.kktviptv-mobile .kktviptv-menu__list>div+div{margin:0!important;margin-left:.5em!important;}.kktviptv-mobile .kktviptv-menu__list-item{-webkit-flex-shrink:0!important;-ms-flex-negative:0!important;flex-shrink:0!important;}.kktviptv-mobile .kktviptv-menu__title{display:none!important;}.kktviptv-mobile .kktviptv-channels{display:-webkit-box!important;display:-webkit-flex!important;display:-moz-box!important;display:-ms-flexbox!important;display:flex!important;padding:0!important;}.kktviptv-mobile .kktviptv-channel{padding-bottom:0!important;-webkit-flex-shrink:0!important;-ms-flex-negative:0!important;flex-shrink:0!important;width:14em!important;height:10em!important;}@media screen and (max-width:500px){.kktviptv-program__timeline {width:26.5%!important;}.kktviptv-mobile .kktviptv-channel{width:11em!important;;height:8em!important;}.kktviptv-mobile .iptv-details__title{font-size:2.5em!important;}.kktviptv-content__menu {font-size: 12px!important;}}@media screen and (max-width:400px){.kktviptv-mobile .kktviptv-channel{width:11em!important;;height:8em!important;}.kktviptv-mobile .kktviptv-channel .kktviptv-channel__simb{font-size:3.2em!important;}}@media screen and (max-width: 380px) {.kktviptv-content__menu {font-size:10px!important;}.kktviptv-mobile .kktviptv-channel__chn{display:none!important;}.kktviptv-mobile .kktviptv-channel+.kktviptv-channel{margin:0!important;;margin-left:1em!important;}.kktviptv-mobile .kktviptv-content__details{padding:0 1.5em!important;}.kktviptv-mobile .iptv-details{padding-top:0!important;height:48vh!important;}}.kktviptv-mobile .kktviptv-channel__chn{display:none!important;}.kktviptv-mobile .kktviptv-channel+.kktviptv-channel{margin:0!important;;margin-left:1em!important;}.kktviptv-mobile .kktviptv-content__details{padding:0 1.5em!important;}.kktviptv-mobile .iptv-details{padding-top:0!important;height:48vh!important;}</style>");


  function add() {
  		Lampa.SettingsApi.addComponent({
  			component: 'settings_kulik',
        icon: "<svg height=\"244\" viewBox=\"0 0 260 244\" xmlns=\"http://www.w3.org/2000/svg\" style=\"fill-rule:evenodd;\" fill=\"currentColor\"><path d=\"M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10 .667 40 .667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z\"/><path d=\"M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2.602-3.712 6.102-4.879 10.5-3.5 5.148 3.334 6.314 7.834 3.5 13.5a1306.032 1306.032 0 0 0-22 43c-5.381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10.288 7.242 7.5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z\"/></svg>",
        name: 'ТВ каналы'
  		});


Lampa.SettingsApi.addParam({
    component: 'settings_kulik',
    param: {
        name: 'stileplug', // как храним в кеше
        type: 'select', //select,input,trigger,title,static
        values: {
            kulikcdn: 'old cors (логотипы+название)',
            ktviptv: 'IPTV beta v1 (epg: упращенное)',
            kktviptv: 'IPTV beta v2 (epg: полное с описанием)',
            cors2new: 'CORS v2 New (epg: что сейчас идет)'
        }, default: 'kktviptv'
    },
    field: {
        name: 'Стиль плагина',
        description: 'вид/стиль отображение каналов'
    },
    onChange: function (value) { 	
        Lampa.Noty.show("Перезайдите в раздел ТВ каналы!");
        Lampa.Settings.update();							
    }
});

Lampa.SettingsApi.addParam({
    component: 'settings_kulik',
    param: {
        name: 'apiktvhls',
        type: 'select',
        values: {
            kulikapi: 'HLS4',
            apikulik: 'HLS2'
        },
        default: 'kulikapi'
    },
    field: {
        name: 'Версия потока',
        description: 'влияет на работу каналов во внешних плеерах'
    },
    onChange: function (value) {   
        Lampa.Noty.show("Перезайдите в раздел ТВ каналы!");
        Lampa.Settings.update();
    }
});

Lampa.SettingsApi.addParam({
    component: 'settings_kulik',
    param: {
        name: 'kulikhls_method',
        type: 'select',
        values: {
            hlsjs: 'Ламповая',
            application: 'Через систему'
        }, "default": 'hlsjs'
    },
    field: {
        name: 'Работа плеера',
        description: 'влияет на встроенный плеер в ТВ каналы'
    }
});
Lampa.SettingsApi.addParam({
    component: 'settings_kulik',
    param: {
        name: 'kulikb_db',
        type: 'select',
        values: {
            storage: 'LocalStorage',
            indexdb: 'IndexedDB'
        }, "default": 'storage'
    },
    field: {
        name: 'Как храним данные на устройстве?',
        description: 'Только для стиля IPTV beta v2'
    },
    onChange: function onChange() {
        Favorites.load().then(function () {
            document.querySelectorAll('.iptv-playlist-item').forEach(function (element) {
                Lampa.Utils.trigger(element, 'update');
            });
        });
    }
});
Lampa.SettingsApi.addParam({
    component: 'settings_kulik',
    param: {
        name: 'kulikb_favotite_save',
        type: 'select',
        values: {
            name: 'По названию канала',
            url: 'По ссылке на поток'
        }, "default": 'name'
    },
    field: {
        name: 'Запоминаем избранное',
        description: 'Только для стиля IPTV beta v2'
    }
});

    var button = $("<li class=\"menu__item selector\" data-action=\""+Lampa.Storage.field('stileplug')+"\">        <div class=\"menu__ico\">            <svg height=\"36\" viewBox=\"0 0 38 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">                <rect x=\"2\" y=\"8\" width=\"34\" height=\"21\" rx=\"3\" stroke=\"currentColor\" stroke-width=\"3\"/>                <line x1=\"13.0925\" y1=\"2.34874\" x2=\"16.3487\" y2=\"6.90754\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>                <line x1=\"1.5\" y1=\"-1.5\" x2=\"9.31665\" y2=\"-1.5\" transform=\"matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>                <line x1=\"9.5\" y1=\"34.5\" x2=\"29.5\" y2=\"34.5\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\"/>            </svg>        </div>        <div class=\"menu__text\">ТВ каналы</div>    </li>");
    button.on('hover:enter', function () {
        Lampa.Activity.push({
            url: '',
            title: 'ТВ каналы',
            component: Lampa.Storage.field('stileplug'),
            page: 1
        });
        
        /*var hlsapikulik = Lampa.Storage.get('apiktvhls');
            if (hlsapikulik === 'kulikapi') {
                domainkulik = 'cdn.kulik.uz';
            } else if (hlsapikulik === 'apikulik') {
                domainkulik = 'api.kulik.uz';
            }
            console.log('KulikTV', 'Версия HLS:', hlsapikulik);*/
        
        if (Lampa.Activity.active().component === Lampa.Storage.field('stileplug')) {
            

            
            



            
            //var hlsMethodValue = Lampa.Storage.field('kulikhls_method');
            //Lampa.Storage.set('player_hls_method', hlsMethodValue);

        }
    });
    $('body').find('.menu .menu__list').eq(0).append(button);
    $('body').append(Lampa.Template.get('kuliktv_stylecss', {}, true));
}

    if (window.appready) add();else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add();
        });
    }
  }
if (!window.plugin_kktviptv_ready) startPlugin();
})();

var hls22_method = Lampa.Storage.get('player_hls_method');
console.log('KulikTV', 'Версия HLS:', hls22_method);