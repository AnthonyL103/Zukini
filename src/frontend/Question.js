import React, { useState, useEffect } from 'react';

const Question = ({ question, key, updateChosenAnswer}) => { 
    const [chosen, setChosen] = useState(question.chosen || null);
    
    const handleAnswerChange = (answer) => {
        console.log("Hello");
        setChosen(answer);
        updateChosenAnswer(question.number, answer);
    };
    
    return (
        <div className="radio-input">
            <div className="info">
                <span className="question">{question.question}</span>
                <span className="steps">{question.number}/{question.total}</span> 
            </div>

            {question.answers.map((answer, index) => (
                //using react fragment instead, and didn't work before because radio options were missing name attribute 
                <React.Fragment key={index}>
                    <input
                        type="radio"
                        id={`value-${index}-${question.number}`}
                        name={`question-${question.number}`}
                        value={answer}
                        checked={chosen === answer}
                        onChange={() => handleAnswerChange(answer)}
                    />
                    <label htmlFor={`value-${index}-${question.number}`}>{answer}</label>
                </React.Fragment>
            ))}

        </div>
    );
};

export default Question;
