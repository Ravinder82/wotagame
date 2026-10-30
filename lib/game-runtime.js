const CFG=__CONFIG__;const $=id=>document.getElementById(id);let challenge=new URLSearchParams(location.search).get("challenge"),restartFn=()=>{};const area=$("area");function rnd(n){return Math.floor(Math.random()*n)}function feedback(t){$("feedback").textContent=t}function record(key,v,lower){try{const k="xmg.best."+key,o=localStorage.getItem(k);let b=o===null?v:Number(o);if(lower?v<b:v>b)b=v;localStorage.setItem(k,String(b));$("bestTag").textContent="BEST "+b+(key==="reaction"?" ms":key==="higher"?"/10":key==="wordfinder"?" s":key==="hailstorm"?" m":" moves")}catch{$("bestTag").textContent="PERSONAL BEST"}}function result(head,detail,shareValue,key,value,lower){$("result").style.display="block";$("resultTitle").textContent=head;$("resultDetail").textContent=detail;if(key)record(key,value,lower);const u=new URL(location.href);u.searchParams.set("challenge",shareValue);const text=CFG.title+" — "+shareValue+". Can you beat me? "+u.href;$("shareHint").textContent="Share a challenge link with the score target.";$("share").onclick=async()=>{try{if(navigator.share)await navigator.share({title:CFG.title,text:text,url:u.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text);$("shareHint").textContent="Copied! Paste your challenge into a post or chat."}else $("shareHint").textContent=text}catch(e){if(e.name!=="AbortError")$("shareHint").textContent=text}};$("again").onclick=()=>{$("result").style.display="none";restartFn()}}if(challenge){$("challenge").hidden=false;$("challenge").textContent="FRIEND CHALLENGE · Beat "+challenge+"!"}
function reaction(){let phase="idle",round=0,timer=0,start=0,times=[];function draw(){area.innerHTML="";const box=document.createElement("div");box.className="arena";const info=document.createElement("div");info.className="muted";info.textContent=phase==="idle"||phase==="done"?"Five rounds · Start when ready":phase==="waiting"?"Do not tap until green.":"Round "+(round+1)+" of 5";const b=document.createElement("button");b.className="btn "+(phase==="waiting"?"wait":phase==="go"?"go":"");b.textContent=phase==="idle"||phase==="done"?"Start 5-round challenge":phase==="waiting"?"Wait for green…":"TAP NOW!";b.onclick=()=>{if(phase==="idle"||phase==="done"){begin();return}if(phase==="waiting"){clearTimeout(timer);phase="done";feedback("False start! Try again.");draw();return}if(phase==="go"){times.push(Math.round(performance.now()-start));round++;if(round===5){phase="done";const avg=Math.round(times.reduce((a,b)=>a+b,0)/5);feedback("Round times: "+times.join(" · ")+" ms");result("Reflexes revealed",avg+" ms average across five rounds.",avg+" ms average","reaction",avg,true);draw()}else waitRound()}};box.append(info,b);area.append(box)}function waitRound(){clearTimeout(timer);phase="waiting";draw();feedback("Round "+(round+1)+" of 5 · Get ready.");timer=setTimeout(()=>{if(phase==="waiting"){phase="go";start=performance.now();draw();feedback("NOW! Tap as quickly as you can.")}},750+rnd(1800))}function begin(){clearTimeout(timer);round=0;times=[];$("result").style.display="none";waitRound()}restartFn=()=>{phase="idle";round=0;times=[];draw();feedback("")};draw()}
function higher(){let current=1+rnd(99),count=0,correct=0,locked=false;function draw(){area.innerHTML="";const label=document.createElement("div");label.className="muted";label.textContent="Guess the next number · "+count+" of 10";const num=document.createElement("div");num.className="number";num.textContent=current;const row=document.createElement("div");row.className="row";const hi=document.createElement("button");hi.className="btn";hi.textContent="Higher ↑";const lo=document.createElement("button");lo.className="btn secondary";lo.textContent="Lower ↓";function guess(dir){if(locked)return;locked=true;let next;do{next=1+rnd(99)}while(next===current);const ok=dir==="higher"?next>current:next<current;if(ok)correct++;count++;feedback((ok?"Correct! ":"Not this time. ")+"Next number was "+next+".");current=next;setTimeout(()=>{locked=false;if(count>=10)result("Streak completed",correct+" correct guesses out of 10.",correct+"/10","higher",correct,false);else draw()},450)}hi.onclick=()=>guess("higher");lo.onclick=()=>guess("lower");row.append(hi,lo);area.append(label,num,row)}restartFn=()=>{current=1+rnd(99);count=0;correct=0;locked=false;draw();feedback("")};draw()}
function memory(){const faces=["🍉","🦊","🎧","🌈","🪐","🍕"];let deck=[],opened=[],matched=new Set(),moves=0,locked=false,start=0;function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}function draw(){area.innerHTML="";const line=document.createElement("div");line.className="muted";line.textContent="Moves: "+moves+" · Pairs: "+matched.size+"/6";const grid=document.createElement("div");grid.className="grid";deck.forEach((face,i)=>{const b=document.createElement("button");b.className="tile"+(opened.includes(i)?" open":"")+(matched.has(i)?" matched":"");b.textContent=matched.has(i)||opened.includes(i)?face:"?";b.setAttribute("aria-label",matched.has(i)||opened.includes(i)?face:"Hidden card");b.disabled=matched.has(i)||locked;b.onclick=()=>flip(i);grid.append(b)});area.append(line,grid)}function flip(i){if(locked||matched.has(i)||opened.includes(i))return;opened.push(i);draw();if(opened.length===2){moves++;locked=true;const a=opened[0],b=opened[1];if(deck[a]===deck[b]){matched.add(a);matched.add(b);opened=[];locked=false;draw();if(matched.size===6){const secs=Math.round((performance.now()-start)/1000);result("Memory mastered",moves+" moves in "+secs+" seconds.",moves+" moves","memory",moves,true)}}else setTimeout(()=>{opened=[];locked=false;draw()},620)}}function begin(){deck=shuffle(faces.concat(faces));opened=[];matched=new Set();moves=0;locked=false;start=performance.now();draw();feedback("Find all six matching pairs.");$("result").style.display="none"}restartFn=begin;begin()}
function wordfinder(){
 const words=["PUZZLE","BRAIN","SEARCH","FOCUS","SOLVE","WORD","GAME","PLAY"],rows=10,cols=10,dirs=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
 let grid=[],placements={},first=null,found=new Map(),startTime=0,clock=0,finished=false;
 const style=document.createElement("style");
 style.textContent=".wordfind-wrap{width:100%}.wordfind-top{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:9px}.wordgrid{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px}.letter{min-width:0;aspect-ratio:1;padding:0;border:1px solid #343d49;border-radius:5px;background:#151b22;color:#eef3f8;font-size:clamp(9px,2.5vw,15px);font-weight:800;line-height:1}.letter.selected{background:#6e5522;border-color:#ffd16e;color:#fff5d4}.letter.found{background:#263b22;border-color:var(--accent);color:var(--accent)}.wordlist{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:11px}.wordchip{padding:5px 2px;border:1px solid #303741;border-radius:7px;text-align:center;color:#c6cfda;font-size:10px;font-weight:800;background:#15191f;overflow-wrap:anywhere}.wordchip.done{color:var(--accent);text-decoration:line-through;border-color:#3d5934;background:#172117}.wordfind-actions{display:flex;gap:8px;margin-top:10px}.wordfind-actions button{flex:1;font-size:11px;min-height:36px;padding:8px}.wordfind-foot{font-size:10px;color:#8e99a9;margin-top:8px;text-align:center}";
 document.head.append(style);
 function rand(n){return Math.floor(Math.random()*n)}
 function pathFrom(r,c,dr,dc,len){const out=[];for(let k=0;k<len;k++)out.push([r+dr*k,c+dc*k]);return out}
 function createPuzzle(){
  grid=Array.from({length:rows},()=>Array(cols).fill(""));
  placements={};
  words.forEach(word=>{
   let placed=false;
   for(let attempt=0;attempt<500&&!placed;attempt++){
    const d=dirs[rand(dirs.length)],r=rand(rows),c=rand(cols),path=pathFrom(r,c,d[0],d[1],word.length);
    if(path.some(([y,x])=>y<0||y>=rows||x<0||x>=cols))continue;
    if(path.some(([y,x],i)=>grid[y][x]&&grid[y][x]!==word[i]))continue;
    path.forEach(([y,x],i)=>grid[y][x]=word[i]);
    placements[word]=path;placed=true;
   }
   if(!placed)throw new Error("Puzzle generator could not place "+word);
  });
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(!grid[r][c])grid[r][c]="ABCDEFGHJKLMNPQRSTUVWXYZ"[rand(24)];
 }
 function posKey(r,c){return r+","+c}
 function elapsed(){return Math.max(0,Math.floor((performance.now()-startTime)/1000))}
 function draw(){
  area.innerHTML="";
  const wrap=document.createElement("div");wrap.className="wordfind-wrap";
  const top=document.createElement("div");top.className="wordfind-top";
  const instruction=document.createElement("div");instruction.className="muted";instruction.textContent=found.size===words.length?"All words found!":"Tap the first and last letter of a word.";
  const timer=document.createElement("div");timer.className="muted";timer.id="wordTimer";timer.textContent=elapsed()+"s";
  top.append(instruction,timer);
  const board=document.createElement("div");board.className="wordgrid";board.setAttribute("role","group");board.setAttribute("aria-label","Word finder letter grid");
  const foundCells=new Set();found.forEach(path=>path.forEach(([r,c])=>foundCells.add(posKey(r,c))));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const b=document.createElement("button");b.type="button";b.className="letter";b.textContent=grid[r][c];b.setAttribute("aria-label","Row "+(r+1)+", column "+(c+1)+", letter "+grid[r][c]);b.dataset.r=r;b.dataset.c=c;
   if(foundCells.has(posKey(r,c)))b.classList.add("found");
   if(first&&first[0]===r&&first[1]===c)b.classList.add("selected");
   b.onclick=()=>selectCell(r,c);board.append(b);
  }
  const list=document.createElement("div");list.className="wordlist";list.setAttribute("aria-label","Words to find");
  words.forEach(w=>{const chip=document.createElement("div");chip.className="wordchip"+(found.has(w)?" done":"");chip.textContent=(found.has(w)?"✓ ":"")+w;list.append(chip)});
  const actions=document.createElement("div");actions.className="wordfind-actions";
  const reset=document.createElement("button");reset.className="btn secondary";reset.type="button";reset.textContent="New puzzle ↻";reset.onclick=()=>begin();
  const hint=document.createElement("button");hint.className="btn secondary";hint.type="button";hint.textContent="Hint";hint.onclick=showHint;
  actions.append(reset,hint);
  const foot=document.createElement("div");foot.className="wordfind-foot";foot.textContent=found.size+" / "+words.length+" words found · Horizontal, vertical and diagonal";
  wrap.append(top,board,list,actions,foot);area.append(wrap);
 }
 function selectCell(r,c){
  if(finished)return;
  if(!first){first=[r,c];draw();return}
  const [r1,c1]=first;first=null;
  const dr=r-r1,dc=c-c1;
  if(dr===0&&dc===0){feedback("Choose a different ending letter.");draw();return}
  if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))){feedback("Words run in a straight line, including diagonals.");draw();return}
  const sr=Math.sign(dr),sc=Math.sign(dc),len=Math.max(Math.abs(dr),Math.abs(dc))+1,path=pathFrom(r1,c1,sr,sc,len);
  if(path.some(([y,x])=>y<0||y>=rows||x<0||x>=cols)){feedback("That selection is outside the grid.");draw();return}
  const letters=path.map(([y,x])=>grid[y][x]).join("");
  const match=words.find(w=>!found.has(w)&&(w===letters||w===letters.split("").reverse().join("")));
  if(!match){feedback("Not a listed word. Try another pair of endpoints.");draw();return}
  found.set(match,path);feedback("Found "+match+"! "+found.size+" of "+words.length+".");draw();
  if(found.size===words.length)complete();
 }
 function showHint(){
  const remaining=words.filter(w=>!found.has(w));
  if(!remaining.length){feedback("Every word is already found!");return}
  const target=remaining[0],path=placements[target],a=path[0],b=path[path.length-1];
  feedback("Hint for "+target+": starts at row "+(a[0]+1)+", column "+(a[1]+1)+".");
  const btn=area.querySelector('.letter[data-r="'+a[0]+'"][data-c="'+a[1]+'"]');
  if(btn){btn.classList.add("selected");setTimeout(()=>{if(btn.isConnected&&!btn.classList.contains("found"))btn.classList.remove("selected")},1200)}
 }
 function complete(){
  finished=true;clearInterval(clock);const seconds=elapsed(),label=words.length+" words in "+seconds+"s";
  feedback("Puzzle complete! "+label+".");result("Word finder solved!", "You found all "+words.length+" hidden words in "+seconds+" seconds.",label,"wordfinder",seconds,true);
 }
 function begin(){
  clearInterval(clock);finished=false;first=null;found=new Map();startTime=performance.now();createPuzzle();draw();feedback("Find all "+words.length+" words. They can go forward, backward, or diagonally.");clock=setInterval(()=>{const t=$("wordTimer");if(t&&!finished)t.textContent=elapsed()+"s"},1000);$("result").style.display="none";
 }
 restartFn=begin;
 begin();
}

function hailstorm(){
"use strict";
const VH=375,GROUND=302;
let VW=600,SCALE=1,DPR=1;
const RM=(()=>{try{return matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){return false}})();
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
function hash(n){const s=Math.sin(n*127.1+11.7)*43758.5453;return s-Math.floor(s)}

/* ================= STYLES ================= */
const sty=document.createElement("style");
sty.textContent=[
".hail-wrap{width:100%;display:flex;flex-direction:column;gap:7px;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}",
".area>.hail-wrap{max-width:none}",
".hail-stage{position:relative;width:100%;aspect-ratio:16/10;border-radius:16px;overflow:hidden;border:1px solid #2b3a4f;background:#04060c;box-shadow:inset 0 0 90px rgba(0,0,0,.8),0 22px 48px rgba(0,0,0,.5);touch-action:none}",
".hail-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;outline:none}",
".hail-ui{position:absolute;inset:0;pointer-events:none}",
".hail-ui .hbtn{position:absolute;pointer-events:auto;margin:0;border:1px solid rgba(150,200,255,.30);background:linear-gradient(180deg,rgba(26,42,64,.58),rgba(8,14,24,.70));color:#e9f4ff;font-weight:800;letter-spacing:.02em;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 16px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12);transition:transform .07s ease,background .13s ease,border-color .13s ease;font-size:clamp(13px,2.4vw,17px);line-height:1;padding:0}",
".hail-ui .hbtn.on,.hail-ui .hbtn:active{background:linear-gradient(180deg,rgba(56,189,248,.55),rgba(16,74,134,.62));border-color:#8bdcff;transform:scale(.93)}",
".hail-ui .hbtn:focus-visible{outline:2px solid #a9f36c;outline-offset:2px}",
".h-key{width:clamp(50px,8.4vw,74px);height:clamp(50px,8.4vw,74px)}",
"#hL{left:2.4%;bottom:3.6%}",
"#hR{left:calc(2.4% + clamp(50px,8.4vw,74px) + 8px);bottom:3.6%}",
"#hJ{right:2.4%;bottom:3.6%;width:clamp(62px,10.6vw,90px);height:clamp(62px,10.6vw,90px);border-radius:50%;font-size:clamp(11px,2vw,14px)}",
"#hS{right:calc(2.4% + clamp(62px,10.6vw,90px) + 8px);bottom:3.6%}",
"#hP{right:2.4%;top:2.8%;width:clamp(40px,4.8vw,46px);height:clamp(40px,4.8vw,46px);border-radius:13px;font-size:15px}",
"#hM{right:calc(2.4% + clamp(40px,4.8vw,46px) + 6px);top:2.8%;width:clamp(40px,4.8vw,46px);height:clamp(40px,4.8vw,46px);border-radius:13px;font-size:15px}",
".hail-help{font-size:10.5px;color:#7d8ea3;text-align:center;margin-top:2px;min-height:14px}",
"@media(max-width:400px){.hail-help{font-size:9.5px}}",
"@media(max-width:520px) and (orientation:portrait){.hail-stage{aspect-ratio:4/3}}",
"@media(orientation:landscape) and (max-height:600px){.hail-stage{aspect-ratio:16/9;max-height:calc(100vh - 104px);max-height:calc(100dvh - 104px)}}",
"@media(min-width:900px) and (min-height:500px){.hail-stage{box-shadow:inset 0 0 120px rgba(0,0,0,.8),0 26px 60px rgba(0,0,0,.55)}}"
].join("");
document.head.append(sty);

area.innerHTML="";
const wrap=document.createElement("div");wrap.className="hail-wrap";
const stage=document.createElement("div");stage.className="hail-stage";
const canvas=document.createElement("canvas");canvas.className="hail-canvas";
canvas.tabIndex=0;canvas.setAttribute("role","application");
canvas.setAttribute("aria-label","Hailstorm Run. Use the on screen buttons, or arrow keys to move, space to jump, S to slide.");
const ui=document.createElement("div");ui.className="hail-ui";
ui.innerHTML=[
 '<button type="button" class="hbtn h-key" id="hL" aria-label="Move left">&#9664;</button>',
 '<button type="button" class="hbtn h-key" id="hR" aria-label="Move right">&#9654;</button>',
 '<button type="button" class="hbtn h-key" id="hJ" aria-label="Jump">JUMP</button>',
 '<button type="button" class="hbtn h-key" id="hS" aria-label="Slide">SLIDE</button>',
 '<button type="button" class="hbtn" id="hM" aria-label="Toggle music and sound">&#9835;</button>',
 '<button type="button" class="hbtn" id="hP" aria-label="Pause game">&#10073;&#10073;</button>'
].join("");
stage.append(canvas,ui);
const help=document.createElement("div");help.className="hail-help";
help.textContent="On\u2011screen buttons, tap to jump, swipe down to slide \u00b7 keyboard: \u2190 \u2192 move, Space jump, S slide, P pause";
wrap.append(stage,help);area.append(wrap);

const ctx=canvas.getContext("2d",{alpha:false});

/* ================= AUDIO : procedural score + SFX ================= */
const MUTE_KEY="xmg.hail.mute";
const AU={ctx:null,out:null,music:null,sfx:null,wind:null,hailBed:null,noise:null,muted:false,on:false,
  timer:0,step:0,next:0,bpm:118,intensity:0,send:null};
try{AU.muted=localStorage.getItem(MUTE_KEY)==="1"}catch(e){}

const CHORDS=[
 {root:110.00,tones:[220.00,261.63,329.63],name:"Am"},
 {root:87.31, tones:[174.61,220.00,261.63],name:"F"},
 {root:130.81,tones:[196.00,261.63,329.63],name:"C"},
 {root:98.00, tones:[196.00,246.94,293.66],name:"G"}
];

function makeNoise(ctx,seconds){
  const len=Math.floor(ctx.sampleRate*seconds);
  const buf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return buf;
}

function initAudio(){
  if(AU.ctx)return AU.ctx;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    const c=new AC();
    const out=c.createGain();out.gain.value=AU.muted?0:0.85;
    const comp=c.createDynamicsCompressor();
    comp.threshold.value=-16;comp.knee.value=18;comp.ratio.value=4;
    comp.attack.value=0.006;comp.release.value=0.24;
    comp.connect(out);out.connect(c.destination);

    const dl=c.createDelay(1.2);dl.delayTime.value=0.31;
    const fb=c.createGain();fb.gain.value=0.33;
    const damp=c.createBiquadFilter();damp.type="lowpass";damp.frequency.value=2400;
    const wet=c.createGain();wet.gain.value=0.42;
    dl.connect(damp);damp.connect(fb);fb.connect(dl);damp.connect(wet);wet.connect(comp);

    const music=c.createGain();music.gain.value=0.0001;music.connect(comp);
    const mSend=c.createGain();mSend.gain.value=0.30;music.connect(mSend);mSend.connect(dl);
    const sfx=c.createGain();sfx.gain.value=0.62;sfx.connect(comp);
    const sSend=c.createGain();sSend.gain.value=0.26;sfx.connect(sSend);sSend.connect(dl);

    AU.ctx=c;AU.out=out;AU.music=music;AU.sfx=sfx;AU.send=dl;AU.noise=makeNoise(c,3);
    return c;
  }catch(e){return null}
}

function resumeAudio(){const c=initAudio();if(c&&c.state==="suspended")c.resume();return c}

function tone(o){
  const c=AU.ctx;if(!c||AU.muted)return;
  const t=o.t!==undefined?o.t:c.currentTime;
  const osc=c.createOscillator(),g=c.createGain();
  osc.type=o.type||"sine";osc.frequency.setValueAtTime(o.f,t);
  if(o.f2)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+(o.dur||0.2));
  const a=o.attack||0.006,d=o.dur||0.2;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,o.gain||0.15),t+a);
  g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  let node=osc;
  if(o.cut){
    const fl=c.createBiquadFilter();fl.type=o.kind||"lowpass";fl.frequency.setValueAtTime(o.cut,t);
    if(o.cut2)fl.frequency.exponentialRampToValueAtTime(Math.max(40,o.cut2),t+d);
    fl.Q.value=o.q||1;
    osc.connect(fl);node=fl;
  }
  node.connect(g);g.connect(AU.sfx);
  osc.start(t);osc.stop(t+d+0.05);
}

function noiseHit(o){
  const c=AU.ctx;if(!c||!AU.noise||AU.muted)return;
  const t=o.t!==undefined?o.t:c.currentTime;
  const src=c.createBufferSource();src.buffer=AU.noise;
  src.playbackRate.value=o.rate||1;
  src.loop=true;
  const fl=c.createBiquadFilter();fl.type=o.type||"lowpass";
  fl.frequency.setValueAtTime(o.f||1200,t);
  if(o.f2)fl.frequency.exponentialRampToValueAtTime(Math.max(40,o.f2),t+(o.dur||0.2));
  fl.Q.value=o.q||1;
  const g=c.createGain();const d=o.dur||0.2;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,o.gain||0.12),t+(o.attack||0.005));
  g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  src.connect(fl);fl.connect(g);g.connect(AU.sfx);
  src.start(t);src.stop(t+d+0.05);
}

/* --- musical SFX, tied to the current chord --- */
function chordTone(i){const bar=Math.floor((AU.step%64)/16);return CHORDS[bar].tones[i%3]}
function sfxJump(){
  noiseHit({type:"bandpass",f:500,f2:2600,q:1.4,dur:0.22,gain:0.10,attack:0.01});
  tone({f:chordTone(0)*2,type:"triangle",dur:0.17,gain:0.10,cut:3000});
}
function sfxLand(){noiseHit({type:"lowpass",f:420,f2:150,dur:0.14,gain:0.13})}
function sfxSlide(){noiseHit({type:"bandpass",f:1400,f2:260,q:2.2,dur:0.34,gain:0.12})}
function sfxEmber(){tone({f:chordTone(1)*2,type:"sine",dur:0.30,gain:0.16,cut:6000});
  tone({t:AU.ctx?AU.ctx.currentTime+0.09:0,f:chordTone(2)*2,type:"sine",dur:0.36,gain:0.13,cut:6000})}
function sfxShield(){const b=AU.ctx?AU.ctx.currentTime:0;
  [0,1,2].forEach(i=>tone({t:b+i*0.07,f:chordTone(i)*2,type:"triangle",dur:0.3,gain:0.12,cut:5200}))}
function sfxFeather(){noiseHit({type:"bandpass",f:900,f2:3400,q:1.1,dur:0.5,gain:0.09});
  tone({f:1568,type:"sine",dur:0.5,gain:0.09})}
function sfxStar(){const b=AU.ctx?AU.ctx.currentTime:0;
  [0,2,1,0].forEach((n,i)=>tone({t:b+i*0.06,f:chordTone(n)*4,type:"square",dur:0.24,gain:0.07,cut:5200}))}
function sfxNear(){noiseHit({type:"highpass",f:2600,q:0.7,dur:0.12,gain:0.05})}
function sfxBreak(){noiseHit({type:"lowpass",f:5200,f2:320,dur:0.5,gain:0.22});
  tone({f:chordTone(0)*2,f2:110,type:"sawtooth",dur:0.4,gain:0.10,cut:2400,f2cut:400})}
function sfxHit(){noiseHit({type:"lowpass",f:3400,f2:180,dur:0.8,gain:0.3});
  const b=AU.ctx?AU.ctx.currentTime:0;
  [0,1,2].forEach((n,i)=>tone({t:b+i*0.1,f:chordTone(n)*2,f2:chordTone(n),type:"sawtooth",dur:0.6,gain:0.10,cut:2000,f2cut:300}))}
function sfxTier(){const b=AU.ctx?AU.ctx.currentTime:0;
  [0,1,2].forEach((n,i)=>tone({t:b+i*0.11,f:chordTone(n)*2,type:"square",dur:0.36,gain:0.11,cut:4200}))}
function sfxThaw(){tone({f:523,type:"sine",dur:0.4,gain:0.12})}

function startBed(){
  const c=resumeAudio();if(!c||AU.on)return;
  AU.on=true;
  const wsrc=c.createBufferSource();wsrc.buffer=AU.noise;wsrc.loop=true;
  const wf=c.createBiquadFilter();wf.type="bandpass";wf.frequency.value=420;wf.Q.value=0.6;
  const wg=c.createGain();wg.gain.value=0.05;
  wsrc.connect(wf);wf.connect(wg);wg.connect(AU.music);wsrc.start();
  AU.wind={g:wg,f:wf};

  const hsrc=c.createBufferSource();hsrc.buffer=AU.noise;hsrc.loop=true;hsrc.playbackRate.value=1.7;
  const hf=c.createBiquadFilter();hf.type="highpass";hf.frequency.value=3200;
  const hg=c.createGain();hg.gain.value=0.0001;
  hsrc.connect(hf);hf.connect(hg);hg.connect(AU.music);hsrc.start();
  AU.hailBed=hg;

  AU.music.gain.setTargetAtTime(0.55,c.currentTime,1.2);
  AU.step=0;AU.next=c.currentTime+0.15;
  AU.timer=setInterval(schedule,25);
}

function schedule(){
  const c=AU.ctx;if(!c||AU.muted)return;
  const spb=60/AU.bpm/4;
  let guard=0;
  while(AU.next<c.currentTime+0.14&&guard++<40){
    playStep(AU.step,AU.next,spb);
    AU.next+=spb;
    AU.step=(AU.step+1)%64;
  }
}

function playStep(step,t,sp){
  const c=AU.ctx;if(!c)return;
  const bar=(step/16)|0,s=step%16,ch=CHORDS[bar],I=AU.intensity;

  /* pad — one chord per bar */
  if(s===0){
    ch.tones.forEach((f,i)=>{
      const osc=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();
      osc.type="sawtooth";osc.frequency.value=f*(i===2?1:0.5);
      osc.detune.value=(i-1)*7;
      fl.type="lowpass";fl.frequency.setValueAtTime(500+I*2600,t);
      fl.frequency.linearRampToValueAtTime(420+I*2000,t+sp*14);
      fl.Q.value=0.9;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.055,t+sp*2.2);
      g.gain.exponentialRampToValueAtTime(0.0001,t+sp*15.5);
      osc.connect(fl);fl.connect(g);g.connect(AU.music);
      osc.start(t);osc.stop(t+sp*16);
    });
  }

  /* bass */
  const bassPat=[0,3,6,8,11,14];
  if(bassPat.indexOf(s)>=0){
    const oct=s===8?2:1;
    const osc=c.createOscillator(),g=c.createGain();
    osc.type="triangle";osc.frequency.value=ch.root*oct;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.16,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+sp*2.4);
    osc.connect(g);g.connect(AU.music);
    osc.start(t);osc.stop(t+sp*2.6);
  }

  /* arpeggio bed */
  if(s%2===0||I>0.55){
    const n=ch.tones[(step*3)%3]*(s%4===0?2:1);
    const osc=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();
    osc.type="triangle";osc.frequency.value=n;
    fl.type="lowpass";fl.frequency.value=2200+I*3400;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.035+I*0.05,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t+sp*1.7);
    osc.connect(fl);fl.connect(g);g.connect(AU.music);
    osc.start(t);osc.stop(t+sp*2);
  }

  /* lead motif, enters with intensity */
  const motif=[-1,4,-1,2,-1,0,-1,4,-1,2,-1,0,3,-1,2,-1];
  if(I>0.45&&motif[s]>=0&&bar%2===1){
    const f=ch.tones[motif[s]%3]*4;
    const osc=c.createOscillator(),g=c.createGain();
    osc.type="square";osc.frequency.value=f;
    const fl=c.createBiquadFilter();fl.type="lowpass";fl.frequency.value=3000;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.05,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+sp*3);
    osc.connect(fl);fl.connect(g);g.connect(AU.music);
    osc.start(t);osc.stop(t+sp*3.2);
  }

  /* drums */
  const kick=()=>{const o=c.createOscillator(),g=c.createGain();
    o.type="sine";o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(44,t+0.13);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.34+I*0.16,t+0.005);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.30);
    o.connect(g);g.connect(AU.music);o.start(t);o.stop(t+0.34)};
  const hat=(lv)=>{const src=c.createBufferSource();src.buffer=AU.noise;src.loop=true;src.playbackRate.value=2;
    const f=c.createBiquadFilter();f.type="highpass";f.frequency.value=7600;
    const g=c.createGain();g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(lv,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+0.06);
    src.connect(f);f.connect(g);g.connect(AU.music);src.start(t);src.stop(t+0.08)};
  const snare=()=>{const src=c.createBufferSource();src.buffer=AU.noise;src.loop=true;src.playbackRate.value=1.3;
    const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=1900;f.Q.value=0.9;
    const g=c.createGain();g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.20,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+0.19);
    src.connect(f);f.connect(g);g.connect(AU.music);src.start(t);src.stop(t+0.22)};

  if(s===0||s===8||(I>0.7&&s===10)||(I>0.85&&s===6))kick();
  if(I>0.3&&s%2===1)hat(0.035+I*0.05);
  if(I>0.55&&(s===4||s===12))snare();
  if(I>0.8&&s===14)hat(0.07);

  /* dynamic mix */
  AU.music.gain.setTargetAtTime(0.50+I*0.34,c.currentTime,0.6);
  if(AU.wind)AU.wind.g.gain.setTargetAtTime(0.035+I*0.10,c.currentTime,1.4);
  if(AU.hailBed)AU.hailBed.gain.setTargetAtTime(Math.max(0.0001,I*0.055),c.currentTime,1.2);
}

function setMuted(v){
  AU.muted=v;
  try{localStorage.setItem(MUTE_KEY,v?"1":"0")}catch(e){}
  const c=initAudio();
  if(c&&AU.out)AU.out.gain.setTargetAtTime(v?0:0.85,c.currentTime,0.08);
  muteBtn.textContent=v?"\u{1F507}":"\u266B";
  muteBtn.setAttribute("aria-label",v?"Unmute music":"Mute music");
  muteBtn.classList.toggle("on",v);
}

/* ================= DOM refs ================= */
const muteBtn=ui.querySelector("#hM"),pauseBtn=ui.querySelector("#hP");
setMuted(AU.muted);

/* ================= WORLD STATE ================= */
let layers=null,stars=[],specks=[],glints=[],pines=[];
let hail=[],pickups=[],parts=[],texts=[],prints=[],banners=[];
let scroll=0,wind=0,windTarget=0,windTimer=0,flash=0,bolt=null,lightTimer=4;
let running=false,finished=false,paused=false,alive=true;
let distance=0,embers=0,warmth=100,shield=0,combo=0,bestCombo=0;
let tier=0,tierFlash=0,shake=0,freeze=0,timeScale=1,slowmo=0,starBoost=0;
let spawnT=0,pickT=0,tick=0,deaths=0;
let loopOn=false,rafId=0,lastT=0,acc=0;

const TIERS=[
 {at:0,   name:"DRIZZLE", gap:46, spd:4.4},
 {at:300, name:"SLEET",   gap:38, spd:5.2},
 {at:800, name:"HAIL",    gap:31, spd:6.0},
 {at:1600,name:"BLIZZARD",gap:25, spd:6.9},
 {at:2800,name:"WHITEOUT",gap:20, spd:7.8}
];

const P={x:120,y:GROUND,vx:0,vy:0,w:26,h:48,jumps:0,coyote:0,buffer:0,ground:true,
  slide:0,stride:0,lean:0,sx:1,sy:1,scarf:[],trails:[],plant:0,airT:0};
const K={l:false,r:false};

/* ---- touch UI ---- */
function hold(id,down,up){
  const b=ui.querySelector(id);if(!b)return;
  const on=e=>{e.preventDefault();resumeAudio();startBed();b.classList.add("on");down()};
  const off=e=>{if(e)e.preventDefault();b.classList.remove("on");if(up)up()};
  b.addEventListener("pointerdown",e=>{b.setPointerCapture&&b.setPointerCapture(e.pointerId);on(e)});
  b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);
  b.addEventListener("pointerleave",e=>{if(e.buttons===0)off(e)});
  b.addEventListener("contextmenu",e=>e.preventDefault());
}
hold("#hL",()=>{K.l=true},()=>{K.l=false});
hold("#hR",()=>{K.r=true},()=>{K.r=false});
hold("#hJ",()=>{jumpHeldBtn=true;doJump()},()=>{jumpHeldBtn=false});
hold("#hS",()=>doSlide(),null);
let jumpHeldBtn=false,jumpHoldUntil=0;
function jumpIsHeld(){return jumpHeldBtn||performance.now()<jumpHoldUntil}
muteBtn.addEventListener("click",e=>{e.preventDefault();resumeAudio();if(!AU.on)startBed();setMuted(!AU.muted)});
pauseBtn.addEventListener("click",e=>{e.preventDefault();togglePause()});

/* ---- canvas gestures ---- */
let gDown=false,gx=0,gy=0,gMoved=0,gT=0;
function toWorld(e){
  const r=canvas.getBoundingClientRect();
  return {x:(e.clientX-r.left)/r.width*VW, y:(e.clientY-r.top)/r.height*VH};
}
stage.addEventListener("pointerdown",e=>{
  if(e.target.closest&&e.target.closest(".hbtn"))return;
  resumeAudio();startBed();
  if(paused){togglePause();return}
  if(finished){begin();return}
  const p=toWorld(e);gDown=true;gx=p.x;gy=p.y;gMoved=0;gT=performance.now();
});
stage.addEventListener("pointermove",e=>{
  if(!gDown)return;
  const p=toWorld(e);const dx=p.x-gx,dy=p.y-gy;
  gMoved=Math.max(gMoved,Math.abs(dx)+Math.abs(dy));
  if(dy>42&&Math.abs(dy)>Math.abs(dx)*1.1){doSlide();gDown=false;return}
  if(dy<-46){doJump();gDown=false;return}
  K.l=dx<-16;K.r=dx>16;
});
function gestureEnd(){
  if(!gDown)return;gDown=false;K.l=false;K.r=false;
  if(gMoved<14&&performance.now()-gT<350){doJump()}
}
stage.addEventListener("pointerup",gestureEnd);
stage.addEventListener("pointercancel",()=>{gDown=false;K.l=false;K.r=false});
stage.addEventListener("contextmenu",e=>e.preventDefault());

/* ---- keyboard ---- */
function onKeyDown(e){
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code)>=0)e.preventDefault();
  resumeAudio();
  if(e.repeat&&(e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW"))return;
  if(e.code==="KeyP"||e.code==="Escape"){togglePause();return}
  if(e.code==="KeyM"){setMuted(!AU.muted);return}
  if(finished&&(e.code==="Space"||e.code==="Enter")){begin();return}
  if(paused&&(e.code==="Space"||e.code==="Enter")){togglePause();return}
  startBed();
  if(e.code==="ArrowLeft"||e.code==="KeyA")K.l=true;
  if(e.code==="ArrowRight"||e.code==="KeyD")K.r=true;
  if(e.code==="ArrowUp"||e.code==="KeyW"||e.code==="Space"){jumpHeldBtn=true;doJump()}
  if(e.code==="ArrowDown"||e.code==="KeyS")doSlide();
}
function onKeyUp(e){
  if(e.code==="ArrowLeft"||e.code==="KeyA")K.l=false;
  if(e.code==="ArrowRight"||e.code==="KeyD")K.r=false;
  if(e.code==="ArrowUp"||e.code==="KeyW"||e.code==="Space")jumpHeldBtn=false;
}
window.addEventListener("keydown",onKeyDown,{passive:false});
window.addEventListener("keyup",onKeyUp);

function togglePause(){
  if(finished)return;
  paused=!paused;
  pauseBtn.classList.toggle("on",paused);
  pauseBtn.innerHTML=paused?"&#9654;":"&#10073;&#10073;";
  pauseBtn.setAttribute("aria-label",paused?"Resume game":"Pause game");
  if(paused){if(AU.ctx)AU.music.gain.setTargetAtTime(0.06,AU.ctx.currentTime,0.2)}
  else{lastT=performance.now();acc=0}
}
document.addEventListener("visibilitychange",()=>{
  if(document.hidden&&running&&!finished&&!paused)togglePause();
});

/* ================= ACTIONS ================= */
function doJump(){
  if(!running||finished||paused)return;
  P.buffer=9;
  jumpHoldUntil=performance.now()+190;
}
function doSlide(){
  if(!running||finished||paused)return;
  if(P.ground&&P.slide<=0){
    P.slide=26;
    noiseHit({type:"bandpass",f:1500,f2:280,q:2,dur:0.32,gain:0.11});
    puff(P.x+4,GROUND,"#9dd8ff",7);
  }else if(!P.ground&&P.vy>-3){P.vy+=2.6;P.slide=10}
}
function puff(x,y,col,n,up){
  const c=Math.min(n,RM?4:12);
  for(let i=0;i<c;i++){
    if(parts.length>330)break;
    parts.push({x:x+(Math.random()-0.5)*16,y:y-Math.random()*8,
      vx:(Math.random()-0.5)*3.4-(up?0:1.4),vy:-Math.random()*2.4-(up?1:0),
      r:1.4+Math.random()*2.6,col:col,a:1,dec:0.045,g:0.03});
  }
}
function shard(x,y,big){
  const n=big?16:8;
  for(let i=0;i<n;i++){
    if(parts.length>330)break;
    const ang=Math.random()*TAU,spd=2+Math.random()*5.5;
    parts.push({x:x,y:y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-1.6,
      r:2+Math.random()*3,col:Math.random()<0.5?"#bfe9ff":"#ffffff",a:1,dec:0.035,g:0.16,rot:Math.random()*TAU,rs:(Math.random()-0.5)*0.4,ice:true});
  }
}
function floatTxt(t,x,y,col){
  texts.push({t:t,x:x,y:y,vy:-1.3,a:1,col:col});
}
function banner(t,col){banners.push({t:t,col:col,life:150,max:150})}

/* ================= LAYERS ================= */
function ridgePath(c,P_,base,amps){
  c.beginPath();c.moveTo(0,VH);
  for(let x=0;x<=P_;x+=4){
    let y=base;
    for(let i=0;i<amps.length;i++){const a=amps[i];y-=a[0]*Math.sin(TAU*a[1]*x/P_+a[2])}
    c.lineTo(x,y);
  }
  c.lineTo(P_,VH);c.closePath();
}
function makeLayer(P_,draw){
  const cv=document.createElement("canvas");
  cv.width=Math.max(1,Math.round(P_*DPR));cv.height=Math.max(1,Math.round(VH*DPR));
  const cc=cv.getContext("2d");cc.setTransform(DPR,0,0,DPR,0,0);
  draw(cc,P_);return cv;
}
function buildLayers(){
  const P_=Math.ceil(VW*1.25);
  const far=makeLayer(P_,(c,P2)=>{
    const g=c.createLinearGradient(0,0,0,GROUND);
    g.addColorStop(0,"#0a1326");g.addColorStop(1,"#16273f");
    c.fillStyle=g;ridgePath(c,P2,GROUND-152,[[44,1,0.4],[25,2,1.15],[14,3,2.3],[7,5,0.7]]);
    c.fill();
    c.fillStyle="rgba(190,225,255,0.16)";
    c.save();c.clip();
    for(let x=0;x<P2;x+=4){
      let y=GROUND-152;
      const amps=[[44,1,0.4],[25,2,1.15],[14,3,2.3],[7,5,0.7]];
      for(let i=0;i<amps.length;i++){const a=amps[i];y-=a[0]*Math.sin(TAU*a[1]*x/P2+a[2])}
      c.fillRect(x,y,4,10+hash(x)*16);
    }
    c.restore();
  });
  const mid=makeLayer(P_,(c,P2)=>{
    c.fillStyle="#0c1a2e";
    ridgePath(c,P2,GROUND-92,[[30,1,2.0],[17,2,0.35],[10,3,1.7]]);
    c.fill();
    const gy=GROUND-92;
    for(let x=0;x<P2;x+=7){
      let y=gy;
      const amps=[[30,1,2.0],[17,2,0.35],[10,3,1.7]];
      for(let i=0;i<amps.length;i++){const a=amps[i];y-=a[0]*Math.sin(TAU*a[1]*x/P2+a[2])}
      const r=hash(x*1.7);
      if(r>0.42){
        const h=10+r*17,w=4+r*4;
        c.fillStyle="#0a1526";
        c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y+3);c.lineTo(x-w,y+3);c.closePath();c.fill();
        c.fillStyle="rgba(200,232,255,0.10)";
        c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w*0.5,y-h*0.45);c.lineTo(x,y-h*0.2);c.closePath();c.fill();
      }
    }
  });
  const near=makeLayer(P_,(c,P2)=>{
    c.fillStyle="#0b1524";
    ridgePath(c,P2,GROUND-38,[[16,1,3.4],[9,2,2.2]]);
    c.fill();
    c.strokeStyle="rgba(150,205,255,0.13)";c.lineWidth=1.4;c.stroke();
  });
  const clouds=makeLayer(P_,(c,P2)=>{
    for(let i=0;i<34;i++){
      const x=hash(i*3.1)*P2,y=hash(i*7.7)*118,r=34+hash(i*5.3)*70;
      const g=c.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,"rgba(126,158,200,0.30)");
      g.addColorStop(0.5,"rgba(72,96,140,0.16)");
      g.addColorStop(1,"rgba(40,60,100,0)");
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    }
  });
  const fog=makeLayer(P_,(c,P2)=>{
    for(let i=0;i<16;i++){
      const x=hash(i*11.3)*P2,y=GROUND-30-hash(i*4.9)*70,r=50+hash(i*9.1)*90;
      const g=c.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,"rgba(190,220,255,0.13)");
      g.addColorStop(1,"rgba(190,220,255,0)");
      c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*0.42,0,0,TAU);c.fill();
    }
  });
  layers={far:far,mid:mid,near:near,clouds:clouds,fog:fog,W:P_};

  stars=[];for(let i=0;i<110;i++)stars.push({x:Math.random()*P_,y:Math.random()*(GROUND-140),r:0.4+Math.random()*1.3,t:Math.random()*TAU,s:0.6+Math.random()*2});
  specks=[];
  for(let i=0;i<170;i++)specks.push({x:Math.random()*VW,y:GROUND+6+Math.random()*(VH-GROUND-8),w:2+Math.random()*9,a:0.05+Math.random()*0.16});
  glints=[];
  for(let i=0;i<44;i++)glints.push({x:Math.random()*VW,y:GROUND+4+Math.random()*(VH-GROUND-6),t:Math.random()*TAU,s:1+Math.random()*2});
  pines=[];
}

function resize(){
  const r=stage.getBoundingClientRect();
  const cw=Math.max(120,Math.round(r.width)),chh=Math.max(90,Math.round(r.height));
  DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(cw*DPR);canvas.height=Math.round(chh*DPR);
  SCALE=chh/VH;
  VW=VH*(cw/chh);
  ctx.setTransform(DPR*SCALE,0,0,DPR*SCALE,0,0);
  ctx.imageSmoothingEnabled=true;
  buildLayers();
  buildWeather();
}
let rTimer=0;
function scheduleRelayout(){clearTimeout(rTimer);rTimer=setTimeout(()=>{if(alive)resize()},150)}
window.addEventListener("orientationchange",scheduleRelayout);

/* ================= SPAWN ================= */
function freeLanes(blocked){
  const lanes=5,out=[];
  for(let i=0;i<lanes;i++)if(blocked.indexOf(i)<0)out.push(i);
  return out;
}
function spawnHail(){
  const t=TIERS[tier];
  if(hail.length>7+tier*2)return;
  const lanes=5;
  const giant=Math.random()<0.14+tier*0.03;
  const laneCount=giant?2:1;
  const start=Math.floor(Math.random()*(lanes-laneCount+1));
  const blocked=[];
  for(let i=start;i<start+laneCount;i++)blocked.push(i);
  const laneW=(VW-70)/lanes;
  for(let i=0;i<laneCount;i++){
    const lane=blocked[i];
    const x=35+laneW*(lane+0.5)+(Math.random()-0.5)*laneW*0.4;
    const big=giant&&i===start;
    hail.push({
      x:x,y:-30,vx:-1.4-Math.random()*2.4,
      vy:t.spd+Math.random()*3.4,
      r:big?17+Math.random()*7:6.5+Math.random()*5,
      giant:big,rot:Math.random()*TAU,rs:(Math.random()-0.5)*0.16,
      near:false,pass:0
    });
  }
}
function spawnPickup(){
  const roll=Math.random();
  const type=roll<0.55?"ember":roll<0.77?"shield":roll<0.90?"feather":"star";
  const y=type==="ember"?GROUND-30-Math.random()*140:GROUND-40-Math.random()*150;
  pickups.push({x:VW+30,y:y,vx:-2.2-Math.random()*1.6,vy:0,type:type,p:0});
}

/* ================= STEP (fixed 1/60) ================= */
function step(){
  tick++;
  const t=TIERS[tier];
  const prevTier=tier;
  for(let i=TIERS.length-1;i>=0;i--){if(distance>=TIERS[i].at){tier=i;break}}
  if(tier!==prevTier){tierFlash=180;sfxTier();banner(TIERS[tier].name,"#8bdcff");
    feedback("Storm tier: "+TIERS[tier].name+" \u00b7 keep moving!");}

  const rush=1+(tier*0.14);
  scroll+=t.spd*rush*0.55;
  distance+=(t.spd*rush)*0.075;
  AU.intensity=clamp(tier/4+Math.min(distance/4200,0.35),0,1);

  /* warmth */
  warmth-=(1.5+tier*0.42)/60;
  if(warmth<=0){warmth=0;gameOver("FROZEN");return}
  if(warmth<22&&tick%90===0)floatTxt("COLD!",P.x+P.w/2,P.y-P.h-6,"#7dd3fc");

  /* wind gusts */
  windTimer--;
  if(windTimer<=0){windTimer=300+Math.random()*360;windTarget=(Math.random()<0.5?-1:1)*(0.5+Math.random()*1.1*(tier/4+0.3));
    if(Math.abs(windTarget)>0.7)banner("GUST!", "#cbd5e1")}
  wind=lerp(wind,windTarget,0.012);

  /* input accel */
  const icy=isIce(P.x);
  const accel=icy?0.10:0.20, maxV=(icy?6.4:5.6);
  if(K.l)P.vx-=accel*maxV*0.28;
  else if(K.r)P.vx+=accel*maxV*0.28;
  else P.vx*= icy?0.985:0.86;
  P.vx+=wind*0.05;
  P.vx=clamp(P.vx,-maxV,maxV);
  P.x+=P.vx;
  if(P.x<26){P.x=26;P.vx=0}
  if(P.x>VW-52){P.x=VW-52;P.vx=0}
  P.lean=lerp(P.lean,clamp(P.vx*0.022,-0.16,0.16),0.12);

  /* jump: coyote + buffer + double + variable */
  if(P.buffer>0)P.buffer--;
  if(P.coyote>0)P.coyote--;
  if(P.buffer>0&&(P.coyote>0||P.jumps<2)){
    P.vy=-11.6*(P.jumps===0?1:0.92);
    P.jumps=P.coyote>0?1:P.jumps+1;
    P.coyote=0;P.buffer=0;P.ground=false;P.slide=0;
    P.sy=1.22;P.sx=0.82;
    sfxJump();puff(P.x+P.w/2,GROUND,"#dff1ff",6);
    if(P.jumps===2)floatTxt("DOUBLE!",P.x+P.w/2,P.y-P.h-14,"#a9f36c");
  }
  if(P.ground){
    P.vy=0;P.airT=0;
    P.coyote=8;P.jumps=0;
  }else{
    P.vy+=0.60;P.airT++;
    if(P.vy<0&&!jumpIsHeld())P.vy+=0.62;
    P.y+=P.vy;
    if(P.y>=GROUND){P.y=GROUND;P.vy=0;P.ground=true;P.sy=0.76;P.sx=1.24;
      sfxLand();puff(P.x+P.w/2,GROUND,"#e6f3ff",9)}
  }

  /* squash recovery */
  P.sx=lerp(P.sx,1,0.16);P.sy=lerp(P.sy,1,0.16);

  /* slide */
  if(P.slide>0){
    P.slide--;
    if(tick%4===0)puff(P.x-4,GROUND,"#a8dcff",2);
    if(P.slide<=0)P.slide=0;
  }

  /* run cycle */
  if(P.ground&&!P.slide){
    const spd=Math.abs(P.vx)/5.6;
    P.stride+=0.26+spd*0.20+(tier*0.012);
  }else if(P.ground&&P.slide){P.stride+=0.1}
  else P.stride+=0.10;

  /* footprints */
  if(P.ground&&!P.slide){
    const cyc=P.stride%TAU;
    if(P.plant===0&&cyc>Math.PI*1.0&&cyc<Math.PI*1.35){
      prints.push({x:P.x+P.w*0.5+6,y:GROUND+1,a:0.5});P.plant=1;
    }else if(cyc<0.6||cyc>Math.PI*1.6)P.plant=0;
  }
  for(let i=prints.length-1;i>=0;i--){prints[i].a-=0.008;if(prints[i].a<=0)prints.splice(i,1)}

  /* scarf verlet */
  if(P.scarf.length===0){for(let i=0;i<9;i++)P.scarf.push({x:P.x-2,y:P.y-P.h+6,px:P.x-2,py:P.y-P.h+6})}
  const anchorX=P.x+(P.slide?6:4),anchorY=P.y-(P.slide?16:P.h-6);
  const head=P.scarf[0];
  head.px=head.x;head.py=head.y;head.x=anchorX;head.y=anchorY;
  for(let i=1;i<P.scarf.length;i++){
    const n=P.scarf[i],vx=(n.x-n.px)*0.93,vy=(n.y-n.py)*0.93;
    n.px=n.x;n.py=n.y;
    n.x+=vx+(-1.3-wind*1.0)+Math.sin(tick*0.09+i)*0.26;
    n.y+=vy+0.34+Math.cos(tick*0.11+i)*0.20;
  }
  for(let pass=0;pass<2;pass++){
    for(let i=1;i<P.scarf.length;i++){
      const pv=P.scarf[i-1],n=P.scarf[i];
      const dx=n.x-pv.x,dy=n.y-pv.y,d=Math.hypot(dx,dy)||1,want=6.0;
      const f=(d-want)/d*0.6;
      n.x-=dx*f;n.y-=dy*f;
      pv.x+=dx*f*0.35;pv.y+=dy*f*0.35;
    }
  }
  P.scarf[0].x=anchorX;P.scarf[0].y=anchorY;

  /* trails */
  if(tier>=2){P.trails.push({x:P.x,y:P.y,a:0.34,slide:P.slide>0});
    if(P.trails.length>11)P.trails.shift()}
  for(let i=P.trails.length-1;i>=0;i--){P.trails[i].a-=0.03;if(P.trails[i].a<=0)P.trails.splice(i,1)}

  /* spawn */
  spawnT--;
  if(spawnT<=0){spawnHail();spawnT=Math.max(14,t.gap-Math.random()*8)}
  pickT--;
  if(pickT<=0){spawnPickup();pickT=150+Math.random()*90}

  const sliding=P.slide>0;
  const hx=P.x+3,hw=P.w-6;
  const hy=sliding?P.y-24:P.y-P.h+3,hh=sliding?22:P.h-6;
  const hcx=hx+hw/2,hcy=hy+hh/2;

  /* hail */
  for(let i=hail.length-1;i>=0;i--){
    const h=hail[i];
    h.x+=h.vx*(1+wind*0.25);h.y+=h.vy;h.rot+=h.rs;
    h.vy+=0.012;
    if(h.y>=GROUND){
      explode(h,true);
      if(h.giant){shake=Math.max(shake,RM?4:9);noiseHit({type:"lowpass",f:900,f2:160,dur:0.4,gain:0.16})}
      else noiseHit({type:"highpass",f:2400,dur:0.14,gain:0.05});
      hail.splice(i,1);continue;
    }
    const cx=clamp(h.x,hx,hx+hw),cy=clamp(h.y,hy,hy+hh);
    const dx=h.x-cx,dy=h.y-cy;
    if(dx*dx+dy*dy<h.r*h.r){
      explode(h,false);
      if(shield>0){
        shield=0;combo=0;freeze=7;shake=Math.max(shake,RM?5:11);
        sfxBreak();floatTxt("SHIELD DOWN",P.x-14,P.y-P.h-10,"#8bdcff");
      }else{gameOver("STRUCK");return}
      hail.splice(i,1);continue;
    }
    if(!h.near&&h.y>hy-6&&h.y<hy+hh+40){
      const ncx=clamp(h.x,hx,hx+hw);
      const nd=Math.abs(h.x-ncx);
      if(nd<h.r+26&&!((h.x>hx&&h.x<hx+hw))){
        h.near=true;
        combo=Math.min(combo+1,99);bestCombo=Math.max(bestCombo,combo);
        const bonus=6+combo*2;
        distance+=bonus;
        if(combo>1&&combo%3===0)floatTxt("\u00d7"+combo+" NEAR MISS  +"+bonus+"m",P.x+P.w,P.y-P.h-16,"#a9f36c");
        else if(combo%3===1)sfxNear();
      }
    }
  }

  /* pickups */
  for(let i=pickups.length-1;i>=0;i--){
    const p=pickups[i];
    p.x+=p.vx;p.p+=0.11;
    if(starBoost>0&&p.type==="ember"){const dx=hcx-p.x;p.x+=Math.sign(dx)*Math.min(3,Math.abs(dx)*0.06)}
    const dx=p.x-hcx,dy=p.y-hcy;
    if(Math.sqrt(dx*dx+dy*dy)<30){
      collect(p);pickups.splice(i,1);continue;
    }
    if(p.x<-40)pickups.splice(i,1);
  }

  /* slowmo / boosts */
  if(slowmo>0){slowmo--;timeScale=0.45}else timeScale=1;
  if(starBoost>0)starBoost--;
  if(tierFlash>0)tierFlash--;
  for(let i=banners.length-1;i>=0;i--){banners[i].life--;if(banners[i].life<=0)banners.splice(i,1)}

  /* lightning */
  lightTimer--;
  if(lightTimer<=0){
    lightTimer=140+Math.random()*260;
    flash=1;
    if(!RM){const bx=40+Math.random()*(VW-80);bolt=[{x:bx,y:0}];
      let y=0,x=bx;
      while(y<GROUND-40){y+=16+Math.random()*22;x+=(Math.random()-0.5)*34;bolt.push({x:x,y:y})}
      setTimeout(()=>{bolt=null},260)}
    noiseHit({type:"lowpass",f:520,f2:120,dur:1.1,gain:0.10,attack:0.05});
  }
  flash*=0.86;if(flash<0.02)flash=0;

  /* particles */
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.x+=p.vx+wind*0.5;p.y+=p.vy;p.vy+=(p.g||0.06);p.a-=p.dec;
    if(p.a<=0||p.y>VH+10)parts.splice(i,1);
  }
  for(let i=texts.length-1;i>=0;i--){
    const ft=texts[i];ft.y+=ft.vy;ft.a-=0.016;
    if(ft.a<=0)texts.splice(i,1);
  }
  if(shake>0)shake*=0.87;if(shake<0.3)shake=0;
  if(freeze>0)freeze--;
}
function isIce(x){
  const seg=Math.floor((x+scroll*0.6)/340);
  return hash(seg*3.7)>0.72;
}
function collect(p){
  if(p.type==="ember"){
    embers++;warmth=Math.min(100,warmth+24);distance+=40;
    sfxEmber();floatTxt("+40m  \u00b7  WARM",P.x,P.y-P.h-8,"#fdba74");
    puff(p.x,p.y,"#ff9d4d",8);
  }else if(p.type==="shield"){
    shield=1;sfxShield();floatTxt("SHIELD UP",P.x,P.y-P.h-8,"#8bdcff");
    puff(p.x,p.y,"#8bdcff",9);
  }else if(p.type==="feather"){
    slowmo=210;sfxFeather();floatTxt("SLOW\u2011MO",P.x,P.y-P.h-8,"#e2e8f0");
    banner("TAILWIND SLOW\u2011MO","#e2e8f0");
  }else{
    starBoost=480;sfxStar();floatTxt("2\u00d7 DISTANCE!",P.x,P.y-P.h-8,"#ffe38a");
    banner("STAR POWER \u00b7 2\u00d7","#ffe38a");
  }
}
function explode(h,ground){
  const n=h.giant?16:8;
  for(let i=0;i<n;i++){
    if(parts.length>330)break;
    const ang=Math.random()*TAU,spd=1.6+Math.random()*5;
    parts.push({x:h.x,y:h.y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-(ground?-2:0),
      r:1.4+Math.random()*2.4,col:Math.random()<0.5?"#bfe9ff":"#ffffff",a:1,dec:0.04,g:0.12,ice:true});
  }
  if(ground){
    parts.push({x:h.x,y:GROUND,vx:0,vy:0,r:h.r*1.1,col:"rgba(226,244,255,0.5)",a:0.8,dec:0.05,g:0,ring:true});
  }
}

/* ================= GAME FLOW ================= */
function gameOver(reason){
  if(finished)return;
  finished=true;running=false;freeze=10;shake=RM?6:16;
  sfxHit();
  if(AU.ctx){AU.music.gain.setTargetAtTime(0.10,AU.ctx.currentTime,0.5)}
  const d=Math.floor(distance);
  const msg=reason==="FROZEN"?"The cold caught you at ":"A hailstone struck you at ";
  const medal=d>=5000?"PLATINUM":d>=2500?"GOLD":d>=1200?"SILVER":d>=500?"BRONZE":"NO MEDAL";
  feedback(msg+d+"m \u00b7 best combo \u00d7"+Math.max(1,bestCombo)+" \u00b7 "+medal);
  result("Storm survived!  "+d+"m",
    reason==="FROZEN"?"You froze out after "+d+" metres. Grab embers next run.":"You were struck after "+d+" metres through the storm.",
    d+"m","hailstorm",d,false);
  help.textContent="Tap the stage or press Space to run again \u00b7 P to pause \u00b7 M to mute";
}
function begin(){
  running=true;finished=false;paused=false;freeze=0;timeScale=1;
  distance=0;embers=0;warmth=100;shield=0;combo=0;bestCombo=0;
  tier=0;tierFlash=120;shake=0;slowmo=0;starBoost=0;
  hail=[];pickups=[];parts=[];texts=[];prints=[];banners=[];
  scroll=0;wind=0;windTarget=0;windTimer=240;flash=0;bolt=null;lightTimer=200;
  spawnT=40;pickT=110;tick=0;acc=0;
  P.x=Math.min(120,VW*0.3);P.y=GROUND;P.vx=0;P.vy=0;P.jumps=0;P.coyote=0;
  P.buffer=0;P.ground=true;P.slide=0;P.stride=0;P.lean=0;P.sx=1;P.sy=1;P.trails=[];P.scarf=[];
  K.l=false;K.r=false;
  pauseBtn.classList.remove("on");pauseBtn.innerHTML="&#10073;&#10073;";
  $("result").style.display="none";
  feedback("Dodge the hail, grab embers to stay warm. Near misses build your bonus.");
  banner("RUN!","#a9f36c");
  resumeAudio();startBed();
  if(AU.ctx)AU.music.gain.setTargetAtTime(0.55,AU.ctx.currentTime,0.8);
  help.textContent="On\u2011screen buttons \u00b7 tap to jump \u00b7 swipe down to slide \u00b7 keys: \u2190\u2192 move, Space jump, S slide, P pause, M mute";
  startLoop();
}
function startLoop(){
  if(loopOn)return;
  loopOn=true;lastT=performance.now();acc=0;
  rafId=requestAnimationFrame(frame);
}
function frame(now){
  if(!alive){loopOn=false;return}
  rafId=requestAnimationFrame(frame);
  let dt=(now-lastT)/1000;lastT=now;
  if(dt>0.25)dt=0.25;
  if(!document.hidden&&running&&!finished&&!paused){
    if(freeze>0){/* hit-stop */}
    else{
      acc+=dt*timeScale;
      let n=0;
      while(acc>=1/60&&n<5){step();acc-=1/60;n++;
        if(finished||paused)break}
      if(acc>0.4)acc=0;
    }
  }
  render();
}
restartFn=()=>{begin()};

/* ================= RENDER ================= */
function drawLayer(cv,par){
  if(!cv)return;
  const W=layers.W;
  let off=(scroll*par)%W;if(off<0)off+=W;
  ctx.drawImage(cv,-off,0,W,VH);
  ctx.drawImage(cv,-off+W,0,W,VH);
}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,VH);
  const cold=clamp(tier/4,0,1);
  g.addColorStop(0,"#05080f");
  g.addColorStop(0.45,"rgba("+(10+cold*18)+","+(20+cold*20)+","+(44+cold*26)+",1)");
  g.addColorStop(1,"rgba(18,34,56,1)");
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
}
function drawStars(){
  const now=performance.now()/1000;
  ctx.save();
  for(let i=0;i<stars.length;i++){
    const s=stars[i];
    let x=(s.x-scroll*0.05)%layers.W;if(x<0)x+=layers.W;
    if(x>VW+4)continue;
    const tw=0.45+0.55*Math.abs(Math.sin(now*s.s+s.t));
    ctx.globalAlpha=tw*(0.75-tier*0.11);
    ctx.fillStyle="#dcefff";
    ctx.beginPath();ctx.arc(x,s.y,s.r,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawMoon(){
  const mx=VW*0.76,my=64;
  ctx.save();
  const halo=ctx.createRadialGradient(mx,my,4,mx,my,86);
  halo.addColorStop(0,"rgba(226,244,255,0.55)");
  halo.addColorStop(0.35,"rgba(150,200,255,0.16)");
  halo.addColorStop(1,"rgba(120,180,255,0)");
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mx,my,86,0,TAU);ctx.fill();
  ctx.fillStyle="#f2f8ff";ctx.beginPath();ctx.arc(mx,my,17,0,TAU);ctx.fill();
  ctx.fillStyle="rgba(180,205,235,0.55)";
  ctx.beginPath();ctx.arc(mx-5,my-4,4.4,0,TAU);ctx.arc(mx+6,my+5,3,0,TAU);ctx.arc(mx+3,my-8,2.2,0,TAU);ctx.fill();
  ctx.restore();
}
function drawAurora(){
  const now=performance.now()/1000;
  ctx.save();ctx.globalCompositeOperation="lighter";
  for(let b=0;b<3;b++){
    const y=52+b*26,amp=10+b*6;
    ctx.beginPath();
    for(let x=0;x<=VW;x+=14){
      const yy=y+Math.sin(x*0.012+now*0.5+b*1.7)*amp+Math.sin(x*0.031-now*0.32)*5;
      if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
    }
    ctx.strokeStyle="rgba("+(40+b*30)+","+(170+b*20)+","+(150+b*40)+","+(0.10-tier*0.014)+")";
    ctx.lineWidth=10+b*5;ctx.lineCap="round";ctx.stroke();
  }
  ctx.restore();
}
function drawClouds(){
  drawLayer(layers.clouds,0.07);
  drawLayer(layers.clouds,0.13);
  if(tier>=2){
    ctx.save();ctx.globalAlpha=(tier-1)*0.10;
    ctx.fillStyle="#0a121f";ctx.fillRect(0,0,VW,120);ctx.restore();
  }
}
function drawRidges(){
  drawLayer(layers.far,0.09);
  drawLayer(layers.mid,0.24);
  drawLayer(layers.near,0.47);
}
function drawGround(){
  const g=ctx.createLinearGradient(0,GROUND,0,VH);
  g.addColorStop(0,"#1e3a5c");g.addColorStop(0.10,"#152a44");g.addColorStop(0.55,"#0d1a2c");g.addColorStop(1,"#070d17");
  ctx.fillStyle=g;ctx.fillRect(0,GROUND,VW,VH-GROUND);

  ctx.save();ctx.beginPath();ctx.rect(0,GROUND,VW,VH-GROUND);ctx.clip();
  for(let i=0;i<specks.length;i++){
    const s=specks[i];
    let x=(s.x-scroll)%VW;if(x<0)x+=VW;
    ctx.fillStyle="rgba(190,225,255,"+s.a+")";
    ctx.fillRect(x,s.y,s.w,1);
  }
  /* ice patches */
  for(let k=-1;k<Math.ceil(VW/340)+1;k++){
    const segBase=Math.floor((scroll*0.6)/340)+k;
    const wx=segBase*340-(scroll*0.6);
    if(hash(segBase*3.7)>0.72){
      const gg=ctx.createLinearGradient(wx,0,wx+300,0);
      gg.addColorStop(0,"rgba(140,215,255,0.03)");
      gg.addColorStop(0.5,"rgba(150,225,255,0.17)");
      gg.addColorStop(1,"rgba(140,215,255,0.03)");
      ctx.fillStyle=gg;ctx.fillRect(wx,GROUND+4,300,VH-GROUND-4);
    }
  }
  for(let i=0;i<glints.length;i++){
    const gl=glints[i];
    let x=(gl.x-scroll)%VW;if(x<0)x+=VW;
    const tw=Math.sin(performance.now()/260+gl.t);
    if(tw>0.72){
      ctx.strokeStyle="rgba(235,248,255,"+(tw-0.72)*3+")";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x-gl.s,gl.y);ctx.lineTo(x+gl.s,gl.y);
      ctx.moveTo(x,gl.y-gl.s);ctx.lineTo(x,gl.y+gl.s);ctx.stroke();
    }
  }
  for(let i=0;i<prints.length;i++){
    const p=prints[i];
    let x=(p.x-scroll*1.0)%VW;if(x<0)x+=VW;
    ctx.fillStyle="rgba(140,190,240,"+p.a*0.5+")";
    ctx.beginPath();ctx.ellipse(x,p.y,5,2.4,0,0,TAU);ctx.fill();
  }
  ctx.restore();

  const lg=ctx.createLinearGradient(0,GROUND-2,0,GROUND+10);
  lg.addColorStop(0,"rgba(105,183,255,0.85)");lg.addColorStop(1,"rgba(105,183,255,0)");
  ctx.fillStyle=lg;ctx.fillRect(0,GROUND-2,VW,12);
  ctx.strokeStyle="rgba(180,225,255,0.55)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(0,GROUND+0.5);ctx.lineTo(VW,GROUND+0.5);ctx.stroke();
}
function drawSpeedLines(){
  if(tier<1)return;
  const a=(tier-0)*0.045;
  ctx.save();ctx.globalCompositeOperation="lighter";
  ctx.strokeStyle="rgba(200,235,255,"+a+")";ctx.lineWidth=1;
  for(let i=0;i<10;i++){
    const y=(hash(i*13.1)*VH*0.8)+20;
    let x=(hash(i*7.7)*VW-scroll*(2.4+i*0.25))%VW;if(x<0)x+=VW;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-30-tier*14,y);ctx.stroke();
  }
  ctx.restore();
}
function drawFog(){
  drawLayer(layers.fog,0.7);
  if(tier>=4){
    ctx.save();ctx.fillStyle="rgba(214,234,255,0.16)";ctx.fillRect(0,0,VW,VH);ctx.restore();
  }
}
function drawWeather(){
  const now=performance.now()/1000;
  /* far snow */
  ctx.save();
  for(let i=0;i<weather.length;i++){
    const w=weather[i];
    w.x+=w.vx+wind*w.wf*0.6;
    w.y+=w.vy;
    if(w.y>VH){w.y=-6;w.x=Math.random()*VW}
    if(w.x<-8)w.x=VW+6;if(w.x>VW+8)w.x=-6;
    ctx.globalAlpha=w.a;
    ctx.fillStyle="#eaf5ff";
    if(w.streak){
      ctx.fillRect(w.x,w.y,w.r*0.5,w.r*4.2);
    }else{
      ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,TAU);ctx.fill();
    }
  }
  ctx.restore();
}
function drawHailMark(h){
  const gd=GROUND-h.y;
  if(gd<=0)return;
  const lx=h.x+(h.vx/h.vy)*gd;
  const a=clamp(1-gd/300,0,1);
  ctx.save();
  ctx.fillStyle="rgba(255,72,72,"+(0.10+a*0.34)+")";
  ctx.beginPath();ctx.ellipse(lx,GROUND+3,h.r*1.5,h.r*0.5,0,0,TAU);ctx.fill();
  if(h.giant){
    ctx.strokeStyle="rgba(255,140,90,"+(0.25+a*0.5)+")";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(lx,GROUND+3,h.r*2.1,h.r*0.7,0,0,TAU);ctx.stroke();
  }
  ctx.restore();
}
function drawHail(h){
  ctx.save();
  /* motion streak */
  const tl=clamp(h.vy/10,0.3,1.4);
  ctx.globalAlpha=0.30;
  const sg=ctx.createLinearGradient(h.x,h.y-h.r*4*tl,h.x,h.y);
  sg.addColorStop(0,"rgba(190,235,255,0)");
  sg.addColorStop(1,"rgba(215,245,255,0.85)");
  ctx.fillStyle=sg;
  ctx.beginPath();ctx.moveTo(h.x-h.r*0.55,h.y);
  ctx.lineTo(h.x+h.r*0.55,h.y);
  ctx.lineTo(h.x+h.r*0.28,h.y-h.r*4*tl);
  ctx.lineTo(h.x-h.r*0.28,h.y-h.r*4*tl);
  ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;

  ctx.translate(h.x,h.y);ctx.rotate(h.rot);
  if(h.giant){
    const gg=ctx.createRadialGradient(0,0,h.r*0.3,0,0,h.r*2.1);
    gg.addColorStop(0,"rgba(150,225,255,0.55)");gg.addColorStop(1,"rgba(120,200,255,0)");
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,h.r*2.1,0,TAU);ctx.fill();
  }
  const pts=h.giant?7:6;
  const body=ctx.createRadialGradient(-h.r*0.3,-h.r*0.35,h.r*0.1,0,0,h.r);
  body.addColorStop(0,"#ffffff");body.addColorStop(0.5,"#cfeeff");body.addColorStop(1,"#69c3f5");
  ctx.fillStyle=body;
  ctx.beginPath();
  for(let i=0;i<pts;i++){
    const ang=(i/pts)*TAU;
    const rr=h.r*(0.84+Math.sin(i*2.7+h.r)*0.18);
    const px=Math.cos(ang)*rr,py=Math.sin(ang)*rr;
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  ctx.closePath();ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,0.9)";ctx.lineWidth=1.1;ctx.stroke();
  /* facet + specular */
  ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=0.9;
  ctx.beginPath();
  for(let i=0;i<3;i++){const ang=(i/3)*TAU;ctx.moveTo(0,0);ctx.lineTo(Math.cos(ang)*h.r*0.72,Math.sin(ang)*h.r*0.72)}
  ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.95)";
  ctx.beginPath();ctx.arc(-h.r*0.3,-h.r*0.34,h.r*0.22,0,TAU);ctx.fill();
  ctx.restore();
}
function drawPickup(p){
  ctx.save();ctx.translate(p.x,p.y);
  const s=1+Math.sin(p.p)*0.14;ctx.scale(s,s);
  if(p.type==="ember"){
    const g=ctx.createRadialGradient(0,0,1,0,0,15);
    g.addColorStop(0,"rgba(255,214,140,0.95)");g.addColorStop(0.5,"rgba(255,140,60,0.42)");g.addColorStop(1,"rgba(255,120,40,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.fill();
    ctx.fillStyle="#fff3d6";ctx.beginPath();ctx.arc(0,0,4.6,0,TAU);ctx.fill();
    ctx.fillStyle="#ffb454";ctx.beginPath();ctx.arc(0,-1.4,2.6,0,TAU);ctx.fill();
  }else if(p.type==="shield"){
    ctx.strokeStyle="#8bdcff";ctx.lineWidth=2.4;
    ctx.fillStyle="rgba(120,215,255,0.20)";
    ctx.beginPath();ctx.arc(0,0,10,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,0.85)";ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke();
  }else if(p.type==="feather"){
    ctx.fillStyle="rgba(240,248,255,0.9)";
    ctx.beginPath();ctx.moveTo(-9,4);ctx.quadraticCurveTo(0,-11,9,-4);ctx.quadraticCurveTo(0,6,-9,4);ctx.fill();
    ctx.strokeStyle="#9fb8d0";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-8,4);ctx.lineTo(8,-4);ctx.stroke();
  }else{
    ctx.fillStyle="#ffe38a";
    ctx.beginPath();
    for(let i=0;i<10;i++){const ang=-Math.PI/2+i*Math.PI/5;const r=i%2?4.4:10;
      if(i===0)ctx.moveTo(Math.cos(ang)*r,Math.sin(ang)*r);else ctx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r)}
    ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.9)";ctx.beginPath();ctx.arc(0,0,2.4,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function ik(ax,ay,bx,by,l1,l2){
  let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);
  const max=l1+l2-0.01;
  if(d>max){dx*=max/d;dy*=max/d;d=max;bx=ax+dx;by=ay+dy}
  const base=Math.atan2(dy,dx);
  const ca=(l1*l1+d*d-l2*l2)/(2*l1*d);
  const ang=Math.acos(clamp(ca,-1,1));
  const k1x=ax+Math.cos(base-ang)*l1,k1y=ay+Math.sin(base-ang)*l1;
  const k2x=ax+Math.cos(base+ang)*l1,k2y=ay+Math.sin(base+ang)*l1;
  return k1x>=k2x?{x:k1x,y:k1y}:{x:k2x,y:k2y};
}
function footPos(ph,rx,ry,ly){
  const a=((ph%TAU)+TAU)%TAU;
  if(a<Math.PI){const u=a/Math.PI;return{x:-rx+2*rx*u,y:-ly*Math.sin(Math.PI*u)}}
  const u=(a-Math.PI)/Math.PI;return{x:rx-2*rx*u,y:0};
}
function drawRunner(){
  const px=P.x,py=P.y;
  /* afterimages */
  if(P.trails.length){
    ctx.save();
    for(let i=0;i<P.trails.length;i++){
      const tr=P.trails[i];
      ctx.globalAlpha=tr.a*0.5;
      ctx.fillStyle="rgba(120,200,255,0.5)";
      ctx.beginPath();ctx.ellipse(tr.x+P.w/2,tr.y-24,P.w*0.45,22,0,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
  /* lantern glow */
  ctx.save();ctx.globalCompositeOperation="lighter";
  const lgx=px+P.w+16,lgy=py-(P.slide?16:P.h-14);
  const lg=ctx.createRadialGradient(lgx,lgy,2,lgx,lgy,54);
  lg.addColorStop(0,"rgba(255,196,120,0.30)");lg.addColorStop(1,"rgba(255,170,90,0)");
  ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lgx,lgy,54,0,TAU);ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(px+P.w/2,py);
  ctx.scale(P.sx,P.sy);
  ctx.rotate(P.lean);

  const sliding=P.slide>0;
  const swing=Math.sin(P.stride),swing2=Math.sin(P.stride+Math.PI);

  /* legs */
  const hipY=-20;
  const f1=footPos(P.stride,9,8,10),f2=footPos(P.stride+Math.PI,9,8,10);
  function leg(foot,scale){
    const hx=sliding?-2:0,hy=hipY;
    const fx=sliding?foot.x*0.6+6:foot.x, fy=sliding?-3+foot.y*0.4:foot.y;
    const kn=ik(hx,hy,fx,fy,11,11);
    ctx.strokeStyle="#101a2c";ctx.lineWidth=5;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kn.x,kn.y);ctx.lineTo(fx,fy);ctx.stroke();
    ctx.strokeStyle="#26344c";ctx.lineWidth=3.2;
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kn.x,kn.y);ctx.stroke();
    ctx.fillStyle="#0d1522";
    ctx.beginPath();ctx.ellipse(fx+(sliding?3:2),fy,4.6,2.6,0,0,TAU);ctx.fill();
  }
  if(sliding){
    ctx.save();ctx.translate(6,4);
    leg({x:10,y:0});leg({x:-4,y:0});ctx.restore();
  }else if(!P.ground){
    const tuck=clamp(1-Math.abs(P.vy)/9,0.2,1);
    leg({x:4-6*tuck,y:-8*tuck-2});
    leg({x:-6+2*tuck,y:-4*tuck-1});
  }else{
    leg(f1);leg(f2);
  }

  /* torso */
  const topY=sliding?-26:-44, botY=hipY+2;
  ctx.save();
  ctx.beginPath();
  if(sliding){
    ctx.moveTo(-10,-4);ctx.quadraticCurveTo(-4,-24,14,-25);ctx.lineTo(22,-16);ctx.quadraticCurveTo(6,-4,-10,-4);
  }else{
    ctx.moveTo(-7,botY);ctx.quadraticCurveTo(-9,(topY+botY)/2,-5,topY+2);
    ctx.lineTo(7,topY+2);ctx.quadraticCurveTo(10,(topY+botY)/2,7,botY);ctx.closePath();
  }
  const tg=ctx.createLinearGradient(-8,topY,9,botY);
  tg.addColorStop(0,"#243a5e");tg.addColorStop(1,"#121d33");
  ctx.fillStyle=tg;ctx.fill();
  ctx.strokeStyle="rgba(140,205,255,0.55)";ctx.lineWidth=1.3;ctx.stroke();
  /* jacket trim */
  ctx.strokeStyle="rgba(140,205,255,0.35)";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-1,(topY+botY)/2+3);ctx.lineTo(3,botY-1);ctx.stroke();
  ctx.restore();

  /* arms */
  const shX=sliding?6:1,shY=topY+6;
  function arm(ph){
    const hx=sliding?16:ph*7,hy=sliding?-16:-24+Math.abs(ph)*3;
    const wx=sliding?22:ph*9,wy=sliding?-8:-14+Math.abs(ph)*4;
    const el=ik(shX,shY,wx,wy,9,9);
    ctx.strokeStyle="#1b2a45";ctx.lineWidth=4;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(shX,shY);ctx.lineTo(el.x,el.y);ctx.lineTo(wx,wy);ctx.stroke();
    ctx.fillStyle="#2a3c5c";ctx.beginPath();ctx.arc(wx,wy,2.6,0,TAU);ctx.fill();
  }
  if(sliding){arm(1)}else if(!P.ground){arm(0.7);arm(-0.6)}
  else{arm(swing2);arm(swing)}

  /* head + hood */
  const hx=sliding?16:2,hy=sliding?-30:-50;
  ctx.save();
  ctx.translate(hx,hy);
  ctx.fillStyle="#101a2c";
  ctx.beginPath();ctx.arc(0,0,8.4,0,TAU);ctx.fill();
  const hg=ctx.createLinearGradient(-8,-8,7,8);
  hg.addColorStop(0,"#2c4770");hg.addColorStop(1,"#152440");
  ctx.fillStyle=hg;
  ctx.beginPath();ctx.arc(0.6,-1,8.2,Math.PI*0.62,Math.PI*1.92);ctx.quadraticCurveTo(9,4,4,8.6);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();
  ctx.strokeStyle="rgba(150,215,255,0.75)";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(0.6,-1,8.2,Math.PI*0.62,Math.PI*1.55);ctx.stroke();
  /* face + eye */
  ctx.fillStyle="#f6fbff";
  ctx.beginPath();ctx.arc(4.2,-0.4,1.9,0,TAU);ctx.fill();
  ctx.fillStyle="rgba(140,220,255,0.5)";
  ctx.beginPath();ctx.arc(4.2,-0.4,4.6,0,TAU);ctx.fill();
  ctx.restore();

  /* scarf */
  if(P.scarf.length>2){
    ctx.save();
    ctx.lineCap="round";ctx.lineJoin="round";
    for(let i=1;i<P.scarf.length;i++){
      const a=P.scarf[i-1],b=P.scarf[i];
      const w=lerp(5.0,0.9,i/P.scarf.length);
      ctx.strokeStyle=i<4?"#8bdcff":"#4aa6f0";
      ctx.lineWidth=w;
      ctx.beginPath();ctx.moveTo(a.x-(px+P.w/2),a.y-py);ctx.lineTo(b.x-(px+P.w/2),b.y-py);ctx.stroke();
    }
    ctx.restore();
  }

  /* shield bubble */
  if(shield>0){
    ctx.save();
    ctx.translate(0,-26);
    const pulse=1+Math.sin(performance.now()/220)*0.05;
    ctx.scale(1,pulse);
    const sg=ctx.createRadialGradient(0,0,8,0,0,34);
    sg.addColorStop(0,"rgba(120,215,255,0.05)");sg.addColorStop(0.75,"rgba(120,215,255,0.22)");sg.addColorStop(1,"rgba(160,235,255,0.5)");
    ctx.fillStyle=sg;
    ctx.beginPath();ctx.ellipse(0,0,26,34,0,0,TAU);ctx.fill();
    ctx.strokeStyle="rgba(190,240,255,0.8)";ctx.lineWidth=1.6;ctx.setLineDash([7,6]);
    ctx.lineDashOffset=-performance.now()/40;
    ctx.beginPath();ctx.ellipse(0,0,26,34,0,0,TAU);ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  ctx.restore();

  /* ground contact shadow */
  ctx.save();
  ctx.fillStyle="rgba(0,0,0,0.42)";
  const sc=clamp(1-(GROUND-py)/130,0.35,1);
  ctx.beginPath();ctx.ellipse(px+P.w/2,GROUND+4,15*sc,4.4*sc,0,0,TAU);ctx.fill();
  ctx.restore();
}
function drawParts(){
  ctx.save();
  for(let i=0;i<parts.length;i++){
    const p=parts[i];
    ctx.globalAlpha=clamp(p.a,0,1);
    if(p.ring){
      ctx.strokeStyle=p.col;ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1.6-p.a),p.r*0.5*(1.6-p.a),0,0,TAU);ctx.stroke();
    }else if(p.ice){
      ctx.fillStyle=p.col;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
      ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(p.r*0.9,p.r*0.8);ctx.lineTo(-p.r*0.9,p.r*0.8);ctx.closePath();ctx.fill();
      ctx.restore();
    }else{
      ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
    }
  }
  ctx.restore();
}
function drawTexts(){
  ctx.save();ctx.textAlign="center";
  for(let i=0;i<texts.length;i++){
    const f=texts[i];
    ctx.globalAlpha=clamp(f.a,0,1);
    ctx.font="800 13px -apple-system,Segoe UI,sans-serif";
    ctx.lineWidth=3;ctx.strokeStyle="rgba(0,0,0,0.65)";
    ctx.strokeText(f.t,f.x,f.y);ctx.fillStyle=f.col;ctx.fillText(f.t,f.x,f.y);
  }
  ctx.restore();
}
function panel(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function drawHUD(){
  const pad=9;
  ctx.save();
  ctx.textBaseline="middle";
  /* distance */
  ctx.font="900 26px -apple-system,Segoe UI,sans-serif";
  const dTxt=Math.floor(distance)+"m";
  const w1=ctx.measureText(dTxt).width;
  ctx.lineWidth=4;ctx.strokeStyle="rgba(0,0,0,0.55)";
  ctx.strokeText(dTxt,pad+7,26);ctx.fillStyle="#ffffff";ctx.fillText(dTxt,pad+7,26);
  /* tier chip */
  ctx.font="800 9.5px -apple-system,Segoe UI,sans-serif";
  const chip=TIERS[tier].name;
  const cw=ctx.measureText(chip).width+14;
  ctx.fillStyle="rgba(9,17,30,0.72)";panel(pad+7+w1+10,17,cw,17,8);ctx.fill();
  ctx.strokeStyle="rgba(140,215,255,0.5)";ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle="#8bdcff";ctx.fillText(chip,pad+7+w1+17,26);

  /* warmth bar */
  const bx=pad+7,by=40,bw=Math.min(140,VW*0.42),bh=9;
  ctx.fillStyle="rgba(9,17,30,0.72)";panel(bx,by,bw+2,bh+2,5);ctx.fill();
  const wr=clamp(warmth/100,0,1);
  const wg=ctx.createLinearGradient(bx,0,bx+bw,0);
  if(wr>0.4){wg.addColorStop(0,"#ff7a35");wg.addColorStop(1,"#ffd166")}
  else{wg.addColorStop(0,"#ff3b3b");wg.addColorStop(1,"#ff8f6b")}
  ctx.fillStyle=wg;
  if(wr>0.01){panel(bx+1,by+1,(bw)*wr,bh,4);ctx.fill()}
  ctx.strokeStyle="rgba(255,255,255,0.20)";ctx.lineWidth=1;panel(bx,by,bw+2,bh+2,5);ctx.stroke();
  ctx.font="800 8.5px -apple-system,Segoe UI,sans-serif";
  ctx.fillStyle="rgba(255,255,255,0.9)";
  ctx.fillText("\u{1F525} "+Math.ceil(warmth)+"%",bx+4,by+bh/2+1.5);

  /* right side stats */
  ctx.textAlign="right";
  ctx.font="800 11px -apple-system,Segoe UI,sans-serif";
  let ry=26;
  const rx=VW-pad-52;
  ctx.fillStyle="rgba(9,17,30,0.6)";panel(rx,ry-9,44,17,8);ctx.fill();
  ctx.fillStyle="#fdba74";ctx.fillText("\u{1F525} "+embers,rx+38,ry);
  ry+=21;
  if(shield>0){
    ctx.fillStyle="rgba(9,17,30,0.6)";panel(rx,ry-9,44,17,8);ctx.fill();
    ctx.fillStyle="#8bdcff";ctx.fillText("\u{1F6E1} ON",rx+38,ry);
  }else if(combo>1){
    ctx.fillStyle="rgba(9,17,30,0.6)";panel(rx,ry-9,44,17,8);ctx.fill();
    ctx.fillStyle="#a9f36c";ctx.fillText("\u00d7"+combo,rx+38,ry);
  }
  if(starBoost>0){
    ry+=21;
    ctx.fillStyle="rgba(9,17,30,0.6)";panel(rx,ry-9,44,17,8);ctx.fill();
    ctx.fillStyle="#ffe38a";ctx.fillText("2\u00d7 "+Math.ceil(starBoost/60)+"s",rx+38,ry);
  }
  if(slowmo>0){
    ry+=21;
    ctx.fillStyle="rgba(9,17,30,0.6)";panel(rx,ry-9,44,17,8);ctx.fill();
    ctx.fillStyle="#e2e8f0";ctx.fillText("SLO\u00B7MO",rx+38,ry);
  }
  /* tier progress */
  const nxt=TIERS[Math.min(tier+1,TIERS.length-1)];
  if(tier<TIERS.length-1){
    const cur=TIERS[tier].at;
    const pr=clamp((distance-cur)/(nxt.at-cur),0,1);
    const tw=Math.min(150,VW*0.36),tx=VW-tw-pad-6,ty=VH-14;
    ctx.textAlign="left";
    ctx.fillStyle="rgba(9,17,30,0.6)";panel(tx-6,ty-8,tw+12,17,8);ctx.fill();
    ctx.fillStyle="rgba(140,215,255,0.30)";ctx.fillRect(tx,ty-2,tw,4);
    ctx.fillStyle="#8bdcff";ctx.fillRect(tx,ty-2,tw*pr,4);
    ctx.font="800 8px -apple-system,Segoe UI,sans-serif";
    ctx.fillStyle="rgba(200,225,255,0.8)";
    ctx.fillText("NEXT \u2014 "+nxt.name+"  "+nxt.at+"m",tx,ty+8);
  }
  ctx.restore();
}
function drawBanners(){
  for(let i=0;i<banners.length;i++){
    const b=banners[i];
    const p=1-b.life/b.max;
    const a=p<0.15?p/0.15:(p>0.78?(1-p)/0.22:1);
    const y=VH*0.34-p*22;
    ctx.save();
    ctx.globalAlpha=clamp(a,0,1);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.font="900 34px -apple-system,Segoe UI,sans-serif";
    const tw=ctx.measureText(b.t).width;
    ctx.fillStyle="rgba(6,12,22,0.55)";panel(VW/2-tw/2-22,y-24,tw+44,48,14);ctx.fill();
    ctx.lineWidth=1.4;ctx.strokeStyle=b.col;ctx.stroke();
    ctx.lineWidth=5;ctx.strokeStyle="rgba(0,0,0,0.6)";ctx.strokeText(b.t,VW/2,y);
    ctx.fillStyle=b.col;ctx.fillText(b.t,VW/2,y);
    ctx.restore();
  }
}
function drawOverlay(){
  if(paused&&!finished){
    ctx.save();ctx.fillStyle="rgba(4,8,14,0.66)";ctx.fillRect(0,0,VW,VH);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.font="900 30px -apple-system,Segoe UI,sans-serif";
    ctx.fillStyle="#ffffff";ctx.fillText("PAUSED",VW/2,VH/2-14);
    ctx.font="700 12px -apple-system,Segoe UI,sans-serif";
    ctx.fillStyle="#9fb4cc";ctx.fillText("Tap anywhere or press P to resume",VW/2,VH/2+14);
    ctx.restore();
  }
  if(finished){
    ctx.save();
    const g=ctx.createLinearGradient(0,0,0,VH);
    g.addColorStop(0,"rgba(4,8,14,0.35)");g.addColorStop(1,"rgba(4,8,14,0.78)");
    ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.font="900 30px -apple-system,Segoe UI,sans-serif";
    ctx.lineWidth=6;ctx.strokeStyle="rgba(0,0,0,0.7)";
    ctx.strokeText("STORM CLAIMED",VW/2,VH*0.36);
    ctx.fillStyle="#ffd7d7";ctx.fillText("STORM CLAIMED",VW/2,VH*0.36);
    ctx.font="800 15px -apple-system,Segoe UI,sans-serif";
    ctx.fillStyle="#e6f0fa";
    ctx.fillText(Math.floor(distance)+"m   \u00b7   best combo \u00d7"+Math.max(1,bestCombo),VW/2,VH*0.36+34);
    ctx.font="700 12px -apple-system,Segoe UI,sans-serif";
    ctx.fillStyle="#9fb4cc";ctx.fillText("Tap to run again",VW/2,VH*0.36+58);
    ctx.restore();
  }
}
function render(){
  if(!layers)return;
  ctx.save();
  if(shake>0&&!RM){
    ctx.translate((Math.random()-0.5)*shake*2.2,(Math.random()-0.5)*shake*2.2);
  }
  drawSky();drawStars();drawMoon();drawAurora();drawClouds();drawRidges();
  drawGround();
  for(let i=0;i<hail.length;i++)drawHailMark(hail[i]);
  drawSpeedLines();
  drawPickupsLayer();
  if(P.scarf.length||running)drawRunner();
  for(let i=0;i<hail.length;i++)drawHail(hail[i]);
  drawParts();drawTexts();
  drawWeather();drawFog();
  ctx.restore();

  /* lightning flash */
  if(flash>0.02){
    ctx.save();ctx.globalCompositeOperation="lighter";
    ctx.fillStyle="rgba(180,215,255,"+(flash*0.30)+")";ctx.fillRect(0,0,VW,VH);
    if(bolt){
      ctx.strokeStyle="rgba(235,248,255,"+(0.6+flash*0.4)+")";ctx.lineWidth=2.4;
      ctx.beginPath();ctx.moveTo(bolt[0].x,bolt[0].y);
      for(let i=1;i<bolt.length;i++)ctx.lineTo(bolt[i].x,bolt[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  /* vignette + grade */
  const vg=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.24,VW/2,VH/2,Math.max(VW,VH)*0.72);
  vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.55)");
  ctx.fillStyle=vg;ctx.fillRect(0,0,VW,VH);
  if(tier>=3){ctx.fillStyle="rgba(120,180,255,0.05)";ctx.fillRect(0,0,VW,VH)}

  drawHUD();drawBanners();drawOverlay();
}
function drawPickupsLayer(){for(let i=0;i<pickups.length;i++)drawPickup(pickups[i])}

/* weather particles */
let weather=[];
function buildWeather(){
  weather=[];
  const n=RM?70:150;
  for(let i=0;i<n;i++){
    const depth=Math.random();
    weather.push({
      x:Math.random()*VW,y:Math.random()*VH,
      r:0.7+depth*2.4,vx:-(1.2+depth*5.5),vy:2.4+depth*6,
      a:0.20+depth*0.55,wf:0.6+depth,streak:depth>0.55
    });
  }
}

/* ================= BOOT ================= */
resize();
window.addEventListener("resize",scheduleRelayout);
try{
  if(window.ResizeObserver)new ResizeObserver(scheduleRelayout).observe(stage);
}catch(e){}
window.addEventListener("beforeunload",()=>{alive=false;clearInterval(AU.timer)});
document.addEventListener("pagehide",()=>{alive=false;clearInterval(AU.timer)});

begin();
}
if(CFG.game==="higher")higher();else if(CFG.game==="memory")memory();else if(CFG.game==="wordfinder")wordfinder();else if(CFG.game==="hailstorm")hailstorm();else reaction();