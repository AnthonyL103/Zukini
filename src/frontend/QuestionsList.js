import React, { useState } from 'react';
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
                <div className="MTbuttonwrapper">
                    <div className="results">
                    <h3>Results: {finalscore !== null ? `${finalscore} / ${allQuestions.length}` : "Pending..."}</h3>
                    </div>

                    <button onClick={handleSubmit} className="submit-button">
                    Submit
                </button>
                </div>
                
        </div>
        
    );
};

export default QuestionsList;