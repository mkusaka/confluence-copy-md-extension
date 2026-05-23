import { fromADF } from 'mdast-util-from-adf'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Root as MdastRoot } from 'mdast'
import type { DocNode } from '@atlaskit/adf-schema'

interface ADFNode {
  type: string
  content?: ADFNode[]
  attrs?: Record<string, unknown>
  marks?: Array<{
    type: string
    attrs?: Record<string, unknown>
  }>
  text?: string
}

/**
 * Normalize ADF nodes that mdast-util-from-adf cannot convert directly.
 */
function normalizeUnsupportedNodes(node: ADFNode | null): ADFNode | null {
  if (!node) return node
  
  // Skip extension-related nodes
  if (node.type === 'extension' || 
      node.type === 'bodiedExtension' || 
      node.type === 'inlineExtension') {
    return null
  }

  if (node.type === 'status') {
    const text = node.attrs?.text
    if (typeof text !== 'string' || text.length === 0) {
      return null
    }

    return {
      type: 'text',
      text
    }
  }
  
  // Process content array if exists
  if (node.content && Array.isArray(node.content)) {
    node.content = node.content
      .map(child => normalizeUnsupportedNodes(child))
      .filter((child): child is ADFNode => child !== null)
  }
  
  return node
}

/**
 * Confluence の ADF(JSON) を Markdown 文字列に変換して返す
 * @param adf - Confluence から取ってきた ADF JSON
 */
export function adfToMarkdown(adf: DocNode): string {
  const normalizedAdf = normalizeUnsupportedNodes(JSON.parse(JSON.stringify(adf))) as DocNode
  
  // ADF→mdast AST
  const mdastRoot = fromADF(normalizedAdf) as MdastRoot
  // mdast AST→Markdown
  let markdown = toMarkdown(mdastRoot, {
    bullet: '-',   // リストは `- `
    extensions: [gfmToMarkdown()],
    fences: true,  // ```付きコードブロック
    rule: '-'      // 水平線は `---`
  })
  
  // Clean up HTML entities
  markdown = markdown
    .replace(/&#x20;/g, ' ')  // Non-breaking spaces
    .replace(/&nbsp;/g, ' ')  // Alternative NBSP
    .replace(/\\_/g, '_')     // Escaped underscores
  
  return markdown
}
