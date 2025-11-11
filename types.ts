export type Category = string;

export type Win = {
  id: string;
  date: string;           // YYYY-MM-DD
  title: string;
  notes?: string;
  tags: string[];
  category: Category;
  mood: number;           // 1-5
  effort: number;         // 1-5
  cost: number;           // pesos, allow 0
};

export type Settings = {
  ritualText: string;
  dailyReminder: "none" | "9:00" | "21:00";
};

export type AppState = {
  wins: Win[];
  settings: Settings;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
  version: "1";
};

export type TimeFilter = "today" | "7d" | "30d" | "all";
