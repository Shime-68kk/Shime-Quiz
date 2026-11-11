import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { CHAPTERS, CHAPTER_BY_ID, DECK, ITEMS, ITEM_BY_ID } from '../cram/cramDeck.js';
import RevealToggle from '../components/cram/RevealToggle.jsx';
import ShimeRobotPresence from '../components/brand/ShimeRobotPresence.jsx';
import {
  MOCK_TEST_SIZE,
  answerCard,
  buildMockTest,
  formatWait,
  getRecord,
  isScopeComplete,
  orderChoices,
  pickNextCard,
  summarize
} from '../cram/cramEngine.js';
import {
  PROFILE_GUEST,
  PROFILE_LE_THUY,
  REVEAL_CHECK,
  REVEAL_INSTANT,
  clearCramProfile,
  readCramPrefs,
  readCramProfile,
  readCramStates,
  resetCramStates,
  saveCramPrefs,
  readMockResults,
  saveCramProfile,
  saveCramStates,
  saveMockResult
} from '../cram/cramStorage.js';
import '../styles/cram.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return [now, setNow];
}

function ProgressRing({ percent, size = 132, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <svg className="cramRing" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="cramRing__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
      <circle
        className="cramRing__value"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function getScopeItems(plan) {
  if (plan.kind === 'chapter') return CHAPTER_BY_ID.get(plan.chapterId)?.items || [];
  if (plan.kind === 'mistakes') return ITEMS.filter(item => plan.itemIds.includes(item.id));
  if (plan.kind === 'test') return plan.itemIds.map(id => ITEM_BY_ID.get(id)).filter(Boolean);
  return ITEMS;
}

function planTitle(plan) {
  if (plan.kind === 'chapter') return `Chương ${CHAPTER_BY_ID.get(plan.chapterId)?.number}`;
  if (plan.kind === 'mistakes') return 'Ôn câu sai';
  if (plan.kind === 'test') return 'Thi thử';
  return 'Học liên tục';
}

/* Robot motion. The robot itself (ShimeRobotPresence) is unchanged; this wrapper adds
   a body that moves, a ground shadow that reacts to it, and a small geometric effect layer.
   hop   → right answer: anticipation squash, jump, land, plus a burst of flat shapes.
   shake → wrong answer: gentle head shake and droop, plus one sweat drop.
   nod / wiggle → playful reactions when the robot is tapped. */
const BURST = [
  { shape: 'circle', color: 'accent', angle: -90, dist: 78, rot: 0 },
  { shape: 'square', color: 'mint', angle: -38, dist: 84, rot: 70 },
  { shape: 'triangle', color: 'amber', angle: 8, dist: 74, rot: -90 },
  { shape: 'plus', color: 'accent', angle: 52, dist: 70, rot: 45 },
  { shape: 'circle', color: 'mint', angle: 130, dist: 76, rot: 0 },
  { shape: 'square', color: 'amber', angle: 172, dist: 82, rot: -60 },
  { shape: 'triangle', color: 'accent', angle: -142, dist: 80, rot: 120 },
  { shape: 'circle', color: 'amber', angle: -115, dist: 60, rot: 0 }
];

function RobotBurst() {
  return (
    <span className="cramFx cramFx--burst" aria-hidden="true">
      <span className="cramFx__ring" />
      {BURST.map((piece, index) => {
        const rad = (piece.angle * Math.PI) / 180;
        return (
          <span
            key={index}
            className={`cramFx__piece cramFx__piece--${piece.shape} cramFx__piece--${piece.color}`}
            style={{
              '--dx': `${Math.round(Math.cos(rad) * piece.dist)}px`,
              '--dy': `${Math.round(Math.sin(rad) * piece.dist)}px`,
              '--rot': `${piece.rot}deg`,
              '--delay': `${60 + (index % 3) * 30}ms`
            }}
          />
        );
      })}
    </span>
  );
}

function RobotSweat() {
  return (
    <span className="cramFx cramFx--sweat" aria-hidden="true">
      <svg className="cramFx__drop" viewBox="0 0 20 28" width="14" height="20">
        <path d="M10 1 C10 1 2 12 2 18 a8 8 0 0 0 16 0 C18 12 10 1 10 1 Z" />
      </svg>
    </span>
  );
}

function TappableRobot({ children, className = '', mood = '' }) {
  const [tapMove, setTapMove] = useState('');
  const [tapKey, setTapKey] = useState(0);
  const move = tapMove || mood;
  return (
    <button
      type="button"
      className={`cramRobotTap${move ? ` cramRobotTap--${move}` : ''} ${className}`.trim()}
      aria-label="Chạm vào robot Shime"
      onClick={() => {
        setTapMove(Math.random() < 0.5 ? 'nod' : 'wiggle');
        setTapKey(value => value + 1);
      }}
    >
      <span className="cramRobotTap__shadow" aria-hidden="true" key={`shadow-${move}-${tapKey}`} />
      <span
        className="cramRobotTap__body"
        key={`body-${move}-${tapKey}`}
        onAnimationEnd={event => {
          if (event.target === event.currentTarget && tapMove) setTapMove('');
        }}
      >
        {children}
      </span>
      {move === 'hop' ? <RobotBurst key={`burst-${tapKey}`} /> : null}
      {move === 'shake' ? <RobotSweat key={`sweat-${tapKey}`} /> : null}
    </button>
  );
}

/* ───────────────────────── Onboarding ───────────────────────── */

function ProfileGate({ onChoose }) {
  return (
    <section className="cramGate" aria-labelledby="cram-gate-title">
      <ShimeRobotPresence state="ready" size="lg" expression="attentive" motion="idle" blinkPhase="a" decorative />
      <p className="cramKicker">Ôn thi Giáo dục Quốc phòng – An ninh</p>
      <h1 id="cram-gate-title" className="cramGate__title">Đây có phải máy của Lệ Thủy không?</h1>
      <p className="cramSubtle">Chọn một lần thôi. Tiến độ được lưu ngay trên máy này, không cần tài khoản.</p>
      <div className="cramGate__actions">
        <button type="button" className="cramBtn cramBtn--primary cramBtn--lg" onClick={() => onChoose(PROFILE_LE_THUY)}>
          Mình là Lệ Thủy
        </button>
        <button type="button" className="cramBtn cramBtn--quiet cramBtn--lg" onClick={() => onChoose(PROFILE_GUEST)}>
          Không, mình là người khác
        </button>
      </div>
    </section>
  );
}

function GuideAsk({ profile, onYes, onNo }) {
  return (
    <section className="cramGate" aria-labelledby="cram-guide-title">
      <ShimeRobotPresence state="ready" size="lg" expression="correct" motion="feedback" blinkPhase="b" decorative />
      <p className="cramKicker">{profile.id === PROFILE_LE_THUY ? 'Chào Lệ Thủy' : 'Chào bạn'}</p>
      <h1 id="cram-guide-title" className="cramGate__title">Bạn có cần hướng dẫn không?</h1>
      <p className="cramSubtle">Khoảng 30 giây. Shime chỉ cho bạn từng chỗ, nhất là nút để bắt đầu làm bài.</p>
      <div className="cramGate__actions">
        <button type="button" className="cramBtn cramBtn--primary cramBtn--lg" onClick={onYes}>Có, hướng dẫn mình</button>
        <button type="button" className="cramBtn cramBtn--quiet cramBtn--lg" onClick={onNo}>Không cần, vào học luôn</button>
      </div>
    </section>
  );
}

const TOUR_STEPS = [
  {
    target: '[data-tour="progress"]',
    title: 'Bạn đã thuộc bao nhiêu',
    body: 'Phần trăm câu bạn đã thuộc trong toàn bộ đề. Shime tự tính, bạn chỉ cần nhìn con số này tăng lên.'
  },
  {
    target: '[data-tour="start"]',
    title: 'Chạm vào đây để bắt đầu làm bài',
    body: 'Học liên tục không bao giờ hết bài: Shime tự đưa câu mới, câu sắp quên và câu bạn hay sai, đúng lúc nhất để nhớ lâu.'
  },
  {
    target: '[data-tour="tools"]',
    title: 'Ôn câu sai và thi thử',
    body: '“Ôn câu sai” chỉ hỏi lại những câu bạn từng làm sai. “Thi thử” cho 25 câu trộn đủ các chương và chấm điểm phần trăm.'
  },
  {
    target: '[data-tour="chapters"]',
    title: 'Hoặc học theo từng chương',
    body: 'Mỗi chương có phần trăm đã thuộc riêng. Chạm vào chương nào để học riêng chương đó.'
  }
];

function findVisibleTarget(selector) {
  for (const element of document.querySelectorAll(selector)) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return element;
  }
  return null;
}

function GuideTour({ step, onNext, onClose, onStartLearning }) {
  const config = TOUR_STEPS[step];
  const [rect, setRect] = useState(null);
  const isLast = step === TOUR_STEPS.length - 1;

  useEffect(() => {
    const element = findVisibleTarget(config.target);
    if (!element) {
      setRect(null);
      return undefined;
    }
    element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = element.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    measure();
    const settle = window.setTimeout(measure, 450);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [config.target]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pad = 8;
  const viewportH = typeof window === 'undefined' ? 800 : window.innerHeight;
  const placeAbove = rect ? rect.top + rect.height / 2 > viewportH * 0.55 : false;
  const tipStyle = rect
    ? placeAbove
      ? { bottom: Math.max(12, viewportH - rect.top + pad + 10) }
      : { top: Math.min(viewportH - 230, rect.top + rect.height + pad + 10) }
    : { top: '30%' };

  return createPortal(
    <div className="cramTour" role="dialog" aria-modal="true" aria-labelledby="cram-tour-title">
      {rect ? (
        <div
          className="cramTour__spot"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      ) : <div className="cramTour__dim" />}
      <div className="cramTour__tip" style={tipStyle}>
        <p className="cramKicker">{step + 1} / {TOUR_STEPS.length}</p>
        <h2 id="cram-tour-title">{config.title}</h2>
        <p>{config.body}</p>
        <div className="cramTour__actions">
          <button type="button" className="cramLink" onClick={onClose}>Bỏ qua</button>
          {isLast ? (
            <button type="button" className="cramBtn cramBtn--primary" onClick={onStartLearning} autoFocus>Bắt đầu làm bài</button>
          ) : (
            <button type="button" className="cramBtn cramBtn--primary" onClick={onNext} autoFocus>Tiếp</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ───────────────────────── Home ───────────────────────── */

function CramHome({ profile, states, now, onStart, onSwitchProfile, onReset, confirmReset, revealMode, onRevealMode, onShowGuide }) {
  const overall = useMemo(() => summarize(ITEMS, states, now), [states, now]);
  const chapters = useMemo(
    () => CHAPTERS.map(chapter => ({ ...chapter, summary: summarize(chapter.items, states, now) })),
    [states, now]
  );
  const mistakeIds = useMemo(
    () => ITEMS.filter(item => (getRecord(states, item.id)?.wrong || 0) > 0).map(item => item.id),
    [states]
  );
  const currentChapter = chapters.find(chapter => chapter.summary.seen < chapter.summary.total) || null;
  const name = profile.id === PROFILE_LE_THUY ? 'Lệ Thủy' : '';

  let startHint = 'Tiếp tục ôn để giữ phong độ';
  if (overall.due > 0) startHint = 'Có câu sắp quên, Shime cho ôn trước';
  else if (overall.seen === 0) startHint = 'Bắt đầu từ Chương 1';
  else if (currentChapter) startHint = `Đang ở Chương ${currentChapter.number}`;

  return (
    <div className="cramHome">
      <header className="cramHello">
        <div>
          <p className="cramKicker">Ôn thi GDQP – An ninh</p>
          <h1 className="cramHello__title">{name ? `Chào ${name}` : 'Chào bạn'}</h1>
        </div>
        <TappableRobot className="cramHello__robot">
          <ShimeRobotPresence state={overall.due > 0 ? 'focus' : 'ready'} size="md" motion="idle" blinkPhase="a" decorative />
        </TappableRobot>
      </header>

      <section className="cramPanel cramProgressPanel" data-tour="progress" aria-label="Tiến độ">
        <div className="cramProgressPanel__ring">
          <ProgressRing percent={overall.knownPercent} />
          <div className="cramProgressPanel__value">
            <strong>{overall.knownPercent}<span>%</span></strong>
            <small>đã thuộc</small>
          </div>
        </div>
        <div className="cramProgressPanel__text">
          <p className="cramProgressPanel__level">{overall.level.title}</p>
          <p className="cramSubtle">Đã làm <b>{overall.seen}</b>/{overall.total} câu</p>
        </div>
      </section>

      <button type="button" className="cramStart" onClick={() => onStart({ kind: 'continuous' })} data-tour="start">
        <span className="cramStart__label">Học liên tục</span>
        <span className="cramStart__hint">{startHint}</span>
      </button>

      <div className="cramTools" data-tour="tools">
        <button
          type="button"
          className="cramTool"
          onClick={() => onStart({ kind: 'mistakes', itemIds: mistakeIds })}
          disabled={mistakeIds.length === 0}
        >
          <span className="cramTool__label">Ôn câu sai</span>
          <span className="cramTool__hint">{mistakeIds.length ? `${mistakeIds.length} câu` : 'Chưa có'}</span>
        </button>
        <button type="button" className="cramTool" onClick={() => onStart({ kind: 'test', itemIds: buildMockTest(CHAPTERS) })}>
          <span className="cramTool__label">Thi thử</span>
          <span className="cramTool__hint">{MOCK_TEST_SIZE} câu · chấm %</span>
        </button>
      </div>

      <section className="cramSection" data-tour="chapters" aria-labelledby="cram-chapters-title">
        <h2 id="cram-chapters-title" className="cramSection__title">Theo chương</h2>
        <ul className="cramChapters">
          {chapters.map(chapter => (
            <li key={chapter.id}>
              <button type="button" className="cramChapter" onClick={() => onStart({ kind: 'chapter', chapterId: chapter.id })}>
                <span className="cramChapter__num">{chapter.number}</span>
                <span className="cramChapter__body">
                  <span className="cramChapter__title">{chapter.shortTitle}</span>
                  <span className="cramChapter__bar" aria-hidden="true">
                    <span style={{ width: `${chapter.summary.knownPercent}%` }} />
                  </span>
                </span>
                <span className="cramChapter__pct">{chapter.summary.knownPercent}%</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="cramFooter">
        <button type="button" className="cramLink" onClick={onShowGuide}>Xem hướng dẫn</button>
      </footer>
    </div>
  );
}

/* ───────────────────────── Session ───────────────────────── */

function companionMessage(feedback, revealMode) {
  if (!feedback) {
    return revealMode === REVEAL_CHECK
      ? 'Chọn đáp án bạn thấy đúng nhất, rồi bấm Kiểm tra.'
      : 'Chạm vào đáp án bạn thấy đúng nhất.';
  }
  const { outcome, isCorrect } = feedback;
  if (!isCorrect) return 'Không sao đâu. Câu này sẽ quay lại sớm để bạn nhớ chắc hơn.';
  if (outcome.kind === 'stepUp') return 'Chính xác! Đúng thêm một lần nữa là thuộc câu này.';
  if (outcome.kind === 'learned') return `Đã thuộc! Shime sẽ hỏi lại sau ${formatWait(outcome.waitMinutes)}.`;
  return `Vẫn nhớ tốt! Lần nhắc tiếp theo sau ${formatWait(outcome.waitMinutes)}.`;
}

function SessionSummary({ plan, stats, states, onAgain, onExit, onMistakes }) {
  const overall = summarize(ITEMS, states, Date.now());
  const percent = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
  const isTest = plan.kind === 'test';
  const good = percent >= 80;
  return (
    <section className="cramSummary" aria-live="polite">
      <div className="cramHero cramHero--correct">
        <TappableRobot className="cramHero__robot" mood={good ? 'hop' : ''}>
          <ShimeRobotPresence state="success" size="lg" expression={good ? 'complete' : 'attentive'} motion="feedback" blinkPhase="b" decorative />
        </TappableRobot>
        <p className="cramHero__bubble">
          {good ? 'Làm tốt lắm! Giữ nhịp này là vào phòng thi tự tin.' : 'Mỗi lượt ôn đều giúp bạn nhớ lâu hơn. Ôn câu sai thêm một chút nhé.'}
        </p>
      </div>
      <p className="cramKicker">{isTest ? 'Kết quả thi thử' : 'Xong lượt này'}</p>
      <p className="cramSummary__score">{percent}<span>%</span></p>
      <p className="cramSubtle">Đúng {stats.correct}/{stats.answered} câu</p>
      <div className="cramSummary__overall">
        <span>Toàn bộ đề</span>
        <strong>{overall.knownPercent}% đã thuộc</strong>
      </div>
      <div className="cramSummary__actions">
        {stats.wrongIds.length ? (
          <button type="button" className="cramBtn cramBtn--primary cramBtn--lg" onClick={() => onMistakes(stats.wrongIds)}>
            Ôn lại {stats.wrongIds.length} câu vừa sai
          </button>
        ) : null}
        <button type="button" className={`cramBtn ${stats.wrongIds.length ? 'cramBtn--quiet' : 'cramBtn--primary'} cramBtn--lg`} onClick={onAgain}>
          {isTest ? 'Thi thử đề khác' : 'Học tiếp'}
        </button>
        <button type="button" className="cramLink" onClick={onExit}>Về trang chính</button>
      </div>
    </section>
  );
}

function CramSession({ plan, states, onStates, onExit, onRestart, revealMode, onRevealMode, onTestFinished }) {
  const scopeItems = useMemo(() => getScopeItems(plan), [plan]);
  const isTest = plan.kind === 'test';
  const [recent, setRecent] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  const [itemId, setItemId] = useState(() => (isTest ? plan.itemIds[0] : pickNextCard(scopeItems, states, Date.now())));
  const [selected, setSelected] = useState(null);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ answered: 0, correct: 0, wrongIds: [] });
  const [finished, setFinished] = useState(false);
  const [turn, setTurn] = useState(0);
  const continueRef = useRef(null);
  const item = itemId ? ITEM_BY_ID.get(itemId) : null;
  // Reshuffle only when a new card is presented.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => (item ? orderChoices(item.choices) : []), [item, turn]);
  const chapter = item ? CHAPTER_BY_ID.get(item.topicId) : null;

  useEffect(() => {
    document.documentElement.classList.add('cram-in-session');
    return () => document.documentElement.classList.remove('cram-in-session');
  }, []);

  useEffect(() => {
    if (!itemId && !finished) setFinished(true);
  }, [itemId, finished]);

  const reportedRef = useRef(false);
  useEffect(() => {
    if (!finished || !isTest || reportedRef.current || stats.answered === 0) return;
    reportedRef.current = true;
    onTestFinished?.(stats);
  }, [finished, isTest, stats, onTestFinished]);

  const submit = useCallback(choiceId => {
    if (!item || picked || !choiceId) return;
    const isCorrect = choiceId === item.correctAnswer;
    const result = answerCard(states, item.id, isCorrect, Date.now());
    setPicked(choiceId);
    setFeedback({ isCorrect, outcome: result.outcome });
    setStats(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrongIds: isCorrect || prev.wrongIds.includes(item.id) ? prev.wrongIds : [...prev.wrongIds, item.id]
    }));
    onStates(result.states);
  }, [item, picked, states, onStates]);

  const choose = useCallback(choiceId => {
    if (!item || picked) return;
    if (revealMode === REVEAL_INSTANT) submit(choiceId);
    else setSelected(choiceId);
  }, [item, picked, revealMode, submit]);

  const advance = useCallback(() => {
    if (!feedback || !item) return;
    const now = Date.now();
    let nextId = null;
    if (isTest) {
      const nextIndex = testIndex + 1;
      setTestIndex(nextIndex);
      nextId = plan.itemIds[nextIndex] || null;
    } else if (plan.kind !== 'continuous' && isScopeComplete(scopeItems, states, now)) {
      nextId = null;
    } else {
      const nextRecent = [...recent, item.id].slice(-4);
      setRecent(nextRecent);
      nextId = pickNextCard(scopeItems, states, now, { recent: nextRecent });
    }
    setItemId(nextId);
    setSelected(null);
    setPicked(null);
    setFeedback(null);
    setTurn(value => value + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [feedback, item, isTest, testIndex, plan, scopeItems, states, recent]);

  useEffect(() => {
    if (feedback) continueRef.current?.focus({ preventScroll: true });
  }, [feedback]);

  useEffect(() => {
    function onKey(event) {
      if (feedback && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        advance();
        return;
      }
      if (feedback) return;
      if (event.key === 'Enter' && selected) {
        event.preventDefault();
        submit(selected);
        return;
      }
      const index = ['1', '2', '3', '4', '5', '6'].indexOf(event.key) >= 0
        ? Number(event.key) - 1
        : LETTERS.indexOf(event.key.toUpperCase());
      if (index >= 0 && choices[index]) choose(choices[index].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, choices, choose, feedback, selected, submit]);

  if (finished || !item) {
    return (
      <SessionSummary
        plan={plan}
        stats={stats}
        states={states}
        onExit={onExit}
        onAgain={() => onRestart(isTest ? { kind: 'test', itemIds: buildMockTest(CHAPTERS) } : { kind: 'continuous' })}
        onMistakes={ids => onRestart({ kind: 'mistakes', itemIds: ids })}
      />
    );
  }

  const scopeSummary = summarize(scopeItems, states, Date.now());
  const progressPercent = isTest
    ? Math.round((testIndex / plan.itemIds.length) * 100)
    : scopeSummary.knownPercent;
  const progressLabel = isTest
    ? `Câu ${Math.min(testIndex + 1, plan.itemIds.length)}/${plan.itemIds.length}`
    : `${scopeSummary.knownPercent}% đã thuộc`;
  const reaction = feedback ? (feedback.isCorrect ? 'correct' : 'incorrect') : 'neutral';

  return (
    <div className="cramSession">
      <div className="cramSessionTop">
        <button
          type="button"
          className="cramLink cramLink--strong"
          onClick={() => (stats.answered ? setFinished(true) : onExit())}
        >
          Dừng
        </button>
        <span className="cramSessionTop__title">{planTitle(plan)}</span>
        <span className="cramSessionTop__meta">{progressLabel}</span>
      </div>
      <div className="cramBar" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>

      <div className={`cramHero cramHero--${reaction}`}>
        <TappableRobot
          className="cramHero__robot"
          mood={reaction === 'correct' ? 'hop' : reaction === 'incorrect' ? 'shake' : ''}
          key={`robot-${turn}-${reaction}`}
        >
          <ShimeRobotPresence
            state="ready"
            size="lg"
            expression={reaction === 'correct' ? 'correct' : reaction === 'incorrect' ? 'incorrect' : 'attentive'}
            motion={feedback ? 'feedback' : 'idle'}
            blinkPhase="c"
            decorative
          />
        </TappableRobot>
        <p className="cramHero__bubble" role="status" aria-live="polite">{companionMessage(feedback, revealMode)}</p>
      </div>

      <section className="cramQuestion" aria-labelledby="cram-question">
        {chapter ? <p className="cramKicker">Chương {chapter.number}</p> : null}
        <h1 id="cram-question" className="cramQuestion__prompt">{item.prompt}</h1>
        <div className="cramChoices" role="group" aria-label="Các phương án">
          {choices.map((choice, index) => {
            const isAnswer = choice.id === item.correctAnswer;
            let state = '';
            if (picked) {
              if (isAnswer) state = ' is-correct';
              else if (choice.id === picked) state = ' is-wrong';
              else state = ' is-dim';
            } else if (choice.id === selected) state = ' is-selected';
            return (
              <button
                key={choice.id}
                type="button"
                className={`cramChoice${state}`}
                onClick={() => choose(choice.id)}
                disabled={Boolean(picked)}
                aria-pressed={choice.id === (picked || selected)}
              >
                <span className="cramChoice__letter">{LETTERS[index]}</span>
                <span className="cramChoice__text">{choice.text}</span>
              </button>
            );
          })}
        </div>
      </section>

      {(
        <div className="cramActionBar">
          <div className="cramActionBar__inner">
            {feedback ? (
              <button ref={continueRef} type="button" className={`cramBtn cramBtn--lg ${feedback.isCorrect ? 'cramBtn--primary' : 'cramBtn--ink'}`} onClick={advance}>
                Tiếp tục
              </button>
            ) : revealMode === REVEAL_CHECK ? (
              <button type="button" className="cramBtn cramBtn--primary cramBtn--lg" onClick={() => submit(selected)} disabled={!selected}>
                {selected ? 'Kiểm tra' : 'Chọn một đáp án'}
              </button>
            ) : (
              <p className="cramActionBar__hint">Chạm vào đáp án để trả lời</p>
            )}
            <button type="button" className="cramActionBar__mode" onClick={() => onRevealMode(revealMode === REVEAL_CHECK ? REVEAL_INSTANT : REVEAL_CHECK)}>
              {revealMode === REVEAL_CHECK ? 'Chuyển sang hiện ngay' : 'Chuyển sang bấm Kiểm tra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Root ───────────────────────── */

function formatTestDate(iso) {
  try {
    return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function TestHome({ results, onStart }) {
  const best = results.reduce((max, r) => Math.max(max, r.percent), 0);
  return (
    <div className="cramHome">
      <header className="cramHello">
        <div>
          <p className="cramKicker">Thi thử GDQP – An ninh</p>
          <h1 className="cramHello__title">Thi thử</h1>
        </div>
      </header>
      <section className="cramPanel cramTestIntro">
        <p className="cramSubtle">{MOCK_TEST_SIZE} câu trộn đủ 10 chương, giống một đề thi thật. Làm xong sẽ chấm điểm phần trăm. Câu sai được ghi lại để ôn tiếp.</p>
        <button type="button" className="cramStart" onClick={onStart}>
          <span className="cramStart__label">Bắt đầu bài thi thử</span>
          <span className="cramStart__hint">{results.length ? `Điểm cao nhất: ${best}%` : 'Lần đầu thi thử'}</span>
        </button>
      </section>
      <section className="cramSection" aria-labelledby="cram-tests-title">
        <h2 id="cram-tests-title" className="cramSection__title">Kết quả gần đây</h2>
        {results.length ? (
          <ul className="cramChapters">
            {results.map(result => (
              <li key={result.at} className="cramTestRow">
                <span className="cramTestRow__date">{formatTestDate(result.at)}</span>
                <span className="cramChapter__bar" aria-hidden="true"><span style={{ width: `${result.percent}%` }} /></span>
                <span className="cramChapter__pct">{result.percent}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cramSubtle cramEmpty">Chưa có bài thi thử nào. Làm thử một bài để biết mình đang ở đâu.</p>
        )}
      </section>
    </div>
  );
}

export default function CramStudy({ view = 'home' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => readCramProfile());
  const [states, setStates] = useState(() => (profile ? readCramStates(profile.id, DECK.version) : {}));
  const [plan, setPlan] = useState(null);
  const [prefs, setPrefs] = useState(() => readCramPrefs());
  const [askGuide, setAskGuide] = useState(false);
  const [tourStep, setTourStep] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [mockResults, setMockResults] = useState(() => (profile ? readMockResults(profile.id, DECK.version) : []));
  const changeRevealMode = useCallback(mode => setPrefs(saveCramPrefs({ revealMode: mode })), []);
  const [now, setNow] = useNow();
  const notifiedRef = useRef(false);

  const handleStates = useCallback(next => {
    setStates(next);
    if (profile) saveCramStates(profile.id, DECK.version, next);
  }, [profile]);

  const dueCount = useMemo(() => summarize(ITEMS, states, now).due, [states, now]);

  useEffect(() => {
    document.title = dueCount > 0 ? 'Đến lúc ôn lại · Shime' : 'Ôn thi cấp tốc · Shime';
    if (dueCount === 0) {
      notifiedRef.current = false;
      return;
    }
    if (notifiedRef.current || !document.hidden) return;
    notifiedRef.current = true;
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Đến lúc ôn lại rồi!', { body: 'Vài câu đang sắp quên. Ôn nhanh 2 phút nhé.' });
      }
    } catch {
      // Optional.
    }
  }, [dueCount]);

  function startPlan(next) {
    setPlan({ ...next, key: Date.now() });
  }

  // Requests from other tabs: Thư viện → "Học chương này", Cài đặt → "Xem lại hướng dẫn".
  useEffect(() => {
    const request = location.state;
    if (!request || !profile) return;
    if (request.startPlan) startPlan(request.startPlan);
    if (request.showGuide) setTourStep(0);
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, profile]);

  const handleTestFinished = useCallback(stats => {
    if (!profile || !stats.answered) return;
    setMockResults(saveMockResult(profile.id, DECK.version, {
      percent: Math.round((stats.correct / stats.answered) * 100),
      correct: stats.correct,
      total: stats.answered
    }));
  }, [profile]);

  function chooseProfile(id) {
    const saved = saveCramProfile(id);
    setProfile(saved);
    setStates(readCramStates(saved.id, DECK.version));
    setMockResults(readMockResults(saved.id, DECK.version));
    setAskGuide(!readCramPrefs().guideSeen);
  }

  function finishGuide() {
    setPrefs(saveCramPrefs({ guideSeen: true }));
    setAskGuide(false);
    setTourStep(null);
  }

  function switchProfile() {
    clearCramProfile();
    setProfile(null);
    setPlan(null);
  }

  function resetProgress() {
    if (!profile) return;
    // Two-tap confirmation inside the page (native confirm() is blocked in some embedded viewers).
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    resetCramStates(profile.id, DECK.version);
    setStates({});
  }

  let content;
  if (!profile) content = <ProfileGate onChoose={chooseProfile} />;
  else if (askGuide) {
    content = <GuideAsk profile={profile} onYes={() => { setAskGuide(false); setTourStep(0); }} onNo={finishGuide} />;
  } else if (plan) {
    content = (
      <CramSession
        key={plan.key}
        plan={plan}
        states={states}
        onStates={handleStates}
        revealMode={prefs.revealMode}
        onRevealMode={changeRevealMode}
        onRestart={startPlan}
        onTestFinished={handleTestFinished}
        onExit={() => { setPlan(null); setNow(Date.now()); }}
      />
    );
  } else if (view === 'test') {
    content = <TestHome results={mockResults} onStart={() => startPlan({ kind: 'test', itemIds: buildMockTest(CHAPTERS) })} />;
  } else {
    content = (
      <CramHome
        profile={profile}
        states={states}
        now={now}
        onStart={startPlan}
        onSwitchProfile={switchProfile}
        onReset={resetProgress}
        confirmReset={confirmReset}
        revealMode={prefs.revealMode}
        onRevealMode={changeRevealMode}
        onShowGuide={() => setTourStep(0)}
      />
    );
  }

  return (
    <div className={`cramPage${!profile || askGuide ? ' cramPage--gate' : ''}${plan ? ' cramPage--session' : ''}`}>
      {content}
      {profile && !plan && !askGuide && view === 'home' && tourStep !== null ? (
        <GuideTour
          step={tourStep}
          onNext={() => setTourStep(step => Math.min(TOUR_STEPS.length - 1, step + 1))}
          onClose={finishGuide}
          onStartLearning={() => { finishGuide(); startPlan({ kind: 'continuous' }); }}
        />
      ) : null}
    </div>
  );
}
