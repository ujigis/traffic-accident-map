import pandas as pd, numpy as np, orjson, subprocess, os, sys
from concurrent.futures import ProcessPoolExecutor
OUT='/home/claude/proto/tmp'
a=pd.read_pickle(f'{OUT}/all.pkl')
a=a.rename(columns={'y':'yo','file':'y'})
props=['y','yo','m','d','h','mi','dw','hl','ac','dead','inj','dn','wx','tp','rs','rf','sg','wk','ty','aa','ab','pa','pb','sa','sb','ia','ib','cp','pref','city','ps','no']
for c in props: a[c]=a[c].fillna(-1).astype('int64')
a['lon_']=a['lon_'].round(6); a['lat_']=a['lat_'].round(6)
os.makedirs(f'{OUT}/geo',exist_ok=True); os.makedirs(f'{OUT}/pm',exist_ok=True)
def run(y):
    d=a[a.y==y]
    p=subprocess.Popen(['tippecanoe','-o',f'{OUT}/pm/acc_{y}.pmtiles','-l','acc','-Z11','-z14','--no-feature-limit','--no-tile-size-limit','-f','-q'],stdin=subprocess.PIPE)
    cols=d[props].to_numpy().tolist(); lon=d['lon_'].tolist(); lat=d['lat_'].tolist()
    buf=[]
    for i,(r,x,yv) in enumerate(zip(cols,lon,lat)):
        buf.append(orjson.dumps({'type':'Feature','geometry':{'type':'Point','coordinates':[x,yv]},'properties':dict(zip(props,r))}))
        if len(buf)>=20000: p.stdin.write(b'\n'.join(buf)+b'\n'); buf=[]
    if buf: p.stdin.write(b'\n'.join(buf)+b'\n')
    p.stdin.close(); return y,p.wait()
if __name__=='__main__':
    with ProcessPoolExecutor(4) as ex:
        for r in ex.map(run,range(2019,2026)): print(r,flush=True)
