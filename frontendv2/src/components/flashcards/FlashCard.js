import React, { useState } from 'react'

const Flashcard = ({ flashcard }) => {
    const [flip, setFlip] = useState(false)

    return (
        <div 
            className={`flex flex-col items-center relative rounded-2xl p-4 justify-center border-2 border-black bg-surface transform-gpu transition-transform duration-300 cursor-pointer h-[275px] text-lg ${
                flip ? 'rotate-y-180 hover:bg-primary-hover' : 'hover:bg-primary-hover hover:text-white hover:shadow-lg'
            }`} 
            onClick={() => setFlip(!flip)}
            style={{ transformStyle: 'preserve-3d', transform: `perspective(1000px) rotateY(${flip ? '180deg' : '0deg'})` }}
        >
            <div className="absolute p-[5px] backface-hidden max-h-full">
                <strong>{flashcard.question}</strong>
            </div>
            <div className="relative overflow-auto text-lg p-[5px] backface-hidden max-h-full"
                style={{ transform: 'rotateY(180deg)' }}
            >
                {flashcard.answer}
            </div>
        </div>
    )
}

export default Flashcard