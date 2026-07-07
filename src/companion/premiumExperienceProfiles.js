export const PREMIUM_EXPERIENCE_PROFILES = Object.freeze({
  calm_companion: Object.freeze({ tone: 'calm', intensity: 'low', celebrationStyle: 'small', allowNotify: true }),
  energetic_companion: Object.freeze({ tone: 'bright', intensity: 'medium', celebrationStyle: 'small', allowNotify: true }),
  classroom_safe: Object.freeze({ tone: 'quiet', intensity: 'low', celebrationStyle: 'small', allowNotify: false }),
  focus_only: Object.freeze({ tone: 'minimal', intensity: 'low', celebrationStyle: 'none', allowNotify: false }),
  premium_showcase: Object.freeze({ tone: 'warm', intensity: 'medium', celebrationStyle: 'big', allowNotify: true })
});

export function getPremiumExperienceProfile(profileName = 'calm_companion') {
  return PREMIUM_EXPERIENCE_PROFILES[profileName] || PREMIUM_EXPERIENCE_PROFILES.calm_companion;
}
