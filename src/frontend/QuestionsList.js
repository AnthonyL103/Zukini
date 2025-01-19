import React, { useState, useEffect } from 'react';
import Question from './Question';

const QuestionsList = ({setClearVisibleQuestions, questions = [] }) => {
    const [visibleQuestions, setVisibleQuestions] = useState([]); 
    
    useEffect(() => {
        if (questions.length > 0) {
            let currentIndex = 0;
    
            const interval = setInterval(() => {
                setVisibleQuestions((prev) => [...prev, questions[currentIndex]]);
                console.log('Adding question:', currentIndex, questions.length); 
                currentIndex++;
                if (currentIndex >= questions.length-1) {
                    clearInterval(interval); // Stop the interval when all questions are displayed
                }
            }, 400); 
            console.log("made it");
            return () => clearInterval(interval); 
        }
    }, [questions]);
    
    
    useEffect(() => {
        if (setClearVisibleQuestions) {
          setClearVisibleQuestions(() => () => {
            setVisibleQuestions([]); // Clear visible questions when triggered
          });
        }
      }, [setClearVisibleQuestions]);
    

    return (
        <div className="questions-grid">
            {questions.map((question) => (
                <Question question={question} key={question.id} />
            ))}
        </div>
    );
};

export default QuestionsList;