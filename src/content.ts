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
  const res = await fetch(`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`, {
    credentials: 'same-origin'
  })
  if (!res.ok) {
    alert(`API Error: ${res.status}`)
    return
  }
  const text = await res.text()
  const adf = JSON.parse(JSON.parse(text))
  const md = adfToMarkdown(adf)
  await navigator.clipboard.writeText(md)
  alert('Markdown をコピーしました 🎉')
}

// background からのメッセージ受信
chrome.runtime.onMessage.addListener((msg: any) => {
  console.log('Message received:', msg)
  if (msg === 'COPY_CONFLUENCE_MD') copyPageAsMd()
})

console.log('Content script loaded')
