# Gemini Chat Exporter - Installation Guide

## Prerequisites

- Google Chrome (version 88 or higher)
- Node.js and npm (for building from source)

## Installation Methods

### Method 1: From Source (Recommended for Development)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/ReneesmeS/gemini-chat-exporter-math.git

# Note
If you fork the project, replace remote URLs with your fork's path.
cd gemini-chat-exporter
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Build the Extension
```bash
npm run build
```

This will:
- Install required packages (docx, katex)
- Copy libraries to the `libs/` folder

#### Step 4: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `gemini-chat-exporter` folder

#### Step 5: Verify Installation

- You should see the Gemini Chat Exporter icon in your Chrome toolbar
- The extension should show as "Enabled"

### Method 2: From Chrome Web Store (Coming Soon)

Once published to the Chrome Web Store:

1. Visit the [extension page](chrome-web-store-link-here)
2. Click "Add to Chrome"
3. Confirm the installation
4. The extension icon will appear in your toolbar

## Troubleshooting

### Extension Not Loading

**Issue**: "Manifest file is missing or unreadable"
- **Solution**: Ensure you're selecting the root folder containing `manifest.json`

**Issue**: "Could not load javascript"
- **Solution**: Run `npm run build` to ensure all libraries are copied

### Build Errors

**Issue**: `npm install` fails
- **Solution**: Ensure you have Node.js 14+ installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`

**Issue**: `npm run build` fails
- **Solution**: Check that `libs/` folder exists and has write permissions
- Manually create the folder: `mkdir libs`

### Extension Not Working on Gemini

**Issue**: Extension icon appears but doesn't work
- **Solution**: 
  1. Reload the extension on `chrome://extensions/`
  2. Refresh the Gemini page
  3. Check that you're on `https://gemini.google.com`

**Issue**: "Not on Gemini page" error
- **Solution**: The extension only works on `gemini.google.com`

### Export Errors

**Issue**: Export button doesn't respond
- **Solution**: Check browser console for errors (F12 → Console)
- Verify libraries are loaded in `libs/` folder

**Issue**: "Failed to extract content"
- **Solution**: 
  1. Ensure you have content on the page (messages visible)
  2. Try refreshing the page
  3. Check if Gemini updated their UI (content script may need updates)

## Permissions Explained

The extension requires these permissions:

- **activeTab**: To read content from the current Gemini tab
- **scripting**: To inject content scripts for extraction
- **downloads**: To save exported files
- **host_permissions (gemini.google.com)**: To run only on Gemini pages

## Updating the Extension

### If Installed from Source

```bash
cd gemini-chat-exporter
git pull origin main
npm install
npm run build
```

Then reload the extension:
1. Go to `chrome://extensions/`
2. Click the reload icon for Gemini Chat Exporter

### If Installed from Chrome Web Store

Updates are automatic! Chrome will update the extension in the background.

## Uninstalling

### Remove Extension
1. Go to `chrome://extensions/`
2. Find Gemini Chat Exporter
3. Click **Remove**

### Clean Up Files (if installed from source)
```bash
cd gemini-chat-exporter
rm -rf node_modules libs
```

## Next Steps

After installation:

1. Visit [gemini.google.com](https://gemini.google.com)
2. Click the extension icon
3. Try exporting a conversation
4. Check the [Usage Guide](docs/USAGE.md) for detailed features

## Support

Having trouble? 

- Check [Known Issues](README.md#known-issues--limitations)
- Read [FAQ](docs/FAQ.md)
- Open an [issue](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues)

---

Happy Exporting!
