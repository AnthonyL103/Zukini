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
        <div className="grid gap-4 p-4">
            {allQuestions.map((question) => (
                <Question 
                    question={question} 
                    key={question.id}
                    updateChosenAnswer={updateChosenAnswer}
                />
            ))}
            <div className="flex flex-col items-center gap-4 mt-4">
                <div className="text-center">
                    <p className="text-xl font-semibold">
                        Result: {finalscore !== null ? `${finalscore} / ${allQuestions.length}` : "Pending..."}
                    </p>
                </div>
                <button 
                    onClick={handleSubmit}
                    className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default QuestionsList;