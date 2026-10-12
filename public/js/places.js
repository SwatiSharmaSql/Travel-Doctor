/* ================= PLACE POSTCARDS: cartoon landmarks for where you fly from and to ================= */
// Each scene is drawn in a 300 x 180 box. placeKind() picks one from a city, airport or country name.
const RM=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const anim=x=>RM?"":x;
/* tiny SMIL animation helpers (skipped when the viewer prefers reduced motion) */
const aMove=(vals,dur,extra="")=>anim(`<animateTransform attributeName="transform" type="translate" additive="sum" values="${vals}" dur="${dur}s" repeatCount="indefinite" ${extra}/>`);
const aRot=(vals,dur)=>anim(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="${vals}" dur="${dur}s" repeatCount="indefinite"/>`);
const aBlink=(dur,begin=0,vals="1;.15;1")=>anim(`<animate attributeName="opacity" values="${vals}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`);
const P_SKY={day:["#7cc4f5","#dff2ff"],warm:["#ff9f5a","#ffe1b0"],pink:["#f7a8c4","#ffe6ee"],peach:["#ffc59a","#fff1df"],grey:["#9fb8cf","#e7eef5"],dusk:["#6f7fd6","#ffd1b0"]};
const pSky=(k,id)=>{const[a,b]=P_SKY[k];return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="180" fill="url(#${id})"/>`};
const pSun=(x,y,r=22,c="#ffd65c")=>`<circle cx="${x}" cy="${y}" r="${r+8}" fill="${c}" opacity=".25">${anim(`<animate attributeName="r" values="${r+4};${r+12};${r+4}" dur="4s" repeatCount="indefinite"/>`)}</circle><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const pCloud=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="26" ry="9"/><ellipse cx="12" cy="-6" rx="15" ry="9"/>${aMove("0 0;26 0;0 0",9+x%7)}</g>`;
const pPalm=(x,y,h=70)=>`<g><path d="M${x} ${y} q-8 ${-h/2} 5 ${-h}" stroke="#7a5230" stroke-width="5" fill="none" stroke-linecap="round"/><g transform="translate(${x+5} ${y-h})" stroke="#2f8a52" stroke-width="6" fill="none" stroke-linecap="round"><path d="M0 0 q-18 -12 -32 2"/><path d="M0 0 q-14 -20 -26 -18"/><path d="M0 0 q4 -22 16 -24"/><path d="M0 0 q18 -12 32 2"/><path d="M0 0 q20 2 26 16"/>${aRot("-5;5;-5",3+x%3)}</g></g>`;
const pSkyline=(c="#7b93b5",base=165)=>{let s="",x=0;const hs=[40,62,30,78,50,92,36,58,70,44,84,38,56];for(let i=0;x<300;i++){const w=18+(i*7)%14,h=hs[i%hs.length];s+=`<rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="${c}"/>`;x+=w+3}return s};
const pWindows=(x,y,cols,rows,dx=8,dy=10)=>{let s="";for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)s+=`<rect x="${x+i*dx}" y="${y+j*dy}" width="4" height="5" fill="#ffe7a3" opacity=".85"/>`;return s};
const pPine=(x,y,h=30,c="#2c6b47")=>`<path d="M${x} ${y-h} L${x+h*.4} ${y} L${x-h*.4} ${y}Z" fill="${c}"/>`;
const pWater=(y=150,c="#3e8fd0")=>`<rect y="${y}" width="300" height="${180-y}" fill="${c}"/><g stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"><path d="M30 ${y+12}h26M120 ${y+20}h34M220 ${y+10}h28"/>${aMove("0 0;14 0;0 0",4)}</g>`;

const PLACES={
 hollywood:id=>`${pSky("warm",id)}${pSun(232,58,30)}
  <path d="M0 118 Q70 62 150 92 Q215 58 300 96 L300 180 L0 180Z" fill="#c08a52"/><path d="M0 150 Q90 118 170 142 T300 136 L300 180 L0 180Z" fill="#8f6a3c"/>
  <g transform="rotate(-5 150 96)"><text x="150" y="104" text-anchor="middle" font-size="27" font-weight="900" fill="#fff" letter-spacing="3" style="font-family:var(--f-d)">HOLLYWOOD</text>
  <g stroke="#8f6a3c" stroke-width="2">${[...Array(9)].map((_,i)=>`<path d="M${66+i*21} 106 v10"/>`).join("")}</g></g>
  ${pPalm(20,182,46)}${pPalm(282,182,44)}${pPalm(262,182,32)}`,
 dallas:id=>`${pSky("day",id)}${pCloud(70,40)}${pSkyline("#8aa3c4",160)}
  <rect x="196" y="66" width="12" height="96" fill="#cfd8e3"/><rect x="190" y="70" width="5" height="92" fill="#b5c2d2"/><rect x="209" y="70" width="5" height="92" fill="#b5c2d2"/>
  <circle cx="202" cy="54" r="26" fill="#eef3f9" stroke="#7f93ad" stroke-width="2"/>
  <g fill="#ffc94d">${[[-14,-10],[0,-14],[14,-10],[-18,2],[-6,0],[6,0],[18,2],[-12,13],[0,15],[12,13]].map(([a,b])=>`<circle cx="${202+a}" cy="${54+b}" r="2.6"/>`).join("")}</g>
  <rect y="160" width="300" height="20" fill="#6fae6f"/>`,
 nyc:id=>`${pSky("day",id)}${pCloud(240,36)}${pSkyline("#93a7c2",150)}${pWater(150)}
  <path d="M118 150 L124 126 L176 126 L182 150Z" fill="#c9b48a"/><rect x="128" y="112" width="44" height="14" fill="#b9a273"/>
  <path d="M136 112 L150 58 L164 112Z" fill="#5fb3a1"/><circle cx="150" cy="54" r="8" fill="#5fb3a1"/>
  <g stroke="#5fb3a1" stroke-width="3" stroke-linecap="round"><path d="M150 46 v-8M144 48 l-5 -6M156 48 l5 -6M141 53 h-7M159 53 h7"/><path d="M158 66 L166 26" stroke-width="6"/></g>
  <path d="M166 24 q-6 -8 0 -16 q6 8 0 16Z" fill="#ff9d2e"/><rect x="134" y="72" width="8" height="14" fill="#4c9a89"/>`,
 sf:id=>`${pSky("day",id)}<path d="M0 120 Q60 90 120 118 L120 150 L0 150Z" fill="#7fae6c"/>${pWater(132,"#3a84c4")}
  <g fill="#d9472b"><rect x="78" y="38" width="12" height="104"/><rect x="208" y="38" width="12" height="104"/><rect y="116" width="300" height="8"/><rect x="74" y="58" width="20" height="5"/><rect x="204" y="58" width="20" height="5"/></g>
  <path d="M0 64 Q42 118 84 40 Q150 120 214 40 Q258 118 300 64" stroke="#d9472b" stroke-width="3" fill="none"/>
  <g stroke="#d9472b" stroke-width="1.2">${[20,40,60,104,124,144,164,184,236,256,276].map(x=>`<path d="M${x} 116 v${-Math.max(8,40-Math.abs((x%130)-65)*.5)}"/>`).join("")}</g>
  <g fill="#fff" opacity=".75"><ellipse cx="250" cy="100" rx="60" ry="10"/><ellipse cx="40" cy="96" rx="44" ry="8"/></g>`,
 seattle:id=>`${pSky("day",id)}<path d="M150 150 L230 50 L310 150Z" fill="#9aaec4"/><path d="M216 68 L230 50 L246 70 L236 66 L228 74Z" fill="#fff"/>${pSkyline("#8aa0bc",160)}
  <g stroke="#e8edf3" stroke-width="5" stroke-linecap="round"><path d="M118 160 L130 76M142 160 L130 76"/></g><rect x="128" y="20" width="4" height="40" fill="#e8edf3"/>
  <ellipse cx="130" cy="72" rx="34" ry="8" fill="#f2f5f9" stroke="#7f93ad" stroke-width="1.5"/><ellipse cx="130" cy="64" rx="18" ry="6" fill="#ffb347"/>
  <rect y="160" width="300" height="20" fill="#4f8c5e"/>${pPine(20,162,34)}${pPine(44,162,28)}${pPine(270,162,30)}`,
 washington:id=>`${pSky("day",id)}${pCloud(70,40)}<rect y="150" width="300" height="30" fill="#7cb36f"/><rect x="40" y="140" width="220" height="12" fill="#5d9be0" opacity=".7"/>
  <path d="M140 150 L144 34 L150 22 L156 34 L160 150Z" fill="#f1ece2" stroke="#c9bfae"/><g fill="#d24d4d"><rect x="90" y="132" width="4" height="18"/><rect x="206" y="132" width="4" height="18"/></g>`,
 phoenix:id=>`${pSky("warm",id)}${pSun(70,60,26)}<path d="M0 150 Q100 120 200 140 T300 132 L300 180 L0 180Z" fill="#e0a86b"/><path d="M0 180 L0 162 Q150 146 300 166 L300 180Z" fill="#c7864a"/>
  <g fill="#3f8b55"><rect x="180" y="62" width="18" height="100" rx="9"/><path d="M180 112 h-18 a8 8 0 0 1 -8 -8 v-28 a8 8 0 0 1 16 0 v20 h10Z"/><path d="M198 96 h16 v-26 a8 8 0 0 1 16 0 v32 a8 8 0 0 1 -8 8 h-24Z"/></g>`,
 miami:id=>`${pSky("pink",id)}${pSun(150,104,34,"#ffcf6b")}${pWater(118,"#2fb3c7")}<path d="M0 150 Q150 136 300 150 L300 180 L0 180Z" fill="#f4dca8"/>${pPalm(50,170,90)}${pPalm(250,172,76)}`,
 denver:id=>`${pSky("day",id)}<path d="M0 140 L60 60 L110 120 L170 40 L240 120 L300 70 L300 180 L0 180Z" fill="#8ba3c0"/><path d="M160 54 L170 40 L182 58 L172 54Z M52 70 L60 60 L70 74Z" fill="#fff"/>${pSkyline("#64809f",165)}<rect y="165" width="300" height="15" fill="#6aa86b"/>`,
 london:id=>`${pSky("grey",id)}${pCloud(60,36)}${pCloud(240,50,.8)}
  <rect x="132" y="56" width="36" height="110" fill="#d8b26b"/><rect x="128" y="56" width="44" height="8" fill="#b88f47"/>
  <circle cx="150" cy="82" r="13" fill="#fdf8ea" stroke="#8a6a32" stroke-width="2"/><path d="M150 82 v-8" stroke="#333" stroke-width="2" stroke-linecap="round">${anim('<animateTransform attributeName="transform" type="rotate" values="0 150 82;360 150 82" dur="12s" repeatCount="indefinite"/>')}</path><path d="M150 82 l6 3" stroke="#333" stroke-width="2" stroke-linecap="round"/>
  <path d="M130 56 L150 14 L170 56Z" fill="#5f7a6a"/><rect x="149" y="4" width="2" height="12" fill="#5f7a6a"/>
  ${pWindows(138,104,3,5,9,11)}<rect y="166" width="300" height="14" fill="#8a96a6"/>
  <g><rect x="198" y="128" width="78" height="38" rx="6" fill="#d8312b"/>${[204,222,240,258].map(x=>`<rect x="${x}" y="134" width="13" height="10" rx="2" fill="#dceaf6"/>`).join("")}<circle cx="214" cy="167" r="6" fill="#333"/><circle cx="262" cy="167" r="6" fill="#333"/>${aMove("0 0;-300 0",8,'keyTimes="0;1"')}</g>`,
 paris:id=>`${pSky("pink",id)}${pCloud(240,44)}<rect y="160" width="300" height="20" fill="#86b779"/>
  <path d="M150 14 L156 64 L170 112 L190 162 L170 162 Q150 128 130 162 L110 162 L130 112 L144 64Z" fill="#6b5844"/>
  <g stroke="#f7e6d6" stroke-width="1.4" opacity=".7"><path d="M146 64 L162 112M154 64 L138 112M136 112 L170 158M164 112 L130 158"/></g>
  <rect x="134" y="62" width="32" height="5" fill="#4f4032"/><rect x="124" y="110" width="52" height="6" fill="#4f4032"/>`,
 dubai:id=>`${pSky("warm",id)}${pSun(70,56,24)}<path d="M0 150 Q80 128 160 146 T300 140 L300 180 L0 180Z" fill="#e7bf7d"/>
  <rect x="60" y="100" width="22" height="50" fill="#a9b9cc"/><rect x="214" y="92" width="26" height="58" fill="#a9b9cc"/>
  <path d="M138 150 L138 96 L142 96 L142 62 L146 62 L146 34 L149 34 L150 6 L151 34 L154 34 L154 62 L158 62 L158 96 L162 96 L162 150Z" fill="#c9d6e3" stroke="#8ea2b9"/>`,
 taj:id=>`${pSky("peach",id)}<rect x="40" y="140" width="220" height="12" fill="#e9dccb"/><rect x="110" y="152" width="80" height="28" fill="#7fb6e0"/>
  <rect x="100" y="98" width="100" height="44" fill="#fbf8f2" stroke="#d8cdbb"/><path d="M138 142 v-22 q12 -16 24 0 v22Z" fill="#cfc2ae"/>
  <path d="M118 98 Q116 56 150 44 Q184 56 182 98Z" fill="#fbf8f2" stroke="#d8cdbb"/><rect x="149" y="30" width="2" height="16" fill="#c9a24d"/>
  ${[[70,1],[226,1]].map(([x])=>`<rect x="${x}" y="70" width="6" height="72" fill="#fbf8f2" stroke="#d8cdbb"/><ellipse cx="${x+3}" cy="68" rx="6" ry="6" fill="#fbf8f2" stroke="#d8cdbb"/>`).join("")}
  <ellipse cx="112" cy="96" rx="9" ry="9" fill="#fbf8f2" stroke="#d8cdbb"/><ellipse cx="188" cy="96" rx="9" ry="9" fill="#fbf8f2" stroke="#d8cdbb"/>`,
 gateway:id=>`${pSky("warm",id)}${pSun(240,50,22)}${pWater(150,"#3f86c2")}
  <rect x="86" y="70" width="128" height="82" fill="#d9b886"/><path d="M128 152 v-44 q22 -30 44 0 v44Z" fill="#7a5a36"/>
  <g fill="#c49f6a">${[86,124,162,200].map(x=>`<rect x="${x}" y="54" width="14" height="18"/><circle cx="${x+7}" cy="52" r="7"/>`).join("")}</g>
  <path d="M96 100 q8 -12 16 0 v20 h-16Z M188 100 q8 -12 16 0 v20 h-16Z" fill="#a98352"/>`,
 temple:id=>`${pSky("warm",id)}${pSun(60,48,20)}<rect y="160" width="300" height="20" fill="#7fae6c"/>
  ${[[150,140,22,"#e7a045"],[150,118,20,"#f0b75a"],[150,98,20,"#e7a045"],[150,80,18,"#f0b75a"],[150,64,16,"#e7a045"]].map(([cx,w,h,c],i)=>`<rect x="${cx-w/2}" y="${160-(i+1)*20}" width="${w}" height="22" fill="${c}"/>`).join("")}
  <path d="M114 60 q36 -26 72 0Z" fill="#d6862f"/><rect x="148" y="38" width="4" height="10" fill="#c9a24d"/><circle cx="150" cy="36" r="4" fill="#ffd65c"/>
  <path d="M140 160 v-20 q10 -12 20 0 v20Z" fill="#7a4a1e"/>${pPalm(40,170,70)}${pPalm(262,170,60)}`,
 charminar:id=>`${pSky("peach",id)}<rect y="160" width="300" height="20" fill="#c9b18e"/>
  <rect x="104" y="80" width="92" height="80" fill="#e8d6b6"/><path d="M126 160 v-40 q24 -32 48 0 v40Z" fill="#9b7b52"/><rect x="104" y="80" width="92" height="10" fill="#d4bd96"/>
  ${[90,198].map(x=>`<rect x="${x}" y="40" width="12" height="120" fill="#dcc193"/><rect x="${x-3}" y="66" width="18" height="4" fill="#c9a874"/><rect x="${x-3}" y="100" width="18" height="4" fill="#c9a874"/><path d="M${x-2} 40 q8 -22 16 0Z" fill="#dcc193"/><rect x="${x+5}" y="14" width="2" height="10" fill="#c9a24d"/>`).join("")}`,
 toronto:id=>`${pSky("day",id)}${pSkyline("#8ea5c2",150)}${pWater(150,"#3d82c0")}
  <path d="M146 150 L148 50 L152 50 L154 150Z" fill="#d4dbe4"/><ellipse cx="150" cy="70" rx="16" ry="7" fill="#eef2f7" stroke="#7f93ad"/><rect x="149" y="10" width="2" height="40" fill="#b9c4d1"/>`,
 sydney:id=>`${pSky("day",id)}<path d="M180 120 Q240 60 300 120" stroke="#7d8da1" stroke-width="7" fill="none"/>${pWater(130,"#2f8fd0")}
  <rect x="60" y="126" width="150" height="10" fill="#e9dcc4"/>
  <g fill="#fbfbfb" stroke="#cfd6de"><path d="M72 126 Q86 84 116 70 L116 126Z"/><path d="M104 126 Q120 78 152 62 L150 126Z"/><path d="M142 126 Q158 90 184 82 L182 126Z"/><path d="M176 126 Q188 104 204 100 L204 126Z"/></g>`,
 tokyo:id=>`${pSky("pink",id)}<path d="M40 150 L120 60 L180 60 L260 150Z" fill="#7d94b8"/><path d="M104 78 L120 60 L180 60 L196 78 L176 72 L162 80 L148 72 L134 80 L120 72Z" fill="#fff"/>
  <rect y="150" width="300" height="30" fill="#8cc08a"/><g fill="#d63a2f"><rect x="96" y="104" width="8" height="58"/><rect x="196" y="104" width="8" height="58"/><path d="M80 96 Q150 88 220 96 L222 104 L78 104Z"/><rect x="88" y="114" width="124" height="6"/></g>
  <g fill="#f7a8c4">${[[30,120],[44,110],[56,124],[250,116],[264,106],[276,122]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9"/>`).join("")}</g>`,
 singapore:id=>`${pSky("dusk",id)}${pSkyline("#7383a8",140)}${pWater(140,"#3967b5")}
  <g fill="#e6ebf2"><rect x="96" y="70" width="22" height="72"/><rect x="140" y="70" width="22" height="72"/><rect x="184" y="70" width="22" height="72"/></g><path d="M84 66 L224 60 Q226 66 220 70 L88 72Z" fill="#cfd8e4"/>`,
 swiss:id=>`${pSky("day",id)}${pCloud(70,34)}<path d="M70 165 L160 22 L182 52 L250 165Z" fill="#8f9fb3"/><path d="M134 64 L160 22 L182 52 L170 50 L162 62 L150 54 L140 66Z" fill="#fff"/>
  <path d="M0 150 Q80 124 160 146 T300 140 L300 180 L0 180Z" fill="#6fb36b"/>
  <rect x="206" y="118" width="54" height="36" fill="#a5683a"/><path d="M198 120 L233 94 L268 120Z" fill="#6e3f20"/><rect x="226" y="132" width="12" height="22" fill="#6e3f20"/><rect x="212" y="126" width="10" height="9" fill="#ffe7a3"/><rect x="244" y="126" width="10" height="9" fill="#ffe7a3"/>
  <rect x="44" y="96" width="3" height="58" fill="#7a5230"/><rect x="47" y="96" width="30" height="30" fill="#d52b1e"/><path d="M59 102 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6Z" fill="#fff"/>
  ${pPine(20,160,30)}${pPine(286,158,26)}`,
 parthenon:id=>`${pSky("day",id)}${pSun(250,46,20)}<path d="M0 150 Q150 120 300 150 L300 180 L0 180Z" fill="#c9b58e"/>
  <rect x="70" y="132" width="160" height="10" fill="#efe6d2"/><rect x="62" y="142" width="176" height="10" fill="#e3d7bd"/>
  <g fill="#f6efe0">${[80,104,128,152,176,200].map(x=>`<rect x="${x}" y="84" width="12" height="48"/>`).join("")}</g>
  <rect x="72" y="76" width="156" height="8" fill="#efe6d2"/><path d="M72 76 L150 50 L228 76Z" fill="#f6efe0"/>
  <g fill="#6f8f4a"><circle cx="34" cy="132" r="14"/><circle cx="48" cy="124" r="11"/></g><rect x="38" y="134" width="4" height="18" fill="#7a5230"/>`,
 santorini:id=>`${pSky("day",id)}${pWater(118,"#2b6fc6")}<path d="M0 108 L130 96 L300 112 L300 180 L0 180Z" fill="#e9ddc8"/>
  ${[[30,120,40,30],[78,110,46,36],[130,124,40,30],[178,112,46,40],[232,126,44,30]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#dfe4ea"/><rect x="${x+w/2-5}" y="${y+h-14}" width="10" height="14" fill="#2c66b8"/>`).join("")}
  <path d="M92 110 a14 14 0 0 1 28 0Z M192 112 a16 16 0 0 1 32 0Z" fill="#2c66b8"/><rect x="204" y="86" width="3" height="10" fill="#fff"/>`,
 colosseum:id=>`${pSky("warm",id)}<rect y="156" width="300" height="24" fill="#c9b58e"/>
  <path d="M50 156 L50 70 Q150 50 250 70 L250 156Z" fill="#e2c597"/><path d="M180 64 Q220 66 250 70 L250 156 L200 156 L200 92Z" fill="#c9a676"/>
  ${[0,1,2].map(r=>[...Array(8)].map((_,i)=>`<path d="M${58+i*24} ${150-r*28} v-14 q8 -10 16 0 v14Z" fill="#9b7b52"/>`).join("")).join("")}`,
 generic:id=>`${pSky("day",id)}${pCloud(240,40)}${pSkyline("#8ea5c2",160)}<rect y="160" width="300" height="20" fill="#6fae6f"/>
  <path d="M150 120 c-20 -24 -24 -36 -24 -46 a24 24 0 0 1 48 0 c0 10 -4 22 -24 46Z" fill="#d3322a"/><circle cx="150" cy="74" r="9" fill="#fff"/>`,
};

/* ---------- moving bits layered on top of a scene ---------- */
const fxBirds=(y=40,dur=14,from=-30,to=330)=>`<g stroke="#3b4a5e" stroke-width="2" fill="none" stroke-linecap="round">${[0,14,26].map((d,i)=>`<path d="M${d} ${y+(i%2)*6} q5 -5 10 0 q5 -5 10 0">${anim(`<animate attributeName="d" values="M${d} ${y+(i%2)*6} q5 -5 10 0 q5 -5 10 0;M${d} ${y+(i%2)*6} q5 2 10 0 q5 2 10 0;M${d} ${y+(i%2)*6} q5 -5 10 0 q5 -5 10 0" dur=".7s" repeatCount="indefinite"/>`)}</path>`).join("")}${aMove(`${from} 0;${to} 0`,dur)}</g>`;
const fxBoat=(y,dur=12,c="#fff")=>`<g transform="translate(0 ${y})"><path d="M0 0 h34 l-6 8 h-22Z" fill="#7a4a1e"/><path d="M16 -2 v-26 l14 24Z" fill="${c}"/><path d="M14 -4 v-18 l-10 18Z" fill="#ffd65c"/>${aMove("-40 0;320 0",dur)}</g>`;
const fxSnow=(n=14,c="#fff")=>RM?"":`<g fill="${c}">${[...Array(n)].map((_,i)=>`<circle cx="${(i*53)%300}" cy="-6" r="${1.5+i%3}"><animate attributeName="cy" values="-6;186" dur="${4+i%5}s" begin="${-(i*.7)}s" repeatCount="indefinite"/><animate attributeName="cx" values="${(i*53)%300};${(i*53)%300+14};${(i*53)%300}" dur="3s" repeatCount="indefinite"/></circle>`).join("")}</g>`;
const fxPetals=()=>RM?"":`<g fill="#ff9ec1">${[...Array(10)].map((_,i)=>`<ellipse cx="${(i*37)%300}" cy="-6" rx="3" ry="2"><animate attributeName="cy" values="-6;186" dur="${5+i%4}s" begin="${-i*.8}s" repeatCount="indefinite"/><animate attributeName="cx" values="${(i*37)%300};${(i*37)%300+40}" dur="${5+i%4}s" begin="${-i*.8}s" repeatCount="indefinite"/></ellipse>`).join("")}</g>`;
const fxSparkle=(pts,c="#fff")=>`<g fill="${c}">${pts.map(([x,y],i)=>`<path d="M${x} ${y-6} L${x+1.5} ${y-1.5} L${x+6} ${y} L${x+1.5} ${y+1.5} L${x} ${y+6} L${x-1.5} ${y+1.5} L${x-6} ${y} L${x-1.5} ${y-1.5}Z">${aBlink(1.6,i*.4,"0;1;0")}</path>`).join("")}</g>`;
const fxBeams=(xs,y)=>`<g fill="#fff6c9" opacity=".35">${xs.map((x,i)=>`<path d="M${x} ${y} L${x-16} 0 L${x+16} 0Z">${anim(`<animateTransform attributeName="transform" type="rotate" values="${i?20:-20} ${x} ${y};${i?-20:20} ${x} ${y};${i?20:-20} ${x} ${y}" dur="${5+i}s" repeatCount="indefinite"/>`)}</path>`).join("")}</g>`;
const fxFlag=(x,y,w=26,h=18,swiss=true)=>`<rect x="${x-3}" y="${y}" width="3" height="${h+34}" fill="#7a5230"/><g transform="translate(${x} ${y})"><g><rect width="${w}" height="${h}" fill="#d52b1e"/>${swiss?`<path d="M${w/2-2.5} 3 h5 v${h/2-5.5} h${w/2-6} v5 h-${w/2-6} v${h/2-5.5} h-5 v-${h/2-5.5} h-${w/2-6} v-5 h${w/2-6}Z" fill="#fff"/>`:""}${anim(`<animateTransform attributeName="transform" type="skewY" values="0;6;0;-4;0" dur="2s" repeatCount="indefinite"/>`)}</g></g>`;
const fxTrain=(y,dur=10,c="#d52b1e")=>`<g transform="translate(0 ${y})">${[0,44].map(dx=>`<rect x="${dx}" y="-14" width="40" height="14" rx="4" fill="${c}"/><rect x="${dx+5}" y="-11" width="9" height="6" rx="1" fill="#dceaf6"/><rect x="${dx+17}" y="-11" width="9" height="6" rx="1" fill="#dceaf6"/><rect x="${dx+29}" y="-11" width="7" height="6" rx="1" fill="#dceaf6"/>`).join("")}${aMove("-100 0;320 0",dur)}</g>`;
const PLACE_FX={hollywood:()=>fxBeams([90,210],180)+fxSparkle([[70,82],[150,74],[230,70],[120,60]]),dallas:()=>`<g fill="#fff6a8">${[[-14,-10],[6,0],[0,15],[18,2]].map(([a,b],i)=>`<circle cx="${202+a}" cy="${54+b}" r="3">${aBlink(1.4,i*.35)}</circle>`).join("")}</g>`+fxBirds(30,16),
  nyc:()=>`<ellipse cx="166" cy="18" rx="5" ry="8" fill="#ffd65c" opacity=".7">${aBlink(.6,0,"1;.3;1")}</ellipse>`+fxBoat(166,14),sf:()=>`<g><rect x="0" y="110" width="16" height="7" rx="2" fill="#ffd65c"/>${aMove("-20 0;320 0",6)}</g>`+fxBirds(24,18),
  seattle:()=>`<circle cx="130" cy="20" r="3" fill="#ff4d4d">${aBlink(1)}</circle>`+fxBirds(36,15),washington:()=>fxBirds(30,14),phoenix:()=>`<g transform="translate(220 50)"><path d="M-12 0 q6 -6 12 0 q6 -6 12 0" stroke="#3b2a1a" stroke-width="2.5" fill="none">${aRot("0 0 20;360 0 20",9)}</path></g>`,
  miami:()=>fxBoat(130,12),denver:()=>fxSnow(12),paris:()=>fxSparkle([[150,40],[140,90],[160,110],[132,140],[168,130]],"#fff6a8"),dubai:()=>fxBirds(40,15),taj:()=>fxBirds(26,16),
  gateway:()=>fxBoat(160,11),temple:()=>fxBirds(30,13),charminar:()=>fxBirds(28,14),toronto:()=>fxBoat(162,13)+`<circle cx="150" cy="10" r="3" fill="#ff4d4d">${aBlink(1)}</circle>`,
  sydney:()=>fxBoat(150,12),tokyo:()=>fxPetals(),singapore:()=>fxBeams([110,190],66)+fxBoat(156,12),
  swiss:()=>`<path d="M0 40 L300 96" stroke="#555" stroke-width="1.2"/><g><rect x="-8" y="0" width="16" height="12" rx="3" fill="#d52b1e"/><path d="M0 0 v-6" stroke="#555"/><rect x="-5" y="3" width="10" height="5" fill="#dceaf6"/>${anim(`<animateMotion dur="9s" repeatCount="indefinite" path="M20 50 L280 98"/>`)}</g>`,
  parthenon:()=>fxBirds(30,15),santorini:()=>fxBoat(150,13),colosseum:()=>fxBirds(30,15),generic:()=>`<ellipse cx="150" cy="150" rx="12" ry="3" fill="#000" opacity=".15"/>`+fxBirds(30,16)};

/* ---------- more destinations ---------- */
Object.assign(PLACES,{
 jungfrau:id=>`${pSky("day",id)}${pCloud(60,30)}${pCloud(230,52,.8)}
  <path d="M0 120 L40 72 L70 92 L120 26 L170 80 L200 56 L240 90 L270 60 L300 84 L300 180 L0 180Z" fill="#e6eef7"/><path d="M120 26 L170 80 L150 74 L140 86 L122 60 L100 70Z M270 60 L300 84 L284 82Z M40 72 L70 92 L52 88Z" fill="#b9c9dc"/>
  <path d="M0 180 L0 150 Q90 122 180 150 T300 146 L300 180Z" fill="#f6f9fd"/><path d="M150 180 Q170 150 230 140 Q270 136 300 140 L300 180Z" fill="#dce8f4"/>
  <path d="M138 180 L156 104 L166 98 L178 104 L198 180Z" fill="#6b7787"/><rect x="146" y="82" width="40" height="22" fill="#cdd5de"/><rect x="146" y="90" width="40" height="5" fill="#7d93ad"/>
  <path d="M152 82 a12 12 0 0 1 24 0Z" fill="#eef2f6" stroke="#9aa9ba"/><rect x="163" y="64" width="2" height="8" fill="#9aa9ba"/>
  ${fxFlag(196,50,22,15)}<path d="M0 172 L300 160" stroke="#7a5230" stroke-width="2"/>${fxTrain(170,11)}${fxSnow(10)}`,
 lucerne:id=>`${pSky("day",id)}${pCloud(240,34)}<path d="M0 110 L60 60 L100 80 L150 34 L210 90 L300 70 L300 180 L0 180Z" fill="#8fa6c0"/><path d="M136 46 L150 34 L162 48 L152 46Z" fill="#fff"/>${pWater(118,"#3a8fd0")}
  <path d="M0 140 L300 112 L300 122 L0 150Z" fill="#8a5a2b"/><path d="M0 132 L300 104 L300 112 L0 140Z" fill="#c0603a"/>${[20,60,100,140,180,220,260].map(x=>`<rect x="${x}" y="${146-x*.093}" width="3" height="${26}" fill="#6b4420"/>`).join("")}
  <g fill="#e94b7a">${[30,70,110,150,190,230].map(x=>`<circle cx="${x}" cy="${138-x*.093}" r="2.4"/>`).join("")}</g>
  <path d="M196 110 L196 64 L206 54 L216 64 L216 110Z" fill="#c9a675"/><path d="M194 66 L206 44 L218 66Z" fill="#a0532d"/>
  <g><path d="M0 0 q8 -10 6 -18 q-2 -4 -6 -2 q4 2 2 8 q-8 4 -12 12Z" fill="#fff" stroke="#ddd"/>${aMove("40 160;120 162;40 160",14)}</g>`,
 interlaken:id=>`${pSky("day",id)}<path d="M0 130 L70 40 L120 100 L170 30 L240 110 L300 60 L300 180 L0 180Z" fill="#9aaec6"/><path d="M58 56 L70 40 L84 60 L72 56Z M158 46 L170 30 L184 52 L170 46Z" fill="#fff"/>
  <path d="M0 150 Q100 126 200 146 T300 140 L300 180 L0 180Z" fill="#6fb36b"/>${pPine(30,160,30)}${pPine(270,156,28)}<rect x="110" y="132" width="34" height="22" fill="#a5683a"/><path d="M104 134 L127 116 L150 134Z" fill="#6e3f20"/>
  ${[["#ff7a3d",80,50,0],["#2f9be0",200,34,1],["#ffd23d",250,70,2]].map(([c,x,y,i])=>`<g transform="translate(${x} ${y})"><path d="M-18 0 q18 -12 36 0 q-18 -4 -36 0Z" fill="${c}"/><path d="M-16 0 L0 22 L16 0" stroke="#555" stroke-width=".8" fill="none"/><circle cx="0" cy="24" r="3" fill="#333"/>${aMove(`0 0;${i%2?-14:16} ${8-i*3};0 0`,6+i*2)}</g>`).join("")}`,
 zurich:id=>`${pSky("day",id)}<path d="M0 104 L50 80 L90 96 L140 70 L200 92 L260 74 L300 90 L300 120 L0 120Z" fill="#c8d5e4"/>${pWater(126,"#3d8ccc")}
  <rect x="120" y="70" width="18" height="58" fill="#e7dcc7"/><rect x="152" y="70" width="18" height="58" fill="#e7dcc7"/><rect x="112" y="96" width="66" height="32" fill="#efe6d4"/>
  <path d="M120 70 L129 52 L138 70Z M152 70 L161 52 L170 70Z" fill="#7a8a6a"/><circle cx="129" cy="80" r="4" fill="#5d6b4f"/><circle cx="161" cy="80" r="4" fill="#5d6b4f"/>
  ${pWindows(118,104,7,2,8,10)}<rect x="60" y="104" width="40" height="24" fill="#f3d9b6"/><rect x="194" y="100" width="44" height="28" fill="#f7e2c2"/><path d="M60 104 L80 92 L100 104Z M194 100 L216 88 L238 100Z" fill="#b65a34"/>
  <g transform="translate(0 150)"><path d="M0 0 h50 l-6 8 h-38Z" fill="#fff"/><rect x="12" y="-8" width="26" height="8" fill="#e8eef6"/><rect x="22" y="-14" width="4" height="6" fill="#d52b1e"/>${aMove("-60 0;320 0",15)}</g>`,
 neuschwanstein:id=>`${pSky("day",id)}${pCloud(70,30)}<path d="M0 120 Q80 70 160 110 T300 96 L300 180 L0 180Z" fill="#5e9a5e"/><path d="M0 150 Q100 130 200 150 T300 146 L300 180 L0 180Z" fill="#3f7a46"/>
  <rect x="110" y="70" width="80" height="50" fill="#f3efe6"/><rect x="96" y="56" width="18" height="64" fill="#f8f5ee"/><rect x="180" y="62" width="16" height="58" fill="#f8f5ee"/><rect x="140" y="40" width="16" height="40" fill="#f8f5ee"/>
  <path d="M94 56 L105 30 L116 56Z M178 62 L188 40 L198 62Z M138 40 L148 14 L158 40Z M110 70 L150 54 L190 70Z" fill="#3a5f9e"/>${pWindows(120,82,7,3,9,11)}${fxFlag(150,2,14,10,false)}
  ${pPine(30,150,40)}${pPine(56,154,34)}${pPine(250,150,36)}${pPine(276,154,30)}${fxBirds(30,16)}`,
 berlin:id=>`${pSky("grey",id)}${pCloud(240,40)}<rect y="158" width="300" height="22" fill="#9aa4b0"/>
  <rect x="70" y="72" width="160" height="16" fill="#e2d6b8"/><rect x="66" y="88" width="168" height="8" fill="#d4c6a3"/>
  <g fill="#ede3c8">${[74,100,126,154,180,206].map(x=>`<rect x="${x}" y="96" width="14" height="62"/>`).join("")}</g>
  <path d="M136 72 L136 60 L164 60 L164 72Z" fill="#7d8c6a"/><path d="M140 60 q10 -18 20 0Z" fill="#6b7a58"/>${fxBirds(30,15)}`,
 amsterdam:id=>`${pSky("day",id)}${pCloud(80,30)}<rect y="130" width="300" height="50" fill="#6fb36b"/>
  ${["#e9435a","#ffd23d","#ff8a3d","#e9435a","#c04de0"].map((c,i)=>`<rect y="${136+i*9}" width="300" height="5" fill="${c}"/>`).join("")}
  <path d="M130 136 L138 70 L162 70 L170 136Z" fill="#7a5a3a"/><path d="M134 72 L150 52 L166 72Z" fill="#4a3a2a"/><rect x="144" y="116" width="12" height="20" fill="#3a2a1a"/>
  <g transform="translate(150 66)"><g fill="#f5efe2" stroke="#7a5a3a" stroke-width="1.5">${[0,90,180,270].map(a=>`<rect x="-3" y="-56" width="6" height="56" transform="rotate(${a})"/><rect x="3" y="-54" width="10" height="44" transform="rotate(${a})"/>`).join("")}</g>${anim(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="8s" repeatCount="indefinite"/>`)}<circle r="5" fill="#4a3a2a"/></g>`,
 spain:id=>`${pSky("warm",id)}${pSun(250,46,20)}<rect y="158" width="300" height="22" fill="#d9b886"/>
  <g fill="#d7b98a">${[[96,60],[118,34],[140,20],[160,20],[182,34],[204,60]].map(([x,y])=>`<path d="M${x-8} 158 L${x-8} ${y+20} Q${x} ${y-14} ${x+8} ${y+20} L${x+8} 158Z"/>`).join("")}</g>
  <rect x="86" y="110" width="128" height="48" fill="#c9a676"/><path d="M134 158 v-30 q16 -20 32 0 v30Z" fill="#7a5a36"/>${fxBirds(30,15)}`,
 egypt:id=>`${pSky("warm",id)}${pSun(240,50,24)}<rect y="150" width="300" height="30" fill="#e8c27e"/>
  <path d="M40 150 L100 80 L160 150Z" fill="#d9a85a"/><path d="M100 80 L160 150 L130 150Z" fill="#c08c40"/><path d="M140 150 L190 96 L240 150Z" fill="#dcae62"/><path d="M190 96 L240 150 L216 150Z" fill="#c3914a"/>
  <g transform="translate(0 150)"><path d="M0 0 v-14 q4 -10 12 -6 q6 -10 14 0 l6 -10 l4 2 l-4 12 v16 h-4 v-10 h-20 v10 h-4Z" fill="#a06a32"/>${aMove("320 0;-40 0",18)}</g>`,
 turkey:id=>`${pSky("peach",id)}<path d="M0 180 L0 140 Q40 120 60 140 L70 100 L82 140 Q120 118 150 142 L160 108 L172 142 Q220 120 300 140 L300 180Z" fill="#d9a36b"/>
  ${[["#e9435a",70,50,0],["#2f9be0",160,30,1],["#ffd23d",230,60,2],["#7ac36a",120,80,3]].map(([c,x,y,i])=>`<g transform="translate(${x} ${y})"><path d="M-14 0 a14 16 0 1 1 28 0 q-4 10 -10 14 h-8 q-6 -4 -10 -14Z" fill="${c}"/><path d="M-4 14 h8 v6 h-8Z" fill="#7a4a1e"/><path d="M-6 0 q6 -16 12 0" stroke="#fff" opacity=".5" fill="none"/>${aMove(`0 0;0 ${-10-i*2};0 0`,5+i)}</g>`).join("")}`,
 china:id=>`${pSky("day",id)}<path d="M0 130 L60 70 L120 120 L190 60 L260 116 L300 90 L300 180 L0 180Z" fill="#6f9a6a"/><path d="M0 150 L80 104 L150 136 L230 96 L300 126" stroke="#c9b48a" stroke-width="10" fill="none"/>
  ${[[80,104],[230,96]].map(([x,y])=>`<rect x="${x-10}" y="${y-22}" width="20" height="20" fill="#b9a273"/><path d="M${x-13} ${y-22} L${x} ${y-32} L${x+13} ${y-22}Z" fill="#8a3a2a"/>`).join("")}<path d="M0 180 L0 160 Q150 140 300 160 L300 180Z" fill="#4f7a4a"/>${fxBirds(26,16)}`,
 thailand:id=>`${pSky("warm",id)}${pWater(140,"#2fa3b8")}
  <g fill="#e9b84a"><path d="M110 140 L110 110 L190 110 L190 140Z"/><path d="M100 110 L150 74 L200 110Z" fill="#c9502e"/><path d="M116 84 L150 56 L184 84Z" fill="#c9502e"/><rect x="148" y="30" width="4" height="28"/></g>
  ${pPalm(40,150,70)}${pPalm(262,150,60)}<g transform="translate(0 154)"><path d="M0 0 q30 10 60 0 l-6 8 h-48Z" fill="#7a4a1e"/><path d="M10 -2 l6 -10 h20 l6 10Z" fill="#e94b7a"/>${aMove("-70 0;320 0",14)}</g>`,
 iceland:id=>`<rect width="300" height="180" fill="#0e1f3e"/>${[["#57e3a5",40,0],["#7af0c8",70,1],["#b48cff",100,2]].map(([c,y,i])=>`<path d="M0 ${y} Q75 ${y-30} 150 ${y} T300 ${y}" stroke="${c}" stroke-width="${16-i*4}" fill="none" opacity=".55">${anim(`<animate attributeName="d" values="M0 ${y} Q75 ${y-30} 150 ${y} T300 ${y};M0 ${y+8} Q75 ${y+22} 150 ${y-6} T300 ${y+6};M0 ${y} Q75 ${y-30} 150 ${y} T300 ${y}" dur="${6+i}s" repeatCount="indefinite"/>`)}</path>`).join("")}
  <g fill="#fff">${[[30,20],[80,14],[200,22],[260,12],[150,10]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.4">${aBlink(2,i*.5)}</circle>`).join("")}</g><path d="M0 150 L70 100 L120 130 L190 90 L300 140 L300 180 L0 180Z" fill="#26364f"/><path d="M180 96 L190 90 L202 100Z" fill="#dfe8f5"/><rect y="160" width="300" height="20" fill="#1b2a40"/>
  <rect x="210" y="140" width="30" height="20" fill="#d52b1e"/><path d="M206 142 L225 128 L244 142Z" fill="#333"/><rect x="220" y="146" width="8" height="8" fill="#ffd65c"/>`,
 mexico:id=>`${pSky("day",id)}${pSun(250,44,20)}<rect y="156" width="300" height="24" fill="#8bbf6a"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${80+i*14}" y="${136-i*20}" width="${140-i*28}" height="22" fill="${i%2?"#c9b48a":"#bda676"}"/>`).join("")}<rect x="138" y="36" width="24" height="18" fill="#a88f5e"/><rect x="146" y="58" width="8" height="98" fill="#a88f5e" opacity=".6"/>
  ${pPalm(40,170,70)}${pPalm(270,170,60)}${fxBirds(30,15)}`,
 rio:id=>`${pSky("day",id)}${pWater(130,"#2f8fd0")}<path d="M150 130 Q160 40 196 36 Q232 50 236 130Z" fill="#5e8f5a"/><path d="M60 130 Q72 90 96 88 Q116 96 120 130Z" fill="#6f9f6a"/>
  <path d="M96 88 L196 36" stroke="#555" stroke-width="1"/><g><rect x="-7" y="0" width="14" height="10" rx="3" fill="#ffd23d"/>${anim(`<animateMotion dur="8s" repeatCount="indefinite" path="M98 92 L192 42 L98 92"/>`)}</g>
  <path d="M0 156 Q150 140 300 156 L300 180 L0 180Z" fill="#f4dca8"/>${pPalm(30,172,60)}`,
 lisbon:id=>`${pSky("day",id)}${pCloud(240,34)}<path d="M0 180 L0 120 L300 70 L300 180Z" fill="#e8d9c0"/>
  ${[[10,100,"#f5c26b"],[60,90,"#e98b6a"],[110,82,"#7fb6e0"],[160,74,"#f3e1a8"],[210,64,"#e98b6a"],[256,58,"#f5c26b"]].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="44" height="${180-y}" fill="${c}"/><path d="M${x-2} ${y} L${x+22} ${y-12} L${x+46} ${y}Z" fill="#c0603a"/>${pWindows(x+8,y+10,3,3,12,14)}`).join("")}
  <path d="M0 170 L300 120" stroke="#555" stroke-width="2"/><g><rect x="-22" y="-20" width="44" height="22" rx="4" fill="#ffd23d"/><rect x="-16" y="-15" width="10" height="8" fill="#dceaf6"/><rect x="2" y="-15" width="10" height="8" fill="#dceaf6"/>${anim(`<animateMotion dur="10s" repeatCount="indefinite" path="M-30 172 L330 112"/>`)}</g>`,
 machu:id=>`${pSky("day",id)}${pCloud(70,40)}${pCloud(240,60,.8)}<path d="M150 180 L190 40 Q205 30 216 44 L260 180Z" fill="#5e8f5a"/><path d="M0 180 L0 120 Q60 96 120 116 L160 180Z" fill="#6f9f6a"/>
  ${[0,1,2,3].map(i=>`<path d="M${20+i*8} ${150-i*10} h${100-i*16}" stroke="#4f7a4a" stroke-width="3"/>`).join("")}${[[40,140],[70,132],[96,138]].map(([x,y])=>`<rect x="${x}" y="${y-10}" width="14" height="10" fill="#a8a196"/><path d="M${x-2} ${y-10} L${x+7} ${y-17} L${x+16} ${y-10}Z" fill="#8a6a42"/>`).join("")}${fxBirds(24,16)}`,
});
Object.assign(PLACE_FX,{});
function placeKind(name){const n=String(name||"").toLowerCase();
  const R=[[/jungfrau|grindelwald|wengen|lauterbrunnen/,"jungfrau"],[/lucerne|luzern|pilatus/,"lucerne"],[/interlaken/,"interlaken"],[/zermatt|matterhorn/,"swiss"],[/zurich|zürich|\bzrh\b/,"zurich"],
    [/geneva|\bgva\b|bern|basel|\bbsl\b|lugano|st.?moritz|switzerland|swiss/,"jungfrau"],
    [/los angeles|\blax\b|hollywood|california/,"hollywood"],[/dallas|\bdfw\b|\bdal\b|fort worth|frisco|plano/,"dallas"],[/new york|\bjfk\b|newark|\bewr\b|manhattan|brooklyn/,"nyc"],
    [/san francisco|\bsfo\b|bay area|san jose|oakland/,"sf"],[/seattle|\bsea\b|vancouver|\byvr\b|portland/,"seattle"],[/washington|dulles|\biad\b|\bdca\b/,"washington"],[/phoenix|\bphx\b|arizona|las vegas/,"phoenix"],
    [/miami|\bmia\b|florida|orlando|cancun|hawaii|honolulu|bali|maldives|goa/,"miami"],[/denver|\bden\b|colorado|banff/,"denver"],[/london|\blhr\b|england|united kingdom|\buk\b|edinburgh|scotland/,"london"],
    [/paris|\bcdg\b|france|nice|lyon/,"paris"],[/dubai|\bdxb\b|abu dhabi|uae/,"dubai"],[/delhi|\bdel\b|agra|jaipur/,"taj"],[/mumbai|\bbom\b/,"gateway"],[/hyderabad|\bhyd\b/,"charminar"],
    [/chennai|\bmaa\b|bengaluru|bangalore|\bblr\b|madurai|kerala|kochi|india/,"temple"],[/toronto|\byyz\b|canada|montreal/,"toronto"],[/sydney|\bsyd\b|australia|melbourne/,"sydney"],
    [/tokyo|\bhnd\b|\bnrt\b|japan|kyoto|osaka/,"tokyo"],[/singapore|\bsin\b/,"singapore"],
    [/berlin|\bber\b/,"berlin"],[/munich|münchen|\bmuc\b|bavaria|germany|deutschland|frankfurt|\bfra\b|hamburg|cologne|stuttgart/,"neuschwanstein"],
    [/amsterdam|\bams\b|netherlands|holland/,"amsterdam"],[/barcelona|madrid|seville|spain|\bbcn\b|\bmad\b/,"spain"],[/lisbon|porto|portugal|\blis\b/,"lisbon"],
    [/cairo|egypt|giza|luxor/,"egypt"],[/istanbul|turkey|türkiye|cappadocia|\bist\b/,"turkey"],[/beijing|china|shanghai|\bpek\b/,"china"],[/bangkok|thailand|phuket|chiang mai|\bbkk\b/,"thailand"],
    [/iceland|reykjavik|\bkef\b|norway|tromso|lapland|finland/,"iceland"],[/mexico|tulum|cdmx|\bmex\b/,"mexico"],[/rio|brazil|são paulo|sao paulo/,"rio"],[/peru|cusco|lima|machu/,"machu"],
    [/santorini|mykonos|crete|paros|naxos/,"santorini"],[/athens|\bath\b|greece|thessaloniki/,"parthenon"],[/rome|\bfco\b|italy|venice|florence|milan|\bmxp\b|naples/,"colosseum"]];
  for(const[re,k]of R)if(re.test(n))return k;return "generic"}
const KIND_COUNTRY={jungfrau:"Switzerland",lucerne:"Switzerland",interlaken:"Switzerland",swiss:"Switzerland",zurich:"Switzerland",parthenon:"Greece",santorini:"Greece",colosseum:"Italy",tokyo:"Japan",paris:"France",
  neuschwanstein:"Germany",berlin:"Germany",amsterdam:"Netherlands",spain:"Spain",lisbon:"Portugal",egypt:"Egypt",turkey:"Türkiye",china:"China",thailand:"Thailand",iceland:"Iceland",mexico:"Mexico",rio:"Brazil",machu:"Peru"};
const COUNTRY_COVER={Switzerland:"jungfrau"};
const COUNTRY_LABEL=KIND_COUNTRY;
const cityName=s=>String(s||"").replace(/\s*\(.*\)/,"").trim();
/** One postcard frame: a scene, a small label above, a big label. */
function sceneSVG(kind,id){return (PLACES[kind]||PLACES.generic)(id)+(PLACE_FX[kind]?PLACE_FX[kind]():"")}
/** The journey strip, built from plain HTML cards (each picture is its own small SVG, like the attraction cards).
    froms and tos are lists of frames {kind,kicker,label}; each postcard cycles through its frames. */
function journeyArt(froms,tos,mid){const u=Math.random().toString(36).slice(2,7);
  const card=(frames,key,side)=>`<div class="pcard ${side}" data-n="${frames.length}" ${frames.length>1?'role="button" tabindex="0" aria-label="Show the next place"':""}>
    <div class="pic">${frames.map((f,i)=>`<svg class="jf${i?"":" on"}" viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sceneSVG(f.kind,`s${key}${i}${u}`)}</svg>`).join("")}</div>
    <div class="plab">${frames.map((f,i)=>`<div class="jl${i?"":" on"}"><small>${esc(f.kicker)}</small><b>${esc(f.label)}</b></div>`).join("")}
      ${frames.length>1?`<span class="dots">${frames.map((_,i)=>`<i class="jdot${i?"":" on"}"></i>`).join("")}</span>`:`<span class="stamp-ic" aria-hidden="true">✈</span>`}</div></div>`;
  const path="M10 70 Q150 -20 290 70";
  const planeShape=`<g transform="scale(-1.2 1.2) translate(-23 -9)" style="fill:var(--red)"><path d="M0 8 L26 6 L34 0 L37 1 L33 7 L44 7 C47 7 47 10 44 10 L33 10 L37 16 L34 17 L26 11 L0 10Z"/></g>`;
  const plane=RM?`<g transform="translate(150 25)">${planeShape}</g>`:`<g>${planeShape}<animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`;
  return `<div class="jrow" role="img" aria-label="Flying from ${esc(froms.map(f=>f.label).join(", "))} to ${esc(tos.map(f=>f.label).join(", "))}">
    ${card(froms,"a","from")}
    <div class="jmid"><svg viewBox="0 0 300 80" aria-hidden="true"><path d="${path}" fill="none" style="stroke:var(--ink)" stroke-width="2.5" stroke-dasharray="2 10" stroke-linecap="round" opacity=".7"/><circle cx="10" cy="70" r="5" style="fill:var(--ink)"/><circle cx="290" cy="70" r="5" style="fill:var(--red)"/>${plane}</svg>
      ${(mid||[]).map((t,i)=>`<div class="${i?"m2":"m1"}">${esc(t)}</div>`).join("")}</div>
    ${card(tos,"b","to")}</div>`}
let journeyTimer=null;
/** Rotate each postcard through its frames every few seconds; a click moves to the next one. */
function startJourney(host){clearInterval(journeyTimer);const cards=[...host.querySelectorAll(".pcard")].filter(c=>Number(c.dataset.n)>1);if(!cards.length)return;
  const step=c=>{const fs=[...c.querySelectorAll(".jf")],ls=[...c.querySelectorAll(".jl")],ds=[...c.querySelectorAll(".jdot")],k=fs.findIndex(f=>f.classList.contains("on")),n=(k+1)%fs.length;
    for(const g of [fs,ls,ds])g.forEach((f,i)=>f.classList.toggle("on",i===n))};
  cards.forEach(c=>{c.addEventListener("click",()=>step(c));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();step(c)}})});if(!RM)journeyTimer=setInterval(()=>cards.forEach(step),4000)}
/** Who flies from where: groups can have a home per person; families share one. */
function originFrames(t){if(!t)return [{kind:"generic",kicker:"FLYING FROM",label:"Your city"}];
  const homes=new Map();const ms=t.party?.type==="group"?t.party.members:[];
  for(const m of ms){const h=(m.home||t.home||"").trim();if(!h)continue;const k=cityName(h).toLowerCase();if(!homes.has(k))homes.set(k,{home:h,names:[]});homes.get(k).names.push(m.name||"Friend")}
  if(!homes.size)return [{kind:placeKind(t.home),kicker:"FLYING FROM",label:cityName(t.home)||"Home"}];
  return [...homes.values()].map(x=>({kind:placeKind(x.home),kicker:`FROM · ${x.names.join(", ").toUpperCase()}`,label:cityName(x.home)}))}
function destFrames(t){if(!t)return [{kind:"jungfrau",kicker:"GOING TO",label:"Switzerland"},{kind:"lucerne",kicker:"GOING TO",label:"Lucerne"},{kind:"swiss",kicker:"GOING TO",label:"Zermatt"}];
  const cities=t.cities||[];if(!cities.length)return [{kind:"generic",kicker:"GOING TO",label:"Anywhere"}];
  const out=[],covered=new Set();cities.forEach((c,i)=>{const kind=placeKind(c),country=KIND_COUNTRY[kind];
    if(country&&COUNTRY_COVER[country]&&!covered.has(country)){covered.add(country);if(COUNTRY_COVER[country]!==kind)out.push({kind:COUNTRY_COVER[country],kicker:"GOING TO · JUNGFRAUJOCH",label:country})}
    out.push({kind,kicker:cities.length>1?`STOP ${i+1}${country?" · "+country.toUpperCase():""}`:country&&country!==c?`GOING TO · ${country.toUpperCase()}`:"GOING TO",label:c})});
  return out.slice(0,7)}
/** Hero background: open sky with soft hills, so any destination fits. */
function heroSky(){return `<svg class="scene" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-top)"/><stop offset="1" style="stop-color:var(--sky-bot)"/></linearGradient></defs>
<rect width="1200" height="420" fill="url(#sky)"/><circle cx="1060" cy="80" r="40" style="fill:var(--sun)" opacity=".9"/>
<g style="fill:var(--snow)" opacity=".7"><ellipse cx="760" cy="62" rx="70" ry="14"/><ellipse cx="810" cy="50" rx="40" ry="14"/><ellipse cx="260" cy="300" rx="80" ry="12"/><ellipse cx="980" cy="230" rx="60" ry="11"/></g>
<path d="M0 380 Q200 330 420 368 T860 356 T1200 350 L1200 420 L0 420Z" style="fill:var(--mtn3)" opacity=".7"/>
<path d="M0 404 Q260 372 520 398 T1200 392 L1200 420 L0 420Z" style="fill:var(--mtn1)" opacity=".8"/></svg>`}
