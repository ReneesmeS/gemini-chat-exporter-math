/**
 * Content script for Gemini Chat Exporter
 * Extracts conversation content from Gemini interface
 */

(function() {
  'use strict';

  /**
   * Extracts a single response message from Gemini
   * @param {Element} messageElement - The message container element
   * @returns {Object} Extracted message data
   */
  function extractMessage(messageElement) {
    const contentDiv = messageElement.querySelector('.markdown');
    if (!contentDiv) return null;

    const data = {
      type: 'response',
      html: contentDiv.innerHTML,
      text: contentDiv.innerText,
      timestamp: new Date().toISOString(),
      formattedElements: []
    };

    // Extract math formulas (KaTeX)
    const mathBlocks = contentDiv.querySelectorAll('.math-block');
    mathBlocks.forEach(block => {
      const latex = block.getAttribute('data-math');
      if (latex) {
        data.formattedElements.push({
          type: 'math-block',
          latex: latex,
          display: true
        });
      }
    });

    const mathInline = contentDiv.querySelectorAll('.math-inline');
    mathInline.forEach(inline => {
      const latex = inline.getAttribute('data-math');
      if (latex) {
        data.formattedElements.push({
          type: 'math-inline',
          latex: latex,
          display: false
        });
      }
    });

    // Extract formatted text structure
    data.structure = extractStructure(contentDiv);

    return data;
  }

  /**
   * Extracts structured content from the message
   * @param {Element} element - The content element
   * @returns {Array} Array of structured content blocks
   */
  function extractStructure(element) {
    const structure = [];

    const collectBlocks = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const tagName = node.tagName.toLowerCase();

      // Code block custom component
      if (tagName === 'code-block' || node.classList.contains('code-block')) {
        const pre = node.querySelector('pre');
        const codeEl = node.querySelector('pre code');
        if (pre && codeEl) {
          const languageLabel = node.querySelector('.code-block-decoration span');
          structure.push({
            tag: 'code-block',
            type: 'code-block',
            code: codeEl.innerText || pre.innerText,
            language: languageLabel ? languageLabel.innerText.trim().toLowerCase() : 'text'
          });
          return;
        }
      }

      // Handle block elements
      switch (tagName) {
        case 'p':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: 'paragraph',
            content: processInlineContent(node)
          });
          return;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: 'heading',
            level: parseInt(node.tagName[1]),
            content: processInlineContent(node)
          });
          return;
        case 'ul':
        case 'ol':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: tagName === 'ul' ? 'unordered-list' : 'ordered-list',
            items: extractListItems(node)
          });
          return;
        case 'blockquote':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: 'blockquote',
            content: processInlineContent(node)
          });
          return;
        case 'pre':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: 'code-block',
            code: node.innerText,
            language: (node.querySelector('code')?.className || '').replace('language-', '') || 'text'
          });
          return;
        case 'hr':
          structure.push({
            tag: tagName,
            text: '',
            html: '',
            type: 'horizontal-rule'
          });
          return;
        case 'table':
          structure.push({
            tag: tagName,
            text: node.innerText,
            html: node.innerHTML,
            type: 'table',
            data: extractTable(node)
          });
          return;
        case 'div':
          if (node.classList.contains('math-block')) {
            structure.push({
              tag: tagName,
              text: node.innerText,
              html: node.innerHTML,
              type: 'math-block',
              latex: node.getAttribute('data-math')
            });
            return;
          }
          break;
      }

      // Traverse children for wrapper elements
      node.childNodes.forEach(child => collectBlocks(child));
    };

    element.childNodes.forEach(child => collectBlocks(child));
    return structure;
  }

  /**
   * Process inline content (bold, italic, code, math, links)
   * @param {Element} element
   * @returns {Array} Array of inline elements
   */
  function processInlineContent(element, options = {}) {
    const content = [];
    const excludeSelectors = options.excludeSelectors || [];

    const shouldExclude = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return excludeSelectors.some(selector => node.matches(selector));
    };

    const walk = (node, target) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          target.push({
            type: 'text',
            text: node.textContent
          });
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE || shouldExclude(node)) {
        return;
      }

      const tagName = node.tagName.toLowerCase();

      if (tagName === 'br') {
        target.push({ type: 'text', text: '\n' });
        return;
      }

      if (tagName === 'div' && node.classList.contains('math-block')) {
        const latex = node.getAttribute('data-math');
        if (latex) {
          target.push({
            type: 'math-block',
            latex
          });
        }
        return;
      }

      if (tagName === 'span' && node.classList.contains('math-inline')) {
        const latex = node.getAttribute('data-math');
        if (latex) {
          target.push({
            type: 'math-inline',
            latex
          });
        }
        return;
      }

      // Skip KaTeX render spans; we export from data-math wrappers.
      if (tagName === 'span' && node.classList.contains('katex')) {
        return;
      }

      switch (tagName) {
        case 'b':
        case 'strong': {
          const inner = [];
          node.childNodes.forEach(child => walk(child, inner));
          target.push({
            type: 'bold',
            text: node.textContent,
            content: inner
          });
          return;
        }
        case 'i':
        case 'em': {
          const inner = [];
          node.childNodes.forEach(child => walk(child, inner));
          target.push({
            type: 'italic',
            text: node.textContent,
            content: inner
          });
          return;
        }
        case 'code':
          if (!node.closest('.math-inline')) {
            target.push({
              type: 'code',
              text: node.textContent
            });
          }
          return;
        case 'a': {
          const inner = [];
          node.childNodes.forEach(child => walk(child, inner));
          target.push({
            type: 'link',
            text: node.textContent,
            href: node.href,
            content: inner
          });
          return;
        }
      }

      node.childNodes.forEach(child => walk(child, target));
    };

    element.childNodes.forEach(child => walk(child, content));
    return content;
  }

  /**
   * Extract list items
   * @param {Element} listElement
   * @returns {Array} Array of list items
   */
  function extractListItems(listElement) {
    const items = [];
    const listItems = listElement.querySelectorAll(':scope > li');
    
    listItems.forEach(li => {
      const item = {
        content: processInlineContent(li, { excludeSelectors: ['ul', 'ol'] })
      };
      
      // Check for nested lists
      const nestedList = li.querySelector('ul, ol');
      if (nestedList) {
        item.nested = extractListItems(nestedList);
        item.nestedType = nestedList.tagName.toLowerCase() === 'ul' ? 'unordered' : 'ordered';
      }
      
      items.push(item);
    });
    
    return items;
  }

  /**
   * Extract table data
   * @param {Element} tableElement
   * @returns {Object} Table structure
   */
  function extractTable(tableElement) {
    const table = {
      headers: [],
      rows: []
    };

    const thead = tableElement.querySelector('thead');
    if (thead) {
      const headerCells = thead.querySelectorAll('th, td');
      headerCells.forEach(th => {
        table.headers.push(processInlineContent(th));
      });
    }

    const tbody = tableElement.querySelector('tbody') || tableElement;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(tr => {
      const row = [];
      const cells = tr.querySelectorAll('td, th');
      cells.forEach(cell => {
        row.push(processInlineContent(cell));
      });
      if (row.length > 0) {
        table.rows.push(row);
      }
    });

    return table;
  }

  /**
   * Extract all messages from the current conversation
   * @returns {Array} Array of all messages
   */
  function extractAllMessages() {
    const messages = [];
    const containers = document.querySelectorAll('message-content');

    containers.forEach(container => {
      const message = extractMessage(container);
      if (message) {
        messages.push(message);
      }
    });

    return messages;
  }

  /**
   * Get conversation metadata
   * @returns {Object} Conversation metadata
   */
  function getConversationMetadata() {
    return {
      url: window.location.href,
      title: document.title || 'Gemini Conversation',
      timestamp: new Date().toISOString(),
      messageCount: document.querySelectorAll('message-content').length
    };
  }

  const EXPORT_BUTTON_CLASS = 'gemini-export-button';
  const EXPORT_MENU_CLASS = 'gemini-export-menu';
  const EXPORT_MENU_OPEN_CLASS = 'gemini-export-menu-open';
  const EXPORT_FALLBACK_CONTAINER_CLASS = 'gemini-export-actions-container';
  let exportIdCounter = 0;

  function ensureBaseStyles() {
    if (document.getElementById('gemini-exporter-styles')) return;

    const style = document.createElement('style');
    style.id = 'gemini-exporter-styles';
    style.textContent = `
      .${EXPORT_BUTTON_CLASS} {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(255,255,255,0.06);
        background: linear-gradient(180deg, #1f1f1f, #171717);
        color: #f1f3f4;
        padding: 8px 12px;
        border-radius: 18px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        margin-left: auto;
        order: 9999;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      }
      .${EXPORT_BUTTON_CLASS}:hover {
        background: linear-gradient(180deg, #2b2b2b, #1f1f1f);
      }
      .${EXPORT_BUTTON_CLASS}:focus {
        outline: 2px solid rgba(99, 102, 241, 0.6);
        outline-offset: 2px;
      }
      .${EXPORT_BUTTON_CLASS}.loading {
        opacity: 0.6;
        pointer-events: none;
      }
      .${EXPORT_MENU_CLASS} {
        position: absolute;
        top: 50%;
        right: calc(10% + 2px);
        transform: translateY(-50%);
        background: #1f1f1f;
        color: #f1f3f4;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(16,18,20,0.6);
        padding: 8px;
        display: none;
        z-index: 99999;
        min-width: 200px;
        font-size: 13px;
      }
      .${EXPORT_MENU_CLASS}::before {
        content: '';
        position: absolute;
        top: 50%;
        right: 6px;
        width: 12px;
        height: 12px;
        background: inherit;
        transform: translateY(-50%) rotate(45deg);
        box-shadow: -1px -1px 1px rgba(0,0,0,0.2);
      }
      .${EXPORT_MENU_OPEN_CLASS} .${EXPORT_MENU_CLASS} {
        display: block;
      }
      .${EXPORT_MENU_CLASS} button {
        width: 100%;
        border: none;
        background: transparent;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        color: inherit;
        font-weight: 600;
      }
      .${EXPORT_MENU_CLASS} button:hover {
        background: rgba(255,255,255,0.04);
      }
      .${EXPORT_FALLBACK_CONTAINER_CLASS} {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 6px 0;
        margin-top: 6px;
        width: 100%;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureMessageId(messageElement) {
    if (!messageElement.dataset.geminiExportId) {
      exportIdCounter += 1;
      messageElement.dataset.geminiExportId = `gemini-export-${exportIdCounter}`;
    }
    return messageElement.dataset.geminiExportId;
  }

  function findButtonsContainer(messageElement) {
    const candidates = [];

    const directActions = messageElement.closest('message-actions, .response-container-footer, .actions-container-v2');
    if (directActions) {
      if (directActions.classList?.contains('buttons-container-v2')) {
        candidates.push(directActions);
      }
      candidates.push(directActions.querySelector('.buttons-container-v2'));
    }

    let node = messageElement;
    for (let i = 0; i < 5 && node; i++) {
      candidates.push(node.querySelector?.('.buttons-container-v2'));
      candidates.push(node.querySelector?.('[data-test-id="more-menu-button"]')?.closest('.buttons-container-v2'));

      if (node.nextElementSibling) {
        candidates.push(node.nextElementSibling.querySelector?.('.buttons-container-v2'));
        candidates.push(node.nextElementSibling.querySelector?.('[data-test-id="more-menu-button"]')?.closest('.buttons-container-v2'));
      }

      if (node.previousElementSibling) {
        candidates.push(node.previousElementSibling.querySelector?.('.buttons-container-v2'));
        candidates.push(node.previousElementSibling.querySelector?.('[data-test-id="more-menu-button"]')?.closest('.buttons-container-v2'));
      }

      node = node.parentElement;
    }

    return candidates.find(Boolean) || null;
  }

  function findResponseFooter(messageElement) {
    if (!messageElement) return null;

    if (messageElement.matches?.('.response-container-footer')) {
      return messageElement;
    }

    let node = messageElement;
    for (let i = 0; i < 6 && node; i++) {
      const sibling = node.nextElementSibling;
      if (sibling?.matches?.('.response-container-footer')) {
        return sibling;
      }
      const siblingFooter = sibling?.querySelector?.('.response-container-footer');
      if (siblingFooter) {
        return siblingFooter;
      }

      const parentFooter = node.parentElement?.querySelector?.('.response-container-footer');
      if (parentFooter) {
        return parentFooter;
      }

      node = node.parentElement;
    }

    return null;
  }

  function getOrCreateButtonsContainer(messageElement) {
    const existing = findButtonsContainer(messageElement);
    if (existing) return existing;

    const footer = findResponseFooter(messageElement);
    if (!footer) return null;

    const fallback = footer.querySelector(`.${EXPORT_FALLBACK_CONTAINER_CLASS}`);
    if (fallback) return fallback;

    const container = document.createElement('div');
    container.className = EXPORT_FALLBACK_CONTAINER_CLASS;
    footer.appendChild(container);
    return container;
  }

  function scheduleExportButtonRetry(messageElement) {
    if (!messageElement || !messageElement.dataset) return;
    const current = Number(messageElement.dataset.geminiExportRetry || '0');
    if (current >= 6) return;
    messageElement.dataset.geminiExportRetry = String(current + 1);

    const delay = 200 + current * 200;
    setTimeout(() => {
      requestAnimationFrame(() => ensureExportButton(messageElement));
    }, delay);
  }

  function buildExportMenu(messageElement) {
    const menu = document.createElement('div');
    menu.className = EXPORT_MENU_CLASS;

    const markdownButton = document.createElement('button');
    markdownButton.type = 'button';
    markdownButton.textContent = 'Export Markdown (.md)';
    markdownButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      await handleInChatExport(messageElement, 'markdown');
      closeAllExportMenus();
    });

    const wordButton = document.createElement('button');
    wordButton.type = 'button';
    wordButton.textContent = 'Export Word (.docx)';
    wordButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      await handleInChatExport(messageElement, 'word');
      closeAllExportMenus();
    });

    const latexButton = document.createElement('button');
    latexButton.type = 'button';
    latexButton.textContent = 'Export LaTeX (.tex)';
    latexButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      await handleInChatExport(messageElement, 'latex');
      closeAllExportMenus();
    });

    menu.appendChild(markdownButton);
    menu.appendChild(wordButton);
    menu.appendChild(latexButton);

    return menu;
  }

  function ensureExportButton(messageElement) {
    const contentDiv = messageElement.querySelector('.markdown');
    if (!contentDiv) return;

    const buttonsContainer = getOrCreateButtonsContainer(messageElement);
    if (!buttonsContainer) {
      scheduleExportButtonRetry(messageElement);
      return;
    }

    ensureBaseStyles();
    ensureMessageId(messageElement);

    if (buttonsContainer.querySelector(`.${EXPORT_BUTTON_CLASS}[data-export-id="${messageElement.dataset.geminiExportId}"]`)) {
      return;
    }

    buttonsContainer.style.position = buttonsContainer.style.position || 'relative';

    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.className = EXPORT_BUTTON_CLASS;
    exportButton.textContent = 'Export';
    exportButton.setAttribute('aria-label', 'Export this response');
    exportButton.dataset.exportId = messageElement.dataset.geminiExportId;

    exportButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleExportMenu(buttonsContainer, messageElement);
    });

    buttonsContainer.appendChild(exportButton);
  }

  function toggleExportMenu(buttonsContainer, messageElement) {
    closeAllExportMenus();
    const wrapper = buttonsContainer;
    if (wrapper.classList.contains(EXPORT_MENU_OPEN_CLASS)) {
      wrapper.classList.remove(EXPORT_MENU_OPEN_CLASS);
      return;
    }

    let menu = wrapper.querySelector(`.${EXPORT_MENU_CLASS}`);
    if (!menu) {
      menu = buildExportMenu(messageElement);
      wrapper.appendChild(menu);
    }

    wrapper.classList.add(EXPORT_MENU_OPEN_CLASS);
  }

  function closeAllExportMenus() {
    document.querySelectorAll(`.${EXPORT_MENU_OPEN_CLASS}`).forEach(element => {
      element.classList.remove(EXPORT_MENU_OPEN_CLASS);
    });
  }

  async function ensureDocxLoaded() {
    if (globalThis.docx) return;
    await import(chrome.runtime.getURL('libs/docx.js'));
  }

  async function handleInChatExport(messageElement, format) {
    const exportButton = document.querySelector(`.${EXPORT_BUTTON_CLASS}[data-export-id="${messageElement.dataset.geminiExportId}"]`);
    if (exportButton) {
      exportButton.classList.add('loading');
    }

    try {
      const message = extractMessage(messageElement);
      if (!message) {
        throw new Error('No response content found');
      }

      const metadata = getConversationMetadata();
      const data = {
        metadata: {
          ...metadata,
          messageCount: 1
        },
        messages: [message]
      };

      const options = {
        includeTimestamp: true,
        includeMeta: true
      };

      if (format === 'markdown') {
        const { MarkdownExporter } = await import(chrome.runtime.getURL('exporters/markdown-exporter.js'));
        const result = MarkdownExporter.exportToMarkdown(data, options);
        await downloadFile(result.content, result.filename, result.mimeType);
      } else if (format === 'word') {
        await ensureDocxLoaded();
        const { WordExporter } = await import(chrome.runtime.getURL('exporters/word-exporter.js'));
        const result = await WordExporter.exportToWord(data, options);
        await downloadBlob(result.blob, result.filename);
      } else if (format === 'latex') {
        const { LatexExporter } = await import(chrome.runtime.getURL('exporters/latex-exporter.js'));
        const result = LatexExporter.exportToLatex(data, options);
        await downloadFile(result.content, result.filename, result.mimeType);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('In-chat export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      if (exportButton) {
        exportButton.classList.remove('loading');
      }
    }
  }

  async function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    await downloadBlob(blob, filename);
  }

  async function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);

    try {
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
    } catch (error) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }

  function scanForMessages(root = document) {
    const messageNodes = root.querySelectorAll ? root.querySelectorAll('message-content') : [];
    messageNodes.forEach(messageElement => ensureExportButton(messageElement));
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      const metadata = getConversationMetadata();
      const messages = extractAllMessages();
      
      sendResponse({
        success: true,
        data: {
          metadata,
          messages
        }
      });
    } else if (request.action === 'extractSingleResponse') {
      // Extract the most recent response
      const containers = document.querySelectorAll('message-content');
      if (containers.length > 0) {
        const lastContainer = containers[containers.length - 1];
        const message = extractMessage(lastContainer);
        const metadata = getConversationMetadata();
        
        sendResponse({
          success: true,
          data: {
            metadata,
            messages: [message]
          }
        });
      } else {
        sendResponse({
          success: false,
          error: 'No messages found'
        });
      }
    }
    
    return true; // Keep the message channel open for async response
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest(`.${EXPORT_MENU_CLASS}`) && !event.target.closest(`.${EXPORT_BUTTON_CLASS}`)) {
      closeAllExportMenus();
    }
  });

  scanForMessages();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches && node.matches('message-content')) {
          ensureExportButton(node);
        } else {
          scanForMessages(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  console.log('Gemini Chat Exporter content script loaded');
})();
