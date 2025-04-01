import React, {useState} from 'react';
import {useAppState} from '../utils/appcontext';
import { useUser } from '../authentication/UserContext';

const GenerateModal = ({setRegenerate, setisLoading, DisplayedFC, setDisplayedFC, OpenGenerateModal, setOpenGenerateModal, setSaveEnabled, setshowpastFC}) => {
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

        let pastFlashcards = "";
        if (DisplayedFC && DisplayedFC.length > 0) {
            pastFlashcards = DisplayedFC.map(flashcard => 
                `Question: ${flashcard.question}\nAnswer: ${flashcard.answer}`
            ).join('\n\n');
        }

        const payload = {
            customprompt: customprompt || "",
            scantext: appState.currentScan.value || "",
            generatemore: generatemore,
            currentflashcards: pastFlashcards,
            accuracy: accuracy
            
        };

        try {
            const response = await fetch('https://api.zukini.com/flashcards/callregenerateFlashCards', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to regenerate flashcards. Status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.text || typeof result.text !== "string") {
                throw new Error("Invalid response format from API.");
            }
            
          
            const parsedFlashcards = result.text
                .split(/\n?Question:/) 
                .filter(line => line.trim() && line.includes("Answer:")) 
                .map((line, index) => {
                const [question, answer] = line.split('Answer:');
                return {
                    id: `${index}-${Date.now()}`,
                    question: question?.trim() || "Untitled Question",
                    answer: answer?.trim() || "No Answer Provided"
                };
            });

            console.log(parsedFlashcards);
            setSaveEnabled(true);
            const flashcardStorageKey = `flashcards_${userId}_${appState.currentScan.scankey}`;
            if (generatemore) {
                // Create a new array that combines existing and new flashcards
                const combinedFlashcards = [...DisplayedFC, ...parsedFlashcards];
                setDisplayedFC(combinedFlashcards);
                // Save the combined flashcards to localStorage
                localStorage.setItem(flashcardStorageKey, JSON.stringify(combinedFlashcards));
            } else {
                setDisplayedFC(parsedFlashcards);
                localStorage.setItem(flashcardStorageKey, JSON.stringify(parsedFlashcards));
            }
            setshowpastFC(true);
        } catch (error) {
            console.error("Error generating flashcards:", error);
            alert("Failed to generate flashcards. Please try again.");
        } finally {
            setisLoading(false);
            setRegenerate(false);
        }
        

        // Check if flashcards exist for this user and scan
        
          
    };

    return (
        <>
            {OpenGenerateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
                            Generate 
                        </h2>
                        
                        <div className="flex flex-col items-center justify-center gap-4 p-4 border border-black rounded-lg shadow-sm mb-4">
                            <h2 className="text-1xl font-bold text-[#0f0647]">Custom prompt</h2>
                            <input 
                                type="text" 
                                value={customprompt}
                                onChange={(e) => setcustomprompt(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-6 focus:outline-none"
                            />

                            <h2 className="text-1xl font-bold text-[#0f0647]">Adjust Accuracy</h2>
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
                            
                            <h2 className="text-1xl font-bold text-[#0f0647]">Generation Type</h2>
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

export default GenerateModal;