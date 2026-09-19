'use strict';
const $=id=>document.getElementById(id);let latest=null;
const example=`date,time,home,away,venue,duration
2026-09-20,10:00,Mavi SK,Sarı FK,Saha 1,90
2026-09-20,10:30,Yeşil GS,Mavi SK,Saha 2,90
2026-09-20,11:00,Kırmızı Spor,Beyaz Gençlik,Saha 1,90
2026-09-20,12:00,Sarı FK,Turuncu SK,Saha 2,90
2026-09-21,10:00,Mavi SK,Yeşil GS,Saha 1,90
2026-09-21,10:00,Yeşil GS,Mavi SK,Saha 1,90`;
function el(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function audit(){try{$('error').textContent='';latest=FixtureLint.analyze($('csv').value,{restHours:$('rest').value,bufferMinutes:$('buffer').value});render(latest);}catch(e){$('error').textContent=e.message;$('results').hidden=true;}}
function render(r){$('results').hidden=false;$('total').textContent=r.summary.total;$('errors').textContent=r.summary.errors;$('warnings').textContent=r.summary.warnings;$('ready').textContent=r.summary.ready?'EVET':'HAYIR';$('statusCard').className=r.summary.ready?'ok':'bad';
  $('findings').replaceChildren();if(!r.findings.length)$('findings').append(el('div','Çakışma veya kural ihlali bulamadım. Yine de maç bilgilerini bir insan kontrol etsin.','clear'));
  r.findings.forEach(f=>{const row=el('article','',`finding ${f.severity}`);row.append(el('i',''),(()=>{const d=el('div','');d.append(el('strong',f.severity==='error'?'Kritik hata':'Uyarı'),el('p',f.message));return d;})(),el('span','#'+f.ids.join(' · #')));$('findings').append(row);});
  $('schedule').replaceChildren();r.validMatches.slice().sort((a,b)=>a.start-b.start).forEach(m=>{const row=el('article','', 'match');row.append(el('time',m.time),(()=>{const d=el('div','');d.append(el('b',`${m.home} — ${m.away}`),el('small',`${formatDate(m.date)} · ${m.duration} dk`));return d;})(),el('span',`#${m.id}\n${m.venue}`));$('schedule').append(row);});
  $('results').scrollIntoView({behavior:'smooth',block:'start'});
}
function formatDate(s){return new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'short'}).format(new Date(s+'T12:00:00'));}
function report(r){return[`FIXTURELINT DENETİM RAPORU`,`Maç: ${r.summary.total} | Kritik: ${r.summary.errors} | Uyarı: ${r.summary.warnings}`,`Durum: ${r.summary.ready?'Kritik hata yok':'Yayın öncesi düzeltme gerekli'}`,'',...r.findings.map((f,i)=>`${i+1}. [${f.severity==='error'?'KRİTİK':'UYARI'}] ${f.message} (#${f.ids.join(', #')})`),'','Bu rapor cihazda üretildi. FixtureLint veriyi bir sunucuya göndermez.'].join('\n');}
function save(name,type,data){const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(new Blob([data],{type}));a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$('audit').addEventListener('click',audit);$('example').addEventListener('click',()=>{$('csv').value=example;audit();});$('csv').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();audit();}});
$('download').addEventListener('click',()=>{if(latest)save('fixturelint-fikstur.csv','text/csv;charset=utf-8',FixtureLint.toCsv(latest.validMatches));});
$('copyReport').addEventListener('click',async()=>{if(!latest)return;try{await navigator.clipboard.writeText(report(latest));$('copyStatus').textContent='Rapor kopyalandı.';}catch{$('copyStatus').textContent='Kopyalama izni yok. Raporu indirme özelliği için CSV düğmesini kullan.';}});
