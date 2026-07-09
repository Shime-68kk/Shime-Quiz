import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SchedulerEvidencePanel from '../../src/components/settings/SchedulerEvidencePanel.jsx';

describe('SchedulerEvidencePanel', () => {
  it('renders required safety copy without raw study content', () => {
    const html = renderToStaticMarkup(<SchedulerEvidencePanel />);
    expect(html).toContain('Phòng thử nghiệm thuật toán ôn tập');
    expect(html).toContain('SM2 vẫn là mặc định ổn định');
    expect(html).toContain('FSRS là beta, chỉ bật khi người dùng chọn');
    expect(html).toContain('Có thể rollback về SM2');
    expect(html).toContain('Không dùng cloud/AI/API');
    expect(html).toContain('Không gửi nội dung câu hỏi/đáp án');
    expect(html).not.toMatch(/raw question|raw answer/i);
  });
});
