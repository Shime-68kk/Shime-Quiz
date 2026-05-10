export const STORAGE_QUOTA_WARNING_THRESHOLD = 0.7;

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function normalizeStorageQuotaEstimate(estimate, threshold = STORAGE_QUOTA_WARNING_THRESHOLD) {
  const usage = estimate?.usage;
  const quota = estimate?.quota;

  if (!isFinitePositiveNumber(usage) || !isFinitePositiveNumber(quota) || usage > quota) {
    return { ok: false, shouldWarn: false, usage: 0, quota: 0, ratio: 0, percent: 0 };
  }

  const ratio = usage / quota;
  const percent = Math.round(ratio * 100);

  return {
    ok: true,
    shouldWarn: ratio >= threshold,
    usage,
    quota,
    ratio,
    percent
  };
}

export async function getStorageQuotaWarningState() {
  if (typeof navigator === 'undefined' || typeof navigator.storage?.estimate !== 'function') {
    return { available: false, shouldWarn: false };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const normalized = normalizeStorageQuotaEstimate(estimate);
    if (!normalized.ok || !normalized.shouldWarn) {
      return { available: true, shouldWarn: false };
    }

    return {
      available: true,
      shouldWarn: true,
      percent: normalized.percent,
      usage: normalized.usage,
      quota: normalized.quota
    };
  } catch {
    return { available: false, shouldWarn: false };
  }
}
