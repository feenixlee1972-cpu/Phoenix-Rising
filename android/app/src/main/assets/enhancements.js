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

  // Add a dedicated payout setup/request page. It collects routing details locally,
  // but never claims that money was sent until a real payout backend confirms it.
  if (nav && !$('pg-payouts')) {
    const btn = document.createElement('button');
    btn.dataset.pg = 'payouts';
    btn.textContent = '💳 Payouts';
    btn.onclick = function(){
      document.querySelectorAll('.tabbar button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      $('pg-payouts').classList.add('active');
    };
    nav.appendChild(btn);

    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'pg-payouts';
    page.innerHTML = `
      <div class="card">
        <h2 style="color:var(--pink)">💳 Payout Center</h2>
        <p class="hint">Choose where a verified, available balance should be paid. These settings are saved on this device. A payout is only marked sent after a connected payment provider confirms it.</p>
        <select id="pr-payout-method">
          <option value="paypal">PayPal</option>
          <option value="bank">Bank</option>
          <option value="wallet">Digital Wallet</option>
        </select>
        <div id="pr-payout-fields"></div>
        <input type="number" id="pr-payout-amount" min="0.01" step="0.01" placeholder="Payout amount ($)" />
        <button class="btn btn-pink" id="pr-payout-request">Request Payout</button>
        <p class="hint" id="pr-payout-status">No payout request submitted.</p>
      </div>
      <div class="card">
        <h3 style="color:var(--cyan)">Payout History</h3>
        <div id="pr-payout-history"><p class="hint">No payout requests yet.</p></div>
      </div>`;
    document.body.insertBefore(page, nav);

    const method = $('pr-payout-method');
    const fields = $('pr-payout-fields');
    const renderFields = function(){
      const m=method.value;
      if(m==='paypal') fields.innerHTML='<input id="pr-paypal-email" type="email" placeholder="PayPal email" autocomplete="email" />';
      else if(m==='bank') fields.innerHTML='<input id="pr-bank-name" placeholder="Account holder name" autocomplete="name" /><input id="pr-bank-account" placeholder="Account / IBAN" autocomplete="off" /><input id="pr-bank-routing" placeholder="Routing / transit number" autocomplete="off" />';
      else fields.innerHTML='<input id="pr-wallet-network" placeholder="Wallet network (e.g. BTC)" /><input id="pr-wallet-address" placeholder="Digital wallet address" autocomplete="off" />';
    };
    method.addEventListener('change',renderFields);
    renderFields();

    const payoutKey='phoenix_payouts';
    const renderHistory=function(){
      const list=JSON.parse(localStorage.getItem(payoutKey)||'[]');
      const box=$('pr-payout-history');
      if(!list.length){box.innerHTML='<p class="hint">No payout requests yet.</p>';return;}
      box.innerHTML=list.slice().reverse().map(x=>'<div class="log-item"><div><b>$'+Number(x.amount).toFixed(2)+'</b> · '+x.method+'<div style="font-size:.8em;color:#888">'+x.destination+'</div></div><div style="color:#ff9e00">REQUESTED</div></div>').join('');
    };
    $('pr-payout-request').onclick=function(){
      const amount=Number($('pr-payout-amount').value);
      if(!Number.isFinite(amount)||amount<=0){alert('Enter a valid payout amount.');return;}
      let destination='';
      if(method.value==='paypal') destination=($('pr-paypal-email')||{}).value||'';
      if(method.value==='bank') destination=($('pr-bank-account')||{}).value||'';
      if(method.value==='wallet') destination=($('pr-wallet-address')||{}).value||'';
      if(!destination.trim()){alert('Enter the payout destination.');return;}
      const list=JSON.parse(localStorage.getItem(payoutKey)||'[]');
      list.push({amount:+amount.toFixed(2),method:method.value,destination:destination.trim(),date:new Date().toISOString(),status:'requested'});
      localStorage.setItem(payoutKey,JSON.stringify(list));
      $('pr-payout-status').textContent='Payout request recorded locally. It is NOT marked paid until a real provider confirms the transfer.';
      $('pr-payout-amount').value='';
      renderHistory();
    };
    renderHistory();
  }

  // Add an Android-friendly app download/install card when the web build is opened.
  if(!$('pr-install-card')){
    const card=document.createElement('div');
    card.className='card';
    card.id='pr-install-card';
    card.style.cssText='max-width:500px;margin:14px auto;padding:16px;background:var(--card);border:1px solid #222;border-radius:14px;box-shadow:0 0 12px rgba(0,240,255,.08)';
    card.innerHTML='<h3 style="color:var(--cyan)">📲 Phoenix Rises Android</h3><p class="hint">Use the official APK download when a signed build is published. Android may ask you to allow installation from this source.</p><button class="btn btn-cyan" id="pr-download-apk" disabled>APK BUILD NOT PUBLISHED YET</button><p class="hint">The download button will be enabled only when a real APK file is available.</p>';
    document.body.appendChild(card);
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

  if(running && startMs){
    tick();
    setButton();
    interval=setInterval(tick,1000);
  }
  document.addEventListener('visibilitychange',tick);
  window.addEventListener('pageshow',tick);
})();
