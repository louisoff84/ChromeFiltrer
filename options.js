const defaults={hideCookieBanners:false,blockedWords:[],customSelectors:[]};
const $=id=>document.getElementById(id);
function lines(v){return v.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,200);}
function load(){chrome.storage.sync.get(defaults,s=>{$('hideCookieBanners').checked=!!s.hideCookieBanners;$('blockedWords').value=(s.blockedWords||[]).join('\n');$('customSelectors').value=(s.customSelectors||[]).join('\n');});}
$('save').addEventListener('click',()=>chrome.storage.sync.set({hideCookieBanners:$('hideCookieBanners').checked,blockedWords:lines($('blockedWords').value),customSelectors:lines($('customSelectors').value)},()=>{$('status').textContent='Paramètres enregistrés.';}));
$('reset').addEventListener('click',()=>chrome.storage.sync.set(defaults,load));
load();