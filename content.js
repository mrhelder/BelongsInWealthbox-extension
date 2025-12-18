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
    a.href = "tel:" + match[0];
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

observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true
});

// Start polling immediately and every 300ms
processPhoneNumbers();
setInterval(processPhoneNumbers, 300);
