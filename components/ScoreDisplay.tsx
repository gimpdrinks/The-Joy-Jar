
import React from 'react';
import { MOOD_CONFIG, EFFORT_CONFIG } from './configs';

const ScoreDisplay: React.FC<{ label: string; value: number; type: 'mood' | 'effort' }> = ({ label, value, type }) => {
    const config = type === 'mood' ? MOOD_CONFIG : EFFORT_CONFIG;
    const textColorClass = config.textColors[value - 1];
    const labelText = config.labels[value - 1];
    const emoji = labelText.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u)?.[0] || '';

    return (
        <p className="flex items-center justify-end gap-1.5">
            <span>{label}: {value}/5</span>
            <span className={`${textColorClass} text-lg`}>{emoji}</span>
        </p>
    );
};

export default ScoreDisplay;
