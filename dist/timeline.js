// Playback, scrubbing and scenario comparison. GPT-6 / Codex, September 2026.
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const M = PowerTimelineMath;
  const number = (n, digits = 1) => n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  let ready = false, data, mode = 'labs', year = 2026, playing = false, frame = 0, last = 0, drawn = 0;
  let plot, settings;
  const limits = () => mode === 'labs' ? [2026, 2028] : [2025, 2030];
  const readSettings = () => ({ labs: +$('#time-labs').value, load: +$('#time-load').value, pue: +$('#time-pue').value, boundary: $('#time-boundary').value });
  function drawChart() {
    const mobile = matchMedia('(max-width:760px)').matches;
    const W = mobile ? 360 : 760, H = mobile ? 275 : 350, L = 44, R = 24, T = 35, B = 38;
    const maximum = M.lab(2028, settings);
    const ceiling = Math.max(1000, Math.ceil(maximum / 500) * 500);
    const x = year => L + (year - 2025) / 5 * (W - L - R);
    const y = value => H - B - value / ceiling * (H - T - B);
    plot = { x, y, H, L, B, W, R };
    const values = (from, to, fn) => Array.from({ length: Math.round((to - from) * 60) + 1 }, (_, i) => {
      const year = from + i / 60;
      return `${x(year).toFixed(2)},${y(fn(year)).toFixed(2)}`;
    }).join(' ');
    const iea = values(2025, 2030, M.iea), labs = values(2026, 2028, year => M.lab(year, settings));
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="time-svg-title time-svg-desc"><title id="time-svg-title">Two electricity paths, 2025 to 2030</title><desc id="time-svg-desc">IEA global AI-focused electricity grows from 155 to 465 TWh. The conditional lab scenario covers only end-2026 to end-2028 and depends on the controls below. Dashed segments illustrate interpolation. Exact anchor values are in the data table.</desc><defs><clipPath id="time-reveal"><rect id="time-clip" x="${L}" y="0" width="0" height="${H}"/></clipPath></defs><text x="${L}" y="16">TWh / year</text>`;
    for (let tick = 0; tick <= ceiling; tick += ceiling / 4) {
      svg += `<line x1="${L}" x2="${W-R}" y1="${y(tick)}" y2="${y(tick)}" stroke="#2a3d41"/><text x="${L-8}" y="${y(tick)+4}" text-anchor="end">${Math.round(tick)}</text>`;
    }
    for (let year = 2025; year <= 2030; year++) svg += `<text x="${x(year)}" y="${H-12}" text-anchor="middle">${year}</text>`;
    svg += `<polyline points="${iea}" stroke="#d7f878" opacity=".18" fill="none" stroke-width="2" stroke-dasharray="5 5"/><polyline points="${labs}" stroke="#efa56f" opacity=".2" fill="none" stroke-width="2" stroke-dasharray="5 5"/><g clip-path="url(#time-reveal)"><polyline points="${iea}" stroke="#d7f878" fill="none" stroke-width="2.8" stroke-dasharray="5 5"/><polyline points="${labs}" stroke="#efa56f" fill="none" stroke-width="2.8" stroke-dasharray="5 5"/></g>`;
    [[2025,155],[2030,465]].forEach(([year,value]) => svg += `<circle cx="${x(year)}" cy="${y(value)}" r="3.5" stroke="#d7f878" fill="#102125"/>`);
    [2026,2027,2028].forEach(year => svg += `<circle cx="${x(year)}" cy="${y(M.lab(year,settings))}" r="3.5" stroke="#efa56f" fill="#102125"/>`);
    svg += `<line id="time-cursor" x1="${L}" x2="${L}" y1="${T}" y2="${H-B}" stroke="#80928d" stroke-dasharray="3 5"/><circle id="time-iea-dot" r="5" fill="#d7f878" stroke="#102125" stroke-width="2"/><circle id="time-lab-dot" r="5" fill="#efa56f" stroke="#102125" stroke-width="2"/></svg>`;
    $('#time-chart').innerHTML = svg;
    $('#time-table').innerHTML = '<table><thead><tr><th>Anchor year</th><th>IEA global AI</th><th>GW per lab</th><th>Lab scenario run rate</th></tr></thead><tbody>' + [2025,2026,2027,2028,2029,2030].map(year => `<tr><td>${year}</td><td>${number(M.iea(year))} TWh${year===2025?' · estimate':year===2030?' · base case':' · illustration'}</td><td>${M.capacity(year) === null ? '—' : number(M.capacity(year),0)+' GW'}</td><td>${M.lab(year,settings) === null ? 'Not extrapolated' : number(M.lab(year,settings))+' TWh · '+settings.labs+' lab'+(settings.labs===1?'':'s')}</td></tr>`).join('')+'</tbody></table>';
  }
  function render() {
    const labs = M.lab(year, settings), iea = M.iea(year), value = mode === 'labs' ? labs : iea;
    const anchor = Math.abs(year - Math.round(year)) < .009;
    const label = anchor ? String(Math.round(year)) : `${Math.floor(year)} → ${Math.ceil(year)}`;
    $('#time-date').textContent = label;
    $('#time-date').style.fontSize = anchor ? '' : '30px';
    $('#time-period').textContent = mode==='labs' ? (anchor?'YEAR-END CAPACITY · FULL-YEAR RUN RATE':'BETWEEN YEAR-END ANCHORS · ILLUSTRATION') : (anchor && year===2025?'ANNUAL ELECTRICITY · IEA ESTIMATE':anchor && year===2030?'ANNUAL ELECTRICITY · IEA BASE CASE':'INTERMEDIATE PATH · ILLUSTRATION');
    $('#time-total').textContent = number(value);
    $('#time-scope').textContent = mode==='labs' ? `${settings.labs===1?'One lab':'Two labs'} · ${number(M.capacity(year))} GW per lab` : 'All AI-focused data centres worldwide';
    $('#time-evidence').textContent = mode==='labs' ? 'CONDITIONAL SCENARIO' : anchor && year===2025 ? '2025 ESTIMATE' : anchor && year===2030 ? '2030 BASE CASE' : 'ILLUSTRATED IEA PATH';
    $('#time-city').textContent = number(value/50)+'×';
    $('#time-world').textContent = number(value/data.world*100,2)+'%';
    const squares = value/50;
    all('#time-city-grid i').forEach((tile,i)=>tile.style.setProperty('--fill',`${M.clamp(squares-i,0,1)*100}%`));
    $('#time-city-grid').setAttribute('aria-label',`${number(squares)} times New York City's approximate annual electricity. Each square equals 50 TWh. This is a fixed present-day reference.`);
    $('#time-year').value = year;
    $('#time-year').setAttribute('aria-valuetext',`${label}, ${number(value)} terawatt hours per year`);
    all('[data-time-year]').forEach(b=>b.classList.toggle('active',Math.abs(+b.dataset.timeYear-year)<.03));
    $('#time-clip').setAttribute('width',plot.x(year)-plot.L);
    $('#time-cursor').setAttribute('x1',plot.x(year)); $('#time-cursor').setAttribute('x2',plot.x(year));
    $('#time-iea-dot').setAttribute('cx',plot.x(year)); $('#time-iea-dot').setAttribute('cy',plot.y(iea));
    $('#time-lab-dot').style.display = labs===null ? 'none' : '';
    if (labs!==null) { $('#time-lab-dot').setAttribute('cx',plot.x(year)); $('#time-lab-dot').setAttribute('cy',plot.y(labs)); }
    $('#time-context').innerHTML = mode==='labs'
      ? `<strong>${number(M.capacity(year))} GW per lab × ${settings.labs} ${settings.labs===1?'lab':'labs'}</strong> would mean ${number(value)} TWh/year at these settings—${number(value/iea)}× the illustrated IEA global AI path at this point.`
      : `<strong>${number(iea)} TWh/year</strong> is ${number(iea/155)}× the 2025 AI-focused estimate. ${labs===null?'The lab scenario has no anchor here and is not extrapolated.':'At this point, the lab scenario would be '+number(labs)+' TWh/year under the selected assumptions.'}`;
  }
  function pause(announce = true) {
    playing = false; cancelAnimationFrame(frame); last = 0;
    $('#time-play').textContent = year>=limits()[1] ? '↺ Replay' : '▶ Play';
    $('#time-play').setAttribute('aria-label',year>=limits()[1]?'Replay timeline':'Play timeline');
    $('#time-play').setAttribute('aria-pressed','false');
    if (announce) $('#time-announcement').textContent = `Paused at ${$('#time-date').textContent}: ${$('#time-total').textContent} terawatt hours per year.`;
  }
  function tick(now) {
    if (!playing) return;
    if (!last) last = now;
    const delta = Math.min(now-last,100); last = now;
    const [start,end] = limits();
    year = Math.min(end,year+delta/12000*(end-start)*+$('#time-speed').value);
    if (now-drawn>=32 || year===end) { render(); drawn=now; }
    if (year>=end) pause(); else frame=requestAnimationFrame(tick);
  }
  function configure() {
    settings=readSettings(); $('#time-pue').disabled=settings.boundary==='facility';
    $('.time-panel').dataset.mode=mode;
    $('#time-settings').hidden=mode!=='labs';
    const [start,end]=limits(); year=M.clamp(year,start,end);
    $('#time-year').min=start; $('#time-year').max=end;
    all('[data-time-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.timeMode===mode);b.setAttribute('aria-pressed',b.dataset.timeMode===mode)});
    $('#time-year-buttons').innerHTML=Array.from({length:end-start+1},(_,i)=>`<button data-time-year="${start+i}" aria-label="Jump to ${start+i}">${start+i}</button>`).join('');
    all('[data-time-year]').forEach(b=>b.addEventListener('click',()=>{pause(false);year=+b.dataset.timeYear;render();pause()}));
    $('#time-assumptions').textContent=`Orange path: ${settings.labs} lab${settings.labs===1?'':'s'} × GW per lab × ${Math.round(settings.load*100)}% electrical load${settings.boundary==='it'?' × '+settings.pue.toFixed(1)+' PUE':''} × 8,760 hours ÷ 1,000. ${settings.boundary==='it'?'GW assumed to be IT capacity.':'GW assumed to include the whole facility; no extra cooling factor.'}`;
    drawChart();render();pause(false);
  }
  function init(atlas) {
    if (ready) return; ready=true;data=atlas;
    $('#time-city-grid').innerHTML=Array.from({length:40},()=>'<i aria-hidden="true"></i>').join('');
    all('[data-time-mode]').forEach(b=>b.addEventListener('click',()=>{pause(false);mode=b.dataset.timeMode;year=limits()[0];configure()}));
    ['labs','load','pue','boundary'].forEach(id=>$('#time-'+id).addEventListener('change',()=>{pause(false);configure()}));
    $('#time-year').addEventListener('input',()=>{pause(false);year=+$('#time-year').value;render()});
    $('#time-year').addEventListener('change',()=>pause());
    $('#time-play').addEventListener('click',()=>{
      if(playing){pause();return;}
      if(year>=limits()[1])year=limits()[0];
      playing=true;last=0;render();$('#time-play').textContent='Ⅱ Pause';$('#time-play').setAttribute('aria-label','Pause timeline');$('#time-play').setAttribute('aria-pressed','true');
      $('#time-announcement').textContent='Timeline playing. Press pause or use the year slider to stop.';
      frame=requestAnimationFrame(tick);
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(false)});
    const responsive=matchMedia('(max-width:760px)');responsive.addEventListener('change',()=>{drawChart();render()});
    const reduced=matchMedia('(prefers-reduced-motion:reduce)');
    if(reduced.matches)$('#time-play').title='Animation starts only when you press play; the year buttons provide a motion-free alternative.';
    configure();
  }
  document.addEventListener('atlas-ready',event=>init(event.detail));
  if(window.PowerAtlasData)init(window.PowerAtlasData);
})();
