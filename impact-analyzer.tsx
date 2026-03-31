import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const C = { G:"#2d7a4f",T:"#3aafa9",GOLD:"#f4a261",LIGHT:"#e8f5ee",RED:"#e05a5a",
            PU:"#7c5cbf",BL:"#3a7abf",PK:"#c04a8a",OR:"#e07b39",TL:"#2a9d8f",GR:"#6a994e" };

const DOMAIN_META: Record<string,{label:string,color:string,desc:string}> = {
  selfConfidence:  { label:"Self-Confidence",          color:C.G,        desc:"Belief in ability to set goals, learn new things, and act with agency." },
  selfEsteem:      { label:"Self-Esteem",               color:C.TL,       desc:"Feeling good about oneself; self-worth and positive self-image." },
  perseverance:    { label:"Perseverance",              color:C.T,        desc:"Staying calm and regulated under stress; emotional persistence." },
  grit:            { label:"GRIT / Coping",             color:C.PU,       desc:"Resilience after setbacks; working through failure and hard problems." },
  direction:       { label:"Direction",                 color:C.GOLD,     desc:"Taking guidance, following instruction, channelling focus into learning." },
  patience:        { label:"Patience",                  color:C.OR,       desc:"Comfort with waiting; not rushing; tolerating the pace of learning." },
  safeRisk:        { label:"Safe Risk Taking",          color:C.BL,       desc:"Understanding and navigating risk thoughtfully and safely." },
  copingFailure:   { label:"Coping with Failure",       color:C.RED,      desc:"Ability to work through failure and use it as a learning experience." },
  commitment:      { label:"Commitment",                color:C.GR,       desc:"Following through on tasks and responsibilities." },
  communication:   { label:"Communication & Teamwork",  color:C.PK,       desc:"Expressing oneself clearly; being a team player." },
  trust:           { label:"Trust",                     color:"#8B6914",  desc:"Trustworthiness; relying on others and being relied upon." },
  connection:      { label:"Connection",                color:"#2196a0",  desc:"Connection to others and to the natural environment." },
  decisionMaking:  { label:"Decision Making",           color:"#7a4a2d",  desc:"Making sound, considered decisions independently." },
  leadership:      { label:"Leadership",                color:"#4a6741",  desc:"Leading others; developing leadership identity and skills." },
  learningSteps:   { label:"Learning in Small Steps",   color:C.BL,       desc:"Breaking challenges into manageable pieces; dealing with failure." },
  relationships:   { label:"Relationships",             color:C.BL,       desc:"Quality of peer and adult relationships; social connection in program." },
  accessibility:   { label:"Access & Equity",           color:C.RED,      desc:"Whether the program provided access that wouldn't otherwise exist." },
  satisfaction:    { label:"Participant Satisfaction",  color:C.GR,       desc:"Overall rating, qualitative impact and program satisfaction." },
  safety:          { label:"Safety",                    color:"#555",     desc:"Whether participants felt safe with peers and staff throughout." },
};

const PROGRAM_MAPS: Record<string,{preStatements:Record<string,string>,postStatements:Record<string,string>,isLIA?:boolean}> = {
  lts: {
    preStatements: {
      "work towards specific goals":"selfConfidence","confident in my ability to learn":"selfConfidence",
      "feel like I can do anything":"selfConfidence","can control my emotions":"perseverance",
      "like and accept myself":"grit","can take guidance and make my own":"direction",
      "when i focus, i can finish":"selfConfidence","focus, i can finish":"direction",
      "know how to follow instruction":"direction","set backs don't discourage":"grit",
      "not in a rush":"patience","remain calm":"perseverance","remain grounded":"perseverance",
      "think through solutions calmly":"perseverance","consider myself a patient":"patience",
      "work out a difficult problem":"grit",
    },
    postStatements: {
      "work toward specific goals":"selfConfidence","confident in my ability to learn":"selfConfidence",
      "feel like I can do anything":"selfConfidence","can control my emotions":"perseverance",
      "like and accept myself":"grit","can take guidance and make my own":"direction",
      "when i focus, i can finish":"selfConfidence","focus, i can finish":"direction",
      "know how to follow instruction":"direction","set backs don't discourage":"grit",
      "not in a rush":"patience","remain grounded":"perseverance",
      "think through solutions calmly":"perseverance","consider myself a patient":"patience",
      "manage a difficult problem":"grit",
    },
  },
  ltr: {
    preStatements: {
      "can follow through on something i start":"commitment","take instruction and apply":"direction",
      "generally feels good about":"selfEsteem","tell the difference between a safe risk":"safeRisk",
      "don't worry if something doesn't work out":"copingFailure","feel like i am a patient":"patience",
      "can take guidance and make my own":"direction","finish whatever i begin":"grit",
      "handle my feelings if things":"copingFailure","can handle my feelings":"copingFailure",
      "figure out if an activity is safe":"safeRisk","not in a rush to get things done":"patience",
      "doesn't go my way, i don't get discouraged":"grit","take my time to figure out":"patience",
      "know how to follow instruction":"direction","feel like i can do anything":"selfConfidence",
      "focus, i can finish":"selfConfidence","worked through failure":"copingFailure",
      "challenge myself while still":"safeRisk","work towards specific goals":"direction",
    },
    postStatements: {
      "can follow through on something i start":"commitment","take instruction and apply":"direction",
      "generally feels good about":"selfEsteem","tell the difference between a safe risk":"safeRisk",
      "don't worry if something doesn't work out":"copingFailure","feel like i am a patient":"patience",
      "can take guidance and make my own":"direction","finish whatever i begin":"grit",
      "handle my feelings if things":"copingFailure","can handle my feelings":"copingFailure",
      "figure out if an activity is safe":"safeRisk","not in a rush to get things done":"patience",
      "doesn't go my way, i don't get discouraged":"grit","take my time to figure out":"patience",
      "know how to follow instruction":"direction","feel like i can do anything":"selfConfidence",
      "focus, i can finish":"selfConfidence","worked through failure":"copingFailure",
      "challenge myself while still":"safeRisk",
    },
  },
  gag: {
    preStatements: {
      "take instruction and apply":"direction","generally feels good about":"selfEsteem",
      "confident that i know what a safe":"safeRisk","don't worry if something doesn't":"copingFailure",
      "feel like i am a patient":"patience","can take guidance and make my own":"direction",
      "finish whatever i begin":"grit","manage my feelings if things":"copingFailure",
      "understand what it means to balance":"safeRisk","not in a rush to get things done":"patience",
      "doesn't go my way, i don't get discouraged":"grit","take my time to figure out":"patience",
      "know how to follow instruction":"direction","feel like i can do anything":"selfConfidence",
      "focus, i can finish":"selfConfidence","when i focus, i can finish":"selfConfidence",
      "worked through failure":"copingFailure","challenge myself while still":"safeRisk",
      "work towards specific goals":"direction","break it down into smaller":"learningSteps",
      "new situations overwhelm":"learningSteps","confident in my ability to learn":"selfConfidence",
    },
    postStatements: {
      "can express themselves clearly":"communication","strong leader":"communication",
      "can learn new skills easily":"selfConfidence","generally feels good about":"selfEsteem",
      "someone others can trust":"trust","doesn't go my way, i don't get discouraged":"grit",
      "get other people to understand":"communication","consider myself to be a team player":"communication",
      "people in my life that i can turn":"trust","communicate well with people":"communication",
      "would consider myself to be a trustworthy":"trust","feel like i can do anything":"selfConfidence",
      "break it down into smaller":"learningSteps","manage my feelings if things":"copingFailure",
      "new situations overwhelm":"learningSteps","confident in my ability to learn":"selfConfidence",
      "work toward specific goals":"selfConfidence",
    },
  },
  tah: {
    preStatements: {
      "take instruction and apply":"direction","generally feels good about":"selfEsteem",
      "knows how make important decisions":"decisionMaking","can build relationships with others":"connection",
      "feel capable of achieving":"selfEsteem","know how to follow instruction":"direction",
      "feel like i can do anything":"selfEsteem","know what to do in order to meet":"direction",
      "like and accept myself":"selfEsteem","manage my feelings if things":"grit",
      "can take guidance and make my own":"decisionMaking","work towards specific goals":"selfEsteem",
      "trust myself when making decisions":"decisionMaking","focus myself, i know i can succeed":"direction",
      "doesn't go my way, i don't get discouraged":"grit","connected to my surroundings":"connection",
      "feel connected to my surroundings":"connection",
    },
    postStatements: {
      "take instruction and apply":"direction","generally feels good about":"selfEsteem",
      "knows how make important decisions":"decisionMaking","can build relationships with others":"connection",
      "feel capable of achieving":"selfEsteem","know how to follow instruction":"direction",
      "feel like i can do anything":"selfEsteem","know what to do in order to meet":"direction",
      "like and accept myself":"selfEsteem","manage my feelings if things":"grit",
      "can take guidance and make my own":"decisionMaking","work towards specific goals":"selfEsteem",
      "work toward specific goals":"selfEsteem","trust myself when making decisions":"decisionMaking",
      "focus myself, i know i can succeed":"direction","doesn't go my way, i don't get discouraged":"grit",
      "connected to my surroundings":"connection","feel connected to my surroundings":"connection",
    },
  },
  rtr: { preStatements:{}, postStatements:{} },
  lia: {
    isLIA: true,
    preStatements: {
      // Q2 — Self-perception (1–7 emoji sliders)
      "feel good about myself":"selfEsteem",
      "feel like i can do anything i set my mind to":"selfConfidence",
      "like and accept myself":"selfEsteem",
      "stay calm in stressful situations":"perseverance",
      // Q26 — "Do the following describe you?" (text responses: Very much like me, etc.)
      "can follow through on something i start":"commitment",
      "take instruction and apply it":"direction",
      "generally feels good about themselves":"selfEsteem",
      "confident that i know what a safe risk":"safeRisk",
      "feel capable of achieving":"selfConfidence",
      "feel like i am a strong leader":"leadership",
      // Q27 — Resilience (1–7)
      "can control my feelings":"perseverance",
      "setbacks don't discourage":"grit",
      "finish whatever i begin":"commitment",
      "overcome setbacks to complete":"grit",
      // Q28 — Goals & leadership (1–7)
      "can make goals for my own performance":"direction",
      "work towards goals":"direction",
      "confident in my ability to learn":"selfConfidence",
      "as a leader, i motivate":"leadership",
      "communicate well with people":"communication",
      // Q29 — Guidance & leadership (1–7)
      "can take guidance and make my own":"decisionMaking",
      "when i apply myself":"selfConfidence",
      "know how to follow instruction":"direction",
      "leadership comes naturally":"leadership",
      // Q30 — Risk & leadership (1–7)
      "know what a safe risk":"safeRisk",
      "challenge myself while still":"safeRisk",
      "balance risk and reward":"safeRisk",
      "convince others to follow my lead":"leadership",
    },
    postStatements: {
      // Mid-way survey has identical questions to pre-survey
      "feel good about myself":"selfEsteem",
      "feel like i can do anything i set my mind to":"selfConfidence",
      "like and accept myself":"selfEsteem",
      "stay calm in stressful situations":"perseverance",
      "can follow through on something i start":"commitment",
      "take instruction and apply it":"direction",
      "generally feels good about themselves":"selfEsteem",
      "confident that i know what a safe risk":"safeRisk",
      "feel capable of achieving":"selfConfidence",
      "feel like i am a strong leader":"leadership",
      "can control my feelings":"perseverance",
      "setbacks don't discourage":"grit",
      "finish whatever i begin":"commitment",
      "overcome setbacks to complete":"grit",
      "can make goals for my own performance":"direction",
      "work towards goals":"direction",
      "confident in my ability to learn":"selfConfidence",
      "as a leader, i motivate":"leadership",
      "communicate well with people":"communication",
      "can take guidance and make my own":"decisionMaking",
      "when i apply myself":"selfConfidence",
      "know how to follow instruction":"direction",
      "leadership comes naturally":"leadership",
      "know what a safe risk":"safeRisk",
      "challenge myself while still":"safeRisk",
      "balance risk and reward":"safeRisk",
      "convince others to follow my lead":"leadership",
    },
  },
};
PROGRAM_MAPS.rtr.preStatements  = PROGRAM_MAPS.lts.preStatements;
PROGRAM_MAPS.rtr.postStatements = PROGRAM_MAPS.lts.postStatements;

const PROGRAMS: Record<string,{label:string,activity:string,preId:string,postId:string}> = {
  lts: { label:"Learn to Shred",    activity:"snowboarding",   preId:"220186403793254", postId:"220237527792257" },
  ltr: { label:"Live to Ride",      activity:"mountain biking",preId:"221086211581246", postId:"221086044855254" },
  gag: { label:"Get a Grip",        activity:"rock climbing",  preId:"221085730522246", postId:"221086031429247" },
  tah: { label:"Take a Hike",       activity:"hiking",         preId:"220945019792259", postId:"221235397521251" },
  rtr: { label:"Ready to Roll",     activity:"skateboarding",  preId:"242606915644258", postId:"242906743772262" },
  lia: { label:"Leaders in Action", activity:"multi-activity", preId:"222565881985270", postId:"213336384814255" },
};

const FETCH_TIMEOUT_MS = 30000;

// ── HELPERS ──────────────────────────────────────────────────────────
const avg = (arr: number[]) => { const f=arr.filter(v=>v!=null&&!isNaN(v)&&Number(v)>0); return f.length?+(f.reduce((a,b)=>a+Number(b),0)/f.length).toFixed(2):null; };
const pct = (n:number,t:number) => t?Math.round(n/t*100):0;
const fmt = (v:any) => v!=null?Number(v).toFixed(2):null;
const fmtR = (v:any) => v!=null?Number(v).toFixed(1):null;
const pctGain = (pre:any, post:any) => (pre!=null&&pre>0&&post!=null) ? Math.round(((post-pre)/pre)*100) : null;
const relMap: Record<string,number> = {"We are acquaintances":1,"We are friendly":2,"We are close":3,"We are very close":4,"We are very close, like best friends":4};
const relScore = (v:string) => relMap[v]||0;
const relLabel = (v:number) => v>=3.5?"Very close":v>=2.5?"Close":v>=1.5?"Friendly":"Acquaintances";

const textScoreMap: Record<string,number> = {
  "very much like me":7, "mostly like me":6, "like me":5, "somewhat like me":4,
  "a little like me":3, "not really like me":2, "not like me at all":1, "not at all like me":1,
};
function textToScore(val: string): number {
  const lc = String(val).toLowerCase().replace(/[\[\]"\\]/g,"").trim();
  for (const [text, score] of Object.entries(textScoreMap))
    if (lc.includes(text)) return score;
  return NaN;
}

function matchDomain(rowLabel: string, stmtMap: Record<string,string>) {
  const lc = rowLabel.toLowerCase();
  for (const [fragment, domain] of Object.entries(stmtMap))
    if (lc.includes(fragment.toLowerCase())) return domain;
  return null;
}

function extractDomains(answers: Record<string,any>, stmtMap: Record<string,string>) {
  const buckets: Record<string,number[]> = {};
  for (const [,qval] of Object.entries(answers||{})) {
    const ans = qval?.answer;
    if (!ans || typeof ans !== "object" || Array.isArray(ans)) continue;
    for (const [rowLabel, score] of Object.entries(ans)) {
      const domain = matchDomain(rowLabel, stmtMap);
      let num = parseFloat(score as string);
      if (isNaN(num)) num = textToScore(score as string);
      if (domain && !isNaN(num) && num > 0) {
        if (!buckets[domain]) buckets[domain] = [];
        buckets[domain].push(num);
      }
    }
  }
  return Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k, avg(v)]));
}

function extractRelationships(answers: Record<string,any>) {
  for (const [,qval] of Object.entries(answers||{})) {
    const ans = qval?.answer;
    if (!ans || typeof ans !== "object" || Array.isArray(ans)) continue;
    const keys = Object.keys(ans).map((k:string)=>k.toLowerCase());
    if (keys.some(k=>k.includes("peer")||k.includes("friends")||k.includes("kids your age"))) {
      const peer  = Object.entries(ans).find(([k])=>k.toLowerCase().includes("peer")||k.toLowerCase().includes("kids your age")||k.toLowerCase().includes("friends"));
      const adult = Object.entries(ans).find(([k])=>k.toLowerCase().includes("adult"));
      return { relPeer: relScore(peer?.[1] as string||""), relAdult: relScore(adult?.[1] as string||"") };
    }
  }
  return { relPeer:0, relAdult:0 };
}

function getYear(sub: any) {
  const candidates = [sub.subtitle, sub.created_at, sub.date, sub.submit_date, sub.submitDate];
  for (const raw of candidates) {
    if (!raw) continue;
    const m = String(raw).match(/(\d{4})/);
    if (m) return m[1];
  }
  return "Unknown";
}

function normaliseSubmission(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.submission_answers && typeof raw.submission_answers === "object") return raw;
  if (raw.answers && typeof raw.answers === "object") {
    const submission_answers: Record<string,any> = {};
    for (const [qid, qdata] of Object.entries(raw.answers as Record<string,any>)) {
      if (!qdata || typeof qdata !== "object") continue;
      const answer = (qdata as any).answer ?? (qdata as any).prettyFormat ?? (qdata as any).text ?? "";
      const name   = (qdata as any).text || (qdata as any).name || String(qid);
      submission_answers[qid] = { answer, name };
    }
    return { subtitle: raw.created_at || raw.submit_date || raw.id || "", submission_answers };
  }
  const vals = Object.values(raw);
  if (vals.every(v => typeof v !== "object" || v === null)) {
    const submission_answers: Record<string,any> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k.toLowerCase() === "submit date" || k.toLowerCase() === "date") continue;
      submission_answers[k] = { answer: v, name: k };
    }
    return { subtitle: raw["Submit Date"] || raw["Date"] || raw.created_at || "", submission_answers };
  }
  return null;
}

function aggregateYear(preSubs: any[], postSubs: any[], year: string, progKey: string) {
  const stmtMap = PROGRAM_MAPS[progKey] || PROGRAM_MAPS.lts;
  const pre = preSubs.map(s => {
    const a = s.submission_answers||{};
    const domains = extractDomains(a, stmtMap.preStatements);
    const rel = extractRelationships(a);
    const allAns = Object.values(a).map((v:any)=>Array.isArray(v?.answer)?v.answer[0]:v?.answer||"");
    const wouldWithout = allAns.some((v:any)=>typeof v==="string"&&v.toLowerCase().includes("no, i don't think"))?1:allAns.some((v:any)=>typeof v==="string"&&v.toLowerCase().includes("not sure"))?0.5:0;
    const hadBefore = allAns.some((v:any)=>typeof v==="string"&&v==="Yes")?1:0;
    return { ...domains, ...rel, wouldWithout, hadBefore };
  });
  const post = postSubs.map(s => {
    const a = s.submission_answers||{};
    const domains = extractDomains(a, stmtMap.postStatements);
    const rel = extractRelationships(a);
    const allAns = Object.values(a).flatMap((v:any)=>Array.isArray(v?.answer)?v.answer:[v?.answer||""]);
    const madeFriend = allAns.some((v:any)=>typeof v==="string"&&(v.toLowerCase().includes("made a new friend")||v.toLowerCase().includes("i made a new friend")));
    let belonging = 0;
    for (const [,qval] of Object.entries(a)) {
      const ans = (qval as any)?.answer;
      if (ans && typeof ans==="object"&&!Array.isArray(ans)) {
        const row = Object.entries(ans).find(([k])=>k.toLowerCase().includes("part of the group"));
        if (row) { belonging = parseFloat(row[1] as string)||0; break; }
      }
    }
    let overallRating = 0;
    for (const [,qval] of Object.entries(a)) {
      const v = parseFloat((qval as any)?.answer);
      if (!isNaN(v)&&v>=1&&v<=10&&typeof (qval as any)?.answer==="string") { overallRating=v; break; }
    }
    const safetyAns = Object.values(a).map((v:any)=>typeof v?.answer==="string"?v.answer:"").filter(Boolean);
    const feltUnsafe   = safetyAns.some((v:any)=>v.toLowerCase().startsWith("no"))?0:1;
    const leaderUnsafe = safetyAns.filter((v:any)=>v.toLowerCase().startsWith("no")).length>=2?0:1;
    let quote="", quoteConsent=false;
    for (const [,qval] of Object.entries(a)) {
      if (typeof (qval as any)?.answer==="string"&&(qval as any).answer.length>40&&!(qval as any).answer.match(/^\d/)) { quote=(qval as any).answer; break; }
    }
    for (const [,qval] of Object.entries(a)) {
      if (typeof (qval as any)?.answer==="string"&&(qval as any).answer.toUpperCase()==="YES") { quoteConsent=true; break; }
    }
    return { ...domains, ...rel, madeFriend, belonging, overallRating, feltUnsafe, leaderUnsafe, quote, quoteConsent };
  });
  const allDomains = new Set([
    ...pre.flatMap(r=>Object.keys(r).filter(k=>DOMAIN_META[k])),
    ...post.flatMap(r=>Object.keys(r).filter(k=>DOMAIN_META[k])),
  ]);
  const domainScores: Record<string,any> = {};
  allDomains.forEach(k=>{
    domainScores[k] = {
      pre:  avg(pre.map(r=>r[k]).filter(v=>v!=null)),
      post: avg(post.map(r=>r[k]).filter(v=>v!=null)),
    };
  });
  return {
    year, nPre:preSubs.length, nPost:postSubs.length, domainScores,
    preRelPeer:    avg(pre.map(r=>r.relPeer).filter(Boolean)),
    postRelPeer:   avg(post.map(r=>r.relPeer).filter(Boolean)),
    preRelAdult:   avg(pre.map(r=>r.relAdult).filter(Boolean)),
    postRelAdult:  avg(post.map(r=>r.relAdult).filter(Boolean)),
    madeFriendPct:   pct(post.filter(r=>r.madeFriend).length, post.length),
    avgBelonging:    avg(post.map(r=>r.belonging).filter(Boolean)),
    accessNoPct:     pct(pre.filter(r=>r.wouldWithout===1).length, pre.length),
    accessUnsurePct: pct(pre.filter(r=>r.wouldWithout===0.5).length, pre.length),
    newToProgramPct: pct(pre.filter(r=>r.hadBefore===0).length, pre.length),
    avgRating:       avg(post.map(r=>r.overallRating).filter(Boolean)),
    highRatingPct:   pct(post.filter(r=>r.overallRating>=8).length, post.length),
    feltSafePct:     pct(post.filter(r=>r.feltUnsafe===0).length, post.length),
    leaderSafePct:   pct(post.filter(r=>r.leaderUnsafe===0).length, post.length),
    quotes: post.filter(r=>r.quoteConsent&&r.quote&&r.quote.length>30).map(r=>r.quote),
  };
}

function makeDemo(progKey: string, years=[2022,2023,2024,2025]) {
  const domainSets: Record<string,string[]> = {
    lts:["selfConfidence","perseverance","grit","direction","patience"],
    ltr:["selfConfidence","selfEsteem","grit","direction","patience","safeRisk","copingFailure","commitment"],
    gag:["selfConfidence","selfEsteem","grit","direction","safeRisk","copingFailure","communication","trust","learningSteps"],
    tah:["selfEsteem","grit","direction","connection","decisionMaking"],
    rtr:["selfConfidence","perseverance","grit","direction","patience"],
    lia:["selfConfidence","selfEsteem","perseverance","grit","direction","commitment","communication","decisionMaking","safeRisk","leadership"],
  };
  const ds2 = domainSets[progKey]||["selfConfidence","grit","direction"];
  return years.map((yr,i)=>{
    const t=i*0.05; const ds: Record<string,any>={};
    ds2.forEach(k=>{ ds[k]={pre:+(5.3+t).toFixed(2),post:+(5.9+t).toFixed(2)}; });
    return {
      year:String(yr), nPre:20+i*5, nPost:15+i*4, domainScores:ds,
      preRelPeer:2.1, postRelPeer:2.8+t, preRelAdult:2.2, postRelAdult:2.9+t,
      madeFriendPct:63+i*3, avgBelonging:6.2+t, accessNoPct:52-i,
      accessUnsurePct:22, newToProgramPct:65,
      avgRating:9.1+t, highRatingPct:88+i*2,
      feltSafePct:95, leaderSafePct:97,
      quotes:["This program gave me confidence I didn't know I had.",
              "I finally feel like I belong somewhere.",
              "I learned that setbacks are just part of learning."],
    };
  });
}
const DEMO = Object.fromEntries(Object.keys(PROGRAMS).map(k=>[k,makeDemo(k)]));

// ── TIMEOUT WRAPPER ───────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms/1000}s — ${label}`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// ── JOTFORM FETCH ─────────────────────────────────────────────────────
async function fetchFormSubmissions(
  formId: string,
  onProgress?: (msg: string) => void,
  cancelRef?: React.MutableRefObject<boolean>
): Promise<any[]> {
  if (cancelRef?.current) throw new Error("Cancelled");
  onProgress?.(`  Fetching form ${formId}…`);

  const fetchPromise = fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      mcp_servers: [{ type:"url", url:"https://mcp.jotform.com/mcp-app", name:"jotform" }],
      messages: [{
        role: "user",
        content:
          `Use the Jotform MCP tool to retrieve ALL submissions for form ID "${formId}". ` +
          `Output ONLY a JSON array (no markdown, no prose, no code fences). ` +
          `Each element: { "subtitle": "<submit date>", "submission_answers": { "<qid>": { "answer": <value> } } }. ` +
          `For matrix/grid questions, answer must be an object mapping row labels to numeric scores. ` +
          `Start with [ and end with ]. Nothing else.`
      }]
    })
  });

  let resp: Response;
  try {
    resp = await withTimeout(fetchPromise, FETCH_TIMEOUT_MS, `form ${formId}`);
  } catch(e: any) {
    onProgress?.(`  ⚠ ${e.message}`);
    return [];
  }

  if (cancelRef?.current) throw new Error("Cancelled");
  if (!resp.ok) { onProgress?.(`  ⚠ HTTP ${resp.status}`); return []; }

  const data = await resp.json();
  const blocks: any[] = data.content || [];

  const toolResultTexts = blocks
    .filter(b => b.type === "mcp_tool_result")
    .flatMap(b => Array.isArray(b.content) ? b.content.map((c:any)=>c.text||"") : [b.content?.[0]?.text||""]);
  const textBlockTexts = blocks.filter(b => b.type === "text").map(b => b.text || "");
  const allTexts = [...toolResultTexts, ...textBlockTexts];
  const combined = allTexts.join("\n");

  // Attempt 1: JSON array anywhere in combined text
  const arrMatch = combined.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrMatch) {
    try {
      const parsed = JSON.parse(arrMatch[0]);
      if (Array.isArray(parsed)) {
        const n = parsed.map(normaliseSubmission).filter(Boolean);
        onProgress?.(`  ✓ ${n.length} submissions`);
        return n;
      }
    } catch {}
  }

  // Attempt 2: per-block
  for (const t of allTexts) {
    const m = t.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        if (Array.isArray(parsed)) {
          const n = parsed.map(normaliseSubmission).filter(Boolean);
          onProgress?.(`  ✓ ${n.length} submissions (block fallback)`);
          return n;
        }
      } catch {}
    }
  }

  // Attempt 3: native Jotform shape
  for (const t of toolResultTexts) {
    try {
      const raw = JSON.parse(t.replace(/```json|```/g,"").trim());
      const candidates = [raw?.submissions, raw?.content, raw?.data, Array.isArray(raw)?raw:null].filter(Array.isArray);
      for (const arr of candidates) {
        const n = (arr as any[]).map(normaliseSubmission).filter(Boolean);
        if (n.length) { onProgress?.(`  ✓ ${n.length} submissions (native shape)`); return n; }
      }
    } catch {}
  }

  onProgress?.(`  ⚠ No parseable submissions found`);
  return [];
}

// ── UI COMPONENTS ────────────────────────────────────────────────────
const Btn = ({label,active,onClick,color}:any) => (
  <button onClick={onClick} style={{padding:"6px 13px",borderRadius:20,border:"none",cursor:"pointer",
    fontSize:12,fontWeight:600,background:active?(color||C.G):"#f0f0f0",color:active?"#fff":"#555",whiteSpace:"nowrap"}}>
    {label}
  </button>
);
const Card = ({label,value,sub,accent}:any) => (
  <div style={{background:C.LIGHT,borderRadius:12,padding:"13px 15px",flex:1,minWidth:110,borderTop:`3px solid ${accent||C.G}`}}>
    <div style={{fontSize:24,fontWeight:800,color:accent||C.G}}>{value??"—"}</div>
    <div style={{fontSize:12,fontWeight:600,color:"#333",marginTop:2}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:"#777",marginTop:2}}>{sub}</div>}
  </div>
);
const Sec = ({title,children}:any) => (
  <div style={{marginBottom:24}}>
    <div style={{fontSize:14,fontWeight:700,color:C.G,borderBottom:`2px solid ${C.G}`,paddingBottom:4,marginBottom:12}}>{title}</div>
    {children}
  </div>
);

// ── MAIN APP ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]   = useState("home");
  const [program, setProgram] = useState("lts");
  const [allData, setAllData] = useState<Record<string,any[]>>({});
  const [selYear, setSelYear] = useState<string|null>(null);
  const [tab, setTab]         = useState("📊 Overview");
  const [loadMsg, setLoadMsg] = useState("");
  const [loadLog, setLoadLog] = useState<string[]>([]);
  const [fetchResult, setFetchResult] = useState<{result:Record<string,any[]>}|null>(null);
  const [csvStep, setCsvStep] = useState(1);
  const [preRows, setPreRows] = useState<any[]>([]);
  const [isDemo, setIsDemo]   = useState(false);
  const cancelRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const progData = allData[program]||[];
  const yr       = progData.find(y=>y.year===selYear)||progData[progData.length-1]||{};
  const allYears = progData.map(y=>y.year);

  function setResults(data: Record<string,any[]>, demo=false) {
    setAllData(data); setIsDemo(demo);
    const keys = Object.keys(data);
    if (!keys.length) { loadDemo(); return; }
    const first = keys[0]; setProgram(first);
    const ys = (data[first]||[]).map(y=>y.year);
    setSelYear(ys[ys.length-1]||null);
    setScreen("results"); setTab("📊 Overview");
  }
  function loadDemo() { cancelRef.current=true; setResults(DEMO, true); }

  function appendLog(msg: string) {
    setLoadLog(prev => {
      const next = [...prev, msg];
      setTimeout(() => logEndRef.current?.scrollIntoView({behavior:"smooth"}), 50);
      return next;
    });
  }

  async function fetchLive() {
    cancelRef.current = false;
    setScreen("loading");
    setLoadLog([]);
    const result: Record<string,any[]> = {};

    for (const [key, prog] of Object.entries(PROGRAMS)) {
      if (cancelRef.current) break;
      setLoadMsg(`${prog.label} (${Object.keys(result).length + 1} of ${Object.keys(PROGRAMS).length})`);
      appendLog(`── ${prog.label} ──`);
      try {
        const pre  = await fetchFormSubmissions(prog.preId,  appendLog, cancelRef);
        if (cancelRef.current) break;
        const post = await fetchFormSubmissions(prog.postId, appendLog, cancelRef);
        if (cancelRef.current) break;
        if (!pre.length && !post.length) { appendLog(`  skipped — no data`); continue; }
        const ym: Record<string,{pre:any[],post:any[]}> = {};
        [...pre.map(s=>({s,type:"pre"})), ...post.map(s=>({s,type:"post"}))].forEach(({s,type})=>{
          const y = getYear(s);
          if (!ym[y]) ym[y] = {pre:[],post:[]};
          ym[y][type as "pre"|"post"].push(s);
        });
        result[key] = Object.entries(ym).sort(([a],[b])=>a.localeCompare(b))
          .map(([yr,{pre:p,post:po}]) => aggregateYear(p, po, yr, key));
        appendLog(`  ✓ years: ${Object.keys(ym).join(", ")}`);
      } catch(e: any) {
        if (e.message === "Cancelled") break;
        appendLog(`  ✗ ${e.message}`);
      }
    }

    appendLog("── Complete ──");
    setFetchResult({ result });
    setScreen("fetchSummary");
  }

  function handleCSV(e: any, type: "pre"|"post") {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: any) => {
      const lines = ev.target.result.trim().split("\n");
      const headers = lines[0].split(",").map((h:string)=>h.replace(/"/g,"").trim());
      const subs = lines.slice(1).map((line:string) => {
        const vals = line.split(",").map((v:string)=>v.replace(/"/g,"").trim());
        const obj: Record<string,string> = {}; headers.forEach((h:string,i:number)=>obj[h]=vals[i]||"");
        return { subtitle: obj["Submit Date"]||obj["Date"]||"2024-01-01", submission_answers: obj };
      });
      if (type==="pre") { setPreRows(subs); setCsvStep(2); }
      else {
        const ym: Record<string,{pre:any[],post:any[]}> = {};
        preRows.forEach(s=>{const y=getYear(s);if(!ym[y])ym[y]={pre:[],post:[]};ym[y].pre.push(s);});
        subs.forEach(s=>{const y=getYear(s);if(!ym[y])ym[y]={pre:[],post:[]};ym[y].post.push(s);});
        const agg = Object.entries(ym).sort(([a],[b])=>a.localeCompare(b))
          .map(([yr,{pre,post}])=>aggregateYear(pre,post,yr,program));
        setResults({[program]:agg});
      }
    };
    reader.readAsText(file);
  }

  const activeDomains = Object.keys(yr.domainScores||{})
    .filter(k=>yr.domainScores[k]?.pre!=null||yr.domainScores[k]?.post!=null)
    .filter(k=>!["relationships","accessibility","satisfaction","safety"].includes(k));

  const domainBarData = activeDomains.map(k=>({
    name: DOMAIN_META[k]?.label||k,
    Pre:  fmt(yr.domainScores?.[k]?.pre),
    Post: fmt(yr.domainScores?.[k]?.post),
  }));

  // ── SCREENS ──────────────────────────────────────────────────────
  if (screen==="home") return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:700,margin:"0 auto",padding:28}}>
      <div style={{background:`linear-gradient(135deg,${C.G},${C.T})`,borderRadius:16,padding:"24px 28px",color:"#fff",marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:800}}>📊 Program Impact Analyzer</div>
        <div style={{fontSize:13,opacity:.85,marginTop:4}}>Elevation Outdoors · All programs · Outcome-mapped pre/post analysis</div>
      </div>
      <div style={{fontSize:14,color:"#444",marginBottom:18}}>How would you like to load data?</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:24}}>
        {[
          {icon:"🔗",title:"Connect to Jotform",desc:"Pull all 6 programs live. Auto-groups by year, maps questions to outcome domains.",action:fetchLive,color:C.G},
          {icon:"📁",title:"Upload CSV",desc:"Export pre & post CSVs from Jotform for any single program.",action:()=>{setScreen("csv");setCsvStep(1);},color:C.T},
          {icon:"🎯",title:"View Demo",desc:"Explore with realistic sample data across all 6 programs and 4 years.",action:loadDemo,color:C.GOLD},
        ].map(o=>(
          <div key={o.title} onClick={o.action}
            style={{flex:1,minWidth:180,border:`2px solid ${o.color}`,borderRadius:14,padding:"18px 16px",cursor:"pointer",background:"#fff"}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=C.LIGHT}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="#fff"}>
            <div style={{fontSize:26}}>{o.icon}</div>
            <div style={{fontWeight:700,fontSize:14,marginTop:8,color:o.color}}>{o.title}</div>
            <div style={{fontSize:12,color:"#666",marginTop:4}}>{o.desc}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.LIGHT,borderRadius:10,padding:14,fontSize:12,color:"#444"}}>
        <strong>Domains tracked per program:</strong>
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
          {Object.entries(PROGRAMS).map(([k,p])=>{
            const unique=[...new Set(Object.values(PROGRAM_MAPS[k]?.preStatements||{}))].map(d=>DOMAIN_META[d]?.label||d).join(" · ");
            return <div key={k}><strong style={{color:C.G}}>{p.label}:</strong> {unique}</div>;
          })}
        </div>
      </div>
    </div>
  );

  if (screen==="fetchSummary") {
    const result = fetchResult?.result || {};
    const hasData = Object.keys(result).length > 0;
    return (
      <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:620,margin:"0 auto",padding:28}}>
        <div style={{background:hasData?`linear-gradient(135deg,${C.G},${C.T})`:`linear-gradient(135deg,${C.RED},#c04a4a)`,
          borderRadius:14,padding:"18px 22px",color:"#fff",marginBottom:18}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>
            {hasData ? "✅ Fetch Complete" : "⚠️ No Data Retrieved"}
          </div>
          <div style={{fontSize:13,opacity:.9}}>
            {hasData
              ? `Data loaded for: ${Object.keys(result).map(k=>PROGRAMS[k]?.label).join(", ")}`
              : "No submissions were returned from Jotform. See the full log below."}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {Object.entries(PROGRAMS).map(([k,p])=>{
            const d = result[k];
            const total = d ? d.reduce((s:number,y:any)=>s+y.nPre+y.nPost,0) : 0;
            return (
              <div key={k} style={{flex:1,minWidth:120,borderRadius:10,padding:"10px 12px",
                background: d ? C.LIGHT : "#fff0f0", border:`2px solid ${d ? C.G : C.RED}`}}>
                <div style={{fontSize:12,fontWeight:700,color: d ? C.G : C.RED}}>{p.label}</div>
                <div style={{fontSize:11,color:"#666",marginTop:3}}>
                  {d ? `${total} responses across ${d.length} year(s)` : "No data"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:12,fontWeight:600,color:"#555",marginBottom:6}}>Full fetch log — copy this if something went wrong:</div>
        <div style={{background:"#1e1e1e",borderRadius:10,padding:14,maxHeight:320,overflowY:"auto",
          fontSize:11,fontFamily:"monospace",lineHeight:1.8,color:"#ccc",marginBottom:16}}>
          {loadLog.map((l,i)=>(
            <div key={i} style={{
              color: l.startsWith("──")?"#7dd3a8": l.startsWith("  ✓")?"#86efac": l.startsWith("  ⚠")||l.startsWith("  ✗")?"#fca5a5":"#ccc"
            }}>{l}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          {hasData && (
            <button onClick={()=>setResults(result)} style={{flex:2,padding:"11px 0",borderRadius:10,
              border:"none",background:C.G,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              ▶ View Results
            </button>
          )}
          <button onClick={loadDemo} style={{flex:1,padding:"11px 0",borderRadius:10,
            border:`2px solid ${C.GOLD}`,background:"#fff",color:C.GOLD,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            🎯 Load Demo Instead
          </button>
          <button onClick={()=>setScreen("home")} style={{flex:1,padding:"11px 0",borderRadius:10,
            border:`2px solid #ccc`,background:"#fff",color:"#666",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            ← Try Again
          </button>
        </div>
      </div>
    );
  }

  if (screen==="loading") return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:580,margin:"0 auto",padding:32}}>
      <div style={{background:`linear-gradient(135deg,${C.G},${C.T})`,borderRadius:14,padding:"18px 22px",color:"#fff",marginBottom:18}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>⏳ Fetching Jotform data…</div>
        <div style={{fontSize:13,opacity:.9}}>{loadMsg || "Starting…"}</div>
        <div style={{marginTop:12,background:"rgba(255,255,255,.15)",borderRadius:6,padding:"4px 10px",fontSize:11}}>
          Each form has a 30-second timeout. Unavailable forms are skipped automatically.
        </div>
      </div>
      <div style={{background:"#e8e8e8",borderRadius:20,height:8,marginBottom:14,overflow:"hidden"}}>
        <div style={{
          height:"100%",borderRadius:20,background:`linear-gradient(90deg,${C.G},${C.T})`,
          width:`${Math.min(100,(loadLog.filter(l=>l.startsWith("  ✓")||l.startsWith("  ⚠")||l.includes("skipped")).length / 12)*100)}%`,
          transition:"width 0.4s ease"
        }}/>
      </div>
      <div style={{background:"#1e1e1e",borderRadius:10,padding:14,height:240,overflowY:"auto",
        fontSize:11,fontFamily:"monospace",lineHeight:1.8,color:"#ccc"}}>
        {loadLog.length === 0 && <span style={{color:"#666"}}>Initialising…</span>}
        {loadLog.map((l,i)=>(
          <div key={i} style={{
            color: l.startsWith("──")?"#7dd3a8": l.startsWith("  ✓")?"#86efac": l.startsWith("  ⚠")||l.startsWith("  ✗")?"#fca5a5":"#ccc"
          }}>{l}</div>
        ))}
        <div ref={logEndRef}/>
      </div>
      <button onClick={loadDemo} style={{
        marginTop:16,width:"100%",padding:"11px 0",borderRadius:10,border:`2px solid ${C.RED}`,
        background:"#fff",color:C.RED,fontWeight:700,fontSize:13,cursor:"pointer"
      }}>
        ✕ Cancel — Load Demo Data Instead
      </button>
    </div>
  );

  if (screen==="csv") {
    const [batchUploads, setBatchUploads] = useState(
      Object.fromEntries(Object.keys(PROGRAMS).map(k=>[k,{pre:null as File|null,post:null as File|null}]))
    );
    const [batchProcessing, setBatchProcessing] = useState(false);
    const [batchLog, setBatchLog] = useState<string[]>([]);

    function handleBatchFile(progKey:string, type:"pre"|"post", file:File) {
      setBatchUploads(prev=>({...prev,[progKey]:{...prev[progKey],[type]:file}}));
    }

    function parseCSV(text:string) {
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      return lines.slice(1).filter(l=>l.trim()).map(line=>{
        const vals = line.split(",").map(v=>v.replace(/"/g,"").trim());
        const obj:Record<string,string> = {}; headers.forEach((h,i)=>obj[h]=vals[i]||"");
        return { subtitle: obj["Submit Date"]||obj["Date"]||obj["submit_date"]||"2024-01-01", submission_answers: obj };
      });
    }

    async function processBatch() {
      setBatchProcessing(true);
      setBatchLog([]);
      const result:Record<string,any[]> = {};
      const log = (msg:string) => setBatchLog(prev=>[...prev,msg]);

      for (const [key, prog] of Object.entries(PROGRAMS)) {
        const files = batchUploads[key];
        if (!files.pre && !files.post) continue;
        log(`── ${prog.label} ──`);
        try {
          const readFile = (file:File) => new Promise<string>((res,rej)=>{
            const r = new FileReader();
            r.onload = e => res(e.target!.result as string);
            r.onerror = rej;
            r.readAsText(file);
          });
          const pre  = files.pre  ? parseCSV(await readFile(files.pre))  : [];
          const post = files.post ? parseCSV(await readFile(files.post)) : [];
          log(`  Pre: ${pre.length} rows  |  Post: ${post.length} rows`);
          if (!pre.length && !post.length) { log(`  skipped — empty files`); continue; }
          const ym:Record<string,{pre:any[],post:any[]}> = {};
          [...pre.map(s=>({s,type:"pre"})),...post.map(s=>({s,type:"post"}))].forEach(({s,type})=>{
            const y = getYear(s);
            if (!ym[y]) ym[y]={pre:[],post:[]};
            ym[y][type as "pre"|"post"].push(s);
          });
          result[key] = Object.entries(ym).sort(([a],[b])=>a.localeCompare(b))
            .map(([yr,{pre:p,post:po}])=>aggregateYear(p,po,yr,key));
          log(`  ✓ years: ${Object.keys(ym).join(", ")}`);
        } catch(e:any) {
          log(`  ✗ Error: ${e.message}`);
        }
      }
      log("── Done ──");
      setBatchProcessing(false);
      if (Object.keys(result).length) setResults(result);
    }

    const totalUploaded = Object.values(batchUploads).filter(v=>v.pre||v.post).length;
    const allComplete   = Object.values(batchUploads).every(v=>v.pre&&v.post);

    return (
      <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:720,margin:"0 auto",padding:24}}>
        <div style={{background:`linear-gradient(135deg,${C.G},${C.T})`,borderRadius:14,padding:"16px 22px",color:"#fff",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800}}>📁 Batch CSV Upload</div>
          <div style={{fontSize:12,opacity:.85,marginTop:4}}>Upload pre and post CSVs for any or all programs at once. You don't need all 6 — upload only what you have.</div>
        </div>
        <div style={{background:"#fffbe6",border:`1px solid ${C.GOLD}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:"#7a5c00",marginBottom:18}}>
          <strong>How to export from Jotform:</strong> Log into Jotform → open a survey form → click <strong>Submissions</strong> tab → click <strong>Export</strong> → choose <strong>Export as Excel</strong> or <strong>Download as CSV</strong>. Do this separately for the pre-survey and post-survey of each program.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
          {Object.entries(PROGRAMS).map(([k,p])=>{
            const u = batchUploads[k];
            const done = u.pre && u.post;
            const partial = (u.pre || u.post) && !done;
            return (
              <div key={k} style={{borderRadius:12,border:`2px solid ${done?C.G:partial?C.GOLD:"#e0e0e0"}`,
                background:done?C.LIGHT:partial?"#fffbe6":"#fafafa",padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{fontWeight:700,fontSize:13,color:done?C.G:partial?C.GOLD:"#555",minWidth:150}}>
                    {done?"✅":partial?"⏳":"⬜"} {p.label}
                  </div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                    <label style={{fontSize:12,display:"flex",flexDirection:"column",gap:3,cursor:"pointer"}}>
                      <span style={{fontWeight:600,color:u.pre?C.G:"#888"}}>{u.pre?`✓ ${u.pre.name}`:"Pre-survey CSV"}</span>
                      <input type="file" accept=".csv,.xlsx" style={{fontSize:11,width:180}}
                        onChange={e=>handleBatchFile(k,"pre",e.target.files![0])}/>
                    </label>
                    <label style={{fontSize:12,display:"flex",flexDirection:"column",gap:3,cursor:"pointer"}}>
                      <span style={{fontWeight:600,color:u.post?C.G:"#888"}}>{u.post?`✓ ${u.post.name}`:"Post-survey CSV"}</span>
                      <input type="file" accept=".csv,.xlsx" style={{fontSize:11,width:180}}
                        onChange={e=>handleBatchFile(k,"post",e.target.files![0])}/>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {batchLog.length>0&&(
          <div style={{background:"#1e1e1e",borderRadius:10,padding:12,marginBottom:14,
            fontSize:11,fontFamily:"monospace",lineHeight:1.8,color:"#ccc",maxHeight:180,overflowY:"auto"}}>
            {batchLog.map((l,i)=>(
              <div key={i} style={{color:l.startsWith("──")?"#7dd3a8":l.startsWith("  ✓")?"#86efac":l.startsWith("  ✗")?"#fca5a5":"#ccc"}}>{l}</div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={processBatch} disabled={totalUploaded===0||batchProcessing}
            style={{flex:2,padding:"12px 0",borderRadius:10,border:"none",
              background:totalUploaded>0?C.G:"#ccc",color:"#fff",fontWeight:700,fontSize:14,cursor:totalUploaded>0?"pointer":"not-allowed"}}>
            {batchProcessing?"Processing…":`▶ Process ${totalUploaded} Program${totalUploaded!==1?"s":""}`}
          </button>
          <button onClick={()=>setScreen("home")} style={{flex:1,padding:"12px 0",borderRadius:10,
            border:"1px solid #ccc",background:"#fff",color:"#666",fontWeight:600,fontSize:13,cursor:"pointer"}}>
            ← Back
          </button>
        </div>
        {!allComplete&&totalUploaded>0&&(
          <div style={{fontSize:11,color:"#888",marginTop:8,textAlign:"center"}}>
            You can process with partial uploads — programs missing either file will be skipped.
          </div>
        )}
      </div>
    );
  }

  const TABS = ["📊 Overview","🎯 Outcome Domains","📈 Trends","🤝 Relationships","♿ Access & Equity","💬 Quotes","📄 Funder Summary"];

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:920,margin:"0 auto",padding:"14px 12px"}}>
      <div style={{background:`linear-gradient(135deg,${C.G},${C.T})`,borderRadius:14,padding:"14px 20px",color:"#fff",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <span style={{fontSize:17,fontWeight:800}}>📊 Impact Analyzer</span>
            {isDemo&&<span style={{fontSize:11,background:"rgba(255,255,255,.2)",borderRadius:6,padding:"2px 8px",marginLeft:8}}>DEMO</span>}
            <div style={{fontSize:12,opacity:.85,marginTop:2}}>Elevation Outdoors · Program-specific outcome mapping</div>
          </div>
          <button onClick={()=>setScreen("home")} style={{fontSize:12,background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>⟵ Home</button>
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:12,opacity:.85}}>Program:</span>
          {Object.entries(PROGRAMS).filter(([k])=>allData[k]).map(([k,p])=>(
            <button key={k} onClick={()=>{setProgram(k);const ys=(allData[k]||[]).map(y=>y.year);setSelYear(ys[ys.length-1]||null);setTab("📊 Overview");}}
              style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:10,border:"none",cursor:"pointer",
                background:program===k?"#fff":"rgba(255,255,255,.18)",color:program===k?C.G:"#fff"}}>
              {p.label}
            </button>
          ))}
          <span style={{fontSize:12,opacity:.85,marginLeft:6}}>Year:</span>
          <select value={selYear||""} onChange={e=>setSelYear(e.target.value)}
            style={{fontSize:13,fontWeight:700,borderRadius:8,border:"none",padding:"4px 10px",background:"rgba(255,255,255,.2)",color:"#fff",cursor:"pointer"}}>
            {allYears.map(y=><option key={y} value={y} style={{color:"#000"}}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {TABS.map(t=><Btn key={t} label={t} active={tab===t} onClick={()=>setTab(t)}/>)}
      </div>

      {tab==="📊 Overview"&&(
        <>
          <Sec title={`${PROGRAMS[program]?.label} — ${selYear} (pre n=${yr.nPre||"—"}, post n=${yr.nPost||"—"})`}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Card label="Avg Program Rating"    value={yr.avgRating?`${fmtR(yr.avgRating)}/10`:"—"} accent={C.G}/>
              <Card label="Made New Friends"       value={yr.madeFriendPct!=null?`${yr.madeFriendPct}%`:"—"} accent={C.T}/>
              <Card label="Sense of Belonging"     value={yr.avgBelonging?`${fmtR(yr.avgBelonging)}/7`:"—"} accent={C.PU}/>
              <Card label="No-Access Without Prog" value={yr.accessNoPct!=null?`${yr.accessNoPct}%`:"—"} accent={C.RED}/>
              <Card label="Felt Safe"              value={yr.feltSafePct!=null?`${yr.feltSafePct}%`:"—"} accent={C.BL}/>
            </div>
          </Sec>
          <Sec title="Outcome Domain Gains — Pre vs. Post (avg score, 1–7 scale)">
            {domainBarData.length===0
              ? <div style={{color:"#999",fontSize:13}}>No scored domain data for this year.</div>
              : <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={domainBarData} margin={{top:5,right:20,left:0,bottom:30}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                    <XAxis dataKey="name" tick={{fontSize:10}} angle={-20} textAnchor="end" interval={0}/>
                    <YAxis domain={[3.5,7.5]}/>
                    <Tooltip formatter={(v:any)=>[`${v}/7`]}/>
                    <Legend verticalAlign="top"/>
                    <Bar dataKey="Pre"  fill={C.GOLD} name="Pre-Program"  radius={[4,4,0,0]}/>
                    <Bar dataKey="Post" fill={C.G}    name="Post-Program" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Sec>
        </>
      )}

      {tab==="🎯 Outcome Domains"&&(
        <Sec title={`Outcome Domains — ${PROGRAMS[program]?.label} · ${selYear}`}>
          {activeDomains.length===0&&<div style={{color:"#999",fontSize:13}}>No domain data available.</div>}
          {activeDomains.map(k=>{
            const d=DOMAIN_META[k]; const s=yr.domainScores?.[k];
            const gain=s?.pre!=null&&s?.post!=null?+(s.post-s.pre).toFixed(2):null;
            const pg=pctGain(s?.pre,s?.post);
            return (
              <div key={k} style={{borderLeft:`4px solid ${d?.color||C.G}`,background:"#fff",border:"1px solid #e8e8e8",
                borderLeftColor:d?.color||C.G,borderRadius:"0 10px 10px 0",padding:"11px 15px",marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:13,color:d?.color||C.G}}>{d?.label||k}</span>
                    <span style={{fontSize:11,color:"#888",marginLeft:8}}>{d?.desc}</span>
                  </div>
                  {gain!=null&&(
                    <div style={{display:"flex",gap:12,fontSize:13,alignItems:"center"}}>
                      <span style={{color:"#888"}}>Pre: <strong>{fmt(s.pre)}</strong>/7</span>
                      <span style={{color:"#888"}}>Post: <strong>{fmt(s.post)}</strong>/7</span>
                      <span style={{fontWeight:700,color:gain>0?C.G:gain<0?C.RED:"#888"}}>{gain>0?`+${gain}`:gain}</span>
                      <span style={{fontWeight:700,fontSize:13,color:"#fff",background:gain>0?C.G:gain<0?C.RED:"#aaa",borderRadius:20,padding:"2px 9px"}}>
                        {pg!=null?(pg>0?`+${pg}%`:pg===0?"0%":`${pg}%`):"—"}
                      </span>
                    </div>
                  )}
                  {gain===null&&<span style={{fontSize:12,color:"#aaa"}}>Measured {s?.pre!=null?"pre only":s?.post!=null?"post only":"—"}</span>}
                </div>
              </div>
            );
          })}
          {([["access","Access & Equity",`${yr.accessNoPct??'—'}% wouldn't have participated without this program.`,C.RED],
            ["satisfaction","Participant Satisfaction",`Avg rating: ${fmtR(yr.avgRating)||'—'}/10. ${yr.highRatingPct??'—'}% rated 8+.`,C.GR],
            ["safety","Safety",`${yr.feltSafePct??'—'}% felt safe. ${yr.leaderSafePct??'—'}% had no concerns about staff.`,"#555"],
            ["relationships","Relationships",`${yr.madeFriendPct??'—'}% made a new friend. Belonging: ${fmtR(yr.avgBelonging)||'—'}/7.`,C.BL],
          ] as [string,string,string,string][]).map(([k,label,summary,color])=>(
            <div key={k} style={{borderLeft:`4px solid ${color}`,background:"#fff",border:"1px solid #e8e8e8",
              borderLeftColor:color,borderRadius:"0 10px 10px 0",padding:"11px 15px",marginBottom:9}}>
              <span style={{fontWeight:700,fontSize:13,color}}>{label}</span>
              <span style={{fontSize:12,color:"#666",marginLeft:10,fontStyle:"italic"}}>{summary}</span>
            </div>
          ))}
        </Sec>
      )}

      {tab==="📈 Trends"&&(
        <>
          <Sec title="Domain Gains by Year (Post − Pre)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progData.map(y=>({year:y.year,...Object.fromEntries(
                Object.keys(y.domainScores||{}).filter(k=>y.domainScores[k]?.pre!=null&&y.domainScores[k]?.post!=null)
                  .map(k=>[DOMAIN_META[k]?.label||k, +(y.domainScores[k].post-y.domainScores[k].pre).toFixed(2)])
              )}))} margin={{top:5,right:20,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="year"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                {activeDomains.map(k=>(
                  <Line key={k} type="monotone" dataKey={DOMAIN_META[k]?.label||k}
                    stroke={DOMAIN_META[k]?.color||C.G} strokeWidth={2} dot={{r:3}}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Sec>
          <Sec title="Year-over-Year Summary">
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:C.G,color:"#fff"}}>
                    <th style={{padding:"7px 9px"}}>Year</th><th>n Pre</th><th>n Post</th>
                    {activeDomains.map(k=><th key={k} style={{padding:"7px 9px"}}>{DOMAIN_META[k]?.label||k}</th>)}
                    <th>Friends%</th><th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {progData.map((y,i)=>(
                    <tr key={y.year} style={{background:i%2===0?"#fff":C.LIGHT,cursor:"pointer"}}
                      onClick={()=>{setSelYear(y.year);setTab("📊 Overview");}}>
                      <td style={{padding:"6px 9px",fontWeight:700,color:C.G,textAlign:"center"}}>{y.year}</td>
                      <td style={{textAlign:"center"}}>{y.nPre}</td>
                      <td style={{textAlign:"center"}}>{y.nPost}</td>
                      {activeDomains.map(k=>{
                        const s=y.domainScores?.[k];
                        const g=s?.pre!=null&&s?.post!=null?+(s.post-s.pre).toFixed(2):null;
                        const pg=pctGain(s?.pre,s?.post);
                        return <td key={k} style={{textAlign:"center",color:g>0?C.G:g<0?C.RED:"#888",fontWeight:600}}>
                          {g!=null?<span title={`${g>0?"+":""}${g} pts`}>{pg!=null?(pg>0?`+${pg}%`:pg===0?"0%":`${pg}%`):"—"}</span>:"—"}
                        </td>;
                      })}
                      <td style={{textAlign:"center"}}>{y.madeFriendPct??'—'}%</td>
                      <td style={{textAlign:"center"}}>{fmtR(y.avgRating)||'—'}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>
        </>
      )}

      {tab==="🤝 Relationships"&&(
        <Sec title={`Relationships — ${PROGRAMS[program]?.label} · ${selYear}`}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            <Card label="Made New Friends"   value={yr.madeFriendPct!=null?`${yr.madeFriendPct}%`:"—"} accent={C.T}/>
            <Card label="Sense of Belonging" value={yr.avgBelonging?`${fmtR(yr.avgBelonging)}/7`:"—"} accent={C.G}/>
          </div>
          {([["Peer Relationships",yr.preRelPeer,yr.postRelPeer],["Adult Relationships",yr.preRelAdult,yr.postRelAdult]] as [string,number,number][]).map(([lbl,pre,post])=>(
            <div key={lbl} style={{background:C.LIGHT,borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>{lbl}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {([["Before",pre,C.GOLD],["After",post,C.G]] as [string,number,string][]).map(([tag,val,col])=>(
                  <div key={tag} style={{flex:1,minWidth:120,background:"#fff",borderRadius:8,padding:"9px 13px",textAlign:"center",border:`2px solid ${col}`}}>
                    <div style={{fontSize:11,color:"#888"}}>{tag}</div>
                    <div style={{fontSize:15,fontWeight:700,color:col,marginTop:2}}>{val?relLabel(val):"—"}</div>
                    <div style={{fontSize:11,color:"#bbb"}}>{val?`${Number(val).toFixed(1)}/4`:"—"}</div>
                  </div>
                ))}
                <div style={{flex:1,minWidth:120,background:"#fff",borderRadius:8,padding:"9px 13px",textAlign:"center",border:`2px solid ${C.G}`}}>
                  <div style={{fontSize:11,color:"#888"}}>Change</div>
                  <div style={{fontSize:17,fontWeight:800,color:C.G,marginTop:2}}>
                    {pre&&post?`+${((post-pre)/pre*100).toFixed(0)}%`:"—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Sec>
      )}

      {tab==="♿ Access & Equity"&&(
        <Sec title={`Access & Equity — ${PROGRAMS[program]?.label} · ${selYear}`}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            <Card label="Wouldn't have participated" value={yr.accessNoPct!=null?`${yr.accessNoPct}%`:"—"} sub="Without this program" accent={C.RED}/>
            <Card label="Unsure of access"           value={yr.accessUnsurePct!=null?`${yr.accessUnsurePct}%`:"—"} accent={C.GOLD}/>
            <Card label="New to the activity"        value={yr.newToProgramPct!=null?`${yr.newToProgramPct}%`:"—"} accent={C.PU}/>
          </div>
          <div style={{background:C.LIGHT,borderRadius:12,padding:16,fontSize:13,lineHeight:1.8}}>
            <p><strong style={{color:C.G}}>Why this matters to funders:</strong></p>
            <p>When <strong>{yr.accessNoPct??'—'}%</strong> of participants confirm they would not have accessed {PROGRAMS[program]?.activity} without this program, it demonstrates clear <em>additionality</em>.</p>
            <p>Including the <strong>{yr.accessUnsurePct??'—'}%</strong> who were unsure, as many as <strong>{yr.accessNoPct!=null&&yr.accessUnsurePct!=null?yr.accessNoPct+yr.accessUnsurePct:"—"}%</strong> may not have had this experience without Elevation Outdoors.</p>
          </div>
        </Sec>
      )}

      {tab==="💬 Quotes"&&(
        <Sec title={`Participant Voices — ${PROGRAMS[program]?.label} · ${selYear}`}>
          {!(yr.quotes?.length)
            ? <div style={{color:"#999",fontSize:13}}>No consented quotes available for this year.</div>
            : yr.quotes.map((q:string,i:number)=>(
              <div key={i} style={{background:C.LIGHT,borderLeft:`4px solid ${C.G}`,borderRadius:"0 10px 10px 0",padding:"12px 16px",marginBottom:10}}>
                <div style={{fontSize:13,fontStyle:"italic",lineHeight:1.7,color:"#333"}}>"{q}"</div>
                <div style={{fontSize:11,color:C.G,fontWeight:700,marginTop:6}}>— {selYear} participant, {PROGRAMS[program]?.label}</div>
              </div>
            ))}
          <div style={{background:"#fff8f0",border:`1px solid ${C.GOLD}`,borderRadius:8,padding:10,fontSize:11,color:"#666",marginTop:8}}>
            ⚠️ Only quotes where participants explicitly consented are shown. Verify consent before publishing.
          </div>
        </Sec>
      )}

      {tab==="📄 Funder Summary"&&(
        <Sec title={`Funder-Ready Narrative — ${PROGRAMS[program]?.label} · ${selYear}`}>
          <div style={{background:C.LIGHT,borderRadius:12,padding:20,fontSize:13,lineHeight:1.9,color:"#333"}}>
            <p><strong>Program:</strong> {PROGRAMS[program]?.label} — Elevation Outdoors &nbsp;|&nbsp; <strong>Year:</strong> {selYear} &nbsp;|&nbsp; <strong>Participants:</strong> {yr.nPre} pre · {yr.nPost} post</p>
            <hr style={{border:"none",borderTop:"1px solid #cde",margin:"10px 0"}}/>
            {activeDomains.length>0&&(
              <p><strong>1. Personal Development:</strong> Across {activeDomains.length} outcome domains,{" "}
              {activeDomains.slice(0,3).map(k=>{
                const s=yr.domainScores?.[k]; if(!s?.pre||!s?.post) return null;
                const gain=+(s.post-s.pre).toFixed(2); const pg=pctGain(s.pre,s.post);
                return `${DOMAIN_META[k]?.label} improved ${pg!=null?`${pg}%`:`${gain} pts`} (${fmt(s.pre)}→${fmt(s.post)}/7).`;
              }).filter(Boolean).join(" ")}</p>
            )}
            <p><strong>2. Social Connection:</strong> <strong>{yr.madeFriendPct??'—'}%</strong> made a new friend. Belonging avg <strong>{fmtR(yr.avgBelonging)||"—"}/7</strong>. Peer relationships: <em>{relLabel(yr.preRelPeer)}</em> → <em>{relLabel(yr.postRelPeer)}</em>.</p>
            <p><strong>3. Access & Equity:</strong> <strong>{yr.accessNoPct??'—'}%</strong> would not have accessed {PROGRAMS[program]?.activity} without this program.</p>
            <p><strong>4. Satisfaction:</strong> Avg rating <strong>{fmtR(yr.avgRating)||"—"}/10</strong>; <strong>{yr.highRatingPct??'—'}%</strong> rated 8+.</p>
            <p><strong>5. Safety:</strong> <strong>{yr.feltSafePct??'—'}%</strong> felt safe. <strong>{yr.leaderSafePct??'—'}%</strong> had no concerns about staff.</p>
            <hr style={{border:"none",borderTop:"1px solid #cde",margin:"10px 0"}}/>
            <p style={{fontSize:11,color:"#999"}}>Source: Elevation Outdoors Jotform pre/post surveys. Analysis via Impact Analyzer.</p>
          </div>
          <button onClick={()=>window.print()} style={{marginTop:12,background:C.G,color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            🖨 Print / Save as PDF
          </button>
        </Sec>
      )}
    </div>
  );
}