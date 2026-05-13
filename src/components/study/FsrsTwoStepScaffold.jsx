import { useState } from 'react';

// ---------------------------------------------------------------------------
// Fixture-only mock data — no production imports
// ---------------------------------------------------------------------------

export const MOCK_CARD_ID = 'fixture-card-001';

const MOCK_CARD = {
  id: MOCK_CARD_ID,
  question: 'What is the spacing effect in memory research?',
  answer:
    'Spacing effect: distributing practice over multiple sessions produces better long-term retention than massed practice (cramming) in a single session.'
};

// ---------------------------------------------------------------------------
// Pure state machine — exported for Vitest testing (no DOM needed)
// ---------------------------------------------------------------------------

export const INITIAL_STATE = {
  phase: 'question',
  objective: null,
  memoryRating: null,
  log: null
};

export function revealAnswer(state) {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'objective' };
}

export function selectObjective(state, choice) {
  if (state.phase !== 'objective') return state;
  if (choice === 'wrong') {
    return {
      ...state,
      phase: 'result',
      objective: 'wrong',
      memoryRating: 'Again',
      log: { objective: 'wrong', rating: 'Again', cardId: MOCK_CARD_ID, timestamp: new Date().toISOString() }
    };
  }
  return { ...state, phase: 'effort', objective: 'right' };
}

export function selectRating(state, rating) {
  if (state.phase !== 'effort') return state;
  return {
    ...state,
    phase: 'result',
    memoryRating: rating,
    log: { objective: 'right', rating, cardId: MOCK_CARD_ID, timestamp: new Date().toISOString() }
  };
}

export function reset() {
  return { ...INITIAL_STATE };
}

// ---------------------------------------------------------------------------
// Required fixture copy
// ---------------------------------------------------------------------------
// Again: Failed to recall / Complete blackout.
// Hard: Recalled with severe mental effort or hesitation.
// Good: Recalled smoothly with normal effort.
// Easy: Instant recall; too simple.
// Objective correctness feeds scoring/mastery in the future.
// Subjective memory rating feeds FSRS scheduling in the future.
// This fixture does not save, schedule, migrate, or modify review records.

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FsrsTwoStepScaffold() {
  const [state, setState] = useState(INITIAL_STATE);

  function handleReveal() {
    setState(s => revealAnswer(s));
  }

  function handleObjective(choice) {
    setState(s => selectObjective(s, choice));
  }

  function handleRating(rating) {
    setState(s => selectRating(s, rating));
  }

  function handleReset() {
    setState(reset());
  }

  return (
    <div className="fsrsFixture">
      <div className="fsrsFixture__banner" role="alert" aria-live="polite">
        FSRS UI FIXTURE: TEST MODE ONLY — NO DATA IS SAVED OR SCHEDULED.
      </div>

      <div className="fsrsFixture__card">

        {state.phase === 'question' && (
          <div className="fsrsFixture__phase fsrsFixture__phase--question">
            <p className="fsrsFixture__label">Question</p>
            <p className="fsrsFixture__questionText">{MOCK_CARD.question}</p>
            <button
              className="fsrsFixture__btn fsrsFixture__btn--primary"
              onClick={handleReveal}
            >
              Reveal answer
            </button>
          </div>
        )}

        {state.phase === 'objective' && (
          <div className="fsrsFixture__phase fsrsFixture__phase--objective">
            <p className="fsrsFixture__label">Answer</p>
            <p className="fsrsFixture__answerText">{MOCK_CARD.answer}</p>
            <p className="fsrsFixture__prompt">Did you get this right?</p>
            <div className="fsrsFixture__btnGroup">
              <button
                className="fsrsFixture__btn fsrsFixture__btn--wrong"
                onClick={() => handleObjective('wrong')}
              >
                Wrong
              </button>
              <button
                className="fsrsFixture__btn fsrsFixture__btn--right"
                onClick={() => handleObjective('right')}
              >
                Right
              </button>
            </div>
            <p className="fsrsFixture__hint">
              Objective correctness feeds scoring/mastery in the future.
            </p>
          </div>
        )}

        {state.phase === 'effort' && (
          <div className="fsrsFixture__phase fsrsFixture__phase--effort">
            <p className="fsrsFixture__prompt">How much effort did it take?</p>
            <div className="fsrsFixture__btnGroup">
              <button
                className="fsrsFixture__btn fsrsFixture__btn--hard"
                onClick={() => handleRating('Hard')}
                title="Hard: Recalled with severe mental effort or hesitation."
              >
                Hard
              </button>
              <button
                className="fsrsFixture__btn fsrsFixture__btn--good"
                onClick={() => handleRating('Good')}
                title="Good: Recalled smoothly with normal effort."
              >
                Good
              </button>
              <button
                className="fsrsFixture__btn fsrsFixture__btn--easy"
                onClick={() => handleRating('Easy')}
                title="Easy: Instant recall; too simple."
              >
                Easy
              </button>
            </div>
            <p className="fsrsFixture__hint">
              Subjective memory rating feeds FSRS scheduling in the future.
            </p>
            <ul className="fsrsFixture__ratingLegend">
              <li>Hard: Recalled with severe mental effort or hesitation.</li>
              <li>Good: Recalled smoothly with normal effort.</li>
              <li>Easy: Instant recall; too simple.</li>
            </ul>
          </div>
        )}

        {state.phase === 'result' && (
          <div className="fsrsFixture__phase fsrsFixture__phase--result">
            <p className="fsrsFixture__label">Result</p>
            <p className="fsrsFixture__resultLine">
              Objective: <strong>{state.objective === 'wrong' ? 'Wrong' : 'Right'}</strong>
            </p>
            <p className="fsrsFixture__resultLine">
              Memory rating: <strong>{state.memoryRating}</strong>
            </p>
            {state.objective === 'wrong' && (
              <p className="fsrsFixture__ratingNote">
                Again: Failed to recall / Complete blackout.
              </p>
            )}
            {state.objective === 'right' && state.memoryRating === 'Hard' && (
              <p className="fsrsFixture__ratingNote">
                Hard: Recalled with severe mental effort or hesitation.
              </p>
            )}
            {state.objective === 'right' && state.memoryRating === 'Good' && (
              <p className="fsrsFixture__ratingNote">
                Good: Recalled smoothly with normal effort.
              </p>
            )}
            {state.objective === 'right' && state.memoryRating === 'Easy' && (
              <p className="fsrsFixture__ratingNote">
                Easy: Instant recall; too simple.
              </p>
            )}
            <p className="fsrsFixture__safetyNote">
              This fixture does not save, schedule, migrate, or modify review records.
            </p>
            <p className="fsrsFixture__safetyNote">
              No data was saved. No scheduling occurred.
            </p>
            <button
              className="fsrsFixture__btn fsrsFixture__btn--reset"
              onClick={handleReset}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
