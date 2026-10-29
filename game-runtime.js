const CFG=__CONFIG__;const $=id=>document.getElementById(id);let challenge=new URLSearchParams(location.search).get("challenge"),restartFn=()=>{};const area=$("area");function rnd(n){return Math.floor(Math.random()*n)}function feedback(t){$("feedback").textContent=t}function record(key,v,lower){try{const k="xmg.best."+key,o=localStorage.getItem(k);let b=o===null?v:Number(o);if(lower?v<b:v>b)b=v;localStorage.setItem(k,String(b));$("bestTag").textContent="BEST "+b+(key==="reaction"?" ms":key==="higher"?"/10":key==="wordfinder"?" s":" moves")}catch{$("bestTag").textContent="PERSONAL BEST"}}function result(head,detail,shareValue,key,value,lower){$("result").style.display="block";$("resultTitle").textContent=head;$("resultDetail").textContent=detail;if(key)record(key,value,lower);const u=new URL(location.href);u.searchParams.set("challenge",shareValue);const text=CFG.title+" — "+shareValue+". Can you beat me? "+u.href;$("shareHint").textContent="Share a challenge link with the score target.";$("share").onclick=async()=>{try{if(navigator.share)await navigator.share({title:CFG.title,text:text,url:u.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text);$("shareHint").textContent="Copied! Paste your challenge into a post or chat."}else $("shareHint").textContent=text}catch(e){if(e.name!=="AbortError")$("shareHint").textContent=text}};$("again").onclick=()=>{$("result").style.display="none";restartFn()}}if(challenge){$("challenge").hidden=false;$("challenge").textContent="FRIEND CHALLENGE · Beat "+challenge+"!"}
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
if(CFG.game==="higher")higher();else if(CFG.game==="memory")memory();else if(CFG.game==="wordfinder")wordfinder();else reaction();