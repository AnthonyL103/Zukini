import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useScan } from './ScanContext';
import { v4 as uuidv4 } from 'uuid';


const Authentication = () => {
    const { setCurrentScan } = useScan();
    const { userId, setUserId, setEmail, setTotalScans, setTotalFlashcards, setTotalMockTests} = useUser();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [useremail, setUserEmail] = useState("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedEmail = localStorage.getItem("email");

        if (storedUserId) setUserId(storedUserId);
        if (storedEmail) setEmail(storedEmail);
    }, []);
    
    const handleSignUp = () => {
        setShowSignUpModal(true);
        setErrorMessage("");
    };

    const handleLogIn = () => {
        setShowLoginModal(true);
        setErrorMessage("");
    };

    const handleLoggedIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://18.236.227.203:5006/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: useremail,
                    Password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUserId(data.userId);
                setEmail(data.email);
                console.log(data.email);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("email", data.email);
                setShowLoginModal(false);
            } else {
                setErrorMessage("Login failed, invalid credentials");
                return;
            }
        } catch (error) {
            console.log("Error logging in:", error);
        }

        setErrorMessage("");
        setUserEmail("");
        setPassword("");
    };

    const handleLogout = () => {
        setCurrentScan(null);
        localStorage.removeItem('currentScan');
        const newGuestId = `guest-${uuidv4()}`;
        sessionStorage.setItem("guestUserId", newGuestId); // Store in session storage
        setUserId(newGuestId); // Assign new guest ID instead of null
        setEmail(null);
        setTotalScans(0);
        setTotalFlashcards(0);
        setTotalMockTests(0);
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
    };
    
    const handleclose = (e) => {
        e.preventDefault(); // Prevent form validation from triggering
        setShowLoginModal(false);
        setShowSignUpModal(false);
        setErrorMessage("");
        setUserEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    const closeSignUpModal = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        //regular expression that defines a string that as at least one of those symbols digits and over 8 characters long
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    
        if (!passwordRegex.test(password)) {
            setErrorMessage("Password must be at least 8 characters long and include at least one number and one special character.");
            return;
        }

        try {
            const response = await fetch("http://18.236.227.203:5006/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: useremail,
                    Password: password,
                }),
            });

            const data = await response.json();
            console.log(data);
            if (data.success) {
                setShowSignUpModal(false);
            } else {
                console.log("not success");
                setErrorMessage(data.message);
                return
            }
        } catch (error) {
            console.log("Error signing up:", error);
        }

        setErrorMessage("");
        setUserEmail("");
        setPassword("");
        setConfirmPassword("");
        alert("Account created successfully!");
    };
    
    const isGuestUser = userId && typeof userId === "string" && userId.startsWith("guest-");

    return (
        <div className="flex flex-col gap-[3vw] mt-auto">
            {userId && !isGuestUser ? (
                <button 
                    onClick={handleLogout}
                    className="h-[7dvh] rounded-2xl border-0 px-7 py-4 bg-black text-white font-bold flex items-center gap-6 transition-all duration-200 hover:bg-primary-hover hover:text-black"
                >
                    Log Out
                    <div className="flex justify-center items-center">
                        <div className="w-[10px] h-[2px] bg-current relative transition-all duration-200"></div>
                    </div>
                </button>
            ) : (
                <>
                    <button 
                        onClick={handleSignUp}
                        className="h-[7dvh] rounded-2xl border-0 px-7 py-4 bg-black text-white font-bold flex items-center gap-6 transition-all duration-200 hover:bg-primary-hover hover:text-black"
                    >
                        Sign Up
                        <div className="flex justify-center items-center">
                            <div className="w-[10px] h-[2px] bg-current relative transition-all duration-200"></div>
                        </div>
                    </button>
                    <button 
                        onClick={handleLogIn}
                        className="h-[7dvh] rounded-2xl border-0 px-7 py-4 bg-black text-white font-bold flex items-center gap-6 transition-all duration-200 hover:bg-primary-hover hover:text-black"
                    >
                        Log in
                        <div className="flex justify-center items-center">
                            <div className="w-[10px] h-[2px] bg-current relative transition-all duration-200"></div>
                        </div>
                    </button>
                </>
            )}
    
            {/* Login Modal */}
            <div className={`fixed inset-0 bg-black/30 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 ${showLoginModal ? "opacity-100 pointer-events-auto" : ""}`}>
                {showLoginModal && (
                    <form onSubmit={handleLoggedIn} className="bg-white w-[600px] max-w-full rounded-2xl shadow-md p-8 text-center">
                        <p className="text-xl font-semibold text-center text-black mb-4">Sign in to your account</p>
                        <div className="w-full mb-4">
                            <input 
                                type="email" 
                                placeholder="Enter email" 
                                required 
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-[85%] bg-white p-3 border-2 border-gray-300 rounded-2xl text-base text-gray-600 outline-none"
                            />
                        </div>
                        <div className="w-full mb-4">
                            <input 
                                type="password" 
                                placeholder="Enter password" 
                                required 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-[85%] bg-white p-3 border-2 border-gray-300 rounded-2xl text-base text-gray-600 outline-none"
                            />
                        </div>
                        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                        <div className="w-full h-auto flex items-center justify-between gap-5">
                            <button
                                onClick={handleclose}
                                className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleLogIn}
                                className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
    
            {/* Signup Modal */}
            <div className={`fixed inset-0 bg-black/30 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 ${showSignUpModal ? "opacity-100 pointer-events-auto" : ""}`}>
                {showSignUpModal && (
                    <form onSubmit={closeSignUpModal} className="bg-white w-[600px] max-w-full rounded-2xl shadow-md p-8 text-center">
                        <p className="text-xl font-semibold text-center text-black mb-4">Create an account</p>
                        <div className="w-full mb-4">
                            <input 
                                type="text" 
                                placeholder="Enter email" 
                                required 
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-[85%] bg-white p-3 border-2 border-gray-300 rounded-2xl text-base text-gray-600 outline-none"
                            />
                        </div>
                        <div className="w-full mb-4">
                            <input 
                                type="password" 
                                placeholder="Enter password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-[85%] bg-white p-3 border-2 border-gray-300 rounded-2xl text-base text-gray-600 outline-none"
                            />
                        </div>
                        <div className="w-full mb-4">
                            <input 
                                type="password" 
                                placeholder="Enter password again" 
                                required 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-[85%] bg-white p-3 border-2 border-gray-300 rounded-2xl text-base text-gray-600 outline-none"
                            />
                        </div>
                        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                        <div className="w-full h-auto flex items-center justify-between gap-5">
                            <button
                                onClick={handleclose}
                                className="w-[48%] border-none flex px-6 py-3 bg-danger text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSignUp}
                                className="w-[48%] border-none flex px-6 py-3 bg-black text-white justify-center text-sm font-bold uppercase rounded-2xl transition-all duration-600 hover:bg-primary-hover hover:text-black"
                            >
                                Sign-Up
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Authentication;
