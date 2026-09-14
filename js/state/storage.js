const STORAGE_KEY = 'custom-mailers:session';
const SCHEMA_VERSION = 1;

function getStorage() {
  try {
    const storage = window.localStorage;
    const probeKey = `${STORAGE_KEY}:probe`;
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

const storage = getStorage();

export const isStorageAvailable = storage !== null;

export function loadSession() {
  if (storage === null) {
    return null;
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed.version !== SCHEMA_VERSION) {
      return null;
    }
    return parsed.content ?? null;
  } catch {
    return null;
  }
}

export function saveSession(content) {
  if (storage === null) {
    return { ok: false, reason: 'unavailable' };
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, savedAt: Date.now(), content }));
    return { ok: true };
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, reason: isQuotaError ? 'quota' : 'unknown' };
  }
}

export function clearSession() {
  if (storage === null) {
    return;
  }
  storage.removeItem(STORAGE_KEY);
}
