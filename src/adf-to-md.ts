import { fromADF } from 'mdast-util-from-adf'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Root as MdastRoot } from 'mdast'
import type { DocNode } from '@atlaskit/adf-schema'

/**
 * Filter out extension nodes from ADF content recursively
 */
function filterExtensionNodes(node: any): any {
  if (!node) return node
  
  // Skip extension-related nodes
  if (node.type === 'extension' || 
      node.type === 'bodiedExtension' || 
      node.type === 'inlineExtension') {
    return null
  }
  
  // Process content array if exists
  if (node.content && Array.isArray(node.content)) {
    node.content = node.content
      .map(child => filterExtensionNodes(child))
      .filter(child => child !== null)
  }
  
  return node
}

/**
 * Confluence の ADF(JSON) を Markdown 文字列に変換して返す
 * @param adf - Confluence から取ってきた ADF JSON
 */
export function adfToMarkdown(adf: DocNode): string {
  // Filter out extension nodes before conversion
  const filteredAdf = filterExtensionNodes(JSON.parse(JSON.stringify(adf)))
  
  // ADF→mdast AST
  const mdastRoot = fromADF(filteredAdf) as MdastRoot
  // mdast AST→Markdown
  let markdown = toMarkdown(mdastRoot, {
    bullet: '-',   // リストは `- `
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
