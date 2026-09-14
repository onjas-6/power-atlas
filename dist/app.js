// Power Atlas · generated with GPT-6 / Codex · 2026-09-14
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function renderGrid(scope='world') {
 const total=scope==='world'?31772.35:485, ai=155/total*1000, dc=(scope==='world'?485:485)/total*1000;
 $('#power-grid').innerHTML=Array.from({length:1000},(_,i)=>{let color=i<Math.floor(ai)?'ai':i<Math.floor(dc)?'other-dc':'';let style='';if(i===Math.floor(ai)){const frac=ai%1*100;style=`background:linear-gradient(90deg,var(--lime) ${frac}%,var(--mint) ${frac}%)`;}else if(scope==='world'&&i===Math.floor(dc)){const frac=dc%1*100;style=`background:linear-gradient(90deg,var(--mint) ${frac}%,#2a4045 ${frac}%)`;}return `<span class="tile ${color}" style="${style}"></span>`}).join('');
 $('#power-grid').setAttribute('aria-label',`${(155/total*100).toFixed(2)} percent AI-focused data centres. ${(330/total*100).toFixed(2)} percent other data centres. Each of 1000 tiles is one thousandth of the selected total; fractional tiles preserve exact shares.`);
 $('#grid-denominator').textContent=scope==='world'?'31,772 TWh · global electricity demand':'485 TWh · all data centres';
 $('#share-number').innerHTML=(155/total*100).toFixed(scope==='world'?2:1)+'<span>%</span>';
 $('#share-label').textContent=scope==='world'?'AI SHARE OF GLOBAL DEMAND':'AI SHARE OF DATA CENTRES';
 $('#share-copy').textContent=scope==='world'?"About 1 in every 205 units of the world's electricity powers AI-focused data centres.":'About one third of data-centre electricity goes to AI-focused facilities. The rest serves other digital workloads.';
 $('#rest-legend').hidden=scope!=='world';
 $$('[data-scope]').forEach(b=>{b.classList.toggle('active',b.dataset.scope===scope);b.setAttribute('aria-pressed',b.dataset.scope===scope)});
}
$$('[data-scope]').forEach(b=>b.addEventListener('click',()=>renderGrid(b.dataset.scope)));
renderGrid();

let DATA, kind='country', expanded=false, unit='twh', trend='global';
const palette={ai:'#d7f878',dc:'#61bda5',country:'#7ca6e5',city:'#7ca6e5',company:'#61bda5',other:'#efa56f'};
const fmt=(n,d=1)=>n.toLocaleString('en-US',{maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=id=>DATA.entities.find(e=>e.id===id);
const source=id=>DATA.sources.find(e=>e.id===id);
const hours=e=>(Number(String(e.year).replace('FY',''))===2024?8784:8760);
const quantity=e=>unit==='gw'?e.value*1000/hours(e):e.value;
const unitName=()=>unit==='gw'?'GW average':'TWh / year';
function renderRanking(){
 const es=DATA.entities.filter(e=>e.kind===kind).sort((a,b)=>b.value-a.value);
 const shown=kind==='country'&&!expanded?es.slice(0,10):es;
 const rows=[...shown,get('ai')].sort((a,b)=>quantity(b)-quantity(a));
 const max=Math.max(...rows.map(quantity));
 $('#ranking').innerHTML=rows.map(e=>`<button class="rank-row ${e.kind==='ai'?'ai-row':''} ${$('#comparison-b').value===e.id?'selected':''}" data-entity="${e.id}" aria-label="Compare ${esc(e.name)}, ${fmt(quantity(e))} ${unitName()}, ${esc(e.year)}" aria-pressed="${$('#comparison-b').value===e.id}"><span class="rank-name">${esc(e.name)}<small>${esc(e.year)}${e.status==='Derived'?' · derived':''}</small></span><span class="rank-track"><span class="rank-fill" style="width:${quantity(e)/max*100}%;background:${palette[e.kind]}"></span></span><span class="rank-value">${e.status==='Approximate'||e.status==='Derived'?'≈':''}${fmt(quantity(e),quantity(e)<10?2:1)}${e.kind==='country'?`<small>${fmt(e.value/(DATA.worldByYear[e.year]||DATA.world)*100,2)}% world${e.year===2025?'':' ('+e.year+')'}</small>`:''}</span></button>`).join('');
 const descriptions={country:'National demand · latest 2024–2025 · includes system losses',city:'Selected city references · 2024 · boundaries differ',company:'Company-wide operations · years shown · not AI-only',other:'Other uses · different boundaries and reference periods'};
 $('#list-description').textContent=descriptions[kind];
 $('#show-more').hidden=kind!=='country';$('#show-more').textContent=expanded?'Show top 10 −':`Show all ${es.length} countries +`;
 $('#country-ribbon').hidden=kind!=='country';
 if(kind==='country'){
  const top=es.slice(0,3),rest=DATA.world-top.reduce((s,e)=>s+e.value,0);const colors=['#7ca6e5','#a1badf','#becde1','#2e454a'];
  const parts=[...top,{name:'Rest of world',value:rest}];
  $('#country-ribbon').innerHTML=`<div class="ribbon" role="img" aria-label="World electricity demand: ${parts.map(e=>`${esc(e.name)} ${fmt(e.value/DATA.world*100,1)} percent`).join(', ')}">${parts.map((e,i)=>`<span title="${esc(e.name)} · ${fmt(e.value/DATA.world*100,1)}%" style="width:${e.value/DATA.world*100}%;background:${colors[i]}"></span>`).join('')}</div><div class="ribbon-key">${parts.map((e,i)=>`<span><i style="background:${colors[i]}"></i>${esc(e.name)} ${fmt(e.value/DATA.world*100,1)}%</span>`).join('')}</div>`;
 }
 $$('[data-entity]').forEach(b=>b.addEventListener('click',()=>{$('#comparison-b').value=b.dataset.entity;renderComparison();renderRanking()}));
 $$('[data-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.kind===kind);b.setAttribute('aria-pressed',b.dataset.kind===kind)});
}
function renderComparison(){
 const a=get($('#comparison-a').value), b=get($('#comparison-b').value), av=quantity(a),bv=quantity(b),max=Math.max(av,bv),ratio=av/bv;
 const size=150;
 $('#compare-graphic').innerHTML='<svg viewBox="0 0 340 210" aria-hidden="true">'+[a,b].map((e,i)=>{const side=Math.sqrt(quantity(e)/max)*size,cx=i?255:85;return `<rect x="${cx-side/2}" y="${175-side}" width="${side}" height="${side}" fill="${i?palette.country:palette.ai}"/><text x="${cx}" y="201" text-anchor="middle" fill="#a4b4b6" font-family="DM Mono,monospace" font-size="12">${fmt(quantity(e),1)} ${unit==='gw'?'GW':'TWh'}</text>`}).join('')+'</svg>';
 $('#compare-graphic').setAttribute('aria-label',`${a.name}: ${fmt(av)} ${unitName()}; ${b.name}: ${fmt(bv)} ${unitName()}. Square area, not side length, is proportional to electricity.`);
 $('#comparison-result').innerHTML=`<div class="ratio-number">${ratio<.01?fmt(ratio,4):fmt(ratio,2)}×</div><h3>The electricity used by ${esc(a.name)} is equivalent to <strong>${ratio<.01?fmt(ratio*100,2)+'%':fmt(ratio,2)+'×'}</strong> ${esc(b.name)}’s ${unit==='gw'?'average electrical demand':'annual electricity'}.</h3>`;
 $('#comparison-footnote').innerHTML=`<span class="small-label">SQUARE AREA = ELECTRICITY</span><p><a href="#source-${a.source}">${esc(a.name)} · ${esc(a.year)} ↗</a><br>${esc(a.scope)}.</p><p><a href="#source-${b.source}">${esc(b.name)} · ${esc(b.year)} ↗</a><br>${esc(b.scope)}.</p>`;
}
function trendSVG(series,{minYear,maxYear,maxY,selectedYear,projection=false}={}){
 const W=720,H=340,L=48,R=75,T=20,B=40, x=y=>L+(y-minYear)/(maxYear-minYear)*(W-L-R),y=v=>H-B-v/maxY*(H-T-B);
 let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${projection?'IEA electricity outlook: all data centres 485 TWh in 2025 to 950 TWh in 2030; AI-focused 155 to 465 TWh. Intermediate path is illustrative.':'Company operational electricity trends from 2021 to latest disclosed year. Values are available in the table below.'}"><text x="${L}" y="12">TWh / year</text>`;
 const steps=projection?[0,250,500,750,1000]:[0,10,20,30,40,50];
 steps.forEach(t=>out+=`<line class="axis" x1="${L}" y1="${y(t)}" x2="${W-R}" y2="${y(t)}"/><text x="${L-9}" y="${y(t)+4}" text-anchor="end">${t}</text>`);
 for(let yr=minYear;yr<=maxYear;yr++)out+=`<text x="${x(yr)}" y="${H-12}" text-anchor="middle">${yr}</text>`;
 if(projection){out+=`<text x="${x(2027.5)}" y="36" text-anchor="middle" style="fill:#6d8589;font-size:11px">ILLUSTRATIVE PATH TO IEA ENDPOINT</text>`;out+=`<line x1="${x(selectedYear)}" x2="${x(selectedYear)}" y1="${T+25}" y2="${H-B}" stroke="#73918a" stroke-dasharray="3 5"/>`;}
 series.forEach(s=>{
  const points=s.values.map(([yr,v])=>`${x(yr)},${y(v)}`).join(' ');
  out+=`<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="3" ${projection?'stroke-dasharray="7 7"':''}/>`;
  s.values.filter((_,i)=>!projection||i===0||i===s.values.length-1).forEach(([yr,v])=>out+=`<circle cx="${x(yr)}" cy="${y(v)}" r="4" fill="${s.color}"/>`);
  const [endYear,end]=s.values.at(-1);out+=`<text class="value-label" x="${x(endYear)+11}" y="${y(end)+4}" style="fill:${s.color}">${fmt(end,1)}</text>`;
  if(projection){const val=s.values.find(([yr])=>yr===selectedYear)[1];out+=`<circle cx="${x(selectedYear)}" cy="${y(val)}" r="6" fill="${s.color}" stroke="#102125" stroke-width="2"/>`;}
 });return out+'</svg>';
}
function renderTrend(){
 $$('[data-trend]').forEach(b=>{b.classList.toggle('active',b.dataset.trend===trend);b.setAttribute('aria-pressed',b.dataset.trend===trend)});
 if(trend==='global'){
  const yr=+$('#trend-year').value,t=(yr-2025)/5,ai=155*Math.pow(3,t),total=485*Math.pow(950/485,t),other=total-ai;
  const state=yr===2025?'estimate':yr===2030?'projection':'illustration';
  $('#trend-title').textContent='AI-focused electricity use could triple.';$('#trend-kicker').textContent='IEA BASE CASE · 2025 → 2030';
  $('#trend-key').innerHTML='<span><i class="ai"></i>AI-focused</span><span><i class="other-dc"></i>All data centres</span>';
  const years=[2025,2026,2027,2028,2029,2030];
  const series=[{name:'All data centres',color:palette.dc,values:years.map(y=>[y,485*Math.pow(950/485,(y-2025)/5)])},{name:'AI-focused',color:palette.ai,values:years.map(y=>[y,155*Math.pow(3,(y-2025)/5)])}];
  $('#trend-chart').innerHTML=trendSVG(series,{minYear:2025,maxYear:2030,maxY:1000,selectedYear:yr,projection:true});
  $('#trend-controls').hidden=false;$('#trend-year-output').textContent=`${yr} · ${state}`;
  $('#trend-readout').innerHTML=`<span class="eyebrow">${yr} · ${state.toUpperCase()}</span><div class="readout-primary">${fmt(ai,0)} <span>TWh AI-focused</span></div><div class="readout-row"><span>All data centres</span><strong>${fmt(total,0)} TWh</strong></div><div class="readout-row"><span>Other data centres</span><strong>${fmt(other,0)} TWh</strong></div><div class="readout-row"><span>AI share of data centres</span><strong>${fmt(ai/total*100,1)}%</strong></div><p>${yr===2030?'About two thirds of the projected increase comes from AI-focused facilities.':yr===2025?'The starting point: roughly one third of data-centre electricity is AI-focused.':'This year is an illustrative interpolation between published endpoints, not a separate IEA forecast.'}</p>`;
  $('#trend-note').innerHTML='Published endpoints: <a href="#source-iea">IEA 2026</a> and <a href="#source-iea-ai">Figure 1.5</a>; 2025 AI value via <a href="#source-owid">OWID</a>. Intermediate years use a constant compound-growth illustration. Other data centres = total minus AI-focused; figures are rounded. These are electricity scenarios, not a count of signed projects.';
  $('#trend-data-table').innerHTML='<table><thead><tr><th>Period</th><th>AI-focused</th><th>Other</th><th>All data centres</th><th>Evidence</th></tr></thead><tbody><tr><td>2025</td><td>155</td><td>330</td><td>485 TWh</td><td>IEA estimate</td></tr><tr><td>2030</td><td>465</td><td>485</td><td>950 TWh</td><td>IEA base case</td></tr></tbody></table>';
 }else{
  const es=['google','microsoft','meta'].map(get),colors=['#d7f878','#7ca6e5','#61bda5'];
  $('#trend-title').textContent='The increase is already visible in the meters.';$('#trend-kicker').textContent='COMPANY OPERATIONS · 2021–2025';
  $('#trend-key').innerHTML=es.map((e,i)=>`<span><i style="background:${colors[i]}"></i>${e.name}</span>`).join('');
  $('#trend-chart').innerHTML=trendSVG(es.map((e,i)=>({name:e.name,color:colors[i],values:Object.entries(e.series).map(([yr,v])=>[+yr,v])})),{minYear:2021,maxYear:2025,maxY:50});
  $('#trend-controls').hidden=true;
  $('#trend-readout').innerHTML='<span class="eyebrow">GROWTH SINCE 2021</span>'+es.map(e=>`<div class="readout-row"><span>${e.name}<br><small>to ${e.year}</small></span><strong>${fmt((e.value/Object.values(e.series)[0]-1)*100,0)}%</strong></div>`).join('')+'<p>All company workloads. These increases cannot be attributed entirely to AI.</p>';
  $('#trend-note').innerHTML='Company disclosures: <a href="#source-google">Google 2026 report (restated history)</a>, <a href="#source-microsoft">Microsoft 2026 fact sheet</a>, <a href="#source-meta">Meta 2025 index</a>. Microsoft uses fiscal years ending 30 June; the others use calendar years. Meta stops at 2024 because that is the last year verified here. Straight segments connect reported annual totals.';
  $('#trend-data-table').innerHTML='<table><thead><tr><th>Year</th><th>Google · CY</th><th>Microsoft · FY</th><th>Meta · CY</th></tr></thead><tbody>'+[2021,2022,2023,2024,2025].map(y=>`<tr><td>${y}</td>${es.map(e=>`<td>${e.series[y]?fmt(e.series[y],3)+' TWh':'Not in dataset'}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
 }
}
function renderScenario(){
 const gw=+$('#capacity').value,load=+$('#utilization').value/100,isIT=$('#capacity-boundary').value==='it',pue=isIT?+$('#scenario-pue').value:1,twh=gw*load*pue*8.76;
 $('#scenario-pue').disabled=!isIT;$('#capacity-out').textContent=`${gw} GW`;$('#utilization-out').textContent=`${Math.round(load*100)}%`;
 $$('[data-gw]').forEach(b=>{b.classList.toggle('active',+b.dataset.gw===gw);b.setAttribute('aria-pressed',+b.dataset.gw===gw)});
 $('#scenario-twh').textContent=fmt(twh,1);
 $('#scenario-equivalents').innerHTML=`<div class="equivalent"><strong>${fmt(twh/50,1)}×</strong><p>New York City's annual electricity<span>≈50 TWh · rounded reference</span></p></div><div class="equivalent"><strong>${fmt(twh/155,2)}×</strong><p>Today's AI-focused data centres<span>155 TWh · 2025 global estimate</span></p></div><div class="equivalent"><strong>${fmt(twh/DATA.world*100,2)}%</strong><p>of the world's 2025 demand<span>31,772 TWh · fixed baseline</span></p></div>`;
 $('#scenario-formula').textContent=`${gw} GW × ${Math.round(load*100)}% load${isIT?' × '+pue.toFixed(1)+' PUE':''} × 8,760 hours ÷ 1,000 = ${fmt(twh,2)} TWh`;
}
function renderChain(stage='operations'){
 $$('[data-stage]').forEach(b=>{b.classList.toggle('active',b.dataset.stage===stage);b.setAttribute('aria-pressed',b.dataset.stage===stage)});
 const content={
  materials:`<div><span class="eyebrow">UPSTREAM · OUTSIDE THE DATA-CENTRE METER</span><h3>Build the physical world first.</h3><p>Mines, refineries, cement, steel, data-centre buildings and grid connections all require energy. Some is electricity; much is fuel or heat.</p><div class="chain-metric">Unknown <span>AI-attributable TWh</span></div></div><div class="chain-callout"><p>A complete lifecycle estimate needs electricity attributable to AI, production locations, equipment lifetimes and a rule for allocating shared infrastructure.</p><p>Company supply-chain carbon inventories do not establish that electricity total. This atlas leaves the gap visible.</p><a class="text-link" href="#source-microsoft">Example: Microsoft's value-chain reporting ↗</a></div>`,
  chips:`<div><span class="eyebrow">UPSTREAM · MANUFACTURING</span><h3>The factory before the server.</h3><p>Foundries make processors; memory makers and packaging plants complete the hardware. NVIDIA's chips also carry electricity used by its suppliers.</p><div class="chain-metric">≈25.5 <span>TWh · TSMC, 2024</span></div><a class="text-link" href="#source-tsmc">Derived from TSMC's reported energy mix ↗</a></div><div class="chain-callout"><p>This is TSMC's approximate company-wide purchased electricity, serving every customer and application.</p><p><strong>Its AI-only share is not established.</strong> It is a scale reference, not an amount to add wholesale to AI data-centre electricity. Memory, assembly and other manufacturers are additional unallocated stages.</p></div>`,
  operations:`<div><span class="eyebrow">OPERATIONS · INSIDE THE FACILITY METER</span><h3>Training. Inference. Everything around them.</h3><div class="chain-metric">155 <span>TWh · AI-focused facilities, 2025</span></div><p>Accelerators, host servers, storage and internal networking draw electricity. Cooling and power conversion add overhead. Training, research and inference share this infrastructure; no reliable global split is available here.</p><a class="text-link" href="#source-owid">What the AI-focused estimate covers ↗</a></div><div class="pue-demo"><label for="chain-pue">Try a facility efficiency <select id="chain-pue"><option>1.1</option><option selected>1.2</option><option>1.4</option><option>1.6</option></select></label><div class="pue-bar" id="pue-bar" role="img"></div><div id="pue-copy"></div><p>Illustration per 100 units of IT electricity, not a measured global breakdown. PUE = total facility electricity ÷ IT electricity. Cooling and power losses are already inside the facility total.</p></div>`,
  delivery:`<div><span class="eyebrow">DOWNSTREAM · OUTSIDE THE FACILITY METER</span><h3>The answer still has to reach you.</h3><p>Telecom networks carry the response. Laptops, phones and other end-user devices display it—or run AI locally.</p><div class="chain-metric">260–360 <span>TWh · all networks, 2022</span></div><a class="text-link" href="#source-networks">Published network estimate and methodology ↗</a></div><div class="chain-callout"><p>The network estimate covers all data traffic, not just AI, and is an older reference year.</p><p>Neither an AI share of networks nor a global total for AI on end-user devices is established in this dataset. Network electricity does not scale proportionally with bytes transferred.</p></div>`
 };
 $('#chain-detail').innerHTML=content[stage];
 if(stage==='operations'){$('#chain-pue').addEventListener('change',renderPUE);renderPUE()}
}
function renderPUE(){const pue=+$('#chain-pue').value,over=(pue-1)*100;$('#pue-bar').innerHTML=`<span class="it" style="width:${100/pue}%">100 IT</span><span class="overhead" style="width:${(pue-1)/pue*100}%">${Math.round(over)}</span>`;$('#pue-bar').setAttribute('aria-label',`100 units IT plus ${Math.round(over)} overhead equals ${Math.round(pue*100)} facility electricity`);$('#pue-copy').innerHTML=`<p><strong>${Math.round(pue*100)} total</strong> = 100 IT + ${Math.round(over)} cooling & power overhead.<br>Overhead is ${fmt((pue-1)/pue*100,1)}% of the facility total.</p>`}
function renderCompanies(){
 $('#company-cards').innerHTML=['google','microsoft','meta'].map(id=>{const e=get(id),vals=Object.values(e.series),last=vals.at(-1),prev=vals.at(-2),max=Math.max(...vals),pts=vals.map((v,i)=>`${i/(vals.length-1)*280},${65-v/max*60}`).join(' ');return `<article class="company-card"><div class="company-card-top"><h3>${e.name}</h3><span class="badge">Reported</span></div><div class="company-value">${fmt(e.value,1)} <span>TWh</span></div><div class="company-period">${e.year} · COMPANY ELECTRICITY</div><svg class="sparkline" viewBox="0 0 280 75" role="img" aria-label="${e.name} electricity increased from ${fmt(vals[0])} TWh in 2021 to ${fmt(last)} TWh in ${e.year}"><polyline class="spark-line" points="${pts}"/><circle cx="280" cy="${65-last/max*60}" r="3" fill="#61bda5"/></svg><div class="company-change"><span>2021 → ${String(e.year).replace('FY','')}</span><strong>+${fmt((last/prev-1)*100,0)}% vs prior year</strong></div><p>${e.dc?`${fmt(e.dc/e.value*100,1)}% in data centres. `:'Fiscal year ends 30 June. '}AI is not separately disclosed.</p><a class="text-link" href="#source-${e.source}">Source and reporting boundary ↗</a></article>`}).join('');
}
function init(data){
 DATA=data;
 const kinds=[['ai','AI & data centres'],['city','Cities'],['country','Countries'],['company','Companies'],['other','Other players']];
 const opts=kinds.map(([k,label])=>`<optgroup label="${label}">${DATA.entities.filter(e=>e.kind===k).map(e=>`<option value="${e.id}">${esc(e.name)} · ${esc(e.year)}</option>`).join('')}</optgroup>`).join('');
 $('#comparison-a').innerHTML=opts;$('#comparison-b').innerHTML=opts;$('#comparison-a').value='ai';$('#comparison-b').value='shanghai';
 $('#source-list').innerHTML=DATA.sources.map((s,i)=>`<details id="source-${s.id}"><summary><span><span class="small-label">${String(i+1).padStart(2,'0')} / </span>${esc(s.title)}</span></summary><p>${esc(s.detail)}</p>${s.license?`<p>Source licence: ${esc(s.license)}.</p>`:''}<a href="${esc(s.url)}" target="_blank" rel="noopener">Open original source ↗</a></details>`).join('');
 $$('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;expanded=false;renderRanking()}));
 $('#show-more').addEventListener('click',()=>{expanded=!expanded;renderRanking()});
 $('#unit').addEventListener('change',()=>{unit=$('#unit').value;renderRanking();renderComparison()});
 ['comparison-a','comparison-b'].forEach(id=>$('#'+id).addEventListener('change',()=>{renderComparison();renderRanking()}));
 $$('[data-trend]').forEach(b=>b.addEventListener('click',()=>{trend=b.dataset.trend;renderTrend()}));$('#trend-year').addEventListener('input',renderTrend);
 ['capacity','utilization'].forEach(id=>$('#'+id).addEventListener('input',renderScenario));['capacity-boundary','scenario-pue'].forEach(id=>$('#'+id).addEventListener('change',renderScenario));
 $$('[data-gw]').forEach(b=>b.addEventListener('click',()=>{$('#capacity').value=b.dataset.gw;renderScenario()}));
 $$('[data-scenario-preset]').forEach(b=>b.addEventListener('click',()=>{$('#capacity').value=b.dataset.scenarioPreset;renderScenario();$('#scenario').scrollIntoView({behavior:'smooth'});$('#capacity').focus({preventScroll:true})}));
 $$('[data-stage]').forEach(b=>b.addEventListener('click',()=>renderChain(b.dataset.stage)));
 function revealSource(){if(location.hash.startsWith('#source-')){const el=document.getElementById(location.hash.slice(1));if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}}}
 window.addEventListener('hashchange',revealSource);
 renderRanking();renderComparison();renderTrend();renderScenario();renderChain();renderCompanies();revealSource();
}
fetch('data.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json()}).then(init).catch(()=>{$('#ranking').innerHTML='<p class="error-message">The dataset could not load. Please reload the page, or <a href="data.csv">download the data</a>.</p>'});
