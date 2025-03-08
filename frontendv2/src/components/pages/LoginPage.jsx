import { useState, useEffect, useRef } from "react";
import { useUser } from '../authentication/UserContext';
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import * as THREE from 'three';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setUserId, setEmail, setName, userId, name, email, setisforgot } = useUser();
    const [useremail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [countdown, setCountdown] = useState(300);
    const [timerActive, setTimerActive] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // Create scene, camera, and renderer
        const scene = new THREE.Scene();
        
        const camera = new THREE.OrthographicCamera(
          window.innerWidth / -2,
          window.innerWidth / 2, 
          window.innerHeight / 2,
          window.innerHeight / -2,
          1,
          1000
        );
        
        // Make sure canvas is available before creating renderer
        if (!canvasRef.current) return;
        
        const renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current,
          alpha: true,
          antialias: true 
        });
        
        // Set initial size
        updateCanvasSize(renderer, camera);
        
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.rotation.z = Math.PI;
    
        const size = Math.max(window.innerWidth, window.innerHeight) * 4;
        const divisions = Math.floor(size / 50);
        const gridHelper = new THREE.GridHelper(size, divisions, 0x67d7cc, 0x67d7cc);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
    
        const animate = () => {
          requestAnimationFrame(animate);
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();
    
        // Function to handle resize with proper viewport calculations
        function updateCanvasSize(renderer, camera) {
          if (!canvasRef.current || !containerRef.current) return;
          
          // Use clientWidth and clientHeight for more reliable dimensions
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          // Ensure the canvas fills the viewport
          canvasRef.current.style.width = '100vw';
          canvasRef.current.style.height = '100vh';
          canvasRef.current.style.position = 'fixed';
          canvasRef.current.style.top = '0';
          canvasRef.current.style.left = '0';
          
          // Update camera frustum
          camera.left = width / -2;
          camera.right = width / 2;
          camera.top = height / 2;
          camera.bottom = height / -2;
          camera.updateProjectionMatrix();
          
          // Resize renderer
          renderer.setSize(width, height, false); // false to avoid setting canvas style
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        
        const handleResize = () => {
          updateCanvasSize(renderer, camera);
          
          const newSize = Math.max(window.innerWidth, window.innerHeight) * 4;
          const scale = newSize / size;
          gridHelper.scale.set(scale, scale, scale);
        };
    
        // Add resize event listener
        window.addEventListener('resize', handleResize);
        
        // Also handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
          // Small delay to ensure dimensions are updated after orientation change
          setTimeout(handleResize, 100);
        });
    
        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('orientationchange', handleResize);
          if (scene && gridHelper) scene.remove(gridHelper);
          if (renderer) renderer.dispose();
          if (gridHelper && gridHelper.material) gridHelper.material.dispose();
        };
      }, []);

    useEffect(() => {
        if (timerActive && countdown > 0) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [countdown, timerActive]);

    const handleLoggedIn = async (e) => {
        e.preventDefault();
        console.log("handleLoggedIn is being called");
    
        try {
            console.log("Sending request to API...");
            const response = await fetch("https://api.zukini.com/account/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: useremail,
                    password: password,
                }),
            });
    
            const data = await response.json();
            console.log("API Response:", data);
    
            if (data.success) {
                setUserId(data.userId);
                setEmail(data.email);
                setName(data.name);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("email", data.email);
                localStorage.setItem("name", data.name);
                console.log("stats,",userId, email, name);
                setErrorMessage("");
                setUserEmail("");
                setPassword("");
                navigate("/dashboard");
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setErrorMessage("Login failed. Please try again.");
        }
    };
    
    const handleLoginForgot = async (email) => {
        setErrorMessage("");
    
        try {
            const response = await fetch("https://api.zukini.com/account/loginforgotpass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                console.log("Login successful via forgot password:", data);
                setUserId(data.userId);
                setEmail(data.email);
                setName(data.name);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("email", data.email);
                localStorage.setItem("name", data.name);
                
                setErrorMessage("");
                setUserEmail("");
                setVerificationCode("");
                setCountdown(300);
                setTimerActive(false);
                setisforgot(true);
                navigate("/account");
                    
                alert("Login successful!");
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error logging in via forgot password:", error);
            setErrorMessage("Login failed. Please try again.");
        }
    };
    
    const handleSendCode = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!useremail) {
            setErrorMessage("Please enter your email.");
            return;
        }

        try {
            const response = await fetch("https://api.zukini.com/account/sendCode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: useremail }),
            });

            const data = await response.json();

            if (data.success) {
                setIsCodeSent(true);
                setCountdown(300);
                setTimerActive(true);
                setErrorMessage(""); // Clear error message if successful
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error sending code:", error);
            setErrorMessage("Failed to send code. Try again.");
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!verificationCode) {
            setErrorMessage("Please enter the verification code.");
            return;
        }

        try {
            const response = await fetch("https://api.zukini.com/account/verifyCode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: useremail, code: verificationCode }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Code verified successfully! Proceed to reset your password.");
                await handleLoginForgot(useremail);
            } else {
                setErrorMessage("Invalid or expired code.");
            }
        } catch (error) {
            console.error("Error verifying code:", error);
            setErrorMessage("Failed to verify code.");
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    return (
        <div ref={containerRef} className="min-h-screen w-full relative">
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full"
                style={{ 
                    background: 'linear-gradient(to bottom, #0f0647, #67d7cc)',
                    zIndex: 0,
                    display: 'block'
                }}
            />
            
            <motion.div 
                className="relative z-10 min-h-screen flex justify-center px-4 items-start sm:items-start md:items-center lg:items-center"
                style={ {paddingTop: '2dvh' }}           
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                    duration: 0.25, 
                    ease: "easeInOut"
                }}
>
                <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {!showForgotPassword ? (
                            <motion.form 
                                key="login"
                                className="space-y-6" 
                                onSubmit={async (e) => await handleLoggedIn(e)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >

                                <div className="text-center pb-4">
                                    <Link to="/" className={`text-5xl font-bold`}>
                                        Zukini
                                    </Link>
                                </div>

                                <h2 className="text-2xl font-semibold text-center text-gray-900">
                                    Sign in to your account
                                </h2>

                                <div className="space-y-4">
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        required
                                        value={useremail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    />

                                    <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-10"
                                    />
                                     <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    </div>
                                </div>
                                
                                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                                <div className="flex justify-between text-sm text-indigo-500">
                                    <button 
                                        type="button" 
                                        className="hover:underline hover:cursor-pointer"
                                        onClick={() => setShowForgotPassword(true)}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <div className="flex justify-between">
                                    <button 
                                        className="w-full hover:cursor-pointer bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                        type="submit"
                                    >
                                        Login
                                    </button>
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                    <Link
                                        to="/"
                                        className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 duration-250 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        Go Home
                                    </Link>

                                    <Link
                                        to="/signup"
                                        className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 duration-250 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        Sign up here!
                                    </Link>
                                </div>

                            </motion.form>
                        ) : (
                            <motion.form 
                            key="forgot"
                            className="space-y-6" 
                            onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            >       

                                <h2 className="text-2xl font-semibold text-center text-gray-900">
                                    {isCodeSent ? "Enter Code" : "Enter Account Email"}
                                </h2>

                                <div className="space-y-4">
                                    {!isCodeSent ? (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="Enter email"
                                                required
                                                value={useremail}
                                                onChange={(e) => setUserEmail(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            />
                                            <button 
                                                className="w-full hover:cursor-pointer bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                                type="submit"
                                            >
                                                Send Code
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="Enter verification code"
                                                required
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                            />
                                            <p className="text-gray-500 text-sm">Code expires in: {formatTime(countdown)}</p>
                                            <button 
                                                className="w-full hover:cursor-pointer bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                                type="submit"
                                            >
                                                Verify Code
                                            </button>
                                        </>
                                    )}
                                </div>

                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                            </motion.form>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;