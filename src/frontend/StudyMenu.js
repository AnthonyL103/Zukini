import React from 'react';
import { ReadOutlined, CopyOutlined } from '@ant-design/icons';
const StudyMenu = ({onCardsClick, onTestClick}) => {
    
  return (
    <div className="studynavbar">
      <a className="link" onClick={onCardsClick}>
        <span className="link-icon">
        <CopyOutlined />
        </span>
        <span className="link-title">Cards</span>
      </a>
      <a className="link" onClick={onTestClick}>
        <span className="link-icon">
        <ReadOutlined />
        </span>
        <span className="link-title">Test</span>
      </a>
    </div>
  );
};

export default StudyMenu;
