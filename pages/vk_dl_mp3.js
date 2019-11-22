// js by Pash234 (4pda)

for(var contents=document.getElementsByTagName("html")[0].innerHTML,match,re=/title.{1,30}?>(.{1,70}?)<.{1,300}?artist.{1,30}?>(.{1,70}?)<.{1,300}?"(http.+?mp3.+?)"/gs,tracks=[];
match=re.exec(contents);)tracks.push({title:""+match[2]+" \u2013 "+match[1],url:match[3]});var idMatch=contents.match(/vk_id=([0-9]+)/);
if(idMatch&&1<idMatch.length){var s=function(b,c){var d=b.length,f=[];if(d){var e=d;for(c=Math.abs(c);e--;)c=(d*(e+1)^c+e)%d,f[e]=c}return f},a=function(b){
if(!b||1==b.length%4)return!1;for(var c,d,f=0,e=0,g="";d=b.charAt(e++);)d=r.indexOf(d),~d&&(c=f%4?64*c+d:d,f++%4)&&(g+=String.fromCharCode(255&c>>(-2*f&6)));return g},
getRealLink=function(b){if(~b.indexOf("audio_api_unavailable")){var c=b.split("?extra=")[1].split("#"),d=""===c[1]?"":a(c[1]);if(c=a(c[0]),"string"!=typeof d||!c)return b;d=d?d.split(String.fromCharCode(9)):
[];for(var f,e,g=d.length;g--;){if(e=d[g].split(String.fromCharCode(11)),f=e.splice(0,1,c)[0],!l[f])return b;c=l[f].apply(null,e)}if(c&&"http"===c.substr(0,4))return c}
return b};my_id=idMatch[1];var r="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=",l={v:function(b){return b.split("").reverse().join("")},r:function(b,c){b=b.split("");
for(var d,f=r+r,e=b.length;e--;)d=f.indexOf(b[e]),~d&&(b[e]=f.substr(d-c,1));return b.join("")},s:function(b,c){var d=b.length;if(d){var f=s(b,c),
e=0;for(b=b.split("");++e<d;)b[e]=b.splice(f[d-1-e],1,b[e])[0];b=b.join("")}return b},i:function(b,c){return l.s(b,c^my_id)},x:function(b,c){var d=[];return c=c.charCodeAt(0),each(b.split(""),
function(b,e){d.push(String.fromCharCode(e.charCodeAt(0)^c))}),d.join("")}};tracks.forEach(function(track){track.title = track.title.replace(/&amp;/g, '&');track.url = getRealLink(track.url);if (track.url.indexOf(".mp3?") == -1) {if (track.url.indexOf("/audios/") == -1) {track.url = track.url.replace(/\/\w*\/(\w*)\/index.m3u8/,'/$1.mp3');} else {track.url = track.url.replace(/\/\w*\/audios\/(\w*)\/index.m3u8/,'/audios/$1.mp3');}}});tracks=tracks.filter(function(b){
return-1==b.url.indexOf("unavailable")&&-1==b.title.toLowerCase().indexOf("\u043c\u0438\u043b\u043e\u0441")})};


completion(tracks);
