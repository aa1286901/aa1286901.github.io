const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{const FPS=30;const TLs=fs.readFileSync(__dirname+'/timeline.json','utf8');const TOT=JSON.parse(TLs).total;
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));await p.addInitScript(`window.TL=${TLs};`);
await p.goto('file://'+__dirname+'/howto.html');await p.evaluate(()=>document.fonts.ready);
const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-i','audio3.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-b:a','192k','-shortest','raw3.mp4'],{stdio:['pipe','inherit','inherit']});
const NF=Math.round(TOT*FPS);
for(let i=0;i<NF;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150===0)console.log('frame',i,'/',NF)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
