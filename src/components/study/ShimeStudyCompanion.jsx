import ShimeRobotPresence from '../brand/ShimeRobotPresence.jsx';

const EXPRESSIONS = Object.freeze({
  neutral: 'attentive',
  revealed: 'revealed',
  correct: 'correct',
  incorrect: 'incorrect',
  completed: 'complete'
});

export function getStudyCompanionExpression(reaction = 'neutral') {
  return EXPRESSIONS[reaction] || EXPRESSIONS.neutral;
}

export default function ShimeStudyCompanion({ reaction = 'neutral', message, label }) {
  const expression = getStudyCompanionExpression(reaction);
  const feedbackActive = reaction === 'correct' || reaction === 'incorrect' || reaction === 'completed';

  return (
    <div
      className={`studyMascotContainer studyMascotContainer--${expression}`}
      aria-label={label}
      data-study-companion-reaction={reaction}
    >
      <ShimeRobotPresence
        state="ready"
        size="lg"
        expression={expression}
        motion={feedbackActive ? 'feedback' : 'idle'}
        blinkPhase="c"
        decorative
      />
      <div className="mascotBubble">
        <p>{message}</p>
      </div>
    </div>
  );
}
