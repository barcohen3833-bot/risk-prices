// Agent area: Supabase auth (email + password) and the leads assigned to this agent.
// Access control lives in the database (RLS, see supabase/setup.sql); this page only shows what the API returns.
(function agentArea(){
const $=id=>document.getElementById(id);
const SB=window.RISK_SB&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(window.RISK_SB.url)?window.RISK_SB:null;
if(!SB){$("ag-off").hidden=false; return;}
const esc=v=>String(v??"").replace(/[&<>"'`]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"}[c]));
const fmt=n=>Math.round(+n||0).toLocaleString("he-IL");
const toast=window.toast||(()=>{});
const KEY="risk-sb";
let S=null; try{S=JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){}
const save=s=>{S=s; try{s?localStorage.setItem(KEY,JSON.stringify(s)):localStorage.removeItem(KEY);}catch(e){}};
function setSession(j){ if(!j||!j.access_token) return; save({access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),uid:j.user?.id||S?.uid}); }

async function auth(path,body,method="POST",tok){
  const h={apikey:SB.key,"Content-Type":"application/json"}; if(tok) h.Authorization="Bearer "+tok;
  const r=await fetch(SB.url+"/auth/v1/"+path,{method,headers:h,body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.msg||j.error_description||j.message||j.error||("http "+r.status)); return j;
}
async function token(){
  if(!S) throw new Error("no session");
  if(S.expires_at-60<Date.now()/1000){ try{setSession(await auth("token?grant_type=refresh_token",{refresh_token:S.refresh_token}));}catch(e){save(null); throw e;} }
  return S.access_token;
}
async function api(path,opt={}){
  const h={apikey:SB.key,Authorization:"Bearer "+await token(),"Content-Type":"application/json"}; if(opt.prefer) h.Prefer=opt.prefer;
  const r=await fetch(SB.url+"/rest/v1/"+path,{method:opt.method||"GET",headers:h,body:opt.body?JSON.stringify(opt.body):undefined});
  if(r.status===401){save(null); showLogin(); throw new Error("expired");}
  const t=await r.text(); const j=t?JSON.parse(t):null; if(!r.ok) throw new Error((j&&j.message)||("http "+r.status)); return j;
}

// ---- links from Supabase emails (confirm signup / password recovery) land here with tokens in the hash ----
let recovery=false;
if(location.hash.includes("access_token=")){
  const p=new URLSearchParams(location.hash.slice(1)); history.replaceState(null,"",location.pathname);
  setSession({access_token:p.get("access_token"),refresh_token:p.get("refresh_token"),expires_in:+p.get("expires_in")||3600});
  recovery=p.get("type")==="recovery";
} else if(location.hash.includes("error_description=")){
  const p=new URLSearchParams(location.hash.slice(1)); history.replaceState(null,"",location.pathname); setTimeout(()=>{$("au-err").textContent=p.get("error_description")||"הקישור לא תקין או פג תוקף";},0);
}

// ---- login / signup / reset ----
let mode="in";
const form=$("ag-login");
function setMode(m){mode=m; form.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));
  form.querySelectorAll(".up-only").forEach(e=>e.hidden=m!=="up"); form.querySelector(".pw").hidden=m==="reset";
  $("au-pass").autocomplete=m==="up"?"new-password":"current-password";
  $("au-h").textContent={in:"כניסת סוכנים",up:"הרשמת סוכן חדש",reset:"איפוס סיסמה",newpw:"בחירת סיסמה חדשה"}[m];
  $("au-go").textContent={in:"כניסה",up:"הרשמה",reset:"שליחת קישור לאיפוס",newpw:"שמירת הסיסמה"}[m];
  $("au-mail").closest(".field").hidden=m==="newpw"; form.querySelector(".seg").hidden=m==="newpw"; $("au-err").textContent="";}
form.querySelector(".seg").addEventListener("click",e=>{const b=e.target.closest("[data-m]"); if(b) setMode(b.dataset.m);});
function showLogin(){$("ag-app").hidden=true; form.hidden=false;}
const okMail=v=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v);
form.addEventListener("submit",async e=>{
  e.preventDefault(); const err=$("au-err"), btn=$("au-go"); err.textContent="";
  const mail=$("au-mail").value.trim(), pass=$("au-pass").value;
  if(mode!=="newpw"&&!okMail(mail)){err.textContent="כתובת מייל לא תקינה"; return;}
  if(mode!=="reset"&&pass.length<8){err.textContent="סיסמה של 8 תווים לפחות"; return;}
  if(mode==="up"&&$("au-name").value.trim().length<2){err.textContent="צריך שם מלא"; return;}
  btn.disabled=true;
  try{
    if(mode==="in"){setSession(await auth("token?grant_type=password",{email:mail,password:pass})); $("au-pass").value=""; await start();}
    else if(mode==="up"){const j=await auth("signup",{email:mail,password:pass,data:{name:$("au-name").value.trim().slice(0,60),phone:$("au-phone").value.trim().slice(0,14)}});
      if(j.access_token){setSession(j); await start();} else {setMode("in"); err.textContent="נשלח אליך מייל לאישור הכתובת. אחרי האישור אפשר להיכנס.";}}
    else if(mode==="reset"){const to=location.origin+location.pathname; await auth("recover?redirect_to="+encodeURIComponent(to),{email:mail}); err.textContent="אם הכתובת רשומה, נשלח אליה קישור לאיפוס.";}
    else if(mode==="newpw"){await auth("user",{password:pass},"PUT",await token()); $("au-pass").value=""; toast("הסיסמה עודכנה"); await start();}
  }catch(x){const m=String(x.message);
    err.textContent=/Invalid login/i.test(m)?"מייל או סיסמה שגויים":/not confirmed/i.test(m)?"צריך קודם לאשר את הכתובת מהמייל שנשלח אליך":/already registered/i.test(m)?"המייל הזה כבר רשום. אפשר להיכנס או לאפס סיסמה.":/rate limit|seconds/i.test(m)?"יותר מדי ניסיונות, נסו שוב בעוד כמה דקות.":"הפעולה נכשלה: "+m.slice(0,120);
  }finally{btn.disabled=false;}
});
$("ag-out").addEventListener("click",async()=>{try{await auth("logout",null,"POST",S&&S.access_token);}catch(e){} save(null); clearInterval(timer); showLogin(); setMode("in");});

// ---- dashboard ----
let me=null, leads=[], contacts=[], agents=[], timer=0, tab="leads";
const ST={new:"חדשה",contacted:"בטיפול",closed:"נסגרה",lost:"לא רלוונטי"};
async function start(){
  if(!S.uid){const u=await auth("user",null,"GET",await token()); S.uid=u.id; save(S);}
  const r=await api(`agents?id=eq.${encodeURIComponent(S.uid)}&select=*`); me=r&&r[0];
  form.hidden=true; $("ag-app").hidden=false;
  $("ag-name").textContent=me?me.name||me.email:"";
  $("ag-st").textContent=!me?"":me.is_admin?"מנהל":me.active?"פעיל":"ממתין לאישור"; $("ag-st").classList.toggle("off",!!me&&!me.active);
  document.querySelector('[data-t="team"]').classList.toggle("hide",!(me&&me.is_admin));
  await loadAll(); clearInterval(timer); timer=setInterval(()=>{if(!document.hidden) loadLeads().catch(()=>{});},60000);
}
async function loadAll(){await Promise.all([loadLeads(),loadContacts()]); if(me&&me.is_admin) await loadTeam();}
async function loadLeads(){
  leads=await api("leads?select=*,agents(name)&order=created_at.desc&limit=300")||[]; renderLeads();
  $("ag-upd").textContent="עודכן "+new Date().toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
  const n=leads.filter(l=>l.status==="new").length; document.title=(n?`(${n}) `:"")+"כניסת סוכנים – מחירון ביטוח ריסק";
}
async function loadContacts(){contacts=await api("insurer_contacts?select=*&order=insurer")||[]; renderProd();}
async function loadTeam(){agents=await api("agents?select=*&order=created_at")||[]; renderTeam();}
const prodOf=co=>contacts.find(c=>c.insurer===co);
function leadText(l){const q=l.quote||{};
  return ["בקשה להקמת פוליסת ביטוח חיים (ריסק)","",`חברה: ${q.co||""}`,`סכום ביטוח: ${fmt(q.sum)} ₪`,`מבוטח: גיל ${q.age}, ${q.g==="f"?"אישה":"גבר"}, ${q.s==="1"?"מעשן":"לא מעשן"}`,
    `פרמיה חודשית בשנה הראשונה (מחירון): ${fmt(q.first)} ₪`+(q.dfirst!=null&&q.dfirst<q.first?` · אחרי הנחה משוערת: ${fmt(q.dfirst)} ₪`:""),"",
    "פרטי הלקוח:",`שם: ${l.name}`,`טלפון: ${l.phone}`].concat(l.email?[`מייל: ${l.email}`]:[]).concat(l.notes?[`הערות הלקוח: ${l.notes}`]:[])
    .concat(["",`סוכן: ${me?me.name||"":""}${me&&me.phone?" · "+me.phone:""}`]).join("\n");}
function renderLeads(){
  const f=$("lf-st").value; const list=leads.filter(l=>f==="all"||(f==="open"?(l.status==="new"||l.status==="contacted"):l.status===f));
  if(me&&!me.active&&!me.is_admin){$("leads").innerHTML=`<div class="empty-s">החשבון שלך ממתין לאישור של מנהל המערכת. אחרי האישור פניות חדשות יגיעו לכאן.</div>`; return;}
  if(!list.length){$("leads").innerHTML=`<div class="empty-s">אין פניות ${f==="open"?"פתוחות ":""}כרגע. פניות חדשות מגיעות לפי תור בין הסוכנים הפעילים.</div>`; return;}
  $("leads").innerHTML=list.map(l=>{const q=l.quote||{}, ph=String(l.phone||"").replace(/\D/g,""), pr=prodOf(q.co);
    const when=new Date(l.created_at).toLocaleString("he-IL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    return `<article class="lcard st-${esc(l.status)}" data-id="${+l.id}">
      <div class="lhead"><b>${esc(l.name)}</b><span class="mut">${when}${me&&me.is_admin?` · ${l.agents?esc(l.agents.name):"לא שובץ"}`:""}</span></div>
      <div class="lgrid"><div><small>טלפון</small><a href="tel:${esc(ph)}" dir="ltr">${esc(l.phone)}</a></div>${l.email?`<div><small>מייל</small><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></div>`:""}
        <div><small>חברה</small><b>${esc(q.co)}</b></div><div><small>מבוטח</small>גיל ${+q.age||"?"}, ${q.g==="f"?"אישה":"גבר"}, ${q.s==="1"?"מעשן":"לא מעשן"}</div>
        <div><small>סכום ביטוח</small>${fmt(q.sum)} ₪</div><div><small>מחיר חודשי</small><b>${fmt(q.dfirst!=null&&q.dfirst<q.first?q.dfirst:q.first)} ₪</b>${q.dfirst!=null&&q.dfirst<q.first?` <s class="mut">${fmt(q.first)}</s>`:""}</div>
        ${q.time?`<div><small>זמן נוח</small>${esc(q.time)}</div>`:""}</div>
      ${l.notes?`<p class="m0"><small class="mut">הערות הלקוח:</small> ${esc(l.notes)}</p>`:""}
      <textarea data-notes rows="1" maxlength="1000" placeholder="הערות שלך (נשמר אוטומטית)" aria-label="הערות סוכן">${esc(l.agent_notes)}</textarea>
      <div class="lacts">
        <select data-status aria-label="סטטוס">${Object.entries(ST).map(([k,v])=>`<option value="${k}"${l.status===k?" selected":""}>${v}</option>`).join("")}</select>
        <a class="btn2" href="https://wa.me/972${esc(ph.replace(/^0/,""))}" target="_blank" rel="noopener noreferrer">וואטסאפ ללקוח</a>
        <button type="button" class="cta" data-build>בניית פוליסה</button>
        <button type="button" class="btn2" data-prod>שליחה למפיק${pr&&pr.producer_email?"":" (אין מייל)"}</button>
        <button type="button" class="btn2" data-copy>העתקה</button>
      </div></article>`;}).join("");
}
$("lf-st").addEventListener("change",renderLeads);
$("ag-ref").addEventListener("click",()=>loadAll().then(()=>toast("עודכן")).catch(e=>toast("שגיאה: "+e.message)));
$("leads").addEventListener("change",async e=>{const card=e.target.closest("[data-id]"); if(!card) return; const id=+card.dataset.id, l=leads.find(x=>x.id===id);
  try{ if(e.target.matches("[data-status]")){await api(`leads?id=eq.${id}`,{method:"PATCH",body:{status:e.target.value},prefer:"return=minimal"}); l.status=e.target.value; card.className=`lcard st-${l.status}`; toast("הסטטוס עודכן");}
    if(e.target.matches("[data-notes]")){await api(`leads?id=eq.${id}`,{method:"PATCH",body:{agent_notes:e.target.value.slice(0,1000)},prefer:"return=minimal"}); l.agent_notes=e.target.value; toast("ההערה נשמרה");}
  }catch(x){toast("השמירה נכשלה");}});
$("leads").addEventListener("click",async e=>{const card=e.target.closest("[data-id]"); if(!card) return; const l=leads.find(x=>x.id===+card.dataset.id), q=l.quote||{};
  if(e.target.closest("[data-build]")){try{sessionStorage.setItem("risk-open-policy",JSON.stringify({age:q.age,g:q.g,s:q.s,sum:q.sum,co:q.co,name:l.name,phone:l.phone,mail:l.email||""}));}catch(x){} location.href="./";}
  if(e.target.closest("[data-prod]")){const pr=prodOf(q.co); const to=pr&&pr.producer_email||"";
    location.href=`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(`בקשה להצעת ריסק – ${l.name} – ${q.co||""}`)}&body=${encodeURIComponent(leadText(l))}`;
    if(!to) toast("אין עדיין מייל מפיק לחברה הזו. אפשר להוסיף בלשונית מפיקים.");}
  if(e.target.closest("[data-copy]")){try{await navigator.clipboard.writeText(leadText(l)); toast("הועתק");}catch(x){toast("ההעתקה נכשלה");}}
});
function renderProd(){
  const admin=me&&me.is_admin;
  if(!contacts.length){$("prod").innerHTML=`<div class="empty-s">אין עדיין רשימת מפיקים.</div>`; return;}
  $("prod").innerHTML=`<table><thead><tr><th>חברה</th><th>מייל מפיק</th><th>טלפון</th><th>הערות</th>${admin?"<th></th>":""}</tr></thead><tbody>${contacts.map(c=>admin?
    `<tr data-ins="${esc(c.insurer)}"><td><b>${esc(c.insurer)}</b></td><td><input type="email" data-f="producer_email" value="${esc(c.producer_email)}" maxlength="120" aria-label="מייל מפיק, ${esc(c.insurer)}"></td><td><input data-f="producer_phone" value="${esc(c.producer_phone)}" maxlength="20" aria-label="טלפון מפיק"></td><td><input data-f="notes" value="${esc(c.notes)}" maxlength="200" aria-label="הערות"></td><td><button type="button" class="btn2" data-save>שמירה</button></td></tr>`:
    `<tr><td><b>${esc(c.insurer)}</b></td><td>${c.producer_email?`<a href="mailto:${esc(c.producer_email)}">${esc(c.producer_email)}</a>`:'<span class="mut">—</span>'}</td><td>${c.producer_phone?`<a href="tel:${esc(c.producer_phone)}">${esc(c.producer_phone)}</a>`:'<span class="mut">—</span>'}</td><td>${esc(c.notes)}</td></tr>`).join("")}</tbody></table>`;
}
$("prod").addEventListener("click",async e=>{const tr=e.target.closest("[data-ins]"); if(!tr||!e.target.closest("[data-save]")) return; const body={};
  tr.querySelectorAll("[data-f]").forEach(i=>body[i.dataset.f]=i.value.trim()||null);
  if(body.producer_email&&!okMail(body.producer_email)){toast("מייל לא תקין"); return;}
  try{await api(`insurer_contacts?insurer=eq.${encodeURIComponent(tr.dataset.ins)}`,{method:"PATCH",body,prefer:"return=minimal"}); toast("נשמר"); await loadContacts();}catch(x){toast("השמירה נכשלה");}});
function renderTeam(){
  $("team").innerHTML=`<table><thead><tr><th>סוכן</th><th>טלפון</th><th>מייל</th><th>פניות</th><th>סטטוס</th></tr></thead><tbody>${agents.map(a=>`<tr data-ag="${esc(a.id)}"><td><b>${esc(a.name)}</b>${a.is_admin?' <span class="badge">מנהל</span>':""}</td><td>${esc(a.phone)}</td><td>${esc(a.email)}</td><td>${leads.filter(l=>l.agent_id===a.id).length}</td>
    <td><label class="chk"><input type="checkbox" data-active${a.active?" checked":""}${a.id===me.id?" disabled":""}> מקבל פניות</label></td></tr>`).join("")}</tbody></table>`;
}
$("team").addEventListener("change",async e=>{const tr=e.target.closest("[data-ag]"); if(!tr||!e.target.matches("[data-active]")) return;
  try{await api(`agents?id=eq.${encodeURIComponent(tr.dataset.ag)}`,{method:"PATCH",body:{active:e.target.checked},prefer:"return=minimal"}); toast(e.target.checked?"הסוכן פעיל ומקבל פניות":"הסוכן הושבת"); await loadTeam();}catch(x){toast("העדכון נכשל"); e.target.checked=!e.target.checked;}});
document.querySelector(".ag-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-t]"); if(!b) return; tab=b.dataset.t;
  document.querySelectorAll(".ag-tabs [data-t]").forEach(x=>x.setAttribute("aria-pressed",x===b)); ["leads","prod","team"].forEach(t=>$("t-"+t).hidden=t!==tab);});

setMode(recovery?"newpw":"in");
if(S&&!recovery) start().catch(()=>{save(null); showLogin();}); else showLogin();
})();
