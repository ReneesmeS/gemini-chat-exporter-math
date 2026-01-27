# Quick Start Guide

Get your Gemini Chat Exporter up and running in 5 minutes.

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

This copies the required libraries (docx, KaTeX) to the `libs/` folder.

### 3. Create Icons (Temporary Solution)

Icons are included in the `icons/` directory. If you need to regenerate icons, use the scripts in `icons/` (see `icons/README.md`).

```bash
# On macOS/Linux - creates colored placeholder images
cd icons
convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

Or manually create 3 simple PNG files (16x16, 48x48, 128x128) and place them in `icons/`.

**Alternative**: Download icons from a service like [Flaticon](https://www.flaticon.com) or create them with [Figma](https://figma.com).

### 4. Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this project folder: `/Users/lilyyang/Projects/gemini_export_tool`

### 5. Test It Out

1. Visit [gemini.google.com](https://gemini.google.com)
2. Start or view a conversation
3. Click the extension icon in your toolbar
4. Choose a format and click to export

## Project Structure

```
gemini_export_tool/
├── manifest.json              # Extension configuration
├── background.js              # Service worker
├── content.js                 # Extracts Gemini content
├── popup.html/css/js          # Extension UI
├── exporters/                 # Format-specific exporters
│   ├── markdown-exporter.js
│   └── word-exporter.js
├── icons/                     # Extension icons (16, 48, 128)
├── libs/                      # External libraries (auto-created)
├── docs/                      # Documentation
└── package.json               # Dependencies
```

## Development

### Making Changes

1. Edit the code
2. Go to `chrome://extensions/`
3. Click the **reload** icon for your extension
4. Test on Gemini

**Quick Reload Tip**: Keep the extensions page open in a pinned tab. After making code changes, simply click the reload icon - no need to unload and reload the entire extension.

### Debugging

- **Popup**: Right-click extension icon -> "Inspect popup"
- **Background**: chrome://extensions/ -> "Service worker" link
- **Content Script**: F12 on Gemini page -> Console tab

### Common Commands

```bash
# Install new packages
npm install package-name

# Rebuild libraries
npm run build

# Create distribution package
npm run package
```

## Verification Checklist

- [ ] Dependencies installed (`node_modules/` exists)
- [ ] Libraries built (`libs/` folder with JS files)
- [ ] Icons created (3 PNG files in `icons/`)
- [ ] Extension loaded in Chrome
- [ ] Extension icon visible in toolbar
- [ ] Works on Gemini page (no error messages)
- [ ] All export formats working

## Troubleshooting

### "Manifest file is missing or unreadable"
→ Make sure you're selecting the root folder, not a subfolder

### "Could not load javascript"
→ Run `npm run build` to copy libraries

### Extension icon not showing
-> Add the icon files to `icons/` folder

### Export not working
-> Check console for errors (F12), ensure you're on gemini.google.com

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [docs/USAGE.md](docs/USAGE.md) for usage guide
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Create proper icons for the extension
- Test with various Gemini conversations

## Quick Test

1. Ask Gemini: "What is the Pythagorean theorem with a formula?"
2. Click your extension icon
3. Select "Current Response" and "Markdown"
4. Export and open the .md file
5. Verify the math formula is preserved

## Pro Tips

- **Test with various content**: Try tables, code blocks, lists, math
- **Check both modes**: Test single response and full conversation
- **Try both formats**: Each format has different strengths
- **Read the console**: Errors show up in browser console (F12)
- **Keep extensions page open**: Pin `chrome://extensions/` tab for quick reloads

---

Need help? Open an [issue](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues) or check the docs.
