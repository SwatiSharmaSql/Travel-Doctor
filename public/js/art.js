const CL=(window.claude&&window.claude.use)?window.claude:{use:async()=>null};
/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDay=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parseDay(s);d.setDate(d.getDate()+n);return ymd(d)};
const diffDays=(a,b)=>Math.round((parseDay(b)-parseDay(a))/86400000);
const today=()=>ymd(new Date());
const r2=n=>Math.round(n*100)/100;
function money(n,cur){try{return new Intl.NumberFormat(undefined,{style:"currency",currency:cur||"USD",maximumFractionDigits:0}).format(n)}catch(e){return (cur||"")+" "+Math.round(n)}}
function money2(n,cur){try{return new Intl.NumberFormat(undefined,{style:"currency",currency:cur||"USD",maximumFractionDigits:2}).format(n)}catch(e){return (cur||"")+" "+r2(n)}}
const niceDate=s=>parseDay(s).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
const el=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(v==null)continue;if(k==="class")e.className=v;else if(k==="text")e.textContent=v;else if(k==="html")e.innerHTML=v;else e.setAttribute(k,v)}for(const k of kids)if(k!=null&&k!==false)e.append(k);return e};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- icons (drawn for this app, 24px grid) ---------- */
const IC={
 compass:'<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5Z"/>',
 chat:'<path d="M20.5 12a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12Z"/>',
 chart:'<path d="M4 20V11M10 20V5M16 20v-6M2 20.5h20"/>',
 solo:'<circle cx="12" cy="7.5" r="3.8"/><path d="M4.5 21c.5-4.5 3.8-6.8 7.5-6.8s7 2.3 7.5 6.8"/><path d="M15 3.5l2.5-1.5M16.8 6.2h2.6"/>',
 family:'<circle cx="7.5" cy="6.5" r="2.8"/><circle cx="16.5" cy="6.5" r="2.8"/><circle cx="12" cy="13" r="2.2"/><path d="M2.5 19c.3-3.6 2.3-5.6 5-5.6M21.5 19c-.3-3.6-2.3-5.6-5-5.6M8.2 21c.3-2.4 1.8-3.6 3.8-3.6s3.5 1.2 3.8 3.6"/>',
 group:'<circle cx="12" cy="6.5" r="2.8"/><circle cx="5" cy="9" r="2.3"/><circle cx="19" cy="9" r="2.3"/><path d="M6.5 20c.4-4 2.7-6 5.5-6s5.1 2 5.5 6M1.5 19c.2-2.8 1.6-4.4 3.5-4.4M22.5 19c-.2-2.8-1.6-4.4-3.5-4.4"/>',
 bed:'<path d="M3 19V7M3 14.5h18V19M21 14.5v-1.5a3 3 0 0 0-3-3h-7.5v4.5"/><circle cx="6.8" cy="11.6" r="1.7"/>',
 train:'<rect x="5" y="2.5" width="14" height="14" rx="3.5"/><path d="M5 10h14M8.5 21l2-4.5M15.5 21l-2-4.5"/><circle cx="8.8" cy="13.3" r=".9"/><circle cx="15.2" cy="13.3" r=".9"/>',
 food:'<path d="M6.5 3v7a2.2 2.2 0 0 0 4.4 0V3M8.7 12v9M17.5 21V3c-2.4 1.2-3.5 4-3.5 8h3.5"/>',
 ticket:'<path d="M3 7h18v3.2a1.8 1.8 0 0 0 0 3.6V17H3v-3.2a1.8 1.8 0 0 0 0-3.6Z"/><path d="M14 7.5v9" stroke-dasharray="2 2"/>',
 bag:'<rect x="4" y="8" width="16" height="12.5" rx="2.5"/><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2M4 13h16"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10.5h18M15.5 15h2.5"/><path d="M6 6l9-3 1.5 3"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 pin:'<path d="M12 21.5s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="9.5" r="2.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
 plane:'<path d="M21 4.5c-.8-.8-2.3-.6-3.4.5L14 8.6 5.6 6.2 3.8 8l6.8 4.2-3.3 3.3-2.8-.4L3 16.6l3.6 1.6 1.6 3.6 1.5-1.5-.4-2.8 3.3-3.3 4.2 6.8 1.8-1.8-2.4-8.4L19.8 7c1.1-1.1 1.3-2.6.5-3.4Z"/>',
 phone:'<rect x="6.5" y="2" width="11" height="20" rx="2.5"/><path d="M10.5 18.5h3"/>',
 trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
 map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z"/><path d="M9 4v14M15 6v14"/>',
 check:'<path d="M5 12.5l4.2 4.2L19 7"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 star:'<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.5 1.1 6.3L12 17.3l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9Z"/>',
 sun:'<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
};
function icon(name,size=20,sw=1.9){const s=el("span",{class:"ico","aria-hidden":"true"});s.innerHTML=`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[name]||""}</svg>`;return s}
const CATS=[["stays","Stays",40,"bed"],["transport","Transport",20,"train"],["food","Food",20,"food"],["experiences","Experiences",15,"ticket"],["other","Other",5,"bag"]];
const CATNAME=Object.fromEntries(CATS.map(c=>[c[0],c[1]]));
const CATICON=Object.fromEntries(CATS.map(c=>[c[0],c[3]]));
const AV_COLORS=["#2a66b0","#d3322a","#1d6a4e","#b0661a","#7046b0","#1f7f8f"];

/* ---------- the hero poster: an alpine scene drawn in SVG ---------- */
function heroScene(){return `<svg class="scene" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-top)"/><stop offset="1" style="stop-color:var(--sky-bot)"/></linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--lake)"/><stop offset="1" style="stop-color:var(--mtn2)"/></linearGradient></defs>
<rect width="1200" height="420" fill="url(#sky)"/>
<circle cx="980" cy="96" r="44" style="fill:var(--sun)" opacity=".95"/>
<g style="fill:var(--snow)" opacity=".75"><ellipse cx="760" cy="70" rx="70" ry="14"/><ellipse cx="810" cy="58" rx="40" ry="14"/><ellipse cx="300" cy="96" rx="60" ry="11"/></g>
<g style="stroke:var(--ink)" fill="none" opacity=".55"><path d="M120 70 C220 40 300 60 380 46" stroke-dasharray="6 7" stroke-width="2"/></g>
<g transform="translate(386 34) rotate(-12) scale(1.3)" style="fill:var(--ink)" opacity=".7"><path d="M0 8 L26 6 L34 0 L37 1 L33 7 L44 7 C47 7 47 10 44 10 L33 10 L37 16 L34 17 L26 11 L0 10Z"/></g>
<path d="M0 300 L110 214 L200 262 L330 150 L450 252 L560 196 L680 262 L800 142 L930 244 L1040 184 L1200 252 L1200 420 L0 420Z" style="fill:var(--mtn3)"/>
<path d="M330 150 L303 175 L318 170 L331 182 L346 169 L360 174Z M1040 184 L1020 202 L1032 199 L1041 208 L1052 199 L1062 201Z" style="fill:var(--snow)"/>
<path d="M0 340 L130 282 L250 322 L370 274 L500 344 L600 300 L700 326 L776 214 L798 196 L828 236 L900 296 L1010 350 L1200 322 L1200 420 L0 420Z" style="fill:var(--mtn2)"/>
<path d="M776 214 L798 196 L828 236 L812 231 L803 244 L790 230 L768 236Z M370 274 L352 288 L364 285 L373 294 L384 285 L394 288Z" style="fill:var(--snow)"/>
<rect y="356" width="1200" height="64" fill="url(#lake)"/>
<g style="stroke:var(--snow)" stroke-width="2" opacity=".45" fill="none"><path d="M80 380h60M220 392h90M520 378h70M760 396h80M980 384h60"/></g>
<g style="fill:var(--mtn2)" opacity=".9"><path d="M120 356 h330 v-6 h-330Z"/></g>
<g style="fill:none;stroke:var(--mtn2)" stroke-width="7"><path d="M130 356 v-30 M190 356 a30 30 0 0 1 60 0 M250 356 a30 30 0 0 1 60 0 M310 356 a30 30 0 0 1 60 0 M370 356 a30 30 0 0 1 60 0 M130 326 h310"/></g>
<g><rect x="168" y="304" width="62" height="20" rx="5" style="fill:var(--red)"/><rect x="234" y="304" width="62" height="20" rx="5" style="fill:var(--red)"/><rect x="300" y="304" width="62" height="20" rx="5" style="fill:var(--red)"/>
<g style="fill:var(--snow)"><rect x="176" y="309" width="12" height="7" rx="2"/><rect x="194" y="309" width="12" height="7" rx="2"/><rect x="212" y="309" width="10" height="7" rx="2"/><rect x="242" y="309" width="12" height="7" rx="2"/><rect x="260" y="309" width="12" height="7" rx="2"/><rect x="278" y="309" width="10" height="7" rx="2"/><rect x="308" y="309" width="12" height="7" rx="2"/><rect x="326" y="309" width="12" height="7" rx="2"/><rect x="344" y="309" width="10" height="7" rx="2"/></g></g>
<path d="M0 392 Q220 350 460 384 T900 378 T1200 368 L1200 420 L0 420Z" style="fill:var(--mtn1)"/>
<g style="fill:var(--tree)">${[[40,390],[70,384],[100,392],[1080,378],[1110,370],[1140,376],[1170,368],[640,394],[668,388]].map(([x,y],i)=>`<path d="M${x} ${y-44-i%3*8} L${x+16} ${y} L${x-16} ${y}Z"/>`).join("")}</g>
</svg>`}

/* ---------- attraction illustrations (one style, picked by what the place is) ---------- */
function kindOf(a){const t=(a.name+" "+(a.why||"")).toLowerCase();
  if(/paraglid|adventure|zipline|ski|bungee|raft/.test(t))return "adventure";
  if(/waterfall|falls|gorge|canyon/.test(t))return "falls";
  if(/railway|train|cogwheel|express/.test(t))return "train";
  if(/lake|cruise|boat|sea|beach|river|harbor|harbour/.test(t))return "lake";
  if(/bridge/.test(t))return "bridge";
  if(/chocolate|food|market|cheese|fondue|wine/.test(t))return "food";
  if(/old town|cathedral|church|basilica|temple|altstadt|grossm|notre|abbey|mosque/.test(t))return "oldtown";
  if(/museum|gallery|kunsthaus|art |palace|louvre|orsay/.test(t))return "museum";
  if(/tower|eiffel|monument|statue|lion/.test(t))return "monument";
  if(/mount|peak|glacier|jungfrau|matterhorn|kulm|rigi|pilatus|summit|hike|walk|trail|valley/.test(t))return "mountain";
  return "city";}
const ART_SKIES=[["#9fd0f5","#eef7ff"],["#f6c89a","#fde9d4"],["#b9d7c6","#eef7f1"],["#c7c1f0","#f0eefc"],["#f3b7a6","#fde6df"]];
function attrArt(a,i){
  const [s1,s2]=ART_SKIES[i%ART_SKIES.length],k=kindOf(a),id="g"+Math.random().toString(36).slice(2,7);
  const base=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs><rect width="320" height="180" fill="url(#${id})"/><circle cx="262" cy="42" r="18" fill="#f5c04e" opacity=".9"/>`;
  const hills=`<path d="M0 132 L60 96 L110 120 L170 78 L230 118 L320 92 L320 180 L0 180Z" fill="#9db9d8"/>`;
  const ground=`<path d="M0 160 Q90 140 170 156 T320 150 L320 180 L0 180Z" fill="#3f7a5f"/>`;
  const art={
   mountain:`<path d="M0 150 L90 60 L130 100 L190 40 L260 120 L320 90 L320 180 L0 180Z" fill="#6f93bb"/><path d="M190 40 L172 64 L184 60 L192 70 L202 60 L210 64Z M90 60 L76 76 L86 74 L93 82 L101 74 L108 77Z" fill="#fff"/><path d="M40 70 L280 30" stroke="#14233a" stroke-width="1.5"/><rect x="150" y="44" width="16" height="12" rx="2" fill="#d3322a"/>${ground}`,
   lake:`${hills}<rect y="122" width="320" height="58" fill="#4f8fcf"/><path d="M30 140h40M120 152h60M220 138h50" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M150 132 L176 132 L170 140 L156 140Z" fill="#fff"/><path d="M163 132 V104 L180 128Z" fill="#fff"/><path d="M163 104 V132" stroke="#14233a" stroke-width="1.5"/>`,
   oldtown:`${hills}<g fill="#f1e5d0" stroke="#14233a" stroke-width="1.2"><path d="M20 160 V112 L45 92 L70 112 V160Z"/><path d="M70 160 V120 L92 102 L114 120 V160Z"/><path d="M200 160 V116 L224 96 L248 116 V160Z"/><path d="M248 160 V124 L270 106 L292 124 V160Z"/><path d="M128 160 V84 H186 V160Z"/></g><path d="M134 84 L157 40 L180 84Z" fill="#d3322a"/><g fill="#d3322a"><path d="M20 112 L45 92 L70 112Z"/><path d="M200 116 L224 96 L248 116Z"/></g><g fill="#2a66b0"><rect x="150" y="100" width="14" height="18" rx="7"/><rect x="38" y="124" width="12" height="12"/><rect x="216" y="128" width="12" height="12"/></g><rect y="160" width="320" height="20" fill="#9a8f80"/>`,
   museum:`${hills}<path d="M70 70 L160 36 L250 70Z" fill="#f1e5d0" stroke="#14233a" stroke-width="1.5"/><rect x="74" y="70" width="172" height="10" fill="#f1e5d0" stroke="#14233a" stroke-width="1.5"/><g fill="#f1e5d0" stroke="#14233a" stroke-width="1.5">${[86,116,146,176,206,232].map(x=>`<rect x="${x}" y="80" width="12" height="62"/>`).join("")}</g><rect x="64" y="142" width="192" height="12" fill="#f1e5d0" stroke="#14233a" stroke-width="1.5"/><rect y="154" width="320" height="26" fill="#3f7a5f"/>`,
   bridge:`${hills}<rect y="128" width="320" height="52" fill="#4f8fcf"/><path d="M0 120 L320 104 L320 116 L0 132Z" fill="#a0602e"/><path d="M0 120 L320 104 L320 96 L0 112Z" fill="#d3322a"/><g stroke="#6b3e1c" stroke-width="3">${[30,80,130,180,230,280].map(x=>`<path d="M${x} ${131-x*.05} V${150}"/>`).join("")}</g><path d="M230 100 V62 L246 46 L262 62 V96Z" fill="#f1e5d0" stroke="#14233a" stroke-width="1.2"/><path d="M230 62 L246 40 L262 62Z" fill="#a0602e"/>`,
   food:`<rect y="110" width="320" height="70" fill="#d3322a"/><g fill="#fff" opacity=".85">${Array.from({length:16},(_,j)=>`<rect x="${j*20}" y="${110+(j%2)*18}" width="20" height="18"/><rect x="${j*20}" y="${146+(j%2)*18}" width="20" height="18"/>`).join("")}</g><ellipse cx="160" cy="118" rx="70" ry="16" fill="#fff" stroke="#14233a" stroke-width="1.5"/><path d="M110 112 Q160 60 210 112Z" fill="#7a4a2a"/><path d="M130 70 q8 -14 0 -26 M160 62 q8 -14 0 -26 M190 70 q8 -14 0 -26" stroke="#fff" stroke-width="3" fill="none"/>`,
   adventure:`<path d="M0 150 L80 80 L140 120 L210 60 L320 130 L320 180 L0 180Z" fill="#6f93bb"/><path d="M210 60 L194 80 L206 76 L214 86 L224 76 L232 80Z" fill="#fff"/>${ground}<path d="M110 50 Q160 20 210 50 Q160 40 110 50Z" fill="#d3322a"/><path d="M114 50 L156 96 M206 50 L164 96 M160 32 L160 96" stroke="#14233a" stroke-width="1"/><circle cx="160" cy="100" r="5" fill="#14233a"/>`,
   falls:`<path d="M0 0 H120 V180 H0Z M200 0 H320 V180 H200Z" fill="#6f93bb"/><path d="M120 20 H200 V140 H120Z" fill="#cfe6fb"/><path d="M135 20 V140 M155 20 V140 M175 20 V140 M190 20 V140" stroke="#fff" stroke-width="5" opacity=".9"/><ellipse cx="160" cy="146" rx="70" ry="14" fill="#4f8fcf"/>${ground}`,
   train:`<path d="M0 140 L90 70 L150 110 L220 50 L320 120 L320 180 L0 180Z" fill="#6f93bb"/><path d="M220 50 L204 70 L216 66 L224 76 L234 66 L242 70Z" fill="#fff"/>${ground}<path d="M0 150 L320 120" stroke="#14233a" stroke-width="3"/><g transform="rotate(-5.4 160 140)"><rect x="90" y="122" width="56" height="22" rx="6" fill="#d3322a"/><rect x="150" y="122" width="56" height="22" rx="6" fill="#d3322a"/><g fill="#fff"><rect x="98" y="127" width="12" height="8" rx="2"/><rect x="116" y="127" width="12" height="8" rx="2"/><rect x="158" y="127" width="12" height="8" rx="2"/><rect x="176" y="127" width="12" height="8" rx="2"/></g></g>`,
   monument:`${hills}<path d="M160 20 L178 150 H142Z" fill="#7a6a5a"/><path d="M146 110 H174 M150 80 H170 M154 54 H166" stroke="#f1e5d0" stroke-width="3"/>${ground}`,
   city:`${hills}<g fill="#f1e5d0" stroke="#14233a" stroke-width="1.2"><rect x="40" y="90" width="40" height="70"/><rect x="90" y="70" width="36" height="90"/><rect x="134" y="100" width="44" height="60"/><rect x="186" y="60" width="34" height="100"/><rect x="228" y="96" width="48" height="64"/></g><g fill="#2a66b0">${[[50,100],[62,100],[98,82],[110,82],[194,74],[206,74],[238,108],[256,108]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="9"/>`).join("")}</g>${ground}`,
  };
  return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${base}${art[k]||art.city}</svg>`;
}
function annaAvatar(size=56){return `<svg width="${size*.62}" height="${size*.62}" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20l1-4.4A8.5 8.5 0 1 1 20.5 11.5Z" fill="#fff"/><path d="M10.6 7.4h2.8v2.8h2.8V13h-2.8v2.8h-2.8V13H7.8v-2.8h2.8Z" fill="#d3322a"/></svg>`}
