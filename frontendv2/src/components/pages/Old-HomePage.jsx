import SocialMediaLinks from '../Header/socialmenu';
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
                block: "start", 
                inline: "nearest",
            });
        }
    };
    const scrollToTop = () => {
        slidesRef.current[0].scrollIntoView({
            behavior: "smooth",
            block: "start", 
            inline: "nearest",
        });
    };

    return (
        <div className="max-w-[1200px] h-[80dvh] md:h-[75dvh] p-6 mt-[1vh] mx-auto overflow-y-auto snap-y snap-mandatory">
            <div ref={(el) => slidesRef.current[0] = el} className="relative h-full flex flex-col p-5 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                <p className="text-white text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Welcome to Zukini</p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5">
                    Zukini is built with a vision to help students organize and study smarter by transforming scanned notes
                    into interactive flashcards, mock tests, and more (coming soon).
                </p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5">
                    Thank you for supporting Zukini, and I hope it becomes a tool that helps you excel in your studies.
                </p>
         
                <div className="flex justify-between items-center w-full mt-auto">
                    <button className="w-1/3 h-[10dvh] bg-black text-white font-bold uppercase rounded-xl transition-all duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2" 
                        onClick={() => navigate('/files')}>
                        Get Started
                    </button>
                    <button className="w-[10vw] h-[10vw] max-w-[70px] max-h-[70px] flex items-center justify-center bg-black text-white rounded-full transition-all duration-300 hover:max-w-[150px] hover:rounded-xl hover:bg-purple-300"
                        onClick={scrollToNextSlide}>
                        <svg className="w-4 transition-transform duration-300 rotate-180" viewBox="0 0 384 512">
                            <path fill="white" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={(el) => slidesRef.current[1] = el} className="relative h-full flex flex-col p-5 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                <p className="text-white text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Quickstart:</p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5"><strong>1. Upload Your Notes:</strong> Navigate to the Files page and click "Upload and Scan".</p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5"><strong>2. Extract Text:</strong> A pop-up will display the extracted text from your upload.</p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5"><strong>3. Start Studying:</strong> Click "Study" to generate flashcards or mock tests.</p>

                <div className="flex justify-between items-center w-full mt-auto">
                    <button className="w-1/3 h-[10dvh] bg-black text-white font-bold uppercase rounded-xl transition-all duration-300 hover:bg-purple-300 hover:text-black active:translate-y-2"
                        onClick={() => navigate('/account')}>
                        Login
                    </button>
                    <button className="w-[10vw] h-[10vw] max-w-[70px] max-h-[70px] flex items-center justify-center bg-black text-white rounded-full transition-all duration-300 hover:max-w-[150px] hover:rounded-xl hover:bg-purple-300"
                        onClick={scrollToNextSlide}>
                        <svg className="w-4 transition-transform duration-300 rotate-180" viewBox="0 0 384 512">
                            <path fill="white" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={(el) => slidesRef.current[3] = el} className="relative h-full flex flex-col p-5 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                <p className="text-white text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Creator:</p>
                <p className="text-white text-[clamp(1rem,2vw,2rem)] mt-5">
                    Hi, my name is Anthony! I'm the creator of Zukini and a Computer Science major at Oregon State University. 
                    I built this tool after realizing that my friends and I would take notes but rarely use them for studying. 
                    My background includes full-stack development, AI applications, and software engineering.
                </p>
                <SocialMediaLinks />

                <div className="flex justify-center w-full mt-auto">
                    <button className="w-[10vw] h-[10vw] max-w-[70px] max-h-[70px] flex items-center justify-center bg-black text-white rounded-full transition-all duration-300 hover:max-w-[150px] hover:rounded-xl hover:bg-purple-300"
                        onClick={scrollToTop}>
                        <svg className="w-4 transition-transform duration-300" viewBox="0 0 384 512">
                            <path fill="white" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
