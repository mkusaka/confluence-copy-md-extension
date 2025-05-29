// src/content.ts
import { adfToMarkdown } from './adf-to-md'

function extractPageId(path: string): string | null {
  const m = path.match(/\/pages\/(\d+)/)
  return m?.[1] ?? null
}

async function copyPageAsMd() {
  console.log('copyPageAsMd called')
  const pageId = extractPageId(location.pathname)
  console.log('Page ID:', pageId, 'Path:', location.pathname)
  if (!pageId) {
    alert('Page ID が取得できません')
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
      alert(`API Error: ${res.status}`)
      return
    }
    
    const json = await res.json()
    console.log('API Response:', json)
    
    // Confluence API v2 returns the body in the 'body' field
    const adf = json.body?.atlas_doc_format?.value
    if (!adf) {
      console.error('ADF not found in response:', json)
      alert('ADF形式のデータが取得できませんでした')
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
    
    alert('Markdown をコピーしました 🎉')
  } catch (error) {
    console.error('Error:', error)
    alert(`エラーが発生しました: ${error}`)
  }
}

// background からのメッセージ受信
chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
  console.log('Message received:', msg)
  if (msg === 'COPY_CONFLUENCE_MD') {
    copyPageAsMd()
    sendResponse({ status: 'ok' })
  }
  return true // Keep the message channel open for async response
})

console.log('Content script loaded')
