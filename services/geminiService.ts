import { GoogleGenAI } from "@google/genai";
import { Win } from '../types';

export const analyzeWinsWithAI = async (wins: Win[], range: string): Promise<string> => {
    if (wins.length === 0) {
        return "No wins to analyze for this period. What's one small thing you could celebrate today?";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const minimalWinsData = wins.map(({ title, date, category, tags, mood, effort, cost, notes }) => ({
        title, date, category, tags, mood, effort, cost, notes: notes || undefined
    }));

    const prompt = `
You are 'The Joy Jar Coach,' a warm, insightful, and celebratory reflection partner.
Your tone is 100% positive and gentle. You are not a critic; you are a mirror, helping the user celebrate their progress and find patterns in their own data.
Your goal is to analyze the user's 'wins' for the given period (${range}) and provide short, actionable insights.

Here is how to interpret the data:
- mood (1-5): 5 is amazing, 1 is just okay. High-mood wins are key.
- effort (1-5): 5 is max effort. A high-effort, high-mood win is a major success. A high-effort, low-mood win might be a sign of burnout or a task to re-evaluate.
- category: Shows which life areas (Work, Health, etc.) are getting positive attention.
- tags: These are the user's own keywords. Look for recurring tags (e.g., 'focus', 'connection', 'fitness') to identify what activities are *really* working for them.
- cost: Any cost > 0 was a "celebration."

Return your response using markdown.
Your response must contain EXACTLY 4 sections, with these specific bolded headers:

1. **Highlights**: Celebrate 1-2 *specific* achievements from the data. Connect them directly to \`mood\`, \`effort\`, or \`tags\`. (e.g., "That 'deep-work' tag really paid off, leading to a 5-star mood on your big project!").
2. **Growth to Repeat**: Suggest 2-3 *specific, actionable* behaviors to carry forward, based *directly* on high-mood wins and recurring \`tags\`. (e.g., "You had two high-mood wins tagged 'connection.' Can you schedule one more call like that next week?").
3. **Opportunities for Balance**: *Gently* point out one observation for reflection. Frame it as an opportunity, not a problem. (e.g., "I see a lot of high-effort 'Work' wins this week. What's one small 'Health' or 'Relationships' win you could aim for next?").
4. **One-Line Mantra**: A short, inspiring phrase for the week ahead (10 words max).

Keep the total response under 120 words. Be specific to the data provided below. Do not be generic.

<DATA>
${JSON.stringify(minimalWinsData, null, 2)}
</DATA>
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `It seems I had trouble connecting. Please check the AI configuration and your network connection.\n(Error: ${error.message})`;
        }
        return "It seems I had trouble connecting due to an unknown error. Please check your network connection.";
    }
};