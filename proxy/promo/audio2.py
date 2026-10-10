import sys, os
import numpy as np
# reuse instruments from audio.py (everything before the music section)
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio.py')).read()
exec(src.split('# ---------- music ----------')[0])
rng = np.random.default_rng(21)
note = lambda m: 440 * 2 ** ((m - 69) / 12)

def sub808(f0, d, glide_to=None):
    t = tt(d)
    f = np.full_like(t, f0) if glide_to is None else f0 + (glide_to - f0) * np.clip(t / .12, 0, 1)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(s * 2.2) * np.exp(-t * 1.6) * np.minimum(1, t * 500)
    return s * .55

def snare():
    t = tt(.3)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .5
    n = bp(noise(.3), 1500, 8000) * np.exp(-t * 16) * .8
    return body + n

def ding(f):
    t = tt(.9)
    s = (np.sin(2*np.pi*f*t) + .5*np.sin(2*np.pi*f*2.01*t) + .2*np.sin(2*np.pi*f*3*t)) * np.exp(-t*6)
    return s * np.minimum(1, t*800) * .3

def bell_pad(freqs, d, cutoff):
    return pad(freqs, d, cutoff, .006)

# ---------- music: halftime trap, 120 BPM (beat 0.5s, bar 2s) ----------
CHORD = {'Dm': [50, 57, 62, 65, 69], 'Bb': [46, 53, 58, 62, 65], 'F': [53, 57, 60, 65, 69], 'C': [48, 55, 60, 64, 67]}
ROOTS = {'Dm': 38, 'Bb': 34, 'F': 41, 'C': 36}
prog = ['Dm', 'Bb', 'F', 'C']

def bar(t0, ch, full=True, filt=None):
    if filt is None:
        add_st(bell_pad([note(m) for m in CHORD[ch]], 2.05, 2600 if full else 900), t0, 1.0 if full else .8)
    else:
        add_st(bell_pad([note(m) for m in CHORD[ch]], 2.05, filt), t0, .8)
    r = note(ROOTS[ch])
    if full:
        # kick pattern (16ths): 0, 6, 10
        for s16 in (0, 6, 10):
            add(kick(), t0 + s16 * .125, .9)
        add(sub808(r, .7), t0, .9); add(sub808(r, .4, r * 1.5), t0 + .75, .7); add(sub808(r * 1.5, .5, r), t0 + 1.25, .7)
        add(snare(), t0 + 1.0, .7)
        add(clap(), t0 + 1.0, .3)
        for k in range(16):
            tk = t0 + k * .125
            if k in (13, 14, 15):  # triplet-ish roll at bar end
                for j in range(3): add(hat(), tk + j * .0417, .18, pan=.3)
            else:
                add(hat(), tk, .22 if k % 2 else .3, pan=-.25 if k % 2 else .25)
        # pluck melody
        mel = [CHORD[ch][i] + 12 for i in (4, 3, 2, 3, 4, 2, 3, 1)]
        for k, m in enumerate(mel):
            add(tone(note(m), .25, 12) * .1, t0 + k * .25, 1, pan=(-.35 if k % 2 else .35))
    else:
        for k in range(8):
            add(hat(), t0 + k * .25, .15, pan=.25 if k % 2 else -.25)
        add(sub808(r, 1.8), t0, .35)

# 0-4: filtered intro
bar(0, 'Dm', False); bar(2, 'Bb', False)
add(riser(1.6), 2.4, .6)
# 4-14.5: full
t0 = 4.0; i = 0
while t0 < 14.4:
    bar(t0, prog[i % 4]); t0 += 2.0; i += 1
# 14.5-18 outro: big chord
add_st(bell_pad([note(m) for m in [50, 57, 62, 65, 69, 74, 77]], 3.5, 3200), 14.5, 1.3)
add(sub808(note(38), 3.0), 14.5, .8)
add(kick(True), 14.5, .8); add(kick(), 15.5, .6); add(snare(), 16.5, .45)
for k in range(16): add(hat(), 14.5 + k * .1875, .12 * (1 - k / 16), pan=.3 if k % 2 else -.3)

# ---------- SFX ----------
for k, tn in enumerate((.3, .8, 1.3, 1.8)):
    if k < 2: add(ding(note(84)), tn, .8); add(ding(note(88)), tn + .08, .6)
    else: add(buzz(), tn, .8); add(ding(note(76)), tn, .4)
    add(whoosh(.25, False), tn - .1, .25)
add(whoosh(.4, False), 2.2, .5)
add(impact(1.4), 2.5, 1.0); add(kick(True), 2.5, .6)
for c in (4.0, 7.5, 11.0, 14.5):
    add(whoosh(.64, True), c - .32, 1.0, pan=.3); add(whoosh(.5, False), c - .1, .5, pan=-.3)
add(whoosh(.4, True), 4.1, .4, pan=-.5); add(whoosh(.4, True), 4.2, .4, pan=.5)
add(riser(.3) * 2, 4.75, .6, pan=-.4)
for k in range(4): add(buzz(), 5.0 + k * .08, .45, pan=-.5)
for k in range(2): add(chime([note(84 + k * 4), note(91 + k * 4)], .6, .04), 5.55 + k * .12, .7, pan=.5)
add(pop(800), 6.2, .6)
add(whoosh(.4, True), 7.6, .5)
add(click(), 8.15, 1.2); add(pop(400), 8.17, .6)
add(impact(1.0), 8.2, .7)
add(chime([note(m) for m in (74, 77, 81, 86)], 1.0, .05), 8.25, 1.0)
add(glass(.8) * .4, 8.3, .5)
add(whoosh(.4, True), 9.0, .4, pan=-.5); add(whoosh(.4, True), 9.2, .4, pan=.5)
add(impact(1.0), 11.05, .6)
for k in range(3): add(whoosh(.35, True), 11.35 + k * .25, .4, pan=(-.5, 0, .5)[k]); add(pop(600 + k * 150), 11.6 + k * .25, .5)
add(chime([note(m) for m in (81, 86, 89)], .9, .04), 12.55, .9); add(impact(.8), 12.55, .5)
add(ding(note(93)), 13.1, .6)
add(riser(1.0), 13.4, .7)
add(impact(2.5), 14.55, 1.1)
add(whoosh(.35, True), 14.7, .4, pan=-.6); add(whoosh(.35, True), 14.8, .4, pan=.6)
add(pop(900), 14.95, .5); add(pop(1100), 15.05, .5)
add(chime([note(m) for m in (86, 89, 93, 98)], 1.5, .07), 15.2, .7)
add(pop(1000), 15.8, .4); add(whoosh(.4, True), 15.95, .4); add(impact(.8), 16.1, .4)
add(whoosh(.6, True), 16.6, .3)

mix = np.stack([L, R], 1)
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / 1.2, 0, 1)[:, None]
mix = np.tanh(mix * 1.1); mix /= np.max(np.abs(mix)) / 0.93
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
