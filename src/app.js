function main(){
const {DATA}=window.RISK; const clean=n=>String(n).replace(/[<>&"'`]/g,"");
const COMPANIES=window.RISK.COMPANIES.map(clean); const LOGOS={}; for(const [n,v] of Object.entries(window.RISK.LOGOS)) if(v.startsWith("data:image/png;base64,")) LOGOS[clean(n)]=v;
// Published campaign discounts by policy year (percent off). Source: poenta.co.il, 25.10.2026
const PUBLISHED = {
  "מגדל ביטוח": {track:"ריסק אקטיב", years:[85,70,70,30,30,30,30,30]},
  "הפניקס ביטוח": {track:"מסלול מבצע", years:[85,75,70,60,60,45,30,30], cond:"לגילאי 30 עד 55, פרמיה מעל 200 ₪ לפני הנחה, סכום ביטוח עד 3 מיליון ₪", ok:(age,first,sum)=>age>=30&&age<=55&&first>200&&sum<=3000000},
  "איילון ביטוח": {track:"דרור GO 1", years:[85,70,70,30,30,30,30,30]},
  "הכשרה ביטוח": {track:"מגן 1", years:[80,75,70,60,55,30,30,30], note:"קיים גם מסלול חלופי של 65% הנחה קבועה ל-7 שנים"}
};
const state={age:null,g:"m",s:"0",sum:1000000,sort:"total",view:"m",metric:"first",horizon:20,unit:"m",screen:"home"};
const fmt=n=>Math.round(n).toLocaleString("he-IL");
const U=()=>state.unit==="y"?12:1, unitW=()=>state.unit==="y"?"לשנה":"לחודש", yw=n=>n+(n===10?" שנים":" שנה");
function pct(x){ if(x==null||!isFinite(x)) return `<span class="pc fl">—</span>`; const c=x>0.05?"up":x<-0.05?"dn":"fl";
  return `<span class="pc ${c}"><bdi dir="ltr">${x>0.05?"▲ +":x<-0.05?"▼ −":"= "}${Math.abs(x).toFixed(1)}%</bdi></span>`; }
const ages=[...new Set(Object.keys(DATA).map(k=>+k.split("|")[0]))].sort((a,b)=>a-b);
state.age=ages.includes(35)?35:ages[0];
try{const s=JSON.parse(localStorage.getItem("risk-prefs")||"null"); if(s&&ages.includes(s.age)) Object.assign(state,s);}catch(e){}
state.screen="home"; if(![10,20].includes(state.horizon)) state.horizon=20;

function logo(name){const src=LOGOS[name]; return src?`<span class="logo"><img src="${src}" alt="" loading="lazy"></span>`:`<span class="logo txt">${initials(name)}</span>`;}
function initials(name){const w=name.replace(/ביטוח|חברה ל|חברה/g,"").trim().split(/\s+/); return w[0]==="AIG"?"AIG":(w[0]||name).slice(0,2);}
function compute(){
  const key=`${state.age}|${state.g}|${state.s}`; const rows=(DATA[key]||[]); const k=state.sum/1000000;
  return rows.map(([ci,arr])=>{
    const name=COMPANIES[ci]; const yrs=arr.slice(0,state.horizon).map(v=>v*k); const first=yrs[0];
    const total=yrs.reduce((a,b)=>a+b,0)*12;
    const dc=discFor(name,first); const d=dc&&dc.pub?PUBLISHED[name]:null, applies=!!(dc&&dc.applies);
    let dyrs=null,dtotal=null; if(applies){ dyrs=yrs.map((v,i)=>v*(1-((dc.sched[i]||0)/100))); dtotal=dyrs.reduce((a,b)=>a+b,0)*12; }
    return {ci,name,yrs,first,total,avg:total/12/yrs.length,d,dc,applies,dyrs,dtotal,dfirst:dyrs?dyrs[0]:null};
  });
}
function chart(r){
  const W=640,H=200,pl=44,pr=10,pt=10,pb=26; const ys=r.yrs.map(v=>v*U()), ds=r.dyrs&&r.dyrs.map(v=>v*U()); const n=ys.length;
  const max=Math.max(...ys)*1.08; const bw=(W-pl-pr)/n;
  const y=v=>pt+(H-pt-pb)*(1-v/max);
  let ticks=""; const step=Math.pow(10,Math.floor(Math.log10(max/3))); const nice=[1,2,5].map(m=>m*step).find(s=>max/s<=5)||step*10;
  for(let v=0;v<=max;v+=nice) ticks+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmt(v)}</text>`;
  let bars="";
  ys.forEach((v,i)=>{const x=pl+i*bw+bw*.15, w=bw*.7;
    bars+=`<rect x="${x}" y="${y(v)}" width="${w}" height="${H-pb-y(v)}" fill="var(--bar)" rx="2"><title>שנה ${i+1}, גיל ${state.age+i}: ${fmt(v)} ₪</title></rect>`;
    if(ds && ds[i]<v-0.01) bars+=`<rect x="${x+w*.2}" y="${y(ds[i])}" width="${w*.6}" height="${H-pb-y(ds[i])}" fill="var(--gold)" rx="2"><title>אחרי הנחה: ${fmt(ds[i])} ₪</title></rect>`;
    if(i%2===0) bars+=`<text x="${x+w/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--muted)">${state.age+i}</text>`;});
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="פרמיה ${unitW()} לפי גיל, ${r.name}" direction="ltr">${ticks}${bars}</svg></div>
  <div class="legend"><span><i class="lg-bar"></i>מחיר מחירון</span>${ds?'<span><i class="lg-gold"></i>אחרי הנחה (הערכה)</span>':""}<span>ציר תחתון: גיל המבוטח</span></div>`;
}
function ytable(r){
  const u=U(); const y=r.yrs; const tot=(y[y.length-1]/y[0]-1)*100;
  let worst=0,wi=1,best=0,bi=1; y.forEach((v,i)=>{ if(i){const c=(v/y[i-1]-1)*100; if(c>worst){worst=c;wi=i+1;} if(c<best){best=c;bi=i+1;}} });
  const chips=`<div class="chips"><span class="chip">שינוי מצטבר, שנה 1 עד ${y.length}: <bdi dir="ltr">${tot>=0?"+":"−"}${Math.abs(tot).toFixed(1)}%</bdi></span>${worst>0?`<span class="chip">העלייה הכי חדה: <bdi dir="ltr">+${worst.toFixed(1)}%</bdi> בשנה ${wi}</span>`:""}${best<0?`<span class="chip">הירידה הכי גדולה: <bdi dir="ltr">−${Math.abs(best).toFixed(1)}%</bdi> בשנה ${bi}</span>`:""}</div>`;
  const body=y.map((v,i)=>`<tr><td>${i+1}</td><td>${state.age+i}</td><td><b>${fmt(v*u)} ₪</b></td><td>${i?pct((v/y[i-1]-1)*100):"—"}</td><td>${i?pct((v/y[0]-1)*100):"—"}</td></tr>`).join("");
  return `${chips}<div class="ytab"><table><thead><tr><th>שנה</th><th>גיל</th><th>פרמיה ${unitW()}</th><th>שינוי משנה קודמת</th><th>שינוי מהשנה הראשונה</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderTrend(){
  const k=state.sum/1000000, H=state.horizon, u=U();
  const rows=DATA[`${state.age}|${state.g}|${state.s}`]||[];
  document.getElementById("tcap").textContent=`גיל ${state.age}, ${state.g==="m"?"גבר":"אישה"}, ${state.s==="1"?"מעשן":"לא מעשן"}, ${fmt(state.sum)} ₪ ביטוח, ${yw(H)} קדימה. מחירים ${unitW()}.`;
  if(!rows.length){document.getElementById("ttable").innerHTML=`<tbody><tr><td class="na">אין נתונים לפרופיל הזה.</td></tr></tbody>`; return;}
  const cols=rows.map(([ci,arr])=>({ci,y:arr.slice(0,H).map(v=>v*k)}));
  let h=`<thead><tr><th scope="col">שנה (גיל)</th>${cols.map(c=>`<th scope="col">${logo(COMPANIES[c.ci])}${COMPANIES[c.ci].replace(" ביטוח","").replace(" חברה לביטוח","")}</th>`).join("")}</tr></thead><tbody>`;
  for(let i=0;i<H;i++){
    const vals=cols.map(c=>c.y[i]); const mn=Math.min(...vals);
    h+=`<tr class="nc"><th scope="row">${i+1} (${state.age+i})</th>${cols.map(c=>`<td class="${c.y[i]===mn?"min":""}">${fmt(c.y[i]*u)}<small>${i?pct((c.y[i]/c.y[i-1]-1)*100):""}</small></td>`).join("")}</tr>`;
  }
  h+=`<tr class="nc"><th scope="row">מצטבר</th>${cols.map(c=>`<td>${pct((c.y[H-1]/c.y[0]-1)*100)}</td>`).join("")}</tr></tbody>`;
  document.getElementById("ttable").innerHTML=h;
}
function renderHome(){
  document.getElementById("l-age").value=state.age;
  document.querySelectorAll("#l-g button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===state.g));
  document.querySelectorAll("#l-s button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===state.s));
  const list=compute().sort((a,b)=>a.total-b.total).slice(0,3);
  document.getElementById("l-res").innerHTML=list.length?`<small class="mut">שלוש החברות הזולות ל-${yw(state.horizon)} (מחירון, ${fmt(state.sum)} ₪ ביטוח)</small>`+list.map((r,i)=>`<div class="qrow"><span class="rank">${i+1}</span>${logo(r.name)}<span class="name">${r.name}</span><span class="num"><b>${fmt(r.first)} ₪</b> <small class="mut">לחודש</small></span></div>`).join(""):`<small class="mut">אין נתונים לגיל הזה.</small>`;
}
function render(){
  const home=state.screen==="home";
  document.getElementById("home").classList.toggle("hide",!home);
  document.getElementById("app").classList.toggle("hide",home);
  document.getElementById("back").classList.toggle("hide",home);
  document.getElementById("lede").classList.toggle("hide",home);
  if(home){renderHome(); window.__placeCarousel?.(); return;}
  document.querySelectorAll("#horizon button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.v===state.horizon));
  document.querySelectorAll("#unit button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===state.unit));
  document.getElementById("lh-avg").textContent="ממוצע "+(state.unit==="y"?"שנתי":"חודשי");
  document.getElementById("lh-total").textContent="סה״כ ל-"+yw(state.horizon);
  document.getElementById("tab-t").setAttribute("aria-pressed",state.view==="t");
  document.getElementById("trend").classList.toggle("hide",state.view!=="t");
  renderTrend();
  document.getElementById("age").value=state.age;
  document.getElementById("tab-m").setAttribute("aria-pressed",state.view==="m");
  document.getElementById("tab-c").setAttribute("aria-pressed",state.view==="c");
  document.getElementById("matrix").classList.toggle("hide",state.view!=="m");
  document.getElementById("compare").classList.toggle("hide",state.view!=="c");
  document.getElementById("tab-d").setAttribute("aria-pressed",state.view==="d");
  document.getElementById("discounts").classList.toggle("hide",state.view!=="d"); if(state.view==="d") renderDisc();
  renderMatrix();
  document.querySelectorAll("#gender button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===state.g));
  document.querySelectorAll("#smoke button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===state.s));
  const list=compute();
  const sortKey={total:r=>r.total,first:r=>r.first,disc:r=>r.dtotal??r.total}[state.sort];
  list.sort((a,b)=>sortKey(a)-sortKey(b));
  const rowsEl=document.getElementById("rows"), sumEl=document.getElementById("summary");
  if(!list.length){rowsEl.innerHTML=`<p class="empty">אין נתונים לפרופיל הזה.</p>`; sumEl.innerHTML=""; return;}
  const cheapFirst=[...list].sort((a,b)=>a.first-b.first)[0], cheapTotal=[...list].sort((a,b)=>a.total-b.total)[0];
  const withD=list.filter(r=>r.dtotal!=null).sort((a,b)=>a.dtotal-b.dtotal)[0];
  sumEl.innerHTML=`<div class="stat"><small>הכי זול בשנה הראשונה (מחירון)</small><b class="num">${fmt(cheapFirst.first*U())} ₪ ${unitW()}</b><small>${cheapFirst.name}</small></div>
  <div class="stat"><small>הכי זול לאורך ${yw(state.horizon)} (מחירון)</small><b class="num">${fmt(cheapTotal.total)} ₪</b><small>${cheapTotal.name}</small></div>
  ${withD?`<div class="stat gold"><small>הזול ביותר מבין החברות עם הנחה (הערכה)</small><b class="num">${fmt(withD.dtotal)} ₪ ל-${yw(state.horizon)}</b><small>${withD.name}, ${fmt(withD.dfirst*U())} ₪ ${unitW()} בשנה הראשונה</small></div>`:""}`;
  rowsEl.innerHTML=list.map((r,i)=>{
    const best=r===cheapTotal?'<span class="tag best">הכי זול</span>':"";
    let dcell;
    if(r.dfirst!=null) dcell=`<span class="disc num">${fmt(r.dfirst*U())} ₪</span> <small class="nodisc">(${r.dc.sched[0]}%-)</small>`;
    else if(r.dc && !r.applies) dcell=`<span class="nodisc">לא עומד בתנאי המבצע</span>`;
    else dcell=`<span class="nodisc">ללא הנחה</span>`;
    let det="";
    if(r.d){ det+=`<p><b>מבצע שפורסם, מסלול "${r.d.track}":</b></p><div class="chips">${r.d.years.map((p,j)=>`<span class="chip">שנה ${j+1}: ${p}%</span>`).join("")}</div>`;
      if(r.d.cond) det+=`<p>תנאי המבצע: ${r.d.cond}.${r.applies?"":" הפרופיל שבחרת לא עומד בהם."}</p>`;
      if(r.d.note) det+=`<p>${r.d.note}.</p>`;
    } else if(r.dc) det+=`<p><b>הנחה שהגדרת:</b> ${r.dc.label}.</p>`;
    else det+=`<p>לא הוגדרה הנחה לחברה הזו. אפשר לקבוע אחוז הנחה בלשונית "הנחות".</p>`;
    if(r.dtotal!=null) det+=`<p>עלות משוערת ל-${yw(state.horizon)} אחרי הנחה: <b class="num">${fmt(r.dtotal)} ₪</b> (חיסכון של כ-${fmt(r.total-r.dtotal)} ₪).</p>`;
    det+=`<div class="rowact"><button type="button" class="cta" data-policy-co="${r.ci}">הקמת פוליסה ב${r.name}</button> <button type="button" class="btn2" data-go-disc>עריכת הנחה</button></div>`;
    return `<details class="row"><summary>
      <span class="rank">${i+1}</span>
      <span class="co">${logo(r.name)}<span class="name">${r.name}${best}</span></span>
      <span class="price"><span class="lbl">שנה ראשונה</span><span class="num">${fmt(r.first*U())} ₪</span></span>
      <span class="price"><span class="lbl">אחרי הנחה</span>${dcell}</span>
      <span class="price"><span class="lbl">ממוצע ${state.unit==="y"?"שנתי":"חודשי"}</span><span class="num">${fmt(r.avg*U())} ₪</span></span>
      <span class="price"><span class="lbl">סה״כ ל-${yw(state.horizon)}</span><b class="num">${fmt(r.total)} ₪</b></span>
      <span class="chev" aria-hidden="true">⌄</span></summary>
      <div class="detail">${det}${chart(r)}${ytable(r)}</div></details>`;}).join("");
  try{localStorage.setItem("risk-prefs",JSON.stringify({...state,screen:"home"}));}catch(e){}
}
const ageEl=document.getElementById("age");
ageEl.innerHTML=ages.map(a=>`<option value="${a}">${a}</option>`).join("");
ageEl.addEventListener("change",()=>{state.age=+ageEl.value; render();});
document.getElementById("tab-m").addEventListener("click",()=>{state.view="m"; render();});
document.getElementById("tab-c").addEventListener("click",()=>{state.view="c"; render();});
document.getElementById("tab-t").addEventListener("click",()=>{state.view="t"; render();});
document.getElementById("horizon").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.horizon=+b.dataset.v; render();}});
document.getElementById("unit").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.unit=b.dataset.v; render();}});
function go(v){state.screen="app"; state.view=v; render(); window.scrollTo({top:0});}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
document.getElementById("l-go").addEventListener("click",()=>go("m"));
document.getElementById("back").addEventListener("click",()=>{state.screen="home"; render(); window.scrollTo({top:0});});
const lAge=document.getElementById("l-age"); lAge.innerHTML=ages.map(a=>`<option value="${a}">${a}</option>`).join("");
lAge.addEventListener("change",()=>{state.age=+lAge.value; render();});
document.getElementById("l-g").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.g=b.dataset.v; render();}});
document.getElementById("l-s").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.s=b.dataset.v; render();}});
const metricEl=document.getElementById("metric"); metricEl.value=state.metric;
metricEl.addEventListener("change",()=>{state.metric=metricEl.value; render();});
function renderMatrix(){
  const k=state.sum/1000000, mt=state.metric, H=state.horizon;
  const val=(yrs,ci)=>{const a=yrs.slice(0,H).map(v=>v*k); if(mt==="dfirst"){const dc=discFor(COMPANIES[ci],a[0]); return a[0]*(1-(dc&&dc.applies?dc.sched[0]:0)/100)*U();} return mt==="first"?a[0]*U():mt==="avg"?a.reduce((x,y)=>x+y,0)/a.length*U():a.reduce((x,y)=>x+y,0)*12;};
  document.getElementById("mcap").textContent=`${mt==="total"?"סה״כ ל-"+yw(H)+", בשקלים":(mt==="avg"?"ממוצע "+(U()===12?"שנתי":"חודשי")+" ל-"+yw(H):"פרמיה "+unitW()+" בשנה הראשונה")+", בשקלים"} (${state.g==="m"?"גבר":"אישה"}, ${state.s==="1"?"מעשן":"לא מעשן"}, ${fmt(state.sum)} ₪ ביטוח).`;
  const order=COMPANIES.map((n,i)=>i);
  let h=`<thead><tr><th scope="col">גיל</th>${order.map(i=>`<th scope="col">${logo(COMPANIES[i])}${COMPANIES[i].replace(" ביטוח","").replace(" חברה לביטוח","")}</th>`).join("")}</tr></thead><tbody>`;
  for(let a=18;a<=69;a++){
    const rows=DATA[`${a}|${state.g}|${state.s}`]||[]; const m={}; rows.forEach(([ci,arr])=>m[ci]=val(arr,ci));
    if(!rows.length){h+=`<tr class="empty-row"><th scope="row">${a}</th><td class="na" colspan="${order.length}">אין הצעות לביטוח ל-20 שנה בגיל הזה</td></tr>`; continue;}
    const vals=Object.values(m); const mn=vals.length?Math.min(...vals):null;
    h+=`<tr data-age="${a}" class="${a===state.age?"sel":""}"><th scope="row">${a}</th>${order.map(i=>m[i]==null?`<td class="na">—</td>`:`<td class="${m[i]===mn?"min":""}">${fmt(m[i])}</td>`).join("")}</tr>`;
  }
  document.getElementById("mtable").innerHTML=h+"</tbody>";
}
document.getElementById("mtable").addEventListener("click",e=>{const tr=e.target.closest("tr[data-age]"); if(tr){state.age=+tr.dataset.age; state.view="c"; render(); window.scrollTo({top:0});}});
document.getElementById("gender").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.g=b.dataset.v; render();}});
document.getElementById("smoke").addEventListener("click",e=>{const b=e.target.closest("button"); if(b){state.s=b.dataset.v; render();}});
const sumEl=document.getElementById("sum");
sumEl.value=state.sum;
sumEl.addEventListener("input",()=>{const v=+sumEl.value; if(v>=100000&&v<=5000000){state.sum=v; render();}});
document.querySelectorAll(".presets button").forEach(b=>b.addEventListener("click",()=>{state.sum=+b.dataset.s; sumEl.value=state.sum; render();}));
const sortEl=document.getElementById("sort"); sortEl.value=state.sort;
sortEl.addEventListener("change",()=>{state.sort=sortEl.value; render();});

// ===== discounts chosen by the user (saved on this device) =====
function defaultDisc(){const o={}; for(const n of Object.keys(PUBLISHED)) o[n]={pub:1}; return o;}
let DISC; try{DISC=JSON.parse(localStorage.getItem("risk-disc")||"null");}catch(e){} if(!DISC||typeof DISC!=="object") DISC=defaultDisc();
const saveDisc=()=>{try{localStorage.setItem("risk-disc",JSON.stringify(DISC));}catch(e){}};
const clampP=v=>Math.max(0,Math.min(90,Math.round(+v||0)));
function discFor(name,first){
  const c=DISC[name]; if(!c) return null;
  if(c.pub&&PUBLISHED[name]){const P=PUBLISHED[name]; return {pub:1,sched:P.years,applies:P.ok?P.ok(state.age,first,state.sum):true,label:`מבצע "${P.track}"`};}
  const p=clampP(c.p), y=+c.y||0; if(!p) return null;
  return {sched:Array.from({length:20},(_,i)=>(!y||i<y)?p:0),applies:true,label:`${p}% ${y?`ב-${yw(y)} הראשונות`:"לכל התקופה"}`};
}
function renderDisc(){
  const el=document.getElementById("dlist"); const k=state.sum/1e6;
  const rows=DATA[`${state.age}|${state.g}|${state.s}`]||[]; const firstOf={}; rows.forEach(([ci,a])=>firstOf[ci]=a[0]*k);
  el.innerHTML=COMPANIES.map((n,ci)=>{
    const c=DISC[n]||{}, P=PUBLISHED[n], pub=!!(c.pub&&P), p=pub?P.years[0]:clampP(c.p), y=+c.y||0, f=firstOf[ci];
    const after=f!=null?f*(1-p/100):null;
    return `<div class="dcard${p?" has":""}" data-ci="${ci}"><div class="dtop">${logo(n)}<span class="name">${n}</span><span class="dpct num">${p}%</span></div>
      ${pub?`<p class="dpub">פעיל: מבצע "${P.track}" (${P.years.join("%, ")}% לפי שנה). <button type="button" data-act="custom">להגדיר אחוז משלי</button></p>`:
      `<div class="drow"><input type="range" min="0" max="90" step="1" value="${p}" data-act="range" aria-label="אחוז הנחה, ${n}"><input type="number" min="0" max="90" value="${p}" data-act="num" aria-label="אחוז הנחה במספר, ${n}" inputmode="numeric"></div>
      <div class="drow"><span>למשך</span><select data-act="years" aria-label="משך ההנחה, ${n}"><option value="0"${!y?" selected":""}>כל התקופה</option>${[1,2,3,4,5,6,7,8,10,15].map(v=>`<option value="${v}"${y===v?" selected":""}>${yw(v)}</option>`).join("")}</select></div>
      ${P?`<p class="dpub">לחברה פורסם מבצע "${P.track}". <button type="button" data-act="pub">להשתמש בו</button></p>`:""}`}
      <p class="dpub">${f!=null?`שנה ראשונה בגיל ${state.age}: <b class="num">${fmt(f*U())} ₪</b>${p?` ← <b class="disc num">${fmt(after*U())} ₪</b>`:""} ${unitW()}`:"אין הצעה לגיל שנבחר"}</p></div>`;}).join("");
}
document.getElementById("dlist").addEventListener("input",e=>{const t=e.target, card=t.closest(".dcard"); if(!card) return; const n=COMPANIES[+card.dataset.ci];
  if(t.dataset.act==="range"||t.dataset.act==="num"){const p=clampP(t.value); DISC[n]={p,y:+(DISC[n]?.y||0)}; card.querySelector(".dpct").textContent=p+"%"; card.classList.toggle("has",p>0); const o=card.querySelector(t.dataset.act==="range"?"[data-act=num]":"[data-act=range]"); if(o) o.value=p; saveDisc(); clearTimeout(renderDisc.t); renderDisc.t=setTimeout(()=>{const f=document.activeElement; const sel=f&&f.closest(".dcard")?`[data-ci="${card.dataset.ci}"] [data-act="${f.dataset.act}"]`:null; render(); if(sel){const nf=document.querySelector(sel); if(nf) nf.focus();}},350);}
  if(t.dataset.act==="years"){DISC[n]={p:clampP(DISC[n]?.p),y:+t.value}; saveDisc(); render();}});
document.getElementById("dlist").addEventListener("click",e=>{const b=e.target.closest("button[data-act]"); if(!b) return; const n=COMPANIES[+b.closest(".dcard").dataset.ci];
  if(b.dataset.act==="pub") DISC[n]={pub:1}; if(b.dataset.act==="custom") DISC[n]={p:PUBLISHED[n].years[0],y:0}; saveDisc(); render();});
document.getElementById("d-apply").addEventListener("click",()=>{const p=clampP(document.getElementById("d-all").value); COMPANIES.forEach(n=>DISC[n]={p,y:0}); saveDisc(); render(); toast(`הוגדרה הנחה של ${p}% לכל החברות`);});
document.getElementById("d-reset").addEventListener("click",()=>{DISC={}; saveDisc(); render(); toast("כל ההנחות אופסו");});
document.getElementById("d-pub").addEventListener("click",()=>{DISC=defaultDisc(); saveDisc(); render(); toast("נטענו המבצעים שפורסמו");});
document.getElementById("tab-d").addEventListener("click",()=>{state.view="d"; render();});
document.addEventListener("click",e=>{
  if(e.target.closest("[data-go-disc]")){state.screen="app"; state.view="d"; render(); window.scrollTo({top:0});}
  const pc=e.target.closest("[data-policy-co]"); if(pc) openPolicy(+pc.dataset.policyCo);
  if(e.target.closest("[data-open-policy]")) openPolicy();
});
document.getElementById("home-link")?.addEventListener("click",e=>{e.preventDefault(); state.screen="home"; render(); window.scrollTo({top:0});});

// ===== 3D carousel of company logos =====
(function carousel(){
  const ring=document.getElementById("ring"), info=document.getElementById("car-info"); if(!ring) return;
  const N=COMPANIES.length, step=360/N; let idx=0, timer=null, paused=false;
  const cards=COMPANIES.map((n,i)=>{const c=document.createElement("div"); c.className="card3d"; c.setAttribute("role","button"); c.tabIndex=-1; c.setAttribute("aria-label",n);
    if(LOGOS[n]){const im=document.createElement("img"); im.src=LOGOS[n]; im.alt=""; c.appendChild(im);} else {const s=document.createElement("span"); s.className="txt"; s.textContent=n; c.appendChild(s);}
    c.addEventListener("click",()=>{ if(i===idx){state.screen="app"; state.view="c"; render(); window.scrollTo({top:0});} else go2(i);}); ring.appendChild(c); return c;});
  function layout(){const w=ring.offsetWidth||170, r=Math.round((w/2+18)/Math.tan(Math.PI/N)); cards.forEach((c,i)=>c.style.transform=`rotateY(${i*step}deg) translateZ(${r}px)`); ring.dataset.r=r; place();}
  function place(){ring.style.transform=`translateZ(${-ring.dataset.r}px) rotateY(${-idx*step}deg)`; const i=((idx%N)+N)%N; cards.forEach((c,j)=>c.classList.toggle("on",j===i));
    const n=COMPANIES[i], list=compute().sort((a,b)=>a.first-b.first), pos=list.findIndex(r=>r.name===n), r=list[pos];
    info.innerHTML=`<b>${n}</b>${r?`<span class="mut">גיל ${state.age}, ${state.g==="m"?"גבר":"אישה"}: <b class="num">${fmt(r.first)} ₪</b> לחודש בשנה הראשונה · מקום ${pos+1} מתוך ${list.length}</span>`:`<span class="mut">אין הצעה לגיל ${state.age}</span>`}`;}
  function go2(i){const cur=((idx%N)+N)%N; let d=i-cur; if(d>N/2) d-=N; if(d<-N/2) d+=N; idx+=d; place();}
  const still=()=>paused||document.hidden||motionOff();
  function start(){clearInterval(timer); timer=setInterval(()=>{if(!still()){idx++; place();}},2600);}
  document.getElementById("car-next").addEventListener("click",()=>{idx++; place();});
  document.getElementById("car-prev").addEventListener("click",()=>{idx--; place();});
  const pb=document.getElementById("car-pause"); pb.addEventListener("click",()=>{paused=!paused; pb.textContent=paused?"▶":"❚❚"; pb.setAttribute("aria-label",paused?"הפעל סיבוב":"עצור סיבוב");});
  const car=document.getElementById("carousel"); let hover=false;
  car.addEventListener("mouseenter",()=>{hover=paused; paused=true;}); car.addEventListener("mouseleave",()=>{paused=hover||pb.textContent==="▶";});
  window.addEventListener("resize",layout); layout(); start(); window.__placeCarousel=place;
})();

// ===== policy setup drawer (for insurance agents) =====
const P={step:0,co:null,age:state.age,g:state.g,s:state.s,sum:state.sum,h:state.horizon};
const $=id=>document.getElementById(id), drawer=$("policy"), scrim=$("scrim");
const pAge=$("p-age"); pAge.innerHTML=ages.map(a=>`<option value="${a}">${a}</option>`).join("");
let agent={}; try{agent=JSON.parse(localStorage.getItem("risk-agent")||"{}")||{};}catch(e){}
for(const [k,id] of [["name","a-name"],["lic","a-lic"],["phone","a-phone"],["mail","a-mail"]]) if(agent[k]) $(id).value=String(agent[k]).slice(0,80);
$("a-remember").checked=!!agent.name||!!agent.phone;
function pQuotes(){const k=P.sum/1e6; return (DATA[`${P.age}|${P.g}|${P.s}`]||[]).map(([ci,arr])=>{const yrs=arr.slice(0,P.h).map(v=>v*k), n=COMPANIES[ci];
  const saved={age:state.age,sum:state.sum}; state.age=P.age; state.sum=P.sum; const dc=discFor(n,yrs[0]); Object.assign(state,saved);
  const sch=dc&&dc.applies?dc.sched:null, dy=sch?yrs.map((v,i)=>v*(1-(sch[i]||0)/100)):yrs;
  return {ci,n,first:yrs[0],dfirst:dy[0],total:dy.reduce((a,b)=>a+b,0)*12,label:sch?dc.label:""};}).sort((a,b)=>a.total-b.total);}
function segSet(id,v){document.querySelectorAll(`#${id} button`).forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===String(v)));}
function pRender(){
  document.querySelectorAll(".pstep").forEach(f=>f.hidden=+f.dataset.step!==P.step);
  document.querySelectorAll("#p-steps li").forEach((l,i)=>{l.classList.toggle("on",i<=P.step); l.toggleAttribute("aria-current",i===P.step);});
  pAge.value=P.age; segSet("p-g",P.g); segSet("p-s",P.s); segSet("p-h2",P.h); $("p-sum").value=P.sum;
  $("p-back").style.visibility=P.step?"visible":"hidden"; $("p-next").hidden=P.step===3;
  if(P.step===1){const q=pQuotes(); if(P.co!=null&&!q.some(r=>r.ci===P.co)) P.co=null;
    $("p-co").innerHTML=q.length?q.map((r,i)=>`<label><input type="radio" name="pco" value="${r.ci}"${P.co===r.ci?" checked":""}>${logo(r.n)}<span class="name">${r.n}${i===0?' <span class="tag best">הכי זול</span>':""}</span><span class="pr">${r.label?`<s>${fmt(r.first)} ₪</s>`:""}<b>${fmt(r.dfirst)} ₪</b> לחודש</span></label>`).join(""):`<p class="empty">אין הצעות לגיל ${P.age} ל-${yw(P.h)}.</p>`;}
  if(P.step===3) $("p-sum-out").textContent=summary();
  $("p-err").textContent="";
}
function idOk(v){v=String(v).trim(); if(!/^\d{5,9}$/.test(v)) return false; v=v.padStart(9,"0"); let s=0; for(let i=0;i<9;i++){let d=+v[i]*((i%2)+1); s+=d>9?d-9:d;} return s%10===0;}
const phoneNorm=v=>String(v).replace(/[\s\-()]/g,"").replace(/^\+972/,"0");
const phoneOk=v=>/^0(5\d|[2-489]|7\d)\d{7}$/.test(phoneNorm(v));
const mailOk=v=>!v||/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v);
const txt=id=>$(id).value.replace(/[<>]/g,"").trim();
function validate(){
  const bad=[]; const mark=(id,ok,msg)=>{$(id).setAttribute("aria-invalid",!ok); if(!ok) bad.push([id,msg]);};
  if(P.step===0){const v=+$("p-sum").value; mark("p-sum",v>=100000&&v<=5000000,"סכום ביטוח בין 100 אלף ל-5 מיליון ₪"); if(bad.length===0) P.sum=v;}
  if(P.step===1&&P.co==null) bad.push(["p-co","צריך לבחור חברת ביטוח"]);
  if(P.step===2){mark("c-name",txt("c-name").length>=2,"צריך שם מלא"); mark("c-id",idOk($("c-id").value),"מספר תעודת זהות לא תקין"); mark("c-phone",phoneOk($("c-phone").value),"מספר טלפון לא תקין");
    mark("c-mail",mailOk(txt("c-mail")),"כתובת מייל לא תקינה"); mark("a-phone",!$("a-phone").value||phoneOk($("a-phone").value),"טלפון הסוכן לא תקין"); mark("a-mail",mailOk(txt("a-mail")),"מייל הסוכן לא תקין");
    mark("c-consent",$("c-consent").checked,"צריך את הסכמת הלקוח");}
  if(bad.length){$("p-err").textContent=bad[0][1]; const f=$(bad[0][0]); (f.matches("input,select,textarea")?f:f.querySelector("input"))?.focus(); return false;} return true;
}
function summary(){
  const q=pQuotes().find(r=>r.ci===P.co)||{}; const L=[];
  L.push("בקשה להקמת פוליסת ביטוח חיים (ריסק)","");
  L.push(`חברה: ${q.n||""}`,`סכום ביטוח: ${fmt(P.sum)} ₪ · תקופה: ${yw(P.h)}`,`מבוטח: גיל ${P.age}, ${P.g==="m"?"גבר":"אישה"}, ${P.s==="1"?"מעשן":"לא מעשן"}`);
  L.push(`פרמיה חודשית בשנה הראשונה: ${fmt(q.first||0)} ₪ (מחירון)`); if(q.label) L.push(`אחרי הנחה (${q.label}): ${fmt(q.dfirst)} ₪ · סה״כ משוער ל-${yw(P.h)}: ${fmt(q.total)} ₪`);
  L.push("","פרטי הלקוח:",`שם: ${txt("c-name")}`,`ת״ז: ${$("c-id").value.trim()}`,`טלפון: ${phoneNorm($("c-phone").value)}`);
  if(txt("c-mail")) L.push(`מייל: ${txt("c-mail")}`); if($("c-dob").value) L.push(`תאריך לידה: ${$("c-dob").value.split("-").reverse().join("/")}`); if(txt("c-notes")) L.push(`הערות: ${txt("c-notes")}`);
  if(txt("a-name")||txt("a-lic")) L.push("",`סוכן: ${txt("a-name")}${txt("a-lic")?` (רישיון ${txt("a-lic")})`:""}`);
  L.push("",`הלקוח אישר העברת פרטים לסוכן. מחירי מחירון של רשות שוק ההון מ-${window.RISK.DATE}, לפני חיתום.`);
  return L.join("\n");
}
function saveAgent(){try{ if($("a-remember").checked) localStorage.setItem("risk-agent",JSON.stringify({name:txt("a-name"),lic:txt("a-lic"),phone:txt("a-phone"),mail:txt("a-mail")})); else localStorage.removeItem("risk-agent"); }catch(e){}}
function clearClient(){["c-name","c-id","c-phone","c-mail","c-dob","c-notes"].forEach(id=>{$(id).value=""; $(id).removeAttribute("aria-invalid");}); $("c-consent").checked=false;}
let lastFocus=null;
function openPolicy(co){
  lastFocus=document.activeElement; Object.assign(P,{age:state.age,g:state.g,s:state.s,sum:state.sum,h:state.horizon,step:co!=null?1:0}); if(co!=null) P.co=co;
  drawer.hidden=false; scrim.hidden=false; requestAnimationFrame(()=>drawer.classList.add("open")); $("policy-tab").setAttribute("aria-expanded","true");
  document.body.style.overflow="hidden"; pRender(); setTimeout(()=>$("p-close").focus(),50);
}
function closePolicy(){drawer.classList.remove("open"); scrim.hidden=true; $("policy-tab").setAttribute("aria-expanded","false"); document.body.style.overflow="";
  setTimeout(()=>{drawer.hidden=true;},motionOff()?0:350); lastFocus?.focus?.();}
$("p-close").addEventListener("click",closePolicy); scrim.addEventListener("click",closePolicy);
drawer.addEventListener("keydown",e=>{ if(e.key==="Escape") closePolicy();
  if(e.key==="Tab"){const f=[...drawer.querySelectorAll("button,input,select,textarea,[tabindex='0']")].filter(x=>!x.closest("[hidden]")&&x.offsetParent!==null); const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault(); z.focus();} else if(!e.shiftKey&&document.activeElement===z){e.preventDefault(); a.focus();}}});
for(const [id,key,num] of [["p-g","g"],["p-s","s"],["p-h2","h",1]]) $(id).addEventListener("click",e=>{const b=e.target.closest("button"); if(b){P[key]=num?+b.dataset.v:b.dataset.v; pRender();}});
pAge.addEventListener("change",()=>{P.age=+pAge.value;});
$("p-co").addEventListener("change",e=>{if(e.target.name==="pco") P.co=+e.target.value;});
$("p-next").addEventListener("click",()=>{ if(!validate()) return; if(P.step===2) saveAgent(); P.step++; pRender(); drawer.scrollTop=0; drawer.querySelector(`.pstep[data-step="${P.step}"] legend`)?.setAttribute("tabindex","-1"); drawer.querySelector(`.pstep[data-step="${P.step}"] legend`)?.focus();});
$("p-back").addEventListener("click",()=>{P.step=Math.max(0,P.step-1); pRender();});
$("pform").addEventListener("submit",e=>e.preventDefault());
$("p-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(summary()); toast("הסיכום הועתק");}catch(e){const r=document.createRange(); r.selectNodeContents($("p-sum-out")); getSelection().removeAllRanges(); getSelection().addRange(r); toast("סמנתי את הטקסט, אפשר להעתיק");}});
$("p-wa").addEventListener("click",()=>{const ph=phoneNorm($("a-phone").value); const to=ph&&phoneOk(ph)?"972"+ph.slice(1):""; window.open(`https://wa.me/${to}?text=${encodeURIComponent(summary())}`,"_blank","noopener,noreferrer");});
$("p-mail").addEventListener("click",()=>{const to=mailOk(txt("a-mail"))?txt("a-mail"):""; location.href=`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent("בקשה להקמת פוליסת ריסק – "+txt("c-name"))}&body=${encodeURIComponent(summary())}`;});
$("p-print").addEventListener("click",()=>window.print());
$("p-clear").addEventListener("click",()=>{clearClient(); P.step=2; pRender(); toast("פרטי הלקוח נמחקו");});
window.addEventListener("pagehide",clearClient);

// ===== count-up numbers =====
document.querySelectorAll(".count").forEach(el=>{const to=+el.dataset.to; if(motionOff()) return; el.textContent="0";
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect(); const t0=performance.now(); const tick=t=>{const p=Math.min(1,(t-t0)/1200); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick);}; requestAnimationFrame(tick);}}); io.observe(el);});

render();

}

// ===== common to every page: frame-buster, theme, accessibility, motion =====
if(window.top!==window.self){try{window.top.location=window.self.location.href;}catch(e){document.documentElement.hidden=true;}}
const root=document.documentElement;
function motionOff(){return root.classList.contains("a-motion")||matchMedia("(prefers-reduced-motion: reduce)").matches;}
function toast(msg){const t=document.getElementById("toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove("show"),2600);}
(function theme(){
  const b=document.getElementById("theme"); if(!b) return; let mode="auto"; try{mode=localStorage.getItem("risk-theme")||"auto";}catch(e){}
  const label={auto:"◐ אוטומטי",light:"☀ בהיר",dark:"☾ כהה"};
  const apply=()=>{if(mode==="auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme",mode); b.textContent=label[mode]; b.setAttribute("aria-label","מצב תצוגה: "+label[mode].slice(2));};
  b.addEventListener("click",()=>{mode={auto:"light",light:"dark",dark:"auto"}[mode]; try{localStorage.setItem("risk-theme",mode);}catch(e){} apply();}); apply();
})();
(function a11y(){
  const btn=document.getElementById("a11y-btn"), menu=document.getElementById("a11y"); if(!btn) return;
  let s={f:0,contrast:0,links:0,motion:0}; try{Object.assign(s,JSON.parse(localStorage.getItem("risk-a11y")||"{}"));}catch(e){}
  const apply=()=>{root.style.fontSize=s.f?(100+s.f*12.5)+"%":""; for(const k of ["contrast","links","motion"]) root.classList.toggle("a-"+k,!!s[k]);
    menu.querySelectorAll("[data-a]").forEach(x=>{const k=x.dataset.a; if(s[k]!==undefined) x.setAttribute("aria-pressed",!!s[k]);}); try{localStorage.setItem("risk-a11y",JSON.stringify(s));}catch(e){}};
  btn.addEventListener("click",()=>{const o=menu.hidden; menu.hidden=!o; btn.setAttribute("aria-expanded",o);});
  menu.addEventListener("click",e=>{const x=e.target.closest("[data-a]"); if(!x) return; const a=x.dataset.a;
    if(a==="font+") s.f=Math.min(4,s.f+1); else if(a==="font-") s.f=Math.max(-2,s.f-1); else if(a==="reset") s={f:0,contrast:0,links:0,motion:0}; else s[a]=s[a]?0:1; apply();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){menu.hidden=true; btn.setAttribute("aria-expanded","false"); btn.focus();}});
  apply();
})();
(function intro(){
  const el=document.getElementById("intro"); if(!el) return; let seen=false; try{seen=!!sessionStorage.getItem("risk-intro");}catch(e){}
  const end=()=>{el.classList.add("done"); setTimeout(()=>el.classList.add("gone"),600); try{sessionStorage.setItem("risk-intro","1");}catch(e){}};
  if(seen||motionOff()){el.classList.add("done","gone"); return;}
  const sk=document.getElementById("intro-skip"); sk.tabIndex=0; sk.addEventListener("click",end); setTimeout(end,2300);
})();
(function reveal(){
  const els=document.querySelectorAll(".reveal"); if(!("IntersectionObserver" in window)||motionOff()){els.forEach(e=>e.classList.add("in")); return;}
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in"); io.unobserve(x.target);}}),{threshold:.12}); els.forEach(e=>io.observe(e));
})();
(function tilt(){
  if(!matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".tilt").forEach(el=>{
    el.addEventListener("pointermove",e=>{if(motionOff()) return; const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; el.style.transform=`perspective(800px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateZ(4px)`;});
    el.addEventListener("pointerleave",()=>{el.style.transform="";});});
})();
(function bg3d(){
  const c=document.getElementById("bg3d"); if(!c||!c.getContext) return; const g=c.getContext("2d"); let W,H,dpr,raf=0,t=0;
  const P=[]; const n=260; for(let i=0;i<n;i++){const y=1-2*(i+.5)/n, r=Math.sqrt(1-y*y), th=i*2.39996; P.push([Math.cos(th)*r,y,Math.sin(th)*r]);}
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1); W=c.width=innerWidth*dpr; H=c.height=innerHeight*dpr;};
  function frame(){
    g.clearRect(0,0,W,H); const col=getComputedStyle(root).getPropertyValue("--accent").trim()||"#0E7466";
    const R=Math.min(W,H)*.42, cx=W*.18, cy=H*.32, a=t*.0016, b=.35+Math.sin(t*.0007)*.15, ca=Math.cos(a), sa=Math.sin(a), cb=Math.cos(b), sb=Math.sin(b);
    g.fillStyle=col;
    for(const [x,y,z] of P){const x1=x*ca+z*sa, z1=-x*sa+z*ca, y1=y*cb-z1*sb, z2=y*sb+z1*cb, s=1.6/(2.6-z2);
      g.globalAlpha=Math.max(.05,(z2+1)/2*.5); g.beginPath(); g.arc(cx+x1*R*s,cy+y1*R*s,(1+z2)*1.5*dpr,0,6.283); g.fill();}
    g.globalAlpha=1;
  }
  function loop(){t+=16; frame(); raf=requestAnimationFrame(loop);}
  function sync(){cancelAnimationFrame(raf); if(document.hidden) return; if(motionOff()) frame(); else loop();}
  size(); addEventListener("resize",()=>{size(); sync();}); document.addEventListener("visibilitychange",sync);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:["class","data-theme"]}); sync();
})();
if(window.RISK) main();
