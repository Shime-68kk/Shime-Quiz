const DEFAULT_LIMIT = 20;

export function createInitialBehaviorMemory(options = {}) {
  return {
    limit: Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : DEFAULT_LIMIT,
    recentIntents: [],
    recentCommands: [],
    lastIntent: null,
    lastCommand: null,
    repeatedIntentCount: 0,
    repeatedCommandCount: 0
  };
}

export function rememberCompanionBehavior(memory = createInitialBehaviorMemory(), decision = {}) {
  const intent = decision.intent || 'neutral_wait';
  const command = decision.recommendedRobotActionFamily || decision.command || 'neutral';
  const repeatedIntentCount = memory.lastIntent === intent ? memory.repeatedIntentCount + 1 : 1;
  const repeatedCommandCount = memory.lastCommand === command ? memory.repeatedCommandCount + 1 : 1;
  return {
    ...memory,
    recentIntents: [...memory.recentIntents, intent].slice(-memory.limit),
    recentCommands: [...memory.recentCommands, command].slice(-memory.limit),
    lastIntent: intent,
    lastCommand: command,
    repeatedIntentCount,
    repeatedCommandCount
  };
}

export function shouldSuppressBehavior(memory = createInitialBehaviorMemory(), intentOrCommand) {
  if (!intentOrCommand) return false;
  const recentIntentCount = memory.recentIntents.filter(intent => intent === intentOrCommand).length;
  const recentCommandCount = memory.recentCommands.filter(command => command === intentOrCommand).length;
  return recentIntentCount >= 2 || recentCommandCount >= 2;
}

export function resetBehaviorMemory(options = {}) {
  return createInitialBehaviorMemory(options);
}

