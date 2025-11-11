import { GoogleGenAI } from "@google/genai";
import { Win } from '../types';

const MOCK_AI_RESPONSE = `This is a sample analysis from your Reflection Coach!

*   **Highlights:** Notice how the AI can pinpoint your most impactful activities, like connecting with friends or completing a big project.
*   **Repeat next week:** The coach will suggest concrete actions based on your high-mood wins, helping you build positive momentum.
*   **Watch-outs:** Get gentle nudges on patterns related to spending or effort, helping you stay mindful and balanced.
*   **One-line mantra:** Your journey of reflection starts here.

Add your Gemini API key in Settings to unlock personalized insights for your real wins!`;


export const analyzeWinsWithAI = async (wins: Win[], apiKey: string, range: string): Promise<string> => {
    if (!apiKey) {
        return Promise.resolve(MOCK_AI_RESPONSE);
    }
    if (wins.length === 0) {
        return "No wins to analyze for this period. What's one small thing you could celebrate today?";
    }

    const ai = new GoogleGenAI({ apiKey });

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
            return `It seems I had trouble connecting. Please check your API key and network connection.\n(Error: ${error.message})`;
        }
        return "It seems I had trouble connecting due to an unknown error. Please check your API key and network connection.";
    }
};