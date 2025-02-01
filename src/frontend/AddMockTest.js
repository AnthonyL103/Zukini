import React, { useState, useEffect} from 'react';
import QuestionsList from './QuestionsList';
import { v4 as uuidv4 } from 'uuid';

const AddMockTest = ({ filepath, scanname, text, date, onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    useEffect(() => {
        const generateMockTestQuestions = async () => {
            try {
                const response = await fetch('http://35.87.31.240:5005/callparseMockTests', {
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
    }, [scanname, text, date]);
    
    const closemtmodal = () => {
        setShowModal(false);
        setQuestions([]);
        onClose();
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
                currDate: date,
            }
            const onsaveresponse = await fetch('http://35.87.31.240:5005/saveMockTest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            if (onsaveresponse.ok) {
              console.log('Mocktests Saved successfully');
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
                        <QuestionsList
                            questions={questions}
                        />
                        <div className="fcmodal-content-footer">
                            <button
                                className="fcmodal-button back"
                                onClick={closemtmodal}
                            >
                                Done
                            </button>
                            <button
                                className="fcmodal-button save"
                                onClick={handleSave}
                            >
                                Save and Exit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
    };
    
    export default AddMockTest;