import { getStorageAdapter } from "../storage/storageAdapterRegistry.js";

export const HELP_TOUR_DONE_STORAGE_KEY = "shime_tour_done";

export function readHelpTourDone() {
  try {
    return getStorageAdapter().readRaw(HELP_TOUR_DONE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHelpTourDone() {
  try {
    return getStorageAdapter().writeRaw(HELP_TOUR_DONE_STORAGE_KEY, "1");
  } catch (error) {
    return { ok: false, error: "storage_write_failed", storageError: error };
  }
}

export function clearHelpTourDoneForTests() {
  try {
    return getStorageAdapter().removeRaw(HELP_TOUR_DONE_STORAGE_KEY);
  } catch (error) {
    return { ok: false, error: "storage_remove_failed", storageError: error };
  }
}
