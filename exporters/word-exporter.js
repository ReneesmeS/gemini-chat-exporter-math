/**
 * Word Exporter for Gemini Chat Exporter
 * Converts extracted Gemini content to DOCX format
 * Note: This requires docx library to be loaded
 */

export class WordExporter {
  constructor(data, options = {}) {
    this.data = data;
    this.options = {
      includeTimestamp: true,
      includeMeta: true,
      ...options
    };
  }

  /**
   * Generate DOCX from extracted data
   * @returns {Promise<Blob>} DOCX blob
   */
  async export() {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
            UnderlineType, Table, TableCell, TableRow, WidthType, BorderStyle } = docx;

    const children = [];
    const numbering = {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: docx.AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } }
            },
            {
              level: 1,
              format: 'decimal',
              text: '%2.',
              alignment: docx.AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } }
            },
            {
              level: 2,
              format: 'decimal',
              text: '%3.',
              alignment: docx.AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 2160, hanging: 360 } } }
            }
          ]
        }
      ]
    };

    // Add metadata header
    if (this.options.includeMeta) {
      children.push(...this.generateHeader());
    }

    // Process each message
    for (let index = 0; index < this.data.messages.length; index++) {
      const message = this.data.messages[index];
      if (index > 0) {
        children.push(this.createSeparator());
      }
      const messageElements = await this.processMessage(message);
      children.push(...messageElements);
    }

    // Create document
    const doc = new Document({
      numbering,
      sections: [{
        properties: {},
        children: children
      }]
    });

    // Generate blob
    const blob = await Packer.toBlob(doc);
    return blob;
  }

  /**
   * Generate header with metadata
   * @returns {Array} Array of paragraphs
   */
  generateHeader() {
    const { metadata } = this.data;
    const header = [];

    // Title
    header.push(
      new docx.Paragraph({
        text: 'Gemini Conversation Export',
        heading: docx.HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      })
    );

    // Metadata
    if (this.options.includeTimestamp) {
      const date = new Date(metadata.timestamp).toLocaleString();
      header.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: 'Exported: ', bold: true }),
            new docx.TextRun({ text: date })
          ],
          spacing: { after: 100 }
        })
      );
    }

    if (metadata.title && metadata.title !== 'Gemini Conversation') {
      header.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: 'Title: ', bold: true }),
            new docx.TextRun({ text: metadata.title })
          ],
          spacing: { after: 100 }
        })
      );
    }

    header.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({ text: 'Messages: ', bold: true }),
          new docx.TextRun({ text: metadata.messageCount.toString() })
        ],
        spacing: { after: 200 }
      })
    );

    header.push(this.createSeparator());

    return header;
  }

  /**
   * Create separator
   * @returns {Paragraph} Separator paragraph
   */
  createSeparator() {
    return new docx.Paragraph({
      border: {
        bottom: {
          color: 'CCCCCC',
          space: 1,
          style: docx.BorderStyle.SINGLE,
          size: 6
        }
      },
      spacing: { before: 200, after: 200 }
    });
  }

  /**
   * Process a single message
   * @param {Object} message - Message data
   * @returns {Array} Array of document elements
   */
  async processMessage(message) {
    if (!message || !message.structure) {
      return [];
    }

    const elements = [];

    for (const block of message.structure) {
      const blockElements = await this.processBlock(block);
      if (blockElements) {
        if (Array.isArray(blockElements)) {
          elements.push(...blockElements);
        } else {
          elements.push(blockElements);
        }
      }
    }

    return elements;
  }

  /**
   * Process a content block
   * @param {Object} block - Content block
   * @returns {Array|Object} Document elements
   */
  async processBlock(block) {
    switch (block.type) {
      case 'paragraph':
        return await this.createParagraph(block);
      
      case 'heading':
        return await this.createHeading(block);
      
      case 'unordered-list':
      case 'ordered-list':
        return await this.createList(block);
      
      case 'blockquote':
        return await this.createBlockquote(block);
      
      case 'code-block':
        return this.createCodeBlock(block);
      
      case 'horizontal-rule':
        return this.createSeparator();
      
      case 'table':
        return await this.createTable(block);
      
      case 'math-block':
        return await this.createMathBlock(block);
      
      default:
        return null;
    }
  }

  /**
   * Create paragraph
   * @param {Object} block - Paragraph block
   * @returns {Paragraph} Word paragraph
   */
  async createParagraph(block) {
    const children = await this.processInlineContent(block.content);
    return new docx.Paragraph({
      children: children,
      spacing: { after: 200 }
    });
  }

  /**
   * Create heading
   * @param {Object} block - Heading block
   * @returns {Paragraph} Word heading
   */
  async createHeading(block) {
    const levels = [
      docx.HeadingLevel.HEADING_1,
      docx.HeadingLevel.HEADING_2,
      docx.HeadingLevel.HEADING_3,
      docx.HeadingLevel.HEADING_4,
      docx.HeadingLevel.HEADING_5,
      docx.HeadingLevel.HEADING_6
    ];
    
    const children = await this.processInlineContent(block.content);
    return new docx.Paragraph({
      children: children,
      heading: levels[block.level - 1] || docx.HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 }
    });
  }

  /**
   * Create list
   * @param {Object} block - List block
   * @param {number} level - Nesting level
   * @returns {Array} Array of paragraphs
   */
  async createList(block, level = 0) {
    const paragraphs = [];
    
    for (const item of block.items) {
      const children = await this.processInlineContent(item.content);
      
      paragraphs.push(
        new docx.Paragraph({
          children: children,
          bullet: block.type === 'unordered-list' ? { level: level } : undefined,
          numbering: block.type === 'ordered-list' ? {
            reference: 'default-numbering',
            level: level
          } : undefined,
          spacing: { after: 100 }
        })
      );
      
      // Handle nested lists
      if (item.nested) {
        const nestedBlock = {
          type: item.nestedType === 'ordered' ? 'ordered-list' : 'unordered-list',
          items: item.nested
        };
        const nestedParagraphs = await this.createList(nestedBlock, level + 1);
        paragraphs.push(...nestedParagraphs);
      }
    }
    
    return paragraphs;
  }

  /**
   * Create blockquote
   * @param {Object} block - Blockquote block
   * @returns {Paragraph} Word paragraph styled as quote
   */
  async createBlockquote(block) {
    const children = await this.processInlineContent(block.content);
    return new docx.Paragraph({
      children: children,
      italics: true,
      indent: { left: 720 },
      border: {
        left: {
          color: '999999',
          space: 1,
          style: docx.BorderStyle.SINGLE,
          size: 12
        }
      },
      spacing: { after: 200 }
    });
  }

  /**
   * Create code block
   * @param {Object} block - Code block
   * @returns {Paragraph} Word paragraph styled as code
   */
  createCodeBlock(block) {
    const lines = block.code.split('\n');
    const children = [];
    
    lines.forEach((line, index) => {
      children.push(new docx.TextRun({
        text: line,
        font: 'Courier New',
        size: 20
      }));
      if (index < lines.length - 1) {
        children.push(new docx.TextRun({ text: '', break: 1 }));
      }
    });
    
    return new docx.Paragraph({
      children: children,
      shading: {
        fill: 'F5F5F5'
      },
      spacing: { after: 200 }
    });
  }

  /**
   * Create table
   * @param {Object} block - Table block
   * @returns {Table} Word table
   */
  async createTable(block) {
    const { data } = block;
    const rows = [];

    // Add header row
    if (data.headers && data.headers.length > 0) {
      const headerCells = [];
      for (const header of data.headers) {
        const headerRuns = await this.processInlineContent(Array.isArray(header) ? header : [{ type: 'text', text: header || '' }]);
        headerCells.push(
          new docx.TableCell({
            children: [new docx.Paragraph({ children: headerRuns })],
            shading: { fill: 'F0F0F0' }
          })
        );
      }
      rows.push(new docx.TableRow({ children: headerCells }));
    }

    // Add data rows
    for (const row of data.rows) {
      const cells = [];
      for (const cell of row) {
        const cellRuns = await this.processInlineContent(Array.isArray(cell) ? cell : [{ type: 'text', text: cell || '' }]);
        cells.push(
          new docx.TableCell({
            children: [new docx.Paragraph({ children: cellRuns })]
          })
        );
      }
      rows.push(new docx.TableRow({ children: cells }));
    }

    return new docx.Table({
      rows: rows,
      width: {
        size: 100,
        type: docx.WidthType.PERCENTAGE
      }
    });
  }

  /**
   * Create math block
   * @param {Object} block - Math block with LaTeX
   * @returns {Paragraph} Word paragraph with formula
   */
  async createMathBlock(block) {
    const mathRun = this.createMathRun(block.latex);
    return new docx.Paragraph({
      children: mathRun ? [mathRun] : [new docx.TextRun({ text: block.latex || '' })],
      shading: {
        fill: 'FAFAFA'
      },
      spacing: { after: 200 }
    });
  }

  /**
   * Process inline content
   * @param {Array} content - Array of inline elements
   * @returns {Array} Array of TextRun objects
   */
  async processInlineContent(content) {
    if (!content || !Array.isArray(content)) {
      return [new docx.TextRun({ text: '' })];
    }

    const runs = [];

    for (const element of content) {
      if (element.type === 'math-block' && element.latex) {
        const mathRun = this.createMathRun(element.latex);
        runs.push(new docx.TextRun({ text: '', break: 1 }));
        if (mathRun) {
          runs.push(mathRun);
        } else {
          runs.push(new docx.TextRun({ text: element.latex }));
        }
        runs.push(new docx.TextRun({ text: '', break: 1 }));
        continue;
      }

      if (element.type === 'math-inline' && element.latex) {
        const mathRun = this.createMathRun(element.latex);
        if (mathRun) {
          runs.push(mathRun);
          continue;
        }
      }

      const options = { text: '' };

      switch (element.type) {
        case 'text':
          options.text = element.text;
          break;

        case 'bold':
          options.text = element.text;
          options.bold = true;
          break;

        case 'italic':
          options.text = element.text;
          options.italics = true;
          break;

        case 'code':
          options.text = element.text;
          options.font = 'Courier New';
          options.shading = { fill: 'F5F5F5' };
          break;

        case 'link':
          options.text = element.href ? `${element.text} (${element.href})` : element.text;
          break;

        default:
          options.text = element.text || '';
      }

      runs.push(new docx.TextRun(options));
    }

    return runs.length ? runs : [new docx.TextRun({ text: '' })];
  }

  createMathRun(latex) {
    const cleanedLatex = this.fixLatexForWord(latex);
    if (!cleanedLatex || !docx?.Math || !docx?.MathRun) {
      return cleanedLatex ? new docx.TextRun({ text: cleanedLatex }) : null;
    }

    return new docx.Math({
      children: [new docx.MathRun(cleanedLatex)]
    });
  }

  fixLatexForWord(latex) {
    if (!latex) {
      return '';
    }

    let clean = latex;

    // DEGREE SYMBOL FIX
    // Replace standalone ^\circ (not attached to a number/letter/group) with \degree for Word.
    // Example: (^\circ) -> (\degree)
    // Do not replace: 3^\circ, x^\circ, (x)^\circ, {x}^\circ
    clean = clean.replace(/\^\s*\\circ\b/g, (match, offset, str) => {
      let i = offset - 1;
      while (i >= 0 && /\s/.test(str[i])) {
        i--;
      }

      if (i < 0) {
        return '\\degree';
      }

      const prev = str[i];
      if (/[A-Za-z0-9}\])]/.test(prev)) {
        return match;
      }

      return '\\degree';
    });

    // BAR FIX
    // Replace empty \bar{} with \bar{\phantom{a}} to ensure Word preserves an overbar placeholder when no base is present.
    clean = clean.replace(/\\bar\{\s*\}/g, "\\\\bar{\\\\phantom{a}}");

    // TRAILING GREEK COMMAND FIX
    // If a LaTeX string ends with a Greek command (e.g., "\\theta"), Word's math parser can sometimes drop it.
    // Wrapping the trailing command in braces helps: "...\\theta" -> "...{\\theta}".
    // Only applies at the end of the string (allowing trailing whitespace).
    const greekCommands = [
      'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
      'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho',
      'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
      'varpi', 'varrho', 'varsigma', 'varphi', 'varepsilon',
      'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
      'Upsilon', 'Phi', 'Psi', 'Omega'
    ];
    const trailingGreekPattern = new RegExp(`\\\\(?:${greekCommands.join('|')})(?:\\s*)$`);
    clean = clean.replace(trailingGreekPattern, (match) => `{${match.trim()}}`);

    // Fix \\tfrac -> \\frac
    clean = clean.replace(/\\tfrac\\b/g, "\\frac");
    
    // 1. LIMIT FIX
    // Removes the space after \lim, \sup, \inf, etc. so Word groups them correctly.
    clean = clean.replace(/\\(lim|sup|inf|min|max|limsup|liminf)(_\{[^}]+\}|_\S)?\s+(?=\S)/g, "\\$1$2");

    // 2. MODULO FIXES
    // Fix \pmod{n} -> (\text{mod } n)
    clean = clean.replace(/\\pmod\{([^}]+)\}/g, "(\\text{mod } $1)");

    // Fix \mod or \bmod -> \text{mod }
    clean = clean.replace(/\\(mod|bmod)\b/g, "\\text{mod }");

    // 3. MATRIX FIXES
    // Convert \begin{bmatrix} -> [\begin{matrix}]
    clean = clean.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g,
      "\\left[\\begin{matrix}$1\\end{matrix}\\right]");

    // Convert \begin{pmatrix} -> (\begin{matrix})
    clean = clean.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g,
      "\\left(\\begin{matrix}$1\\end{matrix}\\right)");

    // Convert \begin{vmatrix} -> |\begin{matrix}| (Determinant)
    clean = clean.replace(/\\begin\{vmatrix\}([\s\S]*?)\\end\{vmatrix\}/g,
      "\\left|\\begin{matrix}$1\\end{matrix}\\right|");

    // 4. CASES FIX
    // Convert \begin{cases} -> \left\{\begin{matrix}...\end{matrix}\right.
    clean = clean.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g,
      "\\left\\{\\begin{matrix}$1\\end{matrix}\\right.");

    return clean;
  }

  /**
   * Generate filename for export
   * @returns {string} Suggested filename
   */
  getFilename() {
    const timestamp = new Date().toISOString().split('T')[0];
    const title = this.data.metadata.title || 'gemini-export';
    const sanitized = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
    return `${sanitized}-${timestamp}.docx`;
  }

  /**
   * Static method to export data
   * @param {Object} data - Extracted data
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result with blob and filename
   */
  static async exportToWord(data, options = {}) {
    const exporter = new WordExporter(data, options);
    const blob = await exporter.export();
    return {
      blob,
      filename: exporter.getFilename(),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }
}
