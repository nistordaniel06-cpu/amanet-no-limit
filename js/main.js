'use strict';
const cfg=window.SITE_CONFIG,calc=window.AmanetCalc,$=id=>document.getElementById(id);
const money=v=>new Intl.NumberFormat('ro-RO',{style:'currency',currency:'RON',maximumFractionDigits:2}).format(v);
const num=v=>new Intl.NumberFormat('ro-RO',{maximumFractionDigits:2}).format(v);
const wa=m=>'https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(m);
const query=new URLSearchParams(location.search);
function hours(){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bucharest',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(v=>[v.type,v.value]));
 const minutes=Number(p.hour)*60+Number(p.minute),close=p.weekday==='Sun'?18:20;
 const text=minutes>=600&&minutes<close*60?'Program azi: deschis până la '+close+':00':'În afara programului · deschidem la 10:00';
 document.querySelectorAll('[data-hours]').forEach(e=>e.textContent=text);
}
hours();setInterval(hours,60000);
const toggle=$('menu-toggle'),menu=$('mobile-menu');
function closeMenu(focus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
toggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true);});
document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('header'))closeMenu();});
matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
function goldValue(form){const e=form.elements;return e.grams.validity.valid?calc.gold(e.grams.value,cfg.gold[e.karat.value][e.mode.value]):null;}
if($('quick-form')){
 const form=$('quick-form');
 function update(){const total=goldValue(form);$('quick-total').textContent=total===null?'Verifică greutatea':money(total);}
 form.addEventListener('input',update);form.addEventListener('change',update);
 form.addEventListener('submit',e=>{e.preventDefault();if(form.reportValidity())location.href='calculator.html?'+new URLSearchParams(new FormData(form))+'#aur';});
 update();
}
if($('gold-form')){
 const goldForm=$('gold-form'),loanForm=$('loan-form'),tabs=[...document.querySelectorAll('[data-tab]')];
 function activate(id){if(!['aur','imprumut'].includes(id))id='aur';tabs.forEach(t=>{const active=t.dataset.tab===id;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;$(t.dataset.tab).hidden=!active;});}
 tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>{activate(t.dataset.tab);history.replaceState(null,'',location.pathname+location.search+'#'+t.dataset.tab);});
  t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[index].click();tabs[index].focus();});
 });
 activate(location.hash.slice(1));addEventListener('hashchange',()=>activate(location.hash.slice(1)));
 goldForm.elements.karat.value=Object.hasOwn(cfg.gold,query.get('karat'))?query.get('karat'):'14k';
 if(calc.finiteInRange(query.get('grams'),.1,10000)!==null)goldForm.elements.grams.value=query.get('grams');
 goldForm.elements.mode.value=query.get('mode')==='buy'?'buy':'pawn';
 function updateGold(){
  const e=goldForm.elements,total=goldValue(goldForm),rate=cfg.gold[e.karat.value][e.mode.value];
  $('gold-total').textContent=total===null?'Verifică greutatea':money(total);
  $('gold-breakdown').textContent=total===null?'Introdu între 0,1 și 10.000 grame.':num(e.grams.value)+' g × '+money(rate)+' / g · '+e.karat.value.toUpperCase()+' · '+(e.mode.value==='buy'?'Vânzare':'Amanet');
  $('gold-whatsapp').hidden=total===null;
  if(total!==null)$('gold-whatsapp').href=wa('Bună ziua! Doresc o confirmare pentru '+(e.mode.value==='buy'?'vânzare':'amanet')+': '+e.grams.value+' g aur '+e.karat.value.toUpperCase()+'. Estimare orientativă pe site: '+money(total)+' ('+money(rate)+'/g). Care este oferta actuală?');
 }
 function updateLoan(){
  const dateParts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=dateParts.year+'-'+dateParts.month+'-'+dateParts.day;
  const e=loanForm.elements,r=e.amount.validity.valid&&e.days.validity.valid?calc.loan(e.amount.value,e.days.value,cfg.dailyPercent[e.category.value]):null;
  $('loan-total').textContent=r?money(r.total):'Verifică valorile';$('loan-breakdown').replaceChildren();$('loan-whatsapp').hidden=!r;if(!r)return;
  [['Împrumut',money(r.principal)],['Perioadă',r.days+' zile'],['Comision de referință',num(r.percent)+'% / zi'],['Cost zilnic estimat',money(r.daily)],['Comision total',money(r.commission)],['Scadență estimată',new Date(calc.dueDate(today,r.days)+'T12:00:00Z').toLocaleDateString('ro-RO',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'})]].forEach(([a,b])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;row.append(dt,dd);$('loan-breakdown').append(row);});
  $('loan-whatsapp').href=wa('Bună ziua! Doresc să discut o simulare de amanet pentru '+e.category.selectedOptions[0].textContent+': '+money(r.principal)+', '+r.days+' zile, comision orientativ '+num(r.percent)+'%/zi ('+money(r.commission)+'), total estimat '+money(r.total)+'. Vă rog să confirmați oferta și toate costurile.');
 }
 [goldForm,loanForm].forEach(form=>form.addEventListener('submit',e=>e.preventDefault()));
 goldForm.addEventListener('input',updateGold);goldForm.addEventListener('change',updateGold);loanForm.addEventListener('input',updateLoan);loanForm.addEventListener('change',updateLoan);
 Object.entries(cfg.gold).forEach(([k,r])=>{const row=document.createElement('tr');[k.toUpperCase(),r.purity,money(r.pawn),money(r.buy)].forEach(v=>{const td=document.createElement('td');td.textContent=v;row.append(td);});$('gold-rates').append(row);});
 updateGold();updateLoan();
}
if($('products-grid')){
 const names={all:'Toate',bijuterii:'Aur & bijuterii',telefoane:'Telefoane',ceasuri:'Ceasuri',laptopuri:'Laptopuri',auto:'Auto'};
 let category=Object.hasOwn(names,query.get('categorie'))?query.get('categorie'):'all';
 $('catalog-search').value=(query.get('q')||'').slice(0,180);
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function render(updateUrl=false){
  const q=normalize($('catalog-search').value.trim());
  const items=window.PRODUCTS_DATA.filter(p=>(category==='all'||p.category===category)&&normalize(p.title+' '+p.categoryName).includes(q));
  items.sort((a,b)=>($('catalog-sort').value==='category'?a.categoryName.localeCompare(b.categoryName,'ro'):0)||a.title.localeCompare(b.title,'ro'));
  $('products-grid').replaceChildren();
  items.forEach(p=>{
   const card=document.createElement('article');card.className='product-card';
   const label=document.createElement('p');label.className='product-category';label.textContent=p.categoryName;
   const title=document.createElement('h2');title.textContent=p.title;
   const status=document.createElement('p');status.textContent='Preț și stoc la cerere';
   const link=document.createElement('a');link.className='button secondary';link.textContent='Cere detalii ↗';link.href=wa('Bună ziua! Mă interesează '+p.title+' (referință '+p.id+'). Este disponibil? Vă rog să îmi trimiteți prețul actual, fotografii reale și detalii despre stare și garanție.');
   card.append(label,title,status,link);$('products-grid').append(card);
  });
  $('catalog-count').textContent=items.length+' '+(items.length===1?'model':'modele')+' · '+names[category];$('catalog-empty').hidden=items.length>0;
  document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
  if(updateUrl){const p=new URLSearchParams();if(category!=='all')p.set('categorie',category);if($('catalog-search').value.trim())p.set('q',$('catalog-search').value.trim());history.replaceState(null,'',location.pathname+(p.size?'?'+p:''));}
 }
 document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render(true);}));
 $('catalog-search').addEventListener('input',()=>render(true));$('catalog-sort').addEventListener('change',()=>render());
 $('reset-catalog').addEventListener('click',()=>{category='all';$('catalog-search').value='';render(true);$('catalog-search').focus();});render();
}
if($('evaluation-form')){
 const form=$('evaluation-form'),photos=$('eval-photos');let files=[],urls=[],message='';
 if([...form.elements.category.options].some(o=>o.value===query.get('categorie')))form.elements.category.value=query.get('categorie');
 function refresh(){
  urls.forEach(u=>URL.revokeObjectURL(u));urls=[];$('photo-previews').replaceChildren();
  files.forEach((file,i)=>{
   const card=document.createElement('div');card.className='photo-preview';const img=document.createElement('img'),url=URL.createObjectURL(file);urls.push(url);img.src=url;img.alt='Fotografie selectată';img.addEventListener('error',()=>img.hidden=true);
   const name=document.createElement('span');name.textContent=file.name;
   const remove=document.createElement('button');remove.type='button';remove.textContent='Elimină';remove.setAttribute('aria-label','Elimină fotografia '+file.name);remove.addEventListener('click',()=>{files.splice(i,1);refresh();photos.focus();});
   card.append(img,name,remove);$('photo-previews').append(card);
  });
 }
 photos.addEventListener('change',e=>{
  const errors=[];
  for(const file of e.target.files){
   if(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type)){errors.push(file.name+': alege JPG, PNG, WebP sau HEIC.');continue;}
   if(!file.size||file.size>10*1024*1024){errors.push(file.name+': limita este 10 MB.');continue;}
   if(files.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))continue;
   if(files.length>=5){errors.push('Poți selecta maximum 5 fotografii.');break;}
   if(files.reduce((n,f)=>n+f.size,0)+file.size>25*1024*1024){errors.push('Fotografiile pot avea maximum 25 MB în total.');continue;}files.push(file);
  }
  $('photo-error').textContent=errors.join(' ');e.target.value='';refresh();
 });
 ['name','phone','product','details'].forEach(key=>form.elements[key].addEventListener('input',()=>form.elements[key].setCustomValidity('')));
 form.addEventListener('submit',e=>{
  e.preventDefault();const d=new FormData(form),phone=String(d.get('phone')).replace(/[\s().-]/g,'');
  form.elements.phone.setCustomValidity(/^\+?[0-9]{9,15}$/.test(phone)?'':'Introdu un număr valid de telefon (9–15 cifre).');
  ['name','product','details'].forEach(key=>form.elements[key].setCustomValidity(String(d.get(key)).trim()?'':'Completează acest câmp.'));
  if(!form.reportValidity())return;
  message='Bună ziua! Doresc o evaluare la Amanet No Limit.\n\nNume: '+String(d.get('name')).trim()+'\nTelefon: '+phone+'\nCategorie: '+form.elements.category.selectedOptions[0].textContent+'\nOperațiune: '+d.get('operation')+'\nProdus: '+String(d.get('product')).trim()+'\nDetalii: '+String(d.get('details')).trim()+'\nSumă dorită: '+(d.get('amount')?money(Number(d.get('amount'))):'Aștept oferta dumneavoastră')+'\n\nVă rog să îmi comunicați oferta orientativă și pașii următori.';
  $('message-preview').textContent=message;$('send-whatsapp').href=wa(message);
  let canShare=false;try{canShare=files.length>0&&!!navigator.canShare?.({files,text:message});}catch{}
  $('share-photos').hidden=!canShare;
  $('share-status').textContent=files.length?files.length+' fotografii pregătite. Atașează-le în WhatsApp sau folosește partajarea dacă este disponibilă.':'Verifică mesajul și apasă Trimitere în WhatsApp.';
  $('message-dialog').showModal();
 });
 $('close-dialog').addEventListener('click',()=>$('message-dialog').close());
 $('share-photos').addEventListener('click',async()=>{
  const btn=$('share-photos');btn.disabled=true;
  try{await navigator.share({files,text:message,title:'Evaluare Amanet No Limit'});$('share-status').textContent='Partajarea s-a încheiat. Verifică în aplicația aleasă că mesajul și fotografiile au fost trimise.';}
  catch(e){$('share-status').textContent=e.name==='AbortError'?'Partajarea a fost anulată. Poți continua pe WhatsApp.':'Partajarea nu este disponibilă acum. Deschide WhatsApp și atașează fotografiile manual.';}
  finally{btn.disabled=false;}
 });
 $('copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message);$('share-status').textContent='Mesaj copiat. Lipește-l în conversație și trimite-l.';}catch{$('share-status').textContent='Copierea automată nu este disponibilă. Selectează și copiază textul de mai sus.';}});
 addEventListener('pagehide',()=>{urls.forEach(u=>URL.revokeObjectURL(u));});
}

if(/(?:^|\/)index\.html$/.test(location.pathname)||location.pathname.endsWith('/')){
 const legacy={evaluare:'evaluare.html',magazin:'produse.html',contact:'contact.html',calculator:'calculator.html', 'cotatii-aur':'calculator.html#gold-rates'};
 if(Object.hasOwn(legacy,location.hash.slice(1)))location.replace(legacy[location.hash.slice(1)]);
}
