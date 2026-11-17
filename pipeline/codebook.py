import openpyxl, json
SRC='/mnt/user-data/uploads/交通事故統計情報オープンデータ/codebook_2025.xlsx'
wb=openpyxl.load_workbook(SRC,read_only=True)
sheets={'pref':'都道府県','ac':'事故内容','dn':'昼夜','wx':'天候','tp':'地形','rs':'路面状態','rf':'道路形状','sg':'信号機','wk':'歩車道区分','ty':'事故類型（本票）','aa':'年齢','pa':'当事者種別','sa':'速度規制（指定のみ）','ia':'人身損傷程度','dw':'曜日','hl':'祝日','cp':'衝突地点'}
out={}
for k,n in sheets.items():
    rows=[[x for x in r if x not in (None,'')] for r in wb[n].iter_rows(values_only=True)]
    d={}; started=False
    for r in rows:
        if r and str(r[0]).strip()=='コード': started=True; continue
        if not started: continue
        if not r: continue
        code=str(r[0]).strip()
        lab=next((str(x) for x in r[1:] if x not in (None,'')),None)
        if lab is None: continue
        try: code=str(int(code))
        except: continue
        d.setdefault(code,lab.replace('\n',' '))
    out[k]=d; print(k,len(d))
out['ab']=out['aa']; out['pb']=out['pa']; out['sb']=out['sa']; out['ib']=out['ia']
json.dump(out,open('/home/claude/proto/tmp/codebook.json','w'),ensure_ascii=False,indent=0)
for k in ['pa','ia','sa','sg','rf','tp','wk','cp']: print(k,list(out[k].items())[:30])
