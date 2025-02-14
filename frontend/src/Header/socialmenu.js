import React from 'react';
import { InstagramOutlined, GithubOutlined, LinkedinOutlined, MailOutlined } from '@ant-design/icons';

const SocialMediaLinks = () => {
  return (
    <div className="socialcard">
      <a href="https://www.instagram.com/anthony___li/" className="socialContainer containerOne">
        <InstagramOutlined className="socialIcon" style={{ fontSize: '24px', color: '#E1306C' }} />
      </a>

      <a href="https://github.com/AnthonyL103" className="socialContainer containerTwo">
        <GithubOutlined className="socialIcon" style={{ fontSize: '24px', color: '#1DA1F2' }} />
      </a>

      <a href="https://www.linkedin.com/in/anthony-l103/" className="socialContainer containerThree">
        <LinkedinOutlined className="socialIcon" style={{ fontSize: '24px', color: '#0077B5' }} />
      </a>

      <a href="mailto:anthonyli0330@gmail.com" className="socialContainer containerFour">
        <MailOutlined className="socialIcon" style={{ fontSize: '24px', color: '#25D366' }} />
      </a>
    </div>
  );
};

export default SocialMediaLinks;
