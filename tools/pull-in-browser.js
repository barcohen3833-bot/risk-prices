// Run in the browser console (or via a browser tool) while on https://life.cma.gov.il/ in a real session.
// The site is behind AWS WAF: server-side fetch gets an empty 202. A real browser session works.
// Pull slowly (>=2.5s between requests) or the site blocks you for a while. Takes ~15 minutes.
window.__R={done:0,err:[],data:{}};
(async()=>{
 const jobs=[]; for(let age=18;age<=69;age++) for(const g of [84400001,84400002]) for(const s of [false,true]) jobs.push({age,g,s});
 __R.total=jobs.length;
 for(const j of jobs){
  const p={CalculationType:84300001,PremiumType:84100001,NumberOfInsured:84200001,ListOfInsured:[{Gender:j.g,BirthDate:`${new Date().getFullYear()-j.age}-${new Date().toISOString().slice(5,10)}T00:00:00.000Z`,IsSmoking:j.s,ID:1,Age:j.age}],ListOfTracks:[],DesiredSum:1000000,DesiredPeriod:20,SortField:"",SortDirection:"asc"};
  for(let k=0;k<3;k++){try{
   const t=await fetch('/RiskParameters/CalculateRiskRates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).then(r=>r.text());
   const d=new DOMParser().parseFromString(t,'text/html'),el=d.querySelector('#graphInfo');
   const g=el?JSON.parse(el.dataset.graphresults):[];
   __R.data[`${j.age}|${j.g==84400001?'m':'f'}|${j.s?1:0}`]=g.map(c=>[c.CompanyName,c.MonthlyPremiumsDec.map(v=>Math.round(+v*100)/100)]);
   break;}catch(e){if(k==2)__R.err.push(JSON.stringify(j)+e);await new Promise(r=>setTimeout(r,3000));}}
  __R.done++; await new Promise(r=>setTimeout(r,2500));
 }
 __R.finished=true;
})();
