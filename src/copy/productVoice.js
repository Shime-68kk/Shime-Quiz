/**
 * Shime Quiz — Product Voice & UX Copy
 * BIG-UPDATE-10: Premium UX Writing Foundation
 *
 * Voice:
 * - Calm, precise, encouraging
 * - Local-first, honest about capabilities
 * - Not childish, not preachy, not overpromising
 * - Natural Vietnamese as default
 * - Never implies robot perception of the user
 * - Never implies live robot transport
 * - Never says cloud/AI/API if the feature does not use it, except inside privacy notes
 */

export const PRODUCT_VOICE_VERSION = 'big-update-10';

/**
 * Homepage hero copy
 */
export const HERO_COPY = Object.freeze({
  vi: {
    eyebrow: 'Shime Quiz · Học cục bộ',
    headline: 'Học quiz cục bộ, rõ ràng, không cần tài khoản.',
    identityLine: 'Dữ liệu học ở trên máy của bạn — riêng tư, rõ ràng, luôn ở đây.',
    lead: 'Shime Quiz là ứng dụng học từ bộ câu hỏi cục bộ. Nhập nội dung, kiểm tra chất lượng, học trong Phòng học và xem tiến độ trên Tổng quan — không cần đăng nhập.',
    robotCaption: 'Trợ lý Shime · chỉ nhận tín hiệu an toàn',
    ctaPrimary: 'Bắt đầu học nhanh',
    ctaSecondary: 'Mở Thư viện',
    ctaGhost: 'Dùng quiz mẫu'
  },
  en: {
    eyebrow: 'Shime Quiz · Local Study',
    headline: 'Local quiz learning, clear and private, no account needed.',
    identityLine: 'Your study data lives on your device — private, yours, always here.',
    lead: 'Shime Quiz is a local-first quiz app. Import content, review quality, study in the Study Room and track progress on the Dashboard — no login required.',
    robotCaption: 'Shime companion · receives only safe signals',
    ctaPrimary: 'Start studying',
    ctaSecondary: 'Open Library',
    ctaGhost: 'Use sample quiz'
  }
});

/**
 * "Proof panels" — short trust/feature summaries below the hero
 */
export const PROOF_PANEL_COPY = Object.freeze({
  vi: {
    localFirst: {
      eyebrow: 'Local-first',
      title: 'Dữ liệu của bạn, ở đây.',
      body: 'Không cần tài khoản. Dữ liệu học nằm trong bộ nhớ cục bộ của trình duyệt. Không có backend, không cloud sync, không gửi ra ngoài.'
    },
    subjectRooms: {
      eyebrow: 'Phòng học theo môn',
      title: 'Mỗi môn một không gian riêng.',
      body: 'Phòng học theo môn, ôn đúng lúc trước khi quên. Theo dõi tiến độ từng chủ đề mà không cần rời phòng học.'
    },
    privacy: {
      eyebrow: 'Riêng tư & An toàn',
      title: 'Shime chỉ nhận tín hiệu an toàn.',
      body: 'Trợ lý Shime chỉ nhận tín hiệu trạng thái đúng/sai đã làm mờ. Không nhận nội dung câu hỏi, đáp án hay lịch sử học chi tiết.'
    },
    reviewReminder: {
      eyebrow: 'Ôn tập thông minh',
      title: 'Ôn đúng lúc, trước khi quên.',
      body: 'Hệ thống gợi nhắc ôn tập dựa trên tiến độ cục bộ của bạn. Không cần kết nối mạng để xem lịch ôn tập.'
    }
  },
  en: {
    localFirst: {
      eyebrow: 'Local-first',
      title: 'Your data, right here.',
      body: 'No account required. Study data stays in your browser local storage. No backend, no cloud sync, no data sent externally.'
    },
    subjectRooms: {
      eyebrow: 'Subject Study Rooms',
      title: 'One room for each subject.',
      body: 'Study rooms organized by subject, review at the right time before forgetting. Track per-topic progress without leaving the study flow.'
    },
    privacy: {
      eyebrow: 'Private & Safe',
      title: 'Shime receives only safe signals.',
      body: 'The Shime companion receives only redacted correct/incorrect status signals. It never receives question content, answers, or detailed study history.'
    },
    reviewReminder: {
      eyebrow: 'Smart Review',
      title: 'Review at the right time, before forgetting.',
      body: 'Review reminders based on your local progress. No network connection required to see your review schedule.'
    }
  }
});

/**
 * Shared labels used throughout the app.
 * These are the canonical Vietnamese-first UI labels.
 */
export const SHARED_LABELS = Object.freeze({
  vi: {
    dashboard: 'Tổng quan',
    library: 'Thư viện',
    studyRoom: 'Phòng học',
    settings: 'Cài đặt',
    startStudying: 'Bắt đầu học nhanh',
    openLibrary: 'Mở Thư viện',
    openStudyRoom: 'Mở Phòng học',
    useSampleQuiz: 'Dùng quiz mẫu',
    localFirst: 'Cục bộ',
    noAccount: 'Không cần tài khoản',
    privateData: 'Dữ liệu của bạn, ở đây',
    safeSignalOnly: 'Chỉ nhận tín hiệu an toàn',
    notSent: 'không gửi',
    redactedCoarseData: 'dữ liệu đã làm mờ/rút gọn'
  },
  en: {
    dashboard: 'Dashboard',
    library: 'Library',
    studyRoom: 'Study Room',
    settings: 'Settings',
    startStudying: 'Start studying',
    openLibrary: 'Open Library',
    openStudyRoom: 'Open Study Room',
    useSampleQuiz: 'Use sample quiz',
    localFirst: 'Local-first',
    noAccount: 'No account needed',
    privateData: 'Your data, here',
    safeSignalOnly: 'Safe signals only',
    notSent: 'not sent',
    redactedCoarseData: 'redacted/coarse data'
  }
});

/**
 * Privacy and safety descriptions — for Device Bridge area and general privacy notice
 */
export const PRIVACY_COPY = Object.freeze({
  vi: {
    robotSafeSignal: 'Shime chỉ nhận tín hiệu an toàn, không nhận nội dung câu hỏi.',
    localDataStatement: 'Dữ liệu học ở trên máy của bạn.',
    noCloud: 'Không có backend, không cloud sync.',
    noAccount: 'Không cần tài khoản để sử dụng.',
    noRealRobotBridge: 'Kết nối robot thật chưa hoạt động trong phiên bản hiện tại.',
    dryRunOnly: 'chạy thử khô — không gửi lệnh thật ra thiết bị.',
    redactedData: 'dữ liệu đã làm mờ/rút gọn — chỉ trạng thái, không có nội dung.'
  },
  en: {
    robotSafeSignal: 'Shime receives only safe signals, never question content.',
    localDataStatement: 'Study data lives on your device.',
    noCloud: 'No backend, no cloud sync.',
    noAccount: 'No account required to use.',
    noRealRobotBridge: 'Real robot bridge is not active in this version.',
    dryRunOnly: 'dry-run only — no real commands sent to hardware.',
    redactedData: 'redacted/coarse data — status only, no content.'
  }
});

/**
 * Empty state messages
 */
export const EMPTY_STATE_COPY = Object.freeze({
  vi: {
    noLibraryContent: 'Chưa có nội dung trong Thư viện. Hãy nhập JSON, CSV, hoặc dùng quiz mẫu.',
    noStudyHistory: 'Chưa có lịch sử học. Mở Phòng học để bắt đầu.',
    noReviewDue: 'Hiện không có câu nào đến hạn ôn tập.'
  },
  en: {
    noLibraryContent: 'No content in the Library yet. Import JSON, CSV, or use the sample quiz.',
    noStudyHistory: 'No study history yet. Open the Study Room to start.',
    noReviewDue: 'No items due for review right now.'
  }
});

/**
 * Safe copy accessor — falls back to 'vi' for unknown locales.
 * @param {object} map - copy object with 'vi' and 'en' keys
 * @param {string} [locale] - 'vi' | 'en'
 * @returns {object}
 */
export function getCopy(map, locale = 'vi') {
  const safe = locale === 'en' ? 'en' : 'vi';
  return map[safe] || map.vi;
}

/**
 * Voice checklist — programmatically verifiable product voice rules.
 * Intended for use in validator scripts only.
 */
export const VOICE_RULES = Object.freeze([
  { id: 'no-cloud-claim', forbidden: /(?:supports?|enables?|adds?)\s+cloud sync|cloud sync\s+(?:enabled|available|ready)/i, reason: 'Must not claim cloud sync' },
  { id: 'no-ai-api-claim', forbidden: /(?:supports?|enables?|adds?|integrates?)\s+(?:external\s+)?AI\/API|AI\s+API\s+integration/i, reason: 'Must not claim AI/API calls' },
  { id: 'no-ocr-claim', forbidden: /OCR\s+support|supports\s+OCR/i, reason: 'Must not claim optical text recognition capability' },
  { id: 'no-auth-claim', forbidden: /login\s*\/\s*auth|auth\s*\/\s*login/i, reason: 'Must not claim sign-in capability' },
  { id: 'no-robot-sense', forbidden: /robot (?:sees?|hears?|listens?|watches?)/i, reason: 'Must not imply robot perceives user' },
  { id: 'no-real-bridge-active', forbidden: /real robot bridge is (?:now )?active|real\s+bridge\s+connected/i, reason: 'Must not claim live robot transport' }
]);
