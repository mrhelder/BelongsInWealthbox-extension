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

// Collect text nodes first
const textNodes = [];

const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT,
  null
);

let node;
while ((node = walker.nextNode())) {
  textNodes.push(node);
}

// Then process them
textNodes.forEach(linkify);

console.log("[tel-linker] ran");

// Observe for dynamically added content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const newTextNodes = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
        let textNode;
        while ((textNode = walker.nextNode())) {
          newTextNodes.push(textNode);
        }
        newTextNodes.forEach(linkify);
      }
    });
  });
});
observer.observe(document.body, { childList: true, subtree: true });
