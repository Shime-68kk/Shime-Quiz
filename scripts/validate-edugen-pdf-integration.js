import fs from 'node:fs';
import path from 'node:path';
import {
  extractSingleFile,
  getExtractSingleEndpoint,
  getFileProcessorBaseUrl,
  isSupportedPdfFileName,
  mapEduGenExtractResponse
} from '../src/services/fileProcessorClient.js';
import { parseTextQuizDraft } from '../src/data/textQuizParser.js';
import { validateLearningDataImport } from '../src/data/importValidator.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(getFileProcessorBaseUrl({}) === 'http://localhost:3333', 'default EduGen base URL should be localhost:3333');
assert(
  getFileProcessorBaseUrl({ VITE_FILE_PROCESSOR_URL: 'http://127.0.0.1:4444/' }) === 'http://127.0.0.1:4444',
  'configured EduGen base URL should trim trailing slash'
);
assert(
  getExtractSingleEndpoint('http://localhost:3333/') === 'http://localhost:3333/api/extract/single',
  'extract endpoint should target /api/extract/single'
);

assert(isSupportedPdfFileName('bai-hoc.pdf'), '.pdf file name should be accepted');
assert(isSupportedPdfFileName('BAI-HOC.PDF'), '.PDF file name should be accepted case-insensitively');
assert(!isSupportedPdfFileName('bai-hoc.docx'), 'DOCX should not be accepted in Shime Phase 7D');
assert(!isSupportedPdfFileName('bai-hoc.pptx'), 'PPTX should not be accepted in Shime Phase 7D');
assert(!isSupportedPdfFileName('bai-hoc.zip'), 'ZIP should not be accepted in Shime Phase 7D');
assert(!isSupportedPdfFileName('bai-hoc.pdf.zip'), 'double-extension archive should not be accepted');

const successPayload = {
  success: true,
  file: {
    originalName: 'mang-may-tinh.pdf',
    fileType: 'pdf'
  },
  extraction: {
    cleanedText: `Môn: Mạng máy tính\nChủ đề: OSI\n\nCâu hỏi: Application layer thuộc mô hình nào?\nA. OSI\nB. TCP/IP\nĐáp án: A`,
    wordCount: 20,
    lineCount: 7,
    charCount: 120
  },
  parserMetadata: {
    extractionMethod: 'pdf-parse'
  }
};

const mappedSuccess = mapEduGenExtractResponse(successPayload, 200);
assert(mappedSuccess.ok, 'success response should map to ok result');
assert(mappedSuccess.cleanedText.includes('Application layer'), 'success response should expose cleanedText only');
assert(mappedSuccess.file.fileType === 'pdf', 'success response should preserve file type metadata');
assert(mappedSuccess.extraction.wordCount === 20, 'success response should preserve word count metadata');
assert(mappedSuccess.parserMetadata.extractionMethod === 'pdf-parse', 'success response should preserve extraction method metadata');

const parsedDraft = parseTextQuizDraft(mappedSuccess.cleanedText);
assert(parsedDraft.validation.canImport, `cleanedText should parse into an importable Shime draft: ${JSON.stringify(parsedDraft.validation.errors)}`);
assert(validateLearningDataImport(parsedDraft.rawData).canImport, 'draft from cleanedText should pass importValidator');
assert(Array.isArray(parsedDraft.rawData.subjects), 'draft should keep flat v2 subjects[]');
assert(Array.isArray(parsedDraft.rawData.topics), 'draft should keep flat v2 topics[]');
assert(Array.isArray(parsedDraft.rawData.items), 'draft should keep flat v2 items[]');

const failedPayload = mapEduGenExtractResponse({ success: false, error: 'Unsupported file type', code: 'unsupported_file_type' }, 400);
assert(!failedPayload.ok, 'success:false response should map to an error result');
assert(failedPayload.code === 'unsupported_file_type', 'success:false response should preserve EduGen error code');
assert(!failedPayload.message.includes('Error:'), 'safe error message should not expose raw stack-like text');

const emptyPayload = mapEduGenExtractResponse({
  success: true,
  file: { originalName: 'scan.pdf', fileType: 'pdf' },
  extraction: { cleanedText: '   ', wordCount: 0, lineCount: 0, charCount: 0 },
  parserMetadata: { extractionMethod: 'pdf-parse' }
});
assert(!emptyPayload.ok, 'empty cleanedText should be rejected');
assert(emptyPayload.code === 'edugen_empty_text', 'empty cleanedText should return a specific code');

class FakeFormData {
  constructor() {
    this.fields = [];
  }
  append(name, value) {
    this.fields.push([name, value]);
  }
}

const fakeFile = { name: 'mang-may-tinh.pdf' };
let capturedRequest = null;
const clientResult = await extractSingleFile(fakeFile, {
  baseUrl: 'http://localhost:3333',
  FormDataImpl: FakeFormData,
  fetchImpl: async (url, request) => {
    capturedRequest = { url, request };
    return {
      ok: true,
      status: 200,
      async json() {
        return successPayload;
      }
    };
  }
});
assert(clientResult.ok, 'extractSingleFile should map a successful EduGen response');
assert(capturedRequest.url === 'http://localhost:3333/api/extract/single', 'client should call the expected endpoint');
assert(capturedRequest.request.method === 'POST', 'client should use POST');
assert(capturedRequest.request.body.fields[0][0] === 'file', 'multipart field name should be file');

const rejectedClientResult = await extractSingleFile({ name: 'bai-hoc.docx' }, { fetchImpl: async () => { throw new Error('should not call fetch'); } });
assert(!rejectedClientResult.ok, 'non-PDF files should be rejected before network call');
assert(rejectedClientResult.code === 'edugen_unsupported_file', 'non-PDF rejection should have a stable code');

const networkResult = await extractSingleFile(fakeFile, {
  baseUrl: 'http://localhost:3333',
  FormDataImpl: FakeFormData,
  fetchImpl: async () => {
    throw new TypeError('Failed to fetch');
  }
});
assert(!networkResult.ok, 'network/CORS failure should return a safe error result');
assert(networkResult.code === 'edugen_network_error', 'network/CORS failure should have a service guidance code');

const librarySource = fs.readFileSync(path.resolve('src/routes/Library.jsx'), 'utf8');
assert(librarySource.includes('extractSingleFile'), 'Library should use the EduGen client');
assert(librarySource.includes('parseTextQuizDraft'), 'Library should reuse the existing text parser');
assert(librarySource.includes('extractionResult.cleanedText'), 'Library should consume cleanedText rather than raw EduGen JSON');
assert(!/\.docx|\.pptx|\.zip/.test(librarySource), 'Library UI should not advertise DOCX/PPTX/ZIP import in Phase 7D');
assert(!/auto-save|tự động lưu/i.test(librarySource), 'Library UI should not advertise auto-save');

console.log(JSON.stringify({
  edugenPdfIntegration: {
    baseUrl: getFileProcessorBaseUrl({}),
    endpoint: getExtractSingleEndpoint('http://localhost:3333'),
    supportedPdf: isSupportedPdfFileName('bai-hoc.pdf'),
    rejectedDocx: !isSupportedPdfFileName('bai-hoc.docx'),
    parsedItems: parsedDraft.rawData.items.length,
    multipartField: capturedRequest.request.body.fields[0][0]
  }
}, null, 2));
