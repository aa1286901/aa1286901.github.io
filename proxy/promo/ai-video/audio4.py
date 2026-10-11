import sys, os, json
import numpy as np
D=os.path.dirname(os.path.abspath(__file__))
PL=json.load(open(os.path.join(D,'plan.json'))); S=PL['sc']; T=PL['total']
src=open(os.path.join(D,'audio.py')).read().split('# ---------- music ----------')[0].replace('DUR = 18.0',f'DUR = {T}')
exec(src)
rng=np.random.default_rng(11)
note=lambda m:440*2**((m-69)/12)
ML=np.zeros(N); MR=np.zeros(N)  # music bus (ducked later)
def madd(sig,at,g=1.0,pan=0.0):
    i=int(at*SR)
    if i>=N or i<0: return
    n=min(len(sig),N-i); ML[i:i+n]+=sig[:n]*g*(1-max(0,pan)); MR[i:i+n]+=sig[:n]*g*(1+min(0,pan))
def madd_st(lr,at,g=1.0):
    l,r=lr;i=int(at*SR);n=min(len(l),N-i)
    if n<=0: return
    ML[i:i+n]+=l[:n]*g; MR[i:i+n]+=r[:n]*g
CH=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]  # Am F C G
RT=[45,41,36,43]
def section(t0,t1,full=True,arp=True):
    b=0;t=t0
    while t<t1-.05:
        i=b%4;d=min(2.0,t1-t)
        madd_st(pad([note(m) for m in CH[i]],d+.05,2800 if full else 800),t,.9 if full else .7)
        for k in range(4):
            tb=t+k*.5
            if tb>=t1-.01:break
            if full:
                madd(kick(),tb,.85)
                if k%2: madd(clap(),tb,.42)
                madd(hat(True),tb+.25,.25,pan=.2)
                madd(bass(note(RT[i]),.42),tb,.75);madd(bass(note(RT[i]+12),.2),tb+.25,.3)
            madd(hat(),tb+.125,.15,pan=-.3);madd(hat(),tb+.375,.15,pan=.3)
        if full and arp:
            for k in range(8):
                tb=t+k*.25
                if tb<t1-.05: madd(tone(note(CH[i][[0,2,1,3,2,1,3,2][k]]+12),.28,10)*.07,tb,1,pan=(-.35 if k%2 else .35))
        t+=2.0;b+=1
# --- structure
section(0,S['hookNot'],False,False); madd(riser(1.8),S['hookNot']-1.8,.7)
section(S['hookNot'],S['s3'],False)          # filtered intro under "me"
madd(riser(1.2),S['s3']-1.2,.6)
section(S['s3'],S['s6'],True)                 # main drive
madd_st(pad([note(m) for m in [45,52,57,60]],S['s7']-S['s6'],500),S['s6'],.8)   # dark drone in reveal
for k in range(int((S['rClaude']-S['s6'])/0.8)):  # heartbeat
    tb=S['s6']+.4+k*.8
    if tb<S['rClaude']-.2: madd(kick()*.7,tb,.6); madd(kick()*.5,tb+.18,.4)
madd(riser(1.4),S['rClaude']-1.4,.5)
madd_st(pad([note(m) for m in [57,60,64,69,72]],S['s7']-S['rClaude'],1800),S['rClaude'],.7)
madd(riser(1.0),S['s7']-1.0,.6)
section(S['s7'],T,True)
madd_st(pad([note(m) for m in [57,60,64,69,72,76]],T-S['s7'],3200),S['s7'],.8)
# --- SFX (main bus, not ducked)
for i in range(22): add(click()*.5,0.3+i*0.066,.35,pan=rng.uniform(-.2,.2))
add(impact(1.6),S['hookNot'],1.0); add(kick(True),S['hookNot'],.7)
for g in (S['hookNot']+.05,S['hookNot']+.35,S['hookNot']+.6): add(glitch(.1),g,.5)
for c in (S['s2'],S['s3'],S['s4'],S['s6'],S['s7']): add(whoosh(.5,True),c-.3,.8)
add(whoosh(.6,True),S['s5']-.32,1.0); add(impact(1.0),S['s5'],.7)
add(pop(800),S['s2']+.25,.5); add(chime([note(m) for m in (76,81,84)],.8,.05),S['s2']+.5,.5)
add(whoosh(.4,True),S['s2']+1.9,.35,pan=-.4); add(whoosh(.4,True),S['s2']+2.0,.35,pan=.4)
for k in range(8): add(tone(1800+k*90,.08,40)*.4,S['s2']+4.3+k*.12,.35,pan=rng.uniform(-.5,.5))
add(whoosh(.7,True),S['s3']+.05,.6,pan=-.5); add(whoosh(.7,True),S['s3']+.05,.6,pan=.5)
add(impact(.8),S['s3']+.65,.6)
add(impact(2.0),S['vsHit'],.75); add(glass(1.2)*.6,S['vsHit'],.35); add(kick(True),S['vsHit'],.7)
add(pop(600),S['vsBoth'],.6)
add(pop(900),S['s4']+.5,.4)
for i in range(30): add(click()*.35,S['s4']+.6+i*.043,.25)
add(riser(S['gB']-.3-(S['s4']+2.1))*0.9,S['s4']+2.1,.5)
add(chime([note(m) for m in (79,83,86,91)],1.0,.05),S['gB']-.3,.6)
for k in range(3): add(whoosh(.35,True),S['gB']+k*.15,.4,pan=(-.5,0,.5)[k]); add(pop(700+k*120),S['gB']+.4+k*.25,.4)
add(whoosh(1.6,True)*.6,S['gC']+.6,.5)
add(pop(1000),S['gC']+2.2,.5)
add(whoosh(.5,True),S['gD'],.6)
def coins(at):
    for k in range(10): add(tone(2200+rng.uniform(-300,500),.25,18)*.5,at+k*.07,.4,pan=rng.uniform(-.6,.6))
    add(chime([note(m) for m in (84,88,91)],.8,.03),at+.9,.6)
coins(S['gPrice']); coins(S['cPrice'])
for i in range(40): add(click()*.35,S['s5']+.5+i*.06,.25,pan=rng.uniform(-.2,.2))
add(whoosh(.5,True),S['cB']-1.0,.6)
for k in range(15): add(pop(400+(k%5)*120),S['cB']+.1+k*.05,.2,pan=rng.uniform(-.5,.5))
for k in range(3): add(whoosh(.4,True),S['cC']+k*.12,.4,pan=(-.5,0,.5)[k])
for k,tc in enumerate(S['cChips']): add(pop(700+k*100),tc,.5)
add(whoosh(.6,True),S['cD']+.5,.4)
add(whoosh(.5,True),S['cE'],.6)
add(pop(500),S['s6']+.35,.5)
add(whoosh(.6,False),S['rT1'],.5)
add(impact(2.5),S['rClaude'],1.3); add(kick(True),S['rClaude'],.8); add(glass(1.0)*.5,S['rClaude'],.5)
add(chime([note(m) for m in (81,84,88,93)],1.4,.06),S['rVoice']+.3,.5)
a=S['s7']; add(impact(1.6),a,.9); add(pop(900),a+.1,.5)
for k in range(2): add(whoosh(.4,True),a+.9+k*.15,.4,pan=(-.5,.5)[k])
add(pop(700),a+1.45,.6); add(chime([note(m) for m in (76,81,84,88)],1.2,.05),a+1.8,.6); add(whoosh(.6,True),a+2.2,.3)
# --- voice + ducking
vo=np.load(os.path.join(D,'vo.npy'))[:N]
env=np.abs(vo); k=int(SR*.15); envs=np.convolve(env,np.ones(k)/k,mode='same')
duck=1-0.72*np.clip(envs/ (np.max(envs)*.35),0,1)
mixL=L*0.8+ML*duck*0.75+vo*1.7; mixR=R*0.8+MR*duck*0.75+vo*1.7
mix=np.stack([mixL,mixR],1); t=np.arange(N)/SR
mix*=np.clip((T-t)/1.2,0,1)[:,None]; mix=np.tanh(mix*1.05); mix/=np.max(np.abs(mix))/0.93
pcm=(mix*32767).astype(np.int16)
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('ok',T)
