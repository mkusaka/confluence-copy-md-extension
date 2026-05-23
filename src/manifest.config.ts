// src/manifest.config.ts
import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Confluence Copy Helper",
  version: packageJson.version,
  description: "Convert Confluence pages to Markdown with a single click",
  permissions: ["clipboardWrite", "activeTab", "scripting", "storage"],
  host_permissions: ["https://*.atlassian.net/*"],
  background: { service_worker: "src/background.ts" },
  icons: {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  content_scripts: [
    {
      matches: ["https://*.atlassian.net/wiki/*"],
      js: ["src/content.ts"],
      run_at: "document_idle",
    },
  ],
  action: {
    default_title: "Copy as Markdown",
    default_icon: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  options_ui: {
    page: "options.html",
    open_in_tab: false,
  },
});
