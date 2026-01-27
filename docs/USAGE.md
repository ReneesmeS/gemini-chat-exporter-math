# Gemini Chat Exporter - Usage Guide

## Getting Started

Once installed, the Gemini Chat Exporter makes it easy to save your AI conversations in multiple formats.

## Basic Usage

### 1. Open a Gemini Conversation

Navigate to [gemini.google.com](https://gemini.google.com) and start or view a conversation.

### 2. Click the Extension Icon

Click the Gemini Chat Exporter icon in your Chrome toolbar (top-right area).

### 2b. Export Directly in Chat (Single Response)

Each Gemini response includes an **Export** button next to the response actions. Click it and choose Markdown or Word to export that single response.

### 3. Configure Export Options

#### Export Scope
- **Current Response**: Exports only the most recent Gemini response
- **Full Conversation**: Exports the entire conversation thread

#### Export Format
- **Markdown (.md)**: Plain text with formatting markup
- **Word (.docx)**: Editable Microsoft Word document

#### Options
- **Include timestamp**: Adds export date/time to the file
- **Include metadata**: Adds conversation title and message count

### 4. Export

Click the format button (Markdown or Word) to start the export.

### 5. Save

Your browser will prompt you to choose a save location. The filename is automatically generated based on:
- Conversation title
- Current date
- Format extension

Example: `gemini-export-2026-01-26.md`

## Export Format Details

### Markdown Export

**Best for**: Version control, editing, sharing as plain text

**Features**:
- Clean, readable formatting
- Full math formula support (LaTeX notation: `$formula$` or `$$formula$$`)
- Tables in Markdown format
- Code blocks with syntax highlighting hints
- Nested lists
- Links and inline formatting

**Example Output**:
```markdown
# Gemini Conversation Export

**Exported:** 1/26/2026, 10:30:00 AM

---

## Question

What is the quadratic formula?

## Response

The quadratic formula is:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

This formula solves equations of the form $ax^2 + bx + c = 0$.
```

### Word Export

**Best for**: Further editing, collaboration, formatting

**Features**:
- Full Microsoft Word compatibility (.docx)
- Editable text with formatting
- Tables that can be modified
- List formatting
- Math formulas (as text notation)
- Styles for easy reformatting

**Use Cases**:
- Add your own commentary
- Reformat for reports
- Combine multiple exports
- Share with non-technical users

## Advanced Features

### Exporting Math Formulas

The extension preserves math formulas in all formats:

**In Gemini**:
```
e^(iπ) + 1 = 0
```

**Markdown Output**:
```markdown
$e^{i\pi} + 1 = 0$
```

**Word Output**: 
[e^{i\pi} + 1 = 0] (editable text)

### Exporting Tables

Tables maintain their structure across all formats:

| Feature | Markdown | Word |
|---------|----------|------|
| Editable | ✓ | ✓ |
| Styling | Basic | Rich |

### Exporting Code Blocks

Code blocks preserve formatting:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

All formats maintain:
- Indentation
- Line breaks
- Syntax indicators (language tags in Markdown)

## Tips & Best Practices

### For Optimal Results

1. **Wait for Complete Response**: Ensure Gemini has finished generating the response before exporting

2. **Check Content**: Review the conversation before exporting to ensure all desired content is visible

3. **Choose the Right Format**:
    - Need to edit? → Word
    - Want to share code? → Markdown

4. **Use Metadata**: Keep metadata enabled to track when and what was exported

### Handling Large Conversations

For very long conversations:
- Export may take a few seconds
- Consider exporting in sections (use "Current Response" mode)
- Word exports might be large for very long conversations

### Preserving Formatting

To maintain best formatting:
- Keep original Gemini formatting (don't manually edit in browser)
- Export soon after conversation (before Gemini UI updates)
- Test exports with sample data first

## Keyboard Shortcuts

Currently, the extension doesn't support keyboard shortcuts, but you can:
1. Use Chrome's extension shortcut settings
2. Navigate to `chrome://extensions/shortcuts`
3. Assign a custom shortcut to open the popup

## Troubleshooting Exports

### Empty or Incomplete Export

**Problem**: Exported file is missing content

**Solutions**:
- Ensure you scrolled through the entire conversation
- Wait for Gemini to finish loading
- Try refreshing the page and re-exporting

### Formatting Issues

**Problem**: Formatting doesn't look right

**Solutions**:
- Verify you're viewing the file in the correct application
- Markdown: Use a Markdown viewer (VS Code, Typora, etc.)
- Word: Open in Microsoft Word or Google Docs

### Math Formulas Not Rendering

**Problem**: Math formulas appear as text

**Expected**: In Word exports, formulas appear as LaTeX notation (this is normal)

**For Better Math Rendering**:
- Use Markdown export
- View in an editor that supports LaTeX (Typora, VS Code with extensions)

## Examples

### Example 1: Exporting a Coding Tutorial

1. Have Gemini explain a programming concept
2. Select "Current Response"
3. Choose "Markdown"
4. Save to your projects folder
5. View in your code editor with syntax highlighting

### Example 2: Saving Research Conversations

1. Complete your research conversation
2. Select "Full Conversation"
3. Choose "Word"
4. Save with a descriptive filename
5. Print or archive for records

### Example 3: Creating Study Materials

1. Ask Gemini about a topic
2. Export each response separately
3. Use "Word" format
4. Combine exports into a study guide
5. Add your own notes and highlights

## Frequently Asked Questions

See [FAQ.md](FAQ.md) for common questions and answers.

## Feedback & Feature Requests

Have suggestions? We'd love to hear them!

- [Report Issues](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues)
- [Request Features](https://github.com/ReneesmeS/gemini-chat-exporter-math/issues/new?labels=enhancement)
- [Contribute](../CONTRIBUTING.md)

---

Enjoy exporting your Gemini conversations!
