import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { motion} from "framer-motion";


import * as THREE from 'three';

import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";


const SignUpPage = () => {
    const navigate = useNavigate();

    const canvasRef = useRef(null);

    const [useremail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUserName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const passwordValidations = {
        hasLength: password.length >= 8,
        hasCapital: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*]/.test(password),
    };

    useEffect(() => {
        const scene = new THREE.Scene();
        
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
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI displays
        
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        camera.rotation.z = Math.PI;

        const size = Math.max(window.innerWidth, window.innerHeight) * 4;
        const divisions = Math.floor(size / 50); // Maintain consistent grid size
        const gridHelper = new THREE.GridHelper(size, divisions, 0x67d7cc, 0x67d7cc);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.left = width / -2;
            camera.right = width / 2;
            camera.top = height / 2;
            camera.bottom = height / -2;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const newSize = Math.max(width, height) * 4;
            const scale = newSize / size;
            gridHelper.scale.set(scale, scale, scale);
        };

        window.addEventListener('resize', handleResize);


        return () => {
            window.removeEventListener('resize', handleResize);
            scene.remove(gridHelper);
            renderer.dispose();
            gridHelper.material.dispose();
        };
    }, []);

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

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
                navigate("/login"); 
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error("Error signing up:", error);
            setErrorMessage("Signup failed. Please try again.");
        }
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
                    ease: "easeInOut"
                }}
            >

                <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

                    <div className="text-center pb-4">
                        <Link to="/" className={`text-5xl font-bold`}>
                            Zukini
                        </Link>
                    </div>

                    <motion.form 
                        className="space-y-6"
                        onSubmit={handleSignUp}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                                            
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

                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                    {passwordValidations.hasLength ? (
                                        <CheckCircle className="text-green-500 mr-2" size={16} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={16} />
                                    )}
                                    <span>At least 8 characters</span>
                                </div>
                                <div className="flex items-center">
                                    {passwordValidations.hasCapital ? (
                                        <CheckCircle className="text-green-500 mr-2" size={16} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={16} />
                                    )}
                                    <span>One uppercase letter</span>
                                </div>
                                <div className="flex items-center">
                                    {passwordValidations.hasNumber ? (
                                        <CheckCircle className="text-green-500 mr-2" size={16} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={16} />
                                    )}
                                    <span>One number</span>
                                </div>
                                <div className="flex items-center">
                                    {passwordValidations.hasSpecial ? (
                                        <CheckCircle className="text-green-500 mr-2" size={16} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={16} />
                                    )}
                                    <span>One special character (!@#$...)</span>
                                </div>
                            </div>

                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password again" 
                                    required 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
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

                        <div className="flex justify-between">
                            <button 
                                className="w-full bg-indigo-600 hover:cursor-pointer text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                                type="submit"
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <Link
                                to="/"
                                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 duration-250 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Go Home
                            </Link>

                            <Link
                                to="/login"
                                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 duration-250 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Log in
                            </Link>
                        </div>
                    </motion.form>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUpPage;
