import pandas as pd, orjson, subprocess
OUT='/home/claude/proto/tmp'
a=pd.read_pickle(f'{OUT}/all.pkl').rename(columns={'y':'yo','file':'y'})
props=['y','m','h','dw','hl','ac','dead','inj','dn','wx','ty','pa','pb','aa','ab']
for c in props: a[c]=a[c].fillna(-1).astype('int64')
a['lon_']=a['lon_'].round(6); a['lat_']=a['lat_'].round(6)
p=subprocess.Popen(['tippecanoe','-o',f'{OUT}/pm/core.pmtiles','-l','acc','-Z11','-z14','--no-feature-limit','--no-tile-size-limit','-f','-q'],stdin=subprocess.PIPE)
cols=a[props].to_numpy().tolist(); lon=a['lon_'].tolist(); lat=a['lat_'].tolist(); buf=[]
for r,x,y in zip(cols,lon,lat):
    buf.append(orjson.dumps({'type':'Feature','geometry':{'type':'Point','coordinates':[x,y]},'properties':dict(zip(props,r))}))
    if len(buf)>=20000: p.stdin.write(b'\n'.join(buf)+b'\n'); buf=[]
if buf: p.stdin.write(b'\n'.join(buf)+b'\n')
p.stdin.close(); print(p.wait())
