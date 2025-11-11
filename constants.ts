import { Category, AppState, Settings, Win } from './types';

export const CATEGORIES: Category[] = [
  "Work", "Health", "Relationships", "Faith/Spiritual",
  "Learning", "Money", "Home", "Other"
];

export const INITIAL_SETTINGS: Settings = {
  ritualText: "Take a deep breath and smile.",
  dailyReminder: "none",
};

export const REFLECTION_PROMPTS_BY_CATEGORY = {
  "Growth & Resilience": [
    "What did this win teach me about my strength or consistency?",
    "How did I show discipline even when I didn’t feel motivated?",
    "What small risk or discomfort did I face, and how did I handle it?",
    "How is this win proof that I’ve grown from who I was a year ago?",
  ],
  "Self-Compassion": [
    "If a close friend had this same win, what would I say to them?",
    "What part of myself deserves more kindness because of today?",
    "How did I honor my needs instead of ignoring them?",
    "Did I forgive myself for something recently? How did that feel?",
  ],
  "Purpose & Alignment": [
    "Why does this win matter to me beyond results or metrics?",
    "Does this align with the kind of life I want to build?",
    "What values showed up in this moment (patience, honesty, courage)?",
    "How does this connect to something bigger — faith, growth, or service?",
  ],
  "Energy & Boundaries": [
    "What did this win cost me, and was it worth it?",
    "Did I overextend myself to achieve this? How can I balance better next time?",
    "What drained me today, and what recharged me?",
    "Who or what supported me that I should thank or acknowledge?",
  ],
  "Joy & Gratitude": [
    "What part of this win brought me quiet joy or peace?",
    "What am I grateful for that made this moment possible?",
    "How can I celebrate this in a small, meaningful way today?",
    "If today were a chapter title in my story, what would it be?",
  ]
};

export const ALL_REFLECTION_PROMPTS = Object.values(REFLECTION_PROMPTS_BY_CATEGORY).flat();


const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const SEED_WINS: Win[] = [
    {
        id: 'seed-1',
        date: formatDate(new Date()),
        title: 'Finished a major work project',
        category: 'Work',
        tags: ['focus', 'deep-work'],
        mood: 5,
        effort: 4,
        cost: 0,
        notes: "Finally shipped the feature after weeks of hard work. Felt amazing."
    },
    {
        id: 'seed-2',
        date: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
        title: 'Went for a 30-minute run',
        category: 'Health',
        tags: ['fitness', 'outdoors'],
        mood: 4,
        effort: 3,
        cost: 0,
    },
    {
        id: 'seed-3',
        date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
        title: 'Called a friend I haven’t spoken to in a while',
        category: 'Relationships',
        tags: ['connection'],
        mood: 5,
        effort: 2,
        cost: 0,
    },
    {
        id: 'seed-4',
        date: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
        title: 'Read a chapter of a new book',
        category: 'Learning',
        tags: ['reading', 'quiet'],
        mood: 4,
        effort: 1,
        cost: 800,
        notes: "New book on web design. Worth the cost."
    },
    {
        id: 'seed-5',
        date: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
        title: 'Cooked a healthy meal instead of ordering out',
        category: 'Money',
        tags: ['cooking', 'savings'],
        mood: 3,
        effort: 3,
        cost: 350,
    },
    {
        id: 'seed-6',
        date: formatDate(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)),
        title: 'Cleaned and organized the home office',
        category: 'Home',
        tags: ['organization', 'focus'],
        mood: 4,
        effort: 4,
        cost: 0,
    },
];


export const INITIAL_APP_STATE: AppState = {
  wins: [],
  settings: INITIAL_SETTINGS,
  categories: CATEGORIES,
  analysisHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: "1",
};