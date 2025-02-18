import React, { useState, useEffect} from 'react';
import QuestionsList from './QuestionsList';
import { useUser } from '../authentication/UserContext';
import { v4 as uuidv4 } from 'uuid';

const AddMockTest = ({ filepath, scanname, text, date, onClose, onDeletePrevMT, onClosePrevMT, onAddMockTest, Past, prevMT }) => {
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
                const response = await fetch('http://18.236.227.203:5005/callparseMockTests', {
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
            const onsaveresponse = await fetch('http://18.236.227.203:5005/saveMockTest', {
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
            <div className={`fixed inset-0 bg-black/30 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 ${showModal ? "opacity-100 pointer-events-auto" : ""}`}>
                {showModal && (
                    <div className="bg-white w-full h-full overflow-y-auto rounded-2xl p-5 text-center flex flex-col touch-manipulation">
                        <p className="text-xl font-semibold mb-3">Rendered Questions:</p>
                        <QuestionsList questions={questions} />
                        <div className="mt-auto flex justify-between sticky bottom-0 p-4">
                            {Past ? (
                                <>
                                    <button 
                                        onClick={closeprevmtmodal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Done
                                    </button>
                                    <button 
                                        onClick={deletemtmodalprev}
                                        className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={closemtmodal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                    >
                                        Done
                                    </button>
                                    <button 
                                        onClick={showNameModal}
                                        className="w-[48%] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
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
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white w-1/2 rounded-2xl shadow-md p-8 text-center">
                        <h2 className="text-lg font-bold text-black mb-4">Enter Mock Test Name</h2>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                className="p-3 border-2 border-gray-300 h-10 rounded-2xl text-base text-gray-600 outline-none"
                                placeholder="Enter name..."
                                value={MTName}
                                onChange={(e) => setMTName(e.target.value)}
                            />
                            <button 
                                className="h-[50px] border-none flex px-6 py-3 bg-primary text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                                onClick={confirmNameAndSave}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
    };
    
    export default AddMockTest;