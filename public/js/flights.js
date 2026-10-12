/* ================= FLIGHTS ================= */
// trip.flights = {included, price, mode: per_person|total, currency, out:{from,to,airline,no,date,dep,arr,next}, ret:{...}}
// If included, the airfare comes out of the budget first; the rest is the "trip budget" Anna tracks day by day.
function flightsTotal(t){const f=t?.flights;if(!f||!(f.price>0))return 0;const rate=rateFor(t,f.currency||t.currency);if(rate==null)return 0;
  return r2(f.price*rate*(f.mode==="total"?1:people(t)))}
/** The money left for the trip itself (stays, food, transport, experiences). */
function spendBudget(t){return t.flights?.included?Math.max(0,r2(t.budget-flightsTotal(t))):t.budget}
const DEST_AIRPORTS={switzerland:"Zurich (ZRH)",greece:"Athens (ATH)"};
const timeBucket=hhmm=>{if(!hhmm)return null;const h=Number(hhmm.split(":")[0]);return h<12?"morning":h<17?"afternoon":h<21?"evening":"night"};

let fl={included:false,price:null,mode:"per_person",currency:"USD",out:{},ret:{}};
const FL_FIELDS=["from","to","airline","no","date","dep","arr"];
function fillFlights(f){fl=f?JSON.parse(JSON.stringify(f)):{included:false,price:null,mode:"per_person",currency:$("f-cur").value||"USD",out:{},ret:{}};
  $("finc-yes").checked=!!fl.included;$("finc-no").checked=!fl.included;
  for(const k of ["out","ret"]){for(const x of FL_FIELDS)$(`f-${k}-${x}`).value=fl[k]?.[x]||"";$(`f-${k}-next`).checked=!!fl[k]?.next}
  $("f-fl-price").value=fl.price??"";$("f-fl-mode").value=fl.mode||"per_person";$("f-fl-cur").value=fl.currency||"USD";
  const dl=$("airport-list");if(!dl.childNodes.length){for(const[,list]of AIRPORTS)for(const a of list)dl.append(el("option",{value:a}));for(const a of ["Geneva (GVA)","Basel (BSL)","Athens (ATH)","Milan (MXP)","Rome (FCO)"])dl.append(el("option",{value:a}))}
  renderFlightSum()}
function readFlights(){const f={included:$("finc-yes").checked,price:$("f-fl-price").value===""?null:Number($("f-fl-price").value),mode:$("f-fl-mode").value,currency:$("f-fl-cur").value,out:{},ret:{}};
  for(const k of ["out","ret"]){for(const x of FL_FIELDS){const v=$(`f-${k}-${x}`).value.trim();if(v)f[k][x]=v}f[k].next=$(`f-${k}-next`).checked}return f}
/** Prefill sensible defaults from the rest of the form (only empty fields). */
function prefillFlights(){const home=readHome(),cities=tripCities(),country=COUNTRY_OF[cityKey(cities[0])],dest=DEST_AIRPORTS[country]||(cities[0]||"");
  const set=(id,v)=>{if(v&&!$(id).value)$(id).value=v};
  set("f-out-from",home);set("f-out-to",dest);set("f-ret-from",DEST_AIRPORTS[COUNTRY_OF[cityKey(cities[cities.length-1])]]||cities[cities.length-1]||"");set("f-ret-to",home);
  set("f-out-date",$("f-start").value);set("f-ret-date",$("f-end").value)}
/** A trip-like object built from the form, for live previews before saving. */
function formTrip(){const p=party;return {budget:Number($("f-budget").value)||0,currency:$("f-cur").value,rates:{...(S.trip?.rates||{}),[$("f-local").value]:Number($("f-rate").value)||undefined},
  party:{...p,adults:p.adults,children:p.children},travelers:p.adults+p.children,flights:readFlights()}}
function formSpendBudget(){const t=formTrip();return spendBudget(t)}
function renderFlightSum(){const box=$("fl-sum");if(!box)return;box.innerHTML="";const t=formTrip(),cur=t.currency,f=t.flights,tot=flightsTotal(t);
  const cell=(l,v)=>el("div",{},el("small",{text:l}),el("b",{text:v}));
  if(!(f.price>0)){box.append(el("div",{},el("small",{text:"Airfare"}),el("b",{text:"Not added yet"})));}
  else{box.append(cell(f.mode==="total"?"Airfare for everyone":`Airfare for ${people(t)}`,money(tot,cur)));
    if(f.included){box.append(cell("Total budget",money(t.budget,cur)),cell("Left for the trip",money(spendBudget(t),cur)))}
    else box.append(cell("Trip budget",money(t.budget,cur)),cell("All in with flights",money(t.budget+tot,cur)))}
  const o=readFlights().out,code=s=>(String(s||"").match(/\(([A-Z]{3})\)/)||[])[1]||s;
  if(o.from&&o.to){const q=`Flights from ${code(o.from)} to ${code(o.to)} on ${$("f-out-date").value||$("f-start").value} through ${$("f-ret-date").value||$("f-end").value}`;
    box.append(el("div",{},el("small",{text:"Compare fares"}),el("a",{href:`https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`,target:"_blank",rel:"noopener",text:"Search Google Flights ↗"})))}
  if(f.included&&tot>=t.budget&&t.budget>0)box.append(el("div",{},el("small",{text:"Heads up"}),el("b",{style:"color:var(--sun)",text:"Flights use the whole budget"})));
}
function flightLine(seg){if(!seg?.dep&&!seg?.airline)return "";return `${seg.airline||""}${seg.no?" "+seg.no:""}${seg.dep?" · "+seg.dep:""}${seg.arr?" → "+seg.arr+(seg.next?" (+1)":""):""}`.trim()}
