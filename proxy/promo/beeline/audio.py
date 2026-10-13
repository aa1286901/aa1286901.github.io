import json, wave, sys, numpy as np
from scipy.signal import butter, sosfilt
SR=48000; D=json.load(open('timing.json')); T=D['end']; N=int(T*SR)
L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(3)
tt=lambda d: np.arange(int(d*SR))/SR
noise=lambda d: rng.standard_normal(int(d*SR))
bp=lambda x,lo,hi: sosfilt(butter(2,[lo,hi],'band',fs=SR,output='sos'),x)
lp=lambda x,f: sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
hp=lambda x,f: sosfilt(butter(2,f,'high',fs=SR,output='sos'),x)
def add(sig,at,g=1.0,pan=0.0):
    i=int(at*SR)
    if i>=N or i<0: return
    n=min(len(sig),N-i); L[i:i+n]+=sig[:n]*g*(1-max(0,pan)); R[i:i+n]+=sig[:n]*g*(1+min(0,pan))
def key():
    t=tt(.07); f=rng.uniform(1800,3200)
    click=bp(noise(.07),f*.7,min(f*1.6,20000))*np.exp(-t*120)
    thock=np.sin(2*np.pi*rng.uniform(140,220)*t)*np.exp(-t*60)*.6
    return (click*.9+thock)*rng.uniform(.6,1)
def marker(d=.32):
    t=tt(d); x=bp(noise(d),2500,7000)*(np.sin(np.pi*t/d)**.6)
    return x*(.6+.4*np.sin(2*np.pi*35*t))*.5
def strike(): return marker(.25)*1.3
def pop(f=700):
    t=tt(.14); fr=f*(1+1.6*np.exp(-t*60)); return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*30)*.6
def thud(d=.5):
    t=tt(d); f=50+90*np.exp(-t*20); return np.tanh(2*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9))*.9
def slam():
    t=tt(1.0); return thud(1.0)+lp(noise(1.0),700)*np.exp(-t*7)*.6+hp(noise(1.0),4000)*np.exp(-t*25)*.2
def stamp():
    t=tt(.6); return thud(.6)*1.1+bp(noise(.6),300,2500)*np.exp(-t*30)*.8
def whoosh(d=.4):
    t=tt(d); n=noise(d); out=np.zeros_like(n); seg=40; h=len(n)//seg
    for k in range(seg):
        fc=400*(12**(k/seg)); a,b=k*h,(k+1)*h+300; p=bp(n[a:b],fc*.6,min(fc*1.6,20000)); out[a:a+len(p)]+=p*np.hanning(len(p))*.5
    return out*np.sin(np.pi*t/d)**2
def ding():
    t=tt(1.4); return sum(np.sin(2*np.pi*f*t)*np.exp(-t*3)*a for f,a in [(1318,.25),(1976,.12),(2637,.06)])
def draw(): return marker(.4)*.7
for k in D['keys']: add(key(),k,.55,pan=rng.uniform(-.15,.15))
M={'marker':(marker,.8),'pop':(pop,.7),'bounce':(lambda:thud(.35),.8),'strike':(strike,.9),'slam':(slam,1.0),'whoosh':(whoosh,.45),'stamp':(stamp,1.0),'draw':(draw,.6),'ding':(ding,.6)}
for name,at in D['sfx']:
    f,g=M[name]; add(f(),at,g)
mix=np.stack([L,R],1); t=np.arange(N)/SR; mix*=np.clip((T-t)/.3,0,1)[:,None]
mix=np.tanh(mix*1.2); mix/=np.max(np.abs(mix))/0.9
with wave.open(sys.argv[1],'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
