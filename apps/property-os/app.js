(function atlasPropertyOS(){
"use strict";
const key="atlas-property-os-demo-v1";
const day=(d)=>{const x=new Date();x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};
const seed={
  properties:[
    {id:"p1",name:"Bloomsbury House",address:"17 Russell Square",city:"London WC1B",type:"Residential",status:"Occupied",value:1250000,rent:3950,beds:3,sqft:1840},
    {id:"p2",name:"Brampton Mews",address:"8 Brampton Mews",city:"London SW3",type:"Residential",status:"Occupied",value:975000,rent:3200,beds:2,sqft:1260},
    {id:"p3",name:"The Glassworks",address:"42 Kingsland Road",city:"London E2",type:"Commercial",status:"Listed",value:1850000,rent:6250,beds:0,sqft:3100},
    {id:"p4",name:"Willow Court",address:"6 Willow Lane",city:"Richmond TW9",type:"Residential",status:"Renovation",value:780000,rent:0,beds:3,sqft:1540},
    {id:"p5",name:"Southbank Studio",address:"21 Lower Marsh",city:"London SE1",type:"Commercial",status:"Vacant",value:640000,rent:0,beds:0,sqft:950}
  ],
  tasks:[
    {id:"t1",propertyId:"p1",title:"Annual boiler inspection",priority:"Urgent",status:"Open",due:day(3)},
    {id:"t2",propertyId:"p2",title:"Repair courtyard gate",priority:"Normal",status:"In progress",due:day(8)},
    {id:"t3",propertyId:"p4",title:"Confirm plastering contractor",priority:"Urgent",status:"Open",due:day(1)},
    {id:"t4",propertyId:"p3",title:"Review safety certificate",priority:"Normal",status:"Open",due:day(16)},
    {id:"t5",propertyId:"p5",title:"Arrange window cleaning",priority:"Low",status:"Complete",due:day(-2)}
  ],
  leases:[
    {id:"l1",propertyId:"p1",tenant:"Oliver & Amelia Carter",rent:3950,start:"2026-02-01",end:"2027-01-31",status:"Active"},
    {id:"l2",propertyId:"p2",tenant:"Isabella Turner",rent:3200,start:"2026-04-15",end:"2027-04-14",status:"Active"},
    {id:"l3",propertyId:"p3",tenant:"Northline Creative Ltd",rent:6250,start:"2024-11-01",end:"2026-11-01",status:"Review"}
  ],
  deals:[
    {id:"d1",propertyId:"p3",name:"Glassworks commercial sale",stage:"Viewing",amount:1850000,contact:"Harper & Co"},
    {id:"d2",propertyId:"p5",name:"Southbank Studio letting",stage:"Enquiry",amount:2800,contact:"Marlow Design"},
    {id:"d3",propertyId:"p4",name:"Willow Court refinance",stage:"Offer",amount:620000,contact:"Oakley Finance"},
    {id:"d4",propertyId:"p2",name:"Brampton lease renewal",stage:"Negotiation",amount:3300,contact:"Isabella Turner"}
  ],
  documents:[
    {id:"x1",propertyId:"p1",name:"Tenancy agreement — Russell Square",category:"Lease",updated:day(-20)},
    {id:"x2",propertyId:"p3",name:"Commercial energy certificate",category:"Certificate",updated:day(-3)},
    {id:"x3",propertyId:"p4",name:"Willow Court renovation drawings",category:"Plans",updated:day(-10)},
    {id:"x4",propertyId:"p2",name:"Inventory and condition report",category:"Inspection",updated:day(-30)},
    {id:"x5",propertyId:"p5",name:"Southbank property survey",category:"Survey",updated:day(-14)}
  ],
  projects:[
    {id:"r1",propertyId:"p4",name:"Willow Court renovation",budget:85000,spent:31800,progress:42,phase:"In progress"},
    {id:"r2",propertyId:"p3",name:"Glassworks façade works",budget:24000,spent:9000,progress:32,phase:"In progress"},
    {id:"r3",propertyId:"p1",name:"Kitchen refresh",budget:15000,spent:15000,progress:100,phase:"Complete"}
  ],
  expenses:[
    {id:"e1",propertyId:"p4",name:"Plastering deposit",amount:3200,date:day(-5),kind:"Renovation"},
    {id:"e2",propertyId:"p1",name:"Boiler service",amount:210,date:day(-12),kind:"Maintenance"},
    {id:"e3",propertyId:"p3",name:"Building insurance",amount:1950,date:day(-9),kind:"Insurance"},
    {id:"e4",propertyId:"p2",name:"Gardening",amount:180,date:day(-17),kind:"Maintenance"}
  ],
  notes:[{id:"n1",question:"Commercial letting comparables near Shoreditch",source:"Internal research brief",outcome:"Add verified comparable listings, asking rents and dates before drawing conclusions.",date:day(-4)}]
};
let state;
try{const existing=JSON.parse(localStorage.getItem(key)||"null");state=existing&&Array.isArray(existing.properties)?{...structuredClone(seed),...existing}:structuredClone(seed)}catch{state=structuredClone(seed)}
let view="overview",filter="All",query="",modalOpen=false,toastTimer;
const $=(s)=>document.querySelector(s), $$=(s)=>Array.from(document.querySelectorAll(s));
const esc=(s)=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const money=(n)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(Number(n)||0);
const nfmt=(n)=>new Intl.NumberFormat("en-GB").format(Number(n)||0);
const per=(n)=>`${(Number(n)||0).toFixed(1)}%`;
const date=(d)=>{if(!d)return "—";const parsed=new Date(`${d}T00:00:00`);return Number.isNaN(parsed.getTime())?esc(d):new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric"}).format(parsed)};
const property=(id)=>state.properties.find(p=>p.id===id);
const pname=(id)=>property(id)?.name||"Unassigned";
const status=(s)=>`<span class="status status-${esc(String(s).toLowerCase().replace(/[^a-z]+/g,"-"))}">${esc(s)}</span>`;
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){toast("Unable to save: browser storage is full")}};
const notify=(message)=>{const t=$("#toast");t.textContent=message;t.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("visible"),3200)};
const id=()=>globalThis.crypto?.randomUUID?.()||("id"+Date.now()+Math.random().toString(36).slice(2));
const calc=()=>{const count=state.properties.length,value=state.properties.reduce((a,p)=>a+(+p.value||0),0),monthly=state.properties.reduce((a,p)=>a+(+p.rent||0),0),occupied=state.properties.filter(p=>p.status==="Occupied").length;return {count,value,monthly,occupied,open:state.tasks.filter(t=>t.status!=="Complete").length}};
function head(eyebrow,title,sub,action){return `<div class="page-head"><div><div class="eyebrow">${esc(eyebrow)}</div><h1 class="page-title">${esc(title)}</h1><div class="page-subtitle">${esc(sub)}</div></div>${action||""}</div>`}
function metric(name,value,foot,icon){return `<article class="metric"><div class="metric-head"><span class="metric-name">${name}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`}
function table(headers,rows){return `<div class="panel table-scroll"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")||`<tr><td colspan="${headers.length}">${empty("Nothing here yet","Add your first entry to get started.")}</td></tr>`}</tbody></table></div>`}
function empty(title,sub){return `<div class="empty"><div class="empty-icon">◇</div><h3>${title}</h3><p>${sub}</p></div>`}
function visual(p,mode=""){const ix=state.properties.findIndex(x=>x.id===p.id)%5+1;return `<div class="${mode} visual building-${ix}"><span class="card-top-badge">${esc(p.type)}</span></div>`}
function propcell(p){return `<div class="property-cell"><div class="property-thumb building-${state.properties.findIndex(x=>x.id===p.id)%5+1}"></div><span><strong>${esc(p.name)}</strong><small>${esc(p.city)}</small></span></div>`}
function rowProperty(p){return `<tr><td>${propcell(p)}</td><td>${status(p.status)}</td><td>${money(p.value)}</td><td>${p.rent?money(p.rent):"—"}</td><td><button class="text-button" data-action="view-property" data-id="${esc(p.id)}">View ↗</button></td></tr>`}
function section(label,viewName){return `<div class="section-header"><h2>${label}</h2><button class="link-btn" data-nav="${viewName}">View all →</button></div>`}
function renderOverview(){
const c=calc(),pct=c.count?Math.round(c.occupied/c.count*100):0;
const activity=state.tasks.slice(0,4).map((t,i)=>`<div class="activity-item"><div class="activity-icon">${["◇","⚒","◈","▤"][i%4]}</div><div class="activity-copy"><strong>${esc(t.title)}</strong><span>${esc(pname(t.propertyId))} · ${esc(t.status)}</span></div><span class="activity-time">${date(t.due)}</span></div>`).join("");
return `${head("PORTFOLIO COMMAND CENTRE","Your property portfolio, at a glance.","A clearer view of everything you own, manage and plan.",`<div class="actions"><button class="btn" data-nav="insights">↗ View insights</button><button class="btn btn-primary" data-action="add-property">＋ Add property</button></div>`)}
<div class="top-promo"><div><div class="eyebrow">THE COMPLETE PICTURE</div><h2>Every property. Every detail. One place.</h2><p>From initial acquisition to letting, renovation and long-term ownership.</p></div><button class="btn" data-nav="portfolio">Explore portfolio <span class="tiny-arrow">↗</span></button></div>
<div class="metrics">${metric("Portfolio valuation",money(c.value),"<strong>Illustrative</strong> values entered in demo","◈")}${metric("Monthly scheduled rent",money(c.monthly),"Across properties with recorded rent","↗")}${metric("Properties managed",nfmt(c.count),`${c.occupied} currently marked occupied`,"▥")}${metric("Open maintenance",nfmt(c.open),`${state.tasks.filter(t=>t.priority==="Urgent"&&t.status!=="Complete").length} marked urgent`,"⚒")}</div>
<div class="dashboard-grid"><div>${section("Your properties","portfolio")}${table(["PROPERTY","STATUS","VALUE","MONTHLY RENT",""],state.properties.slice(0,5).map(rowProperty))}</div><div>${section("Attention needed","maintenance")}<div class="panel activity-wrap">${activity||empty("Nothing pending","New maintenance items will appear here.")}</div></div></div>
<div class="dashboard-grid"><div>${section("Portfolio composition","insights")}<div class="panel panel-padded"><div style="display:flex;justify-content:space-between;gap:20px;align-items:center"><div><div class="section-kpi">${pct}%</div><div class="section-kpi-note">Currently occupied</div></div><div style="width:67%;min-width:130px"><div class="progress" style="height:11px"><span style="width:${pct}%"></span></div><p style="color:#8d9e91;font-size:11px">Based on property status; this is not a time-weighted occupancy rate.</p></div></div></div></div><div>${section("Quick actions","portfolio")}<div class="panel panel-padded" style="display:grid;gap:11px"><button class="btn" data-action="add-task">⚒ Log maintenance</button><button class="btn" data-action="add-document">▧ Record document</button><button class="btn" data-action="add-expense">◈ Add an expense</button></div></div></div>`;
}
function renderPortfolio(){
const filtered=state.properties.filter(p=>(filter==="All"||p.status===filter)&&`${p.name} ${p.city} ${p.address}`.toLowerCase().includes(query.toLowerCase()));
return `${head("YOUR PORTFOLIO","Properties","Your complete property directory, with every asset in context.",`<button class="btn btn-primary" data-action="add-property">＋ Add property</button>`)}
<div class="portfolio-toolbar">${["All","Occupied","Vacant","Listed","Renovation"].map(s=>`<button data-action="filter" data-value="${s}" class="filter-chip ${filter===s?"active":""}">${s}</button>`).join("")}<input id="portfolio-query" class="toolbar-search" placeholder="Search by property or location" value="${esc(query)}" aria-label="Search properties"/></div>
<div class="portfolio-grid">${filtered.map(p=>`<article class="property-card">${visual(p)}<div class="card-body"><h3>${esc(p.name)}</h3><div class="card-address">${esc(p.address)}, ${esc(p.city)}</div><div class="card-meta"><div><span>Status</span><strong>${esc(p.status)}</strong></div><div><span>Floor area</span><strong>${nfmt(p.sqft)} ft²</strong></div><div><span>Beds</span><strong>${p.beds||"—"}</strong></div></div><div class="card-bottom"><div><small>Estimated value</small><strong>${money(p.value)}</strong></div><button class="property-icon-button" data-action="view-property" data-id="${esc(p.id)}">Open ↗</button></div></div></article>`).join("")||empty("No matching properties","Try a different filter, or add a property.")}</div>`;
}
function renderPipeline(){
const stages=["Enquiry","Viewing","Offer","Negotiation"];
return `${head("SALES & LETTINGS","Opportunity pipeline","Keep negotiations, contacts and opportunities connected to your properties.",`<button class="btn btn-primary" data-action="add-deal">＋ New opportunity</button>`)}
<div class="kanban">${stages.map(st=>`<div class="kanban-col"><div class="kanban-head">${st}<span>${state.deals.filter(d=>d.stage===st).length}</span></div>${state.deals.filter(d=>d.stage===st).map(d=>`<article class="deal-card"><h3>${esc(d.name)}</h3><small>${esc(pname(d.propertyId))} · ${esc(d.contact)}</small><strong>${money(d.amount)}</strong><div class="deal-actions"><select data-stage="${esc(d.id)}" aria-label="Move stage">${stages.map(x=>`<option ${x===d.stage?"selected":""}>${x}</option>`).join("")}</select><button class="text-button" data-action="edit-deal" data-id="${esc(d.id)}">Edit ↗</button></div></article>`).join("")||`<p class="stat-muted" style="padding:5px">No opportunities in this stage.</p>`}</div>`).join("")}</div>`;
}
function renderTenancies(){return `${head("PROPERTY MANAGEMENT","Tenancies & leases","Lease dates, recorded rent, tenants and upcoming reviews.",`<button class="btn btn-primary" data-action="add-lease">＋ Add tenancy</button>`)}
${table(["PROPERTY","TENANT","START DATE","END DATE","MONTHLY RENT","STATUS",""],state.leases.map(l=>`<tr><td>${esc(pname(l.propertyId))}</td><td><strong>${esc(l.tenant)}</strong></td><td>${date(l.start)}</td><td>${date(l.end)}</td><td>${money(l.rent)}</td><td>${status(l.status)}</td><td><button class="text-button" data-action="edit-lease" data-id="${l.id}">Edit ↗</button></td></tr>`))}
<div class="section-header"><h2>Lease overview</h2></div><div class="insight-grid"><div class="insight-box"><h3>Recorded monthly rent</h3><div class="section-kpi">${money(state.leases.filter(l=>l.status==="Active").reduce((a,l)=>a+(+l.rent||0),0))}</div><p>Based on leases marked active, not reconciled bank payments.</p></div><div class="insight-box"><h3>Lease reviews</h3><div class="section-kpi">${state.leases.filter(l=>l.status==="Review").length}</div><p>Contracts marked for review. Dates should be verified against executed agreements.</p></div></div>`}
function renderMaintenance(){
const open=state.tasks.filter(t=>t.status!=="Complete").length;
return `${head("OPERATIONS","Maintenance desk","Record repairs, set priorities and keep a reliable history of work.",`<button class="btn btn-primary" data-action="add-task">＋ Log request</button>`)}
<div class="metrics" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:21px">${metric("Open requests",open,"Awaiting resolution","⚒")}${metric("Urgent requests",state.tasks.filter(t=>t.priority==="Urgent"&&t.status!=="Complete").length,"Require attention","!")}${metric("Completed",state.tasks.filter(t=>t.status==="Complete").length,"Recorded history","✓")}</div>
${table(["WORK ORDER","PROPERTY","PRIORITY","DUE","STATUS","ACTIONS"],state.tasks.map(t=>`<tr><td><strong>${esc(t.title)}</strong></td><td>${esc(pname(t.propertyId))}</td><td>${status(t.priority==="Normal"?"Active":t.priority)}</td><td>${date(t.due)}</td><td>${status(t.status)}</td><td><div class="actions"><button class="text-button" data-action="edit-task" data-id="${t.id}">Edit</button><button class="text-button" data-action="toggle-task" data-id="${t.id}">${t.status==="Complete"?"Reopen":"Complete"}</button></div></td></tr>`))}`}
function renderProjects(){return `${head("CONSTRUCTION & WORKS","Projects & renovations","Budgets, work stages and progress connected to their properties.",`<button class="btn btn-primary" data-action="add-project">＋ New project</button>`)}
<div class="portfolio-grid">${state.projects.map(r=>`<article class="panel panel-padded"><div class="eyebrow">${esc(pname(r.propertyId))}</div><h3 style="font:800 18px Manrope;margin:12px 0 10px">${esc(r.name)}</h3>${status(r.phase)}<div style="display:flex;justify-content:space-between;margin:21px 0 13px"><span class="stat-muted">Completion</span><strong>${r.progress}%</strong></div><div class="progress"><span style="width:${Math.min(100,Math.max(0,Number(r.progress)||0))}%"></span></div><div class="card-meta"><div><span>Budget</span><strong>${money(r.budget)}</strong></div><div><span>Spent</span><strong>${money(r.spent)}</strong></div><div><span>Remaining</span><strong>${money(r.budget-r.spent)}</strong></div></div><div class="card-bottom"><span class="stat-muted">Manual project estimate</span><button class="text-button" data-action="edit-project" data-id="${r.id}">Manage ↗</button></div></article>`).join("")||empty("No projects","Add your first renovation or building project.")}</div><div class="section-header"><h2>Future integrations</h2></div><div class="note">Drawing take-off (OpenTakeoff), BIM inspection (IfcOpenShell) and drone surveys (OpenDroneMap) are planned integrations, not operational features in this prototype.</div>`}
function renderDocuments(){
const docs=state.documents.filter(d=>filter==="All"||d.category===filter);
return `${head("PROPERTY RECORDS","Documents & compliance","A central index for leases, surveys, plans and certificates.",`<button class="btn btn-primary" data-action="add-document">＋ Add document record</button>`)}
<div class="note" style="margin-bottom:19px"><strong>Document register only.</strong> This demo saves document names and metadata locally. It does not store, analyse or upload actual files.</div>
<div class="portfolio-toolbar">${["All","Lease","Certificate","Plans","Inspection","Survey","Other"].map(x=>`<button class="filter-chip ${filter===x?"active":""}" data-action="filter" data-value="${x}">${x}</button>`).join("")}</div>
${table(["DOCUMENT","CATEGORY","PROPERTY","RECORDED DATE",""],docs.map(d=>`<tr><td><div class="property-cell"><span class="mini-icon">▧</span><strong>${esc(d.name)}</strong></div></td><td>${status(d.category==="Lease"?"Active":"Draft").replace(/>.*?</,">"+esc(d.category)+"<")}</td><td>${esc(pname(d.propertyId))}</td><td>${date(d.updated)}</td><td><button class="text-button" data-action="edit-document" data-id="${d.id}">Edit ↗</button></td></tr>`))}`}
function renderFinance(){
const c=calc(),total=state.expenses.reduce((a,e)=>a+(+e.amount||0),0);
const groups=["Maintenance","Renovation","Insurance","Utilities","Other"];
return `${head("PORTFOLIO ECONOMICS","Financial overview","Understand recorded income, costs and indicative investment performance.",`<button class="btn btn-primary" data-action="add-expense">＋ Add expense</button>`)}
<div class="metrics">${metric("Property valuation",money(c.value),"Illustrative, owner-entered values","◈")}${metric("Scheduled annual rent",money(c.monthly*12),"Not collected rent or bank balances","↗")}${metric("Recorded expenses",money(total),"Expenses currently entered in demo","↓")}${metric("Gross portfolio yield",per(c.value?c.monthly*12/c.value*100:0),"Annual scheduled rent ÷ valuation","%")}</div>
<div class="two-col" style="margin-top:22px"><div><div class="section-header"><h2>Expense ledger</h2></div>${table(["DESCRIPTION","PROPERTY","TYPE","DATE","AMOUNT"],state.expenses.map(e=>`<tr><td><strong>${esc(e.name)}</strong></td><td>${esc(pname(e.propertyId))}</td><td>${esc(e.kind)}</td><td>${date(e.date)}</td><td><strong>${money(e.amount)}</strong></td></tr>`))}</div><div><div class="section-header"><h2>Expense breakdown</h2></div><div class="panel panel-padded">${groups.map(g=>{const n=state.expenses.filter(e=>e.kind===g).reduce((a,e)=>a+Number(e.amount),0);return `<div class="breakdown-row"><span>${g}</span><strong>${money(n)}</strong></div><div class="progress"><span style="width:${total?n/total*100:0}%"></span></div>`}).join("")}</div></div></div>
<div class="section-header"><h2>Investment scenario calculator</h2><p>Indicative calculations only</p></div>
<div class="two-col"><div class="calc-panel"><div class="form-grid"><div class="field"><label>Purchase price (£)</label><input id="calc-price" type="number" min="1" value="650000"/></div><div class="field"><label>Expected monthly rent (£)</label><input id="calc-rent" type="number" min="0" value="2900"/></div><div class="field"><label>Annual operating costs (£)</label><input id="calc-costs" type="number" min="0" value="5000"/></div><div class="field"><label>Annual financing costs (£)</label><input id="calc-debt" type="number" min="0" value="12000"/></div></div></div><div class="calc-result"><div class="label">Estimated annual cashflow before tax</div><strong id="cashflow">—</strong><div class="breakdown-row"><span>Gross rental yield</span><strong id="gross-yield">—</strong></div><div class="breakdown-row"><span>Net operating yield (before finance)</span><strong id="net-yield">—</strong></div><div class="breakdown-row"><span>Monthly cashflow</span><strong id="monthly-flow">—</strong></div><p style="font-size:10px;color:#7e9484;line-height:1.6">Excludes purchase taxes, void periods, capital expenditure and other unentered costs. Not financial advice.</p></div></div>`}
function renderInsights(){
const c=calc(), byStatus=["Occupied","Listed","Vacant","Renovation"],spent=state.projects.reduce((a,r)=>a+(+r.spent||0),0),budgets=state.projects.reduce((a,r)=>a+(+r.budget||0),0);
return `${head("PORTFOLIO INTELLIGENCE","Insights & reporting","Useful signals from the records currently held in your workspace.",`<button class="btn" data-action="export">↓ Export dataset</button>`)}
<div class="metrics">${metric("Active leases",state.leases.filter(l=>l.status==="Active").length,"From entered agreements","▦")}${metric("Gross rental yield",per(c.value?c.monthly*12/c.value*100:0),"Indicative, not net return","%")}${metric("Works budget",money(budgets),"Across current projects","▥")}${metric("Project spend",money(spent),"Manually entered","◈")}</div>
<div class="two-col" style="margin-top:21px"><div class="panel panel-padded"><h3>Properties by status</h3><p class="stat-muted">Snapshot of current property records</p><div class="bar-chart">${byStatus.map(s=>{let n=state.properties.filter(p=>p.status===s).length;return `<div class="bar-wrap"><div class="bar" style="height:${Math.max(4,n/Math.max(1,c.count)*170)}px"></div><small>${s} (${n})</small></div>`}).join("")}</div></div><div class="panel panel-padded"><h3>Asset mix</h3><p class="stat-muted">Illustrative valuation by property</p>${state.properties.map(p=>`<div class="breakdown-row"><span>${esc(p.name)}</span><strong>${money(p.value)}</strong></div><div class="progress"><span style="width:${c.value?p.value/c.value*100:0}%"></span></div>`).join("")}</div></div>`}
function renderResearch(){
const repos=[
["GPT Researcher","Automated source-backed property and market research.","https://github.com/assafelovic/gpt-researcher"],
["STORM","Research from multiple perspectives and outlines.","https://github.com/stanford-oval/storm"],
["Perplexica / Vane","Open-source research search interface.","https://github.com/ItzCrazyKns/Perplexica"],
["Crawl4AI","Extract structured information from public pages.","https://github.com/unclecode/crawl4ai"],
["PaperQA2","Evidence lookup across scientific and technical papers.","https://github.com/Future-House/paper-qa"],
["Docling","Turn property PDFs, tables and documents into structured content.","https://github.com/docling-project/docling"],
["GraphRAG","Connect entities, documents, relationships and findings.","https://github.com/microsoft/graphrag"],
["LightRAG","Retrieve knowledge from accumulated research.","https://github.com/HKUDS/LightRAG"]];
return `${head("EVIDENCE & DISCOVERY","Research studio","An expandable research architecture inspired by your supplied GitHub research list.",`<button class="btn btn-primary" data-action="add-note">＋ Record research note</button>`)}
<div class="research-intro"><div style="position:relative;z-index:1"><div class="eyebrow">RESEARCH ENGINE · PLANNED</div><h2>From questions to verifiable evidence.</h2><p>Bring together market research, contract evidence, geographic analysis and research notes in one property context. The repositories below are reference integrations, not connected live services.</p><span class="research-chip">Source tracking</span><span class="research-chip">Claim verification</span><span class="research-chip">Property context</span></div></div>
${section("Research capability library","research")}<div class="repo-grid">${repos.map(r=>`<article class="repo-card"><span class="repo-state">NOT CONNECTED</span><strong>${esc(r[0])}</strong><p>${esc(r[1])}</p><a href="${esc(r[2])}" target="_blank" rel="noreferrer">View repository ↗</a></article>`).join("")}</div>
<div class="section-header"><h2>Internal research notes</h2><button class="link-btn" data-action="add-note">Add note ＋</button></div><div class="panel">${state.notes.map(n=>`<div class="list-row"><span class="mini-icon">✳</span><div class="row-main"><strong>${esc(n.question)}</strong><small>${esc(n.outcome)} · Source: ${esc(n.source)}</small></div><span class="stat-muted">${date(n.date)}</span><button class="text-button" data-action="edit-note" data-id="${n.id}">Edit</button></div>`).join("")||empty("No notes","Capture a question, source and takeaway.")}</div>`}
function renderSettings(){return `${head("WORKSPACE PREFERENCES","Settings","About this interactive demonstration and its data.")}<div class="two-col"><div class="panel panel-padded"><h3>Local demonstration</h3><p style="line-height:1.8;color:#809087">This is a working browser-only prototype. Entries you add or edit are stored in localStorage on this device and browser, not in a shared cloud database. It has no user authentication, external property data feeds or production integrations.</p><div class="note">Do not enter genuine sensitive tenant, financial or legal data into this demo. It is not a production records system.</div><div class="actions" style="margin-top:22px"><button class="btn" data-action="export">↓ Export current data</button><button class="btn btn-danger" data-action="reset">Reset demo data</button></div></div><div class="panel panel-padded"><h3>Planned production architecture</h3>${["PostgreSQL and server-side access controls","Private document storage and audit trail","Role-based multi-tenant authentication","Lease, maintenance and finance workflows","Modular integrations for research, GIS and BIM"].map(s=>`<div class="activity-item"><div class="activity-icon">◇</div><div class="activity-copy"><strong>${s}</strong><span>Planned — not implemented in this demo</span></div></div>`).join("")}</div></div>`}
const viewMap={overview:renderOverview,portfolio:renderPortfolio,pipeline:renderPipeline,tenancies:renderTenancies,maintenance:renderMaintenance,projects:renderProjects,documents:renderDocuments,finance:renderFinance,insights:renderInsights,research:renderResearch,settings:renderSettings};
const labels={overview:"Overview",portfolio:"Properties",pipeline:"Sales pipeline",tenancies:"Tenancies",maintenance:"Maintenance",projects:"Projects & works",documents:"Documents",finance:"Financials",insights:"Insights",research:"Research studio",settings:"Settings"};
function render(){const fn=viewMap[view]||renderOverview;$("#content").innerHTML=`<div class="page">${fn()}</div>`;$("#breadcrumb").textContent=labels[view]||"Overview";$$("[data-nav]").forEach(n=>n.classList.toggle("active",n.dataset.nav===view));$("#nav-task-count").textContent=calc().open;if(view==="finance")updateCalc()}
function navigate(v){if(!viewMap[v])return;view=v;filter="All";query="";render();$("#sidebar").classList.remove("open");document.body.classList.remove("menu-open");window.scrollTo({top:0,behavior:"smooth"})}
function showModal(title,content){modalOpen=true;$("#modal-root").innerHTML=`<div class="modal-overlay" data-overlay><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${esc(title)}</h2><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></header><div class="modal-body">${content}</div></div></div>`;setTimeout(()=>$("#modal-root input,#modal-root select")?.focus(),30)}
function closeModal(){modalOpen=false;$("#modal-root").innerHTML=""}
function field(name,label,type="text",value="",options=[],required=true){
const attrs=`name="${name}" id="f-${name}" ${required?"required":""}`;
return `<div class="field"><label for="f-${name}">${label}</label>${type==="select"?`<select ${attrs}>${options.map(o=>{const val=typeof o==="string"?o:o[0],title=typeof o==="string"?o:o[1];return `<option value="${esc(val)}" ${String(value)===String(val)?"selected":""}>${esc(title)}</option>`}).join("")}</select>`:type==="textarea"?`<textarea ${attrs}>${esc(value)}</textarea>`:`<input ${attrs} type="${type}" value="${esc(value)}" ${type==="number"?'min="0" step="any"':""}/>`}</div>`}
const propOpts=()=>state.properties.map(p=>[p.id,p.name]);
const foot=`<div class="modal-footer"><button type="button" class="btn" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save changes →</button></div>`;
function openForm(type,entityId){
let singular={property:"property",task:"maintenance request",deal:"opportunity",lease:"tenancy",project:"project",document:"document record",expense:"expense",note:"research note"}[type];if(!singular)return;
const collections={property:"properties",task:"tasks",deal:"deals",lease:"leases",project:"projects",document:"documents",expense:"expenses",note:"notes"};
const current=state[collections[type]].find(e=>e.id===entityId)||{},x=(k)=>current[k]??"";
let fields="";
switch(type){
case "property":fields=field("name","Property name","text",x("name"))+field("address","Street address","text",x("address"))+field("city","City / postcode","text",x("city"))+field("type","Property type","select",x("type")||"Residential",["Residential","Commercial","Mixed use","Land"])+field("status","Status","select",x("status")||"Vacant",["Occupied","Vacant","Listed","Renovation"])+field("value","Estimated value (£)","number",x("value"))+field("rent","Scheduled monthly rent (£)","number",x("rent"))+field("beds","Bedrooms","number",x("beds"))+field("sqft","Internal area (ft²)","number",x("sqft"));break;
case "task":fields=field("title","Work required","text",x("title"))+field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("priority","Priority","select",x("priority")||"Normal",["Low","Normal","Urgent"])+field("status","Status","select",x("status")||"Open",["Open","In progress","Complete"])+field("due","Target date","date",x("due")||day(7));break;
case "deal":fields=field("name","Opportunity","text",x("name"))+field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("contact","Contact","text",x("contact"))+field("stage","Pipeline stage","select",x("stage")||"Enquiry",["Enquiry","Viewing","Offer","Negotiation"])+field("amount","Indicative value (£)","number",x("amount"));break;
case "lease":fields=field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("tenant","Tenant / organisation","text",x("tenant"))+field("rent","Monthly contractual rent (£)","number",x("rent"))+field("start","Start date","date",x("start")||day(0))+field("end","End date","date",x("end")||day(365))+field("status","Status","select",x("status")||"Active",["Active","Review","Draft","Archived"]);break;
case "project":fields=field("name","Project name","text",x("name"))+field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("budget","Budget (£)","number",x("budget"))+field("spent","Spent to date (£)","number",x("spent"))+field("progress","Completion %","number",x("progress"))+field("phase","Phase","select",x("phase")||"Planned",["Planned","In progress","Complete"]);break;
case "document":fields=field("name","Document title","text",x("name"))+field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("category","Category","select",x("category")||"Other",["Lease","Certificate","Plans","Inspection","Survey","Other"])+field("updated","Record date","date",x("updated")||day(0));break;
case "expense":fields=field("name","Description","text",x("name"))+field("propertyId","Property","select",x("propertyId")||state.properties[0]?.id,propOpts())+field("kind","Category","select",x("kind")||"Maintenance",["Maintenance","Renovation","Insurance","Utilities","Other"])+field("amount","Amount (£)","number",x("amount"))+field("date","Date","date",x("date")||day(0));break;
case "note":fields=field("question","Research question","text",x("question"))+field("source","Source or reference","text",x("source"))+field("outcome","Finding / next verification step","textarea",x("outcome"));}
const warn=type==="document"?`<div class="note" style="margin-top:12px">This records metadata only. No file is uploaded or stored.</div>`:"";
showModal(`${entityId?"Edit":"Add"} ${singular}`,`<form data-form="${type}" data-id="${esc(entityId||"")}"><div class="form-grid">${fields}</div>${warn}${foot}</form>`);
}
function propertyDetail(propId){
const p=property(propId);if(!p)return;
const tasks=state.tasks.filter(t=>t.propertyId===p.id),docs=state.documents.filter(d=>d.propertyId===p.id),leases=state.leases.filter(l=>l.propertyId===p.id);
showModal(p.name,`<div class="detail-hero">${visual(p)}<div><span class="eyebrow">${esc(p.type)} PROPERTY</span><h3>${esc(p.name)}</h3><p>${esc(p.address)}<br/>${esc(p.city)}</p>${status(p.status)}</div></div><div class="detail-stats"><div class="detail-stat"><small>Estimated value</small><strong>${money(p.value)}</strong></div><div class="detail-stat"><small>Monthly rent</small><strong>${money(p.rent)}</strong></div><div class="detail-stat"><small>Gross yield</small><strong>${per(p.value?p.rent*12/p.value*100:0)}</strong></div></div><div class="section-header"><h2>Connected records</h2></div><div class="panel"><div class="list-row"><strong>Maintenance requests</strong><span>${tasks.length}</span></div><div class="list-row"><strong>Document records</strong><span>${docs.length}</span></div><div class="list-row"><strong>Tenancies</strong><span>${leases.length}</span></div></div><div class="modal-footer"><button class="btn btn-danger" data-action="delete-property" data-id="${p.id}">Delete property</button><button class="btn btn-primary" data-action="edit-property" data-id="${p.id}">Edit property →</button></div>`);
}
function updateCalc(){const read=(x)=>Number($("#calc-"+x)?.value)||0,price=read("price"),rent=read("rent"),costs=read("costs"),debt=read("debt"),year=rent*12,net=year-costs-debt;$("#cashflow").textContent=money(net);$("#gross-yield").textContent=per(price?year/price*100:0);$("#net-yield").textContent=per(price?(year-costs)/price*100:0);$("#monthly-flow").textContent=money(net/12)}
function globalSearch(){
const q=$("#global-search-input")?.value?.toLowerCase().trim()||"";
const matches=[
...state.properties.map(p=>({title:p.name,sub:p.city,view:"portfolio",id:p.id,type:"property"})),
...state.tasks.map(t=>({title:t.title,sub:pname(t.propertyId),view:"maintenance",type:"task"})),
...state.documents.map(d=>({title:d.name,sub:pname(d.propertyId),view:"documents",type:"document"})),
...state.leases.map(l=>({title:l.tenant,sub:pname(l.propertyId),view:"tenancies",type:"lease"}))
].filter(r=>(r.title+" "+r.sub).toLowerCase().includes(q)).slice(0,12);
$("#global-search-results").innerHTML=matches.map(r=>`<button class="search-result" data-action="jump" data-target="${r.view}" data-id="${esc(r.id||"")}" data-type="${r.type}"><span><strong>${esc(r.title)}</strong><br/><small>${esc(r.sub)}</small></span><small>${esc(r.view)} ↗</small></button>`).join("")||empty("No matches","Try searching for an address, document or task.")};
function exportData(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString(),note:"ATLAS demo records, not authenticated production data"},null,2)],{type:"application/json"});const a=document.createElement("a");const u=URL.createObjectURL(blob);a.href=u;a.download="atlas-property-os-demo.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);notify("Demo data exported as JSON")}
document.addEventListener("click",(ev)=>{
if(ev.target.matches("[data-overlay]")){closeModal();return}
const nav=ev.target.closest("[data-nav]");if(nav){navigate(nav.dataset.nav);return}
const button=ev.target.closest("[data-action]");if(!button)return;
const a=button.dataset.action,entityId=button.dataset.id;
if(a==="close-modal"){closeModal();return}
if(a==="toggle-menu"){$("#sidebar").classList.toggle("open");document.body.classList.toggle("menu-open");return}
if(a==="filter"){filter=button.dataset.value;render();return}
if(a==="view-property"){propertyDetail(entityId);return}
if(a==="toggle-task"){const t=state.tasks.find(t=>t.id===entityId);if(t){t.status=t.status==="Complete"?"Open":"Complete";persist();render();notify("Maintenance item updated")}return}
if(a==="delete-property"){if(!confirm("Delete this property and its linked demo records?"))return;state.properties=state.properties.filter(p=>p.id!==entityId);for(const c of ["tasks","leases","deals","documents","projects","expenses"])state[c]=state[c].filter(x=>x.propertyId!==entityId);persist();closeModal();navigate("portfolio");notify("Property and linked demo records deleted");return}
if(a==="reset"){if(confirm("Reset all locally saved demo changes?")){state=structuredClone(seed);persist();render();notify("Demo data reset")}return}
if(a==="export"){exportData();return}
if(a==="search"){showModal("Search your workspace",`<div class="field"><label>Properties, maintenance, tenancies, documents</label><input id="global-search-input" placeholder="Start typing…" autocomplete="off"/></div><div id="global-search-results" class="search-results"></div>`);globalSearch();return}
if(a==="jump"){closeModal();navigate(button.dataset.target);if(button.dataset.type==="property"&&entityId)propertyDetail(entityId);return}
if(a==="about"){showModal("Welcome to ATLAS",`<div class="note"><strong>Interactive portfolio prototype.</strong> Explore the modules, add and edit your own sample records, calculate yields and export the data. Changes are stored only in this browser.</div><p style="font-size:12px;line-height:1.8;color:#63746a;margin-top:17px">ATLAS brings portfolio management, sales pipelines, tenancies, maintenance, projects, financial scenarios and a research roadmap into a coherent workspace. External services such as OpenTakeoff, OpenContracts, Docling, Medusa or GIS are not integrated into this demo; it does not provide regulated legal, financial or engineering advice.</p><button class="btn btn-primary" data-action="close-modal">Explore workspace →</button>`);return}
const match=a.match(/^(add|edit)-(property|task|deal|lease|project|document|expense|note)$/);if(match){openForm(match[2],match[1]==="edit"?entityId:null);return}
});
document.addEventListener("input",(e)=>{
if(e.target.id==="portfolio-query"){query=e.target.value;const pos=e.target.selectionStart;render();const input=$("#portfolio-query");if(input){input.focus();input.setSelectionRange(pos,pos)}}
if(e.target.id==="global-search-input")globalSearch();
if(["calc-price","calc-rent","calc-costs","calc-debt"].includes(e.target.id))updateCalc();
});
document.addEventListener("change",(e)=>{const stage=e.target?.dataset?.stage;if(stage){const d=state.deals.find(x=>x.id===stage);if(d){d.stage=e.target.value;persist();render();notify("Opportunity moved")}}});
document.addEventListener("submit",(e)=>{
const form=e.target.closest("form[data-form]");if(!form)return;e.preventDefault();
const type=form.dataset.form,collections={property:"properties",task:"tasks",deal:"deals",lease:"leases",project:"projects",document:"documents",expense:"expenses",note:"notes"},collection=state[collections[type]];if(!collection)return;
const values=Object.fromEntries(new FormData(form).entries());
for(const k of ["value","rent","beds","sqft","amount","budget","spent","progress"]){if(k in values)values[k]=Number(values[k])||0}
if(type==="project")values.progress=Math.min(100,Math.max(0,values.progress));
if(type==="lease"&&values.end<values.start){notify("Lease end date must be after the start date");return}
const existing=collection.find(x=>x.id===form.dataset.id);
if(existing)Object.assign(existing,values);else collection.unshift({id:id(),...values,...(type==="note"?{date:day(0)}:{})});
persist();closeModal();render();notify(existing?"Record updated":"Record created");
});
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"&&modalOpen)closeModal();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector('[data-action="search"]')?.click()}});
render();
})();