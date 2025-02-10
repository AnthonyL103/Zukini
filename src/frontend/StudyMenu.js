import React from 'react';
import { ReadOutlined, CopyOutlined, SwitcherOutlined } from '@ant-design/icons';
const StudyMenu = ({ onCardsClick, onTestClick, onSwitchScanClick, clickedButton }) => {
    return (
      <div className="studynavbar">
        <a
          className={`studylink ${clickedButton === "flashcards" ? "disabled" : ""}`}
          onClick={() => clickedButton !== "flashcards" && onCardsClick()}
        >
          <span className="studylink-icon">
            <CopyOutlined />
          </span>
          <span className="studylink-title">Cards</span>
        </a>
        
        <a
          className={`studylink ${clickedButton === "mocktests" ? "disabled" : ""}`}
          onClick={() => clickedButton !== "mocktests" && onTestClick()}
        >
          <span className="studylink-icon">
            <ReadOutlined />
          </span>
          <span className="studylink-title">Test</span>
        </a>
  
        <a className="studylink" onClick={onSwitchScanClick}>
          <span className="studylink-icon">
            <SwitcherOutlined />
          </span>
          <span className="studylink-title">Switch</span>
        </a>
      </div>
    );
  };
  

export default StudyMenu;
