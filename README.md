# BelongsInWealthbox

A lightweight browser extension that automatically converts phone numbers in Wealthbox Contact records into clickable tel:// links.

## Features

- **Automatic Detection**: Detects phone numbers in multiple formats:
  - (123) 456-7890
  - 123-456-7890
  - 123.456.7890
  - 123 456 7890
  - 1234567890
- **One-Click Calling**: Click any detected phone number to open it in your system's default calling application
- **Privacy-First**: Open source, runs locally on your machine with no data collection
- **Lightweight**: Minimal performance impact, works seamlessly in the background

## Installation

### From Chrome or Edge Extension Store
Search for "BelongsInWealthbox" in your browser's extension store and click Install.

### From Source (Manual Installation)
1. Clone or download this repository
2. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the folder containing these extension files
6. The extension is now active!

## Usage

The extension runs automatically on all Wealthbox workspaces. Phone numbers in Contact record profiles are converted to clickable links instantly.

## Permissions

- **activeTab**: Used to access and modify Contact record pages to convert phone numbers into clickable links

## How It Works

This extension simply modifies the webpage's DOM to find phone numbers and replace them with clickable tel: links. No data is collected or sent anywhere.
