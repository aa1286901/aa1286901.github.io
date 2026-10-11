import torch, sys, wave, numpy as np
m=torch.package.PackageImporter(sys.argv[1]).load_pickle("tts_models","model")
m.to('cpu')
spk=sys.argv[2]; ssml=open(sys.argv[3]).read(); out=sys.argv[4]
a=m.apply_tts(ssml_text=ssml,speaker=spk,sample_rate=48000)
pcm=(a.numpy()*32767).astype(np.int16)
with wave.open(out,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(pcm.tobytes())
print(out,len(pcm)/48000)
