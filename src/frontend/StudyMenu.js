import React from 'react';
import { ReadOutlined, CopyOutlined, SwitcherOutlined } from '@ant-design/icons';
const StudyMenu = ({onCardsClick, onTestClick, onSwitchScanClick}) => {
    
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
      <a className="link" onClick={onSwitchScanClick}>
        <span className="link-icon">
        <SwitcherOutlined />
        </span>
        <span className="link-title">Switch</span>
      </a>
    </div>
  );
};

export default StudyMenu;
