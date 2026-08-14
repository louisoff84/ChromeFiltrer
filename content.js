(() => {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    hideAds: true,
    hidePopups: true,
    hideCookieBanners: false,
    hideSponsoredText: true,
    customSelectors: [],
    blockedWords: []
  };

  let settings = DEFAULTS;
  let scheduled = false;

  const AD_SELECTORS = [
    '[id^="google_ads"]','[id*="google_ads"]','[class*=" ad-"]','[class^="ad-"]',
    '[class*="advertisement"]','[aria-label="Advertisement"]','[data-ad]','[data-ad-slot]',
    'iframe[src*="doubleclick.net"]','iframe[src*="googlesyndication.com"]'
  ];
  const POPUP_SELECTORS = ['[role="dialog"][aria-modal="true"]','.modal-backdrop','.popup-overlay','[class*="newsletter-popup"]'];
  const COOKIE_SELECTORS = ['[id*="cookie-banner"]','[class*="cookie-banner"]','[id*="cookie-consent"]','[class*="cookie-consent"]','[class*="consent-banner"]'];
  const SPONSORED = /\b(sponsored|sponsorisé|sponsorisee|sponsorisée|publicité|advertisement|promoted)\b/i;

  function hide(el) {
    if (!el || el.dataset?.chromeFiltrerHidden) return;
    el.style.setProperty('display', 'none', 'important');
    if (el.dataset) el.dataset.chromeFiltrerHidden = '1';
  }

  function safeQueryAll(root, selector) {
    try { return root.querySelectorAll(selector); } catch { return []; }
  }

  function apply(root = document) {
    if (!settings.enabled) return;
    const selectors = [];
    if (settings.hideAds) selectors.push(...AD_SELECTORS);
    if (settings.hidePopups) selectors.push(...POPUP_SELECTORS);
    if (settings.hideCookieBanners) selectors.push(...COOKIE_SELECTORS);
    if (Array.isArray(settings.customSelectors)) selectors.push(...settings.customSelectors.filter(Boolean));
    for (const selector of selectors) for (const el of safeQueryAll(root, selector)) hide(el);

    if (settings.hideSponsoredText || settings.blockedWords?.length) {
      const words = (settings.blockedWords || []).map(v => String(v).trim().toLowerCase()).filter(Boolean);
      for (const el of safeQueryAll(root, 'article, aside, section, [role="listitem"]')) {
        const text = (el.innerText || '').slice(0, 1500);
        if ((settings.hideSponsoredText && SPONSORED.test(text)) || words.some(w => text.toLowerCase().includes(w))) hide(el);
      }
    }
  }

  function schedule(root) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(root || document); });
  }

  chrome.storage.sync.get(DEFAULTS, data => {
    settings = { ...DEFAULTS, ...data };
    apply();
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) { schedule(document); break; }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, change] of Object.entries(changes)) settings[key] = change.newValue;
    document.querySelectorAll('[data-chrome-filtrer-hidden="1"]').forEach(el => {
      el.style.removeProperty('display'); delete el.dataset.chromeFiltrerHidden;
    });
    apply();
  });
})();