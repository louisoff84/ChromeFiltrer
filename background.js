const LOCAL_DEFAULTS={suspendMinutes:5,keepPinned:true,keepAudio:true,updateChecks:true,totalBlocked:0,siteStats:{}};

function validTab(t){return t&&Number.isInteger(t.id)&&t.url&&/^https?:/i.test(t.url)}

async function optimizeTabs(){
  const [syncCfg,localCfg]=await Promise.all([
    chrome.storage.sync.get({lowRam:true}),
    chrome.storage.local.get(LOCAL_DEFAULTS)
  ]);
  if(!syncCfg.lowRam)return;
  const tabs=await chrome.tabs.query({});
  const now=Date.now();
  const limit=Math.max(1,Number(localCfg.suspendMinutes)||5)*60000;
  for(const t of tabs){
    if(!validTab(t)||t.active||t.discarded)continue;
    if(localCfg.keepPinned&&t.pinned)continue;
    if(localCfg.keepAudio&&t.audible)continue;
    if(typeof t.lastAccessed==='number'&&now-t.lastAccessed<limit)continue;
    try{await chrome.tabs.discard(t.id)}catch{}
  }
}

async function openUpdatePage(version,status='available'){
  await chrome.storage.local.set({nativeUpdate:{version,status,detectedAt:Date.now()}});
  const url=chrome.runtime.getURL('update.html');
  const existing=await chrome.tabs.query({url});
  if(existing.length){
    try{await chrome.tabs.update(existing[0].id,{active:true})}catch{}
    return;
  }
  try{await chrome.tabs.create({url})}catch{}
}

async function requestNativeUpdateCheck(){
  const cfg=await chrome.storage.local.get(LOCAL_DEFAULTS);
  if(!cfg.updateChecks)return {status:'disabled'};
  await chrome.storage.local.set({lastUpdateCheck:Date.now()});
  try{
    const result=await chrome.runtime.requestUpdateCheck();
    if(result?.status==='update_available'&&result.version){
      await openUpdatePage(result.version,'available');
    }
    return result||{status:'no_update'};
  }catch(error){
    await chrome.storage.local.set({lastUpdateError:String(error?.message||error)});
    return {status:'error'};
  }
}

function setupAlarms(){
  chrome.alarms.create('optimize',{periodInMinutes:1});
}

chrome.runtime.onUpdateAvailable.addListener(async details=>{
  await openUpdatePage(details.version,'ready');
});

chrome.runtime.onInstalled.addListener(async details=>{
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({id:'cf-open',title:'Ouvrir ChromeFiltrer',contexts:['all']});
  chrome.contextMenus.create({id:'cf-optimize',title:'Optimiser les onglets maintenant',contexts:['all']});
  await chrome.storage.local.set({lastInstalledVersion:chrome.runtime.getManifest().version});
  setupAlarms();
  if(details.reason==='update'){
    await chrome.storage.local.set({lastSuccessfulUpdate:{version:chrome.runtime.getManifest().version,at:Date.now()}});
  }
});

chrome.runtime.onStartup.addListener(async()=>{
  setupAlarms();
  await requestNativeUpdateCheck();
  await optimizeTabs();
});

chrome.alarms.onAlarm.addListener(a=>{
  if(a.name==='optimize')optimizeTabs();
});

chrome.contextMenus.onClicked.addListener(i=>{
  if(i.menuItemId==='cf-open')chrome.runtime.openOptionsPage();
  if(i.menuItemId==='cf-optimize')optimizeTabs();
});

chrome.runtime.onMessage.addListener((m,_sender,sendResponse)=>{
  if(m?.type==='CF_BLOCKED'&&m.host){
    chrome.storage.local.get({totalBlocked:0,siteStats:{}},s=>{
      s.totalBlocked=(s.totalBlocked||0)+(Number(m.count)||0);
      s.siteStats=s.siteStats||{};
      s.siteStats[m.host]=(s.siteStats[m.host]||0)+(Number(m.count)||0);
      chrome.storage.local.set(s);
    });
    return;
  }
  if(m?.type==='CF_OPTIMIZE'){
    optimizeTabs().then(()=>sendResponse({ok:true}));
    return true;
  }
  if(m?.type==='CF_CHECK_UPDATE'){
    requestNativeUpdateCheck().then(result=>sendResponse({ok:true,result}));
    return true;
  }
  if(m?.type==='CF_APPLY_UPDATE'){
    sendResponse({ok:true});
    setTimeout(()=>chrome.runtime.reload(),100);
    return true;
  }
});