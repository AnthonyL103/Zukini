import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useScan } from '../scans/ScanContext';
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
        <div className="account-wrapper">
            {userId && !isGuestUser? (
                <button className="logoutbutton" onClick={handleLogout}>
                    Log Out
                    <div className="arrow-wrapper">
                        <div className="arrow"></div>
                    </div>
                </button>
            ) : (
                <>
                    <button className="signupbutton" onClick={handleSignUp}>Sign Up 
                        <div className="arrow-wrapper">
                            <div className="arrow"></div>
                        </div>
                    </button>
                    <button className="loginbutton" onClick={handleLogIn}>Log in 
                        <div className="arrow-wrapper">
                            <div className="arrow"></div>
                        </div>
                    </button>
                </>
            )}

            {/* Login Modal */}
            <div className={`loginmodal-container ${showLoginModal ? "show" : ""}`}>
                {showLoginModal && (
                    <form className="loginform" onSubmit={handleLoggedIn}>
                        <p className="loginform-title">Sign in to your account</p>
                        <div className="logininput-container">
                            <input type="email" placeholder="Enter email" required onChange={(e) => setUserEmail(e.target.value)} />
                        </div>
                        <div className="logininput-container">
                            <input type="password" placeholder="Enter password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <div className="authbuttonlogin-wrapper">
                            <button
                            className="login-buttonclose"
                            onClick={handleclose}
                            >
                            Close
                            </button>
                            <button
                            className="login-buttonsignin"
                            onClick={handleLogIn}
                            >
                            Login
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Signup Modal */}
            <div className={`loginmodal-container ${showSignUpModal ? "show" : ""}`}>
                {showSignUpModal && (
                    <form className="signupform" onSubmit={closeSignUpModal}>
                        <p className="signupform-title">Create an account</p>
                        <div className="signupinput-container">
                            <input type="text" placeholder="Enter email" required onChange={(e) => setUserEmail(e.target.value)} />
                        </div>
                        <div className="signupinput-container">
                            <input type="password" placeholder="Enter password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="signupinput-container">
                            <input type="password" placeholder="Enter password again" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <div className="authbuttonlogin-wrapper">
                            <button
                            className="login-buttonclose"
                            onClick={handleclose}
                            >
                            Close
                            </button>
                            <button
                            className="login-buttonsignin"
                            onClick={handleSignUp}
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
