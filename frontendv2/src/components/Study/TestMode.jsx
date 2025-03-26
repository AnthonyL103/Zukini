import React, { useState, useEffect } from 'react';
import { useMT } from '../mocktests/MTcontext';
import { useScan } from '../scans/ScanContext';
import { useUser } from '../authentication/UserContext';
import PencilLoader from '../utils/pencilloader';
import PastMockTestList from '../mocktests/PastMocktestList';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react'

export const TestMode = () => {
  const { currentMT, setCurrentMT } = useMT();
  const { currentScan } = useScan();
  const { userId, setTotalMockTests, isPremium } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showMTNameModal, setShowMTNameModal] = useState(false);
  const [MTName, setMTName] = useState("");
  const [savenabled, setSaveEnabled] = useState(false);
  const [showpastMT, setshowpastMT] = useState(true);
  const [MTentry, setMTEntry] = useState(null);
  const [isloading, setisLoading] = useState(false);
  const [showVA, setshowVA] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [saveEdit, setsaveEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [regenerate, setRegenerate] = useState(false);


  useEffect(() => {
    if (currentMT && !saveEdit && !regenerate) {
      console.log("Mock Test Questions:", currentMT.questions);
      setQuestions(currentMT.questions || []);
    } else {
      setQuestions([]);
    }
  }, [currentMT]);

  useEffect(() => {
    if (currentScan) {
      const mocktestStorageKey = `mocktests_${userId}_${currentScan.scankey}`;
      const storedMockTests = localStorage.getItem(mocktestStorageKey);

      if (storedMockTests) {
        console.log("Using cached mock tests from local storage.");
        setQuestions(JSON.parse(storedMockTests));
        setSaveEnabled(false);
      } else {
        generateMockTests();
      }
    }
  }, [currentScan]);
  
  const handleRetry = () => {
    setIsSubmitted(false);      
    setScore(null);             
    setCurrentQuestion(0);      
    setSelectedAnswers({});     
  };

  const handleAddQuestion = () => {
    if (errorMessage){
      return;
    }
    if (!newQuestion.trim() || newAnswers.some(answer => answer.trim() === "")) {
      setErrorMessage("All fields must be filled.");
      return;
    }
  
    const newQuestionObj = {
      id: `${questions.length}-${Date.now()}`,
      number: questions.length + 1,
      total: questions.length + 1,
      question: newQuestion,
      answers: [...newAnswers],
      rightAnswer: newAnswers[correctAnswerIndex],
      chosenAnswer: null,
    };
  
    setQuestions([...questions, newQuestionObj]);
  
    // Reset form after adding
    setShowAddQuestionForm(false);
    setNewQuestion("");
    setNewAnswers(["", "", "", ""]);
    setCorrectAnswerIndex(0);
    setErrorMessage("");
    setSaveEnabled(true);
  };

  const handleDeleteQuestion = async (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    setSaveEnabled(true); 
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...newAnswers];
    updatedAnswers[index] = value.trim(); 
  
    const filledAnswers = updatedAnswers.filter(a => a.trim() !== "");
    const answerSet = new Set(filledAnswers.map(a => a.toLowerCase()));
  
    if (answerSet.size !== filledAnswers.length) {
      setErrorMessage("Answers cannot be the same.");
    } else {
      setErrorMessage(""); 
    }
  
    setNewAnswers(updatedAnswers);
  };
  
  const handleCancel = () => {
    setShowAddQuestionForm(false);
    setNewQuestion("");
    setNewAnswers(["", "", "", ""]); 
    setCorrectAnswerIndex(0);
    setErrorMessage(""); 
  };
  
  

  const handleSaveEditQuestion = async () => {
    console.log("in save edit");
    setsaveEdit(true); 
    try {
  
      await handleSave();
  
      const deleteResponse = await fetch(
        `https://api.zukini.com/display/deleteMT?key=${currentMT.mocktestkey}&userId=${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete old mock test");
      }
      console.log("Old mock test deleted successfully");
  
      const mocktestStorageKey = `mocktests_${userId}_${currentScan.scankey}`;
      localStorage.setItem(mocktestStorageKey, JSON.stringify(questions));
  
      console.log("Local storage updated with the new mock test");
  
      setTimeout(() => {
        window.location.reload();
      }, 500);
  
    } catch (error) {
      console.error("Error updating mock test:", error);
      alert("Failed to update mock test. Please try again.");
    }
  };
  
  
  
  const handleSave = async () => {
    if (!currentScan) return;
  
    try {
      const key = uuidv4();
      const payload = {
        mocktestkey: key,
        filepath: currentScan.filepath,
        scanname: currentScan.scanname,
        questions: questions,
        mtsessionname: MTName || currentMT.mtsessionname,
        date: currentScan.date,
        scankey: currentScan.scankey,
        userid: userId,
      };
  
      const response = await fetch('https://api.zukini.com/mocktests/saveMockTest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setTotalMockTests((prev) => prev + 1);
        setSaveEnabled(false);
        setCurrentMT(payload);
        setMTEntry(payload);
        console.log("Mock test saved successfully");
      } else {
        throw new Error("Failed to save updated mock test");
      }
    } catch (error) {
      console.error("Error saving mock test:", error);
      alert("Failed to save mock test. Please try again.");
    }
  };
  

  
  
  const handleAnswerSelect = (answer) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
    console.log(selectedAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    // Calculate Score
    const totalCorrect = questions.reduce((count, question) => {
      return count + (selectedAnswers[question.id] === question.rightAnswer ? 1 : 0);
    }, 0);

    setScore(totalCorrect);
  };


  const generateMockTests = async () => {
    if (!currentScan) {
      console.error("No scan selected.");
      return;
    }

    const mocktestStorageKey = `mocktests_${userId}_${currentScan.scankey}`;
    const storedMockTests = localStorage.getItem(mocktestStorageKey);

    if (!isPremium && storedMockTests) {
      console.log("Loading mock tests from local storage for user:", userId);
      setQuestions(JSON.parse(storedMockTests));
      setSaveEnabled(false);
      return;
    }

    setisLoading(true);
    setshowpastMT(false);

    const payload = {
      scanname: currentScan.scanname || "Unknown Scan",
      text: currentScan.value || "",
      date: currentScan.date || new Date().toISOString(),
    };

    try {
      const response = await fetch('https://api.zukini.com/mocktests/callparseMockTests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mock tests');
    }
    
    const result = await response.json();
    console.log("result",result.text);
    
    const ScrambleAnswers = (answers) => {
        let currentIndex = answers.length;
        while (currentIndex !== 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [answers[currentIndex], answers[randomIndex]] = [answers[randomIndex], answers[currentIndex]];
        }
        return answers;
    };
    
    const parsedQuestions = [];
    const lines = result.text.split("question:").filter(line => line.trim() !== ''); 
    
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const [questionPart, ...answerParts] = line.split("answer:"); 
        if (questionPart && answerParts.length > 0) {
            const answers = answerParts
                .map(answer => answer.trim())
                .filter(answer => answer !== "");
            
            parsedQuestions.push({
                id: `${parsedQuestions.length}-${Date.now()}`, 
                number: index + 1, 
                total: lines.length,
                question: questionPart.trim(), 
                answers: answers, 
                rightAnswer: answers[0],
                chosenAnswer: null,
            });
            
            parsedQuestions[parsedQuestions.length - 1].answers = ScrambleAnswers(parsedQuestions[parsedQuestions.length - 1].answers);
            
        }
    }
    
    
    setSaveEnabled(true);
    setQuestions(parsedQuestions);
    setisLoading(false);
    setshowpastMT(true);
    localStorage.setItem(mocktestStorageKey, JSON.stringify(parsedQuestions));
    console.log("here",parsedQuestions);
  } catch (error) {
    console.error('Error generating mock tests:', error);
    alert('Failed to generate mock tests. Please try again.');
  } finally {
    setisLoading(false);
    setRegenerate(false);
  }
};
  
  const getMTName = () => {
    setShowMTNameModal(true);
  };
  
  
  const confirmSaveMT = () => {
    if (MTName.trim().length === 0) {
      alert("Please enter a flashcard name.");
      return;
    }
    setShowMTNameModal(false);
    setMTName("");
    handleSave();
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
          Test Name: {currentMT?.mtsessionname || "None"}
        </h2>

        <div className= "flex flex-row gap-4 py-4">

        
        {isSubmitted ? (
            <div className="flex justify-between gap-4 mt-6"> 
            <div 
                className={`py-2 px-6 text-white rounded-lg text-center font-semibold
                ${(score / questions.length) < 0.5 ? 'bg-red-500' 
                : (score / questions.length) < 0.7 ? 'bg-yellow-500' 
                : (score / questions.length) < 0.8 ? 'bg-green-500' 
                : (score / questions.length) < 0.9 ? 'bg-blue-500' 
                : 'bg-purple-500'}
                `}
            >
                Score: {score} / {questions.length}
            </div>
              <button 
              onClick={handleRetry} 
              className="py-2 px-6 bg-[#0f0647] text-white rounded-lg hover:bg-opacity-90 w-32"
                >
              Retry
            </button>
          </div>
            ) : (
              <div className="flex justify-between gap-4 "> 
                {isPremium && (
                 <button

                  onClick={() => {
                    generateMockTests();
                    setRegenerate(true);}}
                  
                  className={`flex flex-row py-2 px-4 gap-2'} ${
                    regenerate
                    ? "bg-gray-400 cursor-not-allowed opacity-50 rounded-lg" 
                    : "bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 gap-1"
                  } `}

                >
                  <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            className="w-6 h-6 stroke-yellow-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                            ></path>
                          </svg>
                  Regenerate
                </button>
              )}
                
                <button
                        onClick={() => setshowVA(true)}
                        className="py-2 px-6 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 w-32"
                    >
                        View/Edit
                </button>
                </div>
            
            )}
      </div>

      </div>

      { isloading ? (
          <div className="flex justify-center items-center h-64">
            <PencilLoader />
          </div>
      ) : questions?.length > 0 ? (
        <>
          <h3 className="font-semibold mb-4">
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-lg">{questions[currentQuestion].question}</p>
          </div>

          <div className="space-y-2">
            {questions[currentQuestion].answers.map((option, index) => {
              const questionId = questions[currentQuestion].id;
            
              const selectedAnswer = selectedAnswers[questionId];

              return (
                <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-3 text-left border rounded-lg transition-colors
                    ${selectedAnswer === option && !isSubmitted
                    ? 'bg-[#0f0647] text-white '  
                    : 'border-gray-300  hover:bg-gray-400 hover:text-white'
                    }
                    ${isSubmitted && option === questions[currentQuestion].rightAnswer
                    ? 'bg-green-500 text-white'  
                    : ''
                    }
                    ${isSubmitted && selectedAnswer === option && option !== questions[currentQuestion].rightAnswer
                    ? 'bg-red-500 text-white'  
                    : ''
                    }
                `}
                >
                {String.fromCharCode(65 + index)}. {option}
                </button>

              );
            })}
          </div>


          <div className="flex justify-between gap-4 mt-6">
            {/* Previous Button */}
            <button 
                onClick={() => setCurrentQuestion(prev => Math.max(prev - 1, 0))} 
                className="flex-1 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-[#2c2099]"
            >
                Previous
            </button>

            {/* Show Submit button when at the last question, otherwise show Next button */}
            {currentQuestion === questions.length - 1 ? (
                <button 
                onClick={handleSubmit} 
                className="flex-1 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-[#5bc2b8] "
                >
                Submit
                </button>
            ) : (
                <button 
                onClick={() => setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1))} 
                className="flex-1 py-2 bg-[#67d7cc] text-white rounded-lg hover:bg-[#5bc2b8]"
                >
                Next
                </button>
            )}
            </div>

          
          <div className="flex justify-between gap-4 mt-6 mb-6">
          <button
            onClick={currentMT && savenabled ? handleSaveEditQuestion : getMTName}
            className={`flex-1 py-2 rounded-lg text-white transition-opacity ${
                !savenabled
                ? "bg-gray-400 cursor-not-allowed opacity-50"  // Disabled state (gray)
                : "bg-[#0f0647] hover:bg-opacity-90 hover:bg-[#2c2099]"           // Normal state (blue)
            }`}
            disabled={!savenabled} 
            >
            Save Mocktest
            </button>

        </div>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-[#0f0647] rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </>
      ) : saveEdit ? ( 
        <div className="flex justify-center items-center h-64">
          <PencilLoader />
        </div>
      ) : (
        <div className="bg-red-100 p-4 mt-6 rounded-lg text-red-700 text-center">
        No test selected. Please select or upload a scan.
        </div>
      )}
     {showpastMT && (
        <PastMockTestList NewMTEntry={MTentry}/>
      )}
      
      {showMTNameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4 shadow-xl">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
              Enter a mocktest name
            </h2>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-6 focus:outline-none"
              placeholder="Enter name..."
              value={MTName}
              onChange={(e) => setMTName(e.target.value)}
            />
            <div className="flex justify-around space-x-4">
            <button
                onClick={confirmSaveMT}
                className="hover:cursor-pointer px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-[#2faa4d] transition-all font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showVA && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#0f0647] mb-4 text-center">
              All Questions
            </h2>

            <div className="max-h-[70vh] overflow-y-auto space-y-6">
              {questions.map((question, idx) => (
                <div key={idx} className="relative p-4 border rounded-lg">
                  
                  <button 
                    onClick={() => handleDeleteQuestion(idx)}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors rounded-full hover:bg-red-50"
                    aria-label="Delete question"
                  >
                    <Trash2 size={20} />
                  </button>

                  <h3 className="font-semibold text-lg mb-6 pr-10"> 
                    {idx + 1}. {question.question}
                  </h3>

                  <div className="space-y-2">
                    {question.answers.map((option, index) => (
                      <p
                        key={index}
                        className={`p-2 rounded-lg ${
                          option === question.rightAnswer ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {!showAddQuestionForm ? (
                <button
                  onClick={() => setShowAddQuestionForm(true)}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-4"
                >
                  + Add New Question
                </button>
              ) : (
                <div className="p-4 border rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-2">New Question</h3>

                  <input
                    type="text"
                    className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                    placeholder="Enter question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />

                  {newAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswerIndex === index}
                        onChange={() => setCorrectAnswerIndex(index)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder={`Answer ${index + 1}`}
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}



                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Add Question
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setshowVA(false)}
              className="w-full mt-4 py-2 bg-[#0f0647] text-white rounded-lg hover:bg-[#2c2099]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default TestMode;
