import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    const navigate = useNavigate();

    // Define state variables
    const [useremail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUserName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Handle SignUp
    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        // Ensure strong password criteria
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage("Password must be at least 8 characters long and include at least one number and one special character.");
            return;
        }

        try {
            const response = await fetch("https://api.zukini.com/account/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: useremail, Password: password, Name: username }),
            });

            const data = await response.json();
            console.log(data);

            if (data.success) {
                alert("Account created successfully! Please check your email and click the verification link.");
                navigate("/login"); // ✅ Redirect to login page
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error signing up:", error);
            setErrorMessage("Signup failed. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
                <form className="space-y-6" onSubmit={handleSignUp}>
                    <h2 className="text-2xl font-semibold text-center text-gray-900">
                        Create an Account
                    </h2>

                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Enter name" 
                            required 
                            value={username} 
                            onChange={(e) => setUserName(e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />

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

                        <input 
                            type="password" 
                            placeholder="Enter password again" 
                            required 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                    </div>

                    {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                    <div className="flex justify-between text-sm text-indigo-500">
                        <button 
                            type="button" 
                            className="hover:underline"
                            onClick={() => navigate("/login")}
                        >
                            Have an account? Log in
                        </button>
                    </div>

                    <div className="flex justify-between">
                        <button 
                            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                            type="submit"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
