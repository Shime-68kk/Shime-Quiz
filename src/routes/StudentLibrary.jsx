import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHAPTERS, DECK, ITEMS } from '../cram/cramDeck.js';
import { getRecord, isKnown, summarize } from '../cram/cramEngine.js';
import { readCramProfile, readCramStates } from '../cram/cramStorage.js';
import { CRAM_ROUTE_PATH } from '../config/studentDeployment.js';
import '../styles/cram.css';

// Student deployment library: the study guide by chapter, with the right answer,
// accent-insensitive search and a "study this chapter" shortcut.

function fold(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const SEARCH_INDEX = new Map(ITEMS.map(item => [
  item.id,
  fold(`${item.prompt} ${item.choices.map(choice => choice.text).join(' ')}`)
]));

function memoryState(states, itemId, now) {
  const record = getRecord(states, itemId);
  if (!record) return { key: 'new', label: 'Chưa học' };
  if (isKnown(record, now)) return { key: 'known', label: 'Đã thuộc' };
  return { key: 'learning', label: 'Đang học' };
}

function QuestionCard({ item, number, showAnswer, memory }) {
  const answer = item.choices.find(choice => choice.id === item.correctAnswer);
  return (
    <li className="libQ">
      <div className="libQ__head">
        <span className={`libDot libDot--${memory.key}`} title={memory.label} aria-label={memory.label} />
        <span className="libQ__num">Câu {number}</span>
      </div>
      <p className="libQ__prompt">{item.prompt}</p>
      {showAnswer ? (
        <p className="libQ__answer"><span aria-hidden="true">✓</span> {answer?.text}</p>
      ) : null}
    </li>
  );
}

export default function StudentLibrary() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(CHAPTERS[0]?.id || '');
  const [showAnswer, setShowAnswer] = useState(true);
  const chapterRefs = useRef(new Map());
  const scrollOnOpenRef = useRef(false);

  // After opening a chapter, bring its header to the top so question 1 is right there.
  useEffect(() => {
    if (!openId || !scrollOnOpenRef.current) return undefined;
    scrollOnOpenRef.current = false;
    const frame = requestAnimationFrame(() => {
      const element = chapterRefs.current.get(openId);
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [openId]);

  function toggleChapter(chapterId, open) {
    scrollOnOpenRef.current = !open;
    setOpenId(open ? '' : chapterId);
  }
  const profile = readCramProfile();
  const states = useMemo(() => (profile ? readCramStates(profile.id, DECK.version) : {}), [profile?.id]);
  const now = Date.now();
  const folded = fold(query.trim());

  const results = useMemo(() => {
    if (!folded) return null;
    return ITEMS.filter(item => SEARCH_INDEX.get(item.id).includes(folded));
  }, [folded]);

  const numberOf = useMemo(() => {
    const map = new Map();
    CHAPTERS.forEach(chapter => chapter.items.forEach((item, index) => map.set(item.id, index + 1)));
    return map;
  }, []);

  function studyChapter(chapterId) {
    navigate(CRAM_ROUTE_PATH, { state: { startPlan: { kind: 'chapter', chapterId } } });
  }

  return (
    <div className="cramPage">
      <div className="cramHome">
        <header className="cramHello">
          <div>
            <p className="cramKicker">Đề cương GDQP – An ninh</p>
            <h1 className="cramHello__title">Thư viện</h1>
          </div>
        </header>

        <div className="libTools">
          <label className="libSearch" htmlFor="lib-search">
            <span className="srOnly">Tìm câu hỏi</span>
            <input
              id="lib-search"
              type="search"
              inputMode="search"
              placeholder="Tìm câu hỏi…"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <button
            type="button"
            className={`libToggle${showAnswer ? ' is-on' : ''}`}
            aria-pressed={showAnswer}
            onClick={() => setShowAnswer(value => !value)}
          >
            {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>

        {results ? (
          <section className="cramSection" aria-live="polite">
            <h2 className="cramSection__title">{results.length ? `${results.length} câu khớp` : 'Không tìm thấy câu nào'}</h2>
            <ul className="libList">
              {results.slice(0, 60).map(item => (
                <QuestionCard
                  key={item.id}
                  item={item}
                  number={numberOf.get(item.id)}
                  showAnswer={showAnswer}
                  memory={memoryState(states, item.id, now)}
                />
              ))}
            </ul>
          </section>
        ) : (
          <ul className="libChapters">
            {CHAPTERS.map(chapter => {
              const open = openId === chapter.id;
              const summary = summarize(chapter.items, states, now);
              return (
                <li
                  key={chapter.id}
                  className={`libChapter${open ? ' is-open' : ''}`}
                  ref={element => {
                    if (element) chapterRefs.current.set(chapter.id, element);
                    else chapterRefs.current.delete(chapter.id);
                  }}
                >
                  <button
                    type="button"
                    className="libChapter__head"
                    aria-expanded={open}
                    onClick={() => toggleChapter(chapter.id, open)}
                  >
                    <span className="cramChapter__num">{chapter.number}</span>
                    <span className="libChapter__title">{chapter.shortTitle}</span>
                    <span className="cramChapter__pct">{summary.knownPercent}%</span>
                  </button>
                  {open ? (
                    <div className="libChapter__body">
                      <button type="button" className="cramBtn cramBtn--primary libStudy" onClick={() => studyChapter(chapter.id)}>
                        Học chương này
                      </button>
                      <ul className="libList">
                        {chapter.items.map((item, index) => (
                          <QuestionCard
                            key={item.id}
                            item={item}
                            number={index + 1}
                            showAnswer={showAnswer}
                            memory={memoryState(states, item.id, now)}
                          />
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
