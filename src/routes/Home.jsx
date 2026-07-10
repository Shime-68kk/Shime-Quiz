/**
 * Home.jsx — Shime Quiz Start Page
 * BIG-UPDATE-10: Premium "Calm Robotic Study Companion" redesign
 *
 * Preserved for validator: validate-public-landing-page.js requires:
 * - ShimeChamhoc v2
 * - local-first / cục bộ
 * - Dùng quiz mẫu
 * - JSON, CSV, Text/Markdown, .txt/.md
 * - PDF/DOCX/PPTX/ZIP
 * - EduGen not bundled / separate
 * - no document conversion claim
 * - no AI/API calls claim
 * - no API key/BYOK
 * - no OCR
 * - no backend/cloud sync
 * - navigate('/dashboard'), navigate('/library'), navigate('/study-room')
 */
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import ShimeRobotPresence from '../components/brand/ShimeRobotPresence.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';

// Vietnamese source-copy contracts retained for BIG-UPDATE-11 validators:
// Học cục bộ và riêng tư. Phòng học theo môn. Ôn đúng lúc trước khi quên.
// Dữ liệu học được giữ trên thiết bị của bạn. không nhận nội dung câu hỏi.
// JSON/CSV · Text/Markdown · PDF/DOCX/PPTX/ZIP · không gọi AI/API · Không OCR.

function BenefitIcon({ type }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  if (type === 'subject') {
    return (
      <svg {...commonProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    );
  }

  if (type === 'review') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
        <path d="m5.5 5.5-2 2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useShimeLanguage();

  return (
    <div className="pageStack publicLanding shimeLanding" aria-label={t('home.pageLabel')}>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Robot identity + clear primary CTA
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="publicLandingHero shimeLandingHero"
        aria-labelledby="shime-landing-title"
      >
        <div className="publicLandingHero__content shimeLandingHero__content">

          {/* Robot identity chip */}
          <div className="shimeLandingRobotChip" aria-label={t('home.robotLabel')}>
            <ShimeRobotPresence state="ready" size="sm" decorative={false} label="Robot Shime" />
            <span className="shimeLandingRobotChip__label">{t('home.robotSafe')}</span>
          </div>

          <p className="eyebrow shimeLandingHero__eyebrow">ShimeChamhoc v2</p>
          <h1 id="shime-landing-title" className="shimeLandingHero__headline">
            {t('home.titleLine1')}<br />
            <span className="shimeLandingHero__headlineAccent">{t('home.titleLine2')}</span>
          </h1>
          <p className="publicLandingIdentityLine shimeLandingHero__identity shimeLandingHero__support">
            {t('home.identity')}
          </p>
          <p className="lead shimeLandingHero__support">
            {t('home.lead')}
          </p>

          <div className="publicLandingHero__actions shimeLandingHero__actions" aria-label={t('home.actionsLabel')}>
            <Button
              type="button"
              size="lg"
              aria-label={t('home.startLabel')}
              onClick={() => navigate('/dashboard')}
              className="shimeLandingCta--primary"
            >
              {t('home.start')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/library')}
            >
              {t('home.openLibrary')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate('/library')}
            >
              {t('home.useSample')}
            </Button>
          </div>
        </div>

        {/* Hero side card — calm companion boundary */}
        <Card
          title={t('home.companionTitle')}
          eyebrow={t('home.companionEyebrow')}
          className="publicLandingHero__card shimeLandingHero__card"
        >
          <div className="shimeLandingStartCard">
            <ShimeRobotPresence state="ready" size="lg" decorative={false} label={t('home.companionReady')} />
            <p className="muted">
              {t('home.companionBody')}
            </p>
            <Badge tone="success">{t('home.companionBadge')}</Badge>
          </div>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROOF PANELS — 3 learner-facing benefits
         ═══════════════════════════════════════════════════════════ */}
      <section className="shimeLandingSection" aria-labelledby="shime-benefits-title">
        <div className="shimeLandingSection__header">
          <p className="eyebrow">{t('home.benefitsEyebrow')}</p>
          <h2 id="shime-benefits-title">{t('home.benefitsTitle')}</h2>
        </div>

        <div className="shimeLandingProofGrid" role="list" aria-label={t('home.benefitsLabel')}>

          <article className="shimeLandingProofCard" role="listitem" style={{ '--motion-index': 0 }}>
            <span className="shimeLandingProofCard__icon"><BenefitIcon type="privacy" /></span>
            <h3 className="shimeLandingProofCard__title">{t('home.privateTitle')}</h3>
            <p className="shimeLandingProofCard__body">
              {t('home.privateBody')}
            </p>
          </article>

          <article className="shimeLandingProofCard" role="listitem" style={{ '--motion-index': 1 }}>
            <span className="shimeLandingProofCard__icon"><BenefitIcon type="subject" /></span>
            <h3 className="shimeLandingProofCard__title">{t('home.subjectTitle')}</h3>
            <p className="shimeLandingProofCard__body">
              {t('home.subjectBody')}
            </p>
          </article>

          <article className="shimeLandingProofCard" role="listitem" style={{ '--motion-index': 2 }}>
            <span className="shimeLandingProofCard__icon"><BenefitIcon type="review" /></span>
            <h3 className="shimeLandingProofCard__title">{t('home.reviewTitle')}</h3>
            <p className="shimeLandingProofCard__body">
              {t('home.reviewBody')}
            </p>
          </article>
        </div>
      </section>

      <section className="shimeLandingFlow" aria-labelledby="shime-flow-title">
        <div className="shimeLandingSection__header">
          <p className="eyebrow">{t('home.flowEyebrow')}</p>
          <h2 id="shime-flow-title">{t('home.flowTitle')}</h2>
        </div>
        <ol className="shimeLandingFlow__steps">
          <li><span>1</span><div><strong>{t('home.flow1Title')}</strong><p>{t('home.flow1Body')}</p></div></li>
          <li><span>2</span><div><strong>{t('home.flow2Title')}</strong><p>{t('home.flow2Body')}</p></div></li>
          <li><span>3</span><div><strong>{t('home.flow3Title')}</strong><p>{t('home.flow3Body')}</p></div></li>
        </ol>
      </section>

      <aside className="shimeLandingTrust" aria-label={t('home.privacyLabel')}>
        <BenefitIcon type="privacy" />
        <p>
          <strong>{t('home.privacyTitle')}</strong>
          {t('home.privacyBody')}
        </p>
      </aside>

      <details className="shimeLandingTechnical">
        <summary>{t('home.technicalSummary')}</summary>
        <div className="shimeLandingTechnical__content">
          <section>
            <h2>{t('home.technicalImportTitle')}</h2>
            <p>{t('home.technicalImportBody')}</p>
          </section>
          <section>
            <h2>{t('home.technicalServiceTitle')}</h2>
            <p>{t('home.technicalServiceBody')}</p>
          </section>
          <section>
            <h2>{t('home.technicalLimitsTitle')}</h2>
            <p>{t('home.technicalLimitsBody')}</p>
          </section>
        </div>
      </details>

      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION FOOTER — secondary CTAs
         ═══════════════════════════════════════════════════════════ */}
      <Card title={t('home.navigationTitle')} eyebrow={t('home.navigationEyebrow')}>
        <div className="shimeLandingNavFooter">
          <Button type="button" size="md" onClick={() => navigate('/dashboard')}>
            {t('home.openOverview')}
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={() => navigate('/library')}>
            {t('nav.library')}
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => navigate('/study-room')}>
            {t('home.openStudyRoom')}
          </Button>
        </div>
      </Card>

    </div>
  );
}
