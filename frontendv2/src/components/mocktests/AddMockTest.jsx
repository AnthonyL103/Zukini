import React, { useState, useEffect} from 'react';
import QuestionsList from './QuestionsList';
import { useUser } from '../authentication/UserContext';
import { v4 as uuidv4 } from 'uuid';

const AddMockTest = ({ filepath, scanname, text, date, onClose, onDeletePrevMT, onClosePrevMT, onAddMockTest, Past, prevMT, setisLoading }) => {
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showMTNameModal, setShowMTNameModal] = useState(false);
    const [MTName, setMTName] = useState("");
    const { userId } = useUser();
    
    useEffect(() => {
        if (Past) {
            setQuestions(prevMT);
            setShowModal(true);
            return;
        }
        const generateMockTestQuestions = async () => {
            try {
                const response = await fetch('https://api.zukini.com/mocktests/callparseMockTests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ scanname, text, date }),
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
                
                
                
                
                setQuestions(parsedQuestions);
                console.log("here",parsedQuestions);
                setShowModal(true);
            } catch (error) {
                console.error('Error generating mock tests:', error);
                alert('Failed to generate mock tests. Please try again.');
            }
        };
        
        generateMockTestQuestions();
    }, [Past, prevMT, scanname, text, date]);
    
    const closemtmodal = () => {
        setShowModal(false);
        setQuestions([]);
        onClose();
    };
    
    const closeprevmtmodal = () => {
        onClosePrevMT();
        //Pass flag as component to tell flashcardlist to clear its setvisible array 
        setShowModal(false);
        setQuestions([]);
      };
      
    const deletemtmodalprev = () => {
        //Pass flag as component to tell flashcardlist to clear its setvisible array 
        onDeletePrevMT(); 
        setShowModal(false);
        setQuestions([]);
      };
      
    const showNameModal = () => {
        setShowModal(false);
        setShowMTNameModal(true);
        setisLoading(false);
      }
      
    const closeNameModal = () => {
        setMTName("");
        setShowMTNameModal(false);
      }
    const confirmNameAndSave = () => {
        if (!MTName.trim()) {
          alert("Please enter a name for the flashcard set.");
          return;
        }
    
        handleSave();
        closeNameModal();
    };
      
    const handleSave = async () => {
        // Save the flashcards to the database
        try {
            const key = uuidv4();
            console.log("currkey", key);
            const payload = {
                mocktestkey: key,
                filePath: filepath,
                scanName: scanname,
                questionstext: questions,
                MTsessionname: MTName,
                currDate: date,
                userId: userId,
            }
            const onsaveresponse = await fetch('https://api.zukini.com/mocktests/saveMockTest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            if (onsaveresponse.ok) {
                console.log('Mock test saved successfully');
                if (onAddMockTest) {
                    const newEntry = {
                        mocktestkey: key,
                        filepath:filepath,
                        scanname: scanname,
                        mtsessionname: MTName,
                        questions: questions,
                        date: date,
                    }
                    onAddMockTest(newEntry);
                }

            } else {    
              console.error('Failed to save flashcards');
            }
        } catch (error) {
            console.error('Error saving flashcards:', error);
            alert('Failed to save flashcards');
        }
        closemtmodal();
    };
    
// AddMockTest.js
    return (
        <>
            <div className={`fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 
        ${showModal ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none"}`}>
                {showModal && (
                    <div className="relative bg-white w-full h-full md:w-3/5 md:max-h-[90vh] overflow-y-auto rounded-2xl p-5 text-center flex flex-col touch-manipulation z-50 shadow-lg overscroll-contain">
                        <p className="text-xl font-semibold mb-3">Rendered Questions:</p>
                        <div className="flex-1 overflow-y-auto p-4">
                        <QuestionsList questions={questions} />
                        </div>
                        <div className="mt-auto flex justify-between sticky bottom-0 p-4">
                            {Past ? (
                                <>
                                    <button 
                                        onClick={closeprevmtmodal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Done
                                    </button>
                                    <button 
                                        onClick={deletemtmodalprev}
                                        className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={closemtmodal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Done
                                    </button>
                                    <button 
                                        onClick={showNameModal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Save and Exit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showMTNameModal && (
             <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
                    <h2 className="text-xl font-semibold text-gray-900">Enter Mocktest Set Name</h2>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="Enter name..."
                            value={MTName}
                            onChange={(e) => setMTName(e.target.value)}
                        />
                        <button 
                            className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
                            onClick={confirmNameAndSave}
                        >
                            Confirm
                        </button>
                    
                </div>
            </div>
        )}
        </>
    );
    };
    
    export default AddMockTest;