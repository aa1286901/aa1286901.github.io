import json, sys, os, numpy as np
D=json.load(open('timing.json')); T=D['end']
src=open('synth.py').read().split('# ---------- music ----------')[0].replace('DUR = 18.0',f'DUR = {T}')
exec(src)
rng=np.random.default_rng(9)
note=lambda m:440*2**((m-69)/12)
def beam():
    t=tt(.7); f=600*(6**(t/.7)); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/.7)**2*.18+hp(noise(.7),5000)*np.sin(np.pi*t/.7)**2*.15
def shimmer():
    out=np.zeros(int(1.2*SR))
    for k in range(14):
        s=tone(note(84+(k*5)%24),.5,8)*.12; a=int(k*.05*SR); out[a:a+len(s)]+=s[:len(out)-a]
    return out
def glasst(): return chime([note(96),note(103)],.6,.02)*.8
def alert():
    t=tt(.22); return (np.sin(2*np.pi*880*t)+.4*np.sin(2*np.pi*1760*t))*np.exp(-t*12)*np.minimum(1,t*300)*.35
M={'riser':(lambda:riser(1.0),.6),'beam':(beam,1.0),'boom':(lambda:impact(2.0),1.0),'whoosh':(lambda:whoosh(.5,True),.7),'impact':(lambda:(lambda a,b:np.concatenate([a[:len(b)]+b,a[len(b):]]))(impact(1.8),kick(True)*.6),1.1),
   'shimmer':(shimmer,.8),'glass':(glasst,.8),'coin':(lambda:chime([note(88),note(93),note(100)],.8,.04),.8),'tick':(lambda:pop(1400),.45),
   'chime':(lambda:chime([note(m) for m in (76,81,84,88)],1.4,.06),.8),'alert':(alert,.9),'pop':(lambda:pop(700),.7),'ding':(lambda:chime([note(88),note(95)],1.2,.03),.6)}
for name,at in D['sfx']:
    f,g=M[name]; add(f(),at,g,pan=rng.uniform(-.2,.2))
# soft key ticks while the phone number is typed
for k in range(16): add(click()*.5,14.4+1.9+k*.044,.3)
mix=np.stack([L,R],1); t=np.arange(N)/SR; mix*=np.clip((T-t)/.6,0,1)[:,None]
mix=np.tanh(mix*1.1); mix/=np.max(np.abs(mix))/0.9
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok',T)
