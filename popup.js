const KEYS=['enabled','hideAds','hidePopups','hideSponsoredText'];
const status=document.getElementById('status');
chrome.storage.sync.get({enabled:true,hideAds:true,hidePopups:true,hideSponsoredText:true},s=>{
  KEYS.forEach(k=>{const el=document.getElementById(k);el.checked=!!s[k];el.addEventListener('change',()=>{chrome.storage.sync.set({[k]:el.checked},()=>{status.textContent='Enregistré';setTimeout(()=>status.textContent='',900);});});});
});
document.getElementById('options').addEventListener('click',()=>chrome.runtime.openOptionsPage());