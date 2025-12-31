const phoneRegex = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

function linkify(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  if (!node.parentElement) return;
  if (node.parentElement.closest("a")) return;
  if (!phoneRegex.test(node.textContent)) return;

  phoneRegex.lastIndex = 0;

  const span = document.createElement("span");
  let last = 0;
  let match;

  while ((match = phoneRegex.exec(node.textContent))) {
    span.append(node.textContent.slice(last, match.index));

    const a = document.createElement("a");
    // Normalize phone number for tel: href — remove formatting and ensure international-style prefix
    let telDigits = match[0].replace(/[^\d+]/g, '');
    if (!telDigits.startsWith('+')) {
      const onlyDigits = telDigits.replace(/[^\d]/g, '');
      if (onlyDigits.length === 10) {
        telDigits = '+1' + onlyDigits;
      } else if (onlyDigits.length === 11 && onlyDigits.startsWith('1')) {
        telDigits = '+' + onlyDigits;
      } else {
        // fallback: prefix plus to whatever digits we have
        telDigits = '+' + onlyDigits;
      }
    }
    a.href = 'tel:' + telDigits;
    a.textContent = match[0];

    span.append(a);
    last = phoneRegex.lastIndex;
  }

  span.append(node.textContent.slice(last));
  node.replaceWith(span);
}

function processPhoneNumbers() {
  // Target the contact inspector container specifically
  const contactInspector = document.getElementById('contact-inspector');
  if (!contactInspector) return false;

  // Find all span.address elements in the contact inspector
  const addressElements = contactInspector.querySelectorAll('span.address');
  
  if (addressElements.length === 0) return false;
  
  let processed = false;
  addressElements.forEach(el => {
    // Walk through text nodes in these elements
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      null
    );
    const nodesToProcess = [];
    let textNode;
    while ((textNode = walker.nextNode())) {
      nodesToProcess.push(textNode);
    }
    nodesToProcess.forEach(node => {
      if (phoneRegex.test(node.textContent)) {
        // ensure regex starts from beginning for exec loop inside linkify
        phoneRegex.lastIndex = 0;
        linkify(node);
        processed = true;
      }
    });
  });
  
  if (processed) {
    console.log("[tel-linker] linkified phone numbers");
    return true;
  }
  return false;
}

// Observe for changes to the contact inspector
const observer = new MutationObserver(() => {
  processPhoneNumbers();
});

// observe DOM mutations (no characterData polling)
observer.observe(document.body, { 
  childList: true, 
  subtree: true
});

// Start once at load
processPhoneNumbers();
