const ENABLED_VALUES = new Set(['1', 'true', 'enabled', 'on']);

/**
 * Developer diagnostics are an internal product surface, not an end-user setting.
 * Production builds stay learner-first unless an internal build opts in explicitly.
 */
export function shouldShowDeveloperTools(env = {}) {
  if (env?.DEV === true) return true;
  return ENABLED_VALUES.has(String(env?.VITE_SHIME_DEVELOPER_TOOLS || '').trim().toLowerCase());
}

export function getProductSurface(env = {}) {
  return {
    developerToolsVisible: shouldShowDeveloperTools(env),
    learnerFirst: true,
    technicalDetailsDefaultOpen: false
  };
}
