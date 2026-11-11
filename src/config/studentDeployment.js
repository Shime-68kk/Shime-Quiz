// Deployment profile for the build sent to Lệ Thủy.
//
// ON in dev and production builds: the app opens on the cram ("Ôn cấp tốc")
// screen, ships her GDQP-AN deck instead of the sample data, and turns active
// FSRS scheduling on by default for the full Study Room.
// OFF under Vitest (MODE === 'test') so the existing default-off test contracts
// keep describing the generic app; dedicated tests cover the student profile.
// Override with VITE_SHIME_STUDENT_DEPLOYMENT=off to build the generic app.

function readEnv() {
  try {
    return import.meta.env || {};
  } catch {
    return {};
  }
}

export function isStudentDeployment(env = readEnv()) {
  const override = String(env.VITE_SHIME_STUDENT_DEPLOYMENT || '').trim().toLowerCase();
  if (['0', 'false', 'off', 'disabled'].includes(override)) return false;
  if (['1', 'true', 'on', 'enabled'].includes(override)) return true;
  return env.MODE !== 'test';
}

export const STUDENT_DEPLOYMENT = isStudentDeployment();
export const CRAM_ROUTE_PATH = '/on-thi';
