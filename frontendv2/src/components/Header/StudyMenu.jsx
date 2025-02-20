import React from 'react';
import { ReadOutlined, CopyOutlined, SwitcherOutlined } from '@ant-design/icons';

const StudyMenu = ({ onCardsClick, onTestClick, onSwitchScanClick, clickedButton, isLoading }) => {
    return (
        <div className="bg-gray-300 max-w-[1200px] mx-auto p-4 rounded-2xl shadow-md">
            <div className="flex justify-around bg-teal-400 p-3 rounded-xl">
                
                {/* Flashcards Button */}
                <div className="relative flex flex-col items-center">
                    <a
                        className={`flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl transition-all duration-300 hover:bg-gray-700 ${
                            clickedButton === "flashcards" ? "opacity-50 pointer-events-none" : ""
                        }`}
                        onClick={() => clickedButton !== "flashcards" && onCardsClick()}
                    >
                        <CopyOutlined />
                        <span>Cards</span>
                    </a>
                    {isLoading && clickedButton === "flashcards" && (
                        <svg className="absolute bottom-[-1.5rem] w-6 h-6 animate-spin" viewBox="25 25 50 50">
                            <circle
                                className="stroke-white stroke-[2] fill-none stroke-dasharray-[1,200] stroke-dashoffset-0 stroke-linecap-round animate-dash4"
                                cx="50"
                                cy="50"
                                r="20"
                            ></circle>
                        </svg>
                    )}
                </div>

                {/* Mock Test Button */}
                <div className="relative flex flex-col items-center">
                    <a
                        className={`flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl transition-all duration-300 hover:bg-gray-700 ${
                            clickedButton === "mocktests" ? "opacity-50 pointer-events-none" : ""
                        }`}
                        onClick={() => clickedButton !== "mocktests" && onTestClick()}
                    >
                        <ReadOutlined />
                        <span>Test</span>
                    </a>
                    {isLoading && clickedButton === "mocktests" && (
                        <svg className="absolute bottom-[-1.5rem] w-6 h-6 animate-spin" viewBox="25 25 50 50">
                            <circle
                                className="stroke-white stroke-[2] fill-none stroke-dasharray-[1,200] stroke-dashoffset-0 stroke-linecap-round animate-dash4"
                                cx="50"
                                cy="50"
                                r="20"
                            ></circle>
                        </svg>
                    )}
                </div>

                {/* Switch Scan Button */}
                <div className="flex flex-col items-center">
                    <a
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl transition-all duration-300 hover:bg-gray-700"
                        onClick={onSwitchScanClick}
                    >
                        <SwitcherOutlined />
                        <span>Switch</span>
                    </a>
                </div>

            </div>

            {/* Tailwind Keyframes for Animation */}
            <style>
                {`
                    @keyframes rotate4 {
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes dash4 {
                        0% {
                            stroke-dasharray: 1, 200;
                            stroke-dashoffset: 0;
                        }
                        50% {
                            stroke-dasharray: 90, 200;
                            stroke-dashoffset: -35px;
                        }
                        100% {
                            stroke-dashoffset: -125px;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default StudyMenu;
