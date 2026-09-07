(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  // Expand the agent selector from 50 to 70 without changing the existing design.
  const selector = $('agentcount');
  if (selector) {
    const existing = Array.from(selector.options).map(o => o.textContent);
    for (let n = 51; n <= 70; n++) {
      if (!existing.includes(n + ' agents')) {
        const opt = document.createElement('option');
        opt.textContent = n + ' agents';
        selector.appendChild(opt);
      }
    }
  }

  // Add a Mining section using the same Phoenix Rising visual language.
  const nav = document.querySelector('.tabbar');
  if (nav && !$('pg-mining')) {
    const btn = document.createElement('button');
    btn.dataset.pg = 'mining';
    btn.textContent = '⛏ Mining';
    btn.onclick = function(){
      document.querySelectorAll('.tabbar button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      $('pg-mining').classList.add('active');
    };
    nav.appendChild(btn);

    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'pg-mining';
    page.innerHTML = `
      <div class="card">
        <h2 style="color:var(--orange)">⛏ Gold Mining</h2>
        <p class="hint">Gold Mining is a real-work module, not a fake balance generator. Connect a verified mining operation or approved revenue source before any earnings can become withdrawable.</p>
        <div class="grid2" style="margin-top:10px">
          <div class="stat"><b class="s-orange">10</b>Agents 51–60</div>
          <div class="stat"><b class="s-orange">OFFLINE</b>Verified source required</div>
        </div>
        <button class="btn btn-cyan" onclick="alert('Gold Mining is ready for a verified provider/device connection. No earnings are created until a real source is connected.')">Configure Verified Source</button>
      </div>
      <div class="card">
        <h2 style="color:var(--cyan)">₿ Bitcoin Mining</h2>
        <p class="hint">Bitcoin Mining uses the same rule: no invented BTC or dollar earnings. A real mining device/pool connection must report verified work and payouts.</p>
        <div class="grid2" style="margin-top:10px">
          <div class="stat"><b class="s-cyan">10</b>Agents 61–70</div>
          <div class="stat"><b class="s-cyan">OFFLINE</b>Verified source required</div>
        </div>
        <button class="btn btn-green" onclick="alert('Bitcoin Mining is ready for a verified pool/device connection. No earnings are created until a real source is connected.')">Configure Verified Source</button>
      </div>
      <div class="card">
        <h3 style="color:var(--pink)">Agent Roster: 51–70</h3>
        <div id="extra-agent-roster"></div>
      </div>`;
    document.body.insertBefore(page, nav);
    const roster = $('extra-agent-roster');
    for(let n=51;n<=70;n++){
      const row=document.createElement('div');
      row.className='log-item';
      row.innerHTML='<div><b>Agent '+String(n).padStart(2,'0')+'</b><div style="font-size:.85em;color:#888">'+(n<=60?'Gold Mining':'Bitcoin Mining')+'</div></div><div style="color:#777">Awaiting verified source</div>';
      roster.appendChild(row);
    }
  }

  // Make the session timer survive backgrounding/process suspension by using a timestamp.
  // It continues until the user explicitly presses STOP.
  let running = localStorage.getItem('pr_running') === '1';
  let startMs = Number(localStorage.getItem('pr_start_ms') || 0);
  let interval = null;
  const originalBtn = $('startbtn');

  function fmt2(s){
    s=Math.max(0,Math.floor(s));
    return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }
  function tick(){
    if(!running || !startMs) return;
    const sec=Math.floor((Date.now()-startMs)/1000);
    localStorage.setItem('pr_tsec',String(sec));
    if($('timer')) $('timer').textContent=fmt2(sec);
  }
  function setButton(){ if(originalBtn) originalBtn.textContent=running?'⏹ STOP SESSION':'▶ START SESSION'; }

  window.toggleTimer=function(){
    if(running){
      const sec=Math.max(0,Math.floor((Date.now()-startMs)/1000));
      running=false;
      localStorage.setItem('pr_running','0');
      localStorage.removeItem('pr_start_ms');
      if(interval) clearInterval(interval);
      interval=null;
      if(sec>5 && window.S && Array.isArray(S.sessions)){
        const agents=selector ? selector.value : '50 agents';
        S.sessions.push({dur:sec,agents:agents,date:new Date().toLocaleString()});
        localStorage.setItem('pr_tsec','0');
        if(typeof save==='function') save();
      }
      if($('timer')) $('timer').textContent='00:00:00';
      setButton();
      if(typeof toast==='function') toast('✅ Session stopped and saved.');
    } else {
      running=true;
      startMs=Date.now();
      localStorage.setItem('pr_running','1');
      localStorage.setItem('pr_start_ms',String(startMs));
      tick();
      if(interval) clearInterval(interval);
      interval=setInterval(tick,1000);
      setButton();
      if(typeof toast==='function') toast('▶ Session running until you press STOP.');
    }
  };

  // Restore a session after the app returns from background or is reopened.
  if(running && startMs){
    tick();
    setButton();
    interval=setInterval(tick,1000);
  }
  document.addEventListener('visibilitychange',tick);
  window.addEventListener('pageshow',tick);
})();
