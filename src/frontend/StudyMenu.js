import React from 'react';
import { ReadOutlined, CopyOutlined } from '@ant-design/icons';
const StudyMenu = () => {
  return (
    <div className="studymenu">
      <a className="link">
        <span className="link-icon">
        <CopyOutlined />
        </span>
        <span className="link-title">Cards</span>
      </a>
      <a className="link">
        <span className="link-icon">
        <ReadOutlined />
        </span>
        <span className="link-title">Test</span>
      </a>
    </div>
  );
};

export default StudyMenu;
