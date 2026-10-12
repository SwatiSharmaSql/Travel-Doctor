/* ================= ROUTE: where you sleep each night ================= */
// A trip of N days has N-1 nights. route.nights[i] = the city you sleep in on night i (day i+1).
// The last day is travel home. Everything else (day planner, stay searches, Anna) reads this.
const AIRPORTS=[
 ["United States",["Dallas (DFW)","Dallas Love Field (DAL)","Houston (IAH)","Austin (AUS)","New York (JFK)","Newark (EWR)","Chicago (ORD)","Los Angeles (LAX)","San Francisco (SFO)","Seattle (SEA)","Atlanta (ATL)","Boston (BOS)","Miami (MIA)","Washington Dulles (IAD)","Denver (DEN)","Phoenix (PHX)"]],
 ["Canada",["Toronto (YYZ)","Vancouver (YVR)"]],
 ["India",["Delhi (DEL)","Mumbai (BOM)","Chennai (MAA)","Bengaluru (BLR)","Hyderabad (HYD)"]],
 ["Europe and Middle East",["London Heathrow (LHR)","Frankfurt (FRA)","Paris (CDG)","Zurich (ZRH)","Dubai (DXB)"]],
 ["Asia Pacific",["Singapore (SIN)","Tokyo (HND)","Sydney (SYD)"]],
];
const TIMES=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"],["night","Late night"]];
let route={nights:[],arrival:"afternoon",departure:"afternoon"};

function fillHomeSelect(value){const sel=$("f-home");sel.innerHTML="";sel.append(el("option",{value:"",text:"Choose your home airport"}));
  let found=false;for(const[g,list]of AIRPORTS){const og=el("optgroup",{label:g});for(const a of list){og.append(el("option",{value:a,text:a}));if(a===value)found=true}sel.append(og)}
  sel.append(el("option",{value:"__other",text:"Other, I'll type it"}));
  const other=$("f-home-other");if(value&&!found){sel.value="__other";other.hidden=false;other.value=value}else{sel.value=value||"";other.hidden=true;other.value=""}}
function readHome(){const v=$("f-home").value;return v==="__other"?$("f-home-other").value.trim():v}

function tripCities(){return $("f-cities").value.split(",").map(s=>s.trim()).filter(Boolean)}
function autoSplit(nights,cities){if(!cities.length||nights<1)return [];const out=[],base=Math.floor(nights/cities.length);let extra=nights%cities.length;
  cities.forEach(c=>{let n=base+(extra>0?1:0);if(extra>0)extra--;for(let i=0;i<n;i++)out.push(c)});
  while(out.length<nights)out.push(cities[cities.length-1]);return out.slice(0,nights)}
function routeValid(nights,cities,count){return nights.length===count&&nights.every(c=>cities.includes(c))}
/** City you're in on a date: the night's city, or the last night's city on the fly home day. */
function cityOn(t,date){const n=t?.route?.nights||[];if(!n.length)return null;const i=diffDays(t.start,date);if(i<0)return null;return n[Math.min(i,n.length-1)]||null}
/** First check in and check out date for each city, from the route. */
function stayDates(t,city){const n=t?.route?.nights||[];const idx=n.map((c,i)=>c===city?i:-1).filter(i=>i>=0);if(!idx.length)return null;
  return {checkin:addDays(t.start,idx[0]),checkout:addDays(t.start,idx[idx.length-1]+1),nights:idx.length}}
function routeSummary(nights){const out=[];for(const c of nights){const last=out[out.length-1];if(last&&last.city===c)last.n++;else out.push({city:c,n:1})}return out}

function renderRoute(){
  const box=$("route");box.innerHTML="";const s=$("f-start").value,e=$("f-end").value,cities=tripCities();
  if(!(s&&e&&e>=s)||!cities.length){box.append(el("p",{class:"sub",text:"Add your cities and dates, and you'll plan where you sleep each night here."}));return}
  const days=diffDays(s,e)+1,nightCount=days-1;
  if(!routeValid(route.nights,cities,nightCount))route.nights=autoSplit(nightCount,cities);
  const head=el("div",{class:"head"},el("h3",{},icon("bed",18)," Where you sleep each night"));
  const auto=el("button",{class:"btn small",type:"button",text:"Split evenly"});auto.onclick=()=>{route.nights=autoSplit(nightCount,cities);renderRoute()};head.append(auto);box.append(head);
  // arrival and departure times
  const timeSel=(id,label,val,set)=>{const sl=el("select",{id});for(const[v,l]of TIMES)sl.append(el("option",{value:v,text:l}));sl.value=val;sl.onchange=()=>{set(sl.value);renderRoute()};return el("div",{class:"field"},el("label",{for:id,text:label}),sl)};
  box.append(el("div",{class:"form"},timeSel("f-arrive",`You land in ${cities[0]} in the`,route.arrival,v=>route.arrival=v),timeSel("f-depart","Flight home on the last day",route.departure,v=>route.departure=v)));
  // summary strip
  const strip=el("div",{class:"route-strip"});
  routeSummary(route.nights).forEach((r,i)=>{if(i)strip.append(el("span",{class:"arrow",text:"→"}));strip.append(el("span",{class:"stop"},el("b",{text:r.city}),`${r.n} night${r.n>1?"s":""}`))});
  strip.append(el("span",{class:"arrow",text:"→"}),el("span",{class:"stop home"},icon("plane",14),"Home"));box.append(strip);
  if(nightCount===0){box.append(el("p",{class:"sub",text:"A same day trip: no nights to plan."}));return}
  // one row per day
  const list=el("div",{class:"nights"});
  for(let i=0;i<days;i++){const d=addDays(s,i),last=i===days-1;
    const note=i===0?arrivalNote(route.arrival,cities[0]):last?departNote(route.departure):(i>0&&route.nights[i]!==route.nights[i-1]?`Travel day: ${route.nights[i-1]} to ${route.nights[i]}`:"Full day");
    const row=el("div",{class:"night"+(last?" last":"")},el("span",{class:"dn"},el("b",{text:`Day ${i+1}`}),niceDate(d)));
    if(last)row.append(el("span",{class:"home-row"},icon("plane",16),"Fly home"));
    else{const sl=el("select",{"aria-label":`City for night ${i+1}`});for(const c of cities)sl.append(el("option",{value:c,text:c}));sl.value=route.nights[i];
      sl.onchange=()=>{route.nights[i]=sl.value;renderRoute()};row.append(el("span",{class:"sleep"},el("small",{text:"Sleep in"}),sl))}
    row.append(el("span",{class:"note"+(/Travel/.test(note)?" travel":"")},note));list.append(row)}
  box.append(list);
  const unused=cities.filter(c=>!route.nights.includes(c));if(unused.length)box.append(el("p",{class:"err",text:`No nights in ${unused.join(", ")} yet. Day trips are fine; you can still plan things there.`}));
}
function arrivalNote(t,city){return {morning:`Land in the morning: a full first day in ${city}`,afternoon:`Land in the afternoon: check in, an easy walk and dinner`,evening:`Land in the evening: check in and rest`,night:`Late arrival: straight to the hotel`}[t]}
function departNote(t){return {morning:"Morning flight: head to the airport early",afternoon:"Afternoon flight: a short morning, then the airport",evening:"Evening flight: most of the day is free",night:"Late flight: a full last day"}[t]}
