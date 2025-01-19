import React, { useState } from 'react';

const Question = ({ question, key }) => { 
    const [isCorrect, setIsCorrect] = useState(null); 

    const handleAnswerChange = (answer) => {
        setIsCorrect(answer === question.rightAnswer); 
    };

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
                        id={`value-${index}`}
                        value={answer}
                        onChange={() => handleAnswerChange(answer)} // Update state on change
                    />
                    <label htmlFor={`value-${index}`}>{answer}</label>
                </div>
            ))}

            {isCorrect === true && (
                <span className="result success">Congratulations! That's correct.</span>
            )}
            {isCorrect === false && (
                <span className="result error">Oops! That's incorrect.</span>
            )}
        </div>
    );
};

export default Question;
