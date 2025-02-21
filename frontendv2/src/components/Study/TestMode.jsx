import React, { useState } from 'react';

export const TestMode = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const questions = [
    {
      id: '1',
      question: 'Sample question 1?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A'
    },
    {
      id: '2',
      question: 'Sample question 2?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option B'
    }
  ];

  const handleAnswerSelect = (answer) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const totalCorrect = questions.reduce((count, question) => {
      return count + (selectedAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    setScore(totalCorrect);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">Test Mode</h2>
      
      {/* Score Display */}
      {isSubmitted && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold">
            Score: {score} / {questions.length}
          </p>
        </div>
      )}

      {/* Question Display */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-lg">{questions[currentQuestion].question}</p>
        </div>
        
        {/* Answer Options */}
        <div className="space-y-2">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-3 text-left border rounded-lg transition-colors
                ${selectedAnswers[questions[currentQuestion].id] === option
                  ? 'bg-[#0f0647] text-white'
                  : 'border-gray-300 hover:bg-gray-50'
                }
                ${isSubmitted && option === questions[currentQuestion].correctAnswer
                  ? 'bg-green-500 text-white'
                  : ''
                }
                ${isSubmitted && 
                  selectedAnswers[questions[currentQuestion].id] === option &&
                  option !== questions[currentQuestion].correctAnswer
                  ? 'bg-red-500 text-white'
                  : ''
                }
              `}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation and Submit */}
      <div className="flex justify-between gap-4">
        <button 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            Submit
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TestMode;