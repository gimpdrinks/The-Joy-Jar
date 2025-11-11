
import React from 'react';

const ConfettiPiece: React.FC<{ i: number }> = ({ i }) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-indigo-400'];
    const animations = ['animate-confetti-slow', 'animate-confetti-medium', 'animate-confetti-fast'];
    const color = colors[i % colors.length];
    const animation = animations[i % animations.length];
    const left = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 2}s`;
    return <div className={`absolute top-0 w-2 h-2 ${color} rounded-full motion-safe:${animation} opacity-0`} style={{ left, animationDelay: delay }} />;
};

const Confetti: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
        {[...Array(50)].map((_, i) => <ConfettiPiece key={i} i={i} />)}
    </div>
);

export default Confetti;
