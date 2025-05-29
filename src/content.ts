// src/content.ts
import { adfToMarkdown } from './adf-to-md'

function extractPageId(path: string): string | null {
  const m = path.match(/\/pages\/(\d+)/)
  return m?.[1] ?? null
}

function showToast(message: string) {
  // Remove existing toast if any
  const existingToast = document.getElementById('confluence-copy-toast')
  if (existingToast) {
    existingToast.remove()
  }

  // Create toast element
  const toast = document.createElement('div')
  toast.id = 'confluence-copy-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    transition: opacity 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `
  
  document.body.appendChild(toast)
  
  // Fade out and remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

async function copyPageAsMd() {
  console.log('copyPageAsMd called')
  const pageId = extractPageId(location.pathname)
  console.log('Page ID:', pageId, 'Path:', location.pathname)
  if (!pageId) {
    showToast('❌ Could not retrieve Page ID')
    return
  }
  
  try {
    const res = await fetch(`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`, {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!res.ok) {
      console.error('API Error:', res.status, res.statusText)
      showToast(`❌ API Error: ${res.status}`)
      return
    }
    
    const json = await res.json()
    console.log('API Response:', json)
    
    // Confluence API v2 returns the body in the 'body' field
    const adf = json.body?.atlas_doc_format?.value
    if (!adf) {
      console.error('ADF not found in response:', json)
      showToast('❌ Could not retrieve ADF format data')
      return
    }
    
    const adfData = typeof adf === 'string' ? JSON.parse(adf) : adf
    console.log('ADF Data:', adfData)
    
    const md = adfToMarkdown(adfData)
    
    // Create a textarea element to copy text
    const textarea = document.createElement('textarea')
    textarea.value = md
    textarea.style.position = 'fixed'
    textarea.style.left = '-999999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    
    showToast('Copied as Markdown 🎉')
  } catch (error) {
    console.error('Error:', error)
    showToast(`❌ An error occurred: ${error}`)
  }
}

// Receive messages from background script
chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
  console.log('Message received:', msg)
  if (msg === 'COPY_CONFLUENCE_MD') {
    copyPageAsMd()
    sendResponse({ status: 'ok' })
  }
  return true // Keep the message channel open for async response
})

console.log('Content script loaded')
