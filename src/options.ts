import { loadSettings, saveSettings } from "./settings";
import "./options.css";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Options page is missing required element: ${selector}`);
  }
  return element;
}

const includeFrontmatterInput = requiredElement<HTMLInputElement>("#include-frontmatter");
const saveStatus = requiredElement<HTMLElement>("#save-status");

let statusTimer: number | undefined;

function showStatus(message: string) {
  saveStatus.textContent = message;
  window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

async function initializeOptions() {
  const settings = await loadSettings();
  includeFrontmatterInput.checked = settings.includeFrontmatter;

  includeFrontmatterInput.addEventListener("change", async () => {
    await saveSettings({
      includeFrontmatter: includeFrontmatterInput.checked,
    });
    showStatus("Saved");
  });
}

void initializeOptions();
