import json,sys
data=json.load(open(sys.argv[1])); out=sys.argv[2]; date=sys.argv[3]
logos={v['name']:v['du'] for v in json.load(open('logos.json')).values()}
comp=[]; D={}
for k,rows in sorted(data.items(),key=lambda kv:int(kv[0].split('|')[0])):
    if not rows: continue
    D[k]=[]
    for name,arr in rows:
        if name not in comp: comp.append(name)
        D[k].append([comp.index(name),[round(v,2) for v in arr]])
t=open('template.html',encoding='utf-8').read()
t=(t.replace('__DATA__',json.dumps(D,ensure_ascii=False,separators=(',',':')))
    .replace('__COMPANIES__',json.dumps(comp,ensure_ascii=False))
    .replace('__LOGOS__',json.dumps({n:logos.get(n) for n in comp if n in logos},ensure_ascii=False))
    .replace('__DATE__',date))
open(out,'w',encoding='utf-8').write(t); print(len(D),'profiles',len(comp),'companies',len(t),'bytes')
