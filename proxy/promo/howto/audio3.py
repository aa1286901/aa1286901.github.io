import sys, os, json
import numpy as np
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'audio.py')).read()
TLD=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'timeline.json')))
code=src.split('# ---------- music ----------')[0].replace('DUR = 18.0',f"DUR = {TLD['total']}")
exec(code)
rng=np.random.default_rng(5)
note=lambda m:440*2**((m-69)/12)
S=TLD['shots']; T=TLD['total']
CH=[s for s in S if s.get('g')=='chapter'][0]; OUT=[s for s in S if s.get('g')=='outro'][0]
INTRO_END=S[1]['t0']
CHORDS=[[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]]  # C G Am F
ROOT=[36,43,45,41]
def section(t0,t1,full=True):
    b=0;t=t0
    while t<t1-0.05:
        i=b%4; d=min(2.0,t1-t)
        add_st(pad([note(m) for m in CHORDS[i]],d+.05,2600 if full else 900),t,1.0 if full else .7)
        for k in range(4):
            tb=t+k*.5
            if tb>=t1-.01: break
            if full:
                add(kick(),tb,.85)
                if k%2: add(clap(),tb,.45)
                add(hat(True),tb+.25,.28,pan=.2)
                add(bass(note(ROOT[i]),.4),tb,.7); add(bass(note(ROOT[i]+12),.2),tb+.25,.3)
            add(hat(),tb+.125,.16,pan=-.3); add(hat(),tb+.375,.16,pan=.3)
        if full:
            for k in range(8):
                tb=t+k*.25
                if tb<t1-.05: add(tone(note(CHORDS[i][[0,2,1,3,2,1,3,2][k]]+12),.28,10)*.08,tb,1,pan=(-.35 if k%2 else .35))
        t+=2.0;b+=1
# intro: filtered then drop at INTRO_END
section(0,INTRO_END,False); add(riser(1.4),INTRO_END-1.4,.8)
section(INTRO_END,CH['t0'],True)
# chapter: breakdown + riser
add_st(pad([note(m) for m in [57,60,64,69]],CH['dur']+.1,1200),CH['t0'],.9)
add(riser(CH['dur']),CH['t0'],.7)
section(CH['t0']+CH['dur'],OUT['t0'],True)
# outro
add_st(pad([note(m) for m in [60,64,67,72,76,79]],OUT['dur'],3200),OUT['t0'],1.3)
add(bass(note(36),3.0),OUT['t0'],.8)
for k in range(int(OUT['dur']/1.0)): add(kick(),OUT['t0']+k,.7); add(clap(),OUT['t0']+k+.5,.35)
# SFX
add(impact(1.2),.7,.7); add(whoosh(.4,True),.5,.4); add(pop(900),1.4,.5)
add(impact(1.6),INTRO_END,1.0); add(whoosh(.6,True),INTRO_END-.5,.8)
prev=None
for s in S:
    if not s.get('g') and prev and not prev.get('g') and abs(prev['e']-s['s'])>.01:
        add(whoosh(.3,True),s['t0']-.15,.5,pan=rng.uniform(-.4,.4))
    if not s.get('g'):
        for T0,x,y in s['taps']: add(click(),T0,1.0); add(pop(500),T0+.01,.35)
    if s.get('success'):
        add(chime([note(m) for m in (72,76,79,84)],1.2,.05),s['success'],1.0); add(impact(1.0),s['success'],.6); add(glass(.8)*.4,s['success'],.4)
    prev=s
add(whoosh(.5,True),CH['t0']-.2,.9); add(impact(1.2),CH['t0']+.15,.8); add(whoosh(.5,True),CH['t0']+CH['dur']-.4,.8)
add(impact(1.6),CH['t0']+CH['dur'],.9)
# connecting tick during fast-forward
s13=S[13]; 
for k in range(10): add(tone(1500,.04,80)*.4,s13['t0']+k*.1,.4)
O=OUT['t0']; add(whoosh(.5,False),O-.1,.7); add(impact(2.0),O+.2,1.0)
for k in range(2): add(pop(900+k*200),O+.6+k*.15,.5)
add(chime([note(m) for m in (79,84,88,91)],1.5,.07),O+1.0,.7); add(whoosh(.4,True),O+1.85,.4); add(impact(.8),O+2.1,.4); add(whoosh(.6,True),O+2.6,.3)
mix=np.stack([L,R],1); t=np.arange(N)/SR
mix*=np.clip((DUR-t)/1.5,0,1)[:,None]; mix=np.tanh(mix*1.1); mix/=np.max(np.abs(mix))/0.93
pcm=(mix*32767).astype(np.int16)
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('ok',DUR)
