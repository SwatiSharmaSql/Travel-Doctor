/* ================= GROUP SPLIT: who paid, who owes who (like Splitwise) ================= */
// Families share one wallet. Groups of friends each pay for things, so we track who paid and who it was for.
// The settle up is pure code: balance = what you paid minus your fair share. Then we match people who owe with people who are owed.
const isGroup=t=>t?.party?.type==="group";
function groupNames(t){if(!isGroup(t))return [];return t.party.members.map((m,i)=>(m.name||"").trim()||(i===0?"Organizer":`Friend ${i+1}`))}
function matchName(raw,names){const r=String(raw||"").trim().toLowerCase();if(!r)return null;
  if(/^(me|i|myself)$/.test(r))return S.sender&&names.includes(S.sender)?S.sender:null;
  return names.find(n=>n.toLowerCase()===r)||names.find(n=>n.toLowerCase().split(/\s+/)[0]===r.split(/\s+/)[0])||null}
function settle(t,exps){const names=groupNames(t);if(!names.length)return null;
  const paid=Object.fromEntries(names.map(n=>[n,0])),share=Object.fromEntries(names.map(n=>[n,0])),unassigned=[];
  for(const e of exps){const by=matchName(e.paidBy,names);if(!by){unassigned.push(e);continue}
    const among=[...new Set((Array.isArray(e.splitAmong)?e.splitAmong:[]).map(x=>matchName(x,names)).filter(Boolean))],set=among.length?among:names;
    paid[by]+=e.base;for(const n of set)share[n]+=e.base/set.length}
  const people=names.map(n=>({name:n,paid:r2(paid[n]),share:r2(share[n]),net:r2(paid[n]-share[n])}));
  const cred=people.filter(p=>p.net>0.004).map(p=>({name:p.name,left:p.net})).sort((a,b)=>b.left-a.left);
  const debt=people.filter(p=>p.net<-0.004).map(p=>({name:p.name,left:-p.net})).sort((a,b)=>b.left-a.left);
  const moves=[];let i=0,j=0;while(i<debt.length&&j<cred.length){const x=Math.min(debt[i].left,cred[j].left);if(x>=0.01)moves.push({from:debt[i].name,to:cred[j].name,amount:r2(x)});
    debt[i].left-=x;cred[j].left-=x;if(debt[i].left<0.01)i++;if(cred[j].left<0.01)j++}
  return {names,people,moves,unassigned,shared_total:r2(people.reduce((s,p)=>s+p.paid,0))}}
function splitLabel(e,t){const names=groupNames(t),among=[...new Set((e.splitAmong||[]).map(x=>matchName(x,names)).filter(Boolean))];
  return !among.length||among.length===names.length?`split ${names.length} ways`:among.length===1?`just for ${among[0]}`:`for ${among.join(", ")}`}
function balancesForAnna(){const t=S.trip;const s=settle(t,S.expenses);if(!s)return {group:false,note:"This is not a group trip. Everyone shares one wallet, so nobody owes anyone."};
  return {group:true,currency:t.currency,shared_total:s.shared_total,people:s.people.map(p=>({name:p.name,paid:p.paid,fair_share:p.share,balance:p.net,status:p.net>0.004?"gets money back":p.net<-0.004?"owes":"settled"})),
    settle_up:s.moves.map(m=>`${m.from} pays ${m.to} ${money2(m.amount,t.currency)}`),expenses_without_payer:s.unassigned.map(e=>e.item)}}

/* dashboard panel */
function avatarColor(name,names){return AV_COLORS[Math.max(0,names.indexOf(name))%AV_COLORS.length]}
function renderOwe(t){const s=settle(t,S.expenses),cur=t.currency;
  if(!s){if(t.party?.type!=="family")return null;const names=t.party.members.map(m=>m.name).filter(Boolean);
    return el("div",{class:"panel"},el("h3",{text:"One family wallet"}),el("p",{class:"sub",text:`${names.length?names.join(", ")+" share":"Your family shares"} one budget. Whoever pays, it counts toward the same family total, so nobody owes anybody. Switch the trip to Group in Plan if friends are splitting costs.`}))}
  const p=el("div",{class:"panel"});p.append(el("h3",{text:"Who owes who"}),el("p",{class:"sub",text:`Like Splitwise: each expense is split evenly between the people it was for. Your balance is what you paid minus your fair share. Shared so far: ${money(s.shared_total,cur)}.`}));
  const maxAbs=Math.max(1,...s.people.map(x=>Math.abs(x.net)));
  const list=el("div");for(const x of s.people){const pos=x.net>0.004,neg=x.net<-0.004,w=Math.abs(x.net)/maxAbs*50;
    const bar=el("div",{class:"netbar"},el("i",{style:`${pos?`left:50%;width:${w}%;background:var(--pine)`:`right:50%;width:${w}%;background:var(--red)`}`}));
    list.append(el("div",{class:"owe-row"},el("span",{class:"avatar",style:`background:${avatarColor(x.name,s.names)}`,text:x.name[0].toUpperCase()}),
      el("div",{},el("b",{text:x.name}),el("small",{text:`paid ${money(x.paid,cur)} · fair share ${money(x.share,cur)}`}),bar),
      el("span",{class:"pill "+(pos?"ok":neg?"bad":"info"),text:pos?`gets back ${money2(x.net,cur)}`:neg?`owes ${money2(-x.net,cur)}`:"settled up"})))}
  const st=el("div",{class:"settle"});st.append(el("h3",{text:"Settle up"}));
  if(!s.moves.length)st.append(el("p",{class:"sub",text:"Everyone is even. Nothing to settle."}));
  for(const m of s.moves)st.append(el("div",{class:"settle-row"},el("span",{class:"avatar",style:`width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px;background:${avatarColor(m.from,s.names)}`,text:m.from[0]}),
    el("b",{text:m.from}),el("span",{text:"pays"}),el("b",{text:m.to}),el("span",{class:"amt",text:money2(m.amount,cur)})));
  st.append(el("p",{class:"sub",text:`${s.moves.length} payment${s.moves.length===1?"":"s"} and everyone is even.`}));
  if(s.unassigned.length)st.append(el("p",{class:"pill warn",style:"white-space:normal",text:`${s.unassigned.length} expense${s.unassigned.length>1?"s have":" has"} no payer yet, so ${s.unassigned.length>1?"they're":"it's"} left out. Pick who paid in the Expenses list below.`}));
  const ask=el("button",{class:"btn",type:"button"},icon("chat",18),"Ask Anna who owes who");ask.onclick=()=>{switchTab("anna");askAnna("Who owes who right now?")};st.append(el("div",{class:"btns"},ask));
  p.append(el("div",{class:"owe-grid"},list,st));return p}
