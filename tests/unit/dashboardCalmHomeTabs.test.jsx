/**
 * Phase 35E — Dashboard Calm Home tabs
 *
 * Static source analysis only. No jsdom rendering.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.resolve(PROJECT_ROOT, relativePath), 'utf8');
}

const dashboardSrc = read('src/routes/Dashboard.jsx');
const viCopy = read('src/uiI18n/translations/vi.js');

describe('Phase 35E — Dashboard local view state', () => {
  it("defaults to the Hôm nay learner-facing view", () => {
    expect(dashboardSrc).toMatch(/useState\(['"]today['"]\)/);
    expect(dashboardSrc).toContain("t('overview.today')");
    expect(viCopy).toContain("'overview.today': 'Hôm nay'");
  });

  it('keeps the Progress Journal as the secondary tab', () => {
    expect(dashboardSrc).toContain("t('overview.progress')");
    expect(viCopy).toContain("'overview.progress': 'Tiến độ'");
    expect(dashboardSrc).toMatch(/setDashboardView\('progress'\)/);
  });
});

describe('Phase 35E — Dashboard tab accessibility', () => {
  it('uses tablist, tabs, aria-selected, and aria-controls', () => {
    expect(dashboardSrc).toMatch(/role="tablist"/);
    expect(dashboardSrc.match(/role="tab"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(dashboardSrc).toMatch(/aria-selected=\{dashboardView === 'today'\}/);
    expect(dashboardSrc).toMatch(/aria-selected=\{dashboardView === 'progress'\}/);
    expect(dashboardSrc).toContain('aria-controls="dashboard-panel-today"');
    expect(dashboardSrc).toContain('aria-controls="dashboard-panel-progress"');
  });

  it('keeps both panels mounted with hidden inactive panels', () => {
    expect(dashboardSrc).toContain('id="dashboard-panel-today"');
    expect(dashboardSrc).toContain('id="dashboard-panel-progress"');
    expect(dashboardSrc.match(/role="tabpanel"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(dashboardSrc).toMatch(/hidden=\{dashboardView !== 'today'\}/);
    expect(dashboardSrc).toMatch(/hidden=\{dashboardView !== 'progress'\}/);
  });
});

describe('Phase 35E — Dashboard content split', () => {
  it('keeps learner action surfaces in the default Hôm nay panel', () => {
    const todayPanel = dashboardSrc.slice(
      dashboardSrc.indexOf('id="dashboard-panel-today"'),
      dashboardSrc.indexOf('id="dashboard-panel-progress"')
    );

    expect(todayPanel).toContain('<DashboardTodayCard />');
    expect(todayPanel).toContain('<TodayJourneyCard />');
    expect(todayPanel).toContain('<StudyGoalCard />');
    expect(todayPanel).toContain("t('overview.firstRunTitle')");
  });

  it('moves progress-journal surfaces behind Nhật ký tiến độ', () => {
    const progressPanel = dashboardSrc.slice(dashboardSrc.indexOf('id="dashboard-panel-progress"'));

    expect(progressPanel).toContain('<HistoryAnalyticsPanel />');
    expect(progressPanel).toContain('<MasteryInsightsPanel />');
    expect(progressPanel).toContain('<ReviewSchedulePanel />');
    expect(progressPanel).toContain('<SmartPracticePanel />');
    expect(progressPanel).toContain('<StudyHistoryPanel compact />');
    expect(progressPanel).toContain("t('overview.librarySource')");
    expect(progressPanel).toContain("t('overview.learningDataSummary')");
  });

  it('preserves the Dashboard header CTA and copy guardrails', () => {
    expect(dashboardSrc).toContain("title={t('overview.title')}");
    expect(dashboardSrc).toContain("t('overview.continue')");
    expect(dashboardSrc).toContain("t('overview.mixedScheduler'");
    expect(dashboardSrc).not.toContain('BETA_READY');
    expect(dashboardSrc).not.toContain('public production');
    expect(dashboardSrc).not.toContain('cloud sync enabled');
  });
});
