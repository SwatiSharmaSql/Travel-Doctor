/* ================= TOP PICKS: real resources per destination ================= */
// Official links are hand checked. Ratings change daily and we can't read Google's ratings from
// this page, so every pick carries a "Google reviews" link to check the live rating before booking.
const gmaps=q=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
function staySearch(city,t){const sd=stayDates(t,city),ci=sd?.checkin||t?.start||"",co=sd?.checkout||t?.end||"",n=people(t)||2;
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}${ci?`&checkin=${ci}&checkout=${co}`:""}&group_adults=${Math.max(1,(t?.party?.adults)||n)}${t?.party?.children?`&group_children=${t.party.children}`:""}&nflt=review_score%3D90&order=review_score_and_price`}

const PICK_CATS=[["transport","Getting around","train"],["stays","Where to stay","bed"],["food","Where to eat","food"],["experiences","Experiences","ticket"],["other","Good to know","compass"]];
const COUNTRY_OF={zurich:"switzerland",lucerne:"switzerland",interlaken:"switzerland",zermatt:"switzerland",geneva:"switzerland",bern:"switzerland",basel:"switzerland",lugano:"switzerland",st_moritz:"switzerland",
  athens:"greece",santorini:"greece",mykonos:"greece",thessaloniki:"greece",crete:"greece",heraklion:"greece"};
const COUNTRY_PICKS={
 switzerland:{name:"Switzerland",flag:"🇨🇭",
  transport:[
   {name:"Swiss Travel Pass",why:"Unlimited trains, buses and lake boats across the country, free entry to 500+ museums, and 50% off most mountain railways. Buy before you go and show it on your phone.",tip:"Best for 4+ travel days with many train rides",links:[["Buy on SBB (official)","https://www.sbb.ch/en"]],official:true},
   {name:"Swiss Half Fare Card",why:"Pay half price on almost all trains, buses, boats and many cable cars for a month. Often cheaper than a pass if you stay in one or two places.",tip:"Compare it with the pass for your exact route",links:[["SBB (official)","https://www.sbb.ch/en"]],official:true},
   {name:"SBB Mobile app",why:"Timetables, platform changes and tickets in one app. Trains run to the minute, so check connections here.",links:[["SBB (official)","https://www.sbb.ch/en"]],official:true},
  ],
  other:[
   {name:"Power plugs are type J",why:"Bring a Swiss adapter. Many European two pin plugs fit, but grounded three pin ones often don't."},
   {name:"Tap and fountain water is drinkable",why:"Refill bottles at public fountains in every town. It saves real money over a week."},
   {name:"Service is included",why:"Tipping isn't expected. Rounding up or leaving 5 to 10% for great service is a kind extra."},
   {name:"Emergency number 112",why:"Works across Europe. 144 is the Swiss ambulance number."},
  ]},
 greece:{name:"Greece",flag:"🇬🇷",
  transport:[
   {name:"Athens Metro from the airport",why:"Line 3 runs from the airport to Syntagma in the centre in about 40 minutes. The X95 bus is a cheaper 24 hour option.",links:[["OASA, Athens transport (official)","https://www.oasa.gr/en/"],["Athens Airport (official)","https://www.aia.gr/en"]],official:true},
   {name:"Ferries to the islands",why:"Book popular summer routes a few days ahead. Compare operators and check departure ports (Piraeus or Rafina).",links:[["Search ferries on Google",gmaps("ferry Piraeus port")]]},
  ],
  other:[
   {name:"Buy archaeological site tickets officially",why:"The Hellenic Heritage e-ticket site is run by the Ministry of Culture. Resellers often charge more for the same ticket.",links:[["Hellenic Heritage tickets (official)","https://hhticket.gr"],["Ministry of Culture info","https://culture.gr/en/Information/SitePages/view.aspx?nID=4651"]],official:true},
   {name:"Visit the Acropolis early",why:"Go at opening time in summer to beat the heat and crowds. Bring water and good shoes; the marble is slippery."},
   {name:"Power plugs are type C and F",why:"Standard European two pin plugs."},
   {name:"Emergency number 112",why:"Works across Europe and in Greece."},
  ]},
};
const CITY_PICKS={
 zurich:{
  transport:[{name:"ZVV day pass",why:"Trams, buses, S Bahn trains and lake boats across Zurich. Included in the Swiss Travel Pass.",links:[["ZVV (official)","https://www.zvv.ch/en"]],official:true}],
  food:[{name:"Zeughauskeller",why:"A 15th century armory turned beer hall, known for sausages and Zürcher Geschnetzeltes.",q:"Zeughauskeller Zurich"},
        {name:"Hiltl",why:"Holds the Guinness record as the world's oldest vegetarian restaurant (since 1898).",q:"Hiltl Zurich"},
        {name:"Top rated fondue in Zurich",why:"Search Google Maps and sort by rating to see what's 4.5 stars and up today.",q:"best fondue restaurant Zurich",search:true}],
  stays:[{name:"Old Town (Altstadt) and Niederdorf",why:"Walk to the lake, river and restaurants. Busier at night."},{name:"Near Zurich HB station",why:"Easiest for day trips by train, which suits a Swiss Travel Pass."}],
  experiences:[{name:"Kunsthaus Zürich",links:[["Tickets (official)","https://www.kunsthaus.ch/en/"]],official:true},{name:"Lindt Home of Chocolate",links:[["Tickets (official)","https://www.lindt-home-of-chocolate.com/"]],official:true}]},
 lucerne:{
  transport:[{name:"Lake Lucerne boats",why:"Historic paddle steamers to Vitznau (Rigi) and Alpnachstad (Pilatus). Included in the Swiss Travel Pass.",links:[["Lake Lucerne Navigation (official)","https://www.lakelucerne.ch/en/"]],official:true}],
  food:[{name:"Wirtshaus Taube",why:"A traditional Lucerne tavern by the river serving local dishes.",q:"Wirtshaus Taube Luzern"},{name:"Top rated restaurants in Lucerne old town",why:"Search Google Maps and sort by rating to see 4.5 stars and up today.",q:"best restaurants Lucerne old town",search:true}],
  stays:[{name:"Old Town and the lakefront",why:"Walk to Chapel Bridge and the boat piers."},{name:"Near the station",why:"Boats, trains and the Pilatus round trip all start here."}],
  experiences:[{name:"Mount Pilatus Golden Round Trip",links:[["Tickets (official)","https://www.pilatus.ch/en/"]],official:true},{name:"Mount Rigi",links:[["Tickets (official)","https://www.rigi.ch/en"]],official:true},{name:"Swiss Museum of Transport",links:[["Tickets (official)","https://www.verkehrshaus.ch/en"]],official:true}]},
 interlaken:{
  transport:[{name:"Jungfrau Travel Pass",why:"Regional pass for trains and cable cars around Interlaken, Grindelwald, Wengen and Mürren, with a discount to the Jungfraujoch.",links:[["Jungfrau Railways (official)","https://www.jungfrau.ch/shop/en/tickets"]],official:true}],
  food:[{name:"Top rated Swiss restaurants in Interlaken",why:"Search Google Maps and sort by rating to see 4.5 stars and up today.",q:"best Swiss restaurant Interlaken",search:true}],
  stays:[{name:"Interlaken Ost area",why:"Mountain trains to Grindelwald and the Jungfrau leave from Interlaken Ost."},{name:"Lauterbrunnen or Wengen",why:"Quieter valley villages with waterfall views. Wengen is car free."}],
  experiences:[{name:"Jungfraujoch, Top of Europe",why:"Reserve a seat on the Eiger Express and pick a clear day.",links:[["Tickets (official)","https://www.jungfrau.ch/shop/en/tickets"]],official:true},{name:"Harder Kulm",links:[["Tickets (official)","https://www.jungfrau.ch/shop/en/tickets"]],official:true}]},
 zermatt:{
  transport:[{name:"Zermatt is car free",why:"Park or take the train to Täsch, then the shuttle train. Electric taxis and buses run in the village."},
             {name:"Glacier Express",why:"Scenic panoramic train between Zermatt and St. Moritz. Seat reservations are required and sell out in summer.",links:[["Glacier Express (official)","https://www.glacierexpress.ch/en/"]],official:true}],
  food:[{name:"Whymper Stube",why:"A Zermatt classic for cheese fondue and raclette.",q:"Whymper Stube Zermatt"},{name:"Top rated mountain restaurants in Zermatt",why:"Search Google Maps and sort by rating to see 4.5 stars and up today.",q:"best restaurant Zermatt",search:true}],
  stays:[{name:"Near the station or Bahnhofstrasse",why:"Flat walks with luggage. Hillside hotels often have Matterhorn views but more climbing."}],
  experiences:[{name:"Gornergrat railway",links:[["Tickets (official)","https://www.gornergrat.ch/en"]],official:true},{name:"Matterhorn Glacier Paradise",links:[["Tickets (official)","https://www.matterhornparadise.ch/en"]],official:true}]},
 athens:{
  transport:[{name:"Metro, tram and bus tickets",why:"Tap a contactless bank card or buy a ticket for the metro, tram and buses. A tourist ticket covers 3 days including the airport.",links:[["OASA (official)","https://www.oasa.gr/en/"]],official:true}],
  food:[{name:"Top rated tavernas in Plaka",why:"Search Google Maps and sort by rating to see 4.5 stars and up today.",q:"best taverna Plaka Athens",search:true},{name:"Top rated souvlaki in Monastiraki",why:"Search Google Maps and sort by rating.",q:"best souvlaki Monastiraki Athens",search:true}],
  stays:[{name:"Plaka and Monastiraki",why:"Walk to the Acropolis and the old town."},{name:"Koukaki",why:"Quieter, local cafés, close to the Acropolis Museum."}],
  experiences:[{name:"Acropolis and the Parthenon",why:"Buy a timed ticket from the official site. Choose an early slot.",links:[["Tickets (official)","https://hhticket.gr"]],official:true},
               {name:"Acropolis Museum",links:[["Tickets (official)","https://www.theacropolismuseum.gr/en"]],official:true},
               {name:"Ancient Agora",why:"Tickets on the official Hellenic Heritage site.",links:[["Tickets (official)","https://hhticket.gr"]],official:true}]},
};
// Athens top 5 for the day planner (typical prices per person in EUR).
CURATED.athens=[
 {name:"Acropolis and the Parthenon",why:"The 5th century BC citadel above the city. Go at opening time.",cost:30,hours:2.5,lat:37.9715,lng:23.7257},
 {name:"Acropolis Museum",why:"The Parthenon sculptures, displayed with a view of the hill itself.",cost:20,hours:2.5,lat:37.9685,lng:23.7285},
 {name:"Ancient Agora",why:"The heart of ancient Athens, with the remarkably preserved Temple of Hephaestus.",cost:20,hours:2,lat:37.9747,lng:23.7224},
 {name:"Plaka and Anafiotika old town",why:"Whitewashed lanes under the Acropolis, full of tavernas.",cost:0,hours:2,lat:37.9725,lng:23.7300},
 {name:"National Archaeological Museum",why:"One of the world's great collections of ancient Greek art.",cost:12,hours:3,lat:37.9890,lng:23.7320},
];
const CURRENCY_OF={switzerland:"CHF",greece:"EUR"};


/* ---------- approximate prices (typical, per person unless noted) ----------
   per: "person" = once per person (a ticket, a meal) · "person_day" = per person per day (a pass, split by day)
        "trip_person" = once per person for the whole trip (spread across trip days in a day estimate)
        "room_night" = per room per night (we assume 2 people per room)                                   */
const PRICES={
 "Swiss Travel Pass":[82,"person_day","CHF","3 day pass, about CHF 245 in 2nd class"],
 "Swiss Half Fare Card":[150,"trip_person","CHF","one card for a month"],
 "SBB Mobile app":[0,"person","CHF","free"],
 "Athens Metro from the airport":[9,"person","EUR","airport metro ticket"],
 "Ferries to the islands":[60,"person","EUR","one way, varies by route and season"],
 "ZVV day pass":[9,"person_day","CHF","city zone, 24 hours"],
 "Lake Lucerne boats":[45,"person","CHF","round trip, varies by route"],
 "Jungfrau Travel Pass":[70,"person_day","CHF","multi day pass, per day"],
 "Glacier Express":[200,"person","CHF","fare plus seat reservation"],
 "Metro, tram and bus tickets":[7,"person_day","EUR","about EUR 20 for a 3 day tourist ticket"],
 "Zeughauskeller":[40,"person","CHF","dinner"],"Hiltl":[35,"person","CHF","lunch buffet"],"Top rated fondue in Zurich":[45,"person","CHF","fondue dinner"],
 "Wirtshaus Taube":[40,"person","CHF","dinner"],"Top rated restaurants in Lucerne old town":[45,"person","CHF","dinner"],
 "Top rated Swiss restaurants in Interlaken":[45,"person","CHF","dinner"],"Whymper Stube":[50,"person","CHF","fondue or raclette"],
 "Top rated mountain restaurants in Zermatt":[50,"person","CHF","lunch with a view"],
 "Top rated tavernas in Plaka":[25,"person","EUR","dinner"],"Top rated souvlaki in Monastiraki":[6,"person","EUR","quick lunch"],
 "Kunsthaus Zürich":[24,"person","CHF"],"Lindt Home of Chocolate":[15,"person","CHF"],"Mount Pilatus Golden Round Trip":[120,"person","CHF"],
 "Mount Rigi":[80,"person","CHF"],"Swiss Museum of Transport":[35,"person","CHF"],"Jungfraujoch, Top of Europe":[220,"person","CHF","round trip from Interlaken"],
 "Harder Kulm":[40,"person","CHF"],"Gornergrat railway":[120,"person","CHF"],"Matterhorn Glacier Paradise":[110,"person","CHF"],
 "Acropolis and the Parthenon":[30,"person","EUR"],"Acropolis Museum":[20,"person","EUR"],"Ancient Agora":[20,"person","EUR"],
};
const STAY_NIGHT={zurich:260,lucerne:230,interlaken:220,zermatt:320,athens:160};
const BREAKFAST={switzerland:[20,"CHF"],greece:[8,"EUR"]};
function priceOf(p){if(p.price)return p.price;const x=PRICES[p.name];return x?{a:x[0],per:x[1],cur:x[2],note:x[3]}:null}
const PER_LABEL={person:"per person",person_day:"per person a day",trip_person:"per person, once",room_night:"a night per room"};
function priceText(pr){if(!pr)return "";if(pr.a===0)return "Free";return `~${money(pr.a,pr.cur)} ${PER_LABEL[pr.per]}`}
function rooms(t){const pt=t?.party;if(!pt)return 1;return pt.type==="family"?Math.max(1,Math.ceil(pt.adults/2)):Math.max(1,Math.ceil((pt.adults+pt.children)/2))}
/** Day estimate, all math in code: per person and for the whole party, in the budget currency. */
function dayEstimate(t,items){const n=people(t),days=diffDays(t.start,t.end)+1,rm=rooms(t);let pp=0,party=0;const unpriced=[],rows=[];
  for(const it of items){const pr=it.price;if(!pr){unpriced.push(it.name);continue}const rate=rateFor(t,pr.cur);if(rate==null){unpriced.push(it.name);continue}
    let a=pr.a*rate,rowPP,rowParty;
    if(pr.per==="room_night"){rowParty=a*rm;rowPP=rowParty/n}else if(pr.per==="trip_person"){rowPP=a/days;rowParty=rowPP*n}else{rowPP=a;rowParty=a*n}
    pp+=rowPP;party+=rowParty;rows.push({name:it.name,pp:r2(rowPP),party:r2(rowParty),per:pr.per})}
  const daily=spendBudget(t)/days;return {perPerson:r2(pp),party:r2(party),daily:r2(daily),left:r2(daily-party),people:n,rooms:rm,rows,unpriced}}

async function getPicks(city){
  const k=cityKey(city),country=COUNTRY_OF[k];
  if(CITY_PICKS[k])return {city,country,source:"curated",...CITY_PICKS[k]};
  const ck="picks:"+k;if(S.cache[ck])return S.cache[ck];
  const sample=await CL.use("sample");if(!sample)throw new Error("Looking up new destinations needs Claude, which isn't available in this view.");
  const raw=await sample.json(`Recommend well known, highly rated options for a visitor to ${city}. Reply with ONLY a JSON object:
{"currency":"3 letter local currency code","stay_night_double_room":number,"breakfast":number,"transport":[{"name":string,"why":one sentence,"cost":number,"per":"person" or "person_day"}],"stays":[{"name": a neighborhood,"why":one sentence}],"food":[{"name": a real, well known restaurant or food spot,"why":one sentence,"cost":number}],"experiences":[{"name":string,"why":one sentence,"cost":number}],"other":[{"name": a practical tip title,"why":one sentence}]}
2 or 3 items per list. Only real, well known places. Costs are rough typical prices per person in the local currency (0 if free). Do NOT include URLs or ratings.`,{modelTier:"quick",cache:{gcTime:86400000}});
  const cur=/^[A-Z]{3}$/.test(String(raw?.currency||""))?raw.currency:(S.trip?.localCurrency||"EUR");
  const num=v=>{const n=Number(v);return n>=0&&n<1e5?Math.round(n):null};
  const clean=(list,priced)=>(Array.isArray(list)?list:[]).slice(0,4).filter(x=>x&&x.name).map(x=>{const c=priced?num(x.cost):null;
    return {name:String(x.name).slice(0,70),why:String(x.why||"").slice(0,220),q:`${x.name} ${city}`,price:c==null?null:{a:c,per:x.per==="person_day"?"person_day":"person",cur,note:"rough estimate"}}});
  const res={city,country:null,source:"claude",currency:cur,stayNight:num(raw?.stay_night_double_room),breakfast:num(raw?.breakfast),transport:clean(raw?.transport,true),stays:clean(raw?.stays),food:clean(raw?.food,true),experiences:clean(raw?.experiences,true),other:clean(raw?.other)};
  if(!res.food.length&&!res.experiences.length)throw new Error(`Couldn't get reliable picks for ${city}. Try again.`);
  S.cache[ck]=res;store.saveCache().catch(()=>{});return res;
}

/* ---------- render the Top picks page ---------- */
function estSet(city){S.est=S.est||{};if(!S.est[city]){let saved=[];try{saved=JSON.parse(localStorage.getItem("td-est-"+city)||"[]")}catch(e){}S.est[city]=new Set(saved)}return S.est[city]}
function saveEst(city){try{localStorage.setItem("td-est-"+city,JSON.stringify([...estSet(city)]))}catch(e){}}
function pickCard(p,city,kind,estCity){
  const card=el("article",{class:"pick"}),pr=priceOf(p),id=kind+":"+p.name,on=estCity&&estSet(estCity).has(id);if(on)card.classList.add("on");
  const head=el("div",{class:"pick-h"},el("h4",{text:p.name}),p.official?el("span",{class:"pill ok"},icon("check",13,2.4),"Official"):p.search?el("span",{class:"pill info",text:"Live search"}):null);
  card.append(head);
  if(pr)card.append(el("div",{class:"price-row"},el("span",{class:"price-tag",text:priceText(pr)}),pr.note?el("span",{class:"sub",style:"font-size:12.5px",text:pr.note}):null));
  if(p.why)card.append(el("p",{text:p.why}));if(p.tip)card.append(el("p",{class:"tip",text:"Tip: "+p.tip}));
  const links=el("div",{class:"pick-links"});
  for(const[label,url]of p.links||[])links.append(el("a",{class:"lnk primary",href:url,target:"_blank",rel:"noopener"},icon("link",15),label));
  if(p.q&&!p.search)links.append(el("a",{class:"lnk",href:gmaps(p.q),target:"_blank",rel:"noopener"},icon("pin",15),"Google reviews"));
  if(p.search)links.append(el("a",{class:"lnk primary",href:gmaps(p.q),target:"_blank",rel:"noopener"},icon("pin",15),"See ratings on Google Maps"));
  if(kind==="experiences"&&!p.q)links.append(el("a",{class:"lnk",href:gmaps(`${p.name} ${city}`),target:"_blank",rel:"noopener"},icon("pin",15),"Google reviews"));
  if(kind==="stays"&&!p.links?.length)links.append(el("a",{class:"lnk",href:gmaps(`hotels ${p.name} ${city}`),target:"_blank",rel:"noopener"},icon("pin",15),"Hotels here on Google"));
  if(pr&&estCity&&pr.a>0){const tg=el("button",{class:"est-btn"+(on?" on":""),type:"button","aria-pressed":String(!!on)},icon(on?"check":"calendar",15),on?"In my day":"Add to day estimate");
    tg.onclick=()=>{const set=estSet(estCity);set.has(id)?set.delete(id):set.add(id);saveEst(estCity);renderPicks()};links.append(tg)}
  if(links.childNodes.length)card.append(links);
  return card;
}
function renderPicks(){
  const box=$("picks");box.innerHTML="";const t=S.trip;
  if(!t||!(t.cities||[]).length){box.append(el("div",{class:"panel empty"},icon("compass",40),el("h2",{text:"Add a destination first"}),el("p",{class:"sub",text:"Enter your destination cities on the Plan tab, and this page fills with transport passes, stays, food and experiences, with links to official sites."}),
    (()=>{const b=el("button",{class:"btn primary",type:"button",text:"Go to Plan"});b.onclick=()=>switchTab("trip");return b})()));return}
  const cities=t.cities;if(!S.pickCity||!cities.includes(S.pickCity))S.pickCity=cities[0];
  const countries=[...new Set(cities.map(c=>COUNTRY_OF[cityKey(c)]).filter(Boolean))];
  // intro
  const intro=el("div",{class:"panel picks-intro"});
  intro.append(el("div",{class:"head"},el("h2",{text:`Top picks for ${countries.map(c=>COUNTRY_PICKS[c].name).join(" and ")||cities.join(", ")}`}),el("span",{class:"pill info",text:"Real links, checked"})));
  intro.append(el("p",{class:"sub",text:"Everything you need before you go: transport passes, where to stay, where to eat and what to book ahead. Official sites are marked. Ratings change daily, so every place links to its live Google reviews; we only suggest well reviewed places, and you can confirm the 4.5 star mark there before booking."}));
  box.append(intro);
  // country level essentials
  for(const c of countries){const cp=COUNTRY_PICKS[c];const sec=el("div",{class:"panel"});
    sec.append(el("div",{class:"head"},el("h2",{text:`${cp.flag} ${cp.name} essentials`}),el("span",{class:"sub",text:"Book or download before you fly"})));
    const g=el("div",{class:"pick-grid"});for(const p of cp.transport)g.append(pickCard(p,cp.name,"transport",S.pickCity));sec.append(el("h3",{},icon("train",18)," Getting around"),g);
    const g2=el("div",{class:"pick-grid"});for(const p of cp.other)g2.append(pickCard(p,cp.name,"other",null));sec.append(el("h3",{},icon("compass",18)," Good to know"),g2);box.append(sec)}
  // per city
  const cityPanel=el("div",{class:"panel"});
  const tabs=el("div",{class:"city-tabs"});cities.forEach((c,i)=>{const b=el("button",{class:"city",type:"button","aria-pressed":String(c===S.pickCity)},el("span",{class:"dot",text:String(i+1)}),c);b.onclick=()=>{S.pickCity=c;renderPicks()};tabs.append(b)});
  cityPanel.append(el("div",{class:"head"},el("h2",{text:`In ${S.pickCity}`})),tabs);
  const body=el("div",{class:"stack"});cityPanel.append(body);box.append(cityPanel);
  const city=S.pickCity,data=S.picks?.[city];
  if(!data){body.append(el("p",{class:"sub",text:`Finding top picks for ${city}…`}));if(S.pickLoading!==city){S.pickLoading=city;getPicks(city).then(d=>{S.picks=S.picks||{};S.picks[city]=d;S.pickLoading=null;if(S.pickCity===city&&tab==="picks")renderPicks()}).catch(e=>{S.pickLoading=null;body.innerHTML="";body.append(el("p",{class:"err",text:e.message}))})}return}
  const ck=cityKey(city),country=COUNTRY_OF[ck],lcur=CURRENCY_OF[country]||data.currency||t.localCurrency;
  const nightly=STAY_NIGHT[ck]??data.stayNight,bf=BREAKFAST[country]||(data.breakfast!=null?[data.breakfast,lcur]:null);
  const lists={};
  for(const[k]of PICK_CATS){let items=[...(data[k]||[])];
    if(k==="stays")items=[{name:`Stays in ${city} rated 9+ by guests`,why:`${stayDates(t,city)?`For your ${stayDates(t,city).nights} night${stayDates(t,city).nights>1?"s":""} here (${niceDate(stayDates(t,city).checkin)} to ${niceDate(stayDates(t,city).checkout)}). `:"You have no nights here yet; this searches your whole trip. "}Booking.com search for your party, filtered to guest scores of 9 or more (about 4.5 stars), sorted by rating and price.`,links:[["Search stays",staySearch(city,t)]],price:nightly!=null?{a:nightly,per:"room_night",cur:lcur,note:"typical for a well rated double room"}:null},...items];
    if(k==="food"&&bf)items=[{name:`Café breakfast in ${city}`,why:"Coffee and a pastry or a simple breakfast, if your stay doesn't include one.",q:`best breakfast cafe ${city}`,price:{a:bf[0],per:"person",cur:bf[1]}},...items];
    if(k==="experiences"){const attr=S.attr[city];if(attr)for(const a of attr.items)if(!items.some(x=>x.name===a.name))items.push({name:a.name,why:a.why,q:`${a.name} ${city}`,price:a.cost==null?null:{a:a.cost,per:"person",cur:attr.currency}})}
    lists[k]=items}
  // the day estimator (all picks across country essentials and this city)
  const all=[];for(const c of countries)for(const p of COUNTRY_PICKS[c].transport)all.push(["transport",p]);for(const[k]of PICK_CATS)for(const p of lists[k])all.push([k,p]);
  const set=estSet(city),chosen=all.filter(([k,p])=>set.has(k+":"+p.name)).map(([k,p])=>({name:p.name,price:priceOf(p)}));
  body.append(estimator(t,city,chosen,()=>{set.clear();const pick=(k,i)=>{const p=lists[k]?.filter(x=>priceOf(x)?.a>0)[i];if(p)set.add(k+":"+p.name)};
    pick("stays",0);pick("food",0);pick("food",1);pick("food",2);pick("experiences",0);pick("experiences",1);
    const tr=lists.transport.find(x=>priceOf(x)?.per==="person_day")||all.find(([k,p])=>k==="transport"&&priceOf(p)?.per==="person_day")?.[1];if(tr)set.add("transport:"+tr.name);
    saveEst(city);renderPicks()},()=>{set.clear();saveEst(city);renderPicks()}));
  for(const[k,label,ic]of PICK_CATS){const items=lists[k];if(!items.length)continue;
    const g=el("div",{class:"pick-grid"});for(const p of items)g.append(pickCard(p,city,k,city));
    body.append(el("section",{class:"pick-sec"},el("h3",{},icon(ic,18)," "+label),g))}
  if(k_planLink(city))body.append(k_planLink(city));
  body.append(el("p",{class:"sub",text:data.source==="curated"?"Hand checked: official links verified, named places are long standing local favorites. Confirm today's rating on Google before you go.":"Suggested by Claude. Links go to live Google searches, never to made up pages. Confirm ratings on Google before booking."}));
}
function k_planLink(city){const b=el("button",{class:"btn dark",type:"button"},icon("calendar",18),`Add ${city} experiences to your days`);b.onclick=()=>{S.city=city;switchTab("trip");setTimeout(()=>$("plan-panel").scrollIntoView({behavior:"smooth"}),50)};return el("div",{class:"btns"},b)}

function estimator(t,city,chosen,onTypical,onClear){
  const e=dayEstimate(t,chosen),cur=t.currency,card=el("div",{class:"estimator"});
  card.append(el("div",{class:"head"},el("h3",{},icon("wallet",18),` Estimate a day in ${city}`),el("span",{class:"btns"},
    (()=>{const b=el("button",{class:"btn small dark",type:"button"},icon("star",15),"Build a typical day");b.onclick=onTypical;return b})(),
    chosen.length?(()=>{const b=el("button",{class:"btn small",type:"button",text:"Clear"});b.onclick=onClear;return b})():null)));
  if(!chosen.length){card.append(el("p",{class:"sub",text:"Tap \"Add to day estimate\" on any pick below, or build a typical day: a well rated stay, breakfast, lunch, dinner, two experiences and local transport. We add it up per person and for your whole party."}));return card}
  const list=el("div",{class:"est-rows"});
  for(const r of e.rows)list.append(el("div",{class:"est-row"},el("span",{text:r.name+(r.per==="room_night"?` (${e.rooms} room${e.rooms>1?"s":""})`:r.per==="trip_person"?" (spread over the trip)":"")}),el("span",{class:"money",text:money(r.pp,cur)}),el("span",{class:"money",text:money(r.party,cur)})));
  card.append(el("div",{class:"est-row est-headrow"},el("span",{text:"Pick"}),el("span",{text:"Per person"}),el("span",{text:`All ${e.people}`})),list);
  const tot=el("div",{class:"est-total"},
    el("div",{},el("small",{text:"Per person, per day"}),el("b",{text:money(e.perPerson,cur)})),
    el("div",{},el("small",{text:`Your party of ${e.people}`}),el("b",{text:money(e.party,cur)})),
    el("div",{},el("small",{text:"Your daily budget"}),el("b",{text:money(e.daily,cur)})),
    el("div",{},el("small",{text:"Difference"}),el("span",{class:"pill "+(e.left>=0?"ok":"bad"),text:e.left>=0?`${money(e.left,cur)} under`:`${money(-e.left,cur)} over`})));
  card.append(tot);
  card.append(el("p",{class:"sub",style:"font-size:13px",text:`Approximate typical prices, converted at your trip's exchange rate. Children are counted at the adult price; stays assume 2 people per room.${e.unpriced.length?" Not priced: "+e.unpriced.join(", ")+".":""}`}));
  return card;
}
