export interface ExtensionSettings {
  includeFrontmatter: boolean;
}

export interface SettingsStorage {
  get(keys: Partial<ExtensionSettings>): Promise<Partial<Record<keyof ExtensionSettings, unknown>>>;
  set(items: Partial<ExtensionSettings>): Promise<void>;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  includeFrontmatter: true,
};

export function normalizeSettings(
  settings: Partial<Record<keyof ExtensionSettings, unknown>>,
): ExtensionSettings {
  return {
    includeFrontmatter:
      typeof settings.includeFrontmatter === "boolean"
        ? settings.includeFrontmatter
        : DEFAULT_SETTINGS.includeFrontmatter,
  };
}

export async function loadSettings(
  storage: SettingsStorage = chrome.storage.sync,
): Promise<ExtensionSettings> {
  const storedSettings = await storage.get(DEFAULT_SETTINGS);
  return normalizeSettings(storedSettings);
}

export async function saveSettings(
  settings: Partial<ExtensionSettings>,
  storage: SettingsStorage = chrome.storage.sync,
): Promise<void> {
  await storage.set(normalizeSettings(settings));
}
