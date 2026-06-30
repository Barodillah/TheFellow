import React from 'react';

export default function DecorativeRule() {
    return (
        <div className="flex items-center justify-center my-8 select-none">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent flex-grow max-w-[200px]" />
            <span className="mx-4 text-accent font-serif text-xs tracking-widest flex items-center gap-1.5">
                <span>·</span>
                <span className="text-[8px] transform rotate-45">◆</span>
                <span>·</span>
            </span>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent flex-grow max-w-[200px]" />
        </div>
    );
}
