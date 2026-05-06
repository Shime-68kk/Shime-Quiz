const DEFAULT_FILE_PROCESSOR_URL = 'http://localhost:3333';
const EXTRACT_SINGLE_PATH = '/api/extract/single';

export const SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip'];

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function trimTrailingSlash(value) {
  return cleanString(value).replace(/\/+$/u, '');
}

function getDefaultEnv() {
  return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
}

function getLowerFileName(fileName) {
  return cleanString(fileName).toLowerCase();
}

export function getFileProcessorBaseUrl(env = getDefaultEnv()) {
  const configuredUrl = cleanString(env?.VITE_FILE_PROCESSOR_URL);
  return trimTrailingSlash(configuredUrl || DEFAULT_FILE_PROCESSOR_URL);
}

export function getExtractSingleEndpoint(baseUrl = getFileProcessorBaseUrl()) {
  return `${trimTrailingSlash(baseUrl || DEFAULT_FILE_PROCESSOR_URL)}${EXTRACT_SINGLE_PATH}`;
}

export function isSupportedPdfFileName(fileName) {
  return getLowerFileName(fileName).endsWith('.pdf');
}

export function isSupportedEduGenDocumentFileName(fileName) {
  const name = getLowerFileName(fileName);
  if (!name || !name.includes('.')) return false;
  return SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS.some(extension => name.endsWith(extension));
}

function createError(code, message, details = {}) {
  return {
    ok: false,
    code,
    message,
    ...details
  };
}

function normalizeEduGenError(payload, fallbackCode = 'edugen_extract_failed', status = null) {
  const code = cleanString(payload?.code) || fallbackCode;
  const message = cleanString(payload?.error) || 'Không trích xuất được nội dung tài liệu.';
  return createError(code, message, { status });
}

export function mapEduGenExtractResponse(payload, status = 200) {
  if (!payload || typeof payload !== 'object') {
    return createError('edugen_invalid_response', 'EduGen trả về phản hồi không hợp lệ.', { status });
  }

  if (payload.success === false) {
    return normalizeEduGenError(payload, 'edugen_extract_failed', status);
  }

  if (payload.success !== true) {
    return createError('edugen_invalid_response', 'EduGen trả về trạng thái không hợp lệ.', { status });
  }

  const cleanedText = cleanString(payload.extraction?.cleanedText);
  if (!cleanedText) {
    return createError('edugen_empty_text', 'Không tìm thấy nội dung chữ trong tài liệu.', { status });
  }

  return {
    ok: true,
    cleanedText,
    file: {
      originalName: cleanString(payload.file?.originalName),
      fileType: cleanString(payload.file?.fileType)
    },
    extraction: {
      wordCount: Number.isFinite(payload.extraction?.wordCount) ? payload.extraction.wordCount : null,
      lineCount: Number.isFinite(payload.extraction?.lineCount) ? payload.extraction.lineCount : null,
      charCount: Number.isFinite(payload.extraction?.charCount) ? payload.extraction.charCount : cleanedText.length
    },
    parserMetadata: {
      extractionMethod: cleanString(payload.parserMetadata?.extractionMethod)
    },
    status
  };
}

export async function extractSingleFile(file, options = {}) {
  if (!file || typeof file !== 'object') {
    return createError('edugen_missing_file', 'Chưa chọn file tài liệu.');
  }

  if (!isSupportedEduGenDocumentFileName(file.name)) {
    return createError('edugen_unsupported_file', 'Chỉ hỗ trợ file PDF, DOCX, PPTX hoặc ZIP trong bước này.');
  }

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const FormDataImpl = options.FormDataImpl || globalThis.FormData;

  if (typeof fetchImpl !== 'function' || typeof FormDataImpl !== 'function') {
    return createError('edugen_client_unavailable', 'Trình duyệt chưa hỗ trợ gửi file tới EduGen.');
  }

  const endpoint = getExtractSingleEndpoint(options.baseUrl || getFileProcessorBaseUrl(options.env));
  const formData = new FormDataImpl();
  formData.append('file', file);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      body: formData
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      return createError(
        'edugen_invalid_json',
        response.ok ? 'EduGen trả về JSON không hợp lệ.' : 'Không trích xuất được nội dung tài liệu.',
        { status: response.status }
      );
    }

    if (!response.ok) {
      return normalizeEduGenError(payload, 'edugen_http_error', response.status);
    }

    return mapEduGenExtractResponse(payload, response.status);
  } catch {
    return createError(
      'edugen_network_error',
      'Không kết nối được EduGen File Processor. Hãy kiểm tra service và cấu hình VITE_FILE_PROCESSOR_URL.'
    );
  }
}
