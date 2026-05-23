import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  normalizeSettings,
  saveSettings,
  type SettingsStorage,
} from "./settings";

function createStorage(initialSettings: Record<string, unknown> = {}) {
  const storedSettings = { ...initialSettings };
  const writes: Array<Record<string, unknown>> = [];

  const storage: SettingsStorage = {
    async get(defaults) {
      return { ...defaults, ...storedSettings };
    },
    async set(items) {
      writes.push({ ...items });
      Object.assign(storedSettings, items);
    },
  };

  return { storage, writes, storedSettings };
}

describe("settings", () => {
  it("defaults to including frontmatter", async () => {
    const { storage } = createStorage();

    await expect(loadSettings(storage)).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("loads disabled frontmatter setting", async () => {
    const { storage } = createStorage({ includeFrontmatter: false });

    await expect(loadSettings(storage)).resolves.toEqual({ includeFrontmatter: false });
  });

  it("falls back to the default for invalid stored values", () => {
    expect(normalizeSettings({ includeFrontmatter: "false" })).toEqual(DEFAULT_SETTINGS);
  });

  it("saves the normalized setting", async () => {
    const { storage, writes } = createStorage();

    await saveSettings({ includeFrontmatter: false }, storage);

    expect(writes).toEqual([{ includeFrontmatter: false }]);
  });
});
