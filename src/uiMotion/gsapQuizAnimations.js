import { gsap } from 'gsap';

/**
 * Kiểm tra xem người dùng có bật chế độ giảm chuyển động (Reduced Motion) không.
 * @returns {boolean}
 */
export function isReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 1. Hiệu ứng chuyển câu hỏi (Question Card Entrance & Stagger Options)
 * - Thẻ câu hỏi trượt vào mượt mà với độ mờ và scale nhẹ.
 * - Các đáp án lựa chọn xuất hiện so le (stagger) tạo cảm giác sinh động.
 *
 * @param {HTMLElement} containerEl - Phần tử bọc câu hỏi hoặc thẻ câu hỏi
 * @param {Object} [options]
 * @param {'next'|'prev'|'none'} [options.direction='next'] - Hướng chuyển câu
 * @param {number} [options.duration=0.35] - Thời lượng chuyển động (giây)
 * @param {boolean} [options.staggerOptions=true] - Có bật hiệu ứng so le cho đáp án không
 * @param {Function} [options.onComplete] - Callback sau khi kết thúc animation
 * @returns {gsap.core.Timeline|null}
 */
export function animateQuestionIn(containerEl, {
  direction = 'next',
  duration = 0.35,
  staggerOptions = true,
  onComplete
} = {}) {
  if (!containerEl) return null;

  if (isReducedMotion()) {
    gsap.set(containerEl, { opacity: 1, x: 0, scale: 1, clearProps: 'all' });
    onComplete?.();
    return null;
  }

  const tl = gsap.timeline({ onComplete });
  const offsetX = direction === 'next' ? 32 : direction === 'prev' ? -32 : 0;

  // Animation cho toàn bộ khung câu hỏi
  tl.fromTo(
    containerEl,
    {
      opacity: 0,
      x: offsetX,
      scale: 0.98
    },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration,
      ease: 'power2.out'
    }
  );

  // Hiệu ứng stagger cho từng phương án trả lời bên trong
  if (staggerOptions) {
    const choiceElements = containerEl.querySelectorAll('.choiceOption, [role="radio"], .quiz-option');
    if (choiceElements.length > 0) {
      tl.fromTo(
        choiceElements,
        {
          opacity: 0,
          y: 10
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.05,
          ease: 'power2.out'
        },
        `-=${duration * 0.6}` // Chạy gối đầu khi câu hỏi đang trượt vào
      );
    }
  }

  return tl;
}

/**
 * 2. Hiệu ứng chọn Đúng / Sai (Answer Feedback)
 * - Nếu Đúng: Nảy nhẹ (Pop/Bounce), bung badge thành công và trượt hộp lời khen.
 * - Nếu Sai: Rung lắc ngang (Shake effect) trên phương án chọn sai, nhấp nháy đáp án đúng.
 *
 * @param {Object} params
 * @param {HTMLElement} params.selectedOptionEl - Phương án mà người học vừa chọn
 * @param {boolean} params.isCorrect - Kết quả đúng hay sai
 * @param {HTMLElement} [params.feedbackEl] - Khung thông báo phản hồi (success / danger)
 * @param {HTMLElement} [params.correctOptionEl] - Phương án đúng (khi chọn sai cần highlight)
 * @param {Function} [params.onComplete] - Callback sau khi kết thúc
 * @returns {gsap.core.Timeline|null}
 */
export function animateAnswerFeedback({
  selectedOptionEl,
  isCorrect,
  feedbackEl,
  correctOptionEl,
  onComplete
} = {}) {
  if (isReducedMotion()) {
    onComplete?.();
    return null;
  }

  const tl = gsap.timeline({ onComplete });

  if (isCorrect) {
    // === TRƯỜNG HỢP ĐÚNG ===
    if (selectedOptionEl) {
      // Nảy nhẹ thẻ đáp án đã chọn
      tl.to(selectedOptionEl, {
        scale: 1.03,
        duration: 0.16,
        ease: 'back.out(2)'
      }).to(selectedOptionEl, {
        scale: 1,
        duration: 0.14,
        ease: 'power1.out'
      });
    }

    // Trượt êm hộp thông báo đúng
    if (feedbackEl) {
      tl.fromTo(
        feedbackEl,
        {
          opacity: 0,
          y: -10,
          scale: 0.96
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        },
        '-=0.1'
      );
    }
  } else {
    // === TRƯỜNG HỢP SAI ===
    if (selectedOptionEl) {
      // Hiệu ứng Rung lắc ngang (Shake)
      tl.to(selectedOptionEl, {
        keyframes: [
          { x: -8, duration: 0.06 },
          { x: 8, duration: 0.06 },
          { x: -6, duration: 0.06 },
          { x: 6, duration: 0.06 },
          { x: -3, duration: 0.05 },
          { x: 3, duration: 0.05 },
          { x: 0, duration: 0.06 }
        ],
        ease: 'power1.inOut'
      });
    }

    // Nếu có truyền phần tử đáp án đúng, tạo hiệu ứng nhấp nháy phát sáng nhẹ để người học chú ý
    if (correctOptionEl && correctOptionEl !== selectedOptionEl) {
      tl.to(
        correctOptionEl,
        {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 2,
          ease: 'power1.inOut'
        },
        '-=0.2'
      );
    }

    // Xuất hiện hộp phản hồi đáp án sai kèm giải thích
    if (feedbackEl) {
      tl.fromTo(
        feedbackEl,
        {
          opacity: 0,
          y: -8
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out'
        },
        '-=0.15'
      );
    }
  }

  return tl;
}

/**
 * 3. Hiệu ứng Thanh tiến độ (Progress Bar & Counter Interpolation)
 * - Chuyển động tăng thanh tiến độ mượt mà từ giá trị cũ đến giá trị mới.
 * - Hiệu ứng nhảy số % (Counter rolling) trơn tru theo thời gian thực.
 *
 * @param {Object} params
 * @param {HTMLElement} params.fillEl - Thẻ thanh fill (.progressBar__fill)
 * @param {HTMLElement} [params.counterEl] - Thẻ hiển thị số % (nếu có)
 * @param {number} [params.fromPercent=0] - Giá trị % xuất phát
 * @param {number} [params.toPercent=0] - Giá trị % đích đến
 * @param {number} [params.duration=0.45] - Thời lượng chuyển động (giây)
 * @param {Function} [params.onComplete] - Callback khi hoàn thành
 * @returns {gsap.core.Tween|null}
 */
export function animateProgressBar({
  fillEl,
  counterEl,
  fromPercent = 0,
  toPercent = 0,
  duration = 0.45,
  onComplete
} = {}) {
  const targetVal = Math.min(100, Math.max(0, Number(toPercent) || 0));
  const startVal = Math.min(100, Math.max(0, Number(fromPercent) || 0));

  if (isReducedMotion()) {
    if (fillEl) fillEl.style.width = `${targetVal}%`;
    if (counterEl) counterEl.textContent = `${Math.round(targetVal)}%`;
    onComplete?.();
    return null;
  }

  const proxy = { val: startVal };

  const tween = gsap.to(proxy, {
    val: targetVal,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      if (fillEl) {
        fillEl.style.width = `${proxy.val}%`;
      }
      if (counterEl) {
        counterEl.textContent = `${Math.round(proxy.val)}%`;
      }
    },
    onComplete
  });

  return tween;
}

/**
 * Hiệu ứng tương tác nhanh khi click chọn 1 đáp án (Click Pulse)
 * @param {HTMLElement} element
 */
export function animateOptionClick(element) {
  if (!element || isReducedMotion()) return null;
  return gsap.fromTo(
    element,
    { scale: 0.98 },
    { scale: 1, duration: 0.18, ease: 'back.out(2)' }
  );
}
