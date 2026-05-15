/**
 * src/edugen/edugenConnector.js
 *
 * Phase 16F — EduGen Draft Workshop Connector Foundation
 *
 * Optional companion connector for the EduGen "Draft Workshop" service.
 *
 * Identity boundary (per Phase 16D/16F):
 *   • EduGen is an optional Draft Workshop / Xưởng bản nháp companion.
 *   • EduGen is NOT bundled inside Shime Quiz.
 *   • This module performs NO document extraction, NO AI call, NO OCR.
 *   • This module performs NO automatic FSRS activation or enrollment.
 *   • This module performs NO storage migration, sync, account, or auth.
 *   • A user-initiated health check (HEAD/GET on `<url>/health`) is the
 *     only network behaviour. No background polling. No document upload.
 *   • All output from EduGen, if a future flow uses it, is a draft that
 *     requires explicit user review before entering the study library.
 *
 * Public API:
 *   normalizeEdugenServiceUrl(url): string
 *   buildEdugenHealthUrl(url):     string
 *   isEdugenServiceConfigured(url): boolean
 *   checkEdugenHealth(url, opts):  Promise<{ ok, status, code, message }>
 *
 * No global side effects. No fetch unless `checkEdugenHealth` is called.
 */

const HEALTH_PATH = '/health';

const HEALTH_STATUS_REACHABLE     = 'reachable';
const HEALTH_STATUS_NOT_REACHABLE = 'not_reachable';
const HEALTH_STATUS_NOT_CONFIGURED = 'not_configured';
const HEALTH_STATUS_TIMEOUT       = 'timeout';
const HEALTH_STATUS_INVALID_URL   = 'invalid_url';

export const EDUGEN_HEALTH_STATUS = Object.freeze({
  REACHABLE: HEALTH_STATUS_REACHABLE,
  NOT_REACHABLE: HEALTH_STATUS_NOT_REACHABLE,
  NOT_CONFIGURED: HEALTH_STATUS_NOT_CONFIGURED,
  TIMEOUT: HEALTH_STATUS_TIMEOUT,
  INVALID_URL: HEALTH_STATUS_INVALID_URL
});

const DEFAULT_TIMEOUT_MS = 5000;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function trimTrailingSlash(value) {
  return cleanString(value).replace(/\/+$/u, '');
}

function isAllowedProtocol(scheme) {
  return scheme === 'http:' || scheme === 'https:';
}

/**
 * Normalize a candidate EduGen service URL.
 *
 * Returns the trimmed, trailing-slash-stripped URL when the input parses as
 * a valid http(s) URL. Returns '' when the input is empty, invalid, or uses
 * an unsupported protocol (file:, javascript:, ftp:, etc.).
 *
 * Never throws. Never performs network I/O.
 */
export function normalizeEdugenServiceUrl(url) {
  const raw = cleanString(url);
  if (!raw) return '';

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return '';
  }

  if (!isAllowedProtocol(parsed.protocol)) return '';
  if (!parsed.host) return '';

  return trimTrailingSlash(parsed.toString());
}

/**
 * Return `true` when the input URL normalizes to a configured EduGen service.
 * Empty / invalid URLs are treated as "not configured".
 */
export function isEdugenServiceConfigured(url) {
  return normalizeEdugenServiceUrl(url).length > 0;
}

/**
 * Build the health-check URL for the configured EduGen service.
 *
 * Returns '' when the input URL is empty or invalid. Otherwise returns
 * `<normalized-base>/health`.
 */
export function buildEdugenHealthUrl(url) {
  const base = normalizeEdugenServiceUrl(url);
  if (!base) return '';
  return `${base}${HEALTH_PATH}`;
}

function createTimeoutController(timeoutMs) {
  if (typeof AbortController !== 'function') return null;
  const controller = new AbortController();
  const id = setTimeout(() => {
    try { controller.abort(); } catch { /* noop */ }
  }, Math.max(1, Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_TIMEOUT_MS));
  return { controller, clear() { clearTimeout(id); } };
}

function isAbortLike(error) {
  if (!error || typeof error !== 'object') return false;
  if (error.name === 'AbortError') return true;
  if (typeof error.message === 'string' && /abort/i.test(error.message)) return true;
  return false;
}

/**
 * Perform a user-initiated reachability check against the configured EduGen
 * service. NEVER uploads documents. NEVER calls an AI endpoint.
 *
 * Behaviour:
 *   • empty/invalid URL  → { ok:false, status:'not_configured' | 'invalid_url' }
 *   • response.ok        → { ok:true,  status:'reachable', code: <number> }
 *   • response not ok    → { ok:false, status:'not_reachable', code: <number> }
 *   • timeout/abort      → { ok:false, status:'timeout' }
 *   • network/other err  → { ok:false, status:'not_reachable' }
 *
 * Options:
 *   • fetchImpl   — injected fetch (default: globalThis.fetch)
 *   • timeoutMs   — default 5000
 *
 * Never throws.
 */
export async function checkEdugenHealth(url, options = {}) {
  const rawTrimmed = cleanString(url);
  const normalized = normalizeEdugenServiceUrl(url);

  if (!rawTrimmed) {
    return { ok: false, status: HEALTH_STATUS_NOT_CONFIGURED, code: null, message: 'EduGen URL trống.' };
  }
  if (!normalized) {
    return { ok: false, status: HEALTH_STATUS_INVALID_URL, code: null, message: 'URL EduGen không hợp lệ.' };
  }

  const fetchImpl = typeof options.fetchImpl === 'function'
    ? options.fetchImpl
    : (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function' ? globalThis.fetch : null);

  if (!fetchImpl) {
    return { ok: false, status: HEALTH_STATUS_NOT_REACHABLE, code: null, message: 'Trình duyệt chưa hỗ trợ kiểm tra dịch vụ EduGen.' };
  }

  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
    ? options.timeoutMs
    : DEFAULT_TIMEOUT_MS;

  const healthUrl = buildEdugenHealthUrl(normalized);
  const timeoutHandle = createTimeoutController(timeoutMs);
  const fetchOptions = { method: 'GET', cache: 'no-store' };
  if (timeoutHandle) fetchOptions.signal = timeoutHandle.controller.signal;

  try {
    const response = await fetchImpl(healthUrl, fetchOptions);
    if (timeoutHandle) timeoutHandle.clear();

    const code = Number.isFinite(response?.status) ? response.status : null;
    if (response && response.ok === true) {
      return { ok: true, status: HEALTH_STATUS_REACHABLE, code, message: 'EduGen Draft Workshop đang trả lời.' };
    }
    return { ok: false, status: HEALTH_STATUS_NOT_REACHABLE, code, message: 'EduGen Draft Workshop không phản hồi.' };
  } catch (error) {
    if (timeoutHandle) timeoutHandle.clear();
    if (isAbortLike(error)) {
      return { ok: false, status: HEALTH_STATUS_TIMEOUT, code: null, message: 'Kiểm tra EduGen quá thời gian.' };
    }
    return { ok: false, status: HEALTH_STATUS_NOT_REACHABLE, code: null, message: 'Không kết nối được EduGen Draft Workshop.' };
  }
}

/**
 * Documented (but NOT implemented) source metadata shape for future EduGen
 * draft items. Returned as a frozen reference object so callers can read the
 * expected field names without runtime persistence side effects.
 *
 * Future shape (per handoff pack):
 *   {
 *     sourceType: 'manual' | 'sample' | 'edugen-draft',
 *     sourceName: string,
 *     importedAt: string,         // ISO timestamp
 *     processor: 'edugen',
 *     reviewRequired: true
 *   }
 *
 * This is documentation only. It is not written into storage by this module.
 */
export const EDUGEN_DRAFT_SOURCE_METADATA_SHAPE = Object.freeze({
  sourceType: 'edugen-draft',
  sourceName: '',
  importedAt: '',
  processor: 'edugen',
  reviewRequired: true
});
