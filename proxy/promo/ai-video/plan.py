import json, wave, numpy as np
TTS='../tts'
W=json.load(open(f'{TTS}/words.json'))
VO={'hook':.25,'me':3.75,'vs':9.35,'gpt1':12.9,'gpt2':19.6,'gptp':23.5,'cl1':28.25,'cl2':35.95,'clp':38.8,'rev':43.2,'cta':52.8}
TOTAL=58.5; OFF=.08
dur={}
for k in VO:
    with wave.open(f'{TTS}/v_{k}.wav') as w: dur[k]=w.getnframes()/w.getframerate()
wt=lambda k,i: round(VO[k]+OFF+W[k][i][1],3)
CAPW={
'hook':[("Этот",0),("ролик",1),("смонтировал…",2),("не",3),("человек.",4)],
'me':[("Я —",0),("IT",1),("Ahmedov.",2),("Работаю",3),("с",4),("нейросетями",5),("каждый",6),("день —",7),("и",8),("покажу,",9),("за",10),("что",11),("плачу.",12)],
'vs':[("ChatGPT",0),("или",2),("Claude?",3),("Спойлер:",4),("мне",5),("нужны",6),("оба.",7)],
'gpt1':[("ChatGPT —",0),("это",2),("художник.",3),("GPT-6",4),("Astra",5),("генерирует",6),("и",7),("редактирует",8),("изображения,",9),("как",10),("профи.",11)],
'gpt2':[("Загрузил",0),("фото фасада —",1),("и",2),("через",3),("минуту",4),("готовый",5),("дизайн.",6)],
'gptp':[("ChatGPT",0),("Plus —",2),("2 490 ₽",3),("в",5),("месяц.",6)],
'cl1':[("А",0),("вот",1),("Claude —",2),("режиссёр",3),("и",4),("инженер.",5),("Opus 5.5",6),("монтирует",9),("видео,",10),("делает",11),("моушен-графику,",12),("3D",14),("и звук.",15)],
'cl2':[("И",0),("собирает",1),("сайты",2),("под",3),("ключ.",4)],
'clp':[("Claude",0),("Pro —",1),("3 490 ₽",2),("в",4),("месяц.",5)],
'rev':[("И",0),("кстати…",1),("весь",2),("этот",3),("ролик —",4),("анимацию,",5),("монтаж",6),("и",7),("звук —",8),("сделал",9),("Claude.",10),("Даже",11),("этот",12),("голос",13),("сгенерирован",14),("нейросетью.",15)],
'cta':[("Хочешь",0),("так же?",1),("Оформлю",2),("подписку",3),("за",4),("тебя.",5),("Пиши",6),("в",7),("WhatsApp!",8)]}
COL={'hook':'#FF6B81','me':'#6CB4FF','vs':'#FFFFFF','gpt1':'#19C37D','gpt2':'#19C37D','gptp':'#19C37D','cl1':'#F0A27A','cl2':'#F0A27A','clp':'#F0A27A','rev':'#F0A27A','cta':'#25D366'}
caps=[]
for k,ws in CAPW.items():
    end=round(VO[k]+dur[k],3)
    chunk=[]
    def flush(nxt):
        if chunk: caps.append(dict(col=COL[k],words=list(chunk)))
    for j,(w,i) in enumerate(ws):
        chunk.append(dict(w=w,t=wt(k,i)))
        if w[-1] in '.?!:…' or len(chunk)>=4:
            flush(0); chunk=[]
    flush(0)
# timing of chunks
for c in caps:
    c['t0']=round(c['words'][0]['t']-.12,3)
for a,b in zip(caps,caps[1:]):
    a['t1']=min(round(a['words'][-1]['t']+0.9,3),b['t0'])
caps[-1]['t1']=TOTAL
for c in caps:
    for x,y in zip(c['words'],c['words'][1:]): x['n']=y['t']
    c['words'][-1]['n']=c['t1']
sc=dict(s1h=.0,s2=3.6,s3=9.2,s4=12.7,s5=28.0,s6=42.8,s7=52.6,
 hookNot=wt('hook',3), vsHit=wt('vs',4), vsBoth=wt('vs',6),
 gA=12.7, gB=wt('gpt1',6), gC=VO['gpt2'], gD=VO['gptp']-.05, gPrice=wt('gptp',3),
 cModel=wt('cl1',6), cB=wt('cl1',9), cC=wt('cl1',14), cD=VO['cl2'], cE=VO['clp'], cPrice=wt('clp',2),
 cChips=[wt('cl1',9),wt('cl1',12),wt('cl1',14),wt('cl1',15),wt('cl2',2)],
 rT1=wt('rev',2), rClaude=wt('rev',10), rVoice=wt('rev',11))
sc['cA']=sc['s5']
# VO track + envelope
SR=48000; N=int(TOTAL*SR); vo=np.zeros(N)
for k,t in VO.items():
    with wave.open(f'{TTS}/v_{k}.wav') as w: a=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
    i=int(t*SR); vo[i:i+len(a)]+=a[:N-i]
fr=SR//30; env=[float(np.sqrt(np.mean(vo[i*fr:(i+1)*fr]**2))) for i in range(int(TOTAL*30))]
m=max(env); env=[round(min(1,e/m*1.3),3) for e in env]
np.save('vo.npy',vo)
plan=dict(total=TOTAL,vo={k:[t,round(dur[k],3)] for k,t in VO.items()},sc=sc,caps=caps,env=env,
 hits=[sc['hookNot'],sc['vsHit'],sc['s4'],sc['s5'],sc['rClaude'],sc['s7']],
 flashes=[sc['s2'],sc['s3'],sc['vsHit'],sc['s4'],sc['s6'],sc['rClaude'],sc['s7']])
json.dump(plan,open('plan.json','w'),ensure_ascii=False)
print(json.dumps(sc,ensure_ascii=False)); print(len(caps),'caps')
