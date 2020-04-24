//   js by Pash(
//                    ()
//    )  ________    // )
//  ()  |\       \  //
// ( \\__ \ ______\//
//    \__) |       |
//      |  |®️ , ©️|
//       \ | ,___, |
//        \|_______|
//        //    \\
//       ((     ||
//        \\    ||
//        ()    ||
//     ( ()     () ) )
//
//


var contents=document.getElementsByTagName("html")[0].innerHTML,tracks=[],isDesktop=!window.location.hostname.includes("m.");if(0==tracks.length){for(var match,re=/title.{1,30}?>([\s\S]{1,70}?)<[\s\S]{1,300}?artist[\s\S]{1,30}?>([\s\S]{1,70}?)<[\s\S]{1,300}?"(http.+?mp3.+?)"/g;match=re.exec(contents);)tracks.push({artist:match[2],title:match[1],url:match[3]});0<tracks.length&&loadingCompleted()}console.log(window.location.hostname);
if(0==tracks.length&&isDesktop){for(re=/data-audio="\[([0-9-]+),([0-9-]+),.{1,300}?(http.{1,200}?mp3.{1,1000}?)&quot;,&quot;(.*?)&quot;,&quot;(.*?)&quot;/g;match=re.exec(contents);){console.log(match);var url=JSON.parse('["'+match[3]+'"]')[0];tracks.push({artist:match[5],title:match[4],url:url})}0<tracks.length&&tracks[0].url&&loadingCompleted()}
if(0==tracks.length){for(re=/\[([0-9-]+),([0-9-]+),.{1,200}?,&quot;(.{1,200}?)&quot;,&quot;(.{1,200}?)&quot;,.*?,.*?,.*?,.*?,.*?,.*?,.*?,.*?,(.*?),(.*?),/g;match=re.exec(contents);){url=null;var hashes=match[5];hashes=hashes.replace(/&quot;/g,"");hashes=hashes.replace(/\\\//g,"/");hashes=hashes.split("/");hashes[2]&&hashes[5]?tracks.push({identifier:""+match[1],ownerIdentifier:""+match[2],artist:""+match[4],title:""+match[3],actionHash:""+hashes[2],urlHash:""+hashes[5]}):console.log("Track "+match[4]+
" - "+match[3]+" is broken: "+hashes)}console.log("Found "+tracks.length+" tracks");console.log(tracks);prettifyTracks();loadTracksURLs()}var tracksLoaded=0;
function loadTracksURLs(){console.log("loadTracksURLs");for(var a=[],b=0;b<tracks.length;b++){var f=tracks[b];a.push(""+f.ownerIdentifier+"_"+f.identifier+"_"+f.actionHash+"_"+f.urlHash)}for(b=0;b<a.length;b+=10){f=a.slice(b,Math.min(a.length,b+10));console.log(b,f);var e=new XMLHttpRequest;e.open("POST",isDesktop?"/al_audio.php":"/audio",!0);e.responseType="text";e.withCredentials=!0;e.setRequestHeader("Content-type","application/x-www-form-urlencoded");e.onreadystatechange=function(){console.log(this);
console.log(e);if(4==this.readyState){var c=this.response||e.response;try{c=c.replace("\x3c!--",""),c=JSON.parse(c)}catch(l){c=null}console.log("<--",c);if(200==this.status&&c&&(tracksData=c.payload?c.payload[1][0]:c.data?c.data[0]:null,console.log("<-- ",tracksData),tracksData))for(c=0;c<tracksData.length;c++){for(var h=tracksData[c],g=JSON.parse('["'+h[2]+'"]')[0],d=null,b=0;b<tracks.length;b++){var k=tracks[b];k.identifier==h[0]&&k.ownerIdentifier==h[1]&&(d=k)}d?d.url=g:tracks.push({artist:h[4],
title:h[3],url:g})}tracksLoaded+=10;tracksLoaded>=a.length&&loadingCompleted()}};e.send("act=reload_audio&al=1&ids="+f.join("%2C"));console.log("--\x3e "+f.join(","))}}function loadingCompleted(){processTracksURLs();for(var a=0;a<tracks.length;a++){var b=tracks[a];tracks[a].name=b.artist&&b.title?b.artist+" - "+b.title:b.title?b.title:b.artist}"undefined"!==typeof completion&&completion(tracks)}
function processTracksURLs(){var a=contents.match(/vk_id=([0-9]+)/);if(a&&1<a.length){var b=function(c){if(!c||1==c.length%4)return!1;for(var a,g,d=0,b=0,e="";g=c.charAt(b++);)g="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=".indexOf(g),~g&&(a=d%4?64*a+g:g,d++%4)&&(e+=String.fromCharCode(255&a>>(-2*d&6)));return e},f=function(c){if(~c.indexOf("audio_api_unavailable")){var a=c.split("?extra=")[1].split("#"),g=""===a[1]?"":b(a[1]);if(a=b(a[0]),"string"!=typeof g||!a)return c;g=g?
g.split(String.fromCharCode(9)):[];for(var d,f,k=g.length;k--;){if(f=g[k].split(String.fromCharCode(11)),d=f.splice(0,1,a)[0],!e[d])return c;a=e[d].apply(null,f)}if(a&&"http"===a.substr(0,4))return a}return c};my_id=a[1];var e={v:function(a){return a.split("").reverse().join("")},r:function(a,b){a=a.split("");for(var c,d=a.length;d--;)c="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=".indexOf(a[d]),~c&&(a[d]="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=".substr(c-
b,1));return a.join("")},s:function(a,b){var c=a.length;if(c){var d=b,e=a.length,f=[];if(e){var h=e;for(d=Math.abs(d);h--;)d=(e*(h+1)^d+h)%e,f[h]=d}d=0;for(a=a.split("");++d<c;)a[d]=a.splice(f[c-1-d],1,a[d])[0];a=a.join("")}return a},i:function(a,b){return e.s(a,b^my_id)},x:function(a,b){var c=[];return b=b.charCodeAt(0),each(a.split(""),function(a,e){c.push(String.fromCharCode(e.charCodeAt(0)^b))}),c.join("")}};tracks.forEach(function(a){a.url&&(a.url=f(a.url))});prettifyTracks();filterTracks()}}
function prettifyTracks(){tracks.forEach(function(a){a.artist=a.artist.replace(/&amp;/g,"&");a.title=a.title.replace(/&amp;/g,"&");a.artist=a.artist.replace(/&#39;/g,"'");a.title=a.title.replace(/&#39;/g,"'");a.artist=a.artist.replace(/&#233;/g,"e");a.title=a.title.replace(/&#233;/g,"e");a.artist=a.artist.replace(/&#774;/g,"");a.title=a.title.replace(/&#774;/g,"");a.artist=a.artist.replace(/&quot;/g,"");a.title=a.title.replace(/&quot;/g,"");a.url&&-1==a.url.indexOf(".mp3?")&&(-1==a.url.indexOf("/audios/")?
a.url=a.url.replace(/\/\w*\/(\w*)\/index.m3u8/,"/$1.mp3"):a.url=a.url.replace(/\/\w*\/audios\/(\w*)\/index.m3u8/,"/audios/$1.mp3"))})}function filterTracks(){tracks=tracks.filter(function(a){return a.url&&-1==a.url.indexOf("unavailable")})};
