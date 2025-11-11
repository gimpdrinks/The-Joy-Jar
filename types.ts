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
  dailyReminder: "none" | "9:00 AM" | "9:00 PM";
};

export type AIAnalysis = {
  id: string;
  date: string;
  period: TimeFilter;
  winsAnalyzedCount: number;
  winIds: string[];
  content: string;
};

export type AppState = {
  wins: Win[];
  settings: Settings;
  categories: Category[];
  analysisHistory: AIAnalysis[];
  createdAt: string;
  updatedAt: string;
  version: "1";
};

export type TimeFilter = "today" | "7d" | "30d" | "all";