import pandas as pd, numpy as np, orjson, subprocess
OUT='/home/claude/proto/tmp'
a=pd.read_pickle(f'{OUT}/all.pkl').rename(columns={'y':'yo','file':'y'})
a['il']=np.floor(a.lat_*120).astype(int); a['io']=np.floor(a.lon_*80).astype(int)
a['tg']=np.where(a.ty==1,1,np.where(a.ty==21,2,3))
a['yy']=a.y-2000
g=a.groupby(['il','io','yy','ac','tg']).size().rename('n').reset_index()
cells={}
for r in g.itertuples(index=False):
    cells.setdefault((r.il,r.io),{})[f'c{r.yy}{r.ac}{r.tg}']=int(r.n)
print('cells',len(cells))
p=subprocess.Popen(['tippecanoe','-o',f'{OUT}/pm/mesh.pmtiles','-l','mesh','-Z3','-z10','--no-feature-limit','--no-tile-size-limit','-f','-q'],stdin=subprocess.PIPE)
buf=[]
for (il,io),pr in cells.items():
    buf.append(orjson.dumps({'type':'Feature','geometry':{'type':'Point','coordinates':[round((io+.5)/80,5),round((il+.5)/120,5)]},'properties':pr}))
    if len(buf)>=20000: p.stdin.write(b'\n'.join(buf)+b'\n'); buf=[]
if buf: p.stdin.write(b'\n'.join(buf)+b'\n')
p.stdin.close(); print(p.wait())
