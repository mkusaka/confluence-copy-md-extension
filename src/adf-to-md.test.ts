import { describe, expect, it } from 'vitest'
import type { DocNode } from '@atlaskit/adf-schema'
import { adfToMarkdown } from './adf-to-md'

describe('adfToMarkdown', () => {
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
