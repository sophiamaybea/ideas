#!/usr/bin/env python3
from __future__ import annotations
import base64,hashlib,json,os,re,time
from collections import Counter
from datetime import datetime,timezone
from urllib.parse import urlencode
from urllib.request import Request,urlopen
from urllib.error import HTTPError

UA="EngineeringIntelligenceMoneySignals/1.0 (+https://github.com/sophiamaybea/ideas)"
TIMEOUT=20
REDDIT_QUERIES=['"AI automation agency"','"AI agency" client','n8n client automation','"AI receptionist" business','AI lead qualification agency']
GITHUB_QUERIES=['ai automation agency','ai lead generation agent','ai receptionist','n8n automation','sales automation agent','reddit lead generation ai']
HN_QUERIES=['AI automation agency','AI agents business','n8n automation','AI consultancy']
TOOLS=['n8n','zapier','make.com','retell','vapi','twilio','whisper','playwright','browser-use','openclaw','langgraph','crewai','supabase','airtable','hubspot','slack','gmail','sms','voice agent','webhook']
BUYERS=['car dealership','dealership','dentist','dental','hvac','plumber','roofer','real estate','solar','law firm','clinic','restaurant','ecommerce','e-commerce','saas','small business','smb','agency','insurance','accounting','recruiting']
WORKFLOWS={'lead follow-up':['lead follow','speed-to-lead','lead nurture','lead qualification','inbound lead'],'AI receptionist':['ai receptionist','receptionist','phone agent','voice agent','calling agent'],'customer support':['customer support','support bot','support automation'],'sales automation':['sales automation','crm','pipeline','appointment setting'],'content marketing':['content marketing','content automation'],'operations':['operations','ops automation','back office','admin automation'],'outreach':['cold email','outreach','prospecting','lead generation']}
HYPE_TERMS=['course','masterclass','blueprint','starter kit','gumroad','cohort','dm me','ebook','mentorship','academy','secret method','guaranteed']
MONEY_RE=re.compile(r'(?:(?:US)?[$£€]\s?\d[\d,]*(?:\.\d+)?(?:\s?[kKmM])?|\d[\d,]*(?:\.\d+)?\s?(?:USD|GBP|EUR)(?:\s?/[a-z]+)?)')
MONTHLY_RE=re.compile(r'(?:/\s?month|per month|monthly|mrr|retainer|/mo\b)',re.I)
FIRST_PERSON_RE=re.compile(r'\b(i|we|my|our|cofounder|client|clients|customer|customers)\b',re.I)
WEIGHTS={'proof':.24,'buyer':.14,'workflow':.14,'recurring':.11,'reproducibility':.12,'freshness':.10,'corroboration':.15}

def fetch_json(url,headers=None):
    h={'User-Agent':UA,'Accept':'application/json'}
    if headers:h.update(headers)
    with urlopen(Request(url,headers=h),timeout=TIMEOUT) as r:return json.loads(r.read().decode('utf-8','replace'))

def clean(s,n=320):
    s=re.sub(r'\s+',' ',s or '').strip()
    return s[:n]+('…' if len(s)>n else '')

def sid(source,url,title):return hashlib.sha1(f'{source}|{url}|{title}'.encode()).hexdigest()[:16]
def monies(text):
    out=[]
    for m in MONEY_RE.findall(text or ''):
        m=re.sub(r'\s+',' ',m.strip())
        if m and m not in out:out.append(m)
    return out[:6]
def detect_tools(text):
    lo=(text or '').lower();return [t for t in TOOLS if t in lo][:8]
def buyer(text):
    lo=(text or '').lower()
    return next((b for b in BUYERS if b in lo),'')
def workflow(text):
    lo=(text or '').lower()
    return next((label for label,needles in WORKFLOWS.items() if any(n in lo for n in needles)),'')
def hype(text):
    lo=(text or '').lower();return [x for x in HYPE_TERMS if x in lo][:6]
def fresh(iso):
    try:d=max(0,(datetime.now(timezone.utc)-datetime.fromisoformat((iso or '').replace('Z','+00:00'))).total_seconds()/86400)
    except:d=999
    return 1 if d<=2 else .9 if d<=7 else .75 if d<=30 else .55 if d<=90 else .3 if d<=365 else .1

def score(s):
    text=' '.join(str(s.get(k,'')) for k in ('title','summary','excerpt','businessModel'));money=bool(s.get('moneyMentions'));b=bool(s.get('buyer'));w=bool(s.get('workflow'));tools=bool(s.get('tools'));first=bool(FIRST_PERSON_RE.search(text));rec=bool(MONTHLY_RE.search(text))
    if s['source']=='github':proof,cor=.20,.45
    elif s['source']=='reddit':proof,cor=min(1,.30+.28*money+.18*b+.16*w+.12*first),(.50 if s.get('engagement',0)>=20 else .35)
    else:proof,cor=min(.65,.22+.20*money+.15*b+.14*w),.30
    vals={'proof':proof,'buyer':1 if b else (.35 if s['source']=='github' else .2),'workflow':.95 if w else (.75 if s['source']=='github' else .25),'recurring':1 if rec else (.35 if money else .1),'reproducibility':min(1,.25+.25*w+.35*tools+.15*bool(s.get('url'))),'freshness':fresh(s.get('publishedAt')),'corroboration':cor}
    raw=100*sum(WEIGHTS[k]*v for k,v in vals.items())-30*s.get('hypeRisk',0);s['score']=round(max(0,min(100,raw)),1)
    reasons=[]
    if money:reasons.append('explicit money figure')
    if b:reasons.append('specific buyer')
    if w:reasons.append('specific workflow')
    if rec:reasons.append('recurring economics')
    if tools:reasons.append('reproducible stack')
    if s['source']=='github':reasons.append('build signal, not revenue proof')
    if s.get('hypeRisk',0)>=.65:reasons.append('strong course/hype penalty')
    s['scoreReason']=', '.join(reasons) or 'weakly specified market signal'
    s['kind']='build_signal' if s['source']=='github' else 'revenue_proof' if money and first and s['score']>=70 else 'operator_revenue_claim' if money and first else 'operator_signal' if b and w else 'market_discussion'
    return s

def reddit(errors):
    out=[]
    for q in REDDIT_QUERIES:
        try:
            data=fetch_json('https://www.reddit.com/search.json?'+urlencode({'q':q,'sort':'new','t':'month','limit':35,'raw_json':1}))
            for child in data.get('data',{}).get('children',[]):
                p=child.get('data',{});title=p.get('title','');body=p.get('selftext','');text=f'{title} {body}'
                if not re.search(r'\b(ai|automation|agent|n8n)\b',text,re.I):continue
                flags=hype(text);mm=monies(text);u='https://www.reddit.com'+p.get('permalink','')
                out.append(score({'id':sid('reddit',u,title),'source':'reddit','sourceLabel':'Reddit / r/'+p.get('subreddit',''),'title':clean(title,180),'url':u,'publishedAt':datetime.fromtimestamp(p.get('created_utc',0),timezone.utc).isoformat(),'excerpt':clean(body,300),'summary':clean(body,220),'moneyMentions':mm,'businessModel':'Recurring service / implementation' if MONTHLY_RE.search(text) else ('Service / project' if mm else ''),'buyer':buyer(text),'workflow':workflow(text),'tools':detect_tools(text),'hypeFlags':flags,'hypeRisk':min(1,.18*len(flags)),'engagement':int(p.get('score',0) or 0)+int(p.get('num_comments',0) or 0)}))
        except Exception as e:errors.append({'source':'reddit','query':q,'error':type(e).__name__+': '+str(e)[:160]})
        time.sleep(.7)
    return out

def github(errors):
    out=[];tok=os.getenv('GITHUB_TOKEN','');headers={'Authorization':'Bearer '+tok,'X-GitHub-Api-Version':'2022-11-28'} if tok else {'X-GitHub-Api-Version':'2022-11-28'}
    for q in GITHUB_QUERIES:
        try:
            data=fetch_json('https://api.github.com/search/repositories?'+urlencode({'q':q+' archived:false','sort':'updated','order':'desc','per_page':30}),headers)
            for r in data.get('items',[]):
                text=f"{r.get('name','')} {r.get('description','') or ''} {' '.join(r.get('topics') or [])}"
                if not re.search(r'\b(ai|automation|agent|n8n|lead|sales)\b',text,re.I):continue
                u=r.get('html_url','');title=f"{r.get('full_name')} — {r.get('description') or 'Open-source build signal'}"
                out.append(score({'id':sid('github',u,title),'source':'github','sourceLabel':'GitHub','title':clean(title,190),'url':u,'publishedAt':r.get('pushed_at') or r.get('updated_at'),'excerpt':clean(r.get('description',''),260),'summary':f"Open-source capability; {r.get('stargazers_count',0)} stars, {r.get('forks_count',0)} forks. Treat as build/market infrastructure, not revenue proof.",'moneyMentions':[],'businessModel':'Build signal','buyer':buyer(text),'workflow':workflow(text),'tools':detect_tools(text),'hypeFlags':[],'hypeRisk':.05,'engagement':int(r.get('stargazers_count',0) or 0)}))
        except Exception as e:errors.append({'source':'github','query':q,'error':type(e).__name__+': '+str(e)[:160]})
        time.sleep(.35)
    return out

def hn(errors):
    out=[]
    for q in HN_QUERIES:
        try:
            data=fetch_json('https://hn.algolia.com/api/v1/search_by_date?'+urlencode({'query':q,'tags':'story','hitsPerPage':30}))
            for h in data.get('hits',[]):
                title=h.get('title') or '';text=f"{title} {h.get('story_text') or ''}"
                if not title:continue
                oid=h.get('objectID');u=h.get('url') or (f'https://news.ycombinator.com/item?id={oid}' if oid else '')
                flags=hype(text)
                out.append(score({'id':sid('hn',u,title),'source':'hn','sourceLabel':'Hacker News','title':clean(title,180),'url':u,'publishedAt':h.get('created_at'),'excerpt':clean(h.get('story_text') or '',280),'summary':clean(h.get('story_text') or title,220),'moneyMentions':monies(text),'businessModel':'','buyer':buyer(text),'workflow':workflow(text),'tools':detect_tools(text),'hypeFlags':flags,'hypeRisk':min(1,.15*len(flags)),'engagement':int(h.get('points') or 0)+int(h.get('num_comments') or 0)}))
        except Exception as e:errors.append({'source':'hn','query':q,'error':type(e).__name__+': '+str(e)[:160]})
    return out

def dedupe(items):
    by={}
    for s in items:
        k=re.sub(r'\W+',' ',s['title'].lower())[:120]
        if k not in by or (s['score'],s.get('engagement',0))>(by[k]['score'],by[k].get('engagement',0)):by[k]=s
    return list(by.values())
def patterns(items):
    c=Counter()
    for s in items:
        if s.get('workflow'):c[s['workflow']]+=1
        for t in s.get('tools') or []:c[t]+=1
        if s.get('buyer'):c[s['buyer']]+=1
    return [{'label':k,'count':v} for k,v in c.most_common(12) if v>=2]

def payload():
    errors=[];items=dedupe(reddit(errors)+github(errors)+hn(errors));items.sort(key=lambda s:(s['score'],s.get('engagement',0)),reverse=True);items=items[:180];counts=Counter(s['source'] for s in items)
    return {'meta':{'generatedAt':datetime.now(timezone.utc).isoformat(),'cadence':'hourly','sourceCounts':dict(counts),'highConfidence':sum(s['score']>=70 for s in items),'hypeFlagged':sum(s.get('hypeRisk',0)>=.65 for s in items),'weights':WEIGHTS,'errors':errors[:20],'method':'Evidence-adjusted ranking; GitHub is build evidence, not revenue proof.'},'patterns':patterns(items),'signals':items}

def publish(data):
    repo=os.getenv('GITHUB_REPOSITORY');tok=os.getenv('GITHUB_TOKEN');branch=os.getenv('TARGET_BRANCH','engineering-intelligence');path=os.getenv('TARGET_PATH','engineering-intelligence/dashboard/data/money-signals.json')
    if not repo or not tok:return False
    headers={'Authorization':'Bearer '+tok,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};api=f'https://api.github.com/repos/{repo}/contents/{path}';sha=None
    try:sha=fetch_json(api+'?'+urlencode({'ref':branch}),headers).get('sha')
    except HTTPError as e:
        if e.code!=404:raise
    body={'message':'Update hourly AI money signals','content':base64.b64encode(json.dumps(data,ensure_ascii=False,indent=2).encode()).decode(),'branch':branch}
    if sha:body['sha']=sha
    with urlopen(Request(api,data=json.dumps(body).encode(),headers=headers,method='PUT'),timeout=TIMEOUT) as r:r.read()
    return True

if __name__=='__main__':
    data=payload();local=os.getenv('LOCAL_OUTPUT','engineering-intelligence/dashboard/data/money-signals.json');os.makedirs(os.path.dirname(local),exist_ok=True);open(local,'w',encoding='utf-8').write(json.dumps(data,ensure_ascii=False,indent=2));print(json.dumps({'signals':len(data['signals']),'highConfidence':data['meta']['highConfidence'],'errors':len(data['meta']['errors']),'uploaded':publish(data)}))
