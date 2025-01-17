import React, { useState, useEffect, use } from 'react';
const AddMockTest = ({ filepath, scanname, text, date, onClose }) => {
    const [questions, setQuestions] = useState("");
    const [showModal, setShowModal] = useState(false);
    
    useEffect(() => {
        const generateMockTestQuestions = async () => {
            try {
                const response = await fetch('http://localhost:5004/callparseMockTests', {
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
                
                // Parse the result.text into question-answer pairs
                const parsedQuestions = [];
                const lines = result.text.split('Question:').filter(line => line.trim() !== ''); // Split by "Question:"
                
                for (const line of lines) {
                    const [questionPart, answerPart] = line.split('Answer:'); // Split into question and answer
                    if (questionPart && answerPart) {
                        parsedQuestions.push({
                            id: `${parsedQuestions.length}-${Date.now()}`, // Generate a unique ID
                            question: questionPart.trim(), // Trim spaces from the question
                            answer: answerPart.trim(), // Trim spaces from the answer
                        });
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
        setQuestions("");
        onClose();
    };
    
    return (
        <>
            <div className={`fcmodal-container ${showModal ? "show" : ""}`}>
                {showModal && (
                    <div className="fcmodal-content">
                        <text>{questions}</text>
                        <div className="fcmodal-content-footer">
                            <button
                                className="fcmodal-button back"
                                onClick={closemtmodal}
                            >
                                Done
                            </button>
                            <button
                                className="fcmodal-button save"
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