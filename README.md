# BelongsInWealthbox

Finally, a browswer extension that does what Wealthbox refuses to do: automatically converts Contact record phone numbers into clickable tel:// links.

## Features

- Detects phone numbers in various formats across your Wealthbox workspaces:
  - (123) 456-7890
  - 123-456-7890
  - 123.456.7890
  - 123 456 7890
  - 1234567890
  - +1 (123) 456-7890
- Converts them to clickable links that open in your system's default calling app
- Privacy first and open source - this extension simply modifies the webpage's DOM file to automatically turn phone numbers into clickable links.
### That's it! That's all this does. Clean. Simple. Lightweight

## Installation
1. Download directly from the Chrome or Edge extension stores, OR
2. Download or clone this repository
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked"
6. Select the folder containing the extension files
7. The extension will now be active on all web pages

## Usage

Once installed, the extension runs automatically on all your Wealthbox workspaces, however you do have to refresh the Contact's profile page after you navigate to them each time.

## Permissions

- **activeTab**: Required to access and modify content on web pages to convert phone numbers
