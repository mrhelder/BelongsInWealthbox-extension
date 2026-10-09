# BelongsInWealthbox

BelongsInWealthbox is a free, open-source, lightweight Chrome and Chromium-based Microsoft Edge extension that turns phone numbers in Wealthbox contact details into clickable `tel:` links.

## Local-only by design

- Runs entirely in the user's browser using native DOM APIs. No extension-initiated network traffic.
- No servers, direct Wealthbox or Zoom API requests, analytics, telemetry, third-party runtime dependencies, external assets/scripts, or service worker.
- Wealthbox requires its own connection; the configured calling application may separately require connectivity to place the call.
- Extension stores require connectivity to download updates. The installed extension itself does not.

## Behavior

The extension observes `#contact-inspector .contact-info` and turns North American (+1) phone numbers into `tel:` hyperlinks. For example, `(919) 555-0123`, `9195550123`, and `+1 (919) 555-0123` link to `tel:+19195550123`.

It preserves displayed text, existing links, editable fields, unrelated page content, and extension text following a number. It ignores invalid NANP area/exchange prefixes, unsupported international country codes, and numeric substrings embedded inside longer identifiers. It does not access the Wealthbox API, modify CRM data, or place calls itself.

## Installation

Install through a published browser extension store listing, if available. To install directly:

1. Clone or download the repository.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode** and select **Load unpacked**.
4. Select the folder containing `manifest.json`.

The content script requests access to `https://*.crmworkspace.com/*` and no extra Chrome API permissions.

## Testing

No npm install or build step is required. To run the dependency-free Node.js unit tests:

```sh
node --test tests/extension.test.mjs
```

These tests check phone-number detection and manifest constraints. They **do not** execute DOM integration in a browser. Before merging or releasing, test in Chrome and Edge with live Wealthbox contact records: delayed data loading, SPA contact navigation, editable fields, duplicate prevention, and click-to-call through the configured `tel:` handler.

## License and trademark attribution

Original project source code is distributed under the [MIT License](LICENSE). Third-party names, trademarks, and artwork (including existing Wealthbox icon assets in `icons/`) remain the property of their respective owners and are not relicensed by MIT. This independent project is not affiliated with Wealthbox or Zoom.
