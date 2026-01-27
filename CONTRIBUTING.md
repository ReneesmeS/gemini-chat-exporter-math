# Contributing to Gemini Chat Exporter

Thank you for your interest in contributing to Gemini Chat Exporter! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (Chrome version, OS, etc.)
- **Extension version**

### Suggesting Features

Feature suggestions are welcome! Please:

- **Check existing feature requests** first
- **Describe the feature** clearly and in detail
- **Explain the use case** and why it would be useful
- **Provide examples** if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test thoroughly** with different Gemini responses
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Chrome (latest version)
- Basic knowledge of JavaScript and Chrome Extensions

### Setting Up

```bash
# Clone your fork
git clone https://github.com/your-username/gemini-chat-exporter.git
cd gemini-chat-exporter

# Install dependencies
npm install

# Build libraries
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project directory
```

### Development Workflow

1. **Make changes** to the code
2. **Reload the extension** in Chrome (click reload button on chrome://extensions/)
3. **Test on Gemini** with various conversation types
4. **Check console** for errors in both the extension and page contexts

### Testing

Test your changes with:

- **Different content types**: text, code, tables, lists, math formulas
- **Various formats**: Markdown, Word
- **Edge cases**: very long conversations, special characters, nested lists
- **Both export modes**: single response and full conversation

## Code Guidelines

### JavaScript Style

- Use **ES6+ syntax** (const/let, arrow functions, template literals)
- Use **meaningful variable names**
- Add **comments** for complex logic
- Follow the **existing code structure**

Example:
```javascript
/**
 * Process a content block
 * @param {Object} block - Content block from extraction
 * @returns {string} Processed content
 */
function processBlock(block) {
  // Clear logic with comments where needed
  switch (block.type) {
    case 'paragraph':
      return processParagraph(block);
    // ... other cases
  }
}
```

### File Organization

- **Keep files focused**: Each file should have a clear, single purpose
- **Use modules**: Export/import for better organization
- **Group related functions**: Keep utility functions together

### Error Handling

- **Always handle errors** gracefully
- **Provide meaningful error messages**
- **Log errors** for debugging

```javascript
try {
  // Your code
} catch (error) {
  console.error('Descriptive error message:', error);
  // User-friendly error handling
}
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] Extension loads without errors
- [ ] All export formats work (Markdown, Word)
- [ ] Math formulas are preserved
- [ ] Tables export correctly
- [ ] Code blocks maintain formatting
- [ ] Lists (nested and non-nested) export properly
- [ ] Both export modes work (single/full conversation)
- [ ] No console errors
- [ ] UI is responsive and functional

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add support for nested blockquotes
fix: Resolve math formula escaping in Markdown
docs: Update installation instructions
style: Format code according to guidelines
refactor: Simplify content extraction logic
test: Add tests for table export
```

### Pull Request Process

1. **Update README** if you changed functionality
2. **Add/update comments** in your code
3. **Test thoroughly** before submitting
4. **Describe your changes** clearly in the PR description
5. **Link related issues** using `Fixes #123` or `Relates to #456`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How you tested your changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Tested all export formats
- [ ] No console errors
```

## Architecture

### Key Components

1. **Content Script (`content.js`)**
   - Runs on Gemini pages
   - Extracts conversation content
   - Parses DOM structure

2. **Background Worker (`background.js`)**
   - Coordinates export process
   - Manages library loading
   - Handles file downloads

3. **Popup UI (`popup.html`, `popup.js`, `popup.css`)**
   - User interface
   - Export options
   - Status feedback

4. **Exporters (`exporters/*.js`)**
   - Format-specific export logic
   - Content transformation
   - File generation

### Data Flow

```
Gemini Page → Content Script (extract) → Popup (user choice) 
→ Background Worker (process) → Exporter (generate) → Download
```

## Design Guidelines

### UI/UX

- Keep the interface **simple and intuitive**
- Provide **clear feedback** for user actions
- Use **consistent styling** with existing design
- Ensure **accessibility** (proper labels, keyboard navigation)

### Icons

- Use **clear, recognizable icons**
- Maintain **consistent size and style**
- Provide **appropriate hover states**

## Questions?

If you have questions:

1. Check existing **documentation** and **issues**
2. Ask in **GitHub Discussions**
3. Open an **issue** for clarification

## Code of Conduct

- Be **respectful** and **inclusive**
- Provide **constructive feedback**
- Focus on the **code and ideas**, not individuals
- Help create a **positive community**

## Thank You!

Every contribution, big or small, makes a difference. Thank you for helping improve Gemini Chat Exporter!

---

Happy Coding!
