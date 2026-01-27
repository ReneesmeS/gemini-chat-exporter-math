/**
 * Popup script for Gemini Chat Exporter
 * Handles UI interactions and coordinates export process
 */

import { MarkdownExporter } from './exporters/markdown-exporter.js';
import { WordExporter } from './exporters/word-exporter.js';

document.addEventListener('DOMContentLoaded', function() {
  const formatButtons = document.querySelectorAll('.format-btn');
  const statusElement = document.getElementById('status');
  const statusText = document.getElementById('statusText');

  // Update status
  function updateStatus(message, type = 'info') {
    statusText.textContent = message;
    statusElement.className = `status ${type}`;
    
    const icons = {
      info: 'i',
      success: '✓',
      error: '✗'
    };
    
    statusElement.querySelector('.status-icon').textContent = icons[type] || icons.info;
  }

  // Get selected options
  function getExportOptions() {
    const scopeRadio = document.querySelector('input[name="scope"]:checked');
    return {
      scope: scopeRadio ? scopeRadio.value : 'single',
      includeTimestamp: document.getElementById('includeTimestamp').checked,
      includeMeta: document.getElementById('includeMeta').checked
    };
  }

  // Handle format button clicks
  formatButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const format = this.dataset.format;
      const options = getExportOptions();
      
      updateStatus(`Extracting content...`, 'info');
      this.classList.add('loading');

      try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we're on Gemini
        if (!tab.url.includes('gemini.google.com')) {
          updateStatus('Please open a Gemini conversation first', 'error');
          this.classList.remove('loading');
          return;
        }

        // Extract content from page
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: options.scope === 'single' ? 'extractSingleResponse' : 'extractContent'
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to extract content');
        }

        updateStatus(`Generating ${format.toUpperCase()}...`, 'info');

        // Process export in popup (where libraries are available)
        let result;
        try {
          switch (format) {
            case 'markdown':
              result = MarkdownExporter.exportToMarkdown(response.data, options);
              await downloadFile(result.content, result.filename, result.mimeType);
              break;
            
            case 'word':
              result = await WordExporter.exportToWord(response.data, options);
              await downloadBlob(result.blob, result.filename);
              break;
            
            default:
              throw new Error(`Unknown format: ${format}`);
          }

          updateStatus('Exported successfully', 'success');
          setTimeout(() => {
            updateStatus('Ready to export', 'info');
          }, 3000);
        } catch (exportError) {
          throw new Error(`Export failed: ${exportError.message}`);
        }
      } catch (error) {
        console.error('Export error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        setTimeout(() => {
          updateStatus('Ready to export', 'info');
        }, 3000);
      } finally {
        this.classList.remove('loading');
      }
    });
  });

  // Help link
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/ReneesmeS/gemini-chat-exporter-math#usage' // updated to project repo
    });
  });

  // GitHub link
  document.getElementById('githubLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/ReneesmeS/gemini-chat-exporter-math' // updated to project repo
    });
  });

  // Check if we're on Gemini page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && !tabs[0].url.includes('gemini.google.com')) {
      updateStatus('Not on Gemini page', 'error');
    }
  });
});

/**
 * Download text content as file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
async function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  await downloadBlob(blob, filename);
}

/**
 * Download blob as file
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename
 */
async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  
  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });
    
    // Clean up object URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (error) {
    // Fallback: create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
