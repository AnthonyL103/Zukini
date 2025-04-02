import React, {useState} from 'react';
import {useAppState} from '../utils/appcontext';
import { useUser } from '../authentication/UserContext';

const GenerateModalMT = ({setRegenerate, setisLoading, questions, setQuestions, OpenGenerateModal, setOpenGenerateModal, setSaveEnabled, setshowpastMT}) => {
    const appState = useAppState();
    const { userId} = useUser();
    const [accuracy, setaccurracy] = useState(50);
    const [generatemore, setgeneratemore] = useState(false);
    const [customprompt, setcustomprompt] = useState("");
    

    const submitGenerate = async () => {
        setOpenGenerateModal(false);
        setRegenerate(true);
        setisLoading(true);

        if (!appState.currentScan) {
            console.error("No scan selected.");
            return;
        }

        let pastQuestions = "";
        if (questions && questions.length > 0) {
            pastQuestions = questions.map(question => 
                `Number: ${question.number}\nQuestion: ${question.question}\nAnswers: ${
                    question.answers.map(answer => `${answer}`)
                }\nRight Answer: ${question.rightAnswer}`
            ).join('\n\n');
        }


        const payload = {
            customprompt: customprompt || "",
            scantext: appState.currentScan.value || "",
            generatemore: generatemore,
            currentquestions: pastQuestions,
            accuracy: accuracy
            
        };

        try {
            const response = await fetch('https://api.zukini.com/mocktests/callregenerateMocktests', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to regenerate mocktest. Status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.text || typeof result.text !== "string") {
                throw new Error("Invalid response format from API.");
            }
            
          
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
            const mocktestStorageKey = `mocktests_${userId}_${appState.currentScan.scankey}`;
            if (generatemore) {
                const combinedQuestions = [...questions, ...parsedQuestions];
                setQuestions(combinedQuestions);
                localStorage.setItem(mocktestStorageKey, JSON.stringify(combinedQuestions));
            } else {
                setQuestions(parsedQuestions);
                localStorage.setItem(mocktestStorageKey, JSON.stringify(parsedQuestions));
            }
            setshowpastMT(true);
        } catch (error) {
            console.error("Error generating mocktest:", error);
            alert("Failed to generate mocktest. Please try again.");
        } finally {
            setisLoading(false);
            setRegenerate(false);
        }
        

        
          
    };

    return (
        <>
            {OpenGenerateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
                            Generate 
                        </h2>
                        <div
                            className="bg-gradient-to-r from-[#0f0647] to-[#67d7cc] p-1 rounded-xl mb-6 cursor-pointer">
                        <div className="bg-white p-6 rounded-xl flex flex-col gap-4 justify-center items-center">
                            <h2 className="text-1xl font-bold text-[#0f0647]">Custom prompt:</h2>
                            <input 
                                type="text" 
                                value={customprompt}
                                onChange={(e) => setcustomprompt(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-6 focus:outline-none"
                            />

                            <h2 className="text-1xl font-bold text-[#0f0647]">Adjust Accuracy:</h2>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={accuracy}
                                onChange={(e) => setaccurracy(e.target.value)}
                                className="w-full h-1 bg-gray-300 rounded appearance-none opacity-70 transition-opacity duration-200 focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-300 [&::-webkit-slider-thumb:hover]:shadow-[0_0_0_8px_rgba(0,0,0,0.16)]" 
                                id="myRange" 
                            />
                            <p className="font-semibold">{accuracy} %</p>
                            
                            <h2 className="text-1xl font-bold text-[#0f0647]">Generation Type:</h2>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => setgeneratemore(false)}
                                    className={`px-4 py-2 rounded-lg ${!generatemore 
                                        ? "bg-[#0f0647] text-white" 
                                        : "bg-gray-200 text-gray-700"}`}
                                >
                                    Generate New
                                </button>
                                <button 
                                    onClick={() => setgeneratemore(true)}
                                    className={`px-4 py-2 rounded-lg ${generatemore 
                                        ? "bg-[#0f0647] text-white" 
                                        : "bg-gray-200 text-gray-700"}`}
                                >
                                    Generate More
                                </button>
                            </div>
                        </div>
                        </div>

                        <div className="flex justify-between gap-4 mb-6">
                            <button
                                onClick={() => setOpenGenerateModal(false)}
                                className="flex-1 py-2 bg-[#0f0647] hover:bg-[#2c2099] text-white rounded-lg hover:bg-opacity-90"
                            >
                                Close
                            </button>
                            <button
                                onClick={submitGenerate}
                                className="flex-1 py-2 bg-[#67d7cc] hover:bg-[#5bc2b8] text-white rounded-lg hover:bg-opacity-90"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateModalMT;