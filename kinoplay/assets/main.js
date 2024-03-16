var oldRelease, navbar = document.getElementById("navbar");
var loadedOldReleases = !1;

function getOldReleases(e) {
    for (i = 0; i < e.length; i++) {
        var n = e[i],
            t = createElement("div", "releaseTableView"),
            a = createElement("span", "releaseVersion");
        a.innerText = n.name, t.appendChild(a);
        var o = createElement("span", "releaseDate");
        o.innerText = new Date(n.published_at).toLocaleDateString(), t.appendChild(o);
        var r = createElement("div", "button");
        r.innerText = "Download";
        var d = n.assets.reverse();
        for (getLink = 0; getLink < d.length; getLink++) var s = d[getLink].browser_download_url;
        var l = createElement("a");
        l.href = s, l.appendChild(r), t.appendChild(l);
        var c = new showdown.Converter;
        t.innerHTML += c.makeHtml(n.body.replace(/^((?!^- .*).)*$/gm, ""));
        try {
            if (1 < t.getElementsByTagName("ul")[0].childElementCount) {
                var m = createElement("div", "viewMoreButton");
                m.setAttribute("onClick", "expandChangelog(this)"), m.innerText = "more", t.appendChild(m)
            }
        } catch (e) {}
        document.getElementById("legacyReleases").appendChild(t)
    }
    loadedOldReleases = !0
}

function updateProgessBar(e) {
    document.getElementById("progressBar").style.transform = "translateX(-" + (100 - e) + "%)"
}

function createElement(e, n) {
    var t = document.createElement(e);
    return n && (t.className = n), t
}

function goTo(e) {
    var n = 0;
    e && (n = document.getElementById(e).getBoundingClientRect().top - document.body.getBoundingClientRect().top + 180), document.body.scrollTop = n, document.documentElement.scrollTop = n
}

function expandChangelog(e) {
    "more" == e.innerText ? e.innerText = "less" : e.innerText = "more", e.parentNode.classList.toggle("expanded")
}

function viewLegacyVersions() {
    viewLegacyVersionsButton = document.getElementById("viewLegacyVersions"), "View Previous Versions" == viewLegacyVersionsButton.innerText ? (loadedOldReleases || getOldReleases(oldRelease), document.getElementById("legacyReleases").style.display = "inline", viewLegacyVersionsButton.innerText = "Hide Previous Versions") : (document.getElementById("legacyReleases").style.display = "none", viewLegacyVersionsButton.innerText = "View Previous Versions")
}
var darkMode, animateHTML = function () {
    var n, t;

    function e() {
        n = document.querySelectorAll(".hidden"), t = window.innerHeight, window.addEventListener("scroll", a), window.addEventListener("resize", e), a()
    }

    function a() {
        for (var e = 0; e < n.length; e++) {
            n[e].getBoundingClientRect().top - t <= -200 && (n[e].className = n[e].className.replace("hidden", "fadeInElement"))
        }
    }
    return {
        init: e
    }
};

function toggleDarkMode() {
    createCookie("darkMode", darkMode = darkMode ? (document.getElementsByTagName("html")[0].classList.remove("darkMode"), !1) : (enableDarkMode(), !0), 999999)
}

function enableDarkMode() {
    document.getElementsByTagName("html")[0].classList.add("darkMode")
}

function readCookie(e) {
    for (var n = e + "=", t = document.cookie.split(";"), a = 0; a < t.length; a++) {
        for (var o = t[a];
            " " == o.charAt(0);) o = o.substring(1, o.length);
        if (0 == o.indexOf(n)) return "true" == o.substring(n.length, o.length) || "false" != o.substring(n.length, o.length) && o.substring(n.length, o.length)
    }
    return null
}

function createCookie(e, n, t) {
    if (t) {
        var a = new Date;
        a.setTime(a.getTime() + 24 * t * 60 * 60 * 1e3);
        var o = "; expires=" + a.toGMTString()
    } else o = "";
    document.cookie = e + "=" + n + o + "; path=/"
}
animateHTML().init(), window.matchMedia("(prefers-color-scheme: dark)").matches && enableDarkMode(), document.cookie ? (darkMode = readCookie("darkMode")) && enableDarkMode() : darkMode = !1;

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
/////////////// by Ahmedov //////////////

function apiSearch() {
    var input = document.getElementById('search_input');
    if (input.value.length > 0) {
        fetch(`https://apitmdb.cub.red/3/search/multi?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru&query=` + encodeURI(input.value))
            .then(res => res.json())
            .then(function (data) {
                const mainContent = document.getElementById('mainContent');
                mainContent.innerHTML = '<div class="loader" id="loader" style="margin-bottom: 100%"></div>';
                var divtitle = '<div class="title-wrap" style="text-align: center;">\
                    <h2>\
                        <a>\
                            <span class="link-u">Результаты поиска</span>\
                        </a>\
                    </h2>\
                </div>\
                <div class="fadeInElement" style="white-space: normal;" id="search_results"></div>';
                document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);
                for (var key in data['results']) {
                    if (data["results"][key]["vote_average"] > 0) {
                        var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                                <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                              </div>";
                    };
                    if (data["results"][key]["media_type"] == 'movie') {
                        var date = new Date(data["results"][key]["release_date"]);
                        var title = data["results"][key]["title"];
                        var tv = ' ';
                    } else {
                        var date = new Date(data["results"][key]["first_air_date"]);
                        var title = data["results"][key]["name"];
                        var tv = '<div style="position: absolute; top: 10px; right: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #d01633;">\
                    <span>TV</span>\
                  </div>';
                    }
                    var div = "\
                <a onclick=\"apiItem('" + data["results"][key]["media_type"] + "/" + data["results"][key]["id"] + "')\">\
                    <div class=\"creditsCardWrapper\">\
                        <img alt=\"" + title + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                        <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                            <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                        </div>\
                        " + rating + "\
                        " + tv + "\
                        <div class=\"description\">\
                            <h2 class=\"title\">" + title + "</h2>\
                        </div>\
                    </div>\
                </a>\
                ";
                    document.getElementById('search_results').insertAdjacentHTML("beforeend", div);
                }
                document.getElementById('loader').style.display = "none";
            })
            .catch(function (error) {
                console.log(error);
            });

    } else {}
}

document.getElementById("search_input").addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        apiSearch();
    }
}, false);

function apiSections() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loader" id="loader" style="margin-bottom: 100%"></div>';

    //////// Сегодня в тренде ////////        
    fetch(`https://apitmdb.cub.red/3/trending/movie/day?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
            <h2>\
                <a>\
                    <span class="link-u">Сегодня в тренде</span>\
                </a>\
            </h2>\
        </div>\
        <div class="fadeInElement" id="tr_day"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                                <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                              </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["release_date"]);
                var div = "\
            <a onclick=\"apiItem('movie/" + data["results"][key]["id"] + "')\">\
                <div class=\"creditsCardWrapper\">\
                    <img alt=\"" + data["results"][key]["title"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                    <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                        <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                    </div>\
                    " + rating + "\
		            <div class=\"description\">\
			            <h2 class=\"title\">" + data["results"][key]["title"] + "</h2>\
		            </div>\
                </div>\
            </a>\
            ";
                document.getElementById('tr_day').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    ///////// В тренде за неделю ////////
    fetch(`https://apitmdb.cub.red/3/trending/movie/week?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
            <h2>\
                <a>\
                    <span class="link-u">В тренде за неделю</span>\
                </a>\
            </h2>\
        </div>\
        <div class="fadeInElement" id="tr_week"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                                <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                              </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["release_date"]);
                var div = "\
            <a onclick=\"apiItem('movie/" + data["results"][key]["id"] + "')\">\
                <div class=\"creditsCardWrapper\">\
                    <img alt=\"" + data["results"][key]["title"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                    <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                        <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                    </div>\
                    " + rating + "\
		            <div class=\"description\">\
			            <h2 class=\"title\">" + data["results"][key]["title"] + "</h2>\
		            </div>\
                </div>\
            </a>\
            ";
                document.getElementById('tr_week').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    ///////// Популярные фильмы ////////
    fetch(`https://apitmdb.cub.red/3/movie/popular?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
        <h2>\
            <a>\
                <span class="link-u">Популярные фильмы</span>\
            </a>\
        </h2>\
    </div>\
    <div class="fadeInElement" id="popular_mv"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                            <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                          </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["release_date"]);
                var div = "\
        <a onclick=\"apiItem('movie/" + data["results"][key]["id"] + "')\">\
            <div class=\"creditsCardWrapper\">\
                <img alt=\"" + data["results"][key]["title"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                    <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                </div>\
                " + rating + "\
                <div class=\"description\">\
                    <h2 class=\"title\">" + data["results"][key]["title"] + "</h2>\
                </div>\
            </div>\
        </a>\
        ";
                document.getElementById('popular_mv').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    ///////// Популярные  сериалы ////////
    fetch(`https://apitmdb.cub.red/3/trending/tv/week?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
            <h2>\
                <a>\
                    <span class="link-u">Популярные  сериалы</span>\
                </a>\
            </h2>\
        </div>\
        <div class="fadeInElement" id="popular_tv"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                                <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                              </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["first_air_date"]);
                var div = "\
            <a onclick=\"apiItem('tv/" + data["results"][key]["id"] + "')\">\
                <div class=\"creditsCardWrapper\">\
                    <img alt=\"" + data["results"][key]["name"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                    <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                        <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                    </div>\
                    " + rating + "\
                    <div style=\"position: absolute; top: 10px; right: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #d01633;\">\
                                <span>TV</span>\
                              </div>\
		            <div class=\"description\">\
			            <h2 class=\"title\">" + data["results"][key]["name"] + "</h2>\
		            </div>\
                </div>\
            </a>\
            ";
                document.getElementById('popular_tv').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    ///////// Топ фильмы ////////
    fetch(`https://apitmdb.cub.red/3/movie/top_rated?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
            <h2>\
                <a>\
                    <span class="link-u">Топ фильмы</span>\
                </a>\
            </h2>\
        </div>\
        <div class="fadeInElement" id="top_mv"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                                <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                              </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["release_date"]);
                var div = "\
            <a onclick=\"apiItem('movie/" + data["results"][key]["id"] + "')\">\
                <div class=\"creditsCardWrapper\">\
                    <img alt=\"" + data["results"][key]["title"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                    <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                        <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                    </div>\
                    " + rating + "\
		            <div class=\"description\">\
			            <h2 class=\"title\">" + data["results"][key]["title"] + "</h2>\
		            </div>\
                </div>\
            </a>\
            ";
                document.getElementById('top_mv').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });


    ///////// Топ сериалы ////////
    fetch(`https://apitmdb.cub.red/3/tv/top_rated?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru`)
        .then(res => res.json())
        .then(function (data) {
            var divtitle = '<div class="title-wrap">\
        <h2>\
            <a>\
                <span class="link-u">Топ сериалы</span>\
            </a>\
        </h2>\
    </div>\
    <div class="fadeInElement" id="top_tv"></div>';
            document.getElementById('mainContent').insertAdjacentHTML("beforeend", divtitle);

            for (var key in data['results']) {
                if (data["results"][key]["vote_average"] > 0) {
                    var rating = "<div style=\"position: absolute; top: 10px; left: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color);; border-radius: .4rem; justify-content: center;background: #3bb33b;\">\
                            <span>" + data['results'][key]['vote_average'].toFixed(1) + "</span>\
                          </div>";
                } else {
                    var rating = "";
                };
                var date = new Date(data["results"][key]["first_air_date"]);
                var div = "\
        <a onclick=\"apiItem('tv/" + data["results"][key]["id"] + "')\">\
            <div class=\"creditsCardWrapper\">\
                <img alt=\"" + data["results"][key]["name"] + "\" src=\"https://imagetmdb.com/t/p/w200/" + data["results"][key]["poster_path"] + "\" loading=\"lazy\">\
                <div style=\"position: absolute; top: 165px; left: 5px; display: flex; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #f60;\">\
                    <span style=\"margin: 0px 5px;\">" + date.getFullYear() + "</span>\
                </div>\
                " + rating + "\
                <div style=\"position: absolute; top: 10px; right: 6px; display: flex; width: 30px; font-size: .75rem; color: var(--text-color); border-radius: .4rem; justify-content: center; background: #d01633;\">\
                            <span>TV</span>\
                          </div>\
                <div class=\"description\">\
                    <h2 class=\"title\">" + data["results"][key]["name"] + "</h2>\
                </div>\
            </div>\
        </a>\
        ";
                document.getElementById('top_tv').insertAdjacentHTML("beforeend", div);
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    document.getElementById('loader').setAttribute('style', 'display: none');
}

if (window.location.href.includes('#')) {
    if (window.location.hash.includes('mv')) {
        apiItem('movie/' + window.location.hash.replace("\#mv", ""))
    } else {
        apiItem('tv/' + window.location.hash.replace("\#tv", ""))
    }
} else {
    apiSections();
}

function apiTV() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loader"></div>';
    fetch('./api_tv/')
        .then(res => res.text())
        .then(function (data) {
            mainContent.innerHTML = data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

function _isContains(json, value) {
    let contains = false;
    Object.keys(json).some(key => {
        contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
        return contains;
    });
    return contains;
}

function showPlayer(num, id) {
    if (num == 1) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://api.linktodo.ws/embed/imdb/' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 2) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://player.cdnvideohub.com/playerjs?partner=9&kid=' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 3) {
        fetch('https://apivb.info/api/videos.json?id_kp=' + id + '&token=f84860deb66d9bac149fdc8c8edba1d4')
            .then(res => res.json())
            .then(function (obj) {
                if (/.*iframe_url.*/g.test(JSON.stringify(obj))) {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="' + obj[0]['iframe_url'] + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                } else {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="./error.html" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (num == 4) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://kinoplay2.site/iplayer/videodb.php?kp=' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 5) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://allo.cdnlbox.club/?token=f688111d44220009e894da7069031c&kp=' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 6) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://voidboost.tv/embed/' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 7) {
        fetch('https://videocdn.tv/api/short?api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE&imdb_id=' + id)
            .then(res => res.json())
            .then(function (obj) {
                if (obj['result'] == true) {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="' + obj['data'][0]['iframe_src'] + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                } else {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="./error.html" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (num == 8) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="//militorys.net/van/' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 9) {
        fetch('https://kodikapi.com/search?token=0c9a72daf8747f4eacc2beba552b40ef&limit=1&imdb_id=' + id)
            .then(res => res.json())
            .then(function (obj) {
                if (obj['total'] !== 0) {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="' + obj['results'][0]['link'] + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                } else {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="./error.html" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

function showTrayler(num, id) {
    if (num == 1) {
        fetch('https://apitmdb.cub.red/3/' + id + '/videos?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru')
            .then(res => res.json())
            .then(function (obj) {
                if (_isContains(obj, "YouTube") == true) {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://www.youtube.com/embed/' + obj['results'][0]['key'] + '?fs=1&modestbranding=1&autoplay=1&showinfo=0&rel=0&iv_load_policy=3" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                } else {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="./error.html" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (num == 2) {
        fetch('https://apitmdb.cub.red/3/' + id + '/videos?api_key=4ef0d7355d9ffb5151e987764708ce96&language=en')
            .then(res => res.json())
            .then(function (obj) {
                if (_isContains(obj, "YouTube") == true) {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://www.youtube.com/embed/' + obj['results'][0]['key'] + '?fs=1&modestbranding=1&autoplay=1&showinfo=0&rel=0&iv_load_policy=3" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                } else {
                    document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="./error.html" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } else if (num == 4) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="//api.embr.ws/embed/trailer-imdb/' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 5) {
        document.getElementById('Content-img').innerHTML = '<iframe class="iframe" src="https://polati.newplayjj.com:9443/t/?token=2820224373db9f144b6c9feb75e345&kp=' + id + '" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen="" seamless></iframe>';
    } else if (num == 3) {
        window.open('https://widgets.kinopoisk.ru/discovery/film/' + id + '/?noAd=1&onlyPlayer=1', '_blank').focus();
    }
}

function kpid(id) {
    fetch('https://videocdn.tv/api/short?api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE&imdb_id=' + id)
        .then(res => res.json())
        .then(function (data) {
            document.getElementById("showPlayer2").setAttribute("onclick", "showPlayer(3,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showPlayer3").setAttribute("onclick", "showPlayer(4,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showPlayer4").setAttribute("onclick", "showPlayer(5,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showPlayer8").setAttribute("onclick", "showPlayer(2,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showPlayer9").setAttribute("onclick", "showPlayer(8,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showTrayler3").setAttribute("onclick", "showTrayler(3,'" + data['data']['0']['kp_id'] + "')");
            document.getElementById("showTrayler5").setAttribute("onclick", "showTrayler(5,'" + data['data']['0']['kp_id'] + "')");
        })
        .catch(function (error) {
            console.log(error);
        });
};

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    console.log(matches[1]);
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function apiItem(id) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loader"></div>';
    fetch('https://apitmdb.cub.red/3/' + id + '?append_to_response=content_ratings,release_dates,credits,similar,external_ids,keywords&api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru')
        .then(res => res.json())
        .then(function (obj) {
            if (id.includes('movie')) {
                var fav = 'addfav(\'mv' + obj['id'] + '\')';
                var title = obj['title'];
                if (obj['budget'] > 0) {
                    var budget = ' | Бюджет: ' + new Intl.NumberFormat("ru").format(obj['budget']) + '$';
                } else {
                    var budget = ' ';
                }
                var date = obj['release_date'];
                var time = obj['runtime'];
                var original_title = obj['original_title'];
            } else {
                var fav = 'addfav(\'tv' + obj['id'] + '\')';
                var title = obj['name'];
                var date = obj['first_air_date'];
                var budget = ' ';
                if (obj['last_episode_to_air'] === null) {
                    var time = ' ';
                } else {
                    var time = obj['last_episode_to_air']['runtime'];
                }
                var original_title = obj['original_name'];
            }
            for (var gnrs in obj['genres']) {
                if (gnrs == 0) {
                    var genres = obj['genres'][gnrs]['name'][0].toUpperCase() + obj['genres'][gnrs]['name'].substring(1);
                } else {
                    var genres = genres + ', ' + obj['genres'][gnrs]['name'][0].toUpperCase() + obj['genres'][gnrs]['name'].substring(1)
                }
            }

            kp_id = kpid(obj['external_ids']['imdb_id']);
            for (var cast in obj['credits']['cast']) {
                if (obj['credits']['cast'][cast]['profile_path'] === null) {
                    var imageUrl = './assets/cast.svg';
                } else {
                    var imageUrl = 'https://imagetmdb.com/t/p/w276_and_h350_face/' + obj['credits']['cast'][cast]['profile_path'];
                }
                if (cast == 0) {
                    var castitem = '\
                    <a class="cast" style="position: relative; display: block; width: 72px; margin: 10px 8px; text-align: center; color: #fff; transition: all .15s linear; title="' + obj['credits']['cast'][cast]['name'] + '">\
                        <div class="photo" style="position: relative; transition: all .4s ease; width: 72px; height: 72px; background-color: #9cadc3; border-radius: 50%; overflow: hidden; margin: 0 auto 10px; display: flex; flex-direction: column; justify-content: center; z-index: 0;">\
                            <img style="width: 72px;" src="' + imageUrl + '" loading="lazy">\
                        </div>\
                        <span class="castLink" style="flex-direction: column; font-family: inherit; font-size: 12px; line-height: 12px; text-align: center; letter-spacing: .02em; width: 100%;">' + obj['credits']['cast'][cast]['name'] + '</span>\
                    </a>';
                } else {
                    var castitem = castitem + '\
                    <a class="cast" style="position: relative; display: block; width: 72px; margin: 10px 8px; text-align: center; color: #fff; transition: all .15s linear; title="' + obj['credits']['cast'][cast]['name'] + '">\
                        <div class="photo" style="position: relative; transition: all .4s ease; width: 72px; height: 72px; background-color: #9cadc3; border-radius: 50%; overflow: hidden; margin: 0 auto 10px; display: flex; flex-direction: column; justify-content: center; z-index: 0;">\
                            <img style="width: 72px;" src="' + imageUrl + '" loading="lazy">\
                        </div>\
                        <span class="castLink" style="flex-direction: column; font-family: inherit; font-size: 12px; line-height: 12px; text-align: center; letter-spacing: .02em; width: 100%;">' + obj['credits']['cast'][cast]['name'] + '</span>\
                    </a>';
                }
            }
            if (obj['similar']['results'] === undefined) {

            } else {

            }

            mainContent.innerHTML = '\
            <div id="Content-img" style="height: 56.5vw; max-height: 360px;">\
                <div class="title-content" id="titlecontent">\
                <img class="title-img" style="object-fit: cover; object-position: center top" alt="' + title + '"src="https://imagetmdb.com/t/p/w1280/' + obj['backdrop_path'] + '"\
                </div>\
                <div class="cover-content" id="covercontent">\
                <span class="textlogo" style="background-image: url(https://imagetmdb.com/t/p/w1280/' + obj['backdrop_path'] + ')">' + title + '</span>\
                </div>\
            </div>\
            </div>\
            <div class="Content-info" id="Content-info" style="position: relative;">\
                <div id="showFiles" onclick="showFiles(0)" style="display: none; cursor: pointer; position: absolute; left: calc(100% - 30px); bottom: 5px;">\
	                <svg width="24" height="24" viewBox="0 0 50 50" style="fill: #748491">\
		                <path d="M 41.171875 29.457031 C 40.953125 28.597656 40.144531 28 39.199219 28 L 36.066406 28 C 33.371094 18.910156 28.738281 4.039063 28.1875 2.304688 C 28.054688 1.425781 27.007813 1 25 1 C 22.992188 1 21.949219 1.425781 21.8125 2.300781 C 21.4375 3.503906 18.289063 13.6875 15.65625 22.382813 L 15.558594 22.445313 C 15.574219 22.46875 15.597656 22.492188 15.613281 22.519531 C 15.027344 24.464844 14.464844 26.328125 13.96875 28 L 10.800781 28 C 10.03125 28 9.285156 28.492188 8.90625 29.253906 L 4.046875 44.699219 L 4 46 C 4 47.160156 4.839844 48 6 48 L 44 48 C 45.160156 48 46 47.160156 46 46 L 46 45 Z M 23.648438 3.117188 C 23.902344 3.0625 24.359375 3 25 3 C 25.648438 3 26.109375 3.0625 26.359375 3.121094 C 26.585938 3.761719 27.046875 5.210938 27.648438 7.15625 C 27.355469 7.511719 26.355469 8 25 8 C 23.515625 8 22.515625 7.433594 22.371094 7.210938 C 22.964844 5.296875 23.417969 3.835938 23.648438 3.117188 Z M 19.496094 16.605469 C 20.839844 17.460938 22.839844 18 25 18 C 27.164063 18 29.171875 17.449219 30.53125 16.566406 C 31.0625 18.316406 31.601563 20.101563 32.128906 21.84375 C 30.855469 22.980469 28.144531 24 25 24 C 21.839844 24 19.15625 23.0625 17.859375 21.996094 C 18.394531 20.21875 18.949219 18.394531 19.496094 16.605469 Z M 36.238281 36.066406 C 36.136719 38.078125 31.3125 41 25 41 C 18.691406 41 13.792969 38.078125 13.691406 36.066406 C 13.769531 35.699219 14.476563 33.324219 15.058594 31.34375 C 17.335938 32.949219 21.085938 34 25 34 C 28.835938 34 32.597656 32.882813 34.90625 31.183594 C 35.507813 33.25 36.15625 35.691406 36.238281 36.066406 Z"></path>\
	                </svg>\
                </div>\
                <div onclick="' + fav + '" style="cursor: pointer; position: absolute;bottom: 5px; left: 5px">\
                    <svg height="24" width="24" xmlns="http://www.w3.org/2000/svg">\
	                    <path d="M9 9.004h5.997M12 2c-6.84 0-7.995.981-7.995 8.873C4.005 19.707 3.836 22 5.545 22s4.498-3.878 6.455-3.878c1.957 0 4.746 3.878 6.454 3.878 1.71 0 1.541-2.293 1.541-11.127C19.995 2.98 18.84 2 12 2z" fill="none" stroke-linecap="round" id="favorites-icon" stroke-linejoin="round" stroke="#748491" stroke-width="1.5"></path>\
                    </svg>\
                </div>\
            <div class="entity-desc-item" id="destem">' + original_title + '</div>\
            <div class="entity-desc-value is-rating" id="israting">\
        	        <span title="TMDB" class="entity-rating-tmdb">Рейтинг: ' + obj['vote_average'].toFixed(1) + ' (голосов: ' + obj['vote_count'] + ')</span>\
            </div>\
            <div class="entity-desc-item">Жанр: ' + genres + budget + '</div>\
            <div class="entity-desc-item">Дата: ' + new Intl.DateTimeFormat('ru-Ru').format(new Date(date)) + ' | Время: ' + new Date(time).getTime() + ' мин.</div>\
            </div>\
            <div class="dropdown" id="dropdown" style="display: inline-flex;">\
                <input type="checkbox" class="show_pl" id="pl" style="display:none">\
                <label for="pl" id="show-player" >Показать плеер</label>\
                <div id="show_pl" class="dropdown-content" style="text-align: left;">\
                    <a id="showPlayer1" onclick="showPlayer(1,\'' + obj['external_ids']['imdb_id'] + '\')">Плеер #1 <span style="font-size:6px">(Callaps)</span></a>\
                    <a id="showPlayer2" onclick="showPlayer(3,\'' + kp_id + '\')">Плеер #2 <span style="font-size:6px">(DBHDVB)</span></a>\
                    <a id="showPlayer3" onclick="showPlayer(4,\'' + kp_id + '\')">Плеер #3 <span style="font-size:6px">(VideoDB)</span></a>\
                    <a id="showPlayer4" onclick="showPlayer(5,\'' + kp_id + '\')">Плеер #4 <span style="font-size:6px">(Alloha)</span></a>\
                    <a id="showPlayer5" onclick="showPlayer(6,\'' + obj['external_ids']['imdb_id'] + '\')">Плеер #5 <span style="font-size:6px">(HDRezha)</span></a>\
                    <a id="showPlayer6" onclick="showPlayer(7,\'' + obj['external_ids']['imdb_id'] + '\')">Плеер #6 <span style="font-size:6px">(VideoCDN)</span></a>\
                    <a id="showPlayer7" onclick="showPlayer(9,\'' + obj['external_ids']['imdb_id'] + '\')">Плеер #7 <span style="font-size:6px">(KodikBD)</span></a>\
                    <a id="showPlayer8" onclick="showPlayer(2,\'' + kp_id + '\')">Плеер #8 <span style="font-size:6px">(RedHeadSound)</span></a>\
                    <a id="showPlayer9" onclick="showPlayer(8,\'' + kp_id + '\')">Плеер #9 <span style="font-size:6px">(Militorys)</span></a>\
                </div>\
                <input type="checkbox" class="show_tr" id="tr" style="display:none">\
                <label for="tr" id="show-player" >Показать трейлер</label>\
                <div id="show_tr" class="dropdown-content" style="text-align: left;left: 175px;">\
                    <a id="showTrayler1" onclick="showTrayler(1, \'' + id + '\')">Трейлер #1 <span style="font-size:6px">(YouTube)</span></a>\
                    <a id="showTrayler2" onclick="showTrayler(2, \'' + id + '\')">Трейлер #2 <span style="font-size:6px">(YouTube En)</span></a>\
                    <a id="showTrayler3" onclick="showTrayler(3,\'' + kp_id + '\')">Трейлер #3 <span style="font-size:6px">(КиноПоиск)</span></a>\
                    <a id="showTrayler4" onclick="showTrayler(4,\'' + obj['imdb_id'] + '\')">Трейлер #4 <span style="font-size:6px">(Callaps)</span></a>\
                    <a id="showTrayler5" onclick="showTrayler(5,\'' + kp_id + '\')">Трейлер #5 <span style="font-size:6px">(Alloha)</span></a>\
                </div>\
            </div>\
        <div class="Content-desc" style="width: 100%; max-width: 750px; display: inline-block; -webkit-border-after: 1px solid #e6e6e6; border-block-end: 1px solid #e6e6e6;">\
        <div class="desc-full" style="background: linear-gradient(to top, transparent 5%, black 100%); border-radius: 10px; text-align: center; margin-top: 5px; padding: 10px; line-height: 1.5; word-spacing: 1.4px; font-size: 1rem; min-height: 14rem;">' + obj['tagline'] + obj['overview'] + '</div>\
        </div>\
        <div class="castRow-container" style="display: flex; width: 100%; overflow: visible; overflow-x: scroll; -webkit-border-after: 1px solid #e6e6e6; border-block-end: 1px solid #e6e6e6;">' + castitem + '</div>\
        <span style="color: #748491; margin: 15px 0px; display: inline-block; font-size: 14px;">Уважаемые правообладатели, учтите, что все плееры из сторонних источников. Пишите напрямую этих видео-балансеров для соблюдения DMCA.</span>\
            ';
        })
        .catch(function (error) {
            console.log(error);
        });
};

function favorites(check) {
    if (check == 0) {
        var results = document.cookie.match(/favorites=(.+?)(;|$)/);
        document.getElementById('favorites').setAttribute("onclick", "favorites(1)");
        document.getElementById('favorites-icon').setAttribute("stroke", "#000");
        document.getElementById('favorites-icon').setAttribute("fill", "rgb(116, 132, 145)");
        if (results == null) {
            var fav = "' . $type . $id . '" + ",";
        } else {
            var fav = results[1] + "' . $type . $id . ',";
        }
        document.cookie = "favorites=" + fav + ";path=/;max-age=31556926";
    } else if (check == 1) {
        var results = document.cookie.match(/favorites=(.+?)(;|$)/);
        document.cookie = "favorites=";
        document.getElementById('favorites').setAttribute("onclick", "favorites(0)");
        document.getElementById('favorites-icon').setAttribute("fill", "none");
        document.getElementById('favorites-icon').setAttribute("stroke", "#748491");
    };
};

let isInstalled = localStorage.getItem('pwaInstalled') === '1' || false;

if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    // User is currently navigating on the PWA so yes it's installed
    localStorage.setItem('pwaInstalled', '1');
    //        alert('1');
    isInstalled = true;
} else {
    //User is navigating in browser
    window.addEventListener('beforeinstallprompt', () => {
        localStorage.setItem('pwaInstalled', '0');
        isInstalled = false;
        //User can get an installation prompt meaning the app is not installed
    });
    window.addEventListener('onappinstalled', () => {
        localStorage.setItem('pwaInstalled', '1');
        isInstalled = true;
    });
}

function addfav(id) {
    document.cookie = "favorites=" + document.cookie + ',' + id + ";path=/;max-age=31556926";
}

function fav() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loader"></div>';
    var results = document.cookie.match(/favorites=(.+?)(;|$)/);
    if (results == null) {
        mainContent.innerHTML =
            '<div style="margin-bottom: 150%; color: var(--light-text-color); text-align: center;">Список Избранных пуст</div>';
    } else {
        fetch('./favorites?fav=' + results[1])
            .then(res => res.text())
            .then(function (data) {
                mainContent.innerHTML = data;
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}
