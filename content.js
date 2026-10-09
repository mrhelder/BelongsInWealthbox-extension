// Enhance phone numbers in Wealthbox contact details without accessing any external service.
(() => {
  'use strict';

  const CONTACT_INFO_SELECTOR = '#contact-inspector .contact-info';
  // Include a country prefix in the candidate so non-US prefixes are rejected as a whole.
  // Boundaries prevent matching the first 10 digits of longer identifiers.
  const PHONE_PATTERN = /(?<![A-Za-z0-9+])(?:(?:\+\d{1,3}|1)[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}(?![A-Za-z0-9])/g;
  const SKIP_TAGS = new Set([
    'A', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT',
    'SELECT', 'OPTION', 'BUTTON', 'CODE', 'PRE'
  ]);

  let activeRoot = null;
  let contactObserver = null;

  function isExcluded(textNode) {
    for (let element = textNode.parentElement; element; element = element.parentElement) {
      if (SKIP_TAGS.has(element.tagName) || element.isContentEditable || element.hasAttribute('contenteditable')) {
        return true;
      }
    }
    return false;
  }

  function toTelHref(number) {
    const digits = number.replace(/\D/g, '');
    const nationalNumber = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    // NANP NPA-NXX-XXXX: area and central-office codes begin with 2 through 9.
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(nationalNumber)) return null;
    return `tel:+1${nationalNumber}`; // Ignore unsupported country codes instead of guessing.
  }

  function linkifyTextNode(textNode) {
    if (!textNode.isConnected || !activeRoot.contains(textNode) || isExcluded(textNode)) return;

    const text = textNode.nodeValue;
    if (!text) return;

    const replacement = document.createDocumentFragment();
    let lastIndex = 0;
    let found = false;

    for (const match of text.matchAll(PHONE_PATTERN)) {
      const href = toTelHref(match[0]);
      if (!href) continue;

      replacement.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const link = document.createElement('a');
      link.href = href;
      link.textContent = match[0];
      replacement.append(link);
      lastIndex = match.index + match[0].length;
      found = true;
    }

    if (!found) return;
    replacement.append(document.createTextNode(text.slice(lastIndex)));
    textNode.replaceWith(replacement);
  }

  function linkifyInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      linkifyTextNode(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const textNode of textNodes) linkifyTextNode(textNode);
  }

  function observeContactInfo() {
    const root = document.querySelector(CONTACT_INFO_SELECTOR);
    if (root === activeRoot) return;

    if (contactObserver) contactObserver.disconnect();
    activeRoot = root;
    if (!root) return;

    contactObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          linkifyInNode(mutation.target);
        } else {
          for (const addedNode of mutation.addedNodes) linkifyInNode(addedNode);
        }
      }
    });
    contactObserver.observe(root, { childList: true, characterData: true, subtree: true });
    linkifyInNode(root);
  }

  function start() {
    if (!document.body) return;
    observeContactInfo();
    // A Wealthbox SPA can replace the entire contact inspector without a page reload.
    new MutationObserver(observeContactInfo).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
