import pandas as pd, numpy as np, json, sys, os
SRC='/mnt/user-data/uploads/交通事故統計情報オープンデータ'
OUT='/home/claude/proto/tmp'
def norm(c): return c.replace('　','').replace('　','')
want={'都道府県コード':'pref','警察署等コード':'ps','本票番号':'no','事故内容':'ac','死者数':'dead','負傷者数':'inj',
 '市区町村コード':'city','発生日時年':'y','発生日時月':'m','発生日時日':'d','発生日時時':'h','発生日時分':'mi',
 '昼夜':'dn','天候':'wx','地形':'tp','路面状態':'rs','道路形状':'rf','信号機':'sg','歩車道区分':'wk','事故類型':'ty',
 '年齢（当事者A）':'aa','年齢（当事者B）':'ab','当事者種別（当事者A）':'pa','当事者種別（当事者B）':'pb',
 '速度規制（指定のみ）（当事者A）':'sa','速度規制（指定のみ）（当事者B）':'sb','人身損傷程度（当事者A）':'ia','人身損傷程度（当事者B）':'ib',
 '曜日(発生年月日)':'dw','祝日(発生年月日)':'hl','地点緯度（北緯）':'lat','地点経度（東経）':'lon','衝突地点':'cp'}
frames=[]
for fy in range(2019,2026):
    d=pd.read_csv(f'{SRC}/honhyo_{fy}.csv',encoding='cp932',dtype=str)
    d.columns=[norm(c) for c in d.columns]
    miss=[k for k in want if k not in d.columns]
    if miss: print(fy,'missing',miss); 
    d=d[[k for k in want if k in d.columns]].rename(columns=want)
    d['file']=fy
    frames.append(d); print(fy,len(d),flush=True)
a=pd.concat(frames,ignore_index=True)
for c in a.columns:
    if c!='file': a[c]=pd.to_numeric(a[c],errors='coerce')
print('rows',len(a)); print(a['y'].value_counts().sort_index().to_dict())
print('file vs y mismatch', (a['y']!=a['file']).sum())
# coords ddmmssfff
def conv(v,deg_div):
    v=v.astype('float64'); deg=np.floor(v/deg_div); r=v-deg*deg_div; mn=np.floor(r/1e5); sec=(r-mn*1e5)/1e3
    return deg+mn/60+sec/3600
a['lat_']=conv(a['lat'],1e7); a['lon_']=conv(a['lon'],1e7)
bad=~(a.lat_.between(20,46)&a.lon_.between(122,154))
print('bad coords',bad.sum(), 'nan', a.lat.isna().sum())
a=a[~bad].copy()
a.to_pickle(f'{OUT}/all.pkl'); print('kept',len(a))
print(a.groupby('y').size().to_dict(), a.duplicated(['pref','ps','no','y','m','d','h','mi']).sum(),'dups')
