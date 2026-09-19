(function(root){
  'use strict';
  const required=['date','time','home','away','venue','duration'];
  function csvParse(text){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'){if(quoted&&n==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);cell='';if(row.some(v=>v.trim()))rows.push(row);row=[];}else cell+=c;}
    if(quoted)throw Error('Kapanmamış tırnak işareti var.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
  }
  function parse(text){
    if(typeof text!=='string'||text.length>250000)throw Error('Metin en fazla 250.000 karakter olabilir.');
    const rows=csvParse(text.trim());if(rows.length<2)throw Error('Başlık ve en az bir maç satırı gerekli.');
    const headers=rows[0].map(x=>x.trim().toLowerCase());
    const missing=required.filter(x=>!headers.includes(x));if(missing.length)throw Error('Eksik başlık: '+missing.join(', '));
    return rows.slice(1).map((cells,i)=>{const get=k=>(cells[headers.indexOf(k)]||'').trim();const date=get('date'),time=get('time');return{id:i+1,line:i+2,date,time,home:get('home'),away:get('away'),venue:get('venue'),duration:Number(get('duration')),start:new Date(`${date}T${time}:00`),raw:cells};});
  }
  function analyze(text,options={}){
    const restHours=Math.max(0,Math.min(168,Number(options.restHours??18))),bufferMinutes=Math.max(0,Math.min(180,Number(options.bufferMinutes??15)));
    const matches=parse(text),findings=[];const add=(severity,code,message,ids)=>findings.push({severity,code,message,ids:[...new Set(ids)].sort((a,b)=>a-b)});
    const valid=[];
    for(const m of matches){
      const blanks=['date','time','home','away','venue'].filter(k=>!m[k]);if(blanks.length)add('error','missing',`Satır ${m.line}: eksik alan — ${blanks.join(', ')}.`,[m.id]);
      const parts=m.date.split('-').map(Number);const dateExact=!Number.isNaN(m.start.getTime())&&m.start.getFullYear()===parts[0]&&m.start.getMonth()+1===parts[1]&&m.start.getDate()===parts[2];
      if(!dateExact||!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(m.time))add('error','datetime',`Satır ${m.line}: tarih veya saat okunamadı.`,[m.id]);
      if(!Number.isFinite(m.duration)||m.duration<1||m.duration>600)add('error','duration',`Satır ${m.line}: süre 1–600 dakika olmalı.`,[m.id]);
      if(m.home&&m.away&&m.home.localeCompare(m.away,undefined,{sensitivity:'base'})===0)add('error','self',`Satır ${m.line}: bir takım kendisiyle oynayamaz.`,[m.id]);
      if(!blanks.length&&dateExact&&/^([01]\d|2[0-3]):[0-5]\d$/.test(m.time)&&Number.isFinite(m.duration)&&m.duration>=1&&m.duration<=600&&m.home.toLocaleLowerCase()!==m.away.toLocaleLowerCase()){m.end=new Date(m.start.getTime()+m.duration*60000);valid.push(m);}
    }
    const canon=s=>s.trim().toLocaleLowerCase('tr-TR');
    for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++){
      const a=valid[i],b=valid[j],aTeams=[canon(a.home),canon(a.away)],bTeams=[canon(b.home),canon(b.away)];
      const shared=aTeams.filter(t=>bTeams.includes(t));const overlap=a.start<b.end&&b.start<a.end;
      const buffered=a.start.getTime()<b.end.getTime()+bufferMinutes*60000&&b.start.getTime()<a.end.getTime()+bufferMinutes*60000;
      const samePair=aTeams.slice().sort().join('|')===bTeams.slice().sort().join('|');
      if(samePair&&a.start.getTime()===b.start.getTime())add('error','duplicate',`Maç #${a.id} ve #${b.id} aynı eşleşme ve saatte tekrarlanıyor.`,[a.id,b.id]);
      if(shared.length&&overlap)add('error','team-overlap',`${shared.map(t=>teamName(t,a,b)).join(', ')} aynı anda iki maçta görünüyor.`,[a.id,b.id]);
      if(canon(a.venue)===canon(b.venue)&&overlap)add('error','venue-overlap',`${a.venue} aynı anda iki maça ayrılmış.`,[a.id,b.id]);
      else if(canon(a.venue)===canon(b.venue)&&buffered)add('warning','venue-buffer',`${a.venue} için maçlar arasında ${bufferMinutes} dakikalık hazırlık payı yok.`,[a.id,b.id]);
    }
    const appearances=new Map();for(const m of valid)for(const name of [m.home,m.away]){const k=canon(name);if(!appearances.has(k))appearances.set(k,[]);appearances.get(k).push({name,match:m});}
    for(const list of appearances.values()){list.sort((a,b)=>a.match.start-b.match.start);for(let i=1;i<list.length;i++){const prev=list[i-1].match,next=list[i].match;if(prev.end>next.start)continue;const gap=(next.start-prev.end)/36e5;if(gap<restHours)add('warning','rest',`${list[i].name} için dinlenme ${fmtGap(gap)}; hedef en az ${restHours} saat.`,[prev.id,next.id]);}}
    findings.sort((a,b)=>rank(a.severity)-rank(b.severity)||a.ids[0]-b.ids[0]);
    const errors=findings.filter(f=>f.severity==='error').length,warnings=findings.filter(f=>f.severity==='warning').length;
    return{matches,validMatches:valid,findings,summary:{total:matches.length,valid:valid.length,errors,warnings,ready:errors===0},options:{restHours,bufferMinutes},generatedAt:null};
  }
  function teamName(key,a,b){return[a.home,a.away,b.home,b.away].find(x=>x.toLocaleLowerCase('tr-TR')===key)||key;}
  function fmtGap(hours){const mins=Math.round(hours*60);return mins>=60?`${Math.floor(mins/60)} sa ${mins%60} dk`:`${mins} dk`;}
  function rank(s){return s==='error'?0:s==='warning'?1:2;}
  function escapeCsv(value){const s=String(value??'');return /[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
  function toCsv(matches){return['date,time,home,away,venue,duration',...matches.map(m=>[m.date,m.time,m.home,m.away,m.venue,m.duration].map(escapeCsv).join(','))].join('\n');}
  const api={csvParse,parse,analyze,toCsv};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FixtureLint=api;
})(typeof globalThis!=='undefined'?globalThis:this);
