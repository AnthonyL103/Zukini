import React, { useState, useEffect } from 'react';
import Question from './Question';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";


const QuestionsList = ({setClearVisibleQuestions, questions = [] }) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

    const handleQuestionSelect = (index) => {
        setSelectedQuestionIndex(index);
    };
    

    return (
        <div className="questions-grid">
                {questions.map((question) => (
                <Question question={question} />
                ))}
        </div>
    );
};

export default QuestionsList;