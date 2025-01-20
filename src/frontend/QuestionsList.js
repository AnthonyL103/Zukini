import React, { useState, useEffect } from 'react';
import Question from './Question';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";


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
            {questions.length > 0 ? (
                <Swiper
                spaceBetween={50}
                slidesPerView={1}
            >
                {questions.map((question) => (
                    <SwiperSlide key={question.id}>
                        <Question question={question} />
                    </SwiperSlide>
                ))}
            </Swiper>
            ) : (
                <p>Loading questions</p>
                
            )}
        </div>
    );
};

export default QuestionsList;