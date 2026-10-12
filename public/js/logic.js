/* ---------- state + storage ---------- */
const S={trip:null,expenses:[],chat:[],log:[],busy:false,mode:"starting",uid:null,attr:{},city:null,loading:null,cache:{}};
let tripRef=null,expCol=null,cacheRef=null;
const memory={trip:null,expenses:[]};
const store={
  async saveTrip(t){S.trip=t;if(tripRef)await tripRef.set(t);else{memory.trip=t;render()}},
  async addExpense(e){const id="e"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    if(expCol)await expCol.doc(id).set(e);else{memory.expenses.push({id,...e});S.expenses=[...memory.expenses];render()}return id},
  async updateExpense(id,patch){const cur=S.expenses.find(x=>x.id===id);if(!cur)return;const {id:_,...rest}=cur,next={...rest,...patch};
    if(expCol)await expCol.doc(id).set(next);else{memory.expenses=memory.expenses.map(x=>x.id===id?{id,...next}:x);S.expenses=[...memory.expenses];render()}},
  async deleteExpense(id){if(expCol)await expCol.doc(id).delete();else{memory.expenses=memory.expenses.filter(x=>x.id!==id);S.expenses=[...memory.expenses];render()}},
  async clearAll(){for(const e of [...S.expenses])await store.deleteExpense(e.id);S.trip=null;if(tripRef)await tripRef.delete();else{memory.trip=null;render()}},
  async saveCache(){if(cacheRef)await cacheRef.set(S.cache)}
};

/* ---------- math (always code, never the AI) ---------- */
function rateFor(trip,cur){cur=String(cur||"").toUpperCase();if(!trip)return null;if(cur===trip.currency)return 1;const r=trip.rates?.[cur];return r>0?r:null}
function people(trip){return trip?.party?(trip.party.adults+trip.party.children):(trip?.travelers||1)}
function defaultDate(){const t=S.trip,d=today();if(!t)return d;return d<t.start?t.start:d>t.end?t.end:d}
function calc(trip,exps){
  const B=spendBudget(trip),days=diffDays(trip.start,trip.end)+1,daily=B/days,t=today();
  const elapsed=t<trip.start?0:t>trip.end?days:diffDays(trip.start,t)+1;
  const spent=exps.reduce((s,e)=>s+(e.base||0),0),remaining=B-spent;
  const perDay=[];for(let i=0;i<days;i++){const d=addDays(trip.start,i);perDay.push({date:d,n:i+1,spent:exps.filter(e=>e.date===d).reduce((s,e)=>s+e.base,0),splurge:(trip.splurgeDays||[]).includes(d)})}
  const perCat={},plan={};for(const[c]of CATS){perCat[c]=0;plan[c]=B*(trip.split?.[c]??0)/100}for(const e of exps)perCat[e.category]=(perCat[e.category]||0)+e.base;
  const expected=daily*elapsed,daysLeft=days-elapsed;
  let status="upcoming";if(elapsed>0)status=spent<=expected?"on track":spent<=expected*1.1?"slightly over pace":"over pace";
  if(t>trip.end)status=spent<=B?"finished under budget":"finished over budget";
  return {B,days,daily,elapsed,spent,remaining,perDay,perCat,plan,expected,status,daysLeft,today:t,
    forecast:elapsed>0?spent/elapsed*days:null,todaySpent:exps.filter(e=>e.date===t).reduce((s,e)=>s+e.base,0),leftPerDay:daysLeft>0?remaining/daysLeft:null};
}
function summary(){const t=S.trip;if(!t)return {error:"No trip saved yet."};const c=calc(t,S.expenses),cats={};
  for(const[k]of CATS)cats[k]={spent:r2(c.perCat[k]),planned:r2(c.plan[k]),left:r2(c.plan[k]-c.perCat[k])};
  return {currency:t.currency,total_budget:t.budget,flights_cost:flightsTotal(t),flights_included_in_budget:!!t.flights?.included,budget:spendBudget(t),travelers:people(t),spent:r2(c.spent),remaining:r2(c.remaining),trip_days:c.days,days_elapsed:c.elapsed,days_left:c.daysLeft,
    daily_budget:r2(c.daily),spent_today:r2(c.todaySpent),pace_status:c.status,forecast_trip_total:c.forecast==null?null:r2(c.forecast),
    forecast_vs_budget:c.forecast==null?null:r2(c.forecast-c.B),budget_per_remaining_day:c.leftPerDay==null?null:r2(c.leftPerDay),categories:cats,splurge_days:t.splurgeDays||[]}}
function itineraryCost(trip){const n=people(trip);let total=0;const unpriced=[];
  for(const x of trip.itinerary||[]){const rate=rateFor(trip,x.currency);if(x.cost==null||rate==null){unpriced.push(x.name);continue}total+=x.cost*rate*n}
  const plan=spendBudget(trip)*(trip.split?.experiences??0)/100;return {total:r2(total),people:n,plan:r2(plan),left:r2(plan-total),unpriced}}

/* ---------- who's traveling ---------- */
const normalizePhone=raw=>{const s=String(raw||"").trim();if(!s)return "";return (s.startsWith("+")?"+":"")+s.replace(/[^\d]/g,"")};
const isValidPhone=p=>/^\+\d{8,15}$/.test(p);
const maskPhone=p=>p?p.slice(0,3)+" ••• "+p.slice(-4):"";
function normalizeParty(input){
  const type=["solo","family","group"].includes(input?.type)?input.type:"solo";const problems=[];
  const cl=(v,lo,hi)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo};
  let adults=1,children=0;if(type==="family"){adults=cl(input.adults,1,6);children=cl(input.children,0,8)}else if(type==="group")adults=cl(input.adults,2,20);
  const members=[];
  for(let i=0;i<adults+children;i++){const m=input.members?.[i]||{};const isChild=type==="family"&&i>=adults;
    const role=type==="solo"?"traveler":type==="family"?(isChild?"child":"parent"):i===0?"organizer":"member";
    const phone=isChild?"":normalizePhone(m.phone);
    if(phone&&!isValidPhone(phone))problems.push(`a valid WhatsApp number for ${m.name||role+" "+(i+1)} (start with + and the country code)`);
    members.push({name:String(m.name||"").trim().slice(0,40),phone,role,inGroup:!isChild&&!!phone,...(type==="group"&&m.home?{home:String(m.home).trim().slice(0,40)}:{})})}
  return {party:{type,adults,children,members},problems};
}

/* ---------- WhatsApp group, demo mode (same steps as Meta's Groups API) ---------- */
const ACTIVATION_STEPS=["Get a WhatsApp Business Platform account and move a business number to the Cloud API",
 "Become an Official Business Account (the verified badge), which the Groups API requires",
 "Set up the webhook and subscribe to the group webhook fields","Get the group invite link template approved",
 "Switch Travel Doctor from demo to live mode"];
function createGroup(trip){const ppl=(trip.party?.members||[]).filter(m=>m.inGroup);
  return {mode:"demo",subject:`${trip.name} · Travel Doctor`.slice(0,100),
    description:`Anna, your Travel Doctor agent, tracks the ${trip.name} budget here. Send expenses by text or voice note.`,
    inviteLink:"https://chat.whatsapp.com/DEMO"+Math.random().toString(36).slice(2,12).toUpperCase(),createdAt:Date.now(),
    participants:ppl.map(m=>({name:m.name||m.role,phone:maskPhone(m.phone),role:m.role,status:"invited"})),
    events:[{text:"Group created (simulated Create Group call)"},{text:`Invite link sent to ${ppl.length} ${ppl.length===1?"person":"people"} with the group invite template (simulated)`}]}}
function simulateJoins(g){return {...g,participants:g.participants.map(p=>({...p,status:"joined"})),events:[...g.events,{text:`${g.participants.length} joined (simulated webhook). Anna posted her welcome.`}]}}

/* ---------- attractions: curated, else ask Claude once and cache ---------- */
async function getAttractions(city){
  const k=cityKey(city);
  if(CURATED[k])return {city,source:"curated",currency:CURATED_CURRENCY,items:CURATED[k].map((x,i)=>({id:`${k}-${i}`,...x}))};
  if(S.cache[k])return S.cache[k];
  const sample=await CL.use("sample");if(!sample)throw new Error("Looking up new cities needs Claude, which isn't available in this view.");
  const cur=S.trip?.localCurrency||"EUR";
  const raw=await sample.json(`List the top 5 attractions for a visitor to ${city}. Reply with ONLY a JSON array of 5 objects:
{"name": string, "why": one short sentence, "typical_cost": number (typical price per adult in ${cur}, 0 if free), "hours": number, "lat": number, "lng": number}
Use well known, real places with accurate coordinates. Costs are rough typical estimates.`,{modelTier:"quick",cache:{gcTime:86400000}});
  const items=(Array.isArray(raw)?raw:[]).map((x,i)=>{const lat=Number(x.lat),lng=Number(x.lng),cost=Number(x.typical_cost??x.cost),hours=Number(x.hours);
    if(!x.name||!(lat>=-90&&lat<=90)||!(lng>=-180&&lng<=180))return null;
    return {id:`${k}-${i}`,name:String(x.name).slice(0,80),why:String(x.why||"").slice(0,200),cost:cost>=0&&cost<1e5?Math.round(cost):null,hours:hours>0&&hours<24?hours:null,lat:r2(lat*100)/100,lng:r2(lng*100)/100}}).filter(Boolean).slice(0,5);
  if(!items.length)throw new Error(`Couldn't get a reliable list for ${city}. Try again.`);
  const res={city,source:"claude",currency:cur,items};S.cache[k]=res;store.saveCache().catch(()=>{});return res;
}

/* ---------- Anna's tools: the AI decides, the code acts ---------- */
function logTool(name,input,output){S.log.unshift({name,input,output,at:new Date().toLocaleTimeString()});renderLog()}
const TOOLS=[
 {name:"log_expenses",description:"Save one or more expenses the traveler reported. Returns what was saved, converted, and the updated budget status. Use for every expense mentioned.",
  inputSchema:{type:"object",properties:{expenses:{type:"array",items:{type:"object",properties:{item:{type:"string"},category:{type:"string",enum:["stays","transport","food","experiences","other"]},amount:{type:"number"},currency:{type:"string",description:"3 letter code"},date:{type:"string",description:"YYYY-MM-DD"},paid_by:{type:"string",description:"Group trips: name of the person who paid"},split_between:{type:"array",items:{type:"string"},description:"Group trips: names it was for. Leave out when it is for everyone."}},required:["item","category","amount","currency","date"]}}},required:["expenses"]},
  async execute(input){const t=S.trip;if(!t)throw new Error("No trip saved.");const list=Array.isArray(input.expenses)?input.expenses:[];if(!list.length)throw new Error("No expenses given.");
    const rows=list.map(x=>{const cur=String(x.currency||t.localCurrency).toUpperCase().slice(0,3),amt=Number(x.amount);
      if(!(amt>0))throw new Error(`Amount for "${x.item}" is not a positive number. Ask the traveler.`);
      const rate=rateFor(t,cur);if(rate==null)throw new Error(`No exchange rate for ${cur}. Nothing was saved. Ask how much 1 ${cur} is in ${t.currency}, call set_exchange_rate, then log again.`);
      const who=isGroup(t)?payerFor(t,x):{};
      return {...who,item:String(x.item||"Expense").slice(0,80),category:CATNAME[x.category]?x.category:"other",amount:r2(amt),currency:cur,rate,base:r2(amt*rate),date:/^\d{4}-\d{2}-\d{2}$/.test(String(x.date))?String(x.date):defaultDate(),source:"anna",createdAt:Date.now()}});
    const saved=[];for(const r of rows){await store.addExpense(r);saved.push({item:r.item,category:r.category,amount:r.amount,currency:r.currency,[`in_${t.currency}`]:r.base,date:r.date,...(r.paidBy?{paid_by:r.paidBy,split:splitLabel(r,t)}:{})})}
    const out={saved,status:summary()};logTool("log_expenses",input,out);return out}},
 {name:"get_balances",description:"Group trips: who paid what, each person's fair share, balances, and the fewest payments to settle up. Use for any 'who owes who' question.",
  async execute(){const out=balancesForAnna();logTool("get_balances",{},out);return out}},
 {name:"undo_last_expense",description:"Delete the most recently logged expense when the traveler says it was wrong.",
  async execute(){const last=[...S.expenses].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];if(!last)throw new Error("No expenses to undo.");await store.deleteExpense(last.id);const out={removed:{item:last.item,amount:last.amount,currency:last.currency},status:summary()};logTool("undo_last_expense",{},out);return out}},
 {name:"set_exchange_rate",description:"Save an exchange rate the traveler gave: how much 1 unit of a currency is in the budget currency.",
  inputSchema:{type:"object",properties:{currency:{type:"string"},rate_to_budget_currency:{type:"number"}},required:["currency","rate_to_budget_currency"]},
  async execute(input){const t=S.trip;if(!t)throw new Error("No trip saved.");const cur=String(input.currency).toUpperCase().slice(0,3),r=Number(input.rate_to_budget_currency);if(!(r>0))throw new Error("Rate must be positive.");
    await store.saveTrip({...t,rates:{...(t.rates||{}),[cur]:r}});const out={saved:`1 ${cur} = ${r} ${t.currency}`};logTool("set_exchange_rate",input,out);return out}},
 {name:"get_budget_status",description:"Current numbers: spent, remaining, pace, forecast, daily budget, categories. Use before any summary.",
  async execute(){const out=summary();logTool("get_budget_status",{},out);return out}},
 {name:"check_affordability",description:"Check whether a purchase fits the budget. Returns the converted price and the budget before and after.",
  inputSchema:{type:"object",properties:{item:{type:"string"},amount:{type:"number"},currency:{type:"string"}},required:["item","amount","currency"]},
  async execute(input){const t=S.trip;if(!t)throw new Error("No trip saved.");const cur=String(input.currency||t.localCurrency).toUpperCase(),rate=rateFor(t,cur);if(rate==null)throw new Error(`No exchange rate for ${cur}. Ask for it.`);
    const price=r2(Number(input.amount)*rate),c=calc(t,S.expenses),expLeft=c.plan.experiences-c.perCat.experiences,after=c.remaining-price,dl=Math.max(c.daysLeft,0);
    const out={item:input.item,price_in_budget_currency:price,currency:t.currency,remaining_before:r2(c.remaining),remaining_after:r2(after),experiences_budget_left:r2(expLeft),days_left:dl,
      budget_per_remaining_day_now:c.leftPerDay==null?null:r2(c.leftPerDay),budget_per_remaining_day_after:dl>0?r2(after/dl):null,
      verdict:after<0?"over budget":price<=expLeft?"fits the experiences budget":"fits the total but goes over the experiences budget"};logTool("check_affordability",input,out);return out}},
 {name:"set_splurge_day",description:"Turn splurge mode on or off for a date (ignore the budget that day). Returns the effect on the remaining days.",
  inputSchema:{type:"object",properties:{date:{type:"string"},on:{type:"boolean"}},required:["date","on"]},
  async execute(input){const t=S.trip;if(!t)throw new Error("No trip saved.");const d=String(input.date||defaultDate()),set=new Set(t.splurgeDays||[]);input.on===false?set.delete(d):set.add(d);
    await store.saveTrip({...t,splurgeDays:[...set].sort()});const s=summary();const out={date:d,splurge:input.on!==false,daily_budget:s.daily_budget,spent_today:s.spent_today,remaining:s.remaining,budget_per_remaining_day:s.budget_per_remaining_day};logTool("set_splurge_day",input,out);return out}},
 {name:"stay_budget",description:"How much the traveler can spend per night in a city from what's left in the stays budget, plus a live search link. Never invent exact hotel prices.",
  inputSchema:{type:"object",properties:{city:{type:"string"},checkin:{type:"string"},nights:{type:"number"}},required:["city","checkin","nights"]},
  async execute(input){const t=S.trip;if(!t)throw new Error("No trip saved.");const c=calc(t,S.expenses),n=Math.max(1,Math.round(Number(input.nights)||1)),ci=/^\d{4}-\d{2}-\d{2}$/.test(String(input.checkin))?input.checkin:defaultDate(),left=c.plan.stays-c.perCat.stays;
    const out={city:input.city,nights:n,stays_budget_left:r2(left),max_per_night:r2(left/n),currency:t.currency,search_link:`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(input.city)}&checkin=${ci}&checkout=${addDays(ci,n)}&group_adults=${people(t)}`};logTool("stay_budget",input,out);return out}}
];
function annaRules(){const t=S.trip;
  return `You are Anna, the warm, calm travel budget agent inside the Travel Doctor app.
TRIP: ${JSON.stringify({name:t.name,cities:t.cities,start:t.start,end:t.end,party:t.party?{type:t.party.type,adults:t.party.adults,children:t.party.children,names:t.party.members.map(m=>m.name||m.role)}:null,budget:t.budget,budget_currency:t.currency,local_currency:t.localCurrency,known_rates:t.rates,split_percent:t.split,planned_itinerary:(t.itinerary||[]).map(x=>`${x.date}: ${x.name} (${x.city})`),sleeping_city_by_date:t.route?.nights?Object.fromEntries(t.route.nights.map((c,i)=>[addDays(t.start,i),c])):null,arrival_time:t.route?.arrival,flight_home_time:t.route?.departure,flights:t.flights?{outbound:flightLine(t.flights.out),return:flightLine(t.flights.ret),cost_in_budget_currency:flightsTotal(t),included_in_budget:!!t.flights.included}:null})}
TODAY: ${today()}. If no date is given for an expense, use ${defaultDate()}. "Yesterday" is the day before that.
STATUS: ${JSON.stringify(summary())}
RULES
1. NEVER do arithmetic yourself. Every number you say must come from a tool result.
2. Money spent: call log_expenses once with all items. Categories: stays, transport, food, experiences, other. Keep the currency they said; if none, use ${t.localCurrency}. "francs" = CHF, "euros" = EUR, "dollars" or "bucks" = USD.
3. If something is unclear, ask one short question instead of guessing.
4. "Can I afford X?": check_affordability. 5. "Forget the budget" or "splurge": set_splurge_day. Never shame.
6. Where to stay: stay_budget, then 2 or 3 areas or stay types with TYPICAL ranges labeled typical, plus the link. Never present an exact hotel price as real.
7. "How am I doing" or a summary: get_budget_status. 8. "That was wrong": undo_last_expense, then log the fix.
9. ${isGroup(t)?`GROUP TRIP with ${groupNames(t).join(", ")}. Each message starts with the sender's name. Set paid_by to whoever paid: the sender, unless they say someone else paid. If it was only for some people ("Ben and I", "just me"), set split_between with those names; otherwise leave it out and it is split between everyone. For "who owes who", call get_balances and repeat its settle_up lines.`:`The budget covers the whole party and the family shares one wallet, so nobody owes anyone. If someone says who paid, you can start the item with their name, for example "Raj: museum tickets".`}
10. Plain text, no markdown, at most 5 short lines, totals in ${t.currency}. Be encouraging.`}
let ctl=null;
async function askAnna(text){
  text=text.trim();if(!text||S.busy)return;
  if(!S.trip){S.chat.push({role:"anna",text:"Let's plan your trip first. Fill in the Plan tab, or load the sample Switzerland trip."});return renderChat()}
  const from=isGroup(S.trip)?(S.sender||groupNames(S.trip)[0]):null;S.chat.push({role:"me",text,from});$("msg").value="";
  const sample=await CL.use("sample");if(!sample){S.chat.push({role:"note",text:"Anna needs access to Claude, which isn't available in this view."});return renderChat()}
  S.busy=true;setBusy(true);const bubble={role:"anna",text:"Thinking…"};S.chat.push(bubble);renderChat();ctl=new AbortController();
  const hist=S.chat.filter(m=>(m.role==="me"||m.role==="anna")&&m!==bubble).slice(-12).map(m=>({role:m.role==="me"?"user":"assistant",content:m.from?`${m.from}: ${m.text}`:m.text}));
  while(hist.length&&hist[0].role!=="user")hist.shift();
  try{const lim=await sample.limits().catch(()=>null);
    if(lim&&lim.tools){const {text:a}=await sample([{role:"user",content:annaRules()},...hist],{modelTier:"quick",signal:ctl.signal,tools:TOOLS,onText:({text})=>{bubble.text=text;renderChat()}});bubble.text=a.trim()}
    else{const data=await sample.json(`${annaRules()}\n\nYou can't call tools here. Reply with ONLY JSON: {"expenses":[{"item":string,"category":string,"amount":number,"currency":string,"date":"YYYY-MM-DD"${from?',"paid_by":string,"split_between":[string] or null':""}}],"question":string or null}\nMessage: ${from?from+": ":""}${text}`,{modelTier:"quick",signal:ctl.signal,cache:false});
      const list=Array.isArray(data?.expenses)?data.expenses:[];if(list.length){const o=await TOOLS[0].execute({expenses:list}),s=o.status;bubble.text=`Logged ${o.saved.map(x=>`${x.item} ${money2(x.amount,x.currency)}`).join(", ")}.\nSpent ${money(s.spent,s.currency)} of ${money(s.budget,s.currency)}, ${money(s.remaining,s.currency)} left. ${s.pace_status}.`}else bubble.text=data?.question||"Tell me what you spent and I'll log it."}
  }catch(e){const c=e&&e.code;
    bubble.text=c==="cancelled"?(e.text||"Stopped."):c==="not_granted"||c==="sampling_disabled"?"I need your permission to use Claude. Allow it when your app asks, then try again.":c==="rate_limited"?"Lots of messages right now. Give it a minute and try again.":(e&&e.message&&!c?e.message:"Something went wrong on my side. Please try again.")}
  finally{S.busy=false;setBusy(false);renderChat()}
}
function setBusy(b){$("send").disabled=b;$("stop").hidden=!b;$("msg").disabled=b}

/** Who paid and who it was for, checked against the real group names (the AI can't invent a person). */
function payerFor(t,x){const names=groupNames(t),by=matchName(x.paid_by,names)||(x.paid_by?null:matchName(S.sender,names));
  if(!by)throw new Error(`I don't know who "${x.paid_by||"?"}" is. The group is ${names.join(", ")}. Ask who paid for "${x.item}".`);
  const among=[...new Set((Array.isArray(x.split_between)?x.split_between:[]).map(n=>matchName(n,names)).filter(Boolean))];
  return {paidBy:by,splitAmong:among.length&&among.length<names.length?among:null}}
