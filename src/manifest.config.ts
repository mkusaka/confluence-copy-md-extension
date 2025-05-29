// src/manifest.config.ts
import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Confluence Copy Helper',
  version: '0.1.0',
  description: 'Confluence ページをワンクリックで Markdown に変換してコピー',
  permissions: ['clipboardWrite', 'activeTab', 'scripting'],
  host_permissions: ['https://*.atlassian.net/*'],
  background: { service_worker: 'src/background.ts' },
  content_scripts: [
    {
      matches: ['https://*.atlassian.net/wiki/*'],
      js: ['src/content.ts'],
      run_at: 'document_idle'
    }
  ],
  action: {
    default_title: 'Copy as Markdown',
    default_icon: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png'
    }
  }
})
