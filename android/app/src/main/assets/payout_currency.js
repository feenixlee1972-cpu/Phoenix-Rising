(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const currencyKey='phoenix_payout_currency';
  const stored=localStorage.getItem(currencyKey)||'CAD';

  function addCurrencyUI(){
    if($('pr-currency-card')) return;
    const nav=document.querySelector('.tabbar');
    if(!nav) return;
    const card=document.createElement('div');
    card.className='card'; card.id='pr-currency-card';
    card.style.cssText='max-width:500px;margin:14px auto;padding:16px;background:var(--card);border:1px solid #222;border-radius:14px;box-shadow:0 0 12px rgba(0,240,255,.08)';
    card.innerHTML='<h3 style="color:var(--orange)">💱 Transfer Currency</h3><p class="hint">Choose the currency you want displayed for your transferable balance and payout amount.</p><select id="pr-currency"><option value="CAD">Canadian dollars (CAD)</option><option value="USD">U.S. dollars (USD)</option></select><p class="hint" id="pr-currency-note">Your payout amount will be shown in the selected currency. Final conversion and provider fees are confirmed by the payment provider.</p>';
    document.body.appendChild(card);
    const sel=$('pr-currency'); sel.value=stored;
    sel.addEventListener('change',()=>{localStorage.setItem(currencyKey,sel.value); updatePayoutCurrency();});
  }

  function updatePayoutCurrency(){
    const cur=localStorage.getItem(currencyKey)||'CAD';
    const amount=$('pr-payout-amount');
    if(amount) amount.placeholder='Payout amount ('+cur+')';
    const note=$('pr-currency-note');
    if(note) note.textContent='Payout amount and transferable balance are displayed in '+(cur==='CAD'?'Canadian dollars (CAD)':'U.S. dollars (USD)')+'. Final conversion, availability and provider fees are confirmed by the connected payment provider.';
    document.querySelectorAll('[data-transfer-currency]').forEach(el=>el.textContent=cur);
  }

  function addMiningPrices(){
    const mining=$('pg-mining');
    if(!mining || $('pr-market-card')) return;
    const card=document.createElement('div');
    card.className='card'; card.id='pr-market-card';
    card.innerHTML='<h3 style="color:var(--cyan)">📈 Mining Market Prices</h3><div class="grid2"><div class="stat"><b class="s-orange" id="pr-gold-price">Live provider required</b>Gold price / oz</div><div class="stat"><b class="s-cyan" id="pr-btc-price">Live provider required</b>Bitcoin price</div></div><p class="hint" style="margin-top:10px">Prices are informational until a verified market-data source is connected. The app will not invent a mining balance or payout value. Transferable amount is the cleared balance, not the displayed market price.</p>';
    mining.appendChild(card);
  }

  function enhancePayouts(){
    const page=$('pg-payouts'); if(!page) return;
    const method=$('pr-payout-method'); if(!method) return;
    if($('pr-paypal-note')) return;
    const note=document.createElement('p'); note.id='pr-paypal-note'; note.className='hint';
    note.textContent='PayPal: the recipient email must belong to the PayPal account that should receive the payment. Live payouts require a connected PayPal Payouts backend and provider confirmation.';
    page.querySelector('#pr-payout-fields').after(note);
    method.addEventListener('change',()=>{
      note.textContent=method.value==='paypal'?'PayPal: send to the email attached to your personal PayPal account. The app will show SUCCESS only after PayPal confirms the payout.':method.value==='bank'?'Bank: send to the verified bank destination. The app will show SUCCESS only after the connected bank-transfer provider confirms the transfer.':'Wallet: send to the exact verified network/address. The app will show SUCCESS only after the connected wallet/payment provider confirms the transfer.';
    });
  }

  function init(){addCurrencyUI();addMiningPrices();enhancePayouts();updatePayoutCurrency();}
  setTimeout(init,100); setTimeout(init,700); setTimeout(init,1500);
})();
