const REMOTE="https://raw.githubusercontent.com/sophiamaybea/ideas/engineering-intelligence/engineering-intelligence/dashboard/data/dashboard.json";
let D=null;
let state={x:0,y:0,scale:1,drag:false,lastX:0,lastY:0,activeSection:"projects",activeKey:null};
const W=1600,H=1000;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","'":"&#039;"}[m]));
const money=n=>"$"+Number(n||0).toLocaleString();

const sectionDefs=[
  {id:"projects",label:"Current Systems",shape:"circle",accent:true},
  {id:"repos",label:"Repository Radar",shape:"square"},
  {id:"prompts",label:"Prompt Library",shape:"diamond"},
  {id:"ventures",label:"Venture Lab",shape:"triangle"},
  {id:"companies",label:"Money Map",shape:"circle"},
  {id:"learning",label:"Learning Loop",shape:"cross"}
];

const anchors={
  root:[690,470],
  projects:[355,235],
  repos:[255,500],
  prompts:[455,760],
  ventures:[980,760],
  companies:[1170,475],
  learning:[1020,210]
};

async function load(){
  try{
    const r=await fetch(REMOTE+"?v="+Date.now(),{cache:"no-store"});
    if(!r.ok)throw new Error("remote");
    D=await r.json();
  }catch(e){
    D=await fetch("/data/dashboard.json",{cache:"no-store"}).then(r=>r.json());
  }
  $("#boot").hidden=true;$("#app").hidden=false;
  $("#syncLabel").textContent="UPDATED "+new Date(D.meta.lastUpdated).toLocaleString();
  buildIndex();buildGraph();bind();fitInitial();
}

function marker(shape,accent=false){
  return '<i class="marker '+shape+(accent?' accent':'')+'"></i>';
}
function sectionItems(id){
  if(id==="repos")return D.repos||[];
  if(id==="prompts")return D.prompts||[];
  if(id==="ventures")return D.ventures||[];
  if(id==="companies")return D.companies||[];
  if(id==="projects")return D.projects||[];
  if(id==="learning")return (D.learning?.rules||[]).map((r,i)=>({name:"Rule "+String(i+1).padStart(2,"0"),summary:r}));
  return [];
}
function itemName(id,o){
  if(id==="prompts")return o.title;
  return o.name||o.summary||"Untitled";
}
function itemMeta(id,o){
  if(id==="repos")return o.status||"";
  if(id==="prompts")return (o.codes||[]).slice(0,2).join(" ");
  if(id==="ventures")return o.status||"MODEL";
  if(id==="companies")return o.netIncome||"";
  if(id==="projects")return o.status||"";
  return "RULE";
}

function buildIndex(){
  $("#indexSections").innerHTML=sectionDefs.map((s,i)=>{
    const items=sectionItems(s.id), preview=items.slice(0,12);
    return '<section class="indexSection '+(i===0?'open':'')+'" data-section="'+s.id+'">'+
      '<button class="sectionToggle" data-focus-section="'+s.id+'">'+
        marker(s.shape,s.accent)+'<span>'+esc(s.label)+'</span><span class="count">'+items.length+'</span><span class="pm">'+(i===0?'−':'+')+'</span>'+
      '</button>'+
      '<div class="sectionBody">'+preview.map(o=>'<button class="indexItem" data-open="'+s.id+'" data-key="'+esc(itemName(s.id,o))+'"><span class="indexMeta">'+esc(itemMeta(s.id,o))+'</span><span>'+esc(itemName(s.id,o))+'</span></button>').join("")+
      (items.length>preview.length?'<button class="indexMore" data-show-all="'+s.id+'">+'+(items.length-preview.length)+' more</button>':'')+
      '</div></section>';
  }).join("");
}

function graphModel(){
  const nodes=[{id:"root",section:"root",label:"ENGINEERING INTELLIGENCE",meta:"LIVING SYSTEM",x:anchors.root[0],y:anchors.root[1],shape:"circle",accent:true,type:"root"}];
  const edges=[];
  sectionDefs.forEach((s,si)=>{
    const [x,y]=anchors[s.id];
    nodes.push({id:s.id,section:s.id,label:s.label.toUpperCase(),meta:sectionItems(s.id).length+" INDEXED",x,y,shape:s.shape,accent:s.accent,type:"cluster"});
    edges.push(["root",s.id]);
    const items=sectionItems(s.id).slice(0,s.id==="companies"?8:6);
    const radius=145+(si%2)*25;
    const start=-1.9+si*.22;
    const sweep=2.0;
    items.forEach((o,i)=>{
      const angle=start+(items.length===1?0:(i/(items.length-1))*sweep);
      const ix=x+Math.cos(angle)*radius, iy=y+Math.sin(angle)*radius;
      const key=itemName(s.id,o);
      const nid=s.id+":"+i;
      nodes.push({id:nid,section:s.id,key,label:key,meta:itemMeta(s.id,o),x:ix,y:iy,shape:s.shape,accent:false,type:"child"});
      edges.push([s.id,nid]);
    });
  });
  return {nodes,edges};
}
let G=null;

function buildGraph(){
  G=graphModel();
  const byId=Object.fromEntries(G.nodes.map(n=>[n.id,n]));
  $("#edges").innerHTML=G.edges.map(([a,b])=>{
    const A=byId[a],B=byId[b];
    return '<line class="edge" data-a="'+a+'" data-b="'+b+'" x1="'+A.x+'" y1="'+A.y+'" x2="'+B.x+'" y2="'+B.y+'"/>';
  }).join("");
  $("#nodes").innerHTML=G.nodes.map(n=>
    '<button class="node '+n.type+'" style="left:'+n.x+'px;top:'+n.y+'px" data-node="'+n.id+'" data-section="'+n.section+'"'+(n.key?' data-key="'+esc(n.key)+'"':'')+'>'+
    marker(n.shape,n.accent)+'<span>'+esc(n.label)+(n.meta?'<small>'+esc(n.meta)+'</small>':'')+'</span></button>'
  ).join("");
}

function bind(){
  $("#collapseIndex").onclick=()=>{
    const c=$("#indexCard").classList.toggle("collapsed");
    $("#collapseIndex").textContent=c?"+":"−";
  };
  $("#resetGraph").onclick=fitInitial;
  $("#detailClose").onclick=closeDetail;
  $("#homeBtn").onclick=()=>{state.activeSection="projects";highlightSection(null);fitInitial();closeDetail()};

  document.body.addEventListener("click",e=>{
    const t=e.target.closest(".sectionToggle");
    if(t){
      const sec=t.closest(".indexSection");
      const was=sec.classList.contains("open");
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
      const sec=node.dataset.section,key=node.dataset.key;
      if(node.dataset.node==="root"){fitInitial();closeDetail();return}
      if(key){openDetail(sec,key);focusItem(sec,key)}else focusSection(sec);
      return;
    }
  });

  const v=$("#graphViewport");
  v.addEventListener("pointerdown",e=>{
    if(e.target.closest(".node")||e.target.closest(".indexCard")||e.target.closest(".detailCard"))return;
    state.drag=true;state.lastX=e.clientX;state.lastY=e.clientY;v.setPointerCapture(e.pointerId);v.classList.add("dragging");
  });
  v.addEventListener("pointermove",e=>{
    if(!state.drag)return;
    state.x+=e.clientX-state.lastX;state.y+=e.clientY-state.lastY;state.lastX=e.clientX;state.lastY=e.clientY;applyTransform();
  });
  v.addEventListener("pointerup",()=>{state.drag=false;v.classList.remove("dragging")});
  v.addEventListener("wheel",e=>{
    e.preventDefault();
    const rect=v.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const old=state.scale,next=Math.min(2.2,Math.max(.45,old*Math.exp(-e.deltaY*.001)));
    const wx=(mx-state.x)/old,wy=(my-state.y)/old;
    state.scale=next;state.x=mx-wx*next;state.y=my-wy*next;applyTransform();
  },{passive:false});
  window.addEventListener("resize",()=>{if(innerWidth<620)focusSection(state.activeSection||"projects")});
}

function applyTransform(){
  $("#graphStage").style.transform="translate("+state.x+"px,"+state.y+"px) scale("+state.scale+")";
  $("#zoomReadout").textContent=Math.round(state.scale*100)+"%";
}
function fitInitial(){
  const vw=innerWidth,vh=innerHeight;
  const s=Math.min(vw/W,vh/H)*1.16;
  state.scale=Math.max(.55,Math.min(1.15,s));
  state.x=(vw-W*state.scale)/2-(innerWidth>700?80:0);
  state.y=(vh-H*state.scale)/2;
  applyTransform();highlightSection(null);
}
function focusSection(id){
  state.activeSection=id;
  const p=anchors[id]||anchors.root;
  const s=innerWidth<620?.82:1.15;
  const targetX=innerWidth<620?innerWidth*.5:innerWidth*.42;
  const targetY=innerHeight*.43;
  state.scale=s;state.x=targetX-p[0]*s;state.y=targetY-p[1]*s;
  applyTransform();highlightSection(id);
}
function focusItem(section,key){
  state.activeSection=section;state.activeKey=key;
  const n=G.nodes.find(n=>n.section===section&&n.key===key);
  if(!n){focusSection(section);return}
  const s=innerWidth<620?1:1.35,targetX=innerWidth<620?innerWidth*.48:innerWidth*.38,targetY=innerHeight*.42;
  state.scale=s;state.x=targetX-n.x*s;state.y=targetY-n.y*s;applyTransform();
  highlightSection(section,key);
}
function highlightSection(section,key){
  document.querySelectorAll(".node").forEach(el=>{
    const match=!section||el.dataset.section===section||el.dataset.node==="root";
    el.classList.toggle("inactive",!match);
    el.classList.toggle("active",!!key&&el.dataset.key===key);
  });
  document.querySelectorAll(".edge").forEach(el=>{
    const hot=!section||el.dataset.a===section||el.dataset.b===section||el.dataset.a==="root"&&el.dataset.b===section;
    el.classList.toggle("hot",!!section&&hot);el.style.opacity=hot?"1":".16";
  });
  document.querySelectorAll(".indexItem").forEach(el=>el.classList.toggle("active",!!key&&el.dataset.key===key));
}
function showAll(id){
  const section=document.querySelector('.indexSection[data-section="'+id+'"] .sectionBody');
  const items=sectionItems(id);
  section.innerHTML=items.map(o=>'<button class="indexItem" data-open="'+id+'" data-key="'+esc(itemName(id,o))+'"><span class="indexMeta">'+esc(itemMeta(id,o))+'</span><span>'+esc(itemName(id,o))+'</span></button>').join("");
}

function openDetail(type,key){
  let h="",o;
  if(type==="repos"){
    o=D.repos.find(x=>x.name===key);if(!o)return;
    h=eyebrow("REPOSITORY",o.status,"square")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.capability)+'</p>'+
      '<h4>USED FOR</h4><p>'+esc((o.usedFor||[]).join(" / "))+'</p>'+
      '<h4>WHAT PEOPLE ALREADY DO WITH IT</h4><p>'+esc((o.examples||[]).join(" / "))+'</p>'+
      '<h4>POTENTIAL</h4><p>'+esc(o.potential)+'</p><p><a href="'+esc(o.url)+'" target="_blank" rel="noreferrer">OPEN REPOSITORY ↗</a></p>';
  }
  if(type==="prompts"){
    o=D.prompts.find(x=>x.title===key);if(!o)return;
    h=eyebrow("PROMPT SYSTEM",o.origin||"LIBRARY","diamond")+'<h2>'+esc(o.title)+'</h2><div class="chips">'+(o.codes||[]).map(c=>'<span class="chip">'+esc(c)+'</span>').join("")+'</div><p>'+esc(o.summary)+'</p>';
  }
  if(type==="ventures"){
    o=D.ventures.find(x=>x.name===key);if(!o)return;
    h=eyebrow("VENTURE",o.status||"MODELLED","triangle")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.thesis)+'</p>'+
      '<div class="metricRow"><div class="metric"><b>'+money(o.model.meanRevenue)+'</b><span>modelled mean</span></div><div class="metric"><b>'+Math.round((o.model.p100||0)*100)+'%</b><span>P ≥ $100</span></div><div class="metric"><b>'+esc(o.model.medianDaysToFirstDollar)+'d</b><span>modelled first $</span></div></div>'+
      '<h4>STACK</h4><p>'+esc((o.stack||[]).join(" / "))+'</p><h4>RISK</h4><p>'+esc(o.risk)+'</p><h4>NEXT TEST</h4><p>'+esc(o.nextTest)+'</p>';
  }
  if(type==="companies"){
    o=D.companies.find(x=>x.name===key);if(!o)return;const p=D.companyProfiles?.[key];
    h=eyebrow("COMPANY","#"+o.rank,"circle")+'<h2>'+esc(o.name)+'</h2><div class="metricRow"><div class="metric"><b>'+esc(o.netIncome)+'</b><span>net income</span></div><div class="metric"><b>'+esc(o.yoy)+'</b><span>YoY</span></div><div class="metric"><b>'+esc(o.ticker)+'</b><span>ticker</span></div></div>'+
      (p?'<h4>WHAT IT DOES</h4><p>'+esc(p.does)+'</p><h4>WHY IT MAKES MONEY</h4><p>'+esc(p.why)+'</p><h4>MOAT</h4><p>'+esc(p.moat)+'</p><h4>LESSON</h4><p>'+esc(p.lesson)+'</p>':'<h4>PROFILE</h4><p>Financial record indexed. Qualitative analysis queued.</p>');
  }
  if(type==="projects"){
    o=D.projects.find(x=>x.name===key);if(!o)return;
    h=eyebrow("CURRENT SYSTEM",o.status||"","circle")+'<h2>'+esc(o.name)+'</h2><p>'+esc(o.purpose)+'</p><h4>KIND</h4><p>'+esc(o.kind)+'</p><h4>EVIDENCE</h4><p>'+esc(o.evidence)+'</p>';
  }
  if(type==="learning"){
    const idx=Number((key.match(/\d+/)||["1"])[0])-1;const r=D.learning.rules[idx];
    h=eyebrow("LEARNING RULE","OUTCOME MEMORY","cross")+'<h2>'+esc(key)+'</h2><p>'+esc(r)+'</p><h4>LOOP</h4><p>'+esc((D.learning.loop||[]).join(" → "))+'</p><h4>WOLFRAM</h4><p>'+esc(D.wolfram.caveat)+'</p>';
  }
  $("#detailBody").innerHTML=h;$("#detailCard").hidden=false;
}
function eyebrow(a,b,shape){return '<div class="detailEyebrow">'+marker(shape,false)+'<span>'+esc(a)+' / '+esc(b)+'</span></div>'}
function closeDetail(){$("#detailCard").hidden=true;state.activeKey=null;highlightSection(state.activeSection)}

load();
setInterval(async()=>{
  try{
    const r=await fetch(REMOTE+"?v="+Date.now(),{cache:"no-store"});
    if(!r.ok)return;
    const n=await r.json();
    if(D&&n.meta.lastUpdated!==D.meta.lastUpdated){
      D=n;$("#syncLabel").textContent="UPDATED "+new Date(D.meta.lastUpdated).toLocaleString();buildIndex();buildGraph();highlightSection(state.activeSection,state.activeKey);
    }
  }catch(e){}
},60000);
