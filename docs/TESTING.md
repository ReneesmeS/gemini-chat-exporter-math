# Testing and Development Workflow

## Quick Testing Workflow

The fastest way to test changes without reloading the extension each time:

### Method 1: Extension Reload (Recommended)

1. **Make your changes** to the code
2. **Open `chrome://extensions/`** (keep it in a pinned tab)
3. **Click the reload icon** (circular arrow) for "Gemini Chat Exporter"
4. **Refresh the Gemini page** (F5 or Cmd+R)
5. **Test your changes**

**Time per iteration**: ~5 seconds

### Method 2: Development Build Script

For rapid iteration:

```bash
# After making changes
npm run build && echo "Ready to reload extension"
```

Then reload the extension in Chrome.

### Method 3: Watch for Changes (Advanced)

Install nodemon for auto-detection:

```bash
npm install --save-dev nodemon
```

Add to package.json scripts:
```json
"watch": "nodemon --watch . --ext js,html,css,json --ignore node_modules --ignore libs --exec 'npm run build && echo Extension updated - reload in Chrome'"
```

Run:
```bash
npm run watch
```

## Testing Checklist

Before committing changes:

### Basic Functionality
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] No console errors when opening popup
- [ ] Popup UI displays correctly
- [ ] Extension only activates on gemini.google.com

### Content Extraction
- [ ] Extracts plain text paragraphs
- [ ] Extracts formatted text (bold, italic, code)
- [ ] Extracts headings (all levels)
- [ ] Extracts lists (unordered, ordered, nested)
- [ ] Extracts tables
- [ ] Extracts code blocks
- [ ] Extracts blockquotes
- [ ] Extracts math formulas (inline and block)
- [ ] Handles multiple messages
- [ ] Handles single response mode

### Export Formats
- [ ] Markdown export works
- [ ] Word export works
- [ ] Files download with correct names
- [ ] Formatting preserved in each format
- [ ] Math formulas preserved

### Edge Cases
- [ ] Empty conversation
- [ ] Very long conversation
- [ ] Special characters in content
- [ ] Multiple consecutive code blocks
- [ ] Nested lists
- [ ] Large tables

## Debugging Tips

### Console Locations

**Popup Console**:
- Right-click extension icon → "Inspect popup"
- Console shows popup.js errors

**Background Worker Console**:
- Go to `chrome://extensions/`
- Find "Gemini Chat Exporter"
- Click "Service worker" link
- Console shows background.js errors

**Content Script Console**:
- Open Gemini page
- Press F12 (or Cmd+Option+I on Mac)
- Console shows content.js errors

### Common Issues

**"Cannot access chrome.runtime"**
- Background script error
- Check manifest.json permissions

**"Cannot read property of undefined"**
- Content script trying to access non-existent DOM element
- Gemini's UI may have changed
- Check element selectors in content.js

**"Failed to fetch"**
- Network error loading libraries
- Check libs/ folder has all required files
- Run `npm run build`

**Export produces empty file**
- Content extraction failed
- Check content.js console for errors
- Verify message structure matches expected format

### Testing Different Content Types

Create test conversations in Gemini:

**Test 1: Basic Formatting**
```
Prompt: "Write a short paragraph with bold, italic, and code formatting"
```

**Test 2: Math Formulas**
```
Prompt: "Explain the quadratic formula with the actual formula"
```

**Test 3: Code Blocks**
```
Prompt: "Show me a Python function to calculate fibonacci numbers"
```

**Test 4: Tables**
```
Prompt: "Create a comparison table of Python, JavaScript, and Java"
```

**Test 5: Lists**
```
Prompt: "Give me a nested list of programming languages by category"
```

**Test 6: Mixed Content**
```
Prompt: "Explain sorting algorithms with examples, formulas, and code"
```

## Performance Testing

### Metrics to Monitor

- **Extraction Time**: Should be < 1 second for typical conversations
- **Export Time**: 
  - Markdown: < 500ms
  - Word: 1-3 seconds
- **Memory Usage**: Check in Task Manager/Activity Monitor
- **File Size**: Reasonable for content length

### Load Testing

Test with:
- 5 messages
- 20 messages
- 50+ messages (if available)

## Security Testing

### Check for:
- [ ] No credentials stored or logged
- [ ] No external API calls (except Gemini domain)
- [ ] No eval() or unsafe code execution
- [ ] Proper input sanitization
- [ ] No XSS vulnerabilities in exported content

## Accessibility Testing

- [ ] Keyboard navigation works in popup
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Sufficient color contrast
- [ ] Focus indicators visible

## Browser Compatibility

While this is a Chrome extension, test on:
- [ ] Chrome (latest)
- [ ] Chrome (one version back)
- [ ] Chromium
- [ ] Edge (Chromium-based)

## Automated Testing (Future)

Consider adding:
- Unit tests for exporters
- Integration tests for content extraction
- E2E tests with Puppeteer

## Release Checklist

Before publishing a new version:

1. [ ] All tests passing
2. [ ] Version number updated in manifest.json and package.json
3. [ ] CHANGELOG.md updated
4. [ ] README.md updated if needed
5. [ ] No console warnings or errors
6. [ ] Build completes successfully
7. [ ] Extension works after fresh install
8. [ ] Documentation is current
9. [ ] Git commit with version tag
10. [ ] Create GitHub release

## Continuous Development

### Daily Workflow
```bash
# Start your day
cd gemini-chat-exporter
git pull origin main
npm install  # if package.json changed

# Make changes, test, repeat...

# End of day
git add .
git commit -m "Description of changes"
git push origin your-branch
```

### Code Review Checklist
- [ ] Code is clean and readable
- [ ] Comments explain complex logic
- [ ] No hardcoded values that should be configurable
- [ ] Error handling is comprehensive
- [ ] No debug console.log statements
- [ ] Follows existing code style

---

Happy developing! For questions, check [CONTRIBUTING.md](../CONTRIBUTING.md) or open an issue.
