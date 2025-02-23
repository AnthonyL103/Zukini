import React, { useState, useEffect } from 'react';
import { useMT } from '../mocktests/MTcontext';
import { useScan } from '../scans/ScanContext';
import { useUser } from '../authentication/UserContext';
import PencilLoader from '../utils/pencilloader';
import PastMockTestList from '../mocktests/PastMocktestList';
import { v4 as uuidv4 } from 'uuid';

export const TestMode = () => {
  const { currentMT, setCurrentMT } = useMT();
  const { currentScan } = useScan();
  const { userId, setTotalMockTests } = useUser();
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
  
  

  useEffect(() => {
    if (currentMT) {
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
    setisLoading(true);
    setshowpastMT(false);

    const mocktestStorageKey = `mocktests_${userId}_${currentScan.scankey}`;
    const storedMockTests = localStorage.getItem(mocktestStorageKey);

    if (storedMockTests) {
      console.log("Loading mock tests from local storage for user:", userId);
      setQuestions(JSON.parse(storedMockTests));
      setSaveEnabled(false);
      return;
    }

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

  const handleSave = async () => {
   
    try {
      const key = uuidv4();
      const payload = {
        mocktestkey: key,
        filepath: currentScan.filepath,
        scanname: currentScan.scanname,
        questions: questions,
        mtsessionname: MTName,
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
        setTotalMockTests(prev => prev + 1);
        setSaveEnabled(false);
        setCurrentMT(payload);
        setMTEntry(payload);
        console.log('Mock test saved successfully');
      } else {
        console.error('Failed to save mock test');
      }
    } catch (error) {
      console.error('Error saving mock test:', error);
      alert('Failed to save mock test');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center gap-4 mt-6">
        <h2 className="text-2xl font-bold text-[#0f0647]">
          Test Name: {currentMT?.mtsessionname || "None"}
        </h2>
        
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
            
                <button
                        onClick={() => setshowVA(true)}
                        className="py-2 px-6 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90 w-32"
                    >
                        View All
                </button>
            
            
            )}
      </div>

      {questions.length > 0 ? (
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
                    ? 'bg-[#0f0647] text-white'  
                    : 'border-gray-300 '
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
            onClick={getMTName}
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
      ) : isloading ? (
        <div className="flex justify-center items-center h-64">
          <PencilLoader />
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center">
        No test selected. Please select on or upload a scan.
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
              View All Questions
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-6">
              {questions.map((question, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    {idx + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.answers.map((option, index) => (
                      <p
                        key={index}
                        className={`p-2 rounded-lg ${
                          option === question.rightAnswer ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
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
