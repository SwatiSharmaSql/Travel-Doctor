/* ================= RENDERING ================= */

/* hero + boarding pass */
function renderHero(){
  const h=$("hero"),t=S.trip;h.innerHTML=heroSky();
  const top=el("div");top.append(el("span",{class:"kicker",text:t?`${t.party?.type==="family"?"Family":t.party?.type==="group"?"Group":"Solo"} trip · ${diffDays(t.start,t.end)+1} days`:"Travel Doctor · budget travel planner"}));
  top.append(el("h1",{text:t?t.name:"Plan a trip that fits your budget"}));
  top.append(el("p",{class:"tag",text:t?(t.route?.nights?.length?routeSummary(t.route.nights).map(r=>`${r.city} ${r.n} night${r.n>1?"s":""}`).join("  →  "):(t.cities||[]).join("  →  "))||"Add your destination cities":"Set your budget, pick your experiences, and let Anna track every franc, euro and rupee on WhatsApp."}));
  h.append(top);
  const cities=t?.cities||[],froms=originFrames(t),many=froms.length>1;
  const mid=t?[`${diffDays(t.start,t.end)+1} days`,many?`${people(t)} travelers · ${froms.length} cities`:(flightLine(t.flights?.out)||`${people(t)} ${people(t)===1?"traveler":"travelers"}`)]:["Your trip","starts here"];
  const jw=el("div",{class:"journey",html:journeyArt(froms,destFrames(t),mid)});h.append(jw);startJourney(jw);
  const pass=el("div",{class:"pass"});
  const cell=(label,val,extra)=>{const d=el("div");d.append(el("small",{text:label}));if(extra)d.append(extra);else d.append(el("b",{text:val}));return d};
  const code=s=>(String(s||"").match(/\(([A-Z]{3})\)/)||[])[1];
  const from=t?.home?(code(t.home)||t.home.replace(/\s*\(.*\)/,"").slice(0,12)):"Home",to=t?.flights?.out?.to&&code(t.flights.out.to)||(cities.length?cities[cities.length-1]:"Anywhere");
  const route=el("div",{class:"pass-route"},el("b",{text:from}),icon("plane",20),el("b",{text:to}));
  pass.append(cell("Route",null,route),cell("Depart",t?niceDate(t.start):"Pick a date"),cell("Return",t?niceDate(t.end):"Pick a date"),
    cell("Travelers",t?`${people(t)} ${people(t)===1?"person":"people"}`:"1 or more"),cell("Budget",null,el("b",{text:t?money(t.budget,t.currency):"You decide"})));
  const last=pass.lastChild;
  if(t?.flights?.price>0)last.append(el("span",{class:"fl",text:t.flights.included?`incl. ${money(flightsTotal(t),t.currency)} flights`:`+ ${money(flightsTotal(t),t.currency)} flights`}));
  else if(t){const a=el("button",{class:"addfl",type:"button",text:"+ Add flights"});a.onclick=()=>{switchTab("trip");showSub("flights");$("pane-flights").scrollIntoView({behavior:"smooth",block:"start"})};last.append(a)}
  if(t?.flights?.out?.dep){const r=pass.firstChild;r.append(el("span",{class:"fl",text:flightLine(t.flights.out)}))}
  h.append(pass);
}

/* step 1: who's traveling */
let party={type:"family",adults:2,children:1,members:[]};
const PARTY_INFO={solo:["solo","Solo","Just me"],family:["family","Family","Adults and kids"],group:["group","Group","Friends or colleagues"]};
const PARTY_HINT={solo:"Just you. Anna messages you directly on WhatsApp.",
  family:"Parents share one WhatsApp group with Anna and both can log expenses. Kids don't need a number.",
  group:"Everyone gets invited to one WhatsApp group with Anna. Each person logs what they paid, and Anna keeps one shared total. Add where each person flies from to see their home city on the postcard up top."};
function renderSeg(){const seg=$("seg");seg.innerHTML="";
  for(const[k,[ic,name,sub]]of Object.entries(PARTY_INFO)){const inp=el("input",{type:"radio",name:"ptype",value:k,id:"pt-"+k});inp.checked=party.type===k;
    inp.onchange=()=>{syncMembers();party.type=k;renderParty()};
    seg.append(el("label",{class:"seg-opt",for:"pt-"+k},inp,el("span",{},icon(ic,24),el("b",{text:name}),el("small",{text:sub}))))}}
function renderParty(){
  renderSeg();
  if(party.type==="solo"){party.adults=1;party.children=0}
  if(party.type==="group"){party.children=0;party.adults=Math.max(2,party.adults)}
  const counts=$("counts");counts.innerHTML="";
  const stepper=(label,key,lo,hi)=>{const m=el("button",{type:"button","aria-label":"Fewer "+label,text:"−"}),p=el("button",{type:"button","aria-label":"More "+label,text:"+"});
    m.onclick=()=>{syncMembers();party[key]=Math.max(lo,party[key]-1);renderParty()};p.onclick=()=>{syncMembers();party[key]=Math.min(hi,party[key]+1);renderParty()};
    return el("div",{class:"stepper"},el("span",{text:label}),m,el("b",{text:String(party[key])}),p)};
  if(party.type==="family")counts.append(stepper("Adults","adults",1,6),stepper("Children","children",0,8));
  if(party.type==="group")counts.append(stepper("People","adults",2,20));
  $("party-hint").textContent=PARTY_HINT[party.type];
  const box=$("members");box.innerHTML="";
  for(let i=0;i<party.adults+party.children;i++){const m=party.members[i]||{},isChild=party.type==="family"&&i>=party.adults;
    const role=party.type==="solo"?"You":party.type==="family"?(isChild?`Child ${i-party.adults+1}`:`Parent ${i+1}`):i===0?"Organizer":`Person ${i+1}`;
    const name=el("input",{id:`m-name-${i}`,placeholder:"Name",value:m.name||"","aria-label":role+" name"});
    const phone=el("input",{id:`m-phone-${i}`,type:"tel",placeholder:isChild?"No number needed":"+1 214 555 0100",value:m.phone||"","aria-label":role+" WhatsApp number"});if(isChild)phone.disabled=true;
    const av=el("span",{class:"avatar",style:`background:${AV_COLORS[i%AV_COLORS.length]}`,text:(m.name||role)[0].toUpperCase()});
    const home=party.type==="group"?el("input",{id:`m-home-${i}`,list:"airport-list",placeholder:"Flying from (city)",value:m.home||"","aria-label":role+" flying from"}):null;
    if(home)home.addEventListener("change",()=>{syncMembers()});
    box.append(el("div",{class:"member"+(home?" g4":"")},el("span",{class:"role"},av,role),name,phone,home))}
  renderPerPerson();
}
function syncMembers(){const out=[];for(let i=0;i<Math.max(party.adults+party.children,party.members.length);i++){const n=$(`m-name-${i}`),p=$(`m-phone-${i}`),h=$(`m-home-${i}`);out.push(n?{name:n.value.trim(),phone:p.disabled?"":p.value.trim(),home:h?h.value.trim():(party.members[i]?.home||"")}:party.members[i]||{})}party.members=out}
function readParty(){syncMembers();return {...party,members:party.members.slice(0,party.adults+party.children)}}
function renderPerPerson(){const b=formSpendBudget(),n=party.adults+party.children,cur=$("f-cur").value;$("per-person").textContent=b&&n>1?`${money(b,cur)} for ${n} people is about ${money(b/n,cur)} per person.`:""}

/* step 3: budget prescription */
let split=Object.fromEntries(CATS.map(c=>[c[0],c[2]]));
function renderSplit(){const box=$("rx-rows");box.innerHTML="";
  for(const[k,name,,ic]of CATS){const r=el("input",{type:"range",min:"0",max:"80",step:"1",value:String(split[k]),id:"split-"+k,"aria-label":name+" percent"});r.oninput=()=>{split[k]=Number(r.value);updateSplit()};
    box.append(el("div",{class:"rx-row"},icon(ic,18),el("span",{text:name}),r,el("span",{class:"pct",id:"pct-"+k}),el("span",{class:"amt",id:"amt-"+k})))}
  updateSplit()}
function updateSplit(){const b=formSpendBudget(),cur=$("f-cur").value;let tot=0;
  for(const[k]of CATS){tot+=split[k];$("pct-"+k).textContent=split[k]+"%";$("amt-"+k).textContent=money(b*split[k]/100,cur)}
  const t=$("rx-total");t.textContent=tot===100?"100% ✓":`${tot}% (needs 100%)`;t.className=tot===100?"total-ok":"total-bad";renderTripMath()}
const rateLabel=()=>{$("f-rate-label").textContent=`1 ${$("f-local").value} in ${$("f-cur").value}`};
function renderTripMath(){const s=$("f-start").value,e=$("f-end").value,b=formSpendBudget(),cur=$("f-cur").value;
  $("trip-math").textContent=s&&e&&e>=s&&b>0?`${diffDays(s,e)+1} days × ${money(b/(diffDays(s,e)+1),cur)} a day = ${money(b,cur)}. Anna uses this daily budget to tell you if you're on pace.`:"Fill in dates and budget to see your daily budget.";renderWA();renderPerPerson();renderFlightSum()}

/* Anna's messages, in a phone */
function phone(title,subtitle,bubbles){const ph=el("div",{class:"phone"});const gav=el("span",{class:"gav",html:annaAvatar(38).replace(/#fff/g,"var(--pine-soft)")});
  ph.append(el("div",{class:"phone-top"},gav,el("div",{},el("b",{text:title}),el("small",{text:subtitle}))));
  const body=el("div",{class:"phone-body"});for(const b of bubbles)body.append(b);ph.append(body);return ph}
function renderWA(){const box=$("wa-preview");box.innerHTML="";
  const name=$("f-name").value||"your trip",b=formSpendBudget(),cur=$("f-cur").value,s=$("f-start").value,e=$("f-end").value,d=s&&e&&e>=s?diffDays(s,e)+1:null;
  const bub=(who,txt,cls="")=>el("div",{class:"bub "+cls},who?el("small",{text:who}):null,txt);
  box.append(phone("Anna · Travel Doctor","template preview",[
    bub("Anna",`Hi, I'm Anna, your Travel Doctor agent! Your ${name} budget is ${money(b,cur)}${d?`, about ${money(b/d,cur)} a day`:""}. Send me your expenses anytime, by text or voice note.`),
    bub("Anna","How was day 3? Send me today's expenses and I'll update your budget. 🌙 8pm check in"),
    bub("","Dinner was 85 francs and the cable car 64","me"),
    bub("Anna","Logged 2 expenses. I'll send your day total, the trip so far, and whether you're on track.")]))}

/* WhatsApp group card */
function renderGroup(){const body=$("group-body");body.innerHTML="";const t=S.trip,g=t?.whatsappGroup;
  if(!g){body.append(el("p",{class:"sub",text:"Tick \"Create a WhatsApp group with Anna\" in step 4 and save. Travel Doctor creates a group for your trip, invites everyone you listed, and Anna joins as the budget keeper so everyone sees the same total."}));body.append(howItWorks());return}
  const joined=g.participants.filter(p=>p.status==="joined").length;
  const bubbles=[el("div",{class:"bub sys",text:`Travel Doctor created group "${g.subject}"`})];
  if(joined)bubbles.push(el("div",{class:"bub sys",text:`${g.participants.map(p=>p.name).join(", ")} joined`}),el("div",{class:"bub"},el("small",{text:"Anna"}),`Welcome, ${g.participants.map(p=>p.name).join(" and ")}! I'm tracking the ${money(t.budget,t.currency)} budget for all ${people(t)} of you. Anyone can send me an expense.`));
  else bubbles.push(el("div",{class:"bub sys",text:`Invite link sent to ${g.participants.length} ${g.participants.length===1?"person":"people"}. Waiting for them to join.`}));
  body.append(phone(g.subject,`Anna${g.participants.length?", "+g.participants.map(p=>p.name).join(", "):""}`,bubbles));
  const list=el("div");
  list.append(el("div",{class:"gm"},el("span",{class:"who"},el("span",{class:"avatar",style:"background:var(--red)",html:annaAvatar(30)}),el("span",{},"Anna",el("small",{text:"Travel Doctor agent · group admin"}))),el("span",{class:"pill ok",text:"admin"})));
  g.participants.forEach((p,i)=>list.append(el("div",{class:"gm"},el("span",{class:"who"},el("span",{class:"avatar",style:`background:${AV_COLORS[i%AV_COLORS.length]}`,text:(p.name||"?")[0].toUpperCase()}),el("span",{},p.name,el("small",{text:`${p.role} · ${p.phone}`}))),el("span",{class:"pill "+(p.status==="joined"?"ok":"warn"),text:p.status}))));
  body.append(list,el("div",{},el("label",{text:"Invite link (sent with an approved template)"}),el("div",{class:"invite",text:g.inviteLink})));
  const acts=el("div",{class:"btns"});
  if(joined<g.participants.length){const b=el("button",{class:"btn dark small",type:"button"},icon("check",16),"Simulate everyone joining");b.onclick=async()=>{await store.saveTrip({...S.trip,whatsappGroup:simulateJoins(g)});render()};acts.append(b)}
  acts.append(el("button",{class:"btn small",type:"button",disabled:"",title:"Needs a WhatsApp Business account"},icon("phone",16),"Activate on WhatsApp"));body.append(acts);
  const log=el("ol",{class:"steps"});for(const e of g.events)log.append(el("li",{text:e.text}));
  body.append(el("details",{},el("summary",{text:"What happened behind the scenes"}),log),howItWorks());
}
function howItWorks(){const s=el("ol",{class:"steps"});for(const x of ACTIVATION_STEPS)s.append(el("li",{text:x}));return el("details",{},el("summary",{text:"What it takes to turn this on for real"}),s)}

/* plan your days */
function renderPlan(){const panel=$("plan-panel"),t=S.trip;if(!t){panel.hidden=true;return}panel.hidden=false;
  const cities=t.cities||[];if(!S.city||!cities.includes(S.city))S.city=cities[0]||null;
  const tabs=$("city-tabs");tabs.innerHTML="";
  cities.forEach((c,i)=>{const b=el("button",{class:"city",type:"button","aria-pressed":String(c===S.city)},el("span",{class:"dot",text:String(i+1)}),c);b.onclick=()=>{S.city=c;renderPlan()};tabs.append(b)});
  const cost=itineraryCost(t),pc=$("plan-cost");pc.innerHTML="";
  pc.append(el("span",{class:"sub",text:`Planned ${money(cost.total,t.currency)} for ${cost.people} · experiences budget ${money(cost.plan,t.currency)} `}),el("span",{class:"pill "+(cost.left>=0?"ok":"bad"),text:cost.left>=0?`${money(cost.left,t.currency)} left`:`${money(-cost.left,t.currency)} over`}));
  renderAttractions();renderItinerary();
}
async function renderAttractions(){const box=$("attractions"),t=S.trip,city=S.city;box.innerHTML="";
  if(!city){box.append(el("p",{class:"sub",text:"Add destination cities in step 2 to see what to do there."}));drawMap();return}
  const data=S.attr[city];
  if(!data){box.append(el("p",{class:"sub",text:`Finding the top 5 in ${city}…`}));drawMap();if(S.loading===city)return;S.loading=city;
    try{S.attr[city]=await getAttractions(city)}catch(e){S.loading=null;if(S.city===city){box.innerHTML="";box.append(el("p",{class:"err",text:e.message}))}return}
    S.loading=null;if(S.city===city)renderPlan();return}
  const planned=new Map((t.itinerary||[]).map(x=>[x.attractionId,x]));const days=[];for(let i=0;i<=diffDays(t.start,t.end);i++)days.push(addDays(t.start,i));
  data.items.forEach((a,i)=>{const p=planned.get(a.id);const sel=el("select",{"aria-label":"Day for "+a.name});for(const d of days){const c=cityOn(t,d);sel.append(el("option",{value:d,text:`Day ${diffDays(t.start,d)+1} · ${niceDate(d)}${c?" · in "+c:""}`}))}
    const firstHere=days.find(d=>cityOn(t,d)===city);sel.value=p?p.date:(firstHere||days[0]);
    const add=el("button",{class:"btn small "+(p?"":"primary"),type:"button",text:p?"Move":"Add"});
    add.onclick=async()=>{const item={id:"i"+Date.now().toString(36),attractionId:a.id,name:a.name,city,date:sel.value,cost:a.cost,currency:data.currency,hours:a.hours,lat:a.lat,lng:a.lng};
      await store.saveTrip({...S.trip,itinerary:[...(S.trip.itinerary||[]).filter(x=>x.attractionId!==a.id),item]});render()};
    const art=el("div",{class:"art",html:attrArt(a,i)});art.append(el("span",{class:"num",text:String(i+1)}),el("span",{class:"price",text:a.cost==null?"price ?":a.cost===0?"free":`~${money(a.cost,data.currency)}`}));
    const meta=el("div",{class:"meta"},a.hours?el("span",{},icon("clock",14),`${a.hours} h`):null,el("span",{},icon("pin",14),el("a",{href:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name+" "+city)}`,target:"_blank",rel:"noopener",text:"Maps"})),p?el("span",{class:"pill ok",text:`Day ${diffDays(t.start,p.date)+1}`}):null);
    box.append(el("article",{class:"attr"+(p?" picked":"")},art,el("div",{class:"body"},el("h4",{text:a.name}),el("p",{text:a.why}),meta,el("div",{class:"add"},sel,add))))});
  box.append(el("p",{class:"sub",style:"grid-column:1/-1",text:data.source==="curated"?"Hand checked list. Prices are typical per person and change; check before booking.":"Suggested by Claude and checked by code for valid fields. Prices are rough typical estimates; check before booking."}));
  drawMap();
}
/* illustrated map: the trip route on top, the current city's top 5 below, both drawn to scale from real coordinates */
function centroid(items){return {lat:items.reduce((s,a)=>s+a.lat,0)/items.length,lng:items.reduce((s,a)=>s+a.lng,0)/items.length}}
function proj(pts,x0,y0,w,h,padF=.18){const lats=pts.map(p=>p.lat),lngs=pts.map(p=>p.lng);let a=Math.min(...lats),b=Math.max(...lats),c=Math.min(...lngs),d=Math.max(...lngs);
  const k=Math.cos((a+b)/2*Math.PI/180);let sx=(d-c)*k||.02,sy=(b-a)||.02;const scale=Math.min(w/(sx*(1+padF*2)),h/(sy*(1+padF*2)));
  const cx=(c+d)/2,cy=(a+b)/2;return p=>({x:x0+w/2+(p.lng-cx)*k*scale,y:y0+h/2-(p.lat-cy)*scale})}
function drawMap(){const host=$("map"),t=S.trip;if(!t){host.innerHTML="";return}
  const W=600,H=560,cities=(t.cities||[]).map(c=>{const d=S.attr[c]||(CURATED[cityKey(c)]?{items:CURATED[cityKey(c)]}:null);return d?{name:c,...centroid(d.items)}:null});
  const known=cities.filter(Boolean);let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustrated map of your trip route and the top attractions in ${esc(S.city||"")}">`;
  svg+=`<rect width="${W}" height="${H}" style="fill:var(--sky-soft)"/>`;
  svg+=`<g style="stroke:var(--line)" stroke-width="1">${Array.from({length:12},(_,i)=>`<path d="M${i*55} 0V${H}"/>`).join("")}${Array.from({length:11},(_,i)=>`<path d="M0 ${i*55}H${W}"/>`).join("")}</g>`;
  svg+=`<text x="18" y="30" font-size="13" font-weight="700" style="fill:var(--muted)" letter-spacing="1.5">YOUR ROUTE</text>`;
  if(known.length>=1){const P=proj(known,30,44,W-200,210,.12);const pts=cities.map(c=>c&&P(c));
    let d="";let prev=null;pts.forEach(p=>{if(!p)return;if(!prev)d=`M${p.x} ${p.y}`;else{const mx=(prev.x+p.x)/2,my=(prev.y+p.y)/2-30;d+=` Q${mx} ${my} ${p.x} ${p.y}`}prev=p});
    svg+=`<path d="${d}" fill="none" style="stroke:var(--red)" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>`;
    cities.forEach((c,i)=>{const p=pts[i];if(!p)return;const on=c.name===S.city;
      svg+=`<g><circle cx="${p.x}" cy="${p.y}" r="${on?15:12}" style="fill:${on?"var(--red)":"var(--paper)"};stroke:var(--ink)" stroke-width="2"/><text x="${p.x}" y="${p.y+4.5}" text-anchor="middle" font-size="12" font-weight="700" style="fill:${on?"#fff":"var(--ink)"}">${i+1}</text><text x="${p.x+22}" y="${p.y+5}" font-size="14" font-weight="700" style="fill:var(--ink);paint-order:stroke;stroke:var(--sky-soft);stroke-width:4px">${esc(c.name)}</text></g>`})}
  else svg+=`<text x="${W/2}" y="140" text-anchor="middle" font-size="14" style="fill:var(--muted)">Your route appears once your cities load</text>`;
  svg+=`<path d="M0 270H${W}" style="stroke:var(--ink)" stroke-width="1.5" stroke-dasharray="3 5"/>`;
  const data=S.city&&S.attr[S.city];
  svg+=`<rect x="0" y="271" width="${W}" height="${H-271}" style="fill:var(--pine-soft)"/>`;
  svg+=`<g style="stroke:var(--line)" stroke-width="1" opacity=".8">${Array.from({length:5},(_,i)=>`<path d="M0 ${330+i*50} Q150 ${310+i*50} 300 ${330+i*50} T600 ${330+i*50}" fill="none"/>`).join("")}</g>`;
  svg+=`<text x="18" y="298" font-size="13" font-weight="700" style="fill:var(--muted)" letter-spacing="1.5">${esc((S.city||"").toUpperCase())} · TOP 5</text>`;
  svg+=`<g transform="translate(${W-44} 312)"><circle r="18" style="fill:var(--paper);stroke:var(--line)"/><path d="M0 -13 L5 0 L0 13 L-5 0Z" style="fill:var(--red)"/><text y="-21" text-anchor="middle" font-size="10" font-weight="700" style="fill:var(--ink)">N</text></g>`;
  if(data){const planned=new Set((t.itinerary||[]).map(x=>x.attractionId));const P=proj(data.items,40,318,W-80,H-350);
    // Pins first, then labels nudged down until they don't overlap each other.
    const pts=data.items.map(a=>P(a)),boxes=[];let pins="",labels="";
    data.items.forEach((a,i)=>{const p=pts[i],on=planned.has(a.id),name=a.name.length>26?a.name.slice(0,25)+"…":a.name,wd=name.length*7+8,right=p.x<=W-180;
      let lx=right?p.x+14:p.x-14-wd,ly=p.y+4;const hit=()=>boxes.some(b=>lx<b.x+b.w&&lx+wd>b.x&&ly-12<b.y+4&&ly+4>b.y-12);let guard=0;while(hit()&&guard++<12)ly+=17;
      boxes.push({x:lx,y:ly,w:wd});
      pins+=`<path d="M${p.x} ${p.y} l-11 -18 a13 13 0 1 1 22 0Z" style="fill:${on?"var(--red)":"var(--sky)"};stroke:var(--paper)" stroke-width="2"/><text x="${p.x}" y="${p.y-23}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${i+1}</text>`;
      labels+=`<text x="${lx}" y="${ly}" font-size="12.5" font-weight="700" style="fill:var(--ink);paint-order:stroke;stroke:var(--pine-soft);stroke-width:4px"><tspan style="fill:var(--muted)">${i+1}. </tspan>${esc(name)}</text>`});
    svg+=pins+labels}
  svg+=`<text x="${W-14}" y="${H-12}" text-anchor="end" font-size="11" style="fill:var(--muted)">Illustrated map, positions to scale. Red = planned.</text></svg>`;
  host.innerHTML=svg;
}
function renderItinerary(){const box=$("itinerary"),t=S.trip;box.innerHTML="";const items=[...(t.itinerary||[])].sort((a,b)=>a.date.localeCompare(b.date));
  if(!items.length){box.append(el("p",{class:"sub",text:"Nothing planned yet. Add attractions to a day and they appear here, priced for your whole party."}));return}
  const n=people(t),byDay={};for(const x of items)(byDay[x.date]=byDay[x.date]||[]).push(x);
  for(const[d,list]of Object.entries(byDay)){const dd=el("div",{class:"dd"},el("b",{text:String(diffDays(t.start,d)+1)}),"DAY");const rows=el("div");
    rows.append(el("div",{class:"sub",style:"font-size:13px",text:niceDate(d)+(cityOn(t,d)?" · in "+cityOn(t,d):"")}));
    for(const x of list){const rate=rateFor(t,x.currency),price=x.cost==null||rate==null?"price ?":x.cost===0?"free":money(x.cost*rate*n,t.currency);
      const rm=el("button",{class:"x",type:"button","aria-label":"Remove "+x.name,text:"×"});rm.onclick=async()=>{await store.saveTrip({...S.trip,itinerary:S.trip.itinerary.filter(y=>y.id!==x.id)});render()};
      const here=cityOn(t,x.date);rows.append(el("div",{class:"trow"},el("span",{},`${x.name} `,el("span",{class:"sub",style:"font-size:13px",text:"· "+x.city}),here&&here!==x.city?el("span",{class:"city-warn",text:` you're in ${here} that day`}):null),el("span",{},el("span",{class:"money",text:price}),rm)))}
    box.append(el("div",{class:"tday"},dd,rows))}
  box.append(el("p",{class:"sub",style:"margin-top:8px",text:`Costs use the adult price for all ${n} travelers.`}))}

/* dashboard */
function renderDash(){const box=$("dash");box.innerHTML="";const t=S.trip;
  if(!t){const p=el("div",{class:"panel empty"},icon("chart",40),el("h2",{text:"Your dashboard appears here"}),el("p",{class:"sub",text:"Save a trip and log a few expenses with Anna, or load the sample Switzerland trip."}));
    const b=el("button",{class:"btn primary",type:"button",text:"Load sample family trip"});b.onclick=()=>loadSample();const g=el("button",{class:"btn",type:"button",text:"Load sample group trip"});g.onclick=()=>loadGroupSample();p.append(el("div",{class:"btns"},b,g));box.append(p);return}
  const c=calc(t,S.expenses),cur=t.currency,wrap=el("div",{class:"stack"});
  const sc=/on track|under/.test(c.status)?"ok":/slightly/.test(c.status)?"warn":c.status==="upcoming"?"info":"bad";
  const kpi=(ic,label,val,sub,extra)=>el("div",{class:"kpi"},el("span",{class:"k-top"},icon(ic,17),label),el("b",{text:val}),sub?el("em",{text:sub}):null,extra||null);
  wrap.append(el("div",{class:"kpis"},kpi("wallet",t.flights?.included&&flightsTotal(t)?"Trip budget (after flights)":"Budget",money(c.B,cur),`${c.days} days · ${money(c.daily,cur)} a day${flightsTotal(t)?` · flights ${money(flightsTotal(t),cur)}${t.flights.included?" paid":" extra"}`:""}`),kpi("ticket","Spent",money(c.spent,cur),c.elapsed?`Day ${c.elapsed} of ${c.days}`:`Trip starts ${niceDate(t.start)}`),
    kpi("bag","Remaining",money(c.remaining,cur),c.leftPerDay!=null?`${money(c.leftPerDay,cur)} per remaining day`:" "),kpi("trend","Pace",c.elapsed?`${Math.round(c.spent/Math.max(c.expected,1)*100)}%`:"Not yet",c.elapsed?`of expected by today (${money(c.expected,cur)})`:"Starts with the trip",el("span",{class:"pill "+sc,text:c.status}))));
  const f=el("div",{class:"panel"}),fl=el("p",{class:"forecast"});
  if(c.forecast!=null){const diff=c.forecast-c.B;fl.append(c.today>t.end?"The trip cost ":"At this pace the trip costs ",el("b",{text:money(c.forecast,cur)}),", which is ",el("b",{text:money(Math.abs(diff),cur)}),diff<=0?" under budget.":" over budget.")}else fl.textContent="Your forecast appears once the trip begins.";
  const sb=el("button",{class:"btn primary",type:"button"},icon("chat",18),"Ask Anna how we're doing");sb.onclick=()=>{switchTab("anna");askAnna("How are we doing? Give me a summary of today.")};f.append(fl,el("div",{class:"btns"},sb));wrap.append(f);const owe=renderOwe(t);if(owe)wrap.append(owe);
  const dp=el("div",{class:"panel"},el("h3",{text:"Spending per day"}),el("p",{class:"sub",text:"Bars are what you spent; the dashed line is your daily budget. Red went over, striped are splurge days."}),dayChart(c,cur));
  const cats=el("div",{class:"cats"});for(const[k,name,,ic]of CATS){const pct=c.plan[k]>0?Math.min(c.perCat[k]/c.plan[k],1)*100:0,bar=el("i",{style:`width:${pct}%`});if(c.perCat[k]>c.plan[k])bar.classList.add("over");
    cats.append(el("div",{class:"cat"},icon(ic,17),el("span",{text:name}),el("div",{class:"track"},bar),el("span",{class:"nums",text:`${money(c.perCat[k],cur)} of ${money(c.plan[k],cur)}`})))}
  wrap.append(el("div",{class:"grid2"},dp,el("div",{class:"panel"},el("h3",{text:"By category vs your prescription"}),cats)));
  const ep=el("div",{class:"panel"},el("h3",{text:"Expenses"}),datasetBar(t),manualForm(t));const byDay={};for(const e of S.expenses)(byDay[e.date]=byDay[e.date]||[]).push(e);
  const dates=Object.keys(byDay).sort().reverse();if(!dates.length)ep.append(el("p",{class:"sub",text:"No expenses yet. Tell Anna what you spent, or add one above."}));
  for(const d of dates){const sp=(t.splurgeDays||[]).includes(d),tot=byDay[d].reduce((s,e)=>s+e.base,0);
    const sec=el("div",{class:"day"},el("div",{class:"day-head"},el("b",{text:(d>=t.start&&d<=t.end?`Day ${diffDays(t.start,d)+1} · `:"")+niceDate(d)}),el("span",{class:"pill "+(tot>c.daily?(sp?"warn":"bad"):"ok"),text:money(tot,cur)+(sp?" · splurge day":"")})));
    for(const e of byDay[d].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0))){const m=el("div",{class:"money"},money2(e.amount,e.currency));if(e.currency!==cur)m.append(el("small",{text:money2(e.base,cur)}));
      const x=el("button",{class:"x",type:"button","aria-label":"Delete "+e.item,text:"×"});x.onclick=()=>store.deleteExpense(e.id);
      const meta=el("span",{class:"tag",text:CATNAME[e.category]+(e.source==="sample"?" · sample":e.source==="anna"?" · via Anna":e.source==="dataset"?" · from CSV":"")});
      if(isGroup(t)){const names=groupNames(t),cur2=matchName(e.paidBy,names),sel=el("select",{class:"payer","aria-label":"Who paid for "+e.item});
        sel.append(el("option",{value:"",text:"Who paid?"}));for(const n of names){const o=el("option",{value:n,text:"Paid by "+n});if(n===cur2)o.selected=true;sel.append(o)}
        sel.onchange=()=>store.updateExpense(e.id,{paidBy:sel.value||null});meta.append(" · ",splitLabel(e,t)," ");meta.append(sel)}
      sec.append(el("div",{class:"exp"},icon(CATICON[e.category]||"bag",17),el("div",{},el("div",{text:e.item}),meta),m,x))}
    ep.append(sec)}
  wrap.append(ep);box.append(wrap)}
function dayChart(c,cur){const W=640,H=250,pl=52,pr=10,pt=16,pb=36,n=c.perDay.length,maxV=Math.max(c.daily*1.6,...c.perDay.map(d=>d.spent))||1,y=v=>pt+(H-pt-pb)*(1-v/maxV),bw=(W-pl-pr)/n;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending per day compared with the daily budget"><defs><pattern id="stripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" style="fill:var(--sun)"/><rect width="3" height="6" style="fill:var(--sun-soft)"/></pattern></defs>`;
  for(let i=0;i<=3;i++){const v=maxV*i/3;s+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(--line)"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${money(v,cur)}</text>`}
  c.perDay.forEach((d,i)=>{const x=pl+i*bw+bw*.18,w=bw*.64,fill=d.splurge?"url(#stripe)":d.spent>c.daily?"var(--red)":d.date===c.today?"var(--ink)":"var(--sky)";
    if(d.spent>0)s+=`<rect x="${x}" y="${y(d.spent)}" width="${w}" height="${Math.max(y(0)-y(d.spent),1)}" rx="5" style="fill:${fill}"/>`;
    s+=`<text x="${x+w/2}" y="${H-pb+16}" text-anchor="middle" font-size="12" style="fill:var(--muted)">D${d.n}</text>`;if(d.date===c.today)s+=`<text x="${x+w/2}" y="${H-pb+31}" text-anchor="middle" font-size="10" font-weight="700" style="fill:var(--ink)">today</text>`});
  s+=`<line x1="${pl}" x2="${W-pr}" y1="${y(c.daily)}" y2="${y(c.daily)}" style="stroke:var(--ink)" stroke-width="1.5" stroke-dasharray="6 5"/><text x="${W-pr}" y="${y(c.daily)-6}" text-anchor="end" font-size="11" font-weight="700" style="fill:var(--ink)">daily budget ${money(c.daily,cur)}</text></svg>`;
  return el("div",{class:"chart",html:s})}
function manualForm(t){const f=el("form",{class:"form"}),fld=(id,l,i)=>el("div",{class:"field"},el("label",{for:id,text:l}),i);
  const item=el("input",{id:"m-item",placeholder:"Fondue dinner"}),amt=el("input",{id:"m-amt",type:"number",step:"0.01",min:"0",placeholder:"85"}),cur=el("select",{id:"m-cur"}),cat=el("select",{id:"m-cat"}),date=el("input",{id:"m-date",type:"date",value:defaultDate()});
  for(const c of [t.localCurrency,t.currency,...Object.keys(t.rates||{})].filter((v,i,a)=>a.indexOf(v)===i))cur.append(el("option",{text:c}));for(const[k,n]of CATS)cat.append(el("option",{value:k,text:n}));
  const by=el("select",{id:"m-by"});for(const n of groupNames(t))by.append(el("option",{text:n}));if(S.sender)by.value=S.sender;
  f.append(fld("m-item","Add an expense yourself",item),fld("m-amt","Amount",amt),fld("m-cur","Currency",cur),fld("m-cat","Category",cat),fld("m-date","Date",date),isGroup(t)?fld("m-by","Paid by",by):null,el("div",{class:"field",style:"justify-content:flex-end"},el("button",{class:"btn",type:"submit",text:"Add"})));
  f.onsubmit=async ev=>{ev.preventDefault();const a=Number(amt.value);if(!item.value.trim()||!(a>0))return;const rate=rateFor(t,cur.value)||1;
    await store.addExpense({item:item.value.trim(),category:cat.value,amount:r2(a),currency:cur.value,rate,base:r2(a*rate),date:date.value||defaultDate(),source:"manual",createdAt:Date.now(),...(isGroup(t)?{paidBy:by.value,splitAmong:null}:{})});item.value="";amt.value=""};return f}

/* chat */
function linkify(parent,text){const re=/(https?:\/\/[^\s)]+)/g;let last=0,m;while((m=re.exec(text))){parent.append(text.slice(last,m.index));parent.append(el("a",{href:m[1],target:"_blank",rel:"noopener",text:m[1].includes("booking.com")?"Search stays with live prices":m[1]}));last=m.index+m[1].length}parent.append(text.slice(last))}
function renderChat(){const box=$("chat");box.innerHTML="";
  if(!S.chat.length)box.append(el("div",{class:"msg anna",text:S.trip?`Hi, I'm Anna, your Travel Doctor agent. Your ${S.trip.name} budget is ${money(S.trip.budget,S.trip.currency)} for ${people(S.trip)} ${people(S.trip)===1?"person":"people"}. Tell me what you spend and I'll keep the math.`:"Hi, I'm Anna. Plan a trip and I'll help you stay on budget."}));
  for(const c of S.chat){const m=el("div",{class:"msg "+c.role});if(c.from)m.append(el("small",{class:"from",text:c.from}));linkify(m,c.text);box.append(m)}box.scrollTop=box.scrollHeight}
function renderSender(){const row=$("sender-row"),t=S.trip,names=groupNames(t);row.hidden=!names.length;if(!names.length){S.sender=null;return}
  if(!names.includes(S.sender))S.sender=names[0];const sel=$("sender");sel.innerHTML="";for(const n of names)sel.append(el("option",{text:n}));sel.value=S.sender}
$("sender").onchange=()=>{S.sender=$("sender").value;renderDash()};
function renderLog(){const box=$("log");box.innerHTML="";if(!S.log.length){box.append(el("p",{class:"sub",text:"No tool calls yet. Send Anna an expense to see one."}));return}
  for(const l of S.log.slice(0,20))box.append(el("div",{},el("b",{text:`${l.at} · ${l.name}`}),el("pre",{text:"Anna asked: "+JSON.stringify(l.input,null,1)}),el("pre",{text:"Code answered: "+JSON.stringify(l.output,null,1).slice(0,900)})))}
const CHIPS_GROUP=["Dinner was 120 euros","Ben and I had coffee for 14 euros","Carlos paid 60 euros for the ferry tickets","Who owes who?","How are we doing?"];
const CHIPS=["Dinner was 85 francs and the cable car 64","Can we afford paragliding for 180 CHF each?","Where should we stay in Zermatt for 2 nights from tomorrow?","Forget the budget today, we want to experience everything","How are we doing?"];
function renderChips(){const b=$("chips");b.innerHTML="";const g=isGroup(S.trip);for(const c of g?CHIPS_GROUP:CHIPS){const x=el("button",{class:"chip",type:"button",text:c});x.onclick=()=>askAnna(c);b.append(x)}}

/* form fill/read */
function fillForm(t){$("f-name").value=t?.name||"";$("f-cities").value=(t?.cities||[]).join(", ");$("f-start").value=t?.start||"";$("f-end").value=t?.end||"";fillHomeSelect(t?.home||"");route=t?.route?JSON.parse(JSON.stringify(t.route)):{nights:[],arrival:"afternoon",departure:"afternoon"};
  $("f-budget").value=t?.budget||"";$("f-cur").value=t?.currency||"USD";$("f-local").value=t?.localCurrency||"CHF";$("f-rate").value=t?.rates?.[t?.localCurrency]??1.13;
  $("f-optin").checked=!!t?.optIn;$("f-group").checked=!!t?.whatsappGroup;party=t?.party?JSON.parse(JSON.stringify(t.party)):{type:"family",adults:2,children:1,members:[]};
  split=t?.split?{...t.split}:Object.fromEntries(CATS.map(c=>[c[0],c[2]]));fillFlights(t?.flights);rateLabel();renderParty();renderSplit();renderRoute()}

/* "Plan your trip with us" prompt under the destination field */
function renderCta(){const box=$("picks-cta");const typed=$("f-cities").value.split(",").map(x=>x.trim()).filter(Boolean),cities=S.trip?.cities?.length?S.trip.cities:typed;
  if(!cities.length){box.hidden=true;return}box.hidden=false;box.innerHTML="";
  const b=el("button",{class:"btn dark small",type:"button"},"See top picks",icon("compass",16));b.onclick=()=>{if(!S.trip){$("form-err").textContent="Save your trip first, then explore top picks for your cities.";$("form-err").hidden=false;return}switchTab("picks")};
  box.append(el("div",{class:"cta-l"},icon("star",22),el("div",{},el("b",{text:"Plan your trip with us"}),el("span",{class:"sub",text:`Transport passes, 4.5 star stays, food and experiences for ${cities.slice(0,3).join(", ")}${cities.length>3?" and more":""}, with official links.`}))),b)}
$("f-cities").addEventListener("input",renderCta);
/* ---------- tabs + main render ---------- */
let tab="trip";try{tab=localStorage.getItem("td-tab")||"trip"}catch(e){}
function switchTab(t){tab=t;try{localStorage.setItem("td-tab",t)}catch(e){}render();window.scrollTo({top:0})}
for(const t of ["trip","picks","anna","dash"]){const b=$("tab-"+t);b.prepend(icon(b.dataset.ico,18));b.onclick=()=>switchTab(t)}
$("anna-av").innerHTML=annaAvatar(56);
function render(){for(const t of ["trip","picks","anna","dash"]){$("tab-"+t).setAttribute("aria-selected",String(tab===t));$("view-"+t).hidden=tab!==t}
  const bn=$("banner");if(S.mode==="memory"){bn.hidden=false;bn.textContent="Saving isn't available in this view, so your trip lasts only until you close the page."}
  else if(S.trip?.sample){bn.hidden=false;bn.textContent=`This is a sample ${isGroup(S.trip)?"group":"family"} trip with example expenses and fictional phone numbers. Edit it, or delete it and plan your own.`}else bn.hidden=true;
  $("trip-title").textContent=S.trip?"Your trip":"Plan your trip";$("save-trip").textContent=S.trip?"Update trip":"Save trip";$("reset-trip").hidden=!S.trip;
  renderSender();renderChips();renderHero();renderCta();renderGroup();renderPlan();if(tab==="picks")renderPicks();renderDash();renderChat()}

/* ---------- events ---------- */
["f-name","f-start","f-end","f-budget"].forEach(id=>$(id).addEventListener("input",updateSplit));
["f-start","f-end","f-cities"].forEach(id=>$(id).addEventListener("input",renderRoute));["f-start","f-end"].forEach(id=>$(id).addEventListener("change",renderRoute));
function showSub(which){for(const w of ["budget","flights"]){$("st-"+w).setAttribute("aria-selected",String(w===which));$("pane-"+w).hidden=w!==which}if(which==="flights"){prefillFlights();renderFlightSum()}}
$("st-budget").prepend(icon("wallet",18));$("st-flights").prepend(icon("plane",18));
$("st-budget").onclick=()=>showSub("budget");$("st-flights").onclick=()=>showSub("flights");
document.querySelectorAll('#pane-flights input,#pane-flights select').forEach(x=>x.addEventListener("input",()=>{updateSplit()}));
document.querySelectorAll('input[name="finc"]').forEach(x=>x.addEventListener("change",()=>{updateSplit()}));
$("f-out-arr").addEventListener("change",()=>{const b=timeBucket($("f-out-arr").value);if(b){route.arrival=b;renderRoute()}});
$("f-ret-dep").addEventListener("change",()=>{const b=timeBucket($("f-ret-dep").value);if(b){route.departure=b;renderRoute()}});
$("f-home").addEventListener("change",()=>{const o=$("f-home-other");o.hidden=$("f-home").value!=="__other";if(!o.hidden)o.focus()});
$("f-cur").onchange=()=>{rateLabel();renderSplit()};$("f-local").onchange=rateLabel;
$("trip-form").onsubmit=async ev=>{ev.preventDefault();const err=$("form-err");err.hidden=true;
  const {party:p,problems}=normalizeParty(readParty());const tot=CATS.reduce((s,c)=>s+split[c[0]],0);
  const t={name:$("f-name").value.trim(),cities:$("f-cities").value.split(",").map(s=>s.trim()).filter(Boolean),start:$("f-start").value,end:$("f-end").value,home:readHome(),route:{...route,nights:[...route.nights]},
    party:p,travelers:p.adults+p.children,budget:Number($("f-budget").value),flights:readFlights(),currency:$("f-cur").value,localCurrency:$("f-local").value,rates:{...(S.trip?.rates||{})},split:{...split},
    optIn:$("f-optin").checked,splurgeDays:S.trip?.splurgeDays||[],itinerary:S.trip?.itinerary||[],sample:false,updatedAt:Date.now()};
  const r=Number($("f-rate").value);if(t.localCurrency!==t.currency&&r>0)t.rates[t.localCurrency]=r;
  if(!t.name)problems.push("a trip name");if(!t.start||!t.end)problems.push("both dates");else if(t.end<t.start)problems.push("a return date after departure");
  if(!(t.budget>0))problems.push("a budget above zero");if(t.flights.included&&t.budget>0&&flightsTotal(t)>=t.budget)problems.push("a budget bigger than the airfare it includes (see Flights)");if(t.start&&t.end&&t.end>=t.start&&t.cities.length&&!routeValid(t.route.nights,t.cities,diffDays(t.start,t.end)))t.route.nights=autoSplit(diffDays(t.start,t.end),t.cities);if(tot!==100)problems.push("a budget split that adds up to 100%");
  const wantGroup=$("f-group").checked;if(wantGroup&&!t.optIn)problems.push("everyone's agreement to WhatsApp messages before creating a group");
  if(wantGroup&&!p.members.some(m=>m.inGroup))problems.push("at least one WhatsApp number for the group");
  if(problems.length){err.textContent="Please add "+problems.join(", ")+".";err.hidden=false;return}
  t.whatsappGroup=wantGroup?(S.trip?.whatsappGroup||createGroup(t)):null;
  try{await store.saveTrip(t);render();document.getElementById("group-body").scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){err.textContent="Couldn't save the trip. Please try again.";err.hidden=false}};
$("reset-trip").onclick=()=>{$("confirm-row").hidden=false};$("cancel-del").onclick=()=>{$("confirm-row").hidden=true};
$("confirm-del").onclick=async()=>{$("confirm-row").hidden=true;await store.clearAll();S.chat=[];S.log=[];fillForm(null);renderLog();render()};
$("load-sample").onclick=()=>loadSample();$("load-sample-group").onclick=()=>loadGroupSample();
$("composer").onsubmit=ev=>{ev.preventDefault();askAnna($("msg").value)};
$("msg").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();askAnna($("msg").value)}});$("stop").onclick=()=>ctl?.abort();

async function loadSample(){const start=addDays(today(),-3);
  const t={name:"Swiss Alps week",cities:["Zurich","Lucerne","Interlaken","Zermatt"],start,end:addDays(start,6),home:"Dallas (DFW)",
    party:{type:"family",adults:2,children:1,members:[{name:"Priya",phone:"+12145550101",role:"parent",inGroup:true},{name:"Raj",phone:"+12145550102",role:"parent",inGroup:true},{name:"Maya",phone:"",role:"child",inGroup:false}]},
    travelers:3,budget:6000,currency:"USD",localCurrency:"CHF",rates:{CHF:1.13},split:{stays:40,transport:20,food:20,experiences:15,other:5},optIn:true,splurgeDays:[],sample:true,updatedAt:Date.now(),
    itinerary:[{id:"i1",attractionId:"lucerne-1",name:"Mount Pilatus Golden Round Trip",city:"Lucerne",date:addDays(start,2),cost:120,currency:"CHF",hours:6,lat:46.979,lng:8.255},
      {id:"i2",attractionId:"interlaken-1",name:"Harder Kulm",city:"Interlaken",date:addDays(start,4),cost:40,currency:"CHF",hours:2,lat:46.697,lng:7.8516},
      {id:"i3",attractionId:"zermatt-0",name:"Gornergrat railway",city:"Zermatt",date:addDays(start,5),cost:120,currency:"CHF",hours:4,lat:45.9833,lng:7.7845}]};
  t.route={nights:["Zurich","Zurich","Lucerne","Lucerne","Interlaken","Zermatt"],arrival:"morning",departure:"afternoon"};
  t.flights={included:false,price:1150,mode:"per_person",currency:"USD",out:{from:"Dallas (DFW)",to:"Zurich (ZRH)",airline:"SWISS",date:addDays(start,-1),dep:"16:40",arr:"09:05",next:true},ret:{from:"Zurich (ZRH)",to:"Dallas (DFW)",airline:"SWISS",date:addDays(start,6),dep:"13:15",arr:"17:30",next:false}};
  t.whatsappGroup=simulateJoins(createGroup(t));
  for(const e of [...S.expenses])await store.deleteExpense(e.id);await store.saveTrip(t);
  const ex=[[0,"Hotel in Zurich, 2 nights","stays",380],[0,"Airport train to Zurich HB","transport",42],[0,"Dinner at Zeughauskeller","food",128],[1,"Raj: Lake Zurich snacks","food",24],[1,"Kunsthaus museum","experiences",48],[1,"Train Zurich to Lucerne","transport",84],
    [2,"Hotel in Lucerne, 2 nights","stays",460],[2,"Priya: Mount Pilatus Golden Round Trip","experiences",300],[2,"Lunch in the old town","food",72],[2,"Fondue dinner","food",140],[3,"Lake Lucerne cruise","experiences",96],[3,"Coffee and hot chocolate","food",26]];
  let i=0;for(const[d,item,cat,amt]of ex)await store.addExpense({item,category:cat,amount:amt,currency:"CHF",rate:1.13,base:r2(amt*1.13),date:addDays(start,d),source:"sample",createdAt:Date.now()+i++});
  fillForm(t);S.chat=[];S.city="Zurich";render();window.scrollTo({top:0,behavior:"smooth"})}

async function loadGroupSample(){const start=addDays(today(),-2);
  const names=[["Anika","+12125550111","New York (JFK)"],["Ben","+491515550112","Berlin"],["Carlos","+13105550113","Los Angeles (LAX)"],["Divya","+12125550114","New York (JFK)"]];
  const t={name:"Athens with friends",cities:["Athens"],start,end:addDays(start,4),home:"New York (JFK)",
    party:{type:"group",adults:4,children:0,members:names.map(([name,phone,home],i)=>({name,phone,home,role:i?"member":"organizer",inGroup:true}))},
    travelers:4,budget:4800,currency:"USD",localCurrency:"EUR",rates:{EUR:1.08},split:{stays:40,transport:15,food:25,experiences:15,other:5},optIn:true,splurgeDays:[],sample:true,updatedAt:Date.now(),
    itinerary:[{id:"g1",attractionId:"athens-0",name:"Acropolis and the Parthenon",city:"Athens",date:addDays(start,1),cost:30,currency:"EUR",hours:2.5,lat:37.9715,lng:23.7257},
      {id:"g2",attractionId:"athens-1",name:"Acropolis Museum",city:"Athens",date:addDays(start,1),cost:20,currency:"EUR",hours:2.5,lat:37.9685,lng:23.7285}]};
  t.route={nights:["Athens","Athens","Athens","Athens"],arrival:"morning",departure:"afternoon"};
  t.flights={included:false,price:980,mode:"per_person",currency:"USD",out:{from:"New York (JFK)",to:"Athens (ATH)",airline:"Delta",date:addDays(start,-1),dep:"17:55",arr:"10:30",next:true},ret:{from:"Athens (ATH)",to:"New York (JFK)",airline:"Delta",date:addDays(start,4),dep:"12:20",arr:"16:05",next:false}};
  t.whatsappGroup=simulateJoins(createGroup(t));
  for(const e of [...S.expenses])await store.deleteExpense(e.id);await store.saveTrip(t);
  const ex=[[0,"Apartment in Plaka, 4 nights","stays",720,"Anika",null],[0,"Taxi from the airport","transport",55,"Ben",null],[0,"Dinner at a taverna","food",136,"Carlos",null],
    [1,"Acropolis tickets","experiences",120,"Divya",null],[1,"Souvlaki lunch","food",48,"Ben",null],[1,"Museum gift shop","other",36,"Divya",["Divya"]],
    [2,"Day cruise to the islands","experiences",340,"Anika",null],[2,"Rooftop drinks","food",64,"Carlos",["Carlos","Ben"]],[2,"Metro passes","transport",36,"Ben",null]];
  let i=0;for(const[d,item,cat,amt,by,among]of ex)await store.addExpense({item,category:cat,amount:amt,currency:"EUR",rate:1.08,base:r2(amt*1.08),date:addDays(start,d),source:"sample",createdAt:Date.now()+i++,paidBy:by,splitAmong:among});
  S.sender="Anika";fillForm(t);S.chat=[];S.city="Athens";render();window.scrollTo({top:0,behavior:"smooth"})}

/* ---------- boot ---------- */
fillForm(null);renderChips();renderLog();render();
(async()=>{const [db,user]=await Promise.all([CL.use("db"),CL.use("user")]);const uid=user?await user.id():null;
  if(!db||!uid){S.mode="memory";render();return}S.mode="db";S.uid=uid;
  tripRef=db.doc(`data/users/${uid}/trip`);expCol=tripRef.collection("expenses");cacheRef=db.doc(`data/users/${uid}/attractions`);
  cacheRef.get().then(s=>{if(s.exists)S.cache={...s.data()};}).catch(()=>{});
  let first=true;
  tripRef.onSnapshot(s=>{S.trip=s.exists?s.data():null;if(first){fillForm(S.trip);first=false}render()},()=>{S.mode="memory";render()});
  expCol.onSnapshot(q=>{S.expenses=q.docs.map(d=>({id:d.id,...d.data()}));render()},()=>{});
})();
