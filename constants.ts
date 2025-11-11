import { Category, AppState, Settings, Win } from './types';

export const CATEGORIES: Category[] = [
  "Work", "Health", "Relationships", "Faith/Spiritual",
  "Learning", "Money", "Home", "Other"
];

export const INITIAL_SETTINGS: Settings = {
  ritualText: "Take a deep breath and smile.",
  dailyReminder: "none",
};

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: "1",
};
