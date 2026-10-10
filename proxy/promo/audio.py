import numpy as np
from scipy.signal import butter, sosfilt
import wave, sys

SR = 48000
DUR = 18.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
BEAT = 0.5  # 120 BPM


def tt(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)


def add(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    L[i:i+n] += sig[:n] * g * (1 - max(0, pan))
    R[i:i+n] += sig[:n] * g * (1 + min(0, pan))


def noise(d): return rng.standard_normal(int(d * SR))

# ---------- instruments ----------
def kick(big=False):
    t = tt(0.6 if big else 0.4)
    f = 45 + 140 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * (5 if big else 9))
    s += hp(noise(len(t) / SR), 2000) * np.exp(-t * 200) * .3
    return np.tanh(s * 1.6)

def clap():
    t = tt(0.25)
    n = bp(noise(.25), 900, 3500)
    env = np.exp(-t * 22)
    for d in (0.0, 0.012, 0.024):
        env += (t >= d) * np.exp(-np.clip(t - d, 0, None) * 90) * .6 * (t < d + .02)
    return n * env * .7

def hat(o=False):
    t = tt(0.25 if o else 0.06)
    return hp(noise(len(t) / SR), 7000, 4) * np.exp(-t * (14 if o else 70)) * .35

def impact(d=1.6):
    t = tt(d)
    f = 30 + 70 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    s += lp(noise(d), 600) * np.exp(-t * 5) * .8
    s += hp(noise(d), 3000) * np.exp(-t * 18) * .25
    return np.tanh(s * 1.5)

def whoosh(d=0.6, up=True):
    t = tt(d); n = noise(d); out = np.zeros_like(n)
    seg = 64
    hop = len(n) // seg
    for k in range(seg):
        x = k / (seg - 1)
        fc = 300 * (20 ** (x if up else 1 - x))
        a, b = k * hop, (k + 1) * hop + 400
        piece = bp(n[a:b], fc * .6, min(fc * 1.6, 20000))
        w = np.hanning(len(piece))
        out[a:a+len(piece)] += piece * w * .55
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * env

def riser(d):
    t = tt(d)
    f = 200 * (8 ** (t / d))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * .08
    nn = whoosh(d, True) * 1.4
    return (s + nn[:len(s)]) * (t / d) ** 2

def pop(f=900):
    t = tt(0.15)
    fr = f * (1 + 1.5 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 35) * .6

def click():
    t = tt(0.05)
    return (hp(noise(.05), 2500) * np.exp(-t * 150) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)) * .6

def tone(f, d, dec=4, shape='sine'):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)
    return s * np.exp(-t * dec) * np.minimum(1, t * 400)

def chime(freqs, d=1.2, step=0.06):
    out = np.zeros(int((d + step * len(freqs)) * SR))
    for i, f in enumerate(freqs):
        s = tone(f, d, 3.5) * .25
        a = int(i * step * SR); out[a:a+len(s)] += s
    return out

def buzz():
    t = tt(0.22)
    s = np.sign(np.sin(2 * np.pi * 110 * t)) * .3 + np.sign(np.sin(2 * np.pi * 116 * t)) * .3
    return lp(s, 1800) * np.exp(-t * 6) * .55

def glitch(d=0.12):
    t = tt(d)
    s = np.sign(np.sin(2 * np.pi * rng.uniform(200, 1500) * t)) * .3
    s = np.round(s * 4) / 4 + hp(noise(d), 4000) * .2
    s *= (np.floor(t * 120) % 2)
    return s * .55

def glass(d=1.4):
    out = hp(noise(d), 3500, 4) * np.exp(-tt(d) * 6) * .6
    for k in range(26):
        f = rng.uniform(2500, 7500); at = rng.uniform(0, .7)
        s = np.sin(2 * np.pi * f * tt(.4)) * np.exp(-tt(.4) * rng.uniform(10, 25)) * .18
        a = int(at * SR); out[a:a+len(s)] += s[:len(out) - a]
    return out

def crackle(d):
    out = np.zeros(int(d * SR))
    for k in range(40):
        a = int(rng.uniform(0, d - .02) * SR)
        s = hp(noise(.015), 2000) * np.exp(-tt(.015) * 300) * rng.uniform(.3, .8)
        out[a:a+len(s)] += s
    return out

def saw(f, t):
    return 2 * ((f * t) % 1) - 1

def pad(freqs, d, cutoff=1200, det=0.004):
    t = tt(d)
    l = sum(saw(f * (1 - det), t) for f in freqs)
    r = sum(saw(f * (1 + det), t) for f in freqs)
    env = np.minimum(1, t / .3) * np.minimum(1, (d - t) / .4)
    return lp(l, cutoff) * env * .08, lp(r, cutoff) * env * .08

def bass(f, d):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .25 * np.tanh(3 * np.sin(2 * np.pi * f * t))
    return s * np.exp(-t * 2.5) * np.minimum(1, t * 300) * .5

def add_st(lr, at, g=1.0):
    l, r = lr; i = int(at * SR); n = min(len(l), N - i)
    if n <= 0: return
    L[i:i+n] += l[:n] * g; R[i:i+n] += r[:n] * g

# ---------- music ----------
A1, F1, C2, G1, E1, D2 = 55.0, 43.65, 65.41, 49.0, 41.2, 73.42
note = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = {  # chord tones (midi)
    'Am': [57, 60, 64, 69], 'F': [53, 57, 60, 65], 'C': [55, 60, 64, 67], 'G': [55, 59, 62, 67], 'E': [56, 59, 64, 68]
}
ROOT = {'Am': A1, 'F': F1, 'C': C2, 'G': G1, 'E': E1}

# intro tension 0-6: dark pad + pulsing bass on 8ths + ticking hats
for bar, ch in enumerate(['Am', 'F', 'E']):
    t0 = bar * 2.0
    add_st(pad([note(m) for m in CH[ch]], 2.05, 700), t0, .9)
    for k in range(8):
        if t0 + k * .25 < 5.75:
            add(bass(ROOT[ch] * 2, .22), t0 + k * .25, .32)
    for k in range(16):
        tk = t0 + k * .125
        if tk < 5.7: add(hat(), tk, .25 + .15 * (k % 2 == 0), pan=.3 if k % 2 else -.3)
add(riser(2.0), 3.9, 1.0)

# drop 6-14.5
prog = ['Am', 'F', 'C', 'G']
t0 = 6.0; bi = 0
while t0 < 14.5:
    ch = prog[bi % 4]
    add_st(pad([note(m) for m in CH[ch]] + [note(CH[ch][0] + 12)], 2.05, 2400), t0, 1.0)
    for k in range(4):
        tb = t0 + k * BEAT
        if tb >= 14.5: break
        add(kick(), tb, .95)
        if k % 2 == 1: add(clap(), tb, .55)
        add(hat(True), tb + .25, .35, pan=.2)
        add(hat(), tb + .125, .2, pan=-.3); add(hat(), tb + .375, .2, pan=.3)
        add(bass(ROOT[ch], .45), tb, .8)
        add(bass(ROOT[ch] * 2, .2), tb + .25, .35)
    # arp lead
    for k in range(8):
        m = CH[ch][[0, 1, 2, 3, 2, 1, 3, 2][k]] + 12
        tb = t0 + k * .25
        if tb < 14.4: add(tone(note(m), .3, 9) * .09, tb, 1, pan=(-.4 if k % 2 else .4))
    t0 += 2.0; bi += 1

# outro 14.5-18: big chord + halftime
add_st(pad([note(m) for m in [57, 60, 64, 69, 72, 76]], 3.5, 3000), 14.5, 1.3)
add(bass(A1, 3.0) * np.exp(-tt(3.0) * 0.0)[:int(3.0*SR)], 14.5, .8)
for tb in (14.5, 15.5, 16.5):
    add(kick(), tb, .8)
for tb in (15.0, 16.0, 17.0):
    add(clap(), tb, .45)
for k in range(24):
    tb = 14.5 + k * .125
    add(hat(), tb, .12 * (1 - k / 24), pan=.3 if k % 2 else -.3)

# ---------- SFX ----------
add(impact(1.0), 0.15, .9); add(whoosh(.35, False), -0.05, .6)
add(impact(1.0), 0.62, .7); add(whoosh(.3, True), .4, .4)
add(whoosh(.35, True), 1.30, .5); add(click(), 1.62, .6)
for g in (0.95, 1.3, 2.05, 2.25, 2.4, 2.55, 2.78):
    add(glitch(rng.uniform(.06, .14)), g, .6, pan=rng.uniform(-.5, .5))
add(whoosh(.5, True), 2.7, .9); add(impact(1.2), 3.05, .8)
add(whoosh(.6, True), 3.05, .5)
for k in range(3): add(pop(700 + k * 200), 3.45 + k * .12, .7, pan=(-.4, .4, -.2)[k])
for k in range(3): add(buzz(), 3.95 + k * .22, .7, pan=(-.4, .4, -.2)[k])
add(crackle(.4), 4.6, .7)
add(glass(1.6), 5.0, 1.0); add(impact(1.5), 5.0, 1.0)
add(kick(True), 5.05, .7)
add(whoosh(.45, True), 5.6, .7)
add(impact(2.0), 6.0, 1.2); add(kick(True), 6.0, .6); add(hp(noise(1.0), 5000) * np.exp(-tt(1.0) * 4) * .25, 6.0, 1)
add(whoosh(.5, True), 6.3, .5)
for k in range(3): add(whoosh(.4, False), 7.0 + k * .12, .25, pan=.4)
add(whoosh(.35, True), 7.75, .3)
add(click(), 8.35, 1.0)
add(chime([note(m) for m in (72, 76, 79, 84)], 1.2, .05), 8.45, 1.0)
add(whoosh(.5, True), 10.2, .9); add(impact(1.0), 10.5, .6)
for k in range(3):
    add(whoosh(.3, True), 10.5 + k * .45, .4); add(pop(500 + k * 150), 10.75 + k * .45, .6)
# counting ticks
for k in range(14):
    x = k / 13
    tk = 12.35 + (1 - (1 - x) ** 3) * .85
    add(tone(1400 + k * 60, .05, 60) * .5, tk, .5)
add(chime([note(m) for m in (79, 84, 88)], 1.0, .04), 13.2, 1.0)
add(riser(1.0), 13.5, .8)
add(impact(2.5), 14.5, 1.2); add(kick(True), 14.5, .6)
add(glass(1.0) * .5, 14.6, .5)
add(chime([note(m) for m in (81, 84, 88, 93)], 1.6, .07), 15.0, .8)
add(pop(1000), 15.75, .5); add(pop(1200), 15.85, .5)
add(whoosh(.4, True), 15.9, .5); add(impact(.8), 16.15, .4)
add(whoosh(.6, True), 16.5, .35)

# ---------- master ----------
mix = np.stack([L, R], 1)
t = np.arange(N) / SR
fade = np.clip((DUR - t) / 1.2, 0, 1)[:, None]
mix *= fade
mix = np.tanh(mix * 1.1)
mix /= np.max(np.abs(mix)) / 0.93
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
