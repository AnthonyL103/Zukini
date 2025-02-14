import React from 'react';
import { ReadOutlined, CopyOutlined, SwitcherOutlined } from '@ant-design/icons';

const StudyMenu = ({ onCardsClick, onTestClick, onSwitchScanClick, clickedButton }) => {
    return (
      <div className="p-2 bg-black relative flex items-center justify-around rounded-2xl shadow-lg">
        <a
          className={`inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative z-1 overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-white hover:w-[130px] hover:bg-primary-hover focus:outline-none ${clickedButton === "flashcards" ? "pointer-events-none" : ""}`}
          onClick={() => clickedButton !== "flashcards" && onCardsClick()}
        >
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <CopyOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Cards
          </span>
        </a>
        
        <a
          className={`inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative z-1 overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-white hover:w-[130px] hover:bg-primary-hover focus:outline-none ${clickedButton === "mocktests" ? "pointer-events-none" : ""}`}
          onClick={() => clickedButton !== "mocktests" && onTestClick()}
        >
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <ReadOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Test
          </span>
        </a>
  
        <a className="inline-flex justify-center items-center w-[70px] h-[50px] rounded-2xl relative z-1 overflow-hidden transform origin-left transition-[width] duration-200 ease-in text-white hover:w-[130px] hover:bg-primary-hover focus:outline-none" 
           onClick={onSwitchScanClick}
        >
          <span className="w-7 h-7 block flex-shrink-0 left-[18px] relative">
            <SwitcherOutlined />
          </span>
          <span className="translate-x-full transition-transform duration-200 origin-right block text-center indent-7 w-full group-hover:translate-x-0">
            Switch
          </span>
        </a>
      </div>
    );
};

export default StudyMenu;