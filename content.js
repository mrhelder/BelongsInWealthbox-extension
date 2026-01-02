// Single-purpose content script: wait for .contact-info to exist, then linkify phone numbers inside it.
console.log('[tel-linker] content script loaded at', window.location.href);
window.__telLinkerPing = { when: Date.now(), href: window.location.href };

const phoneRegex = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const SKIP_TAGS = new Set([
  'A',
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'OPTION',
  'BUTTON',
  'CODE',
  'PRE'
]);

function linkifyPhoneTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  const linkedNumbers = [];
  nodes.forEach(textNode => {
    if (!textNode.textContent) return;
    phoneRegex.lastIndex = 0;
    if (!phoneRegex.test(textNode.textContent)) return;

    const parent = textNode.parentElement;
    if (!parent || parent.closest('a')) return;
    if (!root.contains(textNode)) return;

    let el = parent;
    while (el && el !== root && el !== document.body) {
      if (SKIP_TAGS.has(el.tagName)) return;
      if (el.isContentEditable) return;
      el = el.parentElement;
    }

    phoneRegex.lastIndex = 0;
    const span = document.createElement('span');
    let last = 0;
    let match;
    while ((match = phoneRegex.exec(textNode.textContent))) {
      span.append(textNode.textContent.slice(last, match.index));

      const a = document.createElement('a');
      let telDigits = match[0].replace(/[^\d+]/g, '');
      if (!telDigits.startsWith('+')) {
        const onlyDigits = telDigits.replace(/[^\d]/g, '');
        if (onlyDigits.length === 10) {
          telDigits = '+1' + onlyDigits;
        } else if (onlyDigits.length === 11 && onlyDigits.startsWith('1')) {
          telDigits = '+' + onlyDigits;
        } else {
          telDigits = '+' + onlyDigits;
        }
      }
      a.href = 'tel:' + telDigits;
      a.textContent = match[0];
      linkedNumbers.push(match[0]);

      span.append(a);
      last = phoneRegex.lastIndex;
    }

    span.append(textNode.textContent.slice(last));
    textNode.replaceWith(span);
  });

  if (linkedNumbers.length) {
    console.log(`[tel-linker] linkified phone numbers: ${linkedNumbers.join(', ')}`);
  } else {
    console.log('[tel-linker] no phone numbers found to linkify (yet)');
  }
  return linkedNumbers.length;
}

let currentRoot = null;
let innerObserver = null;
let retryTimer = null;
let retryAttempts = 0;

function ensureLinkified() {
  const root = document.querySelector('#contact-inspector .contact-info');
  if (!root) return false;
  return linkifyPhoneTextNodes(root) > 0;
}

function startRetryLoop() {
  if (retryTimer) clearInterval(retryTimer);
  retryAttempts = 30; // ~7.5s at 250ms
  retryTimer = setInterval(() => {
    const done = ensureLinkified();
    retryAttempts -= 1;
    if (done || retryAttempts <= 0) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
  }, 250);
}

function linkifyContactInfoIfPresent() {
  const root = document.querySelector('#contact-inspector .contact-info');
  if (!root) return false;

  console.log('[tel-linker] contact-info detected, attempting linkify');

  // If the root changed (e.g., SPA navigation swapped the node), rebind the inner observer.
  if (root !== currentRoot) {
    if (innerObserver) innerObserver.disconnect();
    currentRoot = root;
    innerObserver = new MutationObserver(() => ensureLinkified());
    innerObserver.observe(currentRoot, { childList: true, subtree: true, characterData: true });
    // New root, kick off retries.
    startRetryLoop();
  }

  ensureLinkified();
  return true;
}

function startWatching() {
  const start = () => {
    // Always watch the whole document for the contact-info node appearing/reappearing.
    const outerObserver = new MutationObserver((mutations) => {
      console.log(`[tel-linker] outer observer fired (${mutations.length} mutations)`);
      linkifyContactInfoIfPresent();
    });
    outerObserver.observe(document.body, { childList: true, subtree: true });

    // Try immediately in case the node is already there.
    linkifyContactInfoIfPresent();

     // Fallback poll in case observers miss an early insertion.
    let fallbackTries = 20;
    const fallback = setInterval(() => {
      const done = linkifyContactInfoIfPresent();
      fallbackTries -= 1;
      if (done || fallbackTries <= 0) clearInterval(fallback);
    }, 300);

    // Also hook SPA navigation events (pushState/replaceState/popstate) to force a check.
    const nativePushState = history.pushState;
    const nativeReplaceState = history.replaceState;
    function dispatchNavEvent() {
      linkifyContactInfoIfPresent();
    }
    history.pushState = function (...args) {
      nativePushState.apply(history, args);
      dispatchNavEvent();
    };
    history.replaceState = function (...args) {
      nativeReplaceState.apply(history, args);
      dispatchNavEvent();
    };
    window.addEventListener('popstate', dispatchNavEvent);
  };

  // If body is not yet available (document_start), wait until it appears.
  if (document.body) {
    start();
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect();
        start();
      }
    });
    bodyObserver.observe(document.documentElement || document, { childList: true, subtree: true });
  }
}

startWatching();
