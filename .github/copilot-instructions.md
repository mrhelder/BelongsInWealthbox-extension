# AI Coding Instructions for BelongsInWealthbox

## Project Overview
Single-purpose Chrome/Edge Manifest V3 extension that converts phone numbers to clickable `tel:` links on Wealthbox CRM pages (*.crmworkspace.com). The extension runs on all frames as a content script that watches for dynamic DOM changes.

## Architecture & Key Constraints

### Content Script Strategy ([content.js](../content.js))
- Runs at `document_start` to catch early DOM insertions
- **Target Element**: `#contact-inspector .contact-info` - this specific selector is the ONLY area where phone numbers should be linkified
- **SPA Awareness**: Wealthbox is a single-page app - the script hooks `history.pushState/replaceState/popstate` to detect navigation without page reloads
- **Observer Pattern**: Uses dual MutationObservers:
  - Outer observer: watches entire `document.body` for the target element to appear
  - Inner observer: watches the target element subtree for phone number text changes

### Phone Number Detection
- Regex: `/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g` - matches US phone formats with various separators
- **Normalization**: Always normalizes to `tel:+1XXXXXXXXXX` format (adds +1 prefix for 10-digit US numbers)
- **Skip Tags**: Never linkify inside: A, SCRIPT, STYLE, TEXTAREA, INPUT, SELECT, BUTTON, CODE, PRE, or any `contentEditable` elements

### Reliability Mechanisms
The script employs multiple overlapping strategies because the target element loads asynchronously:
1. **Mutation observers** - primary detection method
2. **Retry loop** - 30 attempts × 250ms when root element detected but no phone numbers found yet
3. **Fallback polling** - 20 attempts × 300ms as safety net for missed observer events

**Why this complexity?** Wealthbox lazily loads contact info content, so the `#contact-inspector .contact-info` node may exist before phone numbers are inserted into it.

## Development Workflow

### Testing Locally
1. Load extension via `chrome://extensions/` → "Load unpacked"
2. Navigate to any Wealthbox workspace contact page
3. Open DevTools Console - look for `[tel-linker]` prefixed logs to verify:
   - Script loaded (`content script loaded at...`)
   - Target element detection (`contact-info detected, attempting linkify`)
   - Linkification results (`linkified phone numbers: ...` or `no phone numbers found to linkify`)

### Debugging Tips
- Check `window.__telLinkerPing` in console to verify script injection
- If linkification fails, verify the DOM structure hasn't changed: inspect for `#contact-inspector .contact-info`
- Log verbosity is intentional - each observer firing logs to help diagnose timing issues

## Code Conventions

### DOM Manipulation Safety
- Always check `root.contains(textNode)` before replacing to avoid manipulating detached nodes
- Never wrap already-linked text (check `parent.closest('a')` before processing)
- Use `document.createElement('span')` wrapper when replacing text nodes with mixed content

### Performance Patterns
- Collect all text nodes first (`createTreeWalker` → array), then iterate - avoids live collection issues
- Use `Set` for tag name lookups (`SKIP_TAGS`) instead of array includes
- Clear retry timers aggressively to prevent memory leaks

## Manifest V3 Specifics
- No background scripts or service workers needed for this use case
- `all_frames: true` required because Wealthbox contact info may load in iframes
- No permissions declared - pure DOM manipulation requires zero Chrome APIs

## What NOT to Change
- Don't remove the fallback polling or retry mechanisms - they're essential for reliability
- Don't simplify the observer setup - the dual-observer pattern handles both initial load and dynamic updates
- Don't modify `run_at: "document_start"` - later injection misses early DOM insertions
