import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useScan } from './ScanContext';

const Authentication = () => {
    const { currentScan, setCurrentScan } = useScan();
    const { userId, setUserId } = useUser();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }
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
                    Email: email,
                    Password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUserId(data.userId);
                localStorage.setItem("userId", data.userId);
                setShowLoginModal(false);
            } else {
                setErrorMessage("Login failed, invalid credentials");
                return;
            }
        } catch (error) {
            console.log("Error logging in:", error);
        }

        setErrorMessage("");
        setEmail("");
        setPassword("");
    };

    const handleLogout = () => {
        setCurrentScan(null);
        localStorage.removeItem('currentScan');
        setUserId(null);
        localStorage.removeItem("userId");
    };
    
    const handleclose = (e) => {
        e.preventDefault(); // Prevent form validation from triggering
        setShowSignUpModal(false);
        setErrorMessage("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    const closeSignUpModal = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("http://18.236.227.203:5006/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: email,
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
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        alert("Account created successfully!");
    };

    return (
        <div className="account-wrapper">
            {userId ? (
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
                            <input type="email" placeholder="Enter email" required onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="logininput-container">
                            <input type="password" placeholder="Enter password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <div className="authbuttonlogin-wrapper">
                            <button
                            className="authbuttonlogin-button close"
                            onClick={handleclose}
                            >
                            Close
                            </button>
                            <button
                            className="authbuttonlogin-button signin"
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
                            <input type="text" placeholder="Enter email" required onChange={(e) => setEmail(e.target.value)} />
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
                            className="authbuttonlogin-button close"
                            onClick={handleclose}
                            >
                            Close
                            </button>
                            <button
                            className="authbuttonlogin-button signin"
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
