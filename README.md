# BelongsInWealthbox

Finally, a browswer extension that does what Wealthbox refuses to do: automatically converts Contact record phone numbers into clickable tel:// links.

## Features

- Detects phone numbers in various formats:
  - (123) 456-7890
  - 123-456-7890
  - 123.456.7890
  - 123 456 7890
  - 1234567890
  - +1 (123) 456-7890
- Converts them to clickable links that open in your system's default calling app
- Works on dynamically loaded content
- Non-intrusive - preserves original formatting

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the folder containing the extension files
6. The extension will now be active on all web pages

## Usage

Once installed, the extension automatically runs on all web pages. Phone numbers will be converted to clickable links that you can click to initiate a call through your system's default calling application.

## Permissions

- **activeTab**: Required to access and modify content on web pages to convert phone numbers

## Customization

You can modify the `phonePatterns` array in `content-script.js` to add or adjust phone number formats specific to your region or needs.
