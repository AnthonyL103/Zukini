import { useState, useEffect } from "react";
import { useUser } from '../authentication/UserContext';

import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const { setUserId, setEmail, setName, userId, name, email} = useUser();
    const [useremail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [countdown, setCountdown] = useState(300);
    const [timerActive, setTimerActive] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
                {!showForgotPassword ? (
                    <form className="space-y-6" onSubmit={async (e) => await handleLoggedIn(e)}>
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
                                className="hover:underline"
                                onClick={() => setShowForgotPassword(true)}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="flex justify-between">
                            <button 
                                className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                type="submit"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="space-y-6" onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}>
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
                                        className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
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
                                        className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                        type="submit"
                                    >
                                        Verify Code
                                    </button>
                                </>
                            )}
                        </div>

                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
