import React, { useState, useEffect} from 'react';
import QuestionsList from './QuestionsList';
import { useUser } from './UserContext';
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
    
    return (
        <>
    <div className={`fcmodal-container ${showModal ? "show" : ""}`}>
        {showModal && (
            <div className="fcmodal-content">
                <p className="modal-title">Rendered Questions:</p>
                <QuestionsList questions={questions} />
                <div className="fcmodal-content-footer">
                    {Past ? (
                        <>
                            <button className="deleteWarn-buttoncancel" onClick={closeprevmtmodal}>
                                Done
                            </button>
                            <button className="deleteWarn-button" onClick={deletemtmodalprev}>
                                Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="deleteWarn-buttoncancel" onClick={closemtmodal}>
                                Done
                            </button>
                            <button className="deleteWarn-buttoncancel" onClick={showNameModal}>
                                Save and Exit
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>

        {/* Move this outside */}
        {showMTNameModal && (
            <div className="EnterName-container show">
                <div className="EnterName-modal">
                    <h2 className="EnterName-heading">Enter Mocktest Name</h2>
                    <div className="EnterNamebutton-wrapper">
                    <input
                        type="text"
                        className="nameinput"
                        placeholder="Enter name..."
                        value={MTName}
                        onChange={(e) => setMTName(e.target.value)}
                    />
                    
                        <button className="EnterName-button" onClick={confirmNameAndSave}>
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