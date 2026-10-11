L=[
("hook",'<prosody rate="slow" pitch="low">Этот ролик смонтировал<break time="350ms"/> не человек.</prosody>'),
("me",'<prosody rate="medium">Я — Ай Ти Ахмедов. Каждый день работаю с нейросетями. И сейчас покажу, за что я плачу.</prosody>'),
("vs",'<prosody rate="medium" pitch="high">Чат Джи Пи Ти или Клод?</prosody><break time="250ms"/><prosody rate="fast">Спойлер: мне нужны оба.</prosody>'),
("gpt1",'<prosody rate="medium">Чат Джи Пи Ти — это художник. Модель Джи Пи Ти шесть Астра генерирует и редактирует изображения, как профессиональный дизайнер.</prosody>'),
("gpt2",'<prosody rate="medium" pitch="high">Загрузил фото фасада — и через минуту готовый дизайн.</prosody>'),
("gptp",'<prosody rate="medium">Чат Джи Пи Ти Плюс — две тысячи четыреста девяносто рублей в месяц.</prosody>'),
("cl1",'<prosody rate="medium">А Клод — это режиссёр и инженер. Опус пять и пять монтирует видео, делает моушен-графику, три дэ и звук.</prosody>'),
("cl2",'<prosody rate="medium" pitch="high">И собирает сайты под ключ.</prosody>'),
("clp",'<prosody rate="medium">Клод Про — три тысячи четыреста девяносто рублей в месяц.</prosody>'),
("rev",'<prosody rate="slow" pitch="low">И кстати<break time="400ms"/> весь этот ролик — анимацию, монтаж и звук — сделал Клод.<break time="250ms"/> Даже этот голос сгенерирован нейросетью.</prosody>'),
("cta",'<prosody rate="medium" pitch="high">Хочешь так же? Оформлю подписку за тебя. Пиши в ВотсАп!</prosody>'),
]
import subprocess
for k,s in L:
    open(f'l_{k}.ssml','w').write(f'<speak>{s}</speak>')
    subprocess.run(['python3','sil.py','v4_ru.pt','aidar',f'l_{k}.ssml',f'l_{k}.wav'],check=True)
