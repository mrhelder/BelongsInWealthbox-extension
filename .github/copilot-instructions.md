# AI development guidelines: BelongsInWealthbox

## Purpose

Free, open-source, lightweight Chrome/Edge Manifest V3 extension. Locally turn North American (+1) telephone numbers displayed in Wealthbox contact details into `tel:` links.

## Required design constraints

- Completely local processing; no servers, fetch/XHR, external API calls, telemetry, analytics, background services, external libraries or build step.
- One content script, `content.js`, injected only for HTTPS Wealthbox pages by `manifest.json`.
- DOM changes must stay within `#contact-inspector .contact-info`. This is an internal Wealthbox DOM selector, not a documented API; verify against the live UI before changing it.
- Never alter existing anchors, form inputs, editable fields, or other unrelated content.
- Use safe DOM creation and `textContent`, not interpolated `innerHTML` with contact information.
- Do not log phone numbers, contact URLs, or other private client data.
- Match NANP (+1) numbers conservatively; reject longer numeric identifiers, impossible NANP area/exchange prefixes, and non-NANP international prefixes. Keep displayed extension text.
- Native `tel:` links hand off to the browser/OS registered calling handler, not a Zoom API.

## Architecture

The code uses one outer MutationObserver to find or rebind the target contact-info element when Wealthbox changes its SPA DOM, and one inner MutationObserver to process text additions/changes in that element. Avoid polling loops, monkey-patching History API methods, or adding extension permissions unless a reproducible test demonstrates the need.

## Verification before release

Run `node --test tests/extension.test.mjs` for dependency-free manifest and phone parsing tests. These **do not cover browser DOM integration**. Manually verify Chrome and Edge with actual Wealthbox records: initial and delayed rendering, navigation, updated numbers, existing links, editable controls, duplicate prevention, and configured `tel:` call handler.

## Authoritative references

- Chrome content script manifest: https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts
- MDN MutationObserver: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
- RFC 3966 telephone URIs: https://www.rfc-editor.org/rfc/rfc3966
