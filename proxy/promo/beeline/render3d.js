const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {spawn}=require('child_process');
(async()=>{const FPS=30,DUR=18;const b=await chromium.launch({args:['--allow-file-access-from-files','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+__dirname+'/beeline3d.html');await p.waitForFunction(()=>window.READY);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-i','sfx.wav','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','raw.mp4'],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<FPS*DUR;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%120===0)console.log('frame',i)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
