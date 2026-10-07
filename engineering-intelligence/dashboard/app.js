const REMOTE="https://raw.githubusercontent.com/sophiamaybea/ideas/engineering-intelligence/engineering-intelligence/dashboard/data/dashboard.json";
let D=null,G=null;
const W=2300,H=1500;
let state={x:0,y:0,scale:1,drag:false,lastX:0,lastY:0,activeSection:null,activeKey:null};
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const money=n=>"$"+Number(n||0).toLocaleString();

const sectionDefs=[
  {id:"projects",label:"Current systems",shape:"circle",accent:true,description:"The systems already being built, their stage, evidence and next direction."},
  {id:"repos",label:"Repository radar",shape:"square",description:"Open-source technologies treated as technical evidence rather than a popularity list."},
  {id:"prompts",label:"Prompt library",shape:"diamond",description:"Reusable research, engineering and invention procedures created inside the wider system."},
  {id:"ventures",label:"Venture lab",shape:"triangle",description:"Autonomous business hypotheses with explicit assumptions, risks and falsification tests."},
  {id:"companies",label:"Money map",shape:"circle",description:"Profitable technology companies indexed by the mechanism that makes their economics work."},
  {id:"learning",label:"Learning loop",shape:"cross",description:"Outcome memory, prediction error and policy changes from repeated experiments."}
];

const anchors={
  root:[1130,745],
  projects:[730,315],
  repos:[360,720],
  prompts:[725,1190],
  ventures:[1510,1190],
  companies:[1900,720],
  learning:[1545,315]
};

async function load(){
  try{
    const r=await fetch(REMOTE+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;D=await r.json();
  }catch(e){D=await fetch("/data/dashboard.json",{cache:"no-store"}).then(r=>r.json())}
  $("#boot").hidden=true;$("#app").hidden=false;
  $("#syncLabel").textContent="UPDATED "+new Date(D.meta.lastUpdated).toLocaleString();
  buildIndex();buildGraph();bind();fitInitial();restoreDeepLink();
}

function marker(shape,accent=false){return '<i class="marker '+shape+(accent?' accent':'')+'"></i>'}
function sectionItems(id){
  if(id==="repos")return D.repos||[];
  if(id==="prompts")return D.prompts||[];
  if(id==="ventures")return D.ventures||[];
  if(id==="companies")return D.companies||[];
  if(id==="projects")return D.projects||[];
  if(id==="learning")return (D.learning?.rules||[]).map((r,i)=>({name:"Rule "+String(i+1).padStart(2,"0"),summary:r,status:"POLICY"}));
  return [];
}
function itemName(id,o){return id==="prompts"?o.title:(o.name||o.summary||"Untitled")}
function itemMeta(id,o){
  if(id==="repos")return o.status||"";
  if(id==="prompts")return (o.codes||[]).slice(0,1).join("");
  if(id==="ventures")return o.status||"MODEL";
  if(id==="companies")return o.netIncome||"";
  if(id==="projects")return o.status||"";
  return o.status||"RULE";
}
function sectionById(id){return sectionDefs.find(s=>s.id===id)}
function slug(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}

function buildIndex(){
  $("#indexSections").innerHTML=sectionDefs.map((s,i)=>{
    const items=sectionItems(s.id), preview=items.slice(0,16);
    return '<section class="indexSection '+(i===0?'open':'')+'" data-section="'+s.id+'">'+
      '<button class="sectionToggle" data-focus-section="'+s.id+'">'+marker(s.shape,s.accent)+'<span>'+esc(s.label)+'</span><span class="count">'+items.length+'</span><span class="pm">'+(i===0?'−':'+')+'</span></button>'+
      '<p class="sectionIntro">'+esc(s.description)+'</p>'+
      '<div class="sectionBody">'+renderIndexRows(s.id,preview)+
      (items.length>preview.length?'<button class="indexMore" data-show-all="'+s.id+'">+'+(items.length-preview.length)+' more</button>':'')+
      '</div></section>';
  }).join("");
}
function renderIndexRows(id,items){
  let lastGroup="";
  return items.map(o=>{
    const meta=itemMeta(id,o),group=(meta||"OTHER").split(/[ /]/)[0];
    const groupRow=group!==lastGroup?'<div class="groupLabel"><span>'+esc(group)+'</span><span></span></div>':"";
    lastGroup=group;
    return groupRow+'<button class="indexItem" data-open="'+id+'" data-key="'+esc(itemName(id,o))+'"><span class="indexMeta">'+esc(meta)+'</span><span>'+esc(itemName(id,o))+'</span></button>';
  }).join("");
}

function leafPosition(sectionId,index,total){
  const [sx,sy]=anchors[sectionId], [rx,ry]=anchors.root;
  const vx=sx-rx,vy=sy-ry,len=Math.hypot(vx,vy)||1;
  const dx=vx/len,dy=vy/len,tx=-dy,ty=dx;
  const perCol=total>20?8:total>13?7:total>8?5:Math.max(1,total);
  const col=Math.floor(index/perCol),row=index%perCol;
  const rows=Math.min(perCol,total-col*perCol);
  const offset=(row-(rows-1)/2)*41;
  const depth=150+col*205;
  return [sx+dx*depth+tx*offset,sy+dy*depth+ty*offset];
}
function elbowPath(A,B){
  const dx=B.x-A.x,dy=B.y-A.y;
  if(Math.abs(dx)>Math.abs(dy)){
    const mx=A.x+dx*.48;
    return 'M '+A.x+' '+A.y+' C '+mx+' '+A.y+', '+mx+' '+B.y+', '+B.x+' '+B.y;
  }
  const my=A.y+dy*.48;
  return 'M '+A.x+' '+A.y+' C '+A.x+' '+my+', '+B.x+' '+my+', '+B.x+' '+B.y;
}
function graphModel(){
  const nodes=[{id:"root",section:"root",label:"ENGINEERING INTELLIGENCE",meta:"LIVE KNOWLEDGE SYSTEM",x:anchors.root[0],y:anchors.root[1],shape:"circle",accent:true,type:"root"}],edges=[],semantic=[];
  sectionDefs.forEach(s=>{
    const [x,y]=anchors[s.id];
    nodes.push({id:s.id,section:s.id,label:s.label,meta:sectionItems(s.id).length+" indexed",x,y,shape:s.shape,accent:s.accent,type:"cluster"});
    edges.push({a:"root",b:s.id,type:"trunk"});
    const all=sectionItems(s.id);
    const max=s.id==="companies"?20:all.length;
    all.slice(0,max).forEach((o,i)=>{
      const [ix,iy]=leafPosition(s.id,i,Math.min(all.length,max)),key=itemName(s.id,o),nid=s.id+":"+i;
      nodes.push({id:nid,section:s.id,key,label:key,meta:itemMeta(s.id,o),x:ix,y:iy,shape:s.shape,type:"child"});
      edges.push({a:s.id,b:nid,type:"branch"});
    });
  });

  const repoNodes=nodes.filter(n=>n.section==="repos"&&n.key);
  const ventureNodes=nodes.filter(n=>n.section==="ventures"&&n.key);
  const projectNodes=nodes.filter(n=>n.section==="projects"&&n.key);
  repoNodes.forEach(rn=>{
    const repo=D.repos.find(r=>r.name===rn.key),text=JSON.stringify(repo?.usedFor||[]).toLowerCase();
    projectNodes.forEach(pn=>{
      const tokens=pn.key.toLowerCase().split(/\s+/).filter(t=>t.length>4);
      if(tokens.some(t=>text.includes(t)))semantic.push({a:rn.id,b:pn.id,type:"semantic"});
    });
  });
  ventureNodes.forEach(vn=>{
    const v=D.ventures.find(x=>x.name===vn.key),text=JSON.stringify(v?.stack||[]).toLowerCase();
    repoNodes.forEach(rn=>{
      const short=rn.key.toLowerCase().split("/").pop().replace(/[-_.]/g," ");
      const words=short.split(/\s+/).filter(w=>w.length>4);
      if(words.some(w=>text.includes(w)))semantic.push({a:rn.id,b:vn.id,type:"semantic"});
    });
  });
  return {nodes,edges:[...edges,...semantic]};
}
function buildGraph(){
  G=graphModel();const byId=Object.fromEntries(G.nodes.map(n=>[n.id,n]));
  $("#edges").innerHTML=G.edges.map(e=>{
    const A=byId[e.a],B=byId[e.b];if(!A||!B)return "";
    return '<path class="edge '+(e.type==="trunk"?"trunk ":e.type==="semantic"?"semantic ":"")+'" data-a="'+e.a+'" data-b="'+e.b+'" d="'+elbowPath(A,B)+'"/>';
  }).join("");
  const labels=sectionDefs.map(s=>{
    const [x,y]=anchors[s.id],[rx,ry]=anchors.root;
    const mx=(x+rx)/2,my=(y+ry)/2;
    return '<span class="pathLabel" style="left:'+mx+'px;top:'+my+'px">'+esc(s.label)+'</span>';
  }).join("");
  $("#nodes").innerHTML=labels+G.nodes.map(n=>
    '<button class="node '+n.type+'" style="left:'+n.x+'px;top:'+n.y+'px" data-node="'+n.id+'" data-section="'+n.section+'"'+(n.key?' data-key="'+esc(n.key)+'"':'')+'>'+
    marker(n.shape,n.accent)+'<span>'+esc(n.label)+(n.meta?'<small>'+esc(n.meta)+'</small>':'')+'</span></button>'
  ).join("");
}

function bind(){
  $("#collapseIndex").onclick=()=>{const c=$("#indexCard").classList.toggle("collapsed");$("#collapseIndex").textContent=c?"+":"−"};
  $("#resetGraph").onclick=()=>{clearURL();fitInitial();closeDetail()};
  $("#detailClose").onclick=closeDetail;
  $("#homeBtn").onclick=()=>{clearURL();state.activeSection=null;state.activeKey=null;fitInitial();closeDetail()};

  document.body.addEventListener("click",e=>{
    const t=e.target.closest(".sectionToggle");
    if(t){
      const sec=t.closest(".indexSection"),was=sec.classList.contains("open");
      document.querySelectorAll(".indexSection").forEach(x=>{x.classList.remove("open");x.querySelector(".pm").textContent="+"});
      if(!was){sec.classList.add("open");sec.querySelector(".pm").textContent="−"}
      focusSection(t.dataset.focusSection);return;
    }
    const item=e.target.closest("[data-open]");
    if(item){openDetail(item.dataset.open,item.dataset.key);focusItem(item.dataset.open,item.dataset.key);return}
    const more=e.target.closest("[data-show-all]");
    if(more){showAll(more.dataset.showAll);return}
    const node=e.target.closest(".node");
    if(node){
      if(node.dataset.node==="root"){clearURL();fitInitial();closeDetail();return}
      const sec=node.dataset.section,key=node.dataset.key;
      if(key){openDetail(sec,key);focusItem(sec,key)}else focusSection(sec);
    }
  });

  const v=$("#graphViewport");
  v.addEventListener("pointerdown",e=>{
    if(e.target.closest(".node")||e.target.closest(".indexCard")||e.target.closest(".detailCard"))return;
    state.drag=true;state.lastX=e.clientX;state.lastY=e.clientY;v.setPointerCapture(e.pointerId);v.classList.add("dragging");
  });
  v.addEventListener("pointermove",e=>{if(!state.drag)return;state.x+=e.clientX-state.lastX;state.y+=e.clientY-state.lastY;state.lastX=e.clientX;state.lastY=e.clientY;applyTransform()});
  v.addEventListener("pointerup",()=>{state.drag=false;v.classList.remove("dragging")});
  v.addEventListener("wheel",e=>{
    e.preventDefault();const rect=v.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top,old=state.scale;
    const next=Math.min(2.25,Math.max(.36,old*Math.exp(-e.deltaY*.001)));
    const wx=(mx-state.x)/old,wy=(my-state.y)/old;
    state.scale=next;state.x=mx-wx*next;state.y=my-wy*next;applyTransform();
  },{passive:false});
}

function applyTransform(){
  $("#graphStage").style.transform="translate("+state.x+"px,"+state.y+"px) scale("+state.scale+")";
  $("#zoomReadout").textContent=Math.round(state.scale*100)+"%";
}
function fitInitial(){
  const s=Math.min(innerWidth/W,innerHeight/H)*1.35;
  state.scale=Math.max(.42,Math.min(1.08,s));
  state.x=(innerWidth-W*state.scale)/2-(innerWidth>760?70:0);
  state.y=(innerHeight-H*state.scale)/2;
  applyTransform();highlight(null,null);
}
function focusSection(id){
  state.activeSection=id;state.activeKey=null;
  const p=anchors[id]||anchors.root,s=innerWidth<620?.62:.9,targetX=innerWidth<620?innerWidth*.5:innerWidth*.41,targetY=innerHeight*.43;
  state.scale=s;state.x=targetX-p[0]*s;state.y=targetY-p[1]*s;applyTransform();highlight(id,null);setURL(id,null);
}
function focusItem(section,key){
  state.activeSection=section;state.activeKey=key;
  const n=G.nodes.find(n=>n.section===section&&n.key===key);
  if(!n){focusSection(section);return}
  const s=innerWidth<620?.78:1.08,targetX=innerWidth<620?innerWidth*.48:innerWidth*.36,targetY=innerHeight*.42;
  state.scale=s;state.x=targetX-n.x*s;state.y=targetY-n.y*s;applyTransform();highlight(section,key);setURL(section,key);
}
function connectedIds(section,key){
  const active=G.nodes.find(n=>n.section===section&&(!key||n.key===key||(!n.key&&n.id===section)));
  if(!active)return new Set();
  const set=new Set([active.id,"root",section]);
  G.edges.forEach(e=>{if(e.a===active.id)set.add(e.b);if(e.b===active.id)set.add(e.a);if(!key&&(e.a===section||e.b===section)){set.add(e.a);set.add(e.b)}});
  return set;
}
function highlight(section,key){
  const conn=section?connectedIds(section,key):null;
  document.querySelectorAll(".node").forEach(el=>{
    const id=el.dataset.node,exact=!!key&&el.dataset.key===key;
    el.classList.toggle("active",exact);
    el.classList.toggle("neighbour",!!section&&!exact&&conn.has(id));
    el.classList.toggle("inactive",!!section&&!exact&&!conn.has(id));
  });
  document.querySelectorAll(".edge").forEach(el=>{
    const hot=!!section&&conn.has(el.dataset.a)&&conn.has(el.dataset.b);
    el.classList.toggle("hot",hot);el.style.opacity=!section?"1":hot?".95":".08";
  });
  document.querySelectorAll(".indexItem").forEach(el=>el.classList.toggle("active",!!key&&el.dataset.key===key));
}
function showAll(id){
  const body=document.querySelector('.indexSection[data-section="'+id+'"] .sectionBody');
  body.innerHTML=renderIndexRows(id,sectionItems(id));
}
function setURL(section,key){
  const u=new URL(location.href);u.searchParams.set("map",section);if(key)u.searchParams.set("node",slug(key));else u.searchParams.delete("node");history.replaceState(null,"",u);
}
function clearURL(){const u=new URL(location.href);u.searchParams.delete("map");u.searchParams.delete("node");history.replaceState(null,"",u)}
function restoreDeepLink(){
  const q=new URL(location.href).searchParams,section=q.get("map"),node=q.get("node");if(!section)return;
  if(node){const o=sectionItems(section).find(x=>slug(itemName(section,x))===node);if(o){openDetail(section,itemName(section,o));focusItem(section,itemName(section,o));return}}
  focusSection(section);
}

function openDetail(type,key){
  let h="",o;
  if(type==="repos"){
    o=D.repos.find(x=>x.name===key);if(!o)return;
    h=eyebrow("REPOSITORY",o.status,"square")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.capability)+'</p><h4>USED FOR</h4><p>'+esc((o.usedFor||[]).join(" / "))+'</p><h4>EXAMPLES</h4><p>'+esc((o.examples||[]).join(" / "))+'</p><h4>POTENTIAL</h4><p>'+esc(o.potential)+'</p><p><a href="'+esc(o.url)+'" target="_blank" rel="noreferrer">OPEN REPOSITORY ↗</a></p>';
  }
  if(type==="prompts"){
    o=D.prompts.find(x=>x.title===key);if(!o)return;
    h=eyebrow("PROMPT SYSTEM",o.origin||"LIBRARY","diamond")+'<h2>'+esc(o.title)+'</h2><div class="chips">'+(o.codes||[]).map(c=>'<span class="chip">'+esc(c)+'</span>').join("")+'</div><p>'+esc(o.summary)+'</p>';
  }
  if(type==="ventures"){
    o=D.ventures.find(x=>x.name===key);if(!o)return;
    h=eyebrow("VENTURE",o.status||"MODELLED","triangle")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.thesis)+'</p><div class="metricRow"><div class="metric"><b>'+money(o.model.meanRevenue)+'</b><span>modelled mean</span></div><div class="metric"><b>'+Math.round((o.model.p100||0)*100)+'%</b><span>P ≥ $100</span></div><div class="metric"><b>'+esc(o.model.medianDaysToFirstDollar)+'d</b><span>modelled first $</span></div></div><h4>STACK</h4><p>'+esc((o.stack||[]).join(" / "))+'</p><h4>RISK</h4><p>'+esc(o.risk)+'</p><h4>NEXT TEST</h4><p>'+esc(o.nextTest)+'</p>';
  }
  if(type==="companies"){
    o=D.companies.find(x=>x.name===key);if(!o)return;const p=D.companyProfiles?.[key];
    h=eyebrow("COMPANY","#"+o.rank,"circle")+'<h2>'+esc(o.name)+'</h2><div class="metricRow"><div class="metric"><b>'+esc(o.netIncome)+'</b><span>net income</span></div><div class="metric"><b>'+esc(o.yoy)+'</b><span>YoY</span></div><div class="metric"><b>'+esc(o.ticker)+'</b><span>ticker</span></div></div>'+(p?'<h4>WHAT IT DOES</h4><p>'+esc(p.does)+'</p><h4>WHY IT MAKES MONEY</h4><p>'+esc(p.why)+'</p><h4>MOAT</h4><p>'+esc(p.moat)+'</p><h4>LESSON</h4><p>'+esc(p.lesson)+'</p>':'<h4>PROFILE</h4><p>Financial record indexed. Qualitative analysis queued.</p>');
  }
  if(type==="projects"){
    o=D.projects.find(x=>x.name===key);if(!o)return;
    h=eyebrow("CURRENT SYSTEM",o.status||"","circle")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.purpose)+'</p><h4>KIND</h4><p>'+esc(o.kind)+'</p><h4>EVIDENCE</h4><p>'+esc(o.evidence)+'</p>';
  }
  if(type==="learning"){
    const idx=Number((key.match(/\d+/)||["1"])[0])-1,r=D.learning.rules[idx];
    h=eyebrow("LEARNING RULE","OUTCOME MEMORY","cross")+'<h2>'+esc(key)+'</h2><p>'+esc(r)+'</p><h4>LOOP</h4><p>'+esc((D.learning.loop||[]).join(" → "))+'</p><h4>WOLFRAM</h4><p>'+esc(D.wolfram.caveat)+'</p>';
  }
  $("#detailBody").innerHTML=h;$("#detailCard").hidden=false;
}
function eyebrow(a,b,shape){return '<div class="detailEyebrow">'+marker(shape,false)+'<span>'+esc(a)+' / '+esc(b)+'</span></div>'}
function closeDetail(){$("#detailCard").hidden=true;state.activeKey=null;highlight(state.activeSection,null)}

load();
setInterval(async()=>{
  try{
    const r=await fetch(REMOTE+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)return;const n=await r.json();
    if(D&&n.meta.lastUpdated!==D.meta.lastUpdated){D=n;$("#syncLabel").textContent="UPDATED "+new Date(D.meta.lastUpdated).toLocaleString();buildIndex();buildGraph();highlight(state.activeSection,state.activeKey)}
  }catch(e){}
},60000);
