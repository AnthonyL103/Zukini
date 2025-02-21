import { useState, useEffect, useRef } from "react";

import { useUser } from '../authentication/UserContext';

import { Link, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

/* ++++++++++ BACKGROUND ++++++++++ */
import * as THREE from 'three';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setUserId, setEmail, setName, userId, name, email, setisforgot} = useUser();
    const [useremail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [countdown, setCountdown] = useState(300);
    const [timerActive, setTimerActive] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    /* ++++++++++ BACKGROUND ++++++++++ */
    const canvasRef = useRef(null);

    /* ++++++++++ BACKGROUND ++++++++++ */
    useEffect(() => {
        const scene = new THREE.Scene();
        
        // Create camera with initial viewport dimensions
        const camera = new THREE.OrthographicCamera(
          window.innerWidth / -2,
          window.innerWidth / 2, 
          window.innerHeight / 2,
          window.innerHeight / -2,
          1,
          1000
        );
        
        const renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current,
          alpha: true,
          antialias: true 
        });
        
        // Set initial size
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Camera position for top-down view
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.rotation.z = Math.PI;
    
        // Create grid that's larger than screen
        const size = Math.max(window.innerWidth, window.innerHeight) * 4;
        const divisions = Math.floor(size / 50);
        const gridHelper = new THREE.GridHelper(size, divisions, 0x67d7cc, 0x67d7cc);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
    
        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
    
        // Resize handler
        const handleResize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
    
          // Camera
          camera.left = width / -2;
          camera.right = width / 2;
          camera.top = height / 2;
          camera.bottom = height / -2;
          camera.updateProjectionMatrix();
    
          // Renderer
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
          // Update grid scale based on new viewport size
          const newSize = Math.max(width, height) * 4;
          const scale = newSize / size;
          gridHelper.scale.set(scale, scale, scale);
        };
    
        window.addEventListener('resize', handleResize);
    
        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          scene.remove(gridHelper);
          renderer.dispose();
          gridHelper.material.dispose();
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
                navigate("/account");
                alert("Login successful!");
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
                body: JSON.stringify({ email }),  // Use email for login
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
        <div className="min-h-screen relative">
            <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ 
                background: 'linear-gradient(to bottom, #0f0647, #67d7cc)',
                zIndex: 0 
            }}
            />
            
            <motion.div 
                className="relative z-10 min-h-screen flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                    duration: 0.25, 
                    ease: "easeInOut",
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

                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    />
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
