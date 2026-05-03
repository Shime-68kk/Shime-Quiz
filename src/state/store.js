export function createInitialState() {
  return {
    allQuizzes: [],
    quiz: null,
    idx: 0,
    answers: [],
    timerId: null,
    wrongStreak: 0,
    questionFilter: "all",
    autoNextTimer: null,
    lastWrongKey: "",
    sheepOpen: false,
    currentTimeLeft: 0,
    currentQuizIndex: 0,
    isSubmitted: false,
    qCells: [],
    mapBuilt: false,
    currentCellIndex: -1,
    searchKeywordN: "",
    searchIndex: []
  };
}
