import React, { useState, useEffect } from 'react';

const Question = ({ question, key }) => { 
    const [isCorrect, setIsCorrect] = useState(null); 
    
    useEffect(() => {
        // Reset the answer state when a new question is loaded
        setIsCorrect(null);
    }, [question]);
    
    const handleAnswerChange = (answer) => {
        if (isCorrect !== null) {
            return; 
        }
        const trimmedAnswer = answer.trim();
        const trimmedCorrectAnswer = question.rightAnswer.trim();
    
        if (String(trimmedAnswer) === String(trimmedCorrectAnswer)) {
            console.log("here");
            setIsCorrect(true); 
        } else {
            setIsCorrect(false);
        }
    
        console.log('Answer:', trimmedAnswer, 'Correct:', trimmedCorrectAnswer);
    };
    
    useEffect(() => {
        console.log('Updated isCorrect state:', isCorrect);
    }, [isCorrect]);

    return (
        <div className="radio-input">
            <div className="info">
                <span className="question">{question.question}</span>
                <span className="steps">3/10</span> 
            </div>

            {question.answers.map((answer, index) => (
                <div key={index} className="radio-option">
                    <input
                        type="radio"
                        id={`value-${index}-${key}`}
                        value={answer}
                        onChange={() => handleAnswerChange(answer)} 
                        disabled={isCorrect !== null}
                        className={answer === question.rightAnswer ? 'correct-answer' : 'incorrect-answer'}
                    />
                    <label htmlFor={`value-${index}`}>{answer}</label>
                </div>
            ))}
        </div>
    );
};

export default Question;
