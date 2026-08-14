const $=id=>document.getElementById(id);
const current=chrome.runtime.getManifest().version;

function showReady(version){
  $('title').textContent='Version '+version+' prête';
  $('text').textContent='Chrome a déjà téléchargé la mise à jour.';
  $('details').textContent='Version actuelle : '+current+' → nouvelle version : '+version;
  $('apply').style.display='block';
}

function showStatus(status,version){
  if(status==='update_available'&&version){showReady(version);return;}
  if(status==='no_update'){
    $('title').textContent='ChromeFiltrer est à jour';
    $('text').textContent='Aucune nouvelle version n’est disponible.';
    $('details').textContent='Version actuelle : '+current;
    $('apply').style.display='none';
    return;
  }
  if(status==='throttled'){
    $('title').textContent='Vérification temporairement limitée';
    $('text').textContent='Chrome a limité les vérifications trop rapprochées. Il réessaiera automatiquement.';
    $('details').textContent='Version actuelle : '+current;
    return;
  }
  if(status==='disabled'){
    $('title').textContent='Vérifications désactivées';
    $('text').textContent='Active les vérifications de mise à jour dans le panel.';
    return;
  }
  if(status==='error'){
    $('title').textContent='Impossible de vérifier la mise à jour';
    $('text').textContent='Chrome n’a pas pu contacter le canal de mise à jour.';
    return;
  }
}

$('panel').onclick=()=>chrome.runtime.openOptionsPage();

$('check').onclick=()=>{
  $('check').disabled=true;
  $('title').textContent='Vérification…';
  chrome.runtime.sendMessage({type:'CF_CHECK_UPDATE'},response=>{
    $('check').disabled=false;
    if(chrome.runtime.lastError){showStatus('error');return;}
    const r=response?.result||{};
    showStatus(r.status,r.version);
  });
};

$('apply').onclick=()=>{
  $('apply').disabled=true;
  $('apply').textContent='Application de la mise à jour…';
  chrome.runtime.sendMessage({type:'CF_APPLY_UPDATE'});
};

chrome.storage.local.get({nativeUpdate:null},s=>{
  if(s.nativeUpdate?.version){
    showReady(s.nativeUpdate.version);
  }else{
    $('check').click();
  }
});