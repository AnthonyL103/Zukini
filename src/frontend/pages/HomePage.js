import SocialMediaLinks from '../socialmenu';
import Authentication from '../Authentication';

const Home = () => {
    return (
        <div className="container">
            <div className="header-wrapper">
                <h1>Welcome to the Home Page!</h1>
                <Authentication/>
            </div>

            <h2><strong>About:</strong></h2>
            <p>
                Hi, my name is Anthony! Thank you for visiting and choosing Notelet. 
                I’m a Computer Science major at Oregon State University, and I’m thrilled to introduce Notelet—a platform 
                designed to make studying easier and more efficient for students like you.
            </p>
            <p>
                Notelet is built with a vision to help students organize and study smarter by transforming scanned notes 
                into interactive flashcards and study tools. It’s a project I’m passionate about, combining my love for 
                technology and problem-solving to create something meaningful.
            </p>
            <p>
                Currently, I’m putting the finishing touches on some backend features to ensure Notelet is the best it 
                can be before its public release. I can’t wait to share it with you soon!
            </p>
            <p>Thank you for supporting Notelet, and I hope it becomes a tool that helps you excel in your studies.</p>
            
            <h2><strong>Quickstart Tutorial:</strong></h2>
            <p>Welcome to Notelet! Getting started is quick and easy. Follow these steps to make the most of your experience:</p>

            <p>
                <strong>1. Upload Your File:</strong><br />
                Navigate to the Files page and click on the blue upload square. Select a file to upload—this could be 
                anything from a screenshot of your professor's lecture notes or study guide to a picture of your 
                handwritten notes.
            </p>

            <p>
                <strong>2. Extract Text:</strong><br />
                After uploading your file, a pop-up will display the extracted text from your upload. You’ll have the 
                option to re-scan if needed or save the text for later use.
            </p>

            <p>
                <strong>3. View Saved Notes:</strong><br />
                Once saved, your file and the parsed text will appear in a yellow box on the Files page. 
                Now you're ready to start studying! (still in development)
            </p>

            <p>
                <strong>4. Start Studying:</strong><br />
                Click the "Study" button to navigate to the Study page. Here, you’ll have two options: generate 
                flashcards or create a mock test. After selecting your preferred option, give it a moment, and your 
                flashcards or mock test will be displayed on the screen.
            </p>

            <p>
                <strong>5. Save Your Progress:</strong><br />
                If you’re done studying but want to revisit your content later, be sure to press "Save." Your study 
                session will be stored at the bottom of the Study p age, where you can click it anytime to pick up where 
                you left off.
            </p>

            <p><strong>Happy studying!</strong></p>
            
            <SocialMediaLinks />
        </div>
    );
};

export default Home;
