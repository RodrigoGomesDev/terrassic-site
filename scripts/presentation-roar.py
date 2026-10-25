"""Web-only roar: 109 smooth poses, authored on the original Terrassic rig."""
import json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def smooth(t,a,b):
 x=max(0,min(1,(t-a)/(b-a)));return x*x*x*(x*(x*6-15)+10)
def pose(t):
 e=smooth(t,.42,1.02)*(1-smooth(t,2.24,3.38))
 prep=smooth(t,.05,.3)*(1-smooth(t,.35,.8))
 jaw_e=smooth(t,.62,1.12)*(1-smooth(t,2.15,3.05))
 pulse=math.sin((t-.9)*math.pi*2*1.25)*.9*jaw_e
 return {'body':{'rotation':[-3*e+1.5*prep,0,0],'position':[0,.6*e-.2*prep,0]},'neck1':{'rotation':[-18*e+3*prep,0,0]},'neck2':{'rotation':[-5*e,0,0]},'skull':{'rotation':[-7*e,0,.35*math.sin(t*3)*e]},'jaw':{'rotation':[40*jaw_e+pulse,0,0]},'tail1':{'rotation':[5*e,0,0]},'tail2':{'rotation':[2*e,-1.5*e,0]},'tail3':{'rotation':[0,2*e,0]},'arm_l':{'rotation':[14*e,0,-7*e]},'arm_r':{'rotation':[14*e,0,7*e]}}
bones={}
for i in range(109):
 t=i/30
 for name,channels in pose(t).items():
  for channel,values in channels.items():
   bones.setdefault(name,{}).setdefault(channel,{})[f'{t:.6f}']={'post':[round(v,5) for v in values],'lerp_mode':'catmullrom'}
clip={'animation_length':3.6,'loop':False,'bones':bones}
path=root/'public/assets/tyrannosaurus/presentation-roar.json'
path.write_text(json.dumps(clip,separators=(',',':'))+'\n')
print('109 poses / 3.6 s / 10 bones:',path.name)
