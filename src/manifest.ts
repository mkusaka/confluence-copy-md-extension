// src/manifest.ts
const manifest = {
  manifest_version: 3,
  name: 'Confluence Copy Helper',
  version: '0.1.0',
  description: 'Confluence ページを Markdown 化してクリップボードにコピー',
  permissions: ['clipboardWrite', 'storage', 'activeTab', 'scripting'],
  host_permissions: ['https://*.atlassian.net/*'],
  background: { service_worker: 'background.js' },
  content_scripts: [
    {
      matches: ['https://*.atlassian.net/wiki/*'],
      js: ['content.js'],
      run_at: 'document_idle',
    },
  ],
  action: {
    default_icon: { '16': 'icons/icon16.png', '48': 'icons/icon48.png' },
    default_popup: 'popup.html',
  },
}

export default manifest
