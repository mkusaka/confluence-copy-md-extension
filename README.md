# Confluence Copy Helper

A Chrome extension that converts Confluence pages to Markdown format with a single click.

## Features

- 🚀 One-click conversion from Confluence to Markdown
- 📋 Automatically copies to clipboard
- 🔔 Toast notifications for success/error feedback
- 🎯 Works on any Confluence Cloud instance (`*.atlassian.net`)

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/mkusaka/confluence-copy-md-extension.git
   cd confluence-copy-md-extension
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

1. Navigate to any Confluence page
2. Click the extension icon in your browser toolbar
3. The page content will be converted to Markdown and copied to your clipboard
4. A toast notification will confirm the successful copy

## Development

This project uses:
- TypeScript
- Vite with CRXJS plugin for Chrome extension development
- mdast-util-from-adf for ADF to Markdown conversion

### Project Structure

```
src/
├── background.ts    # Service worker for handling extension icon clicks
├── content.ts       # Content script for page interaction and API calls
├── adf-to-md.ts    # ADF to Markdown conversion logic
└── manifest.config.ts # Chrome extension manifest configuration
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Development mode (if configured)
pnpm run dev
```

## How it Works

1. When you click the extension icon, the background script sends a message to the content script
2. The content script extracts the page ID from the URL
3. It fetches the page content in Atlas Doc Format (ADF) using Confluence's REST API
4. The ADF is converted to Markdown using `mdast-util-from-adf`
5. The Markdown is copied to your clipboard
6. A toast notification confirms the operation

## Permissions

The extension requires the following permissions:
- `clipboardWrite`: To copy the converted Markdown to your clipboard
- `activeTab`: To interact with the current Confluence page
- `scripting`: To inject content scripts when needed
- Host permission for `https://*.atlassian.net/*`: To access Confluence API endpoints

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Troubleshooting

### "Page ID not found" error
- Make sure you're on a Confluence page (URL should contain `/wiki/spaces/` or `/wiki/pages/`)
- The extension only works on Confluence Cloud instances

### "API Error" 
- Check if you're logged in to Confluence
- Verify you have permission to view the page
- Some pages might have restrictions that prevent API access

### Extension icon doesn't appear
- Make sure the extension is enabled in Chrome
- Try reloading the extension from `chrome://extensions/`
- Check that you've built the project (`pnpm run build`)