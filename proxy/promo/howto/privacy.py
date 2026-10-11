# Builds privacy-blurred copy of the recording (444x960 source coords, absolute seconds)
import subprocess
BOX=[ # x,y,w,h,t0,t1
 (24,244,396,70, 3.4,14.8),   # phone / invite-code field
 (0,515,444,110, 3.4,14.8),   # autofill bar + contact suggestions with numbers
 (14,66,416,58, 14.8,18.1),   # number banner in dashboard
 (14,66,416,58, 43.6,44.5),   # dashboard again
 (336,856,80,72, 50.9,62.5),  # WhatsApp profile avatar
]
FULL=(27.15,33.0)            # Telegram chat: blur whole frame...
CUT=[ # ...except these sharp areas
 (0,525,444,435, 27.85,29.76),   # proxy sheet
 (28,365,388,280, 29.76,30.45),  # alert
 (0,645,444,315, 29.76,30.45),   # sheet under alert
 (0,640,444,320, 30.45,30.75),   # sheet sliding away
 (140,388,166,212, 31.05,33.0),  # "Прокси подключён" badge
]
n=2+len(CUT)
f=[f"[0:v]split={n}[o][b]"+"".join(f"[c{i}]" for i in range(len(CUT)))]
f.append("[b]gblur=sigma=22[bf]")
f.append(f"[o][bf]overlay=0:0:enable='between(t,{FULL[0]},{FULL[1]})'[v0]")
cur="v0"
for i,(x,y,w,h,a,b) in enumerate(CUT):
    f.append(f"[c{i}]crop={w}:{h}:{x}:{y}[k{i}]")
    f.append(f"[{cur}][k{i}]overlay={x}:{y}:enable='between(t,{a},{b})'[u{i}]"); cur=f"u{i}"
for j,(x,y,w,h,a,b) in enumerate(BOX):
    f.append(f"[{cur}]split[m{j}][n{j}]")
    f.append(f"[n{j}]crop={w}:{h}:{x}:{y},gblur=sigma=16,eq=brightness=0.02:saturation=0.6[q{j}]")
    f.append(f"[m{j}][q{j}]overlay={x}:{y}:enable='between(t,{a},{b})'[w{j}]"); cur=f"w{j}"
fc=";".join(f)
subprocess.run(["ffmpeg","-loglevel","error","-y","-i","src.mov","-filter_complex",fc,"-map",f"[{cur}]","-an","-c:v","libx264","-crf","10","-preset","fast","-r","60","clean.mp4"],check=True)
print("ok")
