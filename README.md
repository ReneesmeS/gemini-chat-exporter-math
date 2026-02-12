# Gemini Chat Exporter

A Chrome extension that allows you to export your Gemini AI conversations to Markdown or Word formats with all formatting, math formulas, and structure perfectly preserved.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow.svg)

## Features

- **Multiple Export Formats**: Export to Markdown (.md), LaTeX (.tex), or Word (.docx)
- **In-Chat Export Button**: Export a specific response directly from the Gemini UI
- **Math Formula Support**: Preserves KaTeX/LaTeX math formulas
- **Complete Formatting**: Maintains bold, italic, code blocks, tables, lists, and more
- **Flexible Export Options**:
  - Export single responses
  - Export entire conversations
  - Include/exclude timestamps and metadata
- **Modern UI**: Clean, intuitive interface
- **Performance**: Optimized content extraction and processing

## Screenshots

### Extension Popup
The extension provides a clean, user-friendly interface:
- Choose export scope (single response or full conversation)
- Select format (Markdown or Word)
- Toggle metadata options

### Exported Content
All exports maintain:
- Headings and text formatting
- Bullet and numbered lists
- Code blocks with syntax
- Tables with proper structure
- Math formulas (LaTeX notation)
- Blockquotes and horizontal rules

## Installation

### From Source (Development)

1. **Clone the repository**:
   ```bash
   # Repository
   git clone https://github.com/ReneesmeS/gemini-chat-exporter-math.git
   cd gemini-chat-exporter-math

   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `gemini-chat-exporter` folder

### Chrome Web Store (Planned)
Planned: Release on the Chrome Web Store.

## Usage

1. **Navigate to Gemini**: Open [gemini.google.com](https://gemini.google.com) and start or view a conversation

2. **Open the Extension**: Click the Gemini Chat Exporter icon in your Chrome toolbar

3. **Export in Chat (Single Response)**: Click the **Export** button next to a Gemini response and choose Markdown or Word

4. **Configure Export**:
   - Select export scope (current response or full conversation)
   - Choose your preferred format (Markdown or Word)
   - Toggle timestamp and metadata options as desired

5. **Export**: Click the format button to export

6. **Save**: Your browser will prompt you to save the file

## Development

### Project Structure
```
gemini-chat-exporter/
├── manifest.json           # Extension manifest
├── background.js           # Service worker
├── content.js              # Content script for extraction
├── popup.html              # Extension popup UI
├── popup.css               # Popup styling
├── popup.js                # Popup logic
├── exporters/
│   ├── markdown-exporter.js  # Markdown export logic
│   └── word-exporter.js      # Word export logic
├── icons/                  # Extension icons
├── libs/                   # External libraries (docx, KaTeX)
├── package.json            # NPM dependencies
└── README.md               # This file
```

### Technologies Used

- **Chrome Extension API**: Manifest V3
- **Content Scripts**: For extracting Gemini page content
- **docx**: Word document generation
- **KaTeX**: Math formula rendering

### Building from Source

```bash
# Install dependencies
npm install

# Copy required libraries to libs/
npm run copy-libs

# For development, load unpacked extension in Chrome
# For production, create package
npm run package
```

### Key Components

#### Content Script (`content.js`)
- Extracts conversation content from Gemini's DOM
- Parses HTML structure and formatting
- Identifies and extracts KaTeX math formulas
- Handles tables, lists, code blocks, etc.

#### Exporters
- **Markdown Exporter**: Converts to clean Markdown syntax
- **LaTeX Exporter**: Generates a standalone LaTeX document (.tex)
- **Word Exporter**: Creates .docx files with docx library

#### Background Worker (`background.js`)
- Coordinates export process
- Loads required libraries dynamically
- Manages file downloads

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use ES6+ features
- Follow existing code structure
- Add comments for complex logic
- Test thoroughly with different Gemini responses

## Known Issues & Limitations

- **Gemini UI Changes**: Extension relies on Gemini's DOM structure; updates may be required if the Gemini UI changes.
- **Large Conversations**: Very long conversations may take a few seconds to process
- **Word Export (Minor Issues)**: Word export is usable but may still have small formatting/math edge-case bugs depending on the exact Gemini output.

## Roadmap

- [ ] Add support for exporting images
- [ ] Add export to HTML format
- [ ] Batch export multiple conversations
- [ ] Custom styling options for exports
- [ ] Export conversation threads/history
- [ ] Cloud backup integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [docx](https://github.com/dolanmiu/docx) for Word document creation
- [KaTeX](https://katex.org/) for math formula rendering
- Google Gemini for providing the AI platform used in examples.

## Support

- **Issues**: [GitHub Issues](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ReneesmeS/gemini-chat-exporter-math/discussions)

## Show Your Support

If you find this extension helpful, please consider:
- Starring the repository
- Reporting bugs
- Suggesting new features
- Contributing code
- Sharing with others

---

Made by the community | [Report Bug](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues) | [Request Feature](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues)
