import React, { useState } from 'react'

const Flashcard = ({ flashcard}) => {
    const [flip, setFlip] = useState(false)

    return (
        <div className={`card ${flip ? 'flip' : ''}`} onClick={() => setFlip(!flip)}>
            <div className="front"> <strong>{flashcard.question}</strong></div>
            <div className="back">{flashcard.answer}</div>
        </div>
    )
}

export default Flashcard
