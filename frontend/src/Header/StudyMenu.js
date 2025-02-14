import React from 'react';
import { ReadOutlined, CopyOutlined, SwitcherOutlined } from '@ant-design/icons';
const StudyMenu = ({ onCardsClick, onTestClick, onSwitchScanClick, clickedButton, isLoading }) => {
    return (
      <div className="studynavbar">
        <div className="linkholder"> 
            <a
            className={`studylink ${clickedButton === "flashcards" ? "disabled" : ""}`}
            onClick={() => clickedButton !== "flashcards" && onCardsClick()}
            >
            <span className="studylink-icon">
                <CopyOutlined />
            </span>
            <span className="studylink-title">Cards</span>
            </a>
       
            {isLoading && clickedButton === "flashcards" && (
            <svg className="loading-svg" viewBox="25 25 50 50">
            <circle className="loadingcircle" cx="50" cy="50" r="20"></circle>
          </svg>
          )}
          
        </div>
        
        <div className="linkholder"> 
        <a
          className={`studylink ${clickedButton === "mocktests" ? "disabled" : ""}`}
          onClick={() => clickedButton !== "mocktests" && onTestClick()}
        >
          <span className="studylink-icon">
            <ReadOutlined />
          </span>
          <span className="studylink-title">Test</span>
        </a>
        {isLoading && clickedButton === "mocktests" && (
            <svg className="loading-svg" viewBox="25 25 50 50">
            <circle className="loadingcircle" cx="50" cy="50" r="20"></circle>
          </svg>
          )}
        </div>
        
        <div className="linkholder"> 
        <a className="studylink" onClick={onSwitchScanClick}>
          <span className="studylink-icon">
            <SwitcherOutlined />
          </span>
          <span className="studylink-title">Switch</span>
        </a>
        </div>
    
      </div>
    );
  };
  

export default StudyMenu;
