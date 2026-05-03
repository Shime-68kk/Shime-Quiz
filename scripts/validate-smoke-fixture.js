import fs from 'node:fs';
import path from 'node:path';

const fixturePath = path.join(process.cwd(), 'test', 'fixtures', 'smoke-quiz.json');

function fail(message) {
  console.error(`[smoke-fixture] ${message}`);
  process.exitCode = 1;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateQuestion(question, index) {
  const label = `question ${index + 1}`;

  if (!question || typeof question !== 'object') {
    fail(`${label} must be an object`);
    return;
  }

  if (!isNonEmptyString(question.text)) fail(`${label} is missing text`);

  if (!Array.isArray(question.choices)) {
    fail(`${label} choices must be an array`);
  } else {
    const nonEmptyChoices = question.choices.filter(isNonEmptyString);
    if (nonEmptyChoices.length < 2) fail(`${label} must have at least 2 non-empty choices`);
    if (nonEmptyChoices.length !== question.choices.length) fail(`${label} has empty choices`);
  }

  if (!Number.isInteger(question.answer)) {
    fail(`${label} answer must be an integer index`);
  } else if (Array.isArray(question.choices) && (question.answer < 0 || question.answer >= question.choices.length)) {
    fail(`${label} answer index is out of range`);
  }

  if (!isNonEmptyString(question.chapter) && !isNonEmptyString(question.category)) {
    fail(`${label} should include chapter or category for filter smoke tests`);
  }
}

try {
  const raw = fs.readFileSync(fixturePath, 'utf8');
  const data = JSON.parse(raw);

  if (!data || typeof data !== 'object') fail('fixture root must be an object');
  if (!isNonEmptyString(data.title)) fail('fixture is missing title');
  if (!Array.isArray(data.questions)) {
    fail('fixture questions must be an array');
  } else {
    if (data.questions.length < 5) fail('fixture must include at least 5 questions');
    data.questions.forEach(validateQuestion);
  }

  if (process.exitCode) process.exit();
  console.log(`[smoke-fixture] OK: ${fixturePath}`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
