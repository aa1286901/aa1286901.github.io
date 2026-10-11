import json, subprocess, os, shutil
FPS=30
# footage shots: src window, speed, camera (zoom z0->z1, focus f0->f1 in 444x960 coords), taps [srcT,x,y], caption id
S=[
 dict(g='intro',dur=3.2),
 dict(s=1.15,e=2.25,sp=1,cam=[1.0,1.35,(222,520),(90,470)],taps=[(2.0,66,450)],cap='c1'),
 dict(s=4.8,e=14.6,sp=5,cam=[1.15,1.15,(222,330),(222,330)],taps=[],cap='c1'),
 dict(s=15.0,e=18.0,sp=3,cam=[1.0,1.15,(222,400),(140,420)],taps=[(17.75,114,420)],cap='c1'),
 dict(s=18.0,e=25.72,sp=4,cam=[1.0,1.3,(222,480),(150,260)],taps=[(25.6,120,204)],cap='c2'),
 dict(s=25.72,e=27.2,sp=1.5,cam=[1.15,1.3,(222,560),(222,660)],taps=[(27.0,222,732)],cap='c2'),
 dict(s=27.2,e=29.75,sp=1.5,cam=[1.0,1.5,(222,560),(222,800)],taps=[(29.68,222,887)],cap='c3'),
 dict(s=29.75,e=30.5,sp=1,cam=[1.45,1.45,(222,560),(222,540)],taps=[(30.38,222,531)],cap='c3'),
 dict(s=30.5,e=32.9,sp=1,cam=[1.2,2.0,(222,500),(222,492)],taps=[],cap='c4',success=31.2),
 dict(g='chapter',dur=1.4),
 dict(s=44.55,e=47.0,sp=2,cam=[1.1,1.3,(170,300),(222,640)],taps=[(45.3,120,204),(46.6,222,711)],cap='c5'),
 dict(s=50.0,e=51.25,sp=1,cam=[1.2,1.45,(260,220),(330,160)],taps=[(51.1,352,104)],cap='c6'),
 dict(s=51.25,e=53.1,sp=1.5,cam=[1.3,1.6,(260,260),(330,210)],taps=[(52.9,368,189)],cap='c6'),
 dict(s=53.1,e=61.2,sp=8,cam=[1.3,1.3,(222,420),(222,420)],taps=[],cap='c6b'),
 dict(s=61.2,e=61.55,sp=1,dur=2.1,cam=[1.4,2.2,(222,380),(190,392)],taps=[],cap='c7',success=61.3),
 dict(g='outro',dur=4.6),
]
os.makedirs('fr',exist_ok=True)
t=0;out=[]
for k,sh in enumerate(S):
    sh=dict(sh); sh['t0']=round(t,4)
    if 'g' not in sh:
        nat=(sh['e']-sh['s'])/sh['sp']; sh['dur']=sh.get('dur',nat)
        d=f'fr/s{k}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
        subprocess.run(['ffmpeg','-loglevel','error','-y','-i','clean.mp4','-vf',
          f"trim=start={sh['s']}:end={sh['e']},setpts=(PTS-STARTPTS)/{sh['sp']},fps={FPS},scale=888:1920:flags=lanczos,unsharp=5:5:0.6",
          '-q:v','2',f'{d}/%04d.jpg'],check=True)
        sh['n']=len(os.listdir(d)); sh['dir']=d
        sh['taps']=[[round(t+(a-sh['s'])/sh['sp'],3),x,y] for a,x,y in sh['taps']]
        if 'success' in sh: sh['success']=round(t+(sh['success']-sh['s'])/sh['sp'],3)
    t+=sh['dur']; out.append(sh)
json.dump(dict(total=round(t,3),shots=out),open('timeline.json','w'),indent=1)
print('total',round(t,2)); [print(k,s.get('g',''),s['t0'],round(s['dur'],2),s.get('n',''),s.get('taps','')) for k,s in enumerate(out)]
