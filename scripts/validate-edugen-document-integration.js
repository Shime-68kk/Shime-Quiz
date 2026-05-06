#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  extractSingleFile,
  getExtractSingleEndpoint,
  getFileProcessorBaseUrl,
  isSupportedEduGenDocumentFileName,
  isSupportedPdfFileName,
  mapEduGenExtractResponse,
  SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS
} from '../src/services/fileProcessorClient.js';
import { parseTextQuizDraft } from '../src/data/textQuizParser.js';
import { validateLearningDataImport } from '../src/data/importValidator.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Array.isArray(SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS), 'document extension list should be exported');
for (const extension of ['.pdf', '.docx', '.pptx', '.zip']) {
  assert(SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS.includes(extension), `${extension} should be supported by Shime Phase 7E`);
}

assert(getFileProcessorBaseUrl({}) === 'http://localhost:3333', 'default EduGen base URL should be localhost:3333');
assert(
  getFileProcessorBaseUrl({ VITE_FILE_PROCESSOR_URL: 'http://127.0.0.1:3001/' }) === 'http://127.0.0.1:3001',
  'configured EduGen base URL should trim trailing slash'
);
assert(
  getExtractSingleEndpoint('http://localhost:3333/') === 'http://localhost:3333/api/extract/single',
  'extract endpoint should target /api/extract/single'
);

for (const fileName of ['bai-hoc.pdf', 'BAI-HOC.DOCX', 'slide-bai-giang.pptx', 'bo-tai-lieu.zip']) {
  assert(isSupportedEduGenDocumentFileName(fileName), `${fileName} should be accepted`);
}
assert(isSupportedPdfFileName('bai-hoc.pdf'), 'PDF helper should preserve Phase 7D PDF acceptance');
assert(!isSupportedPdfFileName('bai-hoc.docx'), 'PDF helper should remain PDF-specific');

for (const fileName of ['bai-hoc.doc', 'bai-hoc.ppt', 'anh.png', 'malware.exe', 'README', 'tai-lieu.pdf.exe']) {
  assert(!isSupportedEduGenDocumentFileName(fileName), `${fileName} should be rejected`);
}

const cleanedText = `Môn: Mạng máy tính\nChủ đề: Mô hình OSI\n\nCâu hỏi: Application layer thuộc mô hình nào?\nA. OSI\nB. TCP/IP\nC. DNS\nD. HTTP\nĐáp án: A\nGiải thích: Application là tầng trong mô hình OSI.`;
const successPayload = {
  success: true,
  file: {
    originalName: 'mang-may-tinh.docx',
    fileType: 'docx'
  },
  extraction: {
    cleanedText,
    wordCount: 32,
    lineCount: 9,
    charCount: cleanedText.length
  },
  parserMetadata: {
    extractionMethod: 'docx-parser'
  }
};

const mappedSuccess = mapEduGenExtractResponse(successPayload, 200);
assert(mappedSuccess.ok, 'success response should map to ok result');
assert(mappedSuccess.cleanedText === cleanedText, 'success response should expose cleanedText only');
assert(mappedSuccess.file.fileType === 'docx', 'success response should preserve document file type metadata');
assert(mappedSuccess.extraction.wordCount === 32, 'success response should preserve word count metadata');
assert(mappedSuccess.parserMetadata.extractionMethod === 'docx-parser', 'success response should preserve extraction method metadata');

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

const fakeFile = { name: 'mang-may-tinh.pptx' };
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
        return { ...successPayload, file: { originalName: 'mang-may-tinh.pptx', fileType: 'pptx' } };
      }
    };
  }
});
assert(clientResult.ok, 'extractSingleFile should map a successful EduGen response');
assert(capturedRequest.url === 'http://localhost:3333/api/extract/single', 'client should call the expected endpoint');
assert(capturedRequest.request.method === 'POST', 'client should use POST');
assert(capturedRequest.request.body.fields[0][0] === 'file', 'multipart field name should be file');

const rejectedClientResult = await extractSingleFile({ name: 'bai-hoc.doc' }, { fetchImpl: async () => { throw new Error('should not call fetch'); } });
assert(!rejectedClientResult.ok, 'legacy .doc files should be rejected before network call');
assert(rejectedClientResult.code === 'edugen_unsupported_file', 'legacy .doc rejection should have a stable code');

const invalidJsonResult = await extractSingleFile({ name: 'bai-hoc.pdf' }, {
  baseUrl: 'http://localhost:3333',
  FormDataImpl: FakeFormData,
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    async json() {
      throw new Error('bad json');
    }
  })
});
assert(!invalidJsonResult.ok, 'invalid JSON response should return a safe error result');
assert(invalidJsonResult.code === 'edugen_invalid_json', 'invalid JSON should have a stable code');

const httpResult = await extractSingleFile({ name: 'bai-hoc.zip' }, {
  baseUrl: 'http://localhost:3333',
  FormDataImpl: FakeFormData,
  fetchImpl: async () => ({
    ok: false,
    status: 415,
    async json() {
      return { success: false, error: 'Unsupported archive', code: 'unsupported_file_type' };
    }
  })
});
assert(!httpResult.ok, 'non-2xx EduGen response should return a safe error result');
assert(httpResult.code === 'unsupported_file_type', 'non-2xx response should preserve EduGen code');

const networkResult = await extractSingleFile({ name: 'bai-hoc.pdf' }, {
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
assert(librarySource.includes('PDF, DOCX, PPTX hoặc ZIP'), 'Library UI should advertise only the supported Phase 7E document formats');
assert(!librarySource.includes('file .doc') && !librarySource.includes('file .ppt'), 'Library UI should not advertise legacy .doc/.ppt import');
assert(!librarySource.includes('OCR') && !librarySource.includes('AI quiz') && !librarySource.includes('trí tuệ nhân tạo') && !librarySource.includes('tự động tạo bằng AI'), 'Library UI should not claim OCR or AI generation');
assert(!/auto-save|tự động lưu/i.test(librarySource), 'Library UI should not advertise auto-save');

const docs = [
  fs.existsSync('docs/edugen-document-draft-integration.md') ? fs.readFileSync('docs/edugen-document-draft-integration.md', 'utf8') : '',
  fs.readFileSync('RELEASE_QA_V2.md', 'utf8')
].join('\n');
assert(['PDF', 'DOCX', 'PPTX', 'ZIP'].every(format => docs.includes(format)), 'docs should list Phase 7E supported document formats');
assert(/DOC\/PPT|\.doc|\.ppt/i.test(docs), 'docs should explicitly mention legacy DOC/PPT are unsupported');
assert(/OCR/i.test(docs) && /(not supported|không.*OCR|does not add OCR)/i.test(docs), 'docs should explicitly say OCR is unsupported');
assert(/AI/i.test(docs) && /(not supported|không.*AI|does not add.*AI)/i.test(docs), 'docs should explicitly say AI generation is unsupported');

console.log(JSON.stringify({
  edugenDocumentIntegration: {
    baseUrl: getFileProcessorBaseUrl({}),
    endpoint: getExtractSingleEndpoint('http://localhost:3333'),
    supportedExtensions: SUPPORTED_EDUGEN_DOCUMENT_EXTENSIONS,
    rejectedLegacyDoc: !isSupportedEduGenDocumentFileName('bai-hoc.doc'),
    parsedItems: parsedDraft.rawData.items.length,
    multipartField: capturedRequest.request.body.fields[0][0]
  }
}, null, 2));
