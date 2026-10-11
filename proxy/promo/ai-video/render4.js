const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{const FPS=30;const PL=fs.readFileSync(__dirname+'/plan.json','utf8');const TOT=JSON.parse(PL).total;
const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));await p.addInitScript(`window.PLAN=${PL};`);
await p.goto('file://'+__dirname+'/ai.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-i','audio4.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-b:a','192k','-shortest','raw4.mp4'],{stdio:['pipe','inherit','inherit']});
const NF=Math.round(TOT*FPS);
for(let i=0;i<NF;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300===0)console.log('frame',i,'/',NF)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
