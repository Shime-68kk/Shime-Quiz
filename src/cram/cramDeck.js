import leThuyDeck from '../data/leThuyDeck.js';

// The deck the student deployment studies, shaped for the cram screens.
export const DECK = leThuyDeck;
export const ITEMS = DECK.items;
export const ITEM_BY_ID = new Map(ITEMS.map(item => [item.id, item]));
export const CHAPTERS = DECK.topics.map((topic, index) => ({
  ...topic,
  number: index + 1,
  shortTitle: topic.title.replace(/^Chương \d+\.\s*/u, ''),
  items: ITEMS.filter(item => item.topicId === topic.id)
}));
export const CHAPTER_BY_ID = new Map(CHAPTERS.map(chapter => [chapter.id, chapter]));
