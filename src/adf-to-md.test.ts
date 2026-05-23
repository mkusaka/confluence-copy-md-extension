import { describe, expect, it } from 'vitest'
import type { DocNode } from '@atlaskit/adf-schema'
import { adfToMarkdown, confluencePageMetadata } from './adf-to-md'

describe('adfToMarkdown', () => {
  it('prepends page metadata as YAML frontmatter', () => {
    const metadata = confluencePageMetadata({
      title: 'Example Page',
      id: '123456',
      spaceId: '654321',
      status: 'current',
      parentType: 'page',
      parentId: '111111',
      createdAt: '2026-01-01T00:00:00.000Z',
      version: {
        number: 3,
        createdAt: '2026-01-02T00:00:00.000Z'
      },
      _links: {
        base: 'https://example.atlassian.net/wiki',
        webui: '/spaces/EX/pages/123456/Example+Page',
        editui: '/pages/resumedraft.action?draftId=123456',
        tinyui: '/x/example'
      }
    })

    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Body text' }]
        }
      ]
    } as unknown as DocNode, metadata)

    expect(markdown).toContain('title: "Example Page"')
    expect(markdown).toContain('id: "123456"')
    expect(markdown).toContain('version: 3')
    expect(markdown).toContain('url: "https://example.atlassian.net/wiki/spaces/EX/pages/123456/Example+Page"')
    expect(markdown).toContain('editUrl: "https://example.atlassian.net/wiki/pages/resumedraft.action?draftId=123456"')
    expect(markdown).toContain('tinyUrl: "https://example.atlassian.net/wiki/x/example"')
    expect(markdown).toMatch(/^---\n[\s\S]+?\n---\n\nBody text\n$/)
  })

  it('does not prepend YAML frontmatter without metadata', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Body text' }]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toBe('Body text\n')
  })

  it('converts status nodes to plain text', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Status: ' },
            {
              type: 'status',
              attrs: {
                color: 'green',
                style: 'bold',
                text: 'Ready',
                localId: 'example-status'
              }
            },
            { type: 'hardBreak' },
            { type: 'text', text: 'Updated: 2026-01-01 00:00 UTC' }
          ]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toContain('Status: Ready')
    expect(markdown).toContain('Updated: 2026-01-01 00:00 UTC')
  })

  it('converts tables to GFM markdown tables', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'table',
          attrs: { layout: 'default' },
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Item' }]
                    }
                  ]
                },
                {
                  type: 'tableHeader',
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Value' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Example' }]
                    }
                  ]
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: '42' }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toContain('| Item    | Value |')
    expect(markdown).toContain('| ------- | ----- |')
    expect(markdown).toContain('| Example | 42    |')
  })

  it('converts strike marks to GFM strikethrough', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Keep ' },
            {
              type: 'text',
              text: 'old value',
              marks: [{ type: 'strike' }]
            },
            { type: 'text', text: ' updated value' }
          ]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toContain('Keep ~~old value~~ updated value')
  })

  it('converts task items to GFM task list items', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'taskList',
          attrs: { localId: 'example-task-list' },
          content: [
            {
              type: 'taskItem',
              attrs: {
                localId: 'example-task-1',
                state: 'DONE'
              },
              content: [{ type: 'text', text: 'Done item' }]
            },
            {
              type: 'taskItem',
              attrs: {
                localId: 'example-task-2',
                state: 'TODO'
              },
              content: [{ type: 'text', text: 'Todo item' }]
            }
          ]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toContain('- [x] Done item')
    expect(markdown).toContain('- [ ] Todo item')
  })

  it('removes extension nodes before conversion', () => {
    const markdown = adfToMarkdown({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Before ' },
            {
              type: 'inlineExtension',
              attrs: {
                extensionType: 'com.atlassian.confluence.macro.core',
                extensionKey: 'status',
                parameters: {}
              }
            },
            { type: 'text', text: 'after' }
          ]
        }
      ]
    } as unknown as DocNode)

    expect(markdown).toContain('Before after')
  })
})
