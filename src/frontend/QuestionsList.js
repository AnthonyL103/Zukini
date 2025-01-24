import React, { useState, useEffect } from 'react';
import Question from './Question';

const QuestionsList = ({questions = [] }) => {
    const [allQuestions, setAllQuestions] = useState(questions);
    const [finalscore, setFinalScore] = useState(null);
    const updateChosenAnswer = (questionNum, chosenAnswer) => {
        setAllQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.number === questionNum ? { ...q, chosenAnswer } : q,
                console.log("chosenAnswer",chosenAnswer)
            )
        );
    };
    
    const handleSubmit = () => {
        const score = allQuestions.reduce((total, q) => {
            return total + (q.chosenAnswer === q.rightAnswer ? 1 : 0);
        }, 0);
        setFinalScore(score);
    };

    return (
        <div className="questions-grid">
                {allQuestions.map((question) => (
                <Question question={question} 
                    key = {question.id}
                    updateChosenAnswer={updateChosenAnswer}
                />
                ))}
                {finalscore !== null && (
                    <div>
                        <h3>Score: {finalscore} / {allQuestions.length}</h3>
                    </div>
                )}
            <button onClick={handleSubmit} className="submit-button">
                Submit
            </button>
        </div>
        
    );
};

export default QuestionsList;