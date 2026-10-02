let S = null;
const $ = (s) => document.querySelector(s);
const money = (n) => Number(n || 0).toFixed(2);
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path, opts={}) {
  const r = await fetch(path, opts);
  const j = await r.json();
  if(!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
function toast(msg){
  const el=$('#toast'); el.textContent=msg; el.style.display='block';
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>{el.textContent='';el.style.display='none'},3500);
}
function render(){
  $('#balance').textContent=money(S.balance);
  const q=($('#search').value||'').toLowerCase();
  $('#games').innerHTML=S.games.filter(g=>(g.name+' '+g.category+' '+g.provider).toLowerCase().includes(q)).map(g=>`
    <article class="game">
      <div class="cover">${esc(g.icon)}</div>
      <div class="game-body">
        <h3>${esc(g.name)}</h3>
        <div class="meta"><span class="tag">${esc(g.provider.toUpperCase())}</span><span class="tag">${esc(g.category)}</span><span class="tag">${esc(g.status)}</span></div>
        <button class="launch" onclick="launch('${esc(g.id)}')">Open game</button>
      </div>
    </article>`).join('');
  $('#providersList').innerHTML=S.providers.map(p=>`<div class="provider"><h3>${esc(p.name)}</h3><p>${esc(p.status)} · ${p.games} game(s)</p></div>`).join('');
  $('#sessionsList').innerHTML=S.sessions.map(x=>`<div class="row"><b>${esc(x.provider||'local')}</b><span>${esc(x.game_id||'')}</span><span>${esc(x.launch_url||x.id||'')}</span></div>`).join('')||'<div class="empty">No sessions yet.</div>';
  $('#ledgerList').innerHTML=S.ledger.map(x=>`<div class="row"><b>${esc(x.kind||x.type||'')}</b><span>${money(x.amount)} ETB</span><span>${esc(x.note)}</span></div>`).join('')||'<div class="empty">No ledger entries.</div>';
  $('#roundsList').innerHTML=S.rounds.map(x=>`<div class="row"><b>${esc(x.id)}</b><span>Stake ${money(x.stake)} ETB</span><span>Win ${money(x.win)} ETB</span></div>`).join('')||'<div class="empty">No rounds yet.</div>';
}
function openLocalGame(session, game){
  const existing=$('#gameOverlay'); if(existing) existing.remove();
  const o=document.createElement('div'); o.id='gameOverlay'; o.className='game-overlay';
  o.innerHTML=`<div class="game-modal">
    <div class="game-top"><strong>${esc(game.name)}</strong><button type="button" id="closeGame">Close</button></div>
    <div class="game-frame-wrap"><iframe id="providerFrame" title="${esc(game.name)}" allow="autoplay; fullscreen" src="${esc(session.launch_url)}"></iframe></div>
    <p class="game-note">BINIYAM Local · play-money mode.</p>
  </div>`;
  document.body.appendChild(o);
  $('#closeGame').onclick=()=>o.remove();
}
async function launch(id){
  try{
    const game=S.games.find(g=>g.id===id);
    if(!game) throw new Error('Game not found');

    // External provider games are opened directly in the browser. The provider
    // launch URL is short-lived and is minted fresh for every click.
    if(game.provider !== 'biniyam-local'){
      const out=await api('/api/provider-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game_id:id})});
      const url=out?.session?.launch_url;
      if(!url || !/^https?:\/\//i.test(url)) throw new Error('Provider did not return a valid launch URL');
      window.location.assign(url);
      return;
    }

    const out=await api('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game_id:id})});
    if(!out.session.launch_url) throw new Error('Local provider did not return a launch URL');
    openLocalGame(out.session,game);
    S=await api('/api/bootstrap'); render();
  }catch(e){toast(e.message)}
}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); $('#'+b.dataset.tab).classList.add('active');
}));
$('#search').addEventListener('input',()=>render());
(async()=>{try{S=await api('/api/bootstrap');render();}catch(e){toast(e.message)}})();
