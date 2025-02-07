import SocialMediaLinks from '../socialmenu';
import Authentication from '../Authentication';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="container">
            <div className="header-wrapper">
                <h1>Welcome to Zukini!</h1>
                <Authentication/>
            </div>

            
            
            <div className= "About"> 
            <h2><strong>About:</strong></h2>
            <p>
                Zukini is built with a vision to help students organize and study smarter by transforming scanned notes 
                into interactive flashcards, mocktests, and more (coming soon). 
            </p>
            <p>Thank you for supporting Zukini, and I hope it becomes a tool that helps you excel in your studies.</p>
            
            
            
            <h2><strong>Quickstart Tutorial:</strong></h2>
            
            <p>
                <strong>1. Create an Account (important if you want to save your content):</strong><br />
                Click the Sign-up button in the top right corner of the screen, and enter your email and password of choice.
            </p>

            <p>
                <strong>2. Upload Your File:</strong><br />
                Navigate to the Files page and click on the blue upload square. Select a file to upload—this could be 
                anything from a screenshot of your professor's lecture notes or study guide to a picture of your 
                handwritten notes.
            </p>

            <p>
                <strong>3. Extract Text:</strong><br />
                After uploading your file, a pop-up will display the extracted text from your upload. You’ll have the 
                option to re-scan if needed or save the text for later use.
            </p>

            <p>
                <strong>4. View Saved Notes:</strong><br />
                Once saved, your file and the parsed text will appear in a yellow box on the Files page. 
                Now you're ready to start studying! 
            </p>

            <p>
                <strong>5. Start Studying:</strong><br />
                Click the "Study" button to navigate to the Study page. Here, you’ll have two options: generate 
                flashcards or create a mock test. After selecting your preferred option, give it a moment, and your 
                flashcards or mock test will be displayed on the screen.
            </p>

            <p>
                <strong>6. Save Your Progress:</strong><br />
                If you’re done studying but want to revisit your content later, be sure to press "Save." You will then be 
                prompted to enter a name for your content. Once you click done your content will be stored at the bottom of the Study page, where you can revisit it 
                anytime. 
            </p>
            
            <button className="goback-button" onClick={() => navigate('/files')}>Get Started</button>
            
            <h2><strong>Creator Info:</strong></h2>
            <p> Hi, my name is Anthony! I'm the creator of Zukini and a Computer Science major at Oregon State University. I built this tool after realizing that my friends and 
                I would spend time taking notes, only to rarely use them for studying— making the effort feel like a waste. My background includes experience in full-stack development, AI applications, and software engineering, 
                with a strong focus on machine learning, algorithms, and backend development. You can find all of my social links below!
            </p>
            </div>
            
            <SocialMediaLinks />
        </div>
    );
};

export default Home;
