import { fromADF } from 'mdast-util-from-adf'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Root as MdastRoot } from 'mdast'
import type { DocNode } from '@atlaskit/adf-schema'

/**
 * Confluence の ADF(JSON) を Markdown 文字列に変換して返す
 * @param adf - Confluence から取ってきた ADF JSON
 */
export function adfToMarkdown(adf: DocNode): string {
  // ADF→mdast AST
  const mdastRoot = fromADF(adf) as MdastRoot
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
