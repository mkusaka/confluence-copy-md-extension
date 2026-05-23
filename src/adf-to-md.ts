import { fromADF } from 'mdast-util-from-adf'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { toMarkdown } from 'mdast-util-to-markdown'
import { stringify as stringifyYaml } from 'yaml'
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

export interface MarkdownMetadata {
  title?: string
  confluence?: {
    id?: string
    spaceId?: string
    status?: string
    parentId?: string
    parentType?: string
    createdAt?: string
    updatedAt?: string
    version?: number
    url?: string
    editUrl?: string
    tinyUrl?: string
  }
}

interface ConfluencePageResponse {
  title?: unknown
  id?: unknown
  spaceId?: unknown
  status?: unknown
  parentId?: unknown
  parentType?: unknown
  createdAt?: unknown
  version?: {
    number?: unknown
    createdAt?: unknown
  }
  _links?: {
    base?: unknown
    webui?: unknown
    editui?: unknown
    tinyui?: unknown
  }
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

function compactObject(object: Record<string, unknown>): Record<string, unknown> {
  const compacted: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(object)) {
    if (value === undefined) continue

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = compactObject(value as Record<string, unknown>)
      if (Object.keys(nested).length > 0) {
        compacted[key] = nested
      }
      continue
    }

    compacted[key] = value
  }

  return compacted
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function joinConfluenceUrl(base: unknown, path: unknown): string | undefined {
  const baseUrl = stringValue(base)
  const urlPath = stringValue(path)
  if (!baseUrl || !urlPath) return undefined
  if (/^https?:\/\//.test(urlPath)) return urlPath

  return `${baseUrl.replace(/\/$/, '')}/${urlPath.replace(/^\//, '')}`
}

function prependFrontmatter(markdown: string, metadata?: MarkdownMetadata): string {
  if (!metadata) return markdown

  const compacted = compactObject(metadata as Record<string, unknown>)
  if (Object.keys(compacted).length === 0) return markdown

  const frontmatter = stringifyYaml(compacted, {
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
    lineWidth: 0
  }).trimEnd()

  return `---\n${frontmatter}\n---\n\n${markdown}`
}

export function confluencePageMetadata(page: ConfluencePageResponse): MarkdownMetadata | undefined {
  const metadata = compactObject({
    title: stringValue(page.title),
    confluence: {
      id: stringValue(page.id),
      spaceId: stringValue(page.spaceId),
      status: stringValue(page.status),
      parentId: stringValue(page.parentId),
      parentType: stringValue(page.parentType),
      createdAt: stringValue(page.createdAt),
      updatedAt: stringValue(page.version?.createdAt),
      version: numberValue(page.version?.number),
      url: joinConfluenceUrl(page._links?.base, page._links?.webui),
      editUrl: joinConfluenceUrl(page._links?.base, page._links?.editui),
      tinyUrl: joinConfluenceUrl(page._links?.base, page._links?.tinyui)
    }
  })

  return Object.keys(metadata).length > 0 ? metadata : undefined
}

/**
 * Confluence の ADF(JSON) を Markdown 文字列に変換して返す
 * @param adf - Confluence から取ってきた ADF JSON
 */
export function adfToMarkdown(adf: DocNode, metadata?: MarkdownMetadata): string {
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
  
  return prependFrontmatter(markdown, metadata)
}
