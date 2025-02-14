import SocialMediaLinks from '../socialmenu';
import { useRef } from "react";
import { useNavigate} from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const slidesRef = useRef([]);

    const scrollToNextSlide = () => {
        const currentSlideIndex = slidesRef.current.findIndex(slide =>
            slide.getBoundingClientRect().top >= 0
        );

        if (currentSlideIndex !== -1 && currentSlideIndex < slidesRef.current.length - 1) {
            slidesRef.current[currentSlideIndex + 1].scrollIntoView({
                behavior: "smooth",
                block: "start", // Ensures it aligns prouiperly with snap
                inline: "nearest",
            });
        }
    };
    const scrollToTop = () => {
        slidesRef.current[0].scrollIntoView({
            behavior: "smooth",
            block: "start", // Ensures it aligns properly with snap
            inline: "nearest",
        });
    };

    return (
        <div className="homecontainer">
            <div ref={(el) => slidesRef.current[0] = el} className="slide homepagecont1">
            <p className="homepagecont-title">Welcome to Zukini</p>
            <p className="homepagecont-body">
                    Zukini is built with a vision to help students organize and study smarter by transforming scanned notes
                    into interactive flashcards, mock tests, and more (coming soon).
                </p>
                <p className="homepagecont-body">
                    Thank you for supporting Zukini, and I hope it becomes a tool that helps you excel in your studies.
                </p>
         
                <div className= "homepagebuttonwrap"> </div>
                <div className="gobackwrap">
                <button className="nav-button" onClick={() => navigate('/files')}>Get Started</button>
                <button className="scrollbutton" onClick={scrollToNextSlide}>
                <svg className="svgIconreverse" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
                </button>
                </div>
            </div>
            
            <div ref={(el) => slidesRef.current[1] = el} className="slide homepagecont1">
            <p className="homepagecont-title">Quickstart:</p>

                <p className="homepagecont-body">
                    <strong>1. Upload Your Notes:</strong><br />
                    Navigate to the Files page and click the "Upload and Scan" button. Select a file from your device, and our system
                    will begin processing your notes.
                </p>

                <p className="homepagecont-body">
                    <strong>2. Extract Text:</strong><br />
                    After uploading your file, a pop-up will display the extracted text from your upload in the files page. 
                </p>
                <p className="homepagecont-body">
                    <strong>3. Start Studying:</strong><br />
                    Click the "Study" button to navigate to the Study page. Here, you can generate
                    flashcards or create a mock test. After selecting your preferred option, your
                    content will be displayed on the screen.
                </p>
                
               
                <div className="gobackwrap" >
                <button className="nav-button" onClick={() => navigate('/account')}>Login</button>
                <button className="scrollbutton" onClick={scrollToNextSlide}>
                <svg className="svgIconreverse" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
                </button>
                </div>
                
            </div>
            
            <div ref={(el) => slidesRef.current[2] = el} className="slide homepagecont1">
            <p className="homepagecont-title">To Save your Notes:</p>
            
            
                <p className="homepagecont-body">
                    <strong>4. Create an Account:</strong><br />
                    Go to the Account page and click the Sign-up button in the top right corner of the screen and enter your email and password of choice.
                </p>

                <p className="homepagecont-body">
                    <strong>5. To Save Your Content:</strong><br />
                    If you’re done studying but want to revisit your content later, be sure to press "Save." You will then be
                    prompted to enter a name for your content. Once you click "Done," your content will be stored at the bottom of the Study page, where you can revisit it
                    anytime.
                </p>
                
                <p className="homepagecont-body">
                    <strong>6. To View Saved Notes:</strong><br />
                    Once you have created an account, log in and you will be able to view all your content that you have saved!
                </p>
              
                
                <div className="gobackwrap1">
                <button className="scrollbutton" onClick={scrollToNextSlide}>
                <svg className="svgIconreverse" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
                </button>
                </div>
               
            </div>   
            
            <div ref={(el) => slidesRef.current[3] = el} className="slide homepagecont1">
            <p className="homepagecont-title">Creator:</p>
            <p className= "homepagecont-body">
                Hi, my name is Anthony! I'm the creator of Zukini and a Computer Science major at Oregon State University. 
                I built this tool after realizing that my friends and I would spend time taking notes, only to rarely use 
                them for studying—making the effort feel like a waste. My background includes experience in full-stack 
                development, AI applications, and software engineering, with a strong focus on machine learning, 
                algorithms, and backend development. You can find all of my social links below!
                </p>
                <SocialMediaLinks />
                <div className="gobackwrap1">
                <button className="gobackbutton" onClick={scrollToTop}>
                <svg className="svgIcon" viewBox="0 0 384 512">
                    <path
                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                    ></path>
                </svg>
                </button>
                </div>
            </div>
            
            
        </div>
    );
};

export default Home;

