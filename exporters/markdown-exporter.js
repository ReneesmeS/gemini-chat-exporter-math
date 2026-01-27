/**
 * Markdown Exporter for Gemini Chat Exporter
 * Converts extracted Gemini content to clean Markdown format
 */

export class MarkdownExporter {
  constructor(data, options = {}) {
    this.data = data;
    this.options = {
      includeTimestamp: true,
      includeMeta: true,
      ...options
    };
  }

  /**
   * Generate Markdown content from extracted data
   * @returns {string} Markdown formatted content
   */
  export() {
    let markdown = '';

    // Add metadata header
    if (this.options.includeMeta) {
      markdown += this.generateHeader();
    }

    // Process each message
    this.data.messages.forEach((message, index) => {
      if (index > 0) {
        markdown += '\n---\n\n';
      }
      markdown += this.processMessage(message);
    });

    return markdown;
  }

  /**
   * Generate header with metadata
   * @returns {string} Header markdown
   */
  generateHeader() {
    const { metadata } = this.data;
    let header = '# Gemini Conversation Export\n\n';
    
    if (this.options.includeTimestamp) {
      const date = new Date(metadata.timestamp).toLocaleString();
      header += `**Exported:** ${date}\n\n`;
    }
    
    if (metadata.title && metadata.title !== 'Gemini Conversation') {
      header += `**Title:** ${metadata.title}\n\n`;
    }
    
    header += `**Messages:** ${metadata.messageCount}\n\n`;
    header += '---\n\n';
    
    return header;
  }

  /**
   * Process a single message
   * @param {Object} message - Message data
   * @returns {string} Markdown formatted message
   */
  processMessage(message) {
    if (!message || !message.structure) {
      return '';
    }

    let markdown = '';

    message.structure.forEach(block => {
      markdown += this.processBlock(block);
    });

    return markdown;
  }

  /**
   * Process a content block
   * @param {Object} block - Content block
   * @returns {string} Markdown formatted block
   */
  processBlock(block) {
    switch (block.type) {
      case 'paragraph':
        return this.processParagraph(block) + '\n\n';
      
      case 'heading':
        return this.processHeading(block) + '\n\n';
      
      case 'unordered-list':
      case 'ordered-list':
        return this.processList(block) + '\n\n';
      
      case 'blockquote':
        return this.processBlockquote(block) + '\n\n';
      
      case 'code-block':
        return this.processCodeBlock(block) + '\n\n';
      
      case 'horizontal-rule':
        return '---\n\n';
      
      case 'table':
        return this.processTable(block) + '\n\n';
      
      case 'math-block':
        return this.processMathBlock(block) + '\n\n';
      
      default:
        return block.text ? block.text + '\n\n' : '';
    }
  }

  /**
   * Process paragraph with inline content
   * @param {Object} block - Paragraph block
   * @returns {string} Markdown paragraph
   */
  processParagraph(block) {
    return this.processInlineContent(block.content);
  }

  /**
   * Process heading
   * @param {Object} block - Heading block
   * @returns {string} Markdown heading
   */
  processHeading(block) {
    const hashes = '#'.repeat(block.level);
    const content = this.processInlineContent(block.content);
    return `${hashes} ${content}`;
  }

  /**
   * Process list
   * @param {Object} block - List block
   * @returns {string} Markdown list
   */
  processList(block, indent = 0) {
    const prefix = block.type === 'ordered-list' ? '1. ' : '- ';
    const indentStr = '  '.repeat(indent);
    
    return block.items.map((item, index) => {
      const { text, mathBlocks } = this.splitInlineContent(item.content);
      let itemStr = indentStr + prefix + text.trim();
      
      if (mathBlocks.length > 0) {
        const continuationIndent = indentStr + '  ';
        mathBlocks.forEach(latex => {
          itemStr += `\n${continuationIndent}$$\n${continuationIndent}${latex}\n${continuationIndent}$$`;
        });
      }
      
      if (item.nested) {
        const nestedBlock = {
          type: item.nestedType === 'ordered' ? 'ordered-list' : 'unordered-list',
          items: item.nested
        };
        itemStr += '\n' + this.processList(nestedBlock, indent + 1);
      }
      
      return itemStr;
    }).join('\n');
  }

  /**
   * Process blockquote
   * @param {Object} block - Blockquote block
   * @returns {string} Markdown blockquote
   */
  processBlockquote(block) {
    const content = this.processInlineContent(block.content);
    return content.split('\n').map(line => `> ${line}`).join('\n');
  }

  /**
   * Process code block
   * @param {Object} block - Code block
   * @returns {string} Markdown code block
   */
  processCodeBlock(block) {
    const language = block.language || '';
    return '```' + language + '\n' + block.code + '\n```';
  }

  /**
   * Process table
   * @param {Object} block - Table block
   * @returns {string} Markdown table
   */
  processTable(block) {
    const { data } = block;
    let table = '';

    const renderCell = (cell) => {
      if (Array.isArray(cell)) {
        return this.processInlineContent(cell).replace(/\n/g, '<br>');
      }
      return (cell || '').toString().replace(/\n/g, '<br>');
    };

    // Headers
    if (data.headers && data.headers.length > 0) {
      table += '| ' + data.headers.map(renderCell).join(' | ') + ' |\n';
      table += '| ' + data.headers.map(() => '---').join(' | ') + ' |\n';
    }

    // Rows
    data.rows.forEach(row => {
      table += '| ' + row.map(renderCell).join(' | ') + ' |\n';
    });

    return table;
  }

  /**
   * Process math block
   * @param {Object} block - Math block
   * @returns {string} Markdown math block
   */
  processMathBlock(block) {
    return '$$\n' + block.latex + '\n$$';
  }

  /**
   * Process inline content (bold, italic, code, links, inline math)
   * @param {Array} content - Array of inline elements
   * @returns {string} Markdown inline content
   */
  processInlineContent(content) {
    if (!content || !Array.isArray(content)) {
      return '';
    }

    return content.map(element => {
      switch (element.type) {
        case 'text':
          return element.text;

        case 'bold':
          return `**${element.text}**`;

        case 'italic':
          return `*${element.text}*`;

        case 'code':
          return `\`${element.text}\``;

        case 'link':
          return `[${element.text}](${element.href})`;

        case 'math-inline':
          return `$${element.latex}$`;

        case 'math-block':
          return `\n\n$$\n${element.latex}\n$$\n\n`;

        default:
          return element.text || '';
      }
    }).join('');
  }

  /**
   * Split inline content into text and math blocks
   * @param {Array} content
   * @returns {{text: string, mathBlocks: string[]}}
   */
  splitInlineContent(content) {
    if (!content || !Array.isArray(content)) {
      return { text: '', mathBlocks: [] };
    }

    const mathBlocks = [];
    const textParts = [];

    content.forEach(element => {
      if (element.type === 'math-block' && element.latex) {
        mathBlocks.push(element.latex);
      } else if (element.type === 'math-inline' && element.latex) {
        textParts.push(`$${element.latex}$`);
      } else {
        textParts.push(this.processInlineContent([element]));
      }
    });

    return { text: textParts.join(''), mathBlocks };
  }

  /**
   * Generate filename for export
   * @returns {string} Suggested filename
   */
  getFilename() {
    const timestamp = new Date().toISOString().split('T')[0];
    const title = this.data.metadata.title || 'gemini-export';
    const sanitized = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
    return `${sanitized}-${timestamp}.md`;
  }

  /**
   * Static method to export data
   * @param {Object} data - Extracted data
   * @param {Object} options - Export options
   * @returns {Object} Export result with content and filename
   */
  static exportToMarkdown(data, options = {}) {
    const exporter = new MarkdownExporter(data, options);
    return {
      content: exporter.export(),
      filename: exporter.getFilename(),
      mimeType: 'text/markdown'
    };
  }
}
