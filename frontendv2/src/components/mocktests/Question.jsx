import React, { useState} from 'react';

const Question = ({ question,updateChosenAnswer}) => {     

    return (
        <div className="bg-surface rounded-2xl p-4 mb-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Question {question.number} of {question.total}
                </h3>
                <p className="text-base">{question.question}</p>
            </div>
            <div className="flex flex-col gap-2">
                {question.answers.map((answer, index) => (
                    <button
                        key={index}
                        className={`p-3 text-left rounded-xl transition-all duration-300 ${
                            question.chosenAnswer === answer
                                ? 'bg-gray-100 text-black'
                                : 'bg-white hover:bg-gray-100'
                        }`}
                        onClick={() => updateChosenAnswer(question.number, answer)}
                    >
                        {answer}
                    </button>
                ))}
            </div>
        </div>
    );
};
export default Question;
