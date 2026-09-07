(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  const selector = $('agentcount');
  if (selector) {
    const existing = Array.from(selector.options).map(o => o.textContent);
    for (let n = 51; n <= 70; n++) {
      if (!existing.includes(n + ' agents')) {
        const opt = document.createElement('option'); opt.textContent = n + ' agents'; selector.appendChild(opt);
      }
    }
  }

  const nav = document.querySelector('.tabbar');
  if (nav && !$('pg-mining')) {
    const btn = document.createElement('button'); btn.dataset.pg='mining'; btn.textContent='⛏ Mining';
    btn.onclick=function(){ document.querySelectorAll('.tabbar button').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); btn.classList.add('active'); $('pg-mining').classList.add('active'); };
    nav.appendChild(btn);
    const page=document.createElement('div'); page.className='page'; page.id='pg-mining';
    page.innerHTML=`
      <div class="card"><h2 style="color:var(--orange)">⛏ Gold Mining</h2>
        <p class="hint">Gold earnings are displayed and transferred in <b>Canadian dollars (CAD)</b>.</p>
        <div class="grid2" style="margin-top:10px"><div class="stat"><b class="s-orange">10</b>Agents 51–60</div><div class="stat"><b class="s-orange">CAD</b>Transfer currency</div></div>
        <div class="stat" style="margin-top:10px"><b class="s-orange" id="pr-gold-cad-value">$0.00 CAD</b>Available Gold Transfer Value</div>
        <p class="hint">The amount shown here is the maximum transferable amount from verified, cleared Gold revenue.</p>
      </div>
      <div class="card"><h2 style="color:var(--cyan)">₿ Bitcoin Mining</h2>
        <p class="hint">Bitcoin earnings remain <b>BTC</b> and can be transferred directly to your digital wallet.</p>
        <div class="grid2" style="margin-top:10px"><div class="stat"><b class="s-cyan">10</b>Agents 61–70</div><div class="stat"><b class="s-cyan">BTC</b>Wallet transfer</div></div>
        <div class="stat" style="margin-top:10px"><b class="s-cyan" id="pr-btc-value">0 BTC</b>Available Bitcoin Transfer</div>
        <p class="hint">Only verified, cleared BTC can be transferred. No BTC is invented by the app.</p>
      </div>
      <div class="card"><h3 style="color:var(--pink)">Agent Roster: 51–70</h3><div id="extra-agent-roster"></div></div>`;
    document.body.insertBefore(page,nav);
    const roster=$('extra-agent-roster');
    for(let n=51;n<=70;n++){ const row=document.createElement('div'); row.className='log-item'; row.innerHTML='<div><b>Agent '+String(n).padStart(2,'0')+'</b><div style="font-size:.85em;color:#888">'+(n<=60?'Gold Mining':'Bitcoin Mining')+'</div></div><div style="color:#777">Awaiting verified source</div>'; roster.appendChild(row); }
  }

  if(nav && !$('pg-payouts')) {
    const btn=document.createElement('button'); btn.dataset.pg='payouts'; btn.textContent='💳 Payouts';
    btn.onclick=function(){ document.querySelectorAll('.tabbar button').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); btn.classList.add('active'); $('pg-payouts').classList.add('active'); };
    nav.appendChild(btn);
    const page=document.createElement('div'); page.className='page'; page.id='pg-payouts';
    page.innerHTML=`<div class="card"><h2 style="color:var(--pink)">💳 Payout Center</h2>
      <p class="hint">Select what you are transferring. <b>Gold → CAD</b>. <b>Bitcoin → BTC wallet.</b> Other verified revenue can use PayPal or Bank.</p>
      <select id="pr-payout-source"><option value="gold">Gold Mining → CAD</option><option value="bitcoin">Bitcoin Mining → BTC Wallet</option><option value="other">Other Earnings → PayPal / Bank</option></select>
      <div id="pr-source-fields"></div><input type="number" id="pr-payout-amount" min="0.01" step="0.01" placeholder="Transfer amount" />
      <button class="btn btn-pink" id="pr-payout-request">Request Transfer</button><p class="hint" id="pr-payout-status">No transfer request submitted.</p></div>
      <div class="card"><h3 style="color:var(--cyan)">Transfer History</h3><div id="pr-payout-history"><p class="hint">No transfers yet.</p></div></div>`;
    document.body.insertBefore(page,nav);
    const source=$('pr-payout-source'), fields=$('pr-source-fields');
    function renderSource(){
      if(source.value==='gold') fields.innerHTML='<div class="stat"><b class="s-orange">CAD $</b>Gold transfer currency</div><input id="pr-gold-destination" placeholder="Canadian bank / CAD payout destination" autocomplete="off" />';
      else if(source.value==='bitcoin') fields.innerHTML='<div class="stat"><b class="s-cyan">BTC</b>Direct wallet transfer</div><input id="pr-btc-network" placeholder="Bitcoin network" value="Bitcoin" /><input id="pr-btc-address" placeholder="Bitcoin wallet address" autocomplete="off" />';
      else fields.innerHTML='<select id="pr-other-method"><option value="paypal">PayPal</option><option value="bank">Bank</option></select><input id="pr-other-destination" placeholder="Verified payout destination" autocomplete="off" />';
    }
    source.addEventListener('change',renderSource); renderSource();
    const payoutKey='phoenix_payouts';
    function renderHistory(){ const list=JSON.parse(localStorage.getItem(payoutKey)||'[]'), box=$('pr-payout-history'); if(!list.length){box.innerHTML='<p class="hint">No transfers yet.</p>';return;} box.innerHTML=list.slice().reverse().map(x=>'<div class="log-item"><div><b>'+x.amount+' '+x.currency+'</b> · '+x.source+'<div style="font-size:.8em;color:#888">'+x.destination+'</div></div><div style="color:#ff9e00">REQUESTED</div></div>').join(''); }
    $('pr-payout-request').onclick=function(){
      const amount=Number($('pr-payout-amount').value); if(!Number.isFinite(amount)||amount<=0){alert('Enter a valid transfer amount.');return;}
      let currency='', destination='', sourceName=source.value;
      if(sourceName==='gold'){currency='CAD'; destination=($('pr-gold-destination')||{}).value||'';}
      else if(sourceName==='bitcoin'){currency='BTC'; destination=($('pr-btc-address')||{}).value||'';}
      else {currency='USD'; destination=($('pr-other-destination')||{}).value||'';}
      if(!destination.trim()){alert('Enter the transfer destination.');return;}
      const list=JSON.parse(localStorage.getItem(payoutKey)||'[]'); list.push({amount:+amount.toFixed(8),currency,source:sourceName,destination:destination.trim(),date:new Date().toISOString(),status:'requested'}); localStorage.setItem(payoutKey,JSON.stringify(list));
      $('pr-payout-status').textContent='Transfer request recorded. It will only be marked completed after the connected provider confirms the transfer.'; $('pr-payout-amount').value=''; renderHistory();
    }; renderHistory();
  }

  if(!$('pr-install-card')){ const card=document.createElement('div'); card.className='card'; card.id='pr-install-card'; card.style.cssText='max-width:500px;margin:14px auto;padding:16px;background:var(--card);border:1px solid #222;border-radius:14px;box-shadow:0 0 12px rgba(0,240,255,.08)'; card.innerHTML='<h3 style="color:var(--cyan)">📲 Phoenix Rises Android</h3><p class="hint">Download the official APK here when the signed build is published.</p><button class="btn btn-cyan" id="pr-download-apk" disabled>APK BUILD NOT PUBLISHED YET</button><p class="hint">The button activates only when a real APK is available.</p>'; document.body.appendChild(card); }

  let running=localStorage.getItem('pr_running')==='1', startMs=Number(localStorage.getItem('pr_start_ms')||0), interval=null, originalBtn=$('startbtn');
  function fmt2(s){s=Math.max(0,Math.floor(s));return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function tick(){if(!running||!startMs)return;const sec=Math.floor((Date.now()-startMs)/1000);localStorage.setItem('pr_tsec',String(sec));if($('timer'))$('timer').textContent=fmt2(sec);}
  function setButton(){if(originalBtn)originalBtn.textContent=running?'⏹ STOP SESSION':'▶ START SESSION';}
  window.toggleTimer=function(){if(running){const sec=Math.max(0,Math.floor((Date.now()-startMs)/1000));running=false;localStorage.setItem('pr_running','0');localStorage.removeItem('pr_start_ms');if(interval)clearInterval(interval);interval=null;if(sec>5&&window.S&&Array.isArray(S.sessions)){const agents=selector?selector.value:'50 agents';S.sessions.push({dur:sec,agents:agents,date:new Date().toLocaleString()});localStorage.setItem('pr_tsec','0');if(typeof save==='function')save();}if($('timer'))$('timer').textContent='00:00:00';setButton();if(typeof toast==='function')toast('✅ Session stopped and saved.');}else{running=true;startMs=Date.now();localStorage.setItem('pr_running','1');localStorage.setItem('pr_start_ms',String(startMs));tick();if(interval)clearInterval(interval);interval=setInterval(tick,1000);setButton();if(typeof toast==='function')toast('▶ Session running until you press STOP.');}};
  if(running&&startMs){tick();setButton();interval=setInterval(tick,1000);} document.addEventListener('visibilitychange',tick); window.addEventListener('pageshow',tick);
})();