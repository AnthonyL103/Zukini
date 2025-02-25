import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoPlayer from "../utils/demovid";


const HomePage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / (window.innerHeight / 1.42),
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight / 1.42);
    camera.position.z = 5;

    // Add grid helper
    const size = 20;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x67d7cc, 0x67d7cc);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add floating math symbols with better distribution
    const mathSymbols = ['π', '∑', '∫', '√', '∞', 'θ', 'Δ', '±', 'φ', 'λ', 'μ', 'σ', '∏', '∂'];
    const symbolInstances = 5;
    const mathObjects = [];

    // Create a function to generate a random position within a sphere
    const getRandomSpherePosition = (radius) => {
      const phi = Math.random() * Math.PI * 2; // Random angle around Y axis
      const costheta = Math.random() * 2 - 1; // Random height
      const theta = Math.acos(costheta); // Convert to angle

      return {
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta)
      };
    };

    mathSymbols.forEach((symbol) => {
      for (let i = 0; i < symbolInstances; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;

        // Draw symbol on canvas with varying colors
        const hue = Math.random() * 180 + 160; // Range from cyan to blue
        context.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
        context.font = '80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(symbol, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.7
        });

        const sprite = new THREE.Sprite(material);

        // Position within a sphere
        const radius = 8;
        const pos = getRandomSpherePosition(radius);
        sprite.position.set(pos.x, pos.y, pos.z);

        // Randomize scale for depth effect
        const scale = 1 + Math.random() * 0.4;
        sprite.scale.set(scale, scale, scale);

        // Enhanced animation parameters
        sprite.userData = {
          phaseOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.2 + Math.random() * 0.3,
          rotationSpeed: 0.1 + Math.random() * 0.2,
          orbitRadius: Math.random() * 2 + 3,
          orbitSpeed: 0.1 + Math.random() * 0.2,
          initialPosition: { ...pos }
        };

        mathObjects.push(sprite);
        scene.add(sprite);
      }
    });

    // Create geometric lines
    const lines = [];
    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.BufferGeometry();
      const points = [];

      points.push(
        new THREE.Vector3(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          Math.random() * 10 - 5
        )
      );
      points.push(
        new THREE.Vector3(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          Math.random() * 10 - 5
        )
      );

      geometry.setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x67d7cc,
        transparent: true,
        opacity: 0.3
      });

      const line = new THREE.Line(geometry, material);
      line.userData.rotationSpeedX = (Math.random() - 0.5) * 0.002;
      line.userData.rotationSpeedY = (Math.random() - 0.5) * 0.002;
      lines.push(line);
      scene.add(line);
    }

    // Enhanced animation loop
    let lastTime = 0;
    const animate = (currentTime) => {
      requestAnimationFrame(animate);

      const time = currentTime * 0.001;
      const deltaTime = lastTime === 0 ? 0 : time - lastTime;
      lastTime = time;

      // Update lines
      lines.forEach((line) => {
        line.rotation.x += line.userData.rotationSpeedX;
        line.rotation.y += line.userData.rotationSpeedY;
      });

      // Update math symbols with complex motion
      mathObjects.forEach((sprite) => {
        const userData = sprite.userData;

        // Orbital motion
        const orbitAngle = time * userData.orbitSpeed + userData.phaseOffset;
        const newX = userData.initialPosition.x + Math.cos(orbitAngle) * userData.orbitRadius;
        const newZ = userData.initialPosition.z + Math.sin(orbitAngle) * userData.orbitRadius;

        // Vertical floating motion
        const floatOffset = Math.sin((time + userData.phaseOffset) * userData.floatSpeed) * 0.5;

        sprite.position.set(
          newX,
          userData.initialPosition.y + floatOffset,
          newZ
        );

        // Gentle rotation
        sprite.rotation.z += userData.rotationSpeed * deltaTime;
      });

      // Smooth grid rotation
      gridHelper.rotation.x = Math.sin(time * 0.1) * 0.1;
      gridHelper.rotation.y = Math.cos(time * 0.15) * 0.1;

      renderer.render(scene, camera);
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / (window.innerHeight / 1.42);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight / 1.42);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      lines.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      mathObjects.forEach((sprite) => {
        sprite.material.map.dispose();
        sprite.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  // Motion variants for animations
  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 0px 8px rgb(103, 215, 204)' },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={pageVariants}
    >
      <div className="h-[70vh] bg-primary relative mb-3 pt-16">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'linear-gradient(to bottom, #0f0647, #67d7cc)' }}
        />
        <div className="absolute inset-x-0 -bottom-3 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>

      <motion.div
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 max-w-4xl w-full px-4"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.div
          className="backdrop-blur-sm bg-white/20 rounded-2xl shadow-lg p-8 mb-8"
          variants={sectionVariants}
        >
          <motion.h1
            className="text-4xl font-bold text-center mb-4 text-[#0f0647]"
            variants={sectionVariants}
          >
            AI Study Buddy
          </motion.h1>
          <motion.p
            className="text-lg text-center text-[#f0f0f0] mb-4"
            variants={sectionVariants}
          >
            Transform your study materials into interactive learning experiences.
            Upload your notes and let our AI create personalized flashcards and mock tests to enhance your learning journey.
          </motion.p>
        </motion.div>

        {/* Ready to Start Section */}
        <motion.section
          className="backdrop-blur-md bg-white/20 rounded-2xl shadow-xl p-10 text-center my-8"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.h2
            className="text-3xl font-semibold text-[#0f0647] mb-6"
            variants={sectionVariants}
          >
            Ready to Start?
          </motion.h2>
          <motion.button
            onClick={() => navigate('/create')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-10 py-4 bg-primary text-white rounded-xl transition transform hover:cursor-pointer"
          >
            Upload Your Notes
          </motion.button>
        </motion.section>

        {/* How to Start Section */}
        <motion.section
          className="py-16 bg-gradient-to-b from-white to-gray-50"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.h2
            className="text-4xl font-bold text-center mb-16 text-[#0f0647]"
            variants={sectionVariants}
          >
            How to Start
          </motion.h2>

          <div className="max-w-6xl mx-auto px-4">
            {/* Video Placeholder */}
            <VideoPlayer />

            {/* Quick Steps */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-24"
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              {[
                {
                  step: 1,
                  title: 'Upload Notes',
                  description: 'Upload your study materials in PDF or image format',
                  color: 'from-blue-500 to-cyan-400'
                },
                {
                  step: 2,
                  title: 'Choose Format',
                  description: 'Select between flashcards, practice tests, or summary notes',
                  color: 'from-cyan-400 to-teal-400'
                },
                {
                  step: 3,
                  title: 'Start Learning',
                  description: 'Begin studying with your personalized materials',
                  color: 'from-teal-400 to-emerald-400'
                }
              ].map((item, index, array) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center relative group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.2 } }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform transform group-hover:scale-110 group-hover:rotate-3`}>
                    <span className="text-white font-bold text-2xl">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>

                  {/* Arrows between steps */}
                  {index < array.length - 1 && (
                    <>
                      {/* Desktop Arrow */}
                      <div className="hidden md:block absolute top-8 -right-6 w-12 transform translate-x-full">
                        <svg className="w-full h-6 text-primary/30" fill="none" viewBox="0 0 24 8">
                          <path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      {/* Mobile Arrow */}
                      <div className="md:hidden absolute -bottom-15 left-1/2 transform -translate-x-1/2 rotate-90">
                        <svg className="w-12 h-6 text-primary/30" fill="none" viewBox="0 0 24 8">
                          <path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </>
                  )}
                </motion.div>
                
              ))}
            </motion.div>
            <motion.section
        className="backdrop-blur-md bg-white/20 rounded-2xl shadow-xl p-10 text-center my-8 max-w-3xl mx-auto"
      >
        <motion.h2 className="text-3xl font-semibold text-[#0f0647] mb-6">
          Contact
            </motion.h2>
            <div className="flex flex-col items-center">
            <div className="w-32 h-32 overflow-hidden rounded-full shadow-lg mb-4">
            <img
              src="/AnthonyPhoto.png"
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>
            <p className="text-lg text-gray-800 max-w-lg">
                Hi, I'm Anthony Li! I'm a passionate software engineer interested in solving 
                real world problems with Full Stack development, AI, and Cloud computing. I built Zukini to help my friends
                and I make better use of our notes at school. If you have any feedback for me feel free to reach out!
            </p>
            <a
                href="mailto:anthonyli0330@gmail.com"
                className="mt-4 text-primary underline text-lg hover:text-primary-dark"
            >
                Contact Me
            </a>
            </div>
        </motion.section>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
