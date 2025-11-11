import { GoogleGenAI } from "@google/genai";
import { Win } from '../types';

// FIX: Update mock response to remove prompt for API key.
const MOCK_AI_RESPONSE = `This is a sample analysis from your Reflection Coach!

*   **Highlights:** Notice how the AI can pinpoint your most impactful activities, like connecting with friends or completing a big project.
*   **Repeat next week:** The coach will suggest concrete actions based on your high-mood wins, helping you build positive momentum.
*   **Watch-outs:** Get gentle nudges on patterns related to spending or effort, helping you stay mindful and balanced.
*   **One-line mantra:** Your journey of reflection starts here.`;


// FIX: Refactor to use process.env.API_KEY and remove apiKey parameter, per guidelines.
export const analyzeWinsWithAI = async (wins: Win[], range: string): Promise<string> => {
    // FIX: Check for process.env.API_KEY instead of passed key.
    if (!process.env.API_KEY) {
        return Promise.resolve(MOCK_AI_RESPONSE);
    }
    if (wins.length === 0) {
        return "No wins to analyze for this period. What's one small thing you could celebrate today?";
    }

    // FIX: Initialize with process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const minimalWinsData = wins.map(({ title, date, category, tags, mood, effort, cost, notes }) => ({
        title, date, category, tags, mood, effort, cost, notes: notes || undefined
    }));

    const prompt = `
You are a kind, practical reflection coach, acting as a private mirror for the user. Your tone is always gentle, positive, and celebratory. Your goal is to provide actionable advice and positive reinforcement.
Summarize these wins for ${range}. Return EXACTLY 4 bullets, using markdown for bolding:

1) **Highlights**: Celebrate 1-2 key achievements. Mention *why* they are significant based on mood, effort, or category (e.g., "Big effort on that work project paid off with a huge mood boost!"). This is for positive reinforcement.
2) **Repeat Next Week**: Suggest 3 specific, actionable behaviors to carry forward. Base these on high-mood wins. Frame them as encouraging experiments (e.g., "Could you schedule another call with a friend? It clearly lifted your spirits.").
3) **Watch-outs**: Gently point out a potential pattern related to money, effort, or mood (e.g., high spending, or low-mood streaks). Offer one supportive nudge or question for reflection.
4) **One-Line Mantra**: A short, inspiring phrase for the week ahead (10 words max).

Be specific to the provided data. Keep the total response under 110 words.

DATA:
${JSON.stringify(minimalWinsData, null, 2)}
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
            // FIX: Remove reference to API key in user-facing error message.
            return `It seems I had trouble connecting. Please check your network connection.\n(Error: ${error.message})`;
        }
        // FIX: Remove reference to API key in user-facing error message.
        return "It seems I had trouble connecting due to an unknown error. Please check your network connection.";
    }
};
